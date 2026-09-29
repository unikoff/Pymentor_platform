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
import queryPipelineInfographic from "./images/query-filter-sort-limit.svg";
import lesson54PathSearchInfographic from "./images/lesson-54-path-search-flow.svg";
import pydanticRequestValidationFlow from "./images/pydantic-request-validation-flow.svg";

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
    link: "Первый endpoint подтвердил запуск. Теперь API начинает отдавать реальные данные StudyHub.",
    boundary: "GET описывает чтение и не должен скрыто добавлять, удалять или менять задачи.",
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
        intro={"В прошлом блоке мы записали контракт Planner API. Теперь отправим настоящий HTTP-запрос через клиент, увидим ответ и сохраним два проверяемых сценария, которые позже адаптируем под реальные маршруты нашего API."}
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
          {"Для первого опыта используем Postman Echo. Он принимает request и возвращает сведения о нём. К концу практики у нас будут два сценария: GET с параметрами в адресе (query) и POST с данными в теле запроса (body). Тело запишем как JSON, текст с именами полей и значениями. Когда подключим запросы к Planner, одного изменения base_url будет недостаточно: пути и ожидания тоже должны совпасть с контрактом API."}
        </p>
        <Callout tone="info">
          <strong>Новые слова.</strong> Echo означает «эхо»: сервис повторяет в ответе сведения о полученном запросе. <strong>Request</strong> это запрос клиента, <strong>response</strong> это ответ сервера.
        </Callout>
        <CodeBlock
          caption={"что мы научимся делать"}
          code={"выбрать method и URL\nдобавить query или body\nнажать Send\nпрочитать response\nсохранить сценарий и повторить его"}
        />
        <p>
          {"Это один цикл работы с запросом: сначала мы собираем сообщение, затем отправляем его и читаем ответ. Сохранение позволит повторить тот же опыт после занятия."}
        </p>
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
        <figure className="lesson-infographic">
          <img
            src={postmanEchoInfographic}
            alt="Postman отправляет HTTP request на сервер Echo. Echo возвращает HTTP response обратно в Postman."
            width={1672}
            height={836}
            loading="lazy"
            decoding="async"
          />
          <figcaption>Postman отправляет запрос; Echo возвращает ответ. Сервер Planner API пока не участвует в обмене.</figcaption>
        </figure>
        <p>
          {"Postman не является сервером, базой данных или интерфейсом сайта. Он не запускает Planner API и не исправляет ошибки автоматически. Зато он позволяет проверить request независимо от кнопок сайта. Если запрос уже неверен в Postman, искать ошибку в интерфейсе ещё рано."}
        </p>
        <p>
          {"В рабочих проектах API-клиент помогает проверить конкретный адрес и метод API, новый контракт и воспроизвести ошибку. Он дополняет автоматические тесты, которые повторяют проверки без ручных действий."}
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
        <p>
          {"Роли помогают не приписывать результат чужой системе. После отправки запроса важно назвать именно тот сервер, от которого пришёл ответ."}
        </p>
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
        <LinkedNotes variant="connected" items={[
          { title: "Method и URL", description: "Метод выражает действие, адрес показывает, куда отправить request." },
          { title: "Params и Headers", description: "Params добавляет параметры к URL. Headers передаёт служебные сведения, например формат body." },
          { title: "Body и Scripts", description: "Body содержит отправляемые данные. Scripts позволяет проверять ответ после обмена." },
          { title: "Send и Response", description: "Send запускает отправку. Response показывает status, headers и body, которые вернул сервер." },
        ]} />
        <p>
          {"Это названия полей Postman. Method выбирает действие, URL задаёт адрес, Params хранит параметры адреса, Headers хранит заголовки со сведениями о сообщении, Body хранит данные запроса. Scripts содержит короткие программы для проверки ответа, а Send означает «отправить»."}
        </p>
        <CodeBlock
          caption={"части request и response"}
          code={"REQUEST\nmethod + URL + Params + Headers + Body\n                     ↓ Send\n                    сервер\n                     ↓\nRESPONSE\nstatus + Headers + Body"}
        />
        <p>
          {"Верхняя часть схемы описывает то, что готовит клиент. Нижняя появляется только после Send и ответа сервера. Поэтому черновик запроса ещё не равен отправленному сообщению."}
        </p>
        <TrueFalse
          statement={<>{"Изменение полей в Postman уже отправляет сообщение серверу."}</>}
          isTrue={false}
          explanation={"Пока не нажата Send, в рабочей области меняется черновик request. Сервер ещё ничего не получил."}
        />
        <p>
          {"Не смешивайте вкладку Body, которая относится к исходящему request, с response body, который вернул сервер."}
        </p>
      </Section>

      <Section number="03" title={"Первый GET к Postman Echo"}>
        <Lead>
          {"Echo-сервис нужен, чтобы учиться работать с клиентом без подключения к реальному API. Он возвращает JSON, текст с именами полей и значениями, и не требует ключей Planner."}
        </Lead>
        <CodeBlock
          caption={"первый request"}
          code={"GET https://postman-echo.com/get"}
        />
        <p>
          {"Адрес состоит из схемы https, host postman-echo.com и path /get. После Send Postman показывает HTTP response. В успешном примере Echo возвращает status 200, JSON body и URL, по которому получил request."}
        </p>
        <p>
          {"Host это имя сервера, path это путь внутри него. Endpoint означает конкретную операцию: здесь GET по пути /get. Поле args в ответе Echo хранит параметры, полученные из адреса запроса."}
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
          {"Знак вопроса начинает query-часть URL, а знак & разделяет пары. Каждая пара состоит из имени и значения, например course=python. В таблицу Params добавьте course и block с их значениями. Echo покажет полученные пары в поле args своего ответа."}
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
          {"В Postman выберите POST, откройте Body, используйте raw и задайте формат JSON. Raw означает ввод тела как текста. Postman автоматически добавит Content-Type: application/json. Проверьте заголовок request, но не добавляйте такой же вручную. Имена полей и текстовые значения JSON пишутся в двойных кавычках. Число priority записывается без кавычек."}
        </p>
        <p>
          {"Content-Type описывает формат отправленного body. Accept сообщает, какой формат ответа предпочитает клиент. Это разные заголовки. В нашем примере Content-Type должен указывать на JSON."}
        </p>
        <CodeBlock
          caption={"что вернёт Echo"}
          code={'{\n  "json": {\n    "title": "Изучить HTTP",\n    "priority": 4\n  }\n}'}
        />
        <p>
          {"Echo отразил поля в json, но ничего не сохранил. Теперь сравните этот учебный обмен с контрактом создания Task в Planner."}
        </p>
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
            note: "Body переносит данные новой задачи.",
          }}
          preferred={"right"}
          explanation={"В контракте создания body описывает данные Task. Echo лишь отражает их и не сохраняет."}
        />
        <p>
          {"Status 200 относится к обработке тестового запроса Echo. Он не равен ожидаемому статусу создания задачи в Planner API."}
        </p>
      </Section>

      <Section number="06" title={"Читаем response и добавляем проверки"}>
        <Lead>
          {"Сначала изучите сам response, затем решите, какие ожидания стоит проверять автоматически. Status, headers и body отвечают на разные вопросы."}
        </Lead>
        <p>
          {"Status 200 подтверждает успешный сценарий на Echo, но не проверяет, вернулось ли ожидаемое поле. Для этого Postman может выполнить JavaScript после response. Такой код называют post-response script, то есть «скрипт после ответа». Его проверки появятся во вкладке Test Results, «результаты проверок»."}
        </p>
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
          {"Post-response script работает с уже полученным ответом. Посмотрим на одну проверку значения внутри JSON body."}
        </p>
        <CodeBlock
          caption={"проверка query-поля после ответа"}
          code={"const responseData = pm.response.json();\n\npm.test(\"Echo вернул course\", function () {\n  pm.expect(responseData.args.course).to.eql(\"python\");\n});"}
        />
        <p>
          {"pm.response.json() читает JSON body. Затем мы обращаемся к args.course. pm.test задаёт именованную проверку, а pm.expect сравнивает фактическое значение с ожидаемым. В практической части такую проверку применим к GET и POST."}
        </p>
        <TrueFalse
          statement={<>{"Зелёный status 200 сам по себе доказывает, что Echo получил нужный title."}</>}
          isTrue={false}
          explanation={"Status проверяет исход HTTP-обмена. Значение title нужно проверить отдельно в response body."}
        />
        <p>
          {"Проверка содержимого тоже может не пройти. В таком случае сначала посмотрите фактический response и выясните, где ожидание разошлось с ним."}
        </p>
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
        <p>
          {"Проверки Postman наблюдают реальный ответ внешнего сервиса. Они не заменяют тесты отдельных функций Python, которые позже проверят внутреннюю логику Planner."}
        </p>
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
        <p>
          {"В итоговом URL переменная заменит только адрес Echo. Путь /get и ожидаемые поля ответа останутся частью самого сценария."}
        </p>
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
          {"Отправить запрос через Lightweight API Client, облегчённый режим клиента Postman, можно без аккаунта. Но для сохранения collection и environment в рабочей области и их последующего экспорта в этой практике нужно войти в личный Postman workspace. Workspace означает рабочее пространство внутри Postman. Это вход в инструмент, а не на Echo: самому Echo ключи и данные для входа не нужны."}
        </p>
        <p>
          {"Не сохраняйте в общем экспорте пароли, токены и реальные персональные данные. Для учебной Echo-коллекции данные для входа не нужны."}
        </p>
        <Callout tone="info">
          <strong>Для дальнейшего чтения:</strong>{" "}<a href="https://learning.postman.com/docs/getting-started/quick-start" target="_blank" rel="noreferrer">первые действия в Postman</a>{", "}<a href="https://learning.postman.com/docs/developer/echo-api" target="_blank" rel="noreferrer">как работает Echo</a>{", "}<a href="https://learning.postman.com/docs/tests-and-scripts/write-scripts/test-scripts" target="_blank" rel="noreferrer">проверки после ответа</a>{" и "}<a href="https://learning.postman.com/docs/getting-started/importing-and-exporting/exporting-data" target="_blank" rel="noreferrer">сохранение коллекции в файл</a>{". Термины и нужные шаги уже объяснены в уроке."}
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
        <LinkedNotes items={[
          { title: "Роли", description: "Postman отправляет request, Echo возвращает response, тест сравнивает ответ с ожиданием." },
          { title: "Путь", description: "Подготовить папку проекта, создать collection и environment, добавить два request, изучить ответы, добавить проверки и экспортировать файлы в studyhub-api/postman/." },
          { title: "Доказательство", description: "Оба сценария повторно запускаются, проверки проходят, JSON-экспорт содержит collection и environment." },
          { title: "Граница", description: "Echo не является Planner API. Практика не создаёт задачу, не запускает FastAPI и не требует данных для входа." },
        ]} />
        <p>
          {"После экспорта у вас останутся два воспроизводимых запроса к Echo. В следующей работе добавим код сервера в тот же studyhub-api, а файлы Postman оставим на месте."}
        </p>
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
        <p>
          {"Теперь проверьте, какой вывод разрешает сделать успешный ответ от учебного сервиса."}
        </p>
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
        <p>
          {"Этот вывод ограничивает и остальные результаты урока: мы освоили обмен и проверки, а работу Planner API будем проверять после появления его маршрутов."}
        </p>
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
          {"В этой цепочке FastAPI описывает приложение и маршруты. Uvicorn запускает приложение как HTTP-сервер. Браузер, Swagger UI или Postman отправляет запрос и показывает ответ. Представьте меню, кухню и посетителя кафе: меню описывает заказ, кухня выполняет работу, посетитель передаёт заказ и получает результат. Техническое название связи FastAPI и Uvicorn, ASGI, разберём ниже."}
        </p>
        <CodeBlock
          caption={"Части локального URL"}
          code={"URL:    http://127.0.0.1:8000/health\n\n" +
            "scheme: http\n" +
            "host:   127.0.0.1\n" +
            "port:   8000\n" +
            "path:   /health"}
        />
        <p>
          {"Здесь http задаёт схему, 127.0.0.1 направляет запрос на эту же машину, а порт 8000 указывает, куда клиент попробует подключиться. После запуска его будет слушать Uvicorn. Path /health должен совпасть с зарегистрированным маршрутом. Локальный адрес сам по себе не публикует приложение в интернете."}
        </p>
        <Callout tone="info">
          <strong>Части адреса.</strong> Host это адрес компьютера-сервера. 127.0.0.1 возвращает запрос на ваш компьютер; такой адрес называют loopback. Port это номер сетевого входа программы. Path это путь к конкретной операции внутри приложения.
        </Callout>
        <RecallCard
          question={"Если в app/main.py есть маршрут, но Uvicorn не запущен, кто слушает порт 8000?"}
          answer={<p>{"Никто. Код маршрута описывает поведение приложения, но отдельный процесс должен запустить сервер и держать порт открытым."}</p>}
        />
        <p>
          {"Если host и port не заданы в команде, Uvicorn использует 127.0.0.1 и 8000 по умолчанию. Сам файл Python не начинает слушать порт после объявления маршрута."}
        </p>
      </Section>

      <Section number="01" title={"FastAPI создаёт приложение, но не запускает его"}>
        <Lead>
          {"FastAPI это Python-фреймворк для описания HTTP API. Мы создаём объект приложения, к которому затем добавим маршруты."}
        </Lead>
        <p>
          {"Фреймворк это готовая основа программы: он решает общие задачи, а мы задаём правила своего API. Экземпляр это конкретный объект, созданный по классу. Здесь им станет app."}
        </p>
        <p>
          {"Класс FastAPI предоставляет готовые механизмы, а конкретное поведение задаём мы. Вызов FastAPI(...) создаёт экземпляр. Переменная app станет местом, где приложение собирается и где регистрируются endpoint."}
        </p>
        <CodeBlock
          caption={"Объект приложения"}
          code={"from fastapi import FastAPI\n\n" +
            "app = FastAPI(title=\"StudyHub Planner API\")"}
        />
        <p>
          {"Параметр title даёт API понятное название. Он не меняет URL и не задаёт правила обработки запросов. Вызов FastAPI() также не открывает сетевой порт: для этого позднее запустим сервер."}
        </p>
        <TrueFalse
          statement={<>{"После выполнения app = FastAPI() Python уже принимает запросы на порту 8000."}</>}
          isTrue={false}
          explanation={"Создан только объект приложения. Сетевой сервер и открытый порт появятся после запуска Uvicorn."}
        />
      </Section>

      <Section number="02" title={"Endpoint связывает method, path и функцию"}>
        <Lead>
          {"Маршрут описывает, какую функцию вызвать для конкретной пары HTTP-метода и path."}
        </Lead>
        <p>
          {"Endpoint, или маршрут, это сочетание метода и пути, связанное с функцией. GET /status и POST /status являются разными операциями. Декоратор @app.get(\"/status\") регистрирует обработчик для GET по этому пути."}
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
        <p>
          {"В примере декоратор связывает GET /status с read_status. При импорте модуля FastAPI запоминает маршрут; тело функции выполнится только для подходящего запроса."}
        </p>
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
          {"ASGI, Asynchronous Server Gateway Interface, это общий интерфейс связи сервера и Python-приложения. Представьте стандартный разъём: Uvicorn передаёт сведения о запросе, а FastAPI формирует ответ. Асинхронное выполнение изучим позже; здесь функция маршрута может быть обычной def. Внутренние функции ASGI сейчас запоминать не нужно."}
        </p>
        <figure className="lesson-infographic">
          <img
            src={fastapiUvicornInfographic}
            alt="Клиент отправляет GET /health серверу Uvicorn. Uvicorn передаёт запрос приложению FastAPI, которое находит маршрут и возвращает response клиенту через Uvicorn."
            width={1672}
            height={836}
            loading="lazy"
            decoding="async"
          />
          <figcaption>Uvicorn принимает HTTP и передаёт запрос FastAPI. Приложение находит GET /health и готовит ответ, а Uvicorn возвращает его клиенту.</figcaption>
        </figure>
        <p>
          {"Мы запустим сервер из командной строки. Флаг --reload следит за изменениями файлов и перезапускает процесс. Это удобно при разработке, но не заменяет настройку рабочего сервера для пользователей."}
        </p>
        <CodeBlock
          caption={"Команда запуска"}
          code={"python -m uvicorn app.main:app --reload\n\n" +
            "app.main : app\n" +
            "модуль    : объект FastAPI"}
        />
        <p>
          {"После запуска Uvicorn сможет принимать обращения к приложению. Проверьте порядок действий от клиентского request до полученного response."}
        </p>
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

      <Section number="05" title={"Как команда находит приложение"}>
        <Lead>
          {"Команда запуска сообщает Uvicorn, где найти модуль и какой объект импортировать. Поэтому важны имена файлов и рабочая директория."}
        </Lead>
        <Callout tone="info">
          <strong>Слова Python.</strong> Модуль это файл с кодом, например main.py. Пакет это папка, из которой можно загрузить модули; здесь это app/. Импортировать означает найти и загрузить код по имени. Запись app.main:app указывает модуль и объект внутри него.
        </Callout>
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
        <LinkedNotes items={[
          { title: "Ошибка импорта при запуске", description: "Uvicorn не загрузил app.main или не нашёл переменную app. Клиентский запрос ещё не обработан." },
          { title: "Отказ в соединении (Connection refused)", description: "По адресу и порту никто не слушает либо сервер уже остановлен. HTTP response от приложения не получен." },
          { title: "HTTP 404", description: "Соединение состоялось, сервер ответил, но запрошенный path не зарегистрирован." },
          { title: "HTTP 405", description: "Path существует, но сервер не разрешает для него отправленный method, например POST /health при единственном GET /health." },
          { title: "HTTP 200", description: "Маршрут найден и обработчик завершился успешно. Body всё ещё нужно сравнить с ожиданием." },
        ]} />
        <p>
          {"Ответы 404, 405 и 200 означают, что клиент уже получил HTTP response. Ошибку импорта и отказ в соединении нужно разбирать раньше, на этапе запуска или подключения."}
        </p>
        <CodeBlock
          caption={"Пример границы"}
          code={"GET /health  → 200, если маршрут зарегистрирован\n" +
            "GET /        → 404, если маршрут корня не объявляли\n" +
            "POST /health → 405, если зарегистрирован только GET\n" +
            "сервер не запущен → connection refused"}
        />
        <p>
          {"В этом примере GET /health показывает работающий маршрут, а GET / и POST /health проверяют две разные причины отказа. Сравнивайте конкретную пару method и path."}
        </p>
        <TrueFalse
          statement={<>{"Если GET /health работает, то GET / обязан возвращать тот же ответ."}</>}
          isTrue={false}
          explanation={"Каждый method и path должны быть зарегистрированы. Маршрут /health не создаёт автоматически маршрут корня /."}
        />
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
          {"В /docs мы раскроем GET /health. Try it out означает «подготовить пробный запрос», Execute означает «отправить его». Затем проверим status и body. Сам маршрут всё равно объявлен в коде приложения. Документация помогает увидеть контракт, но не доказывает, что правила приложения верны, и не заменяет автоматические тесты."}
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
        <p>
          {"На локальном сервере этот экран помогает исследовать известные маршруты. При публикации API доступ к интерактивной документации настраивают отдельно."}
        </p>
        <Callout tone="warn">
          {"На рабочем сервере публичную интерактивную документацию включают осознанно. Она раскрывает устройство API."}
        </Callout>
      </Section>

      <Section number="08" title={"Что мы будем делать в практике"}>
        <Lead>
          {"Продолжим studyhub-api из прошлой работы. Сохраним существующую папку postman с экспортами и добавим серверную часть, проверив её через HTTP."}
        </Lead>
        <p>
          {"Папка studyhub-api уже содержит postman-экспорты. Не удаляйте их и не создавайте второй проект. Добавьте в корень виртуальное окружение .venv: оно отделяет библиотеки этого проекта от других Python-программ. pip это инструмент установки пакетов; запись python -m pip запускает его через выбранный Python. Затем внутри пакета app создадим объект приложения и один GET /health. Маршрут вернёт status=ok, а сервер запустит его из корня проекта."}
        </p>
        <p>
          {"Мы проверим status и JSON body напрямую, затем повторим запрос через /docs. После этого намеренно запустим команду из неверной папки, прочитаем ошибку импорта и восстановим правильный запуск. В конце запишем команды в README.md, инструкцию для человека. requirements.txt сохранит список пакетов для нового окружения. Сам каталог .venv обычно не включают в Git, систему хранения изменений проекта. Если проект ведётся в Git, правило .venv/ добавляют в .gitignore, файл со списком пропускаемых путей. На этом шаге Git-настройку не выполняем."}
        </p>
        <p>
          {"Команда python -m pip freeze показывает установленные пакеты с их версиями. Знак > в командной строке сохраняет этот список в файл. Список помогает повторить установку, но другому человеку всё равно нужна инструкция с порядком команд."}
        </p>
        <LinkedNotes items={[
          { title: "FastAPI", description: "Объект приложения и маршрут." },
          { title: "Endpoint", description: "GET /health и короткий JSON-ответ." },
          { title: "Uvicorn", description: "HTTP-сервер и команда запуска, записанная в README." },
          { title: "Клиент и Swagger", description: "Внешняя проверка status, body и описанного маршрута." },
        ]} />
        <p>
          {"Мы не добавляем список задач, проверку структуры данных, базу, авторизацию или публикацию рабочего сервера. Следующая работа расширит уже запущенное приложение маршрутами чтения. Сейчас важно отделить настройку сервера от поведения данных."}
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
        <p>
          {"Если вы можете разделить роли клиента, Uvicorn, FastAPI и endpoint, можно переходить к самостоятельной сборке проекта."}
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
        intro={"В прошлом занятии мы запустили FastAPI и проверили GET /health. Теперь добавим маршрут со списком задач и маршрут со сводкой по нему. Оба будут читать один временный список."}
        tags={[
          { icon: <ListChecks size={14} />, label: "GET и чтение" },
          { icon: <FileText size={14} />, label: "Python → JSON" },
        ]}
      />
      <TheoryBridge lesson={53} />

      <Section number="00" title={"От проверки запуска к первым данным"}>
        <Lead>
          {"GET /health подтвердил, что приложение отвечает. Теперь посмотрим, как оно может отдавать данные Planner."}
        </Lead>
        <p>
          {"Продолжим существующий studyhub-api. GET /tasks покажет список, а GET /stats покажет подсчёт по нему. Список пока будет обычной переменной Python. Мы не добавляем ввод данных или постоянное хранилище."}
        </p>
        <CodeBlock
          caption={"три понятные операции"}
          code={"GET /health  → короткий ответ о работе приложения\n" +
            "GET /tasks   → текущий список задач\n" +
            "GET /stats   → подсчёт по этому списку"}
        />
        <p>
          {"У каждой операции есть свой путь и понятная роль. Ответ /stats будет опираться на те же данные, которые показывает /tasks."}
        </p>
        <Callout tone="info">
          <strong>Новые слова.</strong> Endpoint, или маршрут, это доступная по HTTP операция, заданная методом и путём. Request это запрос клиента, response это ответ сервера. В этой главе два новых маршрута будут только читать данные.
        </Callout>
        <p>
          {"Список задач целиком называют коллекцией. Пока клиент просит показать данные, приложение не должно менять их. Так мы сначала поймём форму ответа, а затем перейдём к созданию и изменению задач."}
        </p>
      </Section>

      <Section number="01" title={"GET читает, а не меняет список"}>
        <Lead>
          {"Метод HTTP выражает намерение клиента. GET используют, когда нужно увидеть текущее состояние."}
        </Lead>
        <p>
          {"Если человек обновляет страницу списка, он ожидает увидеть те же данные. GET не должен добавлять, удалять или редактировать задачу. Метод называют безопасным, когда сам запрос предназначен для чтения. Сервер всё ещё может записать технический журнал, но не должен менять данные списка из-за чтения."}
        </p>
        <MatchPairs
          prompt={"Сопоставьте запрос с его назначением."}
          leftTitle={"Запрос"}
          rightTitle={"Что он делает"}
          pairs={[
            { left: "GET /tasks", right: "Показывает весь список" },
            { left: "GET /stats", right: "Показывает подсчёт по списку" },
          ]}
          explanation={"Оба запроса читают состояние. Ни один не создаёт задачу и не меняет её."}
        />
        <p>
          {"Такое разделение даёт предсказуемость. Клиент может повторить GET или открыть его в браузере, не опасаясь, что простое чтение изменит данные."}
        </p>
        <TrueFalse
          statement={<>{"Обновление страницы GET /tasks должно добавить ещё одну задачу."}</>}
          isTrue={false}
          explanation={"Клиент попросил показать состояние. Добавление данных относится к другой операции, которой в этой работе ещё нет."}
        />
      </Section>

      <Section number="02" title={"Список живёт в памяти процесса"}>
        <Lead>
          {"До базы данных используем знакомые структуры Python: список и словари."}
        </Lead>
        <p>
          {"Словарь Python (dict) описывает одну запись, а список (list) объединяет записи в заданном порядке. Пример ниже использует объявления, чтобы показать структуру данных без готового кода маршрута задач."}
        </p>
        <CodeBlock
          caption={"обычные данные Python"}
          code={"notices = [\n" +
            "    {\"text\": \"Проверить расписание\", \"active\": True},\n" +
            "    {\"text\": \"Обновить страницу\", \"active\": False},\n" +
            "]"}
        />
        <p>
          {"Этот список хранится в оперативной памяти компьютера, пока работает программа Python. Запущенная программа называется процессом. После остановки и нового запуска файл выполнится заново и создаст список из начальных значений."}
        </p>
        <CodeSequence
          title={"Что происходит при перезапуске"}
          prompt={"Соберите порядок появления начального списка."}
          pieces={[
            { id: "stop", code: "процесс приложения остановился" },
            { id: "start", code: "Uvicorn запускает новый процесс" },
            { id: "file", code: "Python снова читает файл приложения" },
            { id: "list", code: "список создаётся из начальных значений в файле" },
          ]}
          correctOrder={["stop", "start", "file", "list"]}
          explanation={"Память старого процесса освобождается. Новый процесс начинает с того, что записано в приложении."}
        />
        <p>
          {"Режим --reload из прошлого занятия делает это заметным: после изменения файла приложение запускается заново и перечитывает начальные данные. Такой список удобен для учебного чтения, но не сохраняет изменения между запусками."}
        </p>
        <Callout tone="info">
          <strong>In-memory</strong> означает «в оперативной памяти». База данных и отдельное хранилище появятся позже.
        </Callout>
      </Section>

      <Section number="03" title={"FastAPI преобразует Python в JSON"}>
        <Lead>
          {"Маршрут возвращает привычное значение Python. FastAPI формирует из него HTTP-ответ для браузера, Swagger UI и Postman."}
        </Lead>
        <p>
          {"Словарь превращается в JSON-объект с полями, список становится JSON-массивом. Python True и False в JSON записываются как true и false, а None становится null."}
        </p>
        <CodeBlock
          caption={"одни данные в двух форматах"}
          code={"Python: {\"active\": True, \"note\": None}\n" +
            "JSON:   {\"active\": true, \"note\": null}"}
        />
        <p>
          {"FastAPI преобразует такие значения автоматически. Функция json.dumps вручную превращает значение в строку JSON. В маршруте FastAPI обычно возвращают исходный список или словарь, чтобы сохранить структуру данных. Заголовок Content-Type: application/json сообщает клиенту, что тело ответа записано в формате JSON."}
        </p>
        <FillBlank
          prompt={"Во что FastAPI преобразует Python-список?"}
          before={"Python list → JSON "}
          after={""}
          options={["массив в квадратных скобках", "объект в фигурных скобках", "текстовую строку"]}
          answer={"массив в квадратных скобках"}
          explanation={"Список остаётся набором элементов и в JSON обозначается квадратными скобками."}
        />
        <p>
          {"Успешный GET по умолчанию возвращает HTTP-статус 200. Статус находится вне JSON-тела. Поле status внутри JSON, если оно есть, является обычными данными."}
        </p>
      </Section>

      <Section number="04" title={"GET /tasks всегда возвращает список"}>
        <Lead>
          {"Количество задач меняется, форма ответа остаётся прежней."}
        </Lead>
        <p>
          {"GET /tasks возвращает текущий список. FastAPI преобразует его в JSON-массив, сохраняя порядок. У записи четыре поля: id (целое число), title (текст), priority (целое число) и is_done (логическое значение true или false). Такая форма предсказуема для кода клиента. Маршрут читает коллекцию целиком и не принимает дополнительные значения."}
        </p>
        <CodeBlock
          caption={"пример тела ответа"}
          code={"[\n" +
            "  {\"id\": 1, \"title\": \"Повторить HTTP\", \"priority\": 4, \"is_done\": false},\n" +
            "  {\"id\": 2, \"title\": \"Запустить FastAPI\", \"priority\": 5, \"is_done\": true}\n" +
            "]"}
        />
        <p>
          {"Если задач нет, успешный ответ всё равно будет пустым массивом []. Маршрут существует, просто элементов пока нет. Стабильная форма удобна клиенту: массив приходит при нуле, одной или нескольких задачах."}
        </p>
        <QuizCard
          question={"Какой ответ подходит для существующего GET /tasks с пустым списком?"}
          options={[
            "HTTP 200 и JSON-массив []",
            "HTTP 200 и текст «пусто»",
            "HTTP 200 и строка, содержащая []",
          ]}
          correctIndex={0}
          explanation={"Список успешно прочитан, хотя элементов в нём нет. Пустое состояние не превращает массив в текст."}
        />
        <p>
          {"Проверяйте статус и тело отдельно. Статус 200 говорит об успешной обработке, массив в теле содержит данные."}
        </p>
      </Section>

      <Section number="05" title={"GET /stats считает по тому же списку"}>
        <Lead>
          {"Сводка вычисляется из задач при запросе и не хранит собственную копию состояния."}
        </Lead>
        <p>
          {"В ответе будут total, open и done. Total означает общее количество. Open считает незавершённые задачи, done считает завершённые. Для двух задач, где одна открыта, а вторая завершена, числа будут 2, 1 и 1."}
        </p>
        <CodeBlock
          caption={"пример JSON-сводки"}
          code={'{"total": 2, "open": 1, "done": 1}'}
        />
        <p>
          {"Проследите за двумя маршрутами на схеме. Они читают один и тот же список, но готовят разные представления для клиента: полный массив и краткую сводку."}
        </p>
        <figure className="lesson-infographic">
          <img
            src={lesson53ReadModelInfographic}
            alt="Маршруты GET /tasks и GET /stats читают один список задач: первый возвращает JSON-массив, второй объект со счётчиками total, open и done."
            width={1672}
            height={836}
            loading="lazy"
            decoding="async"
          />
          <figcaption>
            {"Один список служит источником для двух ответов. Зелёные стрелки показывают обращение на чтение, голубые показывают подготовку JSON-ответа."}
          </figcaption>
        </figure>
        <p>
          {"Обратите внимание: ни один маршрут не создаёт собственную копию списка. /tasks возвращает его элементы, а /stats заново группирует те же элементы по is_done. Поэтому изменение источника должно отражаться в обоих ответах."}
        </p>
        <p>
          {"Это JSON-объект с именованными числами. Для пустого списка все три значения будут равны нулю."}
        </p>
        <p>
          {"Чтобы получить счётчики, сервер проходит список циклом. Для каждого элемента он проверяет is_done и увеличивает ровно одну из двух групп. Общее количество можно узнать по длине списка. Пересчёт при запросе не даёт сводке разойтись с исходными данными."}
        </p>
        <FillBlank
          prompt={"Добавили одну открытую задачу. На сколько увеличится счётчик open?"}
          before={"open: "}
          after={""}
          options={["+1", "0", "-1"]}
          answer={"+1"}
          explanation={"Общее число и количество открытых увеличатся на один. Число завершённых останется прежним."}
        />
        <p>
          {"Перед отправкой запроса можно проверить согласованность трёх чисел: каждая задача должна попасть ровно в одну из двух групп."}
        </p>
        <Callout tone="info">
          <strong>Проверка сводки.</strong> Каждая задача относится к одной из двух групп. Поэтому total должен равняться сумме open и done.
        </Callout>
      </Section>

      <Section number="06" title={"Проверяем один сервер разными клиентами"}>
        <Lead>
          {"Браузер, Swagger UI и Postman отправляют запросы к одним и тем же маршрутам."}
        </Lead>
        <p>
          {"Браузер удобен для быстрого GET. Swagger UI показывает операции на странице /docs и позволяет вызвать их. Postman помогает сохранить запрос и повторить его. Меняется интерфейс клиента, а адрес и ответ задаёт сервер."}
        </p>
        <p>
          {"Сохранённые запросы Postman /get и /post направлены на Echo. Для Planner создайте отдельные GET-запросы к http://127.0.0.1:8000/tasks и http://127.0.0.1:8000/stats. Одной заменой базового адреса Echo-сценарий не перенастроить: его путь и ожидаемые данные тоже другие."}
        </p>
        <MatchPairs
          prompt={"Сопоставьте наблюдение и то, что оно подтверждает."}
          leftTitle={"Наблюдение"}
          rightTitle={"Что узнаём"}
          pairs={[
            { left: "HTTP 200", right: "Запрос обработан успешно" },
            { left: "Content-Type", right: "Формат тела ответа" },
            { left: "Тело /tasks", right: "Текущий список и порядок" },
            { left: "Тело /stats", right: "Подсчёт по списку" },
          ]}
          explanation={"Статус, заголовок и тело отвечают на разные вопросы. Сверяйте их по отдельности."}
        />
        <p>
          {"Порядок проверки помогает разделить проблему подключения от неверного содержимого. Сначала нужен работающий сервер, затем уже сравниваем ответ с ожидаемым."}
        </p>
        <CodeSequence
          title={"Путь проверки через Postman"}
          prompt={"Расставьте действия в порядке проверки локального GET."}
          pieces={[
            { id: "run", code: "убедиться, что Uvicorn запущен" },
            { id: "send", code: "отправить GET на локальный путь" },
            { id: "headers", code: "проверить статус и Content-Type" },
            { id: "body", code: "сравнить JSON с текущими данными" },
          ]}
          correctOrder={["run", "send", "headers", "body"]}
          explanation={"Сначала сервер должен принять соединение. Затем отдельно проверяются статус, формат и данные ответа."}
        />
      </Section>

      <Section number="07" title={"Что мы будем делать в практике"}>
        <Lead>
          {"Продолжим существующий studyhub-api и добавим первую полезную поверхность чтения."}
        </Lead>
        <p>
          {"Сначала подготовим временный список. GET /tasks будет возвращать его как JSON-массив, а GET /stats посчитает общее количество открытых и завершённых задач по тем же записям. Так мы построим два полезных ответа вокруг одного источника данных."}
        </p>
        <LinkedNotes items={[
          { title: "Источник", description: "Один временный список в памяти процесса с двумя задачами в разных состояниях." },
          { title: "Маршруты", description: "GET /tasks возвращает список, GET /stats вычисляет total, open и done." },
          { title: "Проверка", description: "Swagger UI и отдельные Postman-запросы показывают статус 200, JSON и ожидаемые данные." },
          { title: "Граница", description: "Маршруты ничего не меняют. Создание задач и постоянное хранилище появятся позже." },
        ]} />
        <p>
          {"Через Swagger UI и Postman сравним статус, формат и содержание ответов. Затем временно изменим список, сначала предскажем последствия, а после проверки вернём исходные данные. Отдельно убедимся, что пустая коллекция не ломает форму ответов."}
        </p>
        <PracticeCta text={"Добавьте два маршрута чтения, проверьте их через Swagger UI и Postman, а затем подтвердите, что оба ответа отражают один и тот же текущий список."} />
      </Section>

      <Section number="08" title={"Самопроверка перед практикой"}>
        <Lead>
          {"Объясните цепочку своими словами: где лежат данные, что делает GET и как клиент получает JSON."}
        </Lead>
        <div className="lesson-check-group">
          <QuizCard
            question={"Что делает GET /tasks?"}
            options={[
              "Читает и возвращает текущий список",
              "Создаёт задачу при каждом запросе",
              "Сохраняет список в базе",
            ]}
            correctIndex={0}
            explanation={"В этом упражнении GET только читает временные данные."}
          />
          <QuizCard
            question={"Во что FastAPI преобразует Python-список?"}
            options={["JSON-массив", "HTTP-заголовок", "Метод запроса"]}
            correctIndex={0}
            explanation={"Список становится JSON-массивом в теле ответа."}
          />
          <RecallCard
            question={"В списке одна открытая и одна завершённая задача. Какова сводка?"}
            answer={<p>{"total = 2, open = 1, done = 1."}</p>}
          />
        </div>
        <p>
          {"В следующем занятии мы научимся выбрать одну задачу по адресу. Здесь мы подготовили понятную коллекцию и научились читать её, не меняя данные."}
        </p>
        <KeyTakeaways
          points={[
            <>{"GET читает текущее состояние и не меняет список."}</>,
            <>{"Список в памяти процесса сбрасывается после перезапуска."}</>,
            <>{"FastAPI превращает Python list и dict в JSON-массив и объект."}</>,
            <>{"Пустой GET /tasks возвращает массив []."}</>,
            <>{"GET /stats вычисляет числа по тому же списку."}</>,
            <>{"Статус, Content-Type и тело ответа проверяются отдельно."}</>,
          ]}
        />
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
        title={"54. Path-параметры и поиск объекта"}
        intro={"GET /tasks уже возвращает коллекцию. Теперь разберём, как адрес указывает на одну задачу, как FastAPI проверяет её id и почему корректное число ещё не означает, что запись найдена."}
        tags={[
          { icon: <KeyRound size={14} />, label: "id в адресе" },
          { icon: <GitBranch size={14} />, label: "поиск · 404 · 422" },
        ]}
      />
      <TheoryBridge lesson={54} />

      <Section number="00" title={"От списка к одной задаче"}>
        <Lead>
          {"В прошлой работе Planner API научился возвращать весь список. Теперь представьте, что пользователь выбрал одну строку и хочет открыть подробности именно этой задачи."}
        </Lead>
        <p>
          {"Адрес /tasks/4 указывает на запись с id 4. Здесь id означает устойчивый идентификатор, а не позицию задачи в списке. Нам предстоит проследить путь значения: от URL до Python-функции, затем до поиска в данных."}
        </p>
        <Callout tone="info">
          <strong>Новые слова.</strong> Collection, или коллекция, это набор записей. Item означает один элемент набора. Path означает путь после домена и порта, например /tasks/4. Path-параметр это изменяемая часть пути, которая передаёт значение в функцию.
        </Callout>
        <p>
          {"Здесь есть два отдельных вопроса. Можно ли прочитать значение из адреса как целое число? Есть ли задача с таким числом? Разделение этих проверок позволит API точно объяснить причину неудачи."}
        </p>
        <RecallCard
          question={"В списке есть задача с id = 4. Что должен вернуть GET /tasks/4: весь список или одну задачу?"}
          answer={<p>{"Одна задача. Номер в конце адреса выбирает item из коллекции."}</p>}
        />
      </Section>

      <Section number="01" title={"Коллекция и отдельный ресурс"}>
        <Lead>
          {"Путь сообщает, какой объём данных просит клиент: набор целиком или один элемент."}
        </Lead>
        <p>
          {"GET /tasks отвечает на вопрос «какие задачи есть?». GET /tasks/4 отвечает на вопрос «что известно о задаче с id 4?». Это два адреса одного семейства, но они обозначают разный масштаб чтения. Здесь ресурс означает объект, к которому обращается API, например одну задачу или книгу."}
        </p>
        <CodeBlock
          caption={"каталог книг: тот же принцип"}
          code={"GET /books       → коллекция книг\n" +
            "GET /books/17    → книга с id 17\n\n" +
            "Маршрут-шаблон: /books/{book_id}\n" +
            "Реальный запрос: /books/17"}
        />
        <p>
          {"Фигурные скобки в шаблоне показывают место переменной части. В реальном запросе клиент подставляет туда значение и не отправляет сами скобки. Это удобнее, чем каждый раз передавать весь список клиенту и просить его искать запись самостоятельно."}
        </p>
        <MatchPairs
          prompt={"Соедините адрес и смысл запроса."}
          leftTitle={"Адрес"}
          rightTitle={"Что выбирается"}
          pairs={[
            { left: "GET /books", right: "Весь набор книг" },
            { left: "GET /books/17", right: "Одна книга с id 17" },
            { left: "/books/{book_id}", right: "Шаблон с переменной частью" },
          ]}
          explanation={"Число после /books сужает запрос до одного элемента. Фигурные скобки показывают место значения в объявлении маршрута."}
        />
        <p>
          {"В этом занятии endpoint означает доступную через HTTP операцию, заданную методом, путём и функцией Python. Два реальных адреса /books/17 и /books/18 могут использовать один endpoint-шаблон."}
        </p>
      </Section>

      <Section number="02" title={"Как значение попадает в Python"}>
        <Lead>
          {"Path-параметр связывает переменную часть маршрута с аргументом функции."}
        </Lead>
        <p>
          {"В FastAPI имя в фигурных скобках должно совпадать с именем аргумента, куда попадёт значение. Аннотация int сообщает, что для этого параметра ожидается целое число. Следующий фрагмент предполагает, что объект приложения app уже создан."}
        </p>
        <CodeBlock
          caption={"показан только перенос значения"}
          code={"@app.get(\"/books/{book_id}\")\n" +
            "def read_book(book_id: int):\n" +
            "    return {\"requested_id\": book_id}"}
        />
        <p>
          {"Запрос GET /books/17 передаст число 17 в аргумент book_id. Этот короткий пример пока ничего не ищет. Он показывает только связь между местом параметра в пути и аргументом функции."}
        </p>
        <CodeSequence
          title={"Из URL в аргумент"}
          prompt={"Расставьте события после запроса GET /books/17."}
          pieces={[
            { id: "url", code: "FastAPI находит значение в части пути {book_id}" },
            { id: "type", code: "проверяет и преобразует значение согласно int" },
            { id: "function", code: "передаёт число 17 аргументу функции" },
          ]}
          correctOrder={["url", "type", "function"]}
          explanation={"Сначала значение берётся из URL, затем приводится к ожидаемому типу. Только после успешной проверки вызывается функция."}
        />
        <p>
          {"Если преобразование не удалось, FastAPI остановит запрос до вызова read_book. Если оно прошло, функция получит обычное целое число Python."}
        </p>
        <Callout tone="info">
          <strong>Аннотация типа.</strong> Запись book_id: int описывает ожидаемый тип аргумента. Для параметра пути FastAPI использует её, чтобы проверить и разобрать входное значение до вызова функции.
        </Callout>
      </Section>

      <Section number="03" title={"Идентификатор не равен позиции"}>
        <Lead>
          {"Номер записи остаётся с ней, а позиция зависит от порядка элементов."}
        </Lead>
        <p>
          {"В списке ниже первая книга имеет id 17 и позицию 0. Вторая имеет id 4 и позицию 1. Индексация list начинается с нуля, а id хранится внутри словаря."}
        </p>
        <CodeBlock
          caption={"два разных числа"}
          code={"books = [\n" +
            "    {\"id\": 17, \"title\": \"Python\"},  # позиция 0\n" +
            "    {\"id\": 4, \"title\": \"HTTP\"},     # позиция 1\n" +
            "]"}
        />
        <p>
          {"Если отсортировать список или удалить запись, позиция книги может измениться. Идентификатор 4 при этом продолжит обозначать ту же книгу. Внутри одной коллекции id должны быть уникальными, иначе адрес не сможет выбрать между двумя записями с одинаковым id. В нашем примере попытка взять позицию 4 завершится ошибкой, потому что в списке только две книги. Если записей станет больше, позиция всё равно не обязана совпасть с id. Поэтому /books/4 означает «найди словарь с id равным 4», а не «возьми books[4]»."}
        </p>
        <BugHunt
          code={"requested_id = 4\nbook = books[requested_id]"}
          question={"Почему такой поиск ненадёжен?"}
          options={[
            "Индекс 4 означает пятую позицию, а не поле id",
            "Идентификаторы нельзя передавать в URL",
            "Список всегда хранит элементы в порядке id",
          ]}
          correctIndex={0}
          explanation={"Позиция меняется вместе с порядком списка. Для адреса нужно сравнить значение поля id у записей."}
        />
        <p>
          {"В маленьком списке Python может просмотреть записи по очереди. В более крупной базе данных поиск по id обычно ускоряют индексом, отдельной структурой для быстрого нахождения записей по значению поля. Для клиента смысл остаётся тем же: запросить одну запись по её устойчивому идентификатору."}
        </p>
      </Section>

      <Section number="04" title={"422 означает неверный тип, 404 означает отсутствие"}>
        <Lead>
          {"Число может быть оформлено правильно, но не соответствовать существующей задаче."}
        </Lead>
        <p>
          {"URL передаёт символы. FastAPI пытается преобразовать их в тип, который объявлен для параметра. Строка 17 подходит для int. Строка abc не подходит. В последнем случае FastAPI возвращает 422 и не вызывает функцию поиска."}
        </p>
        <p>
          {"Число 999 проходит проверку типа. Затем код приложения ищет запись с таким id. Если её нет, маршрут возвращает 404 Not Found. Поэтому 422 и 404 описывают разные этапы, а не два варианта одного сообщения «не нашлось». Числовой статус ответа называют кодом состояния HTTP."}
        </p>
        <MatchPairs
          prompt={"Сопоставьте запрос, причину и ожидаемый результат."}
          leftTitle={"Запрос"}
          rightTitle={"Результат"}
          pairs={[
            { left: "/tasks/1, запись есть", right: "200: тип подходит, запись найдена" },
            { left: "/tasks/999, записи нет", right: "404: корректный id отсутствует" },
            { left: "/tasks/abc", right: "422: значение не подходит к int" },
          ]}
          explanation={"Для 422 поиск ещё не запускался. Для 404 число уже корректно, но запись не обнаружена."}
        />
        <p>
          {"Один статус описывает неверное значение на входе, другой сообщает, что корректно заданный ресурс не найден. Теперь проверьте, на каком этапе остановится запрос с текстом вместо числа."}
        </p>
        <QuizCard
          question={"Какой этап не будет выполнен для GET /tasks/abc, если task_id объявлен как int?"}
          options={["Поиск задачи", "Извлечение значения из URL", "Проверка типа"]}
          correctIndex={0}
          explanation={"FastAPI не сможет передать строку abc в аргумент int, поэтому функция поиска не вызывается."}
        />
        <p>
          {"Итак, тип проверяется до вызова Python-поиска. Отсутствие записи обнаруживается только после этой проверки."}
        </p>
        <Callout tone="info">
          {"Статус 422 здесь означает, что значение запроса не прошло проверку объявленного типа. Статус 404 означает, что корректный id не соответствует существующему ресурсу."}
        </Callout>
      </Section>

      <Section number="05" title={"Последовательный поиск в обычном списке"}>
        <Lead>
          {"После проверки типа Python-код должен сравнить переданный id с полем каждой записи."}
        </Lead>
        <p>
          {"Рассмотрим независимый пример со станциями. Цикл берёт по одной записи, условие проверяет код, а при совпадении сохраняет результат и прекращает дальнейший просмотр."}
        </p>
        <CodeBlock
          caption={"пример поиска станции"}
          code={"stations = [\n" +
            "    {\"code\": \"N1\", \"name\": \"Северная\"},\n" +
            "    {\"code\": \"S2\", \"name\": \"Южная\"},\n" +
            "]\n\n" +
            "requested_code = \"S2\"\n" +
            "selected_station = None\n\n" +
            "for station in stations:\n" +
            "    if station[\"code\"] == requested_code:\n" +
            "        selected_station = station\n" +
            "        break"}
        />
        <p>
          {"Когда код совпал, переменная selected_station получает найденную запись. break завершает цикл, потому что искать дальше уже не нужно. Если совпадений нет, значение остаётся None. Это явный сигнал, что результат отсутствует."}
        </p>
        <TrueFalse
          statement={<>{"Если цикл просмотрел все записи и не нашёл совпадение, функция должна вернуть последнюю проверенную запись."}</>}
          isTrue={false}
          explanation={"Последняя запись не обязательно совпадает. Для отсутствующего результата нужен отдельный сигнал, например None."}
        />
        <p>
          {"Последовательный поиск прост и подходит небольшому списку. При росте данных база может выполнять поиск по индексу. Контракт здесь означает договор функции: какие значения она принимает и что возвращает. Он может остаться прежним: найденный объект либо явное отсутствие."}
        </p>
      </Section>

      <Section number="06" title={"Зачем отделять поиск и возвращать копию"}>
        <Lead>
          {"Функция поиска отвечает только за Python-данные. Она не должна решать, каким будет HTTP-статус."}
        </Lead>
        <p>
          {"Удобный помощник получает список и критерий поиска. Он возвращает найденную запись или None. Он не знает про запросы, ответы и статус-коды. Маршрут FastAPI использует результат и решает, что отправить клиенту."}
        </p>
        <Callout tone="info">
          <strong>Чистая функция.</strong> Она опирается только на переданные значения, не меняет вход и возвращает результат. Наш поиск читает список и id, не обращается к серверу, файлам или общим данным. Одинаковые входные значения дают одинаковый результат, поэтому функцию можно проверить отдельно.
        </Callout>
        <p>
          {"Такую функцию легко проверить отдельно: передать список, затем сравнить результат. Та же логика не копируется в маршрут чтения, а позже в маршруты изменения и удаления. Если источник данных сменится на базу, способ поиска изменится, но граница между поиском и HTTP останется полезной."}
        </p>
        <p>
          {"Словарь изменяемый. Если вернуть исходный словарь, вызывающий код может поменять его поле и изменить данные в исходном списке. Метод copy() создаёт новый внешний словарь с теми же полями."}
        </p>
        <CodeBlock
          caption={"изменение копии не меняет исходный внешний словарь"}
          code={"profile = {\"name\": \"Лена\", \"city\": \"Казань\"}\n" +
            "view = profile.copy()\n" +
            "view[\"city\"] = \"Пермь\"\n\n" +
            "print(profile[\"city\"])  # Казань"}
        />
        <Callout tone="info">
          <strong>Поверхностная копия.</strong> Метод copy() создаёт новый внешний словарь, но не копирует вложенные изменяемые значения. В данных задачи поля id, title, priority и is_done содержат числа, строки и логические значения, поэтому отдельного словаря достаточно. Если появится вложенный список или словарь, он останется общим для исходной записи и копии.
        </Callout>
        <FillBlank
          prompt={"Что должно остаться в исходном profile после изменения view?"}
          before={"Город в исходном profile останется: "}
          after={""}
          options={["Казань", "Пермь", "None"]}
          answer={"Казань"}
          explanation={"view создан как отдельный словарь. Замена его поля city не изменяет такое же поле исходного profile."}
        />
        <p>
          {"Копия отделяет внешний словарь результата. Это защищает текущие простые поля задачи от случайного изменения через возвращённое значение."}
        </p>
        <Callout tone="info">
          <strong>None и пустой список не одно и то же.</strong> Пустой список означает, что записей нет. None в результате поиска означает, что для конкретного критерия совпадение не найдено.
        </Callout>
      </Section>

      <Section number="07" title={"Один запрос проходит несколько границ"}>
        <Lead>
          {"Теперь соединим чтение URL, проверку типа, Python-поиск и HTTP-ответ в одну последовательность."}
        </Lead>
        <p>
          {"Проследите, на каком этапе расходятся три запроса: с числом найденной задачи, с числом отсутствующей задачи и с текстом вместо числа."}
        </p>
        <figure className="lesson-infographic">
          <img
            src={lesson54PathSearchInfographic}
            alt="FastAPI проверяет тип task_id: текст abc получает ответ 422 до поиска. Функция поиска возвращает копию найденной задачи или None, а маршрут преобразует результат в ответ 200 или 404."
            width={1672}
            height={836}
            loading="lazy"
            decoding="async"
          />
          <figcaption>
            {"Проверка типа предшествует поиску. Функция поиска возвращает копию задачи или None. Маршрут выбирает ответ 200 или 404, а неверный тип получает 422 ещё до поиска."}
          </figcaption>
        </figure>
        <p>
          {"Если указан abc, FastAPI не вызывает функцию поиска и сам формирует 422. Число 999 проходит проверку типа, но может не встретиться в списке: тогда помощник вернёт None. Сам помощник не знает про 404 или 200. Он сообщает только результат поиска, а маршрут решает, каким HTTP-ответом его представить. Именно функцию-помощник, отдельно от сервера, и будет проверять практика."}
        </p>
        <div className="lesson-check-group">
          <QuizCard
            question={"Что означает /tasks/999, если 999 это целое число, но задачи с ним нет?"}
            options={["404 после поиска", "422 до поиска", "200 с первой задачей"]}
            correctIndex={0}
            explanation={"Тип значения корректен. Отсутствие обнаружится на этапе поиска ресурса."}
          />
          <QuizCard
            question={"Кто должен знать, что такое HTTP 404?"}
            options={["Маршрут FastAPI", "Python-функция поиска", "Список задач"]}
            correctIndex={0}
            explanation={"Помощник поиска сообщает, найден объект или нет. HTTP-статус выбирает маршрут."}
          />
          <RecallCard
            question={"Что произойдёт с исходной задачей, если функция вернула её копию, а вызывающий код поменял title у результата?"}
            answer={<p>{"Внешний словарь исходной задачи останется прежним."}</p>}
          />
        </div>
        <p>
          {"Проверяйте ошибки по этапам. Сначала уточните, дошло ли значение до функции. Затем спросите, нашлась ли запись. Такая привычка помогает не смешивать проверку входа с поиском данных."}
        </p>
      </Section>

      <Section number="08" title={"Что мы будем делать в практике"}>
        <Lead>
          {"Практика закрепит только поиск в Python. Мы не будем создавать HTTP-маршрут или проверять работу сервера."}
        </Lead>
        <p>
          {"Автопроверка передаст функции solve(tasks, task_id) список словарей и целое число. Это число уже прошло бы проверку FastAPI, если бы пришло из URL. Вам нужно определить, есть ли среди словарей запись с таким id, и вернуть результат поиска отдельно от HTTP-слоя."}
        </p>
        <LinkedNotes items={[
          { title: "Найти совпадение", description: "Сравнить поле id каждой записи с переданным task_id." },
          { title: "Вернуть результат", description: "Для найденной записи вернуть отдельный словарь, не меняя исходный список." },
          { title: "Обработать отсутствие", description: "Вернуть None, если id не найден или список пуст." },
          { title: "Проверить границы", description: "Автопроверка рассмотрит первый элемент, середину, отсутствующий id и пустой список. Она также проверит, что вход не меняется, а результат является отдельной копией." },
          { title: "Оставить HTTP отдельно", description: "В функции не нужны FastAPI и запуск сервера. Она возвращает только значение Python." },
        ]} />
        <p>
          {"Готовый результат это маленький контракт поиска: один список и один id на входе, найденная копия или None на выходе. Позже маршрут сможет использовать этот результат, чтобы выбрать между ответом 200 и 404. Ошибка преобразования вроде abc → int остаётся отдельной проверкой FastAPI."}
        </p>
        <PracticeCta text={"Реализуйте поиск по task_id, верните копию найденного словаря или None и проверьте все четыре сценария автопроверки."} />
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
        intro={"Один список задач можно показать по-разному: выбрать нужный статус, задать порядок или вернуть небольшую часть. Настройки запроса меняют ответ, но не сами данные."}
        tags={[
          { icon: <ListChecks size={14} />, label: "настройки списка" },
          { icon: <Wrench size={14} />, label: "фильтр · порядок · предел" },
        ]}
      />
      <TheoryBridge lesson={55} />

      <Section number="00" title={"От одной задачи к удобному списку"}>
        <Lead>
          {"В прошлом занятии мы выбирали одну задачу по id. В приложении чаще нужен список: например, только невыполненные задачи и не больше десяти за раз."}
        </Lead>
        <p>
          {"Отдельный маршрут для каждой комбинации быстро превратился бы в десятки почти одинаковых адресов. Оставим /tasks и добавим настройки в URL после знака ?. Такой параметр называют query-параметром. Collection, или коллекция, это список объектов одного вида. Filter оставляет подходящие записи, limit задаёт предел количества."}
        </p>
        <MatchPairs
          prompt={"Соедините адрес с тем, что именно он выбирает."}
          leftTitle={"Запрос"}
          rightTitle={"Смысл"}
          pairs={[
            { left: "/tasks", right: "список задач" },
            { left: "/tasks/7", right: "одна задача с id 7" },
            { left: "/tasks?is_done=false", right: "список невыполненных задач" },
          ]}
          explanation={"Path с номером выбирает одну запись. Query после ? настраивает список."}
        />
      </Section>

      <Section number="01" title={"Как читать query в URL"}>
        <Lead>{"Path выбирает объект или список. Query задаёт условия для подготовки ответа."}</Lead>
        <CodeBlock
          caption={"один маршрут, разные настройки"}
          code={
            "GET /tasks\n" +
            "GET /tasks?is_done=false\n" +
            "GET /tasks?limit=10\n" +
            "GET /tasks?is_done=false&sort_desc=true&limit=10"
          }
        />
        <p>
          {"Знак ? отделяет параметры от пути. Каждый параметр записан как имя=значение, а символ & соединяет несколько настроек. Значения в URL передаются текстом. FastAPI преобразует false в Python-значение False, если параметр объявлен как bool; неправильное число будет отклонено до выполнения функции маршрута."}
        </p>
        <Callout tone="info">
          {"Порядок параметров в URL не задаёт порядок действий. /tasks?limit=10&is_done=false и /tasks?is_done=false&limit=10 несут те же настройки. Последовательность обработки определяет сервер."}
        </Callout>
      </Section>

      <Section number="02" title={"False не означает отсутствие фильтра"}>
        <Lead>
          {"У необязательного фильтра статуса три состояния: True оставляет выполненные задачи, False оставляет невыполненные, None означает, что условие не передано."}
        </Lead>
        <CodeBlock
          caption={"объявление query-параметра"}
          code={
            "@app.get(\"/tasks\")\n" +
            "def read_tasks(is_done: bool | None = None):\n" +
            "    ..."
          }
        />
        <p>
          {"Тип bool | None разрешает логическое значение или None. Значение по умолчанию None делает параметр необязательным. Запрос без is_done даст None, а ?is_done=false даст False. Поэтому наличие условия проверяют через is_done is not None, а не через if is_done."}
        </p>
        <FillBlank
          prompt={"Дополните проверку: фильтр задан, если значение не None."}
          before={"if is_done "}
          after={" None:\n    # применить фильтр"}
          options={["==", "is not", "or"]}
          answer={"is not"}
          explanation={"Так False остаётся действующим фильтром, а отсутствие настройки по-прежнему обозначает None."}
        />
        <TrueFalse
          statement={"В запросе ?is_done=false фильтра нет, потому что значение False."}
          isTrue={false}
          explanation={"Параметр передан. Он просит оставить задачи с is_done=False."}
        />
        <BugHunt
          code={"def matches(task, is_done):\n    if is_done:\n        return task[\"is_done\"] == is_done\n    return True"}
          question={"Почему этот код ошибётся для is_done=False?"}
          options={[
            "False попадёт в ветку отсутствующего фильтра",
            "if не может проверять bool",
            "словарь нельзя сравнивать с bool",
          ]}
          correctIndex={0}
          explanation={"Отсутствие нужно проверять через None. Иначе запрос для невыполненных задач станет запросом без фильтра."}
        />
      </Section>

      <Section number="03" title={"Фильтр, сортировка, ограничение"}>
        <Lead>
          {"Несколько настроек удобно представить как цепочку действий. По-английски такую цепочку часто называют pipeline."}
        </Lead>
        <p>
          {"Представьте книжный каталог. Сначала оставим книги нужного жанра, затем упорядочим их по году и в конце возьмём первые две. Если взять первые две книги до фильтра, нужные книги могут остаться дальше в каталоге."}
        </p>
        <figure className="lesson-infographic">
          <img
            src={queryPipelineInfographic}
            alt="Исходный список задач с id 5, 2, 4, 1, 3 остаётся неизменным. Фильтр is_done=False оставляет 5, 4, 1; сортировка по возрастанию меняет порядок на 1, 4, 5; limit=2 включает в ответ задачи 1 и 4."
            width={1672}
            height={836}
            loading="lazy"
            decoding="async"
          />
          <figcaption>
            Исходный список остаётся прежним. Фильтр оставляет id 5, 4 и 1; сортировка располагает их как 1, 4, 5, а limit=2 возвращает первые две задачи.
          </figcaption>
        </figure>
        <LinkedNotes
          items={[
            { title: "Фильтр", description: "Оставляет записи, которые подходят под условие. Остальные не удаляются из хранилища." },
            { title: "Сортировка", description: "Упорядочивает прошедшие фильтр записи. В практике правило одно: уникальный id." },
            { title: "Предел", description: "Берёт не больше limit записей из уже отобранного и упорядоченного результата." },
          ]}
        />
        <p>
          {"Результат такого запроса называют представлением: это временный вид для ответа. GET читает и готовит ответ, но не переставляет задачи в общем хранилище и не удаляет неподходящие."}
        </p>
        <CodeSequence
          title={"Соберите порядок обработки"}
          prompt={"Нужны выполненные задачи, по id от меньшего к большему, не больше пяти. Расположите действия."}
          pieces={[
            { id: "filter", code: "оставить задачи с нужным is_done" },
            { id: "sort", code: "упорядочить выборку по id" },
            { id: "limit", code: "взять первые limit записей" },
            { id: "mutate", code: "удалить остальные задачи из хранилища" },
          ]}
          correctOrder={["filter", "sort", "limit"]}
          explanation={"Сначала отбор, затем порядок и в конце количество. Источник данных остаётся прежним."}
        />
      </Section>

      <Section number="04" title={"Сортировка и копии данных"}>
        <Lead>
          {"sorted(values) возвращает новый список. values.sort() меняет сам список и возвращает None."}
        </Lead>
        <CodeBlock
          caption={"обычный и обратный порядок"}
          code={"sorted([4, 1, 3])  # [1, 3, 4]\nsorted([4, 1, 3], reverse=True)  # [4, 3, 1]"}
        />
        <p>
          {"Словарь нельзя сравнить по нужному полю, пока мы не подскажем, что именно брать для сравнения. У sorted есть параметр key: в него передают функцию без скобок. Python сам вызывает её для каждого элемента, а функция возвращает значение сортировки. Например, для книг она может вернуть год публикации."}
        </p>
        <CodeBlock
          caption={"сортируем записи по одному из полей"}
          code={
            'books = [{"title": "Ночная смена", "year": 2022}, {"title": "Первая запись", "year": 2018}]\n' +
            "def publication_year(book):\n    return book[\"year\"]\n\n" +
            "sorted(books, key=publication_year)\n" +
            "# сначала книга 2018 года, затем книга 2022 года"
          }
        />
        <FillBlank
          prompt={"Что передать в key, чтобы отсортировать книги по году?"}
          before={"sorted(books, key="}
          after={")"}
          options={["publication_year", 'books[0]["year"]', '"year"']}
          answer={"publication_year"}
          explanation={"key получает функцию, которую Python вызывает для каждого элемента. Одного заранее выбранного значения year недостаточно."}
        />
        <p>
          {"Здесь key означает функцию, которая извлекает значение для сравнения, а не имя поля словаря. Тот же приём позволит упорядочить задачи по их id, не меняя сами словари."}
        </p>
        <p>
          {"Если значение сортировки может совпасть, добавляют второй критерий, например уникальный id. Python сохраняет относительный порядок таких равных элементов из исходного списка; это называют устойчивой сортировкой. Но порядок строк из источника может отличаться между запросами. Уникальный id задаёт API однозначный порядок независимо от этого."}
        </p>
        <p>
          {"В практике параметр sort_desc задаёт направление: False означает id по возрастанию, True означает по убыванию. desc это сокращение от descending, то есть «по убыванию». В sorted этот флаг передаётся через reverse."}
        </p>
        <p>
          {"Хотя sorted создаёт новый список, словари внутри него автоматически не копируются. dict.copy() создаёт отдельный внешний словарь. Для нашей задачи этого достаточно: её поля содержат числа, строки и bool, а не вложенные изменяемые коллекции."}
        </p>
        <QuizCard
          question={"Что меняет исходный список на месте?"}
          options={["sorted(values)", "values.sort()", "оба варианта только создают копию"]}
          correctIndex={1}
          explanation={"sort() меняет список. sorted() создаёт новый список, но сами словари внутри всё ещё нужно копировать отдельно."}
        />
      </Section>

      <Section number="05" title={"У limit должны быть границы"}>
        <Lead>
          {"limit задаёт максимальное количество элементов в ответе. Это удобно клиенту и не позволяет запросить чрезмерно большой объём данных одним обращением."}
        </Lead>
        <p>
          {"После отбора и сортировки нужно взять начало списка. Срез values[:2] возвращает первые два элемента: начало не указано, а позиция 2 уже не входит в результат. Если в списке меньше двух элементов, срез вернёт всё, что есть. Для limit действует тот же принцип: берём начало до разрешённой границы."}
        </p>
        <CodeBlock
          caption={"срез ограничивает число элементов"}
          code={"values = [1, 4, 5]\nvalues[:2]  # [1, 4]"}
        />
        <FillBlank
          prompt={"Какой срез вернёт не больше двух первых элементов?"}
          before={"values["}
          after={"]"}
          options={[":2", "2:", "2"]}
          answer={":2"}
          explanation={"В срезе начало пропущено, поэтому отсчёт идёт с первого элемента. Правая граница не включается."}
        />
        <p>
          {"Для публичного API выберем одно строгое правило: limit по умолчанию равен 10, допустимый диапазон от 1 до 50 включительно. Ноль, отрицательное число и значение больше 50 сервер не подменяет ближайшей границей, а отклоняет с ответом 422. Так клиент сразу видит, что его запрос не соответствует договору."}
        </p>
        <p>
          {"FastAPI Query описывает эти границы: ge означает «больше или равно», le означает «меньше или равно». Проверка выполняется до запуска функции маршрута. Поэтому прикладная функция получает только допустимый limit и не должна повторно исправлять или обрезать его."}
        </p>
        <CodeBlock
          caption={"единые границы будущего GET /tasks"}
          code={"from fastapi import Query\n\ndef read_tasks(\n    is_done: bool | None = None,\n    sort_desc: bool = False,\n    limit: int = Query(default=10, ge=1, le=50),\n):\n    ..."}
        />
        <Callout tone="info">
          {"Это сигнатура будущего маршрута, а не часть сегодняшней Python-функции. В практике limit уже считается проверенным числом от 1 до 50. Автопроверка проверяет допустимые границы 1 и 50; HTTP-ответ 422 для 0 и 51 проверяется, когда правило подключат к FastAPI."}
        </Callout>
      </Section>

      <Section number="06" title={"Что добавляют в рабочих API"}>
        <Lead>
          {"Для больших сервисов одних фильтра, порядка и предела иногда недостаточно. Тогда отдельно проектируют страницы, разрешённые поля и предсказуемый порядок результатов."}
        </Lead>
        <LinkedNotes
          items={[
            { title: "Постраничная выдача", description: "Pagination означает возврат данных небольшими частями. Offset пропускает записи, cursor указывает место продолжения. Для меняющегося списка курсор обычно устойчивее, если порядок заканчивается уникальным ключом. Здесь мы ограничиваем ответ, но не строим страницы." },
            { title: "Разрешённые поля", description: "Allow-list, список допустимых вариантов, не даёт клиенту сортировать по произвольному внутреннему полю. В практике сортируем только по id." },
            { title: "Дополнительное правило", description: "Tie-breaker разрешает равенство. Если приоритеты совпали, можно сравнить уникальные id. У нас id и есть единственный ключ сортировки." },
          ]}
        />
        <p>
          {"Большая база данных часто сама выполняет фильтрацию и сортировку. Индекс помогает быстрее находить и упорядочивать записи. SQL и ORM сейчас не нужны: закрепляем те же идеи на обычном списке Python."}
        </p>
        <TrueFalse
          statement={"Если limit вернул 50 задач, остальные удалены из хранилища."}
          isTrue={false}
          explanation={"limit ограничивает только текущий ответ, а не число записей в источнике."}
        />
      </Section>

      <Section number="07" title={"Что мы будем делать в практике"}>
        <Lead>
          {"Практика проверяет правила подготовки ответа в чистой функции Python. Это модель поведения GET /tasks, а не создание FastAPI-маршрута."}
        </Lead>
        <LinkedNotes
          items={[
            { title: "Вход", description: "solve(tasks, is_done, sort_desc, limit) получает задачи с полями id, title, priority, is_done. id уникальны, типы уже проверены." },
            { title: "Действия", description: "Сначала отобрать записи по is_done, затем собрать отдельные копии, упорядочить их по id и только после этого взять limit записей. sort_desc=False задаёт возрастание, True задаёт убывание. До вызова функции HTTP-маршрут проверит, что limit находится в диапазоне 1-50." },
            { title: "Данные и проверки", description: "title и priority сохраняются, но не влияют на фильтр и порядок. Проверяются отсутствие фильтра, True и False, оба направления сортировки, пустой результат, допустимые границы limit=1 и limit=50, отдельность словарей и неизменность входа. Значения вне диапазона позже получат HTTP 422." },
            { title: "За границами", description: "Не нужны сервер, FastAPI, Query, база данных, поиск по тексту или offset. Верните результат через return, не печатайте его." },
          ]}
        />
        <p>
          {"Можно использовать знакомые цикл, условие, dict.copy(), sorted() и срез. Верхняя граница проверяется на наборе из 60 задач. Функция не обрезает неправильное значение limit: контракт гарантирует, что HTTP-слой сначала проверил диапазон. В следующем занятии мы перейдём к JSON body, который клиент отправляет при создании задачи."}
        </p>
        <PracticeCta text={"Подготовьте копии задач, учтите None и False, выполните filter -> sort -> limit для уже проверенного значения 1-50 и не меняйте вход."} />
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
        intro={"Разберём, как библиотека Pydantic собирает и проверяет данные, как её базовый класс BaseModel задаёт форму новой задачи, а FastAPI связывает модель с телом HTTP-запроса до вызова функции маршрута."}
        tags={[
          { icon: <Braces size={14} />, label: "Входная модель" },
          { icon: <CheckCircle2 size={14} />, label: "Проверка до маршрута" },
        ]}
      />
      <TheoryBridge lesson={56} />

      <Section number="00" title={"От чтения к отправке данных"}>
        <Lead>
          {"В прошлом занятии мы написали и проверили в интерпретаторе функцию отбора и сортировки задач. Она ещё не была частью GET /tasks. Теперь перейдём к другой стороне обмена: клиент передаёт серверу данные новой задачи."}
        </Lead>
        <p>
          {"Представьте карточку новой задачи. Клиент заполняет название и приоритет, а сервер должен понять, что именно ему передали. В HTTP эти данные обычно кладут в тело запроса, или request body. Это часть запроса с его содержимым, а не с адресом или заголовками."}
        </p>
        <CodeBlock
          caption={"POST-запрос с JSON"}
          code={
            "POST /tasks\n" +
            "Content-Type: application/json\n\n" +
            "{\n" +
            "  \"title\": \"Повторить HTTP\",\n" +
            "  \"priority\": 4\n" +
            "}"
          }
        />
        <p>
          {"Заголовок Content-Type сообщает формат тела. Здесь application/json означает, что содержимое записано как JSON. Но клиент может забыть priority, отправить вместо числа слово или прислать данные другой формы. Серверу нужно определить, можно ли передавать их функции маршрута."}
        </p>
        <Callout tone="info">
          <strong>Новые слова.</strong>{" "}
          {"Схема описывает ожидаемую форму данных: имена полей и их типы. API-контрактом называют договор клиента и сервера о принимаемых и возвращаемых данных. Pydantic это Python-библиотека, которая строит объекты и проверяет их по схеме. BaseModel это базовый класс Pydantic, от которого наследуется наша модель."}
        </Callout>
        <QuizCard
          question={"Где надёжнее заметить, что обязательного priority нет?"}
          options={[
            "До вызова функции маршрута, на входной границе",
            "После чтения priority внутри функции",
            "Только когда задача будет записана в файл",
          ]}
          correctIndex={0}
          explanation={"Проверка на границе не даёт неполному объекту попасть в прикладную логику. Тогда вместо случайной ошибки при чтении ключа клиент получает понятный ответ о неверном запросе."}
        />
      </Section>

      <Section number="01" title={"Почему одного словаря мало"}>
        <Lead>
          {"Обычный словарь хранит пары «ключ и значение», но не обещает, что нужные ключи есть и что значения имеют ожидаемый тип."}
        </Lead>
        <CodeBlock
          caption={"словарь сам форму не проверяет"}
          code={
            "data = {\n" +
            "    \"title\": \"Повторить HTTP\",\n" +
            "    \"priority\": 4,\n" +
            "}\n\n" +
            "priority = data[\"priority\"]"
          }
        />
        <p>
          {"Если priority отсутствует, Python выдаст KeyError, то есть ошибку обращения к отсутствующему ключу, уже внутри функции. Можно написать ручные проверки, но каждое место, принимающее данные, тогда должно помнить один и тот же набор правил. При изменении формы легко забыть обновить один из таких участков."}
        </p>
        <p>
          {"Схема работает как список содержимого на коробке: до начала работы понятно, чего ждать. Она собирает форму в одном объявлении. FastAPI применяет её к входящим данным и использует, чтобы показать поля в автоматической документации."}
        </p>
        <MatchPairs
          prompt={"У каждого элемента своё место. Сопоставьте данные с тем, что именно они описывают."}
          leftTitle={"Часть"}
          rightTitle={"Роль"}
          explanation={"Путь выбирает маршрут, тело несёт значения, а Content-Type сообщает серверу, в каком формате читать содержимое."}
          pairs={[
            { left: "Путь /tasks", right: "К какому маршруту обращается клиент" },
            { left: "Тело запроса", right: "Какие значения клиент передаёт" },
            { left: "Content-Type", right: "В каком формате записано тело" },
          ]}
        />
      </Section>

      <Section number="02" title={"Описываем TaskCreate через BaseModel"}>
        <Lead>
          {"В Pydantic форму данных обычно описывают классом, который наследуется от BaseModel. Такой класс называют моделью. Он перечисляет ожидаемые поля и тип каждого из них."}
        </Lead>
        <p>
          {"Назовём класс TaskCreate: слово Create означает «создать». Эта модель описывает данные, которые клиент присылает для создания задачи, а не всю сохранённую задачу."}
        </p>
        <CodeBlock
          caption={"модель для входа при создании"}
          code={
            "from pydantic import BaseModel\n\n" +
            "class TaskCreate(BaseModel):\n" +
            "    title: str\n" +
            "    priority: int"
          }
        />
        <p>
          {"TaskCreate это новое имя класса. BaseModel даёт ему возможности Pydantic. Записи title: str и priority: int говорят, что title должен быть строкой, а priority после разбора должен стать целым числом. Справа от двоеточия стоят аннотации типов. Они помогают и проверке данных, и редактору кода."}
        </p>
        <p>
          {"Оба поля обязательны: после них нет значения по умолчанию. Это не значит, что каждое значение уже идеально. Например, пустая строка всё ещё является строкой. Чтобы требовать хотя бы один символ, понадобится отдельное ограничение. Его мы пока не вводим."}
        </p>
        <FillBlank
          prompt={"Какое поле и тип нужно дописать, чтобы клиент обязательно передал числовой приоритет?"}
          before={"class TaskCreate(BaseModel):\n    title: str\n    "}
          options={["priority", "id", "is_done"]}
          answer={"priority"}
          after={": int"}
          explanation={"priority входит во входные данные и обязательно должно прийти как целое число. id и is_done сервер назначает сам."}
        />
        <p>
          {"Pydantic также умеет преобразовывать некоторые входные значения. Например, строку с числом 4 он обычно может разобрать как целое 4. Слово «высокий» в int разобрать нельзя. Диапазон допустимого приоритета мы здесь не задаём."}
        </p>
        <CodeBlock
          caption={"предскажите вывод"}
          code={
            "task = TaskCreate(title=\"Повторить HTTP\", priority=\"4\")\n" +
            "print(task.priority, type(task.priority).__name__)"
          }
        />
        <QuizCard
          question={"Что напечатает этот код?"}
          options={[
            "4 int",
            "4 str",
            "Ошибка, потому что priority передан как текст",
          ]}
          correctIndex={0}
          explanation={"Pydantic по умолчанию может преобразовать строковое представление целого числа. Неразбираемое слово не пройдёт, но диапазон значения этот тип не задаёт."}
        />
        <Callout tone="info">
          <strong>Кто владеет полями?</strong>{" "}
          {"TaskCreate описывает только сведения, нужные от клиента при создании. Сервер сам назначит id и начальное is_done. Мы не полагаемся здесь на особое поведение для неизвестных ключей и пока не отправляем их."}
        </Callout>
      </Section>

      <Section number="03" title={"FastAPI связывает модель с телом"}>
        <Lead>
          {"Модель описывает форму, но её ещё нужно подключить к маршруту. Если параметр функции имеет тип Pydantic-модели, FastAPI читает JSON-тело и передаёт проверенный объект в этот параметр."}
        </Lead>
        <p>
          {"Метод model_dump() в используемой версии Pydantic 2 превращает поля проверенной модели в обычный словарь Python. Он не сохраняет задачу. Параметр payload означает проверенные данные запроса, уже собранные в объект модели."}
        </p>
        <p>
          {"Ниже фрагмент для уже созданного приложения: считаем, что объект app объявлен раньше, а класс TaskCreate расположен выше в том же файле."}
        </p>
        <CodeBlock
          caption={"тело становится параметром функции"}
          code={
            "@app.post(\"/tasks\")\n" +
            "def create_task(payload: TaskCreate):\n" +
            "    return payload.model_dump()"
          }
        />
        <p>
          {"FastAPI распознаёт TaskCreate как тело запроса. Внутри функции payload уже объект модели, поэтому значения доступны как payload.title и payload.priority. Это проще проверять и читать, чем обращаться к строковым ключам произвольного словаря."}
        </p>
        <p>
          {"FastAPI использует объявленную модель и для OpenAPI. Это машиночитаемое описание адресов API, параметров и форм данных. Swagger UI представляет его как страницу, где можно изучить POST /tasks и отправить пробный запрос."}
        </p>
        <CodeSequence
          title={"Расставьте этапы обработки"}
          prompt={"Что происходит с данными от момента отправки до входа в функцию маршрута?"}
          pieces={[
            { id: "function", code: "Функция получает объект TaskCreate" },
            { id: "json", code: "Клиент отправляет JSON в теле запроса" },
            { id: "parse", code: "FastAPI читает тело и передаёт данные модели" },
            { id: "validate", code: "Pydantic проверяет поля и готовит значения Python" },
          ]}
          correctOrder={["json", "parse", "validate", "function"]}
          explanation={"Функция получает уже проверенный объект. Поэтому отсутствие обязательного поля обнаруживается раньше прикладной логики."}
        />
      </Section>

      <Section number="04" title={"422 останавливает неверный запрос"}>
        <Lead>
          {"Если обязательного поля нет или значение нельзя разобрать по типу, FastAPI возвращает 422. Это стандартный ответ об ошибке входных данных в нашей текущей конфигурации."}
        </Lead>
        <p>
          {"Например, тело без priority не соответствует обязательной модели. Тело со строкой «высокий» тоже не подходит: Pydantic не может превратить это слово в целое число. Оба тела синтаксически являются JSON, но не соответствуют форме TaskCreate."}
        </p>
        <CodeBlock
          caption={"два разных повода для 422"}
          code={
            "{\n" +
            "  \"title\": \"Повторить HTTP\"\n" +
            "}\n" +
            "→ нет обязательного поля priority\n\n" +
            "{\n" +
            "  \"title\": \"Повторить HTTP\",\n" +
            "  \"priority\": \"высокий\"\n" +
            "}\n" +
            "→ значение нельзя разобрать как int"
          }
        />
        <p>
          {"Проверка происходит до тела функции create_task. При этих ошибках маршрут не получает payload и его прикладной код не выполняется. Это заменяет случайный KeyError или работу с неподходящим значением контролируемым ответом клиенту."}
        </p>
        <figure className="lesson-infographic">
          <img
            src={pydanticRequestValidationFlow}
            alt="Клиент отправляет POST с JSON. FastAPI и Pydantic проверяют тело. Корректный запрос доходит до функции маршрута и получает временный 200, а некорректный получает 422 до её запуска."
            width={1672}
            height={836}
            loading="lazy"
            decoding="async"
          />
          <figcaption>
            {"Зелёная ветка доходит до функции только после проверки и возвращает временный 200. Красная заканчивается ответом 422. Ресурс пока не создаётся; 201 появится после настоящего добавления задачи."}
          </figcaption>
        </figure>
        <TrueFalse
          statement={"Если priority отсутствует, функция маршрута всё равно запускается с payload.priority равным None."}
          isTrue={false}
          explanation={"В TaskCreate поле priority обязательное и не имеет значения по умолчанию. FastAPI возвращает 422 до вызова функции маршрута."}
        />
      </Section>

      <Section number="05" title={"model_dump и корректный статус временного ответа"}>
        <Lead>
          {"После проверки у нас есть объект TaskCreate. В Pydantic 2 метод model_dump() собирает поля модели в обычный словарь Python."}
        </Lead>
        <CodeBlock
          caption={"модель превращается в словарь Python"}
          code={
            "payload = TaskCreate(title=\"Повторить HTTP\", priority=4)\n" +
            "data = payload.model_dump()\n\n" +
            "print(data)\n" +
            "# {'title': 'Повторить HTTP', 'priority': 4}"
          }
        />
        <p>
          {"model_dump() возвращает словарь, а не строку JSON и не файл. FastAPI умеет преобразовать словарь, возвращённый функцией, в JSON-тело HTTP-ответа. Само преобразование не записывает данные и не создаёт постоянную задачу."}
        </p>
        <p>
          {"Код 201 Created сообщает о создании нового ресурса. В рабочем сервисе его возвращают после того, как задача действительно создана и получила серверный id. Сам декоратор не создаёт запись: он только задаёт статус."}
        </p>
        <p>
          {"Сейчас POST только принимает и возвращает проверенные поля. Поэтому его успешный временный ответ имеет статус 200, а список не меняется. Когда появятся настоящее создание и серверный id, маршрут сможет вернуть 201. Это не вопрос оформления: 201 обещает клиенту, что новый ресурс создан."}
        </p>
        <RecallCard
          question={"Что создаёт вызов payload.model_dump()?"}
          answer={
            <p>
              {"Обычный словарь Python с полями модели. Это не сохранение на диск и не текст JSON."}
            </p>
          }
        />
      </Section>

      <Section number="06" title={"Что модель проверяет, а что остаётся приложению"}>
        <Lead>
          {"Pydantic проверяет объявленную форму и типы. Он не угадывает правила продукта и не принимает решения за другие части сервера."}
        </Lead>
        <LinkedNotes
          items={[
            { title: "Проверка входа", description: "Есть ли нужные поля и удаётся ли разобрать их по объявленным типам." },
            { title: "Правила продукта", description: "Какой диапазон приоритета допустим и какие значения имеет смысл сохранять. Здесь это ещё не задано." },
            { title: "Права доступа", description: "Кому разрешено создавать задачу. Модель не знает пользователя и не заменяет проверку разрешений." },
            { title: "Хранение", description: "Куда записать задачу и как назначить постоянный id. model_dump сам этого не делает." },
          ]}
        />
        <p>
          {"В рабочих API входные модели дают клиенту и серверу общий договор, а автоматическая документация показывает его форму. По мере роста проекта обычно отдельно описывают данные для создания, обновления и ответа: у каждого направления свой набор полей и свои правила."}
        </p>
        <p>
          {"В этом занятии мы оставляем только TaskCreate и проверку входа. Ограничения длины и диапазона появятся отдельно. Постоянное хранилище, серверный id и полноценная логика POST тоже появятся позже."}
        </p>
        <QuizCard
          question={"Какой факт сам по себе НЕ следует из успешного model_dump()?"}
          options={[
            "У модели можно получить словарь Python",
            "Запись уже сохранена и переживёт перезапуск",
            "Поля модели можно использовать в ответе",
          ]}
          correctIndex={1}
          explanation={"model_dump() только представляет поля модели как словарь. Хранилище и сохранение должны быть реализованы отдельно."}
        />
      </Section>

      <Section number="07" title={"Что мы будем делать в практике"}>
        <Lead>
          {"К концу работы POST /tasks будет принимать проверенное тело с title и priority. Проверка разделит неверный запрос и вызов функции маршрута."}
        </Lead>
        <LinkedNotes
          items={[
            { title: "Сначала", description: "Объявить TaskCreate с двумя обязательными полями и без серверных id и is_done." },
            { title: "Затем", description: "Связать модель с POST /tasks и вернуть временный словарь со статусом 200. Запись пока не создаётся." },
            { title: "Проверить", description: "Отправить корректный JSON, JSON без priority и JSON со строкой, которую нельзя разобрать как int." },
            { title: "Доказать границу", description: "Временно поставить отметку внутри функции маршрута. При ответе 422 отметка не должна появиться. После проверки удалить её." },
            { title: "Обновить карту состояния", description: "В studyhub-api/docs/planner-api-v1.md отметить временный POST как реализованный: он возвращает TaskCreate со статусом 200, но не создаёт ресурс. Настоящий POST с TaskRead и 201 остаётся запланированным." },
            { title: "Оставить на будущее", description: "Не создавать запись задачи и не генерировать id. После настоящего создания подключить TaskRead к POST и вернуть 201." },
          ]}
        />
        <p>
          {"Начните с вопроса, какие сведения клиент сообщает сам, а какие назначает сервер. Модель отвечает за входную форму, FastAPI связывает её с телом и не вызывает функцию при ошибке, а временный ответ 200 показывает результат проверки. Это не создание ресурса; 201 появится после реального добавления полной задачи."}
        </p>
        <PracticeCta text={"Создайте TaskCreate, подключите её к POST /tasks, проверьте временный ответ 200 и два ошибочных запроса, затем обновите Implementation status в planner-api-v1.md."} />
      </Section>
    </RichLesson>
  );
}
