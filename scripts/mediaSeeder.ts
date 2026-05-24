/**
 * @deprecated Use `npm run seed` or `npm run seed:force` instead.
 * This entry point delegates to the unified seed pipeline.
 */
import dotenv from 'dotenv';
import { initializeDatabase } from '../src/database';
import { clearSeedContent, seedFromMedia } from './lib/seedFromMedia';

dotenv.config();

async function main() {
  await initializeDatabase();
  clearSeedContent();
  await seedFromMedia();
  console.log('mediaSeeder.ts finished (use npm run seed going forward).');
}

main().catch((error) => {
  console.error('Failed:', error);
  process.exit(1);
});
