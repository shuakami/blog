import { getBlogPosts } from '@/utils/posts';
import { formatDate } from '@/utils/date';
import InfiniteTimeline from '@/components/InfiniteTimeline';
import { Suspense } from 'react';

export const revalidate = 60;

// 加载更多文章的服务器action
async function loadMorePosts(page: number) {
  'use server';
  
  const { posts } = await getBlogPosts(page);
  return posts.map(post => ({
    ...post,
    displayDate: formatDate(post.date),
    coverImage: post.coverImage || null,
    excerpt: post.excerpt || '暂无描述'
  }));
}

export default async function HomePage() {
  const { posts, total } = await getBlogPosts(1);
  
  // 格式化初始文章数据
  const formattedPosts = posts.map(post => ({
    ...post,
    displayDate: formatDate(post.date),
    coverImage: post.coverImage || null,
    excerpt: post.excerpt || '暂无描述'
  }));

  return (
    <div className="space-y-8">
      {/* 欢迎卡片 */}
      <div className="card bg-white/40 dark:bg-black/40 rounded-xl p-8
        backdrop-blur-md
        border border-black/5 dark:border-white/10
        shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(255,255,255,0.04)]">
        <h1 className="text-4xl font-medium mb-4 bg-gradient-to-r from-black to-black/60 dark:from-white dark:to-white/60 bg-clip-text text-transparent">
         最近动态 | Luoxiaohei
        </h1>
        <p className="text-lg text-black/60 dark:text-white/60 leading-relaxed">
         好诗配好酒，闲话配茶香
        </p>
      </div>

      {/* 时间线文章 */}
      <div className="card bg-white/40 dark:bg-black/40 rounded-xl overflow-hidden
        backdrop-blur-md
        border border-black/5 dark:border-white/10
        shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(255,255,255,0.04)]">
        <div className="p-8 pb-6 border-b border-black/5 dark:border-white/5">
          <h2 className="text-xl font-medium text-black/80 dark:text-white/80">最近动态</h2>
        </div>
        <div className="p-8">
          <Suspense fallback={
            <div className="animate-pulse space-y-8">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="pl-14 relative">
                  {/* 时间点骨架 */}
                  <div className="absolute left-0 top-2 w-6 h-6 bg-black/[0.03] dark:bg-white/[0.03] rounded-full" />
                  
                  {/* 内容骨架 */}
                  <div className="space-y-4">
                    <div className="h-4 w-24 bg-black/[0.03] dark:bg-white/[0.03] rounded" />
                    <div className="h-8 w-3/4 bg-black/[0.03] dark:bg-white/[0.03] rounded" />
                    <div className="h-4 w-16 bg-black/[0.03] dark:bg-white/[0.03] rounded" />
                    <div className="space-y-2">
                      <div className="h-4 w-full bg-black/[0.03] dark:bg-white/[0.03] rounded" />
                      <div className="h-4 w-2/3 bg-black/[0.03] dark:bg-white/[0.03] rounded" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          }>
            <InfiniteTimeline
              initialPosts={formattedPosts}
              total={total}
              onLoadMore={loadMorePosts}
            />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
