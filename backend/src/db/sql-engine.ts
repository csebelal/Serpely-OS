import path from 'path';
import { fileURLToPath } from 'url';
import pg from 'pg';
import bcrypt from 'bcryptjs';

const { Pool } = pg;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Export canonical DATA_DIR for file storage / asset caching
export const DATA_DIR = path.resolve(__dirname, '../../data');
export const SQLITE_DB_PATH = path.resolve(DATA_DIR, 'serpely-os.sqlite');
export type SqlEngineType = 'postgres';

let pgPool: pg.Pool | null = null;

const DEFAULT_POSTGRES_URL =
  process.env.DATABASE_URL ||
  process.env.POSTGRES_URL ||
  'postgresql://postgres:postgres@localhost:5432/sincly_db';

const TABLE_DEFINITIONS: {
  name: string;
  stateKey?: string;
  createSql: string;
}[] = [
  {
    name: 'campaigns',
    stateKey: 'campaigns',
    createSql: `CREATE TABLE IF NOT EXISTS campaigns (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      status TEXT NOT NULL,
      current_stage INTEGER DEFAULT 1,
      lead_agent TEXT,
      budget_allocated REAL DEFAULT 0,
      budget_spent REAL DEFAULT 0,
      primary_metric_name TEXT,
      primary_metric_value TEXT,
      primary_metric_target TEXT,
      channels_csv TEXT,
      start_date TEXT,
      end_date TEXT,
      payload_json TEXT NOT NULL,
      updated_at TEXT NOT NULL
    )`
  },
  {
    name: 'content_items',
    stateKey: 'contentList',
    createSql: `CREATE TABLE IF NOT EXISTS content_items (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      type TEXT NOT NULL,
      platform TEXT NOT NULL,
      status TEXT NOT NULL,
      author_agent TEXT,
      word_count INTEGER DEFAULT 0,
      views INTEGER DEFAULT 0,
      clicks INTEGER DEFAULT 0,
      tags_csv TEXT,
      created_at TEXT,
      body TEXT,
      payload_json TEXT NOT NULL,
      updated_at TEXT NOT NULL
    )`
  },
  {
    name: 'approvals',
    stateKey: 'approvals',
    createSql: `CREATE TABLE IF NOT EXISTS approvals (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      agent TEXT NOT NULL,
      content_type TEXT NOT NULL,
      platform TEXT,
      risk_level TEXT NOT NULL,
      status TEXT NOT NULL,
      campaign TEXT,
      budget_impact TEXT,
      submitted_at TEXT,
      preview TEXT,
      payload_json TEXT NOT NULL,
      updated_at TEXT NOT NULL
    )`
  },
  {
    name: 'leads',
    stateKey: 'leads',
    createSql: `CREATE TABLE IF NOT EXISTS leads (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      company TEXT,
      role TEXT,
      source TEXT,
      status TEXT NOT NULL,
      intent TEXT,
      score REAL DEFAULT 0,
      assigned_agent TEXT,
      timestamp TEXT,
      payload_json TEXT NOT NULL,
      updated_at TEXT NOT NULL
    )`
  },
  {
    name: 'email_campaigns',
    stateKey: 'emailCampaigns',
    createSql: `CREATE TABLE IF NOT EXISTS email_campaigns (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      subject TEXT NOT NULL,
      status TEXT NOT NULL,
      sent_count INTEGER DEFAULT 0,
      open_rate REAL DEFAULT 0,
      click_rate REAL DEFAULT 0,
      scheduled_for TEXT,
      target_segment TEXT,
      payload_json TEXT NOT NULL,
      updated_at TEXT NOT NULL
    )`
  },
  {
    name: 'email_sequences',
    stateKey: 'emailSequences',
    createSql: `CREATE TABLE IF NOT EXISTS email_sequences (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      trigger_event TEXT,
      target_audience TEXT,
      status TEXT NOT NULL,
      steps_count INTEGER DEFAULT 0,
      enrolled INTEGER DEFAULT 0,
      completed INTEGER DEFAULT 0,
      avg_open_rate REAL DEFAULT 0,
      payload_json TEXT NOT NULL,
      updated_at TEXT NOT NULL
    )`
  },
  {
    name: 'social_posts',
    stateKey: 'socialPosts',
    createSql: `CREATE TABLE IF NOT EXISTS social_posts (
      id TEXT PRIMARY KEY,
      platform TEXT NOT NULL,
      status TEXT NOT NULL,
      day_of_week TEXT,
      scheduled_time TEXT,
      author_agent TEXT,
      media_type TEXT,
      content TEXT NOT NULL,
      payload_json TEXT NOT NULL,
      updated_at TEXT NOT NULL
    )`
  },
  {
    name: 'page_posts',
    stateKey: 'pagePosts',
    createSql: `CREATE TABLE IF NOT EXISTS page_posts (
      id TEXT PRIMARY KEY,
      platform TEXT NOT NULL,
      page_name TEXT NOT NULL,
      keyword TEXT,
      status TEXT NOT NULL,
      impressions INTEGER DEFAULT 0,
      clicks INTEGER DEFAULT 0,
      engagement_rate REAL DEFAULT 0,
      created_at TEXT,
      payload_json TEXT NOT NULL,
      updated_at TEXT NOT NULL
    )`
  },
  {
    name: 'automations',
    stateKey: 'automations',
    createSql: `CREATE TABLE IF NOT EXISTS automations (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      trigger_type TEXT NOT NULL,
      condition TEXT,
      action TEXT NOT NULL,
      status TEXT NOT NULL,
      runs_count INTEGER DEFAULT 0,
      payload_json TEXT NOT NULL,
      updated_at TEXT NOT NULL
    )`
  },
  {
    name: 'memories',
    stateKey: 'memories',
    createSql: `CREATE TABLE IF NOT EXISTS memories (
      id TEXT PRIMARY KEY,
      category TEXT NOT NULL,
      content TEXT NOT NULL,
      confidence REAL DEFAULT 0.5,
      last_accessed TEXT,
      source TEXT,
      payload_json TEXT NOT NULL,
      updated_at TEXT NOT NULL
    )`
  },
  {
    name: 'reports',
    stateKey: 'reports',
    createSql: `CREATE TABLE IF NOT EXISTS reports (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      period TEXT NOT NULL,
      type TEXT NOT NULL,
      summary TEXT,
      key_kpi TEXT,
      author TEXT,
      payload_json TEXT NOT NULL,
      updated_at TEXT NOT NULL
    )`
  },
  {
    name: 'integrations',
    stateKey: 'integrations',
    createSql: `CREATE TABLE IF NOT EXISTS integrations (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      category TEXT NOT NULL,
      status TEXT NOT NULL,
      description TEXT,
      auth_method TEXT,
      last_sync TEXT,
      payload_json TEXT NOT NULL,
      updated_at TEXT NOT NULL
    )`
  },
  {
    name: 'community_messages',
    stateKey: 'communityMessages',
    createSql: `CREATE TABLE IF NOT EXISTS community_messages (
      id TEXT PRIMARY KEY,
      sender TEXT NOT NULL,
      platform TEXT NOT NULL,
      type TEXT NOT NULL,
      intent TEXT NOT NULL,
      sentiment TEXT NOT NULL,
      status TEXT NOT NULL,
      message TEXT NOT NULL,
      draft_reply TEXT,
      timestamp TEXT,
      payload_json TEXT NOT NULL,
      updated_at TEXT NOT NULL
    )`
  },
  {
    name: 'workspace_kv',
    createSql: `CREATE TABLE IF NOT EXISTS workspace_kv (
      key TEXT PRIMARY KEY,
      description TEXT NOT NULL,
      value_json TEXT NOT NULL,
      updated_at TEXT NOT NULL
    )`
  },
  {
    name: 'user_workspaces',
    createSql: `CREATE TABLE IF NOT EXISTS user_workspaces (
      user_email TEXT PRIMARY KEY,
      workspace_json TEXT NOT NULL,
      updated_at TEXT NOT NULL
    )`
  },
  {
    name: 'users',
    createSql: `CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE,
      password TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'owner',
      title TEXT,
      initials TEXT,
      payload_json TEXT NOT NULL,
      updated_at TEXT NOT NULL
    )`
  },
  {
    name: 'audit_logs',
    createSql: `CREATE TABLE IF NOT EXISTS audit_logs (
      id TEXT PRIMARY KEY,
      user_email TEXT NOT NULL,
      action TEXT NOT NULL,
      ip_address TEXT,
      user_agent TEXT,
      details_json TEXT NOT NULL DEFAULT '{}',
      created_at TEXT NOT NULL
    )`
  }
];

