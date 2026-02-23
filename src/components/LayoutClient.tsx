"use client"

import { useState, useEffect } from "react"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Header } from "@/components/layout/Header"
import { Sidebar } from "@/components/Sidebar"
import Footer from "@/components/Footer"
import type { NavItem } from "@/lib/types"

interface LayoutClientProps {
  children: React.ReactNode
  navItems: NavItem[]
  siteName?: string
}

export function LayoutClient({ children, navItems, siteName = "Shuakami" }: LayoutClientProps) {
  const [isSidebarOpen, setSidebarOpen] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const [isInitialized, setIsInitialized] = useState(false)
  const pathname = usePathname()
  const sidebarWidth = 192
  const gutter = 24
  
  // 某些页面可能不需要显示侧边栏
  const isAuthPage = pathname === "/login" || pathname === "/setup"
  
  // 全屏页面（无 padding，无 max-width 限制）
  const isFullscreenPage = pathname === "/games" || pathname === "/designs"

  // 初始化：从 localStorage 读取侧边栏状态
  useEffect(() => {
    const mobile = window.innerWidth < 768
    setIsMobile(mobile)
    
    // 移动端始终默认关闭，不使用 localStorage
    if (!mobile) {
      const savedState = localStorage.getItem('sidebar-open')
      if (savedState !== null) {
        setSidebarOpen(savedState === 'true')
      }
    }
    
    setIsInitialized(true)
    
    // 延迟启用 transition，让初始动画有时间播放
    setTimeout(() => {
      if (document.documentElement) {
        document.documentElement.classList.remove('sidebar-initializing')
      }
    }, 400) // 与 Sidebar 动画时间一致
  }, [])

  // 更新 CSS 变量以控制 padding
  useEffect(() => {
    if (!isInitialized) return
    
    const paddingValue = !isMobile && !isAuthPage && isSidebarOpen 
      ? `${sidebarWidth + gutter}px` 
      : `${gutter}px`
    
    if (document.documentElement) {
      document.documentElement.style.setProperty('--sidebar-padding', paddingValue)
    }
  }, [isSidebarOpen, isMobile, isInitialized])
  
  // 检测移动端
  useEffect(() => {
    if (!isInitialized) return
    
    const checkMobile = () => {
      const mobile = window.innerWidth < 768
      const wasMobile = isMobile
      setIsMobile(mobile)
      
      // 仅在从桌面端切换到移动端时自动关闭侧边栏
      if (mobile && !wasMobile && isSidebarOpen) {
        setSidebarOpen(false)
      }
    }
    
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [isInitialized, isMobile, isSidebarOpen])

  const handleToggleSidebar = () => {
    const newState = !isSidebarOpen
    setSidebarOpen(newState)
    // 只在桌面端保存状态
    if (!isMobile) {
      localStorage.setItem('sidebar-open', String(newState))
    }
  }

  const handleCloseSidebar = () => {
    setSidebarOpen(false)
    // 只在桌面端保存状态
    if (!isMobile) {
      localStorage.setItem('sidebar-open', 'false')
    }
  }

  return (
    <div className="relative min-h-dvh w-full text-foreground">
      {!isFullscreenPage && (
        <Header
          isSidebarOpen={isSidebarOpen}
          onToggleSidebar={handleToggleSidebar}
          title={siteName}
          showSidebarToggle={!isAuthPage}
        />
      )}
      
      {!isAuthPage && !isFullscreenPage && (
        <Sidebar 
          isOpen={isSidebarOpen} 
          width={sidebarWidth} 
          navItems={navItems}
          onClose={handleCloseSidebar}
        />
      )}
      
      {isFullscreenPage ? (
        <main className="relative w-full">
          {children}
        </main>
      ) : (
        <main
          className={cn(
            "relative w-full",
            isAuthPage ? "" : "pt-16",
            isAuthPage ? "" : "px-4 md:pr-6",
            !isAuthPage && !isMobile && "md:transition-[padding-left] md:duration-300 md:ease-out",
          )}
          style={{ 
            paddingLeft: !isMobile && !isAuthPage 
              ? 'var(--sidebar-padding)' 
              : undefined 
          }}
        >
          {children}
        </main>
      )}
      
      {!isAuthPage && !isFullscreenPage && (
        <footer
          className={cn(
            "relative w-full",
            !isMobile && "transition-[padding-left] duration-300 ease-out",
          )}
          style={{ 
            paddingLeft: !isMobile && !isAuthPage 
              ? 'var(--sidebar-padding)' 
              : undefined 
          }}
        >
          <Footer />
        </footer>
      )}
    </div>
  )
}

