# 71. Annotated и цепочки зависимостей

## Паспорт занятия

- Этап: 4 — FastAPI, SQLite и SQLAlchemy.
- Блок: 13 — FastAPI как цельное приложение.
- Длительность: 80–105 минут.
- Предварительные знания: Depends, type hints, aliases, HTTPException и первая dependency.
- Результат: ученик читает Annotated, создаёт тип-алиас dependency, объясняет порядок sub-dependencies и ограничивает глубину графа.

## Введение

Сделаем сигнатуры читаемее через Annotated, создадим повторно используемые aliases и соберём короткую цепочку get_settings → require_api_mode → endpoint.

## 1. Почему старая сигнатура становится шумной

Форма parameter: Type = Depends(provider) работает, но смешивает Python-тип и механизм FastAPI в default. При нескольких dependencies сигнатура становится труднее читать.

### Python type

Разработчику важно видеть, какое значение получит функция.

### FastAPI metadata

Depends сообщает, как получить это значение.

### Проблема повторения

Одинаковая длинная запись встречается в нескольких endpoints.

### Решение

Annotated связывает основной тип и дополнительную метаинформацию.

### До annotated

```python
@router.get("/")
def get_tasks(
    settings: Settings = Depends(get_settings),
    pagination: Pagination = Depends(get_pagination),
):
    ...
```

### После

```python
@router.get("/")
def get_tasks(
    settings: SettingsDep,
    pagination: PaginationDep,
):
    ...
```


### Активная проверка

Какая сигнатура лучше показывает итоговые типы?

**Вариант A — Defaults**

```text
settings: Settings = Depends(get_settings)
```

Работает, но FastAPI-механизм занимает default.

**Вариант B — Aliases**

```text
settings: SettingsDep
```

Короткое имя можно раскрыть в одном месте.

**Разбор:** Alias полезен, когда dependency действительно переиспользуется.

> Annotated не запускает dependency сам по себе. Он хранит тип и метаданные, которые читает FastAPI.

## 2. Как читать Annotated слева направо

Запись Annotated[Settings, Depends(get_settings)] читается как: значение имеет тип Settings, а FastAPI должен получить его через get_settings.

### Первый элемент

Основной Python-тип значения.

### Второй элемент

Метаданные для FastAPI.

### Имя аргумента

Обычная локальная переменная endpoint.

### Результат

IDE и человек видят тип, FastAPI — provider.

### Минимальная запись

```python
from typing import Annotated
from fastapi import Depends

SettingsDep = Annotated[
    Settings,
    Depends(get_settings),
]
```

### Использование

```python
@router.get("/info")
def get_info(settings: SettingsDep):
    return {
        "app_name": settings.app_name,
        "api_mode": settings.api_mode,
    }
```


### Активная проверка

Что является основным типом?

```text
Annotated[____, Depends(get_settings)]
```

Варианты: `Settings`, `Depends`, `get_settings()`

**Ответ:** `Settings`. Первый аргумент Annotated описывает итоговое значение.

> Имя alias должно сообщать смысл результата: SettingsDep, PaginationDep, ActiveModeDep. Сокращение SD экономит символы, но ухудшает обучение.

## 3. Alias объявляется один раз и переиспользуется

Повторяемую dependency удобно назвать рядом с provider. Тогда изменение способа получения не требует переписывать сигнатуры всех endpoints.

### Один источник

Provider и alias находятся в одном модуле dependencies.py.

### Переиспользование

Endpoints импортируют SettingsDep.

### Явность

Alias всё ещё показывает, что значение является dependency.

### Не для единичной строки

Если dependency используется один раз, отдельный alias может не окупиться.

### Dependencies.py

```python
from typing import Annotated
from fastapi import Depends


def get_pagination(...) -> Pagination:
    ...

PaginationDep = Annotated[
    Pagination,
    Depends(get_pagination),
]
```

### Router

```python
from app.dependencies import PaginationDep

@router.get("/")
def get_tasks(pagination: PaginationDep):
    ...
```


### Активная проверка

**Вопрос:** Когда dependency alias оправдан?

