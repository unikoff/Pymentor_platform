import{t as e}from"./jsx-runtime-CY_jTiqj.js";import{t}from"./boxes-DfyCvinl.js";import{C as n,D as r,E as i,I as a,L as o,M as s,N as c,O as l,P as u,S as d,b as f,h as p,j as m,p as h,v as g,w as _,x as v,y}from"./shared-BLp3PbbW.js";import{t as b}from"./key-round-D7IGigln.js";import{t as x}from"./CodeEditor-DqHMt3P8.js";var S=e(),C=`Блок 20 · Остальные возможности FastAPI и Personal StudyHub`;function w({module:e}){return(0,S.jsxs)(c,{children:[(0,S.jsx)(s,{variant:`project`,chip:e??C,title:`Финальный проект 2: database, schemas и auth services`,intro:`Соберём техническое основание Personal StudyHub: конфигурацию, синхронный SQLAlchemy, миграции, ORM-модели, Pydantic-схемы и отдельные сервисы паролей, server-side sessions и JWT.`,tags:[{icon:(0,S.jsx)(t,{size:14}),label:`database и schemas`},{icon:(0,S.jsx)(b,{size:14}),label:`auth services`}]}),(0,S.jsxs)(i,{tone:`info`,children:[(0,S.jsx)(`strong`,{children:`Связь с курсом.`}),` `,`Контракт и архитектура уже зафиксированы. Теперь реализуем нижние и средние слои так, чтобы routers в следующем уроке только связывали готовые зависимости.`,` `,(0,S.jsx)(`strong`,{children:`Важно не перепутать:`}),` `,`Сервис аутентификации не должен знать о Response, cookie или APIRouter. Он получает данные и Session, возвращает результат или доменное исключение.`]}),(0,S.jsxs)(`div`,{className:`lesson-route`,children:[(0,S.jsxs)(`ol`,{children:[(0,S.jsxs)(`li`,{children:[(0,S.jsx)(`strong`,{children:`Поднять основу.`}),` `,`config → engine → sessionmaker → get_db → Alembic metadata.`]}),(0,S.jsxs)(`li`,{children:[(0,S.jsx)(`strong`,{children:`Описать данные.`}),` `,`User, Task, Category, Session, RefreshSession и Attachment с явными связями.`]}),(0,S.jsxs)(`li`,{children:[(0,S.jsx)(`strong`,{children:`Разделить схемы.`}),` `,`request и response модели не раскрывают password_hash и token_hash.`]}),(0,S.jsxs)(`li`,{children:[(0,S.jsx)(`strong`,{children:`Собрать сервисы.`}),` `,`password, session и token services имеют маленькие проверяемые контракты.`]})]}),(0,S.jsx)(`p`,{children:`Маршрут занятия проходит от знакомой проблемы к проверяемому изменению сквозного проекта.`})]}),(0,S.jsxs)(o,{children:[(0,S.jsx)(a,{badge:`до`,title:`Состояние проекта`,code:`архитектурные артефакты готовы`,children:`архитектурные артефакты готовы`}),(0,S.jsx)(a,{badge:`+`,badgeTone:`float`,title:`Изменение урока`,code:`database, schemas и auth services`,children:`database, schemas и auth services`}),(0,S.jsx)(a,{badge:`после`,badgeTone:`str`,title:`Новый результат`,code:`routers получают готовые строительные блоки`,children:`routers получают готовые строительные блоки`})]}),(0,S.jsxs)(u,{number:`01`,title:`Конфигурация и фабрика Session`,children:[(0,S.jsx)(l,{children:`Приложение и тесты используют один код создания engine, но разные DATABASE_URL. Engine создаётся один раз на процесс, Session — на один запрос.`}),(0,S.jsxs)(`div`,{className:`lesson-practice-steps`,children:[(0,S.jsx)(`h3`,{children:`Settings`}),(0,S.jsx)(`p`,{children:`читает URL базы, секреты и TTL из окружения.`}),(0,S.jsx)(`h3`,{children:`Engine`}),(0,S.jsx)(`p`,{children:`управляет подключениями и SQL dialect.`}),(0,S.jsx)(`h3`,{children:`SessionLocal`}),(0,S.jsx)(`p`,{children:`создаёт короткоживущий рабочий контекст для dependency get_db.`})]}),(0,S.jsx)(x,{caption:`database.py`,code:`from collections.abc import Generator

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
        db.close()`}),(0,S.jsx)(g,{code:`db = SessionLocal()
try:
    yield db
finally:
    db.close()`,steps:[{line:0,note:`Для запроса создаётся отдельная Session.`,vars:{db:`new Session`}},{line:2,note:`FastAPI передаёт Session зависимому endpoint или service.`,vars:{state:`active`}},{line:4,note:`После любого исхода Session закрывается.`,vars:{state:`closed`}}]}),(0,S.jsx)(i,{tone:`info`,children:`get_db закрывает ресурс, но не делает commit автоматически: граница транзакции остаётся в конкретном сервисном сценарии.`})]}),(0,S.jsxs)(u,{number:`02`,title:`ORM-модели и ограничения базы`,children:[(0,S.jsx)(l,{children:`Python-проверки дают удобную ошибку, а база гарантирует целостность при любой точке записи. Поэтому email имеет unique index, foreign key защищает владельца, а token hash хранится вместо открытого refresh token.`}),(0,S.jsxs)(`div`,{className:`lesson-practice-steps`,children:[(0,S.jsx)(`h3`,{children:`User`}),(0,S.jsx)(`p`,{children:`уникальный email, password_hash, role и is_active.`}),(0,S.jsx)(`h3`,{children:`Auth records`}),(0,S.jsx)(`p`,{children:`session_id_hash или refresh_token_hash, expires_at и revoked_at.`}),(0,S.jsx)(`h3`,{children:`Ownership`}),(0,S.jsx)(`p`,{children:`Task.user_id и Attachment.owner_id с ForeignKey.`})]}),(0,S.jsx)(x,{caption:`фрагмент моделей identity и session`,code:`from datetime import datetime

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

    user: Mapped[UserModel] = relationship(back_populates="sessions")`}),(0,S.jsx)(h,{prompt:`Соедините ограничение с гарантией.`,leftTitle:`Ограничение`,rightTitle:`Гарантия`,pairs:[{left:`unique users.email`,right:`два пользователя не получают один email`},{left:`ForeignKey tasks.user_id`,right:`задача ссылается на существующего владельца`},{left:`token hash`,right:`утечка базы не раскрывает готовый refresh token`},{left:`revoked_at`,right:`logout и rotation могут отозвать credential`}],explanation:`Каждое поле поддерживает конкретный контракт безопасности или целостности.`}),(0,S.jsx)(i,{tone:`info`,children:`Строковая role допустима для учебного проекта, но все разрешённые значения проверяются схемой или Enum и покрываются тестами.`})]}),(0,S.jsxs)(u,{number:`03`,title:`Alembic на чистой базе`,children:[(0,S.jsx)(l,{children:`Модели не создают таблицы сами в production-потоке. Alembic импортирует metadata, генерирует revision, а разработчик читает upgrade и downgrade перед применением.`}),(0,S.jsxs)(`div`,{className:`lesson-practice-steps`,children:[(0,S.jsx)(`h3`,{children:`metadata`}),(0,S.jsx)(`p`,{children:`env.py должен видеть все ORM-модели.`}),(0,S.jsx)(`h3`,{children:`revision`}),(0,S.jsx)(`p`,{children:`одна миграция отражает один осмысленный шаг схемы.`}),(0,S.jsx)(`h3`,{children:`clean-room`}),(0,S.jsx)(`p`,{children:`новая пустая SQLite-база обязана пройти upgrade head без ручных исправлений.`})]}),(0,S.jsx)(x,{caption:`Alembic видит metadata всех моделей`,code:`# alembic/env.py
from app.database import Base
from app.models import attachment, auth, category, task, user

target_metadata = Base.metadata`}),(0,S.jsx)(y,{title:`чистая миграция`,lines:[{cmd:`rm -f studyhub.db`},{cmd:`alembic upgrade head`},{out:`Running upgrade -> 001_initial_personal_studyhub`},{cmd:`alembic current`},{out:`001_initial_personal_studyhub (head)`}]}),(0,S.jsx)(i,{tone:`info`,children:`Autogenerate не понимает перенос данных и намерение переименования. Файл миграции остаётся кодом, который обязательно ревьюят.`})]}),(0,S.jsxs)(u,{number:`04`,title:`Request и response schemas не смешиваются`,children:[(0,S.jsx)(l,{children:`Одна ORM-модель содержит внутренние поля, но внешние операции требуют разных контрактов. UserCreate принимает пароль, UserRead никогда не возвращает password_hash, TokenPair отделён от refresh request.`}),(0,S.jsxs)(`div`,{className:`lesson-practice-steps`,children:[(0,S.jsx)(`h3`,{children:`Create`}),(0,S.jsx)(`p`,{children:`входные поля и строгая валидация.`}),(0,S.jsx)(`h3`,{children:`Read`}),(0,S.jsx)(`p`,{children:`только безопасные публичные поля с from_attributes.`}),(0,S.jsx)(`h3`,{children:`Patch`}),(0,S.jsx)(`p`,{children:`все изменяемые поля optional, но только разрешённые.`})]}),(0,S.jsx)(x,{caption:`разные схемы одной области`,code:`from pydantic import BaseModel, ConfigDict, EmailStr, Field


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
    token_type: str = "bearer"`}),(0,S.jsx)(n,{code:`class UserRead(BaseModel):
    id: int
    email: str
    password_hash: str`,question:`Какое поле нарушает внешний контракт?`,options:[`password_hash`,`id`,`email`],correctIndex:0,explanation:`Хеш не нужен клиенту и не должен покидать сервер.`,fix:`class UserRead(BaseModel):
    id: int
    email: EmailStr
    role: str
    is_active: bool`}),(0,S.jsx)(i,{tone:`info`,children:`Response schema — последний барьер от случайной выдачи внутреннего поля. На неё нельзя полагаться вместо аккуратного проектирования модели.`})]}),(0,S.jsxs)(u,{number:`05`,title:`Password service как отдельный контракт`,children:[(0,S.jsx)(l,{children:`Router регистрации не знает алгоритм хеширования. Он вызывает hash_password, а authenticate_user использует verify_password и выдаёт одинаковый отказ для неизвестного email и неверного пароля.`}),(0,S.jsxs)(`div`,{className:`lesson-practice-steps`,children:[(0,S.jsx)(`h3`,{children:`Hash`}),(0,S.jsx)(`p`,{children:`готовая библиотека создаёт соль и безопасный формат хранения.`}),(0,S.jsx)(`h3`,{children:`Verify`}),(0,S.jsx)(`p`,{children:`сравнивает введённый пароль с сохранённым хешем.`}),(0,S.jsx)(`h3`,{children:`Единый отказ`}),(0,S.jsx)(`p`,{children:`ответ не раскрывает существование конкретного email.`})]}),(0,S.jsx)(x,{caption:`password.py и authenticate_user`,code:`from pwdlib import PasswordHash

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
    return user`}),(0,S.jsx)(d,{statement:(0,S.jsxs)(S.Fragment,{children:[` `,`Регистрация должна сохранять исходный пароль, чтобы позже сравнить его при входе.`,` `]}),isTrue:!1,explanation:`Сохраняется только результат безопасного password hashing. Открытый пароль после запроса больше не нужен.`}),(0,S.jsx)(i,{tone:`info`,children:`Не создавайте собственный алгоритм хеширования из sha256(password). Password hashing требует специализированной библиотеки и параметров замедления.`})]}),(0,S.jsxs)(u,{number:`06`,title:`Session service: случайный id и hash в базе`,children:[(0,S.jsx)(l,{children:`Cookie получает случайный непрозрачный session id. База хранит его hash, user_id и expiry. При чтении cookie сервис снова хеширует значение и ищет активную запись.`}),(0,S.jsxs)(`div`,{className:`lesson-practice-steps`,children:[(0,S.jsx)(`h3`,{children:`Create`}),(0,S.jsx)(`p`,{children:`secrets.token_urlsafe создаёт непредсказуемое значение.`}),(0,S.jsx)(`h3`,{children:`Store`}),(0,S.jsx)(`p`,{children:`в базе лежит digest, а открытый id отправляется клиенту один раз.`}),(0,S.jsx)(`h3`,{children:`Resolve`}),(0,S.jsx)(`p`,{children:`проверяются hash, revoked_at, expires_at и is_active пользователя.`})]}),(0,S.jsx)(x,{caption:`создание server-side session`,code:`import hashlib
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
    return raw_session_id`}),(0,S.jsx)(_,{title:`Соберите создание cookie-session`,prompt:`Расположите действия от успешной проверки пароля до ответа.`,pieces:[{id:`auth`,code:`authenticate_user`},{id:`random`,code:`generate random session id`},{id:`hash`,code:`store hash + user_id + expiry`},{id:`commit`,code:`commit session record`},{id:`cookie`,code:`return raw id to Response.set_cookie`},{id:`password`,code:`store raw password in cookie`,note:`опасное действие`}],correctOrder:[`auth`,`random`,`hash`,`commit`,`cookie`],explanation:`Открытый session id нужен только клиентской cookie; сервер хранит его проверяемый digest.`}),(0,S.jsx)(i,{tone:`info`,children:`Session service не вызывает Response.set_cookie: транспортная операция останется в router Lesson115.`})]}),(0,S.jsxs)(u,{number:`07`,title:`Token service: access и rotation refresh`,children:[(0,S.jsx)(l,{children:`Access token коротко живёт и подписывается. Refresh token имеет отдельный type, долгий TTL и запись refresh-session в базе, чтобы поддерживать rotation, reuse detection и logout.`}),(0,S.jsxs)(`div`,{className:`lesson-practice-steps`,children:[(0,S.jsx)(`h3`,{children:`Access`}),(0,S.jsx)(`p`,{children:`claims sub, type=access, iat и exp.`}),(0,S.jsx)(`h3`,{children:`Refresh`}),(0,S.jsx)(`p`,{children:`случайный jti или непрозрачный секрет связан с записью в базе.`}),(0,S.jsx)(`h3`,{children:`Rotation`}),(0,S.jsx)(`p`,{children:`старая запись отзывается, новая создаётся одной транзакцией.`})]}),(0,S.jsx)(x,{caption:`минимальный access token service`,code:`from datetime import UTC, datetime, timedelta

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
    return int(payload["sub"])`}),(0,S.jsx)(p,{code:`payload = decode(token)
if payload["type"] != "refresh":
    return "401 wrong type"
elif refresh_session.revoked_at is not None:
    return "401 revoked"
elif refresh_session.expires_at <= now:
    return "401 expired"
else:
    return "rotate and issue pair"`,scenarios:[{label:`access вместо refresh`,activeLine:2,output:`401 wrong type`},{label:`старый refresh`,activeLine:4,output:`401 revoked`},{label:`просрочен`,activeLine:6,output:`401 expired`},{label:`активен`,activeLine:8,output:`rotate and issue pair`}]}),(0,S.jsx)(i,{tone:`info`,children:`JWT payload подписан, но читаем клиентом. В него не помещают пароль, API key и другие секреты.`})]}),(0,S.jsxs)(u,{number:`08`,title:`Общие dependencies и чистый smoke test`,children:[(0,S.jsx)(l,{children:`Lesson114 заканчивается не маршрутом, а доказательством, что фундамент работает: миграции применяются, пользователь создаётся, password verify проходит, session и token services возвращают проверяемые credentials.`}),(0,S.jsxs)(`div`,{className:`lesson-practice-steps`,children:[(0,S.jsx)(`h3`,{children:`get_current_user`}),(0,S.jsx)(`p`,{children:`будет собран из session cookie или bearer token поверх готовых сервисов.`}),(0,S.jsx)(`h3`,{children:`require_admin`}),(0,S.jsx)(`p`,{children:`проверит role уже загруженного пользователя.`}),(0,S.jsx)(`h3`,{children:`Smoke test`}),(0,S.jsx)(`p`,{children:`чистая база проходит migration и минимальный auth service сценарий.`})]}),(0,S.jsx)(x,{caption:`интеграция database и auth services`,code:`def test_auth_services_smoke(db: Session, settings: Settings) -> None:
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
    assert decode_access_token(access, settings.jwt_secret) == user.id`}),(0,S.jsx)(v,{question:`Почему auth service не должен получать FastAPI Response?`,hint:`Сравните предметный результат и HTTP-транспорт.`,answer:(0,S.jsx)(`p`,{children:`Сервис создаёт или проверяет credential и возвращает данные. Установка cookie, выбор status code и response_model относятся к router, поэтому Response сделал бы сервис зависимым от HTTP-слоя.`})}),(0,S.jsx)(i,{tone:`info`,children:`Перед Lesson115 база удаляется, создаётся заново и поднимается только через alembic upgrade head. Это обязательная проверка воспроизводимости.`}),(0,S.jsxs)(`div`,{className:`lesson-check-group`,children:[(0,S.jsx)(f,{question:`Сколько Session должно быть в обычном запросе?`,options:[`одна короткоживущая Session`,`одна глобальная на всё приложение`,`новая на каждую строку SQL`],correctIndex:0,explanation:`Dependency создаёт рабочий контекст запроса и закрывает его в finally.`}),(0,S.jsx)(f,{question:`Почему password_hash нет в UserRead?`,options:[`это внутреннее чувствительное поле`,`Pydantic не поддерживает строки`,`хеш всегда пустой`],correctIndex:0,explanation:`Клиенту не нужен хеш, и response schema не должна его выдавать.`}),(0,S.jsx)(f,{question:`Что хранит server-side session таблица?`,options:[`hash session id, user_id, expiry и revoke state`,`открытый пароль`,`весь HTML клиента`],correctIndex:0,explanation:`Запись позволяет проверить и отозвать cookie credential.`}),(0,S.jsx)(f,{question:`Где устанавливается cookie?`,options:[`в router через Response`,`в ORM-модели`,`в migration`],correctIndex:0,explanation:`Session service создаёт credential, а HTTP-слой выбирает транспорт ответа.`})]}),(0,S.jsx)(r,{points:[(0,S.jsx)(S.Fragment,{children:`Settings разделяет development и test configuration.`}),(0,S.jsx)(S.Fragment,{children:`Engine создаётся один раз, Session — на один запрос.`}),(0,S.jsx)(S.Fragment,{children:`Alembic является единственным воспроизводимым путём создания схемы.`}),(0,S.jsx)(S.Fragment,{children:`ORM-модели защищены ограничениями базы и явными relationships.`}),(0,S.jsx)(S.Fragment,{children:`Request и response schemas имеют разные поля и цели.`}),(0,S.jsx)(S.Fragment,{children:`Password service использует готовый password hashing.`}),(0,S.jsx)(S.Fragment,{children:`Server-side session хранит digest, expiry и revocation state.`}),(0,S.jsx)(S.Fragment,{children:`Token service разделяет access и refresh contracts.`}),(0,S.jsx)(S.Fragment,{children:`Auth services не зависят от FastAPI Response или routers.`})]}),(0,S.jsx)(m,{text:`Соберите config, database, Alembic revision, ORM-модели, Pydantic-схемы и password/session/token services. Поднимите чистую базу через upgrade head и выполните smoke test без маршрутов.`})]})]})}export{w as Lesson114};