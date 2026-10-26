from typing import Any

MANUAL_PRACTICE: dict[int, list[dict[str, Any]]] = {
    184: [{'title': 'Создайте первый GitHub Actions workflow',
        'task': 'Добавьте независимый CI-runner, который проверяет format, lint и tests для каждого pull request.',
        'steps': ['Создайте .github/workflows/ci.yml.',
                  'Настройте события pull_request и push для main.',
                  'Добавьте permissions contents: read.',
                  'Создайте job quality на ubuntu runner.',
                  'Добавьте checkout и setup-python с той же major/minor version, что в Dockerfile.',
                  'Включите cache dependencies средствами setup action либо выбранного package manager.',
                  'Установите project dependencies только из зафиксированного dependency file.',
                  'Запустите formatter в check mode, затем linter, затем unit tests.',
                  'Создайте branch с намеренной formatting error и получите red run.',
                  'Исправьте formatting, затем добавьте failing test и проверьте остановку на test step.',
                  'Исправьте test и добейтесь green run.',
                  'Сохраните ссылки на три runs в docs/ci-first-workflow.md.'],
        'result': 'Готово, если pull request автоматически проходит три quality gates, два controlled failures видны '
                  'в logs, а после исправления run становится green.'}],
    185: [{'title': 'Запустите PostgreSQL migrations и integration tests в CI',
        'task': 'Расширьте workflow настоящим PostgreSQL service. CI должен доказать восстановление schema на чистой '
                'database.',
        'steps': ['Добавьте PostgreSQL service в integration job с отдельными test credentials.',
                  'Добавьте health options через pg_isready.',
                  'Передайте TEST_DATABASE_URL только из job environment.',
                  'Не используйте production secrets и production database.',
                  'После установки dependencies дождитесь healthy service.',
                  'Выполните alembic upgrade head.',
                  'Проверьте alembic current.',
                  'Запустите API integration tests против test database.',
                  'Добавьте отдельную проверку clean migration на вторую disposable database либо schema.',
                  'Намеренно сломайте одну migration в branch и получите red gate.',
                  'Верните migration и добейтесь green integration job.',
                  'Проверьте изоляцию test data между test cases.',
                  'Обновите docs/ci-database.md с startup timeline и failure evidence.'],
        'result': 'Готово, если CI поднимает чистую PostgreSQL, ждёт readiness, применяет migrations и запускает '
                  'integration tests, а broken migration блокирует pipeline.'}],
    187: [{'title': 'Разверните конкретный image tag без secrets в Git',
        'task': 'Выполните первый учебный deployment одного FastAPI-монолита. Deployment должен использовать '
                'проверенный immutable image и external production configuration.',
        'steps': ['Выберите учебный deployment host и зафиксируйте его ограничения в docs/deployment-target.md.',
                  'Создайте production environment отдельно от repository.',
                  'Добавьте DATABASE_URL, SECRET_KEY, REDIS_URL, APP_ENV и LOG_LEVEL через secret/config interface '
                  'платформы.',
                  'Не используйте .env из repository как production secret store.',
                  'Выберите конкретный SHA или release image tag из CI.',
                  'Запустите migrations отдельным pre-deploy command/job до traffic.',
                  'Разверните exact image tag.',
                  'Проверьте startup logs без secret values.',
                  'Откройте внешний /health и /ready.',
                  'Выполните один authenticated read-only request.',
                  'Сохраните deployment timestamp, commit SHA, image digest/tag и migration revision.',
                  'Проверьте repository search на production secrets.',
                  'Создайте docs/deployment-runbook.md с deploy и emergency stop.'],
        'result': 'Готово, если внешний URL отвечает, deployment связан с конкретным commit/image, migrations '
                  'известны, production secrets отсутствуют в Git и запуск воспроизводится по runbook.'}]
}
