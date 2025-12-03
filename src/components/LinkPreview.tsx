'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { ExternalLink, Globe } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface LinkMetadata {
  page_url: string;
  title: string;
  description: string;
  favicon_url?: string;
  open_graph?: {
    image?: string;
  };
}

interface LinkPreviewProps {
  url: string;
  children: React.ReactNode;
}

// 客户端缓存
const previewCache = new Map<string, LinkMetadata | null>();
const pendingRequests = new Map<string, Promise<LinkMetadata | null>>();

async function fetchMetadata(url: string): Promise<LinkMetadata | null> {
  // 检查缓存
  if (previewCache.has(url)) {
    return previewCache.get(url) || null;
  }

  // 检查是否有正在进行的请求
  if (pendingRequests.has(url)) {
    return pendingRequests.get(url)!;
  }

  // 创建新请求
  const request = fetch(`/api/link-preview?url=${encodeURIComponent(url)}`)
    .then(res => res.ok ? res.json() : null)
    .catch(() => null)
    .then(data => {
      previewCache.set(url, data);
      pendingRequests.delete(url);
      return data;
    });

  pendingRequests.set(url, request);
  return request;
}

export function LinkPreview({ url, children }: LinkPreviewProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [metadata, setMetadata] = useState<LinkMetadata | null>(null);
  const [loading, setLoading] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const linkRef = useRef<HTMLAnchorElement>(null);

  const handleMouseEnter = useCallback((e: React.MouseEvent) => {
    // 延迟显示，避免误触
    timeoutRef.current = setTimeout(() => {
      setIsHovered(true);
      
      if (!metadata) {
        setLoading(true);
        fetchMetadata(url).then(data => {
          setMetadata(data);
          setLoading(false);
        });
      }
    }, 300);

    // 计算位置
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    setPosition({
      x: rect.left + rect.width / 2,
      y: rect.bottom + 8,
    });
  }, [url, metadata]);

  const handleMouseLeave = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    setIsHovered(false);
  }, []);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return (
    <>
      <a
        ref={linkRef}
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        className="link-with-preview"
      >
        {children}
      </a>

      <AnimatePresence>
        {isHovered && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.96 }}
            transition={{ duration: 0.15, ease: 'easeOut' }}
            style={{
              position: 'fixed',
              left: position.x,
              top: position.y,
              transform: 'translateX(-50%)',
              zIndex: 9999,
            }}
            className="pointer-events-none"
          >
            <div className="w-[380px] max-w-[90vw] bg-white dark:bg-zinc-900 rounded-xl shadow-2xl border border-black/[0.08] dark:border-white/[0.08] overflow-hidden backdrop-blur-xl">
              {loading ? (
                <div className="p-4 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-black/[0.04] dark:bg-white/[0.04] animate-pulse" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-black/[0.04] dark:bg-white/[0.04] rounded animate-pulse w-3/4" />
                    <div className="h-3 bg-black/[0.04] dark:bg-white/[0.04] rounded animate-pulse w-full" />
                  </div>
                </div>
              ) : metadata ? (
                <div className="overflow-hidden">
                  {/* 封面图 */}
                  {metadata.open_graph?.image && (
                    <div className="relative w-full h-40 bg-gradient-to-br from-black/[0.02] to-black/[0.06] dark:from-white/[0.02] dark:to-white/[0.06]">
                      <img
                        src={metadata.open_graph.image}
                        alt=""
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLElement).style.display = 'none';
                        }}
                      />
                    </div>
                  )}

                  {/* 内容 */}
                  <div className="p-4">
                    {/* 网站图标和标题 */}
                    <div className="flex items-start gap-3 mb-2">
                      {metadata.favicon_url ? (
                        <img
                          src={metadata.favicon_url}
                          alt=""
                          className="w-5 h-5 rounded flex-shrink-0 mt-0.5"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/></svg>';
                          }}
                        />
                      ) : (
                        <Globe className="w-5 h-5 text-black/40 dark:text-white/40 flex-shrink-0 mt-0.5" />
                      )}
                      <div className="flex-1 min-w-0">
                        <h3 className="text-sm font-medium text-black dark:text-white line-clamp-2 leading-snug mb-1">
                          {metadata.title}
                        </h3>
                        {metadata.description && (
                          <p className="text-xs text-black/60 dark:text-white/60 line-clamp-2 leading-relaxed">
                            {metadata.description}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* 域名 */}
                    <div className="flex items-center gap-1.5 mt-3 pt-3 border-t border-black/[0.06] dark:border-white/[0.06]">
                      <ExternalLink className="w-3 h-3 text-black/40 dark:text-white/40" />
                      <span className="text-xs text-black/40 dark:text-white/40 truncate">
                        {new URL(metadata.page_url).hostname}
                      </span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="p-4 text-center">
                  <Globe className="w-8 h-8 text-black/20 dark:text-white/20 mx-auto mb-2" />
                  <p className="text-xs text-black/40 dark:text-white/40">
                    无法加载预览
                  </p>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
