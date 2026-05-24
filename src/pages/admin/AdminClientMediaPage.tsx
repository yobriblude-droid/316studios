import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { AdminErrorBanner, AdminPageHeader } from '../../components/admin';
import { GlassCard } from '../../components/ui/GlassCard';
import { MediaIngestPanel, type IngestQueueItem } from '../../components/ui/MediaIngestPanel';

type ClientFile = {
  id: string;
  name: string;
  format: string;
  size: string;
  date: string;
  url: string;
};

const AdminClientMediaPage = () => {
  const { id } = useParams<{ id: string }>();
  const [files, setFiles] = useState<ClientFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [ingestSending, setIngestSending] = useState(false);

  const fetchFiles = async () => {
    if (!id) return;
    try {
      setLoading(true);
      const res = await fetch(`/api/admin/users/${id}/files`);
      if (!res.ok) throw new Error('Failed');
      setFiles(await res.json());
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFiles();
  }, [id]);

  const handleIngestSend = async (items: IngestQueueItem[]) => {
    if (!id) return;
    setIngestSending(true);
    try {
      const locals = items.filter((i) => i.kind === 'local' && i.file);
      if (locals.length === 0 && items.some((i) => i.kind === 'url')) {
        setError('URL-only items are not uploaded here — use file queue for admin uploads.');
        return;
      }
      for (const item of locals) {
        if (item.kind !== 'local' || !item.file) continue;
        const form = new FormData();
        form.append('file', item.file);
        const res = await fetch(`/api/admin/users/${id}/files`, { method: 'POST', body: form });
        if (!res.ok) throw new Error('Upload failed');
      }
      await fetchFiles();
      setError('');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Upload failed');
    } finally {
      setIngestSending(false);
    }
  };

  const remove = async (fileId: string) => {
    if (!id || !confirm('Delete this file?')) return;
    await fetch(`/api/admin/users/${id}/files/${fileId}`, { method: 'DELETE' });
    fetchFiles();
  };

  return (
    <>
      <AdminPageHeader
        title="Client media"
        description={`User ${id?.slice(0, 8)}… — John Doe deliverables`}
        backTo={{ label: 'Users', href: '/admin/users' }}
      />
      <AdminErrorBanner message={error} />

      <div className="mb-8">
        <MediaIngestPanel mode="admin" onSend={handleIngestSend} sending={ingestSending} />
      </div>

      {loading ? (
        <p className="text-muted text-xs uppercase tracking-widest animate-pulse">Loading files…</p>
      ) : files.length === 0 ? (
        <GlassCard className="text-center text-sm text-muted min-h-[120px] flex items-center justify-center">
          No media — upload client-DSC_2847.JPG via ingest panel
        </GlassCard>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2">
          {files.map((f) => (
            <GlassCard key={f.id} padding="sm" className="flex gap-3">
              {f.url && f.format.match(/jpe?g|png|webp|gif/i) ? (
                <img
                  src={f.url}
                  alt=""
                  className="w-20 h-24 object-cover rounded-md shrink-0"
                />
              ) : (
                <div className="w-20 h-24 bg-elevated flex items-center justify-center text-[10px] text-muted uppercase rounded-md shrink-0">
                  {f.format}
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{f.name}</p>
                <p className="text-[10px] text-muted uppercase mt-1">{f.size}</p>
                <div className="flex gap-2 mt-2 flex-wrap">
                  <a
                    href={f.url}
                    target="_blank"
                    rel="noreferrer"
                    className="text-[10px] uppercase text-accent-link hover:underline"
                  >
                    Open
                  </a>
                  <button
                    type="button"
                    onClick={() => remove(f.id)}
                    className="text-[10px] uppercase text-accent-danger hover:underline min-h-[44px]"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </GlassCard>
          ))}
        </div>
      )}
    </>
  );
};

export default AdminClientMediaPage;
