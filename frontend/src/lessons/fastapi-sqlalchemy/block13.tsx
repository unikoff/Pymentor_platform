import {
  Braces,
  Cloud,
  FileText,
  GitBranch,
  KeyRound,
  Layers,
  Route,
  Wrench,
} from "lucide-react";
import {
  BranchExplorer,
  BugHunt,
  Callout,
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
  StepThrough,
  TerminalDemo,
  TrueFalse,
} from "../shared";

const BLOCK_TITLE = "Этап 4 · Блок 13 · FastAPI как цельное приложение";

// 69. Путь HTTP-запроса внутри FastAPI
export function Lesson69({ module }: { module?: string }) {
  return (
    <RichLesson>
      <RichHero
        variant="project"
        chip={module ?? BLOCK_TITLE}
        title={"Путь HTTP-запроса внутри FastAPI"}
        intro={"Разберём FastAPI как конвейер, а не как набор decorators: request проходит через Uvicorn, поиск route, разбор параметров, Pydantic validation, dependencies, endpoint и формирование response."}
        tags={[
          { icon: <Route size={14} />, label: "request → response" },
          { icon: <Layers size={14} />, label: "границы ответственности" },
        ]}
      />

      <Section number="01" title={"Зачем видеть весь конвейер"}>
        <Lead>
          {"После третьего этапа endpoint уже работает, но его легко воспринимать как магическую функцию. Перед подключением базы данных важно увидеть, какие шаги FastAPI выполняет до и после строки вашего Python-кода."}
        </Lead>

        <div className="lesson-practice-steps">
          <h3>{"Симптом магии"}</h3>
          <p>
            {"Ученик меняет decorator, schema и return одновременно, но не понимает, на каком этапе возник status 422 или 500."}
          </p>

          <h3>{"Новая модель"}</h3>
          <p>
            {"Request проходит последовательность независимых границ, каждая из которых отвечает на свой вопрос."}
          </p>

          <h3>{"Практическая польза"}</h3>
          <p>
            {"По status и traceback можно определить, дошёл ли request до endpoint и какая часть требует проверки."}
          </p>

        </div>

        <CodeBlock
          caption={"маршрут запроса"}
          code={
            "HTTP client\n" +
            "→ Uvicorn принимает соединение\n" +
            "→ FastAPI находит route\n" +
            "→ извлекает path, query, headers и body\n" +
            "→ Pydantic проверяет данные\n" +
            "→ FastAPI решает dependencies\n" +
            "→ endpoint связывает шаги\n" +
            "→ response data сериализуется\n" +
            "→ client получает status, headers и body"
          }
        />

        <CodeSequence
          title={"Соберите путь request"}
          prompt={"Расположите этапы от клиента до response."}
          pieces={[
            { id: "client", code: "клиент отправляет request" },
            { id: "route", code: "FastAPI выбирает route" },
            { id: "parse", code: "параметры извлекаются и проверяются" },
            { id: "deps", code: "dependencies решаются" },
            { id: "handler", code: "endpoint выполняется" },
            { id: "response", code: "формируется response" },
          ]}
          correctOrder={[
            "client",
            "route",
            "parse",
            "deps",
            "handler",
            "response",
          ]}
          explanation={"Endpoint вызывается только после успешного разбора входа и зависимостей."}
        />

        <Callout tone="info">
          {"Конвейер не означает, что каждый этап нужно вручную программировать. Его нужно понимать, чтобы диагностировать и правильно размещать код."}
        </Callout>
      </Section>

      <Section number="02" title={"Uvicorn принимает request, FastAPI выбирает route"}>
        <Lead>
          {"Сетевой сервер и веб-фреймворк выполняют разные роли. Uvicorn слушает адрес и передаёт ASGI-сообщения приложению, а FastAPI сопоставляет method и path с зарегистрированной функцией."}
        </Lead>

        <div className="lesson-practice-steps">
          <h3>{"Uvicorn"}</h3>
          <p>
            {"Долгоживущий процесс принимает сетевые обращения на host и port."}
          </p>

          <h3>{"FastAPI app"}</h3>
          <p>
            {"Хранит зарегистрированные routes и общую конфигурацию приложения."}
          </p>

          <h3>{"APIRouter"}</h3>
          <p>
            {"Группирует endpoints, но после include_router они участвуют в общей таблице маршрутов."}
          </p>

        </div>

        <CodeBlock
          caption={"регистрация router"}
          code={
            "from fastapi import FastAPI\n" +
            "\n" +
            "from app.routers.tasks import router as tasks_router\n" +
            "\n" +
            "app = FastAPI()\n" +
            "app.include_router(tasks_router)"
          }
        />

        <CodeBlock
          caption={"route"}
          code={
            "from fastapi import APIRouter\n" +
            "\n" +
            "router = APIRouter(\n" +
            "    prefix=\"/tasks\",\n" +
            "    tags=[\"tasks\"],\n" +
            ")\n" +
            "\n" +
            "@router.post(\"/\", status_code=201)\n" +
            "def create_task(...):\n" +
            "    ..."
          }
        />

        <MatchPairs
          prompt={"Соедините часть системы и ответственность."}
          leftTitle={"Компонент"}
          rightTitle={"Ответственность"}
          pairs={[
            { left: "Uvicorn", right: "принять сетевой request" },
            { left: "FastAPI", right: "выбрать зарегистрированный route" },
            { left: "APIRouter", right: "сгруппировать endpoints одной области" },
            { left: "endpoint", right: "связать вход с предметной операцией" },
          ]}
          explanation={"Один request проходит через несколько ролей, но каждая остаётся отдельной."}
        />

        <Callout tone="info">
          {"Route определяется сочетанием method и path. Одинаковый path может иметь разные handlers для GET и POST."}
        </Callout>
      </Section>

      <Section number="03" title={"Разбор path, query, headers и body"}>
        <Lead>
          {"После выбора route FastAPI смотрит на сигнатуру endpoint и dependencies. По имени route, типам и специальным маркерам он определяет, откуда взять каждое значение."}
        </Lead>

        <div className="lesson-practice-steps">
          <h3>{"Path"}</h3>
          <p>
            {"Имя находится в шаблоне /tasks/{task_id} и является обязательным."}
          </p>

          <h3>{"Query"}</h3>
          <p>
            {"Параметр отсутствует в path и имеет простой тип или Query."}
          </p>

          <h3>{"Header"}</h3>
          <p>
            {"Явно объявляется через Header; underscore обычно преобразуется в hyphen."}
          </p>

          <h3>{"Body"}</h3>
          <p>
            {"Pydantic-модель параметра читается из JSON body."}
          </p>

        </div>

        <CodeBlock
          caption={"сигнатура"}
          code={
            "from typing import Annotated\n" +
            "from fastapi import Header, Query\n" +
            "\n" +
            "@router.get(\"/{task_id}\")\n" +
            "def get_task(\n" +
            "    task_id: int,\n" +
            "    include_tags: Annotated[bool, Query()] = True,\n" +
            "    x_client_version: Annotated[str | None, Header()] = None,\n" +
            "):\n" +
            "    ..."
          }
        />

        <CodeBlock
          caption={"POST body"}
          code={
            "@router.post(\"/\", status_code=201)\n" +
            "def create_task(task: TaskCreate):\n" +
            "    ..."
          }
        />

        <FillBlank
          prompt={"Откуда FastAPI возьмёт task_id?"}
          before={"@router.get(\"/tasks/{task_id}\")\ndef get_task(task_id: "}
          after={" ): ..."}
          options={[
            "int",
            "Header()",
            "TaskCreate",
          ]}
          answer={"int"}
          explanation={"Имя есть в path, а type hint задаёт преобразование к int."}
        />

        <Callout tone="info">
          {"FastAPI не угадывает предметный смысл параметра. Источник определяется объявлением endpoint и route."}
        </Callout>
      </Section>

      <Section number="04" title={"Pydantic validation происходит до endpoint"}>
        <Lead>
          {"Если JSON body не соответствует TaskCreate, endpoint не получает наполовину заполненный объект. Pydantic формирует validation errors, а FastAPI возвращает 422."}
        </Lead>

        <div className="lesson-practice-steps">
          <h3>{"Required fields"}</h3>
          <p>
            {"Поле без default должно присутствовать в request body."}
          </p>

          <h3>{"Types"}</h3>
          <p>
            {"Вход преобразуется, когда это безопасно, либо отклоняется."}
          </p>

          <h3>{"Constraints"}</h3>
          <p>
            {"Field проверяет длину, диапазон и другие ограничения."}
          </p>

          <h3>{"Не предметная ошибка"}</h3>
          <p>
            {"Отсутствующая задача — 404 из логики приложения, а не schema validation."}
          </p>

        </div>

        <CodeBlock
          caption={"schema"}
          code={
            "from pydantic import BaseModel, Field\n" +
            "\n" +
            "class TaskCreate(BaseModel):\n" +
            "    title: str = Field(min_length=1, max_length=120)\n" +
            "    priority: int = Field(ge=1, le=5)"
          }
        />

        <CodeBlock
          caption={"невалидный body"}
          code={
            "{\n" +
            "  \"title\": \"\",\n" +
            "  \"priority\": 9\n" +
            "}\n" +
            "\n" +
            "→ 422 Unprocessable Entity\n" +
            "→ endpoint не вызван"
          }
        />

        <BranchExplorer
          code={
            "получить JSON body\n" +
            "проверить required fields\n" +
            "проверить types\n" +
            "проверить Field constraints\n" +
            "создать TaskCreate\n" +
            "вызвать endpoint"
          }
          scenarios={[
            { label: "валидный body", activeLine: 5, output: "endpoint called" },
            { label: "нет priority", activeLine: 1, output: "422 before endpoint" },
            { label: "priority = 9", activeLine: 3, output: "422 before endpoint" },
          ]}
        />

        <Callout tone="info">
          {"Если отладочный print в endpoint не сработал, сначала проверьте route, parsing, validation и dependencies."}
        </Callout>
      </Section>

      <Section number="05" title={"Dependencies выполняются перед handler"}>
        <Lead>
          {"Dependency — callable, результат которого требуется endpoint или другой dependency. FastAPI сначала решает дерево зависимостей и только затем вызывает handler."}
        </Lead>

        <div className="lesson-practice-steps">
          <h3>{"Объявление потребности"}</h3>
          <p>
            {"Endpoint сообщает, какой callable нужен через Depends."}
          </p>

          <h3>{"Решение"}</h3>
          <p>
            {"FastAPI вызывает dependency с её собственными параметрами."}
          </p>

          <h3>{"Инъекция"}</h3>
          <p>
            {"Возвращённое значение передаётся в аргумент endpoint."}
          </p>

          <h3>{"Ранний выход"}</h3>
          <p>
            {"Dependency может создать HTTPException и не допустить handler."}
          </p>

        </div>

        <CodeBlock
          caption={"минимальная dependency"}
          code={
            "from typing import Annotated\n" +
            "from fastapi import Depends\n" +
            "\n" +
            "def get_api_mode() -> str:\n" +
            "    return \"development\"\n" +
            "\n" +
            "ApiMode = Annotated[str, Depends(get_api_mode)]\n" +
            "\n" +
            "@router.get(\"/\")\n" +
            "def get_tasks(api_mode: ApiMode):\n" +
            "    return {\n" +
            "        \"mode\": api_mode,\n" +
            "        \"items\": tasks,\n" +
            "    }"
          }
        />

        <StepThrough
          code={
            "request\n" +
            "→ validate input\n" +
            "→ get_api_mode()\n" +
            "→ get_tasks(api_mode)\n" +
            "→ response"
          }
          steps={[
            {
              line: 0,
              note: "Request сопоставлен route.",
              vars: { "request": "GET /tasks" },
            },
            {
              line: 1,
              note: "FastAPI проверяет параметры.",
              vars: { "validation": "ok" },
            },
            {
              line: 2,
              note: "Dependency возвращает значение.",
              vars: { "api_mode": "development" },
            },
            {
              line: 3,
              note: "Handler получает готовый аргумент.",
              vars: { "handler": "get_tasks" },
            },
            {
              line: 4,
              note: "Return превращается в response.",
              vars: { "status": "200" },
            },
          ]}
        />

        <Callout tone="info">
          {"В этом занятии важно место dependency в пути request. Синтаксис Depends подробно разбирается в занятиях 70–71."}
        </Callout>
      </Section>

      <Section number="06" title={"Endpoint связывает части, но не хранит всё"}>
        <Lead>
          {"Хороший endpoint похож на диспетчера: принимает уже проверенный вход, вызывает предметную функцию и выбирает HTTP-ответ. Он не должен одновременно вычислять id, фильтровать список, читать настройки и формировать все ошибки вручную."}
        </Lead>

        <div className="lesson-practice-steps">
          <h3>{"HTTP-граница"}</h3>
          <p>
            {"Path, query, body, Depends, status_code и HTTPException остаются рядом с endpoint."}
          </p>

          <h3>{"Предметная операция"}</h3>
          <p>
            {"CRUD-функция получает обычные Python-значения и возвращает результат."}
          </p>

          <h3>{"Переиспользование"}</h3>
          <p>
            {"Ту же CRUD-функцию можно вызвать из теста без запуска HTTP-клиента."}
          </p>

          <h3>{"Читаемость"}</h3>
          <p>
            {"Сигнатура показывает контракт, тело — один сценарий."}
          </p>

        </div>

        <CodeBlock
          caption={"перегруженный endpoint"}
          code={
            "@router.post(\"/\")\n" +
            "def create_task(task: TaskCreate):\n" +
            "    # вычисление id\n" +
            "    # поиск дубликата\n" +
            "    # изменение storage\n" +
            "    # формирование словаря ответа\n" +
            "    # обработка всех исключений\n" +
            "    ..."
          }
        />

        <CodeBlock
          caption={"endpoint-координатор"}
          code={
            "@router.post(\n" +
            "    \"/\",\n" +
            "    response_model=TaskRead,\n" +
            "    status_code=201,\n" +
            ")\n" +
            "def create_task(task: TaskCreate):\n" +
            "    return task_crud.create_task(\n" +
            "        storage=tasks,\n" +
            "        data=task,\n" +
            "    )"
          }
        />

        <CompareSolutions
          question={"Какое тело endpoint легче объяснить?"}
          left={{
            title: "Вся логика внутри",
            code: "def create_task(...):\n    # 45 строк разных обязанностей",
            note: "HTTP и предметные правила смешаны.",
          }}
          right={{
            title: "Координация",
            code: "def create_task(task):\n    return task_crud.create_task(tasks, task)",
            note: "Endpoint связывает готовые части.",
          }}
          preferred={"right"}
          explanation={"Предметная операция получает проверенные данные, а endpoint сохраняет HTTP-контракт."}
        />

        <Callout tone="info">
          {"Короткий endpoint не является целью сам по себе. Вынесенная функция должна иметь ясную ответственность, а не скрывать весь проект под именем process()."}
        </Callout>
      </Section>

      <Section number="07" title={"Формирование response и путь ошибки"}>
        <Lead>
          {"После return FastAPI применяет response_model, сериализует данные и добавляет status и headers. Если код создаёт HTTPException, формируется error response; непредвиденная ошибка обычно приводит к 500 и traceback в серверном логе."}
        </Lead>

        <div className="lesson-practice-steps">
          <h3>{"Response model"}</h3>
          <p>
            {"Проверяет и фильтрует публичную форму ответа."}
          </p>

          <h3>{"Serialization"}</h3>
          <p>
            {"Python-объекты превращаются в JSON-совместимое содержимое."}
          </p>

          <h3>{"Expected error"}</h3>
          <p>
            {"HTTPException описывает известный HTTP-результат."}
          </p>

          <h3>{"Unexpected error"}</h3>
          <p>
            {"Traceback нужен разработчику; внутренние детали не должны становиться публичным body."}
          </p>

        </div>

        <CodeBlock
          caption={"успех"}
          code={
            "return TaskRead(\n" +
            "    id=3,\n" +
            "    title=\"FastAPI pipeline\",\n" +
            "    priority=4,\n" +
            "    is_done=False,\n" +
            ")\n" +
            "\n" +
            "→ 200/201 + JSON"
          }
        />

        <CodeBlock
          caption={"известная ошибка"}
          code={
            "if task is None:\n" +
            "    raise HTTPException(\n" +
            "        status_code=404,\n" +
            "        detail=\"Task not found\",\n" +
            "    )"
          }
        />

        <BugHunt
          code={
            "@router.get(\"/{task_id}\")\n" +
            "def get_task(task_id: int):\n" +
            "    try:\n" +
            "        return task_crud.get_task(tasks, task_id)\n" +
            "    except Exception:\n" +
            "        return {\"error\": \"something happened\"}"
          }
          question={"Что ломает HTTP-контракт?"}
          options={[
            "Все ошибки превращаются в успешный 200",
            "FastAPI запрещает try",
            "Return dict нельзя использовать",
          ]}
          correctIndex={0}
          explanation={"Неизвестные ошибки скрываются, а клиент получает неправильную категорию результата."}
          fix={"@router.get(\"/{task_id}\")\ndef get_task(task_id: int):\n    task = task_crud.get_task(tasks, task_id)\n\n    if task is None:\n        raise HTTPException(404, \"Task not found\")\n\n    return task"}
        />

        <Callout tone="info">
          {"Не оборачивайте весь endpoint в except Exception с ответом 200. Это скрывает status, traceback и причину дефекта."}
        </Callout>
      </Section>

      <Section number="08" title={"Практика: трассировка POST /tasks"}>
        <Lead>
          {"Закрепите блок не новым endpoint, а точным объяснением одного существующего request. Подпишите данные и ответственность на каждом переходе."}
        </Lead>

        <div className="lesson-practice-steps">
          <h3>{"Request"}</h3>
          <p>
            {"POST /tasks, Content-Type и JSON body."}
          </p>

          <h3>{"Validation"}</h3>
          <p>
            {"TaskCreate проверяет title и priority."}
          </p>

          <h3>{"Dependencies"}</h3>
          <p>
            {"Получаются настройки или режим приложения."}
          </p>

          <h3>{"Endpoint"}</h3>
          <p>
            {"Вызывает create_task и не знает детали будущей базы."}
          </p>

          <h3>{"Response"}</h3>
          <p>
            {"TaskRead и status 201 возвращаются клиенту."}
          </p>

        </div>

        <CodeBlock
          caption={"карта для заполнения"}
          code={
            "POST /tasks\n" +
            "→ route: __________________\n" +
            "→ body schema: ____________\n" +
            "→ dependency: _____________\n" +
            "→ handler: _________________\n" +
            "→ CRUD function: __________\n" +
            "→ storage: _________________\n" +
            "→ response model: _________\n" +
            "→ status: _________________"
          }
        />

        <Callout tone="info">
          {"Если ученик может определить, на каком этапе появились 404, 422 и 500, главная модель занятия усвоена."}
        </Callout>

        <div className="lesson-check-group">
          <QuizCard
            question={"Что происходит раньше endpoint?"}
            options={[
              "validation и dependencies",
              "response serialization",
              "return клиента",
            ]}
            correctIndex={0}
            explanation={"Handler получает уже подготовленные значения."}
          />
          <QuizCard
            question={"Кто принимает сетевой request?"}
            options={[
              "Uvicorn",
              "Pydantic model",
              "CRUD function",
            ]}
            correctIndex={0}
            explanation={"Uvicorn обслуживает сетевой процесс."}
          />
          <QuizCard
            question={"Зачем endpoint оставлять координатором?"}
            options={[
              "разделить HTTP и предметные правила",
              "запретить функции",
              "уменьшить JSON",
            ]}
            correctIndex={0}
            explanation={"Границы становятся видимыми и тестируемыми."}
          />
          <QuizCard
            question={"Что обычно означает 422?"}
            options={[
              "вход не прошёл schema validation",
              "объект не найден",
              "сервер выключен",
            ]}
            correctIndex={0}
            explanation={"Validation завершилась до handler."}
          />
        </div>

        <KeyTakeaways
          points={[
            <>{"Request проходит последовательность границ."}</>,
            <>{"Uvicorn и FastAPI выполняют разные роли."}</>,
            <>{"Route выбирается по method и path."}</>,
            <>{"Parsing и Pydantic validation происходят до endpoint."}</>,
            <>{"Dependencies решаются до handler."}</>,
            <>{"Endpoint связывает HTTP и предметную операцию."}</>,
            <>{"Response model и serialization работают после return."}</>,
            <>{"Status помогает определить этап и причину результата."}</>,
          ]}
        />

        <PracticeCta
          text={"Проследите POST /tasks в текущем Planner API, подпишите восемь этапов и сократите один перегруженный endpoint до функции-координатора."}
        />
      </Section>

    </RichLesson>
  );
}

