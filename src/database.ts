import fs from 'node:fs';
import path from 'node:path';

import { qExec, qGet, qAll, qRun, getLocalSqlite } from './db/driver';

type DbValue = string | number | null;
type SqlParams = Record<string, DbValue>;

type UserRole = 'admin' | 'staff' | 'client';

export interface UserRow {
  id: string;
  email: string;
  password: string;
  name: string;
  role: UserRole;
}

export interface PortfolioRow {
  id: string;
  title: string;
  slug: string;
  description: string;
  coverImage: string;
  sortOrder: number;
}

export interface ProjectRow {
  id: string;
  title: string;
  category: string;
  description: string;
  images: string;
  portfolioId: string | null;
}

export interface ServiceRow {
  id: string;
  title: string;
  price: string;
  description: string;
}

export interface ClientFileRow {
  id: string;
  userId: string;
  name: string;
  size: string;
  format: string;
  date: string;
  url: string;
  approved: number | null;
  comments: string;
  downloadCount: number;
}

export interface HeroSlideRow {
  id: string;
  title: string;
  subtitle: string;
  image: string;
}

export interface InvoiceRow {
  id: string;
  userId: string;
  serviceId: string;
  amount: number;
  paid: number;
  createdAt: string;
  paidAt: string | null;
}

export interface ReferralRow {
  id: string;
  referrerId: string;
  refereeEmail: string;
  date: string;
  converted: number;
}

export interface BookingRow {
  id: string;
  name: string;
  email: string;
  date: string;
  serviceId: string;
  status: string;
  createdAt: string;
}

export interface SiteLocationRow {
  id: string;
  name: string;
  tag: string;
  description: string;
  image: string;
  sortOrder: number;
}

export interface TestimonialRow {
  id: string;
  quote: string;
  author: string;
  role: string;
  rating: number;
  sortOrder: number;
}

