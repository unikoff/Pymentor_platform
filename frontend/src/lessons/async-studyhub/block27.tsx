import {
  Activity,
  GitFork,
  Globe2,
  Network,
  Plug,
  RefreshCw,
  ShieldCheck,
  TestTube2,
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
  RecallCard,
  RichHero,
  RichLesson,
  Section,
  StepThrough,
  TerminalDemo,
  TrueFalse,
  TypeCard,
  TypeCards,
} from "../shared";

type LessonProps = { module?: string };
const BLOCK_TITLE = "Блок 27 · Асинхронный FastAPI и внешние HTTP-сервисы";

type TheoryBridgeData = { link: string; boundary: string };
const THEORY_BRIDGES: Record<number, TheoryBridgeData> = {
  153: {
    link: "Предыдущий блок научил запускать coroutine конкурентно. Теперь переносим эту модель в FastAPI и выбираем async только для совместимого сетевого I/O.",
    boundary:
      "Само слово async не делает endpoint быстрее. Решение определяется библиотекой и видом работы, а не желанием переписать весь проект.",
  },
  154: {
    link: "Мы уже выбрали async def для маршрута внешней рекомендации. Теперь заменяем учебную задержку настоящим контрактом HTTP-клиента.",
    boundary:
      "AsyncClient не отменяет проверку статуса и формата данных. На этом уроке сначала строим успешный путь, а полный контракт ошибок вводим следующим шагом.",
  },
  155: {
    link: "Успешный AsyncClient-запрос уже работает. Теперь интеграция должна оставаться предсказуемой, когда внешний сервис тормозит, недоступен или отвечает ошибкой.",
    boundary:
      "Timeout, transport error и HTTP status — разные классы событий. Один широкий except лишает нас диагностики и мешает выбрать правильный ответ клиенту.",
  },
  156: {
    link: "Обработка сетевых ошибок уже определена. Теперь клиент должен создаваться по одному контракту и заменяться без изменения router или service.",
    boundary:
      "Dependency injection не должна превращаться в цепочку из десятков уровней. Здесь она решает конкретную задачу: конфигурацию и замену внешнего клиента.",
  },
  157: {
    link: "Dependency уже делает клиент заменяемым, но пока создаёт его заново на каждый request. Теперь меняем только lifecycle, не меняя service и router.",
    boundary:
      "Один клиент на приложение не означает один HTTP-запрос за раз. AsyncClient управляет пулом соединений и поддерживает конкурентные requests.",
  },
  158: {
    link: "У нас есть выбор async endpoint, AsyncClient, ошибки, dependency и lifespan. Финальный урок соединяет их в один наблюдаемый пользовательский сценарий.",
    boundary:
      "Агрегация не означает скрыть любую ошибку. Контракт явно сообщает, какие части доступны, какие деградировали и когда весь endpoint должен завершиться ошибкой.",
  },
};

function TheoryBridge({ lesson }: { lesson: number }) {
  const bridge = THEORY_BRIDGES[lesson];
  if (!bridge) return null;
  return (
    <Callout tone="info">
      <strong>Связь с курсом.</strong> {bridge.link}{" "}
      <strong>Важно не перепутать:</strong> {bridge.boundary}
    </Callout>
  );
}

// 153. def и async def внутри FastAPI
export function Lesson153({ module }: LessonProps) {
  return (
    <RichLesson>
      <RichHero
        variant="project"
        chip={module ?? BLOCK_TITLE}
        title={"def и async def внутри FastAPI"}
        intro={
          "Разберём, как FastAPI выполняет обычные и асинхронные обработчики, почему async нужен не каждому endpoint и как не заблокировать event loop синхронной библиотекой."
        }
        tags={[
          { icon: <GitFork size={14} />, label: "правило выбора endpoint" },
          { icon: <Activity size={14} />, label: "event loop без блокировки" },
        ]}
      />
      <TheoryBridge lesson={153} />

      <Section number={"01"} title={"Зачем выбирать форму endpoint осознанно"}>
        <Lead>
          {
            "В одном FastAPI-приложении могут одновременно жить обычные и асинхронные endpoint. Задача разработчика — не выбрать один стиль навсегда, а сопоставить обработчик с реальной работой: синхронной библиотекой, неблокирующим ожиданием сети или тяжёлым вычислением."
          }
        </Lead>

        <div className="lesson-route">
          <ol>
            <li>
              <strong>Назвать работу:</strong> база, внешний HTTP, файл или
              вычисление.
            </li>
            <li>
              <strong>Проверить библиотеку:</strong> синхронная она или
              предоставляет await.
            </li>
            <li>
              <strong>Выбрать границу:</strong> def для blocking API, async def
              для async-compatible I/O.
            </li>
            <li>
              <strong>Проверить ошибку:</strong> намеренно поместить blocking
              call в async endpoint и объяснить эффект.
            </li>
          </ol>
          <p>
            Проектный результат — карта endpoint Async StudyHub и один новый
            маршрут внешней рекомендации.
          </p>
        </div>

        <Callout tone="info">
          {
            "FastAPI поддерживает смешанное приложение. Не требуется одновременно переписывать все маршруты."
          }
        </Callout>
      </Section>

      <Section
        number={"02"}
        title={"Две формы обработчика и две модели выполнения"}
      >
        <Lead>
          {
            "Обычный def не является устаревшим вариантом. FastAPI может выполнить такой обработчик вне event loop, чтобы синхронный вызов не остановил все асинхронные задачи. Async def выполняется в event loop и должен добровольно отдавать управление на await."
          }
        </Lead>

        <TypeCards>
          <TypeCard
            badge={"def"}
            title={"Синхронный endpoint"}
            code={`@app.get("/courses")
        def list_courses(): ...`}
          >
            {
              "Подходит для синхронной библиотеки или короткой операции без await."
            }
          </TypeCard>
          <TypeCard
            badge={"async def"}
            badgeTone="float"
            title={"Асинхронный endpoint"}
            code={`@app.get("/insight")
        async def get_insight(): ...`}
          >
            {
              "Подходит, когда используемая библиотека предоставляет неблокирующее ожидание."
            }
          </TypeCard>
          <TypeCard
            badge={"CPU"}
            badgeTone="str"
            title={"Тяжёлое вычисление"}
            code={`calculate_report()`}
          >
            {
              "Не становится дешёвым после добавления async. Для него нужна отдельная стратегия выполнения."
            }
          </TypeCard>
        </TypeCards>

        <MethodGrid
          rows={[
            ["def + sync Session", "понятная синхронная цепочка уже работает"],
            [
              "async def + AsyncClient",
              "сетевое ожидание освобождает event loop",
            ],
            ["async def + time.sleep", "event loop блокируется"],
            [
              "async def + CPU loop",
              "вычисление занимает поток и не уступает управление",
            ],
          ]}
        />
      </Section>

      <Section number={"03"} title={"Что происходит с обычным def"}>
        <Lead>
          {
            "На прикладном уровне полезна следующая модель: event loop принимает запрос, а синхронный обработчик выполняется в отдельном рабочем потоке. После завершения результат возвращается в FastAPI."
          }
        </Lead>

        <StepThrough
          code={`request -> FastAPI
        FastAPI -> worker thread
        worker thread -> sync library
        sync library -> result
        result -> response`}
          steps={[
            {
              line: 0,
              note: "Запрос попадает в приложение.",
              vars: { request: "GET /courses" },
            },
            {
              line: 1,
              note: "FastAPI передаёт обычный def в рабочий поток.",
              vars: { "event loop": "может принимать другие события" },
            },
            {
              line: 2,
              note: "Синхронная библиотека выполняется привычным способом.",
              vars: { library: "sync SQLAlchemy" },
            },
            {
              line: 3,
              note: "Рабочий поток получает готовые данные.",
              vars: { result: "список курсов" },
            },
            {
              line: 4,
              note: "FastAPI формирует HTTP response.",
              vars: { status: "200" },
            },
          ]}
        />

        <TrueFalse
          statement={
            <>
              {
                "Обычный def внутри FastAPI автоматически превращает синхронную библиотеку в асинхронную."
              }
            </>
          }
          isTrue={false}
          explanation={
            "FastAPI лишь организует выполнение обработчика. Сама библиотека и её операции остаются синхронными."
          }
        />

        <Callout>
          {
            "Threadpool — практическая защита event loop, но не бесконечный ресурс. Долгие blocking-операции всё равно ухудшают пропускную способность."
          }
        </Callout>
      </Section>

      <Section
        number={"04"}
        title={"Почему blocking call опасен внутри async def"}
      >
        <Lead>
          {
            "Async endpoint выполняется в потоке event loop. Пока код не достигает настоящего await, другие coroutine не получают управление. Поэтому time.sleep или синхронный HTTP-клиент внутри async def блокируют общий цикл."
          }
        </Lead>

        <CompareSolutions
          question={"Какой endpoint корректно ждёт внешнюю сеть?"}
          left={{
            title: "Blocking внутри async",
            code: `@app.get("/insight")
        async def insight():
            response = requests.get(URL)
            return response.json()`,
            note: "Синхронный requests удерживает поток event loop.",
          }}
          right={{
            title: "Async-compatible клиент",
            code: `@app.get("/insight")
        async def insight():
            response = await client.get("/recommendations")
            return response.json()`,
            note: "Во время сетевого ожидания AsyncClient отдаёт управление event loop.",
          }}
          preferred={"right"}
          explanation={
            "Async def полезен только вместе с операциями, которые действительно можно await."
          }
        />

        <BugHunt
          code={`import time
        
        @app.get("/slow")
        async def slow_endpoint():
            time.sleep(2)
            return {"status": "ok"}`}
          question={"Что именно блокирует обработку других async-запросов?"}
          options={[
            "Декоратор @app.get",
            "Вызов time.sleep внутри event loop",
            "Возврат словаря",
          ]}
          correctIndex={1}
          explanation={"time.sleep не отдаёт управление event loop."}
          fix={`import asyncio
        
        @app.get("/slow")
        async def slow_endpoint():
            await asyncio.sleep(2)
            return {"status": "ok"}`}
        />
      </Section>

      <Section number={"05"} title={"Правило выбора по библиотеке и операции"}>
        <Lead>
          {
            "Сначала посмотрите на вызываемый API. Если операция имеет await и занимается I/O, используйте async def. Если библиотека синхронная, сохраните def либо изолируйте вызов осознанно. Для CPU-bound работы async не решает проблему."
          }
        </Lead>

        <BranchExplorer
          code={`if library_is_async and work_is_io:
            use_async_def()
        elif library_is_sync:
            use_def()
        elif work_is_cpu_heavy:
            move_or_limit_work()
        else:
            choose_simplest_clear_form()`}
          scenarios={[
            {
              label: "httpx.AsyncClient",
              activeLine: 1,
              output: "async def + await",
            },
            { label: "sync SQLAlchemy Session", activeLine: 3, output: "def" },
            {
              label: "построение большого PDF",
              activeLine: 5,
              output: "не выполнять тяжёлое CPU прямо в event loop",
            },
            {
              label: "короткий return",
              activeLine: 7,
              output: "простая форма без искусственного async",
            },
          ]}
        />

        <MatchPairs
          prompt={"Соедините сценарий с разумной формой endpoint."}
          leftTitle={"Сценарий"}
          rightTitle={"Выбор"}
          pairs={[
            { left: "синхронный репозиторий SQLAlchemy", right: "def" },
            { left: "await client.get(...)", right: "async def" },
            {
              left: "миллионы вычислений в Python",
              right: "отдельная стратегия CPU-bound",
            },
            {
              left: "возврат константы healthcheck",
              right: "любая простая форма, без обещания ускорения",
            },
          ]}
          explanation={
            "Решение опирается на характер операции и используемую библиотеку."
          }
        />
      </Section>

      <Section number={"06"} title={"Аудит текущих endpoints Async StudyHub"}>
        <Lead>
          {
            "До изменения кода составим таблицу. Существующий CRUD пока использует синхронный SQLAlchemy и остаётся def. Новый маршрут рекомендаций ожидает внешний HTTP и станет async def."
          }
        </Lead>

        <TypeCards>
          <TypeCard
            badge={"оставить"}
            title={"GET /courses"}
            code={`def list_courses(db: Session)`}
          >
            {
              "Работает через синхронную Session; переписывать без AsyncSession рано."
            }
          </TypeCard>
          <TypeCard
            badge={"оставить"}
            badgeTone="float"
            title={"POST /courses"}
            code={`def create_course(db: Session)`}
          >
            {"Синхронная транзакция сохраняет текущий контракт."}
          </TypeCard>
          <TypeCard
            badge={"добавить"}
            badgeTone="str"
            title={"GET /courses/{id}/insight"}
            code={`async def course_insight(...)`}
          >
            {
              "Новый endpoint ждёт внешний сервис рекомендаций через AsyncClient."
            }
          </TypeCard>
        </TypeCards>

        <CodeBlock
          caption={"первый async-контракт"}
          code={`@app.get("/courses/{course_id}/insight")
        async def course_insight(course_id: int):
            # Реальный HTTP-вызов появится в следующем занятии.
            await asyncio.sleep(0)
            return {
                "course_id": course_id,
                "recommendations": [],
            }`}
        />

        <Callout tone="info">
          {
            "На этом шаге мы меняем только один понятный маршрут. База данных перейдёт на AsyncSession в следующем блоке."
          }
        </Callout>
      </Section>

      <Section number={"07"} title={"Проверяем выбор и фиксируем решение"}>
        <Lead>
          {
            "Хороший результат урока — не количество async-функций, а объяснимая карта. Для каждого endpoint должно быть видно, какая библиотека вызывается, где возникает ожидание и почему выбран def или async def."
          }
        </Lead>

        <RecallCard
          question={
            "Как объяснить выбор async def для маршрута рекомендаций одним предложением?"
          }
          hint={"Назовите библиотеку, вид работы и момент передачи управления."}
          answer={
            <p>
              {
                "Маршрут использует httpx.AsyncClient и ожидает внешний сетевой ответ; await позволяет event loop обслуживать другие запросы во время ожидания."
              }
            </p>
          }
        />

        <TerminalDemo
          title={"аудит проекта"}
          lines={[
            { cmd: `python -m pytest tests/test_endpoint_modes.py -q` },
            { out: `4 passed` },
            {
              cmd: `git diff -- app/routers/courses.py docs/endpoint-modes.md`,
            },
            {
              out: `+ async def course_insight(...)
        + таблица решений def / async def`,
            },
            { cmd: `git commit -am "docs: classify sync and async endpoints"` },
          ]}
        />

        <Callout>
          {
            "Не измеряйте успех числом async def. Измеряйте отсутствием blocking-вызовов в event loop и ясностью контракта."
          }
        </Callout>
      </Section>

      <Section number="08" title="Проверка понимания и проектная практика">
        <Lead>
          Закройте подсказки и объясните маршрут данных своими словами. Затем
          пройдите четыре вопроса и только после этого переходите к проектной
          задаче.
        </Lead>

        <div className="lesson-check-group">
          <QuizCard
            question={"Когда async def оправдан?"}
            options={[
              "Когда библиотека предоставляет await для I/O",
              "Всегда в FastAPI",
              "Только для коротких функций",
            ]}
            correctIndex={0}
            explanation={
              "Async нужен там, где есть совместимое неблокирующее ожидание."
            }
          />

          <QuizCard
            question={"Что опасно внутри async endpoint?"}
            options={[
              "time.sleep(2)",
              "await client.get(...)",
              'return {"ok": True}',
            ]}
            correctIndex={0}
            explanation={"time.sleep блокирует поток event loop."}
          />

          <QuizCard
            question={"Что делать с существующим sync SQLAlchemy CRUD?"}
            options={[
              "Оставить def до перехода на AsyncSession",
              "Добавить await перед session.query",
              "Удалить endpoints",
            ]}
            correctIndex={0}
            explanation={
              "Форма endpoint должна соответствовать текущей синхронной библиотеке."
            }
          />

          <QuizCard
            question={"Ускоряет ли async CPU-bound цикл?"}
            options={[
              "Нет, сам по себе не ускоряет",
              "Да, всегда в два раза",
              "Только если добавить print",
            ]}
            correctIndex={0}
            explanation={"CPU-вычисление продолжает занимать поток."}
          />
        </div>

        <KeyTakeaways
          points={[
            "FastAPI допускает смешанные def и async def endpoints.",
            "Обычный def подходит синхронным библиотекам и не является ошибкой.",
            "Async def должен использовать async-compatible I/O и настоящий await.",
            "Blocking call внутри event loop задерживает другие coroutine.",
            "CPU-bound работа не ускоряется от одного изменения синтаксиса.",
            "Переход Async StudyHub выполняется по одному проверяемому сценарию.",
          ]}
        />

        <PracticeCta
          text={
            "Составьте таблицу всех endpoints StudyHub: библиотека, вид работы, выбранная форма и риск блокировки. Добавьте каркас GET /courses/{course_id}/insight как единственный новый async endpoint и зафиксируйте решение отдельным коммитом."
          }
        />
      </Section>
    </RichLesson>
  );
}

