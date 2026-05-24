import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { Calendar, Sparkles, Check } from 'lucide-react';
import { cn } from '../../lib/utils';
import { staggerContainer, staggerItem } from '../../lib/motion';
import { HighlightedButton } from './HighlightedButton';

export type ServicePackage = {
  id: string;
  title: string;
  price: string;
  description: string;
};

type ServicePackageGridProps = {
  services: ServicePackage[];
};

function descriptionLines(description: string) {
  return description.split('\n').map((l) => l.trim()).filter(Boolean);
}

export function ServicePackageGrid({ services }: ServicePackageGridProps) {
  if (services.length === 0) {
    return (
      <p className="text-center text-muted text-sm py-20">Loading services…</p>
    );
  }

  return (
    <motion.div
      variants={staggerContainer}
      initial="initial"
      whileInView="animate"
      viewport={{ once: true }}
      className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4 lg:gap-5"
    >
      {services.map((service, i) => {
        const lines = descriptionLines(service.description);
        const featured = i === 1;
        return (
          <motion.article
            key={service.id}
            variants={staggerItem}
            className={cn(
              'relative flex flex-col rounded-2xl overflow-hidden',
              'glass-panel-v2 border border-glass-border',
              'transition-all duration-300 hover:shadow-[var(--glow-brand)]',
              featured && 'xl:-mt-2 ring-2 ring-primary/40 shadow-xl'
            )}
          >
            <div
              className={cn(
                'h-2 w-full',
                featured
                  ? 'bg-gradient-to-r from-primary via-primary-hover to-accent-cta'
                  : 'bg-gradient-to-r from-primary/90 to-primary-hover/70'
              )}
            />
            <div className="p-7 md:p-8 flex flex-col flex-1 min-h-[360px]">
              <div className="flex items-center gap-2 text-primary mb-3">
                <Sparkles className="w-4 h-4" />
                <span className="text-[10px] uppercase tracking-[0.28em] font-bold">
                  Package {String(i + 1).padStart(2, '0')}
                </span>
              </div>
              <h2 className="text-xl md:text-2xl font-black uppercase tracking-tight text-foreground leading-tight">
                {service.title}
              </h2>
              <ul className="mt-5 space-y-2.5 flex-1">
                {lines.map((line) => (
                  <li key={line} className="flex items-start gap-2.5 text-sm text-muted leading-snug">
                    <Check className="w-4 h-4 text-accent shrink-0 mt-0.5" aria-hidden />
                    <span>{line}</span>
                  </li>
                ))}
              </ul>
              <div className="mt-8 pt-6 border-t border-glass-border">
                <p className="text-2xl md:text-3xl font-bold tabular-nums text-secondary">{service.price}</p>
                <div className="mt-5 flex flex-wrap gap-3">
                  <Link to="/bookings">
                    <HighlightedButton variant="cta-primary" size="md" className="gap-2">
                      <Calendar className="w-4 h-4" />
                      Book now
                    </HighlightedButton>
                  </Link>
                  <Link to="/contact">
                    <HighlightedButton variant="ghost-glass" size="md">
                      Ask a question
                    </HighlightedButton>
                  </Link>
                </div>
              </div>
            </div>
            {featured && (
              <span className="absolute top-4 right-4 text-[9px] uppercase tracking-widest font-bold px-2 py-1 rounded-full bg-accent-cta text-white">
                Popular
              </span>
            )}
          </motion.article>
        );
      })}
    </motion.div>
  );
}

export default ServicePackageGrid;
