import { GitBranch, Wrench } from "lucide-react";
import { BranchExplorer, Callout, CodeBlock, CompareSolutions, FillBlank, KeyTakeaways, Lead, MatchPairs, PracticeCta, QuizCard, RecallCard, RichHero, RichLesson, Section, StepThrough } from "../../shared";
const BLOCK_TITLE = "Этап 4 · Блок 13 · FastAPI как цельное приложение";

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
