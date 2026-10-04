import {
  Braces,
  CheckCircle2,
  Cloud,
  FileText,
  GitBranch,
  KeyRound,
  ListChecks,
  Terminal,
  Wrench,
} from "lucide-react";
import {
  Callout,
  BugHunt,
  CodeBlock,
  CodeSequence,
  CompareSolutions,
  FillBlank,
  KeyTakeaways,
  Lead,
  LinkedNotes,
  MatchPairs,
  PracticeCta,
  QuizCard,
  RecallCard,
  RichHero,
  RichLesson,
  Section,
  TrueFalse,
} from "../shared";
import postmanEchoInfographic from "./images/postman-echo-cycle.svg";
import fastapiUvicornInfographic from "./images/fastapi-uvicorn-health-flow.svg";
import lesson53ReadModelInfographic from "./images/lesson-53-shared-read-model.svg";
import lesson53ReadModelMobile from "./images/lesson-53-shared-read-model-mobile.svg";
import queryPipelineInfographic from "./images/query-filter-sort-limit.svg";
import lesson54PathSearchInfographic from "./images/lesson-54-path-search-flow.svg";
import lesson54PathSearchMobile from "./images/lesson-54-path-search-flow-mobile.svg";

const BLOCK_TITLE = "Месяц 3 · Блок 10 · Первый FastAPI";

// 51. Postman: отправляем запрос вручную
export function Lesson51({ module }: { module?: string }) {
  return (
    <RichLesson>
      <RichHero
        chip={module ?? BLOCK_TITLE}
        title={"51. Postman: отправляем запрос вручную"}
        intro={"В прошлом блоке мы описали договор Planner API. Теперь впервые отправим HTTP-сообщения через готовый клиент, изучим настоящие ответы и сохраним сценарии рядом с уже существующим проектом."}
        tags={[
          { icon: <Terminal size={14} />, label: "HTTP-клиент" },
          { icon: <Cloud size={14} />, label: "request → response" },
        ]}
      />
      <LinkedNotes variant="connected" items={[
        { title: "Прежняя опора", description: "В прошлом блоке мы описали request, response и договор Planner API." },
        { title: "Новый вопрос", description: "Как отправить сообщение настоящему серверу и проверить его ответ?" },
        { title: "Результат", description: "Отправим GET и POST в Echo, затем сохраним и восстановим сценарии рядом с Planner." },
      ]} />

      <Section number="00" title={"От контракта к настоящему запросу"}>
        <Lead>
          {"Мы уже умеем читать request и response и знаем, какой договор будет у Planner API. Но до сих пор мы только представляли обмен. Теперь соберём сообщение в Postman, отправим его серверу и разберём, что вернулось."}
        </Lead>
        <p>
          {"Собственного HTTP-сервера у Planner пока нет. Поэтому первый опыт проведём на Postman Echo. Это учебный сервер: он показывает сведения о полученном запросе, но не выполняет правила Planner и не хранит задачи."}
        </p>
        <CodeBlock
          caption={"путь одного сообщения"}
          code={"Postman собирает request\n→ Echo получает request\n→ Echo возвращает response\n→ Postman показывает результат"}
        />
        <p>
          {"В практике проверим два разных способа передать данные: GET с query-параметрами и POST с JSON в body. Затем сохраним оба request в collection и экспортируем их вместе с environment в папку существующего Planner."}
        </p>
        <RecallCard
          question={"Что станет новым по сравнению с прошлым блоком?"}
          answer={<p>{"Мы не только опишем запрос, но и отправим его по сети и получим ответ сервера."}</p>}
        />
      </Section>

      <Section number="01" title={"Postman отправляет, Echo отвечает"}>
        <Lead>
          {"Postman это HTTP-клиент. Он помогает вручную собрать сообщение и отправить его серверу. Echo играет другую роль: принимает сообщение и формирует ответ."}
        </Lead>
        <p>
          {"Это похоже на почтовое отделение и адресата. Postman заполняет и отправляет письмо, сервер его получает и отвечает. Сам клиент не решает, какое действие сервер выполнит с данными."}
        </p>
        <figure className="lesson-infographic">
          <img
            src={postmanEchoInfographic}
            alt="Postman отправляет HTTP-запрос серверу Echo. Echo возвращает HTTP-ответ в тот же Postman."
            width={1672}
            height={836}
            loading="lazy"
            decoding="async"
          />
          <figcaption>В этой проверке участвуют Postman и Echo. Сервер Planner ещё не запущен.</figcaption>
        </figure>
        <p>
          {"Разработчики используют такой клиент, чтобы проверить API отдельно от кнопок сайта. Если неверный запрос не работает даже в Postman, искать причину в интерфейсе ещё рано. Когда Planner API появится, мы сможем так же отдельно обращаться к его маршрутам."}
        </p>
        <MatchPairs
          prompt={"Соединим каждого участника с его ролью."}
          leftTitle={"Участник"}
          rightTitle={"Роль в обмене"}
          pairs={[
            { left: "Postman", right: "собирает и отправляет request" },
            { left: "Echo", right: "принимает request и возвращает response" },
            { left: "разработчик", right: "сравнивает фактический ответ с ожиданием" },
          ]}
          explanation={"У клиента, сервера и человека разные обязанности. Это помогает не приписывать Echo действия Planner."}
        />
        <CompareSolutions
          question={"Что доказывает успешный ответ Echo?"}
          left={{
            title: "Наблюдение", code: "Echo получил запрос и ответил",
            note: "Проверена связь с учебным сервером.",
          }}
          right={{
            title: "Слишком сильный вывод", code: "Planner создал задачу",
            note: "Запрос не отправлялся в Planner.",
          }}
          preferred={"left"}
          explanation={"Вывод должен относиться именно к серверу, который получил request."}
        />
      </Section>

      <Section number="02" title={"Сообщение до отправки"}>
        <Lead>
          {"В Postman поля окна соответствуют частям HTTP-сообщения. Пока не нажата Send, мы меняем только черновик. Сервер ещё ничего не получил."}
        </Lead>
        <LinkedNotes variant="connected" items={[
          { title: "Method и URL", description: "Зададим действие и адрес сервера с нужным path." },
          { title: "Params и Headers", description: "Добавим query к URL и служебные сведения о сообщении." },
          { title: "Body", description: "Передадим данные, если они нужны выбранной операции." },
          { title: "Send и Response", description: "Отправим request и изучим status, headers и body ответа." },
        ]} />
        <p>
          {"Названия вкладок могут немного меняться между версиями Postman, но роли частей остаются такими же. Params добавляет пары в query-часть URL. Headers хранит заголовки. Body относится к исходящему запросу, а response body появляется после ответа сервера."}
        </p>
        <CodeBlock
          caption={"одна рабочая область, два сообщения"}
          code={"REQUEST\nmethod + URL + query + headers + body\n                  ↓ Send\n                 сервер\n                  ↓\nRESPONSE\nstatus + headers + body"}
        />
        <p>
          {"Body во вкладке request содержит исходящие данные; body внутри response содержит ответ сервера. Первое мы отправляем, второе читаем после обмена."}
        </p>
        <TrueFalse
          statement={<>Изменение поля Params уже отправляет query на сервер.</>}
          isTrue={false}
          explanation={"Params обновляет черновик URL. Сообщение уйдёт только после Send."}
        />
      </Section>

      <Section number="03" title={"Первый обмен: GET к Echo"}>
        <Lead>
          {"Начнём с пустого GET. Он помогает увидеть сам цикл обмена, прежде чем добавлять параметры."}
        </Lead>
        <CodeBlock caption={"адрес учебного endpoint"} code={"GET https://postman-echo.com/get"} />
        <p>
          {"В этом адресе https обозначает защищённое соединение, postman-echo.com это host сервера, а /get это path внутри Echo. Вместе с методом GET path задаёт endpoint, то есть конкретную операцию учебного API."}
        </p>
        <p>
          {"После Send успешный ответ Echo обычно имеет status 200 и JSON в body. Например, поле args пока пустое, потому что мы не добавляли query."}
        </p>
        <CodeBlock
          caption={"упрощённый response"}
          code={'{\n  "args": {},\n  "url": "https://postman-echo.com/get"\n}'}
        />
        <p>
          {"Status показывает результат HTTP-обмена. Headers описывают ответ, например его формат. Body содержит возвращённые данные. Успешная связь с Echo ещё ничего не говорит о будущих маршрутах Planner."}
        </p>
        <BugHunt
          code={"https://postman-echo.invalid/get"}
          question={"Что произойдёт при ошибке в имени host?"}
          options={[
            "Echo обязательно вернёт status 404",
            "Клиент может не получить HTTP-ответ от нужного сервера",
            "Postman сам исправит адрес",
          ]}
          correctIndex={1}
          explanation={"Если имя сервера неверно, запрос может не дойти до HTTP endpoint. Тогда нет response, от которого можно было бы прочитать status."}
          fix={"Правильный адрес Echo: https://postman-echo.com/get. После исправления host повторим запрос."}
        />
        <p>
          {"Это отличается от status 404. В случае 404 сервер всё же ответил HTTP-сообщением. При ошибке соединения ответ мог вообще не прийти."}
        </p>
      </Section>

      <Section number="04" title={"Query настраивает GET, но не фильтрует данные Echo"}>
        <Lead>
          {"Query передаёт настройки в адресе. В Planner позже так можно будет попросить только открытые задачи или ограничить размер списка. Echo поможет проверить передачу, но не применит эти правила к Planner."}
        </Lead>
        <CodeBlock
          caption={"GET с двумя параметрами"}
          code={"GET https://postman-echo.com/get?is_done=false&limit=2"}
        />
        <p>
          {"Знак вопроса отделяет query от path. Знак & разделяет пары имя-значение. В Postman те же пары удобнее добавить во вкладке Params: is_done со значением false и limit со значением 2."}
        </p>
        <p>
          {"Рассмотрим упрощённую часть ответа. Echo отражает полученный текст. Значения false и 2 пришли как строки. Сервер Planner позднее сам решит, преобразовывать ли их в bool и int и как проверять."}
        </p>
        <CodeBlock
          caption={"Echo показывает полученные пары"}
          code={'{\n  "args": {\n    "is_done": "false",\n    "limit": "2"\n  }\n}'}
        />
        <FillBlank
          prompt={"В какую часть исходящего запроса Postman помещает пару limit=2 из Params?"}
          before={"Params → "}
          after={""}
          options={["в query URL", "в исходящий JSON body", "в HTTP headers"]}
          answer={"в query URL"}
          explanation={"Params формирует query исходящего URL. После отправки Echo отдельно отражает полученную пару в response.args."}
        />
        <CompareSolutions
          question={"Какой вывод верен после этого GET?"}
          left={{
            title: "Подтверждено", code: "Echo получил две пары query",
            note: "Их значения видны в args.",
          }}
          right={{
            title: "Не подтверждено", code: "Planner отфильтровал задачи",
            note: "Planner ещё не получал этот запрос.",
          }}
          preferred={"left"}
          explanation={"Echo возвращает сведения о request, а не применяет правила выборки Planner."}
        />
      </Section>

      <Section number="05" title={"POST передаёт JSON в body"}>
        <Lead>
          {"GET настраивает чтение. Для передачи полей новой задачи в договоре Planner используется POST с JSON body. Проверим форму такого сообщения на Echo."}
        </Lead>
        <CodeBlock
          caption={"request, который мы соберём"}
          code={'POST https://postman-echo.com/post\nContent-Type: application/json\n\n{\n  "title": "Изучить HTTP",\n  "priority": 4\n}'}
        />
        <p>
          {"В Postman зададим POST, затем откроем Body, выберем raw и формат JSON. Raw означает, что тело вводится как текст. Для JSON Postman выставляет Content-Type: application/json. Этот заголовок сообщает серверу, как разбирать body; второй такой же заголовок вручную не добавляем."}
        </p>
        <p>
          {"Имя поля \"priority\" записываем в кавычках, а числовое значение 4 указываем без них. Имя поля \"title\" и его текстовое значение тоже записываем в кавычках. Такое различие важно, когда Planner позже проверит входную модель."}
        </p>
        <CodeBlock
          caption={"где Echo отражает JSON"}
          code={'{\n  "json": {\n    "title": "Изучить HTTP",\n    "priority": 4\n  }\n}'}
        />
        <p>
          {"Echo вернул поля в своём response, но не создал Task и не сохранил файл Planner. Status 200 относится к Echo. При создании задачи собственный API будет иметь свой контракт и ожидаемый status."}
        </p>
        <BugHunt
          code={'{\n  "title": "Изучить HTTP",\n  "priority": "4"\n}'}
          question={"Что здесь отличается от согласованного примера Planner?"}
          options={[
            "priority передан строкой, а не числом",
            "JSON нельзя отправлять через POST",
            "В body нельзя передавать title",
          ]}
          correctIndex={0}
          explanation={"Кавычки превращают 4 в строку. Echo может отразить и такой JSON, но это не делает значение числом и не проверяет контракт Planner."}
          fix={'Правильная JSON-запись числа: "priority": 4.'}
        />
        <TrueFalse
          statement={<>Если Echo вернул status 200 на POST, задача уже сохранена в Planner.</>}
          isTrue={false}
          explanation={"Postman отправлял запрос на Echo. Только собственный Planner API сможет создать и сохранить задачу."}
        />
      </Section>

      <Section number="06" title={"Сверяем status, headers и body вместе"}>
        <Lead>
          {"Одна зелёная отметка не описывает весь результат. Чтобы понять response, вместе проверим статус, формат и сами поля."}
        </Lead>
        <LinkedNotes items={[
          { title: "Status", description: "Как сервер завершил HTTP-запрос." },
          { title: "Headers", description: "Какой формат и другие свойства у ответа." },
          { title: "Body", description: "Какие значения сервер действительно вернул." },
        ]} />
        <p>
          {"Например, status 200 может сочетаться с неожиданным body. Поэтому после GET найдём query в args, а после POST сравним поля внутри json. Мы оцениваем не только факт ответа, но и соответствие результата ожиданию."}
        </p>
        <CodeSequence
          title={"Порядок ручной проверки"}
          prompt={"Проследим шаги от отправки до вывода о результате."}
          pieces={[
            { id: "send", code: "отправляем request кнопкой Send" },
            { id: "status", code: "читаем status ответа" },
            { id: "headers", code: "проверяем формат в headers" },
            { id: "body", code: "сопоставляем поля body с ожиданием" },
            { id: "conclusion", code: "формулируем, что именно проверено" },
          ]}
          correctOrder={["send", "status", "headers", "body", "conclusion"]}
          explanation={"Сначала нужен ответ. После этого его status, headers и body дают разные части картины."}
          incorrectExplanation={"Сначала отправим request и получим response. Только затем проверим status, headers и body, а после сопоставим их с ожиданием."}
        />
        <p>
          {"Если сервер вернул 404, это полноценный HTTP response, который можно исследовать. Если Postman сообщает об ошибке DNS или соединения и status отсутствует, мы пока не знаем, что вернул сервер. Недоступность Echo не означает ошибку Planner."}
        </p>
        <QuizCard
          question={"GET получил status 200, но args.limit отсутствует. Какой вывод разумнее?"}
          options={[
            "HTTP-обмен успешен, но ожидаемый query не подтверждён",
            "Все параметры автоматически добавлены сервером",
            "Planner уже применил limit",
          ]}
          correctIndex={0}
          explanation={"Status подтверждает ответ, а наличие нужного значения проверяется отдельно в body."}
        />
      </Section>

      <Section number="07" title={"Сохранённые сценарии и окружение"}>
        <Lead>
          {"После ручной проверки полезно сохранить request так, чтобы открыть и повторить его позже. Для этого в Postman есть collection и environment."}
        </Lead>
        <p>
          {"Collection это набор сохранённых request. В ней останутся method, URL, Params и body. Environment это окружение с переменными, которые меняются вместе с целью запроса. Здесь оно хранит базовый адрес Echo."}
        </p>
        <p>
          {"Войти в аккаунт нужно для работы с collection и environment в workspace, то есть рабочем пространстве Postman. Lightweight API Client позволяет отправлять запросы без входа, но не даёт сохранить их в collection и работать с environment."}
        </p>
        <ol>
          <li>{"Сначала в боковой панели откроем Collections → + → Collection и зададим имя Planner HTTP Lab."}</li>
          <li>{"Создадим environment Echo через + в боковой панели → Environments либо через + рядом с селектором окружения. Добавим base_url=https://postman-echo.com и выберем Echo активным."}</li>
          <li>{"Когда GET и POST уже настроены по примерам выше, для каждого нажмём Save и выберем существующую Planner HTTP Lab. New Collection не выбираем: нужная collection уже создана."}</li>
        </ol>
        <LinkedNotes items={[
          { title: "Collection", description: "Сохраняет GET и POST как отдельные сценарии." },
          { title: "Environment", description: "Хранит base_url и помогает не повторять базовый адрес." },
          { title: "JSON export", description: "Переносит сохранённые объекты в файлы проекта." },
        ]} />
        <CodeBlock
          caption={"переменная меняет начало URL"}
          code={"Environment Echo\nbase_url = https://postman-echo.com\n\nGET {{base_url}}/get"}
        />
        <p>
          {"После выбора Echo Postman подставит базовый адрес целиком: схему https и host postman-echo.com. Локальный base_url может также содержать порт. Path, method, query, body и ожидания останутся прежними. Поэтому Echo-запросы не превратятся в запросы Planner только после замены базового адреса."}
        </p>
        <Callout tone="info">
          <strong>Экспорт и восстановление.</strong>{" В Collections откроем меню нужной collection и выберем More → Export collection → Export JSON. В Environments откроем меню Echo и выберем Export. Получатся два отдельных файла. Чтобы проверить перенос, в workspace выберем Use resources or import → Import и загрузим оба JSON. Импортированная collection должна содержать два запроса, а активное Echo environment должно подставлять base_url. Echo не требует учётных данных."}
        </Callout>
        <p>
          {"В учебных запросах и export оставим только безопасные примеры, без паролей, токенов и реальных личных данных. Перед экспортом проверим значения collection и environment."}
        </p>
      </Section>

      <Section number="08" title={"Самопроверка перед следующей работой"}>
        <Lead>
          {"Перед переходом к собственному серверу отделим факт сетевого ответа от вывода о работе Planner."}
        </Lead>
        <RecallCard
          question={"Что доказывает POST со status 200 от Echo и чего он не доказывает?"}
          hint={"Вспомним, какой host был в URL и что именно Echo делает с входящими данными."}
          answer={<p>{"Он показывает, что Echo получил POST и вернул response. Он не доказывает, что Planner создал или сохранил Task, потому что запрос до Planner не доходил."}</p>}
        />
        <KeyTakeaways
          points={[
            <>Postman формирует и отправляет HTTP request, Echo возвращает response.</>,
            <>Params добавляет query к URL; Echo показывает значения в args, но не фильтрует задачи Planner.</>,
            <>POST передаёт JSON в body; Echo отражает его, но не сохраняет Task.</>,
            <>Status, headers и body проверяются вместе.</>,
            <>Collection хранит запросы, environment хранит базовые значения, export переносит их в файлы.</>,
          ]}
        />
        <p>
          {"В следующем занятии добавим FastAPI и запустим собственный Planner API в том же проекте. Echo останется отдельной учебной целью, а маршруты и ожидания для Planner мы составим по его договору."}
        </p>
      </Section>

      <Section number="09" title={"Что мы будем делать в практике"}>
        <Lead>
          {"Мы продолжим работать в уже существующем проекте Planner. Добавим в его корень только папку postman и сохраним там клиентские файлы. Код Planner не заменяем и новый проект не создаём."}
        </Lead>
        <CodeBlock
          caption={"новая папка рядом с прежним проектом"}
          code={"Planner/\n├── прежние файлы проекта\n└── postman/\n    ├── planner-http-lab.postman_collection.json\n    └── echo.postman_environment.json"}
        />
        <p>
          {"Сначала создадим Planner HTTP Lab и Echo environment. Затем настроим GET и POST и сохраним каждый запрос в уже существующую Planner HTTP Lab. Так сценарии останутся воспроизводимыми, а не только открытыми в рабочей вкладке."}
        </p>
        <LinkedNotes variant="connected" items={[
          { title: "Подготовим место", description: "Добавим postman/ в корень существующего Planner." },
          { title: "Настроим цель", description: "Создадим collection и Echo environment с base_url." },
          { title: "Проверим GET и POST", description: "Передадим query и JSON, затем найдём их в ответе Echo." },
          { title: "Экспортируем и восстановим", description: "Повторим запросы, экспортируем оба JSON-файла и импортируем их обратно в Postman." },
        ]} />
        <p>
          {"Проверим наблюдаемый результат: query и JSON отражены в response, запросы отправляются повторно, а два export лежат рядом с исходным проектом. После импорта оба запроса снова открываются, а Echo environment подставляет base_url. Успешный ответ Echo не означает создание задачи в Planner."}
        </p>
        <Callout tone="warn">
          {"Если Echo временно недоступен, отделим отсутствие HTTP-ответа от ошибки Planner. Старые файлы проекта не меняем ради восстановления внешнего учебного сервиса."}
        </Callout>
        <PracticeCta text={"Вместе подготовим postman/ в проекте Planner, создадим collection и environment, отправим GET и POST в Echo, сохраним экспорт и проверим его повторным импортом."} />
      </Section>
    </RichLesson>
  );
}

