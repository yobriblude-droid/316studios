import React, { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Check,
  Download,
  Grid3X3,
  List,
  MessageSquare,
  Search,
  Send,
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { Button } from './Button';
import { Input } from './Input';
import { SectionHeader } from './SectionHeader';
import { OptimizedImage } from './OptimizedImage';
import { VirtualizedList } from './VirtualizedList';
import { HighlightedButton } from './HighlightedButton';
import { RouteOutMenu } from './RouteOutMenu';
import { restrictedFileContext } from '../../lib/route-out';
import type { ClientFile } from '../widgets/types';

const IMAGE_FORMATS = ['JPEG', 'JPG', 'PNG', 'WEBP', 'GIF'];

export function isRestrictedFile(file: ClientFile): boolean {
  return file.approved === false;
}

type ViewMode = 'grid' | 'list';

export type MediaLibraryProps = {
  files: ClientFile[];
  search: string;
  onSearchChange: (v: string) => void;
  selectedIds: string[];
  onToggleSelect: (id: string) => void;
  onSelectAll: () => void;
  onClearSelection: () => void;
  onPreview: (file: ClientFile) => void;
  onDownload: (file: ClientFile) => void;
  onApprove: (id: string, approve: boolean) => void;
  commentText: Record<string, string>;
  onCommentChange: (id: string, text: string) => void;
  onSubmitComment: (id: string) => void;
  clientName?: string;
  clientEmail?: string;
  onBulkDownload?: () => void;
};

export function MediaLibrary({
  files,
  search,
  onSearchChange,
  selectedIds,
  onToggleSelect,
  onSelectAll,
  onClearSelection,
  onPreview,
  onDownload,
  onApprove,
  commentText,
  onCommentChange,
  onSubmitComment,
  clientName,
  clientEmail,
  onBulkDownload,
}: MediaLibraryProps) {
  const [view, setView] = useState<ViewMode>('grid');
  const [expandedComments, setExpandedComments] = useState<string | null>(null);
  const [routeOutFileId, setRouteOutFileId] = useState<string | null>(null);

  const filtered = useMemo(
    () => files.filter((f) => f.name.toLowerCase().includes(search.toLowerCase())),
    [files, search]
  );

  const allSelected = filtered.length > 0 && selectedIds.length === filtered.length;
  const routeOutFile = routeOutFileId ? files.find((f) => f.id === routeOutFileId) : null;

  return (
    <section id="media-library" className="scroll-mt-28 w-full">
      <SectionHeader
        eyebrow="Deliverables"
        title="Media library"
        description="Dense grid — approve, comment, or send restricted files to the studio."
      />

      <div className="mt-6 flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
          <Input
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search karen, DSC_2847…"
            className="pl-10"
          />
        </div>
        <div className="flex items-center gap-2">
          <div className="flex glass-panel-v2 rounded-lg overflow-hidden">
            <button
              type="button"
              onClick={() => setView('grid')}
              className={cn(
                'p-2.5 transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center',
                view === 'grid' ? 'bg-accent-cta text-white' : 'text-muted hover:text-foreground'
              )}
              aria-label="Grid view"
            >
              <Grid3X3 className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => setView('list')}
              className={cn(
                'p-2.5 transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center',
                view === 'list' ? 'bg-accent-cta text-white' : 'text-muted hover:text-foreground'
              )}
              aria-label="List view"
            >
              <List className="w-4 h-4" />
            </button>
          </div>
          <HighlightedButton variant="ghost-glass" size="sm" onClick={allSelected ? onClearSelection : onSelectAll}>
            {allSelected ? 'Clear' : 'Select all'}
          </HighlightedButton>
        </div>
      </div>

      {routeOutFile && (
        <div className="mt-4">
          <RouteOutMenu
            context={restrictedFileContext(routeOutFile.name, clientName, clientEmail)}
            compact
          />
          <button
            type="button"
            className="mt-2 text-[10px] uppercase text-muted hover:text-foreground"
            onClick={() => setRouteOutFileId(null)}
          >
            Close route menu
          </button>
        </div>
      )}

      <AnimatePresence mode="popLayout">
        {filtered.length === 0 ? (
          <motion.p
            key="empty"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mt-8 text-center text-sm text-muted glass-panel-v2 rounded-lg py-12 min-h-[120px] flex items-center justify-center"
          >
            No files match — try <span className="text-foreground mx-1">karen</span> or{' '}
            <span className="text-foreground">DSC_2847</span>
          </motion.p>
        ) : view === 'grid' ? (
          <motion.div
            key="grid"
            layout
            className="mt-6 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-2"
          >
            {filtered.map((file, idx) => (
              <FileCard
                key={file.id}
                file={file}
                hero={idx % 6 === 0}
                selected={selectedIds.includes(file.id)}
                onToggleSelect={() => onToggleSelect(file.id)}
                onPreview={() => onPreview(file)}
                onDownload={() => onDownload(file)}
                onApprove={onApprove}
                onSend={() => setRouteOutFileId(file.id)}
                commentText={commentText[file.id] || ''}
                onCommentChange={(t) => onCommentChange(file.id, t)}
                onSubmitComment={() => onSubmitComment(file.id)}
                commentsOpen={expandedComments === file.id}
                onToggleComments={() =>
                  setExpandedComments((c) => (c === file.id ? null : file.id))
                }
              />
            ))}
          </motion.div>
        ) : filtered.length >= 25 ? (
          <div className="mt-6">
            <VirtualizedList
              items={filtered}
              estimateSize={96}
              className="h-[min(70vh,640px)] overflow-auto"
              renderItem={(file) => (
                <div className="pb-2">
                  <FileListRow
                    file={file}
                    selected={selectedIds.includes(file.id)}
                    onToggleSelect={() => onToggleSelect(file.id)}
                    onPreview={() => onPreview(file)}
                    onDownload={() => onDownload(file)}
                    onApprove={onApprove}
                    onSend={() => setRouteOutFileId(file.id)}
                  />
                </div>
              )}
            />
          </div>
        ) : (
          <motion.ul key="list" layout className="mt-6 space-y-2">
            {filtered.map((file) => (
              <FileListRow
                key={file.id}
                file={file}
                selected={selectedIds.includes(file.id)}
                onToggleSelect={() => onToggleSelect(file.id)}
                onPreview={() => onPreview(file)}
                onDownload={() => onDownload(file)}
                onApprove={onApprove}
                onSend={() => setRouteOutFileId(file.id)}
              />
            ))}
          </motion.ul>
        )}
      </AnimatePresence>

      {selectedIds.length > 0 && (
        <div className="fixed bottom-20 md:bottom-6 left-3 right-3 md:left-auto md:right-6 md:max-w-md z-40 glass-panel-v2-elevated rounded-lg p-3 flex flex-wrap items-center gap-2 shadow-lg">
          <span className="text-xs text-foreground flex-1">{selectedIds.length} selected</span>
          {onBulkDownload && (
            <HighlightedButton variant="cta-brand" size="sm" onClick={onBulkDownload}>
              <Download className="w-3.5 h-3.5" />
              Download
            </HighlightedButton>
          )}
          <HighlightedButton variant="ghost-glass" size="sm" onClick={onClearSelection}>
            Clear
          </HighlightedButton>
        </div>
      )}
    </section>
  );
}

