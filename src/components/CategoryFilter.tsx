'use client'

import { useState, useMemo } from 'react'

interface CategoryFilterProps {
  posts: any[]
  onFilterChange: (category: string | null) => void
}

export function CategoryFilter({ posts, onFilterChange }: CategoryFilterProps) {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)

  // 统计每个分类的文章数量
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = {}
    
    posts.forEach(post => {
      // 优先使用 category，回退到 tags[0]（兼容旧数据）
      const category = post.category || post.tags?.[0]
      if (category) {
        counts[category] = (counts[category] || 0) + 1
      }
    })
    
    // 按文章数量排序
    return Object.entries(counts).sort((a, b) => b[1] - a[1])
  }, [posts])

  const handleCategoryClick = (category: string | null) => {
    setSelectedCategory(category)
    onFilterChange(category)
  }

  return (
    <div className="flex flex-wrap items-center gap-2 mb-12">
      {/* 全部标签 */}
      <button
        onClick={() => handleCategoryClick(null)}
        className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm transition-colors cursor-pointer ${
          selectedCategory === null
            ? 'bg-black text-white dark:bg-white dark:text-black'
            : 'bg-black/[0.04] dark:bg-white/[0.06] text-black/60 dark:text-white/60 hover:bg-black/[0.08] dark:hover:bg-white/[0.12] hover:text-black dark:hover:text-white'
        }`}
      >
        <span>全部</span>
        <span className="opacity-50">{posts.length}</span>
      </button>

      {/* 分隔线 */}
      {categoryCounts.length > 0 && (
        <div className="w-px h-4 bg-black/10 dark:bg-white/10" />
      )}

      {/* 分类标签 */}
      {categoryCounts.map(([category, count]) => (
        <button
          key={category}
          onClick={() => handleCategoryClick(category)}
          className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm transition-colors cursor-pointer ${
            selectedCategory === category
              ? 'bg-black text-white dark:bg-white dark:text-black'
              : 'bg-black/[0.04] dark:bg-white/[0.06] text-black/60 dark:text-white/60 hover:bg-black/[0.08] dark:hover:bg-white/[0.12] hover:text-black dark:hover:text-white'
          }`}
        >
          <span>{category}</span>
          <span className="opacity-50">{count}</span>
        </button>
      ))}
    </div>
  )
}

