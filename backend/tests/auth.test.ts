import { describe, it, expect } from 'vitest';
import jwt from 'jsonwebtoken';
import {
  isValidEmail,
  sanitizeInput,
  resolveUserEmail,
  JWT_SECRET,
  DEFAULT_ADMIN_EMAIL
} from '../src/middleware/auth.middleware';

describe('Authentication & Security Middleware', () => {
  describe('isValidEmail', () => {
    it('accepts valid RFC-compliant emails', () => {
      expect(isValidEmail('support@serpely.com')).toBe(true);
      expect(isValidEmail('user.name+tag@domain.co.uk')).toBe(true);
      expect(isValidEmail('csebelal9@gmail.com')).toBe(true);
    });

    it('rejects invalid email formats', () => {
      expect(isValidEmail('')).toBe(false);
      expect(isValidEmail('notanemail')).toBe(false);
      expect(isValidEmail('user@')).toBe(false);
      expect(isValidEmail('@domain.com')).toBe(false);
      expect(isValidEmail('user @domain.com')).toBe(false);
    });
  });

  describe('sanitizeInput', () => {
    it('strips HTML script tags and harmful angle brackets', () => {
      const malicious = '<script>alert("xss")</script>Hello World';
      expect(sanitizeInput(malicious)).not.toContain('<script>');
      expect(sanitizeInput(malicious)).not.toContain('</script>');
      expect(sanitizeInput(malicious)).toBe('Hello World');
    });

    it('handles non-string values gracefully', () => {
      expect(sanitizeInput(null)).toBe('');
      expect(sanitizeInput(undefined)).toBe('');
      expect(sanitizeInput(12345)).toBe('');
    });
  });

  describe('resolveUserEmail', () => {
    it('resolves email from verified JWT Bearer token in authorization header', () => {
      const token = jwt.sign(
        { email: 'executive@enterprise.org', role: 'owner' },
        JWT_SECRET
      );
      const req: any = {
        headers: { authorization: `Bearer ${token}` }
      };
      expect(resolveUserEmail(req)).toBe('executive@enterprise.org');
    });

    it('resolves email from request user object when pre-authenticated', () => {
      const req: any = {
        user: { email: 'authenticated@serpely.com' },
        headers: {}
      };
      expect(resolveUserEmail(req)).toBe('authenticated@serpely.com');
    });

    it('falls back to DEFAULT_ADMIN_EMAIL when no identity is provided', () => {
      const req: any = {
        headers: {},
        query: {},
        body: {}
      };
      expect(resolveUserEmail(req)).toBe(DEFAULT_ADMIN_EMAIL);
    });
  });
});
