import {
  BugHunt,
  Callout,
  CodeBlock,
  Diagram,
  DiagramArrow,
  DiagramExchange,
  DiagramFlow,
  DiagramNode,
  Lead,
  LinkedNotes,
  MatchPairs,
  MethodGrid,
  QuizCard,
  RichHero,
  RichLesson,
  Section,
  TrueFalse,
} from "../../shared";

export function Lesson47_1({ module }: { module?: string }) {
  return (
    <RichLesson>
      <RichHero
        chip={module ?? "Блок 10 · 47.1"}
        title="Swagger и проверка запуска"
        intro="После добавления GET /health в Planner должен отвечать GET /health. Сверим проект с README, найдём маршрут в OpenAPI, вызовем его из Swagger и Postman и отличим HTTP-ошибку от сбоя соединения."
        variant="project"
      />

      <Section number="00" title="Опора A: готовый сервер и CLI">
        <Lead>
          После добавления GET /health в проекте должны быть FastAPI и GET /health. Uvicorn запускает сервер, а прежний CLI остаётся отдельной точкой входа. Сначала сверим это с текущим проектом и README.
        </Lead>
        <LinkedNotes
          variant="connected"
          items={[
            {
              title: "Опора A",
              description: "Используем готовые FastAPI, GET /health и команду Uvicorn. CLI запускается отдельно; Echo остаётся отдельным запросом Postman.",
            },
            {
              title: "Что проверим",
              description: "Найдём зарегистрированные маршруты и выясним, почему запрос не получил ожидаемый ответ.",
            },
            {
              title: "Результат B",
              description: "Проверим health через Swagger и Postman, экспортируем Local-настройки, различим 404, 405 и сбой соединения, отдельно запустим CLI.",
            },
          ]}
        />
        <p>
          Продолжаем в том же Planner. Сейчас API должен отвечать только на health-запрос: маршрутов задач и статистики ещё нет. Перед проверкой смотрим на реальные файлы и запуск, а не считаем состояние из плана уже выполненным. В подключении API к PlannerService к этому API подключим чтение задач и статистики.
        </p>
      </Section>

      <Section number="01" title="Проверим запуск и адрес сервера">
        <Lead>
          Найдём команду запуска в README и выполним её из корня Planner. Uvicorn загружает объект FastAPI из `app.api` и принимает запросы по указанному адресу.
        </Lead>
        <CodeBlock
          code={`python -m uvicorn app.api:app --reload
http://127.0.0.1:8000/health`}
        />
        <p>
          Разберём адрес по частям: `http`: схема, `127.0.0.1`: этот компьютер, `8000`: порт, `/health`: путь маршрута. Используем host и порт из README, а запрос отправляем из браузера или другого окна: терминал с Uvicorn занят сервером.
        </p>
        <p>
          Ответ `/health` подтверждает, что приложение обработало запрос. Он не проверяет JSON-хранилище, задачи или CLI. Поэтому сначала сверяем адрес и ответ, а вывод ограничиваем проверкой запуска.
        </p>
        <Callout tone="info">
          Используем уже существующую команду. Для этой проверки не переустанавливаем пакеты, не создаём новый `app/api.py` и не копируем Planner.
        </Callout>
      </Section>

      <Section number="02" title="OpenAPI перечисляет зарегистрированные операции">
        <Lead>
          FastAPI собирает OpenAPI по маршрутам, зарегистрированным в приложении. В `/openapi.json` перечислены пути и HTTP-методы.
        </Lead>
        <p>
          После добавления GET /health ожидается `GET /health`. FastAPI строит OpenAPI из маршрутов, зарегистрированных в загруженном приложении: одного файла или имени функции недостаточно. `/tasks` и `/stats` появятся позже, при подключении API к PlannerService.
        </p>
        <p>
          В JSON найди `paths`, затем `/health` и вложенный `get`: это путь и HTTP-метод. Swagger показывает ту же пару как `GET /health`. Если код уже изменён, но список старый, проверь, применился ли reload, и обнови страницу.
        </p>
        <CodeBlock
          code={`"paths": {
  "/health": {
    "get": {}
  }
}`}
        />
        <MethodGrid
          rows={[
            ["/openapi.json", "Структурированные данные о зарегистрированных путях и методах"],
            ["/docs", "Страница Swagger UI, которая читает OpenAPI и даёт отправить запрос"],
            ["GET /health", "Единственная операция Planner API на этом этапе"],
          ]}
        />
        <p>
          В первом задании сравним список из `/openapi.json` с `/docs` и `app/api.py`. Если операции нет в OpenAPI, проверим код и запущенный процесс. Запись в плане не означает, что маршрут уже доступен.
        </p>
        <QuizCard
          question="Что подтвердит, что приложение зарегистрировало GET /health?"
          options={[
            "В OpenAPI есть путь /health с методом get",
            "В проекте существует файл app/api.py",
            "В будущем плане упоминается GET /tasks",
          ]}
          correctIndex={0}
          explanation="OpenAPI отражает регистрацию текущего приложения. Файл может существовать без нужного маршрута, а план описывает будущий результат."
        />
      </Section>

      <Section number="03" title="Swagger UI отправляет настоящий запрос">
        <Lead>
          `/docs` открывает Swagger UI, который показывает OpenAPI. Раскроем `GET /health`, нажмём Try it out и Execute. Затем отдельно запишем HTTP-статус и JSON-тело.
        </Lead>
        <p>
          Swagger UI работает как HTTP-клиент в браузере. Кнопка Execute вызывает уже зарегистрированный маршрут. Она не меняет Python-код и не создаёт endpoint.
        </p>
        <Diagram caption="Сначала читаем описание, затем вызываем существующий маршрут" orientation="vertical">
          <DiagramFlow label="Как описание попадает в Swagger UI" orientation="vertical">
            <DiagramNode title="Приложение FastAPI">
              <p>В нём зарегистрирован GET /health</p>
            </DiagramNode>
            <DiagramArrow label="формирует описание" />
            <DiagramNode title="OpenAPI">
              <p>Данные доступны по /openapi.json</p>
            </DiagramNode>
            <DiagramArrow label="показывается на странице" />
            <DiagramNode title="Swagger UI">
              <p>Интерфейс доступен по /docs</p>
            </DiagramNode>
          </DiagramFlow>
          <DiagramFlow label="Как клиент проверяет health" orientation="vertical">
            <DiagramNode title="Клиент">
              <p>Swagger UI или Postman</p>
            </DiagramNode>
            <DiagramExchange forward="GET /health" reverse="200 и JSON-тело" />
            <DiagramNode title="Planner API">
              <p>Обрабатывает зарегистрированный маршрут</p>
            </DiagramNode>
          </DiagramFlow>
        </Diagram>
        <p>
          Сначала приложение формирует описание маршрута, затем Swagger показывает его. `Try it out` включает отправку, а именно `Execute` отправляет запрос. В фактическом ответе сверяем статус `200` и тело <code>&#123;&quot;status&quot;:&quot;ok&quot;&#125;</code>: это два разных поля. Они подтверждают только ответ health, не чтение задач.
        </p>
        <p>
          В задании 2 повторим вызов и проверим оба результата. Браузер может показать JSON без заметного статуса, а Swagger показывает статус рядом с телом. `200` и <code>{'{"status":"ok"}'}</code> это два разных наблюдения.
        </p>
        <MatchPairs
          prompt="Соединим адрес с тем, что увидим при открытии."
          leftTitle="Адрес"
          rightTitle="Назначение"
          pairs={[
            { left: "/docs", right: "Интерфейс Swagger UI для отправки запросов" },
            { left: "/openapi.json", right: "Структурированное описание операций" },
            { left: "/health", right: "Зарегистрированный маршрут проверки приложения" },
          ]}
          explanation="/docs показывает интерфейс, /openapi.json описывает маршруты, а /health обрабатывает запрос."
        />
      </Section>

      <Section number="04" title="Сохраним локальную проверку в Postman">
        <Lead>
          Echo отвечает на другом сервере и не подтверждает работу Planner. Для Planner создадим отдельные collection и Local environment. Сохранённые Echo-файлы оставим на месте.
        </Lead>
        <p>
          В `Local` зададим `base_url`: протокол, адрес и порт из команды в README, без пути `/health`. В collection сохраним <code>GET {'{{base_url}}'}/health</code>. Environment подставит адрес, а collection сохранит запрос для повторного запуска.
        </p>
        <p>
          `127.0.0.1` обращается к этому же компьютеру. Поэтому локальный запрос отправляем через Postman Desktop Agent. Cloud Agent работает в другой среде, где этот адрес указывает на сам агент.
        </p>
        <Callout tone="warn">
          Если Cloud Agent не открывает локальный адрес, выбери Desktop Agent. Проверь, что активен `Local`, а не `Echo`.
        </Callout>
        <p>
          В задании 3 отправим <code>GET &#123;&#123;base_url&#125;&#125;/health</code> и сравним ответ с результатом Swagger. В `base_url` не добавляем `/health` или завершающий `/`, чтобы путь не продублировался. Затем экспортируем collection и Local в `postman/planner-api.postman_collection.json` и `postman/local.postman_environment.json`; Echo остаётся отдельно.
        </p>
      </Section>

      <Section number="05" title="Увидим, как путь попадает в OpenAPI">
        <Lead>
          OpenAPI описывает текущую регистрацию. Проверим эту связь на время и обязательно вернём исходный маршрут.
        </Lead>
        <Diagram caption="Изменение декоратора меняет адрес операции, но не код её ответа" orientation="horizontal">
          <DiagramFlow label="Что меняется при временной пробе" orientation="horizontal">
            <DiagramNode title="Декоратор в app/api.py">
              <p>@app.get("/health")</p>
            </DiagramNode>
            <DiagramArrow label="FastAPI обновляет описание" />
            <DiagramNode title="OpenAPI и Swagger">
              <p>Появляется зарегистрированный путь</p>
            </DiagramNode>
            <DiagramArrow label="клиент отправляет GET" />
            <DiagramNode title="Ответ маршрута">
              <p>Тело остаётся <code>{'{"status": "ok"}'}</code></p>
            </DiagramNode>
          </DiagramFlow>
        </Diagram>
        <p>
          Сначала предскажи результат для примера: `GET /ping` временно становится `GET /alive`. После применения изменения новый путь должен появиться в `/openapi.json` и `/docs`, а старый перестанет находить этот маршрут. Документацию вручную не редактируют: она отражает декоратор загруженного приложения.
        </p>
        <p>
          В обязательной пробе выбери свой временный уникальный путь, измени только строку в `@app.get(...)` файла `app/api.py` и сохрани. Дождись reload Uvicorn или перезапусти сервер прежней командой; обнови `/docs` и проверь новый GET через Swagger. Затем запроси старый `/health`: при работающем сервере ожидается `404`, потому что прежний путь больше не зарегистрирован.
        </p>
        <Callout tone="warn">
          Сразу верни декоратор точно к `@app.get("/health")`. Дождись reload, обнови Swagger и снова получи `200` с прежним JSON. Убедись, что временного пути больше нет. Пока исходный health не восстановлен, проверку не завершай.
        </Callout>
      </Section>

      <Section number="06" title="Разделим HTTP-ответ и сбой соединения">
        <Lead>
          Сначала проверим, получил ли клиент HTTP-ответ. Если получил, посмотрим на статус и найдём, что не совпало.
        </Lead>
        <MethodGrid
          rows={[
            [<code>404</code>, "Сервер работает, но path не зарегистрирован"],
            [<code>405</code>, "Path есть, но отправленный метод не поддержан"],
            [<code>Нет HTTP-ответа</code>, "Соединение не установлено: проверь сервер, host и порт"],
          ]}
        />
        <p>
          При работающем Uvicorn `GET /unknown` вернёт `404`: такого пути нет. `POST /health` вернёт `405`: путь есть, но метод не поддержан. После остановки Uvicorn HTTP-статуса не будет. Тогда проверь процесс, host и порт.
        </p>
        <p>
          В задании 4 будем проверять в таком порядке: сервер и адрес, метод и path, затем статус и body. Без HTTP-ответа ищем проблему соединения. При `404` проверяем path, при `405` метод.
        </p>
        <BugHunt
          code={`base_url: http://127.0.0.1:8000
path: /health
agent: Cloud Agent`}
          question="Cloud Agent сообщает об ошибке соединения. Что исправим первым делом?"
          options={[
            "Выберем Desktop Agent, оставив локальный адрес Planner",
            "Заменим path на /docs, чтобы получить статус 404",
            "Посчитаем отказ соединения ответом 405",
          ]}
          correctIndex={0}
          explanation="Cloud Agent не обращается к loopback компьютера. Для адреса 127.0.0.1 запрос отправит Desktop Agent, а правильный host и path останутся прежними."
          fix={`base_url: http://127.0.0.1:8000
path: /health
agent: Desktop Agent`}
        />
        <TrueFalse
          statement="Если GET /unknown вернул 404, клиент получил HTTP-ответ от работающего приложения."
          isTrue
          explanation="Верно: сервер ответил статусом, потому что path не зарегистрирован. При остановленном сервере HTTP-статуса не будет."
        />
      </Section>

      <Section number="07" title="Сохраним прежний запуск CLI">
        <Lead>
          Проверим, что импорт `app.main` не открывает меню, а прежний CLI запускается отдельно.
        </Lead>
        <p>
          При импорте Python выполняет код модуля. CLI запускают внутри условия <code>if __name__ == "__main__": main()</code>. При импорте имя равно `app.main`, поэтому условие пропускается. При прямом запуске имя равно `__main__`, и запускается CLI.
        </p>
        <CodeBlock
          code={`python -c "import app.main; print('import ok')"
python -m app.main`}
        />
        <p>
          Первая команда должна вывести `import ok` и завершиться. Вторая должна открыть прежний CLI. Если меню появляется уже при импорте, проверь, где вызывается `main()`. API и CLI остаются отдельными точками входа.
        </p>
        <Callout tone="info">
          В задании 5 после обеих проверок дополним README адресами `/docs`, `/openapi.json` и результатом health. Не указываем ещё не созданные `/tasks` и `/stats`.
        </Callout>
      </Section>

      <Section number="08" title="Что мы будем делать в практике">
        <Lead>
          В заданиях 1–5 проверим тот же сервер и сохраним наблюдаемые результаты.
        </Lead>
        <LinkedNotes
          variant="connected"
          items={[
            {
              title: "1. OpenAPI",
              description: "Сверим /docs, /openapi.json и app/api.py. Ожидаем только GET /health.",
            },
            {
              title: "2. Swagger",
              description: "Выполним GET /health и отдельно запишем статус и JSON-тело.",
            },
            {
              title: "3. Postman",
              description: "Сохраним GET /health в Planner API и Local, отправим через Desktop Agent и экспортируем оба файла.",
            },
            {
              title: "4. Диагностика",
              description: "Временно изменим path, увидим новый адрес и 404 по старому, восстановим /health; затем различим 404, 405 и сбой соединения.",
            },
            {
              title: "5. CLI и README",
              description: "Проверим импорт и CLI отдельно, затем запишем в README проверенные адреса.",
            },
          ]}
        />
        <p>
          Практический маршрут такой: найти операцию, выполнить её в Swagger, сравнить с Postman, проверить влияние декоратора и восстановить `/health`, затем разобрать ошибки и отдельно проверить CLI. Для пути важны оба наблюдения: новый адрес появился, исходный после возврата снова отвечает.
        </p>
        <p>
          Результат B: в том же Planner проверены `/health`, `/docs` и `/openapi.json`; запрос и `Local` экспортированы отдельно от Echo; CLI запускается прежним способом, а README содержит проверенные адреса. В подключении API к PlannerService этот API подключат к PlannerService и добавят чтение задач и статистики. Здесь данные и маршруты чтения не меняем.
        </p>
      </Section>
    </RichLesson>
  );
}
