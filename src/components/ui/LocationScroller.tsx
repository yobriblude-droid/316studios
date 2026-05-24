import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'motion/react';
import { ChevronLeft, ChevronRight, MapPin } from 'lucide-react';
import { cn } from '../../lib/utils';
import type { SiteLocation } from '../../lib/layout';
import { SectionHeader } from './SectionHeader';

export function LocationScroller() {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [locations, setLocations] = useState<SiteLocation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/locations')
      .then((r) => r.json())
      .then((data) => setLocations(Array.isArray(data) ? data : []))
      .catch(() => setLocations([]))
      .finally(() => setLoading(false));
  }, []);

  const scroll = (dir: 'left' | 'right') => {
    const el = scrollRef.current;
    if (!el) return;
    const amount = el.clientWidth * 0.85;
    el.scrollBy({ left: dir === 'left' ? -amount : amount, behavior: 'smooth' });
  };

  if (loading) {
    return (
      <section className="w-full py-16 border-y border-border bg-surface/50">
        <div className="max-w-7xl mx-auto px-4 text-[10px] uppercase tracking-widest text-muted">Loading locations…</div>
      </section>
    );
  }

  if (locations.length === 0) return null;

  return (
    <section className="w-full py-16 md:py-24 border-y border-border bg-surface/50">
      <div className="max-w-7xl mx-auto px-6 sm:px-8 md:px-10 lg:px-12 mb-8">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6">
          <SectionHeader
            eyebrow="Nairobi · Kenya"
            title="Where We Create"
            description="Shoot locations across Nairobi — imagery from the 316 Studios archive."
            className="mb-0"
          />
          <div className="flex gap-2 shrink-0">
            <button
              type="button"
              onClick={() => scroll('left')}
              className="p-2.5 border border-border hover:border-accent hover:text-accent transition-colors"
              aria-label="Scroll locations left"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => scroll('right')}
              className="p-2.5 border border-border hover:border-accent hover:text-accent transition-colors"
              aria-label="Scroll locations right"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      <div
        ref={scrollRef}
        className="flex gap-3 overflow-x-auto snap-x snap-mandatory scrollbar-hide px-6 sm:px-8 md:px-10 lg:px-12 pb-2"
        style={{ scrollbarWidth: 'none' }}
      >
        {locations.map((loc, i) => (
          <motion.article
            key={loc.id}
            initial={{ opacity: 0, x: 24 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.05 }}
            className={cn(
              'snap-start shrink-0 w-[280px] md:w-[340px] relative overflow-hidden',
              'border border-border bg-elevated group'
            )}
          >
            <div className="aspect-[4/5] relative overflow-hidden">
              <img
                src={loc.image}
                alt={loc.name}
                className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-bg via-transparent to-transparent" />
              <div className="absolute top-4 left-4 flex items-center gap-1.5 glass-panel px-2 py-1 text-[9px] uppercase tracking-widest text-accent font-semibold">
                <MapPin className="w-3 h-3" />
                {loc.tag}
              </div>
            </div>
            <div className="p-5 border-t border-border">
              <h3 className="text-lg font-bold uppercase tracking-tight text-foreground">{loc.name}</h3>
              <p className="mt-2 text-xs text-muted leading-relaxed">{loc.description}</p>
            </div>
          </motion.article>
        ))}
      </div>
    </section>
  );
}

export default LocationScroller;
