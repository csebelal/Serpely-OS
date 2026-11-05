async function test() {
  const token = 'AQXLFxUKPKhF59T5RV7aX5XP3wWEhS14wr2uCLJKuj-COc-cpnHr_EsNxpMXvymvE4fDBNesdP-HYxCn70kCQb6Z73ZHVIYvbbv2Z62S5ohgP8A9t8X5iLEB3m1paWD7Ymr_AG-WHZeYqtnEJsmGHqMJJDPTjkJxrjveuqfiogfWloX26wsmhIq81ChNuuQPSBcuZcKeLTq9Fp_WQ2SwFVRr-GL7xlTmSqGqPjfpF4ewePFq-Svl0hxzttcNWX3yKMCYgbExM-POjIlzZU-LCWVEdLRBtVoay6sisT998ip1AlFuqNpLn1XYR5JEj7F1QveHLpZ13mBEw8X_nvxyvuEBZ7KqNQ';
  const targetUrn1 = 'urn:li:activity:7521440974246686720';
  const targetUrn2 = 'urn:li:share:7521440974246686720';

  const urls = [
    `https://api.linkedin.com/rest/socialActions/${encodeURIComponent(targetUrn1)}/comments`,
    `https://api.linkedin.com/rest/socialActions/${encodeURIComponent(targetUrn2)}/comments`,
    `https://api.linkedin.com/v2/socialActions/${encodeURIComponent(targetUrn1)}/comments`,
    `https://api.linkedin.com/v2/socialActions/${encodeURIComponent(targetUrn2)}/comments`
  ];

  for (const u of urls) {
    try {
      const res = await fetch(u, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Linkedin-Version': '202601',
          'X-Restli-Protocol-Version': '2.0.0'
        }
      });
      console.log(u, 'STATUS:', res.status);
      const text = await res.text();
      console.log('RESPONSE:', text);
    } catch (e) {
      console.log(u, 'ERR:', e.message);
    }
  }
}
test().catch(console.error);
