import fs from 'fs';

const p = 'src/database.ts';
let s = fs.readFileSync(p, 'utf8');

const start = s.indexOf('export default {');
if (start < 0) throw new Error('export default not found');

const head = s.slice(0, start);
const body = s.slice(start);

const fixedBody = body.replace(/(\n\s+)([a-zA-Z0-9_]+):\s*(async\s*)?\(/g, '$1$2: async (');

fs.writeFileSync(p, head + fixedBody);
console.log('async keywords added');
