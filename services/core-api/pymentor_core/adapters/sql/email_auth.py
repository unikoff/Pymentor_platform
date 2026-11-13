"""SQL persistence for email verification and password changes."""

import os
import hashlib
import secrets
from datetime import datetime, timedelta, timezone
from sqlalchemy import delete, func, select, text, update
from sqlalchemy.exc import IntegrityError

from pymentor_core.adapters.account_email import EmailConfig, send_account_email
from pymentor_core.adapters.sql.models import EmailChangeRequest, Session, User
from pymentor_core.modules.identity.email_tokens import EmailTokens
from pymentor_core.modules.identity.passwords import hash_password


def _tokens():
    return EmailTokens(os.environ.get("PYMENTOR_EMAIL_TOKEN_SECRET", ""))


def _config():
    return EmailConfig(
        host=os.environ.get("PYMENTOR_SMTP_HOST", ""),
        port=int(os.environ.get("PYMENTOR_SMTP_PORT", "587")),
        sender=os.environ.get("PYMENTOR_SMTP_FROM", ""),
        public_url=os.environ.get("PYMENTOR_EMAIL_PUBLIC_URL", ""),
        username=os.environ.get("PYMENTOR_SMTP_USERNAME", ""),
        password=os.environ.get("PYMENTOR_SMTP_PASSWORD", ""),
        starttls=os.environ.get("PYMENTOR_SMTP_STARTTLS", "1") != "0",
    )


def send_link(db, user, purpose):
    """Create a link from an immutable snapshot, then close SQL before SMTP."""
    user_id, email, password_hash = user.id, user.email, user.password
    token = _tokens().issue(purpose, user_id, email, password_hash)
    config = _config()
    db.rollback()
    send_account_email(config, email, purpose, token)


def send_registration_verification(user_id, email, password_hash):
    """Send from a committed snapshot without retaining a request database session."""
    token = _tokens().issue("verify_email", user_id, email, password_hash)
    send_account_email(_config(), email, "verify_email", token)


def find_user_by_email(db, email):
    return db.query(User).filter(User.email == email).first()


def email_is_taken(db, email):
    return db.scalar(select(User.id).where(func.lower(User.email) == email.lower()).limit(1)) is not None


def update_username(db, user, username):
    user.username = username
    db.commit()
    db.refresh(user)
    return user


def send_email_change(db, user, new_email):
    user_id, old_email, password_hash = user.id, user.email, user.password
    request_id = secrets.token_urlsafe(32)
    service = _tokens()
    tokens = {side: service.issue("change_email_dual", user_id, old_email, password_hash,
                                 new_email=new_email, request_id=request_id, side=side)
              for side in ("old", "new")}
    config = _config()
    now = datetime.now(timezone.utc)
    db.execute(delete(EmailChangeRequest).where(EmailChangeRequest.expires_at < now))
    db.add(EmailChangeRequest(id=request_id, expires_at=now + timedelta(minutes=30), active=False))
    db.commit()
    # Keep links unusable if either delivery fails or the process stops midway.
    send_account_email(config, old_email, "change_email_dual", tokens["old"], new_email=new_email, side="old")
    send_account_email(config, new_email, "change_email_dual", tokens["new"], new_email=new_email, side="new")
    db.execute(update(EmailChangeRequest).where(EmailChangeRequest.id == request_id)
               .values(active=True).execution_options(synchronize_session=False))
    db.commit()


