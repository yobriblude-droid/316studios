import fs from 'fs';
import path from 'path';
import { randomUUID } from 'crypto';
import { db } from '../../src/database';

const MEDIA_ROOT = path.join(process.cwd(), 'Media');
const PHOTOS_DIR = path.join(MEDIA_ROOT, 'My Pics');
const UPLOAD_DIR = path.join(process.cwd(), 'public', 'uploads');
const MIN_PROJECTS = 30;

const IMAGE_EXT = new Set(['.jpg', '.jpeg', '.png', '.gif', '.webp', '.bmp', '.tiff']);

export function toMediaUrl(relativeFromMedia: string): string {
  return `/media/${relativeFromMedia.replace(/\\/g, '/').split('/').map(encodeURIComponent).join('/')}`;
}

function listPhotoFiles(dir: string, base = ''): Array<{ relative: string; absolute: string; name: string }> {
  if (!fs.existsSync(dir)) return [];
  const out: Array<{ relative: string; absolute: string; name: string }> = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const abs = path.join(dir, entry.name);
    const rel = base ? `${base}/${entry.name}` : entry.name;
    if (entry.isDirectory()) {
      out.push(...listPhotoFiles(abs, rel));
    } else if (IMAGE_EXT.has(path.extname(entry.name).toLowerCase())) {
      out.push({ relative: rel, absolute: abs, name: entry.name });
    }
  }
  return out;
}

function fileUrl(file: { relative: string }) {
  return toMediaUrl(`My Pics/${file.relative}`);
}

const PORTFOLIO_DEFS = [
  { id: 'pf-portraits', title: 'Portrait Studies', slug: 'portraits', description: 'Intimate portraits and headshots from the 316 Studios archive.' },
  { id: 'pf-weddings', title: 'Weddings & Celebrations', slug: 'weddings', description: 'Ceremonies, receptions, and destination wedding coverage.' },
  { id: 'pf-corporate', title: 'Corporate & Brand', slug: 'corporate', description: 'Executive profiles, team photography, and brand campaigns.' },
  { id: 'pf-fashion', title: 'Fashion & Editorial', slug: 'fashion', description: 'Runway, lookbooks, and editorial fashion stories.' },
  { id: 'pf-family', title: 'Family & Generations', slug: 'family', description: 'Family sessions and generational portrait work.' },
  { id: 'pf-lifestyle', title: 'Lifestyle & Campaigns', slug: 'lifestyle', description: 'Authentic lifestyle imagery for brands and individuals.' },
  { id: 'pf-events', title: 'Events & Gatherings', slug: 'events', description: 'Corporate events, launches, and social celebrations.' },
  { id: 'pf-documentary', title: 'Documentary & Street', slug: 'documentary', description: 'Candid Nairobi stories and documentary series.' },
] as const;

