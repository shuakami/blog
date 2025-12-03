import { NextRequest, NextResponse } from 'next/server'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

// 开发环境禁用 SSL 验证（生产环境不应这样做）
if (process.env.NODE_ENV === 'development') {
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0'
}

// 硬编码音乐配置
const MUSIC_CONFIG = {
  playlistId: '8308939217',
  neteaseBaseUrl: 'https://music-api.sdjz.wiki',
  wyapiBaseUrl: 'https://wyapi-1.toubiec.cn',
  isEnabled: true,
}

/**
 * GET - 获取歌曲播放地址
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    const level = searchParams.get('level') || 'exhigh'

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

    // 请求播放地址 API
    const url = `${MUSIC_CONFIG.wyapiBaseUrl}/api/music/url`
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ id, level }),
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('[播放地址 API] 错误响应:', errorText)
      throw new Error(`HTTP error! status: ${response.status}, body: ${errorText}`)
    }

    const data = await response.json()

    if (data.code !== 200 || !data.data?.[0]) {
      console.error('[播放地址 API] 业务错误:', data)
      return NextResponse.json(
        { error: '获取播放地址失败', details: data },
        { status: 404 }
      )
    }

    const musicData = data.data[0]
    return NextResponse.json({
      success: true,
      url: {
        id: musicData.id,
        url: musicData.url,
        br: musicData.br,
        level: musicData.level,
      },
    })
  } catch (error) {
    console.error('[!] 获取播放地址失败:', error)
    return NextResponse.json(
      { error: '获取失败，请稍后重试', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    )
  }
}



