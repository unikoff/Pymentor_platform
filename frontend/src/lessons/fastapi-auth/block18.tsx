import {
  FileText,
  HardDrive,
  KeyRound,
  Layers,
  ListChecks,
  LockKeyhole,
  ShieldCheck,
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
  TerminalDemo,
  TrueFalse,
  TypeCard,
  TypeCards,
} from "../shared";

const BLOCK_TITLE = "Блок 18 · Cookie и серверные сессии";

type TheoryBridgeData = {
  link: string;
  boundary: string;
};

const THEORY_BRIDGES: Record<number, TheoryBridgeData> = {
  99: {
    link: "В блоке 17 StudyHub научился регистрировать пользователя и проверять credentials. Теперь браузеру нужен безопасный способ сообщать о ранее выполненном входе в следующих запросах.",
    boundary: "Cookie — механизм хранения и автоматической отправки небольшого значения. Сама по себе cookie не доказывает личность и не является server-side session.",
  },
  100: {
    link: "Браузер уже умеет вернуть cookie. Теперь сервер создаёт собственную запись session, связывает её с пользователем и хранит срок действия независимо от клиента.",
    boundary: "В cookie передаётся непрозрачный случайный token. Данные пользователя, роль и срок действия остаются в базе и не доверяются клиенту.",
  },
  101: {
    link: "Функция authenticate_user уже проверяет email и пароль. Session login превращает успешную проверку credentials в сохранённую серверную сессию и HttpOnly-cookie.",
    boundary: "Проверка пароля, создание session и формирование HTTP-ответа — три разные ответственности. Endpoint только координирует их.",
  },
  102: {
    link: "После login браузер автоматически отправляет session cookie. Dependency get_current_user восстанавливает пользователя до выполнения защищённого endpoint.",
    boundary: "Наличие cookie недостаточно: сервер проверяет существование session, отзыв, срок действия и активность пользователя.",
  },
  103: {
    link: "Current user уже определяется через session. Теперь нужно корректно завершать вход, отзывать отдельные устройства и отличать истечение срока от физической очистки записей.",
    boundary: "Удаление cookie только очищает браузер. Надёжный logout также отзывает session на сервере, иначе скопированный token продолжит работать.",
  },
  104: {
    link: "Аутентифицированный пользователь известен приложению. Последний шаг блока — ограничить CRUD задач владельцем и доказать это интеграционными тестами двух пользователей.",
    boundary: "user_id из request body не является источником истины. Владельца назначает сервер из current_user, а поиск выполняется сразу по task_id и user_id.",
  },
};

function TheoryBridge({ lesson }: { lesson: number }) {
  const bridge = THEORY_BRIDGES[lesson];

  return (
    <Callout tone="info">
      <strong>{"Связь с курсом."}</strong> {bridge.link}{" "}
      <strong>{"Важно не перепутать:"}</strong> {bridge.boundary}
    </Callout>
  );
}

