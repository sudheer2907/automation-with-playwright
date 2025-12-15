const { expect } = require('@playwright/test');
const fs = require('fs');
const dotenv = require('dotenv');

// Ensure environment variables are loaded if tests are executed without the
// top-level Playwright bootstrap (playwright.config.js). Files are named
// `dev.config` / `qa.config` in the `config/` directory.
const envFile = `./config/${process.env.ENV || 'dev'}.config`;
if (fs.existsSync(envFile)) {
  dotenv.config({ path: envFile });
  console.log(`✅ BaseHelper loaded environment: ${process.env.ENV || 'dev'}`);
} else {
  console.warn(`⚠️ Environment file ${envFile} not found. Using existing env vars.`);
}

exports.BaseHelper = class BaseHelper {

  constructor(page) {
    this.page = page;
  }

  async openApplication() {
    const baseUrl = process.env.BASE_URL || 'https://the-internet.herokuapp.com/';
    console.log(`🌐 Navigating to: ${baseUrl}`);
    await this.page.goto(baseUrl);
  }


}