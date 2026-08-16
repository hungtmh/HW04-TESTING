const { WEB_BASE_URL } = require('../utils/env');

/**
 * Page Object for FR-05 - Product listing and search (Home page, frontend-web).
 *
 * Selectors were confirmed against the real DOM with a throwaway probe, not read
 * from the source:
 *   - getByLabel('Tìm kiếm...') resolves to ZERO elements (no htmlFor/id in this
 *     SUT), exactly as the skill warns. Anchor on the placeholder instead.
 *   - The submit button reads 'Tìm' (not 'Search'/'Đăng nhập').
 *   - Product cards are the direct children of the results `.grid`.
 */
class SearchPage {
  constructor(page) {
    this.page = page;
    this.searchInput = page.getByPlaceholder('Tìm kiếm...');
    this.searchButton = page.getByRole('button', { name: 'Tìm' });
    // The results grid lives only in the non-error branch; its direct children
    // are the product cards.
    this.cards = page.locator('.grid > div');
    this.summaryHeading = page.locator('h1', { hasText: /Hiển thị/ });
    this.resultBanner = page.locator('div', { hasText: 'Kết quả tìm kiếm cho:' });
    this.errorBox = page.locator('.bg-red-100');
  }

  async goto() {
    await this.page.goto(WEB_BASE_URL);
    // The list is fetched on mount; wait for the first render to settle so an
    // assertion on card count does not race the initial GET /api/products.
    await this.page.waitForLoadState('networkidle');
  }

  /**
   * Types a term and submits. The click triggers a fresh GET /api/products;
   * callers that assert on the DOM afterwards should wait on a web-first
   * assertion (toHaveCount / toBeVisible), never on a fixed timeout.
   */
  async search(term) {
    await this.searchInput.fill(term);
    await this.searchButton.click();
  }

  /** Clears the box and re-submits to return to the full list. */
  async clearSearch() {
    await this.searchInput.fill('');
    await this.searchButton.click();
  }

  cardCount() {
    return this.cards.count();
  }

  productCardByName(name) {
    return this.cards.filter({ hasText: name });
  }
}

module.exports = { SearchPage };
