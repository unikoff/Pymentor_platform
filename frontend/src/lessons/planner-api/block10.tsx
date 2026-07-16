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
  CodeBlock,
  KeyTakeaways,
  Lead,
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
        title={"Postman: отправляем запрос вручную"}
        intro={"Возьмём HTTP-контракт из прошлого блока и впервые соберём настоящий запрос руками: выберем method, введём URL, добавим query и body, нажмём Send и разберём response без написания frontend."}
        tags={[
          { icon: <Terminal size={14} />, label: "ручной HTTP request" },
          { icon: <Cloud size={14} />, label: "status · headers · body" },
        ]}
      />
      <TheoryBridge lesson={51} />

      <Section number="01" title={"Зачем нужен HTTP-клиент"}>
        <Lead>
          {"Браузер удобен для простого GET, но не показывает весь request. Postman позволяет отдельно выбрать method, URL, query, headers и body."}
        </Lead>

        <div className="lesson-practice-steps">
          <h3>Клиент</h3>
          <p>
            {"Postman начинает взаимодействие и обращается к серверу."}
          </p>

          <h3>Без frontend</h3>
          <p>
            {"Кнопки сайта пока не нужны: request собирается вручную."}
          </p>

          <h3>Диагностика</h3>
          <p>
            {"Можно проверить API отдельно от интерфейса сайта."}
          </p>

        </div>

        <CodeBlock
          caption={"путь одного запроса"}
          code={
            "разработчик\n" +
            "    ↓\n" +
            "Postman\n" +
            "    ↓ HTTP request\n" +
            "сервер\n" +
            "    ↑ HTTP response\n" +
            "Postman\n" +
            "    ↑\n" +
            "разработчик"
          }
        />

        <RecallCard
          question={"Postman выполняет роль HTTP-клиента."}
          answer={
            <p>
              {"Он формирует request и показывает response."}
            </p>
          }
        />

        <Callout tone="info">
          {"На этом этапе Postman используется как измерительный прибор для HTTP."}
        </Callout>
      </Section>

      <Section number="02" title={"Пять областей первого окна"}>
        <Lead>
          {"Не нужно изучать все панели. Для первого запроса достаточно method, URL, вкладок request, кнопки Send и панели response."}
        </Lead>

        <div className="lesson-practice-steps">
          <h3>Method</h3>
          <p>
            {"Выражает действие: GET, POST, PATCH и другие."}
          </p>

          <h3>URL</h3>
          <p>
            {"Указывает сервер и endpoint."}
          </p>

          <h3>Params, Headers, Body</h3>
          <p>
            {"Размещают дополнительные части request."}
          </p>

          <h3>Send</h3>
          <p>
            {"Отправляет уже собранное сообщение."}
          </p>

          <h3>Response</h3>
          <p>
            {"Показывает status, headers и body."}
          </p>

        </div>

        <CodeBlock
          caption={"минимальная карта"}
          code={
            "[ GET ▼ ] [ https://postman-echo.com/get ] [ Send ]\n" +
            "\n" +
            "Params | Headers | Body\n" +
            "\n" +
            "Status: 200 OK\n" +
            "Headers\n" +
            "Body"
          }
        />

        <TrueFalse
          statement={
            <>
              {"Кнопка Send запускает отправку request."}
            </>
          }
          isTrue={true}
          explanation={"До нажатия сервер ничего не получает."}
        />

        <Callout tone="info">
          {"Изменяйте одну область за раз, иначе источник ошибки становится неясным."}
        </Callout>
      </Section>

      <Section number="03" title={"Первый GET-запрос"}>
        <Lead>
          {"Для первого опыта используем echo-endpoint. Он возвращает информацию о полученном запросе и помогает проверить работу Postman."}
        </Lead>

        <div className="lesson-practice-steps">
          <h3>Шаг 1</h3>
          <p>
            {"Создайте новый HTTP request."}
          </p>

          <h3>Шаг 2</h3>
          <p>
            {"Оставьте method GET."}
          </p>

          <h3>Шаг 3</h3>
          <p>
            {"Введите https://postman-echo.com/get."}
          </p>

          <h3>Шаг 4</h3>
          <p>
            {"Нажмите Send и найдите status 200."}
          </p>

        </div>

        <CodeBlock
          caption={"request и упрощённый response"}
          code={
            "GET https://postman-echo.com/get\n" +
            "\n" +
            "200 OK\n" +
            "Content-Type: application/json\n" +
            "\n" +
            "{\n" +
            "  \"args\": {},\n" +
            "  \"url\": \"https://postman-echo.com/get\"\n" +
            "}"
          }
        />

        <RecallCard
          question={"Успешный GET обычно возвращает 200."}
          answer={
            <p>
              {"Status показывает успешную обработку request."}
            </p>
          }
        />

        <Callout tone="info">
          {"Внешний echo нужен только до запуска собственного FastAPI-сервера."}
        </Callout>
      </Section>

      <Section number="04" title={"Читаем response в правильном порядке"}>
        <Lead>
          {"После Send не ограничивайтесь красивым JSON. Сначала определите status, затем формат через Content-Type и только потом читайте body."}
        </Lead>

        <div className="lesson-practice-steps">
          <h3>Status</h3>
          <p>
            {"Категория результата."}
          </p>

          <h3>Content-Type</h3>
          <p>
            {"Формат response body."}
          </p>

          <h3>Body</h3>
          <p>
            {"Конкретные данные или detail ошибки."}
          </p>

          <h3>Time и Size</h3>
          <p>
            {"Дополнительные измерения, а не главный критерий успеха."}
          </p>

        </div>

        <CodeBlock
          caption={"порядок чтения"}
          code={
            "1. Status\n" +
            "2. Content-Type\n" +
            "3. Body\n" +
            "4. Остальные headers\n" +
            "5. Time и Size"
          }
        />

        <TrueFalse
          statement={
            <>
              {"Status и body выполняют разные роли."}
            </>
          }
          isTrue={true}
          explanation={"Status задаёт категорию, body передаёт данные."}
        />

        <Callout tone="info">
          {"Текст success внутри body не отменяет ошибочный HTTP status."}
        </Callout>
      </Section>

      <Section number="05" title={"Query через вкладку Params"}>
        <Lead>
          {"Query можно написать после знака вопроса, но таблица Params снижает количество ошибок с символами ? и &."}
        </Lead>

        <div className="lesson-practice-steps">
          <h3>Key</h3>
          <p>
            {"Имя параметра, например topic."}
          </p>

          <h3>Value</h3>
          <p>
            {"Значение, например http."}
          </p>

          <h3>Несколько строк</h3>
          <p>
            {"Postman соединяет пары через &."}
          </p>

          <h3>Итоговый URL</h3>
          <p>
            {"Обновляется автоматически."}
          </p>

        </div>

        <CodeBlock
          caption={"Params и URL"}
          code={
            "KEY      VALUE\n" +
            "topic    http\n" +
            "limit    5\n" +
            "\n" +
            "https://postman-echo.com/get?topic=http&limit=5"
          }
        />

        <RecallCard
          question={"Вкладка Params используется для query."}
          answer={
            <p>
              {"Пары key/value становятся частью URL."}
            </p>
          }
        />

        <Callout tone="info">
          {"Query в URL сначала является текстом. FastAPI позже преобразует типы."}
        </Callout>
      </Section>

      <Section number="06" title={"Headers и Body без перегрузки"}>
        <Lead>
          {"Headers описывают request, а body переносит данные. Пока достаточно увидеть их места и не смешивать с query."}
        </Lead>

        <div className="lesson-practice-steps">
          <h3>Headers</h3>
          <p>
            {"Например Content-Type: application/json."}
          </p>

          <h3>Body</h3>
          <p>
            {"Для JSON выбирается raw и JSON."}
          </p>

          <h3>GET</h3>
          <p>
            {"Обычно не требует request body."}
          </p>

          <h3>POST</h3>
          <p>
            {"Позже отправит новую задачу в JSON body."}
          </p>

        </div>

        <CodeBlock
          caption={"будущий POST request"}
          code={
            "POST http://127.0.0.1:8000/tasks\n" +
            "Content-Type: application/json\n" +
            "\n" +
            "{\n" +
            "  \"title\": \"Изучить FastAPI\",\n" +
            "  \"priority\": 4\n" +
            "}"
          }
        />

        <TrueFalse
          statement={
            <>
              {"Title новой задачи логичнее передавать в body."}
            </>
          }
          isTrue={true}
          explanation={"Body содержит данные создаваемого объекта."}
        />

        <Callout tone="info">
          {"При выборе raw JSON Postman обычно добавляет Content-Type автоматически."}
        </Callout>
      </Section>

      <Section number="07" title={"Collection и base_url"}>
        <Lead>
          {"Collection группирует requests одного API. Переменная base_url позволяет не повторять localhost в каждом адресе."}
        </Lead>

        <div className="lesson-practice-steps">
          <h3>Collection</h3>
          <p>
            {"Создайте Planner API."}
          </p>

          <h3>Имена</h3>
          <p>
            {"Health check и Get tasks понятнее New Request."}
          </p>

          <h3>base_url</h3>
          <p>
            {"Хранит http://127.0.0.1:8000."}
          </p>

          <h3>Шаблон</h3>
          <p>
            {"Используется как {{base_url}}/tasks."}
          </p>

        </div>

        <CodeBlock
          caption={"структура коллекции"}
          code={
            "Planner API\n" +
            "├── Health check\n" +
            "├── Get tasks\n" +
            "├── Get task by id\n" +
            "└── Create task\n" +
            "\n" +
            "base_url = http://127.0.0.1:8000"
          }
        />

        <RecallCard
          question={"Base URL хранит общую часть адреса."}
          answer={
            <p>
              {"Endpoint добавляется после переменной."}
            </p>
          }
        />

        <Callout tone="info">
          {"Collection постепенно станет ручным набором регрессионных проверок."}
        </Callout>
      </Section>

      <Section number="08" title={"Практика перед FastAPI"}>
        <Lead>
          {"Закрепите интерфейс Postman до появления локального сервера. После этого в следующем уроке изменится только адрес request."}
        </Lead>

        <div className="lesson-practice-steps">
          <h3>Проверка 1</h3>
          <p>
            {"GET без query."}
          </p>

          <h3>Проверка 2</h3>
          <p>
            {"GET с topic=http."}
          </p>

          <h3>Проверка 3</h3>
          <p>
            {"Найдите status, Content-Type и body."}
          </p>

          <h3>Проверка 4</h3>
          <p>
            {"Сохраните request в Planner API."}
          </p>

        </div>

        <CodeBlock
          caption={"контрольная карточка"}
          code={
            "Request:\n" +
            "method + URL + query + headers + optional body\n" +
            "\n" +
            "Response:\n" +
            "status + headers + body"
          }
        />

        <TrueFalse
          statement={
            <>
              {"Request и response имеют собственные body."}
            </>
          }
          isTrue={true}
          explanation={"Request body идёт на сервер, response body возвращается клиенту."}
        />

        <Callout tone="info">
          {"Не нужно знать все функции Postman. Нужен уверенный базовый маршрут."}
        </Callout>

        <div className="lesson-check-group">
          <QuizCard
            question={"Какую роль выполняет Postman?"}
            options={[
              "HTTP-клиент",
              "сервер",
              "интерпретатор",
            ]}
            correctIndex={0}
            explanation={"Он отправляет request."}
          />
          <QuizCard
            question={"Где добавляют query?"}
            options={[
              "Params",
              "Body",
              "Console",
            ]}
            correctIndex={0}
            explanation={"Params формирует query."}
          />
          <QuizCard
            question={"Что смотреть первым?"}
            options={[
              "status",
              "цвет JSON",
              "размер окна",
            ]}
            correctIndex={0}
            explanation={"Status задаёт исход."}
          />
          <QuizCard
            question={"Зачем Collection?"}
            options={[
              "сохранять requests",
              "запускать Python",
              "хранить базу",
            ]}
            correctIndex={0}
            explanation={"Collection группирует проверки."}
          />
        </div>

        <KeyTakeaways
          points={[
            <>{"Postman является HTTP-клиентом."}</>,
            <>{"Request собирается из отдельных частей."}</>,
            <>{"Send является моментом отправки."}</>,
            <>{"Response читается начиная со status."}</>,
            <>{"Params формирует query."}</>,
            <>{"Body и query не взаимозаменяемы."}</>,
            <>{"Collection хранит готовые requests."}</>,
            <>{"Base_url сокращает повторение адреса."}</>,
          ]}
        />

        <PracticeCta text={"Создайте Planner API collection, отправьте два GET request к echo-endpoint, добавьте query и сохраните base_url."} />
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
        title={"Первое FastAPI-приложение, Uvicorn и Swagger"}
        intro={"Создадим минимальное FastAPI-приложение, запустим его через Uvicorn, откроем JSON в браузере и увидим, как один Python endpoint автоматически появляется в Swagger UI."}
        tags={[
          { icon: <Wrench size={14} />, label: "FastAPI + Uvicorn" },
          { icon: <Cloud size={14} />, label: "Swagger и OpenAPI" },
        ]}
      />
      <TheoryBridge lesson={52} />

      <Section number="01" title={"Четыре части первого сервера"}>
        <Lead>
          {"Первое приложение содержит наш Python-модуль, объект FastAPI, процесс Uvicorn и отдельный HTTP-клиент."}
        </Lead>

        <div className="lesson-practice-steps">
          <h3>Модуль</h3>
          <p>
            {"app/main.py хранит объект приложения."}
          </p>

          <h3>FastAPI</h3>
          <p>
            {"Связывает method и path с функцией."}
          </p>

          <h3>Uvicorn</h3>
          <p>
            {"Слушает адрес и принимает requests."}
          </p>

          <h3>Клиент</h3>
          <p>
            {"Браузер, Swagger или Postman."}
          </p>

        </div>

        <CodeBlock
          caption={"цепочка"}
          code={
            "Postman\n" +
            "   ↓ request\n" +
            "Uvicorn\n" +
            "   ↓\n" +
            "FastAPI endpoint\n" +
            "   ↓ return\n" +
            "Uvicorn\n" +
            "   ↑ response\n" +
            "Postman"
          }
        />

        <RecallCard
          question={"FastAPI и Uvicorn не являются одним инструментом."}
          answer={
            <p>
              {"Фреймворк описывает API, сервер запускает процесс."}
            </p>
          }
        />

        <Callout tone="info">
          {"Uvicorn не содержит бизнес-правила задач."}
        </Callout>
      </Section>

      <Section number="02" title={"Окружение и установка"}>
        <Lead>
          {"FastAPI устанавливается в виртуальное окружение проекта, чтобы зависимости не смешивались с другими программами."}
        </Lead>

        <div className="lesson-practice-steps">
          <h3>Корень</h3>
          <p>
            {"Создайте studyhub-api."}
          </p>

          <h3>Venv</h3>
          <p>
            {"Создаётся один раз."}
          </p>

          <h3>Установка</h3>
          <p>
            {"Используем fastapi[standard]."}
          </p>

          <h3>Проверка</h3>
          <p>
            {"Import FastAPI должен работать."}
          </p>

        </div>

        <CodeBlock
          caption={"команды"}
          code={
            "mkdir studyhub-api\n" +
            "cd studyhub-api\n" +
            "python -m venv .venv\n" +
            "python -m pip install \"fastapi[standard]\""
          }
        />

        <TrueFalse
          statement={
            <>
              {"FastAPI нужно устанавливать в окружение проекта."}
            </>
          }
          isTrue={true}
          explanation={"Это делает запуск воспроизводимым."}
        />

        <Callout tone="info">
          {"Команды pip и uvicorn запускайте тем же Python."}
        </Callout>
      </Section>

      <Section number="03" title={"Объект app"}>
        <Lead>
          {"Импортируем класс FastAPI и создаём один объект приложения. Именно его будет искать Uvicorn."}
        </Lead>

        <div className="lesson-practice-steps">
          <h3>Импорт</h3>
          <p>
            {"from fastapi import FastAPI."}
          </p>

          <h3>Создание</h3>
          <p>
            {"app = FastAPI()."}
          </p>

          <h3>Имя</h3>
          <p>
            {"app является обычной переменной Python."}
          </p>

          <h3>Пока без route</h3>
          <p>
            {"Объект существует, endpoint ещё не зарегистрирован."}
          </p>

        </div>

        <CodeBlock
          caption={"app/main.py"}
          code={
            "from fastapi import FastAPI\n" +
            "\n" +
            "app = FastAPI()"
          }
        />

        <RecallCard
          question={"app = FastAPI() создаёт приложение."}
          answer={
            <p>
              {"Без скобок переменная получила бы класс."}
            </p>
          }
        />

        <Callout tone="info">
          {"Скобки после FastAPI создают объект."}
        </Callout>
      </Section>

      <Section number="04" title={"Первый endpoint"}>
        <Lead>
          {"Decorator сообщает FastAPI, что функция root обрабатывает GET request по пути /. Return dict становится JSON body."}
        </Lead>

        <div className="lesson-practice-steps">
          <h3>Decorator</h3>
          <p>
            {"@app.get(\"/\") регистрирует route."}
          </p>

          <h3>Функция</h3>
          <p>
            {"Обычный def вызывается после request."}
          </p>

          <h3>Return</h3>
          <p>
            {"Словарь сериализуется в JSON."}
          </p>

          <h3>Status</h3>
          <p>
            {"Успешный ответ по умолчанию 200."}
          </p>

        </div>

        <CodeBlock
          caption={"минимальное приложение"}
          code={
            "from fastapi import FastAPI\n" +
            "\n" +
            "app = FastAPI()\n" +
            "\n" +
            "\n" +
            "@app.get(\"/\")\n" +
            "def root():\n" +
            "    return {\n" +
            "        \"message\": \"Planner API works\"\n" +
            "    }"
          }
        />

        <TrueFalse
          statement={
            <>
              {"Тело root не выполняется при запуске файла."}
            </>
          }
          isTrue={true}
          explanation={"Оно ждёт подходящий GET request."}
        />

        <Callout tone="info">
          {"Async пока не нужен. Сначала важен обычный поток request → function → response."}
        </Callout>
      </Section>

      <Section number="05" title={"Команда Uvicorn"}>
        <Lead>
          {"Команду легче читать как адрес объекта: модуль app.main и переменная app после двоеточия."}
        </Lead>

        <div className="lesson-practice-steps">
          <h3>python -m uvicorn</h3>
          <p>
            {"Запускает модуль Uvicorn."}
          </p>

          <h3>app.main</h3>
          <p>
            {"Импортный путь к app/main.py."}
          </p>

          <h3>:app</h3>
          <p>
            {"Объект FastAPI внутри модуля."}
          </p>

          <h3>--reload</h3>
          <p>
            {"Перезапуск после сохранения для разработки."}
          </p>

        </div>

        <CodeBlock
          caption={"запуск"}
          code={
            "python -m uvicorn app.main:app --reload\n" +
            "\n" +
            "app.main : app\n" +
            "модуль     объект"
          }
        />

        <RecallCard
          question={"app.main:app содержит путь и имя объекта."}
          answer={
            <p>
              {"Слева модуль, справа переменная."}
            </p>
          }
        />

        <Callout tone="info">
          {"Reload не является production-настройкой."}
        </Callout>
      </Section>

      <Section number="06" title={"Проверка через клиента"}>
        <Lead>
          {"После запуска Uvicorn отдельный клиент обращается к http://127.0.0.1:8000/."}
        </Lead>

        <div className="lesson-practice-steps">
          <h3>127.0.0.1</h3>
          <p>
            {"Адрес текущего компьютера."}
          </p>

          <h3>8000</h3>
          <p>
            {"Порт Uvicorn."}
          </p>

          <h3>/</h3>
          <p>
            {"Path первого endpoint."}
          </p>

          <h3>Ctrl+C</h3>
          <p>
            {"Останавливает сервер."}
          </p>

        </div>

        <CodeBlock
          caption={"request и body"}
          code={
            "GET http://127.0.0.1:8000/\n" +
            "\n" +
            "200 OK\n" +
            "\n" +
            "{\n" +
            "  \"message\": \"Planner API works\"\n" +
            "}"
          }
        />

        <TrueFalse
          statement={
            <>
              {"Успех подтверждает реальный request."}
            </>
          }
          isTrue={true}
          explanation={"Чтения кода недостаточно."}
        />

        <Callout tone="info">
          {"Connection refused обычно означает, что сервер не работает."}
        </Callout>
      </Section>

      <Section number="07" title={"Swagger, ReDoc и OpenAPI"}>
        <Lead>
          {"FastAPI строит OpenAPI-схему из decorators и type hints, а затем предоставляет готовую документацию."}
        </Lead>

        <div className="lesson-practice-steps">
          <h3>/docs</h3>
          <p>
            {"Swagger UI с Try it out."}
          </p>

          <h3>/redoc</h3>
          <p>
            {"Альтернативная документация."}
          </p>

          <h3>/openapi.json</h3>
          <p>
            {"Машинная schema API."}
          </p>

          <h3>Автоматизация</h3>
          <p>
            {"Новый endpoint появляется без ручного HTML."}
          </p>

        </div>

        <CodeBlock
          caption={"адреса"}
          code={
            "http://127.0.0.1:8000/docs\n" +
            "http://127.0.0.1:8000/redoc\n" +
            "http://127.0.0.1:8000/openapi.json"
          }
        />

        <RecallCard
          question={"Swagger генерируется автоматически."}
          answer={
            <p>
              {"Источником является OpenAPI schema."}
            </p>
          }
        />

        <Callout tone="info">
          {"Swagger не заменяет тесты."}
        </Callout>
      </Section>

      <Section number="08" title={"Диагностика запуска"}>
        <Lead>
          {"Первые ошибки чаще относятся к окружению, пути модуля или остановленному процессу, а не к HTTP."}
        </Lead>

        <div className="lesson-practice-steps">
          <h3>ModuleNotFoundError</h3>
          <p>
            {"Пакет установлен не в выбранный Python."}
          </p>

          <h3>Could not import module</h3>
          <p>
            {"Неверен app.main."}
          </p>

          <h3>Address already in use</h3>
          <p>
            {"Порт занят."}
          </p>

          <h3>Старый response</h3>
          <p>
            {"Файл не сохранён."}
          </p>

          <h3>Connection refused</h3>
          <p>
            {"Uvicorn остановлен."}
          </p>

        </div>

        <CodeBlock
          caption={"порядок проверки"}
          code={
            "1. активное окружение\n" +
            "2. pip show fastapi\n" +
            "3. существует app/main.py\n" +
            "4. есть app = FastAPI()\n" +
            "5. команда app.main:app\n" +
            "6. Uvicorn сообщает адрес\n" +
            "7. GET / возвращает JSON\n" +
            "8. /docs открывается"
          }
        />

        <TrueFalse
          statement={
            <>
              {"Команда запуска зависит от структуры проекта."}
            </>
          }
          isTrue={true}
          explanation={"Путь должен совпадать с папками и именем объекта."}
        />

        <Callout tone="info">
          {"Меняйте одну причину за раз."}
        </Callout>

        <div className="lesson-check-group">
          <QuizCard
            question={"Что делает Uvicorn?"}
            options={[
              "запускает сервер",
              "создаёт модель",
              "хранит коллекцию",
            ]}
            correctIndex={0}
            explanation={"Он слушает address."}
          />
          <QuizCard
            question={"Что значит app.main:app?"}
            options={[
              "модуль и объект",
              "два path",
              "логин",
            ]}
            correctIndex={0}
            explanation={"Это импортный адрес."}
          />
          <QuizCard
            question={"Где Swagger?"}
            options={[
              "/docs",
              "/swagger.py",
              "/body",
            ]}
            correctIndex={0}
            explanation={"FastAPI предоставляет /docs."}
          />
          <QuizCard
            question={"Что делает return dict?"}
            options={[
              "JSON body",
              "новый порт",
              "query",
            ]}
            correctIndex={0}
            explanation={"FastAPI сериализует данные."}
          />
        </div>

        <KeyTakeaways
          points={[
            <>{"FastAPI и Uvicorn имеют разные роли."}</>,
            <>{"App создаётся через FastAPI()."}</>,
            <>{"Decorator связывает method и path."}</>,
            <>{"Return dict становится JSON."}</>,
            <>{"App.main:app указывает модуль и объект."}</>,
            <>{"Reload нужен для разработки."}</>,
            <>{"Swagger строится из OpenAPI."}</>,
            <>{"Endpoint проверяется request."}</>,
          ]}
        />

        <PracticeCta text={"Создайте app/main.py, запустите Uvicorn и проверьте GET / через браузер, Postman и Swagger."} />
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
