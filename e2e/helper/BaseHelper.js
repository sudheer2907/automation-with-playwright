const { expect } = require('@playwright/test');
const fs = require('fs');
const dotenv = require('dotenv');

const envFile = `./config/${process.env.ENV || 'dev'}.config`;
if (fs.existsSync(envFile)) {
  dotenv.config({ path: envFile });
  console.log(`✅ BaseHelper loaded environment: ${process.env.ENV || 'dev'}`);
} else {
  console.warn(`⚠️ Environment file ${envFile} not found. Using existing env vars.`);
}

/**
 * Lightweight helper for base interactions (application navigation and environment loading).
 * Encapsulates common utilities used by tests.
 * @class BaseHelper
 */
exports.BaseHelper = class BaseHelper {
  /**
   * Create a BaseHelper.
   * @param {import('@playwright/test').Page} page - Playwright page instance
   */
  constructor(page) {
    this.page = page;
  }

  /**
   * Open the application's base URL. Uses the environment variable `BASE_URL` if set,
   * otherwise falls back to the default `https://the-internet.herokuapp.com/`.
   * Logs the URL being navigated to and performs navigation via Playwright.
   * @returns {Promise<void>}
   */
  async openApplication() {
    const baseUrl = process.env.BASE_URL || 'https://the-internet.herokuapp.com/';
    console.log(`🌐 Navigating to: ${baseUrl}`);
    await this.page.goto(baseUrl);
  }

}