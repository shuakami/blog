'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface ImageInfo {
  src: string;
  alt: string;
  index: number;
}

export function ImagePreview() {
  const [isOpen, setIsOpen] = useState(false);
  const [images, setImages] = useState<ImageInfo[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const dragStartPos = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const handleImageClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (target.tagName === 'IMG' && target.closest('.markdown-body')) {
        e.preventDefault();
        
        const allImages = Array.from(
          document.querySelectorAll('.markdown-body img')
        ) as HTMLImageElement[];
        
        const imageList: ImageInfo[] = allImages.map((img, idx) => ({
          src: img.src,
          alt: img.alt || `图片 ${idx + 1}`,
          index: idx,
        }));

        const clickedIndex = allImages.indexOf(target as HTMLImageElement);
        
        setImages(imageList);
        setCurrentIndex(clickedIndex);
        setIsOpen(true);
        setScale(1);
        setPosition({ x: 0, y: 0 });
      }
    };

    document.addEventListener('click', handleImageClick);
    return () => document.removeEventListener('click', handleImageClick);
  }, []);

  const close = useCallback(() => {
    setIsOpen(false);
    setTimeout(() => {
      setScale(1);
      setPosition({ x: 0, y: 0 });
    }, 200);
  }, []);

  const goToPrevious = useCallback(() => {
    setCurrentIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
    setScale(1);
    setPosition({ x: 0, y: 0 });
  }, [images.length]);

  const goToNext = useCallback(() => {
    setCurrentIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
    setScale(1);
    setPosition({ x: 0, y: 0 });
  }, [images.length]);

  const zoomIn = useCallback(() => {
    setScale((prev) => Math.min(prev + 0.5, 4));
  }, []);

  const zoomOut = useCallback(() => {
    setScale((prev) => Math.max(prev - 0.5, 0.5));
  }, []);

  const resetZoom = useCallback(() => {
    setScale(1);
    setPosition({ x: 0, y: 0 });
  }, []);

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close();
      if (e.key === 'ArrowLeft') goToPrevious();
      if (e.key === 'ArrowRight') goToNext();
      if (e.key === '=' || e.key === '+') zoomIn();
      if (e.key === '-' || e.key === '_') zoomOut();
      if (e.key === '0') resetZoom();
    };

    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      if (e.deltaY < 0) {
        zoomIn();
      } else {
        zoomOut();
      }
    };

    // 计算滚动条宽度并补偿，避免抖动
    const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
    document.body.style.overflow = 'hidden';
    document.body.style.paddingRight = `${scrollbarWidth}px`;

    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('wheel', handleWheel, { passive: false });

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('wheel', handleWheel);
      document.body.style.overflow = '';
      document.body.style.paddingRight = '';
    };
  }, [isOpen, close, goToPrevious, goToNext, zoomIn, zoomOut, resetZoom]);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (scale > 1) {
      setIsDragging(true);
      dragStartPos.current = {
        x: e.clientX - position.x,
        y: e.clientY - position.y,
      };
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging && scale > 1) {
      setPosition({
        x: e.clientX - dragStartPos.current.x,
        y: e.clientY - dragStartPos.current.y,
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const currentImage = images[currentIndex];

  return (
    <AnimatePresence>
      {isOpen && images.length > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-[9999] bg-black/95 backdrop-blur-sm"
          onClick={close}
        >
          <div className="absolute inset-0 flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className="relative max-w-7xl max-h-full w-full h-full flex items-center justify-center"
              onClick={(e) => e.stopPropagation()}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
              style={{
                cursor: scale > 1 ? (isDragging ? 'grabbing' : 'grab') : 'default',
              }}
            >
              {images.length === 1 ? (
                <img
                  src={currentImage.src}
                  alt={currentImage.alt}
                  className="max-w-full max-h-full object-contain select-none"
                  style={{
                    transform: `scale(${scale}) translate(${position.x / scale}px, ${position.y / scale}px)`,
                    transition: isDragging ? 'none' : 'transform 0.2s ease-out',
                  }}
                  draggable={false}
                />
              ) : (
                Array.from(new Set([
                  currentIndex > 0 ? currentIndex - 1 : images.length - 1,
                  currentIndex,
                  currentIndex < images.length - 1 ? currentIndex + 1 : 0
                ])).map((idx) => (
                  <img
                    key={idx}
                    src={images[idx].src}
                    alt={images[idx].alt}
                    className="absolute inset-0 max-w-full max-h-full object-contain select-none m-auto"
                    style={{
                      opacity: idx === currentIndex ? 1 : 0,
                      transform: `scale(${scale}) translate(${position.x / scale}px, ${position.y / scale}px)`,
                      transition: isDragging ? 'none' : 'transform 0.2s ease-out, opacity 0.3s ease-in-out',
                      pointerEvents: idx === currentIndex ? 'auto' : 'none',
                    }}
                    draggable={false}
                  />
                ))
              )}
            </motion.div>
          </div>

          <button
            onClick={close}
            className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white backdrop-blur-sm transition-all"
            aria-label="关闭"
          >
            <X className="w-6 h-6" />
          </button>

          {images.length > 1 && (
            <>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  goToPrevious();
                }}
                className="absolute left-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-white/10 hover:bg-white/20 text-white backdrop-blur-sm transition-all"
                aria-label="上一张"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  goToNext();
                }}
                className="absolute right-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-white/10 hover:bg-white/20 text-white backdrop-blur-sm transition-all"
                aria-label="下一张"
              >
                <ChevronRight className="w-6 h-6" />
              </button>

              <div className="absolute bottom-8 left-1/2 -translate-x-1/2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm text-white text-sm">
                {currentIndex + 1} / {images.length}
              </div>
            </>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}

