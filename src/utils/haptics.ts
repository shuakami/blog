/**
 * 触觉反馈（Haptics）
 */

 /* -------------------------------- 工具/类型 -------------------------------- */

 declare global {
  interface Window {
    Capacitor?: any;
    TapticEngine?: {
      selection: () => void;
      selectionStart?: () => void;
      selectionChanged?: () => void;
      selectionEnd?: () => void;
      impact: (opt: { style: 'light' | 'medium' | 'heavy' }) => void;
      notification: (opt: { type: 'success' | 'warning' | 'error' }) => void;
    };
  }
}

const hasWindow = typeof window !== 'undefined';
const hasNavigator = typeof navigator !== 'undefined';

const userActivation = hasNavigator ? (navigator as any).userActivation : undefined;
const matchMediaFn = (q: string) => (hasWindow && typeof window.matchMedia === 'function' ? window.matchMedia(q) : null);

/** 用户无障碍：是否倾向减少动效 */
const prefersReducedMotion = !!matchMediaFn('(prefers-reduced-motion: reduce)')?.matches;

/** Web 是否支持 Vibrate */
const isVibrationSupported = hasNavigator && 'vibrate' in navigator;

/** 是否在“已激活”的用户手势上下文 */
const isUserActivated = (): boolean => {
  if (!userActivation) return true; // 不支持该特性则放行
  return !!(userActivation.isActive || userActivation.hasBeenActive);
};

/** 触觉反馈类型（与设计同名） */
export enum HapticFeedback {
  /** 极轻触 - 连续滑动/滚动选择器（Apple Selection 风格） */
  Selection = 'selection',
  /** 轻触 - 按钮点击、轻量交互（Apple Light Impact） */
  Light = 'light',
  /** 中等 - 开关、边界、重要节点（Apple Medium Impact） */
  Medium = 'medium',
  /** 重 - 重要操作、破坏性操作（Apple Heavy Impact） */
  Heavy = 'heavy',
  /** 成功 - 操作成功（双脉冲，Apple Notification Success） */
  Success = 'success',
  /** 警告 - 错误/警告（三脉冲，Apple Notification Warning） */
  Warning = 'warning',
}

/** 运行时选项 */
export interface HapticOptions {
  /** 忽略用户激活限制（不建议，默认 false） */
  ignoreUserActivation?: boolean;
  /** 在用户设置“减少动效”时仍强制输出（默认 false） */
  allowWhenReducedMotion?: boolean;
}

/* ------------------------------- 后端适配层 ------------------------------- */

/** 统一的后端接口 */
interface HapticsAdapter {
  kind: 'capacitor' | 'taptic' | 'vibration' | 'noop';
  /** impact 强度：light/medium/heavy */
  impact(style: 'light' | 'medium' | 'heavy'): Promise<void> | void;
  /** selection 单次变化（滚动/拖拽刻度） */
  selection(): Promise<void> | void;
  /** selection 会话（开始/变化/结束） */
  selectionStart?(): Promise<void> | void;
  selectionChanged?(): Promise<void> | void;
  selectionEnd?(): Promise<void> | void;
  /** 通知类：success / warning */
  notification(type: 'success' | 'warning'): Promise<void> | void;
  /** 按自定义模式震动（仅 vibration 有效） */
  vibrate?(pattern: number | number[]): boolean;
  /** 立即停止（仅 vibration 有效） */
  stop?(): void;
}

/** 安全调用：失败不抛出 */
const safeCall = async <T>(fn: () => T | Promise<T>): Promise<T | undefined> => {
  try {
    return await fn();
  } catch {
    return undefined;
  }
};

