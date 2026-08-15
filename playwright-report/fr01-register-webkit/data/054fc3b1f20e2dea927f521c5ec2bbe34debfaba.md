# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: fr01-register.spec.js >> FR-01 | Đăng ký tài khoản >> TC-26 - Mật khẩu không được lưu/trả về dạng plaintext @bug
- Location: tests\fr01-register.spec.js:344:3

# Error details

```
Error: expect(received).not.toBe(expected) // Object.is equality

Expected: not "Password 123"
```

# Page snapshot

```yaml
- generic [ref=e3]:
  - banner [ref=e4]:
    - link "EShop" [ref=e5]:
      - /url: /
    - navigation [ref=e6]:
      - link "Giỏ hàng" [ref=e7]:
        - /url: /cart
      - link "Đăng nhập" [ref=e8]:
        - /url: /login
      - link "Đăng ký" [ref=e9]:
        - /url: /register
  - main [ref=e10]:
    - generic [ref=e11]:
      - heading "Đăng Ký Tài Khoản" [level=2] [ref=e12]
      - generic [ref=e13]:
        - generic [ref=e14]:
          - generic [ref=e15]: Họ Tên
          - textbox [ref=e16]
        - generic [ref=e17]:
          - generic [ref=e18]: Email
          - textbox [ref=e19]
        - generic [ref=e20]:
          - generic [ref=e21]: Mật khẩu
          - textbox [ref=e22]
          - paragraph [ref=e23]: "Yêu cầu: Tối thiểu 8 ký tự, có chữ hoa, chữ thường, số và ký tự đặc biệt."
        - button "Đăng Ký" [ref=e24] [cursor=pointer]
        - generic [ref=e25]:
          - text: Đã có tài khoản?
          - link "Đăng nhập" [ref=e26]:
            - /url: /login
  - contentinfo [ref=e27]: © 2026 EShop SUT. Dành cho mục đích kiểm thử.
```

# Test source

