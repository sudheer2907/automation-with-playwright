const Database = require('better-sqlite3');
const path = require('path');

const DB_PATH = path.join(__dirname, 'test-results.db');

class TestResultsDB {
  constructor() {
    this.db = new Database(DB_PATH);
    this.db.pragma('journal_mode = WAL');
    this.initializeSchema();
  }

  initializeSchema() {
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS execution_runs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        timestamp TEXT UNIQUE NOT NULL,
        display_time TEXT NOT NULL,
        passed INTEGER DEFAULT 0,
        failed INTEGER DEFAULT 0,
        skipped INTEGER DEFAULT 0,
        total INTEGER DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS test_results (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        execution_id INTEGER NOT NULL,
        name TEXT NOT NULL,
        status TEXT NOT NULL,
        description TEXT,
        full_name TEXT,
        failure_message TEXT,
        duration INTEGER DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (execution_id) REFERENCES execution_runs(id) ON DELETE CASCADE
      );

      CREATE INDEX IF NOT EXISTS idx_execution_timestamp ON execution_runs(timestamp DESC);
      CREATE INDEX IF NOT EXISTS idx_test_execution ON test_results(execution_id);
      CREATE INDEX IF NOT EXISTS idx_test_status ON test_results(status);
    `);
  }

  addExecutionRun(timestamp, displayTime, passed, failed, skipped, total, tests = []) {
    try {
      const stmt = this.db.prepare(`
        INSERT OR REPLACE INTO execution_runs (timestamp, display_time, passed, failed, skipped, total)
        VALUES (?, ?, ?, ?, ?, ?)
      `);
      
      const result = stmt.run(timestamp, displayTime, passed, failed, skipped, total);
      const executionId = result.lastInsertRowid;

      // Insert test results
      if (tests.length > 0) {
        const testStmt = this.db.prepare(`
          INSERT INTO test_results (execution_id, name, status, description, full_name, failure_message, duration)
          VALUES (?, ?, ?, ?, ?, ?, ?)
        `);

        tests.forEach(test => {
          testStmt.run(
            executionId,
            test.name,
            test.status,
            test.description || '',
            test.fullName || '',
            test.failureMessage || '',
            test.duration || 0
          );
        });
      }

      return executionId;
    } catch (error) {
      console.error('Error adding execution run:', error.message);
      throw error;
    }
  }

  getExecutionRuns(limit = 20) {
    try {
      const stmt = this.db.prepare(`
        SELECT * FROM execution_runs 
        ORDER BY timestamp DESC 
        LIMIT ?
      `);
      
      const runs = stmt.all(limit);
      
      // Get tests for each run
      const testStmt = this.db.prepare(`
        SELECT * FROM test_results 
        WHERE execution_id = ? 
        ORDER BY id
      `);

      return runs.map(run => ({
        ...run,
        tests: testStmt.all(run.id)
      }));
    } catch (error) {
      console.error('Error getting execution runs:', error.message);
      return [];
    }
  }

  getSummary(days = 15) {
    try {
      const cutoffDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();
      
      const stmt = this.db.prepare(`
        SELECT 
          COUNT(*) as total_runs,
          SUM(passed) as passed,
          SUM(failed) as failed,
          SUM(skipped) as skipped,
          SUM(total) as total_tests
        FROM execution_runs 
        WHERE timestamp >= ?
      `);

      const result = stmt.get(cutoffDate);
      
      return {
        totalRuns: result.total_runs || 0,
        passed: result.passed || 0,
        failed: result.failed || 0,
        skipped: result.skipped || 0,
        total: result.total_tests || 0
      };
    } catch (error) {
      console.error('Error getting summary:', error.message);
      return { totalRuns: 0, passed: 0, failed: 0, skipped: 0, total: 0 };
    }
  }

  getDailySummary(days = 15) {
    try {
      const cutoffDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();
      
      const stmt = this.db.prepare(`
        SELECT 
          DATE(timestamp) as date,
          SUM(passed) as passed,
          SUM(failed) as failed,
          SUM(skipped) as skipped,
          SUM(total) as total
        FROM execution_runs 
        WHERE timestamp >= ?
        GROUP BY DATE(timestamp)
        ORDER BY date DESC
      `);

      const results = stmt.all(cutoffDate);
      const byDay = {};

      results.forEach(row => {
        byDay[row.date] = {
          passed: row.passed || 0,
          failed: row.failed || 0,
          skipped: row.skipped || 0,
          total: row.total || 0
        };
      });

      return byDay;
    } catch (error) {
      console.error('Error getting daily summary:', error.message);
      return {};
    }
  }

  cleanup(days = 15) {
    try {
      const cutoffDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();
      
      const stmt = this.db.prepare(`
        DELETE FROM execution_runs 
        WHERE timestamp < ?
      `);

      const result = stmt.run(cutoffDate);
      console.log(`Cleaned up ${result.changes} old execution runs`);
      return result.changes;
    } catch (error) {
      console.error('Error cleaning up old data:', error.message);
      return 0;
    }
  }

  getStats() {
    try {
      const runCount = this.db.prepare('SELECT COUNT(*) as count FROM execution_runs').get();
      const testCount = this.db.prepare('SELECT COUNT(*) as count FROM test_results').get();
      const dbSize = require('fs').statSync(DB_PATH).size;

      return {
        executionRuns: runCount.count,
        totalTests: testCount.count,
        databaseSize: Math.round(dbSize / 1024) + ' KB'
      };
    } catch (error) {
      console.error('Error getting stats:', error.message);
      return {};
    }
  }

  close() {
    this.db.close();
  }
}

module.exports = TestResultsDB;
