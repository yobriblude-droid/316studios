import React from 'react';
import { NavLink, Outlet, useLocation } from 'react-router-dom';
import type { LucideIcon } from 'lucide-react';
import { cn } from '../../lib/utils';
import { layout } from '../../lib/layout';

export type SaasNavItem = {
  to: string;
  label: string;
  icon: LucideIcon;
  end?: boolean;
  badge?: number;
};

type SaasShellProps = {
  productName: string;
  userLabel: string;
  userMeta?: string;
  avatarUrl?: string | null;
  navItems: SaasNavItem[];
  footer?: React.ReactNode;
};

export function SaasShell({
  productName,
  userLabel,
  userMeta,
  avatarUrl,
  navItems,
  footer,
}: SaasShellProps) {
  const initials = userLabel
    .split(/\s+/)
    .map((w) => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
  const location = useLocation();

  return (
    <div className={cn('min-h-screen saas-mesh', layout.belowNav)}>
      <div className="flex min-h-[calc(100vh-4rem)]">
        <aside
          className={cn(
            'hidden lg:flex w-64 shrink-0 flex-col border-r border-glass-border bg-surface/80 backdrop-blur-xl',
            'lg:sticky lg:self-start lg:max-h-[calc(100vh-4rem)] lg:overflow-y-auto',
            layout.stickyBelowNav
          )}
        >
          <div className="p-6 border-b border-glass-border flex gap-3 items-center">
            <div className="w-10 h-10 shrink-0 overflow-hidden border border-border-gold bg-elevated flex items-center justify-center text-xs font-bold text-accent">
              {avatarUrl ? <img src={avatarUrl} alt="" className="w-full h-full object-cover" /> : initials}
            </div>
            <div className="min-w-0">
              <p className="text-[10px] uppercase tracking-[0.35em] text-primary font-bold">{productName}</p>
              <p className="mt-1 text-sm font-semibold text-foreground truncate">{userLabel}</p>
              {userMeta && <p className="text-[10px] text-muted truncate">{userMeta}</p>}
            </div>
          </div>
          <nav className="flex-1 p-3 space-y-1">
            {navItems.map(({ to, label, icon: Icon, end, badge }) => (
              <NavLink
                key={to}
                to={to}
                end={end}
                className={({ isActive }) =>
                  cn(
                    'flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-semibold uppercase tracking-wider transition-all min-h-[44px]',
                    isActive
                      ? 'bg-primary text-primary-foreground shadow-[var(--glow-brand)]'
                      : 'text-muted hover:text-foreground hover:bg-primary-dim'
                  )
                }
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span className="flex-1">{label}</span>
                {badge != null && badge > 0 && (
                  <span className="min-w-[20px] h-5 px-1.5 rounded-full bg-primary text-[10px] text-white flex items-center justify-center">
                    {badge}
                  </span>
                )}
              </NavLink>
            ))}
          </nav>
          {footer && <div className="p-4 border-t border-glass-border">{footer}</div>}
        </aside>

        <div className="flex-1 flex flex-col min-w-0">
          <header
            className={cn(
              'sticky z-30 border-b border-glass-border bg-bg/80 backdrop-blur-md px-4 sm:px-6 lg:px-8 py-4',
              layout.stickyBelowNav
            )}
          >
            <div className="flex items-center justify-between gap-4">
              <div className="lg:hidden">
                <p className="text-[10px] uppercase tracking-widest text-primary font-bold">{productName}</p>
                <p className="text-sm font-semibold truncate">{userLabel}</p>
              </div>
              <p className="hidden lg:block text-[10px] uppercase tracking-widest text-muted truncate max-w-md">
                {location.pathname}
              </p>
            </div>
            <nav className="flex lg:hidden gap-1 mt-3 overflow-x-auto scrollbar-hide pb-1">
              {navItems.map(({ to, label, end }) => (
                <NavLink
                  key={to}
                  to={to}
                  end={end}
                  className={({ isActive }) =>
                    cn(
                      'px-3 py-2 text-[10px] uppercase tracking-wider whitespace-nowrap rounded-lg',
                      isActive ? 'bg-primary text-primary-foreground' : 'text-muted'
                    )
                  }
                >
                  {label}
                </NavLink>
              ))}
            </nav>
          </header>

          <main className="flex-1 p-3 sm:p-5 lg:p-6 xl:p-8 w-full mx-auto pb-20 md:pb-8">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
}
