import React from 'react';
import { Navigate } from 'react-router-dom';
import {
  LayoutDashboard,
  FolderOpen,
  ClipboardList,
  MessageSquare,
  CreditCard,
  User,
  LogOut,
} from 'lucide-react';
import { SaasShell } from '../../components/layout/SaasShell';
import { useAuth } from '../../contexts/AuthContext';
import { useNotifications } from '../../contexts/NotificationContext';

const CLIENT_NAV = [
  { to: '/dashboard', label: 'Overview', icon: LayoutDashboard, end: true },
  { to: '/dashboard/library', label: 'Library', icon: FolderOpen },
  { to: '/dashboard/requests', label: 'Requests', icon: ClipboardList },
  { to: '/dashboard/messages', label: 'Messages', icon: MessageSquare },
  { to: '/dashboard/billing', label: 'Billing', icon: CreditCard },
  { to: '/dashboard/account', label: 'Account', icon: User },
];

export default function ClientWorkspaceLayout() {
  const { user, loading, logout } = useAuth();
  const { unreadCount } = useNotifications();

  if (loading) {
    return (
      <div className="min-h-screen pt-16 flex items-center justify-center text-muted text-xs uppercase tracking-widest">
        Loading portal…
      </div>
    );
  }

  if (!user) return <Navigate to="/login" replace />;

  const navWithBadges = CLIENT_NAV.map((item) =>
    item.to === '/dashboard/messages' ? { ...item, badge: unreadCount } : item
  );

  return (
    <SaasShell
      productName="316 Client Portal"
      userLabel={user.name}
      userMeta={user.email}
      avatarUrl={user.avatarUrl}
      navItems={navWithBadges}
      footer={
        <button
          type="button"
          onClick={() => logout()}
          className="flex items-center gap-2 w-full px-4 py-3 text-xs uppercase tracking-wider text-muted hover:text-primary transition-colors"
        >
          <LogOut className="w-4 h-4" />
          Sign out
        </button>
      }
    />
  );
}
