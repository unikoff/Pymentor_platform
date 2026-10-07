from typing import Any

OVERVIEW_PRACTICE: dict[str, list[dict[str, Any]]] = {
    'План обучения.md': [{'title': 'Зафиксируйте sync baseline перед async-переносом',
                       'task': 'До изменения приложения сохраните один воспроизводимый I/O-сценарий PostgreSQL '
                               'StudyHub. Он станет точкой сравнения, а не поводом объявить async быстрее заранее.',
                       'steps': ['Создайте docs/stage7-sync-baseline.md.',
                                 'Запишите Python version, команды запуска API, PostgreSQL и pytest.',
                                 'Выберите один vertical slice: GET dashboard, который читает database и обращается '
                                 'к локальному recommendation service.',
                                 'Сохраните method, path, success status, response schema и четыре error statuses.',
                                 'Запустите сценарий последовательно не меньше 10 раз и сохраните p50, p95 и число '
                                 'SQL statements.',
                                 'Запустите pytest -q два раза и запишите число прошедших tests.',
                                 'Зафиксируйте один request trace: request id, начало/конец database query и '
                                 'начало/конец external request.',
                                 'Создайте Git-коммит docs: record async migration baseline.'],
                       'result': 'Готово, если baseline содержит одинаковый input, HTTP contract, measurements, SQL '
                                 'count и зелёные tests, по которым можно честно сравнить sync и async версии.'}],
    '00 - План обучения.md': [{'title': 'Зафиксируйте sync baseline перед async-переносом',
                            'task': 'До изменения приложения сохраните один воспроизводимый I/O-сценарий PostgreSQL '
                                    'StudyHub. Он станет точкой сравнения, а не поводом объявить async быстрее '
                                    'заранее.',
                            'steps': ['Создайте docs/stage7-sync-baseline.md.',
                                      'Запишите Python version, команды запуска API, PostgreSQL и pytest.',
                                      'Выберите один vertical slice: GET dashboard, который читает database и '
                                      'обращается к локальному recommendation service.',
                                      'Сохраните method, path, success status, response schema и четыре error '
                                      'statuses.',
                                      'Запустите сценарий последовательно не меньше 10 раз и сохраните p50, p95 и '
                                      'число SQL statements.',
                                      'Запустите pytest -q два раза и запишите число прошедших tests.',
                                      'Зафиксируйте один request trace: request id, начало/конец database query и '
                                      'начало/конец external request.',
                                      'Создайте Git-коммит docs: record async migration baseline.'],
                            'result': 'Готово, если baseline содержит одинаковый input, HTTP contract, measurements, '
                                      'SQL count и зелёные tests, по которым можно честно сравнить sync и async '
                                      'версии.'}],
    'Теория месяца.md': [{'title': 'Нарисуйте timeline одного async request',
                       'task': 'Опишите один request Async StudyHub до написания кода. Нужно отделить Python work, '
                               'I/O wait, Task scheduling, resource lifecycle и transaction boundary.',
                       'steps': ['Создайте docs/stage7-async-model.md.',
                                 'Нарисуйте timeline: router → service → database await → external HTTP await → '
                                 'serialization.',
                                 'Для каждого участка отметьте состояние running, waiting или ready.',
                                 'Отдельно нарисуйте последовательные await и два независимых requests через '
                                 'Task/gather.',
                                 'Добавьте timeout path, cancellation path и database rollback path.',
                                 'Покажите lifespan AsyncClient и request-scoped AsyncSession как разные lifecycles.',
                                 'Зафиксируйте четыре границы: async не ускоряет CPU, одна AsyncSession не делится '
                                 'между concurrent tasks, N+1 не исчезает, pool остаётся ограниченным.'],
                       'result': 'Готово, если по timeline можно объяснить, кто выполняется, кто ждёт, где loop '
                                 'получает управление и какой ресурс должен закрыться при success, timeout и '
                                 'cancellation.'}],
    '00 - Теория месяца.md': [{'title': 'Нарисуйте timeline одного async request',
                            'task': 'Опишите один request Async StudyHub до написания кода. Нужно отделить Python '
                                    'work, I/O wait, Task scheduling, resource lifecycle и transaction boundary.',
                            'steps': ['Создайте docs/stage7-async-model.md.',
                                      'Нарисуйте timeline: router → service → database await → external HTTP await → '
                                      'serialization.',
                                      'Для каждого участка отметьте состояние running, waiting или ready.',
                                      'Отдельно нарисуйте последовательные await и два независимых requests через '
                                      'Task/gather.',
                                      'Добавьте timeout path, cancellation path и database rollback path.',
                                      'Покажите lifespan AsyncClient и request-scoped AsyncSession как разные '
                                      'lifecycles.',
                                      'Зафиксируйте четыре границы: async не ускоряет CPU, одна AsyncSession не '
                                      'делится между concurrent tasks, N+1 не исчезает, pool остаётся ограниченным.'],
                            'result': 'Готово, если по timeline можно объяснить, кто выполняется, кто ждёт, где loop '
                                      'получает управление и какой ресурс должен закрыться при success, timeout и '
                                      'cancellation.'}]
}
