const { expect } = require('@playwright/test');
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