// 99. Cookie в браузере
export function Lesson99({ module }: { module?: string }) {
  return (
    <RichLesson>
      <RichHero
        variant="project"
        chip={module ?? BLOCK_TITLE}
        title={"Cookie в браузере"}
        intro={"Разберём первый слой session-based authentication: как сервер отправляет Set-Cookie, почему браузер сохраняет значение и при каких условиях автоматически возвращает его в заголовке Cookie."}
        tags={[
          { icon: <FileText size={14} />, label: "Set-Cookie → Cookie" },
          { icon: <ShieldCheck size={14} />, label: "HttpOnly · Secure · SameSite" },
        ]}
      />
      <TheoryBridge lesson={99} />

      <Section number="01" title="Почему одного успешного login недостаточно">
        <Lead>
          {"HTTP-запросы независимы. Сервер может проверить email и пароль в запросе login, но следующий GET /users/me приходит отдельно. Без дополнительного признака приложение не знает, что оба запроса отправил один и тот же вошедший пользователь."}
        </Lead>

        <div className="lesson-route">
          <ol>
            <li>
              <strong>{"Выполнить вход:"}</strong> {"клиент отправляет credentials, а сервер проверяет их."}
            </li>
            <li>
              <strong>{"Получить маркер:"}</strong> {"сервер добавляет заголовок Set-Cookie в HTTP-ответ."}
            </li>
            <li>
              <strong>{"Вернуть маркер:"}</strong> {"браузер автоматически прикрепляет подходящую cookie к следующим запросам."}
            </li>
            <li>
              <strong>{"Проверить на сервере:"}</strong> {"приложение ещё должно связать значение cookie с действующей session."}
            </li>
          </ol>
          <p>
            {"На этом занятии мы изучаем транспорт cookie. Таблица sessions и проверка пользователя появятся в следующих уроках."}
          </p>
        </div>

        <BranchExplorer
          code={"POST /auth/session/login\n  ↓\nHTTP 200 + Set-Cookie\n  ↓\nbrowser cookie storage\n  ↓\nGET /users/me + Cookie\n  ↓\nserver checks value"}
          scenarios={[
            { label: "первый login", activeLine: 2, output: "браузер получает Set-Cookie" },
            { label: "следующий запрос", activeLine: 4, output: "браузер отправляет Cookie" },
            { label: "серверная проверка", activeLine: 6, output: "значение ещё нужно валидировать" },
          ]}
        />

        <Callout tone="info">
          {"Cookie решает задачу доставки небольшого значения между запросами. Она не заменяет базу пользователей, проверку пароля или server-side session."}
        </Callout>
      </Section>

      <Section number="02" title="Два заголовка одного обмена">
        <Lead>
          {"Сервер устанавливает cookie через response header Set-Cookie. Клиент возвращает сохранённую пару name=value через request header Cookie. Это разные направления HTTP-обмена."}
        </Lead>

        <TypeCards>
          <TypeCard badge="response" title="Set-Cookie" code={"Set-Cookie: studyhub_session=abc123; HttpOnly"}>
            {"Инструкция браузеру сохранить cookie с заданным именем, значением и атрибутами."}
          </TypeCard>
          <TypeCard badge="storage" badgeTone="float" title="Cookie jar" code={"studyhub_session → abc123"}>
            {"Хранилище браузера применяет правила domain, path, срока действия и безопасности."}
          </TypeCard>
          <TypeCard badge="request" badgeTone="str" title="Cookie" code={"Cookie: studyhub_session=abc123"}>
            {"Заголовок следующего подходящего запроса. Браузер формирует его автоматически."}
          </TypeCard>
        </TypeCards>

        <MatchPairs
          prompt="Соедините участника и действие."
          pairs={[
            { left: "FastAPI response", right: "добавляет Set-Cookie" },
            { left: "браузер", right: "хранит значение и проверяет атрибуты" },
            { left: "следующий request", right: "несёт заголовок Cookie" },
            { left: "dependency", right: "читает cookie и проверяет session" },
          ]}
          explanation="Cookie проходит полный круг: сервер → клиентское хранилище → новый запрос → серверная проверка."
        />

        <PredictOutput
          code={"response.set_cookie(\n    key=\"studyhub_session\",\n    value=\"abc123\",\n)\n\n# следующий запрос браузера\nCookie: studyhub_session=abc123"}
          output={"В HTTP-ответе появится Set-Cookie, а в подходящем следующем запросе — Cookie."}
          hint="set_cookie не меняет текущий request. Он формирует инструкцию для клиента."
        />

        <Callout>
          {"В инструментах разработчика Set-Cookie ищут во вкладке Response Headers, а Cookie — во вкладке Request Headers следующего запроса."}
        </Callout>
      </Section>

      <Section number="03" title="Атрибуты ограничивают отправку cookie">
        <Lead>
          {"Cookie имеет не только значение, но и политику доставки. Атрибуты уменьшают область использования и защищают session token от некоторых типовых угроз."}
        </Lead>

        <MethodGrid
          rows={[
            [<>httponly=True</>, "JavaScript страницы не получает значение через document.cookie"],
            [<>secure=True</>, "браузер отправляет cookie только по HTTPS"],
            [<>samesite="lax"</>, "ограничивает отправку в межсайтовых сценариях"],
            [<>path="/"</>, "разрешает отправку на все маршруты приложения"],
            [<>max_age=1800</>, "задаёт срок хранения в секундах"],
          ]}
        />

        <FlipCards
          cards={[
            {
              front: <strong>{"HttpOnly"}</strong>,
              back: <span>{"Снижает риск чтения session token клиентским JavaScript. Это не защита от всех XSS-последствий."}</span>,
            },
            {
              front: <strong>{"Secure"}</strong>,
              back: <span>{"Нужен в production с HTTPS. При локальной разработке по http его часто задают через конфигурацию."}</span>,
            },
            {
              front: <strong>{"SameSite"}</strong>,
              back: <span>{"Управляет межсайтовой отправкой cookie и влияет на CSRF-модель приложения."}</span>,
            },
            {
              front: <strong>{"Max-Age"}</strong>,
              back: <span>{"Определяет время хранения cookie у клиента, но не заменяет серверный expires_at."}</span>,
            },
          ]}
        />

        <TrueFalse
          statement={<>{"HttpOnly-cookie никогда не отправляется браузером в HTTP-запросе."}</>}
          isTrue={false}
          explanation={"HttpOnly запрещает чтение через JavaScript, но браузер продолжает автоматически отправлять cookie подходящему серверу."}
        />

        <Callout tone="info">
          {"Клиентский срок и серверный срок проверяются независимо. Даже если браузер сохранил cookie, сервер может считать session просроченной или отозванной."}
        </Callout>
      </Section>

      <Section number="04" title="Установка, чтение и удаление в FastAPI">
        <Lead>
          {"FastAPI позволяет изменить объект Response и одновременно вернуть обычную Pydantic-модель. Для чтения cookie используется параметр Cookie с alias, совпадающим с HTTP-именем."}
        </Lead>

        <CodeBlock
          caption="установить учебную cookie"
          code={"from fastapi import FastAPI, Response\n\napp = FastAPI()\n\n@app.post(\"/demo/cookie\")\ndef set_demo_cookie(response: Response):\n    response.set_cookie(\n        key=\"studyhub_demo\",\n        value=\"lesson-99\",\n        httponly=True,\n        samesite=\"lax\",\n        path=\"/\",\n    )\n    return {\"status\": \"saved\"}"}
        />

        <CodeBlock
          caption="прочитать cookie"
          code={"from typing import Annotated\n\nfrom fastapi import Cookie\n\n@app.get(\"/demo/cookie\")\ndef read_demo_cookie(\n    value: Annotated[str | None, Cookie(alias=\"studyhub_demo\")] = None,\n):\n    return {\"cookie_value\": value}"}
        />

        <CodeBlock
          caption="удалить cookie"
          code={"@app.delete(\"/demo/cookie\")\ndef delete_demo_cookie(response: Response):\n    response.delete_cookie(\n        key=\"studyhub_demo\",\n        path=\"/\",\n    )\n    return {\"status\": \"deleted\"}"}
        />

        <FillBlank
          prompt="Укажите HTTP-имя cookie, которое должен прочитать параметр."
          before={'value: Annotated[str | None, Cookie(alias="'}
          after={'")] = None'}
          options={["studyhub_demo", "Response", "set_cookie"]}
          answer="studyhub_demo"
          explanation="Alias связывает Python-параметр с именем cookie в HTTP-запросе."
        />

        <Callout>
          {"Параметры path и domain при удалении должны совпадать с областью исходной cookie. Иначе браузер может сохранить старую запись."}
        </Callout>
      </Section>

      <Section number="05" title="Что нельзя считать доверенными данными">
        <Lead>
          {"Значение cookie находится у клиента: его можно удалить, заменить или скопировать. Поэтому сервер не должен хранить в cookie пароль, password_hash, роль или сериализованный профиль и затем доверять этим данным без проверки."}
        </Lead>

        <CompareSolutions
          question="Какой HTTP-контракт безопаснее для будущей server-side session?"
          left={{
            title: "Профиль внутри cookie",
            code: "user_id=7; role=admin; email=user@example.com",
            note: "Клиент видит и может изменить предметные данные.",
          }}
          right={{
            title: "Непрозрачный token",
            code: "studyhub_session=V9b...random...K2",
            note: "Значение только указывает на серверную запись session.",
          }}
          preferred="right"
          explanation={"Сервер получает идентификатор, затем загружает действующие данные пользователя из базы."}
        />

        <BugHunt
          code={"response.set_cookie(\n    key=\"current_user\",\n    value='{\"id\": 7, \"role\": \"admin\"}',\n)\n\n# endpoint доверяет role из cookie"}
          question="Какое предположение нарушено?"
          options={[
            "Данные клиента считаются источником прав доступа",
            "Cookie не может содержать строку",
            "FastAPI запрещает JSON",
          ]}
          correctIndex={0}
          explanation="Клиентская cookie не должна самостоятельно назначать роль или владельца."
          fix={"response.set_cookie(\n    key=\"studyhub_session\",\n    value=session_token,\n    httponly=True,\n)\n\n# роль загружается из базы после проверки session"}
        />

        <RecallCard
          question="Почему непрозрачный token лучше профиля пользователя в cookie?"
          answer={
            <p>
              {"Он не раскрывает предметные данные и не является самостоятельным доказательством роли. Сервер использует token только для поиска и проверки собственной записи session."}
            </p>
          }
        />

        <Callout tone="info">
          {"Непрозрачный означает, что клиенту не нужно понимать внутреннее устройство значения. Оно не кодирует полезные для интерфейса поля."}
        </Callout>
      </Section>

      <Section number="06" title="Конфигурация cookie для development и production">
        <Lead>
          {"Локальный сервер часто работает по HTTP, а production — по HTTPS. Поэтому флаг Secure и имя cookie лучше задавать через объект настроек, а не размазывать литералы по endpoint."}
        </Lead>

        <CodeBlock
          caption="настройки session cookie"
          code={"from pydantic_settings import BaseSettings, SettingsConfigDict\n\nclass Settings(BaseSettings):\n    session_cookie_name: str = \"studyhub_session\"\n    session_cookie_secure: bool = False\n    session_cookie_max_age: int = 1800\n\n    model_config = SettingsConfigDict(\n        env_file=\".env\",\n        extra=\"ignore\",\n    )\n\nsettings = Settings()"}
        />

        <CodeBlock
          caption="единая функция установки"
          code={"def set_session_cookie(response: Response, token: str) -> None:\n    response.set_cookie(\n        key=settings.session_cookie_name,\n        value=token,\n        max_age=settings.session_cookie_max_age,\n        httponly=True,\n        secure=settings.session_cookie_secure,\n        samesite=\"lax\",\n        path=\"/\",\n    )"}
        />

        <CodeSequence
          title="Соберите путь настройки"
          prompt="Расположите действия от окружения до HTTP-ответа."
          pieces={[
            { id: "env", code: "SESSION_COOKIE_SECURE=true" },
            { id: "settings", code: "Settings читает переменную" },
            { id: "helper", code: "set_session_cookie использует settings" },
            { id: "header", code: "Response получает Set-Cookie" },
            { id: "browser", code: "браузер применяет атрибут Secure" },
          ]}
          correctOrder={["env", "settings", "helper", "header", "browser"]}
          explanation="Политика определяется окружением, проходит через настройки и материализуется в HTTP-заголовке."
        />

        <Callout>
          {"Не коммитьте реальные секреты в .env. Само имя cookie и max_age не являются секретами, но единая конфигурация предотвращает расхождение между login и logout."}
        </Callout>
      </Section>

      <Section number="07" title="Диагностика в браузере и TestClient">
        <Lead>
          {"Проверять cookie нужно как последовательность запросов. Отдельный вызов login показывает Set-Cookie, но реальный сценарий подтверждается только следующим запросом через тот же браузер или тот же объект TestClient."}
        </Lead>

        <TerminalDemo
          title="ручной сценарий"
          lines={[
            { cmd: "POST /demo/cookie" },
            { out: "200 OK · Set-Cookie: studyhub_demo=lesson-99; HttpOnly" },
            { cmd: "GET /demo/cookie" },
            { out: "Request Headers · Cookie: studyhub_demo=lesson-99" },
            { out: "Response JSON · {\"cookie_value\":\"lesson-99\"}" },
            { cmd: "DELETE /demo/cookie" },
            { out: "Set-Cookie с истёкшим значением удаляет запись у клиента" },
          ]}
        />

        <CodeBlock
          caption="TestClient сохраняет cookie между вызовами"
          code={"from fastapi.testclient import TestClient\n\nclient = TestClient(app)\n\nset_response = client.post(\"/demo/cookie\")\nassert set_response.status_code == 200\n\nread_response = client.get(\"/demo/cookie\")\nassert read_response.json() == {\n    \"cookie_value\": \"lesson-99\",\n}\n\nclient.delete(\"/demo/cookie\")\nassert client.get(\"/demo/cookie\").json() == {\n    \"cookie_value\": None,\n}"}
        />

        <BugHunt
          code={"TestClient(app).post(\"/demo/cookie\")\nresponse = TestClient(app).get(\"/demo/cookie\")\nassert response.json()[\"cookie_value\"] == \"lesson-99\""}
          question="Почему второй запрос может не содержать cookie?"
          options={[
            "Созданы два независимых TestClient с разными cookie jar",
            "GET не поддерживает cookie",
            "Cookie работает только в JavaScript",
          ]}
          correctIndex={0}
          explanation="Состояние клиента сохраняется внутри конкретного экземпляра TestClient."
          fix={"client = TestClient(app)\nclient.post(\"/demo/cookie\")\nresponse = client.get(\"/demo/cookie\")\nassert response.json()[\"cookie_value\"] == \"lesson-99\""}
        />

        <Callout tone="info">
          {"При ошибке проверяйте четыре места: Set-Cookie в ответе, cookie jar клиента, область path/domain и Cookie в следующем запросе."}
        </Callout>

        <div className="lesson-practice-steps">
          <h3>{"Проверка в DevTools"}</h3>
          <p>
            {"Откройте Network, выполните POST и найдите Set-Cookie. Затем выполните GET и найдите Cookie в request headers. Отдельно проверьте Application или Storage, где браузер показывает атрибуты записи."}
          </p>
          <h3>{"Проверка области"}</h3>
          <p>
            {"Измените path на /demo и сравните запрос к /demo/cookie с запросом к /users/me. Cookie должна отправляться только в разрешённой области."}
          </p>
          <h3>{"Граница следующего урока"}</h3>
          <p>
            {"Пока значение lesson-99 не подтверждает пользователя. На следующем занятии оно будет заменено случайным token, связанным с server-side session."}
          </p>
        </div>

        <MethodGrid
          rows={[
            [<>Response Headers</>, "проверить Set-Cookie и атрибуты"],
            [<>Application / Cookies</>, "увидеть сохранённую запись браузера"],
            [<>Request Headers</>, "подтвердить автоматическую отправку Cookie"],
            [<>TestClient.cookies</>, "проверить состояние программного клиента"],
          ]}
        />

        <Callout>
          {"CORS и cookie credentials важны при отдельном frontend origin, но здесь запросы сначала проверяются в одном origin. Межсайтовый сценарий не смешивается с первой моделью session."}
        </Callout>


        <RecallCard
          question="Какой следующий слой превращает cookie в аутентификацию?"
          answer={
            <p>
              {"Server-side session: сервер связывает случайный token с пользователем и проверяет срок действия при каждом запросе."}
            </p>
          }
        />

      </Section>

      <Section number="08" title="Контрольная точка: cookie как транспорт">
        <Lead>
          {"Соберите модель без пропусков: сервер формирует Set-Cookie, браузер хранит значение по правилам атрибутов и отправляет Cookie в следующем подходящем запросе. Только после этого сервер сможет проверить session."}
        </Lead>

        <div className="lesson-check-group">
          <QuizCard
            question="Какой заголовок устанавливает cookie?"
            options={["Set-Cookie в response", "Cookie в response", "Authorization в request"]}
            correctIndex={0}
            explanation="Сервер инструктирует клиент через Set-Cookie."
          />
          <QuizCard
            question="Что делает HttpOnly?"
            options={["ограничивает чтение через JavaScript", "шифрует значение", "создаёт пользователя"]}
            correctIndex={0}
            explanation="Браузер продолжает отправлять cookie, но клиентский JavaScript не должен читать её напрямую."
          />
          <QuizCard
            question="Можно ли доверять role из обычной cookie?"
            options={["нет, роль нужно загрузить после серверной проверки", "да, браузер всегда честен", "только для DELETE"]}
            correctIndex={0}
            explanation="Клиентские данные изменяемы и не являются источником разрешений."
          />
          <QuizCard
            question="Почему в тесте нужен один экземпляр TestClient?"
            options={["он сохраняет cookie jar между запросами", "он запускает SQL", "он заменяет Response"]}
            correctIndex={0}
            explanation="Последовательный session-сценарий зависит от состояния конкретного клиента."
          />
        </div>

        <KeyTakeaways
          points={[
            <>{"HTTP-запросы независимы, поэтому вход нужно связать с последующими запросами."}</>,
            <><code>{"Set-Cookie"}</code>{" идёт от сервера к клиенту, а "}<code>{"Cookie"}</code>{" — обратно."}</>,
            <>{"HttpOnly, Secure, SameSite, Path и Max-Age управляют доставкой cookie."}</>,
            <>{"Cookie находится у клиента и не является доверенным профилем пользователя."}</>,
            <>{"В session cookie будет храниться только непрозрачный случайный token."}</>,
            <>{"Конфигурация login и logout должна использовать одинаковое имя и область cookie."}</>,
            <>{"TestClient проверяет сценарий через один сохраняющий состояние экземпляр."}</>,
          ]}
        />

        <PracticeCta text="Добавьте три учебных endpoint: установить, прочитать и удалить cookie studyhub_demo. Проверьте Set-Cookie и Cookie в DevTools, затем повторите тот же сценарий одним TestClient." />
      </Section>
    </RichLesson>
  );
}

// 100. Server-side session и session_id
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
      <TheoryBridge lesson={100} />

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

