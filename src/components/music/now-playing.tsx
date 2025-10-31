"use client"

import { useState, useEffect, useRef } from "react"
import Image from "next/image"
import { Music, Play, Pause, SkipBack, SkipForward, Volume2, VolumeX, Volume1 } from "lucide-react"
import { useMusicPlayer } from "@/hooks/use-music-player"
import { AnimatePresence, motion, HTMLMotionProps } from "framer-motion"

interface NowPlayingProps {
  isSidebarOpen?: boolean
}

export function NowPlaying({ isSidebarOpen = true }: NowPlayingProps) {
  const { 
    isPlaying, 
    currentSong, 
    parsedLyrics, 
    currentLyricIndex,
    nextUpSongs,
    handleTogglePlay,
    handleNextSong,
    handlePrevSong,
    handleSongChange,
    currentSongIndex,
    audioRef
  } = useMusicPlayer()
  
  const [isHovered, setIsHovered] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [isDragging, setIsDragging] = useState(false)
  const [windowWidth, setWindowWidth] = useState(0)
  const [volume, setVolume] = useState(1) // 音量状态 (0-1)
  const [previousVolume, setPreviousVolume] = useState(1) // 记住静音前的音量
  const [isVolumeHovered, setIsVolumeHovered] = useState(false)
  const [isVolumeDragging, setIsVolumeDragging] = useState(false)
  const hoverTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const volumeTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  // 智能文本截断函数
  const truncateText = (text: string, maxLength: number) => {
    if (!text || text.length <= maxLength) return text
    return `${text.substring(0, maxLength)}...`
  }

  // 响应式长度限制
  const getResponsiveConfig = () => {
    if (windowWidth < 768) return { 
      title: 12, 
      lyric: 30
    }  // 手机端
    if (windowWidth < 1024) return { 
      title: 16, 
      lyric: 50
    } // 平板端
    return { 
      title: 20, 
      lyric: 80
    } // 桌面端
  }

  const { title: maxTitleLength, lyric: maxLyricLength } = getResponsiveConfig()
  
  // 处理歌曲标题
  const displayTitle = truncateText(currentSong?.title || '', maxTitleLength)
  
  // 处理歌词
  let lyricText = parsedLyrics[currentLyricIndex]?.text

  if (!lyricText && isPlaying && currentSong?.lyrics && !currentSong.lyrics.original) {
    lyricText = "..."
  }
  
  // 如果没有歌词文本，显示默认符号和文字
  const displayLyric = lyricText ? truncateText(lyricText, maxLyricLength) : "♪ Interlude"

  const lyricKey = displayLyric ? currentLyricIndex : "no-lyric"

  // 监听音频进度
  useEffect(() => {
    const audio = audioRef?.current
    if (!audio) return

    const updateTime = () => {
      if (!isDragging) {
        setCurrentTime(audio.currentTime)
        setDuration(audio.duration || 0)
      }
    }

    // 初始化音量
    audio.volume = volume

    audio.addEventListener('timeupdate', updateTime)
    audio.addEventListener('loadedmetadata', updateTime)
    
    return () => {
      audio.removeEventListener('timeupdate', updateTime)
      audio.removeEventListener('loadedmetadata', updateTime)
    }
  }, [audioRef, isDragging, volume])

  // 监听窗口大小变化和初始化音量
  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth)
    }
    
    // 初始化窗口大小
    handleResize()
    
    // 从localStorage读取保存的音量
    const savedVolume = localStorage.getItem('musicPlayer-volume')
    const savedPreviousVolume = localStorage.getItem('musicPlayer-previousVolume')
    
    if (savedVolume !== null) {
      const volumeValue = parseFloat(savedVolume)
      if (volumeValue >= 0 && volumeValue <= 1) {
        setVolume(volumeValue)
      }
    }
    
    if (savedPreviousVolume !== null) {
      const prevVolumeValue = parseFloat(savedPreviousVolume)
      if (prevVolumeValue >= 0 && prevVolumeValue <= 1) {
        setPreviousVolume(prevVolumeValue)
      }
    }
    
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  // 清理定时器
  useEffect(() => {
    return () => {
      if (hoverTimeoutRef.current) {
        clearTimeout(hoverTimeoutRef.current)
      }
      if (volumeTimeoutRef.current) {
        clearTimeout(volumeTimeoutRef.current)
      }
    }
  }, [])

  // 进度条处理
  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const audio = audioRef?.current
    if (!audio || !duration) return

    const rect = e.currentTarget.getBoundingClientRect()
    const clickX = e.clientX - rect.left
    const percentage = clickX / rect.width
    const newTime = percentage * duration
    
    audio.currentTime = newTime
    setCurrentTime(newTime)
  }

  // 格式化时间
  const formatTime = (time: number) => {
    if (!time || isNaN(time)) return "0:00"
    const minutes = Math.floor(time / 60)
    const seconds = Math.floor(time % 60)
    return `${minutes}:${seconds.toString().padStart(2, '0')}`
  }

  // 音量控制函数
  const handleVolumeChange = (newVolume: number) => {
    const clampedVolume = Math.max(0, Math.min(1, newVolume))
    setVolume(clampedVolume)
    
    // 记住非零音量作为previousVolume
    if (clampedVolume > 0) {
      setPreviousVolume(clampedVolume)
      localStorage.setItem('musicPlayer-previousVolume', clampedVolume.toString())
    }
    
    // 保存音量到localStorage
    localStorage.setItem('musicPlayer-volume', clampedVolume.toString())
    
    if (audioRef?.current) {
      audioRef.current.volume = clampedVolume
    }
  }

  const handleVolumeToggle = () => {
    if (volume > 0) {
      // 静音：记住当前音量并设为0
      setPreviousVolume(volume)
      localStorage.setItem('musicPlayer-previousVolume', volume.toString())
      handleVolumeChange(0)
    } else {
      // 恢复：使用之前记住的音量
      handleVolumeChange(previousVolume)
    }
  }

  // 音量拖拽处理
  const handleVolumeMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsVolumeDragging(true)
    const rect = e.currentTarget.getBoundingClientRect()
    const clickY = e.clientY - rect.top
    const percentage = 1 - (clickY / rect.height)
    handleVolumeChange(percentage)
  }

  // 监听全局鼠标事件进行拖拽
  useEffect(() => {
    if (!isVolumeDragging) return

    const handleMouseMove = (e: MouseEvent) => {
      const volumeSlider = document.querySelector('.volume-slider') as HTMLElement
      if (!volumeSlider) return
      
      const rect = volumeSlider.getBoundingClientRect()
      const y = e.clientY - rect.top
      const percentage = Math.max(0, Math.min(1, 1 - (y / rect.height)))
      handleVolumeChange(percentage)
    }

    const handleMouseUp = () => {
      setIsVolumeDragging(false)
      // 拖拽结束后延迟隐藏滑块
      setTimeout(() => {
        if (!isVolumeHovered && !isVolumeDragging) {
          setIsVolumeHovered(false)
        }
      }, 300)
    }

    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseup', handleMouseUp)

    return () => {
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
    }
  }, [isVolumeDragging])

  // 根据音量选择图标
  const getVolumeIcon = () => {
    if (volume === 0) return VolumeX
    if (volume < 0.5) return Volume1
    return Volume2
  }

  const VolumeIcon = getVolumeIcon()

  // 计算进度百分比
  const progressPercentage = duration ? (currentTime / duration) * 100 : 0

  // 检测是否为移动端
  const isMobile = windowWidth < 768
  
  // 根据侧边栏状态计算偏移量（仅桌面端）
  const sidebarWidth = 192
  const gutter = 24
  // 歌词需要向右偏移侧边栏宽度的一半来视觉居中（移动端不偏移）
  const mainOffset = !isMobile && isSidebarOpen ? (sidebarWidth + gutter) / 2 : 0
  // Tooltip 也需要相应调整
  const tooltipOffset = isSidebarOpen ? -350 + mainOffset : -290

  if (!currentSong) {
    return null
  }

  return (
    <div 
      className="relative"
      onMouseEnter={() => {
        if (hoverTimeoutRef.current) {
          clearTimeout(hoverTimeoutRef.current)
          hoverTimeoutRef.current = null
        }
        setIsHovered(true)
      }}
      onMouseLeave={() => {
        hoverTimeoutRef.current = setTimeout(() => {
          setIsHovered(false)
        }, 150)
      }}
    >
      {/* 主显示区域 - 动态宽度容器，内容自适应 */}
      <div 
        className="flex items-center gap-3 text-sm text-muted-foreground cursor-pointer transition-all duration-300 ease-out"
        style={{ marginLeft: `${mainOffset}px` }}
      >
        {/* 桌面端显示音乐图标 */}
        {!isMobile && <Music className="h-4 w-4 flex-shrink-0" />}
        <div className="flex items-center gap-2 min-w-0">
          {/* 桌面端显示歌曲名称 */}
          {!isMobile && <span className="font-medium text-foreground">{displayTitle}</span>}
          <div className="relative h-5 max-w-[600px] min-w-[160px] overflow-hidden">
            <AnimatePresence>
              {displayLyric && (
                <motion.div
                  key={lyricKey}
                  initial={{ y: "100%" }}
                  animate={{ y: 0 }}
                  exit={{ y: "-100%" }}
                  transition={{ duration: 0.5, ease: "easeInOut" }}
                  // @ts-ignore - framer-motion type issue
                  className="absolute inset-0 flex items-center justify-center gap-2"
                >
                  {/* 桌面端显示分隔符 */}
                  {!isMobile && <span className="text-muted-foreground flex-shrink-0">-</span>}
                  <p className="truncate text-muted-foreground text-center">{displayLyric}</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
        
      </div>

      {/* 优雅的Tooltip */}
      <AnimatePresence mode="wait">
        {isHovered && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            // @ts-ignore - framer-motion type issue
            className="absolute top-full mt-2 z-50 transition-all duration-300 ease-out"
            style={{ left: `calc(50% + ${tooltipOffset}px)`, transform: 'translateX(-50%)' }}
            onMouseEnter={() => {
              if (hoverTimeoutRef.current) {
                clearTimeout(hoverTimeoutRef.current)
                hoverTimeoutRef.current = null
              }
              setIsHovered(true)
            }}
            onMouseLeave={() => {
              hoverTimeoutRef.current = setTimeout(() => {
                setIsHovered(false)
              }, 150)
            }}
          >
            <div className="bg-card/95 backdrop-blur-xl border border-border rounded-2xl p-6 shadow-2xl w-[640px]">
              <div className="grid grid-cols-5 gap-6 h-full">
                {/* 左栏 - 当前播放控制 */}
                <div className="col-span-3">
                  {/* 专辑封面和基础信息 */}
                  <div className="flex items-start gap-4 mb-4">
                    <div className="relative w-16 h-16 rounded-xl overflow-hidden shadow-lg">
                      <Image
                        src={currentSong.coverUrl}
                        alt={currentSong.album}
                        fill
                        className="object-cover"
                        sizes="64px"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-foreground font-semibold text-base truncate">
                        {currentSong.title}
                      </h3>
                      <p className="text-muted-foreground text-sm truncate">
                        {currentSong.artist}
                      </p>
                      <p className="text-muted-foreground/80 text-xs truncate mt-1">
                        {currentSong.album}
                      </p>
                    </div>
                  </div>

                  {/* 滚动歌词区域 */}
                  <div className="mb-4 h-28 overflow-hidden relative bg-gradient-to-b from-transparent via-muted/20 to-transparent">
                    {parsedLyrics.length > 0 ? (
                      <div className="relative h-full">
                        <motion.div
                          // @ts-ignore - framer-motion type issue
                          className="absolute left-0 right-0 flex flex-col items-center"
                          animate={{ 
                            y: -currentLyricIndex * 32 + 56  // 增加到32px高度适应换行
                          }}
                          transition={{ 
                            duration: 0.6, 
                            ease: [0.25, 0.46, 0.45, 0.94]
                          }}
                        >
                          {parsedLyrics.map((lyric, index) => {
                            const distance = Math.abs(index - currentLyricIndex)
                            const isCurrent = index === currentLyricIndex
                            
                            // 根据距离计算透明度和大小
                            let opacity, fontSize, color
                            
                            if (distance === 0) {
                              opacity = 1
                              fontSize = 'text-sm'
                              color = 'text-foreground font-semibold'
                            } else if (distance === 1) {
                              opacity = 0.7
                              fontSize = 'text-xs'
                              color = 'text-foreground/90'
                            } else if (distance === 2) {
                              opacity = 0.4
                              fontSize = 'text-xs'
                              color = 'text-muted-foreground'
                            } else {
                              opacity = 0.15
                              fontSize = 'text-xs'
                              color = 'text-muted-foreground/70'
                            }

                            return (
                              <div
                                key={index}
                                className={`text-center leading-snug px-2 py-1 min-h-[2rem] flex items-center justify-center ${fontSize} ${color} transition-all duration-500`}
                                style={{ opacity }}
                              >
                                <div className="max-w-full break-words text-center">
                                  {lyric.text || "♪"}
                                </div>
                              </div>
                            )
                          })}
                        </motion.div>
                        

                      </div>
                    ) : (
                      <div className="h-full flex items-center justify-center">
                        <p className="text-muted-foreground text-sm italic">
                          {currentSong.lyrics?.original ? "等待歌词..." : "暂无歌词"}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* 进度条 */}
                  <div className="mb-4">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-xs text-muted-foreground w-10 text-right">
                        {formatTime(currentTime)}
                      </span>
                      <div 
                        className="flex-1 h-1.5 bg-muted rounded-full cursor-pointer"
                        onClick={handleProgressClick}
                      >
                        <motion.div
                          // @ts-ignore - framer-motion type issue
                          className="h-full bg-foreground rounded-full"
                          style={{ width: `${progressPercentage}%` }}
                          initial={false}
                          animate={{ width: `${progressPercentage}%` }}
                          transition={{ duration: 0.1 }}
                        />
                      </div>
                      <span className="text-xs text-muted-foreground w-10">
                        {formatTime(duration)}
                      </span>
                    </div>
                  </div>

                  {/* 播放控制按钮 */}
                  <div className="flex items-center justify-center gap-4">
                    <motion.button
                      whileTap={{ scale: 0.95 }}
                      // @ts-ignore - framer-motion type issue
                      onClick={handlePrevSong}
                      className="w-8 h-8 rounded-full bg-secondary hover:bg-secondary/80 flex items-center justify-center transition-colors"
                    >
                      <SkipBack className="w-4 h-4 text-muted-foreground" />
                    </motion.button>
                    
                    <motion.button
                      whileTap={{ scale: 0.95 }}
                      // @ts-ignore - framer-motion type issue
                      onClick={handleTogglePlay}
                      className="w-12 h-12 rounded-full bg-primary hover:bg-primary/90 flex items-center justify-center transition-colors shadow-lg"
                    >
                      {isPlaying ? (
                        <Pause className="w-5 h-5 text-primary-foreground fill-primary-foreground" />
                      ) : (
                        <Play className="w-5 h-5 text-primary-foreground fill-primary-foreground translate-x-0.5" />
                      )}
                    </motion.button>
                    
                    <motion.button
                      whileTap={{ scale: 0.95 }}
                      // @ts-ignore - framer-motion type issue
                      onClick={handleNextSong}
                      className="w-8 h-8 rounded-full bg-secondary hover:bg-secondary/80 flex items-center justify-center transition-colors"
                    >
                      <SkipForward className="w-4 h-4 text-muted-foreground" />
                    </motion.button>
                    
                  </div>
                </div>

                {/* 右栏 - Next Up 播放列表 */}
                <div className="col-span-2 border-l border-border pl-6">
                  <div className="mb-4 flex items-start justify-between">
                    <div>
                      <h4 className="text-foreground font-semibold text-sm mb-1">Next Up</h4>
                      <p className="text-muted-foreground text-xs">即将播放</p>
                    </div>
                    
                    {/* 音量控制 - 优雅位置 */}
                    <div className="relative">
                      <motion.button
                        // @ts-ignore - framer-motion type issue
                        className="volume-button w-6 h-6 rounded-full bg-transparent hover:bg-secondary flex items-center justify-center transition-colors"
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={handleVolumeToggle}
                        onMouseEnter={() => {
                          if (volumeTimeoutRef.current) {
                            clearTimeout(volumeTimeoutRef.current)
                            volumeTimeoutRef.current = null
                          }
                          setIsVolumeHovered(true)
                        }}
                        onMouseLeave={() => {
                          if (!isVolumeDragging) {
                            volumeTimeoutRef.current = setTimeout(() => {
                              setIsVolumeHovered(false)
                            }, 200)
                          }
                        }}
                      >
                        <VolumeIcon className="w-3 h-3 text-muted-foreground hover:text-foreground" />
                      </motion.button>
                      
                      {/* 音量滑块 */}
                      <AnimatePresence>
                        {(isVolumeHovered || isVolumeDragging) && (
                          <motion.div
                            initial={{ opacity: 0, y: 10, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 10, scale: 0.95 }}
                            transition={{ duration: 0.15, ease: "easeOut" }}
                            // @ts-ignore - framer-motion type issue
                            className="volume-slider-container absolute top-full left-1/2 -translate-x-1/2 mt-2 z-50"
                            onMouseEnter={() => {
                              if (volumeTimeoutRef.current) {
                                clearTimeout(volumeTimeoutRef.current)
                                volumeTimeoutRef.current = null
                              }
                              setIsVolumeHovered(true)
                            }}
                            onMouseLeave={() => {
                              volumeTimeoutRef.current = setTimeout(() => {
                                setIsVolumeHovered(false)
                              }, 200)
                            }}
                          >
                            <div className="bg-card/95 backdrop-blur-xl border border-border rounded-lg p-2 shadow-lg">
                              <div className="flex flex-col items-center gap-2">
                                <span className="text-xs text-muted-foreground font-medium">
                                  {Math.round(volume * 100)}%
                                </span>
                                <div 
                                  className={`volume-slider w-2 h-16 bg-muted/50 dark:bg-muted/30 rounded-full cursor-pointer relative select-none transition-all border border-border/50 ${
                                    isVolumeDragging ? 'w-2.5 shadow-lg' : ''
                                  }`}
                                  onMouseDown={handleVolumeMouseDown}
                                >
                                  <motion.div
                                    // @ts-ignore - framer-motion type issue
                                    className="absolute bottom-0 left-0 right-0 bg-foreground dark:bg-primary rounded-full shadow-sm"
                                    style={{ height: `${volume * 100}%` }}
                                    initial={false}
                                    animate={{ height: `${volume * 100}%` }}
                                    transition={{ duration: 0.1 }}
                                  />
                                </div>
                              </div>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    {nextUpSongs.length > 0 ? (
                      nextUpSongs.slice(0, 4).map((song, index) => {
                        const actualIndex = currentSongIndex + index + 1
                        return (
                          <motion.div
                            key={song.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ 
                              duration: 0.4, 
                              delay: index * 0.05,
                              ease: "easeOut"
                            }}
                            // @ts-ignore - framer-motion type issue
                            className="group flex items-center gap-3 p-2 rounded-lg hover:bg-secondary/50 cursor-pointer transition-all duration-300 ease-out"
                            onClick={() => handleSongChange(actualIndex)}
                          >
                            <div className="relative w-10 h-10 rounded-lg overflow-hidden shadow-sm">
                              <Image
                                src={song.coverUrl}
                                alt={song.album}
                                fill
                                className="object-cover"
                                sizes="40px"
                              />
                            </div>
                            <div className="flex-1 min-w-0">
                              <h5 className="text-foreground text-xs font-medium truncate group-hover:text-foreground/90">
                                {song.title}
                              </h5>
                              <p className="text-muted-foreground text-xs truncate">
                                {song.artist}
                              </p>
                            </div>
                            <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                              <Play className="w-3 h-3 text-muted-foreground fill-muted-foreground" />
                            </div>
                          </motion.div>
                        )
                      })
                    ) : (
                      <div className="flex flex-col items-center justify-center py-8 text-center">
                        <Music className="w-8 h-8 text-muted-foreground mb-2" />
                        <p className="text-muted-foreground text-xs">
                          暂无更多歌曲
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}