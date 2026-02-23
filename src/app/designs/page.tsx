'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import designsData from './designs-data.json';

interface Design {
  id: string;
  url: string;
  type: string;
  mood: string;
  styles: string[];
  tags: string[];
  quality: number;
  highlights: string[];
  user: string;
  user_name: string;
}

export default function DesignsPage() {
  const router = useRouter();
  const allDesigns: Design[] = designsData as Design[];

  const [entered, setEntered] = useState(false);
  const [selected, setSelected] = useState<Design | null>(null);
  const [exiting, setExiting] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const [prevIndex, setPrevIndex] = useState<number | null>(null);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [filter, setFilter] = useState<string | null>(null);
  const [showCategories, setShowCategories] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [flippedId, setFlippedId] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // 入场动画延迟
  useEffect(() => {
    const timer = setTimeout(() => setEntered(true), 50);
    return () => clearTimeout(timer);
  }, []);

  // 筛选后的设计
  const designs = filter
    ? allDesigns.filter(d => d.type === filter || d.styles.includes(filter))
    : allDesigns;

  // 获取所有类型
  const types = [...new Set(allDesigns.map(d => d.type))].filter(Boolean);

  // 切换图片
  const scrollTo = useCallback((index: number, animate = false) => {
    if (isTransitioning || index < 0 || index >= designs.length) return;

    const startIndex = activeIndex;

    const doScroll = (targetIndex: number, shouldAnimate: boolean) => {
      if (shouldAnimate && Math.abs(targetIndex - startIndex) > 1) {
        // 多步动画滚动
        const direction = targetIndex > startIndex ? 1 : -1;
        const steps = Math.abs(targetIndex - startIndex);
        const baseDelay = Math.max(80, 200 - steps * 15);

        setIsTransitioning(true);

        let currentStep = 0;
        const animateStep = () => {
          currentStep++;
          const newIndex = startIndex + (direction * currentStep);
          setActiveIndex(newIndex);

          if (currentStep < steps) {
            const delay = baseDelay * (1 - (currentStep / steps) * 0.5);
            setTimeout(animateStep, delay);
          } else {
            setTimeout(() => setIsTransitioning(false), 150);
          }
        };

        animateStep();
      } else {
        // 单步切换
        setIsTransitioning(true);
        setActiveIndex(targetIndex);
        setTimeout(() => setIsTransitioning(false), 250);
      }
    };

    doScroll(index, animate);
  }, [isTransitioning, designs, activeIndex]);

  // 滚轮控制
  useEffect(() => {
    let lastScroll = 0;
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      const now = Date.now();
      if (now - lastScroll < 200) return;
      lastScroll = now;

      if (e.deltaY > 0) scrollTo(activeIndex + 1);
      else scrollTo(activeIndex - 1);
    };
    window.addEventListener('wheel', onWheel, { passive: false });
    return () => window.removeEventListener('wheel', onWheel);
  }, [activeIndex, scrollTo]);

  // 触摸滑动控制（移动端）
  useEffect(() => {
    let touchStartY = 0;
    let touchEndY = 0;

    const onTouchStart = (e: TouchEvent) => {
      touchStartY = e.touches[0].clientY;
    };

    const onTouchEnd = (e: TouchEvent) => {
      touchEndY = e.changedTouches[0].clientY;
      const diff = touchStartY - touchEndY;

      if (Math.abs(diff) > 50) {
        if (diff > 0) scrollTo(activeIndex + 1);
        else scrollTo(activeIndex - 1);
      }
    };

    window.addEventListener('touchstart', onTouchStart, { passive: true });
    window.addEventListener('touchend', onTouchEnd, { passive: true });
    return () => {
      window.removeEventListener('touchstart', onTouchStart);
      window.removeEventListener('touchend', onTouchEnd);
    };
  }, [activeIndex, scrollTo]);

  // 键盘控制
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') scrollTo(activeIndex + 1);
      if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') scrollTo(activeIndex - 1);
      if (e.key === 'Enter') setSelected(designs[activeIndex]);
      if (e.key === 'Escape') setSelected(null);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [activeIndex, scrollTo, designs]);

  useEffect(() => {
    document.documentElement.classList.add('dark-scrollbar');
    document.documentElement.classList.add('hide-top-bar');
    return () => {
      document.documentElement.classList.remove('dark-scrollbar');
      document.documentElement.classList.remove('hide-top-bar');
    };
  }, []);

  const exit = (e: React.MouseEvent) => {
    e.preventDefault();
    setExiting(true);
    localStorage.setItem('sidebar-open', 'false');
    setTimeout(() => router.push('/'), 500);
  };

  const current = designs[activeIndex];

  return (
    <motion.div
      ref={containerRef}
      className="fullscreen-page fixed inset-0 overflow-hidden"
      style={{ background: '#000' }}
      initial={{ opacity: 0 }}
      animate={{ opacity: exiting ? 0 : 1 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
    >
      {/* 主图 - 翻转卡片 */}
      <motion.div
        className="absolute inset-0 flex items-center justify-center p-4 md:p-20"
        style={{ perspective: 2000 }}
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: entered ? 1 : 0, y: entered ? 0 : 40 }}
        transition={{ duration: 0.8, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
      >
        {designs.map((d, i) => {
          const isActive = i === activeIndex;
          const isPrev = i === activeIndex - 1;
          const isNext = i === activeIndex + 1;
          const wasActive = prevIndex !== null && i === prevIndex;
          const shouldRender = isActive || isPrev || isNext || wasActive;

          if (!shouldRender) return null;

          return (
            <motion.div
              key={d.id}
              className="absolute cursor-pointer"
              initial={{ opacity: 0, scale: 0.95, y: 30 }}
              animate={{
                opacity: isActive ? 1 : 0,
                scale: isActive ? 1 : 0.95,
                y: isActive ? 0 : isPrev || wasActive ? -30 : 30,
              }}
              transition={{
                duration: 0.9,
                ease: [0.32, 0.72, 0, 1],
              }}
              style={{
                zIndex: isActive ? 2 : 1,
                pointerEvents: isActive ? 'auto' : 'none',
                perspective: 2000,
              }}
            >
              {/* 翻转容器 - 独立动画 */}
              <motion.div
                animate={{ rotateY: flippedId === d.id ? 180 : 0 }}
                transition={{ duration: 0.9, ease: [0.32, 0.72, 0, 1] }}
                onClick={() => isActive && setFlippedId(flippedId === d.id ? null : d.id)}
                style={{ transformStyle: 'preserve-3d' }}
              >
                {/* 正面 - 图片 */}
                <img
                  src={d.url}
                  alt=""
                  className="max-w-[calc(100vw-2rem)] md:max-w-full max-h-[50vh] md:max-h-[70vh] object-contain"
                  draggable={false}
                  style={{ backfaceVisibility: 'hidden' }}
                />

                {/* 背面 - 详情 */}
                <div
                  className="absolute inset-0 flex items-center justify-center"
                  style={{
                    backfaceVisibility: 'hidden',
                    transform: 'rotateY(180deg)',
                  }}
                >
                <div className="bg-neutral-900 rounded-lg p-6 md:p-12 max-w-lg w-full h-full flex flex-col justify-center">
                  <div className="text-white text-xl md:text-2xl font-light mb-3 md:mb-4">{d.type}</div>
                  <div className="text-white/40 text-xs md:text-sm mb-4 md:mb-6">{d.mood} · @{d.user_name}</div>

                  {d.highlights.length > 0 && (
                    <div className="mb-4 md:mb-6">
                      {d.highlights.map((h, idx) => (
                        <p key={idx} className="text-white/60 text-xs md:text-sm leading-relaxed mb-2">{h}</p>
                      ))}
                    </div>
                  )}

                  {d.styles.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 md:gap-2">
                      {d.styles.map(s => (
                        <span key={s} className="px-2 md:px-3 py-0.5 md:py-1 rounded-full bg-white/10 text-white/50 text-[10px] md:text-xs">
                          {s}
                        </span>
                      ))}
                    </div>
                  )}

                  <div className="mt-6 md:mt-8 text-white/20 text-[10px] md:text-xs">点击翻回</div>
                </div>
              </div>
              </motion.div>
            </motion.div>
          );
        })}
      </motion.div>

      {/* 左侧信息 - 移动端隐藏 */}
      <motion.div
        className="hidden md:block absolute left-8 md:left-12 top-1/2 -translate-y-1/2 z-10"
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: entered ? 1 : 0, x: entered ? 0 : -20 }}
        transition={{ duration: 0.6, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
      >
        <motion.div
          key={current.id}
          initial={false}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, ease: [0.32, 0.72, 0, 1] }}
        >
          <motion.div
            className="text-white/80 text-lg md:text-xl font-light"
            key={`type-${current.id}`}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            {current.type}
          </motion.div>
          <motion.div
            className="text-white/30 text-sm mt-2"
            key={`mood-${current.id}`}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.15 }}
          >
            {current.mood}
          </motion.div>
          {current.quality >= 9 && (
            <motion.div
              className="mt-4 w-1 h-8 bg-white/40"
              initial={{ scaleY: 0 }}
              animate={{ scaleY: 1 }}
              transition={{ duration: 0.4, delay: 0.2 }}
              style={{ originY: 0 }}
            />
          )}
        </motion.div>
      </motion.div>

      {/* 右侧缩略图列表 - 移动端隐藏 */}
      <motion.div
        className="hidden md:block absolute right-6 md:right-10 top-1/2 z-10"
        style={{ transform: 'translateY(-50%)' }}
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: entered ? 1 : 0, x: entered ? 0 : 20 }}
        transition={{ duration: 0.6, delay: 0.4, ease: [0.22, 1, 0.36, 1] }}
      >
        <div className="relative h-[250px] w-[80px] overflow-hidden">
          <motion.div
            className="absolute flex flex-col gap-3 items-end right-0"
            animate={{ y: -activeIndex * 50 }}
            transition={{ duration: 0.5, ease: [0.32, 0.72, 0, 1] }}
            style={{ top: 95 }}
          >
            {designs.map((d, i) => {
              const isActive = i === activeIndex;
              return (
                <motion.div
                  key={d.id}
                  className="cursor-pointer overflow-hidden rounded-sm flex-shrink-0"
                  animate={{
                    width: isActive ? 80 : 50,
                    height: isActive ? 60 : 38,
                    opacity: isActive ? 1 : 0.4,
                  }}
                  transition={{ duration: 0.4, ease: [0.32, 0.72, 0, 1] }}
                  onClick={() => scrollTo(i, true)}
                  whileHover={{ opacity: 0.8 }}
                >
                  <img
                    src={d.url}
                    alt=""
                    className="w-full h-full object-cover"
                    draggable={false}
                  />
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </motion.div>

      {/* 顶部 */}
      <motion.div
        className="absolute top-4 left-4 md:top-8 md:left-12 z-20"
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: entered ? 1 : 0, x: entered ? 0 : -20 }}
        transition={{ duration: 0.6, delay: 0.5, ease: [0.22, 1, 0.36, 1] }}
      >
        <a
          href="/"
          onClick={exit}
          className="text-white/40 hover:text-white transition-colors duration-300"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M19 12H5M12 19l-7-7 7-7"/>
          </svg>
        </a>
      </motion.div>

      {/* 左下角分类按钮 + 随机按钮 */}
      <motion.div
        className="absolute bottom-4 left-4 md:bottom-8 md:left-12 z-20 flex items-center gap-3 md:gap-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: entered ? 1 : 0, y: entered ? 0 : 20 }}
        transition={{ duration: 0.6, delay: 0.6, ease: [0.22, 1, 0.36, 1] }}
      >
        <button
          className="text-white/30 hover:text-white transition-colors text-[10px] md:text-[12px] uppercase tracking-[0.2em]"
          onClick={() => setShowCategories(true)}
        >
          {filter || 'All'}
        </button>
        <button
          className="text-white/20 hover:text-white transition-colors"
          onClick={() => {
            setShowSearch(true);
            setTimeout(() => searchInputRef.current?.focus(), 100);
          }}
          title="搜索"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <circle cx="11" cy="11" r="8"/>
            <path d="M21 21l-4.35-4.35"/>
          </svg>
        </button>
        <button
          className="text-white/20 hover:text-white transition-colors"
          onClick={() => {
            if (isTransitioning) return;
            const randomIdx = Math.floor(Math.random() * designs.length);
            setPrevIndex(activeIndex);
            setIsTransitioning(true);
            setActiveIndex(randomIdx);
            setTimeout(() => {
              setIsTransitioning(false);
              setPrevIndex(null);
            }, 900);
          }}
          title="随机"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M16 3h5v5M4 20L21 3M21 16v5h-5M15 15l6 6M4 4l5 5"/>
          </svg>
        </button>
      </motion.div>

      {/* 全屏分类选择 */}
      <AnimatePresence>
        {showCategories && (
          <motion.div
            className="fixed inset-0 z-[400] flex items-center justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
          >
            <div
              className="absolute inset-0 bg-black"
              style={{ opacity: 0.97 }}
              onClick={() => setShowCategories(false)}
            />

            <div className="relative z-10 w-full h-full flex items-center justify-center overflow-hidden px-4 md:px-16">
              <div className="flex flex-wrap justify-center items-center gap-x-6 md:gap-x-20 gap-y-4 md:gap-y-10 max-w-6xl">
                <div className="group relative">
                  <button
                    onClick={() => { setFilter(null); setActiveIndex(0); setShowCategories(false); }}
                  >
                    <span className={`text-3xl md:text-7xl lg:text-8xl font-extralight tracking-tighter transition-all duration-500 ${
                      !filter ? 'text-white' : 'text-white/15 group-hover:text-white/50'
                    }`}>
                      All
                    </span>
                  </button>
                  <span className={`absolute -top-1 -right-4 md:-top-2 md:-right-6 text-[10px] md:text-xs transition-all duration-500 ${
                    !filter ? 'text-white/50' : 'text-white/20'
                  }`}>
                    {allDesigns.length}
                  </span>
                </div>

                {types.map((t) => {
                  const typeDesigns = allDesigns.filter(d => d.type === t);
                  const count = typeDesigns.length;
                  return (
                    <div key={t} className="group relative">
                      <button
                        onClick={() => { setFilter(t); setActiveIndex(0); setShowCategories(false); }}
                      >
                        <span className={`text-3xl md:text-7xl lg:text-8xl font-extralight tracking-tighter transition-all duration-500 ${
                          filter === t ? 'text-white' : 'text-white/15 group-hover:text-white/50'
                        }`}>
                          {t}
                        </span>
                      </button>
                      <span className={`absolute -top-1 -right-4 md:-top-2 md:-right-6 text-[10px] md:text-xs transition-all duration-500 ${
                        filter === t ? 'text-white/50' : 'text-white/20'
                      }`}>
                        {count}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            <button
              className="absolute top-4 right-4 md:top-8 md:right-8 z-20 text-white/20 hover:text-white transition-colors duration-300"
              onClick={() => setShowCategories(false)}
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" className="md:w-7 md:h-7">
                <path d="M18 6L6 18M6 6l12 12"/>
              </svg>
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 搜索模态框 */}
      <AnimatePresence>
        {showSearch && (
          <motion.div
            className="fixed inset-0 z-[400] flex flex-col"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div
              className="absolute inset-0 bg-black"
              style={{ opacity: 0.97 }}
              onClick={() => { setShowSearch(false); setSearchQuery(''); }}
            />

            <div className="relative z-10 flex flex-col h-full">
              {/* 搜索输入框 */}
              <div className="flex items-center justify-center pt-20 md:pt-32 px-4">
                <div className="relative w-full max-w-2xl">
                  <input
                    ref={searchInputRef}
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="搜索类型、风格、标签..."
                    className="w-full bg-transparent border-b border-white/20 focus:border-white/50 outline-none text-white text-2xl md:text-4xl font-light py-4 placeholder:text-white/20 transition-colors"
                  />
                  {searchQuery && (
                    <button
                      className="absolute right-0 top-1/2 -translate-y-1/2 text-white/30 hover:text-white transition-colors"
                      onClick={() => setSearchQuery('')}
                    >
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                        <path d="M18 6L6 18M6 6l12 12"/>
                      </svg>
                    </button>
                  )}
                </div>
              </div>

              {/* 搜索结果 */}
              <div className="flex-1 overflow-auto px-4 py-8">
                <div className="max-w-4xl mx-auto">
                  {searchQuery.length > 0 && (() => {
                    const query = searchQuery.toLowerCase();
                    const results = allDesigns.filter(d =>
                      d.type?.toLowerCase().includes(query) ||
                      d.mood?.toLowerCase().includes(query) ||
                      d.styles?.some(s => s.toLowerCase().includes(query)) ||
                      d.tags?.some(t => t.toLowerCase().includes(query)) ||
                      d.highlights?.some(h => h.toLowerCase().includes(query)) ||
                      d.user_name?.toLowerCase().includes(query)
                    );

                    if (results.length === 0) {
                      return (
                        <div className="text-center text-white/30 text-lg py-20">
                          没有找到相关设计
                        </div>
                      );
                    }

                    return (
                      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
                        {results.slice(0, 20).map((d) => {
                          const idx = designs.findIndex(design => design.id === d.id);
                          return (
                            <motion.div
                              key={d.id}
                              className="cursor-pointer group"
                              initial={{ opacity: 0, y: 20 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ duration: 0.3 }}
                              onClick={() => {
                                if (idx !== -1) {
                                  setActiveIndex(idx);
                                  setShowSearch(false);
                                  setSearchQuery('');
                                } else {
                                  setFilter(null);
                                  const allIdx = allDesigns.findIndex(design => design.id === d.id);
                                  if (allIdx !== -1) {
                                    setActiveIndex(allIdx);
                                  }
                                  setShowSearch(false);
                                  setSearchQuery('');
                                }
                              }}
                            >
                              <div className="aspect-[4/3] overflow-hidden rounded-sm mb-2">
                                <img
                                  src={d.url}
                                  alt=""
                                  className="w-full h-full object-cover opacity-60 group-hover:opacity-100 group-hover:scale-105 transition-all duration-300"
                                />
                              </div>
                              <div className="text-white/50 text-xs group-hover:text-white/80 transition-colors truncate">
                                {d.type}
                              </div>
                              <div className="text-white/30 text-[10px] truncate">
                                @{d.user_name}
                              </div>
                            </motion.div>
                          );
                        })}
                      </div>
                    );
                  })()}

                  {searchQuery.length === 0 && (
                    <div className="text-center text-white/20 text-sm py-20">
                      输入关键词搜索设计
                    </div>
                  )}
                </div>
              </div>
            </div>

            <button
              className="absolute top-4 right-4 md:top-8 md:right-8 z-20 text-white/20 hover:text-white transition-colors duration-300"
              onClick={() => { setShowSearch(false); setSearchQuery(''); }}
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" className="md:w-7 md:h-7">
                <path d="M18 6L6 18M6 6l12 12"/>
              </svg>
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div
        className="absolute top-4 right-4 md:top-8 md:right-12 z-20 text-white/30 text-xs md:text-sm tabular-nums"
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: entered ? 1 : 0, x: entered ? 0 : 20 }}
        transition={{ duration: 0.6, delay: 0.5, ease: [0.22, 1, 0.36, 1] }}
      >
        <motion.span
          key={`${filter}-${activeIndex}`}
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          {String(activeIndex + 1).padStart(3, '0')}
        </motion.span>
        {' / '}
        {String(designs.length).padStart(3, '0')}
      </motion.div>

      {/* 详情弹窗 - 已移除，改用翻转 */}
    </motion.div>
  );
}
