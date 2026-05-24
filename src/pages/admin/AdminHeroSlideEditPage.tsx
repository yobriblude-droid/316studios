import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { AdminErrorBanner, AdminPageHeader } from '../../components/admin';
import { MediaFilePicker } from '../../components/admin/MediaFilePicker';
import { AdminField, AdminFormCard, adminInputClass } from '../../components/admin/AdminFormCard';
import { HighlightedButton } from '../../components/ui/HighlightedButton';
import { apiFetch } from '../../lib/api';

const AdminHeroSlideEditPage = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [mediaSubdir, setMediaSubdir] = useState('hero');
  const [formData, setFormData] = useState({ title: '', subtitle: '', image: '' });
  const [imageFile, setImageFile] = useState<File | null>(null);

  useEffect(() => {
    if (!id) return;
    apiFetch(`/api/admin/hero-slides/${id}`)
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
    setError('');
    try {
      const body = new FormData();
      body.append('title', formData.title);
      body.append('subtitle', formData.subtitle);
      if (imageFile) {
        body.append('image', imageFile);
      } else {
        body.append('image', formData.image);
      }
      const res = await apiFetch(`/api/admin/hero-slides/${id}`, { method: 'PUT', body });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error((data as { error?: string }).error || 'Failed');
      }
      navigate('/admin/hero-slides');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <p className="text-muted animate-pulse text-xs uppercase tracking-widest">Loading…</p>;

  return (
    <>
      <AdminPageHeader title="Edit hero slide" backTo={{ label: 'Hero slides', href: '/admin/hero-slides' }} />
      <AdminErrorBanner message={error} />
      <AdminFormCard onSubmit={handleSubmit}>
        <AdminField label="Title">
          <input required className={adminInputClass} value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} />
        </AdminField>
        <AdminField label="Subtitle">
          <input required className={adminInputClass} value={formData.subtitle} onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })} />
        </AdminField>
        <MediaFilePicker
          subdir={mediaSubdir}
          onSubdirChange={setMediaSubdir}
          selectedUrl={formData.image}
          onSelectUrl={(url) => {
            setFormData({ ...formData, image: url });
            setImageFile(null);
          }}
        />
        <AdminField label="Replace with new file">
          <input
            type="file"
            accept="image/*"
            className="text-sm text-muted w-full"
            onChange={(e) => {
              const f = e.target.files?.[0];
              setImageFile(f || null);
            }}
          />
        </AdminField>
        <HighlightedButton type="submit" variant="cta-primary" disabled={saving}>
          {saving ? 'Saving…' : 'Save slide'}
        </HighlightedButton>
      </AdminFormCard>
    </>
  );
};

export default AdminHeroSlideEditPage;
