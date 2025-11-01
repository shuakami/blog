// MusicPlayerProvider
// Powered by Shuakami<shuakami@sdjz.wiki>

"use client"

import React, {
  useRef,
  useMemo,
  useEffect,
  useCallback,
  createContext,
  useContext,
} from "react"
import { create } from "zustand"
import { persist, createJSONStorage, StateStorage } from "zustand/middleware"
import { useShallow } from "zustand/react/shallow"
import { UnifiedSong } from "@/lib/types"
import { getPlaylistSongs, getMusicUrl, getLyric } from "@/lib/music"

/* ========= 调优参数 ========= */
const PROGRESS_SAVE_INTERVAL_MS = 3000
const LRC_UPDATE_MIN_INTERVAL_MS = 80
const FADE_MS = 300

/* ========= IndexedDB 异步存储（替代 localStorage 同步阻塞） ========= */
const openIDB = (): Promise<IDBDatabase> =>
  new Promise((resolve, reject) => {
    const req = indexedDB.open("music-player-db", 1)
    req.onupgradeneeded = () => {
      const db = req.result
      if (!db.objectStoreNames.contains("kv")) db.createObjectStore("kv")
    }
    req.onsuccess = () => resolve(req.result)
    req.onerror = () => reject(req.error)
  })

const idbGet = async (key: string): Promise<string | null> => {
  const db = await openIDB()
  return new Promise((resolve, reject) => {
    const tx = db.transaction("kv", "readonly")
    const store = tx.objectStore("kv")
    const r = store.get(key)
    r.onsuccess = () => resolve((r.result as string) ?? null)
    r.onerror = () => reject(r.error)
  })
}
const idbSet = async (key: string, val: string) => {
  const db = await openIDB()
  return new Promise<void>((resolve, reject) => {
    const tx = db.transaction("kv", "readwrite")
    tx.objectStore("kv").put(val, key)
    tx.oncomplete = () => resolve()
    tx.onerror = () => reject(tx.error)
  })
}
const idbDel = async (key: string) => {
  const db = await openIDB()
  return new Promise<void>((resolve, reject) => {
    const tx = db.transaction("kv", "readwrite")
    tx.objectStore("kv").delete(key)
    tx.oncomplete = () => resolve()
    tx.onerror = () => reject(tx.error)
  })
}
const idbStorage: StateStorage = {
  getItem: (n) => idbGet(n),
  setItem: (n, v) => idbSet(n, v),
  removeItem: (n) => idbDel(n),
}

/* ========= 类型 ========= */
interface LyricLine { time: number; text: string }

interface MusicPlayerState {
  playlist: UnifiedSong[]
  currentSongIndex: number
  isPlaying: boolean
  isLoading: boolean
  offset: number
  hasMore: boolean

  parsedLyrics: LyricLine[]
  currentLyricIndex: number

  volume: number
  savedTime: number

  pendingPlay: boolean

  setPlaylist: (next: UnifiedSong[] | ((prev: UnifiedSong[]) => UnifiedSong[])) => void
  setCurrentSongIndex: (index: number) => void
  setIsPlaying: (flag: boolean) => void
  setIsLoading: (flag: boolean) => void
  setOffset: (n: number) => void
  setHasMore: (flag: boolean) => void
  setParsedLyrics: (lines: LyricLine[]) => void
  setCurrentLyricIndex: (idx: number) => void
  setVolume: (v: number) => void
  setSavedTime: (t: number) => void
  setPendingPlay: (flag: boolean) => void

  loadMoreSongs: (initial?: boolean) => Promise<void>
  loadMoreSongsForUI: () => Promise<boolean>
  handleSongChange: (newIndex: number) => void
  handleNextSong: () => void
  handlePrevSong: () => void
  handleTogglePlay: () => void
  initializePlayer: () => Promise<void>
  handleSongError: () => void
}

