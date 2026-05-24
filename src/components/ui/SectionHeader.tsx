import React from 'react';
import { motion } from 'motion/react';
import { cn } from '../../lib/utils';
import { staggerItem } from '../../lib/motion';

interface SectionHeaderProps {
  eyebrow?: string;
  title: string;
  description?: string;
  align?: 'left' | 'center';
  className?: string;
  action?: React.ReactNode;
}

export function SectionHeader({
  eyebrow,
  title,
  description,
  align = 'left',
  className,
  action,
}: SectionHeaderProps) {
  return (
    <motion.div
      variants={staggerItem}
      className={cn(
        'flex flex-col gap-4 mb-10 md:mb-14',
        align === 'center' && 'text-center items-center',
        align === 'left' && 'md:flex-row md:items-end md:justify-between',
        className
      )}
    >
      <div className={cn(align === 'center' && 'max-w-2xl')}>
        {eyebrow && (
          <span className="text-[10px] font-semibold tracking-[0.35em] uppercase text-accent mb-3 block">
            {eyebrow}
          </span>
        )}
        <h2 className="text-3xl md:text-5xl lg:text-6xl font-black uppercase tracking-tighter text-foreground leading-[0.95]">
          {title}
        </h2>
        {description && (
          <p className={cn('mt-4 text-sm md:text-base text-muted max-w-xl', align === 'center' && 'mx-auto')}>
            {description}
          </p>
        )}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </motion.div>
  );
}

export default SectionHeader;
