# Serpely — Autonomous AI Marketing OS

An enterprise full-stack Autonomous AI Marketing Operating System featuring 12 specialized AI agents, live website SEO/GEO crawler & analyzer, LinkedIn & Facebook OAuth 2.0 publishing, omnichannel campaign orchestration, content & ad studios, lead intelligence, and persistent server-side state across all 18 views.

---

## বাংলায় গাইড: লোকালহোস্টে (Localhost) রান করার সম্পূর্ণ নিয়ম

### ১. প্রজেক্ট ডাউনলোড এবং আনজিপ (Unzip)
1. AI Studio-এর উপরের ডানদিকে **Download / Export ZIP** বাটনে ক্লিক করে প্রজেক্টটি ডাউনলোড করুন।
2. ডাউনলোড করা `.zip` ফাইলটি আপনার কম্পিউটারের যেকোনো ফোল্ডারে Extract (Unzip) করুন এবং ফোল্ডারটি **VS Code** বা আপনার পছন্দের কোড এডিটরে ওপেন করুন।

### ২. প্রয়োজনীয় সফটওয়্যার (Prerequisites)
* আপনার কম্পিউটারে **Node.js (v18 বা v20+)** ইনস্টল থাকতে হবে।
* চেক করার জন্য টার্মিনালে লিখুন:
  ```bash
  node -v
  npm -v
  ```

### ৩. প্যাকেজ ইনস্টল করা (Install Dependencies)
প্রজেক্ট ফোল্ডারের ভেতরে টার্মিনাল ওপেন করে নিচের কমান্ডটি দিন:
```bash
npm install
```

### ৪. এনভায়রনমেন্ট ভেরিয়েবল (`.env`) সেটআপ
প্রজেক্টের মূল ফোল্ডারে থাকা `.env.example` ফাইলটি কপি করে `.env` নামে একটি ফাইল তৈরি করুন:

* **Mac / Linux / Git Bash:**
  ```bash
  cp .env.example .env
  ```
* **Windows (Command Prompt):**
  ```cmd
  copy .env.example .env
  ```
* **Windows (PowerShell):**
  ```powershell
  Copy-Item .env.example .env
  ```

এরপর `.env` ফাইলটি ওপেন করে আপনার `GEMINI_API_KEY` বসান:
```env
PORT=3000
APP_URL=http://localhost:3000
GEMINI_API_KEY=আপনার_GEMINI_API_KEY_এখানে_দিন

FACEBOOK_CLIENT_ID=your_facebook_client_id_here
FACEBOOK_CLIENT_SECRET=your_facebook_client_secret_here

LINKEDIN_CLIENT_ID=your_linkedin_client_id_here
LINKEDIN_CLIENT_SECRET=your_linkedin_client_secret_here
```

### ৫. লোকালহোস্টে সার্ভার চালু করা (Run Dev Server)

প্রজেক্টটি **Frontend (Vite, Port 3000)** এবং **Backend (Express + PostgreSQL, Port 5000)** এই দুই ভাগে বিভক্ত।

#### ক. দুটো সার্ভার একসাথে চালাতে (সবচেয়ে সহজ):
রুট ফোল্ডারে টার্মিনাল ওপেন করে কমান্ড দিন:
```bash
npm run dev
```
- **Backend API**: `http://localhost:5000`
- **Frontend App**: `http://localhost:3000`

#### খ. আলাদা আলাদা চালাতে চাইলে:
* **Frontend Only**: `npm run dev:frontend` (অথবা `cd frontend && npm run dev`)
* **Backend Only**: `npm run dev:backend` (অথবা `cd backend && npm run dev`)
* **Database টেবিল দেখতে**: `npm run db:view`
* এটি একসাথে **Express Backend Server** এবং **Vite Frontend** পোর্ট `3000`-এ চালু করবে।
* আপনার ব্রাউজারে গিয়ে ওপেন করুন: **[http://localhost:3000](http://localhost:3000)**

---

## English Guide: Running on Localhost

### 1. Prerequisites
* **Node.js**: v18.0.0 or higher (v20 LTS recommended)
* **npm**: v9+ (comes bundled with Node.js)

### 2. Installation & Setup
```bash
# 1. Install all dependencies
npm install

# 2. Create your local environment file from the template
cp .env.example .env
```

Open `.env` and set your `GEMINI_API_KEY` (obtainable from [Google AI Studio](https://aistudio.google.com/apikey)) and verify `APP_URL=http://localhost:3000`.

### 3. Start the Full-Stack Development Server
```bash
npm run dev
```
The unified Express + Vite server will start at **`http://localhost:3000`**.

### 4. Production Build & Start
To build the optimized frontend bundle and run the server in production mode:
```bash
npm run build
npm start
```

---

## Facebook & LinkedIn OAuth 2.0 Localhost Setup

When testing live Facebook Page or LinkedIn Company Page connection on `localhost:3000`:

1. **Meta for Developers (Facebook Login)**:
   * Open your app in [Meta for Developers](https://developers.facebook.com/).
   * Go to **Facebook Login > Settings**.
   * Under **Valid OAuth Redirect URIs**, add:
     ```text
     http://localhost:3000/auth/callback
     ```
2. **LinkedIn Developer Portal**:
   * Open your app in the [LinkedIn Developer Portal](https://www.linkedin.com/developers/).
   * Go to the **Auth** tab > **OAuth 2.0 settings**.
   * Under **Authorized redirect URLs for your app**, add:
     ```text
     http://localhost:3000/auth/callback
     ```

---

## Database & Full-Stack Architecture

* **Unified Server (`server.ts`)**: Runs an Express backend alongside Vite middleware on port `3000`.
* **Persistent Local Database (`data/marketing-os-db.json`)**:
  * Automatically created on first startup.
  * Stores all campaigns, leads, SEO/GEO audit results, content items, email sequences, ad creatives, social page connections, scheduled posts, and approval queue items.
  * You can reset the database anytime from the **Settings** view inside the app or via `POST /api/state/reset`.
* **Key Backend Endpoints**:
  * `GET /api/state` & `POST /api/state` — Full-stack state synchronization across all 18 modules.
  * `POST /api/seo/audit-url` — Live server-side HTML, meta tag, heading, and JSON-LD schema crawler + Gemini SEO/GEO analyzer.
  * `POST /api/ai/orchestrate` — Multi-agent campaign strategy & task generator.
  * `POST /api/ai/generate-content` — AI content & email sequence generator.
  * `POST /api/ai/generate-ad` — Multi-variant paid ad creative engineer.
  * `POST /api/ai/discover-leads` — AI B2B ICP prospect discovery engine.
  * `GET /api/oauth/:platform/url` & `GET /auth/callback` — Live OAuth 2.0 handshake and publishing endpoints for LinkedIn & Facebook.
