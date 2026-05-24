import React from 'react';
import { Download } from 'lucide-react';
import { Modal } from './Modal';
import { Button } from './Button';
import { PresenceIndicator } from './PresenceIndicator';
import { OptimizedImage } from './OptimizedImage';
import { useFilePresence } from '../../hooks/use-realtime';
import type { ClientFile } from '../widgets/types';

const IMAGE_FORMATS = ['JPEG', 'JPG', 'PNG', 'WEBP', 'GIF'];

type MediaPreviewProps = {
  file: ClientFile | null;
  open: boolean;
  onClose: () => void;
  onDownload: (file: ClientFile) => void;
};

export function MediaPreview({ file, open, onClose, onDownload }: MediaPreviewProps) {
  const viewers = useFilePresence(open && file ? file.id : null);

  if (!file) return null;

  const isImage = IMAGE_FORMATS.includes(file.format) && file.url;

  return (
    <Modal open={open} onClose={onClose} title={file.name} size="full" className="!max-w-5xl">
      <div className="flex flex-col items-center gap-6">
        <PresenceIndicator users={viewers} />
        {isImage ? (
          <div className="w-full max-h-[70vh]">
            <OptimizedImage
              src={file.url}
              alt={file.name}
              className="max-h-[70vh] w-full object-contain border border-border"
              priority
            />
          </div>
        ) : (
          <div className="py-12 text-center text-muted space-y-2">
            <p className="text-sm uppercase tracking-widest">{file.format}</p>
            <p className="text-xs">{file.size} · {file.date}</p>
            {!file.url && <p className="text-xs">No preview available for this file type.</p>}
          </div>
        )}
        <div className="flex flex-wrap items-center justify-center gap-4 text-xs text-muted">
          <span>{file.size}</span>
          <span>{file.date}</span>
          <span>Downloads: {file.downloadCount || 0}</span>
          {file.approved !== null && (
            <span className={file.approved ? 'text-emerald-400' : 'text-red-400'}>
              {file.approved ? 'Approved' : 'Rejected'}
            </span>
          )}
        </div>
        <Button variant="primary" onClick={() => onDownload(file)}>
          <Download className="w-4 h-4" />
          Download
        </Button>
      </div>
    </Modal>
  );
}
