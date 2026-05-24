import React, { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { ChevronLeft, ChevronRight, Quote } from 'lucide-react';
import type { Testimonial } from '../../lib/layout';
import { variants } from '../../lib/motion';
import { SectionHeader } from './SectionHeader';
import { cn } from '../../lib/utils';

export function Testimonials() {
  const [items, setItems] = useState<Testimonial[]>([]);
  const [index, setIndex] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/testimonials')
      .then((r) => r.json())
      .then((data) => setItems(Array.isArray(data) ? data : []))
      .catch(() => setItems([]))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <section className="w-full py-16 px-4">
        <div className="max-w-7xl mx-auto text-[10px] uppercase tracking-widest text-muted text-center">
          Loading testimonials…
        </div>
      </section>
    );
  }

  if (items.length === 0) return null;

  const t = items[index];

  const prev = () => setIndex((i) => (i === 0 ? items.length - 1 : i - 1));
  const next = () => setIndex((i) => (i + 1) % items.length);

  return (
    <section className="w-full py-16 md:py-24">
      <div className="max-w-7xl mx-auto">
        <SectionHeader
          eyebrow="Client Voices"
          title="Trusted in Nairobi"
          description="Stories from couples, brands, and families who chose 316 Studios."
          align="center"
        />

        <div className="relative max-w-4xl mx-auto glass-panel border-gold p-8 md:p-14 min-h-[280px] flex flex-col justify-center">
          <Quote className="absolute top-6 left-6 w-8 h-8 text-accent/30" />

          <AnimatePresence mode="wait">
            <motion.blockquote
              key={t.id}
              variants={variants.fadeIn}
              initial="initial"
              animate="animate"
              exit="exit"
              className="text-center"
            >
              <p className="text-lg md:text-2xl font-medium text-foreground leading-relaxed tracking-tight mb-8">
                "{t.quote}"
              </p>
              <footer>
                <cite className="not-italic text-sm font-semibold uppercase tracking-widest text-accent">
                  {t.author}
                </cite>
                <p className="text-xs text-muted mt-2 uppercase tracking-wider">{t.role}</p>
                <div className="flex justify-center gap-1 mt-4" aria-hidden>
                  {Array.from({ length: t.rating }).map((_, i) => (
                    <span key={i} className="w-1.5 h-1.5 rounded-full bg-accent" />
                  ))}
                </div>
              </footer>
            </motion.blockquote>
          </AnimatePresence>

          <div className="flex justify-center gap-3 mt-8">
            <button
              type="button"
              onClick={prev}
              className="p-2 border border-border hover:border-accent hover:text-accent transition-colors"
              aria-label="Previous testimonial"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <div className="flex items-center gap-2">
              {items.map((_, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setIndex(i)}
                  aria-label={`Testimonial ${i + 1}`}
                  className={cn(
                    'h-1 transition-all',
                    i === index ? 'w-6 bg-accent' : 'w-2 bg-foreground/20 hover:bg-accent/40'
                  )}
                />
              ))}
            </div>
            <button
              type="button"
              onClick={next}
              className="p-2 border border-border hover:border-accent hover:text-accent transition-colors"
              aria-label="Next testimonial"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

export default Testimonials;
