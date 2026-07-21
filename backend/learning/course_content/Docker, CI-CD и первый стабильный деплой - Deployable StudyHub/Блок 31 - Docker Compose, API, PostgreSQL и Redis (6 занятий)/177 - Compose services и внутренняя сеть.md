# Блок 31. Docker Compose: API, PostgreSQL и Redis

**Занятия:** 177–182.

**Назначение:** Соединить несколько процессов StudyHub в воспроизводимую локальную систему.

**Результат блока:** Одна Compose-команда поднимает API, PostgreSQL, Redis, migrations и проверки готовности.

## Переход внутри блока

177. Compose services и внутренняя сеть
178. PostgreSQL service и DATABASE_URL внутри Compose
179. Volumes и постоянные данные PostgreSQL
180. Readiness, healthcheck и запуск migrations
181. Redis service как будущая инфраструктура
182. Полный local stack и сценарии восстановления

## 177. Compose services и внутренняя сеть

### Цель

Описать несколько containers декларативно и связать их по именам services.

### Почему тема появляется сейчас

Один API-container уже работает. Следующая проблема — ручной запуск нескольких взаимосвязанных процессов.

### Основное содержание

- compose file;
- service;
- image и build;
- container network;
- service name как hostname;
- ports только для доступа с host;
- environment section;
- `docker compose up` и `down`;

### Практика StudyHub

Создать Compose с API и простым диагностическим service, проверить разрешение имён внутри сети.

### Визуальная и интерактивная подача

Схема host → published port → API network → service; MatchPairs hostnames.

### Результат занятия

Ученик объясняет, почему API обращается к `db`, а не к `localhost`.

### Граница занятия

Пока не добавлять database persistence и migrations.

### Критерии готовности

- ученик объясняет главную модель своими словами;
- запускает минимальный пример или инфраструктурный сценарий;
- изменяет один параметр и предсказывает результат;
- проверяет успешный и ошибочный путь;
- фиксирует воспроизводимую проверку, тест или runbook;
- делает один осмысленный Git-коммит;
