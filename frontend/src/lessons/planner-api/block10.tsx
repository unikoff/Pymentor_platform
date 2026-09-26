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
  MatchPairs,
  PracticeCta,
  QuizCard,
  RecallCard,
  RichHero,
  RichLesson,
  Section,
  TrueFalse,
} from "../shared";

type TheoryBridgeData = {
  link: string;
  boundary: string;
};

const BLOCK_TITLE = "Месяц 3 · Блок 10 · Первый FastAPI";

const THEORY_BRIDGES: Record<number, TheoryBridgeData> = {
  51: {
    link: "HTTP-запрос уже знаком как схема. Теперь каждая его часть появляется в отдельном поле реального клиента.",
    boundary: "Postman не является сервером и не исправляет неправильный API. Он только отправляет request и показывает response.",
  },
  52: {
    link: "Postman уже умеет отправлять request, но локального сервера ещё нет. Теперь Python-процесс начнёт слушать localhost.",
    boundary: "FastAPI описывает API, а Uvicorn принимает сетевые requests и вызывает приложение. Это разные роли.",
  },
  53: {
    link: "Первый endpoint подтвердил запуск. Теперь API начинает отдавать реальные данные StudyHub.",
    boundary: "GET описывает чтение и не должен скрыто добавлять, удалять или менять задачи.",
  },
  54: {
    link: "GET /tasks возвращает collection. Теперь клиенту нужен адрес одного конкретного ресурса.",
    boundary: "Path-параметр определяет конкретный ресурс и всегда обязателен.",
  },
  55: {
    link: "Path выбирает конкретную задачу. Query настраивает представление списка, не меняя идентичность resource.",
    boundary: "Query обычно является необязательной настройкой и не заменяет path конкретного объекта.",
  },
  56: {
    link: "GET читает данные. Для POST клиент должен передать форму новой задачи, а серверу нужен явный контракт JSON body.",
    boundary: "Pydantic-модель проверяет входные данные, но не заменяет method, storage или предметные правила.",
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
        intro={"В прошлом блоке мы записали контракт Planner API. Теперь отправим настоящий HTTP request через клиент, увидим response и сохраним два проверяемых сценария, которые позже адаптируем под реальные маршруты нашего API."}
        tags={[
          { icon: <Terminal size={14} />, label: "HTTP-клиент" },
          { icon: <Cloud size={14} />, label: "request → response" },
        ]}
      />
      <TheoryBridge lesson={51} />

      <Section number="00" title={"От контракта к настоящему сообщению"}>
        <Lead>
          {"В прошлом блоке у Planner API появились методы, адреса, входные данные и ожидаемые ответы. Это был договор на бумаге. Теперь мы проверим саму форму HTTP-сообщения руками, пока без собственного сервера."}
        </Lead>
        <p>
          {"Для первого опыта используем Postman Echo. Он принимает request и возвращает сведения о нём. К концу практики у нас будут два сохранённых сценария: GET с query и POST с JSON body. Когда подключим их к Planner, одного изменения base_url будет недостаточно: пути и ожидания тоже должны совпасть с контрактом API."}
        </p>
        <CodeBlock
          caption={"что мы научимся делать"}
          code={"выбрать method и URL\nдобавить query или body\nнажать Send\nпрочитать response\nсохранить сценарий и повторить его"}
        />
        <RecallCard
          question={"Что изменится по сравнению с прошлой работой над контрактом?"}
          answer={<p>{"Мы впервые отправим настоящий HTTP request и получим сетевой response."}</p>}
        />
      </Section>

      <Section number="01" title={"Postman выполняет роль HTTP-клиента"}>
        <Lead>
          {"HTTP-клиент начинает обмен: формирует request и отправляет его серверу. Сервер обрабатывает сообщение и возвращает response. Postman показывает полученный ответ."}
        </Lead>
        <p>
          {"Представьте стойку выдачи заказов и посетителя с бланком. Посетитель передаёт просьбу, стойка возвращает результат. Postman играет роль посетителя и бланка. Он не становится стойкой и не придумывает ответ за сервер."}
        </p>
        <CodeBlock
          caption={"сетевая граница"}
          code={"Postman\n  → HTTP request\n  → сервер\n  ← HTTP response\nPostman показывает ответ"}
        />
        <p>
          {"Postman не является сервером, базой данных или frontend. Он не запускает Planner API и не исправляет ошибки автоматически. Зато он позволяет проверить request независимо от кнопок сайта. Если запрос уже неверен в Postman, искать ошибку в интерфейсе ещё рано."}
        </p>
        <p>
          {"В рабочих проектах API-клиент помогает исследовать endpoint, проверить новый контракт и воспроизвести конкретную проблему. Он дополняет автоматические тесты, которые повторяют проверки без ручных действий."}
        </p>
        <MatchPairs
          prompt={"Соедините роль с участником обмена."}
          leftTitle={"Участник"}
          rightTitle={"Ответственность"}
          pairs={[
            { left: "Postman", right: "собирает и отправляет request" },
            { left: "Echo", right: "принимает request и возвращает response" },
            { left: "разработчик", right: "сравнивает результат с ожиданием" },
          ]}
          explanation={"Клиент инициирует обмен, сервер отвечает, а человек анализирует результат."}
        />
        <CompareSolutions
          question={"Какой вывод точнее после успешного Send?"}
          left={{
            title: "Слишком широкий",
            code: "Planner API работает",
            note: "Запрос ушёл на Echo, а не на наш API.",
          }}
          right={{
            title: "Подтверждённый",
            code: "Echo получил request и вернул response",
            note: "Именно этот результат наблюдался.",
          }}
          preferred={"right"}
          explanation={"Вывод должен соответствовать системе, на которую реально отправлен запрос."}
        />
      </Section>

      <Section number="02" title={"Собираем request из видимых частей"}>
        <Lead>
          {"Рабочая область Postman показывает отдельные поля одного HTTP-сообщения. Расположение вкладок может меняться между версиями, но роли частей остаются прежними."}
        </Lead>
        <div className="lesson-practice-steps">
          <h3>Method и URL</h3>
          <p>{"Метод выражает действие, адрес показывает, куда отправить request."}</p>
          <h3>Params и Headers</h3>
          <p>{"Params добавляет query к URL. Headers передаёт метаданные, например формат body."}</p>
          <h3>Body и Scripts</h3>
          <p>{"Body содержит отправляемые данные. Scripts позволяет проверять ответ после обмена."}</p>
          <h3>Send и Response</h3>
          <p>{"Send запускает отправку. Response показывает status, headers и body, которые вернул сервер."}</p>
        </div>
        <CodeBlock
          caption={"части request и response"}
          code={"REQUEST\nmethod + URL + Params + Headers + Body\n                     ↓ Send\n                    сервер\n                     ↓\nRESPONSE\nstatus + Headers + Body"}
        />
        <TrueFalse
          statement={<>{"Изменение полей в Postman уже отправляет сообщение серверу."}</>}
          isTrue={false}
          explanation={"Пока не нажата Send, в рабочей области меняется черновик request. Сервер ещё ничего не получил."}
        />
        <Callout tone="info">
          {"Не смешивайте вкладку Body, которая относится к исходящему request, с response body, который вернул сервер."}
        </Callout>
      </Section>

      <Section number="03" title={"Первый GET к Postman Echo"}>
        <Lead>
          {"Echo-сервис нужен, чтобы учиться работать с клиентом без подключения к реальному API. Он возвращает JSON со сведениями о полученном запросе и не требует ключей Planner."}
        </Lead>
        <CodeBlock
          caption={"первый request"}
          code={"GET https://postman-echo.com/get"}
        />
        <p>
          {"Адрес состоит из схемы https, host postman-echo.com и path /get. После Send Postman показывает HTTP response. В успешном примере Echo возвращает status 200, JSON body и URL, по которому получил request."}
        </p>
        <CodeBlock
          caption={"упрощённый ответ"}
          code={'{\n  "args": {},\n  "url": "https://postman-echo.com/get"\n}'}
        />
        <p>
          {"Это не ответ Planner и не созданная Task. Echo только показывает, что принял. Даже status 200 не доказывает ничего о нашем будущем сервере."}
        </p>
        <BugHunt
          code={"https://postman-echo.invalid/get"}
          question={"Что вероятнее всего произойдёт при опечатке в host?"}
          options={[
            "Echo вернёт обычный status 404",
            "Postman не сможет получить HTTP response от нужного host",
            "Postman автоматически исправит домен",
          ]}
          correctIndex={1}
          explanation={"При неправильном host соединение может не дойти до HTTP endpoint. Тогда status от ожидаемого сервера неоткуда получить."}
          fix={"Проверьте host и повторите GET к https://postman-echo.com/get"}
        />
        <p>
          {"Если сервер вернул 404, response существует и его можно изучить. Если ответ вообще не получен, status может отсутствовать. Это две разные ситуации диагностики."}
        </p>
      </Section>

      <Section number="04" title={"Передаём query через Params"}>
        <Lead>
          {"Query настраивает чтение через URL. Например, он может задать фильтр или ограничить размер списка. В Postman пары удобно вводить в таблицу Params, а не собирать строку вручную."}
        </Lead>
        <CodeBlock
          caption={"один URL и две query-пары"}
          code={"GET https://postman-echo.com/get?course=python&block=10"}
        />
        <p>
          {"Знак вопроса начинает query-часть URL, а амперсанд разделяет пары. В таблицу Params добавьте ключи course и block и соответствующие значения. Echo отразит их в объекте args."}
        </p>
        <CodeBlock
          caption={"фрагмент response"}
          code={'{\n  "args": {\n    "course": "python",\n    "block": "10"\n  }\n}'}
        />
        <p>
          {"Значения URL передаются как текст. Позже сервер может преобразовать block в число и проверить границы. Сам Postman не знает тип параметра, он отправляет настроенную пару."}
        </p>
        <FillBlank
          prompt={"Куда попадёт значение limit=5, если добавить его в Params?"}
          before={"Params → "}
          after={""}
          options={["query в URL", "request body", "response body"]}
          answer={"query в URL"}
          explanation={"Params формирует query-часть URL. Body и response body выполняют другие роли."}
        />
        <Callout tone="warn">
          {"Не передавайте пароли и приватные токены в query. URL может попадать в историю, логи и диагностические записи."}
        </Callout>
      </Section>

      <Section number="05" title={"Отправляем JSON в POST body"}>
        <Lead>
          {"GET из предыдущей части не переносил данные новой задачи. Теперь соберём POST и передадим JSON в body. Echo вернёт тело обратно, но не создаст Task."}
        </Lead>
        <CodeBlock
          caption={"body будущей задачи"}
          code={'{\n  "title": "Изучить HTTP",\n  "priority": 4\n}'}
        />
        <p>
          {"В Postman выберите POST, откройте Body, используйте raw и задайте формат JSON. Postman автоматически добавит Content-Type: application/json. Проверьте заголовок request, но не добавляйте такой же вручную. Имена полей и текстовые значения JSON пишутся в двойных кавычках. Число priority записывается без кавычек."}
        </p>
        <p>
          {"Content-Type описывает формат отправленного body. Accept сообщает, какой формат ответа предпочитает клиент. Это разные заголовки. В нашем примере Content-Type должен указывать на JSON."}
        </p>
        <CodeBlock
          caption={"что вернёт Echo"}
          code={'{\n  "json": {\n    "title": "Изучить HTTP",\n    "priority": 4\n  }\n}'}
        />
        <CompareSolutions
          question={"Где передать поля создаваемой Task в контракте Planner?"}
          left={{
            title: "Query",
            code: "?title=Изучить+HTTP",
            note: "Query обычно настраивает чтение или выборку.",
          }}
          right={{
            title: "JSON body",
            code: '{"title": "Изучить HTTP", "priority": 4}',
            note: "Body переносит данные нового resource.",
          }}
          preferred={"right"}
          explanation={"В контракте создания body описывает данные Task. Echo лишь отражает их и не сохраняет."}
        />
        <Callout tone="info">
          {"Status 200 относится к обработке тестового запроса Echo. Он не равен ожидаемому статусу создания задачи в Planner API."}
        </Callout>
      </Section>

      <Section number="06" title={"Читаем response и добавляем проверки"}>
        <Lead>
          {"Сначала изучите сам response, затем решите, какие ожидания стоит проверять автоматически. Status, headers и body отвечают на разные вопросы."}
        </Lead>
        <CodeSequence
          title={"Порядок чтения ответа"}
          prompt={"Соберите маршрут от отправки до проверки результата."}
          pieces={[
            { id: "send", code: "нажать Send" },
            { id: "response", code: "получить HTTP response" },
            { id: "inspect", code: "прочитать status, Content-Type и body" },
            { id: "script", code: "выполнить post-response script" },
            { id: "results", code: "посмотреть Test Results" },
          ]}
          correctOrder={["send", "response", "inspect", "script", "results"]}
          explanation={"Скрипт получает уже пришедший ответ. Он не заменяет сам HTTP request."}
        />
        <p>
          {"Status 200 подтверждает успешный сценарий на Echo, но не проверяет, вернулось ли ожидаемое поле. Для этого Postman может выполнить JavaScript после response. Результат называется тестом и отображается отдельно."}
        </p>
        <CodeBlock
          caption={"проверка query-поля после ответа"}
          code={"const responseData = pm.response.json();\n\npm.test(\"Echo вернул course\", function () {\n  pm.expect(responseData.args.course).to.eql(\"python\");\n});"}
        />
        <p>
          {"pm.response.json() читает JSON body. Затем мы обращаемся к args.course. pm.test задаёт именованную проверку, а pm.expect сравнивает фактическое значение с ожидаемым. В practice такая проверка будет применена к GET и POST."}
        </p>
        <TrueFalse
          statement={<>{"Зелёный status 200 сам по себе доказывает, что Echo получил нужный title."}</>}
          isTrue={false}
          explanation={"Status проверяет исход HTTP-обмена. Значение title нужно проверить отдельно в response body."}
        />
        <QuizCard
          question={"Что делать, если Test Results показывает failed?"}
          options={[
            "Сначала сравнить ожидание с фактическим response",
            "Изменить ожидаемое значение, чтобы тест стал зелёным",
            "Удалить response body",
          ]}
          correctIndex={0}
          explanation={"Проверьте request, фактическое значение и само условие. Не скрывайте несоответствие изменением ожидания без причины."}
        />
        <Callout tone="info">
          {"Postman tests наблюдают реальный ответ внешнего сервиса. Они не заменяют unit-тесты Python, которые позже проверят внутреннюю логику Planner."}
        </Callout>
      </Section>

      <Section number="07" title={"Сохраняем сценарии в collection и environment"}>
        <Lead>
          {"Один request годится для эксперимента. Сохранённые сценарии можно повторить, перенести и использовать для ручных проверок после изменений."}
        </Lead>
        <p>
          {"Collection группирует requests и их post-response checks. Дайте запросам имена, по которым сразу понятно действие: чтение query или отправка JSON."}
        </p>
        <p>
          {"Environment хранит значения, связанные с выбранным адресом сервера. Переменная base_url позволяет не повторять host в каждом URL. В активном окружении Postman подставляет значение переменной в двойных фигурных скобках. Она меняет только базовую часть адреса, но не path, body или проверки. Поэтому Echo-запросы /get и /post нельзя превратить в запросы Planner одной подстановкой другого base_url."}
        </p>
        <CodeBlock
          caption={"адрес можно заменить отдельно"}
          code={"Environment Echo:\nbase_url = https://postman-echo.com\n\nRequest URL:\n{{base_url}}/get"}
        />
        <MatchPairs
          prompt={"Сопоставьте место хранения с его содержимым."}
          leftTitle={"Объект Postman"}
          rightTitle={"Что хранит"}
          pairs={[
            { left: "Collection", right: "requests и их проверки" },
            { left: "Environment", right: "значения выбранной цели, например base_url" },
          ]}
          explanation={"Collection описывает набор сценариев. Environment задаёт значения для выбранного сервера."}
        />
        <p>
          {"Экспорт превращает collection и environment в переносимые JSON-файлы. Их можно импортировать в другой экземпляр Postman. Экспортируйте оба объекта: request использует переменную окружения, поэтому одному файлу без другого может не хватить base_url."}
        </p>
        <p>
          {"Отправить запрос через Lightweight API Client можно без аккаунта. Но для сохранения collection и environment в рабочей области и их последующего экспорта в этой практике нужно войти в личный Postman workspace. Это вход в инструмент, а не авторизация на Echo: самому Echo ключи и credentials не нужны."}
        </p>
        <p>
          {"Не сохраняйте в общем экспорте пароли, токены и реальные персональные данные. Для учебной Echo-коллекции credentials не нужны."}
        </p>
        <Callout tone="info">
          <p>{"Официальные пояснения: "}<a href="https://learning.postman.com/docs/getting-started/quick-start" target="_blank" rel="noreferrer">quick start</a>{", "}<a href="https://learning.postman.com/docs/developer/echo-api" target="_blank" rel="noreferrer">Postman Echo</a>{", "}<a href="https://learning.postman.com/docs/tests-and-scripts/write-scripts/test-scripts" target="_blank" rel="noreferrer">post-response tests</a>{" и "}<a href="https://learning.postman.com/docs/getting-started/importing-and-exporting/exporting-data" target="_blank" rel="noreferrer">export</a>{"."}</p>
        </Callout>
      </Section>

      <Section number="08" title={"Что мы будем делать в практике"}>
        <Lead>
          {"Сначала подготовим studyhub-api/postman в своей учебной папке. Это только место для файлов, не исходники платформы и пока не приложение. Затем создадим collection StudyHub HTTP Lab и environment Echo с базовым URL."}
        </Lead>
        <CodeBlock
          caption={"файлы после экспорта"}
          code={"studyhub-api/\n" +
            "└── postman/\n" +
            "    ├── http-lab.collection.json\n" +
            "    └── echo.environment.json"}
        />
        <p>
          {"Затем сохраним GET с query-параметрами и POST с JSON body. Для обоих сценариев добавим проверки status, а для данных проверим, что Echo действительно вернул ожидаемые значения."}
        </p>
        <div className="lesson-practice-steps">
          <h3>Роли</h3>
          <p>{"Postman отправляет request, Echo возвращает response, тест сравнивает ответ с ожиданием."}</p>
          <h3>Путь</h3>
          <p>{"Подготовить папку проекта, создать collection и environment, добавить два request, изучить ответы, добавить checks и экспортировать файлы в studyhub-api/postman/."}</p>
          <h3>Доказательство</h3>
          <p>{"Оба сценария повторно запускаются, проверки проходят, JSON-экспорт содержит collection и environment."}</p>
          <h3>Граница</h3>
          <p>{"Echo не является Planner API. Практика не создаёт задачу, не запускает FastAPI и не требует credentials."}</p>
        </div>
        <PracticeCta text={"Создайте studyhub-api/postman/, настройте collection StudyHub HTTP Lab и environment Echo, сохраните GET и POST с проверками, затем экспортируйте http-lab.collection.json и echo.environment.json в эту папку."} />
      </Section>

      <Section number="09" title={"Самопроверка перед следующим занятием"}>
        <Lead>
          {"Перед завершением объясните каждый шаг без подсказки. Если ответ звучит как «Postman сам всё проверил», уточните, какой именно request и какое ожидание вы задали."}
        </Lead>
        <MatchPairs
          prompt={"Повторите назначение частей и объектов."}
          leftTitle={"Термин"}
          rightTitle={"Короткий смысл"}
          pairs={[
            { left: "Params", right: "query в URL" },
            { left: "Body", right: "данные исходящего request" },
            { left: "Collection", right: "сохранённые сценарии" },
            { left: "Environment", right: "значения для выбранного адреса" },
          ]}
          explanation={"Разные части сохраняют разные роли даже в окне одного клиента."}
        />
        <QuizCard
          question={"Что означает ответ Echo со status 200?"}
          options={[
            "Echo вернул успешный response на этот request",
            "Planner сохранил новую Task",
            "Все будущие endpoint уже протестированы",
          ]}
          correctIndex={0}
          explanation={"Подтверждён только ответ сервиса, на который действительно отправили request."}
        />
        <KeyTakeaways
          points={[
            <>{"Postman является HTTP-клиентом."}</>,
            <>{"Params формирует query, Body переносит данные request."}</>,
            <>{"Echo отражает полученный запрос, но не создаёт Task."}</>,
            <>{"Status и содержимое body проверяются отдельно."}</>,
            <>{"Collection сохраняет сценарии, Environment хранит base_url."}</>,
            <>{"Следующая работа создаст сервер; Echo-запросы подключим к Planner позже, после адаптации под его маршруты."}</>,
          ]}
        />
        <p>
          {"В следующей работе мы поднимем собственный сервер и проверим GET /health через браузер и Swagger UI. Экспорты Postman останутся в studyhub-api/postman без изменений. Позже, когда у Planner появятся подходящие маршруты, мы адаптируем пути и ожидания запросов, а затем направим их на локальный сервер через base_url."}
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
        intro={"В прошлой работе мы отправляли запросы через Postman Echo и сохранили collection с environment в studyhub-api/postman. Теперь продолжим тот же проект, добавим FastAPI-сервер и проверим его через браузер и Swagger UI."}
        tags={[
          { icon: <Wrench size={14} />, label: "FastAPI + Uvicorn" },
          { icon: <Cloud size={14} />, label: "GET /health" },
        ]}
      />
      <TheoryBridge lesson={52} />

      <Section number="00" title={"Из клиента теперь виден сервер"}>
        <Lead>
          {"HTTP-клиент уже умеет отправлять request. Теперь разберём, что должно работать на другой стороне, чтобы Python смог ответить."}
        </Lead>
        <p>
          {"В прошлой работе мы проверяли сообщения через Postman Echo. Файлы collection и environment уже лежат в studyhub-api/postman. Мы видели request и response, но не создавали программу-сервер. Теперь у StudyHub появится локальное приложение с одним маршрутом GET /health. Сохранённые пути /get и /post относятся к Echo, поэтому старые запросы пока не направляем на локальный сервер."}
        </p>
        <p>
          {"В этой цепочке FastAPI описывает приложение и маршруты. Uvicorn запускает приложение как HTTP-сервер. Браузер, Swagger UI или Postman отправляет запрос и показывает ответ. Представьте меню, кухню и посетителя кафе: меню описывает заказ, кухня выполняет работу, посетитель передаёт заказ и получает результат. Технически FastAPI и Uvicorn общаются через интерфейс ASGI."}
        </p>
        <CodeBlock
          caption={"Части локального URL"}
          code={"URL:    http://127.0.0.1:8000/health\n\n" +
            "scheme: http\n" +
            "host:   127.0.0.1\n" +
            "port:   8000\n" +
            "path:   /health"}
        />
        <RecallCard
          question={"Если в app/main.py есть маршрут, но Uvicorn не запущен, кто слушает порт 8000?"}
          answer={<p>{"Никто. Код маршрута описывает поведение приложения, но отдельный процесс должен запустить сервер и держать порт открытым."}</p>}
        />
        <Callout tone="info">
          {"127.0.0.1 это IPv4 loopback-адрес, который в нашей локальной настройке указывает на эту же машину. Порт 8000 это стандартный порт Uvicorn, если другой не задан. /health должен совпасть с зарегистрированным path. Локальная проверка не публикует приложение в интернете."}
        </Callout>
      </Section>

      <Section number="01" title={"FastAPI создаёт приложение, но не запускает его"}>
        <Lead>
          {"FastAPI это Python-фреймворк для описания HTTP API. Мы создаём объект приложения, к которому затем добавим маршруты."}
        </Lead>
        <p>
          {"Класс FastAPI предоставляет готовые механизмы, а конкретное поведение задаём мы. Вызов FastAPI(...) создаёт экземпляр. Переменная app станет местом, где приложение собирается и где регистрируются endpoint."}
        </p>
        <CodeBlock
          caption={"Объект приложения"}
          code={"from fastapi import FastAPI\n\n" +
            "app = FastAPI(title=\"StudyHub Planner API\")"}
        />
        <p>
          {"Параметр title даёт API понятное название. Он не меняет URL и не задаёт бизнес-логику. Вызов FastAPI() также не открывает сетевой порт: для этого позднее запустим сервер."}
        </p>
        <TrueFalse
          statement={<>{"После выполнения app = FastAPI() Python уже принимает запросы на порту 8000."}</>}
          isTrue={false}
          explanation={"Создан только объект приложения. Сетевой сервер и открытый порт появятся после запуска Uvicorn."}
        />
        <Callout tone="info">
          {"Объект app и работающий процесс сервера связаны, но это не одно и то же."}
        </Callout>
      </Section>

      <Section number="02" title={"Endpoint связывает method, path и функцию"}>
        <Lead>
          {"Маршрут описывает, какую функцию вызвать для конкретной пары HTTP-метода и path."}
        </Lead>
        <p>
          {"Endpoint, или маршрут, определяется не одним адресом. GET /status и POST /status являются разными операциями. Декоратор @app.get(\"/status\") регистрирует обработчик для GET по этому path."}
        </p>
        <p>
          {"Декоратор в Python получает функцию и связывает с ней дополнительную информацию. Здесь FastAPI сохраняет правило маршрутизации. Функция ниже не выполняется сразу при чтении файла. FastAPI вызовет её после подходящего request."}
        </p>
        <CodeBlock
          caption={"Независимый пример"}
          code={"from fastapi import FastAPI\n\n" +
            "app = FastAPI()\n\n" +
            "@app.get(\"/status\")\n" +
            "def read_status():\n" +
            "    return {\"service\": \"notifications\", \"active\": True}"}
        />
        <MatchPairs
          prompt={"Соедините часть маршрута с её ролью."}
          leftTitle={"Часть"}
          rightTitle={"Роль"}
          pairs={[
            { left: "@app.get(\"/status\")", right: "Регистрирует GET и path" },
            { left: "def read_status():", right: "Объявляет функцию-обработчик" },
            { left: "return {...}", right: "Задаёт данные ответа" },
          ]}
          explanation={"Метод и path выбирают функцию, а возвращаемое значение задаёт результат её работы."}
        />
        <p>
          {"Если method или path не совпал с зарегистрированным маршрутом, эта функция не будет обработчиком запроса. GET /unknown обычно даст 404, потому что path не зарегистрирован. Если path существует, но для него объявлен только GET, запрос POST вернёт 405 Method Not Allowed."}
        </p>
      </Section>

      <Section number="03" title={"Python-значение становится HTTP-ответом"}>
        <Lead>
          {"Endpoint возвращает значение Python. FastAPI формирует из него HTTP response, а Uvicorn передаёт ответ клиенту."}
        </Lead>
        <p>
          {"Например, функция может вернуть словарь. В Python это dict, а клиент получает данные как JSON body. FastAPI выполняет преобразование. При обычном успешном завершении используется status 200 OK."}
        </p>
        <CodeBlock
          caption={"Значение и его JSON-представление"}
          code={"def read_status():\n" +
            "    return {\"service\": \"notifications\", \"active\": True}\n\n" +
            "# Клиент увидит JSON body:\n" +
            "{\"service\": \"notifications\", \"active\": true}"}
        />
        <p>
          {"Словарь не открывает порт и не отправляет сетевые пакеты. Это результат функции. FastAPI преобразует поддерживаемое значение в HTTP-ответ, а Uvicorn доставляет его через соединение."}
        </p>
        <p>
          {"Маршрут health обычно помогает проверить, отвечает ли приложение. Наш будущий ответ status=ok подтвердит только работу конкретного endpoint. Он не докажет исправность базы данных или почтовой системы, которых пока нет."}
        </p>
        <CompareSolutions
          question={"Какой вывод точнее после возврата словаря из функции?"}
          left={{
            title: "Слишком широкий",
            code: "Функция сама отправила HTTP-пакеты и запустила сервер",
            note: "Функция сформировала только значение Python.",
          }}
          right={{
            title: "По ролям",
            code: "FastAPI подготовит response, Uvicorn доставит его клиенту",
            note: "Сетевые обязанности остаются у сервера.",
          }}
          preferred={"right"}
          explanation={"Разделяйте результат endpoint, формирование HTTP-ответа и передачу ответа по сети."}
        />
      </Section>

      <Section number="04" title={"Uvicorn принимает HTTP и вызывает FastAPI"}>
        <Lead>
          {"Uvicorn это ASGI-сервер. Он принимает соединения, передаёт request приложению и отправляет сформированный response обратно."}
        </Lead>
        <p>
          {"ASGI задаёт общий интерфейс между Python web-приложением и сервером. Сервер передаёт приложению сведения о запросе, а приложение формирует response через тот же контракт. Не нужно запоминать внутренние функции ASGI. Достаточно понимать, что Uvicorn и FastAPI взаимодействуют через общий интерфейс, не зная деталей реализации друг друга."}
        </p>
        <CodeBlock
          caption={"Путь запроса"}
          code={"браузер или Postman\n" +
            "  → HTTP request\n" +
            "Uvicorn принимает соединение\n" +
            "  → передаёт запрос приложению\n" +
            "FastAPI находит endpoint\n" +
            "  → функция возвращает значение\n" +
            "Uvicorn отправляет HTTP response"}
        />
        <p>
          {"Мы запустим сервер из командной строки. Флаг --reload следит за изменениями файлов и перезапускает процесс. Это удобно при разработке, но не является production-конфигурацией."}
        </p>
        <CodeBlock
          caption={"Команда запуска"}
          code={"python -m uvicorn app.main:app --reload\n\n" +
            "app.main : app\n" +
            "модуль    : объект FastAPI"}
        />
        <CodeSequence
          title={"Путь от клиента к ответу"}
          prompt={"Расставьте действия по порядку."}
          pieces={[
            { id: "request", code: "клиент отправляет GET" },
            { id: "server", code: "Uvicorn принимает соединение" },
            { id: "route", code: "FastAPI находит маршрут" },
            { id: "function", code: "функция возвращает значение" },
            { id: "response", code: "клиент получает response" },
          ]}
          correctOrder={["request", "server", "route", "function", "response"]}
          explanation={"FastAPI не получает запрос, пока сервер не примет соединение. Ответ проходит обратно через Uvicorn."}
        />
      </Section>

      <Section number="05" title={"Import string зависит от структуры и текущей папки"}>
        <Lead>
          {"Команда запуска сообщает Uvicorn, где найти модуль и какой объект импортировать. Поэтому важны имена файлов и рабочая директория."}
        </Lead>
        <p>
          {"Структура проекта будет такой. Пустой __init__.py явно показывает, что app является пакетом Python."}
        </p>
        <CodeBlock
          caption={"Файлы проекта"}
          code={"studyhub-api/\n" +
            "  README.md\n" +
            "  requirements.txt\n" +
            "  postman/\n" +
            "    http-lab.collection.json\n" +
            "    echo.environment.json\n" +
            "  app/\n" +
            "    __init__.py\n" +
            "    main.py"}
        />
        <p>
          {"Команду python -m uvicorn app.main:app --reload выполняют из корня studyhub-api. В app.main первая часть app означает пакет, main означает модуль main.py, а часть после двоеточия указывает на переменную приложения внутри модуля."}
        </p>
        <FillBlank
          prompt={"Какое имя объекта Uvicorn возьмёт после двоеточия?"}
          before={"app.main:"}
          after={""}
          options={["app", "main", "uvicorn"]}
          answer={"app"}
          explanation={"Слева от двоеточия находится модуль app.main. Справа записано имя объекта FastAPI внутри этого модуля."}
        />
        <p>
          {"Если запустить команду из app, Python будет искать пакет относительно другого места и может не найти app.main. Это ошибка импорта до HTTP-обработки. Сначала сервер должен успешно загрузить объект, и только после этого клиент сможет отправить запрос."}
        </p>
        <p>
          {"Флаг --reload запускает также процесс-наблюдатель. После ошибки импорта серверный дочерний процесс может завершиться, а наблюдатель оставить терминал занятым. Нажмите Ctrl+C и дождитесь приглашения командной строки перед сменой папки."}
        </p>
        <BugHunt
          code={"Терминал открыт в studyhub-api/app\npython -m uvicorn app.main:app --reload"}
          question={"Сервер сообщает, что не может импортировать app.main. Что проверить первым?"}
          options={[
            "Рабочую директорию и путь импорта",
            "JSON body ответа",
            "Список задач в памяти",
          ]}
          correctIndex={0}
          explanation={"Сервер ещё не загрузил приложение, поэтому HTTP body и данные endpoint пока не участвуют."}
          fix={"Вернитесь в корень studyhub-api и повторите команду запуска."}
        />
      </Section>

      <Section number="06" title={"Различайте ошибку запуска и HTTP-ответ"}>
        <Lead>
          {"Похожие на первый взгляд сообщения относятся к разным этапам. Определите, дошёл ли запрос до приложения."}
        </Lead>
        <div className="lesson-practice-steps">
          <h3>Ошибка импорта при запуске</h3>
          <p>{"Uvicorn не загрузил app.main или не нашёл переменную app. Клиентский запрос ещё не обработан."}</p>
          <h3>Connection refused</h3>
          <p>{"По адресу и порту никто не слушает либо сервер уже остановлен. HTTP response от приложения не получен."}</p>
          <h3>HTTP 404</h3>
          <p>{"Соединение состоялось, сервер ответил, но запрошенный path не зарегистрирован."}</p>
          <h3>HTTP 405</h3>
          <p>{"Path существует, но сервер не разрешает для него отправленный method, например POST /health при единственном GET /health."}</p>
          <h3>HTTP 200</h3>
          <p>{"Маршрут найден и обработчик завершился успешно. Body всё ещё нужно сравнить с ожиданием."}</p>
        </div>
        <CodeBlock
          caption={"Пример границы"}
          code={"GET /health  → 200, если маршрут зарегистрирован\n" +
            "GET /        → 404, если маршрут корня не объявляли\n" +
            "POST /health → 405, если зарегистрирован только GET\n" +
            "сервер не запущен → connection refused"}
        />
        <TrueFalse
          statement={<>{"Если GET /health работает, то GET / обязан возвращать тот же ответ."}</>}
          isTrue={false}
          explanation={"Каждый method и path должны быть зарегистрированы. Маршрут /health не создаёт автоматически маршрут корня /."}
        />
        <Callout tone="info">
          {"404 может быть полезной диагностикой: сервер доступен, но запрошенного маршрута нет."}
        </Callout>
      </Section>

      <Section number="07" title={"Swagger UI показывает контракт приложения"}>
        <Lead>
          {"FastAPI строит OpenAPI-описание на основе зарегистрированных маршрутов. Swagger UI отображает его как интерактивную документацию."}
        </Lead>
        <p>
          {"OpenAPI это структурированное описание API: paths, методы и известные параметры. Swagger UI это человекочитаемый интерфейс, который использует описание и позволяет вручную вызвать операцию."}
        </p>
        <CodeBlock
          caption={"Локальные страницы"}
          code={"http://127.0.0.1:8000/docs\n" +
            "http://127.0.0.1:8000/openapi.json"}
        />
        <p>
          {"В /docs мы раскроем GET /health, нажмём Try it out и Execute, затем проверим status и body. Сам маршрут всё равно объявлен в коде приложения. Документация помогает увидеть контракт, но не доказывает, что бизнес-логика верна, и не заменяет автоматические тесты."}
        </p>
        <QuizCard
          question={"Как соотносятся OpenAPI и Swagger UI?"}
          options={[
            "OpenAPI описывает контракт, Swagger UI показывает его интерактивно",
            "Swagger UI запускает Uvicorn, а OpenAPI хранит базу",
            "Это две функции одного endpoint /health",
          ]}
          correctIndex={0}
          explanation={"FastAPI формирует схему OpenAPI из известных маршрутов, а интерфейс /docs показывает её человеку."}
        />
        <Callout tone="warn">
          {"В production публичную интерактивную документацию включают осознанно. Она раскрывает устройство API."}
        </Callout>
      </Section>

      <Section number="08" title={"Что мы будем делать в практике"}>
        <Lead>
          {"Продолжим studyhub-api из прошлой работы. Сохраним существующую папку postman с экспортами и добавим серверную часть, проверив её через HTTP."}
        </Lead>
        <p>
          {"Папка studyhub-api уже содержит postman-экспорты. Не удаляйте их и не создавайте второй проект. Добавьте в корень виртуальное окружение .venv: оно отделяет библиотеки этого проекта от других Python-программ. FastAPI и Uvicorn установим в активное окружение через python -m pip. Затем внутри пакета app создадим объект приложения и один GET /health. Маршрут вернёт status=ok, а сервер запустит его из корня проекта."}
        </p>
        <p>
          {"Мы проверим status и JSON body напрямую, затем повторим запрос через /docs. После этого намеренно запустим команду из неверной папки, прочитаем ошибку импорта и восстановим правильный запуск. В конце запишем в README команду установки зависимостей и команду запуска из корня проекта. requirements.txt сохранит список пакетов для нового окружения. Сам каталог .venv обычно не включают в Git; правило .venv/ добавляют в .gitignore, если проект ведётся в Git, но на этом шаге Git-настройку не выполняем."}
        </p>
        <div className="lesson-practice-steps">
          <h3>FastAPI</h3>
          <p>{"Объект приложения и маршрут."}</p>
          <h3>Endpoint</h3>
          <p>{"GET /health и короткий JSON-ответ."}</p>
          <h3>Uvicorn</h3>
          <p>{"HTTP-сервер и команда запуска, записанная в README."}</p>
          <h3>Клиент и Swagger</h3>
          <p>{"Внешняя проверка status, body и описанного маршрута."}</p>
        </div>
        <p>
          {"Мы не добавляем список задач, Pydantic-схемы, базу, авторизацию или production-развёртывание. Следующая работа расширит уже запущенное приложение маршрутами чтения. Сейчас важно отделить настройку сервера от поведения данных."}
        </p>
        <KeyTakeaways
          points={[
            <>{"FastAPI описывает приложение и его маршруты."}</>,
            <>{"Uvicorn принимает HTTP и передаёт запрос приложению."}</>,
            <>{"app.main:app означает модуль и имя объекта."}</>,
            <>{"GET /health можно проверить снаружи приложения."}</>,
            <>{"Swagger UI показывает OpenAPI-контракт, но не заменяет тесты."}</>,
          ]}
        />
        <PracticeCta text={"Продолжите studyhub-api, сохраните каталог postman с экспортами, запустите GET /health через Uvicorn и проверьте его в браузере и Swagger UI."} />
      </Section>

      <Section number="09" title={"Проверьте свою модель сервера"}>
        <Lead>
          {"Перед практикой попробуйте объяснить цепочку без подсказки и без кода."}
        </Lead>
        <div className="lesson-check-group">
          <QuizCard
            question={"Что означает app.main:app?"}
            options={[
              "Импортировать модуль app.main и взять объект app",
              "Открыть path /app/main",
              "Создать второй сервер с именем main",
            ]}
            correctIndex={0}
            explanation={"Левая часть указывает модуль, правая часть после двоеточия указывает переменную в модуле."}
          />
          <QuizCard
            question={"Что означает HTTP 404 при работающем Uvicorn?"}
            options={[
              "Соединение состоялось, но маршрут не найден",
              "FastAPI не установлен",
              "Python не смог импортировать приложение",
            ]}
            correctIndex={0}
            explanation={"При ошибке импорта сервер не стартовал бы. HTTP 404 уже является полученным ответом сервера."}
          />
          <QuizCard
            question={"Что означает HTTP 405 для POST /health, если зарегистрирован только GET /health?"}
            options={[
              "Path существует, но для него не разрешён POST",
              "Uvicorn не смог импортировать приложение",
              "Сервер не получил HTTP request",
            ]}
            correctIndex={0}
            explanation={"405 относится к несовпадению метода для существующего path. При незарегистрированном path обычно приходит 404."}
          />
          <RecallCard
            question={"Что именно подтверждает GET /health со status=ok?"}
            answer={<p>{"Что приложение обработало этот запрос и вернуло ответ. Это не проверка базы или других ещё не подключённых зависимостей."}</p>}
          />
        </div>
        <Callout tone="info">
          {"Если вы можете разделить роли клиента, Uvicorn, FastAPI и endpoint, можно переходить к самостоятельной сборке проекта."}
        </Callout>
      </Section>
    </RichLesson>
  );
}

