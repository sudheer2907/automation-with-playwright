// @ts-check
const { devices } = require('@playwright/test');
const dotenv = require('dotenv');
const fs = require('fs');

/**
 * Dynamically load environment variables from config/.env.{ENV}
 * Defaults to 'dev' if ENV is not set
 */
const envFile = `./config/env.${process.env.ENV || 'dev'}`;
if (fs.existsSync(envFile)) {
  dotenv.config({ path: envFile });
  console.log(`✅ Loaded environment: ${process.env.ENV || 'dev'}`);
  console.log(`🌐 Base URL: ${process.env.BASE_URL}`);
} else {
  console.warn(`⚠️ Environment file ${envFile} not found. Using defaults.`);
}

/**
 * @type {import('@playwright/test').PlaywrightTestConfig}
 */
const config = {
  testDir: './e2e/test',
  timeout: 30 * 1000,
  expect: {
    timeout: 5000,
  },
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [['html', { open: 'never' }]],

  use: {
    baseURL: process.env.BASE_URL || 'https://default-url.com',
    actionTimeout: 0,
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    // Add more browsers if needed
    // {
    //   name: 'firefox',
    //   use: { ...devices['Desktop Firefox'] },
    // },
    // {
    //   name: 'webkit',
    //   use: { ...devices['Desktop Safari'] },
    // },
  ],

  outputDir: 'playwright-report/',
};

module.exports = config;