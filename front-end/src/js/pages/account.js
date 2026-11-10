import { el, button, link, heading, panel, field, notice, badge } from '../components/ui.js';
import { setupValidation, validateFields, showServerErrors } from '../components/validation.js';
import { renderLogin } from './login.js';
import { api } from '../api.js';
import { getCurrentUser, clearSession, setLoginHint } from '../session.js';
export function renderAuth(register = false) {
 if (!register) return renderLogin();
 const form = el('form', { className: 'form-grid' });
 const name = el('input', { className: 'input', name: 'name', autocomplete: 'name', maxlength: 120 });
 const email = el('input', { className: 'input', type: 'text', autocomplete: 'email', inputmode: 'email' });
 const password = el('input', { className: 'input', type: 'password', autocomplete: register ? 'new-password' : 'current-password' });
 const repeat = el('input', { className: 'input', type: 'password', autocomplete: 'new-password' });
 const consent = register ? el('label', { className: 'consent-row' }, el('input', { type: 'checkbox' }), 'Tôi đồng ý với quy định sử dụng cho người học từ đủ 18 tuổi.') : null;
 const message = el('div', { role: 'status' });
 if (register) form.append(field('Họ tên', name));
 form.append(field('Email', email), field('Mật khẩu', password));
 if(register){const helper=el('p',{className:'helper',id:'password-guidance'},'Sử dụng ít nhất 8 ký tự. Nên chọn mật khẩu dài, khó đoán và không dùng lại ở tài khoản khác.');password.setAttribute('aria-describedby',helper.id);form.append(helper);}
 if (register) form.append(field('Nhập lại mật khẩu', repeat), consent);
 const submit = el('button', { type: 'submit', className: 'button primary' }, register ? 'Tạo tài khoản' : 'Đăng nhập');
 form.append(submit, message);
 const consentInput=consent?.querySelector('input');
 setupValidation(form,[name,email,password,repeat,...(consentInput?[consentInput]:[])]);
 let pending = false;
 form.addEventListener('submit', async event => {
  event.preventDefault(); message.replaceChildren();
  if (pending) return;
  const rules=[[email,!email.value.trim()?'Vui lòng nhập email.':!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value.trim())?'Email chưa đúng định dạng. Vui lòng kiểm tra lại, ví dụ: ban@example.com.':''],[password,!password.value?'Vui lòng nhập mật khẩu.':register&&password.value.length<8?'Mật khẩu cần có ít nhất 8 ký tự. Vui lòng bổ sung để tiếp tục.':'']];
  if(register){rules.unshift([name,!name.value.trim()?'Vui lòng nhập họ tên.':'']);rules.push([repeat,!repeat.value?'Vui lòng nhập lại mật khẩu để xác nhận.':repeat.value!==password.value?'Mật khẩu xác nhận chưa khớp. Vui lòng nhập lại.':''],[consentInput,!consentInput.checked?'Vui lòng xác nhận bạn đồng ý với quy định sử dụng trước khi tiếp tục.':'']);}
  if(!validateFields(rules))return;
  pending = true;
  form.setAttribute('aria-busy', 'true');
  submit.disabled = true;
  submit.textContent = 'Đang tạo tài khoản…';
  try {
   const result = await api('/auth/register', { method: 'POST', auth: false, body: {
    name: name.value, email: email.value, password: password.value,
    confirmPassword: repeat.value, consent: consentInput.checked
   } });
   if (!form.isConnected) return;
   password.value = ''; repeat.value = '';
   setLoginHint({ email: result.user?.email || email.value.trim(), message: 'Đăng ký thành công. Bạn có thể đăng nhập ngay.' });
   location.hash = 'login';
  } catch (error) {
   if (!form.isConnected) return;
   showServerErrors(error.fields, { name, email, password, confirmPassword: repeat, consent: consentInput });
   message.replaceChildren(notice(error.message || 'Chưa thể tạo tài khoản. Vui lòng thử lại.', 'error'));
  } finally {
   pending = false;
   form.removeAttribute('aria-busy');
   submit.disabled = false;
   submit.textContent = 'Tạo tài khoản';
  }
 });
 return el('div', { className: 'auth-layout' }, el('section', { className: 'auth-intro' }, badge('Gia sư gợi mở'), el('h1', {}, 'Học theo cách bạn hiểu.'), el('p', {}, 'Hỏi từng bước. Tự tìm lời giải. Nhìn thấy sự tiến bộ sau mỗi bài học.'), link('Khám phá giao diện', '#home', 'button ghost')), el('section', { className: 'panel auth-card' }, el('nav', { className: 'auth-tabs', 'aria-label': 'Tài khoản' }, link('Đăng nhập', '#login', `tab ${register ? '' : 'active'}`), link('Đăng ký', '#register', `tab ${register ? 'active' : ''}`)), el('h2', {}, register ? 'Tạo tài khoản' : 'Chào mừng trở lại'), form));
}
export function renderProfile() {
 const user = getCurrentUser();
 if (!user) return el('div', {}, notice('Vui lòng đăng nhập để xem thông tin tài khoản.'), link('Đăng nhập', '#login'));
 const initials = user.name.split(/\s+/).filter(Boolean).slice(-2).map(part => part[0]).join('').toUpperCase();
 const actions = [button('Đăng xuất', () => { clearSession('logout'); location.hash = 'login'; }, 'ghost')];
 if (user.role === 'ADMIN') actions.push(link('Khu vực quản trị', '#admin', 'button secondary'));
 const created = new Date(user.createdAt);
 return el('div', {}, heading('Hồ sơ của tôi', 'Thông tin tài khoản đang đăng nhập.'), panel('',
  el('div', { className: 'profile-summary' }, el('div', { className: 'avatar', 'aria-hidden': 'true' }, initials),
   el('div', {}, el('h2', {}, user.name), badge(user.role, 'success'))), el('hr'),
  el('p', { className: 'helper' }, 'Email tài khoản'), el('p', {}, user.email),
  el('p', { className: 'helper' }, 'Ngày tạo tài khoản'),
  el('p', {}, Number.isNaN(created.getTime()) ? 'Chưa có thông tin' : created.toLocaleString('vi-VN')),
  el('div', { className: 'page-actions' }, actions)));
}
