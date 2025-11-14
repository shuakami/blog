// src/app/post/[slug]/page.tsx
import { getBlogPosts, getPostBySlug } from '@/utils/posts';
import { calculateReadingTime } from '@/utils/readingTime';
import { extractHeadings } from '@/utils/markdown';
import { verifyPostPassword } from '@/utils/post-encryption';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeft } from 'lucide-react';
import { CodeCopyButton } from '@/components/CodeCopyButton';
import { CopyUrlButton } from '@/components/CopyUrlButton';
import PostNavigator from '@/components/PostNavigator';
import { ImagePreview } from '@/components/ImagePreview';
import type { Metadata } from 'next';
import type { Viewport } from 'next';

export const revalidate = 30;

interface PageProps {
  params: {
    slug: string;
  };
  searchParams?: Record<string, string | string[] | undefined>;
}

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffTime = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();
  const currentYear = now.getFullYear();

  if (diffDays === 0) return '写于今天';
  if (diffDays === 1) return '写于昨天';
  if (diffDays < 7) return `写于${diffDays}天前`;

  if (year === currentYear) return `写于${month}月${day}日`;
  if (year === currentYear - 1) return `写于去年${month}月${day}日`;
  return `写于${year}年${month}月${day}日`;
}

function extractEncryptParam(value?: string | string[]): string {
  if (!value) return '';
  if (Array.isArray(value)) {
    return value[0] || '';
  }
  return value;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const post = await getPostBySlug(params.slug, 'content');
  if (!post) {
    return {
      title: '文章未找到 - Shuakami',
      description: '请检查链接是否正确',
    };
  }

  const description = post.excerpt || '一篇纪录思考的文章。';

  return {
    title: `${post.title} - Shuakami`,
    description,
    openGraph: {
      title: post.title,
      description,
      type: 'article',
      publishedTime: post.date,
      authors: ['Shuakami'],
    },
    twitter: {
      card: 'summary_large_image',
      title: post.title,
      description,
    },
  };
}

export const viewport: Viewport = {
  themeColor: 'light',
} as const;

export default async function PostPage({ params, searchParams }: PageProps) {
  const post = await getPostBySlug(params.slug, 'content');

  if (!post) {
    notFound();
  }

  const encryptParam = extractEncryptParam(searchParams?.encrypt);
  const isEncrypted = Boolean(post.encrypted && post.encryption?.hash);
  let authorized = true;

  if (isEncrypted) {
    if (!encryptParam) {
      authorized = false;
    } else if (!verifyPostPassword(post.slug, encryptParam, post.encryption!.hash)) {
      authorized = false;
    }
  }

  if (isEncrypted && !authorized) {
    notFound();
  }

  const readingTime = calculateReadingTime(post.content);
  const headings = extractHeadings(post.content);

  return (
    <article className="w-full mx-auto px-4 sm:px-6 pt-6 sm:pt-8 pb-12 sm:pb-16">
      <nav className="flex items-center justify-center gap-2 text-xs sm:text-sm text-black/40 dark:text-white/40 mb-8 sm:mb-12 max-w-5xl mx-auto">
        <Link href="/" className="inline-flex items-center gap-1 sm:gap-1.5 hover:text-black dark:hover:text-white transition-colors flex-shrink-0">
          <ArrowLeft className="w-3 h-3" />
          <span>文章</span>
        </Link>
        <span className="flex-shrink-0">/</span>
        <span className="text-black/60 dark:text-white/60 truncate max-w-[200px] sm:max-w-xs md:max-w-md">{post.title}</span>
      </nav>

      <header className="mb-12 sm:mb-16 text-center max-w-4xl mx-auto">
        <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-medium tracking-tight text-black dark:text-white leading-tight mb-4 sm:mb-6 px-2">
          {post.title}
        </h1>

        <div className="flex items-center justify-center gap-2 mb-4 sm:mb-6">
          <Image
            src="https://uapis.cn/api/v1/avatar/gravatar?email=shuakami%40sdjz.wiki&s=80&d=mp&r=g"
            alt="Author avatar"
            width={20}
            height={20}
            className="rounded-full"
          />
          <span className="text-sm text-black/50 dark:text-white/50">
            {'author' in post && post.author ? post.author : 'Shuakami'}
          </span>
        </div>

        <div className="w-12 sm:w-16 h-[2px] bg-black dark:bg-white mx-auto" />
      </header>

      <div className="article-content-width mx-auto">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4 text-xs sm:text-sm pt-2 mb-6">
          <div className="flex items-center gap-3 sm:gap-4 w-full sm:w-auto">
            <div className="flex items-center gap-1.5 text-black/40 dark:text-white/40">
              <svg width="14" height="14" viewBox="0 0 16 16" fill="none" className="text-black/40 dark:text-white/40 sm:w-4 sm:h-4 flex-shrink-0">
                <path
                  fillRule="evenodd"
                  clipRule="evenodd"
                  d="M5.35066 2.06247C5.96369 1.78847 6.62701 1.60666 7.32351 1.53473L7.16943 0.0426636C6.31208 0.1312 5.49436 0.355227 4.73858 0.693033L5.35066 2.06247ZM8.67651 1.53473C11.9481 1.87258 14.5 4.63876 14.5 8.00001C14.5 11.5899 11.5899 14.5 8.00001 14.5C4.63901 14.5 1.87298 11.9485 1.5348 8.67722L0.0427551 8.83147C0.459163 12.8594 3.86234 16 8.00001 16C12.4183 16 16 12.4183 16 8.00001C16 3.86204 12.8589 0.458666 8.83059 0.0426636L8.67651 1.53473ZM2.73972 4.18084C3.14144 3.62861 3.62803 3.14195 4.18021 2.74018L3.29768 1.52727C2.61875 2.02128 2.02064 2.61945 1.52671 3.29845L2.73972 4.18084ZM1.5348 7.32279C1.60678 6.62656 1.78856 5.96348 2.06247 5.35066L0.693033 4.73858C0.355343 5.4941 0.131354 6.31152 0.0427551 7.16854L1.5348 7.32279ZM8.75001 4.75V4H7.25001V4.75V7.875C7.25001 8.18976 7.3982 8.48615 7.65001 8.675L9.55001 10.1L10.15 10.55L11.05 9.35L10.45 8.9L8.75001 7.625V4.75Z"
                  fill="currentColor"
                />
              </svg>
              <span className="whitespace-nowrap">{readingTime} 分钟阅读</span>
            </div>
            <CopyUrlButton />
          </div>

          <time className="text-black/40 dark:text-white/40 whitespace-nowrap">{formatDate(post.date)}</time>
        </div>

        <div className="prose dark:prose-invert max-w-none markdown-body" dangerouslySetInnerHTML={{ __html: post.content }} />
        <CodeCopyButton />
      </div>

      <PostNavigator headings={headings} />
      <ImagePreview />
    </article>
  );
}

export async function generateStaticParams() {
  const { posts } = await getBlogPosts(1);
  return posts
    .filter((post) => post.slug && typeof post.slug === 'string')
    .map((post) => ({
      slug: post.slug,
    }));
}
