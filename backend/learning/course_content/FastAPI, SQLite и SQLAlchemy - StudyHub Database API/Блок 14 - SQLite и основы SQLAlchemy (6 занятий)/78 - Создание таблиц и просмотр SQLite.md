# 78. Создание таблиц и просмотр SQLite

## Паспорт занятия

- **Блок:** 14 · SQLite и основы SQLAlchemy
- **Проект:** StudyHub Database API
- **Продолжительность:** 75–90 минут
- **До занятия:** Base и TaskModel существуют в Python, но таблица `tasks` ещё не создана в файле базы.
- **Результат:** Ученик материализует metadata через `create_all`, читает DDL и проверяет физическую таблицу через SQLite-каталог.
- **Новые термины:** `metadata`, `DDL`, `CREATE TABLE`, `create_all`, `sqlite_master`, `PRAGMA`, `idempotency`, `migration`

## Маршрут занятия

Понять проблему → увидеть точную модель → предсказать поведение → запустить минимальный пример → изменить проект → проверить результат → найти ошибку → объяснить решение.

## 1. Metadata и физическая схема

`Base.metadata` хранит Python-описание таблицы. Пока SQLAlchemy не отправит DDL через Engine, файл SQLite может не содержать `tasks`.

Материализация схемы — переход от декларативного описания к реальным объектам базы.

```text
TaskModel class
    ↓ registration
Base.metadata
    ↓ create_all(engine)
CREATE TABLE tasks
    ↓
studyhub.db
```

### Задание

До запуска `create_all` проверьте `Base.metadata.tables` и отдельно список таблиц SQLite. Сравните результаты.

## 2. Скрипт create_tables

Скрипт импортирует модели, получает общий Base и Engine, затем явно вызывает `create_all`. Точка запуска защищена условием `if __name__ == "__main__"`.

```python
from app import models
from app.database import Base, engine

def create_tables() -> None:
    Base.metadata.create_all(bind=engine)

if __name__ == "__main__":
    create_tables()
```

### Задание

Запустите модуль через `python -m scripts.create_tables`. Объясните, зачем импортируется `models`, хотя имя далее не используется.

## 3. Регистрация до DDL

Declarative class добавляет Table в metadata только при выполнении модуля. Если `models.py` не импортирован, `create_all` честно обработает пустую metadata и ничего не создаст.

Это типичная ошибка порядка импортов, а не проблема SQLite.

```python
from app.database import Base, engine

print(Base.metadata.tables.keys())
Base.metadata.create_all(bind=engine)
```

### Задание

Найдите причину пустого результата и исправьте код минимальным изменением.

<details>
<summary>Ориентир для проверки</summary>

Добавить `from app import models` до проверки metadata.

</details>

## 4. Чтение DDL в echo-логе

`echo=True` показывает `PRAGMA table_info` и `CREATE TABLE`. Сопоставьте `primary_key=True` с `PRIMARY KEY`, `Mapped[str]` с `NOT NULL`, а `String(120)` с типом `VARCHAR(120)`.

Цель не заучить формат вывода, а увидеть связь declarative mapping и SQL.

```text
Mapped[int] + primary_key=True
           ↓
id INTEGER NOT NULL
PRIMARY KEY (id)
```

### Задание

Скопируйте CREATE TABLE из лога и подпишите, какая строка модели породила каждую колонку.

## 5. Повторный запуск

`create_all` проверяет наличие таблиц и не создаёт дубликаты. Повторный запуск приводит к тому же конечному состоянию — это свойство идемпотентности для данной операции.

При этом метод не сравнивает и не мигрирует все отличия существующей схемы.

```python
Base.metadata.create_all(bind=engine)
Base.metadata.create_all(bind=engine)
print("done")
```

### Задание

Запустите скрипт дважды и сравните echo-логи. На каком запуске присутствует CREATE TABLE?

## 6. Проверка через sqlite_master и PRAGMA

Надёжная проверка читает каталог самой базы. `sqlite_master` содержит список объектов, а `PRAGMA table_info(tasks)` возвращает описание колонок.

Такой скрипт воспроизводим и не зависит от графического интерфейса.

```python
from sqlalchemy import text
from app.database import engine

with engine.connect() as connection:
    tables = connection.execute(
        text(
            "SELECT name FROM sqlite_master "
            "WHERE type='table' ORDER BY name"
        )
    ).scalars().all()

    columns = connection.execute(
        text("PRAGMA table_info(tasks)")
    ).mappings().all()

print(tables)
for column in columns:
    print(column["name"], column["type"])
```

### Задание

Проверьте наличие `id`, `title`, `description`, `priority`, `is_done`.

## 7. Граница create_all и Alembic

`create_all` удобен для первой пустой базы и некоторых тестовых сценариев. Он не ведёт историю версий и не преобразует безопасно существующую таблицу при добавлении колонки.

Для эволюции схемы используется Alembic: revision, upgrade и downgrade появятся в блоке 16.

### Задание

Добавьте поле `due_date` только в модель и повторите `create_all`. Проверьте старую таблицу через PRAGMA. Не удаляйте файл базы автоматически.

<details>
<summary>Ориентир для проверки</summary>

Существующая таблица обычно не получит новую колонку. Это демонстрирует необходимость миграций.

</details>

## Итоговый квиз

### Вопрос 1

Что делает `create_all`?

A. Создаёт отсутствующие таблицы
B. Обновляет любую схему
C. Создаёт endpoint

**Ответ:** A. Метод материализует отсутствующие объекты metadata.

### Вопрос 2

Почему импортируется `models`?

A. Для регистрации таблиц
B. Для запуска CORS
C. Для Pydantic JSON

**Ответ:** A. Классы регистрируются при выполнении модуля.

### Вопрос 3

Что показывает `echo=True`?

A. SQL-команды
B. Request body
C. Git history

**Ответ:** A. Engine выводит выполняемый SQL.

### Вопрос 4

Для чего нужен Alembic?

A. Версионировать схему
B. Заменить FastAPI
C. Создавать BaseModel

**Ответ:** A. Migration tool управляет изменениями существующей базы.

## Основные выводы

- Metadata и физическая схема — разные состояния.
- create_all выполняет DDL через Engine.
- Модели импортируются до работы с metadata.
- Echo-лог раскрывает SQLAlchemy SQL.
- SQLite-каталог подтверждает таблицу независимо от ORM.
- Повторный create_all не создаёт дубликат.
- create_all не заменяет Alembic.

## Практическое задание

1. Создайте `scripts/create_tables.py`.
2. Запустите его дважды.
3. Сохраните фрагмент DDL в заметки.
4. Напишите `scripts/inspect_database.py`.
5. Проверьте таблицу и пять колонок.
6. Добавьте в README предупреждение о границе `create_all`.

## Критерии готовности

- [ ] различаю metadata и physical schema
- [ ] объясняю порядок импорта моделей
- [ ] читаю базовый CREATE TABLE
- [ ] проверяю SQLite через каталог
- [ ] не называю create_all миграцией

## Что будет дальше

Следующее занятие создаст первую строку через SQLAlchemy Session и разберёт транзакционный жизненный цикл.

---

### Самопроверка одним предложением

Закройте материал и объясните главную модель занятия без терминов из конспекта. Затем повторите объяснение уже профессиональными словами.
