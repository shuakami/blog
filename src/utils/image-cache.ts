// src/utils/image-cache.ts
import redis from '@/lib/redis';
import { fastHashSync } from './fast-hash';

export function calculateImageHash(buffer: Buffer): string {
  return fastHashSync(buffer);
}

export async function getCachedImageUrl(giteePath: string): Promise<string | null> {
  try {
    const url = await redis.get(`obsidian:image:path:${giteePath}`);
    return url;
  } catch (error) {
    console.error('Error getting cached image URL:', error);
    return null;
  }
}

export async function getCachedImageUrlByHash(hash: string): Promise<string | null> {
  try {
    const url = await redis.get(`obsidian:image:hash:${hash}`);
    return url;
  } catch (error) {
    console.error('Error getting cached image URL by hash:', error);
    return null;
  }
}

export async function cacheImageUrl(
  giteePath: string,
  hash: string,
  ossUrl: string
): Promise<void> {
  try {
    const pipeline = redis.pipeline();
    pipeline.set(`obsidian:image:path:${giteePath}`, ossUrl);
    pipeline.set(`obsidian:image:hash:${hash}`, ossUrl);
    pipeline.set(
      `obsidian:image:meta:${ossUrl}`,
      JSON.stringify({
      giteePath,
      hash,
      uploadedAt: Date.now(),
      })
    );
    await pipeline.exec();
  } catch (error) {
    console.error('Error caching image URL:', error);
  }
}

export async function clearImageCache(giteePath: string): Promise<void> {
  try {
    await redis.del(`obsidian:image:path:${giteePath}`);
    console.log(`[Image Cache] Cleared cache for: ${giteePath}`);
  } catch (error) {
    console.error('Error clearing image cache:', error);
  }
}
