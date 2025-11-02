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
 * GET - 获取歌曲详情
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

    // 请求详情 API
    const url = `${MUSIC_CONFIG.wyapiBaseUrl}/api/music/detail`
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ id }),
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const data = await response.json()

    if (data.code !== 200) {
      return NextResponse.json(
        { error: '获取歌曲详情失败' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      detail: data.data,
    })
  } catch (error) {
    console.error('[!] 获取歌曲详情失败:', error)
    return NextResponse.json(
      { error: '获取失败，请稍后重试' },
      { status: 500 }
    )
  }
}


