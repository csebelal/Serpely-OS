# Security Policy & Audit Report — Sincly (Serpely-OS)

## Security Overview
This document outlines the security policies, audit records, vulnerability disclosures, and architectural security controls implemented across the Sincly platform.

---

## Security Audit Log
* **Audit Date:** 2026-11-10
* **Auditor:** Automated Agentic Security Sweep (Antigravity Security Engine)
* **Standard:** OWASP Top 10 (2021 & API Security Top 10)
* **Scope:** Full repository audit covering `backend/`, `frontend/`, database layer, API endpoints, credentials management, and reverse tunnel gateway.

---

## Audit Findings & Remediation Summary

### 🔴 Critical Vulnerabilities (Resolved & Remediated)

1. **Information Disclosure: Plaintext OAuth Access Tokens via `/api/state`**
   - **Vulnerability:** Unauthenticated `GET /api/state` returned the entire admin workspace, including raw plaintext LinkedIn `userAccessToken`, `pageAccessToken`, and credentials vault.
   - **Remediation:** Enforced `authenticateToken` on `GET /api/state` and `PUT /api/state`. Unauthenticated public requests receive `HTTP 401 Unauthorized`.
   - **Status:** ✅ **Remediated & Verified**

2. **Plaintext Gemini API Key Leak via `/api/settings/credentials`**
   - **Vulnerability:** Unauthenticated `GET /api/settings/credentials` returned raw `geminiApiKey` and `geminiImageApiKey` in plain text. `POST` allowed unauthorized overwrite.
   - **Remediation:** Restricted both `GET` and `POST` to verified Owner sessions (`authenticateToken`, `authorizeRoles('owner')`). Replaced plain keys with masked format (`AQ.Ab8••••ZVlQ`).
   - **Status:** ✅ **Remediated & Verified**

3. **Database URL Leakage & State Destruction via `/api/settings/database`**
   - **Vulnerability:** Unauthenticated `GET` leaked database connection strings and port. Unauthenticated `POST` allowed anonymous callers to wipe the PostgreSQL database configuration.
   - **Remediation:** Protected with `authenticateToken` and `authorizeRoles('owner')`.
   - **Status:** ✅ **Remediated & Verified**

4. **Integration Credentials Hijacking via `/api/integrations/credentials` & `/remove`**
   - **Vulnerability:** Unauthenticated POST endpoints allowed anonymous actors to save or remove OAuth provider keys.
   - **Remediation:** Added `authenticateToken, authorizeRoles('owner')`.
   - **Status:** ✅ **Remediated & Verified**

5. **Arbitrary Header Spoofing (`x-user-email`) Privilege Escalation**
   - **Vulnerability:** `auth.middleware.ts` previously accepted an unverified `x-user-email` header fallback to grant `owner` privileges without checking JWT signature.
   - **Remediation:** Completely removed unauthenticated header fallback. Every protected request requires a cryptographically verified signed JWT `Bearer <token>`.
   - **Status:** ✅ **Remediated & Verified**

6. **External API Quota Exhaustion (LinkedIn DoS) via `/api/auth/status`**
   - **Vulnerability:** Anonymous calls triggered live network requests to LinkedIn REST APIs.
   - **Remediation:** Enforced `authenticateToken` and added a 10-minute per-user cache cooldown.
   - **Status:** ✅ **Remediated & Verified**

7. **Multi-Account Social Media Control Vulnerabilities**
   - **Vulnerability:** Endpoints `/api/social/pages/*`, `/api/social/scheduling/*`, `/api/social/posts/:id`, `/api/integrations/messaging/*` permitted unauthenticated modification or deletion.
   - **Remediation:** Enforced `authenticateToken` across all social mutation, deletion, and dispatch endpoints.
   - **Status:** ✅ **Remediated & Verified**

---

### 🟡 Warnings & Mitigations

1. **Default JWT Secret Fallback in Source Code**
   - **Finding:** If `JWT_SECRET` was omitted from `.env`, code fell back to a default development string.
   - **Remediation:** High-entropy 64-character random hex key generated and provisioned in `.env`. Added runtime warning if running in production without explicit `JWT_SECRET`.
   - **Status:** ✅ **Mitigated**

2. **Rate Limiting on Public Endpoints**
   - **Finding:** Lack of global rate limiting on public API endpoints risked brute force and scraping.
   - **Remediation:** Activated in-memory sliding-window rate limiters:
     - Auth rate limiter: 15 requests / 15 minutes window (`authRateLimiter`)
     - Global API rate limiter: 300 requests / minute window (`apiRateLimiter`)
   - **Status:** ✅ **Implemented & Verified**

---

### 🟢 Verified Controls (Passed)

1. **SQL Injection Prevention (OWASP A03:2021)**
   - All database queries in `backend/src/db/sql-engine.ts` use parameterized queries with `$1`, `$2`, `$3`, etc.
   - Zero dynamic string concatenation or raw template literal injections detected in production queries.
   - **Status:** 🟢 **Passed**

2. **Cross-Site Scripting (XSS - OWASP A03:2021)**
   - Frontend codebase uses React JSX virtual DOM with automatic string escaping.
   - Zero occurrences of `dangerouslySetInnerHTML` in application code.
   - Zero occurrences of `eval()` or dynamic `Function()` constructor.
   - **Status:** 🟢 **Passed**

3. **Supply Chain & Dependencies (OWASP A06:2021)**
   - `npm audit` reports **0 known vulnerabilities** in backend and root dependency trees.
   - **Status:** 🟢 **Passed**

4. **Secrets Management & Source Control**
   - All `.env` files are explicitly ignored in `.gitignore`.
   - No private keys (`.pem`, `.key`) or SQLite databases committed to git history.
   - **Status:** 🟢 **Passed**

---

## Reporting a Vulnerability
If you discover a security vulnerability in Sincly, please report it privately:
* **Security Contact:** `support@serpely.com`
* Please allow up to 48 hours for triage before public disclosure.
