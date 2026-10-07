import { FolderGit2, ShieldCheck } from "lucide-react";
import { Callout, CodeBlock, CodeSequence, CompareSolutions, FlipCards, KeyTakeaways, Lead, MatchPairs, MethodGrid, PracticeCta, QuizCard, RecallCard, RichHero, RichLesson, Section, TypeCard, TypeCards } from "../../shared";
const BLOCK_TITLE = "Блок 20 · Остальные возможности FastAPI и Personal StudyHub";

export function Lesson113({
  module,
}: {
  module?: string;
}) {
  return (
    <RichLesson>
      <RichHero
        variant="project"
        chip={module ?? BLOCK_TITLE}
        title={"Финальный проект 1: контракт и архитектура"}
        intro={"Перед финальной сборкой Personal StudyHub зафиксируем обязательные сценарии, OpenAPI-контракт, таблицы, границы модулей, формат ошибок и базовую модель угроз — без преждевременного написания маршрутов."}
        tags={[
          {
            icon: <FolderGit2 size={14} />,
            label: "контракт и дерево проекта",
          },
          {
            icon: <ShieldCheck size={14} />,
            label: "модель угроз",
          },
        ]}
      />

      <Callout tone="info">
        <strong>{"Связь с курсом."}</strong>
        {" "}
        {"За этапы 4–5 накопились модели, миграции, session login, JWT, роли и upload. Теперь отдельные механизмы нужно объединить в один ограниченный и проверяемый продукт."}
        {" "}
        <strong>{"Важно не перепутать:"}</strong>
        {" "}
        {"Архитектура не равна количеству папок. Сначала фиксируются пользовательские сценарии и контракты, затем только те модули, которые отвечают за реальные причины изменения."}
      </Callout>

      <div className="lesson-route">
        <ol>
        <li>
          <strong>{"Ограничить продукт."}</strong>
          {" "}
          {"перечислить обязательные сценарии и явно записать то, что не входит в релиз."}
        </li>
        <li>
          <strong>{"Спроектировать контракт."}</strong>
          {" "}
          {"согласовать маршруты, статусы, схемы ответов и единый формат ошибок."}
        </li>
        <li>
          <strong>{"Нарисовать данные."}</strong>
          {" "}
          {"связать User, Task, Category, Session, RefreshSession и Attachment."}
        </li>
        <li>
          <strong>{"Проверить угрозы."}</strong>
          {" "}
          {"проследить IDOR, утечку credential, повтор refresh token и опасный upload."}
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
          code={`механизмы существуют по отдельности`}
        >
          {"механизмы существуют по отдельности"}
        </TypeCard>
        <TypeCard
          badge={"+"}
          badgeTone={"float"}
          title={"Изменение урока"}
          code={`единый контракт Personal StudyHub`}
        >
          {"единый контракт Personal StudyHub"}
        </TypeCard>
        <TypeCard
          badge={"после"}
          badgeTone={"str"}
          title={"Новый результат"}
          code={`реализация получает ясные границы`}
        >
          {"реализация получает ясные границы"}
        </TypeCard>
      </TypeCards>

      <Section
        number={"01"}
        title={"Финальный проект начинается со списка обещаний"}
      >
        <Lead>
          {"Проект завершает этап 5, поэтому новая функциональность больше не добавляется «потому что можно». Сначала команда записывает, какие пользовательские действия обязаны работать с чистой базой."}
        </Lead>

        <div className="lesson-practice-steps">
        <h3>{"Вход"}</h3>
        <p>{"регистрация, session login, token login, refresh, logout и профиль."}</p>
        <h3>{"Предметная часть"}</h3>
        <p>{"CRUD собственных задач, категории, фильтры и вложение."}</p>
        <h3>{"Права"}</h3>
        <p>{"current user, ownership и один admin endpoint."}</p>
        </div>

        <CodeBlock
          caption={"обязательный scope финального релиза"}
          code={`mandatory_scenarios = [
    "register user",
    "login with session cookie",
    "login with bearer token",
    "refresh token with rotation",
    "logout and revoke access",
    "read own profile",
    "CRUD only own tasks",
    "admin reads system statistics",
    "upload one safe task attachment",
]

for scenario in mandatory_scenarios:
    print(f"[required] {scenario}")`}
        />

        <TypeCards>
          <TypeCard badge={"auth"} title={"Доказать личность"} code={`register/login/refresh/logout`}>
            {"Сценарии входа имеют отдельные транспортные механизмы, но общий User и password service."}
          </TypeCard>
          <TypeCard badge={"domain"} badgeTone={"float"} title={"Работать со своими данными"} code={`tasks/categories/attachments`}>
            {"Каждый запрос получает current user и не доверяет user_id из body."}
          </TypeCard>
          <TypeCard badge={"admin"} badgeTone={"str"} title={"Проверить разрешение"} code={`GET /admin/stats`}>
            {"Один узкий endpoint показывает разницу между аутентификацией и авторизацией."}
          </TypeCard>
        </TypeCards>

        <Callout tone="info">
          {"Не входят социальный OAuth, email-подтверждение, Docker, Redis, async и облачное файловое хранилище. Эти темы не нужны для доказательства целей этапа 5."}
        </Callout>
      </Section>

      <Section
        number={"02"}
        title={"Карта маршрутов до реализации"}
      >
        <Lead>
          {"Маршрут проектируется как публичное обещание: method, path, credential, request schema, response schema, status code и ожидаемые ошибки. Такая таблица предотвращает расхождения между routers."}
        </Lead>

        <div className="lesson-practice-steps">
        <h3>{"Auth routes"}</h3>
        <p>{"отделяют регистрацию, cookie-session и bearer token flow."}</p>
        <h3>{"Resource routes"}</h3>
        <p>{"защищают задачи и вложения через current user."}</p>
        <h3>{"Admin route"}</h3>
        <p>{"требует отдельную dependency разрешения."}</p>
        </div>

        <CodeBlock
          caption={"публичная карта API"}
          code={`POST   /auth/register             -> 201 UserRead
POST   /auth/session/login        -> 204 + Set-Cookie
POST   /auth/session/logout       -> 204 + delete cookie
POST   /auth/token                -> 200 TokenPair
POST   /auth/refresh              -> 200 TokenPair
POST   /auth/token/logout         -> 204
GET    /users/me                  -> 200 UserRead
GET    /tasks                     -> 200 Page[TaskRead]
POST   /tasks                     -> 201 TaskRead
PATCH  /tasks/{task_id}           -> 200 TaskRead
DELETE /tasks/{task_id}           -> 204
POST   /tasks/{task_id}/attachments -> 201 AttachmentRead
GET    /admin/stats               -> 200 AdminStats`}
        />

        <MethodGrid
          rows={[
            [<>{"POST /auth/register"}</>, "создаёт пользователя, но не возвращает password_hash"],
            [<>{"POST /auth/session/login"}</>, "создаёт server-side session и cookie"],
            [<>{"POST /auth/token"}</>, "возвращает access и refresh pair"],
            [<>{"GET /tasks"}</>, "читает только задачи current user"],
            [<>{"GET /admin/stats"}</>, "требует разрешение admin"]
          ]}
        />

        <Callout tone="info">
          {"Одинаковое действие не обязано использовать одинаковый транспорт: session logout удаляет cookie, token logout отзывает refresh-session."}
        </Callout>
      </Section>

      <Section
        number={"03"}
        title={"Единый формат ошибок"}
      >
        <Lead>
          {"Клиенту трудно обрабатывать API, если один router возвращает detail строкой, второй — произвольный dict, а третий — внутренний traceback. Финальный проект выбирает одну внешнюю форму."}
        </Lead>

        <div className="lesson-practice-steps">
        <h3>{"code"}</h3>
        <p>{"стабильный машинный идентификатор ошибки."}</p>
        <h3>{"message"}</h3>
        <p>{"безопасное пояснение для человека."}</p>
        <h3>{"request_id"}</h3>
        <p>{"необязательная связь с логом без выдачи внутренних деталей."}</p>
        </div>

        <CodeBlock
          caption={"контракт ошибки"}
          code={`from pydantic import BaseModel


class ErrorBody(BaseModel):
    code: str
    message: str
    request_id: str | None = None


class ErrorResponse(BaseModel):
    error: ErrorBody


example = ErrorResponse(
    error=ErrorBody(
        code="task_not_found",
        message="Task was not found",
        request_id="req-42",
    )
)`}
        />

        <CompareSolutions
          question={"Какой ответ стабильнее для клиента?"}
          left={{
            title: "Случайный detail",
            code: `{"detail": "something failed in service.py:81"}`,
            note: "Выдаёт внутреннюю деталь и не имеет стабильного кода.",
          }}
          right={{
            title: "Единый envelope",
            code: `{"error":{"code":"task_not_found","message":"Task was not found"}}`,
            note: "Форма одинакова для всех доменных отказов.",
          }}
          preferred={"right"}
          explanation={"Клиент опирается на code, а внутренний traceback остаётся только в серверном логе."}
        />

        <Callout tone="info">
          {"422 от Pydantic тоже нужно осознанно привести к внешнему контракту или честно документировать как отдельный стандартный формат."}
        </Callout>
      </Section>

      <Section
        number={"04"}
        title={"Схема данных и связи"}
      >
        <Lead>
          {"Таблицы проектируются от сценариев. User владеет задачами и credentials, Category группирует задачи, Session и RefreshSession хранят отзывное состояние, Attachment связан с задачей и владельцем."}
        </Lead>

        <div className="lesson-practice-steps">
        <h3>{"User"}</h3>
        <p>{"id, email, username, password_hash, is_active, role."}</p>
        <h3>{"Auth state"}</h3>
        <p>{"server sessions и refresh sessions имеют token hash, expiry и revoked_at."}</p>
        <h3>{"Domain"}</h3>
        <p>{"Task с owner_id и category_id, Attachment с task_id и storage_name."}</p>
        </div>

        <CodeBlock
          caption={"ER-карта Personal StudyHub"}
          code={`users 1 ─────── * tasks
  │               │
  │               ├──── * attachments
  │               │
  │               └──── 0..1 category
  │
  ├──── * sessions
  └──── * refresh_sessions

categories 1 ─── * tasks`}
        />

        <MatchPairs
          prompt={"Соедините таблицу с причиной её существования."}
          leftTitle={"Таблица"}
          rightTitle={"Ответственность"}
          pairs={[
            { left: "users", right: "личность, парольный хеш и роль" },
            { left: "sessions", right: "отзывная cookie-session на сервере" },
            { left: "refresh_sessions", right: "rotation и revocation refresh token" },
            { left: "tasks", right: "учебные задачи конкретного владельца" },
            { left: "attachments", right: "метаданные файла и связь с task" }
          ]}
          explanation={"Каждая таблица поддерживает конкретный пользовательский или security-сценарий."}
        />

        <Callout tone="info">
          {"Access token не обязательно хранить в базе. Отзывное состояние сосредоточено в refresh-session, а access живёт коротко."}
        </Callout>
      </Section>

      <Section
        number={"05"}
        title={"Дерево проекта и направление зависимостей"}
      >
        <Lead>
          {"Папки нужны только там, где упрощают поиск ответственности. Routers знают HTTP, services знают сценарии, repositories или crud знают SQLAlchemy, models описывают таблицы, schemas — внешние данные."}
        </Lead>

        <div className="lesson-practice-steps">
        <h3>{"Верхний слой"}</h3>
        <p>{"main и routers связывают FastAPI, dependencies и response models."}</p>
        <h3>{"Средний слой"}</h3>
        <p>{"auth/task services реализуют сценарии и поднимают доменные исключения."}</p>
        <h3>{"Нижний слой"}</h3>
        <p>{"database, models и repositories выполняют хранение."}</p>
        </div>

        <CodeBlock
          caption={"минимальное дерево финального проекта"}
          code={`app/
├── main.py
├── config.py
├── database.py
├── models/
│   ├── user.py
│   ├── task.py
│   └── auth.py
├── schemas/
│   ├── auth.py
│   ├── task.py
│   └── error.py
├── services/
│   ├── password.py
│   ├── session.py
│   ├── token.py
│   └── task.py
├── dependencies/
│   ├── auth.py
│   └── permissions.py
├── routers/
│   ├── auth.py
│   ├── users.py
│   ├── tasks.py
│   └── admin.py
└── exceptions.py
tests/
alembic/`}
        />

        <CodeSequence
          title={"Соберите направление запроса"}
          prompt={"Расположите слои для PATCH /tasks/{task_id}."}
          pieces={[
            { id: "router", code: "router валидирует HTTP-контракт" },
            { id: "dependency", code: "dependency получает current user" },
            { id: "service", code: "service проверяет сценарий update" },
            { id: "repository", code: "repository ищет task_id + owner_id" },
            { id: "db", code: "Session выполняет SQL и commit" },
            { id: "reverse", code: "model импортирует router", note: "обратная зависимость" }
          ]}
          correctOrder={["router", "dependency", "service", "repository", "db"]}
          explanation={"HTTP-слой направляет запрос вниз, а модели хранения не импортируют routers."}
        />

        <Callout tone="info">
          {"Для учебного проекта допустим простой crud.py вместо абстрактного repository-интерфейса. Название не важнее ясной ответственности."}
        </Callout>
      </Section>

      <Section
        number={"06"}
        title={"Базовая модель угроз"}
      >
        <Lead>
          {"Security проектируется через конкретные злоупотребления. Для каждого актива называются нарушитель, путь атаки, защита и тест, который доказывает ожидаемый отказ."}
        </Lead>

        <div className="lesson-practice-steps">
        <h3>{"Credential theft"}</h3>
        <p>{"пароль, cookie, API key и refresh token не попадают в логи и ответы."}</p>
        <h3>{"IDOR"}</h3>
        <p>{"task ищется по task_id + current_user.id, а не только по id."}</p>
        <h3>{"Upload abuse"}</h3>
        <p>{"лимит, allowlist, серверное имя и ownership защищают файловый маршрут."}</p>
        </div>

        <CodeBlock
          caption={"минимальный threat register"}
          code={`threat_register = [
    {
        "asset": "task",
        "attack": "second user requests foreign task id",
        "control": "query by id and owner_id",
        "test": "two-user isolation test",
    },
    {
        "asset": "refresh session",
        "attack": "reuse old refresh token",
        "control": "rotation + revoked_at",
        "test": "old token returns 401",
    },
    {
        "asset": "upload directory",
        "attack": "path traversal filename",
        "control": "server-generated storage name",
        "test": "malicious filename stays inside directory",
    },
]`}
        />

        <FlipCards
          cards={[
            { front: <strong>{"IDOR"}</strong>, back: <span>{"Запрашивать чужой task id и проверять owner_id на каждом read/update/delete."}</span> },
            { front: <strong>{"Token replay"}</strong>, back: <span>{"После rotation старый refresh token должен быть отозван и давать 401."}</span> },
            { front: <strong>{"Path traversal"}</strong>, back: <span>{"Не использовать клиентский filename как путь на диске."}</span> },
            { front: <strong>{"Credential leak"}</strong>, back: <span>{"Маскировать заголовки и не включать секреты в detail или логи."}</span> }
          ]}
        />

        <Callout tone="info">
          {"Модель угроз не доказывает абсолютную безопасность. Она делает ключевые риски видимыми и превращает их в проверяемые требования."}
        </Callout>
      </Section>

      <Section
        number={"07"}
        title={"План реализации маленькими вертикальными срезами"}
      >
        <Lead>
          {"Финальный проект нельзя безопасно собрать одним огромным коммитом. Вертикальный срез проходит от migration до TestClient и оставляет приложение запускаемым."}
        </Lead>

        <div className="lesson-practice-steps">
        <h3>{"Срез 1"}</h3>
        <p>{"config, database, migrations и health check на чистой базе."}</p>
        <h3>{"Срез 2"}</h3>
        <p>{"registration + password service + tests."}</p>
        <h3>{"Срез 3"}</h3>
        <p>{"session flow, затем JWT flow, затем protected tasks."}</p>
        </div>

        <CodeBlock
          caption={"порядок вертикальных срезов"}
          code={`implementation_order = [
    "clean database + alembic upgrade head",
    "register + duplicate email test",
    "session login/logout + cookie tests",
    "token login/refresh/revoke + rotation tests",
    "owned task CRUD + two-user tests",
    "admin permission + 403 tests",
    "attachment upload + boundary tests",
    "README + clean-room verification",
]`}
        />

        <CompareSolutions
          question={"Какой план легче отлаживать?"}
          left={{
            title: "Сначала весь код",
            code: `models -> all services -> all routers -> tests at end`,
            note: "Ошибки накапливаются, а рабочей контрольной точки долго нет.",
          }}
          right={{
            title: "Вертикальные срезы",
            code: `migration -> endpoint -> test -> commit`,
            note: "Каждый сценарий проходит полный путь и остаётся проверяемым.",
          }}
          preferred={"right"}
          explanation={"Вертикальный срез даёт маленький diff и ранний интеграционный результат."}
        />

        <Callout tone="info">
          {"Рефакторинг и изменение внешнего контракта лучше разделять по коммитам, чтобы причина регрессии была видна в истории."}
        </Callout>
      </Section>

      <Section
        number={"08"}
        title={"Контрольная точка архитектуры"}
      >
        <Lead>
          {"До Lesson114 проект должен иметь согласованные артефакты: route map, schema map, tree, threat register, error contract и acceptance criteria. Они станут чек-листом реализации."}
        </Lead>

        <div className="lesson-practice-steps">
        <h3>{"Проверяемость"}</h3>
        <p>{"для каждого обязательного сценария назван минимум один негативный тест."}</p>
        <h3>{"Связность"}</h3>
        <p>{"каждая таблица и папка поддерживает конкретное обещание продукта."}</p>
        <h3>{"Граница"}</h3>
        <p>{"отложенные темы перечислены явно и не попадают в текущий scope."}</p>
        </div>

        <CodeBlock
          caption={"definition of ready"}
          code={`architecture_done = all([
    route_map_is_complete,
    database_schema_is_drawn,
    errors_have_one_shape,
    threats_have_controls,
    acceptance_tests_are_named,
    out_of_scope_is_written,
])`}
        />

        <RecallCard
          question={"Почему дерево папок нельзя считать архитектурой само по себе?"}
          hint={"Нужны причины существования и направление зависимостей."}
          answer={
            <p>{"Папки только размещают файлы. Архитектура появляется, когда понятны сценарии, контракты, ответственность каждого слоя, направление зависимостей и проверяемые границы."}</p>
          }
        />

        <Callout tone="info">
          {"К реализации переходят не после «идеальной схемы», а после достаточной ясности, чтобы следующий шаг был маленьким и проверяемым."}
        </Callout>

        <div className="lesson-check-group">
          <QuizCard
            question={"С чего начинается финальный проект?"}
            options={[
              "с обязательных сценариев и границ",
              "с максимального числа папок",
              "с Dockerfile"
            ]}
            correctIndex={0}
            explanation={"Сначала фиксируется обещанное поведение и scope."}
          />
          <QuizCard
            question={"Что должно быть стабильным в ошибке?"}
            options={[
              "машинный code и форма envelope",
              "полный traceback",
              "имя Python-файла"
            ]}
            correctIndex={0}
            explanation={"Клиенту нужен предсказуемый внешний контракт."}
          />
          <QuizCard
            question={"Как защитить задачу от IDOR?"}
            options={[
              "искать по task_id и owner_id",
              "скрыть id в документации",
              "добавить длинное название"
            ]}
            correctIndex={0}
            explanation={"Ownership проверяется в запросе к данным, а не доверием к URL."}
          />
          <QuizCard
            question={"Что даёт вертикальный срез?"}
            options={[
              "полный проверяемый сценарий маленьким изменением",
              "только новые модели",
              "отсутствие тестов"
            ]}
            correctIndex={0}
            explanation={"Срез проходит от хранения до HTTP и автоматической проверки."}
          />
        </div>

        <KeyTakeaways
          points={[
            <>{"Финальный проект начинается с обязательных сценариев и out-of-scope."}</>,
            <>{"Route map фиксирует method, path, credential, schemas и statuses."}</>,
            <>{"Единый error envelope отделяет внешний контракт от внутренних ошибок."}</>,
            <>{"Таблицы появляются из пользовательских и security-сценариев."}</>,
            <>{"Направление зависимостей идёт от HTTP-слоя к хранению."}</>,
            <>{"Threat register превращает риски в controls и тесты."}</>,
            <>{"Вертикальные срезы уменьшают область поиска ошибки."}</>,
            <>{"Definition of ready предшествует реализации Lesson114."}</>
          ]}
        />

        <PracticeCta
          text={"Подготовьте route map, ER-схему, дерево проекта, error envelope, threat register и список acceptance tests для Personal StudyHub. Не пишите маршруты до проверки этих артефактов."}
        />
      </Section>
    </RichLesson>
  );
}
