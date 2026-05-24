import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AdminErrorBanner, AdminPageHeader } from '../../components/admin';
import { AdminField, AdminFormCard, adminInputClass } from '../../components/admin/AdminFormCard';
import { Button } from '../../components/ui/Button';
import { apiFetch } from '../../lib/api';

const AdminServiceNewPage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({ title: '', price: '', description: '' });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await apiFetch('/api/admin/services', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      if (!res.ok) throw new Error('Failed');
      navigate('/admin/services');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <AdminPageHeader title="New service" backTo={{ label: 'Services', href: '/admin/services' }} />
      <AdminErrorBanner message={error} />
      <AdminFormCard onSubmit={handleSubmit}>
        <AdminField label="Title">
          <input required className={adminInputClass} value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} />
        </AdminField>
        <AdminField label="Price">
          <input required className={adminInputClass} value={formData.price} onChange={(e) => setFormData({ ...formData, price: e.target.value })} placeholder="KES 50,000" />
        </AdminField>
        <AdminField label="Description">
          <textarea required className={`${adminInputClass} min-h-[100px]`} value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} />
        </AdminField>
        <Button type="submit" variant="primary" disabled={loading}>{loading ? 'Saving…' : 'Create service'}</Button>
      </AdminFormCard>
    </>
  );
};

export default AdminServiceNewPage;