/** Capacitor Haptics 适配 */
const makeCapacitorAdapter = (): HapticsAdapter | null => {
  const cap = hasWindow ? (window as any).Capacitor : undefined;
  const H = cap?.Plugins?.Haptics || (hasWindow ? (window as any).Haptics : undefined);
  if (!H) return null;

  // 兼容大小写/枚举差异
  const impact = async (style: 'light' | 'medium' | 'heavy') => {
    const candidates = [
      { style: 'Light' }, { style: 'light' }, { style: 'LIGHT' },
      { style: 'Medium' }, { style: 'medium' }, { style: 'MEDIUM' },
      { style: 'Heavy' }, { style: 'heavy' }, { style: 'HEAVY' },
    ];
    const pick = candidates.find(c => String(c.style).toLowerCase() === style);
    if (pick) {
      await safeCall(() => H.impact(pick));
    }
  };

  const notification = async (type: 'success' | 'warning') => {
    const candidates = [
      { type: 'success' }, { type: 'SUCCESS' },
      { type: 'warning' }, { type: 'WARNING' },
    ];
    const pick = candidates.find(c => String(c.type).toLowerCase() === type);
    if (pick) {
      await safeCall(() => H.notification(pick));
    }
  };

  const selection = async () => {
    // 优先 selectionChanged（更贴合滚动）
    if (typeof H.selectionChanged === 'function') {
      await safeCall(() => H.selectionChanged());
      return;
    }
    // 退化到最轻量 impact
    await impact('light');
  };

  const selectionStart = async () => { await safeCall(() => H.selectionStart?.()); };
  const selectionEnd = async () => { await safeCall(() => H.selectionEnd?.()); };

  return {
    kind: 'capacitor',
    impact,
    selection,
    selectionStart,
    selectionChanged: selection,
    selectionEnd,
    notification,
    // Vibrate/stop 交给原生，不实现
  };
};

/** TapticEngine 适配（Cordova/Ionic） */
const makeTapticAdapter = (): HapticsAdapter | null => {
  const T = hasWindow ? window.TapticEngine : undefined;
  if (!T) return null;

  const impact = (style: 'light' | 'medium' | 'heavy') => { T.impact({ style }); };
  const notification = (type: 'success' | 'warning') => { T.notification({ type }); };
  const selection = () => { T.selection(); };
  const selectionStart = () => { T.selectionStart?.(); };
  const selectionChanged = () => { T.selectionChanged?.(); };
  const selectionEnd = () => { T.selectionEnd?.(); };

  return {
    kind: 'taptic',
    impact,
    selection,
    selectionStart,
    selectionChanged,
    selectionEnd,
    notification,
  };
};

/** Web Vibrate 适配（Android Web 为主） */
const makeVibrationAdapter = (): HapticsAdapter | null => {
  if (!isVibrationSupported) return null;

  const vibrate = (pattern: number | number[]) => {
    try {
      return navigator.vibrate(pattern);
    } catch {
      return false;
    }
  };

  const stop = () => {
    try { navigator.vibrate(0); } catch { /* noop */ }
  };

  // 映射 impact -> 单脉冲，强度仅靠时长近似
  const impact = (style: 'light' | 'medium' | 'heavy'): void => {
    // 经过多机型兼顾的经验值（单位 ms）
    const map = {
      light: 12,
      medium: 20,
      heavy: 35,
    } as const;
    vibrate(map[style]);
  };

  // selection -> 更短促
  const selection = (): void => {
    vibrate(8);
  };

  const notification = (type: 'success' | 'warning'): void => {
    if (type === 'success') {
      // 双脉冲：短-间隔-短（干脆）
      vibrate([14, 30, 14]);
    } else {
      // 三脉冲：中-间隔-中-间隔-中（警示感）
      vibrate([24, 30, 24, 30, 24]);
    }
  };

  return {
    kind: 'vibration',
    impact,
    selection,
    notification,
    vibrate,
    stop,
  };
};

let _adapter: HapticsAdapter | null | undefined;
const getAdapter = (): HapticsAdapter => {
  if (_adapter) return _adapter;
  _adapter =
    makeCapacitorAdapter() ||
    makeTapticAdapter() ||
    makeVibrationAdapter() ||
    {
      kind: 'noop',
      impact: () => {},
      selection: () => {},
      notification: () => {},
    };
  return _adapter;
};

/* ------------------------------- 策略/调度层 ------------------------------- */

/** 全局开关（默认：尊重用户“减少动效”——即可能为关闭） */
let enabled = !prefersReducedMotion;

/** 统一节流窗口（避免密集蜂鸣）；单位 ms */
const GLOBAL_MIN_INTERVAL = 8;