// 70. Первая зависимость через Depends
export function Lesson70({ module }: { module?: string }) {
  return (
    <RichLesson>
      <RichHero
        variant="project"
        chip={module ?? BLOCK_TITLE}
        title={"Первая зависимость через Depends"}
        intro={"Найдём повторяющийся код в endpoints, превратим его в обычную функцию-зависимость и увидим, как FastAPI вызывает callable и передаёт возвращённое значение."}
        tags={[
          { icon: <GitBranch size={14} />, label: "Depends без магии" },
          { icon: <Wrench size={14} />, label: "повторяемая подготовка" },
        ]}
      />

      <Section number="01" title={"Повторяемый код становится сигналом"}>
        <Lead>
          {"В нескольких endpoints Planner API повторяются одинаковые query-параметры, границы limit и сборка словаря pagination. Это не ошибка, но хороший кандидат для одного общего шага."}
        </Lead>

        <div className="lesson-practice-steps">
          <h3>{"Повторение видно"}</h3>
          <p>
            {"Одинаковая сигнатура и одинаковая подготовка встречаются в нескольких handlers."}
          </p>

          <h3>{"Не всё выносится"}</h3>
          <p>
            {"Однократная строка не требует dependency только ради архитектуры."}
          </p>

          <h3>{"Критерий"}</h3>
          <p>
            {"Шаг должен быть нужен FastAPI до endpoint и иметь понятный возвращаемый результат."}
          </p>

        </div>

        <CodeBlock
          caption={"до Depends"}
          code={
            "@router.get(\"/\")\n" +
            "def get_tasks(\n" +
            "    offset: int = 0,\n" +
            "    limit: int = 20,\n" +
            "):\n" +
            "    ...\n" +
            "\n" +
            "@router.get(\"/search\")\n" +
            "def search_tasks(\n" +
            "    q: str,\n" +
            "    offset: int = 0,\n" +
            "    limit: int = 20,\n" +
            "):\n" +
            "    ..."
          }
        />

        <RecallCard
          question={"Какой код первым стоит рассмотреть как dependency?"}
          answer={
            <p>
              {"Тот, который повторяется в нескольких endpoints и должен выполняться до handler, например общая pagination или получение настроек."}
            </p>
          }
        />

        <Callout tone="info">
          {"Dependency решает повторяемую подготовку входа. Она не должна становиться складом несвязанных функций."}
        </Callout>
      </Section>

      <Section number="02" title={"Dependency — это обычный callable"}>
        <Lead>
          {"Первая dependency выглядит как обычная функция. Она может получать path, query, header, cookie, body или результаты других dependencies так же, как endpoint."}
        </Lead>

        <div className="lesson-practice-steps">
          <h3>{"Callable"}</h3>
          <p>
            {"Чаще всего это функция, но FastAPI способен работать и с другими вызываемыми объектами."}
          </p>

          <h3>{"Параметры"}</h3>
          <p>
            {"FastAPI разбирает сигнатуру dependency по тем же правилам."}
          </p>

          <h3>{"Return"}</h3>
          <p>
            {"Возвращённое значение может быть передано endpoint."}
          </p>

          <h3>{"Без decorator"}</h3>
          <p>
            {"У dependency нет @router.get, потому что она не является отдельным HTTP route."}
          </p>

        </div>

        <CodeBlock
          caption={"первая функция"}
          code={
            "from typing import Annotated\n" +
            "from fastapi import Query\n" +
            "\n" +
            "\n" +
            "def get_pagination(\n" +
            "    offset: Annotated[int, Query(ge=0)] = 0,\n" +
            "    limit: Annotated[int, Query(ge=1, le=100)] = 20,\n" +
            ") -> dict[str, int]:\n" +
            "    return {\n" +
            "        \"offset\": offset,\n" +
            "        \"limit\": limit,\n" +
            "    }"
          }
        />

        <MatchPairs
          prompt={"Соедините элемент функции и смысл."}
          leftTitle={"Слева"}
          rightTitle={"Справа"}
          pairs={[
            { left: "offset, limit", right: "вход dependency" },
            { left: "Query(ge=...)", right: "validation query" },
            { left: "return dict", right: "результат для endpoint" },
            { left: "нет decorator", right: "не отдельный route" },
          ]}
          explanation={"Dependency остаётся обычной Python-функцией с особым способом использования."}
        />

        <Callout tone="info">
          {"Функцию можно вызвать напрямую в unit-тесте, но внутри HTTP request её вызовом управляет FastAPI."}
        </Callout>
      </Section>

      <Section number="03" title={"Depends сообщает FastAPI о потребности"}>
        <Lead>
          {"Endpoint не вызывает get_pagination скобками. Он передаёт сам callable в Depends, а FastAPI вызывает функцию в нужный момент."}
        </Lead>

        <div className="lesson-practice-steps">
          <h3>{"Не вызываем сейчас"}</h3>
          <p>
            {"Depends(get_pagination), а не Depends(get_pagination())."}
          </p>

          <h3>{"Аргумент endpoint"}</h3>
          <p>
            {"Имя pagination получит возвращённый dict."}
          </p>

          <h3>{"До handler"}</h3>
          <p>
            {"Validation offset и limit завершится раньше тела endpoint."}
          </p>

          <h3>{"Swagger"}</h3>
          <p>
            {"Query-параметры dependency появятся в документации route."}
          </p>

        </div>

        <CodeBlock
          caption={"endpoint"}
          code={
            "from fastapi import Depends\n" +
            "\n" +
            "@router.get(\"/\")\n" +
            "def get_tasks(\n" +
            "    pagination: dict[str, int] = Depends(get_pagination),\n" +
            "):\n" +
            "    offset = pagination[\"offset\"]\n" +
            "    limit = pagination[\"limit\"]\n" +
            "\n" +
            "    return tasks[offset : offset + limit]"
          }
        />

        <FillBlank
          prompt={"Что передают в Depends?"}
          before={"pagination = Depends("}
          after={")"}
          options={[
            "get_pagination",
            "get_pagination()",
            "pagination",
          ]}
          answer={"get_pagination"}
          explanation={"Передаётся функция, а вызов выполняет FastAPI."}
        />

        <Callout tone="info">
          {"Старая форма без Annotated показана только как первый шаг. В следующем занятии сигнатура станет чище."}
        </Callout>
      </Section>

      <Section number="04" title={"Возвращаемое значение инъектируется в endpoint"}>
        <Lead>
          {"Слово injection означает, что endpoint объявил потребность, а FastAPI подготовил и передал значение. Никакого скрытого присваивания глобальной переменной не происходит."}
        </Lead>

        <div className="lesson-practice-steps">
          <h3>{"Request"}</h3>
          <p>
            {"Клиент отправляет offset и limit."}
          </p>

          <h3>{"Dependency"}</h3>
          <p>
            {"Получает параметры, проверяет границы и возвращает dict."}
          </p>

          <h3>{"Endpoint"}</h3>
          <p>
            {"Получает готовый pagination."}
          </p>

          <h3>{"Response"}</h3>
          <p>
            {"Использует значения для среза."}
          </p>

        </div>

        <CodeBlock
          caption={"путь значений"}
          code={
            "GET /tasks?offset=20&limit=10\n" +
            "→ get_pagination(offset=20, limit=10)\n" +
            "→ {\"offset\": 20, \"limit\": 10}\n" +
            "→ get_tasks(pagination=...)\n" +
            "→ tasks[20:30]"
          }
        />

        <StepThrough
          code={
            "request query\n" +
            "→ get_pagination\n" +
            "→ return dict\n" +
            "→ endpoint argument\n" +
            "→ list slice"
          }
          steps={[
            {
              line: 0,
              note: "Из URL извлекаются query values.",
              vars: { "offset": "20", "limit": "10" },
            },
            {
              line: 1,
              note: "FastAPI вызывает dependency.",
              vars: { "call": "get_pagination" },
            },
            {
              line: 2,
              note: "Функция возвращает словарь.",
              vars: { "pagination": "dict" },
            },
            {
              line: 3,
              note: "Значение передаётся handler.",
              vars: { "argument": "pagination" },
            },
            {
              line: 4,
              note: "Endpoint формирует result.",
              vars: { "slice": "20:30" },
            },
          ]}
        />

        <Callout tone="info">
          {"Dependency не подменяет аргументы случайным образом: связь явно записана в сигнатуре endpoint."}
        </Callout>
      </Section>

      <Section number="05" title={"Dependency не равна глобальной переменной"}>
        <Lead>
          {"Глобальная константа подходит для действительно постоянного значения. Dependency полезна, когда значение нужно получить, проверить, заменить в тесте или связать с request."}
        </Lead>

        <div className="lesson-practice-steps">
          <h3>{"Global"}</h3>
          <p>
            {"Создаётся при импорте и доступна напрямую всему модулю."}
          </p>

          <h3>{"Dependency"}</h3>
          <p>
            {"Решается FastAPI для конкретного request или приложения."}
          </p>

          <h3>{"Тестирование"}</h3>
          <p>
            {"Dependency можно override без изменения endpoint."}
          </p>

          <h3>{"Явная потребность"}</h3>
          <p>
            {"Аргумент функции показывает, что handler зависит от значения."}
          </p>

        </div>

        <CodeBlock
          caption={"глобальное чтение"}
          code={
            "API_MODE = \"development\"\n" +
            "\n" +
            "@router.get(\"/info\")\n" +
            "def info():\n" +
            "    return {\"mode\": API_MODE}"
          }
        />

        <CodeBlock
          caption={"dependency"}
          code={
            "def get_api_mode() -> str:\n" +
            "    return \"development\"\n" +
            "\n" +
            "@router.get(\"/info\")\n" +
            "def info(\n" +
            "    api_mode: str = Depends(get_api_mode),\n" +
            "):\n" +
            "    return {\"mode\": api_mode}"
          }
        />

        <CompareSolutions
          question={"Что лучше для значения, которое тест должен заменить?"}
          left={{
            title: "Прямой global",
            code: "API_MODE = \"development\"",
            note: "Endpoint жёстко читает значение из модуля.",
          }}
          right={{
            title: "Dependency",
            code: "api_mode = Depends(get_api_mode)",
            note: "Тест может заменить provider.",
          }}
          preferred={"right"}
          explanation={"Dependency делает потребность endpoint явной и управляемой."}
        />

        <Callout tone="info">
          {"Не нужно превращать каждую константу в dependency. Выбор оправдан, когда FastAPI должен управлять получением значения или его заменой."}
        </Callout>
      </Section>

      <Section number="06" title={"Helper и dependency решают разные задачи"}>
        <Lead>
          {"Обычный helper вызывается вашим кодом. Dependency вызывается FastAPI как часть подготовки request. Одна функция не становится dependency только потому, что вынесена из endpoint."}
        </Lead>

        <div className="lesson-practice-steps">
          <h3>{"Helper"}</h3>
          <p>
            {"normalize_title(title) вызывается там, где предметной операции нужна нормализация."}
          </p>

          <h3>{"Dependency"}</h3>
          <p>
            {"get_pagination() получает query и нужен до нескольких endpoints."}
          </p>

          <h3>{"Граница"}</h3>
          <p>
            {"Чистое предметное правило не должно импортировать Depends."}
          </p>

          <h3>{"Проверка"}</h3>
          <p>
            {"Спросите: кто должен управлять вызовом — мой код или FastAPI?"}
          </p>

        </div>

        <CodeBlock
          caption={"helper"}
          code={
            "def normalize_title(title: str) -> str:\n" +
            "    cleaned = title.strip()\n" +
            "    if not cleaned:\n" +
            "        raise ValueError(\"empty title\")\n" +
            "    return cleaned"
          }
        />

        <CodeBlock
          caption={"dependency"}
          code={
            "def get_pagination(\n" +
            "    offset: int = 0,\n" +
            "    limit: int = 20,\n" +
            ") -> dict[str, int]:\n" +
            "    return {\"offset\": offset, \"limit\": limit}"
          }
        />

        <MatchPairs
          prompt={"Кто должен вызвать функцию?"}
          leftTitle={"Функция"}
          rightTitle={"Кто вызывает"}
          pairs={[
            { left: "normalize_title", right: "CRUD/service code" },
            { left: "calculate_next_id", right: "CRUD code" },
            { left: "get_pagination", right: "FastAPI dependency system" },
            { left: "get_settings", right: "FastAPI dependency system" },
          ]}
          explanation={"Helper обслуживает предметную операцию, dependency — подготовку окружения endpoint."}
        />

        <Callout tone="info">
          {"Смешивание Depends с предметными функциями делает их сложнее использовать вне HTTP."}
        </Callout>
      </Section>

      <Section number="07" title={"Dependency может завершить request раньше"}>
        <Lead>
          {"Dependency способна проверить условие и создать HTTPException. Это полезно для общего режима обслуживания, обязательного ключа или будущей авторизации."}
        </Lead>

        <div className="lesson-practice-steps">
          <h3>{"Проверка"}</h3>
          <p>
            {"Условие выполняется до handler."}
          </p>

          <h3>{"HTTPException"}</h3>
          <p>
            {"Формирует ожидаемый error response."}
          </p>

          <h3>{"Нет вызова endpoint"}</h3>
          <p>
            {"Предметная операция не запускается при запрещённом режиме."}
          </p>

          <h3>{"Не злоупотреблять"}</h3>
          <p>
            {"Условие должно быть общим для зависимых endpoints."}
          </p>

        </div>

        <CodeBlock
          caption={"проверка режима"}
          code={
            "from fastapi import HTTPException\n" +
            "\n" +
            "def require_write_mode(\n" +
            "    api_mode: str = Depends(get_api_mode),\n" +
            ") -> str:\n" +
            "    if api_mode == \"read-only\":\n" +
            "        raise HTTPException(\n" +
            "            status_code=503,\n" +
            "            detail=\"Write operations are disabled\",\n" +
            "        )\n" +
            "\n" +
            "    return api_mode\n" +
            "\n" +
            "@router.post(\"/\")\n" +
            "def create_task(\n" +
            "    task: TaskCreate,\n" +
            "    api_mode: str = Depends(require_write_mode),\n" +
            "):\n" +
            "    ..."
          }
        />

        <BranchExplorer
          code={
            "получить api_mode\n" +
            "if api_mode == \"read-only\":\n" +
            "    raise HTTPException(503)\n" +
            "else:\n" +
            "    return api_mode\n" +
            "вызвать create_task"
          }
          scenarios={[
            { label: "development", activeLine: 3, output: "dependency returns mode" },
            { label: "read-only", activeLine: 2, output: "503 before endpoint" },
          ]}
        />

        <Callout tone="info">
          {"Dependency не должна скрывать обычную проверку только ради короткого endpoint. Её смысл — переиспользуемое условие нескольких routes."}
        </Callout>
      </Section>

      <Section number="08" title={"Практика: pagination и app mode"}>
        <Lead>
          {"В Planner API достаточно двух простых dependencies: одна собирает query pagination, другая предоставляет режим приложения. Это готовит следующий урок без глубокой вложенности."}
        </Lead>

        <div className="lesson-practice-steps">
          <h3>{"Шаг 1"}</h3>
          <p>
            {"Создайте get_pagination и подключите к GET /tasks."}
          </p>

          <h3>{"Шаг 2"}</h3>
          <p>
            {"Создайте get_api_mode и подключите к GET /info."}
          </p>

          <h3>{"Шаг 3"}</h3>
          <p>
            {"Проверьте 422 для limit=0."}
          </p>

          <h3>{"Шаг 4"}</h3>
          <p>
            {"Добавьте require_write_mode к POST /tasks."}
          </p>

          <h3>{"Шаг 5"}</h3>
          <p>
            {"Убедитесь, что read-only даёт 503 до изменения storage."}
          </p>

        </div>

        <CodeBlock
          caption={"контрольная карта"}
          code={
            "GET /tasks\n" +
            "→ Depends(get_pagination)\n" +
            "→ endpoint receives dict\n" +
            "\n" +
            "POST /tasks\n" +
            "→ Depends(require_write_mode)\n" +
            "→ 201 or 503"
          }
        />

        <Callout tone="info">
          {"На защите ученик должен объяснить, кто вызывает dependency и откуда появляется значение аргумента endpoint."}
        </Callout>

        <div className="lesson-check-group">
          <QuizCard
            question={"Что передают в Depends?"}
            options={[
              "callable без вызова",
              "результат вызова обязательно",
              "URL",
            ]}
            correctIndex={0}
            explanation={"FastAPI сам вызывает dependency."}
          />
          <QuizCard
            question={"Что получает аргумент endpoint?"}
            options={[
              "return dependency",
              "имя функции строкой",
              "глобальный request автоматически",
            ]}
            correctIndex={0}
            explanation={"Результат инъектируется в handler."}
          />
          <QuizCard
            question={"Чем helper отличается от dependency?"}
            options={[
              "helper вызывает ваш код, dependency решает FastAPI",
              "ничем",
              "helper всегда async",
            ]}
            correctIndex={0}
            explanation={"Разница в управлении вызовом и роли."}
          />
          <QuizCard
            question={"Когда dependency может вернуть 503?"}
            options={[
              "до endpoint при общем запрещающем условии",
              "после отправки response",
              "только в middleware",
            ]}
            correctIndex={0}
            explanation={"HTTPException останавливает путь до handler."}
          />
        </div>

        <KeyTakeaways
          points={[
            <>{"Depends принимает callable, а не результат вызова."}</>,
            <>{"Dependency похожа на обычную функцию без route decorator."}</>,
            <>{"FastAPI решает её параметры по тем же правилам."}</>,
            <>{"Return dependency становится аргументом endpoint."}</>,
            <>{"Dependency отличается от глобальной переменной управляемостью."}</>,
            <>{"Helper и dependency имеют разные владельцы вызова."}</>,
            <>{"Dependency может создать ожидаемый error response."}</>,
            <>{"Начинать стоит с коротких и понятных providers."}</>,
          ]}
        />

        <PracticeCta
          text={"Вынесите pagination и режим API в две dependencies, проверьте их через Swagger и добавьте сценарий read-only для POST /tasks."}
        />
      </Section>

    </RichLesson>
  );
}

