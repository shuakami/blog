'use client'

import { useState, useEffect, useRef } from 'react'
import Image from 'next/image'
import { useParams } from 'next/navigation'
import { Play, Pause } from 'lucide-react'
import { motion, useMotionValue, animate } from 'framer-motion'
import { Skeleton } from '@/components/ui/skeleton'
import { UnifiedSong } from '@/lib/types'

interface LyricLine {
  time: number
  text: string
}

export default function MusicSharePage() {
  const params = useParams()
  const id = params.id as string

  const [song, setSong] = useState<UnifiedSong | null>(null)
  const [lyrics, setLyrics] = useState<LyricLine[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [isMuted, setIsMuted] = useState(false)
  const [volume, setVolume] = useState(1)
  const [hasMounted, setHasMounted] = useState(false)
  const audioRef = useRef<HTMLAudioElement>(null)
  const lyricsContainerRef = useRef<HTMLDivElement>(null)
  const [currentLyricIndex, setCurrentLyricIndex] = useState(0)
  const lyricRefs = useRef<(HTMLDivElement | null)[]>([])

  // 解析 LRC 格式歌词
  const parseLyrics = (lrcContent: string): LyricLine[] => {
    if (!lrcContent) return []

    const lines = lrcContent.split('\n')
    const lyricLines: LyricLine[] = []

    lines.forEach((line) => {
      const match = line.match(/\[(\d+):(\d+\.\d+)\](.+)/)
      if (match) {
        const minutes = parseInt(match[1])
        const seconds = parseFloat(match[2])
        const time = minutes * 60 + seconds
        const text = match[3].trim()
        if (text) {
          lyricLines.push({ time, text })
        }
      }
    })

    return lyricLines.sort((a, b) => a.time - b.time)
  }

  // 获取歌曲详情和歌词
  useEffect(() => {
    const fetchSongData = async () => {
      try {
        setIsLoading(true)

        // 获取歌曲详情
        const detailRes = await fetch(`/api/music/detail?id=${id}`)
        const detailData = await detailRes.json()

        if (!detailData.success) {
          throw new Error('Failed to fetch song details')
        }

        const songDetail = detailData.detail

        // 获取播放地址
        let playUrl = ''
        try {
          const urlRes = await fetch(`/api/music/url?id=${id}`)
          const urlData = await urlRes.json()
          if (urlData.success && urlData.url?.url) {
            playUrl = urlData.url.url
          }
        } catch (error) {
          console.error('Failed to fetch music URL:', error)
        }

        const unifiedSong: UnifiedSong = {
          id: songDetail.id,
          title: songDetail.name,
          artist: songDetail.singer || 'Unknown',
          album: songDetail.album || 'Unknown',
          coverUrl: songDetail.picimg || '',
          duration: 0,
          url: playUrl,
        }

        setSong(unifiedSong)

        // 获取歌词
        const lyricRes = await fetch(`/api/music/lyric?id=${id}`)
        const lyricData = await lyricRes.json()

        if (lyricData.success && lyricData.lyric?.lrc) {
          const parsedLyrics = parseLyrics(lyricData.lyric.lrc)
          setLyrics(parsedLyrics)
        }
      } catch (error) {
        console.error('Failed to fetch song data:', error)
      } finally {
        setIsLoading(false)
      }
    }

    if (id) {
      fetchSongData()
    }
  }, [id])

  // 初始化：禁用滚动和隐藏 footer
  useEffect(() => {
    setHasMounted(true)
    
    document.documentElement.style.overflow = 'hidden'
    document.body.style.overflow = 'hidden'
    const footer = document.querySelector('footer')
    if (footer) {
      footer.style.display = 'none'
    }
    
    return () => {
      document.documentElement.style.overflow = ''
      document.body.style.overflow = ''
      const footer = document.querySelector('footer')
      if (footer) {
        footer.style.display = ''
      }
    }
  }, [])

  // 处理音频时间更新
  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return

    const handleTimeUpdate = () => {
      setCurrentTime(audio.currentTime)

      // 更新当前歌词索引
      if (lyrics.length > 0) {
        for (let i = lyrics.length - 1; i >= 0; i--) {
          if (audio.currentTime >= lyrics[i].time) {
            setCurrentLyricIndex(i)
            break
          }
        }
      }
    }

    const handleDurationChange = () => {
      setDuration(audio.duration)
    }

    const handleEnded = () => {
      setIsPlaying(false)
    }

    audio.addEventListener('timeupdate', handleTimeUpdate)
    audio.addEventListener('durationchange', handleDurationChange)
    audio.addEventListener('ended', handleEnded)

    return () => {
      audio.removeEventListener('timeupdate', handleTimeUpdate)
      audio.removeEventListener('durationchange', handleDurationChange)
      audio.removeEventListener('ended', handleEnded)
    }
  }, [lyrics])

  // 优化的歌词滚动
  useEffect(() => {
    if (!lyricsContainerRef.current || lyrics.length === 0 || !isPlaying) return
    
    const currentElement = lyricRefs.current[currentLyricIndex]
    const container = lyricsContainerRef.current
    
    if (currentElement && container) {
      const containerHeight = container.clientHeight
      const elementTop = currentElement.offsetTop
      const elementHeight = currentElement.clientHeight
      
      // 计算目标滚动位置（让当前歌词在容器中间偏上的位置）
      const targetScroll = elementTop - containerHeight / 3
      
      // 使用平滑滚动
      container.scrollTo({
        top: Math.max(0, targetScroll),
        behavior: 'smooth'
      })
    }
  }, [currentLyricIndex, lyrics, isPlaying])

  const handlePlayPause = () => {
    if (!audioRef.current || !song?.url) return

    if (isPlaying) {
      audioRef.current.pause()
    } else {
      audioRef.current.play()
    }
    setIsPlaying(!isPlaying)
  }

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value)
    setVolume(newVolume)
    if (audioRef.current) {
      audioRef.current.volume = newVolume
    }
  }

  const handleMute = () => {
    if (!audioRef.current) return
    if (isMuted) {
      audioRef.current.volume = volume
    } else {
      audioRef.current.volume = 0
    }
    setIsMuted(!isMuted)
  }

  const handleProgressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTime = parseFloat(e.target.value)
    if (audioRef.current) {
      audioRef.current.currentTime = newTime
      setCurrentTime(newTime)
    }
  }

  const formatTime = (seconds: number) => {
    if (!seconds || isNaN(seconds)) return '0:00'
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  if (isLoading || !song) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-full max-w-4xl mx-auto px-4 py-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <Skeleton className="aspect-square w-full rounded-2xl" />
            <div className="space-y-4">
              <Skeleton className="h-12 w-3/4" />
              <Skeleton className="h-6 w-1/2" />
              <Skeleton className="h-6 w-2/3" />
              <div className="pt-8 space-y-4">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center py-8 md:py-16 relative overflow-hidden">
      {/* 高斯模糊渐变背景 */}
      <div className="absolute inset-0 bg-gradient-to-br from-background via-background to-secondary/20 blur-3xl opacity-80" />
      <div className="absolute inset-0 bg-gradient-to-tr from-secondary/10 to-background blur-2xl opacity-60" />
      <div className="absolute inset-0 bg-background/40" />
      <audio
        ref={audioRef}
        src={song.url}
        crossOrigin="anonymous"
      />

      <div className="w-full max-w-6xl px-6 md:px-8 mx-auto relative z-10">
        {/* 主要内容区域 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16">
          {/* 右侧：歌词为主 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
            className="lg:col-span-1 flex flex-col min-h-0 order-2 lg:order-1"
          >
            {/* 歌曲信息 */}
            <div className="mb-10 space-y-2">
              <h1 className="text-4xl md:text-5xl font-bold text-foreground tracking-tight leading-tight">
                {song.title}
              </h1>
              <p className="text-lg text-muted-foreground font-medium">
                {song.artist}
              </p>
              <p className="text-sm text-muted-foreground/60">
                {song.album}
              </p>
            </div>

            {/* 歌词显示 */}
            {lyrics.length > 0 ? (
              <div className="relative flex-1 min-h-0">
                {/* 顶部渐变遮罩 */}
                <div className="absolute top-0 left-0 right-0 h-12 bg-gradient-to-b from-background to-transparent pointer-events-none z-10" />
                
                <div
                  ref={lyricsContainerRef}
                  className="h-[400px] lg:h-[500px] overflow-y-auto py-12 pr-6 space-y-6
                    [&::-webkit-scrollbar]:hidden
                    [&]:scrollbar-hide
                    scroll-smooth"
                >
                  {lyrics.map((line, index) => (
                    <motion.div
                      key={index}
                      ref={(el) => { if (el) lyricRefs.current[index] = el }}
                      initial={{ opacity: 0.3 }}
                      animate={{
                        opacity: index === currentLyricIndex ? 1 : 0.35,
                        scale: index === currentLyricIndex ? 1 : 0.98,
                      }}
                      transition={{ 
                        duration: 0.4,
                        ease: [0.16, 1, 0.3, 1]
                      }}
                      className={`transition-all duration-400 leading-relaxed ${
                        index === currentLyricIndex
                          ? 'text-foreground font-semibold text-2xl md:text-3xl'
                          : 'text-muted-foreground text-xl md:text-2xl'
                      }`}
                    >
                      {line.text}
                    </motion.div>
                  ))}
                  <div className="h-48" /> {/* 底部留白 */}
                </div>

                {/* 底部渐变遮罩 */}
                <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-background via-background/80 to-transparent pointer-events-none" />
              </div>
            ) : (
              <div className="flex-1 flex items-center justify-center">
                <p className="text-muted-foreground/60 text-sm">暂无歌词</p>
              </div>
            )}
          </motion.div>

          {/* 左侧：封面和播放器 */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="lg:col-span-1 order-1 lg:order-2 flex flex-col"
          >
            <div className="sticky top-8 flex flex-col h-[600px] lg:h-[700px] space-y-8">
              {/* 专辑封面 */}
              <div className="relative flex-1 w-full max-w-none">
                <Image
                  src={song.coverUrl}
                  alt={song.title}
                  fill
                  className="object-cover"
                  priority
                />
              </div>

              {/* 播放器控制 */}
              <div className="space-y-6">
                {/* 进度条 */}
                <div className="space-y-3">
                  <div className="relative group">
                    <input
                      type="range"
                      min="0"
                      max={duration || 0}
                      value={currentTime}
                      onChange={handleProgressChange}
                      className="w-full h-1.5 bg-secondary/50 rounded-full appearance-none cursor-pointer
                        [&::-webkit-slider-thumb]:appearance-none 
                        [&::-webkit-slider-thumb]:w-3.5 
                        [&::-webkit-slider-thumb]:h-3.5 
                        [&::-webkit-slider-thumb]:rounded-full 
                        [&::-webkit-slider-thumb]:bg-foreground
                        [&::-webkit-slider-thumb]:shadow-md
                        [&::-webkit-slider-thumb]:transition-all
                        [&::-webkit-slider-thumb]:scale-0
                        group-hover:[&::-webkit-slider-thumb]:scale-100
                        [&::-moz-range-thumb]:w-3.5 
                        [&::-moz-range-thumb]:h-3.5 
                        [&::-moz-range-thumb]:rounded-full 
                        [&::-moz-range-thumb]:bg-foreground
                        [&::-moz-range-thumb]:border-0
                        [&::-moz-range-thumb]:shadow-md
                        [&::-moz-range-thumb]:transition-all
                        [&::-moz-range-thumb]:scale-0
                        group-hover:[&::-moz-range-thumb]:scale-100"
                      style={{
                        background: `linear-gradient(to right, hsl(var(--foreground)) 0%, hsl(var(--foreground)) ${(currentTime / (duration || 1)) * 100}%, hsl(var(--secondary)) ${(currentTime / (duration || 1)) * 100}%, hsl(var(--secondary)) 100%)`
                      }}
                    />
                  </div>
                  <div className="flex justify-between text-xs font-medium tabular-nums text-muted-foreground">
                    <span>{formatTime(currentTime)}</span>
                    <span>{formatTime(duration)}</span>
                  </div>
                </div>

                {/* 播放按钮 */}
                <div className="flex items-center justify-center">
                  <button
                    onClick={handlePlayPause}
                    disabled={!song.url}
                    className="w-14 h-14 rounded-full bg-foreground text-background 
                      flex items-center justify-center 
                      hover:scale-105 active:scale-95
                      transition-all duration-200
                      disabled:opacity-50 disabled:cursor-not-allowed 
                      shadow-lg hover:shadow-xl
                      disabled:hover:scale-100"
                  >
                    {isPlaying ? (
                      <Pause className="w-6 h-6 fill-background" />
                    ) : (
                      <Play className="w-6 h-6 fill-background ml-0.5" />
                    )}
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}