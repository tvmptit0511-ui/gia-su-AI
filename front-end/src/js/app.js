import { renderHome, renderDashboard } from './pages/learning.js';
import { renderAuth, renderProfile } from './pages/account.js';
import { renderChat } from './pages/chat.js';
import { renderPractice, renderResults } from './pages/practice.js';
import { renderAdmin } from './pages/admin.js';
import { renderHistory, renderIntro } from './pages/history.js';
import { el, heading, link } from './components/ui.js';
const routes = { intro: renderIntro, history: renderHistory, home: renderHome, chat: renderChat, practice: renderPractice, results: renderResults, dashboard: renderDashboard, profile: renderProfile, admin: renderAdmin, login: () => renderAuth(false), register: () => renderAuth(true) };
const titles = { intro:'Giới thiệu',history:'Lịch sử học tập',home: 'Trang học', chat: 'Hỏi gia sư', practice: 'Luyện tập', results: 'Kết quả', dashboard: 'Tiến độ', profile: 'Hồ sơ', admin: 'Quản trị', login: 'Đăng nhập', register: 'Đăng ký' };
const menu = document.querySelector('.mobile-menu-button');
const accountMenu = document.querySelector('.account-menu');
accountMenu.addEventListener('click', e => { if(e.target.closest('a')) accountMenu.open = false; });
document.addEventListener('click', e => { if(!accountMenu.contains(e.target)) accountMenu.open = false; });
menu.addEventListener('click', () => { const open = menu.getAttribute('aria-expanded') !== 'true'; menu.setAttribute('aria-expanded', String(open)); document.querySelector('.nav').classList.toggle('open', open); });
function render() {
 const route = location.hash.slice(1).split('?')[0] || 'home';
 const main = document.querySelector('#app');
 document.querySelector('#toast-region').replaceChildren();
 accountMenu.open = false;
 main.replaceChildren(routes[route] ? routes[route]() : el('div', {}, heading('Không tìm thấy trang', 'Đường dẫn này chưa có trong bản giao diện.'), link('Về trang học', '#home')));
 document.title = `${titles[route] || 'Không tìm thấy'} · Gia Sư AI`;
 document.querySelectorAll('.nav-link').forEach(a => { const active = a.hash === `#${route}`; a.classList.toggle('active', active); if (active) a.setAttribute('aria-current', 'page'); else a.removeAttribute('aria-current'); });
 menu.setAttribute('aria-expanded', 'false'); document.querySelector('.nav').classList.remove('open');
 window.scrollTo(0, 0); main.focus({ preventScroll: true });
}
window.addEventListener('hashchange', render); render();
