'use client';

import React, { useEffect, useState } from 'react';

interface GamesNavigatorProps {
  gameCount: number;
  gameTitles?: string[];
}

export default function GamesNavigator({ gameCount, gameTitles = [] }: GamesNavigatorProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [showTooltip, setShowTooltip] = useState(false);
  const hoverTimeoutRef = React.useRef<NodeJS.Timeout>(null);

  useEffect(() => {
    const handleScroll = () => {
      const articles = document.querySelectorAll('article[data-game-index]');
      if (articles.length === 0) return;

      setIsVisible(window.scrollY > 100);

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
    handleScroll();
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (hoverTimeoutRef.current) {
        clearTimeout(hoverTimeoutRef.current);
      }
    };
  }, []);

  const scrollToGame = (index: number) => {
    const article = document.querySelector(`article[data-game-index="${index}"]`);
    if (article) {
      const top = article.getBoundingClientRect().top + window.scrollY - 100;
      window.scrollTo({ top, behavior: 'smooth' });
    }
  };

  const scrollPrev = () => {
    if (activeIndex > 0) {
      scrollToGame(activeIndex - 1);
    }
  };

  const scrollNext = () => {
    if (activeIndex < gameCount - 1) {
      scrollToGame(activeIndex + 1);
    }
  };

  if (!isVisible || gameCount <= 1) return null;

  return (
    <div 
      className="fixed right-8 top-1/2 -translate-y-1/2 z-50 hidden xl:block"
      style={{ animation: 'slideInRight 0.4s ease-out' }}
    >
      <div className="group flex flex-col items-center gap-1">
        <button
          onClick={scrollPrev}
          disabled={activeIndex === 0}
          className="inline-flex items-center justify-center w-8 h-8 rounded-full text-black/40 dark:text-white/40 hover:bg-black/5 dark:hover:bg-white/5 disabled:opacity-30 disabled:cursor-not-allowed opacity-0 group-hover:opacity-100 transition-opacity duration-200"
          aria-label="上一个游戏"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M18 15L12 9L6 15" strokeLinecap="square" />
          </svg>
        </button>

        <div 
          className="flex flex-col items-center gap-0"
          onMouseLeave={() => {
            if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
            setShowTooltip(false);
            setHoveredIndex(null);
          }}
        >
          {Array.from({ length: gameCount }).map((_, index) => {
            const isActive = index === activeIndex;
            const distance = Math.abs(index - activeIndex);
            
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
                onClick={() => scrollToGame(index)}
                onMouseEnter={() => {
                  setHoveredIndex(index);
                  if (showTooltip) return;
                  if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
                  hoverTimeoutRef.current = setTimeout(() => setShowTooltip(true), 200);
                }}
                className="relative flex items-center justify-center w-8 h-4 hover:bg-black/5 dark:hover:bg-white/5 rounded transition-colors"
                aria-label={gameTitles[index] || `前往游戏 ${index + 1}`}
              >
                <div className={`rounded-full transition-all duration-200 ${dotClass}`} />
              </button>
            );
          })}
        </div>

        <button
          onClick={scrollNext}
          disabled={activeIndex === gameCount - 1}
          className="inline-flex items-center justify-center w-8 h-8 rounded-full text-black/40 dark:text-white/40 hover:bg-black/5 dark:hover:bg-white/5 disabled:opacity-30 disabled:cursor-not-allowed opacity-0 group-hover:opacity-100 transition-opacity duration-200"
          aria-label="下一个游戏"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M6 9L12 15L18 9" strokeLinecap="square" />
          </svg>
        </button>
      </div>

      <div 
        className="absolute right-full mr-3 px-3 py-1.5 bg-black dark:bg-white text-white dark:text-black text-xs font-medium rounded-md whitespace-nowrap pointer-events-none transition-all duration-150 ease-out"
        style={{
          top: `calc(${40 + (hoveredIndex || 0) * 16}px)`,
          transform: 'translateY(-50%)',
          opacity: showTooltip && hoveredIndex !== null && gameTitles[hoveredIndex || 0] ? 1 : 0
        }}
      >
        {hoveredIndex !== null && gameTitles[hoveredIndex]}
        <div className="absolute right-[-4px] top-1/2 -translate-y-1/2 w-0 h-0 border-t-[4px] border-t-transparent border-b-[4px] border-b-transparent border-l-[4px] border-l-black dark:border-l-white" />
      </div>

      <style jsx>{`
        @keyframes slideInRight {
          from { opacity: 0; transform: translateX(20px) translateY(-50%); }
          to { opacity: 1; transform: translateX(0) translateY(-50%); }
        }
      `}</style>
    </div>
  );
}
