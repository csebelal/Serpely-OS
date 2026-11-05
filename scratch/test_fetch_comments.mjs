import dotenv from 'dotenv';
dotenv.config({ path: 'backend/.env' });

const liToken = process.env.LINKEDIN_PAGE_ACCESS_TOKEN || process.env.LINKEDIN_ACCESS_TOKEN;
const postUrn = 'urn:li:share:7521256255181553664';

async function testFetchComments() {
  console.log('Testing GET https://api.linkedin.com/rest/socialActions/' + encodeURIComponent(postUrn) + '/comments ...');
  try {
    const res = await fetch(`https://api.linkedin.com/rest/socialActions/${encodeURIComponent(postUrn)}/comments`, {
      headers: {
        Authorization: `Bearer ${liToken}`,
        'Linkedin-Version': '202601',
        'X-Restli-Protocol-Version': '2.0.0'
      }
    });

    console.log('REST status:', res.status);
    const data = await res.json().catch(() => null);
    console.log('REST response:', JSON.stringify(data, null, 2));
  } catch (e) {
    console.error('REST err:', e);
  }

  console.log('\nTesting GET https://api.linkedin.com/v2/socialActions/' + encodeURIComponent(postUrn) + '/comments ...');
  try {
    const res2 = await fetch(`https://api.linkedin.com/v2/socialActions/${encodeURIComponent(postUrn)}/comments`, {
      headers: {
        Authorization: `Bearer ${liToken}`,
        'X-Restli-Protocol-Version': '2.0.0'
      }
    });

    console.log('v2 status:', res2.status);
    const data2 = await res2.json().catch(() => null);
    console.log('v2 response:', JSON.stringify(data2, null, 2));
  } catch (e) {
    console.error('v2 err:', e);
  }
}

testFetchComments();
