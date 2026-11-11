# Gia Sư AI frontend

<<<<<<< HEAD
HTML/CSS/JavaScript thuần, dùng ES modules. Luồng đăng ký, đăng nhập và trang chủ đã nối FastAPI. Bố cục và các thành phần giao diện hiện có được giữ lại.

## Chạy

Khởi động backend từ `back-end/`:

```powershell
.\venv\Scripts\python.exe -m uvicorn app.main:app --reload --port 8000
```

Trong terminal khác, từ `front-end/`:

```powershell
node serve.cjs
```

Mở http://127.0.0.1:4173. Không cần cài package npm để chạy server frontend; server dùng thư viện có sẵn của Node.js.

`serve.cjs` chuyển request `/api/*` tới `http://127.0.0.1:8000`, bao gồm JSON body, Bearer token, HTTP status và thông báo lỗi. Nếu backend chạy ở địa chỉ khác, đặt `BACKEND_URL` trước khi chạy server:

```powershell
$env:BACKEND_URL = 'http://127.0.0.1:8001'
node serve.cjs
```

Nếu dùng Live Server thay cho `serve.cjs`, đặt meta `api-base` trong `index.html` thành URL API tuyệt đối và bổ sung origin của Live Server vào `CORS_ORIGIN` ở backend. Cách chạy mặc định dùng proxy phía trên.

## Luồng đã kết nối

- Đăng ký gọi `POST /api/auth/register`; lỗi trường từ server hiện cạnh ô nhập. Thành công chuyển đến đăng nhập và điền email vừa đăng ký.
- Đăng nhập gọi `POST /api/auth/login`; thành công lưu token vào `sessionStorage` và mở trang chủ.
- Trang chủ yêu cầu đăng nhập. Khi tải lại trang, frontend gọi `GET /api/auth/me` trước khi hiển thị các trang cần tài khoản.
- Menu hiển thị tên người dùng, hồ sơ và đăng xuất. LEARNER không có mục quản trị; trang quản trị còn kiểm tra `/api/admin/access` ở backend.
- Hồ sơ hiển thị tên, email, vai trò và ngày tạo từ tài khoản thật; hiện chỉ xem thông tin.
- Đăng xuất hoặc token hết hạn xóa phiên phía trình duyệt. Sai thông tin đăng nhập không tạo phiên. Không lưu mật khẩu vào storage.
- Lỗi mạng, backend ngừng chạy và lỗi server có thông báo; form chống gửi nhiều lần khi đang xử lý.

API kiểm tra MySQL: http://127.0.0.1:8000/api/database. Swagger: http://127.0.0.1:8000/docs.

Các trang học, chat, luyện tập và quản trị nội dung hiện vẫn có dữ liệu mẫu; phần này chưa có các API nghiệp vụ để lưu nội dung hoặc gọi AI. Phân quyền phía frontend phục vụ điều hướng; backend xác thực token và quyền trước khi cho phép API bảo vệ.

## Cấu trúc

```text
front-end/
├── index.html
├── serve.cjs                # Server tĩnh và proxy API
├── src/
│   ├── css/styles.css
│   └── js/
│       ├── app.js           # Router, khôi phục phiên và phân quyền điều hướng
│       ├── api.js           # fetch wrapper, JSON, token và lỗi API
│       ├── session.js       # Token, thông tin người dùng và hết hạn
│       ├── components/
│       └── pages/
├── tests/                   # Browser tests và backend fixture trong bộ nhớ
├── package.json             # Lệnh chạy và Playwright dành cho kiểm thử
└── package-lock.json
```

## Kiểm thử trình duyệt

Cần cài `back-end/requirements-dev.txt` vào virtualenv và cài dependency frontend:

```powershell
npm install
npm test
npm run test:login
```

Test tự mở backend FastAPI riêng với repository trong bộ nhớ, server frontend ở cổng tạm và Edge headless trên Windows. Test không dùng `.env` hoặc ghi database thật, không tạo ảnh trong `outputs/`, và đóng các tiến trình sau khi chạy.

Có thể đặt `PYTHON` để chọn Python, `PLAYWRIGHT_CHANNEL` để chọn trình duyệt hoặc `PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH` để chỉ định executable. Trên máy chưa có browser tương thích có thể chạy `npx playwright install chromium`.

