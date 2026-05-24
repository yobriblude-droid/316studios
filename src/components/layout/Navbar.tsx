import React, { useEffect, useState, useRef } from 'react';
import { NavLink, useNavigate, useLocation, Link } from 'react-router-dom';
import { AnimatePresence, motion } from 'motion/react';
import {
  LogOut,
  Menu,
  Moon,
  Sun,
  X,
  Home,
  Info,
  Briefcase,
  Images,
  BookOpen,
  Mail,
  LayoutDashboard,
  LogIn,
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { cn } from '../../lib/utils';
import { BrandMark } from './BrandMark';
import { HighlightedButton } from '../ui/HighlightedButton';
import { NotificationBell } from '../ui/NotificationSystem';

const NAV_LINKS = [
  { to: '/', label: 'Home', icon: Home, end: true as const },
  { to: '/services', label: 'Services', icon: Briefcase },
  { to: '/projects', label: 'Projects', icon: Images },
  { to: '/blog', label: 'Blog', icon: BookOpen },
  { to: '/contact', label: 'Contact', icon: Mail },
  { to: '/about', label: 'About', icon: Info },
];

function navPillClass({ isActive }: { isActive: boolean }) {
  return cn(
    'inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold uppercase tracking-wider transition-all min-h-[44px]',
    isActive
      ? 'bg-primary text-primary-foreground shadow-[var(--glow-brand)]'
      : 'glass-panel-v2 text-muted hover:text-foreground hover:border-primary/40'
  );
}

export function Navbar() {
  const { user, logout } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [hidden, setHidden] = useState(false);
  const lastScrollY = useRef(0);
  const navigate = useNavigate();
  const location = useLocation();
  const isHome = location.pathname === '/';

  useEffect(() => setIsOpen(false), [location.pathname]);

  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY;
      setScrolled(y > 12);
      if (y > 120 && y > lastScrollY.current + 8) setHidden(true);
      else if (y < lastScrollY.current - 8 || y < 80) setHidden(false);
      lastScrollY.current = y;
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <>
      <motion.nav
        initial={false}
        animate={{ y: hidden && !isOpen ? -100 : 0 }}
        transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
        className={cn(
          'fixed top-0 left-0 right-0 z-50 w-full transition-all duration-300',
          scrolled || isOpen || !isHome
            ? 'glass-panel-v2 border-b border-glass-border shadow-lg'
            : 'bg-transparent border-b border-transparent'
        )}
      >
        <div className="w-full max-w-[1920px] mx-auto px-3 sm:px-5 h-16 flex items-center justify-between gap-4">
          <BrandMark />

          <div className="hidden lg:flex items-center gap-2 flex-1 justify-center max-w-3xl">
            {NAV_LINKS.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                end={'end' in link ? link.end : undefined}
                className={navPillClass}
              >
                <link.icon className="w-4 h-4 shrink-0" aria-hidden />
                {link.label}
              </NavLink>
            ))}
          </div>

          <div className="hidden lg:flex items-center gap-2 shrink-0">
            {user ? (
              <>
                <NavLink to="/dashboard" className={navPillClass}>
                  <LayoutDashboard className="w-4 h-4" />
                  My Library
                </NavLink>
                <NotificationBell />
                <HighlightedButton variant="ghost-glass" size="sm" onClick={handleLogout} className="gap-2">
                  <LogOut className="w-4 h-4" />
                  Logout
                </HighlightedButton>
              </>
            ) : (
              <>
                <Link to="/login">
                  <HighlightedButton variant="ghost-glass" size="sm" className="gap-2">
                    <LogIn className="w-4 h-4" />
                    Sign in
                  </HighlightedButton>
                </Link>
                <Link to="/register">
                  <HighlightedButton variant="cta-primary" size="sm">
                    Register
                  </HighlightedButton>
                </Link>
              </>
            )}
            <HighlightedButton
              variant="ghost-glass"
              size="icon"
              onClick={toggleTheme}
              aria-label={isDark ? 'Light mode' : 'Dark mode'}
            >
              {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </HighlightedButton>
          </div>

          <div className="flex lg:hidden items-center gap-2">
            <HighlightedButton variant="ghost-glass" size="icon" onClick={toggleTheme} aria-label="Toggle theme">
              {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </HighlightedButton>
            <HighlightedButton variant="ghost-glass" size="icon" onClick={() => setIsOpen(true)} aria-expanded={isOpen} aria-label="Open menu">
              <Menu className="w-5 h-5" />
            </HighlightedButton>
          </div>
        </div>
      </motion.nav>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] glass-panel-v2 lg:hidden flex flex-col"
          >
            <div className="flex items-center justify-between px-4 h-16 border-b border-glass-border">
              <BrandMark />
              <HighlightedButton variant="ghost-glass" size="icon" onClick={() => setIsOpen(false)} aria-label="Close menu">
                <X className="w-5 h-5" />
              </HighlightedButton>
            </div>
            <nav className="flex-1 flex flex-col p-6 gap-3 overflow-y-auto">
              {NAV_LINKS.map((link) => (
                <NavLink key={link.to} to={link.to} end={'end' in link ? link.end : undefined} className={navPillClass} onClick={() => setIsOpen(false)}>
                  <link.icon className="w-5 h-5" />
                  {link.label}
                </NavLink>
              ))}
              <div className="border-t border-glass-border my-4 pt-4 flex flex-col gap-3">
                {user ? (
                  <>
                    <NavLink to="/dashboard" className={navPillClass} onClick={() => setIsOpen(false)}>
                      <LayoutDashboard className="w-5 h-5" />
                      My Library
                    </NavLink>
                    <HighlightedButton variant="cta-primary" onClick={() => { handleLogout(); setIsOpen(false); }} className="w-full gap-2">
                      <LogOut className="w-4 h-4" />
                      Logout
                    </HighlightedButton>
                  </>
                ) : (
                  <>
                    <Link to="/login" onClick={() => setIsOpen(false)}>
                      <HighlightedButton variant="ghost-glass" className="w-full gap-2">
                        <LogIn className="w-4 h-4" />
                        Sign in
                      </HighlightedButton>
                    </Link>
                    <Link to="/register" onClick={() => setIsOpen(false)}>
                      <HighlightedButton variant="cta-primary" className="w-full">
                        Register
                      </HighlightedButton>
                    </Link>
                  </>
                )}
              </div>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

export default Navbar;
