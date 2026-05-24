import React, { useContext, useEffect } from 'react';
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import {
  CreditCard,
  FolderKanban,
  FolderOpen,
  Image,
  Layers,
  LayoutDashboard,
  LogOut,
  MessageSquare,
  Moon,
  Sun,
  Users,
  Wrench,
  BookOpen,
  Settings,
  Inbox,
  LayoutGrid,
  UserCog,
} from 'lucide-react';
import { useAdmin } from '../../contexts/AdminContext';
import { canAccessAdminSection, isFullAdmin } from '../../lib/admin-access';
import type { StaffPermission } from '../../lib/roles';
import { ThemeContext } from '../../contexts/ThemeContext';
import { BrandMark } from '../layout/BrandMark';
import { cn } from '../../lib/utils';

const NAV: Array<{
  to: string;
  label: string;
  icon: typeof LayoutDashboard;
  end?: boolean;
  perm?: StaffPermission;
  adminOnly?: boolean;
}> = [
  { to: '/admin/dashboard', label: 'Overview', icon: LayoutDashboard, end: true },
  { to: '/admin/portfolios', label: 'Portfolios', icon: Layers, perm: 'frontend' },
  { to: '/admin/projects', label: 'Projects', icon: FolderKanban, perm: 'frontend' },
  { to: '/admin/services', label: 'Services', icon: Wrench, perm: 'frontend' },
  { to: '/admin/hero-slides', label: 'Hero slides', icon: Image, perm: 'frontend' },
  { to: '/admin/page-widgets', label: 'Page widgets', icon: LayoutGrid, perm: 'frontend' },
  { to: '/admin/inbox', label: 'Inbox', icon: Inbox, perm: 'communications' },
  { to: '/admin/blog', label: 'Blog', icon: BookOpen, perm: 'blog' },
  { to: '/admin/media', label: 'Media library', icon: FolderOpen, perm: 'uploads' },
  { to: '/admin/users', label: 'Clients', icon: Users, perm: 'users' },
  { to: '/admin/media-requests', label: 'Requests', icon: MessageSquare, perm: 'requests' },
  { to: '/admin/billing', label: 'Billing', icon: CreditCard, perm: 'billing' },
  { to: '/admin/staff', label: 'Staff', icon: UserCog, adminOnly: true },
  { to: '/admin/account', label: 'Account', icon: Settings },
];

const BREADCRUMB_LABELS: Record<string, string> = {
  admin: 'Admin',
  dashboard: 'Overview',
  portfolios: 'Portfolios',
  projects: 'Projects',
  blog: 'Blog',
  services: 'Services',
  'hero-slides': 'Hero slides',
  'page-widgets': 'Page widgets',
  users: 'Users',
  'media-requests': 'Media requests',
  billing: 'Billing',
  staff: 'Staff',
  new: 'New',
  edit: 'Edit',
  media: 'Client media',
};

function sidebarLinkClass({ isActive }: { isActive: boolean }) {
  return cn(
    'flex items-center gap-3 px-4 py-2.5 text-xs uppercase tracking-widest font-medium transition-colors border-l-2',
    isActive
      ? 'border-primary text-primary bg-primary-dim'
      : 'border-transparent text-muted hover:text-foreground hover:bg-elevated/50'
  );
}

export function AdminLayout() {
  const { adminUser, logout, loading } = useAdmin();
  const { isDark, toggleTheme } = useContext(ThemeContext);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (!loading && !adminUser) {
      navigate('/admin/login', { replace: true });
    }
  }, [adminUser, loading, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-bg flex items-center justify-center">
        <p className="text-muted text-xs uppercase tracking-widest animate-pulse">Loading admin…</p>
      </div>
    );
  }

  if (!adminUser) return null;

  const segments = location.pathname.split('/').filter(Boolean);
  const crumbs = segments.map((seg, i) => ({
    label: BREADCRUMB_LABELS[seg] || seg,
    path: '/' + segments.slice(0, i + 1).join('/'),
  }));

  const handleLogout = () => {
    logout();
    navigate('/admin/login');
  };

  return (
    <div className="min-h-screen saas-mesh text-foreground flex">
      <aside className="hidden lg:flex w-64 shrink-0 flex-col border-r border-glass-border bg-surface/90 backdrop-blur-xl">
        <div className="p-6 border-b border-border">
          <BrandMark linkTo="/admin/dashboard" />
          <p className="mt-2 text-[9px] uppercase tracking-[0.3em] text-muted">Operations</p>
        </div>
        <nav className="flex-1 py-4 space-y-0.5">
          {NAV.filter((item) => {
            if (item.adminOnly && !isFullAdmin(adminUser)) return false;
            if (item.perm && !canAccessAdminSection(adminUser, item.perm) && !isFullAdmin(adminUser)) {
              if (item.to === '/admin/dashboard' || item.to === '/admin/account') return true;
              return false;
            }
            return true;
          }).map(({ to, label, icon: Icon, end }) => (
            <NavLink key={to} to={to} end={end} className={sidebarLinkClass}>
              <Icon className="w-4 h-4 shrink-0" />
              {label}
            </NavLink>
          ))}
        </nav>
        <div className="p-4 border-t border-border text-[10px] text-muted flex gap-2 items-center">
          <div className="w-8 h-8 shrink-0 overflow-hidden border border-border-gold bg-elevated flex items-center justify-center text-[10px] font-bold text-accent">
            {adminUser.avatarUrl ? (
              <img src={adminUser.avatarUrl} alt="" className="w-full h-full object-cover" />
            ) : (
              adminUser.name.slice(0, 2).toUpperCase()
            )}
          </div>
          <div className="min-w-0">
            <p className="truncate text-foreground font-medium">{adminUser.name}</p>
            <p className="truncate opacity-70">{adminUser.email}</p>
          </div>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0">
        <header className="sticky top-0 z-40 border-b border-border bg-bg/90 backdrop-blur-md">
          <div className="px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
            <div className="lg:hidden">
              <BrandMark linkTo="/admin/dashboard" />
            </div>
            <nav className="flex lg:hidden gap-1 overflow-x-auto text-[9px] uppercase tracking-wider">
              {NAV.slice(0, 4).map(({ to, label }) => (
                <NavLink
                  key={to}
                  to={to}
                  className={({ isActive }) =>
                    cn('px-2 py-1 whitespace-nowrap', isActive ? 'text-accent' : 'text-muted')
                  }
                >
                  {label}
                </NavLink>
              ))}
            </nav>
            <ol className="hidden md:flex items-center gap-2 text-[10px] uppercase tracking-widest text-muted flex-1 min-w-0">
              {crumbs.map((c, i) => (
                <li key={c.path} className="flex items-center gap-2 shrink-0">
                  {i > 0 && <span className="opacity-40">/</span>}
                  <span className={i === crumbs.length - 1 ? 'text-foreground' : ''}>{c.label}</span>
                </li>
              ))}
            </ol>
            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={toggleTheme}
                className="p-2 border border-border hover:border-accent text-muted hover:text-accent transition-colors"
                aria-label="Toggle theme"
              >
                {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
              </button>
              <button
                type="button"
                onClick={handleLogout}
                className="inline-flex items-center gap-2 px-3 py-2 border border-border text-[10px] uppercase tracking-widest hover:border-accent hover:text-accent transition-colors"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Logout</span>
              </button>
            </div>
          </div>
        </header>

        <main className="flex-1 px-3 sm:px-5 lg:px-6 xl:px-8 py-8 md:py-12 w-full mx-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default AdminLayout;
