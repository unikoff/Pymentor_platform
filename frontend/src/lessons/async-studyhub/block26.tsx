import {
  AlertTriangle,
  Boxes,
  Clock3,
  Gauge,
  Layers,
  ListChecks,
  Play,
  ShieldCheck,
  TimerReset,
  UsersRound,
  Workflow,
} from "lucide-react";
import {
  BranchExplorer,
  BugHunt,
  Callout,
  CodeBlock,
  CodeSequence,
  CompareSolutions,
  KeyTakeaways,
  Lead,
  MatchPairs,
  MethodGrid,
  PracticeCta,
  PredictOutput,
  QuizCard,
  RecallCard,
  RichHero,
  RichLesson,
  Section,
  StepThrough,
  TerminalDemo,
  TrueFalse,
  TypeCard,
  TypeCards,
} from "../shared";

const BLOCK_TITLE = "Блок 26 · Конкурентные задачи и управляемое ожидание";

type TheoryBridgeData = { link: string; boundary: string };
const THEORY_BRIDGES: Record<number, TheoryBridgeData> = {
  147: {
    link: "В блоке 25 coroutine запускались через asyncio.run и ожидались последовательно. Теперь coroutine становится Task, которую event loop может продвигать независимо от текущей строки main.",
    boundary: "Task не является OS thread и не делает CPU-вычисления параллельными.",
  },
  148: {
    link: "После ручного создания нескольких Task нужен один coordination point, который дождётся группы и вернёт сопоставимые результаты.",
    boundary: "Порядок завершения и порядок списка результатов gather — разные вещи.",
  },
  149: {
    link: "Конкурентный gather уменьшает общее ожидание, но одна зависшая операция всё ещё способна удерживать весь сценарий.",
    boundary: "Timeout ограничивает одну попытку, но не является retry и не исправляет внешний источник.",
  },
  150: {
    link: "Wait_for использует cancellation, поэтому теперь отмена изучается напрямую как часть жизненного цикла Task.",
    boundary: "task.cancel() отправляет запрос; корректное завершение требует delivery, cleanup и наблюдения исхода.",
  },
  151: {
    link: "Операции уже имеют timeout и cancellation-safe cleanup, но неограниченный gather способен перегрузить внешний сервис или pool.",
    boundary: "Semaphore ограничивает число Task внутри защищённой секции, а не число созданных Task.",
  },
  152: {
    link: "Финальный урок объединяет create_task, gather, wait_for, cancellation и Semaphore в один сервисный сценарий.",
    boundary: "Частичный результат допустим только при явном status и разделении required и optional sources.",
  },
};
function TheoryBridge({ lesson }: { lesson: number }) {
  const bridge = THEORY_BRIDGES[lesson];
  return (
    <Callout tone="info">
      <strong>{"Связь с курсом."}</strong> {bridge.link}{" "}
      <strong>{"Важно не перепутать:"}</strong> {bridge.boundary}
    </Callout>
  );
}

// 147. asyncio.create_task и жизненный цикл Task
export function Lesson147({ module }: { module?: string }) {
  return (
    <RichLesson>
      <RichHero
        variant="project"
        chip={module ?? BLOCK_TITLE}
        title={"asyncio.create_task и жизненный цикл Task"}
        intro={"Превратим независимые coroutine в управляемые задачи event loop: увидим состояния Task, порядок старта, получение результата и диагностику исключения."}
        tags={[
          { icon: <Workflow size={14} />, label: "coroutine → Task" },
          { icon: <Play size={14} />, label: "scheduled · running · done" },
        ]}
      />
      <TheoryBridge lesson={147} />

      <Section number={"01"} title={"От последовательного loader к двум Task"}>
        <Lead>
          {"Профиль StudyHub загружал пользователя и задачи последовательно, хотя обе операции только ждали I/O. Создадим обе Task до первого ожидания."}
        </Lead>

        <div className="lesson-practice-steps">
          <h3>{"Главная модель"}</h3>
          <p>{"create_task регистрирует coroutine в текущем event loop."}</p>
          <h3>{"Контролируемое изменение"}</h3>
          <p>{"Измените delay, порядок входов, timeout или concurrency limit. Сначала запишите прогноз, затем запустите пример."}</p>
          <h3>{"Профессиональная граница"}</h3>
          <p>{"Конкурентно запускаются только операции без зависимости по данным."}</p>
        </div>

        <CodeBlock
          caption={"пример 147.1"}
          code={"user_task = asyncio.create_task(load_user(7))\ntasks_task = asyncio.create_task(load_tasks(7))\n\nuser = await user_task\ntasks = await tasks_task"}
        />

        <CompareSolutions
          question={"Какой подход точнее выражает модель раздела?"}
          left={{
            title: "Скрытый или последовательный подход",
            code: "# работа запускается без явного управления",
            note: "Граница жизненного цикла и ошибки плохо видна.",
          }}
          right={{
            title: "Явный async-контракт",
            code: "user_task = asyncio.create_task(load_user(7))\ntasks_task = asyncio.create_task(load_tasks(7))\n\nuser = await user_task\ntasks = await tasks_task",
            note: "Видны операция, ожидание и форма результата.",
          }}
          preferred="right"
          explanation={"Профессиональный код показывает, кто создаёт работу, кто её ожидает и что происходит при сбое."}
        />

        <MethodGrid
          rows={[
            [<>problem</>, "назвать ограничение старого подхода"],
            [<>mechanism</>, "проследить управление и состояние"],
            [<>failure</>, "воспроизвести ожидаемый сбой"],
            [<>evidence</>, "подтвердить вывод запуском и тестом"],
          ]}
        />

        <Callout tone="info">
          <strong>{"Проверка."}</strong> {" Объясните, что сейчас только создаётся, что уже выполняется, где coroutine отдаёт управление и какой исход наблюдает caller."}
        </Callout>
      </Section>

      <Section number={"02"} title={"Coroutine object, Task и результат"}>
        <Lead>
          {"Coroutine object описывает незавершённый async-вызов. Task добавляет планирование, состояние и наблюдаемый исход."}
        </Lead>

        <div className="lesson-practice-steps">
          <h3>{"Главная модель"}</h3>
          <p>{"await Task возвращает значение исходной coroutine."}</p>
          <h3>{"Контролируемое изменение"}</h3>
          <p>{"Измените delay, порядок входов, timeout или concurrency limit. Сначала запишите прогноз, затем запустите пример."}</p>
          <h3>{"Профессиональная граница"}</h3>
          <p>{"Создание Task не создаёт системный поток."}</p>
        </div>

        <CodeBlock
          caption={"пример 147.2"}
          code={"operation = load_user(7)\ntask = asyncio.create_task(operation)\nresult = await task"}
        />

        <TypeCards>
          <TypeCard badge="вход" title="Что получает механизм" code={"operation = load_user(7)"}>
            Операция, configuration или awaitable передаются явно.
          </TypeCard>
          <TypeCard badge="жизненный цикл" badgeTone="float" title="Что делает event loop" code="scheduled → waiting → done">
            Loop продвигает готовые coroutine в точках кооперативного ожидания.
          </TypeCard>
          <TypeCard badge="исход" badgeTone="str" title="Что получает caller" code="result | error | cancellation">
            Результат должен иметь наблюдаемую и проверяемую форму.
          </TypeCard>
        </TypeCards>
        <TrueFalse
          statement={<>Asyncio автоматически делает любую операцию параллельной на нескольких CPU.</>}
          isTrue={false}
          explanation={"Asyncio предназначен прежде всего для конкурентного I/O и не превращает CPU-bound код в параллельный."}
        />

        <Callout tone="info">
          <strong>{"Проверка."}</strong> {" Объясните, что сейчас только создаётся, что уже выполняется, где coroutine отдаёт управление и какой исход наблюдает caller."}
        </Callout>
      </Section>

      <Section number={"03"} title={"Когда Task действительно начинает работу"}>
        <Lead>
          {"После create_task текущая coroutine продолжает выполняться до точки, где отдаёт управление loop."}
        </Lead>

        <div className="lesson-practice-steps">
          <h3>{"Главная модель"}</h3>
          <p>{"Переключение кооперативное и происходит в точках await."}</p>
          <h3>{"Контролируемое изменение"}</h3>
          <p>{"Измените delay, порядок входов, timeout или concurrency limit. Сначала запишите прогноз, затем запустите пример."}</p>
          <h3>{"Профессиональная граница"}</h3>
          <p>{"Не обещайте немедленный старт на той же строке."}</p>
        </div>

        <CodeBlock
          caption={"пример 147.3"}
          code={"task = asyncio.create_task(load_user())\nprint(\"main:created\")\nawait asyncio.sleep(0)\nprint(\"main:after-yield\")"}
        />

        <StepThrough
          code={"task = asyncio.create_task(load_user())\nprint(\"main:created\")\nawait asyncio.sleep(0)\nprint(\"main:after-yield\")"}
          steps={[
            { line: 0, note: "Создаётся или настраивается async-операция.", vars: { этап: "start" } },
            { line: 1, note: "Event loop получает точку для переключения.", vars: { состояние: "waiting" } },
            { line: 3, note: "Caller получает результат либо отдельный сбой.", vars: { этап: "observed outcome" } },
          ]}
        />
        <RecallCard
          question={"Где в этом примере находится точка передачи управления event loop?"}
          answer={<p>В выражении с await. До него выполняется обычный синхронный участок текущей coroutine.</p>}
        />

        <Callout tone="info">
          <strong>{"Проверка."}</strong> {" Объясните, что сейчас только создаётся, что уже выполняется, где coroutine отдаёт управление и какой исход наблюдает caller."}
        </Callout>
      </Section>

      <Section number={"04"} title={"Порядок сообщений и разные задержки"}>
        <Lead>
          {"Две Task могут завершиться не в порядке их создания. Результат завершённой Task хранится до await."}
        </Lead>

        <div className="lesson-practice-steps">
          <h3>{"Главная модель"}</h3>
          <p>{"Время завершения определяется точками ожидания и готовностью I/O."}</p>
          <h3>{"Контролируемое изменение"}</h3>
          <p>{"Измените delay, порядок входов, timeout или concurrency limit. Сначала запишите прогноз, затем запустите пример."}</p>
          <h3>{"Профессиональная граница"}</h3>
          <p>{"Порядок нельзя угадывать только по расположению строк."}</p>
        </div>

        <CodeBlock
          caption={"пример 147.4"}
          code={"first = asyncio.create_task(load(\"user\", 0.2))\nsecond = asyncio.create_task(load(\"tasks\", 0.1))\nprint(\"main:waiting\")\nuser = await first\ntasks = await second"}
        />

        <PredictOutput
          code={"first = asyncio.create_task(load(\"user\", 0.2))\nsecond = asyncio.create_task(load(\"tasks\", 0.1))\nprint(\"main:waiting\")\nuser = await first\ntasks = await second"}
          output={"Порядок определяется точками await и задержками; итоговый результат сохраняет объявленный контракт."}
          hint={"Сначала найдите все точки await, затем сравните длительности и порядок входов."}
        />
        <MethodGrid
          rows={[
            [<>создание</>, "работа становится доступной event loop"],
            [<>ожидание</>, "текущая coroutine отдаёт управление"],
            [<>завершение</>, "результат или исключение сохраняется"],
            [<>наблюдение</>, "caller получает исход через await"],
          ]}
        />

        <Callout tone="info">
          <strong>{"Проверка."}</strong> {" Объясните, что сейчас только создаётся, что уже выполняется, где coroutine отдаёт управление и какой исход наблюдает caller."}
        </Callout>
      </Section>

      <Section number={"05"} title={"Результат и исключение внутри Task"}>
        <Lead>
          {"Await важной Task связывает её жизненный цикл с вызывающим сценарием и не даёт потерять исключение."}
        </Lead>

        <div className="lesson-practice-steps">
          <h3>{"Главная модель"}</h3>
          <p>{"await task повторно поднимает сохранённое исключение."}</p>
          <h3>{"Контролируемое изменение"}</h3>
          <p>{"Измените delay, порядок входов, timeout или concurrency limit. Сначала запишите прогноз, затем запустите пример."}</p>
          <h3>{"Профессиональная граница"}</h3>
          <p>{"Fire-and-forget без ссылки ухудшает диагностику."}</p>
        </div>

        <CodeBlock
          caption={"пример 147.5"}
          code={"task = asyncio.create_task(load_tasks(), name=\"load-tasks\")\ntry:\n    tasks = await task\nexcept RuntimeError as error:\n    print(f\"failed:{error}\")"}
        />

        <BugHunt
          code={"task = asyncio.create_task(load_tasks(), name=\"load-tasks\")\ntry:\n    tasks = await task\nexcept RuntimeError as error:\n    print(f\"failed:{error}\")"}
          question={"Какой контракт чаще всего нарушают при неосторожной обработке этого кода?"}
          options={[
            "Теряется наблюдаемость результата, ошибки или cleanup",
            "Python запрещает несколько async-функций",
            "Event loop всегда создаёт новый process",
          ]}
          correctIndex={0}
          explanation={"Async-код должен сохранять жизненный цикл операции и явно обрабатывать ожидаемый исход."}
          fix={"task = asyncio.create_task(load_tasks(), name=\"load-tasks\")\ntry:\n    tasks = await task\nexcept RuntimeError as error:\n    print(f\"failed:{error}\")"}
        />
        <Callout>
          Не исправляйте async-проблему широким <code>except</code> и пустым значением: сначала назовите нарушенный контракт.
        </Callout>

        <Callout tone="info">
          <strong>{"Проверка."}</strong> {" Объясните, что сейчас только создаётся, что уже выполняется, где coroutine отдаёт управление и какой исход наблюдает caller."}
        </Callout>
      </Section>

      <Section number={"06"} title={"StudyHub profile loader"}>
        <Lead>
          {"Пользователь и задачи имеют общий user_id, но не используют результаты друг друга, поэтому запускаются вместе."}
        </Lead>

        <div className="lesson-practice-steps">
          <h3>{"Главная модель"}</h3>
          <p>{"Обе ссылки сохраняются до получения исходов."}</p>
          <h3>{"Контролируемое изменение"}</h3>
          <p>{"Измените delay, порядок входов, timeout или concurrency limit. Сначала запишите прогноз, затем запустите пример."}</p>
          <h3>{"Профессиональная граница"}</h3>
          <p>{"Если второй шаг требует id из первого результата, конкурентный старт преждевременен."}</p>
        </div>

        <CodeBlock
          caption={"пример 147.6"}
          code={"async def load_profile(user_id: int) -> dict:\n    user_task = asyncio.create_task(load_user(user_id))\n    tasks_task = asyncio.create_task(load_tasks(user_id))\n    return {\n        \"user\": await user_task,\n        \"tasks\": await tasks_task,\n    }"}
        />

        <BranchExplorer
          code={"StudyHub profile loader\n├─ success → result\n├─ expected failure → explicit policy\n├─ timeout/cancel → cleanup\n└─ unexpected defect → visible error"}
          scenarios={[
            { label: "успех", activeLine: 1, output: "возвращается ожидаемый результат" },
            { label: "ожидаемый сбой", activeLine: 2, output: "применяется локальная policy" },
            { label: "отмена", activeLine: 3, output: "выполняется cleanup" },
          ]}
        />
        <MatchPairs
          prompt={"Соедините исход с действием caller."}
          pairs={[
            { left: "success", right: "использовать данные" },
            { left: "timeout", right: "вернуть явный degraded status" },
            { left: "cancellation", right: "завершить cleanup и сохранить отмену" },
            { left: "unexpected defect", right: "не маскировать пустым fallback" },
          ]}
          explanation={"Политика зависит от критичности конкретной операции."}
        />

        <Callout tone="info">
          <strong>{"Проверка."}</strong> {" Объясните, что сейчас только создаётся, что уже выполняется, где coroutine отдаёт управление и какой исход наблюдает caller."}
        </Callout>
      </Section>

      <Section number={"07"} title={"Измерение и тест жизненного цикла"}>
        <Lead>
          {"Проверим, что Task сначала pending, после await done, а конкурентное время близко к самой долгой операции."}
        </Lead>

        <div className="lesson-practice-steps">
          <h3>{"Главная модель"}</h3>
          <p>{"Тесты используют широкий временной запас, а не точные миллисекунды."}</p>
          <h3>{"Контролируемое изменение"}</h3>
          <p>{"Измените delay, порядок входов, timeout или concurrency limit. Сначала запишите прогноз, затем запустите пример."}</p>
          <h3>{"Профессиональная граница"}</h3>
          <p>{"Главная проверка — результат и состояние, timing лишь дополнительное доказательство."}</p>
        </div>

        <CodeBlock
          caption={"пример 147.7"}
          code={"task = asyncio.create_task(load_user(7))\nassert task.done() is False\nresult = await task\nassert task.done() is True\nassert result[\"id\"] == 7"}
        />

        <CodeSequence
          title={"Соберите безопасный async-сценарий"}
          prompt={"Расположите шаги от configuration до проверки исхода."}
          pieces={[
            { id: "prepare", code: "подготовить operation и configuration" },
            { id: "start", code: "создать или запланировать awaitable" },
            { id: "await", code: "дождаться результата по явной policy" },
            { id: "cleanup", code: "гарантировать cleanup при сбое" },
            { id: "verify", code: "проверить result, error и state" },
          ]}
          correctOrder={["prepare", "start", "await", "cleanup", "verify"]}
          explanation={"Сценарий остаётся наблюдаемым от создания работы до автоматизированной проверки."}
        />
        <TerminalDemo
          title={"контрольный запуск"}
          lines={[
            { cmd: "python -m async_lab.demo" },
            { out: "operation started" },
            { out: "controlled outcome observed" },
            { out: "cleanup completed" },
          ]}
        />

        <Callout tone="info">
          <strong>{"Проверка."}</strong> {" Объясните, что сейчас только создаётся, что уже выполняется, где coroutine отдаёт управление и какой исход наблюдает caller."}
        </Callout>
      </Section>

      <Section number={"08"} title={"Контрольная точка"}>
        <Lead>
          {"Ученик объясняет путь coroutine → Task → await → result или exception и показывает его запускаемым примером."}
        </Lead>

        <div className="lesson-practice-steps">
          <h3>{"Главная модель"}</h3>
          <p>{"Ссылка на Task нужна для await, cancel и диагностики."}</p>
          <h3>{"Контролируемое изменение"}</h3>
          <p>{"Измените delay, порядок входов, timeout или concurrency limit. Сначала запишите прогноз, затем запустите пример."}</p>
          <h3>{"Профессиональная граница"}</h3>
          <p>{"Следующий урок заменит ручное ожидание группы на gather."}</p>
        </div>


        <div className="lesson-check-group">
          <QuizCard
            question={"Какой механизм является центральным в этом уроке?"}
            options={["Контрольная точка", "случайный print", "новый OS process"]}
            correctIndex={0}
            explanation={"Контрольная точка — это часть наблюдаемого async-контракта."}
          />
          <QuizCard
            question={"Что должен наблюдать caller?"}
            options={["result, error либо cancellation по явному контракту", "случайный print", "новый OS process"]}
            correctIndex={0}
            explanation={"result, error либо cancellation по явному контракту — это часть наблюдаемого async-контракта."}
          />
          <QuizCard
            question={"Что нельзя скрывать пустым fallback?"}
            options={["причину сбоя и критичность источника", "случайный print", "новый OS process"]}
            correctIndex={0}
            explanation={"причину сбоя и критичность источника — это часть наблюдаемого async-контракта."}
          />
          <QuizCard
            question={"Что проверяется перед следующим уроком?"}
            options={["успешный, ошибочный и граничный сценарий", "случайный print", "новый OS process"]}
            correctIndex={0}
            explanation={"успешный, ошибочный и граничный сценарий — это часть наблюдаемого async-контракта."}
          />
        </div>

        <KeyTakeaways
          points={[
            <>Async-механизм вводится после понятной проблемы ожидания.</>,
            <>Точки <code>await</code> определяют кооперативное переключение.</>,
            <>Результат, ошибка, timeout и cancellation не смешиваются.</>,
            <>Cleanup должен выполняться при любом исходе.</>,
            <>Конкурентность ограничивается по capacity зависимости.</>,
            <>Измерения и тесты важнее предположений о скорости.</>,
            <>Сквозной async-lab остаётся независимым от FastAPI до блока 27.</>,
          ]}
        />

        <PracticeCta text={"Доработайте async-lab по сценарию урока, добавьте прогноз до запуска, успешный и ошибочный тест, обновите README и сделайте один осмысленный Git-коммит."} />
      </Section>

    </RichLesson>
  );
}

