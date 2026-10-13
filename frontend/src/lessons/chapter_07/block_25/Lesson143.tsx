import { GitFork, Play } from "lucide-react";
import { BugHunt, Callout, CodeBlock, CompareSolutions, FillBlank, KeyTakeaways, Lead, MatchPairs, MethodGrid, PracticeCta, PredictOutput, QuizCard, RecallCard, RichHero, RichLesson, Section, StepThrough, TerminalDemo, TypeCard, TypeCards } from "../../shared";
const BLOCK_TITLE = "Блок 25 · Coroutine, event loop и async/await";

type LessonProps = { module?: string };

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
