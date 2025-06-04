'use client';

import { memo } from 'react';

// 样式常量
const CARD_STYLES = {
  base: "bg-white/40 dark:bg-black/40 rounded-xl backdrop-blur-md border border-black/5 dark:border-white/10 shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(255,255,255,0.04)]",
  ring: "ring-1 ring-black/[0.03] dark:ring-white/[0.03]"
};

// 简单的className合并函数
const cn = (...classes: string[]) => classes.filter(Boolean).join(" ");

export const WeatherCard = memo(() => {
  return (
    <div className={cn(CARD_STYLES.base, CARD_STYLES.ring, "h-full p-6")}>
      {/* 空白卡片 */}
    </div>
  );
});

WeatherCard.displayName = 'WeatherCard'; 