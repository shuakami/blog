// src/app/api/webhook/gitee/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath, revalidateTag } from 'next/cache';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

function shouldExclude(path: string): boolean {
  return (
    path.startsWith('.obsidian/') ||
    path.startsWith('Temp Book/') ||
    path.startsWith('.') ||
    !path.endsWith('.md')
  );
}

function pathToSlug(path: string): string {
  const filename = path.split('/').pop()!.replace(/\.md$/, '');
  return filename
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^\w\u4e00-\u9fa5-]/g, '');
}

export async function POST(req: NextRequest) {
  const t0 = Date.now();
  console.log('[Gitee Webhook] Received webhook request');

  try {
    const token = req.headers.get('x-gitee-token');
    const webhookSecret = process.env.GITEE_WEBHOOK_SECRET;

    if (!webhookSecret) {
      console.error('[Gitee Webhook] GITEE_WEBHOOK_SECRET not configured');
      return NextResponse.json({ error: 'Webhook not configured' }, { status: 500 });
    }

    if (token !== webhookSecret) {
      console.warn('[Gitee Webhook] Invalid token');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const payload = await req.json();
    console.log('[Gitee Webhook] Event:', payload.hook_name || payload['X-Gitee-Event']);

    const commit = payload.commits?.[0] || payload.head_commit;
    if (!commit) {
      console.warn('[Gitee Webhook] No commit data in payload');
      return NextResponse.json({ error: 'No commit data' }, { status: 400 });
    }

    console.log('[Gitee Webhook] Processing commit:', commit.id?.slice(0, 7));
    console.log('[Gitee Webhook] Message:', commit.message);

    const added: string[] = Array.isArray(commit.added) ? commit.added : [];
    const modified: string[] = Array.isArray(commit.modified) ? commit.modified : [];
    const removed: string[] = Array.isArray(commit.removed) ? commit.removed : [];

    const changedMarkdown = [...added, ...modified, ...removed].filter((p) => !shouldExclude(p));
    const changedSlugs = Array.from(
      new Set(
        changedMarkdown
          .filter((p) => p.endsWith('.md'))
          .map((p) => pathToSlug(p))
      )
    );

    console.log('[Gitee Webhook] Starting content processing');
    const processStart = Date.now();

    try {
      const { processIncrementalUpdate } = await import('@/utils/obsidian');

      const index = await processIncrementalUpdate({
        added,
        modified,
        removed,
      });

      const processEnd = Date.now();
      console.log(
        `[Gitee Webhook] Content processing completed -> posts: ${index.posts.length} (耗时: ${(processEnd - processStart).toFixed(0)}ms)`
      );

      const revStart = Date.now();
      console.log('[Gitee Webhook] Revalidating cache (delta mode)...');

      revalidateTag('obsidian', 'max');
      revalidateTag('posts', 'max');
      revalidateTag('obsidian-index', 'max');

      revalidatePath('/', 'page');
      revalidatePath('/archive', 'page');
      revalidatePath('/resources', 'page');

      for (const slug of changedSlugs) {
        revalidatePath(`/post/${slug}`, 'page');
        revalidatePath(`/resources/${slug}`, 'page');
      }

      const revEnd = Date.now();
      console.log(
        `[Gitee Webhook] Cache revalidation completed (delta: ${changedSlugs.length} slugs, 耗时: ${(revEnd - revStart).toFixed(0)}ms)`
      );
    } catch (error: any) {
      console.error('[Gitee Webhook] Content processing error:', error?.message || error);
    }

    const responseTimestamp = new Date().toISOString();
    const t1 = Date.now();
    console.log(`[Gitee Webhook] Done (总耗时: ${((t1 - t0) / 1000).toFixed(3)}s)`);

    return NextResponse.json({
      success: true,
      message: 'Webhook received and processed',
      timestamp: responseTimestamp,
    });
  } catch (error: any) {
    console.error('[Gitee Webhook] Error:', error);
    return NextResponse.json(
      { error: 'Processing failed', message: error?.message || String(error) },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    status: 'ok',
    service: 'Gitee Webhook Handler',
    timestamp: new Date().toISOString(),
  });
}
