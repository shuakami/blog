// 调试 Gitee 配置和 API
import { NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  const config = {
    GITEE_OWNER: process.env.GITEE_OWNER,
    GITEE_REPO: process.env.GITEE_REPO,
    GITEE_BRANCH: process.env.GITEE_BRANCH || 'master',
    GITEE_PAT: process.env.GITEE_PAT ? '已配置 ✅' : '❌ 未配置',
  };

  // 测试几个 API 调用
  try {
    const { getRepoInfo, getFileTree } = await import('@/utils/gitee');
    
    const [repoInfo, fileTree] = await Promise.allSettled([
      getRepoInfo(),
      getFileTree(),
    ]);

    return NextResponse.json({
      config,
      repoInfo: repoInfo.status === 'fulfilled' ? {
        name: repoInfo.value.name,
        full_name: repoInfo.value.full_name,
        path: repoInfo.value.path,
        default_branch: repoInfo.value.default_branch,
      } : { error: (repoInfo as any).reason.message },
      fileTree: fileTree.status === 'fulfilled' ? {
        truncated: fileTree.value.truncated,
        tree_count: fileTree.value.tree?.length || 0,
        sample_files: fileTree.value.tree?.slice(0, 10).map((f: any) => f.path) || [],
      } : { error: (fileTree as any).reason.message },
    });
  } catch (error: any) {
    return NextResponse.json({ 
      error: error.message,
      config 
    }, { status: 500 });
  }
}

