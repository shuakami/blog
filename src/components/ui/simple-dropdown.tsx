'use client'

import * as React from 'react'
import * as DropdownMenuPrimitive from '@radix-ui/react-dropdown-menu'
import { cn } from '@/lib/utils'

interface SimpleDropdownProps {
  trigger: React.ReactNode
  children: React.ReactNode
  align?: 'start' | 'end'
  className?: string
}

export function SimpleDropdown({ trigger, children, align = 'start', className = '' }: SimpleDropdownProps) {
  return (
    <DropdownMenuPrimitive.Root>
      <DropdownMenuPrimitive.Trigger asChild>
        {trigger}
      </DropdownMenuPrimitive.Trigger>

      <DropdownMenuPrimitive.Portal>
        <DropdownMenuPrimitive.Content
          align={align}
          sideOffset={8}
          className={cn(
            'z-50 bg-white dark:bg-black border border-black/5 dark:border-white/5 shadow-xl rounded-xl p-2 max-h-[400px] overflow-y-auto',
            'will-change-[opacity,transform]',
            'data-[state=open]:animate-in data-[state=closed]:animate-out',
            'data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0',
            'data-[state=closed]:zoom-out-[0.98] data-[state=open]:zoom-in-[0.98]',
            'data-[side=bottom]:slide-in-from-top-2 data-[side=top]:slide-in-from-bottom-2',
            'data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2',
            'duration-200 ease-out',
            className
          )}
        >
          <div className="space-y-1">
            {children}
          </div>
        </DropdownMenuPrimitive.Content>
      </DropdownMenuPrimitive.Portal>
    </DropdownMenuPrimitive.Root>
  )
}

interface SimpleDropdownItemProps {
  onClick?: () => void
  active?: boolean
  children: React.ReactNode
  className?: string
}

export function SimpleDropdownItem({ onClick, active = false, children, className = '' }: SimpleDropdownItemProps) {
  return (
    <DropdownMenuPrimitive.Item
      onClick={onClick}
      className={cn(
        'flex items-center justify-between w-full px-3 py-2 rounded-lg text-sm cursor-pointer outline-none',
        'transition-all duration-150 ease-out',
        'data-[highlighted]:bg-black/5 dark:data-[highlighted]:bg-white/5',
        'data-[highlighted]:scale-[0.99]',
        active
          ? 'bg-black/5 dark:bg-white/5 text-black dark:text-white'
          : 'text-black dark:text-white',
        className
      )}
    >
      {children}
    </DropdownMenuPrimitive.Item>
  )
}

