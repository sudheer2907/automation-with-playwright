const http = require('http');

// Test the portal API endpoint
const options = {
  hostname: 'localhost',
  port: 3000,
  path: '/api/test-results',
  method: 'GET'
};

const req = http.request(options, (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    console.log('Status:', res.statusCode);
    try {
      const json = JSON.parse(data);
      console.log('Execution runs:', json.executionRuns?.length || 0);
      console.log('Summary:', json.summary);
      if (json.executionRuns?.length > 0) {
        console.log('Latest run:', json.executionRuns[0]);
      }
    } catch (e) {
      console.log('Response:', data.substring(0, 500));
    }
  });
});

req.on('error', (e) => {
  console.error('Portal not running or error:', e.message);
  console.log('\n💡 Is the portal server running? Start with: npm run portal');
});

req.end();