// 154. Первый запрос через httpx.AsyncClient
export function Lesson154({ module }: LessonProps) {
  return (
    <RichLesson>
      <RichHero
        variant="project"
        chip={module ?? BLOCK_TITLE}
        title={"Первый запрос через httpx.AsyncClient"}
        intro={
          "Подключим внешний учебный сервис рекомендаций: создадим AsyncClient, выполним await client.get, прочитаем JSON и аккуратно закроем сетевой ресурс."
        }
        tags={[
          { icon: <Globe2 size={14} />, label: "внешний HTTP request" },
          { icon: <Zap size={14} />, label: "неблокирующее ожидание" },
        ]}
      />
      <TheoryBridge lesson={154} />

      <Section
        number={"01"}
        title={"От локального endpoint к внешней интеграции"}
      >
        <Lead>
          {
            "Async StudyHub хранит курсы локально, но дополнительная рекомендация приходит из отдельного учебного сервиса Catalog Insight. Endpoint должен дождаться сети, не блокируя event loop, и вернуть клиенту понятную часть внешнего JSON."
          }
        </Lead>

        <div className="lesson-route">
          <ol>
            <li>
              <strong>Создать клиент:</strong> открыть httpx.AsyncClient через
              async with.
            </li>
            <li>
              <strong>Отправить запрос:</strong> выполнить await client.get с
              path и params.
            </li>
            <li>
              <strong>Проверить ответ:</strong> увидеть status_code и разобрать
              JSON.
            </li>
            <li>
              <strong>Закрыть ресурс:</strong> выйти из async context manager.
            </li>
          </ol>
          <p>
            Итог — работающий service-функция fetch_recommendations(course_id).
          </p>
        </div>

        <Callout tone="info">
          {
            "Внешний сервис в учебном проекте запускается локально или заменяется mock. Урок не зависит от публичного API."
          }
        </Callout>
      </Section>

      <Section
        number={"02"}
        title={"AsyncClient как управляемый сетевой ресурс"}
      >
        <Lead>
          {
            "HTTP-клиент хранит настройки и соединения. На первом шаге удобно создать его на один вызов через async with: вход открывает ресурс, выход гарантированно закрывает его."
          }
        </Lead>

        <TypeCards>
          <TypeCard
            badge={"client"}
            title={"Настройки соединения"}
            code={`httpx.AsyncClient(base_url=...)`}
          >
            {"Хранит base URL, timeout, headers и пул соединений."}
          </TypeCard>
          <TypeCard
            badge={"await"}
            badgeTone="float"
            title={"Сетевое ожидание"}
            code={`await client.get("/recommendations")`}
          >
            {"Coroutine приостанавливается, пока сокет ожидает ответ."}
          </TypeCard>
          <TypeCard
            badge={"close"}
            badgeTone="str"
            title={"Завершение ресурса"}
            code={`async with ...`}
          >
            {"Контекстный менеджер закрывает клиент даже при исключении."}
          </TypeCard>
        </TypeCards>

        <CodeBlock
          caption={"минимальный успешный запрос"}
          code={`import httpx
        
        async def fetch_recommendations(course_id: int) -> dict:
            async with httpx.AsyncClient(
                base_url="http://catalog-insight:9000",
            ) as client:
                response = await client.get(
                    "/recommendations",
                    params={"course_id": course_id},
                )
                return response.json()`}
        />
      </Section>

      <Section number={"03"} title={"Путь выполнения await client.get"}>
        <Lead>
          {
            "Вызов client.get возвращает awaitable-операцию. На await текущая coroutine приостанавливается, event loop может продолжить другие задачи, а после ответа выполнение возвращается к следующей строке."
          }
        </Lead>

        <StepThrough
          code={`async with AsyncClient(...) as client:
            request = client.get(...)
            response = await request
            payload = response.json()
        return payload`}
          steps={[
            {
              line: 0,
              note: "Создаётся и открывается клиент.",
              vars: { client: "open" },
            },
            {
              line: 1,
              note: "Формируется HTTP-операция.",
              vars: { method: "GET" },
            },
            {
              line: 2,
              note: "Во время ожидания coroutine отдаёт управление event loop.",
              vars: { state: "waiting I/O" },
            },
            {
              line: 2,
              note: "После ответа coroutine возобновляется.",
              vars: { status: "200" },
            },
            {
              line: 3,
              note: "JSON преобразуется в Python-объект.",
              vars: { payload: "dict" },
            },
            {
              line: 4,
              note: "После выхода из async with клиент закрывается.",
              vars: { client: "closed" },
            },
          ]}
        />

        <PredictOutput
          code={`async def main():
            print("до запроса")
            data = await fetch_recommendations(7)
            print(data["course_id"])
            print("после запроса")`}
          output={`до запроса
        7
        после запроса`}
          hint={
            "После await выполнение продолжится со строки чтения course_id."
          }
        />
      </Section>

      <Section number={"04"} title={"Base URL, path и query parameters"}>
        <Lead>
          {
            "Base URL задаёт адрес сервиса один раз. Отдельный запрос добавляет path и параметры. Такой контракт проще читать и тестировать, чем склеенная вручную строка."
          }
        </Lead>

        <MethodGrid
          rows={[
            ["base_url", "http://catalog-insight:9000 — адрес сервиса"],
            ["path", "/recommendations — конкретный ресурс"],
            ["params", '{"course_id": 7} — query string'],
            ["response.status_code", "числовой HTTP-статус внешнего ответа"],
            ["response.json()", "декодирование JSON в Python-данные"],
          ]}
        />

        <CodeSequence
          title={"Соберите безопасный успешный запрос"}
          prompt={"Расположите шаги от открытия клиента до возврата JSON."}
          pieces={[
            {
              id: "open",
              code: "async with httpx.AsyncClient(base_url=URL) as client:",
            },
            {
              id: "get",
              code: '    response = await client.get("/recommendations", params=params)',
            },
            { id: "status", code: "    response.raise_for_status()" },
            { id: "json", code: "    payload = response.json()" },
            { id: "return", code: "    return payload" },
            {
              id: "requests",
              code: "response = requests.get(URL)",
              note: "blocking-клиент",
            },
          ]}
          correctOrder={["open", "get", "status", "json", "return"]}
          explanation={
            "Клиент управляется контекстом, запрос ожидается через await, а данные возвращаются после проверки ответа."
          }
        />
      </Section>

      <Section number={"05"} title={"Форма внешнего JSON и явный выбор данных"}>
        <Lead>
          {
            "Внешний сервис может вернуть больше полей, чем нужно StudyHub. Service-функция должна выбрать только согласованные данные и не протаскивать случайный внешний JSON напрямую в публичный API."
          }
        </Lead>

        <CodeBlock
          caption={"внешний payload"}
          code={`# Ответ Catalog Insight
        {
            "course_id": 7,
            "items": [
                {"title": "Повторить async/await", "score": 0.91},
                {"title": "Разобрать timeout", "score": 0.84}
            ],
            "model_version": "demo-1"
        }`}
        />

        <CodeBlock
          caption={"внутренний контракт StudyHub"}
          code={`async def load_course_insight(course_id: int) -> dict:
            payload = await fetch_recommendations(course_id)
        
            return {
                "course_id": payload["course_id"],
                "recommendations": [
                    item["title"]
                    for item in payload.get("items", [])
                ],
            }`}
        />

        <RecallCard
          question={
            "Почему не стоит возвращать внешний JSON клиенту без отбора?"
          }
          hint={"Подумайте о границе между двумя сервисами."}
          answer={
            <p>
              {
                "Внешний сервис может изменить лишние поля, раскрыть технические детали или иметь другой контракт. StudyHub должен владеть формой собственного response."
              }
            </p>
          }
        />
      </Section>

      <Section number={"06"} title={"Подключаем service к FastAPI endpoint"}>
        <Lead>
          {
            "Endpoint остаётся тонким: получает course_id, вызывает service и возвращает подготовленный результат. Детали URL и парсинга не должны разрастаться внутри router."
          }
        </Lead>

        <CodeBlock
          caption={"router вызывает service"}
          code={`from fastapi import APIRouter
        
        router = APIRouter(prefix="/courses", tags=["courses"])
        
        @router.get("/{course_id}/insight")
        async def get_course_insight(course_id: int):
            return await load_course_insight(course_id)`}
        />

        <CompareSolutions
          question={"Где лучше держать детали внешнего запроса?"}
          left={{
            title: "Весь HTTP-код в endpoint",
            code: `@router.get("/{course_id}/insight")
        async def endpoint(course_id: int):
            async with httpx.AsyncClient(...) as client:
                response = await client.get(...)
                return response.json()`,
            note: "Router знает URL, параметры и форму внешнего payload.",
          }}
          right={{
            title: "Отдельная service-функция",
            code: `@router.get("/{course_id}/insight")
        async def endpoint(course_id: int):
            return await load_course_insight(course_id)`,
            note: "Router связывает HTTP-вход с самостоятельным сценарием.",
          }}
          preferred={"right"}
          explanation={
            "Отдельный service легче тестировать и расширять обработкой ошибок."
          }
        />
      </Section>

      <Section
        number={"07"}
        title={"Запуск локального mock-service и диагностика"}
      >
        <Lead>
          {
            "Чтобы упражнение было воспроизводимым, внешний сервис запускается локально. Мы проверяем URL, path, параметры и полученный JSON без зависимости от интернета."
          }
        </Lead>

        <TerminalDemo
          title={"два локальных сервиса"}
          lines={[
            { cmd: `uvicorn mock_catalog.main:app --port 9000` },
            { out: `Catalog Insight listening on http://127.0.0.1:9000` },
            { cmd: `uvicorn app.main:app --port 8000` },
            { out: `Async StudyHub listening on http://127.0.0.1:8000` },
            { cmd: `curl http://127.0.0.1:8000/courses/7/insight` },
            {
              out: `{"course_id":7,"recommendations":["Повторить async/await"]}`,
            },
          ]}
        />

        <BugHunt
          code={`async def fetch_recommendations(course_id: int):
            async with httpx.AsyncClient(base_url=URL) as client:
                response = client.get(
                    "/recommendations",
                    params={"course_id": course_id},
                )
                return response.json()`}
          question={"Почему response не является готовым HTTP-ответом?"}
          options={[
            "Пропущен await перед client.get",
            "Нельзя передавать params",
            "AsyncClient не поддерживает GET",
          ]}
          correctIndex={0}
          explanation={
            "Без await переменная содержит coroutine/awaitable, а не завершённый response."
          }
          fix={`async def fetch_recommendations(course_id: int):
            async with httpx.AsyncClient(base_url=URL) as client:
                response = await client.get(
                    "/recommendations",
                    params={"course_id": course_id},
                )
                return response.json()`}
        />

        <h3 className="lesson-subtitle">
          Контроль успешного пути перед ошибками сети
        </h3>

        <Lead>
          {
            "Перед добавлением сложной обработки ошибок важно зафиксировать один рабочий сценарий. Он станет baseline: известный course_id, ожидаемый path, status 200 и согласованная форма результата."
          }
        </Lead>

        <MatchPairs
          prompt={"Соедините часть запроса с её ролью."}
          leftTitle={"Фрагмент"}
          rightTitle={"Роль"}
          pairs={[
            {
              left: "AsyncClient(base_url=...)",
              right: "конфигурация клиента",
            },
            {
              left: "await client.get(...)",
              right: "неблокирующее ожидание ответа",
            },
            { left: 'params={"course_id": 7}', right: "query parameters" },
            { left: "response.json()", right: "декодирование тела" },
            { left: "async with", right: "гарантированное закрытие клиента" },
          ]}
          explanation={
            "Полный запрос состоит из отдельных обязанностей, которые удобно проверять по одной."
          }
        />

        <TrueFalse
          statement={
            <>
              {
                "response.json() автоматически гарантирует, что внешний статус равен 200."
              }
            </>
          }
          isTrue={false}
          explanation={
            "JSON может присутствовать и в ошибочном ответе. Статус проверяется отдельно."
          }
        />

        <Callout>
          {
            "Следующий урок добавит timeout, RequestError и отображение внешних сбоев в безопасный API-контракт."
          }
        </Callout>
      </Section>

      <Section number="08" title="Проверка понимания и проектная практика">
        <Lead>
          Закройте подсказки и объясните маршрут данных своими словами. Затем
          пройдите четыре вопроса и только после этого переходите к проектной
          задаче.
        </Lead>

        <div className="lesson-check-group">
          <QuizCard
            question={"Зачем нужен await перед client.get?"}
            options={[
              "Дождаться HTTP-ответа без блокировки loop",
              "Сделать URL короче",
              "Преобразовать int в str",
            ]}
            correctIndex={0}
            explanation={"await приостанавливает coroutine до завершения I/O."}
          />

          <QuizCard
            question={"Что делает async with для AsyncClient?"}
            options={[
              "Гарантирует закрытие ресурса",
              "Добавляет retry",
              "Создаёт базу данных",
            ]}
            correctIndex={0}
            explanation={
              "Контекстный менеджер управляет жизненным циклом клиента."
            }
          />

          <QuizCard
            question={"Где задаётся course_id в примере?"}
            options={[
              "В params как query parameter",
              "В заголовке Content-Type",
              "В имени переменной клиента",
            ]}
            correctIndex={0}
            explanation={"params формирует query string внешнего запроса."}
          />

          <QuizCard
            question={"Почему router не должен возвращать весь внешний JSON?"}
            options={[
              "StudyHub должен владеть своим response-контрактом",
              "JSON запрещён в FastAPI",
              "AsyncClient возвращает только строки",
            ]}
            correctIndex={0}
            explanation={
              "Внешние технические поля не должны становиться публичным контрактом StudyHub."
            }
          />
        </div>

        <KeyTakeaways
          points={[
            "httpx.AsyncClient предоставляет асинхронный HTTP-клиент.",
            "await client.get отдаёт управление event loop во время сети.",
            "async with гарантирует закрытие клиента на первом учебном шаге.",
            "Base URL, path и params описывают разные части запроса.",
            "Внешний JSON преобразуется во внутренний контракт StudyHub.",
            "Router связывает HTTP-вход с service, а не хранит всю интеграцию.",
          ]}
        />

        <PracticeCta
          text={
            "Запустите локальный Catalog Insight mock-service. Реализуйте fetch_recommendations и GET /courses/{course_id}/insight через httpx.AsyncClient, проверьте status 200 и сохраните baseline-тест успешного ответа."
          }
        />
      </Section>
    </RichLesson>
  );
}

