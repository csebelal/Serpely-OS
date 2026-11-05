import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import initSqlJs, { type Database as SqlJsDatabase } from 'sql.js';
import pg from 'pg';

const { Pool } = pg;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Canonical DATA_DIR anchored to the backend package directory
const CANONICAL_BACKEND_DATA = path.resolve(__dirname, '../../data');
const CWD_DATA = path.resolve(process.cwd(), 'data');

function resolveDataDirectory(): { dataDir: string; dbPath: string } {
  const canonicalFile = path.join(CANONICAL_BACKEND_DATA, 'serpely-os.sqlite');
  const cwdFile = path.join(CWD_DATA, 'serpely-os.sqlite');

  // If DB exists in canonical backend/data, always use it
  if (fs.existsSync(canonicalFile)) {
    return { dataDir: CANONICAL_BACKEND_DATA, dbPath: canonicalFile };
  }
  // If DB exists in process.cwd()/data and is non-empty, copy it to canonical
  if (fs.existsSync(cwdFile)) {
    try {
      if (!fs.existsSync(CANONICAL_BACKEND_DATA)) {
        fs.mkdirSync(CANONICAL_BACKEND_DATA, { recursive: true });
      }
      fs.copyFileSync(cwdFile, canonicalFile);
      return { dataDir: CANONICAL_BACKEND_DATA, dbPath: canonicalFile };
    } catch {
      return { dataDir: CWD_DATA, dbPath: cwdFile };
    }
  }
  return { dataDir: CANONICAL_BACKEND_DATA, dbPath: canonicalFile };
}

const resolvedPaths = resolveDataDirectory();
export const DATA_DIR = resolvedPaths.dataDir;
export const SQLITE_DB_PATH = resolvedPaths.dbPath;

