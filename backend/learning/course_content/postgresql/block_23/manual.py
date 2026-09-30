from typing import Any

MANUAL_PRACTICE: dict[int, list[dict[str, Any]]] = {
    131: [{'title': 'Добавьте Task ↔ Tag через association table',
        'task': 'Реализуйте many-to-many отношение без списка tag ids в одной колонке. Связь должна иметь '
                'database-защиту от дубля.',
        'steps': ['Создайте модель Tag с id и уникальным name.',
                  'Создайте association table task_tags с task_id и tag_id как foreign keys.',
                  'Сделайте составной primary key из task_id и tag_id.',
                  'Добавьте relationship Task.tags и Tag.tasks через secondary и back_populates.',
                  'Создайте Alembic revision add tags and task tags.',
                  'Проверьте upgrade и downgrade на disposable PostgreSQL database.',
                  'Создайте два tags и свяжите одну task с обоими.',
                  'Попробуйте вставить ту же пару task_id/tag_id второй раз и зафиксируйте unique/primary-key '
                  'violation.',
                  'Добавьте GET /tasks/{task_id}/tags и GET /tags/{tag_id}/tasks.',
                  'В response schemas не создавайте рекурсию Task → Tag → Task.',
                  'Добавьте tests обеих сторон, duplicate link и удаление одной связи без удаления Task/Tag.',
                  'Опишите выбранный cascade для удаления Task и Tag.'],
        'result': 'Готово, если association table содержит только уникальные пары, обе стороны relationship '
                  'читаются, duplicate отклоняется database, а удаление связи не удаляет основные объекты '
                  'случайно.'}]
}
