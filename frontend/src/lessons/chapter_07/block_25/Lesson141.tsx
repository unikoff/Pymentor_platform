import { Play, Scale } from "lucide-react";
import { BugHunt, Callout, CodeBlock, CompareSolutions, FillBlank, KeyTakeaways, Lead, MatchPairs, MethodGrid, PracticeCta, PredictOutput, QuizCard, RecallCard, RichHero, RichLesson, Section, StepThrough, TerminalDemo, TypeCard, TypeCards } from "../../shared";
const BLOCK_TITLE = "Блок 25 · Coroutine, event loop и async/await";

type LessonProps = { module?: string };

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
