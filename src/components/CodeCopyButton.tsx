'use client'

import { useEffect } from 'react'
import { triggerHaptic, HapticFeedback } from '@/utils/haptics'

export function CodeCopyButton() {
  useEffect(() => {
    // 为所有代码块添加复制按钮
    const codeBlocks = document.querySelectorAll('.markdown-body pre')
    
    codeBlocks.forEach((block) => {
      // 检查是否已经添加了按钮
      if (block.querySelector('.copy-button')) return
      
      const button = document.createElement('button')
      button.className = 'copy-button absolute top-3 right-3 p-2 rounded-md hover:bg-black/[0.04] dark:hover:bg-white/[0.06] transition-all opacity-0 group-hover:opacity-100'
      button.innerHTML = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-black/30 dark:text-white/30"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>'
      
      // 给 pre 添加 relative 和 group
      const pre = block as HTMLElement
      pre.style.position = 'relative'
      pre.classList.add('group')
      
      button.addEventListener('click', async () => {
        const code = block.querySelector('code')
        if (!code) return
        
        try {
          await navigator.clipboard.writeText(code.textContent || '')
          
          triggerHaptic(HapticFeedback.Success)
          
          // 显示成功图标（不再用绿色，用黑色）
          button.innerHTML = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-black/60 dark:text-white/60"><polyline points="20 6 9 17 4 12"></polyline></svg>'
          
          // 2秒后恢复
          setTimeout(() => {
            button.innerHTML = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-black/30 dark:text-white/30"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>'
          }, 2000)
        } catch (err) {
          console.error('复制失败:', err)
        }
      })
      
      block.appendChild(button)
    })
  }, [])
  
  return null
}

