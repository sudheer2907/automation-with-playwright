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

  test('Verify Internet Herokuapp Home Page is working fine.', async ({ page }) => {
    expect(await herokuapp.isHomePageLoaded()).toBe(true);
  });

  test('Verify AB testing page is working.', async ({ page }) => {
    console.log('Navigating to A/B Testing page...');
    await herokuapp.clickLeftMenu("A/B Testing");
    expect(await herokuapp.isABTestingPageOpened()).toBe(true);
  });

  test('Verify Add Remove Page is working.', async ({ page }) => {
    console.log('Navigating to Add/Remove Elements...');
    await herokuapp.clickLeftMenu("Add/Remove Elements");
    expect(await herokuapp.isAddRemovePageOpened()).toBe(true);
  });

  test('Verify images are not broken', async ({ page }) => {
    await herokuapp.clickLeftMenu("Broken Images");
    const imagesxpath = page.locator('img');
    const count = await imagesxpath.count();
    console.log('Total Images on the page are: ' + count)

    for (let i = 0; i < count; i++) {
      const img = imagesxpath.nth(i);
      const src = await img.getAttribute('src');

      // ✅ Ensure src is not null or empty
      expect(src).not.toBeNull();
      expect(src).not.toBe('');

      // ✅ Check if image loads successfully
      const response = await page.request.get(src.startsWith('http') ? src : `https://the-internet.herokuapp.com${src}`);
      expect(response.status()).toBeLessThan(400);
    }
  });

  test('Verify checkboxes are working', async ({ page }) => {
    // Navigate to the Checkboxes page
    await page.goto('https://the-internet.herokuapp.com/checkboxes');

    // Locate the checkboxes
    const checkboxes = page.locator('//form[@id="checkboxes"]/input');

    // Uncheck the second checkbox if it's checked
    if (await checkboxes.nth(1).isChecked()) {
      await checkboxes.nth(1).uncheck();
    }

    // ✅ Assertions
    await expect(checkboxes.first()).not.toBeChecked();
    await expect(checkboxes.nth(1)).not.toBeChecked();
    await expect(checkboxes.nth(1)).toBeChecked();
  });

  test('Verify user is able to select option 1', async ({ page }) => {
    await herokuapp.clickLeftMenu("Dropdown");
    const dropDown = page.locator('//select[@id="dropdown"]');
    // Select Option 1 by its value
    await dropDown.selectOption({ value: '1' });
    // Assertion: ensure Option 1 is selected
    await expect(dropDown).toHaveValue('1');

    // Select Option 2 by its value
    await dropDown.selectOption({ value: '2' });
    // Assertion: ensure Option 1 is selected
    await expect(dropDown).toHaveValue('2');
  });

  test('Verify JS Alerts', async ({ page }) => {
    await herokuapp.clickLeftMenu("JavaScript Alerts");
    const jsAlertButton = page.locator('//button[contains(text(),"Click for JS Alert")]');

    // Listen for the dialog event BEFORE clicking
    page.once('dialog', async dialog => {
      console.log(`Dialog message: ${dialog.message()}`);
      expect(dialog.message()).toBe('I am a JS Alert');
      await page.waitForTimeout(6000); // hard-coded sleep (not recommended for production)
      await dialog.accept(); // Accept the alert
    });

    // Trigger the alert
    await jsAlertButton.click();

    // ✅ Assertion: Verify the result text after alert is accepted
    const result = page.locator('#result');
    await expect(result).toHaveText('You successfully clicked an alert');
  });

  test('Verify JS Confirm', async ({ page }) => {
    // Navigate to the JavaScript Alerts page
    await herokuapp.clickLeftMenu("JavaScript Alerts");

    // Locate the JS Confirm button
    const jsConfirmButton = page.locator('//button[contains(text(),"Click for JS Confirm")]');

    // Listen for the dialog BEFORE clicking
    page.once('dialog', async dialog => {
      console.log(`Dialog message: ${dialog.message()}`);
      expect(dialog.message()).toBe('I am a JS Confirm');
      await dialog.accept(); // ✅ Accept the confirm (click OK)
    });

    // Trigger the confirm dialog
    await jsConfirmButton.click();

    // ✅ Assertion: Verify the result text after accepting
    const result = page.locator('#result');
    await expect(result).toHaveText('You clicked: Ok');
  });

  test('Verify JS Prompt', async ({ page }) => {
    // Navigate to the JavaScript Alerts page
    await herokuapp.clickLeftMenu("JavaScript Alerts");

    // Locate the JS Prompt button
    const jsPromptButton = page.locator('//button[contains(text(),"Click for JS Prompt")]');

    // Listen for the dialog BEFORE clicking
    page.once('dialog', async dialog => {
      console.log(`Dialog message: ${dialog.message()}`);
      expect(dialog.message()).toBe('I am a JS prompt');
      await dialog.accept('Hello Sudheer'); // ✅ Enter text into the prompt and click OK
    });

    // Trigger the prompt dialog
    await jsPromptButton.click();

    // ✅ Assertion: Verify the result text after accepting with input
    const result = page.locator('#result');
    await expect(result).toHaveText('You entered: Hello Sudheer');
  });

  const statusCodes = [200, 301, 404, 500];
  for (const code of statusCodes) {
    test(`Verify Status Code ${code} page`, async ({ page }) => {
      // Navigate to Status Codes page
      await page.goto('https://the-internet.herokuapp.com/status_codes');

      // Click on the link for the given status code
      await page.click(`text=${code}`);

      // ✅ Assertion: Verify the page contains the expected status code text
      const content = page.locator('div.example p');
      await expect(content).toContainText(`${code}`);
    });
  }

  test('Verify Table Sorting', async ({ page }) => {
    console.log('Navigating to Sortable Data Tables...');
    await herokuapp.clickLeftMenu("Sortable Data Tables");

    // Sort Last Name ascending
    await herokuapp.sortExample1Column('Last Name');
    const ascSorted = await herokuapp.isColumnSorted('Last Name', 'asc');
    expect(ascSorted).toBeTruthy();
    console.log('✅ Last Name column sorted ascending');

    // Sort Last Name descending
    await herokuapp.sortExample1Column('Last Name');
    const descSorted = await herokuapp.isColumnSorted('Last Name', 'desc');
    expect(descSorted).toBeTruthy();
    console.log('✅ Last Name column sorted descending');
  });

  const testData = ["Last Name", "First Name", "Email", "Due", "Web Site", "Action"];

  test.describe('Verify Table Sorting', () => {
    for (const columnName of testData) {
      test(`Example 1: Verify ${columnName} column is sortable`, async ({ page }) => {
        console.log(`Navigating to Sortable Data Tables...`);
        await herokuapp.clickLeftMenu("Sortable Data Tables");

        // Sort ascending
        await herokuapp.sortExample1Column(columnName);
        expect(await herokuapp.isColumnSortedExample1(columnName, "asc")).toBeTruthy();
        console.log(`✅ Example 1: ${columnName} column sorted ascending`);

        // Sort descending
        await herokuapp.sortExample1Column(columnName);
        expect(await herokuapp.isColumnSortedExample1(columnName, "desc")).toBeTruthy();
        console.log(`✅ Example 1: ${columnName} column sorted descending`);
      });

      test(`Example 2: Verify ${columnName} column is sortable`, async ({ page }) => {
        console.log(`Navigating to Sortable Data Tables...`);
        await herokuapp.clickLeftMenu("Sortable Data Tables");

        // Sort ascending
        await herokuapp.sortExample2Column(columnName);
        expect(await herokuapp.isColumnSortedExample2(columnName, "asc")).toBeTruthy();
        console.log(`✅ Example 2: ${columnName} column sorted ascending`);

        // Sort descending
        await herokuapp.sortExample2Column(columnName);
        expect(await herokuapp.isColumnSortedExample2(columnName, "desc")).toBeTruthy();
        console.log(`✅ Example 2: ${columnName} column sorted descending`);
      });
    }
  });

  test('Verify Key Press', async ({ page }) => {
    console.log('Navigating to Key Presses page...');
    await herokuapp.clickLeftMenu("Key Presses");

    // Type a key into the input field
    await page.press('#target', 'A');

    // ✅ Assertion: Verify the result text shows the correct key
    const result = page.locator('#result');
    await expect(result).toContainText('You entered: A');

    // Try another key
    await page.press('#target', 'Enter');
    await expect(result).toContainText('You entered: ENTER');

    console.log('✅ Key presses verified successfully');
  });

});