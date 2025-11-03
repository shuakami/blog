/**
 * 触觉反馈工具 - 调用手机线性马达
 * 使用 Vibration API 提供原生触觉体验
 */

// 检测是否支持震动
const isVibrationSupported = typeof navigator !== 'undefined' && 'vibrate' in navigator

/**
 * 触觉反馈类型
 */
export enum HapticFeedback {
  /** 极轻触 - 适用于连续滑动、滚动选择器（Apple Selection 风格） */
  Selection = 'selection',
  /** 轻触 - 适用于按钮点击、轻量交互（Apple Light Impact） */
  Light = 'light',
  /** 中等 - 适用于开关、边界、重要节点（Apple Medium Impact） */
  Medium = 'medium',
  /** 重 - 适用于重要操作、删除警告（Apple Heavy Impact） */
  Heavy = 'heavy',
  /** 成功 - 适用于操作成功（双脉冲） */
  Success = 'success',
  /** 警告 - 适用于错误、警告（三脉冲） */
  Warning = 'warning',
}

/**
 * 震动模式配置（毫秒）
 */
const vibrationPatterns: Record<HapticFeedback, number | number[]> = {
  [HapticFeedback.Selection]: 4,           // 极轻：4ms（滑动专用）
  [HapticFeedback.Light]: 6,               // 轻触：6ms（Apple 风格）
  [HapticFeedback.Medium]: 12,             // 中等：12ms（边界、开关）
  [HapticFeedback.Heavy]: 18,              // 重：18ms（重要操作）
  [HapticFeedback.Success]: [8, 40, 8],    // 成功：双脉冲（更短促）
  [HapticFeedback.Warning]: [12, 30, 12, 30, 12],  // 警告：三脉冲
}

/**
 * 触发触觉反馈
 * @param type 反馈类型
 */
export function triggerHaptic(type: HapticFeedback = HapticFeedback.Light): void {
  if (!isVibrationSupported) {
    return
  }

  try {
    const pattern = vibrationPatterns[type]
    navigator.vibrate(pattern)
  } catch (error) {
    // 静默失败，不影响用户体验
    console.debug('Haptic feedback failed:', error)
  }
}

/**
 * 停止所有震动
 */
export function stopHaptic(): void {
  if (!isVibrationSupported) {
    return
  }

  try {
    navigator.vibrate(0)
  } catch (error) {
    console.debug('Stop haptic failed:', error)
  }
}

/**
 * 节流触觉反馈 - 防止频繁震动
 * 适用于滑动等连续操作
 */
export function createThrottledHaptic(
  type: HapticFeedback = HapticFeedback.Selection,
  interval: number = 50
): () => void {
  let lastTrigger = 0

  return () => {
    const now = Date.now()
    if (now - lastTrigger >= interval) {
      triggerHaptic(type)
      lastTrigger = now
    }
  }
}

/**
 * 音量滑动触觉反馈
 */
export function createVolumeHaptic(): (volume: number, velocity?: number) => void {
  let lastStep = -1
  let lastVolume = -1
  let lastTriggerTime = 0
  
  // 性能约束：最小触发间隔 16ms（60fps）
  const MIN_INTERVAL = 16
  
  return (volume: number, velocity: number = 0) => {
    const now = performance.now()
    
    // 性能约束：防止过度触发
    if (now - lastTriggerTime < MIN_INTERVAL) {
      return
    }
    
    // 计算当前刻度（50 个刻度，每 2%）
    const fineStep = Math.floor(volume * 50)
    const coarseStep = Math.floor(volume * 10) // 每 10%
    
    // 速度自适应：快速滑动时降低灵敏度
    const isFastSwipe = Math.abs(velocity) > 0.5 // 速度阈值
    
    // 边界增强（0% 和 100%）
    if ((volume === 0 || volume === 1) && lastVolume !== volume) {
      triggerHaptic(HapticFeedback.Medium)
      lastTriggerTime = now
      lastVolume = volume
      lastStep = fineStep
      return
    }
    
    // 中点提示（50% ± 1%）
    if (Math.abs(volume - 0.5) < 0.01 && Math.abs(lastVolume - 0.5) >= 0.01) {
      triggerHaptic(HapticFeedback.Light)
      lastTriggerTime = now
      lastVolume = volume
      lastStep = fineStep
      return
    }
    
    // 刻度反馈
    if (fineStep !== lastStep) {
      // 快速滑动：只在每 10% 触发
      if (isFastSwipe) {
        if (coarseStep !== Math.floor(lastVolume * 10)) {
          triggerHaptic(HapticFeedback.Light)
          lastTriggerTime = now
        }
      }
      // 慢速滑动：细腻反馈
      else {
        // 每 10% 触发 Light
        if (fineStep % 5 === 0) {
          triggerHaptic(HapticFeedback.Light)
          lastTriggerTime = now
        }
        // 其他位置触发 Selection（极轻）
        else {
          triggerHaptic(HapticFeedback.Selection)
          lastTriggerTime = now
        }
      }
      
      lastStep = fineStep
      lastVolume = volume
    }
  }
}

