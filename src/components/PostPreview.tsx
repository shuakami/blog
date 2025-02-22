import Link from "next/link";
import type { Post } from '@/types/post';
import { Route } from "next";
import Tag, { TagType } from './Tag';
import { useMemo } from 'react';

interface PostPreviewProps {
  post: Post;
}

export default function PostPreview({ post }: PostPreviewProps) {
  // console.log('🎨 [预览组件]', {
  //   slug: post.slug,
  //   hasExcerpt: !!post.excerpt,
  //   excerptLength: post.excerpt?.length,
  //   excerpt: post.excerpt,
  //   type: typeof post.excerpt
  // });

  // 处理文章标签
  const normalizedTag = useMemo(() => {
    const tag = post.tags?.[0];
    if (!tag) return '无标签';
    return ['经验分享', '生活日志', '杂谈', '随笔'].includes(tag) ? tag : '无标签';
  }, [post.tags]) as TagType;

  return (
    <article className="group relative bg-white/40 dark:bg-black/40 backdrop-blur-md md:rounded-xl p-4 md:p-6 
      transition-all duration-300 ease-out
      hover:bg-white/60 dark:hover:bg-black/60
      hover:-translate-y-1
      md:border md:border-black/5 md:dark:border-white/10
      md:shadow-[0_8px_30px_rgb(0,0,0,0.04)] md:dark:shadow-[0_8px_30px_rgb(255,255,255,0.04)]
      md:hover:shadow-[0_16px_45px_rgb(0,0,0,0.1)] md:dark:hover:shadow-[0_16px_45px_rgb(255,255,255,0.1)]">
      <Link 
        href={`/post/${post.slug}` as Route} 
        className="block"
        prefetch={true}
      >
        <div className="flex flex-col space-y-4">
          {/* 标题和摘要 */}
          <div>
            <h2 className="text-xl mb-4 font-medium text-black dark:text-white group-hover:text-black/70 dark:group-hover:text-white/70 transition-colors">
              {post.title}
            </h2>
            <p className="text-black/70 dark:text-white/70 leading-relaxed line-clamp-3">
              {post.excerpt}
            </p>
          </div>

          {/* 底部信息栏 */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 sm:gap-0 pt-4 border-t border-black/5 dark:border-white/5">
            {/* 左侧信息 */}
            <div className="flex flex-wrap items-center gap-4 text-sm">
              <time className="text-black/50 dark:text-white/50">
                {post.date}
              </time>
              <Tag type={normalizedTag} />
              <span className="text-black/40 dark:text-white/40">
                {post.content.length} 字
              </span>
            </div>

            {/* 右侧继续阅读 */}
            <div className="flex items-center text-sm text-black/40 dark:text-white/40">
              <span className="font-medium group-hover:text-black/60 dark:group-hover:text-white/60 transition-colors">继续阅读</span>
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
          </div>
        </div>
      </Link>
    </article>
  );
} 