// 148. asyncio.gather и сбор результатов
export function Lesson148({ module }: { module?: string }) {
  return (
    <RichLesson>
      <RichHero
        variant="project"
        chip={module ?? BLOCK_TITLE}
        title={"asyncio.gather и сбор результатов"}
        intro={"Научимся ожидать группу независимых операций, различать порядок завершения и порядок результатов, измерять конкурентный запуск и выбирать политику исключений."}
        tags={[
          { icon: <Layers size={14} />, label: "gather · result order" },
          { icon: <ListChecks size={14} />, label: "success и exceptions" },
        ]}
      />
      <TheoryBridge lesson={148} />

      <Section number={"01"} title={"Почему ручных await становится много"}>
        <Lead>
          {"Dashboard StudyHub собирает user, tasks и stats. Ручные переменные работают, но плохо масштабируют число независимых источников."}
        </Lead>

        <div className="lesson-practice-steps">
          <h3>{"Главная модель"}</h3>
          <p>{"gather выражает одну группу awaitable."}</p>
          <h3>{"Контролируемое изменение"}</h3>
          <p>{"Измените delay, порядок входов, timeout или concurrency limit. Сначала запишите прогноз, затем запустите пример."}</p>
          <h3>{"Профессиональная граница"}</h3>
          <p>{"Зависимые операции всё равно должны оставаться последовательными."}</p>
        </div>

        <CodeBlock
          caption={"пример 148.1"}
          code={"user, tasks, stats = await asyncio.gather(\n    load_user(7),\n    load_tasks(7),\n    load_stats(7),\n)"}
        />

        <CompareSolutions
          question={"Какой подход точнее выражает модель раздела?"}
          left={{
            title: "Скрытый или последовательный подход",
            code: "# работа запускается без явного управления",
            note: "Граница жизненного цикла и ошибки плохо видна.",
          }}
          right={{
            title: "Явный async-контракт",
            code: "user, tasks, stats = await asyncio.gather(\n    load_user(7),\n    load_tasks(7),\n    load_stats(7),\n)",
            note: "Видны операция, ожидание и форма результата.",
          }}
          preferred="right"
          explanation={"Профессиональный код показывает, кто создаёт работу, кто её ожидает и что происходит при сбое."}
        />

        <MethodGrid
          rows={[
            [<>problem</>, "назвать ограничение старого подхода"],
            [<>mechanism</>, "проследить управление и состояние"],
            [<>failure</>, "воспроизвести ожидаемый сбой"],
            [<>evidence</>, "подтвердить вывод запуском и тестом"],
          ]}
        />

        <Callout tone="info">
          <strong>{"Проверка."}</strong> {" Объясните, что сейчас только создаётся, что уже выполняется, где coroutine отдаёт управление и какой исход наблюдает caller."}
        </Callout>
      </Section>

      <Section number={"02"} title={"Как gather запускает coroutine"}>
        <Lead>
          {"Переданные coroutine автоматически планируются и получают возможность продвигаться конкурентно."}
        </Lead>

        <div className="lesson-practice-steps">
          <h3>{"Главная модель"}</h3>
          <p>{"Один await ждёт координированный исход всей группы."}</p>
          <h3>{"Контролируемое изменение"}</h3>
          <p>{"Измените delay, порядок входов, timeout или concurrency limit. Сначала запишите прогноз, затем запустите пример."}</p>
          <h3>{"Профессиональная граница"}</h3>
          <p>{"Gather не создаёт OS processes."}</p>
        </div>

        <CodeBlock
          caption={"пример 148.2"}
          code={"results = await asyncio.gather(\n    load_user(),\n    load_tasks(),\n    load_stats(),\n)"}
        />

        <TypeCards>
          <TypeCard badge="вход" title="Что получает механизм" code={"results = await asyncio.gather("}>
            Операция, configuration или awaitable передаются явно.
          </TypeCard>
          <TypeCard badge="жизненный цикл" badgeTone="float" title="Что делает event loop" code="scheduled → waiting → done">
            Loop продвигает готовые coroutine в точках кооперативного ожидания.
          </TypeCard>
          <TypeCard badge="исход" badgeTone="str" title="Что получает caller" code="result | error | cancellation">
            Результат должен иметь наблюдаемую и проверяемую форму.
          </TypeCard>
        </TypeCards>
        <TrueFalse
          statement={<>Asyncio автоматически делает любую операцию параллельной на нескольких CPU.</>}
          isTrue={false}
          explanation={"Asyncio предназначен прежде всего для конкурентного I/O и не превращает CPU-bound код в параллельный."}
        />

        <Callout tone="info">
          <strong>{"Проверка."}</strong> {" Объясните, что сейчас только создаётся, что уже выполняется, где coroutine отдаёт управление и какой исход наблюдает caller."}
        </Callout>
      </Section>

      <Section number={"03"} title={"Порядок завершения и порядок результата"}>
        <Lead>
          {"Быстрый stats может завершиться первым, но остаётся третьим элементом результата."}
        </Lead>

        <div className="lesson-practice-steps">
          <h3>{"Главная модель"}</h3>
          <p>{"Позиция результата соответствует позиции входного awaitable."}</p>
          <h3>{"Контролируемое изменение"}</h3>
          <p>{"Измените delay, порядок входов, timeout или concurrency limit. Сначала запишите прогноз, затем запустите пример."}</p>
          <h3>{"Профессиональная граница"}</h3>
          <p>{"Нельзя сортировать результаты и ломать позиционный контракт."}</p>
        </div>

        <CodeBlock
          caption={"пример 148.3"}
          code={"result = await asyncio.gather(\n    load(\"slow\", 0.3),\n    load(\"fast\", 0.1),\n    load(\"middle\", 0.2),\n)"}
        />

        <PredictOutput
          code={"result = await asyncio.gather(\n    load(\"slow\", 0.3),\n    load(\"fast\", 0.1),\n    load(\"middle\", 0.2),\n)"}
          output={"Порядок определяется точками await и задержками; итоговый результат сохраняет объявленный контракт."}
          hint={"Сначала найдите все точки await, затем сравните длительности и порядок входов."}
        />
        <MethodGrid
          rows={[
            [<>создание</>, "работа становится доступной event loop"],
            [<>ожидание</>, "текущая coroutine отдаёт управление"],
            [<>завершение</>, "результат или исключение сохраняется"],
            [<>наблюдение</>, "caller получает исход через await"],
          ]}
        />

        <Callout tone="info">
          <strong>{"Проверка."}</strong> {" Объясните, что сейчас только создаётся, что уже выполняется, где coroutine отдаёт управление и какой исход наблюдает caller."}
        </Callout>
      </Section>

      <Section number={"04"} title={"Sequential против concurrent timing"}>
        <Lead>
          {"Последовательное время близко к сумме ожиданий, конкурентное — к максимальной задержке плюс накладные расходы."}
        </Lead>

        <div className="lesson-practice-steps">
          <h3>{"Главная модель"}</h3>
          <p>{"Производительность подтверждается измерением perf_counter."}</p>
          <h3>{"Контролируемое изменение"}</h3>
          <p>{"Измените delay, порядок входов, timeout или concurrency limit. Сначала запишите прогноз, затем запустите пример."}</p>
          <h3>{"Профессиональная граница"}</h3>
          <p>{"Async не ускоряет CPU-bound работу автоматически."}</p>
        </div>

        <CodeBlock
          caption={"пример 148.4"}
          code={"async def sequential():\n    return [await load_a(), await load_b()]\n\nasync def concurrent():\n    return await asyncio.gather(load_a(), load_b())"}
        />

        <StepThrough
          code={"async def sequential():\n    return [await load_a(), await load_b()]\n\nasync def concurrent():\n    return await asyncio.gather(load_a(), load_b())"}
          steps={[
            { line: 0, note: "Создаётся или настраивается async-операция.", vars: { этап: "start" } },
            { line: 1, note: "Event loop получает точку для переключения.", vars: { состояние: "waiting" } },
            { line: 4, note: "Caller получает результат либо отдельный сбой.", vars: { этап: "observed outcome" } },
          ]}
        />
        <RecallCard
          question={"Где в этом примере находится точка передачи управления event loop?"}
          answer={<p>В выражении с await. До него выполняется обычный синхронный участок текущей coroutine.</p>}
        />

        <Callout tone="info">
          <strong>{"Проверка."}</strong> {" Объясните, что сейчас только создаётся, что уже выполняется, где coroutine отдаёт управление и какой исход наблюдает caller."}
        </Callout>
      </Section>

      <Section number={"05"} title={"Первое исключение в gather"}>
        <Lead>
          {"По умолчанию первое исключение передаётся caller. Остальные awaitable не обязаны автоматически отмениться."}
        </Lead>

        <div className="lesson-practice-steps">
          <h3>{"Главная модель"}</h3>
          <p>{"Fail-fast полезен для атомарного обязательного результата."}</p>
          <h3>{"Контролируемое изменение"}</h3>
          <p>{"Измените delay, порядок входов, timeout или concurrency limit. Сначала запишите прогноз, затем запустите пример."}</p>
          <h3>{"Профессиональная граница"}</h3>
          <p>{"Пустой fallback скрывает источник и причину ошибки."}</p>
        </div>

        <CodeBlock
          caption={"пример 148.5"}
          code={"try:\n    user, tasks = await asyncio.gather(\n        load_user(),\n        load_tasks(),\n    )\nexcept RuntimeError:\n    raise"}
        />

        <BugHunt
          code={"try:\n    user, tasks = await asyncio.gather(\n        load_user(),\n        load_tasks(),\n    )\nexcept RuntimeError:\n    raise"}
          question={"Какой контракт чаще всего нарушают при неосторожной обработке этого кода?"}
          options={[
            "Теряется наблюдаемость результата, ошибки или cleanup",
            "Python запрещает несколько async-функций",
            "Event loop всегда создаёт новый process",
          ]}
          correctIndex={0}
          explanation={"Async-код должен сохранять жизненный цикл операции и явно обрабатывать ожидаемый исход."}
          fix={"try:\n    user, tasks = await asyncio.gather(\n        load_user(),\n        load_tasks(),\n    )\nexcept RuntimeError:\n    raise"}
        />
        <Callout>
          Не исправляйте async-проблему широким <code>except</code> и пустым значением: сначала назовите нарушенный контракт.
        </Callout>

        <Callout tone="info">
          <strong>{"Проверка."}</strong> {" Объясните, что сейчас только создаётся, что уже выполняется, где coroutine отдаёт управление и какой исход наблюдает caller."}
        </Callout>
      </Section>

      <Section number={"06"} title={"return_exceptions=True"}>
        <Lead>
          {"Exception может стать элементом списка на своей позиции, но caller обязан его классифицировать."}
        </Lead>

        <div className="lesson-practice-steps">
          <h3>{"Главная модель"}</h3>
          <p>{"Техническая возможность частичного результата не определяет его предметную допустимость."}</p>
          <h3>{"Контролируемое изменение"}</h3>
          <p>{"Измените delay, порядок входов, timeout или concurrency limit. Сначала запишите прогноз, затем запустите пример."}</p>
          <h3>{"Профессиональная граница"}</h3>
          <p>{"Обязательный user нельзя молча заменить пустым значением."}</p>
        </div>

        <CodeBlock
          caption={"пример 148.6"}
          code={"results = await asyncio.gather(\n    load_user(),\n    load_recommendations(),\n    return_exceptions=True,\n)"}
        />

        <BranchExplorer
          code={"return_exceptions=True\n├─ success → result\n├─ expected failure → explicit policy\n├─ timeout/cancel → cleanup\n└─ unexpected defect → visible error"}
          scenarios={[
            { label: "успех", activeLine: 1, output: "возвращается ожидаемый результат" },
            { label: "ожидаемый сбой", activeLine: 2, output: "применяется локальная policy" },
            { label: "отмена", activeLine: 3, output: "выполняется cleanup" },
          ]}
        />
        <MatchPairs
          prompt={"Соедините исход с действием caller."}
          pairs={[
            { left: "success", right: "использовать данные" },
            { left: "timeout", right: "вернуть явный degraded status" },
            { left: "cancellation", right: "завершить cleanup и сохранить отмену" },
            { left: "unexpected defect", right: "не маскировать пустым fallback" },
          ]}
          explanation={"Политика зависит от критичности конкретной операции."}
        />

        <Callout tone="info">
          <strong>{"Проверка."}</strong> {" Объясните, что сейчас только создаётся, что уже выполняется, где coroutine отдаёт управление и какой исход наблюдает caller."}
        </Callout>
      </Section>

      <Section number={"07"} title={"Dashboard и тест порядка"}>
        <Lead>
          {"User, tasks и stats распаковываются по позициям. Тесты меняют delay и подтверждают стабильное сопоставление."}
        </Lead>

        <div className="lesson-practice-steps">
          <h3>{"Главная модель"}</h3>
          <p>{"Имена источников можно объединить с результатами через zip."}</p>
          <h3>{"Контролируемое изменение"}</h3>
          <p>{"Измените delay, порядок входов, timeout или concurrency limit. Сначала запишите прогноз, затем запустите пример."}</p>
          <h3>{"Профессиональная граница"}</h3>
          <p>{"Timing-тест должен иметь запас для медленной среды."}</p>
        </div>

        <CodeBlock
          caption={"пример 148.7"}
          code={"dashboard = await load_dashboard(7)\nassert dashboard[\"user\"][\"id\"] == 7\nassert isinstance(dashboard[\"tasks\"], list)\nassert \"done\" in dashboard[\"stats\"]"}
        />

        <CodeSequence
          title={"Соберите безопасный async-сценарий"}
          prompt={"Расположите шаги от configuration до проверки исхода."}
          pieces={[
            { id: "prepare", code: "подготовить operation и configuration" },
            { id: "start", code: "создать или запланировать awaitable" },
            { id: "await", code: "дождаться результата по явной policy" },
            { id: "cleanup", code: "гарантировать cleanup при сбое" },
            { id: "verify", code: "проверить result, error и state" },
          ]}
          correctOrder={["prepare", "start", "await", "cleanup", "verify"]}
          explanation={"Сценарий остаётся наблюдаемым от создания работы до автоматизированной проверки."}
        />
        <TerminalDemo
          title={"контрольный запуск"}
          lines={[
            { cmd: "python -m async_lab.demo" },
            { out: "operation started" },
            { out: "controlled outcome observed" },
            { out: "cleanup completed" },
          ]}
        />

        <Callout tone="info">
          <strong>{"Проверка."}</strong> {" Объясните, что сейчас только создаётся, что уже выполняется, где coroutine отдаёт управление и какой исход наблюдает caller."}
        </Callout>
      </Section>

      <Section number={"08"} title={"Контрольная точка"}>
        <Lead>
          {"Ученик объясняет result order, конкурентное время и две политики ошибок gather."}
        </Lead>

        <div className="lesson-practice-steps">
          <h3>{"Главная модель"}</h3>
          <p>{"Gather — coordination point, а не обработчик всех предметных сбоев."}</p>
          <h3>{"Контролируемое изменение"}</h3>
          <p>{"Измените delay, порядок входов, timeout или concurrency limit. Сначала запишите прогноз, затем запустите пример."}</p>
          <h3>{"Профессиональная граница"}</h3>
          <p>{"Следующий урок добавит временной бюджет."}</p>
        </div>


        <div className="lesson-check-group">
          <QuizCard
            question={"Какой механизм является центральным в этом уроке?"}
            options={["Контрольная точка", "случайный print", "новый OS process"]}
            correctIndex={0}
            explanation={"Контрольная точка — это часть наблюдаемого async-контракта."}
          />
          <QuizCard
            question={"Что должен наблюдать caller?"}
            options={["result, error либо cancellation по явному контракту", "случайный print", "новый OS process"]}
            correctIndex={0}
            explanation={"result, error либо cancellation по явному контракту — это часть наблюдаемого async-контракта."}
          />
          <QuizCard
            question={"Что нельзя скрывать пустым fallback?"}
            options={["причину сбоя и критичность источника", "случайный print", "новый OS process"]}
            correctIndex={0}
            explanation={"причину сбоя и критичность источника — это часть наблюдаемого async-контракта."}
          />
          <QuizCard
            question={"Что проверяется перед следующим уроком?"}
            options={["успешный, ошибочный и граничный сценарий", "случайный print", "новый OS process"]}
            correctIndex={0}
            explanation={"успешный, ошибочный и граничный сценарий — это часть наблюдаемого async-контракта."}
          />
        </div>

        <KeyTakeaways
          points={[
            <>Async-механизм вводится после понятной проблемы ожидания.</>,
            <>Точки <code>await</code> определяют кооперативное переключение.</>,
            <>Результат, ошибка, timeout и cancellation не смешиваются.</>,
            <>Cleanup должен выполняться при любом исходе.</>,
            <>Конкурентность ограничивается по capacity зависимости.</>,
            <>Измерения и тесты важнее предположений о скорости.</>,
            <>Сквозной async-lab остаётся независимым от FastAPI до блока 27.</>,
          ]}
        />

        <PracticeCta text={"Доработайте async-lab по сценарию урока, добавьте прогноз до запуска, успешный и ошибочный тест, обновите README и сделайте один осмысленный Git-коммит."} />
      </Section>

    </RichLesson>
  );
}

