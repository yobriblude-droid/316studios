import React, { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { MessageCircle, Radio, X } from 'lucide-react';
import { cn } from '../../lib/utils';
import { GlassCard } from './GlassCard';
import { HighlightedButton } from './HighlightedButton';
import { RouteOutMenu } from './RouteOutMenu';
import { mediaRequestContext } from '../../lib/route-out';
import type { ClientFile, MediaRequest } from '../widgets/types';
import { useCommunicationDock } from '../../contexts/CommunicationDockContext';

export type DockMessage = {
  id: string;
  author: string;
  text: string;
  time: string;
  source: 'comment' | 'request' | 'system';
};

type CommunicationDockProps = {
  files: ClientFile[];
  mediaRequests: MediaRequest[];
  connected?: boolean;
  clientName?: string;
  clientEmail?: string;
  commentDraft: string;
  onCommentDraftChange: (v: string) => void;
  onPostMessage: (text: string) => void;
  posting?: boolean;
  /** Desktop: inline sidebar. Mobile: controlled by context */
  variant?: 'sidebar' | 'sheet';
};

function buildMessages(files: ClientFile[], requests: MediaRequest[]): DockMessage[] {
  const msgs: DockMessage[] = [
    {
      id: 'sys-welcome',
      author: 'Admin User',
      text: 'John — your Karen Golden Hour set (12 files) is live. Start with DSC_2847.JPG for the hero frame.',
      time: new Date().toISOString(),
      source: 'system',
    },
  ];

  for (const file of files) {
    for (const c of file.comments || []) {
      msgs.push({
        id: c.id,
        author: c.userId === 'user123' ? 'John Doe' : 'Admin User',
        text: c.text,
        time: c.date,
        source: 'comment',
      });
    }
  }

  for (const r of requests) {
    msgs.push({
      id: `req-${r.id}`,
      author: 'John Doe',
      text: `[${r.requestType}] ${r.requestDetails}`,
      time: r.createdAt,
      source: 'request',
    });
  }

  return msgs.sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime());
}

export function CommunicationDock({
  files,
  mediaRequests,
  connected,
  clientName = 'John Doe',
  clientEmail = 'client@example.com',
  commentDraft,
  onCommentDraftChange,
  onPostMessage,
  posting,
  variant = 'sidebar',
}: CommunicationDockProps) {
  const { open, setOpen } = useCommunicationDock();
  const [tab, setTab] = useState<'in-app' | 'route-out'>('in-app');
  const messages = useMemo(() => buildMessages(files, mediaRequests), [files, mediaRequests]);

  const latestRequest = mediaRequests[0];
  const routeContext = latestRequest
    ? mediaRequestContext(
        latestRequest.requestType,
        latestRequest.requestDetails,
        latestRequest.status,
        clientName,
        clientEmail
      )
    : mediaRequestContext('file', 'Karen Golden Hour deliverables', 'open', clientName, clientEmail);

  const dockContent = (
    <GlassCard padding="none" elevated className="flex flex-col h-full overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 border-b border-glass-border">
        <div className="flex items-center gap-2">
          <MessageCircle className="w-4 h-4 text-accent-link" />
          <span className="text-[10px] uppercase tracking-[0.25em] font-semibold text-foreground">
            Communication
          </span>
          {connected && (
            <span className="inline-flex items-center gap-1 text-[9px] text-accent-success uppercase">
              <Radio className="w-3 h-3" />
              Live
            </span>
          )}
        </div>
        {variant === 'sheet' && (
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="p-2 text-muted min-h-[44px] min-w-[44px] flex items-center justify-center"
            aria-label="Close communication"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      <div className="flex border-b border-glass-border">
        {(['in-app', 'route-out'] as const).map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTab(t)}
            className={cn(
              'flex-1 py-2.5 text-[10px] uppercase tracking-widest transition-colors',
              tab === t ? 'text-accent-cta border-b-2 border-accent-cta' : 'text-muted hover:text-foreground'
            )}
          >
            {t === 'in-app' ? 'In app' : 'Route out'}
          </button>
        ))}
      </div>

      {tab === 'in-app' ? (
        <>
          <div className="flex-1 overflow-y-auto p-3 space-y-3 min-h-[200px] max-h-[min(50vh,400px)] xl:max-h-none xl:flex-1">
            {messages.map((m) => (
              <div key={m.id} className="glass-panel-v2 rounded-md p-2.5">
                <p className="text-[10px] text-accent-brand font-semibold">{m.author}</p>
                <p className="text-xs text-foreground mt-1 leading-relaxed">{m.text}</p>
                <p className="text-[9px] text-muted mt-1 uppercase tracking-wider">
                  {new Date(m.time).toLocaleString()}
                </p>
              </div>
            ))}
          </div>
          <div className="p-3 border-t border-glass-border space-y-2">
            <textarea
              value={commentDraft}
              onChange={(e) => onCommentDraftChange(e.target.value)}
              placeholder="Add message… @admin"
              rows={2}
              disabled={!connected && connected !== undefined}
              className="w-full bg-elevated border border-glass-border rounded-md px-3 py-2 text-xs text-foreground resize-none"
            />
            {!connected && connected !== undefined && (
              <p className="text-[10px] text-accent-warning">Reconnecting… composer read-only</p>
            )}
            <HighlightedButton
              variant="cta-primary"
              size="sm"
              className="w-full"
              disabled={!commentDraft.trim() || posting}
              onClick={() => onPostMessage(commentDraft.trim())}
            >
              Post
            </HighlightedButton>
          </div>
        </>
      ) : (
        <div className="p-3 flex-1 overflow-y-auto">
          <RouteOutMenu context={routeContext} />
        </div>
      )}
    </GlassCard>
  );

  if (variant === 'sidebar') {
    return (
      <aside className="hidden xl:block w-[360px] shrink-0 sticky top-24 self-start max-h-[calc(100svh-6rem)]">
        {dockContent}
      </aside>
    );
  }

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[55] bg-black/50 md:hidden"
            onClick={() => setOpen(false)}
          />
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
            className="fixed inset-x-0 bottom-0 z-[56] md:hidden max-h-[85svh] flex flex-col"
          >
            {dockContent}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

/** Peek bar on mobile when sheet closed */
export function CommunicationDockPeek() {
  const { toggle, open } = useCommunicationDock();
  if (open) return null;

  return (
    <button
      type="button"
      onClick={toggle}
      className="xl:hidden fixed bottom-[4.5rem] right-3 z-40 glass-panel-v2-elevated rounded-full px-4 py-3 flex items-center gap-2 shadow-[var(--glow-cta)] min-h-[44px]"
      aria-label="Open communication hub"
    >
      <MessageCircle className="w-5 h-5 text-accent-cta" />
      <span className="text-[10px] uppercase tracking-widest font-semibold">Comms</span>
    </button>
  );
}

export default CommunicationDock;
