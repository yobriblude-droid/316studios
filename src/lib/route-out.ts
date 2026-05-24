import { STUDIO } from './contact';

export type RouteOutContext = {
  clientName?: string;
  clientEmail?: string;
  subject: string;
  body: string;
};

export function buildWhatsAppUrl(ctx: RouteOutContext): string {
  const text = formatBody(ctx);
  return `https://wa.me/${STUDIO.whatsappWaMe}?text=${encodeURIComponent(text)}`;
}

export function buildSmsUrl(ctx: RouteOutContext): string {
  const body = formatBody(ctx);
  return `sms:${STUDIO.phoneE164}?body=${encodeURIComponent(body)}`;
}

export function buildTelUrl(): string {
  return `tel:${STUDIO.phoneE164}`;
}

export function buildEmailUrl(ctx: RouteOutContext): string {
  const body = formatBody(ctx);
  return `mailto:${STUDIO.email}?subject=${encodeURIComponent(ctx.subject)}&body=${encodeURIComponent(body)}`;
}

function formatBody(ctx: RouteOutContext): string {
  const lines = [
    '316 Studios — Client Library',
    ctx.clientName ? `Client: ${ctx.clientName}${ctx.clientEmail ? ` (${ctx.clientEmail})` : ''}` : '',
    `Subject: ${ctx.subject}`,
    '',
    ctx.body,
  ].filter(Boolean);
  return lines.join('\n');
}

export function restrictedFileContext(
  fileName: string,
  clientName?: string,
  clientEmail?: string
): RouteOutContext {
  return {
    clientName,
    clientEmail,
    subject: `Access request — ${fileName}`,
    body: `I would like to discuss access to this restricted deliverable: ${fileName}.`,
  };
}

export function mediaRequestContext(
  requestType: string,
  details: string,
  status: string,
  clientName?: string,
  clientEmail?: string
): RouteOutContext {
  return {
    clientName,
    clientEmail,
    subject: 'Media Request',
    body: `Type: ${requestType}\nDetails: ${details}\nStatus: ${status}`,
  };
}
