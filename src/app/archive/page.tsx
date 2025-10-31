import type { Metadata } from 'next';
import { getBlogPosts } from '@/utils/posts';
import ArchiveClientPage from '@/components/ArchiveClientPage';

export const metadata: Metadata = {
  title: '归档 - Shuakami',
  description: '技术笔记、开发经验和一些想法的记录',
  openGraph: {
    title: '归档 - Shuakami',
    description: '技术笔记、开发经验和一些想法的记录',
  },
};

export const revalidate = 60;

export default async function ArchivePage() {
  const { posts } = await getBlogPosts(1);

  return <ArchiveClientPage posts={posts} />;
} 