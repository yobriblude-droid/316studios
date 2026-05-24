import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { AdminErrorBanner, AdminPageHeader } from '../../components/admin';
import { MediaFilePicker } from '../../components/admin/MediaFilePicker';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { apiFetch } from '../../lib/api';

export default function AdminBlogEditPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [mediaSubdir, setMediaSubdir] = useState('general');
  const [form, setForm] = useState({
    title: '',
    excerpt: '',
    body: '',
    slug: '',
    coverImage: '',
    published: false,
  });

  useEffect(() => {
    if (!id) return;
    apiFetch('/api/admin/blog')
      .then((r) => r.json())
      .then((posts: Array<Record<string, unknown>>) => {
        const post = posts.find((p) => p.id === id);
        if (!post) throw new Error('Post not found');
        setForm({
          title: String(post.title),
          excerpt: String(post.excerpt),
          body: String(post.body),
          slug: String(post.slug),
          coverImage: String(post.coverImage || ''),
          published: Boolean(post.published),
        });
      })
      .catch((e: Error) => setError(e.message))
      .finally(() => setLoading(false));
  }, [id]);

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const res = await apiFetch(`/api/admin/blog/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError((data as { error?: string }).error || 'Save failed');
      return;
    }
    navigate('/admin/blog');
  };

  if (loading) return <p className="text-muted text-sm">Loading…</p>;

  return (
    <>
      <AdminPageHeader title="Edit post" backTo={{ label: 'Blog', href: '/admin/blog' }} />
      <AdminErrorBanner message={error} />
      <form onSubmit={save} className="glass-panel border border-border p-6 space-y-4 max-w-2xl">
        <Input label="Title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
        <Input label="Slug" value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} />
        <Input label="Excerpt" value={form.excerpt} onChange={(e) => setForm({ ...form, excerpt: e.target.value })} required />
        <label className="block text-xs uppercase tracking-widest text-muted">
          Body
          <textarea
            className="mt-2 w-full bg-elevated border border-border p-3 text-sm min-h-[200px]"
            value={form.body}
            onChange={(e) => setForm({ ...form, body: e.target.value })}
            required
          />
        </label>
        <MediaFilePicker
          subdir={mediaSubdir}
          onSubdirChange={setMediaSubdir}
          selectedUrl={form.coverImage}
          onSelectUrl={(url) => setForm({ ...form, coverImage: url })}
          label="Cover image"
        />
        <label className="flex items-center gap-2 text-xs uppercase tracking-widest">
          <input type="checkbox" checked={form.published} onChange={(e) => setForm({ ...form, published: e.target.checked })} />
          Published
        </label>
        <Button type="submit" variant="primary">Save post</Button>
      </form>
    </>
  );
}
