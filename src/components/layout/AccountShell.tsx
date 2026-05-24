import React from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { cn } from '../../lib/utils';

export type AccountNavItem = {
  to: string;
  label: string;
  end?: boolean;
};

type AccountShellProps = {
  title: string;
  subtitle?: string;
  navItems: AccountNavItem[];
  headerExtra?: React.ReactNode;
};

export function AccountShell({ title, subtitle, navItems, headerExtra }: AccountShellProps) {
  return (
    <div className="min-h-[calc(100vh-4rem)] bg-bg">
      <div className="max-w-[1920px] mx-auto px-3 sm:px-5 py-8 md:py-12">
        <header className="mb-8 border-b border-glass-border pb-6">
          <p className="text-[10px] uppercase tracking-[0.35em] text-accent mb-2">{subtitle}</p>
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
            <h1 className="text-3xl md:text-4xl font-black uppercase tracking-tighter text-foreground">
              {title}
            </h1>
            {headerExtra}
          </div>
        </header>

        <div className="flex flex-col lg:flex-row gap-8">
          <aside className="lg:w-56 shrink-0">
            <nav className="flex lg:flex-col gap-1 overflow-x-auto lg:overflow-visible pb-2 lg:pb-0">
              {navItems.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.end}
                  className={({ isActive }) =>
                    cn(
                      'px-4 py-3 text-xs font-semibold uppercase tracking-wider whitespace-nowrap rounded-xl transition-all min-h-[44px] flex items-center',
                      isActive
                        ? 'bg-primary text-primary-foreground shadow-[var(--glow-brand)]'
                        : 'glass-panel-v2 text-muted hover:text-foreground hover:border-primary/40'
                    )
                  }
                >
                  {item.label}
                </NavLink>
              ))}
            </nav>
          </aside>
          <main className="flex-1 min-w-0">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
}