// 149. Timeout через asyncio.wait_for
export function Lesson149({ module }: { module?: string }) {
  return (
    <RichLesson>
      <RichHero
        variant="project"
        chip={module ?? BLOCK_TITLE}
        title={"Timeout через asyncio.wait_for"}
        intro={"Ограничим время внешней операции: wait_for, TimeoutError, отмена внутренней coroutine, fallback и различие локального и общего бюджета."}
        tags={[
          { icon: <TimerReset size={14} />, label: "wait_for · TimeoutError" },
          { icon: <Clock3 size={14} />, label: "deadline и fallback" },
        ]}
      />
      <TheoryBridge lesson={149} />

      <Section number={"01"} title={"Зачем нужен временной бюджет"}>
        <Lead>
          {"Пользователь не должен ждать рекомендации бесконечно. Для каждого источника задаётся максимально допустимое ожидание."}
        </Lead>

        <div className="lesson-practice-steps">
          <h3>{"Главная модель"}</h3>
          <p>{"Deadline является частью контракта интеграции."}</p>
          <h3>{"Контролируемое изменение"}</h3>
          <p>{"Измените delay, порядок входов, timeout или concurrency limit. Сначала запишите прогноз, затем запустите пример."}</p>
          <h3>{"Профессиональная граница"}</h3>
          <p>{"Большой timeout тоже удерживает ресурсы."}</p>
        </div>

        <CodeBlock
          caption={"пример 149.1"}
          code={"result = await asyncio.wait_for(\n    load_recommendations(7),\n    timeout=0.3,\n)"}
        />

        <BranchExplorer
          code={"Зачем нужен временной бюджет\n├─ success → result\n├─ expected failure → explicit policy\n├─ timeout/cancel → cleanup\n└─ unexpected defect → visible error"}
          scenarios={[
            { label: "успех", activeLine: 1, output: "возвращается ожидаемый результат" },
            { label: "ожидаемый сбой", activeLine: 2, output: "применяется локальная policy" },
            { label: "отмена", activeLine: 3, output: "выполняется cleanup" },
          ]}
        />
        <MatchPairs
          prompt={"Соедините исход с действием caller."}
          pairs={[
            { left: "success", right: "использовать данные" },
            { left: "timeout", right: "вернуть явный degraded status" },
            { left: "cancellation", right: "завершить cleanup и сохранить отмену" },
            { left: "unexpected defect", right: "не маскировать пустым fallback" },
          ]}
          explanation={"Политика зависит от критичности конкретной операции."}
        />

        <MethodGrid
          rows={[
            [<>problem</>, "назвать ограничение старого подхода"],
            [<>mechanism</>, "проследить управление и состояние"],
            [<>failure</>, "воспроизвести ожидаемый сбой"],
            [<>evidence</>, "подтвердить вывод запуском и тестом"],
          ]}
        />

        <Callout tone="info">
          <strong>{"Проверка."}</strong> {" Объясните, что сейчас только создаётся, что уже выполняется, где coroutine отдаёт управление и какой исход наблюдает caller."}
        </Callout>
      </Section>

      <Section number={"02"} title={"Минимальная модель wait_for"}>
        <Lead>
          {"Wait_for возвращает исходный результат при успехе либо инициирует отмену и поднимает TimeoutError."}
        </Lead>

        <div className="lesson-practice-steps">
          <h3>{"Главная модель"}</h3>
          <p>{"Awaitable и timeout передаются явно."}</p>
          <h3>{"Контролируемое изменение"}</h3>
          <p>{"Измените delay, порядок входов, timeout или concurrency limit. Сначала запишите прогноз, затем запустите пример."}</p>
          <h3>{"Профессиональная граница"}</h3>
          <p>{"В Python 3.10 встречается asyncio.TimeoutError."}</p>
        </div>

        <CodeBlock
          caption={"пример 149.2"}
          code={"try:\n    data = await asyncio.wait_for(source(), 0.3)\nexcept asyncio.TimeoutError:\n    data = []"}
        />

        <TypeCards>
          <TypeCard badge="вход" title="Что получает механизм" code={"try:"}>
            Операция, configuration или awaitable передаются явно.
          </TypeCard>
          <TypeCard badge="жизненный цикл" badgeTone="float" title="Что делает event loop" code="scheduled → waiting → done">
            Loop продвигает готовые coroutine в точках кооперативного ожидания.
          </TypeCard>
          <TypeCard badge="исход" badgeTone="str" title="Что получает caller" code="result | error | cancellation">
            Результат должен иметь наблюдаемую и проверяемую форму.
          </TypeCard>
        </TypeCards>
        <TrueFalse
          statement={<>Asyncio автоматически делает любую операцию параллельной на нескольких CPU.</>}
          isTrue={false}
          explanation={"Asyncio предназначен прежде всего для конкурентного I/O и не превращает CPU-bound код в параллельный."}
        />

        <Callout tone="info">
          <strong>{"Проверка."}</strong> {" Объясните, что сейчас только создаётся, что уже выполняется, где coroutine отдаёт управление и какой исход наблюдает caller."}
        </Callout>
      </Section>

      <Section number={"03"} title={"Timeout использует cancellation"}>
        <Lead>
          {"При исчерпании бюджета внутренняя coroutine получает отмену и выполняет finally."}
        </Lead>

        <div className="lesson-practice-steps">
          <h3>{"Главная модель"}</h3>
          <p>{"Caller получает TimeoutError после завершения cancellation path."}</p>
          <h3>{"Контролируемое изменение"}</h3>
          <p>{"Измените delay, порядок входов, timeout или concurrency limit. Сначала запишите прогноз, затем запустите пример."}</p>
          <h3>{"Профессиональная граница"}</h3>
          <p>{"Wall-clock время может немного превысить budget из-за cleanup."}</p>
        </div>

        <CodeBlock
          caption={"пример 149.3"}
          code={"async def source(events):\n    events.append(\"open\")\n    try:\n        await asyncio.sleep(10)\n    finally:\n        events.append(\"close\")"}
        />

        <StepThrough
          code={"async def source(events):\n    events.append(\"open\")\n    try:\n        await asyncio.sleep(10)\n    finally:\n        events.append(\"close\")"}
          steps={[
            { line: 0, note: "Создаётся или настраивается async-операция.", vars: { этап: "start" } },
            { line: 1, note: "Event loop получает точку для переключения.", vars: { состояние: "waiting" } },
            { line: 5, note: "Caller получает результат либо отдельный сбой.", vars: { этап: "observed outcome" } },
          ]}
        />
        <RecallCard
          question={"Где в этом примере находится точка передачи управления event loop?"}
          answer={<p>В выражении с await. До него выполняется обычный синхронный участок текущей coroutine.</p>}
        />

        <Callout tone="info">
          <strong>{"Проверка."}</strong> {" Объясните, что сейчас только создаётся, что уже выполняется, где coroutine отдаёт управление и какой исход наблюдает caller."}
        </Callout>
      </Section>

      <Section number={"04"} title={"Локальный и общий timeout"}>
        <Lead>
          {"Можно ограничить один optional source либо всю gather-группу. Это разные границы отказа."}
        </Lead>

        <div className="lesson-practice-steps">
          <h3>{"Главная модель"}</h3>
          <p>{"Локальный timeout сохраняет независимые полезные данные."}</p>
          <h3>{"Контролируемое изменение"}</h3>
          <p>{"Измените delay, порядок входов, timeout или concurrency limit. Сначала запишите прогноз, затем запустите пример."}</p>
          <h3>{"Профессиональная граница"}</h3>
          <p>{"Общий timeout подходит только для атомарного результата."}</p>
        </div>

        <CodeBlock
          caption={"пример 149.4"}
          code={"optional = await asyncio.wait_for(\n    load_optional(),\n    timeout=0.4,\n)"}
        />

        <CompareSolutions
          question={"Какой подход точнее выражает модель раздела?"}
          left={{
            title: "Скрытый или последовательный подход",
            code: "# работа запускается без явного управления",
            note: "Граница жизненного цикла и ошибки плохо видна.",
          }}
          right={{
            title: "Явный async-контракт",
            code: "optional = await asyncio.wait_for(\n    load_optional(),\n    timeout=0.4,\n)",
            note: "Видны операция, ожидание и форма результата.",
          }}
          preferred="right"
          explanation={"Профессиональный код показывает, кто создаёт работу, кто её ожидает и что происходит при сбое."}
        />

        <Callout tone="info">
          <strong>{"Проверка."}</strong> {" Объясните, что сейчас только создаётся, что уже выполняется, где coroutine отдаёт управление и какой исход наблюдает caller."}
        </Callout>
      </Section>

      <Section number={"05"} title={"Timeout не равен retry"}>
        <Lead>
          {"Timeout отвечает, сколько ждать попытку. Retry решает, запускать ли новую попытку после определённого сбоя."}
        </Lead>

        <div className="lesson-practice-steps">
          <h3>{"Главная модель"}</h3>
          <p>{"Retry требует лимита, backoff и общего deadline."}</p>
          <h3>{"Контролируемое изменение"}</h3>
          <p>{"Измените delay, порядок входов, timeout или concurrency limit. Сначала запишите прогноз, затем запустите пример."}</p>
          <h3>{"Профессиональная граница"}</h3>
          <p>{"Бесконечный цикл повторов усиливает проблему зависимости."}</p>
        </div>

        <CodeBlock
          caption={"пример 149.5"}
          code={"async def safe_load():\n    try:\n        return await asyncio.wait_for(load_data(), 0.2)\n    except asyncio.TimeoutError:\n        return {\"status\": \"timeout\", \"data\": None}"}
        />

        <BugHunt
          code={"async def safe_load():\n    try:\n        return await asyncio.wait_for(load_data(), 0.2)\n    except asyncio.TimeoutError:\n        return {\"status\": \"timeout\", \"data\": None}"}
          question={"Какой контракт чаще всего нарушают при неосторожной обработке этого кода?"}
          options={[
            "Теряется наблюдаемость результата, ошибки или cleanup",
            "Python запрещает несколько async-функций",
            "Event loop всегда создаёт новый process",
          ]}
          correctIndex={0}
          explanation={"Async-код должен сохранять жизненный цикл операции и явно обрабатывать ожидаемый исход."}
          fix={"async def safe_load():\n    try:\n        return await asyncio.wait_for(load_data(), 0.2)\n    except asyncio.TimeoutError:\n        return {\"status\": \"timeout\", \"data\": None}"}
        />
        <Callout>
          Не исправляйте async-проблему широким <code>except</code> и пустым значением: сначала назовите нарушенный контракт.
        </Callout>

        <Callout tone="info">
          <strong>{"Проверка."}</strong> {" Объясните, что сейчас только создаётся, что уже выполняется, где coroutine отдаёт управление и какой исход наблюдает caller."}
        </Callout>
      </Section>

      <Section number={"06"} title={"Fallback рекомендаций"}>
        <Lead>
          {"Optional recommendations возвращают status success, timeout или error. Основной профиль остаётся полезным."}
        </Lead>

        <div className="lesson-practice-steps">
          <h3>{"Главная модель"}</h3>
          <p>{"Fallback сообщает качество результата, а не притворяется успехом."}</p>
          <h3>{"Контролируемое изменение"}</h3>
          <p>{"Измените delay, порядок входов, timeout или concurrency limit. Сначала запишите прогноз, затем запустите пример."}</p>
          <h3>{"Профессиональная граница"}</h3>
          <p>{"Unexpected defects не превращаются в пустой список."}</p>
        </div>

        <CodeBlock
          caption={"пример 149.6"}
          code={"return {\n    \"status\": \"timeout\",\n    \"items\": [],\n    \"message\": \"deadline exceeded\",\n}"}
        />

        <BranchExplorer
          code={"Fallback рекомендаций\n├─ success → result\n├─ expected failure → explicit policy\n├─ timeout/cancel → cleanup\n└─ unexpected defect → visible error"}
          scenarios={[
            { label: "успех", activeLine: 1, output: "возвращается ожидаемый результат" },
            { label: "ожидаемый сбой", activeLine: 2, output: "применяется локальная policy" },
            { label: "отмена", activeLine: 3, output: "выполняется cleanup" },
          ]}
        />
        <MatchPairs
          prompt={"Соедините исход с действием caller."}
          pairs={[
            { left: "success", right: "использовать данные" },
            { left: "timeout", right: "вернуть явный degraded status" },
            { left: "cancellation", right: "завершить cleanup и сохранить отмену" },
            { left: "unexpected defect", right: "не маскировать пустым fallback" },
          ]}
          explanation={"Политика зависит от критичности конкретной операции."}
        />

        <Callout tone="info">
          <strong>{"Проверка."}</strong> {" Объясните, что сейчас только создаётся, что уже выполняется, где coroutine отдаёт управление и какой исход наблюдает caller."}
        </Callout>
      </Section>

      <Section number={"07"} title={"Тест success, timeout и cleanup"}>
        <Lead>
          {"Fake source получает delay. Тест проверяет TimeoutError и события open/close."}
        </Lead>

        <div className="lesson-practice-steps">
          <h3>{"Главная модель"}</h3>
          <p>{"Контролируемая задержка делает сценарий воспроизводимым."}</p>
          <h3>{"Контролируемое изменение"}</h3>
          <p>{"Измените delay, порядок входов, timeout или concurrency limit. Сначала запишите прогноз, затем запустите пример."}</p>
          <h3>{"Профессиональная граница"}</h3>
          <p>{"Проверяется не только ответ, но и освобождение ресурса."}</p>
        </div>

        <CodeBlock
          caption={"пример 149.7"}
          code={"with pytest.raises(asyncio.TimeoutError):\n    await asyncio.wait_for(\n        fake_source(1.0, events),\n        timeout=0.01,\n    )\nassert events == [\"open\", \"close\"]"}
        />

        <CodeSequence
          title={"Соберите безопасный async-сценарий"}
          prompt={"Расположите шаги от configuration до проверки исхода."}
          pieces={[
            { id: "prepare", code: "подготовить operation и configuration" },
            { id: "start", code: "создать или запланировать awaitable" },
            { id: "await", code: "дождаться результата по явной policy" },
            { id: "cleanup", code: "гарантировать cleanup при сбое" },
            { id: "verify", code: "проверить result, error и state" },
          ]}
          correctOrder={["prepare", "start", "await", "cleanup", "verify"]}
          explanation={"Сценарий остаётся наблюдаемым от создания работы до автоматизированной проверки."}
        />
        <TerminalDemo
          title={"контрольный запуск"}
          lines={[
            { cmd: "python -m async_lab.demo" },
            { out: "operation started" },
            { out: "controlled outcome observed" },
            { out: "cleanup completed" },
          ]}
        />

        <Callout tone="info">
          <strong>{"Проверка."}</strong> {" Объясните, что сейчас только создаётся, что уже выполняется, где coroutine отдаёт управление и какой исход наблюдает caller."}
        </Callout>
      </Section>

      <Section number={"08"} title={"Контрольная точка"}>
        <Lead>
          {"Ученик объясняет wait_for → cancellation → finally → TimeoutError и выбирает правильную границу бюджета."}
        </Lead>

        <div className="lesson-practice-steps">
          <h3>{"Главная модель"}</h3>
          <p>{"Timeout, retry и fallback решают разные задачи."}</p>
          <h3>{"Контролируемое изменение"}</h3>
          <p>{"Измените delay, порядок входов, timeout или concurrency limit. Сначала запишите прогноз, затем запустите пример."}</p>
          <h3>{"Профессиональная граница"}</h3>
          <p>{"Следующий урок разбирает cancellation напрямую."}</p>
        </div>


        <div className="lesson-check-group">
          <QuizCard
            question={"Какой механизм является центральным в этом уроке?"}
            options={["Контрольная точка", "случайный print", "новый OS process"]}
            correctIndex={0}
            explanation={"Контрольная точка — это часть наблюдаемого async-контракта."}
          />
          <QuizCard
            question={"Что должен наблюдать caller?"}
            options={["result, error либо cancellation по явному контракту", "случайный print", "новый OS process"]}
            correctIndex={0}
            explanation={"result, error либо cancellation по явному контракту — это часть наблюдаемого async-контракта."}
          />
          <QuizCard
            question={"Что нельзя скрывать пустым fallback?"}
            options={["причину сбоя и критичность источника", "случайный print", "новый OS process"]}
            correctIndex={0}
            explanation={"причину сбоя и критичность источника — это часть наблюдаемого async-контракта."}
          />
          <QuizCard
            question={"Что проверяется перед следующим уроком?"}
            options={["успешный, ошибочный и граничный сценарий", "случайный print", "новый OS process"]}
            correctIndex={0}
            explanation={"успешный, ошибочный и граничный сценарий — это часть наблюдаемого async-контракта."}
          />
        </div>

        <KeyTakeaways
          points={[
            <>Async-механизм вводится после понятной проблемы ожидания.</>,
            <>Точки <code>await</code> определяют кооперативное переключение.</>,
            <>Результат, ошибка, timeout и cancellation не смешиваются.</>,
            <>Cleanup должен выполняться при любом исходе.</>,
            <>Конкурентность ограничивается по capacity зависимости.</>,
            <>Измерения и тесты важнее предположений о скорости.</>,
            <>Сквозной async-lab остаётся независимым от FastAPI до блока 27.</>,
          ]}
        />

        <PracticeCta text={"Доработайте async-lab по сценарию урока, добавьте прогноз до запуска, успешный и ошибочный тест, обновите README и сделайте один осмысленный Git-коммит."} />
      </Section>

    </RichLesson>
  );
}

