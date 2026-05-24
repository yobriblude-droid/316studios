import React from 'react';
import { cn } from '../../lib/utils';

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'outline';
type ButtonSize = 'sm' | 'md' | 'lg' | 'icon';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
}

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    'bg-primary text-[var(--primary-foreground)] border border-primary hover:bg-primary-hover font-semibold rounded-lg shadow-sm',
  secondary:
    'glass-panel-v2 text-foreground border border-glass-border hover:border-secondary hover:text-secondary font-medium rounded-lg',
  ghost: 'bg-transparent text-foreground hover:bg-primary-dim hover:text-primary border border-transparent rounded-lg',
  outline:
    'bg-transparent text-foreground border border-primary/40 hover:bg-primary-dim hover:border-primary font-medium rounded-lg',
};

const sizeClasses: Record<ButtonSize, string> = {
  sm: 'px-3 py-1.5 text-[10px] tracking-widest uppercase',
  md: 'px-6 py-2.5 text-xs tracking-widest uppercase',
  lg: 'px-8 py-3.5 text-xs tracking-widest uppercase',
  icon: 'p-2.5',
};

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', type = 'button', children, ...props }, ref) => (
    <button
      ref={ref}
      type={type}
      className={cn(
        'inline-flex items-center justify-center gap-2 transition-colors duration-200 disabled:opacity-50 disabled:pointer-events-none sharp-focus',
        variantClasses[variant],
        sizeClasses[size],
        className
      )}
      {...props}
    >
      {children}
    </button>
  )
);
Button.displayName = 'Button';

export default Button;
