import type { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import type { StaffPermission } from './roles';
import { hasPermission, parseStaffPermissions } from './roles';

export type ManagementUser = {
  id: string;
  email: string;
  role?: string;
};

type DbLike = {
  getUserById: (id: string) => { id: string; email: string; role: string; staffPermissions?: string } | undefined;
};

export function createManagementAuth(JWT_SECRET: string, db: DbLike) {
  const authenticateManagement = (req: Request, res: Response, next: NextFunction) => {
    const bearer = req.headers.authorization?.split(' ')[1];
    const cookieToken =
      (req as Request & { cookies?: Record<string, string> }).cookies?.admin_auth_token ||
      bearer;
    if (!cookieToken) return res.sendStatus(401);

    jwt.verify(cookieToken, JWT_SECRET, (err, user) => {
      if (err) return res.sendStatus(403);
      if (!user || typeof user === 'string') return res.sendStatus(403);
      const payload = user as ManagementUser;
      const dbUser = db.getUserById(payload.id);
      if (!dbUser || (dbUser.role !== 'admin' && dbUser.role !== 'staff')) {
        return res.sendStatus(403);
      }
      req.admin = { ...payload, role: dbUser.role };
      (req as Request & { staffPermissions?: ReturnType<typeof parseStaffPermissions> }).staffPermissions =
        parseStaffPermissions(dbUser.staffPermissions);
      next();
    });
  };

  const requireAdmin = (req: Request, res: Response, next: NextFunction) => {
    const dbUser = db.getUserById(req.admin!.id);
    if (!dbUser || dbUser.role !== 'admin') return res.sendStatus(403);
    next();
  };

  const requirePermission =
    (perm: StaffPermission) => (req: Request, res: Response, next: NextFunction) => {
      const dbUser = db.getUserById(req.admin!.id);
      if (!dbUser) return res.sendStatus(403);
      const perms = parseStaffPermissions(dbUser.staffPermissions);
      if (!hasPermission(dbUser.role, perms, perm)) return res.sendStatus(403);
      next();
    };

  return { authenticateManagement, requireAdmin, requirePermission };
}
