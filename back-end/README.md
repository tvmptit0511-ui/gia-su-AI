# Gia Sư AI — Back-end

API Python 3.10+ dùng FastAPI. Hiện có đăng ký tài khoản và xác thực token JWT.

## Chạy

Trong Git Bash (Windows), từ thư mục `back-end/`:

```bash
python -m venv .venv
source .venv/Scripts/activate          # macOS/Linux: source .venv/bin/activate
pip install -r requirements-dev.txt    # chỉ chạy API: pip install -r requirements.txt

uvicorn app.main:app --reload --port 8000   # http://localhost:8000
pytest                                      # chạy toàn bộ test
```

Tài liệu API tự sinh (thử gọi trực tiếp được): http://localhost:8000/docs

| Biến môi trường | Mặc định | Ý nghĩa |
| --- | --- | --- |
| `CORS_ORIGIN` | `http://127.0.0.1:4173,http://localhost:4173` | Các origin front-end được phép, cách nhau bằng dấu phẩy |
| `JWT_SECRET` | khóa ngẫu nhiên mỗi lần khởi động | Khóa ký token, tối thiểu 32 ký tự. **Bắt buộc đặt khi chạy thật** |
| `ACCESS_TOKEN_MINUTES` | `30` | Thời hạn access token, tính bằng phút |

Tạo khóa bí mật: `python -c "import secrets; print(secrets.token_urlsafe(48))"`, rồi đặt trước khi chạy, ví dụ `export JWT_SECRET=...` trong Git Bash. Không đặt `JWT_SECRET` thì server vẫn chạy (kèm cảnh báo) nhưng token mất hiệu lực mỗi lần khởi động lại và không dùng được khi chạy nhiều worker. Không commit khóa lên GitHub.

## Cấu trúc

```text
back-end/
├── app/
│   ├── main.py                     # create_app(): nối các tầng, middleware, CORS
│   ├── config.py                   # Đọc biến môi trường
│   ├── error_handlers.py           # Định dạng lỗi thống nhất
│   ├── routes/auth.py              # POST /api/auth/register
│   ├── routes/me.py                # GET /api/auth/me
│   ├── services/auth_service.py    # Luồng đăng ký
│   ├── services/token_service.py   # Tạo và kiểm tra token JWT
│   ├── dependencies/auth.py        # get_current_user, require_roles
│   ├── repositories/user_repository.py   # Kho người dùng (đang lưu trong bộ nhớ)
│   ├── validators/register_validator.py  # Kiểm tra dữ liệu đăng ký
│   ├── schemas/auth.py             # Schema phản hồi và mô tả /docs
│   ├── middlewares/                # Giới hạn body, header bảo mật
│   └── utils/                      # password (băm scrypt), errors
├── tests/
├── requirements.txt                # Thư viện chạy API
├── requirements-dev.txt            # Thêm pytest, httpx để test
└── pytest.ini
```

## API

### `GET /api/health`

`200 {"status": "ok"}`

### `POST /api/auth/register`

Header: `Content-Type: application/json`

Body:

```json
{
  "name": "Nguyễn Văn An",
  "email": "an@example.com",
  "password": "MatKhau@123",
  "confirmPassword": "MatKhau@123",
  "consent": true
}
```

| Trường | Quy tắc |
| --- | --- |
| `name` | Bắt buộc, tối đa 120 ký tự. Tự bỏ khoảng trắng thừa. |
| `email` | Bắt buộc, đúng định dạng, tối đa 255 ký tự. Tự chuyển về chữ thường. |
| `password` | Bắt buộc, 8 đến 128 ký tự. Không bị cắt khoảng trắng. |
| `confirmPassword` | Bắt buộc, phải giống `password`. |
| `consent` | Phải là boolean `true` (đồng ý quy định sử dụng từ đủ 18 tuổi). |

Các trường khác trong body (ví dụ `role`) bị bỏ qua. Tài khoản mới luôn có vai trò `LEARNER`.

**Thành công — `201`**

```json
{
  "message": "Đăng ký tài khoản thành công.",
  "user": {
    "id": "e2969c0c-c7c6-4c28-925e-0bf1c8048e56",
    "name": "Nguyễn Văn An",
    "email": "an@example.com",
    "role": "LEARNER",
    "createdAt": "2026-11-10T06:26:40.579Z"
  }
}
```

Đăng ký chưa tạo phiên đăng nhập và không trả token; việc đó thuộc API đăng nhập (TK-006).

**Lỗi** luôn có dạng `{"error": {"code", "message", "fields"?}}`. `fields` là map tên trường → thông báo để hiện cạnh ô nhập tương ứng ở front-end.

| Mã HTTP | `code` | Khi nào |
| --- | --- | --- |
| 400 | `INVALID_JSON` | Body không phải JSON hợp lệ |
| 405 | `METHOD_NOT_ALLOWED` | Sai phương thức HTTP |
| 413 | `PAYLOAD_TOO_LARGE` | Body lớn hơn 10 KB |
| 415 | `UNSUPPORTED_MEDIA_TYPE` | Không gửi `Content-Type: application/json` |
| 422 | `VALIDATION_ERROR` | Dữ liệu sai, `fields` liệt kê từng trường lỗi |
| 409 | `EMAIL_ALREADY_EXISTS` | Email đã đăng ký, `fields.email` có thông báo |
| 500 | `INTERNAL_ERROR` | Lỗi phía máy chủ, không lộ chi tiết |

