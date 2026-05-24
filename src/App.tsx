/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { BrowserRouter, useLocation } from 'react-router-dom';
import Providers from './Providers';
import AppRoutes from './AppRoutes';
import { Navbar } from './components/layout/Navbar';
import { Footer } from './components/layout/Footer';
import { SkipLink } from './components/ui/SkipLink';
import { CommandPalette } from './components/ui/CommandPalette';
import { NotificationSystem } from './components/ui/NotificationSystem';
import { MobileBottomNav } from './components/ui/MobileNav';

const AUTH_PATHS = ['/login', '/register', '/admin/login'];

function NavbarWrapper() {
  const location = useLocation();
  if (location.pathname.startsWith('/admin') || AUTH_PATHS.includes(location.pathname)) {
    return null;
  }
  return <Navbar />;
}

function FooterWrapper() {
  const location = useLocation();
  const path = location.pathname;
  const hideOn = ['/login', '/register', '/checkout'];
  if (
    hideOn.includes(path) ||
    path.startsWith('/admin') ||
    path === '/dashboard' ||
    path.startsWith('/dashboard/')
  ) {
    return null;
  }
  return <Footer />;
}

export default function App() {
  return (
    <Providers>
      <BrowserRouter>
        <SkipLink />
        <div className="flex flex-col min-h-screen bg-bg text-foreground">
          <NavbarWrapper />
          <main
            id="main-content"
            tabIndex={-1}
            className="flex-grow w-full overflow-x-hidden outline-none"
          >
            <AppRoutes />
          </main>
          <FooterWrapper />
          <MobileBottomNav />
        </div>
        <CommandPalette />
        <NotificationSystem />
      </BrowserRouter>
    </Providers>
  );
}
