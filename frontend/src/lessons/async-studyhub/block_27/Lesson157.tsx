import { Network, RefreshCw } from "lucide-react";
import { BranchExplorer, BugHunt, Callout, CodeBlock, CodeSequence, CompareSolutions, KeyTakeaways, Lead, MethodGrid, PracticeCta, QuizCard, RecallCard, RichHero, RichLesson, Section, StepThrough, TerminalDemo, TrueFalse, TypeCard, TypeCards } from "../../shared";
import { TheoryBridge } from "../../shared";
const BLOCK_TITLE = "Блок 27 · Асинхронный FastAPI и внешние HTTP-сервисы";

type LessonProps = { module?: string };

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
      <TheoryBridge link={"Dependency уже делает клиент заменяемым, но пока создаёт его заново на каждый request. Теперь меняем только lifecycle, не меняя service и router."} boundary={"Один клиент на приложение не означает один HTTP-запрос за раз. AsyncClient управляет пулом соединений и поддерживает конкурентные requests."} />

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
