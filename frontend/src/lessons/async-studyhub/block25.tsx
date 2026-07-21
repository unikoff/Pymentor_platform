import {
  Braces,
  Bug,
  FunctionSquare,
  GitFork,
  Layers,
  ListChecks,
  Play,
  Scale,
  Wrench,
} from "lucide-react";
import {
  BugHunt,
  Callout,
  CodeBlock,
  CompareSolutions,
  FillBlank,
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
  TypeCard,
  TypeCards,
} from "../shared";

type LessonProps = { module?: string };
const BLOCK_TITLE = "Блок 25 · Coroutine, event loop и async/await";


export function Lesson141({ module }: LessonProps) {
  return (
    <RichLesson>
      <RichHero
        variant="project"
        chip={module ?? BLOCK_TITLE}
        title={"Блокирующее выполнение, CPU и I/O"}
        intro={"Разделим время программы на работу и ожидание: сравним вычисление, time.sleep и имитацию сетевого запроса, измерим последовательный сценарий и определим, где асинхронность может помочь, а где нет."}
        tags={[
          { icon: <Play size={14} />, label: "работа и ожидание" },
          { icon: <Scale size={14} />, label: "CPU-bound · I/O-bound" },
        ]}
      />
      <Callout tone="info">
        <strong>Связь с курсом.</strong> {"StudyHub уже работает синхронно, поэтому async вводится как ответ на наблюдаемое I/O-ожидание, а не как модная замена def."}{" "}
        <strong>Важно не перепутать:</strong> {"Async не ускоряет CPU-bound вычисление автоматически."}
      </Callout>

      <Section number={"01"} title={"Зачем сначала измерять"}>
        <Lead>
          {"Медленный ответ ещё не доказывает, что нужен async. Сначала сценарий разбивается на вычисление, ожидание и итоговую latency."}
        </Lead>

        <div className="lesson-practice-steps">
          <h3>{"Понять"}</h3>
          <p>{"Сформулировать основную модель своими словами."}</p>
          <h3>{"Проверить"}</h3>
          <p>{"Предсказать результат и запустить минимальный пример."}</p>
          <h3>{"Объяснить"}</h3>
          <p>{"Связать наблюдение с конкретной строкой или состоянием."}</p>
        </div>

        <CodeBlock
          caption={"минимальный эксперимент"}
          code={
            "from time import perf_counter, sleep\n" +
            "\n" +
            "started = perf_counter()\n" +
            "sleep(0.4)\n" +
            "print(f\"elapsed={perf_counter()-started:.2f}s\")"
          }
        />

        <TypeCards>
          <TypeCard badge={"model"} title={"Главная модель"} code={"from time import perf_counter, sleep"}>
            {"Медленный ответ ещё не доказывает, что нужен async. Сначала сценарий разбивается на вычисление, ожидание и итоговую latency."}
          </TypeCard>
          <TypeCard badge={"flow"} badgeTone="float" title={"Поток выполнения"} code={"user = load_user()   # около 1 с"}>
            {"Обычный вызов полностью завершается до следующей строки, поэтому две паузы складываются."}
          </TypeCard>
          <TypeCard badge={"check"} badgeTone="str" title={"Проверяемый результат"} code={"predict → run → explain"}>
            {"Каждое предположение подтверждается запуском, типом значения или измерением."}
          </TypeCard>
        </TypeCards>

        <Callout tone="info">
          {"Async не ускоряет CPU-bound вычисление автоматически."}
        </Callout>
      </Section>

      <Section number={"02"} title={"Последовательный baseline"}>
        <Lead>
          {"Обычный вызов полностью завершается до следующей строки, поэтому две паузы складываются."}
        </Lead>

        <div className="lesson-practice-steps">
          <h3>{"Понять"}</h3>
          <p>{"Сформулировать основную модель своими словами."}</p>
          <h3>{"Проверить"}</h3>
          <p>{"Предсказать результат и запустить минимальный пример."}</p>
          <h3>{"Объяснить"}</h3>
          <p>{"Связать наблюдение с конкретной строкой или состоянием."}</p>
        </div>

        <CodeBlock
          caption={"минимальный эксперимент"}
          code={
            "user = load_user()   # около 1 с\n" +
            "tasks = load_tasks() # ещё около 1 с"
          }
        />

        <MethodGrid
          rows={[
            [<>вход</>, "Медленный ответ ещё не доказывает, что нужен async. Сначала сценарий разбивается на вычисление, ожидание и итоговую latency."],
            [<>операция</>, "Процессор выполняет инструкции без полезной точки I/O-ожидания. async def не уменьшает число операций."],
            [<>наблюдение</>, "Логи помогают увидеть, где программа вычисляет, а где просто ждёт."],
            [<>граница</>, "Async не ускоряет CPU-bound вычисление автоматически."],
          ]}
        />

        <MatchPairs
          prompt={"Соедините шаг лаборатории с его смыслом."}
          pairs={[
            { left: "понять", right: "сформулировать модель" },
            { left: "предсказать", right: "назвать результат до запуска" },
            { left: "запустить", right: "получить наблюдение" },
            { left: "объяснить", right: "связать код и результат" },
          ]}
          explanation={"Порядок эксперимента защищает от случайного запоминания синтаксиса."}
        />

        <Callout tone="info">
          {"Async не ускоряет CPU-bound вычисление автоматически."}
        </Callout>
      </Section>

      <Section number={"03"} title={"CPU-bound работа"}>
        <Lead>
          {"Процессор выполняет инструкции без полезной точки I/O-ожидания. async def не уменьшает число операций."}
        </Lead>

        <div className="lesson-practice-steps">
          <h3>{"Понять"}</h3>
          <p>{"Сформулировать основную модель своими словами."}</p>
          <h3>{"Проверить"}</h3>
          <p>{"Предсказать результат и запустить минимальный пример."}</p>
          <h3>{"Объяснить"}</h3>
          <p>{"Связать наблюдение с конкретной строкой или состоянием."}</p>
        </div>

        <CodeBlock
          caption={"минимальный эксперимент"}
          code={
            "def calculate_score(limit):\n" +
            "    total = 0\n" +
            "    for number in range(limit):\n" +
            "        total += number * number\n" +
            "    return total"
          }
        />

        <StepThrough
          code={
            "def calculate_score(limit):\n" +
            "    total = 0\n" +
            "    for number in range(limit):\n" +
            "        total += number * number\n" +
            "    return total"
          }
          steps={[
            { line: 0, note: "Начинается сценарий и фиксируется исходное состояние.", vars: { этап: "1" } },
            { line: 1, note: "Выполняется первый значимый шаг.", vars: { этап: "2" } },
            { line: 2, note: "Наблюдается основная точка изменения или ожидания.", vars: { этап: "3" } },
            { line: 4, note: "Формируется итог, который сравнивается с прогнозом.", vars: { этап: "5" } },
          ]}
        />

        <Callout tone="info">
          {"Async не ускоряет CPU-bound вычисление автоматически."}
        </Callout>
      </Section>

      <Section number={"04"} title={"I/O-bound ожидание"}>
        <Lead>
          {"Сеть, база и файл могут заставить текущую операцию ждать внешнее событие."}
        </Lead>

        <div className="lesson-practice-steps">
          <h3>{"Понять"}</h3>
          <p>{"Сформулировать основную модель своими словами."}</p>
          <h3>{"Проверить"}</h3>
          <p>{"Предсказать результат и запустить минимальный пример."}</p>
          <h3>{"Объяснить"}</h3>
          <p>{"Связать наблюдение с конкретной строкой или состоянием."}</p>
        </div>

        <CodeBlock
          caption={"минимальный эксперимент"}
          code={
            "request sent\n" +
            "→ waiting for network\n" +
            "→ response ready\n" +
            "→ parse response"
          }
        />

        <CompareSolutions
          question={"Какой вариант точнее выражает модель занятия?"}
          left={{ title: "Магическое ускорение", code: "async = любая функция быстрее", note: "Источник заблуждения или ограничение." }}
          right={{ title: "Использование пауз", code: "ожидание A → выполнить готовую B", note: "Явный контракт и наблюдаемое поведение." }}
          preferred={"right"}
          explanation={"Event loop полезен на неблокирующих паузах I/O, когда есть другая готовая работа."}
        />

        <Callout tone="info">
          {"Async не ускоряет CPU-bound вычисление автоматически."}
        </Callout>
      </Section>

      <Section number={"05"} title={"time.sleep как блокировка"}>
        <Lead>
          {"time.sleep создаёт видимую паузу и удерживает текущий поток."}
        </Lead>

        <div className="lesson-practice-steps">
          <h3>{"Понять"}</h3>
          <p>{"Сформулировать основную модель своими словами."}</p>
          <h3>{"Проверить"}</h3>
          <p>{"Предсказать результат и запустить минимальный пример."}</p>
          <h3>{"Объяснить"}</h3>
          <p>{"Связать наблюдение с конкретной строкой или состоянием."}</p>
        </div>

        <CodeBlock
          caption={"минимальный эксперимент"}
          code={
            "import time\n" +
            "\n" +
            "print(\"A\")\n" +
            "time.sleep(1)\n" +
            "print(\"B\")\n" +
            "time.sleep(1)\n" +
            "print(\"C\")"
          }
        />

        <PredictOutput
          code={
            "import time\n" +
            "\n" +
            "print(\"A\")\n" +
            "time.sleep(1)\n" +
            "print(\"B\")"
          }
          output={
            "A\n" +
            "... пауза ...\n" +
            "B"
          }
          hint={"Следующая строка ждёт возврата sleep."}
        />

        <FillBlank prompt="Завершите измерение времени." before="elapsed = " after="() - started" options={["perf_counter", "asyncio.run", "print"]} answer="perf_counter" explanation="Одинаковые часы используются до и после измеряемого участка." />

        <Callout tone="info">
          {"Async не ускоряет CPU-bound вычисление автоматически."}
        </Callout>
      </Section>

      <Section number={"06"} title={"Timeline StudyHub"}>
        <Lead>
          {"Логи помогают увидеть, где программа вычисляет, а где просто ждёт."}
        </Lead>

        <div className="lesson-practice-steps">
          <h3>{"Понять"}</h3>
          <p>{"Сформулировать основную модель своими словами."}</p>
          <h3>{"Проверить"}</h3>
          <p>{"Предсказать результат и запустить минимальный пример."}</p>
          <h3>{"Объяснить"}</h3>
          <p>{"Связать наблюдение с конкретной строкой или состоянием."}</p>
        </div>

        <CodeBlock
          caption={"минимальный эксперимент"}
          code={
            "0.00 start\n" +
            "0.18 wait user\n" +
            "0.78 wait tasks\n" +
            "1.58 profile ready"
          }
        />

        <TerminalDemo
          title={"async-loader"}
          lines={[
            { cmd: "python async-loader/lab.py" },
            { out: "start" },
            { out: "observe model" },
            { out: "finish without hidden warnings" },
          ]}
        />

        <Callout tone="info">
          {"Async не ускоряет CPU-bound вычисление автоматически."}
        </Callout>
      </Section>

      <Section number={"07"} title={"Ошибка модели"}>
        <Lead>
          {"Объявление CPU-функции через async def не делает цикл параллельным."}
        </Lead>

        <div className="lesson-practice-steps">
          <h3>{"Понять"}</h3>
          <p>{"Сформулировать основную модель своими словами."}</p>
          <h3>{"Проверить"}</h3>
          <p>{"Предсказать результат и запустить минимальный пример."}</p>
          <h3>{"Объяснить"}</h3>
          <p>{"Связать наблюдение с конкретной строкой или состоянием."}</p>
        </div>

        <CodeBlock
          caption={"минимальный эксперимент"}
          code={
            "async def calculate_score(limit):\n" +
            "    return sum(i*i for i in range(limit))"
          }
        />

        <BugHunt
          code={
            "async def calculate_score(limit):\n" +
            "    return sum(i*i for i in range(limit))"
          }
          question={"Какое предположение о функции ошибочно?"}
          options={[
            "async def автоматически ускоряет вычисление",
            "sum можно использовать внутри функции",
            "return может вернуть вычисленный результат",
          ]}
          correctIndex={0}
          explanation={"В коде нет I/O и механизма параллельного вычисления, поэтому async def не делает расчёт быстрее."}
          fix={
            "def calculate_score(limit):\n" +
            "    return sum(i*i for i in range(limit))"
          }
        />

        <RecallCard question="Сформулируйте причину результата одним предложением." answer={<p>Модель подтверждается типом объекта, порядком логов, warning или измерением времени.</p>} />

        <Callout tone="info">
          {"Async не ускоряет CPU-bound вычисление автоматически."}
        </Callout>
      </Section>

      <Section number="08" title={"Контрольная точка и практика"}>
        <Lead>
          {"Соберите результат занятия в async-loader, воспроизведите успешный и ошибочный сценарии и объясните timeline без слова «магия»."}
        </Lead>

        <div className="lesson-check-group">
          <QuizCard
            question={"Что ограничивает CPU-bound операцию?"}
            options={[
              "скорость вычислений процессора",
              "только сеть",
              "наличие await",
            ]}
            correctIndex={0}
            explanation={"Ответ следует из основной модели и проверяется минимальным запуском."}
          />
          <QuizCard
            question={"Что характерно для I/O-bound?"}
            options={[
              "ожидание внешнего ресурса",
              "обязательный for",
              "автоматическая параллельность",
            ]}
            correctIndex={0}
            explanation={"Ответ следует из основной модели и проверяется минимальным запуском."}
          />
          <QuizCard
            question={"Два последовательных sleep(1) займут..."}
            options={[
              "около 2 секунд",
              "около 1 секунды",
              "0 секунд",
            ]}
            correctIndex={0}
            explanation={"Ответ следует из основной модели и проверяется минимальным запуском."}
          />
          <QuizCard
            question={"Что async def делает с CPU-кодом автоматически?"}
            options={[
              "не ускоряет",
              "распределяет по ядрам",
              "переносит в БД",
            ]}
            correctIndex={0}
            explanation={"Ответ следует из основной модели и проверяется минимальным запуском."}
          />
        </div>

        <KeyTakeaways
          points={[
            <>{"Сначала измеряется проблема."}</>,
            <>{"CPU-bound и I/O-bound имеют разные ограничения."}</>,
            <>{"Последовательные паузы складываются."}</>,
            <>{"Async не ускоряет CPU-код автоматически."}</>,
            <>{"Event loop использует паузы I/O."}</>,
            <>{"Baseline нужен для честного сравнения."}</>,
          ]}
        />

        <PracticeCta text={"Создайте async-loader/blocking_profile.py, измерьте три сценария и подпишите каждый участок как CPU-bound, I/O-bound или mixed."} />
      </Section>

    </RichLesson>
  );
}

