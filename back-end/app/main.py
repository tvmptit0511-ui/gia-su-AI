"""Điểm vào của ứng dụng FastAPI.

Chạy phát triển (từ thư mục back-end/)::

    uvicorn app.main:app --reload --port 8000
"""

from __future__ import annotations

from typing import Callable, Sequence

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import Settings, load_settings
from app.error_handlers import register_error_handlers
from app.middlewares.body_limit import BodySizeLimitMiddleware
from app.middlewares.security_headers import SecurityHeadersMiddleware
from app.repositories.user_repository import InMemoryUserRepository
from app.routes.auth import router as auth_router
from app.services.auth_service import AuthService, UserRepository
from app.utils.password import hash_password


def create_app(
    *,
    user_repository: UserRepository | None = None,
    password_hasher: Callable[[str], str] | None = None,
    cors_origins: Sequence[str] | None = None,
    settings: Settings | None = None,
) -> FastAPI:
    """Tạo ứng dụng. Các phụ thuộc được truyền vào để dễ thay kho dữ liệu (ví dụ CSDL
    thật) và để test độc lập, không cần mở cổng thật."""
    settings = settings or load_settings()
    origins = list(cors_origins) if cors_origins is not None else list(settings.cors_origins)

    app = FastAPI(title="Gia Sư AI API", version="0.1.0")
    app.state.auth_service = AuthService(
        user_repository or InMemoryUserRepository(),
        password_hasher or hash_password,
    )

    register_error_handlers(app)
    app.include_router(auth_router)

    @app.get("/api/health", tags=["system"])
    async def health() -> dict[str, str]:
        return {"status": "ok"}

    # Middleware thêm sau nằm ở ngoài: CORS ngoài cùng nên mọi phản hồi (kể cả 413) đều có header CORS.
    app.add_middleware(BodySizeLimitMiddleware, max_bytes=settings.max_body_bytes)
    app.add_middleware(SecurityHeadersMiddleware)
    app.add_middleware(
        CORSMiddleware,
        allow_origins=origins,
        allow_methods=["GET", "POST", "OPTIONS"],
        allow_headers=["Content-Type"],
        max_age=600,
    )
    return app


app = create_app()