/** 36 distinct projects — each uses real photos from Media/My Pics (cycled) */
const PROJECT_BLUEPRINTS: Array<{
  title: string;
  category: string;
  description: string;
  portfolioId: string;
  imageCount: 1 | 2 | 3;
}> = [
  { title: 'Karen Golden Hour Portrait', category: 'Portraits', description: 'Soft evening light in Karen.', portfolioId: 'pf-portraits', imageCount: 2 },
  { title: 'Studio Headshot Series I', category: 'Portraits', description: 'Controlled studio lighting for professional profiles.', portfolioId: 'pf-portraits', imageCount: 3 },
  { title: 'CBD Executive Portraits', category: 'Corporate', description: 'Corporate headshots in Nairobi CBD.', portfolioId: 'pf-corporate', imageCount: 2 },
  { title: 'LinkedIn Profile Collection', category: 'Corporate', description: 'Business-ready portraits for digital presence.', portfolioId: 'pf-corporate', imageCount: 1 },
  { title: 'Maasai Mara Ceremony', category: 'Weddings', description: 'Destination wedding under the African sky.', portfolioId: 'pf-weddings', imageCount: 3 },
  { title: 'Garden Reception Highlights', category: 'Weddings', description: 'Reception moments and candid celebration frames.', portfolioId: 'pf-weddings', imageCount: 2 },
  { title: 'Westlands Fashion Editorial', category: 'Fashion', description: 'Editorial frames from a runway-inspired shoot.', portfolioId: 'pf-fashion', imageCount: 2 },
  { title: 'Campaign Lookbook 01', category: 'Fashion', description: 'Lookbook sequence for a local brand.', portfolioId: 'pf-fashion', imageCount: 3 },
  { title: 'Generational Family Portrait', category: 'Family', description: 'Multi-generation family session in Nairobi.', portfolioId: 'pf-family', imageCount: 2 },
  { title: 'Holiday Family Session', category: 'Family', description: 'Warm family portraits delivered via client portal.', portfolioId: 'pf-family', imageCount: 2 },
  { title: 'Lifestyle Brand Story', category: 'Lifestyle', description: 'Brand narrative through lifestyle frames.', portfolioId: 'pf-lifestyle', imageCount: 2 },
  { title: 'Outdoor Lifestyle Session', category: 'Lifestyle', description: 'Natural outdoor lifestyle photography.', portfolioId: 'pf-lifestyle', imageCount: 1 },
  { title: 'Product Launch Event', category: 'Events', description: 'Launch event coverage with candid highlights.', portfolioId: 'pf-events', imageCount: 2 },
  { title: 'Corporate Gala Evening', category: 'Events', description: 'Formal event documentation and portraits.', portfolioId: 'pf-events', imageCount: 2 },
  { title: 'Nairobi Street Documentary', category: 'Documentary', description: 'Urban life and street narratives.', portfolioId: 'pf-documentary', imageCount: 3 },
  { title: 'City Stories Series', category: 'Documentary', description: 'Candid documentary from central Nairobi.', portfolioId: 'pf-documentary', imageCount: 2 },
  { title: 'DSC Studio Session A', category: 'Portraits', description: 'Studio portrait batch — DSC series.', portfolioId: 'pf-portraits', imageCount: 2 },
  { title: 'DSC Studio Session B', category: 'Portraits', description: 'Fine-art studio portraits with retouching.', portfolioId: 'pf-portraits', imageCount: 1 },
  { title: 'MG Portrait Collection I', category: 'Portraits', description: 'Classic MG portrait archive selection.', portfolioId: 'pf-portraits', imageCount: 3 },
  { title: 'MG Portrait Collection II', category: 'Portraits', description: 'Additional MG series frames.', portfolioId: 'pf-portraits', imageCount: 2 },
  { title: 'February 2022 Session', category: 'Portraits', description: 'On-location portraits, February 2022.', portfolioId: 'pf-portraits', imageCount: 2 },
  { title: 'Mid-February Editorial', category: 'Fashion', description: 'Editorial portrait work, February session.', portfolioId: 'pf-fashion', imageCount: 1 },
  { title: 'Spring 2023 Outdoor', category: 'Lifestyle', description: 'May 2023 outdoor lifestyle session.', portfolioId: 'pf-lifestyle', imageCount: 2 },
  { title: 'November Portrait Batch', category: 'Portraits', description: 'Late-year portrait collection.', portfolioId: 'pf-portraits', imageCount: 1 },
  { title: 'December Family Portraits', category: 'Family', description: 'December family session highlights.', portfolioId: 'pf-family', imageCount: 2 },
  { title: 'Summer 2024 Client Session', category: 'Portraits', description: 'July 2024 client deliverables.', portfolioId: 'pf-portraits', imageCount: 2 },
  { title: 'Golden Hour July 2024', category: 'Lifestyle', description: 'Golden-hour outdoor session.', portfolioId: 'pf-lifestyle', imageCount: 2 },
  { title: 'Corporate Profile Day 2024', category: 'Corporate', description: 'Full-day corporate profile shoot.', portfolioId: 'pf-corporate', imageCount: 3 },
  { title: 'Ngong Hills Engagement', category: 'Weddings', description: 'Engagement session with landscape vistas.', portfolioId: 'pf-weddings', imageCount: 2 },
  { title: 'Intimate Ceremony Frames', category: 'Weddings', description: 'Close ceremony moments and details.', portfolioId: 'pf-weddings', imageCount: 1 },
  { title: 'Brand Team Photoshoot', category: 'Corporate', description: 'Team photography for annual report.', portfolioId: 'pf-corporate', imageCount: 2 },
  { title: 'Editorial Monochrome Set', category: 'Fashion', description: 'Monochrome editorial portrait set.', portfolioId: 'pf-fashion', imageCount: 2 },
  { title: 'Children & Family Candid', category: 'Family', description: 'Candid family moments at home and outdoors.', portfolioId: 'pf-family', imageCount: 1 },
  { title: 'Festival Coverage 2023', category: 'Events', description: 'Music and cultural festival highlights.', portfolioId: 'pf-events', imageCount: 2 },
  { title: 'Workshop & Conference', category: 'Events', description: 'Conference speaker and audience coverage.', portfolioId: 'pf-events', imageCount: 1 },
  { title: 'Market Day Documentary', category: 'Documentary', description: 'Documentary frames from local markets.', portfolioId: 'pf-documentary', imageCount: 2 },
  { title: '316 Studios Signature Set', category: 'Documentary', description: 'Signature archive highlights from the studio.', portfolioId: 'pf-documentary', imageCount: 3 },
];

