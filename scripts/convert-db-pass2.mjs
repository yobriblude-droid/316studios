import fs from 'fs';

const p = 'src/database.ts';
let s = fs.readFileSync(p, 'utf8');

s = s.replace(/await qGet\(([^,]+),\s*([a-zA-Z_][a-zA-Z0-9_]*)\)/g, 'await qGet($1, [$2])');
s = s.replace(/await qAll\(([^,]+),\s*([a-zA-Z_][a-zA-Z0-9_]*)\)/g, 'await qAll($1, [$2])');

s = s.replace(/return db\.prepare\(([^)]+)\)\.all\(\) as ([^;]+);/g, 'return await qAll($1) as $2;');
s = s.replace(/return db\.prepare\(([^)]+)\)\.all\(([^)]+)\) as ([^;]+);/g, 'return await qAll($1, [$2]) as $3;');
s = s.replace(/return db\.prepare\(\s*`([\s\S]*?)`\s*\)\.get\(([^)]*)\)/g, 'return await qGet(`$1`, [$2])');
s = s.replace(/return db\.prepare\(\s*`([\s\S]*?)`\s*\)\.all\(\)/g, 'return await qAll(`$1`)');
s = s.replace(/return db\.prepare\(\s*`([\s\S]*?)`\s*\)\.all\(([^)]*)\)/g, 'return await qAll(`$1`, [$2])');
s = s.replace(/return db\.prepare\(\s*"([\s\S]*?)"\s*\)\.all\(\)/g, 'return await qAll("$1")');
s = s.replace(/return db\.prepare\(\s*"([\s\S]*?)"\s*\)\.all\(\) as ([^;]+);/g, 'return await qAll("$1") as $2;');

s = s.replace(/export default \{([\s\S]*)\n\};\s*\n*\/\/ Helper functions/, (match, body) => {
  const asyncBody = body.replace(/(\n\s+)([a-zA-Z0-9_]+):\s*(async\s*)?\(/g, '$1$2: async (');
  return `export default {${asyncBody}\n};\n\n// Helper functions`;
});

fs.writeFileSync(p, s);
console.log('pass 2 done');
