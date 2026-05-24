import React from 'react';
import { cn } from '../../lib/utils';

type CardElevation = 'flat' | 'raised' | 'glass';

export type CardProps = React.HTMLAttributes<HTMLDivElement> & {
  elevation?: CardElevation;
};

const elevationClasses: Record<CardElevation, string> = {
  flat: 'bg-surface border border-border',
  raised: 'bg-elevated border border-border shadow-[0_8px_32px_rgba(0,0,0,0.4)]',
  glass: 'glass-panel',
};

export function Card({ className, elevation = 'flat', children, ...props }: CardProps) {
  return (
    <div className={cn('p-6', elevationClasses[elevation], className)} {...props}>
      {children}
    </div>
  );
}

export function CardHeader({ className, children, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn('mb-4', className)} {...props}>
      {children}
    </div>
  );
}

export function CardTitle({ className, children, ...props }: React.HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h3 className={cn('text-lg font-semibold tracking-tight text-foreground', className)} {...props}>
      {children}
    </h3>
  );
}

export function CardDescription({ className, children, ...props }: React.HTMLAttributes<HTMLParagraphElement>) {
  return (
    <p className={cn('text-sm text-muted', className)} {...props}>
      {children}
    </p>
  );
}

export default Card;
