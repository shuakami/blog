import { redirect } from 'next/navigation'
import { getAdminUser } from '@/lib/auth'
import PostEditor from '../[slug]/PostEditor'

export default async function NewPostPage() {
  const user = await getAdminUser()

  if (!user) {
    redirect('/admin/login')
  }

  // 新文章的初始内容
  const now = new Date().toISOString()
  const initialContent = `---
title: 无标题
date: ${now}
category: 未分类
tags: 
---

开始写作...
`

  return <PostEditor slug="new" initialContent={initialContent} isNewPost={true} />
}

