// src/utils/posts.ts - Obsidian/Redis 数据源
import { cache } from 'react';
import type { BlogPost, ArchivePost } from '@/types/post';
import { getObsidianIndex, getObsidianPost } from '@/lib/redis';
import { slugify } from './slug';

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
  const mapped: ListPostBase[] = paginatedPosts
    .filter((p) => p && p.slug && typeof p.slug === 'string' && p.slug.trim().length > 0)
    .map((p) => {
      // 合并 category 和 tags
      const allTags = [];
      if (p.category) {
        allTags.push(p.category);
      }
      if (p.tags && Array.isArray(p.tags)) {
        allTags.push(...p.tags);
      }
      
      return {
        slug: p.slug!,
        title: p.title ?? 'Untitled',
        date: new Date(p.date).toISOString(),
        excerpt: p.excerpt ?? '',
        tags: allTags,
        category: p.category,
        coverImage: null,
        author: 'Shuakami',
        content: '',
        source: 'obsidian',
      };
    });

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
  const mapped: ListPostBase[] = paginatedPosts.map((p) => {
    // 合并 category 和 tags
    const allTags = [];
    if (p.category) {
      allTags.push(p.category);
    }
    if (p.tags && Array.isArray(p.tags)) {
      allTags.push(...p.tags);
    }
    
    return {
      slug: p.slug,
      title: p.title ?? 'Untitled',
      date: new Date(p.date).toISOString(),
      excerpt: p.excerpt ?? '',
      tags: allTags,
      category: p.category,
      coverImage: null,
      author: 'Shuakami',
      content: '',
      wordCount: 0,
      source: 'obsidian',
    };
  });

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
  _path?: string 
): Promise<T | null> => {
  if (!slug || typeof slug !== 'string') {
    return null;
  }

  // 尝试多种方式查找文章，以处理 URL 编码和特殊字符
  let obsidianPost = await getObsidianPost(slug);
  if (obsidianPost) {
    return obsidianPost as T;
  }

  // 尝试 URL 解码
  let decodedSlug: string | null = null;
  try {
    decodedSlug = decodeURIComponent(slug);
    if (decodedSlug !== slug) {
      obsidianPost = await getObsidianPost(decodedSlug);
      if (obsidianPost) {
        return obsidianPost as T;
      }
    }
  } catch (e) {
    // 忽略解码错误
  }

  // 尝试 slugify 规范化（存储时使用了 slugify）
  const normalized = slugify(slug);
  if (normalized && normalized !== slug) {
    obsidianPost = await getObsidianPost(normalized);
    if (obsidianPost) {
      return obsidianPost as T;
    }
  }

  // 尝试先解码再 slugify
  if (decodedSlug && decodedSlug !== slug) {
    const normalizedDecoded = slugify(decodedSlug);
    if (normalizedDecoded && normalizedDecoded !== normalized && normalizedDecoded !== slug && normalizedDecoded !== decodedSlug) {
      obsidianPost = await getObsidianPost(normalizedDecoded);
      if (obsidianPost) {
        return obsidianPost as T;
      }
    }
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
  
  return obsidianIndex.posts
    .filter((post) => post.slug && typeof post.slug === 'string')
    .map((post) => ({
      slug: post.slug,
    }));
}


