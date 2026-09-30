# 107. Token endpoint и OAuth2PasswordBearer

## Паспорт занятия

- **Блок:** 19 · Bearer tokens, JWT и права.
- **Проект:** `Personal StudyHub API`.
- **Методика:** понять → увидеть → предсказать → запустить → изменить → проверить → найти ошибку → объяснить.
- **Результат:** Создать token endpoint и security scheme без смешения HTTP, password service и JWT.

## 1. Зачем нужна тема

Готовые authenticate_user и create_access_token соединяются на HTTP-границе.

> **Важно:** OAuth2PasswordBearer извлекает credential и описывает OpenAPI, но сам не проверяет JWT.

## 2. Главная модель

| Термин | Роль | Пример |
| --- | --- | --- |
| `username` | Поле формы | `student@example.com` |
| `password` | Credential | `form-urlencoded` |
| `token_type` | Тип ответа | `bearer` |

## 3. Механизм в коде

Создать token endpoint и security scheme без смешения HTTP, password service и JWT.

```python
from typing import Annotated
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm

@router.post("/token", response_model=TokenResponse)
def issue_token(form_data: Annotated[OAuth2PasswordRequestForm, Depends()], db: DbSession, settings: AppSettings):
    user = authenticate_user(db, email=form_data.username, password=form_data.password)
    if user is None:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Incorrect username or password", headers={"WWW-Authenticate":"Bearer"})
    return TokenResponse(access_token=create_access_token(str(user.id), settings), token_type="bearer")
```

### Пошаговый разбор

1. Назовите вход функции.
2. Найдите проверку недоверенных данных.
3. Определите доверенный результат.
4. Объясните, какой слой использует его дальше.

## 4. Сравнение решений

**Проблемный вариант:** считать, что scheme проверяет JWT

```python
OAuth2PasswordBearer(tokenUrl="/auth/token")
```

**Предпочтительный вариант:** разделить роли

```python
scheme извлекает token, decode проверяет claims
```

HTTP security scheme и криптографическая проверка являются разными слоями.

## 5. Порядок выполнения

1. `принять OAuth2PasswordRequestForm`
2. `authenticate_user`
3. `create_access_token`
4. `вернуть TokenResponse`
5. `Authorize отправляет Bearer`

## 6. Найдите ошибку

```python
@router.post("/auth/token")
def issue_token(credentials: LoginJson): ...
```

**Причина:** Password flow ожидает form, а не JSON body.

**Исправление:**

```python
form_data: Annotated[OAuth2PasswordRequestForm, Depends()]
```

## 7. Проектное применение

```python
from typing import Annotated
from fastapi import Depends
from fastapi.security import OAuth2PasswordBearer
from pydantic import BaseModel

class TokenResponse(BaseModel):
    access_token: str
    token_type: str

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/token")
BearerToken = Annotated[str, Depends(oauth2_scheme)]
```

### Сценарии

- Без credential: `401`.
- Identity есть, permission нет: `403`.
- Все проверки пройдены: действие выполняется.

## 8. Контрольная точка

### 1. Формат password form?

1. form-urlencoded
2. JSON
3. SQL

**Ответ:** form-urlencoded.

### 2. Что делает OAuth2PasswordBearer?

1. извлекает token
2. хеширует password
3. создаёт User

**Ответ:** извлекает token.

### 3. Успешный response?

1. access_token и token_type
2. password_hash
3. secret

**Ответ:** access_token и token_type.

### 4. Это social OAuth?

1. нет
2. да
3. только Swagger

**Ответ:** нет.

### Главное

- Token endpoint принимает форму.
- username может содержать email.
- authenticate_user остаётся отдельным.
- Ответ содержит access_token.
- Scheme извлекает Bearer.
- 422, 401 и 200 различаются.

### Практика

Реализуйте /auth/token, Swagger Authorize и тесты form success, wrong password, JSON вместо form.

### Критерии готовности

- Можете объяснить модель без чтения кода.
- Все security-проверки выполняются до действия.
- Есть success, invalid и forbidden тесты.
- Status codes обоснованы.

<!-- youtube: -->
