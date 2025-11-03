'use client';

import { useState, useRef, useEffect } from 'react';
import { Play, Pause, SkipBack, SkipForward, Volume2, VolumeX, List, ChevronDown, ChevronUp } from 'lucide-react';
import Image from 'next/image';
import clsx from 'clsx';
import { getPlaylist, type Track, getPlayProgress, savePlayProgress, getSavedPlaylist } from '@/utils/netease';
import axios from 'axios';
import { useMusicPlayer } from '@/hooks/useMusicPlayer';
import { PlaylistModal } from './PlaylistModal';
import { usePlayerStore } from '@/hooks/usePlayerStore';

// 歌曲信息类型
interface Song {
  id: string;
  title: string;
  artist: string;
  cover: string;
  url: string;
}

interface MusicPlayerProps {
  isMobile?: boolean;
  isFixed?: boolean;
}

// 示例歌曲数据
const DEMO_SONG: Song = {
  id: '1',
  title: 'I Really Want to Stay At Your House',
  artist: 'Rosa Walton/Hallie Coggins',
  cover: '/music/covers/music.jpg',
  url: 'https://music.163.com/song/media/outer/url?id=1496089152.mp3'
};

// 骨架屏组件
function MusicPlayerSkeleton() {
  return (
    <div className="rounded-xl overflow-hidden bg-gradient-to-b from-gray-200 to-gray-300 dark:from-gray-800 dark:to-gray-900">
      <div className="p-4 space-y-4">
        {/* 标题骨架 */}
        <div className="h-6 w-24 bg-gray-300 dark:bg-gray-700 rounded animate-pulse" />
        
        {/* 封面骨架 */}
        <div className="aspect-square w-32 mx-auto rounded-lg bg-gray-300 dark:bg-gray-700 animate-pulse" />
        
        {/* 歌曲信息骨架 */}
        <div className="space-y-2 text-center">
          <div className="h-5 w-40 mx-auto bg-gray-300 dark:bg-gray-700 rounded animate-pulse" />
          <div className="h-4 w-32 mx-auto bg-gray-300 dark:bg-gray-700 rounded animate-pulse" />
        </div>
        
        {/* 进度条骨架 */}
        <div className="h-1 w-full bg-gray-300 dark:bg-gray-700 rounded animate-pulse" />
        
        {/* 控制按钮骨架 */}
        <div className="flex justify-center space-x-8">
          <div className="w-8 h-8 rounded-full bg-gray-300 dark:bg-gray-700 animate-pulse" />
          <div className="w-8 h-8 rounded-full bg-gray-300 dark:bg-gray-700 animate-pulse" />
          <div className="w-8 h-8 rounded-full bg-gray-300 dark:bg-gray-700 animate-pulse" />
        </div>
      </div>
    </div>
  );
}

// 进度条组件
const ProgressBar = ({ progress, isPlaying, onClick }: { 
  progress: number; 
  isPlaying: boolean;
  onClick: (e: React.MouseEvent<HTMLDivElement>) => void;
}) => {
  return (
    <div 
      className="relative h-1 group cursor-pointer"
      onClick={onClick}
    >
      {/* 背景轨道 */}
      <div className="absolute inset-0 bg-black/10 dark:bg-white/30 rounded-full" />
      
      {/* 进度条 */}
      <div 
        className="absolute inset-y-0 left-0 bg-black/30 dark:bg-white/90 rounded-full transition-all"
        style={{ width: `${progress}%` }}
      />

      {/* 指示器 */}
      <div 
        className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-3 h-3 bg-black/30 dark:bg-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
        style={{ left: `${progress}%` }}
      />
    </div>
  );
};

const PLAYLIST_ID = '8308939217';
const PAGE_SIZE = 10;
const PRELOAD_THRESHOLD = 0.8;  // 播放到80%时预加载
const BASE_URL = 'http://music-api.sdjz.wiki';

