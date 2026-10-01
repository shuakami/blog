'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { ArrowUpRight, Globe } from 'lucide-react';

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

interface Anchor {
  id: number;
  url: string;
  rect: DOMRect;
}

const previewCache = new Map<string, LinkMetadata | null>();
const pendingRequests = new Map<string, Promise<LinkMetadata | null>>();

async function fetchMetadata(url: string): Promise<LinkMetadata | null> {
  if (previewCache.has(url)) return previewCache.get(url) ?? null;
  const pending = pendingRequests.get(url);
  if (pending) return pending;

  const request = fetch(`/api/link-preview?url=${encodeURIComponent(url)}`)
    .then((res) => (res.ok ? res.json() : null))
    .catch(() => null)
    .then((data: LinkMetadata | null) => {
      previewCache.set(url, data);
      pendingRequests.delete(url);
      return data;
    });

  pendingRequests.set(url, request);
  return request;
}

function previewable(link: HTMLAnchorElement) {
  if (link.closest('.project-card-link') || link.querySelector('img')) return false;
  try {
    const url = new URL(link.href);
    return (url.protocol === 'http:' || url.protocol === 'https:') && url.hostname !== window.location.hostname;
  } catch {
    return false;
  }
}

function hostOf(url: string) {
  try {
    return new URL(url).hostname.replace(/^www\./, '');
  } catch {
    return url;
  }
}

function pathOf(url: string) {
  try {
    const { pathname, search } = new URL(url);
    const path = decodeURIComponent(pathname + search).replace(/\/$/, '');
    return path || '/';
  } catch {
    return url;
  }
}

function lineRect(link: HTMLAnchorElement, x?: number, y?: number) {
  const rects = Array.from(link.getClientRects());
  if (rects.length === 0) return link.getBoundingClientRect();
  if (x === undefined || y === undefined) return rects[0];
  return rects.reduce((best, r) => {
    const d = (r: DOMRect) => Math.abs(y - (r.top + r.height / 2)) + (x < r.left ? r.left - x : x > r.right ? x - r.right : 0);
    return d(r) < d(best) ? r : best;
  });
}

const SHOW_DELAY = 260;
const WARM_DELAY = 40;
const WAIT_FOR_DATA = 360;
const HIDE_DELAY = 160;
const GAP = 10;
const MARGIN = 12;
const WIDTH = 320;
const ROOM_NEEDED = 280;

const canHover = () => window.matchMedia('(hover: hover) and (pointer: fine)').matches;

export function LinkPreviewProvider({ children }: LinkPreviewProviderProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);
  const [anchor, setAnchor] = useState<Anchor | null>(null);
  const [data, setData] = useState<LinkMetadata | null | undefined>(undefined);
  const anchorRef = useRef<Anchor | null>(null);
  const activeLink = useRef<HTMLAnchorElement | null>(null);
  const token = useRef(0);
  const showTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const hideTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const reduce = useReducedMotion();

  useEffect(() => setMounted(true), []);

  const cancelHide = useCallback(() => clearTimeout(hideTimer.current), []);

  const hide = useCallback(() => {
    clearTimeout(showTimer.current);
    clearTimeout(hideTimer.current);
    token.current++;
    activeLink.current = null;
    anchorRef.current = null;
    setAnchor(null);
  }, []);

  const scheduleHide = useCallback(() => {
    clearTimeout(showTimer.current);
    clearTimeout(hideTimer.current);
    hideTimer.current = setTimeout(hide, HIDE_DELAY);
  }, [hide]);

  const open = useCallback(
    (link: HTMLAnchorElement, x?: number, y?: number) => {
      if (activeLink.current === link) {
        cancelHide();
        return;
      }
      cancelHide();
      clearTimeout(showTimer.current);
      activeLink.current = link;

      const id = ++token.current;
      const live = () => token.current === id;
      const url = link.href;
      const request = fetchMetadata(url);
      let delayPassed = false;
      let revealed = false;

      const reveal = () => {
        if (!live() || revealed) return;
        revealed = true;
        const next = { id, url, rect: lineRect(link, x, y) };
        anchorRef.current = next;
        setData(previewCache.has(url) ? previewCache.get(url) ?? null : undefined);
        setAnchor(next);
      };

      showTimer.current = setTimeout(
        () => {
          delayPassed = true;
          if (previewCache.has(url)) reveal();
          else showTimer.current = setTimeout(reveal, WAIT_FOR_DATA);
        },
        anchorRef.current ? WARM_DELAY : SHOW_DELAY
      );

      request.then((result) => {
        if (!live() || !delayPassed) return;
        if (revealed) setData(result);
        else {
          clearTimeout(showTimer.current);
          reveal();
        }
      });
    },
    [cancelHide]
  );

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const linkFrom = (target: EventTarget | null) => {
      const link = target instanceof Element ? target.closest('a') : null;
      return link && previewable(link) ? link : null;
    };

    const onOver = (e: MouseEvent) => {
      if (!canHover()) return;
      const link = linkFrom(e.target);
      if (link) open(link, e.clientX, e.clientY);
    };
    const onOut = (e: MouseEvent) => {
      const link = linkFrom(e.target);
      if (!link || link !== activeLink.current) return;
      if (e.relatedTarget instanceof Node && link.contains(e.relatedTarget)) return;
      scheduleHide();
    };
    const onFocusIn = (e: FocusEvent) => {
      const link = linkFrom(e.target);
      if (link && link.matches(':focus-visible')) open(link);
    };
    const onFocusOut = (e: FocusEvent) => {
      if (linkFrom(e.target) === activeLink.current) scheduleHide();
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && anchorRef.current) hide();
    };

    container.addEventListener('mouseover', onOver);
    container.addEventListener('mouseout', onOut);
    container.addEventListener('focusin', onFocusIn);
    container.addEventListener('focusout', onFocusOut);
    window.addEventListener('keydown', onKey);
    window.addEventListener('scroll', hide, { capture: true, passive: true });
    window.addEventListener('resize', hide);

    return () => {
      container.removeEventListener('mouseover', onOver);
      container.removeEventListener('mouseout', onOut);
      container.removeEventListener('focusin', onFocusIn);
      container.removeEventListener('focusout', onFocusOut);
      window.removeEventListener('keydown', onKey);
      window.removeEventListener('scroll', hide, { capture: true });
      window.removeEventListener('resize', hide);
      clearTimeout(showTimer.current);
      clearTimeout(hideTimer.current);
    };
  }, [open, hide, scheduleHide]);

  return (
    <>
      <div ref={containerRef} className="link-preview-container">
        {children}
      </div>
      {mounted &&
        createPortal(
          <AnimatePresence>
            {anchor && (
              <PreviewCard
                key={anchor.id}
                anchor={anchor}
                data={data}
                reduce={!!reduce}
                onEnter={cancelHide}
                onLeave={scheduleHide}
              />
            )}
          </AnimatePresence>,
          document.body
        )}
    </>
  );
}

