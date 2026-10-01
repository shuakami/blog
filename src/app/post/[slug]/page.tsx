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
import { PostBackLink } from '@/components/PostBackLink';
import { ImagePreview } from '@/components/ImagePreview';
import { LinkPreviewProvider } from '@/components/LinkPreviewProvider';
import { resolveAuthorProfile } from '@/utils/author-profile';
import { formatFolioDate, toOldWords } from '@/lib/format';
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
    <article className="mx-auto w-full max-w-(--column-w) px-6 pb-8 pt-8 md:px-0 md:pt-14">
      <nav className="flex items-center justify-between">
        <PostBackLink />
        <CopyUrlButton />
      </nav>

      <header className="mt-20 flex flex-col items-center text-center md:mt-28">
        <span className="hedera text-[1.375rem] md:text-[1.75rem] text-ink-3" aria-hidden />
        <h1 className="display mt-8 text-[clamp(1.625rem,2.4vw,2.625rem)] leading-[1.18]">{post.title}</h1>
        <p className="mt-10 flex items-center gap-2.5 text-[1.0625rem] text-ink-2">
          <span className="italic">Writ by</span>
          <Image src={authorProfile.avatar} alt="" width={24} height={24} className="h-6 w-6 rounded-full object-cover" />
          <span className="font-semibold text-ink">{authorProfile.name}</span>
        </p>
        <div className="caps mt-4 flex flex-wrap items-center justify-center gap-x-3 gap-y-2">
          <time dateTime={post.date}>{formatFolioDate(post.date)}</time>
          <span className="lozenge" aria-hidden />
          <span>
            {toOldWords(readingTime)} {readingTime === 1 ? 'minute' : 'minutes'} of reading
          </span>
          {post.category && (
            <>
              <span className="lozenge" aria-hidden />
              <Link href={`/archive?category=${encodeURIComponent(post.category)}` as never} className="ink-link text-ink-2">
                {post.category}
              </Link>
            </>
          )}
        </div>
      </header>

      <LinkPreviewProvider>
        <div className="markdown-body mt-20 md:mt-24" dangerouslySetInnerHTML={{ __html: post.content }} />
        <CodeCopyButton />
      </LinkPreviewProvider>

      <footer className="mt-16 md:mt-28 flex flex-col items-center gap-4 text-center">
        <span className="flex items-center gap-3 text-ink-3" aria-hidden>
          <span className="hedera hedera-flip" />
          <span className="hedera" />
        </span>
        <p className="text-[1.625rem] md:text-[2rem] font-semibold italic tracking-[-0.03em] text-ink">Finis.</p>
      </footer>

      <div className="mt-16 flex items-center justify-between">
        <Link href="/archive" className="pill">
          <ArrowLeft className="h-4 w-4" strokeWidth={1.75} />
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
