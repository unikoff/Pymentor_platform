import { BrainCircuit, ShieldCheck } from "lucide-react";
import { BranchExplorer, Callout, CodeBlock, CompareSolutions, FillBlank, KeyTakeaways, Lead, MatchPairs, MethodGrid, PracticeCta, QuizCard, RecallCard, RichHero, RichLesson, Section, StepThrough, TrueFalse, TypeCard, TypeCards } from "../../shared";

export function MonthTheory() {
  return (
    <RichLesson>
      <RichHero
        chip="Этап 3 · общая теория"
        title="HTTP, REST, FastAPI и путь одного запроса"
        intro="Главная модель этапа проста: клиент формирует request, сервер выбирает endpoint, проверяет данные, выполняет Python-правило и возвращает response. Все новые термины занимают своё место внутри этой цепочки."
        tags={[
          { icon: <BrainCircuit size={14} />, label: "одна сквозная модель" },
          { icon: <ShieldCheck size={14} />, label: "validation и statuses" },
        ]}
      />

      <Section number="01" title={"Клиент и сервер — две роли"}>
        <Lead>
          {"Представьте стойку обслуживания. Посетитель первым формулирует просьбу, сотрудник принимает её, выполняет правило и выдаёт результат. В HTTP клиент похож на посетителя, а сервер — на обслуживающую систему."}
        </Lead>

        <TypeCards>
          <TypeCard badge={"client"} title={"Формирует request"} code={"method + URL + data"}>
            {"Браузер, Postman, frontend или другой backend могут быть клиентами."}
          </TypeCard>
          <TypeCard badge={"server"} badgeTone="float" title={"Ждёт обращения"} code={"listen → handle"}>
            {"Uvicorn держит процесс запущенным, FastAPI выбирает endpoint."}
          </TypeCard>
          <TypeCard badge={"contract"} badgeTone="str" title={"Связывает роли"} code={"HTTP"}>
            {"Обе стороны понимают структуру HTTP-сообщений."}
          </TypeCard>
        </TypeCards>

        <CodeBlock
          caption={"минимальная модель"}
          code={
            "client\n" +
            "  ↓ HTTP request\n" +
            "server\n" +
            "  ↓ Python rule\n" +
            "server\n" +
            "  ↓ HTTP response\n" +
            "client"
          }
        />

        <TrueFalse
          statement={<>{"Сервер первым отправляет обычный response без request клиента."}</>}
          isTrue={false}
          explanation={"В базовой request-response модели response является ответом на request."}
        />

        <Callout tone="info">
          {"Клиент и сервер — роли, а не конкретные устройства. Один backend может быть сервером для frontend и клиентом для другого API."}
        </Callout>
      </Section>
      <Section number="02" title={"Request — структурированное обращение"}>
        <Lead>
          {"HTTP request похож на заполненный бланк: в нём есть адрес, выбранное действие, служебные сведения и при необходимости данные."}
        </Lead>

        <MethodGrid
          rows={[
            [
              <>{"Method"}</>,
              <>{"Какое действие требуется: GET, POST, PUT, PATCH или DELETE."}</>,
            ],
            [
              <>{"URL"}</>,
              <>{"К какому серверу и ресурсу направлено обращение."}</>,
            ],
            [
              <>{"Headers"}</>,
              <>{"Служебное описание request, например формат body."}</>,
            ],
            [
              <>{"Body"}</>,
              <>{"Данные, которые клиент передаёт серверу."}</>,
            ],
          ]}
        />

        <CodeBlock
          caption={"request создания задачи"}
          code={
            "POST /tasks HTTP/1.1\n" +
            "Host: 127.0.0.1:8000\n" +
            "Content-Type: application/json\n" +
            "\n" +
            "{\n" +
            "  \"title\": \"Изучить HTTP\",\n" +
            "  \"priority\": 4\n" +
            "}"
          }
        />

        <MatchPairs
          prompt={"Соедините часть request и вопрос."}
          leftTitle={"Часть"}
          rightTitle={"Вопрос"}
          pairs={[
            { left: "POST", right: "какое действие требуется?" },
            { left: "/tasks", right: "к какому ресурсу обращаемся?" },
            { left: "Content-Type", right: "в каком формате body?" },
            { left: "title и priority", right: "какие данные передаём?" },
          ]}
          explanation={"Request читается как единое сообщение."}
        />

        <Callout tone="info">
          {"Body не обязателен для каждого request. Обычный GET списка обычно передаёт настройки через query."}
        </Callout>
      </Section>
      <Section number="03" title={"Response — результат обработки"}>
        <Lead>
          {"Response тоже состоит из частей. Status сообщает категорию результата, headers описывают ответ, а body переносит данные или detail ошибки."}
        </Lead>

        <MethodGrid
          rows={[
            [
              <>{"Status"}</>,
              <>{"Успех, создание, отсутствие ресурса, validation error или сбой сервера."}</>,
            ],
            [
              <>{"Headers"}</>,
              <>{"Формат body и другие свойства ответа."}</>,
            ],
            [
              <>{"Body"}</>,
              <>{"Объект, список или структурированное описание ошибки."}</>,
            ],
          ]}
        />

        <CodeBlock
          caption={"успешный response"}
          code={
            "HTTP/1.1 201 Created\n" +
            "Content-Type: application/json\n" +
            "\n" +
            "{\n" +
            "  \"id\": 3,\n" +
            "  \"title\": \"Изучить HTTP\",\n" +
            "  \"priority\": 4,\n" +
            "  \"is_done\": false\n" +
            "}"
          }
        />

        <CodeBlock
          caption={"ошибочный response"}
          code={
            "HTTP/1.1 404 Not Found\n" +
            "Content-Type: application/json\n" +
            "\n" +
            "{\n" +
            "  \"detail\": \"Task not found\"\n" +
            "}"
          }
        />

        <RecallCard
          question={"Почему текста success внутри body недостаточно?"}
          hint={"Клиент сначала классифицирует результат по HTTP."}
          answer={<p>{"Status является стандартным машинным сигналом, а body уточняет данные."}</p>}
        />

        <Callout tone="info">
          {"Status и body выполняют разные роли и не должны противоречить друг другу."}
        </Callout>
      </Section>
      <Section number="04" title={"Methods и status codes выражают смысл"}>
        <Lead>
          {"Method выбирается по намерению клиента, а status — по фактическому результату обработки."}
        </Lead>

        <MethodGrid
          rows={[
            [
              <>{"GET"}</>,
              <>{"Получить представление ресурса без скрытого изменения."}</>,
            ],
            [
              <>{"POST"}</>,
              <>{"Создать новый ресурс."}</>,
            ],
            [
              <>{"PUT"}</>,
              <>{"Полностью заменить представление."}</>,
            ],
            [
              <>{"PATCH"}</>,
              <>{"Изменить только переданные поля."}</>,
            ],
            [
              <>{"DELETE"}</>,
              <>{"Удалить выбранный ресурс."}</>,
            ],
          ]}
        />

        <MethodGrid
          rows={[
            [
              <>{"200 OK"}</>,
              <>{"Успешное чтение или обновление с body."}</>,
            ],
            [
              <>{"201 Created"}</>,
              <>{"Новый ресурс создан."}</>,
            ],
            [
              <>{"204 No Content"}</>,
              <>{"Действие выполнено без body."}</>,
            ],
            [
              <>{"400 Bad Request"}</>,
              <>{"Логически некорректный request."}</>,
            ],
            [
              <>{"404 Not Found"}</>,
              <>{"Конкретный ресурс отсутствует."}</>,
            ],
            [
              <>{"422 Unprocessable Entity"}</>,
              <>{"Вход не соответствует schema."}</>,
            ],
            [
              <>{"500 Internal Server Error"}</>,
              <>{"Непредвиденная ошибка сервера."}</>,
            ],
          ]}
        />

        <CompareSolutions
          question={"Как обновить только is_done?"}
          left={{
            title: "PUT",
            code: "PUT /tasks/1\n{\"is_done\": true}",
            note: "PUT обычно ожидает полное представление.",
          }}
          right={{
            title: "PATCH",
            code: "PATCH /tasks/1\n{\"is_done\": true}",
            note: "PATCH выражает частичное изменение.",
          }}
          preferred="right"
          explanation={"Method сообщает смысл операции."}
        />

        <Callout tone="info">
          {"401 и 403 изучаются по смыслу, но авторизация пока не входит в проект."}
        </Callout>
      </Section>
      <Section number="05" title={"Path, query и body отвечают на разные вопросы"}>
        <Lead>
          {"Чтобы не смешивать данные, задавайте три вопроса: какой ресурс, как настроить выборку и какие поля объекта передать."}
        </Lead>

        <TypeCards>
          <TypeCard badge={"path"} title={"Какой конкретный ресурс"} code={"/tasks/42"}>
            {"Task id является обязательной частью адреса item."}
          </TypeCard>
          <TypeCard badge={"query"} badgeTone="float" title={"Как показать collection"} code={"/tasks?limit=10"}>
            {"Query-параметры настраивают выборку. В разных API они могут задавать поиск или пагинацию; в нашем Planner API будут фильтр по is_done, сортировка по id и limit. Текстового поиска и offset в этой версии нет."}
          </TypeCard>
          <TypeCard badge={"body"} badgeTone="str" title={"Какие данные передать"} code={"{\"title\": \"FastAPI\"}"}>
            {"JSON body описывает создаваемый или обновляемый объект."}
          </TypeCard>
        </TypeCards>

        <MatchPairs
          prompt={"Разместите данные в правильной части request."}
          leftTitle={"Данные"}
          rightTitle={"Место"}
          pairs={[
            { left: "task_id", right: "path" },
            { left: "is_done и limit", right: "query" },
            { left: "title и priority", right: "body" },
            { left: "Content-Type", right: "header" },
          ]}
          explanation={"Расположение следует из роли данных."}
        />

        <FillBlank
          prompt={"Заполните item path для задачи с id 7."}
          before={"GET /tasks/"}
          after={""}
          options={["7", "?7", "{\"id\": 7}"]}
          answer={"7"}
          explanation={"Конкретный id является сегментом path."}
        />

        <Callout tone="info">
          {"Не пытайтесь передать всё в одном месте: URL, query и body имеют разные обязанности."}
        </Callout>
      </Section>
      <Section number="06" title={"FastAPI связывает HTTP с обычной функцией"}>
        <Lead>
          {"FastAPI не отменяет Python. Decorator регистрирует функцию как обработчик method и path, параметры получают данные request, а return становится основой response."}
        </Lead>

        <CodeBlock
          caption={"обычный endpoint"}
          code={
            "from fastapi import FastAPI\n" +
            "from fastapi import HTTPException\n" +
            "\n" +
            "app = FastAPI()\n" +
            "\n" +
            "\n" +
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

        <StepThrough
          code={
            "@app.get(\"/tasks/{task_id}\")\n" +
            "def get_task(task_id: int):\n" +
            "    return {\"id\": task_id}"
          }
          steps={[
            { line: 0, note: "Decorator регистрирует GET и path.", vars: { route: "GET item" } },
            { line: 1, note: "Функция становится handler.", vars: { handler: "get_task" } },
            { line: 1, note: "FastAPI извлекает task_id и проверяет int.", vars: { input: "path" } },
            { line: 2, note: "Handler возвращает dict.", vars: { return: "dict" } },
            { line: 2, note: "Dict превращается в JSON response.", vars: { status: "200" } },
          ]}
        />

        <TrueFalse
          statement={<>{"Decorator @app.get выполняет тело endpoint при импорте модуля."}</>}
          isTrue={false}
          explanation={"При импорте функция регистрируется; тело запускается позже при request."}
        />

        <Callout tone="info">
          {"Поэтому во втором этапе изучались функции как объекты, decorators, imports, parameters, return и exceptions."}
        </Callout>
      </Section>
      <Section number="07" title={"Pydantic проверяет форму данных"}>
        <Lead>
          {"Pydantic schema похожа на форму с подписанными полями. Она сообщает обязательные данные, types и ограничения до запуска endpoint."}
        </Lead>

        <CodeBlock
          caption={"schema создания"}
          code={
            "from pydantic import BaseModel\n" +
            "from pydantic import Field\n" +
            "\n" +
            "\n" +
            "class TaskCreate(BaseModel):\n" +
            "    title: str = Field(min_length=1, max_length=120)\n" +
            "    priority: int = Field(ge=1, le=5)"
          }
        />

        <CodeBlock
          caption={"endpoint"}
          code={
            "@app.post(\"/tasks\", status_code=201)\n" +
            "def create_task(task: TaskCreate):\n" +
            "    data = task.model_dump()\n" +
            "    return create_task_in_memory(data)"
          }
        />

        <BranchExplorer
          code={
            "получить JSON body\n" +
            "проверить required fields\n" +
            "проверить types\n" +
            "проверить Field constraints\n" +
            "вызвать endpoint\n" +
            "вернуть response"
          }
          scenarios={[
            { label: "валидный body", activeLine: 4, output: "endpoint получает TaskCreate" },
            { label: "нет priority", activeLine: 1, output: "422 до endpoint" },
            { label: "priority = 9", activeLine: 3, output: "422 до endpoint" },
          ]}
        />

        <Callout tone="info">
          {"Validation проверяет форму входа, но предметные конфликты и правила приложения остаются в CRUD-коде."}
        </Callout>
      </Section>
      <Section number="08" title={"Полный путь request и граница следующего этапа"}>
        <Lead>
          {"К концу этапа ученик должен видеть не отдельные decorators, а полный маршрут одного request. Одновременно он должен честно понимать ограничения хранения в памяти."}
        </Lead>

        <CodeBlock
          caption={"путь одного request"}
          code={
            "Postman / Swagger / frontend\n" +
            "→ method + URL + headers + body\n" +
            "→ Uvicorn\n" +
            "→ FastAPI router\n" +
            "→ path/query/body parsing\n" +
            "→ Pydantic validation\n" +
            "→ CRUD function\n" +
            "→ in-memory storage\n" +
            "→ status + JSON body"
          }
        />

        <TypeCards>
          <TypeCard badge={"готово"} title={"Ясный API-контракт"}>
            {"CRUD, statuses, schemas, Swagger, Postman и TestClient."}
          </TypeCard>
          <TypeCard badge={"ограничение"} badgeTone="float" title={"Данные временные"}>
            {"После перезапуска задачи исчезают, а несколько процессов получили бы разные списки."}
          </TypeCard>
          <TypeCard badge={"следующий шаг"} badgeTone="str" title={"Настоящая база"}>
            {"SQLite, SQLAlchemy и миграции появятся как решение наблюдаемой проблемы хранения."}
          </TypeCard>
        </TypeCards>

        <div className="lesson-check-group">
          <QuizCard
            question={"Кто первым отправляет request?"}
            options={["клиент", "Pydantic", "storage"]}
            correctIndex={0}
            explanation={"Клиент инициирует обычное HTTP-взаимодействие."}
          />
          <QuizCard
            question={"Где находится id конкретной задачи?"}
            options={["path", "response body", "Content-Type"]}
            correctIndex={0}
            explanation={"Id определяет адрес item resource."}
          />
          <QuizCard
            question={"Что означает 422?"}
            options={["вход не прошёл validation", "ресурс отсутствует", "сервер выключен"]}
            correctIndex={0}
            explanation={"Schema отклонила форму или значение данных."}
          />
          <QuizCard
            question={"Почему список Python не является базой данных?"}
            options={[
              "он живёт только в текущем процессе",
              "в нём нельзя хранить dict",
              "FastAPI запрещает list",
            ]}
            correctIndex={0}
            explanation={"In-memory state не обеспечивает постоянное и согласованное хранение."}
          />
        </div>

        <KeyTakeaways
          points={[
            <>{"Клиент отправляет request, сервер возвращает response."}</>,
            <>{"Request содержит method, URL, headers и при необходимости body."}</>,
            <>{"Response содержит status, headers и body."}</>,
            <>{"Method и status выражают смысл операции и результата."}</>,
            <>{"Path, query и body используются для разных ролей."}</>,
            <>{"FastAPI связывает HTTP route с Python-функцией."}</>,
            <>{"Pydantic проверяет вход до endpoint."}</>,
            <>{"In-memory storage подготавливает переход к базе."}</>,
          ]}
        />

        <PracticeCta
          text={"Для любого endpoint назовите клиента, method, path, входные данные, validation, Python-правило, storage, status и response body."}
        />
      </Section>
    </RichLesson>
  );
}
