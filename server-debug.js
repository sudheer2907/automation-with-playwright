const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');
const TestResultsDB = require('./db');

const PORT = 3000;

// Helper function to get test results from database
function getTestResults() {
  try {
    const db = new TestResultsDB();
    const runs = db.getExecutionRuns(20);
    const summary = db.getSummary(15);
    const byDay = db.getDailySummary(15);
    
    db.close();
    
    return {
      executionRuns: runs,
      summary: {
        totalRuns: runs.length,
        last15Days: summary
      },
      byDay: byDay
    };
  } catch (e) {
    console.error('Error reading test results:', e.message);
    return {
      executionRuns: [],
      summary: {
        totalRuns: 0,
        last15Days: {
          passed: 0,
          failed: 0,
          skipped: 0,
          total: 0
        }
      },
      byDay: {}
    };
  }
}

// Create HTTP server
const server = http.createServer((req, res) => {
  const parsedUrl = url.parse(req.url, true);
  const pathname = parsedUrl.pathname;

  console.log('Request:', pathname);

  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (pathname === '/') {
    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.end(getHTML());
  } else if (pathname === '/api/test-results') {
    try {
      console.log('Fetching test results...');
      const testResultsData = getTestResults();
      console.log('Test data loaded:', testResultsData.executionRuns?.length || 0, 'runs');
      
      const aggregated = {
        totalRuns: testResultsData.summary?.totalRuns || 0,
        lastRun: testResultsData.executionRuns?.[0]?.timestamp || null,
        executionRuns: testResultsData.executionRuns || [],
        summary: {
          passed: testResultsData.summary?.last15Days?.passed || 0,
          failed: testResultsData.summary?.last15Days?.failed || 0,
          skipped: testResultsData.summary?.last15Days?.skipped || 0,
          total: testResultsData.summary?.last15Days?.total || 0
        }
      };

      console.log('Sending response with', aggregated.executionRuns.length, 'runs');
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(aggregated));
    } catch (error) {
      console.error('Error in /api/test-results:', error);
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: error.message }));
    }
  } else if (pathname === '/api/summary') {
    try {
      const testResultsData = getTestResults();
      const summary = {
        totalTestRuns: testResultsData.summary.totalRuns,
        dateRange: {
          from: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
          to: new Date()
        },
        byDay: testResultsData.byDay
      };

      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(summary));
    } catch (error) {
      console.error('Error in /api/summary:', error);
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: error.message }));
    }
  } else if (pathname === '/api/stats') {
    try {
      const db = new TestResultsDB();
      const stats = db.getStats();
      db.close();
      
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(stats));
    } catch (error) {
      console.error('Error in /api/stats:', error);
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: error.message }));
    }
  } else {
    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end('Not Found');
  }
});

