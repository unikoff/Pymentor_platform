# 109. Refresh token, rotation и revocation

## Паспорт занятия

- **Блок:** 19 · Bearer tokens, JWT и права.
- **Проект:** `Personal StudyHub API`.
- **Методика:** понять → увидеть → предсказать → запустить → изменить → проверить → найти ошибку → объяснить.
- **Результат:** Реализовать одноразовую rotation и управляемый отзыв refresh credentials.

## 1. Зачем нужна тема

Короткий access token безопаснее, но требует способа получать новую пару без повторного password.

> **Важно:** Refresh token принимается только на /auth/refresh и проверяется вместе с записью session в базе.

## 2. Главная модель

| Термин | Роль | Пример |
| --- | --- | --- |
| `access` | Частые запросы | `type=access · 15m` |
| `refresh` | Обновление пары | `type=refresh · 30d` |
| `jti` | Идентификатор | `uuid4().hex` |

## 3. Механизм в коде

Реализовать одноразовую rotation и управляемый отзыв refresh credentials.

```python
class RefreshSessionModel(Base):
    __tablename__ = "refresh_sessions"
    id: Mapped[int] = mapped_column(primary_key=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"), index=True)
    jti_hash: Mapped[str] = mapped_column(String(64), unique=True, index=True)
    expires_at: Mapped[datetime]
    revoked_at: Mapped[datetime | None] = mapped_column(nullable=True)
    replaced_by_id: Mapped[int | None] = mapped_column(ForeignKey("refresh_sessions.id"), nullable=True)
```

### Пошаговый разбор

1. Назовите вход функции.
2. Найдите проверку недоверенных данных.
3. Определите доверенный результат.
4. Объясните, какой слой использует его дальше.

## 4. Сравнение решений

**Проблемный вариант:** переиспользовать один refresh

```python
return new_access, same_refresh
```

**Предпочтительный вариант:** rotation

```python
revoke(old); issue(new_pair)
```

Rotation ограничивает жизнь украденной копии и позволяет обнаружить reuse.

## 5. Порядок выполнения

1. `decode type=refresh`
2. `вычислить jti_hash`
3. `загрузить active session`
4. `отозвать старую`
5. `создать новую пару`
6. `commit транзакции`

## 6. Найдите ошибку

```python
session = find_refresh_session(db, jti_hash)
if session is None: raise invalid_refresh
return issue_new_pair(user)
```

**Причина:** Не проверены revoked_at и expires_at.

**Исправление:**

```python
if session.revoked_at is not None or session.expires_at <= now_utc():
    raise invalid_refresh
```

## 7. Проектное применение

```python
@router.post("/refresh", response_model=TokenPair)
def refresh_tokens(payload: RefreshRequest, db: DbSession, settings: AppSettings):
    claims = decode_refresh_token(payload.refresh_token, settings)
    session = get_active_refresh_session(db, jti_hash=hash_jti(claims.jti))
    if session is None: raise invalid_refresh_exception()
    return rotate_refresh_session(db, session=session, settings=settings)
```

### Сценарии

- Без credential: `401`.
- Identity есть, permission нет: `403`.
- Все проверки пройдены: действие выполняется.

## 8. Контрольная точка

### 1. Зачем refresh?

1. новая пара без password
2. замена HTTPS
3. хранение hash

**Ответ:** новая пара без password.

### 2. Старый refresh после rotation?

1. отозван
2. вечный
3. становится access

**Ответ:** отозван.

### 3. Зачем jti?

1. управлять session
2. ускорить CSS
3. CORS

**Ответ:** управлять session.

### 4. Reuse означает?

1. компрометацию
2. успех
3. valid access

**Ответ:** компрометацию.

### Главное

- Access и refresh имеют разные type.
- Refresh используется редко.
- Session хранит jti hash.
- Rotation заменяет credential.
- Reuse вызывает security reaction.
- Logout отзывает refresh.

### Практика

Создайте RefreshSessionModel, миграцию, /auth/refresh и logout; протестируйте rotation, reuse и expiration.

### Критерии готовности

- Можете объяснить модель без чтения кода.
- Все security-проверки выполняются до действия.
- Есть success, invalid и forbidden тесты.
- Status codes обоснованы.
