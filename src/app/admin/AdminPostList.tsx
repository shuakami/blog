'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import PostsNavigator from '@/components/PostsNavigator'
import { SimpleDropdown, SimpleDropdownItem } from '@/components/ui/simple-dropdown'

interface Post {
  slug: string
  title: string
  excerpt?: string
  tags?: string[]
  date: string
}

interface AdminPostListProps {
  posts: Post[]
}

export default function AdminPostList({ posts }: AdminPostListProps) {
  const [selectedTag, setSelectedTag] = useState<string>('全部')
  const [selectedMonth, setSelectedMonth] = useState<string>('全部')

  // 提取所有唯一标签（不包含"全部"）
  const allTags = useMemo(() => {
    const tagSet = new Set<string>()
    posts.forEach(post => {
      post.tags?.forEach(tag => tagSet.add(tag))
    })
    return Array.from(tagSet).sort()
  }, [posts])

  // 提取所有月份
  const allMonths = useMemo(() => {
    const monthSet = new Set<string>()
    posts.forEach(post => {
      const date = new Date(post.date)
      const yearMonth = `${date.getFullYear()}.${String(date.getMonth() + 1).padStart(2, '0')}`
      monthSet.add(yearMonth)
    })
    return ['全部', ...Array.from(monthSet).sort().reverse()] // 最新的月份在前
  }, [posts])

  // 根据选中的标签和月份筛选文章
  const filteredPosts = useMemo(() => {
    let filtered = [...posts]
    
    // 按标签筛选
    if (selectedTag !== '全部') {
      filtered = filtered.filter(post => post.tags?.includes(selectedTag))
    }
    
    // 按月份筛选
    if (selectedMonth !== '全部') {
      filtered = filtered.filter(post => {
        const date = new Date(post.date)
        const yearMonth = `${date.getFullYear()}.${String(date.getMonth() + 1).padStart(2, '0')}`
        return yearMonth === selectedMonth
      })
    }
    
    // 按时间排序（最新的在前）
    filtered.sort((a, b) => {
      const dateA = new Date(a.date).getTime()
      const dateB = new Date(b.date).getTime()
      return dateB - dateA
    })
    
    return filtered
  }, [posts, selectedTag, selectedMonth])

  return (
    <>
      {/* 筛选按钮 */}
      <div className="mb-8 sm:mb-10 md:mb-12">
        <div className="flex flex-wrap gap-2 items-center">
          {/* 全部按钮（带月份下拉） */}
          <SimpleDropdown
            trigger={
              <button
                className={`inline-flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 text-sm rounded-full transition-colors ${
                  selectedTag === '全部'
                    ? 'bg-black dark:bg-white text-white dark:text-black'
                    : 'bg-black/5 dark:bg-white/5 text-black/60 dark:text-white/60 hover:bg-black/10 dark:hover:bg-white/10 hover:text-black dark:hover:text-white'
                }`}
              >
                <span>{selectedMonth}</span>
                <svg 
                  className="w-3 h-3 transition-transform" 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
            }
            className="w-48"
          >
            {allMonths.map((month) => (
              <SimpleDropdownItem
                key={month}
                active={selectedMonth === month}
                onClick={() => {
                  setSelectedMonth(month)
                  setSelectedTag('全部')
                }}
              >
                <span>{month}</span>
                {month !== '全部' && (
                  <span className="text-xs text-black/40 dark:text-white/40">
                    {posts.filter(p => {
                      const date = new Date(p.date)
                      const yearMonth = `${date.getFullYear()}.${String(date.getMonth() + 1).padStart(2, '0')}`
                      return yearMonth === month
                    }).length}
                  </span>
                )}
              </SimpleDropdownItem>
            ))}
          </SimpleDropdown>

          {/* 标签按钮 */}
          {allTags.map((tag) => (
            <button
              key={tag}
              onClick={() => {
                setSelectedTag(tag)
                setSelectedMonth('全部') // 选择标签时重置月份筛选
              }}
              className={`px-3 sm:px-4 py-1.5 sm:py-2 text-sm rounded-full transition-colors ${
                selectedTag === tag
                  ? 'bg-black dark:bg-white text-white dark:text-black'
                  : 'bg-black/5 dark:bg-white/5 text-black/60 dark:text-white/60 hover:bg-black/10 dark:hover:bg-white/10 hover:text-black dark:hover:text-white'
              }`}
            >
              {tag}
              <span className="ml-1.5 text-xs opacity-60">
                {posts.filter(p => p.tags?.includes(tag)).length}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* 文章列表 */}
      <div>
        {filteredPosts.length === 0 ? (
          <div className="py-16 text-center">
            <p className="text-black/40 dark:text-white/40">
              {selectedTag === '全部' && selectedMonth === '全部' 
                ? '还没有文章' 
                : `没有符合筛选条件的文章`}
            </p>
          </div>
        ) : (
          filteredPosts.map((post, index) => (
            <Link
              key={post.slug}
              href={`/admin/posts/${post.slug}`}
              data-post-index={index}
              className="group block py-6 sm:py-8 md:py-10 border-b border-black/5 dark:border-white/5 last:border-0 hover:bg-black/[0.01] dark:hover:bg-white/[0.01] -mx-2 px-2 sm:-mx-4 sm:px-4 transition-colors"
            >
              <h2 className="text-xl sm:text-2xl md:text-3xl font-medium text-black dark:text-white mb-2 sm:mb-3 group-hover:text-black/60 dark:group-hover:text-white/60 transition-colors leading-tight">
                {post.title}
              </h2>

              {post.excerpt && (
                <p className="text-sm sm:text-base text-black/50 dark:text-white/50 leading-relaxed line-clamp-2 mb-2">
                  {post.excerpt}
                </p>
              )}

              {post.tags && post.tags.length > 0 && (
                <div className="flex items-center gap-2 text-xs sm:text-sm text-black/40 dark:text-white/40">
                  <span>{post.tags.join(', ')}</span>
                </div>
              )}
            </Link>
          ))
        )}
      </div>

      {/* 右侧导航光刻标 */}
      <PostsNavigator 
        postCount={filteredPosts.length}
        postTitles={filteredPosts.map(post => post.title)}
      />
    </>
  )
}

