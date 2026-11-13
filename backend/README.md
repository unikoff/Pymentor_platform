# Учебные ресурсы

Рабочий Core расположен в [services/core-api](../services/core-api/README.md).
API запускается через `pymentor_core.app.asgi:create_app --factory`, worker —
через `python -m pymentor_core.app.worker`. Зависимости и Dockerfile находятся
в `services/core-api`; прежние Passenger/SQLite/cron-обёртки удалены.

В этом каталоге сохраняются `content/materials` и `content/practice/helpers.py`.
Путь `backend` в `PYTHONPATH` нужен для пакета `content`, а не для старого запуска.
SQLite в учебных примерах относится к содержанию курса.

Локальные `.env`, базы, backup/log/lock/output не являются частью runtime image.
Очистка исходников не удаляет такие файлы или production-данные. Не удаляйте
каталог целиком: в нём находятся материалы курса и могут находиться архивы.
