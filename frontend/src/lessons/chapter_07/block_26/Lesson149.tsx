import { Clock3, TimerReset } from "lucide-react";
import { BranchExplorer, BugHunt, Callout, CodeBlock, CodeSequence, CompareSolutions, KeyTakeaways, Lead, MatchPairs, MethodGrid, PracticeCta, QuizCard, RecallCard, RichHero, RichLesson, Section, StepThrough, TerminalDemo, TrueFalse, TypeCard, TypeCards } from "../../shared";
import { TheoryBridge } from "../../shared";
const BLOCK_TITLE = "Блок 26 · Конкурентные задачи и управляемое ожидание";

export function Lesson149({ module }: { module?: string }) {
  return (
    <RichLesson>
      <RichHero
        variant="project"
        chip={module ?? BLOCK_TITLE}
        title={"Timeout через asyncio.wait_for"}
        intro={"Ограничим время внешней операции: wait_for, TimeoutError, отмена внутренней coroutine, fallback и различие локального и общего бюджета."}
        tags={[
          { icon: <TimerReset size={14} />, label: "wait_for · TimeoutError" },
          { icon: <Clock3 size={14} />, label: "deadline и fallback" },
        ]}
      />
      <TheoryBridge link={"Конкурентный gather уменьшает общее ожидание, но одна зависшая операция всё ещё способна удерживать весь сценарий."} boundary={"Timeout ограничивает одну попытку, но не является retry и не исправляет внешний источник."} />

      <Section number={"01"} title={"Зачем нужен временной бюджет"}>
        <Lead>
          {"Пользователь не должен ждать рекомендации бесконечно. Для каждого источника задаётся максимально допустимое ожидание."}
        </Lead>

        <div className="lesson-practice-steps">
          <h3>{"Главная модель"}</h3>
          <p>{"Deadline является частью контракта интеграции."}</p>
          <h3>{"Контролируемое изменение"}</h3>
          <p>{"Измените delay, порядок входов, timeout или concurrency limit. Сначала запишите прогноз, затем запустите пример."}</p>
          <h3>{"Профессиональная граница"}</h3>
          <p>{"Большой timeout тоже удерживает ресурсы."}</p>
        </div>

        <CodeBlock
          caption={"пример 149.1"}
          code={"result = await asyncio.wait_for(\n    load_recommendations(7),\n    timeout=0.3,\n)"}
        />

        <BranchExplorer
          code={"Зачем нужен временной бюджет\n├─ success → result\n├─ expected failure → explicit policy\n├─ timeout/cancel → cleanup\n└─ unexpected defect → visible error"}
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

      <Section number={"02"} title={"Минимальная модель wait_for"}>
        <Lead>
          {"Wait_for возвращает исходный результат при успехе либо инициирует отмену и поднимает TimeoutError."}
        </Lead>

        <div className="lesson-practice-steps">
          <h3>{"Главная модель"}</h3>
          <p>{"Awaitable и timeout передаются явно."}</p>
          <h3>{"Контролируемое изменение"}</h3>
          <p>{"Измените delay, порядок входов, timeout или concurrency limit. Сначала запишите прогноз, затем запустите пример."}</p>
          <h3>{"Профессиональная граница"}</h3>
          <p>{"В Python 3.10 встречается asyncio.TimeoutError."}</p>
        </div>

        <CodeBlock
          caption={"пример 149.2"}
          code={"try:\n    data = await asyncio.wait_for(source(), 0.3)\nexcept asyncio.TimeoutError:\n    data = []"}
        />

        <TypeCards>
          <TypeCard badge="вход" title="Что получает механизм" code={"try:"}>
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

      <Section number={"03"} title={"Timeout использует cancellation"}>
        <Lead>
          {"При исчерпании бюджета внутренняя coroutine получает отмену и выполняет finally."}
        </Lead>

        <div className="lesson-practice-steps">
          <h3>{"Главная модель"}</h3>
          <p>{"Caller получает TimeoutError после завершения cancellation path."}</p>
          <h3>{"Контролируемое изменение"}</h3>
          <p>{"Измените delay, порядок входов, timeout или concurrency limit. Сначала запишите прогноз, затем запустите пример."}</p>
          <h3>{"Профессиональная граница"}</h3>
          <p>{"Wall-clock время может немного превысить budget из-за cleanup."}</p>
        </div>

        <CodeBlock
          caption={"пример 149.3"}
          code={"async def source(events):\n    events.append(\"open\")\n    try:\n        await asyncio.sleep(10)\n    finally:\n        events.append(\"close\")"}
        />

        <StepThrough
          code={"async def source(events):\n    events.append(\"open\")\n    try:\n        await asyncio.sleep(10)\n    finally:\n        events.append(\"close\")"}
          steps={[
            { line: 0, note: "Создаётся или настраивается async-операция.", vars: { этап: "start" } },
            { line: 1, note: "Event loop получает точку для переключения.", vars: { состояние: "waiting" } },
            { line: 5, note: "Caller получает результат либо отдельный сбой.", vars: { этап: "observed outcome" } },
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

      <Section number={"04"} title={"Локальный и общий timeout"}>
        <Lead>
          {"Можно ограничить один optional source либо всю gather-группу. Это разные границы отказа."}
        </Lead>

        <div className="lesson-practice-steps">
          <h3>{"Главная модель"}</h3>
          <p>{"Локальный timeout сохраняет независимые полезные данные."}</p>
          <h3>{"Контролируемое изменение"}</h3>
          <p>{"Измените delay, порядок входов, timeout или concurrency limit. Сначала запишите прогноз, затем запустите пример."}</p>
          <h3>{"Профессиональная граница"}</h3>
          <p>{"Общий timeout подходит только для атомарного результата."}</p>
        </div>

        <CodeBlock
          caption={"пример 149.4"}
          code={"optional = await asyncio.wait_for(\n    load_optional(),\n    timeout=0.4,\n)"}
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
            code: "optional = await asyncio.wait_for(\n    load_optional(),\n    timeout=0.4,\n)",
            note: "Видны операция, ожидание и форма результата.",
          }}
          preferred="right"
          explanation={"Профессиональный код показывает, кто создаёт работу, кто её ожидает и что происходит при сбое."}
        />

        <Callout tone="info">
          <strong>{"Проверка."}</strong> {" Объясните, что сейчас только создаётся, что уже выполняется, где coroutine отдаёт управление и какой исход наблюдает caller."}
        </Callout>
      </Section>

      <Section number={"05"} title={"Timeout не равен retry"}>
        <Lead>
          {"Timeout отвечает, сколько ждать попытку. Retry решает, запускать ли новую попытку после определённого сбоя."}
        </Lead>

        <div className="lesson-practice-steps">
          <h3>{"Главная модель"}</h3>
          <p>{"Retry требует лимита, backoff и общего deadline."}</p>
          <h3>{"Контролируемое изменение"}</h3>
          <p>{"Измените delay, порядок входов, timeout или concurrency limit. Сначала запишите прогноз, затем запустите пример."}</p>
          <h3>{"Профессиональная граница"}</h3>
          <p>{"Бесконечный цикл повторов усиливает проблему зависимости."}</p>
        </div>

        <CodeBlock
          caption={"пример 149.5"}
          code={"async def safe_load():\n    try:\n        return await asyncio.wait_for(load_data(), 0.2)\n    except asyncio.TimeoutError:\n        return {\"status\": \"timeout\", \"data\": None}"}
        />

        <BugHunt
          code={"async def safe_load():\n    try:\n        return await asyncio.wait_for(load_data(), 0.2)\n    except asyncio.TimeoutError:\n        return {\"status\": \"timeout\", \"data\": None}"}
          question={"Какой контракт чаще всего нарушают при неосторожной обработке этого кода?"}
          options={[
            "Теряется наблюдаемость результата, ошибки или cleanup",
            "Python запрещает несколько async-функций",
            "Event loop всегда создаёт новый process",
          ]}
          correctIndex={0}
          explanation={"Async-код должен сохранять жизненный цикл операции и явно обрабатывать ожидаемый исход."}
          fix={"async def safe_load():\n    try:\n        return await asyncio.wait_for(load_data(), 0.2)\n    except asyncio.TimeoutError:\n        return {\"status\": \"timeout\", \"data\": None}"}
        />
        <Callout>
          Не исправляйте async-проблему широким <code>except</code> и пустым значением: сначала назовите нарушенный контракт.
        </Callout>

        <Callout tone="info">
          <strong>{"Проверка."}</strong> {" Объясните, что сейчас только создаётся, что уже выполняется, где coroutine отдаёт управление и какой исход наблюдает caller."}
        </Callout>
      </Section>

      <Section number={"06"} title={"Fallback рекомендаций"}>
        <Lead>
          {"Optional recommendations возвращают status success, timeout или error. Основной профиль остаётся полезным."}
        </Lead>

        <div className="lesson-practice-steps">
          <h3>{"Главная модель"}</h3>
          <p>{"Fallback сообщает качество результата, а не притворяется успехом."}</p>
          <h3>{"Контролируемое изменение"}</h3>
          <p>{"Измените delay, порядок входов, timeout или concurrency limit. Сначала запишите прогноз, затем запустите пример."}</p>
          <h3>{"Профессиональная граница"}</h3>
          <p>{"Unexpected defects не превращаются в пустой список."}</p>
        </div>

        <CodeBlock
          caption={"пример 149.6"}
          code={"return {\n    \"status\": \"timeout\",\n    \"items\": [],\n    \"message\": \"deadline exceeded\",\n}"}
        />

        <BranchExplorer
          code={"Fallback рекомендаций\n├─ success → result\n├─ expected failure → explicit policy\n├─ timeout/cancel → cleanup\n└─ unexpected defect → visible error"}
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

      <Section number={"07"} title={"Тест success, timeout и cleanup"}>
        <Lead>
          {"Fake source получает delay. Тест проверяет TimeoutError и события open/close."}
        </Lead>

        <div className="lesson-practice-steps">
          <h3>{"Главная модель"}</h3>
          <p>{"Контролируемая задержка делает сценарий воспроизводимым."}</p>
          <h3>{"Контролируемое изменение"}</h3>
          <p>{"Измените delay, порядок входов, timeout или concurrency limit. Сначала запишите прогноз, затем запустите пример."}</p>
          <h3>{"Профессиональная граница"}</h3>
          <p>{"Проверяется не только ответ, но и освобождение ресурса."}</p>
        </div>

        <CodeBlock
          caption={"пример 149.7"}
          code={"with pytest.raises(asyncio.TimeoutError):\n    await asyncio.wait_for(\n        fake_source(1.0, events),\n        timeout=0.01,\n    )\nassert events == [\"open\", \"close\"]"}
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
          {"Ученик объясняет wait_for → cancellation → finally → TimeoutError и выбирает правильную границу бюджета."}
        </Lead>

        <div className="lesson-practice-steps">
          <h3>{"Главная модель"}</h3>
          <p>{"Timeout, retry и fallback решают разные задачи."}</p>
          <h3>{"Контролируемое изменение"}</h3>
          <p>{"Измените delay, порядок входов, timeout или concurrency limit. Сначала запишите прогноз, затем запустите пример."}</p>
          <h3>{"Профессиональная граница"}</h3>
          <p>{"Следующий урок разбирает cancellation напрямую."}</p>
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
