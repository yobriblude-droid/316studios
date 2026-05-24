import React from 'react';
import { cn } from '../../lib/utils';

export type HighlightedVariant =
  | 'cta-primary'
  | 'cta-brand'
  | 'ghost-glass'
  | 'route-whatsapp'
  | 'route-phone'
  | 'route-email'
  | 'outline';

type HighlightedSize = 'sm' | 'md' | 'lg' | 'icon';

export interface HighlightedButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: HighlightedVariant;
  size?: HighlightedSize;
}

const variantClasses: Record<HighlightedVariant, string> = {
  'cta-primary':
    'bg-gradient-to-r from-primary to-accent-cta text-white border border-primary hover:from-primary-hover hover:to-accent-cta-hover shadow-[var(--glow-cta)] font-semibold',
  'cta-brand':
    'bg-primary text-[var(--primary-foreground)] border border-primary hover:bg-primary-hover shadow-[var(--glow-brand)] font-semibold',
  'ghost-glass':
    'bg-transparent text-foreground border border-glass-border hover:bg-accent-dim backdrop-blur-sm',
  'route-whatsapp':
    'bg-[#25D366]/15 text-[#25D366] border border-[#25D366]/40 hover:bg-[#25D366]/25 font-medium',
  'route-phone':
    'bg-accent-link/10 text-accent-link border border-accent-link/35 hover:bg-accent-link/20 font-medium',
  'route-email':
    'bg-primary/10 text-primary border border-primary/35 hover:bg-primary/20 font-medium',
  outline:
    'bg-transparent text-foreground border border-border-gold hover:bg-accent-dim font-medium',
};

const sizeClasses: Record<HighlightedSize, string> = {
  sm: 'px-3 py-1.5 text-[10px] tracking-widest uppercase',
  md: 'px-5 py-2.5 text-xs tracking-widest uppercase',
  lg: 'px-8 py-3.5 text-xs tracking-widest uppercase',
  icon: 'p-2.5',
};

export const HighlightedButton = React.forwardRef<HTMLButtonElement, HighlightedButtonProps>(
  ({ className, variant = 'cta-primary', size = 'md', type = 'button', children, ...props }, ref) => (
    <button
      ref={ref}
      type={type}
      className={cn(
        'inline-flex items-center justify-center gap-2 transition-all duration-200 disabled:opacity-50 disabled:pointer-events-none sharp-focus min-h-[44px]',
        variantClasses[variant],
        sizeClasses[size],
        size === 'icon' && 'min-h-[44px] min-w-[44px]',
        className
      )}
      {...props}
    >
      {children}
    </button>
  )
);
HighlightedButton.displayName = 'HighlightedButton';

export default HighlightedButton;