/* ========= Zustand（IndexedDB 持久化） ========= */
const useMusicPlayerStore = create<MusicPlayerState>()(
  persist(
    (set, get) => ({
      playlist: [],
      currentSongIndex: 0,
      isPlaying: false,
      isLoading: true,
      offset: 0,
      hasMore: true,

      parsedLyrics: [],
      currentLyricIndex: -1,

      volume: 0.4,
      savedTime: 0,

      pendingPlay: false,

      setPlaylist: (next) =>
        set((s) => ({
          playlist: typeof next === "function" ? (next as (p: UnifiedSong[]) => UnifiedSong[])(s.playlist) : next,
        })),
      setCurrentSongIndex: (index) => set({ currentSongIndex: index }),
      setIsPlaying: (flag) => set({ isPlaying: flag }),
      setIsLoading: (flag) => set({ isLoading: flag }),
      setOffset: (n) => set({ offset: n }),
      setHasMore: (flag) => set({ hasMore: flag }),
      setParsedLyrics: (lines) => set({ parsedLyrics: lines, currentLyricIndex: -1 }),
      setCurrentLyricIndex: (idx) => set({ currentLyricIndex: idx }),
      setVolume: (v) => set({ volume: Math.min(1, Math.max(0, v)) }),
      setSavedTime: (t) => set({ savedTime: Math.max(0, t) }),
      setPendingPlay: (flag) => set({ pendingPlay: flag }),

      loadMoreSongs: async (initial = false) => {
        const { isLoading, hasMore, offset, playlist } = get()
        if ((!initial && isLoading) || !hasMore) return
        set({ isLoading: true })
        try {
          const newSongs = await getPlaylistSongs(20, initial ? 0 : offset)
          if (newSongs.length > 0) {
            set({ playlist: [...playlist, ...newSongs], offset: (initial ? 0 : offset) + 20 })
          } else {
            set({ hasMore: false })
          }
        } catch (e) {
          console.error("[ZUSTAND] loadMoreSongs failed:", e)
        } finally {
          set({ isLoading: false })
        }
      },

      loadMoreSongsForUI: async () => {
        const { isLoading, hasMore, playlist } = get()
        // 如果正在加载或没有更多歌曲，返回false
        if (isLoading || !hasMore) return false
        
        try {
          // 根据当前播放列表长度计算offset，确保不重复加载
          const currentOffset = playlist.length
          
          const newSongs = await getPlaylistSongs(20, currentOffset)
          if (newSongs.length > 0) {
            // 去重：过滤掉已存在的歌曲
            const existingIds = new Set(playlist.map(song => song.id))
            const uniqueNewSongs = newSongs.filter(song => !existingIds.has(song.id))
            
            if (uniqueNewSongs.length > 0) {
              set({ 
                playlist: [...playlist, ...uniqueNewSongs], 
                offset: Math.max(get().offset, currentOffset + newSongs.length)
              })
              return true
            }
          } else {
            set({ hasMore: false })
          }
        } catch (e) {
          console.error("[ZUSTAND] loadMoreSongsForUI failed:", e)
        }
        return false
      },

      handleSongChange: (newIndex: number) => {
        const { playlist } = get()
        if (!playlist.length) return
        set({
          currentSongIndex: ((newIndex % playlist.length) + playlist.length) % playlist.length,
          pendingPlay: false,
        })
      },

      handleNextSong: () => {
        const { playlist, currentSongIndex } = get()
        if (!playlist.length) return
        set({ currentSongIndex: (currentSongIndex + 1) % playlist.length, pendingPlay: false })
      },

      handlePrevSong: () => {
        const { playlist, currentSongIndex } = get()
        if (!playlist.length) return
        set({ currentSongIndex: (currentSongIndex - 1 + playlist.length) % playlist.length, pendingPlay: false })
      },

      handleTogglePlay: () => {
        const { isPlaying, playlist, currentSongIndex } = get()
        if (!playlist.length) return
        if (isPlaying) return set({ isPlaying: false, pendingPlay: false })
        const cur = playlist[currentSongIndex]
        set({ isPlaying: true, pendingPlay: !cur?.url })
      },

      initializePlayer: async () => {
        const { playlist } = get()
        if (!playlist.length) {
          set({ isLoading: true })
          try {
            const newSongs = await getPlaylistSongs(20, 0)
            if (newSongs.length) {
              set({ playlist: newSongs, offset: 20, hasMore: true })
            } else {
              set({ hasMore: false })
            }
          } catch (e) {
            console.error("[ZUSTAND] initializePlayer failed:", e)
          } finally {
            set({ isLoading: false })
          }
        } else {
          set({ isLoading: false })
        }
      },

      handleSongError: () => {
        const { playlist, currentSongIndex } = get()
        if (!playlist.length) return
        const cur = playlist[currentSongIndex]
        const next = [...playlist]
        next[currentSongIndex] = { ...cur, url: undefined as string | undefined }
        set({ playlist: next })
      },
    }),
    {
      name: "music-player-v1",
      version: 1,
      storage: createJSONStorage(() => idbStorage),
      partialize: (s) => ({
        playlist: s.playlist,
        currentSongIndex: s.currentSongIndex,
        volume: s.volume,
        savedTime: s.savedTime,
        offset: s.offset,
        hasMore: s.hasMore,
      }),
    }
  )
)

