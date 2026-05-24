import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AdminErrorBanner, AdminPageHeader } from '../../components/admin';
import { ProjectImageFields } from '../../components/admin/ProjectImageFields';
import { AdminField, AdminFormCard, adminInputClass } from '../../components/admin/AdminFormCard';
import { HighlightedButton } from '../../components/ui/HighlightedButton';
import { apiFetch } from '../../lib/api';
type Portfolio = { id: string; title: string };

const AdminProjectNewPage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const body = new FormData();
      body.append('title', formData.title);
      body.append('category', formData.category);
      body.append('description', formData.description);
      if (formData.portfolioId) body.append('portfolioId', formData.portfolioId);
      const urls = formData.images.filter(Boolean);
      body.append('images', JSON.stringify(urls));
      uploadFiles.forEach((f) => body.append('images', f));
      const res = await apiFetch('/api/admin/projects', { method: 'POST', body });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error((data as { error?: string }).error || 'Failed to create project');
      }
      navigate('/admin/projects');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <AdminPageHeader title="New project" backTo={{ label: 'Projects', href: '/admin/projects' }} />
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
        <HighlightedButton type="submit" variant="cta-primary" disabled={loading}>
          {loading ? 'Saving…' : 'Create project'}
        </HighlightedButton>
      </AdminFormCard>
    </>
  );
};

export default AdminProjectNewPage;
