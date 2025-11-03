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
  
  // 提升触发频率上限：12ms
  const MIN_INTERVAL = 12
  
  return (volume: number, velocity: number = 0) => {
    const now = performance.now()
    
    // 性能约束
    if (now - lastTriggerTime < MIN_INTERVAL) {
      return
    }
    
    // 计算当前刻度（100 个刻度，每 1%）
    const step = Math.floor(volume * 100)
    
    // 速度感知：快速滑动增强反馈
    const isFastSwipe = Math.abs(velocity) > 0.8  // 速度阈值
    const isSuperFastSwipe = Math.abs(velocity) > 2.0
    
    // === 边界碰撞（0% 和 100%）===
    if ((volume === 0 || volume === 1) && lastVolume !== volume) {
      // 边界时触发最强震动
      triggerHaptic(isSuperFastSwipe ? HapticFeedback.Warning : HapticFeedback.Heavy)
      lastTriggerTime = now
      lastVolume = volume
      lastStep = step
      return
    }
    
    // === 中点共鸣（50%）===
    if (step === 50 && lastStep !== 50) {
      // 50% 触发成功反馈（双脉冲）
      triggerHaptic(HapticFeedback.Success)
      lastTriggerTime = now
      lastVolume = volume
      lastStep = step
      return
    }
    
    // === 连续刻度反馈 ===
    if (step !== lastStep) {
      // 每 5% 的大刻度（0, 5, 10, 15...）
      if (step % 5 === 0) {
        // 快速滑动时强化反馈
        triggerHaptic(isFastSwipe ? HapticFeedback.Heavy : HapticFeedback.Medium)
        lastTriggerTime = now
      }
      // 每 1% 的小刻度（清晰的连续感）
      else {
        // 快速滑动时也用 Medium
        triggerHaptic(isFastSwipe ? HapticFeedback.Medium : HapticFeedback.Light)
        lastTriggerTime = now
      }
      
      lastStep = step
      lastVolume = volume
    }
  }
}

