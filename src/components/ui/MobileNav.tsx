import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  FolderOpen,
  LayoutDashboard,
  MessageCircle,
  CreditCard,
  User,
  ClipboardList,
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { useAuth } from '../../contexts/AuthContext';

const CLIENT_TABS = [
  { to: '/dashboard', label: 'Overview', icon: LayoutDashboard, end: true },
  { to: '/dashboard/library', label: 'Library', icon: FolderOpen },
  { to: '/dashboard/requests', label: 'Requests', icon: ClipboardList },
  { to: '/dashboard/messages', label: 'Messages', icon: MessageCircle },
  { to: '/dashboard/billing', label: 'Billing', icon: CreditCard },
  { to: '/dashboard/account', label: 'Account', icon: User },
] as const;

function mobileTabClass({ isActive }: { isActive: boolean }) {
  return cn(
    'flex flex-col items-center justify-center gap-0.5 flex-1 min-w-[4.5rem] py-2 text-[8px] sm:text-[9px] uppercase tracking-wider font-medium transition-colors min-h-[56px]',
    isActive ? 'text-accent-cta' : 'text-muted'
  );
}

function isClientWorkspacePath(pathname: string) {
  return (
    pathname === '/dashboard' ||
    pathname.startsWith('/dashboard/') ||
    pathname === '/checkout'
  );
}

export function MobileBottomNav() {
  const location = useLocation();
  const { user } = useAuth();

  if (!user || !isClientWorkspacePath(location.pathname)) {
    return null;
  }

  return (
    <nav
      className="md:hidden fixed bottom-0 left-0 right-0 z-50 glass-panel-v2 border-t border-glass-border safe-area-pb"
      aria-label="Mobile workspace navigation"
    >
      <div className="flex items-stretch w-full max-w-none px-1 overflow-x-auto scrollbar-hide">
        {CLIENT_TABS.map(({ to, label, icon: Icon, end }) => (
          <NavLink key={to} to={to} end={end} className={mobileTabClass}>
            <Icon className="w-5 h-5 shrink-0" aria-hidden />
            <span className="truncate max-w-[4.5rem]">{label}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  );
}

export default MobileBottomNav;
