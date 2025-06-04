import type { Metadata } from 'next';
import ArchiveContent from '@/components/ArchiveContent';
import { getBlogPosts } from '@/utils/posts';
import { formatDate } from '@/utils/date';

export const metadata: Metadata = {
  title: '归档 - Luoxiaohei',
  description: '所有博客文章'
};

export const revalidate = 60;

export default async function ArchivePage() {
  const { posts, total } = await getBlogPosts(1);
  
  const formattedPosts = posts.map(post => ({
    ...post,
    date: formatDate(post.date),
    coverImage: post.coverImage || null,
    excerpt: post.excerpt || '暂无描述'
  }));

  return <ArchiveContent initialPosts={formattedPosts} />;
} 