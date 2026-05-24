import { db } from '../../src/database';

/** Studio contact and M-Pesa details (also mirrored in src/lib/contact.ts) */
export const STUDIO_CONTACT = {
  email: 'hi316studios@gmail.com',
  phoneLocal: '0729430283',
  phoneDisplay: '0729 430 283',
  phoneE164: '+254729430283',
  whatsappWaMe: '254729430283',
  paybill: '303030',
  paybillAccount: '2056521278',
} as const;

export const STUDIO_SERVICES = [
  {
    id: 'svc-studio',
    title: 'Studio Session',
    price: 'KSh 15,000',
    description:
      '1 hour session\n3 outfit changes\n9 edited photos\nStudio lighting and backdrop setup included',
  },
  {
    id: 'svc-outdoor',
    title: 'Outdoor Session',
    price: 'KSh 25,000',
    description:
      '2 photographers on location\n3 outfit changes\n9 edited photos\nOutdoor locations across Nairobi',
  },
  {
    id: 'svc-couple',
    title: 'Couple Shoot',
    price: 'KSh 30,000',
    description: '3 outfit changes\n9 edited photos\nRomantic and lifestyle couple portraits',
  },
  {
    id: 'svc-engagement',
    title: 'Engagement Shoot',
    price: 'KSh 50,000',
    description:
      '2 photographers\nRaw unedited files shared\n20 edited photos\nPre-wedding and engagement coverage',
  },
  {
    id: 'svc-wedding-half',
    title: 'Wedding Shoot (Half Day)',
    price: 'KSh 60,000',
    description:
      'Half day coverage, 4 to 6 hours\n2 photographers\nRaw unedited files shared\n30 edited photos',
  },
  {
    id: 'svc-wedding-full',
    title: 'Wedding Shoot (Full Day)',
    price: 'KSh 100,000',
    description:
      'Full day coverage, 8 to 12 hours\n2 photographers\nRaw unedited files shared\n50 edited photos',
  },
  {
    id: 'svc-fashion-half',
    title: 'Fashion Shoot (Half Day)',
    price: 'KSh 40,000',
    description: 'Half day on set or location\n30 edited photos\nLookbook and campaign ready deliverables',
  },
  {
    id: 'svc-fashion-full',
    title: 'Fashion Shoot (Full Day)',
    price: 'KSh 60,000',
    description: 'Full day production\n50 edited photos\nEditorial and brand campaign coverage',
  },
] as const;

export function patchServicesOnly(): void {
  db.exec('DELETE FROM services');
  const insert = db.prepare(`
    INSERT INTO services (id, title, price, description)
    VALUES (@id, @title, @price, @description)
  `);
  for (const service of STUDIO_SERVICES) {
    insert.run(service);
  }
  console.log(`  Services replaced: ${STUDIO_SERVICES.length} packages`);
}

export function runSeedPatch(): void {
  console.log('Applying data patch (services only, other content unchanged)…');
  patchServicesOnly();
  console.log('Patch complete.');
  console.log('Contact updated in app config:', STUDIO_CONTACT.email, STUDIO_CONTACT.phoneDisplay);
}