// 71. Annotated и цепочки зависимостей
export function Lesson71({ module }: { module?: string }) {
  return (
    <RichLesson>
      <RichHero
        variant="project"
        chip={module ?? BLOCK_TITLE}
        title={"Annotated и цепочки зависимостей"}
        intro={"Сделаем сигнатуры читаемее через Annotated, создадим повторно используемые aliases и соберём короткую цепочку get_settings → require_api_mode → endpoint."}
        tags={[
          { icon: <Braces size={14} />, label: "Annotated aliases" },
          { icon: <GitBranch size={14} />, label: "sub-dependencies" },
        ]}
      />

      <Section number="01" title={"Почему старая сигнатура становится шумной"}>
        <Lead>
          {"Форма parameter: Type = Depends(provider) работает, но смешивает Python-тип и механизм FastAPI в default. При нескольких dependencies сигнатура становится труднее читать."}
        </Lead>

        <div className="lesson-practice-steps">
          <h3>{"Python type"}</h3>
          <p>
            {"Разработчику важно видеть, какое значение получит функция."}
          </p>

          <h3>{"FastAPI metadata"}</h3>
          <p>
            {"Depends сообщает, как получить это значение."}
          </p>

          <h3>{"Проблема повторения"}</h3>
          <p>
            {"Одинаковая длинная запись встречается в нескольких endpoints."}
          </p>

          <h3>{"Решение"}</h3>
          <p>
            {"Annotated связывает основной тип и дополнительную метаинформацию."}
          </p>

        </div>

        <CodeBlock
          caption={"до Annotated"}
          code={
            "@router.get(\"/\")\n" +
            "def get_tasks(\n" +
            "    settings: Settings = Depends(get_settings),\n" +
            "    pagination: Pagination = Depends(get_pagination),\n" +
            "):\n" +
            "    ..."
          }
        />

        <CodeBlock
          caption={"после"}
          code={
            "@router.get(\"/\")\n" +
            "def get_tasks(\n" +
            "    settings: SettingsDep,\n" +
            "    pagination: PaginationDep,\n" +
            "):\n" +
            "    ..."
          }
        />

        <CompareSolutions
          question={"Какая сигнатура лучше показывает итоговые типы?"}
          left={{
            title: "Defaults",
            code: "settings: Settings = Depends(get_settings)",
            note: "Работает, но FastAPI-механизм занимает default.",
          }}
          right={{
            title: "Aliases",
            code: "settings: SettingsDep",
            note: "Короткое имя можно раскрыть в одном месте.",
          }}
          preferred={"right"}
          explanation={"Alias полезен, когда dependency действительно переиспользуется."}
        />

        <Callout tone="info">
          {"Annotated не запускает dependency сам по себе. Он хранит тип и метаданные, которые читает FastAPI."}
        </Callout>
      </Section>

      <Section number="02" title={"Как читать Annotated слева направо"}>
        <Lead>
          {"Запись Annotated[Settings, Depends(get_settings)] читается как: значение имеет тип Settings, а FastAPI должен получить его через get_settings."}
        </Lead>

        <div className="lesson-practice-steps">
          <h3>{"Первый элемент"}</h3>
          <p>
            {"Основной Python-тип значения."}
          </p>

          <h3>{"Второй элемент"}</h3>
          <p>
            {"Метаданные для FastAPI."}
          </p>

          <h3>{"Имя аргумента"}</h3>
          <p>
            {"Обычная локальная переменная endpoint."}
          </p>

          <h3>{"Результат"}</h3>
          <p>
            {"IDE и человек видят тип, FastAPI — provider."}
          </p>

        </div>

        <CodeBlock
          caption={"минимальная запись"}
          code={
            "from typing import Annotated\n" +
            "from fastapi import Depends\n" +
            "\n" +
            "SettingsDep = Annotated[\n" +
            "    Settings,\n" +
            "    Depends(get_settings),\n" +
            "]"
          }
        />

        <CodeBlock
          caption={"использование"}
          code={
            "@router.get(\"/info\")\n" +
            "def get_info(settings: SettingsDep):\n" +
            "    return {\n" +
            "        \"app_name\": settings.app_name,\n" +
            "        \"api_mode\": settings.api_mode,\n" +
            "    }"
          }
        />

        <FillBlank
          prompt={"Что является основным типом?"}
          before={"Annotated["}
          after={", Depends(get_settings)]"}
          options={[
            "Settings",
            "Depends",
            "get_settings()",
          ]}
          answer={"Settings"}
          explanation={"Первый аргумент Annotated описывает итоговое значение."}
        />

        <Callout tone="info">
          {"Имя alias должно сообщать смысл результата: SettingsDep, PaginationDep, ActiveModeDep. Сокращение SD экономит символы, но ухудшает обучение."}
        </Callout>
      </Section>

      <Section number="03" title={"Alias объявляется один раз и переиспользуется"}>
        <Lead>
          {"Повторяемую dependency удобно назвать рядом с provider. Тогда изменение способа получения не требует переписывать сигнатуры всех endpoints."}
        </Lead>

        <div className="lesson-practice-steps">
          <h3>{"Один источник"}</h3>
          <p>
            {"Provider и alias находятся в одном модуле dependencies.py."}
          </p>

          <h3>{"Переиспользование"}</h3>
          <p>
            {"Endpoints импортируют SettingsDep."}
          </p>

          <h3>{"Явность"}</h3>
          <p>
            {"Alias всё ещё показывает, что значение является dependency."}
          </p>

          <h3>{"Не для единичной строки"}</h3>
          <p>
            {"Если dependency используется один раз, отдельный alias может не окупиться."}
          </p>

        </div>

        <CodeBlock
          caption={"dependencies.py"}
          code={
            "from typing import Annotated\n" +
            "from fastapi import Depends\n" +
            "\n" +
            "\n" +
            "def get_pagination(...) -> Pagination:\n" +
            "    ...\n" +
            "\n" +
            "PaginationDep = Annotated[\n" +
            "    Pagination,\n" +
            "    Depends(get_pagination),\n" +
            "]"
          }
        />

        <CodeBlock
          caption={"router"}
          code={
            "from app.dependencies import PaginationDep\n" +
            "\n" +
            "@router.get(\"/\")\n" +
            "def get_tasks(pagination: PaginationDep):\n" +
            "    ..."
          }
        />

        <RecallCard
          question={"Когда dependency alias оправдан?"}
          answer={
            <p>
              {"Когда одна и та же комбинация итогового типа и Depends используется в нескольких endpoints или sub-dependencies."}
            </p>
          }
        />

        <Callout tone="info">
          {"Не создавайте один файл aliases.py без ответственности. Dependency alias логично хранить рядом с соответствующей функцией."}
        </Callout>
      </Section>

      <Section number="04" title={"Dependency может зависеть от другой dependency"}>
        <Lead>
          {"FastAPI строит дерево: require_api_mode требует Settings, а endpoint требует результат require_api_mode. Сначала решается нижняя потребность."}
        </Lead>

        <div className="lesson-practice-steps">
          <h3>{"Sub-dependency"}</h3>
          <p>
            {"Одна dependency объявляет аргумент, который тоже получается через Depends."}
          </p>

          <h3>{"Порядок"}</h3>
          <p>
            {"get_settings выполняется раньше require_api_mode."}
          </p>

          <h3>{"Результат"}</h3>
          <p>
            {"Проверенные settings передаются дальше."}
          </p>

          <h3>{"Ранний error"}</h3>
          <p>
            {"Если режим запрещён, endpoint не запускается."}
          </p>

        </div>

        <CodeBlock
          caption={"цепочка"}
          code={
            "SettingsDep = Annotated[\n" +
            "    Settings,\n" +
            "    Depends(get_settings),\n" +
            "]\n" +
            "\n" +
            "\n" +
            "def require_api_mode(\n" +
            "    settings: SettingsDep,\n" +
            ") -> Settings:\n" +
            "    if settings.api_mode == \"maintenance\":\n" +
            "        raise HTTPException(\n" +
            "            status_code=503,\n" +
            "            detail=\"API is under maintenance\",\n" +
            "        )\n" +
            "\n" +
            "    return settings\n" +
            "\n" +
            "ActiveSettingsDep = Annotated[\n" +
            "    Settings,\n" +
            "    Depends(require_api_mode),\n" +
            "]"
          }
        />

        <CodeBlock
          caption={"endpoint"}
          code={
            "@router.get(\"/\")\n" +
            "def get_tasks(settings: ActiveSettingsDep):\n" +
            "    return tasks"
          }
        />

        <CodeSequence
          title={"Решите dependency graph"}
          prompt={"Расположите фактические вызовы."}
          pieces={[
            { id: "settings", code: "get_settings()" },
            { id: "mode", code: "require_api_mode(settings)" },
            { id: "endpoint", code: "get_tasks(settings)" },
          ]}
          correctOrder={[
            "settings",
            "mode",
            "endpoint",
          ]}
          explanation={"Сначала создаётся Settings, затем проверяется режим, после этого вызывается endpoint."}
        />

        <Callout tone="info">
          {"Цепочка выражает зависимость значений, а не порядок строк в файле. FastAPI строит граф по сигнатурам."}
        </Callout>
      </Section>

      <Section number="05" title={"Одна общая sub-dependency вызывается один раз на request"}>
        <Lead>
          {"Если несколько dependencies внутри одного request используют get_settings, FastAPI по умолчанию переиспользует полученный результат в рамках этого request."}
        </Lead>

        <div className="lesson-practice-steps">
          <h3>{"Request cache"}</h3>
          <p>
            {"Значение сохраняется только для решения текущего dependency graph."}
          </p>

          <h3>{"Не глобальный cache"}</h3>
          <p>
            {"Следующий request может решить dependency заново."}
          </p>

          <h3>{"use_cache=False"}</h3>
          <p>
            {"Существует для особых случаев, но пока не нужен."}
          </p>

          <h3>{"Настройки"}</h3>
          <p>
            {"Для settings позже дополнительно используется lru_cache на уровне Python."}
          </p>

        </div>

        <CodeBlock
          caption={"общая dependency"}
          code={
            "def require_api_mode(settings: SettingsDep) -> Settings:\n" +
            "    ...\n" +
            "\n" +
            "def build_response_meta(settings: SettingsDep) -> dict:\n" +
            "    ...\n" +
            "\n" +
            "@router.get(\"/\")\n" +
            "def get_tasks(\n" +
            "    active: Annotated[Settings, Depends(require_api_mode)],\n" +
            "    meta: Annotated[dict, Depends(build_response_meta)],\n" +
            "):\n" +
            "    ..."
          }
        />

        <CodeBlock
          caption={"схема"}
          code={
            "        get_settings\n" +
            "        /          require_api_mode  build_response_meta\n" +
            "        \\          /\n" +
            "           endpoint"
          }
        />

        <TrueFalse
          statement={
            <>
              {"Если get_settings нужна двум sub-dependencies одного endpoint, FastAPI обычно решит её один раз для этого request."}
            </>
          }
          isTrue={true}
          explanation={"По умолчанию результат dependency переиспользуется внутри текущего request graph."}
        />

        <Callout tone="info">
          {"Не используйте cache как причину строить сложное дерево. Сначала дерево должно быть понятным по ответственности."}
        </Callout>
      </Section>

      <Section number="06" title={"Dependency может преобразовать или проверить результат"}>
        <Lead>
          {"Цепочка полезна, когда каждый уровень добавляет одну понятную гарантию: получить settings, проверить mode, затем передать разрешённую конфигурацию."}
        </Lead>

        <div className="lesson-practice-steps">
          <h3>{"Provider"}</h3>
          <p>
            {"Создаёт или получает значение."}
          </p>

          <h3>{"Validator dependency"}</h3>
          <p>
            {"Проверяет условие и возвращает то же либо новое значение."}
          </p>

          <h3>{"Endpoint"}</h3>
          <p>
            {"Использует уже гарантированный результат."}
          </p>

          <h3>{"Ошибка"}</h3>
          <p>
            {"HTTPException остаётся на HTTP-границе."}
          </p>

        </div>

        <CodeBlock
          caption={"три уровня"}
          code={
            "def get_settings() -> Settings:\n" +
            "    return Settings()\n" +
            "\n" +
            "\n" +
            "def require_api_mode(\n" +
            "    settings: SettingsDep,\n" +
            ") -> Settings:\n" +
            "    if settings.api_mode not in {\"development\", \"test\"}:\n" +
            "        raise HTTPException(503, \"API is unavailable\")\n" +
            "    return settings\n" +
            "\n" +
            "\n" +
            "@router.post(\"/\")\n" +
            "def create_task(\n" +
            "    task: TaskCreate,\n" +
            "    settings: ActiveSettingsDep,\n" +
            "):\n" +
            "    ..."
          }
        />

        <BugHunt
          code={
            "def get_settings() -> Settings:\n" +
            "    settings = Settings()\n" +
            "    tasks.append({\"title\": \"hidden side effect\"})\n" +
            "    return settings"
          }
          question={"Что делает dependency опасной?"}
          options={[
            "Она неожиданно меняет предметное состояние",
            "Settings нельзя возвращать",
            "Depends запрещает списки",
          ]}
          correctIndex={0}
          explanation={"Получение конфигурации должно быть предсказуемым и не выполнять скрытый CRUD."}
          fix={"def get_settings() -> Settings:\n    return Settings()"}
        />

        <Callout tone="info">
          {"Если dependency начинает изменять tasks или выполнять основной CRUD, граница смещена: предметная операция должна остаться в crud/service."}
        </Callout>
      </Section>

      <Section number="07" title={"Граница чрезмерной вложенности"}>
        <Lead>
          {"FastAPI допускает глубокие dependency trees, но возможность не равна необходимости. Новичку и команде легче поддерживать короткую цепочку с говорящими именами."}
        </Lead>

        <div className="lesson-practice-steps">
          <h3>{"Хорошая глубина"}</h3>
          <p>
            {"Один provider и одна проверка перед endpoint."}
          </p>

          <h3>{"Сигнал перегруза"}</h3>
          <p>
            {"Чтобы понять значение, нужно открыть пять functions в четырёх файлах."}
          </p>

          <h3>{"Скрытая логика"}</h3>
          <p>
            {"Dependency tree не должна заменять service layer."}
          </p>

          <h3>{"Диагностика"}</h3>
          <p>
            {"Каждый уровень отвечает на один вопрос и имеет отдельный тест."}
          </p>

        </div>

        <CodeBlock
          caption={"понятная цепочка"}
          code={
            "get_settings\n" +
            "→ require_api_mode\n" +
            "→ endpoint"
          }
        />

        <CodeBlock
          caption={"перегруженная"}
          code={
            "get_environment\n" +
            "→ get_flags\n" +
            "→ get_policy\n" +
            "→ get_context\n" +
            "→ get_actor\n" +
            "→ get_workspace\n" +
            "→ endpoint"
          }
        />

        <CompareSolutions
          question={"Какой graph подходит текущему проекту?"}
          left={{
            title: "Глубокий",
            code: "6 providers до любого endpoint",
            note: "Скрывает простой режим приложения.",
          }}
          right={{
            title: "Короткий",
            code: "get_settings → require_api_mode → endpoint",
            note: "Каждый шаг легко объяснить и проверить.",
          }}
          preferred={"right"}
          explanation={"Сложность dependency graph должна расти вместе с реальной потребностью."}
        />

        <Callout tone="info">
          {"До появления реальной аутентификации и DB-session блоку достаточно 1–2 уровней sub-dependencies."}
        </Callout>
      </Section>

      <Section number="08" title={"Практика: get_settings → require_api_mode → endpoint"}>
        <Lead>
          {"Соберите цепочку и добавьте её только к write-endpoints. GET /health может работать даже в maintenance, а POST/PATCH/DELETE должны вернуть 503."}
        </Lead>

        <div className="lesson-practice-steps">
          <h3>{"Шаг 1"}</h3>
          <p>
            {"Создайте Settings с api_mode."}
          </p>

          <h3>{"Шаг 2"}</h3>
          <p>
            {"Объявите SettingsDep."}
          </p>

          <h3>{"Шаг 3"}</h3>
          <p>
            {"Создайте require_api_mode и ActiveSettingsDep."}
          </p>

          <h3>{"Шаг 4"}</h3>
          <p>
            {"Подключите alias к POST, PATCH и DELETE."}
          </p>

          <h3>{"Шаг 5"}</h3>
          <p>
            {"Проверьте development и maintenance."}
          </p>

        </div>

        <CodeBlock
          caption={"матрица"}
          code={
            "api_mode=development\n" +
            "GET /tasks    → 200\n" +
            "POST /tasks   → 201\n" +
            "\n" +
            "api_mode=maintenance\n" +
            "GET /health   → 200\n" +
            "GET /tasks    → 200\n" +
            "POST /tasks   → 503"
          }
        />

        <Callout tone="info">
          {"Итог занятия — не максимальное число aliases, а читаемая сигнатура и объяснимый порядок выполнения."}
        </Callout>

        <div className="lesson-check-group">
          <QuizCard
            question={"Что хранит Annotated?"}
            options={[
              "основной тип и metadata",
              "только return",
              "HTTP body",
            ]}
            correctIndex={0}
            explanation={"FastAPI читает Depends из metadata."}
          />
          <QuizCard
            question={"Что выполняется первым в цепочке?"}
            options={[
              "нижняя sub-dependency",
              "endpoint",
              "response model",
            ]}
            correctIndex={0}
            explanation={"Значение должно быть подготовлено до зависимого callable."}
          />
          <QuizCard
            question={"Сколько раз общая dependency обычно вызывается в одном request?"}
            options={[
              "один раз с cache",
              "обязательно для каждой ветки",
              "никогда",
            ]}
            correctIndex={0}
            explanation={"FastAPI переиспользует результат в request graph."}
          />
          <QuizCard
            question={"Когда graph слишком глубокий?"}
            options={[
              "когда скрывает простую логику и трудно проследить значение",
              "после двух функций всегда",
              "только при async",
            ]}
            correctIndex={0}
            explanation={"Глубина должна оправдываться ответственностями."}
          />
        </div>

        <KeyTakeaways
          points={[
            <>{"Annotated отделяет итоговый type от FastAPI metadata."}</>,
            <>{"Dependency alias сокращает повторяемые сигнатуры."}</>,
            <>{"Sub-dependency получает результат другой dependency."}</>,
            <>{"FastAPI строит граф по сигнатурам."}</>,
            <>{"Нижние providers выполняются раньше endpoint."}</>,
            <>{"Общая dependency обычно кэшируется внутри request."}</>,
            <>{"Каждый уровень должен добавлять одну понятную гарантию."}</>,
            <>{"Короткий граф лучше преждевременно глубокой вложенности."}</>,
          ]}
        />

        <PracticeCta
          text={"Создайте SettingsDep и ActiveSettingsDep, подключите maintenance-check к write-endpoints и нарисуйте фактический порядок вызовов."}
        />
      </Section>

    </RichLesson>
  );
}