// 155. HTTP timeout, network errors и безопасный response
export function Lesson155({ module }: LessonProps) {
  return (
    <RichLesson>
      <RichHero
        variant="project"
        chip={module ?? BLOCK_TITLE}
        title={"HTTP timeout, network errors и безопасный response"}
        intro={
          "Научимся отличать медленный ответ, невозможность соединения и ошибочный HTTP-статус, а затем переводить внешние сбои в стабильный контракт Async StudyHub без traceback для клиента."
        }
        tags={[
          { icon: <Timer size={14} />, label: "connect и read timeout" },
          { icon: <ShieldCheck size={14} />, label: "безопасная деградация" },
        ]}
      />
      <TheoryBridge lesson={155} />

      <Section number={"01"} title={"Сеть является ненадёжной частью сценария"}>
        <Lead>
          {
            "Локальный код может быть корректным, а внешний сервис всё равно не ответит вовремя. Надёжная интеграция заранее описывает несколько исходов: success, timeout, transport error и неуспешный HTTP status."
          }
        </Lead>

        <FlipCards
          cards={[
            {
              front: "200 + JSON",
              back: "Успешный внешний ответ: проверяем контракт и используем данные.",
            },
            {
              front: "TimeoutException",
              back: "Соединение или чтение превысили установленное время ожидания.",
            },
            {
              front: "RequestError",
              back: "DNS, connection refused, reset и другие транспортные проблемы.",
            },
            {
              front: "HTTPStatusError",
              back: "Ответ получен, но status_code показывает ошибку после raise_for_status().",
            },
          ]}
        />

        <Callout tone="info">
          {
            "Ошибка внешнего сервиса не должна автоматически превращаться во внутренний traceback StudyHub."
          }
        </Callout>
      </Section>

      <Section
        number={"02"}
        title={"Timeout — часть контракта, а не случайная константа"}
      >
        <Lead>
          {
            "Без ограничения ожидания запрос может удерживать ресурс слишком долго. Httpx позволяет отдельно настроить connect, read, write и pool timeout. Для первого проекта достаточно осознанного общего значения и понимания фаз."
          }
        </Lead>

        <TypeCards>
          <TypeCard
            badge={"connect"}
            title={"Установить соединение"}
            code={`connect=0.5`}
          >
            {"Сколько ждать подключения к внешнему host."}
          </TypeCard>
          <TypeCard
            badge={"read"}
            badgeTone="float"
            title={"Получить данные"}
            code={`read=1.5`}
          >
            {"Сколько ждать очередную часть ответа после соединения."}
          </TypeCard>
          <TypeCard
            badge={"pool"}
            badgeTone="str"
            title={"Получить соединение из пула"}
            code={`pool=0.5`}
          >
            {"Сколько ждать свободное соединение клиента."}
          </TypeCard>
        </TypeCards>

        <CodeBlock
          caption={"явная конфигурация timeout"}
          code={`timeout = httpx.Timeout(
            connect=0.5,
            read=1.5,
            write=1.0,
            pool=0.5,
        )
        
        async with httpx.AsyncClient(
            base_url=settings.catalog_url,
            timeout=timeout,
        ) as client:
            response = await client.get("/recommendations")`}
        />

        <Callout>
          {
            "Timeout ограничивает ожидание. Он не является автоматическим retry и не гарантирует успешный ответ со второй попытки."
          }
        </Callout>
      </Section>

      <Section
        number={"03"}
        title={"Разделяем timeout, transport error и status error"}
      >
        <Lead>
          {
            "Порядок обработки отражает природу сбоя. TimeoutException говорит о превышении времени. RequestError — о проблеме доставки. raise_for_status создаёт HTTPStatusError, когда внешний сервер ответил 4xx/5xx."
          }
        </Lead>

        <BranchExplorer
          code={`try:
            response = await client.get(path)
            response.raise_for_status()
        except httpx.TimeoutException:
            return gateway_timeout()
        except httpx.RequestError:
            return service_unavailable()
        except httpx.HTTPStatusError:
            return bad_gateway()
        else:
            return parse_payload(response)`}
          scenarios={[
            {
              label: "медленный read",
              activeLine: 4,
              output: "504 Gateway Timeout",
            },
            {
              label: "connection refused",
              activeLine: 6,
              output: "503 Service Unavailable",
            },
            { label: "внешний 500", activeLine: 8, output: "502 Bad Gateway" },
            {
              label: "внешний 200",
              activeLine: 10,
              output: "разобрать payload",
            },
          ]}
        />

        <MatchPairs
          prompt={"Соедините событие и внешний статус StudyHub."}
          leftTitle={"Событие"}
          rightTitle={"Ответ"}
          pairs={[
            { left: "внешний timeout", right: "504 Gateway Timeout" },
            {
              left: "невозможно подключиться",
              right: "503 Service Unavailable",
            },
            { left: "внешний сервис вернул 500", right: "502 Bad Gateway" },
            {
              left: "ошибка локальной валидации course_id",
              right: "422/404 по собственному контракту",
            },
          ]}
          explanation={
            "Маппинг должен быть стабильным и отделять локальные ошибки от ошибок upstream."
          }
        />
      </Section>

      <Section
        number={"04"}
        title={"raise_for_status делает ошибочный status явным"}
      >
        <Lead>
          {
            "Сам client.get не считает 404 или 500 исключением: это корректно доставленный HTTP-ответ. Вызов raise_for_status проверяет статус и создаёт отдельное исключение."
          }
        </Lead>

        <CompareSolutions
          question={"Какой вариант не пропустит внешний 500 как обычный JSON?"}
          left={{
            title: "Сразу читать тело",
            code: `response = await client.get(path)
        return response.json()`,
            note: "JSON с ошибкой может попасть в успешный путь.",
          }}
          right={{
            title: "Сначала проверить status",
            code: `response = await client.get(path)
        response.raise_for_status()
        return response.json()`,
            note: "Неуспешный status отделяется до парсинга успешной модели.",
          }}
          preferred={"right"}
          explanation={
            "HTTP status является частью контракта и проверяется до использования успешных данных."
          }
        />

        <BugHunt
          code={`try:
            response = await client.get(path)
        except httpx.HTTPStatusError:
            return {"items": []}`}
          question={
            "Почему except HTTPStatusError никогда не сработает для status 500?"
          }
          options={[
            "Не вызван response.raise_for_status()",
            "GET нельзя оборачивать в try",
            "HTTPStatusError относится только к JSON",
          ]}
          correctIndex={0}
          explanation={
            "httpx не выбрасывает HTTPStatusError автоматически после client.get."
          }
          fix={`try:
            response = await client.get(path)
            response.raise_for_status()
        except httpx.HTTPStatusError:
            return {"items": []}`}
        />
      </Section>

      <Section
        number={"05"}
        title={"Service переводит библиотечные ошибки в доменные"}
      >
        <Lead>
          {
            "Router не должен знать все классы httpx. Интеграционный service перехватывает библиотечные исключения и поднимает небольшое число собственных ошибок: ExternalTimeout, ExternalUnavailable и ExternalBadResponse."
          }
        </Lead>

        <CodeBlock
          caption={"граница библиотеки и приложения"}
          code={`class ExternalServiceError(Exception):
            pass
        
        class ExternalTimeout(ExternalServiceError):
            pass
        
        class ExternalUnavailable(ExternalServiceError):
            pass
        
        async def fetch_recommendations(client, course_id: int):
            try:
                response = await client.get(
                    "/recommendations",
                    params={"course_id": course_id},
                )
                response.raise_for_status()
                return response.json()
            except httpx.TimeoutException as error:
                raise ExternalTimeout from error
            except httpx.RequestError as error:
                raise ExternalUnavailable from error
            except httpx.HTTPStatusError as error:
                raise ExternalServiceError from error`}
        />

        <StepThrough
          code={`httpx.TimeoutException
        -> ExternalTimeout
        -> HTTPException(status_code=504)
        -> {"detail": "recommendation service timeout"}`}
          steps={[
            {
              line: 0,
              note: "Httpx сообщает технический класс сбоя.",
              vars: { layer: "client" },
            },
            {
              line: 1,
              note: "Service переводит его в ошибку интеграции.",
              vars: { layer: "service" },
            },
            {
              line: 2,
              note: "Router или handler выбирает HTTP status StudyHub.",
              vars: { status: "504" },
            },
            {
              line: 3,
              note: "Клиент получает безопасное сообщение без traceback.",
              vars: { "public body": "stable" },
            },
          ]}
        />
      </Section>

      <Section
        number={"06"}
        title={"Безопасный response и полезный серверный лог"}
      >
        <Lead>
          {
            "Пользователю не нужны внутренний URL, traceback и секретные headers. Серверному логу нужны operation id, имя upstream, вид ошибки и длительность. Эти две аудитории получают разные данные."
          }
        </Lead>

        <BugHunt
          code={`except Exception as error:
            raise HTTPException(
                status_code=500,
                detail=str(error),
            )`}
          question={"Почему detail=str(error) опасен?"}
          options={[
            "Может раскрыть внутренний URL и технические детали",
            "FastAPI принимает только числа",
            "Исключения нельзя преобразовывать в строки",
          ]}
          correctIndex={0}
          explanation={
            "Техническая информация должна остаться в серверном логе."
          }
          fix={`except ExternalTimeout:
            logger.warning(
                "catalog timeout",
                extra={"course_id": course_id},
            )
            raise HTTPException(
                status_code=504,
                detail="recommendation service timeout",
            )`}
        />

        <TerminalDemo
          title={"наблюдаемая ошибка"}
          lines={[
            { cmd: `curl -i http://localhost:8000/courses/7/insight` },
            {
              out: `HTTP/1.1 504 Gateway Timeout
        {"detail":"recommendation service timeout"}`,
            },
            {
              out: `server log: level=WARNING upstream=catalog course_id=7 error=timeout duration_ms=1504`,
            },
          ]}
        />

        <Callout>
          {
            "Не логируйте access token, cookie, пароль или полный чувствительный payload внешнего запроса."
          }
        </Callout>
      </Section>

      <Section
        number={"07"}
        title={"Таблица проверок интеграционного контракта"}
      >
        <Lead>
          {
            "Каждый внешний исход должен иметь ожидаемый HTTP status, публичное тело и серверный лог. Такая таблица превращает «обработать ошибки» в измеримый контракт."
          }
        </Lead>

        <MethodGrid
          rows={[
            ["success", "200 + рекомендации + info log по необходимости"],
            [
              "external 404/500",
              "502 + безопасный detail + upstream status в логе",
            ],
            ["timeout", "504 + стабильный detail + duration"],
            ["connection error", "503 + стабильный detail + transport class"],
            [
              "невалидный local course_id",
              "собственный 404 до внешнего вызова",
            ],
          ]}
        />

        <RecallCard
          question={"Чем timeout отличается от внешнего status 500?"}
          hint={"Разделите транспорт и HTTP-протокол."}
          answer={
            <p>
              {
                "При timeout завершённый HTTP-ответ не получен вовремя. При status 500 соединение и доставка состоялись, но upstream сообщил об ошибке."
              }
            </p>
          }
        />

        <TrueFalse
          statement={
            <>
              {
                "Один except Exception с ответом 500 сохраняет достаточно информации о природе внешнего сбоя."
              }
            </>
          }
          isTrue={false}
          explanation={
            "Он смешивает разные причины, ухудшает контракт и часто скрывает программные дефекты."
          }
        />
      </Section>

      <Section number="08" title="Проверка понимания и проектная практика">
        <Lead>
          Закройте подсказки и объясните маршрут данных своими словами. Затем
          пройдите четыре вопроса и только после этого переходите к проектной
          задаче.
        </Lead>

        <div className="lesson-check-group">
          <QuizCard
            question={"Что создаёт HTTPStatusError?"}
            options={[
              "response.raise_for_status()",
              "response.json()",
              "client.aclose()",
            ]}
            correctIndex={0}
            explanation={"Статус проверяется явным вызовом raise_for_status."}
          />

          <QuizCard
            question={"Какой status разумен для внешнего timeout?"}
            options={["504", "201", "401"]}
            correctIndex={0}
            explanation={"504 отражает timeout upstream-сервиса."}
          />

          <QuizCard
            question={"Что относится к RequestError?"}
            options={[
              "Connection refused",
              "Успешный JSON",
              "Локальный Pydantic 422",
            ]}
            correctIndex={0}
            explanation={
              "RequestError описывает транспортную проблему запроса."
            }
          />

          <QuizCard
            question={"Что показывать клиенту?"}
            options={[
              "Стабильное безопасное сообщение",
              "Полный traceback",
              "Секретный URL с токеном",
            ]}
            correctIndex={0}
            explanation={"Техническая диагностика остаётся в серверных логах."}
          />
        </div>

        <KeyTakeaways
          points={[
            "Timeout является явной границей ожидания внешнего сервиса.",
            "TimeoutException, RequestError и HTTPStatusError описывают разные события.",
            "raise_for_status отделяет успешный HTTP-ответ от 4xx/5xx.",
            "Service переводит классы httpx в небольшой доменный контракт ошибок.",
            "Клиент получает безопасный status и detail, сервер — диагностический лог.",
            "Success, timeout, transport error и bad status проверяются отдельно.",
          ]}
        />

        <PracticeCta
          text={
            "Добавьте конфигурацию timeout, вызов raise_for_status и собственные ошибки интеграции. Реализуйте стабильные ответы 502, 503 и 504, затем проверьте success, внешний 500, timeout и connection refused локальными тестами."
          }
        />
      </Section>
    </RichLesson>
  );
}

