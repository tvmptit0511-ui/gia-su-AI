from typing import Annotated, Any

from fastapi import APIRouter, Body, Depends, Request

from app.schemas.auth import ErrorResponse, PublicUser, RegisterRequestDoc, RegisterResponse
from app.services.auth_service import AuthService
from app.utils.errors import AppError

router = APIRouter(prefix="/api/auth", tags=["auth"])


async def require_json(request: Request) -> None:
    """Chỉ nhận body JSON: sai Content-Type trả 415 thay vì lỗi khó hiểu."""
    media_type = request.headers.get("content-type", "").split(";")[0].strip().lower()
    if media_type != "application/json":
        raise AppError(
            415,
            "UNSUPPORTED_MEDIA_TYPE",
            "Yêu cầu phải gửi dữ liệu JSON (Content-Type: application/json).",
        )


def get_auth_service(request: Request) -> AuthService:
    return request.app.state.auth_service


@router.post(
    "/register",
    status_code=201,
    response_model=RegisterResponse,
    summary="Đăng ký tài khoản",
    dependencies=[Depends(require_json)],
    responses={
        400: {"model": ErrorResponse, "description": "INVALID_JSON: body không phải JSON hợp lệ"},
        409: {"model": ErrorResponse, "description": "EMAIL_ALREADY_EXISTS: email đã đăng ký"},
        413: {"model": ErrorResponse, "description": "PAYLOAD_TOO_LARGE: body lớn hơn 10 KB"},
        415: {"model": ErrorResponse, "description": "UNSUPPORTED_MEDIA_TYPE"},
        422: {"model": ErrorResponse, "description": "VALIDATION_ERROR: `fields` liệt kê từng trường lỗi"},
    },
    # Body thật được kiểm tra bằng validator riêng; đây chỉ để /docs hiển thị đúng các trường.
    openapi_extra={
        "requestBody": {
            "required": True,
            "content": {"application/json": {"schema": RegisterRequestDoc.model_json_schema()}},
        }
    },
)
async def register(
    service: Annotated[AuthService, Depends(get_auth_service)],
    payload: Annotated[Any, Body()] = None,
) -> RegisterResponse:
    user = await service.register(payload)
    return RegisterResponse(
        message="Đăng ký tài khoản thành công.",
        user=PublicUser(
            id=user.id,
            name=user.name,
            email=user.email,
            role=user.role,
            created_at=user.created_at,
        ),
    )
