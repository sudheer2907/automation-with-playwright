#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('=== SQLite Migration Setup ===\n');

// Step 1: Check if better-sqlite3 is installed
console.log('Step 1: Checking dependencies...');
try {
  require.resolve('better-sqlite3');
  console.log('✓ better-sqlite3 is installed');
} catch (e) {
  console.log('✗ better-sqlite3 not found. Installing...');
  const { execSync } = require('child_process');
  try {
    execSync('npm install better-sqlite3 --save', { stdio: 'inherit' });
    console.log('✓ better-sqlite3 installed successfully');
  } catch (err) {
    console.error('✗ Failed to install better-sqlite3');
    console.error('Please run: npm install better-sqlite3 --save');
    process.exit(1);
  }
}

// Step 2: Initialize database
console.log('\nStep 2: Initializing database...');
try {
  const TestResultsDB = require('./db');
  const db = new TestResultsDB();
  const stats = db.getStats();
  console.log('✓ Database initialized successfully');
  console.log('  - Execution runs:', stats.executionRuns);
  console.log('  - Total tests:', stats.totalTests);
  console.log('  - Database size:', stats.databaseSize);
  db.close();
} catch (e) {
  console.error('✗ Error initializing database:', e.message);
  process.exit(1);
}

// Step 3: Test data migration (if test-results.json exists)
console.log('\nStep 3: Checking for existing data to migrate...');
const oldFile = path.join(__dirname, 'test-results.json');
if (fs.existsSync(oldFile)) {
  console.log('⚠ Found test-results.json');
  console.log('  You can delete it later - all data is now in test-results.db');
  console.log('  To delete: del test-results.json');
}

// Step 4: Verify files
console.log('\nStep 4: Verifying files...');
const filesToCheck = ['db.js', 'update-test-results.js', 'server-debug.js'];
let allGood = true;
filesToCheck.forEach(file => {
  if (fs.existsSync(path.join(__dirname, file))) {
    console.log('  ✓', file);
  } else {
    console.log('  ✗', file, 'not found');
    allGood = false;
  }
});

if (!allGood) {
  console.error('\n✗ Some files are missing. Please check your setup.');
  process.exit(1);
}

// Step 5: Summary
console.log('\n=== Setup Complete! ===\n');
console.log('Database: test-results.db (SQLite)');
console.log('Update script: update-test-results.js');
console.log('Portal server: server-debug.js\n');

console.log('Next steps:');
console.log('1. Run tests: npm test');
console.log('2. Start portal (separate terminal): npm run portal');
console.log('3. Open browser: http://localhost:3000\n');

console.log('API Endpoints:');
console.log('  GET /api/test-results    - Get execution runs');
console.log('  GET /api/summary         - Get daily breakdown');
console.log('  GET /api/stats           - Get database statistics\n');
