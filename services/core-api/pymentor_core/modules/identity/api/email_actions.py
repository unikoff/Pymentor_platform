"""HTTP facade for account email verification and password links."""

import hashlib
import logging
import re
import threading
import time

from fastapi import APIRouter, Depends, HTTPException, Request
from pydantic import BaseModel, constr, field_validator
from sqlalchemy.orm import Session

from pymentor_core.app.dependencies import get_db
from pymentor_core.modules.identity.api.sessions import get_current_user
from pymentor_core.modules.identity.passwords import validate_bcrypt_length
from pymentor_core.shared.bindings import get_bindings
from pymentor_core.shared.api_contracts import LegacyErrorResponse
from pymentor_core.modules.identity.access import _serialize_user
from pymentor_core.modules.identity.api.schemas import CurrentUserResponse


router = APIRouter()
logger = logging.getLogger(__name__)
_attempts: dict[str, list[float]] = {}
_attempt_lock = threading.Lock()
_GENERIC = {"message": "Если для этого адреса доступно восстановление, мы отправили письмо"}


class EmailRequest(BaseModel):
    email: constr(min_length=5, max_length=100)


class ProfileRequest(BaseModel):
    username: constr(min_length=3, max_length=40)

    @field_validator("username", mode="before")
    @classmethod
    def trim_username(cls, value):
        return value.strip() if isinstance(value, str) else value


class EmailChangeRequest(BaseModel):
    email: constr(min_length=5, max_length=100)

    @field_validator("email", mode="before")
    @classmethod
    def validate_email(cls, value):
        if not isinstance(value, str):
            raise ValueError("Укажите корректный email")
        value = value.strip().lower()
        if not re.fullmatch(r"[a-z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-z0-9](?:[a-z0-9.-]*[a-z0-9])?\.[a-z]{2,63}", value) or ".." in value:
            raise ValueError("Укажите корректный email")
        return value


class EmailActionResponse(BaseModel):
    message: str


class EmailChangeResponse(EmailActionResponse):
    verification_sent: bool
    completed: bool


def _errors(*codes: int):
    return {code: {"model": LegacyErrorResponse} for code in codes}


class TokenRequest(BaseModel):
    token: constr(min_length=1, max_length=4096)


class PasswordRequest(TokenRequest):
    new_password: constr(min_length=8, max_length=128)
    _validate_password_length = field_validator("new_password")(validate_bcrypt_length)


def _allowed(kind: str, key: str) -> bool:
    """Bound per-process request rates without storing raw addresses or IPs."""
    digest = hashlib.sha256((kind + "\0" + key).encode()).hexdigest()
    now = time.monotonic()
    with _attempt_lock:
        if len(_attempts) >= 10000:
            for item, stamps in list(_attempts.items()):
                if not any(now - stamp < 60 for stamp in stamps):
                    del _attempts[item]
            if len(_attempts) >= 10000:
                return False
        recent = [stamp for stamp in _attempts.get(digest, []) if now - stamp < 60]
        limit = 20 if kind == "reset-ip" else 5 if kind == "confirm" else 1
        if len(recent) >= limit:
            return False
        _attempts[digest] = [*recent, now]
        return True


def _request_allowed(request: Request, kind: str, key: str) -> bool:
    if getattr(request.app.state, "profile", None) != "postgres_redis":
        return _allowed(kind, key)
    from anyio import from_thread

    identity = getattr(request.app.state, "local_async_identity", None)
    if identity is None or identity.redis is None:
        raise HTTPException(status_code=503, detail="Сервис временно недоступен")
    digest = hashlib.sha256((kind + "\0" + key).encode()).hexdigest()
    limit = 20 if kind == "reset-ip" else 5 if kind == "confirm" else 1
    try:
        return from_thread.run(identity.redis.allow_email_request, digest, limit)
    except Exception as exc:
        raise HTTPException(status_code=503, detail="Сервис временно недоступен") from exc


def _send(db, user, purpose):
    try:
        get_bindings().email_auth.send_link(db, user, purpose)
    except Exception as exc:
        logger.warning("Account email delivery failed: %s", type(exc).__name__)
        raise HTTPException(status_code=503, detail="Не удалось отправить письмо") from exc


@router.patch("/profile", response_model=CurrentUserResponse, responses=_errors(401))
def update_profile(payload: ProfileRequest, request: Request, db: Session = Depends(get_db)):
    user = get_current_user(request, db)
    return {"user": _serialize_user(get_bindings().email_auth.update_username(db, user, payload.username))}


@router.get("/email-change/capabilities")
def email_change_capabilities():
    return {"confirmations_required": 2}


