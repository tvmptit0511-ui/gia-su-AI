import { renderHome, renderDashboard } from './pages/learning.js';
import { renderAuth, renderProfile } from './pages/account.js';
import { renderChat } from './pages/chat.js';
import { renderPractice, renderResults } from './pages/practice.js';
import { renderAdmin } from './pages/admin.js';
import { renderHistory, renderIntro } from './pages/history.js';
import { el, heading, link, notice, button } from './components/ui.js';
import { api } from './api.js';
import { getAccessToken, getCurrentUser, setCurrentUser, clearSession, setLoginHint, loginDestination } from './session.js';

const routes = { intro: renderIntro, history: renderHistory, home: renderHome, chat: renderChat, practice: renderPractice, results: renderResults, dashboard: renderDashboard, profile: renderProfile, admin: renderAdmin, login: () => renderAuth(false), register: () => renderAuth(true) };
const titles = { intro: 'Giới thiệu', history: 'Lịch sử học tập', home: 'Trang học', chat: 'Hỏi gia sư', practice: 'Luyện tập', results: 'Kết quả', dashboard: 'Tiến độ', profile: 'Hồ sơ', admin: 'Quản trị', login: 'Đăng nhập', register: 'Đăng ký' };
const protectedRoutes = new Set(['home', 'chat', 'practice', 'results', 'dashboard', 'profile', 'history', 'admin']);
const menu = document.querySelector('.mobile-menu-button');
const accountMenu = document.querySelector('.account-menu');
const main = document.querySelector('#app');
let sessionReady = false;
let restoreError = null;
let renderVersion = 0;

accountMenu.addEventListener('click', e => { if(e.target.closest('a')) accountMenu.open = false; });
document.addEventListener('click', e => { if(!accountMenu.contains(e.target)) accountMenu.open = false; });
menu.addEventListener('click', () => { const open = menu.getAttribute('aria-expanded') !== 'true'; menu.setAttribute('aria-expanded', String(open)); document.querySelector('.nav').classList.toggle('open', open); });

function updateAccountMenu() {
  const user = getCurrentUser();
  const links = user ? [
    el('a', { href: '#profile' }, 'Hồ sơ của tôi'),
    el('a', { href: '#history' }, 'Lịch sử học tập'),
  ] : [el('a', { href: '#login' }, 'Đăng nhập'), el('a', { href: '#register' }, 'Đăng ký')];
  if (user?.role === 'ADMIN') links.push(el('a', { href: '#admin' }, 'Quản trị nội dung'));
  if (user) links.push(el('a', { href: '#login', 'data-logout': true }, 'Đăng xuất'));
  links.push(el('a', { href: '#intro' }, 'Giới thiệu'));
  accountMenu.querySelector('nav').replaceChildren(...links);
  accountMenu.querySelector('summary').textContent = user?.name || 'Tài khoản';
}

function replaceRoute(route) {
  history.replaceState(null, '', `#${route}`);
  return render();
}

function finishRender(route, content) {
  main.replaceChildren(content);
  document.title = `${titles[route] || 'Không tìm thấy'} · Gia Sư AI`;
  document.querySelectorAll('.nav-link').forEach(a => {
    const active = a.hash === `#${route}`;
    a.classList.toggle('active', active);
    if (active) a.setAttribute('aria-current', 'page'); else a.removeAttribute('aria-current');
  });
  menu.setAttribute('aria-expanded', 'false');
  document.querySelector('.nav').classList.remove('open');
  window.scrollTo(0, 0);
  main.focus({ preventScroll: true });
}

async function render() {
  const version = ++renderVersion;
  const fullRoute = location.hash.slice(1) || 'home';
  const route = fullRoute.split('?')[0];
  updateAccountMenu();
  accountMenu.open = false;
  document.querySelector('#toast-region').replaceChildren();
  if (!sessionReady) {
    main.replaceChildren(el('div', { role: 'status' }, 'Đang kiểm tra phiên đăng nhập…'));
    return;
  }

  const user = getCurrentUser();
  if (protectedRoutes.has(route) && !user) {
    if (restoreError && getAccessToken()) {
      finishRender(route, el('div', {}, heading('Chưa thể kiểm tra phiên đăng nhập', ''),
        notice(restoreError.message, 'error'), button('Thử lại', restoreSession, 'primary'),
        button('Đăng nhập lại', () => { clearSession(); location.hash = 'login'; }, 'ghost')));
      return;
    }
    return replaceRoute(`login?next=${encodeURIComponent(fullRoute)}`);
  }
  if (user && (route === 'login' || route === 'register')) return replaceRoute(loginDestination());

  if (route === 'admin') {
    main.replaceChildren(el('div', { role: 'status' }, 'Đang kiểm tra quyền truy cập…'));
    try {
      const result = await api('/auth/me');
      if (version !== renderVersion) return;
      if (!result?.user?.id) throw new Error('Chưa thể xác thực tài khoản. Vui lòng thử lại.');
      setCurrentUser(result.user, { notifyChange: false });
      updateAccountMenu();
      if (result.user.role !== 'ADMIN') {
        finishRender(route, el('div', {}, heading('Không có quyền truy cập', 'Trang này dành cho tài khoản quản trị.'), link('Về trang học', '#home')));
        return;
      }
      await api('/admin/access');
      if (version !== renderVersion) return;
    } catch (error) {
      if (version !== renderVersion) return;
      finishRender(route, el('div', {}, heading(error.status === 403 ? 'Không có quyền truy cập' : 'Chưa thể mở trang quản trị', ''),
        notice(error.message, 'error'), link('Về trang học', '#home'), button('Thử lại', render, 'ghost')));
      return;
    }
  }
  finishRender(route, routes[route] ? routes[route]() : el('div', {}, heading('Không tìm thấy trang', 'Đường dẫn này chưa có trong ứng dụng.'), link('Về trang học', '#home')));
}

async function restoreSession() {
  sessionReady = false;
  restoreError = null;
  render();
  const token = getAccessToken();
  if (token) {
    try {
      const result = await api('/auth/me');
      if (!result?.user?.id) throw new Error('Phản hồi tài khoản chưa hợp lệ. Vui lòng thử lại.');
      if (getAccessToken() === token) setCurrentUser(result.user, { notifyChange: false });
    } catch (error) {
      if (getAccessToken() === token) restoreError = error;
    }
  }
  sessionReady = true;
  return render();
}

document.addEventListener('click', event => {
  if (event.target.closest('[data-logout]')) {
    event.preventDefault();
    clearSession('logout');
    location.hash = 'login';
  }
});
window.addEventListener('authchange', event => {
  restoreError = null;
  if (event.detail.reason === 'expired') setLoginHint({ message: 'Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.', kind: 'warning' });
  if (event.detail.reason === 'inactive') setLoginHint({ message: 'Tài khoản đã bị vô hiệu hóa.', kind: 'error' });
  render();
});
window.addEventListener('hashchange', render);
restoreSession();