// 53. GET-endpoints и ответы FastAPI
// 53. GET-endpoints и ответы FastAPI
export function Lesson53({ module }: { module?: string }) {
  return (
    <RichLesson>
      <RichHero
        chip={module ?? BLOCK_TITLE}
        title={"GET-endpoints и ответы FastAPI"}
        intro={"Добавим первые полезные endpoints Planner API: проверку состояния и список задач в памяти. Разберём, как dict и list превращаются в JSON response и почему GET не должен менять данные."}
        tags={[
          { icon: <ListChecks size={14} />, label: "GET и чтение" },
          { icon: <FileText size={14} />, label: "Python → JSON" },
        ]}
      />
      <TheoryBridge lesson={53} />

      <Section number="01" title={"GET отвечает на вопрос"}>
        <Lead>
          {"GET используется, когда клиент просит представить текущее состояние: информацию API, health или список."}
        </Lead>

        <div className="lesson-practice-steps">
          <h3>Без изменения</h3>
          <p>
            {"Повторный GET не создаёт объект."}
          </p>

          <h3>Наблюдение</h3>
          <p>
            {"Endpoint читает и возвращает."}
          </p>

          <h3>Несколько paths</h3>
          <p>
            {"/, /health и /tasks."}
          </p>

          <h3>Смысл path</h3>
          <p>
            {"Адрес помогает предсказать body."}
          </p>

        </div>

        <CodeBlock
          caption={"карта"}
          code={
            "GET /        → информация API\n" +
            "GET /health  → состояние сервера\n" +
            "GET /tasks   → список задач"
          }
        />

        <RecallCard
          question={"GET не должен менять tasks."}
          answer={
            <p>
              {"Это сохраняет предсказуемость."}
            </p>
          }
        />

        <Callout tone="info">
          {"GET означает сетевое намерение чтения."}
        </Callout>
      </Section>

      <Section number="02" title={"In-memory данные"}>
        <Lead>
          {"До базы данных используем обычный список словарей, знакомый по первому месяцу."}
        </Lead>

        <div className="lesson-practice-steps">
          <h3>Глобальный список</h3>
          <p>
            {"Объявляется рядом с app."}
          </p>

          <h3>Временность</h3>
          <p>
            {"После restart изменения исчезают."}
          </p>

          <h3>Не БД</h3>
          <p>
            {"Подходит только для учебного этапа."}
          </p>

          <h3>Цель</h3>
          <p>
            {"Увидеть list → JSON array."}
          </p>

        </div>

        <CodeBlock
          caption={"tasks"}
          code={
            "tasks = [\n" +
            "    {\n" +
            "        \"id\": 1,\n" +
            "        \"title\": \"Повторить HTTP\",\n" +
            "        \"priority\": 4,\n" +
            "        \"is_done\": False,\n" +
            "    },\n" +
            "    {\n" +
            "        \"id\": 2,\n" +
            "        \"title\": \"Запустить FastAPI\",\n" +
            "        \"priority\": 5,\n" +
            "        \"is_done\": True,\n" +
            "    },\n" +
            "]"
          }
        />

        <TrueFalse
          statement={
            <>
              {"In-memory данные не переживают restart."}
            </>
          }
          isTrue={true}
          explanation={"Процесс хранит их только во время работы."}
        />

        <Callout tone="info">
          {"После перезапуска исходный список создаётся заново."}
        </Callout>
      </Section>

      <Section number="03" title={"Health endpoint"}>
        <Lead>
          {"Health сообщает, что приложение принимает requests. Пока он не проверяет базу данных, потому что её ещё нет."}
        </Lead>

        <div className="lesson-practice-steps">
          <h3>Path</h3>
          <p>
            {"/health ясно называет назначение."}
          </p>

          <h3>Body</h3>
          <p>
            {"Небольшой dict status."}
          </p>

          <h3>Status</h3>
          <p>
            {"Успех по умолчанию 200."}
          </p>

          <h3>Проверка</h3>
          <p>
            {"Удобен перед другими request."}
          </p>

        </div>

        <CodeBlock
          caption={"endpoint"}
          code={
            "@app.get(\"/health\")\n" +
            "def health():\n" +
            "    return {\n" +
            "        \"status\": \"ok\"\n" +
            "    }"
          }
        />

        <RecallCard
          question={"Health возвращает 200 и JSON."}
          answer={
            <p>
              {"Это подтверждает работу приложения."}
            </p>
          }
        />

        <Callout tone="info">
          {"Поле status в body не равно HTTP status."}
        </Callout>
      </Section>

      <Section number="04" title={"GET /tasks"}>
        <Lead>
          {"Collection endpoint возвращает список напрямую. FastAPI формирует JSON array без ручного json.dumps."}
        </Lead>

        <div className="lesson-practice-steps">
          <h3>Decorator</h3>
          <p>
            {"@app.get(\"/tasks\")."}
          </p>

          <h3>Return</h3>
          <p>
            {"Возвращается tasks."}
          </p>

          <h3>Array</h3>
          <p>
            {"List становится JSON array."}
          </p>

          <h3>Пустой список</h3>
          <p>
            {"[] является нормальным 200 response."}
          </p>

        </div>

        <CodeBlock
          caption={"endpoint"}
          code={
            "@app.get(\"/tasks\")\n" +
            "def get_tasks():\n" +
            "    return tasks"
          }
        />

        <TrueFalse
          statement={
            <>
              {"FastAPI умеет вернуть list."}
            </>
          }
          isTrue={true}
          explanation={"Результат останется структурированным JSON."}
        />

        <Callout tone="info">
          {"Не возвращайте str(tasks): клиент потеряет структуру."}
        </Callout>
      </Section>

      <Section number="05" title={"Python и JSON"}>
        <Lead>
          {"FastAPI преобразует JSON-совместимые Python-значения в формат response."}
        </Lead>

        <div className="lesson-practice-steps">
          <h3>dict</h3>
          <p>
            {"JSON object."}
          </p>

          <h3>list</h3>
          <p>
            {"JSON array."}
          </p>

          <h3>True и False</h3>
          <p>
            {"true и false."}
          </p>

          <h3>None</h3>
          <p>
            {"null."}
          </p>

        </div>

        <CodeBlock
          caption={"сравнение"}
          code={
            "Python:\n" +
            "{\n" +
            "  \"items\": [1, 2],\n" +
            "  \"active\": True,\n" +
            "  \"error\": None,\n" +
            "}\n" +
            "\n" +
            "JSON:\n" +
            "{\n" +
            "  \"items\": [1, 2],\n" +
            "  \"active\": true,\n" +
            "  \"error\": null\n" +
            "}"
          }
        />

        <RecallCard
          question={"True превращается в true."}
          answer={
            <p>
              {"Сериализация меняет запись, не смысл."}
            </p>
          }
        />

        <Callout tone="info">
          {"JSON похож на Python, но является отдельным форматом."}
        </Callout>
      </Section>

      <Section number="06" title={"Стабильная форма response"}>
        <Lead>
          {"Клиент пишет код под ожидаемую форму. Пустой список и список с задачами должны оставаться массивами."}
        </Lead>

        <div className="lesson-practice-steps">
          <h3>Один контракт</h3>
          <p>
            {"GET /tasks всегда возвращает array."}
          </p>

          <h3>Пустое состояние</h3>
          <p>
            {"Используется []."}
          </p>

          <h3>Не текст</h3>
          <p>
            {"Нет задач не заменяет массив."}
          </p>

          <h3>Будущее</h3>
          <p>
            {"Response models появятся позже."}
          </p>

        </div>

        <CodeBlock
          caption={"стабильный контракт"}
          code={
            "данные есть:\n" +
            "[\n" +
            "  {\"id\": 1, \"title\": \"HTTP\"}\n" +
            "]\n" +
            "\n" +
            "данных нет:\n" +
            "[]"
          }
        />

        <TrueFalse
          statement={
            <>
              {"Пустая collection возвращает 200 и []."}
            </>
          }
          isTrue={true}
          explanation={"Форма остаётся list."}
        />

        <Callout tone="info">
          {"404 понадобится для конкретного неизвестного id, а не пустой collection."}
        </Callout>
      </Section>

      <Section number="07" title={"Три клиента, один endpoint"}>
        <Lead>
          {"Браузер, Swagger и Postman отправляют один HTTP request к одному registered endpoint."}
        </Lead>

        <div className="lesson-practice-steps">
          <h3>Браузер</h3>
          <p>
            {"Быстрый GET."}
          </p>

          <h3>Swagger</h3>
          <p>
            {"Try it out."}
          </p>

          <h3>Postman</h3>
          <p>
            {"Сохранённый request."}
          </p>

          <h3>Uvicorn log</h3>
          <p>
            {"Показывает method, path и status."}
          </p>

        </div>

        <CodeBlock
          caption={"проверки"}
          code={
            "GET {{base_url}}/\n" +
            "GET {{base_url}}/health\n" +
            "GET {{base_url}}/tasks\n" +
            "\n" +
            "GET /tasks HTTP/1.1 200 OK"
          }
        />

        <RecallCard
          question={"Swagger и Postman вызывают один endpoint."}
          answer={
            <p>
              {"Они отличаются способом отправки."}
            </p>
          }
        />

        <Callout tone="info">
          {"Интерфейс клиента отличается, контракт сервера нет."}
        </Callout>
      </Section>

      <Section number="08" title={"Практика: карта чтения"}>
        <Lead>
          {"Соберите маленький набор GET до path-параметров и новых видов входа."}
        </Lead>

        <div className="lesson-practice-steps">
          <h3>Корень</h3>
          <p>
            {"Верните name и version."}
          </p>

          <h3>Health</h3>
          <p>
            {"Верните status ok."}
          </p>

          <h3>Tasks</h3>
          <p>
            {"Верните два dict."}
          </p>

          <h3>Пустая collection</h3>
          <p>
            {"Проверьте []."}
          </p>

          <h3>Git</h3>
          <p>
            {"Сделайте отдельный commit."}
          </p>

        </div>

        <CodeBlock
          caption={"карта и commit"}
          code={
            "GET /        → info\n" +
            "GET /health  → status\n" +
            "GET /tasks   → list\n" +
            "\n" +
            "git commit -m \"feat: add first GET endpoints\""
          }
        />

        <TrueFalse
          statement={
            <>
              {"Блок чтения должен быть проверен отдельно."}
            </>
          }
          isTrue={true}
          explanation={"Маленький commit проще диагностировать."}
        />

        <Callout tone="info">
          {"Не добавляйте поиск id в этот же шаг."}
        </Callout>

        <div className="lesson-check-group">
          <QuizCard
            question={"Что делает GET?"}
            options={[
              "читает",
              "создаёт",
              "удаляет",
            ]}
            correctIndex={0}
            explanation={"GET читает."}
          />
          <QuizCard
            question={"List становится?"}
            options={[
              "JSON array",
              "header",
              "method",
            ]}
            correctIndex={0}
            explanation={"Список сериализуется."}
          />
          <QuizCard
            question={"Пустая collection?"}
            options={[
              "[]",
              "404",
              "строка",
            ]}
            correctIndex={0}
            explanation={"Форма сохраняется."}
          />
          <QuizCard
            question={"Default status?"}
            options={[
              "200",
              "201",
              "404",
            ]}
            correctIndex={0}
            explanation={"Успешный GET — 200."}
          />
        </div>

        <KeyTakeaways
          points={[
            <>{"GET используется для чтения."}</>,
            <>{"Данные пока находятся в памяти."}</>,
            <>{"Health проверяет доступность."}</>,
            <>{"List и dict сериализуются автоматически."}</>,
            <>{"Пустая collection возвращает []."}</>,
            <>{"Форма response стабильна."}</>,
            <>{"Разные клиенты используют один endpoint."}</>,
            <>{"Каждый endpoint проверяется request."}</>,
          ]}
        />

        <PracticeCta text={"Добавьте GET /, /health и /tasks, сохраните requests в Postman и проверьте JSON в Swagger."} />
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
        title={"Path-параметры и поиск объекта"}
        intro={"Научим API получать id прямо из URL: зарегистрируем /tasks/{task_id}, преобразуем значение в int, найдём задачу и вернём честные 404 и 422 для разных причин."}
        tags={[
          { icon: <KeyRound size={14} />, label: "path parameter" },
          { icon: <GitBranch size={14} />, label: "200 · 404 · 422" },
        ]}
      />
      <TheoryBridge lesson={54} />

      <Section number="01" title={"Collection и item"}>
        <Lead>
          {"Один path представляет весь набор, другой — конкретную задачу."}
        </Lead>

        <div className="lesson-practice-steps">
          <h3>Collection</h3>
          <p>
            {"GET /tasks."}
          </p>

          <h3>Item</h3>
          <p>
            {"GET /tasks/2."}
          </p>

          <h3>Method</h3>
          <p>
            {"Оба используют GET."}
          </p>

          <h3>Path</h3>
          <p>
            {"Показывает набор или объект."}
          </p>

        </div>

        <CodeBlock
          caption={"два уровня"}
          code={
            "GET /tasks\n" +
            "→ список\n" +
            "\n" +
            "GET /tasks/2\n" +
            "→ задача id=2\n" +
            "\n" +
            "GET /tasks/{task_id}\n" +
            "→ шаблон"
          }
        />

        <RecallCard
          question={"Item endpoint содержит id в path."}
          answer={
            <p>
              {"Он выбирает конкретный ресурс."}
            </p>
          }
        />

        <Callout tone="info">
          {"Фигурные скобки есть в route, но не в реальном request."}
        </Callout>
      </Section>

      <Section number="02" title={"Объявляем параметр"}>
        <Lead>
          {"Имя в {task_id} совпадает с аргументом функции. FastAPI передаёт значение segment в handler."}
        </Lead>

        <div className="lesson-practice-steps">
          <h3>Route</h3>
          <p>
            {"/tasks/{task_id}."}
          </p>

          <h3>Argument</h3>
          <p>
            {"task_id получает segment."}
          </p>

          <h3>Type hint</h3>
          <p>
            {"int задаёт ожидаемый тип."}
          </p>

          <h3>Return</h3>
          <p>
            {"Сначала можно вернуть id."}
          </p>

        </div>

        <CodeBlock
          caption={"минимальный endpoint"}
          code={
            "@app.get(\"/tasks/{task_id}\")\n" +
            "def get_task(task_id: int):\n" +
            "    return {\n" +
            "        \"task_id\": task_id\n" +
            "    }"
          }
        />

        <TrueFalse
          statement={
            <>
              {"Task_id должен совпадать в route и функции."}
            </>
          }
          isTrue={true}
          explanation={"FastAPI связывает их по имени."}
        />

        <Callout tone="info">
          {"Совпадение имени делает поток данных явным."}
        </Callout>
      </Section>

      <Section number="03" title={"Преобразование в int"}>
        <Lead>
          {"URL содержит текст, но type hint просит FastAPI преобразовать его до вызова функции."}
        </Lead>

        <div className="lesson-practice-steps">
          <h3>Корректное</h3>
          <p>
            {"/tasks/12 → int 12."}
          </p>

          <h3>Некорректное</h3>
          <p>
            {"/tasks/abc не превращается в int."}
          </p>

          <h3>422</h3>
          <p>
            {"Validation error."}
          </p>

          <h3>Handler</h3>
          <p>
            {"Не вызывается при неверном типе."}
          </p>

        </div>

        <CodeBlock
          caption={"три шага"}
          code={
            "GET /tasks/12\n" +
            "→ task_id == 12\n" +
            "\n" +
            "GET /tasks/abc\n" +
            "→ 422\n" +
            "→ get_task не вызван"
          }
        />

        <RecallCard
          question={"Неверный формат id даёт 422."}
          answer={
            <p>
              {"Это не 404."}
            </p>
          }
        />

        <Callout tone="info">
          {"422 означает неправильную форму входа."}
        </Callout>
      </Section>

      <Section number="04" title={"Helper find_task"}>
        <Lead>
          {"Поиск в списке остаётся обычной Python-функцией и не обязан знать status codes."}
        </Lead>

        <div className="lesson-practice-steps">
          <h3>Вход</h3>
          <p>
            {"tasks и task_id."}
          </p>

          <h3>Успех</h3>
          <p>
            {"Возвращает dict."}
          </p>

          <h3>Отсутствие</h3>
          <p>
            {"Возвращает None."}
          </p>

          <h3>Повторное использование</h3>
          <p>
            {"Понадобится PATCH и DELETE."}
          </p>

        </div>

        <CodeBlock
          caption={"helper"}
          code={
            "def find_task(tasks, task_id):\n" +
            "    for task in tasks:\n" +
            "        if task[\"id\"] == task_id:\n" +
            "            return task\n" +
            "\n" +
            "    return None"
          }
        />

        <TrueFalse
          statement={
            <>
              {"Find_task не формирует HTTP response."}
            </>
          }
          isTrue={true}
          explanation={"Он только ищет Python-объект."}
        />

        <Callout tone="info">
          {"Обычную функцию легко тестировать отдельно."}
        </Callout>
      </Section>

      <Section number="05" title={"HTTPException 404"}>
        <Lead>
          {"Корректный int может не соответствовать существующему объекту. Тогда endpoint поднимает HTTPException 404."}
        </Lead>

        <div className="lesson-practice-steps">
          <h3>Импорт</h3>
          <p>
            {"from fastapi import HTTPException."}
          </p>

          <h3>Условие</h3>
          <p>
            {"task is None."}
          </p>

          <h3>Status</h3>
          <p>
            {"404 Not Found."}
          </p>

          <h3>Detail</h3>
          <p>
            {"Короткое сообщение body."}
          </p>

        </div>

        <CodeBlock
          caption={"item endpoint"}
          code={
            "@app.get(\"/tasks/{task_id}\")\n" +
            "def get_task(task_id: int):\n" +
            "    task = find_task(tasks, task_id)\n" +
            "\n" +
            "    if task is None:\n" +
            "        raise HTTPException(\n" +
            "            status_code=404,\n" +
            "            detail=\"Task not found\",\n" +
            "        )\n" +
            "\n" +
            "    return task"
          }
        />

        <RecallCard
          question={"Неизвестный корректный id даёт 404."}
          answer={
            <p>
              {"Resource с таким id отсутствует."}
            </p>
          }
        />

        <Callout tone="info">
          {"Raise завершает endpoint до return."}
        </Callout>
      </Section>

      <Section number="06" title={"200, 404 и 422"}>
        <Lead>
          {"Причина результата определяется стадией: validation path или поиск объекта."}
        </Lead>

        <div className="lesson-practice-steps">
          <h3>200</h3>
          <p>
            {"Int корректен, task найден."}
          </p>

          <h3>404</h3>
          <p>
            {"Int корректен, task не найден."}
          </p>

          <h3>422</h3>
          <p>
            {"Segment нельзя превратить в int."}
          </p>

          <h3>Клиент</h3>
          <p>
            {"Может обработать причины отдельно."}
          </p>

        </div>

        <CodeBlock
          caption={"матрица"}
          code={
            "GET /tasks/1   → 200\n" +
            "GET /tasks/999 → 404\n" +
            "GET /tasks/abc → 422"
          }
        />

        <TrueFalse
          statement={
            <>
              {"404 и 422 обозначают разные причины."}
            </>
          }
          isTrue={true}
          explanation={"Точность улучшает контракт."}
        />

        <Callout tone="info">
          {"Не заменяйте все ошибки status 400."}
        </Callout>
      </Section>

      <Section number="07" title={"Три request в Postman"}>
        <Lead>
          {"Item endpoint проверяется существующим id, отсутствующим числом и строкой вместо числа."}
        </Lead>

        <div className="lesson-practice-steps">
          <h3>Existing</h3>
          <p>
            {"GET /tasks/1."}
          </p>

          <h3>Missing</h3>
          <p>
            {"GET /tasks/999."}
          </p>

          <h3>Invalid</h3>
          <p>
            {"GET /tasks/abc."}
          </p>

          <h3>Лог</h3>
          <p>
            {"Показывает 200, 404, 422."}
          </p>

        </div>

        <CodeBlock
          caption={"collection requests"}
          code={
            "Get existing task\n" +
            "GET {{base_url}}/tasks/1\n" +
            "\n" +
            "Get missing task\n" +
            "GET {{base_url}}/tasks/999\n" +
            "\n" +
            "Invalid task id\n" +
            "GET {{base_url}}/tasks/abc"
          }
        />

        <RecallCard
          question={"Одного успешного request недостаточно."}
          answer={
            <p>
              {"Нужны граничные сценарии."}
            </p>
          }
        />

        <Callout tone="info">
          {"Говорящие имена превращают collection в checklist."}
        </Callout>
      </Section>

      <Section number="08" title={"Практика item endpoint"}>
        <Lead>
          {"Соберите короткий поток: FastAPI проверяет тип, helper ищет task, endpoint выбирает response."}
        </Lead>

        <div className="lesson-practice-steps">
          <h3>Шаг 1</h3>
          <p>
            {"Добавьте find_task."}
          </p>

          <h3>Шаг 2</h3>
          <p>
            {"Создайте route."}
          </p>

          <h3>Шаг 3</h3>
          <p>
            {"Добавьте 404."}
          </p>

          <h3>Шаг 4</h3>
          <p>
            {"Проверьте 1, 999 и abc."}
          </p>

        </div>

        <CodeBlock
          caption={"поток"}
          code={
            "URL segment\n" +
            "→ FastAPI int validation\n" +
            "→ find_task\n" +
            "→ dict или None\n" +
            "→ 200 или 404"
          }
        />

        <TrueFalse
          statement={
            <>
              {"Path выбирает конкретный объект."}
            </>
          }
          isTrue={true}
          explanation={"Query появится для collection."}
        />

        <Callout tone="info">
          {"Query-фильтры пока не нужны."}
        </Callout>

        <div className="lesson-check-group">
          <QuizCard
            question={"Где task_id?"}
            options={[
              "path",
              "body",
              "header",
            ]}
            correctIndex={0}
            explanation={"Id находится в URL."}
          />
          <QuizCard
            question={"/tasks/abc?"}
            options={[
              "422",
              "404",
              "200",
            ]}
            correctIndex={0}
            explanation={"Тип не проходит validation."}
          />
          <QuizCard
            question={"Когда 404?"}
            options={[
              "объект отсутствует",
              "любой ввод",
              "список пуст",
            ]}
            correctIndex={0}
            explanation={"Resource не найден."}
          />
          <QuizCard
            question={"Зачем helper?"}
            options={[
              "не дублировать поиск",
              "запустить сервер",
              "создать query",
            ]}
            correctIndex={0}
            explanation={"Поиск переиспользуется."}
          />
        </div>

        <KeyTakeaways
          points={[
            <>{"Collection и item имеют разные paths."}</>,
            <>{"Path-параметр обязателен."}</>,
            <>{"Имя route совпадает с аргументом."}</>,
            <>{"Int запускает validation."}</>,
            <>{"Find_task отделяет поиск."}</>,
            <>{"HTTPException формирует error response."}</>,
            <>{"404 и 422 различаются."}</>,
            <>{"Нужны три граничных request."}</>,
          ]}
        />

        <PracticeCta text={"Реализуйте GET /tasks/{task_id}, сохраните три request и объясните 200, 404 и 422."} />
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
        title={"Query-параметры: фильтрация, сортировка и границы"}
        intro={"Научим collection endpoint принимать необязательные настройки: фильтровать, ограничивать количество, искать по тексту и выбирать порядок без десятков новых URLs."}
        tags={[
          { icon: <ListChecks size={14} />, label: "optional query" },
          { icon: <Wrench size={14} />, label: "filter · sort · limit" },
        ]}
      />
      <TheoryBridge lesson={55} />

      <Section number="01" title={"Один endpoint, разные выборки"}>
        <Lead>
          {"Клиент продолжает обращаться к /tasks, но добавляет параметры после ?. "}
        </Lead>

        <div className="lesson-practice-steps">
          <h3>Без query</h3>
          <p>
            {"Базовый список."}
          </p>

          <h3>Фильтр</h3>
          <p>
            {"?is_done=true."}
          </p>

          <h3>Limit</h3>
          <p>
            {"?limit=5."}
          </p>

          <h3>Комбинация</h3>
          <p>
            {"& соединяет параметры."}
          </p>

        </div>

        <CodeBlock
          caption={"requests"}
          code={
            "GET /tasks\n" +
            "GET /tasks?is_done=true\n" +
            "GET /tasks?limit=5\n" +
            "GET /tasks?is_done=false&limit=3"
          }
        />

        <RecallCard
          question={"Query настраивает collection."}
          answer={
            <p>
              {"Resource остаётся /tasks."}
            </p>
          }
        />

        <Callout tone="info">
          {"Не создавайте отдельный path для каждого фильтра."}
        </Callout>
      </Section>

      <Section number="02" title={"Optional bool"}>
        <Lead>
          {"Параметр функции, которого нет в path и который имеет обычный тип, FastAPI воспринимает как query."}
        </Lead>

        <div className="lesson-practice-steps">
          <h3>Тип</h3>
          <p>
            {"bool | None."}
          </p>

          <h3>Default</h3>
          <p>
            {"= None делает optional."}
          </p>

          <h3>Преобразование</h3>
          <p>
            {"true становится True."}
          </p>

          <h3>Условие</h3>
          <p>
            {"Используем is not None."}
          </p>

        </div>

        <CodeBlock
          caption={"endpoint"}
          code={
            "@app.get(\"/tasks\")\n" +
            "def get_tasks(is_done: bool | None = None):\n" +
            "    result = list(tasks)\n" +
            "\n" +
            "    if is_done is not None:\n" +
            "        result = [\n" +
            "            task\n" +
            "            for task in result\n" +
            "            if task[\"is_done\"] == is_done\n" +
            "        ]\n" +
            "\n" +
            "    return result"
          }
        />

        <TrueFalse
          statement={
            <>
              {"False является допустимым фильтром."}
            </>
          }
          isTrue={true}
          explanation={"Проверяется отсутствие через None."}
        />

        <Callout tone="info">
          {"if is_done потеряет явный False."}
        </Callout>
      </Section>

      <Section number="03" title={"Limit и offset"}>
        <Lead>
          {"Limit ограничивает количество, offset пропускает начало. Вместе они образуют простую учебную пагинацию."}
        </Lead>

        <div className="lesson-practice-steps">
          <h3>Limit</h3>
          <p>
            {"Сколько вернуть."}
          </p>

          <h3>Offset</h3>
          <p>
            {"Сколько пропустить."}
          </p>

          <h3>Defaults</h3>
          <p>
            {"0 и 10."}
          </p>

          <h3>Срез</h3>
          <p>
            {"result[offset:offset + limit]."}
          </p>

        </div>

        <CodeBlock
          caption={"пример"}
          code={
            "@app.get(\"/tasks\")\n" +
            "def get_tasks(\n" +
            "    offset: int = 0,\n" +
            "    limit: int = 10,\n" +
            "):\n" +
            "    return tasks[\n" +
            "        offset : offset + limit\n" +
            "    ]"
          }
        />

        <RecallCard
          question={"Limit и offset применяются через срез."}
          answer={
            <p>
              {"Знакомая Python-модель сохраняется."}
            </p>
          }
        />

        <Callout tone="info">
          {"Это ещё не production pagination."}
        </Callout>
      </Section>

      <Section number="04" title={"Границы Query"}>
        <Lead>
          {"Обычный int проверяет тип, но разрешает отрицательный offset. Query добавляет ge и le."}
        </Lead>

        <div className="lesson-practice-steps">
          <h3>Annotated</h3>
          <p>
            {"Соединяет type и metadata."}
          </p>

          <h3>ge</h3>
          <p>
            {"Нижняя включённая граница."}
          </p>

          <h3>le</h3>
          <p>
            {"Верхняя включённая граница."}
          </p>

          <h3>422</h3>
          <p>
            {"Неверная граница не вызывает endpoint."}
          </p>

        </div>

        <CodeBlock
          caption={"параметры"}
          code={
            "from typing import Annotated\n" +
            "from fastapi import Query\n" +
            "\n" +
            "limit: Annotated[\n" +
            "    int,\n" +
            "    Query(ge=1, le=100),\n" +
            "] = 10"
          }
        />

        <TrueFalse
          statement={
            <>
              {"Query(le=100) задаёт максимум."}
            </>
          }
          isTrue={true}
          explanation={"Значение 101 даст 422."}
        />

        <Callout tone="info">
          {"Читайте Annotated как тип int плюс правила Query."}
        </Callout>
      </Section>

      <Section number="05" title={"Поиск q"}>
        <Lead>
          {"Query q фильтрует title по части текста. Обе стороны приводятся к lower."}
        </Lead>

        <div className="lesson-practice-steps">
          <h3>Optional</h3>
          <p>
            {"q может отсутствовать."}
          </p>

          <h3>Strip</h3>
          <p>
            {"Убирает края."}
          </p>

          <h3>Lower</h3>
          <p>
            {"Убирает влияние регистра."}
          </p>

          <h3>In</h3>
          <p>
            {"Проверяет вхождение."}
          </p>

        </div>

        <CodeBlock
          caption={"helper"}
          code={
            "def filter_by_query(tasks, query):\n" +
            "    normalized = query.strip().lower()\n" +
            "\n" +
            "    if normalized == \"\":\n" +
            "        return tasks\n" +
            "\n" +
            "    return [\n" +
            "        task\n" +
            "        for task in tasks\n" +
            "        if normalized in task[\"title\"].lower()\n" +
            "    ]"
          }
        />

        <RecallCard
          question={"Lower нужен только для сравнения."}
          answer={
            <p>
              {"Данные задачи сохраняются."}
            </p>
          }
        />

        <Callout tone="info">
          {"Исходный title не изменяется."}
        </Callout>
      </Section>

      <Section number="06" title={"Sort_by"}>
        <Lead>
          {"Клиент выбирает одно из разрешённых полей, а sorted создаёт новый список."}
        </Lead>

        <div className="lesson-practice-steps">
          <h3>Allowed fields</h3>
          <p>
            {"id, priority, title."}
          </p>

          <h3>Default</h3>
          <p>
            {"id."}
          </p>

          <h3>Неизвестное поле</h3>
          <p>
            {"400."}
          </p>

          <h3>Sorted</h3>
          <p>
            {"Не меняет исходный tasks."}
          </p>

        </div>

        <CodeBlock
          caption={"sorting"}
          code={
            "ALLOWED_SORT_FIELDS = {\"id\", \"priority\", \"title\"}\n" +
            "\n" +
            "def sort_tasks(tasks, sort_by):\n" +
            "    if sort_by not in ALLOWED_SORT_FIELDS:\n" +
            "        raise HTTPException(\n" +
            "            status_code=400,\n" +
            "            detail=\"Unsupported sort field\",\n" +
            "        )\n" +
            "\n" +
            "    return sorted(\n" +
            "        tasks,\n" +
            "        key=lambda task: task[sort_by],\n" +
            "    )"
          }
        />

        <TrueFalse
          statement={
            <>
              {"Sorted предпочтительнее list.sort внутри GET."}
            </>
          }
          isTrue={true}
          explanation={"Он возвращает новый list."}
        />

        <Callout tone="info">
          {"GET формирует представление и не должен менять global order."}
        </Callout>
      </Section>

      <Section number="07" title={"Pipeline обработки"}>
        <Lead>
          {"Несколько параметров читаются как последовательность маленьких этапов."}
        </Lead>

        <div className="lesson-practice-steps">
          <h3>Копия</h3>
          <p>
            {"result = list(tasks)."}
          </p>

          <h3>Фильтры</h3>
          <p>
            {"is_done и q."}
          </p>

          <h3>Сортировка</h3>
          <p>
            {"sort_by."}
          </p>

          <h3>Срез</h3>
          <p>
            {"offset и limit последними."}
          </p>

        </div>

        <CodeBlock
          caption={"pipeline"}
          code={
            "result = list(tasks)\n" +
            "\n" +
            "if is_done is not None:\n" +
            "    result = filter_by_status(result, is_done)\n" +
            "\n" +
            "if q:\n" +
            "    result = filter_by_query(result, q)\n" +
            "\n" +
            "result = sort_tasks(result, sort_by)\n" +
            "result = result[offset : offset + limit]\n" +
            "\n" +
            "return result"
          }
        />

        <RecallCard
          question={"Срез применяется после фильтров и сортировки."}
          answer={
            <p>
              {"Он работает с готовым представлением."}
            </p>
          }
        />

        <Callout tone="info">
          {"Не объединяйте всё в одну длинную comprehension."}
        </Callout>
      </Section>

      <Section number="08" title={"Практика query matrix"}>
        <Lead>
          {"Параметры проверяются отдельно и затем в комбинации."}
        </Lead>

        <div className="lesson-practice-steps">
          <h3>Default</h3>
          <p>
            {"GET /tasks."}
          </p>

          <h3>Bool</h3>
          <p>
            {"true и false."}
          </p>

          <h3>Границы</h3>
          <p>
            {"limit 1, 100, 0, 101."}
          </p>

          <h3>Search</h3>
          <p>
            {"Разный регистр."}
          </p>

          <h3>Sort</h3>
          <p>
            {"Допустимое и unknown."}
          </p>

        </div>

        <CodeBlock
          caption={"Postman matrix"}
          code={
            "GET {{base_url}}/tasks\n" +
            "GET {{base_url}}/tasks?is_done=false\n" +
            "GET {{base_url}}/tasks?q=fast\n" +
            "GET {{base_url}}/tasks?sort_by=priority\n" +
            "GET {{base_url}}/tasks?offset=0&limit=2\n" +
            "GET {{base_url}}/tasks?limit=0\n" +
            "GET {{base_url}}/tasks?sort_by=unknown"
          }
        />

        <TrueFalse
          statement={
            <>
              {"Query проверяется успешными и ошибочными cases."}
            </>
          }
          isTrue={true}
          explanation={"Это часть контракта."}
        />

        <Callout tone="info">
          {"Swagger должен показывать defaults и ограничения."}
        </Callout>

        <div className="lesson-check-group">
          <QuizCard
            question={"Для чего query?"}
            options={[
              "настроить collection",
              "выбрать id",
              "передать весь JSON",
            ]}
            correctIndex={0}
            explanation={"Query фильтрует."}
          />
          <QuizCard
            question={"Почему is not None?"}
            options={[
              "False допустим",
              "bool запрещён",
              "query всегда None",
            ]}
            correctIndex={0}
            explanation={"False нужно отличить."}
          />
          <QuizCard
            question={"Query(le=100)?"}
            options={[
              "максимум",
              "path",
              "sorting",
            ]}
            correctIndex={0}
            explanation={"Le задаёт верхнюю границу."}
          />
          <QuizCard
            question={"Когда slice?"}
            options={[
              "после filters",
              "до tasks",
              "в body",
            ]}
            correctIndex={0}
            explanation={"Берём страницу готового result."}
          />
        </div>

        <KeyTakeaways
          points={[
            <>{"Query настраивает collection."}</>,
            <>{"Default делает параметр optional."}</>,
            <>{"FastAPI преобразует типы."}</>,
            <>{"False отличается от None."}</>,
            <>{"Limit и offset используют slice."}</>,
            <>{"Query добавляет границы."}</>,
            <>{"Sorted сохраняет исходный список."}</>,
            <>{"Pipeline состоит из маленьких этапов."}</>,
          ]}
        />

        <PracticeCta text={"Добавьте is_done, q, sort_by, offset и limit, задайте границы и сохраните семь request."} />
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
        title={"Pydantic BaseModel и request body"}
        intro={"Перейдём от чтения к созданию: опишем форму новой задачи через BaseModel, получим JSON body в POST endpoint, увидим validation и добавим объект в память."}
        tags={[
          { icon: <Braces size={14} />, label: "BaseModel и schema" },
          { icon: <CheckCircle2 size={14} />, label: "POST body и 201" },
        ]}
      />
      <TheoryBridge lesson={56} />

      <Section number="01" title={"Почему dict недостаточно"}>
        <Lead>
          {"Произвольный dict скрывает required fields и заставляет вручную повторять проверки."}
        </Lead>

        <div className="lesson-practice-steps">
          <h3>Неявная форма</h3>
          <p>
            {"Из data: dict не видно полей."}
          </p>

          <h3>Ручная validation</h3>
          <p>
            {"Проверки keys повторяются."}
          </p>

          <h3>Документация</h3>
          <p>
            {"Swagger не знает schema."}
          </p>

          <h3>Решение</h3>
          <p>
            {"BaseModel объявляет fields и types."}
          </p>

        </div>

        <CodeBlock
          caption={"сравнение"}
          code={
            "def create_task(data: dict):\n" +
            "    title = data[\"title\"]\n" +
            "    priority = data[\"priority\"]\n" +
            "\n" +
            "class TaskCreate(BaseModel):\n" +
            "    title: str\n" +
            "    priority: int"
          }
        />

        <RecallCard
          question={"Pydantic schema яснее data: dict."}
          answer={
            <p>
              {"Поля видны в class."}
            </p>
          }
        />

        <Callout tone="info">
          {"BaseModel не создаёт бизнес-правила сам."}
        </Callout>
      </Section>

      <Section number="02" title={"Первая модель"}>
        <Lead>
          {"Pydantic-модель наследуется от BaseModel, а поля объявляются type hints."}
        </Lead>

        <div className="lesson-practice-steps">
          <h3>Импорт</h3>
          <p>
            {"from pydantic import BaseModel."}
          </p>

          <h3>Required</h3>
          <p>
            {"Нет default — поле обязательно."}
          </p>

          <h3>Types</h3>
          <p>
            {"str и int."}
          </p>

          <h3>Имя TaskCreate</h3>
          <p>
            {"Данные для создания, без server fields."}
          </p>

        </div>

        <CodeBlock
          caption={"TaskCreate"}
          code={
            "from pydantic import BaseModel\n" +
            "\n" +
            "\n" +
            "class TaskCreate(BaseModel):\n" +
            "    title: str\n" +
            "    priority: int"
          }
        />

        <TrueFalse
          statement={
            <>
              {"TaskCreate не должен получать id от клиента."}
            </>
          }
          isTrue={true}
          explanation={"Это server-generated field."}
        />

        <Callout tone="info">
          {"Id и is_done назначает сервер."}
        </Callout>
      </Section>

      <Section number="03" title={"Body в endpoint"}>
        <Lead>
          {"Параметр task: TaskCreate сообщает FastAPI, что JSON body должен соответствовать модели."}
        </Lead>

        <div className="lesson-practice-steps">
          <h3>Decorator</h3>
          <p>
            {"POST /tasks."}
          </p>

          <h3>Parameter</h3>
          <p>
            {"task: TaskCreate."}
          </p>

          <h3>Validation</h3>
          <p>
            {"До вызова handler."}
          </p>

          <h3>Access</h3>
          <p>
            {"task.title и task.priority."}
          </p>

        </div>

        <CodeBlock
          caption={"POST endpoint"}
          code={
            "@app.post(\"/tasks\")\n" +
            "def create_task(task: TaskCreate):\n" +
            "    return {\n" +
            "        \"title\": task.title,\n" +
            "        \"priority\": task.priority,\n" +
            "    }"
          }
        />

        <RecallCard
          question={"Pydantic-модель параметра берётся из body."}
          answer={
            <p>
              {"FastAPI распознаёт её автоматически."}
            </p>
          }
        />

        <Callout tone="info">
          {"Task является объектом модели, а не JSON-строкой."}
        </Callout>
      </Section>

      <Section number="04" title={"Validation 422"}>
        <Lead>
          {"Нет required field или неверный type приводит к структурированному 422 response."}
        </Lead>

        <div className="lesson-practice-steps">
          <h3>Missing</h3>
          <p>
            {"Нет priority."}
          </p>

          <h3>Wrong type</h3>
          <p>
            {"priority high."}
          </p>

          <h3>Handler</h3>
          <p>
            {"Не вызывается."}
          </p>

          <h3>State</h3>
          <p>
            {"Tasks не изменяется."}
          </p>

        </div>

        <CodeBlock
          caption={"invalid bodies"}
          code={
            "{\n" +
            "  \"title\": \"Pydantic\"\n" +
            "}\n" +
            "→ 422\n" +
            "\n" +
            "{\n" +
            "  \"title\": \"Pydantic\",\n" +
            "  \"priority\": \"high\"\n" +
            "}\n" +
            "→ 422"
          }
        />

        <TrueFalse
          statement={
            <>
              {"Invalid body не попадает в handler."}
            </>
          }
          isTrue={true}
          explanation={"Validation защищает state."}
        />

        <Callout tone="info">
          {"422 означает несоответствие data schema."}
        </Callout>
      </Section>

      <Section number="05" title={"Optional fields"}>
        <Lead>
          {"Некоторые поля можно не передавать. Type с None и default описывают отсутствие явно."}
        </Lead>

        <div className="lesson-practice-steps">
          <h3>Description</h3>
          <p>
            {"str | None = None."}
          </p>

          <h3>Tags</h3>
          <p>
            {"Field(default_factory=list)."}
          </p>

          <h3>Priority</h3>
          <p>
            {"Остаётся required."}
          </p>

          <h3>Swagger</h3>
          <p>
            {"Показывает required и optional."}
          </p>

        </div>

        <CodeBlock
          caption={"расширенная модель"}
          code={
            "from pydantic import BaseModel, Field\n" +
            "\n" +
            "class TaskCreate(BaseModel):\n" +
            "    title: str\n" +
            "    priority: int\n" +
            "    description: str | None = None\n" +
            "    tags: list[str] = Field(\n" +
            "        default_factory=list,\n" +
            "    )"
          }
        />

        <RecallCard
          question={"Optional field имеет default."}
          answer={
            <p>
              {"Без default оно осталось бы required."}
            </p>
          }
        />

        <Callout tone="info">
          {"Default_factory знаком по dataclass."}
        </Callout>
      </Section>

      <Section number="06" title={"Model_dump"}>
        <Lead>
          {"Для сохранения в список модель превращается в обычный dict через model_dump()."}
        </Lead>

        <div className="lesson-practice-steps">
          <h3>Object access</h3>
          <p>
            {"task.title."}
          </p>

          <h3>Dict</h3>
          <p>
            {"task.model_dump()."}
          </p>

          <h3>Не JSON text</h3>
          <p>
            {"Результат — Python dict."}
          </p>

          <h3>Дополнение</h3>
          <p>
            {"Server добавляет id и is_done."}
          </p>

        </div>

        <CodeBlock
          caption={"созданный dict"}
          code={
            "created_task = {\n" +
            "    \"id\": next_task_id,\n" +
            "    **task.model_dump(),\n" +
            "    \"is_done\": False,\n" +
            "}"
          }
        />

        <TrueFalse
          statement={
            <>
              {"Model_dump возвращает dict."}
            </>
          }
          isTrue={true}
          explanation={"Он удобен для распаковки."}
        />

        <Callout tone="info">
          {"В новом коде используем model_dump Pydantic v2."}
        </Callout>
      </Section>

      <Section number="07" title={"POST и 201 Created"}>
        <Lead>
          {"Endpoint вычисляет id, создаёт stored object, добавляет его в memory и возвращает со status 201."}
        </Lead>

        <div className="lesson-practice-steps">
          <h3>Status</h3>
          <p>
            {"201 Created."}
          </p>

          <h3>Id</h3>
          <p>
            {"max + 1."}
          </p>

          <h3>Append</h3>
          <p>
            {"После validation."}
          </p>

          <h3>Response</h3>
          <p>
            {"Созданный object с server fields."}
          </p>

        </div>

        <CodeBlock
          caption={"полный POST"}
          code={
            "@app.post(\n" +
            "    \"/tasks\",\n" +
            "    status_code=201,\n" +
            ")\n" +
            "def create_task(task: TaskCreate):\n" +
            "    created_task = {\n" +
            "        \"id\": get_next_task_id(),\n" +
            "        **task.model_dump(),\n" +
            "        \"is_done\": False,\n" +
            "    }\n" +
            "\n" +
            "    tasks.append(created_task)\n" +
            "\n" +
            "    return created_task"
          }
        />

        <RecallCard
          question={"Успешное создание возвращает 201."}
          answer={
            <p>
              {"Status и body остаются разными частями response."}
            </p>
          }
        />

        <Callout tone="info">
          {"201 задаётся в decorator, а не внутри body."}
        </Callout>
      </Section>

      <Section number="08" title={"Контрольная точка блока"}>
        <Lead>
          {"Один небольшой файл уже показывает path, query, body, validation и response."}
        </Lead>

        <div className="lesson-practice-steps">
          <h3>GET /tasks</h3>
          <p>
            {"Query и list."}
          </p>

          <h3>{"GET /tasks/{task_id}"}</h3>
          <p>
            {"Path и 404."}
          </p>

          <h3>POST /tasks</h3>
          <p>
            {"Body и 201."}
          </p>

          <h3>Swagger</h3>
          <p>
            {"Показывает schema."}
          </p>

          <h3>Postman</h3>
          <p>
            {"Хранит checks."}
          </p>
        </div>

        <CodeBlock
          caption={"карта"}
          code={
            "GET /tasks\n" +
            "query → list\n" +
            "\n" +
            "GET /tasks/{task_id}\n" +
            "path → task или 404\n" +
            "\n" +
            "POST /tasks\n" +
            "TaskCreate body → 201 или 422"
          }
        />

        <TrueFalse
          statement={
            <>
              {"Блок заканчивается in-memory API."}
            </>
          }
          isTrue={true}
          explanation={"Сложность повышается только после понимания контракта."}
        />

        <Callout tone="info">
          {"Роутеры, response models и база данных появятся позже."}
        </Callout>

        <div className="lesson-check-group">
          <QuizCard
            question={"Что описывает BaseModel?"}
            options={[
              "schema данных",
              "порт",
              "collection",
            ]}
            correctIndex={0}
            explanation={"Модель задаёт fields."}
          />

          <QuizCard
            question={"Откуда task: TaskCreate?"}
            options={[
              "body",
              "path",
              "header",
            ]}
            correctIndex={0}
            explanation={"Pydantic parameter означает body."}
          />

          <QuizCard
            question={"Что делает model_dump?"}
            options={[
              "dict",
              "server",
              "method",
            ]}
            correctIndex={0}
            explanation={"Возвращает словарь."}
          />

          <QuizCard
            question={"Status создания?"}
            options={[
              "201",
              "404",
              "422",
            ]}
            correctIndex={0}
            explanation={"Created — 201."}
          />
        </div>

        <KeyTakeaways
          points={[
            <>{"BaseModel делает request schema явной."}</>,
            <>{"Поля без default required."}</>,
            <>{"Validation выполняется до endpoint."}</>,
            <>{"Invalid body даёт 422."}</>,
            <>{"Optional field имеет default."}</>,
            <>{"Model_dump возвращает dict."}</>,
            <>{"Server назначает id."}</>,
            <>{"POST creation возвращает 201."}</>,
          ]}
        />

        <PracticeCta
          text={
            "Добавьте TaskCreate и POST /tasks, проверьте valid и invalid body, затем пройдите семь requests блока."
          }
        />
      </Section>

    </RichLesson>
  );
}
