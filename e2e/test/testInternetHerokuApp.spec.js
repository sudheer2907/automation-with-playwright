import { test, expect } from '@playwright/test';
const { BaseHelper } = require('../helper/BaseHelper');
const { Herokuapp } = require('../helper/Herokuapp');

test('Verify Internet Herokuapp Home Page is loaded.', async ({ page }) => {
  const baseHelper = new BaseHelper(page);
  const herokuapp = new Herokuapp(page);

  await baseHelper.openApplication();
  expect(await herokuapp.isHomePageLoaded()).toBe(true);
});
