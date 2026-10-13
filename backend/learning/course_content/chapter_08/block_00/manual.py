from typing import Any

OVERVIEW_PRACTICE: dict[str, list[dict[str, Any]]] = {
    'План обучения.md': [{'title': 'Зафиксируйте baseline Async StudyHub перед контейнеризацией',
                       'task': 'До Docker сохраните один воспроизводимый запуск Async StudyHub в Linux-подобной '
                               'среде. Baseline нужен, чтобы отличать инфраструктурную ошибку от изменения '
                               'приложения.',
                       'steps': ['Создайте docs/stage8-runtime-baseline.md.',
                                 'Запишите точную директорию запуска, Python version, команду Uvicorn и обязательные '
                                 'environment variables без secret values.',
                                 'Запустите PostgreSQL, Redis и API без Docker.',
                                 'Проверьте /health, /ready и один защищённый API-сценарий.',
                                 'Сохраните PID API, listening port и три строки логов одного request с request_id.',
                                 'Выполните graceful shutdown и зафиксируйте порядок startup/shutdown events.',
                                 'Запустите pytest -q два раза и запишите число прошедших tests.',
                                 'Создайте Git-коммит docs: record deployable runtime baseline.'],
                       'result': 'Готово, если документ позволяет повторить запуск без IDE, содержит '
                                 'health/readiness, PID, port, logs, graceful shutdown и зелёный test baseline.'}],
    '00 - План обучения.md': [{'title': 'Зафиксируйте baseline Async StudyHub перед контейнеризацией',
                            'task': 'До Docker сохраните один воспроизводимый запуск Async StudyHub в Linux-подобной '
                                    'среде. Baseline нужен, чтобы отличать инфраструктурную ошибку от изменения '
                                    'приложения.',
                            'steps': ['Создайте docs/stage8-runtime-baseline.md.',
                                      'Запишите точную директорию запуска, Python version, команду Uvicorn и '
                                      'обязательные environment variables без secret values.',
                                      'Запустите PostgreSQL, Redis и API без Docker.',
                                      'Проверьте /health, /ready и один защищённый API-сценарий.',
                                      'Сохраните PID API, listening port и три строки логов одного request с '
                                      'request_id.',
                                      'Выполните graceful shutdown и зафиксируйте порядок startup/shutdown events.',
                                      'Запустите pytest -q два раза и запишите число прошедших tests.',
                                      'Создайте Git-коммит docs: record deployable runtime baseline.'],
                            'result': 'Готово, если документ позволяет повторить запуск без IDE, содержит '
                                      'health/readiness, PID, port, logs, graceful shutdown и зелёный test '
                                      'baseline.'}],
}