export function Lesson142({ module }: LessonProps) {
  return (
    <RichLesson>
      <RichHero
        variant="project"
        chip={module ?? BLOCK_TITLE}
        title={"async def и coroutine object"}
        intro={"Разберём ключевое различие: async def создаёт coroutine-функцию, а обычный вызов возвращает coroutine object и не запускает тело."}
        tags={[
          { icon: <FunctionSquare size={14} />, label: "coroutine function" },
          { icon: <Braces size={14} />, label: "coroutine object" },
        ]}
      />
      <Callout tone="info">
        <strong>Связь с курсом.</strong> {"После поиска I/O-ожидания появляется объект будущей асинхронной операции."}{" "}
        <strong>Важно не перепутать:</strong> {"Вызов async-функции и выполнение её тела — разные события."}
      </Callout>

      <Section number={"01"} title={"Три уровня модели"}>
        <Lead>
          {"Нужно различать coroutine-функцию, object конкретного вызова и будущий результат."}
        </Lead>

        <div className="lesson-practice-steps">
          <h3>{"Понять"}</h3>
          <p>{"Сформулировать основную модель своими словами."}</p>
          <h3>{"Проверить"}</h3>
          <p>{"Предсказать результат и запустить минимальный пример."}</p>
          <h3>{"Объяснить"}</h3>
          <p>{"Связать наблюдение с конкретной строкой или состоянием."}</p>
        </div>

        <CodeBlock
          caption={"минимальный эксперимент"}
          code={
            "async def load_user():\n" +
            "    return {\"id\": 7}\n" +
            "\n" +
            "operation = load_user()"
          }
        />

        <TypeCards>
          <TypeCard badge={"model"} title={"Главная модель"} code={"async def load_user():"}>
            {"Нужно различать coroutine-функцию, object конкретного вызова и будущий результат."}
          </TypeCard>
          <TypeCard badge={"flow"} badgeTone="float" title={"Поток выполнения"} code={"async def load_user():"}>
            {"Print внутри async def не появится при обычном вызове без runner."}
          </TypeCard>
          <TypeCard badge={"check"} badgeTone="str" title={"Проверяемый результат"} code={"predict → run → explain"}>
            {"Каждое предположение подтверждается запуском, типом значения или измерением."}
          </TypeCard>
        </TypeCards>

        <Callout tone="info">
          {"Вызов async-функции и выполнение её тела — разные события."}
        </Callout>
      </Section>

      <Section number={"02"} title={"Тело ещё не выполняется"}>
        <Lead>
          {"Print внутри async def не появится при обычном вызове без runner."}
        </Lead>

        <div className="lesson-practice-steps">
          <h3>{"Понять"}</h3>
          <p>{"Сформулировать основную модель своими словами."}</p>
          <h3>{"Проверить"}</h3>
          <p>{"Предсказать результат и запустить минимальный пример."}</p>
          <h3>{"Объяснить"}</h3>
          <p>{"Связать наблюдение с конкретной строкой или состоянием."}</p>
        </div>

        <CodeBlock
          caption={"минимальный эксперимент"}
          code={
            "async def load_user():\n" +
            "    print(\"body started\")\n" +
            "    return {\"id\": 7}\n" +
            "\n" +
            "operation = load_user()\n" +
            "print(type(operation).__name__)"
          }
        />

        <MethodGrid
          rows={[
            [<>вход</>, "Нужно различать coroutine-функцию, object конкретного вызова и будущий результат."],
            [<>операция</>, "Coroutine object можно ожидать внутри другой coroutine, но он не является готовым dict."],
            [<>наблюдение</>, "Warning означает, что operation была создана и потеряна без выполнения."],
            [<>граница</>, "Вызов async-функции и выполнение её тела — разные события."],
          ]}
        />

        <MatchPairs
          prompt={"Соедините шаг лаборатории с его смыслом."}
          pairs={[
            { left: "понять", right: "сформулировать модель" },
            { left: "предсказать", right: "назвать результат до запуска" },
            { left: "запустить", right: "получить наблюдение" },
            { left: "объяснить", right: "связать код и результат" },
          ]}
          explanation={"Порядок эксперимента защищает от случайного запоминания синтаксиса."}
        />

        <Callout tone="info">
          {"Вызов async-функции и выполнение её тела — разные события."}
        </Callout>
      </Section>

      <Section number={"03"} title={"Coroutine — awaitable"}>
        <Lead>
          {"Coroutine object можно ожидать внутри другой coroutine, но он не является готовым dict."}
        </Lead>

        <div className="lesson-practice-steps">
          <h3>{"Понять"}</h3>
          <p>{"Сформулировать основную модель своими словами."}</p>
          <h3>{"Проверить"}</h3>
          <p>{"Предсказать результат и запустить минимальный пример."}</p>
          <h3>{"Объяснить"}</h3>
          <p>{"Связать наблюдение с конкретной строкой или состоянием."}</p>
        </div>

        <CodeBlock
          caption={"минимальный эксперимент"}
          code={
            "load_user\n" +
            "load_user()\n" +
            "await load_user()"
          }
        />

        <StepThrough
          code={
            "load_user\n" +
            "load_user()\n" +
            "await load_user()"
          }
          steps={[
            { line: 0, note: "Начинается сценарий и фиксируется исходное состояние.", vars: { этап: "1" } },
            { line: 1, note: "Выполняется первый значимый шаг.", vars: { этап: "2" } },
            { line: 1, note: "Наблюдается основная точка изменения или ожидания.", vars: { этап: "2" } },
            { line: 2, note: "Формируется итог, который сравнивается с прогнозом.", vars: { этап: "3" } },
          ]}
        />

        <Callout tone="info">
          {"Вызов async-функции и выполнение её тела — разные события."}
        </Callout>
      </Section>

      <Section number={"04"} title={"Аргументы будущего запуска"}>
        <Lead>
          {"Каждый вызов создаёт отдельный object, связанный со своими аргументами."}
        </Lead>

        <div className="lesson-practice-steps">
          <h3>{"Понять"}</h3>
          <p>{"Сформулировать основную модель своими словами."}</p>
          <h3>{"Проверить"}</h3>
          <p>{"Предсказать результат и запустить минимальный пример."}</p>
          <h3>{"Объяснить"}</h3>
          <p>{"Связать наблюдение с конкретной строкой или состоянием."}</p>
        </div>

        <CodeBlock
          caption={"минимальный эксперимент"}
          code={
            "first = load_task(1)\n" +
            "second = load_task(2)\n" +
            "print(first is second)"
          }
        />

        <CompareSolutions
          question={"Какой вариант точнее выражает модель занятия?"}
          left={{ title: "Готовые данные", code: "user = load_user(); user[\"id\"]", note: "Источник заблуждения или ограничение." }}
          right={{ title: "Будущая операция", code: "operation = load_user()", note: "Явный контракт и наблюдаемое поведение." }}
          preferred={"right"}
          explanation={"До await переменная содержит coroutine object, а не dict."}
        />

        <Callout tone="info">
          {"Вызов async-функции и выполнение её тела — разные события."}
        </Callout>
      </Section>

      <Section number={"05"} title={"Проверка через inspect"}>
        <Lead>
          {"inspect позволяет проверить функцию и object без догадок."}
        </Lead>

        <div className="lesson-practice-steps">
          <h3>{"Понять"}</h3>
          <p>{"Сформулировать основную модель своими словами."}</p>
          <h3>{"Проверить"}</h3>
          <p>{"Предсказать результат и запустить минимальный пример."}</p>
          <h3>{"Объяснить"}</h3>
          <p>{"Связать наблюдение с конкретной строкой или состоянием."}</p>
        </div>

        <CodeBlock
          caption={"минимальный эксперимент"}
          code={
            "inspect.iscoroutinefunction(load_user)\n" +
            "inspect.iscoroutine(operation)"
          }
        />

        <PredictOutput
          code={
            "operation = load_user()\n" +
            "print(type(operation).__name__)"
          }
          output={"coroutine"}
          hint={"Вызов async-функции создаёт object."}
        />

        <FillBlank prompt="Создайте coroutine object без запуска тела." before="operation = " after="" options={["load_user()", "await load_user()", "asyncio.run"]} answer="load_user()" explanation="Обычный вызов async-функции возвращает coroutine object." />

        <Callout tone="info">
          {"Вызов async-функции и выполнение её тела — разные события."}
        </Callout>
      </Section>

      <Section number={"06"} title={"Never awaited warning"}>
        <Lead>
          {"Warning означает, что operation была создана и потеряна без выполнения."}
        </Lead>

        <div className="lesson-practice-steps">
          <h3>{"Понять"}</h3>
          <p>{"Сформулировать основную модель своими словами."}</p>
          <h3>{"Проверить"}</h3>
          <p>{"Предсказать результат и запустить минимальный пример."}</p>
          <h3>{"Объяснить"}</h3>
          <p>{"Связать наблюдение с конкретной строкой или состоянием."}</p>
        </div>

        <CodeBlock
          caption={"минимальный эксперимент"}
          code={
            "operation = load_user()\n" +
            "print(\"created\")\n" +
            "# RuntimeWarning при завершении"
          }
        />

        <TerminalDemo
          title={"async-loader"}
          lines={[
            { cmd: "python async-loader/lab.py" },
            { out: "start" },
            { out: "observe model" },
            { out: "finish without hidden warnings" },
          ]}
        />

        <Callout tone="info">
          {"Вызов async-функции и выполнение её тела — разные события."}
        </Callout>
      </Section>

      <Section number={"07"} title={"Coroutine вместо данных"}>
        <Lead>
          {"Ошибка проявляется при попытке использовать object как list или dict."}
        </Lead>

        <div className="lesson-practice-steps">
          <h3>{"Понять"}</h3>
          <p>{"Сформулировать основную модель своими словами."}</p>
          <h3>{"Проверить"}</h3>
          <p>{"Предсказать результат и запустить минимальный пример."}</p>
          <h3>{"Объяснить"}</h3>
          <p>{"Связать наблюдение с конкретной строкой или состоянием."}</p>
        </div>

        <CodeBlock
          caption={"минимальный эксперимент"}
          code={
            "user = load_user()\n" +
            "print(user[\"name\"])"
          }
        />

        <BugHunt
          code={
            "user = load_user()\n" +
            "print(user[\"name\"])"
          }
          question={"Почему обращение по ключу не работает?"}
          options={[
            "user содержит coroutine object",
            "async не может вернуть dict",
            "ключ name запрещён",
          ]}
          correctIndex={0}
          explanation={"Тело load_user не выполнялось."}
          fix={
            "async def main():\n" +
            "    user = await load_user()\n" +
            "    print(user[\"name\"])"
          }
        />

        <RecallCard question="Сформулируйте причину результата одним предложением." answer={<p>Модель подтверждается типом объекта, порядком логов, warning или измерением времени.</p>} />

        <Callout tone="info">
          {"Вызов async-функции и выполнение её тела — разные события."}
        </Callout>
      </Section>

      <Section number="08" title={"Контрольная точка и практика"}>
        <Lead>
          {"Соберите результат занятия в async-loader, воспроизведите успешный и ошибочный сценарии и объясните timeline без слова «магия»."}
        </Lead>

        <div className="lesson-check-group">
          <QuizCard
            question={"Что возвращает вызов async-функции?"}
            options={[
              "coroutine object",
              "готовый dict",
              "event loop",
            ]}
            correctIndex={0}
            explanation={"Ответ следует из основной модели и проверяется минимальным запуском."}
          />
          <QuizCard
            question={"Когда выполняется тело?"}
            options={[
              "при await или runner",
              "при объявлении",
              "при импорте",
            ]}
            correctIndex={0}
            explanation={"Ответ следует из основной модели и проверяется минимальным запуском."}
          />
          <QuizCard
            question={"Что означает never awaited?"}
            options={[
              "object потерян без выполнения",
              "await выполнен дважды",
              "CPU перегружен",
            ]}
            correctIndex={0}
            explanation={"Ответ следует из основной модели и проверяется минимальным запуском."}
          />
          <QuizCard
            question={"load_user без скобок — это..."}
            options={[
              "coroutine function",
              "dict",
              "Task",
            ]}
            correctIndex={0}
            explanation={"Ответ следует из основной модели и проверяется минимальным запуском."}
          />
        </div>

        <KeyTakeaways
          points={[
            <>{"async def создаёт coroutine-функцию."}</>,
            <>{"Вызов возвращает coroutine object."}</>,
            <>{"Тело не выполняется автоматически."}</>,
            <>{"Coroutine object является awaitable."}</>,
            <>{"Never awaited сообщает о потерянной операции."}</>,
            <>{"inspect подтверждает модель экспериментом."}</>,
          ]}
        />

        <PracticeCta text={"Создайте coroutine_objects.py, проверьте функцию и три object через inspect и объясните, почему тело не запускалось."} />
      </Section>

    </RichLesson>
  );
}

