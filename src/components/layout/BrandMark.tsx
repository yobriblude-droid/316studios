import React from 'react';
import { Link } from 'react-router-dom';
import { cn } from '../../lib/utils';

interface BrandMarkProps {
  className?: string;
  linkTo?: string;
}

export function BrandMark({ className, linkTo = '/' }: BrandMarkProps) {
  const content = (
    <div className={cn('flex items-center gap-3', className)}>
      <div className="w-10 h-5 bg-elevated flex items-center px-1 border border-gold">
        <div className="w-3 h-3 bg-accent" />
      </div>
      <span className="text-xl font-bold tracking-[0.2em] uppercase text-foreground whitespace-nowrap">
        316 <span className="font-medium text-muted">Studios</span>
      </span>
    </div>
  );

  if (linkTo) {
    return (
      <Link to={linkTo} className="hover:opacity-90 transition-opacity">
        {content}
      </Link>
    );
  }

  return content;
}

export default BrandMark;
