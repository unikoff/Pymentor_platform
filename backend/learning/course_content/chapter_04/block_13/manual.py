from typing import Any

MANUAL_PRACTICE: dict[int, list[dict[str, Any]]] = {
    73: [{'title': 'Прочитайте request и измените response',
       'task': 'Добавьте один FastAPI endpoint, который одновременно читает Header и Cookie, а затем устанавливает '
               'служебный response header и новую cookie.',
       'steps': ['Создайте GET /context.',
                 "Добавьте параметр request_id: str | None = Header(default=None, alias='X-Request-ID').",
                 'Добавьте параметр last_module: str | None = Cookie(default=None).',
                 'Добавьте параметр response: Response.',
                 "Установите response.headers['X-StudyHub-Version'] = '4'.",
                 "Установите cookie last_module со значением database, httponly=True и samesite='lax'.",
                 'Верните JSON с ключами request_id и previous_module, где previous_module получает входную cookie.',
                 'Первый request отправьте без Header и Cookie: оба поля JSON должны быть null.',
                 'Второй request отправьте с X-Request-ID: req-17 и cookie last_module=fastapi.',
                 'Проверьте status 200, JSON, X-StudyHub-Version и Set-Cookie.'],
       'result': 'Готово, если endpoint корректно работает с отсутствующими значениями, читает переданные Header и '
                 'Cookie, а response содержит точный header и безопасную cookie.'}],
    74: [{'title': 'Добавьте наблюдаемый middleware и точный CORS',
       'task': 'Настройте общий слой для каждого request и разрешите только один локальный frontend origin. Не '
               'используйте wildcard вместе с credentials.',
       'steps': ['Создайте HTTP middleware, который до call_next получает или создаёт request id.',
                 'Измерьте время через time.perf_counter и после call_next добавьте X-Process-Time с шестью знаками '
                 'после точки.',
                 'Добавьте X-Request-ID в каждый response.',
                 'Настройте CORSMiddleware для origin http://localhost:5173.',
                 'Разрешите методы GET, POST, PATCH, DELETE и OPTIONS.',
                 'Разрешите headers Content-Type, Authorization и X-Request-ID.',
                 'Отправьте обычный GET с X-Request-ID и проверьте оба response headers.',
                 'Отправьте preflight OPTIONS с Origin http://localhost:5173 и Access-Control-Request-Method: POST.',
                 'Повторите OPTIONS с Origin http://evil.example и убедитесь, что разрешающий CORS header '
                 'отсутствует.',
                 'Добавьте TestClient-тесты для request id и разрешённого origin.'],
       'result': 'Готово, если любой endpoint получает X-Request-ID и X-Process-Time, разрешённый origin проходит '
                 'preflight, а посторонний origin не получает разрешение.'}]
}