// 150. Cancellation и обязательная очистка
export function Lesson150({ module }: { module?: string }) {
  return (
    <RichLesson>
      <RichHero
        variant="project"
        chip={module ?? BLOCK_TITLE}
        title={"Cancellation и обязательная очистка"}
        intro={"Разберём отмену как нормальный исход Task: cancel request, CancelledError, cleanup в finally, повторный проброс и корректное ожидание отменённой задачи."}
        tags={[
          { icon: <AlertTriangle size={14} />, label: "cancel · CancelledError" },
          { icon: <ShieldCheck size={14} />, label: "finally и cleanup" },
        ]}
      />
      <TheoryBridge lesson={150} />

      <Section number={"01"} title={"Отмена как отдельный исход"}>
        <Lead>
          {"Пользователь может покинуть экран, а приложение начать shutdown. Долгая Task должна завершиться без утечки ресурсов."}
        </Lead>

        <div className="lesson-practice-steps">
          <h3>{"Главная модель"}</h3>
          <p>{"Cancellation не является успешным return."}</p>
          <h3>{"Контролируемое изменение"}</h3>
          <p>{"Измените delay, порядок входов, timeout или concurrency limit. Сначала запишите прогноз, затем запустите пример."}</p>
          <h3>{"Профессиональная граница"}</h3>
          <p>{"Операция должна сохранить инварианты при остановке."}</p>
        </div>

        <CodeBlock
          caption={"пример 150.1"}
          code={"task = asyncio.create_task(build_report())\ntask.cancel()\ntry:\n    await task\nexcept asyncio.CancelledError:\n    pass"}
        />

        <TypeCards>
          <TypeCard badge="вход" title="Что получает механизм" code={"task = asyncio.create_task(build_report())"}>
            Операция, configuration или awaitable передаются явно.
          </TypeCard>
          <TypeCard badge="жизненный цикл" badgeTone="float" title="Что делает event loop" code="scheduled → waiting → done">
            Loop продвигает готовые coroutine в точках кооперативного ожидания.
          </TypeCard>
          <TypeCard badge="исход" badgeTone="str" title="Что получает caller" code="result | error | cancellation">
            Результат должен иметь наблюдаемую и проверяемую форму.
          </TypeCard>
        </TypeCards>
        <TrueFalse
          statement={<>Asyncio автоматически делает любую операцию параллельной на нескольких CPU.</>}
          isTrue={false}
          explanation={"Asyncio предназначен прежде всего для конкурентного I/O и не превращает CPU-bound код в параллельный."}
        />

        <MethodGrid
          rows={[
            [<>problem</>, "назвать ограничение старого подхода"],
            [<>mechanism</>, "проследить управление и состояние"],
            [<>failure</>, "воспроизвести ожидаемый сбой"],
            [<>evidence</>, "подтвердить вывод запуском и тестом"],
          ]}
        />

        <Callout tone="info">
          <strong>{"Проверка."}</strong> {" Объясните, что сейчас только создаётся, что уже выполняется, где coroutine отдаёт управление и какой исход наблюдает caller."}
        </Callout>
      </Section>

      <Section number={"02"} title={"Cancel request не равен завершению"}>
        <Lead>
          {"После task.cancel() Task ещё должна получить CancelledError и выполнить cleanup."}
        </Lead>

        <div className="lesson-practice-steps">
          <h3>{"Главная модель"}</h3>
          <p>{"Coordinator обычно await-ит отменённую Task."}</p>
          <h3>{"Контролируемое изменение"}</h3>
          <p>{"Измените delay, порядок входов, timeout или concurrency limit. Сначала запишите прогноз, затем запустите пример."}</p>
          <h3>{"Профессиональная граница"}</h3>
          <p>{"Ссылку нельзя сразу терять."}</p>
        </div>

        <CodeBlock
          caption={"пример 150.2"}
          code={"task.cancel()\nprint(task.done())\nawait task"}
        />

        <StepThrough
          code={"task.cancel()\nprint(task.done())\nawait task"}
          steps={[
            { line: 0, note: "Создаётся или настраивается async-операция.", vars: { этап: "start" } },
            { line: 1, note: "Event loop получает точку для переключения.", vars: { состояние: "waiting" } },
            { line: 2, note: "Caller получает результат либо отдельный сбой.", vars: { этап: "observed outcome" } },
          ]}
        />
        <RecallCard
          question={"Где в этом примере находится точка передачи управления event loop?"}
          answer={<p>В выражении с await. До него выполняется обычный синхронный участок текущей coroutine.</p>}
        />

        <Callout tone="info">
          <strong>{"Проверка."}</strong> {" Объясните, что сейчас только создаётся, что уже выполняется, где coroutine отдаёт управление и какой исход наблюдает caller."}
        </Callout>
      </Section>

      <Section number={"03"} title={"Где доставляется CancelledError"}>
        <Lead>
          {"Кооперативная отмена обычно проявляется в точке await, где coroutine приостановлена."}
        </Lead>

        <div className="lesson-practice-steps">
          <h3>{"Главная модель"}</h3>
          <p>{"Код после прерванного await не выполняется."}</p>
          <h3>{"Контролируемое изменение"}</h3>
          <p>{"Измените delay, порядок входов, timeout или concurrency limit. Сначала запишите прогноз, затем запустите пример."}</p>
          <h3>{"Профессиональная граница"}</h3>
          <p>{"Синхронный CPU-loop без await плохо реагирует на cancellation."}</p>
        </div>

        <CodeBlock
          caption={"пример 150.3"}
          code={"try:\n    await asyncio.sleep(10)\nexcept asyncio.CancelledError:\n    print(\"cancel received\")\n    raise"}
        />

        <PredictOutput
          code={"try:\n    await asyncio.sleep(10)\nexcept asyncio.CancelledError:\n    print(\"cancel received\")\n    raise"}
          output={"Порядок определяется точками await и задержками; итоговый результат сохраняет объявленный контракт."}
          hint={"Сначала найдите все точки await, затем сравните длительности и порядок входов."}
        />
        <MethodGrid
          rows={[
            [<>создание</>, "работа становится доступной event loop"],
            [<>ожидание</>, "текущая coroutine отдаёт управление"],
            [<>завершение</>, "результат или исключение сохраняется"],
            [<>наблюдение</>, "caller получает исход через await"],
          ]}
        />

        <Callout tone="info">
          <strong>{"Проверка."}</strong> {" Объясните, что сейчас только создаётся, что уже выполняется, где coroutine отдаёт управление и какой исход наблюдает caller."}
        </Callout>
      </Section>

      <Section number={"04"} title={"Finally защищает ресурс"}>
        <Lead>
          {"Acquisition и release размещаются в try/finally или async context manager."}
        </Lead>

        <div className="lesson-practice-steps">
          <h3>{"Главная модель"}</h3>
          <p>{"Finally выполняется при success, error и cancellation."}</p>
          <h3>{"Контролируемое изменение"}</h3>
          <p>{"Измените delay, порядок входов, timeout или concurrency limit. Сначала запишите прогноз, затем запустите пример."}</p>
          <h3>{"Профессиональная граница"}</h3>
          <p>{"Cleanup должен быть небольшим и надёжным."}</p>
        </div>

        <CodeBlock
          caption={"пример 150.4"}
          code={"events.append(\"resource:open\")\ntry:\n    await long_operation()\nfinally:\n    events.append(\"resource:close\")"}
        />

        <CompareSolutions
          question={"Какой подход точнее выражает модель раздела?"}
          left={{
            title: "Скрытый или последовательный подход",
            code: "# работа запускается без явного управления",
            note: "Граница жизненного цикла и ошибки плохо видна.",
          }}
          right={{
            title: "Явный async-контракт",
            code: "events.append(\"resource:open\")\ntry:\n    await long_operation()\nfinally:\n    events.append(\"resource:close\")",
            note: "Видны операция, ожидание и форма результата.",
          }}
          preferred="right"
          explanation={"Профессиональный код показывает, кто создаёт работу, кто её ожидает и что происходит при сбое."}
        />

        <Callout tone="info">
          <strong>{"Проверка."}</strong> {" Объясните, что сейчас только создаётся, что уже выполняется, где coroutine отдаёт управление и какой исход наблюдает caller."}
        </Callout>
      </Section>

      <Section number={"05"} title={"Не проглатывать cancellation"}>
        <Lead>
          {"Worker может залогировать CancelledError, но обычно повторно поднимает его."}
        </Lead>

        <div className="lesson-practice-steps">
          <h3>{"Главная модель"}</h3>
          <p>{"Coordinator должен отличить cancelled от successful None."}</p>
          <h3>{"Контролируемое изменение"}</h3>
          <p>{"Измените delay, порядок входов, timeout или concurrency limit. Сначала запишите прогноз, затем запустите пример."}</p>
          <h3>{"Профессиональная граница"}</h3>
          <p>{"Широкий BaseException без raise ломает семантику."}</p>
        </div>

        <CodeBlock
          caption={"пример 150.5"}
          code={"except asyncio.CancelledError:\n    print(\"cancel received\")\n    raise"}
        />

        <BugHunt
          code={"except asyncio.CancelledError:\n    print(\"cancel received\")\n    raise"}
          question={"Какой контракт чаще всего нарушают при неосторожной обработке этого кода?"}
          options={[
            "Теряется наблюдаемость результата, ошибки или cleanup",
            "Python запрещает несколько async-функций",
            "Event loop всегда создаёт новый process",
          ]}
          correctIndex={0}
          explanation={"Async-код должен сохранять жизненный цикл операции и явно обрабатывать ожидаемый исход."}
          fix={"except asyncio.CancelledError:\n    print(\"cancel received\")\n    raise"}
        />
        <Callout>
          Не исправляйте async-проблему широким <code>except</code> и пустым значением: сначала назовите нарушенный контракт.
        </Callout>

        <Callout tone="info">
          <strong>{"Проверка."}</strong> {" Объясните, что сейчас только создаётся, что уже выполняется, где coroutine отдаёт управление и какой исход наблюдает caller."}
        </Callout>
      </Section>

      <Section number={"06"} title={"Cancel-and-wait helper"}>
        <Lead>
          {"Coordinator хранит Task, запрашивает отмену, await-ит её и признаёт CancelledError ожидаемым исходом."}
        </Lead>

        <div className="lesson-practice-steps">
          <h3>{"Главная модель"}</h3>
          <p>{"Worker отвечает за cleanup, coordinator — за orchestration."}</p>
          <h3>{"Контролируемое изменение"}</h3>
          <p>{"Измените delay, порядок входов, timeout или concurrency limit. Сначала запишите прогноз, затем запустите пример."}</p>
          <h3>{"Профессиональная граница"}</h3>
          <p>{"Helper не должен скрывать неожиданный RuntimeError."}</p>
        </div>

        <CodeBlock
          caption={"пример 150.6"}
          code={"async def cancel_and_wait(task):\n    task.cancel()\n    try:\n        await task\n    except asyncio.CancelledError:\n        pass"}
        />

        <CodeSequence
          title={"Соберите безопасный async-сценарий"}
          prompt={"Расположите шаги от configuration до проверки исхода."}
          pieces={[
            { id: "prepare", code: "подготовить operation и configuration" },
            { id: "start", code: "создать или запланировать awaitable" },
            { id: "await", code: "дождаться результата по явной policy" },
            { id: "cleanup", code: "гарантировать cleanup при сбое" },
            { id: "verify", code: "проверить result, error и state" },
          ]}
          correctOrder={["prepare", "start", "await", "cleanup", "verify"]}
          explanation={"Сценарий остаётся наблюдаемым от создания работы до автоматизированной проверки."}
        />
        <TerminalDemo
          title={"контрольный запуск"}
          lines={[
            { cmd: "python -m async_lab.demo" },
            { out: "operation started" },
            { out: "controlled outcome observed" },
            { out: "cleanup completed" },
          ]}
        />

        <Callout tone="info">
          <strong>{"Проверка."}</strong> {" Объясните, что сейчас только создаётся, что уже выполняется, где coroutine отдаёт управление и какой исход наблюдает caller."}
        </Callout>
      </Section>

      <Section number={"07"} title={"Тест cancelled state и cleanup"}>
        <Lead>
          {"Worker сначала получает возможность открыть ресурс, затем отменяется. Проверяются cancelled() и события."}
        </Lead>

        <div className="lesson-practice-steps">
          <h3>{"Главная модель"}</h3>
          <p>{"sleep(0) отдаёт loop управление для детерминированного старта."}</p>
          <h3>{"Контролируемое изменение"}</h3>
          <p>{"Измените delay, порядок входов, timeout или concurrency limit. Сначала запишите прогноз, затем запустите пример."}</p>
          <h3>{"Профессиональная граница"}</h3>
          <p>{"Отмена до старта тела — отдельный допустимый сценарий."}</p>
        </div>

        <CodeBlock
          caption={"пример 150.7"}
          code={"task = asyncio.create_task(worker(events))\nawait asyncio.sleep(0)\ntask.cancel()\nwith pytest.raises(asyncio.CancelledError):\n    await task\nassert events == [\"open\", \"close\"]"}
        />

        <BranchExplorer
          code={"Тест cancelled state и cleanup\n├─ success → result\n├─ expected failure → explicit policy\n├─ timeout/cancel → cleanup\n└─ unexpected defect → visible error"}
          scenarios={[
            { label: "успех", activeLine: 1, output: "возвращается ожидаемый результат" },
            { label: "ожидаемый сбой", activeLine: 2, output: "применяется локальная policy" },
            { label: "отмена", activeLine: 3, output: "выполняется cleanup" },
          ]}
        />
        <MatchPairs
          prompt={"Соедините исход с действием caller."}
          pairs={[
            { left: "success", right: "использовать данные" },
            { left: "timeout", right: "вернуть явный degraded status" },
            { left: "cancellation", right: "завершить cleanup и сохранить отмену" },
            { left: "unexpected defect", right: "не маскировать пустым fallback" },
          ]}
          explanation={"Политика зависит от критичности конкретной операции."}
        />

        <Callout tone="info">
          <strong>{"Проверка."}</strong> {" Объясните, что сейчас только создаётся, что уже выполняется, где coroutine отдаёт управление и какой исход наблюдает caller."}
        </Callout>
      </Section>

      <Section number={"08"} title={"Контрольная точка"}>
        <Lead>
          {"Ученик показывает cancel request → CancelledError → finally → coordinator и не превращает отмену в успех."}
        </Lead>

        <div className="lesson-practice-steps">
          <h3>{"Главная модель"}</h3>
          <p>{"Отмена сохраняет ресурсные инварианты."}</p>
          <h3>{"Контролируемое изменение"}</h3>
          <p>{"Измените delay, порядок входов, timeout или concurrency limit. Сначала запишите прогноз, затем запустите пример."}</p>
          <h3>{"Профессиональная граница"}</h3>
          <p>{"Следующий урок ограничит число активных Task."}</p>
        </div>


        <div className="lesson-check-group">
          <QuizCard
            question={"Какой механизм является центральным в этом уроке?"}
            options={["Контрольная точка", "случайный print", "новый OS process"]}
            correctIndex={0}
            explanation={"Контрольная точка — это часть наблюдаемого async-контракта."}
          />
          <QuizCard
            question={"Что должен наблюдать caller?"}
            options={["result, error либо cancellation по явному контракту", "случайный print", "новый OS process"]}
            correctIndex={0}
            explanation={"result, error либо cancellation по явному контракту — это часть наблюдаемого async-контракта."}
          />
          <QuizCard
            question={"Что нельзя скрывать пустым fallback?"}
            options={["причину сбоя и критичность источника", "случайный print", "новый OS process"]}
            correctIndex={0}
            explanation={"причину сбоя и критичность источника — это часть наблюдаемого async-контракта."}
          />
          <QuizCard
            question={"Что проверяется перед следующим уроком?"}
            options={["успешный, ошибочный и граничный сценарий", "случайный print", "новый OS process"]}
            correctIndex={0}
            explanation={"успешный, ошибочный и граничный сценарий — это часть наблюдаемого async-контракта."}
          />
        </div>

        <KeyTakeaways
          points={[
            <>Async-механизм вводится после понятной проблемы ожидания.</>,
            <>Точки <code>await</code> определяют кооперативное переключение.</>,
            <>Результат, ошибка, timeout и cancellation не смешиваются.</>,
            <>Cleanup должен выполняться при любом исходе.</>,
            <>Конкурентность ограничивается по capacity зависимости.</>,
            <>Измерения и тесты важнее предположений о скорости.</>,
            <>Сквозной async-lab остаётся независимым от FastAPI до блока 27.</>,
          ]}
        />

        <PracticeCta text={"Доработайте async-lab по сценарию урока, добавьте прогноз до запуска, успешный и ошибочный тест, обновите README и сделайте один осмысленный Git-коммит."} />
      </Section>

    </RichLesson>
  );
}

