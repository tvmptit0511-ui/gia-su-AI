"""Schema Pydantic cho API xác thực.

``RegisterRequestDoc`` chỉ dùng để mô tả body trong tài liệu OpenAPI (/docs).
Việc kiểm tra dữ liệu thật nằm ở ``app/validators/register_validator.py`` để
thông báo lỗi tiếng Việt khớp với front-end.
"""

from pydantic import BaseModel, Field


class RegisterRequestDoc(BaseModel):
    name: str = Field(max_length=120, examples=["Nguyễn Văn An"], description="Họ tên")
    email: str = Field(max_length=255, examples=["an@example.com"])
    password: str = Field(min_length=8, max_length=128, examples=["MatKhau@123"])
    confirmPassword: str = Field(examples=["MatKhau@123"], description="Phải giống password")
    consent: bool = Field(
        examples=[True],
        description="Phải là true: đồng ý quy định sử dụng cho người học từ đủ 18 tuổi",
    )


class PublicUser(BaseModel):
    id: str
    name: str
    email: str
    role: str
    created_at: str = Field(serialization_alias="createdAt")


class RegisterResponse(BaseModel):
    message: str
    user: PublicUser


class ErrorBody(BaseModel):
    code: str
    message: str
    fields: dict[str, str] | None = None


class ErrorResponse(BaseModel):
    error: ErrorBody
