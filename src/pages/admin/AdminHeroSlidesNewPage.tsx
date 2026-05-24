import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AdminErrorBanner, AdminPageHeader } from '../../components/admin';
import { MediaFilePicker } from '../../components/admin/MediaFilePicker';
import { AdminField, AdminFormCard, adminInputClass } from '../../components/admin/AdminFormCard';
import { HighlightedButton } from '../../components/ui/HighlightedButton';
import { apiFetch } from '../../lib/api';

const AdminHeroSlidesNewPage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [mediaSubdir, setMediaSubdir] = useState('hero');
  const [formData, setFormData] = useState({ title: '', subtitle: '', image: '' });
  const [imageFile, setImageFile] = useState<File | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.image && !imageFile) {
      setError('Select or upload a hero image');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const body = new FormData();
      body.append('title', formData.title);
      body.append('subtitle', formData.subtitle);
      if (imageFile) {
        body.append('image', imageFile);
      } else if (formData.image) {
        body.append('image', formData.image);
      }
      const res = await apiFetch('/api/admin/hero-slides', { method: 'POST', body });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error((data as { error?: string }).error || 'Failed');
      }
      navigate('/admin/hero-slides');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <AdminPageHeader title="New hero slide" backTo={{ label: 'Hero slides', href: '/admin/hero-slides' }} />
      <AdminErrorBanner message={error} />
      <AdminFormCard onSubmit={handleSubmit}>
        <AdminField label="Title">
          <input
            required
            className={adminInputClass}
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            placeholder="Nairobi's Finest"
          />
        </AdminField>
        <AdminField label="Subtitle">
          <input
            required
            className={adminInputClass}
            value={formData.subtitle}
            onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
            placeholder="Crafting timeless human moments."
          />
        </AdminField>
        <MediaFilePicker
          subdir={mediaSubdir}
          onSubdirChange={setMediaSubdir}
          selectedUrl={formData.image}
          onSelectUrl={(url) => {
            setFormData({ ...formData, image: url });
            setImageFile(null);
          }}
          label="Hero featured image"
        />
        <AdminField label="Or upload new file with slide">
          <input
            type="file"
            accept="image/*"
            className="text-sm text-muted w-full"
            onChange={(e) => {
              const f = e.target.files?.[0];
              setImageFile(f || null);
              if (f) setFormData((prev) => ({ ...prev, image: '' }));
            }}
          />
        </AdminField>
        <HighlightedButton type="submit" variant="cta-primary" disabled={loading}>
          {loading ? 'Saving…' : 'Create slide'}
        </HighlightedButton>
      </AdminFormCard>
    </>
  );
};

export default AdminHeroSlidesNewPage;
