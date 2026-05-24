import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAdmin } from '../../contexts/AdminContext';
import { AuthSplitLayout } from '../../components/auth/AuthSplitLayout';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';

const AdminLoginPage = () => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const { login, adminUser, loading } = useAdmin();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && adminUser) {
      navigate('/admin/dashboard', { replace: true });
    }
  }, [adminUser, loading, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      const res = await login(formData.email, formData.password);
      if (res.success) {
        navigate('/admin/dashboard', { replace: true });
      } else {
        setError(res.error || 'Login failed');
      }
    } catch {
      setError('Cannot reach the API. On Vercel, set API_URL to your backend and create an admin with npm run create-admin on that host.');
    }
  };

  if (loading) {
    return (
      <div className="min-h-[100dvh] bg-bg flex items-center justify-center safe-area-pt safe-area-pb">
        <p className="text-muted text-xs uppercase tracking-widest animate-pulse">Loading…</p>
      </div>
    );
  }

  return (
    <AuthSplitLayout
      title="Admin access"
      subtitle="Operations"
      visualTitle="Studio control."
      visualDescription="Manage projects, services, client media, billing, and fulfillment requests."
    >
      <p className="hidden sm:block text-[10px] uppercase tracking-widest text-muted mb-4">
        Admin sign-in at <span className="text-foreground">/admin/login</span>
      </p>
      <form onSubmit={handleSubmit} className="space-y-5">
        <Input
          label="Email"
          type="email"
          required
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          placeholder="admin@316studios.co.ke"
        />
        <Input
          label="Password"
          type="password"
          required
          value={formData.password}
          onChange={(e) => setFormData({ ...formData, password: e.target.value })}
        />
        {error && (
          <p className="text-red-400 text-xs font-semibold uppercase tracking-wider">{error}</p>
        )}
        <Button type="submit" variant="primary" className="w-full">
          Sign in
        </Button>
        <p className="text-center text-[10px] text-muted uppercase tracking-wider pt-2">
          <Link to="/" className="hover:text-accent transition-colors">
            ← Back to site
          </Link>
        </p>
      </form>
    </AuthSplitLayout>
  );
};

export default AdminLoginPage;
