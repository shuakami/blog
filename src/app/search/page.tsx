"use client"

import { useState, useEffect, useCallback, useRef } from 'react';
import Link from 'next/link';
import { Search, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface SearchResult {
  slug: string;
  title: string;
  excerpt: string;
  date: string;
  tags: string[];
  coverImage: string | null;
}

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  return `${year}.${month}`;
}

// 转义正则表达式特殊字符
function escapeRegExp(string: string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function highlightText(text: string, query: string) {
  if (!query) return text;
  
  try {
    const escapedQuery = escapeRegExp(query);
    const parts = text.split(new RegExp(`(${escapedQuery})`, 'gi'));
    return (
      <>
        {parts.map((part, i) => 
          part.toLowerCase() === query.toLowerCase() ? (
            <mark key={i} className="bg-transparent text-black dark:text-white underline decoration-2 underline-offset-2">
              {part}
            </mark>
          ) : (
            part
          )
        )}
      </>
    );
  } catch (error) {
    // 如果正则表达式仍然失败，直接返回原文本
    return text;
  }
}

export default function SearchPage() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceTimer = useRef<NodeJS.Timeout | null>(null);

  // 自动聚焦搜索框
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  // 搜索函数
  const performSearch = useCallback(async (searchQuery: string) => {
    if (searchQuery.length < 1) {
      setResults([]);
      setHasSearched(false);
      return;
    }

    setLoading(true);
    setHasSearched(true);

    try {
      const response = await fetch(`/api/search?q=${encodeURIComponent(searchQuery)}`);
      const data = await response.json();
      setResults(data.results || []);
    } catch (error) {
      console.error('Search error:', error);
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // 实时搜索（自动触发，不需要按回车）
  useEffect(() => {
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }

    debounceTimer.current = setTimeout(() => {
      performSearch(query);
    }, 150);

    return () => {
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }
    };
  }, [query, performSearch]);

  // 清空搜索
  const clearSearch = () => {
    setQuery('');
    setResults([]);
    setHasSearched(false);
    inputRef.current?.focus();
  };

  return (
    <div className="mx-auto px-4 md:px-6 py-16 md:py-24 article-content-width">
      {/* 标题区域 */}
      <header className="mb-16 md:mb-20">
        <h1 className="text-5xl md:text-6xl lg:text-7xl font-medium tracking-tight text-black dark:text-white mb-6">
          搜索
        </h1>
        <div className="w-16 h-[2px] bg-black dark:bg-white mb-12" />
        
        {/* 搜索框 */}
        <div className="relative">
          <Search className={`absolute left-0 top-1/2 -translate-y-1/2 w-5 h-5 transition-colors ${
            loading ? 'text-black/60 dark:text-white/60 animate-pulse' : 'text-black/30 dark:text-white/30'
          }`} />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="输入即可搜索..."
            className="w-full pl-8 pr-8 py-3 bg-transparent border-b border-black/10 dark:border-white/10 focus:border-black/30 dark:focus:border-white/30 text-xl text-black dark:text-white placeholder:text-black/30 dark:placeholder:text-white/30 focus:outline-none transition-colors"
          />
          {query && (
            <button
              onClick={clearSearch}
              className="absolute right-0 top-1/2 -translate-y-1/2 text-black/30 dark:text-white/30 hover:text-black dark:hover:text-white transition-colors"
              aria-label="清空"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>
      </header>

      {/* 搜索结果 */}
      {hasSearched && (
        <>
          {results.length > 0 ? (
            <>
              <div className="mb-8 text-sm text-black/40 dark:text-white/40">
                {results.length} 篇文章
              </div>
              <div>
                <AnimatePresence mode="popLayout">
                  {results.map((result, index) => (
                    <motion.div
                      key={result.slug}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ delay: index * 0.02, duration: 0.3 }}
                    >
                      <Link
                        href={`/post/${result.slug}`}
                        className="group grid grid-cols-[80px_1fr] md:grid-cols-[120px_1fr] gap-8 md:gap-12 py-10 border-b border-black/5 dark:border-white/5 last:border-0 hover:bg-black/[0.01] dark:hover:bg-white/[0.01] -mx-4 px-4 transition-colors"
                      >
                        {/* 日期 */}
                        <time className="text-sm font-mono text-black/40 dark:text-white/40 pt-1">
                          {formatDate(result.date)}
                        </time>

                        {/* 内容 */}
                        <div className="min-w-0">
                          <h2 className="text-2xl md:text-3xl font-medium text-black dark:text-white mb-3 group-hover:text-black/60 dark:group-hover:text-white/60 transition-colors leading-tight">
                            {highlightText(result.title, query)}
                          </h2>

                          {result.excerpt && (
                            <p className="text-base text-black/50 dark:text-white/50 leading-relaxed line-clamp-2 mb-3">
                              {highlightText(result.excerpt, query)}
                            </p>
                          )}

                          {result.tags && result.tags.length > 0 && (
                            <div className="flex flex-wrap gap-2">
                              {result.tags.slice(0, 3).map((tag) => (
                                <span 
                                  key={tag}
                                  className="text-xs text-black/40 dark:text-white/40"
                                >
                                  {highlightText(tag, query)}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      </Link>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </>
          ) : (
            <div className="py-16 text-center">
              <p className="text-lg text-black/40 dark:text-white/40">
                未找到相关文章
              </p>
            </div>
          )}
        </>
      )}
    </div>
  );
}

