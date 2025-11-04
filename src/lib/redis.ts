// src/lib/redis.ts
import Redis from 'ioredis';
import type { BlogPost } from '@/types/post';

// 全局 Redis 实例（避免重复连接）
declare global {
  // eslint-disable-next-line no-var
  var __REDIS_CLIENT__: Redis | undefined;
}

const redis =
  global.__REDIS_CLIENT__ ??
  new Redis(process.env.REDIS_URL!, {
    maxRetriesPerRequest: 3,
    retryStrategy: (times) => {
      if (times > 3) return null;
      return Math.min(times * 50, 2000);
    },
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

// 获取 Obsidian 索引
export async function getObsidianIndex(): Promise<ObsidianIndex | null> {
  try {
    const data = await redis.get('obsidian:index');
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.error('Error getting Obsidian index:', error);
    return null;
  }
}

// 设置 Obsidian 索引
export async function setObsidianIndex(index: ObsidianIndex): Promise<void> {
  try {
    await redis.set('obsidian:index', JSON.stringify(index));
  } catch (error) {
    console.error('Error setting Obsidian index:', error);
    throw error;
  }
}

// 获取单篇文章
export async function getObsidianPost(slug: string): Promise<BlogPost | null> {
  try {
    const data = await redis.get(`obsidian:post:${slug}`);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.error(`Error getting Obsidian post ${slug}:`, error);
    return null;
  }
}

// 设置单篇文章
export async function setObsidianPost(slug: string, post: BlogPost): Promise<void> {
  try {
    await redis.set(`obsidian:post:${slug}`, JSON.stringify(post));
  } catch (error) {
    console.error(`Error setting Obsidian post ${slug}:`, error);
    throw error;
  }
}

// 删除单篇文章
export async function deleteObsidianPost(slug: string): Promise<void> {
  try {
    await redis.del(`obsidian:post:${slug}`);
  } catch (error) {
    console.error(`Error deleting Obsidian post ${slug}:`, error);
    throw error;
  }
}

// 图片处理队列

export interface ImageTask {
  slug: string;
  timestamp: number;
}

// 推入图片任务到队列
export async function pushImageTask(task: ImageTask): Promise<void> {
  try {
    await redis.rpush('obsidian:image:queue', JSON.stringify(task));
  } catch (error) {
    console.error('Error pushing image task:', error);
    throw error;
  }
}

// 从队列弹出图片任务
export async function popImageTask(): Promise<ImageTask | null> {
  try {
    const data = await redis.lpop('obsidian:image:queue');
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.error('Error popping image task:', error);
    return null;
  }
}

// 获取队列长度
export async function getImageQueueLength(): Promise<number> {
  try {
    return await redis.llen('obsidian:image:queue');
  } catch (error) {
    console.error('Error getting image queue length:', error);
    return 0;
  }
}

export default redis;

