// src/lib/redis.ts
import Redis from 'ioredis';
import type { BlogPost } from '@/types/post';

declare global {
  // eslint-disable-next-line no-var
  var __REDIS_CLIENT__: Redis | undefined;
}

const redis =
  global.__REDIS_CLIENT__ ??
  new Redis(process.env.REDIS_URL!, {
    connectTimeout: 5000,
    maxRetriesPerRequest: 3,
    retryStrategy: (times) => {
      if (times > 3) return null;
      return Math.min(times * 50, 2000);
    },
    enableAutoPipelining: true,
  });

if (process.env.NODE_ENV !== 'production') {
  global.__REDIS_CLIENT__ = redis;
}

export interface ObsidianIndex {
  posts: Array<{
    slug: string;
    title: string;
    date: string;
    category: string;
    excerpt: string;
    tags?: string[];
  }>;
  generated: string;
}

export async function getObsidianIndex(): Promise<ObsidianIndex | null> {
  try {
    const data = await redis.get('obsidian:index');
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.error('Error getting Obsidian index:', error);
    return null;
  }
}

export async function setObsidianIndex(index: ObsidianIndex): Promise<void> {
  try {
    await redis.set('obsidian:index', JSON.stringify(index));
  } catch (error) {
    console.error('Error setting Obsidian index:', error);
    throw error;
  }
}

export async function getObsidianPost(slug: string): Promise<BlogPost | null> {
  try {
    const data = await redis.get(`obsidian:post:${slug}`);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.error(`Error getting Obsidian post ${slug}:`, error);
    return null;
  }
}

export async function setObsidianPost(slug: string, post: BlogPost): Promise<void> {
  try {
    await redis.set(`obsidian:post:${slug}`, JSON.stringify(post));
  } catch (error) {
    console.error(`Error setting Obsidian post ${slug}:`, error);
    throw error;
  }
}

export async function setObsidianPostsBulk(entries: Array<{ slug: string; post: BlogPost }>): Promise<void> {
  if (!entries.length) return;
  const pipeline = redis.pipeline();
  for (const { slug, post } of entries) {
    pipeline.set(`obsidian:post:${slug}`, JSON.stringify(post));
  }
  try {
    await pipeline.exec();
  } catch (error) {
    console.error('Error setting Obsidian posts bulk:', error);
    await Promise.all(entries.map(({ slug, post }) => setObsidianPost(slug, post)));
  }
}

export async function deleteObsidianPost(slug: string): Promise<void> {
  try {
    await redis.del(`obsidian:post:${slug}`);
  } catch (error) {
    console.error(`Error deleting Obsidian post ${slug}:`, error);
    throw error;
  }
}

export interface ImageTask {
  slug: string;
  timestamp: number;
}

export async function pushImageTask(task: ImageTask): Promise<void> {
  try {
    await redis.rpush('obsidian:image:queue', JSON.stringify(task));
  } catch (error) {
    console.error('Error pushing image task:', error);
    throw error;
  }
}

export async function popImageTask(): Promise<ImageTask | null> {
  try {
    const data = await redis.lpop('obsidian:image:queue');
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.error('Error popping image task:', error);
    return null;
  }
}

export async function getImageQueueLength(): Promise<number> {
  try {
    return await redis.llen('obsidian:image:queue');
  } catch (error) {
    console.error('Error getting image queue length:', error);
    return 0;
  }
}

export default redis;
