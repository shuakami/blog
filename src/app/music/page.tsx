"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { ChevronDown, ChevronUp, Play, Pause } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

import { Skeleton } from "@/components/ui/skeleton"
import { UnifiedSong } from "@/lib/types"
import { useMusicPlayer } from "@/hooks/use-music-player"


export default function MusicPage() {
  const {
    playlist,
    currentSong,
    nextUpSongs,
    isPlaying,
    isLoading,
    hasMore,
    currentSongIndex,
    handleSongChange,
    handleNextSong,
    handlePrevSong,
    handleTogglePlay,
    loadMoreSongsForUI,
  } = useMusicPlayer()

  const [hasMounted, setHasMounted] = useState(false)
  const [isLoadingMore, setIsLoadingMore] = useState(false)

  useEffect(() => {
    setHasMounted(true)
  }, [])

  // 懒加载：滚动到底部时加载更多歌曲
  useEffect(() => {
    const handleScroll = async () => {
      if (isLoadingMore || !hasMore) return

      const scrollTop = window.pageYOffset || document.documentElement.scrollTop
      const windowHeight = window.innerHeight
      const documentHeight = document.documentElement.offsetHeight
      
      // 当滚动到距离底部200px时触发加载
      if (scrollTop + windowHeight >= documentHeight - 200) {
        setIsLoadingMore(true)
        try {
          const hasLoadedNew = await loadMoreSongsForUI()
          if (!hasLoadedNew) {
            // 如果没有加载到新歌曲，可能是到达了列表末尾
            console.log('没有更多歌曲可加载')
          }
        } catch (error) {
          console.error('加载更多歌曲失败:', error)
        } finally {
          setIsLoadingMore(false)
        }
      }
    }

    // 防抖处理，避免频繁触发
    let timeoutId: NodeJS.Timeout
    const debouncedHandleScroll = () => {
      clearTimeout(timeoutId)
      timeoutId = setTimeout(handleScroll, 100)
    }

    window.addEventListener('scroll', debouncedHandleScroll)
    return () => {
      window.removeEventListener('scroll', debouncedHandleScroll)
      clearTimeout(timeoutId)
    }
  }, [isLoadingMore, hasMore, loadMoreSongsForUI])

  if (!hasMounted || !playlist || (playlist.length === 0 && isLoading)) {
    return (
      <div className="space-y-16 pt-8">
        <div className="space-y-4">
          <Skeleton className="h-9 w-24" />
          <Skeleton className="h-6 w-48" />
        </div>
        <div className="grid grid-cols-1 items-end gap-8 lg:grid-cols-3">
            <Skeleton className="aspect-square w-full" />
            <div className="space-y-4">
                <Skeleton className="h-12 w-3/4" />
                <Skeleton className="h-8 w-1/2" />
                <Skeleton className="h-5 w-2/3" />
            </div>
            <div className="hidden space-y-4 lg:block">
                 <Skeleton className="h-16 w-full" />
                 <Skeleton className="h-16 w-full" />
                 <Skeleton className="h-16 w-full" />
            </div>
        </div>
      </div>
    )
  }
  
  if (!currentSong) return null

  return (
    <div className="space-y-16 pt-8">
      <div className="space-y-4">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">
          音乐
        </h1>
        <p className="text-muted-foreground">
          听歌吗？ 每日更新。
        </p>
      </div>

      <div className="grid grid-cols-1 items-end gap-8 lg:grid-cols-3">
        <div className="relative aspect-square w-full lg:col-span-1">
          <Image
            src={currentSong.coverUrl}
            alt={currentSong.title}
            fill
            className="object-cover"
            sizes="(max-width: 1024px) 100vw, 33vw"
          />
        </div>

        <div className="relative flex h-full flex-col justify-between overflow-hidden lg:col-span-1">
          <div className="space-y-3">
            <h2 className="text-4xl font-bold leading-tight tracking-tighter text-foreground md:text-5xl">
              {currentSong.title}
            </h2>
            <p className="text-xl text-foreground/90 md:text-2xl">
              {currentSong.artist}
            </p>
            <p className="text-md text-muted-foreground">
              来自专辑《{currentSong.album}》
            </p>
          </div>

          <div className="relative z-10 mt-8 flex items-center gap-4 pt-4">
            <button
              onClick={handlePrevSong}
              className="rounded-full border border-border p-3 text-muted-foreground transition-colors hover:border-foreground hover:text-foreground"
              aria-label="上一首"
            >
              <ChevronUp className="h-6 w-6" />
            </button>
            <button
              onClick={handleTogglePlay}
              className="group relative rounded-full border border-foreground bg-foreground p-4 text-background transition-transform"
              aria-label={isPlaying ? "暂停" : "播放"}
            >
              <div className="absolute inset-0 cursor-pointer rounded-full bg-foreground/20 opacity-0 transition-opacity group-hover:opacity-100" />
              {isPlaying ? (
                <Pause className="h-6 w-6 fill-background" />
              ) : (
                <Play className="h-6 w-6 fill-background" />
              )}
            </button>
            <button
              onClick={handleNextSong}
              className="rounded-full border border-border p-3 text-muted-foreground transition-colors hover:border-foreground hover:text-foreground"
              aria-label="下一首"
            >
              <ChevronDown className="h-6 w-6" />
            </button>
          </div>
        </div>

        <div className="hidden lg:col-span-1 lg:block">
          <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
            接下来播放
          </h3>
          <div className="space-y-4">
            {nextUpSongs.map((song: UnifiedSong, index: number) => {
              const songIndex = currentSongIndex + index + 1
              return (
                <div
                  key={song.id}
                  className="group flex cursor-pointer items-center gap-4 rounded-md p-2 transition-colors hover:bg-secondary/50"
                  onClick={() => handleSongChange(songIndex)}
                >
                  <div className="relative aspect-square h-12 w-12 shrink-0">
                    <Image
                      src={song.coverUrl}
                      alt={song.album}
                      fill
                      className="object-cover"
                      sizes="48px"
                    />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium text-foreground">{song.title}</h4>
                    <p className="text-sm text-muted-foreground">{song.artist}</p>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      <div className="pt-16">
        <div className="mb-8 space-y-2">
          <h2 className="text-2xl font-bold tracking-tight text-foreground">
            唱片墙
          </h2>
          <p className="text-muted-foreground">豪听。</p>
        </div>
        <div className="grid grid-cols-2 gap-px sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
          {playlist.map((song, index) => {
            const isCurrentSong = index === currentSongIndex
            return (
              <motion.div 
                key={`${song.id}-${index}`} 
                initial={{ opacity: 0, scale: 0.8, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ 
                  duration: 0.5, 
                  ease: "easeOut",
                  delay: index < 20 ? 0 : Math.min(0.1 * (index % 20), 0.8)
                }}
                className="group relative aspect-square cursor-pointer overflow-hidden"
                onClick={() => {
                  if (isCurrentSong) {
                    // 如果点击的是当前歌曲，切换播放/暂停状态
                    handleTogglePlay()
                  } else {
                    // 如果点击的是其他歌曲，切换到该歌曲
                    handleSongChange(index)
                  }
                }}
              >
                <Image
                  src={song.coverUrl}
                  alt={`${song.title} by ${song.artist}`}
                  fill
                  className={`object-cover transition-all duration-300 ${
                    isCurrentSong ? 'scale-105' : 'group-hover:scale-105'
                  }`}
                  sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, (max-width: 1280px) 20vw, 16.6vw"
                  />
                  
                  {/* 播放按钮覆盖层 */}
                <div className={`absolute inset-0 flex items-center justify-center bg-foreground/80 transition-opacity duration-300 ${
                  isCurrentSong ? 'opacity-90' : 'opacity-0 group-hover:opacity-100'
                }`}>
                  <div className="text-center text-background p-4">
                    <div className="flex items-center justify-center mb-2">
                      <div className="w-12 h-12 rounded-full bg-background/20 flex items-center justify-center">
                        {isCurrentSong && isPlaying ? (
                          <Pause className="h-6 w-6 fill-background" />
                        ) : (
                          <Play className="h-6 w-6 fill-background translate-x-0.5" />
                        )}
                      </div>
                    </div>
                    <h3 className="text-sm font-bold line-clamp-2">{song.title}</h3>
                    <p className="mt-1 text-xs text-background/90 line-clamp-1">{song.artist}</p>
                    <p className="mt-1 text-xs text-background/70 line-clamp-1">{song.album}</p>
                  </div>
                </div>
              </motion.div>
            )
          })}
        </div>
        
        {/* 懒加载状态指示器 */}
        <AnimatePresence>
          {(isLoadingMore || hasMore) && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="mt-8 flex justify-center"
            >
              {isLoadingMore ? (
                <motion.div 
                  initial={{ scale: 0.8 }}
                  animate={{ scale: 1 }}
                  className="flex items-center gap-3 text-muted-foreground"
                >
                  <div className="relative w-5 h-5">
                    <div className="absolute inset-0 w-5 h-5 border-2 border-muted rounded-full" />
                    <div className="absolute inset-0 w-5 h-5 border-2 border-foreground border-t-transparent rounded-full animate-spin" />
                  </div>
                  <span className="text-sm font-medium">加载更多歌曲...</span>
                </motion.div>
              ) : hasMore ? (
                <motion.div 
                  initial={{ opacity: 0.6 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.3, repeat: Infinity, repeatType: "reverse" }}
                  className="text-muted-foreground text-sm"
                >
                  继续滚动加载更多
                </motion.div>
              ) : null}
            </motion.div>
          )}
        </AnimatePresence>
        
        {/* 没有更多内容的提示 */}
        <AnimatePresence>
          {!hasMore && playlist.length > 0 && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4, ease: "easeOut" }}
              className="mt-8 text-center"
            >
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-secondary/50 rounded-full backdrop-blur-sm">
                <div className="w-2 h-2 bg-muted-foreground rounded-full" />
                <span className="text-muted-foreground text-sm font-medium">
                  已加载全部歌曲 ({playlist.length} 首)
                </span>
                <div className="w-2 h-2 bg-muted-foreground rounded-full" />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}