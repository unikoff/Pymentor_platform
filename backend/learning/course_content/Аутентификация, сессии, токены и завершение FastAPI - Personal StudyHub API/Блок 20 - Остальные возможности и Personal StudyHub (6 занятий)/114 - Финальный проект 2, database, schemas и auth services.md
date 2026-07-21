# 114. Финальный проект 2: database, schemas и auth services

## Паспорт занятия

- **Блок:** 20. Остальные возможности FastAPI и Personal StudyHub.
- **Сквозной проект:** Personal StudyHub API.
- **Результат:** routers получают готовые строительные блоки.
- **Формат:** теория, чтение кода, предсказание, запуск, изменение, негативная проверка и объяснение результата.
- **Ориентировочное время:** 60–90 минут.
- **Стиль реализации:** синхронные endpoint-функции, обычный SQLAlchemy Session, без asyncio.

## Состояние проекта

**До занятия:** архитектурные артефакты готовы.

**Изменение:** database, schemas и auth services.

**После занятия:** routers получают готовые строительные блоки.

## Зачем это занятие

Соберём техническое основание Personal StudyHub: конфигурацию, синхронный SQLAlchemy, миграции, ORM-модели, Pydantic-схемы и отдельные сервисы паролей, server-side sessions и JWT.

> **Связь с курсом.** Контракт и архитектура уже зафиксированы. Теперь реализуем нижние и средние слои так, чтобы routers в следующем уроке только связывали готовые зависимости.

> **Граница темы.** Сервис аутентификации не должен знать о Response, cookie или APIRouter. Он получает данные и Session, возвращает результат или доменное исключение.

## Маршрут занятия

1. **Поднять основу.** config → engine → sessionmaker → get_db → Alembic metadata.
2. **Описать данные.** User, Task, Category, Session, RefreshSession и Attachment с явными связями.
3. **Разделить схемы.** request и response модели не раскрывают password_hash и token_hash.
4. **Собрать сервисы.** password, session и token services имеют маленькие проверяемые контракты.

---

## 01. Конфигурация и фабрика Session

Приложение и тесты используют один код создания engine, но разные DATABASE_URL. Engine создаётся один раз на процесс, Session — на один запрос.

### Settings

читает URL базы, секреты и TTL из окружения.

### Engine

управляет подключениями и SQL dialect.

### SessionLocal

создаёт короткоживущий рабочий контекст для dependency get_db.

### database.py

```python
from collections.abc import Generator

from pydantic_settings import BaseSettings, SettingsConfigDict
from sqlalchemy import create_engine
from sqlalchemy.orm import Session, sessionmaker


class Settings(BaseSettings):
    database_url: str = "sqlite:///./studyhub.db"
    jwt_secret: str
    import_api_key: str
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")


settings = Settings()
engine = create_engine(
    settings.database_url,
    connect_args={"check_same_thread": False},
)
SessionLocal = sessionmaker(bind=engine, expire_on_commit=False)


def get_db() -> Generator[Session, None, None]:
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
```

### Что проследить в примере

1. Для запроса создаётся отдельная Session. Состояние: `db=new Session`.
2. FastAPI передаёт Session зависимому endpoint или service. Состояние: `state=active`.
3. После любого исхода Session закрывается. Состояние: `state=closed`.

> **Контрольная граница:** get_db закрывает ресурс, но не делает commit автоматически: граница транзакции остаётся в конкретном сервисном сценарии.

### Мини-практика

1. Перепечатайте ключевой фрагмент без копирования.
2. Запустите положительный сценарий и зафиксируйте результат.
3. Измените одну входную границу или credential.
4. Получите ожидаемый отказ и объясните, на каком слое он возник.
5. Верните рабочую версию и добавьте короткий тест или запись в чек-лист.

---

## 02. ORM-модели и ограничения базы

