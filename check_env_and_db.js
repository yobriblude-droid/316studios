import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

dotenv.config();

function fail(msg) {
  console.error(msg);
  process.exit(1);
}

if (!process.env.JWT_SECRET || process.env.JWT_SECRET === 'your_jwt_secret_here' || process.env.JWT_SECRET === 'change-me-316studios') {
  fail('JWT_SECRET missing or placeholder. Set it in .env or environment.');
}

const dbFile = path.join(process.cwd(), 'app.db');
if (!fs.existsSync(dbFile)) {
  fail('app.db not found. Run `npm run seed` or start the server once to initialize the database.');
}

console.log('Environment and database checks passed.');
process.exit(0);
