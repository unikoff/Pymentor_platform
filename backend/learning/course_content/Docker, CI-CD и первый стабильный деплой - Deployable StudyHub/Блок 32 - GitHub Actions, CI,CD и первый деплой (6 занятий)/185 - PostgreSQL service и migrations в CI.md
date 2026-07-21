## 185. PostgreSQL service и migrations в CI

### Цель

Запускать integration tests на настоящей PostgreSQL и проверять историю migrations.

### Почему тема появляется сейчас

Unit tests недостаточно проверяют database-specific поведение и чистое восстановление schema.

### Основное содержание

- service container PostgreSQL;
- test DATABASE_URL;
- health options;
- separate test database;
- `alembic upgrade head`;
- integration tests;
- изоляция данных между tests;
- ошибка migration как блокирующий gate;

### Практика StudyHub

Добавить PostgreSQL service, применить migrations и выполнить API integration tests в CI.

### Визуальная и интерактивная подача

CI runner с вложенным database service; timeline ready → migrate → test.

### Результат занятия

Pipeline доказывает, что проект восстанавливается на чистой PostgreSQL.

### Граница занятия

Не подключать production database к CI.

### Критерии готовности

- ученик объясняет главную модель своими словами;
- запускает минимальный пример или инфраструктурный сценарий;
- изменяет один параметр и предсказывает результат;
- проверяет успешный и ошибочный путь;
- фиксирует воспроизводимую проверку, тест или runbook;
- делает один осмысленный Git-коммит;
