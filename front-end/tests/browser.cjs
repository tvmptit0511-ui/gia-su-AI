<<<<<<< HEAD
const assert = require('node:assert/strict');
const { withApplication, login, TOKEN_KEY } = require('./helpers.cjs');
const { runLoginChecks } = require('./login.cjs');
=======
const { mockSession } = require('./session-fixture.cjs');
const baseUrl = process.env.BASE_URL || 'http://127.0.0.1:4173';
const { chromium } = require('C:/Users/HOANG MAI PHUONG/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const fs = require('node:fs');
const assert = require('node:assert/strict');
(async () => {
 const browser = await chromium.launch({ executablePath: 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe', headless: true });
 const page = await browser.newPage();
 await mockSession(page, {role:'LEARNER',authenticated:true}); const errors = []; page.on('pageerror', e => errors.push(e.message));
 await page.goto(baseUrl);
 for (const width of [390, 768, 1024, 1440]) {
  await page.setViewportSize({ width, height: 1000 });
  for (const route of ['intro','home','chat','practice','results','dashboard','profile','history']) {
   await page.goto(`${baseUrl}/#${route}`); await page.locator('#app > div').waitFor();
   assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false, `Overflow ${route} ${width}`);
  }
 }
 await page.goto(baseUrl + '/#home'); await page.getByRole('searchbox').fill('không có'); await page.getByRole('status').filter({ hasText: 'Không tìm thấy' }).waitFor();
 await page.goto(baseUrl + '/#chat');
 await page.getByRole('button', { name: 'Xem lời giải', exact: true }).click(); await page.getByRole('dialog').waitFor(); await page.getByRole('button', { name: 'Quay lại' }).click();
 assert.equal(await page.getByText('Lời giải minh hoạ:', { exact: false }).count(), 0);
 await page.getByRole('textbox', { name: 'Câu hỏi cho gia sư' }).fill('<img src=x onerror=alert(1)>'); await page.getByRole('button', { name: 'Gửi câu hỏi' }).click(); assert.equal(await page.locator('#app img').count(), 0);
 await page.goto(baseUrl + '/#practice'); await page.getByRole('button', { name: 'Bắt đầu luyện tập' }).click();
 const answers = [1,0,2,1,3];
 for (let i=0;i<5;i++) { await page.getByRole('radio').nth(answers[i]).check(); if(i<4) await page.getByRole('button',{name:'Câu tiếp',exact:true}).click(); }
 await page.getByRole('button',{name:'Nộp bài',exact:true}).click(); await page.getByRole('dialog').getByRole('button',{name:'Nộp bài',exact:true}).click(); await page.waitForURL('**/#results'); await page.getByText('5/5 câu đúng · điểm').waitFor();
 await page.goto(baseUrl + '/#chat'); await page.getByText('Xem trước trạng thái giao diện',{exact:true}).click(); await page.getByRole('combobox',{name:'Xem trạng thái giao diện'}).selectOption('quota'); assert.equal(await page.getByRole('button',{name:'Gửi câu hỏi'}).isDisabled(),true); await page.getByRole('combobox',{name:'Xem trạng thái giao diện'}).selectOption('error'); await page.getByRole('button',{name:'Thử lại',exact:true}).click(); assert.equal(await page.getByRole('button',{name:'Gửi câu hỏi'}).isDisabled(),false);
 await page.goto(baseUrl + '/#history'); await page.getByRole('searchbox').fill('không có'); await page.getByText('Chưa có hoạt động phù hợp với bộ lọc.').waitFor();
 assert.equal(await page.locator('footer').innerText().then(t=>t.includes('demo')||t.includes('#0F172A')),false);
 await page.goto(baseUrl + '/#profile');await page.getByLabel('Họ tên',{exact:true}).fill('   ');await page.getByRole('button',{name:'Lưu thông tin',exact:true}).click();await page.getByText('Vui lòng nhập họ tên.',{exact:true}).waitFor();
 await page.goto(baseUrl + '/#chat');await page.getByRole('button',{name:'Gửi câu hỏi'}).click();await page.getByText('Vui lòng nhập câu hỏi trước khi gửi.',{exact:true}).waitFor();assert.equal(await page.locator('.demo-notice').count(),0);
 fs.mkdirSync('outputs',{recursive:true});
 for(const [name,width] of [['desktop',1440],['tablet',1024],['mobile',390]]) { await page.setViewportSize({width,height:1000}); await page.goto(baseUrl + '/#home'); await page.screenshot({path:`outputs/${name}.png`,fullPage:true}); }
 await page.setViewportSize({width:1440,height:1000}); for(const route of ['history']) {await page.goto(`${baseUrl}/#${route}`);await page.screenshot({path:`outputs/${route}.png`,fullPage:true});}
 assert.deepEqual(errors, []); console.log('PASS: 32 public/learner route/viewport checks (LEARNER fixture); search, dialog, safe text, quiz 100%, quota/retry, history empty and footer removal; no page errors.');
 await browser.close();
})().catch(e=>{ console.error(e); process.exit(1); });
>>>>>>> origin/main

async function runBrowserChecks(application) {
  await runLoginChecks(application);
  const { browser, baseUrl, stopBackend } = application;
  const context = await browser.newContext();
  const page = await context.newPage();
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  try {
    await login(page, baseUrl);
    for (const width of [390, 768, 1024, 1440]) {
      await page.setViewportSize({ width, height: 1000 });
      for (const route of ['intro', 'home', 'chat', 'practice', 'results', 'dashboard', 'profile', 'history']) {
        await page.goto(`${baseUrl}/#${route}`);
        await page.locator('#app > div').waitFor();
        assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false, `Overflow ${route} at ${width}px`);
      }
    }
    await page.goto(`${baseUrl}/#home`);
    await page.getByRole('searchbox', { name: 'Tìm chủ đề', exact: true }).fill('không có');
    await page.getByRole('status').filter({ hasText: 'Không tìm thấy chủ đề' }).waitFor();
    await page.goto(`${baseUrl}/#profile`);
    await page.getByRole('heading', { name: 'Browser Learner', exact: true }).waitFor();
    await page.getByText('learner@example.com', { exact: true }).waitFor();
    assert.equal(await page.getByRole('link', { name: 'Khu vực quản trị', exact: true }).count(), 0);
    await page.goto(`${baseUrl}/#chat`);
    await page.getByRole('button', { name: 'Xem lời giải', exact: true }).click();
    await page.getByRole('dialog').waitFor();
    await page.getByRole('button', { name: 'Quay lại', exact: true }).click();
    await page.getByRole('textbox', { name: 'Câu hỏi cho gia sư', exact: true }).fill('<img src=x onerror=alert(1)>');
    await page.getByRole('button', { name: 'Gửi câu hỏi', exact: true }).click();
    assert.equal(await page.locator('#app img').count(), 0);
    assert.deepEqual(errors, []);
    console.log('PASS: 32 authenticated route/viewport checks, home search, real profile and existing UI interactions.');
  } finally {
    await context.close();
  }

  // Backend dừng phải hiện lỗi và giữ trạng thái khách, không giả lập đăng nhập thành công.
  await stopBackend();
  const offlineContext = await browser.newContext();
  const offlinePage = await offlineContext.newPage();
  try {
    await offlinePage.goto(`${baseUrl}/#login`);
    await offlinePage.getByLabel('Email', { exact: true }).fill('learner@example.com');
    await offlinePage.getByLabel('Mật khẩu', { exact: true }).fill('MatKhau@123');
    const failedLogin = offlinePage.waitForResponse(response => response.url().endsWith('/api/auth/login'));
    await offlinePage.getByRole('button', { name: 'Đăng nhập', exact: true }).click();
    assert.equal((await failedLogin).status(), 502);
    await offlinePage.getByText('Không thể kết nối với máy chủ. Vui lòng thử lại.', { exact: true }).waitFor();
    assert.equal(new URL(offlinePage.url()).hash, '#login');
    assert.equal(await offlinePage.evaluate(key => sessionStorage.getItem(key), TOKEN_KEY), null);
    assert.equal(await offlinePage.getByRole('button', { name: 'Đăng nhập', exact: true }).isDisabled(), false);
    console.log('PASS: backend outage returns an actionable error without authenticating the browser.');
  } finally {
    await offlineContext.close();
  }
}

withApplication(runBrowserChecks).catch(error => { console.error(error); process.exitCode = 1; });
