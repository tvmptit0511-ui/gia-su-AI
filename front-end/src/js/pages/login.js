import { el, field, link, notice } from '../components/ui.js';
import { setupValidation, validateFields } from '../components/validation.js';

// Authentication must be connected here once TK-006 defines its API contract.
// Client-side validation alone must never create a session or redirect as success.
export function renderLogin() {
 const form = el('form', { className: 'form-grid', 'aria-label': 'Đăng nhập tài khoản' });
 const email = el('input', {
  className: 'input', type: 'email', name: 'email', autocomplete: 'username',
  inputmode: 'email', autocapitalize: 'none', spellcheck: 'false', required: true,
  maxlength: 255, placeholder: 'ban@example.com'
 });
 const password = el('input', {
  className: 'input', type: 'password', name: 'password',
  autocomplete: 'current-password', required: true
 });
 const passwordField = field('Mật khẩu', password);
 const toggle = el('button', {
  type: 'button', className: 'password-toggle', 'aria-controls': password.id,
  'aria-label': 'Hiện mật khẩu'
 }, 'Hiện');
 toggle.addEventListener('click', () => {
  const visible = password.type === 'password';
  password.type = visible ? 'text' : 'password';
  toggle.textContent = visible ? 'Ẩn' : 'Hiện';
  toggle.setAttribute('aria-label', visible ? 'Ẩn mật khẩu' : 'Hiện mật khẩu');
 });
 const passwordControl = el('div', { className: 'password-control' });
 password.replaceWith(passwordControl);
 passwordControl.append(password, toggle);
 const capsWarning = el('p', { className: 'helper login-caps', hidden: true }, 'Caps Lock đang bật.');
 password.setAttribute('aria-describedby', 'login-caps-warning');
 capsWarning.id = 'login-caps-warning';
 for (const eventName of ['keydown', 'keyup']) {
  password.addEventListener(eventName, event => { capsWarning.hidden = !event.getModifierState('CapsLock'); });
 }
 password.addEventListener('blur', () => { capsWarning.hidden = true; });
 passwordField.append(capsWarning);
 const message = el('div', { role: 'status', 'aria-live': 'polite', 'aria-atomic': 'true' });
 const submit = el('button', { type: 'submit', className: 'button primary' }, 'Đăng nhập');
 form.append(field('Email', email), passwordField, submit, message);
 setupValidation(form, [email, password]);
 form.addEventListener('input', () => message.replaceChildren());
 form.addEventListener('submit', event => {
  event.preventDefault();
  message.replaceChildren();
  const valid = validateFields([
   [email, !email.value.trim() ? 'Vui lòng nhập email.' : !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value.trim())
    ? 'Email chưa đúng định dạng. Vui lòng kiểm tra lại, ví dụ: ban@example.com.' : ''],
   [password, !password.value ? 'Vui lòng nhập mật khẩu.' : '']
  ]);
  if (!valid) return;
  message.replaceChildren(notice('Đăng nhập chưa khả dụng. Vui lòng thử lại khi dịch vụ đăng nhập được kết nối.', 'warning'));
 });
 return el('div', { className: 'auth-layout login-layout' },
  el('section', { className: 'auth-intro login-intro' },
   el('h1', {}, 'Tiếp tục hành trình học của bạn.'),
   el('p', {}, 'Đăng nhập để tiếp tục hội thoại với gia sư AI, luyện tập và theo dõi tiến độ học tập.'),
   link('Về trang học', '#home', 'button ghost')),
  el('section', { className: 'panel auth-card login-card', 'aria-labelledby': 'login-title' },
   el('nav', { className: 'auth-tabs', 'aria-label': 'Tài khoản' },
    el('a', { href: '#login', className: 'tab active', 'aria-current': 'page' }, 'Đăng nhập'),
    link('Đăng ký', '#register', 'tab')),
   el('h2', { id: 'login-title' }, 'Chào mừng trở lại'),
   el('p', { className: 'login-description' }, 'Nhập email và mật khẩu của bạn.'),
   form,
   el('p', { className: 'login-register' }, 'Chưa có tài khoản? ', link('Đăng ký ngay', '#register', ''))));
}
