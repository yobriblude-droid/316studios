import bcrypt from 'bcryptjs';
import database, { db } from '../../src/database';

const USERS = [
  {
    id: 'user-admin-316',
    email: 'admin@316studios.co.ke',
    password: 'admin123',
    name: '316 Studios Admin',
    role: 'admin' as const,
  },
  {
    id: 'user-client-demo',
    email: 'client@example.com',
    password: 'client123',
    name: 'Demo Client',
    role: 'client' as const,
  },
  {
    id: 'user-client-acme',
    email: 'acme@brand.co.ke',
    password: 'client123',
    name: 'Acme Brand Ltd',
    role: 'client' as const,
  },
  {
    id: 'user-staff-lead',
    email: 'studio@316studios.co.ke',
    password: 'staff123',
    name: 'Studio Lead',
    role: 'staff' as const,
    staffPermissions: JSON.stringify({
      frontend: true,
      blog: true,
      communications: true,
      uploads: true,
      requests: true,
      billing: true,
      users: true,
    }),
  },
];

export function clearAllSeedData(): void {
  database.deleteAllContent();
  db.prepare('DELETE FROM users').run();
  console.log('Cleared all content and users.');
}

export async function seedUsersOnly(): Promise<void> {
  clearAllSeedData();

  const insert = db.prepare(`
    INSERT INTO users (id, email, password, name, role, staffPermissions)
    VALUES (@id, @email, @password, @name, @role, @staffPermissions)
  `);

  for (const u of USERS) {
    const hashed = await bcrypt.hash(u.password, 10);
    insert.run({
      id: u.id,
      email: u.email,
      password: hashed,
      name: u.name,
      role: u.role,
      staffPermissions:
        'staffPermissions' in u ? (u as { staffPermissions: string }).staffPermissions : '{}',
    });
    console.log(`  ✓ ${u.role}: ${u.email}`);
  }

  console.log('\nUsers-only seed complete. Add hero slides, projects, and widgets via admin.');
  console.log('  Admin: admin@316studios.co.ke / admin123');
  console.log('  Client: client@example.com / client123');
  console.log('  Staff: studio@316studios.co.ke / staff123');
}
