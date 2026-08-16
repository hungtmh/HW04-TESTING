const { test, expect } = require('@playwright/test');
const { SearchPage } = require('./pages/SearchPage');
const { readCsv, readJson } = require('./utils/csv');
const { stampRun } = require('./utils/env');
const { searchProducts } = require('./utils/api');

/**
 * ============================================================================
 * HW04 - Automation Testing | FR-05: Product listing and search
 * Student: 23127195
 * ============================================================================
 *
 * DATA-DRIVEN: values come from tests/data/fr05-search-queries.csv and
 * tests/data/fr05-search-cases.json. No inline test-data literals here.
 *
 * ASSERTION PATTERNS (>= 3 required; six used, tagged [P1]..[P6]):
 *   [P1] Navigation assertion    - expect(page).toHaveURL / heading visible
 *   [P2] Web-first element/text  - toBeVisible() / toContainText()
 *   [P3] DOM property assertion  - input value, injected-node presence, JS flag
 *   [P4] Back-end API assertion  - status + body shape / count
 *   [P5] Element-count/state     - toHaveCount()
 *   [P6] Invariant assertion     - properties that must hold for EVERY result
 *
 * Tests tagged @bug assert the SPECIFIED behaviour (search by NAME, safely) and
 * currently FAIL. Each maps 1-to-1 to a defect in
 * 23127195/bug-report/BUG_REPORT.md:
 *   BUG-16 Reflected XSS in the search-result banner (dangerouslySetInnerHTML)
 *   BUG-17 SQL injection: the term is concatenated into a LIKE clause
 *   BUG-18 A `%`/`'` in the term returns 500 and leaks the raw SQL error
 *
 * SOURCE OF TRUTH: api_specification.md 3.1 - "?search=keyword để tìm kiếm sản
 * phẩm theo tên". A term that is not part of any product name must therefore
 * match nothing; special characters must be treated as literal text; and user
 * input reflected on the page must never execute as script.
 */

const queries = readCsv('fr05-search-queries.csv');
const data = readJson('fr05-search-cases.json');

