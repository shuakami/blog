import { type Track } from '@/utils/netease';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import Image from 'next/image';
import { Play, Pause, SkipBack, SkipForward } from 'lucide-react';
import clsx from 'clsx';
import { useTheme } from 'next-themes';

interface PlaylistModalProps {
  isOpen: boolean;
  onClose: () => void;
  playlist: Track[];
  currentTrack: Track | null;
  currentTrackIndex: number;
  isPlaying: boolean;
  onTrackSelect: (index: number) => void;
  onLoadMore: () => void;
  hasMore: boolean;
  isLoadingMore: boolean;
  onPlayPrevious: () => void;
  onPlayNext: () => void;
  onTogglePlay: () => void;
  currentTime: number;
  duration: number;
  onProgressChange: (e: React.MouseEvent<HTMLDivElement>) => void;
}

// 进度条组件
const ProgressBar = ({ progress, isPlaying, onClick }: { 
  progress: number; 
  isPlaying: boolean;
  onClick: (e: React.MouseEvent<HTMLDivElement>) => void;
}) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <div 
      className="relative h-1 group cursor-pointer"
      onClick={onClick}
    >
      {/* 背景轨道 */}
      <div className={clsx(
        "absolute inset-0 rounded-full",
        isDark ? "bg-white/10" : "bg-black/10"
      )} />
      
      {/* 进度条 */}
      <div 
        className={clsx(
          "absolute inset-y-0 left-0 rounded-full transition-all",
          isDark ? "bg-white/30" : "bg-black/30"
        )}
        style={{ width: `${progress}%` }}
      />

      {/* 指示器 */}
      <div 
        className={clsx(
          "absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-3 h-3 rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-lg",
          isDark ? "bg-white" : "bg-black"
        )}
        style={{ left: `${progress}%` }}
      />
    </div>
  );
};

// 格式化时间
const formatTime = (time: number) => {
  if (!time || isNaN(time)) return '0:00';
  const minutes = Math.floor(time / 60);
  const seconds = Math.floor(time % 60);
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
};

