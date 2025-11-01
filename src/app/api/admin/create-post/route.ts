import { NextRequest, NextResponse } from 'next/server'
import { getAdminUser } from '@/lib/auth'

// 后台异步创建任务
async function createPostAsync(
  slug: string,
  content: string,
  accessToken: string
) {
  try {
    const fileUrl = `https://api.github.com/repos/shuakami/blog-content/contents/content/${slug}.md`
    
    // 创建新文件
    const createResponse = await fetch(fileUrl, {
      method: 'PUT',
      headers: {
        Authorization: `token ${accessToken}`,
        Accept: 'application/vnd.github.v3+json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message: `Create new post: ${slug}`,
        content: Buffer.from(content).toString('base64'),
        branch: 'main',
      }),
    })

    if (!createResponse.ok) {
      const errorData = await createResponse.json()
      throw new Error(errorData.message || 'Failed to create file')
    }

    console.log(`Successfully created post: ${slug}`)
  } catch (error) {
    console.error(`Failed to create post ${slug}:`, error)
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

    // 验证 slug 格式
    if (!/^[a-z0-9-]+$/.test(slug)) {
      return NextResponse.json({ error: 'Invalid slug format' }, { status: 400 })
    }

    // 异步创建，不等待完成
    createPostAsync(slug, content, user.accessToken)

    // 立即返回成功
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error processing create request:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to process create request' },
      { status: 500 }
    )
  }
}