export function getActiveEngine(): SqlEngineType {
  return 'postgres';
}

export function persistSqliteToDisk(): void {
  // SQLite is fully retired in favor of enterprise PostgreSQL. Kept for interface compatibility.
}

export function getPrimaryPgPool(): pg.Pool {
  if (!pgPool) {
    const connStr = DEFAULT_POSTGRES_URL.trim();
    pgPool = new Pool({
      connectionString: connStr,
      connectionTimeoutMillis: 8000,
      ssl:
        connStr.includes('localhost') || connStr.includes('127.0.0.1')
          ? false
          : { rejectUnauthorized: false }
    });
  }
  return pgPool;
}

export function getDbConnectionInfo() {
  const url = process.env.DATABASE_URL || process.env.POSTGRES_URL || DEFAULT_POSTGRES_URL;
  let host = 'localhost:5432';
  if (url && url.includes('@')) {
    host = url.split('@')[1]?.split('/')[0] || '';
  }
  return {
    engine: 'postgres',
    connected: Boolean(pgPool),
    hasConfiguredUrl: Boolean(url),
    host: host || 'PostgreSQL Engine (Active)',
    databaseUrlMasked: url ? `${url.slice(0, 14)}••••${url.slice(-8)}` : ''
  };
}

export async function testPostgresConnection(
  connectionString: string
): Promise<{ success: boolean; message: string; tablesCount?: number }> {
  try {
    const pool = new Pool({
      connectionString: connectionString.trim(),
      connectionTimeoutMillis: 8000,
      ssl:
        connectionString.includes('localhost') || connectionString.includes('127.0.0.1')
          ? false
          : { rejectUnauthorized: false }
    });
    const client = await pool.connect();
    try {
      await client.query('SELECT 1 as test');
      for (const table of TABLE_DEFINITIONS) {
        await client.query(table.createSql);
      }
      return {
        success: true,
        message: 'Successfully connected to PostgreSQL database! All tables verified.',
        tablesCount: TABLE_DEFINITIONS.length
      };
    } finally {
      client.release();
      await pool.end();
    }
  } catch (err: any) {
    return {
      success: false,
      message: `PostgreSQL connection check failed: ${err?.message || err}`
    };
  }
}