/** 按类型的最小间隔（更贴近原生节奏） */
const TYPE_MIN_INTERVAL: Record<HapticFeedback, number> = {
  [HapticFeedback.Selection]: 10,
  [HapticFeedback.Light]: 16,
  [HapticFeedback.Medium]: 24,
  [HapticFeedback.Heavy]: 40,
  [HapticFeedback.Success]: 120,
  [HapticFeedback.Warning]: 160,
};

/** 重型反馈后的全局冷却（避免“糊成一片”） */
const HEAVY_COOLDOWN = 50;

let lastFireAt = 0;
const lastTypeAt: Partial<Record<HapticFeedback, number>> = {};
let cooldownUntil = 0;

/** 触发前统一校验 */
const canFire = (type: HapticFeedback, opts?: HapticOptions): boolean => {
  if (!enabled && !opts?.allowWhenReducedMotion) return false;
  if (!opts?.ignoreUserActivation && !isUserActivated()) return false;

  const now = performance.now ? performance.now() : Date.now();

  // 全局节流
  if (now - lastFireAt < GLOBAL_MIN_INTERVAL) return false;
  // 按类型节流
  const tmin = TYPE_MIN_INTERVAL[type] ?? 16;
  if (now - (lastTypeAt[type] ?? 0) < tmin) return false;
  // 冷却
  if (now < cooldownUntil) return false;

  return true;
};

/** 记录触发时间与冷却 */
const stamp = (type: HapticFeedback) => {
  const now = performance.now ? performance.now() : Date.now();
  lastFireAt = now;
  lastTypeAt[type] = now;
  if (type === HapticFeedback.Heavy || type === HapticFeedback.Success || type === HapticFeedback.Warning) {
    cooldownUntil = now + HEAVY_COOLDOWN;
  }
};

/* ------------------------------- 对外 API ------------------------------- */

/** 开关（运行时） */
export function setHapticsEnabled(val: boolean): void {
  enabled = !!val;
}

/** 查询是否有任何可用实现 */
export function isHapticsAvailable(): boolean {
  const kind = getAdapter().kind;
  return kind !== 'noop';
}

/** 触发触觉反馈（统一入口） */
export function triggerHaptic(type: HapticFeedback = HapticFeedback.Light, opts?: HapticOptions): void {
  if (!canFire(type, opts)) return;

  const adapter = getAdapter();
  try {
    switch (type) {
      case HapticFeedback.Selection:
        adapter.selection();
        break;
      case HapticFeedback.Light:
        adapter.impact('light');
        break;
      case HapticFeedback.Medium:
        adapter.impact('medium');
        break;
      case HapticFeedback.Heavy:
        adapter.impact('heavy');
        break;
      case HapticFeedback.Success:
        adapter.notification('success');
        break;
      case HapticFeedback.Warning:
        adapter.notification('warning');
        break;
      default:
        adapter.selection();
        break;
    }
  } catch (error) {
    // 静默失败，不影响 UI
    console.debug('[haptics] trigger failed:', error);
  } finally {
    stamp(type);
  }
}

/** 停止所有震动（仅在 Vibrate 后端有效，原生后端通常不需要） */
export function stopHaptic(): void {
  const adapter = getAdapter();
  try {
    adapter.stop?.();
  } catch (error) {
    console.debug('[haptics] stop failed:', error);
  }
}

/**
 * 节流触觉反馈 - 防止频繁触发
 * 适用于滑动等连续操作（默认 Selection）
 */
export function createThrottledHaptic(
  type: HapticFeedback = HapticFeedback.Selection,
  interval: number = 50,
  opts?: HapticOptions
): () => void {
  let lastTrigger = 0;
  return () => {
    const now = Date.now();
    if (now - lastTrigger >= interval) {
      triggerHaptic(type, opts);
      lastTrigger = now;
    }
  };
}

/**
 * Selection 会话：在滚动/拖拽开始时调用 start，过程中使用 changed，结束时 end。
 * - iOS/Capacitor：映射到 UIFeedbackGenerator 的 selectionStart/Changed/End
 * - Web Vibrate：做轻量脉冲 + 节流模拟
 */
