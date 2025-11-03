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
  /** 轻触 - 适用于按钮点击、选择等 */
  Light = 'light',
  /** 中等 - 适用于滑块变化、通知等 */
  Medium = 'medium',
  /** 重 - 适用于重要操作、警告等 */
  Heavy = 'heavy',
  /** 成功 - 适用于操作成功 */
  Success = 'success',
  /** 警告 - 适用于错误、警告 */
  Warning = 'warning',
  /** 选择 - 适用于列表选择、滑动刻度等 */
  Selection = 'selection',
}

/**
 * 震动模式配置（毫秒）
 * 线性马达建议使用短促震动（10-30ms）以获得最佳手感
 */
const vibrationPatterns: Record<HapticFeedback, number | number[]> = {
  [HapticFeedback.Light]: 10,          // 轻触：10ms
  [HapticFeedback.Medium]: 15,         // 中等：15ms
  [HapticFeedback.Heavy]: 25,          // 重：25ms
  [HapticFeedback.Success]: [10, 50, 10],  // 成功：双击感
  [HapticFeedback.Warning]: [15, 40, 15, 40, 15],  // 警告：三连击
  [HapticFeedback.Selection]: 8,       // 选择：8ms（最轻）
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
 * 每滑动 5% 触发一次轻微震动
 */
export function createVolumeHaptic(): (volume: number) => void {
  let lastStep = -1

  return (volume: number) => {
    const currentStep = Math.floor(volume * 20) // 20 个刻度（每 5%）
    
    if (currentStep !== lastStep) {
      triggerHaptic(HapticFeedback.Selection)
      lastStep = currentStep
    }
  }
}

