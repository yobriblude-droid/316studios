import fs from 'fs';

const p = 'src/database.ts';
let s = fs.readFileSync(p, 'utf8');

s = s.replace(
  /import Database from 'better-sqlite3';[\s\S]*?const db = new Database\(DB_PATH\);/,
  "import { qExec, qGet, qAll, qRun, getLocalSqlite } from './db/driver';"
);

s = s.replace(
  'export { db, initializeDatabase };',
  'export { getLocalSqlite as db, initializeDatabase };'
);

s = s.replace(/export default \{([\s\S]*)\n\};\s*\n*\/\/ Helper functions/, (match, body) => {
  const asyncBody = body.replace(/(\n\s+)([a-zA-Z0-9_]+):\s*\(/g, '$1$2: async (');
  return `export default {${asyncBody}\n};\n\n// Helper functions`;
});

s = s.replace(/db\.exec\(/g, 'await qExec(');
s = s.replace(/db\.prepare\('PRAGMA table_info\((\w+)\)'\)\.all\(\)/g, "await qAll('PRAGMA table_info($1)')");
s = s.replace(/db\.prepare\(([^;]+?)\)\.run\(([^;]+?)\);/g, 'await qRun($1, $2);');
s = s.replace(/return db\.prepare\(([^;]+?)\)\.get\(([^;]*?)\);/g, 'return await qGet($1, $2);');
s = s.replace(/return db\.prepare\(([^;]+?)\)\.all\(([^;]*?)\);/g, 'return await qAll($1, $2);');
s = s.replace(/const (\w+) = db\.prepare\(([^;]+?)\)\.get\(([^;]*?)\)/g, 'const $1 = await qGet($2, $3)');
s = s.replace(/const (\w+) = db\.prepare\(([^;]+?)\)\.all\(([^;]*?)\)/g, 'const $1 = await qAll($2, $3)');
s = s.replace(/let (\w+) = db\.prepare\(([^;]+?)\)\.all\(([^;]*?)\)/g, 'let $1 = await qAll($2, $3)');
s = s.replace(/db\.prepare\(([^;]+?)\)\.get\(([^;]*?)\)/g, 'await qGet($1, $2)');

fs.writeFileSync(p, s);
console.log('database.ts converted');
