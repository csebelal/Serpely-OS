async function test() {
  const token = 'AQXLFxUKPKhF59T5RV7aX5XP3wWEhS14wr2uCLJKuj-COc-cpnHr_EsNxpMXvymvE4fDBNesdP-HYxCn70kCQb6Z73ZHVIYvbbv2Z62S5ohgP8A9t8X5iLEB3m1paWD7Ymr_AG-WHZeYqtnEJsmGHqMJJDPTjkJxrjveuqfiogfWloX26wsmhIq81ChNuuQPSBcuZcKeLTq9Fp_WQ2SwFVRr-GL7xlTmSqGqPjfpF4ewePFq-Svl0hxzttcNWX3yKMCYgbExM-POjIlzZU-LCWVEdLRBtVoay6sisT998ip1AlFuqNpLn1XYR5JEj7F1QveHLpZ13mBEw8X_nvxyvuEBZ7KqNQ';
  const postUrn = 'urn:li:share:7521440973734879232';

  const testList = [
    {
      url: `https://api.linkedin.com/v2/socialActions/${encodeURIComponent(postUrn)}/comments`,
      headers: { 'Authorization': `Bearer ${token}` }
    },
    {
      url: `https://api.linkedin.com/v2/comments?q=post&post=${encodeURIComponent(postUrn)}`,
      headers: { 'Authorization': `Bearer ${token}` }
    },
    {
      url: `https://api.linkedin.com/rest/comments?q=post&post=${encodeURIComponent(postUrn)}`,
      headers: { 'Authorization': `Bearer ${token}`, 'Linkedin-Version': '202601' }
    },
    {
      url: `https://api.linkedin.com/v2/organizationalEntityAcls?q=roleAssignee`,
      headers: { 'Authorization': `Bearer ${token}` }
    },
    {
      url: `https://api.linkedin.com/v2/socialActions/${encodeURIComponent(postUrn)}/comments?count=10`,
      headers: { 'Authorization': `Bearer ${token}`, 'X-Restli-Protocol-Version': '2.0.0' }
    }
  ];

  for (const t of testList) {
    try {
      const res = await fetch(t.url, { headers: t.headers });
      console.log(t.url, 'STATUS:', res.status);
      const text = await res.text();
      console.log('BODY:', text.slice(0, 300));
    } catch(e) {
      console.log('ERR:', e.message);
    }
  }
}
test().catch(console.error);
