import React, { useState } from 'react';
import { MediaFilePicker } from './MediaFilePicker';
import { AdminField } from './AdminFormCard';
import { Button } from '../ui/Button';
import { X } from 'lucide-react';

type ProjectImageFieldsProps = {
  imageUrls: string[];
  onImageUrlsChange: (urls: string[]) => void;
  uploadFiles: File[];
  onUploadFilesChange: (files: File[]) => void;
};

export function ProjectImageFields({
  imageUrls,
  onImageUrlsChange,
  uploadFiles,
  onUploadFilesChange,
}: ProjectImageFieldsProps) {
  const [mediaSubdir, setMediaSubdir] = useState('portfolio');
  const [pickerUrl, setPickerUrl] = useState('');

  const addUrlFromPicker = () => {
    if (!pickerUrl.trim()) return;
    onImageUrlsChange([...imageUrls.filter(Boolean), pickerUrl.trim()]);
    setPickerUrl('');
  };

  return (
    <div className="space-y-6">
      <AdminField label="Images (optional)">
        <p className="text-[10px] text-muted mb-3 uppercase tracking-widest">
          Pick from library, paste URLs, or upload from device — all optional
        </p>
        <MediaFilePicker
          subdir={mediaSubdir}
          onSubdirChange={setMediaSubdir}
          selectedUrl={pickerUrl}
          onSelectUrl={setPickerUrl}
          label="Add from media library"
        />
        <div className="flex gap-2 mt-2">
          <Button type="button" variant="secondary" size="sm" onClick={addUrlFromPicker} disabled={!pickerUrl.trim()}>
            Add selected URL
          </Button>
        </div>
      </AdminField>

      <AdminField label="Image URLs">
        {imageUrls.length === 0 && (
          <p className="text-xs text-muted mb-2">No URLs yet — use library or add a row below.</p>
        )}
        {imageUrls.map((img, index) => (
          <div key={index} className="flex gap-2 mb-2">
            <input
              className="flex-1 bg-elevated border border-border px-3 py-2 text-sm w-full"
              value={img}
              placeholder="/media/portfolio/…"
              onChange={(e) => {
                const next = [...imageUrls];
                next[index] = e.target.value;
                onImageUrlsChange(next);
              }}
            />
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => onImageUrlsChange(imageUrls.filter((_, i) => i !== index))}
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        ))}
        <Button type="button" variant="secondary" size="sm" onClick={() => onImageUrlsChange([...imageUrls, ''])}>
          Add URL row
        </Button>
      </AdminField>

      <AdminField label="Upload from device">
        <input
          type="file"
          accept="image/*"
          multiple
          className="text-sm text-muted w-full"
          onChange={(e) => {
            const list = e.target.files ? Array.from(e.target.files) : [];
            onUploadFilesChange([...uploadFiles, ...list]);
            e.target.value = '';
          }}
        />
        {uploadFiles.length > 0 && (
          <ul className="mt-3 space-y-1 text-xs text-muted">
            {uploadFiles.map((f, i) => (
              <li key={`${f.name}-${i}`} className="flex justify-between gap-2 items-center border border-border px-2 py-1">
                <span className="truncate">{f.name}</span>
                <button
                  type="button"
                  className="text-accent hover:underline shrink-0"
                  onClick={() => onUploadFilesChange(uploadFiles.filter((_, j) => j !== i))}
                >
                  Remove
                </button>
              </li>
            ))}
          </ul>
        )}
      </AdminField>

      {(imageUrls.filter(Boolean).length > 0 || uploadFiles.length > 0) && (
        <div className="grid grid-cols-3 sm:grid-cols-4 gap-1">
          {imageUrls.filter(Boolean).map((url) => (
            <img key={url} src={url} alt="" className="aspect-square object-cover border border-border" />
          ))}
          {uploadFiles.map((f, i) => (
            <div
              key={`${f.name}-${i}`}
              className="aspect-square bg-elevated border border-border flex items-center justify-center text-[9px] text-muted p-2 text-center"
            >
              {f.name}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default ProjectImageFields;