const LOCATION_META = [
  { id: 'loc-karen', name: 'Karen', tag: 'Golden Hour', description: 'Lush gardens and soft evening light for portraits and families.' },
  { id: 'loc-cbd', name: 'Nairobi CBD', tag: 'Urban Energy', description: 'Architectural lines and corporate headshots against the skyline.' },
  { id: 'loc-westlands', name: 'Westlands', tag: 'Fashion & Events', description: 'Editorial lighting for campaigns and event coverage.' },
  { id: 'loc-ngong', name: 'Ngong Hills', tag: 'Epic Landscapes', description: 'Dramatic vistas for weddings and destination sessions.' },
  { id: 'loc-studio', name: '316 Studio', tag: 'Controlled Light', description: 'Professional studio setup for product and portrait work.' },
  { id: 'loc-documentary', name: 'City Stories', tag: 'Documentary', description: 'Candid moments documenting urban life in Nairobi.' },
  { id: 'loc-kilimani', name: 'Kilimani', tag: 'Lifestyle', description: 'Modern residential backdrops for lifestyle campaigns.' },
  { id: 'loc-lavington', name: 'Lavington', tag: 'Private Events', description: 'Elegant venues for intimate celebrations.' },
];

const TESTIMONIAL_ROWS = [
  { quote: '316 Studios captured our wedding with such elegance. Every frame felt timeless and deeply personal.', author: 'Amara & James', role: 'Destination Wedding — Maasai Mara' },
  { quote: 'The corporate headshots elevated our entire brand presence. Professional, efficient, and unmistakably Nairobi.', author: 'David Ochieng', role: 'CEO, TechVentures Africa' },
  { quote: 'Their client portal made receiving our family session files effortless — everything in one secure library.', author: 'The Wanjiku Family', role: 'Portrait Session — Karen' },
  { quote: 'From consultation to delivery, the team understood our vision. The editorial shoot exceeded every expectation.', author: 'Zara Collections', role: 'Fashion Campaign — Westlands' },
  { quote: 'We booked a full-day corporate session and received consistent, polished imagery across our entire leadership team.', author: 'Nairobi Fintech Group', role: 'Corporate Branding' },
  { quote: 'The documentary series for our NGO campaign was powerful, authentic, and beautifully edited.', author: 'Hope Initiative Kenya', role: 'Documentary Project' },
  { quote: 'Our product launch event was covered flawlessly — every key moment was captured without us noticing the crew.', author: 'Savanna Brands', role: 'Event Coverage' },
  { quote: 'Repeat client for three years. 316 Studios is our go-to for portraits, events, and campaign work.', author: 'Michelle Adhiambo', role: 'Lifestyle & Portrait Client' },
];

