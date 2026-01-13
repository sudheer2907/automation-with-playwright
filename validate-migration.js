#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('\n🔍 Validating SQLite Migration Setup...\n');

let allGood = true;

// Check core files
const coreFiles = {
  'db.js': 'Database module',
  'update-test-results.js': 'Test results updater',
  'server-debug.js': 'Portal server',
  'package.json': 'Package configuration'
};

console.log('📋 Core Files:');
Object.entries(coreFiles).forEach(([file, desc]) => {
  const exists = fs.existsSync(path.join(__dirname, file));
  const status = exists ? '✓' : '✗';
  console.log(`   ${status} ${file} (${desc})`);
  if (!exists) allGood = false;
});

// Check utility files
const utilFiles = [
  'verify-results.js',
  'setup-sqlite.js',
  'setup-complete.js',
  'test-portal-api.js'
];

console.log('\n🔧 Utility Files:');
utilFiles.forEach(file => {
  const exists = fs.existsSync(path.join(__dirname, file));
  const status = exists ? '✓' : '✗';
  console.log(`   ${status} ${file}`);
  if (!exists) allGood = false;
});

// Check documentation
const docFiles = [
  'QUICKSTART.md',
  'MIGRATION_SUMMARY.md',
  'SQLITE_MIGRATION.md',
  'MIGRATION_INDEX.md',
  'SETUP_COMPLETE.txt'
];

console.log('\n📚 Documentation:');
docFiles.forEach(file => {
  const exists = fs.existsSync(path.join(__dirname, file));
  const status = exists ? '✓' : '✗';
  console.log(`   ${status} ${file}`);
  if (!exists) allGood = false;
});

// Check package.json for better-sqlite3
console.log('\n📦 Dependencies:');
try {
  const pkg = JSON.parse(fs.readFileSync(path.join(__dirname, 'package.json'), 'utf-8'));
  const hasDb = pkg.dependencies && pkg.dependencies['better-sqlite3'];
  const status = hasDb ? '✓' : '✗';
  console.log(`   ${status} better-sqlite3 in package.json`);
  if (!hasDb) allGood = false;
} catch (e) {
  console.log(`   ✗ Cannot read package.json`);
  allGood = false;
}

// Final verdict
console.log('\n' + '═'.repeat(50));
if (allGood) {
  console.log('\n✅ All files in place! Ready to use.\n');
  console.log('Next steps:');
  console.log('  1. npm install');
  console.log('  2. node setup-sqlite.js');
  console.log('  3. npm test');
  console.log('  4. npm run portal\n');
} else {
  console.log('\n⚠️  Some files are missing!\n');
  console.log('Please restore missing files and try again.\n');
  process.exit(1);
}
