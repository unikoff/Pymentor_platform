from typing import Any

MANUAL_PRACTICE: dict[int, list[dict[str, Any]]] = {
    154: [{'title': 'Сделайте первый request через AsyncClient',
        'task': 'Поднимите локальный mock-service и выполните реальный неблокирующий HTTP request. Публичный '
                'интернет не используется.',
        'steps': ['Создайте tests/mock_recommendation_app.py с endpoint GET /recommendations/{user_id}.',
                  'Endpoint должен возвращать user_id и список из двух рекомендаций.',
                  'Создайте async-lab/154_httpx_client.py.',
                  'Используйте httpx.ASGITransport либо локально запущенный mock-service.',
                  'Создайте httpx.AsyncClient с base_url и явным timeout.',
                  'Выполните await client.get, затем raise_for_status и проверьте JSON.',
                  'Закройте client через async with.',
                  'Добавьте test success и test upstream 404.',
                  'Добавьте trace request:start, response:status и client:closed.',
                  'Проверьте, что test не зависит от внешней сети.'],
        'result': 'Готово, если AsyncClient получает детерминированный JSON от local mock, 404 проверяется отдельно, '
                  'client закрывается, а tests работают offline.'}],
    156: [{'title': 'Передайте AsyncClient через dependency',
        'task': 'Вынесите HTTP-client из endpoint и service constructor. Конфигурация и test replacement должны '
                'находиться на границе dependency.',
        'steps': ['Создайте app/integrations/recommendations.py с RecommendationService.',
                  'Service принимает AsyncClient через constructor и не создаёт client самостоятельно.',
                  'Создайте Settings с base_url и timeout для локального recommendation service.',
                  'Создайте FastAPI dependency get_recommendation_service.',
                  'Endpoint GET /api/v1/dashboard получает service через Depends.',
                  'Service выполняет await client.get и возвращает безопасную domain structure.',
                  'В test переопределите dependency готовым fake service.',
                  'Добавьте test, что endpoint не выполняет network request при override.',
                  'Добавьте integration test с HTTPX MockTransport либо ASGITransport.',
                  'Проверьте success, 404 mapping и timeout mapping.'],
        'result': 'Готово, если endpoint не знает создание AsyncClient, service тестируется отдельно, dependency '
                  'override исключает сеть, а integration test проверяет реальный HTTPX contract.'}],
    157: [{'title': 'Управляйте AsyncClient через lifespan',
        'task': 'Создайте один shared AsyncClient на lifecycle приложения. Запрещено создавать новый connection pool '
                'внутри каждого request.',
        'steps': ['Создайте asynccontextmanager lifespan в app/main.py.',
                  'На startup создайте AsyncClient с base_url, timeout и limits из Settings.',
                  'Сохраните client в app.state либо в отдельном resource container.',
                  'На shutdown выполните await client.aclose().',
                  'Dependency должна получать уже созданный client и не закрывать его после request.',
                  'Добавьте counters created_clients и closed_clients только для test environment.',
                  'Выполните через один test client не меньше трёх dashboard requests.',
                  'Проверьте created_clients == 1 до shutdown.',
                  'После выхода из lifespan проверьте closed_clients == 1.',
                  'Добавьте test startup failure либо безопасного отсутствия resource при неверной конфигурации.'],
        'result': 'Готово, если серия requests использует один AsyncClient, shutdown закрывает его ровно один раз, а '
                  'lifecycle воспроизводится в tests.'}],
    158: [{'title': 'Соберите aggregating endpoint с partial response',
        'task': 'Создайте endpoint, который независимо получает локальный профиль, статистику из database и '
                'рекомендации из mock-service с ограниченным timeout.',
        'steps': ['Создайте GET /api/v1/dashboard/me.',
                  'Получите current user обычной dependency до запуска concurrent operations.',
                  'Создайте отдельные coroutine load_statistics и load_recommendations.',
                  'Запустите независимые operations через create_task или TaskGroup по выбранному контракту.',
                  'Для внешнего request установите timeout.',
                  'Опишите policy: database error отменяет response, recommendation timeout даёт partial response.',
                  'Верните Pydantic schema profile, statistics, recommendations и partial.',
                  'Добавьте request id во все logs operations.',
                  'Создайте tests success, recommendation timeout, recommendation 500 и database failure.',
                  'Используйте local mock transport и управляемые delays, без реального sleep в большинстве tests.',
                  'Сравните elapsed последовательного и concurrent сценария на одинаковых delays.'],
        'result': 'Готово, если endpoint сохраняет обязательные local data, безопасно деградирует при optional '
                  'upstream failure, tests детерминированы, а concurrency подтверждена timeline и measurement.'}]
}
