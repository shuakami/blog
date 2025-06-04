// src/app/post/[slug]/page.tsx
import { getBlogPosts, getPostBySlug } from '@/utils/posts';
import { formatDate } from '@/utils/date';
import { notFound } from 'next/navigation';
import BackButton from '@/components/BackButton';
import type { Metadata } from 'next';
import type { Viewport } from 'next';

// 样式常量
const CARD_STYLES = {
  base: "bg-white/40 dark:bg-black/40 backdrop-blur-md md:rounded-xl md:border md:border-black/5 md:dark:border-white/10 md:shadow-[0_8px_30px_rgb(0,0,0,0.04)] md:dark:shadow-[0_8px_30px_rgb(255,255,255,0.04)]",
  ring: "md:ring-1 md:ring-black/[0.03] md:dark:ring-white/[0.03]"
};

const cn = (...classes: string[]) => classes.filter(Boolean).join(" ");

export const revalidate = 60;

interface PageProps {
  params: Promise<{
    slug: string;
  }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const resolvedParams = await params;
  const post = await getPostBySlug(resolvedParams.slug, 'content');
  
  if (!post) {
    return {
      title: '文章未找到',
      description: '请检查链接是否正确'
    };
  }

  return {
    title: `${post.title} - Luoxiaohei`,
    description: post.excerpt
  };
}

export const viewport: Viewport = {
  themeColor: 'light',
} as const;

export default async function PostPage({ params }: PageProps) {
  const resolvedParams = await params;
  const post = await getPostBySlug(resolvedParams.slug, 'content');
  
  if (!post) {
    notFound();
  }

  return (
    <article className={cn(CARD_STYLES.base, CARD_STYLES.ring, "overflow-hidden")}>
      <header className="px-4 md:px-6 py-4 md:py-6 border-b border-black/5 dark:border-white/5">
        <BackButton />
        <time className="text-sm text-black/50 dark:text-white/50 mt-4 mb-2 block">
          {formatDate(post.date)}
        </time>
        <h1 className="text-2xl font-medium text-black/80 dark:text-white/80">
          {post.title}
        </h1>
      </header>

      <div className="p-4 md:p-6">
        <div 
          className="prose dark:prose-invert max-w-none markdown-body"
          dangerouslySetInnerHTML={{ __html: post.content }} 
        />
      </div>
    </article>
  );
}

export async function generateStaticParams() {
  const { posts } = await getBlogPosts(1);
  return posts.map((post) => ({
    slug: post.slug,
  }));
} 