Python-проверки дают удобную ошибку, а база гарантирует целостность при любой точке записи. Поэтому email имеет unique index, foreign key защищает владельца, а token hash хранится вместо открытого refresh token.

### User

уникальный email, password_hash, role и is_active.

### Auth records

session_id_hash или refresh_token_hash, expires_at и revoked_at.

### Ownership

Task.user_id и Attachment.owner_id с ForeignKey.

### фрагмент моделей identity и session

```python
from datetime import datetime

from sqlalchemy import Boolean, DateTime, ForeignKey, String
from sqlalchemy.orm import Mapped, mapped_column, relationship


class UserModel(Base):
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(primary_key=True)
    email: Mapped[str] = mapped_column(String(320), unique=True, index=True)
    password_hash: Mapped[str] = mapped_column(String(255))
    role: Mapped[str] = mapped_column(String(20), default="user")
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)

    tasks: Mapped[list["TaskModel"]] = relationship(back_populates="owner")
    sessions: Mapped[list["SessionModel"]] = relationship(back_populates="user")


class SessionModel(Base):
    __tablename__ = "sessions"

    id: Mapped[int] = mapped_column(primary_key=True)
    session_hash: Mapped[str] = mapped_column(String(64), unique=True, index=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"))
    expires_at: Mapped[datetime] = mapped_column(DateTime(timezone=True))
    revoked_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))

    user: Mapped[UserModel] = relationship(back_populates="sessions")
```

### Что проследить в примере

- `unique users.email` → два пользователя не получают один email.
- `ForeignKey tasks.user_id` → задача ссылается на существующего владельца.
- `token hash` → утечка базы не раскрывает готовый refresh token.
- `revoked_at` → logout и rotation могут отозвать credential.

> **Контрольная граница:** Строковая role допустима для учебного проекта, но все разрешённые значения проверяются схемой или Enum и покрываются тестами.

### Мини-практика

1. Перепечатайте ключевой фрагмент без копирования.
2. Запустите положительный сценарий и зафиксируйте результат.
3. Измените одну входную границу или credential.
4. Получите ожидаемый отказ и объясните, на каком слое он возник.
5. Верните рабочую версию и добавьте короткий тест или запись в чек-лист.

---

## 03. Alembic на чистой базе

Модели не создают таблицы сами в production-потоке. Alembic импортирует metadata, генерирует revision, а разработчик читает upgrade и downgrade перед применением.

### metadata

env.py должен видеть все ORM-модели.

### revision

одна миграция отражает один осмысленный шаг схемы.

### clean-room

новая пустая SQLite-база обязана пройти upgrade head без ручных исправлений.

### Alembic видит metadata всех моделей

```python
# alembic/env.py
from app.database import Base
from app.models import attachment, auth, category, task, user

target_metadata = Base.metadata
```

### Что проследить в примере

- **Терминальный сценарий:**
  - `rm -f studyhub.db`
  - `alembic upgrade head`
  - `Running upgrade -> 001_initial_personal_studyhub`
  - `alembic current`
  - `001_initial_personal_studyhub (head)`

> **Контрольная граница:** Autogenerate не понимает перенос данных и намерение переименования. Файл миграции остаётся кодом, который обязательно ревьюят.

### Мини-практика

1. Перепечатайте ключевой фрагмент без копирования.
2. Запустите положительный сценарий и зафиксируйте результат.
3. Измените одну входную границу или credential.
4. Получите ожидаемый отказ и объясните, на каком слое он возник.
5. Верните рабочую версию и добавьте короткий тест или запись в чек-лист.

---

## 04. Request и response schemas не смешиваются

Одна ORM-модель содержит внутренние поля, но внешние операции требуют разных контрактов. UserCreate принимает пароль, UserRead никогда не возвращает password_hash, TokenPair отделён от refresh request.

### Create

входные поля и строгая валидация.

### Read

только безопасные публичные поля с from_attributes.

### Patch

все изменяемые поля optional, но только разрешённые.

### разные схемы одной области