Thông báo lỗi do `app/validators/register_validator.py` tạo ra (không dùng thông báo mặc định tiếng Anh của Pydantic) và khớp với nội dung form đăng ký ở front-end.

### `GET /api/auth/me`

Trả về người dùng đang đăng nhập. Dùng để kiểm tra token còn hiệu lực, ví dụ khi mở lại trang.

Header: `Authorization: Bearer <access_token>`

**Thành công — `200`**

```json
{
  "user": {
    "id": "e2969c0c-c7c6-4c28-925e-0bf1c8048e56",
    "name": "Nguyễn Văn An",
    "email": "an@example.com",
    "role": "LEARNER",
    "createdAt": "2026-11-10T06:26:40.579Z"
  }
}
```

**Lỗi xác thực** (mọi API cần đăng nhập đều trả cùng các mã này):

| Mã HTTP | `code` | Khi nào | Front-end nên |
| --- | --- | --- | --- |
| 401 | `NOT_AUTHENTICATED` | Không gửi token hoặc sai dạng `Bearer <token>` | Chuyển tới trang đăng nhập |
| 401 | `TOKEN_EXPIRED` | Token hết hạn | Báo phiên hết hạn, yêu cầu đăng nhập lại |
| 401 | `INVALID_TOKEN` | Token sai chữ ký, sai định dạng, sai loại, hoặc tài khoản không còn tồn tại | Xoá token đã lưu, chuyển tới trang đăng nhập |
| 403 | `FORBIDDEN` | Đã đăng nhập nhưng không đủ quyền | Hiện thông báo không có quyền |

Phản hồi 401 có header `WWW-Authenticate`. Thông báo `INVALID_TOKEN` cố ý không nói rõ lý do cụ thể.

## Xác thực token

Access token là JWT ký HS256. Trong token chỉ có `sub` (id người dùng), `type` (`access`), `iss`, `iat`, `exp`. **Vai trò không nằm trong token** mà được đọc lại từ kho dữ liệu mỗi request, nên đổi vai trò hoặc xoá tài khoản có hiệu lực ngay.

`TokenService` chỉ chấp nhận đúng thuật toán đã cấu hình (token `alg: none` hay đổi thuật toán đều bị từ chối), bắt buộc có `exp`, `iat`, `sub`, `iss`, kiểm tra `iss`, loại token và giới hạn độ dài token.

**Bảo vệ một route** bằng dependency:

```python
from typing import Annotated
from fastapi import Depends
from app.dependencies.auth import get_current_user, require_roles
from app.repositories.user_repository import User

@router.get("/lich-su")
async def history(user: Annotated[User, Depends(get_current_user)]):
    ...                                   # user.id, user.role

@router.get("/quan-tri", dependencies=[Depends(require_roles("ADMIN"))])
async def admin_area():
    ...                                   # chỉ ADMIN, người khác nhận 403
```

**Phát hành token** (API đăng nhập TK-006 sẽ dùng):

```python
issued = request.app.state.token_service.create_access_token(user.id)
# issued.access_token, issued.token_type == "Bearer", issued.expires_in (giây)
```

Thử trên `/docs`: bấm **Authorize**, dán access token, rồi gọi `GET /api/auth/me`.

Front-end cần gửi `Authorization: Bearer <token>` ở mỗi request cần đăng nhập. Nơi lưu token (bộ nhớ, `sessionStorage`, cookie `HttpOnly`) cần quyết định cùng với API đăng nhập; lưu ở `localStorage` dễ bị lấy cắp nếu trang bị XSS.

## Mật khẩu

Băm bằng scrypt (`hashlib.scrypt` có sẵn trong Python), salt ngẫu nhiên 16 byte, N=2^15, r=8, p=3. Chuỗi lưu có dạng `scrypt$N$r$p$salt$hash`, tham số nằm trong chuỗi nên có thể tăng độ khó sau này mà không làm hỏng hash cũ. Dùng `verify_password` (so sánh thời gian cố định) khi đăng nhập và `needs_rehash` để nâng cấp hash cũ sau khi đăng nhập thành công. Việc băm chạy trong thread pool để không chặn các request khác.

## Việc cần làm tiếp

- Kho người dùng đang lưu trong bộ nhớ, dữ liệu mất khi khởi động lại. Khi `database/` có thiết kế bảng, viết repository mới có `find_by_email`, `find_by_id` và `create`, thêm ràng buộc UNIQUE cho email và truyền vào `create_app`.
- API đăng nhập (TK-006) dùng lại `verify_password` và `create_access_token`. Nếu dùng cookie thì cần bật `allow_credentials` trong cấu hình CORS và chỉ định rõ origin.
- Chưa có refresh token và đăng xuất thu hồi token: token đã phát hành vẫn dùng được đến khi hết hạn. Nếu cần thu hồi ngay, thêm danh sách token bị thu hồi hoặc số phiên bản token theo người dùng.
- Giới hạn số lần gọi theo IP cho `/api/auth/register` (mỗi lần băm tốn CPU và 32 MiB bộ nhớ).
- Front-end (`front-end/src/js/pages/account.js`) chưa gọi API; hiện form vẫn chỉ kiểm tra tại trình duyệt.
