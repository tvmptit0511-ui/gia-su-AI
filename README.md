# Gia Sư AI

Repository chung cho backend và frontend.

- `back-end/`: API FastAPI, xem `back-end/README.md`.
- `front-end/`: toàn bộ giao diện HTML/CSS/JavaScript, xem `front-end/README.md`.
- `database/`: tài liệu cơ sở dữ liệu.
- `docs/`: tài liệu dự án.

## Chạy frontend

```powershell
cd front-end
node serve.cjs
```

Mở http://127.0.0.1:4173. Frontend đã có quản lý phiên, menu theo role và chặn route. Backend hiện tại chưa có API đăng nhập; cần tích hợp nhánh feature/auth-and-database để đăng nhập thật. Đăng xuất hiện chỉ xóa token Bearer trên tab, chưa thu hồi token ở máy chủ. Xem front-end/README.md để biết hợp đồng và giới hạn.
