import React from 'react';
import { cn } from '../../lib/utils';

type AdminFormCardProps = {
  children: React.ReactNode;
  className?: string;
  onSubmit?: (e: React.FormEvent) => void;
};

export function AdminFormCard({ children, className, onSubmit }: AdminFormCardProps) {
  const Tag = onSubmit ? 'form' : 'div';
  return (
    <Tag
      onSubmit={onSubmit}
      className={cn('border border-border bg-surface p-6 md:p-8 space-y-6 max-w-3xl', className)}
    >
      {children}
    </Tag>
  );
}

export function AdminField({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-2">
      <label className="text-[10px] uppercase tracking-[0.2em] text-muted font-semibold">{label}</label>
      {children}
    </div>
  );
}

export const adminInputClass =
  'w-full bg-elevated border border-border px-4 py-3 text-sm text-foreground placeholder:text-muted focus:outline-none focus:border-accent transition-colors';
