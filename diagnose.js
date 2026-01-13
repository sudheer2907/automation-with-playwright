const fs = require('fs');
const path = require('path');

const TEST_RESULTS_FILE = path.join(__dirname, 'test-results.json');
const ALLURE_RESULTS_DIR = path.join(__dirname, 'allure-results');

console.log('=== Diagnostic Report ===\n');

// 1. Check test-results.json
console.log('1. test-results.json:');
if (fs.existsSync(TEST_RESULTS_FILE)) {
  try {
    const data = JSON.parse(fs.readFileSync(TEST_RESULTS_FILE, 'utf-8'));
    console.log('   ✓ File exists and is valid JSON');
    console.log('   - Execution runs:', data.executionRuns?.length || 0);
    console.log('   - Summary:', data.summary?.last15Days);
    if (data.executionRuns?.length > 0) {
      console.log('   - Latest run:', new Date(data.executionRuns[0].timestamp).toLocaleString());
    }
  } catch (e) {
    console.log('   ✗ File exists but has invalid JSON:', e.message);
  }
} else {
  console.log('   ✗ File does not exist');
}

// 2. Check allure-results directory
console.log('\n2. allure-results directory:');
if (fs.existsSync(ALLURE_RESULTS_DIR)) {
  console.log('   ✓ Directory exists');
  const files = fs.readdirSync(ALLURE_RESULTS_DIR);
  const resultFiles = files.filter(f => f.endsWith('-result.json'));
  console.log('   - Total files:', files.length);
  console.log('   - Result files:', resultFiles.length);
  if (resultFiles.length > 0) {
    console.log('   - First result file:', resultFiles[0]);
  }
} else {
  console.log('   ✗ Directory does not exist');
}

// 3. Test the update script
console.log('\n3. Testing update script...');
try {
  require('./update-test-results.js');
  console.log('   ✓ Update script executed');
} catch (e) {
  console.log('   ✗ Update script error:', e.message);
}

// 4. Re-check test-results.json after update
console.log('\n4. After update:');
if (fs.existsSync(TEST_RESULTS_FILE)) {
  try {
    const data = JSON.parse(fs.readFileSync(TEST_RESULTS_FILE, 'utf-8'));
    console.log('   - Execution runs:', data.executionRuns?.length || 0);
    console.log('   - Summary:', data.summary?.last15Days);
  } catch (e) {
    console.log('   ✗ Invalid JSON:', e.message);
  }
} else {
  console.log('   ✗ File not created');
}

console.log('\n=== End Diagnostic ===');
