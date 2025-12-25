# Copilot instructions for this repository

This file contains concise, actionable guidance for AI coding agents working in this Playwright automation repo.

1. Repository purpose
- End-to-end UI automation for https://the-internet.herokuapp.com/ using Playwright.

2. Key entry points & important files
- `playwright.config.js` — central config: `testDir` is `./e2e/test`, loads environment from `config/{ENV}.config` (default `dev`), sets `outputDir: 'test-result/'`, trace/screenshot/video policies, Allure reporter, and `projects` (chromium).
- `config/env.dev` — contains `BASE_URL` used by helpers.
- `e2e/helper/BaseHelper.js` — lightweight helper that receives `page` in constructor and exposes `openApplication()` which uses `process.env.BASE_URL`.
- `e2e/helper/Herokuapp.js` — page-level helpers (menu clicks, table sorting checks, image checks). Use methods like `clickLeftMenu()` and `isColumnSortedByTableId(tableId, columnName, order)`.
- `e2e/test/testInternetHerokuApp.spec.js` — canonical test file showing patterns for setup (`test.beforeEach` creates helpers), use of `await`, and examples of assertions and dialog handling.
- `package.json` — contains npm scripts for testing and report generation.

3. Environment & run commands (explicit examples)
- Load `qa` environment (PowerShell):
  ```powershell
  $env:ENV = 'qa'
  npm test
  ```
- Cross-platform (Linux/macOS) example:
  ```bash
  ENV=qa npm test
  ```
- Available npm scripts (defined in `package.json`):
  - `npm test` — Run all tests with default (dev) environment
  - `npm run test:headed` — Run tests in headed mode (visible browser)
  - `npm run test:debug` — Run tests with Playwright Inspector for debugging
  - `npm run test:qa` — Run tests with qa environment
  - `npm run test:with-allure` — Run tests and auto-generate Allure report
  - `npm run allure:generate` — Generate Allure report from results
  - `npm run allure:serve` — Serve live Allure report on localhost
  - `npm run report:html` — Open Playwright HTML report
- Run a single spec (headed):
  ```bash
  npx playwright test e2e/test/testInternetHerokuApp.spec.js --headed
  ```

4. Reporting & artifacts
- **Allure Reports**: Configured in `playwright.config.js` with `allure-playwright` reporter. After each test run, results are saved to `allure-results/` directory.
  - Generate report: `npm run allure:generate` — creates `allure-report/` folder
  - Serve report live: `npm run allure:serve` — opens interactive Allure dashboard for analyzing test results, attachments, and trends
- **HTML Reports**: Playwright's built-in HTML reporter; view via `npm run report:html`
- **Trace/Screenshots/Videos**: Saved to `test-result/` per config policy (trace on-first-retry, screenshots only-on-failure, videos retain-on-failure)

5. Project-specific conventions & patterns
- Tests instantiate helpers in `beforeEach`: `baseHelper = new BaseHelper(page); herokuapp = new Herokuapp(page);` — follow this pattern to get `page` scope.
- Helpers accept a Playwright `page` and directly use XPaths and `page.locator(...)`. Prefer reusing existing helpers rather than duplicating locators.
- Environment var loading: `playwright.config.js` reads `./config/{ENV}.config` via `dotenv`. Always set `ENV` when running tests for non-dev environments.
- Reporter/snapshot policy: traces are `on-first-retry`, screenshots `only-on-failure`, and videos `retain-on-failure`. Tests rely on these artifacts being saved under `test-result/` and `playwright-report/`.
- Mixed module usage: tests use `import { test, expect } from '@playwright/test'` while helpers use `exports.Class` / `require()` — follow the same pattern when adding helpers to avoid module-system mismatches in this codebase.

6. Common helper utilities & gotchas observed
- Table sorting helpers: prefer `isColumnSortedByTableId(tableId, columnName, order)` in `Herokuapp.js` for deterministic checks. Some tests call other helper aliases — if you add helpers keep the canonical name to avoid duplication.
- Network/resource checks: image checks in tests use `page.request.get()` and normalize `src` to absolute URL. Reuse that pattern when validating external resources.
- Dialog handling: tests register `page.once('dialog', ...)` before clicking; always register the listener before the action that triggers dialogs.

7. Quick change checklist for PRs
- If changing base URL or environments, update `config/*.config` and confirm `playwright.config.js` still loads the correct file.
- If adding new helpers, export them from `e2e/helper/*` using `exports.MyHelper = class MyHelper {}` and consume via `const { MyHelper } = require('../helper/MyHelper')` in tests.
- Add or update an `npm` script in `package.json` only if it matches existing project usage (most CI uses `npx playwright test`).

8. Where to look for more context
- Examples of all patterns are in `e2e/helper/BaseHelper.js`, `e2e/helper/Herokuapp.js` and `e2e/test/testInternetHerokuApp.spec.js`.

If anything is unclear or you'd like me to merge additional README content into this file, tell me which sections to include or update.
