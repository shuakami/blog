// src/app/api/revalidate/route.ts
import { revalidatePath, revalidateTag } from 'next/cache';
import { NextRequest, NextResponse } from 'next/server';
import { getPostBySlug } from '@/utils/posts';
import { getObsidianIndex } from '@/lib/redis';

const REVALIDATE_TOKEN = process.env.REVALIDATE_TOKEN;

export async function POST(req: NextRequest) {
  console.log(`[Revalidate API] POST request received at ${new Date().toISOString()}`);
  try {
    const token = req.headers.get('x-revalidate-token');
    if (token !== REVALIDATE_TOKEN) {
      return NextResponse.json({ message: 'Invalid token' }, { status: 401 });
    }

    const { type = 'all', slugs = [], tags = [] } = await req.json();

    if (type === 'all') {
      revalidateTag('posts-index', {});
      revalidateTag('posts', {});
      revalidateTag('obsidian', {});
      revalidateTag('obsidian-index', {});
      revalidatePath('/');
      revalidatePath('/archive');
      return NextResponse.json({ revalidated: true, type: 'all', timestamp: new Date().toISOString() });
    }

    if (type === 'posts' && slugs.length > 0) {
      const index = await getObsidianIndex();
      const slugChecks = await Promise.all(
        slugs.map(async (slug: string) => {
          const existsInIndex = index?.posts.some((p) => p.slug === slug) ?? false;
          if (existsInIndex) {
            return { slug, exists: true as const, cachedPost: null as Awaited<ReturnType<typeof getPostBySlug>> };
          }
          const post = await getPostBySlug(slug);
          return { slug, exists: !!post, cachedPost: post };
        })
      );

      const missingSlugs = slugChecks.filter((item) => !item.exists).map((item) => item.slug);
      const validSlugs = slugChecks.filter((item) => item.exists);

      if (validSlugs.length === 0) {
        return NextResponse.json(
          {
            revalidated: false,
            type: 'posts',
            message: 'No valid slugs found',
            missingSlugs,
            timestamp: new Date().toISOString(),
          },
          { status: 400 }
        );
      }

      const results = await Promise.all(
        validSlugs.map(async ({ slug, cachedPost }) => {
          revalidateTag(`post-${slug}`, {});
          revalidatePath(`/post/${slug}`);
          const post = cachedPost ?? (await getPostBySlug(slug));
          return { slug, success: !!post };
        })
      );

      return NextResponse.json({
        revalidated: true,
        type: 'posts',
        results,
        ...(missingSlugs.length > 0 && { missingSlugs }),
        timestamp: new Date().toISOString(),
      });
    }

    if (type === 'tags' && tags.length > 0) {
      const updates: string[] = [];
      if (tags.includes('index')) {
        revalidatePath('/');
        revalidateTag('obsidian-index', {});
        updates.push('index');
      }
      if (tags.includes('obsidian')) {
        revalidateTag('obsidian', {});
        updates.push('obsidian');
      }
      return NextResponse.json({ revalidated: true, type: 'tags', updates, timestamp: new Date().toISOString() });
    }

    return NextResponse.json({ message: 'Invalid request type' }, { status: 400 });
  } catch (error) {
    console.error('[Revalidate API] Revalidation error:', error);
    return NextResponse.json(
      {
        message: 'Error revalidating',
        error: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
