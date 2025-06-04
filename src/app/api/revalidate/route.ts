// src/app/api/revalidate/route.ts
import { revalidatePath, revalidateTag } from 'next/cache';
import { NextRequest, NextResponse } from 'next/server';
import { getPostBySlug, getContentIndex } from '@/utils/posts';

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
      revalidateTag('posts-index');
      revalidateTag('posts');
      revalidatePath('/');
      await getContentIndex('content', 1);
      console.log('[Revalidate API] Successfully revalidated all content');

      return NextResponse.json({ 
        revalidated: true, 
        type: 'all',
        timestamp: new Date().toISOString()
      });
    }

    if (type === 'posts' && slugs.length > 0) {
      console.log(`[Revalidate API] Revalidating posts: ${slugs.join(', ')}`);
      // 重新验证特定文章
      revalidateTag('posts-index'); // 先重新验证索引
      await getContentIndex('content', 1); // 强制更新索引

      // 检查是否包含待重新验证的文章
      const { posts } = await getContentIndex('content');
      const missingSlugs = slugs.filter(slug => !posts.some(p => p.slug === slug));
      if (missingSlugs.length > 0) {
        console.warn(`[Revalidate API] Slugs not found in index.json: ${missingSlugs.join(', ')}`);
        return NextResponse.json(
          { message: `Slugs not found: ${missingSlugs.join(', ')}` },
          { status: 400 }
        );
      }

      const results = await Promise.all(
        slugs.map(async (slug) => {
          const tag = `post-${slug}`;
          console.log(`[Revalidate API] Revalidating tag: ${tag}`);
          revalidateTag(tag);
          const path = `/post/${slug}`;
          console.log(`[Revalidate API] Revalidating path: ${path}`);
          revalidatePath(path);
          const post = await getPostBySlug(slug, 'content');
          console.log(`[Revalidate API] Post "${slug}" fetched: ${!!post}`);
          return { slug, success: !!post };
        })
      );

      console.log('[Revalidate API] Successfully revalidated specified posts');

      return NextResponse.json({ 
        revalidated: true, 
        type: 'posts',
        results,
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
        await getContentIndex('content', 1);
        updates.push('index');
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
