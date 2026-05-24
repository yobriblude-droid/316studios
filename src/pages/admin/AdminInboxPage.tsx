import React, { useCallback, useEffect, useRef, useState } from 'react';
import { AdminPageHeader } from '../../components/admin';
import { apiFetch } from '../../lib/api';
import { Button } from '../../components/ui/Button';
import { cn } from '../../lib/utils';
import { useMessagePoll } from '../../hooks/use-message-poll';
import { Send } from 'lucide-react';

type InboxRow = {
  id: string;
  name: string;
  email: string;
  lastMessage: string | null;
  lastMessageAt: string | null;
  unread: number;
};

type Message = {
  id: string;
  senderRole: string;
  body: string;
  createdAt: string;
};

export default function AdminInboxPage() {
  const [clients, setClients] = useState<InboxRow[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [draft, setDraft] = useState('');
  const [sending, setSending] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  const loadInbox = useCallback(() => {
    return apiFetch('/api/admin/inbox')
      .then((r) => r.json())
      .then(setClients);
  }, []);

  const loadThread = useCallback(() => {
    if (!selectedId) return Promise.resolve();
    return apiFetch(`/api/admin/messages/${selectedId}`)
      .then((r) => r.json())
      .then(setMessages);
  }, [selectedId]);

  useEffect(() => {
    loadInbox();
  }, [loadInbox]);

  useEffect(() => {
    loadThread();
  }, [loadThread]);

  useMessagePoll(() => {
    void loadInbox();
    void loadThread();
  }, 4000);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages.length, selectedId]);

  const send = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedId || !draft.trim() || sending) return;
    setSending(true);
    try {
      await apiFetch(`/api/admin/messages/${selectedId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ body: draft.trim() }),
      });
      setDraft('');
      await loadThread();
      await loadInbox();
    } finally {
      setSending(false);
    }
  };

  const selected = clients.find((c) => c.id === selectedId);

  return (
    <>
      <AdminPageHeader title="Client inbox" description="Real-time threads — one conversation per client." />
      <div className="grid lg:grid-cols-[minmax(240px,280px)_1fr] gap-1 min-h-[520px]">
        <ul className="border border-border overflow-hidden bg-surface divide-y divide-border max-h-[75vh] overflow-y-auto">
          {clients.map((c) => (
            <li key={c.id}>
              <button
                type="button"
                onClick={() => setSelectedId(c.id)}
                className={cn(
                  'w-full text-left p-4 hover:bg-primary-dim transition-colors',
                  selectedId === c.id && 'bg-primary-dim border-l-2 border-l-primary'
                )}
              >
                <div className="flex justify-between gap-2">
                  <p className="font-medium text-sm truncate">{c.name}</p>
                  {c.unread > 0 && (
                    <span className="shrink-0 text-[10px] bg-primary text-white px-1.5 min-w-[1.25rem] text-center">
                      {c.unread}
                    </span>
                  )}
                </div>
                <p className="text-[10px] text-muted truncate">{c.email}</p>
                {c.lastMessage && <p className="text-xs text-muted mt-2 line-clamp-2">{c.lastMessage}</p>}
              </button>
            </li>
          ))}
          {clients.length === 0 && (
            <li className="p-8 text-sm text-muted text-center">No clients yet.</li>
          )}
        </ul>

        <div className="border border-border flex flex-col bg-surface min-h-[520px]">
          {!selected ? (
            <p className="m-auto text-sm text-muted p-8">Select a client</p>
          ) : (
            <>
              <div className="p-4 border-b border-border">
                <p className="font-semibold text-sm">{selected.name}</p>
                <p className="text-xs text-muted">{selected.email}</p>
              </div>
              <div className="flex-1 overflow-y-auto p-4 space-y-3 min-h-[320px]">
                {messages.map((m) => (
                  <div
                    key={m.id}
                    className={cn(
                      'max-w-[88%] px-4 py-2.5 text-sm border',
                      m.senderRole === 'client'
                        ? 'mr-auto bg-elevated border-border'
                        : 'ml-auto bg-primary/15 border-primary/40'
                    )}
                  >
                    <p className="text-[9px] uppercase text-muted mb-1">
                      {m.senderRole} · {new Date(m.createdAt).toLocaleString()}
                    </p>
                    <p className="whitespace-pre-wrap break-words">{m.body}</p>
                  </div>
                ))}
                <div ref={bottomRef} />
              </div>
              <form onSubmit={send} className="p-4 border-t border-border flex gap-2">
                <textarea
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  placeholder="Reply…"
                  rows={2}
                  maxLength={4000}
                  className="flex-1 bg-elevated border border-border px-4 py-3 text-sm resize-none focus:outline-none focus:border-primary"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      void send(e);
                    }
                  }}
                />
                <Button type="submit" variant="primary" disabled={sending} className="self-end shrink-0">
                  <Send className="w-4 h-4" />
                </Button>
              </form>
            </>
          )}
        </div>
      </div>
    </>
  );
}
