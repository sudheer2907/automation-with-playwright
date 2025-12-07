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
  timeout: 50 * 1000, // sets the maximum duration for an entire test.
  expect: {
    timeout: 10000, // Sets the default timeout (in ms) for waitFor, expect, and other operations.
  },
  fullyParallel: false, // enable parallel execution.
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: 3, // sets the parallel thread
  reporter: [['html', { open: 'never' }]],

  use: {
    baseURL: process.env.BASE_URL || 'https://the-internet.herokuapp.com/',
    actionTimeout: 0, // Sets the default timeout (in ms) for actions like click, check, uncheck
    timeout: 10000, // Sets the default timeout (in ms) for waitFor, expect, and other operations.
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',  // enables screenshots feature
    video: 'retain-on-failure', // enables video feature
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    }
  ],

  outputDir: 'test-result/',
};

module.exports = config;