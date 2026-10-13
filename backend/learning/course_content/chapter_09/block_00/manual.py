from typing import Any

OVERVIEW_PRACTICE: dict[str, list[dict[str, Any]]] = {
    'План обучения.md': [{'title': 'Зафиксируйте исходную версию Deployable StudyHub',
                       'task': 'До добавления LMS-домена сохраните воспроизводимое состояние проекта и один полный '
                               'технический flow. Новая предметная логика не должна скрыть регрессии auth, database, '
                               'Redis, Compose и CI.',
                       'steps': ['Создайте docs/stage9-starting-point.md.',
                                 'Запишите текущий release tag, commit SHA, Alembic revision и image tag.',
                                 'Поднимите project из чистого clone по README.',
                                 'Проверьте health, readiness, login и один protected CRUD flow.',
                                 'Запустите pytest -q два раза и сохраните число tests.',
                                 'Сохраните текущую ER-диаграмму пользователей, задач, sessions и tokens.',
                                 'Опишите один обязательный LMS flow: teacher создаёт course, student enrolls, '
                                 'completes lesson и видит progress.',
                                 'Составьте out-of-scope: payments, video hosting, chat, certificates и enterprise '
                                 'RBAC.',
                                 'Создайте Git-коммит docs: record stage 9 starting point.'],
                       'result': 'Готово, если документ связывает release, database revision, tests и исходную '
                                 'архитектуру с одним конкретным teacher/student flow и явной границей MVP.'}],
    '00 - План обучения.md': [{'title': 'Зафиксируйте исходную версию Deployable StudyHub',
                            'task': 'До добавления LMS-домена сохраните воспроизводимое состояние проекта и один '
                                    'полный технический flow. Новая предметная логика не должна скрыть регрессии '
                                    'auth, database, Redis, Compose и CI.',
                            'steps': ['Создайте docs/stage9-starting-point.md.',
                                      'Запишите текущий release tag, commit SHA, Alembic revision и image tag.',
                                      'Поднимите project из чистого clone по README.',
                                      'Проверьте health, readiness, login и один protected CRUD flow.',
                                      'Запустите pytest -q два раза и сохраните число tests.',
                                      'Сохраните текущую ER-диаграмму пользователей, задач, sessions и tokens.',
                                      'Опишите один обязательный LMS flow: teacher создаёт course, student enrolls, '
                                      'completes lesson и видит progress.',
                                      'Составьте out-of-scope: payments, video hosting, chat, certificates и '
                                      'enterprise RBAC.',
                                      'Создайте Git-коммит docs: record stage 9 starting point.'],
                            'result': 'Готово, если документ связывает release, database revision, tests и исходную '
                                      'архитектуру с одним конкретным teacher/student flow и явной границей MVP.'}],
}