// 101. Session login
export function Lesson101({ module }: { module?: string }) {
  return (
    <RichLesson>
      <RichHero
        variant="project"
        chip={module ?? BLOCK_TITLE}
        title={"Session login"}
        intro={"Соединим готовую проверку credentials с серверной session: endpoint примет email и пароль, вызовет authenticate_user, сохранит session, установит HttpOnly-cookie и вернёт безопасный профиль."}
        tags={[
          { icon: <LockKeyhole size={14} />, label: "credentials → session" },
          { icon: <Layers size={14} />, label: "service + HTTP response" },
        ]}
      />
      <TheoryBridge lesson={101} />

      <Section number="01" title="Login — оркестрация нескольких готовых контрактов">
        <Lead>
          {"В блоке 17 уже появились authenticate_user и безопасная проверка пароля. На этом занятии мы не переписываем их. Login endpoint связывает существующую аутентификацию с созданием session и HTTP-cookie."}
        </Lead>

        <div className="lesson-route">
          <ol>
            <li>
              <strong>{"Принять credentials:"}</strong> {"Pydantic проверяет форму email и password."}
            </li>
            <li>
              <strong>{"Аутентифицировать:"}</strong> {"authenticate_user возвращает активного User или None."}
            </li>
            <li>
              <strong>{"Создать session:"}</strong> {"сервис фиксирует token_digest, user_id и expires_at."}
            </li>
            <li>
              <strong>{"Сформировать ответ:"}</strong> {"raw token уходит в HttpOnly-cookie, профиль — в JSON."}
            </li>
          </ol>
          <p>
            {"Главная профессиональная модель: endpoint является application boundary и координирует операции, но не реализует криптографию или SQL вручную."}
          </p>
        </div>

        <BranchExplorer
          code={"request credentials\n  ↓ validate\nLoginRequest\n  ↓ authenticate\nauthenticate_user\n  ↓ create state\ncreate_session\n  ↓ HTTP response\nSet-Cookie + UserRead"}
          scenarios={[
            { label: "body", activeLine: 2, output: "валидная Pydantic-модель" },
            { label: "credentials", activeLine: 4, output: "User или None" },
            { label: "session", activeLine: 6, output: "raw token после commit" },
            { label: "response", activeLine: 8, output: "cookie и безопасный JSON" },
          ]}
        />

        <Callout tone="info">
          {"Session login не означает, что пароль хранится в session. Credentials используются только для входа, после чего следующие запросы предъявляют случайный session token."}
        </Callout>
      </Section>

      <Section number="02" title="Контракт запроса и ответа">
        <Lead>
          {"Отдельные схемы делают границу видимой: LoginRequest содержит секрет входа, а UserRead гарантирует, что password и password_hash не попадут в ответ."}
        </Lead>

        <CodeBlock
          caption="Pydantic-схемы login"
          code={"from pydantic import BaseModel, EmailStr, Field\n\nclass SessionLoginRequest(BaseModel):\n    email: EmailStr\n    password: str = Field(min_length=8, max_length=128)\n\nclass UserRead(BaseModel):\n    id: int\n    email: EmailStr\n    username: str\n    is_active: bool\n\n    model_config = {\"from_attributes\": True}"}
        />

        <TypeCards>
          <TypeCard badge="input" title="SessionLoginRequest" code={"email + password"}>
            {"Существует только на входной границе. Password не записывается в session и не возвращается клиенту."}
          </TypeCard>
          <TypeCard badge="domain" badgeTone="float" title="UserModel" code={"password_hash"}>
            {"Загружается из базы для проверки, но не является HTTP-ответом."}
          </TypeCard>
          <TypeCard badge="output" badgeTone="str" title="UserRead" code={"id + email + username"}>
            {"Фильтрует публичные поля и документирует OpenAPI-контракт."}
          </TypeCard>
        </TypeCards>

        <BugHunt
          code={"@router.post(\"/login\")\ndef login(data: SessionLoginRequest, db: SessionDep):\n    user = find_user_by_email(db, data.email)\n    return user"}
          question="Какой риск появляется при возврате ORM-модели без response schema?"
          options={[
            "Можно случайно выдать password_hash и внутренние поля",
            "Cookie станет Secure",
            "SQLAlchemy удалит пользователя",
          ]}
          correctIndex={0}
          explanation="HTTP-ответ должен иметь отдельную безопасную схему."
          fix={"@router.post(\"/login\", response_model=UserRead)\ndef login(...):\n    ...\n    return user"}
        />

        <Callout>
          {"Даже если текущая сериализация не показывает hash, контракт должен запрещать его явно. Безопасность не строится на случайном наборе полей."}
        </Callout>
      </Section>

      <Section number="03" title="Единое сообщение для неверных credentials">
        <Lead>
          {"Login не должен подсказывать, существует ли конкретный email. Одинаковый ответ для неизвестного пользователя и неправильного пароля уменьшает утечку информации через контракт API."}
        </Lead>

        <CodeBlock
          caption="проверка credentials"
          code={"from fastapi import HTTPException, status\n\nINVALID_CREDENTIALS = HTTPException(\n    status_code=status.HTTP_401_UNAUTHORIZED,\n    detail=\"Неверные данные для входа\",\n)\n\ndef require_authenticated_user(\n    db: Session,\n    data: SessionLoginRequest,\n) -> UserModel:\n    user = authenticate_user(\n        db=db,\n        email=str(data.email),\n        password=data.password,\n    )\n\n    if user is None:\n        raise INVALID_CREDENTIALS\n\n    return user"}
        />

        <CompareSolutions
          question="Какой ответ меньше раскрывает состояние базы?"
          left={{
            title: "Разные сообщения",
            code: "404 email не найден\n401 пароль неверен",
            note: "Клиент может перебирать email и узнавать зарегистрированные адреса.",
          }}
          right={{
            title: "Единый контракт",
            code: "401 Неверные данные для входа",
            note: "Не раскрывает, какая часть credentials не совпала.",
          }}
          preferred="right"
          explanation={"Внутренние причины можно логировать осторожно, но внешний ответ остаётся единым."}
        />

        <TrueFalse
          statement={<>{"401 при login означает, что сервер обязан сообщить, был ли неверным email или пароль."}</>}
          isTrue={false}
          explanation={"HTTP-статус сообщает, что аутентификация не состоялась. Детализировать конкретную причину небезопасно."}
        />

        <Callout tone="info">
          {"Не логируйте введённый пароль. Для диагностики достаточно технического события, безопасного идентификатора запроса и общей причины отказа."}
        </Callout>
      </Section>

      <Section number="04" title="Endpoint фиксирует session до установки cookie">
        <Lead>
          {"Клиент должен получить token только для реально сохранённой session. Поэтому create_session завершает commit, и лишь затем endpoint добавляет Set-Cookie в успешный response."}
        </Lead>

        <CodeBlock
          caption="session login endpoint"
          code={"from fastapi import APIRouter, Response, status\n\nrouter = APIRouter(prefix=\"/auth/session\", tags=[\"session auth\"])\n\n@router.post(\n    \"/login\",\n    response_model=UserRead,\n    status_code=status.HTTP_200_OK,\n)\ndef session_login(\n    data: SessionLoginRequest,\n    response: Response,\n    db: SessionDep,\n):\n    user = require_authenticated_user(db, data)\n    raw_token = create_session(db, user.id)\n    set_session_cookie(response, raw_token)\n    return user"}
        />

        <CodeSequence
          title="Соберите endpoint login"
          prompt="Выберите порядок, при котором невалидный пользователь не получает cookie."
          pieces={[
            { id: "user", code: "user = require_authenticated_user(db, data)" },
            { id: "session", code: "raw_token = create_session(db, user.id)" },
            { id: "cookie", code: "set_session_cookie(response, raw_token)" },
            { id: "return", code: "return user" },
            { id: "wrong", code: "set_session_cookie(response, data.password)", note: "секрет нельзя помещать в cookie" },
          ]}
          correctOrder={["user", "session", "cookie", "return"]}
          explanation="Аутентификация предшествует созданию состояния, а cookie устанавливается только для сохранённой session."
        />

        <FillBlank
          prompt="Что передаётся в session cookie?"
          before="set_session_cookie(response, "
          after=")"
          options={["raw_token", "data.password", "user.password_hash"]}
          answer="raw_token"
          explanation="Cookie получает случайный token, а не пароль или hash."
        />

        <Callout>
          {"HTTP status 200 подходит для успешного login: новый пользователь не создаётся, создаётся только состояние входа."}
        </Callout>
      </Section>

      <Section number="05" title="Ошибка транзакции не должна оставлять ложный login">
        <Lead>
          {"Создание session может завершиться ошибкой базы. Сервис выполняет rollback и не возвращает raw token. Endpoint в таком случае не должен формировать Set-Cookie."}
        </Lead>

        <CodeBlock
          caption="транзакционная защита"
          code={"from sqlalchemy.exc import SQLAlchemyError\n\nclass SessionCreationError(Exception):\n    pass\n\ndef create_session(db: Session, user_id: int) -> str:\n    raw_token = generate_session_token()\n    model = build_session_model(raw_token, user_id)\n\n    try:\n        db.add(model)\n        db.commit()\n    except SQLAlchemyError as error:\n        db.rollback()\n        raise SessionCreationError from error\n\n    return raw_token"}
        />

        <BranchExplorer
          code={"try:\n    add session\n    commit\nexcept database error:\n    rollback\n    raise service error\nelse:\n    return raw token"}
          scenarios={[
            { label: "commit успешен", activeLine: 7, output: "token передаётся endpoint" },
            { label: "ошибка базы", activeLine: 4, output: "rollback" },
            { label: "после rollback", activeLine: 5, output: "cookie не устанавливается" },
          ]}
        />

        <BugHunt
          code={"raw_token = generate_session_token()\nset_session_cookie(response, raw_token)\ncreate_session(db, user.id)"}
          question="Почему порядок создаёт несогласованное состояние?"
          options={[
            "Ответ уже содержит token до успешного commit",
            "Cookie нельзя устанавливать в POST",
            "Session должна создаваться в браузере",
          ]}
          correctIndex={0}
          explanation="При ошибке базы клиент получил бы token, которому не соответствует запись."
          fix={"raw_token = create_session(db, user.id)\nset_session_cookie(response, raw_token)"}
        />

        <Callout tone="info">
          {"Граница успешного login — не генерация token, а успешная фиксация server-side session."}
        </Callout>
      </Section>

      <Section number="06" title="Политика повторного входа">
        <Lead>
          {"Повторный login можно моделировать по-разному. В этом блоке каждый успешный вход создаёт новую session. Такой контракт прост, поддерживает несколько устройств и не требует скрытого поиска предыдущей cookie."}
        </Lead>

        <TypeCards>
          <TypeCard badge="new" title="Новая session на login" code={"INSERT user_sessions"}>
            {"Основной учебный вариант: каждый вход получает независимый token и lifecycle."}
          </TypeCard>
          <TypeCard badge="rotate" badgeTone="float" title="Ротация текущей" code={"revoke old → create new"}>
            {"Возможная политика, но требует сначала надёжно определить текущую session."}
          </TypeCard>
          <TypeCard badge="single" badgeTone="str" title="Только одно устройство" code={"revoke all before login"}>
            {"Допустимое бизнес-правило, но не используется в StudyHub по умолчанию."}
          </TypeCard>
        </TypeCards>

        <CompareSolutions
          question="Какой вариант соответствует выбранному контракту StudyHub?"
          left={{
            title: "Перезаписывать token в users",
            code: "user.session_token = new_token",
            note: "Смешивает учётную запись и конкретное устройство.",
          }}
          right={{
            title: "Добавлять строку session",
            code: "create_session(db, user.id)",
            note: "Сохраняет независимые входы и позволяет точечный logout.",
          }}
          preferred="right"
          explanation={"Политика нескольких устройств выражается отдельными строками user_sessions."}
        />

        <RecallCard
          question="Что произойдёт при двух успешных login одного пользователя?"
          answer={<p>{"Будут созданы две независимые server-side sessions. Каждый клиент получит собственный raw token."}</p>}
        />

        <Callout>
          {"Политику нужно документировать. Неявное поведение login приводит к неожиданным logout на других устройствах."}
        </Callout>
      </Section>

      <Section number="07" title="Интеграционный тест login">
        <Lead>
          {"Тест должен доказать не только status code. Он проверяет Set-Cookie, отсутствие секретов в JSON, создание digest в базе и возможность продолжить сценарий тем же клиентом."}
        </Lead>

        <CodeBlock
          caption="успешный login"
          code={"def test_session_login_sets_cookie(\n    client,\n    db_session,\n    registered_user,\n):\n    response = client.post(\n        \"/auth/session/login\",\n        json={\n            \"email\": registered_user.email,\n            \"password\": \"correct-password\",\n        },\n    )\n\n    assert response.status_code == 200\n    assert \"studyhub_session\" in response.cookies\n    assert \"password_hash\" not in response.json()\n\n    session = db_session.scalar(\n        select(UserSessionModel).where(\n            UserSessionModel.user_id == registered_user.id,\n        )\n    )\n    assert session is not None"}
        />

        <CodeBlock
          caption="неверный пароль"
          code={"def test_session_login_rejects_bad_password(client, registered_user):\n    response = client.post(\n        \"/auth/session/login\",\n        json={\n            \"email\": registered_user.email,\n            \"password\": \"wrong-password\",\n        },\n    )\n\n    assert response.status_code == 401\n    assert \"studyhub_session\" not in response.cookies"}
        />

        <TerminalDemo
          title="контрольный сценарий"
          lines={[
            { cmd: "pytest tests/test_session_login.py -q" },
            { out: "test_session_login_sets_cookie PASSED" },
            { out: "test_session_login_rejects_bad_password PASSED" },
            { out: "2 passed" },
          ]}
        />

        <Callout tone="info">
          {"В тестовой базе не сравнивайте raw token с token_digest: это разные представления. Вычислите digest cookie и найдите соответствующую запись."}
        </Callout>

        <div className="lesson-practice-steps">
          <h3>{"Ручной happy path"}</h3>
          <p>
            {"Зарегистрируйте пользователя, выполните login и убедитесь, что JSON не содержит password_hash, а response содержит Set-Cookie."}
          </p>
          <h3>{"Ручной negative path"}</h3>
          <p>
            {"Повторите запрос с неверным паролем. Ответ должен быть 401, новая запись session не создаётся, а Set-Cookie отсутствует."}
          </p>
          <h3>{"Повторный login"}</h3>
          <p>
            {"Выполните login вторым TestClient и подтвердите две строки user_sessions с одним user_id и разными token_digest."}
          </p>
        </div>

        <MethodGrid
          rows={[
            [<>201 registration</>, "создаёт учётную запись"],
            [<>200 session login</>, "создаёт состояние входа"],
            [<>401 invalid credentials</>, "не создаёт session и cookie"],
            [<>UserRead</>, "не содержит password или password_hash"],
          ]}
        />

        <Callout>
          {"Не проверяйте наличие password_hash только визуально. Автоматический тест должен явно утверждать, что секретного поля нет в JSON."}
        </Callout>

      </Section>

      <Section number="08" title="Контрольная точка: credentials становятся session">
        <Lead>
          {"Полный login flow теперь читается как последовательность контрактов: Pydantic проверяет форму, authenticate_user подтверждает credentials, create_session фиксирует состояние, response устанавливает cookie."}
        </Lead>

        <div className="lesson-check-group">
          <QuizCard
            question="Кто проверяет пароль?"
            options={["authenticate_user", "set_session_cookie", "UserRead"]}
            correctIndex={0}
            explanation="Login использует готовую функцию проверки credentials."
          />
          <QuizCard
            question="Когда можно устанавливать cookie?"
            options={["после успешного сохранения session", "до проверки email", "в момент импорта роутера"]}
            correctIndex={0}
            explanation="Клиент получает token только для существующей server-side записи."
          />
          <QuizCard
            question="Что возвращает response_model?"
            options={["безопасный публичный профиль", "password_hash", "raw ORM Session"]}
            correctIndex={0}
            explanation="UserRead ограничивает HTTP-ответ."
          />
          <QuizCard
            question="Что делает повторный login в выбранной модели?"
            options={["создаёт новую независимую session", "удаляет пользователя", "превращает cookie в JWT"]}
            correctIndex={0}
            explanation="Каждый успешный вход имеет отдельный lifecycle."
          />
        </div>

        <KeyTakeaways
          points={[
            <>{"Session login использует готовый контракт authenticate_user."}</>,
            <>{"LoginRequest принимает секрет, а UserRead исключает его из ответа."}</>,
            <>{"Неизвестный email и неверный пароль получают единый 401."}</>,
            <>{"Server-side session фиксируется до установки cookie."}</>,
            <>{"После ошибки commit выполняется rollback, token клиенту не выдаётся."}</>,
            <>{"Каждый login создаёт отдельную session для конкретного клиента."}</>,
            <>{"Интеграционный тест проверяет HTTP, cookie и запись базы одновременно."}</>,
          ]}
        />

        <PracticeCta text="Реализуйте POST /auth/session/login поверх существующего authenticate_user. Добавьте безопасный UserRead, транзакционный create_session и тесты успешного входа, неверного password и отсутствия password_hash в ответе." />
      </Section>
    </RichLesson>
  );
}

