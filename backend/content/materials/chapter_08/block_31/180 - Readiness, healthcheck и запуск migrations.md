## 180. Readiness, healthcheck и запуск migrations

### Цель

Не полагаться на факт запуска process и дождаться реальной готовности database.

### Почему тема появляется сейчас

Compose запускает services, но порядок старта не гарантирует готовность зависимости.

### Основное содержание

- startup order;
- healthcheck PostgreSQL;
- service healthy;
- `depends_on` и его границы;
- migration service/job;
- `alembic upgrade head`;
- idempotent startup;
- ошибка migration и остановка deployment;

### Практика StudyHub

Добавить healthcheck db и отдельный migration service, который завершается до запуска API.

### Визуальная и интерактивная подача

Timeline db started → db healthy → migrations → API ready; CodeSequence запуска stack.

### Результат занятия

Чистая database автоматически получает schema до первого API request.

### Граница занятия

Не помещать бесконтрольный `create_all` в startup приложения.

### Критерии готовности

- ученик объясняет главную модель своими словами;
- запускает минимальный пример или инфраструктурный сценарий;
- изменяет один параметр и предсказывает результат;
- проверяет успешный и ошибочный путь;
- фиксирует воспроизводимую проверку, тест или runbook;
- делает один осмысленный Git-коммит;

<!-- youtube: -->
