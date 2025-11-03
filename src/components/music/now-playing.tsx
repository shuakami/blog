"use client"

import { useState, useEffect, useRef } from "react"
import Image from "next/image"
import { Music, Play, Pause, SkipBack, SkipForward, Volume2, VolumeX, Volume1, X } from "lucide-react"
import { useMusicPlayer } from "@/hooks/use-music-player"
import { AnimatePresence, motion } from "framer-motion"
import * as DialogPrimitive from "@radix-ui/react-dialog"

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

  // ---------------- Popover（点击触发）状态 ----------------
  const [isPopoverOpen, setIsPopoverOpen] = useState(false)          // Desktop: 点击歌词行（限定 640px 宽）切换 Popover
  const popoverRef = useRef<HTMLDivElement | null>(null)             // Popover 容器
  const triggerRef = useRef<HTMLDivElement | null>(null)             // 触发层（仅 640px 宽范围内响应点击）

  // ---------------- 其它 UI 状态 ----------------
  const [isModalOpen, setIsModalOpen] = useState(false)              // Mobile: 仍使用 Dialog
  const [isVolumeExpanded, setIsVolumeExpanded] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [isDragging, setIsDragging] = useState(false)
  const [windowWidth, setWindowWidth] = useState(0)
  const [volume, setVolume] = useState(1)
  const [previousVolume, setPreviousVolume] = useState(1)
  const [isVolumeHovered, setIsVolumeHovered] = useState(false)
  const [isVolumeDragging, setIsVolumeDragging] = useState(false)
  const volumeTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // 主显示行（歌词+标题）用于测量高度，供触发层设置高度
  const displayRowRef = useRef<HTMLDivElement | null>(null)
  const [displayRowHeight, setDisplayRowHeight] = useState(0)

  // 常量（定位/尺寸）
  const TOOLTIP_WIDTH = 640
  const GAP_PX = 8 // Popover 与歌词行之间的视觉间距（纯定位，不再需要“桥接”逻辑）

  // ---------------- 文本截断 / 响应式 ----------------
  const truncateText = (text: string, maxLength: number) => {
    if (!text || text.length <= maxLength) return text
    return `${text.substring(0, maxLength)}...`
  }
  const getResponsiveConfig = () => {
    if (windowWidth < 768) return { title: 12, lyric: 30 }
    if (windowWidth < 1024) return { title: 16, lyric: 50 }
    return { title: 20, lyric: 80 }
  }
  const { title: maxTitleLength, lyric: maxLyricLength } = getResponsiveConfig()
  const displayTitle = truncateText(currentSong?.title || '', maxTitleLength)

  // ---------------- 歌词显示 ----------------
  let lyricText = parsedLyrics[currentLyricIndex]?.text
  if (!lyricText && isPlaying && currentSong?.lyrics && !currentSong.lyrics.original) {
    lyricText = "..."
  }
  const displayLyric = lyricText ? truncateText(lyricText, maxLyricLength) : "♪ Interlude"
  const lyricKey = displayLyric ? currentLyricIndex : "no-lyric"

  // ---------------- 音频进度监听 ----------------
  useEffect(() => {
    const audio = audioRef?.current
    if (!audio) return
    const updateTime = () => {
      if (!isDragging) {
        setCurrentTime(audio.currentTime)
        setDuration(audio.duration || 0)
      }
    }
    audio.volume = volume
    audio.addEventListener('timeupdate', updateTime)
    audio.addEventListener('loadedmetadata', updateTime)
    return () => {
      audio.removeEventListener('timeupdate', updateTime)
      audio.removeEventListener('loadedmetadata', updateTime)
    }
  }, [audioRef, isDragging, volume])

  // ---------------- 窗口大小 & 音量初始化 ----------------
  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth)
    handleResize()
    const savedVolume = localStorage.getItem('musicPlayer-volume')
    const savedPreviousVolume = localStorage.getItem('musicPlayer-previousVolume')
    if (savedVolume !== null) {
      const v = parseFloat(savedVolume)
      if (v >= 0 && v <= 1) setVolume(v)
    }
    if (savedPreviousVolume !== null) {
      const pv = parseFloat(savedPreviousVolume)
      if (pv >= 0 && pv <= 1) setPreviousVolume(pv)
    }
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  // ---------------- 清理定时器 ----------------
  useEffect(() => {
    return () => {
      if (volumeTimeoutRef.current) clearTimeout(volumeTimeoutRef.current)
    }
  }, [])

  // ---------------- 进度条点击 ----------------
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

  // ---------------- 时间格式化 ----------------
  const formatTime = (time: number) => {
    if (!time || isNaN(time)) return "0:00"
    const minutes = Math.floor(time / 60)
    const seconds = Math.floor(time % 60)
    return `${minutes}:${seconds.toString().padStart(2, '0')}`
  }

  // ---------------- 音量控制 ----------------
  const handleVolumeChange = (newVolume: number) => {
    const clamped = Math.max(0, Math.min(1, newVolume))
    setVolume(clamped)
    if (clamped > 0) {
      setPreviousVolume(clamped)
      localStorage.setItem('musicPlayer-previousVolume', clamped.toString())
    }
    localStorage.setItem('musicPlayer-volume', clamped.toString())
    if (audioRef?.current) audioRef.current.volume = clamped
  }
  const handleVolumeToggle = () => {
    if (volume > 0) {
      setPreviousVolume(volume)
      localStorage.setItem('musicPlayer-previousVolume', volume.toString())
      handleVolumeChange(0)
    } else {
      handleVolumeChange(previousVolume)
    }
  }
  const handleVolumeMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsVolumeDragging(true)
    const rect = e.currentTarget.getBoundingClientRect()
    const clickY = e.clientY - rect.top
    const percentage = 1 - (clickY / rect.height)
    handleVolumeChange(percentage)
  }
  useEffect(() => {
    if (!isVolumeDragging) return
    const handleMouseMove = (e: MouseEvent) => {
      const slider = document.querySelector('.volume-slider') as HTMLElement
      if (!slider) return
      const rect = slider.getBoundingClientRect()
      const y = e.clientY - rect.top
      const percentage = Math.max(0, Math.min(1, 1 - (y / rect.height)))
      handleVolumeChange(percentage)
    }
    const handleMouseUp = () => {
      setIsVolumeDragging(false)
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
  }, [isVolumeDragging, isVolumeHovered])

  // ---------------- 进度百分比 ----------------
  const progressPercentage = duration ? (currentTime / duration) * 100 : 0

  // ---------------- 设备与侧边栏偏移 ----------------
  const isMobile = windowWidth < 768
  const sidebarWidth = 192
  const gutter = 24
  const mainOffset = !isMobile && isSidebarOpen ? (sidebarWidth + gutter) / 2 : 0 // 开=108，关=0

  // ---------------- 测量主显示行高度（供触发层使用） ----------------
  useEffect(() => {
    const el = displayRowRef.current
    if (!el) return
    const update = () => setDisplayRowHeight(el.offsetHeight || 0)
    update()
    const ro = new ResizeObserver(update)
    ro.observe(el)
    return () => ro.disconnect()
  }, [displayRowRef])

  // ---------------- Popover: 点击触发 / 点击外部关闭 / ESC 关闭 ----------------
  useEffect(() => {
    if (!isPopoverOpen) return
    const onDocMouseDown = (e: MouseEvent) => {
      const t = e.target as Node | null
      if (popoverRef.current?.contains(t)) return
      if (triggerRef.current?.contains(t)) return
      setIsPopoverOpen(false)
    }
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsPopoverOpen(false)
    }
    document.addEventListener("mousedown", onDocMouseDown)
    document.addEventListener("keydown", onKeyDown)
    return () => {
      document.removeEventListener("mousedown", onDocMouseDown)
      document.removeEventListener("keydown", onKeyDown)
    }
  }, [isPopoverOpen])

  // ---------------- 音量图标选择 ----------------
  const getVolumeIcon = () => {
    if (volume === 0) return VolumeX
    if (volume < 0.5) return Volume1
    return Volume2
  }
  const VolumeIcon = getVolumeIcon()

  if (!currentSong) return null

  return (
    <div className="relative">
      {/* 主显示区域（歌词行）—— Mobile 点击打开全屏 Dialog；Desktop 的点击逻辑放在触发层 */}
      <div
        ref={displayRowRef}
        className="flex items-center gap-3 text-sm text-muted-foreground cursor-pointer transition-all duration-300 ease-out"
        style={{ marginLeft: `${mainOffset}px` }}
        onClick={() => { if (isMobile) setIsModalOpen(true) }}
      >
        {!isMobile && <Music className="h-4 w-4 flex-shrink-0" />}
        <div className="flex items-center gap-2 min-w-0">
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
                  className="absolute inset-0 flex items-center justify-center gap-2"
                >
                  {!isMobile && <span className="text-muted-foreground flex-shrink-0">-</span>}
                  <p className="truncate text-muted-foreground text-center">{displayLyric}</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Desktop 触发层：限制在 640px 宽范围内点击才会打开 Popover */}
      {!isMobile && (
        <div
          ref={triggerRef}
          className="absolute z-40 left-1/2 cursor-pointer"
          style={{
            width: `${TOOLTIP_WIDTH}px`,
            height: `${displayRowHeight || 24}px`,
            top: 0,
            transform: `translateX(calc(-50% + ${mainOffset}px))`,
            pointerEvents: 'auto', // 可点击
          }}
          onClick={() => setIsPopoverOpen(prev => !prev)}
          aria-haspopup="dialog"
          aria-expanded={isPopoverOpen}
          aria-controls="lyrics-popover"
        />
      )}

      {/* Desktop Popover（点击触发）—— 隐藏时 pointer-events: none，确保“穿透” */}
      {!isMobile && (
        <div
          ref={popoverRef}
          id="lyrics-popover"
          className="absolute left-1/2 z-50 w-[640px]"
          style={{ 
            top: `calc(100% + ${GAP_PX}px)`,
            transform: `translateX(calc(-50% + ${mainOffset}px))`,
            pointerEvents: isPopoverOpen ? 'auto' : 'none' // 隐藏时可穿透
          }}
          role="dialog"
          aria-hidden={!isPopoverOpen}
        >
          <motion.div
            initial={false}
            animate={isPopoverOpen ? { opacity: 1, y: 0, scale: 1 } : { opacity: 0, y: 8, scale: 0.98 }}
            transition={{ duration: 0.18, ease: "easeOut" }}
            style={{
              // 即使动画中也严格按 open/close 控制事件穿透
              pointerEvents: isPopoverOpen ? 'auto' : 'none'
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
                          className="absolute left-0 right-0 flex flex-col items-center"
                          animate={{ y: -currentLyricIndex * 32 + 56 }}
                          transition={{ duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
                        >
                          {parsedLyrics.map((lyric, index) => {
                            const distance = Math.abs(index - currentLyricIndex)
                            let opacity, fontSize, color
                            if (distance === 0) { opacity = 1;   fontSize = 'text-sm'; color = 'text-foreground font-semibold' }
                            else if (distance === 1) { opacity = 0.7; fontSize = 'text-xs'; color = 'text-foreground/90' }
                            else if (distance === 2) { opacity = 0.4; fontSize = 'text-xs'; color = 'text-muted-foreground' }
                            else { opacity = 0.15; fontSize = 'text-xs'; color = 'text-muted-foreground/70' }
                            return (
                              <div
                                key={index}
                                className={`text-center leading-snug px-2 py-1 min-h-[2rem] flex items-center justify-center ${fontSize} ${color} transition-all duration-500 cursor-pointer hover:opacity-100`}
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
                      onClick={handlePrevSong}
                      className="w-8 h-8 rounded-full bg-secondary hover:bg-secondary/80 flex items-center justify-center transition-colors"
                    >
                      <SkipBack className="w-4 h-4 text-muted-foreground" />
                    </motion.button>
                    
                    <motion.button
                      whileTap={{ scale: 0.95 }}
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
                      onClick={handleNextSong}
                      className="w-8 h-8 rounded-full bg-secondary hover:bg-secondary/80 flex items-center justify-center transition-colors"
                    >
                      <SkipForward className="w-4 h-4 text-muted-foreground" />
                    </motion.button>
                  </div>
                </div>

                {/* 右栏 - Next Up */}
                <div className="col-span-2 border-l border-border pl-6">
                  <div className="mb-4 flex items-start justify-between">
                    <div>
                      <h4 className="text-foreground font-semibold text-sm mb-1">Next Up</h4>
                      <p className="text-muted-foreground text-xs">即将播放</p>
                    </div>

                    {/* 音量控制（与原逻辑一致） */}
                    <div className="relative">
                      <motion.button
                        className="volume-button w-6 h-6 rounded-full bg-transparent hover:bg-secondary flex items-center justify-center transition-colors"
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={handleVolumeToggle}
                        onMouseEnter={() => {
                          if (volumeTimeoutRef.current) { clearTimeout(volumeTimeoutRef.current); volumeTimeoutRef.current = null }
                          setIsVolumeHovered(true)
                        }}
                        onMouseLeave={() => {
                          if (!isVolumeDragging) {
                            volumeTimeoutRef.current = setTimeout(() => setIsVolumeHovered(false), 200)
                          }
                        }}
                      >
                        <VolumeIcon className="w-3 h-3 text-muted-foreground hover:text-foreground" />
                      </motion.button>

                      <AnimatePresence>
                        {(isVolumeHovered || isVolumeDragging) && (
                          <motion.div
                            initial={{ opacity: 0, y: 10, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 10, scale: 0.95 }}
                            transition={{ duration: 0.15, ease: "easeOut" }}
                            className="volume-slider-container absolute top-full left-1/2 -translate-x-1/2 mt-2 z-50"
                            onMouseEnter={() => {
                              if (volumeTimeoutRef.current) { clearTimeout(volumeTimeoutRef.current); volumeTimeoutRef.current = null }
                              setIsVolumeHovered(true)
                            }}
                            onMouseLeave={() => {
                              volumeTimeoutRef.current = setTimeout(() => setIsVolumeHovered(false), 200)
                            }}
                          >
                            <div className="bg-card/95 backdrop-blur-xl border border-border rounded-lg p-2 shadow-lg">
                              <div className="flex flex-col items-center gap-2">
                                <span className="text-xs text-muted-foreground font-medium">
                                  {Math.round(volume * 100)}%
                                </span>
                                <div 
                                  className={`volume-slider w-2 h-16 bg-muted/50 dark:bg-muted/30 rounded-full cursor-pointer relative select-none transition-all border border-border/50 ${isVolumeDragging ? 'w-2.5 shadow-lg' : ''}`}
                                  onMouseDown={handleVolumeMouseDown}
                                >
                                  <motion.div
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
                            transition={{ duration: 0.4, delay: index * 0.05, ease: "easeOut" }}
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
                        <p className="text-muted-foreground text-xs">暂无更多歌曲</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {/* 移动端全屏模态框（小屏适配） */}
      <DialogPrimitive.Root open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogPrimitive.Portal>
          <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-black/50 dark:bg-black/70 backdrop-blur-sm data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 duration-500" style={{ animationTimingFunction: 'cubic-bezier(0.4, 0, 0.2, 1)' }} />
          <DialogPrimitive.Content 
            className="fixed z-50 w-full border-0 bg-white dark:bg-black p-0 data-[state=open]:animate-in data-[state=closed]:animate-out inset-x-0 bottom-0 max-h-[100dvh] rounded-t-3xl data-[state=closed]:slide-out-to-bottom data-[state=open]:slide-in-from-bottom data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 duration-700 sm:left-[50%] sm:top-[50%] sm:bottom-auto sm:h-auto sm:max-w-[95vw] sm:max-h-[85vh] sm:translate-x-[-50%] sm:translate-y-[-50%] sm:rounded-lg sm:border sm:p-6 sm:bg-background sm:data-[state=closed]:zoom-out-95 sm:data-[state=open]:zoom-in-95 sm:data-[state=closed]:slide-out-to-left-1/2 sm:data-[state=closed]:slide-out-to-top-[48%] sm:data-[state=open]:slide-in-from-left-1/2 sm:data-[state=open]:slide-in-from-top-[48%] sm:duration-200" 
            style={{ 
              animationTimingFunction: 'cubic-bezier(0.32, 0.72, 0, 1)',
              // 使用 CSS 变量处理安全区域
              paddingTop: 'max(env(safe-area-inset-top), 0.75rem)',
              height: 'calc(100dvh - env(safe-area-inset-top, 0px) - env(safe-area-inset-bottom, 0px))'
            }}
          >
            <DialogPrimitive.Title className="sr-only">音乐播放器</DialogPrimitive.Title>

            {/* 顶部拖动指示器 - 仅移动端显示 */}
            <div className="sm:hidden flex justify-center pt-2 pb-2 sticky top-0 bg-white dark:bg-background z-10">
              <div className="w-10 h-1 bg-muted-foreground/30 rounded-full" />
            </div>

            {/* 关闭按钮 - 调整位置确保在安全区域内 */}
            <DialogPrimitive.Close 
              className="absolute right-4 z-[60] rounded-full transition-all hover:bg-secondary focus:outline-none disabled:pointer-events-none inline-flex items-center justify-center w-10 h-10 sm:w-8 sm:h-8 bg-white/80 dark:bg-background/80 backdrop-blur-sm shadow-lg"
              style={{
                // 确保按钮在安全区域内，使用动态计算
                top: 'max(env(safe-area-inset-top, 0px) + 1rem, 1rem)'
              }}
            >
              <X className="h-5 w-5 sm:h-4 sm:w-4 text-foreground" />
              <span className="sr-only">Close</span>
            </DialogPrimitive.Close>

            <div className="h-full overflow-y-auto overscroll-contain pb-safe">
              <div className="flex flex-col justify-start sm:justify-center px-6 pt-0 pb-8 sm:p-0 space-y-5 sm:space-y-6">
                {/* 专辑封面和基础信息 */}
                <div className="flex flex-col items-center gap-3 sm:gap-4">
                  <div className="relative w-[min(220px,65vw)] h-[min(220px,65vw)] sm:w-48 sm:h-48 rounded-2xl overflow-hidden shadow-lg">
                    <Image
                      src={currentSong.coverUrl}
                      alt={currentSong.album}
                      fill
                      className="object-cover"
                      sizes="(max-width: 640px) min(220px, 65vw), 192px"
                      priority
                    />
                  </div>
                  <div className="text-center w-full px-2">
                    <h3 className="text-foreground font-bold text-xl sm:text-xl mb-2 sm:mb-2 line-clamp-2">
                      {currentSong.title}
                    </h3>
                    <p className="text-muted-foreground text-base sm:text-base mb-1 sm:mb-1">
                      {currentSong.artist}
                    </p>
                    <p className="text-muted-foreground/80 text-sm sm:text-sm">
                      {currentSong.album}
                    </p>
                  </div>
                </div>

                {/* 滚动歌词区域 */}
                <div className="h-28 sm:h-32 overflow-hidden relative bg-gradient-to-b from-transparent via-muted/20 to-transparent rounded-lg px-4">
                  {parsedLyrics.length > 0 ? (
                    <div className="relative h-full">
                      <motion.div
                        className="absolute left-0 right-0 flex flex-col items-center"
                        animate={{ y: -currentLyricIndex * 36 + 56 }}
                        transition={{ duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
                      >
                        {parsedLyrics.map((lyric, index) => {
                          const distance = Math.abs(index - currentLyricIndex)
                          let opacity, fontSize, color
                          if (distance === 0) { opacity = 1; fontSize = 'text-base sm:text-base'; color = 'text-foreground font-semibold' }
                          else if (distance === 1) { opacity = 0.7; fontSize = 'text-sm sm:text-sm'; color = 'text-foreground/90' }
                          else if (distance === 2) { opacity = 0.4; fontSize = 'text-sm'; color = 'text-muted-foreground' }
                          else { opacity = 0.15; fontSize = 'text-xs'; color = 'text-muted-foreground/70' }
                          return (
                            <div
                              key={index}
                              className={`text-center leading-snug px-4 py-1.5 min-h-[2.25rem] flex items-center justify-center ${fontSize} ${color} transition-all duration-500 cursor-pointer hover:opacity-100`}
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
                      <p className="text-muted-foreground text-base sm:text-base italic">
                        {currentSong.lyrics?.original ? "等待歌词..." : "暂无歌词"}
                      </p>
                    </div>
                  )}
                </div>

                {/* 进度条 */}
                <div className="space-y-2 px-2">
                  <div className="flex items-center gap-4">
                    <span className="text-sm sm:text-xs text-muted-foreground w-12 text-right">
                      {formatTime(currentTime)}
                    </span>
                    <div 
                      className="flex-1 h-2.5 sm:h-2 bg-muted rounded-full cursor-pointer"
                      onClick={handleProgressClick}
                    >
                      <motion.div
                        className="h-full bg-foreground rounded-full"
                        style={{ width: `${progressPercentage}%` }}
                        initial={false}
                        animate={{ width: `${progressPercentage}%` }}
                        transition={{ duration: 0.1 }}
                      />
                    </div>
                    <span className="text-sm sm:text-xs text-muted-foreground w-12">
                      {formatTime(duration)}
                    </span>
                  </div>
                </div>

                {/* 播放控制按钮 */}
                <div className="flex items-center justify-center gap-6 sm:gap-6 py-2">
                  <motion.button
                    whileTap={{ scale: 0.9 }}
                    onClick={handlePrevSong}
                    className="w-12 h-12 sm:w-12 sm:h-12 rounded-full bg-secondary hover:bg-secondary/80 active:bg-secondary/70 flex items-center justify-center transition-colors"
                  >
                    <SkipBack className="w-5 h-5 sm:w-5 sm:h-5 text-muted-foreground" />
                  </motion.button>
                  
                  <motion.button
                    whileTap={{ scale: 0.95 }}
                    onClick={handleTogglePlay}
                    className="w-16 h-16 sm:w-16 sm:h-16 rounded-full bg-primary hover:bg-primary/90 active:bg-primary/80 flex items-center justify-center transition-colors shadow-2xl"
                  >
                    {isPlaying ? (
                      <Pause className="w-7 h-7 sm:w-7 sm:h-7 text-primary-foreground fill-primary-foreground" />
                    ) : (
                      <Play className="w-7 h-7 sm:w-7 sm:h-7 text-primary-foreground fill-primary-foreground translate-x-0.5" />
                    )}
                  </motion.button>
                  
                  <motion.button
                    whileTap={{ scale: 0.9 }}
                    onClick={handleNextSong}
                    className="w-12 h-12 sm:w-12 sm:h-12 rounded-full bg-secondary hover:bg-secondary/80 active:bg-secondary/70 flex items-center justify-center transition-colors"
                  >
                    <SkipForward className="w-5 h-5 sm:w-5 sm:h-5 text-muted-foreground" />
                  </motion.button>
                </div>

                {/* 音量控制（移动端）- 简洁拖动滑块 */}
                <div className="px-6 sm:px-4">
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, ease: [0.32, 0.72, 0, 1] }}
                    className="flex items-center gap-3 p-3 rounded-2xl bg-secondary/30"
                  >
                    <motion.button
                      whileTap={{ scale: 0.9 }}
                      onClick={handleVolumeToggle}
                      className="w-9 h-9 rounded-full hover:bg-background/50 active:bg-background/70 flex items-center justify-center transition-colors flex-shrink-0"
                    >
                      <VolumeIcon className="w-5 h-5 text-muted-foreground" />
                    </motion.button>
                    
                    <div className="flex-1 flex items-center gap-3">
                      <div 
                        className="flex-1 h-2 bg-muted/50 dark:bg-muted/30 rounded-full cursor-pointer relative group"
                        onClick={(e) => {
                          const rect = e.currentTarget.getBoundingClientRect()
                          const clickX = e.clientX - rect.left
                          const percentage = clickX / rect.width
                          handleVolumeChange(percentage)
                        }}
                      >
                        <motion.div
                          className="h-full bg-foreground dark:bg-primary rounded-full"
                          style={{ width: `${volume * 100}%` }}
                          initial={false}
                          animate={{ width: `${volume * 100}%` }}
                          transition={{ duration: 0.15, ease: "easeOut" }}
                        />
                        {/* 指示器圆点 */}
                        <motion.div
                          className="absolute top-1/2 -translate-y-1/2 w-4 h-4 bg-foreground dark:bg-white rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
                          style={{ left: `${volume * 100}%`, transform: 'translate(-50%, -50%)' }}
                          initial={false}
                          animate={{ left: `${volume * 100}%` }}
                          transition={{ duration: 0.15, ease: "easeOut" }}
                        />
                      </div>
                      <span className="text-xs text-muted-foreground w-10 text-right font-mono">
                        {Math.round(volume * 100)}%
                      </span>
                    </div>
                  </motion.div>
                </div>

                {/* Next Up 列表（移动端） */}
                {nextUpSongs.length > 0 && (
                  <div className="border-t border-border pt-6 sm:pt-4 mt-2">
                    <h4 className="text-foreground font-semibold text-base sm:text-sm mb-4 sm:mb-3 px-2">即将播放</h4>
                    <div className="space-y-3 sm:space-y-2">
                      {nextUpSongs.slice(0, 5).map((song, index) => {
                        const actualIndex = currentSongIndex + index + 1
                        return (
                          <motion.div
                            key={song.id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.5, delay: index * 0.08, ease: [0.32, 0.72, 0, 1] }}
                            className="flex items-center gap-4 sm:gap-3 p-3 sm:p-2 rounded-xl sm:rounded-lg bg-secondary/30 hover:bg-secondary/60 active:bg-secondary/80 cursor-pointer transition-all"
                            onClick={() => { handleSongChange(actualIndex) }}
                          >
                            <div className="relative w-14 h-14 sm:w-12 sm:h-12 rounded-lg overflow-hidden shadow-sm flex-shrink-0">
                              <Image
                                src={song.coverUrl}
                                alt={song.album}
                                fill
                                className="object-cover"
                                sizes="(max-width: 640px) 56px, 48px"
                              />
                            </div>
                            <div className="flex-1 min-w-0">
                              <h5 className="text-foreground text-base sm:text-sm font-medium truncate">
                                {song.title}
                              </h5>
                              <p className="text-muted-foreground text-sm sm:text-xs truncate">
                                {song.artist}
                              </p>
                            </div>
                            <Play className="w-5 h-5 sm:w-4 sm:h-4 text-muted-foreground fill-muted-foreground flex-shrink-0" />
                          </motion.div>
                        )
                      })}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </DialogPrimitive.Content>
        </DialogPrimitive.Portal>
      </DialogPrimitive.Root>
    </div>
  )
}
