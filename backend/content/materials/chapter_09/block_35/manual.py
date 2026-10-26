from typing import Any

MANUAL_PRACTICE: dict[int, list[dict[str, Any]]] = {
    206: [{'title': 'Интегрируйте cache, rate limit и background notification',
        'task': 'Соберите реальные Redis-функции блока в одном измеримом vertical slice. PostgreSQL остаётся source '
                'of truth, а Redis failure имеет документированный fallback.',
        'steps': ['Создайте CatalogCache service с явным namespace, serialization и TTL.',
                  'Добавьте cache-aside для GET /api/v1/catalog с key, включающим filters, page и page_size.',
                  'Добавьте query counter и measurement первого и второго request.',
                  'После successful publish, update или delete выполняйте invalidation только после commit.',
                  'Создайте один rate-limited endpoint учебного уведомления с HTTP 429 и Retry-After.',
                  'Добавьте mock notification через FastAPI BackgroundTasks только после successful enrollment '
                  'commit.',
                  'Не используйте BackgroundTasks для критической или долгой работы.',
                  'Создайте fake Redis или isolated Redis fixture.',
                  'Добавьте tests cache miss, hit, TTL expiration, invalidation, Redis unavailable fallback, 429 и '
                  'reset window.',
                  'Добавьте tests background scheduled after commit, not scheduled after rollback и background '
                  'failure log.',
                  'Остановите Redis в controlled integration scenario и проверьте, что permanent LMS data доступны.',
                  'Сохраните before/after latency и SQL count в docs/redis-evidence.md.'],
        'result': 'Готово, если второй catalog request не выполняет SQL до TTL, write инвалидирует cache после '
                  'commit, rate limit возвращает 429, background action не влияет на transaction, а Redis outage не '
                  'уничтожает LMS data.'}]
}
