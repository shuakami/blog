import { jwtVerify } from 'jose'
import { cookies } from 'next/headers'

export interface AdminUser {
  username: string
  avatar: string
  accessToken: string
}

export async function getAdminUser(): Promise<AdminUser | null> {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get('admin_token')?.value

    if (!token) {
      return null
    }

    const secret = new TextEncoder().encode(process.env.JWT_SECRET)
    const { payload } = await jwtVerify(token, secret)

    return payload as unknown as AdminUser
  } catch (error) {
    console.error('[Auth] Verification failed:', error)
    return null
  }
}

export async function requireAdmin(): Promise<AdminUser> {
  const user = await getAdminUser()
  if (!user) {
    throw new Error('Unauthorized')
  }
  return user
}

