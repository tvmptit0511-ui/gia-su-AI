import { el, button, heading, panel, field, badge, notice, toast } from '../components/ui.js';
import { setupValidation, validateFields } from '../components/validation.js';

const MAX_FILE_SIZE = 10 * 1024 * 1024;
const ALLOWED_TYPES = ['application/pdf', 'text/plain'];
const statusMeta = {
  ready: ['Sẵn sàng', 'success'],
  pending: ['Đang xử lý', 'warning'],
  error: ['Lỗi', 'error']
};
const formatSize = bytes => bytes < 1024 * 1024
  ? `${Math.max(1, Math.round(bytes / 1024))} KB`
  : `${(bytes / 1024 / 1024).toLocaleString('vi-VN', { maximumFractionDigits: 1 })} MB`;

export function renderAdmin() {
  const root = el('div', { className: 'admin-page' }, heading('Quản trị nội dung', 'Quản lý môn học, chủ đề và các nguồn tài liệu học tập.'));
  const content = el('div');
  let active = new URLSearchParams(location.hash.split('?')[1]).get('tab') || 'subjects';
  let editing = null;
  let uploadOpen = false;
  const subjects = [{ name: 'Toán học', level: 'THPT', active: true }, { name: 'Tiếng Anh', level: 'THPT', active: true }];
  const topics = [
    { name: 'Phương trình bậc hai', subject: 'Toán học', chapter: 'Chương 1', active: true },
    { name: 'Hàm số bậc hai', subject: 'Toán học', chapter: 'Chương 1', active: true },
    { name: 'Cơ học', subject: 'Vật lý', chapter: 'Chương 2', active: true }
  ];
  const documents = [
    { name: 'Chuyên đề hàm số.pdf', size: '2,4 MB', date: '08/11/2026', topic: 'Hàm số bậc hai', status: 'ready', active: true },
    { name: 'Bài tập parabol.txt', size: '86 KB', date: '10/11/2026', topic: 'Hàm số bậc hai', status: 'pending', active: false },
    { name: 'Công thức tổng hợp.pdf', size: '18,7 MB', date: '10/11/2026', topic: 'Đạo hàm', status: 'error', active: false, error: 'Không thể trích xuất văn bản.' },
    { name: 'Định luật Newton.pdf', size: '1,8 MB', date: '02/11/2026', topic: 'Cơ học', status: 'ready', active: false }
  ];
  const tabs = el('nav', { className: 'tabs', 'aria-label': 'Nhóm quản trị' });

  function draw() {
    tabs.replaceChildren(...[['subjects', 'Môn học'], ['topics', 'Chủ đề'], ['documents', 'Tài liệu nguồn']].map(([id, label]) => {
      const tab = button(label, () => { active = id; uploadOpen = false; draw(); }, `tab ${active === id ? 'active' : ''}`);
      if (id === active) tab.setAttribute('aria-current', 'page');
      return tab;
    }));
    if (active === 'documents') return uploadOpen ? drawUpload() : drawDocuments();
    drawCatalog();
  }

  function drawCatalog() {
    const collection = active === 'subjects' ? subjects : topics;
    if (editing && !collection.includes(editing)) editing = null;
    const name = el('input', { className: 'input', value: editing?.name || '', maxlength: 180, placeholder: active === 'subjects' ? 'Ví dụ: Toán học' : 'Ví dụ: Phương trình bậc hai' });
    const detail = el('input', { className: 'input', value: editing?.level || editing?.chapter || '', maxlength: 150, placeholder: active === 'subjects' ? 'THPT' : 'Toán học · Chương 1' });
    const form = el('form', { className: 'form-grid' }, field(active === 'subjects' ? 'Tên môn học' : 'Tên chủ đề', name), field(active === 'subjects' ? 'Cấp học' : 'Môn và chương', detail), el('button', { type: 'submit', className: 'button primary' }, editing ? 'Lưu thay đổi' : 'Thêm nội dung'));
    if (editing) form.append(button('Huỷ chỉnh sửa', () => { editing = null; draw(); }, 'ghost'));
    setupValidation(form, [name, detail]);
    form.addEventListener('submit', event => {
      event.preventDefault();
      const duplicate = collection.some(item => item !== editing && item.name.toLowerCase() === name.value.trim().toLowerCase());
      if (!validateFields([[name, !name.value.trim() ? 'Vui lòng nhập tên nội dung.' : duplicate ? 'Tên này đã được sử dụng trong danh sách. Vui lòng chọn tên khác.' : ''], [detail, detail.value.trim() ? '' : 'Vui lòng nhập thông tin phân loại.']])) return;
      if (editing) Object.assign(editing, active === 'subjects' ? { name: name.value.trim(), level: detail.value.trim() } : { name: name.value.trim(), chapter: detail.value.trim() });
      else collection.push(active === 'subjects' ? { name: name.value.trim(), level: detail.value.trim(), active: true } : { name: name.value.trim(), subject: 'Toán học', chapter: detail.value.trim(), active: true });
      editing = null;
      draw();
    });
    content.replaceChildren(el('div', { className: 'grid-2' }, panel('Danh sách', el('div', { className: 'topic-list' }, ...collection.map(item => el('div', { className: 'topic-row' }, el('div', {}, el('h3', {}, item.name), el('p', {}, item.level || `${item.subject} · ${item.chapter}`), badge(item.active ? 'Đang bật' : 'Đã tắt', item.active ? 'success' : 'neutral')), el('div', { className: 'page-actions' }, button('Sửa', () => { editing = item; draw(); content.querySelector('input')?.focus(); }, 'secondary small'), button(item.active ? 'Vô hiệu hoá' : 'Kích hoạt', () => { item.active = !item.active; draw(); }, 'ghost small')))))), panel(editing ? 'Chỉnh sửa nội dung' : 'Thêm nội dung', form)));
  }

  function drawDocuments() {
    const search = el('input', { className: 'input', type: 'search', placeholder: 'Tìm tài liệu...', 'aria-label': 'Tìm tài liệu' });
    const statusFilter = el('select', { className: 'select', 'aria-label': 'Lọc theo trạng thái' }, el('option', { value: 'all' }, 'Tất cả trạng thái'), ...Object.entries(statusMeta).map(([value, meta]) => el('option', { value }, meta[0])));
    const topicFilter = el('select', { className: 'select', 'aria-label': 'Lọc theo chủ đề' }, el('option', { value: 'all' }, 'Tất cả chủ đề'), ...[...new Set(documents.map(item => item.topic))].map(topic => el('option', { value: topic }, topic)));
    const results = el('div', { className: 'document-results', 'aria-live': 'polite' });
    const summary = el('p', { className: 'document-summary' });

    const makeRow = document => {
      const [label, kind] = statusMeta[document.status];
      const toggle = el('button', { type: 'button', className: `source-switch ${document.active ? 'active' : ''}`, role: 'switch', 'aria-checked': String(document.active), 'aria-label': `${document.active ? 'Tắt' : 'Bật'} nguồn ${document.name}`, disabled: document.status !== 'ready' }, el('span', { 'aria-hidden': 'true' }));
      toggle.addEventListener('click', () => { document.active = !document.active; renderList(); toast(document.active ? 'Đã bật tài liệu cho các cuộc trò chuyện mới.' : 'Đã tắt tài liệu khỏi các cuộc trò chuyện mới.'); });
      const action = document.status === 'error' ? button('Thử lại', () => { document.status = 'pending'; document.error = ''; renderList(); toast('Đã đưa tài liệu về hàng chờ xử lý.'); }, 'document-action') : document.status === 'pending' ? el('span', { className: 'document-waiting' }, 'Chờ xử lý') : button('Chi tiết', () => toast(`${document.name} đã sẵn sàng để sử dụng.`), 'document-action');
      return el('article', { className: 'document-row' },
        el('div', { className: `document-icon ${kind}`, 'aria-hidden': 'true' }, document.status === 'error' ? '!' : '▤'),
        el('div', { className: 'document-name' }, el('h3', {}, document.name), el('p', {}, `${document.size} · ${document.date}`), document.error ? el('p', { className: 'document-error' }, document.error) : null),
        el('div', { className: 'document-topic', 'data-label': 'Chủ đề' }, document.topic),
        el('div', { className: 'document-status', 'data-label': 'Xử lý' }, badge(label, kind)),
        el('div', { className: 'document-usage', 'data-label': 'Sử dụng' }, toggle),
        el('div', { className: 'document-actions', 'data-label': 'Thao tác' }, action)
      );
    };
    function renderList() {
      const query = search.value.trim().toLocaleLowerCase('vi');
      const filtered = documents.filter(item => (!query || item.name.toLocaleLowerCase('vi').includes(query)) && (statusFilter.value === 'all' || item.status === statusFilter.value) && (topicFilter.value === 'all' || item.topic === topicFilter.value));
      results.replaceChildren(filtered.length ? el('div', { className: 'document-list' }, ...filtered.map(makeRow)) : el('div', { className: 'empty-state' }, el('h3', {}, 'Không tìm thấy tài liệu'), el('p', {}, 'Thử đổi từ khoá hoặc bộ lọc để xem kết quả khác.')));
      summary.textContent = `${documents.length} tài liệu · ${documents.filter(item => item.active).length} đang bật · ${documents.filter(item => item.status === 'error').length} lỗi cần xử lý`;
    }
    [search, statusFilter, topicFilter].forEach(control => control.addEventListener(control === search ? 'input' : 'change', renderList));
    content.replaceChildren(el('div', { className: 'admin-documents' },
      el('div', { className: 'documents-heading' }, el('div', {}, el('h2', {}, 'Tài liệu nguồn'), el('p', {}, 'Kiểm soát nguồn kiến thức được dùng trong câu trả lời AI.')), button('↑  Tải tài liệu', () => { uploadOpen = true; draw(); }, 'primary upload-document-button')),
      el('aside', { className: 'document-rule' }, el('span', {}, 'Quy tắc phát hành nguồn'), el('strong', {}, 'Chỉ tài liệu đã xử lý xong và được bật mới được Gia sư AI sử dụng.'), el('p', {}, 'Tắt nguồn sẽ không ảnh hưởng lịch sử hội thoại đã lưu.')),
      el('section', { className: 'panel documents-panel', 'aria-labelledby': 'document-list-title' }, el('div', { className: 'documents-toolbar' }, el('h2', { id: 'document-list-title' }, 'Danh sách tài liệu'), el('div', { className: 'document-filters' }, search, statusFilter, topicFilter)), el('div', { className: 'document-table-head', 'aria-hidden': 'true' }, ...['Tài liệu', 'Chủ đề', 'Xử lý', 'Sử dụng', 'Thao tác'].map(label => el('span', {}, label))), results, summary)
    ));
    renderList();
  }

  function drawUpload() {
    let selectedFile = null;
    const subject = el('select', { className: 'select', required: true }, el('option', { value: '' }, 'Chọn môn học'), ...subjects.filter(item => item.active).map(item => el('option', { value: item.name }, `${item.name} · ${item.level}`)));
    const topic = el('select', { className: 'select', required: true, disabled: true }, el('option', { value: '' }, 'Chọn môn học trước'));
    const title = el('input', { className: 'input', maxlength: 200, placeholder: 'Ví dụ: Chuyên đề hàm số bậc hai', required: true });
    const file = el('input', { type: 'file', accept: '.pdf,.txt,application/pdf,text/plain', className: 'sr-only', id: 'document-file', 'aria-describedby': 'file-rules file-feedback' });
    const feedback = el('div', { id: 'file-feedback', className: 'upload-feedback', role: 'status' });
    const dropTitle = el('strong', {}, 'Kéo thả tệp hoặc chọn từ máy');
    const dropMeta = el('span', {}, 'PDF/TXT · tối đa 10 MB');
    const dropZone = el('div', { className: 'upload-dropzone' }, el('span', { className: 'upload-icon', 'aria-hidden': 'true' }, '↑'), dropTitle, dropMeta, el('label', { className: 'button ghost small', for: file.id }, 'Chọn tệp'), file);
    subject.addEventListener('change', () => {
      const matches = topics.filter(item => item.subject === subject.value && item.active);
      topic.replaceChildren(el('option', { value: '' }, matches.length ? 'Chọn chủ đề' : 'Chưa có chủ đề phù hợp'), ...matches.map(item => el('option', { value: item.name }, item.name)));
      topic.disabled = !matches.length;
    });
    const validateFile = candidate => {
      selectedFile = null;
      dropZone.classList.remove('has-file', 'has-error');
      feedback.replaceChildren();
      if (!candidate) return false;
      if (!/\.(pdf|txt)$/i.test(candidate.name) || (candidate.type && !ALLOWED_TYPES.includes(candidate.type))) {
        dropZone.classList.add('has-error'); feedback.replaceChildren(notice('Định dạng không hợp lệ. Hãy chọn tệp PDF hoặc TXT.', 'error')); file.value = ''; return false;
      }
      if (candidate.size > MAX_FILE_SIZE) {
        dropZone.classList.add('has-error'); feedback.replaceChildren(notice(`Tệp “${candidate.name}” vượt quá giới hạn 10 MB.`, 'error')); file.value = ''; return false;
      }
      selectedFile = candidate;
      dropZone.classList.add('has-file'); dropTitle.textContent = candidate.name; dropMeta.textContent = `${formatSize(candidate.size)} · Sẵn sàng tải lên`;
      if (!title.value.trim()) title.value = candidate.name.replace(/\.(pdf|txt)$/i, '');
      feedback.replaceChildren(notice('Tệp hợp lệ. Nội dung sẽ được xử lý sau khi tải lên.', 'success'));
      return true;
    };
    file.addEventListener('change', () => validateFile(file.files[0]));
    ['dragenter', 'dragover'].forEach(type => dropZone.addEventListener(type, event => { event.preventDefault(); dropZone.classList.add('is-dragging'); }));
    ['dragleave', 'drop'].forEach(type => dropZone.addEventListener(type, event => { event.preventDefault(); dropZone.classList.remove('is-dragging'); }));
    dropZone.addEventListener('drop', event => { const candidate = event.dataTransfer.files[0]; if (validateFile(candidate)) { const transfer = new DataTransfer(); transfer.items.add(candidate); file.files = transfer.files; } });
    const form = el('form', { className: 'upload-form', novalidate: true }, el('h2', {}, 'Thông tin tài liệu'), el('div', { className: 'upload-fields' }, field('Môn học', subject), field('Chủ đề', topic)), field('Tiêu đề tài liệu', title), el('div', { className: 'field' }, el('span', { className: 'field-label' }, 'Tệp tài liệu'), dropZone, feedback), el('aside', { id: 'file-rules', className: 'upload-warning' }, el('span', { 'aria-hidden': 'true' }, '△'), el('div', {}, el('strong', {}, 'PDF phải có lớp văn bản có thể sao chép.'), el('p', {}, 'Tài liệu được tải lên ở trạng thái tắt cho đến khi xử lý xong.'))), el('div', { className: 'upload-actions' }, button('Hủy', () => { uploadOpen = false; draw(); }, 'ghost'), el('button', { type: 'submit', className: 'button primary' }, 'Tải lên')));
    setupValidation(form, [subject, topic, title, file]);
    form.addEventListener('submit', event => {
      event.preventDefault();
      const valid = validateFields([[subject, subject.value ? '' : 'Vui lòng chọn môn học.'], [topic, topic.value ? '' : 'Vui lòng chọn chủ đề.'], [title, title.value.trim() ? '' : 'Vui lòng nhập tiêu đề tài liệu.'], [file, selectedFile ? '' : 'Vui lòng chọn tệp PDF hoặc TXT hợp lệ.']]);
      if (!valid || !selectedFile) return;
      const extension = selectedFile.name.match(/\.(pdf|txt)$/i)?.[0] || '';
      const cleanTitle = title.value.trim().replace(/\.(pdf|txt)$/i, '');
      documents.unshift({ name: `${cleanTitle}${extension}`, size: formatSize(selectedFile.size), date: new Intl.DateTimeFormat('vi-VN').format(new Date()), topic: topic.value, status: 'pending', active: false });
      uploadOpen = false; draw(); toast('Đã thêm tài liệu vào bản xem trước với trạng thái đang xử lý.');
    });
    content.replaceChildren(el('div', { className: 'admin-upload-view' }, el('div', { className: 'upload-page-heading' }, button('←  Tài liệu nguồn', () => { uploadOpen = false; draw(); }, 'upload-back'), el('h2', {}, 'Thêm tài liệu nguồn'), el('p', {}, 'PDF có văn bản hoặc TXT, gắn với đúng chủ đề.')), panel('', form), el('p', { className: 'upload-process-note' }, 'Sau khi tải lên: pending → ready hoặc error. Chỉ tài liệu ready mới được bật.')));
  }

  root.append(tabs, content);
  draw();
  return root;
}