export function Lesson143({ module }: LessonProps) {
  return (
    <RichLesson>
      <RichHero
        variant="project"
        chip={module ?? BLOCK_TITLE}
        title={"asyncio.run, event loop и первый await"}
        intro={"Запустим первую coroutine правильно: создадим async main, передадим её в asyncio.run и увидим suspend/resume на await asyncio.sleep."}
        tags={[
          { icon: <Play size={14} />, label: "asyncio.run и main" },
          { icon: <GitFork size={14} />, label: "suspend → resume" },
        ]}
      />
      <Callout tone="info">
        <strong>Связь с курсом.</strong> {"Coroutine object уже понятен; теперь asyncio.run становится исполнителем верхнеуровневого async-сценария."}{" "}
        <strong>Важно не перепутать:</strong> {"await не означает запуск в фоне и не создаёт отдельную Task автоматически."}
      </Callout>

      <Section number={"01"} title={"Async-точка входа"}>
        <Lead>
          {"await разрешён внутри async def, поэтому обычный файл получает async main и один runner."}
        </Lead>

        <div className="lesson-practice-steps">
          <h3>{"Понять"}</h3>
          <p>{"Сформулировать основную модель своими словами."}</p>
          <h3>{"Проверить"}</h3>
          <p>{"Предсказать результат и запустить минимальный пример."}</p>
          <h3>{"Объяснить"}</h3>
          <p>{"Связать наблюдение с конкретной строкой или состоянием."}</p>
        </div>

        <CodeBlock
          caption={"минимальный эксперимент"}
          code={
            "async def main():\n" +
            "    print(\"start\")\n" +
            "\n" +
            "asyncio.run(main())"
          }
        />

        <TypeCards>
          <TypeCard badge={"model"} title={"Главная модель"} code={"async def main():"}>
            {"await разрешён внутри async def, поэтому обычный файл получает async main и один runner."}
          </TypeCard>
          <TypeCard badge={"flow"} badgeTone="float" title={"Поток выполнения"} code={"async def main():"}>
            {"Coroutine выполняется до await, приостанавливается и позже продолжает следующую строку."}
          </TypeCard>
          <TypeCard badge={"check"} badgeTone="str" title={"Проверяемый результат"} code={"predict → run → explain"}>
            {"Каждое предположение подтверждается запуском, типом значения или измерением."}
          </TypeCard>
        </TypeCards>

        <Callout tone="info">
          {"await не означает запуск в фоне и не создаёт отдельную Task автоматически."}
        </Callout>
      </Section>

      <Section number={"02"} title={"Первый await"}>
        <Lead>
          {"Coroutine выполняется до await, приостанавливается и позже продолжает следующую строку."}
        </Lead>

        <div className="lesson-practice-steps">
          <h3>{"Понять"}</h3>
          <p>{"Сформулировать основную модель своими словами."}</p>
          <h3>{"Проверить"}</h3>
          <p>{"Предсказать результат и запустить минимальный пример."}</p>
          <h3>{"Объяснить"}</h3>
          <p>{"Связать наблюдение с конкретной строкой или состоянием."}</p>
        </div>

        <CodeBlock
          caption={"минимальный эксперимент"}
          code={
            "async def main():\n" +
            "    print(\"A\")\n" +
            "    await asyncio.sleep(0.5)\n" +
            "    print(\"B\")"
          }
        />

        <MethodGrid
          rows={[
            [<>вход</>, "await разрешён внутри async def, поэтому обычный файл получает async main и один runner."],
            [<>операция</>, "asyncio.run создаёт loop, выполняет main до завершения и закрывает служебные ресурсы."],
            [<>наблюдение</>, "Первый await завершается до перехода ко второму, если Task не создавались."],
            [<>граница</>, "await не означает запуск в фоне и не создаёт отдельную Task автоматически."],
          ]}
        />

        <MatchPairs
          prompt={"Соедините шаг лаборатории с его смыслом."}
          pairs={[
            { left: "понять", right: "сформулировать модель" },
            { left: "предсказать", right: "назвать результат до запуска" },
            { left: "запустить", right: "получить наблюдение" },
            { left: "объяснить", right: "связать код и результат" },
          ]}
          explanation={"Порядок эксперимента защищает от случайного запоминания синтаксиса."}
        />

        <Callout tone="info">
          {"await не означает запуск в фоне и не создаёт отдельную Task автоматически."}
        </Callout>
      </Section>

      <Section number={"03"} title={"Жизненный цикл runner"}>
        <Lead>
          {"asyncio.run создаёт loop, выполняет main до завершения и закрывает служебные ресурсы."}
        </Lead>

        <div className="lesson-practice-steps">
          <h3>{"Понять"}</h3>
          <p>{"Сформулировать основную модель своими словами."}</p>
          <h3>{"Проверить"}</h3>
          <p>{"Предсказать результат и запустить минимальный пример."}</p>
          <h3>{"Объяснить"}</h3>
          <p>{"Связать наблюдение с конкретной строкой или состоянием."}</p>
        </div>

        <CodeBlock
          caption={"минимальный эксперимент"}
          code={
            "main()\n" +
            "→ asyncio.run\n" +
            "→ event loop executes\n" +
            "→ main finished"
          }
        />

        <StepThrough
          code={
            "main()\n" +
            "→ asyncio.run\n" +
            "→ event loop executes\n" +
            "→ main finished"
          }
          steps={[
            { line: 0, note: "Начинается сценарий и фиксируется исходное состояние.", vars: { этап: "1" } },
            { line: 1, note: "Выполняется первый значимый шаг.", vars: { этап: "2" } },
            { line: 2, note: "Наблюдается основная точка изменения или ожидания.", vars: { этап: "3" } },
            { line: 3, note: "Формируется итог, который сравнивается с прогнозом.", vars: { этап: "4" } },
          ]}
        />

        <Callout tone="info">
          {"await не означает запуск в фоне и не создаёт отдельную Task автоматически."}
        </Callout>
      </Section>

      <Section number={"04"} title={"Suspend и resume"}>
        <Lead>
          {"await передаёт управление loop до готовности awaitable."}
        </Lead>

        <div className="lesson-practice-steps">
          <h3>{"Понять"}</h3>
          <p>{"Сформулировать основную модель своими словами."}</p>
          <h3>{"Проверить"}</h3>
          <p>{"Предсказать результат и запустить минимальный пример."}</p>
          <h3>{"Объяснить"}</h3>
          <p>{"Связать наблюдение с конкретной строкой или состоянием."}</p>
        </div>

        <CodeBlock
          caption={"минимальный эксперимент"}
          code={
            "user = await load_user()\n" +
            "print(user[\"id\"])"
          }
        />

        <CompareSolutions
          question={"Какой вариант точнее выражает модель занятия?"}
          left={{ title: "Blocking", code: "time.sleep(1)", note: "Источник заблуждения или ограничение." }}
          right={{ title: "Non-blocking", code: "await asyncio.sleep(1)", note: "Явный контракт и наблюдаемое поведение." }}
          preferred={"right"}
          explanation={"asyncio.sleep отдаёт управление event loop."}
        />

        <Callout tone="info">
          {"await не означает запуск в фоне и не создаёт отдельную Task автоматически."}
        </Callout>
      </Section>

      <Section number={"05"} title={"asyncio.sleep"}>
        <Lead>
          {"Неблокирующий таймер приостанавливает coroutine, а не удерживает поток."}
        </Lead>

        <div className="lesson-practice-steps">
          <h3>{"Понять"}</h3>
          <p>{"Сформулировать основную модель своими словами."}</p>
          <h3>{"Проверить"}</h3>
          <p>{"Предсказать результат и запустить минимальный пример."}</p>
          <h3>{"Объяснить"}</h3>
          <p>{"Связать наблюдение с конкретной строкой или состоянием."}</p>
        </div>

        <CodeBlock
          caption={"минимальный эксперимент"}
          code={"await asyncio.sleep(1)"}
        />

        <PredictOutput
          code={
            "async def main():\n" +
            "    print(\"A\")\n" +
            "    await asyncio.sleep(0.5)\n" +
            "    print(\"B\")\n" +
            "\n" +
            "asyncio.run(main())"
          }
          output={
            "A\n" +
            "... пауза ...\n" +
            "B"
          }
          hint={"main возобновится после таймера."}
        />

        <FillBlank prompt="Передайте верхнеуровневую coroutine в runner." before="asyncio.run(" after=")" options={["main()", "main", "await main()"]} answer="main()" explanation="asyncio.run получает coroutine object, созданный вызовом main()." />

        <Callout tone="info">
          {"await не означает запуск в фоне и не создаёт отдельную Task автоматически."}
        </Callout>
      </Section>

      <Section number={"06"} title={"Один main — последовательный flow"}>
        <Lead>
          {"Первый await завершается до перехода ко второму, если Task не создавались."}
        </Lead>

        <div className="lesson-practice-steps">
          <h3>{"Понять"}</h3>
          <p>{"Сформулировать основную модель своими словами."}</p>
          <h3>{"Проверить"}</h3>
          <p>{"Предсказать результат и запустить минимальный пример."}</p>
          <h3>{"Объяснить"}</h3>
          <p>{"Связать наблюдение с конкретной строкой или состоянием."}</p>
        </div>

        <CodeBlock
          caption={"минимальный эксперимент"}
          code={
            "user = await load_user()\n" +
            "tasks = await load_tasks(user[\"id\"])"
          }
        />

        <TerminalDemo
          title={"async-loader"}
          lines={[
            { cmd: "python async-loader/lab.py" },
            { out: "start" },
            { out: "observe model" },
            { out: "finish without hidden warnings" },
          ]}
        />

        <Callout tone="info">
          {"await не означает запуск в фоне и не создаёт отдельную Task автоматически."}
        </Callout>
      </Section>

      <Section number={"07"} title={"Ошибка await вне async def"}>
        <Lead>
          {"Обычный скрипт не разрешает await на верхнем уровне."}
        </Lead>

        <div className="lesson-practice-steps">
          <h3>{"Понять"}</h3>
          <p>{"Сформулировать основную модель своими словами."}</p>
          <h3>{"Проверить"}</h3>
          <p>{"Предсказать результат и запустить минимальный пример."}</p>
          <h3>{"Объяснить"}</h3>
          <p>{"Связать наблюдение с конкретной строкой или состоянием."}</p>
        </div>

        <CodeBlock
          caption={"минимальный эксперимент"}
          code={
            "user = await load_user()\n" +
            "print(user)"
          }
        />

        <BugHunt
          code={
            "user = await load_user()\n" +
            "print(user)"
          }
          question={"Почему обычный .py-файл не запускается?"}
          options={[
            "await находится вне async def",
            "dict запрещён",
            "asyncio нельзя импортировать",
          ]}
          correctIndex={0}
          explanation={"await должен находиться внутри async def."}
          fix={
            "async def main():\n" +
            "    user = await load_user()\n" +
            "    print(user)\n" +
            "\n" +
            "asyncio.run(main())"
          }
        />

        <RecallCard question="Сформулируйте причину результата одним предложением." answer={<p>Модель подтверждается типом объекта, порядком логов, warning или измерением времени.</p>} />

        <Callout tone="info">
          {"await не означает запуск в фоне и не создаёт отдельную Task автоматически."}
        </Callout>
      </Section>

      <Section number="08" title={"Контрольная точка и практика"}>
        <Lead>
          {"Соберите результат занятия в async-loader, воспроизведите успешный и ошибочный сценарии и объясните timeline без слова «магия»."}
        </Lead>

        <div className="lesson-check-group">
          <QuizCard
            question={"Что передают в asyncio.run?"}
            options={[
              "coroutine object",
              "готовый dict",
              "строку",
            ]}
            correctIndex={0}
            explanation={"Ответ следует из основной модели и проверяется минимальным запуском."}
          />
          <QuizCard
            question={"Где разрешён await?"}
            options={[
              "внутри async def",
              "везде",
              "только в классе",
            ]}
            correctIndex={0}
            explanation={"Ответ следует из основной модели и проверяется минимальным запуском."}
          />
          <QuizCard
            question={"Что делает asyncio.sleep?"}
            options={[
              "приостанавливает coroutine без блокировки loop",
              "создаёт процесс",
              "блокирует ОС",
            ]}
            correctIndex={0}
            explanation={"Ответ следует из основной модели и проверяется минимальным запуском."}
          />
          <QuizCard
            question={"Один await означает concurrency?"}
            options={[
              "нет",
              "всегда да",
              "только Linux",
            ]}
            correctIndex={0}
            explanation={"Ответ следует из основной модели и проверяется минимальным запуском."}
          />
        </div>

        <KeyTakeaways
          points={[
            <>{"async main — верхнеуровневый сценарий."}</>,
            <>{"asyncio.run управляет event loop."}</>,
            <>{"await приостанавливает текущую coroutine."}</>,
            <>{"После готовности происходит resume."}</>,
            <>{"asyncio.sleep не блокирует поток loop."}</>,
            <>{"Один main ещё не означает concurrency."}</>,
          ]}
        />

        <PracticeCta text={"Создайте first_async_loader.py, добавьте async main, один await, логи до и после ожидания и схему suspend/resume."} />
      </Section>

    </RichLesson>
  );
}

