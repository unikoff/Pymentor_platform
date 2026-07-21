## 187. Deployment, secrets и production configuration

### Цель

Развернуть один FastAPI-монолит на выбранном учебном хосте без хранения секретов в репозитории.

### Почему тема появляется сейчас

Проверенный image готов; теперь нужно отделить artifact от production config.

### Основное содержание

- deployment environment;
- production secrets;
- DATABASE_URL и SECRET_KEY;
- migration before traffic;
- deploy image tag;
- environment protection на базовом уровне;
- manual approval как вариант;
- логи первого запуска;

### Практика StudyHub

Развернуть конкретный image tag, передать secrets через настройки среды и открыть production `/health`.

### Визуальная и интерактивная подача

Схема registry → host → migrations → API; карточки artifact/config/secrets.

### Результат занятия

StudyHub доступен по внешнему URL и не содержит production secrets в Git.

### Граница занятия

Платформа деплоя не фиксируется как единственно правильная. Kubernetes не используется.

### Критерии готовности

- ученик объясняет главную модель своими словами;
- запускает минимальный пример или инфраструктурный сценарий;
- изменяет один параметр и предсказывает результат;
- проверяет успешный и ошибочный путь;
- фиксирует воспроизводимую проверку, тест или runbook;
- делает один осмысленный Git-коммит;