// 52. Первое FastAPI-приложение, Uvicorn и Swagger
export function Lesson52({ module }: { module?: string }) {
  return (
    <RichLesson>
      <RichHero
        chip={module ?? BLOCK_TITLE}
        title={"52. Первое FastAPI-приложение, Uvicorn и Swagger"}
        intro={"В прошлом занятии мы увидели HTTP-запрос в Postman. Теперь тот же существующий Planner получит собственный серверный вход, не теряя привычный CLI."}
        tags={[
          { icon: <Wrench size={14} />, label: "FastAPI + Uvicorn" },
          { icon: <Cloud size={14} />, label: "GET /health" },
        ]}
      />
      <LinkedNotes variant="connected" items={[
        { title: "Прежняя опора", description: "В прошлом занятии мы отправляли запросы через Postman и исследовали ответы Echo." },
        { title: "Новый вопрос", description: "Как принять HTTP в самом Planner и при этом сохранить прежний CLI?" },
        { title: "Результат", description: "Добавим отдельный FastAPI-вход и запустим его через Uvicorn в том же проекте." },
      ]} />

      <Section number="00" title={"От Echo к своему приложению"}>
        <Lead>
          {"Echo показал, как сервер отвечает на запрос. Теперь мы сами опишем небольшой обработчик и запустим его как HTTP-приложение."}
        </Lead>
        <p>
          {"В нашем Planner уже есть CLI, модель задачи, сервис и JSON-хранилище. Мы не создаём отдельный проект и не переписываем app/main.py. В существующем пакете app появится новый модуль app/api.py. Сначала он будет отвечать только на GET /health, не обращаясь к задачам."}
        </p>
        <CodeBlock
          caption={"Тот же проект, новый вход"}
          code={"planner/\n" +
            "├── app/\n" +
            "│   ├── __init__.py\n" +
            "│   ├── main.py\n" +
            "│   ├── cli.py\n" +
            "│   ├── services.py\n" +
            "│   ├── models.py\n" +
            "│   ├── storage.py\n" +
            "│   ├── validators.py\n" +
            "│   ├── exceptions.py\n" +
            "│   └── api.py\n" +
            "├── docs/\n" +
            "├── labs/\n" +
            "├── tests/\n" +
            "├── requirements.txt  # обновим или добавим, если его ещё нет\n" +
            "├── postman/\n" +
            "│   ├── HTTP collection\n" +
            "│   └── Echo environment\n" +
            "├── .gitignore\n" +
            "└── README.md"}
        />
        <Callout tone="info">
          <strong>Один настроенный источник данных.</strong>{" Путь к JSON не угадываем по текущей папке и не задаём отдельно для каждого интерфейса. Его выбирает существующий "}
          <code>build_service()</code>{", который собирает PlannerService с настроенным JsonStorage. Когда API начнёт работать с задачами, CLI и API должны использовать эту же фабрику и конфигурацию. Если путь действительно нужно исправить, меняем его в одном месте и отдельно проверяем, где лежат текущие записи. Второй JSON ради нового интерфейса не создаём. Сейчас "}
          <code>GET /health</code>{" к хранилищу не обращается."}
        </Callout>
        <p>
          {"Внутри app/ остаются Python-модули проекта. services.py содержит правила PlannerService, storage.py читает и сохраняет данные, models.py описывает Task. Новый HTTP-вход появится в api.py, а main.py продолжит запускать CLI. Существующие каталоги и данные остаются на своих местах."}
        </p>
        <p>
          {"Сценарии Postman хранятся отдельно от кода. В этой работе добавим локальное окружение для GET /health, не меняя Echo collection и environment. Файл requirements.txt находится в корне проекта: сохраним его текущие зависимости и допишем FastAPI с Uvicorn; если файла ещё нет, создадим его."}
        </p>
        <RecallCard
          question={"Что изменится в проекте, а что должно остаться прежним?"}
          answer={<p>{"Добавится app/api.py с FastAPI и GET /health. Модель, сервис, хранилище, данные и app/main.py с CLI останутся на месте."}</p>}
        />
      </Section>

      <Section number="01" title={"FastAPI описывает приложение"}>
        <Lead>
          {"FastAPI это Python-фреймворк для описания HTTP API. Он связывает запросы с функциями и готовит ответы."}
        </Lead>
        <p>
          {"Фреймворк даёт общие механизмы, чтобы не писать разбор HTTP с нуля. Мы задаём конкретные маршруты и правила. Такой слой часто стоит перед прикладным сервисом, а не заменяет его."}
        </p>
        <CodeBlock
          caption={"Объект приложения"}
          code={"from fastapi import FastAPI\n\n" +
            "app = FastAPI(title=\"Уведомления\")"}
        />
        <p>
          {"FastAPI это класс, а app это созданный экземпляр. К нему мы будем добавлять маршруты. Параметр title задаёт название для документации, но не меняет URL. Эта строка ещё не запускает сервер и не открывает порт."}
        </p>
        <TrueFalse
          statement={<>{"После app = FastAPI() браузер уже может подключиться к порту 8000."}</>}
          isTrue={false}
          explanation={"Появился объект приложения. Сетевой адрес начнёт принимать запросы только после запуска сервера."}
        />
      </Section>

      <Section number="02" title={"Маршрут связывает запрос и функцию"}>
        <Lead>
          {"Маршрут отвечает на вопрос: какую функцию вызвать для этой пары HTTP-метода и пути?"}
        </Lead>
        <p>
          {"Например, GET /status и POST /status это разные операции. Декоратор FastAPI регистрирует метод и путь, а функция под ним описывает обработку подходящего запроса."}
        </p>
        <CodeBlock
          caption={"Независимый маршрут уведомлений"}
          code={"from fastapi import FastAPI\n\n" +
            "app = FastAPI()\n\n" +
            "@app.get(\"/status\")\n" +
            "def read_status():\n" +
            "    return {\"service\": \"notifications\", \"active\": True}"}
        />
        <p>
          {"При загрузке модуля FastAPI записывает маршрут. Тело read_status не исполняется в этот момент. Оно запускается, когда приходит GET на /status. Возвращённый словарь станет содержимым ответа."}
        </p>
        <MatchPairs
          prompt={"Соединим фрагмент с его ролью."}
          leftTitle={"Фрагмент"}
          rightTitle={"Роль"}
          pairs={[
            { left: "@app.get(\"/status\")", right: "Задаёт метод и путь" },
            { left: "def read_status():", right: "Обрабатывает подходящий запрос" },
            { left: "return {...}", right: "Возвращает данные ответа" },
          ]}
          explanation={"Декоратор выбирает операцию, функция выполняет её, а return передаёт результат FastAPI."}
        />
        <p>
          {"Python выполняет верхнеуровневые инструкции модуля при импорте. Поэтому app.main не должен запускать CLI только из-за того, что следующий модуль импортирует из него build_service. Вызов CLI помещают под условие прямого запуска:"}
        </p>
        <CodeBlock
          caption={"Импорт app.main не запускает CLI"}
          code={'if __name__ == "__main__":\n    main()'}
        />
        <p>
          {"При команде python -m app.main имя модуля становится __main__, и guard запускает main(). При import app.main имя будет app.main, поэтому меню и ожидание ввода не начнутся."}
        </p>
        <p>
          {"В Planner первым маршрутом станет GET /health. Он вернёт короткое состояние приложения. Это учебный endpoint без доступа к списку задач."}
        </p>
      </Section>

      <Section number="03" title={"FastAPI готовит HTTP-ответ"}>
        <Lead>
          {"Обработчик возвращает значение Python. FastAPI преобразует его в ответ, который понимает HTTP-клиент."}
        </Lead>
        <p>
          {"Если вернуть словарь, FastAPI сериализует его в JSON body. Обычный успешный маршрут по умолчанию отвечает статусом 200. Значение в теле и статус это разные части response, поэтому посмотрим на оба."}
        </p>
        <CodeBlock
          caption={"Словарь Python и JSON"}
          code={"# Python\n" +
            "{\"service\": \"notifications\", \"active\": True}\n\n" +
            "# JSON в ответе\n" +
            "{\"service\": \"notifications\", \"active\": true}"}
        />
        <p>
          {"В Python логическое значение записывается как True, а в JSON как true. FastAPI выполняет преобразование. Функция не отправляет сетевые пакеты и сама не выбирает порт."}
        </p>
        <CompareSolutions
          question={"Что доказывает GET /health со статусом 200 и body {\"status\": \"ok\"}?"}
          left={{
            title: "Слишком широкий вывод",
            code: "Вся система Planner и каждое хранилище исправны",
            note: "Этот маршрут ещё не проверяет данные и сервис.",
          }}
          right={{
            title: "Точный вывод",
            code: "Приложение обработало этот запрос и вернуло ожидаемый ответ",
            note: "Проверено только поведение health-маршрута.",
          }}
          preferred={"right"}
          explanation={"Health полезен для простой проверки доступности, но его результат ограничен теми проверками, которые маршрут действительно выполняет."}
        />
      </Section>

      <Section number="04" title={"Uvicorn передаёт запрос приложению"}>
        <Lead>
          {"FastAPI описывает, что делать с запросом. Uvicorn запускает процесс, принимает соединение и вызывает приложение."}
        </Lead>
        <p>
          {"Uvicorn это ASGI-сервер. ASGI задаёт общий интерфейс между сетевым сервером и Python-приложением. Представим стандартный разъём: Uvicorn не обязан знать правила Planner, а FastAPI не должен управлять портом. Для этого занятия достаточно проследить путь сообщения. Асинхронное выполнение пока не изучаем, поэтому endpoint может быть обычной функцией def."}
        </p>
        <p>
          {"FastAPI и Uvicorn это устанавливаемые Python-библиотеки. Сначала активируем выбранное окружение проекта. Команда python -m pip использует pip именно того интерпретатора, который запускается как python; так мы не устанавливаем пакеты в одну версию Python, а запускаем сервер другой. requirements.txt служит списком зависимостей для повторной установки. Добавим в него новые библиотеки, сохранив прежние строки."}
        </p>
        <LinkedNotes items={[
          { title: "Окружение", description: "Выбранный интерпретатор Python и установленные в него пакеты." },
          { title: "pip", description: "Устанавливает FastAPI и Uvicorn в активное окружение." },
          { title: "requirements.txt", description: "Записывает зависимости проекта, чтобы их можно было установить снова." },
        ]} />
        <CodeBlock
          caption={"Список и установка зависимостей"}
          code={"# requirements.txt: сохраняем прежние строки и добавляем\nfastapi\nuvicorn\n\n# терминал, из активного окружения проекта\npython -m pip install -r requirements.txt\npython -m pip show fastapi uvicorn"}
        />
        <p>
          {"Сначала дополняем requirements.txt, затем команда с -r устанавливает перечисленные пакеты в окружение выбранного python. pip show подтверждает, что FastAPI и Uvicorn доступны именно там."}
        </p>
        <figure className="lesson-infographic">
          <img
            src={fastapiUvicornInfographic}
            alt="Браузер отправляет GET /health серверу Uvicorn. Uvicorn передаёт запрос приложению FastAPI, обработчик формирует JSON, ответ возвращается через Uvicorn."
            width={1672}
            height={836}
            loading="lazy"
            decoding="async"
          />
          <figcaption>Клиент обращается к Uvicorn. Сервер передаёт запрос FastAPI, а затем возвращает клиенту готовый ответ.</figcaption>
        </figure>
        <CodeSequence
          title={"Путь запроса"}
          prompt={"Проследим путь запроса от отправки до ответа."}
          pieces={[
            { id: "client", code: "клиент отправляет HTTP-запрос" },
            { id: "server", code: "Uvicorn принимает соединение" },
            { id: "app", code: "FastAPI выбирает маршрут" },
            { id: "handler", code: "функция возвращает значение" },
            { id: "response", code: "клиент получает HTTP-ответ" },
          ]}
          correctOrder={["client", "server", "app", "handler", "response"]}
          explanation={"Приложение не увидит сообщение, пока сервер не примет соединение. Ответ проходит обратно через Uvicorn."}
          incorrectExplanation={"Клиент сначала отправляет запрос Uvicorn. Сервер передаёт его FastAPI, маршрут вызывает обработчик, а ответ возвращается клиенту через Uvicorn."}
        />
      </Section>

      <Section number="05" title={"Команда указывает, что импортировать"}>
        <Lead>
          {"Uvicorn запускает приложение по строке импорта. Поэтому важны имя файла, имя объекта и текущая папка терминала."}
        </Lead>
        <p>
          {"Для нашего модуля команда выглядит так:"}
        </p>
        <CodeBlock
          caption={"Запуск из корня проекта"}
          code={"python -m uvicorn app.api:app --reload\n\n" +
            "app.api  → модуль app/api.py\n" +
            ":app     → объект FastAPI внутри модуля"}
        />
        <p>
          {"Команду запускают из корня существующего проекта, где Python может импортировать пакет app. Ключ --reload перезапускает сервер при изменениях и удобен во время разработки. Он не нужен на рабочем сервере."}
        </p>
        <p>
          {"В этом проекте app/main.py уже отвечает за CLI. Запись app.main:app укажет Uvicorn на CLI-модуль и попросит взять из него объект app. Это не адрес нового HTTP-приложения: оно находится в app/api.py."}
        </p>
        <FillBlank
          prompt={"Какой объект Uvicorn возьмёт после двоеточия?"}
          before={"app.api:"}
          after={""}
          options={["app", "api", "uvicorn"]}
          answer={"app"}
          explanation={"Слева указано имя модуля app.api, справа имя объекта FastAPI, который в нём создан."}
        />
        <BugHunt
          code={"Терминал открыт в app/\npython -m uvicorn app.api:app --reload"}
          question={"Python не находит пакет app. Что проверим в первую очередь?"}
          options={[
            "Запущена ли команда из корня проекта",
            "Есть ли задачи в JSON-файле",
            "Какой JSON возвращает health",
          ]}
          correctIndex={0}
          explanation={"При ошибке импорта Uvicorn ещё не загрузил приложение. Данные Planner и HTTP body пока не участвуют."}
          fix={"Остановим процесс, перейдём в корень проекта и повторим команду оттуда."}
        />
      </Section>

      <Section number="06" title={"Отделяем запуск от маршрутизации"}>
        <Lead>
          {"Похожие сообщения об ошибке относятся к разным этапам. Сначала выясним, запустился ли сервер и дошёл ли запрос до приложения."}
        </Lead>
        <LinkedNotes items={[
          { title: "Ошибка импорта", description: "Uvicorn не нашёл app.api или объект app. До HTTP-обработки дело не дошло." },
          { title: "Connection refused", description: "По адресу и порту никто не принимает соединение. Проверим, запущен ли Uvicorn." },
          { title: "404 Not Found", description: "Соединение есть, но path не зарегистрирован. Например, GET /unknown." },
          { title: "405 Method Not Allowed", description: "Path зарегистрирован, но для него нет такого метода. Например, POST /health при маршруте только для GET." },
        ]} />
        <p>
          {"404 и 405 это полученные HTTP-ответы. Ошибка импорта и отказ соединения возникают раньше. Поэтому сначала проверим, есть ли у клиента статус, и только затем изучим body."}
        </p>
        <TrueFalse
          statement={<>{"Если GET /health работает, незарегистрированный GET / тоже обязан вернуть 200."}</>}
          isTrue={false}
          explanation={"Каждая пара method и path регистрируется отдельно. Health-маршрут не создаёт автоматически маршрут корня."}
        />
      </Section>

      <Section number="07" title={"Swagger показывает зарегистрированный API"}>
        <Lead>
          {"FastAPI строит описание OpenAPI по маршрутам приложения. Swagger UI отображает это описание и может отправить настоящий запрос."}
        </Lead>
        <p>
          {"OpenAPI это машинно-читаемое описание путей и операций API. Swagger UI показывает его человеку в браузере. Это не два разных сервера: /docs берёт схему, которую FastAPI формирует для приложения."}
        </p>
        <CodeBlock
          caption={"Три адреса на локальном сервере"}
          code={"http://127.0.0.1:8000/health\n" +
            "http://127.0.0.1:8000/docs\n" +
            "http://127.0.0.1:8000/openapi.json"}
        />
        <p>
          {"В /docs откроем GET /health. Try it out подготавливает поля запроса, а Execute отправляет его. Затем сравним status и JSON body с прямым ответом браузера. OpenAPI перечислит только фактически зарегистрированные маршруты, а не весь будущий план Planner API."}
        </p>
        <QuizCard
          question={"Кто создаёт маршрут GET /health, а кто показывает его в браузере?"}
          options={[
            "FastAPI регистрирует маршрут в коде, Swagger UI отображает его описание",
            "Swagger UI создаёт маршрут, а Uvicorn сохраняет его в JSON",
            "Uvicorn добавляет все будущие маршруты при запуске",
          ]}
          correctIndex={0}
          explanation={"Маршрут объявлен в Python. FastAPI включает его в OpenAPI, а Swagger UI отображает эту схему."}
        />
        <p>
          {"Документация помогает исследовать API, но не доказывает, что бизнес-правила верны. В этой работе проверяется только health-маршрут."}
        </p>
      </Section>

      <Section number="08" title={"Проверим модель перед переходом"}>
        <Lead>
          {"Объясним цепочку своими словами, не подменяя один инструмент другим."}
        </Lead>
        <div className="lesson-check-group">
          <RecallCard
            question={"Что означает строка app.api:app?"}
            answer={<p>{"Загрузить модуль app.api, соответствующий app/api.py, и взять из него объект с именем app."}</p>}
          />
          <QuizCard
            question={"Что означает 405 для POST /health, если зарегистрирован только GET /health?"}
            options={[
              "Сервер работает, но этот метод не разрешён для пути",
              "Uvicorn не смог импортировать приложение",
              "Клиент вообще не получил HTTP-ответ",
            ]}
            correctIndex={0}
            explanation={"405 это HTTP-ответ о неподдерживаемом методе на существующем пути."}
          />
          <RecallCard
            question={"Что доказывает успешный GET /health и чего он не доказывает?"}
            answer={<p>{"Приложение обработало этот запрос и вернуло ответ. Этот маршрут не проверяет JSON-хранилище или операции над задачами."}</p>}
          />
          <RecallCard
            question={"Что произойдёт при import app.main, если CLI-запуск защищён условием __name__ == \"__main__\"?"}
            answer={<p>{"Модуль импортируется, но CLI не запускается. Поэтому следующая работа сможет получить build_service без меню и ожидания ввода."}</p>}
          />
        </div>
        <p>
          {"Когда мы различаем модуль приложения, процесс Uvicorn и HTTP-маршрут, можно переходить к подключению существующего PlannerService."}
        </p>
      </Section>

      <Section number="09" title={"Что мы будем делать в практике"}>
        <Lead>
          {"Добавим сетевой вход к уже работающему Planner, не меняя его CLI и хранение."}
        </Lead>
        <p>
          {"Установим FastAPI и Uvicorn в выбранное окружение и добавим их в requirements.txt, сохранив остальные зависимости. Если файла ещё нет, создадим его в корне проекта. Затем добавим app/api.py с объектом FastAPI и GET /health. Браузером проверим JSON-тело, а статус 200 прочитаем в Swagger UI или Postman."}
        </p>
        <CodeBlock
          caption={"Новый вход, прежний проект"}
          code={"существующий Planner\n" +
            "  app/main.py  → прежний CLI\n" +
            "  app/api.py   → GET /health\n" +
            "  postman/     → Planner API collection + Local environment"}
        />
        <p>
          {"В Postman настроим Local environment с base_url=http://127.0.0.1:8000 и сохраним GET /health отдельно от Echo-запросов. Затем проверим 404 и 405, импортируем app.main без запуска меню и запустим прежний CLI."}
        </p>
        <p>
          {"Мы не подключаем чтение списка задач, новые хранилища или CRUD. Следующая работа добавит GET-маршруты к PlannerService, собранному через тот же build_service и настроенный путь JsonStorage."}
        </p>
        <KeyTakeaways
          points={[
            <>{"FastAPI описывает маршруты, Uvicorn принимает сетевые запросы."}</>,
            <>{"Импорт app.api:app указывает модуль и объект приложения."}</>,
            <>{"python -m pip устанавливает пакеты в окружение выбранного интерпретатора."}</>,
            <>{"Импорт app.main не должен запускать CLI; build_service настраивает общий путь хранилища."}</>,
            <>{"GET /health проверяет только ответ этого маршрута."}</>,
          ]}
        />
        <PracticeCta text={"Установим FastAPI и Uvicorn в окружение Planner, добавим GET /health, проверим тело и статус отдельно, затем подтвердим безопасный импорт app.main и прежний CLI."} />
      </Section>
    </RichLesson>
  );
}

