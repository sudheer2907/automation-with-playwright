const { expect } = require('@playwright/test');

exports.Herokuapp = class Herokuapp {
  constructor(page) {
    this.page = page;
  }

  async isHomePageLoaded() {
    const welcomeText = this.page.locator("//h1[contains(text(),'Welcome to the-internet')]");
    return await welcomeText.isVisible(); // ✅ Returns a boolean
  }

  async clickLeftMenu(menu) {
    console.log("Clicking menu: " + menu);
    const menuLocator = this.page.locator("//a[contains(text(),'" + menu + "')]");
    try {
      await menuLocator.waitFor({ state: 'visible' });
      await menuLocator.click();
    } catch (error) {
      console.error("Failed to click menu: " + menu, error);
      throw error;
    }
  }

  async isABTestingPageOpened() {
    await this.page.waitForURL('**/abtest');
    const abTestHeader = this.page.locator("//h3[contains(text(),'A/B Test Variation 1')]");
    return await abTestHeader.isVisible(); // ✅ You need to return the result
  }

}