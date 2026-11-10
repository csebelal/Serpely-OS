import express from 'express';
import jwt from 'jsonwebtoken';

export const JWT_SECRET = process.env.JWT_SECRET || 'sincly-enterprise-jwt-super-secret-key-2026';
export const DEFAULT_ADMIN_EMAIL = 'support@serpely.com';

export interface AuthenticatedUserPayload {
  id?: string;
  email: string;
  role: string;
  name?: string;
}

export function sanitizeInput(val: unknown): string {
  if (typeof val !== 'string') return '';
  return val
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/[<>]/g, '')
    .trim();
}

export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export function resolveUserEmail(req: express.Request): string {
  // 1. Authenticated user attached by JWT middleware
  if ((req as any).user?.email) {
    return String((req as any).user.email).trim().toLowerCase();
  }
  // 2. Direct Bearer token check
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    try {
      const decoded: any = jwt.verify(authHeader.substring(7), JWT_SECRET);
      if (decoded?.email) return String(decoded.email).trim().toLowerCase();
    } catch {}
  }
  // 3. Request Header
  const headerEmail = (req.headers['x-user-email'] as string || '').trim().toLowerCase();
  if (headerEmail) return headerEmail;
  // 4. Query param
  const queryEmail = (req.query.userEmail as string || '').trim().toLowerCase();
  if (queryEmail) return queryEmail;
  // 5. Body param
  const bodyEmail = (req.body?.userEmail as string || '').trim().toLowerCase();
  if (bodyEmail) return bodyEmail;
  return DEFAULT_ADMIN_EMAIL;
}

export function authenticateToken(
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
) {
  const authHeader = req.headers.authorization;
  let token = authHeader && authHeader.startsWith('Bearer ') ? authHeader.substring(7) : null;
  if (!token && req.headers['x-access-token']) {
    token = req.headers['x-access-token'] as string;
  }

  if (token) {
    try {
      const decoded = jwt.verify(token, JWT_SECRET) as any;
      (req as any).user = decoded;
      req.headers['x-user-email'] = decoded.email;
      return next();
    } catch (err: any) {
      return res.status(401).json({
        authenticated: false,
        error: 'Session expired or invalid authentication token. Please sign in again.'
      });
    }
  }

  return res.status(401).json({
    authenticated: false,
    error: 'Authentication required. Please sign in.'
  });
}

export function authorizeRoles(...allowedRoles: string[]) {
  return (req: express.Request, res: express.Response, next: express.NextFunction) => {
    const userRole = (req as any).user?.role || 'owner';
    if (!allowedRoles.includes(userRole)) {
      return res.status(403).json({ error: `Forbidden: role '${userRole}' lacks permission for this action.` });
    }
    next();
  };
}
