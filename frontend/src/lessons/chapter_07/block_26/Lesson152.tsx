import { Boxes, Workflow } from "lucide-react";
import { BranchExplorer, BugHunt, Callout, CodeBlock, CodeSequence, CompareSolutions, KeyTakeaways, Lead, MatchPairs, MethodGrid, PracticeCta, PredictOutput, QuizCard, RichHero, RichLesson, Section, TerminalDemo, TrueFalse, TypeCard, TypeCards } from "../../shared";
import { TheoryBridge } from "../../shared";
const BLOCK_TITLE = "Блок 26 · Конкурентные задачи и управляемое ожидание";

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
      <TheoryBridge link={"Финальный урок объединяет create_task, gather, wait_for, cancellation и Semaphore в один сервисный сценарий."} boundary={"Частичный результат допустим только при явном status и разделении required и optional sources."} />

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
