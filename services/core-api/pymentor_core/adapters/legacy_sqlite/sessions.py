"""Temporary SQL session persistence. Device limit policy is supplied by Identity."""

from pymentor_core.adapters.sql import models
from pymentor_core.adapters.sql.accounts import AccountReader


class SqlSessionRepository(AccountReader):
    def session_by_token(self, token):
        if self.uow is not None:
            return self.uow.repository(models.Session).find_one(session_token=token)
        return (
            self.database.query(models.Session)
            .filter(models.Session.session_token == token)
            .first()
        )

    def ordered_sessions(self, user_id):
        return (
            self.database.query(models.Session)
            .filter(models.Session.user_id == user_id)
            .order_by(models.Session.created_at.asc())
            .all()
        )

    def delete_session(self, session):
        self.database.delete(session)

    def add_session(self, user_id, token):
        self.database.add(models.Session(user_id=user_id, session_token=token))

    def delete_token(self, token):
        self.database.query(models.Session).filter(
            models.Session.session_token == token
        ).delete()

    def commit(self):
        self.database.commit()