// 102. get_current_user через session
export function Lesson102({ module }: { module?: string }) {
  return (
    <RichLesson>
      <RichHero
        variant="project"
        chip={module ?? BLOCK_TITLE}
        title={"get_current_user через session"}
        intro={"Научим FastAPI восстанавливать пользователя до запуска endpoint: dependency прочитает cookie, найдёт server-side session по digest, проверит срок и отзыв, затем загрузит активного User."}
        tags={[
          { icon: <KeyRound size={14} />, label: "cookie → current user" },
          { icon: <Layers size={14} />, label: "dependency chain" },
        ]}
      />
      <TheoryBridge lesson={102} />

      <Section number="01" title="Защищённый endpoint не должен повторять проверки">
        <Lead>
          {"После login каждый endpoint мог бы вручную читать cookie, искать session и загружать пользователя. Повторение создаёт риск: один маршрут забудет проверить expires_at, другой — is_active. Dependency собирает единый authentication pipeline."}
        </Lead>

        <div className="lesson-route">
          <ol>
            <li><strong>{"Получить cookie:"}</strong> {"FastAPI извлекает значение по alias studyhub_session."}</li>
            <li><strong>{"Найти session:"}</strong> {"raw token преобразуется в digest, затем выполняется SELECT."}</li>
            <li><strong>{"Проверить состояние:"}</strong> {"неизвестная, отозванная или просроченная session отклоняется."}</li>
            <li><strong>{"Загрузить User:"}</strong> {"dependency возвращает только существующего активного пользователя."}</li>
          </ol>
          <p>{"Endpoint получает готовый current_user и занимается только своим предметным сценарием."}</p>
        </div>

        <BranchExplorer
          code={"request Cookie\n  ↓ get_session_token\nraw token\n  ↓ get_active_session\nUserSessionModel\n  ↓ get_current_user\nUserModel\n  ↓ endpoint\nbusiness operation"}
          scenarios={[
            { label: "cookie", activeLine: 2, output: "raw token или 401" },
            { label: "session", activeLine: 4, output: "активная запись или 401" },
            { label: "user", activeLine: 6, output: "активный User или 401" },
            { label: "endpoint", activeLine: 8, output: "предметная логика" },
          ]}
        />

        <Callout tone="info">
          {"Dependency injection здесь не является отдельной архитектурой. Это способ объявить обязательные данные и централизовать их получение до выполнения endpoint."}
        </Callout>
      </Section>

      <Section number="02" title="Первая dependency читает cookie">
        <Lead>
          {"Cookie может отсутствовать: пользователь ещё не входил, удалил данные браузера или отправил запрос другим клиентом. Это ожидаемый authentication failure, а не внутренняя ошибка сервера."}
        </Lead>

        <CodeBlock
          caption="тип session cookie"
          code={"from typing import Annotated\n\nfrom fastapi import Cookie, HTTPException, status\n\nSESSION_COOKIE_NAME = \"studyhub_session\"\n\nSessionCookie = Annotated[\n    str | None,\n    Cookie(alias=SESSION_COOKIE_NAME),\n]\n\ndef get_session_token(\n    raw_token: SessionCookie = None,\n) -> str:\n    if raw_token is None:\n        raise HTTPException(\n            status_code=status.HTTP_401_UNAUTHORIZED,\n            detail=\"Требуется вход\",\n        )\n\n    return raw_token"}
        />

        <TypeCards>
          <TypeCard badge="alias" title="HTTP-имя" code={"studyhub_session"}>
            {"Имя в request header Cookie. Оно может отличаться от Python-параметра."}
          </TypeCard>
          <TypeCard badge="optional" badgeTone="float" title="str | None" code={"None до проверки"}>
            {"FastAPI не превращает отсутствие cookie в 422. Dependency сама формирует 401."}
          </TypeCard>
          <TypeCard badge="result" badgeTone="str" title="str" code={"raw token"}>
            {"После функции следующий слой получает гарантированно существующее значение."}
          </TypeCard>
        </TypeCards>

        <FillBlank
          prompt="Какой HTTP-статус возвращается, когда cookie отсутствует?"
          before="status_code=status.HTTP_"
          after=""
          options={["401_UNAUTHORIZED", "422_UNPROCESSABLE_ENTITY", "201_CREATED"]}
          answer="401_UNAUTHORIZED"
          explanation="Форма запроса допустима, но пользователь не аутентифицирован."
        />

        <Callout>
          {"Не используйте 403 для отсутствующей session. 403 относится к подтверждённому пользователю, которому не разрешено конкретное действие."}
        </Callout>
      </Section>

      <Section number="03" title="Поиск session выполняется по digest">
        <Lead>
          {"Raw token не хранится в таблице. Dependency вычисляет digest тем же детерминированным способом и использует его в условии SELECT."}
        </Lead>

        <CodeBlock
          caption="получить запись session"
          code={"from sqlalchemy import select\nfrom sqlalchemy.orm import Session\n\ndef find_session_by_token(\n    db: Session,\n    raw_token: str,\n) -> UserSessionModel | None:\n    token_digest = digest_session_token(raw_token)\n\n    statement = select(UserSessionModel).where(\n        UserSessionModel.token_digest == token_digest,\n    )\n\n    return db.scalar(statement)"}
        />

        <CompareSolutions
          question="Какой поиск согласован с моделью хранения?"
          left={{
            title: "Сравнить raw token",
            code: "where(UserSessionModel.token_digest == raw_token)",
            note: "Представления различаются, поэтому запись не будет найдена.",
          }}
          right={{
            title: "Сравнить digest",
            code: "where(UserSessionModel.token_digest == digest(raw_token))",
            note: "Обе стороны имеют одно и то же представление.",
          }}
          preferred="right"
          explanation={"Raw token преобразуется на входной границе поиска."}
        />

        <PredictOutput
          code={"cookie = \"raw-token\"\nstored = sha256(cookie).hexdigest()\nlookup = sha256(cookie).hexdigest()\n\nprint(stored == lookup)"}
          output={"True"}
          hint="Один и тот же вход даёт один и тот же digest."
        />

        <BugHunt
          code={"statement = select(UserSessionModel).where(\n    UserSessionModel.user_id == raw_token,\n)"}
          question="Почему условие не выражает назначение token?"
          options={[
            "Token нужно сопоставлять с token_digest, а не с user_id",
            "SELECT запрещён в dependency",
            "user_id должен храниться в cookie",
          ]}
          correctIndex={0}
          explanation="Session token идентифицирует строку session, и уже она содержит user_id."
          fix={"statement = select(UserSessionModel).where(\n    UserSessionModel.token_digest == digest_session_token(raw_token),\n)"}
        />
      </Section>

      <Section number="04" title="Активность session — составное условие">
        <Lead>
          {"Найденная строка ещё не означает действующий вход. Session должна существовать, не быть отозванной и иметь expires_at позже текущего времени."}
        </Lead>

        <CodeBlock
          caption="проверить session"
          code={"def require_active_session(\n    db: Session,\n    raw_token: str,\n) -> UserSessionModel:\n    session = find_session_by_token(db, raw_token)\n\n    if session is None:\n        raise unauthorized()\n\n    if session.revoked_at is not None:\n        raise unauthorized()\n\n    if session.expires_at <= utc_now():\n        raise unauthorized()\n\n    return session"}
        />

        <BranchExplorer
          code={"session = lookup(token)\nif session is None:\n    401 unknown\nelif session.revoked_at:\n    401 revoked\nelif session.expires_at <= now:\n    401 expired\nelse:\n    active session"}
          scenarios={[
            { label: "unknown", activeLine: 2, output: "401" },
            { label: "revoked", activeLine: 4, output: "401" },
            { label: "expired", activeLine: 6, output: "401" },
            { label: "active", activeLine: 8, output: "continue" },
          ]}
        />

        <TrueFalse
          statement={<>{"Если token найден в таблице, expires_at можно не проверять."}</>}
          isTrue={false}
          explanation={"Просроченные записи могут оставаться в базе для аудита или последующей очистки."}
        />

        <RecallCard
          question="Почему все невалидные состояния дают один внешний 401?"
          answer={<p>{"Клиенту достаточно знать, что текущая authentication session недействительна. Внутреннюю причину приложение может учитывать отдельно, не раскрывая детали."}</p>}
        />

        <Callout tone="info">
          {"Проверки выполняются на каждом защищённом запросе. Наличие cookie в браузере не кеширует решение сервера."}
        </Callout>
      </Section>

      <Section number="05" title="Загрузка и проверка пользователя">
        <Lead>
          {"Session указывает на user_id, но пользователь мог быть удалён или деактивирован после login. Поэтому current user загружается заново и проходит собственную проверку."}
        </Lead>

        <CodeBlock
          caption="dependency current user"
          code={"from fastapi import Depends\n\nSessionToken = Annotated[str, Depends(get_session_token)]\n\ndef get_current_user(\n    raw_token: SessionToken,\n    db: SessionDep,\n) -> UserModel:\n    session = require_active_session(db, raw_token)\n    user = db.get(UserModel, session.user_id)\n\n    if user is None or not user.is_active:\n        raise unauthorized()\n\n    return user\n\nCurrentUser = Annotated[\n    UserModel,\n    Depends(get_current_user),\n]"}
        />

        <MethodGrid
          rows={[
            [<>get_session_token</>, "гарантирует наличие cookie"],
            [<>require_active_session</>, "проверяет session lifecycle"],
            [<>db.get(UserModel, user_id)</>, "загружает актуальное состояние пользователя"],
            [<>is_active</>, "запрещает доступ деактивированной учётной записи"],
            [<>CurrentUser</>, "переиспользуемый тип зависимости endpoint"],
          ]}
        />

        <BugHunt
          code={"def get_current_user(session):\n    return {\"id\": session.user_id, \"is_active\": True}"}
          question="Почему нельзя собирать пользователя только из session?"
          options={[
            "Состояние User могло измениться после login",
            "Словари запрещены в FastAPI",
            "Session всегда содержит password",
          ]}
          correctIndex={0}
          explanation="Права и активность должны загружаться из актуальной серверной записи User."
          fix={"user = db.get(UserModel, session.user_id)\nif user is None or not user.is_active:\n    raise unauthorized()\nreturn user"}
        />

        <Callout>
          {"Session подтверждает предыдущий вход, но не замораживает пользователя навсегда. Изменение is_active должно влиять на следующий request."}
        </Callout>
      </Section>

      <Section number="06" title="GET /users/me становится коротким">
        <Lead>
          {"После подготовки dependency endpoint профиля не знает о cookie, digest и таблице sessions. Он объявляет CurrentUser и возвращает безопасную схему."}
        </Lead>

        <CodeBlock
          caption="защищённый профиль"
          code={"from fastapi import APIRouter\n\nrouter = APIRouter(prefix=\"/users\", tags=[\"users\"])\n\n@router.get(\"/me\", response_model=UserRead)\ndef read_current_user(\n    current_user: CurrentUser,\n):\n    return current_user"}
        />

        <CompareSolutions
          question="Где должна находиться authentication pipeline?"
          left={{
            title: "В каждом endpoint",
            code: "read cookie → SELECT session → SELECT user",
            note: "Проверки копируются и легко расходятся.",
          }}
          right={{
            title: "В dependency",
            code: "current_user: CurrentUser",
            note: "Endpoint явно требует подтверждённого пользователя.",
          }}
          preferred="right"
          explanation={"Dependency централизует получение обязательного контекста."}
        />

        <CodeSequence
          title="Проследите защищённый request"
          prompt="Расположите этапы до выполнения read_current_user."
          pieces={[
            { id: "request", code: "GET /users/me + Cookie" },
            { id: "token", code: "get_session_token" },
            { id: "session", code: "require_active_session" },
            { id: "user", code: "get_current_user" },
            { id: "endpoint", code: "read_current_user" },
            { id: "response", code: "UserRead response" },
          ]}
          correctOrder={["request", "token", "session", "user", "endpoint", "response"]}
          explanation="FastAPI разрешает цепочку dependencies прежде, чем вызвать тело endpoint."
        />

        <Callout tone="info">
          {"Короткий endpoint — не признак скрытой магии, если dependency разбита на именованные проверяемые шаги."}
        </Callout>
      </Section>

      <Section number="07" title="Тесты активной и невалидной session">
        <Lead>
          {"Набор тестов должен покрывать каждую ветку pipeline. Один успешный тест не доказывает поведение при неизвестном, просроченном или отозванном token."}
        </Lead>

        <CodeBlock
          caption="успешный профиль"
          code={"def test_me_returns_logged_user(client, registered_user):\n    login(client, registered_user.email, \"correct-password\")\n\n    response = client.get(\"/users/me\")\n\n    assert response.status_code == 200\n    assert response.json()[\"id\"] == registered_user.id"}
        />

        <CodeBlock
          caption="матрица отказов"
          code={"def test_me_requires_cookie(client):\n    assert client.get(\"/users/me\").status_code == 401\n\n\ndef test_me_rejects_revoked_session(client, revoked_cookie):\n    client.cookies.set(\"studyhub_session\", revoked_cookie)\n    assert client.get(\"/users/me\").status_code == 401\n\n\ndef test_me_rejects_expired_session(client, expired_cookie):\n    client.cookies.set(\"studyhub_session\", expired_cookie)\n    assert client.get(\"/users/me\").status_code == 401"}
        />

        <TerminalDemo
          title="authentication matrix"
          lines={[
            { cmd: "pytest tests/test_current_user.py -q" },
            { out: "active session PASSED" },
            { out: "missing cookie PASSED" },
            { out: "unknown token PASSED" },
            { out: "revoked session PASSED" },
            { out: "expired session PASSED" },
            { out: "5 passed" },
          ]}
        />

        <Callout>
          {"Создавайте просроченную session через fixture с явным expires_at, а не через sleep. Тест должен быть быстрым и детерминированным."}
        </Callout>

        <div className="lesson-practice-steps">
          <h3>{"Одна причина на dependency"}</h3>
          <p>
            {"get_session_token отвечает за транспорт, require_active_session — за lifecycle входа, get_current_user — за актуальную учётную запись."}
          </p>
          <h3>{"Единый внешний контракт"}</h3>
          <p>
            {"Missing, unknown, revoked и expired session возвращают одинаковый 401. Внутренние причины остаются деталями диагностики сервера."}
          </p>
          <h3>{"Регрессионная проверка"}</h3>
          <p>
            {"После деактивации User ранее выданная session не должна открывать /users/me. Это доказывает повторную загрузку User."}
          </p>
        </div>

        <CodeBlock
          caption="единая фабрика 401"
          code={"def unauthorized() -> HTTPException:\n    return HTTPException(\n        status_code=401,\n        detail=\"Требуется действующая session\",\n    )"}
        />

        <Callout>
          {"Не передавайте различающиеся причины authentication failure клиенту через detail. Такой контракт облегчает enumeration и привязывает frontend к внутренней модели."}
        </Callout>

      </Section>

      <Section number="08" title="Контрольная точка: current user как dependency">
        <Lead>
          {"Полная модель должна объясняться без фразы «FastAPI сам понял пользователя». Framework только вызывает объявленные функции; каждая функция преобразует один вход в более сильную гарантию."}
        </Lead>

        <div className="lesson-check-group">
          <QuizCard
            question="Что возвращает get_session_token?"
            options={["существующий raw token или 401", "готовый UserRead", "новую cookie"]}
            correctIndex={0}
            explanation="Первая dependency отвечает только за наличие значения."
          />
          <QuizCard
            question="По какому полю ищется session?"
            options={["token_digest", "password_hash", "username"]}
            correctIndex={0}
            explanation="Raw token сначала преобразуется в digest."
          />
          <QuizCard
            question="Почему User загружается заново?"
            options={["проверить актуальное существование и is_active", "обновить cookie", "создать SQL migration"]}
            correctIndex={0}
            explanation="Состояние учётной записи могло измениться после login."
          />
          <QuizCard
            question="Что получает endpoint /users/me?"
            options={["CurrentUser", "сырой заголовок Cookie", "пароль"]}
            correctIndex={0}
            explanation="Authentication pipeline завершена до вызова endpoint."
          />
        </div>

        <KeyTakeaways
          points={[
            <>{"Dependency устраняет повторение authentication checks."}</>,
            <>{"Отсутствующая cookie формирует 401, а не validation error 422."}</>,
            <>{"Raw token преобразуется в digest перед SELECT."}</>,
            <>{"Активная session одновременно существует, не отозвана и не просрочена."}</>,
            <>{"Пользователь загружается заново и проверяется через is_active."}</>,
            <><code>{"CurrentUser"}</code>{" делает требование endpoint явным."}</>,
            <>{"Негативные ветки проверяются отдельными детерминированными тестами."}</>,
          ]}
        />

        <PracticeCta text="Реализуйте цепочку get_session_token → require_active_session → get_current_user и endpoint GET /users/me. Добавьте тесты отсутствующей cookie, неизвестного token, revoked_at, expires_at и деактивированного пользователя." />
      </Section>
    </RichLesson>
  );
}

