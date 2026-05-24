export const ADMIN_TABLE_PAGE_SIZES = [10, 20, 50] as const;

export function formatAdminDate(iso: string | null | undefined): string {
  if (!iso) return '—';
  try {
    return new Date(iso).toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  } catch {
    return iso;
  }
}

export function statusBadgeClass(status: string): string {
  const s = status.toLowerCase();
  if (s === 'paid' || s === 'fulfilled' || s === 'approved') return 'text-emerald-400 border-emerald-500/40';
  if (s === 'pending' || s === 'open') return 'text-amber-400 border-amber-500/40';
  if (s === 'rejected' || s === 'cancelled') return 'text-red-400 border-red-500/40';
  if (s === 'in_progress') return 'text-accent border-border-gold';
  return 'text-muted border-border';
}
