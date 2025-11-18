import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Download, Tag } from 'lucide-react';
import { getResourceBySlug, getResources } from '@/utils/resources';

export async function generateStaticParams() {
  const resources = await getResources();
  console.log('[Resources] Generating static params for:', resources.map(r => r.slug));
  return resources.map((resource) => ({
    slug: resource.slug,
  }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const resource = await getResourceBySlug(slug);
  
  if (!resource) {
    return {
      title: '资源未找到 - Shuakami',
    };
  }

  return {
    title: `${resource.title} - 资源 - Shuakami`,
    description: resource.description,
    openGraph: {
      title: `${resource.title} - 资源 - Shuakami`,
      description: resource.description,
    },
  };
}

export default async function ResourceDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  console.log('[Resource Detail] Requested slug:', slug);
  console.log('[Resource Detail] Decoded slug:', decodeURIComponent(slug));
  
  const resource = await getResourceBySlug(slug);
  console.log('[Resource Detail] Found resource:', resource ? resource.title : 'null');

  if (!resource) {
    notFound();
  }

  return (
    <div className="max-w-4xl mx-auto px-6 sm:px-8 md:px-6 py-12 sm:py-16 md:py-24">
      <Link
        href={"/resources" as any}
        className="inline-flex items-center gap-2 text-sm text-black/60 dark:text-white/60 hover:text-black dark:hover:text-white transition-colors mb-8"
      >
        <ArrowLeft className="w-4 h-4" />
        返回资源列表
      </Link>

      <header className="mb-12">
        <div className="flex items-start justify-between gap-4 mb-4">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-medium tracking-tight text-black dark:text-white">
            {resource.title}
          </h1>
          <span className="px-3 py-1 text-xs rounded-md bg-black/[0.04] dark:bg-white/[0.06] text-black/50 dark:text-white/50 whitespace-nowrap">
            {resource.type}
          </span>
        </div>
        <p className="text-base sm:text-lg text-black/60 dark:text-white/60 leading-relaxed mb-6">
          {resource.description}
        </p>
        <div className="w-16 h-[2px] bg-black dark:bg-white" />
      </header>

      <div className="rounded-lg sm:rounded-xl bg-black/[0.02] dark:bg-white/[0.02] px-4 py-4 sm:px-5 sm:py-5 md:px-8 md:py-6 mb-12">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 sm:gap-5 md:gap-6">
          <div className="flex items-center gap-6 sm:gap-8 md:gap-12">
            {resource.format && (
              <div className="space-y-0.5 sm:space-y-1">
                <h4 className="text-xl sm:text-2xl md:text-3xl font-semibold text-black dark:text-white tracking-tight">
                  {resource.format}
                </h4>
                <p className="text-xs sm:text-xs md:text-sm text-black/70 dark:text-white/70 whitespace-nowrap">
                  格式
                </p>
              </div>
            )}
            {resource.size && (
              <div className="space-y-0.5 sm:space-y-1">
                <h4 className="text-xl sm:text-2xl md:text-3xl font-semibold text-black dark:text-white tracking-tight">
                  {resource.size}
                </h4>
                <p className="text-xs sm:text-xs md:text-sm text-black/70 dark:text-white/70 whitespace-nowrap">
                  文件大小
                </p>
              </div>
            )}
            {resource.lastUpdated && (
              <div className="space-y-0.5 sm:space-y-1">
                <h4 className="text-xl sm:text-2xl md:text-3xl font-semibold text-black dark:text-white tracking-tight">
                  {resource.lastUpdated}
                </h4>
                <p className="text-xs sm:text-xs md:text-sm text-black/70 dark:text-white/70 whitespace-nowrap">
                  更新时间
                </p>
              </div>
            )}
          </div>

          {resource.downloadUrl && (
            <div className="flex flex-col gap-2 md:items-end md:flex-shrink-0 w-full sm:w-auto md:w-auto">
              <a
                href={resource.downloadUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full bg-black dark:bg-white text-white dark:text-black text-base font-medium hover:bg-black/80 dark:hover:bg-white/80 active:bg-black/70 dark:active:bg-white/70 transition-colors whitespace-nowrap w-full sm:w-auto"
              >
                <Download className="w-5 h-5" />
                下载资源
              </a>
            </div>
          )}
        </div>
      </div>

      {resource.details && Object.keys(resource.details).length > 0 && (
        <section className="mb-12">
          <h2 className="text-xl sm:text-2xl font-medium text-black dark:text-white mb-6">
            详细信息
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {Object.entries(resource.details).map(([key, value]) => (
              <div
                key={key}
                className="p-4 rounded-lg border border-black/[0.06] dark:border-white/[0.06]"
              >
                <dt className="text-sm text-black/60 dark:text-white/60 mb-1">{key}</dt>
                <dd className="text-base font-medium text-black dark:text-white">{value as string}</dd>
              </div>
            ))}
          </div>
        </section>
      )}

      {resource.sample && (
        <section className="mb-12">
          <h2 className="text-xl sm:text-2xl font-medium text-black dark:text-white mb-6">
            详细说明
          </h2>
          <div 
            className="prose prose-neutral dark:prose-invert max-w-none"
            dangerouslySetInnerHTML={{ __html: resource.sample }}
          />
        </section>
      )}

      {resource.usage && resource.usage.length > 0 && (
        <section className="mb-12">
          <h2 className="text-xl sm:text-2xl font-medium text-black dark:text-white mb-6">
            使用场景
          </h2>
          <p className="text-sm sm:text-base text-black/60 dark:text-white/60 leading-relaxed">
            {resource.usage.join('、')}
          </p>
        </section>
      )}

      {resource.tags && resource.tags.length > 0 && (
        <section>
          <h2 className="text-xl sm:text-2xl font-medium text-black dark:text-white mb-6">
            标签
          </h2>
          <div className="flex flex-wrap gap-2">
            {resource.tags.map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-md bg-black/[0.04] dark:bg-white/[0.06] text-black/60 dark:text-white/60"
              >
                <Tag className="w-3.5 h-3.5" />
                {tag}
              </span>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
