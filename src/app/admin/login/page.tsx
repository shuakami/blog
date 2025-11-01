'use client'

import { useSearchParams } from 'next/navigation'
import { Suspense } from 'react'

function LoginContent() {
  const searchParams = useSearchParams()
  const error = searchParams?.get('error')

  const errorMessages: Record<string, string> = {
    no_code: '授权失败，未收到授权码',
    unauthorized: '权限不足，您不是管理员',
    auth_failed: '认证失败，请重试',
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 -mt-20">
      <div className="max-w-md w-full">
        {/* 标题 */}
        <div className="mb-10">
          <h1 className="text-4xl md:text-5xl font-medium tracking-tight text-black dark:text-white mb-4">
            管理后台
          </h1>
          <div className="w-16 h-[2px] bg-black dark:bg-white" />
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 border border-black/10 dark:border-white/10 rounded-lg bg-black/[0.02] dark:bg-white/[0.02]">
            <p className="text-sm text-black/60 dark:text-white/60">
              {errorMessages[error] || '登录失败'}
            </p>
          </div>
        )}

        {/* Login Button */}
        <a
          href="/api/auth/login"
          className="group block w-full border border-black/10 dark:border-white/10 hover:border-black/20 dark:hover:border-white/20 transition-colors rounded-lg p-6"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-lg bg-black/[0.04] dark:bg-white/[0.04] flex items-center justify-center group-hover:bg-black/[0.08] dark:group-hover:bg-white/[0.08] transition-colors">
              <svg className="w-6 h-6 text-black dark:text-white" viewBox="0 0 16 16" fill="currentColor">
                <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z"/>
              </svg>
            </div>
            <div className="flex-1">
              <p className="text-base font-medium text-black dark:text-white mb-1">
                使用 GitHub 登录
              </p>
              <p className="text-sm text-black/50 dark:text-white/50">
                只有授权的管理员可以访问
              </p>
            </div>
            <svg className="w-5 h-5 text-black/30 dark:text-white/30 group-hover:text-black/60 dark:group-hover:text-white/60 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </div>
        </a>
      </div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
      <LoginContent />
    </Suspense>
  )
}

