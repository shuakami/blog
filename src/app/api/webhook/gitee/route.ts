// src/app/api/webhook/gitee/route.ts
import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  console.log('[Gitee Webhook] Received webhook request');

  try {
    // 1. 验证签名
    const token = req.headers.get('x-gitee-token');
    const webhookSecret = process.env.GITEE_WEBHOOK_SECRET;

    if (!webhookSecret) {
      console.error('[Gitee Webhook] GITEE_WEBHOOK_SECRET not configured');
      return NextResponse.json(
        { error: 'Webhook not configured' },
        { status: 500 }
      );
    }

    if (token !== webhookSecret) {
      console.warn('[Gitee Webhook] Invalid token');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // 2. 解析 payload
    const payload = await req.json();
    console.log('[Gitee Webhook] Event:', payload.hook_name || payload['X-Gitee-Event']);

    // 获取 commit 信息
    const commit = payload.commits?.[0] || payload.head_commit;

    if (!commit) {
      console.warn('[Gitee Webhook] No commit data in payload');
      return NextResponse.json({ error: 'No commit data' }, { status: 400 });
    }

    console.log('[Gitee Webhook] Processing commit:', commit.id?.slice(0, 7));
    console.log('[Gitee Webhook] Message:', commit.message);

    // 3. 立即返回响应（极速）
    const responseTimestamp = new Date().toISOString();
    
    console.log('[Gitee Webhook] Webhook received, async processing triggered');
    
    // 4. 同步处理内容更新（在函数内完成，不使用异步调用）
    // 注意：由于 Vercel Hobby 限制 60 秒，直接在这里处理
    try {
      const { processIncrementalUpdate } = await import('@/utils/obsidian');
      const { revalidateTag } = await import('next/cache');
      
      console.log('[Gitee Webhook] Starting content processing');
      
      const index = await processIncrementalUpdate({
        added: commit.added || [],
        modified: commit.modified || [],
        removed: commit.removed || [],
      });
      
      // 触发 revalidate
      revalidateTag('obsidian', {});
      revalidateTag('posts', {});
      revalidateTag('obsidian-index', {});
      
      console.log('[Gitee Webhook] Content processing completed, updated', index.posts.length, 'posts');
    } catch (error: any) {
      console.error('[Gitee Webhook] Content processing error:', error.message);
      // 不影响 webhook 响应
    }

    // 5. 立即返回成功响应
    return NextResponse.json({
      success: true,
      message: 'Webhook received, processing asynchronously',
      timestamp: responseTimestamp,
    });
  } catch (error: any) {
    console.error('[Gitee Webhook] Error:', error);
    return NextResponse.json(
      {
        error: 'Processing failed',
        message: error.message || String(error),
      },
      { status: 500 }
    );
  }
}

// GET 方法用于健康检查
export async function GET() {
  return NextResponse.json({
    status: 'ok',
    service: 'Gitee Webhook Handler',
    timestamp: new Date().toISOString(),
  });
}

