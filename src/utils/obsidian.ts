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

export interface WebhookCommit {
  added: string[];
  modified: string[];
  removed: string[];
}

// 路径转 slug
function pathToSlug(path: string): string {
  const filename = path.split('/').pop()!.replace(/\.md$/, '');
  // 转小写，空格转短横线，移除特殊字符
  return filename
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^\w\u4e00-\u9fa5-]/g, ''); // 保留中文字符
}

// 提取分类（从路径）
function extractCategory(path: string): string {
  const parts = path.split('/').slice(0, -1); // 移除文件名
  if (parts.length === 0) return '未分类';
  return parts.join('-');
}

// 排除规则
function shouldExclude(path: string): boolean {
  return (
    path.startsWith('.obsidian/') ||
    path.startsWith('Temp Book/') ||
    path.startsWith('.') ||
    !path.endsWith('.md')
  );
}

// 检查是否包含图片
function hasImages(markdown: string): boolean {
  return /!\[\[Assets\//.test(markdown) || /!\[[^\]]*\]\(Assets\//.test(markdown);
}

// 增量更新处理
export async function processIncrementalUpdate(
  commit: WebhookCommit
): Promise<ObsidianIndex> {
  console.log('[Obsidian] Starting incremental update');
  console.log('[Obsidian] Added:', commit.added.length);
  console.log('[Obsidian] Modified:', commit.modified.length);
  console.log('[Obsidian] Removed:', commit.removed.length);

  // 使用分布式锁防止并发冲突
  return await withLock(async () => {
    // 1. 获取现有索引
    let index = await getObsidianIndex();
  if (!index) {
    index = { posts: [], generated: '' };
    console.log('[Obsidian] No existing index, creating new one');
  }

  // 2. 处理删除
  for (const path of commit.removed) {
    if (shouldExclude(path)) continue;

    const slug = pathToSlug(path);
    const beforeLength = index.posts.length;
    index.posts = index.posts.filter((p) => p.slug !== slug);
    
    if (index.posts.length < beforeLength) {
      await deleteObsidianPost(slug);
      console.log(`[Obsidian] Deleted post: ${slug}`);
    }
  }

  // 3. 清除被修改文件的图片路径缓存（确保显示最新图片）
  for (const path of commit.modified) {
    if (path.startsWith('Assets/') && /\.(png|jpg|jpeg|gif|webp|svg)$/i.test(path)) {
      await clearImageCache(path);
      console.log(`[Obsidian] Cleared image cache for modified: ${path}`);
    }
  }

  // 4. 处理新增和修改
  const changedFiles = [...commit.added, ...commit.modified].filter(
    (p) => !shouldExclude(p)
  );

  console.log(`[Obsidian] Processing ${changedFiles.length} changed files`);

  for (const path of changedFiles) {
    try {
      console.log(`[Obsidian] Processing: ${path}`);
      
      // 获取文件内容
      const content = await getFileContent(path);
      const parsed = matter(content);

      // 检查 publish 标志
      if (parsed.data.publish !== true) {
        console.log(`[Obsidian] Skipping unpublished: ${path}`);
        
        // 如果之前发布过，现在取消发布，则删除
        const slug = pathToSlug(path);
        const beforeLength = index.posts.length;
        index.posts = index.posts.filter((p) => p.slug !== slug);
        
        if (index.posts.length < beforeLength) {
          await deleteObsidianPost(slug);
          console.log(`[Obsidian] Unpublished post: ${slug}`);
        }
        continue;
      }

      // 提取信息
      const category = extractCategory(path);
      const slug = pathToSlug(path);
      
      // 提取标题：优先使用 frontmatter，否则从文件名提取
      const fileName = path.split('/').pop()?.replace(/\.md$/, '') || '未命名';
      const title = parsed.data.title || fileName;
      
      // 提前替换图片链接为 OSS URL（预知，不阻塞）
      const { replaceImagesWithOssUrls } = require('./image-replacer');
      const { updatedMarkdown } = await replaceImagesWithOssUrls(parsed.content);
      
      const html = await markdownToHtml(updatedMarkdown);

      // 生成摘要
      let excerpt = parsed.data.excerpt || '';
      if (!excerpt) {
        // 从内容中提取前 200 字符作为摘要
        excerpt = parsed.content
          .replace(/[#*`_~\[\]]/g, '') // 移除 Markdown 标记
          .replace(/!\[\[[^\]]+\]\]/g, '') // 移除图片引用
          .slice(0, 200)
          .trim();
      }

      // 构建文章对象
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
      };

      // 更新索引
      const existingIndex = index.posts.findIndex((p) => p.slug === slug);
      const indexEntry = {
        slug,
        title: post.title,
        date: post.date,
        category,
        excerpt,
      };

      if (existingIndex >= 0) {
        index.posts[existingIndex] = indexEntry;
        console.log(`[Obsidian] Updated post in index: ${slug}`);
      } else {
        index.posts.push(indexEntry);
        console.log(`[Obsidian] Added new post to index: ${slug}`);
      }

      // 存入 Redis
      await setObsidianPost(slug, post);
      console.log(`[Obsidian] Saved post to Redis: ${slug}`);
    } catch (error) {
      console.error(`[Obsidian] Error processing ${path}:`, error);
      // 继续处理其他文件
    }
  }

    // 4. 更新索引时间戳
    index.generated = new Date().toISOString();
    await setObsidianIndex(index);
    console.log(`[Obsidian] Index updated with ${index.posts.length} posts`);

    return index;
  }); // 关闭 withLock
}

