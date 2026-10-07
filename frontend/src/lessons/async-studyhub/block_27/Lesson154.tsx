import { Globe2, Zap } from "lucide-react";
import { BugHunt, Callout, CodeBlock, CodeSequence, CompareSolutions, KeyTakeaways, Lead, MatchPairs, MethodGrid, PracticeCta, PredictOutput, QuizCard, RecallCard, RichHero, RichLesson, Section, StepThrough, TerminalDemo, TrueFalse, TypeCard, TypeCards } from "../../shared";
import { TheoryBridge } from "../../shared";
const BLOCK_TITLE = "Блок 27 · Асинхронный FastAPI и внешние HTTP-сервисы";

type LessonProps = { module?: string };

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
      <TheoryBridge link={"Мы уже выбрали async def для маршрута внешней рекомендации. Теперь заменяем учебную задержку настоящим контрактом HTTP-клиента."} boundary={"AsyncClient не отменяет проверку статуса и формата данных. На этом уроке сначала строим успешный путь, а полный контракт ошибок вводим следующим шагом."} />

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
