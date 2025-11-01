'use client';

import React, { useEffect, useState } from 'react';

interface Heading {
  id: string;
  text: string;
  level: number;
}

interface PostNavigatorProps {
  headings: Heading[];
}

export default function PostNavigator({ headings }: PostNavigatorProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [showTooltip, setShowTooltip] = useState(false);
  const hoverTimeoutRef = React.useRef<NodeJS.Timeout>(null);

  useEffect(() => {
    const handleScroll = () => {
      // 显示导航器（滚动超过 100px）
      setIsVisible(window.scrollY > 100);

      // 找到当前可见的标题
      const scrollPosition = window.scrollY + 150; // 顶部偏移
      
      let currentIndex = 0;
      for (let i = headings.length - 1; i >= 0; i--) {
        const element = document.getElementById(headings[i].id);
        if (element) {
          const top = element.getBoundingClientRect().top + window.scrollY;
          if (scrollPosition >= top) {
            currentIndex = i;
            break;
          }
        }
      }
      
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
  }, [headings]);

  const scrollToHeading = (index: number) => {
    const heading = headings[index];
    const element = document.getElementById(heading.id);
    if (element) {
      const top = element.getBoundingClientRect().top + window.scrollY - 100;
      window.scrollTo({ top, behavior: 'smooth' });
    }
  };

  const scrollPrev = () => {
    if (activeIndex > 0) {
      scrollToHeading(activeIndex - 1);
    }
  };

  const scrollNext = () => {
    if (activeIndex < headings.length - 1) {
      scrollToHeading(activeIndex + 1);
    }
  };

  if (!isVisible || headings.length === 0) return null;

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
          aria-label="上一个标题"
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
          {headings.map((heading, index) => {
            const isActive = index === activeIndex;
            const distance = Math.abs(index - activeIndex);
            
            // 根据标题层级和距离设置大小
            let dotClass = '';
            if (isActive) {
              // 当前标题 - 根据层级调整大小
              if (heading.level === 1) {
                dotClass = 'w-1.5 h-1.5 bg-black dark:bg-white';
              } else if (heading.level === 2) {
                dotClass = 'w-1 h-1 bg-black dark:bg-white';
              } else {
                dotClass = 'w-1 h-1 bg-black dark:bg-white';
              }
            } else if (distance === 1) {
              dotClass = 'w-2 h-0.5 bg-black/30 dark:bg-white/30';
            } else {
              dotClass = 'w-1 h-0.5 bg-black/20 dark:bg-white/20';
            }

            return (
              <button
                key={heading.id}
                onClick={() => scrollToHeading(index)}
                onMouseEnter={() => {
                  setHoveredIndex(index);
                  
                  if (showTooltip) {
                    return;
                  }
                  
                  if (hoverTimeoutRef.current) {
                    clearTimeout(hoverTimeoutRef.current);
                  }
                  hoverTimeoutRef.current = setTimeout(() => {
                    setShowTooltip(true);
                  }, 200);
                }}
                className="relative flex items-center justify-center w-8 h-4 hover:bg-black/5 dark:hover:bg-white/5 rounded transition-colors group/dot"
                aria-label={heading.text}
                style={{
                  // 根据标题层级添加左侧缩进效果（通过调整圆点位置）
                  paddingLeft: heading.level > 2 ? `${(heading.level - 2) * 2}px` : '0'
                }}
              >
                <div className={`rounded-full transition-all duration-200 ${dotClass}`} />
              </button>
            );
          })}
        </div>

        {/* 向下按钮 */}
        <button
          onClick={scrollNext}
          disabled={activeIndex === headings.length - 1}
          className="inline-flex items-center justify-center w-8 h-8 rounded-full text-black/40 dark:text-white/40 hover:bg-black/5 dark:hover:bg-white/5 disabled:opacity-30 disabled:cursor-not-allowed opacity-0 group-hover:opacity-100 transition-opacity duration-200"
          aria-label="下一个标题"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M6 9L12 15L18 9" strokeLinecap="square" />
          </svg>
        </button>
      </div>

      {/* 统一的 Tooltip - 跟随 hover 的圆点移动 */}
      <div 
        className="absolute right-full mr-3 px-3 py-1.5 bg-black dark:bg-white text-white dark:text-black text-xs font-medium rounded-md whitespace-nowrap pointer-events-none transition-all duration-150 ease-out max-w-xs truncate"
        style={{
          top: `calc(${40 + (hoveredIndex || 0) * 16}px)`,
          transform: 'translateY(-50%)',
          opacity: showTooltip && hoveredIndex !== null ? 1 : 0
        }}
      >
        {hoveredIndex !== null && headings[hoveredIndex]?.text}
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
      `}</style>
    </div>
  );
}

