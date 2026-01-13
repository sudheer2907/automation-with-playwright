const { execSync } = require('child_process');

console.log('Installing better-sqlite3...');
try {
  execSync('npm install better-sqlite3 --save', { stdio: 'inherit' });
  console.log('✓ Installation complete');
} catch (e) {
  console.error('✗ Installation failed:', e.message);
}
