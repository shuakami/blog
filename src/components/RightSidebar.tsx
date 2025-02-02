"use client";

import MusicPlayer from '@/components/MusicPlayer';
import WeatherCard from '@/components/WeatherCard';
import { motion } from 'framer-motion';

export default function RightSidebar() {
  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-8 py-2"
    >
      {/* 音乐播放器卡片 */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.23, 1, 0.32, 1] }}
      >
        <MusicPlayer isFixed={false} />
      </motion.div>

      {/* 天气卡片 */}
      <WeatherCard />

      {/* 预留的扩展卡片槽位 */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.1, ease: [0.23, 1, 0.32, 1] }}
        className="rounded-2xl overflow-hidden
          bg-gradient-to-br from-white/40 via-white/30 to-white/20 
          dark:from-black/40 dark:via-black/30 dark:to-black/20
          backdrop-blur-xl backdrop-saturate-150
          border border-white/20 dark:border-white/10
          shadow-[0_8px_40px_rgba(0,0,0,0.12)] dark:shadow-[0_8px_40px_rgba(255,255,255,0.12)]
          transition-transform hover:scale-[1.02] hover:-translate-y-1 duration-300"
      >
        <div className="p-6">
          <h2 className="text-xl font-medium text-black/90 dark:text-white/90 mb-4">
            待添加内容
          </h2>
          <div className="text-sm text-black/60 dark:text-white/60">
            这里可以添加更多内容...
          </div>
        </div>
      </motion.div>

      {/* 可以继续添加更多卡片 */}
    </motion.div>
  );
} 