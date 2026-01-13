const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');
const PORT = 3000;

const TEST_RESULTS_FILE = path.join(__dirname, 'test-results.json');

// Helper function to read test results from JSON file
function getTestResults() {
  try {
    if (fs.existsSync(TEST_RESULTS_FILE)) {
      const content = fs.readFileSync(TEST_RESULTS_FILE, 'utf-8');
      return JSON.parse(content);
    }
  } catch (e) {
    console.error('Error reading test results:', e.message);
  }
  
  // Return empty structure if file doesn't exist
  return {
    executionRuns: [],
    testRuns: [],
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

// Create HTTP server
const server = http.createServer((req, res) => {
  const parsedUrl = url.parse(req.url, true);
  const pathname = parsedUrl.pathname;

  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (pathname === '/') {
    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.end(getHTML());
  } else if (pathname === '/api/test-results') {
    try {
      const testResultsData = getTestResults();
      const aggregated = {
        totalRuns: testResultsData.summary.totalRuns,
        lastRun: testResultsData.executionRuns[0]?.timestamp,
        executionRuns: testResultsData.executionRuns || [],
        summary: {
          passed: testResultsData.summary.last15Days.passed,
          failed: testResultsData.summary.last15Days.failed,
          skipped: testResultsData.summary.last15Days.skipped,
          total: testResultsData.summary.last15Days.total
        }
      };

      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(aggregated));
    } catch (error) {
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
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: error.message }));
    }
  } else {
    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end('Not Found');
  }
});