```python
from pydantic import BaseModel, ConfigDict, EmailStr, Field


class UserCreate(BaseModel):
    email: EmailStr
    password: str = Field(min_length=12, max_length=128)


class UserRead(BaseModel):
    id: int
    email: EmailStr
    role: str
    is_active: bool
    model_config = ConfigDict(from_attributes=True)


class TokenPair(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
```

### Что проследить в примере

- **Проблемный код:** `class UserRead(BaseModel):`.
- **Вопрос:** Какое поле нарушает внешний контракт?
- **Ответ:** password_hash. Хеш не нужен клиенту и не должен покидать сервер.

> **Контрольная граница:** Response schema — последний барьер от случайной выдачи внутреннего поля. На неё нельзя полагаться вместо аккуратного проектирования модели.

### Мини-практика

1. Перепечатайте ключевой фрагмент без копирования.
2. Запустите положительный сценарий и зафиксируйте результат.
3. Измените одну входную границу или credential.
4. Получите ожидаемый отказ и объясните, на каком слое он возник.
5. Верните рабочую версию и добавьте короткий тест или запись в чек-лист.

---

## 05. Password service как отдельный контракт

Router регистрации не знает алгоритм хеширования. Он вызывает hash_password, а authenticate_user использует verify_password и выдаёт одинаковый отказ для неизвестного email и неверного пароля.

### Hash

готовая библиотека создаёт соль и безопасный формат хранения.

### Verify

сравнивает введённый пароль с сохранённым хешем.

### Единый отказ

ответ не раскрывает существование конкретного email.

### password.py и authenticate_user

```python
from pwdlib import PasswordHash

password_hash = PasswordHash.recommended()


def hash_password(password: str) -> str:
    return password_hash.hash(password)


def verify_password(password: str, stored_hash: str) -> bool:
    return password_hash.verify(password, stored_hash)


def authenticate_user(db: Session, email: str, password: str) -> UserModel:
    user = user_repository.get_by_email(db, email)
    if user is None or not verify_password(password, user.password_hash):
        raise InvalidCredentialsError()
    if not user.is_active:
        raise InactiveUserError()
    return user
```

### Что проследить в примере

- **Утверждение:** Регистрация должна сохранять исходный пароль, чтобы позже сравнить его при входе.
- **Ответ:** Ложь. Сохраняется только результат безопасного password hashing. Открытый пароль после запроса больше не нужен.

> **Контрольная граница:** Не создавайте собственный алгоритм хеширования из sha256(password). Password hashing требует специализированной библиотеки и параметров замедления.

### Мини-практика

1. Перепечатайте ключевой фрагмент без копирования.
2. Запустите положительный сценарий и зафиксируйте результат.
3. Измените одну входную границу или credential.
4. Получите ожидаемый отказ и объясните, на каком слое он возник.
5. Верните рабочую версию и добавьте короткий тест или запись в чек-лист.

---

## 06. Session service: случайный id и hash в базе

Cookie получает случайный непрозрачный session id. База хранит его hash, user_id и expiry. При чтении cookie сервис снова хеширует значение и ищет активную запись.

### Create

secrets.token_urlsafe создаёт непредсказуемое значение.

### Store

в базе лежит digest, а открытый id отправляется клиенту один раз.

### Resolve

проверяются hash, revoked_at, expires_at и is_active пользователя.

### создание server-side session

```python
import hashlib
import secrets
from datetime import UTC, datetime, timedelta


def token_digest(value: str) -> str:
    return hashlib.sha256(value.encode("utf-8")).hexdigest()


def create_session(db: Session, user_id: int, ttl_minutes: int) -> str:
    raw_session_id = secrets.token_urlsafe(32)
    record = SessionModel(
        session_hash=token_digest(raw_session_id),
        user_id=user_id,
        expires_at=datetime.now(UTC) + timedelta(minutes=ttl_minutes),
    )
    db.add(record)
    db.commit()
    return raw_session_id
```

