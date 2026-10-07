from typing import Any

MANUAL_PRACTICE: dict[int, list[dict[str, Any]]] = {
    135: [{'title': 'Снимите baseline медленного запроса',
        'task': 'Создайте воспроизводимый benchmark PostgreSQL до добавления нового индекса. Нельзя делать вывод о '
                'производительности по одному ручному request.',
        'steps': ['Создайте scripts/seed_benchmark.py и сгенерируйте не меньше 20 000 tasks с несколькими owners, '
                  'statuses и created_at.',
                  'Используйте batch insert или другой контролируемый способ, а не 20 000 отдельных commits.',
                  'Выберите запрос StudyHub: owner_id + is_done с сортировкой created_at DESC и LIMIT 20.',
                  'Зафиксируйте точный SQL и parameters.',
                  'Выполните запрос минимум 10 раз после одного прогревочного запуска.',
                  'Сохраните median или устойчивое среднее execution time.',
                  'Выполните EXPLAIN без ANALYZE и зафиксируйте тип scan.',
                  'Проверьте количество строк в таблице и селективность выбранного owner/status.',
                  'Повторите измерение на маленькой таблице и объясните, почему проблема могла быть незаметна.',
                  'Сохраните docs/query-baseline.md: dataset size, SQL, parameters, timings и plan summary.',
                  'Не добавляйте индекс в этом занятии.'],
        'result': 'Готово, если benchmark воспроизводим из scripts, содержит размер данных и несколько измерений, а '
                  'baseline фиксирует конкретный query pattern до оптимизации.'}],
    137: [{'title': 'Сравните execution plan до и после индекса',
        'task': 'Прочитайте реальный PostgreSQL plan для запроса блока 135 и проверьте влияние индекса и '
                'селективности.',
        'steps': ['Сохраните исходный EXPLAIN (ANALYZE, BUFFERS) для baseline query.',
                  'Добавьте индекс блока 136 через Alembic revision и выполните upgrade head.',
                  'Повторите EXPLAIN (ANALYZE, BUFFERS) с теми же parameters.',
                  'Выпишите plan node, estimated rows, actual rows и actual time до и после.',
                  'Проверьте, используется ли Index Scan, Bitmap Index Scan либо planner оставляет Seq Scan.',
                  'Измените owner/status на менее селективные значения и повторите plan.',
                  'Объясните, почему Seq Scan на большой доле таблицы может быть корректным выбором planner.',
                  'Выполните ANALYZE tasks после массовой загрузки данных и повторите измерение.',
                  'Сравните timings минимум по пяти запускам каждого варианта.',
                  'Добавьте regression note, но не фиксируйте жёсткое требование конкретного plan node для любой '
                  'машины.',
                  'Сохраните docs/explain-analysis.md с двумя plans и выводом по гипотезе.'],
        'result': 'Готово, если ученик читает estimated/actual rows и scan type, показывает plan до/после, учитывает '
                  'селективность и не объявляет Seq Scan ошибкой автоматически.'}],
    138: [{'title': 'Создайте и проверьте backup/restore runbook',
        'task': 'Сделайте резервную копию schema и data PostgreSQL StudyHub, восстановите её в отдельную database и '
                'выполните smoke tests.',
        'steps': ['Создайте docs/backup-restore.md с prerequisites и placeholders вместо реальных passwords.',
                  'Вставьте в studyhub_dev контрольные данные с известными counts.',
                  'Создайте custom-format backup через pg_dump с явными host, port, database и output file.',
                  'Проверьте, что backup file создан и имеет ненулевой размер.',
                  'Создайте пустую database studyhub_restore_test с правильным owner.',
                  'Восстановите backup через pg_restore в studyhub_restore_test.',
                  'Проверьте alembic_version, список tables и counts users/tasks/categories.',
                  'Запустите API с DATABASE_URL на restore database и выполните read-only smoke tests.',
                  'Создайте одну новую Task в восстановленной database и убедитесь, что generated sequence/id '
                  'работает.',
                  'Сравните migrations и backup: migrations восстанавливают schema, backup восстанавливает schema и '
                  'data на момент снимка.',
                  'Удалите restore database после сохранения результатов.',
                  'Добавьте script или Make target для повторения backup и restore-check.'],
        'result': 'Готово, если custom backup восстанавливается в отдельную database, counts и sequences корректны, '
                  'API проходит smoke tests, а runbook не содержит secrets.'}],
    139: [{'title': 'Сохраните snapshot курса как MongoDB document',
        'task': 'Проведите изолированный эксперимент с документной моделью. Основной PostgreSQL StudyHub не '
                'переносится на MongoDB.',
        'steps': ['Запустите local MongoDB либо отдельный учебный instance и создайте database studyhub_lab.',
                  'Создайте collection course_snapshots.',
                  'Сформируйте один document: course_id, title, author, modules с вложенными lessons, stats и '
                  'generated_at.',
                  'Вставьте document и прочитайте его по course_id.',
                  'Измените title одного вложенного lesson через точный update path.',
                  'Создайте второй snapshot с дополнительным необязательным полем note и покажите гибкость schema.',
                  'Создайте query по вложенному modules.lessons.title.',
                  'Сравните размер и структуру document с PostgreSQL tables courses/modules/lessons.',
                  'Запишите, какие данные удобно embed, а какие пришлось бы reference из-за размера или независимого '
                  'lifecycle.',
                  'Удалите один snapshot и убедитесь, что PostgreSQL product data не изменились.',
                  'Создайте docs/postgresql-vs-mongodb.md с критериями relations, atomic unit, duplication, '
                  'reporting и constraints.'],
        'result': 'Готово, если MongoDB используется только для отдельного snapshot-сценария, ученик показывает '
                  'nested CRUD и аргументированно объясняет, почему основной relational source of truth остаётся '
                  'PostgreSQL.'}],
    140: [{'title': 'Добавьте Redis TTL и защитите выбор хранилищ',
        'task': 'Проведите финальную практику этапа: используйте Redis только для временного значения, затем '
                'защитите PostgreSQL StudyHub и карту хранения.',
        'steps': ['Запустите Redis и проверьте соединение через redis-cli PING.',
                  'Выберите один временный сценарий: verification code либо cached statistics.',
                  'Создайте namespaced key, например studyhub:verification:user:7.',
                  'Запишите value с TTL 60 секунд.',
                  'Проверьте GET и TTL сразу после записи.',
                  'Измените TTL на короткий в test environment и дождитесь expiration без sleep в unit tests; для '
                  'кода используйте управляемый clock либо Redis test fixture.',
                  'Проверьте cache miss после expiration и повторное получение данных из PostgreSQL, если выбран '
                  'cache-сценарий.',
                  'Удалите Redis keyspace лаборатории и докажите, что users, courses и tasks в PostgreSQL не '
                  'изменились.',
                  'Создайте storage decision matrix: PostgreSQL, MongoDB и Redis; для каждого укажите source of '
                  'truth, data lifetime, relation model и StudyHub use case.',
                  'Запустите полный pytest suite на PostgreSQL два раза.',
                  'Выполните smoke scenario: login, protected CRUD, JOIN statistics и transaction rollback.',
                  'Обновите README: PostgreSQL setup, migrations, seed, benchmark, backup/restore и optional storage '
                  'labs.',
                  'Проверьте git status и создайте commit release: PostgreSQL StudyHub.',
                  'Создайте tag v4.0.0 и GitHub Release с baseline/after measurements и storage decisions.',
                  'Проведите защиту: parameterized SQL, JOIN types, WHERE/HAVING, rollback, index order, EXPLAIN, '
                  'backup vs migration, PostgreSQL/MongoDB/Redis.'],
        'result': 'Готово, если Redis value истекает по TTL без потери product data, PostgreSQL остаётся source of '
                  'truth, tests и smoke scenario зелёные, backup проверен, storage matrix аргументирована, а Release '
                  'v4.0.0 опубликован.'}]
}
