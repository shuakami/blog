import type { Metadata } from 'next';
import { getResources } from '@/utils/resources';
import ResourcesClient from '@/components/ResourcesClient';

// ISR: 每60秒重新验证一次
export const revalidate = 60;

export const metadata: Metadata = {
  title: 'Resources',
  description: 'Things gathered and found useful, freely given.',
  openGraph: {
    title: 'Resources',
    description: 'Things gathered and found useful, freely given.',
  },
};

export default async function ResourcesPage() {
  const resources = await getResources();
  
  return <ResourcesClient resources={resources} />;
}