// 72. Настройки и переменные окружения
export function Lesson72({ module }: { module?: string }) {
  return (
    <RichLesson>
      <RichHero
        variant="project"
        chip={module ?? BLOCK_TITLE}
        title={"Настройки и переменные окружения"}
        intro={"Вынесем изменяемые значения из кода: начнём с environment variables, создадим Settings через pydantic-settings, подключим .env и .env.example и получим настройки через dependency."}
        tags={[
          { icon: <Wrench size={14} />, label: "pydantic-settings" },
          { icon: <FileText size={14} />, label: "dev · test · secrets" },
        ]}
      />

      <Section number="01" title={"Настройка — значение, которое меняется между окружениями"}>
        <Lead>
          {"Название приложения, режим API и будущий DATABASE_URL могут отличаться на компьютере разработчика, в тестах и при запуске сервиса. Если они зашиты в код, каждое изменение требует редактирования файла."}
        </Lead>

        <div className="lesson-practice-steps">
          <h3>{"Code"}</h3>
          <p>
            {"Описывает стабильное поведение приложения."}
          </p>

          <h3>{"Configuration"}</h3>
          <p>
            {"Выбирает значение для конкретного окружения."}
          </p>

          <h3>{"Secret"}</h3>
          <p>
            {"Конфигурация, которую нельзя публиковать: ключ, пароль, token."}
          </p>

          <h3>{"Пример"}</h3>
          <p>
            {"SQLite URL в development и отдельный URL тестовой базы."}
          </p>

        </div>

        <CodeBlock
          caption={"жёстко в коде"}
          code={
            "APP_NAME = \"StudyHub Database API\"\n" +
            "API_MODE = \"development\"\n" +
            "DATABASE_URL = \"sqlite:///./studyhub.db\""
          }
        />

        <CodeBlock
          caption={"ожидаемая идея"}
          code={
            "код приложения\n" +
            "+ значения окружения\n" +
            "→ готовая конфигурация запуска"
          }
        />

        <MatchPairs
          prompt={"Разделите примеры по смыслу."}
          leftTitle={"Значение"}
          rightTitle={"Категория"}
          pairs={[
            { left: "DATABASE_URL", right: "environment setting" },
            { left: "SECRET_KEY", right: "secret setting" },
            { left: "MAX_PRIORITY = 5", right: "business constant" },
            { left: "APP_NAME", right: "display/config setting" },
          ]}
          explanation={"Настройки выбирают окружение, предметные константы определяют правило."}
        />

        <Callout tone="info">
          {"Не каждое число является setting. Константа предметного правила, например MAX_PRIORITY=5, не обязана меняться между окружениями."}
        </Callout>
      </Section>

      <Section number="02" title={"Environment variable приходит в Python как текст"}>
        <Lead>
          {"Операционная система хранит пары имя–значение. Python может получить их через os.getenv, но преобразование типов и обязательность придётся контролировать вручную."}
        </Lead>

        <div className="lesson-practice-steps">
          <h3>{"Имя"}</h3>
          <p>
            {"Обычно используется uppercase: APP_NAME, API_MODE, DATABASE_URL."}
          </p>

          <h3>{"Строка"}</h3>
          <p>
            {"Внешнее значение поступает как str."}
          </p>

          <h3>{"Default"}</h3>
          <p>
            {"os.getenv может вернуть запасное значение."}
          </p>

          <h3>{"Ограничение"}</h3>
          <p>
            {"Ручные conversions быстро повторяются."}
          </p>

        </div>

        <CodeBlock
          caption={"первый шаг"}
          code={
            "import os\n" +
            "\n" +
            "app_name = os.getenv(\n" +
            "    \"APP_NAME\",\n" +
            "    \"StudyHub Database API\",\n" +
            ")\n" +
            "\n" +
            "api_mode = os.getenv(\n" +
            "    \"API_MODE\",\n" +
            "    \"development\",\n" +
            ")"
          }
        />

        <CodeBlock
          caption={"PowerShell"}
          code={
            "$env:APP_NAME = \"StudyHub Local API\"\n" +
            "$env:API_MODE = \"test\"\n" +
            "python -m uvicorn app.main:app --reload"
          }
        />

        <TerminalDemo
          title={"проверка environment"}
          lines={[
            { cmd: "python -c \"import os; print(os.getenv('API_MODE'))\"" },
            { out: "development" },
          ]}
        />

        <Callout tone="info">
          {"os.getenv полезен для понимания механизма, но объект Settings даст типы, defaults и единое место конфигурации."}
        </Callout>
      </Section>

      <Section number="03" title={"Pydantic Settings собирает и проверяет конфигурацию"}>
        <Lead>
          {"Пакет pydantic-settings использует знакомую модель полей. При создании Settings он читает environment variables, преобразует типы и применяет defaults."}
        </Lead>

        <div className="lesson-practice-steps">
          <h3>{"Отдельный пакет"}</h3>
          <p>
            {"BaseSettings импортируется из pydantic_settings."}
          </p>

          <h3>{"Type hints"}</h3>
          <p>
            {"Поля получают ожидаемые Python-типы."}
          </p>

          <h3>{"Defaults"}</h3>
          <p>
            {"Локальный запуск возможен без полного набора variables."}
          </p>

          <h3>{"Required secret"}</h3>
          <p>
            {"Поле без default потребует внешнее значение."}
          </p>

        </div>

        <CodeBlock
          caption={"установка"}
          code={
            "python -m pip install pydantic-settings"
          }
        />

        <CodeBlock
          caption={"config.py"}
          code={
            "from pydantic_settings import BaseSettings\n" +
            "\n" +
            "\n" +
            "class Settings(BaseSettings):\n" +
            "    app_name: str = \"StudyHub Database API\"\n" +
            "    api_mode: str = \"development\"\n" +
            "    database_url: str = \"sqlite:///./studyhub.db\"\n" +
            "    debug: bool = False"
          }
        />

        <CodeBlock
          caption={"создание"}
          code={
            "settings = Settings()\n" +
            "\n" +
            "print(settings.app_name)\n" +
            "print(type(settings.debug))"
          }
        />

        <FillBlank
          prompt={"Выберите актуальный импорт."}
          before={"from "}
          after={" import BaseSettings"}
          options={[
            "pydantic_settings",
            "pydantic",
            "fastapi",
          ]}
          answer={"pydantic_settings"}
          explanation={"Settings вынесены в отдельный пакет."}
        />

        <Callout tone="info">
          {"В новом коде BaseSettings не импортируется из pydantic. Для Pydantic v2 используется пакет pydantic-settings."}
        </Callout>
      </Section>

      <Section number="04" title={".env удобен для локального запуска"}>
        <Lead>
          {"Файл .env хранит пары KEY=VALUE рядом с проектом. SettingsConfigDict сообщает модели, какой dotenv-файл прочитать и в какой кодировке."}
        </Lead>

        <div className="lesson-practice-steps">
          <h3>{"Локальная конфигурация"}</h3>
          <p>
            {"Не нужно каждый раз вводить несколько variables в терминале."}
          </p>

          <h3>{"Приоритет"}</h3>
          <p>
            {"Реальные environment variables могут переопределять значения dotenv."}
          </p>

          <h3>{"Кодировка"}</h3>
          <p>
            {"UTF-8 делает поведение предсказуемым."}
          </p>

          <h3>{"Не публикация"}</h3>
          <p>
            {"Рабочий .env обычно исключается из Git."}
          </p>

        </div>

        <CodeBlock
          caption={"SettingsConfigDict"}
          code={
            "from pydantic_settings import (\n" +
            "    BaseSettings,\n" +
            "    SettingsConfigDict,\n" +
            ")\n" +
            "\n" +
            "\n" +
            "class Settings(BaseSettings):\n" +
            "    app_name: str = \"StudyHub Database API\"\n" +
            "    api_mode: str = \"development\"\n" +
            "    database_url: str = \"sqlite:///./studyhub.db\"\n" +
            "\n" +
            "    model_config = SettingsConfigDict(\n" +
            "        env_file=\".env\",\n" +
            "        env_file_encoding=\"utf-8\",\n" +
            "    )"
          }
        />

        <CodeBlock
          caption={".env"}
          code={
            "APP_NAME=StudyHub Local API\n" +
            "API_MODE=development\n" +
            "DATABASE_URL=sqlite:///./studyhub.db"
          }
        />

        <CompareSolutions
          question={"Где хранить локальный DATABASE_URL?"}
          left={{
            title: "В router",
            code: "DATABASE_URL = \"...\"",
            note: "HTTP-модуль становится источником конфигурации.",
          }}
          right={{
            title: "В .env + Settings",
            code: "DATABASE_URL=sqlite:///./studyhub.db",
            note: "Значение выбирается окружением и проверяется моделью.",
          }}
          preferred={"right"}
          explanation={"Router получает готовые settings через dependency."}
        />

        <Callout tone="info">
          {".env не является Python-файлом: кавычки, пробелы и синтаксис должны соответствовать dotenv-формату."}
        </Callout>
      </Section>

      <Section number="05" title={".env.example документирует обязательные имена"}>
        <Lead>
          {"Рабочий .env не коммитится, но новый разработчик должен знать, какие variables требуются. Для этого создаётся безопасный .env.example без настоящих secrets."}
        </Lead>

        <div className="lesson-practice-steps">
          <h3>{"Шаблон"}</h3>
          <p>
            {"Содержит имена и безопасные демонстрационные значения."}
          </p>

          <h3>{"README"}</h3>
          <p>
            {"Объясняет копирование .env.example → .env."}
          </p>

          <h3>{"Без secrets"}</h3>
          <p>
            {"Настоящий SECRET_KEY или пароль не попадает в repository."}
          </p>

          <h3>{"Синхронизация"}</h3>
          <p>
            {"При добавлении новой setting обновляются model, example и README."}
          </p>

        </div>

        <CodeBlock
          caption={".env.example"}
          code={
            "APP_NAME=StudyHub Database API\n" +
            "API_MODE=development\n" +
            "DATABASE_URL=sqlite:///./studyhub.db\n" +
            "SECRET_KEY=replace-me-locally"
          }
        />

        <CodeBlock
          caption={".gitignore"}
          code={
            ".env\n" +
            ".venv/\n" +
            "__pycache__/\n" +
            ".pytest_cache/\n" +
            "*.pyc"
          }
        />

        <BugHunt
          code={
            ".env\n" +
            "SECRET_KEY=real-production-secret\n" +
            "\n" +
            "# затем\n" +
            "git add .env\n" +
            "git commit -m \"add config\""
          }
          question={"В чём риск?"}
          options={[
            "Секрет попадает в историю Git",
            "dotenv не поддерживает строки",
            "FastAPI удалит файл",
          ]}
          correctIndex={0}
          explanation={"Даже удалённый следующим commit secret останется в истории и должен считаться раскрытым."}
          fix={".gitignore\n.env\n\n.env.example\nSECRET_KEY=replace-me"}
        />

        <Callout tone="info">
          {"Само имя SECRET_KEY можно публиковать. Нельзя публиковать реальное значение, которое используется сервисом."}
        </Callout>
      </Section>

      <Section number="06" title={"get_settings и lru_cache"}>
        <Lead>
          {"Создание Settings может читать dotenv. Для одного процесса достаточно создать объект один раз и возвращать его через dependency. lru_cache хранит результат обычной Python-функции между requests."}
        </Lead>

        <div className="lesson-practice-steps">
          <h3>{"get_settings"}</h3>
          <p>
            {"Единая функция-provider для FastAPI."}
          </p>

          <h3>{"lru_cache"}</h3>
          <p>
            {"После первого вызова возвращает тот же объект для одинаковых аргументов."}
          </p>

          <h3>{"Dependency"}</h3>
          <p>
            {"Endpoints объявляют SettingsDep."}
          </p>

          <h3>{"Тест"}</h3>
          <p>
            {"Provider можно override, не изменяя рабочий endpoint."}
          </p>

        </div>

        <CodeBlock
          caption={"provider"}
          code={
            "from functools import lru_cache\n" +
            "from typing import Annotated\n" +
            "\n" +
            "from fastapi import Depends\n" +
            "\n" +
            "\n" +
            "@lru_cache\n" +
            "def get_settings() -> Settings:\n" +
            "    return Settings()\n" +
            "\n" +
            "\n" +
            "SettingsDep = Annotated[\n" +
            "    Settings,\n" +
            "    Depends(get_settings),\n" +
            "]"
          }
        />

        <CodeBlock
          caption={"endpoint"}
          code={
            "@router.get(\"/info\")\n" +
            "def get_info(settings: SettingsDep):\n" +
            "    return {\n" +
            "        \"app_name\": settings.app_name,\n" +
            "        \"api_mode\": settings.api_mode,\n" +
            "    }"
          }
        />

        <CompareSolutions
          question={"Почему не создать Settings() прямо в каждом endpoint?"}
          left={{
            title: "В каждом handler",
            code: "settings = Settings()",
            note: "Повторное чтение конфигурации и жёсткое создание внутри route.",
          }}
          right={{
            title: "Provider + cache",
            code: "settings: SettingsDep",
            note: "Получение централизовано и заменяется в тестах.",
          }}
          preferred={"right"}
          explanation={"FastAPI dependency и lru_cache дают ясную точку получения settings."}
        />

        <Callout tone="info">
          {"lru_cache и request dependency cache — разные уровни. Первый живёт в Python-процессе, второй действует при решении одного request graph."}
        </Callout>
      </Section>

      <Section number="07" title={"Development и test используют разные значения"}>
        <Lead>
          {"Тесты не должны случайно использовать рабочий database_url или режим. Dependency override позволяет передать TestSettings либо отдельный Settings с тестовыми значениями."}
        </Lead>

        <div className="lesson-practice-steps">
          <h3>{"Development"}</h3>
          <p>
            {"Локальный SQLite-файл и debug-настройки."}
          </p>

          <h3>{"Test"}</h3>
          <p>
            {"Отдельный временный URL и api_mode=test."}
          </p>

          <h3>{"Override"}</h3>
          <p>
            {"app.dependency_overrides связывает рабочий provider с тестовым."}
          </p>

          <h3>{"Очистка"}</h3>
          <p>
            {"Override удаляется после теста, чтобы сценарии не влияли друг на друга."}
          </p>

        </div>

        <CodeBlock
          caption={"test provider"}
          code={
            "def get_test_settings() -> Settings:\n" +
            "    return Settings(\n" +
            "        api_mode=\"test\",\n" +
            "        database_url=\"sqlite:///./test.db\",\n" +
            "    )\n" +
            "\n" +
            "app.dependency_overrides[get_settings] = get_test_settings"
          }
        />

        <CodeBlock
          caption={"cleanup"}
          code={
            "app.dependency_overrides.clear()"
          }
        />

        <StepThrough
          code={
            "test starts\n" +
            "→ override get_settings\n" +
            "→ request\n" +
            "→ endpoint receives test settings\n" +
            "→ assertions\n" +
            "→ clear overrides"
          }
          steps={[
            {
              line: 0,
              note: "Тест подготавливает окружение.",
              vars: { "mode": "test" },
            },
            {
              line: 1,
              note: "Рабочий provider заменяется.",
              vars: { "override": "active" },
            },
            {
              line: 2,
              note: "TestClient отправляет request.",
              vars: { "request": "GET /info" },
            },
            {
              line: 3,
              note: "Endpoint получает test Settings.",
              vars: { "database_url": "test.db" },
            },
            {
              line: 4,
              note: "Проверяется response.",
              vars: { "status": "200" },
            },
            {
              line: 5,
              note: "Override очищается.",
              vars: { "isolation": "restored" },
            },
          ]}
        />

        <Callout tone="info">
          {"В блоке 14 DATABASE_URL начнёт реально управлять SQLAlchemy engine. Сейчас важно подготовить безопасную конфигурационную границу."}
        </Callout>
      </Section>

      <Section number="08" title={"Практика: конфигурация перед SQLite"}>
        <Lead>
          {"Создайте config.py до подключения SQLAlchemy. Блок должен закончиться settings, которые уже содержат будущий DATABASE_URL, но ещё не открывают соединение."}
        </Lead>

        <div className="lesson-practice-steps">
          <h3>{"Шаг 1"}</h3>
          <p>
            {"Установите pydantic-settings."}
          </p>

          <h3>{"Шаг 2"}</h3>
          <p>
            {"Создайте Settings и SettingsConfigDict."}
          </p>

          <h3>{"Шаг 3"}</h3>
          <p>
            {"Добавьте .env, .env.example и .gitignore."}
          </p>

          <h3>{"Шаг 4"}</h3>
          <p>
            {"Подключите get_settings и SettingsDep."}
          </p>

          <h3>{"Шаг 5"}</h3>
          <p>
            {"Сделайте /info без выдачи secrets."}
          </p>

          <h3>{"Шаг 6"}</h3>
          <p>
            {"Проверьте test override."}
          </p>

        </div>

        <CodeBlock
          caption={"структура"}
          code={
            "app/\n" +
            "├── main.py\n" +
            "├── config.py\n" +
            "├── dependencies.py\n" +
            "└── routers/\n" +
            "\n" +
            ".env\n" +
            ".env.example\n" +
            ".gitignore"
          }
        />

        <Callout tone="info">
          {"Endpoint /info может возвращать app_name и api_mode, но не должен раскрывать SECRET_KEY или пароль базы."}
        </Callout>

        <div className="lesson-check-group">
          <QuizCard
            question={"Откуда импортируется BaseSettings в Pydantic v2?"}
            options={[
              "pydantic_settings",
              "fastapi",
              "sqlite3",
            ]}
            correctIndex={0}
            explanation={"Settings находятся в отдельном пакете."}
          />
          <QuizCard
            question={"Зачем .env.example?"}
            options={[
              "документировать имена без настоящих secrets",
              "хранить production secret",
              "заменить .gitignore",
            ]}
            correctIndex={0}
            explanation={"Новый разработчик видит шаблон конфигурации."}
          />
          <QuizCard
            question={"Что делает lru_cache для get_settings?"}
            options={[
              "переиспользует созданный объект в процессе",
              "кэширует HTTP body",
              "создаёт cookie",
            ]}
            correctIndex={0}
            explanation={"Settings не читается заново на каждый request."}
          />
          <QuizCard
            question={"Что нельзя возвращать из /info?"}
            options={[
              "SECRET_KEY",
              "app_name",
              "api_mode",
            ]}
            correctIndex={0}
            explanation={"Секреты не становятся публичным response."}
          />
        </div>

        <KeyTakeaways
          points={[
            <>{"Configuration отделяется от стабильного кода."}</>,
            <>{"Environment variables поступают как текст."}</>,
            <>{"Pydantic Settings преобразует и проверяет значения."}</>,
            <>{"SettingsConfigDict подключает .env."}</>,
            <>{".env обычно не коммитится."}</>,
            <>{".env.example документирует безопасный шаблон."}</>,
            <>{"get_settings используется как dependency provider."}</>,
            <>{"lru_cache и dependency override упрощают запуск и тесты."}</>,
          ]}
        />

        <PracticeCta
          text={"Создайте config.py, .env и .env.example, подключите SettingsDep к /info и проверьте отдельные development/test значения."}
        />
      </Section>

    </RichLesson>
  );
}

