import { HardDrive, KeyRound } from "lucide-react";
import { BranchExplorer, BugHunt, Callout, CodeBlock, CodeSequence, CompareSolutions, KeyTakeaways, Lead, MatchPairs, MethodGrid, PracticeCta, PredictOutput, QuizCard, RecallCard, RichHero, RichLesson, Section, TrueFalse, TypeCard, TypeCards } from "../../shared";
import { TheoryBridge } from "../../shared";
const BLOCK_TITLE = "Блок 18 · Cookie и серверные сессии";

export function Lesson100({ module }: { module?: string }) {
  return (
    <RichLesson>
      <RichHero
        variant="project"
        chip={module ?? BLOCK_TITLE}
        title={"Server-side session и session_id"}
        intro={"Построим серверное состояние входа: создадим криптографически случайный token, сохраним его digest в таблице user_sessions и свяжем с пользователем, сроком действия и признаком отзыва."}
        tags={[
          { icon: <HardDrive size={14} />, label: "session хранится на сервере" },
          { icon: <KeyRound size={14} />, label: "opaque token → digest" },
        ]}
      />
      <TheoryBridge link={"Браузер уже умеет вернуть cookie. Теперь сервер создаёт собственную запись session, связывает её с пользователем и хранит срок действия независимо от клиента."} boundary={"В cookie передаётся непрозрачный случайный token. Данные пользователя, роль и срок действия остаются в базе и не доверяются клиенту."} />

      <Section number="01" title="Cookie получает смысл только через серверную запись">
        <Lead>
          {"На прошлом занятии браузер научился возвращать значение cookie. Теперь сервер должен решить, что это значение означает. В server-side session клиент хранит только случайный token, а состояние входа находится в таблице приложения."}
        </Lead>

        <div className="lesson-route">
          <ol>
            <li><strong>{"Сгенерировать token:"}</strong> {"получить непредсказуемое значение достаточной длины."}</li>
            <li><strong>{"Сохранить session:"}</strong> {"связать digest token с user_id и expires_at."}</li>
            <li><strong>{"Отдать raw token:"}</strong> {"поместить исходное значение только в HttpOnly-cookie."}</li>
            <li><strong>{"Проверять каждый request:"}</strong> {"повторно вычислять digest и искать активную запись."}</li>
          </ol>
          <p>{"Итог — модель состояния, которую можно отозвать на сервере без изменения учётной записи пользователя."}</p>
        </div>

        <BranchExplorer
          code={"raw token in browser\n  ↓ hash\nsession token_digest in database\n  ↓ belongs to\nuser_id\n  ↓ limited by\nexpires_at and revoked_at"}
          scenarios={[
            { label: "создание", activeLine: 2, output: "в базе сохраняется digest" },
            { label: "проверка", activeLine: 4, output: "session указывает на пользователя" },
            { label: "отзыв", activeLine: 6, output: "revoked_at прекращает доступ" },
          ]}
        />

        <Callout tone="info">
          {"Session является отдельной сущностью. Пользователь может существовать без активной session, а один пользователь может иметь несколько sessions для разных устройств."}
        </Callout>
      </Section>

      <Section number="02" title="Состав таблицы user_sessions">
        <Lead>
          {"Таблица должна отвечать на четыре вопроса: какой token предъявлен, кому принадлежит session, до какого момента она действует и была ли отозвана раньше срока."}
        </Lead>

        <MethodGrid
          rows={[
            [<>id</>, "технический primary key записи session"],
            [<>token_digest</>, "уникальный digest случайного token"],
            [<>user_id</>, "foreign key владельца session"],
            [<>created_at</>, "момент создания для аудита и сортировки"],
            [<>expires_at</>, "жёсткая серверная граница срока действия"],
            [<>revoked_at</>, "момент ручного отзыва или null для активной session"],
          ]}
        />

        <CodeBlock
          caption="ORM-модель session"
          code={"from datetime import datetime\n\nfrom sqlalchemy import DateTime, ForeignKey, String\nfrom sqlalchemy.orm import Mapped, mapped_column\n\nclass UserSessionModel(Base):\n    __tablename__ = \"user_sessions\"\n\n    id: Mapped[int] = mapped_column(primary_key=True)\n    token_digest: Mapped[str] = mapped_column(\n        String(64),\n        unique=True,\n        index=True,\n    )\n    user_id: Mapped[int] = mapped_column(\n        ForeignKey(\"users.id\"),\n        index=True,\n    )\n    created_at: Mapped[datetime] = mapped_column(DateTime())\n    expires_at: Mapped[datetime] = mapped_column(DateTime(), index=True)\n    revoked_at: Mapped[datetime | None] = mapped_column(\n        DateTime(),\n        default=None,\n    )"}
        />

        <MatchPairs
          prompt="Соедините поле и проверку, которую оно поддерживает."
          pairs={[
            { left: "token_digest", right: "найти session по предъявленному token" },
            { left: "user_id", right: "загрузить владельца session" },
            { left: "expires_at", right: "отклонить просроченный вход" },
            { left: "revoked_at", right: "отклонить отозванный вход" },
          ]}
          explanation="Каждое поле существует ради конкретной части контракта проверки."
        />

        <Callout>
          {"Уникальность token_digest защищается ограничением базы. Индекс ускоряет поиск, но подробная работа индексов остаётся для этапа SQL и PostgreSQL."}
        </Callout>
      </Section>

      <Section number="03" title="Генерация непрозрачного token">
        <Lead>
          {"Session token должен быть непредсказуемым. Для этого используется модуль secrets, предназначенный для security-sensitive случайных значений. Последовательный id, email или текущее время для этой роли не подходят."}
        </Lead>

        <CodeBlock
          caption="генерация raw token"
          code={"import secrets\n\ndef generate_session_token() -> str:\n    return secrets.token_urlsafe(32)\n\nraw_token = generate_session_token()\nprint(len(raw_token))"}
        />

        <CompareSolutions
          question="Какой token сложнее угадать внешнему клиенту?"
          left={{
            title: "Предсказуемый идентификатор",
            code: "token = str(user.id)",
            note: "Значения идут последовательно и раскрывают внутренний id.",
          }}
          right={{
            title: "Криптографически случайный token",
            code: "token = secrets.token_urlsafe(32)",
            note: "Значение имеет высокую энтропию и не кодирует user_id.",
          }}
          preferred="right"
          explanation={"Session token должен быть capability: кто владеет значением, тот может предъявить его серверу."}
        />

        <BugHunt
          code={"from random import randint\n\ndef generate_session_token():\n    return str(randint(100000, 999999))"}
          question="Почему шестизначное значение не подходит для долгоживущей session?"
          options={[
            "Пространство значений мало и token можно перебирать",
            "Функция возвращает строку",
            "FastAPI принимает только UUID",
          ]}
          correctIndex={0}
          explanation="Для session нужен непредсказуемый token с большим пространством вариантов."
          fix={"import secrets\n\ndef generate_session_token() -> str:\n    return secrets.token_urlsafe(32)"}
        />

        <Callout tone="info">
          {"Token не нужно делать читаемым. Его задача — быть уникальным и практически неугадываемым, а не нести данные пользователя."}
        </Callout>
      </Section>

      <Section number="04" title="Почему в базе хранится digest">
        <Lead>
          {"Если база утечёт вместе с raw session tokens, злоумышленник сможет сразу предъявить их API. Поэтому StudyHub сохраняет односторонний SHA-256 digest, а исходный token показывает только клиенту в момент создания."}
        </Lead>

        <CodeBlock
          caption="digest session token"
          code={"from hashlib import sha256\n\ndef digest_session_token(raw_token: str) -> str:\n    return sha256(raw_token.encode(\"utf-8\")).hexdigest()\n\nraw_token = generate_session_token()\ntoken_digest = digest_session_token(raw_token)"}
        />

        <TypeCards>
          <TypeCard badge="browser" title="Raw token" code={"V9b...случайное значение...K2"}>
            {"Предъявляется в cookie. После ответа серверу не нужно хранить его в открытом виде."}
          </TypeCard>
          <TypeCard badge="database" badgeTone="float" title="Digest" code={"64 hex symbols"}>
            {"Используется как ключ поиска. Из digest нельзя практично восстановить случайный token."}
          </TypeCard>
          <TypeCard badge="password" badgeTone="str" title="Другая задача" code={"Argon2 / bcrypt"}>
            {"Пароли имеют низкую энтропию и требуют медленного password hashing. Их нельзя заменять быстрым SHA-256."}
          </TypeCard>
        </TypeCards>

        <TrueFalse
          statement={<>{"Раз SHA-256 подходит для случайного session token, его можно использовать вместо password hashing."}</>}
          isTrue={false}
          explanation={"Пароль выбирает человек и его можно перебирать по словарю. Для паролей нужен специализированный медленный алгоритм с солью."}
        />

        <RecallCard
          question="Как сервер находит session, не сохраняя raw token?"
          answer={<p>{"Он получает raw token из cookie, вычисляет тем же способом digest и ищет строку по token_digest."}</p>}
        />
      </Section>

      <Section number="05" title="Срок действия рассчитывает сервер">
        <Lead>
          {"Срок действия session фиксируется как абсолютный момент expires_at. При каждой проверке сервер сравнивает его с текущим временем. Max-Age в cookie помогает браузеру, но не является серверной гарантией."}
        </Lead>

        <CodeBlock
          caption="создание временной границы"
          code={"from datetime import UTC, datetime, timedelta\n\nSESSION_TTL = timedelta(minutes=30)\n\ndef utc_now() -> datetime:\n    return datetime.now(UTC)\n\ndef calculate_expiration() -> datetime:\n    return utc_now() + SESSION_TTL"}
        />

        <BranchExplorer
          code={"if session is None:\n    reject 401\nelif session.revoked_at is not None:\n    reject 401\nelif session.expires_at <= now:\n    reject 401\nelse:\n    session is active"}
          scenarios={[
            { label: "неизвестный token", activeLine: 1, output: "401" },
            { label: "отозван", activeLine: 3, output: "401" },
            { label: "просрочен", activeLine: 5, output: "401" },
            { label: "действует", activeLine: 7, output: "continue" },
          ]}
        />

        <PredictOutput
          code={"created_at = 12:00\nexpires_at = 12:30\nrequest_time = 12:31\n\nactive = expires_at > request_time"}
          output={"False"}
          hint="Сервер сравнивает абсолютные моменты, а не доверяет наличию cookie."
        />

        <Callout>
          {"В проекте выберите одну временную модель и используйте её последовательно. Наивные и timezone-aware datetime нельзя смешивать без явного преобразования."}
        </Callout>
      </Section>

      <Section number="06" title="create_session как сервисная операция">
        <Lead>
          {"Создание session объединяет генерацию token, подготовку ORM-объекта и сохранение транзакции. Функция возвращает raw token вызывающему endpoint, но в базе оставляет только digest."}
        </Lead>

        <CodeBlock
          caption="session service"
          code={"from sqlalchemy.orm import Session\n\ndef create_session(db: Session, user_id: int) -> str:\n    raw_token = generate_session_token()\n\n    session = UserSessionModel(\n        token_digest=digest_session_token(raw_token),\n        user_id=user_id,\n        created_at=utc_now(),\n        expires_at=calculate_expiration(),\n        revoked_at=None,\n    )\n\n    db.add(session)\n    db.commit()\n    return raw_token"}
        />

        <CodeSequence
          title="Соберите создание session"
          prompt="Расположите действия так, чтобы клиент получил token только после успешной фиксации."
          pieces={[
            { id: "raw", code: "raw_token = generate_session_token()" },
            { id: "digest", code: "token_digest = digest_session_token(raw_token)" },
            { id: "model", code: "session = UserSessionModel(...)" },
            { id: "add", code: "db.add(session)" },
            { id: "commit", code: "db.commit()" },
            { id: "return", code: "return raw_token" },
          ]}
          correctOrder={["raw", "digest", "model", "add", "commit", "return"]}
          explanation="Сначала создаётся и фиксируется серверное состояние, затем raw token передаётся HTTP-слою."
        />

        <BugHunt
          code={"def create_session(db, user_id):\n    raw_token = generate_session_token()\n    db.add(UserSessionModel(...))\n    return raw_token\n    db.commit()"}
          question="Почему клиент получит token без сохранённой session?"
          options={[
            "commit расположен после недостижимого return",
            "token слишком длинный",
            "user_id должен быть строкой",
          ]}
          correctIndex={0}
          explanation="Код после return не выполняется, поэтому запись не фиксируется."
          fix={"def create_session(db, user_id):\n    raw_token = generate_session_token()\n    db.add(UserSessionModel(...))\n    db.commit()\n    return raw_token"}
        />

        <Callout tone="info">
          {"Endpoint не должен заново реализовывать генерацию и digest. Он вызывает один сервисный контракт create_session."}
        </Callout>
      </Section>

      <Section number="07" title="Несколько устройств и независимый отзыв">
        <Lead>
          {"Один пользователь может войти с ноутбука и телефона. В server-side модели каждое устройство получает отдельную строку user_sessions и отдельный raw token."}
        </Lead>

        <CodeBlock
          caption="две sessions одного пользователя"
          code={"user_id=7\n\nsession A:\n  token_digest=aaa...\n  device=browser\n  revoked_at=None\n\nsession B:\n  token_digest=bbb...\n  device=phone\n  revoked_at=None"}
        />

        <TypeCards>
          <TypeCard badge="device A" title="Текущий браузер" code={"session id=41"}>
            {"Logout может отозвать только эту строку."}
          </TypeCard>
          <TypeCard badge="device B" badgeTone="float" title="Телефон" code={"session id=52"}>
            {"Продолжает работать, если политика требует logout только текущего устройства."}
          </TypeCard>
          <TypeCard badge="all" badgeTone="str" title="Все устройства" code={"UPDATE sessions SET revoked_at=now"}>
            {"Отдельная операция отзывает все активные sessions пользователя."}
          </TypeCard>
        </TypeCards>

        <CompareSolutions
          question="Что лучше моделирует вход с нескольких устройств?"
          left={{
            title: "Одна колонка token в users",
            code: "users.session_token",
            note: "Новый login перезаписывает предыдущий и смешивает учётную запись с устройством.",
          }}
          right={{
            title: "Отдельная таблица sessions",
            code: "user_sessions(user_id, token_digest, ...)",
            note: "Каждый вход имеет собственный lifecycle.",
          }}
          preferred="right"
          explanation={"Отдельная сущность поддерживает несколько устройств, срок действия и точечный отзыв."}
        />

        <RecallCard
          question="Почему session не стоит хранить одной колонкой в users?"
          answer={<p>{"Учётная запись и конкретный вход имеют разные жизненные циклы. Один пользователь может иметь несколько входов и отзывать их независимо."}</p>}
        />

        <div className="lesson-practice-steps">
          <h3>{"Размещение кода"}</h3>
          <p>
            {"ORM-модель остаётся в models/session.py, генерация и digest — в services/session.py, а HTTP-cookie будет формироваться в auth router. Такое разделение не требует generic repository."}
          </p>
          <h3>{"Инвариант хранения"}</h3>
          <p>
            {"Ни один SELECT из user_sessions не должен возвращать raw token, потому что этого поля нет в таблице."}
          </p>
          <h3>{"Проверка коллизии"}</h3>
          <p>
            {"Уникальное ограничение token_digest остаётся последней гарантией. При практически невероятной коллизии сервис не выдаёт несохранённый token и обрабатывает transaction error."}
          </p>
        </div>

        <CodeBlock
          caption="границы файлов"
          code={"app/\n├── models/session.py        # UserSessionModel\n├── services/session.py      # generate, digest, create\n├── routers/session_auth.py  # login/logout HTTP\n└── config.py                # ttl и имя cookie"}
        />

        <Callout>
          {"Не добавляйте device fingerprinting, IP-binding или Redis на этом этапе. Они создают новые риски и не нужны для понимания базового server-side lifecycle."}
        </Callout>

      </Section>

      <Section number="08" title="Контрольная точка: серверное состояние входа">
        <Lead>
          {"Ученик должен уметь проследить token от генерации до проверки: raw значение получает браузер, digest хранится в user_sessions, а user_id, expires_at и revoked_at определяют серверное состояние."}
        </Lead>

        <div className="lesson-check-group">
          <QuizCard
            question="Что хранит браузер?"
            options={["случайный raw session token", "password_hash", "полную ORM-модель"]}
            correctIndex={0}
            explanation="Клиент получает только непрозрачный token."
          />
          <QuizCard
            question="Зачем token_digest в базе?"
            options={["не хранить предъявляемый token открыто", "ускорить password hashing", "создать cookie"]}
            correctIndex={0}
            explanation="При утечке базы digest нельзя напрямую предъявить как session token."
          />
          <QuizCard
            question="Что определяет server-side срок?"
            options={["expires_at в session", "наличие вкладки браузера", "заголовок Accept"]}
            correctIndex={0}
            explanation="Сервер проверяет абсолютный момент окончания."
          />
          <QuizCard
            question="Почему session — отдельная таблица?"
            options={["поддержать несколько входов и независимый отзыв", "заменить users", "хранить JSON body"]}
            correctIndex={0}
            explanation="У session собственный lifecycle, отличный от пользователя."
          />
        </div>

        <KeyTakeaways
          points={[
            <>{"Server-side session хранит состояние входа в базе приложения."}</>,
            <>{"Клиент получает непрозрачный криптографически случайный token."}</>,
            <>{"В базе сохраняется digest, а не raw token."}</>,
            <>{"SHA-256 для случайного token не заменяет password hashing."}</>,
            <>{"expires_at проверяется сервером при каждом защищённом запросе."}</>,
            <>{"revoked_at позволяет завершить session раньше срока."}</>,
            <>{"Отдельная таблица поддерживает несколько устройств одного пользователя."}</>,
          ]}
        />

        <PracticeCta text="Создайте UserSessionModel, функции generate_session_token(), digest_session_token() и create_session(). Проверьте, что raw token не попадает в SQLite, а один пользователь может иметь две независимые session." />
      </Section>
    </RichLesson>
  );
}
