const { expect } = require('@playwright/test');
exports.BaseHelper = class BaseHelper {

    constructor(page) {
        this.page = page;
    }

    async openApplication() {
    await this.page.goto('https://the-internet.herokuapp.com/');
  }

}