function getHTML() {
  return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Test Execution Portal</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); min-height: 100vh; padding: 20px; }
        .container { max-width: 1200px; margin: 0 auto; }
        header { text-align: center; color: white; margin-bottom: 40px; }
        h1 { font-size: 2.5em; margin-bottom: 10px; text-shadow: 0 2px 4px rgba(0, 0, 0, 0.2); }
        .subtitle { font-size: 1.1em; opacity: 0.9; }
        .chart-container { background: white; border-radius: 12px; padding: 25px; margin-bottom: 30px; box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2); }
        .chart-title { font-size: 1.3em; font-weight: 600; margin-bottom: 20px; color: #333; }
        .timeline { display: flex; flex-direction: column; gap: 15px; }
        .timeline-item { display: flex; align-items: center; gap: 15px; padding: 15px; background: #f9fafb; border-radius: 8px; border-left: 4px solid #667eea; cursor: pointer; transition: all 0.3s ease; }
        .timeline-item:hover { background: #f0f0f0; border-left-color: #764ba2; transform: translateX(5px); }
        .date { font-weight: 600; color: #333; min-width: 150px; }
        .result-bar { flex: 1; display: flex; height: 30px; border-radius: 6px; overflow: hidden; background: #e5e7eb; }
        .result-segment { display: flex; align-items: center; justify-content: center; color: white; font-size: 0.8em; font-weight: bold; }
        .passed { background: #10b981; }
        .failed { background: #ef4444; }
        .skipped { background: #f59e0b; }
        .loading { text-align: center; padding: 40px; color: white; }
        .loading-spinner { display: inline-block; width: 40px; height: 40px; border: 4px solid rgba(255, 255, 255, 0.3); border-top-color: white; border-radius: 50%; animation: spin 1s linear infinite; }
        @keyframes spin { to { transform: rotate(360deg); } }
        .error { background: #fee2e2; color: #991b1b; padding: 20px; border-radius: 8px; margin-bottom: 20px; }
        .modal { display: none; position: fixed; z-index: 1000; left: 0; top: 0; width: 100%; height: 100%; background-color: rgba(0, 0, 0, 0.5); }
        .modal.active { display: flex; align-items: center; justify-content: center; }
        .modal-content { background-color: white; padding: 30px; border-radius: 12px; max-width: 700px; width: 90%; max-height: 80vh; overflow-y: auto; box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3); }
        .modal-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; border-bottom: 2px solid #e5e7eb; padding-bottom: 15px; }
        .modal-title { font-size: 1.5em; font-weight: 600; color: #333; }
        .close-btn { background: none; border: none; font-size: 1.5em; cursor: pointer; color: #999; transition: color 0.3s ease; }
        .close-btn:hover { color: #333; }
        .test-item { display: flex; justify-content: space-between; align-items: center; padding: 15px; border-bottom: 1px solid #e5e7eb; cursor: pointer; transition: background 0.3s ease; }
        .test-item:hover { background: #f9fafb; }
        .test-item:last-child { border-bottom: none; }
        .test-name { flex: 1; color: #333; font-weight: 500; }
        .test-status { padding: 6px 12px; border-radius: 20px; font-size: 0.85em; font-weight: 600; text-transform: uppercase; }
        .status-passed { background: #d1fae5; color: #065f46; }
        .status-failed { background: #fee2e2; color: #991b1b; }
        .status-skipped { background: #fef3c7; color: #92400e; }
        .header-controls { display: flex; justify-content: flex-end; margin-bottom: 30px; }
        .refresh-btn { background: white; color: #667eea; border: none; padding: 12px 24px; border-radius: 8px; cursor: pointer; font-weight: 600; font-size: 1em; transition: all 0.3s ease; }
        .refresh-btn:hover { transform: scale(1.05); box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15); }
    </style>
</head>
<body>
    <div class="container">
        <header>
            <h1>🧪 Test Execution Portal</h1>
            <p class="subtitle">Last 15 Days Performance Tracking</p>
        </header>
        <div class="header-controls">
            <button class="refresh-btn" onclick="loadData()">🔄 Refresh</button>
        </div>
        <div id="loading" class="loading">
            <div class="loading-spinner"></div>
            <p>Loading test results...</p>
        </div>
        <div id="content" style="display: none;">
            <div id="error" class="error" style="display: none;"></div>
            <div class="chart-container">
                <div class="chart-title">📊 Test Execution Runs (Click on any execution to view details)</div>
                <div class="timeline" id="timeline"></div>
            </div>
        </div>
    </div>

    <div id="detailsModal" class="modal">
        <div class="modal-content">
            <div class="modal-header">
                <div class="modal-title">📋 Execution Details</div>
                <button class="close-btn" onclick="closeModal()">&times;</button>
            </div>
            <div id="modalBody"></div>
        </div>
    </div>

    <div id="testDetailsModal" class="modal">
        <div class="modal-content">
            <div class="modal-header">
                <div class="modal-title">🔍 Test Details</div>
                <button class="close-btn" onclick="closeTestDetailsModal()">&times;</button>
            </div>
            <div id="testDetailsModalBody"></div>
        </div>
    </div>

    <script>
        let executionRuns = [];
        let currentTests = [];

        function closeModal() {
            document.getElementById('detailsModal').classList.remove('active');
        }

        function closeTestDetailsModal() {
            document.getElementById('testDetailsModal').classList.remove('active');
        }

        function escapeHtml(text) {
            const map = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' };
            return text.replace(/[&<>"']/g, m => map[m]);
        }

        function showTestDetails(testIndex) {
            const test = currentTests[testIndex];
            if (!test) return;

            let html = '<div>';
            html += '<div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 20px;">';
            html += '<div><div style="color: #666; font-size: 0.9em;">Test Name</div>';
            html += '<div style="font-size: 1.1em; font-weight: 600; color: #333;">' + (test.fullName || test.name) + '</div></div>';
            html += '<div class="test-status status-' + test.status.toLowerCase() + '" style="display: inline-block;">' + test.status.toUpperCase() + '</div>';
            html += '</div>';

            if (test.description) {
                html += '<div style="background: #f3f4f6; padding: 15px; border-radius: 6px; margin-bottom: 20px;">';
                html += '<div style="color: #666; font-size: 0.9em; margin-bottom: 8px; font-weight: 600;">Description</div>';
                html += '<div style="color: #333; line-height: 1.6;">' + test.description + '</div></div>';
            }

            if (test.failureMessage) {
                html += '<div style="background: #fee2e2; padding: 15px; border-radius: 6px; margin-bottom: 20px; border-left: 4px solid #ef4444;">';
                html += '<div style="color: #991b1b; font-size: 0.9em; margin-bottom: 8px; font-weight: 600;">Failure Cause</div>';
                html += '<div style="color: #991b1b; font-family: monospace; font-size: 0.85em; line-height: 1.6; white-space: pre-wrap; word-break: break-word;">';
                html += escapeHtml(test.failureMessage) + '</div></div>';
            }

            if (test.duration) {
                html += '<div style="padding: 15px; background: #f9fafb; border-radius: 6px;">';
                html += '<div style="color: #666; font-size: 0.9em;">Duration</div>';
                html += '<div style="color: #333; font-weight: 600;">' + (test.duration / 1000).toFixed(2) + 's</div></div>';
            }

            html += '</div>';
            document.getElementById('testDetailsModalBody').innerHTML = html;
            document.getElementById('testDetailsModal').classList.add('active');
        }

        function showExecutionDetails(index) {
            const execution = executionRuns[index];
            if (!execution) return;

            currentTests = execution.tests || [];

            let html = '<div style="margin-bottom: 20px;">';
            html += '<div style="display: flex; gap: 20px; margin-bottom: 20px;">';
            html += '<div><div style="color: #666; font-size: 0.9em;">Execution Time</div>';
            html += '<div style="font-size: 1.2em; font-weight: 600; color: #333;">' + execution.displayTime + '</div></div>';
            html += '<div><div style="color: #666; font-size: 0.9em;">Total Tests</div>';
            html += '<div style="font-size: 1.2em; font-weight: 600; color: #3b82f6;">' + execution.total + '</div></div></div>';

            html += '<div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; margin-bottom: 20px;">';
            html += '<div style="background: #d1fae5; padding: 10px; border-radius: 6px; text-align: center;">';
            html += '<div style="color: #065f46; font-size: 0.9em;">Passed</div>';
            html += '<div style="color: #065f46; font-weight: 600; font-size: 1.5em;">' + execution.passed + '</div></div>';

            html += '<div style="background: #fee2e2; padding: 10px; border-radius: 6px; text-align: center;">';
            html += '<div style="color: #991b1b; font-size: 0.9em;">Failed</div>';
            html += '<div style="color: #991b1b; font-weight: 600; font-size: 1.5em;">' + execution.failed + '</div></div>';

            html += '<div style="background: #fef3c7; padding: 10px; border-radius: 6px; text-align: center;">';
            html += '<div style="color: #92400e; font-size: 0.9em;">Skipped</div>';
            html += '<div style="color: #92400e; font-weight: 600; font-size: 1.5em;">' + execution.skipped + '</div></div></div></div>';

            html += '<div style="border-top: 2px solid #e5e7eb; padding-top: 20px;">';
            html += '<h3 style="margin-bottom: 15px; color: #333;">Test Results</h3>';

            if (execution.tests && execution.tests.length > 0) {
                execution.tests.forEach((test, testIndex) => {
                    const statusClass = 'status-' + test.status.toLowerCase();
                    html += '<div class="test-item" onclick="showTestDetails(' + testIndex + ')" style="cursor: pointer;">';
                    html += '<div class="test-name">' + test.name + '</div>';
                    html += '<div class="test-status ' + statusClass + '">' + test.status.toUpperCase() + '</div></div>';
                });
            } else {
                html += '<p style="color: #999; text-align: center;">No test details available</p>';
            }

            html += '</div>';
            document.getElementById('modalBody').innerHTML = html;
            document.getElementById('detailsModal').classList.add('active');
        }

        async function loadData() {
            const loading = document.getElementById('loading');
            const content = document.getElementById('content');
            const error = document.getElementById('error');

            try {
                loading.style.display = 'block';
                content.style.display = 'none';
                error.style.display = 'none';

                console.log('Fetching /api/test-results...');
                const resultsRes = await fetch('/api/test-results?t=' + Date.now());
                console.log('Response status:', resultsRes.status);
                
                if (!resultsRes.ok) {
                    throw new Error('API returned status ' + resultsRes.status);
                }
                
                const results = await resultsRes.json();
                console.log('Results received:', results);

                loading.style.display = 'none';
                content.style.display = 'block';

                const timeline = document.getElementById('timeline');
                timeline.innerHTML = '';
                
                executionRuns = results.executionRuns || [];
                console.log('Execution runs:', executionRuns.length);
                
                if (executionRuns.length === 0) {
                    timeline.innerHTML = '<p style="color: #999; padding: 20px; text-align: center;">No execution runs found. Run tests first with: npm test</p>';
                } else {
                    executionRuns.forEach((execRun, index) => {
                        const total = execRun.total || 1;
                        const passedPercent = (execRun.passed / total * 100).toFixed(0);
                        const failedPercent = (execRun.failed / total * 100).toFixed(0);
                        const skippedPercent = (execRun.skipped / total * 100).toFixed(0);

                        const item = document.createElement('div');
                        item.className = 'timeline-item';
                        item.onclick = function() { showExecutionDetails(index); };
                        
                        let segmentsHtml = '';
                        if (execRun.passed > 0) {
                            segmentsHtml += '<div class="result-segment passed" style="width: ' + passedPercent + '%">' + execRun.passed + '</div>';
                        }
                        if (execRun.failed > 0) {
                            segmentsHtml += '<div class="result-segment failed" style="width: ' + failedPercent + '%">' + execRun.failed + '</div>';
                        }
                        if (execRun.skipped > 0) {
                            segmentsHtml += '<div class="result-segment skipped" style="width: ' + skippedPercent + '%">' + execRun.skipped + '</div>';
                        }
                        
                        item.innerHTML = '<div class="date">' + execRun.displayTime + '</div>' +
                            '<div class="result-bar">' + segmentsHtml + '</div>';
                        
                        timeline.appendChild(item);
                    });
                }

            } catch (err) {
                console.error('Error in loadData:', err);
                loading.style.display = 'none';
                content.style.display = 'block';
                error.style.display = 'block';
                error.textContent = 'Error: ' + err.message;
            }
        }

        window.onclick = function(event) {
            const modal = document.getElementById('detailsModal');
            const testModal = document.getElementById('testDetailsModal');
            if (event.target === modal) closeModal();
            if (event.target === testModal) closeTestDetailsModal();
        }

        console.log('Page loaded, starting loadData...');
        setInterval(loadData, 30000);
        loadData();
    </script>
</body>
</html>`;
}

server.listen(PORT, () => {
  console.log('Test Results Portal running at http://localhost:' + PORT);
  console.log('Open your browser and navigate to: http://localhost:' + PORT);
  console.log('Press Ctrl+C to stop the server');
});
