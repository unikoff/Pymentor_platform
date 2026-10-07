import { Layers, ListChecks } from "lucide-react";
import { BranchExplorer, BugHunt, Callout, CodeBlock, CodeSequence, CompareSolutions, KeyTakeaways, Lead, MatchPairs, MethodGrid, PracticeCta, PredictOutput, QuizCard, RecallCard, RichHero, RichLesson, Section, StepThrough, TerminalDemo, TrueFalse, TypeCard, TypeCards } from "../../shared";
import { TheoryBridge } from "../../shared";
const BLOCK_TITLE = "Блок 26 · Конкурентные задачи и управляемое ожидание";

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
      <TheoryBridge link={"После ручного создания нескольких Task нужен один coordination point, который дождётся группы и вернёт сопоставимые результаты."} boundary={"Порядок завершения и порядок списка результатов gather — разные вещи."} />

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
