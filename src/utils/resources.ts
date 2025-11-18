import { getObsidianIndex } from '@/lib/redis';
import { getPostBySlug } from './posts';
import type { BlogPost } from '@/types/post';

export interface Resource {
  slug: string;
  title: string;
  description: string;
  type: string;
  format?: string;
  size?: string;
  tags: string[];
  downloadUrl?: string;
  lastUpdated?: string;
  details: Record<string, string>;
  sample?: string;
  usage: string[];
}

export async function getResources(): Promise<Resource[]> {
  const obsidianIndex = await getObsidianIndex();
  
  if (!obsidianIndex || obsidianIndex.posts.length === 0) {
    return [];
  }
  
  // 获取所有文章的完整信息来检查resource字段
  const postsWithResources = await Promise.all(
    obsidianIndex.posts.map(async (indexEntry) => {
      const post = await getPostBySlug<BlogPost>(indexEntry.slug);
      // 支持 resource === true 或 resource === 'true'
      const isResource = post?.resource === true || (post as any)?.resource === 'true';
      return isResource ? post : null;
    })
  );
  
  // 筛选出资源文章
  const resourcePosts = postsWithResources.filter((post): post is BlogPost => post !== null);
  
  // 转换为资源格式
  const resources = resourcePosts.map((post: BlogPost) => ({
    slug: post.slug,
    title: post.title,
    description: post.excerpt || post.content?.replace(/<[^>]*>/g, '').substring(0, 150) || '',
    type: post.resourceType || '数据集',
    format: post.format,
    size: post.size,
    tags: post.tags || [],
    downloadUrl: post.downloadUrl,
    lastUpdated: post.date ? new Date(post.date).toLocaleDateString('zh-CN') : undefined,
    details: post.resourceDetails || {},
    sample: post.content, // 使用文章内容作为示例
    usage: post.usage || [],
  }));
  
  return resources;
}

export async function getResourceBySlug(slug: string): Promise<Resource | null> {
  const resources = await getResources();
  console.log('[getResourceBySlug] Looking for slug:', slug);
  console.log('[getResourceBySlug] Available slugs:', resources.map(r => r.slug));
  
  // 尝试多种匹配方式
  const decodedSlug = decodeURIComponent(slug);
  const found = resources.find(r => 
    r.slug === slug || 
    r.slug === decodedSlug ||
    encodeURIComponent(r.slug) === slug
  );
  
  console.log('[getResourceBySlug] Found:', found ? found.title : 'null');
  return found || null;
}