**Ориентир ответа:** Когда одна и та же комбинация итогового типа и Depends используется в нескольких endpoints или sub-dependencies.

> Не создавайте один файл aliases.py без ответственности. Dependency alias логично хранить рядом с соответствующей функцией.

## 4. Dependency может зависеть от другой dependency

FastAPI строит дерево: require_api_mode требует Settings, а endpoint требует результат require_api_mode. Сначала решается нижняя потребность.

### Sub-dependency

Одна dependency объявляет аргумент, который тоже получается через Depends.

### Порядок

get_settings выполняется раньше require_api_mode.

### Результат

Проверенные settings передаются дальше.

### Ранний error

Если режим запрещён, endpoint не запускается.

### Цепочка

```python
SettingsDep = Annotated[
    Settings,
    Depends(get_settings),
]


def require_api_mode(
    settings: SettingsDep,
) -> Settings:
    if settings.api_mode == "maintenance":
        raise HTTPException(
            status_code=503,
            detail="API is under maintenance",
        )

    return settings

ActiveSettingsDep = Annotated[
    Settings,
    Depends(require_api_mode),
]
```

### Endpoint

```python
@router.get("/")
def get_tasks(settings: ActiveSettingsDep):
    return tasks
```


### Активная проверка

Расположите фактические вызовы.

Правильный порядок:
1. `get_settings()`
2. `require_api_mode(settings)`
3. `get_tasks(settings)`

Сначала создаётся Settings, затем проверяется режим, после этого вызывается endpoint.

> Цепочка выражает зависимость значений, а не порядок строк в файле. FastAPI строит граф по сигнатурам.

## 5. Одна общая sub-dependency вызывается один раз на request

Если несколько dependencies внутри одного request используют get_settings, FastAPI по умолчанию переиспользует полученный результат в рамках этого request.

### Request cache

Значение сохраняется только для решения текущего dependency graph.

### Не глобальный cache

Следующий request может решить dependency заново.

### use_cache=False

Существует для особых случаев, но пока не нужен.

### Настройки

Для settings позже дополнительно используется lru_cache на уровне Python.

### Общая dependency

```python
def require_api_mode(settings: SettingsDep) -> Settings:
    ...

def build_response_meta(settings: SettingsDep) -> dict:
    ...

@router.get("/")
def get_tasks(
    active: Annotated[Settings, Depends(require_api_mode)],
    meta: Annotated[dict, Depends(build_response_meta)],
):
    ...
```

### Схема

```python
        get_settings
        /          require_api_mode  build_response_meta
        \          /
           endpoint
```


### Активная проверка

**Утверждение:** Если get_settings нужна двум sub-dependencies одного endpoint, FastAPI обычно решит её один раз для этого request.

**Ответ:** правда.

По умолчанию результат dependency переиспользуется внутри текущего request graph.

> Не используйте cache как причину строить сложное дерево. Сначала дерево должно быть понятным по ответственности.

## 6. Dependency может преобразовать или проверить результат

Цепочка полезна, когда каждый уровень добавляет одну понятную гарантию: получить settings, проверить mode, затем передать разрешённую конфигурацию.

### Provider

Создаёт или получает значение.

### Validator dependency

Проверяет условие и возвращает то же либо новое значение.

### Endpoint

Использует уже гарантированный результат.

### Ошибка

HTTPException остаётся на HTTP-границе.

### Три уровня

```python
def get_settings() -> Settings:
    return Settings()


def require_api_mode(
    settings: SettingsDep,
) -> Settings:
    if settings.api_mode not in {"development", "test"}:
        raise HTTPException(503, "API is unavailable")
    return settings


@router.post("/")
def create_task(
    task: TaskCreate,
    settings: ActiveSettingsDep,
):
    ...
```


### Активная проверка

```python
def get_settings() -> Settings:
    settings = Settings()
    tasks.append({"title": "hidden side effect"})
    return settings
```

Что делает dependency опасной?

1. Она неожиданно меняет предметное состояние
2. Settings нельзя возвращать
3. Depends запрещает списки

**Ответ:** 1. Получение конфигурации должно быть предсказуемым и не выполнять скрытый CRUD.

Исправление:

