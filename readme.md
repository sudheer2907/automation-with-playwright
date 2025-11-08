# 🧪 AUTOMATION-CONFIG-WITH-PLAYWRIGHT

This project is a modular automation framework built with [Playwright](https://playwright.dev/), designed to validate web applications using clean architecture, reusable helpers, and integrated reporting.

---

## 📦 Installation Guide

Follow these steps to set up the project:

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-username/automation-config-with-playwright.git
   cd automation-config-with-playwright

2. Install dependencies
npm install

3. Install Playwright browsers
npx playwright install

🚀 How to Run Tests
Run all tests -> 
set ENV=qa 
npx playwright test
Run a specific test file -> ENV=qa npx playwright test e2e/tests/testxyz.spec.js
Run with browser UI (headed mode) -> ENV=qa npx playwright test e2e/tests/testxyz.spec.js --headed
Run with trace viewer enablednpx playwright test --trace on

📊 View Test Report
After running tests, generate and open the HTML report -> npx playwright show-report

The report will open in your default browser and show detailed results including screenshots, traces, and logs.

🧰 Folder Structure

AUTOMATION-CONFIG-WITH-PLAYWRIGHT/
├── e2e/
│   ├── helper/                 # Reusable helper classes
│   │   ├── BaseHelper.js
│   │   └── Herokuapp.js
│   └── tests/                  # Test specifications
│       └── testSeleniumEasy.spec.js
├── node_modules/               # Project dependencies
├── playwright.config.js        # Playwright configuration
├── package.json                # NPM scripts and dependencies
├── test-results/               # Screenshots, videos, traces
├── playwright-report/          # HTML report output
├── .gitignore
└── README.md

🧠 Tips & Best Practices- ✅ Use await for all asynchronous helper methods.
- ✅ Modularize page objects and helpers for scalability.
- ✅ Customize playwright.config.js for environment-specific settings.
- ✅ Use CI/CD integration via .github/workflows for automated runs.
- ✅ Use baseURL and environment variables for flexible test environments.