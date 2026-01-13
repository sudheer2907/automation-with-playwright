const fs = require('fs');
const path = require('path');

console.log('Testing update-test-results.js directly...\n');

try {
  // Load and execute the update script
  const scriptPath = path.join(__dirname, 'update-test-results.js');
  console.log('Script path:', scriptPath);
  console.log('Script exists:', fs.existsSync(scriptPath));
  
  // Require and run it
  require(scriptPath);
  
} catch (error) {
  console.error('Error running update script:', error);
  console.error('\nStack:', error.stack);
}
