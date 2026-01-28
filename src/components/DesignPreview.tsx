'use client';

import { useState } from 'react';
import { LiveCodeRenderer } from './LiveCodeRenderer';

interface DesignPreviewProps {
  code: string;
  title: string;
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

export function DesignPreview({ code: htmlContent, title }: DesignPreviewProps) {
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const code = extractCodeFromHtml(htmlContent);

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopiedId('code');
      setTimeout(() => setCopiedId(null), 2000);
    } catch (err) {
      console.error('复制失败:', err);
    }
  };

  if (!code) return null;

  return (
    <div className="mb-12">
      {/* 预览区域 */}
      <div className="rounded-2xl bg-black/[0.02] dark:bg-white/[0.02] border border-black/[0.06] dark:border-white/[0.06] overflow-hidden mb-6">
        <div className="h-64 flex items-center justify-center p-8 text-black dark:text-white">
          <LiveCodeRenderer code={code} />
        </div>
      </div>

      {/* 代码区域 */}
      <div className="rounded-2xl bg-black/[0.02] dark:bg-white/[0.02] border border-black/[0.06] dark:border-white/[0.06] overflow-hidden">
        <div className="flex items-center justify-between px-5 py-3 border-b border-black/[0.06] dark:border-white/[0.06]">
          <span className="text-sm font-medium text-black/60 dark:text-white/60">代码</span>
          <button
            onClick={copyToClipboard}
            className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
              copiedId === 'code'
                ? 'bg-black/[0.06] dark:bg-white/[0.08] text-black/60 dark:text-white/60'
                : 'bg-black/[0.06] dark:bg-white/[0.08] text-black dark:text-white hover:bg-black/[0.10] dark:hover:bg-white/[0.12]'
            }`}
          >
            {copiedId === 'code' ? (
              <>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
                已复制
              </>
            ) : (
              <>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                  <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                </svg>
                复制代码
              </>
            )}
          </button>
        </div>
        <div className="p-5 overflow-x-auto max-h-96 overflow-y-auto">
          <pre className="text-sm text-black/70 dark:text-white/70 font-mono whitespace-pre-wrap">
            <code>{code}</code>
          </pre>
        </div>
      </div>
    </div>
  );
}
