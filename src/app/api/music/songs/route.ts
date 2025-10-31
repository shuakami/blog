import { NextRequest, NextResponse } from 'next/server'

// 硬编码音乐配置
const MUSIC_CONFIG = {
  playlistId: '8308939217',
  neteaseBaseUrl: 'https://music-api.sdjz.wiki',
  detailBaseUrl: 'https://hk.proxy.sdjz.wiki/https:/api.toubiec.cn/wyapi',
  isEnabled: true,
}

/**
 * GET - 获取歌单歌曲列表（支持 ISR）
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '20')
    const offset = parseInt(searchParams.get('offset') || '0')

    if (!MUSIC_CONFIG.isEnabled) {
      return NextResponse.json(
        { error: '音乐功能未启用' },
        { status: 404 }
      )
    }

    // 请求网易云 API
    const url = `${MUSIC_CONFIG.neteaseBaseUrl}/playlist/track/all?id=${MUSIC_CONFIG.playlistId}&limit=${limit}&offset=${offset}`
    const response = await fetch(url)

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const data = await response.json()

    if (!data.songs) {
      return NextResponse.json({
        success: true,
        songs: [],
      })
    }

    // 转换为统一格式
    const songs = data.songs.map((song: any) => ({
      id: song.id,
      title: song.name,
      artist: song.ar.map((a: any) => a.name).join(', '),
      album: song.al.name,
      coverUrl: song.al.picUrl,
      duration: Math.floor(song.dt / 1000),
    }))

    return NextResponse.json({
      success: true,
      songs,
    })
  } catch (error) {
    console.error('[!] 获取歌单失败:', error)
    return NextResponse.json(
      { error: '获取失败，请稍后重试' },
      { status: 500 }
    )
  }
}

// 设置 ISR：每小时重新生成
export const revalidate = 3600


