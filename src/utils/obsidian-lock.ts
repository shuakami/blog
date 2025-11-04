// src/utils/obsidian-lock.ts
import redis from '@/lib/redis';

const LOCK_KEY = 'obsidian:update:lock';
const LOCK_TIMEOUT = 30_000;

const LUA_RELEASE = `
if redis.call("get", KEYS[1]) == ARGV[1] then
  return redis.call("del", KEYS[1])
else
  return 0
end
`;

const LUA_RENEW = `
if redis.call("get", KEYS[1]) == ARGV[1] then
  return redis.call("pexpire", KEYS[1], ARGV[2])
else
  return 0
end
`;

export async function acquireLock(): Promise<string | null> {
  const lockId = `${Date.now()}_${Math.random()}`;
  try {
    const result = await (redis as any).set(LOCK_KEY, lockId, 'PX', LOCK_TIMEOUT, 'NX');
    if (result === 'OK') {
      console.log(`[Lock] Acquired lock: ${lockId}`);
      return lockId;
    }
    console.warn('[Lock] Failed to acquire lock (already locked)');
    return null;
  } catch (error) {
    console.error('[Lock] Error acquiring lock:', error);
    return null;
  }
}

export async function releaseLock(lockId: string): Promise<void> {
  try {
    await (redis as any).eval(LUA_RELEASE, 1, LOCK_KEY, lockId);
    console.log(`[Lock] Released lock: ${lockId}`);
  } catch (error) {
    console.error('[Lock] Error releasing lock:', error);
  }
}

async function renewLock(lockId: string): Promise<boolean> {
  try {
    const res = await (redis as any).eval(LUA_RENEW, 1, LOCK_KEY, lockId, String(LOCK_TIMEOUT));
    return res === 1;
  } catch (error) {
    console.error('[Lock] Error renewing lock:', error);
    return false;
  }
}

export async function withLock<T>(
  fn: () => Promise<T>,
  maxRetries = 3,
  retryDelay = 1000
): Promise<T> {
  for (let i = 0; i < maxRetries; i++) {
    const lockId = await acquireLock();

    if (lockId) {
      const intervalMs = Math.max(3_000, Math.floor(LOCK_TIMEOUT / 3));
      let alive = true;
      const timer = setInterval(async () => {
        if (!alive) return;
        const ok = await renewLock(lockId);
        if (!ok) {
          console.warn('[Lock] Renew failed, lock might be lost early.');
        }
      }, intervalMs);
      timer.unref?.();

      try {
        const result = await fn();
        return result;
      } finally {
        alive = false;
        clearInterval(timer);
        await releaseLock(lockId);
      }
    }

    if (i < maxRetries - 1) {
      const jitter = Math.floor(Math.random() * 200);
      const delay = retryDelay * Math.pow(2, i) + jitter;
      console.log(`[Lock] Retry ${i + 1}/${maxRetries} after ${delay}ms`);
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }

  throw new Error(`Failed to acquire lock after ${maxRetries} retries`);
}
