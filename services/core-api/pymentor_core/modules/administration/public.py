"""Verified administrative access; storage never authenticates a raw request."""

from pymentor_core.modules.identity import public as identity
from pymentor_core.modules.identity.principal import require_admin as authorize_admin


def require_admin(request, db, *, uow=None):
    kwargs = {"uow": uow} if uow is not None else {}
    return authorize_admin(
        identity.get_current_principal(request=request, db=db, **kwargs)
    )
