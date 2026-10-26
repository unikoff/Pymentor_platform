from typing import Any

MANUAL_PRACTICE: dict[int, list[dict[str, Any]]] = {
    178: [{'title': 'Подключите PostgreSQL service внутри Compose',
        'task': 'Добавьте database service и переведите API на внутренний hostname db. Localhost внутри '
                'API-container использовать запрещено.',
        'steps': ['Создайте compose.yaml с services api и db.',
                  'Для db используйте официальный PostgreSQL image с зафиксированным major version.',
                  'Передайте POSTGRES_DB, POSTGRES_USER и POSTGRES_PASSWORD через environment или env-file для '
                  'development.',
                  'Не помещайте production credentials в compose file.',
                  'Для api задайте DATABASE_URL с hostname db и container port 5432.',
                  'Опубликуйте наружу только API port; PostgreSQL port публикуйте лишь при обоснованной local '
                  'необходимости.',
                  'Запустите docker compose up --build.',
                  'Проверьте logs db до сообщения о готовности принимать connections.',
                  'Выполните SELECT 1 из API-container.',
                  'Откройте endpoint, который читает PostgreSQL.',
                  'Замените db на localhost в отдельном controlled run и зафиксируйте failure.',
                  'Верните правильный URL и добавьте docs/compose-network.md.'],
        'result': 'Готово, если API соединяется с PostgreSQL по db:5432, localhost failure воспроизводится, секреты '
                  'не зафиксированы в Git, а endpoint читает real database.'}],
    181: [{'title': 'Добавьте Redis service без преждевременного cache',
        'task': 'Подключите Redis как инфраструктурную зависимость и readiness signal, не изменяя business contract '
                'и не делая Redis source of truth.',
        'steps': ['Добавьте service redis в compose.yaml с зафиксированным major tag.',
                  'Не публикуйте Redis port на host без необходимости.',
                  'Добавьте REDIS_URL=redis://redis:6379/0 в environment API.',
                  'Добавьте healthcheck redis-cli ping.',
                  'Создайте диагностическую async function ping_redis.',
                  'Расширьте /ready полем redis со status ok или unavailable по принятому контракту.',
                  'Не записывайте users, tasks или tokens в Redis в этом занятии.',
                  'Остановите redis service и проверьте readiness behavior.',
                  'Снова запустите redis и проверьте автоматическое восстановление readiness.',
                  'Добавьте tests readiness с fake Redis dependency.',
                  'Запишите в docs/redis-role.md, почему PostgreSQL остаётся source of truth.'],
        'result': 'Готово, если Redis доступен по service hostname, healthcheck работает, controlled outage '
                  'наблюдаем, HTTP business contract не изменён, а product data остаются в PostgreSQL.'}],
    182: [{'title': 'Проверьте полный local Compose stack',
        'task': 'Соберите one-command environment из API, PostgreSQL, Redis, migration job, healthchecks и named '
                'volume.',
        'steps': ['Приведите compose.yaml к services db, redis, migrate и api.',
                  'Добавьте named volume pgdata.',
                  'Настройте db и redis healthchecks.',
                  'Настройте migrate как одноразовый service, выполняющий alembic upgrade head.',
                  'API должен стартовать только после healthy dependencies и successful migration по возможностям '
                  'используемой Compose schema.',
                  'Создайте .env.example без реальных secrets.',
                  'Выполните docker compose down -v для controlled clean bootstrap.',
                  'Запустите docker compose up --build и проверьте состояние всех services.',
                  'Выполните registration/login, create/read/update Task и Redis readiness.',
                  'Выполните docker compose down без -v, затем up и проверьте сохранность Task.',
                  'Сделайте backup перед controlled down -v и восстановите test data.',
                  'Добавьте README quick start, logs, reset и recovery commands.',
                  'Проверьте весь сценарий из чистого clone.'],
        'result': 'Готово, если одна команда поднимает clean stack, migrations выполняются до traffic, data '
                  'переживают recreate, reset и restore контролируемы, а другой разработчик проходит quick start.'}]
}
