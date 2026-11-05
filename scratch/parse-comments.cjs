const fs = require('fs');
const html = fs.readFileSync('scratch/linkedin-page.html', 'utf8');

// Find all code tags or script tags
const scriptMatches = Array.from(html.matchAll(/<script[^>]*>([\s\S]*?)<\/script>/gi)).map(m => m[1]);
console.log('Script tags count:', scriptMatches.length);

scriptMatches.forEach((s, idx) => {
  if (s.includes('comment') || s.includes('Comment') || s.includes('text')) {
    console.log(`Script ${idx}: length ${s.length}`);
    if (s.includes('commentary') || s.includes('attributedText') || s.includes('comments')) {
      console.log('Interesting script snippet:', s.slice(0, 300));
    }
  }
});

// Look for data-test or comment classes
const pMatches = Array.from(html.matchAll(/<p[^>]*>([\s\S]*?)<\/p>/gi)).map(m => m[1].replace(/<[^>]+>/g, '').trim());
console.log('Paragraphs:', pMatches.filter(p => p.length > 5).slice(0, 20));