// 151. Semaphore и ограничение concurrency
export function Lesson151({ module }: { module?: string }) {
  return (
    <RichLesson>
      <RichHero
        variant="project"
        chip={module ?? BLOCK_TITLE}
        title={"Semaphore и ограничение concurrency"}
        intro={"Запустим много Task, но пропустим к ограниченному ресурсу только заданное количество: счётчик Semaphore, async with и измерение максимальной активности."}
        tags={[
          { icon: <Gauge size={14} />, label: "Semaphore · async with" },
          { icon: <UsersRound size={14} />, label: "limit и backpressure" },
        ]}
      />
      <TheoryBridge lesson={151} />

      <Section number={"01"} title={"Почему нужен concurrency limit"}>
        <Lead>
          {"Двадцать запланированных операций могут одновременно обратиться к ресурсу с capacity три."}
        </Lead>

        <div className="lesson-practice-steps">
          <h3>{"Главная модель"}</h3>
          <p>{"Limit защищает зависимость от burst."}</p>
          <h3>{"Контролируемое изменение"}</h3>
          <p>{"Измените delay, порядок входов, timeout или concurrency limit. Сначала запишите прогноз, затем запустите пример."}</p>
          <h3>{"Профессиональная граница"}</h3>
          <p>{"Concurrency limit не равен rate limit."}</p>
        </div>

        <CodeBlock
          caption={"пример 151.1"}
          code={"semaphore = asyncio.Semaphore(3)"}
        />

        <CompareSolutions
          question={"Какой подход точнее выражает модель раздела?"}
          left={{
            title: "Скрытый или последовательный подход",
            code: "# работа запускается без явного управления",
            note: "Граница жизненного цикла и ошибки плохо видна.",
          }}
          right={{
            title: "Явный async-контракт",
            code: "semaphore = asyncio.Semaphore(3)",
            note: "Видны операция, ожидание и форма результата.",
          }}
          preferred="right"
          explanation={"Профессиональный код показывает, кто создаёт работу, кто её ожидает и что происходит при сбое."}
        />

        <MethodGrid
          rows={[
            [<>problem</>, "назвать ограничение старого подхода"],
            [<>mechanism</>, "проследить управление и состояние"],
            [<>failure</>, "воспроизвести ожидаемый сбой"],
            [<>evidence</>, "подтвердить вывод запуском и тестом"],
          ]}
        />

        <Callout tone="info">
          <strong>{"Проверка."}</strong> {" Объясните, что сейчас только создаётся, что уже выполняется, где coroutine отдаёт управление и какой исход наблюдает caller."}
        </Callout>
      </Section>

      <Section number={"02"} title={"Внутренний счётчик permits"}>
        <Lead>
          {"Acquire уменьшает число разрешений. При нуле следующая Task ждёт release."}
        </Lead>

        <div className="lesson-practice-steps">
          <h3>{"Главная модель"}</h3>
          <p>{"Начальное value определяет максимальную активность."}</p>
          <h3>{"Контролируемое изменение"}</h3>
          <p>{"Измените delay, порядок входов, timeout или concurrency limit. Сначала запишите прогноз, затем запустите пример."}</p>
          <h3>{"Профессиональная граница"}</h3>
          <p>{"Отрицательное value недопустимо."}</p>
        </div>

        <CodeBlock
          caption={"пример 151.2"}
          code={"async with semaphore:\n    await fetch(item)"}
        />

        <StepThrough
          code={"async with semaphore:\n    await fetch(item)"}
          steps={[
            { line: 0, note: "Создаётся или настраивается async-операция.", vars: { этап: "start" } },
            { line: 1, note: "Event loop получает точку для переключения.", vars: { состояние: "waiting" } },
            { line: 1, note: "Caller получает результат либо отдельный сбой.", vars: { этап: "observed outcome" } },
          ]}
        />
        <RecallCard
          question={"Где в этом примере находится точка передачи управления event loop?"}
          answer={<p>В выражении с await. До него выполняется обычный синхронный участок текущей coroutine.</p>}
        />

        <Callout tone="info">
          <strong>{"Проверка."}</strong> {" Объясните, что сейчас только создаётся, что уже выполняется, где coroutine отдаёт управление и какой исход наблюдает caller."}
        </Callout>
      </Section>

      <Section number={"03"} title={"Async with гарантирует release"}>
        <Lead>
          {"Контекстный менеджер освобождает permit при success, RuntimeError и cancellation."}
        </Lead>

        <div className="lesson-practice-steps">
          <h3>{"Главная модель"}</h3>
          <p>{"Ручной acquire требует try/finally."}</p>
          <h3>{"Контролируемое изменение"}</h3>
          <p>{"Измените delay, порядок входов, timeout или concurrency limit. Сначала запишите прогноз, затем запустите пример."}</p>
          <h3>{"Профессиональная граница"}</h3>
          <p>{"Потерянный release уменьшает capacity навсегда."}</p>
        </div>

        <CodeBlock
          caption={"пример 151.3"}
          code={"async with semaphore:\n    return await fetch(item)"}
        />

        <BugHunt
          code={"async with semaphore:\n    return await fetch(item)"}
          question={"Какой контракт чаще всего нарушают при неосторожной обработке этого кода?"}
          options={[
            "Теряется наблюдаемость результата, ошибки или cleanup",
            "Python запрещает несколько async-функций",
            "Event loop всегда создаёт новый process",
          ]}
          correctIndex={0}
          explanation={"Async-код должен сохранять жизненный цикл операции и явно обрабатывать ожидаемый исход."}
          fix={"async with semaphore:\n    return await fetch(item)"}
        />
        <Callout>
          Не исправляйте async-проблему широким <code>except</code> и пустым значением: сначала назовите нарушенный контракт.
        </Callout>

        <Callout tone="info">
          <strong>{"Проверка."}</strong> {" Объясните, что сейчас только создаётся, что уже выполняется, где coroutine отдаёт управление и какой исход наблюдает caller."}
        </Callout>
      </Section>

      <Section number={"04"} title={"Scheduled Task и active request"}>
        <Lead>
          {"Все двадцать coroutine могут быть запланированы, но только limit входят в I/O-секцию."}
        </Lead>

        <div className="lesson-practice-steps">
          <h3>{"Главная модель"}</h3>
          <p>{"Остальные Task ждут permit."}</p>
          <h3>{"Контролируемое изменение"}</h3>
          <p>{"Измените delay, порядок входов, timeout или concurrency limit. Сначала запишите прогноз, затем запустите пример."}</p>
          <h3>{"Профессиональная граница"}</h3>
          <p>{"Semaphore не удаляет и не отменяет очередь."}</p>
        </div>

        <CodeBlock
          caption={"пример 151.4"}
          code={"results = await asyncio.gather(*(\n    limited_fetch(item)\n    for item in items\n))"}
        />

        <BranchExplorer
          code={"Scheduled Task и active request\n├─ success → result\n├─ expected failure → explicit policy\n├─ timeout/cancel → cleanup\n└─ unexpected defect → visible error"}
          scenarios={[
            { label: "успех", activeLine: 1, output: "возвращается ожидаемый результат" },
            { label: "ожидаемый сбой", activeLine: 2, output: "применяется локальная policy" },
            { label: "отмена", activeLine: 3, output: "выполняется cleanup" },
          ]}
        />
        <MatchPairs
          prompt={"Соедините исход с действием caller."}
          pairs={[
            { left: "success", right: "использовать данные" },
            { left: "timeout", right: "вернуть явный degraded status" },
            { left: "cancellation", right: "завершить cleanup и сохранить отмену" },
            { left: "unexpected defect", right: "не маскировать пустым fallback" },
          ]}
          explanation={"Политика зависит от критичности конкретной операции."}
        />

        <Callout tone="info">
          <strong>{"Проверка."}</strong> {" Объясните, что сейчас только создаётся, что уже выполняется, где coroutine отдаёт управление и какой исход наблюдает caller."}
        </Callout>
      </Section>

      <Section number={"05"} title={"Выбор limit"}>
        <Lead>
          {"Малое значение ухудшает throughput, большое повышает timeout и давление на dependency."}
        </Lead>

        <div className="lesson-practice-steps">
          <h3>{"Главная модель"}</h3>
          <p>{"Limit выбирается по capacity и измерениям."}</p>
          <h3>{"Контролируемое изменение"}</h3>
          <p>{"Измените delay, порядок входов, timeout или concurrency limit. Сначала запишите прогноз, затем запустите пример."}</p>
          <h3>{"Профессиональная граница"}</h3>
          <p>{"Semaphore не решает CPU-bound проблему."}</p>
        </div>

        <CodeBlock
          caption={"пример 151.5"}
          code={"if limit < 1:\n    raise ValueError(\"limit must be >= 1\")"}
        />

        <TypeCards>
          <TypeCard badge="вход" title="Что получает механизм" code={"if limit < 1:"}>
            Операция, configuration или awaitable передаются явно.
          </TypeCard>
          <TypeCard badge="жизненный цикл" badgeTone="float" title="Что делает event loop" code="scheduled → waiting → done">
            Loop продвигает готовые coroutine в точках кооперативного ожидания.
          </TypeCard>
          <TypeCard badge="исход" badgeTone="str" title="Что получает caller" code="result | error | cancellation">
            Результат должен иметь наблюдаемую и проверяемую форму.
          </TypeCard>
        </TypeCards>
        <TrueFalse
          statement={<>Asyncio автоматически делает любую операцию параллельной на нескольких CPU.</>}
          isTrue={false}
          explanation={"Asyncio предназначен прежде всего для конкурентного I/O и не превращает CPU-bound код в параллельный."}
        />

        <Callout tone="info">
          <strong>{"Проверка."}</strong> {" Объясните, что сейчас только создаётся, что уже выполняется, где coroutine отдаёт управление и какой исход наблюдает caller."}
        </Callout>
      </Section>

      <Section number={"06"} title={"Измерение maximum_active"}>
        <Lead>
          {"Учебный state считает active внутри секции и сохраняет maximum."}
        </Lead>

        <div className="lesson-practice-steps">
          <h3>{"Главная модель"}</h3>
          <p>{"Decrement находится в finally."}</p>
          <h3>{"Контролируемое изменение"}</h3>
          <p>{"Измените delay, порядок входов, timeout или concurrency limit. Сначала запишите прогноз, затем запустите пример."}</p>
          <h3>{"Профессиональная граница"}</h3>
          <p>{"Mutable state здесь только измерительный инструмент."}</p>
        </div>

        <CodeBlock
          caption={"пример 151.6"}
          code={"state[\"active\"] += 1\nstate[\"maximum\"] = max(\n    state[\"maximum\"],\n    state[\"active\"],\n)"}
        />

        <PredictOutput
          code={"state[\"active\"] += 1\nstate[\"maximum\"] = max(\n    state[\"maximum\"],\n    state[\"active\"],\n)"}
          output={"Порядок определяется точками await и задержками; итоговый результат сохраняет объявленный контракт."}
          hint={"Сначала найдите все точки await, затем сравните длительности и порядок входов."}
        />
        <MethodGrid
          rows={[
            [<>создание</>, "работа становится доступной event loop"],
            [<>ожидание</>, "текущая coroutine отдаёт управление"],
            [<>завершение</>, "результат или исключение сохраняется"],
            [<>наблюдение</>, "caller получает исход через await"],
          ]}
        />

        <Callout tone="info">
          <strong>{"Проверка."}</strong> {" Объясните, что сейчас только создаётся, что уже выполняется, где coroutine отдаёт управление и какой исход наблюдает caller."}
        </Callout>
      </Section>

      <Section number={"07"} title={"StudyHub batch из двадцати источников"}>
        <Lead>
          {"Один Semaphore разделяется всеми wrappers, каждый источник имеет timeout."}
        </Lead>

        <div className="lesson-practice-steps">
          <h3>{"Главная модель"}</h3>
          <p>{"Maximum_active должен быть не больше limit."}</p>
          <h3>{"Контролируемое изменение"}</h3>
          <p>{"Измените delay, порядок входов, timeout или concurrency limit. Сначала запишите прогноз, затем запустите пример."}</p>
          <h3>{"Профессиональная граница"}</h3>
          <p>{"Разные группы могут иметь разные limits."}</p>
        </div>

        <CodeBlock
          caption={"пример 151.7"}
          code={"semaphore = asyncio.Semaphore(limit)\nreturn await asyncio.gather(*(\n    load_source(source_id, semaphore)\n    for source_id in source_ids\n))"}
        />

        <CodeSequence
          title={"Соберите безопасный async-сценарий"}
          prompt={"Расположите шаги от configuration до проверки исхода."}
          pieces={[
            { id: "prepare", code: "подготовить operation и configuration" },
            { id: "start", code: "создать или запланировать awaitable" },
            { id: "await", code: "дождаться результата по явной policy" },
            { id: "cleanup", code: "гарантировать cleanup при сбое" },
            { id: "verify", code: "проверить result, error и state" },
          ]}
          correctOrder={["prepare", "start", "await", "cleanup", "verify"]}
          explanation={"Сценарий остаётся наблюдаемым от создания работы до автоматизированной проверки."}
        />
        <TerminalDemo
          title={"контрольный запуск"}
          lines={[
            { cmd: "python -m async_lab.demo" },
            { out: "operation started" },
            { out: "controlled outcome observed" },
            { out: "cleanup completed" },
          ]}
        />

        <Callout tone="info">
          <strong>{"Проверка."}</strong> {" Объясните, что сейчас только создаётся, что уже выполняется, где coroutine отдаёт управление и какой исход наблюдает caller."}
        </Callout>
      </Section>

      <Section number={"08"} title={"Контрольная точка"}>
        <Lead>
          {"Ученик доказывает maximum_active и объясняет async with как cancellation-safe release."}
        </Lead>

        <div className="lesson-practice-steps">
          <h3>{"Главная модель"}</h3>
          <p>{"Scheduled и active — разные величины."}</p>
          <h3>{"Контролируемое изменение"}</h3>
          <p>{"Измените delay, порядок входов, timeout или concurrency limit. Сначала запишите прогноз, затем запустите пример."}</p>
          <h3>{"Профессиональная граница"}</h3>
          <p>{"Следующий урок соберёт полный partial-result aggregator."}</p>
        </div>


        <div className="lesson-check-group">
          <QuizCard
            question={"Какой механизм является центральным в этом уроке?"}
            options={["Контрольная точка", "случайный print", "новый OS process"]}
            correctIndex={0}
            explanation={"Контрольная точка — это часть наблюдаемого async-контракта."}
          />
          <QuizCard
            question={"Что должен наблюдать caller?"}
            options={["result, error либо cancellation по явному контракту", "случайный print", "новый OS process"]}
            correctIndex={0}
            explanation={"result, error либо cancellation по явному контракту — это часть наблюдаемого async-контракта."}
          />
          <QuizCard
            question={"Что нельзя скрывать пустым fallback?"}
            options={["причину сбоя и критичность источника", "случайный print", "новый OS process"]}
            correctIndex={0}
            explanation={"причину сбоя и критичность источника — это часть наблюдаемого async-контракта."}
          />
          <QuizCard
            question={"Что проверяется перед следующим уроком?"}
            options={["успешный, ошибочный и граничный сценарий", "случайный print", "новый OS process"]}
            correctIndex={0}
            explanation={"успешный, ошибочный и граничный сценарий — это часть наблюдаемого async-контракта."}
          />
        </div>

        <KeyTakeaways
          points={[
            <>Async-механизм вводится после понятной проблемы ожидания.</>,
            <>Точки <code>await</code> определяют кооперативное переключение.</>,
            <>Результат, ошибка, timeout и cancellation не смешиваются.</>,
            <>Cleanup должен выполняться при любом исходе.</>,
            <>Конкурентность ограничивается по capacity зависимости.</>,
            <>Измерения и тесты важнее предположений о скорости.</>,
            <>Сквозной async-lab остаётся независимым от FastAPI до блока 27.</>,
          ]}
        />

        <PracticeCta text={"Доработайте async-lab по сценарию урока, добавьте прогноз до запуска, успешный и ошибочный тест, обновите README и сделайте один осмысленный Git-коммит."} />
      </Section>

    </RichLesson>
  );
}

