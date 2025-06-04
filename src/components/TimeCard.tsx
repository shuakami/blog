'use client';

import { memo, useEffect, useState } from 'react';

// 样式常量
const CARD_STYLES = {
  base: "bg-white/40 dark:bg-black/40 rounded-xl backdrop-blur-md border border-black/5 dark:border-white/10 shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(255,255,255,0.04)]",
  ring: "ring-1 ring-black/[0.03] dark:ring-white/[0.03]"
};

// 简单的className合并函数
const cn = (...classes: string[]) => classes.filter(Boolean).join(" ");

export const TimeCard = memo(() => {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // 格式化时间
  const timeFormatter = new Intl.DateTimeFormat('zh-CN', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false
  });

  // 格式化日期
  const dateFormatter = new Intl.DateTimeFormat('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    weekday: 'long'
  });

  return (
    <div className={cn(CARD_STYLES.base, CARD_STYLES.ring, "h-full p-6")}>
      <div className="h-full flex flex-col items-center justify-center space-y-2">
        <div className="text-4xl font-mono tracking-wider text-gray-800 dark:text-gray-200">
          {timeFormatter.format(time)}
        </div>
        <div className="text-sm text-gray-500 dark:text-gray-400">
          {dateFormatter.format(time)}
        </div>
      </div>
    </div>
  );
});

TimeCard.displayName = 'TimeCard'; 