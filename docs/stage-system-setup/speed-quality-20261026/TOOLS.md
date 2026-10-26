# Передача одного задания

Автор: Luna Implementer `01a17977-8995-7572-8d6d-a4fa8e18b020`; root сохраняет отчёт, поскольку файл не входил в write scope исполнителя.

Изменены `scripts/build_dispatch.py` и `../upgrade-20261026/test_core_dispatch.py`. CLI требует `--lesson-id` и JSON назначения с `lesson_id`, `change`, `scope`, `acceptance`. Список/пустой/несовпадающий ID и пустые обязательные поля отвергаются. Это проверка структуры задания, не семантический анализ произвольного текста scope.

Сохранены registered native roles, проверка actual effective pool/high и запрет перезаписи входов. Payload ставит содержательное исправление прежде повторных чтений/проверок. Нет spawn, daemon, policy mutation или нового оркестратора.

Проверки автора: четыре regression-теста PASS, включая CLI обоих stages, policy и защиту файлов; Python compile PASS. Production helper предназначен для закреплённых Sol Web/high ролей и корректно отказывает при Luna-only policy. Luna-only относится к выполнению текущего обновления; глобальные defaults не менялись. Реальные занятия не запускались.
