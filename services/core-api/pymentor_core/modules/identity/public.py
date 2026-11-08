"""Published Identity operations used by other Core modules."""

from pymentor_core.modules.identity.principal import Principal
from pymentor_core.modules.identity.access import has_active_subscription
from pymentor_core.modules.identity.access import normalize_datetime
from pymentor_core.modules.identity.access import serialize_user


def get_current_user(*args, **kwargs):
    from pymentor_core.modules.identity.api import accounts

    return accounts.get_current_user(*args, **kwargs)


def get_current_principal(*args, **kwargs):
    from pymentor_core.modules.identity.api import accounts

    return Principal.from_user(get_current_user(*args, **kwargs))


# Existing consumers keep aliases while moving to the explicit public names.
_normalize_datetime = normalize_datetime
_serialize_user = serialize_user