export default function MusicPlayer({ isMobile = false, isFixed = false }: MusicPlayerProps) {
  const [isImageLoading, setIsImageLoading] = useState(true);
  const { isMinimized, setMinimized, isPlaylistOpen, setPlaylistOpen } = usePlayerStore();
  const {
    isPlaying,
    currentTime,
    duration,
    volume,
    isMuted,
    playlist,
    currentTrackIndex,
    currentTrack,
    isLoading,
    isAudioReady,
    hasMore,
    isLoadingMore,
    togglePlay,
    playPrevious,
    playNext,
    playTrack,
    loadMore,
    setVolume,
    setMuted,
    audioElement
  } = useMusicPlayer();

  // 进度条点击
  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (audioElement) {
      const rect = e.currentTarget.getBoundingClientRect();
      const percent = (e.clientX - rect.left) / rect.width;
      audioElement.currentTime = percent * duration;
    }
  };

  // 音量控制
  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value);
    setVolume(value);
    if (audioElement) {
      audioElement.volume = value;
    }
  };

  // 格式化时间
  const formatTime = (time: number) => {
    if (!time || isNaN(time)) return '0:00';
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  // 计算进度百分比
  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;

  // 只在非移动端显示骨架屏
  if (!isMobile && (isLoading || !currentTrack)) return <MusicPlayerSkeleton />;
  if (isMobile && !currentTrack) return null;

  return (
    <>
      <div 
        className={clsx(
          'bg-white/80 dark:bg-black/80 backdrop-blur-xl',
          'border border-black/5 dark:border-white/5',
          'transition-all duration-300',
          isFixed && 'fixed left-0 right-0',
          isFixed && (isMinimized ? '-bottom-20' : 'bottom-0'),
          isMobile ? 'rounded-t-xl' : 'rounded-xl',
          !isMinimized && 'hover:bottom-0'
        )}
      >
        {isMobile ? (
          // 移动端迷你播放器
          <div className="relative">
            {/* 收起按钮 */}
            <button
              className="absolute -top-6 left-1/2 -translate-x-1/2 p-1 bg-white/80 dark:bg-black/80 rounded-t-xl border border-black/5 dark:border-white/5 border-b-0 z-10"
              onClick={() => setMinimized(!isMinimized)}
            >
              {isMinimized ? (
                <ChevronUp className="w-4 h-4 text-black/60 dark:text-white/60" />
              ) : (
                <ChevronDown className="w-4 h-4 text-black/60 dark:text-white/60" />
              )}
            </button>

            {/* 进度条 */}
            <div className="absolute top-0 left-0 right-0">
              <ProgressBar 
                progress={progressPercent} 
                isPlaying={isPlaying}
                onClick={handleProgressClick}
              />
            </div>

            <div className="h-20 flex items-center px-4 pt-2">
              <div className="flex items-center flex-1 gap-3">
                <div 
                  className="relative w-12 h-12 rounded-lg overflow-hidden flex-shrink-0 cursor-pointer"
                  onClick={() => setPlaylistOpen(true)}
                >
                  <Image
                    src={`${currentTrack.cover.split('?')[0]}?param=60y60`}
                    alt={currentTrack.name}
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-medium text-black/80 dark:text-white/80 truncate">
                    {currentTrack.name}
                  </h3>
                  <p className="text-xs text-black/60 dark:text-white/60 truncate">
                    {currentTrack.artist}
                  </p>
                  <div className="flex items-center gap-2 mt-1 text-xs text-black/40 dark:text-white/40">
                    <span>{formatTime(currentTime)}</span>
                    <span>/</span>
                    <span>{formatTime(duration)}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button 
                    className="p-1.5 hover:bg-black/5 dark:hover:bg-white/5 rounded-full transition-colors"
                    onClick={playPrevious}
                  >
                    <SkipBack className="w-4 h-4 text-black/60 dark:text-white/60" />
                  </button>
                  <button 
                    className="p-2 bg-black/10 dark:bg-white/10 hover:bg-black/20 dark:hover:bg-white/20 rounded-full transition-colors"
                    onClick={togglePlay}
                  >
                    {isPlaying ? (
                      <Pause className="w-5 h-5 text-black/80 dark:text-white/80" />
                    ) : (
                      <Play className="w-5 h-5 text-black/80 dark:text-white/80" />
                    )}
                  </button>
                  <button 
                    className="p-1.5 hover:bg-black/5 dark:hover:bg-white/5 rounded-full transition-colors"
                    onClick={playNext}
                  >
                    <SkipForward className="w-4 h-4 text-black/60 dark:text-white/60" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ) : (
          // 桌面端播放器
          <div className="p-4 space-y-4">
            {/* 封面图片 */}
            <div 
              className="relative aspect-square w-32 mx-auto rounded-lg overflow-hidden shadow-lg cursor-pointer"
              onClick={() => setPlaylistOpen(true)}
            >
              <div className={clsx(
                'absolute inset-0 bg-black/5 dark:bg-white/5',
                isImageLoading ? 'block' : 'hidden'
              )} />
              <Image
                src={currentTrack.cover}
                alt={`${currentTrack.name} - ${currentTrack.artist}`}
                fill
                className="object-cover transition-opacity duration-200"
                onLoad={() => setIsImageLoading(false)}
                onError={() => setIsImageLoading(false)}
              />
              {/* 播放列表按钮 */}
              <div className="absolute inset-0 flex items-center justify-center bg-black/0 hover:bg-black/40 transition-colors group">
                <List className="w-8 h-8 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            </div>

            {/* 歌曲信息 */}
            <div className="text-center space-y-1">
              <h3 className="text-base font-medium text-black/80 dark:text-white/80 line-clamp-1">
                {currentTrack.name}
              </h3>
              <p className="text-sm text-black/60 dark:text-white/60 line-clamp-1">
                {currentTrack.artist}
              </p>
            </div>

            {/* 进度条 */}
            <div className="space-y-1">
              <ProgressBar 
                progress={progressPercent} 
                isPlaying={isPlaying}
                onClick={handleProgressClick}
              />
              <div className="flex justify-between text-xs text-black/40 dark:text-white/40 px-1">
                <span>{formatTime(currentTime)}</span>
                <span>{formatTime(duration)}</span>
              </div>
            </div>

            {/* 控制按钮 */}
            <div className="flex items-center justify-center gap-6">
              <button 
                className="p-1.5 hover:bg-black/5 dark:hover:bg-white/5 rounded-full transition-colors"
                onClick={playPrevious}
              >
                <SkipBack className="w-4 h-4 text-black/60 dark:text-white/60" />
              </button>
              
              <button 
                className="p-2 bg-black/10 dark:bg-white/10 hover:bg-black/20 dark:hover:bg-white/20 rounded-full transition-colors"
                onClick={togglePlay}
              >
                {isPlaying ? (
                  <Pause className="w-5 h-5 text-black/80 dark:text-white/80" />
                ) : (
                  <Play className="w-5 h-5 text-black/80 dark:text-white/80" />
                )}
              </button>
              
              <button 
                className="p-1.5 hover:bg-black/5 dark:hover:bg-white/5 rounded-full transition-colors"
                onClick={playNext}
              >
                <SkipForward className="w-4 h-4 text-black/60 dark:text-white/60" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* 播放列表模态框 */}
      <PlaylistModal
        isOpen={isPlaylistOpen}
        onClose={() => setPlaylistOpen(false)}
        playlist={playlist}
        currentTrack={currentTrack}
        currentTrackIndex={currentTrackIndex}
        isPlaying={isPlaying}
        onTrackSelect={playTrack}
        onLoadMore={loadMore}
        hasMore={hasMore}
        isLoadingMore={isLoadingMore}
        onPlayPrevious={playPrevious}
        onPlayNext={playNext}
        onTogglePlay={togglePlay}
        currentTime={currentTime}
        duration={duration}
        onProgressChange={handleProgressClick}
      />
    </>
  );
} 