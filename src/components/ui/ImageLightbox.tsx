import React, { useCallback, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion } from 'motion/react';
import { ChevronLeft, ChevronRight, X, ZoomIn, ZoomOut } from 'lucide-react';
import { attachSwipeGesture } from '../../lib/gesture-handlers';
import { variants } from '../../lib/motion';
import { cn } from '../../lib/utils';

export type LightboxSlide = {
  src: string;
  alt?: string;
};

export interface ImageLightboxProps {
  open: boolean;
  images: string[] | LightboxSlide[];
  index: number;
  onClose: () => void;
  onIndexChange: (index: number) => void;
  title?: string;
  subtitle?: string;
  footer?: React.ReactNode;
}

function normalizeImages(images: string[] | LightboxSlide[]): LightboxSlide[] {
  return images.map((img) => (typeof img === 'string' ? { src: img, alt: '' } : img));
}

export function ImageLightbox({
  open,
  images,
  index,
  onClose,
  onIndexChange,
  title,
  subtitle,
  footer,
}: ImageLightboxProps) {
  const slides = normalizeImages(images);
  const count = slides.length;
  const safeIndex = count ? Math.min(Math.max(0, index), count - 1) : 0;
  const viewportRef = useRef<HTMLDivElement>(null);
  const [zoom, setZoom] = useState(1);

  const goPrev = useCallback(() => {
    if (count <= 1) return;
    onIndexChange(safeIndex <= 0 ? count - 1 : safeIndex - 1);
    setZoom(1);
  }, [count, onIndexChange, safeIndex]);

  const goNext = useCallback(() => {
    if (count <= 1) return;
    onIndexChange(safeIndex >= count - 1 ? 0 : safeIndex + 1);
    setZoom(1);
  }, [count, onIndexChange, safeIndex]);

  useEffect(() => {
    if (!open) return;
    setZoom(1);
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft') goPrev();
      if (e.key === 'ArrowRight') goNext();
    };
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [open, onClose, goPrev, goNext]);

  useEffect(() => {
    const el = viewportRef.current;
    if (!open || !el || count <= 1) return;
    return attachSwipeGesture(el, {
      onSwipeLeft: goNext,
      onSwipeRight: goPrev,
      threshold: 40,
    });
  }, [open, count, goNext, goPrev]);

  if (!open || count === 0) return null;

  const current = slides[safeIndex];

  return createPortal(
    <AnimatePresence>
      {open && (
        <motion.div
          role="dialog"
          aria-modal="true"
          aria-label={title ? `Image viewer: ${title}` : 'Image viewer'}
          className="fixed inset-0 z-[120] flex flex-col bg-bg/98 backdrop-blur-md"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          <header className="shrink-0 flex items-center justify-between gap-4 px-3 sm:px-5 lg:px-8 py-3 border-b border-border">
            <div className="min-w-0">
              {subtitle && (
                <p className="text-[10px] uppercase tracking-widest text-accent font-semibold truncate">{subtitle}</p>
              )}
              {title && (
                <h2 className="text-lg sm:text-xl font-black uppercase tracking-tighter truncate">{title}</h2>
              )}
              <p className="text-[10px] text-muted mt-0.5 tabular-nums">
                {safeIndex + 1} / {count}
              </p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={() => setZoom((z) => Math.max(1, z - 0.5))}
                className="p-2.5 min-h-[44px] min-w-[44px] border border-border hover:border-accent transition-colors"
                aria-label="Zoom out"
                disabled={zoom <= 1}
              >
                <ZoomOut className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => setZoom((z) => Math.min(3, z + 0.5))}
                className="p-2.5 min-h-[44px] min-w-[44px] border border-border hover:border-accent transition-colors"
                aria-label="Zoom in"
                disabled={zoom >= 3}
              >
                <ZoomIn className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={onClose}
                className="p-2.5 min-h-[44px] min-w-[44px] border border-border hover:border-accent transition-colors"
                aria-label="Close viewer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </header>

          <div ref={viewportRef} className="relative flex-1 min-h-0 flex items-center justify-center overflow-hidden">
            {count > 1 && (
              <button
                type="button"
                onClick={goPrev}
                className="absolute left-2 sm:left-4 z-20 p-3 min-h-[48px] min-w-[48px] bg-bg/80 border border-border hover:border-accent backdrop-blur-sm transition-colors"
                aria-label="Previous image"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
            )}

            <AnimatePresence mode="wait" initial={false}>
              <motion.img
                key={`${safeIndex}-${current.src}`}
                src={current.src}
                alt={current.alt || title || ''}
                variants={variants.fadeIn}
                initial="initial"
                animate="animate"
                exit="exit"
                className="max-h-full max-w-full object-contain select-none touch-none"
                style={{
                  transform: `scale(${zoom})`,
                  transition: 'transform 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
                }}
                draggable={false}
                onDoubleClick={() => setZoom((z) => (z > 1 ? 1 : 2))}
              />
            </AnimatePresence>

            {count > 1 && (
              <button
                type="button"
                onClick={goNext}
                className="absolute right-2 sm:right-4 z-20 p-3 min-h-[48px] min-w-[48px] bg-bg/80 border border-border hover:border-accent backdrop-blur-sm transition-colors"
                aria-label="Next image"
              >
                <ChevronRight className="w-6 h-6" />
              </button>
            )}

            <button
              type="button"
              className="absolute inset-0 -z-10"
              aria-label="Close viewer"
              onClick={onClose}
            />
          </div>

          {count > 1 && (
            <div
              className="shrink-0 border-t border-border px-3 sm:px-5 lg:px-8 py-3 overflow-x-auto"
              role="tablist"
              aria-label="Image thumbnails"
            >
              <div className="flex gap-2 justify-start min-w-min">
                {slides.map((slide, i) => (
                  <button
                    key={`${slide.src}-${i}`}
                    type="button"
                    role="tab"
                    aria-selected={i === safeIndex}
                    aria-label={`View image ${i + 1}`}
                    onClick={() => {
                      onIndexChange(i);
                      setZoom(1);
                    }}
                    className={cn(
                      'shrink-0 w-16 h-16 sm:w-20 sm:h-20 overflow-hidden border-2 transition-all',
                      i === safeIndex ? 'border-accent opacity-100' : 'border-border opacity-60 hover:opacity-100'
                    )}
                  >
                    <img src={slide.src} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {footer && (
            <footer className="shrink-0 px-3 sm:px-5 lg:px-8 py-4 border-t border-border">{footer}</footer>
          )}
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  );
}

export default ImageLightbox;
