'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowUpRight, Check, Copy, Download } from 'lucide-react';
import { LiveCodeRenderer } from './LiveCodeRenderer';

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

// 从 HTML 内容中提取代码块（支持 tsx/jsx/typescript）
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
  const [activeTab, setActiveTab] = useState<'resources' | 'commands' | 'design'>('resources');
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('resources-tab') as 'resources' | 'commands' | 'design';
    if (saved) {
      setActiveTab(saved);
    }
    setIsHydrated(true);
  }, []);

  useEffect(() => {
    if (isHydrated) {
      localStorage.setItem('resources-tab', activeTab);
    }
  }, [activeTab, isHydrated]);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [designFilter, setDesignFilter] = useState<string | null>(null);

  // 分离普通资源、命令资源和设计资源
  const normalResources = resources.filter(r => r.type !== 'command' && r.type !== 'design');
  const commandResources = resources.filter(r => r.type === 'command');
  const designResources = resources.filter(r => r.type === 'design');

  const copyToClipboard = async (command: string, id: string) => {
    try {
      await navigator.clipboard.writeText(command);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch (err) {
      console.error('copy failed', err);
    }
  };

  const shouldBlockPreviewNavigation = (target: EventTarget | null) => {
    const node = target as HTMLElement | null;
    if (!node) return false;
    return Boolean(
      node.closest(
        'button, [role="button"], input, textarea, select, label, a, [data-prevent-preview-nav="true"]'
      )
    );
  };

  const tabs = [
    { id: 'resources' as const, label: 'Resources', count: normalResources.length },
    { id: 'commands' as const, label: 'Commands', count: commandResources.length },
    { id: 'design' as const, label: 'Designs', count: designResources.length },
  ];

  const header = (
    <header className="max-w-[46rem]">
      <h1 className="display text-[clamp(2.125rem,5vw,5rem)]">Resources</h1>
    </header>
  );

  if (!isHydrated) {
    return (
      <div className="mx-auto w-full max-w-[64rem] px-6 pb-8 pt-14 md:px-12 md:pt-28">
        {header}
      </div>
    );
  }

  const empty = (text: string) => <p className="py-6 text-[1rem] md:text-[1.125rem] italic text-ink-3">{text}</p>;

  const CopyButton = ({ code, id, compact = false }: { code: string; id: string; compact?: boolean }) => {
    const copied = copiedId === id;
    const Icon = copied ? Check : Copy;
    return (
      <button
        type="button"
        onClick={() => copyToClipboard(code, id)}
        className={`pill shrink-0 ${compact ? 'pill-icon' : ''}`}
        aria-label={copied ? 'Copied' : 'Copy'}
        data-prevent-preview-nav="true"
      >
        <Icon className="h-4 w-4" strokeWidth={1.75} style={copied ? { color: 'var(--accent-green)' } : undefined} />
        {!compact && <span>{copied ? 'Copied' : 'Copy'}</span>}
      </button>
    );
  };

  const designTags = Array.from(new Set(designResources.flatMap((r) => r.tags || [])));

  return (
    <div className="mx-auto w-full max-w-[64rem] px-6 pb-8 pt-14 md:px-12 md:pt-28">
      {header}

      <div className="mt-14 flex flex-wrap gap-2" role="tablist">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            role="tab"
            aria-selected={activeTab === tab.id}
            aria-pressed={activeTab === tab.id}
            onClick={() => setActiveTab(tab.id)}
            className="pill pill-text-only"
          >
            {tab.label}
            <span className="ml-1.5 text-[0.8125rem] italic text-ink-3">{tab.count}</span>
          </button>
        ))}
      </div>

      {activeTab === 'resources' && (
        <div className="mt-16 flex flex-col">
          {normalResources.length === 0
            ? empty('The shelves stand bare.')
            : normalResources.map((resource, index) => (
                <React.Fragment key={resource.slug}>
                  {index > 0 && <span className="hedera mx-auto my-16 text-[1.0625rem] md:text-[1.25rem] text-ink-3" aria-hidden />}
                  <article className="grid gap-8 md:grid-cols-[minmax(0,1fr)_14rem] md:gap-16">
                    <div className="flex flex-col gap-5">
                      <Link href={`/resources/${resource.slug}` as never} className="group">
                        <h2 className="display text-[clamp(1.5rem,3vw,3rem)]">
                          {resource.title}
                        </h2>
                      </Link>
                      <p className="text-[1.0625rem] md:text-[1.1875rem] leading-[1.65] text-ink-body">{resource.description}</p>
                      {resource.tags && resource.tags.length > 0 && (
                        <p className="caps flex flex-wrap gap-x-4 gap-y-1">
                          {resource.tags.map((tag) => (
                            <span key={tag}>{tag}</span>
                          ))}
                        </p>
                      )}
                    </div>
                    <aside className="flex flex-col gap-6">
                      <dl className="grid grid-cols-2 gap-5 md:grid-cols-1">
                        {[
                          ['Kind', resource.type],
                          ['Format', resource.format],
                          ['Size', resource.size],
                          ['Updated', resource.lastUpdated],
                        ]
                          .filter((row): row is [string, string] => Boolean(row[1]))
                          .map(([k, v]) => (
                            <div key={k} className="flex flex-col gap-1">
                              <dd className="text-[1.0625rem] md:text-[1.25rem] font-semibold tracking-[-0.02em] text-ink">{v}</dd>
                              <dt className="text-[0.9375rem] italic text-ink-3">{k}</dt>
                            </div>
                          ))}
                      </dl>
                      <div className="flex flex-wrap gap-2">
                        <Link href={`/resources/${resource.slug}` as never} className="pill">
                          <ArrowUpRight className="h-4 w-4" strokeWidth={1.75} />
                          <span>Open</span>
                        </Link>
                        {resource.downloadUrl && (
                          <a href={resource.downloadUrl} target="_blank" rel="noopener noreferrer" className="pill">
                            <Download className="h-4 w-4" strokeWidth={1.75} />
                            <span>Download</span>
                          </a>
                        )}
                      </div>
                    </aside>
                  </article>
                </React.Fragment>
              ))}
        </div>
      )}

      {activeTab === 'commands' && (
        <div className="mt-16 flex flex-col gap-14">
          {commandResources.length === 0
            ? empty('No incantations kept as yet.')
            : commandResources.map((cmd) => {
                const code = extractCodeFromHtml(cmd.sample || '');
                const description = extractDescriptionFromHtml(cmd.sample || '') || cmd.description;
                return (
                  <article key={cmd.slug} className="flex flex-col gap-4">
                    <div className="flex items-start justify-between gap-6">
                      <div className="flex min-w-0 flex-col gap-2">
                        <Link href={`/resources/${cmd.slug}` as never} className="ink-link self-start text-[1.25rem] md:text-[1.5rem] font-semibold tracking-[-0.025em] text-ink">
                          {cmd.title}
                        </Link>
                        {description && <p className="text-[1.0625rem] leading-[1.6] text-ink-body">{description}</p>}
                      </div>
                      <CopyButton code={code} id={cmd.slug} />
                    </div>
                    <pre className="overflow-x-auto rounded-[10px] bg-[rgba(var(--ink-rgb),0.04)] px-5 py-4 font-mono text-[0.875rem] leading-[1.7] text-ink whitespace-pre-wrap break-all">
                      <code>{code}</code>
                    </pre>
                  </article>
                );
              })}
        </div>
      )}

      {activeTab === 'design' && (
        <div className="mt-16">
          {designResources.length === 0 ? (
            empty('No designs hang upon these walls.')
          ) : (
            <>
              {designTags.length > 0 && (
                <div className="mb-10 flex flex-wrap gap-2">
                  <button type="button" className="pill pill-text-only" aria-pressed={designFilter === null} onClick={() => setDesignFilter(null)}>
                    All
                  </button>
                  {designTags.map((tag) => (
                    <button
                      key={tag}
                      type="button"
                      className="pill pill-text-only"
                      aria-pressed={designFilter === tag}
                      onClick={() => setDesignFilter(designFilter === tag ? null : tag)}
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              )}
              <div className="grid grid-cols-1 gap-x-8 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
                {designResources
                  .filter((r) => !designFilter || (r.tags || []).includes(designFilter))
                  .map((component) => {
                    const code = extractCodeFromHtml(component.sample || '');
                    const description = extractDescriptionFromHtml(component.sample || '') || component.description;
                    return (
                      <div key={component.slug} className="flex flex-col gap-4">
                        <Link
                          href={`/resources/${component.slug}` as never}
                          onClickCapture={(e) => {
                            if (shouldBlockPreviewNavigation(e.target)) {
                              e.preventDefault();
                            }
                          }}
                          className="flex aspect-square items-center justify-center rounded-[12px] bg-[rgba(var(--ink-rgb),0.04)] p-6 text-ink hover:bg-[rgba(var(--ink-rgb),0.07)]"
                        >
                          {code ? <LiveCodeRenderer code={code} /> : <span className="text-[0.9375rem] italic text-ink-3">No likeness</span>}
                        </Link>
                        <div className="flex items-start justify-between gap-3">
                          <Link href={`/resources/${component.slug}` as never} className="flex min-w-0 flex-col gap-1">
                            <h3 className="truncate text-[1rem] md:text-[1.125rem] font-semibold tracking-[-0.02em] text-ink">{component.title}</h3>
                            {description && <p className="truncate text-[0.9375rem] text-ink-3">{description}</p>}
                          </Link>
                          <CopyButton code={code} id={component.slug} compact />
                        </div>
                      </div>
                    );
                  })}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
