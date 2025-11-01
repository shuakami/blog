import { NextRequest, NextResponse } from 'next/server'
import { getAdminUser } from '@/lib/auth'

// 后台异步保存任务
async function saveToGitHubAsync(
  slug: string,
  content: string,
  accessToken: string
) {
  try {
    const fileUrl = `https://api.github.com/repos/shuakami/blog-content/contents/content/${slug}.md`
    
    // 获取文件 SHA
    const getFileResponse = await fetch(fileUrl, {
      headers: {
        Authorization: `token ${accessToken}`,
        Accept: 'application/vnd.github.v3+json',
      },
    })

    if (!getFileResponse.ok) {
      throw new Error(`Failed to get file info: ${getFileResponse.status}`)
    }

    const fileData = await getFileResponse.json()

    // 更新文件
    const updateResponse = await fetch(fileUrl, {
      method: 'PUT',
      headers: {
        Authorization: `token ${accessToken}`,
        Accept: 'application/vnd.github.v3+json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message: `Update post: ${slug}`,
        content: Buffer.from(content).toString('base64'),
        sha: fileData.sha,
        branch: 'main',
      }),
    })

    if (!updateResponse.ok) {
      const errorData = await updateResponse.json()
      throw new Error(errorData.message || 'Failed to update file')
    }

    // 触发 ISR 重新验证
    fetch(
      `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/api/revalidate?secret=${process.env.REVALIDATE_SECRET}&path=/post/${slug}`,
      { method: 'POST' }
    ).catch((error) => {
      console.error('ISR revalidation failed:', error)
    })

    console.log(`Successfully saved post: ${slug}`)
  } catch (error) {
    console.error(`Failed to save post ${slug}:`, error)
  }
}

export async function POST(request: NextRequest) {
  try {
    // 验证管理员权限
    const user = await getAdminUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { slug, content } = await request.json()

    if (!slug || !content) {
      return NextResponse.json({ error: 'Missing slug or content' }, { status: 400 })
    }

    // 异步保存，不等待完成
    saveToGitHubAsync(slug, content, user.accessToken)

    // 立即返回成功
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error processing save request:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to process save request' },
      { status: 500 }
    )
  }
}