/* ========= 仅传递 <audio> 引用 ========= */
type AudioContextType = { audioRef: React.RefObject<HTMLAudioElement | null> }
const AudioCtx = createContext<AudioContextType | null>(null)

/* ========= 公共 Hook ========= */
export function useMusicPlayer() {
  const audioCtx = useContext(AudioCtx)
  if (!audioCtx) throw new Error("useMusicPlayer must be used within a MusicPlayerProvider")

  const slice = useMusicPlayerStore(
    useShallow((s) => ({
      playlist: s.playlist,
      currentSongIndex: s.currentSongIndex,
      isPlaying: s.isPlaying,
      isLoading: s.isLoading,
      offset: s.offset,
      hasMore: s.hasMore,
      parsedLyrics: s.parsedLyrics,
      currentLyricIndex: s.currentLyricIndex,

      setPlaylist: s.setPlaylist,
      setCurrentSongIndex: s.setCurrentSongIndex,
      setIsPlaying: s.setIsPlaying,

      loadMoreSongs: s.loadMoreSongs,
      loadMoreSongsForUI: s.loadMoreSongsForUI,
      handleSongChange: s.handleSongChange,
      handleNextSong: s.handleNextSong,
      handlePrevSong: s.handlePrevSong,
      handleTogglePlay: s.handleTogglePlay,
      initializePlayer: s.initializePlayer,
      handleSongError: s.handleSongError,
    }))
  )

  const { playlist, currentSongIndex } = slice

  const currentSong = useMemo(
    () => (playlist.length && currentSongIndex >= 0 ? playlist[currentSongIndex] ?? null : null),
    [playlist, currentSongIndex]
  )
  const nextUpSongs = useMemo(
    () => (playlist.length && currentSongIndex >= 0 ? playlist.slice(currentSongIndex + 1, currentSongIndex + 5) : []),
    [playlist, currentSongIndex]
  )

  return {
    ...slice,
    currentSong,
    nextUpSongs,
    audioRef: audioCtx.audioRef,
  }
}

/* ========= Provider：WebAudio + 异步持久化 + 顺序修复 ========= */
interface MusicPlayerProviderProps { children: React.ReactNode }