test.describe('FR-05 | Product listing and search', () => {
  test.beforeEach(({}, testInfo) => {
    stampRun(testInfo, 'FR-05 Product listing and search');
  });

  // ==========================================================================
  // GROUP 1 - API search correctness, data-driven from the CSV matrix
  // ==========================================================================
  test.describe('Nhom 1 - Tim kiem qua API (CSV)', () => {
    for (const row of queries) {
      const expectedCount = Number(row.expected_count);
      const title = `${row.tc_id} - search="${row.query || '(rong)'}" -> ${expectedCount} san pham`;

      test(title, async ({ request }) => {
        test.info().annotations.push(
          { type: 'test-case', description: row.tc_id },
          { type: 'note', description: row.note },
        );

        const term = row.query === '' ? undefined : row.query;
        const { status, json } = await searchProducts(request, term);

        // [P4] Back-end API assertion: status + shape.
        expect(status, 'search endpoint must respond 200').toBe(200);
        expect(Array.isArray(json), 'body must be a JSON array').toBe(true);

        // [P5] Element-count assertion (on the API result set).
        expect(json).toHaveLength(expectedCount);

        // [P2]/[P6] When a specific product is expected, it must be present.
        if (row.must_contain) {
          const names = json.map((p) => p.name);
          expect(names).toContain(row.must_contain);
        }

        // [P6] Invariant: every returned product's name really contains the
        // term (case-insensitive), i.e. the filter is by NAME as specified.
        if (term) {
          const needle = term.toLowerCase();
          for (const p of json) {
            expect(
              p.name.toLowerCase().includes(needle),
              `"${p.name}" should contain the search term "${term}"`,
            ).toBe(true);
          }
        }
      });
    }
  });

  // ==========================================================================
  // GROUP 2 - Search through the real UI (Home page)
  // ==========================================================================
  test.describe('Nhom 2 - Tim kiem qua giao dien', () => {
    test('TC-08 - tu khoa khop hien dung 1 the san pham', async ({ page }) => {
      const c = data.uiSearch.match;
      const search = new SearchPage(page);
      await search.goto();

      // [P5] Initial listing renders every seeded product.
      await expect(search.cards).toHaveCount(data.seededCount);

      await search.search(c.query);

      // [P5] After searching, exactly the matching count of cards remains.
      await expect(search.cards).toHaveCount(c.expectedCount);
      // [P2] The matching product's name is visible on the card.
      await expect(search.productCardByName(c.expectedName)).toBeVisible();
      // [P2] The result banner is shown for a non-empty term.
      await expect(search.resultBanner.first()).toBeVisible();
    });

    test('TC-09 - tu khoa khong khop khong hien the nao', async ({ page }) => {
      const c = data.uiSearch.noMatch;
      const search = new SearchPage(page);
      await search.goto();
      await search.search(c.query);

      // [P5] No product cards for a term that matches nothing.
      await expect(search.cards).toHaveCount(0);
      // [P2] The "Hiển thị N sản phẩm" summary disappears when empty.
      await expect(search.summaryHeading).toHaveCount(0);
    });

    test('TC-10 - so the tren UI bang so ket qua tu API [invariant]', async ({ page, request }) => {
      const c = data.uiSearch.multi;
      const search = new SearchPage(page);
      await search.goto();
      await search.search(c.query);
      await expect(search.cards).toHaveCount(c.expectedCount);

      // [P6] Invariant across layers: the UI shows exactly what the API returns.
      const { json } = await searchProducts(request, c.query);
      expect(await search.cardCount()).toBe(json.length);
    });

    test('TC-11 - xoa tu khoa quay lai danh sach day du', async ({ page }) => {
      const search = new SearchPage(page);
      await search.goto();
      await search.search(data.uiSearch.match.query);
      await expect(search.cards).toHaveCount(data.uiSearch.match.expectedCount);

      await search.clearSearch();
      // [P5] Clearing the term restores the full seeded list.
      await expect(search.cards).toHaveCount(data.seededCount);
    });

    test('TC-19 - o tim kiem giu nguyen gia tri da nhap [DOM property]', async ({ page }) => {
      const search = new SearchPage(page);
      await search.goto();
      await search.search(data.uiSearch.match.query);
      // [P3] DOM property assertion on the input's value.
      await expect(search.searchInput).toHaveValue(data.uiSearch.match.query);
    });
  });

  // ==========================================================================
  // GROUP 3 - Security: reflected XSS in the search-result banner (@bug)
  // ==========================================================================
  test.describe('Nhom 3 - Bao mat: XSS (@bug)', () => {
    for (const xss of data.xssPayloads) {
      test(`${xss.tc_id} - ${xss.label} khong duoc thuc thi @bug`, async ({ page }) => {
        test.info().annotations.push(
          { type: 'test-case', description: xss.tc_id },
          { type: 'bug', description: xss.bug },
        );

        const search = new SearchPage(page);
        await search.goto();
        await search.search(xss.payload);
        // Give the banner time to render and any injected handler to fire.
        await expect(search.resultBanner.first()).toBeVisible();

        // [P3] DOM-property / script-execution assertion.
        // SPEC: user input must be escaped, so no injected handler runs and no
        // attacker-controlled node appears in the DOM.
        const flagged = await page.evaluate((f) => window[f] === 1, xss.flag);
        expect(flagged, 'search term must NOT execute as script').toBe(false);
        await expect(
          search.resultBanner.locator('img[src="x"]'),
        ).toHaveCount(0);
      });
    }
  });

  // ==========================================================================
  // GROUP 4 - Security: SQL injection & error leakage (@bug)
  // ==========================================================================
  test.describe('Nhom 4 - Bao mat: SQL injection (@bug)', () => {
    const tautology = data.sqlInjection.find((c) => c.tc_id === 'TC-14');
    const special = data.sqlInjection.find((c) => c.tc_id === 'TC-15');

    test('TC-14 - tautology khong duoc bo qua bo loc @bug', async ({ request }) => {
      test.info().annotations.push(
        { type: 'test-case', description: tautology.tc_id },
        { type: 'bug', description: tautology.bug },
      );

      const { status, json } = await searchProducts(request, tautology.query);
      // [P4] Back-end API assertion. SPEC: no product is named `' OR '1'='1`,
      // so a correct name filter returns zero rows. The SUT returns all 5.
      expect(status).toBe(200);
      expect(Array.isArray(json)).toBe(true);
      expect(json).toHaveLength(tautology.expectedCount);
    });

    test('TC-15 - ky tu dac biet khong lam vo truy van @bug', async ({ request }) => {
      test.info().annotations.push(
        { type: 'test-case', description: special.tc_id },
        { type: 'bug', description: special.bug },
      );

      const { status, contentType } = await searchProducts(request, special.query);
      // [P4] A `%'` term must be treated as literal search text, yielding a
      // normal 200 JSON response - not a 500 SQL crash.
      expect(status, 'special characters must not crash the query').toBe(200);
      expect(contentType).toContain('application/json');
    });

    test('TC-16 - khong ro ri thong bao loi SQL tho ra client @bug', async ({ request }) => {
      test.info().annotations.push(
        { type: 'test-case', description: 'TC-16' },
        { type: 'bug', description: data.sqlInjection[1].bug },
      );

      const { text } = await searchProducts(request, special.query);
      // [P2] Body-content assertion: internal SQL error text must never leak.
      expect(text).not.toContain(data.sqlErrorLeakMarker);
    });
  });

  // ==========================================================================
  // GROUP 5 - Invariants over benign multi-match terms (data-driven)
  // ==========================================================================
  test.describe('Nhom 5 - Bat bien tren nhieu tu khoa', () => {
    for (const term of data.invariantTerms) {
      test(`TC-INV "${term}" - moi ket qua deu chua tu khoa`, async ({ request }) => {
        const { status, json } = await searchProducts(request, term);
        expect(status).toBe(200);
        expect(Array.isArray(json)).toBe(true);
        // [P6] For a legitimate term, the result set is non-empty AND every
        // item genuinely matches by name.
        expect(json.length).toBeGreaterThan(0);
        const needle = term.toLowerCase();
        for (const p of json) {
          expect(
            p.name.toLowerCase().includes(needle),
            `"${p.name}" must contain "${term}"`,
          ).toBe(true);
        }
      });
    }
  });
});