Các kịch bản gồm: lỗi form, đăng ký API, email trùng, sai mật khẩu, đăng nhập thành công, token/khôi phục phiên/đăng xuất, LEARNER bị chặn, ADMIN được truy cập, responsive và mất kết nối backend.
=======
HTML/CSS/JavaScript thuần dùng ES modules. Mã giao diện thống nhất trong thư mục này.

## Chạy

Từ front-end/: chạy node serve.cjs rồi mở http://127.0.0.1:4173. Có thể đặt biến môi trường PORT để đổi cổng. Không mở index.html bằng file://.

## Tài khoản và phân quyền

- src/js/session.js quản lý trạng thái checking, anonymous, authenticated và error.
- Menu lấy trạng thái phiên chung: khách thấy Đăng nhập/Đăng ký; LEARNER thấy Hồ sơ/Lịch sử/Đăng xuất; ADMIN có thêm Quản trị nội dung.
- Các route chat, practice, results, dashboard, profile, history cần phiên được xác minh; admin cần role ADMIN. Role không nhận diện được bị từ chối.
- Hồ sơ hiển thị tên/email/role từ máy chủ; không hard-code sinh viên hoặc quyền quản trị.
- Mỗi lần tải lại, đổi hash hoặc quay lại tab, token được kiểm tra qua GET /api/auth/me trước khi render nội dung cá nhân. Lỗi mạng giữ token để thử lại, nhưng không mở nội dung cá nhân. HTTP 401/403 xóa phiên phía trình duyệt.
- POST /api/auth/login gửi JSON email/password theo hợp đồng ở origin/feature/auth-and-database (routes/auth.py, schemas/auth.py). Frontend chỉ cấp quyền sau khi GET /api/auth/me xác minh lại người dùng; không tin role trong payload login hoặc localStorage.
- Base URL cấu hình trong meta api-base ở index.html, mặc định http://localhost:8000. Backend phải cho phép CORS đúng origin frontend.
- Token Bearer lưu trong sessionStorage của tab, không lưu mật khẩu. Khi storage bị chặn, phiên chỉ tồn tại trong bộ nhớ. Dữ liệu người dùng không được lưu riêng ở localStorage.
- Đăng xuất xóa token, trạng thái người dùng, kết quả luyện tập trong bộ nhớ và nội dung dialog rồi về #login. Đây là đăng xuất trên tab hiện tại; không thu hồi token trên máy chủ hoặc đăng xuất thiết bị/tab khác. Backend hiện chưa có hợp đồng thu hồi token/logout.

**Giới hạn backend hiện tại:** Nhánh tích hợp này có đăng ký và /me nhưng chưa có /login. Cần tích hợp backend đăng nhập đã có trên nhánh feature/auth-and-database để đăng nhập thật; lỗi 404 hiển thị thông báo cụ thể, không tạo phiên giả. Đăng ký vẫn chỉ kiểm tra form tại trình duyệt. Các trang học tập và quản trị dùng nội dung minh họa trong bộ nhớ, chưa gọi API dữ liệu. Bảo vệ router chỉ phục vụ điều hướng; API quản trị tương lai phải dùng dependency require_roles ở backend.

## Cấu trúc

- index.html: shell, điều hướng, menu, dialog và vùng thông báo.
- src/js/app.js: router, menu theo phiên, chặn truy cập và điều hướng.
- src/js/session.js: kết nối API xác thực và quản lý phiên.
- src/js/pages/auth-screen.js, auth-templates.js: form tài khoản, validation và trạng thái đang gửi/lỗi.
- src/css/auth.css: CSS tài khoản giới hạn trong .account-screen.
- src/js/pages/: học tập, hội thoại, luyện tập, hồ sơ, lịch sử và quản trị tài liệu.
- login.html/register.html: chuyển hướng tương thích về #login/#register.

## Kiểm thử

Khởi động server rồi chạy từ front-end/:

    node tests/browser.cjs
    node tests/login.cjs
    node tests/auth.cjs
    node tests/session.cjs

