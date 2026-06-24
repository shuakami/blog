// src/utils/image-replacer.ts
import { generateFileName, getOssUrl } from './dogecloud';
import {
  getCachedImageUrl,
  calculateImageHash,
  getCachedImageUrlByHash,
  cacheImageUrl,
} from './image-cache';
import { getImageBuffer, resolveVaultImagePath } from './gitee';

type ImageRef = { match: string; ref: string };

function extractImageRefs(markdown: string): ImageRef[] {
  const refs: ImageRef[] = [];

  const obsidianMatches = Array.from(markdown.matchAll(/!\[\[([^\]]+)\]\]/g));
  for (const match of obsidianMatches) {
    let ref = match[1];
    // 去掉 Obsidian 的 |别名/尺寸 与 #锚点后缀，只保留文件引用。
    const pipe = ref.indexOf('|');
    if (pipe >= 0) ref = ref.slice(0, pipe);
    const hash = ref.indexOf('#');
    if (hash >= 0) ref = ref.slice(0, hash);
    ref = ref.trim();
    if (ref) refs.push({ match: match[0], ref });
  }

  const markdownMatches = Array.from(markdown.matchAll(/!\[([^\]]*)\]\(([^)]+)\)/g));
  for (const match of markdownMatches) {
    const path = match[2];
    if (path.startsWith('Assets/')) {
      refs.push({ match: match[0], ref: path });
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

// 旧的启发式：vault 索引取不到时（如网络故障）退回到默认的 Assets/Images 约定，
// 保证行为不比修复前更差。
function legacyFallbackPath(ref: string): string {
  if (ref.startsWith('Assets/')) return ref;
  const fileName = ref.split('/').pop()!;
  return `Assets/Images/${fileName}`;
}

async function resolveRefPath(ref: string): Promise<string> {
  const resolved = await resolveVaultImagePath(ref);
  return resolved ?? legacyFallbackPath(ref);
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
    imageRefs.map(async ({ match, ref }) => {
      try {
        const path = await resolveRefPath(ref);
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
        console.error(`[Image Replacer] Failed to process image ${ref}:`, error);
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
