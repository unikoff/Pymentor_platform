# 108. Current user из JWT

## Паспорт занятия

- **Блок:** 19 · Bearer tokens, JWT и права.
- **Проект:** `Personal StudyHub API`.
- **Методика:** понять → увидеть → предсказать → запустить → изменить → проверить → найти ошибку → объяснить.
- **Результат:** Создать dependency CurrentUser и перестать доверять user_id из body.

## 1. Зачем нужна тема

Token уже извлекается и декодируется; теперь subject связывается с актуальной записью User.

> **Важно:** Валидный JWT не гарантирует, что User существует и активен сейчас.

## 2. Главная модель

| Термин | Роль | Пример |
| --- | --- | --- |
| `BearerToken` | HTTP credential | `Authorization → token` |
| `subject` | Проверенный claim | `token → sub` |
| `CurrentUser` | ORM entity | `sub → User` |

## 3. Механизм в коде

Создать dependency CurrentUser и перестать доверять user_id из body.

```python
from typing import Annotated
from fastapi import Depends, HTTPException, status

def get_current_user(token: BearerToken, db: DbSession, settings: AppSettings) -> UserModel:
    try:
        user_id = int(decode_access_token(token, settings))
    except (InvalidAccessToken, ValueError):
        raise HTTPException(status_code=401, headers={"WWW-Authenticate":"Bearer"})
    user = db.get(UserModel, user_id)
    if user is None: raise HTTPException(status_code=401)
    if not user.is_active: raise HTTPException(status_code=403)
    return user

CurrentUser = Annotated[UserModel, Depends(get_current_user)]
```

### Пошаговый разбор

1. Назовите вход функции.
2. Найдите проверку недоверенных данных.
3. Определите доверенный результат.
4. Объясните, какой слой использует его дальше.

## 4. Сравнение решений

**Проблемный вариант:** довериться body

```python
TaskModel(**payload.model_dump())
```

**Предпочтительный вариант:** назначить owner сервером

```python
TaskModel(**payload.model_dump(), user_id=current_user.id)
```

Security-поле user_id выводится из CurrentUser.

## 5. Порядок выполнения

1. `получить BearerToken`
2. `decode access token`
3. `преобразовать sub`
4. `загрузить User`
5. `проверить is_active`

## 6. Найдите ошибку

```python
user = db.get(UserModel, int(subject))
return user
```

**Причина:** Не проверен случай user is None.

**Исправление:**

```python
if user is None:
    raise credentials_exception
```

## 7. Проектное применение

```python
@users_router.get("/me", response_model=UserRead)
def read_me(current_user: CurrentUser):
    return current_user

@tasks_router.get("", response_model=list[TaskRead])
def list_my_tasks(current_user: CurrentUser, db: DbSession):
    statement = select(TaskModel).where(TaskModel.user_id == current_user.id).order_by(TaskModel.id)
    return list(db.scalars(statement).all())
```

### Сценарии

- Без credential: `401`.
- Identity есть, permission нет: `403`.
- Все проверки пройдены: действие выполняется.

## 8. Контрольная точка

### 1. Что возвращает get_current_user?

1. ORM User
2. raw JWT
3. password

**Ответ:** ORM User.

### 2. Откуда owner?

1. current_user.id
2. payload.user_id
3. query

**Ответ:** current_user.id.

### 3. Плохой sub даёт?

1. 401
2. User 0
3. 200

**Ответ:** 401.

### 4. Зачем загрузка из БД?

1. актуальное состояние
2. JWT без точек
3. для CORS

**Ответ:** актуальное состояние.

### Главное

- Scheme извлекает token.
- Decode возвращает subject.
- User загружается из базы.
- Отсутствующий User даёт 401.
- Inactive User может дать 403.
- Owner берётся из CurrentUser.

### Практика

Реализуйте CurrentUser, /users/me и личные tasks; протестируйте missing, invalid, deleted и inactive user.

### Критерии готовности

- Можете объяснить модель без чтения кода.
- Все security-проверки выполняются до действия.
- Есть success, invalid и forbidden тесты.
- Status codes обоснованы.
