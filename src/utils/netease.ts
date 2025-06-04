import axios from 'axios';

const BASE_URL = 'https://musicd2-git-main-shuakamis-projects.vercel.app';

// API响应接口
interface PlaylistDetail {
  playlist: {
    trackIds: { id: number }[];
    coverImgUrl: string;
    name: string;
    description?: string;
  };
}

interface SongDetail {
  id: number;
  name: string;
  ar: { name: string }[];
  dt: number;
  al: { picUrl: string };
}

// 处理网易云音乐图片URL
function processImageUrl(url: string, size: number = 130): string {
  return `${url}?param=${size}y${size}`;
}

// 歌曲信息接口
export interface Track {
  id: string;
  name: string;
  src: string | null;
  artist: string;
  duration: number;
  cover: string;
}

// 歌单信息接口
export interface Playlist {
  coverImgUrl: string;
  tracks: Track[];
  name: string;
  description: string;
  total: number;  // 总歌曲数
  hasMore: boolean;  // 是否还有更多歌曲
}

// 将数组分成多个小数组
function chunkArray<T>(array: T[], size: number): T[][] {
  const chunks: T[][] = [];
  for (let i = 0; i < array.length; i += size) {
    chunks.push(array.slice(i, i + size));
  }
  return chunks;
}

// 延迟函数
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// 检查URL是否有效
async function isUrlValid(url: string): Promise<boolean> {
  try {
    const response = await fetch(url, { method: 'HEAD' });
    return response.ok;
  } catch {
    return false;
  }
}

// 带重试的请求函数
async function requestWithRetry<T>(
  fn: () => Promise<T>,
  retries = 3,
  delayMs = 1000
): Promise<T> {
  try {
    return await fn();
  } catch (error) {
    if (retries === 0) throw error;
    await delay(delayMs);
    return requestWithRetry(fn, retries - 1, delayMs * 2);
  }
}

// 并发控制函数
async function asyncPool<T, U>(
  poolLimit: number,
  array: T[],
  iteratorFn: (item: T) => Promise<U>
): Promise<U[]> {
  const executing = new Set<Promise<U>>();
  const results: U[] = [];
  
  for (const item of array) {
    const promise = Promise.resolve().then(() => iteratorFn(item));
    executing.add(promise);
    
    // 等待当前promise完成并存储结果
    promise.then(
      result => {
        executing.delete(promise);
        results.push(result);
      },
      error => {
        executing.delete(promise);
        console.error('请求失败:', error);
      }
    );
    
    if (executing.size >= poolLimit) {
      await Promise.race(executing);
    }
    
    // 添加延迟避免请求过快
    await delay(100);
  }
  
  // 等待所有剩余的promise完成
  await Promise.all(executing);
  return results;
}

// 获取歌曲URL
async function getSongUrl(id: string): Promise<string | null> {
  try {
    console.log('获取歌曲URL:', id);
    const res = await requestWithRetry(() => 
      axios.get(`${BASE_URL}/song/url/v1?id=${id}&level=exhigh`)
    );
    
    console.log('歌曲URL响应:', res.data);
    const data = res.data.data[0];
    
    // 检查是否需要VIP
    if (!data || !data.url || data.code !== 200 || data.freeTrialInfo || (data.fee === 1 && !data.payed)) {
      console.log('歌曲需要VIP或URL无效:', data);
      return null;
    }
    
    return data.url;
  } catch (error) {
    console.error('获取歌曲URL失败:', error);
    return null;
  }
}

// 获取歌曲详情
async function getSongDetail(ids: string[]): Promise<SongDetail[]> {
  try {
    const res = await requestWithRetry(() =>
      axios.get(`${BASE_URL}/song/detail?ids=${ids.join(',')}`)
    );
    return res.data.songs || [];
  } catch (error) {
    console.error('获取歌曲详情失败:', error);
    return [];
  }
}

// 本地存储键名
const STORAGE_KEYS = {
  CURRENT_TRACK: 'music_player_current_track',
  PLAYLIST: 'music_player_playlist',
  TRACK_PROGRESS: 'music_player_progress'
};

// 保存播放位置
export function savePlayProgress(trackId: string, progress: number) {
  try {
    localStorage.setItem(STORAGE_KEYS.CURRENT_TRACK, trackId);
    localStorage.setItem(STORAGE_KEYS.TRACK_PROGRESS, String(progress));
  } catch (error) {
    console.error('保存播放进度失败:', error);
  }
}

// 获取保存的播放位置
export function getPlayProgress(): { trackId: string; progress: number } | null {
  try {
    const trackId = localStorage.getItem(STORAGE_KEYS.CURRENT_TRACK);
    const progress = localStorage.getItem(STORAGE_KEYS.TRACK_PROGRESS);
    if (trackId && progress) {
      return {
        trackId,
        progress: Number(progress)
      };
    }
  } catch (error) {
    console.error('获取播放进度失败:', error);
  }
  return null;
}

// 保存播放列表
export function savePlaylist(tracks: Track[]) {
  try {
    localStorage.setItem(STORAGE_KEYS.PLAYLIST, JSON.stringify(tracks));
  } catch (error) {
    console.error('保存播放列表失败:', error);
  }
}

// 获取保存的播放列表
export function getSavedPlaylist(): Track[] | null {
  try {
    const saved = localStorage.getItem(STORAGE_KEYS.PLAYLIST);
    if (saved) {
      return JSON.parse(saved);
    }
  } catch (error) {
    console.error('获取保存的播放列表失败:', error);
  }
  return null;
}

// 获取歌单
export async function getPlaylist(id: string, offset = 0, limit = 10, forceRefresh = false) {
  const cacheKey = `playlist_${id}_${offset}_${limit}`;
  
  // 如果不强制刷新且有缓存，使用缓存
  if (!forceRefresh) {
    const cached = localStorage.getItem(cacheKey);
    if (cached) {
      console.log('使用本地缓存的歌单');
      return JSON.parse(cached);
    }
  }

  try {
    console.log('从服务器获取歌单:', { id, offset, limit });
    const response = await axios.get(`${BASE_URL}/playlist/track/all`, {
      params: { id, offset, limit }
    });

    const tracks = response.data.songs.map((song: any) => ({
      id: song.id,
      name: song.name,
      artist: song.ar.map((artist: any) => artist.name).join('/'),
      cover: song.al.picUrl,
      src: `https://music.163.com/song/media/outer/url?id=${song.id}.mp3`
    }));

    const result = {
      tracks,
      hasMore: response.data.songs.length === limit
    };

    // 缓存结果
    localStorage.setItem(cacheKey, JSON.stringify(result));
    
    return result;
  } catch (error) {
    console.error('获取歌单失败:', error);
    throw error;
  }
}

// 获取歌词
export async function getLyric(id: string): Promise<string> {
  try {
    const res = await requestWithRetry(() =>
      axios.get(`${BASE_URL}/lyric?id=${id}`)
    );
    return res.data.lrc?.lyric || '';
  } catch (error) {
    console.error('获取歌词失败:', error);
    return '';
  }
} 