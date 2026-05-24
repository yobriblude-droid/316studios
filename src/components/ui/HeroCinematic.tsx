import React, { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { Link } from 'react-router-dom';
import { ChevronDown, ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '../../lib/utils';
import { easeOutSlow } from '../../lib/motion';
import type { HeroSlide } from '../../lib/layout';
import { placeholderGradient } from '../../lib/placeholders';

interface HeroCinematicProps {
  slides: HeroSlide[];
  ctaPrimary?: { label: string; to: string };
  ctaSecondary?: { label: string; to: string };
}

const slideVariants = {
  enter: (dir: number) => ({ x: dir > 0 ? '100%' : '-100%', opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit: (dir: number) => ({ x: dir > 0 ? '-100%' : '100%', opacity: 0 }),
};

export function HeroCinematic({
  slides,
  ctaPrimary = { label: 'View work', to: '/projects' },
  ctaSecondary = { label: 'Book session', to: '/bookings' },
}: HeroCinematicProps) {
  const [index, setIndex] = useState(0);
  const [direction, setDirection] = useState(1);

  useEffect(() => {
    if (slides.length <= 1) return;
    const timer = setInterval(() => {
      setDirection(1);
      setIndex((prev) => (prev + 1) % slides.length);
    }, 5500);
    return () => clearInterval(timer);
  }, [slides.length]);

  if (slides.length === 0) return null;

  const slide = slides[index];
  const hasImage = Boolean(slide.image?.trim());

  const goTo = (i: number) => {
    setDirection(i > index ? 1 : -1);
    setIndex(i);
  };

  const step = (delta: number) => {
    const next = (index + delta + slides.length) % slides.length;
    goTo(next);
  };

  return (
    <section className="relative min-h-[100svh] w-full overflow-hidden bg-bg">
      <div
        className="pointer-events-none absolute inset-0 z-[15] opacity-60"
        style={{
          background:
            'radial-gradient(ellipse 75% 55% at 15% 90%, rgba(220,38,38,0.28) 0%, transparent 55%), radial-gradient(ellipse 55% 45% at 88% 15%, rgba(239,68,68,0.15) 0%, transparent 50%)',
        }}
      />

      <AnimatePresence mode="popLayout" custom={direction}>
        <motion.div
          key={slide.id ?? index}
          custom={direction}
          variants={slideVariants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{ ...easeOutSlow, duration: 0.65 }}
          className="absolute inset-0"
        >
          {hasImage ? (
            <motion.img
              src={slide.image}
              alt=""
              className="absolute inset-0 h-full w-full object-cover"
              animate={{ scale: [1, 1.04] }}
              transition={{ duration: 7, ease: 'linear' }}
            />
          ) : (
            <div
              className="absolute inset-0"
              style={{ background: placeholderGradient(slide.id ?? String(index)) }}
            />
          )}
          <div className="absolute inset-0 bg-bg/35 z-[10]" />
          <div className="absolute inset-0 z-[11] bg-gradient-to-t from-bg via-bg/25 to-transparent" />
          <div className="absolute inset-0 z-[12] bg-gradient-to-r from-bg/70 via-transparent to-transparent" />
        </motion.div>
      </AnimatePresence>

      <button
        type="button"
        onClick={() => step(-1)}
        className="absolute left-4 top-1/2 -translate-y-1/2 z-30 p-3 glass-panel border-glass-border text-foreground hover:border-accent transition-colors hidden md:flex"
        aria-label="Previous slide"
      >
        <ChevronLeft className="w-5 h-5" />
      </button>
      <button
        type="button"
        onClick={() => step(1)}
        className="absolute right-4 top-1/2 -translate-y-1/2 z-30 p-3 glass-panel border-glass-border text-foreground hover:border-accent transition-colors hidden md:flex"
        aria-label="Next slide"
      >
        <ChevronRight className="w-5 h-5" />
      </button>

      <div className="pointer-events-none absolute top-28 right-6 md:right-12 z-20 hidden lg:block">
        <div className="glass-panel border-gold px-4 py-3 text-[10px] uppercase tracking-[0.3em] text-accent font-semibold backdrop-blur-md">
          Nairobi · Kenya
        </div>
      </div>

      <div className="absolute inset-0 z-20 flex flex-col justify-end px-6 sm:px-8 md:px-10 lg:px-14 pb-24 md:pb-32 pt-28 max-w-[100vw]">
        <div className="max-w-5xl accent-blur-glow">
          <AnimatePresence mode="wait">
            <motion.div
              key={`copy-${index}`}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.4 }}
              className="relative z-10"
            >
              <p className="text-[10px] md:text-xs uppercase tracking-[0.45em] mb-3 text-accent font-semibold">
                {slide.subtitle}
              </p>
              <h1 className="text-4xl sm:text-6xl md:text-7xl lg:text-[5.5rem] font-black uppercase tracking-tighter text-foreground leading-[0.88] mb-6 max-w-4xl">
                {slide.title}
              </h1>
              <div className="flex flex-wrap gap-3 md:gap-4">
                <Link
                  to={ctaPrimary.to}
                  className="px-8 py-3.5 bg-gradient-to-r from-primary to-accent-cta text-[var(--primary-foreground)] text-[10px] uppercase tracking-[0.2em] font-semibold hover:from-primary-hover hover:to-accent-cta-hover transition-all shadow-[var(--glow-cta)]"
                >
                  {ctaPrimary.label}
                </Link>
                <Link
                  to={ctaSecondary.to}
                  className="px-8 py-3.5 border border-border-gold text-[10px] uppercase tracking-[0.2em] font-semibold hover:bg-accent-dim hover:border-accent transition-colors backdrop-blur-sm"
                >
                  {ctaSecondary.label}
                </Link>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        <div className="absolute bottom-8 left-6 sm:left-8 md:left-10 lg:left-12 flex items-center gap-6 z-20">
          <span className="text-[10px] uppercase tracking-widest text-muted font-medium tabular-nums">
            {String(index + 1).padStart(2, '0')} / {String(slides.length).padStart(2, '0')}
          </span>
          <div className="flex gap-1">
            {slides.map((_, i) => (
              <button
                key={i}
                type="button"
                onClick={() => goTo(i)}
                aria-label={`Slide ${i + 1}`}
                className={cn(
                  'h-1 transition-all duration-300',
                  i === index ? 'w-12 bg-accent' : 'w-6 bg-foreground/20 hover:bg-accent/50'
                )}
              />
            ))}
          </div>
        </div>
      </div>

      <motion.a
        href="#featured"
        className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center gap-1 text-muted hover:text-accent transition-colors"
        animate={{ y: [0, 6, 0] }}
        transition={{ duration: 2, repeat: Infinity }}
        aria-label="Scroll to content"
      >
        <span className="text-[9px] uppercase tracking-[0.3em]">Explore</span>
        <ChevronDown className="w-4 h-4" />
      </motion.a>
    </section>
  );
}

export default HeroCinematic;
