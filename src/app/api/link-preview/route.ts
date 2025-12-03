import { NextResponse } from 'next/server';

interface LinkMetadata {
  page_url: string;
  title: string;
  description: string;
  favicon_url?: string;
  open_graph?: {
    image?: string;
    [key: string]: any;
  };
}

// 内存缓存
const metadataCache = new Map<string, { data: LinkMetadata; timestamp: number }>();
const CACHE_DURATION = 1000 * 60 * 60 * 24 * 7; // 7天缓存（减少对慢速网站的请求）
const MAX_CACHE_SIZE = 1000;
const MAX_HTML_SIZE = 500 * 1024; // 只读取前 500KB

/**
 * 快速提取 meta 标签内容（使用正则，避免完整 DOM 解析）
 */
function extractMeta(html: string, property: string): string | null {
  // 转义特殊字符
  const escapedProperty = property.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  
  // 快速匹配常见格式
  const simplePattern = `<meta\\s+(?:property|name)=["']${escapedProperty}["']\\s+content=["']([^"']+)["']`;
  const reversePattern = `<meta\\s+content=["']([^"']+)["']\\s+(?:property|name)=["']${escapedProperty}["']`;
  
  let match = html.match(new RegExp(simplePattern, 'i'));
  if (match?.[1]) return match[1];
  
  match = html.match(new RegExp(reversePattern, 'i'));
  if (match?.[1]) return match[1];
  
  return null;
}

/**
 * 提取网站 favicon
 */
function extractFavicon(html: string, baseUrl: string): string | undefined {
  // 快速匹配 favicon link 标签
  const iconPattern = /<link[^>]*rel=["'](icon|shortcut icon|apple-touch-icon)["'][^>]*>/gi;
  const matches = html.match(iconPattern);
  
  if (matches) {
    for (const match of matches) {
      const hrefMatch = match.match(/href=["']([^"']+)["']/i);
      if (hrefMatch?.[1]) {
        try {
          return new URL(hrefMatch[1], baseUrl).href;
        } catch {
          continue;
        }
      }
    }
  }
  
  // 默认 favicon 路径
  try {
    return new URL('/favicon.ico', baseUrl).href;
  } catch {
    return undefined;
  }
}

/**
 * 快速解析 HTML 获取元数据（只解析 <head> 部分）
 */
function parseMetadata(html: string, url: string): LinkMetadata {
  // 只提取 <head> 部分，减少解析量
  const headMatch = html.match(/<head[^>]*>([\s\S]*?)<\/head>/i);
  const head = headMatch ? headMatch[1] : html.substring(0, 50000); // 如果没有 head 标签，只取前 50KB
  
  // 提取标题（优先级：og:title > twitter:title > <title>）
  const ogTitle = extractMeta(head, 'og:title');
  const twitterTitle = extractMeta(head, 'twitter:title');
  const titleMatch = head.match(/<title[^>]*>([^<]+)<\/title>/i);
  const title = ogTitle || twitterTitle || titleMatch?.[1] || new URL(url).hostname;
  
  // 提取描述（优先级：og:description > twitter:description > description）
  const ogDesc = extractMeta(head, 'og:description');
  const twitterDesc = extractMeta(head, 'twitter:description');
  const metaDesc = extractMeta(head, 'description');
  const description = ogDesc || twitterDesc || metaDesc || '';
  
  // 提取 favicon
  const favicon = extractFavicon(head, url);
  
  return {
    page_url: url,
    title: title.trim(),
    description: description.trim(),
    favicon_url: favicon,
  };
}

/**
 * 清理过期缓存
 */
function cleanupCache() {
  if (metadataCache.size <= MAX_CACHE_SIZE) return;
  
  const now = Date.now();
  const entries = Array.from(metadataCache.entries());
  
  // 删除过期项
  for (const [key, value] of entries) {
    if (now - value.timestamp > CACHE_DURATION) {
      metadataCache.delete(key);
    }
  }
  
  // 如果还是太多，删除最旧的
  if (metadataCache.size > MAX_CACHE_SIZE) {
    const sorted = entries.sort((a, b) => a[1].timestamp - b[1].timestamp);
    const toDelete = sorted.slice(0, metadataCache.size - MAX_CACHE_SIZE);
    toDelete.forEach(([key]) => metadataCache.delete(key));
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const url = searchParams.get('url');

    if (!url) {
      return NextResponse.json(
        { error: 'URL parameter is required' },
        { status: 400 }
      );
    }

    // 检查缓存
    const cached = metadataCache.get(url);
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      return NextResponse.json(cached.data);
    }

    // 抓取网页 HTML（限制大小和超时）
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000); // 15秒超时
    
    try {
      const response = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
          'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8',
        },
        signal: controller.signal,
      });

      if (!response.ok) {
        return NextResponse.json(
          { error: 'Failed to fetch page' },
          { status: response.status }
        );
      }

      // 流式读取，限制大小
      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error('No response body');
      }

      const decoder = new TextDecoder();
      let html = '';
      let bytesRead = 0;

      while (bytesRead < MAX_HTML_SIZE) {
        const { done, value } = await reader.read();
        if (done) break;
        
        bytesRead += value.length;
        html += decoder.decode(value, { stream: true });
        
        // 如果已经读取到 </head>，可以提前停止
        if (html.includes('</head>')) {
          reader.cancel();
          break;
        }
      }

      clearTimeout(timeoutId);
      const metadata = parseMetadata(html, url);

      // 更新缓存
      metadataCache.set(url, { data: metadata, timestamp: Date.now() });
      
      // 清理过期缓存
      cleanupCache();

      return NextResponse.json(metadata);
    } catch (fetchError) {
      clearTimeout(timeoutId);
      throw fetchError;
    }
  } catch (error) {
    console.error('Link preview error:', error);
    
    // 超时或网络错误时，返回基本的 fallback 数据
    const { searchParams } = new URL(request.url);
    const urlParam = searchParams.get('url');
    
    if (urlParam) {
      try {
        const parsedUrl = new URL(urlParam);
        const fallbackData: LinkMetadata = {
          page_url: urlParam,
          title: parsedUrl.hostname,
          description: '预览加载超时',
          favicon_url: `${parsedUrl.protocol}//${parsedUrl.hostname}/favicon.ico`,
        };
        
        // 仍然缓存 fallback 数据，避免重复请求慢速网站
        metadataCache.set(urlParam, { data: fallbackData, timestamp: Date.now() });
        
        return NextResponse.json(fallbackData);
      } catch {
        // Fallback URL 解析失败
      }
    }
    
    return NextResponse.json(
      { error: 'Failed to parse metadata' },
      { status: 500 }
    );
  }
}