// 103. Logout, expiration и revocation
export function Lesson103({ module }: { module?: string }) {
  return (
    <RichLesson>
      <RichHero
        variant="project"
        chip={module ?? BLOCK_TITLE}
        title={"Logout, expiration и revocation"}
        intro={"Завершим lifecycle server-side session: найдём именно текущую запись, отзовём её в базе, удалим cookie у клиента, реализуем logout всех устройств и разберём очистку просроченных sessions."}
        tags={[
          { icon: <LockKeyhole size={14} />, label: "revoke + delete cookie" },
          { icon: <HardDrive size={14} />, label: "one device · all devices" },
        ]}
      />
      <TheoryBridge lesson={103} />

      <Section number="01" title="Logout имеет клиентскую и серверную половину">
        <Lead>
          {"В session-based authentication существуют два состояния: cookie в браузере и строка в user_sessions. Надёжный logout меняет оба. Одного delete_cookie недостаточно, потому что скопированный raw token останется действующим на сервере."}
        </Lead>

        <div className="lesson-route">
          <ol>
            <li>
              <strong>{"Определить текущую session:"}</strong> {"получить не только User, но и строку, найденную по cookie."}
            </li>
            <li>
              <strong>{"Отозвать на сервере:"}</strong> {"записать revoked_at и выполнить commit."}
            </li>
            <li>
              <strong>{"Очистить клиента:"}</strong> {"добавить удаляющий Set-Cookie с теми же path и domain."}
            </li>
            <li>
              <strong>{"Проверить повторный request:"}</strong> {"старая session должна давать 401."}
            </li>
          </ol>
          <p>
            {"После урока StudyHub поддерживает logout текущего устройства, logout всех устройств и понятную политику истечения срока."}
          </p>
        </div>

        <CompareSolutions
          question="Какой logout отзывает доступ, даже если token был скопирован?"
          left={{
            title: "Только удалить cookie",
            code: "response.delete_cookie(\"studyhub_session\")",
            note: "Очищает конкретный браузер, но server-side запись остаётся активной.",
          }}
          right={{
            title: "Revoke и удалить cookie",
            code: "session.revoked_at = now\ncommit\nresponse.delete_cookie(...)",
            note: "Сервер перестаёт принимать старый token.",
          }}
          preferred="right"
          explanation={"Источник решения о доступе находится на сервере."}
        />

        <Callout tone="info">
          {"Logout не удаляет User и не меняет password_hash. Он завершает только один или несколько экземпляров входа."}
        </Callout>
      </Section>

      <Section number="02" title="Dependency текущей session">
        <Lead>
          {"Для logout нужен объект UserSessionModel, а не только current_user. Поэтому цепочку удобно разделить: CurrentSession возвращает активную session, CurrentUser использует её user_id."}
        </Lead>

        <CodeBlock
          caption="переиспользуемая dependency"
          code={"from typing import Annotated\n\nfrom fastapi import Depends\n\nCurrentSession = Annotated[\n    UserSessionModel,\n    Depends(get_current_session),\n]\n\ndef get_current_session(\n    raw_token: SessionToken,\n    db: SessionDep,\n) -> UserSessionModel:\n    return require_active_session(db, raw_token)\n\ndef get_current_user(\n    session: CurrentSession,\n    db: SessionDep,\n) -> UserModel:\n    user = db.get(UserModel, session.user_id)\n    if user is None or not user.is_active:\n        raise unauthorized()\n    return user"}
        />

        <TypeCards>
          <TypeCard badge="session" title="CurrentSession" code={"UserSessionModel"}>
            {"Нужна операциям logout, просмотра устройств и обновления last_seen."}
          </TypeCard>
          <TypeCard badge="user" badgeTone="float" title="CurrentUser" code={"UserModel"}>
            {"Нужна предметным endpoint, которые работают от имени пользователя."}
          </TypeCard>
          <TypeCard badge="chain" badgeTone="str" title="Одна проверка" code={"token → session → user"}>
            {"FastAPI переиспользует resolved dependency в рамках одного request."}
          </TypeCard>
        </TypeCards>

        <MatchPairs
          prompt="Соедините endpoint и минимальный обязательный контекст."
          pairs={[
            { left: "POST /auth/session/logout", right: "CurrentSession" },
            { left: "GET /users/me", right: "CurrentUser" },
            { left: "DELETE /tasks/{task_id}", right: "CurrentUser" },
            { left: "GET /auth/sessions", right: "CurrentUser" },
          ]}
          explanation="Endpoint объявляет именно тот подтверждённый контекст, который ему нужен."
        />

        <Callout>
          {"Не выполняйте повторный SELECT session внутри logout, если CurrentSession уже разрешена dependency chain."}
        </Callout>
      </Section>

      <Section number="03" title="Отзыв текущей session">
        <Lead>
          {"Отзыв сохраняет запись для аудита, но помечает её недействительной. Повторная операция должна быть предсказуемой: защищённый logout вызывается только для активной session, поэтому после первого logout тот же token уже не проходит dependency."}
        </Lead>

        <CodeBlock
          caption="session service"
          code={"from sqlalchemy.orm import Session\n\ndef revoke_session(\n    db: Session,\n    session: UserSessionModel,\n) -> None:\n    session.revoked_at = utc_now()\n    db.commit()"}
        />

        <CodeBlock
          caption="endpoint logout"
          code={"from fastapi import Response, status\n\n@router.post(\n    \"/logout\",\n    status_code=status.HTTP_204_NO_CONTENT,\n)\ndef session_logout(\n    response: Response,\n    current_session: CurrentSession,\n    db: SessionDep,\n) -> None:\n    revoke_session(db, current_session)\n    response.delete_cookie(\n        key=settings.session_cookie_name,\n        path=\"/\",\n    )"}
        />

        <CodeSequence
          title="Соберите logout текущего устройства"
          prompt="Расположите действия в порядке изменения источников состояния."
          pieces={[
            { id: "resolve", code: "resolve CurrentSession" },
            { id: "revoke", code: "set revoked_at" },
            { id: "commit", code: "db.commit()" },
            { id: "delete", code: "response.delete_cookie(...)" },
            { id: "empty", code: "return 204 without body" },
          ]}
          correctOrder={["resolve", "revoke", "commit", "delete", "empty"]}
          explanation="Сначала сервер прекращает доверять token, затем клиент получает инструкцию удалить cookie."
        />

        <Callout tone="info">
          {"Статус 204 означает отсутствие response body. Не возвращайте JSON-сообщение вместе с 204."}
        </Callout>
      </Section>

      <Section number="04" title="Expiration, revocation и cleanup — разные действия">
        <Lead>
          {"Session может перестать работать автоматически по expires_at или вручную по revoked_at. Физическое удаление старых строк — отдельная housekeeping-операция и не должно быть условием безопасности."}
        </Lead>

        <MethodGrid
          rows={[
            [<>expiration</>, "сервер отклоняет session после заранее заданного expires_at"],
            [<>revocation</>, "сервер завершает session раньше срока по явному событию"],
            [<>delete_cookie</>, "клиент перестаёт автоматически отправлять значение"],
            [<>cleanup</>, "удаляет старые записи для обслуживания хранилища"],
            [<>audit retention</>, "может сохранять минимальную историю по политике проекта"],
          ]}
        />

        <BranchExplorer
          code={"request token\nif revoked_at is not None:\n    reject\nelif expires_at <= now:\n    reject\nelse:\n    accept\n\ncleanup later removes old rows"}
          scenarios={[
            { label: "manual logout", activeLine: 2, output: "revoked → 401" },
            { label: "time passed", activeLine: 4, output: "expired → 401" },
            { label: "active", activeLine: 6, output: "request continues" },
            { label: "maintenance", activeLine: 8, output: "old rows may be deleted later" },
          ]}
        />

        <TrueFalse
          statement={<>{"Просроченная session остаётся безопасной только после физического DELETE из базы."}</>}
          isTrue={false}
          explanation={"Доступ прекращается из-за проверки expires_at. Cleanup отвечает за объём данных, а не за основное решение авторизации."}
        />

        <Callout>
          {"Не пытайтесь удалять все просроченные sessions внутри каждого request. Это смешивает authentication check с обслуживанием таблицы."}
        </Callout>
      </Section>

      <Section number="05" title="Logout всех устройств">
        <Lead>
          {"Операция «выйти везде» отзывает все активные sessions пользователя одной транзакцией. Текущая cookie также удаляется, а другие устройства получат 401 при следующем запросе."}
        </Lead>

        <CodeBlock
          caption="массовый update"
          code={"from sqlalchemy import update\n\ndef revoke_all_user_sessions(\n    db: Session,\n    user_id: int,\n) -> int:\n    statement = (\n        update(UserSessionModel)\n        .where(\n            UserSessionModel.user_id == user_id,\n            UserSessionModel.revoked_at.is_(None),\n        )\n        .values(revoked_at=utc_now())\n    )\n\n    result = db.execute(statement)\n    db.commit()\n    return result.rowcount"}
        />

        <CodeBlock
          caption="endpoint logout all"
          code={"@router.post(\n    \"/logout-all\",\n    status_code=status.HTTP_204_NO_CONTENT,\n)\ndef logout_all_sessions(\n    response: Response,\n    current_user: CurrentUser,\n    db: SessionDep,\n) -> None:\n    revoke_all_user_sessions(db, current_user.id)\n    response.delete_cookie(\n        key=settings.session_cookie_name,\n        path=\"/\",\n    )"}
        />

        <CompareSolutions
          question="По какому условию отзываются все устройства?"
          left={{
            title: "Только текущий token",
            code: "WHERE token_digest = current_digest",
            note: "Завершает одну session.",
          }}
          right={{
            title: "Все sessions пользователя",
            code: "WHERE user_id = current_user.id AND revoked_at IS NULL",
            note: "Завершает каждый активный вход.",
          }}
          preferred="right"
          explanation={"Logout-all выражает область операции через user_id."}
        />

        <Callout tone="info">
          {"Количество обновлённых строк полезно для внутренних тестов и логов, но не обязательно возвращать клиенту в 204 response."}
        </Callout>
      </Section>

      <Section number="06" title="Ошибка rollback при отзыве">
        <Lead>
          {"Revocation изменяет базу и поэтому подчиняется тем же транзакционным правилам, что CRUD. При ошибке commit выполняется rollback, а endpoint не должен заявлять успешный logout."}
        </Lead>

        <CodeBlock
          caption="безопасный service"
          code={"from sqlalchemy.exc import SQLAlchemyError\n\nclass SessionRevocationError(Exception):\n    pass\n\ndef revoke_session(db: Session, session: UserSessionModel) -> None:\n    session.revoked_at = utc_now()\n\n    try:\n        db.commit()\n    except SQLAlchemyError as error:\n        db.rollback()\n        raise SessionRevocationError from error"}
        />

        <BugHunt
          code={"session.revoked_at = utc_now()\ntry:\n    db.commit()\nexcept SQLAlchemyError:\n    response.delete_cookie(\"studyhub_session\")"}
          question="Какое обязательное действие пропущено после database error?"
          options={[
            "db.rollback()",
            "создание нового пользователя",
            "декодирование JWT",
          ]}
          correctIndex={0}
          explanation="Session SQLAlchemy должна выйти из failed transaction state."
          fix={"try:\n    db.commit()\nexcept SQLAlchemyError as error:\n    db.rollback()\n    raise SessionRevocationError from error"}
        />

        <RecallCard
          question="Почему нельзя удалить cookie и скрыть ошибку commit?"
          answer={<p>{"Клиент подумает, что logout завершён, хотя server-side token продолжит действовать. Нельзя сообщать успех при несогласованном состоянии."}</p>}
        />

        <Callout>
          {"При временной ошибке пользователь может повторить logout. Безопасность требует честно сохранить серверный результат, а не только изменить интерфейс браузера."}
        </Callout>
      </Section>

      <Section number="07" title="Два клиента доказывают область logout">
        <Lead>
          {"Два экземпляра TestClient моделируют два устройства с независимыми cookie jar. Это позволяет доказать разницу между logout текущей session и logout-all."}
        </Lead>

        <CodeBlock
          caption="logout одного устройства"
          code={"def test_logout_revokes_only_current_session(app, user):\n    laptop = TestClient(app)\n    phone = TestClient(app)\n\n    login(laptop, user)\n    login(phone, user)\n\n    assert laptop.post(\"/auth/session/logout\").status_code == 204\n    assert laptop.get(\"/users/me\").status_code == 401\n    assert phone.get(\"/users/me\").status_code == 200"}
        />

        <CodeBlock
          caption="logout всех устройств"
          code={"def test_logout_all_revokes_every_session(app, user):\n    laptop = TestClient(app)\n    phone = TestClient(app)\n\n    login(laptop, user)\n    login(phone, user)\n\n    assert laptop.post(\"/auth/session/logout-all\").status_code == 204\n    assert laptop.get(\"/users/me\").status_code == 401\n    assert phone.get(\"/users/me\").status_code == 401"}
        />

        <TerminalDemo
          title="session lifecycle tests"
          lines={[
            { cmd: "pytest tests/test_session_logout.py -q" },
            { out: "logout current device PASSED" },
            { out: "old token rejected PASSED" },
            { out: "other device remains active PASSED" },
            { out: "logout all devices PASSED" },
            { out: "4 passed" },
          ]}
        />

        <Callout tone="info">
          {"Не копируйте cookies между laptop и phone fixtures. Их независимость и является частью тестируемого контракта."}
        </Callout>

        <div className="lesson-practice-steps">
          <h3>{"Security decision"}</h3>
          <p>
            {"Проверка expires_at и revoked_at остаётся в request pipeline независимо от наличия cleanup job."}
          </p>
          <h3>{"Housekeeping decision"}</h3>
          <p>
            {"Старые строки можно удалять отдельной командой обслуживания по согласованному retention period."}
          </p>
          <h3>{"Operational boundary"}</h3>
          <p>
            {"Планировщик фоновых задач и распределённая очистка относятся к будущим этапам. Сейчас достаточно тестируемой функции cleanup_expired_sessions."}
          </p>
        </div>

        <CodeBlock
          caption="явная очистка для административной команды"
          code={"from sqlalchemy import delete\n\ndef cleanup_old_sessions(db: Session, cutoff: datetime) -> int:\n    statement = delete(UserSessionModel).where(\n        UserSessionModel.expires_at < cutoff,\n    )\n    result = db.execute(statement)\n    db.commit()\n    return result.rowcount"}
        />

        <Callout>
          {"Cleanup не вызывается из get_current_user. Authentication request должен оставаться коротким и не выполнять несвязанное массовое удаление."}
        </Callout>

      </Section>

      <Section number="08" title="Контрольная точка: lifecycle session">
        <Lead>
          {"Session теперь имеет полный жизненный цикл: создаётся при login, используется current_user dependency, завершается по expires_at или revoked_at и может очищаться отдельной служебной операцией."}
        </Lead>

        <div className="lesson-check-group">
          <QuizCard
            question="Почему delete_cookie недостаточно?"
            options={["server-side session останется активной", "удалится User", "изменится password_hash"]}
            correctIndex={0}
            explanation="Сервер продолжит принимать скопированный token без revocation."
          />
          <QuizCard
            question="Что изменяет logout текущего устройства?"
            options={["одну CurrentSession", "все Users", "все задачи"]}
            correctIndex={0}
            explanation="Точечный logout работает с записью, найденной по текущей cookie."
          />
          <QuizCard
            question="Чем cleanup отличается от expiration?"
            options={["cleanup удаляет старые строки, expiration запрещает доступ", "ничем", "cleanup создаёт token"]}
            correctIndex={0}
            explanation="Безопасность обеспечивается проверкой времени, а cleanup обслуживает хранилище."
          />
          <QuizCard
            question="Как проверить несколько устройств?"
            options={["двумя независимыми TestClient", "одним request body", "двумя endpoint в одном client"]}
            correctIndex={0}
            explanation="Каждый клиент должен иметь собственный cookie jar."
          />
        </div>

        <KeyTakeaways
          points={[
            <>{"Logout изменяет server-side session и клиентскую cookie."}</>,
            <>{"CurrentSession предоставляет endpoint конкретную запись входа."}</>,
            <>{"revoked_at завершает доступ раньше expires_at."}</>,
            <>{"Expiration не зависит от физического удаления строки."}</>,
            <>{"Logout-all отзывает активные sessions по user_id."}</>,
            <>{"Ошибка commit требует rollback и честного ответа."}</>,
            <>{"Два TestClient моделируют два независимых устройства."}</>,
          ]}
        />

        <PracticeCta text="Реализуйте CurrentSession, POST /auth/session/logout и POST /auth/session/logout-all. Докажите тестами, что старый token получает 401, обычный logout не завершает второе устройство, а logout-all завершает оба." />
      </Section>
    </RichLesson>
  );
}

