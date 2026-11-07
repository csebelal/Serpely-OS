import express, { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import {
  findUserByEmail,
  createUserInDb,
  writeUserToSql,
  readAllUsersFromSql,
  recordAuditLog,
  getPrimaryPgPool,
  writeUserWorkspaceToSql
} from '../db/sql-engine';
import {
  JWT_SECRET,
  authenticateToken,
  authorizeRoles,
  resolveUserEmail,
  sanitizeInput,
  isValidEmail
} from '../middleware/auth.middleware';
import { authRateLimiter } from '../middleware/rate-limiter.middleware';

export interface AuthRouterOptions {
  createInitialWorkspace?: () => any;
  onUserWorkspaceCreated?: (email: string, initialDb: any) => Promise<void> | void;
}

export function createAuthRouter(options: AuthRouterOptions = {}): Router {
  const router = express.Router();

  // --------------------------------------------------------------------------
  // User Registration Endpoint (PostgreSQL + bcrypt + JWT)
  // --------------------------------------------------------------------------
  router.post('/register', authRateLimiter, async (req, res) => {
    try {
      const { name, email, password, role = 'owner', title = 'Workspace Owner', initials } = req.body || {};
      const cleanEmail = String(email || '').trim().toLowerCase();
      const cleanPassword = String(password || '').trim();
      const cleanName = sanitizeInput(name) || cleanEmail.split('@')[0];

      if (!cleanEmail || !isValidEmail(cleanEmail)) {
        return res.status(400).json({ success: false, error: 'Valid email address is required.' });
      }
      if (!cleanPassword || cleanPassword.length < 6) {
        return res.status(400).json({ success: false, error: 'Password must be at least 6 characters.' });
      }

      // Check if user already exists
      const existingUser = await findUserByEmail(cleanEmail);
      if (existingUser) {
        return res.status(409).json({
          success: false,
          error: 'An account with this email already exists. Please sign in instead.'
        });
      }

      // Hash password with bcrypt (salt rounds = 10)
      const passwordHash = await bcrypt.hash(cleanPassword, 10);
      const userInitials = initials || cleanName.split(' ').map((w: string) => w[0]).slice(0, 2).join('').toUpperCase() || 'U';

      const newUser = await createUserInDb({
        id: `usr-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        name: cleanName,
        email: cleanEmail,
        passwordHash,
        role: String(role || 'owner'),
        title: String(title || 'Workspace Owner'),
        initials: userInitials
      });

      // Initialize clean workspace for user
      if (options.createInitialWorkspace) {
        const cleanDb = options.createInitialWorkspace();
        await writeUserWorkspaceToSql(cleanEmail, cleanDb);
        if (options.onUserWorkspaceCreated) {
          await options.onUserWorkspaceCreated(cleanEmail, cleanDb);
        }
      }

      // Sign JWT session token (7-day validity)
      const token = jwt.sign(
        { id: newUser.id, email: cleanEmail, role: newUser.role, name: newUser.name },
        JWT_SECRET,
        { expiresIn: '7d' }
      );

      // Audit log
      await recordAuditLog(cleanEmail, 'USER_REGISTER', req.ip, req.headers['user-agent'] as string, {
        role: newUser.role
      });

      return res.json({ success: true, token, user: newUser });
    } catch (err: any) {
      console.error('[Auth Register Error]:', err);
      return res.status(500).json({ success: false, error: 'Registration failed due to a server error.' });
    }
  });

  // --------------------------------------------------------------------------
  // User Login Endpoint (PostgreSQL + bcrypt verify + JWT issue)
  // --------------------------------------------------------------------------
  router.post('/login', authRateLimiter, async (req, res) => {
    try {
      const { email, password } = req.body || {};
      const cleanEmail = String(email || '').trim().toLowerCase();
      const cleanPassword = String(password || '').trim();

      if (!cleanEmail || !cleanPassword) {
        return res.status(400).json({ success: false, error: 'Email and password are required.' });
      }

      const user = await findUserByEmail(cleanEmail);
      if (!user) {
        await recordAuditLog(cleanEmail, 'USER_LOGIN_FAILED', req.ip, req.headers['user-agent'] as string, {
          reason: 'User not found'
        });
        return res.status(401).json({
          success: false,
          error: 'No account found with this email. Please click "Sign up now" below to create an account.'
        });
      }

      // Verify bcrypt password hash
      let isMatch = false;
      const storedPassword = String(user.password || '');
      if (storedPassword.startsWith('$2a$') || storedPassword.startsWith('$2b$')) {
        isMatch = await bcrypt.compare(cleanPassword, storedPassword);
      } else {
        // Fallback for plain-text password match and auto-upgrade to bcrypt hash
        isMatch = (cleanPassword === storedPassword);
        if (isMatch) {
          const newHash = await bcrypt.hash(cleanPassword, 10);
          user.password = newHash;
          await writeUserToSql(user);
        }
      }

      if (!isMatch) {
        await recordAuditLog(cleanEmail, 'USER_LOGIN_FAILED', req.ip, req.headers['user-agent'] as string, {
          reason: 'Invalid credentials'
        });
        return res.status(401).json({
          success: false,
          error: 'Invalid password. Please verify your credentials and try again.'
        });
      }

      // Sign JWT session token (7-day validity)
      const token = jwt.sign(
        { id: user.id, email: user.email, role: user.role, name: user.name },
        JWT_SECRET,
        { expiresIn: '7d' }
      );

      // Audit log
      await recordAuditLog(cleanEmail, 'USER_LOGIN_SUCCESS', req.ip, req.headers['user-agent'] as string, {
        role: user.role
      });

      // Strip sensitive password before returning to client
      const { password: _, ...safeUser } = user;
      return res.json({ success: true, token, user: safeUser });
    } catch (err: any) {
      console.error('[Auth Login Error]:', err);
      return res.status(500).json({ success: false, error: 'Login failed due to a server error.' });
    }
  });

  // --------------------------------------------------------------------------
  // User Session Verification (/api/auth/me)
  // --------------------------------------------------------------------------
  router.get('/me', async (req, res) => {
    try {
      const email = resolveUserEmail(req);
      if (!email) {
        return res.status(401).json({ authenticated: false });
      }
      const user = await findUserByEmail(email);
      if (!user) {
        return res.status(401).json({ authenticated: false });
      }
      const { password: _, ...safeUser } = user;
      return res.json({ authenticated: true, user: safeUser });
    } catch (err: any) {
      return res.status(500).json({ authenticated: false, error: err?.message });
    }
  });

  // --------------------------------------------------------------------------
  // Get Registered Users (Sanitized, no passwords exposed)
  // --------------------------------------------------------------------------
  router.get('/users', async (_req, res) => {
    try {
      const users = await readAllUsersFromSql();
      const sanitized = users.map(u => {
        const { password, ...safe } = u;
        return safe;
      });
      res.json({ success: true, users: sanitized });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err?.message });
    }
  });

  return router;
}

export default createAuthRouter;
