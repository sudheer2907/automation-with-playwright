const fs = require('fs');
const path = require('path');
const TestResultsDB = require('./db');

const ALLURE_RESULTS_DIR = path.join(__dirname, 'allure-results');

function updateTestResults() {
  try {
    console.log('Starting test results update...');
    console.log('Looking for allure-results in:', ALLURE_RESULTS_DIR);
    
    const db = new TestResultsDB();
    
    // Read allure results
    const now = Date.now();
    const allureResults = [];

    console.log('Allure results dir exists?', fs.existsSync(ALLURE_RESULTS_DIR));
    
    if (fs.existsSync(ALLURE_RESULTS_DIR)) {
      const files = fs.readdirSync(ALLURE_RESULTS_DIR);
      console.log('Files in allure-results:', files.length);
      
      const resultFiles = files.filter(f => f.endsWith('-result.json'));
      console.log('Result files found:', resultFiles.length);
      
      resultFiles.forEach(file => {
        const filePath = path.join(ALLURE_RESULTS_DIR, file);
        try {
          const stats = fs.statSync(filePath);
          const content = fs.readFileSync(filePath, 'utf-8');
          const data = JSON.parse(content);
          
          const startTime = data.start || stats.mtimeMs;
          allureResults.push({
            file,
            timestamp: new Date(startTime),
            mtimeMs: startTime,
            data,
            status: data.status
          });
        } catch (e) {
          console.error(`Error reading ${file}:`, e.message);
        }
      });
    }

    console.log('Total allure results found:', allureResults.length);

    if (allureResults.length === 0) {
      console.log('No allure results to process');
      db.close();
      return;
    }

    // Sort by timestamp (newest first)
    allureResults.sort((a, b) => b.mtimeMs - a.mtimeMs);

    // Group tests by execution run (tests within 5 minutes are same execution)
    const executionMap = {};
    const EXECUTION_WINDOW = 5 * 60 * 1000; // 5 minutes

    allureResults.forEach(result => {
      let foundExecution = false;
      
      for (const execKey in executionMap) {
        const exec = executionMap[execKey];
        const timeDiff = Math.abs(exec.endTime - result.mtimeMs);
        if (timeDiff <= EXECUTION_WINDOW) {
          exec.tests.push(result);
          exec.endTime = Math.max(exec.endTime, result.mtimeMs);
          foundExecution = true;
          break;
        }
      }
      
      if (!foundExecution) {
        const execKey = `exec_${result.mtimeMs}`;
        executionMap[execKey] = {
          startTime: result.mtimeMs,
          endTime: result.mtimeMs,
          tests: [result]
        };
      }
    });

    // Convert execution map to array and process
    const newExecutions = Object.values(executionMap).sort((a, b) => b.startTime - a.startTime);
    
    let addedCount = 0;
    newExecutions.forEach(execution => {
      const execTimestamp = new Date(execution.startTime);
      const timestamp = execTimestamp.toISOString();
      const displayTime = execTimestamp.toLocaleString();
      
      let passed = 0, failed = 0, skipped = 0;
      const tests = [];

      execution.tests.forEach(test => {
        const status = test.status?.toLowerCase() || 'unknown';
        
        if (status === 'passed') passed++;
        else if (status === 'failed') failed++;
        else if (status === 'skipped') skipped++;

        tests.push({
          name: test.data.name || 'Unknown Test',
          status: status,
          description: test.data.description || '',
          fullName: test.data.fullName || test.data.name || 'Unknown Test',
          failureMessage: test.data.statusDetails?.message || '',
          duration: test.data.duration || 0
        });
      });

      try {
        db.addExecutionRun(timestamp, displayTime, passed, failed, skipped, tests.length, tests);
        addedCount++;
      } catch (e) {
        console.error(`Error adding execution run at ${timestamp}:`, e.message);
      }
    });

    // Cleanup old data (keep only last 15 days)
    db.cleanup(15);

    // Get stats
    const stats = db.getStats();

    console.log('✅ Test results updated in database');
    console.log(`📊 Database Summary:`);
    console.log(`   Execution Runs: ${stats.executionRuns}`);
    console.log(`   Total Tests: ${stats.totalTests}`);
    console.log(`   Database Size: ${stats.databaseSize}`);
    console.log(`   New runs added: ${addedCount}`);

    db.close();

  } catch (error) {
    console.error('❌ Error updating test results:', error.message);
    process.exit(1);
  }
}

updateTestResults();
