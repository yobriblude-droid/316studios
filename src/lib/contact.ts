/** Studio contact constants for route-out deep links and public pages */
export const STUDIO = {
  email: 'hi316studios@gmail.com',
  phoneDisplay: '0729 430 283',
  phoneLocal: '0729430283',
  phoneE164: '+254729430283',
  whatsappWaMe: '254729430283',
  paybill: '303030',
  paybillAccount: '2056521278',
  city: 'Nairobi, Kenya',
} as const;

export function whatsAppUrl(text?: string) {
  const base = `https://wa.me/${STUDIO.whatsappWaMe}`;
  return text ? `${base}?text=${encodeURIComponent(text)}` : base;
}

export function telUrl() {
  return `tel:${STUDIO.phoneE164}`;
}
