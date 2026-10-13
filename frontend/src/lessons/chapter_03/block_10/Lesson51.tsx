import { Cloud, Terminal } from "lucide-react";
import { Callout, BugHunt, CodeBlock, CodeSequence, CompareSolutions, FillBlank, KeyTakeaways, Lead, LinkedNotes, MatchPairs, PracticeCta, QuizCard, RecallCard, RichHero, RichLesson, Section, TrueFalse, TheoryBridge } from "../../shared";
import postmanEchoInfographic from "./images/postman-echo-cycle.svg";

// 51. Postman: отправляем запрос вручную
export function Lesson51({ module }: { module?: string }) {
  return (
    <RichLesson>
      <RichHero
        chip={module ?? "Месяц 3 · Блок 10 · Первый FastAPI"}
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