const SERVICES = [
  { id: 's1', title: 'Standard Portrait Session', price: 'KSh 15,000', description: '1-hour studio or outdoor session. Includes 15 retouched images.' },
  { id: 's2', title: 'Corporate Branding Profile', price: 'KSh 25,000', description: '2-hour location shoot. Perfect for business websites and LinkedIn.' },
  { id: 's3', title: 'Full Day Wedding Package', price: 'KSh 150,000', description: '10 hours of coverage, 2 photographers, online gallery.' },
  { id: 's4', title: 'Half-Day Event Coverage', price: 'KSh 45,000', description: '4 hours of event photography with 50 edited deliverables.' },
  { id: 's5', title: 'Fashion Editorial Package', price: 'KSh 60,000', description: 'Half-day editorial shoot with styling consultation.' },
  { id: 's6', title: 'Family Session Deluxe', price: 'KSh 20,000', description: '90-minute session, 25 retouched images, online gallery.' },
  { id: 's7', title: 'Product Photography', price: 'KSh 18,000', description: 'Studio product shots for e-commerce and catalogs.' },
  { id: 's8', title: 'Documentary Mini-Series', price: 'KSh 80,000', description: 'Multi-day documentary coverage with story editing.' },
];

function formatSize(bytes: number): string {
  if (bytes >= 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  return `${Math.max(1, Math.round(bytes / 1024))} KB`;
}

export function clearSeedContent(): void {
  db.exec(`
    DELETE FROM client_files;
    DELETE FROM media_requests;
    DELETE FROM projects;
    DELETE FROM portfolios;
    DELETE FROM hero_slides;
    DELETE FROM services;
    DELETE FROM site_locations;
    DELETE FROM testimonials;
  `);
  console.log('Cleared portfolios, projects, locations, testimonials, and client files.');
}

export function needsMediaSeed(): boolean {
  const projectCount = (db.prepare('SELECT COUNT(*) as count FROM projects').get() as { count: number }).count;
  if (projectCount < MIN_PROJECTS) return true;
  const bad = db.prepare(`SELECT COUNT(*) as count FROM projects WHERE images LIKE '%unsplash%'`).get() as { count: number };
  if (bad.count > 0) return true;
  const portfolioCount = (db.prepare('SELECT COUNT(*) as count FROM portfolios').get() as { count: number }).count;
  if (portfolioCount === 0) return true;
  const emptyHero = db.prepare(`SELECT COUNT(*) as count FROM hero_slides WHERE image IS NULL OR image = ''`).get() as { count: number };
  if (emptyHero.count > 0) return true;
  return false;
}

async function ensureUsers(): Promise<{ clientId: string }> {
  const bcrypt = await import('bcryptjs');
  const upsert = db.prepare(`
    INSERT INTO users (id, email, password, name, role)
    VALUES (@id, @email, @password, @name, @role)
    ON CONFLICT(email) DO UPDATE SET password = excluded.password, name = excluded.name, role = excluded.role
  `);
  upsert.run({
    id: 'admin1',
    email: 'admin@316studios.co.ke',
    password: await bcrypt.default.hash('admin123', 10),
    name: 'Admin User',
    role: 'admin',
  });
  upsert.run({
    id: 'user123',
    email: 'client@example.com',
    password: await bcrypt.default.hash('client123', 10),
    name: 'John Doe',
    role: 'client',
  });
  return { clientId: 'user123' };
}

function copyToUploads(sourceAbs: string, destName: string): string {
  if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR, { recursive: true });
  const dest = path.join(UPLOAD_DIR, destName);
  if (!fs.existsSync(dest)) fs.copyFileSync(sourceAbs, dest);
  return `/uploads/${destName}`;
}

type PhotoFile = { relative: string; absolute: string; name: string };

function pickImages(files: PhotoFile[], start: number, count: number): string[] {
  const urls: string[] = [];
  for (let i = 0; i < count; i++) {
    const file = files[(start + i) % files.length];
    urls.push(fileUrl(file));
  }
  return urls;
}

