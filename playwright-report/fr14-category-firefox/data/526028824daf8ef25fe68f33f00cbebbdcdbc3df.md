# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: fr14-category.spec.js >> FR-14 | Quản lý danh mục >> TC-13 - Khong duoc xoa danh muc dang co san pham @bug
- Location: tests\fr14-category.spec.js:288:3

# Error details

```
Error: deleting a category in use must be refused and must not orphan products

expect(received).toMatchObject(expected)

- Expected  - 2
+ Received  + 2

  Object {
-   "orphanedProducts": 0,
-   "status": 409,
+   "orphanedProducts": 1,
+   "status": 200,
  }
```

# Test source

```ts
  220 |     expect(res.status).toBe(200);
  221 |     expect(res.body).toMatchObject({ message: 'Category updated' });
  222 | 
  223 |     const after = await listCategories(request);
  224 |     const row = after.find(x => x.id === created.body.id);
  225 |     expect(row.name).toBe(renamed);
  226 |     expect(after.map(x => x.name)).not.toContain(original);
  227 | 
  228 |     await deleteCategory(request, adminToken, created.body.id);
  229 |   });
  230 | 
  231 |   test(`${data.update.nonExistent.tc_id} - ${data.update.nonExistent.label} @bug`, async ({ request }) => {
  232 |     const c = data.update.nonExistent;
  233 |     test.info().annotations.push(
  234 |       { type: 'test-case', description: c.tc_id },
  235 |       { type: 'bug', description: 'BUG-12 - thao tác trên id không tồn tại vẫn báo thành công' },
  236 |     );
  237 | 
  238 |     const res = await updateCategory(request, adminToken, c.id, c.name);
  239 |     // [P4] Updating something that does not exist must not report success.
  240 |     // The handler never inspects this.changes, so it always answers 200.
  241 |     expect(
  242 |       res.status,
  243 |       `PUT /api/categories/${c.id} on a non-existent row must not return success`,
  244 |     ).toBe(c.expectedStatus);
  245 |   });
  246 | 
  247 |   // ==========================================================================
  248 |   // GROUP 4 - Delete : TC-11 (UI), TC-12 [@bug], TC-13 [@bug]
  249 |   // ==========================================================================
  250 |   test(`${data.delete.viaUi.tc_id} - ${data.delete.viaUi.label}`, async ({ page, request }) => {
  251 |     const c = data.delete.viaUi;
  252 |     test.info().annotations.push({ type: 'test-case', description: c.tc_id });
  253 | 
  254 |     const name = scoped(c.name);
  255 |     const created = await createCategory(request, adminToken, name);
  256 |     expect(created.status).toBe(200);
  257 | 
  258 |     const admin = new AdminCategoryPage(page, data.adminBaseUrl);
  259 |     await admin.loginAsAdmin(data.adminAccount);
  260 |     await admin.openCategoriesTab();
  261 | 
  262 |     // [P3] present before the action
  263 |     expect(await admin.visibleCategoryNames()).toContain(name);
  264 | 
  265 |     await admin.deleteCategoryRow(name);
  266 | 
  267 |     // [P5] the row disappears from the table
  268 |     await expect(admin.rowByName(name)).toHaveCount(0);
  269 |     // [P4] and from the back end
  270 |     expect((await listCategories(request)).map(x => x.id)).not.toContain(created.body.id);
  271 |   });
  272 | 
  273 |   test(`${data.delete.nonExistent.tc_id} - ${data.delete.nonExistent.label} @bug`, async ({ request }) => {
  274 |     const c = data.delete.nonExistent;
  275 |     test.info().annotations.push(
  276 |       { type: 'test-case', description: c.tc_id },
  277 |       { type: 'bug', description: 'BUG-12 - thao tác trên id không tồn tại vẫn báo thành công' },
  278 |     );
  279 | 
  280 |     const res = await deleteCategory(request, adminToken, c.id);
  281 |     // [P4]
  282 |     expect(
  283 |       res.status,
  284 |       `DELETE /api/categories/${c.id} on a non-existent row must not return success`,
  285 |     ).toBe(c.expectedStatus);
  286 |   });
  287 | 
  288 |   test(`${data.delete.withProducts.tc_id} - ${data.delete.withProducts.label} @bug`, async ({ request }) => {
  289 |     const c = data.delete.withProducts;
  290 |     test.info().annotations.push(
  291 |       { type: 'test-case', description: c.tc_id },
  292 |       { type: 'bug', description: 'BUG-13 - xoá danh mục đang có sản phẩm làm sản phẩm mồ côi' },
  293 |     );
  294 | 
  295 |     const catName = scoped(c.categoryName);
  296 |     const prodName = scoped(c.productName);
  297 | 
  298 |     const cat = await createCategory(request, adminToken, catName);
  299 |     expect(cat.status).toBe(200);
  300 |     const categoryId = cat.body.id;
  301 | 
  302 |     const prod = await createProduct(request, adminToken, {
  303 |       name: prodName,
  304 |       price: c.productPrice,
  305 |       description: 'Created by FR-14 automated test',
  306 |       imageUrl: '',
  307 |       category_id: categoryId,
  308 |     });
  309 |     expect(prod.status).toBe(200);
  310 | 
  311 |     const res = await deleteCategory(request, adminToken, categoryId);
  312 |     const orphans = (await listProducts(request)).filter(p => p.category_id === categoryId);
  313 | 
  314 |     // [P4] Referential integrity: a category still referenced by products must
  315 |     // not be removable. The SUT deletes it and leaves the products pointing at
  316 |     // a category id that no longer exists.
  317 |     expect(
  318 |       { status: res.status, orphanedProducts: orphans.length },
  319 |       'deleting a category in use must be refused and must not orphan products',
> 320 |     ).toMatchObject({ status: c.expectedStatus, orphanedProducts: 0 });
      |       ^ Error: deleting a category in use must be refused and must not orphan products
  321 |   });
  322 | 
  323 |   // ==========================================================================
  324 |   // GROUP 5 - Access control : TC-14 .. TC-16 [@bug], TC-17
  325 |   // ==========================================================================
  326 |   test.describe('Nhóm 5 - Phân quyền', () => {
  327 |     for (const c of data.accessControl) {
  328 |       test(`${c.tc_id} - ${c.label} @bug`, async ({ request }) => {
  329 |         test.info().annotations.push(
  330 |           { type: 'test-case', description: c.tc_id },
  331 |           { type: 'bug', description: 'BUG-11 - người dùng thường toàn quyền CRUD danh mục' },
  332 |         );
  333 | 
  334 |         const customer = await createCustomer(request);
  335 |         expect(customer.token).toBeTruthy();
  336 |         const before = await listCategories(request);
  337 | 
  338 |         let res;
  339 |         if (c.action === 'create') {
  340 |           res = await createCategory(request, customer.token, scoped(c.name));
  341 |         } else {
  342 |           // Arrange a target row with admin rights, then attack it as a customer.
  343 |           const target = await createCategory(request, adminToken, scoped(`Target ${c.tc_id}`));
  344 |           expect(target.status).toBe(200);
  345 |           res = c.action === 'update'
  346 |             ? await updateCategory(request, customer.token, target.body.id, scoped(c.name))
  347 |             : await deleteCategory(request, customer.token, target.body.id);
  348 |           await deleteCategory(request, adminToken, target.body.id);
  349 |         }
  350 | 
  351 |         // A successful attack leaves a row behind; remove it before asserting.
  352 |         await cleanupAdded(request, adminToken, before, await listCategories(request));
  353 | 
  354 |         // [P4] authenticateToken only verifies the JWT signature and never
  355 |         // inspects req.user.role, so every logged-in customer is an admin
  356 |         // as far as category management is concerned.
  357 |         expect(
  358 |           res.status,
  359 |           `a role="user" account must not be able to ${c.action} a category`,
  360 |         ).toBe(c.expectedStatus);
  361 |       });
  362 |     }
  363 |   });
  364 | 
  365 |   test(`${data.unauthenticated.tc_id} - ${data.unauthenticated.label}`, async ({ request }) => {
  366 |     const c = data.unauthenticated;
  367 |     test.info().annotations.push({ type: 'test-case', description: c.tc_id });
  368 | 
  369 |     const before = await listCategories(request);
  370 |     const res = await createCategory(request, undefined, scoped(c.name));
  371 |     const after = await listCategories(request);
  372 | 
  373 |     // [P4] no token at all must be rejected outright
  374 |     expect(res.status).toBe(c.expectedStatus);
  375 |     // [P5] and nothing may be written
  376 |     expect(after.length).toBe(before.length);
  377 |   });
  378 | });
  379 | 
```