'use client';

import { useState } from 'react';
import type { Post } from '@/types/post';

interface SearchAndFilterProps {
  posts: Post[];
  onFilter: (filteredPosts: Post[]) => void;
}

// 预定义的标签列表
const PREDEFINED_TAGS = [
  '经验分享',
  '生活日志',
  '杂谈',
  '随笔',
  '无标签'
];

export default function SearchAndFilter({ posts, onFilter }: SearchAndFilterProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTag, setSelectedTag] = useState<string>('');

  // 处理搜索和筛选
  const handleFilter = (query: string, tag: string) => {
    const filtered = posts.filter(post => {
      const matchesSearch = query === '' || 
        post.title.toLowerCase().includes(query.toLowerCase()) ||
        post.excerpt?.toLowerCase().includes(query.toLowerCase());
      
      // 标签匹配逻辑
      let matchesTag = true;
      if (tag !== '') {
        if (tag === '无标签') {
          // 如果选择了"无标签"，匹配：
          // 1. 没有tags属性
          // 2. tags为空数组
          // 3. tags中没有预定义标签
          matchesTag = !post.tags || 
                      post.tags.length === 0 || 
                      !post.tags.some(t => PREDEFINED_TAGS.includes(t));
        } else {
          // 其他标签正常匹配
          matchesTag = post.tags?.includes(tag) || false;
        }
      }
      
      return matchesSearch && matchesTag;
    });
    
    onFilter(filtered);
  };

  // 处理搜索输入
  const handleSearch = (value: string) => {
    setSearchQuery(value);
    handleFilter(value, selectedTag);
  };

  // 处理标签选择
  const handleTagSelect = (tag: string) => {
    setSelectedTag(tag === selectedTag ? '' : tag);
    handleFilter(searchQuery, tag === selectedTag ? '' : tag);
  };

  return (
    <div className="space-y-6">
      {/* 搜索框 */}
      <div className="relative">
        <input
          type="text"
          placeholder="搜索文章..."
          value={searchQuery}
          onChange={(e) => handleSearch(e.target.value)}
          className="w-full px-4 py-2 bg-white/40 dark:bg-black/40 
            backdrop-blur-md
            border border-black/5 dark:border-white/10
            rounded-lg
            text-black dark:text-white
            placeholder-black/40 dark:placeholder-white/40
            focus:outline-none focus:border-black/10 dark:focus:border-white/20"
        />
        <svg
          className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-black/40 dark:text-white/40"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>
      </div>

      {/* 标签筛选 */}
      <div className="flex flex-wrap gap-2">
        {PREDEFINED_TAGS.map((tag) => (
          <button
            key={tag}
            onClick={() => handleTagSelect(tag)}
            className={`px-3 py-1 text-sm rounded-full transition-all duration-200
              ${selectedTag === tag
                ? 'bg-black/10 dark:bg-white/10 text-black dark:text-white'
                : 'bg-black/[0.03] dark:bg-white/[0.03] text-black/60 dark:text-white/60 hover:bg-black/[0.05] dark:hover:bg-white/[0.05]'
              }`}
          >
            {tag}
          </button>
        ))}
      </div>
    </div>
  );
} 