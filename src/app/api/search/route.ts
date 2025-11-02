import { NextResponse } from 'next/server';
import { getObsidianIndex } from '@/lib/redis';

// 搜索索引缓存
let searchIndexCache: {
  data: any[];
  timestamp: number;
} | null = null;

const CACHE_DURATION = 5 * 60 * 1000; // 5分钟缓存（Redis 很快）

// 构建搜索索引（从 Redis 获取 Obsidian 数据）
async function buildSearchIndex() {
  // 检查缓存
  if (searchIndexCache && Date.now() - searchIndexCache.timestamp < CACHE_DURATION) {
    console.log('[Search] 使用缓存的搜索索引');
    return searchIndexCache.data;
  }

  console.log('[Search] 开始构建搜索索引...');
  const startTime = Date.now();

  try {
    const obsidianIndex = await getObsidianIndex();
    
    if (!obsidianIndex || !obsidianIndex.posts) {
      console.warn('[Search] No Obsidian index found');
      return [];
    }
    
    // 处理 Obsidian 数据
    const indexData = obsidianIndex.posts.map((post: any) => {
      return {
        slug: post.slug,
        title: (post.title || '').toLowerCase(),
        excerpt: (post.excerpt || '').toLowerCase(),
        category: (post.category || '').toLowerCase(),
        tags: [],
        content: (post.excerpt || '').toLowerCase(),
        date: post.date,
        // 原始数据用于返回
        original: {
          title: post.title || 'Untitled',
          excerpt: post.excerpt || '',
          category: post.category || '未分类',
          tags: [],
          coverImage: null,
        }
      };
    }).filter(Boolean);
    
    // 更新缓存
    searchIndexCache = {
      data: indexData,
      timestamp: Date.now()
    };

    console.log(`[Search] 搜索索引构建完成，耗时 ${Date.now() - startTime}ms，索引了 ${indexData.length} 篇文章`);
    return indexData;
  } catch (error) {
    console.error('[Search] 构建搜索索引失败:', error);
    throw error;
  }
}

// 计算字符串相似度
function similarity(str1: string, str2: string): number {
  const longer = str1.length > str2.length ? str1 : str2;
  const shorter = str1.length > str2.length ? str2 : str1;
  
  if (longer.length === 0) return 1.0;
  
  const editDistance = levenshteinDistance(longer, shorter);
  return (longer.length - editDistance) / longer.length;
}

function levenshteinDistance(str1: string, str2: string): number {
  const matrix: number[][] = [];

  for (let i = 0; i <= str2.length; i++) {
    matrix[i] = [i];
  }

  for (let j = 0; j <= str1.length; j++) {
    matrix[0][j] = j;
  }

  for (let i = 1; i <= str2.length; i++) {
    for (let j = 1; j <= str1.length; j++) {
      if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j] + 1
        );
      }
    }
  }

  return matrix[str2.length][str1.length];
}

// 智能模糊搜索算法
function searchPosts(index: any[], query: string) {
  const queryLower = query.toLowerCase().trim();
  const queryWords = queryLower.split(/\s+/).filter(w => w.length > 0);
  
  const results = index.map(post => {
    let score = 0;
    let matchedExcerpt = post.original.excerpt;

    // 1. 标题匹配（最高权重）
    // 完全匹配
    if (post.title === queryLower) {
      score += 100;
    }
    // 包含完整查询词
    else if (post.title.includes(queryLower)) {
      score += 60;
    }
    // 模糊匹配：查询词是标题的一部分，或标题包含查询词
    else {
      // 检查标题中每个词
      const titleWords = post.title.split(/[\s\-_]+/);
      titleWords.forEach((titleWord: string) => {
        // 标题词包含查询词（如 tailwindcss 包含 tailwind）
        if (titleWord.includes(queryLower)) {
          score += 45;
        }
        // 查询词包含标题词
        else if (queryLower.includes(titleWord) && titleWord.length > 2) {
          score += 35;
        }
        // 部分匹配
        queryWords.forEach(word => {
          if (titleWord.includes(word) && word.length > 1) {
            score += 25;
          }
          // 相似度匹配
          const sim = similarity(titleWord, word);
          if (sim > 0.7) {
            score += sim * 20;
          }
        });
      });

      // 整体相似度
      const titleSim = similarity(post.title, queryLower);
      if (titleSim > 0.5) {
        score += titleSim * 15;
      }
    }

    // 2. 分类匹配（高权重）
    const category = post.category || '';
    if (category === queryLower) {
      score += 50;
    } else if (category.includes(queryLower)) {
      score += 35;
    } else if (queryLower.includes(category) && category.length > 2) {
      score += 30;
    } else {
      queryWords.forEach(word => {
        if (category.includes(word) && word.length > 1) {
          score += 20;
        }
        const sim = similarity(category, word);
        if (sim > 0.7) {
          score += sim * 15;
        }
      });
    }

    // 3. 摘要匹配（中权重）
    if (post.excerpt.includes(queryLower)) {
      score += 25;
      // 找到匹配位置生成更好的摘要
      const idx = post.excerpt.indexOf(queryLower);
      const start = Math.max(0, idx - 50);
      const end = Math.min(post.excerpt.length, idx + queryLower.length + 100);
      matchedExcerpt = (start > 0 ? '...' : '') + 
                      post.original.excerpt.slice(start, end) + 
                      (end < post.excerpt.length ? '...' : '');
    } else {
      // 部分匹配摘要
      let excerptMatched = false;
      queryWords.forEach(word => {
        if (word.length > 1 && post.excerpt.includes(word)) {
          score += 12;
          excerptMatched = true;
        }
      });
      // 如果摘要有匹配，尝试提取相关部分
      if (excerptMatched) {
        const firstMatchWord = queryWords.find(w => w.length > 1 && post.excerpt.includes(w));
        if (firstMatchWord) {
          const idx = post.excerpt.indexOf(firstMatchWord);
          const start = Math.max(0, idx - 50);
          const end = Math.min(post.excerpt.length, idx + firstMatchWord.length + 100);
          matchedExcerpt = (start > 0 ? '...' : '') + 
                          post.original.excerpt.slice(start, end) + 
                          (end < post.excerpt.length ? '...' : '');
        }
      }
    }

    // 4. 内容匹配（低权重）
    if (post.content.includes(queryLower)) {
      score += 8;
    } else {
      queryWords.forEach(word => {
        if (word.length > 1 && post.content.includes(word)) {
          score += 3;
        }
      });
    }

    return {
      ...post.original,
      slug: post.slug,
      date: post.date,
      excerpt: matchedExcerpt,
      score
    };
  })
  .filter(post => post.score > 0)
  .sort((a, b) => b.score - a.score)
  .slice(0, 30); // 返回前30个结果

  return results;
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q') || '';
    
    // 降低最小长度限制，支持单字符搜索
    if (!query || query.length < 1) {
      return NextResponse.json({ results: [] });
    }

    // 构建/获取搜索索引
    const searchIndex = await buildSearchIndex();
    
    // 执行智能搜索
    const results = searchPosts(searchIndex, query);
    
    return NextResponse.json({ 
      results,
      count: results.length,
      cached: searchIndexCache !== null
    });
  } catch (error) {
    console.error('Search error:', error);
    return NextResponse.json({ 
      error: 'Search failed', 
      message: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 });
  }
}

