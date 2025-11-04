// src/utils/image-replacer.ts
import { generateFileName, getOssUrl } from './dogecloud';
import {
  getCachedImageUrl,
  calculateImageHash,
  getCachedImageUrlByHash,
  cacheImageUrl,
} from './image-cache';
import { getImageBuffer } from './gitee';

type ImageRef = { match: string; path: string };

function extractImageRefs(markdown: string): ImageRef[] {
  const refs: ImageRef[] = [];

  const obsidianMatches = Array.from(markdown.matchAll(/!\[\[([^\]]+)\]\]/g));
  for (const match of obsidianMatches) {
    let path = match[1];

    if (!path.includes('/')) {
      path = `Assets/Images/${path}`;
    } else if (!path.startsWith('Assets/')) {
      const fileName = path.split('/').pop()!;
      path = `Assets/Images/${fileName}`;
    }

    refs.push({ match: match[0], path });
  }

  const markdownMatches = Array.from(markdown.matchAll(/!\[([^\]]*)\]\(([^)]+)\)/g));
  for (const match of markdownMatches) {
    const path = match[2];
    if (path.startsWith('Assets/')) {
      refs.push({ match: match[0], path });
    }
  }

  const seen = new Set<string>();
  const deduped: ImageRef[] = [];
  for (const r of refs) {
    if (!seen.has(r.match)) {
      seen.add(r.match);
      deduped.push(r);
    }
  }
  return deduped;
}

function replaceImageRef(
  markdown: string,
  originalMatch: string,
  newUrl: string
): string {
  const escapedMatch = originalMatch.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const regex = new RegExp(escapedMatch, 'g');
  return markdown.replace(regex, `![](${newUrl})`);
}

export async function replaceImagesWithOssUrls(
  markdown: string
): Promise<{ updatedMarkdown: string; imageCount: number }> {
  const imageRefs = extractImageRefs(markdown);

  if (imageRefs.length === 0) {
    return { updatedMarkdown: markdown, imageCount: 0 };
  }

  console.log(`[Image Replacer] Found ${imageRefs.length} images to process`);

  const replacements = await Promise.allSettled(
    imageRefs.map(async ({ match, path }) => {
      try {
        let cachedUrl = await getCachedImageUrl(path);
        if (cachedUrl) {
          return { match, path, url: cachedUrl };
        }

        const buffer = await getImageBuffer(path);
        const hash = calculateImageHash(buffer);

        cachedUrl = await getCachedImageUrlByHash(hash);
        if (cachedUrl) {
          await cacheImageUrl(path, hash, cachedUrl);
          return { match, path, url: cachedUrl };
        }

        const originalName = path.split('/').pop()!;
        const fileName = generateFileName(hash, originalName);
        const ossUrl = getOssUrl(fileName);

        await cacheImageUrl(path, hash, ossUrl);

        // eslint-disable-next-line @typescript-eslint/no-var-requires
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

  let updatedMarkdown = markdown;
  let successCount = 0;

  for (const r of replacements) {
    if (r.status === 'fulfilled' && r.value) {
      updatedMarkdown = replaceImageRef(updatedMarkdown, r.value.match, r.value.url);
      successCount++;
    }
  }

  console.log(`[Image Replacer] Replaced ${successCount}/${imageRefs.length} images`);

  return { updatedMarkdown, imageCount: successCount };
}
