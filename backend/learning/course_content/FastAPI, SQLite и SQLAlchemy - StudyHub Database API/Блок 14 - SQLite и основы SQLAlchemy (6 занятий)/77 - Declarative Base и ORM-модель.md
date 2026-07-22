# 77. Declarative Base и ORM-модель

## Паспорт занятия

- **Блок:** 14 · SQLite и основы SQLAlchemy
- **Проект:** StudyHub Database API
- **Продолжительность:** 80–95 минут
- **До занятия:** Работает Engine, но таблицы и ORM-модели ещё не созданы.
- **Результат:** Ученик создаёт `Base` и `TaskModel`, использует SQLAlchemy 2.x typed mapping и разводит ORM-модель с Pydantic-схемами.
- **Новые термины:** `ORM`, `mapping`, `DeclarativeBase`, `registry`, `metadata`, `Mapped`, `mapped_column`, `nullable`, `default`

## Маршрут занятия

Понять проблему → увидеть точную модель → предсказать поведение → запустить минимальный пример → изменить проект → проверить результат → найти ошибку → объяснить решение.

## 1. Зачем нужен mapping

Приложение удобно работает с объектами Python, а реляционная база — со строками таблиц. ORM mapping описывает, как класс `TaskModel` соответствует таблице `tasks`, а его атрибуты — колонкам.

ORM не отменяет реляционную модель. Разработчик всё равно отвечает за ключи, обязательность, транзакции и запросы.

```text
TaskModel object        tasks row
task.id          ↔      id
task.title       ↔      title
task.priority    ↔      priority
```

### Задание

Объясните, что именно ORM автоматизирует, а какие решения всё равно принимает разработчик.

## 2. Один общий DeclarativeBase

`DeclarativeBase` создаёт общий registry и metadata. Все ORM-модели приложения наследуются от одного `Base`, чтобы каталог схемы был целостным.

```python
from sqlalchemy.orm import DeclarativeBase

class Base(DeclarativeBase):
    pass
```

### Задание

Почему отдельный `Base` для каждой модели усложнит `create_all`?

## 3. Mapped и mapped_column

`Mapped[T]` задаёт тип ORM-атрибута. `mapped_column` задаёт параметры физической колонки: primary key, длину строки, nullable и default.

Это современный typed declarative style SQLAlchemy 2.x.

```python
from sqlalchemy.orm import Mapped, mapped_column

class TaskModel(Base):
    __tablename__ = "tasks"

    id: Mapped[int] = mapped_column(primary_key=True)
    title: Mapped[str]
```

### Задание

Подпишите роль каждого элемента объявления `id`.

## 4. Полная модель задачи

Модель переносит знакомую форму задачи в persistence layer. `id` генерируется базой. `title` обязателен. `description` допускает отсутствие. `priority` и `is_done` имеют серверные defaults.

```python
from sqlalchemy import String
from sqlalchemy.orm import Mapped, mapped_column

class TaskModel(Base):
    __tablename__ = "tasks"

    id: Mapped[int] = mapped_column(primary_key=True)
    title: Mapped[str] = mapped_column(String(120))
    description: Mapped[str | None] = mapped_column(
        String(500),
        nullable=True,
    )
    priority: Mapped[int] = mapped_column(default=3)
    is_done: Mapped[bool] = mapped_column(default=False)
```

### Задание

Объясните, почему клиент не передаёт `id` и `is_done` в create-contract.

## 5. nullable, None и default

`nullable=True` разрешает SQL NULL. `default=3` подставляет значение для новой записи, если атрибут не задан. Эти параметры отвечают на разные вопросы.

Пустая строка и `None` также выражают разные состояния. Решение должно соответствовать предметной модели.

### Задание

Сравните `description=` и `description=None`. В каких сценариях различие может быть важно?

## 6. TaskCreate, TaskRead и TaskModel

Pydantic-схемы обслуживают HTTP-контракт, ORM-модель — хранение. `TaskCreate` не содержит служебный `id`; `TaskRead` добавляет поля ответа; `TaskModel` содержит mapped attributes.

Одно имя поля может повторяться, но ответственность классов остаётся разной.

```python
# HTTP input
class TaskCreate(BaseModel):
    title: str
    priority: int = 3

# HTTP output
class TaskRead(TaskCreate):
    id: int
    is_done: bool

# persistence
class TaskModel(Base):
    __tablename__ = "tasks"
    # mapped columns...
```

### Задание

Создайте таблицу ответственности из трёх строк: кто принимает JSON, кто хранит, кто формирует response.

## 7. Регистрация модели в metadata

Declarative class регистрируется при выполнении Python-модуля. Поэтому `models.py` должен быть импортирован до обращения к `Base.metadata.create_all`.

SQLAlchemy не сканирует проект магически. Явная точка загрузки моделей делает поведение воспроизводимым.

```python
from app import models
from app.database import Base

print(list(Base.metadata.tables.keys()))
# ['tasks']
```

### Задание

Уберите импорт `models` и сравните `Base.metadata.tables`. Затем верните импорт.

## Итоговый квиз

### Вопрос 1

Что такое ORM mapping?

A. Соответствие класса и таблицы
B. Копирование JSON
C. Запуск Uvicorn

**Ответ:** A. Mapping связывает объектную и реляционную формы.

### Вопрос 2

Что хранит Base.metadata?

A. Описание таблиц
B. Активную Session
C. HTTP-ответы

**Ответ:** A. Metadata является каталогом схемы.

### Вопрос 3

Как объявляется typed attribute?

A. Mapped[int]
B. Field[int]
C. Depends[int]

**Ответ:** A. Mapped применяется в typed ORM mapping.

### Вопрос 4

Почему TaskCreate не заменяет TaskModel?

A. У них разные границы
B. Pydantic не принимает строки
C. ORM не поддерживает JSON

**Ответ:** A. Одна модель описывает вход API, другая — persistence.

## Основные выводы

- ORM связывает Python-класс с таблицей.
- Все модели используют общий Base.
- Metadata хранит описание зарегистрированной схемы.
- Mapped и mapped_column выполняют разные роли.
- ORM-модель обязана иметь primary key.
- nullable и default не являются синонимами.
- Pydantic и ORM-модели разделяются.

## Практическое задание

1. Добавьте `Base` в `database.py`.
2. Создайте `models.py`.
3. Опишите `TaskModel`.
4. Выведите список metadata tables.
5. Составьте сравнительную таблицу `TaskCreate` / `TaskRead` / `TaskModel`.

## Критерии готовности

- [ ] использую один Base
- [ ] корректно объявляю Mapped-поля
- [ ] объясняю nullable и default
- [ ] различаю HTTP и persistence models

## Что будет дальше

Следующее занятие превратит metadata в физическую таблицу SQLite и проверит её DDL.

---

### Самопроверка одним предложением

Закройте материал и объясните главную модель занятия без терминов из конспекта. Затем повторите объяснение уже профессиональными словами.

<!-- youtube: -->
