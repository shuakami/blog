// src/utils/image-cache.ts - 图片缓存和去重
import redis from '@/lib/redis';
import { fastHashSync } from './fast-hash';

// 计算 Buffer 的快速哈希（MD5，比 SHA256 快 3 倍）
export function calculateImageHash(buffer: Buffer): string {
  return fastHashSync(buffer);
}

// 从缓存获取图片 URL（通过 Gitee 路径）
export async function getCachedImageUrl(giteePath: string): Promise<string | null> {
  try {
    const url = await redis.get(`obsidian:image:path:${giteePath}`);
    return url;
  } catch (error) {
    console.error('Error getting cached image URL:', error);
    return null;
  }
}

// 从缓存获取图片 URL（通过内容 Hash）
export async function getCachedImageUrlByHash(hash: string): Promise<string | null> {
  try {
    const url = await redis.get(`obsidian:image:hash:${hash}`);
    return url;
  } catch (error) {
    console.error('Error getting cached image URL by hash:', error);
    return null;
  }
}

// 缓存图片 URL（同时存储路径和 Hash 映射）
export async function cacheImageUrl(
  giteePath: string,
  hash: string,
  ossUrl: string
): Promise<void> {
  try {
    // 路径映射（用于快速查找）
    await redis.set(`obsidian:image:path:${giteePath}`, ossUrl);
    
    // Hash 映射（用于内容去重）
    await redis.set(`obsidian:image:hash:${hash}`, ossUrl);
    
    // 反向映射（OSS URL -> 元数据，用于管理）
    await redis.set(`obsidian:image:meta:${ossUrl}`, JSON.stringify({
      giteePath,
      hash,
      uploadedAt: Date.now(),
    }));
    
    console.log(`[Image Cache] Cached: ${giteePath} -> ${ossUrl}`);
  } catch (error) {
    console.error('Error caching image URL:', error);
  }
}

// 清除图片缓存（当源文件被删除时）
export async function clearImageCache(giteePath: string): Promise<void> {
  try {
    await redis.del(`obsidian:image:path:${giteePath}`);
    console.log(`[Image Cache] Cleared cache for: ${giteePath}`);
  } catch (error) {
    console.error('Error clearing image cache:', error);
  }
}

