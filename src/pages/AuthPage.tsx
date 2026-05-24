import React, { useContext, useEffect, useState } from 'react';
import { AuthContext } from '../contexts/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import { AuthSplitLayout } from '../components/auth/AuthSplitLayout';
import { Input } from '../components/ui/Input';
import { HighlightedButton } from '../components/ui/HighlightedButton';

export default function AuthPage({ type }: { type: 'login' | 'register' }) {
  const [formData, setFormData] = useState({ email: '', password: '', name: '' });
  const [error, setError] = useState('');
  const { user, loading, login, register } = useContext(AuthContext)!;
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && user) navigate('/dashboard', { replace: true });
  }, [user, loading, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const res =
      type === 'login'
        ? await login(formData.email, formData.password)
        : await register(formData.name, formData.email, formData.password);

    if (res.success) {
      navigate('/dashboard');
    } else {
      setError(res.error || 'Something went wrong');
    }
  };

  const isLogin = type === 'login';

  if (loading) {
    return (
      <div className="min-h-[100dvh] flex items-center justify-center text-muted text-xs uppercase tracking-widest safe-area-pt safe-area-pb">
        Loading…
      </div>
    );
  }

  return (
    <AuthSplitLayout
      title={isLogin ? 'Client login' : 'Create account'}
      subtitle={isLogin ? 'Client portal' : 'Registration'}
      visualTitle={isLogin ? 'Welcome back.' : 'Join the studio.'}
      visualDescription="Your private SaaS portal — deliverables, approvals, billing, and direct messages with 316 Studios."
      footer={
        <div className="flex items-center justify-between gap-4">
          <span className="text-xs text-muted uppercase tracking-wider">
            {isLogin ? "Don't have an account?" : 'Already a client?'}
          </span>
          <Link
            to={isLogin ? '/register' : '/login'}
            className="text-xs font-semibold uppercase tracking-widest text-primary hover:text-primary-hover"
          >
            {isLogin ? 'Register' : 'Sign in'}
          </Link>
        </div>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        {!isLogin && (
          <Input
            label="Full name"
            required
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="John Doe"
          />
        )}
        <Input
          label="Email"
          type="email"
          required
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          placeholder="client@example.com"
        />
        <Input
          label="Password"
          type="password"
          required
          minLength={6}
          value={formData.password}
          onChange={(e) => setFormData({ ...formData, password: e.target.value })}
          placeholder="••••••••"
        />
        {error && (
          <p className="text-accent-danger text-xs font-semibold uppercase tracking-wider">{error}</p>
        )}
        <HighlightedButton type="submit" variant="cta-primary" className="w-full">
          {isLogin ? 'Sign in' : 'Create account'}
        </HighlightedButton>
      </form>
    </AuthSplitLayout>
  );
}
