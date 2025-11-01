import { redirect } from 'next/navigation'
import { getAdminUser } from '@/lib/auth'
import PostEditor from './PostEditor'
import axios from 'axios'

interface PageProps {
  params: Promise<{
    slug: string
  }>
}

// 获取文章原始内容
async function getPostRawContent(slug: string, accessToken: string) {
  try {
    const response = await axios.get(
      `https://api.github.com/repos/shuakami/blog-content/contents/content/${slug}.md`,
      {
        headers: {
          Authorization: `token ${accessToken}`,
          Accept: 'application/vnd.github.v3.raw',
        },
        timeout: 10000,
      }
    )

    return response.data as string
  } catch (error) {
    console.error('Error fetching post:', error)
    return null
  }
}

export default async function EditPostPage({ params }: PageProps) {
  const user = await getAdminUser()

  if (!user) {
    redirect('/admin/login')
  }

  const { slug } = await params
  const content = await getPostRawContent(slug, user.accessToken)

  if (!content) {
    redirect('/admin')
  }

  return <PostEditor slug={slug} initialContent={content} />
}
