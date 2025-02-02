import { create } from 'zustand';
import { type Track } from '@/utils/netease';

interface PlayerState {
  // UI状态
  isMinimized: boolean;
  isPlaylistOpen: boolean;
  
  // 播放状态
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  isMuted: boolean;
  isAudioReady: boolean;
  
  // 播放列表状态
  playlist: Track[];
  currentTrackIndex: number;
  hasMore: boolean;
  isLoadingMore: boolean;
  isLoading: boolean;
  
  // 音频元素
  audioElement: HTMLAudioElement | null;
}

interface PlayerActions {
  // UI actions
  setMinimized: (minimized: boolean) => void;
  setPlaylistOpen: (open: boolean) => void;
  
  // 播放控制
  setPlaying: (playing: boolean) => void;
  setCurrentTime: (time: number) => void;
  setDuration: (duration: number) => void;
  setVolume: (volume: number) => void;
  setMuted: (muted: boolean) => void;
  setAudioReady: (ready: boolean) => void;
  
  // 播放列表控制
  setPlaylist: (playlist: Track[]) => void;
  setCurrentTrackIndex: (index: number) => void;
  setHasMore: (hasMore: boolean) => void;
  setLoadingMore: (loading: boolean) => void;
  setLoading: (loading: boolean) => void;
  
  // 音频元素
  setAudioElement: (element: HTMLAudioElement | null) => void;
}

type PlayerStore = PlayerState & PlayerActions;

export const usePlayerStore = create<PlayerStore>((set, get) => ({
  // 初始状态
  isMinimized: false,
  isPlaylistOpen: false,
  isPlaying: false,
  currentTime: 0,
  duration: 0,
  volume: 0.5,
  isMuted: false,
  isAudioReady: false,
  playlist: [],
  currentTrackIndex: 0,
  hasMore: true,
  isLoadingMore: false,
  isLoading: true,
  audioElement: null,
  
  // Actions
  setMinimized: (minimized) => set({ isMinimized: minimized }),
  setPlaylistOpen: (open) => set({ isPlaylistOpen: open }),
  setPlaying: (playing) => set({ isPlaying: playing }),
  setCurrentTime: (time) => set({ currentTime: time }),
  setDuration: (duration) => set({ duration: duration }),
  setVolume: (volume) => {
    set({ volume: volume });
    const { audioElement } = get();
    if (audioElement) {
      audioElement.volume = volume;
    }
  },
  setMuted: (muted) => {
    set({ isMuted: muted });
    const { audioElement } = get();
    if (audioElement) {
      audioElement.muted = muted;
    }
  },
  setAudioReady: (ready) => set({ isAudioReady: ready }),
  setPlaylist: (playlist) => set({ playlist: playlist }),
  setCurrentTrackIndex: (index) => set({ currentTrackIndex: index }),
  setHasMore: (hasMore) => set({ hasMore: hasMore }),
  setLoadingMore: (loading) => set({ isLoadingMore: loading }),
  setLoading: (loading) => set({ isLoading: loading }),
  setAudioElement: (element) => {
    const { audioElement: oldElement } = get();
    
    // 移除旧元素的事件监听
    if (oldElement) {
      oldElement.onended = null;
      oldElement.onloadstart = null;
      oldElement.oncanplay = null;
      oldElement.onplaying = null;
      oldElement.onpause = null;
      oldElement.onwaiting = null;
      oldElement.onstalled = null;
    }
    
    // 设置新元素的事件监听
    if (element) {
      element.onended = () => {
        const { currentTrackIndex, playlist, hasMore } = get();
        if (currentTrackIndex === playlist.length - 1) {
          if (hasMore) {
            // 加载更多并播放下一首
            // 这里需要通过useMusicPlayer来处理
          } else {
            // 回到第一首
            set({ currentTrackIndex: 0 });
          }
        } else {
          // 播放下一首
          set({ currentTrackIndex: currentTrackIndex + 1 });
        }
      };
      
      element.onloadstart = () => console.log('开始加载音频');
      element.oncanplay = () => console.log('音频可以播放');
      element.onplaying = () => console.log('音频开始播放');
      element.onpause = () => console.log('音频暂停');
      element.onwaiting = () => console.log('音频等待中');
      element.onstalled = () => console.log('音频加载停滞');
      
      // 设置初始音量
      element.volume = get().volume;
      element.muted = get().isMuted;
    }
    
    set({ audioElement: element });
  }
})); 