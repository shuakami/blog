"use client"

import { useState, useCallback } from "react"
import { toast } from "sonner"

interface UseCopyToClipboardOptions {
  /** 是否播放复制音效 */
  playSound?: boolean
  /** 是否显示 Toast 通知 */
  showToast?: boolean
  /** 复制成功的提示文本 */
  successMessage?: string
  /** 复制状态持续时间（毫秒） */
  duration?: number
}

export function useCopyToClipboard({
  playSound = false,
  showToast = true,
  successMessage = "已复制",
  duration = 2000,
}: UseCopyToClipboardOptions = {}) {
  const [isCopied, setIsCopied] = useState(false)

  const copy = useCallback(
    async (text: string): Promise<boolean> => {
      if (!text) return false

      try {
        await navigator.clipboard.writeText(text)
        setIsCopied(true)

        if (showToast) {
          toast.success(successMessage)
        }

        // 可选：播放音效
        if (playSound && typeof window !== "undefined") {
          // 简单的点击音效（可以替换为实际音频文件）
          try {
            const audioContext = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)()
            const oscillator = audioContext.createOscillator()
            const gainNode = audioContext.createGain()
            oscillator.connect(gainNode)
            gainNode.connect(audioContext.destination)
            oscillator.frequency.value = 800
            gainNode.gain.value = 0.1
            oscillator.start()
            oscillator.stop(audioContext.currentTime + 0.05)
          } catch {
            // 忽略音频错误
          }
        }

        setTimeout(() => setIsCopied(false), duration)
        return true
      } catch (error) {
        console.error("复制失败:", error)
        if (showToast) {
          toast.error("复制失败")
        }
        return false
      }
    },
    [playSound, showToast, successMessage, duration]
  )

  return { isCopied, copy }
}