export function MusicPlayerProvider({ children }: MusicPlayerProviderProps) {
  const audioRef = useRef<HTMLAudioElement>(null)

  const state = useMusicPlayerStore(
    useShallow((s) => ({
      playlist: s.playlist,
      currentSongIndex: s.currentSongIndex,
      isPlaying: s.isPlaying,
      isLoading: s.isLoading,
      hasMore: s.hasMore,
      offset: s.offset,
      parsedLyrics: s.parsedLyrics,
      volume: s.volume,
      savedTime: s.savedTime,
      pendingPlay: s.pendingPlay,

      setIsLoading: s.setIsLoading,
      setOffset: s.setOffset,
      setHasMore: s.setHasMore,
      setPlaylist: s.setPlaylist,
      setParsedLyrics: s.setParsedLyrics,
      setCurrentLyricIndex: s.setCurrentLyricIndex,
      setVolume: s.setVolume,
      setSavedTime: s.setSavedTime,
      setPendingPlay: s.setPendingPlay,

      initializePlayer: s.initializePlayer,
      loadMoreSongs: s.loadMoreSongs,
      loadMoreSongsForUI: s.loadMoreSongsForUI,
      handleNextSong: s.handleNextSong,
      handleSongError: s.handleSongError,
    }))
  )

  const {
    playlist, currentSongIndex, isPlaying, isLoading, hasMore, offset,
    parsedLyrics, volume, savedTime, pendingPlay,
    setParsedLyrics, setCurrentLyricIndex, setSavedTime, setPendingPlay,
    initializePlayer, loadMoreSongs, loadMoreSongsForUI, handleNextSong,
  } = state

  /* ---- 运行时控制 ---- */
  const didInit = useRef(false)
  const retryCount = useRef(0)
  const isPageVisible = useRef(true)
  const hasRestoredProgress = useRef(false)

  // WebAudio 图
  const acRef = useRef<AudioContext | null>(null)
  const gainRef = useRef<GainNode | null>(null)
  const srcNodeRef = useRef<MediaElementAudioSourceNode | null>(null)

  /** 保证：在任何设置 src 之前，已设置 crossOrigin 并建立图 */
  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return

    // 关键顺序：先 crossOrigin，再后续任何 src/load 行为
    if (!audio.crossOrigin) audio.crossOrigin = "anonymous" // 必须先设再设 src，CORS 才生效。&#8203;:contentReference[oaicite:5]{index=5}

    if (!acRef.current) {
      const AC = (window as any).AudioContext || (window as any).webkitAudioContext
      acRef.current = new AC()
    }
    const ac = acRef.current!

    if (!gainRef.current) {
      gainRef.current = ac.createGain()
      gainRef.current.connect(ac.destination)
      // 初始以用户音量为值
      gainRef.current.gain.setValueAtTime(volume, ac.currentTime)
    }

    if (!srcNodeRef.current) {
      // 只能创建一次
      srcNodeRef.current = ac.createMediaElementSource(audio)
      srcNodeRef.current.connect(gainRef.current)
    }
  }, []) // 只在首次挂载执行

  // 用户手势恢复 AudioContext：第一次点击播放必然有用户手势
  useEffect(() => {
    if (!isPlaying) return
    const ac = acRef.current
    if (ac && ac.state !== "running") {
      void ac.resume() // 处理自动播放/节能策略导致的挂起。&#8203;:contentReference[oaicite:6]{index=6}
    }
  }, [isPlaying])

  // 可见性改变时，尽量恢复 AudioContext（同时做淡入/淡出）
  useEffect(() => {
    const onVis = () => {
      const ac = acRef.current
      const gain = gainRef.current
      if (!ac || !gain) return
      void ac.resume()
      gain.gain.setValueAtTime(gain.gain.value, ac.currentTime)
      if (document.hidden) {
        gain.gain.linearRampToValueAtTime(Math.max(0, Math.min(1, volume * 0.5)), ac.currentTime + 1.5)
        isPageVisible.current = false
      } else {
        gain.gain.linearRampToValueAtTime(volume, ac.currentTime + 1.5)
        isPageVisible.current = true
      }
    }
    document.addEventListener("visibilitychange", onVis)
    return () => document.removeEventListener("visibilitychange", onVis)
  }, [volume])

  // 初次加载歌单
  useEffect(() => {
    if (didInit.current) return
    didInit.current = true
    void initializePlayer()
  }, [initializePlayer])

  /* ---- 歌词解析 ---- */
  const parseLyrics = useCallback((lyrics: { original?: string; translated?: string }) => {
    const original = lyrics?.original || ""
    const lineRegex = /\[(\d{2}):(\d{2})\.(\d{2,3})\](.*)/
    const parsed: LyricLine[] = original.split("\n").map((line) => {
      const m = line.match(lineRegex)
      if (!m) return null
      const minutes = parseInt(m[1], 10)
      const seconds = parseInt(m[2], 10)
      const ms = parseInt(m[3], 10)
      const time = minutes * 60 + seconds + ms / 1000
      return { time, text: (m[4] || "").trim() }
    }).filter(Boolean) as LyricLine[]
    setParsedLyrics(parsed)
    setCurrentLyricIndex(-1)
  }, [setParsedLyrics, setCurrentLyricIndex])

  const currentSong = useMemo(
    () => (playlist.length && currentSongIndex >= 0 ? playlist[currentSongIndex] : null),
    [playlist, currentSongIndex]
  )
  const currentSongId = currentSong?.id
  const hasSongUrl = !!currentSong?.url

  useEffect(() => {
    const song = currentSong
    if (song?.lyrics?.original) parseLyrics(song.lyrics)
    else {
      setParsedLyrics([])
      setCurrentLyricIndex(-1)
    }
  }, [currentSong, parseLyrics, setParsedLyrics, setCurrentLyricIndex])

  /* ---- 拉取歌曲 URL + 歌词（去重并发） ---- */
  const inflight = useRef<Set<number | string>>(new Set())
  useEffect(() => {
    const run = async () => {
      if (!currentSongId || hasSongUrl) return
      if (inflight.current.has(currentSongId)) return
      inflight.current.add(currentSongId)
      try {
        const [urlData, lyricData] = await Promise.all([getMusicUrl(Number(currentSongId)), getLyric(Number(currentSongId))])
        const lyrics = { original: lyricData?.lrc ?? "", translated: lyricData?.tlyric ?? "" }
        useMusicPlayerStore.setState((prev) => ({
          playlist: prev.playlist.map((s) => (s.id === currentSongId ? { ...s, url: urlData?.url, lyrics } : s)),
        }))
      } catch (e) {
        console.error("[FETCH] song details failed:", e)
      } finally {
        inflight.current.delete(currentSongId)
      }
    }
    void run()
  }, [currentSongId, hasSongUrl])

  /* ---- 播放控制（关键点：先 crossOrigin，再设 src；WebAudio 与元素声道并存） ---- */
  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return

    const onCanPlay = async () => {
      const ac = acRef.current
      const gain = gainRef.current
      if (ac && gain) {
        await ac.resume().catch(() => {})
        // 使用 WebAudio 的淡入（音频线程执行）
        gain.gain.setValueAtTime(0, ac.currentTime)
        gain.gain.linearRampToValueAtTime(useMusicPlayerStore.getState().volume, ac.currentTime + FADE_MS / 1000)
      }
      
      // 恢复进度：只在页面初始加载时执行一次
      if (!hasRestoredProgress.current && savedTime > 0 && !isNaN(savedTime)) {
        audio.currentTime = savedTime
        hasRestoredProgress.current = true
      }
      
      // 不静音 <audio>，确保即使 CDN 缺少 CORS 头，仍有直播放音兜底
      if (useMusicPlayerStore.getState().isPlaying || useMusicPlayerStore.getState().pendingPlay) {
        try { await audio.play() } catch (e) { console.error("[Audio] play() rejected:", e) }
        if (useMusicPlayerStore.getState().pendingPlay) setPendingPlay(false)
      }
    }

    const song = currentSong
    if (song?.url) {
      if (audio.src !== song.url) {
        // 关键顺序：任何时候设置新 src 之前，确保 crossOrigin 已存在
        if (!audio.crossOrigin) audio.crossOrigin = "anonymous" // 必须先于 src 设置。
        audio.removeEventListener("canplay", onCanPlay)
        audio.preload = "auto"
        audio.src = song.url
        audio.addEventListener("canplay", onCanPlay, { once: true })
        audio.load()
      } else {
        if (isPlaying || pendingPlay) {
          const ac = acRef.current
          const gain = gainRef.current
          if (ac && gain) {
            ac.resume().catch(() => {})
            gain.gain.setValueAtTime(gain.gain.value, ac.currentTime)
            gain.gain.linearRampToValueAtTime(useMusicPlayerStore.getState().volume, ac.currentTime + 0.05)
          }
          audio.play().catch(e => console.error("[Audio] play() rejected:", e))
          if (pendingPlay) setPendingPlay(false)
        } else {
          audio.pause()
        }
      }
    } else {
      if (!pendingPlay) audio.pause()
    }

    return () => audio.removeEventListener("canplay", onCanPlay)
  }, [currentSong, isPlaying, pendingPlay, setPendingPlay])

  /* ---- 懒加载 ---- */
  useEffect(() => {
    if (!isLoading && hasMore && playlist.length > 0 && currentSongIndex >= playlist.length - 5) {
      void loadMoreSongs(false)
    }
  }, [currentSongIndex, playlist.length, isLoading, hasMore, offset, loadMoreSongs])

  /* ---- 歌词 + 进度（低频写入，persist 异步落盘） ---- */
  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return

    const lowerBound = (arr: LyricLine[], t: number) => {
      let lo = 0, hi = arr.length - 1, ans = -1
      while (lo <= hi) {
        const mid = (lo + hi) >> 1
        if (arr[mid].time <= t) { ans = mid; lo = mid + 1 } else hi = mid - 1
      }
      return ans
    }

    let lastLyricStamp = 0
    let lastProgressStamp = 0

    const onTime = () => {
      const now = performance.now?.() ?? Date.now()
      const t = audio.currentTime

      if (parsedLyrics.length > 0 && now - lastLyricStamp >= LRC_UPDATE_MIN_INTERVAL_MS) {
        const idx = lowerBound(parsedLyrics, t)
        if (idx !== -1 && idx !== useMusicPlayerStore.getState().currentLyricIndex) {
          useMusicPlayerStore.setState({ currentLyricIndex: idx })
        }
        lastLyricStamp = now
      }

      if (now - lastProgressStamp >= PROGRESS_SAVE_INTERVAL_MS) {
        useMusicPlayerStore.setState({ savedTime: t })
        lastProgressStamp = now
      }
    }

    const flushProgress = () => {
      useMusicPlayerStore.setState({ savedTime: audio.currentTime })
    }

    audio.addEventListener("timeupdate", onTime)
    audio.addEventListener("pause", flushProgress)
    window.addEventListener("beforeunload", flushProgress)
    document.addEventListener("visibilitychange", () => { if (document.hidden) flushProgress() })

    return () => {
      audio.removeEventListener("timeupdate", onTime)
      audio.removeEventListener("pause", flushProgress)
      window.removeEventListener("beforeunload", flushProgress)
    }
  }, [parsedLyrics])

  /* ---- 音频错误重试 ---- */
  const onAudioError = useCallback(() => {
    retryCount.current += 1
    if (retryCount.current >= 3) {
      retryCount.current = 0
      handleNextSong()
    } else {
      useMusicPlayerStore.getState().handleSongError()
    }
  }, [handleNextSong])

  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return
    audio.onerror = onAudioError
    return () => { if (audio) audio.onerror = null }
  }, [onAudioError])

  const ctxValue = useMemo(() => ({ audioRef }), [])

  return <AudioCtx.Provider value={ctxValue}>{children}</AudioCtx.Provider>
}
