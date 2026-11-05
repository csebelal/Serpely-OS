const pg = require('pg');

const connStr = process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/sincly_db';
const client = new pg.Client({ connectionString: connStr });

async function viewDatabase() {
  console.log('\n📊 Connecting to PostgreSQL Database: sincly_db ...\n');
  await client.connect();

  const tablesRes = await client.query(`
    SELECT table_name 
    FROM information_schema.tables 
    WHERE table_schema = 'public' 
    ORDER BY table_name
  `);

  console.log('═══════════════════════════════════════════════════════════════');
  console.log('              SINCLY POSTGRESQL TABLES & ROW COUNTS            ');
  console.log('═══════════════════════════════════════════════════════════════');

  for (const row of tablesRes.rows) {
    const tableName = row.table_name;
    const countRes = await client.query(`SELECT COUNT(*) as cnt FROM "${tableName}"`);
    const count = countRes.rows[0].cnt;
    console.log(` 📁 Table: ${tableName.padEnd(25)} │ Records: ${count}`);
  }

  console.log('═══════════════════════════════════════════════════════════════\n');

  // Preview workspace_kv
  const kvRes = await client.query('SELECT key, updated_at FROM workspace_kv ORDER BY key');
  console.log('🔑 Synced Workspace State Keys (in workspace_kv):');
  for (const kv of kvRes.rows) {
    console.log(`   - ${kv.key} (last updated: ${kv.updated_at})`);
  }
  console.log('\n');

  await client.end();
}

viewDatabase().catch(err => {
  console.error('Error connecting to database:', err.message);
  process.exit(1);
});
