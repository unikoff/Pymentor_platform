"""Core-owned relational account queries shared by the two database profiles."""

from pymentor_core.adapters.sql import models


class AccountReader:
    def __init__(self, database, uow=None):
        self.database = database
        self.uow = uow

    def user_by_email(self, email):
        if self.uow is not None:
            return self.uow.repository(models.User).find_one(email=email)
        return (
            self.database.query(models.User).filter(models.User.email == email).first()
        )

    def user_by_id(self, user_id):
        if self.uow is not None:
            return self.uow.repository(models.User).find_one(id=user_id)
        return (
            self.database.query(models.User).filter(models.User.id == user_id).first()
        )
