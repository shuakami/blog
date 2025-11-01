"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { X } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

import { cn } from "@/lib/utils"
import type { NavItem } from "@/lib/types"

interface SidebarProps {
  isOpen: boolean
  width?: number
  navItems: NavItem[]
  onClose?: () => void
}

export function Sidebar({ isOpen, width = 192, navItems, onClose }: SidebarProps) {
  const [isAnimating, setIsAnimating] = useState(false)
  const [shouldRender, setShouldRender] = useState(isOpen)
  const [isInitialLoad, setIsInitialLoad] = useState(true)

  useEffect(() => {
    if (isOpen) {
      setShouldRender(true)
      setIsAnimating(false)
    }
  }, [isOpen])
  
  // 首次加载完成后禁用初始化动画
  useEffect(() => {
    if (isInitialLoad) {
      const timer = setTimeout(() => {
        setIsInitialLoad(false)
      }, 400) // 动画持续时间
      return () => clearTimeout(timer)
    }
  }, [isInitialLoad])

  const handleClose = () => {
    setIsAnimating(true)
  }

  const handleAnimationComplete = () => {
    if (isAnimating) {
      setShouldRender(false)
      setIsAnimating(false)
      onClose?.()
    }
  }

  return (
    <>
      {/* 桌面端侧边栏 */}
      <aside
        className={cn(
          "hidden md:block",
          "fixed top-0 left-0 z-40 h-screen pt-16",
          "bg-gray-50 dark:bg-[#121212]",
          "transition-transform duration-300 ease-out will-change-transform",
          isOpen ? "translate-x-0" : "-translate-x-full",
          // 初始加载时的淡入动画
          isInitialLoad && isOpen && "animate-in fade-in slide-in-from-left-4 duration-400",
        )}
        style={{ width }}
        aria-label="侧边导航"
      >
        <nav className="flex h-full flex-col items-stretch justify-center px-6">
          <ul className="space-y-2">
            {navItems.filter(item => item.enabled).map((item) => (
              <li key={item.label}>
                <Link
                  href={item.href as any}
                  className={cn(
                    "group flex h-9 w-full items-center justify-between rounded-md px-3 text-sm",
                    "text-black/90 dark:text-white/90",
                    "hover:bg-black/5 dark:hover:bg-white/5",
                    "hover:text-black dark:hover:text-white",
                    "transition-colors duration-200",
                  )}
                >
                  <span>{item.label}</span>
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </aside>

      {/* 移动端侧边栏 */}
      <AnimatePresence>
        {shouldRender && (
          <motion.div
            key="sidebar"
            initial={{ x: "-100%" }}
            animate={{ x: isAnimating ? "-100%" : 0 }}
            exit={{ x: "-100%" }}
            transition={{ 
              type: "spring", 
              damping: 30, 
              stiffness: 300,
              mass: 0.8 
            }}
            onAnimationComplete={handleAnimationComplete}
            // @ts-ignore - framer-motion type issue
            className={cn(
              "md:hidden",
              "fixed inset-0 z-50",
              "bg-white/95 dark:bg-black/95",
              "backdrop-blur-3xl",
            )}
            onMouseDown={handleClose}
          >
            {/* 侧边栏内容区域 */}
            <div
              className="w-[280px] h-full"
              onMouseDown={(e: any) => e.stopPropagation()}
            >
              {/* 关闭按钮 - 右上角 */}
              <div className="absolute top-6 right-6">
                <button
                  onClick={handleClose}
                  className={cn(
                    "p-2 rounded-full",
                    "text-black/60 dark:text-white/60",
                    "hover:bg-black/5 dark:hover:bg-white/5",
                    "transition-colors duration-200",
                  )}
                  aria-label="关闭菜单"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              {/* 导航内容 */}
              <nav className="flex h-full flex-col justify-center px-8 py-20">
                <ul className="space-y-2">
                  {navItems.filter(item => item.enabled).map((item) => (
                    <li key={item.label}>
                      <Link
                        href={item.href as any}
                        onClick={(e) => {
                          e.stopPropagation()
                          handleClose()
                        }}
                        className={cn(
                          "block w-full py-3 px-4",
                          "text-3xl font-bold text-left",
                          "text-black dark:text-white",
                          "rounded-lg",
                          "hover:bg-black/5 dark:hover:bg-white/5",
                          "transition-all duration-200",
                        )}
                      >
                        {item.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </nav>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}

