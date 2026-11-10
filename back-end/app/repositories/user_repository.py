"""Kho lưu người dùng trong bộ nhớ.

Thư mục ``database/`` của dự án chưa có thiết kế bảng nên tạm lưu trong bộ nhớ:
dữ liệu mất khi khởi động lại server. Khi có CSDL thật, viết lớp mới với cùng ba
phương thức (``find_by_email``, ``find_by_id``, ``create``) và truyền vào
``create_app``, không phải sửa service hay route. Với CSDL thật cần ràng buộc
UNIQUE trên cột email (đã chuẩn hoá chữ thường) và bắt lỗi trùng để ném
``DuplicateEmailError``.
"""

from __future__ import annotations

import uuid
from dataclasses import dataclass
from datetime import datetime, timezone

from app.utils.errors import DuplicateEmailError


@dataclass(frozen=True)
class User:
    id: str
    name: str
    email: str
    password_hash: str
    role: str
    created_at: str


class InMemoryUserRepository:
    def __init__(self) -> None:
        self._users: dict[str, User] = {}  # id -> user
        self._id_by_email: dict[str, str] = {}  # email -> id

    async def find_by_email(self, email: str) -> User | None:
        user_id = self._id_by_email.get(email)
        return self._users.get(user_id) if user_id else None

    async def find_by_id(self, user_id: str) -> User | None:
        return self._users.get(user_id)

    async def create(self, *, name: str, email: str, password_hash: str, role: str) -> User:
        # Kiểm tra và ghi không có điểm ``await`` ở giữa nên hai request đăng ký
        # cùng email đồng thời không thể cùng thành công.
        if email in self._id_by_email:
            raise DuplicateEmailError(email)
        user = User(
            id=str(uuid.uuid4()),
            name=name,
            email=email,
            password_hash=password_hash,
            role=role,
            created_at=datetime.now(timezone.utc).isoformat(timespec="milliseconds").replace("+00:00", "Z"),
        )
        self._users[user.id] = user
        self._id_by_email[email] = user.id
        return user
