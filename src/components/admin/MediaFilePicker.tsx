import React, { useCallback, useEffect, useRef, useState } from 'react';
import { FolderOpen, ImagePlus, Trash2, Upload } from 'lucide-react';
import { apiFetch } from '../../lib/api';
import { cn } from '../../lib/utils';
import { HighlightedButton } from '../ui/HighlightedButton';

export const MEDIA_FOLDER_OPTIONS = [
  { id: 'hero', label: 'Hero (homepage)' },
  { id: 'portfolio', label: 'Portfolio' },
  { id: 'clients', label: 'Client deliverables' },
  { id: 'uploads', label: 'Uploads' },
  { id: 'general', label: 'General' },
  { id: 'avatars', label: 'Avatars' },
] as const;

type MediaFile = { name: string; url: string; size: number; mtime: string };

type MediaFilePickerProps = {
  subdir: string;
  onSubdirChange: (v: string) => void;
  selectedUrl: string;
  onSelectUrl: (url: string) => void;
  label?: string;
};

export function MediaFilePicker({
  subdir,
  onSubdirChange,
  selectedUrl,
  onSelectUrl,
  label = 'Featured image',
}: MediaFilePickerProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [files, setFiles] = useState<MediaFile[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');

  const loadFiles = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await apiFetch(`/api/admin/media/list?subdir=${encodeURIComponent(subdir)}`);
      if (!res.ok) throw new Error('Failed to load media');
      setFiles(await res.json());
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Load failed');
    } finally {
      setLoading(false);
    }
  }, [subdir]);

  useEffect(() => {
    loadFiles();
  }, [loadFiles]);

  const upload = async (fileList: FileList | null) => {
    if (!fileList?.length) return;
    setUploading(true);
    setError('');
    try {
      for (const file of Array.from(fileList)) {
        const form = new FormData();
        form.append('file', file);
        form.append('subdir', subdir);
        const res = await apiFetch('/api/admin/media/upload', { method: 'POST', body: form });
        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          throw new Error((data as { error?: string }).error || 'Upload failed');
        }
        const data = await res.json();
        onSelectUrl(data.url);
      }
      await loadFiles();
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const removeFile = async (name: string) => {
    if (!confirm(`Delete ${name} from media/${subdir}?`)) return;
    await apiFetch(`/api/admin/media/file?subdir=${encodeURIComponent(subdir)}&name=${encodeURIComponent(name)}`, {
      method: 'DELETE',
    });
    if (selectedUrl.includes(name)) onSelectUrl('');
    loadFiles();
  };

  return (
    <div className="space-y-4 border border-border rounded-xl p-4 bg-surface">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm font-semibold text-foreground flex items-center gap-2">
          <FolderOpen className="w-4 h-4 text-primary" />
          {label}
        </p>
        <select
          value={subdir}
          onChange={(e) => onSubdirChange(e.target.value)}
          className="text-xs bg-elevated border border-border rounded-lg px-3 py-2 text-foreground"
        >
          {MEDIA_FOLDER_OPTIONS.map((o) => (
            <option key={o.id} value={o.id}>
              {o.label}
            </option>
          ))}
        </select>
      </div>

      <div
        className={cn(
          'rounded-xl border-2 border-dashed border-border p-6 flex flex-col items-center gap-3',
          'hover:border-primary/50 transition-colors'
        )}
      >
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          multiple
          className="sr-only"
          onChange={(e) => upload(e.target.files)}
        />
        <ImagePlus className="w-8 h-8 text-secondary" />
        <p className="text-xs text-muted text-center">Save to <strong className="text-foreground">media/{subdir}/</strong></p>
        <HighlightedButton
          variant="cta-primary"
          size="sm"
          type="button"
          disabled={uploading}
          onClick={() => inputRef.current?.click()}
        >
          <Upload className="w-4 h-4" />
          {uploading ? 'Uploading…' : 'Upload images'}
        </HighlightedButton>
      </div>

      {error && <p className="text-xs text-accent-danger">{error}</p>}

      {selectedUrl && (
        <div className="relative rounded-xl overflow-hidden border border-border aspect-[21/9] max-h-40">
          <img src={selectedUrl} alt="Selected" className="w-full h-full object-cover" />
          <button
            type="button"
            className="absolute top-2 right-2 text-[10px] uppercase bg-bg/80 px-2 py-1 rounded-md"
            onClick={() => onSelectUrl('')}
          >
            Clear
          </button>
        </div>
      )}

      <p className="text-[10px] uppercase tracking-widest text-muted">
        {loading ? 'Loading library…' : `${files.length} files in folder`}
      </p>
      <ul className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2 max-h-[240px] overflow-y-auto">
        {files.map((f) => (
          <li key={f.url} className="relative group">
            <button
              type="button"
              onClick={() => onSelectUrl(f.url)}
              className={cn(
                'w-full aspect-square rounded-lg overflow-hidden border-2 transition-all',
                selectedUrl === f.url ? 'border-primary ring-2 ring-primary/30' : 'border-transparent hover:border-secondary'
              )}
            >
              <img src={f.url} alt={f.name} className="w-full h-full object-cover" loading="lazy" />
            </button>
            <button
              type="button"
              onClick={() => removeFile(f.name)}
              className="absolute top-1 right-1 p-1 rounded-md bg-bg/90 opacity-0 group-hover:opacity-100 text-accent-danger"
              aria-label={`Delete ${f.name}`}
            >
              <Trash2 className="w-3 h-3" />
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default MediaFilePicker;
