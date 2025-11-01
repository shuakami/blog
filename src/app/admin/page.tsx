import { redirect } from 'next/navigation'
import { getAdminUser } from '@/lib/auth'
import { getBlogPosts } from '@/utils/posts'
import Link from 'next/link'
import AdminPostList from './AdminPostList'

export default async function AdminPage() {
  const user = await getAdminUser()

  if (!user) {
    redirect('/admin/login')
  }

  const { posts } = await getBlogPosts(1)

  return (
    <div className="max-w-4xl mx-auto py-8 sm:py-12 md:py-16 lg:py-24 px-4 sm:px-6 md:px-8">
      {/* 标题区域 */}
      <header className="mb-12 sm:mb-16 md:mb-20 lg:mb-32">
        <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-medium tracking-tight text-black dark:text-white mb-4 sm:mb-5 md:mb-6">
          管理
        </h1>
        <div className="w-12 sm:w-14 md:w-16 h-[2px] bg-black dark:bg-white" />
      </header>

      {/* 统计和操作 */}
      <div className="mb-6 sm:mb-8 flex items-center justify-between">
        <p className="text-sm sm:text-base text-black/50 dark:text-white/50">
          {posts.length} 篇文章
        </p>
        <Link
          href="/admin/posts/new"
          className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-full bg-black dark:bg-white text-white dark:text-black text-sm font-medium hover:bg-black/80 dark:hover:bg-white/80 active:bg-black/70 dark:active:bg-white/70 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          新建文章
        </Link>
      </div>

      {/* 筛选和文章列表 */}
      <AdminPostList posts={posts} />
    </div>
  )
}

