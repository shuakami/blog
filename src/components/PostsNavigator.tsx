'use client';

import React, { useEffect, useState } from 'react';

interface PostsNavigatorProps {
  postCount: number;
  postTitles?: string[];
}

export default function PostsNavigator({ postCount, postTitles = [] }: PostsNavigatorProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [showTooltip, setShowTooltip] = useState(false);
  const hoverTimeoutRef = React.useRef<NodeJS.Timeout>(null);

  useEffect(() => {
    const handleScroll = () => {
      // 获取所有文章的 Link 元素
      const articles = document.querySelectorAll('a[data-post-index]');
      if (articles.length === 0) return;

      // 显示导航器（滚动超过 100px）
      setIsVisible(window.scrollY > 100);

      // 找到当前可见的文章
      const scrollPosition = window.scrollY + window.innerHeight / 2;
      
      let currentIndex = 0;
      articles.forEach((article, index) => {
        const rect = article.getBoundingClientRect();
        const top = rect.top + window.scrollY;
        const bottom = top + rect.height;
        
        if (scrollPosition >= top && scrollPosition <= bottom) {
          currentIndex = index;
        }
      });
      
      setActiveIndex(currentIndex);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll(); // 初始调用
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (hoverTimeoutRef.current) {
        clearTimeout(hoverTimeoutRef.current);
      }
    };
  }, []);

  const scrollToPost = (index: number) => {
    const article = document.querySelector(`a[data-post-index="${index}"]`);
    if (article) {
      const top = article.getBoundingClientRect().top + window.scrollY - 100;
      window.scrollTo({ top, behavior: 'smooth' });
    }
  };

  const scrollPrev = () => {
    if (activeIndex > 0) {
      scrollToPost(activeIndex - 1);
    }
  };

  const scrollNext = () => {
    if (activeIndex < postCount - 1) {
      scrollToPost(activeIndex + 1);
    }
  };

  if (!isVisible) return null;

  return (
    <div 
      className="fixed right-8 top-1/2 -translate-y-1/2 z-50 hidden xl:block"
      style={{
        animation: 'slideInRight 0.4s ease-out'
      }}
    >
      <div className="group flex flex-col items-center gap-1">
        {/* 向上按钮 */}
        <button
          onClick={scrollPrev}
          disabled={activeIndex === 0}
          className="inline-flex items-center justify-center w-8 h-8 rounded-full text-black/40 dark:text-white/40 hover:bg-black/5 dark:hover:bg-white/5 disabled:opacity-30 disabled:cursor-not-allowed opacity-0 group-hover:opacity-100 transition-opacity duration-200"
          aria-label="上一篇文章"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M18 15L12 9L6 15" strokeLinecap="square" />
          </svg>
        </button>

        {/* 圆点导航 */}
        <div 
          className="flex flex-col items-center gap-0"
          onMouseLeave={() => {
            if (hoverTimeoutRef.current) {
              clearTimeout(hoverTimeoutRef.current);
            }
            setShowTooltip(false);
            setHoveredIndex(null);
          }}
        >
          {Array.from({ length: postCount }).map((_, index) => {
            const isActive = index === activeIndex;
            const distance = Math.abs(index - activeIndex);
            
            // 根据距离当前项的远近设置大小
            let dotClass = '';
            if (isActive) {
              dotClass = 'w-1 h-1 bg-black dark:bg-white';
            } else if (distance === 1) {
              dotClass = 'w-2 h-0.5 bg-black/30 dark:bg-white/30';
            } else {
              dotClass = 'w-1 h-0.5 bg-black/20 dark:bg-white/20';
            }

            return (
              <button
                key={index}
                onClick={() => scrollToPost(index)}
                onMouseEnter={(e) => {
                  setHoveredIndex(index);
                  
                  // 如果 tooltip 已经显示，立即更新位置
                  if (showTooltip) {
                    return;
                  }
                  
                  // 首次显示需要延迟
                  if (hoverTimeoutRef.current) {
                    clearTimeout(hoverTimeoutRef.current);
                  }
                  hoverTimeoutRef.current = setTimeout(() => {
                    setShowTooltip(true);
                  }, 200);
                }}
                onMouseLeave={() => {
                  // 不立即隐藏，等待可能移动到其他圆点
                }}
                className="relative flex items-center justify-center w-8 h-4 hover:bg-black/5 dark:hover:bg-white/5 rounded transition-colors group/dot"
                aria-label={postTitles[index] || `前往文章 ${index + 1}`}
              >
                <div className={`rounded-full transition-all duration-200 ${dotClass}`} />
              </button>
            );
          })}
        </div>

        {/* 向下按钮 */}
        <button
          onClick={scrollNext}
          disabled={activeIndex === postCount - 1}
          className="inline-flex items-center justify-center w-8 h-8 rounded-full text-black/40 dark:text-white/40 hover:bg-black/5 dark:hover:bg-white/5 disabled:opacity-30 disabled:cursor-not-allowed opacity-0 group-hover:opacity-100 transition-opacity duration-200"
          aria-label="下一篇文章"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M6 9L12 15L18 9" strokeLinecap="square" />
          </svg>
        </button>
      </div>

      {/* 统一的 Tooltip - 跟随 hover 的圆点移动 */}
      <div 
        className="absolute right-full mr-3 px-3 py-1.5 bg-black dark:bg-white text-white dark:text-black text-xs font-medium rounded-md whitespace-nowrap pointer-events-none transition-all duration-150 ease-out"
        style={{
          top: `calc(${40 + (hoveredIndex || 0) * 16}px)`,
          transform: 'translateY(-50%)',
          opacity: showTooltip && hoveredIndex !== null && postTitles[hoveredIndex || 0] ? 1 : 0
        }}
      >
        {hoveredIndex !== null && postTitles[hoveredIndex]}
        {/* 箭头 */}
        <div className="absolute right-[-4px] top-1/2 -translate-y-1/2 w-0 h-0 border-t-[4px] border-t-transparent border-b-[4px] border-b-transparent border-l-[4px] border-l-black dark:border-l-white" />
      </div>

      <style jsx>{`
        @keyframes slideInRight {
          from {
            opacity: 0;
            transform: translateX(20px) translateY(-50%);
          }
          to {
            opacity: 1;
            transform: translateX(0) translateY(-50%);
          }
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
}

