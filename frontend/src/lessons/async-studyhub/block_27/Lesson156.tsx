import { Plug, TestTube2 } from "lucide-react";
import { BranchExplorer, BugHunt, Callout, CodeBlock, CodeSequence, CompareSolutions, KeyTakeaways, Lead, MatchPairs, MethodGrid, PracticeCta, QuizCard, RecallCard, RichHero, RichLesson, Section, StepThrough, TerminalDemo, TrueFalse, TypeCard, TypeCards } from "../../shared";
import { TheoryBridge } from "../../shared";
const BLOCK_TITLE = "Блок 27 · Асинхронный FastAPI и внешние HTTP-сервисы";

type LessonProps = { module?: string };

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
      <TheoryBridge link={"Обработка сетевых ошибок уже определена. Теперь клиент должен создаваться по одному контракту и заменяться без изменения router или service."} boundary={"Dependency injection не должна превращаться в цепочку из десятков уровней. Здесь она решает конкретную задачу: конфигурацию и замену внешнего клиента."} />

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
