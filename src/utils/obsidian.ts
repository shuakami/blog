// src/utils/obsidian.ts
import matter from 'gray-matter';
import { markdownToHtml } from './markdown';
import { getFileContent } from './gitee';
import {
  getObsidianIndex,
  setObsidianIndex,
  setObsidianPost,
  deleteObsidianPost,
  type ObsidianIndex,
} from '@/lib/redis';
import { clearImageCache } from './image-cache';
import { withLock } from './obsidian-lock';
import type { BlogPost } from '@/types/post';
import { replaceImagesWithOssUrls } from './image-replacer';
import { hashPostPassword } from './post-encryption';
import { slugify } from './slug';

const FILE_PROCESS_CONCURRENCY = Number(process.env.OBSIDIAN_FILE_CONCURRENCY || 4);

export interface WebhookCommit {
  added: string[];
  modified: string[];
  removed: string[];
}

function pathToSlug(path: string): string {
  const filename = path.split('/').pop()!.replace(/\.md$/, '');
  return slugify(filename);
}

function extractCategory(path: string): string {
  let parts = path.split('/').slice(0, -1);
  
  if (parts.length === 0) return '未分类';
  
  // 需要跳过的顶层文件夹（这些文件夹仅作为组织结构，不作为分类）
  const skipFolders = ['博客'];
  
  if (skipFolders.includes(parts[0])) {
    parts = parts.slice(1);
    if (parts.length === 0) return '未分类';
  }
  
  return parts.join('-');
}

function shouldExclude(path: string): boolean {
  return (
    path.startsWith('.obsidian/') ||
    path.startsWith('Temp Book/') ||
    path.startsWith('.') ||
    !path.endsWith('.md')
  );
}

async function mapLimit<T, R>(
  items: T[],
  limit: number,
  worker: (item: T, index: number) => Promise<R>
): Promise<R[]> {
  const results: R[] = new Array(items.length) as R[];
  let nextIndex = 0;
  let running = 0;

  return new Promise((resolve, reject) => {
    const launch = () => {
      while (running < limit && nextIndex < items.length) {
        const current = nextIndex++;
        running++;
        Promise.resolve(worker(items[current], current))
          .then((res) => {
            results[current] = res;
            running--;
            if (nextIndex >= items.length && running === 0) {
              resolve(results);
            } else {
              launch();
            }
          })
          .catch((err) => reject(err));
      }
    };
    if (items.length === 0) resolve(results);
    else launch();
  });
}

async function buildPostFromMarkdown(path: string) {
  const content = await getFileContent(path);
  const parsed = matter(content);

  const slug = pathToSlug(path);
  const fileName = path.split('/').pop()?.replace(/\.md$/, '') || '未命名';
  const title = parsed.data.title || fileName;
  const category = extractCategory(path);

  if (parsed.data.publish !== true) {
    return {
      slug,
      unpublished: true,
      indexEntry: undefined as any,
      post: undefined as any,
    } as any;
  }

  const { updatedMarkdown } = await replaceImagesWithOssUrls(parsed.content);
  const html = await markdownToHtml(updatedMarkdown);

  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const { generateExcerpt } = require('./excerpt-generator');
  const excerpt = generateExcerpt(parsed.content, parsed.data.excerpt);

  const rawEncrypt = typeof parsed.data.encrypt === 'string' ? parsed.data.encrypt.trim() : '';
  const isEncrypted = rawEncrypt.length > 0;
  const encryption = isEncrypted ? { hash: hashPostPassword(slug, rawEncrypt) } : undefined;

  const post: BlogPost = {
    slug,
    title,
    date: parsed.data.date
      ? new Date(parsed.data.date).toISOString()
      : new Date().toISOString(),
    content: html,
    category,
    excerpt,
    source: 'obsidian',
    tags: parsed.data.tags || [],
    encryption,
    encrypted: isEncrypted,
    // 资源相关字段
    resource: parsed.data.resource === true,
    resourceType: parsed.data.resourceType,
    format: parsed.data.format,
    size: parsed.data.size,
    downloadUrl: parsed.data.downloadUrl,
    resourceDetails: parsed.data.resourceDetails,
    usage: parsed.data.usage,
  };

  const indexEntry = isEncrypted
    ? undefined
    : {
        slug,
        title: post.title,
        date: post.date,
        category,
        excerpt,
        resource: post.resource,
      };

  return { slug, post, indexEntry, encrypted: isEncrypted };
}

