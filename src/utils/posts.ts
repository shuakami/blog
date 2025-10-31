// src/utils/posts.ts
import matter from 'gray-matter';
import { markdownToHtml } from './markdown';
import { cache } from 'react';
import axios, { AxiosRequestConfig } from 'axios';
import { HttpsProxyAgent } from 'https-proxy-agent';
import { LRUCache } from 'lru-cache';
import { unstable_cache } from 'next/cache';
import type { BlogPost, ArchivePost, ContentIndex, MatterResult } from '@/types/post';


const GITHUB_API_URL = 'https://api.github.com/repos/shuakami/blog-content';
const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const PER_PAGE = 10 as const; // 每页文章数

const PATHS = {
  content: 'content',
  blog: 'content',
  archive: 'content',
} as const;
type AnyPath = typeof PATHS[keyof typeof PATHS];


const axiosInstance = axios.create({
  baseURL: GITHUB_API_URL,
  timeout: 10000,
  headers: {
    // raw 能直接拿到文件内容（md / json 文件）
    Accept: 'application/vnd.github.v3.raw',
    ...(GITHUB_TOKEN ? { Authorization: `Bearer ${GITHUB_TOKEN}` } : {}),
  },
});

if (process.env.NODE_ENV === 'development') {
  // 保留你原有的本地代理行为
  (axiosInstance.defaults as any).proxy = false;
  (axiosInstance.defaults as any).httpsAgent = new HttpsProxyAgent('http://127.0.0.1:7890');
}


type CacheEntry<T> = { etag?: string; data: T; ts: number };

declare global {
  // 避免多模块实例化带来的多份缓存
  // eslint-disable-next-line no-var
  var __GITHUB_ETAG_CACHE__: LRUCache<string, CacheEntry<any>> | undefined;
}

const etagCache =
  global.__GITHUB_ETAG_CACHE__ ??
  new LRUCache<string, CacheEntry<any>>({
    max: 1000,
    ttl: 1000 * 60 * 10, // 10 分钟的生命期；304 会刷新 ts
    allowStale: true,
    updateAgeOnGet: true,
    updateAgeOnHas: true,
  });

global.__GITHUB_ETAG_CACHE__ = etagCache;

/**
 * 通过 ETag 条件请求获取资源；304 直接返回缓存
 */
async function getWithETag<T>(
  url: string,
  opts: { isJSON?: boolean; abortInMs?: number } = {}
): Promise<T> {
  const key = url;
  const cached = etagCache.get(key);
  const controller = new AbortController();

  let abortTimer: NodeJS.Timeout | null = null;
  if (opts.abortInMs && opts.abortInMs > 0) {
    abortTimer = setTimeout(() => controller.abort(), opts.abortInMs);
  }

  try {
    const cfg: AxiosRequestConfig = {
      url,
      method: 'GET',
      signal: controller.signal as any,
      validateStatus: (s) => s === 200 || s === 304,
      headers: {
        ...(cached?.etag ? { 'If-None-Match': cached.etag } : {}),
      },
    };

    const res = await axiosInstance.request(cfg);

    // 命中 304，返回旧数据（极快）
    if (res.status === 304 && cached) {
      // 触发刷新“存活时间”
      etagCache.set(key, { ...cached, ts: Date.now() });
      return cached.data as T;
    }

    // 200，新鲜数据
    let data: any = res.data;
    if (opts.isJSON && typeof data === 'string') {
      // raw 下 JSON 文件可能是字符串，需要手动 parse
      data = JSON.parse(data);
    }

    const etag = (res.headers?.etag as string | undefined) ?? cached?.etag;
    etagCache.set(key, { etag, data, ts: Date.now() });
    return data as T;
  } finally {
    if (abortTimer) clearTimeout(abortTimer);
  }
}


/**
 * mapLimit：限制并发度的 Promise 映射（无外部依赖）
 */
async function mapLimit<I, O>(
  items: readonly I[],
  limit: number,
  worker: (item: I, index: number) => Promise<O>
): Promise<O[]> {
  if (items.length === 0) return [];
  const concurrency = Math.max(1, limit | 0);
  const ret: O[] = new Array(items.length);
  let next = 0;

  async function run() {
    while (next < items.length) {
      const cur = next++;
      try {
        ret[cur] = await worker(items[cur], cur);
      } catch (e) {
        // 保持顺序与长度，失败位置返回 as any 的 null，便于上层过滤
        (ret as any)[cur] = null;
      }
    }
  }

  const runners = Array.from({ length: Math.min(concurrency, items.length) }, run);
  await Promise.all(runners);
  return ret;
}


/**
 * 读取某路径下的 index.json（使用 ETag 与 unstable_cache）
 * - 该函数只做“取全量索引”的工作；分页在外层做
 */
const _loadIndexRaw = unstable_cache(
  async (path: AnyPath) => {
    const url = `/contents/${path}/index.json`;
    const data = await getWithETag<ContentIndex>(url, { isJSON: true, abortInMs: 8000 });
    // 对 data 做最小校验，避免 null 影响后续流程
    if (!data || !Array.isArray((data as any).posts)) {
      throw new Error(`Invalid index.json for path: ${path}`);
    }
    return data;
  },
  ['content-index'],
  // revalidate 仅决定"跨请求缓存"的寿命。ETag 仍然能在期内继续 304 快速命中。
  { revalidate: 30, tags: ['content-index'] }
);

/**
 * 获取内容索引 + 分页
 */
