async function test() {
  const token = 'AQXLFxUKPKhF59T5RV7aX5XP3wWEhS14wr2uCLJKuj-COc-cpnHr_EsNxpMXvymvE4fDBNesdP-HYxCn70kCQb6Z73ZHVIYvbbv2Z62S5ohgP8A9t8X5iLEB3m1paWD7Ymr_AG-WHZeYqtnEJsmGHqMJJDPTjkJxrjveuqfiogfWloX26wsmhIq81ChNuuQPSBcuZcKeLTq9Fp_WQ2SwFVRr-GL7xlTmSqGqPjfpF4ewePFq-Svl0hxzttcNWX3yKMCYgbExM-POjIlzZU-LCWVEdLRBtVoay6sisT998ip1AlFuqNpLn1XYR5JEj7F1QveHLpZ13mBEw8X_nvxyvuEBZ7KqNQ';
  const orgUrn = 'urn:li:organization:107099137';

  const url = `https://api.linkedin.com/rest/posts?author=${encodeURIComponent(orgUrn)}&q=author&count=5`;
  const res = await fetch(url, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Linkedin-Version': '202601',
      'X-Restli-Protocol-Version': '2.0.0'
    }
  });

  console.log('Posts query STATUS:', res.status);
  const data = await res.json();
  console.log('Posts count:', data.elements?.length);
  if (data.elements) {
    for (const post of data.elements) {
      console.log('Post ID:', post.id);
      console.log('Commentary:', post.commentary?.slice(0, 80));
    }
  } else {
    console.log('Error data:', data);
  }
}
test().catch(console.error);