export async function seedFromMedia(): Promise<void> {
  if (!fs.existsSync(PHOTOS_DIR)) {
    throw new Error(`Photo library not found: ${PHOTOS_DIR}`);
  }

  const files = listPhotoFiles(PHOTOS_DIR, 'My Pics');
  if (files.length === 0) {
    throw new Error('No images found in Media/My Pics');
  }

  console.log(`Found ${files.length} studio photos in Media/My Pics`);

  const { clientId } = await ensureUsers();

  const portfolioCovers = new Map<string, string>();

  for (let i = 0; i < PORTFOLIO_DEFS.length; i++) {
    const pf = PORTFOLIO_DEFS[i];
    const cover = fileUrl(files[i % files.length]);
    portfolioCovers.set(pf.id, cover);
    db.prepare(`
      INSERT INTO portfolios (id, title, slug, description, coverImage, sortOrder)
      VALUES (@id, @title, @slug, @description, @coverImage, @sortOrder)
    `).run({
      ...pf,
      coverImage: cover,
      sortOrder: i,
    });
  }
  console.log(`  Portfolios: ${PORTFOLIO_DEFS.length}`);

  let projectIndex = 0;
  for (const blueprint of PROJECT_BLUEPRINTS) {
    const images = pickImages(files, projectIndex, blueprint.imageCount);
    projectIndex += 1;

    db.prepare(`
      INSERT INTO projects (id, title, category, description, images, portfolioId)
      VALUES (@id, @title, @category, @description, @images, @portfolioId)
    `).run({
      id: randomUUID(),
      title: blueprint.title,
      category: blueprint.category,
      description: blueprint.description,
      images: JSON.stringify(images),
      portfolioId: blueprint.portfolioId,
    });
  }
  console.log(`  Projects: ${PROJECT_BLUEPRINTS.length}`);

  const heroTitles = [
    { title: "Nairobi's Finest", subtitle: 'Crafting timeless human moments.' },
    { title: 'Studio Sessions', subtitle: 'Book your corporate profile today.' },
    { title: 'Portrait Stories', subtitle: 'From the 316 Studios archive.' },
    { title: 'Weddings & Events', subtitle: 'Coverage across Kenya.' },
    { title: 'Editorial Fashion', subtitle: 'Campaign-ready imagery.' },
  ];
  heroTitles.forEach((slide, i) => {
    const file = files[i % files.length];
    db.prepare(`
      INSERT INTO hero_slides (id, title, subtitle, image)
      VALUES (@id, @title, @subtitle, @image)
    `).run({
      id: `h${i + 1}`,
      ...slide,
      image: fileUrl(file),
    });
  });
  console.log(`  Hero slides: ${heroTitles.length}`);

  for (const service of SERVICES) {
    db.prepare(`
      INSERT OR REPLACE INTO services (id, title, price, description)
      VALUES (@id, @title, @price, @description)
    `).run(service);
  }

  LOCATION_META.forEach((loc, i) => {
    const file = files[i % files.length];
    db.prepare(`
      INSERT INTO site_locations (id, name, tag, description, image, sortOrder)
      VALUES (@id, @name, @tag, @description, @image, @sortOrder)
    `).run({ ...loc, image: fileUrl(file), sortOrder: i });
  });

  TESTIMONIAL_ROWS.forEach((t, i) => {
    db.prepare(`
      INSERT INTO testimonials (id, quote, author, role, rating, sortOrder)
      VALUES (@id, @quote, @author, @role, 5, @sortOrder)
    `).run({ id: `t${i + 1}`, ...t, sortOrder: i });
  });

  const clientDeliverables = files.slice(0, 12);
  for (const file of clientDeliverables) {
    const stat = fs.statSync(file.absolute);
    const safeName = file.name.replace(/\s+/g, '-');
    db.prepare(`
      INSERT INTO client_files (id, userId, name, size, format, date, url, approved, comments, downloadCount)
      VALUES (@id, @userId, @name, @size, @format, @date, @url, NULL, '[]', 0)
    `).run({
      id: randomUUID(),
      userId: clientId,
      name: file.name,
      size: formatSize(stat.size),
      format: path.extname(file.name).replace('.', '').toUpperCase() || 'JPG',
      date: stat.mtime.toISOString().split('T')[0],
      url: copyToUploads(file.absolute, `client-${safeName}`),
    });
  }

  console.log(`  Locations: ${LOCATION_META.length}, Testimonials: ${TESTIMONIAL_ROWS.length}, Client files: ${clientDeliverables.length}`);
}