// 53. GET-endpoints и ответы FastAPI
export function Lesson53({ module }: { module?: string }) {
  return (
    <RichLesson>
      <RichHero
        chip={module ?? BLOCK_TITLE}
        title={"53. GET-endpoints и ответы FastAPI"}
        intro={"В прошлом занятии мы запустили FastAPI и проверили GET /health. Теперь подключим к HTTP-интерфейсу уже существующий Planner: задачи создаёт CLI, а API читает тот же сохранённый файл."}
        tags={[
          { icon: <ListChecks size={14} />, label: "Чтение Planner" },
          { icon: <FileText size={14} />, label: "Один JSON-файл" },
        ]}
      />
      <LinkedNotes variant="connected" items={[
        { title: "Прежняя опора", description: "В прошлом занятии наше FastAPI-приложение ответило на GET /health." },
        { title: "Новый вопрос", description: "Как показать через HTTP задачи, которые уже хранятся в Planner?" },
        { title: "Результат", description: "Подключим GET списка и статистики к прежнему PlannerService и тому же JSON." },
      ]} />

      <Section number="00" title={"От ответа о запуске к данным Planner"}>
        <Lead>
          {"GET /health уже отвечает, но он сообщает только о самом приложении. Теперь естественный вопрос: как показать через API задачи, которые мы уже умеем хранить в Planner?"}
        </Lead>
        <p>
          {"Представим две двери в одну мастерскую. Через первую человек работает с CLI, через вторую клиент отправляет HTTP-запрос. Двери разные, но правила Planner и файл с задачами должны оставаться общими."}
        </p>
        <CodeBlock
          caption={"два интерфейса одного проекта"}
          code={"CLI → PlannerService → JsonStorage → data/tasks.json\n" +
            "HTTP → FastAPI → app.state.planner → JsonStorage → тот же файл"}
        />
        <p>
          {"Здесь есть важное уточнение: CLI и Uvicorn работают в разных процессах, поэтому это не один и тот же Python-объект в памяти. Каждый вход собирает свой PlannerService, но оба используют готовый путь к одному JSON-файлу. Так проект не раздваивается на две независимые копии."}
        </p>
        <p>
          <strong>{"Граница файлового решения. "}</strong>
          {"Общий путь к JSON не защищает одновременную запись. Если два процесса одновременно прочитают старую версию, изменят её и сохранят файл, более поздняя запись может затереть предыдущую. Сейчас изменения выполняем по очереди. Блокировки и транзакции в этом занятии не реализуем."}
        </p>
        <figure className="lesson-infographic lesson-infographic--lesson53">
          <picture>
            <source media="(max-width: 640px)" srcSet={lesson53ReadModelMobile} />
            <img
              src={lesson53ReadModelInfographic}
              alt="CLI и FastAPI используют отдельные экземпляры PlannerService и JsonStorage, настроенные на один файл data/tasks.json. GET-маршруты читают сохранённое состояние."
              width={1680}
              height={620}
              loading="lazy"
              decoding="async"
            />
          </picture>
          <figcaption>
            {"Память процесса у CLI и Uvicorn разная. Общим источником данных остаётся файл, к которому настроен готовый JsonStorage."}
          </figcaption>
        </figure>
      </Section>

      <Section number="01" title={"Память процесса и сохранённый источник"}>
        <Lead>
          {"Обычный список Python живёт внутри запущенной программы. Файл устроен иначе: следующая команда или новый процесс может прочитать сохранённое состояние."}
        </Lead>
        <p>
          {"Когда CLI запускает операцию Planner, сервис обращается к JsonStorage. Хранилище читает задачи из JSON и сохраняет изменения после команд. После остановки CLI его оперативная память исчезнет, но записанное в файл останется."}
        </p>
        <LinkedNotes variant="connected" items={[
          { title: "Оперативная память", description: "Состояние конкретного процесса. Не становится общим для другого процесса." },
          { title: "JsonStorage", description: "Переводит операции Planner в чтение и запись JSON-файла." },
          { title: "data/tasks.json", description: "Постоянный источник задач, который можно снова открыть после перезапуска." },
        ]} />
        <p>
          {"В проекте уже есть build_service, который выбирает настроенное хранилище и путь. Не нужно искать файл относительно текущей папки, писать свой JSON-reader или переносить данные в список на уровне модуля."}
        </p>
        <CodeSequence
          title={"Что происходит между командой и файлом"}
          prompt={"Проследим путь сохранения новой задачи."}
          pieces={[
            { id: "command", code: "CLI получает команду добавить задачу" },
            { id: "service", code: "PlannerService применяет правило проекта" },
            { id: "storage", code: "JsonStorage сохраняет состояние" },
            { id: "file", code: "обновлённый JSON остаётся на диске" },
          ]}
          correctOrder={["command", "service", "storage", "file"]}
          explanation={"CLI не пишет файл собственной логикой. Команда проходит через готовый сервис и его хранилище, поэтому правила и формат остаются общими."}
          incorrectExplanation={"Команду сначала обрабатывает CLI, затем PlannerService применяет правила и передаёт сохранение JsonStorage. Только после этого обновляется файл."}
        />
        <p>
          {"Задачи для проверки готовятся через существующий CLI. Так мы узнаём фактические id и счётчики из работающего проекта, а не подгоняем API под выдуманные числа."}
        </p>
      </Section>

      <Section number="02" title={"Зачем приложению app.state.planner"}>
        <Lead>
          {"FastAPI-приложению нужен доступ к готовому сервису, когда приходит запрос. app.state хранит объект, связанный с экземпляром приложения."}
        </Lead>
        <p>
          {"В нашем проекте в app.state.planner лежит PlannerService, собранный через build_service. Это удобная точка доступа для обработчиков. Она не является хранилищем задач: долговечность по-прежнему обеспечивает JsonStorage."}
        </p>
        <CodeBlock
          caption={"приложение хранит ссылку на сервис"}
          code={"app.state.planner = build_service()"}
        />
        <p>
          {"Обработчик должен обратиться к этому сервису во время запроса. Тогда list_tasks заново получает актуальные данные из настроенного storage. Внутри процесса будет один выбранный сервис для приложения, а не отдельный список для каждого маршрута."}
        </p>
        <BugHunt
          code={"tasks = app.state.planner.list_tasks()\n\n@app.get(\"/tasks\")\ndef read_tasks():\n    return tasks"}
          question={"Почему этот вариант может показать устаревший список после изменения JSON через CLI?"}
          options={[
            "Потому что FastAPI не может вернуть Python-список",
            "Потому что список прочитан один раз при импорте модуля",
            "Потому что GET всегда удаляет данные после ответа",
          ]}
          correctIndex={1}
          explanation={"Список получен до обработки запросов. Если CLI позже изменит файл, переменная tasks останется старым снимком в памяти API-процесса."}
          fix={"Оставим в app.state сам PlannerService, а свежий list_tasks будем вызывать внутри обработчика каждого GET."}
        />
        <p>
          {"Это не запрет на любые данные в памяти. Здесь важно не назначать временному снимку роль второго источника истины. app.state хранит средство работы с данными, а не заранее загруженную копию задач."}
        </p>
      </Section>

      <Section number="03" title={"HTTP-ответ это представление, а не вся модель"}>
        <Lead>
          {"Planner оперирует доменной Task. API передаёт клиенту согласованный публичный набор полей."}
        </Lead>
        <p>
          {"Доменная модель может содержать больше информации, чем нужно клиенту. Например, у Task есть tags. В этом контракте наружу выходят только id, title, priority и is_done. Это проекция: выбранное представление существующего объекта, а не новая задача и не копия хранилища."}
        </p>
        <p>
          {"Сначала проследим тот же приём на независимом примере. Внутренний объект участника хранит ещё и заметку команды, но публичному каталогу нужны только имя и роль."}
        </p>
        <CodeBlock
          caption={"Объект → выбранные поля → список словарей"}
          code={'from dataclasses import dataclass\n\n' +
            '@dataclass\n' +
            'class Member:\n' +
            '    name: str\n' +
            '    role: str\n' +
            '    internal_note: str\n\n' +
            'members = [\n' +
            '    Member("Алина", "редактор", "внутренняя заметка"),\n' +
            '    Member("Марк", "автор", "другая заметка"),\n' +
            ']\n\n' +
            'public_members = []\n' +
            'for member in members:\n' +
            '    public_members.append({\n' +
            '        "name": member.name,\n' +
            '        "role": member.role,\n' +
            '    })\n\n' +
            'print(public_members)'}
        />
        <p>
          {"На каждой итерации мы читаем атрибуты объекта и собираем новый словарь только из выбранных значений. Список public_members становится коллекцией этих представлений; internal_note в него не попадает. Ни исходные объекты, ни их внутренние данные мы не удаляем."}
        </p>
        <CodeBlock
          caption={"Результат print(public_members)"}
          code={"[{'name': 'Алина', 'role': 'редактор'}, {'name': 'Марк', 'role': 'автор'}]"}
        />
        <CodeBlock
          caption={"внутренний объект и ответ клиенту"}
          code={"Task: id, title, priority, is_done, tags\n" +
            "API:   id, title, priority, is_done"}
        />
        <MatchPairs
          prompt={"Определим, что относится к публичному ответу Planner API."}
          leftTitle={"Поле или деталь"}
          rightTitle={"Граница"}
          pairs={[
            { left: "id, title, priority, is_done", right: "поля ответа GET /tasks" },
            { left: "tags", right: "остаётся в модели и JSON-хранилище" },
            { left: "PlannerService.list_tasks()", right: "получает реальные задачи" },
            { left: "JSON-массив", right: "форма коллекции для клиента" },
          ]}
          explanation={"API не обязано выдавать клиенту каждый атрибут внутренней модели. В этом контракте наружу передаётся только согласованная проекция."}
        />
        <p>
          {"FastAPI умеет преобразовать возвращённые Python-списки и словари в JSON. Поэтому маршрут возвращает структурированные значения, а не вручную собранную строку JSON. Массив остаётся массивом и при нуле задач."}
        </p>
        <CompareSolutions
          question={"Какой подход сохраняет отдельную границу между моделью Planner и ответом API?"}
          left={{
            title: "Выбрать поля ответа",
            code: "id, title, priority, is_done",
            note: "Клиент получает стабильную форму, tags остаётся внутри проекта.",
          }}
          right={{
            title: "Отдать всё как есть",
            code: "вернуть каждый атрибут Task",
            note: "Изменение модели неожиданно меняет публичный контракт.",
          }}
          preferred={"left"}
          explanation={"Публичная форма меняется осознанно. Она не должна случайно расширяться вместе с внутренней моделью."}
        />
      </Section>

      <Section number="04" title={"Статистика уже посчитана сервисом"}>
        <Lead>
          {"У Planner уже есть get_statistics. HTTP-слой не должен повторно считать задачи и поддерживать второй алгоритм."}
        </Lead>
        <p>
          {"Сервис возвращает словарь с ключами all, open и done. Для HTTP-клиента общее количество называется total. Маршрут переводит имя all в total, а значения open и done берёт из результата сервиса."}
        </p>
        <CodeBlock
          caption={"меняется имя поля, не источник вычисления"}
          code={'PlannerService: {"all": 4, "open": 3, "done": 1}\n' +
            'GET /stats:     {"total": 4, "open": 3, "done": 1}'}
        />
        <p>
          {"Числа в примере только показывают преобразование. В проекте счётчики зависят от текущих данных Planner. Если маршрут начнёт обходить список отдельно, ответы со временем могут разойтись."}
        </p>
        <FillBlank
          prompt={"Какое поле результата get_statistics становится полем total в HTTP-ответе?"}
          before={"total получает значение из "}
          after={""}
          options={["all", "open", "done"]}
          answer={"all"}
          explanation={"Сервис использует all для общего числа. API сохраняет вычисленное значение и меняет только имя внешнего поля."}
        />
        <p>
          {"Для проверки можно сложить open и done: каждая задача находится ровно в одном из этих состояний. Их сумма должна совпасть с total."}
        </p>
      </Section>

      <Section number="05" title={"Что проверяет GET, а что остаётся неизменным"}>
        <Lead>
          {"GET возвращает представление текущего состояния. Сам запрос не создаёт запись и не переписывает JSON."}
        </Lead>
        <p>
          {"Пустая коллекция остаётся валидным результатом: GET /tasks отвечает массивом [], а сводка показывает нули. Если файл повреждён, это не то же самое, что пустой список. Нельзя молча заменить ошибку чтения пустым значением и сохранить его поверх исходного файла."}
        </p>
        <TrueFalse
          statement={<>{"Если GET /tasks ответил HTTP 200, значит запрос обязательно изменил JSON-файл."}</>}
          isTrue={false}
          explanation={"Успешный статус подтверждает обработку запроса. GET читает состояние, а не сохраняет его заново."}
        />
        <QuizCard
          question={"Что лучше проверить после GET /stats?"}
          options={[
            "Что счётчики совпадают с CLI, а JSON не изменился",
            "Что файл был пересоздан с тремя фиксированными числами",
            "Что список задач перенесён в отдельную переменную API",
          ]}
          correctIndex={0}
          explanation={"CLI и API наблюдают один сохранённый источник. Чтение не должно создавать отдельное состояние или изменять файл."}
        />
        <p>
          {"Проверим не только тело ответа. Сверим статус, JSON-форму и фактические данные с CLI. Затем добавим или завершим задачу через CLI и повторим GET: новая версия должна появиться без ручной правки Python-списка."}
        </p>
      </Section>

      <Section number="06" title={"Перед тем как открывать практику"}>
        <Lead>
          {"Попробуем объяснить путь данных без подсказки: от команды CLI или HTTP-запроса до сохранённого состояния и ответа."}
        </Lead>
        <div className="lesson-check-group">
          <QuizCard
            question={"Что общее у CLI и FastAPI, если они работают в разных процессах?"}
            options={[
              "Один Python-объект PlannerService в общей RAM",
              "Готовая логика Planner и настроенный путь к JSON-файлу",
              "Один глобальный список tasks",
            ]}
            correctIndex={1}
            explanation={"У процессов отдельная память и отдельные экземпляры сервиса. Общий источник здесь файл, который выбирает готовая конфигурация."}
          />
          <RecallCard
            question={"Какие четыре поля входят в ответ GET /tasks и где остаётся tags?"}
            answer={<p>{"Ответ содержит id, title, priority и is_done. Поле tags остаётся во внутренней модели и сохранённых данных."}</p>}
          />
          <RecallCard
            question={"Чем ответ get_statistics отличается от публичного GET /stats?"}
            answer={<p>{"Сервис возвращает all, open и done. HTTP-ответ называет общее число total и использует значения готовой статистики."}</p>}
          />
          <RecallCard
            question={"Что даёт общий путь к JSON и чего он не гарантирует?"}
            answer={<p>{"Разные процессы могут читать одно сохранённое состояние через JsonStorage. Сам общий путь не синхронизирует одновременные изменения, поэтому здесь мы меняем данные по очереди."}</p>}
          />
        </div>
        <p>
          {"В следующем занятии адрес выберет одну конкретную задачу. Для этого пригодится список с реальными id, который здесь читается из того же хранилища."}
        </p>
        <KeyTakeaways
          points={[
            <>{"CLI и API продолжают один Planner, а не две копии проекта."}</>,
            <>{"У процессов своя память, общий JSON сохраняет состояние, а изменения в этой работе идут последовательно."}</>,
            <>{"app.state.planner хранит сервис приложения, а не снимок задач."}</>,
            <>{"GET /tasks возвращает четыре поля публичного представления Task."}</>,
            <>{"GET /stats использует готовый подсчёт и переводит all в total."}</>,
            <>{"Чтение не меняет JSON; пустой список не скрывает ошибку повреждённого файла."}</>,
          ]}
        />
      </Section>
      <Section number="07" title={"Что мы будем делать в практике"}>
        <Lead>
          {"Сначала получим проверяемый источник данных, затем подключим к нему два HTTP-чтения."}
        </Lead>
        <p>
          {"Сначала проследим цепочку от CLI через build_service к настроенному JsonStorage и пути файла. Через этот CLI подготовим реальные задачи и запишем фактические id и статистику. Затем расширим app/api.py: GET /tasks вернёт четыре публичных поля, а GET /stats покажет готовую статистику Planner под именами HTTP-контракта."}
        </p>
        <LinkedNotes items={[
          { title: "Один проект", description: "Продолжаем Planner с его CLI, PlannerService и JsonStorage." },
          { title: "Один источник", description: "CLI и Uvicorn используют настроенный путь к одному data/tasks.json." },
          { title: "Два чтения", description: "GET /tasks показывает коллекцию, GET /stats показывает сводку сервиса." },
          { title: "Проверка результата", description: "Сравниваем ответы с CLI, повторяем чтения после изменений и перезапуска." },
        ]} />
        <p>
          {"Оставим Uvicorn работать в одном терминале, а во втором последовательно изменим данные через CLI. Когда команда завершится, вызовем GET /tasks и GET /stats без перезапуска API. Затем перезапустим Uvicorn и повторим оба запроса. Так мы проверим свежесть ответов и сохранность файла, не запуская две записи одновременно. Новую модель, storage или временный список не создаём; health и CLI остаются рабочими."}
        </p>
        <PracticeCta text={"Подготовим реальные данные через CLI и подключим два GET-маршрута к тому же PlannerService и JSON-файлу."} />
      </Section>

    </RichLesson>
  );
}

