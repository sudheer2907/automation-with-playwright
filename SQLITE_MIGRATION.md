# SQLite Migration Guide

The test execution portal has been migrated from JSON file storage to **SQLite database** for better reliability, performance, and data integrity.

## What Changed

### Before (JSON)
- ❌ Data stored in `test-results.json`
- ❌ Prone to corruption issues
- ❌ No transaction support
- ❌ Difficult to query

### After (SQLite)
- ✅ Data stored in `test-results.db` (SQLite)
- ✅ Reliable, ACID-compliant
- ✅ Better performance with indexes
- ✅ Easy data queries
- ✅ Automatic data cleanup (keeps last 15 days)

## Files Changed/Added

| File | Purpose |
|------|---------|
| `db.js` | **NEW** - SQLite database module |
| `update-test-results.js` | **UPDATED** - Now writes to SQLite |
| `server-debug.js` | **UPDATED** - Now reads from SQLite |
| `verify-results.js` | **NEW** - Database verification tool |
| `setup-sqlite.js` | **NEW** - Setup & initialization |
| `package.json` | **UPDATED** - Added `better-sqlite3` dependency |

## Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Initialize Database
```bash
node setup-sqlite.js
```

### 3. Run Tests
```bash
npm test
```
Tests now automatically update the database.

### 4. Start Portal
```bash
npm run portal
```
Portal reads from SQLite database.

### 5. Verify Data
```bash
node verify-results.js
```

## Database Structure

### Tables

**execution_runs**
```sql
- id (int, primary key)
- timestamp (string, unique)
- display_time (string)
- passed (int)
- failed (int)
- skipped (int)
- total (int)
- created_at (datetime)
```

**test_results**
```sql
- id (int, primary key)
- execution_id (int, foreign key)
- name (string)
- status (string)
- description (text)
- full_name (string)
- failure_message (text)
- duration (int)
- created_at (datetime)
```

## API Endpoints

| Endpoint | Purpose |
|----------|---------|
| `GET /api/test-results` | Get execution runs with test details |
| `GET /api/summary` | Get daily breakdown (last 15 days) |
| `GET /api/stats` | Get database statistics |

## Data Cleanup

The database automatically:
- ✅ Keeps last 15 days of test runs
- ✅ Deletes old data after each update
- ✅ Maintains database performance with indexes

## Migration from JSON

If you have old `test-results.json` data:
1. The new SQLite database is independent
2. Old JSON file is not affected
3. You can safely delete it: `del test-results.json`

## Troubleshooting

**Database locked error?**
- Close all portals and other connections
- Try again

**No data showing in portal?**
- Run tests: `npm test`
- Check database: `node verify-results.js`
- Refresh browser

**Want to reset database?**
```bash
# Delete the database file
del test-results.db

# Reinitialize
node setup-sqlite.js

# Run tests again
npm test
```

## Performance

SQLite provides:
- ✅ Fast queries (indexed by timestamp and status)
- ✅ Low memory footprint (~500KB for 1000 tests)
- ✅ Concurrent read access
- ✅ Automatic vacuum/optimization

## Backup

Database file is portable:
```bash
# Backup
copy test-results.db test-results.db.backup

# Restore
copy test-results.db.backup test-results.db
```

## Benefits Over JSON

| Feature | JSON | SQLite |
|---------|------|--------|
| Data Integrity | ❌ | ✅ |
| Query Performance | ❌ | ✅ |
| Concurrency | ❌ | ✅ |
| Transaction Support | ❌ | ✅ |
| Automatic Cleanup | ❌ | ✅ |
| Size Efficiency | ✅ | ✅ |
| Portability | ✅ | ✅ |

---

For more information, check the database module: `db.js`
