import React from 'react';
import { cn } from '../../lib/utils';

type AuthSplitLayoutProps = {
  title: string;
  subtitle: string;
  visualTitle: string;
  visualDescription: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
};

export function AuthSplitLayout({
  title,
  subtitle,
  visualTitle,
  visualDescription,
  children,
  footer,
}: AuthSplitLayoutProps) {
  return (
    <div className="auth-page min-h-[100dvh] w-full flex flex-col lg:flex-row bg-bg text-foreground overflow-hidden">
      <div className="hidden lg:flex lg:w-1/2 lg:min-h-[100dvh] relative overflow-hidden border-r border-glass-border bg-surface saas-mesh shrink-0">
        <div
          className="absolute inset-0 opacity-[0.06]"
          style={{
            backgroundImage: 'radial-gradient(circle at center, var(--text-primary) 1px, transparent 1px)',
            backgroundSize: '20px 20px',
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-bg via-transparent to-transparent" />
        <div className="relative z-10 p-12 xl:p-20 flex flex-col justify-end">
          <p className="text-[10px] uppercase tracking-[0.35em] text-accent mb-4">{subtitle}</p>
          <h2 className="text-4xl xl:text-5xl font-black uppercase tracking-tighter text-foreground leading-[0.95]">
            {visualTitle}
          </h2>
          <p className="mt-6 text-sm text-muted leading-relaxed max-w-md">{visualDescription}</p>
        </div>
      </div>

      <div className="w-full lg:w-1/2 flex flex-1 min-h-0 lg:min-h-[100dvh] overflow-y-auto overscroll-y-contain">
        <div className="w-full max-w-md mx-auto my-auto px-4 py-8 sm:px-8 sm:py-10 safe-area-pt safe-area-pb">
          <p className="lg:hidden text-[10px] uppercase tracking-[0.35em] text-accent mb-2">{subtitle}</p>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black uppercase tracking-tighter text-foreground mb-6 sm:mb-8">
            {title}
          </h1>
          {children}
          {footer && <div className="mt-6 sm:mt-8 pt-6 sm:pt-8 border-t border-border">{footer}</div>}
        </div>
      </div>
    </div>
  );
}
