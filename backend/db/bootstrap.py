from sqlalchemy import inspect, text
from sqlalchemy.exc import IntegrityError
from db.engine import Base, SessionLocal, engine
from db import models
from content.catalog import get_legacy_lesson_id_map


def ensure_default_landing(session_factory=SessionLocal) -> models.Landing:
    """Register the existing /backend page once so it can receive admin config."""
    session = session_factory()
    try:
        landing = session.query(models.Landing).filter_by(slug="backend").first()
        if landing is not None:
            return landing

        landing = models.Landing(
            id="pymentor-backend",
            slug="backend",
            title="Pymentor",
            description="Основной лендинг платформы по адресу /backend",
            is_active=True,
        )
        session.add(landing)
        try:
            session.commit()
        except IntegrityError:
            session.rollback()
            landing = session.query(models.Landing).filter_by(slug="backend").first()
            if landing is None:
                raise
        session.refresh(landing)
        return landing
    finally:
        session.close()


def ensure_schema() -> None:
    Base.metadata.create_all(bind=engine)

    inspector = inspect(engine)
    landing_columns = {column["name"] for column in inspector.get_columns("landings")}
    if "version" not in landing_columns:
        with engine.begin() as connection:
            connection.execute(
                text("ALTER TABLE landings ADD COLUMN version INTEGER NOT NULL DEFAULT 1")
            )

    outbox_columns = {column["name"] for column in inspector.get_columns("landing_notification_outbox")}
    if "manual_retry_count" not in outbox_columns:
        with engine.begin() as connection:
            connection.execute(
                text(
                    "ALTER TABLE landing_notification_outbox "
                    "ADD COLUMN manual_retry_count INTEGER NOT NULL DEFAULT 0"
                )
            )

    ensure_default_landing()

    user_columns = {column["name"] for column in inspector.get_columns("users")}
    if "subscription_until" not in user_columns:
        with engine.begin() as connection:
            connection.execute(text("ALTER TABLE users ADD COLUMN subscription_until DATETIME"))

    if "subscription_plan" not in user_columns:
        with engine.begin() as connection:
            connection.execute(text("ALTER TABLE users ADD COLUMN subscription_plan VARCHAR(32)"))
            connection.execute(
                text("UPDATE users SET subscription_plan = 'pro' WHERE subscription_until IS NOT NULL")
            )

    with engine.begin() as connection:
        connection.execute(
            text("CREATE INDEX IF NOT EXISTS ix_users_subscription_until ON users (subscription_until)")
        )
        connection.execute(
            text(
                "CREATE INDEX IF NOT EXISTS ix_user_lesson_progress_completed_at "
                "ON user_lesson_progress (completed_at)"
            )
        )

    # Сохраняем дату и время первого визита в день. Старое created_at
    # удаляем, если оно осталось в базе от прежней схемы.
    activity_columns = {column["name"] for column in inspector.get_columns("user_activity_days")}
    if "created_at" in activity_columns:
        with engine.begin() as connection:
            connection.execute(text("ALTER TABLE user_activity_days DROP COLUMN created_at"))
    if "visited_at" not in activity_columns:
        with engine.begin() as connection:
            connection.execute(text("ALTER TABLE user_activity_days ADD COLUMN visited_at DATETIME"))

    if "is_admin" not in user_columns:
        with engine.begin() as connection:
            connection.execute(text("ALTER TABLE users ADD COLUMN is_admin INTEGER NOT NULL DEFAULT 0"))

    # С появлением треков id уроков получили префикс трека:
    # lesson-04 -> python-basics-lesson-04. Переносим только прежние
    # двухзначные позиционные ID, не затрагивая постоянные lesson-<hash>.
    with engine.begin() as connection:
        connection.execute(
            text(
                "UPDATE user_lesson_progress SET lesson_id = 'python-basics-' || lesson_id "
                "WHERE lesson_id GLOB 'lesson-[0-9][0-9]'"
            )
        )

    # До этого релиза ID зависел от места markdown-файла в отсортированном
    # списке. Переносим сохранённый прогресс на ID исходного файла, чтобы
    # последующее добавление материалов не меняло чужие отметки.
    with engine.begin() as connection:
        for legacy_id, stable_id in get_legacy_lesson_id_map().items():
            connection.execute(
                text(
                    "DELETE FROM user_lesson_progress "
                    "WHERE lesson_id = :legacy_id "
                    "AND EXISTS ("
                    "SELECT 1 FROM user_lesson_progress AS stable_progress "
                    "WHERE stable_progress.user_id = user_lesson_progress.user_id "
                    "AND stable_progress.lesson_id = :stable_id"
                    ")"
                ),
                {"legacy_id": legacy_id, "stable_id": stable_id},
            )
            connection.execute(
                text(
                    "UPDATE user_lesson_progress SET lesson_id = :stable_id "
                    "WHERE lesson_id = :legacy_id"
                ),
                {"legacy_id": legacy_id, "stable_id": stable_id},
            )
