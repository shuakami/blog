import { NextRequest, NextResponse } from 'next/server'
import { SignJWT } from 'jose'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const code = searchParams.get('code')

  if (!code) {
    return NextResponse.redirect(new URL('/admin/login?error=no_code', request.url))
  }

  try {
    // 用 code 换取 access_token
    const tokenResponse = await fetch('https://github.com/login/oauth/access_token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify({
        client_id: process.env.GITHUB_CLIENT_ID,
        client_secret: process.env.GITHUB_CLIENT_SECRET,
        code,
      }),
      // 增加超时时间
      signal: AbortSignal.timeout(30000),
    })

    const tokenData = await tokenResponse.json()

    if (!tokenData.access_token) {
      throw new Error('Failed to get access token')
    }

    // 获取用户信息
    const userResponse = await fetch('https://api.github.com/user', {
      headers: {
        Authorization: `Bearer ${tokenData.access_token}`,
        Accept: 'application/json',
      },
      signal: AbortSignal.timeout(30000),
    })

    const userData = await userResponse.json()

    // 检查用户是否是管理员
    const adminUsernames = process.env.ADMIN_GITHUB_USERNAMES?.split(',') || []
    if (!adminUsernames.includes(userData.login)) {
      return NextResponse.redirect(
        new URL('/admin/login?error=unauthorized', request.url)
      )
    }

    // 创建 JWT token
    const secret = new TextEncoder().encode(process.env.JWT_SECRET)
    const token = await new SignJWT({
      username: userData.login,
      avatar: userData.avatar_url,
      accessToken: tokenData.access_token,
    })
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setExpirationTime('7d')
      .sign(secret)

    // 设置 cookie 并重定向到管理后台
    const response = NextResponse.redirect(new URL('/admin', request.url))
    response.cookies.set('admin_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: '/',
    })

    return response
  } catch (error) {
    console.error('[Auth Callback] Error:', error)
    return NextResponse.redirect(
      new URL('/admin/login?error=auth_failed', request.url)
    )
  }
}

