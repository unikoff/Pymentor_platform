# 76. Engine, URL базы и подключение

## Паспорт занятия

- **Блок:** 14 · SQLite и основы SQLAlchemy
- **Проект:** StudyHub Database API
- **Продолжительность:** 75–90 минут
- **До занятия:** Понятна причина перехода на SQLite и различие между файлом базы и in-memory storage.
- **Результат:** Ученик создаёт устойчивый `database.py`, объясняет database URL, роль Engine и проверяет соединение через `SELECT 1`.
- **Новые термины:** `SQLAlchemy`, `DBAPI`, `database URL`, `dialect`, `driver`, `Engine`, `Connection`, `lazy initialization`, `connect_args`

## Маршрут занятия

Понять проблему → увидеть точную модель → предсказать поведение → запустить минимальный пример → изменить проект → проверить результат → найти ошибку → объяснить решение.

## 1. Три слоя подключения

Python уже содержит драйвер `sqlite3`, который умеет общаться с SQLite. SQLAlchemy работает поверх DBAPI-драйвера и предоставляет единый Core/ORM API. `Engine` связывает выбранный dialect, driver и параметры соединения.

Engine не является открытым соединением и не является Session. Это долгоживущая инфраструктура, из которой позднее получают конкретные соединения и Session.

```text
application
  ↓
SQLAlchemy Engine
  ↓
SQLite dialect
  ↓
sqlite3 DBAPI driver
  ↓
studyhub.db
```

### Задание

Объясните назначение каждого слоя и назовите, какой из них знает синтаксис SQLite.

## 2. Database URL как конфигурация

Database URL задаёт тип СУБД и адрес ресурса. Для локального SQLite часто встречается форма `sqlite:///./studyhub.db`.

URL — конфигурационный контракт, а не активное подключение. Позже у PostgreSQL появятся host, port, user и password, но основной принцип останется тем же.

```python
DATABASE_URL = "sqlite:///./studyhub.db"
```

### Задание

Разберите строку по частям: dialect, разделитель и путь. Найдите ошибку в `sqlite://studyhub.db`.

## 3. Путь, независимый от рабочей папки

Относительный путь считается от current working directory процесса. Поэтому один и тот же запуск из IDE и родительской папки может создать два разных файла базы.

Надёжнее вычислить абсолютный путь от `__file__` и передать его в `URL.create`.

```python
from pathlib import Path
from sqlalchemy import URL

BASE_DIR = Path(__file__).resolve().parent.parent
DB_FILE = BASE_DIR / "studyhub.db"

DATABASE_URL = URL.create(
    drivername="sqlite",
    database=str(DB_FILE),
)
```

### Разбор по шагам

1. `__file__` указывает на текущий модуль.
2. `resolve()` получает абсолютный путь.
3. `parent.parent` поднимается к корню проекта.
4. Оператор `/` добавляет имя файла.
5. `URL.create` собирает URL структурированно.

### Задание

Запустите diagnostic script из корня проекта и из родительской папки. Убедитесь, что используется один файл.

## 4. create_engine и lazy initialization

`create_engine` создаёт объект Engine и настраивает dialect, driver и pool. Физическое соединение обычно открывается только при первой реальной операции: `engine.connect()`, выполнении SQL или создании Session.

Engine создаётся один раз на процесс. Создание нового Engine внутри каждого endpoint увеличивает накладные расходы и размывает инфраструктурную границу.

```python
from sqlalchemy import create_engine

engine = create_engine(
    DATABASE_URL,
    echo=True,
)
```

### Задание

Предскажите, будет ли файл базы обязательно создан сразу после импорта `database.py`. Затем проверьте экспериментом.

## 5. SQLite connect_args для синхронного FastAPI

Стандартный драйвер `sqlite3` по умолчанию проверяет, что connection используется в том же Python-потоке. Синхронный FastAPI может выполнять функции в thread pool, поэтому учебная интеграция использует `check_same_thread=False`.

Этот параметр не делает глобальную Session безопасной. Он относится к DBAPI connection; Session всё равно должна иметь ограниченное владение.

```python
engine = create_engine(
    DATABASE_URL,
    connect_args={"check_same_thread": False},
    echo=True,
)
```

### Задание

Ответьте, почему этот `connect_args` нельзя автоматически переносить в конфигурацию PostgreSQL.

## 6. Smoke test через SELECT 1

Минимальная диагностика должна проверить только подключение, не смешивая проблему с ORM-моделью. `SELECT 1` подтверждает, что URL, dialect и driver способны открыть connection и выполнить SQL.

Контекстный менеджер закрывает connection после блока.

```python
from sqlalchemy import text
from app.database import engine

with engine.connect() as connection:
    value = connection.scalar(text("SELECT 1"))

print(value)
```

### Задание

Запустите скрипт и объясните строки `BEGIN`, `SELECT 1` и `ROLLBACK` в echo-логе.

## 7. Финальная ответственность database.py

Модуль `database.py` хранит путь, URL и Engine. Он пока не должен содержать endpoint, бизнес-правила или глобальную Session.

Чем уже ответственность модуля, тем проще отдельно диагностировать ошибку подключения.

```python
from pathlib import Path
from sqlalchemy import URL, create_engine

BASE_DIR = Path(__file__).resolve().parent.parent
DB_FILE = BASE_DIR / "studyhub.db"

DATABASE_URL = URL.create(
    drivername="sqlite",
    database=str(DB_FILE),
)

engine = create_engine(
    DATABASE_URL,
    connect_args={"check_same_thread": False},
    echo=True,
)
```

### Задание

Проведите code review: назовите, какие строки относятся к location, configuration и runtime infrastructure.

## Итоговый квиз

### Вопрос 1

Что задаёт database URL?

A. Dialect и адрес базы
B. Pydantic schema
C. HTTP status

**Ответ:** A. URL сообщает SQLAlchemy тип и расположение базы.

### Вопрос 2

Когда обычно открывается connection?

A. При первой операции
B. При объявлении TaskCreate
C. При импорте router

**Ответ:** A. Engine использует отложенное открытие.

### Вопрос 3

Где создаётся Engine?

A. Один раз в database.py
B. В каждом endpoint
C. В каждой модели

**Ответ:** A. Engine является долгоживущей инфраструктурой.

### Вопрос 4

Что подтверждает `SELECT 1`?

A. Работу подключения
B. Наличие CRUD
C. Корректность Pydantic

**Ответ:** A. Это smoke test URL, dialect и driver.

## Основные выводы

- Database URL описывает dialect и адрес базы.
- Абсолютный Path устраняет зависимость от cwd.
- Engine создаётся один раз на процесс.
- Connection открывается по требованию.
- `connect_args` зависит от конкретного driver.
- `SELECT 1` проверяет инфраструктуру без ORM.

## Практическое задание

1. Создайте `app/database.py`.
2. Установите SQLAlchemy 2.x.
3. Соберите URL через `URL.create`.
4. Настройте Engine.
5. Создайте `scripts/check_database.py`.
6. Запустите smoke test из двух рабочих директорий.

## Критерии готовности

- [ ] могу объяснить URL по частям
- [ ] различаю Engine и Connection
- [ ] не создаю Engine в endpoint
- [ ] получаю `1` из диагностического SQL

## Что будет дальше

Далее Engine получит описание таблицы через declarative ORM-модель.

---

### Самопроверка одним предложением

Закройте материал и объясните главную модель занятия без терминов из конспекта. Затем повторите объяснение уже профессиональными словами.