def confirm_email_change(db, token):
    """Record one proof; atomically change the address after both proofs."""
    service = _tokens()
    payload = service.read(token, "change_email_dual")
    if (payload is None or not isinstance(payload.get("new_email"), str)
            or not isinstance(payload.get("request_id"), str) or payload.get("side") not in {"old", "new"}):
        return None
    user = db.get(User, payload["user_id"])
    if user is None or not user.verified:
        return None
    user_id, old_email, password_hash = user.id, user.email, user.password
    if not service.validate(token, "change_email_dual", user_id, old_email, password_hash):
        return None
    new_email = payload["new_email"]
    now = datetime.now(timezone.utc)
    try:
        flag = "old_confirmed" if payload["side"] == "old" else "new_confirmed"
        state = db.execute(update(EmailChangeRequest).where(
            EmailChangeRequest.id == payload["request_id"], EmailChangeRequest.active.is_(True),
            EmailChangeRequest.completed.is_(False), EmailChangeRequest.expires_at > now,
        ).values({flag: True}).returning(EmailChangeRequest.old_confirmed, EmailChangeRequest.new_confirmed)
            .execution_options(synchronize_session=False)).first()
        if state is None:
            waiting = db.scalar(select(EmailChangeRequest.id).where(
                EmailChangeRequest.id == payload["request_id"], EmailChangeRequest.active.is_(False),
                EmailChangeRequest.expires_at > now,
            ))
            db.rollback()
            return "not_ready" if waiting else None
        if not (state.old_confirmed and state.new_confirmed):
            db.commit()
            return "pending"
        claimed = db.execute(update(User).where(
            User.id == user_id, User.email == old_email,
            User._password_hash == password_hash, User.verified.is_(True),
            ~select(User.id).where(func.lower(User.email) == new_email.lower()).exists(),
        ).values(email=new_email, verified=True).execution_options(synchronize_session=False))
        if claimed.rowcount != 1:
            db.rollback()
            return None
        db.execute(update(EmailChangeRequest).where(EmailChangeRequest.id == payload["request_id"])
                   .values(completed=True).execution_options(synchronize_session=False))
        db.commit()
    except IntegrityError:
        db.rollback()
        return None
    return "completed"


def confirm_verification(db, token):
    service = _tokens()
    payload = service.read(token, "verify_email")
    if payload is None:
        return False
    user = db.get(User, payload["user_id"])
    if user is None:
        return False
    if not service.validate(token, "verify_email", user.id, user.email, user.password):
        return False
    result = db.execute(
        update(User).where(User.id == user.id, User.email == user.email,
                           User._password_hash == user.password)
        .values(verified=True).execution_options(synchronize_session=False)
    )
    db.commit()
    return result.rowcount == 1


def confirm_password(db, token, password, *, current_user_id=None, current_session=None):
    service = _tokens()
    purpose = None
    payload = None
    for candidate in ("reset_password", "change_password"):
        payload = service.read(token, candidate)
        if payload is not None:
            purpose = candidate
            break
    if payload is None:
        return False
    user = db.get(User, payload["user_id"])
    if user is None or not user.verified:
        return False
    user_id, email, old_hash = user.id, user.email, user.password
    if not service.validate(token, purpose, user_id, email, old_hash):
        return False
    new_hash = hash_password(password)
    clauses = [User.id == user_id, User.email == email, User._password_hash == old_hash,
               User.verified.is_(True)]
    updated = db.execute(
        update(User).where(*clauses).values({User._password_hash: new_hash})
        .execution_options(synchronize_session=False)
    )
    if updated.rowcount != 1:
        db.rollback()
        return False
    keep_session_id = None
    if current_user_id == user_id and current_session:
        session_key = (hashlib.sha256(current_session.encode("utf-8")).hexdigest()
                       if db.get_bind().dialect.name == "postgresql" else current_session)
        keep_session_id = db.scalar(select(Session.id).where(
            Session.user_id == user_id, Session.session_token == session_key
        ))
    if db.get_bind().dialect.name == "postgresql":
        query = "UPDATE login_operations SET status = 'revoked', session_id = NULL, committed_at = NULL WHERE user_id = :uid"
        if keep_session_id is not None:
            query += " AND (session_id IS NULL OR session_id <> :keep_id)"
        db.execute(text(query), {"uid": user_id, "keep_id": keep_session_id})
    deleted = delete(Session).where(Session.user_id == user_id)
    if keep_session_id is not None:
        deleted = deleted.where(Session.id != keep_session_id)
    db.execute(deleted)
    db.commit()
    return True
