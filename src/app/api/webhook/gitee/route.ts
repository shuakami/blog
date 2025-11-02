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
    
    // 4. 异步处理内容更新（不阻塞）
    // 获取当前域名
    const protocol = req.headers.get('x-forwarded-proto') || 'https';
    const host = req.headers.get('host') || req.headers.get('x-forwarded-host');
    const baseUrl = host ? `${protocol}://${host}` : 'http://localhost:3000';
    
    console.log('[Gitee Webhook] Triggering async processing to:', `${baseUrl}/api/process-obsidian`);

    // 触发异步处理（包括内容更新和图片处理）
    fetch(`${baseUrl}/api/process-obsidian`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'User-Agent': 'Gitee-Webhook-Internal'
      },
      body: JSON.stringify({
        added: commit.added || [],
        modified: commit.modified || [],
        removed: commit.removed || [],
      }),
    }).then((res) => {
      console.log('[Gitee Webhook] Async processing response:', res.status);
    }).catch((err) => {
      console.error('[Gitee Webhook] Failed to trigger async processing:', err);
    });

    console.log('[Gitee Webhook] Webhook received, async processing triggered');

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