// 54. Path-параметры и поиск объекта
export function Lesson54({ module }: { module?: string }) {
  return (
    <RichLesson>
      <RichHero
        chip={module ?? BLOCK_TITLE}
        title={"54. Path-параметры и чтение одной задачи"}
        intro={"GET /tasks уже показывает реальные задачи Planner. Теперь клиент сможет запросить одну запись по её id, а API точно различит найденную задачу, отсутствие записи и неверный тип адреса."}
        tags={[
          { icon: <KeyRound size={14} />, label: "id в адресе" },
          { icon: <GitBranch size={14} />, label: "200 · 404 · 422" },
        ]}
      />
      <LinkedNotes variant="connected" items={[
        { title: "Прежняя опора", description: "В прошлом занятии API прочитал реальные список и статистику Planner." },
        { title: "Новый вопрос", description: "Как адресовать одну запись и различить её отсутствие и неверный id?" },
        { title: "Результат", description: "Добавим чтение item по path-параметру и проследим ответы 200, 404 и 422." },
      ]} />

      <Section number="00" title={"Из списка открываем нужную задачу"}>
        <Lead>
          {"В прошлом занятии Planner API научился возвращать список из рабочего JSON. На экране планировщика человек выбирает одну строку и ждёт, что откроется именно эта задача, а не весь список заново."}
        </Lead>
        <p>
          {"Для этого у каждой записи есть устойчивый id. Например, /tasks/17 просит задачу с id 17. Число здесь учебное: в практике мы возьмём настоящий id из ответа Planner."}
        </p>
        <Callout tone="info">
          <strong>План занятия.</strong> Проследим адрес до Python-функции, передадим id готовому PlannerService и соберём ответ. Затем проверим, чем отличаются несуществующий id и значение, которое вообще нельзя прочитать как число.
        </Callout>
        <RecallCard
          question={"Если задача с id 17 есть в GET /tasks, какой результат ожидается от GET /tasks/17?"}
          answer={<p>{"Одна задача с id 17. Адрес выбирает запись, а не повторно запрашивает весь список."}</p>}
        />
      </Section>

      <Section number="01" title={"Path выбирает item, query настраивает список"}>
        <Lead>
          {"Маршрут коллекции и маршрут одной записи похожи, но просят разный объём данных."}
        </Lead>
        <CodeBlock
          caption={"один API, два масштаба чтения"}
          code={"GET /tasks                  → список задач\n" +
            "GET /tasks/17               → одна задача\n" +
            "GET /tasks?is_done=false    → список по условию"}
        />
        <p>
          {"Collection, или коллекция, это набор задач. Item это один элемент набора. Ресурс API может обозначать и коллекцию, и отдельную Task. В нашем примере path указывает на ресурс, а query настраивает чтение списка."}
        </p>
        <p>
          {"Path находится в основном пути URL и называет ресурс. Query начинается после знака вопроса и задаёт настройки коллекции. Поэтому запрос с is_done=false всё ещё просит список, даже если ответ станет короче."}
        </p>
        <p>
          {"GET /tasks?is_done=false здесь показывает форму будущего запроса. Текущий обработчик GET /tasks ещё не подключил фильтр is_done, поэтому сам параметр в URL не означает, что отбор уже работает. Подключим query в следующем занятии."}
        </p>
        <p>
          {"Id не равен номеру строки. После сортировки задача может переместиться, но её id остаётся прежним. Именно поэтому ссылка на /tasks/17 продолжает указывать на одну и ту же запись."}
        </p>
        <MatchPairs
          prompt={"Соединим адрес с тем, что просит клиент."}
          leftTitle={"Адрес"}
          rightTitle={"Объект запроса"}
          pairs={[
            { left: "GET /tasks", right: "Коллекция целиком" },
            { left: "GET /tasks/17", right: "Один item с id 17" },
            { left: "GET /tasks?is_done=false", right: "Коллекция с условием" },
          ]}
          explanation={"Число в path указывает на конкретную запись. Query меняет выборку, но не превращает коллекцию в item."}
        />
        <TrueFalse
          statement={<>{"Если задача с id 17 стоит третьей в ответе, маршрут /tasks/17 должен искать третий элемент списка."}</>}
          isTrue={false}
          explanation={"Id это идентификатор задачи, а не её текущая позиция. Сервис ищет запись по id."}
        />
      </Section>

      <Section number="02" title={"FastAPI проверяет path-параметр до вызова функции"}>
        <Lead>
          {"Переменная часть адреса связывается с аргументом Python-функции по имени."}
        </Lead>
        <p>
          {"В шаблоне /books/{book_id} фигурные скобки отмечают место значения. Имя book_id должно совпасть с аргументом. Аннотация int сообщает FastAPI ожидаемый тип параметра."}
        </p>
        <CodeBlock
          caption={"небольшой пример только для связи URL и функции"}
          code={"@app.get(\"/books/{book_id}\")\n" +
            "def read_book(book_id: int):\n" +
            "    return {\"requested_id\": book_id}"}
        />
        <p>
          {"Для GET /books/17 фреймворк берёт 17 из URL, проверяет значение и передаёт в read_book как целое число. Обработчик не обязан вручную разбирать строку. Если приходит abc, проверка останавливает запрос до входа в функцию."}
        </p>
        <CodeSequence
          title={"Путь от URL к аргументу"}
          prompt={"Проследим этапы обработки GET /books/17."}
          pieces={[
            { id: "extract", code: "FastAPI извлекает значение из {book_id}" },
            { id: "validate", code: "проверяет, что значение подходит типу int" },
            { id: "call", code: "вызывает функцию с числом 17" },
          ]}
          correctOrder={["extract", "validate", "call"]}
          explanation={"Значение сначала извлекается, затем проверяется. Только после успешного разбора вызывается обработчик."}
          incorrectExplanation={"Сначала FastAPI извлекает сегмент из URL, затем преобразует и проверяет его тип. Обработчик получает число только после успешной проверки."}
        />
        <p>
          {"Когда /tasks/abc не подходит типу int, FastAPI формирует 422. Это ошибка формы запроса. Сервис ещё не искал задачу, потому что маршрут не получил целочисленный id."}
        </p>
        <BugHunt
          code={"GET /tasks/abc\n\n" +
            "@app.get(\"/tasks/{task_id}\")\n" +
            "def read_task(task_id: int):\n" +
            "    return app.state.planner.get_task(task_id)"}
          question={"Какой этап обработает abc?"}
          options={[
            "PlannerService получит строку и ответит 404",
            "FastAPI вернёт 422 до вызова read_task",
            "FastAPI преобразует abc в id 0",
          ]}
          correctIndex={1}
          explanation={"Объявленный int проверяется на границе запроса. При невозможном разборе функция и сервис не вызываются."}
          fix={"Оставим task_id: int. Для неизвестного числового id обработаем отдельный результат сервиса в маршруте."}
        />
      </Section>

      <Section number="03" title={"Маршрут использует готовый поиск Planner"}>
        <Lead>
          {"Когда тип значения проверен, маршрут передаёт id существующему сервису проекта."}
        </Lead>
        <p>
          {"PlannerService уже знает, как найти Task в настроенном хранилище. Мы не переписываем цикл поиска и не создаём второй список. app.state.planner содержит тот сервис, который подключили к API в прошлом занятии."}
        </p>
        <LinkedNotes variant="connected" items={[
          { title: "FastAPI", description: "Извлекает task_id из path и передаёт целое число обработчику." },
          { title: "PlannerService", description: "Ищет доменную Task по id через существующий источник данных." },
          { title: "Маршрут", description: "Превращает результат сервиса в публичный HTTP-ответ." },
        ]} />
        <CodeBlock
          caption={"Путь данных без кода обработчика"}
          code={"task_id из URL → готовый PlannerService.get_task → Task или TaskNotFoundError → HTTP-ответ"}
        />
        <p>
          {"В прошлом занятии мы уже подключили app.state.planner к реальным данным. Этот endpoint продолжает ту же цепочку: HTTP не получает копию задач при старте, а сервис выполняет операцию для текущего запроса."}
        </p>
        <RecallCard
          question={"Кто должен искать Task: обработчик маршрута или готовый PlannerService?"}
          answer={<p>{"PlannerService. Маршрут связывает HTTP с операцией и формирует ответ."}</p>}
        />
      </Section>

      <Section number="04" title={"Ожидаемое отсутствие превращается в 404"}>
        <Lead>
          {"Корректный числовой id может не соответствовать ни одной записи. Это другой случай, чем неверный тип."}
        </Lead>
        <p>
          {"Если задача не найдена, готовый сервис сообщает TaskNotFoundError. Маршрут переводит именно эту ожидаемую доменную ошибку в HTTPException со статусом 404. Сервис при этом не обязан знать, что такое HTTP."}
        </p>
        <p>
          {"HTTPException предоставляет FastAPI. Импортируем его из пакета fastapi. Когда маршрут поднимает это исключение через raise, FastAPI прекращает обычный путь обработчика и формирует HTTP-ответ со статусом и описанием ошибки."}
        </p>
        <p>
          {"На независимом примере книг предположим, что catalog.get_book(book_id) сообщает BookNotFoundError, если книги нет. На HTTP-границе мы ловим именно это ожидаемое исключение и поднимаем HTTPException со статусом 404. FastAPI формирует ответ, а каталог не получает зависимость от HTTP."}
        </p>
        <CodeBlock
          caption={"Независимый пример: отсутствие книги"}
          code={"from fastapi import HTTPException\n\n" +
            "try:\n" +
            "    book = catalog.get_book(book_id)\n" +
            "except BookNotFoundError as error:\n" +
            "    raise HTTPException(\n" +
            "        status_code=404,\n" +
            "        detail=\"Book not found\",\n" +
            "    ) from error"}
        />
        <p>
          {"Мы не перехватываем общий Exception. Например, сбой чтения повреждённого JSON не означает, что записи нет. Если превратить любую ошибку в 404, клиент и разработчик получат неверную причину сбоя."}
        </p>
        <BugHunt
          code={"GET /books/81\nbook_id успешно разобран как int\ncatalog сообщает BookNotFoundError\nHTTP-ответ: 422"}
          question={"Книги с корректным числовым id нет. Что в этом ответе не совпадает с причиной?"}
          options={[
            "Для ожидаемого отсутствия книги нужен статус 404",
            "Для любого отсутствия всегда нужен статус 422",
            "Нужно превратить BookNotFoundError в успешный ответ",
          ]}
          correctIndex={0}
          explanation={"Числовой id прошёл проверку, но книга не найдена. 422 относится к неразбираемому или некорректному входу, а ожидаемое отсутствие ресурса обозначается 404."}
          fix={"Заменим статус на 404 для BookNotFoundError и оставим обработку узкой: остальные сбои не маскируем."}
        />
      </Section>

      <Section number="05" title={"Публичный ответ остаётся отдельным от модели"}>
        <Lead>
          {"Внутренняя Task и JSON, который обещает API клиенту, связаны, но это не одно и то же."}
        </Lead>
        <p>
          {"Для этого API в публичную задачу входят id, title, priority и is_done. Например, tags остаётся во внутренней модели и в JSON-файле, но не добавляется в этот ответ автоматически."}
        </p>
        <p>
          {"Проекция это выбранное представление объекта для конкретного ответа. Мы собираем её явно, чтобы внутренние поля не меняли формат API сами по себе."}
        </p>
        <CompareSolutions
          question={"Как сохранить понятный и устойчивый формат GET /tasks/{task_id}?"}
          left={{
            title: "Явная проекция",
            code: "id · title · priority · is_done",
            note: "Маршрут выдаёт ровно согласованные поля.",
          }}
          right={{
            title: "Вся внутренняя модель",
            code: "task.to_dict()",
            note: "Вместе с ответом могут уйти служебные поля, например tags.",
          }}
          preferred={"left"}
          explanation={"Публичный API-контракт меняется осознанно. Новое внутреннее поле не должно само по себе появиться у всех клиентов."}
        />
        <p>
          {"GET только читает. Не вызываем save и не меняем Task внутри запроса. Повторное чтение не должно менять JSON или статистику Planner."}
        </p>
        <QuizCard
          question={"Во внутреннюю Task добавили поле reminder_at. Должно ли оно автоматически попасть в HTTP-ответ?"}
          options={["Да, любая модель целиком становится контрактом", "Нет, список публичных полей задан явно"]}
          correctIndex={1}
          explanation={"Явная проекция отделяет внутреннюю модель от обещания API. Новое поле добавляют наружу только отдельным решением."}
        />
      </Section>

      <Section number="06" title={"Один адрес проходит проверку и даёт один исход"}>
        <Lead>
          {"Теперь соединим маршрут, валидацию, поиск и ответ. Разница между 404 и 422 становится видна по месту, где остановился запрос."}
        </Lead>
        <figure className="lesson-infographic lesson-infographic--lesson54">
          <picture>
            <source media="(max-width: 640px)" srcSet={lesson54PathSearchMobile} />
            <img
              src={lesson54PathSearchInfographic}
              alt="FastAPI проверяет task_id как int. Неверное значение получает 422 до обработчика. Валидный id передаётся PlannerService. Найденная Task становится публичным ответом 200, отсутствие даёт 404, а сбой хранилища не маскируется как 404."
              width={1672}
              height={620}
              loading="lazy"
              decoding="async"
            />
          </picture>
          <figcaption>
            {"Сначала проверяется тип path-параметра. Только корректное число доходит до PlannerService; отсутствие задачи и ошибка хранилища остаются разными исходами."}
          </figcaption>
        </figure>
        <div className="lesson-check-group">
          <QuizCard
            question={"Куда дойдёт запрос GET /tasks/abc?"}
            options={["До сервиса, который вернёт 404", "Остановится на проверке FastAPI и получит 422", "Будет преобразован в id 0"]}
            correctIndex={1}
            explanation={"Обработчик вызывается только после успешного преобразования значения в int."}
          />
          <QuizCard
            question={"Сервис сообщил TaskNotFoundError для id 999. Какой ответ отправляет маршрут?"}
            options={["404, ресурс не найден", "422, параметр не разобран", "200 с первой записью"]}
            correctIndex={0}
            explanation={"Число корректно, но соответствующей задачи нет. Это отсутствие ресурса, а не ошибка типа."}
          />
          <TrueFalse
            statement={<>{"Ошибка чтения JSON должна превращаться в 404, если клиент запросил конкретный id."}</>}
            isTrue={false}
            explanation={"Сбой хранилища не доказывает, что задачи нет. Его нельзя маскировать как ожидаемое отсутствие."}
          />
        </div>
        <KeyTakeaways
          points={[
            <>Path с id выбирает один item, а query настраивает чтение коллекции.</>,
            <>FastAPI проверяет task_id: int до вызова маршрута; неверный тип даёт 422.</>,
            <>PlannerService ищет Task, а маршрут превращает TaskNotFoundError в 404.</>,
            <>Явная проекция возвращает четыре поля и сохраняет GET read-only.</>,
          ]}
        />
      </Section>

      <Section number="07" title={"Что мы будем делать в практике"}>
        <Lead>
          {"Мы добавим в существующий Planner API чтение одной реальной задачи. Это продолжение работающего проекта, а не отдельное упражнение на временном списке."}
        </Lead>
        <p>
          {"В первом задании добавим GET /tasks/{task_id} в app/api.py. Path-параметр попадёт в готовый app.state.planner.get_task(task_id), а ответ будет содержать согласованные публичные поля Task."}
        </p>
        <p>
          {"Во втором задании изменим уже созданный обработчик read_task, не добавляя второй маршрут с той же парой GET и /tasks/{task_id}. Проверим id из GET /tasks, отсутствующий числовой id и abc. Мы увидим три результата: 200, 404 и 422. После чтения повторно сравним список, статистику и рабочий JSON. Запросы останутся в уже существующей Planner collection."}
        </p>
        <Callout tone="info">
          <strong>Граница работы.</strong> Мы не создаём второй список задач, не пишем новый поиск и не меняем хранилище. Мы добавляем только HTTP-маршрут к уже готовой операции.
        </Callout>
        <PracticeCta text={"Добавим GET /tasks/{task_id}, подключим его к PlannerService и проверим найденную задачу, 404, 422 и сохранность данных."} />
      </Section>
    </RichLesson>
  );
}

