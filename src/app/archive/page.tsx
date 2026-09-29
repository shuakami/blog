import type { Metadata } from 'next';
import { Suspense } from 'react';
import { getBlogPosts } from '@/utils/posts';
import ArchiveClientPage from '@/components/ArchiveClientPage';

export const metadata: Metadata = {
  title: 'Archive',
  description: 'Every note, filed by year.',
};

export const revalidate = 60;

export default async function ArchivePage() {
  const { posts } = await getBlogPosts(1);

  return (
    <Suspense fallback={null}>
      <ArchiveClientPage posts={posts} />
    </Suspense>
  );
}
