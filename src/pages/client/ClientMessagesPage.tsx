import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { apiFetch } from '../../lib/api';
import { Button } from '../../components/ui/Button';
import { cn } from '../../lib/utils';
import { useMessagePoll } from '../../hooks/use-message-poll';
import { Send } from 'lucide-react';

type Message = {
  id: string;
  senderRole: string;
  body: string;
  createdAt: string;
};

export default function ClientMessagesPage() {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [draft, setDraft] = useState('');
  const [sending, setSending] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  const load = useCallback(() => {
    return apiFetch('/api/client/messages')
      .then((r) => r.json())
      .then((data: Message[]) => {
        setMessages(data);
      })
      .catch(() => setMessages([]));
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  useMessagePoll(load, 3500);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages.length]);

  const send = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!draft.trim() || sending) return;
    setSending(true);
    try {
      const res = await apiFetch('/api/client/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ body: draft.trim() }),
      });
      if (!res.ok) throw new Error('Failed');
      setDraft('');
      await load();
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="glass-panel-v2 border border-glass-border p-0 flex flex-col min-h-[min(70vh,560px)] overflow-hidden">
      <header className="px-5 py-4 border-b border-glass-border flex items-center justify-between">
        <div>
          <h2 className="text-sm font-black uppercase tracking-widest">Studio chat</h2>
          <p className="text-[10px] text-muted mt-0.5">Live thread with 316 Studios</p>
        </div>
        <span className="text-[9px] uppercase tracking-widest text-accent px-2 py-1 border border-border-gold">
          Synced
        </span>
      </header>

      <div className="flex-1 overflow-y-auto p-4 space-y-3 min-h-[280px] max-h-[50vh]">
        {messages.length === 0 && (
          <p className="text-sm text-muted text-center py-16">Start a conversation with the team.</p>
        )}
        {messages.map((m) => (
          <div
            key={m.id}
            className={cn(
              'max-w-[88%] px-4 py-3 text-sm border',
              m.senderRole === 'client'
                ? 'ml-auto bg-primary/15 border-primary/40'
                : 'mr-auto glass-panel border-glass-border'
            )}
          >
            <p className="text-[9px] uppercase tracking-widest text-muted mb-1.5">
              {m.senderRole === 'client' ? user?.name : '316 Studios'} ·{' '}
              {new Date(m.createdAt).toLocaleString(undefined, {
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              })}
            </p>
            <p className="text-foreground whitespace-pre-wrap break-words">{m.body}</p>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      <form onSubmit={send} className="p-4 border-t border-glass-border flex gap-2 bg-elevated/50">
        <textarea
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder="Message the studio…"
          rows={2}
          maxLength={4000}
          className="flex-1 bg-bg border border-border px-4 py-3 text-sm resize-none focus:outline-none focus:border-accent min-h-[52px]"
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              if (!draft.trim() || sending) return;
              void send(e as unknown as React.FormEvent);
            }
          }}
        />
        <Button type="submit" variant="primary" disabled={sending} className="self-end shrink-0 gap-1">
          <Send className="w-4 h-4" />
          Send
        </Button>
      </form>
    </div>
  );
}
