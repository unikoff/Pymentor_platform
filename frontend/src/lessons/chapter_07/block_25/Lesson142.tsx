import { Braces, FunctionSquare } from "lucide-react";
import { BugHunt, Callout, CodeBlock, CompareSolutions, FillBlank, KeyTakeaways, Lead, MatchPairs, MethodGrid, PracticeCta, PredictOutput, QuizCard, RecallCard, RichHero, RichLesson, Section, StepThrough, TerminalDemo, TypeCard, TypeCards } from "../../shared";
const BLOCK_TITLE = "Блок 25 · Coroutine, event loop и async/await";

type LessonProps = { module?: string };

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
