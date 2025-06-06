"use client";

import { useState, useEffect } from 'react';
import useSWR from 'swr';
import { motion, AnimatePresence } from 'framer-motion';
import { WiDaySunny, WiCloudy, WiRain, WiSnow, WiDust, WiStrongWind, WiHumidity, WiStrongWind as WindIcon } from 'react-icons/wi';
import { IoLocationSharp } from 'react-icons/io5';
import type { IconType } from 'react-icons';
import clsx from 'clsx';

const fetcher = (url: string) => fetch(url).then(res => res.json());

// 天气背景配色
const weatherGradients: Record<string, string> = {
  '晴': 'from-[#4CB8FF] to-[#2F6FF3]',
  '多云': 'from-[#8BA2B8] to-[#52687D]',
  '阴': 'from-[#7C8C9B] to-[#4A5B6C]',
  '雨': 'from-[#4A6FA1] to-[#2B4162]',
  '雪': 'from-[#8BA7C1] to-[#456585]',
  '霾': 'from-[#9B9B9B] to-[#5C5C5C]',
  '风': 'from-[#7BA4CF] to-[#3E6A9E]',
};

// 天气图标映射
const weatherIcons: Record<string, IconType> = {
  '晴': WiDaySunny,
  '多云': WiCloudy,
  '阴': WiCloudy,
  '雨': WiRain,
  '雪': WiSnow,
  '霾': WiDust,
  '风': WiStrongWind,
};

// 骨架屏组件
function WeatherSkeleton() {
  return (
    <div className="rounded-xl overflow-hidden bg-gradient-to-b from-gray-200 to-gray-300 dark:from-gray-800 dark:to-gray-900">
      <div className="p-4 space-y-4">
        {/* 位置骨架 */}
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 rounded-full bg-gray-300 dark:bg-gray-700 animate-pulse" />
          <div className="w-20 h-5 rounded bg-gray-300 dark:bg-gray-700 animate-pulse" />
        </div>
        
        {/* 温度骨架 */}
        <div className="flex justify-center items-center space-x-4">
          <div className="w-24 h-16 rounded bg-gray-300 dark:bg-gray-700 animate-pulse" />
          <div className="w-12 h-12 rounded-full bg-gray-300 dark:bg-gray-700 animate-pulse" />
        </div>
        
        {/* 天气状况骨架 */}
        <div className="flex justify-between items-center">
          <div className="w-16 h-4 rounded bg-gray-300 dark:bg-gray-700 animate-pulse" />
          <div className="flex space-x-4">
            <div className="w-12 h-4 rounded bg-gray-300 dark:bg-gray-700 animate-pulse" />
            <div className="w-12 h-4 rounded bg-gray-300 dark:bg-gray-700 animate-pulse" />
          </div>
        </div>
        
        {/* 预报骨架 */}
        <div className="grid grid-cols-3 gap-4 pt-4 border-t border-gray-300/20 dark:border-gray-700/20">
          {[0, 1, 2].map(i => (
            <div key={i} className="space-y-2">
              <div className="w-12 h-3 mx-auto rounded bg-gray-300 dark:bg-gray-700 animate-pulse" />
              <div className="w-16 h-4 mx-auto rounded bg-gray-300 dark:bg-gray-700 animate-pulse" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function WeatherCard() {
  const [city, setCity] = useState<string>('');

  // 获取位置信息，并解构出 isLoading 状态
  const { data: locationData, isLoading: isLocationLoading } = useSWR('/api/location', fetcher);

  // 获取天气信息，并解构出 isLoading 状态
  const { data: weatherData, error, isLoading: isWeatherLoading } = useSWR(
    city ? `/api/weather?city=${encodeURIComponent(city)}` : null,
    fetcher,
    { refreshInterval: 1800000 } // 30分钟刷新一次
  );

  // 更新城市
  useEffect(() => {
    if (locationData?.city) {
      setCity(locationData.city);
    }
  }, [locationData]);

  // 获取天气图标
  const getWeatherIcon = (text: string) => {
    const Icon = Object.entries(weatherIcons).find(([key]) => text.includes(key))?.[1] || weatherIcons['晴'];
    return <Icon className="w-12 h-12 text-white" />;
  };

  // 获取天气背景
  const getWeatherGradient = (text: string) => {
    const gradient = Object.entries(weatherGradients).find(([key]) => text.includes(key))?.[1] || weatherGradients['晴'];
    return `bg-gradient-to-b ${gradient}`;
  };

  // 格式化日期
  const formatDate = (date: string) => {
    const d = new Date(date);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    if (d.toDateString() === today.toDateString()) return '今天';
    if (d.toDateString() === tomorrow.toDateString()) return '明天';
    return `${d.getMonth() + 1}/${d.getDate()}`;
  };

  // 统一的加载状态判断
  const isLoading = isLocationLoading || (city && isWeatherLoading) || (!city && !error);

  if (error) return (
    <div className="text-sm text-red-500/80 dark:text-red-400/80">
      加载天气信息失败
    </div>
  );

  if (isLoading) return <WeatherSkeleton />;

  if (!weatherData?.data) return null;

  const { now, forecast } = weatherData.data;
  
  const cardClassName = clsx(
    'rounded-xl overflow-hidden',
    getWeatherGradient(now.text),
    'shadow-lg shadow-black/10'
  );

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.6, ease: [0.23, 1, 0.32, 1] }}
      >
        <div className={cardClassName}>
          <div className="p-4">
            {/* 位置信息 */}
            <div className="flex items-center space-x-2 mb-4">
              <IoLocationSharp className="w-4 h-4 text-white/90" />
              <span className="text-sm font-medium text-white">
                {city}
              </span>
            </div>

            {/* 主要天气信息 */}
            <div className="flex flex-col items-center mb-4">
              <div className="text-6xl font-light text-white mb-2 ml-2">
                {now.temp}°
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-lg text-white/90">
                  {now.text}
                </span>
              </div>
            </div>

            {/* 天气指标 */}
            <div className="flex justify-center space-x-6 mb-4">
              <div className="flex items-center text-white/80">
                <WiHumidity className="w-5 h-5 mr-1" />
                <span className="text-sm">{now.humidity}%</span>
              </div>
              <div className="flex items-center text-white/80">
                <WindIcon className="w-5 h-5 mr-1" />
                <span className="text-sm">{now.windSpeed}km/h</span>
              </div>
            </div>

            {/* 天气预报 */}
            <div className="grid grid-cols-3 gap-2 pt-3 border-t border-white/20">
              {forecast.map((day: any) => (
                <div key={day.fxDate} className="text-center">
                  <div className="text-xs text-white/80 mb-1">
                    {formatDate(day.fxDate)}
                  </div>
                  <div className="text-sm font-medium text-white">
                    {day.tempMax}° / {day.tempMin}°
                  </div>
                </div>
              ))}
            </div>

            {/* 版权声明 */}
            <div className="mt-3 text-[10px] text-white/60 text-center">
              数据来源于和风天气
            </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
} 