// ----------------------------------------------------------------------------
// Seed default administrative users with bcrypt password hashing
// ----------------------------------------------------------------------------
async function seedDefaultUsers(pool: pg.Pool): Promise<void> {
  const client = await pool.connect();
  try {
    const defaultUsers = [
      {
        id: 'usr-admin-01',
        name: 'Serpely Support',
        email: 'support@serpely.com',
        plainPassword: '123454321',
        role: 'owner',
        title: 'Full Access Administrator',
        initials: 'SS',
        isCustom: false,
        permissions: {
          canManageSettings: true,
          canManageApiKeys: true,
          canApproveSpends: true,
          canCreateAssets: true,
          canPublishLive: true,
          isReadOnly: false
        }
      },
      {
        id: 'usr-belal-01',
        name: 'Belal Hossain',
        email: 'csebelal9@gmail.com',
        plainPassword: '123',
        role: 'owner',
        title: 'Founder & CEO',
        initials: 'BH',
        isCustom: false,
        permissions: {
          canManageSettings: true,
          canManageApiKeys: true,
          canApproveSpends: true,
          canCreateAssets: true,
          canPublishLive: true,
          isReadOnly: false
        }
      }
    ];

    for (const u of defaultUsers) {
      const existing = await client.query(
        'SELECT id, password FROM users WHERE LOWER(email) = LOWER($1)',
        [u.email]
      );
      if (existing.rows.length === 0) {
        const hashedPassword = await bcrypt.hash(u.plainPassword, 10);
        const nowIso = new Date().toISOString();
        const payloadJson = JSON.stringify({
          id: u.id,
          name: u.name,
          email: u.email,
          role: u.role,
          title: u.title,
          initials: u.initials,
          isCustom: u.isCustom,
          permissions: u.permissions
        });
        await client.query(
          `INSERT INTO users (id, name, email, password, role, title, initials, payload_json, updated_at)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
          [u.id, u.name, u.email.toLowerCase(), hashedPassword, u.role, u.title, u.initials, payloadJson, nowIso]
        );
      }
    }
  } catch (err) {
    console.warn('[PostgreSQL] Notice during default user seeding:', err);
  } finally {
    client.release();
  }
}

// ----------------------------------------------------------------------------
// Core PostgreSQL Startup and Table Initialization
// ----------------------------------------------------------------------------
export async function initPrimarySqlDatabase<T extends Record<string, any>>(
  defaultSeedState: T,
  legacyJsonPath?: string
): Promise<T> {
  const pool = getPrimaryPgPool();
  const client = await pool.connect();
  try {
    // 1. Ensure all 17 normalized relational tables exist
    for (const table of TABLE_DEFINITIONS) {
      await client.query(table.createSql);
    }
    console.log('✅ Connected successfully to enterprise PostgreSQL database!');

    // 2. Seed default users
    await seedDefaultUsers(pool);

    // 3. Check if workspace state exists in workspace_kv
    const kvCountRes = await client.query('SELECT COUNT(*) AS cnt FROM workspace_kv');
    const existingKvCount = Number(kvCountRes?.rows?.[0]?.cnt || 0);

    if (existingKvCount > 0) {
      const state = await hydrateStateFromPostgres(defaultSeedState, pool);
      if (state) {
        return state;
      }
    }

    // 4. Initial boot: sync defaultSeedState to PostgreSQL
    const initialState = structuredClone(defaultSeedState);
    await syncStateToPostgres(initialState, new Date().toISOString(), pool);
    return initialState;
  } finally {
    client.release();
  }
}

// ----------------------------------------------------------------------------
// Hydrate workspace state from PostgreSQL tables
// ----------------------------------------------------------------------------
async function hydrateStateFromPostgres<T extends Record<string, any>>(
  defaultState: T,
  pool: pg.Pool
): Promise<T | null> {
  try {
    const hydrated: Record<string, any> = structuredClone(defaultState);

    for (const table of TABLE_DEFINITIONS) {
      if (!table.stateKey) continue;
      const res = await pool.query(`SELECT payload_json FROM ${table.name}`);
      if (res && res.rows && res.rows.length > 0) {
        hydrated[table.stateKey] = res.rows
          .map((r: any) => {
            try {
              return JSON.parse(r.payload_json);
            } catch {
              return null;
            }
          })
          .filter(Boolean);
      }
    }

    const kvRows = await pool.query('SELECT key, value_json FROM workspace_kv');
    for (const row of kvRows.rows || []) {
      const keyStr = String(row.key || '');
      try {
        const parsed = JSON.parse(String(row.value_json));
        if (keyStr === 'brandProfile') {
          hydrated.brandProfile = { ...defaultState.brandProfile, ...parsed };
        } else if (keyStr === 'geoScore') {
          hydrated.geoScore = { ...defaultState.geoScore, ...parsed };
        } else if (keyStr === 'oauthSessions') {
          hydrated.oauthSessions = {
            ...(defaultState.oauthSessions || {}),
            ...(parsed || {})
          };
        } else if (keyStr in hydrated) {
          hydrated[keyStr] = parsed;
        }
      } catch {
        // ignore malformed KV row
      }
    }

    return hydrated as T;
  } catch (err) {
    console.warn('Failed hydrating workspace from PostgreSQL:', err);
    return null;
  }
}

// ----------------------------------------------------------------------------
// Sync entire workspace state to PostgreSQL with transactions
// ----------------------------------------------------------------------------
export async function syncWorkspaceToSql(dbState: any): Promise<void> {
  const pool = getPrimaryPgPool();
  await syncStateToPostgres(dbState, new Date().toISOString(), pool);
}

export async function readWorkspaceFromSql<T extends Record<string, any>>(): Promise<any> {
  const pool = getPrimaryPgPool();
  const kvRows = await pool.query('SELECT key, value_json FROM workspace_kv');
  const result: Record<string, any> = {};
  for (const row of kvRows.rows || []) {
    try {
      result[row.key] = JSON.parse(row.value_json);
    } catch {}
  }
  return result;
}

async function syncStateToPostgres(dbState: any, nowIso: string, pool: pg.Pool): Promise<void> {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // 1. Sync workspace_kv
    const kvEntries: [string, string, any][] = [
      ['brandProfile', 'Brand DNA, voice tone, USPs, competitors, and RAG documents', dbState.brandProfile || {}],
      ['geoScore', 'Generative Engine Optimization (GEO) visibility & technical fixes', dbState.geoScore || {}],
      ['agents', '12 Autonomous AI Marketing Agents configuration & accuracy stats', dbState.agents || []],
      ['connectedPages', 'Connected LinkedIn & Facebook Page profiles', dbState.connectedPages || []],
      ['communityMessages', 'Inbound social comments, DMs, and mentions', dbState.communityMessages || []],
      ['oauthSessions', 'Encrypted/active OAuth 2.0 page sessions', dbState.oauthSessions || {}],
      ['webhookConfig', 'Public Webhook Hub settings & authorization secrets', dbState.webhookConfig || {}],
      ['webhookLogs', 'Recent incoming webhook telemetry and parsed execution logs', dbState.webhookLogs || []],
      ['scheduledQueue', 'Direct API Scheduled Queues for Threads, Bluesky, TikTok, etc.', dbState.scheduledQueue || []],
      ['meetings', 'Client and strategy meeting schedules', dbState.meetings || []],
      ['messagingConfig', 'Slack and Discord webhook / bot integrations config', dbState.messagingConfig || {}]
    ];
    for (const [k, desc, val] of kvEntries) {
      await client.query(
        `INSERT INTO workspace_kv (key, description, value_json, updated_at)
         VALUES ($1, $2, $3, $4)
         ON CONFLICT (key) DO UPDATE
         SET description = EXCLUDED.description,
             value_json = EXCLUDED.value_json,
             updated_at = EXCLUDED.updated_at`,
        [k, desc, JSON.stringify(val), nowIso]
      );
    }

    // 2. Campaigns (Atomic Upsert & Reconciliation)
    const campaignItems = dbState.campaigns || [];
    const campaignIds = campaignItems.map((c: any) => String(c.id)).filter(Boolean);
    if (campaignIds.length > 0) {
      for (const c of campaignItems) {
        await client.query(
          `INSERT INTO campaigns (
            id, name, status, current_stage, lead_agent,
            budget_allocated, budget_spent, primary_metric_name,
            primary_metric_value, primary_metric_target, channels_csv,
            start_date, end_date, payload_json, updated_at
          ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15)
          ON CONFLICT (id) DO UPDATE SET
            name = EXCLUDED.name,
            status = EXCLUDED.status,
            current_stage = EXCLUDED.current_stage,
            lead_agent = EXCLUDED.lead_agent,
            budget_allocated = EXCLUDED.budget_allocated,
            budget_spent = EXCLUDED.budget_spent,
            primary_metric_name = EXCLUDED.primary_metric_name,
            primary_metric_value = EXCLUDED.primary_metric_value,
            primary_metric_target = EXCLUDED.primary_metric_target,
            channels_csv = EXCLUDED.channels_csv,
            start_date = EXCLUDED.start_date,
            end_date = EXCLUDED.end_date,
            payload_json = EXCLUDED.payload_json,
            updated_at = EXCLUDED.updated_at`,
          [
            String(c.id),
            String(c.name || ''),
            String(c.status || 'planning'),
            Number(c.currentStage || 1),
            String(c.leadAgent || 'orchestrator'),
            Number(c.budget?.allocated || 0),
            Number(c.budget?.spent || 0),
            String(c.primaryMetric?.name || ''),
            String(c.primaryMetric?.value || ''),
            String(c.primaryMetric?.target || ''),
            Array.isArray(c.channels) ? c.channels.join(', ') : '',
            String(c.startDate || ''),
            String(c.endDate || ''),
            JSON.stringify(c),
            nowIso
          ]
        );
      }
      await client.query('DELETE FROM campaigns WHERE id NOT IN (SELECT unnest($1::text[]))', [campaignIds]);
    } else {
      await client.query('DELETE FROM campaigns');
    }

    // 3. Content Items (Atomic Upsert & Reconciliation)
    const contentItems = dbState.contentList || [];
    const contentIds = contentItems.map((item: any) => String(item.id)).filter(Boolean);
    if (contentIds.length > 0) {
      for (const item of contentItems) {
        const words = String(item.body || '').trim().split(/\s+/).filter(Boolean).length;
        await client.query(
          `INSERT INTO content_items (
            id, title, type, platform, status, author_agent,
            word_count, views, clicks, tags_csv, created_at,
            body, payload_json, updated_at
          ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14)
          ON CONFLICT (id) DO UPDATE SET
            title = EXCLUDED.title,
            type = EXCLUDED.type,
            platform = EXCLUDED.platform,
            status = EXCLUDED.status,
            author_agent = EXCLUDED.author_agent,
            word_count = EXCLUDED.word_count,
            views = EXCLUDED.views,
            clicks = EXCLUDED.clicks,
            tags_csv = EXCLUDED.tags_csv,
            created_at = EXCLUDED.created_at,
            body = EXCLUDED.body,
            payload_json = EXCLUDED.payload_json,
            updated_at = EXCLUDED.updated_at`,
          [
            String(item.id),
            String(item.title || ''),
            String(item.type || 'blog'),
            String(item.platform || 'Blog'),
            String(item.status || 'draft'),
            String(item.authorAgent || 'content'),
            words,
            Number(item.metrics?.views || 0),
            Number(item.metrics?.clicks || 0),
            Array.isArray(item.tags) ? item.tags.join(', ') : '',
            String(item.createdAt || ''),
            String(item.body || ''),
            JSON.stringify(item),
            nowIso
          ]
        );
      }
      await client.query('DELETE FROM content_items WHERE id NOT IN (SELECT unnest($1::text[]))', [contentIds]);
    } else {
      await client.query('DELETE FROM content_items');
    }

    // 4. Approvals (Atomic Upsert & Reconciliation)
    const approvalItems = dbState.approvals || [];
    const approvalIds = approvalItems.map((a: any) => String(a.id)).filter(Boolean);
    if (approvalIds.length > 0) {
      for (const a of approvalItems) {
        await client.query(
          `INSERT INTO approvals (
            id, title, agent, content_type, platform, risk_level,
            status, campaign, budget_impact, submitted_at, preview,
            payload_json, updated_at
          ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13)
          ON CONFLICT (id) DO UPDATE SET
            title = EXCLUDED.title,
            agent = EXCLUDED.agent,
            content_type = EXCLUDED.content_type,
            platform = EXCLUDED.platform,
            risk_level = EXCLUDED.risk_level,
            status = EXCLUDED.status,
            campaign = EXCLUDED.campaign,
            budget_impact = EXCLUDED.budget_impact,
            submitted_at = EXCLUDED.submitted_at,
            preview = EXCLUDED.preview,
            payload_json = EXCLUDED.payload_json,
            updated_at = EXCLUDED.updated_at`,
          [
            String(a.id),
            String(a.title || ''),
            String(a.agent || 'orchestrator'),
            String(a.contentType || 'social-post'),
            String(a.platform || ''),
            String(a.riskLevel || 'medium'),
            String(a.status || 'pending'),
            String(a.campaign || ''),
            String(a.budgetImpact || ''),
            String(a.submittedAt || ''),
            String(a.preview || ''),
            JSON.stringify(a),
            nowIso
          ]
        );
      }
      await client.query('DELETE FROM approvals WHERE id NOT IN (SELECT unnest($1::text[]))', [approvalIds]);
    } else {
      await client.query('DELETE FROM approvals');
    }

    // 5. Leads (Atomic Upsert & Reconciliation)
    const leadItems = dbState.leads || [];
    const leadIds = leadItems.map((l: any) => String(l.id)).filter(Boolean);
    if (leadIds.length > 0) {
      for (const l of leadItems) {
        await client.query(
          `INSERT INTO leads (
            id, name, company, role, source, status,
            intent, score, assigned_agent, timestamp, payload_json, updated_at
          ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)
          ON CONFLICT (id) DO UPDATE SET
            name = EXCLUDED.name,
            company = EXCLUDED.company,
            role = EXCLUDED.role,
            source = EXCLUDED.source,
            status = EXCLUDED.status,
            intent = EXCLUDED.intent,
            score = EXCLUDED.score,
            assigned_agent = EXCLUDED.assigned_agent,
            timestamp = EXCLUDED.timestamp,
            payload_json = EXCLUDED.payload_json,
            updated_at = EXCLUDED.updated_at`,
          [
            String(l.id),
            String(l.name || ''),
            String(l.company || ''),
            String(l.role || ''),
            String(l.source || ''),
            String(l.status || 'new'),
            String(l.intent || ''),
            Number(l.score || 0),
            String(l.assignedAgent || 'leads'),
            String(l.timestamp || ''),
            JSON.stringify(l),
            nowIso
          ]
        );
      }
      await client.query('DELETE FROM leads WHERE id NOT IN (SELECT unnest($1::text[]))', [leadIds]);
    } else {
      await client.query('DELETE FROM leads');
    }

    // 6. Social Posts (Atomic Upsert & Reconciliation)
    const socialItems = dbState.socialPosts || [];
    const socialIds = socialItems.map((sp: any) => String(sp.id)).filter(Boolean);
    if (socialIds.length > 0) {
      for (const sp of socialItems) {
        await client.query(
          `INSERT INTO social_posts (
            id, platform, status, day_of_week, scheduled_time,
            author_agent, media_type, content, payload_json, updated_at
          ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)
          ON CONFLICT (id) DO UPDATE SET
            platform = EXCLUDED.platform,
            status = EXCLUDED.status,
            day_of_week = EXCLUDED.day_of_week,
            scheduled_time = EXCLUDED.scheduled_time,
            author_agent = EXCLUDED.author_agent,
            media_type = EXCLUDED.media_type,
            content = EXCLUDED.content,
            payload_json = EXCLUDED.payload_json,
            updated_at = EXCLUDED.updated_at`,
          [
            String(sp.id),
            String(sp.platform || 'LinkedIn'),
            String(sp.status || 'scheduled'),
            String(sp.dayOfWeek || ''),
            String(sp.scheduledTime || ''),
            String(sp.authorAgent || 'social'),
            String(sp.mediaType || 'text'),
            String(sp.content || ''),
            JSON.stringify(sp),
            nowIso
          ]
        );
      }
      await client.query('DELETE FROM social_posts WHERE id NOT IN (SELECT unnest($1::text[]))', [socialIds]);
    } else {
      await client.query('DELETE FROM social_posts');
    }

    // 7. Page Posts (Atomic Upsert & Reconciliation)
    const pagePostItems = dbState.pagePosts || [];
    const pagePostIds = pagePostItems.map((pp: any) => String(pp.id)).filter(Boolean);
    if (pagePostIds.length > 0) {
      for (const pp of pagePostItems) {
        await client.query(
          `INSERT INTO page_posts (
            id, platform, page_name, keyword, status,
            impressions, clicks, engagement_rate, created_at, payload_json, updated_at
          ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)
          ON CONFLICT (id) DO UPDATE SET
            platform = EXCLUDED.platform,
            page_name = EXCLUDED.page_name,
            keyword = EXCLUDED.keyword,
            status = EXCLUDED.status,
            impressions = EXCLUDED.impressions,
            clicks = EXCLUDED.clicks,
            engagement_rate = EXCLUDED.engagement_rate,
            created_at = EXCLUDED.created_at,
            payload_json = EXCLUDED.payload_json,
            updated_at = EXCLUDED.updated_at`,
          [
            String(pp.id),
            String(pp.platform || 'LinkedIn'),
            String(pp.pageName || ''),
            String(pp.keyword || ''),
            String(pp.status || 'live'),
            Number(pp.analytics?.impressions || pp.impressions || 0),
            Number(pp.analytics?.clicks || pp.clicks || 0),
            Number(pp.analytics?.engagementRate || pp.engagementRate || 0),
            String(pp.createdAt || ''),
            JSON.stringify(pp),
            nowIso
          ]
        );
      }
      await client.query('DELETE FROM page_posts WHERE id NOT IN (SELECT unnest($1::text[]))', [pagePostIds]);
    } else {
      await client.query('DELETE FROM page_posts');
    }

    // 8. Integrations (Atomic Upsert & Reconciliation)
    const integrationItems = dbState.integrations || [];
    const integrationIds = integrationItems.map((int: any) => String(int.id)).filter(Boolean);
    if (integrationIds.length > 0) {
      for (const int of integrationItems) {
        await client.query(
          `INSERT INTO integrations (
            id, name, category, status, description, auth_method, last_sync, payload_json, updated_at
          ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)
          ON CONFLICT (id) DO UPDATE SET
            name = EXCLUDED.name,
            category = EXCLUDED.category,
            status = EXCLUDED.status,
            description = EXCLUDED.description,
            auth_method = EXCLUDED.auth_method,
            last_sync = EXCLUDED.last_sync,
            payload_json = EXCLUDED.payload_json,
            updated_at = EXCLUDED.updated_at`,
          [
            String(int.id),
            String(int.name || ''),
            String(int.category || 'ai'),
            String(int.status || 'disconnected'),
            String(int.description || ''),
            String(int.authMethod || 'OAuth 2.0'),
            String(int.lastSync || ''),
            JSON.stringify(int),
            nowIso
          ]
        );
      }
      await client.query('DELETE FROM integrations WHERE id NOT IN (SELECT unnest($1::text[]))', [integrationIds]);
    } else {
      await client.query('DELETE FROM integrations');
    }

    await client.query('COMMIT');
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Error syncing workspace state to PostgreSQL:', err);
    throw err;
  } finally {
    client.release();
  }
}

// ----------------------------------------------------------------------------
// Multi-User Isolated Workspace Storage (PostgreSQL)
// ----------------------------------------------------------------------------
export async function readUserWorkspaceFromSql(userEmail: string): Promise<any | null> {
  const normEmail = (userEmail || '').trim().toLowerCase();
  if (!normEmail) return null;

  try {
    const pool = getPrimaryPgPool();
    const res = await pool.query(
      'SELECT workspace_json FROM user_workspaces WHERE LOWER(user_email) = LOWER($1)',
      [normEmail]
    );
    if (res.rows && res.rows.length > 0 && res.rows[0].workspace_json) {
      return JSON.parse(String(res.rows[0].workspace_json));
    }
  } catch (err) {
    console.warn(`[SQL Engine] Failed reading workspace for ${normEmail} from Postgres:`, err);
  }
  return null;
}

export async function writeUserWorkspaceToSql(userEmail: string, workspaceData: any): Promise<void> {
  const normEmail = (userEmail || '').trim().toLowerCase();
  if (!normEmail || !workspaceData) return;

  const nowIso = new Date().toISOString();
  const jsonStr = JSON.stringify(workspaceData);

  try {
    const pool = getPrimaryPgPool();
    await pool.query(
      `INSERT INTO user_workspaces (user_email, workspace_json, updated_at)
       VALUES ($1, $2, $3)
       ON CONFLICT (user_email) DO UPDATE
       SET workspace_json = EXCLUDED.workspace_json,
           updated_at = EXCLUDED.updated_at`,
      [normEmail, jsonStr, nowIso]
    );
  } catch (err) {
    console.error(`[SQL Engine] Error saving workspace for ${normEmail} to Postgres:`, err);
    throw err;
  }
}

export async function readAllUserWorkspacesFromSql(): Promise<Record<string, any>> {
  const result: Record<string, any> = {};
  try {
    const pool = getPrimaryPgPool();
    const res = await pool.query('SELECT user_email, workspace_json FROM user_workspaces');
    for (const row of res.rows || []) {
      const email = String(row.user_email || '').trim().toLowerCase();
      if (email && row.workspace_json) {
        try {
          result[email] = JSON.parse(String(row.workspace_json));
        } catch {}
      }
    }
  } catch (err) {
    console.warn('[SQL Engine] Error listing user workspaces from Postgres:', err);
  }
  return result;
}

// ----------------------------------------------------------------------------
// User Authentication & Management in PostgreSQL
// ----------------------------------------------------------------------------
export async function findUserByEmail(email: string): Promise<any | null> {
  const normEmail = (email || '').trim().toLowerCase();
  if (!normEmail) return null;

  try {
    const pool = getPrimaryPgPool();
    const res = await pool.query(
      'SELECT id, name, email, password, role, title, initials, payload_json, updated_at FROM users WHERE LOWER(email) = LOWER($1)',
      [normEmail]
    );
    if (res.rows && res.rows.length > 0) {
      const row = res.rows[0];
      let userObj: any = {};
      try {
        userObj = JSON.parse(row.payload_json);
      } catch {}
      return {
        ...userObj,
        id: row.id,
        name: row.name,
        email: row.email,
        password: row.password,
        role: row.role,
        title: row.title,
        initials: row.initials
      };
    }
  } catch (err) {
    console.error(`[SQL Engine] Failed finding user by email ${normEmail}:`, err);
  }
  return null;
}

export async function createUserInDb(user: {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  role: string;
  title?: string;
  initials?: string;
  permissions?: any;
}): Promise<any> {
  const normEmail = user.email.trim().toLowerCase();
  const nowIso = new Date().toISOString();
  const safePayload = {
    id: user.id,
    name: user.name,
    email: normEmail,
    role: user.role,
    title: user.title || 'Workspace Owner',
    initials: user.initials || 'U',
    isCustom: true,
    permissions: user.permissions || {
      canManageSettings: true,
      canManageApiKeys: true,
      canApproveSpends: true,
      canCreateAssets: true,
      canPublishLive: true,
      isReadOnly: false
    }
  };

  const pool = getPrimaryPgPool();
  await pool.query(
    `INSERT INTO users (id, name, email, password, role, title, initials, payload_json, updated_at)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
     ON CONFLICT (email) DO UPDATE
     SET name = EXCLUDED.name,
         password = EXCLUDED.password,
         role = EXCLUDED.role,
         title = EXCLUDED.title,
         initials = EXCLUDED.initials,
         payload_json = EXCLUDED.payload_json,
         updated_at = EXCLUDED.updated_at`,
    [
      user.id,
      user.name,
      normEmail,
      user.passwordHash,
      user.role,
      user.title || '',
      user.initials || 'U',
      JSON.stringify(safePayload),
      nowIso
    ]
  );

  return safePayload;
}

export async function readAllUsersFromSql(): Promise<any[]> {
  const users: any[] = [];
  try {
    const pool = getPrimaryPgPool();
    const res = await pool.query('SELECT payload_json FROM users ORDER BY updated_at DESC');
    for (const row of res.rows || []) {
      if (row.payload_json) {
        try {
          users.push(JSON.parse(row.payload_json));
        } catch {}
      }
    }
  } catch (err) {
    console.warn('[SQL Engine] Error reading users from Postgres:', err);
  }
  return users;
}

export async function writeUserToSql(user: any): Promise<void> {
  if (!user || !user.email) return;
  const normEmail = String(user.email).trim().toLowerCase();
  const nowIso = new Date().toISOString();
  const id = String(user.id || `usr-${Date.now()}`);
  const name = String(user.name || 'User');
  let password = String(user.password || '');
  if (password && !password.startsWith('$2a$') && !password.startsWith('$2b$')) {
    password = await bcrypt.hash(password, 10);
  }
  const role = String(user.role || 'owner');
  const title = String(user.title || '');
  const initials = String(user.initials || 'U');
  const payloadJson = JSON.stringify(user);

  try {
    const pool = getPrimaryPgPool();
    await pool.query(
      `INSERT INTO users (id, name, email, password, role, title, initials, payload_json, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       ON CONFLICT (email) DO UPDATE
       SET name = EXCLUDED.name,
           password = EXCLUDED.password,
           role = EXCLUDED.role,
           title = EXCLUDED.title,
           initials = EXCLUDED.initials,
           payload_json = EXCLUDED.payload_json,
           updated_at = EXCLUDED.updated_at`,
      [id, name, normEmail, password, role, title, initials, payloadJson, nowIso]
    );
  } catch (err) {
    console.error(`[SQL Engine] Error saving user ${normEmail} to Postgres:`, err);
  }
}

// ----------------------------------------------------------------------------
// Security Audit Logging (PostgreSQL)
// ----------------------------------------------------------------------------
export async function recordAuditLog(
  userEmail: string,
  action: string,
  ipAddress?: string,
  userAgent?: string,
  details?: any
): Promise<void> {
  try {
    const pool = getPrimaryPgPool();
    const id = `audit-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    const nowIso = new Date().toISOString();
    const detailsJson = JSON.stringify(details || {});

    await pool.query(
      `INSERT INTO audit_logs (id, user_email, action, ip_address, user_agent, details_json, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [
        id,
        (userEmail || 'system').toLowerCase(),
        action,
        ipAddress || 'unknown',
        (userAgent || 'unknown').slice(0, 500),
        detailsJson,
        nowIso
      ]
    );
  } catch (err) {
    console.warn('[Audit Log] Failed recording audit entry:', err);
  }
}