// 55. Query-параметры: фильтрация, сортировка и границы
export function Lesson55({ module }: { module?: string }) {
  return (
    <RichLesson>
      <RichHero
        chip={module ?? BLOCK_TITLE}
        title={"55. Query-параметры: фильтрация, сортировка и границы"}
        intro={"GET /tasks уже показывает реальные данные. Теперь научим тот же адрес отдавать удобную выборку, не меняя задачи в Planner."}
        tags={[
          { icon: <ListChecks size={14} />, label: "чтение коллекции" },
          { icon: <Wrench size={14} />, label: "filter · sort · limit" },
        ]}
      />
      <LinkedNotes variant="connected" items={[
        { title: "Прежняя опора", description: "В прошлом занятии path выбирал одну задачу, а GET /tasks возвращал коллекцию." },
        { title: "Новый вопрос", description: "Как запросить подходящий вид коллекции, не меняя сами задачи?" },
        { title: "Результат", description: "Добавим query-фильтр, сортировку и limit поверх данных того же Planner." },
      ]} />

      <Section number="01" title={"Path выбирает объект, query настраивает список"}>
        <Lead>{"В прошлом занятии GET /tasks/{task_id} выбирал одну задачу по id. Сам GET /tasks возвращает коллекцию. Query-параметры позволяют уточнить, какой вид этой коллекции нужен клиенту."}</Lead>
        <p>{"Сравним адреса. /tasks/7 указывает на одну запись. /tasks?is_done=false остаётся адресом списка, но просит показать только невыполненные задачи. Отдельный маршрут для каждой комбинации условий не нужен."}</p>
        <CodeBlock caption={"Настройки после вопросительного знака"} code={"GET /tasks?is_done=false&sort_desc=true"} />
        <p>{"После ? записываются пары «имя=значение», а несколько пар разделяются символом &. Их порядок в URL не задаёт порядок работы сервера. Адрес limit=10&is_done=false передаёт те же условия."}</p>
        <MatchPairs
          prompt={"Сопоставим адрес с тем, что он выбирает."}
          leftTitle={"Адрес"}
          rightTitle={"Результат"}
          pairs={[
            { left: "GET /tasks", right: "Коллекция, по умолчанию не больше 10 задач" },
            { left: "GET /tasks/7", right: "Одна задача с id 7" },
            { left: "GET /tasks?is_done=false", right: "Открытые задачи в пределах limit" },
          ]}
          explanation={"Число в path обозначает конкретный ресурс. Query добавляет условия к чтению коллекции."}
        />
        <p>{"Фильтр, сортировка и limit меняют только ответ текущего GET. Это не команды удалить записи, переставить задачи в файле или сохранить новый порядок."}</p>
      </Section>

      <Section number="02" title={"У фильтра три состояния"}>
        <Lead>{"У параметра is_done есть важное отличие от обычного переключателя. Кроме true и false есть отсутствие условия."}</Lead>
        <LinkedNotes items={[
          { title: "Параметр не передан", description: "FastAPI передаёт None. Покажем задачи обоих статусов." },
          { title: "is_done=true", description: "Значение True. Оставим завершённые задачи." },
          { title: "is_done=false", description: "Значение False. Оставим открытые задачи." },
        ]} />
        <p>{"Запись bool | None означает, что переменная принимает True, False или None. Объединение типов через | поддерживается в Python 3.10 и новее. None здесь не четвёртый статус задачи: это отсутствие условия фильтра. Для Planner эти три состояния соответствуют всем задачам, завершённым и открытым."}</p>
        <p>{"В URL значения выглядят как текст. FastAPI преобразует true и false в Python bool. Если параметр не указан, значение по умолчанию None. Значит, условие в сервисе должно проверять именно наличие значения."}</p>
        <p>{"Посмотрим на тот же принцип отдельно от Planner. В каталоге товаров None означает, что мы не отбираем товары по признаку скидки, а False означает явный запрос товаров без скидки:"}</p>
        <CodeBlock caption={"Независимый пример: фильтр каталога"} code={"if has_discount is not None:\n    products = [\n        product for product in products\n        if product.has_discount == has_discount\n    ]"} />
        <FillBlank
          prompt={"Как проверить передачу необязательного признака скидки, не потеряв False?"}
          before={"if has_discount "}
          after={" None:\n    # применить фильтр"}
          options={["==", "is not", "or"]}
          answer={"is not"}
          explanation={"Проверка на None отличает отсутствие параметра от явного False. Поэтому явный запрос товаров без скидки не пропускается."}
        />
        <BugHunt
          code={"if has_discount:\n    products = [p for p in products if p.has_discount == has_discount]"}
          question={"Что произойдёт при запросе ?has_discount=false?"}
          options={["False пропустит условие, и вернётся весь каталог", "Python превратит False в None", "Сервис вернёт 404"]}
          correctIndex={0}
          explanation={"Обычная проверка truthy/falsy смешивает False с отсутствием значения. Для необязательного фильтра проверяют is not None."}
          fix={"Заменим проверку значения на проверку has_discount is not None, чтобы False тоже запускало фильтр."}
        />
        <p>{"Если правильно заданный фильтр не нашёл совпадений, список пуст. Это успешное чтение коллекции, а не ошибка отсутствующего ресурса. Для такого ответа подходит 200 и []. Код 404 нужен для запроса конкретной задачи, которой нет по указанному id."}</p>
      </Section>

      <Section number="03" title={"FastAPI разбирает и проверяет query до обработчика"}>
        <Lead>{"Клиент отправляет текст, а код маршрута должен получить значения ожидаемых типов. FastAPI делает это на границе HTTP."}</Lead>
        <p>{"Аннотация int просит целое число, bool просит логическое значение, а значение по умолчанию делает параметр необязательным. Например, ?limit=12 превращается в число 12. Если вместо числа пришло many, FastAPI останавливает запрос до вызова функции маршрута."}</p>
        <CodeBlock
          caption={"Пример на отдельном каталоге книг"}
          code={"from fastapi import Query\n\n@app.get(\"/books\")\ndef list_books(\n    newest: bool = False,\n    limit: int = Query(default=10, ge=1, le=50),\n):\n    ..."}
        />
        <p>{"Query задаёт правила для limit. ge=1 означает «не меньше 1», le=50 означает «не больше 50». Нижняя и верхняя границы входят в диапазон. Поэтому 1 и 50 допустимы, а 0 и 51 нет."}</p>
        <p>{"Для нашего API это выбранное правило: без limit клиент получает не больше 10 задач, а явно задать можно от 1 до 50. При неправильном типе или нарушении границы FastAPI возвращает 422. Проверка происходит до кода endpoint, поэтому сервис и файл не затронуты. Значение не округляют и не подменяют ближайшей границей."}</p>
        <CodeSequence
          title={"Что произойдёт с query-параметром"}
          prompt={"Проследим этапы для GET /books?limit=12."}
          pieces={[
            { id: "text", code: "URL содержит текст limit=12" },
            { id: "parse", code: "FastAPI преобразует значение в int и проверяет Query" },
            { id: "call", code: "маршрут получает limit=12" },
          ]}
          correctOrder={["text", "parse", "call"]}
          explanation={"До вызова endpoint значение разбирается и проверяется. При ошибке преобразования или границы цепочка останавливается раньше."}
          incorrectExplanation={"В URL limit сначала передаётся как текст. FastAPI преобразует его в int и проверяет ограничения до вызова endpoint."}
        />
        <QuizCard
          question={"Какой запрос нарушит правило limit от 1 до 50?"}
          options={["?limit=1", "?limit=50", "?limit=51"]}
          correctIndex={2}
          explanation={"Границы включены. Значение 51 превышает le=50, поэтому FastAPI вернёт 422 до вызова маршрута."}
        />
      </Section>

      <Section number="04" title={"Выборка проходит в заданном порядке"}>
        <Lead>{"Когда вход уже проверен, сервис подготавливает ответ из актуальных задач Planner. Важно не только что сделать, но и в какой последовательности."}</Lead>
        <p>{"Сначала оставим подходящие задачи. Потом расположим их по id. И только в конце возьмём первые limit элементов. Например, в книжном магазине сначала выбирают книги нужного жанра, затем ставят их по году, а потом берут первые три. Если ограничить каталог до фильтра, подходящие книги могут не попасть в ответ."}</p>
        <p>{"Для сортировки объектов sorted нужен ключ сравнения. Функция key получает по одному объекту и возвращает значение, по которому его ставить в порядок. В примере с книгами ключом будет год издания:"}</p>
        <CodeBlock
          caption={"Независимый пример: сортировка книг по году"}
          code={"books = [\n    {\"title\": \"HTTP\", \"year\": 2024},\n    {\"title\": \"Python\", \"year\": 2021},\n]\n\ndef publication_year(book):\n    return book[\"year\"]\n\nolder_first = sorted(books, key=publication_year)\nnewer_first = sorted(books, key=publication_year, reverse=True)"}
        />
        <p>{"key=publication_year передаёт sorted функцию, которую он вызовет для каждой книги. Она возвращает год, а sorted сравнивает именно эти числа, не сами словари. Короткую функцию можно записать через lambda: key=lambda book: book[\"year\"]. Запись lambda задаёт небольшую функцию без отдельного имени. По умолчанию reverse=False даёт возрастание; reverse=True меняет его на убывание. В Planner ключом становится task.id: sort_desc=False задаёт возрастание, sort_desc=True задаёт убывание."}</p>
        <figure className="lesson-infographic">
          <img
            src={queryPipelineInfographic}
            alt="Каталог книг с годами 2024, 2019, 2021, 2023, 2018. Фильтр по году после 2020 оставляет три книги. Сортировка по возрастанию даёт 2021, 2023, 2024; limit=2 возвращает 2021 и 2023. Исходный каталог остаётся неизменным."
            width={1672}
            height={836}
            loading="lazy"
            decoding="async"
          />
          <figcaption>{"На независимом примере виден порядок filter → sort → limit. Исходный каталог не перестраивается."}</figcaption>
        </figure>
        <CodeSequence
          title={"Порядок подготовки списка"}
          prompt={"Каталог должен оставить книги после 2020 года, расположить их по году от ранних к поздним и показать первые пять."}
          pieces={[
            { id: "filter", code: "оставить книги, выпущенные после 2020 года" },
            { id: "sort", code: "упорядочить их по году издания" },
            { id: "limit", code: "взять первые пять книг" },
            { id: "save", code: "перезаписать исходный каталог в новом порядке" },
          ]}
          correctOrder={["filter", "sort", "limit"]}
          explanation={"Сначала выбираются подходящие книги, затем результат упорядочивается и ограничивается. Каталог остаётся прежним: GET готовит ответ, а не сохраняет новую коллекцию."}
          incorrectExplanation={"Сначала отбираются книги нужного года, затем они сортируются по году издания и ограничиваются пятью. Перезапись каталога не входит в подготовку ответа."}
        />
        <BugHunt
          code={'books = books[:limit]\nbooks = [book for book in books if book["year"] > 2020]\nbooks = sorted(books, key=lambda book: book["year"])'}
          question={"Почему книга нужного года может не попасть в ответ?"}
          options={["limit обрезал исходный каталог до отбора книг", "sorted не умеет работать с годами", "Фильтр всегда возвращает пустой список"]}
          correctIndex={0}
          explanation={"Сначала срез оставил только начало исходного каталога. Подходящие книги за его границей не дошли до фильтра. Сначала отбираем и сортируем, потом ограничиваем."}
          fix={"Перенесём срез после отбора и сортировки: filter → sort → limit."}
        />
      </Section>

      <Section number="05" title={"Сервис готовит данные, маршрут отвечает клиенту"}>
        <Lead>{"Новый query не должен создавать второй источник задач или копировать бизнес-логику внутрь FastAPI."}</Lead>
        <LinkedNotes variant="connected" items={[
          { title: "FastAPI-маршрут", description: "Принимает проверенные query и передаёт их сервису." },
          { title: "PlannerService", description: "Берёт актуальный список через уже существующий list_tasks и готовит выборку." },
          { title: "HTTP-ответ", description: "Показывает выбранные задачи в уже принятой проекции: id, title, priority, is_done." },
        ]} />
        <p>{"В записи int | None переменная принимает целое число или None. Для сервиса limit=None означает, что выборка не обрезается. HTTP отдельно задаёт default 10. Так прежний list_tasks для CLI остаётся полным, а ограничение веб-ответа не переносится во всё приложение."}</p>
        <p>{"Для сортировки используем новый список, который возвращает sorted, а не метод sort на исходном списке. Сами Task при этом не нужно копировать, если маршрут только читает их поля и не меняет объекты. Срез тоже формирует новый список. Ни одна из этих операций не вызывает сохранение."}</p>
        <CompareSolutions
          question={"Где разместить выборку для GET /tasks?"}
          left={{
            title: "Новая операция PlannerService",
            code: "select_tasks → list_tasks → filter → sort → limit",
            note: "Сервис использует уже настроенный источник и остаётся общим для приложения.",
          }}
          right={{
            title: "Отдельный JSON в маршруте",
            code: "open(\"data/tasks.json\") → собственный разбор",
            note: "Появляется второй путь чтения, который может разойтись с CLI и остальным API.",
          }}
          preferred={"left"}
          explanation={"Новая выборка продолжает существующую сервисную границу и не обходит storage."}
        />
        <p>{"Выборка не меняет статистику. GET /stats по-прежнему считает весь Planner, а не только показанные клиенту задачи. Поле tags остаётся внутри доменной Task и файла, но в публичный ответ автоматически не попадает."}</p>
        <TrueFalse
          statement={"Если GET /tasks вернул две записи после limit=2, GET /stats тоже должен считать только эти две."}
          isTrue={false}
          explanation={"limit относится к одному ответу списка. Статистика и хранилище по-прежнему охватывают все задачи."}
        />
        <RecallCard
          question={"Почему CLI должен продолжать вызывать list_tasks, а не select_tasks с limit=10?"}
          answer={<p>{"Десять это HTTP-дефолт, а не новое ограничение всего Planner. CLI сохраняет прежнее полное чтение."}</p>}
        />
      </Section>

      <Section number="06" title={"Что мы будем делать в практике"}>
        <Lead>{"Мы расширим тот же Planner API: существующий список станет настраиваемым, но его источник и старые способы работы останутся прежними."}</Lead>
        <p>{"Сначала добавим select_tasks в PlannerService. Он будет читать через list_tasks, учитывать необязательный статус, сортировать по id и применять необязательный limit последним. Затем подключим параметры к уже существующему GET /tasks. FastAPI проверит типы и диапазон limit до вызова маршрута."}</p>
        <p>{"Сначала через CLI обеспечим больше десяти записей и найдём задачу с минимальным id. Для фильтра возьмём противоположный ей статус; если подходящих задач пока нет, добавим одну через CLI и обновим список. Запрос с этим фильтром, sort_desc=false и limit=1 должен вернуть задачу. Если выполнить сортировку, затем limit=1 и только после этого фильтр, останется задача с неподходящим статусом, а ответ станет пустым. Отдельно вызовем GET /tasks без query: ответ должен содержать первые десять задач по возрастанию id."}</p>
        <p>{"После подготовки данных, но до HTTP-запросов, сохраним полный CLI-список, stats и JSON. Это состояние станет точкой сравнения: добавления через CLI ожидаемы, а чтение через GET не должно менять подготовленные данные."}</p>
        <p>{"Для остальных запросов вычислим ожидаемый результат по полному CLI-списку: фильтр, сортировка по id, затем первые limit записей. Поэтому сравним HTTP не со всеми подходящими задачами, а с нужным префиксом. Проверим оба статуса и направления сортировки, limit=1 и limit=50, границы 422, а затем сверим полный список, одну задачу, статистику и JSON. Запросы меняют только состав ответа."}</p>
        <Callout tone="info">
          <strong>За пределами практики.</strong>{" Не добавляем новые маршруты, хранилища, поля, произвольную сортировку или постраничную навигацию. GET /tasks остаётся тем же адресом."}
        </Callout>
        <PracticeCta text={"Добавим выборку в PlannerService, подключим проверенные query к существующему GET /tasks и подтвердим, что CLI, статистика и JSON не изменились."} />
      </Section>
    </RichLesson>
  );
}
// 56. Pydantic BaseModel и request body
export function Lesson56({ module }: { module?: string }) {
  return (
    <RichLesson>
      <RichHero
        chip={module ?? BLOCK_TITLE}
        title={"56. Pydantic BaseModel и request body"}
        intro={"До этого Planner API только читал задачи. Теперь клиент впервые отправит новую задачу, а FastAPI передаст её существующему сервису и сохранит в общий JSON Planner."}
        tags={[
          { icon: <Braces size={14} />, label: "JSON body" },
          { icon: <CheckCircle2 size={14} />, label: "Настоящее создание" },
        ]}
      />
      <LinkedNotes variant="connected" items={[
        { title: "Прежняя опора", description: "В прошлом занятии GET-маршруты читали Planner, а query настраивал выборку." },
        { title: "Новый вопрос", description: "Как клиент передаёт новую задачу и кто проверяет её поля?" },
        { title: "Результат", description: "Примем JSON через Pydantic, вызовем прежний сервис и сохраним Task в общий файл." },
      ]} />

      <Section number="00" title={"От чтения к созданию"}>
        <Lead>
          {"В прошлом занятии query менял только выборку GET /tasks. Теперь у клиента другая цель: попросить Planner создать новую задачу. Для этого он отправляет POST с данными в теле запроса."}
        </Lead>
        <p>
          {"Тело запроса, или request body, несёт содержимое сообщения. Здесь это JSON с названием и приоритетом. Заголовок Content-Type сообщает серверу формат тела. Одна отправка ещё не меняет данные: сервер должен разобрать сообщение, проверить его, выполнить создание и вернуть ответ."}
        </p>
        <CodeBlock
          caption={"Клиент отправляет данные новой задачи"}
          code={"POST /tasks\nContent-Type: application/json\n\n{\n  \"title\": \"Повторить HTTP\",\n  \"priority\": 4\n}"}
        />
        <p>
          {"Сравним это с GET из прошлого занятия. Там клиент просил показать уже существующие данные. Здесь он передаёт новые значения. Сервер не должен путать входной JSON с уже созданной Task."}
        </p>
        <QuizCard
          question={"Клиент отправил POST, но обработчик ещё не вызывался. Появилась ли задача в Planner?"}
          options={[
            "Да, сам POST меняет JSON-файл",
            "Нет, отправка только передала запрос серверу",
            "Да, если в body есть title",
          ]}
          correctIndex={1}
          explanation={"Состояние меняет серверный сценарий создания. До проверки body и вызова PlannerService сохранённой задачи нет."}
        />
      </Section>

      <Section number="01" title={"Входная форма не равна модели Task"}>
        <Lead>
          {"Для API мы описываем только поля, которые клиент вправе прислать. Внутренняя модель задачи и публичный ответ решают другие задачи."}
        </Lead>
        <p>
          {"Pydantic BaseModel собирает значения в объект с известными полями. В Planner для этого будет отдельная TaskCreate, но механику разберём на независимой форме отзыва. Входная схема не заменяет предметную модель и не дублирует все её поля."}
        </p>
        <CodeBlock
          caption={"Независимая входная модель для отзыва"}
          code={"from pydantic import BaseModel\n\nclass FeedbackCreate(BaseModel):\n    text: str\n    rating: int"}
        />
        <p>
          {"Поля без значения по умолчанию обязательны. Поэтому text и rating должны прийти в body. Аннотация int требует целое число после разбора, но сама не задаёт допустимый диапазон. В обычном режиме Pydantic может преобразовать текст «4» в число 4, а слово «высокий» разобрать не сможет. В Planner такую же границу разделяют TaskCreate с title и priority и правила самой Task."}
        </p>
        <LinkedNotes
          items={[
            { title: "TaskCreate", description: "Форма входа: title и priority от клиента." },
            { title: "Task", description: "Предметная задача: серверный id, состояние и правила Planner." },
            { title: "JSON-ответ", description: "Публичное представление созданной записи для клиента." },
          ]}
        />
        <p>
          {"У входа и ответа разный смысл. Клиент не назначает постоянный id и не решает, что задача уже завершена. Маршрут передаст сервису только title и priority. По умолчанию Pydantic не требует отклонять незнакомые поля. Мы не меняем эту настройку и не строим практику на отдельном запрете: эти значения всё равно не передаются в add_task."}
        </p>
        <FillBlank
          prompt={"Какое поле обязательно передадут вместе с текстом отзыва?"}
          before={"class FeedbackCreate(BaseModel):\n    text: str\n    "}
          options={["rating", "id", "created_at"]}
          answer={"rating"}
          after={": int"}
          explanation={"rating входит во входную модель отзыва. id и created_at назначает сервер."}
        />
        <CodeBlock
          caption={"До и после разбора"}
          code={"payload = FeedbackCreate(text=\"Полезный пример\", rating=\"4\")\nprint(payload.rating, type(payload.rating).__name__)\n# 4 int"}
        />
        <p>
          {"FastAPI показывает входную модель и в Swagger UI. Поэтому описание помогает серверу проверить тело, редактору подсказать поля, а человеку увидеть контракт API. Для Planner Swagger покажет отдельную схему TaskCreate."}
        </p>
      </Section>

      <Section number="02" title={"Проверка проходит до функции маршрута"}>
        <Lead>
          {"Когда параметр маршрута имеет тип Pydantic-модели, FastAPI читает из body JSON, Pydantic проверяет его и только после этого передаёт объект обработчику."}
        </Lead>
        <p>
          {"В независимом примере FastAPI получает FeedbackCreate из body. Если обязательного поля нет или значение нельзя разобрать, FastAPI отвечает 422 до вызова функции. В Planner так же проверяются title и priority до начала маршрута."}
        </p>
        <CodeBlock
          caption={"Два тела с разными ошибками формы"}
          code={"{\"text\": \"Полезный пример\"}\n# Нет обязательного rating → 422 до обработчика\n\n{\"text\": \"Полезный пример\", \"rating\": \"высокий\"}\n# Нельзя разобрать int → 422 до обработчика"}
        />
        <p>
          {"У автоматической ошибки есть структура. detail содержит список проблем, потому что в одном body могут быть неверны несколько полей. loc показывает место: body указывает источник данных, rating конкретное поле. msg коротко объясняет причину. В полном ответе могут быть другие диагностические поля; здесь оставлены только нужные для чтения."}
        </p>
        <CodeBlock
          caption={"Сокращённая ошибка обязательного поля"}
          code={"{\"detail\": [{\"loc\": [\"body\", \"rating\"], \"msg\": \"Field required\"}]}"}
        />
        <CodeSequence
          title={"Проследим проверку запроса"}
          prompt={"Проследим этапы до входа в обработчик."}
          pieces={[
            { id: "handler", code: "FastAPI вызывает обработчик с готовой моделью" },
            { id: "send", code: "Клиент отправляет JSON body" },
            { id: "read", code: "FastAPI читает тело запроса" },
            { id: "validate", code: "Pydantic проверяет поля и типы" },
          ]}
          correctOrder={["send", "read", "validate", "handler"]}
          explanation={"Обработчик получает уже собранную модель. Если обязательное поле отсутствует, FastAPI остановит запрос до его вызова."}
          incorrectExplanation={"Сначала клиент отправляет body. FastAPI читает JSON и проверяет поля через Pydantic; только валидная модель передаётся обработчику."}
        />
        <p>
          {"Эта проверка не отвечает на вопрос, подходит ли значение правилам предметной области. Она подтверждает только форму и тип. Например, 0 подходит типу int, но может нарушать правило диапазона. В Planner приоритет от 1 до 5 проверяет уже модель Task."}
        </p>
        <TrueFalse
          statement={<>Если в body нет <code>rating</code>, обработчик получает <code>payload.rating = None</code>.</>}
          isTrue={false}
          explanation={"Поле обязательно и не имеет значения по умолчанию. FastAPI возвращает 422, а обработчик не вызывается."}
        />
      </Section>

      <Section number="03" title={"Маршрут подключает готовый проект"}>
        <Lead>
          {"Для HTTP-маршрутов настроен сервис app.state.planner. CLI запускает свой сервис отдельно, но оба пути используют один рабочий JSON-файл."}
        </Lead>
        <p>
          {"Маршрут передаёт два проверенных поля в add_task. Сервис применяет правила модели Task, назначает серверные значения и сохраняет запись через JsonStorage. Поэтому после успешного возврата сервис уже выполнил создание в общем хранилище."}
        </p>
        <LinkedNotes
          variant="connected"
          items={[
            { title: "HTTP body", description: "Клиент передаёт title и priority." },
            { title: "TaskCreate", description: "Pydantic собирает и проверяет вход." },
            { title: "PlannerService", description: "add_task применяет правила и создаёт Task." },
            { title: "JsonStorage", description: "Сохраняет её в тот же файл, что используют остальные части Planner." },
          ]}
        />
        <p>
          {"Если обработчик начнёт самостоятельно генерировать id, добавлять объект в другой список или вызывать JsonStorage.save, в проекте появится второй путь создания. Это обойдёт готовые правила и может рассинхронизировать API с CLI. Здесь нужна одна точка создания: существующий PlannerService."}
        </p>
        <CompareSolutions
          question={"Какой вариант действительно создаёт задачу в Planner?"}
          left={{
            title: "Вернуть форму входа",
            code: "model_dump() → словарь Python",
            note: "Получим словарь с входными полями. Сервис и хранилище не вызваны.",
          }}
          right={{
            title: "Вызвать существующий сервис",
            code: "TaskCreate → PlannerService → Task → JsonStorage",
            note: "Planner создаёт Task, применяет правила и сохраняет её.",
          }}
          preferred={"right"}
          explanation={"model_dump только представляет поля модели как словарь Python. Для создания нужно передать значения в существующий сценарий Planner."}
        />
      </Section>

      <Section number="04" title={"201 подтверждает настоящее создание"}>
        <Lead>
          {"Для операции создания успешный ответ сообщает не только результат, но и факт появления ресурса. Для этого используют статус 201 Created."}
        </Lead>
        <p>
          {"Рассмотрим независимый endpoint отзывов. Модельный параметр FastAPI получает из JSON объект, а status_code задаёт код успешного ответа. Внутреннее создание здесь пропущено: сам декоратор не сохраняет данные и не гарантирует 201, если операция завершилась ошибкой."}
        </p>
        <CodeBlock
          caption={"Независимый endpoint: модель из body и код успешного ответа"}
          code={"from fastapi import FastAPI\nfrom pydantic import BaseModel\n\napp = FastAPI()\n\nclass FeedbackCreate(BaseModel):\n    text: str\n    rating: int\n\n@app.post(\"/feedback\", status_code=201)\ndef create_feedback(payload: FeedbackCreate):\n    ..."}
        />
        <p>
          {"Когда операция действительно создала запись, 201 подходит как успешный ответ. В нашем Planner маршрут передаст проверенные title и priority в существующий сценарий создания; после его успешного завершения вернёт публичные поля назначенной сервером Task. Полную связку реализуем в практике."}
        </p>
        <QuizCard
          question={"Что означает status_code=201 в независимом примере?"}
          options={[
            "Это код успешного ответа, но саму запись должна создать функция",
            "FastAPI автоматически сохранил FeedbackCreate",
            "Каждый ответ функции, включая ошибку, обязан иметь код 201",
          ]}
          correctIndex={0}
          explanation={"Декоратор настраивает успешный статус ответа. Создание и сохранение выполняет код операции; исключение может завершиться другим HTTP-кодом."}
        />
      </Section>

      <Section number="05" title={"Не смешиваем ошибки формы и правила Planner"}>
        <Lead>
          {"У запроса есть две независимые проверки. Pydantic проверяет форму и типы. Модель Task проверяет, допустима ли задача по правилам проекта."}
        </Lead>
        <p>
          {"Строка из пробелов всё ещё является строкой, а 0 всё ещё целое число. Поэтому простая входная схема пропускает их по типу, но правила Planner могут отклонить значения при создании. Ожидаемую предметную ошибку переводят в 422 отдельно от ошибки формы."}
        </p>
        <CodeBlock
          caption={"Узкая обработка правила в независимом каталоге"}
          code={"try:\n    saved = catalog.add_feedback(payload.text, payload.rating)\nexcept ValueError as error:\n    raise HTTPException(status_code=422, detail=str(error)) from error"}
        />
        <p>
          {"Перехват ограничиваем одной операцией, которая сообщает об ожидаемом нарушении правила. Сбой базы, файла или программы не означает, что клиент ошибся. Такие проблемы остаются серверными ошибками, а не маскируются под 422."}
        </p>
        <p>
          {"Одинаковый статус может сопровождаться разной формой detail. Автоматическая проверка body возвращает список ошибок с loc и msg; HTTPException(detail=str(error)) в нашем обработчике возвращает строку. По этому различию видно, отказал запрос до обработчика или уже предметное правило Planner."}
        </p>
        <BugHunt
          code={"try:\n    saved = catalog.add_feedback(payload.text, payload.rating)\nexcept Exception:\n    raise HTTPException(status_code=422, detail=\"Неверные данные\")"}
          question={"Почему этот обработчик ошибки опасен?"}
          options={[
            "Он поймает и сбой хранилища, и ошибку программы, назвав их ошибкой клиента",
            "FastAPI запрещает использовать try/except внутри маршрута",
            "ValueError нельзя преобразовать в HTTP-ответ",
          ]}
          correctIndex={0}
          explanation={"Широкий except скрывает причину серверного сбоя и сообщает клиенту неверный статус. Здесь ожидаем только ValueError от правила каталога."}
          fix={"Перехватим только ValueError вокруг catalog.add_feedback. Остальные ошибки оставим видимыми серверу."}
        />
        <LinkedNotes
          items={[
            { title: 'priority: "4"', description: "Pydantic преобразует числовую строку в int; запрос проходит дальше." },
            { title: "Нет priority или текст не число", description: "Pydantic возвращает 422 до запуска маршрута." },
            { title: "Пробельный title или priority вне 1–5", description: "Task поднимает ValueError; маршрут отвечает 422 без сохранения." },
            { title: "Ошибка файла или кода", description: "Не превращаем в ошибку клиента; её должен увидеть сервер." },
          ]}
        />
      </Section>

      <Section number="06" title={"Проверим запись за пределами ответа"}>
        <Lead>
          {"Успешный JSON показывает ответ одного запроса. Чтобы доказать, что создание прошло через проект, найдём ту же запись другими уже работающими путями."}
        </Lead>
        <p>
          {"Отправим валидный POST через Swagger UI или Planner collection. Сравним priority как число 4 и как строку \"4\": Pydantic преобразует строку в целое число, поэтому оба запроса создадут Task. Выданный сервером id используем для точного GET /tasks/{task_id}. Отдельно найдём запись запросом GET /tasks?sort_desc=true&limit=1: новая задача с наибольшим id попадёт в начало выборки, даже если обычный GET показывает только первые десять id по возрастанию. Статистику, CLI и повторный запуск API сверим с тем же созданием."}
        </p>
        <CodeBlock
          caption={"Матрица проверки"}
          code={"POST priority=4                      → 201 и новая Task\nPOST priority=\"4\"                    → 201, в ответе число 4\nGET /tasks/{task_id} с id из ответа    → точная созданная запись\nGET /tasks?sort_desc=true&limit=1      → верх списка по id\nPOST без priority                      → 422 до маршрута\nPOST priority=\"высокий\"               → 422 до маршрута\nPOST title из пробелов или priority 0/6 → 422 от правила Task\nCLI, stats, перезапуск                 → та же сохранённая Task"}
        />
        <p>
          {"Отказы проверки body происходят до вызова маршрута, а ожидаемые ValueError от правил Task возникают до сохранения. Эти проверки не создают новую запись. Сбой во время записи остаётся серверной ошибкой: текущий JsonStorage использует обычный write_text и не гарантирует откат или атомарность. Механизм хранения в этом занятии не меняем."}
        </p>
        <RecallCard
          question={"Назовём весь путь валидного запроса от клиента до ответа."}
          answer={<p>{"Клиент отправляет JSON. FastAPI и Pydantic проверяют body до обработчика. Затем маршрут передаёт проверенные поля существующему PlannerService, сервис применяет правила Task и сохраняет её через JsonStorage. После успешного создания API возвращает публичные поля с кодом 201."}</p>}
        />
      </Section>

      <Section number="07" title={"Что мы будем делать в практике"}>
        <Lead>
          {"Мы добавим в существующий Planner API не временный echo, а настоящее создание задачи, которое продолжит общий путь проекта."}
        </Lead>
        <LinkedNotes
          variant="connected"
          items={[
            { title: "Описать вход", description: "TaskCreate принимает два обязательных поля клиента: title и priority." },
            { title: "Создать через Planner", description: "POST вызывает app.state.planner.add_task и возвращает серверную Task с кодом 201." },
            { title: "Развести типы и отказы", description: 'Строка "4" становится числом; ошибку формы и нарушение правил Task различаем.' },
            { title: "Проверить общий результат", description: "Сверить POST с GET, статистикой, CLI и данными после перезапуска." },
          ]}
        />
        <p>
          {"Начнём с входной схемы и проследим одну задачу до JSON-файла. Проверим преобразование строки \"4\" и обе границы отказа: неверную форму body и значение, запрещённое правилами Planner. В следующем блоке мы уточним HTTP-ограничения и форму ответа, а затем подключим обновления к тому же сервису."}
        </p>
        <PracticeCta text={'Создадим TaskCreate и настоящий POST /tasks через PlannerService. Проверим число и строку "4", ответ 201, оба вида отказа 422 и сохранность записи после чтения и перезапуска.'} />
      </Section>
    </RichLesson>
  );
}
