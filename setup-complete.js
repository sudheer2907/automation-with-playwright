#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('╔════════════════════════════════════════╗');
console.log('║   SQLite Migration - Complete Setup    ║');
console.log('╚════════════════════════════════════════╝\n');

try {
  // Step 1: Install dependencies
  console.log('📦 Step 1: Installing dependencies...');
  try {
    execSync('npm install', { stdio: 'inherit' });
    console.log('✓ Dependencies installed\n');
  } catch (e) {
    console.log('⚠ npm install encountered an issue\n');
  }

  // Step 2: Initialize database
  console.log('🗄️  Step 2: Initializing database...');
  const TestResultsDB = require('./db');
  const db = new TestResultsDB();
  const stats = db.getStats();
  db.close();
  console.log('✓ Database initialized');
  console.log(`  - Execution runs: ${stats.executionRuns}`);
  console.log(`  - Total tests: ${stats.totalTests}`);
  console.log(`  - Database size: ${stats.databaseSize}\n`);

  // Step 3: Check file structure
  console.log('📁 Step 3: Verifying file structure...');
  const requiredFiles = [
    'db.js',
    'update-test-results.js',
    'server-debug.js',
    'verify-results.js',
    'setup-sqlite.js',
    'package.json',
    'playwright.config.js'
  ];

  let allFilesOk = true;
  requiredFiles.forEach(file => {
    if (fs.existsSync(path.join(__dirname, file))) {
      console.log(`  ✓ ${file}`);
    } else {
      console.log(`  ✗ ${file} - MISSING`);
      allFilesOk = false;
    }
  });

  if (!allFilesOk) {
    console.error('\n✗ Some required files are missing!');
    process.exit(1);
  }
  console.log();

  // Step 4: Summary
  console.log('╔════════════════════════════════════════╗');
  console.log('║        ✅ Setup Complete!              ║');
  console.log('╚════════════════════════════════════════╝\n');

  console.log('Database Information:');
  console.log('  📂 File: test-results.db (SQLite 3)');
  console.log('  🔒 Type: ACID-compliant, transactional');
  console.log('  ⏰ Auto-cleanup: Last 15 days retention\n');

  console.log('Next Steps:');
  console.log('  1️⃣  Run tests:');
  console.log('      npm test\n');
  
  console.log('  2️⃣  Start portal (in new terminal):');
  console.log('      npm run portal\n');
  
  console.log('  3️⃣  Open browser:');
  console.log('      http://localhost:3000\n');

  console.log('Useful Commands:');
  console.log('  📊 View database stats:');
  console.log('     node verify-results.js\n');
  
  console.log('  🧪 Run tests with Allure:');
  console.log('     npm run test:with-allure\n');
  
  console.log('  🗂️  Reset database:');
  console.log('     del test-results.db && node setup-sqlite.js\n');

  console.log('API Endpoints (when portal is running):');
  console.log('  • GET http://localhost:3000/api/test-results');
  console.log('  • GET http://localhost:3000/api/summary');
  console.log('  • GET http://localhost:3000/api/stats\n');

  console.log('Documentation:');
  console.log('  📖 Read SQLITE_MIGRATION.md for detailed info\n');

} catch (error) {
  console.error('❌ Setup failed:', error.message);
  if (error.message.includes('better-sqlite3')) {
    console.error('\n⚠️  better-sqlite3 installation failed.');
    console.error('This usually requires build tools on Windows.');
    console.error('\nTry installing build tools:');
    console.error('  npm install --global windows-build-tools');
    console.error('\nOr download pre-built wheels from:');
    console.error('  https://github.com/WiseLibs/better-sqlite3/releases');
  }
  process.exit(1);
}
