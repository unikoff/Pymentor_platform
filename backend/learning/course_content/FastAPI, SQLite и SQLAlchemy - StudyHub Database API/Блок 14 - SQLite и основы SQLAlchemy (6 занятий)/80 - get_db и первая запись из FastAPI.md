# 80. get_db и первая запись из FastAPI

## Паспорт занятия

- **Блок:** 14 · SQLite и основы SQLAlchemy
- **Проект:** StudyHub Database API
- **Продолжительность:** 90–110 минут
- **До занятия:** Отдельный скрипт уже умеет создавать ORM-запись через SessionFactory.
- **Результат:** Ученик реализует POST `/tasks`, который получает Session через dependency, сохраняет TaskModel в SQLite и возвращает TaskRead.
- **Новые термины:** `dependency injection`, `yield dependency`, `resource lifecycle`, `Annotated`, `SessionDep`, `model_dump`, `from_attributes`, `transaction boundary`

## Маршрут занятия

Понять проблему → увидеть точную модель → предсказать поведение → запустить минимальный пример → изменить проект → проверить результат → найти ошибку → объяснить решение.

## 1. Полный путь request → database → response

FastAPI сначала валидирует JSON через `TaskCreate`. Dependency `get_db` создаёт Session. Endpoint преобразует вход в `TaskModel`, фиксирует транзакцию и возвращает объект. `TaskRead` сериализует разрешённые атрибуты.

Это первый полный persistence flow StudyHub.

```text
POST JSON
 ↓
TaskCreate
 ↓
get_db → Session
 ↓
TaskModel
 ↓
INSERT + COMMIT
 ↓
TaskRead
 ↓
201 JSON
```

### Задание

Для каждого перехода назовите тип данных: bytes/JSON, Pydantic object, ORM object, database row, response JSON.

## 2. get_db с yield

Dependency с `yield` владеет ресурсом. До `yield` Session создаётся; значение передаётся endpoint; после завершения запроса контекстный менеджер закрывает Session.

Commit не скрывается внутри provider. Endpoint явно определяет транзакционную границу операции записи.

```python
from collections.abc import Generator
from sqlalchemy.orm import Session

def get_db() -> Generator[Session, None, None]:
    with SessionFactory() as session:
        yield session
```

### Задание

Добавьте временные print до yield и после него. Вызовите endpoint и проверьте порядок сообщений.

## 3. Annotated SessionDep

Alias объединяет Python-тип `Session` и FastAPI metadata `Depends(get_db)`. Реальная Session не создаётся при импорте; provider вызывается для каждого запроса.

```python
from typing import Annotated
from fastapi import Depends
from sqlalchemy.orm import Session

SessionDep = Annotated[Session, Depends(get_db)]
```

### Задание

Сравните сигнатуры `session: Session = Depends(get_db)` и `session: SessionDep`. Что стало короче, а что осталось явным?

## 4. TaskCreate → TaskModel

`TaskCreate` содержит только поля, которыми вправе управлять клиент. `model_dump()` создаёт словарь проверенных данных. Распаковка передаёт их ORM-конструктору.

`id` и `is_done` не берутся из request body.

```python
task_data = payload.model_dump()
task = TaskModel(**task_data)

session.add(task)
session.commit()
session.refresh(task)
```

### Задание

Попробуйте прислать `id` и `is_done`. Проверьте, входят ли они в create-contract и результат `model_dump`.

## 5. TaskRead и from_attributes

Response model читает атрибуты ORM-объекта через `ConfigDict(from_attributes=True)`. Это не превращает Pydantic в ORM; настройка лишь меняет источник данных для валидации/сериализации.

Внутреннее поле не попадёт в ответ, пока его нет в `TaskRead`.

```python
from pydantic import BaseModel, ConfigDict, Field

class TaskCreate(BaseModel):
    title: str = Field(min_length=1, max_length=120)
    description: str | None = None
    priority: int = Field(default=3, ge=1, le=5)

class TaskRead(TaskCreate):
    model_config = ConfigDict(from_attributes=True)

    id: int
    is_done: bool
```

### Задание

Добавьте временное внутреннее поле в ORM-модель и убедитесь, что response JSON его не содержит.

## 6. POST /tasks

Endpoint связывает уже изученные части. Он не создаёт Engine, не хранит глобальную Session и не принимает ORM-модель как request body.

```python
@router.post(
    "",
    response_model=TaskRead,
    status_code=status.HTTP_201_CREATED,
)
def create_task(
    payload: TaskCreate,
    session: SessionDep,
) -> TaskModel:
    task = TaskModel(**payload.model_dump())
    session.add(task)
    session.commit()
    session.refresh(task)
    return task
```

### Задание

Отправьте валидный и невалидный запрос. Для невалидного body докажите по echo-логу, что INSERT не выполнялся.

## 7. Сквозная проверка постоянства

Ответ `201` подтверждает успешный HTTP-сценарий, но durability нужно проверить отдельно. Создайте запись, остановите процесс, прочитайте таблицу inspection-скриптом и запустите API снова.

Новая задача должна получить следующий id. Это доказывает, что состояние находится в SQLite, а не в списке процесса.

```text
POST /tasks → id=1
stop Uvicorn
inspect SQLite → id=1 exists
start Uvicorn
POST /tasks → id=2
```

### Задание

Проведите полный сценарий и приложите терминальный лог к README.

## Итоговый квиз

### Вопрос 1

Что делает `get_db`?

A. Выдаёт Session на запрос
B. Создаёт модель
C. Валидирует title

**Ответ:** A. Provider управляет database resource lifecycle.

### Вопрос 2

Зачем `yield`?

A. Передать ресурс и выполнить cleanup
B. Создать table
C. Вернуть 422

**Ответ:** A. Yield dependency продолжает завершение после endpoint.

### Вопрос 3

Что получает TaskModel?

A. `payload.model_dump()`
B. HTTP headers
C. metadata

**Ответ:** A. ORM-конструктор получает проверенные create-поля.

### Вопрос 4

Зачем `from_attributes=True`?

A. Читать ORM-атрибуты
B. Открывать Engine
C. Выполнять rollback

**Ответ:** A. TaskRead может сериализовать ORM object.

## Основные выводы

- get_db создаёт Session на один запрос.
- Yield связывает выдачу ресурса и cleanup.
- Annotated уменьшает повтор dependency declaration.
- TaskCreate ограничивает входной контракт.
- model_dump передаёт проверенные поля ORM.
- TaskRead фильтрует ORM-ответ.
- Commit выполняется явно в операции записи.
- Durability проверяется после перезапуска.

## Практическое задание

1. Реализуйте `get_db` и `SessionDep`.
2. Обновите Pydantic-схемы.
3. Переведите POST `/tasks` на SQLite.
4. Проверьте 201 и 422.
5. Остановите сервер и подтвердите строку inspection-скриптом.
6. Обновите README и сделайте коммит `feat: persist created tasks in sqlite`.

## Критерии готовности

- [ ] вижу полный поток данных
- [ ] Session принадлежит одному запросу
- [ ] не принимаю ORM-модель как body
- [ ] возвращаю публичный response model
- [ ] доказываю persistence после рестарта

## Что будет дальше

В блоке 15 появятся `select`, чтение списка и объекта по id, update/delete, фильтры, пагинация и конкретная обработка `IntegrityError`.

---

### Самопроверка одним предложением

Закройте материал и объясните главную модель занятия без терминов из конспекта. Затем повторите объяснение уже профессиональными словами.
