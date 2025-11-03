"use client";

import Link from "next/link";
import { Route } from "next";
import { useState, useEffect } from "react";
import { NAV_ITEMS } from './SideNav';
import { triggerHaptic, HapticFeedback } from '@/utils/haptics';

const HEADER_CLASS = "fixed top-0 left-0 right-0 z-50 bg-white/40 dark:bg-black/40 backdrop-blur-md border-b border-black/5 dark:border-white/10";
const LINK_CLASS = "hover:text-black/60 dark:hover:text-white/60 transition-colors relative after:absolute after:bottom-0 after:left-0 after:right-0 after:h-[1px] after:bg-current after:opacity-0 after:transition-opacity hover:after:opacity-20";

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // 处理菜单打开时的滚动
  useEffect(() => {
    if (isMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isMenuOpen]);

  return (
    <>
      <header className={HEADER_CLASS}>
        <div className="mx-0 px-6 h-16 flex items-center justify-between relative z-50">
          <Link href="/" className={LINK_CLASS} prefetch={true}>
            Shuakami
          </Link>

          {/* 移动端菜单按钮 */}
          <button
            className="w-8 h-8 flex flex-col justify-center items-center gap-1.5 relative z-50"
            onClick={() => {
              triggerHaptic(HapticFeedback.Medium)
              setIsMenuOpen(!isMenuOpen)
            }}
            aria-label={isMenuOpen ? "关闭菜单" : "打开菜单"}
          >
            <span className={`w-5 h-0.5 bg-black dark:bg-white transition-all duration-300 ${
              isMenuOpen ? 'transform rotate-45 translate-y-2' : ''
            }`} />
            <span className={`w-5 h-0.5 bg-black dark:bg-white transition-all duration-300 ${
              isMenuOpen ? 'opacity-0' : ''
            }`} />
            <span className={`w-5 h-0.5 bg-black dark:bg-white transition-all duration-300 ${
              isMenuOpen ? 'transform -rotate-45 -translate-y-2' : ''
            }`} />
          </button>
        </div>

        {/* 移动端菜单 */}
        <div 
          className={`md:hidden fixed inset-0 z-40 transition-all duration-300 ${
            isMenuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
          }`}
        >
          {/* 背景遮罩 */}
          <div className="absolute inset-0 bg-white/90 dark:bg-black/90 backdrop-blur-md" />
          
          {/* 导航内容 */}
          <nav className="relative z-50 flex flex-col pt-24 gap-12 text-2xl px-8">
            {NAV_ITEMS.map(item => (
              <Link
                key={item.path}
                href={item.path as Route}
                className={`${LINK_CLASS} text-black dark:text-white`}
                prefetch={true}
                onClick={() => {
                  triggerHaptic(HapticFeedback.Light)
                  setIsMenuOpen(false)
                }}
              >
                {item.name}
              </Link>
            ))}
          </nav>
        </div>
      </header>

      {/* 背景遮罩 - 用于防止内容提前显示 */}
      {isMenuOpen && (
        <div 
          className="fixed inset-0 z-30 bg-white dark:bg-black" 
          aria-hidden="true"
        />
      )}
    </>
  );
} 