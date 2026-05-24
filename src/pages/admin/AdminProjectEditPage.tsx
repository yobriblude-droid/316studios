import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { AdminErrorBanner, AdminPageHeader } from '../../components/admin';
import { ProjectImageFields } from '../../components/admin/ProjectImageFields';
import { AdminField, AdminFormCard, adminInputClass } from '../../components/admin/AdminFormCard';
import { HighlightedButton } from '../../components/ui/HighlightedButton';
import { apiFetch } from '../../lib/api';

type Portfolio = { id: string; title: string };

const AdminProjectEditPage = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [portfolios, setPortfolios] = useState<Portfolio[]>([]);
  const [formData, setFormData] = useState({
    title: '',
    category: '',
    description: '',
    portfolioId: '',
    images: [] as string[],
  });
  const [uploadFiles, setUploadFiles] = useState<File[]>([]);

  useEffect(() => {
    apiFetch('/api/admin/portfolios')
      .then((r) => r.json())
      .then((data) => setPortfolios(Array.isArray(data) ? data : []))
      .catch(() => setPortfolios([]));
  }, []);

  useEffect(() => {
    if (!id) return;
    apiFetch(`/api/admin/projects/${id}`)
      .then(async (res) => {
        if (!res.ok) throw new Error('Failed');
        const data = await res.json();
        const images = typeof data.images === 'string' ? JSON.parse(data.images) : data.images || [];
        setFormData({
          title: data.title,
          category: data.category,
          description: data.description || '',
          portfolioId: data.portfolioId || '',
          images: Array.isArray(images) && images.length ? images : [],
        });
      })
      .catch((e: Error) => setError(e.message))
      .finally(() => setLoading(false));
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const body = new FormData();
      body.append('title', formData.title);
      body.append('category', formData.category);
      body.append('description', formData.description);
      body.append('portfolioId', formData.portfolioId);
      body.append('images', JSON.stringify(formData.images.filter(Boolean)));
      uploadFiles.forEach((f) => body.append('images', f));
      const res = await apiFetch(`/api/admin/projects/${id}`, { method: 'PUT', body });
      if (!res.ok) throw new Error('Failed');
      navigate('/admin/projects');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <p className="text-muted text-sm">Loading…</p>;

  return (
    <>
      <AdminPageHeader title="Edit project" backTo={{ label: 'Projects', href: '/admin/projects' }} />
      <AdminErrorBanner message={error} />
      <AdminFormCard onSubmit={handleSubmit}>
        <AdminField label="Title">
          <input required className={adminInputClass} value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} />
        </AdminField>
        <AdminField label="Category">
          <input required className={adminInputClass} value={formData.category} onChange={(e) => setFormData({ ...formData, category: e.target.value })} />
        </AdminField>
        <AdminField label="Portfolio collection">
          <select
            className={adminInputClass}
            value={formData.portfolioId}
            onChange={(e) => setFormData({ ...formData, portfolioId: e.target.value })}
          >
            <option value="">— None —</option>
            {portfolios.map((p) => (
              <option key={p.id} value={p.id}>{p.title}</option>
            ))}
          </select>
        </AdminField>
        <AdminField label="Description">
          <textarea className={`${adminInputClass} min-h-[120px]`} value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} />
        </AdminField>
        <ProjectImageFields
          imageUrls={formData.images.length ? formData.images : ['']}
          onImageUrlsChange={(urls) => setFormData({ ...formData, images: urls })}
          uploadFiles={uploadFiles}
          onUploadFilesChange={setUploadFiles}
        />
        <HighlightedButton type="submit" variant="cta-primary" disabled={saving}>
          {saving ? 'Saving…' : 'Save changes'}
        </HighlightedButton>
      </AdminFormCard>
    </>
  );
};

export default AdminProjectEditPage;
