import { test, expect } from '@playwright/test';
const { BaseHelper } = require('../helper/BaseHelper');
const { Herokuapp } = require('../helper/Herokuapp');

test.describe('Test InternetHerokuApp application', () => {

  let baseHelper;
  let herokuapp;

  test.beforeEach(async ({ page }) => {
    baseHelper = new BaseHelper(page);
    herokuapp = new Herokuapp(page);
    await baseHelper.openApplication();
  });

  test('Verify Internet Herokuapp Home Page is loaded.', async ({ page }) => {
    expect(await herokuapp.isHomePageLoaded()).toBe(true);
  });

  test('Verify A/B testing page is working.', async ({ page }) => {
    console.log('Navigating to A/B Testing page...');
    await herokuapp.clickLeftMenu("A/B Testing");
    expect(await herokuapp.isABTestingPageOpened()).toBe(true);
  });

});