# 106. Access token

## Паспорт занятия

- **Блок:** 19 · Bearer tokens, JWT и права.
- **Проект:** `Personal StudyHub API`.
- **Методика:** понять → увидеть → предсказать → запустить → изменить → проверить → найти ошибку → объяснить.
- **Результат:** Реализовать create_access_token и decode_access_token с тестами срока и подписи.

## 1. Зачем нужна тема

После изучения структуры JWT проект начинает выпускать собственный access token.

> **Важно:** Secret и algorithm задаются серверными settings, а не клиентом или header token.

## 2. Главная модель

| Термин | Роль | Пример |
| --- | --- | --- |
| `sub` | Субъект | `str(user.id)` |
| `iat` | Выпуск | `datetime.now(UTC)` |
| `exp` | Истечение | `now + short TTL` |

## 3. Механизм в коде

Реализовать create_access_token и decode_access_token с тестами срока и подписи.

```python
from datetime import datetime, timedelta, timezone
import jwt

def create_access_token(subject: str, settings) -> str:
    now = datetime.now(timezone.utc)
    payload = {"sub": subject, "type": "access", "iat": now,
               "exp": now + timedelta(minutes=settings.access_ttl)}
    return jwt.encode(payload, settings.jwt_secret, algorithm=settings.jwt_algorithm)
```

### Пошаговый разбор

1. Назовите вход функции.
2. Найдите проверку недоверенных данных.
3. Определите доверенный результат.
4. Объясните, какой слой использует его дальше.

## 4. Сравнение решений

**Проблемный вариант:** decode без проверки

```python
jwt.decode(token, options={"verify_signature": False})
```

**Предпочтительный вариант:** проверка контракта

```python
jwt.decode(token, secret, algorithms=[algorithm])
```

Authorization требует проверки signature, exp и явного списка algorithms.

## 5. Порядок выполнения

1. `jwt.decode с algorithms`
2. `проверить type=access`
3. `получить непустой sub`
4. `вернуть subject`
5. `загрузить User позже`

## 6. Найдите ошибку

```python
payload = jwt.decode(token, secret, algorithms=["HS256"])
return payload["sub"]
```

**Причина:** Не проверен claim type=access.

**Исправление:**

```python
if payload.get("type") != "access":
    raise InvalidAccessToken
```

## 7. Проектное применение

```python
import jwt
from jwt import ExpiredSignatureError, InvalidTokenError

class InvalidAccessToken(Exception): pass

def decode_access_token(token: str, settings) -> str:
    try:
        payload = jwt.decode(token, settings.jwt_secret, algorithms=[settings.jwt_algorithm])
    except (ExpiredSignatureError, InvalidTokenError) as error:
        raise InvalidAccessToken from error
    if payload.get("type") != "access": raise InvalidAccessToken
    subject = payload.get("sub")
    if not isinstance(subject, str) or not subject: raise InvalidAccessToken
    return subject
```

### Сценарии

- Без credential: `401`.
- Identity есть, permission нет: `403`.
- Все проверки пройдены: действие выполняется.

## 8. Контрольная точка

### 1. Кто задаёт sub и exp?

1. сервер
2. клиент
3. SQLite

**Ответ:** сервер.

### 2. Почему TTL короткий?

1. ограничить ущерб
2. ускорить SQL
3. заменить HTTPS

**Ответ:** ограничить ущерб.

### 3. Что передают в decode?

1. algorithms
2. password
3. Response

**Ответ:** algorithms.

### 4. Неверная signature даёт?

1. 401
2. 200
3. 201

**Ответ:** 401.

### Главное

- Access token короткоживущий.
- Payload строит сервер.
- Время задаётся в UTC.
- Algorithm ограничивается явно.
- Проверяются exp и type.
- Ошибки нормализуются в 401.

### Практика

Реализуйте encode/decode и тесты roundtrip, expiration, wrong signature и refresh-as-access.

### Критерии готовности

- Можете объяснить модель без чтения кода.
- Все security-проверки выполняются до действия.
- Есть success, invalid и forbidden тесты.
- Status codes обоснованы.
