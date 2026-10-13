import { Layers, Scale } from "lucide-react";
import { BugHunt, Callout, CodeBlock, CompareSolutions, FillBlank, KeyTakeaways, Lead, MatchPairs, MethodGrid, PracticeCta, PredictOutput, QuizCard, RecallCard, RichHero, RichLesson, Section, StepThrough, TerminalDemo, TypeCard, TypeCards } from "../../shared";
const BLOCK_TITLE = "Блок 25 · Coroutine, event loop и async/await";

type LessonProps = { module?: string };

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