export function PlaylistModal({
  isOpen,
  onClose,
  playlist,
  currentTrack,
  currentTrackIndex,
  isPlaying,
  onTrackSelect,
  onLoadMore,
  hasMore,
  isLoadingMore,
  onPlayPrevious,
  onPlayNext,
  onTogglePlay,
  currentTime,
  duration,
  onProgressChange
}: PlaylistModalProps) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  if (!currentTrack) return null;

  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] p-0 overflow-hidden rounded-2xl border-0 shadow-2xl">
        {/* 背景图层 */}
        <div className="absolute inset-0 z-0">
          {/* 主背景图 */}
          <Image
            src={currentTrack.cover}
            alt={currentTrack.name}
            fill
            className={clsx(
              "object-cover scale-110 blur-2xl",
              isDark ? "opacity-20" : "opacity-10"
            )}
          />
          {/* 渐变遮罩 */}
          <div className={clsx(
            "absolute inset-0",
            isDark 
              ? "bg-gradient-to-b from-black/30 via-black/50 to-black/80" 
              : "bg-gradient-to-b from-white/60 via-white/80 to-white/90"
          )} />
          {/* 毛玻璃效果 */}
          <div className="absolute inset-0 backdrop-blur-2xl backdrop-saturate-150" />
          {/* 微光效果 */}
          <div className={clsx(
            "absolute inset-0 bg-gradient-to-tr",
            isDark 
              ? "from-white/[0.05] to-transparent" 
              : "from-black/[0.02] to-transparent"
          )} />
        </div>

        {/* 内容区 */}
        <div className="relative z-10 grid grid-cols-[320px_1fr] h-[80vh]">
          {/* 左侧：封面和控制区 */}
          <div className="p-8 flex flex-col">
            {/* 封面图 */}
            <div className="relative aspect-square w-full rounded-2xl overflow-hidden shadow-[0_15px_40px_-15px_rgba(0,0,0,0.3)]">
              <Image
                src={currentTrack.cover}
                alt={currentTrack.name}
                fill
                className="object-cover"
              />
              {/* 封面光效 */}
              <div className={clsx(
                "absolute inset-0 bg-gradient-to-t",
                isDark ? "from-black/20" : "from-black/10",
                "to-transparent"
              )} />
            </div>

            {/* 歌曲信息 */}
            <div className="mt-6 text-center">
              <h2 className={clsx(
                "text-xl font-medium mb-2 tracking-tight",
                isDark ? "text-white" : "text-black"
              )}>
                {currentTrack.name}
              </h2>
              <p className={clsx(
                "text-sm tracking-wide",
                isDark ? "text-white/60" : "text-black/60"
              )}>
                {currentTrack.artist}
              </p>
            </div>

            {/* 进度条 */}
            <div className="mt-6 space-y-2">
              <ProgressBar 
                progress={progressPercent}
                isPlaying={isPlaying}
                onClick={onProgressChange}
              />
              <div className={clsx(
                "flex justify-between text-xs px-1 font-medium tracking-wider",
                isDark ? "text-white/40" : "text-black/40"
              )}>
                <span>{formatTime(currentTime)}</span>
                <span>{formatTime(duration)}</span>
              </div>
            </div>

            {/* 控制按钮 */}
            <div className="mt-6 flex items-center justify-center gap-8">
              <button 
                className={clsx(
                  "group relative p-1.5 rounded-full transition-all duration-200",
                  "hover:scale-105 active:scale-95"
                )}
                onClick={onPlayPrevious}
              >
                <div className={clsx(
                  "absolute inset-0 rounded-full transition-all",
                  isDark 
                    ? "bg-white/5 group-hover:bg-white/10 group-active:bg-white/15"
                    : "bg-black/5 group-hover:bg-black/10 group-active:bg-black/15"
                )} />
                <SkipBack className={clsx(
                  "w-5 h-5 transition-colors",
                  isDark 
                    ? "text-white/80 group-hover:text-white"
                    : "text-black/80 group-hover:text-black"
                )} />
              </button>
              
              <button 
                className={clsx(
                  "group relative p-4 rounded-full transition-all duration-200",
                  "hover:scale-105 active:scale-95"
                )}
                onClick={onTogglePlay}
              >
                <div className={clsx(
                  "absolute inset-0 rounded-full transition-all",
                  isDark 
                    ? "bg-white/10 group-hover:bg-white/15 group-active:bg-white/20"
                    : "bg-black/10 group-hover:bg-black/15 group-active:bg-black/20"
                )} />
                {isPlaying ? (
                  <Pause className={clsx(
                    "w-6 h-6",
                    isDark ? "text-white" : "text-black"
                  )} />
                ) : (
                  <Play className={clsx(
                    "w-6 h-6 translate-x-0.5",
                    isDark ? "text-white" : "text-black"
                  )} />
                )}
              </button>
              
              <button 
                className={clsx(
                  "group relative p-1.5 rounded-full transition-all duration-200",
                  "hover:scale-105 active:scale-95"
                )}
                onClick={onPlayNext}
              >
                <div className={clsx(
                  "absolute inset-0 rounded-full transition-all",
                  isDark 
                    ? "bg-white/5 group-hover:bg-white/10 group-active:bg-white/15"
                    : "bg-black/5 group-hover:bg-black/10 group-active:bg-black/15"
                )} />
                <SkipForward className={clsx(
                  "w-5 h-5 transition-colors",
                  isDark 
                    ? "text-white/80 group-hover:text-white"
                    : "text-black/80 group-hover:text-black"
                )} />
              </button>
            </div>
          </div>

          {/* 右侧：播放列表 */}
          <div className="bg-gradient-to-b from-transparent via-black/[0.02] to-black/[0.02] dark:from-transparent dark:via-white/[0.02] dark:to-white/[0.02]">
            <div className="px-8 py-6">
              <h3 className={clsx(
                "text-lg font-medium",
                isDark ? "text-white/90" : "text-black/90"
              )}>
                播放列表
              </h3>
              <p className={clsx(
                "text-sm mt-1",
                isDark ? "text-white/50" : "text-black/50"
              )}>
                共 {playlist.length} 首歌曲
              </p>
            </div>
            
            <ScrollArea className="h-[calc(80vh-76px)]">
              <div className="px-6 space-y-1">
                {playlist.map((track, index) => (
                  <div
                    key={track.id}
                    className={clsx(
                      'group flex items-center gap-4 p-3 rounded-xl cursor-pointer transition-all duration-200',
                      isDark 
                        ? [
                            'hover:bg-white/5',
                            currentTrackIndex === index && 'bg-white/[0.08]'
                          ]
                        : [
                            'hover:bg-black/5',
                            currentTrackIndex === index && 'bg-black/[0.08]'
                          ]
                    )}
                    onClick={() => onTrackSelect(index)}
                  >
                    {/* 封面 */}
                    <div className="relative w-12 h-12 rounded-lg overflow-hidden flex-shrink-0 transition-transform duration-200 group-hover:scale-105">
                      <Image
                        src={`${track.cover.split('?')[0]}?param=60y60`}
                        alt={track.name}
                        fill
                        className="object-cover"
                      />
                    </div>
                    
                    {/* 歌曲信息 */}
                    <div className="flex-1 min-w-0">
                      <h4 className={clsx(
                        'text-sm font-medium truncate transition-colors duration-200',
                        isDark
                          ? [
                              currentTrackIndex === index 
                                ? 'text-white' 
                                : 'text-white/70 group-hover:text-white/90'
                            ]
                          : [
                              currentTrackIndex === index 
                                ? 'text-black' 
                                : 'text-black/70 group-hover:text-black/90'
                            ]
                      )}>
                        {track.name}
                      </h4>
                      <p className={clsx(
                        'text-xs truncate mt-1 transition-colors duration-200',
                        isDark
                          ? 'text-white/40 group-hover:text-white/60'
                          : 'text-black/40 group-hover:text-black/60'
                      )}>
                        {track.artist}
                      </p>
                    </div>
                    
                    {/* 播放状态 */}
                    {currentTrackIndex === index && (
                      <div className="flex-shrink-0 w-8 h-8 flex items-center justify-center">
                        {isPlaying ? (
                          <Pause className={clsx(
                            "w-5 h-5",
                            isDark ? "text-white/90" : "text-black/90"
                          )} />
                        ) : (
                          <Play className={clsx(
                            "w-5 h-5",
                            isDark ? "text-white/90" : "text-black/90"
                          )} />
                        )}
                      </div>
                    )}
                  </div>
                ))}
                
                {/* 加载更多 */}
                {hasMore && (
                  <div className="px-2">
                    <button
                      className={clsx(
                        'w-full py-4 text-sm font-medium tracking-wide transition-colors duration-200 rounded-xl',
                        isDark
                          ? ['text-white/50 hover:text-white/70 hover:bg-white/[0.02]']
                          : ['text-black/50 hover:text-black/70 hover:bg-black/[0.02]'],
                        isLoadingMore && 'opacity-50 cursor-not-allowed'
                      )}
                      onClick={onLoadMore}
                      disabled={isLoadingMore}
                    >
                      {isLoadingMore ? '加载中...' : '加载更多'}
                    </button>
                  </div>
                )}
              </div>
            </ScrollArea>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
} 