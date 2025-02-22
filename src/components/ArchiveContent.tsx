'use client';

import { useState } from 'react';
import { Suspense } from 'react';
import PostPreview from '@/components/PostPreview';
import SearchAndFilter from '@/components/SearchAndFilter';
import type { Post } from '@/types/post';

interface ArchiveContentProps {
  initialPosts: Post[];
}

export default function ArchiveContent({ initialPosts }: ArchiveContentProps) {
  const [filteredPosts, setFilteredPosts] = useState(initialPosts);

  return (
    <div className="space-y-8">
      {/* 页面标题 */}
      <div className="card bg-white/40 dark:bg-black/40 backdrop-blur-md md:rounded-xl p-4 md:p-8
        md:border md:border-black/5 md:dark:border-white/10
        md:shadow-[0_8px_30px_rgb(0,0,0,0.04)] md:dark:shadow-[0_8px_30px_rgb(255,255,255,0.04)]">
        <h1 className="text-3xl md:text-4xl font-medium mb-4 bg-gradient-to-r from-black to-black/60 dark:from-white dark:to-white/60 bg-clip-text text-transparent">
          归档
        </h1>
        <p className="text-base md:text-lg text-black/60 dark:text-white/60 leading-relaxed">
          这里收录了我所有的博客文章，按时间倒序排列。
        </p>
      </div>

      {/* 文章列表 */}
      <div className="card bg-white/40 dark:bg-black/40 backdrop-blur-md md:rounded-xl overflow-hidden
        md:border md:border-black/5 md:dark:border-white/10
        md:shadow-[0_8px_30px_rgb(0,0,0,0.04)] md:dark:shadow-[0_8px_30px_rgb(255,255,255,0.04)]">
        <div className="p-4 md:p-8 pb-4 md:pb-6 border-b border-black/5 dark:border-white/5">
          <h2 className="text-lg md:text-xl font-medium text-black/80 dark:text-white/80 mb-4 md:mb-6">全部文章</h2>
          <SearchAndFilter 
            posts={initialPosts} 
            onFilter={setFilteredPosts} 
          />
        </div>
        <div className="p-4 md:p-8">
          <Suspense fallback={<PostsSkeleton />}>
            <div className="space-y-6 md:space-y-8">
              {filteredPosts.length > 0 ? (
                filteredPosts.map((post) => (
                  <PostPreview
                    key={post.slug}
                    post={post}
                  />
                ))
              ) : (
                <div className="text-center py-8 md:py-12">
                  <p className="text-base md:text-lg text-black/60 dark:text-white/60">
                    没有找到匹配的文章
                  </p>
                </div>
              )}
            </div>
          </Suspense>
        </div>
      </div>
    </div>
  );
}

function PostsSkeleton() {
  return (
    <div className="space-y-8">
      {[1, 2, 3].map((i) => (
        <div key={i} className="animate-pulse">
          <div className="h-4 w-24 bg-black/10 dark:bg-white/10 mb-2" />
          <div className="h-8 w-3/4 bg-black/10 dark:bg-white/10 mb-3" />
          <div className="h-4 w-full bg-black/10 dark:bg-white/10" />
        </div>
      ))}
    </div>
  );
} 