function FileThumb({ file }: { file: ClientFile }) {
  const isImage = IMAGE_FORMATS.includes(file.format) && file.url;
  return (
    <div className="aspect-[4/5] bg-elevated overflow-hidden rounded-t-md brightness-[0.95] dark:brightness-[0.95]">
      {isImage ? (
        <OptimizedImage src={file.url} alt={file.name} className="w-full h-full object-cover" />
      ) : (
        <div className="w-full h-full flex items-center justify-center text-[10px] font-bold text-muted uppercase">
          {file.format}
        </div>
      )}
    </div>
  );
}

function FileCard({
  file,
  hero,
  selected,
  onToggleSelect,
  onPreview,
  onDownload,
  onApprove,
  onSend,
  commentText,
  onCommentChange,
  onSubmitComment,
  commentsOpen,
  onToggleComments,
}: {
  file: ClientFile;
  hero?: boolean;
  selected: boolean;
  onToggleSelect: () => void;
  onPreview: () => void;
  onDownload: () => void;
  onApprove: (id: string, approve: boolean) => void;
  onSend: () => void;
  commentText: string;
  onCommentChange: (t: string) => void;
  onSubmitComment: () => void;
  commentsOpen: boolean;
  onToggleComments: () => void;
}) {
  const restricted = isRestrictedFile(file);

  return (
    <motion.article
      layout
      className={cn(
        'glass-panel-v2 flex flex-col overflow-hidden rounded-2xl transition-transform duration-150 hover:scale-[1.02] hover:border-primary/40',
        hero && 'col-span-2 row-span-2',
        selected && 'ring-2 ring-accent-brand border-accent-brand'
      )}
    >
      <button type="button" onClick={onPreview} className="relative group text-left">
        <FileThumb file={file} />
        <span className="absolute inset-0 bg-black/0 group-hover:bg-black/25 transition-colors rounded-t-md" />
        <span className="absolute top-2 left-2 text-[8px] uppercase tracking-widest px-1.5 py-0.5 glass-panel-v2 text-foreground">
          {file.format}
        </span>
      </button>
      <div className="p-2 space-y-1.5 flex-1 flex flex-col">
        <p className="text-[11px] text-foreground truncate font-medium">{file.name}</p>
        <p className="text-[9px] text-muted uppercase tracking-wider">
          {file.size} · {file.date}
        </p>
        <ApprovalBar file={file} onApprove={onApprove} />
        <div className="flex gap-1 mt-auto pt-1 flex-wrap">
          {restricted && (
            <HighlightedButton variant="cta-primary" size="sm" onClick={onSend} className="!min-h-[36px] !px-2 flex-1">
              <Send className="w-3 h-3" />
              Send
            </HighlightedButton>
          )}
          <button
            type="button"
            onClick={onToggleSelect}
            className={cn(
              'py-1.5 px-2 text-[9px] uppercase rounded-md border transition-colors min-h-[36px]',
              selected ? 'border-accent-brand bg-accent-dim text-accent-brand' : 'border-glass-border text-muted'
            )}
          >
            {selected ? <Check className="w-3 h-3 mx-auto" /> : 'Sel'}
          </button>
          <button
            type="button"
            onClick={onDownload}
            className="p-1.5 rounded-md border border-glass-border hover:border-accent-brand text-muted min-h-[36px] min-w-[36px] flex items-center justify-center"
            aria-label="Download"
          >
            <Download className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={onToggleComments}
            className="p-1.5 rounded-md border border-glass-border hover:border-accent-link text-muted min-h-[36px] min-w-[36px] flex items-center justify-center"
            aria-label="Comments"
          >
            <MessageSquare className="w-3.5 h-3.5" />
          </button>
        </div>
        {commentsOpen && (
          <div className="pt-2 border-t border-glass-border space-y-2">
            {(file.comments || []).map((c) => (
              <p key={c.id} className="text-[10px] text-muted">
                {new Date(c.date).toLocaleDateString()}: {c.text}
              </p>
            ))}
            <div className="flex gap-1">
              <input
                value={commentText}
                onChange={(e) => onCommentChange(e.target.value)}
                placeholder="Add feedback… @admin"
                className="flex-1 bg-elevated border border-glass-border rounded-md px-2 py-1 text-[10px] text-foreground"
              />
              <HighlightedButton variant="cta-brand" size="sm" onClick={onSubmitComment}>
                Post
              </HighlightedButton>
            </div>
          </div>
        )}
      </div>
    </motion.article>
  );
}

