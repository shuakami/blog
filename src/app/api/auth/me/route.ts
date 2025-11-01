import { NextResponse } from 'next/server'
import { getAdminUser } from '@/lib/auth'

export async function GET() {
  const user = await getAdminUser()
  
  if (!user) {
    return NextResponse.json({ user: null }, {
      headers: {
        // 无 token 时缓存更久，减少普通用户请求
        'Cache-Control': 'private, max-age=3600, stale-while-revalidate=86400',
      }
    })
  }
  
  return NextResponse.json({ user }, {
    headers: {
      // 有 token 时缓存 5 分钟
      'Cache-Control': 'private, max-age=300, stale-while-revalidate=600',
    }
  })
}

