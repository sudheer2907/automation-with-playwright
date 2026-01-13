# Quick Start - SQLite Portal

## 📋 One-time Setup (5 minutes)

```bash
# 1. Install dependencies
npm install

# 2. Initialize database
node setup-sqlite.js
```

## 🏃 Run Tests & View Results

### Terminal 1: Run Tests
```bash
npm test
```
Wait for completion. Data automatically saves to `test-results.db`

### Terminal 2: Start Portal
```bash
npm run portal
```
Server starts on `http://localhost:3000`

### Browser
Open: **http://localhost:3000** 🎉

Portal features:
- ✅ Execution timeline (visual bar charts)
- ✅ Pass/Fail/Skip breakdown
- ✅ Click to view test details
- ✅ Auto-refresh every 30 seconds

## ⚡ Common Commands

```bash
# Run tests
npm test

# Run tests (visible browser)
npm test:headed

# Run tests + Allure report
npm run test:with-allure

# Start portal server
npm run portal

# Check database stats
node verify-results.js

# Reset database (if needed)
del test-results.db && node setup-sqlite.js
```

## 🔧 Verify Everything Works

```bash
# Check database
node verify-results.js
```

Output shows:
- ✓ Number of execution runs
- ✓ Total tests in database
- ✓ Recent execution timestamps
- ✓ Daily breakdown

## 📊 API Endpoints

When portal is running:

```bash
# Get all execution runs
curl http://localhost:3000/api/test-results

# Get daily summary
curl http://localhost:3000/api/summary

# Get database stats
curl http://localhost:3000/api/stats
```

## 🎯 Expected Workflow

1. **Run tests**
   ```bash
   npm test
   ```
   
2. **See results in portal**
   - Portal auto-refreshes
   - Click runs to see details
   - View individual test failures

3. **Check database**
   ```bash
   node verify-results.js
   ```

## ❓ Troubleshooting

**Portal shows "No data"?**
- ✅ Did you run `npm test`?
- ✅ Check: `node verify-results.js`
- ✅ Refresh browser

**Database error?**
- ✅ Reset: `del test-results.db`
- ✅ Reinit: `node setup-sqlite.js`
- ✅ Retry: `npm test`

**Port 3000 in use?**
- Change port in `server-debug.js`
- Search: `const PORT = 3000;`

## 📚 More Info

- Full guide: `SQLITE_MIGRATION.md`
- Setup details: `MIGRATION_SUMMARY.md`
- Database code: `db.js`

---

**That's it!** You're ready to go. 🚀

Run `npm test` then `npm run portal` to get started.
