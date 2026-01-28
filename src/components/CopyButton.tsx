"use client"

import * as React from "react"
import { Copy, Check } from "lucide-react"
import { cn } from "@/lib/utils"
import { useCopyToClipboard } from "@/hooks/useCopyToClipboard"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

type CopyButtonVariant = "icon" | "ghost" | "outline" | "text" | "inline"
type CopyButtonSize = "xs" | "sm" | "md" | "lg"

interface CopyButtonProps {
  /** 要复制的文本 */
  text: string
  /** 按钮变体样式 */
  variant?: CopyButtonVariant
  /** 按钮大小 */
  size?: CopyButtonSize
  /** 是否播放复制音效 */
  playSound?: boolean
  /** 是否显示 Toast 通知 */
  showToast?: boolean
  /** 复制成功的提示文本 */
  successMessage?: string
  /** 是否显示 Tooltip */
  showTooltip?: boolean
  /** Tooltip 文本 */
  tooltipText?: string
  /** 复制成功后的 Tooltip 文本 */
  tooltipCopiedText?: string
  /** 复制成功回调 */
  onCopySuccess?: () => void
  /** 复制失败回调 */
  onCopyError?: (error: unknown) => void
  /** 自定义类名 */
  className?: string
  /** 自定义图标 */
  icon?: React.ReactNode
  /** 自定义已复制图标 */
  copiedIcon?: React.ReactNode
  /** 按钮文本（仅 text 变体） */
  label?: string
  /** 已复制状态文本（仅 text 变体） */
  copiedLabel?: string
  /** 是否禁用 */
  disabled?: boolean
}

const sizeConfig: Record<CopyButtonSize, { icon: string; button: string; text: string }> = {
  xs: { icon: "h-3 w-3", button: "h-6 w-6", text: "text-xs" },
  sm: { icon: "h-3.5 w-3.5", button: "h-7 w-7", text: "text-xs" },
  md: { icon: "h-4 w-4", button: "h-8 w-8", text: "text-sm" },
  lg: { icon: "h-5 w-5", button: "h-10 w-10", text: "text-base" },
}

const variantStyles: Record<CopyButtonVariant, string> = {
  icon: "p-1.5 rounded-md bg-white/5 backdrop-blur-sm text-zinc-400 hover:text-zinc-600 dark:text-zinc-500 dark:hover:text-zinc-300 transition-all",
  ghost: "hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-full transition-colors",
  outline: "border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg transition-colors",
  text: "text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300 transition-colors",
  inline: "p-1 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded transition-colors",
}

/**
 * 统一的复制按钮组件
 */
export function CopyButton({
  text,
  variant = "icon",
  size = "sm",
  playSound = true,
  showToast = true,
  successMessage = "已复制",
  showTooltip = false,
  tooltipText = "复制",
  tooltipCopiedText = "已复制!",
  onCopySuccess,
  onCopyError,
  className,
  icon,
  copiedIcon,
  label,
  copiedLabel = "已复制",
  disabled = false,
}: CopyButtonProps) {
  const { isCopied, copy } = useCopyToClipboard({
    playSound,
    showToast,
    successMessage,
  })

  const handleCopy = async (e: React.MouseEvent) => {
    e.stopPropagation()
    if (disabled) return

    const success = await copy(text)
    if (success) {
      onCopySuccess?.()
    } else {
      onCopyError?.(new Error("Copy failed"))
    }
  }

  const sizeStyles = sizeConfig[size]

  const IconComponent = isCopied
    ? (copiedIcon || <Check className={cn(sizeStyles.icon, "text-green-500")} />)
    : (icon || <Copy className={sizeStyles.icon} />)

  const buttonContent = variant === "text" ? (
    <span className={cn(sizeStyles.text, "flex items-center gap-1.5")}>
      {IconComponent}
      {label && <span>{isCopied ? copiedLabel : label}</span>}
    </span>
  ) : (
    IconComponent
  )

  const button = (
    <button
      type="button"
      onClick={handleCopy}
      disabled={disabled}
      className={cn(
        variantStyles[variant],
        variant !== "text" && sizeStyles.button,
        "flex items-center justify-center shrink-0",
        disabled && "opacity-50 cursor-not-allowed",
        className
      )}
      aria-label={isCopied ? "已复制" : "复制到剪贴板"}
    >
      {buttonContent}
    </button>
  )

  if (showTooltip) {
    return (
      <TooltipProvider delayDuration={100}>
        <Tooltip>
          <TooltipTrigger asChild>
            {button}
          </TooltipTrigger>
          <TooltipContent>
            <p>{isCopied ? tooltipCopiedText : tooltipText}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    )
  }

  return button
}

export default CopyButton
