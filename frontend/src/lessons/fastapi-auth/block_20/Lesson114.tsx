import { Boxes, KeyRound } from "lucide-react";
import { BranchExplorer, BugHunt, Callout, CodeBlock, CodeSequence, KeyTakeaways, Lead, MatchPairs, PracticeCta, QuizCard, RecallCard, RichHero, RichLesson, Section, StepThrough, TerminalDemo, TrueFalse, TypeCard, TypeCards } from "../../shared";
const BLOCK_TITLE = "Блок 20 · Остальные возможности FastAPI и Personal StudyHub";

export function Lesson114({
  module,
}: {
  module?: string;
}) {
  return (
    <RichLesson>
      <RichHero
        variant="project"
        chip={module ?? BLOCK_TITLE}
        title={"Финальный проект 2: database, schemas и auth services"}
        intro={"Соберём техническое основание Personal StudyHub: конфигурацию, синхронный SQLAlchemy, миграции, ORM-модели, Pydantic-схемы и отдельные сервисы паролей, server-side sessions и JWT."}
        tags={[
          {
            icon: <Boxes size={14} />,
            label: "database и schemas",
          },
          {
            icon: <KeyRound size={14} />,
            label: "auth services",
          },
        ]}
      />

      <Callout tone="info">
        <strong>{"Связь с курсом."}</strong>
        {" "}
        {"Контракт и архитектура уже зафиксированы. Теперь реализуем нижние и средние слои так, чтобы routers в следующем уроке только связывали готовые зависимости."}
        {" "}
        <strong>{"Важно не перепутать:"}</strong>
        {" "}
        {"Сервис аутентификации не должен знать о Response, cookie или APIRouter. Он получает данные и Session, возвращает результат или доменное исключение."}
      </Callout>

      <div className="lesson-route">
        <ol>
        <li>
          <strong>{"Поднять основу."}</strong>
          {" "}
          {"config → engine → sessionmaker → get_db → Alembic metadata."}
        </li>
        <li>
          <strong>{"Описать данные."}</strong>
          {" "}
          {"User, Task, Category, Session, RefreshSession и Attachment с явными связями."}
        </li>
        <li>
          <strong>{"Разделить схемы."}</strong>
          {" "}
          {"request и response модели не раскрывают password_hash и token_hash."}
        </li>
        <li>
          <strong>{"Собрать сервисы."}</strong>
          {" "}
          {"password, session и token services имеют маленькие проверяемые контракты."}
        </li>
        </ol>
        <p>
          {"Маршрут занятия проходит от знакомой проблемы к проверяемому изменению сквозного проекта."}
        </p>
      </div>

      <TypeCards>
        <TypeCard
          badge={"до"}
          title={"Состояние проекта"}
          code={`архитектурные артефакты готовы`}
        >
          {"архитектурные артефакты готовы"}
        </TypeCard>
        <TypeCard
          badge={"+"}
          badgeTone={"float"}
          title={"Изменение урока"}
          code={`database, schemas и auth services`}
        >
          {"database, schemas и auth services"}
        </TypeCard>
        <TypeCard
          badge={"после"}
          badgeTone={"str"}
          title={"Новый результат"}
          code={`routers получают готовые строительные блоки`}
        >
          {"routers получают готовые строительные блоки"}
        </TypeCard>
      </TypeCards>

      <Section
        number={"01"}
        title={"Конфигурация и фабрика Session"}
      >
        <Lead>
          {"Приложение и тесты используют один код создания engine, но разные DATABASE_URL. Engine создаётся один раз на процесс, Session — на один запрос."}
        </Lead>

        <div className="lesson-practice-steps">
        <h3>{"Settings"}</h3>
        <p>{"читает URL базы, секреты и TTL из окружения."}</p>
        <h3>{"Engine"}</h3>
        <p>{"управляет подключениями и SQL dialect."}</p>
        <h3>{"SessionLocal"}</h3>
        <p>{"создаёт короткоживущий рабочий контекст для dependency get_db."}</p>
        </div>

        <CodeBlock
          caption={"database.py"}
          code={`from collections.abc import Generator

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
        db.close()`}
        />

        <StepThrough
          code={`db = SessionLocal()
try:
    yield db
finally:
    db.close()`}
          steps={[
            { line: 0, note: "Для запроса создаётся отдельная Session.", vars: {"db": "new Session"} },
            { line: 2, note: "FastAPI передаёт Session зависимому endpoint или service.", vars: {"state": "active"} },
            { line: 4, note: "После любого исхода Session закрывается.", vars: {"state": "closed"} }
          ]}
        />

        <Callout tone="info">
          {"get_db закрывает ресурс, но не делает commit автоматически: граница транзакции остаётся в конкретном сервисном сценарии."}
        </Callout>
      </Section>

      <Section
        number={"02"}
        title={"ORM-модели и ограничения базы"}
      >
        <Lead>
          {"Python-проверки дают удобную ошибку, а база гарантирует целостность при любой точке записи. Поэтому email имеет unique index, foreign key защищает владельца, а token hash хранится вместо открытого refresh token."}
        </Lead>

        <div className="lesson-practice-steps">
        <h3>{"User"}</h3>
        <p>{"уникальный email, password_hash, role и is_active."}</p>
        <h3>{"Auth records"}</h3>
        <p>{"session_id_hash или refresh_token_hash, expires_at и revoked_at."}</p>
        <h3>{"Ownership"}</h3>
        <p>{"Task.user_id и Attachment.owner_id с ForeignKey."}</p>
        </div>

        <CodeBlock
          caption={"фрагмент моделей identity и session"}
          code={`from datetime import datetime

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

    user: Mapped[UserModel] = relationship(back_populates="sessions")`}
        />

        <MatchPairs
          prompt={"Соедините ограничение с гарантией."}
          leftTitle={"Ограничение"}
          rightTitle={"Гарантия"}
          pairs={[
            { left: "unique users.email", right: "два пользователя не получают один email" },
            { left: "ForeignKey tasks.user_id", right: "задача ссылается на существующего владельца" },
            { left: "token hash", right: "утечка базы не раскрывает готовый refresh token" },
            { left: "revoked_at", right: "logout и rotation могут отозвать credential" }
          ]}
          explanation={"Каждое поле поддерживает конкретный контракт безопасности или целостности."}
        />

        <Callout tone="info">
          {"Строковая role допустима для учебного проекта, но все разрешённые значения проверяются схемой или Enum и покрываются тестами."}
        </Callout>
      </Section>

      <Section
        number={"03"}
        title={"Alembic на чистой базе"}
      >
        <Lead>
          {"Модели не создают таблицы сами в production-потоке. Alembic импортирует metadata, генерирует revision, а разработчик читает upgrade и downgrade перед применением."}
        </Lead>

        <div className="lesson-practice-steps">
        <h3>{"metadata"}</h3>
        <p>{"env.py должен видеть все ORM-модели."}</p>
        <h3>{"revision"}</h3>
        <p>{"одна миграция отражает один осмысленный шаг схемы."}</p>
        <h3>{"clean-room"}</h3>
        <p>{"новая пустая SQLite-база обязана пройти upgrade head без ручных исправлений."}</p>
        </div>

        <CodeBlock
          caption={"Alembic видит metadata всех моделей"}
          code={`# alembic/env.py
from app.database import Base
from app.models import attachment, auth, category, task, user

target_metadata = Base.metadata`}
        />

        <TerminalDemo
          title={"чистая миграция"}
          lines={[
            { cmd: "rm -f studyhub.db" },
            { cmd: "alembic upgrade head" },
            { out: "Running upgrade -> 001_initial_personal_studyhub" },
            { cmd: "alembic current" },
            { out: "001_initial_personal_studyhub (head)" }
          ]}
        />

        <Callout tone="info">
          {"Autogenerate не понимает перенос данных и намерение переименования. Файл миграции остаётся кодом, который обязательно ревьюят."}
        </Callout>
      </Section>

      <Section
        number={"04"}
        title={"Request и response schemas не смешиваются"}
      >
        <Lead>
          {"Одна ORM-модель содержит внутренние поля, но внешние операции требуют разных контрактов. UserCreate принимает пароль, UserRead никогда не возвращает password_hash, TokenPair отделён от refresh request."}
        </Lead>

        <div className="lesson-practice-steps">
        <h3>{"Create"}</h3>
        <p>{"входные поля и строгая валидация."}</p>
        <h3>{"Read"}</h3>
        <p>{"только безопасные публичные поля с from_attributes."}</p>
        <h3>{"Patch"}</h3>
        <p>{"все изменяемые поля optional, но только разрешённые."}</p>
        </div>

        <CodeBlock
          caption={"разные схемы одной области"}
          code={`from pydantic import BaseModel, ConfigDict, EmailStr, Field


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
    token_type: str = "bearer"`}
        />

        <BugHunt
          code={`class UserRead(BaseModel):
    id: int
    email: str
    password_hash: str`}
          question={"Какое поле нарушает внешний контракт?"}
          options={[
            "password_hash",
            "id",
            "email"
          ]}
          correctIndex={0}
          explanation={"Хеш не нужен клиенту и не должен покидать сервер."}
          fix={`class UserRead(BaseModel):
    id: int
    email: EmailStr
    role: str
    is_active: bool`}
        />

        <Callout tone="info">
          {"Response schema — последний барьер от случайной выдачи внутреннего поля. На неё нельзя полагаться вместо аккуратного проектирования модели."}
        </Callout>
      </Section>

      <Section
        number={"05"}
        title={"Password service как отдельный контракт"}
      >
        <Lead>
          {"Router регистрации не знает алгоритм хеширования. Он вызывает hash_password, а authenticate_user использует verify_password и выдаёт одинаковый отказ для неизвестного email и неверного пароля."}
        </Lead>

        <div className="lesson-practice-steps">
        <h3>{"Hash"}</h3>
        <p>{"готовая библиотека создаёт соль и безопасный формат хранения."}</p>
        <h3>{"Verify"}</h3>
        <p>{"сравнивает введённый пароль с сохранённым хешем."}</p>
        <h3>{"Единый отказ"}</h3>
        <p>{"ответ не раскрывает существование конкретного email."}</p>
        </div>

        <CodeBlock
          caption={"password.py и authenticate_user"}
          code={`from pwdlib import PasswordHash

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
    return user`}
        />

        <TrueFalse
          statement={<> {"Регистрация должна сохранять исходный пароль, чтобы позже сравнить его при входе."} </>}
          isTrue={false}
          explanation={"Сохраняется только результат безопасного password hashing. Открытый пароль после запроса больше не нужен."}
        />

        <Callout tone="info">
          {"Не создавайте собственный алгоритм хеширования из sha256(password). Password hashing требует специализированной библиотеки и параметров замедления."}
        </Callout>
      </Section>

      <Section
        number={"06"}
        title={"Session service: случайный id и hash в базе"}
      >
        <Lead>
          {"Cookie получает случайный непрозрачный session id. База хранит его hash, user_id и expiry. При чтении cookie сервис снова хеширует значение и ищет активную запись."}
        </Lead>

        <div className="lesson-practice-steps">
        <h3>{"Create"}</h3>
        <p>{"secrets.token_urlsafe создаёт непредсказуемое значение."}</p>
        <h3>{"Store"}</h3>
        <p>{"в базе лежит digest, а открытый id отправляется клиенту один раз."}</p>
        <h3>{"Resolve"}</h3>
        <p>{"проверяются hash, revoked_at, expires_at и is_active пользователя."}</p>
        </div>

        <CodeBlock
          caption={"создание server-side session"}
          code={`import hashlib
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
    return raw_session_id`}
        />

        <CodeSequence
          title={"Соберите создание cookie-session"}
          prompt={"Расположите действия от успешной проверки пароля до ответа."}
          pieces={[
            { id: "auth", code: "authenticate_user" },
            { id: "random", code: "generate random session id" },
            { id: "hash", code: "store hash + user_id + expiry" },
            { id: "commit", code: "commit session record" },
            { id: "cookie", code: "return raw id to Response.set_cookie" },
            { id: "password", code: "store raw password in cookie", note: "опасное действие" }
          ]}
          correctOrder={["auth", "random", "hash", "commit", "cookie"]}
          explanation={"Открытый session id нужен только клиентской cookie; сервер хранит его проверяемый digest."}
        />

        <Callout tone="info">
          {"Session service не вызывает Response.set_cookie: транспортная операция останется в router Lesson115."}
        </Callout>
      </Section>

      <Section
        number={"07"}
        title={"Token service: access и rotation refresh"}
      >
        <Lead>
          {"Access token коротко живёт и подписывается. Refresh token имеет отдельный type, долгий TTL и запись refresh-session в базе, чтобы поддерживать rotation, reuse detection и logout."}
        </Lead>

        <div className="lesson-practice-steps">
        <h3>{"Access"}</h3>
        <p>{"claims sub, type=access, iat и exp."}</p>
        <h3>{"Refresh"}</h3>
        <p>{"случайный jti или непрозрачный секрет связан с записью в базе."}</p>
        <h3>{"Rotation"}</h3>
        <p>{"старая запись отзывается, новая создаётся одной транзакцией."}</p>
        </div>

        <CodeBlock
          caption={"минимальный access token service"}
          code={`from datetime import UTC, datetime, timedelta

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
    return int(payload["sub"])`}
        />

        <BranchExplorer
          code={`payload = decode(token)
if payload["type"] != "refresh":
    return "401 wrong type"
elif refresh_session.revoked_at is not None:
    return "401 revoked"
elif refresh_session.expires_at <= now:
    return "401 expired"
else:
    return "rotate and issue pair"`}
          scenarios={[
            { label: "access вместо refresh", activeLine: 2, output: "401 wrong type" },
            { label: "старый refresh", activeLine: 4, output: "401 revoked" },
            { label: "просрочен", activeLine: 6, output: "401 expired" },
            { label: "активен", activeLine: 8, output: "rotate and issue pair" }
          ]}
        />

        <Callout tone="info">
          {"JWT payload подписан, но читаем клиентом. В него не помещают пароль, API key и другие секреты."}
        </Callout>
      </Section>

      <Section
        number={"08"}
        title={"Общие dependencies и чистый smoke test"}
      >
        <Lead>
          {"Lesson114 заканчивается не маршрутом, а доказательством, что фундамент работает: миграции применяются, пользователь создаётся, password verify проходит, session и token services возвращают проверяемые credentials."}
        </Lead>

        <div className="lesson-practice-steps">
        <h3>{"get_current_user"}</h3>
        <p>{"будет собран из session cookie или bearer token поверх готовых сервисов."}</p>
        <h3>{"require_admin"}</h3>
        <p>{"проверит role уже загруженного пользователя."}</p>
        <h3>{"Smoke test"}</h3>
        <p>{"чистая база проходит migration и минимальный auth service сценарий."}</p>
        </div>

        <CodeBlock
          caption={"интеграция database и auth services"}
          code={`def test_auth_services_smoke(db: Session, settings: Settings) -> None:
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
    assert decode_access_token(access, settings.jwt_secret) == user.id`}
        />

        <RecallCard
          question={"Почему auth service не должен получать FastAPI Response?"}
          hint={"Сравните предметный результат и HTTP-транспорт."}
          answer={
            <p>{"Сервис создаёт или проверяет credential и возвращает данные. Установка cookie, выбор status code и response_model относятся к router, поэтому Response сделал бы сервис зависимым от HTTP-слоя."}</p>
          }
        />

        <Callout tone="info">
          {"Перед Lesson115 база удаляется, создаётся заново и поднимается только через alembic upgrade head. Это обязательная проверка воспроизводимости."}
        </Callout>

        <div className="lesson-check-group">
          <QuizCard
            question={"Сколько Session должно быть в обычном запросе?"}
            options={[
              "одна короткоживущая Session",
              "одна глобальная на всё приложение",
              "новая на каждую строку SQL"
            ]}
            correctIndex={0}
            explanation={"Dependency создаёт рабочий контекст запроса и закрывает его в finally."}
          />
          <QuizCard
            question={"Почему password_hash нет в UserRead?"}
            options={[
              "это внутреннее чувствительное поле",
              "Pydantic не поддерживает строки",
              "хеш всегда пустой"
            ]}
            correctIndex={0}
            explanation={"Клиенту не нужен хеш, и response schema не должна его выдавать."}
          />
          <QuizCard
            question={"Что хранит server-side session таблица?"}
            options={[
              "hash session id, user_id, expiry и revoke state",
              "открытый пароль",
              "весь HTML клиента"
            ]}
            correctIndex={0}
            explanation={"Запись позволяет проверить и отозвать cookie credential."}
          />
          <QuizCard
            question={"Где устанавливается cookie?"}
            options={[
              "в router через Response",
              "в ORM-модели",
              "в migration"
            ]}
            correctIndex={0}
            explanation={"Session service создаёт credential, а HTTP-слой выбирает транспорт ответа."}
          />
        </div>

        <KeyTakeaways
          points={[
            <>{"Settings разделяет development и test configuration."}</>,
            <>{"Engine создаётся один раз, Session — на один запрос."}</>,
            <>{"Alembic является единственным воспроизводимым путём создания схемы."}</>,
            <>{"ORM-модели защищены ограничениями базы и явными relationships."}</>,
            <>{"Request и response schemas имеют разные поля и цели."}</>,
            <>{"Password service использует готовый password hashing."}</>,
            <>{"Server-side session хранит digest, expiry и revocation state."}</>,
            <>{"Token service разделяет access и refresh contracts."}</>,
            <>{"Auth services не зависят от FastAPI Response или routers."}</>
          ]}
        />

        <PracticeCta
          text={"Соберите config, database, Alembic revision, ORM-модели, Pydantic-схемы и password/session/token services. Поднимите чистую базу через upgrade head и выполните smoke test без маршрутов."}
        />
      </Section>
    </RichLesson>
  );
}