// 104. Владение задачами и session-тесты
export function Lesson104({ module }: { module?: string }) {
  return (
    <RichLesson>
      <RichHero
        variant="project"
        chip={module ?? BLOCK_TITLE}
        title={"Владение задачами и session-тесты"}
        intro={"Превратим общий CRUD StudyHub в личное пространство: сервер назначит task.user_id из CurrentUser, каждый SELECT будет ограничен владельцем, а тесты двух пользователей докажут отсутствие горизонтального доступа."}
        tags={[
          { icon: <ShieldCheck size={14} />, label: "ownership authorization" },
          { icon: <ListChecks size={14} />, label: "two-user test matrix" },
        ]}
      />
      <TheoryBridge lesson={104} />

      <Section number="01" title="Аутентификация отвечает «кто», ownership — «можно ли»">
        <Lead>
          {"CurrentUser подтверждает личность, но этого недостаточно для доступа к любой задаче. Authorization проверяет отношение пользователя к конкретному ресурсу. В StudyHub базовое правило звучит так: пользователь работает только со своими задачами."}
        </Lead>

        <div className="lesson-route">
          <ol>
            <li>
              <strong>{"Назначить владельца:"}</strong> {"при создании server записывает current_user.id в task.user_id."}
            </li>
            <li>
              <strong>{"Ограничить коллекцию:"}</strong> {"список выбирает только строки текущего пользователя."}
            </li>
            <li>
              <strong>{"Ограничить объект:"}</strong> {"поиск объединяет task_id и user_id в одном WHERE."}
            </li>
            <li>
              <strong>{"Доказать тестами:"}</strong> {"User B не читает, не изменяет и не удаляет Task A."}
            </li>
          </ol>
          <p>
            {"Это первая полноценная object-level authorization: решение зависит не только от роли пользователя, но и от владельца конкретной строки."}
          </p>
        </div>

        <BranchExplorer
          code={"authenticated request\n  ↓ CurrentUser\nuser id=8\n  ↓ query scope\nWHERE task.user_id = 8\n  ↓ result\nown task or 404\n  ↓ operation\nread/update/delete"}
          scenarios={[
            { label: "личность", activeLine: 2, output: "current_user.id = 8" },
            { label: "область", activeLine: 4, output: "только owner_id=8" },
            { label: "чужая задача", activeLine: 6, output: "404 без раскрытия" },
            { label: "своя задача", activeLine: 8, output: "операция разрешена" },
          ]}
        />

        <Callout tone="info">
          {"Authentication и authorization выполняются последовательно. Действующая session не даёт автоматического доступа к ресурсам других пользователей."}
        </Callout>
      </Section>

      <Section number="02" title="Foreign key владельца в TaskModel">
        <Lead>
          {"Владение становится частью модели хранения. Колонка user_id ссылается на users.id и является обязательной для новой личной задачи."}
        </Lead>

        <CodeBlock
          caption="ORM-модель задачи"
          code={"from sqlalchemy import ForeignKey, String\nfrom sqlalchemy.orm import Mapped, mapped_column, relationship\n\nclass TaskModel(Base):\n    __tablename__ = \"tasks\"\n\n    id: Mapped[int] = mapped_column(primary_key=True)\n    title: Mapped[str] = mapped_column(String(200))\n    is_done: Mapped[bool] = mapped_column(default=False)\n    user_id: Mapped[int] = mapped_column(\n        ForeignKey(\"users.id\"),\n        nullable=False,\n        index=True,\n    )\n\n    owner: Mapped[\"UserModel\"] = relationship(\n        back_populates=\"tasks\",\n    )"}
        />

        <CodeBlock
          caption="обратная relationship"
          code={"class UserModel(Base):\n    __tablename__ = \"users\"\n\n    # id, email, password_hash, ...\n\n    tasks: Mapped[list[\"TaskModel\"]] = relationship(\n        back_populates=\"owner\",\n    )"}
        />

        <TypeCards>
          <TypeCard badge="foreign key" title="user_id" code={"tasks.user_id → users.id"}>
            {"Хранит идентификатор владельца и поддерживает ссылочную целостность."}
          </TypeCard>
          <TypeCard badge="relationship" badgeTone="float" title="owner" code={"task.owner"}>
            {"ORM-навигация к объекту User. Она не заменяет колонку foreign key."}
          </TypeCard>
          <TypeCard badge="scope" badgeTone="str" title="query condition" code={"TaskModel.user_id == current_user.id"}>
            {"Фактическое authorization-ограничение каждого запроса."}
          </TypeCard>
        </TypeCards>

        <RecallCard
          question="Достаточно ли наличия foreign key для запрета чужого доступа?"
          answer={<p>{"Нет. Foreign key проверяет существование связанного User, но endpoint всё равно обязан ограничить SELECT владельцем."}</p>}
        />

        <Callout>
          {"Миграция существующей таблицы с данными требует отдельной стратегии заполнения user_id. В учебной чистой базе можно сразу сделать колонку nullable=False."}
        </Callout>
      </Section>

      <Section number="03" title="Владелец назначается сервером">
        <Lead>
          {"TaskCreate не содержит user_id. Клиент описывает предметные поля задачи, а ownership вычисляется из CurrentUser. Это предотвращает подмену владельца через request body."}
        </Lead>

        <CodeBlock
          caption="HTTP-схема без user_id"
          code={"from pydantic import BaseModel, Field\n\nclass TaskCreate(BaseModel):\n    title: str = Field(min_length=1, max_length=200)\n\nclass TaskRead(BaseModel):\n    id: int\n    title: str\n    is_done: bool\n    user_id: int\n\n    model_config = {\"from_attributes\": True}"}
        />

        <CodeBlock
          caption="создание от имени current user"
          code={"@router.post(\n    \"\",\n    response_model=TaskRead,\n    status_code=201,\n)\ndef create_task(\n    data: TaskCreate,\n    current_user: CurrentUser,\n    db: SessionDep,\n):\n    task = TaskModel(\n        title=data.title,\n        is_done=False,\n        user_id=current_user.id,\n    )\n\n    db.add(task)\n    db.commit()\n    db.refresh(task)\n    return task"}
        />

        <CompareSolutions
          question="Как определяется owner новой задачи?"
          left={{
            title: "Довериться body",
            code: "{\"title\": \"SQL\", \"user_id\": 1}",
            note: "Клиент может указать id другого пользователя.",
          }}
          right={{
            title: "Использовать CurrentUser",
            code: "user_id=current_user.id",
            note: "Сервер выводит владельца из проверенной session.",
          }}
          preferred="right"
          explanation={"Authorization context формируется сервером, а не принимается как свободный ввод."}
        />

        <BugHunt
          code={"class TaskCreate(BaseModel):\n    title: str\n    user_id: int\n\n# endpoint сохраняет data.user_id"}
          question="Какую уязвимость создаёт такой контракт?"
          options={[
            "Клиент может назначить задачу другому владельцу",
            "Pydantic перестанет проверять title",
            "Cookie станет просроченной",
          ]}
          correctIndex={0}
          explanation="Владелец является server-controlled полем."
          fix={"class TaskCreate(BaseModel):\n    title: str\n\n# endpoint использует current_user.id"}
        />
      </Section>

      <Section number="04" title="Список задач всегда ограничен пользователем">
        <Lead>
          {"GET /tasks не должен сначала загружать все строки и фильтровать Python-кодом. Ownership выражается в SQLAlchemy statement, чтобы чужие записи вообще не попадали в результат."}
        </Lead>

        <CodeBlock
          caption="scoped collection query"
          code={"from sqlalchemy import select\n\n@router.get(\"\", response_model=list[TaskRead])\ndef list_tasks(\n    current_user: CurrentUser,\n    db: SessionDep,\n):\n    statement = (\n        select(TaskModel)\n        .where(TaskModel.user_id == current_user.id)\n        .order_by(TaskModel.id)\n    )\n\n    return list(db.scalars(statement))"}
        />

        <CompareSolutions
          question="Где лучше применять ownership filter?"
          left={{
            title: "После SELECT всех задач",
            code: "[task for task in all_tasks if task.user_id == user.id]",
            note: "Чужие строки уже загружены в процесс и могут случайно утечь.",
          }}
          right={{
            title: "В WHERE базы",
            code: "where(TaskModel.user_id == current_user.id)",
            note: "База возвращает только разрешённую область.",
          }}
          preferred="right"
          explanation={"Authorization scope должен быть частью запроса к данным."}
        />

        <PredictOutput
          code={"tasks in database:\n  #1 user_id=7\n  #2 user_id=8\n  #3 user_id=7\n\ncurrent_user.id = 7\nWHERE Task.user_id == 7"}
          output={"Вернутся задачи #1 и #3."}
          hint="Task #2 не должна попадать в Python-результат."
        />

        <TrueFalse
          statement={<>{"CurrentUser автоматически добавляет WHERE user_id к любому SQLAlchemy-запросу."}</>}
          isTrue={false}
          explanation={"Dependency предоставляет User, но разработчик явно применяет authorization scope к statement."}
        />

        <Callout tone="info">
          {"Явное условие полезно для обучения и code review: из запроса видно, на каком основании данные доступны."}
        </Callout>
      </Section>

      <Section number="05" title="Один объект ищется сразу по id и owner">
        <Lead>
          {"Для чтения, изменения и удаления используется общий helper get_owned_task_or_404. Он объединяет идентификатор ресурса и владельца в одном запросе."}
        </Lead>

        <CodeBlock
          caption="ownership helper"
          code={"from fastapi import HTTPException\n\ndef get_owned_task_or_404(\n    db: Session,\n    task_id: int,\n    user_id: int,\n) -> TaskModel:\n    statement = select(TaskModel).where(\n        TaskModel.id == task_id,\n        TaskModel.user_id == user_id,\n    )\n\n    task = db.scalar(statement)\n\n    if task is None:\n        raise HTTPException(\n            status_code=404,\n            detail=\"Задача не найдена\",\n        )\n\n    return task"}
        />

        <TypeCards>
          <TypeCard badge="missing" title="Задачи нет" code={"id=999"}>
            {"Helper возвращает 404."}
          </TypeCard>
          <TypeCard badge="foreign" badgeTone="float" title="Задача чужая" code={"id=5, owner=other"}>
            {"Helper также возвращает 404 и не подтверждает существование ресурса."}
          </TypeCard>
          <TypeCard badge="owned" badgeTone="str" title="Задача своя" code={"id=5, owner=current"}>
            {"Helper возвращает ORM-объект для дальнейшей операции."}
          </TypeCard>
        </TypeCards>

        <BranchExplorer
          code={"SELECT task\nWHERE id = task_id\n  AND user_id = current_user.id\n\nif no row:\n    404\nelse:\n    return owned task"}
          scenarios={[
            { label: "не существует", activeLine: 5, output: "404" },
            { label: "существует, но чужая", activeLine: 5, output: "404" },
            { label: "существует и своя", activeLine: 7, output: "TaskModel" },
          ]}
        />

        <RecallCard
          question="Почему для missing и foreign task используется одинаковый 404?"
          answer={<p>{"Ответ не раскрывает аутентифицированному пользователю существование чужого ресурса. Для его области обе ситуации выглядят как отсутствие доступной задачи."}</p>}
        />

        <Callout>
          {"Сначала загрузить задачу только по id, а затем проверить owner тоже возможно, но единый scoped query уменьшает шанс забыть вторую проверку."}
        </Callout>
      </Section>

      <Section number="06" title="Update и delete используют один authorization helper">
        <Lead>
          {"После get_owned_task_or_404 предметная операция становится обычной: обновить разрешённый объект или удалить его. Ownership не копируется отдельными if во все endpoint."}
        </Lead>

        <CodeBlock
          caption="частичное обновление"
          code={"@router.patch(\"/{task_id}\", response_model=TaskRead)\ndef update_task(\n    task_id: int,\n    data: TaskPatch,\n    current_user: CurrentUser,\n    db: SessionDep,\n):\n    task = get_owned_task_or_404(\n        db,\n        task_id,\n        current_user.id,\n    )\n\n    for field, value in data.model_dump(\n        exclude_unset=True,\n    ).items():\n        setattr(task, field, value)\n\n    db.commit()\n    db.refresh(task)\n    return task"}
        />

        <CodeBlock
          caption="удаление"
          code={"@router.delete(\n    \"/{task_id}\",\n    status_code=204,\n)\ndef delete_task(\n    task_id: int,\n    current_user: CurrentUser,\n    db: SessionDep,\n) -> None:\n    task = get_owned_task_or_404(\n        db,\n        task_id,\n        current_user.id,\n    )\n\n    db.delete(task)\n    db.commit()"}
        />

        <CodeSequence
          title="Соберите защищённый PATCH"
          prompt="Расположите действия от authentication до response."
          pieces={[
            { id: "current", code: "resolve CurrentUser" },
            { id: "owned", code: "get_owned_task_or_404" },
            { id: "patch", code: "apply provided fields" },
            { id: "commit", code: "db.commit()" },
            { id: "refresh", code: "db.refresh(task)" },
            { id: "return", code: "return TaskRead" },
          ]}
          correctOrder={["current", "owned", "patch", "commit", "refresh", "return"]}
          explanation="Изменение начинается только после подтверждения пользователя и владения ресурсом."
        />

        <BugHunt
          code={"task = db.get(TaskModel, task_id)\ntask.title = data.title\ndb.commit()"}
          question="Какая проверка отсутствует?"
          options={[
            "Task.user_id должен совпасть с current_user.id",
            "Session cookie должна стать JWT",
            "title нужно сохранить в users",
          ]}
          correctIndex={0}
          explanation="Поиск только по id позволяет менять чужой ресурс."
          fix={"task = get_owned_task_or_404(\n    db,\n    task_id,\n    current_user.id,\n)\ntask.title = data.title\ndb.commit()"}
        />
      </Section>

      <Section number="07" title="Session-тесты двух пользователей">
        <Lead>
          {"Наиболее важный тест блока строит два независимых аккаунта и два клиента. Он доказывает не только успешный CRUD, но и отрицательную границу: User B не может воздействовать на Task A."}
        </Lead>

        <CodeBlock
          caption="fixture двух клиентов"
          code={"def make_logged_client(app, email, password):\n    client = TestClient(app)\n    response = client.post(\n        \"/auth/session/login\",\n        json={\"email\": email, \"password\": password},\n    )\n    assert response.status_code == 200\n    return client\n\nalice = make_logged_client(app, \"alice@example.com\", \"alice-pass\")\nbob = make_logged_client(app, \"bob@example.com\", \"bob-password\")"}
        />

        <CodeBlock
          caption="чужая задача недоступна"
          code={"created = alice.post(\n    \"/tasks\",\n    json={\"title\": \"Private task\"},\n)\ntask_id = created.json()[\"id\"]\n\nassert bob.get(f\"/tasks/{task_id}\").status_code == 404\nassert bob.patch(\n    f\"/tasks/{task_id}\",\n    json={\"title\": \"Hacked\"},\n).status_code == 404\nassert bob.delete(f\"/tasks/{task_id}\").status_code == 404\n\nstill_owned = alice.get(f\"/tasks/{task_id}\")\nassert still_owned.status_code == 200\nassert still_owned.json()[\"title\"] == \"Private task\""}
        />

        <MethodGrid
          rows={[
            [<>anonymous → GET /tasks</>, "401: нет действующей session"],
            [<>Alice → Alice task</>, "200: ресурс принадлежит current user"],
            [<>Bob → Alice task</>, "404: ресурс отсутствует в области Bob"],
            [<>Bob PATCH → Alice task</>, "404 и данные не изменены"],
            [<>Bob DELETE → Alice task</>, "404 и строка остаётся в базе"],
          ]}
        />

        <TerminalDemo
          title="authorization regression suite"
          lines={[
            { cmd: "pytest tests/test_task_ownership.py -q" },
            { out: "anonymous list rejected PASSED" },
            { out: "owner reads task PASSED" },
            { out: "foreign read hidden PASSED" },
            { out: "foreign update blocked PASSED" },
            { out: "foreign delete blocked PASSED" },
            { out: "owner data unchanged PASSED" },
            { out: "6 passed" },
          ]}
        />

        <Callout tone="info">
          {"После запрещённого PATCH обязательно проверьте состояние задачи владельцем. Один status code не доказывает отсутствие побочного изменения."}
        </Callout>

        <div className="lesson-practice-steps">
          <h3>{"Проверить create"}</h3>
          <p>
            {"Alice создаёт задачу без user_id в body. В response и базе owner равен Alice."}
          </p>
          <h3>{"Проверить collection scope"}</h3>
          <p>
            {"После создания задач Alice и Bob каждый GET /tasks возвращает только собственные строки."}
          </p>
          <h3>{"Проверить object scope"}</h3>
          <p>
            {"Read, PATCH и DELETE чужого id возвращают 404. Затем владелец подтверждает, что ресурс не изменился."}
          </p>
        </div>

        <MethodGrid
          rows={[
            [<>create without user_id</>, "сервер назначает current_user.id"],
            [<>list own tasks</>, "WHERE user_id ограничивает коллекцию"],
            [<>get foreign task</>, "404 без раскрытия существования"],
            [<>patch foreign task</>, "404 и отсутствие изменения"],
            [<>delete foreign task</>, "404 и строка остаётся в базе"],
          ]}
        />

        <CodeBlock
          caption="минимальный security regression checklist"
          code={"[ ] anonymous request → 401\n[ ] owner request → success\n[ ] foreign read → 404\n[ ] foreign patch → 404 + unchanged row\n[ ] foreign delete → 404 + existing row\n[ ] request body cannot assign user_id"}
        />

        <Callout>
          {"Тест считается сильным, когда проверяет наблюдаемый результат и отсутствие запрещённого побочного эффекта, а не только одну цифру status_code."}
        </Callout>


        <TerminalDemo
          title="полный session + ownership flow"
          lines={[
            { cmd: "Alice POST /auth/session/login" },
            { out: "200 · cookie A" },
            { cmd: "Bob POST /auth/session/login" },
            { out: "200 · cookie B" },
            { cmd: "Alice POST /tasks" },
            { out: "201 · task.user_id = Alice.id" },
            { cmd: "Bob GET /tasks/{task_id}" },
            { out: "404 · foreign resource hidden" },
            { cmd: "Alice GET /tasks/{task_id}" },
            { out: "200 · owner receives task" },
          ]}
        />

        <RecallCard
          question="Как проследить решение о доступе от HTTP до SQL?"
          hint="Начните с Cookie и закончите условием WHERE."
          answer={
            <p>
              {"Cookie даёт raw session token; dependency находит активную session и User; endpoint передаёт current_user.id в scoped query; база возвращает только ресурс этого владельца."}
            </p>
          }
        />

        <Callout tone="info">
          {"Эта трассировка является итоговой моделью блока. JWT в следующем блоке изменит способ предъявления authentication data, но ownership query останется тем же."}
        </Callout>

      </Section>

      <Section number="08" title="Контрольная точка блока 18">
        <Lead>
          {"Блок завершает stateful authentication flow: браузер хранит opaque token, сервер проверяет session, CurrentUser определяет личность, а ownership ограничивает доступ к строкам. Тесты подтверждают lifecycle и изоляцию пользователей."}
        </Lead>

        <div className="lesson-check-group">
          <QuizCard
            question="Откуда берётся user_id новой задачи?"
            options={["из CurrentUser", "из request body", "из title"]}
            correctIndex={0}
            explanation="Владелец назначается сервером после проверки session."
          />
          <QuizCard
            question="Как получить список личных задач?"
            options={["добавить WHERE Task.user_id == current_user.id", "загрузить всё и довериться frontend", "читать user_id из cookie JSON"]}
            correctIndex={0}
            explanation="Authorization scope применяется на уровне запроса к базе."
          />
          <QuizCard
            question="Что вернуть для чужого task_id?"
            options={["404 без подтверждения существования", "200 с пустым owner", "500"]}
            correctIndex={0}
            explanation="Ресурс отсутствует в доступной пользователю области."
          />
          <QuizCard
            question="Что доказывает тест после запрещённого PATCH?"
            options={["чужая задача осталась неизменной", "cookie стала Secure", "пользователь удалён"]}
            correctIndex={0}
            explanation="Негативный сценарий проверяет отсутствие побочного эффекта."
          />
        </div>

        <KeyTakeaways
          points={[
            <>{"Authentication определяет пользователя, authorization — допустимую операцию."}</>,
            <><code>{"Task.user_id"}</code>{" хранит владельца как foreign key."}</>,
            <>{"user_id не принимается из TaskCreate и назначается сервером."}</>,
            <>{"Коллекции ограничиваются владельцем непосредственно в WHERE."}</>,
            <>{"Один объект ищется по task_id и current_user.id одновременно."}</>,
            <>{"Missing и foreign resource получают одинаковый 404."}</>,
            <>{"Тесты двух клиентов доказывают изоляцию и отсутствие побочных изменений."}</>,
          ]}
        />

        <PracticeCta text="Добавьте Task.user_id, миграцию и ownership scope во все CRUD endpoint. Напишите тестовую матрицу для anonymous, owner и foreign user; после запрещённых PATCH и DELETE подтвердите, что задача владельца не изменилась." />
      </Section>
    </RichLesson>
  );
}