function FileListRow({
  file,
  selected,
  onToggleSelect,
  onPreview,
  onDownload,
  onApprove,
  onSend,
}: {
  file: ClientFile;
  selected: boolean;
  onToggleSelect: () => void;
  onPreview: () => void;
  onDownload: () => void;
  onApprove: (id: string, approve: boolean) => void;
  onSend: () => void;
}) {
  const restricted = isRestrictedFile(file);

  return (
    <li
      className={cn(
        'flex flex-col sm:flex-row sm:items-center gap-3 p-3 glass-panel-v2 rounded-lg',
        selected && 'ring-1 ring-accent-brand'
      )}
    >
      <button type="button" onClick={onPreview} className="flex items-center gap-3 min-w-0 flex-1 text-left">
        <div className="w-14 h-14 shrink-0 rounded-md overflow-hidden">
          {IMAGE_FORMATS.includes(file.format) && file.url ? (
            <img src={file.url} alt="" className="w-full h-full object-cover" />
          ) : (
            <span className="w-full h-full flex items-center justify-center text-[9px] text-muted bg-elevated">
              {file.format}
            </span>
          )}
        </div>
        <div className="min-w-0">
          <p className="text-sm text-foreground truncate">{file.name}</p>
          <p className="text-[10px] text-muted uppercase tracking-wider mt-0.5">
            {file.size} · Downloads: {file.downloadCount || 0}
          </p>
        </div>
      </button>
      <ApprovalBar file={file} onApprove={onApprove} compact />
      <div className="flex gap-2 shrink-0 flex-wrap">
        {restricted && (
          <HighlightedButton variant="cta-primary" size="sm" onClick={onSend}>
            <Send className="w-3 h-3" />
            Send
          </HighlightedButton>
        )}
        <input
          type="checkbox"
          checked={selected}
          onChange={onToggleSelect}
          className="h-4 w-4 accent-[var(--accent-cta)]"
          aria-label={`Select ${file.name}`}
        />
        <Button variant="outline" size="sm" onClick={onDownload}>
          <Download className="w-3 h-3" />
        </Button>
      </div>
    </li>
  );
}

function ApprovalBar({
  file,
  onApprove,
  compact,
}: {
  file: ClientFile;
  onApprove: (id: string, approve: boolean) => void;
  compact?: boolean;
}) {
  if (file.approved === true) {
    return (
      <span className="inline-block text-[9px] uppercase tracking-widest px-2 py-0.5 text-accent-success border border-accent-success/30 rounded-md">
        Approved
      </span>
    );
  }
  if (file.approved === false) {
    return (
      <span className="inline-block text-[9px] uppercase tracking-widest px-2 py-0.5 text-accent-cta border border-accent-cta/40 rounded-md">
        Restricted
      </span>
    );
  }
  return (
    <div className={cn('flex gap-1', compact && 'sm:mx-2')}>
      <button
        type="button"
        onClick={() => onApprove(file.id, true)}
        className="px-2 py-0.5 text-[9px] uppercase rounded-md bg-accent-success/15 text-accent-success border border-accent-success/30"
      >
        Approve
      </button>
      <button
        type="button"
        onClick={() => onApprove(file.id, false)}
        className="px-2 py-0.5 text-[9px] uppercase rounded-md bg-accent-danger/15 text-accent-danger border border-accent-danger/30"
      >
        Reject
      </button>
    </div>
  );
}

export default MediaLibrary;
