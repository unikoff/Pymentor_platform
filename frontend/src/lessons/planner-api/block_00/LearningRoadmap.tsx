import { Route, Trophy } from "lucide-react";
import { BranchExplorer, Callout, CodeBlock, CodeSequence, CompareSolutions, KeyTakeaways, Lead, MethodGrid, PracticeCta, QuizCard, RecallCard, RichHero, RichLesson, Section, StepThrough, TypeCard, TypeCards } from "../../shared";

export function LearningRoadmap() {
  return (
    <RichLesson>
      <RichHero
        variant="project"
        chip="ЭТАП 3 · карта обучения"
        title="От Persistent Planner к первому REST API"
        intro="За 24 занятия знакомый проект перестанет быть только консольной программой. Вы разберёте HTTP по частям, запустите FastAPI, реализуете CRUD в памяти, разделите приложение на понятные модули и защитите Planner API."
        tags={[
          { icon: <Route size={14} />, label: "занятия 45–68" },
          { icon: <Trophy size={14} />, label: "Planner API" },
        ]}
      />

      <Section number="01" title={"От Persistent Planner к HTTP API"}>
        <Lead>
          {"В конце второго этапа уже существует Persistent Planner: модель Task, сервисные операции, JSON-хранилище, ожидаемые исключения и первые тесты. Третий этап не переписывает этот опыт с нуля. Он меняет способ общения с приложением."}
        </Lead>

        <div className="lesson-route">
          <ol>
            <li><strong>Было:</strong> человек запускает программу и вводит команду в терминале.</li>
            <li><strong>Станет:</strong> HTTP-клиент отправляет request по адресу endpoint.</li>
            <li><strong>Было:</strong> функция печатает сообщение через print.</li>
            <li><strong>Станет:</strong> endpoint возвращает status, headers и JSON body.</li>
          </ol>
          <p>{"Предметная область остаётся знакомой: задачи всё так же создаются, ищутся, изменяются и удаляются."}</p>
        </div>

        <CodeBlock
          caption={"эволюция проекта"}
          code={
            "Console Planner\n" +
            "    ↓\n" +
            "Persistent Planner\n" +
            "    ↓\n" +
            "HTTP contract\n" +
            "    ↓\n" +
            "FastAPI + Pydantic\n" +
            "    ↓\n" +
            "CRUD in memory\n" +
            "    ↓\n" +
            "Planner API"
          }
        />

        <CompareSolutions
          question={"Что меняется при переходе к API?"}
          left={{
            title: "Python-правило",
            code: "def find_task(tasks, task_id):\n    ...",
            note: "Поиск по id остаётся обычной функцией.",
          }}
          right={{
            title: "Граница приложения",
            code: "@app.get(\"/tasks/{task_id}\")\ndef get_task(task_id: int):\n    ...",
            note: "Вместо input появляется HTTP path и response.",
          }}
          preferred="both"
          explanation={"Старые Python-функции продолжают решать предметные задачи, а FastAPI добавляет сетевой контракт."}
        />

        <Callout tone="info">
          {"Функции, декораторы, type hints, модули, исключения и pytest теперь становятся строительными деталями backend-приложения."}
        </Callout>
      </Section>
      <Section number="02" title={"Маршрут четырёх блоков"}>
        <Lead>
          {"Сложность повышается по одному слою. Сначала ученик читает HTTP без фреймворка, затем запускает один endpoint, после этого реализует CRUD и только в конце разделяет рабочий файл на модули."}
        </Lead>

        <MethodGrid
          rows={[
            [
              <>{"Блок 9 · От консольной команды к HTTP"}</>,
              <>{"Занятия 45–50: клиент, сервер, request, response, methods, status codes, REST, path, query и body."}</>,
            ],
            [
              <>{"Блок 10 · Postman, FastAPI и Pydantic"}</>,
              <>{"Занятия 51–56: ручной request, Uvicorn, Swagger, GET, path, query и первая request schema."}</>,
            ],
            [
              <>{"Блок 11 · Схемы и полный CRUD"}</>,
              <>{"Занятия 57–62: validation, TaskCreate/TaskUpdate/TaskPatch/TaskRead, storage в памяти, PUT, PATCH и DELETE."}</>,
            ],
            [
              <>{"Блок 12 · Структура и финальный проект"}</>,
              <>{"Занятия 63–68: APIRouter, TestClient, модули, полная логика, README и GitHub Release."}</>,
            ],
          ]}
        />

        <CodeSequence
          title={"Соберите последовательность этапа"}
          prompt={"Расположите этапы так, чтобы новая сложность опиралась на уже понятную."}
          pieces={[
            { id: "http", code: "понять HTTP request и response" },
            { id: "postman", code: "отправить request через Postman" },
            { id: "fastapi", code: "запустить первый FastAPI endpoint" },
            { id: "schema", code: "описать данные через Pydantic" },
            { id: "crud", code: "реализовать CRUD в памяти" },
            { id: "routers", code: "разделить приложение на модули" },
            { id: "release", code: "проверить API и оформить Release" },
          ]}
          correctOrder={["http", "postman", "fastapi", "schema", "crud", "routers", "release"]}
          explanation={"Архитектура появляется после рабочего API, а не до понимания одного endpoint."}
        />

        <Callout tone="info">
          {"Переход к следующему блоку происходит после контрольной практики, а не только после прочтения текста."}
        </Callout>
      </Section>
      <Section number="03" title={"Блок 9: HTTP до FastAPI"}>
        <Lead>
          {"Первый блок создаёт понятную модель сети. Ученик должен уметь описать request и response обычным языком до появления decorators FastAPI."}
        </Lead>

        <MethodGrid
          rows={[
            [
              <>{"45. Почему CLI недостаточно"}</>,
              <>{"Клиент и backend могут работать в разных процессах."}</>,
            ],
            [
              <>{"46. HTTP request"}</>,
              <>{"URL, method, headers и body как части одного сообщения."}</>,
            ],
            [
              <>{"47. HTTP response"}</>,
              <>{"Status, headers, body и Content-Type как части результата."}</>,
            ],
            [
              <>{"48. GET, POST, PUT, PATCH, DELETE"}</>,
              <>{"Method выбирается по смыслу операции."}</>,
            ],
            [
              <>{"49. REST, resource и endpoint"}</>,
              <>{"Пути /tasks и /tasks/{task_id} описывают collection и item."}</>,
            ],
            [
              <>{"50. Path, query и body"}</>,
              <>{"Данные распределяются по контракту, а не помещаются в случайное место."}</>,
            ],
          ]}
        />

        <TypeCards>
          <TypeCard badge={"client"} title={"Кто начинает общение"} code={"Postman → request"}>
            {"Клиент формирует request и ждёт response."}
          </TypeCard>
          <TypeCard badge={"server"} badgeTone="float" title={"Кто принимает решение"} code={"request → endpoint"}>
            {"Сервер выбирает endpoint и выполняет правило."}
          </TypeCard>
          <TypeCard badge={"contract"} badgeTone="str" title={"О чём договорились"} code={"method + path + data"}>
            {"Method, path, data и response понятны обеим сторонам."}
          </TypeCard>
        </TypeCards>

        <RecallCard
          question={"Почему HTTP изучается до большого FastAPI-приложения?"}
          hint={"Подумайте, что скрывают decorators и автоматическая validation."}
          answer={<p>{"Без модели request и response ученик видит только набор decorators и не понимает их назначение."}</p>}
        />

        <Callout tone="info">
          {"В этом блоке 401 и 403 изучаются по смыслу, но полноценная авторизация ещё не реализуется."}
        </Callout>
      </Section>
      <Section number="04" title={"Блок 10: первый работающий FastAPI"}>
        <Lead>
          {"Во втором блоке HTTP становится наблюдаемым сервером. Сначала request отправляется вручную, затем появляется минимальное приложение и только после этого добавляются параметры."}
        </Lead>

        <MethodGrid
          rows={[
            [
              <>{"51. Postman"}</>,
              <>{"Собрать request вручную и прочитать response без frontend."}</>,
            ],
            [
              <>{"52. FastAPI, Uvicorn и Swagger"}</>,
              <>{"Запустить процесс сервера и первый GET endpoint."}</>,
            ],
            [
              <>{"53. GET endpoints"}</>,
              <>{"Вернуть dict и list как JSON response."}</>,
            ],
            [
              <>{"54. Path-параметр"}</>,
              <>{"Выбрать item по task_id и проверить копию найденного объекта либо None."}</>,
            ],
            [
              <>{"55. Query-параметры"}</>,
              <>{"Подготовить filter, sort и limit для будущего GET /tasks, не меняя исходный список."}</>,
            ],
            [
              <>{"56. BaseModel и body"}</>,
              <>{"Проверить TaskCreate из JSON body и вернуть временный 200 без создания ресурса."}</>,
            ],
          ]}
        />

        <StepThrough
          code={
            "POST /tasks\n" +
            "Content-Type: application/json\n\n" +
            "{\n" +
            "  \"title\": \"Изучить FastAPI\",\n" +
            "  \"priority\": 4\n" +
            "}"
          }
          steps={[
            { line: 0, note: "POST выражает создание.", vars: { method: "POST" } },
            { line: 0, note: "Path /tasks указывает на collection.", vars: { path: "/tasks" } },
            { line: 1, note: "Header сообщает формат body.", vars: { format: "JSON" } },
            { line: 3, note: "Body содержит поля TaskCreate.", vars: { title: "str", priority: "int" } },
            { line: 0, note: "При успехе сервер возвращает 201.", vars: { status: "201" } },
          ]}
        />

        <Callout tone="info">
          {"На этом этапе приложение остаётся в одном понятном файле. Роутеры не вводятся одновременно с первым decorator."}
        </Callout>
      </Section>
      <Section number="05" title={"Блок 11: схемы и полный CRUD"}>
        <Lead>
          {"После первого POST становится видно, что данные для создания, обновления и ответа имеют разные роли. Третий блок разделяет schemas и завершает CRUD."}
        </Lead>

        <MethodGrid
          rows={[
            [
              <>{"57. Pydantic validation"}</>,
              <>{"Ограничения длины, диапазона и понятный response 422."}</>,
            ],
            [
              <>{"58. TaskCreate, TaskUpdate, TaskRead"}</>,
              <>{"Разные формы создания, изменения и ответа."}</>,
            ],
            [
              <>{"59. In-memory storage"}</>,
              <>{"Временное состояние процесса и генерация id."}</>,
            ],
            [
              <>{"60. Create и Read"}</>,
              <>{"POST, GET collection и GET item."}</>,
            ],
            [
              <>{"61. PUT и PATCH"}</>,
              <>{"Полная замена отделяется от частичного обновления."}</>,
            ],
            [
              <>{"62. DELETE и HTTPException"}</>,
              <>{"Удаление, status 204 и единый 404."}</>,
            ],
          ]}
        />

        <CodeBlock
          caption={"обязательная CRUD-карта"}
          code={
            "GET    /tasks\n" +
            "GET    /tasks/{task_id}\n" +
            "POST   /tasks\n" +
            "PUT    /tasks/{task_id}\n" +
            "PATCH  /tasks/{task_id}\n" +
            "DELETE /tasks/{task_id}"
          }
        />

        <CompareSolutions
          question={"Как называть список задач внутри процесса?"}
          left={{
            title: "Учебная база данных",
            code: "tasks = []  # database",
            note: "Название скрывает ограничения и создаёт ложную модель.",
          }}
          right={{
            title: "In-memory storage",
            code: "tasks = []  # temporary process state",
            note: "Название честно сообщает, что данные исчезнут после перезапуска.",
          }}
          preferred="right"
          explanation={"Настоящая база появится как решение уже наблюдаемых ограничений памяти процесса."}
        />

        <Callout tone="info">
          {"Список или словарь внутри Python-процесса не является базой данных. Используйте термин «in-memory storage»."}
        </Callout>
      </Section>
      <Section number="06" title={"Блок 12: структура, тесты и финальный проект"}>
        <Lead>
          {"Только после полного CRUD один файл становится действительно неудобным. Теперь разделение на routers, schemas, crud и storage отвечает на видимую проблему."}
        </Lead>

        <MethodGrid
          rows={[
            [
              <>{"63. APIRouter"}</>,
              <>{"Prefix, tags и include_router; endpoints покидают main.py."}</>,
            ],
            [
              <>{"64. TestClient"}</>,
              <>{"Успешные requests, 404, 422 и CRUD-цепочка."}</>,
            ],
            [
              <>{"65. Контракт и архитектура"}</>,
              <>{"Endpoints, schemas, statuses и errors описываются до реализации."}</>,
            ],
            [
              <>{"66. Каркас проекта"}</>,
              <>{"Schemas, storage, crud и routers соединяются без циклов."}</>,
            ],
            [
              <>{"67. Полная CRUD-логика"}</>,
              <>{"Filters, updates, delete и error responses работают вместе."}</>,
            ],
            [
              <>{"68. Release"}</>,
              <>{"Postman, tests, README, GitHub Release и защита."}</>,
            ],
          ]}
        />

        <CodeBlock
          caption={"финальная структура"}
          code={
            "studyhub-api/\n" +
            "├── app/\n" +
            "│   ├── main.py\n" +
            "│   ├── schemas/task.py\n" +
            "│   ├── routers/tasks.py\n" +
            "│   ├── crud/tasks.py\n" +
            "│   ├── storage/memory.py\n" +
            "│   └── exceptions.py\n" +
            "├── tests/test_tasks.py\n" +
            "├── postman/\n" +
            "├── README.md\n" +
            "└── requirements.txt"
          }
        />

        <BranchExplorer
          code={
            "main.py\n" +
            "  ↓ include_router\n" +
            "routers/tasks.py\n" +
            "  ↓ validated schema\n" +
            "crud/tasks.py\n" +
            "  ↓ reads and changes\n" +
            "storage/memory.py"
          }
          scenarios={[
            { label: "запуск", activeLine: 1, output: "main подключает router" },
            { label: "POST /tasks", activeLine: 3, output: "router получает TaskCreate" },
            { label: "создание", activeLine: 5, output: "crud выполняет операцию" },
            { label: "сохранение", activeLine: 7, output: "storage меняет временное состояние" },
          ]}
        />

        <Callout tone="info">
          {"Storage не импортирует router, crud не запускает FastAPI, а schema не знает способ хранения."}
        </Callout>
      </Section>
      <Section number="07" title={"Что будет готово к концу этапа"}>
        <Lead>
          {"Результатом является не набор несвязанных decorators, а небольшой API-проект, который можно запустить, проверить, объяснить и показать по документации."}
        </Lead>

        <TypeCards>
          <TypeCard badge={"HTTP"} title={"Ясный контракт"} code={"GET /tasks → 200"}>
            {"У каждого endpoint есть method, path, input, response и ожидаемые errors."}
          </TypeCard>
          <TypeCard badge={"FastAPI"} badgeTone="float" title={"Рабочее приложение"} code={"@app.get(...)"}>
            {"CRUD задач, Pydantic schemas, Swagger и Postman Collection."}
          </TypeCard>
          <TypeCard badge={"quality"} badgeTone="str" title={"Проверяемый результат"} code={"python -m pytest"}>
            {"8–12 API-тестов, README, понятная структура и Git Release."}
          </TypeCard>
        </TypeCards>

        <CodeBlock
          caption={"путь одного request"}
          code={
            "client request\n" +
            "→ router\n" +
            "→ Pydantic validation\n" +
            "→ CRUD rule\n" +
            "→ in-memory storage\n" +
            "→ response schema\n" +
            "→ status + JSON body"
          }
        />

        <MethodGrid
          rows={[
            [
              <>{"HTTP"}</>,
              <>{"Объяснить GET/POST, PUT/PATCH, path/query/body и основные statuses."}</>,
            ],
            [
              <>{"FastAPI"}</>,
              <>{"Запустить Uvicorn, открыть Swagger и реализовать endpoint."}</>,
            ],
            [
              <>{"Pydantic"}</>,
              <>{"Разделить input и output schemas, прочитать validation error."}</>,
            ],
            [
              <>{"Testing"}</>,
              <>{"Запустить TestClient-сценарии и найти причину падения."}</>,
            ],
            [
              <>{"Project"}</>,
              <>{"Показать README, Postman Collection, Git history и ограничения."}</>,
            ],
          ]}
        />

        <Callout tone="info">
          {"На защите ученик прослеживает один request от клиента до response и называет ответственность каждого файла."}
        </Callout>
      </Section>
      <Section number="08" title={"Как проходить этап без перегрузки"}>
        <Lead>
          {"Рабочий ритм остаётся прежним: понять одну модель, проверить её маленьким request, изменить одну деталь и только затем расширять проект."}
        </Lead>

        <div className="lesson-practice-steps">
          <h3>Перед кодом</h3>
          <p>{"Запишите method, path, input, успешный status и один ошибочный сценарий."}</p>

          <h3>Во время кода</h3>
          <p>{"Добавляйте один endpoint или одно validation-правило за шаг. После каждого изменения отправляйте request."}</p>

          <h3>После кода</h3>
          <p>{"Сохраните request в Postman, добавьте тест и сделайте небольшой Git-коммит."}</p>

          <h3>При ошибке</h3>
          <p>{"Сначала определите слой: клиент, FastAPI validation, endpoint, CRUD или storage."}</p>
        </div>

        <div className="lesson-check-group">
          <QuizCard
            question={"Почему APIRouter появляется ближе к концу этапа?"}
            options={[
              "Сначала нужен работающий API и реальная проблема большого файла",
              "FastAPI запрещает routers в начале",
              "Router работает только с базой данных",
            ]}
            correctIndex={0}
            explanation={"Разделение должно решать наблюдаемую проблему, а не создавать пустую архитектуру."}
          />
          <QuizCard
            question={"Как называется список задач внутри процесса?"}
            options={["in-memory storage", "PostgreSQL", "надёжная база данных"]}
            correctIndex={0}
            explanation={"Данные временные и исчезают после перезапуска."}
          />
          <QuizCard
            question={"Что проектируют до endpoint?"}
            options={[
              "method, path, data, response и errors",
              "только имя функции",
              "только внешний вид Swagger",
            ]}
            correctIndex={0}
            explanation={"Endpoint реализует заранее сформулированный HTTP-контракт."}
          />
          <QuizCard
            question={"Что является итогом этапа?"}
            options={[
              "Planner API с CRUD, schemas, tests и документацией",
              "JWT и Redis",
              "микросервисная система",
            ]}
            correctIndex={0}
            explanation={"Сложные production-темы сознательно отложены."}
          />
        </div>

        <KeyTakeaways
          points={[
            <>{"Третий этап переводит знакомый Planner в HTTP API."}</>,
            <>{"HTTP изучается раньше фреймворка."}</>,
            <>{"FastAPI вводится от одного endpoint к полному CRUD."}</>,
            <>{"Pydantic разделяет формы входа, обновления и ответа."}</>,
            <>{"Хранилище в памяти не называется базой данных."}</>,
            <>{"Архитектура появляется после рабочего файла."}</>,
            <>{"TestClient, Postman и Swagger проверяют разные стороны контракта."}</>,
            <>{"Финальный результат должен запускаться и объясняться."}</>,
          ]}
        />

        <PracticeCta
          text={"Перед занятием 45 нарисуйте две схемы: путь команды в Persistent Planner и путь будущего HTTP request в Planner API."}
        />
      </Section>
    </RichLesson>
  );
}