export function Lesson144({ module }: LessonProps) {
  return (
    <RichLesson>
      <RichHero
        variant="project"
        chip={module ?? BLOCK_TITLE}
        title={"Последовательные await и иллюзия асинхронности"}
        intro={"Измерим два await подряд и увидим сумму задержек: async-синтаксис уже есть, но event loop получает одну пользовательскую цепочку."}
        tags={[
          { icon: <Layers size={14} />, label: "два await подряд" },
          { icon: <Scale size={14} />, label: "измерение без иллюзий" },
        ]}
      />
      <Callout tone="info">
        <strong>Связь с курсом.</strong> {"Первый await корректен, но main всё ещё идёт по строкам."}{" "}
        <strong>Важно не перепутать:</strong> {"Неблокирующее ожидание и конкурентный запуск — разные свойства."}
      </Callout>

      <Section number={"01"} title={"Async может быть последовательным"}>
        <Lead>
          {"Вторая coroutine создаётся только после завершения первой строки await."}
        </Lead>

        <div className="lesson-practice-steps">
          <h3>{"Понять"}</h3>
          <p>{"Сформулировать основную модель своими словами."}</p>
          <h3>{"Проверить"}</h3>
          <p>{"Предсказать результат и запустить минимальный пример."}</p>
          <h3>{"Объяснить"}</h3>
          <p>{"Связать наблюдение с конкретной строкой или состоянием."}</p>
        </div>

        <CodeBlock
          caption={"минимальный эксперимент"}
          code={
            "user = await load_user()\n" +
            "tasks = await load_tasks()"
          }
        />

        <TypeCards>
          <TypeCard badge={"model"} title={"Главная модель"} code={"user = await load_user()"}>
            {"Вторая coroutine создаётся только после завершения первой строки await."}
          </TypeCard>
          <TypeCard badge={"flow"} badgeTone="float" title={"Поток выполнения"} code={"started = perf_counter()"}>
            {"Две одинаковые задержки по секунде дают elapsed около двух секунд."}
          </TypeCard>
          <TypeCard badge={"check"} badgeTone="str" title={"Проверяемый результат"} code={"predict → run → explain"}>
            {"Каждое предположение подтверждается запуском, типом значения или измерением."}
          </TypeCard>
        </TypeCards>

        <Callout tone="info">
          {"Неблокирующее ожидание и конкурентный запуск — разные свойства."}
        </Callout>
      </Section>

      <Section number={"02"} title={"Честное измерение"}>
        <Lead>
          {"Две одинаковые задержки по секунде дают elapsed около двух секунд."}
        </Lead>

        <div className="lesson-practice-steps">
          <h3>{"Понять"}</h3>
          <p>{"Сформулировать основную модель своими словами."}</p>
          <h3>{"Проверить"}</h3>
          <p>{"Предсказать результат и запустить минимальный пример."}</p>
          <h3>{"Объяснить"}</h3>
          <p>{"Связать наблюдение с конкретной строкой или состоянием."}</p>
        </div>

        <CodeBlock
          caption={"минимальный эксперимент"}
          code={
            "started = perf_counter()\n" +
            "user = await load_user()\n" +
            "tasks = await load_tasks()\n" +
            "print(perf_counter()-started)"
          }
        />

        <MethodGrid
          rows={[
            [<>вход</>, "Вторая coroutine создаётся только после завершения первой строки await."],
            [<>операция</>, "Во время первого ожидания другой пользовательской Task нет."],
            [<>наблюдение</>, "Start/ready-логи показывают перекрытие или его отсутствие."],
            [<>граница</>, "Неблокирующее ожидание и конкурентный запуск — разные свойства."],
          ]}
        />

        <MatchPairs
          prompt={"Соедините шаг лаборатории с его смыслом."}
          pairs={[
            { left: "понять", right: "сформулировать модель" },
            { left: "предсказать", right: "назвать результат до запуска" },
            { left: "запустить", right: "получить наблюдение" },
            { left: "объяснить", right: "связать код и результат" },
          ]}
          explanation={"Порядок эксперимента защищает от случайного запоминания синтаксиса."}
        />

        <Callout tone="info">
          {"Неблокирующее ожидание и конкурентный запуск — разные свойства."}
        </Callout>
      </Section>

      <Section number={"03"} title={"Loop нечего переключать"}>
        <Lead>
          {"Во время первого ожидания другой пользовательской Task нет."}
        </Lead>

        <div className="lesson-practice-steps">
          <h3>{"Понять"}</h3>
          <p>{"Сформулировать основную модель своими словами."}</p>
          <h3>{"Проверить"}</h3>
          <p>{"Предсказать результат и запустить минимальный пример."}</p>
          <h3>{"Объяснить"}</h3>
          <p>{"Связать наблюдение с конкретной строкой или состоянием."}</p>
        </div>

        <CodeBlock
          caption={"минимальный эксперимент"}
          code={
            "0.0 user:start\n" +
            "1.0 user:ready\n" +
            "1.0 tasks:start\n" +
            "2.0 tasks:ready"
          }
        />

        <StepThrough
          code={
            "0.0 user:start\n" +
            "1.0 user:ready\n" +
            "1.0 tasks:start\n" +
            "2.0 tasks:ready"
          }
          steps={[
            { line: 0, note: "Начинается сценарий и фиксируется исходное состояние.", vars: { этап: "1" } },
            { line: 1, note: "Выполняется первый значимый шаг.", vars: { этап: "2" } },
            { line: 2, note: "Наблюдается основная точка изменения или ожидания.", vars: { этап: "3" } },
            { line: 3, note: "Формируется итог, который сравнивается с прогнозом.", vars: { этап: "4" } },
          ]}
        />

        <Callout tone="info">
          {"Неблокирующее ожидание и конкурентный запуск — разные свойства."}
        </Callout>
      </Section>

      <Section number={"04"} title={"Sync и sequential async"}>
        <Lead>
          {"Оба flow последовательны; отличается блокировка потока, а не сумма latency одной цепочки."}
        </Lead>

        <div className="lesson-practice-steps">
          <h3>{"Понять"}</h3>
          <p>{"Сформулировать основную модель своими словами."}</p>
          <h3>{"Проверить"}</h3>
          <p>{"Предсказать результат и запустить минимальный пример."}</p>
          <h3>{"Объяснить"}</h3>
          <p>{"Связать наблюдение с конкретной строкой или состоянием."}</p>
        </div>

        <CodeBlock
          caption={"минимальный эксперимент"}
          code={
            "time.sleep(1)\n" +
            "time.sleep(1)\n" +
            "\n" +
            "await asyncio.sleep(1)\n" +
            "await asyncio.sleep(1)"
          }
        />

        <CompareSolutions
          question={"Какой вариант точнее выражает модель занятия?"}
          left={{ title: "Sync baseline", code: "time.sleep(1)\ntime.sleep(1)", note: "Источник заблуждения или ограничение." }}
          right={{ title: "Sequential async", code: "await asyncio.sleep(1)\nawait asyncio.sleep(1)", note: "Явный контракт и наблюдаемое поведение." }}
          preferred={"both"}
          explanation={"Оба варианта занимают около двух секунд; async лишь не блокирует loop."}
        />

        <Callout tone="info">
          {"Неблокирующее ожидание и конкурентный запуск — разные свойства."}
        </Callout>
      </Section>

      <Section number={"05"} title={"Граница create_task"}>
        <Lead>
          {"Отдельное планирование показано только как указатель на следующий блок."}
        </Lead>

        <div className="lesson-practice-steps">
          <h3>{"Понять"}</h3>
          <p>{"Сформулировать основную модель своими словами."}</p>
          <h3>{"Проверить"}</h3>
          <p>{"Предсказать результат и запустить минимальный пример."}</p>
          <h3>{"Объяснить"}</h3>
          <p>{"Связать наблюдение с конкретной строкой или состоянием."}</p>
        </div>

        <CodeBlock
          caption={"минимальный эксперимент"}
          code={"user_task = asyncio.create_task(load_user())"}
        />

        <PredictOutput
          code={
            "user = await load_user()   # 1 с\n" +
            "tasks = await load_tasks() # 1 с"
          }
          output={"примерно 2 секунды"}
          hint={"Второй await начинается позже."}
        />

        <FillBlank prompt="Дождитесь пользователя внутри async main." before="user = " after="" options={["await load_user()", "load_user()", "asyncio.run(load_user)"]} answer="await load_user()" explanation="await возвращает результат после завершения coroutine." />

        <Callout tone="info">
          {"Неблокирующее ожидание и конкурентный запуск — разные свойства."}
        </Callout>
      </Section>

      <Section number={"06"} title={"Timeline вместо слова быстро"}>
        <Lead>
          {"Start/ready-логи показывают перекрытие или его отсутствие."}
        </Lead>

        <div className="lesson-practice-steps">
          <h3>{"Понять"}</h3>
          <p>{"Сформулировать основную модель своими словами."}</p>
          <h3>{"Проверить"}</h3>
          <p>{"Предсказать результат и запустить минимальный пример."}</p>
          <h3>{"Объяснить"}</h3>
          <p>{"Связать наблюдение с конкретной строкой или состоянием."}</p>
        </div>

        <CodeBlock
          caption={"минимальный эксперимент"}
          code={
            "user:start 0.00\n" +
            "user:ready 1.00\n" +
            "tasks:start 1.00\n" +
            "tasks:ready 2.00"
          }
        />

        <TerminalDemo
          title={"async-loader"}
          lines={[
            { cmd: "python async-loader/lab.py" },
            { out: "start" },
            { out: "observe model" },
            { out: "finish without hidden warnings" },
          ]}
        />

        <Callout tone="info">
          {"Неблокирующее ожидание и конкурентный запуск — разные свойства."}
        </Callout>
      </Section>

      <Section number={"07"} title={"Недостоверный benchmark"}>
        <Lead>
          {"Нельзя сравнивать разные задержки и приписывать разницу только async."}
        </Lead>

        <div className="lesson-practice-steps">
          <h3>{"Понять"}</h3>
          <p>{"Сформулировать основную модель своими словами."}</p>
          <h3>{"Проверить"}</h3>
          <p>{"Предсказать результат и запустить минимальный пример."}</p>
          <h3>{"Объяснить"}</h3>
          <p>{"Связать наблюдение с конкретной строкой или состоянием."}</p>
        </div>

        <CodeBlock
          caption={"минимальный эксперимент"}
          code={
            "# sync delay=1\n" +
            "# async delay=0.2\n" +
            "# неверное сравнение"
          }
        />

        <BugHunt
          code={
            "# sync: sleep(1), sleep(1)\n" +
            "# async: sleep(0.2), sleep(0.2)"
          }
          question={"Почему benchmark неверен?"}
          options={[
            "в вариантах разные задержки",
            "perf_counter запрещён",
            "asyncio.sleep всегда медленнее",
          ]}
          correctIndex={0}
          explanation={"Изменены два фактора одновременно."}
          fix={
            "DELAY=1.0\n" +
            "# оба варианта используют DELAY"
          }
        />

        <RecallCard question="Сформулируйте причину результата одним предложением." answer={<p>Модель подтверждается типом объекта, порядком логов, warning или измерением времени.</p>} />

        <Callout tone="info">
          {"Неблокирующее ожидание и конкурентный запуск — разные свойства."}
        </Callout>
      </Section>

      <Section number="08" title={"Контрольная точка и практика"}>
        <Lead>
          {"Соберите результат занятия в async-loader, воспроизведите успешный и ошибочный сценарии и объясните timeline без слова «магия»."}
        </Lead>

        <div className="lesson-check-group">
          <QuizCard
            question={"Почему два await дают сумму?"}
            options={[
              "второй начинается после первого",
              "await блокирует ОС",
              "async запрещает таймеры",
            ]}
            correctIndex={0}
            explanation={"Ответ следует из основной модели и проверяется минимальным запуском."}
          />
          <QuizCard
            question={"Что нужно loop для переключения?"}
            options={[
              "несколько Task",
              "два имени",
              "два print",
            ]}
            correctIndex={0}
            explanation={"Ответ следует из основной модели и проверяется минимальным запуском."}
          />
          <QuizCard
            question={"Что измеряет perf_counter?"}
            options={[
              "elapsed",
              "число coroutine",
              "скорость сети",
            ]}
            correctIndex={0}
            explanation={"Ответ следует из основной модели и проверяется минимальным запуском."}
          />
          <QuizCard
            question={"Что нельзя заключать по async def?"}
            options={[
              "что код concurrent",
              "что это coroutine function",
              "что возможен await",
            ]}
            correctIndex={0}
            explanation={"Ответ следует из основной модели и проверяется минимальным запуском."}
          />
        </div>

        <KeyTakeaways
          points={[
            <>{"Async-код может быть последовательным."}</>,
            <>{"Два await идут по порядку строк."}</>,
            <>{"Неблокирующее ожидание не равно concurrency."}</>,
            <>{"Loop не ускоряет одну цепочку без другой Task."}</>,
            <>{"Timeline защищает от иллюзий."}</>,
            <>{"create_task изучается в блоке 26."}</>,
          ]}
        />

        <PracticeCta text={"Сравните sync baseline и sequential async с одинаковой DELAY и нарисуйте timeline без перекрытия."} />
      </Section>

    </RichLesson>
  );
}

