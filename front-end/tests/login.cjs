<<<<<<< HEAD
const assert = require('node:assert/strict');
const { withApplication, login, logout, TOKEN_KEY, EXPIRY_KEY } = require('./helpers.cjs');
=======
const { mockSession } = require('./session-fixture.cjs');
const baseUrl = process.env.BASE_URL || 'http://127.0.0.1:4173';
const { chromium } = require('C:/Users/HOANG MAI PHUONG/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const assert = require('node:assert/strict');
(async () => {
 const browser = await chromium.launch({ executablePath: 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe', headless: true });
 try {
  const page = await browser.newPage();
  await mockSession(page);
  const errors = [], requests = [];
  page.on('pageerror', error => errors.push(error.message));
  page.on('request', request => { if (request.method() !== 'GET') requests.push(request.url()); });
  await page.goto(baseUrl + '/#login');
  const email = page.getByLabel('Email', { exact: true });
  const password = page.getByLabel('Mật khẩu', { exact: true });
  await page.getByRole('button', { name: 'Đăng nhập', exact: true }).click();
  assert.equal(await page.locator('[aria-invalid=true]').count(), 2);
  assert.equal(await email.evaluate(node => node === document.activeElement), true);
  assert.ok(await email.getAttribute('aria-describedby'));
  await email.fill('invalid');
  await password.fill('short');
  await password.press('Enter');
  await page.getByText('Email chưa đúng định dạng. Vui lòng kiểm tra lại, ví dụ: ban@example.com.', { exact: true }).waitFor();
  await email.fill('person@example.com');
  const reveal = page.getByRole('button', { name: 'Hiện mật khẩu', exact: true });
  await reveal.focus(); await reveal.press('Enter');
  assert.equal(await password.getAttribute('type'), 'text');
  await page.getByRole('button', { name: 'Ẩn mật khẩu', exact: true }).press('Space');
  assert.equal(await password.getAttribute('type'), 'password');
  await password.press('Enter');
  await page.getByRole('status').filter({ hasText: 'Phản hồi đăng nhập không hợp lệ' }).waitFor();
  assert.ok(page.url().endsWith('#login'));
  assert.equal(await page.locator('[aria-invalid=true]').count(), 0);
  assert.deepEqual(await page.evaluate(() => [localStorage.length, sessionStorage.length, document.cookie]), [0, 0, '']);
  assert.equal(requests.length, 1); assert.ok(requests[0].endsWith('/api/auth/login'));
  await password.fill('changed');
  assert.equal(await page.locator('form [role=status]').textContent(), '');
  await page.getByRole('link', { name: 'Đăng ký ngay' }).click();
  await page.waitForURL('**/#register');
  await page.getByLabel('Họ tên', { exact: true }).waitFor();
  for (const width of [360, 390, 768, 1440]) {
   await page.setViewportSize({ width, height: 900 });
   await page.goto(baseUrl + '/#login');
   assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false);
   if (width === 360 || width === 1440) await page.screenshot({ path: width === 360 ? 'outputs/login-mobile.png' : 'outputs/login.png', fullPage: true });
  }
  assert.deepEqual(errors, []);
  console.log('PASS login: validation, focus/ARIA, keyboard reveal, Enter, unavailable service, one login request with invalid-response fixture; no credential storage, registration link, 4 viewport widths.');
 } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
>>>>>>> origin/main

async function fillRegistration(page, email, name = 'Browser Registered Learner') {
  await page.getByLabel('Họ tên', { exact: true }).fill(name);
  await page.getByLabel('Email', { exact: true }).fill(email);
  await page.getByLabel('Mật khẩu', { exact: true }).fill('MatKhau@123');
  await page.getByLabel('Nhập lại mật khẩu', { exact: true }).fill('MatKhau@123');
  await page.getByRole('checkbox').check();
}

async function runLoginChecks({ browser, baseUrl }) {
  const context = await browser.newContext();
  const page = await context.newPage();
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  try {
    await page.goto(`${baseUrl}/#home`);
    await page.waitForURL(url => url.hash.startsWith('#login'));
    const email = page.getByLabel('Email', { exact: true });
    const password = page.getByLabel('Mật khẩu', { exact: true });
    await page.getByRole('button', { name: 'Đăng nhập', exact: true }).click();
    assert.equal(await page.locator('[aria-invalid=true]').count(), 2);
    assert.equal(await email.evaluate(node => node === document.activeElement), true);
    assert.ok(await email.getAttribute('aria-describedby'));
    await email.fill('invalid');
    await password.fill('short');
    await password.press('Enter');
    await page.getByText('Email chưa đúng định dạng. Vui lòng kiểm tra lại, ví dụ: ban@example.com.', { exact: true }).waitFor();

    const reveal = page.getByRole('button', { name: 'Hiện mật khẩu', exact: true });
    await reveal.focus();
    await reveal.press('Enter');
    assert.equal(await password.getAttribute('type'), 'text');
    await page.getByRole('button', { name: 'Ẩn mật khẩu', exact: true }).press('Space');
    assert.equal(await password.getAttribute('type'), 'password');
    assert.equal(await page.locator('form').evaluate(form => form.noValidate), true);

    for (const width of [360, 390, 768, 1440]) {
      await page.setViewportSize({ width, height: 900 });
      assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false, `Login overflow at ${width}px`);
    }

    await page.getByRole('link', { name: 'Đăng ký ngay', exact: true }).click();
    await page.waitForURL('**/#register');
    await page.getByRole('button', { name: 'Tạo tài khoản', exact: true }).click();
    assert.equal(await page.locator('[aria-invalid=true]').count(), 5);
    const registeredEmail = `browser-${Date.now()}@example.com`;
    await fillRegistration(page, registeredEmail);
    const registration = page.waitForResponse(response => response.url().endsWith('/api/auth/register'));
    await page.getByRole('button', { name: 'Tạo tài khoản', exact: true }).click();
    assert.equal((await registration).status(), 201);
    await page.waitForURL('**/#login');
    assert.equal(await page.getByLabel('Email', { exact: true }).inputValue(), registeredEmail);
    await page.getByText('Đăng ký thành công. Bạn có thể đăng nhập ngay.', { exact: true }).waitFor();
    assert.equal(await page.evaluate(key => sessionStorage.getItem(key), TOKEN_KEY), null);

    await page.goto(`${baseUrl}/#register`);
    await fillRegistration(page, registeredEmail);
    const duplicate = page.waitForResponse(response => response.url().endsWith('/api/auth/register'));
    await page.getByRole('button', { name: 'Tạo tài khoản', exact: true }).click();
    assert.equal((await duplicate).status(), 409);
    await page.locator('.field-error').filter({ hasText: 'Email này đã được đăng ký' }).waitFor();
    assert.equal(await page.getByLabel('Email', { exact: true }).getAttribute('aria-invalid'), 'true');
    assert.equal(new URL(page.url()).hash, '#register');

    await page.locator('.auth-tabs').getByRole('link', { name: 'Đăng nhập', exact: true }).click();
    await page.getByLabel('Email', { exact: true }).fill(registeredEmail);
    await page.getByLabel('Mật khẩu', { exact: true }).fill('WrongPassword');
    const wrongPassword = page.waitForResponse(response => response.url().endsWith('/api/auth/login'));
    await page.getByRole('button', { name: 'Đăng nhập', exact: true }).click();
    assert.equal((await wrongPassword).status(), 401);
    await page.getByText('Email hoặc mật khẩu không chính xác.', { exact: true }).waitFor();
    assert.equal(new URL(page.url()).hash, '#login');
    assert.equal(await page.evaluate(key => sessionStorage.getItem(key), TOKEN_KEY), null);

    // Giữ request lại để kiểm tra trạng thái chờ và chống gửi hai lần.
    let releaseLogin;
    const holdLogin = new Promise(resolve => { releaseLogin = resolve; });
    let pendingCount = 0;
    await page.route('**/api/auth/login', async route => {
      pendingCount += 1;
      await holdLogin;
      await route.continue();
    });
    await page.getByLabel('Mật khẩu', { exact: true }).fill('MatKhau@123');
    const signedIn = page.waitForResponse(response => response.url().endsWith('/api/auth/login'));
    await page.getByRole('button', { name: 'Đăng nhập', exact: true }).click();
    await page.getByRole('button', { name: 'Đang đăng nhập…', exact: true }).waitFor();
    assert.equal(await page.getByRole('button', { name: 'Đang đăng nhập…', exact: true }).isDisabled(), true);
    releaseLogin();
    assert.equal((await signedIn).status(), 200);
    await page.waitForURL('**/#home');
    await page.unroute('**/api/auth/login');
    assert.equal(pendingCount, 1);
    await page.getByRole('heading', { name: 'Hôm nay bạn muốn học gì?', exact: true }).waitFor();
    const token = await page.evaluate(key => sessionStorage.getItem(key), TOKEN_KEY);
    assert.ok(token && token.split('.').length === 3);
    assert.equal(await page.evaluate(() => JSON.stringify({ local: { ...localStorage }, session: { ...sessionStorage } }).includes('MatKhau@123')), false);

    const restore = page.waitForResponse(response => response.url().endsWith('/api/auth/me'));
    await page.reload();
    assert.equal((await restore).status(), 200);
    await page.getByRole('heading', { name: 'Hôm nay bạn muốn học gì?', exact: true }).waitFor();
    assert.equal(await page.locator('.account-menu > summary').textContent(), 'Browser Registered Learner');
    assert.equal(await page.evaluate(key => sessionStorage.getItem(key), TOKEN_KEY), token);

    await page.goto(`${baseUrl}/#admin`);
    await page.getByRole('heading', { name: 'Không có quyền truy cập', exact: true }).waitFor();
    assert.equal(await page.getByRole('heading', { name: 'Quản trị nội dung', exact: true }).count(), 0);
    const forbidden = await page.evaluate(async accessToken => {
      const response = await fetch('/api/admin/access', { headers: { Authorization: `Bearer ${accessToken}` } });
      return response.status;
    }, token);
    assert.equal(forbidden, 403);
    await logout(page);
    await page.goto(`${baseUrl}/#home`);
    await page.waitForURL(url => url.hash.startsWith('#login'));

    // Token đã lưu bị sai phải được server từ chối và xóa khỏi trình duyệt.
    await page.evaluate(({ tokenKey, expiryKey }) => {
      sessionStorage.setItem(tokenKey, 'invalid.token.value');
      sessionStorage.setItem(expiryKey, String(Date.now() + 60000));
    }, { tokenKey: TOKEN_KEY, expiryKey: EXPIRY_KEY });
    const invalidToken = page.waitForResponse(response => response.url().endsWith('/api/auth/me'));
    await page.evaluate(() => history.replaceState(null, '', '#home'));
    await page.reload();
    assert.equal((await invalidToken).status(), 401);
    await page.waitForURL(url => url.hash.startsWith('#login'));
    assert.equal(await page.evaluate(key => sessionStorage.getItem(key), TOKEN_KEY), null);

    await login(page, baseUrl, 'admin@example.com');
    const adminCheck = page.waitForResponse(response => response.url().endsWith('/api/admin/access'));
    await page.goto(`${baseUrl}/#admin`);
    assert.equal((await adminCheck).status(), 200);
    await page.getByRole('heading', { name: 'Quản trị nội dung', exact: true }).waitFor();
    await logout(page);
    assert.deepEqual(errors, []);
    console.log('PASS: real register/login API, validation, duplicate email, JWT restore/logout, role guards and responsive login.');
  } finally {
    await context.close();
  }
}

module.exports = { runLoginChecks };
if (require.main === module) {
  withApplication(runLoginChecks).catch(error => { console.error(error); process.exitCode = 1; });
}
