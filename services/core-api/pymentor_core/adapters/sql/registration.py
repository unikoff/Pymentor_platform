"""SQL registration implementation."""

from pymentor_core.adapters.sql import models
from pymentor_core.modules.identity.registration import EmailAlreadyExists


class Registration:
    def register(self, user, db):
        existing_user = (
            db.query(models.User).filter(models.User.email == user.email).first()
        )
        if existing_user:
            raise EmailAlreadyExists()
        new_user = models.User(
            username=user.username, email=user.email, password=user.password
        )
        db.add(new_user)
        db.commit()
        db.refresh(new_user)
        return new_user