```python
def get_settings() -> Settings:
    return Settings()
```

> Если dependency начинает изменять tasks или выполнять основной CRUD, граница смещена: предметная операция должна остаться в crud/service.

## 7. Граница чрезмерной вложенности

FastAPI допускает глубокие dependency trees, но возможность не равна необходимости. Новичку и команде легче поддерживать короткую цепочку с говорящими именами.

### Хорошая глубина

Один provider и одна проверка перед endpoint.

### Сигнал перегруза

Чтобы понять значение, нужно открыть пять functions в четырёх файлах.

### Скрытая логика

Dependency tree не должна заменять service layer.

### Диагностика

Каждый уровень отвечает на один вопрос и имеет отдельный тест.

### Понятная цепочка

```python
get_settings
→ require_api_mode
→ endpoint
```

### Перегруженная

```python
get_environment
→ get_flags
→ get_policy
→ get_context
→ get_actor
→ get_workspace
→ endpoint
```


### Активная проверка

Какой graph подходит текущему проекту?

**Вариант A — Глубокий**

```text
6 providers до любого endpoint
```

Скрывает простой режим приложения.

**Вариант B — Короткий**

```text
get_settings → require_api_mode → endpoint
```

Каждый шаг легко объяснить и проверить.

**Разбор:** Сложность dependency graph должна расти вместе с реальной потребностью.

> До появления реальной аутентификации и DB-session блоку достаточно 1–2 уровней sub-dependencies.

## 8. Практика: get_settings → require_api_mode → endpoint

Соберите цепочку и добавьте её только к write-endpoints. GET /health может работать даже в maintenance, а POST/PATCH/DELETE должны вернуть 503.

### Шаг 1

Создайте Settings с api_mode.

### Шаг 2

Объявите SettingsDep.

### Шаг 3

Создайте require_api_mode и ActiveSettingsDep.

### Шаг 4

Подключите alias к POST, PATCH и DELETE.

### Шаг 5

Проверьте development и maintenance.

### Матрица

```python
api_mode=development
GET /tasks    → 200
POST /tasks   → 201

api_mode=maintenance
GET /health   → 200
GET /tasks    → 200
POST /tasks   → 503
```


> Итог занятия — не максимальное число aliases, а читаемая сигнатура и объяснимый порядок выполнения.

## Итоговый квиз

1. **Что хранит Annotated?**
   - A. `основной тип и metadata`
   - B. `только return`
   - C. `HTTP body`
   - **Ответ: A.** FastAPI читает Depends из metadata.

2. **Что выполняется первым в цепочке?**
   - A. `нижняя sub-dependency`
   - B. `endpoint`
   - C. `response model`
   - **Ответ: A.** Значение должно быть подготовлено до зависимого callable.

3. **Сколько раз общая dependency обычно вызывается в одном request?**
   - A. `один раз с cache`
   - B. `обязательно для каждой ветки`
   - C. `никогда`
   - **Ответ: A.** FastAPI переиспользует результат в request graph.

4. **Когда graph слишком глубокий?**
   - A. `когда скрывает простую логику и трудно проследить значение`
   - B. `после двух функций всегда`
   - C. `только при async`
   - **Ответ: A.** Глубина должна оправдываться ответственностями.

## Главное из занятия

- Annotated отделяет итоговый type от FastAPI metadata.
- Dependency alias сокращает повторяемые сигнатуры.
- Sub-dependency получает результат другой dependency.
- FastAPI строит граф по сигнатурам.
- Нижние providers выполняются раньше endpoint.
- Общая dependency обычно кэшируется внутри request.
- Каждый уровень должен добавлять одну понятную гарантию.
- Короткий граф лучше преждевременно глубокой вложенности.

## Практика

Создайте SettingsDep и ActiveSettingsDep, подключите maintenance-check к write-endpoints и нарисуйте фактический порядок вызовов.

### Критерии готовности

- Обычный успешный request проходит.
- Один ожидаемый error response проверен.
- Путь значений объясняется своими словами.
- Код не использует будущую тему без подготовки.
- Postman или Swagger показывает контракт.
- Сделан отдельный Git-коммит.
