import {
  Boxes,
  CheckCircle2,
  FileText,
  FolderGit2,
  GitFork,
  KeyRound,
  Save,
  ShieldCheck,
  Trophy
} from "lucide-react";
import {
  BranchExplorer,
  BugHunt,
  Callout,
  CodeBlock,
  CodeSequence,
  CompareSolutions,
  FillBlank,
  FlipCards,
  KeyTakeaways,
  Lead,
  MatchPairs,
  MethodGrid,
  PracticeCta,
  PredictOutput,
  QuizCard,
  RecallCard,
  RichHero,
  RichLesson,
  Section,
  StepThrough,
  TerminalDemo,
  TrueFalse,
  TypeCard,
  TypeCards
} from "../shared";

const BLOCK_TITLE =
  "Блок 20 · Остальные возможности FastAPI и Personal StudyHub";


// 111. HTTP Basic и API key
export function Lesson111({
  module,
}: {
  module?: string;
}) {
  return (
    <RichLesson>
      <RichHero
        variant="project"
        chip={module ?? BLOCK_TITLE}
        title={"HTTP Basic и API key"}
        intro={"Сравним два простых способа доступа без смешения ролей: HTTP Basic подтвердит человека парой логин/пароль, а X-API-Key защитит служебный импорт постоянным секретом интеграции."}
        tags={[
          {
            icon: <KeyRound size={14} />,
            label: "Basic credentials",
          },
          {
            icon: <ShieldCheck size={14} />,
            label: "X-API-Key",
          },
        ]}
      />

      <Callout tone="info">
        <strong>{"Связь с курсом."}</strong>
        {" "}
        {"Пользовательские session и JWT уже работают. Теперь важно увидеть, что FastAPI поддерживает и более простые схемы, но каждая отвечает на другой вопрос."}
        {" "}
        <strong>{"Важно не перепутать:"}</strong>
        {" "}
        {"Basic и API key не заменяют полноценную пользовательскую авторизацию автоматически. Basic передаёт credentials при каждом запросе, а API key обычно идентифицирует сервис или интеграцию."}
      </Callout>

      <div className="lesson-route">
        <ol>
        <li>
          <strong>{"Разделить роли."}</strong>
          {" "}
          {"человек входит по credentials, служебный клиент предъявляет заранее выданный ключ."}
        </li>
        <li>
          <strong>{"Построить dependency."}</strong>
          {" "}
          {"извлечь credential из стандартного места и сравнить безопасным способом."}
        </li>
        <li>
          <strong>{"Защитить сценарий."}</strong>
          {" "}
          {"подключить X-API-Key только к endpoint импорта и проверить негативные случаи."}
        </li>
        <li>
          <strong>{"Объяснить границу."}</strong>
          {" "}
          {"не хранить ключ в query string и не считать Base64 шифрованием."}
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
          code={`session и JWT защищают пользователей`}
        >
          {"session и JWT защищают пользователей"}
        </TypeCard>
        <TypeCard
          badge={"+"}
          badgeTone={"float"}
          title={"Изменение урока"}
          code={`Basic-пример и служебный X-API-Key`}
        >
          {"Basic-пример и служебный X-API-Key"}
        </TypeCard>
        <TypeCard
          badge={"после"}
          badgeTone={"str"}
          title={"Новый результат"}
          code={`разные схемы доступа не смешаны`}
        >
          {"разные схемы доступа не смешаны"}
        </TypeCard>
      </TypeCards>

      <Section
        number={"01"}
        title={"Два механизма — две разные задачи"}
      >
        <Lead>
          {"В Personal StudyHub уже есть пользовательские cookie-session и JWT. HTTP Basic и API key добавляются не как «ещё два логина», а как отдельные инструменты для ограниченных сценариев."}
        </Lead>

        <div className="lesson-practice-steps">
        <h3>{"HTTP Basic"}</h3>
        <p>{"клиент отправляет имя и пароль в заголовке Authorization при каждом запросе."}</p>
        <h3>{"API key"}</h3>
        <p>{"клиент предъявляет заранее выданный секрет интеграции, например для импорта данных."}</p>
        <h3>{"Главный вопрос"}</h3>
        <p>{"кого или что мы идентифицируем: пользователя, устройство, скрипт или внешний сервис."}</p>
        </div>

        <CodeBlock
          caption={"два независимых контракта доступа"}
          code={`# Пользовательский сценарий
GET /basic/profile
Authorization: Basic <base64(username:password)>

# Служебный сценарий
POST /integrations/import
X-API-Key: <service-secret>`}
        />

        <TypeCards>
          <TypeCard badge={"Basic"} title={"Человек предъявляет credentials"} code={`Authorization: Basic ...`}>
            {"Сервер получает username и password и проверяет их как обычные учётные данные."}
          </TypeCard>
          <TypeCard badge={"API key"} badgeTone={"float"} title={"Интеграция предъявляет секрет"} code={`X-API-Key: ...`}>
            {"Ключ обычно связан со служебным клиентом, а не с интерактивной формой входа пользователя."}
          </TypeCard>
          <TypeCard badge={"Session/JWT"} badgeTone={"str"} title={"Основной вход StudyHub"} code={`Cookie или Bearer`}>
            {"Уже изученные механизмы остаются основой защищённого CRUD пользователей."}
          </TypeCard>
        </TypeCards>

        <Callout tone="info">
          {"Сначала назовите субъект доступа и срок жизни credential. Только после этого выбирайте конкретную схему."}
        </Callout>
      </Section>

      <Section
        number={"02"}
        title={"Что реально передаёт HTTP Basic"}
      >
        <Lead>
          {"Basic складывает username и password в строку, кодирует её Base64 и помещает в Authorization. Base64 позволяет передать байты текстом, но не скрывает содержимое от перехвата."}
        </Lead>

        <div className="lesson-practice-steps">
        <h3>{"Формат"}</h3>
        <p>{"Authorization: Basic <credentials>."}</p>
        <h3>{"Base64"}</h3>
        <p>{"это кодирование, которое легко обратимо без секретного ключа."}</p>
        <h3>{"Защита канала"}</h3>
        <p>{"Basic допустим только поверх HTTPS, иначе пароль можно прочитать из трафика."}</p>
        </div>

        <CodeBlock
          caption={"Base64 можно обратить"}
          code={`import base64

raw = b"mentor:correct-horse"
encoded = base64.b64encode(raw).decode("ascii")
decoded = base64.b64decode(encoded).decode("utf-8")

print(encoded)
print(decoded)`}
        />

        <PredictOutput
          code={`import base64

value = base64.b64encode(b"nikita:secret").decode("ascii")
print(base64.b64decode(value).decode("utf-8"))`}
          output={`nikita:secret`}
          hint={"Кодирование не использует секретный ключ и потому не является шифрованием."}
        />

        <Callout tone="info">
          {"В учебном локальном запуске можно увидеть механику, но реальный Basic endpoint нельзя публиковать без HTTPS."}
        </Callout>
      </Section>

      <Section
        number={"03"}
        title={"HTTPBasicCredentials и безопасное сравнение"}
      >
        <Lead>
          {"FastAPI извлекает пару через HTTPBasic. Dependency получает объект HTTPBasicCredentials, затем приложение само решает, где и как проверить пользователя."}
        </Lead>

        <div className="lesson-practice-steps">
        <h3>{"Извлечение"}</h3>
        <p>{"HTTPBasic читает стандартный заголовок и разбирает credentials."}</p>
        <h3>{"Проверка"}</h3>
        <p>{"username и password сравниваются с ожидаемыми значениями или через auth service."}</p>
        <h3>{"Ответ"}</h3>
        <p>{"при ошибке возвращается 401 и заголовок WWW-Authenticate: Basic."}</p>
        </div>

        <CodeBlock
          caption={"dependency для учебного Basic endpoint"}
          code={`import secrets
from typing import Annotated

from fastapi import Depends, FastAPI, HTTPException, status
from fastapi.security import HTTPBasic, HTTPBasicCredentials

app = FastAPI()
basic = HTTPBasic()


def require_basic_user(
    credentials: Annotated[HTTPBasicCredentials, Depends(basic)],
) -> str:
    username_ok = secrets.compare_digest(credentials.username, "mentor")
    password_ok = secrets.compare_digest(credentials.password, "studyhub")
    if not (username_ok and password_ok):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid basic credentials",
            headers={"WWW-Authenticate": "Basic"},
        )
    return credentials.username`}
        />

        <CodeSequence
          title={"Соберите путь Basic-запроса"}
          prompt={"Расположите действия от входящего запроса до выполнения endpoint."}
          pieces={[
            { id: "header", code: "прочитать Authorization" },
            { id: "decode", code: "разобрать Basic credentials" },
            { id: "compare", code: "сравнить username и password" },
            { id: "reject", code: "при ошибке вернуть 401 + WWW-Authenticate" },
            { id: "endpoint", code: "передать username в endpoint" },
            { id: "store", code: "сохранить открытый пароль в базе", note: "опасное лишнее действие" }
          ]}
          correctOrder={["header", "decode", "compare", "reject", "endpoint"]}
          explanation={"Security dependency отвечает за извлечение и проверку, а endpoint получает уже подтверждённое имя."}
        />

        <Callout tone="info">
          {"В реальном проекте открытый пароль не сравнивают с константой: используется существующий password service с хешем."}
        </Callout>
      </Section>

      <Section
        number={"04"}
        title={"API key в заголовке X-API-Key"}
      >
        <Lead>
          {"Служебный импорт не требует пользовательского профиля. Ему нужен отдельный секрет интеграции, который удобно читать через APIKeyHeader и проверять в dependency."}
        </Lead>

        <div className="lesson-practice-steps">
        <h3>{"Имя заголовка"}</h3>
        <p>{"X-API-Key становится частью публичного контракта интеграции."}</p>
        <h3>{"auto_error=False"}</h3>
        <p>{"позволяет сформировать собственный единый ответ при отсутствии ключа."}</p>
        <h3>{"Настройки"}</h3>
        <p>{"эталонный ключ приходит из окружения, а не записывается в исходный код."}</p>
        </div>

        <CodeBlock
          caption={"dependency служебного ключа"}
          code={`import secrets
from typing import Annotated

from fastapi import Depends, HTTPException, status
from fastapi.security import APIKeyHeader

api_key_header = APIKeyHeader(name="X-API-Key", auto_error=False)


def require_import_key(
    api_key: Annotated[str | None, Depends(api_key_header)],
) -> None:
    if api_key is None or not secrets.compare_digest(
        api_key,
        settings.import_api_key,
    ):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid API key",
        )`}
        />

        <FillBlank
          prompt={"Укажите имя заголовка, которое увидит клиент интеграции."}
          before={"APIKeyHeader(name=\""}
          after={"\", auto_error=False)"}
          options={["X-API-Key", "password", "api_key_query"]}
          answer={"X-API-Key"}
          explanation={"Клиент передаёт ключ в выделенном HTTP-заголовке."}
        />

        <Callout tone="info">
          {"Dependency возвращает None: после успешной проверки endpoint не обязан получать сам секрет и случайно логировать его."}
        </Callout>
      </Section>

      <Section
        number={"05"}
        title={"Почему query-параметр хуже заголовка"}
      >
        <Lead>
          {"Ключ в URL технически возможен, но URL чаще попадает в историю браузера, reverse-proxy логи, аналитику и referrer. Заголовок не решает все проблемы, но лучше выражает credential."}
        </Lead>

        <div className="lesson-practice-steps">
        <h3>{"Query"}</h3>
        <p>{"виден прямо в адресе и часто сохраняется инфраструктурой целиком."}</p>
        <h3>{"Header"}</h3>
        <p>{"отделяет служебный credential от адреса ресурса."}</p>
        <h3>{"Всегда"}</h3>
        <p>{"секрет нельзя печатать, коммитить и возвращать в тексте ошибки."}</p>
        </div>

        <CodeBlock
          caption={"URL против credential-заголовка"}
          code={`# Плохой публичный контракт
POST /integrations/import?api_key=top-secret

# Предпочтительный контракт
POST /integrations/import
X-API-Key: top-secret`}
        />

        <CompareSolutions
          question={"Как передать постоянный служебный секрет импортёра?"}
          left={{
            title: "Ключ в URL",
            code: `POST /import?api_key=secret`,
            note: "Может оказаться в истории, логах и аналитике URL.",
          }}
          right={{
            title: "Ключ в заголовке",
            code: `X-API-Key: secret`,
            note: "Credential отделён от пути и query-параметров ресурса.",
          }}
          preferred={"right"}
          explanation={"Для API key заголовок лучше выражает назначение и снижает число случайных утечек через URL."}
        />

        <Callout tone="info">
          {"Даже правильный заголовок требует HTTPS, безопасного хранения, ротации и запрета на логирование значения."}
        </Callout>
      </Section>

      <Section
        number={"06"}
        title={"Защищаем endpoint импорта StudyHub"}
      >
        <Lead>
          {"Endpoint принимает подготовленный набор задач от доверенного служебного клиента. API key проверяется до чтения и изменения базы, а бизнес-операция остаётся в сервисе импорта."}
        </Lead>

        <div className="lesson-practice-steps">
        <h3>{"До endpoint"}</h3>
        <p>{"Depends(require_import_key) останавливает запрос без доверенного ключа."}</p>
        <h3>{"В endpoint"}</h3>
        <p>{"валидированная схема передаётся import service."}</p>
        <h3>{"В сервисе"}</h3>
        <p>{"транзакция создаёт записи или откатывается как единая операция."}</p>
        </div>

        <CodeBlock
          caption={"endpoint связывает security и import service"}
          code={`from typing import Annotated

from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

router = APIRouter(prefix="/integrations", tags=["integrations"])


@router.post(
    "/tasks/import",
    status_code=status.HTTP_201_CREATED,
    dependencies=[Depends(require_import_key)],
)
def import_tasks(
    payload: TaskImportRequest,
    db: Annotated[Session, Depends(get_db)],
) -> ImportResult:
    return import_service.import_tasks(db, payload.items)`}
        />

        <BranchExplorer
          code={`key = request.headers.get("X-API-Key")
if key is None:
    return "401 missing"
elif not key_is_valid(key):
    return "401 invalid"
else:
    return "run import"`}
          scenarios={[
            { label: "заголовка нет", activeLine: 2, output: "401 missing" },
            { label: "ключ неверный", activeLine: 4, output: "401 invalid" },
            { label: "ключ верный", activeLine: 6, output: "run import" }
          ]}
        />

        <Callout tone="info">
          {"Использование dependencies=[...] подходит, когда результат dependency не нужен среди параметров endpoint."}
        </Callout>
      </Section>

      <Section
        number={"07"}
        title={"Негативные сценарии и ротация ключа"}
      >
        <Lead>
          {"Схема считается законченной, когда проверены отсутствие credential, неправильное значение, старый ключ после ротации и корректный доступ. Секрет должен меняться без правки исходного кода."}
        </Lead>

        <div className="lesson-practice-steps">
        <h3>{"Missing"}</h3>
        <p>{"клиент получает одинаково оформленный отказ и операция не начинается."}</p>
        <h3>{"Invalid"}</h3>
        <p>{"ответ не сообщает, какая часть ключа совпала или какой ключ ожидался."}</p>
        <h3>{"Rotated"}</h3>
        <p>{"новое значение берётся из окружения после контролируемого перезапуска."}</p>
        </div>

        <CodeBlock
          caption={"два обязательных интеграционных теста"}
          code={`from fastapi.testclient import TestClient


def test_import_rejects_missing_api_key(client: TestClient) -> None:
    response = client.post("/integrations/tasks/import", json={"items": []})
    assert response.status_code == 401


def test_import_accepts_valid_api_key(client: TestClient) -> None:
    response = client.post(
        "/integrations/tasks/import",
        headers={"X-API-Key": "test-key"},
        json={"items": []},
    )
    assert response.status_code == 201`}
        />

        <BugHunt
          code={`logger.info("import key=%s", api_key)
if api_key != settings.import_api_key:
    raise HTTPException(401, detail=f"Expected {settings.import_api_key}")`}
          question={"Какая ошибка опаснее всего?"}
          options={[
            "Секрет попадает и в лог, и в HTTP-ответ",
            "Используется status code 401",
            "Dependency получает строку"
          ]}
          correctIndex={0}
          explanation={"Credential нельзя выводить ни в логи, ни в detail ошибки."}
          fix={`if not secrets.compare_digest(api_key, settings.import_api_key):
    raise HTTPException(status_code=401, detail="Invalid API key")`}
        />

        <Callout tone="info">
          {"Логи могут содержать имя интеграции, request id и результат импорта, но не сам ключ."}
        </Callout>
      </Section>

      <Section
        number={"08"}
        title={"Контрольная точка: выбрать схему осознанно"}
      >
        <Lead>
          {"Закрепите различие на трёх клиентах: браузерный пользователь, внутренний импортёр и учебный диагностический endpoint. У каждого должен быть свой минимальный credential."}
        </Lead>

        <div className="lesson-practice-steps">
        <h3>{"Пользователь"}</h3>
        <p>{"session или JWT связывает запросы с User и правами."}</p>
        <h3>{"Импортёр"}</h3>
        <p>{"X-API-Key подтверждает доверенную интеграцию без пользовательской сессии."}</p>
        <h3>{"Basic-пример"}</h3>
        <p>{"изолированно демонстрирует стандартный Authorization и обязательность HTTPS."}</p>
        </div>

        <CodeBlock
          caption={"карта доступа блока"}
          code={`access_map = {
    "GET /users/me": "session or bearer",
    "POST /integrations/tasks/import": "X-API-Key",
    "GET /examples/basic": "HTTP Basic",
}

for route, scheme in access_map.items():
    print(f"{route} -> {scheme}")`}
        />

        <MatchPairs
          prompt={"Соедините сценарий с наиболее подходящей схемой."}
          leftTitle={"Сценарий"}
          rightTitle={"Схема"}
          pairs={[
            { left: "профиль пользователя", right: "session или JWT" },
            { left: "служебный импорт", right: "X-API-Key" },
            { left: "минимальный стандартный пример", right: "HTTP Basic" }
          ]}
          explanation={"Схема выбирается по субъекту и жизненному циклу credential."}
        />

        <Callout tone="info">
          {"Готовность урока определяется не количеством схем, а способностью объяснить, почему конкретный endpoint использует именно эту."}
        </Callout>

        <div className="lesson-check-group">
          <QuizCard
            question={"Что делает Base64 в HTTP Basic?"}
            options={[
              "шифрует пароль",
              "кодирует строку обратимым способом",
              "создаёт JWT"
            ]}
            correctIndex={1}
            explanation={"Base64 не использует секрет и легко декодируется."}
          />
          <QuizCard
            question={"Где предпочтительно передавать API key?"}
            options={[
              "в X-API-Key",
              "в имени файла",
              "в query URL"
            ]}
            correctIndex={0}
            explanation={"Выделенный заголовок лучше выражает credential и реже сохраняется как часть URL."}
          />
          <QuizCard
            question={"Что должно защищать Basic в сети?"}
            options={[
              "HTTPS",
              "длинное имя пользователя",
              "формат JSON"
            ]}
            correctIndex={0}
            explanation={"Без TLS credentials можно перехватить."}
          />
          <QuizCard
            question={"Когда результат dependency можно не добавлять в сигнатуру endpoint?"}
            options={[
              "когда важен только факт успешной проверки",
              "никогда",
              "только для GET"
            ]}
            correctIndex={0}
            explanation={"dependencies=[Depends(...)] подходит для проверки без передаваемого результата."}
          />
        </div>

        <KeyTakeaways
          points={[
            <>{"HTTP Basic передаёт credentials при каждом запросе."}</>,
            <>{"Base64 — кодирование, а не шифрование."}</>,
            <>{"Basic требует HTTPS и стандартного WWW-Authenticate при отказе."}</>,
            <>{"API key обычно идентифицирует интеграцию, а не пользователя."}</>,
            <>{"Служебный ключ лучше передавать в заголовке X-API-Key."}</>,
            <>{"Секреты приходят из окружения и никогда не попадают в логи."}</>,
            <>{"Security dependency останавливает запрос до бизнес-операции."}</>
          ]}
        />

        <PracticeCta
          text={"Добавьте отдельный Basic-пример и защитите POST /integrations/tasks/import через X-API-Key. Покройте отсутствие, неверный и корректный ключ TestClient-тестами."}
        />
      </Section>
    </RichLesson>
  );
}

