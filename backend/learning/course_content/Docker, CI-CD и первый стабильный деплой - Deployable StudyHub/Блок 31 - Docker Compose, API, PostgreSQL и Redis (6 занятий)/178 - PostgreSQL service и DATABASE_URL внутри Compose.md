## 178. PostgreSQL service и DATABASE_URL внутри Compose

### Цель

Подключить существующий PostgreSQL StudyHub к containerized database.

### Почему тема появляется сейчас

Сеть понятна, теперь основной проект получает реальную зависимость.

### Основное содержание

- официальный PostgreSQL image;
- database environment variables;
- внутренний port 5432;
- hostname `db`;
- DATABASE_URL для Compose;
- разделение host и container configuration;
- logs database startup;
- проверка connection;

### Практика StudyHub

Добавить `db`, подключить API, выполнить `SELECT 1` и открыть endpoint, читающий PostgreSQL.

### Визуальная и интерактивная подача

Разбор connection URL по средам; BugHunt с localhost внутри API-container.

### Результат занятия

API и PostgreSQL общаются по внутренней Compose-сети.

### Граница занятия

Production database service и managed PostgreSQL не рассматриваются.

### Критерии готовности

- ученик объясняет главную модель своими словами;
- запускает минимальный пример или инфраструктурный сценарий;
- изменяет один параметр и предсказывает результат;
- проверяет успешный и ошибочный путь;
- фиксирует воспроизводимую проверку, тест или runbook;
- делает один осмысленный Git-коммит;