// 156. Dependency для внешнего клиента
export function Lesson156({ module }: LessonProps) {
  return (
    <RichLesson>
      <RichHero
        variant="project"
        chip={module ?? BLOCK_TITLE}
        title={"Dependency для внешнего клиента"}
        intro={
          "Уберём создание клиента из endpoint, централизуем URL и timeout через dependency provider, вынесем интеграционный service и научимся заменять клиента fake-реализацией в тестах."
        }
        tags={[
          { icon: <Plug size={14} />, label: "FastAPI dependency" },
          { icon: <TestTube2 size={14} />, label: "заменяемый fake client" },
        ]}
      />
      <TheoryBridge lesson={156} />

      <Section
        number={"01"}
        title={"Почему создание клиента внутри endpoint мешает развитию"}
      >
        <Lead>
          {
            "Когда каждый endpoint самостоятельно знает URL, timeout и headers, конфигурация дублируется. Тест вынужден запускать реальную сеть, а изменение адреса затрагивает несколько файлов. Dependency provider собирает клиент в одном месте."
          }
        </Lead>

        <TypeCards>
          <TypeCard
            badge={"provider"}
            title={"Создаёт зависимость"}
            code={`get_recommendation_client()`}
          >
            {"Берёт Settings и возвращает объект с согласованным контрактом."}
          </TypeCard>
          <TypeCard
            badge={"service"}
            badgeTone="float"
            title={"Использует клиент"}
            code={`RecommendationService(client)`}
          >
            {"Знает сценарий рекомендаций, но не читает environment."}
          </TypeCard>
          <TypeCard
            badge={"router"}
            badgeTone="str"
            title={"Связывает request"}
            code={`Depends(get_recommendation_client)`}
          >
            {"Получает готовую зависимость и вызывает service."}
          </TypeCard>
        </TypeCards>

        <Callout tone="info">
          {
            "Зависимость делает нужный объект явным параметром, а не скрытой глобальной переменной."
          }
        </Callout>
      </Section>

      <Section number={"02"} title={"Контракт provider и тип клиента"}>
        <Lead>
          {
            "Provider отвечает за сборку. Его возвращаемый тип показывает endpoint, что будет доступно. На первом шаге можно возвращать AsyncClient, но отдельный небольшой wrapper делает контракт уже и удобнее для fake."
          }
        </Lead>

        <MethodGrid
          rows={[
            ["Settings", "catalog_url, timeout, служебные headers"],
            [
              "get_recommendation_client",
              "создать или получить настроенный объект",
            ],
            ["RecommendationClient", "метод fetch(course_id)"],
            ["RecommendationService", "преобразовать данные и ошибки"],
            ["router", "HTTP status и response model"],
          ]}
        />

        <CodeBlock
          caption={"узкий клиент интеграции"}
          code={`class RecommendationClient:
            def __init__(self, http_client: httpx.AsyncClient):
                self.http_client = http_client
        
            async def fetch(self, course_id: int) -> dict:
                response = await self.http_client.get(
                    "/recommendations",
                    params={"course_id": course_id},
                )
                response.raise_for_status()
                return response.json()`}
        />
      </Section>

      <Section number={"03"} title={"Собираем dependency из Settings"}>
        <Lead>
          {
            "Provider получает Settings через уже знакомую зависимость, создаёт конфигурацию httpx и отдаёт RecommendationClient. На этом уроке используем yield, чтобы гарантировать закрытие созданного клиента."
          }
        </Lead>

        <CodeSequence
          title={"Соберите dependency provider"}
          prompt={"Расположите части от получения Settings до cleanup."}
          pieces={[
            {
              id: "def",
              code: "async def get_recommendation_client(settings: Settings = Depends(get_settings)):",
            },
            {
              id: "open",
              code: "    async with httpx.AsyncClient(base_url=settings.catalog_url, timeout=settings.catalog_timeout) as http_client:",
            },
            {
              id: "wrap",
              code: "        client = RecommendationClient(http_client)",
            },
            { id: "yield", code: "        yield client" },
            {
              id: "global",
              code: "client = httpx.AsyncClient()",
              note: "скрытый глобальный lifecycle",
            },
          ]}
          correctOrder={["def", "open", "wrap", "yield"]}
          explanation={
            "FastAPI получает объект до yield, а после завершения request выходит из async with и закрывает клиент."
          }
        />

        <CodeBlock
          caption={"читаемый alias зависимости"}
          code={`RecommendationClientDep = Annotated[
            RecommendationClient,
            Depends(get_recommendation_client),
        ]`}
        />
      </Section>

      <Section
        number={"04"}
        title={"Router, service и client имеют разные обязанности"}
      >
        <Lead>
          {
            "Dependency не заменяет service. Client знает HTTP-протокол внешнего сервиса, service знает сценарий StudyHub, router знает HTTP-контракт нашего API."
          }
        </Lead>

        <CompareSolutions
          question={"Какой вариант сохраняет границы?"}
          left={{
            title: "Router делает всё",
            code: `async def endpoint(course_id, settings):
            client = httpx.AsyncClient(...)
            response = await client.get(...)
            if response.status_code != 200: ...
            return response.json()`,
            note: "Смешаны конфигурация, транспорт, ошибки и публичный response.",
          }}
          right={{
            title: "Явная цепочка",
            code: `async def endpoint(course_id, client: ClientDep):
            service = RecommendationService(client)
            return await service.get_insight(course_id)`,
            note: "Каждый слой отвечает за один вид решения.",
          }}
          preferred={"right"}
          explanation={
            "Dependency предоставляет объект, service выполняет сценарий, router оформляет HTTP-границу."
          }
        />

        <MatchPairs
          prompt={"Соедините слой и вопрос, на который он отвечает."}
          leftTitle={"Слой"}
          rightTitle={"Вопрос"}
          pairs={[
            { left: "Settings", right: "какие URL и timeout использовать?" },
            { left: "provider", right: "как собрать объект зависимости?" },
            { left: "client", right: "как вызвать upstream по HTTP?" },
            { left: "service", right: "какие данные нужны StudyHub?" },
            {
              left: "router",
              right: "какой status и response увидит пользователь?",
            },
          ]}
          explanation={
            "Граница слоя определяется видом решения, а не длиной файла."
          }
        />
      </Section>

      <Section
        number={"05"}
        title={"Dependency override заменяет сеть в тесте"}
      >
        <Lead>
          {
            "FastAPI хранит отображение provider → override. Тест подменяет только сборку клиента. Endpoint и service выполняются как обычно, но вместо сети получают FakeRecommendationClient."
          }
        </Lead>

        <StepThrough
          code={`app.dependency_overrides[get_recommendation_client] = override_client
        request -> endpoint
        endpoint -> RecommendationService(fake)
        fake.fetch(course_id) -> prepared payload
        response -> test assertion`}
          steps={[
            {
              line: 0,
              note: "Тест регистрирует замену provider.",
              vars: { dependency: "override" },
            },
            {
              line: 1,
              note: "TestClient отправляет обычный HTTP request.",
              vars: { path: "/courses/7/insight" },
            },
            {
              line: 2,
              note: "Endpoint получает fake по той же сигнатуре.",
              vars: { client: "FakeRecommendationClient" },
            },
            {
              line: 3,
              note: "Fake возвращает заранее заданные данные без сети.",
              vars: { course_id: "7" },
            },
            {
              line: 4,
              note: "Тест проверяет публичный contract.",
              vars: { status: "200" },
            },
          ]}
        />

        <CodeBlock
          caption={"fake с тем же контрактом"}
          code={`class FakeRecommendationClient:
            async def fetch(self, course_id: int) -> dict:
                return {
                    "course_id": course_id,
                    "items": [
                        {"title": "Повторить timeout", "score": 0.9}
                    ],
                }`}
        />
      </Section>

      <Section
        number={"06"}
        title={"Fake должен имитировать поведение, а не внутренности httpx"}
      >
        <Lead>
          {
            "Хороший fake реализует минимальный публичный метод fetch. Он не обязан копировать request, socket или Response. В тесте можно создать несколько fake-вариантов: success, timeout и unavailable."
          }
        </Lead>

        <BugHunt
          code={`class FakeRecommendationClient:
            def fetch(self, course_id: int) -> dict:
                return {"course_id": course_id, "items": []}`}
          question={"Почему await client.fetch(course_id) завершится ошибкой?"}
          options={[
            "Метод fake объявлен через def, а контракт ожидает async def",
            "Словарь нельзя возвращать из fake",
            "course_id должен быть строкой",
          ]}
          correctIndex={0}
          explanation={
            "Fake обязан сохранять асинхронную форму публичного метода."
          }
          fix={`class FakeRecommendationClient:
            async def fetch(self, course_id: int) -> dict:
                return {"course_id": course_id, "items": []}`}
        />

        <CodeBlock
          caption={"контролируемые ошибочные fake"}
          code={`class TimeoutRecommendationClient:
            async def fetch(self, course_id: int) -> dict:
                raise ExternalTimeout
        
        class UnavailableRecommendationClient:
            async def fetch(self, course_id: int) -> dict:
                raise ExternalUnavailable`}
        />

        <TrueFalse
          statement={
            <>
              {
                "Fake должен наследоваться от httpx.AsyncClient, иначе FastAPI не сможет использовать override."
              }
            </>
          }
          isTrue={false}
          explanation={
            "Достаточно совместимого публичного контракта, который использует service."
          }
        />
      </Section>

      <Section number={"07"} title={"Изолированный тест HTTP-контракта"}>
        <Lead>
          {
            "Тест запускает FastAPI-приложение, но не запускает внешний сервис. Он проверяет route, dependency, service и response как одну вертикальную цепочку."
          }
        </Lead>

        <CodeBlock
          caption={"override без внешней сети"}
          code={`def test_course_insight_uses_fake_client(client, app):
            async def override_client():
                yield FakeRecommendationClient()
        
            app.dependency_overrides[
                get_recommendation_client
            ] = override_client
        
            response = client.get("/courses/7/insight")
        
            assert response.status_code == 200
            assert response.json() == {
                "course_id": 7,
                "recommendations": ["Повторить timeout"],
            }
        
            app.dependency_overrides.clear()`}
        />

        <TerminalDemo
          title={"быстрая проверка"}
          lines={[
            { cmd: `pytest tests/integration/test_course_insight.py -q` },
            { out: `3 passed in 0.21s` },
            { cmd: `pytest -q` },
            { out: `87 passed` },
          ]}
        />

        <RecallCard
          question={
            "Почему override лучше изменения глобальной переменной клиента?"
          }
          hint={"Назовите область действия и прозрачность зависимости."}
          answer={
            <p>
              {
                "Override заменяет явную точку сборки на время теста и затем очищается. Глобальная переменная создаёт скрытое состояние и связывает тесты друг с другом."
              }
            </p>
          }
        />

        <h3 className="lesson-subtitle">
          Проверяем граф зависимостей перед lifespan
        </h3>

        <Lead>
          {
            "После урока цепочка должна читаться сверху вниз: Settings → provider → client → service → router. В следующем уроке изменится только lifecycle provider: клиент будет жить всё время приложения."
          }
        </Lead>

        <BranchExplorer
          code={`settings = get_settings()
        client = get_recommendation_client(settings)
        service = RecommendationService(client)
        result = await service.get_insight(course_id)
        return CourseInsight(**result)`}
          scenarios={[
            { label: "конфигурация", activeLine: 0, output: "URL и timeout" },
            {
              label: "сборка клиента",
              activeLine: 1,
              output: "RecommendationClient",
            },
            {
              label: "сценарий",
              activeLine: 3,
              output: "подготовленные данные StudyHub",
            },
            {
              label: "response",
              activeLine: 4,
              output: "стабильная Pydantic-модель",
            },
          ]}
        />

        <Callout tone="info">
          {
            "Dependency override — одна из причин не создавать клиент внутри service или endpoint."
          }
        </Callout>
      </Section>

      <Section number="08" title="Проверка понимания и проектная практика">
        <Lead>
          Закройте подсказки и объясните маршрут данных своими словами. Затем
          пройдите четыре вопроса и только после этого переходите к проектной
          задаче.
        </Lead>

        <div className="lesson-check-group">
          <QuizCard
            question={"Что делает dependency provider?"}
            options={[
              "Собирает и возвращает настроенный объект",
              "Заменяет HTTP-протокол",
              "Создаёт таблицы SQL",
            ]}
            correctIndex={0}
            explanation={"Provider централизует сборку зависимости."}
          />

          <QuizCard
            question={"Что должен знать RecommendationService?"}
            options={[
              "Сценарий и преобразование данных",
              "Environment-переменные напрямую",
              "Как FastAPI хранит overrides",
            ]}
            correctIndex={0}
            explanation={
              "Service использует готовый client и реализует прикладной сценарий."
            }
          />

          <QuizCard
            question={"Зачем нужен dependency override?"}
            options={[
              "Заменить внешний клиент fake в тесте",
              "Ускорить CPU-цикл",
              "Изменить URL в браузере",
            ]}
            correctIndex={0}
            explanation={"Override изолирует тест от реальной сети."}
          />

          <QuizCard
            question={"Какой метод должен быть у async fake?"}
            options={[
              "async def fetch(...)",
              "def __iter__(...)",
              "staticmethod close_db(...)",
            ]}
            correctIndex={0}
            explanation={
              "Fake сохраняет асинхронный контракт вызываемого метода."
            }
          />
        </div>

        <KeyTakeaways
          points={[
            "Dependency provider централизует сборку внешнего клиента.",
            "Settings, provider, client, service и router решают разные задачи.",
            "Явный параметр зависимости лучше скрытого глобального объекта.",
            "Dependency override заменяет сеть без изменения production-кода.",
            "Fake сохраняет публичный async-контракт, а не копирует внутренности httpx.",
            "Вертикальный тест проверяет route, dependency, service и response вместе.",
          ]}
        />

        <PracticeCta
          text={
            "Создайте RecommendationClient, provider get_recommendation_client и RecommendationService. Подключите зависимость через Annotated, напишите success/timeout fake и три теста с dependency_overrides без запуска внешнего сервиса."
          }
        />
      </Section>
    </RichLesson>
  );
}

