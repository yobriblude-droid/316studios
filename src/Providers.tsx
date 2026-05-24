import React, { useEffect } from 'react';
import { QueryClientProvider } from '@tanstack/react-query';
import { AppAuthProvider } from './contexts/AuthContext';
import { AppThemeProvider } from './contexts/ThemeContext';
import AppAdminProvider from './contexts/AdminContext';
import { NotificationProvider } from './contexts/NotificationContext';
import { CommunicationDockProvider } from './contexts/CommunicationDockContext';
import { queryClient } from './lib/query-client';
import { cacheStrategy, prefetchQuery } from './lib/cache-strategy';

const Providers: React.FC<{ children?: React.ReactNode }> = ({ children }) => {
  useEffect(() => {
    cacheStrategy.prefetchRoutes.forEach((route) => {
      if (route === '/projects') {
        prefetchQuery(() => fetch('/api/projects').then((r) => r.json()), ['projects']);
      }
      if (route === '/services') {
        prefetchQuery(() => fetch('/api/services').then((r) => r.json()), ['services']);
      }
    });
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <AppAuthProvider>
        <AppThemeProvider>
          <NotificationProvider>
            <CommunicationDockProvider>
              <AppAdminProvider>{children}</AppAdminProvider>
            </CommunicationDockProvider>
          </NotificationProvider>
        </AppThemeProvider>
      </AppAuthProvider>
    </QueryClientProvider>
  );
};

export default Providers;
