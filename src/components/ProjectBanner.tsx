'use client';

import React from 'react';

export type ProjectBannerProps = {
  /** 项目标题 */
  title: string;
  /** 项目描述 */
  description?: string;
  /** SVG Icon (作为 React element) */
  icon?: React.ReactNode;
  /** 容器宽度 */
  width?: number | string;
  /** 容器高度 */
  height?: number | string;
  /** 可选的 className */
  className?: string;
  /** 基础线性渐变颜色 */
  linearFrom?: string;
  linearTo?: string;
  /** 基础线性渐变的角度（度数） */
  linearAngleDeg?: number;
  /** 径向光晕颜色 */
  radialColor?: string;
  radialOpacityInner?: number;
  radialOpacityMid?: number;
  radialOpacityOuter?: number;
  radialPosX?: string;
  radialPosY?: string;
  radialSizeX?: string;
  radialSizeY?: string;
};

/** 十六进制 → RGB 辅助函数 */
function hexToRgb(hex: string) {
  let h = hex.trim();
  if (h.startsWith('#')) h = h.slice(1);
  if (h.length === 3) h = h.split('').map((c) => c + c).join('');
  const int = parseInt(h, 16);
  const r = (int >> 16) & 255;
  const g = (int >> 8) & 255;
  const b = int & 255;
  return { r, g, b };
}

function toRgba(color: string, alpha: number) {
  if (color.startsWith('#')) {
    const { r, g, b } = hexToRgb(color);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  }
  if (color.startsWith('rgb')) {
    const nums = color
      .replace(/rgba?\(/, '')
      .replace(/\)/, '')
      .split(',')
      .map((v) => Number(v.trim()));
    const [r, g, b] = nums;
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  }
  return `color-mix(in srgb, ${color} ${Math.round(alpha * 100)}%, transparent)`;
}

const DEFAULTS: Required<Omit<ProjectBannerProps,
  'title' | 'description' | 'icon' | 'className'>> = {
  width: '100%',
  height: '100%',
  linearFrom: '#0099FF',
  linearTo: '#B8F2FF',
  linearAngleDeg: 90,
  radialColor: '#BCF0D3',
  radialOpacityInner: 1.0,
  radialOpacityMid: 0.6,
  radialOpacityOuter: 0.0,
  radialPosX: '96%',
  radialPosY: '6%',
  radialSizeX: '68%',
  radialSizeY: '85%',
};

export default function ProjectBanner(props: ProjectBannerProps) {
  const p = { ...DEFAULTS, ...props };

  const radialInner = toRgba(p.radialColor, p.radialOpacityInner);
  const radialMid = toRgba(p.radialColor, p.radialOpacityMid);
  const radialOuter = toRgba(p.radialColor, p.radialOpacityOuter);

  const backgroundImage = [
    // 多个白色光晕，营造自然感
    'radial-gradient(ellipse at 0% 100%, rgba(255, 255, 255, 0.25) 0%, transparent 50%)',
    'radial-gradient(ellipse at 0% 0%, rgba(255, 255, 255, 0.1) 0%, transparent 40%)',
    // 右上角的薄荷绿色亮角
    `radial-gradient(ellipse ${p.radialSizeX} ${p.radialSizeY} at ${p.radialPosX} ${p.radialPosY}, ${radialInner} 0%, ${radialMid} 40%, ${radialOuter} 70%)`,
    // 底层明亮蓝色渐变
    `linear-gradient(${p.linearAngleDeg}deg, ${p.linearFrom} 0%, ${p.linearTo} 100%)`,
  ].join(', ');

  const containerStyle: React.CSSProperties = {
    width: typeof p.width === 'number' ? `${p.width}px` : p.width,
    height: typeof p.height === 'number' ? `${p.height}px` : p.height,
    backgroundImage,
    backgroundRepeat: 'no-repeat',
    backgroundSize: '100% 100%',
    position: 'relative',
    overflow: 'hidden',
  };

  return (
    <div
      style={containerStyle}
      className={`relative flex items-center justify-center rounded-lg md:rounded-xl p-4 sm:p-6 md:p-8 ${props.className || ''}`}
    >
      {/* Icon | 文字 水平布局 */}
      <div className="flex items-center gap-3 sm:gap-5 md:gap-8">
        {/* SVG Icon */}
        {props.icon && (
          <div className="w-12 h-12 sm:w-16 sm:h-16 md:w-20 md:h-20 text-white flex-shrink-0 [&>svg]:w-full [&>svg]:h-full">
            {props.icon}
          </div>
        )}

        {/* 文字内容 */}
        <div className="flex flex-col gap-1 sm:gap-1.5 md:gap-2">
          {/* 标题 */}
          <h2 className="text-2xl sm:text-3xl md:text-5xl lg:text-6xl xl:text-7xl font-semibold text-white select-none leading-tight">
            {props.title}
          </h2>

          {/* 描述 */}
          {props.description && (
            <p className="text-xs sm:text-sm md:text-base lg:text-lg text-white/80 select-none leading-relaxed">
              {props.description}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

