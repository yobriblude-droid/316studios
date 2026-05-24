/**
 * Create or reset an admin account (use on your API host after deploy).
 *
 * Usage:
 *   npm run create-admin -- admin@yourdomain.com "YourSecurePassword"
 *
 * Or set INITIAL_ADMIN_EMAIL and INITIAL_ADMIN_PASSWORD in .env and run:
 *   npm run create-admin
 */
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import { randomUUID } from 'crypto';
import database, { getLocalSqlite, initializeDatabase } from '../src/database';

dotenv.config();

async function main() {
  const email = process.argv[2] || process.env.INITIAL_ADMIN_EMAIL;
  const password = process.argv[3] || process.env.INITIAL_ADMIN_PASSWORD;
  const name = process.env.INITIAL_ADMIN_NAME || 'Admin';

  if (!email || !password) {
    console.error(
      'Missing credentials.\n' +
        '  npm run create-admin -- you@domain.com "password"\n' +
        '  or set INITIAL_ADMIN_EMAIL and INITIAL_ADMIN_PASSWORD in .env'
    );
    process.exit(1);
  }

  if (password.length < 8) {
    console.error('Password must be at least 8 characters.');
    process.exit(1);
  }

  await initializeDatabase();

  const hashed = await bcrypt.hash(password, 10);
  const existing = await database.getUserByEmail(email);

  if (existing) {
    const sqlite = getLocalSqlite();
    sqlite.prepare('UPDATE users SET password = ?, role = ?, name = ? WHERE id = ?').run(
      hashed,
      'admin',
      name,
      existing.id
    );
    console.log(`Admin updated: ${email}`);
  } else {
    await database.createUser({
      id: randomUUID(),
      email,
      password: hashed,
      name,
      role: 'admin',
    });
    console.log(`Admin created: ${email}`);
  }

  console.log('Sign in at: /admin/login on your deployed site.');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
