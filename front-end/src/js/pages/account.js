<<<<<<< HEAD
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
=======
import { getSession, isAdmin, logout } from '../session.js';
import { el, button, link, heading, panel, field, badge, toast } from '../components/ui.js';
import { setupValidation, validateFields } from '../components/validation.js';
import { renderAccountScreen } from './auth-screen.js';
export function renderAuth(register = false) { return renderAccountScreen(register); }
export function renderProfile() {
 const user = getSession().user;
 if (!user) return el('div', {}, heading('Vui lòng đăng nhập', 'Đăng nhập để xem hồ sơ.'));
 if(isAdmin()) return el('div', {className:'admin-profile'},
  heading('Hồ sơ quản trị', 'Thông tin tài khoản quản trị nội dung.'),
  panel('Thông tin tài khoản',
   el('dl', {className:'profile-details'},
    el('div', {}, el('dt', {}, 'Họ tên'), el('dd', {}, user.name)),
    el('div', {}, el('dt', {}, 'Email'), el('dd', {}, user.email)),
    el('div', {}, el('dt', {}, 'Vai trò'), el('dd', {}, badge('Quản trị viên', 'success')))),
   el('p', {className:'helper'}, 'Chức năng cập nhật hồ sơ chưa được kết nối. Thông tin đang hiển thị từ phiên hiện tại.'),
   el('div', {className:'page-actions'}, link('Về quản trị nội dung', '#admin?tab=subjects', 'button secondary'), button('Đăng xuất', logout, 'ghost'))));
 const form = el('form', { className: 'form-grid' });
 const name = el('input', { className: 'input', value: user.name, maxlength: 120 });
 const year = el('input', { className: 'input', type: 'number', min: 1900, max: new Date().getFullYear(), placeholder: 'Ví dụ: 2005' });
 form.append(field('Họ tên', name), field('Năm sinh', year), el('button', { type: 'submit', className: 'button primary' }, 'Lưu thông tin'));
 setupValidation(form,[name,year]);
 form.addEventListener('submit', e => { e.preventDefault(); if(!validateFields([[name,!name.value.trim()?'Vui lòng nhập họ tên.':''],[year,year.value&&(!/^\d{4}$/.test(year.value)||+year.value<1900||+year.value>new Date().getFullYear())?'Năm sinh chưa hợp lệ. Vui lòng nhập 4 chữ số, từ 1900 đến năm hiện tại.':'']]))return;toast('Đã kiểm tra thông tin hồ sơ.'); });
 return el('div', {}, heading('Hồ sơ của tôi', 'Thông tin tài khoản và các hoạt động học tập.'), el('div', { className: 'grid-2' }, panel('', el('div', { className: 'profile-summary' }, el('div', { className: 'avatar', 'aria-hidden': 'true' }, 'NH'), el('div', {}, el('h2', {}, user.name), badge(user.role === 'ADMIN' ? 'Quản trị viên' : 'Sinh viên', 'success'))), el('hr'), el('p', { className: 'helper' }, user.email), el('div', { className: 'page-actions' }, button('Đăng xuất', logout, 'ghost'), isAdmin() ? link('Khu vực quản trị', '#admin', 'button secondary') : null)), panel('Chỉnh sửa thông tin', form)), el('div', { className: 'section-gap' }, panel('Lịch sử học tập', el('div', { className: 'activity-row' }, el('span', {}, 'Phương trình bậc hai'), link('Xem hội thoại', '#chat', 'button ghost small')), el('div', { className: 'activity-row' }, el('span', {}, 'Bài luyện tập trắc nghiệm'), link('Luyện tập', '#practice', 'button ghost small')))));
>>>>>>> origin/main
}
