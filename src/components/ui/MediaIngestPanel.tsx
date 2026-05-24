import React, { useCallback, useRef, useState } from 'react';
import { Link2, Upload, X } from 'lucide-react';
import { cn } from '../../lib/utils';
import { GlassCard } from './GlassCard';
import { HighlightedButton } from './HighlightedButton';
import { Input } from './Input';

export type IngestQueueItem =
  | { id: string; kind: 'local'; name: string; size: string; file?: File }
  | { id: string; kind: 'url'; url: string; hostname: string };

type MediaIngestPanelProps = {
  mode: 'client' | 'admin';
  onSend: (items: IngestQueueItem[]) => Promise<void>;
  sending?: boolean;
};

function formatBytes(n: number): string {
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`;
  return `${(n / (1024 * 1024)).toFixed(1)} MB`;
}

function parseHostname(url: string): string {
  try {
    return new URL(url).hostname;
  } catch {
    return url.slice(0, 40);
  }
}

export function MediaIngestPanel({ mode, onSend, sending }: MediaIngestPanelProps) {
  const [queue, setQueue] = useState<IngestQueueItem[]>([]);
  const [urlInput, setUrlInput] = useState('');
  const [urlError, setUrlError] = useState('');
  const [dragOver, setDragOver] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const addFiles = useCallback((fileList: FileList | null) => {
    if (!fileList?.length) return;
    const next: IngestQueueItem[] = [];
    Array.from(fileList).forEach((file) => {
      next.push({
        id: `local-${file.name}-${Date.now()}-${Math.random()}`,
        kind: 'local',
        name: file.name,
        size: formatBytes(file.size),
        file: mode === 'admin' ? file : undefined,
      });
    });
    setQueue((q) => [...q, ...next]);
  }, [mode]);

  const addUrl = () => {
    const trimmed = urlInput.trim();
    if (!/^https?:\/\/.+/i.test(trimmed)) {
      setUrlError('Enter a valid https link');
      return;
    }
    setUrlError('');
    setQueue((q) => [
      ...q,
      {
        id: `url-${Date.now()}`,
        kind: 'url',
        url: trimmed,
        hostname: parseHostname(trimmed),
      },
    ]);
    setUrlInput('');
  };

  const remove = (id: string) => setQueue((q) => q.filter((i) => i.id !== id));

  const handleSend = async () => {
    if (queue.length === 0) return;
    await onSend(queue);
    setQueue([]);
  };

  return (
    <section className="w-full" aria-labelledby="ingest-media-heading">
      <GlassCard padding="lg" elevated className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-[10px] uppercase tracking-[0.32em] text-accent-brand mb-1">Ingest media</p>
            <h2 id="ingest-media-heading" className="text-lg font-black uppercase tracking-tighter text-foreground">
              Upload or link
            </h2>
            <p className="text-xs text-muted mt-1">Both paths optional — queue items, then send to studio.</p>
          </div>
          <HighlightedButton
            variant="cta-primary"
            size="md"
            disabled={queue.length === 0 || sending}
            onClick={handleSend}
          >
            {sending
              ? 'Sending…'
              : queue.length === 0
                ? 'Send to studio'
                : `Send ${queue.length} item${queue.length === 1 ? '' : 's'} to studio`}
          </HighlightedButton>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setDragOver(true);
            }}
            onDragLeave={() => setDragOver(false)}
            onDrop={(e) => {
              e.preventDefault();
              setDragOver(false);
              addFiles(e.dataTransfer.files);
            }}
            className={cn(
              'glass-panel-v2 rounded-lg p-6 border-2 border-dashed transition-colors min-h-[160px] flex flex-col items-center justify-center gap-3',
              dragOver ? 'border-accent-cta bg-accent-cta/5' : 'border-glass-border'
            )}
          >
            <Upload className="w-8 h-8 text-accent-brand" />
            <p className="text-xs text-muted text-center">Drag DSC_2847.JPG, MG_1023-Edit.png…</p>
            <input
              ref={fileRef}
              type="file"
              multiple
              accept="image/*,.pdf,.zip"
              className="sr-only"
              onChange={(e) => addFiles(e.target.files)}
            />
            <HighlightedButton variant="ghost-glass" size="sm" onClick={() => fileRef.current?.click()}>
              Browse device
            </HighlightedButton>
          </div>

          <div className="glass-panel-v2 rounded-lg p-4 space-y-2">
            <div className="flex items-center gap-2 text-accent-link">
              <Link2 className="w-4 h-4" />
              <span className="text-[10px] uppercase tracking-widest">External URL</span>
            </div>
            <Input
              value={urlInput}
              onChange={(e) => {
                setUrlInput(e.target.value);
                setUrlError('');
              }}
              placeholder="https://drive.google.com/file/d/…"
              className="text-xs"
            />
            {urlError && <p className="text-[10px] text-accent-danger">{urlError}</p>}
            <HighlightedButton variant="outline" size="sm" onClick={addUrl}>
              Add URL to queue
            </HighlightedButton>
          </div>
        </div>

        {queue.length > 0 ? (
          <ul className="space-y-2 max-h-[200px] overflow-y-auto">
            {queue.map((item) => (
              <li
                key={item.id}
                className="flex items-center justify-between gap-3 py-2 px-3 glass-panel-v2 rounded-md text-xs"
              >
                <div className="min-w-0 flex-1">
                  {item.kind === 'local' ? (
                    <>
                      <p className="text-foreground font-medium truncate">{item.name}</p>
                      <p className="text-[9px] text-muted uppercase tracking-wider">
                        {item.size} · local
                      </p>
                    </>
                  ) : (
                    <>
                      <p className="text-foreground truncate">{item.hostname}</p>
                      <p className="text-[9px] text-muted uppercase tracking-wider">link · url</p>
                    </>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => remove(item.id)}
                  className="p-2 text-muted hover:text-foreground min-h-[44px] min-w-[44px] flex items-center justify-center"
                  aria-label="Remove from queue"
                >
                  <X className="w-4 h-4" />
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-xs text-muted text-center py-6 glass-panel-v2 rounded-md">
            Queue empty — example: <span className="text-foreground">DSC_2847.JPG</span> or Drive link
          </p>
        )}
      </GlassCard>
    </section>
  );
}

export default MediaIngestPanel;
