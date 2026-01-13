# Test Execution Portal - Setup Guide

## Overview
Custom web portal to view test execution results from the last 15 days with:
- **Summary Dashboard**: Pass/Fail/Skipped counts
- **Daily Timeline**: Visual breakdown of test results per day
- **Recent Executions**: List of the last 20 test runs with timestamps
- **Auto-Refresh**: Updates every 30 seconds
- **Persistent Storage**: Results stored in `test-results.json` (survives even if allure-results is deleted)

## Data Storage

### How it Works
1. **Run tests**: `npm test` → Tests execute → Results stored in `allure-results/`
2. **Auto-update**: `update-test-results.js` reads allure results and updates `test-results.json`
3. **Portal reads**: Server reads `test-results.json` and displays data
4. **Result**: Pass/Fail counts persist even if `allure-results/` is deleted!

### Data Files
- **`test-results.json`** - Main storage file with all test execution history
  - Contains last 15 days of results
  - Updated automatically after every test run
  - **Survives if allure-results is deleted** ✅
  
- **`allure-results/`** - Temporary Allure reporter data
  - Used by update script as source of truth
  - Can be deleted/regenerated

## Quick Start

### 1. Run Tests
```bash
npm test
```

This will:
- Execute all tests
- Generate Allure results in `allure-results/`
- **Automatically update** `test-results.json` with pass/fail counts

### 2. Start Portal (in another terminal)
```bash
npm run portal
```

### 3. Open in Browser
Navigate to: **http://localhost:3000**

## Features

### Dashboard Statistics
- **Total Passed**: Number of passed tests across all executions (last 15 days)
- **Total Failed**: Number of failed tests across all executions (last 15 days)
- **Total Skipped**: Number of skipped tests across all executions (last 15 days)
- **Total Tests**: Total test executions

### Test Execution Runs (Timeline)
Visual breakdown showing **each test execution run** with:
- Execution timestamp (when tests were run)
- Green segment = Passed tests in that execution
- Red segment = Failed tests in that execution
- Yellow segment = Skipped tests in that execution
- Shows the **last 10 execution runs**

### Individual Test Results
Lists the **last 20 individual tests** executed with:
- Test name
- Test status (Passed/Failed/Skipped)
- Execution timestamp

## Integration Workflow

### Standard Workflow
```bash
npm test              # Tests run + results auto-update in JSON
npm run portal        # Start portal (separate terminal)
```

Portal automatically reads from `test-results.json` on next refresh.

### With Allure Dashboard (Optional)
```bash
npm run test:with-allure    # Tests + Allure HTML report + JSON update
npm run allure:serve        # Allure dashboard (separate terminal)
npm run portal              # Portal (third terminal)
```

## test-results.json Structure

```json
{
  "testRuns": [
    {
      "file": "test-file.json",
      "name": "Test Name",
      "status": "passed",
      "timestamp": "2026-01-10T06:45:00.000Z",
      "duration": 5000
    }
  ],
  "summary": {
    "totalRuns": 25,
    "last15Days": {
      "passed": 20,
      "failed": 3,
      "skipped": 2,
      "total": 25
    }
  },
  "byDay": {
    "2026-01-10": {
      "passed": 10,
      "failed": 1,
      "skipped": 0,
      "total": 11
    }
  }
}
```

## API Endpoints

### GET `/api/test-results`
Returns test results with summary statistics from `test-results.json`.

**Response:**
```json
{
  "totalRuns": 25,
  "lastRun": "2026-01-10T06:45:00.000Z",
  "summary": {
    "passed": 20,
    "failed": 3,
    "skipped": 2,
    "total": 25
  },
  "tests": [{ ... }]
}
```

### GET `/api/summary`
Returns daily breakdown of test results for the last 15 days.

**Response:**
```json
{
  "totalTestRuns": 25,
  "dateRange": { "from": "...", "to": "..." },
  "byDay": {
    "2026-01-10": {
      "passed": 10,
      "failed": 1,
      "skipped": 0,
      "total": 11
    }
  }
}
```

## npm Scripts

| Command | What it does |
|---------|-------------|
| `npm test` | Run all tests + auto-update JSON |
| `npm run test:headed` | Run tests in visible browser + auto-update JSON |
| `npm run test:qa` | Run tests with QA environment + auto-update JSON |
| `npm run test:with-allure` | Run tests + generate Allure report + auto-update JSON |
| `npm run portal` | Start the test portal on http://localhost:3000 |
| `npm run allure:serve` | Serve Allure dashboard |
| `npm run report:html` | Open Playwright HTML report |

## Key Benefits

✅ **Persistent Storage** - Data survives if `allure-results/` is deleted
✅ **Auto-Update** - Pass/fail counts update automatically after tests
✅ **No Database** - Simple JSON file storage
✅ **Lightweight** - No external dependencies
✅ **Fast** - Instant data retrieval from JSON
✅ **15-Day History** - Rolling window of last 15 days

## Troubleshooting

**Portal shows no data:**
1. Run tests: `npm test`
2. Check if `test-results.json` was updated
3. Refresh portal at http://localhost:3000

**Data not updating after tests:**
1. Verify `npm test` completes successfully
2. Check that `update-test-results.js` is in the npm test command
3. Check file permissions on `test-results.json`

**Port 3000 already in use:**
- Modify `const PORT = 3000;` in `server-standalone.js` to use a different port

**allure-results deleted but want data back:**
- Data is preserved in `test-results.json`! ✅
- Just run `npm test` again to regenerate `allure-results/` if needed
