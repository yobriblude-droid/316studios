import React from 'react';
import { motion } from 'motion/react';
import { cn } from '../../lib/utils';
import type { ClientFile } from './types';

const IMAGE_FORMATS = ['JPEG', 'JPG', 'PNG', 'WEBP', 'GIF'];

export function MediaWidget({
  files,
  onPreview,
  onScrollToLibrary,
}: {
  files: ClientFile[];
  onPreview: (file: ClientFile) => void;
  onScrollToLibrary?: () => void;
}) {
  const recent = [...files]
    .filter((f) => IMAGE_FORMATS.includes(f.format) && f.url)
    .slice(0, 8);

  if (recent.length === 0) {
    return (
      <p className="text-sm text-muted">
        No previews —{' '}
        {onScrollToLibrary && (
          <button type="button" onClick={onScrollToLibrary} className="text-accent-link underline">
            Open library
          </button>
        )}
      </p>
    );
  }

  return (
    <div className="grid grid-cols-4 gap-1.5">
      {recent.map((f, i) => (
        <motion.button
          key={f.id}
          type="button"
          onClick={() => onPreview(f)}
          className={cn(
            'overflow-hidden rounded-md glass-panel-v2 aspect-[4/5]',
            i === 0 && 'col-span-2 row-span-2 aspect-auto min-h-[100px]',
            'hover:ring-1 hover:ring-accent-brand focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent-cta'
          )}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <img
            src={f.url}
            alt={f.name}
            className="w-full h-full object-cover brightness-[0.95] hover:brightness-100 transition-all"
            loading="lazy"
          />
        </motion.button>
      ))}
    </div>
  );
}
