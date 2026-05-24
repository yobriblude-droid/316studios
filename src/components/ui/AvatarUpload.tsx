import React, { useRef, useState } from 'react';
import { User } from 'lucide-react';
import { cn } from '../../lib/utils';
import { Button } from './Button';

type AvatarUploadProps = {
  name: string;
  avatarUrl?: string | null;
  onUpload: (file: File) => Promise<void>;
  onRemove?: () => Promise<void>;
  size?: 'md' | 'lg';
};

export function AvatarUpload({ name, avatarUrl, onUpload, onRemove, size = 'lg' }: AvatarUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const dim = size === 'lg' ? 'w-24 h-24' : 'w-16 h-16';

  const handleFile = async (file: File | undefined) => {
    if (!file) return;
    setUploading(true);
    try {
      await onUpload(file);
    } finally {
      setUploading(false);
    }
  };

  const initials = name
    .split(/\s+/)
    .map((w) => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="flex flex-wrap items-center gap-4">
      <div
        className={cn(
          dim,
          'relative overflow-hidden border-2 border-border-gold bg-elevated flex items-center justify-center shrink-0'
        )}
      >
        {avatarUrl ? (
          <img src={avatarUrl} alt="" className="w-full h-full object-cover" />
        ) : (
          <span className="text-lg font-black text-accent">{initials || <User className="w-8 h-8 text-muted" />}</span>
        )}
      </div>
      <div className="flex flex-col gap-2">
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          className="sr-only"
          onChange={(e) => void handleFile(e.target.files?.[0])}
        />
        <Button type="button" variant="secondary" size="sm" disabled={uploading} onClick={() => inputRef.current?.click()}>
          {uploading ? 'Uploading…' : avatarUrl ? 'Change photo' : 'Upload photo'}
        </Button>
        {avatarUrl && onRemove && (
          <Button type="button" variant="ghost" size="sm" disabled={uploading} onClick={() => void onRemove()}>
            Remove photo
          </Button>
        )}
      </div>
    </div>
  );
}

export default AvatarUpload;