export interface MediaRequestRow {
  id: string;
  clientId: string;
  requestType: 'file' | 'external_link';
  requestDetails: string;
  status: 'open' | 'in_progress' | 'fulfilled' | 'rejected' | 'cancelled';
  assignedAdminId: string | null;
  responseLink: string | null;
  responseNote: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface PageWidgetRow {
  id: string;
  page: 'home' | 'blog';
  postId: string | null;
  type: string;
  title: string;
  content: string;
  sortOrder: number;
  enabled: number;
  createdAt: string;
}

export interface NotificationRow {
  id: string;
  userId: string;
  type: 'comment' | 'approval' | 'request' | 'invoice' | 'booking' | 'mention' | 'system' | 'message';
  title: string;
  body: string;
  read: number;
  link: string | null;
  metadata: string | null;
  createdAt: string;
}

export interface NotificationPreferencesRow {
  userId: string;
  emailEnabled: number;
  pushEnabled: number;
  commentAlerts: number;
  approvalAlerts: number;
  requestAlerts: number;
  mentionAlerts: number;
}

export interface ClientFileWithParsedComments extends Omit<ClientFileRow, 'comments' | 'approved'> {
  comments: Array<{ id: string; userId: string; text: string; date: string }>;
  approved: boolean | null;
}

export interface PortfolioCreateInput {
  id?: string;
  title: string;
  slug: string;
  description: string;
  coverImage: string;
  sortOrder?: number;
}

export interface ProjectCreateInput {
  id?: string;
  title: string;
  category: string;
  description: string;
  images?: string[];
  portfolioId?: string | null;
}

export interface ServiceCreateInput {
  id?: string;
  title: string;
  price: string;
  description: string;
}

export interface ClientFileCreateInput {
  id?: string;
  userId: string;
  name: string;
  size?: string;
  format?: string;
  date?: string;
  url?: string;
  approved?: boolean | null;
  comments?: Array<{ id: string; userId: string; text: string; date: string }>;
  downloadCount?: number;
}

export interface HeroSlideCreateInput {
  id?: string;
  title: string;
  subtitle: string;
  image: string;
}

export interface InvoiceCreateInput {
  id?: string;
  userId: string;
  serviceId: string;
  amount: number;
  paid?: boolean;
  createdAt: string;
  paidAt?: string | null;
}

export interface ReferralCreateInput {
  id?: string;
  referrerId: string;
  refereeEmail: string;
  date: string;
  converted?: boolean;
}

export interface BookingCreateInput {
  id?: string;
  name: string;
  email: string;
  date: string;
  serviceId: string;
  status?: string;
  createdAt: string;
}

export interface MediaRequestCreateInput {
  id?: string;
  clientId: string;
  requestType: 'file' | 'external_link';
  requestDetails: string;
  status?: 'open' | 'in_progress' | 'fulfilled' | 'rejected' | 'cancelled';
  assignedAdminId?: string | null;
  responseLink?: string | null;
  responseNote?: string | null;
  createdAt: string;
  updatedAt: string;
}

// Ensure uploads directory exists
const UPLOAD_DIR = path.join(process.cwd(), 'public', 'uploads');
if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

// Initialize database tables
async function initializeDatabase() {
  // Users table
  await qExec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      name TEXT NOT NULL,
      role TEXT DEFAULT 'client'
    )
  `);

  await qExec(`
    CREATE TABLE IF NOT EXISTS portfolios (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      slug TEXT NOT NULL UNIQUE,
      description TEXT NOT NULL,
      coverImage TEXT NOT NULL,
      sortOrder INTEGER DEFAULT 0
    )
  `);

  // Projects table
  await qExec(`
    CREATE TABLE IF NOT EXISTS projects (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      category TEXT NOT NULL,
      description TEXT,
      images TEXT DEFAULT '[]',
      portfolioId TEXT,
      FOREIGN KEY (portfolioId) REFERENCES portfolios(id)
    )
  `);

  const projectCols = await qAll('PRAGMA table_info(projects)') as Array<{ name: string }>;
  if (!projectCols.some((c) => c.name === 'portfolioId')) {
    await qExec('ALTER TABLE projects ADD COLUMN portfolioId TEXT');
  }

  // Services table
  await qExec(`
    CREATE TABLE IF NOT EXISTS services (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      price TEXT NOT NULL,
      description TEXT
    )
  `);

  // Client files table
  await qExec(`
    CREATE TABLE IF NOT EXISTS client_files (
      id TEXT PRIMARY KEY,
      userId TEXT NOT NULL,
      name TEXT NOT NULL,
      size TEXT,
      format TEXT,
      date TEXT,
      url TEXT,
      approved INTEGER DEFAULT NULL, -- NULL for pending, 1 for approved, 0 for rejected
      comments TEXT DEFAULT '[]', -- JSON array of comment objects
      downloadCount INTEGER DEFAULT 0,
      FOREIGN KEY (userId) REFERENCES users(id)
    )
  `);

  // Hero slides table
  await qExec(`
    CREATE TABLE IF NOT EXISTS hero_slides (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      subtitle TEXT NOT NULL,
      image TEXT
    )
  `);

  // Invoices table
  await qExec(`
    CREATE TABLE IF NOT EXISTS invoices (
      id TEXT PRIMARY KEY,
      userId TEXT NOT NULL,
      serviceId TEXT NOT NULL,
      amount REAL NOT NULL,
      paid INTEGER DEFAULT 0,
      createdAt TEXT NOT NULL,
      paidAt TEXT,
      FOREIGN KEY (userId) REFERENCES users(id),
      FOREIGN KEY (serviceId) REFERENCES services(id)
    )
  `);

  // Referrals table
  await qExec(`
    CREATE TABLE IF NOT EXISTS referrals (
      id TEXT PRIMARY KEY,
      referrerId TEXT NOT NULL,
      refereeEmail TEXT NOT NULL,
      date TEXT NOT NULL,
      converted INTEGER DEFAULT 0,
      FOREIGN KEY (referrerId) REFERENCES users(id)
    )
  `);

  // Bookings table
  await qExec(`
    CREATE TABLE IF NOT EXISTS bookings (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT NOT NULL,
      date TEXT NOT NULL,
      serviceId TEXT NOT NULL,
      status TEXT DEFAULT 'pending',
      createdAt TEXT NOT NULL,
      FOREIGN KEY (serviceId) REFERENCES services(id)
    )
  `);

  await qExec(`
    CREATE TABLE IF NOT EXISTS site_locations (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      tag TEXT NOT NULL,
      description TEXT NOT NULL,
      image TEXT NOT NULL,
      sortOrder INTEGER DEFAULT 0
    )
  `);

  await qExec(`
    CREATE TABLE IF NOT EXISTS testimonials (
      id TEXT PRIMARY KEY,
      quote TEXT NOT NULL,
      author TEXT NOT NULL,
      role TEXT NOT NULL,
      rating INTEGER DEFAULT 5,
      sortOrder INTEGER DEFAULT 0
    )
  `);

  await qExec(`
    CREATE TABLE IF NOT EXISTS notifications (
      id TEXT PRIMARY KEY,
      userId TEXT NOT NULL,
      type TEXT NOT NULL,
      title TEXT NOT NULL,
      body TEXT NOT NULL,
      read INTEGER DEFAULT 0,
      link TEXT,
      metadata TEXT,
      createdAt TEXT NOT NULL,
      FOREIGN KEY (userId) REFERENCES users(id)
    )
  `);

  await qExec(`
    CREATE TABLE IF NOT EXISTS notification_preferences (
      userId TEXT PRIMARY KEY,
      emailEnabled INTEGER DEFAULT 1,
      pushEnabled INTEGER DEFAULT 1,
      commentAlerts INTEGER DEFAULT 1,
      approvalAlerts INTEGER DEFAULT 1,
      requestAlerts INTEGER DEFAULT 1,
      mentionAlerts INTEGER DEFAULT 1,
      FOREIGN KEY (userId) REFERENCES users(id)
    )
  `);

  const userCols = await qAll('PRAGMA table_info(users)') as Array<{ name: string }>;
  if (!userCols.some((c) => c.name === 'staffPermissions')) {
    await qExec(`ALTER TABLE users ADD COLUMN staffPermissions TEXT DEFAULT '{}'`);
  }
  if (!userCols.some((c) => c.name === 'avatarUrl')) {
    await qExec(`ALTER TABLE users ADD COLUMN avatarUrl TEXT`);
  }

  await qExec(`
    CREATE TABLE IF NOT EXISTS contact_submissions (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT NOT NULL,
      message TEXT NOT NULL,
      createdAt TEXT NOT NULL
    )
  `);

  await qExec(`
    CREATE TABLE IF NOT EXISTS blog_posts (
      id TEXT PRIMARY KEY,
      slug TEXT NOT NULL UNIQUE,
      title TEXT NOT NULL,
      excerpt TEXT NOT NULL,
      body TEXT NOT NULL,
      coverImage TEXT,
      authorId TEXT NOT NULL,
      published INTEGER DEFAULT 0,
      publishedAt TEXT,
      createdAt TEXT NOT NULL,
      updatedAt TEXT NOT NULL,
      FOREIGN KEY (authorId) REFERENCES users(id)
    )
  `);

  await qExec(`
    CREATE TABLE IF NOT EXISTS client_messages (
      id TEXT PRIMARY KEY,
      clientId TEXT NOT NULL,
      senderId TEXT NOT NULL,
      senderRole TEXT NOT NULL,
      body TEXT NOT NULL,
      readByClient INTEGER DEFAULT 0,
      readByStaff INTEGER DEFAULT 0,
      createdAt TEXT NOT NULL,
      FOREIGN KEY (clientId) REFERENCES users(id),
      FOREIGN KEY (senderId) REFERENCES users(id)
    )
  `);

  await qExec(`
    CREATE TABLE IF NOT EXISTS page_widgets (
      id TEXT PRIMARY KEY,
      page TEXT NOT NULL,
      postId TEXT,
      type TEXT NOT NULL,
      title TEXT NOT NULL DEFAULT '',
      content TEXT NOT NULL DEFAULT '{}',
      sortOrder INTEGER DEFAULT 0,
      enabled INTEGER DEFAULT 1,
      createdAt TEXT NOT NULL
    )
  `);

  // Client media requests table
  await qExec(`
    CREATE TABLE IF NOT EXISTS media_requests (
      id TEXT PRIMARY KEY,
      clientId TEXT NOT NULL,
      requestType TEXT NOT NULL,
      requestDetails TEXT NOT NULL,
      status TEXT DEFAULT 'open',
      assignedAdminId TEXT,
      responseLink TEXT,
      responseNote TEXT,
      createdAt TEXT NOT NULL,
      updatedAt TEXT NOT NULL,
      FOREIGN KEY (clientId) REFERENCES users(id),
      FOREIGN KEY (assignedAdminId) REFERENCES users(id)
    )
  `);

  // Insert initial data if tables are empty
  const userCount = (await qGet('SELECT COUNT(*) as count FROM users', ) as { count: number }).count;
  if (userCount === 0) {
    const bcrypt = await import('bcryptjs');
    const initialAdminEmail = process.env.INITIAL_ADMIN_EMAIL;
    const initialAdminPassword = process.env.INITIAL_ADMIN_PASSWORD;
    const isProd = process.env.NODE_ENV === 'production';
    const seedDemoData = !isProd || process.env.SEED_DEMO_DATA === 'true';

    if (initialAdminEmail && initialAdminPassword) {
      const hashed = await bcrypt.default.hash(initialAdminPassword, 10);
      await qRun(`
        INSERT INTO users (id, email, password, name, role)
        VALUES (@id, @email, @password, @name, 'admin')
      `, {
        id: randomUUID(),
        email: initialAdminEmail,
        password: hashed,
        name: process.env.INITIAL_ADMIN_NAME || 'Initial Admin'
      });
    } else if (isProd) {
      console.warn('No initial admin credentials configured. Set INITIAL_ADMIN_EMAIL and INITIAL_ADMIN_PASSWORD.');
    }

    if (seedDemoData) {
      console.warn(
        'Demo user accounts are not auto-created. Run `npm run seed` to load users and portfolio from Media/My Pics.'
      );
    }
  }
}

// Export the db and initialize function for use in server.ts
export { getLocalSqlite as db, initializeDatabase };

// Helper functions for JSON fields
function parseJson<T>(jsonString: string): T {
  try {
    return JSON.parse(jsonString) as T;
  } catch (e) {
    return [] as unknown as T;
  }
}

function stringifyJson(obj: unknown) {
  return JSON.stringify(obj);
}

// Database interface
export default {
  // User operations
  getUserByEmail: async (email: string) => {
    return await qGet('SELECT * FROM users WHERE email = ?', [email]) as { 
      id: string; 
      email: string; 
      password: string; 
      name: string; 
      role: string 
    } | undefined;
  },
  
  getUserById: async (id: string) => {
    return await qGet('SELECT * FROM users WHERE id = ?', [id]) as { 
      id: string; 
      email: string; 
      password: string; 
      name: string; 
      role: string 
    } | undefined;
  },
  
  createUser: async (user: {
    email: string;
    password: string;
    name: string;
    role?: string;
    id?: string;
    staffPermissions?: string;
  }) => {
    const id = user.id || randomUUID();
    await qRun(`
      INSERT INTO users (id, email, password, name, role, staffPermissions) 
      VALUES (@id, @email, @password, @name, @role, @staffPermissions)
    `, {
      id,
      email: user.email,
      password: user.password,
      name: user.name,
      role: user.role || 'client',
      staffPermissions: user.staffPermissions || '{}',
    });
    return { id, email: user.email, password: user.password, name: user.name, role: user.role || 'client' };
  },
  
// Project operations
   getProjects: async () => {
     const rows = await qAll('SELECT * FROM projects', ) as ProjectRow[];
     return rows.map(row => ({
       ...row,
       images: parseJson<string[]>(row.images)
     }));
   },
  
getProjectById: async (id: string) => {
     const row = await qGet('SELECT * FROM projects WHERE id = ?', [id]) as ProjectRow | undefined;
     if (!row) return undefined;
     return {
       ...row,
       images: parseJson<string[]>(row.images)
     };
   },
  
  getPortfolios: async () => {
    return await qAll('SELECT * FROM portfolios ORDER BY sortOrder ASC') as PortfolioRow[];
  },

  getPortfolioBySlug: async (slug: string) => {
    return await qGet('SELECT * FROM portfolios WHERE slug = ?', [slug]) as PortfolioRow | undefined;
  },

  getProjectsByPortfolioId: async (portfolioId: string) => {
    const rows = await qAll('SELECT * FROM projects WHERE portfolioId = ?', [portfolioId]) as ProjectRow[];
    return rows.map((row) => ({
      ...row,
      images: parseJson<string[]>(row.images),
    }));
  },

  createPortfolio: async (portfolio: PortfolioCreateInput) => {
    const id = portfolio.id || randomUUID();
    await qRun(`
      INSERT INTO portfolios (id, title, slug, description, coverImage, sortOrder)
      VALUES (@id, @title, @slug, @description, @coverImage, @sortOrder)
    `, {
      id,
      title: portfolio.title,
      slug: portfolio.slug,
      description: portfolio.description,
      coverImage: portfolio.coverImage,
      sortOrder: portfolio.sortOrder ?? 0,
    });
    return { id, ...portfolio };
  },

  getPortfolioById: async (id: string) => {
    return await qGet('SELECT * FROM portfolios WHERE id = ?', [id]) as PortfolioRow | undefined;
  },

  updatePortfolio: async (id: string, updates: Partial<PortfolioCreateInput>) => {
    const fields: string[] = [];
    const values: SqlParams = { id };
    if (updates.title !== undefined) {
      fields.push('title = @title');
      values.title = updates.title;
    }
    if (updates.slug !== undefined) {
      fields.push('slug = @slug');
      values.slug = updates.slug;
    }
    if (updates.description !== undefined) {
      fields.push('description = @description');
      values.description = updates.description;
    }
    if (updates.coverImage !== undefined) {
      fields.push('coverImage = @coverImage');
      values.coverImage = updates.coverImage;
    }
    if (updates.sortOrder !== undefined) {
      fields.push('sortOrder = @sortOrder');
      values.sortOrder = updates.sortOrder;
    }
    if (fields.length === 0) return;
    await qRun(`UPDATE portfolios SET ${fields.join(', ')} WHERE id = @id`, values);
  },

  deletePortfolio: async (id: string) => {
    await qRun('UPDATE projects SET portfolioId = NULL WHERE portfolioId = ?', id);
    await qRun('DELETE FROM portfolios WHERE id = ?', id);
  },

  createProject: async (project: ProjectCreateInput) => {
    const id = project.id || randomUUID();
    await qRun(`
      INSERT INTO projects (id, title, category, description, images, portfolioId) 
      VALUES (@id, @title, @category, @description, @images, @portfolioId)
    `, {
      id,
      title: project.title,
      category: project.category,
      description: project.description,
      images: stringifyJson(project.images || []),
      portfolioId: project.portfolioId ?? null,
    });
    return { id, ...project };
  },
  
  updateProject: async (id: string, updates: { title?: string; category?: string; description?: string; images?: string[]; portfolioId?: string | null }) => {
     const fields = [];
     const values: SqlParams = {};
     
     if ('title' in updates && updates.title !== undefined) {
       fields.push('title = @title');
       values.title = updates.title;
     }
     if ('category' in updates && updates.category !== undefined) {
       fields.push('category = @category');
       values.category = updates.category;
     }
     if ('description' in updates && updates.description !== undefined) {
       fields.push('description = @description');
       values.description = updates.description;
     }
     if ('images' in updates && updates.images !== undefined) {
       fields.push('images = @images');
       values.images = stringifyJson(updates.images);
     }
     if ('portfolioId' in updates) {
       fields.push('portfolioId = @portfolioId');
       values.portfolioId = updates.portfolioId ?? null;
     }
     
     values.id = id;
     
     if (fields.length === 0) return null;
     
     await qRun(`
       UPDATE projects SET ${fields.join(', ')} WHERE id = @id
     `, values);
     
     return await qGet('SELECT * FROM projects WHERE id = ?', [id]) as ProjectRow | undefined;
   },
  
  deleteProject: async (id: string) => {
    await qRun('DELETE FROM projects WHERE id = ?', id);
    return true;
  },

  deleteProjectsByIds: async (ids: string[]) => {
    if (!ids.length) return;
    await qRun(`DELETE FROM projects WHERE id IN (${ids.map(() => '?').join(',')})`, ids);
  },
  
  // Service operations
  getServices: async () => {
    return await qAll('SELECT * FROM services') as ServiceRow[];
  },
  
  getServiceById: async (id: string) => {
    return await qGet('SELECT * FROM services WHERE id = ?', [id]) as ServiceRow | undefined;
  },
  
  createService: async (service: ServiceCreateInput) => {
    const id = service.id || randomUUID();
    await qRun(`
      INSERT INTO services (id, title, price, description) 
      VALUES (@id, @title, @price, @description)
    `, {
      id,
      title: service.title,
      price: service.price,
      description: service.description
    });
    return { id, ...service };
  },
  
   updateService: async (id: string, updates: { title?: string; price?: string; description?: string }) => {
     const fields = [];
     const values: SqlParams = {};
     
     if ('title' in updates && updates.title !== undefined) {
       fields.push('title = @title');
       values.title = updates.title;
     }
     if ('price' in updates && updates.price !== undefined) {
       fields.push('price = @price');
       values.price = updates.price;
     }
     if ('description' in updates && updates.description !== undefined) {
       fields.push('description = @description');
       values.description = updates.description;
     }
     
     values.id = id;
     
     if (fields.length === 0) return null;
     
     await qRun(`
       UPDATE services SET ${fields.join(', ')} WHERE id = @id
     `, values);
     
     return await qGet('SELECT * FROM services WHERE id = ?', [id]) as ServiceRow | undefined;
   },
  
  deleteService: async (id: string) => {
    await qRun('DELETE FROM services WHERE id = ?', id);
    return true;
  },

  deleteServicesByIds: async (ids: string[]) => {
    if (!ids.length) return;
    await qRun(`DELETE FROM services WHERE id IN (${ids.map(() => '?').join(',')})`, ids);
  },
  
  // Client files operations
  getClientFiles: async (userId: string) => {
    const rows = await qAll('SELECT * FROM client_files WHERE userId = ?', [userId]) as ClientFileRow[];
    return rows.map(row => ({
      ...row,
      comments: parseJson<ClientFileWithParsedComments['comments']>(row.comments),
      approved: row.approved === null ? null : row.approved === 1
    }));
  },
  
  getClientFileByIdOnly: async (id: string) => {
    const row = await qGet('SELECT * FROM client_files WHERE id = ?', [id]) as ClientFileRow | undefined;
    if (!row) return undefined;
    return {
      ...row,
      comments: parseJson<ClientFileWithParsedComments['comments']>(row.comments),
      approved: row.approved === null ? null : row.approved === 1,
    } as ClientFileWithParsedComments;
  },

  getClientFileById: async (id: string, userId: string) => {
    const row = await qGet('SELECT * FROM client_files WHERE id = ? AND userId = ?', id, userId) as ClientFileRow | undefined;
    if (!row) return null;
    return {
      ...row,
      comments: parseJson<ClientFileWithParsedComments['comments']>(row.comments),
      approved: row.approved === null ? null : row.approved === 1
    } as ClientFileWithParsedComments;
  },
  
  createClientFile: async (file: ClientFileCreateInput) => {
    const id = file.id || randomUUID();
    await qRun(`
      INSERT INTO client_files (id, userId, name, size, format, date, url, approved, comments, downloadCount) 
      VALUES (@id, @userId, @name, @size, @format, @date, @url, @approved, @comments, @downloadCount)
    `, {
      id,
      userId: file.userId,
      name: file.name,
      size: file.size || '',
      format: file.format || '',
      date: file.date || '',
      url: file.url || '',
      approved: file.approved === true ? 1 : file.approved === false ? 0 : null,
      comments: stringifyJson(file.comments || []),
      downloadCount: file.downloadCount || 0
    });
    return { id, ...file };
  },
  
   updateClientFile: async (
     id: string,
     userId: string,
     updates: {
       name?: string;
       size?: string;
       format?: string;
       date?: string;
       url?: string;
       approved?: boolean | null;
       comments?: ClientFileWithParsedComments['comments'];
       downloadCount?: number;
     }
   ) => {
     const fields = [];
     const values: SqlParams = { id, userId };
     
     if (updates.name !== undefined) {
       fields.push('name = @name');
       values.name = updates.name;
     }
     if (updates.size !== undefined) {
       fields.push('size = @size');
       values.size = updates.size;
     }
     if (updates.format !== undefined) {
       fields.push('format = @format');
       values.format = updates.format;
     }
     if (updates.date !== undefined) {
       fields.push('date = @date');
       values.date = updates.date;
     }
     if (updates.url !== undefined) {
       fields.push('url = @url');
       values.url = updates.url;
     }
     if (updates.approved !== undefined) {
       fields.push('approved = @approved');
       values.approved = updates.approved === true ? 1 : updates.approved === false ? 0 : null;
     }
     if (updates.comments !== undefined) {
       fields.push('comments = @comments');
       values.comments = stringifyJson(updates.comments);
     }
     if (updates.downloadCount !== undefined) {
       fields.push('downloadCount = @downloadCount');
       values.downloadCount = updates.downloadCount;
     }
     
     if (fields.length === 0) return null;
     
     await qRun(`
       UPDATE client_files SET ${fields.join(', ')} WHERE id = @id AND userId = @userId
     `, values);
     
     const row = await qGet('SELECT * FROM client_files WHERE id = ? AND userId = ?', id, userId) as ClientFileRow | undefined;
     if (!row) return null;
     return {
       ...row,
       comments: parseJson<ClientFileWithParsedComments['comments']>(row.comments),
       approved: row.approved === null ? null : row.approved === 1
     } as ClientFileWithParsedComments;
   },
  
  deleteClientFile: async (id: string, userId: string) => {
    await qRun('DELETE FROM client_files WHERE id = ? AND userId = ?', id, userId);
    return true;
  },

  deleteClientFileAdmin: async (id: string) => {
    await qRun('DELETE FROM client_files WHERE id = ?', id);
    return true;
  },

  getClientFilesByUserIdAdmin: async (userId: string) => {
    const rows = await qAll('SELECT * FROM client_files WHERE userId = ?', [userId]) as ClientFileRow[];
    return rows.map(row => ({
      ...row,
      comments: parseJson<ClientFileWithParsedComments['comments']>(row.comments),
      approved: row.approved === null ? null : row.approved === 1
    }));
  },
  
  // Hero slides operations
  getHeroSlides: async () => {
    return await qAll('SELECT * FROM hero_slides') as HeroSlideRow[];
  },
  
  getHeroSlideById: async (id: string) => {
    return await qGet('SELECT * FROM hero_slides WHERE id = ?', [id]) as HeroSlideRow | undefined;
  },
  
  createHeroSlide: async (slide: HeroSlideCreateInput) => {
    const id = slide.id || randomUUID();
    await qRun(`
      INSERT INTO hero_slides (id, title, subtitle, image) 
      VALUES (@id, @title, @subtitle, @image)
    `, {
      id,
      title: slide.title,
      subtitle: slide.subtitle,
      image: slide.image
    });
    return { id, ...slide };
  },
  
   updateHeroSlide: async (id: string, updates: { title?: string; subtitle?: string; image?: string }) => {
     const fields = [];
     const values: SqlParams = { id };
     
     if (updates.title !== undefined) {
       fields.push('title = @title');
       values.title = updates.title;
     }
     if (updates.subtitle !== undefined) {
       fields.push('subtitle = @subtitle');
       values.subtitle = updates.subtitle;
     }
     if (updates.image !== undefined) {
       fields.push('image = @image');
       values.image = updates.image;
     }
     
     if (fields.length === 0) return null;
     
     await qRun(`
       UPDATE hero_slides SET ${fields.join(', ')} WHERE id = @id
     `, values);
     
     return await qGet('SELECT * FROM hero_slides WHERE id = ?', [id]) as HeroSlideRow | undefined;
   },
  
  deleteHeroSlide: async (id: string) => {
    await qRun('DELETE FROM hero_slides WHERE id = ?', id);
    return true;
  },

  deleteHeroSlidesByIds: async (ids: string[]) => {
    if (!ids.length) return;
    await qRun(`DELETE FROM hero_slides WHERE id IN (${ids.map(() => '?').join(',')})`, ids);
  },

  getSiteLocations: async () => {
    return await qAll('SELECT * FROM site_locations ORDER BY sortOrder ASC') as SiteLocationRow[];
  },

  getTestimonials: async () => {
    return await qAll('SELECT * FROM testimonials ORDER BY sortOrder ASC') as TestimonialRow[];
  },
  
  // Invoice operations
  getInvoices: async (userId: string) => {
    return await qAll('SELECT * FROM invoices WHERE userId = ?', [userId]) as InvoiceRow[];
  },
  
  getInvoiceById: async (id: string, userId: string) => {
    return await qGet('SELECT * FROM invoices WHERE id = ? AND userId = ?', id, userId) as InvoiceRow | undefined;
  },
  
  createInvoice: async (invoice: InvoiceCreateInput) => {
    const id = invoice.id || randomUUID();
    await qRun(`
      INSERT INTO invoices (id, userId, serviceId, amount, paid, createdAt, paidAt) 
      VALUES (@id, @userId, @serviceId, @amount, @paid, @createdAt, @paidAt)
    `, {
      id,
      userId: invoice.userId,
      serviceId: invoice.serviceId,
      amount: invoice.amount,
      paid: invoice.paid ? 1 : 0,
      createdAt: invoice.createdAt,
      paidAt: invoice.paidAt || null
    });
    return { id, ...invoice };
  },
  
   updateInvoice: async (id: string, userId: string, updates: { amount?: number; paid?: boolean; paidAt?: string | null }) => {
     const fields = [];
     const values: SqlParams = { id, userId };
     
     if (updates.amount !== undefined) {
       fields.push('amount = @amount');
       values.amount = updates.amount;
     }
     if (updates.paid !== undefined) {
       fields.push('paid = @paid');
       values.paid = updates.paid ? 1 : 0;
     }
     if (updates.paidAt !== undefined) {
       fields.push('paidAt = @paidAt');
       values.paidAt = updates.paidAt;
     }
     
     if (fields.length === 0) return null;
     
     await qRun(`
       UPDATE invoices SET ${fields.join(', ')} WHERE id = @id AND userId = @userId
     `, values);
     
     return await qGet('SELECT * FROM invoices WHERE id = ? AND userId = ?', id, userId) as InvoiceRow | undefined;
   },
  
  // Referral operations
  createReferral: async (referral: ReferralCreateInput) => {
    const id = referral.id || randomUUID();
    await qRun(`
      INSERT INTO referrals (id, referrerId, refereeEmail, date, converted) 
      VALUES (@id, @referrerId, @refereeEmail, @date, @converted)
    `, {
      id,
      referrerId: referral.referrerId,
      refereeEmail: referral.refereeEmail,
      date: referral.date,
      converted: referral.converted ? 1 : 0
    });
    return { id, ...referral };
  },
  
  // Booking operations
  createBooking: async (booking: BookingCreateInput) => {
    const id = booking.id || randomUUID();
    await qRun(`
      INSERT INTO bookings (id, name, email, date, serviceId, status, createdAt) 
      VALUES (@id, @name, @email, @date, @serviceId, @status, @createdAt)
    `, {
      id,
      name: booking.name,
      email: booking.email,
      date: booking.date,
      serviceId: booking.serviceId,
      status: booking.status || 'pending',
      createdAt: booking.createdAt
    });
    return { id, ...booking };
  },

  // Media request operations
  createMediaRequest: async (request: MediaRequestCreateInput) => {
    const id = request.id || randomUUID();
    await qRun(`
      INSERT INTO media_requests (id, clientId, requestType, requestDetails, status, assignedAdminId, responseLink, responseNote, createdAt, updatedAt)
      VALUES (@id, @clientId, @requestType, @requestDetails, @status, @assignedAdminId, @responseLink, @responseNote, @createdAt, @updatedAt)
    `, {
      id,
      clientId: request.clientId,
      requestType: request.requestType,
      requestDetails: request.requestDetails,
      status: request.status || 'open',
      assignedAdminId: request.assignedAdminId || null,
      responseLink: request.responseLink || null,
      responseNote: request.responseNote || null,
      createdAt: request.createdAt,
      updatedAt: request.updatedAt
    });
    return { id, ...request };
  },

  getMediaRequestsByClientId: async (clientId: string) => {
    return await qAll('SELECT * FROM media_requests WHERE clientId = ? ORDER BY createdAt DESC', [clientId]) as MediaRequestRow[];
  },

  getAllMediaRequests: async () => {
    return await qAll('SELECT * FROM media_requests ORDER BY createdAt DESC') as MediaRequestRow[];
  },

  getMediaRequestById: async (id: string) => {
    return await qGet('SELECT * FROM media_requests WHERE id = ?', [id]) as MediaRequestRow | undefined;
  },

  updateMediaRequest: async (
    id: string,
    updates: {
      status?: MediaRequestRow['status'];
      assignedAdminId?: string | null;
      responseLink?: string | null;
      responseNote?: string | null;
      requestDetails?: string;
      updatedAt?: string;
    }
  ) => {
    const fields = [];
    const values: SqlParams = { id };

    if (updates.status !== undefined) {
      fields.push('status = @status');
      values.status = updates.status;
    }
    if (updates.assignedAdminId !== undefined) {
      fields.push('assignedAdminId = @assignedAdminId');
      values.assignedAdminId = updates.assignedAdminId;
    }
    if (updates.responseLink !== undefined) {
      fields.push('responseLink = @responseLink');
      values.responseLink = updates.responseLink;
    }
    if (updates.responseNote !== undefined) {
      fields.push('responseNote = @responseNote');
      values.responseNote = updates.responseNote;
    }
    if (updates.requestDetails !== undefined) {
      fields.push('requestDetails = @requestDetails');
      values.requestDetails = updates.requestDetails;
    }
    fields.push('updatedAt = @updatedAt');
    values.updatedAt = updates.updatedAt || new Date().toISOString();

    await qRun(`UPDATE media_requests SET ${fields.join(', ')} WHERE id = @id`, values);
    return await qGet('SELECT * FROM media_requests WHERE id = ?', [id]) as MediaRequestRow | undefined;
  },

  deleteMediaRequest: async (id: string) => {
    await qRun('DELETE FROM media_requests WHERE id = ?', id);
    return true;
  },

  deleteMediaRequestsByIds: async (ids: string[]) => {
    if (!ids.length) return;
    await qRun(`DELETE FROM media_requests WHERE id IN (${ids.map(() => '?').join(',')})`, ids);
  },
  
   getAllInvoices: async () => {
     return await qAll('SELECT * FROM invoices') as InvoiceRow[];
   },
    
   getUsers: async () => {
     return await qAll('SELECT * FROM users') as UserRow[];
   },
    
   getAllClientFiles: async () => {
     return await qAll('SELECT * FROM client_files') as ClientFileRow[];
   },
   
   getReferrals: async () => {
     return await qAll('SELECT * FROM referrals') as ReferralRow[];
   },
   
   getBookings: async () => {
     return await qAll('SELECT * FROM bookings') as BookingRow[];
   },

   getBookingsByEmail: async (email: string) => {
     return db
       .prepare('SELECT * FROM bookings WHERE LOWER(email) = LOWER(?) ORDER BY date ASC')
       .all(email) as BookingRow[];
   },
   
   getInvoiceByIdAdmin: async (id: string) => {
     return await qGet('SELECT * FROM invoices WHERE id = ?', [id]) as InvoiceRow | undefined;
   },
   updateInvoiceByIdAdmin: async (id: string, updates: { paid?: boolean; paidAt?: string | null }) => {
     const fields = [];
     const values: SqlParams = { id };
     if (updates.paid !== undefined) {
       fields.push('paid = @paid');
       values.paid = updates.paid ? 1 : 0;
     }
     if (updates.paidAt !== undefined) {
       fields.push('paidAt = @paidAt');
       values.paidAt = updates.paidAt;
     }
     if (fields.length === 0) return null;
     await qRun(`UPDATE invoices SET ${fields.join(', ')} WHERE id = @id`, values);
     return await qGet('SELECT * FROM invoices WHERE id = ?', [id]) as InvoiceRow | undefined;
   },

   createNotification: async (notification: {
     id?: string;
     userId: string;
     type: NotificationRow['type'];
     title: string;
     body: string;
     link?: string | null;
     metadata?: Record<string, unknown> | null;
   }) => {
     const id = notification.id || randomUUID();
     const createdAt = new Date().toISOString();
     await qRun(`
       INSERT INTO notifications (id, userId, type, title, body, read, link, metadata, createdAt)
       VALUES (@id, @userId, @type, @title, @body, 0, @link, @metadata, @createdAt)
     `, {
       id,
       userId: notification.userId,
       type: notification.type,
       title: notification.title,
       body: notification.body,
       link: notification.link || null,
       metadata: notification.metadata ? stringifyJson(notification.metadata) : null,
       createdAt,
     });
     return await qGet('SELECT * FROM notifications WHERE id = ?', [id]) as NotificationRow;
   },

   getNotificationsByUserId: async (userId: string, limit = 50) => {
     return db
       .prepare('SELECT * FROM notifications WHERE userId = ? ORDER BY createdAt DESC LIMIT ?')
       .all(userId, limit) as NotificationRow[];
   },

   getUnreadNotificationCount: async (userId: string) => {
     const row = db
       .prepare('SELECT COUNT(*) as count FROM notifications WHERE userId = ? AND read = 0')
       .get(userId) as { count: number };
     return row.count;
   },

   markNotificationRead: async (id: string, userId: string) => {
     await qRun('UPDATE notifications SET read = 1 WHERE id = ? AND userId = ?', id, userId);
     return await qGet('SELECT * FROM notifications WHERE id = ? AND userId = ?', id, userId) as
       | NotificationRow
       | undefined;
   },

   markAllNotificationsRead: async (userId: string) => {
     await qRun('UPDATE notifications SET read = 1 WHERE userId = ?', userId);
     return true;
   },

   deleteNotification: async (id: string, userId: string) => {
     await qRun('DELETE FROM notifications WHERE id = ? AND userId = ?', id, userId);
     return true;
   },

   getNotificationPreferences: async (userId: string) => {
     let row = db
       .prepare('SELECT * FROM notification_preferences WHERE userId = ?')
       .get(userId) as NotificationPreferencesRow | undefined;
     if (!row) {
       await qRun(`
         INSERT INTO notification_preferences (userId, emailEnabled, pushEnabled, commentAlerts, approvalAlerts, requestAlerts, mentionAlerts)
         VALUES (@userId, 1, 1, 1, 1, 1, 1)
       `, { userId });
       row = db
         .prepare('SELECT * FROM notification_preferences WHERE userId = ?')
         .get(userId) as NotificationPreferencesRow;
     }
     return row;
   },

   updateNotificationPreferences: async (
     userId: string,
     updates: Partial<{
       emailEnabled: boolean;
       pushEnabled: boolean;
       commentAlerts: boolean;
       approvalAlerts: boolean;
       requestAlerts: boolean;
       mentionAlerts: boolean;
     }>
   ) => {
     const existingPrefs = db
       .prepare('SELECT * FROM notification_preferences WHERE userId = ?')
       .get(userId) as NotificationPreferencesRow | undefined;
     if (!existingPrefs) {
       await qRun(`
         INSERT INTO notification_preferences (userId, emailEnabled, pushEnabled, commentAlerts, approvalAlerts, requestAlerts, mentionAlerts)
         VALUES (@userId, 1, 1, 1, 1, 1, 1)
       `, { userId });
     }
     const fields: string[] = [];
     const values: SqlParams = { userId };
     if (updates.emailEnabled !== undefined) {
       fields.push('emailEnabled = @emailEnabled');
       values.emailEnabled = updates.emailEnabled ? 1 : 0;
     }
     if (updates.pushEnabled !== undefined) {
       fields.push('pushEnabled = @pushEnabled');
       values.pushEnabled = updates.pushEnabled ? 1 : 0;
     }
     if (updates.commentAlerts !== undefined) {
       fields.push('commentAlerts = @commentAlerts');
       values.commentAlerts = updates.commentAlerts ? 1 : 0;
     }
     if (updates.approvalAlerts !== undefined) {
       fields.push('approvalAlerts = @approvalAlerts');
       values.approvalAlerts = updates.approvalAlerts ? 1 : 0;
     }
     if (updates.requestAlerts !== undefined) {
       fields.push('requestAlerts = @requestAlerts');
       values.requestAlerts = updates.requestAlerts ? 1 : 0;
     }
     if (updates.mentionAlerts !== undefined) {
       fields.push('mentionAlerts = @mentionAlerts');
       values.mentionAlerts = updates.mentionAlerts ? 1 : 0;
     }
     if (fields.length > 0) {
       await qRun(`UPDATE notification_preferences SET ${fields.join(', ')} WHERE userId = @userId`, values);
     }
     return await qGet('SELECT * FROM notification_preferences WHERE userId = ?', [userId]) as NotificationPreferencesRow;
   },

   getAdmins: async () => {
     return await qAll("SELECT id, email, name, role FROM users WHERE role IN ('admin', 'staff')") as Array<{
       id: string;
       email: string;
       name: string;
       role: string;
       staffPermissions?: string;
     }>;
   },

   getStaffUsers: async () => {
     return await qAll("SELECT id, email, name, role, staffPermissions FROM users WHERE role IN ('admin', 'staff')") as Array<{
       id: string;
       email: string;
       name: string;
       role: string;
       staffPermissions: string;
     }>;
   },

   updateUserProfile: async (id: string, updates: { name?: string; email?: string; avatarUrl?: string | null }) => {
     const fields: string[] = [];
     const values: SqlParams = { id };
     if (updates.name) {
       fields.push('name = @name');
       values.name = updates.name;
     }
     if (updates.email) {
       fields.push('email = @email');
       values.email = updates.email;
     }
     if ('avatarUrl' in updates) {
       fields.push('avatarUrl = @avatarUrl');
       values.avatarUrl = updates.avatarUrl ?? null;
     }
     if (fields.length === 0) return;
     await qRun(`UPDATE users SET ${fields.join(', ')} WHERE id = @id`, values);
   },

   createContactSubmission: async (row: { id: string; name: string; email: string; message: string; createdAt: string }) => {
     await qRun(`
       INSERT INTO contact_submissions (id, name, email, message, createdAt)
       VALUES (@id, @name, @email, @message, @createdAt)
     `, row);
   },

   updateUserPassword: async (id: string, hashed: string) => {
     await qRun('UPDATE users SET password = ? WHERE id = ?', hashed, id);
   },

   deleteUsersByIds: async (ids: string[]) => {
     if (ids.length === 0) return;
     const placeholders = ids.map(() => '?').join(',');
     await qRun(`DELETE FROM users WHERE id IN (${placeholders}) AND role != 'admin'`, ids);
   },

   getBlogPosts: async (publishedOnly = false) => {
     const q = publishedOnly
       ? `SELECT bp.*, u.name as authorName FROM blog_posts bp JOIN users u ON u.id = bp.authorId WHERE bp.published = 1 ORDER BY bp.publishedAt DESC`
       : `SELECT bp.*, u.name as authorName FROM blog_posts bp JOIN users u ON u.id = bp.authorId ORDER BY bp.updatedAt DESC`;
     return await qAll(q) as Array<Record<string, unknown>>;
   },

   getBlogPostBySlug: async (slug: string) => {
     return await qGet(
       `SELECT bp.*, u.name as authorName FROM blog_posts bp JOIN users u ON u.id = bp.authorId WHERE bp.slug = ?`
     , slug) as Record<string, unknown> | undefined;
   },

   getBlogPostById: async (id: string) => {
     return await qGet('SELECT * FROM blog_posts WHERE id = ?', [id]) as Record<string, unknown> | undefined;
   },

   createBlogPost: async (post: {
     id: string;
     slug: string;
     title: string;
     excerpt: string;
     body: string;
     coverImage?: string;
     authorId: string;
     published?: boolean;
   }) => {
     const now = new Date().toISOString();
     await qRun(`
       INSERT INTO blog_posts (id, slug, title, excerpt, body, coverImage, authorId, published, publishedAt, createdAt, updatedAt)
       VALUES (@id, @slug, @title, @excerpt, @body, @coverImage, @authorId, @published, @publishedAt, @createdAt, @updatedAt)
     `, {
       id: post.id,
       slug: post.slug,
       title: post.title,
       excerpt: post.excerpt,
       body: post.body,
       coverImage: post.coverImage || '',
       authorId: post.authorId,
       published: post.published ? 1 : 0,
       publishedAt: post.published ? now : null,
       createdAt: now,
       updatedAt: now,
     });
   },

   updateBlogPost: async (
     id: string,
     updates: Partial<{
       slug: string;
       title: string;
       excerpt: string;
       body: string;
       coverImage: string;
       published: boolean;
     }>
   ) => {
     const fields: string[] = ['updatedAt = @updatedAt'];
     const values: SqlParams = { id, updatedAt: new Date().toISOString() };
     if (updates.slug) {
       fields.push('slug = @slug');
       values.slug = updates.slug;
     }
     if (updates.title) {
       fields.push('title = @title');
       values.title = updates.title;
     }
     if (updates.excerpt) {
       fields.push('excerpt = @excerpt');
       values.excerpt = updates.excerpt;
     }
     if (updates.body) {
       fields.push('body = @body');
       values.body = updates.body;
     }
     if (updates.coverImage !== undefined) {
       fields.push('coverImage = @coverImage');
       values.coverImage = updates.coverImage;
     }
     if (updates.published !== undefined) {
       fields.push('published = @published');
       values.published = updates.published ? 1 : 0;
       if (updates.published) {
         fields.push('publishedAt = @publishedAt');
         values.publishedAt = new Date().toISOString();
       }
     }
     await qRun(`UPDATE blog_posts SET ${fields.join(', ')} WHERE id = @id`, values);
   },

   deleteBlogPost: async (id: string) => {
     await qRun('DELETE FROM blog_posts WHERE id = ?', id);
   },

   deleteBlogPostsByIds: async (ids: string[]) => {
     if (ids.length === 0) return;
     const placeholders = ids.map(() => '?').join(',');
     await qRun(`DELETE FROM blog_posts WHERE id IN (${placeholders})`, ids);
   },

   getClientMessages: async (clientId: string) => {
     return await qAll(
       'SELECT * FROM client_messages WHERE clientId = ? ORDER BY createdAt ASC'
     , [clientId]) as Array<{
       id: string;
       clientId: string;
       senderId: string;
       senderRole: string;
       body: string;
       readByClient: number;
       readByStaff: number;
       createdAt: string;
     }>;
   },

   createClientMessage: async (msg: {
     id: string;
     clientId: string;
     senderId: string;
     senderRole: string;
     body: string;
   }) => {
     await qRun(`
       INSERT INTO client_messages (id, clientId, senderId, senderRole, body, readByClient, readByStaff, createdAt)
       VALUES (@id, @clientId, @senderId, @senderRole, @body, @readByClient, @readByStaff, @createdAt)
     `, {
       id: msg.id,
       clientId: msg.clientId,
       senderId: msg.senderId,
       senderRole: msg.senderRole,
       body: msg.body,
       readByClient: msg.senderRole === 'client' ? 1 : 0,
       readByStaff: msg.senderRole !== 'client' ? 1 : 0,
       createdAt: new Date().toISOString(),
     });
   },

   markMessagesReadByClient: async (clientId: string) => {
     await qRun('UPDATE client_messages SET readByClient = 1 WHERE clientId = ? AND senderRole != ?', 
       clientId,
       'client'
     );
   },

   markMessagesReadByStaff: async (clientId: string) => {
     await qRun('UPDATE client_messages SET readByStaff = 1 WHERE clientId = ? AND senderRole = ?', 
       clientId,
       'client'
     );
   },

   getAdminInbox: async () => {
     return await qAll(`
       SELECT u.id, u.name, u.email,
         (SELECT body FROM client_messages WHERE clientId = u.id ORDER BY createdAt DESC LIMIT 1) as lastMessage,
         (SELECT createdAt FROM client_messages WHERE clientId = u.id ORDER BY createdAt DESC LIMIT 1) as lastMessageAt,
         (SELECT COUNT(*) FROM client_messages WHERE clientId = u.id AND readByStaff = 0 AND senderRole = 'client') as unread
       FROM users u WHERE u.role = 'client'
       ORDER BY COALESCE(lastMessageAt, '') DESC
     `) as Array<{
       id: string;
       name: string;
       email: string;
       lastMessage: string | null;
       lastMessageAt: string | null;
       unread: number;
     }>;
   },

   getPageWidgets: async (page: 'home' | 'blog', postId?: string | null) => {
     if (postId) {
       return await qAll(
         'SELECT * FROM page_widgets WHERE page = ? AND postId = ? AND enabled = 1 ORDER BY sortOrder ASC, createdAt ASC'
       , [page, postId]) as PageWidgetRow[];
     }
     return await qAll(
       'SELECT * FROM page_widgets WHERE page = ? AND postId IS NULL AND enabled = 1 ORDER BY sortOrder ASC, createdAt ASC'
     , [page]) as PageWidgetRow[];
   },

   getAllPageWidgets: async (page?: 'home' | 'blog') => {
     if (page) {
       return await qAll(
         'SELECT * FROM page_widgets WHERE page = ? ORDER BY sortOrder ASC, createdAt ASC'
       , [page]) as PageWidgetRow[];
     }
     return await qAll(
       'SELECT * FROM page_widgets ORDER BY page ASC, sortOrder ASC, createdAt ASC'
     ) as PageWidgetRow[];
   },

   getPageWidgetById: async (id: string) => {
     return await qGet('SELECT * FROM page_widgets WHERE id = ?', [id]) as PageWidgetRow | undefined;
   },

   createPageWidget: async (widget: {
     id?: string;
     page: 'home' | 'blog';
     postId?: string | null;
     type: string;
     title?: string;
     content?: string;
     sortOrder?: number;
     enabled?: boolean;
   }) => {
     const id = widget.id || randomUUID();
     await qRun(`
       INSERT INTO page_widgets (id, page, postId, type, title, content, sortOrder, enabled, createdAt)
       VALUES (@id, @page, @postId, @type, @title, @content, @sortOrder, @enabled, @createdAt)
     `, {
       id,
       page: widget.page,
       postId: widget.postId ?? null,
       type: widget.type,
       title: widget.title ?? '',
       content: widget.content ?? '{}',
       sortOrder: widget.sortOrder ?? 0,
       enabled: widget.enabled !== false ? 1 : 0,
       createdAt: new Date().toISOString(),
     });
     return id;
   },

   updatePageWidget: async (
     id: string,
     updates: Partial<{
       type: string;
       title: string;
       content: string;
       sortOrder: number;
       enabled: boolean;
       postId: string | null;
     }>
   ) => {
     const fields: string[] = [];
     const values: SqlParams = { id };
     if (updates.type !== undefined) {
       fields.push('type = @type');
       values.type = updates.type;
     }
     if (updates.title !== undefined) {
       fields.push('title = @title');
       values.title = updates.title;
     }
     if (updates.content !== undefined) {
       fields.push('content = @content');
       values.content = updates.content;
     }
     if (updates.sortOrder !== undefined) {
       fields.push('sortOrder = @sortOrder');
       values.sortOrder = updates.sortOrder;
     }
     if (updates.enabled !== undefined) {
       fields.push('enabled = @enabled');
       values.enabled = updates.enabled ? 1 : 0;
     }
     if (updates.postId !== undefined) {
       fields.push('postId = @postId');
       values.postId = updates.postId;
     }
     if (fields.length === 0) return;
     await qRun(`UPDATE page_widgets SET ${fields.join(', ')} WHERE id = @id`, values);
   },

   deletePageWidget: async (id: string) => {
     await qRun('DELETE FROM page_widgets WHERE id = ?', id);
   },

   deleteAllContent: async () => {
     await qExec(`
       DELETE FROM client_files;
       DELETE FROM client_messages;
       DELETE FROM media_requests;
       DELETE FROM notifications;
       DELETE FROM notification_preferences;
       DELETE FROM invoices;
       DELETE FROM bookings;
       DELETE FROM referrals;
       DELETE FROM projects;
       DELETE FROM blog_posts;
       DELETE FROM portfolios;
       DELETE FROM hero_slides;
       DELETE FROM services;
       DELETE FROM site_locations;
       DELETE FROM testimonials;
       DELETE FROM page_widgets;
       DELETE FROM contact_submissions;
     `);
   },
};
