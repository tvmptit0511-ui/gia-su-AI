# Gia Sư AI frontend

Giao diện HTML/CSS/JavaScript thuần, dùng ES modules. Không gọi API, không xác thực thật và không gửi dữ liệu nhập lên máy chủ. Nội dung học, tiến độ và tài liệu hiển thị là minh hoạ. Thay đổi trong bản xem trước chỉ tồn tại trong bộ nhớ của trang.

## Chạy

```powershell
node serve.cjs
```

Mở http://127.0.0.1:4173. Hoặc dùng Live Server của VS Code. Không mở index.html bằng file:// vì ES modules cần HTTP.

## Cấu trúc

```text
Project/
├── docs/           # Tài liệu yêu cầu, thiết kế CSDL, hướng dẫn UI, ảnh tham chiếu
├── src/
│   ├── css/        # Styles và responsive
│   └── js/         # JavaScript, components và các trang
├── tests/          # Kiểm thử trình duyệt
├── outputs/        # Ảnh chụp kết quả kiểm thử
├── index.html      # Điểm vào ứng dụng
├── serve.cjs       # Server phát triển
├── AGENTS.md       # Hướng dẫn làm việc với dự án
└── README.md       # Hướng dẫn chạy và cấu trúc
```

Tài liệu mới và ảnh tham chiếu đặt trong `docs/`; mã nguồn đặt trong `src/`; kết quả kiểm thử đặt trong `outputs/`.

- `index.html`: shell, header, điều hướng, dialog và vùng thông báo.
- `src/css/styles.css`: token màu, thành phần, desktop/tablet/mobile.
- `src/js/app.js`: hash router và điều hướng mobile.
- `src/js/components/ui.js`: hàm DOM an toàn, button, panel, form field, dialog, toast.
- `src/js/data.js`: nội dung mẫu cố định.
- `src/js/pages/learning.js`: danh mục, tìm chủ đề, dashboard.
- `src/js/pages/account.js`: đăng nhập, đăng ký, hồ sơ.
- `src/js/pages/chat.js`: bố cục hội thoại, gợi ý, xác nhận lời giải, phản hồi.
- `src/js/pages/practice.js`: bài mẫu 5 câu, nộp và kết quả minh hoạ.
- `src/js/pages/admin.js`: quản trị danh mục/tài liệu trong bộ nhớ.
- `serve.cjs`: server tĩnh dùng Node built-in, không cài package.

## Phạm vi

Các trang: #home, #login, #register, #chat, #practice, #results, #dashboard, #profile, #admin. Responsive tại 768px và 1100px. Khi tích hợp backend sau này cần hợp đồng API và kiểm tra quyền ở máy chủ; router hiện tại không phải hàng rào xác thực. Biểu mẫu tài khoản chỉ kiểm tra dữ liệu tại trình duyệt; không lưu mật khẩu. Chọn tệp chỉ xem tên, không upload và không phân tích nội dung.

Thiết kế tham chiếu: https://www.figma.com/design/pYRVP7wXAOXI3ZYwIUEBO1. Lần triển khai không đọc được trạng thái Figma mới do hạn mức MCP; dựa trên các khung đã tạo và bảng màu ảnh trong thư mục.

## Kiểm tra

### Form đăng nhập — TK-005

`src/js/pages/login.js` triển khai form email/mật khẩu, lỗi tiếng Việt, hỗ trợ trình quản lý mật khẩu, hiện/ẩn mật khẩu, cảnh báo Caps Lock và điều hướng đăng ký. Giao diện dùng lại token hiện có và hỗ trợ màn hình từ 360px.

Đối chiếu SRS FR-01.2, backlog SF-01.1.3 và bảng phân công TK-005. **Phạm vi được yêu cầu: chỉ tạo giao diện, không gắn API.** Phần xác thực đầy đủ của TK-005/TK-006 nằm ngoài lần triển khai này. Khi dữ liệu hợp lệ, form thông báo dịch vụ chưa khả dụng; không tạo phiên giả, không lưu mật khẩu, không chuyển trang như thể đã đăng nhập. Cần bổ sung endpoint/method, schema request/response, mã lỗi và cơ chế cookie/token trước khi tích hợp lưu trạng thái, xử lý lỗi đăng nhập, trạng thái đang gửi và chuyển `#home` sau thành công. Không có Google login hoặc quên mật khẩu theo phạm vi Won’t của backlog.

`node tests/login.cjs` kiểm tra riêng form đăng nhập bằng Playwright; `node serve.cjs` cần đang chạy ở cổng 4173.

`node tests/browser.cjs` chạy Playwright từ runtime Codex và Microsoft Edge cài sẵn (đường dẫn trong test phụ thuộc máy hiện tại). Kiểm tra 9 route ở 390/768/1024/1440px, tìm kiếm, dialog, dữ liệu nhập an toàn, nộp quiz, biểu mẫu đăng ký, trạng thái tài liệu; lưu ảnh trong `outputs/`.

Đã thử workflow subagent cho kiến trúc, UI, JavaScript và review nhưng tất cả agent bị lỗi stream kết nối trước khi trả kết quả. Mã được triển khai và kiểm tra bởi main agent; chưa có review độc lập thành công.



