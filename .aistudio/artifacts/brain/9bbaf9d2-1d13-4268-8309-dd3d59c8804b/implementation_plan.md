# Live Social Media, Ads, Email & CRM Credential Integration Plan

## Why the App Was Running in Dev/Sandbox Mode
Currently, `server.ts` checks `process.env` (such as `FACEBOOK_APP_ID`, `LINKEDIN_CLIENT_ID`, `YOUTUBE_CLIENT_ID`, etc.) when starting an OAuth 2.0 flow. Because those environment variables were not set in `.env`, the backend automatically fell back to **Sandbox / Dev Mode** (`isConfigured: false`).

To let you connect **real credentials immediately** without having to manually edit `.env` files or restart the container, we will upgrade both the backend (`server.ts`) and the frontend (`Integrations.tsx` & `Publishing.tsx`) with a **Live OAuth 2.0 App Configurator, Callback URL Helper, and One-Click Popup Login**.

---

## Key Upgrades We Will Build

### 1. Dynamic Runtime Credential Store (`server.ts`)
- **Persistent Live OAuth Config Store**: Allow configuring and storing OAuth App credentials (`clientId`, `clientSecret`, `accessToken`, `pageId`, `adAccountId`, `developerToken`, `smtpHost`, `smtpPort`, `smtpUser`, `smtpPass`, `hubspotApiKey`) directly from the UI into the SQLite `settings` table (`live_oauth_credentials`), merging seamlessly with `process.env`.
- **Instant Switch from Dev Mode to Live Mode**: As soon as a platform's Client ID & Secret (or Direct Access Token / API Key) are saved in the UI, `/api/integrations/status` will switch that platform from `Sandbox` to `Live Ready` (`isConfigured: true`), enabling real OAuth 2.0 popup login and real API calls.
- **Google / YouTube & Google Ads OAuth 2.0 Flow**: Add full Google OAuth 2.0 popup authorization (`https://accounts.google.com/o/oauth2/v2/auth`) and token exchange (`https://oauth2.googleapis.com/token`) with scopes for **YouTube Data API v3** (`youtube.upload`, `youtube.readonly`) and **Google Ads API** (`https://www.googleapis.com/auth/adwords`), alongside direct API key / refresh token support.
- **Facebook Page & Instagram Graph API Auto-Discovery**: When logging in via the Facebook OAuth 2.0 popup (`pages_manage_posts`, `pages_read_engagement`, `ads_management`, `ads_read`), automatically fetch the user's managed Facebook Pages (`/me/accounts`) and Ad Accounts (`/me/adaccounts`) so posts publish to your real Facebook Page with a Page Access Token.
- **LinkedIn Page & Profile Live Publishing**: Exchange LinkedIn OAuth 2.0 authorization code for a real access token (`w_member_social`, `r_liteprofile`, `r_organization_social`, `w_organization_social`) and fetch the authenticated member/organization URN (`/v2/userinfo` or `/v2/me`) for real LinkedIn posts.
- **Live SMTP Verification & HubSpot CRM Verification**:
  - Add `/api/integrations/verify` endpoint that tests your live SMTP server connection (`nodemailer.createTransport(...).verify()`), tests HubSpot Private App token (`https://api.hubapi.com/crm/v3/objects/contacts?limit=1`), and verifies Facebook/LinkedIn/YouTube tokens in real time.

---

### 2. Interactive OAuth 2.0 Popup & Callback URL Helper UI (`src/pages/Integrations.tsx`)
- **One-Click Callback URL Copy Helper**:
  - Display your exact **Development & Shared OAuth Redirect URIs** at the top of the OAuth Setup Modal with one-click copy buttons:
    - `https://ais-dev-iiuty3r3cgd5v5cgv7cqdq-481105726759.asia-northeast1.run.app/auth/callback`
    - `https://ais-pre-iiuty3r3cgd5v5cgv7cqdq-481105726759.asia-northeast1.run.app/auth/callback`
  - Step-by-step Bengali + English instructions for pasting this Redirect URI into **Meta for Developers**, **LinkedIn Developer Portal**, **Google Cloud Console**, and **HubSpot Developer Portal**.
- **Two Flexible Connection Modes per Platform**:
  1. **One-Click OAuth 2.0 Popup Login**: Enter your App's `Client ID` and `Client Secret` once in the modal, click **Save & Launch OAuth Popup**, and sign in with your real Facebook, LinkedIn, Google (YouTube/Google Ads), or HubSpot account in a secure popup window.
  2. **Direct Access Token / Credentials Quick-Connect**: If you already generated a Permanent Page Access Token (Meta Graph API Explorer), LinkedIn Access Token, YouTube API Key, HubSpot Private App Token, or Gmail App Password (SMTP), paste it directly and click **Verify & Connect Live**.
- **Real-Time Connection Health Badge**:
  - Clear distinction between **Live Connected (Verified)**, **Live Ready (OAuth Configured)**, and **Dev Mode (Unconfigured)**, with a **Test Live Connection** button for each connected service.

---

### 3. Live Publishing & Page Target Selector (`src/pages/Publishing.tsx`)
- Show which accounts are connected in **Live Production Mode** vs **Sandbox Mode** before publishing.
- For Facebook and LinkedIn, display the connected Page / Profile name and verify real Graph API / UGC Post URLs returned from the live publish endpoint.
