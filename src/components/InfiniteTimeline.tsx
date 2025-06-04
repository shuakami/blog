"use client";

import { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import { Route } from 'next';
import type { Post } from '@/types/post';
import { motion, AnimatePresence } from 'framer-motion';

interface TimelineProps {
  initialPosts: (Post & { displayDate: string })[];
  total: number;
  onLoadMore: (page: number) => Promise<(Post & { displayDate: string })[]>;
}

export default function InfiniteTimeline({ initialPosts, total, onLoadMore }: TimelineProps) {
  const [posts, setPosts] = useState(initialPosts);
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [hasMore, setHasMore] = useState(posts.length < total);
  const loadMoreRef = useRef<HTMLDivElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [reachedEnd, setReachedEnd] = useState(false);

  // 加载更多文章
  const loadMore = useCallback(async () => {
    if (isLoading || !hasMore) return;

    try {
      setIsLoading(true);
      setError(null);
      const nextPage = page + 1;
      const newPosts = await onLoadMore(nextPage);
      
      if (newPosts.length === 0) {
        setHasMore(false);
        setReachedEnd(true);
        return;
      }

      setPosts(prev => [...prev, ...newPosts]);
      setPage(nextPage);
      
      const newTotal = posts.length + newPosts.length;
      const hasMorePosts = newTotal < total;
      setHasMore(hasMorePosts);
      
      if (!hasMorePosts) {
        setReachedEnd(true);
      }
    } catch (err) {
      setError('加载失败，请重试');
      console.error('加载更多文章失败:', err);
    } finally {
      setIsLoading(false);
    }
  }, [isLoading, hasMore, page, posts.length, total, onLoadMore]);

  // 设置Intersection Observer
  useEffect(() => {
    if (!hasMore || isLoading) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          loadMore();
        }
      },
      { 
        rootMargin: '100px',
        threshold: 0.1 
      }
    );

    const currentRef = loadMoreRef.current;
    if (currentRef) {
      observer.observe(currentRef);
    }

    return () => {
      if (currentRef) {
        observer.unobserve(currentRef);
      }
      observer.disconnect();
    };
  }, [hasMore, isLoading, loadMore]);

  if (posts.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-lg text-black/60 dark:text-white/60">
          暂无文章...
        </p>
      </div>
    );
  }

  return (
    <div className="relative">
      {/* 连续的时间线 */}
      <motion.div 
        className="absolute left-[9px] md:left-[11px] top-2 bottom-0 w-[1.5px] bg-black/[0.07] dark:bg-white/[0.07] rounded-full z-0"
        initial={{ height: 0 }}
        animate={{ height: "auto" }}
        transition={{ duration: 0.5 }}
      />
      
      {/* 文章列表 */}
      <div className="space-y-12 md:space-y-16">
        <AnimatePresence mode="popLayout">
          {posts.map((post, index) => (
            <motion.div
              key={post.slug}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5, delay: Math.min(index * 0.1, 0.3) }}
            >
              <Link 
                href={`/post/${post.slug}` as Route}
                className="block group relative"
              >
                {/* 时间点 */}
                <div className="absolute left-0 top-2 flex items-center justify-center w-5 h-5 md:w-6 md:h-6">
                  <div className="absolute w-5 h-5 md:w-6 md:h-6 bg-black/[0.03] dark:bg-white/[0.08] rounded-full transform origin-center transition-all duration-500 ease-out group-hover:scale-[2.5] group-hover:opacity-40 dark:group-hover:opacity-60" />
                  <div className="absolute w-2.5 h-2.5 md:w-3 md:h-3 bg-black/[0.06] dark:bg-white/[0.15] rounded-full transform origin-center transition-all duration-500 ease-out delay-75 group-hover:scale-150" />
                  <div className="w-1 h-1 md:w-1.5 md:h-1.5 bg-black dark:bg-white rounded-full transform origin-center transition-all duration-500 ease-out delay-100" />
                </div>

                {/* 文章内容 */}
                <div className="pl-10 md:pl-14">
                  <article className="flex-grow">
                    {/* 日期 */}
                    <time className="text-sm font-medium text-black/40 dark:text-white/40 mb-3 md:mb-4 block">
                      {post.displayDate}
                    </time>

                    {/* 标题 */}
                    <h2 className="text-xl md:text-[1.75rem] leading-snug mb-3 md:mb-4 font-medium text-black dark:text-white break-words">
                      {post.title}
                    </h2>

                    {/* 分类标签 */}
                    {post.tags?.[0] && (
                      <div className="mb-3 md:mb-4">
                        <span className="inline-flex px-3 md:px-4 py-1 md:py-1.5 text-xs md:text-[13px] leading-relaxed rounded-full bg-black/[0.02] dark:bg-white/[0.02] text-black/50 dark:text-white/50 border border-black/[0.04] dark:border-white/[0.04]">
                          {post.tags[0]}
                        </span>
                      </div>
                    )}

                    {/* 摘要 */}
                    <p className="text-base md:text-[17px] text-black/50 dark:text-white/50 leading-relaxed break-words">
                      {post.excerpt}
                    </p>

                    {/* 阅读更多 */}
                    <div className="mt-4 md:mt-6 flex items-center text-sm md:text-[15px] text-black/40 dark:text-white/40">
                      <span className="font-medium">继续阅读</span>
                      <svg 
                        className="w-4 h-4 md:w-5 md:h-5 ml-2 transform transition-transform group-hover:translate-x-1" 
                        viewBox="0 0 24 24" 
                        fill="none"
                      >
                        <path 
                          d="M13.75 6.75L19.25 12L13.75 17.25" 
                          stroke="currentColor" 
                          strokeWidth="1.5" 
                          strokeLinecap="round" 
                          strokeLinejoin="round"
                        />
                        <path 
                          d="M19 12H4.75" 
                          stroke="currentColor" 
                          strokeWidth="1.5" 
                          strokeLinecap="round" 
                          strokeLinejoin="round"
                        />
                      </svg>
                    </div>
                  </article>
                </div>
              </Link>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* 加载更多区域 */}
      <div ref={loadMoreRef} className="min-h-[80px] md:min-h-[100px] flex items-center justify-center">
        {isLoading && (
          <motion.div 
            className="flex justify-center items-center space-x-2 py-6 md:py-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className="w-1.5 h-1.5 md:w-2 md:h-2 bg-black/40 dark:bg-white/40 rounded-full animate-bounce [animation-delay:-0.3s]" />
            <div className="w-1.5 h-1.5 md:w-2 md:h-2 bg-black/40 dark:bg-white/40 rounded-full animate-bounce [animation-delay:-0.15s]" />
            <div className="w-1.5 h-1.5 md:w-2 md:h-2 bg-black/40 dark:bg-white/40 rounded-full animate-bounce" />
          </motion.div>
        )}
        {error && (
          <motion.div 
            className="text-center py-6 md:py-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <p className="text-red-500 dark:text-red-400 mb-2 text-sm md:text-base">{error}</p>
            <button
              onClick={() => loadMore()}
              className="text-xs md:text-sm text-black/60 dark:text-white/60 hover:text-black dark:hover:text-white"
            >
              重试
            </button>
          </motion.div>
        )}
        {reachedEnd && (
          <motion.div 
            className="py-8 md:py-12 text-center"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="inline-flex items-center justify-center px-3 md:px-4 py-1.5 md:py-2 space-x-2 rounded-full">
              <span className="text-xs md:text-sm text-black/40 dark:text-white/40">
                已经到底啦 (｡･ω･｡)
              </span>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
} 