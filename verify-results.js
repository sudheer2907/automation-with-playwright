#!/usr/bin/env node

const TestResultsDB = require('./db');
const fs = require('fs');

console.log('=== Database Verification ===\n');

try {
  const db = new TestResultsDB();
  
  // Get stats
  console.log('Database Statistics:');
  const stats = db.getStats();
  console.log('  Execution runs:', stats.executionRuns);
  console.log('  Total tests:', stats.totalTests);
  console.log('  Database size:', stats.databaseSize);
  
  // Get summary
  console.log('\nLast 15 Days Summary:');
  const summary = db.getSummary(15);
  console.log('  Total runs:', summary.totalRuns);
  console.log('  Passed:', summary.passed);
  console.log('  Failed:', summary.failed);
  console.log('  Skipped:', summary.skipped);
  console.log('  Total tests:', summary.total);
  
  // Get recent runs
  console.log('\nRecent Execution Runs (Last 5):');
  const runs = db.getExecutionRuns(5);
  if (runs.length === 0) {
    console.log('  No execution runs found.');
    console.log('  Run tests first with: npm test');
  } else {
    runs.forEach((run, idx) => {
      console.log(`\n  Run ${idx + 1}:`);
      console.log(`    Time: ${run.display_time}`);
      console.log(`    Results: P=${run.passed}, F=${run.failed}, S=${run.skipped}`);
      console.log(`    Tests: ${run.tests?.length || 0} test details`);
    });
  }
  
  // Get daily summary
  console.log('\n\nDaily Summary (Last 7 Days):');
  const byDay = db.getDailySummary(7);
  if (Object.keys(byDay).length === 0) {
    console.log('  No data for the last 7 days.');
  } else {
    Object.entries(byDay).slice(0, 7).forEach(([date, data]) => {
      console.log(`  ${date}: P=${data.passed}, F=${data.failed}, S=${data.skipped}, Total=${data.total}`);
    });
  }
  
  db.close();
  console.log('\n✓ Database verification complete');
  
} catch (error) {
  console.error('✗ Error:', error.message);
  process.exit(1);
}
