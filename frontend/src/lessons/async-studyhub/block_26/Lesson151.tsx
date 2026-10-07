import { Gauge, UsersRound } from "lucide-react";
import { BranchExplorer, BugHunt, Callout, CodeBlock, CodeSequence, CompareSolutions, KeyTakeaways, Lead, MatchPairs, MethodGrid, PracticeCta, PredictOutput, QuizCard, RecallCard, RichHero, RichLesson, Section, StepThrough, TerminalDemo, TrueFalse, TypeCard, TypeCards } from "../../shared";
import { TheoryBridge } from "../../shared";
const BLOCK_TITLE = "Блок 26 · Конкурентные задачи и управляемое ожидание";

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
      <TheoryBridge link={"Операции уже имеют timeout и cancellation-safe cleanup, но неограниченный gather способен перегрузить внешний сервис или pool."} boundary={"Semaphore ограничивает число Task внутри защищённой секции, а не число созданных Task."} />

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
