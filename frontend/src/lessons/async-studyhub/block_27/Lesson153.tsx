import { Activity, GitFork } from "lucide-react";
import { BranchExplorer, BugHunt, Callout, CodeBlock, CompareSolutions, KeyTakeaways, Lead, MatchPairs, MethodGrid, PracticeCta, QuizCard, RecallCard, RichHero, RichLesson, Section, StepThrough, TerminalDemo, TrueFalse, TypeCard, TypeCards } from "../../shared";
import { TheoryBridge } from "../../shared";
const BLOCK_TITLE = "Блок 27 · Асинхронный FastAPI и внешние HTTP-сервисы";

type LessonProps = { module?: string };

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
      <TheoryBridge link={"Предыдущий блок научил запускать coroutine конкурентно. Теперь переносим эту модель в FastAPI и выбираем async только для совместимого сетевого I/O."} boundary={"Само слово async не делает endpoint быстрее. Решение определяется библиотекой и видом работы, а не желанием переписать весь проект."} />

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