export const getContentIndex = cache(async (path: AnyPath, page = 1) => {
  const data = await _loadIndexRaw(path);

  const start = (page - 1) * PER_PAGE;
  const end = start + PER_PAGE;
  const posts = data.posts.slice(start, end);

  return {
    posts,
    total: data.posts.length,
    hasMore: end < data.posts.length,
  } as { posts: ContentIndex['posts']; total: number; hasMore: boolean };
});


type ListPostBase = Pick<
  BlogPost,
  'slug' | 'title' | 'date' | 'excerpt' | 'tags' | 'coverImage' | 'author'
> & { content: string; wordCount?: number };

/**
 * 列表页：只返回元数据，不再批量拉取并渲染 Markdown
 * - UI 不变：保留 content 字段但置空（下游并未使用）
 * - 若 index.json 含 wordCount / wc，则一并透传（供归档页统计使用）
 */
export const getBlogPosts = cache(async (page = 1) => {
  const { posts, total, hasMore } = await getContentIndex(PATHS.content, page);

  // 用日期排序（index.json 一般已排序，此处稳妥再排一次）
  const sorted = [...posts].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  const mapped: ListPostBase[] = sorted.map((p) => ({
    slug: p.slug,
    title: p.title ?? 'Untitled',
    date: new Date(p.date).toISOString(),
    excerpt: p.excerpt ?? '',
    tags: (p as any).tags ?? [],
    coverImage: (p as any).coverImage ?? null,
    author: (p as any).author,
    content: '', // 列表不需要 HTML，避免 CPU 浪费
    wordCount: (p as any).wordCount ?? (p as any).wc, // 兼容字段
  }));

  return {
    posts: mapped as unknown as BlogPost[],
    total,
    hasMore,
  } as { posts: BlogPost[]; total: number; hasMore: boolean };
});

/**
 * 归档页数据：同样只取元信息
 */
export const getArchivePosts = cache(async (page = 1) => {
  const { posts, total, hasMore } = await getContentIndex(PATHS.content, page);

  const sorted = [...posts].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  const mapped: ListPostBase[] = sorted.map((p) => ({
    slug: p.slug,
    title: p.title ?? 'Untitled',
    date: new Date(p.date).toISOString(),
    excerpt: p.excerpt ?? '',
    tags: (p as any).tags ?? [],
    coverImage: (p as any).coverImage ?? null,
    author: (p as any).author,
    content: '',
    wordCount: (p as any).wordCount ?? (p as any).wc,
  }));

  return {
    posts: mapped as unknown as ArchivePost[],
    total,
    hasMore,
  } as { posts: ArchivePost[]; total: number; hasMore: boolean };
});


/**
 * 按 slug 读取文章：仅抓取该篇 Markdown 并转换为 HTML
 */
export const getPostBySlug = cache(async <T extends BlogPost | ArchivePost>(
  slug: string,
  path: AnyPath
): Promise<T | null> => {
  // 先在索引中找到 meta
  const { posts: metaPosts } = await getContentIndex(path);
  const postMeta = metaPosts.find((p) => p.slug === slug);
  if (!postMeta) return null;

  // 再拉正文（单篇）
  const raw = await getWithETag<string>(`/contents/${path}/${slug}.md`, { isJSON: false, abortInMs: 9000 });
  const parsed = matter(raw) as unknown as MatterResult;

  const html = await markdownToHtml(parsed.content);

  const excerpt =
    postMeta.excerpt ||
    parsed.data.excerpt ||
    parsed.content.slice(0, 200).replace(/[#*`_~]/g, '');

  const dateISO = postMeta.date
    ? new Date(postMeta.date).toISOString()
    : new Date().toISOString();

  const post = {
    slug,
    title: postMeta.title ?? parsed.data.title ?? 'Untitled',
    date: dateISO,
    content: html,
    coverImage: (postMeta as any).coverImage ?? parsed.data.coverImage ?? null,
    excerpt,
    tags: (postMeta as any).tags ?? parsed.data.tags ?? [],
    author: (postMeta as any).author ?? parsed.data.author,
    wordCount: (postMeta as any).wordCount ?? (postMeta as any).wc,
  } as unknown as T;

  return post;
});

/**
 * 在确需批量抓正文（非常规路径）时才使用。
 * 默认并发 4，可按需要调整。
 */
async function fetchContentsParallel<T extends BlogPost | ArchivePost>(
  slugs: string[],
  path: AnyPath,
  concurrency = 4
): Promise<T[]> {
  const results = await mapLimit(slugs, concurrency, async (slug) => {
    try {
      const raw = await getWithETag<string>(`/contents/${path}/${slug}.md`, {
        isJSON: false,
        abortInMs: 9000,
      });
      const parsed = matter(raw) as unknown as MatterResult;
      const html = await markdownToHtml(parsed.content);

      const excerpt =
        parsed.data.excerpt ||
        parsed.content.slice(0, 200).replace(/[#*`_~]/g, '');

      const dateISO = parsed.data.date
        ? new Date(parsed.data.date).toISOString()
        : new Date().toISOString();

      const post = {
        slug,
        title: parsed.data.title ?? 'Untitled',
        date: dateISO,
        content: html,
        coverImage: parsed.data.coverImage ?? null,
        excerpt,
        tags: parsed.data.tags ?? [],
        author: parsed.data.author,
      } as unknown as T;

      return post;
    } catch {
      return null as any;
    }
  });

  // 保序过滤 null
  return results.filter(Boolean) as T[];
}
