import {
  Activity,
  BrainCircuit,
  Clock,
  Cloud,
  Database,
  Gauge,
  GitBranch,
  Hourglass,
  Network,
  Route,
  Server,
  Timer,
  Workflow,
  Zap,
} from "lucide-react";
import {
  BranchExplorer,
  BugHunt,
  Callout,
  CodeBlock,
  CodeSequence,
  CompareSolutions,
  FlipCards,
  KeyTakeaways,
  Lead,
  MatchPairs,
  MethodGrid,
  PracticeCta,
  PredictOutput,
  QuizCard,
  RichHero,
  RichLesson,
  Section,
  StepThrough,
  TrueFalse,
  TypeCard,
  TypeCards,
} from "../shared";

export function LearningRoadmap() {
  return (
    <RichLesson>
      <RichHero
        variant={"project"}
        chip={"ЭТАП 7 · карта обучения"}
        title={"План обучения: этап 7"}
        intro={"За 24 занятия PostgreSQL StudyHub превратится в Async StudyHub: ученик разберёт event loop без фреймворка, научится управлять Task и timeout, подключит AsyncClient, переведёт database layer на AsyncSession и подтвердит результат измерениями."}
        tags={[
          {
            icon: <Route size={14} />,
            label: "занятия 141–164",
          },
          {
            icon: <Zap size={14} />,
            label: "Async StudyHub",
          },
        ]}
      />

      <Section number={"01"} title={"От PostgreSQL StudyHub к Async StudyHub"}>
        <Lead>
          {"Этап 6 завершился серверной PostgreSQL-базой, понятным SQL, транзакциями, индексами и измерениями. Этап 7 не переписывает проект ради нового синтаксиса: он решает конкретную проблему ожидания I/O и последовательно переводит внешние HTTP-вызовы и database layer на асинхронную модель."}
        </Lead>

        <div className="lesson-route">
          <ol>
            <li>
              <strong>{"Зафиксировать baseline:"}</strong>
              {" синхронный PostgreSQL StudyHub и его tests остаются рабочей точкой сравнения."}
            </li>
            <li>
              <strong>{"Увидеть ожидание:"}</strong>
              {" сначала различить CPU-bound работу и I/O-bound паузу без FastAPI."}
            </li>
            <li>
              <strong>{"Понять механизм:"}</strong>
              {" coroutine, event loop и await вводятся на маленьких функциях."}
            </li>
            <li>
              <strong>{"Управлять concurrency:"}</strong>
              {" Task, gather, timeout, cancellation и semaphore появляются до интеграций."}
            </li>
            <li>
              <strong>{"Применить к сети:"}</strong>
              {" AsyncClient связывает теорию с реальным HTTP I/O."}
            </li>
            <li>
              <strong>{"Перевести database layer:"}</strong>
              {" AsyncSession появляется последним и проверяется тестами и измерениями."}
            </li>
          </ol>
          <p>
            {"Главный результат этапа — способность объяснить, где код работает, где ждёт, кто получает управление и почему конкретный async-сценарий полезен или бесполезен."}
          </p>
        </div>

        <MethodGrid
          rows={[
            [
              <>{"вход этапа"}</>,
              <>{"PostgreSQL StudyHub на синхронном FastAPI и Session"}</>,
            ],
            [
              <>{"основной проект"}</>,
              <>{"Async StudyHub"}</>,
            ],
            [
              <>{"занятия"}</>,
              <>{"141–164"}</>,
            ],
            [
              <>{"блоки"}</>,
              <>{"25–28"}</>,
            ],
            [
              <>{"ключевая проблема"}</>,
              <>{"несколько независимых I/O-ожиданий"}</>,
            ],
            [
              <>{"доказательство"}</>,
              <>{"tests, timing, request trace и сравнимый benchmark"}</>,
            ],
            [
              <>{"граница"}</>,
              <>{"async не является ускорителем CPU-bound вычислений"}</>,
            ],
          ]}
        />

        <CodeBlock
          caption={"эволюция проекта"}
          code={"PostgreSQL StudyHub\n→ blocking и waiting различены\n→ coroutine + event loop\n→ controlled concurrency\n→ async HTTP integration\n→ AsyncSession\n→ measurement and observability\n→ Async StudyHub"}
        />

        <CodeSequence
          title={"Соберите безопасный маршрут этапа"}
          prompt={"Расположите шаги так, чтобы механизм был понятен до изменения основного проекта."}
          pieces={[
            {
              id: "baseline",
              code: "зафиксировать sync tests и timing",
            },
            {
              id: "model",
              code: "различить CPU и I/O",
            },
            {
              id: "coroutine",
              code: "запустить coroutine через event loop",
            },
            {
              id: "control",
              code: "добавить Task, timeout и semaphore",
            },
            {
              id: "http",
              code: "подключить AsyncClient",
            },
            {
              id: "db",
              code: "перевести один endpoint на AsyncSession",
            },
            {
              id: "measure",
              code: "измерить и объяснить результат",
            },
          ]}
          correctOrder={[
            "baseline",
            "model",
            "coroutine",
            "control",
            "http",
            "db",
            "measure",
          ]}
          explanation={"Async database layer появляется только после того, как ученик понимает event loop и управляет жизненным циклом задач."}
        />

        <TypeCards>
          <TypeCard
            badge={"до"}
            title={"Sync StudyHub"}
            code={"def + Session"}
          >
            {"Рабочий и проверенный проект остаётся эталоном поведения."}
          </TypeCard>
          <TypeCard
            badge={"механизм"}
            badgeTone={"float"}
            title={"asyncio lab"}
            code={"coroutine → await → Task"}
          >
            {"Небольшая лаборатория показывает переключение без шума фреймворка."}
          </TypeCard>
          <TypeCard
            badge={"сеть"}
            badgeTone={"str"}
            title={"AsyncClient"}
            code={"await client.get(...)"}
          >
            {"Первое реальное неблокирующее сетевое ожидание."}
          </TypeCard>
          <TypeCard
            badge={"после"}
            title={"Async StudyHub"}
            code={"async def + AsyncSession"}
          >
            {"Асинхронный стек внедрён там, где действительно есть I/O."}
          </TypeCard>
        </TypeCards>

        <div className="lesson-practice-steps">
          <h3>{"Не переписывать всё сразу"}</h3>
          <p>
            {"Сначала сохранить sync-реализацию и перевести один изолированный vertical slice."}
          </p>

          <h3>{"Сначала предсказать timeline"}</h3>
          <p>
            {"До запуска отметить, какая coroutine выполняется, ждёт или готова продолжиться."}
          </p>

          <h3>{"Проверять сбой"}</h3>
          <p>
            {"Timeout, cancellation и database error являются обязательными сценариями."}
          </p>

          <h3>{"Измерять конкретный flow"}</h3>
          <p>
            {"Вывод об async делается по одному воспроизводимому I/O-сценарию, а не по ощущению."}
          </p>

        </div>

        <Callout tone={"info"}>
          {"Этап не требует превращать каждую функцию в async. Обычные чистые вычисления и часть endpoint могут оставаться синхронными."}
        </Callout>

        <Callout tone={"warn"}>
          {"Слово async в сигнатуре не создаёт конкурентность. Последовательные await могут выполняться один за другим."}
        </Callout>

      </Section>

      <Section number={"02"} title={"Блок 25 · Coroutine, event loop и async/await"}>
        <Lead>
          {"Первый блок строит модель асинхронного выполнения вне FastAPI. Ученик видит blocking call, создаёт coroutine object, запускает event loop, использует первый await и диагностирует две базовые ошибки: забытый await и блокировку loop."}
        </Lead>

        <div className="lesson-route">
          <ol>
            <li>
              <strong>{"141 · CPU и I/O:"}</strong>
              {" отделить вычисление от ожидания сети, файла или базы."}
            </li>
            <li>
              <strong>{"142 · Coroutine object:"}</strong>
              {" понять, почему обычный вызов async-функции ещё не выполняет тело."}
            </li>
            <li>
              <strong>{"143 · Event loop:"}</strong>
              {" запустить main через asyncio.run и увидеть suspend/resume."}
            </li>
            <li>
              <strong>{"144 · Последовательные await:"}</strong>
              {" доказать, что два await подряд не дают concurrency."}
            </li>
            <li>
              <strong>{"145 · Ошибки:"}</strong>
              {" найти forgotten await и time.sleep внутри async def."}
            </li>
            <li>
              <strong>{"146 · Async loader:"}</strong>
              {" собрать последовательную лабораторию и объяснить timeline."}
            </li>
          </ol>
          <p>
            {"Блок заканчивается небольшим async-loader профиля StudyHub. Он пока не быстрее последовательного варианта, но его выполнение полностью объяснимо по шагам."}
          </p>
        </div>

        <MethodGrid
          rows={[
            [
              <>{"141"}</>,
              <>{"blocking execution, CPU-bound и I/O-bound"}</>,
            ],
            [
              <>{"142"}</>,
              <>{"coroutine function и coroutine object"}</>,
            ],
            [
              <>{"143"}</>,
              <>{"asyncio.run, event loop и await"}</>,
            ],
            [
              <>{"144"}</>,
              <>{"sequential await и timing"}</>,
            ],
            [
              <>{"145"}</>,
              <>{"forgotten await и blocked loop"}</>,
            ],
            [
              <>{"146"}</>,
              <>{"трассируемый async-loader"}</>,
            ],
            [
              <>{"артефакт"}</>,
              <>{"async-lab с README и timeline"}</>,
            ],
          ]}
        />

        <CodeBlock
          caption={"основная модель блока"}
          code={"async def fetch_data():\n    await io_operation()\n\ncoroutine = fetch_data()\nasyncio.run(main())\n\nevent loop: run → wait → resume → done"}
        />

        <MatchPairs
          prompt={"Соедините термин и наблюдаемое поведение."}
          leftTitle={"Термин"}
          rightTitle={"Что происходит"}
          pairs={[
            {
              left: "coroutine function",
              right: "объявлена через async def",
            },
            {
              left: "coroutine object",
              right: "создан вызовом, но ещё не выполнен",
            },
            {
              left: "event loop",
              right: "запускает и возобновляет готовые coroutine",
            },
            {
              left: "await",
              right: "приостанавливает текущую coroutine до результата",
            },
            {
              left: "blocking call",
              right: "не отдаёт управление event loop",
            },
            {
              left: "asyncio.run",
              right: "создаёт loop для entry coroutine и закрывает его",
            },
          ]}
          explanation={"Точный словарь терминов защищает от фразы «async просто работает быстрее»."}
        />

        <TypeCards>
          <TypeCard
            badge={"work"}
            title={"CPU-bound"}
            code={"calculate()"}
          >
            {"Процесс занят вычислением и не ускоряется от await сам по себе."}
          </TypeCard>
          <TypeCard
            badge={"wait"}
            badgeTone={"float"}
            title={"I/O-bound"}
            code={"await network_read()"}
          >
            {"Coroutine может отдать управление, пока внешний ресурс готовит ответ."}
          </TypeCard>
          <TypeCard
            badge={"object"}
            badgeTone={"str"}
            title={"Coroutine"}
            code={"job = fetch()"}
          >
            {"Описывает будущую работу и должна быть awaited или запущена loop."}
          </TypeCard>
          <TypeCard
            badge={"executor"}
            title={"Event loop"}
            code={"asyncio.run(main())"}
          >
            {"Управляет готовностью coroutine в одном потоке выполнения."}
          </TypeCard>
        </TypeCards>

        <div className="lesson-practice-steps">
          <h3>{"Нарисовать timeline"}</h3>
          <p>
            {"Отметить участки Python-работы и участки ожидания внешнего ресурса."}
          </p>

          <h3>{"Создать coroutine object"}</h3>
          <p>
            {"Вызвать async-функцию без await и изучить repr и warning."}
          </p>

          <h3>{"Запустить через main"}</h3>
          <p>
            {"Использовать asyncio.run ровно в точке входа лаборатории."}
          </p>

          <h3>{"Сломать и исправить"}</h3>
          <p>
            {"Заменить asyncio.sleep на time.sleep и наблюдать остановку loop."}
          </p>

        </div>

        <Callout tone={"info"}>
          {"Event loop не является отдельным сервером и не выполняет две строки Python буквально одновременно. Он переключается в точках, где coroutine отдаёт управление."}
        </Callout>

        <Callout tone={"warn"}>
          {"Coroutine object вместо ожидаемых данных — признак того, что вызов не был awaited или запланирован как Task."}
        </Callout>

      </Section>

      <Section number={"03"} title={"Блок 26 · Task, timeout, cancellation и semaphore"}>
        <Lead>
          {"После последовательного await появляется управляемая конкурентность. Ученик создаёт Task, собирает результаты через gather, ограничивает время ожидания, корректно обрабатывает cancellation и не запускает неограниченное количество операций."}
        </Lead>

        <div className="lesson-route">
          <ol>
            <li>
              <strong>{"147 · create_task:"}</strong>
              {" жизненный цикл scheduled → running → waiting → done."}
            </li>
            <li>
              <strong>{"148 · gather:"}</strong>
              {" конкурентный старт и стабильный порядок результатов."}
            </li>
            <li>
              <strong>{"149 · timeout:"}</strong>
              {" ограничить ожидание и отделить timeout от retry."}
            </li>
            <li>
              <strong>{"150 · cancellation:"}</strong>
              {" выполнить cleanup в finally и не скрыть CancelledError."}
            </li>
            <li>
              <strong>{"151 · semaphore:"}</strong>
              {" установить верхнюю границу одновременных операций."}
            </li>
            <li>
              <strong>{"152 · partial errors:"}</strong>
              {" вернуть структурированный итог success/error/timeout."}
            </li>
          </ol>
          <p>
            {"Блок заканчивается async-агрегатором: он запускает ограниченное число операций, не ждёт бесконечно, сохраняет частичный результат и оставляет понятный trace."}
          </p>
        </div>

        <MethodGrid
          rows={[
            [
              <>{"Task"}</>,
              <>{"coroutine, запланированная в event loop"}</>,
            ],
            [
              <>{"gather"}</>,
              <>{"ожидание группы результатов"}</>,
            ],
            [
              <>{"timeout"}</>,
              <>{"максимальное допустимое время ожидания"}</>,
            ],
            [
              <>{"cancellation"}</>,
              <>{"управляемое прекращение незавершённой работы"}</>,
            ],
            [
              <>{"finally"}</>,
              <>{"обязательная очистка"}</>,
            ],
            [
              <>{"semaphore"}</>,
              <>{"ограничение concurrent operations"}</>,
            ],
            [
              <>{"partial result"}</>,
              <>{"явный status каждой операции"}</>,
            ],
          ]}
        />

        <CodeBlock
          caption={"контролируемая concurrency"}
          code={"inputs\n→ create Task for each input\n→ semaphore allows N active operations\n→ timeout bounds each wait\n→ cancellation triggers cleanup\n→ gather structured results"}
        />

        <BranchExplorer
          code={"Task created\nTask waiting for I/O\nTask completed\nTask timed out\nTask cancelled\nfinally cleanup"}
          scenarios={[
            {
              label: "успешный ответ",
              activeLine: 2,
              output: "result status=success",
            },
            {
              label: "слишком медленно",
              activeLine: 3,
              output: "timeout status, ожидание прекращено",
            },
            {
              label: "внешняя отмена",
              activeLine: 4,
              output: "CancelledError проходит после cleanup",
            },
            {
              label: "освобождение ресурса",
              activeLine: 5,
              output: "finally выполняется для error и cancellation",
            },
          ]}
        />

        <TypeCards>
          <TypeCard
            badge={"schedule"}
            title={"Task"}
            code={"asyncio.create_task(coro())"}
          >
            {"Позволяет loop начать coroutine до точки её окончательного await."}
          </TypeCard>
          <TypeCard
            badge={"collect"}
            badgeTone={"float"}
            title={"Gather"}
            code={"await asyncio.gather(...)"}
          >
            {"Собирает результаты в порядке входных awaitables."}
          </TypeCard>
          <TypeCard
            badge={"limit"}
            badgeTone={"str"}
            title={"Timeout"}
            code={"await wait_for(job, 2)"}
          >
            {"Не позволяет одному ожиданию удерживать flow бесконечно."}
          </TypeCard>
          <TypeCard
            badge={"capacity"}
            title={"Semaphore"}
            code={"async with semaphore"}
          >
            {"Защищает внешний сервис и собственные ресурсы от всплеска concurrency."}
          </TypeCard>
        </TypeCards>

        <div className="lesson-practice-steps">
          <h3>{"Сравнить время"}</h3>
          <p>
            {"Запустить одинаковые операции последовательно и через Task/gather."}
          </p>

          <h3>{"Добавить timeout"}</h3>
          <p>
            {"Сделать одну операцию медленной и получить контролируемый результат."}
          </p>

          <h3>{"Отменить вручную"}</h3>
          <p>
            {"Проверить, что finally выполняется, а ложного success нет."}
          </p>

          <h3>{"Изменить limit"}</h3>
          <p>
            {"Сравнить active count при semaphore 1, 3 и 10."}
          </p>

        </div>

        <Callout tone={"info"}>
          {"Concurrency — это управление несколькими ожидающими задачами. Parallelism и несколько CPU-core являются другой моделью."}
        </Callout>

        <Callout tone={"warn"}>
          {"gather для тысяч операций без limit может перегрузить connection pool, внешний API или память процесса."}
        </Callout>

      </Section>

      <Section number={"04"} title={"Блок 27 · Async FastAPI и внешний HTTP I/O"}>
        <Lead>
          {"Механизм asyncio уже понятен, поэтому следующий блок переносит его в FastAPI. Ученик выбирает между def и async def, использует httpx.AsyncClient, обрабатывает сетевые ошибки, выносит client в dependency и управляет его lifecycle через lifespan."}
        </Lead>

        <div className="lesson-route">
          <ol>
            <li>
              <strong>{"153 · def или async def:"}</strong>
              {" выбор по library и типу работы, а не по моде."}
            </li>
            <li>
              <strong>{"154 · AsyncClient:"}</strong>
              {" первый неблокирующий request к локальному mock-service."}
            </li>
            <li>
              <strong>{"155 · Network errors:"}</strong>
              {" connect/read timeout, 502, 503 и 504 как контракт."}
            </li>
            <li>
              <strong>{"156 · Dependency:"}</strong>
              {" Settings → configured client → service → endpoint."}
            </li>
            <li>
              <strong>{"157 · Lifespan:"}</strong>
              {" один client и connection pool на жизнь приложения."}
            </li>
            <li>
              <strong>{"158 · Aggregating endpoint:"}</strong>
              {" несколько внешних requests, partial response и mock tests."}
            </li>
          </ol>
          <p>
            {"Блок заканчивается endpoint, который объединяет локальные данные StudyHub и результаты локального mock-service, не зависит от реального интернета и имеет тесты success, timeout и failure."}
          </p>
        </div>

        <MethodGrid
          rows={[
            [
              <>{"def endpoint"}</>,
              <>{"подходит для blocking library, которую FastAPI выполняет в threadpool"}</>,
            ],
            [
              <>{"async endpoint"}</>,
              <>{"подходит для awaitable I/O library"}</>,
            ],
            [
              <>{"AsyncClient"}</>,
              <>{"асинхронный HTTP client и connection pool"}</>,
            ],
            [
              <>{"dependency"}</>,
              <>{"конфигурация и тестовая замена client"}</>,
            ],
            [
              <>{"lifespan"}</>,
              <>{"startup и shutdown ресурса приложения"}</>,
            ],
            [
              <>{"mock transport"}</>,
              <>{"детерминированный тест без сети"}</>,
            ],
            [
              <>{"error mapping"}</>,
              <>{"внешний failure → безопасный StudyHub response"}</>,
            ],
          ]}
        />

        <CodeBlock
          caption={"путь внешнего запроса"}
          code={"client request\n→ async FastAPI endpoint\n→ recommendation service\n→ shared AsyncClient\n→ local mock API\n→ timeout/error mapping\n→ Pydantic response"}
        />

        <CompareSolutions
          question={"Какой endpoint не блокирует event loop во время сетевого ожидания?"}
          left={{
            title: "Blocking client inside async def",
            code: "async def endpoint():\n    response = requests.get(url)",
            note: "requests не отдаёт управление event loop во время ожидания.",
          }}
          right={{
            title: "Awaitable client",
            code: "async def endpoint():\n    response = await client.get(url)",
            note: "AsyncClient отдаёт управление, пока сеть готовит ответ.",
          }}
          preferred={"right"}
          explanation={"Форма endpoint выбирается вместе с возможностями используемой I/O-library."}
        />

        <TypeCards>
          <TypeCard
            badge={"route"}
            title={"Endpoint"}
            code={"async def overview(...)"}
          >
            {"Связывает HTTP-contract и application service, но не хранит всю интеграционную логику."}
          </TypeCard>
          <TypeCard
            badge={"service"}
            badgeTone={"float"}
            title={"Integration service"}
            code={"await load_recommendations()"}
          >
            {"Собирает внешние requests и применяет fallback policy."}
          </TypeCard>
          <TypeCard
            badge={"resource"}
            badgeTone={"str"}
            title={"AsyncClient"}
            code={"base_url + timeout"}
          >
            {"Переиспользует connection pool и закрывается в lifespan."}
          </TypeCard>
          <TypeCard
            badge={"test"}
            title={"Mock"}
            code={"dependency override / MockTransport"}
          >
            {"Позволяет проверить сеть без случайной внешней зависимости."}
          </TypeCard>
        </TypeCards>

        <div className="lesson-practice-steps">
          <h3>{"Классифицировать endpoint"}</h3>
          <p>
            {"Назвать blocking или awaitable libraries внутри каждого flow."}
          </p>

          <h3>{"Поднять local mock-service"}</h3>
          <p>
            {"Не использовать случайный публичный API как обязательную часть курса."}
          </p>

          <h3>{"Проверить матрицу ошибок"}</h3>
          <p>
            {"Success, external 404, timeout и connection failure."}
          </p>

          <h3>{"Переиспользовать client"}</h3>
          <p>
            {"Подтвердить один startup/shutdown lifecycle на серию requests."}
          </p>

        </div>

        <Callout tone={"info"}>
          {"Синхронные endpoint могут сосуществовать с асинхронными. Цель — корректная модель I/O, а не единый стиль ради единообразия."}
        </Callout>

        <Callout tone={"warn"}>
          {"Нельзя возвращать клиенту внутренний traceback внешней интеграции. Подробность остаётся в server log, API получает безопасный error contract."}
        </Callout>

      </Section>

      <Section number={"05"} title={"Блок 28 · Async SQLAlchemy и наблюдаемость"}>
        <Lead>
          {"Database layer переводится последним. Знакомые statements сохраняются, но I/O выполняется через AsyncEngine и AsyncSession. После CRUD ученик переносит transaction, исправляет N+1, наблюдает connection pool и сравнивает конкретный sync/async-сценарий."}
        </Lead>

        <div className="lesson-route">
          <ol>
            <li>
              <strong>{"159 · AsyncEngine:"}</strong>
              {" async driver, URL, pool и SELECT 1."}
            </li>
            <li>
              <strong>{"160 · AsyncSession:"}</strong>
              {" async_sessionmaker и одна session на request."}
            </li>
            <li>
              <strong>{"161 · Async CRUD:"}</strong>
              {" await execute, commit, refresh и delete."}
            </li>
            <li>
              <strong>{"162 · Transactions:"}</strong>
              {" session.begin, IntegrityError и rollback."}
            </li>
            <li>
              <strong>{"163 · Relations:"}</strong>
              {" selectinload, N+1 и ограниченный connection pool."}
            </li>
            <li>
              <strong>{"164 · Measurement:"}</strong>
              {" latency, throughput, request id и финальная защита."}
            </li>
          </ol>
          <p>
            {"Итог блока — Async StudyHub, в котором database I/O не блокирует event loop, transaction остаётся атомарной, relation loading предсказуемо, а вывод о производительности подтверждён измерением."}
          </p>
        </div>

        <MethodGrid
          rows={[
            [
              <>{"AsyncEngine"}</>,
              <>{"создаёт async connections через подходящий driver"}</>,
            ],
            [
              <>{"async_sessionmaker"}</>,
              <>{"фабрика AsyncSession"}</>,
            ],
            [
              <>{"AsyncSession"}</>,
              <>{"unit of database work на request"}</>,
            ],
            [
              <>{"await execute"}</>,
              <>{"асинхронное ожидание SQL-result"}</>,
            ],
            [
              <>{"session.begin"}</>,
              <>{"transaction boundary"}</>,
            ],
            [
              <>{"selectinload"}</>,
              <>{"явная загрузка relation без N+1"}</>,
            ],
            [
              <>{"pool"}</>,
              <>{"ограниченный набор reusable connections"}</>,
            ],
          ]}
        />

        <CodeBlock
          caption={"async database path"}
          code={"HTTP request\n→ async get_db dependency\n→ AsyncSession\n→ await session.execute(statement)\n→ async PostgreSQL driver\n→ connection pool\n→ PostgreSQL\n→ scalars / ORM objects\n→ response"}
        />

        <CodeSequence
          title={"Соберите поэтапный перенос database layer"}
          prompt={"Сохраните возможность сравнивать поведение и быстро локализовать ошибку."}
          pieces={[
            {
              id: "engine",
              code: "создать отдельный AsyncEngine",
            },
            {
              id: "ping",
              code: "выполнить SELECT 1",
            },
            {
              id: "session",
              code: "создать async_sessionmaker и get_db",
            },
            {
              id: "read",
              code: "перенести один read endpoint",
            },
            {
              id: "write",
              code: "перенести write и transaction",
            },
            {
              id: "relations",
              code: "проверить relation loading и N+1",
            },
            {
              id: "tests",
              code: "запустить regression и load scenario",
            },
          ]}
          correctOrder={[
            "engine",
            "ping",
            "session",
            "read",
            "write",
            "relations",
            "tests",
          ]}
          explanation={"Синхронная версия удаляется только после того, как async vertical slice доказал одинаковый контракт и корректные ошибки."}
        />

        <TypeCards>
          <TypeCard
            badge={"driver"}
            title={"Async PostgreSQL driver"}
            code={"postgresql+asyncpg://"}
          >
            {"Поддерживает неблокирующий протокол, который можно await."}
          </TypeCard>
          <TypeCard
            badge={"scope"}
            badgeTone={"float"}
            title={"Request Session"}
            code={"async with session_factory()"}
          >
            {"Каждый request получает свой database context."}
          </TypeCard>
          <TypeCard
            badge={"loading"}
            badgeTone={"str"}
            title={"Explicit relations"}
            code={"selectinload(Model.items)"}
          >
            {"Количество запросов остаётся видимым и тестируемым."}
          </TypeCard>
          <TypeCard
            badge={"evidence"}
            title={"Measurement"}
            code={"p50 / p95 / throughput"}
          >
            {"Вывод делается по конкретному повторяемому сценарию."}
          </TypeCard>
        </TypeCards>

        <div className="lesson-practice-steps">
          <h3>{"Оставить sync baseline"}</h3>
          <p>
            {"Не удалять рабочий database layer до завершения сравнения."}
          </p>

          <h3>{"Переносить statements, не архитектуру"}</h3>
          <p>
            {"Сначала заменить способ выполнения I/O, не добавляя generic repository."}
          </p>

          <h3>{"Считать SQL-запросы"}</h3>
          <p>
            {"Async не исправляет N+1 и не уменьшает количество round trips."}
          </p>

          <h3>{"Проверить pool pressure"}</h3>
          <p>
            {"Намеренно ограничить pool и увидеть очередь вместо хаотичных выводов."}
          </p>

        </div>

        <Callout tone={"info"}>
          {"Методы add обычно не требуют await, а execute, commit, refresh, delete и rollback связаны с I/O и ожидаются асинхронно."}
        </Callout>

        <Callout tone={"warn"}>
          {"Долгая transaction удерживает connection вне зависимости от sync или async. Async не отменяет правила короткой transaction boundary."}
        </Callout>

      </Section>

      <Section number={"06"} title={"Архитектура Async StudyHub после этапа"}>
        <Lead>
          {"Финальный проект сохраняет знакомые слои StudyHub, но делает I/O-resources явными. Endpoint не создаёт клиент и engine на каждый request, service знает use case, database session живёт в request scope, а lifespan управляет долгоживущими ресурсами."}
        </Lead>

        <div className="lesson-route">
          <ol>
            <li>
              <strong>{"HTTP boundary:"}</strong>
              {" router принимает validated request и возвращает response schema."}
            </li>
            <li>
              <strong>{"Application service:"}</strong>
              {" координирует local database и external integration."}
            </li>
            <li>
              <strong>{"Dependencies:"}</strong>
              {" передают Settings, AsyncSession, current user и external client."}
            </li>
            <li>
              <strong>{"Lifespan:"}</strong>
              {" создаёт и закрывает shared AsyncClient и другие app-level resources."}
            </li>
            <li>
              <strong>{"Database layer:"}</strong>
              {" выполняет SQLAlchemy statements через AsyncSession."}
            </li>
            <li>
              <strong>{"Observability:"}</strong>
              {" request id связывает logs endpoint, integration и database operation."}
            </li>
          </ol>
          <p>
            {"Направление зависимостей остаётся прежним: инфраструктура обслуживает use case, а бизнес-правило не знает детали event loop, driver или HTTP-client."}
          </p>
        </div>

        <MethodGrid
          rows={[
            [
              <>{"main.py"}</>,
              <>{"создание FastAPI и lifespan"}</>,
            ],
            [
              <>{"routers"}</>,
              <>{"HTTP contract и dependency inputs"}</>,
            ],
            [
              <>{"services"}</>,
              <>{"application use cases и concurrency policy"}</>,
            ],
            [
              <>{"integrations"}</>,
              <>{"AsyncClient и external error mapping"}</>,
            ],
            [
              <>{"database"}</>,
              <>{"AsyncEngine, sessionmaker и get_db"}</>,
            ],
            [
              <>{"repositories/crud"}</>,
              <>{"SQLAlchemy statements без HTTP"}</>,
            ],
            [
              <>{"observability"}</>,
              <>{"logging context и request id"}</>,
            ],
          ]}
        />

        <CodeBlock
          caption={"целевая структура"}
          code={"app/\n├── main.py\n├── core/settings.py\n├── core/logging.py\n├── database/engine.py\n├── database/session.py\n├── integrations/recommendations.py\n├── routers/\n├── services/\n└── models/\ntests/\n├── integration/\n└── load/"}
        />

        <BranchExplorer
          code={"request\nrouter\nservice\n├── AsyncSession query\n├── AsyncClient request\n└── combine result\nresponse"}
          scenarios={[
            {
              label: "только локальные данные",
              activeLine: 3,
              output: "await database result",
            },
            {
              label: "внешняя рекомендация",
              activeLine: 4,
              output: "await external I/O without blocking loop",
            },
            {
              label: "два независимых источника",
              activeLine: 3,
              output: "service планирует controlled concurrency",
            },
            {
              label: "один источник упал",
              activeLine: 5,
              output: "service применяет заранее описанную policy",
            },
          ]}
        />

        <TypeCards>
          <TypeCard
            badge={"HTTP"}
            title={"Router"}
            code={"async def overview(...)"}
          >
            {"Описывает method/path/status и получает dependencies."}
          </TypeCard>
          <TypeCard
            badge={"use case"}
            badgeTone={"float"}
            title={"Service"}
            code={"await build_dashboard(...)"}
          >
            {"Решает, что можно выполнять независимо и как обработать частичный failure."}
          </TypeCard>
          <TypeCard
            badge={"I/O"}
            badgeTone={"str"}
            title={"Resources"}
            code={"AsyncSession + AsyncClient"}
          >
            {"Явно передаются и имеют контролируемый lifecycle."}
          </TypeCard>
          <TypeCard
            badge={"trace"}
            title={"Observability"}
            code={"request_id=..."}
          >
            {"Связывает события одного request от входа до response."}
          </TypeCard>
        </TypeCards>

        <div className="lesson-practice-steps">
          <h3>{"Проследить один request"}</h3>
          <p>
            {"Назвать каждый await и ресурс, который реально ожидается."}
          </p>

          <h3>{"Проверить lifecycle"}</h3>
          <p>
            {"Убедиться, что session закрывается на request, а AsyncClient — на shutdown."}
          </p>

          <h3>{"Найти скрытый blocking call"}</h3>
          <p>
            {"Проверить сторонние libraries внутри async path."}
          </p>

          <h3>{"Объяснить policy"}</h3>
          <p>
            {"Сформулировать, когда внешний failure отменяет response, а когда допустим fallback."}
          </p>

        </div>

        <Callout tone={"info"}>
          {"Async — инфраструктурная характеристика I/O-path. Доменные функции без ожидания могут оставаться обычными def и легче тестироваться."}
        </Callout>

        <Callout tone={"warn"}>
          {"Нельзя хранить одну глобальную AsyncSession на всё приложение. Session содержит изменяемое transaction state и ограничивается request/use case."}
        </Callout>

      </Section>

      <Section number={"07"} title={"Что ученик доказывает после каждого блока"}>
        <Lead>
          {"Этап оценивает не количество async def, а доказательства понимания. После каждого блока остаётся артефакт, который можно запустить, сломать, измерить и объяснить без скрытых ручных действий."}
        </Lead>

        <div className="lesson-route">
          <ol>
            <li>
              <strong>{"После блока 25:"}</strong>
              {" timeline, warning forgotten await и исправленный blocking call."}
            </li>
            <li>
              <strong>{"После блока 26:"}</strong>
              {" aggregator с timeout, cancellation, semaphore и partial results."}
            </li>
            <li>
              <strong>{"После блока 27:"}</strong>
              {" локальная HTTP integration, mock tests и lifespan trace."}
            </li>
            <li>
              <strong>{"После блока 28:"}</strong>
              {" AsyncSession CRUD, transaction tests, N+1 evidence и load report."}
            </li>
            <li>
              <strong>{"Для всего этапа:"}</strong>
              {" README миграции sync → async и decision table def/async def."}
            </li>
            <li>
              <strong>{"На защите:"}</strong>
              {" один request от HTTP-входа до PostgreSQL и external service."}
            </li>
          </ol>
          <p>
            {"Переход к Docker разрешён только после воспроизводимого запуска Async StudyHub и честного описания того, что стало лучше, что не изменилось и какие ограничения остались."}
          </p>
        </div>

        <MethodGrid
          rows={[
            [
              <>{"timeline"}</>,
              <>{"порядок run/wait/resume"}</>,
            ],
            [
              <>{"test"}</>,
              <>{"success, error, timeout и cancellation"}</>,
            ],
            [
              <>{"trace"}</>,
              <>{"request id во всех ключевых logs"}</>,
            ],
            [
              <>{"SQL count"}</>,
              <>{"доказательство отсутствия N+1 в выбранном endpoint"}</>,
            ],
            [
              <>{"benchmark"}</>,
              <>{"сценарий, input, concurrency и результаты"}</>,
            ],
            [
              <>{"decision record"}</>,
              <>{"почему выбран sync или async path"}</>,
            ],
            [
              <>{"runbook"}</>,
              <>{"как запустить mock-service и tests"}</>,
            ],
          ]}
        />

        <CodeBlock
          caption={"матрица доказательств"}
          code={"concept → prediction\nimplementation → reproducible run\nfailure → expected handling\nperformance claim → measurement\narchitecture choice → written boundary"}
        />

        <FlipCards
          cards={[
            {
              front: <>{"async def"}</>,
              back: <>{"Покажите awaitable I/O внутри и объясните, где loop переключается."}</>,
            },
            {
              front: <>{"быстрее"}</>,
              back: <>{"Покажите baseline, одинаковую нагрузку и измеренный результат."}</>,
            },
            {
              front: <>{"timeout"}</>,
              back: <>{"Покажите контролируемый response и server log причины."}</>,
            },
            {
              front: <>{"cancellation"}</>,
              back: <>{"Покажите cleanup и отсутствие ложного success."}</>,
            },
            {
              front: <>{"нет N+1"}</>,
              back: <>{"Покажите число SQL statements на список объектов."}</>,
            },
            {
              front: <>{"готово"}</>,
              back: <>{"Запустите проект и tests по README с чистого окружения."}</>,
            },
          ]}
        />

        <TypeCards>
          <TypeCard
            badge={"explain"}
            title={"Модель"}
            code={"run → wait → resume"}
          >
            {"Ученик объясняет поведение до чтения вывода."}
          </TypeCard>
          <TypeCard
            badge={"reproduce"}
            badgeTone={"float"}
            title={"Сценарий"}
            code={"command + expected result"}
          >
            {"Другой разработчик повторяет проверку по инструкции."}
          </TypeCard>
          <TypeCard
            badge={"fail"}
            badgeTone={"str"}
            title={"Ошибка"}
            code={"timeout / cancel / DB error"}
          >
            {"Failure является частью контракта, а не неожиданным traceback."}
          </TypeCard>
          <TypeCard
            badge={"measure"}
            title={"Evidence"}
            code={"p50 / p95 / SQL count"}
          >
            {"Заявление о качестве опирается на наблюдаемое число."}
          </TypeCard>
        </TypeCards>

        <div className="lesson-practice-steps">
          <h3>{"Сохранить команду запуска"}</h3>
          <p>
            {"Каждая лаборатория имеет короткий воспроизводимый entry point."}
          </p>

          <h3>{"Фиксировать ожидаемый output"}</h3>
          <p>
            {"До запуска записать порядок logs или status результата."}
          </p>

          <h3>{"Проверять альтернативу"}</h3>
          <p>
            {"Сравнить sync/async или unbounded/bounded вариант."}
          </p>

          <h3>{"Сформулировать границу"}</h3>
          <p>
            {"Назвать, где изученный подход не нужен или опасен."}
          </p>

        </div>

        <Callout tone={"info"}>
          {"Качественный async-код может содержать меньше async-функций, чем некачественный. Важна корректная граница I/O и lifecycle."}
        </Callout>

        <Callout tone={"warn"}>
          {"Нагрузочный тест без описания данных, concurrency, duration и окружения не позволяет сделать надёжный вывод."}
        </Callout>

      </Section>

      <Section number={"08"} title={"Рабочий ритм и контрольная точка этапа"}>
        <Lead>
          {"Асинхронность сложнее читать, потому что порядок событий не всегда совпадает с порядком создания задач. Поэтому каждый шаг курса опирается на короткий timeline, предсказание logs и один новый механизм за раз."}
        </Lead>

        <div className="lesson-route">
          <ol>
            <li>
              <strong>{"До кода:"}</strong>
              {" назвать I/O operation, момент отдачи управления и ожидаемый порядок событий."}
            </li>
            <li>
              <strong>{"Во время запуска:"}</strong>
              {" логировать operation id и состояния start/wait/done/error."}
            </li>
            <li>
              <strong>{"После запуска:"}</strong>
              {" сравнить prediction с output и объяснить несовпадение."}
            </li>
            <li>
              <strong>{"При ошибке:"}</strong>
              {" сначала проверить forgotten await и blocking call, затем lifecycle и exception path."}
            </li>
            <li>
              <strong>{"Перед интеграцией:"}</strong>
              {" проверить механизм в отдельной лаборатории."}
            </li>
            <li>
              <strong>{"Перед оптимизацией:"}</strong>
              {" снять baseline и определить измеряемую цель."}
            </li>
          </ol>
          <p>
            {"Этап завершён, когда ученик не только запускает Async StudyHub, но и может доказать, почему выбранный flow асинхронный, где находится controlled concurrency и как система ведёт себя при timeout, cancellation и database error."}
          </p>
        </div>

        <MethodGrid
          rows={[
            [
              <>{"понимание"}</>,
              <>{"coroutine, Task, event loop и await объясняются без метафорической магии"}</>,
            ],
            [
              <>{"управление"}</>,
              <>{"timeout, cancellation и semaphore имеют тестируемый contract"}</>,
            ],
            [
              <>{"интеграция"}</>,
              <>{"AsyncClient переиспользуется и заменяется mock"}</>,
            ],
            [
              <>{"база"}</>,
              <>{"AsyncSession ограничена request scope"}</>,
            ],
            [
              <>{"целостность"}</>,
              <>{"transaction commit/rollback сохранены"}</>,
            ],
            [
              <>{"производительность"}</>,
              <>{"N+1 и blocking call проверены отдельно"}</>,
            ],
            [
              <>{"наблюдаемость"}</>,
              <>{"request id и structured logs связывают flow"}</>,
            ],
          ]}
        />

        <CodeBlock
          caption={"контрольный маршрут"}
          code={"predict timeline\n→ run async-lab\n→ add controlled concurrency\n→ trigger timeout and cancellation\n→ call local mock API\n→ execute AsyncSession CRUD\n→ inspect SQL/log trace\n→ measure one scenario\n→ explain boundary"}
        />

        <BugHunt
          code={"async def dashboard():\n    profile = await load_profile()\n    stats = await load_stats()\n    response = requests.get(RECOMMENDATION_URL)\n    return profile, stats, response.json()"}
          question={"Какие две проблемы мешают назвать этот flow конкурентным и неблокирующим?"}
          options={[
            "Два await идут последовательно, а requests блокирует event loop",
            "В async def нельзя использовать return",
            "JSON нельзя получать из HTTP response",
          ]}
          correctIndex={0}
          explanation={"Независимые coroutine нужно планировать вместе, а blocking HTTP-client заменить awaitable library или вынести из async path."}
          fix={"async def dashboard(client):\n    profile_task = asyncio.create_task(load_profile())\n    stats_task = asyncio.create_task(load_stats())\n    profile, stats = await asyncio.gather(profile_task, stats_task)\n    response = await client.get(RECOMMENDATION_URL)\n    return profile, stats, response.json()"}
        />

        <TypeCards>
          <TypeCard
            badge={"1"}
            title={"Понять"}
            code={"кто выполняется сейчас?"}
          >
            {"Назвать active coroutine и ожидаемый I/O."}
          </TypeCard>
          <TypeCard
            badge={"2"}
            badgeTone={"float"}
            title={"Предсказать"}
            code={"start A → start B → ..."}
          >
            {"Записать порядок logs до запуска."}
          </TypeCard>
          <TypeCard
            badge={"3"}
            badgeTone={"str"}
            title={"Сломать"}
            code={"timeout / cancel / block"}
          >
            {"Проверить failure path отдельно от happy path."}
          </TypeCard>
          <TypeCard
            badge={"4"}
            title={"Доказать"}
            code={"test + trace + measurement"}
          >
            {"Закрепить вывод воспроизводимым артефактом."}
          </TypeCard>
        </TypeCards>

        <div className="lesson-practice-steps">
          <h3>{"Один механизм за сцену"}</h3>
          <p>
            {"Не вводить Task, timeout, semaphore и HTTP-client в одном первом примере."}
          </p>

          <h3>{"Одна переменная изменения"}</h3>
          <p>
            {"Менять delay, concurrency limit или timeout отдельно."}
          </p>

          <h3>{"Один failure path"}</h3>
          <p>
            {"Сначала добиться ожидаемой ошибки, затем добавить обработку."}
          </p>

          <h3>{"Одно объяснение"}</h3>
          <p>
            {"После практики сформулировать, что именно позволило loop выполнить другую работу."}
          </p>

        </div>

        <Callout tone={"info"}>
          {"Следующий этап упакует уже работающий Async StudyHub в Linux/Docker. Поэтому текущий этап заканчивается воспроизводимым runtime и ясными logs."}
        </Callout>

        <Callout tone={"warn"}>
          {"Не добавляйте WebSocket, Celery, Kafka или микросервисы ради демонстрации async. Они требуют отдельных моделей и не входят в контрольную точку этапа."}
        </Callout>

        <div className="lesson-check-group">
          <QuizCard
            question={"Почему asyncio изучается до Async FastAPI и AsyncSession?"}
            options={[
              "Чтобы понять event loop и await без шума фреймворка",
              "Потому что FastAPI не поддерживает async",
              "Чтобы отказаться от HTTP",
            ]}
            correctIndex={0}
            explanation={"Механизм легче увидеть на маленьких coroutine, а затем осознанно перенести в инфраструктуру."}
          />

          <QuizCard
            question={"Что доказывает пользу async-перехода?"}
            options={[
              "Измеренный I/O-сценарий и корректный failure contract",
              "Количество async def",
              "Отсутствие обычных функций",
            ]}
            correctIndex={0}
            explanation={"Async оценивается по конкретному ожиданию, поведению под concurrency и измерению."}
          />

          <QuizCard
            question={"Когда появляется AsyncSession?"}
            options={[
              "После coroutine, controlled concurrency и async HTTP integration",
              "В первом примере async def",
              "До изучения event loop",
            ]}
            correctIndex={0}
            explanation={"Database layer переводится после понимания общей модели и безопасного lifecycle."}
          />

          <QuizCard
            question={"Что остаётся источником истины в проекте?"}
            options={[
              "PostgreSQL",
              "Event loop",
              "AsyncClient",
            ]}
            correctIndex={0}
            explanation={"Async меняет способ ожидания I/O, но не роль PostgreSQL и database constraints."}
          />

        </div>

        <KeyTakeaways
          points={[
            <>{"Async решает ожидание I/O, а не ускоряет любое вычисление."}</>,
            <>{"Coroutine object создаётся раньше, чем начинает выполняться."}</>,
            <>{"Event loop переключается только в точках отдачи управления."}</>,
            <>{"Последовательные await не равны concurrency."}</>,
            <>{"Task, timeout, cancellation и semaphore управляют жизненным циклом работы."}</>,
            <>{"AsyncClient и AsyncSession имеют явный lifecycle."}</>,
            <>{"Async не исправляет N+1, длинную transaction или слабый SQL."}</>,
            <>{"Любое заявление о производительности подтверждается измерением."}</>,
          ]}
        />

        <PracticeCta
          text={"Перед занятием 141 запустите текущий PostgreSQL StudyHub, сохраните результаты tests и выберите один I/O-flow для будущего сравнения. Нарисуйте его как последовательность: Python work → external wait → Python work."}
        />

      </Section>

    </RichLesson>
  );
}

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