// 157. Lifespan и переиспользование AsyncClient
export function Lesson157({ module }: LessonProps) {
  return (
    <RichLesson>
      <RichHero
        variant="project"
        chip={module ?? BLOCK_TITLE}
        title={"Lifespan и переиспользование AsyncClient"}
        intro={
          "Перенесём AsyncClient с уровня одного request на уровень жизни FastAPI-приложения, сохраним его в app.state, переиспользуем connection pool и гарантированно закроем ресурс при shutdown."
        }
        tags={[
          {
            icon: <RefreshCw size={14} />,
            label: "startup → requests → shutdown",
          },
          {
            icon: <Network size={14} />,
            label: "переиспользование соединений",
          },
        ]}
      />
      <TheoryBridge lesson={157} />

      <Section
        number={"01"}
        title={"Почему клиент на каждый request — рабочий, но дорогой старт"}
      >
        <Lead>
          {
            "Создание AsyncClient внутри dependency безопасно для первых примеров, однако серия запросов постоянно создаёт и закрывает новые пулы соединений. Для долгоживущего приложения удобнее один клиент на startup и закрытие на shutdown."
          }
        </Lead>

        <CompareSolutions
          question={"Какой lifecycle лучше для повторяющейся интеграции?"}
          left={{
            title: "Клиент на каждый request",
            code: `async def dependency():
            async with AsyncClient(...) as client:
                yield client`,
            note: "Просто, но соединения не переиспользуются между запросами.",
          }}
          right={{
            title: "Клиент на lifespan приложения",
            code: `@asynccontextmanager
        async def lifespan(app):
            client = AsyncClient(...)
            app.state.catalog_client = client
            yield
            await client.aclose()`,
            note: "Один управляемый pool живёт вместе с приложением.",
          }}
          preferred={"right"}
          explanation={
            "Lifespan подходит ресурсу, который используется многими requests и имеет явный shutdown."
          }
        />

        <Callout tone="info">
          {
            "Сначала важна корректность. Оптимизация lifecycle появляется после работающего provider и тестов."
          }
        </Callout>
      </Section>

      <Section number={"02"} title={"Модель lifespan: до yield и после yield"}>
        <Lead>
          {
            "Lifespan — async context manager уровня приложения. Код до yield выполняется при startup, затем приложение обслуживает requests, а код после yield выполняется при shutdown."
          }
        </Lead>

        <StepThrough
          code={`@asynccontextmanager
        async def lifespan(app):
            client = build_client()
            app.state.catalog_client = client
            yield
            await client.aclose()`}
          steps={[
            {
              line: 0,
              note: "FastAPI получает async context manager.",
              vars: { phase: "startup" },
            },
            {
              line: 2,
              note: "Создаётся сетевой клиент и connection pool.",
              vars: { client: "open" },
            },
            {
              line: 3,
              note: "Ссылка сохраняется в состоянии приложения.",
              vars: { "app.state": "catalog_client" },
            },
            {
              line: 4,
              note: "На yield начинается обслуживание requests.",
              vars: { phase: "running" },
            },
            {
              line: 5,
              note: "После сигнала shutdown клиент закрывается.",
              vars: { phase: "shutdown", client: "closed" },
            },
          ]}
        />

        <TrueFalse
          statement={
            <>{"Код после yield выполняется после каждого HTTP request."}</>
          }
          isTrue={false}
          explanation={
            "Он выполняется один раз при завершении lifespan приложения."
          }
        />
      </Section>

      <Section number={"03"} title={"Создаём FastAPI с управляемым клиентом"}>
        <Lead>
          {
            "Функция create_app подключает lifespan. Внутри startup используется Settings, чтобы создать один AsyncClient с base URL, timeout и limits."
          }
        </Lead>

        <CodeBlock
          caption={"единый lifecycle клиента"}
          code={`from contextlib import asynccontextmanager
        from fastapi import FastAPI
        import httpx
        
        @asynccontextmanager
        async def lifespan(app: FastAPI):
            settings = get_settings()
            http_client = httpx.AsyncClient(
                base_url=settings.catalog_url,
                timeout=settings.catalog_timeout,
                limits=httpx.Limits(
                    max_connections=20,
                    max_keepalive_connections=10,
                ),
            )
            app.state.recommendation_client = (
                RecommendationClient(http_client)
            )
        
            try:
                yield
            finally:
                await http_client.aclose()
        
        app = FastAPI(lifespan=lifespan)`}
        />

        <MethodGrid
          rows={[
            [
              "max_connections",
              "верхняя граница одновременно открытых соединений",
            ],
            [
              "max_keepalive_connections",
              "сколько idle-соединений сохранить для повторного использования",
            ],
            ["app.state", "явное состояние конкретного экземпляра приложения"],
            ["finally + aclose", "cleanup даже при ошибке shutdown-сценария"],
          ]}
        />
      </Section>

      <Section
        number={"04"}
        title={"Dependency теперь получает объект из Request"}
      >
        <Lead>
          {
            "Router по-прежнему просит RecommendationClient через Depends. Provider больше не создаёт ресурс: он берёт уже готовый объект из request.app.state."
          }
        </Lead>

        <CodeBlock
          caption={"provider после перехода на lifespan"}
          code={`from fastapi import Request
        
        async def get_recommendation_client(
            request: Request,
        ) -> RecommendationClient:
            return request.app.state.recommendation_client`}
        />

        <BranchExplorer
          code={`if app_started:
            client = request.app.state.recommendation_client
        elif app_not_started:
            fail_test_or_start_lifespan()
        if app_shutting_down:
            stop_accepting_new_work()`}
          scenarios={[
            {
              label: "обычный request",
              activeLine: 1,
              output: "получить существующий client",
            },
            {
              label: "тест без lifespan",
              activeLine: 3,
              output: "state отсутствует — исправить способ запуска теста",
            },
            {
              label: "shutdown",
              activeLine: 5,
              output: "новую работу не начинать",
            },
          ]}
        />

        <RecallCard
          question={"Почему router не изменился после перехода на lifespan?"}
          hint={"Вспомните принцип заменяемой зависимости."}
          answer={
            <p>
              {
                "Router зависит от контракта provider, а не от способа создания клиента. Мы изменили сборку и lifecycle внутри инфраструктурной границы."
              }
            </p>
          }
        />
      </Section>

      <Section
        number={"05"}
        title={"Переиспользование connection pool без магии"}
      >
        <Lead>
          {
            "Один AsyncClient может отправлять много запросов. Он не хранит один-единственный socket; внутри находится пул. Keep-alive позволяет повторно использовать подходящее соединение и не выполнять полное подключение каждый раз."
          }
        </Lead>

        <TypeCards>
          <TypeCard
            badge={"request 1"}
            title={"Открыть соединение"}
            code={`connect → send → read`}
          >
            {"Первый запрос создаёт подходящее соединение."}
          </TypeCard>
          <TypeCard
            badge={"idle"}
            badgeTone="float"
            title={"Сохранить keep-alive"}
            code={`connection stays in pool`}
          >
            {
              "После ответа соединение может остаться готовым к повторному использованию."
            }
          </TypeCard>
          <TypeCard
            badge={"request 2"}
            badgeTone="str"
            title={"Переиспользовать"}
            code={`pool → send → read`}
          >
            {"Следующий запрос экономит повторное установление соединения."}
          </TypeCard>
        </TypeCards>

        <Callout>
          {
            "Пул не отменяет limits и timeout. Он управляет соединениями, а не гарантирует доступность upstream."
          }
        </Callout>
      </Section>

      <Section
        number={"06"}
        title={"Cleanup должен происходить при любом shutdown"}
      >
        <Lead>
          {
            "Незакрытый AsyncClient оставляет предупреждения и ресурсы. Конструкция try/finally делает cleanup видимым. Вызов aclose является асинхронным и требует await."
          }
        </Lead>

        <CodeSequence
          title={"Соберите корректный lifespan"}
          prompt={"Расположите startup, running и shutdown по порядку."}
          pieces={[
            { id: "decorator", code: "@asynccontextmanager" },
            { id: "def", code: "async def lifespan(app):" },
            { id: "create", code: "    client = httpx.AsyncClient(...)" },
            { id: "store", code: "    app.state.client = client" },
            { id: "yield", code: "    yield" },
            { id: "close", code: "    await client.aclose()" },
            {
              id: "wrong",
              code: "    client.close()",
              note: "не тот async cleanup",
            },
          ]}
          correctOrder={[
            "decorator",
            "def",
            "create",
            "store",
            "yield",
            "close",
          ]}
          explanation={
            "Ресурс создаётся до yield и закрывается после завершения обслуживания приложения."
          }
        />

        <BugHunt
          code={`@asynccontextmanager
        async def lifespan(app):
            client = httpx.AsyncClient()
            app.state.client = client
            yield
            client.aclose()`}
          question={"Почему клиент может остаться незакрытым?"}
          options={[
            "aclose() вызван без await",
            "app.state запрещён в FastAPI",
            "yield должен быть return",
          ]}
          correctIndex={0}
          explanation={"Асинхронный cleanup нужно дождаться."}
          fix={`@asynccontextmanager
        async def lifespan(app):
            client = httpx.AsyncClient()
            app.state.client = client
            try:
                yield
            finally:
                await client.aclose()`}
        />
      </Section>

      <Section number={"07"} title={"Тест должен реально запускать lifespan"}>
        <Lead>
          {
            "Если тест создаёт клиент приложения без контекстного менеджера, startup может не выполниться. Используйте TestClient как context manager или подходящий async transport, который запускает lifespan."
          }
        </Lead>

        <CodeBlock
          caption={"проверка одного lifecycle"}
          code={`def test_reuses_one_client(app):
            with TestClient(app) as client:
                first = client.get("/courses/1/insight")
                second = client.get("/courses/2/insight")
        
                assert first.status_code == 200
                assert second.status_code == 200
                assert app.state.client_created_count == 1
        
            assert app.state.client_closed is True`}
        />

        <TerminalDemo
          title={"lifecycle test"}
          lines={[
            { cmd: `pytest tests/test_lifespan.py -q -s` },
            {
              out: `startup: create catalog client
        request 1
        request 2
        shutdown: close catalog client
        1 passed`,
            },
          ]}
        />

        <TrueFalse
          statement={
            <>
              {
                "Dependency override полностью отменяет необходимость проверить lifespan production-клиента."
              }
            </>
          }
          isTrue={false}
          explanation={
            "Override удобен для endpoint-тестов, но отдельный тест должен подтвердить startup, reuse и shutdown реального provider."
          }
        />
      </Section>

      <Section number="08" title="Проверка понимания и проектная практика">
        <Lead>
          Закройте подсказки и объясните маршрут данных своими словами. Затем
          пройдите четыре вопроса и только после этого переходите к проектной
          задаче.
        </Lead>

        <div className="lesson-check-group">
          <QuizCard
            question={"Когда выполняется код до yield в lifespan?"}
            options={[
              "При startup приложения",
              "После каждого response",
              "Только при 500",
            ]}
            correctIndex={0}
            explanation={"До yield создаются долгоживущие ресурсы."}
          />

          <QuizCard
            question={"Где хранится клиент в примере?"}
            options={[
              "request.app.state",
              "Глобально в модуле теста",
              "В cookie пользователя",
            ]}
            correctIndex={0}
            explanation={"app.state относится к конкретному приложению."}
          />

          <QuizCard
            question={"Зачем нужен await client.aclose()?"}
            options={[
              "Корректно закрыть async-ресурс",
              "Создать новый pool",
              "Проверить status 200",
            ]}
            correctIndex={0}
            explanation={"Cleanup AsyncClient является асинхронным."}
          />

          <QuizCard
            question={"Что даёт connection pool?"}
            options={[
              "Переиспользование соединений с ограничениями",
              "Автоматический бесконечный retry",
              "Параллельное CPU-вычисление",
            ]}
            correctIndex={0}
            explanation={"Pool управляет сетевыми соединениями."}
          />
        </div>

        <KeyTakeaways
          points={[
            "Lifespan управляет ресурсами на уровне startup и shutdown приложения.",
            "Код до yield создаёт ресурс, код после yield выполняет cleanup.",
            "Один AsyncClient может обслуживать множество конкурентных requests.",
            "Connection pool переиспользует соединения и соблюдает limits.",
            "Provider получает готовый клиент из request.app.state.",
            "Тесты отдельно проверяют endpoint override и production lifecycle.",
          ]}
        />

        <PracticeCta
          text={
            "Перенесите AsyncClient в FastAPI lifespan, сохраните RecommendationClient в app.state и измените provider так, чтобы router не менялся. Добавьте тесты: клиент создаётся один раз, используется двумя requests и закрывается после выхода из TestClient."
          }
        />
      </Section>
    </RichLesson>
  );
}

