# Блок 32. GitHub Actions, CI/CD и первый деплой

**Занятия:** 183–188.

**Назначение:** Автоматизировать проверки, сборку image и выпуск одной проверенной версии StudyHub.

**Результат блока:** Pull request проходит quality gates, image собирается автоматически, deployment проверяется smoke test и имеет понятную процедуру rollback.

## Переход внутри блока

183. Continuous Integration и quality gates
184. Первый workflow GitHub Actions
185. PostgreSQL service и migrations в CI
186. Автоматическая сборка и tagging Docker image
187. Deployment, secrets и production configuration
188. Smoke test, rollback и Release StudyHub

## 183. Continuous Integration и quality gates

### Цель

Понять pipeline как повторяемую проверку commit, а не как набор магических YAML-команд.

### Почему тема появляется сейчас

Локальный stack воспроизводим. Следующий риск — изменения, которые работают только у автора.

### Основное содержание

- commit, branch и pull request;
- continuous integration;
- job и step;
- quality gate;
- formatter check;
- linter;
- tests;
- fail fast и читаемый результат;

### Практика StudyHub

Составить pipeline на бумаге, намеренно внести formatting error и failing test, затем определить, на каком gate изменение останавливается.

### Визуальная и интерактивная подача

Конвейер commit → format → lint → test; BranchExplorer success/failure.

### Результат занятия

Ученик объясняет, зачем каждая проверка запускается автоматически.

### Граница занятия

CD и deployment пока не добавляются.

### Критерии готовности

- ученик объясняет главную модель своими словами;
- запускает минимальный пример или инфраструктурный сценарий;
- изменяет один параметр и предсказывает результат;
- проверяет успешный и ошибочный путь;
- фиксирует воспроизводимую проверку, тест или runbook;
- делает один осмысленный Git-коммит;
