# 🧪 Automation with Playwright

This repository contains an end-to-end UI automation framework built with Playwright for testing https://the-internet.herokuapp.com/. It includes reusable helpers, environment configs, and reporting (Playwright HTML & Allure).

---

## 🚀 Quick start

### Prerequisites
- Node.js (LTS recommended, e.g., >= 18)
- npm (comes with Node.js)
- Git
- Optional: Java (required on some systems for Allure CLI)

### Initial setup
Open powershell

# clone the project
git clone https://github.com/your-username/automation-config-with-playwright.git
cd automation-config-with-playwright

# install dependencies
npm install

# install Playwright browsers
npx playwright install
```

> Tip: Playwright will install the browser binaries required by the configured projects. If you ever add new browsers in `playwright.config.js` (e.g., `firefox`, `webkit`), re-run `npx playwright install`.

---

## ⚙️ Environment & Config
- Environment config files are located in `./config/{ENV}.config` (e.g., `dev.config`, `qa.config`).
- `playwright.config.js` automatically loads `./config/${process.env.ENV || 'dev'}.config` at runtime.
- Set `BASE_URL` in the config file (default is `https://the-internet.herokuapp.com/`).

Set the environment in PowerShell for a single session:
```powershell
$env:ENV = 'qa'
# then run your tests
npm run test
```
Cross-platform (POSIX shells):
```bash
ENV=qa npm test
```

---

## ▶️ Running tests

### Run all tests (headless)
```bash
npm test
# or
npx playwright test
```

### Run tests in headed mode (open browser window)
```bash
npm run test:headed
# or via npx
npx playwright test --headed
```

**Run a single spec file (headed)**
```bash
# PowerShell example (set ENV and run one file)
$env:ENV='qa'; npx playwright test e2e/test/testFileDownload.spec.js --headed
```

**Run a single test by name (grep)**
```bash
npx playwright test -g "test name substring" --headed
```

**Run with trace enabled (view with Playwright Trace Viewer)**
```bash
npx playwright test --trace on
# after run: npx playwright show-trace path/to/trace.zip
```

**Run with a specific project / browser**
- This repo defines a `chromium` project in `playwright.config.js` by default. To target it explicitly:
```bash
npx playwright test --project=chromium --headed
```
- To add `firefox` or `webkit`, add projects in `playwright.config.js` and run `npx playwright install`.

**Debugging / inspector mode**
```bash
npm run test:debug
# Or run a single test with --debug
npx playwright test e2e/test/xxx.spec.js --debug
```

---

## 📄 Reports & Artifacts
- Test artifacts (screenshots, videos, traces) are saved to `test-result/` (set by `outputDir` in `playwright.config.js`).
- Playwright HTML report (built-in):
```bash
# After running tests
npm run report:html
# or
npx playwright show-report
```
- Allure report (configured via `allure-playwright`):
```bash
# Run tests and create Allure results
npm run test:with-allure
# Generate Allure HTML report
npm run allure:generate
# Serve Allure report locally
npm run allure:serve
```
> Note: On some systems Allure CLI may require Java or extra setup. If `npm run allure:serve` fails, check your environment or install the Allure CLI separately.

**Report tips**
- Playwright stores **traces** on first retry (`trace: 'on-first-retry'`), **screenshots** `only-on-failure`, and **videos** `retain-on-failure` per `playwright.config.js`.
- Use the HTML report for quick pass/fail and artifacts; use Allure for richer test history and attachments.

---

## 🧩 Project structure (short)
```
├── e2e/
│   ├── helper/           # Reusable helper classes (BaseHelper, Herokuapp, ...)
│   └── test/             # Test specs
├── config/               # Environment config files (dev.config, qa.config)
├── playwright.config.js  # Playwright configuration and projects
├── package.json          # Scripts for test, headed, debug, reports
├── test-result/          # Playwright artifacts
├── playwright-report/    # Playwright HTML report output
└── allure-results/       # Allure result files
```

---

## ✅ Best practices & tips
- Use `await` for Playwright actions and helper methods.
- Keep helpers modular (see `e2e/helper/*`).
- Update `config/{ENV}.config` for any environment-specific values.
- For CI: set `ENV` as an environment variable inside your pipeline (e.g., GitHub Actions secrets or variables).

**Happy testing!** 🎉
