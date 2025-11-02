// src/utils/fast-hash.ts - 图片哈希
import crypto from 'crypto';

// 使用 MD5 哈希
export function fastHashSync(buffer: Buffer): string {
  return crypto.createHash('md5').update(buffer).digest('hex');
}

// 异步版本
export async function fastHash(buffer: Buffer): Promise<string> {
  return fastHashSync(buffer);
}

