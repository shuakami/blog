import type { Metadata } from 'next';
import { getResources } from '@/utils/resources';
import ResourcesClient from '@/components/ResourcesClient';

export const metadata: Metadata = {
  title: '资源 - Shuakami',
  description: '我分享的各种实用资源和数据集',
  openGraph: {
    title: '资源 - Shuakami',
    description: '我分享的各种实用资源和数据集',
  },
};

export default async function ResourcesPage() {
  const resources = await getResources();
  
  return <ResourcesClient resources={resources} />;
}
