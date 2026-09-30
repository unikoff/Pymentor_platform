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

type TheoryBridgeData = {
  link: string;
  boundary: string;
};

const BLOCK_TITLE = "Месяц 3 · Блок 10 · Первый FastAPI";

const THEORY_BRIDGES: Record<number, TheoryBridgeData> = {
  51: {
    link: "HTTP-запрос уже знаком как схема. Теперь каждая его часть появляется в отдельном поле реального клиента.",
    boundary: "Postman не является сервером и не исправляет неправильный API. Он только отправляет запрос и показывает ответ.",
  },
  52: {
    link: "Postman уже умеет отправлять запрос, но локального сервера ещё нет. Теперь программа Python начнёт принимать обращения на вашем компьютере.",
    boundary: "FastAPI описывает API, а Uvicorn принимает сетевые запросы и вызывает приложение. Это разные роли.",
  },
  53: {
    link: "GET /health подтвердил запуск FastAPI. Теперь подключим HTTP-чтение к уже сохранённым данным Planner.",
    boundary: "CLI и Uvicorn имеют разные процессы и экземпляры сервиса, но настроенный JsonStorage ведёт их к одному JSON-файлу.",
  },
  54: {
    link: "GET /tasks возвращает список задач. Теперь клиенту нужен адрес одной конкретной задачи.",
    boundary: "В адресе одной задачи значение обязательно. Корректный тип id ещё не гарантирует, что запись существует.",
  },
  55: {
    link: "В прошлом занятии path-параметр помог выбрать одну задачу. Теперь мы настраиваем, какие задачи войдут в ответ на запрос списка.",
    boundary: "Query меняет выборку в ответе, но не меняет сохранённые задачи. Маршрут /tasks остаётся тем же.",
  },
  56: {
    link: "GET читает данные. Для POST клиент должен передать форму новой задачи, а серверу нужен явный контракт JSON body.",
    boundary: "Pydantic-модель проверяет входные данные, но не выбирает HTTP-метод, не хранит данные и не заменяет правила приложения.",
  },
};

