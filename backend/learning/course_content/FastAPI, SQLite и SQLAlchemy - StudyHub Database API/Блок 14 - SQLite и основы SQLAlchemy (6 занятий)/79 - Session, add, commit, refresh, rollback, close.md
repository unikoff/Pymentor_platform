# 79. Session: add, commit, refresh, rollback, close

## Паспорт занятия

- **Блок:** 14 · SQLite и основы SQLAlchemy
- **Проект:** StudyHub Database API
- **Продолжительность:** 85–100 минут
- **До занятия:** Engine, ORM-модель и физическая таблица `tasks` готовы.
- **Результат:** Ученик создаёт запись через Session, объясняет Unit of Work и состояния объекта, выполняет commit, refresh, rollback и безопасное закрытие.
- **Новые термины:** `Session`, `sessionmaker`, `Unit of Work`, `identity map`, `transaction`, `transient`, `pending`, `persistent`, `flush`, `commit`, `refresh`, `rollback`

## Маршрут занятия

Понять проблему → увидеть точную модель → предсказать поведение → запустить минимальный пример → изменить проект → проверить результат → найти ошибку → объяснить решение.

## 1. Роль Session

Session — mutable рабочий контекст ORM. Она отслеживает объекты, собирает изменения в Unit of Work и связывает их с транзакцией.

Engine отвечает за подключение; Session — за последовательный прикладной сценарий работы с ORM-объектами. Это не cookie-session пользователя.

```text
Engine
  ↓ provides connections
Session
  ├── identity map
  ├── Unit of Work
  └── transaction
```

### Задание

Сформулируйте по одному предложению для Engine, Connection и Session.

## 2. Фабрика SessionFactory

`sessionmaker` сохраняет общую конфигурацию и создаёт новые независимые Session. Одна глобальная Session опасна: identity map, failed transaction и незавершённые изменения будут смешиваться между сценариями.

```python
from sqlalchemy.orm import sessionmaker

SessionFactory = sessionmaker(
    bind=engine,
    autoflush=False,
    expire_on_commit=False,
)
```

### Задание

Объясните, почему `SessionFactory` можно хранить глобально, а созданную `session` — нельзя делить между запросами.

## 3. Состояния объекта

Новый `TaskModel` сначала transient: Session о нём не знает. После `add` объект pending. После flush/commit он становится persistent и связан с конкретной строкой.

После закрытия Session объект может стать detached.

```python
task = TaskModel(title="Session", priority=4)
session.add(task)
session.commit()
session.refresh(task)
```

### Разбор по шагам

1. После конструктора `task.id is None`.
2. `add` включает объект в Unit of Work.
3. `commit` вызывает flush и фиксирует транзакцию.
4. `refresh` перечитывает строку и актуализирует атрибуты.

### Задание

До запуска предскажите `task.id` на каждом шаге.

## 4. add, flush и commit

`add` регистрирует изменение. `flush` отправляет SQL внутри текущей транзакции, но ещё допускает rollback. `commit` фиксирует транзакцию.

Это разные операции. Ошибка «я вызвал add, значит всё сохранено» приводит к потерянным данным.

```python
session.add(task)
session.flush()
print(task.id)
session.commit()
```

### Задание

После flush выполните rollback и проверьте, существует ли строка в новой Session.

## 5. refresh и server-generated values

База может сформировать primary key и defaults. `refresh(task)` выполняет чтение связанной строки и синхронизирует объект.

В учебной конфигурации шаг показан явно, чтобы ученик видел направление данных от SQLite обратно к Python.

```python
session.add(task)
session.commit()
session.refresh(task)

print(task.id)
print(task.is_done)
```

### Задание

Объясните, почему `refresh` не создаёт новую строку.

## 6. Ошибка и rollback

После ошибки flush/commit текущая транзакция не может продолжаться. `rollback` отменяет незавершённые изменения и возвращает Session в рабочее состояние.

Исключение не нужно скрывать. На этом уроке после cleanup оно передаётся выше; конкретный `IntegrityError` будет в блоке 15.

```python
try:
    session.add(task)
    session.commit()
except Exception:
    session.rollback()
    raise
```

### Задание

Намеренно создайте ошибочную запись, выполните rollback, затем той же Session сохраните корректную запись.

## 7. close и контекстный менеджер

`close` завершает рабочий контекст и освобождает connection. Контекстный менеджер гарантирует cleanup даже при исключении, но не выполняет commit автоматически.

Транзакционная граница остаётся явной.

```python
with SessionFactory() as session:
    task = TaskModel(
        title="Первая ORM-задача",
        priority=4,
    )
    session.add(task)
    session.commit()
    session.refresh(task)
    print(task.id)
```

### Задание

Перепишите ручной `session = ...; try/finally` через `with` и сравните читаемость.

## Итоговый квиз

### Вопрос 1

Какова роль Session?

A. Управлять ORM Unit of Work
B. Хранить cookie
C. Создавать app

**Ответ:** A. Session отслеживает ORM-состояние и транзакцию.

### Вопрос 2

Что делает `add`?

A. Регистрирует объект
B. Завершает commit
C. Закрывает Engine

**Ответ:** A. Объект становится pending.

### Вопрос 3

Зачем `refresh`?

A. Перечитать строку
B. Создать таблицу
C. Удалить модель

**Ответ:** A. Объект получает актуальные database values.

### Вопрос 4

Что требуется после failed commit?

A. rollback
B. новый Base
C. middleware

**Ответ:** A. Rollback завершает неуспешную транзакцию.

## Основные выводы

- Session — ORM-контекст одного последовательного сценария.
- sessionmaker создаёт новые Session.
- Объекты проходят transient, pending и persistent states.
- add, flush и commit различаются.
- refresh синхронизирует объект с базой.
- Ошибка транзакции требует rollback.
- Контекстный менеджер гарантирует close.

## Практическое задание

1. Добавьте `SessionFactory`.
2. Создайте `scripts/create_task.py`.
3. Выведите `task.id` до add, после add, после flush и refresh.
4. Проверьте rollback.
5. Убедитесь, что Session закрывается через `with`.

## Критерии готовности

- [ ] различаю Session и Engine
- [ ] объясняю Unit of Work
- [ ] понимаю flush против commit
- [ ] восстанавливаю Session через rollback
- [ ] закрываю ресурс гарантированно

## Что будет дальше

Последнее занятие блока выдаст отдельную Session каждому FastAPI-запросу через dependency `get_db`.

---

### Самопроверка одним предложением

Закройте материал и объясните главную модель занятия без терминов из конспекта. Затем повторите объяснение уже профессиональными словами.
