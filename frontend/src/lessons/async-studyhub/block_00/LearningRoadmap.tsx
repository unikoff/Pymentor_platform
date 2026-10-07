import { Route, Zap } from "lucide-react";
import { BranchExplorer, BugHunt, Callout, CodeBlock, CodeSequence, CompareSolutions, FlipCards, KeyTakeaways, Lead, MatchPairs, MethodGrid, PracticeCta, QuizCard, RichHero, RichLesson, Section, TypeCard, TypeCards } from "../../shared";

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
