# 100 — Server-side session и session_id

## Паспорт занятия

- **Блок:** 18 · Cookie и серверные сессии
- **Проект:** Personal StudyHub API
- **Продолжительность:** 60–90 минут
- **До занятия:** браузер умеет сохранять и возвращать cookie
- **После занятия:** ученик умеет моделировать session в SQLite и создавать безопасный непрозрачный token
- **Главная модель:** raw token хранится у клиента, его digest — в user_sessions, а серверные поля определяют владельца и lifecycle

## Результат занятия

Вы создадите UserSessionModel, генерацию token через secrets, SHA-256 digest для случайного token, expires_at и сервис create_session.

## Введение

Cookie получает смысл только через серверную запись. В stateful authentication приложение само хранит сведения о входе и может отозвать их в любой момент.

## 1. Cookie и server-side state

Один пользователь может иметь несколько входов. Поэтому session является отдельной сущностью, а не колонкой `session_token` внутри `users`.

Клиенту не нужны email, роль и expires_at в cookie. Он предъявляет непрозрачный token, а сервер получает актуальные данные из базы.

### Путь token

1. Сгенерировать raw token.
2. Вычислить digest.
3. Сохранить session с user_id и expires_at.
4. Вернуть raw token клиенту.
5. При следующем запросе снова вычислить digest.

> **Профессиональная граница:** Session и SQLAlchemy Session — разные понятия. Первая описывает пользовательский вход, вторая — unit of work базы.

## 2. Таблица user_sessions

Минимальная модель хранит технический id, уникальный token_digest, user_id, created_at, expires_at и revoked_at.

`revoked_at=None` означает, что вход не был отозван вручную, но срок всё равно проверяется отдельно.

### ORM-модель

```python
from datetime import datetime
from sqlalchemy import DateTime, ForeignKey, String
from sqlalchemy.orm import Mapped, mapped_column

class UserSessionModel(Base):
    __tablename__ = "user_sessions"

    id: Mapped[int] = mapped_column(primary_key=True)
    token_digest: Mapped[str] = mapped_column(String(64), unique=True, index=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"), index=True)
    created_at: Mapped[datetime] = mapped_column(DateTime())
    expires_at: Mapped[datetime] = mapped_column(DateTime(), index=True)
    revoked_at: Mapped[datetime | None] = mapped_column(DateTime(), default=None)
```

## 3. Непредсказуемый token

Последовательный id, email и текущее время предсказуемы. Для session используется `secrets.token_urlsafe`, рассчитанный на security-sensitive случайность.

Token является bearer credential: тот, кто владеет значением, может предъявить его серверу.

### генерация

```python
import secrets

def generate_session_token() -> str:
    return secrets.token_urlsafe(32)
```

### Задание: найдите слабый вариант

Почему `str(user.id)` не подходит как token?

**Ответ:** Его легко угадать, он раскрывает внутренний id и имеет маленькое пространство вариантов.

## 4. Digest вместо raw token в базе

При утечке базы открытые session tokens можно сразу использовать. Поэтому таблица хранит SHA-256 digest, а raw token существует только у клиента.

Это не означает, что SHA-256 подходит для паролей. Случайный token имеет высокую энтропию; пользовательский пароль требует медленного password hashing.

### digest

```python
from hashlib import sha256

def digest_session_token(raw_token: str) -> str:
    return sha256(raw_token.encode("utf-8")).hexdigest()
```

### Две разные задачи

| Значение | Подход |
| --- | --- |
| случайный session token | быстрый deterministic digest для поиска |
| пароль пользователя | Argon2/bcrypt/scrypt с солью |

> **Профессиональная граница:** Нельзя переносить решение для token на password hashing.

## 5. Серверный срок действия

`expires_at` хранит абсолютный момент окончания. При каждом запросе сервер сравнивает его с текущим временем.

Клиентский Max-Age помогает браузеру удалить cookie, но не является гарантией доступа.

### TTL

