import { useEffect } from 'react';
import { getPlaylist, type Track, getPlayProgress, savePlayProgress, getSavedPlaylist } from '@/utils/netease';
import { usePlayerStore } from './usePlayerStore';

const PLAYLIST_ID = '8308939217';
const PAGE_SIZE = 20;
const PRELOAD_THRESHOLD = 0.7;

export function useMusicPlayer() {
  const store = usePlayerStore();
  
  // 获取当前播放的歌曲
  const currentTrack = store.playlist[store.currentTrackIndex];

  // 预加载音频
  const preloadAudio = async (track: Track, autoSeek?: number) => {
    try {
      if (!track.src) {
        console.error('歌曲没有可用的URL');
        return false;
      }

      if (!store.audioElement) {
        const audio = new Audio();
        store.setAudioElement(audio);
      }

      console.log('开始预加载:', track.name, track.src);
      store.setAudioReady(false);
      store.audioElement.src = track.src;

      return new Promise<boolean>((resolve) => {
        let loadTimeout: NodeJS.Timeout;
        
        const handleCanPlay = () => {
          console.log('音频加载完成，可以播放');
          cleanup();
          store.setAudioReady(true);
          if (typeof autoSeek === 'number' && store.audioElement) {
            store.audioElement.currentTime = autoSeek;
          }
          resolve(true);
        };

        const handleError = (e: Event) => {
          console.error('音频加载失败:', e);
          cleanup();
          store.setAudioReady(false);
          resolve(false);
        };

        const handleStalled = () => {
          console.log('音频加载停滞');
          cleanup();
          store.setAudioReady(false);
          resolve(false);
        };

        const handleTimeout = () => {
          console.log('音频加载超时');
          cleanup();
          store.setAudioReady(false);
          resolve(false);
        };

        const cleanup = () => {
          if (loadTimeout) clearTimeout(loadTimeout);
          if (!store.audioElement) return;
          store.audioElement.removeEventListener('canplay', handleCanPlay);
          store.audioElement.removeEventListener('error', handleError);
          store.audioElement.removeEventListener('stalled', handleStalled);
        };

        store.audioElement.addEventListener('canplay', handleCanPlay);
        store.audioElement.addEventListener('error', handleError);
        store.audioElement.addEventListener('stalled', handleStalled);
        
        loadTimeout = setTimeout(handleTimeout, 10000);
        
        store.audioElement.load();
      });
    } catch (error) {
      console.error('预加载失败:', error);
      store.setAudioReady(false);
    }
    return false;
  };

  // 加载更多歌曲
  const loadMore = async () => {
    if (!store.hasMore || store.isLoadingMore) return;
    
    try {
      store.setLoadingMore(true);
      const newOffset = store.playlist.length;
      console.log('加载更多歌曲, offset:', newOffset);
      
      const data = await getPlaylist(PLAYLIST_ID, newOffset, PAGE_SIZE, true);
      
      if (!data.tracks || data.tracks.length === 0) {
        console.log('没有获取到新歌曲');
        store.setHasMore(false);
        return;
      }
      
      const newTracks = data.tracks.filter(
        newTrack => !store.playlist.some(track => track.id === newTrack.id)
      );
      
      if (newTracks.length > 0) {
        console.log('添加新歌曲:', newTracks.length, '首');
        store.setPlaylist([...store.playlist, ...newTracks]);
        store.setHasMore(data.hasMore);
        if (newTracks[0]) {
          preloadAudio(newTracks[0]);
        }
      } else {
        console.log('没有新的歌曲可加载');
        store.setHasMore(false);
      }
    } catch (error) {
      console.error('加载更多歌曲失败:', error);
      store.setHasMore(false);
    } finally {
      store.setLoadingMore(false);
    }
  };

  // 播放/暂停
  const togglePlay = async () => {
    if (!store.audioElement || !currentTrack) return;

    console.log('当前歌曲:', currentTrack);
    console.log('音频元素状态:', {
      src: store.audioElement.src,
      readyState: store.audioElement.readyState,
      paused: store.audioElement.paused,
      isAudioReady: store.isAudioReady
    });

    if (store.isPlaying) {
      store.audioElement.pause();
      savePlayProgress(currentTrack.id, store.audioElement.currentTime);
      store.setPlaying(false);
    } else {
      try {
        if (!store.isAudioReady) {
          console.log('音频未就绪，开始预加载...');
          const success = await preloadAudio(currentTrack);
          if (!success) {
            console.error('预加载失败，尝试下一首');
            playNext();
            return;
          }
        }

        await store.audioElement.play();
        store.setPlaying(true);
      } catch (error) {
        console.error('播放失败:', error);
        if (error instanceof Error && error.name === 'AbortError') {
          setTimeout(async () => {
            try {
              if (store.audioElement) {
                await store.audioElement.play();
                store.setPlaying(true);
              }
            } catch (retryError) {
              console.error('重试播放失败:', retryError);
              playNext();
            }
          }, 500);
        } else {
          playNext();
        }
      }
    }
  };

  // 上一首
  const playPrevious = () => {
    store.setCurrentTrackIndex(
      store.currentTrackIndex === 0 ? store.playlist.length - 1 : store.currentTrackIndex - 1
    );
  };

  // 下一首
  const playNext = () => {
    if (store.currentTrackIndex === store.playlist.length - 1) {
      if (store.hasMore) {
        loadMore().then(() => {
          store.setCurrentTrackIndex(store.currentTrackIndex + 1);
        });
      } else {
        store.setCurrentTrackIndex(0);
      }
    } else {
      store.setCurrentTrackIndex(store.currentTrackIndex + 1);
    }
  };

  // 切换到指定歌曲
  const playTrack = (index: number) => {
    store.setCurrentTrackIndex(index);
  };

  // 初始化
  useEffect(() => {
    async function initPlayer() {
      try {
        store.setLoading(true);
        
        const savedTracks = getSavedPlaylist();
        const savedProgress = getPlayProgress();
        
        if (savedTracks) {
          const validTracks = savedTracks.filter(track => track.src !== null);
          if (validTracks.length > 0) {
            store.setPlaylist(validTracks);
            
            if (savedProgress) {
              const trackIndex = validTracks.findIndex(track => track.id === savedProgress.trackId);
              if (trackIndex !== -1) {
                store.setCurrentTrackIndex(trackIndex);
                await preloadAudio(validTracks[trackIndex], savedProgress.progress);
              }
            } else {
              await preloadAudio(validTracks[0]);
            }
          } else {
            const data = await getPlaylist(PLAYLIST_ID);
            store.setPlaylist(data.tracks);
            store.setHasMore(data.hasMore);
            if (data.tracks.length > 0) {
              await preloadAudio(data.tracks[0]);
            }
          }
        } else {
          const data = await getPlaylist(PLAYLIST_ID);
          store.setPlaylist(data.tracks);
          store.setHasMore(data.hasMore);
          if (data.tracks.length > 0) {
            await preloadAudio(data.tracks[0]);
          }
        }
      } catch (error) {
        console.error('初始化播放器失败:', error);
      } finally {
        store.setLoading(false);
      }
    }
    
    initPlayer();
  }, []);

  // 切换歌曲时预加载并播放
  useEffect(() => {
    let isMounted = true;

    async function loadAndPlay() {
      if (!currentTrack) return;
      
      console.log('切换歌曲，开始加载:', currentTrack.name);
      store.setAudioReady(false);
      
      try {
        const success = await preloadAudio(currentTrack);
        if (!isMounted) return;
        
        if (success && store.audioElement) {
          console.log('加载成功，尝试播放');
          try {
            await store.audioElement.play();
            store.setPlaying(true);
          } catch (error) {
            console.error('播放失败:', error);
            store.setPlaying(false);
            if (error instanceof Error && error.name === 'NotAllowedError') {
              return;
            }
            playNext();
          }
        } else {
          console.error('加载失败，切换下一首');
          playNext();
        }
      } catch (error) {
        if (!isMounted) return;
        console.error('加载过程出错:', error);
        playNext();
      }
    }

    loadAndPlay();
    return () => {
      isMounted = false;
    };
  }, [store.currentTrackIndex]);

  // 自动保存播放状态
  useEffect(() => {
    if (currentTrack && store.audioElement) {
      localStorage.setItem('playlist', JSON.stringify(store.playlist));
      savePlayProgress(currentTrack.id, store.audioElement.currentTime);
    }
  }, [currentTrack, store.playlist]);

  // 监听播放进度
  useEffect(() => {
    if (!store.audioElement) return;
    
    const handleTimeUpdate = () => {
      const audio = store.audioElement;
      if (!audio) return;
      
      store.setCurrentTime(audio.currentTime);
      store.setDuration(audio.duration);
      
      const progress = audio.currentTime / audio.duration;
      if (progress >= PRELOAD_THRESHOLD) {
        const nextIndex = store.currentTrackIndex + 1;
        if (nextIndex >= store.playlist.length - 3 && store.hasMore) {
          console.log('即将到达列表末尾，加载更多歌曲');
          loadMore();
        }
      }
    };
    
    store.audioElement.addEventListener('timeupdate', handleTimeUpdate);
    return () => {
      store.audioElement?.removeEventListener('timeupdate', handleTimeUpdate);
    };
  }, [store.audioElement, store.playlist, store.currentTrackIndex, store.hasMore, store.isLoadingMore]);

  return {
    // 状态
    isPlaying: store.isPlaying,
    currentTime: store.currentTime,
    duration: store.duration,
    volume: store.volume,
    isMuted: store.isMuted,
    playlist: store.playlist,
    currentTrackIndex: store.currentTrackIndex,
    currentTrack,
    isLoading: store.isLoading,
    isAudioReady: store.isAudioReady,
    hasMore: store.hasMore,
    isLoadingMore: store.isLoadingMore,
    
    // 方法
    togglePlay,
    playPrevious,
    playNext,
    playTrack,
    loadMore,
    setVolume: store.setVolume,
    setMuted: store.setMuted,
    
    // audio element
    audioElement: store.audioElement
  };
} 