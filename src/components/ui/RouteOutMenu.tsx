import React from 'react';
import { Mail, MessageCircle, Phone } from 'lucide-react';
import type { RouteOutContext } from '../../lib/route-out';
import { buildEmailUrl, buildSmsUrl, buildTelUrl, buildWhatsAppUrl } from '../../lib/route-out';
import { STUDIO } from '../../lib/contact';
import { HighlightedButton } from './HighlightedButton';
import { GlassCard } from './GlassCard';

type RouteOutMenuProps = {
  context: RouteOutContext;
  onClose?: () => void;
  compact?: boolean;
};

export function RouteOutMenu({ context, compact }: RouteOutMenuProps) {
  const open = (url: string) => {
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <GlassCard padding={compact ? 'sm' : 'md'} className="space-y-3">
      <p className="text-[10px] uppercase tracking-[0.25em] text-muted">Route out</p>
      <p className="text-xs text-foreground/90 line-clamp-3">{context.body}</p>
      <div className="flex flex-wrap gap-2">
        <HighlightedButton
          variant="route-whatsapp"
          size="sm"
          onClick={() => open(buildWhatsAppUrl(context))}
          aria-label={`Send WhatsApp about ${context.subject}`}
        >
          <MessageCircle className="w-3.5 h-3.5" />
          WhatsApp
        </HighlightedButton>
        <HighlightedButton
          variant="route-phone"
          size="sm"
          onClick={() => open(buildSmsUrl(context))}
          aria-label="Send SMS to studio"
        >
          <Phone className="w-3.5 h-3.5" />
          SMS
        </HighlightedButton>
        <HighlightedButton
          variant="route-phone"
          size="sm"
          onClick={() => open(buildTelUrl())}
          aria-label="Call studio"
        >
          {STUDIO.phoneDisplay}
        </HighlightedButton>
        <HighlightedButton
          variant="route-email"
          size="sm"
          onClick={() => open(buildEmailUrl(context))}
          aria-label="Email studio"
        >
          <Mail className="w-3.5 h-3.5" />
          Email
        </HighlightedButton>
      </div>
    </GlassCard>
  );
}

export default RouteOutMenu;
