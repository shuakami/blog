// src/utils/image-replacer.ts - 提前替换图片链接
import { generateFileName, getOssUrl } from './dogecloud';
import {
  getCachedImageUrl,
  calculateImageHash,
  getCachedImageUrlByHash,
  cacheImageUrl,
} from './image-cache';
import { getImageBuffer } from './gitee';

// 提取 Obsidian/Markdown 图片引用
function extractImageRefs(markdown: string): Array<{ match: string; path: string }> {
  const refs: Array<{ match: string; path: string }> = [];
  
  // Obsidian 格式: ![[Assets/Images/xxx.png]]
  const obsidianMatches = Array.from(markdown.matchAll(/!\[\[([^\]]+)\]\]/g));
  for (const match of obsidianMatches) {
    refs.push({ match: match[0], path: match[1] });
  }
  
  // Markdown 格式: ![](Assets/Images/xxx.png) 或 ![alt](Assets/Images/xxx.png)
  const markdownMatches = Array.from(markdown.matchAll(/!\[([^\]]*)\]\(([^)]+)\)/g));
  for (const match of markdownMatches) {
    refs.push({ match: match[0], path: match[2] });
  }
  
  // 只保留 Assets/ 开头的图片
  return refs.filter(ref => ref.path.startsWith('Assets/'));
}

// 替换单个图片引用
function replaceImageRef(
  markdown: string,
  originalMatch: string,
  originalPath: string,
  newUrl: string
): string {
  // 转义特殊字符
  const escapedMatch = originalMatch.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const regex = new RegExp(escapedMatch, 'g');
  
  // 统一替换为标准 Markdown 格式
  return markdown.replace(regex, `![](${newUrl})`);
}

/**
 * 提前替换 Markdown 中的图片链接为 OSS URL（预知）
 * 
 * 流程：
 * 1. 提取所有图片引用
 * 2. 对每张图片：
 *    a. 检查路径缓存 → 命中 → 直接用
 *    b. 下载图片，计算 Hash
 *    c. 检查 Hash 缓存 → 命中 → 直接用
 *    d. 生成文件名，预知 URL，后台上传
 * 3. 替换所有图片链接
 * 4. 返回替换后的 Markdown
 */
export async function replaceImagesWithOssUrls(
  markdown: string
): Promise<{ updatedMarkdown: string; imageCount: number }> {
  const imageRefs = extractImageRefs(markdown);
  
  if (imageRefs.length === 0) {
    return { updatedMarkdown: markdown, imageCount: 0 };
  }
  
  console.log(`[Image Replacer] Found ${imageRefs.length} images to process`);
  
  // 并发处理所有图片（不阻塞）
  const replacements = await Promise.allSettled(
    imageRefs.map(async ({ match, path }) => {
      try {
        // 1. 检查路径缓存
        let cachedUrl = await getCachedImageUrl(path);
        if (cachedUrl) {
          console.log(`[Image Replacer] Cache hit (path): ${path}`);
          return { match, path, url: cachedUrl };
        }
        
        // 2. 下载图片并计算 Hash
        const buffer = await getImageBuffer(path);
        const hash = calculateImageHash(buffer);
        
        // 3. 检查 Hash 缓存
        cachedUrl = await getCachedImageUrlByHash(hash);
        if (cachedUrl) {
          console.log(`[Image Replacer] Cache hit (hash): ${path}`);
          await cacheImageUrl(path, hash, cachedUrl);
          return { match, path, url: cachedUrl };
        }
        
        // 4. 生成基于内容 Hash 的确定性文件名（同内容 = 同文件名）
        const originalName = path.split('/').pop()!;
        const fileName = generateFileName(hash, originalName);
        const ossUrl = getOssUrl(fileName);
        
        console.log(`[Image Replacer] New image: ${path} -> ${ossUrl}`);
        
        // 5. 缓存预知的 URL（立即）
        await cacheImageUrl(path, hash, ossUrl);
        
        // 6. 后台流式上传到 DogeCloud（不阻塞，避免 OOM）
        const { uploadToDogeCloud } = require('./dogecloud');
        uploadToDogeCloud(buffer, fileName).catch((error: Error) => {
          console.error(`[Image Replacer] Background upload failed for ${fileName}:`, error);
        });
        
        return { match, path, url: ossUrl };
      } catch (error) {
        console.error(`[Image Replacer] Failed to process image ${path}:`, error);
        return null;
      }
    })
  );
  
  // 替换所有成功的图片
  let updatedMarkdown = markdown;
  let successCount = 0;
  
  for (const result of replacements) {
    if (result.status === 'fulfilled' && result.value) {
      const { match, path, url } = result.value;
      updatedMarkdown = replaceImageRef(updatedMarkdown, match, path, url);
      successCount++;
    }
  }
  
  console.log(
    `[Image Replacer] Replaced ${successCount}/${imageRefs.length} images`
  );
  
  return { updatedMarkdown, imageCount: successCount };
}

