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
}
