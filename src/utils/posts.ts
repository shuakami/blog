// src/utils/posts.ts
import matter from 'gray-matter';
import { markdownToHtml } from './markdown';
import { cache } from 'react';
import axios from 'axios';
import { HttpsProxyAgent } from 'https-proxy-agent';
import type { BlogPost, ArchivePost, ContentIndex, MatterResult } from '@/types/post';

// 配置
const GITHUB_API_URL = 'https://api.github.com/repos/shuakami/blog-content';
const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const PER_PAGE = 10; // 每页文章数

// 内容路径
const PATHS = {
  content: 'content',
  blog: 'content',
  archive: 'content'
} as const;

// 创建 axios 实例
const axiosInstance = axios.create({
  baseURL: GITHUB_API_URL,
  timeout: 10000,
  headers: {
    'Accept': 'application/vnd.github.v3.raw',
    'Authorization': `Bearer ${GITHUB_TOKEN}`,
  }
});

if (process.env.NODE_ENV === 'development') {
  axiosInstance.defaults.proxy = false;
  axiosInstance.defaults.httpsAgent = new HttpsProxyAgent('http://127.0.0.1:7890');
}

// 并行获取内容
async function fetchContentsParallel<T extends BlogPost | ArchivePost>(
  slugs: string[], 
  path: typeof PATHS[keyof typeof PATHS],
  concurrency = 3
): Promise<T[]> {
  console.log('📥 [并行加载] 开始处理 %d 篇内容 (并发数: %d)', slugs.length, concurrency);
  const contents: T[] = [];
  const slugMap = new Map<string, T>();

  // 分批处理
  for (let i = 0; i < slugs.length; i += concurrency) {
    const batch = slugs.slice(i, i + concurrency);
    const batchResults = await Promise.all(
      batch.map(async (slug) => {
        try {
          // 检查是否已经获取过
          if (slugMap.has(slug)) {
            console.log('📦 [缓存命中] 使用已获取的内容: %s', slug);
            return slugMap.get(slug)!;
          }

          console.log('📥 [并行加载] 处理内容: %s', slug);
          const { data } = await axiosInstance.get(`/contents/${path}/${slug}.md`);
          if (!data) return null;

          const result = matter(data) as unknown as MatterResult;
          const htmlContent = await markdownToHtml(result.content);
          
          // 生成摘要
          const excerpt = result.data.excerpt || result.content.slice(0, 200).replace(/[#*`_~]/g, '');
          
          // 确保date是字符串
          const date = result.data.date ? new Date(result.data.date).toISOString() : new Date().toISOString();
          
          const post = {
            slug,
            title: result.data.title || 'Untitled',
            date: date,
            content: htmlContent,
            coverImage: result.data.coverImage || null,
            excerpt: excerpt,
            tags: result.data.tags || []
          } as T;

          // 存储到Map中
          slugMap.set(slug, post);

          console.log('✅ [处理完成]', {
            slug,
            hasExcerpt: !!post.excerpt,
            excerptLength: post.excerpt?.length,
            dateType: typeof post.date
          });

          return post;
        } catch (error) {
          console.error('❌ [并行加载] 处理失败: %s', slug, error);
          return null;
        }
      })
    );

    contents.push(...batchResults.filter(Boolean));
  }

  // 按照原始slugs顺序返回结果
  const orderedContents = slugs
    .map(slug => slugMap.get(slug))
    .filter(Boolean) as T[];

  console.log('✅ [并行加载] 处理完成');
  return orderedContents;
}

// 获取内容索引
export const getContentIndex = cache(async (
  path: typeof PATHS[keyof typeof PATHS],
  page = 1
): Promise<{ posts: ContentIndex['posts']; total: number; hasMore: boolean }> => {
  console.log('📥 [内容索引] 获取第 %d 页数据', page);
  const { data } = await axiosInstance.get(`/contents/${path}/index.json`);
  
  // 计算分页
  const start = (page - 1) * PER_PAGE;
  const end = start + PER_PAGE;
  const paginatedPosts = data.posts.slice(start, end);
  
  return {
    posts: paginatedPosts,
    total: data.posts.length,
    hasMore: end < data.posts.length
  };
});

// 获取博客文章
export const getBlogPosts = cache(async (page = 1): Promise<{
  posts: BlogPost[];
  total: number;
  hasMore: boolean;
}> => {
  console.log('📥 [博客] 开始获取第 %d 页博客文章', page);
  const { posts, total, hasMore } = await getContentIndex(PATHS.content, page);
  
  // 按日期排序
  const sortedPosts = [...posts].sort((a, b) => {
    const dateA = new Date(a.date).getTime();
    const dateB = new Date(b.date).getTime();
    return dateB - dateA;
  });
  
  const slugs = sortedPosts.map(post => post.slug);
  const fetchedPosts = await fetchContentsParallel<BlogPost>(slugs, PATHS.content);
  
  return {
    posts: fetchedPosts,
    total,
    hasMore
  };
});

// 获取归档文章
export const getArchivePosts = cache(async (page = 1): Promise<{
  posts: ArchivePost[];
  total: number;
  hasMore: boolean;
}> => {
  const { posts, total, hasMore } = await getContentIndex(PATHS.content, page);
  
  // 按日期排序
  const sortedPosts = [...posts].sort((a, b) => {
    const dateA = new Date(a.date).getTime();
    const dateB = new Date(b.date).getTime();
    return dateB - dateA;
  });
  
  const slugs = sortedPosts.map(post => post.slug);
  const fetchedPosts = await fetchContentsParallel<ArchivePost>(slugs, PATHS.content);
  
  return {
    posts: fetchedPosts,
    total,
    hasMore
  };
});

// 获取单篇内容
export const getPostBySlug = cache(async <T extends BlogPost | ArchivePost>(
  slug: string,
  path: typeof PATHS[keyof typeof PATHS]
): Promise<T | null> => {
  try {
    console.log(`📥 [内容] 获取 ${path}/${slug}`);
    const { posts } = await getContentIndex(path);
    const postMeta = posts.find(p => p.slug === slug);
    if (!postMeta) {
      console.log('❌ [内容] 未找到: %s', slug);
      return null;
    }

    const [post] = await fetchContentsParallel<T>([slug], path);
    return post || null;
  } catch (error) {
    console.error('❌ [内容] 处理出错: %s', slug, error);
    return null;
  }
});
