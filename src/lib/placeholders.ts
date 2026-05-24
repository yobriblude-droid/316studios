/** Placeholder imagery until final assets are uploaded via admin. */
export const PLACEHOLDER_HERO = [
  { id: 'ph-1', title: '316 Studios', subtitle: 'Commercial & Editorial Photography', image: '' },
  { id: 'ph-2', title: 'Brand Stories', subtitle: 'Nairobi · Kenya · Worldwide', image: '' },
  { id: 'ph-3', title: 'Visual Production', subtitle: 'Portraits · Events · Campaigns', image: '' },
];

export function placeholderGradient(id: string): string {
  const hues = ['220,38,38', '127,29,29', '24,24,27', '185,28,28'];
  const i = id.split('').reduce((a, c) => a + c.charCodeAt(0), 0) % hues.length;
  const h = hues[i];
  const h2 = hues[(i + 1) % hues.length];
  return `linear-gradient(145deg, rgba(${h},0.35) 0%, rgba(${h2},0.12) 45%, rgba(10,10,12,0.95) 100%)`;
}
