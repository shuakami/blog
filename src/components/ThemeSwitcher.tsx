"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

export default function ThemeSwitcher() {
  const [mounted, setMounted] = useState(false);
  const { theme, setTheme } = useTheme();

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  const buttonClass = (currentTheme: string) => `
    w-8 h-8 
    flex items-center justify-center 
    rounded-full 
    transition-all duration-200
    transform hover:scale-110
    ${
      theme === currentTheme
        ? "bg-black/10 dark:bg-white/20"
        : "hover:bg-black/15 dark:hover:bg-white/10"
    }
  `;

  return (
    <div className="fixed bottom-6 right-6 z-50 md:block hidden">
      <div className="flex items-center gap-2 p-2 rounded-full bg-white/90 dark:bg-black/90 backdrop-blur-md border border-black/10 dark:border-white/10 shadow-sm">
        {/* 系统主题 */}
        <button
          onClick={() => setTheme("system")}
          className={buttonClass("system")}
          aria-label="跟随系统主题"
        >
          <svg
            className="w-4 h-4 text-black/70 dark:text-white/70"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
            <line x1="8" y1="21" x2="16" y2="21" />
            <line x1="12" y1="17" x2="12" y2="21" />
          </svg>
        </button>

        {/* 亮色主题 */}
        <button
          onClick={() => setTheme("light")}
          className={buttonClass("light")}
          aria-label="切换亮色主题"
        >
          <svg
            className="w-4 h-4 text-black/70 dark:text-white/70"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="12" cy="12" r="5" />
            <line x1="12" y1="1" x2="12" y2="3" />
            <line x1="12" y1="21" x2="12" y2="23" />
            <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
            <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
            <line x1="1" y1="12" x2="3" y2="12" />
            <line x1="21" y1="12" x2="23" y2="12" />
            <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
            <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
          </svg>
        </button>

        {/* 暗色主题 */}
        <button
          onClick={() => setTheme("dark")}
          className={buttonClass("dark")}
          aria-label="切换暗色主题"
        >
          <svg
            className="w-4 h-4 text-black/70 dark:text-white/70"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
          </svg>
        </button>
      </div>
    </div>
  );
} 