function TheoryBridge({ lesson }: { lesson: number }) {
  const bridge = THEORY_BRIDGES[lesson];

  if (!bridge) {
    return null;
  }

  return (
    <Callout tone="info">
      <strong>Связь с курсом.</strong> {bridge.link}{" "}
      <strong>Важно не перепутать:</strong> {bridge.boundary}
    </Callout>
  );
}

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
      <TheoryBridge lesson={51} />

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
          prompt={"Соедините участника с его ролью."}
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

      <Section number="02" title={"Соберите сообщение до отправки"}>
        <Lead>
          {"В Postman поля окна соответствуют частям HTTP-сообщения. Пока не нажата Send, мы меняем только черновик. Сервер ещё ничего не получил."}
        </Lead>
        <LinkedNotes variant="connected" items={[
          { title: "Method и URL", description: "Выберите действие и адрес сервера с нужным path." },
          { title: "Params и Headers", description: "Добавьте query к URL и служебные сведения о сообщении." },
          { title: "Body", description: "Передайте данные, если их требует выбранная операция." },
          { title: "Send и Response", description: "Отправьте request и изучите status, headers и body ответа." },
        ]} />
        <p>
          {"Названия вкладок могут немного меняться между версиями Postman, но роли частей остаются такими же. Params добавляет пары в query-часть URL. Headers хранит заголовки. Body относится к исходящему запросу, а response body появляется после ответа сервера."}
        </p>
        <CodeBlock
          caption={"одна рабочая область, два сообщения"}
          code={"REQUEST\nmethod + URL + query + headers + body\n                  ↓ Send\n                 сервер\n                  ↓\nRESPONSE\nstatus + headers + body"}
        />
        <p>
          {"Не путайте Body во вкладках request с body внутри response. Первое мы отправляем, второе читаем после обмена."}
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
          fix={"Проверьте host и повторите запрос к https://postman-echo.com/get."}
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
          {"Посмотрите на упрощённую часть ответа. Echo отражает полученный текст. Значения false и 2 пришли как строки. Сервер Planner позднее сам решит, преобразовывать ли их в bool и int и как проверять."}
        </p>
        <CodeBlock
          caption={"Echo показывает полученные пары"}
          code={'{\n  "args": {\n    "is_done": "false",\n    "limit": "2"\n  }\n}'}
        />
        <FillBlank
          prompt={"Куда попадёт limit=2, если добавить эту пару в Params?"}
          before={"Params → "}
          after={""}
          options={["в query URL", "в JSON body", "в response body"]}
          answer={"в query URL"}
          explanation={"Params формирует query в адресе. Это не исходящий body и не данные ответа."}
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
          {"В Postman выберите POST, затем Body, raw и формат JSON. Raw означает, что тело вводится как текст. Для JSON Postman выставляет Content-Type: application/json. Этот заголовок сообщает серверу, как разбирать body. Не добавляйте второй такой же вручную."}
        </p>
        <p>
          {"Кавычки вокруг title обязательны, потому что это имя поля и текстовое значение. У priority кавычек нет: в JSON это число. Такое различие важно, когда Planner позже проверит входную модель."}
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
          fix={'Уберите кавычки вокруг 4: "priority": 4.'}
        />
        <TrueFalse
          statement={<>Если Echo вернул status 200 на POST, задача уже сохранена в Planner.</>}
          isTrue={false}
          explanation={"Postman отправлял запрос на Echo. Только собственный Planner API сможет создать и сохранить задачу."}
        />
      </Section>

      <Section number="06" title={"Читайте status, headers и body вместе"}>
        <Lead>
          {"Одна зелёная отметка не описывает весь результат. Чтобы понять response, проверьте статус, формат и сами поля."}
        </Lead>
        <LinkedNotes items={[
          { title: "Status", description: "Как сервер завершил HTTP-запрос." },
          { title: "Headers", description: "Какой формат и другие свойства у ответа." },
          { title: "Body", description: "Какие значения сервер действительно вернул." },
        ]} />
        <p>
          {"Например, status 200 может сочетаться с неожиданным body. Поэтому после отправки GET найдите query в args, а после POST сравните поля внутри json. Вы смотрите не только на факт ответа, но и на соответствие результата ожиданию."}
        </p>
        <CodeSequence
          title={"Порядок ручной проверки"}
          prompt={"Соберите шаги от отправки до вывода о результате."}
          pieces={[
            { id: "send", code: "отправить request кнопкой Send" },
            { id: "status", code: "прочитать status ответа" },
            { id: "headers", code: "проверить формат в headers" },
            { id: "body", code: "сопоставить поля body с ожиданием" },
            { id: "conclusion", code: "сформулировать, что именно проверено" },
          ]}
          correctOrder={["send", "status", "headers", "body", "conclusion"]}
          explanation={"Сначала нужен ответ. После этого его status, headers и body дают разные части картины."}
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

      <Section number="07" title={"Сохраните сценарии, а не только открытое окно"}>
        <Lead>
          {"После ручной проверки полезно сохранить request так, чтобы открыть и повторить его позже. Для этого в Postman есть collection и environment."}
        </Lead>
        <p>
          {"Collection это набор сохранённых request. В ней останутся method, URL, Params и body. Environment это окружение с переменными, которые меняются вместе с целью запроса. Здесь оно хранит базовый адрес Echo."}
        </p>
        <LinkedNotes items={[
          { title: "Collection", description: "Сохраняет GET и POST как отдельные сценарии." },
          { title: "Environment", description: "Хранит base_url и помогает не повторять host." },
          { title: "JSON export", description: "Переносит сохранённые объекты в файлы проекта." },
        ]} />
        <CodeBlock
          caption={"переменная меняет начало URL"}
          code={"Environment Echo\nbase_url = https://postman-echo.com\n\nGET {{base_url}}/get"}
        />
        <p>
          {"После выбора Echo Postman подставит base_url и отправит GET на https://postman-echo.com/get. Переменная заменяет только host. Path, method, query, body и ожидания останутся прежними. Поэтому Echo-запросы не превратятся в запросы Planner только после смены адреса."}
        </p>
        <Callout tone="info">
          <strong>Сохранение и экспорт.</strong>{" Для создания collection нужно войти в Postman. Затем в списке Collections откройте меню нужной collection и выберите экспорт JSON. Для environment используйте её меню и Export. Названия пунктов могут немного отличаться в разных версиях, но экспортируются два отдельных файла. Echo не требует учётных данных."}
        </Callout>
        <p>
          {"Не помещайте пароли, токены и реальные личные данные в учебные запросы или export. Перед экспортом проверьте, что collection и environment содержат только безопасные значения."}
        </p>
      </Section>

      <Section number="08" title={"Что мы будем делать в практике"}>
        <Lead>
          {"Мы продолжим работать в уже существующем проекте Planner. Добавим в его корень только папку postman и сохраним там клиентские файлы. Код Planner не заменяем и новый проект не создаём."}
        </Lead>
        <CodeBlock
          caption={"новая папка рядом с прежним проектом"}
          code={"Planner/\n├── прежние файлы проекта\n└── postman/\n    ├── planner-http-lab.postman_collection.json\n    └── echo.postman_environment.json"}
        />
        <p>
          {"Сначала подготовим collection и environment, затем добавим и проверим два сообщения. Эта последовательность оставит файлы воспроизводимыми, а не только открытыми в рабочей вкладке."}
        </p>
        <LinkedNotes variant="connected" items={[
          { title: "Подготовьте место", description: "Добавьте postman/ в корень существующего Planner." },
          { title: "Настройте цель", description: "Создайте collection и Echo environment с base_url." },
          { title: "Проверьте GET и POST", description: "Передайте query и JSON, затем найдите их в ответе Echo." },
          { title: "Сохраните результат", description: "Повторите запросы и экспортируйте оба JSON-файла в postman/." },
        ]} />
        <p>
          {"Проверяем наблюдаемый результат: query и JSON отражены в response, запросы можно отправить повторно, а два export лежат рядом с исходным проектом. Мы отдельно объясним, почему успешный ответ Echo не означает создание задачи."}
        </p>
        <Callout tone="warn">
          {"Если Echo временно недоступен, отличите отсутствие HTTP-ответа от ошибки Planner. Не изменяйте старые файлы проекта ради восстановления внешнего учебного сервиса."}
        </Callout>
        <PracticeCta text={"Добавьте postman/ в существующий проект Planner, сохраните в Postman GET с query и POST с JSON к Echo, проверьте их ответы и экспортируйте collection и environment в эту папку."} />
      </Section>

      <Section number="09" title={"Проверьте, что вы поняли обмен"}>
        <Lead>
          {"Перед переходом к собственному серверу отделите факт сетевого ответа от вывода о работе Planner."}
        </Lead>
        <RecallCard
          question={"Что доказывает POST со status 200 от Echo и чего он не доказывает?"}
          hint={"Вспомните, какой host был в URL и что именно Echo делает со входящими данными."}
          answer={<p>{"Он показывает, что Echo получил POST и вернул response. Он не доказывает, что Planner создал или сохранил Task, потому что запрос до Planner не доходил."}</p>}
        />
        <KeyTakeaways
          points={[
            <>Postman формирует и отправляет HTTP request, Echo возвращает response.</>,
            <>Params добавляет query к URL; Echo показывает значения, но не фильтрует задачи Planner.</>,
            <>POST передаёт JSON в body; Echo отражает его, но не сохраняет Task.</>,
            <>Status, headers и body проверяются вместе.</>,
            <>Collection хранит запросы, environment хранит базовые значения, export сохраняет их как файлы.</>,
          ]}
        />
        <p>
          {"В следующем занятии добавим FastAPI и запустим собственный Planner API в том же проекте. Echo останется отдельной учебной целью, а маршруты и ожидания для Planner мы составим по его договору."}
        </p>
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
      <TheoryBridge lesson={52} />

      <Section number="00" title={"От Echo к своему приложению"}>
        <Lead>
          {"Echo показал, как сервер отвечает на запрос. Теперь мы сами опишем небольшой обработчик и запустим его как HTTP-приложение."}
        </Lead>
        <p>
          {"В нашем Planner уже есть CLI, модель задачи, сервис и JSON-хранилище. Мы не создаём отдельный проект и не переписываем app/main.py. В существующем пакете app появится новый модуль app/api.py. Сначала он будет отвечать только на GET /health, не обращаясь к задачам."}
        </p>
        <CodeBlock
          caption={"Тот же проект, новый вход"}
          code={"studyhub/\n" +
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
            "├── data/\n" +
            "│   └── tasks.json\n" +
            "├── docs/\n" +
            "├── labs/\n" +
            "├── tests/\n" +
            "├── requirements.txt\n" +
            "├── postman/\n" +
            "│   ├── HTTP collection\n" +
            "│   └── Echo environment\n" +
            "├── .gitignore\n" +
            "└── README.md"}
        />
        <Callout tone="info">
          <strong>Проверьте путь к данным.</strong>{" В репозитории ученика "}
          <code>app/main.py</code>{" строит путь от каталога "}<code>app</code>{", поэтому текущая настройка указывает на "}
          <code>app/data/tasks.json</code>{", а файл в GitHub лежит в корневой папке "}<code>data/tasks.json</code>{". В этом занятии "}
          <code>GET /health</code>{" ещё не читает задачи. Перед подключением API к Planner нужно согласовать один путь, а не создавать второй файл. В репозитории также действует правило "}<code>*.json</code>{" в .gitignore: оно скрывает и экспорты Postman, но не перестаёт отслеживать уже добавленный в Git файл задач. Не публикуйте реальные данные Planner; если экспорты нужно хранить в Git, уточните правило игнорирования отдельно."}
        </Callout>
        <p>
          {"Внутри app/ остаются Python-модули проекта. services.py содержит правила PlannerService, storage.py читает и сохраняет данные, models.py описывает Task. Новый HTTP-вход появится в api.py, а main.py продолжит запускать CLI. Данные, документация и тесты остаются в корне на своих местах."}
        </p>
        <p>
          {"Файлы для клиента лежат отдельно в postman/: planner-http-lab.postman_collection.json и echo.postman_environment.json. В присланной копии репозитория этой папки и корневого requirements.txt пока нет, поэтому создайте их в studyhub/, если они ещё не появились после прошлого занятия. Сейчас API отвечает только на health и ещё не вызывает PlannerService."}
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
          prompt={"Соедините фрагмент с его ролью."}
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
          {"В Planner первым маршрутом станет GET /health. Он вернёт короткое состояние приложения. Это учебный endpoint без доступа к списку задач."}
        </p>
      </Section>

      <Section number="03" title={"FastAPI готовит HTTP-ответ"}>
        <Lead>
          {"Обработчик возвращает значение Python. FastAPI преобразует его в ответ, который понимает HTTP-клиент."}
        </Lead>
        <p>
          {"Если вернуть словарь, FastAPI сериализует его в JSON body. Обычный успешный маршрут по умолчанию отвечает статусом 200. Значение в теле и статус это разные части response, поэтому смотрите на оба."}
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
          {"Uvicorn это ASGI-сервер. ASGI задаёт общий интерфейс между сетевым сервером и Python-приложением. Представьте стандартный разъём: Uvicorn не обязан знать правила Planner, а FastAPI не должен управлять портом. Для этого занятия достаточно проследить путь сообщения. Асинхронное выполнение пока не изучаем, поэтому endpoint может быть обычной функцией def."}
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
          prompt={"Расставьте шаги от отправки до ответа."}
          pieces={[
            { id: "client", code: "клиент отправляет HTTP-запрос" },
            { id: "server", code: "Uvicorn принимает соединение" },
            { id: "app", code: "FastAPI выбирает маршрут" },
            { id: "handler", code: "функция возвращает значение" },
            { id: "response", code: "клиент получает HTTP-ответ" },
          ]}
          correctOrder={["client", "server", "app", "handler", "response"]}
          explanation={"Приложение не увидит сообщение, пока сервер не примет соединение. Ответ проходит обратно через Uvicorn."}
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
          question={"Python не находит пакет app. Что проверить первым?"}
          options={[
            "Запущена ли команда из корня проекта",
            "Есть ли задачи в JSON-файле",
            "Какой JSON возвращает health",
          ]}
          correctIndex={0}
          explanation={"При ошибке импорта Uvicorn ещё не загрузил приложение. Данные Planner и HTTP body пока не участвуют."}
          fix={"Остановите процесс, перейдите в корень проекта и повторите команду оттуда."}
        />
      </Section>

      <Section number="06" title={"Отделяйте запуск от маршрутизации"}>
        <Lead>
          {"Похожие сообщения об ошибке относятся к разным этапам. Сначала выясните, запустился ли сервер и дошёл ли запрос до приложения."}
        </Lead>
        <LinkedNotes items={[
          { title: "Ошибка импорта", description: "Uvicorn не нашёл app.api или объект app. До HTTP-обработки дело не дошло." },
          { title: "Connection refused", description: "По адресу и порту никто не принимает соединение. Проверьте, запущен ли Uvicorn." },
          { title: "404 Not Found", description: "Соединение есть, но path не зарегистрирован. Например, GET /unknown." },
          { title: "405 Method Not Allowed", description: "Path зарегистрирован, но для него нет такого метода. Например, POST /health при маршруте только для GET." },
        ]} />
        <p>
          {"404 и 405 это полученные HTTP-ответы. Ошибка импорта и отказ соединения возникают раньше. Поэтому сначала смотрите, есть ли у клиента статус, и только затем изучайте body."}
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
          {"Открыв /docs, раскройте GET /health. Try it out подготавливает поля запроса, а Execute отправляет его. Затем сравните status и JSON body с прямым ответом браузера. OpenAPI перечислит только фактически зарегистрированные маршруты, а не весь будущий план Planner API."}
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

      <Section number="08" title={"Что мы будем делать в практике"}>
        <Lead>
          {"Добавим сетевой вход к уже работающему Planner, не меняя его CLI и хранение."}
        </Lead>
        <p>
          {"Сначала подключим FastAPI и Uvicorn к существующему окружению и запишем их в корневой requirements.txt. В репозитории ученика этого файла пока нет, поэтому создадим его, если он не появился. Затем добавим app/api.py с объектом FastAPI и GET /health. Запустим Uvicorn из корня проекта и проверим один и тот же ответ в браузере и Swagger UI."}
        </p>
        <CodeBlock
          caption={"Результат занятия"}
          code={"существующий Planner\n" +
            "  app/main.py  → прежний CLI\n" +
            "  app/api.py   → GET /health\n" +
            "  postman/     → запрос к Local environment"}
        />
        <p>
          {"В Postman создадим отдельное Local environment с base_url=http://127.0.0.1:8000 и сохраним GET /health в Planner API collection. Echo environment оставим для Echo. В конце проверим 404 и 405 и убедимся, что прежний CLI по-прежнему запускается."}
        </p>
        <p>
          {"Мы не добавляем чтение списка задач, новые хранилища или CRUD. Следующая работа подключит чтение Planner к уже существующему приложению."}
        </p>
        <KeyTakeaways
          points={[
            <>{"FastAPI описывает маршруты, Uvicorn принимает сетевые запросы."}</>,
            <>{"Импорт app.api:app указывает модуль и объект приложения."}</>,
            <>{"GET /health проверяет только ответ этого маршрута."}</>,
            <>{"OpenAPI описывает зарегистрированные операции, Swagger UI показывает схему."}</>,
            <>{"CLI и данные Planner остаются прежними."}</>,
          ]}
        />
        <PracticeCta text={"Продолжите существующий Planner: добавьте app/api.py, запустите GET /health через Uvicorn и проверьте HTTP-ответ, Swagger UI и прежний CLI."} />
      </Section>

      <Section number="09" title={"Проверьте модель перед переходом"}>
        <Lead>
          {"Объясните цепочку своими словами, не подменяя один инструмент другим."}
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
        </div>
        <p>
          {"Если вы можете отделить модуль приложения, процесс Uvicorn и HTTP-маршрут, можно переходить к подключению существующего PlannerService."}
        </p>
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
      <TheoryBridge lesson={53} />

      <Section number="00" title={"От ответа о запуске к данным Planner"}>
        <Lead>
          {"GET /health уже отвечает, но он сообщает только о самом приложении. Теперь естественный вопрос: как показать через API задачи, которые мы уже умеем хранить в Planner?"}
        </Lead>
        <p>
          {"Представьте две двери в одну мастерскую. Через первую человек работает с CLI, через вторую клиент отправляет HTTP-запрос. Двери разные, но правила Planner и файл с задачами должны оставаться общими."}
        </p>
        <CodeBlock
          caption={"два интерфейса одного проекта"}
          code={"CLI → PlannerService → JsonStorage → data/tasks.json\n" +
            "HTTP → FastAPI → app.state.planner → JsonStorage → тот же файл"}
        />
        <p>
          {"Здесь есть важное уточнение: CLI и Uvicorn работают в разных процессах, поэтому это не один и тот же Python-объект в памяти. Каждый вход собирает свой PlannerService, но оба используют готовый путь к одному JSON-файлу. Так проект не раздваивается на две независимые копии."}
        </p>
        <figure className="lesson-infographic lesson-infographic--lesson53">
          <picture>
            <source media="(max-width: 640px)" srcSet={lesson53ReadModelMobile} />
            <img
              src={lesson53ReadModelInfographic}
              alt="CLI и FastAPI используют отдельные экземпляры PlannerService и JsonStorage, настроенные на один файл data/tasks.json. GET-маршруты читают сохранённое состояние."
              width={1680}
              height={840}
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
          prompt={"Расставьте путь сохранения новой задачи в правильном порядке."}
          pieces={[
            { id: "command", code: "CLI получает команду добавить задачу" },
            { id: "service", code: "PlannerService применяет правило проекта" },
            { id: "storage", code: "JsonStorage сохраняет состояние" },
            { id: "file", code: "обновлённый JSON остаётся на диске" },
          ]}
          correctOrder={["command", "service", "storage", "file"]}
          explanation={"CLI не пишет файл собственной логикой. Команда проходит через готовый сервис и его хранилище, поэтому правила и формат остаются общими."}
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
          fix={"Оставьте в app.state сам PlannerService, а свежий list_tasks вызывайте внутри обработчика каждого GET."}
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
        <CodeBlock
          caption={"внутренний объект и ответ клиенту"}
          code={"Task: id, title, priority, is_done, tags\n" +
            "API:   id, title, priority, is_done"}
        />
        <MatchPairs
          prompt={"Определите, что относится к публичному ответу Planner API."}
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
          {"Числа в примере только показывают преобразование. В проекте они зависят от задач, которые ученик добавил через CLI. Если маршрут начнёт обходить список отдельно, два ответа со временем могут разойтись."}
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
          {"Проверяйте не только тело ответа. Сверьте статус, JSON-форму и фактические данные с CLI. Затем добавьте или завершите задачу через CLI и запросите API ещё раз: новая версия должна появиться без ручной правки Python-списка."}
        </p>
      </Section>

      <Section number="06" title={"Перед тем как открывать практику"}>
        <Lead>
          {"Попробуйте объяснить путь данных без подсказки: от команды CLI или HTTP-запроса до сохранённого состояния и ответа."}
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
        </div>
        <p>
          {"В следующем занятии адрес выберет одну конкретную задачу. Для этого пригодится список с реальными id, который здесь читается из того же хранилища."}
        </p>
        <KeyTakeaways
          points={[
            <>{"CLI и API продолжают один Planner, а не две копии проекта."}</>,
            <>{"У разных процессов своя память, но JsonStorage использует общий файл."}</>,
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
          {"В первом задании через готовый CLI добавим задачи в рабочий JSON и зафиксируем реальные id и статистику. Во втором расширим app/api.py: GET /tasks вернёт четыре публичных поля, а GET /stats покажет готовую статистику Planner под именами HTTP-контракта."}
        </p>
        <LinkedNotes items={[
          { title: "Один проект", description: "Продолжаем Planner с его CLI, PlannerService и JsonStorage." },
          { title: "Один источник", description: "CLI и Uvicorn используют настроенный путь к одному data/tasks.json." },
          { title: "Два чтения", description: "GET /tasks показывает коллекцию, GET /stats показывает сводку сервиса." },
          { title: "Проверка результата", description: "Сравниваем ответы с CLI, повторяем чтения после изменений и перезапуска." },
        ]} />
        <p>
          {"Мы не создаём новую модель, storage или временный список. Health и CLI остаются рабочими. Сохранённые запросы для Planner дополняются отдельно от запросов к Echo."}
        </p>
        <PracticeCta text={"Подготовьте реальные данные через CLI и подключите два GET-маршрута к тому же PlannerService и JSON-файлу."} />
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
      <TheoryBridge lesson={54} />

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
          {"Id не равен номеру строки. После сортировки задача может переместиться, но её id остаётся прежним. Именно поэтому ссылка на /tasks/17 продолжает указывать на одну и ту же запись."}
        </p>
        <MatchPairs
          prompt={"Соедините адрес с тем, что просит клиент."}
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
          prompt={"Расставьте этапы для GET /books/17."}
          pieces={[
            { id: "extract", code: "FastAPI извлекает значение из {book_id}" },
            { id: "validate", code: "проверяет, что значение подходит типу int" },
            { id: "call", code: "вызывает функцию с числом 17" },
          ]}
          correctOrder={["extract", "validate", "call"]}
          explanation={"Значение сначала извлекается, затем проверяется. Только после успешного разбора вызывается обработчик."}
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
          fix={"Оставьте task_id: int. Для неизвестного числового id обработайте отдельный результат сервиса в маршруте."}
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
          caption={"пока рассматриваем успешный путь"}
          code={"@app.get(\"/tasks/{task_id}\")\n" +
            "def read_task(task_id: int):\n" +
            "    task = app.state.planner.get_task(task_id)\n" +
            "    return {\n" +
            "        \"id\": task.id,\n" +
            "        \"title\": task.title,\n" +
            "        \"priority\": task.priority,\n" +
            "        \"is_done\": task.is_done,\n" +
            "    }"}
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
          {"HTTPException это исключение FastAPI со статусом и описанием ошибки. Когда маршрут поднимает его через raise, FastAPI прекращает обычный путь обработчика и формирует HTTP-ответ для клиента."}
        </p>
        <CodeBlock
          caption={"узкое преобразование ошибки на HTTP-границе"}
          code={"try:\n" +
            "    task = app.state.planner.get_task(task_id)\n" +
            "except TaskNotFoundError as error:\n" +
            "    raise HTTPException(\n" +
            "        status_code=404,\n" +
            "        detail=\"Task not found\",\n" +
            "    ) from error"}
        />
        <p>
          {"Не перехватывайте общий Exception. Например, ошибка чтения повреждённого JSON не означает, что запрошенного id нет. Если скрыть её как 404, клиент и разработчик получат неверную причину сбоя."}
        </p>
        <BugHunt
          code={"try:\n" +
            "    task = app.state.planner.get_task(task_id)\n" +
            "except TaskNotFoundError:\n" +
            "    raise HTTPException(status_code=422, detail=\"Task not found\")"}
          question={"В GET /tasks/999 нет задачи с таким числовым id. Где ошибка?"}
          options={[
            "Исключение нужно ловить только для TaskNotFoundError",
            "Отсутствующий ресурс должен дать 404, а не 422",
            "Нужно перехватить все исключения",
          ]}
          correctIndex={1}
          explanation={"Значение 999 прошло проверку типа, но ресурс отсутствует. 422 относится к недопустимому входному значению, а не к отсутствующей записи."}
          fix={"Поменяйте status_code на 404 и сохраните detail Task not found. Не расширяйте except."}
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
            code: "{\"id\": task.id, \"title\": task.title, \"priority\": task.priority, \"is_done\": task.is_done}",
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
          {"GET только читает. Не вызывайте save и не меняйте Task внутри запроса. Повторное чтение не должно менять JSON или статистику Planner."}
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
              height={836}
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
          {"Сначала добавим GET /tasks/{task_id} в app/api.py. Path-параметр попадёт в готовый app.state.planner.get_task(task_id), а ответ будет содержать согласованные публичные поля Task."}
        </p>
        <p>
          {"Затем проверим существующий id из GET /tasks, отсутствующий целый id и abc. Вы увидите три результата: 200, 404 и 422. После чтения повторно сравните список, статистику и рабочий JSON. Запросы останутся в уже существующей Planner collection."}
        </p>
        <Callout tone="info">
          <strong>Граница работы.</strong> Мы не создаём второй список задач, не пишем новый поиск и не меняем хранилище. Мы добавляем только HTTP-маршрут к уже готовой операции.
        </Callout>
        <PracticeCta text={"Добавьте GET /tasks/{task_id}, подключите его к PlannerService и проверьте найденную задачу, 404, 422 и сохранность данных."} />
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
      <TheoryBridge lesson={55} />

      <Section number="01" title={"Path выбирает объект, query настраивает список"}>
        <Lead>{"В прошлом занятии GET /tasks/{task_id} выбирал одну задачу по id. Сам GET /tasks возвращает коллекцию. Query-параметры позволяют уточнить, какой вид этой коллекции нужен клиенту."}</Lead>
        <p>{"Сравните адреса. /tasks/7 указывает на одну запись. /tasks?is_done=false остаётся адресом списка, но просит показать только невыполненные задачи. Отдельный маршрут для каждой комбинации условий не нужен."}</p>
        <CodeBlock caption={"Настройки после вопросительного знака"} code={"GET /tasks?is_done=false&sort_desc=true&limit=10"} />
        <p>{"После ? записываются пары «имя=значение», а несколько пар разделяются символом &. Их порядок в URL не задаёт порядок работы сервера. Адрес limit=10&is_done=false передаёт те же условия."}</p>
        <MatchPairs
          prompt={"Сопоставьте адрес с тем, что он выбирает."}
          leftTitle={"Адрес"}
          rightTitle={"Результат"}
          pairs={[
            { left: "GET /tasks", right: "Все задачи как список" },
            { left: "GET /tasks/7", right: "Одна задача с id 7" },
            { left: "GET /tasks?is_done=false", right: "Список невыполненных задач" },
          ]}
          explanation={"Число в path обозначает конкретный ресурс. Query добавляет условия к чтению коллекции."}
        />
        <p>{"Фильтр, сортировка и limit меняют только ответ текущего GET. Это не команды удалить записи, переставить задачи в файле или сохранить новый порядок."}</p>
      </Section>

      <Section number="02" title={"У фильтра три состояния"}>
        <Lead>{"У параметра is_done есть важное отличие от обычного переключателя. Кроме true и false есть отсутствие условия."}</Lead>
        <LinkedNotes variant="connected" items={[
          { title: "Параметр не передан", description: "FastAPI передаёт None. Покажите задачи обоих статусов." },
          { title: "is_done=true", description: "Значение True. Оставьте завершённые задачи." },
          { title: "is_done=false", description: "Значение False. Оставьте открытые задачи." },
        ]} />
        <p>{"В URL значения выглядят как текст. FastAPI преобразует true и false в Python bool. Если параметр не указан, значение по умолчанию None. Значит, условие в сервисе должно проверять именно наличие значения."}</p>
        <CodeBlock caption={"None означает отсутствие фильтра"} code={"if is_done is not None:\n    tasks = [task for task in tasks if task.is_done == is_done]"} />
        <FillBlank
          prompt={"Как проверить, что фильтр передан, не потеряв значение False?"}
          before={"if is_done "}
          after={" None:\n    # применить фильтр"}
          options={["==", "is not", "or"]}
          answer={"is not"}
          explanation={"Проверка на None отличает отсутствие параметра от явного False. Запрос is_done=false остаётся фильтром."}
        />
        <BugHunt
          code={"if is_done:\n    tasks = [task for task in tasks if task.is_done == is_done]"}
          question={"Что произойдёт при запросе ?is_done=false?"}
          options={["False пропустит условие, и вернётся весь список", "Python превратит False в None", "Сервис вернёт 404"]}
          correctIndex={0}
          explanation={"Обычная проверка truthy/falsy смешивает False с отсутствием значения. Для необязательного фильтра проверяют is not None."}
          fix={"Замените if is_done на if is_done is not None, чтобы False тоже запускало фильтр."}
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
          prompt={"Расположите этапы для GET /books?limit=12."}
          pieces={[
            { id: "text", code: "URL содержит текст limit=12" },
            { id: "parse", code: "FastAPI преобразует значение в int и проверяет Query" },
            { id: "call", code: "маршрут получает limit=12" },
          ]}
          correctOrder={["text", "parse", "call"]}
          explanation={"До вызова endpoint значение разбирается и проверяется. При ошибке преобразования или границы цепочка останавливается раньше."}
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
        <p>{"Сначала оставьте подходящие задачи. Потом расположите их по id. И только в конце возьмите первые limit элементов. Например, в книжном магазине сначала выбирают книги нужного жанра, затем ставят их по году, а потом берут первые три. Если ограничить каталог до фильтра, подходящие книги могут не попасть в ответ."}</p>
        <figure className="lesson-infographic">
          <img
            src={queryPipelineInfographic}
            alt="Список задач с id 5, 2, 4, 1, 3. Фильтр is_done=false оставляет 5, 4 и 1. Сортировка по id по возрастанию даёт 1, 4, 5. limit=2 возвращает 1 и 4, а исходный список остаётся неизменным."
            width={1672}
            height={836}
            loading="lazy"
            decoding="async"
          />
          <figcaption>{"Отбор идёт до сортировки, limit применяется последним. Исходная коллекция и файл не перестраиваются."}</figcaption>
        </figure>
        <CodeSequence
          title={"Соберите порядок подготовки списка"}
          prompt={"Клиент просит только открытые задачи по id от меньшего к большему, не больше пяти."}
          pieces={[
            { id: "filter", code: "оставить задачи с is_done=False" },
            { id: "sort", code: "упорядочить результат по id" },
            { id: "limit", code: "взять первые пять задач" },
            { id: "save", code: "записать новый порядок в JSON" },
          ]}
          correctOrder={["filter", "sort", "limit"]}
          explanation={"Фильтр и сортировка формируют только ответ. GET не должен сохранять порядок и менять исходные записи."}
        />
        <BugHunt
          code={"tasks = tasks[:limit]\ntasks = [task for task in tasks if task.is_done is False]\ntasks = sorted(tasks, key=lambda task: task.id)"}
          question={"Почему при таком порядке открытая задача может не попасть в ответ?"}
          options={["limit убрал часть исходного списка до фильтра", "sorted не умеет работать с id", "Фильтр False всегда возвращает пустой список"]}
          correctIndex={0}
          explanation={"Сначала ограничение обрезало список. Нужные записи могли находиться за его границей. Сначала фильтруют, затем сортируют и ограничивают."}
          fix={"Перенесите срез в конец цепочки: filter → sort → limit."}
        />
      </Section>

      <Section number="05" title={"Сервис готовит данные, маршрут отвечает клиенту"}>
        <Lead>{"Новый query не должен создавать второй источник задач или копировать бизнес-логику внутрь FastAPI."}</Lead>
        <LinkedNotes variant="connected" items={[
          { title: "PlannerService", description: "Берёт актуальный список через уже существующий list_tasks и готовит выборку." },
          { title: "FastAPI-маршрут", description: "Принимает проверенные query и передаёт их сервису." },
          { title: "HTTP-ответ", description: "Показывает выбранные задачи в уже принятой проекции: id, title, priority, is_done." },
        ]} />
        <p>{"Для новой операции сервиса подойдёт имя select_tasks. Его limit может быть None, то есть без ограничения. Это полезное разделение: HTTP задаёт свой default 10, а готовый list_tasks для CLI остаётся полным. Не переносите HTTP-дефолт в общий метод списка."}</p>
        <p>{"Для сортировки используйте новый список, который возвращает sorted, а не метод sort на исходном списке. Сами Task при этом не нужно копировать, если маршрут только читает их поля и не меняет объекты. Срез тоже формирует новый список. Ни одна из этих операций не вызывает сохранение."}</p>
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
        <p>{"В Planner collection проверим реальные открытые и завершённые задачи, обе стороны сортировки, limit=1 и limit=50, а также неверные значения. Для итоговой сверки сравним полный CLI-список, чтение одной задачи, GET /stats и сохранённый JSON. Запросы должны менять только состав ответа."}</p>
        <Callout tone="info">
          <strong>За пределами практики.</strong>{" Не добавляем новые маршруты, хранилища, поля, произвольную сортировку или постраничную навигацию. GET /tasks остаётся тем же адресом."}
        </Callout>
        <PracticeCta text={"Добавьте выборку в PlannerService, подключите проверенные query к существующему GET /tasks и подтвердите, что CLI, статистика и JSON не изменились."} />
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
      <TheoryBridge lesson={56} />

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
          {"Сравните это с GET из прошлого занятия. Там клиент просил показать уже существующие данные. Здесь он передаёт новые значения. Сервер не должен путать входной JSON с уже созданной Task."}
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
          {"Pydantic BaseModel собирает значения в объект с известными полями. TaskCreate это входная схема создания. Она не заменяет знакомую модель Task и не дублирует все её поля."}
        </p>
        <CodeBlock
          caption={"Что клиент присылает при создании"}
          code={"from pydantic import BaseModel\n\nclass TaskCreate(BaseModel):\n    title: str\n    priority: int"}
        />
        <p>
          {"Поля без значения по умолчанию обязательны. Поэтому title и priority должны прийти в body. Но аннотация int проверяет тип, а не диапазон Planner. Обычный режим Pydantic может преобразовать текст «4» в число 4, а «высокий» разобрать не сможет. Значения 0 и 6 остаются целыми числами, поэтому их уже отклоняет предметное правило Task. Ограничение длины title здесь пока не добавляем."}
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
          prompt={"Какое поле обязательно пришлёт клиент вместе с названием?"}
          before={"class TaskCreate(BaseModel):\n    title: str\n    "}
          options={["priority", "id", "is_done"]}
          answer={"priority"}
          after={": int"}
          explanation={"Клиент сообщает приоритет новой задачи. id и начальный is_done относятся к серверной Task."}
        />
        <CodeBlock
          caption={"До и после разбора"}
          code={"payload = TaskCreate(title=\"Повторить HTTP\", priority=\"4\")\nprint(payload.priority, type(payload.priority).__name__)\n# 4 int"}
        />
        <p>
          {"FastAPI показывает схему TaskCreate и в Swagger UI. Поэтому описание помогает серверу проверить тело, редактору подсказать поля, а человеку увидеть контракт API."}
        </p>
      </Section>

      <Section number="02" title={"Проверка проходит до функции маршрута"}>
        <Lead>
          {"Когда параметр маршрута имеет тип TaskCreate, FastAPI читает из body JSON, Pydantic проверяет его и только после этого передаёт объект обработчику."}
        </Lead>
        <p>
          {"Если обязательного поля нет или значение нельзя разобрать, FastAPI отвечает 422. При таком отказе функция маршрута не запускалась. Значит, она не могла вызвать сервис или изменить файл."}
        </p>
        <CodeBlock
          caption={"Два тела с разными ошибками формы"}
          code={"{\"title\": \"Повторить HTTP\"}\n# Нет обязательного priority → 422 до обработчика\n\n{\"title\": \"Повторить HTTP\", \"priority\": \"высокий\"}\n# Нельзя разобрать int → 422 до обработчика"}
        />
        <CodeSequence
          title={"Проследите проверку запроса"}
          prompt={"Расставьте этапы до входа в функцию маршрута."}
          pieces={[
            { id: "handler", code: "FastAPI вызывает обработчик с TaskCreate" },
            { id: "send", code: "Клиент отправляет JSON body" },
            { id: "read", code: "FastAPI читает тело запроса" },
            { id: "validate", code: "Pydantic проверяет поля и типы" },
          ]}
          correctOrder={["send", "read", "validate", "handler"]}
          explanation={"Обработчик получает уже собранную модель. Если обязательное поле отсутствует, FastAPI остановит запрос до его вызова."}
        />
        <p>
          {"Эта проверка не отвечает на вопрос, подходит ли значение правилам Planner. Она подтверждает только форму и тип. Например, 0 подходит типу int, но нарушает правило диапазона приоритета от 1 до 5."}
        </p>
        <TrueFalse
          statement={<>Если в body нет <code>priority</code>, маршрут получает <code>payload.priority = None</code>.</>}
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
            code: "return payload.model_dump()",
            note: "Получим словарь с входными полями. Сервис и хранилище не вызваны.",
          }}
          right={{
            title: "Вызвать существующий сервис",
            code: "task = app.state.planner.add_task(payload.title, priority=payload.priority)",
            note: "Planner создаёт Task, применяет правила и сохраняет её.",
          }}
          preferred={"right"}
          explanation={"model_dump только представляет поля модели как словарь Python. Для создания нужно передать значения в существующий сценарий Planner."}
        />
      </Section>

      <Section number="04" title={"201 подтверждает настоящее создание"}>
        <Lead>
          {"После успешного add_task маршрут возвращает публичное представление созданной задачи. Статус 201 Created сообщает клиенту, что ресурс появился."}
        </Lead>
        <p>
          {"Успешный маршрут передаёт сервису входные поля, получает готовую Task и возвращает четыре публичных поля. id и начальный is_done назначены сервером. Вызов model_dump не записывает файл, а указание 201 в декораторе само по себе не создаёт ресурс."}
        </p>
        <CodeBlock
          caption={"POST связывает HTTP и готовый PlannerService"}
          code={"from fastapi import HTTPException, status\nfrom pydantic import BaseModel\n\nclass TaskCreate(BaseModel):\n    title: str\n    priority: int\n\n@app.post(\"/tasks\", status_code=status.HTTP_201_CREATED)\ndef create_task(payload: TaskCreate):\n    try:\n        task = app.state.planner.add_task(\n            payload.title, priority=payload.priority\n        )\n    except ValueError as error:\n        raise HTTPException(\n            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,\n            detail=str(error),\n        ) from error\n\n    return {\n        \"id\": task.id,\n        \"title\": task.title,\n        \"priority\": task.priority,\n        \"is_done\": task.is_done,\n    }"}
        />
        <p>
          {"Здесь статус 201 описан в декораторе, но ответ 422 из HTTPException заменит его при ожидаемом отказе Task. Операция записи завершилась до того, как add_task вернул Task, поэтому успешный ответ уже соответствует созданному ресурсу."}
        </p>
        <QuizCard
          question={"Что именно произошло до ответа 201 в этом обработчике?"}
          options={[
            "Только модель превратилась в словарь",
            "Сервис создал Task и вернул её после работы с хранилищем",
            "FastAPI автоматически добавил запись при регистрации маршрута",
          ]}
          correctIndex={1}
          explanation={"201 уместен здесь потому, что маршрут вызывает существующий add_task. Декоратор задаёт статус, а создание и сохранение выполняет сервис."}
        />
      </Section>

      <Section number="05" title={"Не смешивайте ошибки формы и правила Planner"}>
        <Lead>
          {"У запроса есть две независимые проверки. Pydantic проверяет форму и типы. Модель Task проверяет, допустима ли задача по правилам проекта."}
        </Lead>
        <p>
          {"Строка из пробелов является строкой, а 0 является целым числом. Поэтому эти значения проходят простую TaskCreate, но знакомая предметная модель отклоняет их через ValueError. Маршрут переводит только эту ожидаемую ошибку в 422."}
        </p>
        <CodeBlock
          caption={"Узкая обработка ожидаемого отказа"}
          code={"try:\n    task = app.state.planner.add_task(\n        payload.title, priority=payload.priority\n    )\nexcept ValueError as error:\n    raise HTTPException(status_code=422, detail=str(error)) from error"}
        />
        <p>
          {"Не перехватывайте здесь любую Exception. Сбой JSON-файла или ошибка в коде не означает, что клиент прислал плохой запрос. Такие проблемы должны оставаться серверными ошибками, а не маскироваться под 422."}
        </p>
        <BugHunt
          code={"try:\n    task = app.state.planner.add_task(payload.title, payload.priority)\nexcept Exception:\n    raise HTTPException(status_code=422, detail=\"Неверные данные\")"}
          question={"Почему этот обработчик ошибки опасен?"}
          options={[
            "Он поймает и сбой хранилища, и ошибку программы, назвав их ошибкой клиента",
            "FastAPI запрещает использовать try/except внутри маршрута",
            "ValueError нельзя преобразовать в HTTP-ответ",
          ]}
          correctIndex={0}
          explanation={"Широкий except скрывает причину серверного сбоя и сообщает клиенту неверный статус. Здесь ожидаем только ValueError от правил создания Task."}
          fix={"Перехватите только ValueError вокруг app.state.planner.add_task. Остальной код и ошибки хранилища не маскируйте."}
        />
        <LinkedNotes
          items={[
            { title: "Нет priority или текст не число", description: "Pydantic возвращает 422 до запуска маршрута." },
            { title: "Пробельный title или priority вне 1–5", description: "Task поднимает ValueError; маршрут отвечает 422 без сохранения." },
            { title: "Ошибка файла или кода", description: "Не превращаем в ошибку клиента; её должен увидеть сервер." },
          ]}
        />
      </Section>

      <Section number="06" title={"Проверьте запись за пределами ответа"}>
        <Lead>
          {"Успешный JSON показывает ответ одного запроса. Чтобы доказать, что создание прошло через проект, найдите ту же запись другими уже работающими путями."}
        </Lead>
        <p>
          {"Отправьте валидный POST через Swagger UI или Planner collection. В ответе появятся id и is_done. Используйте выданный id для GET одной задачи, затем найдите запись в общем списке и проверьте статистику. CLI и повторный запуск API подтверждают, что все части читают сохранённое состояние."}
        </p>
        <CodeBlock
          caption={"Матрица проверки"}
          code={"POST корректный body       → 201 и новая Task\nPOST без priority            → 422 до маршрута\nPOST priority=\"высокий\"     → 422 до маршрута\nPOST title из пробелов        → 422 от правила Task\nPOST priority=0 или 6         → 422 от правила Task\nGET /tasks, CLI, перезапуск   → одна и та же сохранённая Task"}
        />
        <p>
          {"После любого отказа список и файл остаются прежними. Для неизвестных id и is_done не делаем отдельного контракта: важное доказательство в том, что обработчик передаёт в add_task только title и priority, а сервер возвращает назначенные им поля."}
        </p>
        <RecallCard
          question={"Назовите весь путь валидного запроса от клиента до ответа."}
          answer={<p>{"Клиент отправляет JSON. FastAPI читает body, Pydantic строит TaskCreate, обработчик вызывает app.state.planner.add_task, сервис проверяет Task и сохраняет её через JsonStorage. Маршрут возвращает публичные поля с 201."}</p>}
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
            { title: "Развести отказы", description: "Ошибку формы обрабатывает FastAPI, ValueError от правил Task превращается в 422." },
            { title: "Проверить общий результат", description: "Сверить POST с GET, статистикой, CLI и данными после перезапуска." },
          ]}
        />
        <p>
          {"Начните с входной схемы и проследите одну задачу до JSON-файла. Затем проверьте обе границы отказа: неверную форму body и значение, запрещённое правилами Planner. В следующем блоке мы уточним HTTP-ограничения и форму ответа, а затем подключим обновления к тому же сервису."}
        </p>
        <PracticeCta text={"Создайте TaskCreate и настоящий POST /tasks через PlannerService. Проверьте ответ 201, оба вида отказа 422 и сохранность созданной записи после чтения и перезапуска."} />
      </Section>
    </RichLesson>
  );
}