// 112. Form, multipart и UploadFile
export function Lesson112({
  module,
}: {
  module?: string;
}) {
  return (
    <RichLesson>
      <RichHero
        variant="project"
        chip={module ?? BLOCK_TITLE}
        title={"Form, multipart и UploadFile"}
        intro={"Научим Personal StudyHub принимать не только JSON: разберём HTML-формы, multipart/form-data и безопасную загрузку вложения задачи без доверия к имени, типу и размеру файла."}
        tags={[
          {
            icon: <FileText size={14} />,
            label: "Form и multipart",
          },
          {
            icon: <Save size={14} />,
            label: "безопасный UploadFile",
          },
        ]}
      />

      <Callout tone="info">
        <strong>{"Связь с курсом."}</strong>
        {" "}
        {"Маршруты уже принимают JSON-схемы, а auth token endpoint знаком с form-urlencoded. Теперь запрос должен одновременно передать текстовые поля и бинарный файл."}
        {" "}
        <strong>{"Важно не перепутать:"}</strong>
        {" "}
        {"UploadFile предоставляет поток и метаданные, но не доказывает безопасность содержимого. Content-Type, имя и размер считаются недоверенными входными данными."}
      </Callout>

      <div className="lesson-route">
        <ol>
        <li>
          <strong>{"Сравнить тела."}</strong>
          {" "}
          {"понять, когда нужен JSON, application/x-www-form-urlencoded или multipart/form-data."}
        </li>
        <li>
          <strong>{"Принять файл."}</strong>
          {" "}
          {"использовать UploadFile и синхронный file.file внутри обычного def endpoint."}
        </li>
        <li>
          <strong>{"Проверить границы."}</strong>
          {" "}
          {"ограничить размер и тип, сгенерировать серверное имя, не доверять filename."}
        </li>
        <li>
          <strong>{"Сохранить согласованно."}</strong>
          {" "}
          {"разделить файл на диске и метаданные в базе, затем протестировать оба результата."}
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
          code={`API принимает JSON и credentials form`}
        >
          {"API принимает JSON и credentials form"}
        </TypeCard>
        <TypeCard
          badge={"+"}
          badgeTone={"float"}
          title={"Изменение урока"}
          code={`multipart и вложение задачи`}
        >
          {"multipart и вложение задачи"}
        </TypeCard>
        <TypeCard
          badge={"после"}
          badgeTone={"str"}
          title={"Новый результат"}
          code={`файл и метаданные сохраняются безопасно`}
        >
          {"файл и метаданные сохраняются безопасно"}
        </TypeCard>
      </TypeCards>

      <Section
        number={"01"}
        title={"Три формата тела запроса"}
      >
        <Lead>
          {"Тело HTTP-запроса имеет Content-Type. FastAPI выбирает способ разбора не по названию endpoint, а по объявленным параметрам и фактическому формату клиента."}
        </Lead>

        <div className="lesson-practice-steps">
        <h3>{"application/json"}</h3>
        <p>{"удобен для вложенных структур и обычного API CRUD."}</p>
        <h3>{"application/x-www-form-urlencoded"}</h3>
        <p>{"передаёт простые пары полей, как форма логина."}</p>
        <h3>{"multipart/form-data"}</h3>
        <p>{"разделяет тело на части и может переносить текст вместе с бинарным файлом."}</p>
        </div>

        <CodeBlock
          caption={"один HTTP endpoint — один ожидаемый формат"}
          code={`POST /tasks
Content-Type: application/json
{"title": "Read SQL", "priority": 4}

POST /auth/token
Content-Type: application/x-www-form-urlencoded
username=nikita&password=secret

POST /tasks/7/attachments
Content-Type: multipart/form-data; boundary=...
title=diagram&file=<binary bytes>`}
        />

        <TypeCards>
          <TypeCard badge={"JSON"} title={"Структурированные данные"} code={`{"title": "SQL"}`}>
            {"Основной формат request schemas и response schemas в REST API."}
          </TypeCard>
          <TypeCard badge={"Form"} badgeTone={"float"} title={"Простые поля формы"} code={`username=...&password=...`}>
            {"Подходит для HTML-форм и OAuth2PasswordRequestForm."}
          </TypeCard>
          <TypeCard badge={"Multipart"} badgeTone={"str"} title={"Поля плюс файл"} code={`description + file`}>
            {"Каждая часть имеет собственные заголовки и содержимое."}
          </TypeCard>
        </TypeCards>

        <Callout tone="info">
          {"JSON и multipart не объединяются автоматически в одну Pydantic body-модель: формат контракта нужно спроектировать явно."}
        </Callout>
      </Section>

      <Section
        number={"02"}
        title={"Form и установка python-multipart"}
      >
        <Lead>
          {"Параметр Form сообщает FastAPI, что значение приходит не из JSON. Для разбора form-data и multipart проекту нужна зависимость python-multipart."}
        </Lead>

        <div className="lesson-practice-steps">
        <h3>{"Явное объявление"}</h3>
        <p>{"Form(...) отличает поле формы от query-параметра."}</p>
        <h3>{"Annotated"}</h3>
        <p>{"метаданные источника остаются рядом с типом."}</p>
        <h3>{"Зависимость проекта"}</h3>
        <p>{"python-multipart фиксируется в requirements или pyproject."}</p>
        </div>

        <CodeBlock
          caption={"два валидируемых поля формы"}
          code={`from typing import Annotated

from fastapi import APIRouter, Form

router = APIRouter()


@router.post("/feedback")
def create_feedback(
    topic: Annotated[str, Form(min_length=3, max_length=80)],
    message: Annotated[str, Form(min_length=1, max_length=1000)],
) -> dict[str, str]:
    return {"topic": topic, "message": message}`}
        />

        <TerminalDemo
          title={"подготовка multipart"}
          lines={[
            { cmd: "python -m pip install python-multipart" },
            { out: "Successfully installed python-multipart" },
            { cmd: "curl -X POST http://127.0.0.1:8000/feedback -F \"topic=API\" -F \"message=Works\"" },
            { out: "{\"topic\":\"API\",\"message\":\"Works\"}" }
          ]}
        />

        <Callout tone="info">
          {"Отсутствующая библиотека проявляется при построении маршрута. Это зависимость приложения, а не случайная настройка локального компьютера."}
        </Callout>
      </Section>

      <Section
        number={"03"}
        title={"UploadFile вместо bytes для больших файлов"}
      >
        <Lead>
          {"Параметр bytes заставляет собрать всё содержимое в памяти. UploadFile предоставляет метаданные и файловый объект, который может быть временно сохранён на диск и читаться порциями."}
        </Lead>

        <div className="lesson-practice-steps">
        <h3>{"filename"}</h3>
        <p>{"исходное имя клиента полезно только как метаданные для отображения."}</p>
        <h3>{"content_type"}</h3>
        <p>{"заявленный MIME-type помогает первичной проверке, но может быть подделан."}</p>
        <h3>{"file"}</h3>
        <p>{"синхронный file-like объект подходит для обычного def endpoint текущего этапа."}</p>
        </div>

        <CodeBlock
          caption={"метаданные UploadFile"}
          code={`from typing import Annotated

from fastapi import File, UploadFile


def inspect_upload(
    upload: Annotated[UploadFile, File(description="Task attachment")],
) -> dict[str, str | None]:
    return {
        "filename": upload.filename,
        "content_type": upload.content_type,
    }`}
        />

        <CompareSolutions
          question={"Как принимать файл, который может быть больше нескольких килобайт?"}
          left={{
            title: "bytes",
            code: `file: bytes`,
            note: "Всё содержимое собирается в оперативной памяти до вызова endpoint.",
          }}
          right={{
            title: "UploadFile",
            code: `file: UploadFile`,
            note: "Доступны поток, filename, content_type и временное хранение.",
          }}
          preferred={"right"}
          explanation={"UploadFile даёт более подходящий контракт для потоковой проверки и сохранения."}
        />

        <Callout tone="info">
          {"На этом этапе endpoint остаётся синхронным: чтение выполняется через upload.file, без введения async/await."}
        </Callout>
      </Section>

      <Section
        number={"04"}
        title={"Размер нужно ограничить до сохранения"}
      >
        <Lead>
          {"Заявленный Content-Length может отсутствовать или быть неверным. Надёжный учебный контроль читает максимум limit + 1 байт и отклоняет файл, если получено больше лимита."}
        </Lead>

        <div className="lesson-practice-steps">
        <h3>{"Лимит"}</h3>
        <p>{"задаётся константой или настройкой и отражается в документации."}</p>
        <h3>{"Проверка"}</h3>
        <p>{"читается только ограниченный объём, а не бесконечный поток в память."}</p>
        <h3>{"Позиция"}</h3>
        <p>{"после проверки file.seek(0) возвращает поток к началу перед копированием."}</p>
        </div>

        <CodeBlock
          caption={"жёсткая граница 2 MiB"}
          code={`from fastapi import HTTPException, UploadFile, status

MAX_UPLOAD_BYTES = 2 * 1024 * 1024


def validate_size(upload: UploadFile) -> None:
    chunk = upload.file.read(MAX_UPLOAD_BYTES + 1)
    if len(chunk) > MAX_UPLOAD_BYTES:
        raise HTTPException(
            status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
            detail="File is too large",
        )
    upload.file.seek(0)`}
        />

        <StepThrough
          code={`limit = 4
data = stream.read(limit + 1)
if len(data) > limit:
    result = "reject"
else:
    stream.seek(0)
    result = "save"`}
          steps={[
            { line: 0, note: "Приложение знает максимально допустимый объём.", vars: {"limit": "4 bytes"} },
            { line: 1, note: "Читаем на один байт больше, чтобы заметить превышение.", vars: {"read": "up to 5 bytes"} },
            { line: 2, note: "Сравниваем фактически прочитанный размер.", vars: {"condition": "len(data) > 4"} },
            { line: 4, note: "Для допустимого файла возвращаем указатель к началу.", vars: {"position": "0"} },
            { line: 5, note: "Только после проверки начинается сохранение.", vars: {"result": "save"} }
          ]}
        />

        <Callout tone="info">
          {"413 сообщает именно о слишком большом теле. Это понятнее, чем общий 400 без причины."}
        </Callout>
      </Section>

      <Section
        number={"05"}
        title={"Не доверяем filename и content_type"}
      >
        <Lead>
          {"Клиент может прислать имя ../../config.py или указать image/png для произвольных байтов. Сервер генерирует собственное имя и ограничивает разрешённые типы."}
        </Lead>

        <div className="lesson-practice-steps">
        <h3>{"Серверное имя"}</h3>
        <p>{"UUID или другой идентификатор исключает путь, переданный клиентом."}</p>
        <h3>{"Расширение"}</h3>
        <p>{"выбирается из allowlist по проверенному типу, а не копируется целиком."}</p>
        <h3>{"Папка"}</h3>
        <p>{"итоговый Path должен оставаться внутри заранее определённого upload directory."}</p>
        </div>

        <CodeBlock
          caption={"сервер выбирает безопасный путь"}
          code={`from pathlib import Path
from uuid import uuid4

ALLOWED_TYPES = {
    "image/png": ".png",
    "image/jpeg": ".jpg",
    "application/pdf": ".pdf",
}


def build_storage_path(upload_dir: Path, content_type: str | None) -> Path:
    suffix = ALLOWED_TYPES.get(content_type or "")
    if suffix is None:
        raise ValueError("Unsupported file type")
    return upload_dir / f"{uuid4().hex}{suffix}"`}
        />

        <BugHunt
          code={`target = UPLOAD_DIR / upload.filename
with target.open("wb") as output:
    shutil.copyfileobj(upload.file, output)`}
          question={"Почему такой путь нельзя считать безопасным?"}
          options={[
            "filename контролирует клиент и может содержать путь",
            "Path не умеет записывать bytes",
            "UploadFile запрещён в def endpoint"
          ]}
          correctIndex={0}
          explanation={"Исходное имя нельзя использовать как путь хранения без строгой нормализации и собственной схемы имён."}
          fix={`target = build_storage_path(UPLOAD_DIR, upload.content_type)
with target.open("wb") as output:
    shutil.copyfileobj(upload.file, output)`}
        />

        <Callout tone="info">
          {"Allowlist MIME-type — только первый барьер. Для чувствительных файлов в реальном продукте нужна проверка содержимого и антивирусная обработка."}
        </Callout>
      </Section>

      <Section
        number={"06"}
        title={"Файл на диске, метаданные в базе"}
      >
        <Lead>
          {"База не обязана хранить бинарные байты. Для StudyHub достаточно сохранить файл в контролируемой папке, а в AttachmentModel записать идентификатор владельца, безопасное имя, исходное имя и размер."}
        </Lead>

        <div className="lesson-practice-steps">
        <h3>{"Файловая система"}</h3>
        <p>{"хранит содержимое по внутреннему storage_name."}</p>
        <h3>{"SQLite"}</h3>
        <p>{"хранит связь task_id, owner_id, original_name, media_type и size."}</p>
        <h3>{"Компенсация"}</h3>
        <p>{"если commit не прошёл, уже записанный файл удаляется, чтобы не остался сиротой."}</p>
        </div>

        <CodeBlock
          caption={"согласование двух хранилищ"}
          code={`from pathlib import Path
import shutil

from sqlalchemy.orm import Session


def save_attachment(
    db: Session,
    task: TaskModel,
    upload: UploadFile,
    target: Path,
    size: int,
) -> AttachmentModel:
    try:
        with target.open("wb") as output:
            shutil.copyfileobj(upload.file, output)

        attachment = AttachmentModel(
            task_id=task.id,
            owner_id=task.user_id,
            storage_name=target.name,
            original_name=upload.filename or "upload",
            media_type=upload.content_type,
            size=size,
        )
        db.add(attachment)
        db.commit()
        db.refresh(attachment)
        return attachment
    except Exception:
        db.rollback()
        target.unlink(missing_ok=True)
        raise`}
        />

        <MethodGrid
          rows={[
            [<>{"target.open(\"wb\")"}</>, "создаёт файл только после валидации"],
            [<>{"AttachmentModel(...)"}</>, "фиксирует метаданные и принадлежность"],
            [<>{"db.commit()"}</>, "делает запись видимой в базе"],
            [<>{"db.rollback()"}</>, "восстанавливает Session после ошибки"],
            [<>{"target.unlink(...)"}</>, "компенсирует уже созданный файл"]
          ]}
        />

        <Callout tone="info">
          {"Файловая система и SQLite не образуют одну настоящую транзакцию. Поэтому код явно описывает компенсацию при частичном сбое."}
        </Callout>
      </Section>

      <Section
        number={"07"}
        title={"Endpoint и TestClient-сценарий"}
      >
        <Lead>
          {"Маршрут принимает текстовое описание и файл одной multipart-формой, получает current user, проверяет владение задачей и возвращает только безопасные метаданные."}
        </Lead>

        <div className="lesson-practice-steps">
        <h3>{"Form"}</h3>
        <p>{"description приходит отдельной текстовой частью."}</p>
        <h3>{"File"}</h3>
        <p>{"upload приходит бинарной частью multipart."}</p>
        <h3>{"Ownership"}</h3>
        <p>{"task ищется одновременно по id и current_user.id."}</p>
        </div>

        <CodeBlock
          caption={"multipart endpoint с ownership"}
          code={`@router.post(
    "/tasks/{task_id}/attachments",
    response_model=AttachmentRead,
    status_code=201,
)
def upload_attachment(
    task_id: int,
    description: Annotated[str, Form(max_length=300)],
    upload: Annotated[UploadFile, File()],
    current_user: Annotated[UserModel, Depends(get_current_user)],
    db: Annotated[Session, Depends(get_db)],
) -> AttachmentModel:
    task = task_service.get_owned_task(db, task_id, current_user.id)
    return attachment_service.create(db, task, upload, description)`}
        />

        <TerminalDemo
          title={"проверка загрузки"}
          lines={[
            { cmd: "curl -X POST http://127.0.0.1:8000/tasks/7/attachments -H \"Authorization: Bearer TOKEN\" -F \"description=ER diagram\" -F \"upload=@schema.png;type=image/png\"" },
            { out: "{\"id\":3,\"task_id\":7,\"original_name\":\"schema.png\",\"media_type\":\"image/png\"}" }
          ]}
        />

        <Callout tone="info">
          {"Response schema не возвращает абсолютный путь на сервере: это внутренняя деталь хранения."}
        </Callout>
      </Section>

      <Section
        number={"08"}
        title={"Контрольная точка: тестируем не только 201"}
      >
        <Lead>
          {"Положительный upload — только один сценарий. Готовый маршрут также отклоняет чужую задачу, неподдерживаемый тип, превышение размера и запрос без файла."}
        </Lead>

        <div className="lesson-practice-steps">
        <h3>{"Успех"}</h3>
        <p>{"метаданные записаны, файл существует, owner и task связаны."}</p>
        <h3>{"Валидация"}</h3>
        <p>{"неподдерживаемый MIME-type и большой размер возвращают согласованные ошибки."}</p>
        <h3>{"Безопасность"}</h3>
        <p>{"второй пользователь не может добавить или прочитать чужое вложение."}</p>
        </div>

        <CodeBlock
          caption={"multipart в TestClient"}
          code={`def test_upload_attachment(client, auth_headers, png_bytes) -> None:
    response = client.post(
        "/tasks/1/attachments",
        headers=auth_headers,
        data={"description": "diagram"},
        files={"upload": ("diagram.png", png_bytes, "image/png")},
    )
    assert response.status_code == 201
    assert response.json()["original_name"] == "diagram.png"


def test_rejects_large_attachment(client, auth_headers) -> None:
    response = client.post(
        "/tasks/1/attachments",
        headers=auth_headers,
        data={"description": "too large"},
        files={"upload": ("big.pdf", b"x" * 50, "application/pdf")},
    )
    assert response.status_code == 413`}
        />

        <RecallCard
          question={"Почему недостаточно проверить только content_type?"}
          hint={"Это строка из входящего запроса."}
          answer={
            <p>{"Клиент сам объявляет Content-Type, поэтому строка может не соответствовать фактическим байтам. Она подходит для первичного allowlist, но не является доказательством безопасного содержимого."}</p>
          }
        />

        <Callout tone="info">
          {"В тесте лимит можно уменьшить через settings override, чтобы не создавать многомегабайтный объект."}
        </Callout>

        <div className="lesson-check-group">
          <QuizCard
            question={"Когда нужен multipart/form-data?"}
            options={[
              "когда есть текстовые части и файл",
              "для любого GET",
              "только для JSON"
            ]}
            correctIndex={0}
            explanation={"Multipart делит тело на несколько частей с собственными метаданными."}
          />
          <QuizCard
            question={"Почему UploadFile предпочтительнее bytes для файла?"}
            options={[
              "даёт поток и метаданные",
              "автоматически удаляет вирусы",
              "всегда шифрует содержимое"
            ]}
            correctIndex={0}
            explanation={"UploadFile не требует сразу держать весь файл как bytes в памяти."}
          />
          <QuizCard
            question={"Можно ли использовать upload.filename как путь хранения?"}
            options={[
              "нет, имя контролирует клиент",
              "да, всегда",
              "только без расширения"
            ]}
            correctIndex={0}
            explanation={"Сервер должен генерировать собственное безопасное имя."}
          />
          <QuizCard
            question={"Что сделать после чтения файла для проверки размера?"}
            options={[
              "seek(0)",
              "commit()",
              "base64 encode"
            ]}
            correctIndex={0}
            explanation={"Перед последующим копированием указатель возвращают к началу."}
          />
        </div>

        <KeyTakeaways
          points={[
            <>{"Content-Type определяет формат тела запроса."}</>,
            <>{"Form читает поля формы, а multipart переносит поля и бинарные части."}</>,
            <>{"Для Form и UploadFile нужен python-multipart."}</>,
            <>{"UploadFile предоставляет метаданные и file-like поток."}</>,
            <>{"Размер проверяется по фактически прочитанным байтам."}</>,
            <>{"Filename и content_type считаются недоверенными."}</>,
            <>{"Сервер генерирует storage_name и хранит метаданные отдельно."}</>,
            <>{"Файл и запись базы требуют компенсации при частичном сбое."}</>
          ]}
        />

        <PracticeCta
          text={"Реализуйте POST /tasks/{task_id}/attachments с Form, UploadFile, лимитом размера, allowlist типов, серверным именем, ownership и TestClient-проверками успеха и отказов."}
        />
      </Section>
    </RichLesson>
  );
}

