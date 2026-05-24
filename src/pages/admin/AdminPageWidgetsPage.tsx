import React, { useEffect, useState } from 'react';
import { AdminPageHeader } from '../../components/admin';
import { apiFetch } from '../../lib/api';
import { Button } from '../../components/ui/Button';
import { WIDGET_TYPE_LABELS, type PageWidgetPage, type PageWidgetType } from '../../lib/page-widgets';

type WidgetRow = {
  id: string;
  page: PageWidgetPage;
  postId: string | null;
  type: string;
  title: string;
  content: string;
  sortOrder: number;
  enabled: number;
};

const EMPTY_FORM = {
  page: 'home' as PageWidgetPage,
  postId: '',
  type: 'text' as PageWidgetType,
  title: '',
  body: '',
  imageUrl: '',
  linkUrl: '',
  linkLabel: '',
  sortOrder: 0,
};

export default function AdminPageWidgetsPage() {
  const [widgets, setWidgets] = useState<WidgetRow[]>([]);
  const [filter, setFilter] = useState<PageWidgetPage | 'all'>('all');
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);

  const load = () => {
    const q = filter === 'all' ? '' : `?page=${filter}`;
    apiFetch(`/api/admin/widgets${q}`)
      .then((r) => r.json())
      .then(setWidgets);
  };

  useEffect(() => {
    load();
  }, [filter]);

  const buildContent = () => {
    if (form.type === 'cta') {
      return JSON.stringify({ body: form.body, linkUrl: form.linkUrl, linkLabel: form.linkLabel });
    }
    if (form.type === 'image') return JSON.stringify({ imageUrl: form.imageUrl });
    if (form.type === 'gallery') return JSON.stringify({ images: form.imageUrl.split(',').map((s) => s.trim()).filter(Boolean) });
    if (form.type === 'quote') return JSON.stringify({ body: form.body, author: form.linkLabel });
    if (form.type === 'stats') {
      return JSON.stringify({
        stats: [
          { label: 'Projects', value: '120+' },
          { label: 'Clients', value: '80+' },
          { label: 'Years', value: '8' },
          { label: 'Awards', value: '12' },
        ],
      });
    }
    return JSON.stringify({ body: form.body });
  };

  const create = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await apiFetch('/api/admin/widgets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          page: form.page,
          postId: form.postId.trim() || null,
          type: form.type,
          title: form.title,
          content: buildContent(),
          sortOrder: form.sortOrder,
          enabled: true,
        }),
      });
      setForm(EMPTY_FORM);
      load();
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id: string) => {
    if (!confirm('Delete this widget?')) return;
    await apiFetch(`/api/admin/widgets/${id}`, { method: 'DELETE' });
    load();
  };

  return (
    <>
      <AdminPageHeader
        title="Page widgets"
        description="Add content blocks to the homepage and blog posts."
      />
      <div className="flex gap-2 mb-6">
        {(['all', 'home', 'blog'] as const).map((p) => (
          <button
            key={p}
            type="button"
            onClick={() => setFilter(p)}
            className={`px-4 py-2 text-[10px] uppercase tracking-widest border ${
              filter === p ? 'border-primary bg-primary-dim text-primary' : 'border-border text-muted'
            }`}
          >
            {p}
          </button>
        ))}
      </div>

      <form onSubmit={create} className="border border-border p-6 mb-8 space-y-4 max-w-2xl">
        <h3 className="text-sm font-bold uppercase tracking-widest">New widget</h3>
        <div className="grid sm:grid-cols-2 gap-4">
          <label className="block text-xs text-muted">
            Page
            <select
              value={form.page}
              onChange={(e) => setForm({ ...form, page: e.target.value as PageWidgetPage })}
              className="mt-1 w-full bg-elevated border border-border px-3 py-2 text-sm"
            >
              <option value="home">Homepage</option>
              <option value="blog">Blog</option>
            </select>
          </label>
          <label className="block text-xs text-muted">
            Type
            <select
              value={form.type}
              onChange={(e) => setForm({ ...form, type: e.target.value as PageWidgetType })}
              className="mt-1 w-full bg-elevated border border-border px-3 py-2 text-sm"
            >
              {Object.entries(WIDGET_TYPE_LABELS).map(([k, v]) => (
                <option key={k} value={k}>{v}</option>
              ))}
            </select>
          </label>
        </div>
        {form.page === 'blog' && (
          <label className="block text-xs text-muted">
            Blog post ID (optional — leave empty for global blog widgets)
            <input
              value={form.postId}
              onChange={(e) => setForm({ ...form, postId: e.target.value })}
              className="mt-1 w-full bg-elevated border border-border px-3 py-2 text-sm"
            />
          </label>
        )}
        <label className="block text-xs text-muted">
          Title
          <input
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            className="mt-1 w-full bg-elevated border border-border px-3 py-2 text-sm"
          />
        </label>
        <label className="block text-xs text-muted">
          Body / caption
          <textarea
            value={form.body}
            onChange={(e) => setForm({ ...form, body: e.target.value })}
            rows={3}
            className="mt-1 w-full bg-elevated border border-border px-3 py-2 text-sm"
          />
        </label>
        {(form.type === 'image' || form.type === 'gallery') && (
          <label className="block text-xs text-muted">
            Image URL(s) — comma-separated for gallery
            <input
              value={form.imageUrl}
              onChange={(e) => setForm({ ...form, imageUrl: e.target.value })}
              className="mt-1 w-full bg-elevated border border-border px-3 py-2 text-sm"
            />
          </label>
        )}
        {form.type === 'cta' && (
          <div className="grid sm:grid-cols-2 gap-4">
            <label className="block text-xs text-muted">
              Link URL
              <input
                value={form.linkUrl}
                onChange={(e) => setForm({ ...form, linkUrl: e.target.value })}
                className="mt-1 w-full bg-elevated border border-border px-3 py-2 text-sm"
              />
            </label>
            <label className="block text-xs text-muted">
              Button label
              <input
                value={form.linkLabel}
                onChange={(e) => setForm({ ...form, linkLabel: e.target.value })}
                className="mt-1 w-full bg-elevated border border-border px-3 py-2 text-sm"
              />
            </label>
          </div>
        )}
        <label className="block text-xs text-muted">
          Sort order
          <input
            type="number"
            value={form.sortOrder}
            onChange={(e) => setForm({ ...form, sortOrder: Number(e.target.value) })}
            className="mt-1 w-24 bg-elevated border border-border px-3 py-2 text-sm"
          />
        </label>
        <Button type="submit" variant="primary" disabled={saving}>
          Add widget
        </Button>
      </form>

      <ul className="border border-border divide-y divide-border">
        {widgets.map((w) => (
          <li key={w.id} className="p-4 flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-sm font-medium">
                [{w.page}] {WIDGET_TYPE_LABELS[w.type as PageWidgetType] || w.type} — {w.title || '(untitled)'}
              </p>
              <p className="text-[10px] text-muted">
                order {w.sortOrder} · {w.enabled ? 'enabled' : 'disabled'}
                {w.postId ? ` · post ${w.postId}` : ''}
              </p>
            </div>
            <Button type="button" variant="ghost" onClick={() => remove(w.id)}>
              Delete
            </Button>
          </li>
        ))}
        {widgets.length === 0 && (
          <li className="p-8 text-center text-sm text-muted">No widgets yet.</li>
        )}
      </ul>
    </>
  );
}
