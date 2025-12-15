const { expect } = require('@playwright/test');

exports.Herokuapp = class Herokuapp {

  constructor(page) {
    this.page = page;
  }

  async isHomePageLoaded() {
    const welcomeText = this.page.locator("//h1[contains(text(),'Welcome to the-internet')]");
    return await welcomeText.isVisible();
  }

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

  async isABTestingPageOpened() {
    return await this.page.locator("//h3[contains(text(),'A/B Test')]").isVisible();
  }

  async isAddRemovePageOpened() {
    const addRemoveHeader = this.page.locator("//h3[contains(text(),'Add/Remove Elements')]");
    await addRemoveHeader.waitFor({ state: 'visible', timeout: 5000 });
    return await addRemoveHeader.isVisible();
  }

  async clickAddElementButton() {
    const addButton = this.page.locator("//button[text()='Add Element']");
    await addButton.waitFor({ state: 'visible', timeout: 5000 });
    return await addButton.click();
  }

  async isDeleteButtonDisplayed() {
    const deleteButton = this.page.locator("//button[contains(text(),'Delete')]");
    return await deleteButton.isVisible();
  }

  async sortExample1Column(columnName) {
    const columnXpath = this.page.locator("//table[@id='table1']//span[contains(text(),'" + columnName + "')]");
    return await columnXpath.click();
  }

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

  async isColumnSortedExample1(columnName, order = "asc") {
    return await this.isColumnSortedByTableId("table1", columnName, order);
  }

  async isColumnSortedExample2(columnName, order = "asc") {
    return await this.isColumnSortedByTableId("table2", columnName, order);
  }
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
  async isColumnSorted(columnName, order = "asc") {
    return await this.isColumnSortedByTableId("table1", columnName, order);
  }

  // Sort a column in the second example table
  async sortExample2Column(columnName) {
    const columnXpath = this.page.locator("//table[@id='table2']//span[contains(text(),'" + columnName + "')]");
    return await columnXpath.click();
  }

}