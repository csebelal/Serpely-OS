const fs = require('fs');
const s = fs.readFileSync('frontend/src/types.ts', 'utf8');
const idx = s.indexOf('interface CampaignItem');
console.log(s.slice(idx, idx + 1000));