Đặt BASE_URL nếu server dùng cổng khác, ví dụ http://127.0.0.1:4183. Test hiện dùng đường dẫn Playwright runtime và Edge theo máy phát triển. Các phản hồi đăng nhập, /me và role trong test được giả lập bằng Playwright route; fixture chỉ tồn tại trong tests/, không được import bởi ứng dụng. Kết quả này không chứng minh backend đăng nhập đã được tích hợp hoặc token đã bị thu hồi trên máy chủ.

Bộ session kiểm tra khách, LEARNER/ADMIN, role thiếu/sai, role login không đáng tin, URL quản trị trực tiếp, bàn phím/mobile, logout/Back/reload/relogin, backend thiếu endpoint, sai mật khẩu, phiên hết hạn, lỗi mạng/thử lại và yêu cầu đăng nhập hoàn tất sau khi đã chuyển trang. Ảnh kiểm tra tài khoản lưu trong tests/test-output/ (Git bỏ qua).

## Đăng nhập thử giao diện trên localhost

Tại #login, dùng “Vào thử tài khoản sinh viên” hoặc “Vào thử tài khoản quản trị”, không cần nhập email/mật khẩu. Chế độ xem thử chỉ hiện trên localhost/127.0.0.1, có banner nhận diện và dùng dữ liệu minh họa; không tạo token/API session. Vai trò xem thử lưu riêng trong sessionStorage để giữ khi reload. Đăng xuất xóa chế độ này. Không dùng cơ chế này làm phân quyền backend; triển khai qua hostname khác sẽ không bật xem thử.

## Khu vực ADMIN

Theo SRS FR-05/FR-08, ADMIN quản lý môn học, chủ đề và tài liệu nguồn. Điều hướng ADMIN gồm ba mục riêng trong sidebar tối trên desktop và menu thu gọn trên mobile, menu tài khoản chỉ có Hồ sơ quản trị và Đăng xuất. URL chuẩn là #admin?tab=subjects, #admin?tab=topics, #admin?tab=documents. Tab không hợp lệ trở về subjects. Back/Forward/reload đồng bộ mục đang chọn. Các URL học tập được đưa về quản trị khi role ADMIN; LEARNER vẫn bị chặn trước khi render admin.

Hồ sơ quản trị chỉ hiển thị tên/email/role từ session, chưa hỗ trợ lưu hồ sơ lên API. Danh mục minh họa giữ trong bộ nhớ qua các lần chuyển tab, reset khi reload, đăng xuất hoặc thay đổi người dùng/role. Đổi tên môn/chủ đề cập nhật tham chiếu liên quan; tạo chủ đề dùng danh sách môn thực tế. Upload chỉ kiểm tra tệp và thêm bản ghi chờ minh họa; retry/bật tắt không gọi backend. Backend hiện chưa có API quản trị nên kết quả test chỉ xác minh UI và bảo vệ route, không khẳng định API trả 403.

Kiểm tra thêm: node tests/admin.cjs và node tests/preview.cjs. Test admin bao phủ điều hướng/hồ sơ theo role, ba tab ở 360/390/768/1440px, URL/Back/Forward/reload, thêm/sửa/bật tắt, liên kết môn/chủ đề, lọc và upload/retry tài liệu minh họa, logout/Back. Ảnh kiểm tra ở tests/test-output/admin-*.png (Git bỏ qua).

### Thiết kế ADMIN từ Figma

Tham chiếu: https://www.figma.com/design/7XFlHxljV34po4s9ERuwVS?node-id=2-2. Figma MCP hết hạn mức Starter khi triển khai; đã đối chiếu board trực tiếp qua trình duyệt, chưa trích xuất được token/asset để cam kết khớp từng pixel. Giữ màu chàm và font hệ thống của dự án. `src/css/admin-shell.css` chỉ áp dụng theo role ADMIN; `src/css/admin.css` áp dụng cho nội dung quản trị. Desktop dùng sidebar tối, mobile dùng drawer có Escape, trả focus, chặn thao tác nền khi mở. Môn học có danh sách, tìm kiếm, số chủ đề thực tế; chủ đề được nhóm theo môn/chương. Form thêm mở qua CTA, form sửa dùng lại validation. Không thêm dashboard tổng quan hoặc thống kê giả.
>>>>>>> origin/main