export function Lesson145({ module }: LessonProps) {
  return (
    <RichLesson>
      <RichHero
        variant="project"
        chip={module ?? BLOCK_TITLE}
        title={"Ошибки async-кода: забытый await и блокировка loop"}
        intro={"Соберём диагностический порядок для двух главных дефектов: coroutine object попал вместо данных и blocking call удержал поток event loop."}
        tags={[
          { icon: <Bug size={14} />, label: "forgotten await" },
          { icon: <Wrench size={14} />, label: "blocked event loop" },
        ]}
      />
      <Callout tone="info">
        <strong>Связь с курсом.</strong> {"После корректного await ошибки можно разделить на потерянную coroutine и блокировку потока."}{" "}
        <strong>Важно не перепутать:</strong> {"Не каждый медленный async-сценарий означает blocked loop."}
      </Callout>

      <Section number={"01"} title={"Два класса ошибок"}>
        <Lead>
          {"Forgotten await ломает данные, blocking call ломает планирование."}
        </Lead>

        <div className="lesson-practice-steps">
          <h3>{"Понять"}</h3>
          <p>{"Сформулировать основную модель своими словами."}</p>
          <h3>{"Проверить"}</h3>
          <p>{"Предсказать результат и запустить минимальный пример."}</p>
          <h3>{"Объяснить"}</h3>
          <p>{"Связать наблюдение с конкретной строкой или состоянием."}</p>
        </div>

        <CodeBlock
          caption={"минимальный эксперимент"}
          code={
            "tasks = load_tasks()\n" +
            "\n" +
            "time.sleep(1)"
          }
        />

        <TypeCards>
          <TypeCard badge={"model"} title={"Главная модель"} code={"tasks = load_tasks()"}>
            {"Forgotten await ломает данные, blocking call ломает планирование."}
          </TypeCard>
          <TypeCard badge={"flow"} badgeTone="float" title={"Поток выполнения"} code={"tasks = load_tasks()"}>
            {"Причина часто находится раньше TypeError — в строке вызова без await."}
          </TypeCard>
          <TypeCard badge={"check"} badgeTone="str" title={"Проверяемый результат"} code={"predict → run → explain"}>
            {"Каждое предположение подтверждается запуском, типом значения или измерением."}
          </TypeCard>
        </TypeCards>

        <Callout tone="info">
          {"Не каждый медленный async-сценарий означает blocked loop."}
        </Callout>
      </Section>

      <Section number={"02"} title={"Coroutine вместо list"}>
        <Lead>
          {"Причина часто находится раньше TypeError — в строке вызова без await."}
        </Lead>

        <div className="lesson-practice-steps">
          <h3>{"Понять"}</h3>
          <p>{"Сформулировать основную модель своими словами."}</p>
          <h3>{"Проверить"}</h3>
          <p>{"Предсказать результат и запустить минимальный пример."}</p>
          <h3>{"Объяснить"}</h3>
          <p>{"Связать наблюдение с конкретной строкой или состоянием."}</p>
        </div>

        <CodeBlock
          caption={"минимальный эксперимент"}
          code={
            "tasks = load_tasks()\n" +
            "print(type(tasks).__name__)\n" +
            "print(len(tasks))"
          }
        />

        <MethodGrid
          rows={[
            [<>вход</>, "Forgotten await ломает данные, blocking call ломает планирование."],
            [<>операция</>, "Never awaited указывает имя и место создания object."],
            [<>наблюдение</>, "Sync HTTP-клиент или Session базы могут удерживать поток."],
            [<>граница</>, "Не каждый медленный async-сценарий означает blocked loop."],
          ]}
        />

        <MatchPairs
          prompt={"Соедините шаг лаборатории с его смыслом."}
          pairs={[
            { left: "понять", right: "сформулировать модель" },
            { left: "предсказать", right: "назвать результат до запуска" },
            { left: "запустить", right: "получить наблюдение" },
            { left: "объяснить", right: "связать код и результат" },
          ]}
          explanation={"Порядок эксперимента защищает от случайного запоминания синтаксиса."}
        />

        <Callout tone="info">
          {"Не каждый медленный async-сценарий означает blocked loop."}
        </Callout>
      </Section>

      <Section number={"03"} title={"Warning как навигация"}>
        <Lead>
          {"Never awaited указывает имя и место создания object."}
        </Lead>

        <div className="lesson-practice-steps">
          <h3>{"Понять"}</h3>
          <p>{"Сформулировать основную модель своими словами."}</p>
          <h3>{"Проверить"}</h3>
          <p>{"Предсказать результат и запустить минимальный пример."}</p>
          <h3>{"Объяснить"}</h3>
          <p>{"Связать наблюдение с конкретной строкой или состоянием."}</p>
        </div>

        <CodeBlock
          caption={"минимальный эксперимент"}
          code={
            "python -X dev broken_await.py\n" +
            "RuntimeWarning: coroutine was never awaited"
          }
        />

        <StepThrough
          code={
            "python -X dev broken_await.py\n" +
            "RuntimeWarning: coroutine was never awaited"
          }
          steps={[
            { line: 0, note: "Начинается сценарий и фиксируется исходное состояние.", vars: { этап: "1" } },
            { line: 1, note: "Выполняется первый значимый шаг.", vars: { этап: "2" } },
            { line: 1, note: "Наблюдается основная точка изменения или ожидания.", vars: { этап: "2" } },
            { line: 1, note: "Формируется итог, который сравнивается с прогнозом.", vars: { этап: "2" } },
          ]}
        />

        <Callout tone="info">
          {"Не каждый медленный async-сценарий означает blocked loop."}
        </Callout>
      </Section>

      <Section number={"04"} title={"time.sleep блокирует loop"}>
        <Lead>
          {"Обычная sync-функция остаётся blocking внутри async def."}
        </Lead>

        <div className="lesson-practice-steps">
          <h3>{"Понять"}</h3>
          <p>{"Сформулировать основную модель своими словами."}</p>
          <h3>{"Проверить"}</h3>
          <p>{"Предсказать результат и запустить минимальный пример."}</p>
          <h3>{"Объяснить"}</h3>
          <p>{"Связать наблюдение с конкретной строкой или состоянием."}</p>
        </div>

        <CodeBlock
          caption={"минимальный эксперимент"}
          code={
            "async def bad():\n" +
            "    time.sleep(1)"
          }
        />

        <CompareSolutions
          question={"Какой вариант точнее выражает модель занятия?"}
          left={{ title: "Blocking", code: "time.sleep(1)", note: "Источник заблуждения или ограничение." }}
          right={{ title: "Non-blocking", code: "await asyncio.sleep(1)", note: "Явный контракт и наблюдаемое поведение." }}
          preferred={"right"}
          explanation={"Неблокирующий вариант отдаёт управление loop."}
        />

        <Callout tone="info">
          {"Не каждый медленный async-сценарий означает blocked loop."}
        </Callout>
      </Section>

      <Section number={"05"} title={"Heartbeat"}>
        <Lead>
          {"Пропавшие ticks показывают, что loop не получал управление."}
        </Lead>

        <div className="lesson-practice-steps">
          <h3>{"Понять"}</h3>
          <p>{"Сформулировать основную модель своими словами."}</p>
          <h3>{"Проверить"}</h3>
          <p>{"Предсказать результат и запустить минимальный пример."}</p>
          <h3>{"Объяснить"}</h3>
          <p>{"Связать наблюдение с конкретной строкой или состоянием."}</p>
        </div>

        <CodeBlock
          caption={"минимальный эксперимент"}
          code={
            "async def heartbeat():\n" +
            "    while True:\n" +
            "        print(\"tick\")\n" +
            "        await asyncio.sleep(0.2)"
          }
        />

        <PredictOutput
          code={
            "tasks = load_tasks()\n" +
            "print(type(tasks).__name__)"
          }
          output={"coroutine"}
          hint={"Без await это object операции."}
        />

        <FillBlank prompt="Замените блокирующую паузу." before="" after="(1)" options={["await asyncio.sleep", "time.sleep", "asyncio.run"]} answer="await asyncio.sleep" explanation="asyncio.sleep отдаёт управление event loop, а time.sleep удерживает поток." />

        <Callout tone="info">
          {"Не каждый медленный async-сценарий означает blocked loop."}
        </Callout>
      </Section>

      <Section number={"06"} title={"Blocking library"}>
        <Lead>
          {"Sync HTTP-клиент или Session базы могут удерживать поток."}
        </Lead>

        <div className="lesson-practice-steps">
          <h3>{"Понять"}</h3>
          <p>{"Сформулировать основную модель своими словами."}</p>
          <h3>{"Проверить"}</h3>
          <p>{"Предсказать результат и запустить минимальный пример."}</p>
          <h3>{"Объяснить"}</h3>
          <p>{"Связать наблюдение с конкретной строкой или состоянием."}</p>
        </div>

        <CodeBlock
          caption={"минимальный эксперимент"}
          code={
            "requests.get(...)\n" +
            "await async_client.get(...)"
          }
        />

        <TerminalDemo
          title={"async-loader"}
          lines={[
            { cmd: "python async-loader/lab.py" },
            { out: "start" },
            { out: "observe model" },
            { out: "finish without hidden warnings" },
          ]}
        />

        <Callout tone="info">
          {"Не каждый медленный async-сценарий означает blocked loop."}
        </Callout>
      </Section>

      <Section number={"07"} title={"Runbook диагностики"}>
        <Lead>
          {"Минимальный пример → type → warning → blocking call → одна правка → повторная проверка."}
        </Lead>

        <div className="lesson-practice-steps">
          <h3>{"Понять"}</h3>
          <p>{"Сформулировать основную модель своими словами."}</p>
          <h3>{"Проверить"}</h3>
          <p>{"Предсказать результат и запустить минимальный пример."}</p>
          <h3>{"Объяснить"}</h3>
          <p>{"Связать наблюдение с конкретной строкой или состоянием."}</p>
        </div>

        <CodeBlock
          caption={"минимальный эксперимент"}
          code={
            "reproduce\n" +
            "→ inspect\n" +
            "→ fix one cause\n" +
            "→ verify"
          }
        />

        <BugHunt
          code={
            "async def main():\n" +
            "    tasks = load_tasks()\n" +
            "    print(len(tasks))"
          }
          question={"Как восстановить контракт list?"}
          options={[
            "tasks = await load_tasks()",
            "tasks = list(load_tasks())",
            "await tasks.append(1)",
          ]}
          correctIndex={0}
          explanation={"Нужно выполнить coroutine до результата."}
          fix={
            "async def main():\n" +
            "    tasks = await load_tasks()\n" +
            "    print(len(tasks))"
          }
        />

        <RecallCard question="Сформулируйте причину результата одним предложением." answer={<p>Модель подтверждается типом объекта, порядком логов, warning или измерением времени.</p>} />

        <Callout tone="info">
          {"Не каждый медленный async-сценарий означает blocked loop."}
        </Callout>
      </Section>

      <Section number="08" title={"Контрольная точка и практика"}>
        <Lead>
          {"Соберите результат занятия в async-loader, воспроизведите успешный и ошибочный сценарии и объясните timeline без слова «магия»."}
        </Lead>

        <div className="lesson-check-group">
          <QuizCard
            question={"type(value)==coroutine вместо list означает..."}
            options={[
              "забыт await",
              "loop быстрый",
              "ошибка SQL",
            ]}
            correctIndex={0}
            explanation={"Ответ следует из основной модели и проверяется минимальным запуском."}
          />
          <QuizCard
            question={"time.sleep внутри async def..."}
            options={[
              "блокирует поток",
              "становится awaitable",
              "создаёт Task",
            ]}
            correctIndex={0}
            explanation={"Ответ следует из основной модели и проверяется минимальным запуском."}
          />
          <QuizCard
            question={"Первый шаг диагностики..."}
            options={[
              "минимальный repro",
              "create_task везде",
              "скрыть warning",
            ]}
            correctIndex={0}
            explanation={"Ответ следует из основной модели и проверяется минимальным запуском."}
          />
          <QuizCard
            question={"Heartbeat показывает..."}
            options={[
              "получает ли loop управление",
              "правильность SQL",
              "тип функции",
            ]}
            correctIndex={0}
            explanation={"Ответ следует из основной модели и проверяется минимальным запуском."}
          />
        </div>

        <KeyTakeaways
          points={[
            <>{"Forgotten await передаёт coroutine вместо результата."}</>,
            <>{"Warning ведёт к месту создания object."}</>,
            <>{"time.sleep блокирует поток loop."}</>,
            <>{"async def не меняет sync-библиотеку."}</>,
            <>{"Диагностика начинается с repro."}</>,
            <>{"Исправление подтверждается тем же timeline."}</>,
          ]}
        />

        <PracticeCta text={"Создайте broken_cases.py с четырьмя дефектами и таблицу symptom → cause → fix → verification."} />
      </Section>

    </RichLesson>
  );
}

