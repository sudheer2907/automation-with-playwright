const { expect } = require('@playwright/test');
exports.Herokuapp = class Herokuapp {

    constructor(page) {
        this.page = page;
    };

    async isHomePageLoaded() {
    const welcomeText = this.page.locator("//h1[contains(text(),'Welcome to the-internet')]");
    return await welcomeText.isVisible();
  }

}