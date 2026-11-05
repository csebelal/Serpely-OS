async function test() {
  const token = 'AQXLFxUKPKhF59T5RV7aX5XP3wWEhS14wr2uCLJKuj-COc-cpnHr_EsNxpMXvymvE4fDBNesdP-HYxCn70kCQb6Z73ZHVIYvbbv2Z62S5ohgP8A9t8X5iLEB3m1paWD7Ymr_AG-WHZeYqtnEJsmGHqMJJDPTjkJxrjveuqfiogfWloX26wsmhIq81ChNuuQPSBcuZcKeLTq9Fp_WQ2SwFVRr-GL7xlTmSqGqPjfpF4ewePFq-Svl0hxzttcNWX3yKMCYgbExM-POjIlzZU-LCWVEdLRBtVoay6sisT998ip1AlFuqNpLn1XYR5JEj7F1QveHLpZ13mBEw8X_nvxyvuEBZ7KqNQ';
  const postUrn = 'urn:li:share:7521440973734879232';

  const endpoints = [
    `https://api.linkedin.com/rest/socialMetadata/${encodeURIComponent(postUrn)}`,
    `https://api.linkedin.com/rest/socialActions/${encodeURIComponent(postUrn)}`,
    `https://api.linkedin.com/rest/socialActions/${encodeURIComponent(postUrn)}/comments`,
    `https://api.linkedin.com/v2/socialMetadata/${encodeURIComponent(postUrn)}`,
    `https://api.linkedin.com/v2/socialActions/${encodeURIComponent(postUrn)}/comments`
  ];

  for (const ep of endpoints) {
    try {
      const res = await fetch(ep, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Linkedin-Version': '202601',
          'X-Restli-Protocol-Version': '2.0.0'
        }
      });
      console.log(ep, 'STATUS:', res.status);
      const text = await res.text();
      console.log('BODY:', text.slice(0, 400));
    } catch (e) {
      console.log(ep, 'ERROR:', e.message);
    }
  }
}
test().catch(console.error);