```ts
  263 |     const registerCall = page
  264 |       .waitForResponse(r => r.url().includes('/api/register'), { timeout: 5_000 })
  265 |       .catch(() => null);
  266 |     await registerPage.register({ name: 'Nguoi Dung Trung', email, password });
  267 |     await registerCall;
  268 | 
  269 |     // [P4] specified behaviour: the address is already taken, so the row count
  270 |     // must stay at 1. The SUT creates a second row -> BUG-03.
  271 |     const rows = await countAccountsByEmail(request, email);
  272 |     expect(rows, 'a duplicate e-mail must not create a second account').toBe(1);
  273 |   });
  274 | 
  275 |   // ==========================================================================
  276 |   // GROUP 6 - Security payloads (JSON) : TC-23 .. TC-24
  277 |   // ==========================================================================
  278 |   test.describe('Nhóm 6 - Payload bảo mật', () => {
  279 |     for (const c of data.securityPayloads) {
  280 |       test(`${c.tc_id} - ${c.label}`, async ({ page, request }) => {
  281 |         test.info().annotations.push({ type: 'test-case', description: c.tc_id });
  282 |         const email = uniqueEmail(c.emailPrefix);
  283 | 
  284 |         await registerPage.register({
  285 |           name: c.name,
  286 |           email,
  287 |           password: data.validPasswordForSut,
  288 |         });
  289 | 
  290 |         // [P1] Wait for the SPA to finish its POST before querying the API.
  291 |         // Human review finding R-05: without this the API call could outrun the
  292 |         // registration request. TC-23 masked the race because its extra
  293 |         // page.evaluate() added just enough delay, while TC-24 skipped that step
  294 |         // and failed on WebKit only - a genuine flake in the TEST, not the SUT.
  295 |         await expect(page).toHaveURL(/\/login$/);
  296 | 
  297 |         if (c.flag) {
  298 |           // [P6] runtime side-effect assertion: the payload must never execute.
  299 |           const executed = await page.evaluate(f => window[f], c.flag);
  300 |           expect(executed).toBeUndefined();
  301 |         }
  302 | 
  303 |         // [P4] the back end must still be alive and the payload stored as inert
  304 |         // text, i.e. the SQL injection did not drop the users table.
  305 |         const res = await request.post(`${API_BASE_URL}/api/login`, {
  306 |           data: { email, password: data.validPasswordForSut },
  307 |         });
  308 |         expect(res.ok()).toBeTruthy();
  309 |         const body = await res.json();
  310 |         expect(body.user.name).toBe(c.name);
  311 |       });
  312 |     }
  313 |   });
  314 | 
  315 |   // ==========================================================================
  316 |   // GROUP 7 - Boundary : TC-25
  317 |   // ==========================================================================
  318 |   test('TC-25 - Họ Tên dài 255 ký tự vẫn đăng ký được', async ({ page, request }) => {
  319 |     test.info().annotations.push({ type: 'test-case', description: data.boundary.tc_id });
  320 | 
  321 |     const longName = 'A'.repeat(data.boundary.nameLength);
  322 |     const email = uniqueEmail(data.boundary.emailPrefix);
  323 | 
  324 |     await registerPage.register({
  325 |       name: longName,
  326 |       email,
  327 |       password: data.validPasswordForSut,
  328 |     });
  329 | 
  330 |     // [P1]
  331 |     await expect(page).toHaveURL(/\/login$/);
  332 |     // [P4] the full 255 characters survive the round trip without truncation
  333 |     const res = await request.post(`${API_BASE_URL}/api/login`, {
  334 |       data: { email, password: data.validPasswordForSut },
  335 |     });
  336 |     expect(res.ok()).toBeTruthy();
  337 |     const body = await res.json();
  338 |     expect(body.user.name).toHaveLength(data.boundary.nameLength);
  339 |   });
  340 | 
  341 |   // ==========================================================================
  342 |   // GROUP 8 - Credential storage : TC-26  [@bug]
  343 |   // ==========================================================================
  344 |   test('TC-26 - Mật khẩu không được lưu/trả về dạng plaintext @bug', async ({ request }) => {
  345 |     test.info().annotations.push(
  346 |       { type: 'test-case', description: 'TC-26' },
  347 |       { type: 'bug', description: 'BUG-04 - mật khẩu lưu và trả về dạng plaintext' },
  348 |     );
  349 | 
  350 |     const email = uniqueEmail('plain');
  351 |     const password = data.validPasswordForSut;
  352 | 
  353 |     const created = await apiRegister(request, { name: 'Plain Text', email, password });
  354 |     expect(created.ok()).toBeTruthy();
  355 | 
  356 |     const res = await request.post(`${API_BASE_URL}/api/login`, {
  357 |       data: { email, password },
  358 |     });
  359 |     const body = await res.json();
  360 | 
  361 |     // [P4] The login response must never echo the credential back, and whatever
  362 |     // is persisted must not equal the raw password.
> 363 |     expect(body.user.password).not.toBe(password);
      |                                    ^ Error: expect(received).not.toBe(expected) // Object.is equality
  364 |   });
  365 | 
  366 |   // ==========================================================================
  367 |   // GROUP 9 - UI/spec consistency : TC-27  [@bug]
  368 |   // ==========================================================================
  369 |   test('TC-27 - Hint mật khẩu trên UI phải khớp luật thực thi @bug', async ({ page }) => {
  370 |     test.info().annotations.push(
  371 |       { type: 'test-case', description: 'TC-27' },
  372 |       { type: 'bug', description: 'BUG-01 - hint yêu cầu ký tự đặc biệt nhưng luật lại cấm' },
  373 |     );
  374 | 
  375 |     // [P2] the UI promises that a special character is required...
  376 |     await expect(registerPage.passwordHint).toContainText(
  377 |       data.expectedMessages.passwordHintFragment,
  378 |     );
  379 | 
  380 |     // ...so a password satisfying exactly that hint must be accepted. [P1]
  381 |     await registerPage.register({
  382 |       name: 'Nguyen Van A',
  383 |       email: uniqueEmail('hint'),
  384 |       password: data.specCompliantPassword,
  385 |     });
  386 |     await expect(page).toHaveURL(/\/login$/);
  387 |   });
  388 | });
  389 | 
```