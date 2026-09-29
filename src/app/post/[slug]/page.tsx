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
import { LinkPreviewProvider } from '@/components/LinkPreviewProvider';
import { resolveAuthorProfile } from '@/utils/author-profile';
import { formatLongDate } from '@/lib/format';
import type { Metadata } from 'next';
import type { Viewport } from 'next';

export const revalidate = 30;

interface PageProps {
  params: Promise<{
    slug: string;
  }> | {
    slug: string;
  };
  searchParams?: Promise<Record<string, string | string[] | undefined>> | Record<string, string | string[] | undefined>;
}

function extractEncryptParam(value?: string | string[]): string {
  if (!value) return '';
  if (Array.isArray(value)) {
    return value[0] || '';
  }
  return value;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const resolvedParams = await Promise.resolve(params);
  const post = await getPostBySlug(resolvedParams.slug, 'content');
  if (!post) {
    return {
      title: 'Not found',
      description: 'The page you were looking for is not here.',
    };
  }

  const description = post.excerpt || 'A note from Shuakami.';
  const authorProfile = resolveAuthorProfile(post.author, post.authorAvatar);

  return {
    title: post.title,
    description,
    openGraph: {
      title: post.title,
      description,
      type: 'article',
      publishedTime: post.date,
      authors: [authorProfile.name],
    },
    twitter: {
      card: 'summary_large_image',
      title: post.title,
      description,
    },
  };
}

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#f7f6f2' },
    { media: '(prefers-color-scheme: dark)', color: '#181210' },
  ],
};

export default async function PostPage({ params, searchParams }: PageProps) {
  const resolvedParams = await Promise.resolve(params);
  const resolvedSearchParams = searchParams ? await Promise.resolve(searchParams) : undefined;
  const post = await getPostBySlug(resolvedParams.slug, 'content');

  if (!post) {
    notFound();
  }

  const encryptParam = extractEncryptParam(resolvedSearchParams?.encrypt);
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
  const authorProfile = resolveAuthorProfile(post.author, post.authorAvatar);

  return (
    <article className="site-column mx-auto px-6 pb-8 pt-8 md:px-0 md:pt-16">
      <nav className="flex items-center justify-between">
        <Link href="/" className="pill" aria-label="Back to index">
          <ArrowLeft className="h-3.5 w-3.5" strokeWidth={1.75} />
          <span>Index</span>
        </Link>
        <CopyUrlButton />
      </nav>

      <header className="mt-16 flex flex-col gap-5">
        <h1 className="text-[26px] font-medium leading-[1.2] tracking-[-0.5px] text-ink sm:text-[30px]">{post.title}</h1>
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-[13px] text-ink-3">
          <span className="flex items-center gap-2 text-ink-2">
            <Image src={authorProfile.avatar} alt="" width={18} height={18} className="h-[18px] w-[18px] rounded-full object-cover" />
            {authorProfile.name}
          </span>
          <time dateTime={post.date} className="mono text-[12px]">
            {formatLongDate(post.date)}
          </time>
          <span className="mono text-[12px]">{readingTime} min read</span>
          {post.category && (
            <Link href={`/archive?category=${encodeURIComponent(post.category)}` as never} className="ink-link">
              {post.category}
            </Link>
          )}
        </div>
        <div className="hairline" />
      </header>

      <LinkPreviewProvider>
        <div className="markdown-body mt-10" dangerouslySetInnerHTML={{ __html: post.content }} />
        <CodeCopyButton />
      </LinkPreviewProvider>

      <div className="mt-20 flex items-center justify-between">
        <Link href="/archive" className="pill">
          <ArrowLeft className="h-3.5 w-3.5" strokeWidth={1.75} />
          <span>Archive</span>
        </Link>
        <CopyUrlButton label="Share" />
      </div>

      <PostNavigator headings={headings} />
      <ImagePreview />
    </article>
  );
}

export async function generateStaticParams() {
  try {
    const { posts } = await getBlogPosts(1);
    return posts
      .filter((post) => post?.slug && typeof post.slug === 'string' && post.slug.trim().length > 0)
      .map((post) => ({
        slug: post.slug!,
      }));
  } catch (error) {
    console.error('[generateStaticParams] Error:', error);
    return [];
  }
}
