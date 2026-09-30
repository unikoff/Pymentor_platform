from typing import Any

MANUAL_PRACTICE: dict[int, list[dict[str, Any]]] = {
    118: [{'title': 'Создайте таблицу и намеренно нарушьте constraints',
        'task': 'Создайте отдельную учебную таблицу sql_lab_tasks через raw SQL. Она не заменяет рабочую tasks и '
                'должна позволить увидеть гарантии database независимо от Pydantic.',
        'steps': ['Создайте папку sql-lab и файл 118_create_table.sql.',
                  'Добавьте DROP TABLE IF EXISTS sql_lab_tasks, чтобы лабораторию можно было повторить.',
                  'Создайте sql_lab_tasks с id как generated primary key, title VARCHAR(200) NOT NULL, slug '
                  'VARCHAR(120) UNIQUE NOT NULL.',
                  'Добавьте priority INTEGER NOT NULL DEFAULT 1 и CHECK от 1 до 5.',
                  'Добавьте is_done BOOLEAN NOT NULL DEFAULT FALSE и created_at TIMESTAMP NOT NULL DEFAULT '
                  'CURRENT_TIMESTAMP.',
                  'Вставьте одну корректную строку, указав только title и slug, затем прочитайте generated id и '
                  'defaults.',
                  'Отдельно выполните INSERT с title=NULL и зафиксируйте имя нарушенного constraint.',
                  'Отдельно выполните две строки с одинаковым slug и зафиксируйте unique violation.',
                  'Отдельно вставьте priority=9 и зафиксируйте check violation.',
                  'После каждой ожидаемой ошибки убедитесь, что следующая корректная команда выполняется; при '
                  'необходимости завершите aborted transaction через ROLLBACK.',
                  'Создайте docs/sql-constraints-observation.md с таблицей: действие, constraint, текст ошибки, '
                  'состояние transaction.'],
        'result': 'Готово, если корректная строка получает defaults, три неверных INSERT отклоняются разными '
                  'constraints, а лаборатория повторяется из одного SQL-файла без изменения рабочей schema.'}],
    122: [{'title': 'Сравните raw SQL и SQLAlchemy на одинаковых данных',
        'task': 'Создайте sql-lab с четырьмя парами запросов. Каждая пара должна возвращать одинаковый набор '
                'значений, а не просто выглядеть похоже.',
        'steps': ['Создайте sql-lab/122_sql_vs_sqlalchemy.py и sql-lab/122_queries.sql.',
                  'Подготовьте отдельную test database или transaction, которая откатывается после лаборатории.',
                  'Пара 1: SELECT всех открытых tasks с ORDER BY id.',
                  'Пара 2: SELECT одной task по id через parameter.',
                  'Пара 3: UPDATE priority одной task с RETURNING id и priority.',
                  'Пара 4: DELETE тестовой task с RETURNING id.',
                  'Для raw SQL используйте sqlalchemy.text и отдельный params, без f-строк с пользовательскими '
                  'значениями.',
                  'Для SQLAlchemy 2.x используйте select, update и delete statements.',
                  'Нормализуйте результаты в списки словарей и сравните assert raw_result == orm_result для каждой '
                  'пары.',
                  'Включите SQL logging и скопируйте сгенерированный SQL в docs/sql-orm-map.md.',
                  'Для каждой пары объясните различие ORM object, Row и scalar value.',
                  'Создайте test, который запускает все четыре сравнения.'],
        'result': 'Готово, если четыре SQL/SQLAlchemy-пары дают одинаковые результаты, parameters отделены от '
                  'statements, а документ показывает фактический SQL, а не предполагаемый.'}]
}