export function createSelectionSession(opts?: HapticOptions) {
  const adapter = getAdapter();
  let started = false;

  return {
    start() {
      if (!canFire(HapticFeedback.Selection, opts)) return;
      started = true;
      if (adapter.selectionStart) {
        try { adapter.selectionStart(); } catch {}
      } else {
        // 无原生会话能力：给一次极轻脉冲，暗示进入状态
        triggerHaptic(HapticFeedback.Selection, opts);
      }
    },
    changed() {
      if (!started) return;
      triggerHaptic(HapticFeedback.Selection, opts);
    },
    end() {
      if (!started) return;
      started = false;
      try { adapter.selectionEnd?.(); } catch {}
    },
  };
}

/**
 * 音量滑动触觉反馈（高品质版）
 * - 100 个刻度（每 1% 一格）
 * - 0%/100% 边界：重/警告（快速滑动时加强）
 * - 50% 中点：Success 双脉冲
 * - 每 5%：中/重（按滑动速度提高强度）
 * - 其余格：轻/中（按滑动速度提高强度）
 * - 全局最小触发间隔 10~12ms，避免“蜂鸣”
 */
export function createVolumeHaptic(): (volume: number, velocity?: number) => void {
  let lastStep = -1;
  let lastVolume = -1;
  let lastTriggerTime = 0;

  const MIN_INTERVAL = 12; // 提升上限，保持干脆

  return (volume: number, velocity: number = 0) => {
    const now = performance.now ? performance.now() : Date.now();

    // 安全/性能门限
    if (now - lastTriggerTime < MIN_INTERVAL) return;
    if (Number.isNaN(volume)) return;

    // [0,1] 边界钳制
    const v = Math.min(1, Math.max(0, volume));
    const step = Math.floor(v * 100);

    const speed = Math.abs(velocity);
    const isFastSwipe = speed > 0.9;
    const isSuperFastSwipe = speed > 2.0;

    // 边界：0 或 1
    if ((v === 0 || v === 1) && lastVolume !== v) {
      triggerHaptic(isSuperFastSwipe ? HapticFeedback.Warning : HapticFeedback.Heavy);
      lastTriggerTime = now;
      lastVolume = v;
      lastStep = step;
      return;
    }

    // 中点：50%
    if (step === 50 && lastStep !== 50) {
      triggerHaptic(HapticFeedback.Success);
      lastTriggerTime = now;
      lastVolume = v;
      lastStep = step;
      return;
    }

    if (step !== lastStep) {
      if (step % 5 === 0) {
        // 整 5% 刻度加重，快速滑动进一步增强
        triggerHaptic(isFastSwipe ? HapticFeedback.Heavy : HapticFeedback.Medium);
      } else {
        triggerHaptic(isFastSwipe ? HapticFeedback.Medium : HapticFeedback.Light);
      }
      lastTriggerTime = now;
      lastStep = step;
      lastVolume = v;
    }
  };
}

/* --------------------------- 兼容你原始的模式表 --------------------------- */
/**
 * 若你需要直接使用“毫秒模式”，可以调用 vibratePattern。
 * - 原生后端（Capacitor/Taptic）会忽略该调用（无需，也不可控）
 * - Vibration 后端会按给定 pattern 运行
 */
export function vibratePattern(pattern: number | number[]): boolean {
  const adapter = getAdapter();
  if (adapter.kind !== 'vibration' || !adapter.vibrate) return false;
  return adapter.vibrate(pattern);
}

/**
 * 为兼容旧代码，保留 vibrationPatterns（仅 Vibrate 后端有效）
 * 这些数值经多机型折中：尽量在 Android 上接近 Pixel/旗舰机的触觉感觉。
 */
export const vibrationPatterns: Record<HapticFeedback, number | number[]> = {
  [HapticFeedback.Selection]: 8,             // 极轻、干脆
  [HapticFeedback.Light]: 12,                // 轻触
  [HapticFeedback.Medium]: 20,               // 中等
  [HapticFeedback.Heavy]: 35,                // 重
  [HapticFeedback.Success]: [14, 30, 14],    // 成功：双脉冲
  [HapticFeedback.Warning]: [24, 30, 24, 30, 24], // 警告：三脉冲
};