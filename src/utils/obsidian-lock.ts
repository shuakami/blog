// src/utils/obsidian-lock.ts - Redis 分布式锁
import redis from '@/lib/redis';

const LOCK_KEY = 'obsidian:update:lock';
const LOCK_TIMEOUT = 30000; // 30 秒超时

/**
 * 获取分布式锁
 * @returns 成功返回 lock ID，失败返回 null
 */
export async function acquireLock(): Promise<string | null> {
  const lockId = `${Date.now()}_${Math.random()}`;
  
  try {
    // 使用 SET NX EX 实现分布式锁
    const result = await redis.set(
      LOCK_KEY,
      lockId,
      'PX', // 毫秒
      LOCK_TIMEOUT,
      'NX' // 仅当 key 不存在时设置
    );
    
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

/**
 * 释放分布式锁
 */
export async function releaseLock(lockId: string): Promise<void> {
  try {
    // 只有持有锁的进程才能释放（防止误删）
    const currentLockId = await redis.get(LOCK_KEY);
    
    if (currentLockId === lockId) {
      await redis.del(LOCK_KEY);
      console.log(`[Lock] Released lock: ${lockId}`);
    } else {
      console.warn(`[Lock] Cannot release lock: ${lockId} (current: ${currentLockId})`);
    }
  } catch (error) {
    console.error('[Lock] Error releasing lock:', error);
  }
}

/**
 * 使用分布式锁执行函数（自动获取和释放）
 */
export async function withLock<T>(
  fn: () => Promise<T>,
  maxRetries = 3,
  retryDelay = 1000
): Promise<T> {
  for (let i = 0; i < maxRetries; i++) {
    const lockId = await acquireLock();
    
    if (lockId) {
      try {
        const result = await fn();
        return result;
      } finally {
        await releaseLock(lockId);
      }
    }
    
    // 未获取到锁，等待后重试
    if (i < maxRetries - 1) {
      console.log(`[Lock] Retry ${i + 1}/${maxRetries} after ${retryDelay}ms`);
      await new Promise(resolve => setTimeout(resolve, retryDelay));
    }
  }
  
  throw new Error(`Failed to acquire lock after ${maxRetries} retries`);
}

