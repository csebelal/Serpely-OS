import pg from 'pg';
const { Client } = pg;
const c = new Client('postgresql://postgres:postgres@localhost:5432/sincly_db');

async function check() {
  await c.connect();
  const res = await c.query('SELECT id, sender, platform, substring(message, 1, 60) as msg FROM community_messages');
  console.log('Current community_messages:');
  console.table(res.rows);
  await c.end();
}

check();
