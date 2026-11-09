import { el, button, heading, panel, field, badge, notice, toast } from '../components/ui.js';
import {setupValidation,validateFields} from '../components/validation.js';
export function renderAdmin() {
 const root = el('div', {}, heading('Quản trị nội dung', 'Quản lý môn học, chủ đề và các nguồn tài liệu học tập.'));
 const content = el('div', {}); let active = new URLSearchParams(location.hash.split('?')[1]).get('tab') || 'subjects'; let editing = null;
 const subjects = [{ name: 'Toán học', level: 'THPT', active: true }, { name: 'Tiếng Anh', level: 'THPT', active: true }];
 const topics = [{ name: 'Phương trình bậc hai', level: 'Toán học · Chương 1', active: true }, { name: 'Hàm số và đồ thị', level: 'Toán học · Chương 1', active: true }];
 const documents = [{ name: 'Đại số cơ bản.pdf', status: 'ready', active: true }, { name: 'Hàm số nâng cao.txt', status: 'pending', active: false }, { name: 'Tài liệu cần kiểm tra.pdf', status: 'error', active: false }];
 const tabs = el('nav', { className: 'tabs', 'aria-label': 'Nhóm quản trị' });
 function draw() {
  tabs.replaceChildren(...[['subjects', 'Môn học'], ['topics', 'Chủ đề'], ['documents', 'Tài liệu nguồn']].map(([id, label]) => { const b = button(label, () => { active = id; draw(); }, `tab ${active === id ? 'active' : ''}`); if (id === active) b.setAttribute('aria-current', 'page'); return b; }));
  if (active === 'documents') return drawDocuments();
  const collection = active === 'subjects' ? subjects : topics;
  if (editing && !collection.includes(editing)) editing = null;
  const name = el('input', { className: 'input', value: editing?.name || '', maxlength: 180, placeholder: active === 'subjects' ? 'Ví dụ: Toán học' : 'Ví dụ: Phương trình bậc hai' });
  const detail = el('input', { className: 'input', value: editing?.level || '', maxlength: 150, placeholder: active === 'subjects' ? 'THPT' : 'Toán học · Chương 1' });
  const form = el('form', { className: 'form-grid' }, field(active === 'subjects' ? 'Tên môn học' : 'Tên chủ đề', name), field(active === 'subjects' ? 'Cấp học' : 'Môn và chương', detail), el('button', { type: 'submit', className: 'button primary' }, 'Thêm nội dung'));
  form.querySelector('[type=submit]').textContent = editing ? 'Lưu thay đổi' : 'Thêm nội dung';
  if (editing) form.append(button('Huỷ chỉnh sửa', () => { editing = null; draw(); }, 'ghost'));
  setupValidation(form,[name,detail]);
  form.addEventListener('submit', e => { e.preventDefault(); const duplicate=collection.some(item => item !== editing && item.name.toLowerCase() === name.value.trim().toLowerCase());if(!validateFields([[name,!name.value.trim()?'Vui lòng nhập tên nội dung.':duplicate?'Tên này đã được sử dụng trong danh sách. Vui lòng chọn tên khác.':''],[detail,!detail.value.trim()?'Vui lòng nhập thông tin phân loại.':'']]))return; if (editing) Object.assign(editing, {name:name.value.trim(),level:detail.value.trim()}); else collection.push({ name: name.value.trim(), level: detail.value.trim(), active: true }); editing = null; draw(); });
  content.replaceChildren(el('div', { className: 'grid-2' }, panel('Danh sách', el('div', { className: 'topic-list' }, ...collection.map(item => el('div', { className: 'topic-row' }, el('div', {}, el('h3', {}, item.name), el('p', {}, item.level), badge(item.active ? 'Đang bật' : 'Đã tắt', item.active ? 'success' : 'neutral')), el('div', { className:'page-actions' }, button('Sửa', () => { editing = item; draw(); content.querySelector('input').focus(); }, 'secondary small'), button(item.active ? 'Vô hiệu hoá' : 'Kích hoạt', () => { item.active = !item.active; draw(); }, 'ghost small')))))), panel(editing ? 'Chỉnh sửa nội dung' : 'Thêm nội dung', form)));
 }
 function drawDocuments() {
  const file = el('input', { type: 'file', accept: '.pdf,.txt', className: 'input', 'aria-label': 'Chọn tài liệu PDF hoặc TXT' });
  const status = el('div', { role: 'status' });
  file.addEventListener('change', () => { const selected = file.files[0]; if (!selected) return; if (!/\.(pdf|txt)$/i.test(selected.name) || selected.size > 10 * 1024 * 1024) { status.replaceChildren(notice('Chọn PDF hoặc TXT có dung lượng tối đa 10 MB.', 'error')); file.value = ''; return; } status.replaceChildren(notice(`Đã chọn “${selected.name}”. Chưa tải lên máy chủ; tệp không được đọc hoặc xử lý.`, 'warning')); });
  const table = el('table', {}, el('caption', { className: 'sr-only' }, 'Các tài liệu'), el('thead', {}, el('tr', {}, ...['Tên tài liệu', 'Trạng thái', 'Nguồn truy xuất', 'Thao tác'].map(s => el('th', { scope: 'col' }, s)))), el('tbody', {}, ...documents.map(doc => el('tr', {}, el('td', {}, doc.name), el('td', {}, badge(doc.status, doc.status === 'ready' ? 'success' : 'warning')), el('td', {}, doc.active ? 'Đang bật' : 'Đang tắt'), el('td', {}, button(doc.active ? 'Tắt nguồn' : 'Bật nguồn', () => { if (doc.status !== 'ready') { toast('Chỉ tài liệu sẵn sàng mới có thể bật.'); return; } doc.active = !doc.active; drawDocuments(); }, 'ghost small'))))));
  const topic = el('select', {className:'select',required:true}, el('option',{value:''},'Chọn chủ đề'), ...topics.map(t => el('option',{value:t.name},t.name)));
  content.replaceChildren(panel('Chọn tài liệu nguồn', el('p', { className: 'helper' }, 'Chọn tài liệu PDF dạng văn bản hoặc TXT, dung lượng tối đa 10 MB.'), el('div',{className:'form-grid'}, field('Chủ đề của tài liệu',topic), field('Tên tài liệu',el('input',{className:'input',maxlength:200,placeholder:'Nhập tiêu đề dễ tìm kiếm'})), field('Nguồn xuất bản',el('input',{className:'input',type:'url',placeholder:'https://…'})), field('Tài liệu (tối đa 10 MB)', file), status)), panel('Danh sách tài liệu', el('div', { className: 'table-wrap' }, table), notice('ready: sẵn sàng · pending: đang xử lý · error: xử lý lỗi.')));
 }
 root.append(tabs, content); draw(); return root;
}
