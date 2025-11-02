// src/app/api/revalidate/route.ts
import { revalidatePath, revalidateTag } from 'next/cache';
import { NextRequest, NextResponse } from 'next/server';
import { getPostBySlug, getBlogPosts } from '@/utils/posts';
import { getObsidianIndex } from '@/lib/redis';

// 配置
const REVALIDATE_TOKEN = process.env.REVALIDATE_TOKEN;

export async function POST(req: NextRequest) {
  console.log(`[Revalidate API] POST request received at ${new Date().toISOString()}`);
  try {
    // 验证 token
    const token = req.headers.get('x-revalidate-token');
    console.log(`[Revalidate API] Received token: ${token}`);
    if (token !== REVALIDATE_TOKEN) {
      console.warn('[Revalidate API] Invalid token');
      return NextResponse.json(
        { message: 'Invalid token' },
        { status: 401 }
      );
    }

    const body = await req.json();
    console.log(`[Revalidate API] Request body: ${JSON.stringify(body)}`);
    const { type = 'all', slugs = [], tags = [] } = body;

    if (type === 'all') {
      console.log('[Revalidate API] Revalidating all content');
      // 重新验证所有内容
      revalidateTag('posts-index', {});
      revalidateTag('posts', {});
      revalidateTag('obsidian', {});
      revalidateTag('obsidian-index', {});
      revalidatePath('/');
      revalidatePath('/archive');
      console.log('[Revalidate API] Successfully revalidated all content');

      return NextResponse.json({ 
        revalidated: true, 
        type: 'all',
        timestamp: new Date().toISOString()
      });
    }

    if (type === 'posts' && slugs.length > 0) {
      console.log(`[Revalidate API] Revalidating posts: ${slugs.join(', ')}`);
      
      // 检查文章是否存在
      const index = await getObsidianIndex();
      const missingSlugs = slugs.filter(slug => 
        !index?.posts.some(p => p.slug === slug)
      );
      
      if (missingSlugs.length > 0) {
        console.warn(`[Revalidate API] Slugs not found: ${missingSlugs.join(', ')}`);
      }

      // 只处理存在的 slugs
      const validSlugs = slugs.filter(slug => 
        index?.posts.some(p => p.slug === slug)
      );

      if (validSlugs.length === 0) {
        console.warn('[Revalidate API] No valid slugs to revalidate');
        return NextResponse.json({ 
          revalidated: false, 
          type: 'posts',
          message: 'No valid slugs found',
          missingSlugs,
          timestamp: new Date().toISOString()
        }, { status: 400 });
      }

      const results = await Promise.all(
        validSlugs.map(async (slug) => {
          const tag = `post-${slug}`;
          console.log(`[Revalidate API] Revalidating tag: ${tag}`);
          revalidateTag(tag, {});
          const path = `/post/${slug}`;
          console.log(`[Revalidate API] Revalidating path: ${path}`);
          revalidatePath(path);
          const post = await getPostBySlug(slug);
          console.log(`[Revalidate API] Post "${slug}" fetched: ${!!post}`);
          return { slug, success: !!post };
        })
      );

      console.log('[Revalidate API] Successfully revalidated specified posts');

      return NextResponse.json({ 
        revalidated: true, 
        type: 'posts',
        results,
        ...(missingSlugs.length > 0 && { missingSlugs }),
        timestamp: new Date().toISOString()
      });
    }

    // 标签更新
    if (type === 'tags' && tags.length > 0) {
      console.log(`[Revalidate API] Revalidating tags: ${tags.join(', ')}`);
      const updates = [];
      
      // 处理特殊标签
      if (tags.includes('index')) {
        console.log('[Revalidate API] Revalidating index path and tag');
        revalidatePath('/');
        revalidateTag('obsidian-index', {});
        updates.push('index');
      }

      if (tags.includes('obsidian')) {
        revalidateTag('obsidian', {});
        updates.push('obsidian');
      }

      console.log('[Revalidate API] Successfully revalidated specified tags');

      return NextResponse.json({ 
        revalidated: true, 
        type: 'tags',
        updates,
        timestamp: new Date().toISOString()
      });
    }

    console.warn('[Revalidate API] Invalid request type');
    return NextResponse.json(
      { message: 'Invalid request type' },
      { status: 400 }
    );
  } catch (error) {
    console.error('[Revalidate API] Revalidation error:', error);
    return NextResponse.json(
      { 
        message: 'Error revalidating',
        error: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    );
  }
}
