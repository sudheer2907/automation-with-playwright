#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('=== Portal Update Verification ===\n');

const TEST_RESULTS_FILE = path.join(__dirname, 'test-results.json');
const ALLURE_RESULTS_DIR = path.join(__dirname, 'allure-results');

// Step 1: Check files exist
console.log('Step 1: Checking files...');
console.log('  test-results.json exists:', fs.existsSync(TEST_RESULTS_FILE) ? '✓' : '✗');
console.log('  allure-results exists:', fs.existsSync(ALLURE_RESULTS_DIR) ? '✓' : '✗');

// Step 2: Read current state
console.log('\nStep 2: Current test-results.json state:');
if (fs.existsSync(TEST_RESULTS_FILE)) {
  try {
    const data = JSON.parse(fs.readFileSync(TEST_RESULTS_FILE, 'utf-8'));
    console.log('  Execution runs:', data.executionRuns?.length || 0);
    if (data.executionRuns?.length > 0) {
      const latest = data.executionRuns[0];
      console.log('  Latest run:', latest.timestamp);
      console.log('  Results: P=' + latest.passed + ', F=' + latest.failed + ', S=' + latest.skipped);
    }
  } catch (e) {
    console.log('  ✗ Error reading JSON:', e.message);
  }
}

// Step 3: Check allure results
console.log('\nStep 3: Allure results directory:');
if (fs.existsSync(ALLURE_RESULTS_DIR)) {
  const files = fs.readdirSync(ALLURE_RESULTS_DIR);
  const resultFiles = files.filter(f => f.endsWith('-result.json'));
  console.log('  Total files:', files.length);
  console.log('  Result files:', resultFiles.length);
  if (resultFiles.length > 0) {
    console.log('  ✓ Has results to process');
  } else {
    console.log('  ⚠ No result files found');
  }
}

// Step 4: Instructions
console.log('\n=== Usage Instructions ===');
console.log('1. Terminal 1 - Run tests:');
console.log('   npm test');
console.log('\n2. Wait for tests to complete, then in Terminal 2 - Start portal:');
console.log('   npm run portal');
console.log('\n3. Terminal 3 - Check API:');
console.log('   node test-portal-api.js');
console.log('\n4. Browser - Open:');
console.log('   http://localhost:3000');
console.log('\n=== Troubleshooting ===');
console.log('• Portal not showing data? Check Step 3 - are there allure results?');
console.log('• Did "npm test" complete without errors?');
console.log('• Check browser console (F12) for any JavaScript errors');
console.log('• Check terminal running portal for error messages');