interface PreviewCardProps {
  anchor: Anchor;
  data: LinkMetadata | null | undefined;
  reduce: boolean;
  onEnter: () => void;
  onLeave: () => void;
}

function PreviewCard({ anchor, data, reduce, onEnter, onLeave }: PreviewCardProps) {
  const [vw, vh] = [window.innerWidth, window.innerHeight];
  const { rect, url } = anchor;
  const width = Math.min(WIDTH, vw - MARGIN * 2);
  const center = rect.left + rect.width / 2;
  const left = Math.min(Math.max(center - width / 2, MARGIN), vw - width - MARGIN);
  const below = vh - rect.bottom - GAP - MARGIN;
  const above = rect.top - GAP - MARGIN;
  const flip = below < ROOM_NEEDED && above > below;
  const room = flip ? above : below;
  const originX = Math.min(Math.max(center - left, 16), width - 16);
  const lift = flip ? 6 : -6;

  return (
    <motion.a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      tabIndex={-1}
      className="link-card"
      style={{
        left,
        width,
        maxHeight: room,
        ...(flip ? { bottom: vh - rect.top + GAP } : { top: rect.bottom + GAP }),
        transformOrigin: `${originX}px ${flip ? '100%' : '0%'}`,
      }}
      initial={reduce ? { opacity: 0 } : { opacity: 0, scale: 0.92, y: lift, filter: 'blur(6px)' }}
      animate={reduce ? { opacity: 1 } : { opacity: 1, scale: 1, y: 0, filter: 'blur(0px)' }}
      exit={
        reduce
          ? { opacity: 0, transition: { duration: 0.1 } }
          : { opacity: 0, scale: 0.97, y: lift / 2, filter: 'blur(3px)', transition: { duration: 0.14, ease: [0.4, 0, 1, 1] } }
      }
      transition={{ type: 'spring', stiffness: 560, damping: 36, mass: 0.7 }}
      onMouseEnter={onEnter}
      onMouseLeave={onLeave}
    >
      {data === undefined ? <CardSkeleton url={url} /> : <CardBody url={url} data={data} />}
    </motion.a>
  );
}

function Favicon({ src }: { src?: string }) {
  const [failed, setFailed] = useState(false);
  if (!src || failed) return <Globe className="h-3.5 w-3.5 shrink-0" strokeWidth={1.75} />;
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={src} alt="" className="h-3.5 w-3.5 shrink-0 rounded-[4px]" referrerPolicy="no-referrer" onError={() => setFailed(true)} />
  );
}

function SourceRow({ url, favicon }: { url: string; favicon?: string }) {
  return (
    <div className="link-card-source">
      <Favicon src={favicon} />
      <span className="truncate">{hostOf(url)}</span>
      <ArrowUpRight className="link-card-arrow ml-auto h-3.5 w-3.5 shrink-0" strokeWidth={1.75} />
    </div>
  );
}

function CardBody({ url, data }: { url: string; data: LinkMetadata | null }) {
  const [imageState, setImageState] = useState<'loading' | 'ready' | 'failed'>('loading');
  const image = data?.open_graph?.image;
  const title = data?.title?.trim();
  const description = data?.description?.trim();

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.18 }}>
      {image && imageState !== 'failed' && (
        <div className="link-card-media">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={image}
            alt=""
            referrerPolicy="no-referrer"
            data-ready={imageState === 'ready'}
            onLoad={() => setImageState('ready')}
            onError={() => setImageState('failed')}
          />
        </div>
      )}
      <div className="link-card-text">
        <SourceRow url={url} favicon={data?.favicon_url} />
        {title ? (
          <p className="link-card-title">{title}</p>
        ) : (
          <p className="link-card-title link-card-title-quiet">{pathOf(url)}</p>
        )}
        {description ? (
          <p className="link-card-desc">{description}</p>
        ) : (
          !data && <p className="link-card-desc italic">This page sends no word of itself.</p>
        )}
      </div>
    </motion.div>
  );
}

function CardSkeleton({ url }: { url: string }) {
  return (
    <div className="link-card-text" aria-busy>
      <SourceRow url={url} />
      <span className="link-card-bone mt-3 w-4/5" />
      <span className="link-card-bone mt-2 w-full" />
      <span className="link-card-bone mt-2 w-3/5" />
    </div>
  );
}
