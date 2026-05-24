import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FolderPlus, ImagePlus, Plus } from 'lucide-react';
import { AdminPageHeader } from '../../components/admin/AdminPageHeader';
import { Card } from '../../components/ui/Card';
import { apiFetch } from '../../lib/api';

const AdminDashboardPage = () => {
  const [stats, setStats] = useState({
    totalProjects: 0,
    totalServices: 0,
    totalHeroSlides: 0,
    totalClients: 0,
    openRequests: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      apiFetch('/api/admin/projects'),
      apiFetch('/api/admin/services'),
      apiFetch('/api/admin/hero-slides'),
      apiFetch('/api/admin/users'),
      apiFetch('/api/admin/media-requests'),
    ])
      .then(async ([p, s, h, u, m]) => {
        const [projects, services, slides, users, requests] = await Promise.all([
          p.json(),
          s.json(),
          h.json(),
          u.json(),
          m.json(),
        ]);
        setStats({
          totalProjects: projects.length,
          totalServices: services.length,
          totalHeroSlides: slides.length,
          totalClients: users.filter((x: { role: string }) => x.role === 'client').length,
          openRequests: requests.filter((r: { status: string }) => r.status === 'open').length,
        });
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const statCards = [
    { label: 'Projects', value: stats.totalProjects, href: '/admin/projects' },
    { label: 'Services', value: stats.totalServices, href: '/admin/services' },
    { label: 'Hero slides', value: stats.totalHeroSlides, href: '/admin/hero-slides' },
    { label: 'Clients', value: stats.totalClients, href: '/admin/users' },
  ];

  return (
    <>
      <AdminPageHeader
        title="Overview"
        description="Operational snapshot of your studio platform."
      />

      {loading ? (
        <p className="text-muted text-xs uppercase tracking-widest animate-pulse">Loading stats…</p>
      ) : (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
            {statCards.map((s) => (
              <Link key={s.label} to={s.href}>
                <Card elevation="raised" className="hover:border-accent transition-colors h-full">
                  <p className="text-[10px] uppercase tracking-widest text-muted">{s.label}</p>
                  <p className="text-3xl font-light text-foreground mt-2 tabular-nums">{s.value}</p>
                </Card>
              </Link>
            ))}
          </div>

          {stats.openRequests > 0 && (
            <Card className="mb-10 border-border-gold bg-accent-dim">
              <p className="text-sm text-foreground">
                <span className="text-accent font-semibold">{stats.openRequests}</span> open media
                request{stats.openRequests === 1 ? '' : 's'} need attention.{' '}
                <Link to="/admin/media-requests" className="underline hover:text-accent-hover">
                  Review requests
                </Link>
              </p>
            </Card>
          )}

          <h2 className="text-lg font-semibold uppercase tracking-tight text-foreground mb-4">
            Quick actions
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Link
              to="/admin/projects/new"
              className="border border-border bg-surface p-6 flex flex-col items-center gap-3 hover:border-accent transition-colors"
            >
              <FolderPlus className="w-8 h-8 text-accent" />
              <span className="text-xs uppercase tracking-widest">New project</span>
            </Link>
            <Link
              to="/admin/services/new"
              className="border border-border bg-surface p-6 flex flex-col items-center gap-3 hover:border-accent transition-colors"
            >
              <Plus className="w-8 h-8 text-accent" />
              <span className="text-xs uppercase tracking-widest">New service</span>
            </Link>
            <Link
              to="/admin/hero-slides/new"
              className="border border-border bg-surface p-6 flex flex-col items-center gap-3 hover:border-accent transition-colors"
            >
              <ImagePlus className="w-8 h-8 text-accent" />
              <span className="text-xs uppercase tracking-widest">New hero slide</span>
            </Link>
          </div>
        </>
      )}
    </>
  );
};

export default AdminDashboardPage;