// 73. Заголовки, cookies и Response
export function Lesson73({ module }: { module?: string }) {
  return (
    <RichLesson>
      <RichHero
        variant="project"
        chip={module ?? BLOCK_TITLE}
        title={"Заголовки, cookies и Response"}
        intro={"Расширим HTTP-контракт за пределы JSON body: прочитаем X-Client-Version, добавим собственный response header, установим и удалим учебную cookie через объект Response."}
        tags={[
          { icon: <FileText size={14} />, label: "Header и Cookie" },
          { icon: <KeyRound size={14} />, label: "управление Response" },
        ]}
      />

      <Section number="01" title={"Headers описывают request, body переносит данные"}>
        <Lead>
          {"JSON body содержит поля создаваемой задачи. Header сообщает метаданные обращения: версию клиента, формат, request id или будущий Authorization."}
        </Lead>

        <div className="lesson-practice-steps">
          <h3>{"Body"}</h3>
          <p>
            {"Предметные данные ресурса: title, priority, is_done."}
          </p>

          <h3>{"Header"}</h3>
          <p>
            {"Служебный контекст request, который не является полем Task."}
          </p>

          <h3>{"Стандартный"}</h3>
          <p>
            {"Content-Type и User-Agent имеют общеизвестный смысл."}
          </p>

          <h3>{"Custom"}</h3>
          <p>
            {"X-Client-Version создаётся для контракта конкретного приложения."}
          </p>

        </div>

        <CodeBlock
          caption={"request"}
          code={
            "POST /tasks HTTP/1.1\n" +
            "Content-Type: application/json\n" +
            "X-Client-Version: 1.4.0\n" +
            "\n" +
            "{\n" +
            "  \"title\": \"Headers\",\n" +
            "  \"priority\": 4\n" +
            "}"
          }
        />

        <MatchPairs
          prompt={"Разместите данные."}
          leftTitle={"Данные"}
          rightTitle={"Место"}
          pairs={[
            { left: "title", right: "JSON body" },
            { left: "priority", right: "JSON body" },
            { left: "X-Client-Version", right: "request header" },
            { left: "Content-Type", right: "request header" },
          ]}
          explanation={"Предметные поля и служебные метаданные разделены."}
        />

        <Callout tone="info">
          {"Не переносите title задачи в header. Выбор части request следует из роли данных."}
        </Callout>
      </Section>

      <Section number="02" title={"Чтение Header через Annotated"}>
        <Lead>
          {"FastAPI предоставляет функцию Header. Параметр x_client_version в Python соответствует HTTP-header X-Client-Version благодаря автоматической замене underscore на hyphen."}
        </Lead>

        <div className="lesson-practice-steps">
          <h3>{"Annotated type"}</h3>
          <p>
            {"Итоговое значение — str или None."}
          </p>

          <h3>{"Header metadata"}</h3>
          <p>
            {"FastAPI читает значение из request headers."}
          </p>

          <h3>{"Default None"}</h3>
          <p>
            {"Header становится необязательным."}
          </p>

          <h3>{"Conversion"}</h3>
          <p>
            {"x_client_version ↔ X-Client-Version."}
          </p>

        </div>

        <CodeBlock
          caption={"endpoint"}
          code={
            "from typing import Annotated\n" +
            "from fastapi import Header\n" +
            "\n" +
            "@router.get(\"/info\")\n" +
            "def get_info(\n" +
            "    x_client_version: Annotated[\n" +
            "        str | None,\n" +
            "        Header(),\n" +
            "    ] = None,\n" +
            "):\n" +
            "    return {\n" +
            "        \"client_version\": x_client_version,\n" +
            "    }"
          }
        />

        <CodeBlock
          caption={"requests"}
          code={
            "GET /info\n" +
            "→ client_version = null\n" +
            "\n" +
            "GET /info\n" +
            "X-Client-Version: 1.4.0\n" +
            "→ client_version = \"1.4.0\""
          }
        />

        <FillBlank
          prompt={"Какое имя header прочитает FastAPI?"}
          before={"x_client_version → "}
          after={""}
          options={[
            "X-Client-Version",
            "x_client_version",
            "client.version",
          ]}
          answer={"X-Client-Version"}
          explanation={"Header автоматически преобразует underscores в hyphens."}
        />

        <Callout tone="info">
          {"Имена headers регистронезависимы на уровне HTTP. В документации принято писать слова через hyphen."}
        </Callout>
      </Section>

      <Section number="03" title={"Обязательный header и понятная ошибка"}>
        <Lead>
          {"Если версия клиента действительно обязательна для operation, default можно не задавать. Тогда отсутствие header станет validation error 422 до endpoint."}
        </Lead>

        <div className="lesson-practice-steps">
          <h3>{"Optional"}</h3>
          <p>
            {"Подходит для аналитики или постепенного внедрения."}
          </p>

          <h3>{"Required"}</h3>
          <p>
            {"Подходит, когда без metadata operation нельзя выполнить."}
          </p>

          <h3>{"422"}</h3>
          <p>
            {"Сообщает о missing header в detail."}
          </p>

          <h3>{"Предметное правило"}</h3>
          <p>
            {"Неподдерживаемая версия может дать 400 или 426 по отдельной договорённости."}
          </p>

        </div>

        <CodeBlock
          caption={"required"}
          code={
            "@router.post(\"/\")\n" +
            "def create_task(\n" +
            "    task: TaskCreate,\n" +
            "    x_client_version: Annotated[\n" +
            "        str,\n" +
            "        Header(),\n" +
            "    ],\n" +
            "):\n" +
            "    ..."
          }
        />

        <CodeBlock
          caption={"manual support check"}
          code={
            "SUPPORTED_CLIENT_VERSIONS = {\"1.3.0\", \"1.4.0\"}\n" +
            "\n" +
            "if x_client_version not in SUPPORTED_CLIENT_VERSIONS:\n" +
            "    raise HTTPException(\n" +
            "        status_code=400,\n" +
            "        detail=\"Unsupported client version\",\n" +
            "    )"
          }
        />

        <BranchExplorer
          code={
            "получить X-Client-Version\n" +
            "if header отсутствует:\n" +
            "    validation 422\n" +
            "elif version не поддерживается:\n" +
            "    HTTPException 400\n" +
            "else:\n" +
            "    вызвать endpoint"
          }
          scenarios={[
            { label: "header missing", activeLine: 2, output: "422" },
            { label: "version 0.1.0", activeLine: 4, output: "400" },
            { label: "version 1.4.0", activeLine: 6, output: "handler called" },
          ]}
        />

        <Callout tone="info">
          {"Не делайте header обязательным только ради демонстрации. Требование должно быть частью API-контракта."}
        </Callout>
      </Section>

      <Section number="04" title={"Response parameter позволяет добавить header"}>
        <Lead>
          {"FastAPI может предоставить временный объект Response. Endpoint изменяет его headers, а обычный return по-прежнему проходит через response_model и JSON serialization."}
        </Lead>

        <div className="lesson-practice-steps">
          <h3>{"Parameter"}</h3>
          <p>
            {"response: Response не читается из request."}
          </p>

          <h3>{"Temporary response"}</h3>
          <p>
            {"FastAPI использует его metadata при создании финального ответа."}
          </p>

          <h3>{"Custom header"}</h3>
          <p>
            {"Например X-API-Mode или X-Process-Source."}
          </p>

          <h3>{"Body"}</h3>
          <p>
            {"Можно продолжать возвращать Pydantic model или dict."}
          </p>

        </div>

        <CodeBlock
          caption={"response header"}
          code={
            "from fastapi import Response\n" +
            "\n" +
            "@router.get(\"/info\")\n" +
            "def get_info(\n" +
            "    response: Response,\n" +
            "    settings: SettingsDep,\n" +
            "):\n" +
            "    response.headers[\"X-API-Mode\"] = settings.api_mode\n" +
            "\n" +
            "    return {\n" +
            "        \"app_name\": settings.app_name,\n" +
            "    }"
          }
        />

        <CodeBlock
          caption={"response"}
          code={
            "HTTP/1.1 200 OK\n" +
            "X-API-Mode: development\n" +
            "Content-Type: application/json\n" +
            "\n" +
            "{\"app_name\":\"StudyHub Database API\"}"
          }
        />

        <CompareSolutions
          question={"Как добавить X-API-Mode, сохранив обычный JSON return?"}
          left={{
            title: "Вернуть только Response",
            code: "return Response(...)",
            note: "Придётся вручную отвечать за serialization.",
          }}
          right={{
            title: "Изменить parameter Response",
            code: "response.headers[\"X-API-Mode\"] = ...\nreturn {\"app_name\": ...}",
            note: "FastAPI сохранит обычную обработку body.",
          }}
          preferred={"right"}
          explanation={"Temporary Response подходит для metadata вокруг обычного результата."}
        />

        <Callout tone="info">
          {"Custom response header и JSON body решают разные задачи. Не дублируйте все поля body в headers."}
        </Callout>
      </Section>

      <Section number="05" title={"Cookie читается как отдельный источник request"}>
        <Lead>
          {"Cookie приходит в header Cookie, но FastAPI предоставляет отдельную функцию Cookie. Это делает сигнатуру понятнее и отражает параметр в OpenAPI."}
        </Lead>

        <div className="lesson-practice-steps">
          <h3>{"Имя"}</h3>
          <p>
            {"studyhub_visit_id — имя cookie в браузере."}
          </p>

          <h3>{"Optional"}</h3>
          <p>
            {"Первый request может прийти без cookie."}
          </p>

          <h3>{"Тип"}</h3>
          <p>
            {"На текущем этапе используется str | None."}
          </p>

          <h3>{"Не body"}</h3>
          <p>
            {"Cookie автоматически отправляется клиентом по правилам браузера."}
          </p>

        </div>

        <CodeBlock
          caption={"чтение"}
          code={
            "from fastapi import Cookie\n" +
            "\n" +
            "@router.get(\"/visits\")\n" +
            "def get_visits(\n" +
            "    studyhub_visit_id: Annotated[\n" +
            "        str | None,\n" +
            "        Cookie(),\n" +
            "    ] = None,\n" +
            "):\n" +
            "    return {\n" +
            "        \"visit_id\": studyhub_visit_id,\n" +
            "    }"
          }
        />

        <CodeBlock
          caption={"request"}
          code={
            "GET /visits HTTP/1.1\n" +
            "Cookie: studyhub_visit_id=demo-123"
          }
        />

        <TrueFalse
          statement={
            <>
              {"Наличие cookie studyhub_visit_id автоматически означает, что пользователь аутентифицирован."}
            </>
          }
          isTrue={false}
          explanation={"Cookie — только переданное значение; доверие и session logic требуют отдельной реализации."}
        />

        <Callout tone="info">
          {"Cookie является транспортом небольшого значения. Она ещё не создаёт server-side session, пользователя или права доступа."}
        </Callout>
      </Section>

      <Section number="06" title={"Установка cookie через Response"}>
        <Lead>
          {"Метод response.set_cookie добавляет Set-Cookie в response. Браузер может сохранить значение и отправлять его в следующих подходящих requests."}
        </Lead>

        <div className="lesson-practice-steps">
          <h3>{"key/value"}</h3>
          <p>
            {"Имя и значение cookie."}
          </p>

          <h3>{"httponly"}</h3>
          <p>
            {"Запрещает JavaScript читать cookie; полезно для будущих session cookies."}
          </p>

          <h3>{"samesite"}</h3>
          <p>
            {"Ограничивает cross-site отправку."}
          </p>

          <h3>{"secure"}</h3>
          <p>
            {"Требует HTTPS; для локального HTTP обычно False."}
          </p>

        </div>

        <CodeBlock
          caption={"установка"}
          code={
            "from uuid import uuid4\n" +
            "\n" +
            "@router.post(\"/visits\")\n" +
            "def start_visit(response: Response):\n" +
            "    visit_id = str(uuid4())\n" +
            "\n" +
            "    response.set_cookie(\n" +
            "        key=\"studyhub_visit_id\",\n" +
            "        value=visit_id,\n" +
            "        httponly=True,\n" +
            "        samesite=\"lax\",\n" +
            "        secure=False,\n" +
            "    )\n" +
            "\n" +
            "    return {\n" +
            "        \"message\": \"Visit started\",\n" +
            "    }"
          }
        />

        <CodeBlock
          caption={"header"}
          code={
            "Set-Cookie: studyhub_visit_id=...; HttpOnly; Path=/; SameSite=lax"
          }
        />

        <StepThrough
          code={
            "POST /visits\n" +
            "→ endpoint creates visit_id\n" +
            "→ response.set_cookie\n" +
            "→ Set-Cookie header\n" +
            "→ browser stores value\n" +
            "→ next request sends Cookie header"
          }
          steps={[
            {
              line: 0,
              note: "Клиент запускает operation.",
              vars: { "request": "POST /visits" },
            },
            {
              line: 1,
              note: "Server создаёт идентификатор.",
              vars: { "visit_id": "uuid" },
            },
            {
              line: 2,
              note: "Response получает cookie metadata.",
              vars: { "method": "set_cookie" },
            },
            {
              line: 3,
              note: "Клиент получает Set-Cookie.",
              vars: { "header": "present" },
            },
            {
              line: 4,
              note: "Браузер применяет свои правила хранения.",
              vars: { "storage": "browser" },
            },
            {
              line: 5,
              note: "Следующий request может отправить cookie.",
              vars: { "Cookie": "studyhub_visit_id=..." },
            },
          ]}
        />

        <Callout tone="info">
          {"В production значение secure обычно True при HTTPS. Не копируйте локальную настройку механически в развёрнутое приложение."}
        </Callout>
      </Section>

      <Section number="07" title={"Удаление cookie и границы учебного примера"}>
        <Lead>
          {"Удаление выполняется response.delete_cookie с тем же key и совместимыми параметрами path/domain. Клиент получает Set-Cookie, который делает старое значение недействительным."}
        </Lead>

        <div className="lesson-practice-steps">
          <h3>{"Не удаление на сервере"}</h3>
          <p>
            {"Браузеру отправляется инструкция изменить cookie."}
          </p>

          <h3>{"Совпадение key/path"}</h3>
          <p>
            {"Иначе можно удалить не ту область или оставить старую cookie."}
          </p>

          <h3>{"Logout позже"}</h3>
          <p>
            {"В server-side session потребуется также удалить запись session на сервере."}
          </p>

          <h3>{"Сейчас"}</h3>
          <p>
            {"Удаляем только учебный visit id."}
          </p>

        </div>

        <CodeBlock
          caption={"удаление"}
          code={
            "@router.delete(\"/visits\", status_code=204)\n" +
            "def finish_visit(response: Response) -> None:\n" +
            "    response.delete_cookie(\n" +
            "        key=\"studyhub_visit_id\",\n" +
            "    )"
          }
        />

        <CodeBlock
          caption={"сценарий"}
          code={
            "POST /visits\n" +
            "→ Set-Cookie\n" +
            "GET /visits\n" +
            "→ cookie read\n" +
            "DELETE /visits\n" +
            "→ cookie expired"
          }
        />

        <CodeSequence
          title={"Жизненный цикл cookie"}
          prompt={"Расположите действия."}
          pieces={[
            { id: "start", code: "server sends Set-Cookie" },
            { id: "store", code: "client stores cookie" },
            { id: "send", code: "client sends Cookie header" },
            { id: "read", code: "FastAPI extracts value" },
            { id: "delete", code: "server sends deletion Set-Cookie" },
          ]}
          correctOrder={[
            "start",
            "store",
            "send",
            "read",
            "delete",
          ]}
          explanation={"Cookie живёт в обмене response и последующих requests."}
        />

        <Callout tone="info">
          {"Cookie может оставаться в интерфейсе клиента до обновления, но последующие requests должны следовать новому Set-Cookie."}
        </Callout>
      </Section>

      <Section number="08" title={"Практика: версия клиента и visit cookie"}>
        <Lead>
          {"Добавьте к StudyHub два независимых механизма: X-Client-Version как request metadata и studyhub_visit_id как учебную cookie. Не связывайте их с user authentication."}
        </Lead>

        <div className="lesson-practice-steps">
          <h3>{"GET /info"}</h3>
          <p>
            {"Принимает optional X-Client-Version и добавляет X-API-Mode."}
          </p>

          <h3>{"POST /visits"}</h3>
          <p>
            {"Устанавливает HttpOnly visit cookie."}
          </p>

          <h3>{"GET /visits"}</h3>
          <p>
            {"Показывает наличие идентификатора."}
          </p>

          <h3>{"DELETE /visits"}</h3>
          <p>
            {"Удаляет cookie со status 204."}
          </p>

          <h3>{"Postman"}</h3>
          <p>
            {"Проверьте request headers и cookie jar."}
          </p>

        </div>

        <CodeBlock
          caption={"контрольная карта"}
          code={
            "request header\n" +
            "X-Client-Version: 1.4.0\n" +
            "→ endpoint argument\n" +
            "\n" +
            "response header\n" +
            "X-API-Mode: development\n" +
            "\n" +
            "response Set-Cookie\n" +
            "→ client cookie storage\n" +
            "→ next request Cookie"
          }
        />

        <Callout tone="info">
          {"Итог занятия — ясное различие body, headers, cookies и response metadata."}
        </Callout>

        <div className="lesson-check-group">
          <QuizCard
            question={"Во что превращается x_client_version?"}
            options={[
              "X-Client-Version",
              "x_client_version body field",
              "query x-client-version",
            ]}
            correctIndex={0}
            explanation={"Header конвертирует underscores в hyphens."}
          />
          <QuizCard
            question={"Как добавить custom response header?"}
            options={[
              "через parameter Response",
              "через TaskCreate",
              "через path",
            ]}
            correctIndex={0}
            explanation={"Temporary Response участвует в финальном ответе."}
          />
          <QuizCard
            question={"Что делает set_cookie?"}
            options={[
              "добавляет Set-Cookie в response",
              "создаёт server-side session автоматически",
              "пишет JSON",
            ]}
            correctIndex={0}
            explanation={"Клиент получает инструкцию сохранить cookie."}
          />
          <QuizCard
            question={"Является ли cookie готовой аутентификацией?"}
            options={[
              "нет",
              "да всегда",
              "только в Swagger",
            ]}
            correctIndex={0}
            explanation={"Нужна отдельная логика доверия и session/user data."}
          />
        </div>

        <KeyTakeaways
          points={[
            <>{"Header читает request metadata."}</>,
            <>{"Underscore в имени обычно становится hyphen."}</>,
            <>{"Required header может дать 422 до endpoint."}</>,
            <>{"Response parameter добавляет headers и cookies к обычному return."}</>,
            <>{"Cookie извлекается отдельным маркером Cookie."}</>,
            <>{"set_cookie отправляет Set-Cookie клиенту."}</>,
            <>{"delete_cookie инструктирует клиента удалить значение."}</>,
            <>{"Cookie является транспортом, а не готовой session."}</>,
          ]}
        />

        <PracticeCta
          text={"Добавьте X-Client-Version, X-API-Mode и полный жизненный цикл studyhub_visit_id, затем проверьте headers и cookies в Postman."}
        />
      </Section>

    </RichLesson>
  );
}

// 74. Middleware и CORS
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
