import fs from 'fs';

const p = 'server.ts';
let s = fs.readFileSync(p, 'utf8');

const fixes = [
  [
    "const request = await db.getMediaRequestsByClientId(req.user.id).find((r: any) => r.id === id);",
    "const request = (await db.getMediaRequestsByClientId(req.user.id)).find((r: any) => r.id === id);",
  ],
  [
    "const owned = new Set(await db.getMediaRequestsByClientId(req.user!.id).map((r) => r.id));",
    "const owned = new Set((await db.getMediaRequestsByClientId(req.user!.id)).map((r) => r.id));",
  ],
  [
    `     const requests = await db.getAllMediaRequests().map((row) => {
       const client = await db.getUserById(row.clientId);
       return {
         ...row,
         clientName: client?.name ?? 'Unknown client',
         clientEmail: client?.email ?? '',
       };
     });`,
    `     const rows = await db.getAllMediaRequests();
     const requests = await Promise.all(rows.map(async (row) => {
       const client = await db.getUserById(row.clientId);
       return {
         ...row,
         clientName: client?.name ?? 'Unknown client',
         clientEmail: client?.email ?? '',
       };
     }));`,
  ],
  [
    "const existing = db.prepare('SELECT * FROM media_requests WHERE id = ?').get(id) as { clientId: string } | undefined;",
    "const existing = await db.getMediaRequestById?.(id) ?? (await qGetFromRequest(id));",
  ],
];

// Manual fix for media request block
s = s.replace(
  `     const existing = db.prepare('SELECT * FROM media_requests WHERE id = ?').get(id) as { clientId: string } | undefined;
     if (!existing) return res.status(404).json({ error: 'Request not found' });
     const updated = db.updateMediaRequest(id, {`,
  `     const existingRow = await db.getAllMediaRequests();
     const existing = existingRow.find((r) => r.id === id);
     if (!existing) return res.status(404).json({ error: 'Request not found' });
     const updated = await db.updateMediaRequest(id, {`
);

s = s.replace(
  `     db.createNotification({
       userId: existing.clientId,
       type: 'request',
       title: 'Studio update on your request',`,
  `     await db.createNotification({
       userId: existing.clientId,
       type: 'request',
       title: 'Studio update on your request',`
);

s = s.replace(
  'const totalRevenue = await db.getAllInvoices().reduce((sum: number, inv) => sum + (inv.amount || 0) * (inv.paid ? 1 : 0), 0);',
  'const totalRevenue = (await db.getAllInvoices()).reduce((sum: number, inv) => sum + (inv.amount || 0) * (inv.paid ? 1 : 0), 0);'
);

s = s.replace(
  'totalClients: await db.getUsers().filter((u) => u.role === \'client\').length,',
  'totalClients: (await db.getUsers()).filter((u) => u.role === \'client\').length,'
);
s = s.replace(
  'totalAdmins: await db.getUsers().filter((u) => u.role === \'admin\').length,',
  'totalAdmins: (await db.getUsers()).filter((u) => u.role === \'admin\').length,'
);
s = s.replace(
  'totalDownloads: await db.getAllClientFiles().reduce((acc: number, f) => acc + (f.downloadCount || 0), 0)',
  'totalDownloads: (await db.getAllClientFiles()).reduce((acc: number, f) => acc + (f.downloadCount || 0), 0)'
);
s = s.replace(
  'const downloadsByFile = await db.getAllClientFiles().map((f) => ({ id: f.id, name: f.name, downloads: f.downloadCount || 0 }));',
  'const downloadsByFile = (await db.getAllClientFiles()).map((f) => ({ id: f.id, name: f.name, downloads: f.downloadCount || 0 }));'
);
s = s.replace(
  'const revenue = await db.getAllInvoices().filter((i) => i.paid).reduce((sum: number, inv) => sum + (inv.amount || 0), 0);',
  'const revenue = (await db.getAllInvoices()).filter((i) => i.paid).reduce((sum: number, inv) => sum + (inv.amount || 0), 0);'
);

for (const [from, to] of fixes.slice(0, 3)) {
  s = s.replace(from, to);
}

fs.writeFileSync(p, s);
console.log('server fixes applied');
