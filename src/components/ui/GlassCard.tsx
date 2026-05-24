import React from 'react';
import { cn } from '../../lib/utils';

type GlassCardProps = React.HTMLAttributes<HTMLDivElement> & {
  elevated?: boolean;
  padding?: 'none' | 'sm' | 'md' | 'lg';
};

const paddingMap = {
  none: '',
  sm: 'p-3',
  md: 'p-4',
  lg: 'p-6',
};

export function GlassCard({
  className,
  elevated,
  padding = 'md',
  children,
  ...props
}: GlassCardProps) {
  return (
    <div
      className={cn(
        elevated ? 'glass-panel-v2-elevated' : 'glass-panel-v2',
        'rounded-md',
        paddingMap[padding],
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export default GlassCard;
