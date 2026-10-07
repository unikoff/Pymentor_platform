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
    'Теория месяца.md': [{'title': 'Нарисуйте путь commit до running process',
                       'task': 'До написания Dockerfile свяжите source code, image, environment, container process, '
                               'services и deployment в одну схему с отдельными lifecycle.',
                       'steps': ['Создайте docs/stage8-delivery-model.md.',
                                 'Нарисуйте маршрут commit → CI gates → image tag → registry → deployment '
                                 'environment → container process.',
                                 'Отдельно нарисуйте lifecycle image, container, named volume и production secret.',
                                 'Покажите Compose stack api, db, redis и migrate с внутренними hostnames.',
                                 'Добавьте startup timeline db started → healthy → migrations success → API ready → '
                                 'traffic.',
                                 'Добавьте failure paths build error, runtime crash, readiness failure, migration '
                                 'failure и smoke failure.',
                                 'Для smoke failure укажите previous known-good image tag и rollback.',
                                 'Зафиксируйте границы: image не содержит production secrets, volume не является '
                                 'backup, CI не подключается к production database.'],
                       'result': 'Готово, если по схеме можно проследить конкретный commit до процесса, объяснить '
                                 'lifecycle каждого artifact и показать точку остановки при каждом failure.'}],
    '00 - Теория месяца.md': [{'title': 'Нарисуйте путь commit до running process',
                            'task': 'До написания Dockerfile свяжите source code, image, environment, container '
                                    'process, services и deployment в одну схему с отдельными lifecycle.',
                            'steps': ['Создайте docs/stage8-delivery-model.md.',
                                      'Нарисуйте маршрут commit → CI gates → image tag → registry → deployment '
                                      'environment → container process.',
                                      'Отдельно нарисуйте lifecycle image, container, named volume и production '
                                      'secret.',
                                      'Покажите Compose stack api, db, redis и migrate с внутренними hostnames.',
                                      'Добавьте startup timeline db started → healthy → migrations success → API '
                                      'ready → traffic.',
                                      'Добавьте failure paths build error, runtime crash, readiness failure, '
                                      'migration failure и smoke failure.',
                                      'Для smoke failure укажите previous known-good image tag и rollback.',
                                      'Зафиксируйте границы: image не содержит production secrets, volume не '
                                      'является backup, CI не подключается к production database.'],
                            'result': 'Готово, если по схеме можно проследить конкретный commit до процесса, '
                                      'объяснить lifecycle каждого artifact и показать точку остановки при каждом '
                                      'failure.'}]
}
