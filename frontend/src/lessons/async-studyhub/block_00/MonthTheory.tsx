import { BrainCircuit, Gauge } from "lucide-react";
import { BranchExplorer, BugHunt, Callout, CodeBlock, CodeSequence, CompareSolutions, KeyTakeaways, Lead, MethodGrid, PracticeCta, PredictOutput, QuizCard, RichHero, RichLesson, Section, StepThrough, TrueFalse, TypeCard, TypeCards } from "../../shared";

export function MonthTheory() {
  return (
    <RichLesson>
      <RichHero
        variant={"project"}
        chip={"ЭТАП 7 · общая теория"}
        title={"Асинхронность и производительность backend"}
        intro={"Единая модель этапа: coroutine выполняет Python-код до await, отдаёт управление event loop на время I/O, затем возобновляется. Task, timeout, cancellation, AsyncClient и AsyncSession добавляются как управляемые части одного request-flow."}
        tags={[
          {
            icon: <BrainCircuit size={14} />,
            label: "event loop и coroutine",
          },
          {
            icon: <Gauge size={14} />,
            label: "измерение и наблюдаемость",
          },
        ]}
      />

      <Section number={"01"} title={"Главная проблема: процесс работает или ждёт"}>
        <Lead>
          {"Асинхронность начинается не с ключевого слова async, а с различия между вычислением и ожиданием. Пока Python вычисляет hash или сортирует большой список, процесс занят. Пока сокет ждёт байты или driver ждёт PostgreSQL, внешняя система выполняет свою часть работы."}
        </Lead>

        <div className="lesson-route">
          <ol>
            <li>
              <strong>{"CPU work:"}</strong>
              {" интерпретатор выполняет инструкции и не может просто перепрыгнуть середину вычисления."}
            </li>
            <li>
              <strong>{"I/O wait:"}</strong>
              {" операция зависит от сети, диска или базы и временно не имеет готового результата."}
            </li>
            <li>
              <strong>{"Blocking API:"}</strong>
              {" вызывающая функция удерживает поток до завершения операции."}
            </li>
            <li>
              <strong>{"Awaitable API:"}</strong>
              {" coroutine может приостановиться и вернуть управление event loop."}
            </li>
            <li>
              <strong>{"Latency:"}</strong>
              {" время одного завершённого запроса."}
            </li>
            <li>
              <strong>{"Throughput:"}</strong>
              {" количество завершённых операций за промежуток времени."}
            </li>
          </ol>
          <p>
            {"Async полезен, когда в одном процессе есть несколько независимых I/O-ожиданий и существует другая готовая работа. Он не сокращает саму длительность внешнего запроса."}
          </p>
        </div>

        <MethodGrid
          rows={[
            [
              <>{"CPU-bound"}</>,
              <>{"password hashing, image processing, большой Python-loop"}</>,
            ],
            [
              <>{"I/O-bound"}</>,
              <>{"HTTP request, database query, network read"}</>,
            ],
            [
              <>{"blocking"}</>,
              <>{"поток не может выполнять другую Python-работу"}</>,
            ],
            [
              <>{"non-blocking wait"}</>,
              <>{"event loop может продолжить другую готовую coroutine"}</>,
            ],
            [
              <>{"latency"}</>,
              <>{"время одного response"}</>,
            ],
            [
              <>{"throughput"}</>,
              <>{"число responses за период"}</>,
            ],
            [
              <>{"concurrency"}</>,
              <>{"несколько незавершённых операций в одном временном интервале"}</>,
            ],
          ]}
        />

        <CodeBlock
          caption={"сравнение двух ожиданий"}
          code={"def blocking():\n    time.sleep(1)\n\nasync def cooperative():\n    await asyncio.sleep(1)\n\n# одинаковая пауза по смыслу,\n# разное поведение для event loop"}
        />

        <CompareSolutions
          question={"Какое ожидание отдаёт управление event loop?"}
          left={{
            title: "time.sleep",
            code: "async def job():\n    time.sleep(1)",
            note: "Поток остановлен, loop не выполняет другие coroutine.",
          }}
          right={{
            title: "asyncio.sleep",
            code: "async def job():\n    await asyncio.sleep(1)",
            note: "Coroutine приостанавливается, loop может продолжить другую задачу.",
          }}
          preferred={"right"}
          explanation={"Значение имеет не слово sleep, а способность операции сотрудничать с event loop."}
        />

        <TypeCards>
          <TypeCard
            badge={"CPU"}
            title={"Вычисление"}
            code={"for ...: calculate()"}
          >
            {"Python реально выполняет инструкции; await не делает вычисление параллельным."}
          </TypeCard>
          <TypeCard
            badge={"I/O"}
            badgeTone={"float"}
            title={"Внешнее ожидание"}
            code={"await client.get(...)"}
          >
            {"Результат зависит от другой системы и может быть awaited."}
          </TypeCard>
          <TypeCard
            badge={"block"}
            badgeTone={"str"}
            title={"Заблокированный loop"}
            code={"time.sleep(...)"}
          >
            {"Даже другие готовые coroutine не получают время выполнения."}
          </TypeCard>
          <TypeCard
            badge={"switch"}
            title={"Cooperative wait"}
            code={"await ..."}
          >
            {"Текущая coroutine явно отдаёт управление до готовности результата."}
          </TypeCard>
        </TypeCards>

        <div className="lesson-practice-steps">
          <h3>{"Назвать ресурс"}</h3>
          <p>
            {"Определить, кто готовит результат: CPU, сеть, диск или database server."}
          </p>

          <h3>{"Найти точку ожидания"}</h3>
          <p>
            {"Показать строку, где результат ещё не готов."}
          </p>

          <h3>{"Проверить library"}</h3>
          <p>
            {"Узнать, возвращает ли операция awaitable или блокирует поток."}
          </p>

          <h3>{"Сформулировать пользу"}</h3>
          <p>
            {"Назвать другую готовую работу, которую loop сможет выполнить."}
          </p>

        </div>

        <Callout tone={"info"}>
          {"Async и parallel execution не являются синонимами. Один event loop обычно исполняет Python-код одной coroutine за раз."}
        </Callout>

        <Callout tone={"warn"}>
          {"Если у программы нет другой готовой работы, await не обязан сделать один request быстрее."}
        </Callout>

      </Section>

      <Section number={"02"} title={"Coroutine object и роль event loop"}>
        <Lead>
          {"Async-функция при вызове ведёт себя не как обычная функция. Она возвращает coroutine object — объект, описывающий будущую работу. Для выполнения нужен event loop, который запускает coroutine, приостанавливает её на await и возобновляет после готовности результата."}
        </Lead>

        <div className="lesson-route">
          <ol>
            <li>
              <strong>{"Объявить:"}</strong>
              {" async def создаёт coroutine function."}
            </li>
            <li>
              <strong>{"Вызвать:"}</strong>
              {" fetch() возвращает coroutine object без выполнения тела."}
            </li>
            <li>
              <strong>{"Запустить:"}</strong>
              {" asyncio.run(main()) создаёт loop для entry coroutine."}
            </li>
            <li>
              <strong>{"Приостановить:"}</strong>
              {" await сообщает, что текущий результат ещё не готов."}
            </li>
            <li>
              <strong>{"Возобновить:"}</strong>
              {" loop продолжает coroutine после завершения awaited operation."}
            </li>
            <li>
              <strong>{"Завершить:"}</strong>
              {" результат или exception возвращается ожидающей coroutine."}
            </li>
          </ol>
          <p>
            {"Точная модель защищает от распространённой ошибки: сохранить coroutine object в переменную и обращаться к нему как к готовому dict, list или HTTP response."}
          </p>
        </div>

        <MethodGrid
          rows={[
            [
              <>{"coroutine function"}</>,
              <>{"функция, объявленная async def"}</>,
            ],
            [
              <>{"coroutine object"}</>,
              <>{"объект, созданный вызовом async-функции"}</>,
            ],
            [
              <>{"entry coroutine"}</>,
              <>{"main, переданная asyncio.run"}</>,
            ],
            [
              <>{"event loop"}</>,
              <>{"исполнитель и scheduler coroutine"}</>,
            ],
            [
              <>{"awaitable"}</>,
              <>{"объект, результат которого можно ожидать"}</>,
            ],
            [
              <>{"result"}</>,
              <>{"значение после полного завершения coroutine"}</>,
            ],
            [
              <>{"exception"}</>,
              <>{"ошибка, которая распространяется в точке await"}</>,
            ],
          ]}
        />

        <CodeBlock
          caption={"первый запуск"}
          code={"import asyncio\n\nasync def fetch_name():\n    await asyncio.sleep(0.1)\n    return \"StudyHub\"\n\nasync def main():\n    name = await fetch_name()\n    print(name)\n\nasyncio.run(main())"}
        />

        <StepThrough
          code={"async def fetch():\n    await io_wait()\n    return \"data\"\n\njob = fetch()\nresult = await job"}
          steps={[
            {
              line: 0,
              note: "Python создаёт coroutine function fetch.",
              vars: {
                "fetch": "coroutine function",
              },
            },
            {
              line: 4,
              note: "Вызов создаёт coroutine object, тело ещё не завершено.",
              vars: {
                "job": "<coroutine object>",
              },
            },
            {
              line: 5,
              note: "await передаёт job event loop и приостанавливает caller.",
              vars: {
                "caller": "waiting",
              },
            },
            {
              line: 1,
              note: "На I/O wait coroutine отдаёт управление.",
              vars: {
                "job": "suspended",
              },
            },
            {
              line: 2,
              note: "После готовности I/O coroutine возвращает значение.",
              vars: {
                "result": "\"data\"",
              },
            },
          ]}
        />

        <TypeCards>
          <TypeCard
            badge={"define"}
            title={"async def"}
            code={"async def fetch(): ..."}
          >
            {"Создаёт специальную функцию, тело которой выполняется через loop."}
          </TypeCard>
          <TypeCard
            badge={"create"}
            badgeTone={"float"}
            title={"Call"}
            code={"job = fetch()"}
          >
            {"Создаёт coroutine object, но не превращает его в данные."}
          </TypeCard>
          <TypeCard
            badge={"run"}
            badgeTone={"str"}
            title={"Event loop"}
            code={"asyncio.run(main())"}
          >
            {"Запускает entry coroutine и обслуживает awaited operations."}
          </TypeCard>
          <TypeCard
            badge={"receive"}
            title={"Await"}
            code={"data = await job"}
          >
            {"Получает итоговое значение или exception после завершения."}
          </TypeCard>
        </TypeCards>

        <div className="lesson-practice-steps">
          <h3>{"Напечатать object"}</h3>
          <p>
            {"Увидеть repr coroutine до выполнения."}
          </p>

          <h3>{"Получить warning"}</h3>
          <p>
            {"Намеренно завершить программу с never awaited coroutine."}
          </p>

          <h3>{"Добавить await"}</h3>
          <p>
            {"Получить реальное return-value."}
          </p>

          <h3>{"Проследить exception"}</h3>
          <p>
            {"Поднять ошибку внутри coroutine и увидеть её в точке await."}
          </p>

        </div>

        <Callout tone={"info"}>
          {"asyncio.run обычно вызывается один раз в entry point обычного скрипта. Внутри уже работающего FastAPI event loop его не запускают заново."}
        </Callout>

        <Callout tone={"warn"}>
          {"Попытка использовать coroutine object как dict или response означает, что результат ещё не был awaited."}
        </Callout>

      </Section>

      <Section number={"03"} title={"Await, scheduling и последовательность событий"}>
        <Lead>
          {"await имеет две роли: получить итог awaited operation и при необходимости позволить event loop выполнить другую готовую работу. Но если другой работы не запланировано, два await подряд остаются обычной последовательностью."}
        </Lead>

        <div className="lesson-route">
          <ol>
            <li>
              <strong>{"Начало coroutine:"}</strong>
              {" Python выполняет инструкции до первой незавершённой awaitable operation."}
            </li>
            <li>
              <strong>{"Suspend:"}</strong>
              {" состояние локальных переменных сохраняется."}
            </li>
            <li>
              <strong>{"Schedule:"}</strong>
              {" loop выбирает другую ready Task, если она существует."}
            </li>
            <li>
              <strong>{"Resume:"}</strong>
              {" после готовности результата coroutine продолжает строку после await."}
            </li>
            <li>
              <strong>{"Sequential await:"}</strong>
              {" вторая операция создаётся только после завершения первой."}
            </li>
            <li>
              <strong>{"Concurrent schedule:"}</strong>
              {" независимые операции создаются до общего ожидания."}
            </li>
          </ol>
          <p>
            {"Порядок исходного кода по-прежнему важен: concurrency появляется не из-за наличия await, а из-за того, что несколько operations запланированы до окончательного ожидания результатов."}
          </p>
        </div>

        <MethodGrid
          rows={[
            [
              <>{"await A; await B"}</>,
              <>{"B начинается после завершения A"}</>,
            ],
            [
              <>{"Task A; Task B"}</>,
              <>{"обе operations могут стать pending одновременно"}</>,
            ],
            [
              <>{"ready"}</>,
              <>{"Task может выполнять Python-код прямо сейчас"}</>,
            ],
            [
              <>{"waiting"}</>,
              <>{"Task ожидает внешний результат"}</>,
            ],
            [
              <>{"done"}</>,
              <>{"Task имеет result, exception или cancelled state"}</>,
            ],
            [
              <>{"timeline"}</>,
              <>{"наблюдаемый порядок start/wait/resume/done"}</>,
            ],
            [
              <>{"perf_counter"}</>,
              <>{"инструмент для сравнения одинакового сценария"}</>,
            ],
          ]}
        />

        <CodeBlock
          caption={"два разных timeline"}
          code={"sequential:\nstart A → wait A → done A → start B → wait B → done B\n\nconcurrent:\nstart A → wait A → start B → wait B → done A/B"}
        />

        <PredictOutput
          code={"async def main():\n    first = await load(\"A\", 1)\n    second = await load(\"B\", 1)\n    print(first, second)"}
          output={"A начинается и завершается; затем B начинается и завершается. Общее время около 2 секунд."}
          hint={"Вторая coroutine вызывается только после возвращения first."}
        />

        <TypeCards>
          <TypeCard
            badge={"A→B"}
            title={"Sequential"}
            code={"a = await A(); b = await B()"}
          >
            {"Простой и правильный flow, если B зависит от A."}
          </TypeCard>
          <TypeCard
            badge={"A+B"}
            badgeTone={"float"}
            title={"Independent"}
            code={"task_a = create_task(A())"}
          >
            {"Операции можно планировать вместе, если между ними нет зависимости."}
          </TypeCard>
          <TypeCard
            badge={"state"}
            badgeTone={"str"}
            title={"Suspended"}
            code={"await pending_io"}
          >
            {"Локальные переменные сохраняются до resume."}
          </TypeCard>
          <TypeCard
            badge={"clock"}
            title={"Timing"}
            code={"perf_counter()"}
          >
            {"Позволяет проверить реальный порядок, но не заменяет объяснение."}
          </TypeCard>
        </TypeCards>

        <div className="lesson-practice-steps">
          <h3>{"Проверить зависимость"}</h3>
          <p>
            {"Если B использует результат A, последовательность является правильной."}
          </p>

          <h3>{"Записать start/done logs"}</h3>
          <p>
            {"Не угадывать порядок только по итоговому времени."}
          </p>

          <h3>{"Измерить одинаковый delay"}</h3>
          <p>
            {"Сравнить один и тот же workload."}
          </p>

          <h3>{"Не путать завершение и result order"}</h3>
          <p>
            {"Tasks могут завершиться в разном порядке, а gather сохраняет порядок inputs."}
          </p>

        </div>

        <Callout tone={"info"}>
          {"Последовательный async-код не является ошибкой. Он нужен, когда следующий шаг зависит от предыдущего результата."}
        </Callout>

        <Callout tone={"warn"}>
          {"Создание concurrency для зависимых операций усложняет код и не сокращает обязательную последовательность."}
        </Callout>

      </Section>

      <Section number={"04"} title={"Task и gather: конкурентность под контролем"}>
        <Lead>
          {"Task связывает coroutine с event loop и позволяет ей начать выполнение независимо от текущей точки окончательного await. gather удобно ожидает группу операций, но ответственность за количество задач и обработку ошибок остаётся у приложения."}
        </Lead>

        <div className="lesson-route">
          <ol>
            <li>
              <strong>{"Создать Task:"}</strong>
              {" asyncio.create_task регистрирует coroutine в loop."}
            </li>
            <li>
              <strong>{"Продолжить caller:"}</strong>
              {" текущая coroutine может создать следующую Task."}
            </li>
            <li>
              <strong>{"Дойти до wait:"}</strong>
              {" каждая Task отдаёт управление на своём I/O."}
            </li>
            <li>
              <strong>{"Собрать results:"}</strong>
              {" gather возвращает значения в порядке переданных awaitables."}
            </li>
            <li>
              <strong>{"Обработать exception:"}</strong>
              {" одна ошибка может завершить общий await в зависимости от policy."}
            </li>
            <li>
              <strong>{"Ограничить масштаб:"}</strong>
              {" semaphore или worker pattern защищает ресурсы."}
            </li>
          </ol>
          <p>
            {"Controlled concurrency означает, что приложение знает число активных операций, их timeout, error policy и способ cleanup. Просто создать много Task недостаточно."}
          </p>
        </div>

        <MethodGrid
          rows={[
            [
              <>{"create_task"}</>,
              <>{"планирует coroutine"}</>,
            ],
            [
              <>{"Task reference"}</>,
              <>{"позволяет await, cancel и inspect state"}</>,
            ],
            [
              <>{"gather"}</>,
              <>{"ожидает группу awaitables"}</>,
            ],
            [
              <>{"result order"}</>,
              <>{"соответствует input order"}</>,
            ],
            [
              <>{"completion order"}</>,
              <>{"может отличаться из-за разного I/O delay"}</>,
            ],
            [
              <>{"exception policy"}</>,
              <>{"решает, отменяется ли общий use case"}</>,
            ],
            [
              <>{"bounded concurrency"}</>,
              <>{"ограничивает количество active operations"}</>,
            ],
          ]}
        />

        <CodeBlock
          caption={"конкурентная загрузка"}
          code={"profile_task = asyncio.create_task(load_profile())\nstats_task = asyncio.create_task(load_stats())\n\nprofile, stats = await asyncio.gather(\n    profile_task,\n    stats_task,\n)"}
        />

        <StepThrough
          code={"task_a = create_task(load(\"A\", 2))\ntask_b = create_task(load(\"B\", 1))\nresults = await gather(task_a, task_b)"}
          steps={[
            {
              line: 0,
              note: "A запланирована и может начать до общего await.",
              vars: {
                "A": "scheduled",
              },
            },
            {
              line: 1,
              note: "B тоже запланирована независимо.",
              vars: {
                "A": "waiting",
                "B": "scheduled",
              },
            },
            {
              line: 2,
              note: "Caller ожидает обе Task.",
              vars: {
                "caller": "waiting",
              },
            },
            {
              line: 1,
              note: "B завершается раньше из-за меньшего delay.",
              vars: {
                "B": "done",
              },
            },
            {
              line: 0,
              note: "A завершается позже.",
              vars: {
                "A": "done",
              },
            },
            {
              line: 2,
              note: "results сохраняет порядок [A, B].",
              vars: {
                "results": "[\"A\", \"B\"]",
              },
            },
          ]}
        />

        <TypeCards>
          <TypeCard
            badge={"plan"}
            title={"Create Task"}
            code={"create_task(coro)"}
          >
            {"Даёт coroutine собственный lifecycle в event loop."}
          </TypeCard>
          <TypeCard
            badge={"wait"}
            badgeTone={"float"}
            title={"Gather"}
            code={"await gather(a, b)"}
          >
            {"Ожидает несколько results и сохраняет input order."}
          </TypeCard>
          <TypeCard
            badge={"state"}
            badgeTone={"str"}
            title={"Inspect"}
            code={"task.done()"}
          >
            {"Позволяет увидеть done/cancelled и получить result после завершения."}
          </TypeCard>
          <TypeCard
            badge={"policy"}
            title={"Error handling"}
            code={"success/error record"}
          >
            {"Use case явно решает судьбу остальных operations."}
          </TypeCard>
        </TypeCards>

        <div className="lesson-practice-steps">
          <h3>{"Проверить независимость"}</h3>
          <p>
            {"Не планировать вместе шаги, где B использует result A."}
          </p>

          <h3>{"Хранить references"}</h3>
          <p>
            {"Важную Task нужно дождаться, отменить или обработать явно."}
          </p>

          <h3>{"Логировать operation id"}</h3>
          <p>
            {"Различать события A, B и caller."}
          </p>

          <h3>{"Ограничить fan-out"}</h3>
          <p>
            {"Большой input делить через semaphore или workers."}
          </p>

        </div>

        <Callout tone={"info"}>
          {"Task не создаёт новый OS-thread для Python-кода. Она участвует в cooperative scheduling одного event loop."}
        </Callout>

        <Callout tone={"warn"}>
          {"Fire-and-forget неприемлем для важной операции, если приложение не отслеживает exception и завершение."}
        </Callout>

      </Section>

      <Section number={"05"} title={"Timeout, cancellation, semaphore и partial failure"}>
        <Lead>
          {"Реальный I/O может зависнуть, быть отменён или частично завершиться. Поэтому асинхронный use case проектируется не только для happy path: у него есть временная граница, cleanup, ограничение concurrency и структурированный результат каждой операции."}
        </Lead>

        <div className="lesson-route">
          <ol>
            <li>
              <strong>{"Timeout:"}</strong>
              {" определить максимальное ожидание, после которого результат уже не нужен."}
            </li>
            <li>
              <strong>{"Cancellation request:"}</strong>
              {" попросить Task прекратить работу в ближайшей точке переключения."}
            </li>
            <li>
              <strong>{"Cleanup:"}</strong>
              {" освободить ресурс в finally или context manager."}
            </li>
            <li>
              <strong>{"Propagate:"}</strong>
              {" не превращать cancellation в обычный success."}
            </li>
            <li>
              <strong>{"Semaphore:"}</strong>
              {" ограничить число Task внутри критического I/O-section."}
            </li>
            <li>
              <strong>{"Partial result:"}</strong>
              {" отделить success, timeout и error для каждого input."}
            </li>
          </ol>
          <p>
            {"Надёжный агрегатор не обещает, что все внешние операции всегда успешны. Он обещает контролируемое время, ограниченную нагрузку и понятный контракт деградации."}
          </p>
        </div>

        <MethodGrid
          rows={[
            [
              <>{"wait_for"}</>,
              <>{"timeout вокруг awaitable"}</>,
            ],
            [
              <>{"TimeoutError"}</>,
              <>{"отдельный ожидаемый сценарий"}</>,
            ],
            [
              <>{"cancel"}</>,
              <>{"запрос остановки Task"}</>,
            ],
            [
              <>{"CancelledError"}</>,
              <>{"сигнал отмены в coroutine"}</>,
            ],
            [
              <>{"finally"}</>,
              <>{"cleanup вне зависимости от исхода"}</>,
            ],
            [
              <>{"Semaphore"}</>,
              <>{"N одновременных entries"}</>,
            ],
            [
              <>{"result status"}</>,
              <>{"success/error/timeout/cancelled"}</>,
            ],
          ]}
        />

        <CodeBlock
          caption={"bounded operation"}
          code={"async with semaphore:\n    try:\n        return await asyncio.wait_for(\n            call_external_api(),\n            timeout=2,\n        )\n    finally:\n        release_local_resource()"}
        />

        <BranchExplorer
          code={"start operation\nenter semaphore\nawait external I/O\nreturn success\ntimeout\ncancellation\nfinally cleanup"}
          scenarios={[
            {
              label: "быстрый success",
              activeLine: 3,
              output: "status=success, resource released",
            },
            {
              label: "response опоздал",
              activeLine: 4,
              output: "status=timeout, no infinite wait",
            },
            {
              label: "caller отменил Task",
              activeLine: 5,
              output: "cleanup, then cancellation propagates",
            },
            {
              label: "limit занят",
              activeLine: 1,
              output: "Task ожидает permit, не создавая дополнительный I/O pressure",
            },
          ]}
        />

        <TypeCards>
          <TypeCard
            badge={"time"}
            title={"Timeout"}
            code={"wait_for(..., 2)"}
          >
            {"Ограничивает ожидание, но не является автоматическим retry."}
          </TypeCard>
          <TypeCard
            badge={"stop"}
            badgeTone={"float"}
            title={"Cancellation"}
            code={"task.cancel()"}
          >
            {"Отдельный control-flow, который требует cleanup."}
          </TypeCard>
          <TypeCard
            badge={"gate"}
            badgeTone={"str"}
            title={"Semaphore"}
            code={"Semaphore(3)"}
          >
            {"Пропускает ограниченное число operations в I/O-section."}
          </TypeCard>
          <TypeCard
            badge={"result"}
            title={"Partial record"}
            code={"{id, status, data}"}
          >
            {"Сохраняет полезный результат даже при частичных failures."}
          </TypeCard>
        </TypeCards>

        <div className="lesson-practice-steps">
          <h3>{"Выбрать timeout по контракту"}</h3>
          <p>
            {"Не использовать случайное число без смысла для пользователя."}
          </p>

          <h3>{"Проверить cleanup"}</h3>
          <p>
            {"Открыть resource до await и подтвердить закрытие при cancellation."}
          </p>

          <h3>{"Измерить active count"}</h3>
          <p>
            {"Доказать, что semaphore limit реально соблюдается."}
          </p>

          <h3>{"Собрать summary"}</h3>
          <p>
            {"Подсчитать success, timeout и error вместо потери всей группы."}
          </p>

        </div>

        <Callout tone={"info"}>
          {"Timeout и retry решают разные задачи: первый ограничивает ожидание, второй повторяет операцию по отдельной policy."}
        </Callout>

        <Callout tone={"warn"}>
          {"Широкий except Exception не должен скрывать cancellation как обычную business error."}
        </Callout>

      </Section>

      <Section number={"06"} title={"Async FastAPI, AsyncClient и lifespan"}>
        <Lead>
          {"FastAPI уже работает внутри event loop. Async endpoint полезен, когда вызывает awaitable I/O. Долгоживущий AsyncClient создаётся один раз на lifespan приложения, передаётся через dependency и заменяется mock в тестах."}
        </Lead>

        <div className="lesson-route">
          <ol>
            <li>
              <strong>{"Выбрать форму endpoint:"}</strong>
              {" def для blocking flow, async def для awaitable flow."}
            </li>
            <li>
              <strong>{"Создать client:"}</strong>
              {" на startup сформировать AsyncClient с base URL и timeout."}
            </li>
            <li>
              <strong>{"Передать dependency:"}</strong>
              {" endpoint получает готовый resource вместо прямого конструктора."}
            </li>
            <li>
              <strong>{"Выполнить request:"}</strong>
              {" await client.get/post и проверить status."}
            </li>
            <li>
              <strong>{"Отобразить failure:"}</strong>
              {" external timeout/error переводится в безопасный HTTP-contract."}
            </li>
            <li>
              <strong>{"Закрыть resource:"}</strong>
              {" shutdown lifespan освобождает connection pool."}
            </li>
          </ol>
          <p>
            {"Lifespan связывает resource с жизнью приложения, dependency — с конкретным use case, а mock — с воспроизводимым test. Эти три границы не нужно смешивать в одном endpoint."}
          </p>
        </div>

        <MethodGrid
          rows={[
            [
              <>{"async def endpoint"}</>,
              <>{"awaitable I/O внутри route"}</>,
            ],
            [
              <>{"AsyncClient"}</>,
              <>{"HTTP connection pool"}</>,
            ],
            [
              <>{"Settings"}</>,
              <>{"base URL и timeout"}</>,
            ],
            [
              <>{"lifespan"}</>,
              <>{"startup/shutdown shared resource"}</>,
            ],
            [
              <>{"dependency"}</>,
              <>{"доступ endpoint/service к client"}</>,
            ],
            [
              <>{"MockTransport"}</>,
              <>{"сетевой test без реального server"}</>,
            ],
            [
              <>{"502/503/504"}</>,
              <>{"контракт внешней ошибки"}</>,
            ],
          ]}
        />

        <CodeBlock
          caption={"lifespan client"}
          code={"from contextlib import asynccontextmanager\nfrom httpx import AsyncClient\n\n@asynccontextmanager\nasync def lifespan(app):\n    app.state.client = AsyncClient(timeout=2)\n    try:\n        yield\n    finally:\n        await app.state.client.aclose()"}
        />

        <CodeSequence
          title={"Соберите lifecycle внешнего клиента"}
          prompt={"Расположите действия от старта приложения до корректного shutdown."}
          pieces={[
            {
              id: "settings",
              code: "прочитать base URL и timeout",
            },
            {
              id: "create",
              code: "создать AsyncClient",
            },
            {
              id: "yield",
              code: "передать управление приложению",
            },
            {
              id: "requests",
              code: "обслужить множество requests",
            },
            {
              id: "shutdown",
              code: "получить shutdown signal",
            },
            {
              id: "close",
              code: "await client.aclose()",
            },
          ]}
          correctOrder={[
            "settings",
            "create",
            "yield",
            "requests",
            "shutdown",
            "close",
          ]}
          explanation={"Один client переиспользует connections и гарантированно закрывается при завершении приложения."}
        />

        <TypeCards>
          <TypeCard
            badge={"startup"}
            title={"Create once"}
            code={"AsyncClient(...)"}
          >
            {"Настраивает pool до обработки пользовательских requests."}
          </TypeCard>
          <TypeCard
            badge={"request"}
            badgeTone={"float"}
            title={"Reuse"}
            code={"await client.get(...)"}
          >
            {"Endpoint не создаёт новый pool для каждого обращения."}
          </TypeCard>
          <TypeCard
            badge={"test"}
            badgeTone={"str"}
            title={"Override"}
            code={"fake client / MockTransport"}
          >
            {"Success и errors воспроизводятся без интернета."}
          </TypeCard>
          <TypeCard
            badge={"shutdown"}
            title={"Close"}
            code={"await client.aclose()"}
          >
            {"Connections освобождаются в предсказуемой точке."}
          </TypeCard>
        </TypeCards>

        <div className="lesson-practice-steps">
          <h3>{"Использовать local mock-service"}</h3>
          <p>
            {"Контролировать delay, status и JSON response."}
          </p>

          <h3>{"Проверить четыре paths"}</h3>
          <p>
            {"Success, HTTP error, timeout и connection failure."}
          </p>

          <h3>{"Логировать внешний request"}</h3>
          <p>
            {"Без password, token и полного sensitive body."}
          </p>

          <h3>{"Проверить один lifecycle"}</h3>
          <p>
            {"Убедиться, что client не пересоздаётся на каждый route call."}
          </p>

        </div>

        <Callout tone={"info"}>
          {"FastAPI может выполнять обычный def endpoint в threadpool. Это не делает blocking library асинхронной, но защищает основной event loop."}
        </Callout>

        <Callout tone={"warn"}>
          {"Запуск asyncio.run внутри async endpoint создаёт конфликт с уже работающим event loop и является неверной точкой входа."}
        </Callout>

      </Section>

      <Section number={"07"} title={"AsyncEngine, AsyncSession и database concurrency"}>
        <Lead>
          {"SQLAlchemy сохраняет знакомые models и statements. Меняется путь выполнения I/O: async driver, AsyncEngine и AsyncSession позволяют await database round trip. При этом transaction, N+1 и pool limits остаются реальными ограничениями."}
        </Lead>

        <div className="lesson-route">
          <ol>
            <li>
              <strong>{"AsyncEngine:"}</strong>
              {" создать engine с async-compatible PostgreSQL driver."}
            </li>
            <li>
              <strong>{"Session factory:"}</strong>
              {" async_sessionmaker создаёт request-scoped AsyncSession."}
            </li>
            <li>
              <strong>{"Dependency:"}</strong>
              {" async get_db открывает session, yield и закрывает её."}
            </li>
            <li>
              <strong>{"Statement:"}</strong>
              {" select/where остаются декларативными Python-объектами."}
            </li>
            <li>
              <strong>{"Execute:"}</strong>
              {" await session.execute выполняет network I/O."}
            </li>
            <li>
              <strong>{"Transaction:"}</strong>
              {" commit или rollback сохраняет атомарность."}
            </li>
            <li>
              <strong>{"Loading:"}</strong>
              {" selectinload управляет relation queries явно."}
            </li>
          </ol>
          <p>
            {"Async database layer не означает unlimited queries. Connection pool ограничен, transaction удерживает connection, а N+1 умножает round trips независимо от способа ожидания."}
          </p>
        </div>

        <MethodGrid
          rows={[
            [
              <>{"AsyncEngine"}</>,
              <>{"database entry point and pool"}</>,
            ],
            [
              <>{"async driver"}</>,
              <>{"awaitable PostgreSQL protocol"}</>,
            ],
            [
              <>{"async_sessionmaker"}</>,
              <>{"factory AsyncSession"}</>,
            ],
            [
              <>{"AsyncSession"}</>,
              <>{"transactional state одного use case"}</>,
            ],
            [
              <>{"execute/scalars"}</>,
              <>{"statement result"}</>,
            ],
            [
              <>{"session.begin"}</>,
              <>{"transaction context"}</>,
            ],
            [
              <>{"selectinload"}</>,
              <>{"explicit eager loading"}</>,
            ],
          ]}
        />

        <CodeBlock
          caption={"request-scoped session"}
          code={"SessionFactory = async_sessionmaker(engine)\n\nasync def get_db():\n    async with SessionFactory() as session:\n        yield session\n\nasync def list_tasks(session):\n    result = await session.execute(select(Task))\n    return result.scalars().all()"}
        />

        <BugHunt
          code={"session = AsyncSession(engine)\n\n@app.get(\"/tasks\")\nasync def list_tasks():\n    result = await session.execute(select(Task))\n    return result.scalars().all()"}
          question={"Почему одна глобальная AsyncSession опасна?"}
          options={[
            "Она разделяет изменяемое transaction state между requests",
            "AsyncSession нельзя использовать с select",
            "FastAPI запрещает глобальные имена",
          ]}
          correctIndex={0}
          explanation={"Session является рабочим контекстом операции, а не singleton-resource всего приложения."}
          fix={"async def get_db():\n    async with SessionFactory() as session:\n        yield session\n\n@app.get(\"/tasks\")\nasync def list_tasks(session: AsyncSession = Depends(get_db)):\n    result = await session.execute(select(Task))\n    return result.scalars().all()"}
        />

        <TypeCards>
          <TypeCard
            badge={"app"}
            title={"Engine"}
            code={"create_async_engine(...)"}
          >
            {"Долгоживущий resource и pool для приложения."}
          </TypeCard>
          <TypeCard
            badge={"request"}
            badgeTone={"float"}
            title={"Session"}
            code={"async with SessionFactory()"}
          >
            {"Отдельный transactional context на use case."}
          </TypeCard>
          <TypeCard
            badge={"SQL"}
            badgeTone={"str"}
            title={"Statement"}
            code={"select(Task).where(...)"}
          >
            {"Остаётся декларативным и не выполняется до execute."}
          </TypeCard>
          <TypeCard
            badge={"relation"}
            title={"Loading"}
            code={"selectinload(Task.owner)"}
          >
            {"Предотвращает скрытые дополнительные queries."}
          </TypeCard>
        </TypeCards>

        <div className="lesson-practice-steps">
          <h3>{"Сначала ping"}</h3>
          <p>
            {"Проверить driver и AsyncEngine через SELECT 1."}
          </p>

          <h3>{"Затем read endpoint"}</h3>
          <p>
            {"Перенести простой select без transaction complexity."}
          </p>

          <h3>{"После write path"}</h3>
          <p>
            {"Проверить commit, IntegrityError и rollback."}
          </p>

          <h3>{"В конце relations"}</h3>
          <p>
            {"Посчитать SQL до и после явной eager loading."}
          </p>

        </div>

        <Callout tone={"info"}>
          {"Метод add изменяет состояние Session локально, поэтому обычно вызывается без await. I/O происходит на flush/commit/refresh/execute."}
        </Callout>

        <Callout tone={"warn"}>
          {"AsyncSession не должна одновременно обслуживать несколько независимых tasks внутри одного use case без тщательно определённой transaction model."}
        </Callout>

      </Section>

      <Section number={"08"} title={"Полный async-request и честная оценка результата"}>
        <Lead>
          {"Финальная модель связывает HTTP, dependencies, external I/O, database I/O, logs и response. Async считается успешным не из-за синтаксиса, а когда path сохраняет корректность, выдерживает failure scenarios и показывает измеримый эффект в выбранной нагрузке."}
        </Lead>

        <div className="lesson-route">
          <ol>
            <li>
              <strong>{"Request enters:"}</strong>
              {" middleware присваивает request id."}
            </li>
            <li>
              <strong>{"Dependencies resolve:"}</strong>
              {" current user, AsyncSession и shared AsyncClient готовы."}
            </li>
            <li>
              <strong>{"Service schedules:"}</strong>
              {" только независимые operations запускаются конкурентно."}
            </li>
            <li>
              <strong>{"I/O waits:"}</strong>
              {" event loop обслуживает другие ready tasks."}
            </li>
            <li>
              <strong>{"Results combine:"}</strong>
              {" business policy решает partial failure."}
            </li>
            <li>
              <strong>{"Response returns:"}</strong>
              {" status и schema остаются частью прежнего API-contract."}
            </li>
            <li>
              <strong>{"Evidence remains:"}</strong>
              {" logs, SQL count и timing позволяют повторить вывод."}
            </li>
          </ol>
          <p>
            {"Async StudyHub готов к следующему этапу, когда другой разработчик запускает его по README, воспроизводит tests и benchmark, а автор прослеживает один request по request id без догадок."}
          </p>
        </div>

        <MethodGrid
          rows={[
            [
              <>{"request id"}</>,
              <>{"единый trace context"}</>,
            ],
            [
              <>{"dependencies"}</>,
              <>{"request-scoped и app-scoped resources"}</>,
            ],
            [
              <>{"controlled concurrency"}</>,
              <>{"Task count и semaphore limit"}</>,
            ],
            [
              <>{"failure contract"}</>,
              <>{"timeout/cancel/external/DB error"}</>,
            ],
            [
              <>{"SQL evidence"}</>,
              <>{"queries per request"}</>,
            ],
            [
              <>{"latency evidence"}</>,
              <>{"p50/p95 selected scenario"}</>,
            ],
            [
              <>{"boundary"}</>,
              <>{"что async не улучшило"}</>,
            ],
          ]}
        />

        <CodeBlock
          caption={"полный путь"}
          code={"HTTP request\n→ request id middleware\n→ async router\n→ dependencies\n→ service\n   ├── AsyncSession query\n   └── AsyncClient request\n→ controlled gather\n→ error policy\n→ Pydantic response\n→ HTTP response + structured logs"}
        />

        <TrueFalse
          statement={
            <>
              {"Если async-версия одного CPU-bound endpoint показала то же время, значит весь этап провален."}
            </>
          }
          isTrue={false}
          explanation={"Async предназначен для I/O-concurrency. CPU-bound endpoint является неправильным сценарием для доказательства его пользы."}
        />

        <TypeCards>
          <TypeCard
            badge={"trace"}
            title={"Request ID"}
            code={"request_id=abc123"}
          >
            {"Связывает router, service, integration и database logs."}
          </TypeCard>
          <TypeCard
            badge={"correct"}
            badgeTone={"float"}
            title={"Tests"}
            code={"success + failures"}
          >
            {"Доказывают сохранение contract и transaction guarantees."}
          </TypeCard>
          <TypeCard
            badge={"measure"}
            badgeTone={"str"}
            title={"Benchmark"}
            code={"same data, same load"}
          >
            {"Сравнивает одинаковый I/O-scenario."}
          </TypeCard>
          <TypeCard
            badge={"honest"}
            title={"Boundary"}
            code={"async did not fix ..."}
          >
            {"Отделяет реальное улучшение от маркетингового утверждения."}
          </TypeCard>
        </TypeCards>

        <div className="lesson-practice-steps">
          <h3>{"Запустить tests"}</h3>
          <p>
            {"До benchmark доказать корректность и одинаковый API-contract."}
          </p>

          <h3>{"Прогреть одинаковый scenario"}</h3>
          <p>
            {"Использовать одинаковые данные и concurrency."}
          </p>

          <h3>{"Собрать p50/p95 и SQL count"}</h3>
          <p>
            {"Не ограничиваться одним средним временем."}
          </p>

          <h3>{"Написать вывод"}</h3>
          <p>
            {"Назвать улучшение, отсутствие эффекта и оставшиеся bottlenecks."}
          </p>

        </div>

        <Callout tone={"info"}>
          {"Наблюдаемость не является отдельным украшением. Без trace и timing невозможно объяснить конкурентный flow и локализовать blocking call."}
        </Callout>

        <Callout tone={"warn"}>
          {"Не сравнивайте sync localhost с async удалённым сервисом или разные объёмы данных. Такой benchmark не доказывает причинную связь."}
        </Callout>

        <div className="lesson-check-group">
          <QuizCard
            question={"Что происходит при вызове async-функции без await?"}
            options={[
              "Создаётся coroutine object",
              "Функция всегда выполняется полностью",
              "Создаётся новый процесс",
            ]}
            correctIndex={0}
            explanation={"Вызов создаёт объект будущей работы; выполнение организует event loop."}
          />

          <QuizCard
            question={"Почему два await подряд могут занять сумму задержек?"}
            options={[
              "Вторая operation начинается после результата первой",
              "await запрещает I/O",
              "Event loop всегда однопоточный и не видит tasks",
            ]}
            correctIndex={0}
            explanation={"Если B вызывается после await A, concurrency между ними не создаётся."}
          />

          <QuizCard
            question={"Зачем нужен semaphore?"}
            options={[
              "Ограничить число одновременных I/O-операций",
              "Ускорить CPU-loop",
              "Заменить timeout",
            ]}
            correctIndex={0}
            explanation={"Semaphore защищает ограниченные ресурсы и внешний сервис от unbounded fan-out."}
          />

          <QuizCard
            question={"Что AsyncSession не исправляет автоматически?"}
            options={[
              "N+1 и длинные transactions",
              "Возможность выполнять SELECT",
              "Работу PostgreSQL driver",
            ]}
            correctIndex={0}
            explanation={"Async меняет ожидание I/O, но архитектура запросов и transaction boundaries остаются ответственностью разработчика."}
          />

        </div>

        <KeyTakeaways
          points={[
            <>{"CPU-bound работа и I/O-bound ожидание требуют разных инструментов."}</>,
            <>{"Async-функция возвращает coroutine object до выполнения тела."}</>,
            <>{"Event loop возобновляет coroutine после готовности awaited operation."}</>,
            <>{"Concurrency требует нескольких запланированных operations."}</>,
            <>{"Timeout, cancellation и cleanup проектируются заранее."}</>,
            <>{"Semaphore ограничивает pressure на внешние ресурсы."}</>,
            <>{"AsyncClient и AsyncEngine являются app-level resources, Session — request-level."}</>,
            <>{"Производительность оценивается на одинаковом воспроизводимом сценарии."}</>,
          ]}
        />

        <PracticeCta
          text={"Выберите один endpoint Async StudyHub и составьте технический паспорт: active coroutine, каждое await, app-scoped и request-scoped resources, timeout, cancellation path, SQL count, ожидаемый latency metric и граница, где async не помогает."}
        />

      </Section>

    </RichLesson>
  );
}
