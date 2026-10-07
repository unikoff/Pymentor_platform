import { Play, Workflow } from "lucide-react";
import { BranchExplorer, BugHunt, Callout, CodeBlock, CodeSequence, CompareSolutions, KeyTakeaways, Lead, MatchPairs, MethodGrid, PracticeCta, PredictOutput, QuizCard, RecallCard, RichHero, RichLesson, Section, StepThrough, TerminalDemo, TrueFalse, TypeCard, TypeCards } from "../../shared";
import { TheoryBridge } from "../../shared";
const BLOCK_TITLE = "Блок 26 · Конкурентные задачи и управляемое ожидание";

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
      <TheoryBridge link={"В блоке 25 coroutine запускались через asyncio.run и ожидались последовательно. Теперь coroutine становится Task, которую event loop может продвигать независимо от текущей строки main."} boundary={"Task не является OS thread и не делает CPU-вычисления параллельными."} />

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