```python
from datetime import UTC, datetime, timedelta

SESSION_TTL = timedelta(minutes=30)

def utc_now() -> datetime:
    return datetime.now(UTC)

def calculate_expiration() -> datetime:
    return utc_now() + SESSION_TTL
```

### Задание: предскажите

expires_at=12:30, request_time=12:31. Активна ли session?

**Ответ:** Нет. Сервер должен вернуть 401 независимо от наличия cookie.

## 6. create_session

Сервис создаёт server-side запись и возвращает raw token только после успешного commit. Endpoint не должен выдавать token, которому не соответствует строка в базе.

При ошибке транзакции выполняется rollback; клиент не получает cookie.

### сервис

```python
def create_session(db: Session, user_id: int) -> str:
    raw_token = generate_session_token()
    model = UserSessionModel(
        token_digest=digest_session_token(raw_token),
        user_id=user_id,
        created_at=utc_now(),
        expires_at=calculate_expiration(),
        revoked_at=None,
    )
    db.add(model)
    db.commit()
    return raw_token
```

### Порядок

1. generate raw token
2. digest
3. build ORM model
4. add
5. commit
6. return raw token

## 7. Несколько устройств

Ноутбук и телефон создают две строки с одним user_id и разными token_digest. Logout одной записи не обязан завершать другую.

Отдельная таблица делает lifecycle входа независимым от lifecycle User.

### пример

```text
user_id=7
session #41 → browser → active
session #52 → phone   → active
```

### Задание: сравните модели

Почему одна колонка token в users хуже отдельной таблицы?

**Ответ:** Она допускает только один вход и смешивает учётную запись с конкретным устройством.

## 8. Собранная модель и границы файлов

`models/session.py` описывает таблицу, `services/session.py` — генерацию, digest и создание, `routers/session_auth.py` — HTTP. Это ясное разделение без преждевременного generic repository.

Redis, fingerprinting устройств и распределённая очистка не нужны для первой корректной модели.

### структура

```text
app/
├── models/session.py
├── services/session.py
├── routers/session_auth.py
└── config.py
```

## Итоговый квиз

### Вопрос 1

Что хранит браузер?

- A. raw random token
- B. password_hash
- C. UserModel

**Правильный ответ:** A. raw random token

**Почему:** Клиент предъявляет непрозрачный token.

### Вопрос 2

Что хранится в базе?

- A. token_digest
- B. raw password
- C. cookie header

**Правильный ответ:** A. token_digest

**Почему:** Digest используется для поиска без хранения bearer token.

### Вопрос 3

Чем ограничен server-side срок?

- A. expires_at
- B. открытая вкладка
- C. Accept header

**Правильный ответ:** A. expires_at

**Почему:** Решение принимает сервер.

### Вопрос 4

Зачем отдельная таблица?

- A. несколько входов и независимый отзыв
- B. заменить users
- C. создать Pydantic

**Правильный ответ:** A. несколько входов и независимый отзыв

**Почему:** Session имеет собственный lifecycle.

## Основные выводы

- Session — отдельная server-side сущность.
- Raw token должен быть случайным и непрозрачным.
- В базе хранится digest, а не bearer token.
- Пароли требуют другого алгоритма hashing.
- expires_at проверяется сервером.
- revoked_at поддерживает досрочный отзыв.
- Один User может иметь несколько sessions.

## Практическая работа

Создайте модель user_sessions, миграцию, генератор token, digest и create_session. Проверьте SQLite: raw token не должен присутствовать ни в одной колонке.

### Критерии проверки

- [ ] Таблица содержит user_id, token_digest, expires_at и revoked_at.
- [ ] token_digest уникален.
- [ ] Token создаётся через secrets.
- [ ] Raw token возвращается только после commit.
- [ ] Password hashing не заменён SHA-256.
- [ ] Два входа одного User создают две строки.

## Что намеренно отложено

Login endpoint появится в уроке 101, current user — в 102, logout — в 103. Redis sessions и device fingerprinting не входят в этап.

<!-- youtube: -->
