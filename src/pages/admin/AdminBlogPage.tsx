import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AdminDeleteModal, AdminPageHeader } from '../../components/admin';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { BulkActionBar } from '../../components/ui/BulkActionBar';
import { useBulkSelection } from '../../hooks/use-bulk-selection';
import { apiFetch } from '../../lib/api';

type Post = { id: string; title: string; slug: string; excerpt: string; published: number };

export default function AdminBlogPage() {
  const navigate = useNavigate();
  const [posts, setPosts] = useState<Post[]>([]);
  const [form, setForm] = useState({ title: '', excerpt: '', body: '', published: false });
  const [deleteIds, setDeleteIds] = useState<string[] | null>(null);
  const { selectedIds, toggle, selectAll, clearSelection } = useBulkSelection(() => posts.map((p) => p.id));

  const load = () => {
    apiFetch('/api/admin/blog')
      .then((r) => r.json())
      .then(setPosts);
  };

  useEffect(() => {
    load();
  }, []);

  const create = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await apiFetch('/api/admin/blog', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    });
    if (res.ok) {
      setForm({ title: '', excerpt: '', body: '', published: false });
      load();
    }
  };

  const bulkDelete = async () => {
    if (!deleteIds?.length) return;
    await apiFetch('/api/admin/blog/bulk-delete', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ids: deleteIds }),
    });
    clearSelection();
    setDeleteIds(null);
    load();
  };

  return (
    <>
      <AdminPageHeader title="Blog" description="Publish studio journal posts to /blog." />
      <form onSubmit={create} className="glass-panel border border-border p-6 mb-8 space-y-4 max-w-2xl">
        <Input label="Title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
        <Input label="Excerpt" value={form.excerpt} onChange={(e) => setForm({ ...form, excerpt: e.target.value })} required />
        <label className="block text-xs uppercase tracking-widest text-muted">
          Body
          <textarea
            className="mt-2 w-full bg-elevated border border-border p-3 text-sm min-h-[160px]"
            value={form.body}
            onChange={(e) => setForm({ ...form, body: e.target.value })}
            required
          />
        </label>
        <label className="flex items-center gap-2 text-xs uppercase tracking-widest">
          <input type="checkbox" checked={form.published} onChange={(e) => setForm({ ...form, published: e.target.checked })} />
          Publish immediately
        </label>
        <Button type="submit" variant="primary" size="sm">Create post</Button>
      </form>

      <BulkActionBar
        totalCount={posts.length}
        selectedIds={selectedIds}
        onSelectAll={selectAll}
        onClearSelection={clearSelection}
        onDeleteSelected={() => setDeleteIds(selectedIds)}
        entityLabel="posts"
      />
      <ul className="mt-4 space-y-2">
        {posts.map((p) => (
          <li key={p.id} className="flex items-center gap-3 p-3 border border-border">
            <input type="checkbox" checked={selectedIds.includes(p.id)} onChange={() => toggle(p.id)} />
            <div className="flex-1">
              <p className="font-medium">{p.title}</p>
              <p className="text-xs text-muted">/{p.slug} · {p.published ? 'Live' : 'Draft'}</p>
            </div>
            <button type="button" onClick={() => navigate(`/admin/blog/${p.id}/edit`)} className="text-[10px] uppercase text-accent hover:underline">
              Edit
            </button>
            <a href={`/blog/${p.slug}`} target="_blank" rel="noreferrer" className="text-[10px] uppercase text-muted hover:text-accent">
              View
            </a>
          </li>
        ))}
      </ul>
      <AdminDeleteModal
        open={!!deleteIds?.length}
        title="Delete posts"
        message={`Delete ${deleteIds?.length || 0} post(s)?`}
        onCancel={() => setDeleteIds(null)}
        onConfirm={bulkDelete}
      />
    </>
  );
}
