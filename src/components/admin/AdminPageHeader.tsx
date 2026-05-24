import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../ui/Button';

type AdminPageHeaderProps = {
  title: string;
  description?: string;
  action?: React.ReactNode;
  backTo?: { label: string; href: string };
};

export function AdminPageHeader({ title, description, action, backTo }: AdminPageHeaderProps) {
  return (
    <div className="mb-8 md:mb-10">
      {backTo && (
        <Link
          to={backTo.href}
          className="inline-block text-[10px] uppercase tracking-widest text-muted hover:text-accent mb-4 transition-colors"
        >
          ← {backTo.label}
        </Link>
      )}
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-4xl font-black uppercase tracking-tighter text-foreground">
            {title}
          </h1>
          {description && <p className="mt-2 text-sm text-muted max-w-2xl">{description}</p>}
        </div>
        {action}
      </div>
    </div>
  );
}

export function AdminErrorBanner({ message }: { message: string }) {
  if (!message) return null;
  return (
    <div className="mb-6 p-4 border border-red-500/40 bg-red-950/30 text-red-300 text-xs uppercase tracking-wider">
      {message}
    </div>
  );
}

export function AdminDeleteModal({
  open,
  title,
  message,
  onCancel,
  onConfirm,
}: {
  open: boolean;
  title: string;
  message: string;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/70">
      <div className="w-full max-w-md glass-panel border-gold p-6">
        <h2 className="text-xl font-semibold text-foreground mb-2">{title}</h2>
        <p className="text-sm text-muted mb-6">{message}</p>
        <div className="flex justify-end gap-3">
          <Button variant="secondary" size="sm" onClick={onCancel}>
            Cancel
          </Button>
          <Button variant="primary" size="sm" className="!bg-red-700 !border-red-600 hover:!bg-red-600" onClick={onConfirm}>
            Delete
          </Button>
        </div>
      </div>
    </div>
  );
}
