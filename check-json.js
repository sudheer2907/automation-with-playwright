const fs = require('fs');
const path = require('path');

const TEST_RESULTS_FILE = path.join(__dirname, 'test-results.json');

console.log('Checking test-results.json...\n');

if (fs.existsSync(TEST_RESULTS_FILE)) {
  const stats = fs.statSync(TEST_RESULTS_FILE);
  console.log('File size:', stats.size, 'bytes');
  console.log('Last modified:', new Date(stats.mtimeMs).toLocaleString());
  
  try {
    const content = fs.readFileSync(TEST_RESULTS_FILE, 'utf-8');
    const data = JSON.parse(content);
    
    console.log('\n✓ Valid JSON');
    console.log('Execution runs:', data.executionRuns?.length);
    console.log('Summary:', data.summary);
    
    // Check structure
    if (data.executionRuns && data.executionRuns.length > 0) {
      console.log('\nFirst execution run:');
      console.log('  - timestamp:', data.executionRuns[0].timestamp);
      console.log('  - displayTime:', data.executionRuns[0].displayTime);
      console.log('  - passed:', data.executionRuns[0].passed);
      console.log('  - failed:', data.executionRuns[0].failed);
      console.log('  - tests count:', data.executionRuns[0].tests?.length || 0);
    }
  } catch (e) {
    console.log('✗ Invalid JSON:', e.message);
  }
} else {
  console.log('✗ File does not exist');
}
