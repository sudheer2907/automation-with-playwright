const { expect } = require('@playwright/test');

/**
 * Page-level helper for the-internet.herokuapp.com pages.
 * Encapsulates page interactions and assertions used across tests.
 * @class Herokuapp
 */
exports.Herokuapp = class Herokuapp {
  /**
   * Create a Herokuapp helper.
   * @param {import('@playwright/test').Page} page - Playwright page instance
   */
  constructor(page) {
    this.page = page;
  }

  /**
   * Check whether the home page is loaded by verifying the welcome header is visible.
   * @returns {Promise<boolean>} true if the home page welcome header is visible
   */
  async isHomePageLoaded() {
    const welcomeText = this.page.locator("//h1[contains(text(),'Welcome to the-internet')]");
    return await welcomeText.isVisible();
  }

  /**
   * Click a left-hand navigation menu item.
   * Attempts an exact text match first, then falls back to a contains() match.
   * @param {string} menu - The visible menu text to click (e.g. 'A/B Testing')
   * @returns {Promise<void>}
   * @throws Will throw if the menu cannot be found or clicked
   */
  async clickLeftMenu(menu) {
    console.log("Clicking menu: " + menu);
    // Prefer exact link text match to avoid ambiguous matches like
    // "File Download" vs "Secure File Download". Fall back to contains() if exact
    // match is not found.
    const exactXpath = "//a[normalize-space(text())='" + menu + "']";
    let menuLocator = this.page.locator(exactXpath);
    try {
      const count = await menuLocator.count();
      if (count === 0) {
        // fallback to contains if exact match not present
        menuLocator = this.page.locator("//a[contains(text(),'" + menu + "')]");
      }
      await menuLocator.waitFor({ state: 'visible' });
      await menuLocator.first().click();
    } catch (error) {
      console.error("Failed to click menu: " + menu, error);
      throw error;
    }
  }

  /**
   * Check whether the A/B Testing page is opened by checking the page header.
   * @returns {Promise<boolean>} true when the A/B Testing header is visible
   */
  async isABTestingPageOpened() {
    return await this.page.locator("//h3[contains(text(),'A/B Test')]").isVisible();
  }

  /**
   * Verify the Add/Remove Elements page is opened by waiting for its header.
   * Waits up to 5s for visibility, then returns the visible state.
   * @returns {Promise<boolean>} true if the Add/Remove Elements header is visible
   */
  async isAddRemovePageOpened() {
    const addRemoveHeader = this.page.locator("//h3[contains(text(),'Add/Remove Elements')]");
    await addRemoveHeader.waitFor({ state: 'visible', timeout: 5000 });
    return await addRemoveHeader.isVisible();
  }

  /**
   * Click the 'Add Element' button on the Add/Remove Elements page.
   * Waits up to 5s for the button to be visible before clicking.
   * @returns {Promise<void>}
   */
  async clickAddElementButton() {
    const addButton = this.page.locator("//button[text()='Add Element']");
    await addButton.waitFor({ state: 'visible', timeout: 5000 });
    return await addButton.click();
  }

  /**
   * Determine whether a 'Delete' button is present and visible on the page.
   * @returns {Promise<boolean>} true if at least one Delete button is visible
   */
  async isDeleteButtonDisplayed() {
    const deleteButton = this.page.locator("//button[contains(text(),'Delete')]");
    return await deleteButton.isVisible();
  }

  /**
   * Click a column header in example table 1 to trigger sorting.
   * @param {string} columnName - Visible column header text to click
   * @returns {Promise<void>}
   */
  async sortExample1Column(columnName) {
    const columnXpath = this.page.locator("//table[@id='table1']//span[contains(text(),'" + columnName + "')]");
    return await columnXpath.click();
  }

  /**
   * Assert that a column in table1 is sorted in ascending order (string comparison).
   * Throws if the column cannot be found.
   * @param {string} columnName - Header text of the column to check
   * @returns {Promise<boolean>} true if the column is sorted ascending
   * @throws {Error} when the column is not found
   */
  async isColumnSortedAsc(columnName) {
    // Find the index of the column based on its header text
    const columnIndex = await this.page.$$eval(
      "#table1 thead tr th",
      (ths, name) => {
        const idx = ths.findIndex(th => th.textContent.trim().includes(name));
        return idx + 1; // nth-child is 1-based
      },
      columnName
    );

    if (columnIndex === 0) {
      throw new Error(`Column '${columnName}' not found`);
    }

    // Extract all cell values from that column
    const cells = await this.page.$$eval(
      `#table1 tbody tr td:nth-child(${columnIndex})`,
      tds => tds.map(td => td.textContent.trim())
    );

    // Check if sorted ascending (string comparison)
    for (let i = 0; i < cells.length - 1; i++) {
      if (cells[i].localeCompare(cells[i + 1]) > 0) {
        return false;
      }
    }
    return true;
  }

  /**
   * Assert that a column in table1 is sorted in descending order (string comparison).
   * Throws if the column cannot be found.
   * @param {string} columnName - Header text of the column to check
   * @returns {Promise<boolean>} true if the column is sorted descending
   * @throws {Error} when the column is not found
   */
  async isColumnSortedDsc(columnName) {
    // Find the index of the column based on its header text
    const columnIndex = await this.page.$$eval(
      "#table1 thead tr th",
      (ths, name) => {
        const idx = ths.findIndex(th => th.textContent.trim().includes(name));
        return idx + 1; // nth-child is 1-based
      },
      columnName
    );

    if (columnIndex === 0) {
      throw new Error(`Column '${columnName}' not found`);
    }

    // Extract all cell values from that column
    const cells = await this.page.$$eval(
      `#table1 tbody tr td:nth-child(${columnIndex})`,
      tds => tds.map(td => td.textContent.trim())
    );

    // Check if sorted descending (string comparison)
    for (let i = 0; i < cells.length - 1; i++) {
      if (cells[i].localeCompare(cells[i + 1]) < 0) {
        return false; // Not sorted descending
      }
    }
    return true; // Sorted descending
  }

  /**
   * Convenience wrapper to check sorting for example table 1.
   * @param {string} columnName - Header text of the column to check
   * @param {'asc'|'desc'} [order='asc'] - Sort order to verify
   * @returns {Promise<boolean>} true if the column is sorted in the requested order
   */
  async isColumnSortedExample1(columnName, order = "asc") {
    return await this.isColumnSortedByTableId("table1", columnName, order);
  }

  /**
   * Convenience wrapper to check sorting for example table 2.
   * @param {string} columnName - Header text of the column to check
   * @param {'asc'|'desc'} [order='asc'] - Sort order to verify
   * @returns {Promise<boolean>} true if the column is sorted in the requested order
   */
  async isColumnSortedExample2(columnName, order = "asc") {
    return await this.isColumnSortedByTableId("table2", columnName, order);
  }
  /**
   * Check whether a given column in the specified table is sorted.
   * This method attempts numeric comparison first (useful for currency/numeric cells) and
   * falls back to string localeCompare when values are not numeric.
   * @param {string} tableId - The DOM id of the table (without the #), e.g. 'table1'
   * @param {string} columnName - Visible column header text to locate the column
   * @param {'asc'|'desc'} [order='asc'] - Sort order to verify
   * @returns {Promise<boolean>} true if the column is sorted in the requested order
   * @throws {Error} when the column cannot be found or an invalid order value is provided
   */
  async isColumnSortedByTableId(tableId, columnName, order = "asc") {
    // Find the index of the column based on its header text
    const columnIndex = await this.page.$$eval(
      `#${tableId} thead tr th`,
      (ths, name) => {
        const idx = ths.findIndex(th => th.textContent.trim().includes(name));
        return idx + 1; // nth-child is 1-based
      },
      columnName
    );

    if (columnIndex === 0) {
      throw new Error(`Column '${columnName}' not found in table '${tableId}'`);
    }

    // Extract all cell values from that column
    const cells = await this.page.$$eval(
      `#${tableId} tbody tr td:nth-child(${columnIndex})`,
      tds => tds.map(td => td.textContent.trim())
    );
    // Helper to try numeric comparison first (handles currency like "$51.00"),
    // fall back to string localeCompare when values are non-numeric.
    const parseNumber = (s) => {
      if (s === null || s === undefined) return NaN;
      const cleaned = String(s).replace(/[^0-9.\-]+/g, '');
      if (cleaned === '' || cleaned === '.' || cleaned === '-') return NaN;
      const n = parseFloat(cleaned);
      return Number.isFinite(n) ? n : NaN;
    };

    // Check sorting based on order using numeric-aware comparison
    for (let i = 0; i < cells.length - 1; i++) {
      const a = cells[i];
      const b = cells[i + 1];
      const an = parseNumber(a);
      const bn = parseNumber(b);

      if (!Number.isNaN(an) && !Number.isNaN(bn)) {
        if (order === 'asc') {
          if (an > bn) return false;
        } else if (order === 'desc') {
          if (an < bn) return false;
        } else {
          throw new Error(`Invalid sort order '${order}'. Use 'asc' or 'desc'.`);
        }
      } else {
        // Fallback to string comparison
        if (order === 'asc') {
          if (a.localeCompare(b) > 0) return false;
        } else if (order === 'desc') {
          if (a.localeCompare(b) < 0) return false;
        } else {
          throw new Error(`Invalid sort order '${order}'. Use 'asc' or 'desc'.`);
        }
      }
    }
    return true;
  }

  // Convenience wrapper used by some tests
  /**
   * Convenience wrapper that checks sorting on the default example table (table1).
   * @param {string} columnName - Header text of the column to check
   * @param {'asc'|'desc'} [order='asc'] - Sort order to verify
   * @returns {Promise<boolean>} true if the column is sorted in the requested order
   */
  async isColumnSorted(columnName, order = "asc") {
    return await this.isColumnSortedByTableId("table1", columnName, order);
  }

  // Sort a column in the second example table
  /**
   * Click a column header in example table 2 to trigger sorting.
   * @param {string} columnName - Visible column header text to click
   * @returns {Promise<void>}
   */
  async sortExample2Column(columnName) {
    const columnXpath = this.page.locator("//table[@id='table2']//span[contains(text(),'" + columnName + "')]");
    return await columnXpath.click();
  }

}