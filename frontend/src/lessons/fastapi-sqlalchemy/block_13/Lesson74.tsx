import { Cloud, Layers } from "lucide-react";
import { BugHunt, Callout, CodeBlock, CodeSequence, CompareSolutions, KeyTakeaways, Lead, MatchPairs, PracticeCta, QuizCard, RecallCard, RichHero, RichLesson, Section, StepThrough } from "../../shared";
const BLOCK_TITLE = "Этап 4 · Блок 13 · FastAPI как цельное приложение";

export function Lesson74({ module }: { module?: string }) {
  return (
    <RichLesson>
      <RichHero
        variant="project"
        chip={module ?? BLOCK_TITLE}
        title={"Middleware и CORS"}
        intro={"Добавим поведение вокруг всех requests: измерим время, поставим общий response header и разрешим локальному браузерному frontend обращаться к API через точную CORS-конфигурацию."}
        tags={[
          { icon: <Layers size={14} />, label: "до и после endpoint" },
          { icon: <Cloud size={14} />, label: "origin и CORS" },
        ]}
      />

      <Section number="01" title={"Middleware окружает обработку request"}>
        <Lead>
          {"Некоторые действия нужны почти каждому endpoint: измерить время, добавить общий header или записать request в лог. Копировать эти строки в каждый handler неудобно."}
        </Lead>

        <div className="lesson-practice-steps">
          <h3>{"До endpoint"}</h3>
          <p>
            {"Middleware получает Request и может выполнить подготовку."}
          </p>

          <h3>{"call_next"}</h3>
          <p>
            {"Передаёт request дальше по цепочке к route."}
          </p>

          <h3>{"После endpoint"}</h3>
          <p>
            {"Получает готовый Response и может изменить metadata."}
          </p>

          <h3>{"Общий охват"}</h3>
          <p>
            {"Один middleware применяется ко многим routes."}
          </p>

        </div>

        <CodeBlock
          caption={"схема"}
          code={
            "client\n" +
            "→ middleware before\n" +
            "→ dependencies and endpoint\n" +
            "→ middleware after\n" +
            "→ client"
          }
        />

        <CodeBlock
          caption={"минимальный middleware"}
          code={
            "from fastapi import Request\n" +
            "\n" +
            "@app.middleware(\"http\")\n" +
            "async def add_common_header(\n" +
            "    request: Request,\n" +
            "    call_next,\n" +
            "):\n" +
            "    response = await call_next(request)\n" +
            "    response.headers[\"X-App-Name\"] = \"StudyHub\"\n" +
            "    return response"
          }
        />

        <MatchPairs
          prompt={"Соедините участок и действие."}
          leftTitle={"Слева"}
          rightTitle={"Справа"}
          pairs={[
            { left: "before call_next", right: "прочитать request и начать таймер" },
            { left: "call_next(request)", right: "передать request дальше" },
            { left: "after call_next", right: "получить и изменить response" },
            { left: "return response", right: "отправить итог клиенту" },
          ]}
          explanation={"Middleware имеет симметричную часть до и после обработки."}
        />

        <Callout tone="info">
          {"Endpoints курса остаются обычными def. Функция decorator middleware в этом API использует async/await из-за интерфейса call_next; подробная асинхронность изучается позже."}
        </Callout>
      </Section>

      <Section number="02" title={"Измеряем время ответа"}>
        <Lead>
          {"perf_counter подходит для измерения коротких интервалов. Значение фиксируется до call_next, после response вычисляется разница и добавляется custom header."}
        </Lead>

        <div className="lesson-practice-steps">
          <h3>{"Start"}</h3>
          <p>
            {"Сохраняется перед передачей request."}
          </p>

          <h3>{"Await call_next"}</h3>
          <p>
            {"Включает route, validation, dependencies и handler ниже по цепочке."}
          </p>

          <h3>{"Elapsed"}</h3>
          <p>
            {"Разница вычисляется после получения response."}
          </p>

          <h3>{"Header"}</h3>
          <p>
            {"X-Process-Time помогает увидеть результат в Postman."}
          </p>

        </div>

        <CodeBlock
          caption={"timing middleware"}
          code={
            "from time import perf_counter\n" +
            "from fastapi import Request\n" +
            "\n" +
            "@app.middleware(\"http\")\n" +
            "async def add_process_time(\n" +
            "    request: Request,\n" +
            "    call_next,\n" +
            "):\n" +
            "    started_at = perf_counter()\n" +
            "\n" +
            "    response = await call_next(request)\n" +
            "\n" +
            "    elapsed = perf_counter() - started_at\n" +
            "    response.headers[\"X-Process-Time\"] = f\"{elapsed:.6f}\"\n" +
            "\n" +
            "    return response"
          }
        />

        <StepThrough
          code={
            "started_at = perf_counter()\n" +
            "response = await call_next(request)\n" +
            "elapsed = perf_counter() - started_at\n" +
            "response.headers[\"X-Process-Time\"] = ...\n" +
            "return response"
          }
          steps={[
            {
              line: 0,
              note: "Таймер начинается до endpoint.",
              vars: { "started_at": "number" },
            },
            {
              line: 1,
              note: "Request проходит остальную цепочку.",
              vars: { "call_next": "awaited" },
            },
            {
              line: 2,
              note: "После response вычисляется интервал.",
              vars: { "elapsed": "seconds" },
            },
            {
              line: 3,
              note: "Response получает header.",
              vars: { "header": "X-Process-Time" },
            },
            {
              line: 4,
              note: "Итог возвращается клиенту.",
              vars: { "response": "sent" },
            },
          ]}
        />

        <Callout tone="info">
          {"Это учебное измерение, а не полноценная observability. Оно не заменяет structured logs, metrics и tracing."}
        </Callout>
      </Section>

      <Section number="03" title={"Общий header и request id"}>
        <Lead>
          {"Middleware может создать request id, добавить его к response и использовать в логах. Это помогает связать client error и серверную запись."}
        </Lead>

        <div className="lesson-practice-steps">
          <h3>{"Генерация"}</h3>
          <p>
            {"UUID создаётся в начале request."}
          </p>

          <h3>{"Request state"}</h3>
          <p>
            {"Значение можно положить в request.state для кода ниже."}
          </p>

          <h3>{"Response header"}</h3>
          <p>
            {"Клиент получает X-Request-ID."}
          </p>

          <h3>{"Не безопасность"}</h3>
          <p>
            {"Случайный id не является access token."}
          </p>

        </div>

        <CodeBlock
          caption={"request id"}
          code={
            "from uuid import uuid4\n" +
            "\n" +
            "@app.middleware(\"http\")\n" +
            "async def add_request_id(\n" +
            "    request: Request,\n" +
            "    call_next,\n" +
            "):\n" +
            "    request_id = str(uuid4())\n" +
            "    request.state.request_id = request_id\n" +
            "\n" +
            "    response = await call_next(request)\n" +
            "    response.headers[\"X-Request-ID\"] = request_id\n" +
            "\n" +
            "    return response"
          }
        />

        <CodeBlock
          caption={"использование"}
          code={
            "@router.get(\"/info\")\n" +
            "def get_info(request: Request):\n" +
            "    return {\n" +
            "        \"request_id\": request.state.request_id,\n" +
            "    }"
          }
        />

        <RecallCard
          question={"Зачем request id возвращать в response?"}
          answer={
            <p>
              {"Клиент может сообщить идентификатор, а разработчик найти связанные серверные logs для конкретного request."}
            </p>
          }
        />

        <Callout tone="info">
          {"Если browser frontend должен читать custom response header, его понадобится добавить в CORS expose_headers."}
        </Callout>
      </Section>

      <Section number="04" title={"Что не помещать в middleware"}>
        <Lead>
          {"Middleware работает вокруг большого числа routes, поэтому скрытая предметная логика быстро становится опасной. CRUD задач, проверка конкретной schema и выбор task status должны оставаться ниже."}
        </Lead>

        <div className="lesson-practice-steps">
          <h3>{"Подходит"}</h3>
          <p>
            {"Общее timing, request id, logging, CORS и единая техническая metadata."}
          </p>

          <h3>{"Не подходит"}</h3>
          <p>
            {"Создание Task, вычисление priority и изменение storage."}
          </p>

          <h3>{"Осторожно"}</h3>
          <p>
            {"Глобальный except в middleware может скрыть traceback и разные error handlers."}
          </p>

          <h3>{"Цена"}</h3>
          <p>
            {"Каждый middleware участвует во многих requests."}
          </p>

        </div>

        <CodeBlock
          caption={"опасный вариант"}
          code={
            "@app.middleware(\"http\")\n" +
            "async def task_rules(request, call_next):\n" +
            "    if request.url.path.startswith(\"/tasks\"):\n" +
            "        # вручную читать JSON\n" +
            "        # проверять title\n" +
            "        # изменять storage\n" +
            "        ...\n" +
            "    return await call_next(request)"
          }
        />

        <CodeBlock
          caption={"правильная граница"}
          code={
            "middleware: timing + request id\n" +
            "router: HTTP contract\n" +
            "schema: validation\n" +
            "crud/service: task rules\n" +
            "storage: state"
          }
        />

        <CompareSolutions
          question={"Где проверять уникальность title?"}
          left={{
            title: "Middleware",
            code: "перехватывать все /tasks requests",
            note: "Скрывает правило и вручную разбирает body.",
          }}
          right={{
            title: "CRUD/service",
            code: "check before creating task",
            note: "Правило вызывается только в нужной operation.",
          }}
          preferred={"right"}
          explanation={"Middleware не заменяет предметный слой."}
        />

        <Callout tone="info">
          {"Общее техническое поведение размещается глобально, предметное — рядом с предметной областью."}
        </Callout>
      </Section>

      <Section number="05" title={"Origin — protocol, host и port"}>
        <Lead>
          {"Браузер сравнивает origin frontend и backend. Даже localhost с разными ports считается разными origins, поэтому JavaScript-request может потребовать разрешение CORS."}
        </Lead>

        <div className="lesson-practice-steps">
          <h3>{"Protocol"}</h3>
          <p>
            {"http и https создают разные origins."}
          </p>

          <h3>{"Host"}</h3>
          <p>
            {"localhost и 127.0.0.1 считаются разными host names."}
          </p>

          <h3>{"Port"}</h3>
          <p>
            {"5173 и 8000 создают разные origins."}
          </p>

          <h3>{"Browser policy"}</h3>
          <p>
            {"CORS в первую очередь ограничивает JavaScript в браузере, а не Postman."}
          </p>

        </div>

        <CodeBlock
          caption={"локальная схема"}
          code={
            "frontend: http://localhost:5173\n" +
            "backend:  http://127.0.0.1:8000\n" +
            "\n" +
            "protocol/host/port differ\n" +
            "→ cross-origin browser request"
          }
        />

        <CodeBlock
          caption={"одинаковый origin"}
          code={
            "http://localhost:5173/page\n" +
            "http://localhost:5173/api\n" +
            "→ same protocol + host + port"
          }
        />

        <MatchPairs
          prompt={"Сравните origins."}
          leftTitle={"Пара адресов"}
          rightTitle={"Результат"}
          pairs={[
            { left: "http://localhost:5173 и http://localhost:8000", right: "different: port" },
            { left: "http://localhost:5173 и https://localhost:5173", right: "different: protocol" },
            { left: "http://localhost:5173/a и http://localhost:5173/b", right: "same origin" },
            { left: "http://localhost и http://127.0.0.1", right: "different: host" },
          ]}
          explanation={"Origin определяется protocol, host и port, но не path."}
        />

        <Callout tone="info">
          {"Postman может успешно вызвать API, пока browser frontend получает CORS error. Это не противоречие: ограничения применяет браузер."}
        </Callout>
      </Section>

      <Section number="06" title={"CORSMiddleware разрешает точные origins"}>
        <Lead>
          {"FastAPI подключает готовый CORSMiddleware. Для локального frontend создаётся список допустимых origins; methods, headers и credentials задаются явно."}
        </Lead>

        <div className="lesson-practice-steps">
          <h3>{"allow_origins"}</h3>
          <p>
            {"Какие browser origins могут обращаться."}
          </p>

          <h3>{"allow_methods"}</h3>
          <p>
            {"Какие methods разрешены cross-origin."}
          </p>

          <h3>{"allow_headers"}</h3>
          <p>
            {"Какие request headers может отправить frontend."}
          </p>

          <h3>{"allow_credentials"}</h3>
          <p>
            {"Разрешает cookies и authorization credentials."}
          </p>

        </div>

        <CodeBlock
          caption={"конфигурация"}
          code={
            "from fastapi.middleware.cors import CORSMiddleware\n" +
            "\n" +
            "origins = [\n" +
            "    \"http://localhost:5173\",\n" +
            "    \"http://127.0.0.1:5173\",\n" +
            "]\n" +
            "\n" +
            "app.add_middleware(\n" +
            "    CORSMiddleware,\n" +
            "    allow_origins=origins,\n" +
            "    allow_credentials=True,\n" +
            "    allow_methods=[\n" +
            "        \"GET\",\n" +
            "        \"POST\",\n" +
            "        \"PUT\",\n" +
            "        \"PATCH\",\n" +
            "        \"DELETE\",\n" +
            "        \"OPTIONS\",\n" +
            "    ],\n" +
            "    allow_headers=[\n" +
            "        \"Content-Type\",\n" +
            "        \"X-Client-Version\",\n" +
            "    ],\n" +
            "    expose_headers=[\n" +
            "        \"X-Request-ID\",\n" +
            "        \"X-Process-Time\",\n" +
            "    ],\n" +
            ")"
          }
        />

        <BugHunt
          code={
            "app.add_middleware(\n" +
            "    CORSMiddleware,\n" +
            "    allow_origins=[\"*\"],\n" +
            "    allow_credentials=True,\n" +
            "    allow_methods=[\"*\"],\n" +
            "    allow_headers=[\"*\"],\n" +
            ")"
          }
          question={"Почему настройка не подходит для cookie-based browser requests?"}
          options={[
            "Credentials требуют явных разрешённых origins/methods/headers",
            "CORS не поддерживает GET",
            "FastAPI запрещает middleware",
          ]}
          correctIndex={0}
          explanation={"Wildcard не является универсальной настройкой при credentials."}
          fix={"app.add_middleware(\n    CORSMiddleware,\n    allow_origins=[\"http://localhost:5173\"],\n    allow_credentials=True,\n    allow_methods=[\"GET\", \"POST\", \"OPTIONS\"],\n    allow_headers=[\"Content-Type\", \"X-Client-Version\"],\n)"}
        />

        <Callout tone="info">
          {"При allow_credentials=True origins, methods и headers должны быть указаны явно, а не универсальным [\"*\"]."}
        </Callout>
      </Section>

      <Section number="07" title={"Preflight OPTIONS проверяет разрешение заранее"}>
        <Lead>
          {"Перед некоторыми cross-origin requests браузер отправляет OPTIONS с Origin и Access-Control-Request-Method. CORSMiddleware отвечает, разрешено ли настоящее обращение."}
        </Lead>

        <div className="lesson-practice-steps">
          <h3>{"Preflight"}</h3>
          <p>
            {"Предварительный вопрос браузера к backend."}
          </p>

          <h3>{"OPTIONS"}</h3>
          <p>
            {"Method служебного request."}
          </p>

          <h3>{"CORS headers"}</h3>
          <p>
            {"Response сообщает разрешённый origin, methods и headers."}
          </p>

          <h3>{"Endpoint обычно не вызывается"}</h3>
          <p>
            {"Middleware обрабатывает preflight до предметной operation."}
          </p>

        </div>

        <CodeBlock
          caption={"упрощённый preflight"}
          code={
            "OPTIONS /tasks HTTP/1.1\n" +
            "Origin: http://localhost:5173\n" +
            "Access-Control-Request-Method: POST\n" +
            "Access-Control-Request-Headers: content-type,x-client-version"
          }
        />

        <CodeBlock
          caption={"после разрешения"}
          code={
            "POST /tasks HTTP/1.1\n" +
            "Origin: http://localhost:5173\n" +
            "Content-Type: application/json\n" +
            "X-Client-Version: 1.4.0"
          }
        />

        <CodeSequence
          title={"Browser cross-origin flow"}
          prompt={"Расположите этапы."}
          pieces={[
            { id: "frontend", code: "JavaScript готовит POST" },
            { id: "preflight", code: "browser отправляет OPTIONS" },
            { id: "cors", code: "CORSMiddleware проверяет origin/method/headers" },
            { id: "actual", code: "browser отправляет POST" },
            { id: "endpoint", code: "FastAPI выполняет operation" },
          ]}
          correctOrder={[
            "frontend",
            "preflight",
            "cors",
            "actual",
            "endpoint",
          ]}
          explanation={"Preflight может завершить взаимодействие раньше, если origin не разрешён."}
        />

        <Callout tone="info">
          {"CORS не проверяет пользователя и не заменяет authentication. Он сообщает браузеру, разрешено ли frontend-коду читать cross-origin response."}
        </Callout>
      </Section>

      <Section number="08" title={"Практика: local frontend и контрольная точка блока"}>
        <Lead>
          {"Закройте блок общей конфигурацией StudyHub: request id и timing применяются ко всем requests, CORS разрешает только локальный frontend, headers доступны браузеру."}
        </Lead>

        <div className="lesson-practice-steps">
          <h3>{"Шаг 1"}</h3>
          <p>
            {"Добавьте timing middleware и X-Process-Time."}
          </p>

          <h3>{"Шаг 2"}</h3>
          <p>
            {"Добавьте request id и X-Request-ID."}
          </p>

          <h3>{"Шаг 3"}</h3>
          <p>
            {"Создайте список frontend_origins в Settings."}
          </p>

          <h3>{"Шаг 4"}</h3>
          <p>
            {"Подключите CORSMiddleware с явными значениями."}
          </p>

          <h3>{"Шаг 5"}</h3>
          <p>
            {"Проверьте Postman и browser fetch."}
          </p>

          <h3>{"Шаг 6"}</h3>
          <p>
            {"Убедитесь, что CRUD остаётся вне middleware."}
          </p>

        </div>

        <CodeBlock
          caption={"финальный путь"}
          code={
            "browser frontend\n" +
            "→ CORS preflight when needed\n" +
            "→ request-id middleware before\n" +
            "→ timing middleware before\n" +
            "→ route + validation + dependencies\n" +
            "→ endpoint + CRUD\n" +
            "→ middleware after\n" +
            "→ CORS response headers\n" +
            "→ browser reads allowed response"
          }
        />

        <Callout tone="info">
          {"Результат блока 13: FastAPI-проект имеет объяснимый request pipeline, dependencies, settings, headers/cookies и общее middleware-поведение."}
        </Callout>

        <div className="lesson-check-group">
          <QuizCard
            question={"Что делает call_next?"}
            options={[
              "передаёт request дальше и возвращает response",
              "создаёт database session",
              "читает .env",
            ]}
            correctIndex={0}
            explanation={"Middleware окружает остальную цепочку."}
          />
          <QuizCard
            question={"Из чего состоит origin?"}
            options={[
              "protocol + host + port",
              "method + body",
              "status + header",
            ]}
            correctIndex={0}
            explanation={"Path не входит в origin."}
          />
          <QuizCard
            question={"Кого обычно ограничивает CORS?"}
            options={[
              "JavaScript в браузере",
              "Postman всегда",
              "Python function",
            ]}
            correctIndex={0}
            explanation={"Browser применяет CORS policy."}
          />
          <QuizCard
            question={"Можно ли использовать wildcard с credentials как универсальную настройку?"}
            options={[
              "нет, нужны явные значения",
              "да всегда",
              "только для DELETE",
            ]}
            correctIndex={0}
            explanation={"Credentialed requests требуют точной конфигурации."}
          />
        </div>

        <KeyTakeaways
          points={[
            <>{"Middleware выполняет действия до и после endpoint."}</>,
            <>{"call_next передаёт request остальной цепочке."}</>,
            <>{"Timing и request id подходят для общего технического поведения."}</>,
            <>{"Предметный CRUD не помещается в middleware."}</>,
            <>{"Origin состоит из protocol, host и port."}</>,
            <>{"CORS важен для browser frontend на другом origin."}</>,
            <>{"CORSMiddleware задаёт allowed origins, methods и headers."}</>,
            <>{"Credentials требуют явной, а не wildcard-конфигурации."}</>,
          ]}
        />

        <PracticeCta
          text={"Добавьте X-Process-Time, X-Request-ID и точный CORSMiddleware для frontend на 5173, затем проверьте preflight и обычный request."}
        />
      </Section>

    </RichLesson>
  );
}