// 152. Частичные ошибки и итоговый async-агрегатор
export function Lesson152({ module }: { module?: string }) {
  return (
    <RichLesson>
      <RichHero
        variant="project"
        chip={module ?? BLOCK_TITLE}
        title={"Частичные ошибки и итоговый async-агрегатор"}
        intro={"Соберём полный async-lab: result contract, success/error/timeout, operation id, concurrency limit, стабильный порядок и тесты контролируемой деградации."}
        tags={[
          { icon: <Boxes size={14} />, label: "partial result contract" },
          { icon: <Workflow size={14} />, label: "async aggregator release" },
        ]}
      />
      <TheoryBridge lesson={152} />

      <Section number={"01"} title={"Почему пустой fallback нечестен"}>
        <Lead>
          {"Пустой список не отличает успешное отсутствие данных от timeout или source error."}
        </Lead>

        <div className="lesson-practice-steps">
          <h3>{"Главная модель"}</h3>
          <p>{"Partial result требует метаданных качества."}</p>
          <h3>{"Контролируемое изменение"}</h3>
          <p>{"Измените delay, порядок входов, timeout или concurrency limit. Сначала запишите прогноз, затем запустите пример."}</p>
          <h3>{"Профессиональная граница"}</h3>
          <p>{"Unexpected defects нельзя маскировать."}</p>
        </div>

        <CodeBlock
          caption={"пример 152.1"}
          code={"{\"source\": \"stats\", \"status\": \"timeout\", \"data\": None}"}
        />

        <CompareSolutions
          question={"Какой подход точнее выражает модель раздела?"}
          left={{
            title: "Скрытый или последовательный подход",
            code: "# работа запускается без явного управления",
            note: "Граница жизненного цикла и ошибки плохо видна.",
          }}
          right={{
            title: "Явный async-контракт",
            code: "{\"source\": \"stats\", \"status\": \"timeout\", \"data\": None}",
            note: "Видны операция, ожидание и форма результата.",
          }}
          preferred="right"
          explanation={"Профессиональный код показывает, кто создаёт работу, кто её ожидает и что происходит при сбое."}
        />

        <MethodGrid
          rows={[
            [<>problem</>, "назвать ограничение старого подхода"],
            [<>mechanism</>, "проследить управление и состояние"],
            [<>failure</>, "воспроизвести ожидаемый сбой"],
            [<>evidence</>, "подтвердить вывод запуском и тестом"],
          ]}
        />

        <Callout tone="info">
          <strong>{"Проверка."}</strong> {" Объясните, что сейчас только создаётся, что уже выполняется, где coroutine отдаёт управление и какой исход наблюдает caller."}
        </Callout>
      </Section>

      <Section number={"02"} title={"SourceResult как контракт"}>
        <Lead>
          {"Dataclass хранит source, status, data, error и elapsed."}
        </Lead>

        <div className="lesson-practice-steps">
          <h3>{"Главная модель"}</h3>
          <p>{"Модель не выполняет I/O, а фиксирует форму исхода."}</p>
          <h3>{"Контролируемое изменение"}</h3>
          <p>{"Измените delay, порядок входов, timeout или concurrency limit. Сначала запишите прогноз, затем запустите пример."}</p>
          <h3>{"Профессиональная граница"}</h3>
          <p>{"Status success, timeout и error взаимоисключающие."}</p>
        </div>

        <CodeBlock
          caption={"пример 152.2"}
          code={"@dataclass\nclass SourceResult:\n    source: str\n    status: Status\n    data: Any = None\n    error: str | None = None\n    elapsed: float = 0.0"}
        />

        <TypeCards>
          <TypeCard badge="вход" title="Что получает механизм" code={"@dataclass"}>
            Операция, configuration или awaitable передаются явно.
          </TypeCard>
          <TypeCard badge="жизненный цикл" badgeTone="float" title="Что делает event loop" code="scheduled → waiting → done">
            Loop продвигает готовые coroutine в точках кооперативного ожидания.
          </TypeCard>
          <TypeCard badge="исход" badgeTone="str" title="Что получает caller" code="result | error | cancellation">
            Результат должен иметь наблюдаемую и проверяемую форму.
          </TypeCard>
        </TypeCards>
        <TrueFalse
          statement={<>Asyncio автоматически делает любую операцию параллельной на нескольких CPU.</>}
          isTrue={false}
          explanation={"Asyncio предназначен прежде всего для конкурентного I/O и не превращает CPU-bound код в параллельный."}
        />

        <Callout tone="info">
          <strong>{"Проверка."}</strong> {" Объясните, что сейчас только создаётся, что уже выполняется, где coroutine отдаёт управление и какой исход наблюдает caller."}
        </Callout>
      </Section>

      <Section number={"03"} title={"Safe wrapper"}>
        <Lead>
          {"Один wrapper применяет Semaphore, wait_for, timing и обработку ожидаемого RuntimeError."}
        </Lead>

        <div className="lesson-practice-steps">
          <h3>{"Главная модель"}</h3>
          <p>{"Cancellation и BaseException не превращаются в обычный error."}</p>
          <h3>{"Контролируемое изменение"}</h3>
          <p>{"Измените delay, порядок входов, timeout или concurrency limit. Сначала запишите прогноз, затем запустите пример."}</p>
          <h3>{"Профессиональная граница"}</h3>
          <p>{"Operation передаётся фабрикой без вызова."}</p>
        </div>

        <CodeBlock
          caption={"пример 152.3"}
          code={"async def run_source(source, operation, semaphore, timeout):\n    async with semaphore:\n        try:\n            data = await asyncio.wait_for(\n                operation(),\n                timeout=timeout,\n            )\n        except asyncio.TimeoutError:\n            return SourceResult(source, \"timeout\")\n        return SourceResult(source, \"success\", data)"}
        />

        <BugHunt
          code={"async def run_source(source, operation, semaphore, timeout):\n    async with semaphore:\n        try:\n            data = await asyncio.wait_for(\n                operation(),\n                timeout=timeout,\n            )\n        except asyncio.TimeoutError:\n            return SourceResult(source, \"timeout\")\n        return SourceResult(source, \"success\", data)"}
          question={"Какой контракт чаще всего нарушают при неосторожной обработке этого кода?"}
          options={[
            "Теряется наблюдаемость результата, ошибки или cleanup",
            "Python запрещает несколько async-функций",
            "Event loop всегда создаёт новый process",
          ]}
          correctIndex={0}
          explanation={"Async-код должен сохранять жизненный цикл операции и явно обрабатывать ожидаемый исход."}
          fix={"async def run_source(source, operation, semaphore, timeout):\n    async with semaphore:\n        try:\n            data = await asyncio.wait_for(\n                operation(),\n                timeout=timeout,\n            )\n        except asyncio.TimeoutError:\n            return SourceResult(source, \"timeout\")\n        return SourceResult(source, \"success\", data)"}
        />
        <Callout>
          Не исправляйте async-проблему широким <code>except</code> и пустым значением: сначала назовите нарушенный контракт.
        </Callout>

        <Callout tone="info">
          <strong>{"Проверка."}</strong> {" Объясните, что сейчас только создаётся, что уже выполняется, где coroutine отдаёт управление и какой исход наблюдает caller."}
        </Callout>
      </Section>

      <Section number={"04"} title={"Ordered gather для source specs"}>
        <Lead>
          {"Specs задают имена и фабрики. Gather сохраняет input order результатов."}
        </Lead>

        <div className="lesson-practice-steps">
          <h3>{"Главная модель"}</h3>
          <p>{"Позиционный контракт позволяет строить by_source."}</p>
          <h3>{"Контролируемое изменение"}</h3>
          <p>{"Измените delay, порядок входов, timeout или concurrency limit. Сначала запишите прогноз, затем запустите пример."}</p>
          <h3>{"Профессиональная граница"}</h3>
          <p>{"Реальный HTTP появится только в следующем блоке."}</p>
        </div>

        <CodeBlock
          caption={"пример 152.4"}
          code={"results = await asyncio.gather(*(\n    safe_load(spec, semaphore)\n    for spec in specs\n))"}
        />

        <PredictOutput
          code={"results = await asyncio.gather(*(\n    safe_load(spec, semaphore)\n    for spec in specs\n))"}
          output={"Порядок определяется точками await и задержками; итоговый результат сохраняет объявленный контракт."}
          hint={"Сначала найдите все точки await, затем сравните длительности и порядок входов."}
        />
        <MethodGrid
          rows={[
            [<>создание</>, "работа становится доступной event loop"],
            [<>ожидание</>, "текущая coroutine отдаёт управление"],
            [<>завершение</>, "результат или исключение сохраняется"],
            [<>наблюдение</>, "caller получает исход через await"],
          ]}
        />

        <Callout tone="info">
          <strong>{"Проверка."}</strong> {" Объясните, что сейчас только создаётся, что уже выполняется, где coroutine отдаёт управление и какой исход наблюдает caller."}
        </Callout>
      </Section>

      <Section number={"05"} title={"Operation id и summary"}>
        <Lead>
          {"Один id связывает события запуска. Counter формирует total, success, timeout и error."}
        </Lead>

        <div className="lesson-practice-steps">
          <h3>{"Главная модель"}</h3>
          <p>{"Operation id не является секретом пользователя."}</p>
          <h3>{"Контролируемое изменение"}</h3>
          <p>{"Измените delay, порядок входов, timeout или concurrency limit. Сначала запишите прогноз, затем запустите пример."}</p>
          <h3>{"Профессиональная граница"}</h3>
          <p>{"Summary не заменяет подробные results."}</p>
        </div>

        <CodeBlock
          caption={"пример 152.5"}
          code={"summary = Counter(\n    result.status\n    for result in results\n)"}
        />

        <BranchExplorer
          code={"Operation id и summary\n├─ success → result\n├─ expected failure → explicit policy\n├─ timeout/cancel → cleanup\n└─ unexpected defect → visible error"}
          scenarios={[
            { label: "успех", activeLine: 1, output: "возвращается ожидаемый результат" },
            { label: "ожидаемый сбой", activeLine: 2, output: "применяется локальная policy" },
            { label: "отмена", activeLine: 3, output: "выполняется cleanup" },
          ]}
        />
        <MatchPairs
          prompt={"Соедините исход с действием caller."}
          pairs={[
            { left: "success", right: "использовать данные" },
            { left: "timeout", right: "вернуть явный degraded status" },
            { left: "cancellation", right: "завершить cleanup и сохранить отмену" },
            { left: "unexpected defect", right: "не маскировать пустым fallback" },
          ]}
          explanation={"Политика зависит от критичности конкретной операции."}
        />

        <Callout tone="info">
          <strong>{"Проверка."}</strong> {" Объясните, что сейчас только создаётся, что уже выполняется, где coroutine отдаёт управление и какой исход наблюдает caller."}
        </Callout>
      </Section>

      <Section number={"06"} title={"Required и optional sources"}>
        <Lead>
          {"User и tasks обязательны, recommendations допускают degraded response."}
        </Lead>

        <div className="lesson-practice-steps">
          <h3>{"Главная модель"}</h3>
          <p>{"Failure policy определяется бизнес-контрактом."}</p>
          <h3>{"Контролируемое изменение"}</h3>
          <p>{"Измените delay, порядок входов, timeout или concurrency limit. Сначала запишите прогноз, затем запустите пример."}</p>
          <h3>{"Профессиональная граница"}</h3>
          <p>{"Технически доступный partial result не всегда допустим."}</p>
        </div>

        <CodeBlock
          caption={"пример 152.6"}
          code={"for required in (\"user\", \"tasks\"):\n    if by_source[required].status != \"success\":\n        raise RuntimeError(\n            f\"required source failed: {required}\"\n        )"}
        />

        <CodeSequence
          title={"Соберите безопасный async-сценарий"}
          prompt={"Расположите шаги от configuration до проверки исхода."}
          pieces={[
            { id: "prepare", code: "подготовить operation и configuration" },
            { id: "start", code: "создать или запланировать awaitable" },
            { id: "await", code: "дождаться результата по явной policy" },
            { id: "cleanup", code: "гарантировать cleanup при сбое" },
            { id: "verify", code: "проверить result, error и state" },
          ]}
          correctOrder={["prepare", "start", "await", "cleanup", "verify"]}
          explanation={"Сценарий остаётся наблюдаемым от создания работы до автоматизированной проверки."}
        />
        <TerminalDemo
          title={"контрольный запуск"}
          lines={[
            { cmd: "python -m async_lab.demo" },
            { out: "operation started" },
            { out: "controlled outcome observed" },
            { out: "cleanup completed" },
          ]}
        />

        <Callout tone="info">
          <strong>{"Проверка."}</strong> {" Объясните, что сейчас только создаётся, что уже выполняется, где coroutine отдаёт управление и какой исход наблюдает caller."}
        </Callout>
      </Section>

      <Section number={"07"} title={"Тестовая матрица"}>
        <Lead>
          {"Проверяются all success, timeout, error, required failure, order, maximum_active и cleanup."}
        </Lead>

        <div className="lesson-practice-steps">
          <h3>{"Главная модель"}</h3>
          <p>{"Fake sources дают управляемые delay и failures."}</p>
          <h3>{"Контролируемое изменение"}</h3>
          <p>{"Измените delay, порядок входов, timeout или concurrency limit. Сначала запишите прогноз, затем запустите пример."}</p>
          <h3>{"Профессиональная граница"}</h3>
          <p>{"Timing не должен быть единственной проверкой."}</p>
        </div>

        <CodeBlock
          caption={"пример 152.7"}
          code={"assert [item.source for item in results] == [\n    \"user\", \"tasks\", \"stats\", \"recommendations\"\n]\nassert maximum_active <= 3"}
        />

        <TypeCards>
          <TypeCard badge="вход" title="Что получает механизм" code={"assert [item.source for item in results] == ["}>
            Операция, configuration или awaitable передаются явно.
          </TypeCard>
          <TypeCard badge="жизненный цикл" badgeTone="float" title="Что делает event loop" code="scheduled → waiting → done">
            Loop продвигает готовые coroutine в точках кооперативного ожидания.
          </TypeCard>
          <TypeCard badge="исход" badgeTone="str" title="Что получает caller" code="result | error | cancellation">
            Результат должен иметь наблюдаемую и проверяемую форму.
          </TypeCard>
        </TypeCards>
        <TrueFalse
          statement={<>Asyncio автоматически делает любую операцию параллельной на нескольких CPU.</>}
          isTrue={false}
          explanation={"Asyncio предназначен прежде всего для конкурентного I/O и не превращает CPU-bound код в параллельный."}
        />

        <Callout tone="info">
          <strong>{"Проверка."}</strong> {" Объясните, что сейчас только создаётся, что уже выполняется, где coroutine отдаёт управление и какой исход наблюдает caller."}
        </Callout>
      </Section>

      <Section number={"08"} title={"Финальная контрольная точка"}>
        <Lead>
          {"Ученик трассирует один source от factory до SourceResult и объясняет каждую границу."}
        </Lead>

        <div className="lesson-practice-steps">
          <h3>{"Главная модель"}</h3>
          <p>{"Async-lab готов к подключению httpx.AsyncClient в блоке 27."}</p>
          <h3>{"Контролируемое изменение"}</h3>
          <p>{"Измените delay, порядок входов, timeout или concurrency limit. Сначала запишите прогноз, затем запустите пример."}</p>
          <h3>{"Профессиональная граница"}</h3>
          <p>{"FastAPI и AsyncSession пока не вводятся."}</p>
        </div>


        <div className="lesson-check-group">
          <QuizCard
            question={"Какой механизм является центральным в этом уроке?"}
            options={["Финальная контрольная точка", "случайный print", "новый OS process"]}
            correctIndex={0}
            explanation={"Финальная контрольная точка — это часть наблюдаемого async-контракта."}
          />
          <QuizCard
            question={"Что должен наблюдать caller?"}
            options={["result, error либо cancellation по явному контракту", "случайный print", "новый OS process"]}
            correctIndex={0}
            explanation={"result, error либо cancellation по явному контракту — это часть наблюдаемого async-контракта."}
          />
          <QuizCard
            question={"Что нельзя скрывать пустым fallback?"}
            options={["причину сбоя и критичность источника", "случайный print", "новый OS process"]}
            correctIndex={0}
            explanation={"причину сбоя и критичность источника — это часть наблюдаемого async-контракта."}
          />
          <QuizCard
            question={"Что проверяется перед следующим уроком?"}
            options={["успешный, ошибочный и граничный сценарий", "случайный print", "новый OS process"]}
            correctIndex={0}
            explanation={"успешный, ошибочный и граничный сценарий — это часть наблюдаемого async-контракта."}
          />
        </div>

        <KeyTakeaways
          points={[
            <>Async-механизм вводится после понятной проблемы ожидания.</>,
            <>Точки <code>await</code> определяют кооперативное переключение.</>,
            <>Результат, ошибка, timeout и cancellation не смешиваются.</>,
            <>Cleanup должен выполняться при любом исходе.</>,
            <>Конкурентность ограничивается по capacity зависимости.</>,
            <>Измерения и тесты важнее предположений о скорости.</>,
            <>Сквозной async-lab остаётся независимым от FastAPI до блока 27.</>,
          ]}
        />

        <PracticeCta text={"Доработайте async-lab по сценарию урока, добавьте прогноз до запуска, успешный и ошибочный тест, обновите README и сделайте один осмысленный Git-коммит."} />
      </Section>

    </RichLesson>
  );
}

