'use client';

import { useState } from 'react';
import Link from 'next/link';

interface Resource {
  title: string;
  description: string;
  slug: string;
  type?: string;
  format?: string;
  size?: string;
  lastUpdated?: string;
  downloadUrl?: string;
  tags?: string[];
  sample?: string;
}

interface ResourcesClientProps {
  resources: Resource[];
}

// 解码 HTML 实体
function decodeHtmlEntities(text: string): string {
  const textarea = document.createElement('textarea');
  textarea.innerHTML = text;
  return textarea.value;
}

// 从 HTML 内容中提取代码块
function extractCodeFromHtml(html: string): string {
  const match = html.match(/<code[^>]*>([\s\S]*?)<\/code>/);
  if (match) {
    const code = match[1].replace(/<[^>]*>/g, '').trim();
    return decodeHtmlEntities(code);
  }
  return '';
}

// 从 HTML 内容中提取描述（代码块之前的文本）
function extractDescriptionFromHtml(html: string): string {
  const parts = html.split(/<pre[^>]*>/);
  if (parts[0]) {
    return parts[0].replace(/<[^>]*>/g, '').trim();
  }
  return '';
}

export default function ResourcesClient({ resources }: ResourcesClientProps) {
  const [activeTab, setActiveTab] = useState<'resources' | 'commands'>('resources');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // 分离普通资源和命令资源
  const normalResources = resources.filter(r => r.type !== 'command');
  const commandResources = resources.filter(r => r.type === 'command');

  const copyToClipboard = async (command: string, id: string) => {
    try {
      await navigator.clipboard.writeText(command);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch (err) {
      console.error('复制失败:', err);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-6 sm:px-8 md:px-6 py-12 sm:py-16 md:py-24">
      <header className="mb-6">
        <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-medium tracking-tight text-black dark:text-white mb-3 sm:mb-4">
          资源
        </h1>
        <p className="text-base sm:text-lg text-black/50 dark:text-white/50 mb-6 leading-relaxed">
          整理的实用资源和数据集，全部免费开放使用
        </p>
        <div className="w-12 sm:w-16 h-[2px] bg-black dark:bg-white" />
      </header>

      {/* Tab 切换 */}
      <div className="flex gap-1 p-1 mb-6 bg-black/[0.04] dark:bg-white/[0.06] rounded-full w-fit">
        <button
          onClick={() => setActiveTab('resources')}
          className={`px-5 py-2 text-sm font-medium rounded-full transition-all ${
            activeTab === 'resources'
              ? 'bg-white dark:bg-black text-black dark:text-white shadow-sm'
              : 'text-black/60 dark:text-white/60 hover:text-black dark:hover:text-white'
          }`}
        >
          资源
        </button>
        <button
          onClick={() => setActiveTab('commands')}
          className={`px-5 py-2 text-sm font-medium rounded-full transition-all ${
            activeTab === 'commands'
              ? 'bg-white dark:bg-black text-black dark:text-white shadow-sm'
              : 'text-black/60 dark:text-white/60 hover:text-black dark:hover:text-white'
          }`}
        >
          命令
        </button>
      </div>

      {/* 资源列表 */}
      {activeTab === 'resources' && (
        <>
          {normalResources.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-black/60 dark:text-white/60 mb-4">暂无资源</p>
              <p className="text-sm text-black/40 dark:text-white/40">
                在 Obsidian 文章的 frontmatter 中添加 resource: true 来创建资源
              </p>
            </div>
          ) : (
            <div className="space-y-0">
              {normalResources.map((resource, index) => (
                <article
                  key={index}
                  className="group py-6 border-b border-black/[0.06] dark:border-white/[0.06] last:border-0"
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
          )}
        </>
      )}

      {/* 命令列表 */}
      {activeTab === 'commands' && (
        <div className="space-y-4 py-6">
          {commandResources.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-black/60 dark:text-white/60">暂无收藏的命令</p>
            </div>
          ) : (
            commandResources.map((cmd) => {
              const code = extractCodeFromHtml(cmd.sample || '');
              const description = extractDescriptionFromHtml(cmd.sample || '') || cmd.description;
              return (
                <div
                  key={cmd.slug}
                  className="group rounded-xl bg-black/[0.02] dark:bg-white/[0.02] border border-black/[0.06] dark:border-white/[0.06] overflow-hidden"
                >
                  <div className="px-5 py-4 flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <h3 className="text-base font-medium text-black dark:text-white mb-1">
                        {cmd.title}
                      </h3>
                      {description && (
                        <p className="text-sm text-black/50 dark:text-white/50">
                          {description}
                        </p>
                      )}
                    </div>
                    <button
                      onClick={() => copyToClipboard(code, cmd.slug)}
                      className={`flex-shrink-0 inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all ${
                        copiedId === cmd.slug
                          ? 'bg-black/[0.06] dark:bg-white/[0.08] text-black/60 dark:text-white/60'
                          : 'bg-black/[0.06] dark:bg-white/[0.08] text-black dark:text-white hover:bg-black/[0.10] dark:hover:bg-white/[0.12]'
                      }`}
                    >
                      {copiedId === cmd.slug ? (
                        <>
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <polyline points="20 6 9 17 4 12" />
                          </svg>
                          已复制
                        </>
                      ) : (
                        <>
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                            <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                          </svg>
                          复制
                        </>
                      )}
                    </button>
                  </div>
                  <div className="px-5 py-3 bg-black/[0.03] dark:bg-white/[0.03] border-t border-black/[0.06] dark:border-white/[0.06] overflow-x-auto">
                    <pre className="text-sm text-black/80 dark:text-white/80 font-mono whitespace-pre-wrap break-all">
                      <code>{code}</code>
                    </pre>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}
