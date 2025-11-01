"use client"

import { useRouter } from "next/navigation"
import { LogOut, Settings } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

interface UserMenuProps {
  user: {
    username: string
    avatar: string
  }
}

export function UserMenu({ user }: UserMenuProps) {
  const router = useRouter()

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' })
    router.push('/')
    router.refresh()
  }

  return (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger asChild>
        <button
          className="rounded-full focus:outline-none"
          aria-label="用户菜单"
        >
          <img
            src={user.avatar}
            alt={user.username}
            className="w-5 h-5 rounded-full"
          />
        </button>
      </DropdownMenuTrigger>
      
      <DropdownMenuContent 
        align="end" 
        sideOffset={12}
        className="w-56 bg-white dark:bg-black border border-black/10 dark:border-white/10 shadow-xl rounded-xl p-2"
      >
        <div className="px-3 py-3 mb-1">
          <div className="flex items-center gap-3">
            <img
              src={user.avatar}
              alt={user.username}
              className="w-10 h-10 rounded-full"
            />
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium text-black dark:text-white truncate">
                {user.username}
              </div>
              <div className="text-xs text-black/50 dark:text-white/50">
                管理员
              </div>
            </div>
          </div>
        </div>

        <DropdownMenuSeparator className="my-1 bg-black/5 dark:bg-white/5" />

        <div className="py-1">
          <DropdownMenuItem
            onClick={() => router.push('/admin')}
            className="gap-3 cursor-pointer px-3 py-2 rounded-lg text-sm text-black dark:text-white hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
          >
            <Settings className="w-4 h-4 text-black/60 dark:text-white/60" />
            <span>管理后台</span>
          </DropdownMenuItem>
        </div>

        <DropdownMenuSeparator className="my-1 bg-black/5 dark:bg-white/5" />

        <div className="py-1">
          <DropdownMenuItem
            onClick={handleLogout}
            className="gap-3 cursor-pointer px-3 py-2 rounded-lg text-sm text-black dark:text-white hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
          >
            <LogOut className="w-4 h-4 text-black/60 dark:text-white/60" />
            <span>退出登录</span>
          </DropdownMenuItem>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