export function Lesson146({ module }: LessonProps) {
  return (
    <RichLesson>
      <RichHero
        variant="project"
        chip={module ?? BLOCK_TITLE}
        title={"Мини-проект: трассировка асинхронного загрузчика"}
        intro={"Соберём последовательный async-loader профиля StudyHub: coroutine для пользователя и задач, обычную статистику, async main, измерение времени и ожидаемую ошибку."}
        tags={[
          { icon: <Layers size={14} />, label: "profile loader" },
          { icon: <ListChecks size={14} />, label: "timeline и проверка" },
        ]}
      />
      <Callout tone="info">
        <strong>Связь с курсом.</strong> {"Все базовые элементы соединяются в один воспроизводимый сценарий."}{" "}
        <strong>Важно не перепутать:</strong> {"Loader остаётся последовательным; create_task, timeout и cancellation относятся к блоку 26."}
      </Callout>

      <Section number={"01"} title={"Контракт проекта"}>
        <Lead>
          {"user_id проходит через user, tasks, stats и итоговый profile."}
        </Lead>

        <div className="lesson-practice-steps">
          <h3>{"Понять"}</h3>
          <p>{"Сформулировать основную модель своими словами."}</p>
          <h3>{"Проверить"}</h3>
          <p>{"Предсказать результат и запустить минимальный пример."}</p>
          <h3>{"Объяснить"}</h3>
          <p>{"Связать наблюдение с конкретной строкой или состоянием."}</p>
        </div>

        <CodeBlock
          caption={"минимальный эксперимент"}
          code={
            "user_id\n" +
            "→ await load_user\n" +
            "→ await load_tasks\n" +
            "→ calculate_stats\n" +
            "→ profile"
          }
        />

        <TypeCards>
          <TypeCard badge={"model"} title={"Главная модель"} code={"user_id"}>
            {"user_id проходит через user, tasks, stats и итоговый profile."}
          </TypeCard>
          <TypeCard badge={"flow"} badgeTone="float" title={"Поток выполнения"} code={"async-loader/"}>
            {"Источники, orchestration, ошибки, тесты и README разделены по ответственности."}
          </TypeCard>
          <TypeCard badge={"check"} badgeTone="str" title={"Проверяемый результат"} code={"predict → run → explain"}>
            {"Каждое предположение подтверждается запуском, типом значения или измерением."}
          </TypeCard>
        </TypeCards>

        <Callout tone="info">
          {"Loader остаётся последовательным; create_task, timeout и cancellation относятся к блоку 26."}
        </Callout>
      </Section>

      <Section number={"02"} title={"Структура файлов"}>
        <Lead>
          {"Источники, orchestration, ошибки, тесты и README разделены по ответственности."}
        </Lead>

        <div className="lesson-practice-steps">
          <h3>{"Понять"}</h3>
          <p>{"Сформулировать основную модель своими словами."}</p>
          <h3>{"Проверить"}</h3>
          <p>{"Предсказать результат и запустить минимальный пример."}</p>
          <h3>{"Объяснить"}</h3>
          <p>{"Связать наблюдение с конкретной строкой или состоянием."}</p>
        </div>

        <CodeBlock
          caption={"минимальный эксперимент"}
          code={
            "async-loader/\n" +
            "├── sources.py\n" +
            "├── profile_loader.py\n" +
            "├── errors.py\n" +
            "├── test_profile_loader.py\n" +
            "└── README.md"
          }
        />

        <MethodGrid
          rows={[
            [<>вход</>, "user_id проходит через user, tasks, stats и итоговый profile."],
            [<>операция</>, "Каждый источник логирует start/ready, ожидает I/O и возвращает данные."],
            [<>наблюдение</>, "Точка входа измеряет полный сценарий и печатает один итог."],
            [<>граница</>, "Loader остаётся последовательным; create_task, timeout и cancellation относятся к блоку 26."],
          ]}
        />

        <MatchPairs
          prompt={"Соедините шаг лаборатории с его смыслом."}
          pairs={[
            { left: "понять", right: "сформулировать модель" },
            { left: "предсказать", right: "назвать результат до запуска" },
            { left: "запустить", right: "получить наблюдение" },
            { left: "объяснить", right: "связать код и результат" },
          ]}
          explanation={"Порядок эксперимента защищает от случайного запоминания синтаксиса."}
        />

        <Callout tone="info">
          {"Loader остаётся последовательным; create_task, timeout и cancellation относятся к блоку 26."}
        </Callout>
      </Section>

      <Section number={"03"} title={"Coroutine-источники"}>
        <Lead>
          {"Каждый источник логирует start/ready, ожидает I/O и возвращает данные."}
        </Lead>

        <div className="lesson-practice-steps">
          <h3>{"Понять"}</h3>
          <p>{"Сформулировать основную модель своими словами."}</p>
          <h3>{"Проверить"}</h3>
          <p>{"Предсказать результат и запустить минимальный пример."}</p>
          <h3>{"Объяснить"}</h3>
          <p>{"Связать наблюдение с конкретной строкой или состоянием."}</p>
        </div>

        <CodeBlock
          caption={"минимальный эксперимент"}
          code={
            "async def load_user(user_id):\n" +
            "    await asyncio.sleep(0.4)\n" +
            "    if user_id == 404:\n" +
            "        raise UserNotFoundError(user_id)\n" +
            "    return {\"id\": user_id}"
          }
        />

        <StepThrough
          code={
            "async def load_user(user_id):\n" +
            "    await asyncio.sleep(0.4)\n" +
            "    if user_id == 404:\n" +
            "        raise UserNotFoundError(user_id)\n" +
            "    return {\"id\": user_id}"
          }
          steps={[
            { line: 0, note: "Начинается сценарий и фиксируется исходное состояние.", vars: { этап: "1" } },
            { line: 1, note: "Выполняется первый значимый шаг.", vars: { этап: "2" } },
            { line: 2, note: "Наблюдается основная точка изменения или ожидания.", vars: { этап: "3" } },
            { line: 4, note: "Формируется итог, который сравнивается с прогнозом.", vars: { этап: "5" } },
          ]}
        />

        <Callout tone="info">
          {"Loader остаётся последовательным; create_task, timeout и cancellation относятся к блоку 26."}
        </Callout>
      </Section>

      <Section number={"04"} title={"Обычная статистика"}>
        <Lead>
          {"Локальное вычисление без I/O остаётся обычным def."}
        </Lead>

        <div className="lesson-practice-steps">
          <h3>{"Понять"}</h3>
          <p>{"Сформулировать основную модель своими словами."}</p>
          <h3>{"Проверить"}</h3>
          <p>{"Предсказать результат и запустить минимальный пример."}</p>
          <h3>{"Объяснить"}</h3>
          <p>{"Связать наблюдение с конкретной строкой или состоянием."}</p>
        </div>

        <CodeBlock
          caption={"минимальный эксперимент"}
          code={
            "def calculate_stats(tasks):\n" +
            "    total=len(tasks)\n" +
            "    done=sum(t[\"is_done\"] for t in tasks)\n" +
            "    return {\"total\":total,\"done\":done}"
          }
        />

        <CompareSolutions
          question={"Какой вариант точнее выражает модель занятия?"}
          left={{ title: "Лишняя coroutine", code: "async def calculate_stats(tasks): ...", note: "Источник заблуждения или ограничение." }}
          right={{ title: "Обычная функция", code: "def calculate_stats(tasks): ...", note: "Явный контракт и наблюдаемое поведение." }}
          preferred={"right"}
          explanation={"Локальное вычисление без await честнее оставить синхронным."}
        />

        <Callout tone="info">
          {"Loader остаётся последовательным; create_task, timeout и cancellation относятся к блоку 26."}
        </Callout>
      </Section>

      <Section number={"05"} title={"Зависимый build_profile"}>
        <Lead>
          {"Tasks используют user.id, поэтому порядок предметно необходим."}
        </Lead>

        <div className="lesson-practice-steps">
          <h3>{"Понять"}</h3>
          <p>{"Сформулировать основную модель своими словами."}</p>
          <h3>{"Проверить"}</h3>
          <p>{"Предсказать результат и запустить минимальный пример."}</p>
          <h3>{"Объяснить"}</h3>
          <p>{"Связать наблюдение с конкретной строкой или состоянием."}</p>
        </div>

        <CodeBlock
          caption={"минимальный эксперимент"}
          code={
            "async def build_profile(user_id):\n" +
            "    user=await load_user(user_id)\n" +
            "    tasks=await load_tasks(user[\"id\"])\n" +
            "    return {\"user\":user,\"tasks\":tasks,\"stats\":calculate_stats(tasks)}"
          }
        />

        <PredictOutput
          code={
            "user=await load_user(7)\n" +
            "tasks=await load_tasks(user[\"id\"])"
          }
          output={
            "user:start\n" +
            "user:ready\n" +
            "tasks:start\n" +
            "tasks:ready"
          }
          hint={"Tasks начинаются после user."}
        />

        <FillBlank prompt="Получите готовый профиль в main." before="profile = " after="" options={["await build_profile()", "build_profile()", "asyncio.run"]} answer="await build_profile()" explanation="build_profile — async-функция, поэтому её результат получают через await." />

        <Callout tone="info">
          {"Loader остаётся последовательным; create_task, timeout и cancellation относятся к блоку 26."}
        </Callout>
      </Section>

      <Section number={"06"} title={"main и timeline"}>
        <Lead>
          {"Точка входа измеряет полный сценарий и печатает один итог."}
        </Lead>

        <div className="lesson-practice-steps">
          <h3>{"Понять"}</h3>
          <p>{"Сформулировать основную модель своими словами."}</p>
          <h3>{"Проверить"}</h3>
          <p>{"Предсказать результат и запустить минимальный пример."}</p>
          <h3>{"Объяснить"}</h3>
          <p>{"Связать наблюдение с конкретной строкой или состоянием."}</p>
        </div>

        <CodeBlock
          caption={"минимальный эксперимент"}
          code={
            "async def main(user_id=7):\n" +
            "    started=perf_counter()\n" +
            "    profile=await build_profile(user_id)\n" +
            "    print(profile, perf_counter()-started)"
          }
        />

        <TerminalDemo
          title={"async-loader"}
          lines={[
            { cmd: "python async-loader/lab.py" },
            { out: "start" },
            { out: "observe model" },
            { out: "finish without hidden warnings" },
          ]}
        />

        <Callout tone="info">
          {"Loader остаётся последовательным; create_task, timeout и cancellation относятся к блоку 26."}
        </Callout>
      </Section>

      <Section number={"07"} title={"Ожидаемая ошибка"}>
        <Lead>
          {"Main переводит UserNotFoundError в понятное CLI-сообщение."}
        </Lead>

        <div className="lesson-practice-steps">
          <h3>{"Понять"}</h3>
          <p>{"Сформулировать основную модель своими словами."}</p>
          <h3>{"Проверить"}</h3>
          <p>{"Предсказать результат и запустить минимальный пример."}</p>
          <h3>{"Объяснить"}</h3>
          <p>{"Связать наблюдение с конкретной строкой или состоянием."}</p>
        </div>

        <CodeBlock
          caption={"минимальный эксперимент"}
          code={
            "try:\n" +
            "    profile=await build_profile(404)\n" +
            "except UserNotFoundError as error:\n" +
            "    print(f\"profile:error:{error}\")"
          }
        />

        <BugHunt
          code={
            "profile = await build_profile(404)\n" +
            "print(profile)"
          }
          question={"Где обработать ожидаемое отсутствие пользователя?"}
          options={[
            "в main вокруг build_profile",
            "в calculate_stats",
            "подавить в load_user",
          ]}
          correctIndex={0}
          explanation={"Main является границей пользовательского сценария."}
          fix={
            "try:\n" +
            "    profile=await build_profile(404)\n" +
            "except UserNotFoundError as error:\n" +
            "    print(error)"
          }
        />

        <RecallCard question="Сформулируйте причину результата одним предложением." answer={<p>Модель подтверждается типом объекта, порядком логов, warning или измерением времени.</p>} />

        <Callout tone="info">
          {"Loader остаётся последовательным; create_task, timeout и cancellation относятся к блоку 26."}
        </Callout>
      </Section>

      <Section number="08" title={"Контрольная точка и практика"}>
        <Lead>
          {"Соберите результат занятия в async-loader, воспроизведите успешный и ошибочный сценарии и объясните timeline без слова «магия»."}
        </Lead>

        <div className="lesson-check-group">
          <QuizCard
            question={"Какая функция должна быть def?"}
            options={[
              "calculate_stats",
              "load_user",
              "async main",
            ]}
            correctIndex={0}
            explanation={"Ответ следует из основной модели и проверяется минимальным запуском."}
          />
          <QuizCard
            question={"Где обрабатывать CLI-ошибку?"}
            options={[
              "в main",
              "в случайном helper",
              "голым except везде",
            ]}
            correctIndex={0}
            explanation={"Ответ следует из основной модели и проверяется минимальным запуском."}
          />
          <QuizCard
            question={"Почему user→tasks последовательны?"}
            options={[
              "tasks использует user.id",
              "async запрещает concurrency",
              "perf_counter требует",
            ]}
            correctIndex={0}
            explanation={"Ответ следует из основной модели и проверяется минимальным запуском."}
          />
          <QuizCard
            question={"Что станет baseline блока 26?"}
            options={[
              "измеренный sequential loader",
              "случайный benchmark",
              "FastAPI endpoint",
            ]}
            correctIndex={0}
            explanation={"Ответ следует из основной модели и проверяется минимальным запуском."}
          />
        </div>

        <KeyTakeaways
          points={[
            <>{"Проект имеет async entry point."}</>,
            <>{"Источники являются coroutine."}</>,
            <>{"Зависимый flow последовательный."}</>,
            <>{"Статистика остаётся def."}</>,
            <>{"Elapsed измеряет полный сценарий."}</>,
            <>{"Ошибка обрабатывается в main."}</>,
            <>{"Loader становится baseline следующего блока."}</>,
          ]}
        />

        <PracticeCta text={"Соберите async-loader, добавьте user_id=7 и 404, три теста и README с timeline и командами запуска."} />
      </Section>

    </RichLesson>
  );
}
