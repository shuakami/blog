'use client';

import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ExternalLink, Globe } from 'lucide-react';

interface LinkMetadata {
  page_url: string;
  title: string;
  description: string;
  favicon_url?: string;
  open_graph?: {
    image?: string;
  };
}

interface LinkPreviewProviderProps {
  children: React.ReactNode;
}

// 客户端缓存
const previewCache = new Map<string, LinkMetadata | null>();
const pendingRequests = new Map<string, Promise<LinkMetadata | null>>();

async function fetchMetadata(url: string): Promise<LinkMetadata | null> {
  if (previewCache.has(url)) {
    return previewCache.get(url) || null;
  }

  if (pendingRequests.has(url)) {
    return pendingRequests.get(url)!;
  }

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

function isExternalLink(url: string): boolean {
  try {
    const urlObj = new URL(url, window.location.href);
    return urlObj.hostname !== window.location.hostname && 
           (urlObj.protocol === 'http:' || urlObj.protocol === 'https:');
  } catch {
    return false;
  }
}

export function LinkPreviewProvider({ children }: LinkPreviewProviderProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [hoveredLink, setHoveredLink] = useState<{ url: string; rect: DOMRect } | null>(null);
  const [metadata, setMetadata] = useState<LinkMetadata | null>(null);
  const [loading, setLoading] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const [position, setPosition] = useState<{ x: number; y: number; showAbove?: boolean }>({ x: 0, y: 0 });
  const isOverTooltipRef = useRef(false); // 追踪鼠标是否在 tooltip 上
  const currentUrlRef = useRef<string | null>(null); // 追踪当前显示的 URL

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let currentLink: HTMLAnchorElement | null = null;

    const handleMouseOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const link = target.closest('a');
      
      // 如果没有链接，清除当前状态
      if (!link) {
        if (currentLink && timeoutRef.current) {
          clearTimeout(timeoutRef.current);
          currentLink = null;
          currentUrlRef.current = null;
        }
        return;
      }
      
      // 如果鼠标已经在同一个链接上，只清除定时器，保持显示
      if (link === currentLink) {
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
        }
        return;
      }
      
      // 清除之前的链接
      if (currentLink) {
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
        }
        currentLink = null;
      }
      
      const href = link.getAttribute('href');
      // 只处理外部链接
      if (!href || !isExternalLink(href)) return;

      currentLink = link;

      // 延迟显示预览
      timeoutRef.current = setTimeout(() => {
        // 如果已经显示了同一个链接，不重新设置状态（避免重复触发动画）
        if (currentUrlRef.current === href) {
          return;
        }
        
        const rect = link.getBoundingClientRect();
        currentUrlRef.current = href;
        setHoveredLink({ url: href, rect });
        
        // 智能定位：检测下方空间，决定显示在上方还是下方
        const CARD_HEIGHT = 200; // 预估卡片高度
        const SPACING = 12;
        const viewportHeight = window.innerHeight;
        
        // 计算视口中的可用空间
        const spaceBelow = viewportHeight - rect.bottom;
        const spaceAbove = rect.top;
        
        // 如果下方空间不足，优先显示在上方
        const showAbove = spaceBelow < CARD_HEIGHT && spaceAbove > 100;
        
        const leftOffset = -120; // 往左偏移像素
        
        const finalX = rect.left + rect.width / 2 + leftOffset;
        const finalY = showAbove ? rect.top - 145 : rect.bottom + SPACING;

        setPosition({
          x: finalX,
          y: finalY,
          showAbove,
        });

        // 获取元数据
        setLoading(true);
        fetchMetadata(href).then(data => {
          setMetadata(data);
          setLoading(false);
        });
      }, 300);
    };

    const handleMouseOut = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const link = target.closest('a');
      
      if (link !== currentLink) return;

      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      // 延迟隐藏，给用户时间移动鼠标到 tooltip
      timeoutRef.current = setTimeout(() => {
        // 只有在不在 tooltip 上时才隐藏
        if (!isOverTooltipRef.current) {
          currentLink = null;
          currentUrlRef.current = null;
          setHoveredLink(null);
          setMetadata(null);
        }
      }, 200);
    };

    // 滚动时隐藏 tooltip
    const handleScroll = () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      currentLink = null;
      currentUrlRef.current = null;
      setHoveredLink(null);
      setMetadata(null);
    };

    // 使用 mouseover/mouseout 事件（会冒泡）
    container.addEventListener('mouseover', handleMouseOver);
    container.addEventListener('mouseout', handleMouseOut);
    window.addEventListener('scroll', handleScroll, true); // 捕获阶段监听所有滚动

    return () => {
      container.removeEventListener('mouseover', handleMouseOver);
      container.removeEventListener('mouseout', handleMouseOut);
      window.removeEventListener('scroll', handleScroll, true);
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return (
    <>
      <div ref={containerRef} className="link-preview-container">
        {children}
      </div>

      <AnimatePresence>
        {hoveredLink && (
          <motion.div
            initial={{ 
              opacity: 0, 
              scale: 0.96 
            }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ 
              opacity: 0, 
              scale: 0.96 
            }}
            transition={{ duration: 0.15, ease: 'easeOut' }}
            style={{
              position: 'fixed',
              left: position.x,
              top: position.y,
              transform: 'translateX(-50%)',
              zIndex: 9999,
            }}
            className="cursor-pointer"
            onMouseEnter={() => {
              // 鼠标进入 tooltip
              isOverTooltipRef.current = true;
              if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
              }
            }}
            onMouseLeave={() => {
              // 鼠标离开 tooltip
              isOverTooltipRef.current = false;
              
              if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
              }
              
              // 延迟隐藏
              timeoutRef.current = setTimeout(() => {
                currentUrlRef.current = null;
                setHoveredLink(null);
                setMetadata(null);
              }, 150);
            }}
            onClick={() => {
              // 点击 tooltip 跳转到链接
              if (hoveredLink) {
                window.open(hoveredLink.url, '_blank', 'noopener,noreferrer');
              }
            }}
          >
            <div className="w-[340px] max-w-[90vw] bg-white dark:bg-zinc-900 rounded-xl shadow-2xl border border-black/[0.08] dark:border-white/[0.08] overflow-hidden backdrop-blur-xl transition-colors duration-200 hover:bg-black/[0.02] dark:hover:bg-white/[0.02]">
              {loading ? (
                <div className="p-4">
                  <div className="flex items-start gap-3 mb-2">
                    <div className="w-5 h-5 rounded bg-black/[0.04] dark:bg-white/[0.04] animate-pulse flex-shrink-0 mt-0.5" />
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-black/[0.04] dark:bg-white/[0.04] rounded animate-pulse w-3/4" />
                      <div className="h-3 bg-black/[0.04] dark:bg-white/[0.04] rounded animate-pulse w-full" />
                      <div className="h-3 bg-black/[0.04] dark:bg-white/[0.04] rounded animate-pulse w-4/5" />
                    </div>
                  </div>
                  <div className="mt-3 pt-3 border-t border-black/[0.06] dark:border-white/[0.06]">
                    <div className="h-3 bg-black/[0.04] dark:bg-white/[0.04] rounded animate-pulse w-32" />
                  </div>
                </div>
              ) : metadata ? (
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
              ) : (
                <div className="p-4">
                    <div className="flex items-start gap-3 mb-2">
                      <Globe className="w-5 h-5 text-black/40 dark:text-white/40 flex-shrink-0 mt-0.5" />
                      <div className="flex-1 min-w-0">
                        <h3 className="text-sm font-medium text-black/60 dark:text-white/60 leading-snug mb-1">
                          无法加载预览
                        </h3>
                        <p className="text-xs text-black/40 dark:text-white/40 leading-relaxed">
                          可能是网络问题或该网站不支持预览
                        </p>
                      </div>
                    </div>
                  <div className="mt-3 pt-3 border-t border-black/[0.06] dark:border-white/[0.06]">
                    <div className="flex items-center gap-1.5">
                      <ExternalLink className="w-3 h-3 text-black/40 dark:text-white/40" />
                      <span className="text-xs text-black/40 dark:text-white/40 truncate">
                        {hoveredLink ? new URL(hoveredLink.url).hostname : ''}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
