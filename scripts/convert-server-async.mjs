/**
 * Convert server.ts to await all db.* calls and wrap handlers with asyncHandler.
 */
import fs from 'fs';

const p = 'server.ts';
let s = fs.readFileSync(p, 'utf8');

if (!s.includes('asyncHandler')) {
  s = s.replace(
    'import database, { initializeDatabase } from "./src/database";',
    'import database, { initializeDatabase } from "./src/database";\nimport { asyncHandler } from "./server/lib/async-handler";'
  );
}

// await db.method(
s = s.replace(/(?<!await )db\.([a-zA-Z0-9_]+)\(/g, 'await db.$1(');
s = s.replace(/await await db\./g, 'await db.');

// Auth middleware — async with await db
s = s.replace(
  `  const authenticateAdminToken = (req: Request, res: Response, next: NextFunction) => {
    const token = getAuthToken(req, true);
    if (!token) return res.sendStatus(401);

    jwt.verify(token, requireJwtSecret(), (err, user) => {
      if (err) return res.sendStatus(403);
      if (!user || typeof user === "string") return res.sendStatus(403);
      const dbUser = await db.getUserById(user.id);
      if (!dbUser || (dbUser.role !== 'admin' && dbUser.role !== 'staff')) {
        return res.sendStatus(403);
      }
      req.admin = user;
      next();
    });
  };`,
  `  const authenticateAdminToken = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const token = getAuthToken(req, true);
    if (!token) return res.sendStatus(401);

  jwt.verify(token, requireJwtSecret(), async (err, user) => {
      if (err) return res.sendStatus(403);
      if (!user || typeof user === "string") return res.sendStatus(403);
      const dbUser = await db.getUserById(user.id);
      if (!dbUser || (dbUser.role !== 'admin' && dbUser.role !== 'staff')) {
        return res.sendStatus(403);
      }
      req.admin = user as AuthTokenPayload;
      next();
    });
  });`
);

s = s.replace(
  `  const requireAdminRole = (req: Request, res: Response, next: NextFunction) => {
    const dbUser = await db.getUserById(req.admin!.id);
    if (!dbUser || dbUser.role !== 'admin') return res.sendStatus(403);
    next();
  };`,
  `  const requireAdminRole = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const dbUser = await db.getUserById(req.admin!.id);
    if (!dbUser || dbUser.role !== 'admin') return res.sendStatus(403);
    next();
  });`
);

s = s.replace(
  `  const requireStaffPermission = (perm: StaffPermission) => (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    const dbUser = await db.getUserById(req.admin!.id);
    if (!dbUser) return res.sendStatus(403);
    const perms = parseStaffPermissions(dbUser.staffPermissions);
    if (!hasPermission(dbUser.role, perms, perm)) return res.sendStatus(403);
    next();
  };`,
  `  const requireStaffPermission = (perm: StaffPermission) =>
    asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const dbUser = await db.getUserById(req.admin!.id);
    if (!dbUser) return res.sendStatus(403);
    const perms = parseStaffPermissions(dbUser.staffPermissions);
    if (!hasPermission(dbUser.role, perms, perm)) return res.sendStatus(403);
    next();
  });`
);

// Wrap route handlers inside createApp
const createStart = s.indexOf('async function createApp()');
const createEnd = s.lastIndexOf('return app;');
if (createStart < 0 || createEnd < 0) throw new Error('createApp block not found');

const head = s.slice(0, createStart);
let body = s.slice(createStart, createEnd);
const tail = s.slice(createEnd);

// Normalize existing asyncHandler / async handlers
body = body.replace(/asyncHandler\(asyncHandler\(/g, 'asyncHandler(');
body = body.replace(/asyncHandler\(async async \(/g, 'asyncHandler(async (');

// app.METHOD(path, ...handlers, finalHandler)
body = body.replace(
  /app\.(get|post|put|patch|delete)\(([\s\S]*?)\);/g,
  (routeBlock) => {
    if (routeBlock.includes('asyncHandler(')) return routeBlock;

    const open = routeBlock.indexOf('(');
    const close = routeBlock.lastIndexOf(')');
    const inner = routeBlock.slice(open + 1, close);

  // Split on commas at paren depth 0 — simplified: find last handler
    const handlerMatch = inner.match(/,\s*((async\s*)?\([^)]*\)\s*=>\s*\{[\s\S]*)$/);
    if (!handlerMatch) return routeBlock;

    const handlerStart = inner.lastIndexOf(handlerMatch[1]);
    const prefix = inner.slice(0, handlerStart).replace(/,\s*$/, '');
    let handler = handlerMatch[1].trim();

    if (handler.startsWith('async ')) {
      handler = handler.replace(/^async\s*/, '');
    }
    if (!handler.startsWith('(')) return routeBlock;

    return `app.${routeBlock.match(/app\.(get|post|put|patch|delete)/)[1]}(${prefix}, asyncHandler(async ${handler}));`;
  }
);

s = head + body + tail;

fs.writeFileSync(p, s);
console.log('server.ts converted');
