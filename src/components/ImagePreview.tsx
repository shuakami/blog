'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import {
  AnimatePresence,
  animate,
  motion,
  useMotionValue,
  useReducedMotion,
  useTransform,
  type PanInfo,
} from 'framer-motion';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';

interface Shot {
  src: string;
  alt: string;
  el: HTMLImageElement;
  ratio: number;
  natural: number;
}

interface Box {
  w: number;
  h: number;
}

const FLIGHT = { type: 'spring', stiffness: 380, damping: 36, mass: 0.9 } as const;
const SETTLE = { type: 'spring', stiffness: 520, damping: 42 } as const;
const MAX_ZOOM = 4;

function describe(el: HTMLImageElement): Shot {
  const r = el.getBoundingClientRect();
  const ratio =
    el.naturalWidth && el.naturalHeight
      ? el.naturalWidth / el.naturalHeight
      : r.width && r.height
        ? r.width / r.height
        : 4 / 3;
  const alt = el.alt?.trim() ?? '';
  return { src: el.currentSrc || el.src, alt, el, ratio, natural: el.naturalWidth };
}

function fit(shot: Shot, vw: number, vh: number): Box {
  const narrow = vw < 768;
  const maxW = vw - (narrow ? 24 : 192);
  const maxH = vh - (narrow ? 136 : 168);
  const cap = shot.natural ? Math.max(shot.natural * 2, shot.el.getBoundingClientRect().width) : Infinity;
  let w = Math.min(maxW, cap);
  let h = w / shot.ratio;
  if (h > maxH) {
    h = maxH;
    w = h * shot.ratio;
  }
  return { w, h };
}

function onScreen(r: DOMRect, vw: number, vh: number) {
  return r.width > 0 && r.bottom > 0 && r.top < vh && r.right > 0 && r.left < vw;
}

function captionOf(alt: string) {
  if (!alt || /\.(png|jpe?g|gif|webp|avif|svg)$/i.test(alt) || /^(image|img|图片)\s*\d*$/i.test(alt)) return '';
  return alt;
}

