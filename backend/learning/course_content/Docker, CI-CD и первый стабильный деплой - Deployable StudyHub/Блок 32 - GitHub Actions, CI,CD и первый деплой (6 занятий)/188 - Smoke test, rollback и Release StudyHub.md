## 188. Smoke test, rollback и Release StudyHub

### Цель

Завершить этап процедурой проверки и возврата к предыдущей версии.

### Почему тема появляется сейчас

Deployment без проверки и rollback остаётся одноразовым ручным экспериментом.

### Основное содержание

- smoke test после deploy;
- health и readiness;
- проверка migrations;
- ключевой API scenario;
- release notes;
- предыдущий image tag;
- rollback;
- post-deploy checklist и incident note;

### Практика StudyHub

Выпустить версию, намеренно сломать некритичный сценарий в следующем tag, обнаружить smoke test и вернуть предыдущий image.

### Визуальная и интерактивная подача

Две дорожки deploy success/rollback; финальная release checklist; контрольная карта этапа.

### Результат занятия

Создан `Deployable StudyHub`: Compose, CI, image, deployment, healthcheck и проверенный rollback.

### Граница занятия

Blue-green, canary и zero-downtime migrations остаются дальнейшими темами.

### Критерии готовности

- ученик объясняет главную модель своими словами;
- запускает минимальный пример или инфраструктурный сценарий;
- изменяет один параметр и предсказывает результат;
- проверяет успешный и ошибочный путь;
- фиксирует воспроизводимую проверку, тест или runbook;
- делает один осмысленный Git-коммит;

## Контрольная точка блока

- Pull request проходит quality gates, image собирается автоматически, deployment проверяется smoke test и имеет понятную процедуру rollback.
- есть основной успешный сценарий;
- есть ожидаемый сбой и понятная диагностика;
- результат воспроизводится другим человеком;
- README, схема, test matrix или runbook обновлены;
- ученик прослеживает путь данных и ответственность компонентов без подсказки;

---

# Итоговая контрольная точка этапа 8

- запустить StudyHub в Linux-подобной среде без IDE;
- найти process, PID и listening port;
- передать config через environment variables;
- найти request по структурированным логам;
- объяснить healthcheck, readiness и graceful shutdown;
- собрать собственный Docker image;
- объяснить layers, cache и build context;
- запустить container от непривилегированного пользователя;
- поднять API, PostgreSQL и Redis через Compose;
- восстановить schema migrations на чистой database;
- запустить CI с PostgreSQL integration tests;
- собрать и идентифицировать image по commit SHA;
- развернуть конкретную версию без secrets в Git;
- выполнить smoke test и rollback;
- защитить Deployable StudyHub по runbook;

## Что намеренно не входит

- Kubernetes;
- Terraform;
- сложные облачные сети;
- service mesh;
- несколько production clusters;
- blue-green и canary deployment как обязательная практика;
- глубокий Linux administration;
- полноценный observability stack;
- микросервисная архитектура;

## Требования к будущим занятиям TSX

- примерно восемь крупных секций на занятие;
- один `RichHero`, один `KeyTakeaways` и один `PracticeCta`;
- четыре содержательных итоговых вопроса;
- одна доминирующая интерактивная механика на сцену;
- разнообразные схемы, timelines, terminal demos, comparisons, bug hunts и project maps;
- минимальный пример раньше полного проектного фрагмента;
- профессиональные термины объясняются до первого использования;
- архитектура вводится только после наблюдаемой проблемы;
- Markdown остаётся самостоятельной полной версией занятия;
