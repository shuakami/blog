// src/utils/posts.ts - Obsidian/Redis 数据源
import { cache } from 'react';
import type { BlogPost, ArchivePost } from '@/types/post';
import { getObsidianIndex, getObsidianPost } from '@/lib/redis';

const PER_PAGE = 10 as const; // 每页文章数

type ListPostBase = Pick<
  BlogPost,
  'slug' | 'title' | 'date' | 'excerpt' | 'tags' | 'coverImage' | 'author' | 'category'
> & { content: string; wordCount?: number; source?: string };

/**
 * 获取博客文章列表（从 Redis/Obsidian）
 */
export const getBlogPosts = cache(async (page = 1) => {
  const obsidianIndex = await getObsidianIndex();
  
  if (!obsidianIndex || obsidianIndex.posts.length === 0) {
    return {
      posts: [] as BlogPost[],
      total: 0,
      hasMore: false,
    };
  }

  // 按日期排序
  const sorted = [...obsidianIndex.posts].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  // 分页
  const start = (page - 1) * PER_PAGE;
  const end = start + PER_PAGE;
  const paginatedPosts = sorted.slice(start, end);

  // 转换格式
  const mapped: ListPostBase[] = paginatedPosts.map((p) => ({
    slug: p.slug,
    title: p.title ?? 'Untitled',
    date: new Date(p.date).toISOString(),
    excerpt: p.excerpt ?? '',
    tags: [],
    category: p.category,
    coverImage: null,
    author: 'Shuakami',
    content: '',
    source: 'obsidian',
  }));

  return {
    posts: mapped as unknown as BlogPost[],
    total: sorted.length,
    hasMore: end < sorted.length,
  };
});

/**
 * 获取归档文章列表（从 Redis/Obsidian）
 */
export const getArchivePosts = cache(async (page = 1) => {
  const obsidianIndex = await getObsidianIndex();
  
  if (!obsidianIndex || obsidianIndex.posts.length === 0) {
    return {
      posts: [] as ArchivePost[],
      total: 0,
      hasMore: false,
    };
  }

  // 按日期排序
  const sorted = [...obsidianIndex.posts].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  // 分页
  const start = (page - 1) * PER_PAGE;
  const end = start + PER_PAGE;
  const paginatedPosts = sorted.slice(start, end);

  // 转换格式
  const mapped: ListPostBase[] = paginatedPosts.map((p) => ({
    slug: p.slug,
    title: p.title ?? 'Untitled',
    date: new Date(p.date).toISOString(),
    excerpt: p.excerpt ?? '',
    tags: [],
    category: p.category,
    coverImage: null,
    author: 'Shuakami',
    content: '',
    wordCount: 0,
    source: 'obsidian',
  }));

  return {
    posts: mapped as unknown as ArchivePost[],
    total: sorted.length,
    hasMore: end < sorted.length,
  };
});

/**
 * 按 slug 获取单篇文章（从 Redis/Obsidian）
 */
export const getPostBySlug = cache(async <T extends BlogPost | ArchivePost>(
  slug: string,
  _path?: string // 保留参数兼容性，但不使用
): Promise<T | null> => {
  // URL 解码 slug（处理中文等特殊字符）
  const decodedSlug = decodeURIComponent(slug);
  
  const obsidianPost = await getObsidianPost(decodedSlug);
  if (obsidianPost) {
    return obsidianPost as T;
  }
  return null;
});

/**
 * 生成静态路径（用于 SSG）
 */
export async function generateStaticParams() {
  const obsidianIndex = await getObsidianIndex();
  if (!obsidianIndex || obsidianIndex.posts.length === 0) {
    return [];
  }
  
  return obsidianIndex.posts.map((post) => ({
    slug: post.slug,
  }));
}
