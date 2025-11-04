// src/components/ArchiveClientPage.tsx
'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { CategoryFilter } from './CategoryFilter';

interface ArchiveClientPageProps {
  posts: any[];
}

/**
 * 格式化日期为年月
 */
function formatDate(dateString: string): string {
  const date = new Date(dateString);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  return `${year}.${month}`;
}

/**
 * 按年份分组文章（输入已是轻量元数据）
 */
function groupPostsByYear(posts: any[]) {
  const groups: Record<string, any[]> = {};
  for (const post of posts) {
    const year = new Date(post.date).getFullYear();
    (groups[year] ||= []).push(post);
  }
  // 年份降序
  return Object.entries(groups).sort((a, b) => Number(b[0]) - Number(a[0]));
}

// 估算字数：在无 wordCount 且未提供 content 的情况下使用
function estimateWordsFromExcerpt(excerpt?: string): number {
  if (!excerpt) return 0;
  // 对中文内容：近似以字符数计；英文内容：按空格拆分计词
  // 为保持一致性，这里统一以“字符数”估计（更稳定）
  return excerpt.length;
}

// 兜底计算（仅当提供了 HTML content 才使用，避免大正则）
function wordsFromHtml(html?: string): number {
  if (!html) return 0;
  // 去标签的低成本方法：简单扫描剔除 <...> 段
  let cnt = 0;
  let inTag = false;
  for (let i = 0; i < html.length; i++) {
    const ch = html.charCodeAt(i);
    if (ch === 60 /* < */) {
      inTag = true;
    } else if (ch === 62 /* > */) {
      inTag = false;
    } else if (!inTag) {
      cnt++;
    }
  }
  return cnt;
}

export default function ArchiveClientPage({ posts }: ArchiveClientPageProps) {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  // 预处理：补充 year、wordCount（尽量不依赖 content）
  const prepared = useMemo(() => {
    return posts.map((p) => {
      const year = new Date(p.date).getFullYear();
      // 优先使用 wordCount/wc 字段，都不存在时才尝试计算
      let wc = p.wordCount ?? p.wc;
      if (wc == null || wc === 0) {
        // content 如果为空，使用 excerpt 估算
        if (p.content && p.content.trim().length > 0) {
          wc = wordsFromHtml(p.content);
        }
        if (!wc || wc === 0) {
          wc = estimateWordsFromExcerpt(p.excerpt);
        }
      }
      return { ...p, __year: year, __wc: wc };
    });
  }, [posts]);

  // 筛选文章
  const filteredPosts = useMemo(() => {
    if (!selectedCategory) return prepared;
    return prepared.filter((post) => {
      // 优先使用 category，回退到 tags[0]（兼容旧数据）
      const category = post.category || post.tags?.[0];
      return category === selectedCategory;
    });
  }, [prepared, selectedCategory]);

  const groupedPosts = useMemo(() => groupPostsByYear(filteredPosts), [filteredPosts]);

  // 统计信息
  const stats = useMemo(() => {
    const currentYear = new Date().getFullYear();
    let thisYearCount = 0;
    let totalWords = 0;

    for (const p of prepared) {
      totalWords += Number(p.__wc) || 0;
      if (p.__year === currentYear) thisYearCount++;
    }

    return {
      thisYearCount,
      totalWords: totalWords.toLocaleString(),
    };
  }, [prepared]);

  return (
    <div className="max-w-4xl mx-auto px-4 md:px-6 py-16 md:py-24">
      {/* 页面标题 */}
      <header className="mb-12 md:mb-16">
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-medium tracking-tight text-black dark:text-white mb-4">归档</h1>
        <p className="text-lg text-black/50 dark:text-white/50 mb-8">
          今年我写了 {stats.thisYearCount} 篇文章，一共 {stats.totalWords} 字
        </p>
        <div className="w-16 h-[2px] bg-black dark:bg-white" />
      </header>

      {/* 分类筛选 */}
      <CategoryFilter posts={posts} onFilterChange={setSelectedCategory} />

      {/* 按年份分组的文章列表 */}
      {filteredPosts.length > 0 ? (
        <div className="space-y-16">
          {groupedPosts.map(([year, yearPosts]: [string, any[]]) => (
            <section key={year}>
              {/* 年份标题 */}
              <h2 className="text-2xl md:text-3xl font-medium text-black dark:text-white mb-8 sticky top-4 bg-gray-50/80 dark:bg-[#121212]/80 backdrop-blur-sm py-2 -mx-2 px-2 rounded">
                {year}
              </h2>

              {/* 该年份的文章 */}
              <div className="space-y-0">
                {yearPosts.map((post: any) => {
                  // 优先使用 category，回退到 tags[0]（兼容旧数据）
                  const category = post.category || post.tags?.[0];
                  const formattedDate = formatDate(post.date);

                  return (
                    <Link
                      key={post.slug}
                      href={`/post/${post.slug}`}
                      className="group block py-6 border-b border-black/[0.06] dark:border-white/[0.06] last:border-0 hover:bg-black/[0.01] dark:hover:bg-white/[0.01] -mx-4 px-4 transition-colors"
                    >
                      <div className="flex flex-col md:flex-row md:items-baseline md:justify-between gap-2 md:gap-4">
                        {/* 标题 */}
                        <h3 className="text-lg md:text-xl font-medium text-black dark:text-white group-hover:text-black/60 dark:group-hover:text-white/60 transition-colors flex-1">
                          {post.title}
                        </h3>

                        {/* 右侧信息 */}
                        <div className="flex items-center gap-3 text-sm text-black/40 dark:text-white/40 flex-shrink-0">
                          {category && (
                            <>
                              <span className="hidden md:inline">{category}</span>
                              <span className="hidden md:inline">·</span>
                            </>
                          )}
                          <time className="font-mono">{formattedDate}</time>
                        </div>
                      </div>

                      {/* 摘要 */}
                      {post.excerpt && (
                        <p className="mt-2 text-sm text-black/50 dark:text-white/50 line-clamp-1 md:line-clamp-2">
                          {post.excerpt}
                        </p>
                      )}
                    </Link>
                  );
                })}
              </div>
            </section>
          ))}
        </div>
      ) : (
        <div className="text-center py-16">
          <p className="text-lg text-black/40 dark:text-white/40">该分类下暂无文章</p>
        </div>
      )}
    </div>
  );
}
