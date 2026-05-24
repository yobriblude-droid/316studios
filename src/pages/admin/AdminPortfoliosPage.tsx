import React, { useEffect, useState } from 'react';
import { AdminDeleteModal, AdminPageHeader } from '../../components/admin';
import { MediaFilePicker } from '../../components/admin/MediaFilePicker';
import { AdminField, adminInputClass } from '../../components/admin/AdminFormCard';
import { Button } from '../../components/ui/Button';
import { apiFetch } from '../../lib/api';

type Portfolio = {
  id: string;
  title: string;
  slug: string;
  description: string;
  coverImage: string;
  sortOrder: number;
};

const emptyForm = { title: '', slug: '', description: '', coverImage: '', sortOrder: 0 };

export default function AdminPortfoliosPage() {
  const [items, setItems] = useState<Portfolio[]>([]);
  const [form, setForm] = useState(emptyForm);
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [mediaSubdir, setMediaSubdir] = useState('portfolio');
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [editId, setEditId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const load = () => {
    apiFetch('/api/admin/portfolios')
      .then((r) => r.json())
      .then(setItems);
  };

  useEffect(() => {
    load();
  }, []);

  const resetForm = () => {
    setForm(emptyForm);
    setCoverFile(null);
    setEditId(null);
  };

  const startEdit = (p: Portfolio) => {
    setEditId(p.id);
    setForm({
      title: p.title,
      slug: p.slug,
      description: p.description,
      coverImage: p.coverImage,
      sortOrder: p.sortOrder,
    });
    setCoverFile(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const body = new FormData();
      body.append('title', form.title);
      body.append('slug', form.slug || form.title.toLowerCase().replace(/[^a-z0-9]+/g, '-'));
      body.append('description', form.description);
      body.append('sortOrder', String(form.sortOrder));
      if (coverFile) body.append('coverImage', coverFile);
      else if (form.coverImage) body.append('coverImage', form.coverImage);

      const res = await apiFetch(
        editId ? `/api/admin/portfolios/${editId}` : '/api/admin/portfolios',
        { method: editId ? 'PUT' : 'POST', body }
      );
      if (!res.ok) throw new Error('Failed');
      resetForm();
      load();
    } finally {
      setSaving(false);
    }
  };

  const remove = async () => {
    if (!deleteId) return;
    await apiFetch(`/api/admin/portfolios/${deleteId}`, { method: 'DELETE' });
    if (editId === deleteId) resetForm();
    setDeleteId(null);
    load();
  };

  return (
    <>
      <AdminPageHeader title="Portfolios" description="Collections shown on the public site and project filters." />
      <form onSubmit={submit} className="glass-panel border border-border p-6 mb-8 space-y-4 max-w-2xl">
        <h3 className="text-sm font-bold uppercase tracking-widest">
          {editId ? 'Edit collection' : 'New collection'}
        </h3>
        <AdminField label="Title">
          <input required className={adminInputClass} value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
        </AdminField>
        <AdminField label="Slug">
          <input className={adminInputClass} value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} placeholder="auto-from-title" />
        </AdminField>
        <AdminField label="Description">
          <textarea className={`${adminInputClass} min-h-[80px]`} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
        </AdminField>
        <MediaFilePicker
          subdir={mediaSubdir}
          onSubdirChange={setMediaSubdir}
          selectedUrl={form.coverImage}
          onSelectUrl={(url) => {
            setForm({ ...form, coverImage: url });
            setCoverFile(null);
          }}
          label="Cover image"
        />
        <AdminField label="Or upload cover">
          <input type="file" accept="image/*" className="text-sm text-muted w-full" onChange={(e) => setCoverFile(e.target.files?.[0] || null)} />
        </AdminField>
        <AdminField label="Sort order">
          <input type="number" className={adminInputClass} value={form.sortOrder} onChange={(e) => setForm({ ...form, sortOrder: Number(e.target.value) })} />
        </AdminField>
        <div className="flex flex-wrap gap-2">
          <Button type="submit" variant="primary" disabled={saving}>
            {saving ? 'Saving…' : editId ? 'Save changes' : 'Add portfolio'}
          </Button>
          {editId && (
            <Button type="button" variant="ghost" onClick={resetForm}>
              Cancel edit
            </Button>
          )}
        </div>
      </form>

      <ul className="border border-border divide-y divide-border">
        {items.map((p) => (
          <li key={p.id} className="flex items-center gap-4 p-4">
            {p.coverImage && <img src={p.coverImage} alt="" className="w-16 h-16 object-cover border border-border" />}
            <div className="flex-1">
              <p className="font-medium">{p.title}</p>
              <p className="text-xs text-muted">/{p.slug}</p>
            </div>
            <Button type="button" variant="outline" size="sm" onClick={() => startEdit(p)}>
              Edit
            </Button>
            <Button type="button" variant="ghost" size="sm" onClick={() => setDeleteId(p.id)}>
              Delete
            </Button>
          </li>
        ))}
      </ul>

      <AdminDeleteModal
        open={!!deleteId}
        title="Delete portfolio"
        message="Projects in this collection will be unlinked. Continue?"
        onCancel={() => setDeleteId(null)}
        onConfirm={remove}
      />
    </>
  );
}
