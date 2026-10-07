import { Bug, Wrench } from "lucide-react";
import { BugHunt, Callout, CodeBlock, CompareSolutions, FillBlank, KeyTakeaways, Lead, MatchPairs, MethodGrid, PracticeCta, PredictOutput, QuizCard, RecallCard, RichHero, RichLesson, Section, StepThrough, TerminalDemo, TypeCard, TypeCards } from "../../shared";
const BLOCK_TITLE = "Блок 25 · Coroutine, event loop и async/await";

type LessonProps = { module?: string };

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