export type SqlEngineType = 'sqlite' | 'postgres';

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
      company TEXT NOT NULL,
      role TEXT,
      source TEXT,
      status TEXT NOT NULL,
      intent TEXT,
      score INTEGER DEFAULT 0,
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
      title TEXT NOT NULL,
      type TEXT NOT NULL,
      subject_line TEXT NOT NULL,
      audience_segment TEXT,
      status TEXT NOT NULL,
      recipients_count INTEGER DEFAULT 0,
      open_rate REAL DEFAULT 0,
      ctr REAL DEFAULT 0,
      risk_level TEXT,
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
      trigger_event TEXT NOT NULL,
      active INTEGER DEFAULT 1,
      times_triggered INTEGER DEFAULT 0,
      last_triggered TEXT,
      pipeline_csv TEXT,
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
      agent TEXT NOT NULL,
      confidence INTEGER DEFAULT 0,
      learning TEXT NOT NULL,
      supporting_data TEXT,
      date_logged TEXT,
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
      key_kpi TEXT,
      author TEXT,
      summary TEXT,
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
      password TEXT,
      role TEXT NOT NULL DEFAULT 'owner',
      title TEXT,
      initials TEXT,
      payload_json TEXT NOT NULL,
      updated_at TEXT NOT NULL
    )`
  }
];

let sqliteDb: SqlJsDatabase | null = null;
let pgPool: pg.Pool | null = null;
let activeEngine: SqlEngineType = 'sqlite';

export function persistSqliteToDisk() {
  if (!sqliteDb) return;
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    const binaryArray = sqliteDb.export();
    fs.writeFileSync(SQLITE_DB_PATH, Buffer.from(binaryArray));
  } catch (err) {
    console.error('Failed to write SQLite binary to disk:', err);
  }
}

function readEntitiesFromSqliteTable(tableName: string, fallbackList: any[]): any[] {
  if (!sqliteDb) return fallbackList;
  try {
    const res = sqliteDb.exec(`SELECT payload_json FROM ${tableName}`);
    if (!res || res.length === 0 || !res[0].values) {
      return [];
    }
    const items: any[] = [];
    for (const row of res[0].values) {
      const rawJson = row[0];
      if (typeof rawJson === 'string' && rawJson.trim()) {
        try {
          items.push(JSON.parse(rawJson));
        } catch {
          // skip malformed row
        }
      }
    }
    return items;
  } catch (err) {
    console.error(`Failed reading table ${tableName} from SQLite:`, err);
    return fallbackList;
  }
}

function hydrateStateFromSqlite<T extends Record<string, any>>(defaultState: T): T {
  const hydrated: Record<string, any> = structuredClone(defaultState);

  for (const def of TABLE_DEFINITIONS) {
    if (def.stateKey) {
      hydrated[def.stateKey] = readEntitiesFromSqliteTable(
        def.name,
        defaultState[def.stateKey] || []
      );
    }
  }

  if (sqliteDb) {
    try {
      const kvRes = sqliteDb.exec(`SELECT key, value_json FROM workspace_kv`);
      if (kvRes && kvRes.length > 0 && kvRes[0].values) {
        for (const [k, rawVal] of kvRes[0].values) {
          const keyStr = String(k || '');
          if (typeof rawVal === 'string' && rawVal.trim()) {
            try {
              const parsed = JSON.parse(rawVal);
              if (keyStr === 'brandProfile') {
                hydrated.brandProfile = {
                  ...defaultState.brandProfile,
                  ...parsed
                };
              } else if (keyStr === 'geoScore') {
                hydrated.geoScore = {
                  ...defaultState.geoScore,
                  ...parsed
                };
              } else if (keyStr === 'oauthSessions') {
                hydrated.oauthSessions = {
                  ...(defaultState.oauthSessions || {}),
                  ...(parsed || {}),
                  facebook: {
                    ...(defaultState.oauthSessions?.facebook || {}),
                    ...(parsed?.facebook || {})
                  },
                  linkedin: {
                    ...(defaultState.oauthSessions?.linkedin || {}),
                    ...(parsed?.linkedin || {})
                  },
                  google: {
                    ...(defaultState.oauthSessions?.google || {}),
                    ...(parsed?.google || {})
                  },
                  hubspot: {
                    ...(defaultState.oauthSessions?.hubspot || {}),
                    ...(parsed?.hubspot || {})
                  },
                  smtp: {
                    ...(defaultState.oauthSessions?.smtp || {}),
                    ...(parsed?.smtp || {})
                  },
                  credentials: {
                    ...(defaultState.oauthSessions?.credentials || {}),
                    ...(parsed?.credentials || {})
                  }
                };
              } else if (keyStr === 'communityMessages') {
                if (!Array.isArray(hydrated.communityMessages) || hydrated.communityMessages.length === 0) {
                  hydrated.communityMessages = parsed;
                }
              } else if (keyStr in hydrated) {
                hydrated[keyStr] = parsed;
              }
            } catch {
              // ignore malformed KV entry
            }
          }
        }
      }
    } catch (err) {
      console.error('Failed reading workspace_kv from SQLite:', err);
    }
  }

  return hydrated as T;
}

function retireLegacyJsonFile(legacyJsonPath?: string) {
  if (!legacyJsonPath) return;
  try {
    if (fs.existsSync(legacyJsonPath)) {
      const migratedBackupPath = `${legacyJsonPath}.migrated`;
      fs.renameSync(legacyJsonPath, migratedBackupPath);
    }
  } catch (err) {
    console.warn('Could not archive legacy JSON file after SQL migration:', err);
  }
}

async function initOptionalPostgresPool(connectionString: string): Promise<boolean> {
  try {
    const pool = new Pool({
      connectionString: connectionString.trim(),
      connectionTimeoutMillis: 6000,
      ssl:
        connectionString.includes('localhost') || connectionString.includes('127.0.0.1')
          ? false
          : { rejectUnauthorized: false }
    });

    const client = await pool.connect();
    try {
      await client.query('SELECT 1');
      for (const table of TABLE_DEFINITIONS) {
        await client.query(table.createSql);
      }
    } finally {
      client.release();
    }

    pgPool = pool;
    activeEngine = 'postgres';
    console.log('✅ Connected successfully to external PostgreSQL database!');
    return true;
  } catch (err: any) {
    console.warn(
      'External PostgreSQL connection failed:',
      err?.message || err
    );
    pgPool = null;
    activeEngine = 'sqlite';
    return false;
  }
}

export function getActiveEngine(): SqlEngineType {
  return activeEngine;
}

export function getDbConnectionInfo() {
  const url = process.env.DATABASE_URL || process.env.POSTGRES_URL || '';
  let host = '';
  if (url && url.includes('@')) {
    host = url.split('@')[1]?.split('/')[0] || '';
  }
  return {
    engine: activeEngine,
    connected: Boolean(pgPool && activeEngine === 'postgres'),
    hasConfiguredUrl: Boolean(url),
    host: host || 'External PostgreSQL',
    databaseUrlMasked: url ? `${url.slice(0, 14)}••••${url.slice(-8)}` : ''
  };
}

export async function testPostgresConnection(connectionString: string): Promise<{ success: boolean; message: string; tablesCount?: number }> {
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
        message: 'Successfully connected to external PostgreSQL database! All 14 relational tables verified.',
        tablesCount: TABLE_DEFINITIONS.length
      };
    } finally {
      client.release();
      await pool.end();
    }
  } catch (err: any) {
    return { success: false, message: `PostgreSQL connection failed: ${err?.message || err}` };
  }
}

async function hydrateStateFromPostgres<T extends Record<string, any>>(
  defaultState: T
): Promise<T | null> {
  if (!pgPool) return null;
  try {
    const countRes = await pgPool.query('SELECT COUNT(*) AS cnt FROM workspace_kv');
    const kvCount = Number(countRes.rows?.[0]?.cnt || 0);
    if (kvCount === 0) {
      return null;
    }

    const hydrated: Record<string, any> = structuredClone(defaultState);

    for (const def of TABLE_DEFINITIONS) {
      if (def.stateKey) {
        const res = await pgPool.query(`SELECT payload_json FROM ${def.name}`);
        hydrated[def.stateKey] = (res.rows || [])
          .map(r => {
            try {
              return JSON.parse(String(r.payload_json));
            } catch {
              return null;
            }
          })
          .filter(Boolean);
      }
    }

    const kvRows = await pgPool.query('SELECT key, value_json FROM workspace_kv');
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
            ...(parsed || {}),
            facebook: {
              ...(defaultState.oauthSessions?.facebook || {}),
              ...(parsed?.facebook || {})
            },
            linkedin: {
              ...(defaultState.oauthSessions?.linkedin || {}),
              ...(parsed?.linkedin || {})
            },
            google: {
              ...(defaultState.oauthSessions?.google || {}),
              ...(parsed?.google || {})
            },
            hubspot: {
              ...(defaultState.oauthSessions?.hubspot || {}),
              ...(parsed?.hubspot || {})
            },
            smtp: {
              ...(defaultState.oauthSessions?.smtp || {}),
              ...(parsed?.smtp || {})
            },
            credentials: {
              ...(defaultState.oauthSessions?.credentials || {}),
              ...(parsed?.credentials || {})
            }
          };
        } else if (keyStr === 'communityMessages') {
          if (!Array.isArray(hydrated.communityMessages) || hydrated.communityMessages.length === 0) {
            hydrated.communityMessages = parsed;
          }
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

async function syncStateToPostgres(dbState: any, nowIso: string): Promise<void> {
  if (!pgPool) return;
  const client = await pgPool.connect();
  try {
    await client.query('BEGIN');

    // Sync workspace_kv
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

    // Sync campaigns
    await client.query('DELETE FROM campaigns');
    for (const c of dbState.campaigns || []) {
      await client.query(
        `INSERT INTO campaigns (
          id, name, status, current_stage, lead_agent,
          budget_allocated, budget_spent, primary_metric_name,
          primary_metric_value, primary_metric_target, channels_csv,
          start_date, end_date, payload_json, updated_at
        ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15)`,
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

    // Sync content_items
    await client.query('DELETE FROM content_items');
    for (const item of dbState.contentList || []) {
      const words = String(item.body || '').trim().split(/\s+/).filter(Boolean).length;
      await client.query(
        `INSERT INTO content_items (
          id, title, type, platform, status, author_agent,
          word_count, views, clicks, tags_csv, created_at,
          body, payload_json, updated_at
        ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14)`,
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

    // Sync approvals
    await client.query('DELETE FROM approvals');
    for (const a of dbState.approvals || []) {
      await client.query(
        `INSERT INTO approvals (
          id, title, agent, content_type, platform, risk_level,
          status, campaign, budget_impact, submitted_at, preview,
          payload_json, updated_at
        ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13)`,
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

    // Sync leads
    await client.query('DELETE FROM leads');
    for (const l of dbState.leads || []) {
      await client.query(
        `INSERT INTO leads (
          id, name, company, role, source, status,
          intent, score, assigned_agent, timestamp, payload_json, updated_at
        ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)`,
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

    // Sync email_campaigns
    await client.query('DELETE FROM email_campaigns');
    for (const e of dbState.emailCampaigns || []) {
      await client.query(
        `INSERT INTO email_campaigns (
          id, title, type, subject_line, audience_segment,
          status, recipients_count, open_rate, ctr, risk_level,
          payload_json, updated_at
        ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)`,
        [
          String(e.id),
          String(e.title || ''),
          String(e.type || 'announcement'),
          String(e.subjectLine || ''),
          String(e.audienceSegment || ''),
          String(e.status || 'draft'),
          Number(e.recipientsCount || 0),
          Number(e.openRate || 0),
          Number(e.ctr || 0),
          String(e.riskLevel || 'medium'),
          JSON.stringify(e),
          nowIso
        ]
      );
    }

    // Sync email_sequences
    await client.query('DELETE FROM email_sequences');
    for (const s of dbState.emailSequences || []) {
      await client.query(
        `INSERT INTO email_sequences (
          id, name, trigger_event, target_audience, status,
          steps_count, enrolled, completed, avg_open_rate,
          payload_json, updated_at
        ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)`,
        [
          String(s.id),
          String(s.name || ''),
          String(s.triggerEvent || ''),
          String(s.targetAudience || ''),
          String(s.status || 'active'),
          Array.isArray(s.steps) ? s.steps.length : 0,
          Number(s.overallMetrics?.enrolled || 0),
          Number(s.overallMetrics?.completed || 0),
          Number(s.overallMetrics?.avgOpenRate || 0),
          JSON.stringify(s),
          nowIso
        ]
      );
    }

    // Sync social_posts
    await client.query('DELETE FROM social_posts');
    for (const p of dbState.socialPosts || []) {
      await client.query(
        `INSERT INTO social_posts (
          id, platform, status, day_of_week, scheduled_time,
          author_agent, media_type, content, payload_json, updated_at
        ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)`,
        [
          String(p.id),
          String(p.platform || 'LinkedIn'),
          String(p.status || 'scheduled'),
          String(p.dayOfWeek || ''),
          String(p.scheduledTime || ''),
          String(p.authorAgent || 'social'),
          String(p.mediaType || 'text'),
          String(p.content || ''),
          JSON.stringify(p),
          nowIso
        ]
      );
    }

    // Sync page_posts
    await client.query('DELETE FROM page_posts');
    for (const pp of dbState.pagePosts || []) {
      await client.query(
        `INSERT INTO page_posts (
          id, platform, page_name, keyword, status,
          impressions, clicks, engagement_rate, created_at,
          payload_json, updated_at
        ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)`,
        [
          String(pp.id),
          String(pp.platform || 'LinkedIn'),
          String(pp.pageName || ''),
          String(pp.keyword || ''),
          String(pp.status || 'draft'),
          Number(pp.analytics?.impressions || 0),
          Number(pp.analytics?.clicks || 0),
          Number(pp.analytics?.engagementRate || 0),
          String(pp.createdAt || ''),
          JSON.stringify(pp),
          nowIso
        ]
      );
    }

    // Sync automations
    await client.query('DELETE FROM automations');
    for (const au of dbState.automations || []) {
      await client.query(
        `INSERT INTO automations (
          id, name, trigger_event, active, times_triggered,
          last_triggered, pipeline_csv, payload_json, updated_at
        ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)`,
        [
          String(au.id),
          String(au.name || ''),
          String(au.triggerEvent || ''),
          au.active ? 1 : 0,
          Number(au.timesTriggered || 0),
          String(au.lastTriggered || ''),
          Array.isArray(au.actionPipeline) ? au.actionPipeline.join(' -> ') : '',
          JSON.stringify(au),
          nowIso
        ]
      );
    }

    // Sync memories
    await client.query('DELETE FROM memories');
    for (const m of dbState.memories || []) {
      await client.query(
        `INSERT INTO memories (
          id, category, agent, confidence, learning,
          supporting_data, date_logged, payload_json, updated_at
        ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)`,
        [
          String(m.id),
          String(m.category || 'winning-hook'),
          String(m.agent || 'memory'),
          Number(m.confidence || 0),
          String(m.learning || ''),
          String(m.supportingData || ''),
          String(m.dateLogged || ''),
          JSON.stringify(m),
          nowIso
        ]
      );
    }

    // Sync reports
    await client.query('DELETE FROM reports');
    for (const r of dbState.reports || []) {
      await client.query(
        `INSERT INTO reports (
          id, title, period, type, key_kpi, author,
          summary, payload_json, updated_at
        ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)`,
        [
          String(r.id),
          String(r.title || ''),
          String(r.period || ''),
          String(r.type || ''),
          String(r.keyKpi || ''),
          String(r.author || ''),
          String(r.summary || ''),
          JSON.stringify(r),
          nowIso
        ]
      );
    }

    // Sync integrations
    await client.query('DELETE FROM integrations');
    for (const intg of dbState.integrations || []) {
      await client.query(
        `INSERT INTO integrations (
          id, name, category, status, auth_method,
          last_sync, payload_json, updated_at
        ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8)`,
        [
          String(intg.id),
          String(intg.name || ''),
          String(intg.category || ''),
          String(intg.status || 'disconnected'),
          String(intg.authMethod || ''),
          String(intg.lastSync || ''),
          JSON.stringify(intg),
          nowIso
        ]
      );
    }

    // Sync community_messages
    await client.query('DELETE FROM community_messages');
    for (const cm of dbState.communityMessages || []) {
      await client.query(
        `INSERT INTO community_messages (
          id, sender, platform, type, intent,
          sentiment, status, message, draft_reply,
          timestamp, payload_json, updated_at
        ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)`,
        [
          String(cm.id),
          String(cm.sender || ''),
          String(cm.platform || 'LinkedIn'),
          String(cm.type || 'comment'),
          String(cm.intent || 'question'),
          String(cm.sentiment || 'neutral'),
          String(cm.status || 'pending'),
          String(cm.message || ''),
          String(cm.draftReply || ''),
          String(cm.timestamp || ''),
          JSON.stringify(cm),
          nowIso
        ]
      );
    }

    await client.query('COMMIT');
  } catch (err) {
    await client.query('ROLLBACK').catch(() => {});
    console.error('Error syncing workspace state to PostgreSQL:', err);
  } finally {
    client.release();
  }
}

/**
 * Initializes the server-side SQL database (SQLite by default, or PostgreSQL via POSTGRES_URL).
 * Automatically migrates legacy JSON file once if present and uses SQL exclusively thereafter.
 */
export async function initPrimarySqlDatabase<T extends Record<string, any>>(
  defaultSeedState: T,
  legacyJsonPath?: string
): Promise<T> {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }

  const SQL = await initSqlJs();
  const existedOnDisk = fs.existsSync(SQLITE_DB_PATH);

  if (existedOnDisk) {
    try {
      const fileBuffer = fs.readFileSync(SQLITE_DB_PATH);
      sqliteDb = new SQL.Database(fileBuffer);
    } catch (err) {
      console.error('Corrupted SQLite file, recreating fresh SQLite DB:', err);
      sqliteDb = new SQL.Database();
    }
  } else {
    sqliteDb = new SQL.Database();
  }

  // Ensure all 14 normalized relational tables exist in SQLite
  for (const table of TABLE_DEFINITIONS) {
    sqliteDb.run(table.createSql);
  }

  // Check optional PostgreSQL environment variable (POSTGRES_URL or DATABASE_URL)
  const envPgUrl = process.env.POSTGRES_URL || process.env.DATABASE_URL;
  if (envPgUrl && envPgUrl.startsWith('postgres')) {
    await initOptionalPostgresPool(envPgUrl);
  }

  // If PostgreSQL is active and already populated, hydrate directly from PostgreSQL
  if (activeEngine === 'postgres' && pgPool) {
    const pgState = await hydrateStateFromPostgres(defaultSeedState);
    if (pgState) {
      await syncWorkspaceToSql(pgState);
      retireLegacyJsonFile(legacyJsonPath);
      return pgState;
    }
  }

  // Check if SQLite already contains workspace records
  const kvCountRes = sqliteDb.exec('SELECT COUNT(*) AS cnt FROM workspace_kv');
  const existingKvCount = Number(kvCountRes?.[0]?.values?.[0]?.[0] || 0);

  if (existingKvCount > 0 && existedOnDisk) {
    // Hydrate workspace directly from SQL tables
    const sqlState = hydrateStateFromSqlite(defaultSeedState);
    retireLegacyJsonFile(legacyJsonPath);
    if (activeEngine === 'postgres' && pgPool) {
      await syncStateToPostgres(sqlState, new Date().toISOString());
    }
    return sqlState;
  }

  // First boot or empty SQL tables: check if legacy JSON file exists for one-time migration
  let initialStateToPersist: T = structuredClone(defaultSeedState);

  if (legacyJsonPath && fs.existsSync(legacyJsonPath)) {
    try {
      const raw = fs.readFileSync(legacyJsonPath, 'utf-8');
      const parsed = JSON.parse(raw);
      initialStateToPersist = {
        ...defaultSeedState,
        ...parsed,
        brandProfile: {
          ...defaultSeedState.brandProfile,
          ...(parsed.brandProfile || {})
        },
        geoScore: {
          ...defaultSeedState.geoScore,
          ...(parsed.geoScore || {})
        },
        oauthSessions: {
          ...(defaultSeedState.oauthSessions || {}),
          ...(parsed.oauthSessions || {}),
          facebook: {
            ...(defaultSeedState.oauthSessions?.facebook || {}),
            ...(parsed.oauthSessions?.facebook || {})
          },
          linkedin: {
            ...(defaultSeedState.oauthSessions?.linkedin || {}),
            ...(parsed.oauthSessions?.linkedin || {})
          }
        }
      };
    } catch (err) {
      console.warn('Failed reading legacy JSON for migration, using seed state:', err);
    }
  }

  await syncWorkspaceToSql(initialStateToPersist);
  retireLegacyJsonFile(legacyJsonPath);
  return initialStateToPersist;
}

export async function syncWorkspaceToSql(dbState: any): Promise<void> {
  if (!sqliteDb) return;
  const nowIso = new Date().toISOString();

  try {
    sqliteDb.run('BEGIN TRANSACTION');

    // 1. Campaigns
    sqliteDb.run('DELETE FROM campaigns');
    const campaignStmt = sqliteDb.prepare(
      `INSERT INTO campaigns (
        id, name, status, current_stage, lead_agent,
        budget_allocated, budget_spent, primary_metric_name,
        primary_metric_value, primary_metric_target, channels_csv,
        start_date, end_date, payload_json, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    );
    for (const c of dbState.campaigns || []) {
      campaignStmt.run([
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
      ]);
    }
    campaignStmt.free();

    // 2. Content Items
    sqliteDb.run('DELETE FROM content_items');
    const contentStmt = sqliteDb.prepare(
      `INSERT INTO content_items (
        id, title, type, platform, status, author_agent,
        word_count, views, clicks, tags_csv, created_at,
        body, payload_json, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    );
    for (const item of dbState.contentList || []) {
      const words = String(item.body || '')
        .trim()
        .split(/\s+/)
        .filter(Boolean).length;
      contentStmt.run([
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
      ]);
    }
    contentStmt.free();

    // 3. Approvals
    sqliteDb.run('DELETE FROM approvals');
    const approvalStmt = sqliteDb.prepare(
      `INSERT INTO approvals (
        id, title, agent, content_type, platform, risk_level,
        status, campaign, budget_impact, submitted_at, preview,
        payload_json, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    );
    for (const a of dbState.approvals || []) {
      approvalStmt.run([
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
      ]);
    }
    approvalStmt.free();

    // 4. Leads
    sqliteDb.run('DELETE FROM leads');
    const leadStmt = sqliteDb.prepare(
      `INSERT INTO leads (
        id, name, company, role, source, status,
        intent, score, assigned_agent, timestamp, payload_json, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    );
    for (const l of dbState.leads || []) {
      leadStmt.run([
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
      ]);
    }
    leadStmt.free();

    // 5. Email Campaigns
    sqliteDb.run('DELETE FROM email_campaigns');
    const emailCmpStmt = sqliteDb.prepare(
      `INSERT INTO email_campaigns (
        id, title, type, subject_line, audience_segment,
        status, recipients_count, open_rate, ctr, risk_level,
        payload_json, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    );
    for (const e of dbState.emailCampaigns || []) {
      emailCmpStmt.run([
        String(e.id),
        String(e.title || ''),
        String(e.type || 'announcement'),
        String(e.subjectLine || ''),
        String(e.audienceSegment || ''),
        String(e.status || 'draft'),
        Number(e.recipientsCount || 0),
        Number(e.openRate || 0),
        Number(e.ctr || 0),
        String(e.riskLevel || 'medium'),
        JSON.stringify(e),
        nowIso
      ]);
    }
    emailCmpStmt.free();

    // 6. Email Sequences
    sqliteDb.run('DELETE FROM email_sequences');
    const seqStmt = sqliteDb.prepare(
      `INSERT INTO email_sequences (
        id, name, trigger_event, target_audience, status,
        steps_count, enrolled, completed, avg_open_rate,
        payload_json, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    );
    for (const s of dbState.emailSequences || []) {
      seqStmt.run([
        String(s.id),
        String(s.name || ''),
        String(s.triggerEvent || ''),
        String(s.targetAudience || ''),
        String(s.status || 'active'),
        Array.isArray(s.steps) ? s.steps.length : 0,
        Number(s.overallMetrics?.enrolled || 0),
        Number(s.overallMetrics?.completed || 0),
        Number(s.overallMetrics?.avgOpenRate || 0),
        JSON.stringify(s),
        nowIso
      ]);
    }
    seqStmt.free();

    // 7. Social Posts
    sqliteDb.run('DELETE FROM social_posts');
    const socialStmt = sqliteDb.prepare(
      `INSERT INTO social_posts (
        id, platform, status, day_of_week, scheduled_time,
        author_agent, media_type, content, payload_json, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    );
    for (const p of dbState.socialPosts || []) {
      socialStmt.run([
        String(p.id),
        String(p.platform || 'LinkedIn'),
        String(p.status || 'scheduled'),
        String(p.dayOfWeek || ''),
        String(p.scheduledTime || ''),
        String(p.authorAgent || 'social'),
        String(p.mediaType || 'text'),
        String(p.content || ''),
        JSON.stringify(p),
        nowIso
      ]);
    }
    socialStmt.free();

    // 8. Page Posts
    sqliteDb.run('DELETE FROM page_posts');
    const pagePostStmt = sqliteDb.prepare(
      `INSERT INTO page_posts (
        id, platform, page_name, keyword, status,
        impressions, clicks, engagement_rate, created_at,
        payload_json, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    );
    for (const pp of dbState.pagePosts || []) {
      pagePostStmt.run([
        String(pp.id),
        String(pp.platform || 'LinkedIn'),
        String(pp.pageName || ''),
        String(pp.keyword || ''),
        String(pp.status || 'draft'),
        Number(pp.analytics?.impressions || 0),
        Number(pp.analytics?.clicks || 0),
        Number(pp.analytics?.engagementRate || 0),
        String(pp.createdAt || ''),
        JSON.stringify(pp),
        nowIso
      ]);
    }
    pagePostStmt.free();

    // 9. Automations
    sqliteDb.run('DELETE FROM automations');
    const autoStmt = sqliteDb.prepare(
      `INSERT INTO automations (
        id, name, trigger_event, active, times_triggered,
        last_triggered, pipeline_csv, payload_json, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`
    );
    for (const au of dbState.automations || []) {
      autoStmt.run([
        String(au.id),
        String(au.name || ''),
        String(au.triggerEvent || ''),
        au.active ? 1 : 0,
        Number(au.timesTriggered || 0),
        String(au.lastTriggered || ''),
        Array.isArray(au.actionPipeline) ? au.actionPipeline.join(' -> ') : '',
        JSON.stringify(au),
        nowIso
      ]);
    }
    autoStmt.free();

    // 11. Memories
    sqliteDb.run('DELETE FROM memories');
    const memStmt = sqliteDb.prepare(
      `INSERT INTO memories (
        id, category, agent, confidence, learning,
        supporting_data, date_logged, payload_json, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`
    );
    for (const m of dbState.memories || []) {
      memStmt.run([
        String(m.id),
        String(m.category || 'winning-hook'),
        String(m.agent || 'memory'),
        Number(m.confidence || 0),
        String(m.learning || ''),
        String(m.supportingData || ''),
        String(m.dateLogged || ''),
        JSON.stringify(m),
        nowIso
      ]);
    }
    memStmt.free();

    // 12. Reports
    sqliteDb.run('DELETE FROM reports');
    const repStmt = sqliteDb.prepare(
      `INSERT INTO reports (
        id, title, period, type, key_kpi, author,
        summary, payload_json, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`
    );
    for (const r of dbState.reports || []) {
      repStmt.run([
        String(r.id),
        String(r.title || ''),
        String(r.period || ''),
        String(r.type || ''),
        String(r.keyKpi || ''),
        String(r.author || ''),
        String(r.summary || ''),
        JSON.stringify(r),
        nowIso
      ]);
    }
    repStmt.free();

    // 13. Integrations
    sqliteDb.run('DELETE FROM integrations');
    const intStmt = sqliteDb.prepare(
      `INSERT INTO integrations (
        id, name, category, status, auth_method,
        last_sync, payload_json, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
    );
    for (const intg of dbState.integrations || []) {
      intStmt.run([
        String(intg.id),
        String(intg.name || ''),
        String(intg.category || ''),
        String(intg.status || 'disconnected'),
        String(intg.authMethod || ''),
        String(intg.lastSync || ''),
        JSON.stringify(intg),
        nowIso
      ]);
    }
    intStmt.free();

    // 14. Community Messages
    sqliteDb.run('DELETE FROM community_messages');
    const cmStmt = sqliteDb.prepare(
      `INSERT INTO community_messages (
        id, sender, platform, type, intent,
        sentiment, status, message, draft_reply,
        timestamp, payload_json, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    );
    for (const cm of dbState.communityMessages || []) {
      cmStmt.run([
        String(cm.id),
        String(cm.sender || ''),
        String(cm.platform || 'LinkedIn'),
        String(cm.type || 'comment'),
        String(cm.intent || 'question'),
        String(cm.sentiment || 'neutral'),
        String(cm.status || 'pending'),
        String(cm.message || ''),
        String(cm.draftReply || ''),
        String(cm.timestamp || ''),
        JSON.stringify(cm),
        nowIso
      ]);
    }
    cmStmt.free();

    // 15. Workspace KV Store
    const kvStmt = sqliteDb.prepare(
      `INSERT OR REPLACE INTO workspace_kv (key, description, value_json, updated_at) VALUES (?, ?, ?, ?)`
    );
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
      kvStmt.run([k, desc, JSON.stringify(val), nowIso]);
    }
    kvStmt.free();

    sqliteDb.run('COMMIT');
    persistSqliteToDisk();

    if (activeEngine === 'postgres' && pgPool) {
      await syncStateToPostgres(dbState, nowIso);
    }
  } catch (err) {
    try {
      sqliteDb.run('ROLLBACK');
    } catch {
      // ignore rollback error
    }
    console.error('Error syncing workspace to SQL database:', err);
  }
}

export async function readUserWorkspaceFromSql(userEmail: string): Promise<any | null> {
  const normEmail = (userEmail || '').trim().toLowerCase();
  if (!normEmail) return null;

  if (activeEngine === 'postgres' && pgPool) {
    try {
      const res = await pgPool.query(
        'SELECT workspace_json FROM user_workspaces WHERE LOWER(user_email) = LOWER($1)',
        [normEmail]
      );
      if (res.rows && res.rows.length > 0 && res.rows[0].workspace_json) {
        return JSON.parse(String(res.rows[0].workspace_json));
      }
    } catch (err) {
      console.warn(`[SQL Engine] Failed reading workspace for ${normEmail} from Postgres:`, err);
    }
  }

  if (sqliteDb) {
    try {
      const stmt = sqliteDb.prepare(
        'SELECT workspace_json FROM user_workspaces WHERE LOWER(user_email) = LOWER(?)'
      );
      stmt.bind([normEmail]);
      if (stmt.step()) {
        const row = stmt.getAsObject();
        stmt.free();
        if (typeof row.workspace_json === 'string' && row.workspace_json.trim()) {
          return JSON.parse(row.workspace_json);
        }
      } else {
        stmt.free();
      }
    } catch (err) {
      console.warn(`[SQL Engine] Failed reading workspace for ${normEmail} from SQLite:`, err);
    }
  }

  return null;
}

export async function writeUserWorkspaceToSql(userEmail: string, workspaceData: any): Promise<void> {
  const normEmail = (userEmail || '').trim().toLowerCase();
  if (!normEmail || !workspaceData) return;

  const nowIso = new Date().toISOString();
  const jsonStr = JSON.stringify(workspaceData);

  if (sqliteDb) {
    try {
      const stmt = sqliteDb.prepare(
        `INSERT OR REPLACE INTO user_workspaces (user_email, workspace_json, updated_at) VALUES (?, ?, ?)`
      );
      stmt.run([normEmail, jsonStr, nowIso]);
      stmt.free();
      persistSqliteToDisk();
    } catch (err) {
      console.error(`[SQL Engine] Error saving workspace for ${normEmail} to SQLite:`, err);
    }
  }

  if (activeEngine === 'postgres' && pgPool) {
    try {
      await pgPool.query(
        `INSERT INTO user_workspaces (user_email, workspace_json, updated_at)
         VALUES ($1, $2, $3)
         ON CONFLICT (user_email) DO UPDATE
         SET workspace_json = EXCLUDED.workspace_json,
             updated_at = EXCLUDED.updated_at`,
        [normEmail, jsonStr, nowIso]
      );
    } catch (err) {
      console.error(`[SQL Engine] Error saving workspace for ${normEmail} to Postgres:`, err);
    }
  }
}

export async function readAllUserWorkspacesFromSql(): Promise<Record<string, any>> {
  const result: Record<string, any> = {};

  if (sqliteDb) {
    try {
      const stmt = sqliteDb.prepare('SELECT user_email, workspace_json FROM user_workspaces');
      while (stmt.step()) {
        const row = stmt.getAsObject();
        const email = String(row.user_email || '').trim().toLowerCase();
        if (email && typeof row.workspace_json === 'string') {
          try {
            result[email] = JSON.parse(row.workspace_json);
          } catch {}
        }
      }
      stmt.free();
    } catch (err) {
      console.warn('[SQL Engine] Error listing user workspaces from SQLite:', err);
    }
  }

  if (activeEngine === 'postgres' && pgPool) {
    try {
      const res = await pgPool.query('SELECT user_email, workspace_json FROM user_workspaces');
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
  }

  return result;
}

export async function readAllUsersFromSql(): Promise<any[]> {
  const users: any[] = [];

  if (sqliteDb) {
    try {
      const stmt = sqliteDb.prepare('SELECT payload_json FROM users');
      while (stmt.step()) {
        const row = stmt.getAsObject();
        if (typeof row.payload_json === 'string') {
          try {
            users.push(JSON.parse(row.payload_json));
          } catch {}
        }
      }
      stmt.free();
    } catch (err) {
      console.warn('[SQL Engine] Error reading users from SQLite:', err);
    }
  }

  return users;
}

export async function writeUserToSql(user: any): Promise<void> {
  if (!user || !user.email) return;
  const normEmail = String(user.email).trim().toLowerCase();
  const nowIso = new Date().toISOString();
  const id = String(user.id || `usr-${Date.now()}`);
  const name = String(user.name || 'User');
  const password = String(user.password || '');
  const role = String(user.role || 'owner');
  const title = String(user.title || '');
  const initials = String(user.initials || 'U');
  const payloadJson = JSON.stringify(user);

  if (sqliteDb) {
    try {
      const stmt = sqliteDb.prepare(
        `INSERT OR REPLACE INTO users (id, name, email, password, role, title, initials, payload_json, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`
      );
      stmt.run([id, name, normEmail, password, role, title, initials, payloadJson, nowIso]);
      stmt.free();
      persistSqliteToDisk();
    } catch (err) {
      console.error(`[SQL Engine] Error saving user ${normEmail} to SQLite:`, err);
    }
  }
}

