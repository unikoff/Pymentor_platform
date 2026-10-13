import { FileText, ShieldCheck } from "lucide-react";
import { BranchExplorer, BugHunt, Callout, CodeBlock, CodeSequence, CompareSolutions, FillBlank, FlipCards, KeyTakeaways, Lead, MatchPairs, MethodGrid, PracticeCta, PredictOutput, QuizCard, RecallCard, RichHero, RichLesson, Section, TerminalDemo, TrueFalse, TypeCard, TypeCards } from "../../shared";
import { TheoryBridge } from "../../shared";
const BLOCK_TITLE = "Блок 18 · Cookie и серверные сессии";

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
      <TheoryBridge link={"В блоке 17 StudyHub научился регистрировать пользователя и проверять credentials. Теперь браузеру нужен безопасный способ сообщать о ранее выполненном входе в следующих запросах."} boundary={"Cookie — механизм хранения и автоматической отправки небольшого значения. Сама по себе cookie не доказывает личность и не является server-side session."} />

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
