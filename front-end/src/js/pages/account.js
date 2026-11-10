import { el, link, heading, panel, field, badge, toast } from '../components/ui.js';
import { setupValidation, validateFields } from '../components/validation.js';
import { renderAccountScreen } from './auth-screen.js';
export function renderAuth(register = false) { return renderAccountScreen(register); }
export function renderProfile() {
 const form = el('form', { className: 'form-grid' });
 const name = el('input', { className: 'input', value: 'Người học', maxlength: 120 });
 const year = el('input', { className: 'input', type: 'number', min: 1900, max: new Date().getFullYear(), placeholder: 'Ví dụ: 2005' });
 form.append(field('Họ tên', name), field('Năm sinh', year), el('button', { type: 'submit', className: 'button primary' }, 'Lưu thông tin'));
 setupValidation(form,[name,year]);
 form.addEventListener('submit', e => { e.preventDefault(); if(!validateFields([[name,!name.value.trim()?'Vui lòng nhập họ tên.':''],[year,year.value&&(!/^\d{4}$/.test(year.value)||+year.value<1900||+year.value>new Date().getFullYear())?'Năm sinh chưa hợp lệ. Vui lòng nhập 4 chữ số, từ 1900 đến năm hiện tại.':'']]))return;toast('Đã kiểm tra thông tin hồ sơ.'); });
 return el('div', {}, heading('Hồ sơ của tôi', 'Thông tin tài khoản và các hoạt động học tập.'), el('div', { className: 'grid-2' }, panel('', el('div', { className: 'profile-summary' }, el('div', { className: 'avatar', 'aria-hidden': 'true' }, 'NH'), el('div', {}, el('h2', {}, 'Người học'), badge('LEARNER', 'success'))), el('hr'), el('p', { className: 'helper' }, 'Email tài khoản'), el('div', { className: 'page-actions' }, link('Đăng xuất', '#login', 'button ghost'), link('Khu vực quản trị', '#admin', 'button secondary'))), panel('Chỉnh sửa thông tin', form)), el('div', { className: 'section-gap' }, panel('Lịch sử học tập', el('div', { className: 'activity-row' }, el('span', {}, 'Phương trình bậc hai'), link('Xem hội thoại', '#chat', 'button ghost small')), el('div', { className: 'activity-row' }, el('span', {}, 'Bài luyện tập trắc nghiệm'), link('Luyện tập', '#practice', 'button ghost small')))));
}
