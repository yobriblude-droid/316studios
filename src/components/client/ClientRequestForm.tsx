import React, { useState } from 'react';
import {
  CLIENT_REQUEST_CATEGORIES,
  formatClientRequestDetails,
  type ClientRequestCategory,
} from '../../lib/client-requests';
import { HighlightedButton } from '../ui/HighlightedButton';
import { Input } from '../ui/Input';

type ClientRequestFormProps = {
  onSubmit: (payload: { category: ClientRequestCategory; message: string; link?: string }) => Promise<void>;
  sending?: boolean;
};

export function ClientRequestForm({ onSubmit, sending }: ClientRequestFormProps) {
  const [category, setCategory] = useState<ClientRequestCategory>('deliverable');
  const [message, setMessage] = useState('');
  const [link, setLink] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;
    const trimmedLink = link.trim();
    await onSubmit({
      category,
      message: message.trim(),
      link: trimmedLink && /^https?:\/\/.+/i.test(trimmedLink) ? trimmedLink : undefined,
    });
    setMessage('');
    setLink('');
  };

  return (
    <form onSubmit={handleSubmit} className="glass-panel-v2 border border-glass-border p-6 md:p-8 space-y-5">
      <div>
        <h2 className="text-lg font-black uppercase tracking-tight">Request from studio</h2>
        <p className="text-xs text-muted mt-1">
          Describe what you need — optional reference link. No file uploads here; use Messages for conversation.
        </p>
      </div>

      <label className="block text-xs uppercase tracking-widest text-muted">
        Category
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value as ClientRequestCategory)}
          className="mt-2 w-full bg-elevated border border-border px-4 py-3 text-sm"
        >
          {CLIENT_REQUEST_CATEGORIES.map((c) => (
            <option key={c.id} value={c.id}>
              {c.label}
            </option>
          ))}
        </select>
      </label>

      <label className="block text-xs uppercase tracking-widest text-muted">
        Details
        <textarea
          required
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          rows={5}
          maxLength={2000}
          placeholder="Describe deliverables, revisions, or questions…"
          className="mt-2 w-full bg-elevated border border-border px-4 py-3 text-sm resize-none focus:outline-none focus:border-accent"
        />
      </label>

      <Input
        label="Reference link (optional)"
        value={link}
        onChange={(e) => setLink(e.target.value)}
        placeholder="https://drive.google.com/…"
      />

      <HighlightedButton type="submit" variant="cta-primary" size="md" disabled={sending || !message.trim()}>
        {sending ? 'Sending…' : 'Submit request'}
      </HighlightedButton>
    </form>
  );
}

export { formatClientRequestDetails };
export default ClientRequestForm;
