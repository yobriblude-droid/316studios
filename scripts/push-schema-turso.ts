/**
 * Push local SQLite schema + data to Turso (run once before first Vercel deploy).
 *
 * Requires: TURSO_DATABASE_URL, TURSO_AUTH_TOKEN, local app.db
 *
 * Usage: npm run vercel:seed-turso
 */
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { createClient } from '@libsql/client';
import { getLocalSqlite } from '../src/db/driver';

dotenv.config();

const url = process.env.TURSO_DATABASE_URL;
const token = process.env.TURSO_AUTH_TOKEN;
const dbPath = process.env.SQLITE_PATH || path.join(process.cwd(), 'app.db');

if (!url || !token) {
  console.error('Set TURSO_DATABASE_URL and TURSO_AUTH_TOKEN in .env');
  process.exit(1);
}

if (!fs.existsSync(dbPath)) {
  console.error(`Local database not found: ${dbPath}. Run npm run seed first.`);
  process.exit(1);
}

async function main() {
  process.env.SQLITE_PATH = dbPath;
  const turso = createClient({ url, authToken: token });

  console.log('Dumping local SQLite via better-sqlite3…');
  const sqlite = getLocalSqlite();
  const tables = sqlite
    .prepare("SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%' ORDER BY name")
    .all() as { name: string }[];

  console.log(`Applying schema + data for ${tables.length} tables to Turso…`);

  await turso.execute('PRAGMA foreign_keys=OFF');

  for (const { name } of tables) {
    const ddlRow = sqlite.prepare("SELECT sql FROM sqlite_master WHERE type='table' AND name=?").get(name) as { sql: string } | undefined;
    if (ddlRow?.sql) {
      try {
        await turso.execute(ddlRow.sql);
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        if (!msg.includes('already exists')) console.warn(`DDL ${name}:`, msg.slice(0, 120));
      }
    }

    const rows = sqlite.prepare(`SELECT * FROM "${name}"`).all() as Record<string, unknown>[];
    for (const row of rows) {
      const cols = Object.keys(row);
      const sql = `INSERT INTO "${name}" (${cols.map((c) => `"${c}"`).join(', ')}) VALUES (${cols.map(() => '?').join(', ')})`;
      try {
        await turso.execute({ sql, args: cols.map((c) => row[c] as string | number | null) });
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        if (msg.includes('UNIQUE constraint')) continue;
        console.warn(`Insert ${name}:`, msg.slice(0, 120));
      }
    }
    console.log(`  ${name}: ${rows.length} rows`);
  }

  await turso.execute('PRAGMA foreign_keys=ON');
  console.log('Turso database ready.');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
