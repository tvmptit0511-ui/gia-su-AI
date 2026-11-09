import { el, button, link, heading, panel, field, notice, badge, toast } from '../components/ui.js';
import { setupValidation, validateFields } from '../components/validation.js';
import { renderLogin } from './login.js';
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
 form.addEventListener('submit', event => {
  event.preventDefault(); message.replaceChildren();
  const rules=[[email,!email.value.trim()?'Vui lòng nhập email.':!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value.trim())?'Email chưa đúng định dạng. Vui lòng kiểm tra lại, ví dụ: ban@example.com.':''],[password,!password.value?'Vui lòng nhập mật khẩu.':register&&password.value.length<8?'Mật khẩu cần có ít nhất 8 ký tự. Vui lòng bổ sung để tiếp tục.':'']];
  if(register){rules.unshift([name,!name.value.trim()?'Vui lòng nhập họ tên.':'']);rules.push([repeat,!repeat.value?'Vui lòng nhập lại mật khẩu để xác nhận.':repeat.value!==password.value?'Mật khẩu xác nhận chưa khớp. Vui lòng nhập lại.':''],[consentInput,!consentInput.checked?'Vui lòng xác nhận bạn đồng ý với quy định sử dụng trước khi tiếp tục.':'']);}
  if(!validateFields(rules))return;
  message.replaceChildren(notice('Thông tin đã được kiểm tra.','success'));password.value='';repeat.value='';
 });
 return el('div', { className: 'auth-layout' }, el('section', { className: 'auth-intro' }, badge('Gia sư gợi mở'), el('h1', {}, 'Học theo cách bạn hiểu.'), el('p', {}, 'Hỏi từng bước. Tự tìm lời giải. Nhìn thấy sự tiến bộ sau mỗi bài học.'), link('Khám phá giao diện', '#home', 'button ghost')), el('section', { className: 'panel auth-card' }, el('nav', { className: 'auth-tabs', 'aria-label': 'Tài khoản' }, link('Đăng nhập', '#login', `tab ${register ? '' : 'active'}`), link('Đăng ký', '#register', `tab ${register ? 'active' : ''}`)), el('h2', {}, register ? 'Tạo tài khoản' : 'Chào mừng trở lại'), form));
}
export function renderProfile() {
 const form = el('form', { className: 'form-grid' });
 const name = el('input', { className: 'input', value: 'Người học', maxlength: 120 });
 const year = el('input', { className: 'input', type: 'number', min: 1900, max: new Date().getFullYear(), placeholder: 'Ví dụ: 2005' });
 form.append(field('Họ tên', name), field('Năm sinh', year), el('button', { type: 'submit', className: 'button primary' }, 'Lưu thông tin'));
 setupValidation(form,[name,year]);
 form.addEventListener('submit', e => { e.preventDefault(); if(!validateFields([[name,!name.value.trim()?'Vui lòng nhập họ tên.':''],[year,year.value&&(!/^\d{4}$/.test(year.value)||+year.value<1900||+year.value>new Date().getFullYear())?'Năm sinh chưa hợp lệ. Vui lòng nhập 4 chữ số, từ 1900 đến năm hiện tại.':'']]))return;toast('Đã kiểm tra thông tin hồ sơ.'); });
 return el('div', {}, heading('Hồ sơ của tôi', 'Thông tin tài khoản và các hoạt động học tập.'), el('div', { className: 'grid-2' }, panel('', el('div', { className: 'profile-summary' }, el('div', { className: 'avatar', 'aria-hidden': 'true' }, 'NH'), el('div', {}, el('h2', {}, 'Người học'), badge('LEARNER', 'success'))), el('hr'), el('p', { className: 'helper' }, 'Email tài khoản'), el('div', { className: 'page-actions' }, link('Đăng xuất', '#login', 'button ghost'), link('Khu vực quản trị', '#admin', 'button secondary'))), panel('Chỉnh sửa thông tin', form)), el('div', { className: 'section-gap' }, panel('Lịch sử học tập', el('div', { className: 'activity-row' }, el('span', {}, 'Phương trình bậc hai'), link('Xem hội thoại', '#chat', 'button ghost small')), el('div', { className: 'activity-row' }, el('span', {}, 'Bài luyện tập trắc nghiệm'), link('Luyện tập', '#practice', 'button ghost small')))));
}
