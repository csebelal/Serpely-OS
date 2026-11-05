const dotenv = require('dotenv');
dotenv.config();

async function run() {
  const res = await fetch('http://localhost:5000/api/hub/auto-scan-brand', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ url: 'https://techsheba.vercel.app/' })
  });
  const data = await res.json();
  console.log('Result:', JSON.stringify(data.brandProfile, null, 2));
}

run();
