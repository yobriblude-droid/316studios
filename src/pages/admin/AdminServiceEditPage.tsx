import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { AdminErrorBanner, AdminPageHeader } from '../../components/admin';
import { AdminField, AdminFormCard, adminInputClass } from '../../components/admin/AdminFormCard';
import { Button } from '../../components/ui/Button';
import { apiFetch } from '../../lib/api';

const AdminServiceEditPage = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({ title: '', price: '', description: '' });

  useEffect(() => {
    if (!id) return;
    apiFetch(`/api/admin/services/${id}`)
      .then(async (res) => {
        if (!res.ok) throw new Error('Failed');
        setFormData(await res.json());
      })
      .catch((e: Error) => setError(e.message))
      .finally(() => setLoading(false));
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await apiFetch(`/api/admin/services/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      if (!res.ok) throw new Error('Failed');
      navigate('/admin/services');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <p className="text-muted animate-pulse text-xs uppercase tracking-widest">Loading…</p>;

  return (
    <>
      <AdminPageHeader title="Edit service" backTo={{ label: 'Services', href: '/admin/services' }} />
      <AdminErrorBanner message={error} />
      <AdminFormCard onSubmit={handleSubmit}>
        <AdminField label="Title">
          <input required className={adminInputClass} value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} />
        </AdminField>
        <AdminField label="Price">
          <input required className={adminInputClass} value={formData.price} onChange={(e) => setFormData({ ...formData, price: e.target.value })} />
        </AdminField>
        <AdminField label="Description">
          <textarea required className={`${adminInputClass} min-h-[100px]`} value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} />
        </AdminField>
        <Button type="submit" variant="primary" disabled={saving}>{saving ? 'Saving…' : 'Save'}</Button>
      </AdminFormCard>
    </>
  );
};

export default AdminServiceEditPage;
