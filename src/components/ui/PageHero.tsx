import React from 'react';
import { motion } from 'motion/react';
import { variants } from '../../lib/motion';
import { cn } from '../../lib/utils';

interface PageHeroProps {
  eyebrow?: string;
  title: string;
  description?: string;
  image?: string;
  compact?: boolean;
  /** Minimal vertical gap before page content (services, etc.) */
  tight?: boolean;
  children?: React.ReactNode;
}

/** Interior page hero — edge-to-edge with optional background image */
export function PageHero({ eyebrow, title, description, image, compact, tight, children }: PageHeroProps) {
  return (
    <header
      className={cn(
        'relative w-full overflow-hidden border-b border-border',
        tight ? 'min-h-0 pt-24 pb-6 md:pb-8' : compact ? 'min-h-[32vh] pt-28' : 'min-h-[50vh] md:min-h-[55vh] pt-28',
        'flex items-end'
      )}
    >
      {image && (
        <>
          <img src={image} alt="" className="media-hero-image absolute inset-0 h-full w-full object-cover opacity-40" />
          <div className="media-hero-scrim absolute inset-0 bg-gradient-to-t from-bg via-bg/70 to-bg/30" />
        </>
      )}
      {!image && (
        <div
          className="absolute inset-0 opacity-30"
          style={{
            background:
              'radial-gradient(ellipse 70% 60% at 0% 100%, rgba(212,175,55,0.12), transparent), radial-gradient(ellipse 50% 40% at 100% 0%, rgba(212,175,55,0.06), transparent)',
          }}
        />
      )}
      <motion.div
        variants={variants.slideUp}
        initial="initial"
        animate="animate"
        className={cn(
          'relative z-10 w-full mx-auto px-3 sm:px-4 md:px-5 lg:px-6 xl:px-8 2xl:px-10',
          tight ? 'pb-0' : 'pb-12 md:pb-16'
        )}
      >
        {eyebrow && (
          <span className={cn('text-[10px] font-semibold tracking-[0.35em] uppercase text-accent block', tight ? 'mb-2' : 'mb-4')}>
            {eyebrow}
          </span>
        )}
        <h1 className={cn('font-black uppercase tracking-tighter text-foreground leading-[0.92] max-w-4xl', tight ? 'text-3xl md:text-5xl' : 'text-4xl md:text-6xl lg:text-7xl')}>
          {title}
        </h1>
        {description && <p className={cn('text-sm md:text-base text-muted max-w-2xl', tight ? 'mt-3' : 'mt-6')}>{description}</p>}
        {children}
      </motion.div>
    </header>
  );
}

export default PageHero;
