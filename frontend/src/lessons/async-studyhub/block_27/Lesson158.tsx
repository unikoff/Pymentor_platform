import { TestTube2, Workflow } from "lucide-react";
import { BranchExplorer, BugHunt, Callout, CodeBlock, CompareSolutions, FlipCards, KeyTakeaways, Lead, MatchPairs, MethodGrid, PracticeCta, PredictOutput, QuizCard, RecallCard, RichHero, RichLesson, Section, StepThrough, TerminalDemo, TrueFalse, TypeCard, TypeCards } from "../../shared";
import { TheoryBridge } from "../../shared";
const BLOCK_TITLE = "Блок 27 · Асинхронный FastAPI и внешние HTTP-сервисы";

type LessonProps = { module?: string };

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
      <TheoryBridge link={"У нас есть выбор async endpoint, AsyncClient, ошибки, dependency и lifespan. Финальный урок соединяет их в один наблюдаемый пользовательский сценарий."} boundary={"Агрегация не означает скрыть любую ошибку. Контракт явно сообщает, какие части доступны, какие деградировали и когда весь endpoint должен завершиться ошибкой."} />

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
