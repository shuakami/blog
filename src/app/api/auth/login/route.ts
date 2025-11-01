import { NextResponse } from 'next/server'

export async function GET() {
  const clientId = process.env.GITHUB_CLIENT_ID
  const callbackUrl = process.env.GITHUB_CALLBACK_URL

  if (!clientId || !callbackUrl) {
    return NextResponse.json(
      { error: 'GitHub OAuth 配置缺失' },
      { status: 500 }
    )
  }

  // 重定向到 GitHub OAuth 授权页面
  const githubAuthUrl = `https://github.com/login/oauth/authorize?client_id=${clientId}&redirect_uri=${encodeURIComponent(callbackUrl)}&scope=user:email,repo`

  return NextResponse.redirect(githubAuthUrl)
}

