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
  // Next.js 路由参数可能已经解码，也可能未解码
  // 我们需要尝试多种方式查找文章
  
  // 1. 首先尝试直接使用原始 slug（Next.js 可能已经自动解码）
  let obsidianPost = await getObsidianPost(slug);
  if (obsidianPost) {
    return obsidianPost as T;
  }

  // 如果原始 slug 包含特殊字符，记录日志以便调试
  if (slug.includes('&') || slug.includes('%')) {
    console.log(`[getPostBySlug] 原始 slug 包含特殊字符: ${slug}`);
  }

  // 2. 尝试 URL 解码（如果包含编码字符）
  try {
    const decodedSlug = decodeURIComponent(slug);
    if (decodedSlug !== slug) {
      obsidianPost = await getObsidianPost(decodedSlug);
      if (obsidianPost) {
        return obsidianPost as T;
      }
    }
  } catch (e) {
    // decodeURIComponent 失败，继续尝试其他方式
  }

  // 3. 尝试 slugify 规范化（这是最可能匹配的方式，因为存储时使用了 slugify）
  const normalized = slugify(slug);
  if (normalized && normalized !== slug) {
    obsidianPost = await getObsidianPost(normalized);
    if (obsidianPost) {
      return obsidianPost as T;
    }
  }

  // 4. 如果原始 slug 包含特殊字符，尝试先解码再 slugify
  try {
    const decodedSlug = decodeURIComponent(slug);
    if (decodedSlug !== slug) {
      const normalizedDecoded = slugify(decodedSlug);
      if (normalizedDecoded && normalizedDecoded !== normalized) {
        obsidianPost = await getObsidianPost(normalizedDecoded);
        if (obsidianPost) {
          return obsidianPost as T;
        }
      }
    }
  } catch (e) {
    // 忽略错误
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


