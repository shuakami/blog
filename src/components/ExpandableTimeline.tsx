"use client";

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { Route } from 'next';
import type { Post } from '@/types/post';

interface TimelineProps {
  posts: (Post & { displayDate: string })[];
}

const INITIAL_DISPLAY_COUNT = 3;

export default function ExpandableTimeline({ posts }: TimelineProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  // 只过滤最近6个月的文章，不重新排序
  const recentPosts = useMemo(() => {
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
    
    // 只过滤最近6个月的文章，保持原有顺序
    return posts.filter(post => {
      const postDate = new Date(post.date);
      return !isNaN(postDate.getTime()) && postDate >= sixMonthsAgo;
    });
  }, [posts]);

  // 调试日志
  console.log('Timeline posts:', {
    total: posts.length,
    recent: recentPosts.length,
    firstPost: recentPosts[0]?.title,
    firstPostDate: recentPosts[0]?.date,
    lastPost: recentPosts[recentPosts.length - 1]?.title,
    lastPostDate: recentPosts[recentPosts.length - 1]?.date
  });

  const displayPosts = isExpanded ? recentPosts : recentPosts.slice(0, INITIAL_DISPLAY_COUNT);
  const hasMorePosts = recentPosts.length > INITIAL_DISPLAY_COUNT;

  if (recentPosts.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-lg text-black/60 dark:text-white/60">
          最近六个月暂无更新...
        </p>
      </div>
    );
  }

  return (
    <div className="relative">
      {/* 连续的时间线 */}
      <div className="absolute left-[11px] top-2 bottom-0 w-[1.5px] bg-black/[0.07] dark:bg-white/[0.07] rounded-full z-0" />
      
      {/* 文章列表 */}
      <div className="space-y-16">
        {displayPosts.map((post) => (
          <Link 
            key={post.slug}
            href={`/post/${post.slug}` as Route}
            className="block group relative"
          >
            {/* 时间点 */}
            <div className="absolute left-0 top-2 flex items-center justify-center w-6 h-6">
              <div className="absolute w-6 h-6 bg-black/[0.03] dark:bg-white/[0.08] rounded-full transform origin-center transition-all duration-500 ease-out group-hover:scale-[2.5] group-hover:opacity-40 dark:group-hover:opacity-60" />
              <div className="absolute w-3 h-3 bg-black/[0.06] dark:bg-white/[0.15] rounded-full transform origin-center transition-all duration-500 ease-out delay-75 group-hover:scale-150" />
              <div className="w-1.5 h-1.5 bg-black dark:bg-white rounded-full transform origin-center transition-all duration-500 ease-out delay-100" />
            </div>

            {/* 文章内容 */}
            <div className="pl-14">
              <article className="flex-grow">
                {/* 日期 - 使用格式化后的日期显示 */}
                <time className="text-sm font-medium text-black/40 dark:text-white/40 mb-4 block">
                  {post.displayDate}
                </time>

                {/* 标题 */}
                <h2 className="text-[1.75rem] leading-snug mb-4 font-medium text-black dark:text-white break-words">
                  {post.title}
                </h2>

                {/* 分类标签 */}
                {post.tags?.[0] && (
                  <div className="mb-4">
                    <span className="inline-flex px-4 py-1.5 text-[13px] leading-relaxed rounded-full bg-black/[0.02] dark:bg-white/[0.02] text-black/50 dark:text-white/50 border border-black/[0.04] dark:border-white/[0.04]">
                      {post.tags[0]}
                    </span>
                  </div>
                )}

                {/* 摘要 */}
                <p className="text-[17px] text-black/50 dark:text-white/50 leading-relaxed break-words">
                  {post.excerpt}
                </p>

                {/* 阅读更多 */}
                <div className="mt-6 flex items-center text-[15px] text-black/40 dark:text-white/40">
                  <span className="font-medium">继续阅读</span>
                  <svg 
                    className="w-5 h-5 ml-2 transform transition-transform group-hover:translate-x-1" 
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
        ))}

        {/* 可展开的文章 */}
        <div
          className={`transition-all duration-500 ease-in-out overflow-hidden ${
            isExpanded ? 'opacity-100 max-h-[5000px]' : 'opacity-0 max-h-0'
          }`}
        >
          <div className="space-y-16">
            {recentPosts.slice(INITIAL_DISPLAY_COUNT).map((post) => (
              <Link
                key={post.slug}
                href={`/post/${post.slug}` as Route}
                className="block group relative"
              >
                {/* 时间点 */}
                <div className="absolute left-0 top-2 flex items-center justify-center w-6 h-6">
                  <div className="absolute w-6 h-6 bg-black/[0.03] dark:bg-white/[0.08] rounded-full transform origin-center transition-all duration-500 ease-out group-hover:scale-[2.5] group-hover:opacity-40 dark:group-hover:opacity-60" />
                  <div className="absolute w-3 h-3 bg-black/[0.06] dark:bg-white/[0.15] rounded-full transform origin-center transition-all duration-500 ease-out delay-75 group-hover:scale-150" />
                  <div className="w-1.5 h-1.5 bg-black dark:bg-white rounded-full transform origin-center transition-all duration-500 ease-out delay-100" />
                </div>

                {/* 文章内容 */}
                <div className="pl-14">
                  <article className="flex-grow">
                    {/* 日期 - 使用格式化后的日期显示 */}
                    <time className="text-sm font-medium text-black/40 dark:text-white/40 mb-4 block">
                      {post.displayDate}
                    </time>

                    {/* 标题 */}
                    <h2 className="text-[1.75rem] leading-snug mb-4 font-medium text-black dark:text-white break-words">
                      {post.title}
                    </h2>

                    {/* 分类标签 */}
                    {post.tags?.[0] && (
                      <div className="mb-4">
                        <span className="inline-flex px-4 py-1.5 text-[13px] leading-relaxed rounded-full bg-black/[0.02] dark:bg-white/[0.02] text-black/50 dark:text-white/50 border border-black/[0.04] dark:border-white/[0.04]">
                          {post.tags[0]}
                        </span>
                      </div>
                    )}

                    {/* 摘要 */}
                    <p className="text-[17px] text-black/50 dark:text-white/50 leading-relaxed break-words">
                      {post.excerpt}
                    </p>

                    {/* 阅读更多 */}
                    <div className="mt-6 flex items-center text-[15px] text-black/40 dark:text-white/40">
                      <span className="font-medium">继续阅读</span>
                      <svg 
                        className="w-5 h-5 ml-2 transform transition-transform group-hover:translate-x-1" 
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
            ))}
          </div>
        </div>
      </div>

      {/* 展开更多按钮 */}
      {hasMorePosts && (
        <div className="flex justify-center pt-6 relative z-40">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="group flex items-center gap-2 px-6 py-3 text-sm font-medium text-black/60 dark:text-white/60 hover:text-black dark:hover:text-white"
          >
            <span>{isExpanded ? '收起内容' : '展开更多'}</span>
            <svg
              className={`w-4 h-4 transform transition-transform duration-300 ${
                isExpanded ? 'rotate-180' : ''
              }`}
              viewBox="0 0 24 24"
              fill="none"
            >
              <path
                d="M6 9L12 15L18 9"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        </div>
      )}
    </div>
  );
} 