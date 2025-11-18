import type { Metadata } from 'next';
import Link from 'next/link';
import { getResources } from '@/utils/resources';

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
  
  return (
    <div className="max-w-4xl mx-auto px-6 sm:px-8 md:px-6 py-12 sm:py-16 md:py-24">
      <header className="mb-12 sm:mb-16">
        <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-medium tracking-tight text-black dark:text-white mb-3 sm:mb-4">
          资源
        </h1>
        <p className="text-base sm:text-lg text-black/50 dark:text-white/50 mb-6 sm:mb-8 leading-relaxed">
          精心整理的实用资源和数据集，全部免费开放使用
        </p>
        <div className="w-12 sm:w-16 h-[2px] bg-black dark:bg-white" />
      </header>

      {resources.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-black/60 dark:text-white/60 mb-4">暂无资源</p>
          <p className="text-sm text-black/40 dark:text-white/40">
            在 Obsidian 文章的 frontmatter 中添加 resource: true 来创建资源
          </p>
        </div>
      ) : (
        <>
          <div className="mb-12 sm:mb-16 p-5 sm:p-6 rounded-xl bg-black/[0.02] dark:bg-white/[0.02]">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div className="space-y-1">
                <h3 className="text-2xl sm:text-3xl font-semibold text-black dark:text-white">
                  {resources.length}
                </h3>
                <p className="text-sm text-black/60 dark:text-white/60">资源总数</p>
              </div>
              <div className="space-y-1">
                <h3 className="text-2xl sm:text-3xl font-semibold text-black dark:text-white">
                  {new Set(resources.map(r => r.type)).size}+
                </h3>
                <p className="text-sm text-black/60 dark:text-white/60">数据类型</p>
              </div>
              <div className="space-y-1">
                <h3 className="text-2xl sm:text-3xl font-semibold text-black dark:text-white">100%</h3>
                <p className="text-sm text-black/60 dark:text-white/60">免费开放</p>
              </div>
              <div className="space-y-1">
                <h3 className="text-2xl sm:text-3xl font-semibold text-black dark:text-white">持续更新</h3>
                <p className="text-sm text-black/60 dark:text-white/60">维护状态</p>
              </div>
            </div>
          </div>

          <div className="space-y-0">
            {resources.map((resource, index) => (
              <article
                key={index}
                className="group py-8 sm:py-12 md:py-16 border-b border-black/[0.06] dark:border-white/[0.06] last:border-0"
              >
                <div className="space-y-4 sm:space-y-5">
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 sm:gap-4">
                    <div className="flex-1 min-w-0">
                      <Link href={`/resources/${resource.slug}` as any}>
                        <h2 className="text-xl sm:text-2xl md:text-3xl font-medium text-black dark:text-white mb-2 sm:mb-2 hover:text-black/70 dark:hover:text-white/70 transition-colors cursor-pointer">
                          {resource.title}
                        </h2>
                      </Link>
                      <p className="text-sm sm:text-base text-black/60 dark:text-white/60 leading-relaxed">
                        {resource.description}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0 sm:mt-1">
                      <span className="text-xs sm:text-sm text-black/40 dark:text-white/40">
                        {resource.type}
                      </span>
                      {resource.format && (
                        <>
                          <span className="text-xs text-black/20 dark:text-white/20">·</span>
                          <span className="text-xs sm:text-sm text-black/40 dark:text-white/40">
                            {resource.format}
                          </span>
                        </>
                      )}
                    </div>
                  </div>

                  <div className="rounded-lg sm:rounded-xl bg-black/[0.02] dark:bg-white/[0.02] px-4 py-4 sm:px-5 sm:py-5 md:px-8 md:py-6">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 sm:gap-5 md:gap-6">
                      <div className="flex items-center gap-6 sm:gap-8 md:gap-12">
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

                      <div className="flex flex-col sm:flex-row gap-2 md:items-end md:flex-shrink-0 w-full sm:w-auto md:w-auto">
                        <Link
                          href={`/resources/${resource.slug}` as any}
                          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 sm:py-2.5 md:py-2 rounded-full bg-black/[0.06] dark:bg-white/[0.08] text-black dark:text-white text-sm font-medium hover:bg-black/[0.10] dark:hover:bg-white/[0.12] transition-colors whitespace-nowrap w-full sm:w-auto"
                        >
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                            <circle cx="12" cy="12" r="3"/>
                          </svg>
                          查看详情
                        </Link>
                        {resource.downloadUrl && (
                          <a
                            href={resource.downloadUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 sm:py-2.5 md:py-2 rounded-full bg-black dark:bg-white text-white dark:text-black text-sm font-medium hover:bg-black/80 dark:hover:bg-white/80 active:bg-black/70 dark:active:bg-white/70 transition-colors whitespace-nowrap w-full sm:w-auto"
                          >
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                              <polyline points="7 10 12 15 17 10" />
                              <line x1="12" y1="15" x2="12" y2="3" />
                            </svg>
                            下载资源
                          </a>
                        )}
                      </div>
                    </div>
                  </div>

                  {resource.tags && resource.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 sm:gap-2">
                      {resource.tags.map((tag) => (
                        <span
                          key={tag}
                          className="px-2 sm:px-2.5 py-1 text-xs rounded-md bg-black/[0.04] dark:bg-white/[0.06] text-black/50 dark:text-white/50"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </article>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