// 158. Агрегирующий endpoint и mock внешнего API
export function Lesson158({ module }: LessonProps) {
  return (
    <RichLesson>
      <RichHero
        variant="project"
        chip={module ?? BLOCK_TITLE}
        title={"Агрегирующий endpoint и mock внешнего API"}
        intro={
          "Соберём финальную вертикаль блока: endpoint overview конкурентно получает несколько внешних данных, сохраняет полезный частичный результат и проверяется через MockTransport без реальной сети."
        }
        tags={[
          {
            icon: <Workflow size={14} />,
            label: "несколько источников → один response",
          },
          {
            icon: <TestTube2 size={14} />,
            label: "MockTransport и деградация",
          },
        ]}
      />
      <TheoryBridge lesson={158} />

      <Section
        number={"01"}
        title={"Финальный сценарий блока: course overview"}
      >
        <Lead>
          {
            "Клиенту нужен один экран курса: локальные сведения, рекомендации и состояние внешнего учебного ресурса. Эти внешние операции независимы, поэтому service запускает их конкурентно и собирает один response."
          }
        </Lead>

        <div className="lesson-route">
          <ol>
            <li>
              <strong>Получить local course:</strong> проверить существование до
              внешних вызовов.
            </li>
            <li>
              <strong>Запустить внешние coroutine:</strong> recommendations и
              resource status.
            </li>
            <li>
              <strong>Собрать частичный результат:</strong> сохранить доступные
              данные при контролируемом сбое.
            </li>
            <li>
              <strong>Проверить без сети:</strong> использовать
              httpx.MockTransport для success, timeout и 500.
            </li>
          </ol>
          <p>
            {
              "Итог — GET /courses/{course_id}/overview с явным degradation contract."
            }
          </p>
        </div>

        <Callout tone="info">
          {
            "Локальный 404 должен завершить сценарий до обращения к внешним сервисам."
          }
        </Callout>
      </Section>

      <Section number={"02"} title={"Контракт overview до реализации"}>
        <Lead>
          {
            "Response-модель заранее показывает обязательные и деградируемые части. Course обязателен. Recommendations и resource_status могут иметь status unavailable, но структура ответа остаётся стабильной."
          }
        </Lead>

        <TypeCards>
          <TypeCard
            badge={"local"}
            title={"CourseSummary"}
            code={`id, title, lessons_count`}
          >
            {"Обязательная часть из собственной базы StudyHub."}
          </TypeCard>
          <TypeCard
            badge={"external A"}
            badgeTone="float"
            title={"RecommendationResult"}
            code={`status, items, error`}
          >
            {"Полезные рекомендации или контролируемая причина недоступности."}
          </TypeCard>
          <TypeCard
            badge={"external B"}
            badgeTone="str"
            title={"ResourceStatus"}
            code={`status, checked_url`}
          >
            {"Результат проверки дополнительного учебного ресурса."}
          </TypeCard>
        </TypeCards>

        <MethodGrid
          rows={[
            ["operation_id", "связывает логи всех частей одного overview"],
            ["course", "обязательные локальные данные"],
            [
              "recommendations.status",
              "ok / timeout / unavailable / bad_response",
            ],
            ["recommendations.items", "список только при успешном ответе"],
            ["degraded", "быстрый признак частичного результата"],
          ]}
        />
      </Section>

      <Section number={"03"} title={"Конкурентный запуск независимых запросов"}>
        <Lead>
          {
            "После проверки локального курса две внешние операции не зависят друг от друга. asyncio.gather запускает обе coroutine и возвращает результаты в порядке переданных аргументов."
          }
        </Lead>

        <StepThrough
          code={`recommendations_coro = load_recommendations(course_id)
        resource_coro = check_resource(course.resource_url)
        recommendations, resource = await asyncio.gather(
            recommendations_coro,
            resource_coro,
        )
        return build_overview(course, recommendations, resource)`}
          steps={[
            {
              line: 0,
              note: "Создаётся coroutine рекомендаций.",
              vars: { A: "not started until scheduled" },
            },
            {
              line: 1,
              note: "Создаётся coroutine проверки ресурса.",
              vars: { B: "independent" },
            },
            {
              line: 2,
              note: "gather планирует обе операции конкурентно.",
              vars: { A: "waiting I/O", B: "waiting I/O" },
            },
            {
              line: 3,
              note: "Результаты связываются с порядком аргументов.",
              vars: { recommendations: "result A", resource: "result B" },
            },
            {
              line: 6,
              note: "Собирается единая response-модель.",
              vars: { degraded: "depends on statuses" },
            },
          ]}
        />

        <PredictOutput
          code={`async def fast():
            await asyncio.sleep(0.1)
            return "fast"
        
        async def slow():
            await asyncio.sleep(0.3)
            return "slow"
        
        result = await asyncio.gather(slow(), fast())
        print(result)`}
          output={`["slow", "fast"]`}
          hint={
            "Порядок списка соответствует аргументам gather, а не времени завершения."
          }
        />
      </Section>

      <Section
        number={"04"}
        title={"Частичная деградация вместо случайного падения"}
      >
        <Lead>
          {
            "Каждая внешняя операция сама переводит ожидаемую ошибку в result object. Тогда gather не теряет полезный соседний результат. Неожиданный программный дефект не скрывается и должен упасть в тесте."
          }
        </Lead>

        <BranchExplorer
          code={`if recommendations.ok and resource.ok:
            degraded = False
        elif recommendations.expected_error or resource.expected_error:
            degraded = True
        else:
            raise unexpected_error
        return overview`}
          scenarios={[
            { label: "оба success", activeLine: 1, output: "degraded=false" },
            {
              label: "recommendations timeout",
              activeLine: 3,
              output: "degraded=true, resource сохранён",
            },
            {
              label: "resource 500",
              activeLine: 3,
              output: "degraded=true, recommendations сохранены",
            },
            {
              label: "KeyError в нашем коде",
              activeLine: 5,
              output: "не скрывать как частичную деградацию",
            },
          ]}
        />

        <FlipCards
          cards={[
            {
              front: "ok",
              back: "Данные получены и прошли проверку контракта.",
            },
            {
              front: "timeout",
              back: "Время ожидания превышено; items пуст, error безопасен.",
            },
            {
              front: "unavailable",
              back: "Транспортная ошибка; соседний результат можно сохранить.",
            },
            {
              front: "bad_response",
              back: "Upstream ответил 4xx/5xx или нарушил ожидаемую форму.",
            },
          ]}
        />

        <Callout>
          {
            "Частичный результат полезен только при явном поле status. Пустой список без причины скрывает сбой."
          }
        </Callout>
      </Section>

      <Section
        number={"05"}
        title={"Pydantic response фиксирует форму деградации"}
      >
        <Lead>
          {
            "Response-схемы не должны зависеть от случайного словаря upstream. Они описывают собственный API-контракт и позволяют клиенту обработать частичный результат без догадок."
          }
        </Lead>

        <CodeBlock
          caption={"стабильная response-модель"}
          code={`from typing import Literal
        from pydantic import BaseModel
        
        class ExternalPart(BaseModel):
            status: Literal[
                "ok",
                "timeout",
                "unavailable",
                "bad_response",
            ]
            items: list[str] = []
            error: str | None = None
        
        class CourseOverview(BaseModel):
            operation_id: str
            course: CourseSummary
            recommendations: ExternalPart
            resource: ExternalPart
            degraded: bool`}
        />

        <MatchPairs
          prompt={"Соедините поле и его гарантию."}
          leftTitle={"Поле"}
          rightTitle={"Смысл"}
          pairs={[
            { left: "course", right: "обязательные локальные данные" },
            { left: "status", right: "явный исход одной внешней части" },
            { left: "items", right: "полезные данные при status=ok" },
            { left: "error", right: "безопасное пояснение ожидаемого сбоя" },
            {
              left: "degraded",
              right: "хотя бы одна внешняя часть недоступна",
            },
          ]}
          explanation={
            "Схема позволяет клиенту принимать решение без анализа traceback или косвенных признаков."
          }
        />
      </Section>

      <Section
        number={"06"}
        title={"MockTransport перехватывает реальные httpx requests"}
      >
        <Lead>
          {
            "httpx.MockTransport получает Request и возвращает подготовленный Response. Production RecommendationClient остаётся настоящим: тест заменяет только транспорт, поэтому проверяются URL, query params, status и parsing."
          }
        </Lead>

        <CodeBlock
          caption={"mock без реальной сети"}
          code={`def handler(request: httpx.Request) -> httpx.Response:
            if request.url.path == "/recommendations":
                course_id = request.url.params["course_id"]
                return httpx.Response(
                    200,
                    json={
                        "course_id": int(course_id),
                        "items": [
                            {"title": "Повторить gather"}
                        ],
                    },
                )
        
            if request.url.path == "/resource-status":
                return httpx.Response(
                    200,
                    json={"available": True},
                )
        
            return httpx.Response(404)
        
        transport = httpx.MockTransport(handler)
        http_client = httpx.AsyncClient(
            transport=transport,
            base_url="https://catalog.test",
        )`}
        />

        <BugHunt
          code={`def handler(request):
            return {
                "status_code": 200,
                "json": {"items": []},
            }`}
          question={"Почему MockTransport не примет такой результат?"}
          options={[
            "Handler должен вернуть httpx.Response",
            "Handler обязан быть async def",
            "JSON нельзя использовать в тестах",
          ]}
          correctIndex={0}
          explanation={
            "MockTransport ожидает объект Response с HTTP-семантикой."
          }
          fix={`def handler(request: httpx.Request) -> httpx.Response:
            return httpx.Response(
                200,
                json={"items": []},
            )`}
        />
      </Section>

      <Section
        number={"07"}
        title={"Три обязательных теста финальной интеграции"}
      >
        <Lead>
          {
            "Финальный набор проверяет полный success, частичный timeout и внешний 500. Ни один тест не обращается в интернет и не зависит от отдельного процесса mock-service."
          }
        </Lead>

        <TerminalDemo
          title={"финальная матрица"}
          lines={[
            { cmd: `pytest tests/test_course_overview.py -q` },
            { out: `test_overview_success PASSED` },
            { out: `test_overview_recommendations_timeout PASSED` },
            { out: `test_overview_resource_bad_status PASSED` },
            {
              out: `test_overview_local_course_not_found_skips_external_calls PASSED`,
            },
            { out: `4 passed in 0.28s` },
          ]}
        />

        <CompareSolutions
          question={"Какой тест устойчивее?"}
          left={{
            title: "Реальный публичный URL",
            code: `response = client.get(
            "https://public-api.example/recommendations"
        )`,
            note: "Зависит от сети, данных, лимитов и доступности чужого сервиса.",
          }}
          right={{
            title: "MockTransport",
            code: `transport = httpx.MockTransport(handler)
        client = httpx.AsyncClient(transport=transport)`,
            note: "Полностью контролирует HTTP-сценарий и остаётся быстрым.",
          }}
          preferred={"right"}
          explanation={
            "Интеграционный тест должен быть воспроизводимым и проверять наш контракт, а не доступность интернета."
          }
        />

        <RecallCard
          question={"Когда частичный response лучше полного 503?"}
          hint={"Назовите обязательную и дополнительную часть сценария."}
          answer={
            <p>
              {
                "Когда локальная обязательная часть доступна, а ожидаемый сбой одной дополнительной внешней части не делает весь ответ бесполезным. Контракт должен явно отметить degraded и status части."
              }
            </p>
          }
        />

        <h3 className="lesson-subtitle">
          Контрольная точка Async HTTP-интеграции
        </h3>

        <Lead>
          {
            "Блок завершён, когда ученик может проследить request от router до двух внешних операций, объяснить lifecycle клиента, показать timeout и подтвердить тестом, что полезный соседний результат сохраняется."
          }
        </Lead>

        <CodeBlock
          caption={"финальный маршрут данных"}
          code={`GET /courses/7/overview
          -> load local course
          -> gather(
               recommendations client,
               resource status client,
             )
          -> normalize result objects
          -> CourseOverview
          -> 200 with degraded flag`}
        />

        <Callout tone="info">
          {
            "Следующий блок переведёт database I/O на AsyncSession. Здесь локальная база остаётся синхронной границей и не смешивается с внешним AsyncClient."
          }
        </Callout>

        <TrueFalse
          statement={
            <>
              {
                "Если одна дополнительная внешняя часть вернула ожидаемый timeout, endpoint всегда обязан скрыть весь локальный course и ответить 500."
              }
            </>
          }
          isTrue={false}
          explanation={
            "При заранее определённом degradation contract можно вернуть локальные данные и статус недоступной части."
          }
        />
      </Section>

      <Section number="08" title="Проверка понимания и проектная практика">
        <Lead>
          Закройте подсказки и объясните маршрут данных своими словами. Затем
          пройдите четыре вопроса и только после этого переходите к проектной
          задаче.
        </Lead>

        <div className="lesson-check-group">
          <QuizCard
            question={"Что сохраняет порядок результатов gather?"}
            options={[
              "Порядок переданных awaitables",
              "Время завершения",
              "HTTP status",
            ]}
            correctIndex={0}
            explanation={"Результаты соответствуют порядку аргументов gather."}
          />

          <QuizCard
            question={"Зачем нужно поле degraded?"}
            options={[
              "Явно сообщить о частичном результате",
              "Скрыть status_code",
              "Ускорить CPU",
            ]}
            correctIndex={0}
            explanation={
              "Клиент видит, что одна из дополнительных частей недоступна."
            }
          />

          <QuizCard
            question={"Что возвращает handler MockTransport?"}
            options={["httpx.Response", "Обычный dict", "FastAPI APIRouter"]}
            correctIndex={0}
            explanation={
              "MockTransport моделирует HTTP-ответ объектом Response."
            }
          />

          <QuizCard
            question={"Когда внешний вызов не должен запускаться?"}
            options={[
              "Когда локальный course не найден",
              "Когда course_id положительный",
              "После успешного response",
            ]}
            correctIndex={0}
            explanation={
              "Обязательная локальная проверка выполняется до внешней работы."
            }
          />
        </div>

        <KeyTakeaways
          points={[
            "Агрегирующий endpoint сначала проверяет обязательные локальные данные.",
            "Независимые внешние coroutine можно ожидать конкурентно через gather.",
            "Ожидаемая ошибка превращается в result object, а не скрытый пустой список.",
            "Pydantic response фиксирует status, items, error и degraded.",
            "MockTransport проверяет настоящий httpx-клиент без реальной сети.",
            "Финальная матрица включает success, timeout, bad status и local 404.",
          ]}
        />

        <PracticeCta
          text={
            "Реализуйте GET /courses/{course_id}/overview: локальный course, конкурентные recommendations и resource status, частичный degradation contract и Pydantic response. Добавьте MockTransport-тесты success, timeout, внешний 500 и local 404 без внешних вызовов."
          }
        />
      </Section>
    </RichLesson>
  );
}
