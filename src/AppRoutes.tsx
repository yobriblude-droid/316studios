import React, { Suspense, lazy } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AdminLayout } from './components/admin/AdminLayout';
import { ProtectedRoute } from './components/auth/ProtectedRoute';

const LandingPage = lazy(() => import('./pages/LandingPage'));
const AboutPage = lazy(() => import('./pages/AboutPage'));
const ServicesPage = lazy(() => import('./pages/ServicesPage'));
const ContactPage = lazy(() => import('./pages/ContactPage'));
const ProjectsPage = lazy(() => import('./pages/ProjectsPage'));
const ProjectDetailPage = lazy(() => import('./pages/ProjectDetailPage'));
const ClientOverviewPage = lazy(() => import('./pages/client/ClientOverviewPage'));
const ClientLibraryPage = lazy(() => import('./pages/client/ClientLibraryPage'));
const ClientBillingPage = lazy(() => import('./pages/client/ClientBillingPage'));
const ClientWorkspaceLayout = lazy(() => import('./pages/client/ClientWorkspaceLayout'));
const ClientAccountPage = lazy(() => import('./pages/client/ClientAccountPage'));
const ClientMessagesPage = lazy(() => import('./pages/client/ClientMessagesPage'));
const ClientRequestsPage = lazy(() => import('./pages/client/ClientRequestsPage'));
const BlogPage = lazy(() => import('./pages/BlogPage'));
const BlogPostPage = lazy(() => import('./pages/BlogPostPage'));
const BookingPage = lazy(() => import('./pages/BookingPage'));
const CheckoutPage = lazy(() => import('./pages/CheckoutPage'));
const AuthPage = lazy(() => import('./pages/AuthPage'));

const AdminLoginPage = lazy(() => import('./pages/admin/AdminLoginPage'));
const AdminDashboardPage = lazy(() => import('./pages/admin/AdminDashboardPage'));
const AdminProjectsPage = lazy(() => import('./pages/admin/AdminProjectsPage'));
const AdminServicesPage = lazy(() => import('./pages/admin/AdminServicesPage'));
const AdminHeroSlidesPage = lazy(() => import('./pages/admin/AdminHeroSlidesPage'));
const AdminBillingPage = lazy(() => import('./pages/admin/AdminBillingPage'));
const AdminProjectNewPage = lazy(() => import('./pages/admin/AdminProjectNewPage'));
const AdminProjectEditPage = lazy(() => import('./pages/admin/AdminProjectEditPage'));
const AdminServiceNewPage = lazy(() => import('./pages/admin/AdminServiceNewPage'));
const AdminServiceEditPage = lazy(() => import('./pages/admin/AdminServiceEditPage'));
const AdminHeroSlidesNewPage = lazy(() => import('./pages/admin/AdminHeroSlidesNewPage'));
const AdminHeroSlideEditPage = lazy(() => import('./pages/admin/AdminHeroSlideEditPage'));
const AdminUsersPage = lazy(() => import('./pages/admin/AdminUsersPage'));
const AdminClientMediaPage = lazy(() => import('./pages/admin/AdminClientMediaPage'));
const AdminMediaRequestsPage = lazy(() => import('./pages/admin/AdminMediaRequestsPage'));
const AdminMediaPage = lazy(() => import('./pages/admin/AdminMediaPage'));
const AdminStaffPage = lazy(() => import('./pages/admin/AdminStaffPage'));
const AdminBlogPage = lazy(() => import('./pages/admin/AdminBlogPage'));
const AdminAccountPage = lazy(() => import('./pages/admin/AdminAccountPage'));
const AdminInboxPage = lazy(() => import('./pages/admin/AdminInboxPage'));
const AdminPageWidgetsPage = lazy(() => import('./pages/admin/AdminPageWidgetsPage'));
const AdminPortfoliosPage = lazy(() => import('./pages/admin/AdminPortfoliosPage'));
const AdminBlogEditPage = lazy(() => import('./pages/admin/AdminBlogEditPage'));

export default function AppRoutes() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-bg text-muted text-xs uppercase tracking-widest">
          Loading…
        </div>
      }
    >
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/services" element={<ServicesPage />} />
        <Route path="/contact" element={<ContactPage />} />
        <Route path="/projects" element={<ProjectsPage />} />
        <Route path="/projects/:id" element={<ProjectDetailPage />} />
        <Route path="/blog" element={<BlogPage />} />
        <Route path="/blog/:slug" element={<BlogPostPage />} />
        <Route path="/dashboard" element={<ProtectedRoute><ClientWorkspaceLayout /></ProtectedRoute>}>
          <Route index element={<ClientOverviewPage />} />
          <Route path="library" element={<ClientLibraryPage />} />
          <Route path="requests" element={<ClientRequestsPage />} />
          <Route path="messages" element={<ClientMessagesPage />} />
          <Route path="billing" element={<ClientBillingPage />} />
          <Route path="account" element={<ClientAccountPage />} />
        </Route>
        <Route path="/bookings" element={<BookingPage />} />
        <Route path="/checkout" element={<ProtectedRoute><CheckoutPage /></ProtectedRoute>} />
        <Route
          path="/invoices"
          element={
            <ProtectedRoute>
              <Navigate to="/dashboard/billing" replace />
            </ProtectedRoute>
          }
        />
        <Route path="/login" element={<AuthPage type="login" />} />
        <Route path="/register" element={<AuthPage type="register" />} />

        <Route path="/admin/login" element={<AdminLoginPage />} />
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<AdminDashboardPage />} />
          <Route path="portfolios" element={<AdminPortfoliosPage />} />
          <Route path="projects" element={<AdminProjectsPage />} />
          <Route path="projects/new" element={<AdminProjectNewPage />} />
          <Route path="projects/:id/edit" element={<AdminProjectEditPage />} />
          <Route path="services" element={<AdminServicesPage />} />
          <Route path="services/new" element={<AdminServiceNewPage />} />
          <Route path="services/:id/edit" element={<AdminServiceEditPage />} />
          <Route path="hero-slides" element={<AdminHeroSlidesPage />} />
          <Route path="page-widgets" element={<AdminPageWidgetsPage />} />
          <Route path="hero-slides/new" element={<AdminHeroSlidesNewPage />} />
          <Route path="hero-slides/:id/edit" element={<AdminHeroSlideEditPage />} />
          <Route path="media" element={<AdminMediaPage />} />
          <Route path="users" element={<AdminUsersPage />} />
          <Route path="users/:id/media" element={<AdminClientMediaPage />} />
          <Route path="media-requests" element={<AdminMediaRequestsPage />} />
          <Route path="billing" element={<AdminBillingPage />} />
          <Route path="inbox" element={<AdminInboxPage />} />
          <Route path="blog" element={<AdminBlogPage />} />
          <Route path="blog/:id/edit" element={<AdminBlogEditPage />} />
          <Route path="staff" element={<AdminStaffPage />} />
          <Route path="account" element={<AdminAccountPage />} />
        </Route>
      </Routes>
    </Suspense>
  );
}
