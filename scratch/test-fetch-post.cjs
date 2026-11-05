async function test() {
  const url = 'https://www.linkedin.com/feed/update/urn:li:activity:7521440974246686720';
  const res = await fetch(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8'
    }
  });
  console.log('Status:', res.status);
  const text = await res.text();
  console.log('Length:', text.length);
  // Look for comments or author or text
  console.log('Includes comment?:', text.includes('comment'));
  // Save snippet to scratch
  const fs = require('fs');
  fs.writeFileSync('scratch/linkedin-page.html', text, 'utf8');
  console.log('Saved scratch/linkedin-page.html');
}
test().catch(console.error);
