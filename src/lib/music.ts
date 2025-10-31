import {
  SongDetail,
  MusicUrl,
  Lyric,
  UnifiedSong,
} from "./types"

// 所有音乐 API 现在通过我们的服务端代理
// 配置从数据库读取，支持 ISR

async function fetcher<T>(url: string): Promise<T> {
  try {
    const res = await fetch(url)
    if (!res.ok) {
      throw new Error(`HTTP error! status: ${res.status}`)
    }
    return await res.json()
  } catch (error) {
    console.error(`Fetch error for ${url}:`, error)
    throw error
  }
}

export async function getPlaylistSongs(
  limit = 20,
  offset = 0,
): Promise<UnifiedSong[]> {
  const url = `/api/music/songs?limit=${limit}&offset=${offset}`
  const data = await fetcher<{ success: boolean; songs: UnifiedSong[] }>(url)
  return data.songs || []
}

export async function getSongDetail(id: number): Promise<SongDetail | null> {
  const url = `/api/music/detail?id=${id}`
  const res = await fetcher<{ success: boolean; detail: SongDetail }>(url)
  return res.success ? res.detail : null
}

export async function getMusicUrl(
  id: number,
  level = "exhigh",
): Promise<MusicUrl | null> {
  const url = `/api/music/url?id=${id}&level=${level}`
  const res = await fetcher<{ success: boolean; url: MusicUrl }>(url)
  return res.success ? res.url : null
}

export async function getLyric(id: number): Promise<Lyric | null> {
  const url = `/api/music/lyric?id=${id}`
  const res = await fetcher<{ success: boolean; lyric: Lyric }>(url)
  return res.success ? res.lyric : null
}