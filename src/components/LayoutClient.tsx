"use client"

import { useState, useEffect } from "react"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Header } from "@/components/layout/Header"
import { Sidebar } from "@/components/Sidebar"
import Footer from "@/components/Footer"
import ThemeSwitcher from "@/components/ThemeSwitcher"
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
  }, [])

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

  // 某些页面可能不需要显示侧边栏
  const isAuthPage = pathname === "/login" || pathname === "/setup"

  // 计算 main 的 padding-left
  const getMainPaddingLeft = () => {
    if (isAuthPage) return 0
    // 移动端：无 padding（侧边栏是覆盖式的）
    if (isMobile) return 0
    // 桌面端：根据侧边栏状态调整
    return isSidebarOpen ? sidebarWidth + gutter : gutter
  }

  return (
    <div className="relative min-h-dvh w-full text-foreground">
      <Header
        isSidebarOpen={isSidebarOpen}
        onToggleSidebar={handleToggleSidebar}
        title={siteName}
        showSidebarToggle={!isAuthPage}
      />
      
      {!isAuthPage && (
        <Sidebar 
          isOpen={isSidebarOpen} 
          width={sidebarWidth} 
          navItems={navItems}
          onClose={handleCloseSidebar}
        />
      )}
      
      <main
        className={cn(
          "relative w-full",
          isAuthPage ? "" : "pt-16",
          // 移动端：左右 padding 更小
          isAuthPage ? "" : "px-4 md:pr-6",
          // 桌面端：左侧 padding 根据侧边栏状态变化
          !isAuthPage && !isMobile && "md:transition-[padding-left] md:duration-300 md:ease-out",
        )}
        style={{ 
          paddingLeft: !isMobile && !isAuthPage 
            ? `${getMainPaddingLeft()}px` 
            : undefined 
        }}
      >
        {children}
      </main>
      
      {!isAuthPage && (
        <footer
          className={cn(
            "relative w-full",
            !isMobile && "transition-[padding-left] duration-300 ease-out",
          )}
          style={{ 
            paddingLeft: !isMobile && !isAuthPage 
              ? `${getMainPaddingLeft()}px` 
              : undefined 
          }}
        >
          <Footer />
        </footer>
      )}
      
      <ThemeSwitcher />
    </div>
  )
}

