import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { ArrowRight } from 'lucide-react';
import type { PortfolioItem } from '../../lib/layout';
import { SectionHeader } from './SectionHeader';
import { cn } from '../../lib/utils';
import { staggerContainer, staggerItem } from '../../lib/motion';

interface PortfolioShowcaseProps {
  className?: string;
  limit?: number;
  /** Minimal header — for homepage embedding */
  compact?: boolean;
}

export function PortfolioShowcase({ className, limit, compact }: PortfolioShowcaseProps) {
  const [portfolios, setPortfolios] = useState<PortfolioItem[]>([]);

  useEffect(() => {
    fetch('/api/portfolios')
      .then((r) => r.json())
      .then((data) => setPortfolios(Array.isArray(data) ? data : []))
      .catch(() => setPortfolios([]));
  }, []);

  const items = limit ? portfolios.slice(0, limit) : portfolios;
  if (items.length === 0) return null;

  return (
    <section className={cn('w-full', compact ? 'py-12' : 'py-16 md:py-20', className)}>
      <div className={cn(compact ? 'w-full mx-auto px-3 sm:px-5' : 'w-full mx-auto px-3 sm:px-4 md:px-5 lg:px-6 xl:px-8 2xl:px-10')}>
        {compact ? (
          <div className="flex items-end justify-between gap-4 mb-6">
            <h2 className="text-xl md:text-3xl font-black uppercase tracking-tighter">Collections</h2>
            <Link to="/projects" className="text-[10px] uppercase tracking-widest text-accent flex items-center gap-1">
              All <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
        ) : (
          <SectionHeader
            eyebrow="Collections"
            title="Portfolios"
            description="Browse work by collection."
            action={
              <Link
                to="/projects"
                className="text-[10px] font-semibold uppercase tracking-[0.2em] text-muted hover:text-accent flex items-center gap-2"
              >
                All projects <ArrowRight className="w-4 h-4" />
              </Link>
            }
          />
        )}

        <motion.div
          variants={staggerContainer}
          initial="initial"
          whileInView="animate"
          viewport={{ once: true }}
          className="grid grid-cols-2 md:grid-cols-4 gap-1"
        >
          {items.map((pf) => (
            <motion.div key={pf.id} variants={staggerItem}>
              <Link
                to={`/projects?portfolio=${pf.slug}`}
                className="group block relative aspect-[4/5] overflow-hidden border border-border bg-surface"
              >
                {pf.coverImage ? (
                  <img
                    src={pf.coverImage}
                    alt={pf.title}
                    className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                    loading="lazy"
                  />
                ) : (
                  <div className="absolute inset-0 img-placeholder" />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-bg via-bg/40 to-transparent" />
                <div className="absolute inset-x-0 bottom-0 p-5">
                  <p className="text-[10px] uppercase tracking-[0.25em] text-accent font-semibold mb-1">Portfolio</p>
                  <h3 className="text-lg font-bold uppercase tracking-tight text-foreground">{pf.title}</h3>
                </div>
              </Link>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

export default PortfolioShowcase;