// 113. Финальный проект 1: контракт и архитектура
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

// 114. Финальный проект 2: database, schemas и auth services
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

// 115. Финальный проект 3: маршруты, ошибки и тесты
export function Lesson115({
  module,
}: {
  module?: string;
}) {
  return (
    <RichLesson>
      <RichHero
        variant="project"
        chip={module ?? BLOCK_TITLE}
        title={"Финальный проект 3: маршруты, ошибки и тесты"}
        intro={"Подключим готовые database и auth services к FastAPI: соберём routers, current user, ownership, admin permission, единый error envelope и изолированные TestClient-сценарии."}
        tags={[
          {
            icon: <GitFork size={14} />,
            label: "маршруты и dependencies",
          },
          {
            icon: <CheckCircle2 size={14} />,
            label: "ошибки и TestClient",
          },
        ]}
      />

      <Callout tone="info">
        <strong>{"Связь с курсом."}</strong>
        {" "}
        {"Нижние слои уже проверены без HTTP. Теперь endpoint должен оставаться тонкой точкой сборки: получить dependency, вызвать сервис и вернуть схему."}
        {" "}
        <strong>{"Важно не перепутать:"}</strong>
        {" "}
        {"Router не должен повторять password, token, ownership или transaction logic. HTTPException не используется как универсальная доменная ошибка внутри services."}
      </Callout>

      <div className="lesson-route">
        <ol>
        <li>
          <strong>{"Собрать routers."}</strong>
          {" "}
          {"разделить auth, users, tasks, attachments и admin по публичным контрактам."}
        </li>
        <li>
          <strong>{"Получить личность."}</strong>
          {" "}
          {"session cookie и bearer token приводят к одному UserModel."}
        </li>
        <li>
          <strong>{"Проверить права."}</strong>
          {" "}
          {"ownership и admin permission выполняются до изменения данных."}
        </li>
        <li>
          <strong>{"Доказать поведение."}</strong>
          {" "}
          {"dependency overrides и отдельная SQLite-база воспроизводят позитивные и негативные сценарии."}
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
          code={`database и auth services готовы`}
        >
          {"database и auth services готовы"}
        </TypeCard>
        <TypeCard
          badge={"+"}
          badgeTone={"float"}
          title={"Изменение урока"}
          code={`routers, handlers и интеграционные тесты`}
        >
          {"routers, handlers и интеграционные тесты"}
        </TypeCard>
        <TypeCard
          badge={"после"}
          badgeTone={"str"}
          title={"Новый результат"}
          code={`Personal StudyHub работает end-to-end`}
        >
          {"Personal StudyHub работает end-to-end"}
        </TypeCard>
      </TypeCards>

      <Section
        number={"01"}
        title={"Routers как карта публичного API"}
      >
        <Lead>
          {"Каждый router группирует связанные HTTP-контракты, но не становится новым сервисным слоем. Он отвечает за path, method, status code, dependencies, schemas и перевод результата в ответ."}
        </Lead>

        <div className="lesson-practice-steps">
        <h3>{"auth"}</h3>
        <p>{"регистрация, session login/logout, token, refresh и revoke."}</p>
        <h3>{"users/tasks"}</h3>
        <p>{"профиль и protected CRUD текущего пользователя."}</p>
        <h3>{"admin"}</h3>
        <p>{"узкие операции, требующие отдельного разрешения."}</p>
        </div>

        <CodeBlock
          caption={"main.py только собирает приложение"}
          code={`from fastapi import FastAPI

from app.routers import admin, auth, tasks, users


def create_app() -> FastAPI:
    app = FastAPI(title="Personal StudyHub API")
    app.include_router(auth.router)
    app.include_router(users.router)
    app.include_router(tasks.router)
    app.include_router(admin.router)
    return app


app = create_app()`}
        />

        <TypeCards>
          <TypeCard badge={"router"} title={"HTTP-контракт"} code={`path + method + schemas`}>
            {"Принимает валидированные данные и вызывает готовый сервис."}
          </TypeCard>
          <TypeCard badge={"service"} badgeTone={"float"} title={"Сценарий"} code={`authenticate/create/update/revoke`}>
            {"Не знает про APIRouter и выбирает транзакционную границу."}
          </TypeCard>
          <TypeCard badge={"dependency"} badgeTone={"str"} title={"Контекст запроса"} code={`db/current_user/permission`}>
            {"Подготавливает повторяемое значение до выполнения endpoint."}
          </TypeCard>
        </TypeCards>

        <Callout tone="info">
          {"Фабрика create_app упрощает тестирование и не требует глобально переопределять настройки до импорта модулей."}
        </Callout>
      </Section>

      <Section
        number={"02"}
        title={"Session login и logout в HTTP-слое"}
      >
        <Lead>
          {"Session service возвращает raw session id, а router устанавливает его в HttpOnly cookie. Logout читает credential, отзывает запись и удаляет cookie независимо от того, существовала ли она у клиента."}
        </Lead>

        <div className="lesson-practice-steps">
        <h3>{"Login"}</h3>
        <p>{"authenticate_user → create_session → set_cookie."}</p>
        <h3>{"Cookie flags"}</h3>
        <p>{"HttpOnly, SameSite, Secure по окружению, Path и Max-Age."}</p>
        <h3>{"Logout"}</h3>
        <p>{"revocation на сервере и delete_cookie в ответе."}</p>
        </div>

        <CodeBlock
          caption={"cookie transport вокруг session service"}
          code={`from typing import Annotated

from fastapi import APIRouter, Cookie, Depends, Form, Response, status
from sqlalchemy.orm import Session

router = APIRouter(prefix="/auth/session", tags=["auth-session"])


@router.post("/login", status_code=status.HTTP_204_NO_CONTENT)
def session_login(
    response: Response,
    email: Annotated[str, Form()],
    password: Annotated[str, Form()],
    db: Annotated[Session, Depends(get_db)],
) -> None:
    user = authenticate_user(db, email, password)
    session_id = session_service.create(db, user.id)
    response.set_cookie(
        key="studyhub_session",
        value=session_id,
        httponly=True,
        secure=settings.cookie_secure,
        samesite="lax",
        max_age=settings.session_ttl_seconds,
    )


@router.post("/logout", status_code=status.HTTP_204_NO_CONTENT)
def session_logout(
    response: Response,
    db: Annotated[Session, Depends(get_db)],
    session_id: Annotated[str | None, Cookie(alias="studyhub_session")] = None,
) -> None:
    if session_id is not None:
        session_service.revoke(db, session_id)
    response.delete_cookie("studyhub_session")`}
        />

        <CodeSequence
          title={"Соберите session login"}
          prompt={"Расположите действия успешного входа."}
          pieces={[
            { id: "form", code: "FastAPI читает email и password из Form" },
            { id: "auth", code: "authenticate_user проверяет credentials" },
            { id: "session", code: "session service создаёт server-side record" },
            { id: "cookie", code: "Response.set_cookie отправляет raw id" },
            { id: "response", code: "вернуть 204 без пользовательских секретов" },
            { id: "hash", code: "вернуть password_hash клиенту", note: "опасное действие" }
          ]}
          correctOrder={["form", "auth", "session", "cookie", "response"]}
          explanation={"Проверка и хранение остаются в services, cookie — в HTTP-слое."}
        />

        <Callout tone="info">
          {"Для production cookie Secure включается под HTTPS. Локальная настройка может отличаться, но причина различия фиксируется в config."}
        </Callout>
      </Section>

      <Section
        number={"03"}
        title={"Bearer flow и единый current user"}
      >
        <Lead>
          {"Token endpoint выдаёт пару после authenticate_user. Dependency OAuth2PasswordBearer извлекает access token, token service декодирует sub, а user repository загружает активного пользователя."}
        </Lead>

        <div className="lesson-practice-steps">
        <h3>{"Transport"}</h3>
        <p>{"Authorization: Bearer <access token>."}</p>
        <h3>{"Decode"}</h3>
        <p>{"проверяются подпись, exp и type=access."}</p>
        <h3>{"Resolve"}</h3>
        <p>{"sub преобразуется в user id, затем проверяются existence и is_active."}</p>
        </div>

        <CodeBlock
          caption={"current user из bearer token"}
          code={`from typing import Annotated

from fastapi import Depends
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/token")


def get_current_token_user(
    token: Annotated[str, Depends(oauth2_scheme)],
    db: Annotated[Session, Depends(get_db)],
) -> UserModel:
    user_id = token_service.decode_access(token)
    user = user_repository.get_by_id(db, user_id)
    if user is None or not user.is_active:
        raise InvalidTokenError()
    return user`}
        />

        <BranchExplorer
          code={`token = read_bearer()
try:
    user_id = decode_access(token)
except InvalidTokenError:
    return "401"
user = find_user(user_id)
if user is None or not user.is_active:
    return "401"
return "current user"`}
          scenarios={[
            { label: "подпись неверна", activeLine: 4, output: "401" },
            { label: "user удалён", activeLine: 7, output: "401" },
            { label: "user неактивен", activeLine: 7, output: "401" },
            { label: "всё корректно", activeLine: 8, output: "current user" }
          ]}
        />

        <Callout tone="info">
          {"user_id из request body никогда не заменяет current user. Клиент не выбирает владельца защищённого ресурса."}
        </Callout>
      </Section>

      <Section
        number={"04"}
        title={"Ownership и admin permission"}
      >
        <Lead>
          {"Аутентификация отвечает «кто это», авторизация — «разрешено ли действие». Для задач ownership проверяется запросом по id и owner_id, для admin endpoint — dependency role/permission."}
        </Lead>

        <div className="lesson-practice-steps">
        <h3>{"Own resource"}</h3>
        <p>{"repository возвращает task только при совпадении task_id и user_id."}</p>
        <h3>{"Foreign resource"}</h3>
        <p>{"проект выбирает 404, чтобы не подтверждать существование чужого id."}</p>
        <h3>{"Admin"}</h3>
        <p>{"current user существует, но role не подходит — 403."}</p>
        </div>

        <CodeBlock
          caption={"две формы авторизации"}
          code={`def get_owned_task(
    db: Session,
    task_id: int,
    owner_id: int,
) -> TaskModel:
    statement = select(TaskModel).where(
        TaskModel.id == task_id,
        TaskModel.user_id == owner_id,
    )
    task = db.scalar(statement)
    if task is None:
        raise TaskNotFoundError(task_id)
    return task


def require_admin(
    current_user: Annotated[UserModel, Depends(get_current_token_user)],
) -> UserModel:
    if current_user.role != "admin":
        raise PermissionDeniedError("admin_stats")
    return current_user`}
        />

        <MatchPairs
          prompt={"Соедините ситуацию с HTTP-результатом финального контракта."}
          leftTitle={"Ситуация"}
          rightTitle={"Результат"}
          pairs={[
            { left: "нет действительного credential", right: "401 Unauthorized" },
            { left: "user есть, но не admin", right: "403 Forbidden" },
            { left: "чужая task скрыта ownership query", right: "404 Not Found" },
            { left: "своя task найдена", right: "выполнить сценарий" }
          ]}
          explanation={"401, 403 и 404 отражают разные границы доступа."}
        />

        <Callout tone="info">
          {"Проверка role строкой сосредоточена в одной dependency. Если появятся permissions, routers не придётся переписывать полностью."}
        </Callout>
      </Section>

      <Section
        number={"05"}
        title={"Доменные исключения и exception handlers"}
      >
        <Lead>
          {"Services поднимают понятные исключения предметной области. FastAPI handlers централизованно переводят их в status code и ErrorResponse, сохраняя одинаковую внешнюю форму."}
        </Lead>

        <div className="lesson-practice-steps">
        <h3>{"Domain error"}</h3>
        <p>{"не зависит от FastAPI и несёт минимальный контекст."}</p>
        <h3>{"Handler"}</h3>
        <p>{"выбирает status code и безопасный message."}</p>
        <h3>{"Unexpected error"}</h3>
        <p>{"логируется с request id, но клиент получает общий 500 без traceback."}</p>
        </div>

        <CodeBlock
          caption={"единый перевод доменной ошибки"}
          code={`from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse


class TaskNotFoundError(Exception):
    def __init__(self, task_id: int) -> None:
        self.task_id = task_id


def install_exception_handlers(app: FastAPI) -> None:
    @app.exception_handler(TaskNotFoundError)
    def task_not_found_handler(
        request: Request,
        error: TaskNotFoundError,
    ) -> JSONResponse:
        return JSONResponse(
            status_code=404,
            content={
                "error": {
                    "code": "task_not_found",
                    "message": "Task was not found",
                    "request_id": getattr(request.state, "request_id", None),
                }
            },
        )`}
        />

        <CompareSolutions
          question={"Где лучше выбирать HTTP status code для TaskNotFoundError?"}
          left={{
            title: "В task service",
            code: `raise HTTPException(status_code=404)`,
            note: "Сервис становится зависимым от FastAPI transport.",
          }}
          right={{
            title: "В exception handler",
            code: `raise TaskNotFoundError(task_id)`,
            note: "Сервис описывает предметный отказ, handler — HTTP-представление.",
          }}
          preferred={"right"}
          explanation={"Разделение позволяет тестировать service без FastAPI и сохраняет единый error envelope."}
        />

        <Callout tone="info">
          {"Не превращайте каждую ValueError в отдельную иерархию. Доменные исключения нужны там, где отказ имеет устойчивый смысл для сценария."}
        </Callout>
      </Section>

      <Section
        number={"06"}
        title={"Изолированная SQLite-база и dependency overrides"}
      >
        <Lead>
          {"Тесты не должны читать development database. Они создают отдельный engine, поднимают схему, отдают test Session через override и очищают ресурсы после сценария."}
        </Lead>

        <div className="lesson-practice-steps">
        <h3>{"Engine"}</h3>
        <p>{"отдельный файл во временной папке или in-memory конфигурация с подходящим pool."}</p>
        <h3>{"Override"}</h3>
        <p>{"app.dependency_overrides[get_db] заменяет production dependency."}</p>
        <h3>{"Cleanup"}</h3>
        <p>{"override удаляется, Session закрывается, база не влияет на следующий тест."}</p>
        </div>

        <CodeBlock
          caption={"fixture изолированного приложения"}
          code={`import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker


@pytest.fixture
def client(tmp_path):
    url = f"sqlite:///{tmp_path / 'test.db'}"
    engine = create_engine(url, connect_args={"check_same_thread": False})
    TestingSession = sessionmaker(bind=engine, expire_on_commit=False)
    Base.metadata.create_all(engine)

    def override_get_db():
        db = TestingSession()
        try:
            yield db
        finally:
            db.close()

    app = create_app()
    app.dependency_overrides[get_db] = override_get_db
    with TestClient(app) as test_client:
        yield test_client
    app.dependency_overrides.clear()`}
        />

        <BugHunt
          code={`def test_create_task():
    client = TestClient(production_app)
    response = client.post("/tasks", json={"title": "SQL"})`}
          question={"Какой риск скрыт в тесте?"}
          options={[
            "Он может использовать production get_db и реальные данные",
            "TestClient запрещает POST",
            "JSON нельзя передавать словарём"
          ]}
          correctIndex={0}
          explanation={"Без override тест зависит от production configuration и может загрязнить рабочую SQLite-базу."}
          fix={`app.dependency_overrides[get_db] = override_get_db
with TestClient(app) as client:
    response = client.post("/tasks", json={"title": "SQL"})`}
        />

        <Callout tone="info">
          {"В финальной проверке предпочтительно прогонять Alembic и на тестовой базе. create_all допустим для быстрых unit fixtures, но не заменяет migration test."}
        </Callout>
      </Section>

      <Section
        number={"07"}
        title={"Полные TestClient-сценарии"}
      >
        <Lead>
          {"Хороший интеграционный тест проходит не один endpoint, а пользовательский поток: регистрация, вход, создание ресурса, доступ, отказ второго пользователя и logout/revocation."}
        </Lead>

        <div className="lesson-practice-steps">
        <h3>{"Session flow"}</h3>
        <p>{"cookie автоматически сохраняется внутри одного TestClient."}</p>
        <h3>{"JWT flow"}</h3>
        <p>{"access передаётся в Authorization, refresh rotation проверяет старый токен."}</p>
        <h3>{"Isolation"}</h3>
        <p>{"два клиента или два token set доказывают ownership."}</p>
        </div>

        <CodeBlock
          caption={"двухпользовательский ownership test"}
          code={`def test_two_users_cannot_share_tasks(client: TestClient) -> None:
    first = register_and_login_token(client, "first@example.com")
    second = register_and_login_token(client, "second@example.com")

    created = client.post(
        "/tasks",
        headers=bearer(first.access_token),
        json={"title": "Private SQL task", "priority": 4},
    )
    task_id = created.json()["id"]

    foreign_read = client.get(
        f"/tasks/{task_id}",
        headers=bearer(second.access_token),
    )
    assert foreign_read.status_code == 404

    owner_read = client.get(
        f"/tasks/{task_id}",
        headers=bearer(first.access_token),
    )
    assert owner_read.status_code == 200`}
        />

        <TerminalDemo
          title={"финальный набор тестов"}
          lines={[
            { cmd: "python -m pytest -q" },
            { out: "58 passed in 4.12s" },
            { cmd: "python -m pytest tests/test_auth.py -q" },
            { out: "21 passed in 1.66s" },
            { cmd: "python -m pytest tests/test_permissions.py -q" },
            { out: "12 passed in 0.84s" }
          ]}
        />

        <Callout tone="info">
          {"Число тестов не является целью. Набор считается сильным, когда покрывает критические договорённости и объясняет причину каждого ожидаемого отказа."}
        </Callout>
      </Section>

      <Section
        number={"08"}
        title={"Контрольная точка end-to-end"}
      >
        <Lead>
          {"Перед документацией проект должен пройти чистый сценарий от alembic upgrade head до полного набора TestClient. Любая ручная правка базы или секрет в исходнике означает незавершённость."}
        </Lead>

        <div className="lesson-practice-steps">
        <h3>{"Clean start"}</h3>
        <p>{"новая база создаётся миграциями, приложение стартует с .env.example."}</p>
        <h3>{"Positive path"}</h3>
        <p>{"registration, login, CRUD, upload и admin работают по контракту."}</p>
        <h3>{"Negative path"}</h3>
        <p>{"401, 403, ownership 404, duplicate 409, refresh reuse и upload limits проверены."}</p>
        </div>

        <CodeBlock
          caption={"definition of done для Lesson115"}
          code={`release_candidate = all([
    migrations_pass_on_empty_database,
    routes_match_openapi_contract,
    error_envelope_is_consistent,
    two_user_isolation_passes,
    refresh_rotation_passes,
    upload_boundaries_pass,
    secrets_are_not_in_repository,
    tests_pass_twice,
])`}
        />

        <RecallCard
          question={"Почему тест нужно запустить два раза подряд?"}
          hint={"Подумайте об остаточном состоянии и порядке тестов."}
          answer={
            <p>{"Повторный зелёный прогон помогает обнаружить тесты, которые оставляют данные, зависят от порядка выполнения или не очищают dependency overrides и временные ресурсы."}</p>
          }
        />

        <Callout tone="info">
          {"После этой точки Lesson116 не добавляет backend-функции. Он делает уже работающий результат воспроизводимым, объяснимым и защищаемым."}
        </Callout>

        <div className="lesson-check-group">
          <QuizCard
            question={"Что должен делать router?"}
            options={[
              "связывать HTTP-контракт с готовым сервисом",
              "самостоятельно хешировать пароль",
              "создавать engine на каждый запрос"
            ]}
            correctIndex={0}
            explanation={"Router управляет транспортом и вызывает нижние слои."}
          />
          <QuizCard
            question={"Чем 401 отличается от 403?"}
            options={[
              "401 — нет подтверждённой личности, 403 — личности не хватает права",
              "разницы нет",
              "403 означает отсутствующую таблицу"
            ]}
            correctIndex={0}
            explanation={"Эти статусы отражают разные границы доступа."}
          />
          <QuizCard
            question={"Зачем dependency override в тесте?"}
            options={[
              "подменить production get_db на изолированную Session",
              "отключить все проверки",
              "заменить pytest"
            ]}
            correctIndex={0}
            explanation={"Override направляет приложение в тестовую базу."}
          />
          <QuizCard
            question={"Как доказать ownership?"}
            options={[
              "сценарием двух пользователей",
              "только тестом 200",
              "скрытием OpenAPI"
            ]}
            correctIndex={0}
            explanation={"Второй пользователь должен получить отказ на чужой ресурс."}
          />
        </div>

        <KeyTakeaways
          points={[
            <>{"Routers отвечают за HTTP-контракт, а services — за сценарии."}</>,
            <>{"Session service не устанавливает cookie самостоятельно."}</>,
            <>{"Bearer dependency декодирует access token и загружает active user."}</>,
            <>{"Ownership проверяется запросом task_id + owner_id."}</>,
            <>{"401, 403 и 404 имеют разные смыслы доступа."}</>,
            <>{"Доменные исключения переводятся централизованными handlers."}</>,
            <>{"Dependency overrides изолируют тестовую SQLite-базу."}</>,
            <>{"End-to-end тесты проходят реальные auth и resource flows."}</>,
            <>{"Release candidate обязан стартовать с чистой базы."}</>
          ]}
        />

        <PracticeCta
          text={"Реализуйте auth/users/tasks/admin routers, current user, ownership, exception handlers и isolated TestClient fixtures. Пройдите session, JWT, refresh rotation, two-user и upload сценарии."}
        />
      </Section>
    </RichLesson>
  );
}

// 116. Финальный проект 4: документация и защита
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
