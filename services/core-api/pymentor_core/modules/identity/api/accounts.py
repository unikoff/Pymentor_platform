"""Account HTTP facade and compatibility exports."""

from fastapi import HTTPException
from fastapi import status
from pymentor_core.modules.identity.api.schemas import UserCreate
from pymentor_core.modules.identity.api.sessions import _secure_cookie_enabled
from pymentor_core.modules.identity.api.sessions import get_current_user
from pymentor_core.modules.identity.api.sessions import login_user
from pymentor_core.modules.identity.api.sessions import logout_user
from pymentor_core.modules.identity.principal import Principal
from pymentor_core.modules.identity.access import _normalize_datetime
from pymentor_core.modules.identity.access import _serialize_user
from pymentor_core.modules.identity.access import has_active_subscription
from pymentor_core.modules.identity.registration import EmailAlreadyExists
from pymentor_core.shared.bindings import get_bindings


def register_user(user: UserCreate, db):
    try:
        return get_bindings().registration.register(user, db)
    except EmailAlreadyExists as exc:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail="Email already exists"
        ) from exc


def get_current_principal(request, db, *, uow=None) -> Principal:
    """Expose verified identity to other modules without the ORM credential record."""
    kwargs = {"uow": uow} if uow is not None else {}
    return Principal.from_user(get_current_user(request=request, db=db, **kwargs))
