// src/utils/fast-hash.ts - 超快速哈希
import crypto from 'crypto';

// 使用纯 JS 的 xxhash
let XXHash: any;
try {
  // 纯 JS 实现，无需异步初始化
  XXHash = require('xxhash');
} catch {
  // 如果未安装，使用 MD5 降级
  XXHash = null;
}

// 同步快速哈希
export function fastHashSync(buffer: Buffer): string {
  if (XXHash) {
    try {
      // xxhash64 - 最快的哈希算法之一（纯 JS，同步）
      return XXHash.hash64(buffer, 0).toString(16);
    } catch (error) {
      console.warn('[Hash] xxhash failed, falling back to MD5');
    }
  }
  
  // 降级到 MD5
  return crypto.createHash('md5').update(buffer).digest('hex');
}

// 异步版本
export async function fastHash(buffer: Buffer): Promise<string> {
  return fastHashSync(buffer);
}

