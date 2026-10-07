# 105. Bearer token и JWT

## Паспорт занятия

- **Блок:** 19 · Bearer tokens, JWT и права.
- **Проект:** `Personal StudyHub API`.
- **Методика:** понять → увидеть → предсказать → запустить → изменить → проверить → найти ошибку → объяснить.
- **Результат:** Понять bearer credential, header.payload.signature и claims sub, iat, exp.

## 1. Зачем нужна тема

После cookie-session клиент начинает явно предъявлять credential в каждом защищённом запросе.

> **Важно:** JWT подписан, но payload не зашифрован: пароли и secrets в него не помещают.

## 2. Главная модель

| Термин | Роль | Пример |
| --- | --- | --- |
| `Authorization` | HTTP-заголовок | `Authorization: Bearer eyJ...` |
| `payload` | Claims | `sub · iat · exp` |
| `signature` | Целостность | `header + payload + secret` |

## 3. Механизм в коде

Понять bearer credential, header.payload.signature и claims sub, iat, exp.

```python
import jwt

token = "eyJ...header.eyJ...payload.signature"
preview = jwt.decode(token, options={"verify_signature": False})
print(preview)
```

### Пошаговый разбор

1. Назовите вход функции.
2. Найдите проверку недоверенных данных.
3. Определите доверенный результат.
4. Объясните, какой слой использует его дальше.

## 4. Сравнение решений

**Проблемный вариант:** payload с password

```python
{"sub":"7","password":"qwerty"}
```

**Предпочтительный вариант:** минимальный payload

```python
{"sub":"7","iat":1720000000,"exp":1720000900}
```

Payload доступен владельцу token, поэтому секреты внутри небезопасны.

## 5. Порядок выполнения

1. `прочитать Authorization`
2. `отделить Bearer от token`
3. `проверить signature и exp`
4. `получить sub`
5. `загрузить User`

## 6. Найдите ошибку

```python
authorization = "Bearer eyJ..."
token = authorization.split(" ")[0]
```

**Причина:** Взята схема Bearer вместо второй части.

**Исправление:**

```python
scheme, token = authorization.split(" ", maxsplit=1)
```

## 7. Проектное применение

```python
import jwt

def inspect_token(token: str) -> dict:
    return jwt.decode(token, options={"verify_signature": False})

claims = inspect_token("eyJ...demo")
print(claims.get("sub"), claims.get("iat"), claims.get("exp"))
```

### Сценарии

- Без credential: `401`.
- Identity есть, permission нет: `403`.
- Все проверки пройдены: действие выполняется.

## 8. Контрольная точка

### 1. Где передают access token?

1. в Authorization
2. в имени файла
3. в таблице tasks

**Ответ:** в Authorization.

### 2. Что защищает signature?

1. целостность
2. payload от чтения
3. пароль

**Ответ:** целостность.

### 3. Какой claim хранит subject?

1. sub
2. css
3. path

**Ответ:** sub.

### 4. Можно ли хранить password в payload?

1. нет
2. да
3. только admin

**Ответ:** нет.

### Главное

- Bearer token передаётся в Authorization.
- JWT состоит из трёх сегментов.
- Payload можно прочитать без проверки.
- Signature защищает целостность.
- sub связывает token с субъектом.
- Secrets не помещаются в payload.

### Практика

Декодируйте учебный JWT, подпишите сегменты и покажите корректный и ошибочный Authorization.

### Критерии готовности

- Можете объяснить модель без чтения кода.
- Все security-проверки выполняются до действия.
- Есть success, invalid и forbidden тесты.
- Status codes обоснованы.

<!-- youtube: -->
