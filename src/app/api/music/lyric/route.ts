import { NextRequest, NextResponse } from 'next/server'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

// 硬编码音乐配置
const MUSIC_CONFIG = {
  playlistId: '8308939217',
  neteaseBaseUrl: 'https://music-api.sdjz.wiki',
  wyapiBaseUrl: 'https://wyapi.toubiec.cn',
  isEnabled: true,
}

/**
 * GET - 获取歌词
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json(
        { error: '歌曲 ID 不能为空' },
        { status: 400 }
      )
    }

    if (!MUSIC_CONFIG.isEnabled) {
      return NextResponse.json(
        { error: '音乐功能未启用' },
        { status: 404 }
      )
    }

    // 请求歌词 API
    const url = `${MUSIC_CONFIG.wyapiBaseUrl}/api/music/lyric`
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ id }),
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('[歌词 API] 错误响应:', errorText)
      throw new Error(`HTTP error! status: ${response.status}, body: ${errorText}`)
    }

    const data = await response.json()

    if (data.code !== 200) {
      console.error('[歌词 API] 业务错误:', data)
      return NextResponse.json(
        { error: '获取歌词失败', details: data },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      lyric: {
        lrc: data.data?.lrc || '',
        tlyric: data.data?.tlyric || '',
      },
    })
  } catch (error) {
    console.error('[!] 获取歌词失败:', error)
    return NextResponse.json(
      { error: '获取失败，请稍后重试', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    )
  }
}

// 移除 revalidate，因为使用 dynamic = 'force-dynamic'


