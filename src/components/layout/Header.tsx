"use client"

import Link from "next/link"
import { PanelLeftClose, PanelLeftOpen, Search } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { NowPlaying } from "@/components/music/now-playing"
import AppearanceSettings from "@/components/AppearanceSettings"
import { triggerHaptic, HapticFeedback } from '@/utils/haptics'

interface HeaderProps {
  isSidebarOpen: boolean
  onToggleSidebar: () => void
  title: string
  showSidebarToggle?: boolean
}

export function Header({ isSidebarOpen, onToggleSidebar, title, showSidebarToggle = true }: HeaderProps) {
  return (
    <header
      className={cn(
        "fixed top-0 left-0 right-0 z-50",
        "bg-gray-50/95 dark:bg-[#121212]/95",
        "backdrop-blur supports-[backdrop-filter]:bg-gray-50/80 supports-[backdrop-filter]:dark:bg-[#121212]/80",
      )}
      aria-label="全局顶部导航"
    >
      <div className="mx-auto flex h-16 items-center gap-2 md:gap-3 px-4 md:px-6">
        {/* 左侧区域 - 固定宽度 */}
        <div className="flex items-center gap-2 md:gap-3 flex-shrink-0">
          <Link href="/" className="font-semibold tracking-tight text-black dark:text-white text-sm md:text-base">
            {title}
          </Link>

          {showSidebarToggle && (
            <Button
              aria-label={isSidebarOpen ? "关闭侧边栏" : "打开侧边栏"}
              onClick={() => {
                triggerHaptic(HapticFeedback.Medium)
                onToggleSidebar()
              }}
              variant="ghost"
              className="rounded-md text-black/60 dark:text-white/60 hover:bg-black/5 dark:hover:bg-white/5 hover:text-black dark:hover:text-white h-8 w-8 md:h-8 md:w-8"
            >
              {isSidebarOpen ? (
                <PanelLeftClose className="h-4 w-4 md:h-4 md:w-4" />
              ) : (
                <PanelLeftOpen className="h-4 w-4 md:h-4 md:w-4" />
              )}
            </Button>
          )}
        </div>

        {/* 中间区域 - 自动居中的NowPlaying */}
        <div className="flex-1 flex justify-center items-center min-w-0">
          <div className="transition-all duration-300 ease-in-out">
            <NowPlaying isSidebarOpen={isSidebarOpen} />
          </div>
        </div>

        {/* 右侧区域 - 固定宽度 */}
        <div className="flex items-center gap-1 md:gap-2 flex-shrink-0">
          {/* 搜索按钮 */}
          <Link href="/search" onClick={() => triggerHaptic(HapticFeedback.Light)}>
            <Button
              variant="ghost"
              aria-label="搜索"
              className="rounded-full text-black/60 dark:text-white/60 hover:bg-black/5 dark:hover:bg-white/5 hover:text-black dark:hover:text-white h-8 w-8 md:h-8 md:w-8"
            >
              <Search className="h-4 w-4 md:h-4 md:w-4" />
            </Button>
          </Link>
          
          {/* 外观设置 */}
          <AppearanceSettings />
        </div>
      </div>
    </header>
  )
}

