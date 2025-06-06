"use client";

import { motion } from 'framer-motion';
import { ArrowUpRight, Activity, Sparkles, Gamepad2, MonitorPlay, WifiOff, Ghost, HeartPulse, Laptop, Tv2 } from 'lucide-react';
import { useState, useEffect } from 'react';

const cardVariants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6, ease: [0.23, 1, 0.32, 1] }
};

interface StatusData {
  alive: {
    text: string;
    color: string;
  };
  activity: {
    text: string;
  };
  availability: {
    status: string;
    reason: string;
    suggestion: string;
    color: string;
  };
  data: {
    process_name: string;
  };
}

const getActivityIcon = (activityText: string, processName: string) => {
  const text = activityText.toLowerCase();
  const process = processName.toLowerCase();
  
  if (text.includes('game') || text.includes('玩') || text.includes('游') || text.includes('the finals')) return <Sparkles size={36} />;
  if (process.includes('code') || process.includes('cursor')) return <Laptop size={36} />;
  if (text.includes('watch') || text.includes('看')) return <Tv2 size={36} />;

  return <MonitorPlay size={36} />;
};

const getAliveIcon = (aliveText: string) => {
  const text = aliveText.toLowerCase();
  if (text.includes('offline') || text.includes('掉线')) return <WifiOff size={20} />;
  if (text.includes('away') || text.includes('不在')) return <Ghost size={20} />;
  return <HeartPulse size={20} />;
};

export default function PersonalStatusCard() {
  const [status, setStatus] = useState<StatusData | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const response = await fetch('https://i.sdjz.wiki/api/copy');
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data: StatusData = await response.json();
        setStatus(data);
        setError(null);
      } catch (e: any) {
        setError(e.message);
        console.error("Failed to fetch status:", e);
      }
    };

    fetchStatus();
    const intervalId = setInterval(fetchStatus, 10000); // 10秒刷新一次

    return () => clearInterval(intervalId); // 组件卸载时清除定时器
  }, []);

  if (error) {
    return (
        <div className="w-full max-w-sm p-5 text-center text-red-500 bg-red-100 dark:bg-red-900/50 rounded-2xl">
          加载动态失败: {error}
        </div>
    );
  }

  if (!status) {
    return (
      <div className="w-full max-w-sm">
        <div className="rounded-2xl p-5 sm:p-6 bg-white/30 dark:bg-neutral-900/50 animate-pulse">
            <div className="h-4 bg-neutral-200 dark:bg-neutral-700 rounded w-1/3 mb-8"></div>
            <div className="flex flex-col items-center justify-center">
                <div className="w-16 h-16 bg-neutral-200 dark:bg-neutral-700 rounded-full mb-4"></div>
                <div className="h-6 bg-neutral-200 dark:bg-neutral-700 rounded w-3/4 mb-6"></div>
                <div className="h-8 bg-neutral-200 dark:bg-neutral-700 rounded-lg w-2/4"></div>
            </div>
        </div>
      </div>
    );
  }

  const aliveIcon = getAliveIcon(status.alive.text);
  const activityIcon = getActivityIcon(status.activity.text, status.data.process_name);

  return (
    <motion.div
      initial={cardVariants.initial}
      animate={cardVariants.animate}
      transition={{ ...cardVariants.transition, delay: 0.2 }}
    >
      <div className="w-full max-w-sm">
        <div className="group rounded-2xl overflow-hidden 
          bg-gradient-to-br from-white/50 via-white/40 to-white/30
          dark:from-neutral-900/70 dark:via-neutral-800/60 dark:to-neutral-800/50
          backdrop-blur-lg backdrop-saturate-150
          border border-white/30 dark:border-neutral-700/80
          transition-transform duration-300 hover:-translate-y-1"
        >
          <div className="p-5 sm:p-6">
            <div className="flex items-center justify-between mb-3 sm:mb-4">
              <div className="flex items-center space-x-2">
                <span className={status.alive.color}>
                  {aliveIcon}
                </span>
                <p className={`text-xs sm:text-sm font-medium ${status.alive.color}`}>
                  {status.alive.text}
                </p>
              </div>
            </div>

            <div className="mb-4 sm:mb-5 text-center">
              <div className="inline-flex items-center justify-center p-3 bg-gradient-to-br from-sky-400/20 to-blue-500/20 dark:from-sky-600/30 dark:to-blue-700/30 rounded-full mb-2 sm:mb-3">
                <span className={status.availability.color}>
                  {activityIcon}
                </span>
              </div>
              <h3 className="text-base sm:text-lg font-semibold text-neutral-800 dark:text-neutral-100 truncate" title={status.availability.reason}>
                {status.availability.status}
              </h3>
            </div>

            <a 
              href="https://i.sdjz.wiki" 
              target="_blank" 
              rel="noopener noreferrer"
              className="group/link flex items-center justify-center text-xs sm:text-sm text-sky-600 dark:text-sky-400 hover:text-sky-700 dark:hover:text-sky-300 transition-colors duration-200 font-medium py-2 px-3 rounded-lg bg-sky-500/10 dark:bg-sky-500/5 hover:bg-sky-500/20 dark:hover:bg-sky-500/10"
            >
              查看完整动态
              <ArrowUpRight size={14} className="ml-1 opacity-70 group-hover/link:opacity-100 transition-opacity duration-200" />
            </a>
          </div>
        </div>
      </div>
    </motion.div>
  );
}