import { KeyRound, ShieldCheck } from "lucide-react";
import { BranchExplorer, BugHunt, Callout, CodeBlock, CodeSequence, CompareSolutions, FillBlank, KeyTakeaways, Lead, MatchPairs, PracticeCta, PredictOutput, QuizCard, RichHero, RichLesson, Section, TypeCard, TypeCards } from "../../shared";
const BLOCK_TITLE = "Блок 20 · Остальные возможности FastAPI и Personal StudyHub";

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
