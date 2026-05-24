import { QueryClient } from '@tanstack/react-query';
import { cacheStrategy } from './cache-strategy';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: cacheStrategy.staleTime.default,
      gcTime: cacheStrategy.gcTime.default,
      retry: 1,
      refetchOnWindowFocus: true,
      refetchOnReconnect: true,
    },
    mutations: {
      retry: 0,
    },
  },
});

export const queryKeys = {
  projects: ['projects'] as const,
  project: (id: string) => ['projects', id] as const,
  portfolios: ['portfolios'] as const,
  portfolioProjects: (slug: string) => ['portfolios', slug, 'projects'] as const,
  services: ['services'] as const,
  heroSlides: ['hero-slides'] as const,
  locations: ['locations'] as const,
  testimonials: ['testimonials'] as const,
  clientFiles: ['client', 'files'] as const,
  clientMediaRequests: ['client', 'media-requests'] as const,
  clientInvoices: ['client', 'invoices'] as const,
  clientBookings: ['client', 'bookings'] as const,
  notifications: ['client', 'notifications'] as const,
  notificationPrefs: ['client', 'notification-preferences'] as const,
  authMe: ['auth', 'me'] as const,
};
