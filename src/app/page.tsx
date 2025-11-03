// src/app/page.tsx
import Link from 'next/link';
import { getBlogPosts } from '@/utils/posts';
import type { Post } from '@/types/post';

export const revalidate = 30;

/**
 * 格式化日期为年月日
 */
function formatDate(dateString: string): string {
  const date = new Date(dateString);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}.${month}.${day}`;
}

/**
 * 文章条目 - 极简主义
 */
function PostItem({ post }: { post: Post }) {
  const formattedDate = formatDate(post.date);

  return (
    <Link
      href={`/post/${post.slug}`}
      className="group grid grid-cols-[70px_1fr] sm:grid-cols-[90px_1fr] md:grid-cols-[120px_1fr] gap-4 sm:gap-6 md:gap-12 py-6 sm:py-8 md:py-10 border-b border-black/5 dark:border-white/5 last:border-0 hover:bg-black/[0.01] dark:hover:bg-white/[0.01] -mx-2 px-2 sm:-mx-4 sm:px-4 transition-colors"
    >
      {/* 日期 */}
      <time className="text-xs sm:text-sm font-mono text-black/40 dark:text-white/40 pt-0.5 sm:pt-1">{formattedDate}</time>

      {/* 标题和摘要 */}
      <div className="min-w-0">
        <h2 className="text-xl sm:text-2xl md:text-3xl font-medium text-black dark:text-white mb-2 sm:mb-3 group-hover:text-black/60 dark:group-hover:text-white/60 transition-colors leading-tight">
          {post.title}
        </h2>

        {post.excerpt && <p className="text-sm sm:text-base text-black/50 dark:text-white/50 leading-relaxed line-clamp-2">{post.excerpt}</p>}
      </div>
    </Link>
  );
}

export default async function Page() {
  const { posts } = await getBlogPosts(1);
  const displayPosts = posts.slice(0, 10);

  return (
    <div className="max-w-4xl mx-auto py-8 sm:py-12 md:py-16 lg:py-24 px-4 sm:px-6 md:px-8">
      {/* 标题区域 */}
      <header className="mb-12 sm:mb-16 md:mb-20 lg:mb-32">
        <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-medium tracking-tight text-black dark:text-white mb-4 sm:mb-5 md:mb-6">文章</h1>
        <div className="w-12 sm:w-14 md:w-16 h-[2px] bg-black dark:bg-white" />
      </header>

      {/* 文章列表 */}
      <div>
        {displayPosts.map((post) => (
          <PostItem key={post.slug} post={post as unknown as Post} />
        ))}
      </div>

      {/* 查看更多 */}
      {posts.length > 10 && (
        <div className="mt-10 sm:mt-12 md:mt-16 pt-10 sm:pt-12 md:pt-16 border-t border-black/5 dark:border-white/5">
          <Link href="/archive" className="inline-flex text-sm sm:text-base text-black/50 dark:text-white/50 hover:text-black dark:hover:text-white transition-colors">
            查看全部 →
          </Link>
        </div>
      )}
    </div>
  );
}