### Что проследить в примере

- **Задача:** Расположите действия от успешной проверки пароля до ответа.
  1. `authenticate_user`
  2. `generate random session id`
  3. `store hash + user_id + expiry`
  4. `commit session record`
  5. `return raw id to Response.set_cookie`
- **Почему:** Открытый session id нужен только клиентской cookie; сервер хранит его проверяемый digest.

> **Контрольная граница:** Session service не вызывает Response.set_cookie: транспортная операция останется в router Lesson115.

### Мини-практика

1. Перепечатайте ключевой фрагмент без копирования.
2. Запустите положительный сценарий и зафиксируйте результат.
3. Измените одну входную границу или credential.
4. Получите ожидаемый отказ и объясните, на каком слое он возник.
5. Верните рабочую версию и добавьте короткий тест или запись в чек-лист.

---

## 07. Token service: access и rotation refresh

Access token коротко живёт и подписывается. Refresh token имеет отдельный type, долгий TTL и запись refresh-session в базе, чтобы поддерживать rotation, reuse detection и logout.

### Access

claims sub, type=access, iat и exp.

### Refresh

случайный jti или непрозрачный секрет связан с записью в базе.

### Rotation

старая запись отзывается, новая создаётся одной транзакцией.

### минимальный access token service

```python
from datetime import UTC, datetime, timedelta

import jwt


def create_access_token(user_id: int, secret: str, ttl_minutes: int) -> str:
    now = datetime.now(UTC)
    payload = {
        "sub": str(user_id),
        "type": "access",
        "iat": now,
        "exp": now + timedelta(minutes=ttl_minutes),
    }
    return jwt.encode(payload, secret, algorithm="HS256")


def decode_access_token(token: str, secret: str) -> int:
    payload = jwt.decode(token, secret, algorithms=["HS256"])
    if payload.get("type") != "access":
        raise InvalidTokenError()
    return int(payload["sub"])
```

### Что проследить в примере

- **access вместо refresh:** `401 wrong type`.
- **старый refresh:** `401 revoked`.
- **просрочен:** `401 expired`.
- **активен:** `rotate and issue pair`.

> **Контрольная граница:** JWT payload подписан, но читаем клиентом. В него не помещают пароль, API key и другие секреты.

### Мини-практика

1. Перепечатайте ключевой фрагмент без копирования.
2. Запустите положительный сценарий и зафиксируйте результат.
3. Измените одну входную границу или credential.
4. Получите ожидаемый отказ и объясните, на каком слое он возник.
5. Верните рабочую версию и добавьте короткий тест или запись в чек-лист.

---

## 08. Общие dependencies и чистый smoke test

Lesson114 заканчивается не маршрутом, а доказательством, что фундамент работает: миграции применяются, пользователь создаётся, password verify проходит, session и token services возвращают проверяемые credentials.

### get_current_user

будет собран из session cookie или bearer token поверх готовых сервисов.

### require_admin

проверит role уже загруженного пользователя.

### Smoke test

чистая база проходит migration и минимальный auth service сценарий.

### интеграция database и auth services

```python
def test_auth_services_smoke(db: Session, settings: Settings) -> None:
    user = UserModel(
        email="student@example.com",
        password_hash=hash_password("very-long-password"),
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    authenticated = authenticate_user(
        db,
        "student@example.com",
        "very-long-password",
    )
    assert authenticated.id == user.id

    session_id = create_session(db, user.id, ttl_minutes=30)
    assert len(session_id) >= 32

    access = create_access_token(user.id, settings.jwt_secret, 15)
    assert decode_access_token(access, settings.jwt_secret) == user.id
```

### Что проследить в примере

- **Вопрос:** Почему auth service не должен получать FastAPI Response?
- **Ориентир ответа:** Сервис создаёт или проверяет credential и возвращает данные. Установка cookie, выбор status code и response_model относятся к router, поэтому Response сделал бы сервис зависимым от HTTP-слоя.