export function ImagePreview() {
  const [shots, setShots] = useState<Shot[]>([]);
  const [index, setIndex] = useState(0);
  const [open, setOpen] = useState(false);
  const [dir, setDir] = useState(0);
  const [zoom, setZoom] = useState(1);
  const [vp, setVp] = useState({ w: 0, h: 0 });
  const closing = useRef(false);
  const lastTap = useRef(0);
  const pressedBackdrop = useRef(false);
  const dialogRef = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();

  const fx = useMotionValue(0);
  const fy = useMotionValue(0);
  const fs = useMotionValue(1);
  const fade = useMotionValue(0);
  const dx = useMotionValue(0);
  const dy = useMotionValue(0);
  const backdrop = useTransform([fade, dy], ([f, y]: number[]) => f * (1 - Math.min(Math.abs(y) / 420, 0.65)));
  const chrome = useTransform([fade, dy], ([f, y]: number[]) => f * (1 - Math.min(Math.abs(y) / 140, 1)));

  const shot = shots[index];

  const flightTo = useCallback(
    (s: Shot, w: number, h: number) => {
      const r = s.el.getBoundingClientRect();
      if (!onScreen(r, w, h)) return null;
      const box = fit(s, w, h);
      return {
        x: r.left + r.width / 2 - w / 2,
        y: r.top + r.height / 2 - h / 2,
        s: r.width / box.w,
      };
    },
    []
  );

  const show = useCallback(
    (el: HTMLImageElement) => {
      const all = Array.from(document.querySelectorAll<HTMLImageElement>('.markdown-body img'));
      const list = all.map(describe);
      const at = Math.max(all.indexOf(el), 0);
      const w = window.innerWidth;
      const h = window.innerHeight;
      const from = reduce ? null : flightTo(list[at], w, h);

      closing.current = false;
      dx.set(0);
      dy.set(0);
      fx.set(from?.x ?? 0);
      fy.set(from?.y ?? 0);
      fs.set(from?.s ?? 0.94);
      fade.set(0);

      setVp({ w, h });
      setShots(list);
      setIndex(at);
      setDir(0);
      setZoom(1);
      setOpen(true);

      animate(fx, 0, reduce ? { duration: 0 } : FLIGHT);
      animate(fy, 0, reduce ? { duration: 0 } : FLIGHT);
      animate(fs, 1, reduce ? { duration: 0 } : FLIGHT);
      animate(fade, 1, { duration: reduce ? 0.12 : 0.28, ease: [0.2, 0, 0, 1] });
    },
    [reduce, flightTo, fx, fy, fs, fade, dx, dy]
  );

  const close = useCallback(async () => {
    if (closing.current || !shot) return;
    closing.current = true;
    setZoom(1);
    const to = reduce ? null : flightTo(shot, window.innerWidth, window.innerHeight);
    const spring = { type: 'spring', stiffness: 420, damping: 40 } as const;
    const runs = [
      animate(fade, 0, { duration: reduce ? 0.12 : 0.24, ease: [0.4, 0, 0.2, 1] }),
      animate(dx, 0, spring),
      animate(dy, 0, spring),
    ];
    if (to) {
      runs.push(animate(fx, to.x, spring), animate(fy, to.y, spring), animate(fs, to.s, spring));
    } else {
      runs.push(animate(fs, 0.96, { duration: 0.2 }));
    }
    await Promise.all(runs);
    setOpen(false);
  }, [shot, reduce, flightTo, fade, dx, dy, fx, fy, fs]);

  const go = useCallback(
    (step: number) => {
      if (shots.length < 2) return;
      setDir(step);
      setZoom(1);
      dx.set(0);
      dy.set(0);
      setIndex((i) => (i + step + shots.length) % shots.length);
    },
    [shots.length, dx, dy]
  );

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      const target = e.target;
      if (!(target instanceof HTMLImageElement) || !target.closest('.markdown-body')) return;
      e.preventDefault();
      show(target);
    };
    document.addEventListener('click', onClick);
    return () => document.removeEventListener('click', onClick);
  }, [show]);

  useEffect(() => {
    if (!open || !shot) return;
    shot.el.style.visibility = 'hidden';
    return () => {
      shot.el.style.visibility = '';
    };
  }, [open, shot]);

  useEffect(() => {
    if (!open) return;
    const previous = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const scrollbar = window.innerWidth - document.documentElement.clientWidth;
    document.body.style.overflow = 'hidden';
    document.body.style.paddingRight = `${scrollbar}px`;
    dialogRef.current?.focus({ preventScroll: true });

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close();
      else if (e.key === 'ArrowLeft') go(-1);
      else if (e.key === 'ArrowRight') go(1);
      else if (e.key === '=' || e.key === '+') setZoom((z) => Math.min(z * 1.5, MAX_ZOOM));
      else if (e.key === '-' || e.key === '_') setZoom((z) => Math.max(z / 1.5, 1));
      else if (e.key === '0') setZoom(1);
      else if (e.key === 'Tab' && dialogRef.current) {
        const items = Array.from(dialogRef.current.querySelectorAll<HTMLElement>('button'));
        if (items.length === 0) return;
        const i = items.indexOf(document.activeElement as HTMLElement);
        const next = e.shiftKey ? (i <= 0 ? items.length - 1 : i - 1) : (i + 1) % items.length;
        e.preventDefault();
        items[next].focus();
      }
    };
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      setZoom((z) => Math.min(Math.max(z * (e.deltaY < 0 ? 1.2 : 1 / 1.2), 1), MAX_ZOOM));
    };
    const onResize = () => setVp({ w: window.innerWidth, h: window.innerHeight });

    document.addEventListener('keydown', onKey);
    document.addEventListener('wheel', onWheel, { passive: false });
    window.addEventListener('resize', onResize);
    return () => {
      document.removeEventListener('keydown', onKey);
      document.removeEventListener('wheel', onWheel);
      window.removeEventListener('resize', onResize);
      document.body.style.overflow = '';
      document.body.style.paddingRight = '';
      previous?.focus({ preventScroll: true });
    };
  }, [open, close, go]);

  useEffect(() => {
    if (zoom === 1) {
      animate(dx, 0, SETTLE);
      animate(dy, 0, SETTLE);
    }
  }, [zoom, dx, dy]);

  const onDragEnd = (_: unknown, info: PanInfo) => {
    if (zoom > 1) return;
    const { offset, velocity } = info;
    if (Math.abs(offset.x) > Math.abs(offset.y)) {
      if (offset.x < -70 || velocity.x < -500) go(1);
      else if (offset.x > 70 || velocity.x > 500) go(-1);
    } else if (Math.abs(offset.y) > 110 || Math.abs(velocity.y) > 650) {
      close();
    }
  };

  const onTap = (e: MouseEvent | TouchEvent | PointerEvent) => {
    const now = e.timeStamp;
    if (now - lastTap.current < 300) {
      setZoom((z) => (z > 1 ? 1 : 2.5));
      lastTap.current = 0;
    } else {
      lastTap.current = now;
    }
  };

  if (!open || !shot || typeof document === 'undefined') return null;

  const box = fit(shot, vp.w, vp.h);
  const caption = captionOf(shot.alt);
  const many = shots.length > 1;
  const pan = { x: (box.w * (zoom - 1)) / 2, y: (box.h * (zoom - 1)) / 2 };

  return createPortal(
    <div
      ref={dialogRef}
      role="dialog"
      aria-modal="true"
      aria-label={caption || 'Image'}
      className="viewer"
      tabIndex={-1}
      onPointerDown={(e) => {
        pressedBackdrop.current = e.target === e.currentTarget || (e.target as HTMLElement).dataset.stage === 'true';
      }}
      onClick={(e) => {
        const onBackdrop = e.target === e.currentTarget || (e.target as HTMLElement).dataset.stage === 'true';
        if (onBackdrop && pressedBackdrop.current) close();
      }}
    >
      <motion.div className="viewer-backdrop" style={{ opacity: backdrop }} aria-hidden />

      <motion.div className="viewer-stage" data-stage="true" style={{ x: fx, y: fy, scale: fs }}>
        <AnimatePresence initial={false} custom={dir}>
          <motion.div
            key={index}
            className="viewer-slide"
            data-stage="true"
            custom={dir}
            variants={{
              enter: (d: number) => ({ opacity: 0, x: d * 56, scale: 0.98 }),
              center: { opacity: 1, x: 0, scale: 1 },
              leave: (d: number) => ({ opacity: 0, x: d * -56, scale: 0.98 }),
            }}
            initial="enter"
            animate="center"
            exit="leave"
            transition={{ x: SETTLE, scale: SETTLE, opacity: { duration: 0.2 } }}
          >
            <motion.img
              src={shot.src}
              alt={shot.alt}
              draggable={false}
              className="viewer-image"
              data-zoomed={zoom > 1}
              style={{ width: box.w, height: box.h, x: dx, y: dy }}
              animate={{ scale: zoom }}
              transition={SETTLE}
              drag
              dragDirectionLock={zoom === 1}
              dragElastic={zoom > 1 ? 0.12 : 0.55}
              dragConstraints={{ left: -pan.x, right: pan.x, top: -pan.y, bottom: pan.y }}
              dragSnapToOrigin={zoom === 1}
              dragTransition={{ bounceStiffness: 420, bounceDamping: 36 }}
              onDragEnd={onDragEnd}
              onTap={onTap}
              onLoad={(e) => {
                const img = e.currentTarget;
                if (!img.naturalWidth || !img.naturalHeight) return;
                const ratio = img.naturalWidth / img.naturalHeight;
                if (Math.abs(ratio - shot.ratio) < 0.01 && shot.natural) return;
                setShots((list) =>
                  list.map((s, i) => (i === index ? { ...s, ratio, natural: img.naturalWidth } : s))
                );
              }}
            />
          </motion.div>
        </AnimatePresence>
      </motion.div>

      <motion.div className="viewer-chrome" style={{ opacity: chrome }}>
        <div className="viewer-top">
          <span className="viewer-count">{many ? `${index + 1} of ${shots.length}` : ''}</span>
          <button type="button" className="viewer-button" onClick={close} aria-label="Close">
            <X className="h-[18px] w-[18px]" strokeWidth={1.75} />
          </button>
        </div>

        {many && (
          <>
            <button type="button" className="viewer-button viewer-side viewer-prev" onClick={() => go(-1)} aria-label="Previous image">
              <ChevronLeft className="h-5 w-5" strokeWidth={1.75} />
            </button>
            <button type="button" className="viewer-button viewer-side viewer-next" onClick={() => go(1)} aria-label="Next image">
              <ChevronRight className="h-5 w-5" strokeWidth={1.75} />
            </button>
          </>
        )}

        <div className="viewer-bottom">
          <AnimatePresence mode="wait" initial={false}>
            <motion.p
              key={index}
              className="viewer-caption"
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.16 }}
            >
              {caption}
            </motion.p>
          </AnimatePresence>
          {many && (
            <div className="viewer-dots" aria-hidden>
              {shots.map((s, i) => (
                <span key={s.src + i} data-on={i === index} />
              ))}
            </div>
          )}
        </div>
      </motion.div>
    </div>,
    document.body
  );
}
