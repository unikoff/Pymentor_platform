import { Layers, Route } from "lucide-react";
import { BranchExplorer, BugHunt, Callout, CodeBlock, CodeSequence, CompareSolutions, FillBlank, KeyTakeaways, Lead, MatchPairs, PracticeCta, QuizCard, RichHero, RichLesson, Section, StepThrough } from "../../shared";
const BLOCK_TITLE = "Этап 4 · Блок 13 · FastAPI как цельное приложение";

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
