"use client";

import MusicPlayer from '@/components/MusicPlayer';
import WeatherCard from '@/components/WeatherCard';
import PersonalStatusCard from '@/components/PersonalStatusCard';
import { motion } from 'framer-motion';

export default function RightSidebar() {
  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <div className="space-y-8 py-2">
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

        {/* 个人状态卡片 */}
        <PersonalStatusCard />

        {/* 预留的扩展卡片槽位 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1, ease: [0.23, 1, 0.32, 1] }}
        >

        </motion.div>

        {/* 可以继续添加更多卡片 */}
      </div>
    </motion.div>
  );
} 