function getHTML() {
  return '<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Test Execution Portal - Last 15 Days</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            padding: 20px;
        }

        .container {
            max-width: 1200px;
            margin: 0 auto;
        }

        header {
            text-align: center;
            color: white;
            margin-bottom: 40px;
        }

        h1 {
            font-size: 2.5em;
            margin-bottom: 10px;
            text-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
        }

        .subtitle {
            font-size: 1.1em;
            opacity: 0.9;
        }

        .dashboard {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
            gap: 20px;
            margin-bottom: 30px;
        }

        .card {
            background: white;
            border-radius: 12px;
            padding: 25px;
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
            transition: transform 0.3s ease, box-shadow 0.3s ease;
        }

        .card:hover {
            transform: translateY(-5px);
            box-shadow: 0 15px 40px rgba(0, 0, 0, 0.3);
        }

        .stat-label {
            font-size: 0.9em;
            color: #666;
            margin-bottom: 8px;
            text-transform: uppercase;
            letter-spacing: 1px;
        }

        .stat-value {
            font-size: 2.5em;
            font-weight: bold;
            margin-bottom: 5px;
        }

        .stat-passed { color: #10b981; }
        .stat-failed { color: #ef4444; }
        .stat-skipped { color: #f59e0b; }
        .stat-total { color: #3b82f6; }

        .chart-container {
            background: white;
            border-radius: 12px;
            padding: 25px;
            margin-bottom: 30px;
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
        }

        .chart-title {
            font-size: 1.3em;
            font-weight: 600;
            margin-bottom: 20px;
            color: #333;
        }

        .timeline {
            display: flex;
            flex-direction: column;
            gap: 15px;
        }

        .timeline-item {
            display: flex;
            align-items: center;
            gap: 15px;
            padding: 15px;
            background: #f9fafb;
            border-radius: 8px;
            border-left: 4px solid #667eea;
        }

        .date {
            font-weight: 600;
            color: #333;
            min-width: 100px;
        }

        .result-bar {
            flex: 1;
            display: flex;
            height: 30px;
            border-radius: 6px;
            overflow: hidden;
            background: #e5e7eb;
        }

        .result-segment {
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-size: 0.8em;
            font-weight: bold;
        }

        .passed { background: #10b981; }
        .failed { background: #ef4444; }
        .skipped { background: #f59e0b; }

        .test-list {
            background: white;
            border-radius: 12px;
            padding: 25px;
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
        }

        .test-item {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 15px;
            border-bottom: 1px solid #e5e7eb;
        }

        .test-item:last-child {
            border-bottom: none;
        }

        .test-name {
            flex: 1;
            color: #333;
            font-weight: 500;
        }

        .test-status {
            padding: 6px 12px;
            border-radius: 20px;
            font-size: 0.85em;
            font-weight: 600;
            text-transform: uppercase;
        }

        .status-passed {
            background: #d1fae5;
            color: #065f46;
        }

        .status-failed {
            background: #fee2e2;
            color: #991b1b;
        }

        .status-skipped {
            background: #fef3c7;
            color: #92400e;
        }

        .test-time {
            color: #999;
            font-size: 0.9em;
            margin-left: 20px;
        }

        .loading {
            text-align: center;
            padding: 40px;
            color: white;
        }

        .loading-spinner {
            display: inline-block;
            width: 40px;
            height: 40px;
            border: 4px solid rgba(255, 255, 255, 0.3);
            border-top-color: white;
            border-radius: 50%;
            animation: spin 1s linear infinite;
        }

        @keyframes spin {
            to { transform: rotate(360deg); }
        }

        .error {
            background: #fee2e2;
            color: #991b1b;
            padding: 20px;
            border-radius: 8px;
            margin-bottom: 20px;
        }

        .refresh-btn {
            background: white;
            color: #667eea;
            border: none;
            padding: 12px 24px;
            border-radius: 8px;
            cursor: pointer;
            font-weight: 600;
            font-size: 1em;
            transition: all 0.3s ease;
        }

        .refresh-btn:hover {
            transform: scale(1.05);
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        }

        .header-controls {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 30px;
        }

        .timeline-item.clickable {
            cursor: pointer;
            transition: all 0.3s ease;
        }

        .timeline-item.clickable:hover {
            background: #f0f0f0;
            border-left-color: #764ba2;
            transform: translateX(5px);
        }

        .timeline-item.active {
            background: #ede9fe;
            border-left-color: #764ba2;
        }

        .modal {
            display: none;
            position: fixed;
            z-index: 1000;
            left: 0;
            top: 0;
            width: 100%;
            height: 100%;
            background-color: rgba(0, 0, 0, 0.5);
            animation: fadeIn 0.3s ease;
        }

        @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
        }

        .modal.active {
            display: flex;
            align-items: center;
            justify-content: center;
        }

        .modal-content {
            background-color: white;
            padding: 30px;
            border-radius: 12px;
            max-width: 700px;
            width: 90%;
            max-height: 80vh;
            overflow-y: auto;
            box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
        }

        .modal-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 20px;
            border-bottom: 2px solid #e5e7eb;
            padding-bottom: 15px;
        }

        .modal-title {
            font-size: 1.5em;
            font-weight: 600;
            color: #333;
        }

        .close-btn {
            background: none;
            border: none;
            font-size: 1.5em;
            cursor: pointer;
            color: #999;
            transition: color 0.3s ease;
        }

        .close-btn:hover {
            color: #333;
        }

        .modal-tests {
            display: flex;
            flex-direction: column;
            gap: 10px;
        }
    </style>
</head>
<body>
    <div class="container">
        <header>
            <h1>🧪 Test Execution Portal</h1>
            <p class="subtitle">Last 15 Days Performance Tracking</p>
        </header>

        <div class="header-controls">
            <div></div>
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
    </div>

    <script>
        let executionRuns = [];
        let selectedTest = null;

        function closeModal() {
            document.getElementById('detailsModal').classList.remove('active');
        }

        function closeTestDetailsModal() {
            document.getElementById('testDetailsModal').classList.remove('active');
        }

        function showTestDetails(test) {
            let detailsHtml = '<div style="margin-bottom: 20px;">' +
                '<div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 20px;">' +
                '<div>' +
                '<div style="color: #666; font-size: 0.9em; margin-bottom: 8px;">Test Name</div>' +
                '<div style="font-size: 1.1em; font-weight: 600; color: #333;">' + (test.fullName || test.name) + '</div>' +
                '</div>' +
                '<div style="text-align: right;">' +
                '<div class="test-status status-' + test.status.toLowerCase() + '" style="display: inline-block;">' + test.status.toUpperCase() + '</div>' +
                '</div>' +
                '</div>';

            if (test.description) {
                detailsHtml += '<div style="background: #f3f4f6; padding: 15px; border-radius: 6px; margin-bottom: 20px;">' +
                    '<div style="color: #666; font-size: 0.9em; margin-bottom: 8px; font-weight: 600;">Description</div>' +
                    '<div style="color: #333; line-height: 1.6;">' + test.description + '</div>' +
                    '</div>';
            }

            if (test.failureMessage) {
                detailsHtml += '<div style="background: #fee2e2; padding: 15px; border-radius: 6px; margin-bottom: 20px; border-left: 4px solid #ef4444;">' +
                    '<div style="color: #991b1b; font-size: 0.9em; margin-bottom: 8px; font-weight: 600;">Failure Cause</div>' +
                    '<div style="color: #991b1b; font-family: monospace; font-size: 0.85em; line-height: 1.6; white-space: pre-wrap; word-break: break-word;">' + 
                    escapeHtml(test.failureMessage) + '</div>' +
                    '</div>';
            }

            if (test.duration) {
                detailsHtml += '<div style="padding: 15px; background: #f9fafb; border-radius: 6px;">' +
                    '<div style="color: #666; font-size: 0.9em;">Duration</div>' +
                    '<div style="color: #333; font-weight: 600;">' + (test.duration / 1000).toFixed(2) + 's</div>' +
                    '</div>';
            }

            detailsHtml += '</div>';

            document.getElementById('testDetailsModalBody').innerHTML = detailsHtml;
            document.getElementById('testDetailsModal').classList.add('active');
        }

        function escapeHtml(text) {
            const map = {
                '&': '&amp;',
                '<': '&lt;',
                '>': '&gt;',
                '"': '&quot;',
                "'": '&#039;'
            };
            return text.replace(/[&<>"']/g, m => map[m]);
        }

        function showExecutionDetails(index) {
            const execution = executionRuns[index];
            if (!execution) return;

            const modalBody = document.getElementById('modalBody');
            const total = execution.total || 1;
            
            let htmlContent = '<div style="margin-bottom: 20px;">' +
                '<div style="display: flex; gap: 20px; margin-bottom: 20px;">' +
                '<div>' +
                '<div style="color: #666; font-size: 0.9em;">Execution Time</div>' +
                '<div style="font-size: 1.2em; font-weight: 600; color: #333;">' + execution.displayTime + '</div>' +
                '</div>' +
                '<div>' +
                '<div style="color: #666; font-size: 0.9em;">Total Tests</div>' +
                '<div style="font-size: 1.2em; font-weight: 600; color: #3b82f6;">' + execution.total + '</div>' +
                '</div>' +
                '</div>' +
                '<div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; margin-bottom: 20px;">' +
                '<div style="background: #d1fae5; padding: 10px; border-radius: 6px; text-align: center;">' +
                '<div style="color: #065f46; font-size: 0.9em;">Passed</div>' +
                '<div style="color: #065f46; font-weight: 600; font-size: 1.5em;">' + execution.passed + '</div>' +
                '</div>' +
                '<div style="background: #fee2e2; padding: 10px; border-radius: 6px; text-align: center;">' +
                '<div style="color: #991b1b; font-size: 0.9em;">Failed</div>' +
                '<div style="color: #991b1b; font-weight: 600; font-size: 1.5em;">' + execution.failed + '</div>' +
                '</div>' +
                '<div style="background: #fef3c7; padding: 10px; border-radius: 6px; text-align: center;">' +
                '<div style="color: #92400e; font-size: 0.9em;">Skipped</div>' +
                '<div style="color: #92400e; font-weight: 600; font-size: 1.5em;">' + execution.skipped + '</div>' +
                '</div>' +
                '</div>' +
                '</div>' +
                '<div style="border-top: 2px solid #e5e7eb; padding-top: 20px;">' +
                '<h3 style="margin-bottom: 15px; color: #333;">Test Results</h3>' +
                '<div class="modal-tests">';

            if (execution.tests && execution.tests.length > 0) {
                execution.tests.forEach((test, testIndex) => {
                    const statusClass = 'status-' + test.status.toLowerCase();
                    htmlContent += '<div class="test-item" style="background: #f9fafb; border-radius: 6px; cursor: pointer; transition: all 0.3s ease;" onclick="showTestDetailsFromExecution(' + testIndex + ')" onmouseover="this.style.background=\'#f0f0f0\'" onmouseout="this.style.background=\'#f9fafb\'">' +
                        '<div class="test-name">' + test.name + '</div>' +
                        '<div class="test-status ' + statusClass + '">' + test.status.toUpperCase() + '</div>' +
                    '</div>';
                });
            } else {
                htmlContent += '<p style="color: #999; text-align: center;">No test details available</p>';
            }

            htmlContent += '</div></div>';

            // Store tests reference for click handling
            window.currentTests = execution.tests || [];

            modalBody.innerHTML = htmlContent;
            document.getElementById('detailsModal').classList.add('active');
        }

        function showTestDetailsFromExecution(testIndex) {
            if (window.currentTests && window.currentTests[testIndex]) {
                showTestDetails(window.currentTests[testIndex]);
            }
        }

        async function loadData() {
            const loading = document.getElementById('loading');
            const content = document.getElementById('content');
            const error = document.getElementById('error');

            try {
                loading.style.display = 'block';
                content.style.display = 'none';
                error.style.display = 'none';

                const summaryRes = await fetch('/api/summary');
                const summary = await summaryRes.json();

                const resultsRes = await fetch('/api/test-results');
                const results = await resultsRes.json();

                loading.style.display = 'none';
                content.style.display = 'block';

                const timeline = document.getElementById('timeline');
                timeline.innerHTML = '';
                
                // Display execution runs
                executionRuns = results.executionRuns || [];
                if (executionRuns.length === 0) {
                    timeline.innerHTML = '<p style="color: #999; padding: 20px; text-align: center;">No execution runs found. Run tests first with: npm test</p>';
                } else {
                    executionRuns.forEach((execRun, index) => {
                        const total = execRun.total || 1;
                        const passedPercent = (execRun.passed / total * 100).toFixed(0);
                        const failedPercent = (execRun.failed / total * 100).toFixed(0);
                        const skippedPercent = (execRun.skipped / total * 100).toFixed(0);

                        const item = document.createElement('div');
                        item.className = 'timeline-item clickable';
                        item.onclick = () => showExecutionDetails(index);
                        
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
                loading.style.display = 'none';
                content.style.display = 'block';
                error.style.display = 'block';
                error.textContent = '⚠️ Error: ' + err.message;
                console.error('Error loading data:', err);
            }
        }

        // Close modal when clicking outside of it
        window.onclick = function(event) {
            const modal = document.getElementById('detailsModal');
            const testModal = document.getElementById('testDetailsModal');
            if (event.target === modal) {
                closeModal();
            }
            if (event.target === testModal) {
                closeTestDetailsModal();
            }
        }

        setInterval(loadData, 30000);
        loadData();
    </script>
</body>
</html>`;

// Helper function to read test results from JSON file
function getTestResults() {
  try {
    if (fs.existsSync(TEST_RESULTS_FILE)) {
      const content = fs.readFileSync(TEST_RESULTS_FILE, 'utf-8');
      return JSON.parse(content);
    }
  } catch (e) {
    console.error('Error reading test results:', e.message);
  }
  
  // Return empty structure if file doesn't exist
  return {
    executionRuns: [],
    testRuns: [],
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

// Create HTTP server
const server = http.createServer((req, res) => {
  const parsedUrl = url.parse(req.url, true);
  const pathname = parsedUrl.pathname;

  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (pathname === '/') {
    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.end(HTML_PAGE);
  } else if (pathname === '/api/test-results') {
    try {
      const testResultsData = getTestResults();
      const aggregated = {
        totalRuns: testResultsData.summary.totalRuns,
        lastRun: testResultsData.executionRuns[0]?.timestamp,
        executionRuns: testResultsData.executionRuns || [],
        summary: {
          passed: testResultsData.summary.last15Days.passed,
          failed: testResultsData.summary.last15Days.failed,
          skipped: testResultsData.summary.last15Days.skipped,
          total: testResultsData.summary.last15Days.total
        }
      };

      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(aggregated));
    } catch (error) {
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
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: error.message }));
    }
  } else {
    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end('Not Found');
  }
});

server.listen(PORT, () => {
  console.log(`📊 Test Results Portal running at http://localhost:${PORT}`);
  console.log(`🌐 Open your browser and navigate to: http://localhost:${PORT}`);
  console.log(`⏹️  Press Ctrl+C to stop the server`);
});
