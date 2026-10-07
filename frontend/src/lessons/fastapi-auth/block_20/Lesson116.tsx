import { FileText, Trophy } from "lucide-react";
import { BugHunt, Callout, CodeBlock, CodeSequence, CompareSolutions, FlipCards, KeyTakeaways, Lead, MethodGrid, PracticeCta, QuizCard, RecallCard, RichHero, RichLesson, Section, StepThrough, TypeCard, TypeCards } from "../../shared";
const BLOCK_TITLE = "Блок 20 · Остальные возможности FastAPI и Personal StudyHub";

export function Lesson116({
  module,
}: {
  module?: string;
}) {
  return (
    <RichLesson>
      <RichHero
        variant="project"
        chip={module ?? BLOCK_TITLE}
        title={"Финальный проект 4: документация и защита"}
        intro={"Доведём Personal StudyHub до передаваемого результата: проверим чистый запуск, напишем точный README, оформим OpenAPI и env-примеры, проведём security-аудит и защитим архитектурные решения на живом сценарии."}
        tags={[
          {
            icon: <Trophy size={14} />,
            label: "релиз и защита",
          },
          {
            icon: <FileText size={14} />,
            label: "README и OpenAPI",
          },
        ]}
      />

      <Callout tone="info">
        <strong>{"Связь с курсом."}</strong>
        {" "}
        {"Код и тесты уже проходят end-to-end. Последний урок не добавляет возможности, а доказывает воспроизводимость, безопасность и понимание всего пути запроса."}
        {" "}
        <strong>{"Важно не перепутать:"}</strong>
        {" "}
        {"Документация не маскирует незавершённый проект. README считается верным только после запуска по нему в чистой папке и совпадения описания с фактическим API."}
      </Callout>

      <div className="lesson-route">
        <ol>
        <li>
          <strong>{"Очистить окружение."}</strong>
          {" "}
          {"клонировать проект или использовать новую папку, создать venv и заполнить .env по примеру."}
        </li>
        <li>
          <strong>{"Воспроизвести систему."}</strong>
          {" "}
          {"alembic upgrade head → запуск → tests → ручной smoke scenario."}
        </li>
        <li>
          <strong>{"Описать результат."}</strong>
          {" "}
          {"README, OpenAPI examples, error contract, security decisions и known limitations."}
        </li>
        <li>
          <strong>{"Защитить проект."}</strong>
          {" "}
          {"проследить запрос, объяснить решение и внести маленькое изменение под наблюдением."}
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
          code={`release candidate проходит тесты`}
        >
          {"release candidate проходит тесты"}
        </TypeCard>
        <TypeCard
          badge={"+"}
          badgeTone={"float"}
          title={"Изменение урока"}
          code={`документация, аудит и защита`}
        >
          {"документация, аудит и защита"}
        </TypeCard>
        <TypeCard
          badge={"после"}
          badgeTone={"str"}
          title={"Новый результат"}
          code={`этап 5 завершён объяснимым Personal StudyHub`}
        >
          {"этап 5 завершён объяснимым Personal StudyHub"}
        </TypeCard>
      </TypeCards>

      <Section
        number={"01"}
        title={"Готовый проект — это воспроизводимый проект"}
      >
        <Lead>
          {"Фраза «у меня запускается» недостаточна. Другой разработчик должен получить репозиторий, выполнить конечный набор команд и увидеть ту же схему, API и тесты без устных подсказок."}
        </Lead>

        <div className="lesson-practice-steps">
        <h3>{"Code"}</h3>
        <p>{"реализует согласованный scope без placeholder и debug-обходов."}</p>
        <h3>{"Automation"}</h3>
        <p>{"migrations и tests повторяют состояние системы."}</p>
        <h3>{"Explanation"}</h3>
        <p>{"README и защита объясняют запуск, ограничения и ключевые решения."}</p>
        </div>

        <CodeBlock
          caption={"семь условий воспроизводимости"}
          code={`reproducible_release = (
    clean_clone
    and documented_environment
    and alembic_upgrade_head
    and application_starts
    and tests_pass
    and manual_smoke_passes
    and no_secrets_in_git
)

print(reproducible_release)`}
        />

        <TypeCards>
          <TypeCard badge={"run"} title={"Чистый запуск"} code={`venv -> env -> migrate -> uvicorn`}>
            {"Команды README проверены на новой копии проекта."}
          </TypeCard>
          <TypeCard badge={"test"} badgeTone={"float"} title={"Повторяемая проверка"} code={`python -m pytest -q`}>
            {"Негативные auth и ownership сценарии не требуют ручной настройки."}
          </TypeCard>
          <TypeCard badge={"explain"} badgeTone={"str"} title={"Осознанная защита"} code={`request -> dependency -> service -> DB`}>
            {"Автор может проследить данные и назвать причину решения."}
          </TypeCard>
        </TypeCards>

        <Callout tone="info">
          {"Не добавляйте новую функцию в день защиты. Незакрытый scope лучше честно записать как limitation, чем скрыть нестабильной реализацией."}
        </Callout>
      </Section>

      <Section
        number={"02"}
        title={"README как инструкция с нулевого состояния"}
      >
        <Lead>
          {"README пишется для человека без контекста. Он объясняет назначение, стек, требования, установку, конфигурацию, миграции, запуск, тесты, основные маршруты и известные ограничения."}
        </Lead>

        <div className="lesson-practice-steps">
        <h3>{"До запуска"}</h3>
        <p>{"версия Python, создание venv, установка зависимостей и .env."}</p>
        <h3>{"Запуск"}</h3>
        <p>{"migration command, uvicorn и адрес документации."}</p>
        <h3>{"Проверка"}</h3>
        <p>{"pytest, тестовая база и короткий ручной сценарий."}</p>
        </div>

        <CodeBlock
          caption={"минимальный каркас README"}
          code={`# Personal StudyHub API

## Requirements
- Python 3.10+
- SQLite

## Local setup
python -m venv .venv
python -m pip install -r requirements.txt
cp .env.example .env
alembic upgrade head
uvicorn app.main:app --reload

## Tests
python -m pytest -q

## Documentation
http://127.0.0.1:8000/docs`}
        />

        <MethodGrid
          rows={[
            [<>{"Project goal"}</>, "что решает Personal StudyHub и для кого"],
            [<>{"Setup"}</>, "команды от чистого клона до первого ответа"],
            [<>{"Configuration"}</>, "таблица env-переменных без реальных секретов"],
            [<>{"API flows"}</>, "registration, session, JWT, refresh и ownership"],
            [<>{"Known limitations"}</>, "честные границы учебного релиза"]
          ]}
        />

        <Callout tone="info">
          {"README не должен содержать настоящий JWT secret, API key или рабочий пароль. .env.example показывает только имена и безопасные шаблонные значения."}
        </Callout>
      </Section>

      <Section
        number={"03"}
        title={".env.example, секреты и репозиторий"}
      >
        <Lead>
          {"Файл .env.example является контрактом конфигурации, а .env — локальным секретным состоянием. Перед релизом история Git проверяется на случайно добавленные credentials и файлы базы."}
        </Lead>

        <div className="lesson-practice-steps">
        <h3>{".env.example"}</h3>
        <p>{"коммитится и перечисляет обязательные переменные."}</p>
        <h3>{".env"}</h3>
        <p>{"игнорируется и содержит реальные development secrets."}</p>
        <h3>{".gitignore"}</h3>
        <p>{"исключает venv, caches, .env, SQLite runtime files и upload directory."}</p>
        </div>

        <CodeBlock
          caption={"публичный шаблон и приватное состояние"}
          code={`# .env.example
DATABASE_URL=sqlite:///./studyhub.db
JWT_SECRET=replace-with-random-secret
IMPORT_API_KEY=replace-with-random-key
COOKIE_SECURE=false

# .gitignore
.venv/
__pycache__/
.pytest_cache/
.env
*.db
uploads/`}
        />

        <BugHunt
          code={`JWT_SECRET=prod-secret-123
IMPORT_API_KEY=real-import-key

# git status
new file: .env`}
          question={"Что нужно сделать до публикации?"}
          options={[
            "убрать .env из коммита и заменить уже раскрытые секреты",
            "переименовать .env в secrets.txt и коммитить",
            "добавить значения в README"
          ]}
          correctIndex={0}
          explanation={"Секрет, попавший в историю или отправленный наружу, считается раскрытым и требует rotation."}
          fix={`# .gitignore
.env

# .env.example содержит только безопасные placeholders`}
        />

        <Callout tone="info">
          {"Удаление строки из последнего коммита не отменяет утечку, если секрет уже был опубликован. Его нужно заменить у источника доверия."}
        </Callout>
      </Section>

      <Section
        number={"04"}
        title={"OpenAPI, примеры и ручной smoke flow"}
      >
        <Lead>
          {"Swagger UI полезен только когда схемы, descriptions и status codes совпадают с реальностью. Финальная ручная проверка проходит один полный пользовательский путь и фиксирует ожидаемые ответы."}
        </Lead>

        <div className="lesson-practice-steps">
        <h3>{"Contract"}</h3>
        <p>{"response_model, documented errors и security schemes видны в OpenAPI."}</p>
        <h3>{"Examples"}</h3>
        <p>{"показывают безопасные request/response данные без секретов."}</p>
        <h3>{"Smoke flow"}</h3>
        <p>{"register → login → create task → read profile → upload → logout."}</p>
        </div>

        <CodeBlock
          caption={"ручной сценарий защиты"}
          code={`smoke_flow = [
    "POST /auth/register -> 201",
    "POST /auth/token -> 200 access + refresh",
    "POST /tasks -> 201",
    "GET /tasks -> 200 only own tasks",
    "POST /tasks/{id}/attachments -> 201",
    "POST /auth/refresh -> 200 rotated pair",
    "reuse old refresh -> 401",
    "POST /auth/token/logout -> 204",
]

for step in smoke_flow:
    print(step)`}
        />

        <CodeSequence
          title={"Соберите демонстрацию проекта"}
          prompt={"Расположите шаги так, чтобы аудитория увидела полный пользовательский путь."}
          pieces={[
            { id: "clean", code: "показать чистую базу и alembic upgrade head" },
            { id: "register", code: "зарегистрировать пользователя" },
            { id: "login", code: "получить access/refresh или session cookie" },
            { id: "task", code: "создать и прочитать свою задачу" },
            { id: "negative", code: "доказать отказ чужому пользователю или reuse token" },
            { id: "tests", code: "запустить pytest" },
            { id: "random", code: "открыть случайный файл без объяснения", note: "не показывает сценарий" }
          ]}
          correctOrder={["clean", "register", "login", "task", "negative", "tests"]}
          explanation={"Защита идёт от воспроизводимости к положительному и отрицательному поведению."}
        />

        <Callout tone="info">
          {"Ручная демонстрация не заменяет tests. Она подтверждает, что автор умеет объяснить уже автоматизированный контракт."}
        </Callout>
      </Section>

      <Section
        number={"05"}
        title={"Security-аудит перед релизом"}
      >
        <Lead>
          {"Финальный аудит проходит по поверхностям атаки, уже изученным в этапе 5. Для каждого пункта нужна ссылка на код или тест, а не ответ «должно работать»."}
        </Lead>

        <div className="lesson-practice-steps">
        <h3>{"Credentials"}</h3>
        <p>{"password hashes, HttpOnly cookie, short access, refresh rotation и API key из env."}</p>
        <h3>{"Authorization"}</h3>
        <p>{"ownership, admin 403 и отсутствие доверия к user_id из body."}</p>
        <h3>{"Input"}</h3>
        <p>{"Pydantic validation, upload size/type/name и единые безопасные ошибки."}</p>
        </div>

        <CodeBlock
          caption={"контрольные security-инварианты"}
          code={`security_checklist = {
    "passwords": "specialized hashing + no hash in responses",
    "sessions": "random id + hash at rest + expiry + revoke",
    "jwt": "signature + exp + type + short access",
    "refresh": "rotation + old-token rejection",
    "ownership": "task id + current user id",
    "admin": "explicit permission dependency",
    "upload": "size + allowlist + generated name",
    "secrets": "environment + no logs + no git",
}`}
        />

        <FlipCards
          cards={[
            { front: <strong>{"Пароль"}</strong>, back: <span>{"Хешируется специализированной библиотекой и никогда не возвращается."}</span> },
            { front: <strong>{"Cookie-session"}</strong>, back: <span>{"HttpOnly credential связан с отзывной записью на сервере."}</span> },
            { front: <strong>{"Refresh token"}</strong>, back: <span>{"Rotation отзывает старую запись и выдаёт новую пару."}</span> },
            { front: <strong>{"Ownership"}</strong>, back: <span>{"Поиск ресурса включает current_user.id."}</span> },
            { front: <strong>{"Upload"}</strong>, back: <span>{"Сервер ограничивает размер и сам выбирает storage_name."}</span> },
            { front: <strong>{"API key"}</strong>, back: <span>{"Хранится в environment и не попадает в URL или логи."}</span> }
          ]}
        />

        <Callout tone="info">
          {"Учебный аудит не заменяет профессиональный penetration test, но доказывает, что базовые риски не игнорируются."}
        </Callout>
      </Section>

      <Section
        number={"06"}
        title={"Как объяснить путь одного запроса"}
      >
        <Lead>
          {"На защите важно не перечислять файлы, а проследить конкретный запрос. Хороший ответ показывает данные, проверки, транзакцию, response schema и возможные отказы."}
        </Lead>

        <div className="lesson-practice-steps">
        <h3>{"Вход"}</h3>
        <p>{"Authorization header и TaskPatch проходят parsing и Pydantic validation."}</p>
        <h3>{"Контекст"}</h3>
        <p>{"get_db и get_current_user выполняются до endpoint."}</p>
        <h3>{"Сценарий"}</h3>
        <p>{"service ищет owned task, меняет разрешённые поля, commit и возвращает ORM object."}</p>
        </div>

        <CodeBlock
          caption={"путь PATCH-запроса"}
          code={`PATCH /tasks/42
Authorization: Bearer <access>
{"priority": 5}

client
  -> router + Pydantic
  -> get_db
  -> bearer dependency
  -> token decode
  -> load active user
  -> task service
  -> SELECT id=42 AND user_id=current_user.id
  -> update + commit + refresh
  -> TaskRead
  -> 200 JSON`}
        />

        <StepThrough
          code={`payload = validate_body(request)
user = get_current_user(request)
task = get_owned_task(db, task_id, user.id)
apply_patch(task, payload)
db.commit()
db.refresh(task)
return TaskRead.model_validate(task)`}
          steps={[
            { line: 0, note: "Pydantic отделяет невалидное тело до бизнес-логики.", vars: {"payload": "TaskPatch"} },
            { line: 1, note: "Credential превращается в активного User.", vars: {"user": "current user"} },
            { line: 2, note: "Ownership входит в запрос к базе.", vars: {"filter": "task_id + user.id"} },
            { line: 3, note: "Меняются только разрешённые поля.", vars: {"task": "dirty ORM object"} },
            { line: 4, note: "Commit фиксирует транзакцию.", vars: {"transaction": "committed"} },
            { line: 6, note: "Response schema формирует безопасный JSON.", vars: {"status": "200"} }
          ]}
        />

        <Callout tone="info">
          {"Если автор не может объяснить, где возникает 401, 404 или rollback, соответствующая часть проекта ещё не считается усвоенной."}
        </Callout>
      </Section>

      <Section
        number={"07"}
        title={"Живое изменение без разрушения проекта"}
      >
        <Lead>
          {"Последняя часть защиты проверяет не память, а способность найти ответственное место. Наставник даёт маленькое изменение: новый filter, дополнительное разрешение или новый лимит upload."}
        </Lead>

        <div className="lesson-practice-steps">
        <h3>{"Найти контракт"}</h3>
        <p>{"определить route, schema, service и тест, которых касается изменение."}</p>
        <h3>{"Сделать минимально"}</h3>
        <p>{"не переписывать auth flow и соседние модули."}</p>
        <h3>{"Проверить регрессию"}</h3>
        <p>{"новый тест плюс полный существующий набор."}</p>
        </div>

        <CodeBlock
          caption={"пример задачи на защите"}
          code={`change_request = "Admin can deactivate a user"

affected_surface = [
    "PATCH /admin/users/{user_id}/deactivate",
    "require_admin dependency",
    "user service deactivate operation",
    "UserRead response",
    "tests: admin success + user 403 + inactive login 401",
]`}
        />

        <CompareSolutions
          question={"Как безопаснее внести изменение?"}
          left={{
            title: "Править всё сразу",
            code: `router + auth rewrite + models rename + tests later`,
            note: "Большой diff скрывает причину ошибки.",
          }}
          right={{
            title: "Один контракт",
            code: `schema -> service -> route -> focused tests -> full suite`,
            note: "Изменение ограничено конкретным сценарием.",
          }}
          preferred={"right"}
          explanation={"Минимальный вертикальный срез сохраняет существующее поведение и облегчает ревью."}
        />

        <Callout tone="info">
          {"Изменение считается завершённым после обновления README/OpenAPI, если внешний контракт действительно изменился."}
        </Callout>
      </Section>

      <Section
        number={"08"}
        title={"Финальная контрольная точка этапа 5"}
      >
        <Lead>
          {"Ученик завершает этап не списком терминов, а защищённым Personal StudyHub API. Проект запускается с нуля, проходит тесты и остаётся понятным без наставника рядом."}
        </Lead>

        <div className="lesson-practice-steps">
        <h3>{"Техническая готовность"}</h3>
        <p>{"migrations, auth flows, CRUD, rights, uploads и tests работают."}</p>
        <h3>{"Объяснение"}</h3>
        <p>{"различаются identity, authentication, authorization, session, JWT и API key."}</p>
        <h3>{"Передача"}</h3>
        <p>{"README, .env.example, OpenAPI и known limitations совпадают с кодом."}</p>
        </div>

        <CodeBlock
          caption={"готовность этапа 5"}
          code={`final_gate = {
    "clean_setup": True,
    "migrations": True,
    "session_auth": True,
    "jwt_refresh_rotation": True,
    "ownership_and_admin": True,
    "safe_upload": True,
    "error_contract": True,
    "isolated_tests": True,
    "readme_verified": True,
    "defense_passed": True,
}

print(all(final_gate.values()))`}
        />

        <RecallCard
          question={"Какой главный результат этапа 5?"}
          hint={"Не количество auth-механизмов, а законченный продукт."}
          answer={
            <p>{"Воспроизводимый Personal StudyHub API с пользователями, session и JWT flow, refresh rotation, ownership, admin permission, безопасным upload, едиными ошибками, миграциями, изолированными тестами и объяснимой архитектурой."}</p>
          }
        />

        <Callout tone="info">
          {"Следующий этап может вводить новые технологии только после сохранения этой базы качества. Завершённый монолит важнее набора незакреплённых инструментов."}
        </Callout>

        <div className="lesson-check-group">
          <QuizCard
            question={"Что доказывает чистый запуск?"}
            options={[
              "проект воспроизводим без скрытого локального состояния",
              "код содержит больше файлов",
              "Swagger открыт в браузере"
            ]}
            correctIndex={0}
            explanation={"Новая копия должна пройти setup, migrations, run и tests по документации."}
          />
          <QuizCard
            question={"Что хранится в .env.example?"}
            options={[
              "имена переменных и безопасные шаблоны",
              "реальные production secrets",
              "пароли пользователей"
            ]}
            correctIndex={0}
            explanation={"Пример конфигурации коммитится без действительных credential."}
          />
          <QuizCard
            question={"Что нужно уметь на защите?"}
            options={[
              "проследить конкретный запрос и объяснить отказы",
              "только перечислить библиотеки",
              "показать число строк"
            ]}
            correctIndex={0}
            explanation={"Понимание видно по пути данных и причинам решений."}
          />
          <QuizCard
            question={"Когда изменение готово?"}
            options={[
              "после focused test, full suite и обновления контракта",
              "сразу после правки router",
              "после нового названия ветки"
            ]}
            correctIndex={0}
            explanation={"Проверка регрессии и документация завершают изменение."}
          />
        </div>

        <KeyTakeaways
          points={[
            <>{"Завершённый проект воспроизводится с чистого клона."}</>,
            <>{"README описывает фактические setup, migrations, run и tests."}</>,
            <>{".env.example коммитится, реальные secrets — нет."}</>,
            <>{"OpenAPI и ручной smoke flow должны совпадать с реализацией."}</>,
            <>{"Security-аудит ссылается на код и негативные тесты."}</>,
            <>{"Защита прослеживает один запрос через все слои."}</>,
            <>{"Живое изменение выполняется минимальным вертикальным срезом."}</>,
            <>{"Known limitations указываются честно."}</>,
            <>{"Этап 5 завершается Personal StudyHub API, а не набором фрагментов."}</>
          ]}
        />

        <PracticeCta
          text={"Проведите clean-room запуск, завершите README и .env.example, проверьте OpenAPI и security checklist, выполните smoke flow, запустите tests дважды и проведите защиту с объяснением PATCH /tasks/{task_id}."}
        />
      </Section>
    </RichLesson>
  );
}
