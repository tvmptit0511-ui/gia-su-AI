"""Luồng đăng ký tài khoản."""

from __future__ import annotations

import asyncio
from typing import Any, Callable, Protocol

from app.repositories.user_repository import User
from app.utils.errors import AppError, DuplicateEmailError
from app.utils.password import hash_password
from app.validators.register_validator import validate_register_input

DEFAULT_ROLE = "LEARNER"
EMAIL_TAKEN_MESSAGE = "Email này đã được đăng ký. Vui lòng đăng nhập hoặc dùng email khác."


class UserRepository(Protocol):
    async def find_by_email(self, email: str) -> User | None: ...

    async def create(self, *, name: str, email: str, password_hash: str, role: str) -> User: ...


def _email_taken() -> AppError:
    return AppError(409, "EMAIL_ALREADY_EXISTS", EMAIL_TAKEN_MESSAGE, {"email": EMAIL_TAKEN_MESSAGE})


class AuthService:
    def __init__(
        self,
        user_repository: UserRepository,
        password_hasher: Callable[[str], str] = hash_password,
    ) -> None:
        self._users = user_repository
        self._hash = password_hasher

    async def register(self, payload: Any) -> User:
        """Kiểm tra dữ liệu -> kiểm tra email trùng -> băm mật khẩu -> lưu.

        Raises:
            AppError: 422 khi dữ liệu sai, 409 khi email đã đăng ký.
        """
        result = validate_register_input(payload)
        if not result.valid:
            raise AppError(422, "VALIDATION_ERROR", "Dữ liệu đăng ký chưa hợp lệ.", result.errors)
        data = result.value
        assert data is not None

        # Kiểm tra sớm để không tốn CPU băm mật khẩu cho email đã có.
        if await self._users.find_by_email(data.email):
            raise _email_taken()

        # scrypt tốn CPU và chạy đồng bộ, đưa ra thread pool để không chặn event loop.
        password_hash = await asyncio.to_thread(self._hash, data.password)
        try:
            return await self._users.create(
                name=data.name,
                email=data.email,
                password_hash=password_hash,
                role=DEFAULT_ROLE,
            )
        except DuplicateEmailError:
            # Hai request cùng email chạy đồng thời: request đến sau thua ở bước lưu.
            raise _email_taken() from None
