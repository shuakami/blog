// src/app/api/process-obsidian/route.ts - 异步处理 Obsidian 内容更新
import { NextRequest, NextResponse } from 'next/server';
import { revalidateTag } from 'next/cache';
import { processIncrementalUpdate } from '@/utils/obsidian';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 300; // 5 minutes

interface ProcessRequest {
  added: string[];
  modified: string[];
  removed: string[];
}

export async function POST(req: NextRequest) {
  console.log('[Process Obsidian] Starting async processing');

  try {
    const body: ProcessRequest = await req.json();
    const startTime = Date.now();

    // 1. 增量更新内容
    const index = await processIncrementalUpdate({
      added: body.added || [],
      modified: body.modified || [],
      removed: body.removed || [],
    });
    
    const processingDuration = Date.now() - startTime;
    console.log(`[Process Obsidian] Content processing completed in ${processingDuration}ms`);

    // 2. 触发 Next.js revalidate
    revalidateTag('obsidian', {});
    revalidateTag('posts', {});
    revalidateTag('obsidian-index', {});
    revalidateTag('content-index', {});
    console.log('[Process Obsidian] Revalidate tags triggered');

    console.log('[Process Obsidian] Processing complete');

    return NextResponse.json({
      success: true,
      updated: index.posts.length,
      duration: `${processingDuration}ms`,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error('[Process Obsidian] Error:', error);
    return NextResponse.json(
      {
        success: false,
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
    service: 'Obsidian Async Processor',
    timestamp: new Date().toISOString(),
  });
}

