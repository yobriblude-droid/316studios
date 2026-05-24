import dotenv from 'dotenv';
import { db, initializeDatabase } from '../src/database';
import { seedUsersOnly } from './lib/seedUsersOnly';
import { runSeedPatch } from './lib/seedPatch';

dotenv.config();

async function main() {
  const force = process.argv.includes('--force');
  const patch = process.argv.includes('--patch');

  console.log('Initializing database schema…');
  await initializeDatabase();

  if (patch) {
    runSeedPatch();
    return;
  }

  const userCount = (db.prepare('SELECT COUNT(*) as count FROM users').get() as { count: number }).count;

  if (force || userCount === 0) {
    console.log(force ? 'Force reseed: users only…' : 'No users — seeding users only…');
    await seedUsersOnly();
    console.log('Seed complete.');
    return;
  }

  console.log('Database has users.');
  console.log('  npm run seed -- --patch   Replace services with latest pricing');
  console.log('  npm run seed -- --force   Wipe and reseed users only');
}

main().catch((error) => {
  console.error('Seed failed:', error);
  process.exit(1);
});
