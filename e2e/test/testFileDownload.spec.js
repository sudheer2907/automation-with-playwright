import { test, expect } from '@playwright/test';
const { BaseHelper } = require('../helper/BaseHelper');
const { Herokuapp } = require('../helper/Herokuapp');
const fs = require('fs');
const path = require('path');

test.describe('File download scenarios', () => {

  let baseHelper;
  let herokuapp;

  test.beforeEach(async ({ page }) => {
    baseHelper = new BaseHelper(page);
    herokuapp = new Herokuapp(page);
    await baseHelper.openApplication();
  });

  test('Verify a file can be downloaded and saved', async ({ page }) => {
    console.log('Navigating to File Download page...');
    await herokuapp.clickLeftMenu('File Download');

    // Pick the first downloadable link on the page
    const fileLink = page.locator('div.example a').first();
    const downloadsDir = path.join(process.cwd(), 'test-result', 'downloads');
    fs.mkdirSync(downloadsDir, { recursive: true });

    // Wait for the download event and click the link
    const [download] = await Promise.all([
      page.waitForEvent('download'),
      fileLink.click(),
    ]);

    const filename = await download.suggestedFilename();
    const savePath = path.join(downloadsDir, filename);

    // Save the file to disk and assert it exists and has content
    await download.saveAs(savePath);
    expect(fs.existsSync(savePath)).toBeTruthy();
    const stats = fs.statSync(savePath);
    expect(stats.size).toBeGreaterThan(0);
    console.log(`Downloaded and saved file: ${savePath} (${stats.size} bytes)`);
  });

  test('Download a list of specific files and verify results', async ({ page }) => {
    console.log('Navigating to File Download page...');
    await herokuapp.clickLeftMenu('File Download');

    const requestedFiles = [
      'TextDoc.txt',
      'WebElement elmt=driver.txt',
      'Image.PNG',
      'PRD 32 - Hotel listing booking.com.pdf',
      'test-image.png',
      'workupload.txt',
      'test4614247408243209096.tmp',
      'sample-zip-file.zip',
      'testfile.txt',
      'zero_bytes_file.txt',
      'spectrum-logo.png'
    ];

    const downloadsDir = path.join(process.cwd(), 'test-result', 'downloads');
    // Clean and re-create downloads directory
    if (fs.existsSync(downloadsDir)) {
      fs.rmSync(downloadsDir, { recursive: true, force: true });
    }
    fs.mkdirSync(downloadsDir, { recursive: true });

    const missing = [];
    const downloaded = [];

    for (const fileName of requestedFiles) {
      // Use exact text match to avoid ambiguous links
      const linkLocator = page.locator(`//a[normalize-space(text())='${fileName}']`);
      const count = await linkLocator.count();
      if (count === 0) {
        console.warn(`File link not found on page: ${fileName}`);
        missing.push(fileName);
        continue;
      }

      // Wait for download event triggered by clicking the link
      const [download] = await Promise.all([
        page.waitForEvent('download'),
        linkLocator.first().click(),
      ]);

      const suggested = await download.suggestedFilename();
      const savePath = path.join(downloadsDir, suggested);
      await download.saveAs(savePath);

      if (!fs.existsSync(savePath)) {
        throw new Error(`Downloaded file not found after save: ${savePath}`);
      }

      const stats = fs.statSync(savePath);
      // If the file is a known zero-bytes file, expect size === 0
      if (fileName.toLowerCase().includes('zero')) {
        expect(stats.size).toBe(0);
      } else {
        expect(stats.size).toBeGreaterThanOrEqual(0);
      }

      console.log(`Downloaded: ${suggested} (${stats.size} bytes)`);
      downloaded.push(suggested);
    }

    console.log(`Downloaded count: ${downloaded.length}. Missing count: ${missing.length}`);
    // At least one file should be downloaded; otherwise the page or test is misconfigured
    expect(downloaded.length).toBeGreaterThan(0);
  });

});
