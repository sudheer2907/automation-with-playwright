const fs = require('fs');
const path = require('path');

const filesToDelete = [
  'server-clean.js',
  'server-new.js',
  'server-test.js',
  'server.js',
  'verify-results.js',
  'JSON_STORAGE_SETUP.md',
  'allure-results',
  'playwright-report',
  'test-result'
];

const baseDir = process.cwd();

filesToDelete.forEach(file => {
  try {
    const filePath = path.join(baseDir, file);
    if (fs.existsSync(filePath)) {
      fs.rmSync(filePath, { recursive: true, force: true });
      console.log(`✓ Deleted: ${file}`);
    }
  } catch (e) {
    console.log(`✗ Error deleting ${file}: ${e.message}`);
  }
});

console.log('\n✓ Cleanup complete!');
