"""Keep SQLite learning progress attached to existing accounts."""
from sqlalchemy import text


def ensure_sqlite_progress_integrity(engine) -> None:
    """Install forward-only safeguards without changing existing rows.

    PostgreSQL enforces the existing foreign keys independently. SQLite's
    triggers also protect direct deletes and late writes from older connections,
    even where foreign-key enforcement has not been enabled.
    """
    if engine.dialect.name != 'sqlite':
        return
    statements = [
        '''CREATE TRIGGER IF NOT EXISTS pymentor_user_progress_delete_v1
           AFTER DELETE ON users BEGIN
             DELETE FROM user_activity_days WHERE user_id = OLD.id;
             DELETE FROM user_lesson_progress WHERE user_id = OLD.id;
             DELETE FROM user_task_progress WHERE user_id = OLD.id;
           END''',
    ]
    for table in ('user_activity_days', 'user_lesson_progress', 'user_task_progress'):
        for action, suffix in (('INSERT', 'insert'), ('UPDATE OF user_id', 'update_owner')):
            statements.append(f'''CREATE TRIGGER IF NOT EXISTS pymentor_{table}_{suffix}_v1
                BEFORE {action} ON {table}
                WHEN NOT EXISTS (SELECT 1 FROM users WHERE id = NEW.user_id)
                BEGIN SELECT RAISE(ABORT, 'progress_user_missing'); END''')
    with engine.begin() as connection:
        for statement in statements:
            connection.execute(text(statement))