export async function processIncrementalUpdate(
  commit: WebhookCommit
): Promise<ObsidianIndex> {
  const tStart = Date.now();
  console.log('[Obsidian] Starting incremental update');
  console.log('[Obsidian] Added:', commit.added.length);
  console.log('[Obsidian] Modified:', commit.modified.length);
  console.log('[Obsidian] Removed:', commit.removed.length);

  const imgClearStart = Date.now();
  for (const path of commit.modified) {
    if (path.startsWith('Assets/') && /\.(png|jpg|jpeg|gif|webp|svg)$/i.test(path)) {
      await clearImageCache(path);
      console.log(`[Obsidian] Cleared image cache for modified: ${path}`);
    }
  }
  const imgClearEnd = Date.now();

  const changedFiles = [...commit.added, ...commit.modified].filter((p) => !shouldExclude(p));
  const removedFiles = commit.removed.filter((p) => !shouldExclude(p));
  console.log(`[Obsidian] Processing ${changedFiles.length} changed files`);

  const heavyStart = Date.now();
  const buildResults = await mapLimit(changedFiles, Math.max(1, FILE_PROCESS_CONCURRENCY), async (path) => {
    try {
      return await buildPostFromMarkdown(path);
    } catch (error) {
      console.error(`[Obsidian] Error processing ${path}:`, error);
      return null as any;
    }
  });
  const heavyEnd = Date.now();

  const toUpsert = buildResults.filter(Boolean).filter((r: any) => r.post);
  const toUnpublish = buildResults.filter(Boolean).filter((r: any) => r?.unpublished).map((r: any) => r.slug);
  const encryptedSlugs = buildResults.filter(Boolean).filter((r: any) => r?.encrypted).map((r: any) => r.slug);
  const toRemove = removedFiles.map((p) => pathToSlug(p));
  const purgeSlugs = Array.from(new Set([...toRemove, ...toUnpublish, ...encryptedSlugs]));

  const lockStart = Date.now();
  const index = await withLock(async () => {
    let index = await getObsidianIndex();
    if (!index) {
      index = { posts: [], generated: '' };
      console.log('[Obsidian] No existing index, creating new one');
    }

    if (purgeSlugs.length > 0) {
      const before = index.posts.length;
      const purgeSet = new Set(purgeSlugs);
      index.posts = index.posts.filter((p) => !purgeSet.has(p.slug));
      await Promise.all(purgeSlugs.map((slug) => deleteObsidianPost(slug)));
      console.log(`[Obsidian] Purged ${purgeSlugs.length} posts (index: ${before} -> ${index.posts.length})`);
    }

    if (toUpsert.length > 0) {
      const pos = new Map<string, number>();
      index.posts.forEach((p, i) => pos.set(p.slug, i));

      for (const r of toUpsert) {
        if (!r.indexEntry) continue;
        const i = pos.get(r.slug);
        if (i !== undefined) {
          index.posts[i] = r.indexEntry;
        } else {
          pos.set(r.slug, index.posts.length);
          index.posts.push(r.indexEntry);
        }
      }

      await Promise.all(toUpsert.map((r: any) => setObsidianPost(r.slug, r.post)));
      console.log(`[Obsidian] Upserted ${toUpsert.length} posts to Redis`);
    }

    index.generated = new Date().toISOString();
    await setObsidianIndex(index);
    console.log(`[Obsidian] Index updated with ${index.posts.length} posts`);

    return index;
  });
  const lockEnd = Date.now();

  const tEnd = Date.now();
  console.log(
    `[Obsidian] Phases: imgCache=${(imgClearEnd - imgClearStart).toFixed(0)}ms, ` +
    `build=${(heavyEnd - heavyStart).toFixed(0)}ms, lock+write=${(lockEnd - lockStart).toFixed(0)}ms, ` +
    `total=${((tEnd - tStart)).toFixed(0)}ms`
  );

  return index;
}