@router.post("/email-change/request", response_model=EmailActionResponse, responses=_errors(400, 401, 403, 409, 429, 503))
def request_email_change(payload: EmailChangeRequest, request: Request, db: Session = Depends(get_db)):
    user = get_current_user(request, db)
    if not user.verified:
        raise HTTPException(status_code=403, detail="Подтвердите текущую почту, чтобы её сменить")
    if user.email.lower() == payload.email:
        raise HTTPException(status_code=400, detail="Новая почта совпадает с текущей")
    if get_bindings().email_auth.email_is_taken(db, payload.email):
        raise HTTPException(status_code=409, detail="Этот email уже используется")
    if not _request_allowed(request, "email-change", str(user.id)):
        raise HTTPException(status_code=429, detail="Попробуйте позже")
    try:
        get_bindings().email_auth.send_email_change(db, user, payload.email)
    except Exception as exc:
        logger.warning("Email change delivery failed: %s", type(exc).__name__)
        raise HTTPException(status_code=503, detail="Не удалось отправить оба письма. Почта не изменилась; попробуйте позже") from exc
    return {"message": "Письма отправлены на текущую и новую почту"}


@router.post("/email-change/confirm", response_model=EmailChangeResponse, responses=_errors(400, 409, 429, 503))
def confirm_email_change(payload: TokenRequest, request: Request, db: Session = Depends(get_db)):
    ip = request.client.host if request.client else "unknown"
    if not _request_allowed(request, "confirm", ip):
        raise HTTPException(status_code=429, detail="Попробуйте позже")
    try:
        result = get_bindings().email_auth.confirm_email_change(db, payload.token)
    except ValueError as exc:
        raise HTTPException(status_code=503, detail="Смена почты недоступна") from exc
    if not result:
        raise HTTPException(status_code=400, detail="Ссылка недействительна, истекла или адрес уже занят")
    if result == "not_ready":
        raise HTTPException(status_code=409, detail="Письма ещё отправляются или отправка не удалась. Повторите попытку позже или запросите новые письма")
    if result == "pending":
        return {"message": "Этот адрес подтверждён. Подтвердите второй адрес из письма; до этого почта аккаунта не изменится.", "verification_sent": True, "completed": False}
    return {"message": "Оба адреса подтверждены. Почта аккаунта изменена.", "verification_sent": True, "completed": True}


@router.post("/email-verification/request", response_model=EmailActionResponse, responses=_errors(401, 429, 503))
def request_verification(request: Request, db: Session = Depends(get_db)):
    user = get_current_user(request, db)
    if not user.verified:
        if not _request_allowed(request, "verification", str(user.id)):
            raise HTTPException(status_code=429, detail="Попробуйте позже")
        _send(db, user, "verify_email")
    return {"message": "Если почта не подтверждена, письмо отправлено"}


@router.post("/email-verification/confirm", response_model=EmailActionResponse, responses=_errors(400, 503))
def confirm_verification(payload: TokenRequest, db: Session = Depends(get_db)):
    try:
        ok = get_bindings().email_auth.confirm_verification(db, payload.token)
    except ValueError as exc:
        raise HTTPException(status_code=503, detail="Подтверждение недоступно") from exc
    if not ok:
        raise HTTPException(status_code=400, detail="Ссылка недействительна или срок её действия истёк")
    return {"message": "Почта подтверждена"}


@router.post("/password-change/request", response_model=EmailActionResponse, responses=_errors(401, 403, 429, 503))
def request_password_change(request: Request, db: Session = Depends(get_db)):
    user = get_current_user(request, db)
    if not user.verified:
        raise HTTPException(status_code=403, detail="Подтвердите почту, чтобы сменить пароль")
    if not _request_allowed(request, "change", str(user.id)):
        raise HTTPException(status_code=429, detail="Попробуйте позже")
    _send(db, user, "change_password")
    return {"message": "Письмо отправлено"}


@router.post("/password-reset/request", status_code=202, response_model=EmailActionResponse)
def request_password_reset(payload: EmailRequest, request: Request, db: Session = Depends(get_db)):
    email = payload.email.strip()
    ip = request.client.host if request.client else "unknown"
    ip_allowed = _request_allowed(request, "reset-ip", ip)
    email_allowed = _request_allowed(request, "reset-email", email)
    user = get_bindings().email_auth.find_user_by_email(db, email)
    if ip_allowed and email_allowed and user is not None and user.verified:
        try:
            _send(db, user, "reset_password")
        except HTTPException:
            pass
    return _GENERIC


@router.post("/password-reset/confirm", response_model=EmailActionResponse, responses=_errors(400, 429, 503))
def confirm_password(payload: PasswordRequest, request: Request, db: Session = Depends(get_db)):
    ip = request.client.host if request.client else "unknown"
    if not _request_allowed(request, "confirm", ip):
        raise HTTPException(status_code=429, detail="Попробуйте позже")
    try:
        current_user = None
        if request.cookies.get("session"):
            try:
                current_user = get_current_user(request, db)
            except HTTPException as exc:
                if exc.status_code != 401:
                    raise
        ok = get_bindings().email_auth.confirm_password(
            db, payload.token, payload.new_password,
            current_user_id=current_user.id if current_user is not None else None,
            current_session=request.cookies.get("session") if current_user is not None else None,
        )
    except ValueError as exc:
        raise HTTPException(status_code=503, detail="Смена пароля недоступна") from exc
    if not ok:
        raise HTTPException(status_code=400, detail="Ссылка недействительна или срок её действия истёк")
    return {"message": "Пароль изменён"}
