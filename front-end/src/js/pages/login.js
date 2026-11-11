<<<<<<< HEAD
import { el, field, link, notice } from '../components/ui.js';
import { setupValidation, validateFields, showServerErrors } from '../components/validation.js';
import { api } from '../api.js';
import { saveSession, takeLoginHint, loginDestination } from '../session.js';

export function renderLogin() {
 const hint = takeLoginHint();
 const form = el('form', { className: 'form-grid', 'aria-label': 'Đăng nhập tài khoản' });
 const email = el('input', {
  className: 'input', type: 'email', name: 'email', autocomplete: 'username',
  inputmode: 'email', autocapitalize: 'none', spellcheck: 'false', required: true,
  maxlength: 255, placeholder: 'ban@example.com', value: hint?.email || ''
 });
 const password = el('input', {
  className: 'input', type: 'password', name: 'password',
  autocomplete: 'current-password', required: true, maxlength: 128
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
 if (hint?.message) message.append(notice(hint.message, hint.kind || 'success'));
 const submit = el('button', { type: 'submit', className: 'button primary' }, 'Đăng nhập');
 form.append(field('Email', email), passwordField, submit, message);
 setupValidation(form, [email, password]);
 form.addEventListener('input', () => message.replaceChildren());
 let pending = false;
 form.addEventListener('submit', async event => {
  event.preventDefault();
  if (pending) return;
  message.replaceChildren();
  const valid = validateFields([
   [email, !email.value.trim() ? 'Vui lòng nhập email.' : !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value.trim())
    ? 'Email chưa đúng định dạng. Vui lòng kiểm tra lại, ví dụ: ban@example.com.' : ''],
   [password, !password.value ? 'Vui lòng nhập mật khẩu.' : '']
  ]);
  if (!valid) return;
  pending = true;
  form.setAttribute('aria-busy', 'true');
  submit.disabled = true;
  submit.textContent = 'Đang đăng nhập…';
  try {
   const result = await api('/auth/login', { method: 'POST', auth: false, body: { email: email.value.trim(), password: password.value } });
   if (!form.isConnected) return;
   const next = loginDestination();
   password.value = '';
   saveSession(result);
   location.hash = next;
  } catch (error) {
   if (!form.isConnected) return;
   showServerErrors(error.fields, { email, password });
   message.replaceChildren(notice(error.message || 'Chưa thể đăng nhập. Vui lòng thử lại.', 'error'));
  } finally {
   pending = false;
   form.removeAttribute('aria-busy');
   submit.disabled = false;
   submit.textContent = 'Đăng nhập';
  }
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
=======
import { renderAccountScreen } from './auth-screen.js';
export function renderLogin() { return renderAccountScreen(false); }
>>>>>>> origin/main
