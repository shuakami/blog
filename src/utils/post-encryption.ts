// src/utils/post-encryption.ts
import { createHash, timingSafeEqual } from 'crypto';

const secret = process.env.POST_ENCRYPTION_SECRET || '';

function normalizePassword(password: string): string {
  return password.trim();
}

export function hashPostPassword(slug: string, password: string): string {
  const normalized = normalizePassword(password);
  return createHash('sha256').update(`${slug}:${normalized}:${secret}`).digest('hex');
}

export function verifyPostPassword(
  slug: string,
  password: string,
  expectedHash: string
): boolean {
  if (!password || !expectedHash) return false;

  try {
    const candidateHash = hashPostPassword(slug, password);
    const expectedBuffer = Buffer.from(expectedHash, 'hex');
    const candidateBuffer = Buffer.from(candidateHash, 'hex');
    if (expectedBuffer.length !== candidateBuffer.length) {
      return false;
    }
    return timingSafeEqual(expectedBuffer, candidateBuffer);
  } catch {
    return false;
  }
}

