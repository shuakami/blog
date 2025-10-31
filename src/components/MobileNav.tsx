"use client";

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Route } from 'next';
import { NAV_ITEMS } from './SideNav';

export default function MobileNav() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* 顶部导航栏 */}
      <div className="bg-white/40 dark:bg-black/40 backdrop-blur-md border-b border-black/5 dark:border-white/10">
        <div className="flex items-center justify-between px-6 h-[72px]">
          {/* 头像和名字 */}
          <Link href="/" className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-full overflow-hidden bg-black/5 dark:bg-white/5">
              <Image
                src="/friends/assets/avatars/shuakami.jpg"
                alt="Shuakami"
                width={40}
                height={40}
                className="object-cover"
              />
            </div>
            <span className="font-medium text-black dark:text-white">Shuakami</span>
          </Link>

          {/* 菜单按钮 */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="w-10 h-10 flex items-center justify-center text-black/60 dark:text-white/60"
            aria-label={isOpen ? "关闭菜单" : "打开菜单"}
            aria-expanded={isOpen}
            role="button"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              {isOpen ? (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              ) : (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* 展开的导航菜单 */}
      <div
        className={`fixed inset-0 top-[72px] bg-white/40 dark:bg-black/40 backdrop-blur-md z-40 transition-transform duration-300 ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
        aria-hidden={!isOpen}
      >
        <nav className="p-6">
          <div className="space-y-2">
            {NAV_ITEMS.map((item) => (
              <Link
                key={item.path}
                href={item.path as Route}
                onClick={() => setIsOpen(false)}
                className="block px-4 py-3 rounded-lg text-black/80 dark:text-white/80
                  hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
              >
                <span>{item.name}</span>
              </Link>
            ))}
          </div>
        </nav>
      </div>
    </>
  );
} 