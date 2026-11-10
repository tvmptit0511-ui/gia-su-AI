"""Cấu hình đọc từ biến môi trường, có giá trị mặc định cho môi trường phát triển."""

from __future__ import annotations

import os
from dataclasses import dataclass

# Front-end dev server (front-end/serve.cjs) chạy ở cổng 4173.
DEFAULT_CORS_ORIGINS = ("http://127.0.0.1:4173", "http://localhost:4173")
DEFAULT_MAX_BODY_BYTES = 10 * 1024


@dataclass(frozen=True)
class Settings:
    cors_origins: tuple[str, ...] = DEFAULT_CORS_ORIGINS
    max_body_bytes: int = DEFAULT_MAX_BODY_BYTES


def load_settings() -> Settings:
    raw = os.environ.get("CORS_ORIGIN", "")
    origins = tuple(item.strip() for item in raw.split(",") if item.strip())
    return Settings(cors_origins=origins or DEFAULT_CORS_ORIGINS)
