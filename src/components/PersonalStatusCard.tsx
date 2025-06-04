"use client";

import { motion } from 'framer-motion';
import { ArrowUpRight, Activity, Sparkles, Gamepad2, MonitorPlay, WifiOff, Ghost, HeartPulse, Laptop, Tv2 } from 'lucide-react';

const cardVariants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6, ease: [0.23, 1, 0.32, 1] }
};

const mockStatus = {
  alive: {
    options: [
      { text: "我还没死", icon: <HeartPulse size={20} /> },
      { text: "还活着呢", icon: <Activity size={20} /> }
    ]
  },
  currentActivity: {
    options: [
      { text: "在玩《最终幻想XIV》", icon: <Gamepad2 size={36} /> },
      { text: "VSCode 启动！", icon: <Laptop size={36} /> },
      { text: "在玩原神", icon: <Gamepad2 size={36} /> },
      { text: "在玩 THE FINALS", icon: <Sparkles size={36} /> }
    ]
  },
};

const getRandomItem = (arr: any[]) => arr[Math.floor(Math.random() * arr.length)];

export default function PersonalStatusCard() {
  const aliveInfo = getRandomItem(mockStatus.alive.options);
  const currentActivity = getRandomItem(mockStatus.currentActivity.options);

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
                <span className="text-sky-500 dark:text-sky-400">
                  {aliveInfo.icon}
                </span>
                <p className="text-xs sm:text-sm font-medium text-neutral-700 dark:text-neutral-300">
                  {aliveInfo.text}
                </p>
              </div>
            </div>

            <div className="mb-4 sm:mb-5 text-center">
              <div className="inline-flex items-center justify-center p-3 bg-gradient-to-br from-sky-400/20 to-blue-500/20 dark:from-sky-600/30 dark:to-blue-700/30 rounded-full mb-2 sm:mb-3">
                <span className="text-sky-600 dark:text-sky-400">
                  {currentActivity.icon}
                </span>
              </div>
              <h3 className="text-base sm:text-lg font-semibold text-neutral-800 dark:text-neutral-100 truncate" title={currentActivity.text}>
                {currentActivity.text}
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