> **Контрольная граница:** Перед Lesson115 база удаляется, создаётся заново и поднимается только через alembic upgrade head. Это обязательная проверка воспроизводимости.

### Мини-практика

1. Перепечатайте ключевой фрагмент без копирования.
2. Запустите положительный сценарий и зафиксируйте результат.
3. Измените одну входную границу или credential.
4. Получите ожидаемый отказ и объясните, на каком слое он возник.
5. Верните рабочую версию и добавьте короткий тест или запись в чек-лист.

---

## Итоговая проверка понимания

### Вопрос 1. Сколько Session должно быть в обычном запросе?

1. одна короткоживущая Session
2. одна глобальная на всё приложение
3. новая на каждую строку SQL

### Вопрос 2. Почему password_hash нет в UserRead?

1. это внутреннее чувствительное поле
2. Pydantic не поддерживает строки
3. хеш всегда пустой

### Вопрос 3. Что хранит server-side session таблица?

1. hash session id, user_id, expiry и revoke state
2. открытый пароль
3. весь HTML клиента

### Вопрос 4. Где устанавливается cookie?

1. в router через Response
2. в ORM-модели
3. в migration

## Ответы и объяснения

1. **одна короткоживущая Session** — Dependency создаёт рабочий контекст запроса и закрывает его в finally.
2. **это внутреннее чувствительное поле** — Клиенту не нужен хеш, и response schema не должна его выдавать.
3. **hash session id, user_id, expiry и revoke state** — Запись позволяет проверить и отозвать cookie credential.
4. **в router через Response** — Session service создаёт credential, а HTTP-слой выбирает транспорт ответа.

## Главное из занятия

- Settings разделяет development и test configuration.
- Engine создаётся один раз, Session — на один запрос.
- Alembic является единственным воспроизводимым путём создания схемы.
- ORM-модели защищены ограничениями базы и явными relationships.
- Request и response schemas имеют разные поля и цели.
- Password service использует готовый password hashing.
- Server-side session хранит digest, expiry и revocation state.
- Token service разделяет access и refresh contracts.
- Auth services не зависят от FastAPI Response или routers.

## Практическое задание

Соберите config, database, Alembic revision, ORM-модели, Pydantic-схемы и password/session/token services. Поднимите чистую базу через upgrade head и выполните smoke test без маршрутов.

### Обязательный порядок работы

1. Зафиксируйте текущее зелёное состояние тестов.
2. Реализуйте минимальный вертикальный срез.
3. Проверьте положительный сценарий.
4. Добавьте минимум два негативных сценария.
5. Запустите весь набор тестов повторно.
6. Обновите README или OpenAPI, если внешний контракт изменился.
7. Сделайте отдельный осмысленный Git-коммит.

## Критерии готовности

- Код запускается без ручных исправлений внутри базы данных.
- Используются только механизмы и зависимости, уже введённые в курсе.
- Ошибочные credentials или данные не запускают защищённую операцию.
- Тесты не используют development SQLite-файл.
- Секреты, password hash и внутренние пути не попадают в response.
- Ученик может проследить один запрос от клиента до commit/rollback и обратно.
- Ученик может объяснить, почему выбран конкретный status code.
- README и фактическое поведение не противоречат друг другу.

## Типичные ошибки

- Переносить business logic в router ради короткого service.
- Доверять `user_id`, filename, Content-Type или API key из небезопасного места.
- Возвращать клиенту traceback, hash или значение секрета.
- Использовать одну глобальную SQLAlchemy Session.
- Считать один успешный запрос достаточной проверкой security-сценария.
- Запускать тесты на той же SQLite-базе, что и локальное приложение.
- Добавлять новые технологии вместо завершения текущего контракта.

## Что должно остаться в проекте

После занятия Personal StudyHub должен демонстрировать результат: **routers получают готовые строительные блоки**.
