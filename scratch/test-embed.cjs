async function test() {
  const urls = [
    'https://www.linkedin.com/embed/feed/update/urn:li:activity:7521440974246686720',
    'https://www.linkedin.com/embed/feed/update/urn:li:share:7521440973734879232'
  ];
  for (const u of urls) {
    const res = await fetch(u, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      }
    });
    console.log(u, 'STATUS:', res.status);
    const text = await res.text();
    console.log('Length:', text.length);
    console.log('Has comment text:', text.includes('comment') || text.includes('Comment'));
    const fs = require('fs');
    fs.writeFileSync('scratch/embed.html', text, 'utf8');
  }
}
test().catch(console.error);
