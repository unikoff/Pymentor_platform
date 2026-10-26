"""Persistence of lesson completion and task revision progress."""

from datetime import datetime, timezone
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError
from db import models


def get_completed_lesson_ids(user_id: int, db: Session) -> set[str]:
    rows = db.query(models.UserLessonProgress.lesson_id).filter(models.UserLessonProgress.user_id == user_id).all()
    return {row.lesson_id for row in rows}


def mark_lesson_completed(user_id: int, lesson_id: str, db: Session) -> None:
    progress = models.UserLessonProgress(user_id=user_id, lesson_id=lesson_id)
    db.add(progress)
    try:
        db.commit()
    except IntegrityError:
        # Урок уже отмечен — повторная отметка не ошибка.
        db.rollback()


def get_completed_task_revisions(user_id: int, task_ids: list[str], db: Session) -> dict[str, str]:
    if not task_ids:
        return {}

    rows = (
        db.query(models.UserTaskProgress.task_id, models.UserTaskProgress.task_revision)
        .filter(models.UserTaskProgress.user_id == user_id, models.UserTaskProgress.task_id.in_(task_ids))
        .all()
    )
    return {row.task_id: row.task_revision for row in rows}


def mark_task_completed(user_id: int, task_id: str, task_revision: str, db: Session) -> None:
    progress = (
        db.query(models.UserTaskProgress)
        .filter(models.UserTaskProgress.user_id == user_id, models.UserTaskProgress.task_id == task_id)
        .first()
    )
    if progress is not None:
        if progress.task_revision == task_revision:
            return
        progress.task_revision = task_revision
        progress.completed_at = datetime.now(timezone.utc)
    else:
        db.add(
            models.UserTaskProgress(
                user_id=user_id,
                task_id=task_id,
                task_revision=task_revision,
            )
        )

    try:
        db.commit()
    except IntegrityError:
        db.rollback()
        progress = (
            db.query(models.UserTaskProgress)
            .filter(models.UserTaskProgress.user_id == user_id, models.UserTaskProgress.task_id == task_id)
            .first()
        )
        if progress is None:
            raise
        if progress.task_revision != task_revision:
            progress.task_revision = task_revision
            progress.completed_at = datetime.now(timezone.utc)
            db.commit()
