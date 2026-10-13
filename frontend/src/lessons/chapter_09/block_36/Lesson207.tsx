import { Braces, ShieldCheck } from "lucide-react";
import { BranchExplorer, BugHunt, Callout, CodeBlock, CodeSequence, CompareSolutions, FillBlank, KeyTakeaways, Lead, MatchPairs, MethodGrid, PracticeCta, QuizCard, RecallCard, RichHero, RichLesson, Section, StepThrough, TerminalDemo, TrueFalse, TypeCard, TypeCards } from "../../shared";
const BLOCK_TITLE = "Блок 36 · Финальное качество, портфолио и интервью";

export function Lesson207({ module }: { module?: string }) {
  return (
    <RichLesson>
      <RichHero
        variant="project"
        chip={module ?? BLOCK_TITLE}
        title={"Единый API error contract и versioning"}
        intro={"Соберём единую внешнюю границу ошибок StudyHub: один JSON-контракт для validation, auth, permissions, domain conflicts, rate limit и unexpected failures. Затем закрепим request_id, exception handlers, OpenAPI examples и понятный префикс /api/v1."}
        tags={[
          { icon: <Braces size={14} />, label: "code · message · details" },
          { icon: <ShieldCheck size={14} />, label: "/api/v1 и совместимость" },
        ]}
      />

      <Callout tone="info">
        <strong>{"Связь с проектом."}</strong> {"LMS-функциональность завершена, но routers пока могут возвращать разные формы ошибок. Финальный клиентский контракт должен быть стабильнее внутренней реализации."}{" "}
        <strong>{"Важно не перепутать:"}</strong> {"Версия URL не означает поддержку нескольких активных major-веток. В блоке фиксируется одна текущая версия и правило совместимых изменений."}
      </Callout>

      <Section number="01" title={"Почему случайные ошибки стали проблемой"}>
        <Lead>
          {"Соберём единую внешнюю границу ошибок StudyHub: один JSON-контракт для validation, auth, permissions, domain conflicts, rate limit и unexpected failures. Затем закрепим request_id, exception handlers, OpenAPI examples и понятный префикс /api/v1."}
        </Lead>

        <div className="lesson-route">
          <ol>
            <li>
              <strong>{"Снять инвентаризацию"}:</strong> {"собрать реальные 400/401/403/404/409/422/429/500 и сравнить их тела."}
            </li>
            <li>
              <strong>{"Назвать схему"}:</strong> {"зафиксировать code, message, details и request_id как обязательную внешнюю форму."}
            </li>
            <li>
              <strong>{"Свести источники"}:</strong> {"направить validation, domain и unexpected exceptions в отдельные handlers."}
            </li>
            <li>
              <strong>{"Защитить контракт"}:</strong> {"добавить тесты, OpenAPI examples и префикс /api/v1 без переписывания сервисов."}
            </li>
          </ol>
          <p>{"Маршрут заканчивается проверяемым артефактом, а не только чтением теории."}</p>
        </div>

        <TypeCards>
          <TypeCard badge={"code"} title={"Машинный идентификатор"}>
            {"Стабильная строка вроде course_not_found, по которой клиент выбирает реакцию."}
          </TypeCard>
          <TypeCard badge={"message"} badgeTone="float" title={"Сообщение человеку"}>
            {"Короткое безопасное объяснение без traceback, SQL и внутренних секретов."}
          </TypeCard>
          <TypeCard badge={"details"} badgeTone="str" title={"Структурированный контекст"}>
            {"Поля ошибки: field, reason, limit или conflict, если клиент может их использовать."}
          </TypeCard>
          <TypeCard badge={"request_id"} title={"Связь с логом"}>
            {"Идентификатор позволяет сопоставить ответ клиента с серверным событием."}
          </TypeCard>
        </TypeCards>

        <RecallCard
          question={"Какой проверяемый результат должно дать это занятие?"}
          hint={"Назовите не тему, а конкретный artifact или evidence."}
          answer={<p>{"Результат должен воспроизводиться другим человеком и иметь успешный, ошибочный и диагностический сценарий."}</p>}
        />
      </Section>

      <Section number="02" title={"Главная модель единого error contract"}>
        <Lead>
          {"Сначала фиксируем небольшую модель, которая помогает принимать решения. Термин ценен только тогда, когда его можно связать с наблюдаемым поведением проекта."}
        </Lead>

        <MethodGrid
          rows={[
            [<>{"RequestValidationError"}</>, "422 validation_error с нормализованным списком полей"],
            [<>{"DomainError"}</>, "осознанный status и code из бизнес-правила"],
            [<>{"HTTPException"}</>, "переходный адаптер для старых routers"],
            [<>{"RateLimitError"}</>, "429 rate_limit_exceeded и Retry-After"],
            [<>{"Exception"}</>, "500 internal_error без раскрытия внутренних деталей"],
          ]}
        />

        <MatchPairs
          prompt={"Соедините элемент модели с его практической ролью."}
          leftTitle={"Элемент"}
          rightTitle={"Роль"}
          pairs={[
            { left: "RequestValidationError", right: "422 validation_error с нормализованным списком полей" },
            { left: "DomainError", right: "осознанный status и code из бизнес-правила" },
            { left: "HTTPException", right: "переходный адаптер для старых routers" },
            { left: "RateLimitError", right: "429 rate_limit_exceeded и Retry-After" },
          ]}
          explanation={"Пары закрепляют не термин отдельно, а его место в рабочем процессе StudyHub."}
        />

        <TrueFalse
          statement={<>{"Клиенту достаточно HTTP status, поэтому стабильный error code и request_id не нужны."}</>}
          isTrue={false}
          explanation={"Status задаёт класс результата, но не различает десятки предметных причин. code нужен программе клиента, request_id — диагностике."}
        />

        <Callout tone="info">
          {"Модель должна сокращать область поиска решения. Если после схемы всё равно непонятно, что запускать и проверять, схема слишком абстрактна."}
        </Callout>
      </Section>

      <Section number="03" title={"Минимальная схема и domain exception"}>
        <Lead>
          {"Разбираем минимальный рабочий фрагмент до интеграции. Сначала читаем контракт, затем прослеживаем значения и только после этого меняем одну деталь."}
        </Lead>

        <CodeBlock
          caption={"минимальная схема и domain exception"}

          code={
            "from typing import Any\n" +
            "\n" +
            "from pydantic import BaseModel, Field\n" +
            "\n" +
            "\n" +
            "class ApiError(BaseModel):\n" +
            "    code: str = Field(examples=[\"course_not_found\"])\n" +
            "    message: str\n" +
            "    details: dict[str, Any] | list[dict[str, Any]] | None = None\n" +
            "    request_id: str\n" +
            "\n" +
            "\n" +
            "class DomainError(Exception):\n" +
            "    def __init__(\n" +
            "        self,\n" +
            "        *,\n" +
            "        status_code: int,\n" +
            "        code: str,\n" +
            "        message: str,\n" +
            "        details: dict[str, Any] | None = None,\n" +
            "    ) -> None:\n" +
            "        super().__init__(message)\n" +
            "        self.status_code = status_code\n" +
            "        self.code = code\n" +
            "        self.message = message\n" +
            "        self.details = details"
          }
        />


        <StepThrough
          code={
            "from typing import Any\n" +
            "\n" +
            "from pydantic import BaseModel, Field\n" +
            "\n" +
            "\n" +
            "class ApiError(BaseModel):\n" +
            "    code: str = Field(examples=[\"course_not_found\"])\n" +
            "    message: str\n" +
            "    details: dict[str, Any] | list[dict[str, Any]] | None = None\n" +
            "    request_id: str\n" +
            "\n" +
            "\n" +
            "class DomainError(Exception):\n" +
            "    def __init__(\n" +
            "        self,\n" +
            "        *,\n" +
            "        status_code: int,\n" +
            "        code: str,\n" +
            "        message: str,\n" +
            "        details: dict[str, Any] | None = None,\n" +
            "    ) -> None:\n" +
            "        super().__init__(message)\n" +
            "        self.status_code = status_code\n" +
            "        self.code = code\n" +
            "        self.message = message\n" +
            "        self.details = details"
          }
          steps={[
            { line: 5, note: "ApiError описывает только данные HTTP-ответа и не зависит от конкретного router.", vars: { "граница": "response schema" } },
            { line: 12, note: "DomainError переносит предметный смысл из service к общему handler.", vars: { "источник": "service" } },
            { line: 20, note: "Status и machine-readable code задаются явно в месте обнаружения правила.", vars: { "code": "course_not_found" } },
            { line: 23, note: "details остаётся структурой, а не строкой со случайным форматом.", vars: { "details": "{course_id: 42}" } },
          ]}
        />

        <FillBlank
          prompt={"Дополните поле, связывающее HTTP-ошибку с серверным логом."}
          before={"    "}
          after={": str"}
          options={["request_id", "traceback", "password"]}
          answer={"request_id"}
          explanation={"Внешний request_id безопасно возвращается клиенту и помогает найти соответствующее событие в логах."}
        />

        <Callout tone="info">
          {"После заполнения измените одно входное значение, предскажите результат и только затем запускайте проверку."}
        </Callout>
      </Section>

      <Section number="04" title={"Случайные формы против единого контракта"}>
        <Lead>
          {"Сравнение нужно не для выбора «красивого» кода, а для явного обсуждения контракта, риска и стоимости следующего изменения."}
        </Lead>

        <CompareSolutions
          question={"Какой response contract проще использовать frontend-клиенту и тестам?"}
          left={{
            title: "Случайные формы",
            code: "{\"detail\": \"Not found\"}\n{\"error\": \"duplicate slug\"}\n{\"message\": [\"invalid field\"]}",
            note: "Клиент вынужден угадывать форму по endpoint и status.",
          }}
          right={{
            title: "Единая схема",
            code: "{\n  \"code\": \"course_slug_conflict\",\n  \"message\": \"Slug is already used\",\n  \"details\": {\"field\": \"slug\"},\n  \"request_id\": \"req-8b1\"\n}",
            note: "Форма постоянна, а предметная причина находится в code.",
          }}
          preferred="right"
          explanation={"Единая структура уменьшает ветвление клиента и делает отрицательные тесты одинаковыми для всех routers."}
        />

        <div className="lesson-practice-steps">
          <h3>{"Сначала назовите критерий"}</h3>
          <p>{"До выбора варианта сформулируйте, какое свойство проекта нужно сохранить: совместимость, безопасность, воспроизводимость или понятность."}</p>
          <h3>{"Затем найдите evidence"}</h3>
          <p>{"Подтвердите решение тестом, логом, планом запроса, clean start или повторяемым demo-сценарием."}</p>
          <h3>{"После этого зафиксируйте границу"}</h3>
          <p>{"Укажите, при каком изменении требований выбранный вариант перестанет быть достаточным."}</p>
        </div>

        <RecallCard
          question={"Почему более сложный вариант не считается автоматически более профессиональным?"}
          answer={<p>{"Профессиональность определяется соответствием риску и требованиям. Лишний механизм увеличивает стоимость поддержки без доказанной пользы."}</p>}
        />
      </Section>

      <Section number="05" title={"Unexpected 500 не раскрывает внутренности"}>
        <Lead>
          {"Финальное качество проявляется в работе со сбоями. Намеренно запускаем дефектный сценарий, объясняем причину и проверяем исправление отдельным evidence."}
        </Lead>

        <BugHunt
          code={
            "@app.exception_handler(Exception)\n" +
            "async def unexpected_handler(request, exc):\n" +
            "    return JSONResponse(\n" +
            "        status_code=500,\n" +
            "        content={\n" +
            "            \"code\": \"internal_error\",\n" +
            "            \"message\": str(exc),\n" +
            "            \"request_id\": request.state.request_id,\n" +
            "        },\n" +
            "    )"
          }
          question={"Какой риск остаётся в unexpected handler?"}
          options={[
            "В message раскрываются внутренние детали исключения",
            "JSONResponse нельзя использовать в FastAPI",
            "Status 500 должен быть 404",
          ]}
          correctIndex={0}
          explanation={"Текст неожиданного исключения может содержать SQL, путь, hostname или другое внутреннее состояние."}
          fix={"@app.exception_handler(Exception)\nasync def unexpected_handler(request, exc):\n    logger.exception(\n        \"unexpected request failure\",\n        extra={\"request_id\": request.state.request_id},\n    )\n    return JSONResponse(\n        status_code=500,\n        content={\n            \"code\": \"internal_error\",\n            \"message\": \"Unexpected server error\",\n            \"details\": None,\n            \"request_id\": request.state.request_id,\n        },\n    )"}
        />

        <div className="lesson-practice-steps">
          <h3>{"1. Воспроизведите"}</h3>
          <p>{"Сведите проблему к короткому сценарию и сохраните точный вход, команду и наблюдаемый результат."}</p>
          <h3>{"2. Найдите нарушенное ожидание"}</h3>
          <p>{"Не маскируйте симптом. Назовите контракт, который код нарушает, и слой, отвечающий за исправление."}</p>
          <h3>{"3. Защитите результат"}</h3>
          <p>{"Добавьте тест, проверку, runbook или diagnostic evidence, чтобы дефект не вернулся незаметно."}</p>
        </div>
      </Section>

      <Section number="06" title={"Встраиваем handlers и /api/v1"}>
        <Lead>
          {"Теперь переносим минимальную модель в StudyHub. Endpoint или infrastructure step остаётся координатором, а правило и диагностическая граница получают отдельное место."}
        </Lead>

        <CodeBlock
          caption={"общий handler и versioned router"}

          code={
            "from fastapi import APIRouter, FastAPI, Request\n" +
            "from fastapi.responses import JSONResponse\n" +
            "\n" +
            "api_v1 = APIRouter(prefix=\"/api/v1\")\n" +
            "\n" +
            "\n" +
            "@app.exception_handler(DomainError)\n" +
            "async def domain_error_handler(\n" +
            "    request: Request,\n" +
            "    exc: DomainError,\n" +
            ") -> JSONResponse:\n" +
            "    body = ApiError(\n" +
            "        code=exc.code,\n" +
            "        message=exc.message,\n" +
            "        details=exc.details,\n" +
            "        request_id=request.state.request_id,\n" +
            "    )\n" +
            "    return JSONResponse(\n" +
            "        status_code=exc.status_code,\n" +
            "        content=body.model_dump(),\n" +
            "    )\n" +
            "\n" +
            "\n" +
            "app.include_router(api_v1)"
          }
        />


        <BranchExplorer
          code={
            "if error_source == \"validation\":\n" +
            "    response = validation_handler(error)\n" +
            "elif error_source == \"domain\":\n" +
            "    response = domain_handler(error)\n" +
            "elif error_source == \"rate_limit\":\n" +
            "    response = rate_limit_handler(error)\n" +
            "else:\n" +
            "    response = unexpected_handler(error)"
          }
          scenarios={[
            { label: "invalid body", activeLine: 1, output: "422 validation_error" },
            { label: "duplicate enrollment", activeLine: 3, output: "409 enrollment_conflict" },
            { label: "too many requests", activeLine: 5, output: "429 rate_limit_exceeded" },
            { label: "unknown defect", activeLine: 7, output: "500 internal_error" },
          ]}
        />

        <TypeCards>
          <TypeCard badge={"01"} title={"Version prefix"}>
            {"Все публичные LMS routers подключаются через один APIRouter(prefix=\"/api/v1\")."}
          </TypeCard>
          <TypeCard badge={"02"} badgeTone="float" title={"Compatibility"}>
            {"Добавление необязательного response-поля совместимо; переименование или удаление требует новой major-границы."}
          </TypeCard>
          <TypeCard badge={"03"} badgeTone="str" title={"OpenAPI"}>
            {"Для каждого status приводится пример ApiError, а успешные schemas не смешиваются с error schema."}
          </TypeCard>
        </TypeCards>

        <Callout tone="info">
          {"Интеграция считается завершённой только после проверки happy path, запрета или сбоя и возможности объяснить путь данных без чтения всего проекта."}
        </Callout>
      </Section>

      <Section number="07" title={"Проверяем контракт и фиксируем порядок"}>
        <Lead>
          {"Финальный шаг урока превращает знание в воспроизводимую процедуру. Команды, ожидаемые результаты и порядок действий сохраняются в репозитории."}
        </Lead>

        <TerminalDemo
          title={"проверяем результат"}
          lines={[
            { cmd: "pytest tests/api/test_error_contract.py -q" },
            { out: "18 passed in 1.42s" },
            { cmd: "curl -i http://localhost:8000/api/v1/courses/999" },
            { out: "HTTP/1.1 404 Not Found\nX-Request-ID: req-8b1\n{\"code\":\"course_not_found\",\"message\":\"Course not found\",\"details\":{\"course_id\":999},\"request_id\":\"req-8b1\"}" },
            { cmd: "curl -i http://localhost:8000/courses/999" },
            { out: "HTTP/1.1 404 Not Found\n{\"code\":\"route_not_found\", ...}" },
          ]}
        />

        <CodeSequence
          title={"Соберите рабочий порядок"}
          prompt={"Расположите шаги так, чтобы результат оставался проверяемым и обратимым."}
          pieces={[
            { id: "inventory", code: "собрать текущие error responses" },
            { id: "schema", code: "утвердить ApiError" },
            { id: "handlers", code: "подключить handlers по источникам" },
            { id: "version", code: "перенести routers под /api/v1" },
            { id: "tests", code: "зафиксировать statuses и bodies тестами" },
            { id: "docs", code: "обновить OpenAPI examples" },
          ]}
          correctOrder={["inventory", "schema", "handlers", "version", "tests", "docs"]}
          explanation={"Сначала фиксируется реальное расхождение, затем единая форма, и только после этого меняются маршруты и документация."}
        />

        <div className="lesson-practice-steps">
          <h3>{"Коммит 1 — наблюдение"}</h3>
          <p>{"Зафиксируйте baseline, failing scenario или исходный документ до изменения."}</p>
          <h3>{"Коммит 2 — минимальное исправление"}</h3>
          <p>{"Измените только ответственную границу и сохраните маленький читаемый diff."}</p>
          <h3>{"Коммит 3 — evidence"}</h3>
          <p>{"Добавьте тест, документацию, diagram или runbook, который доказывает результат."}</p>
        </div>

        <RecallCard
          question={"Что должно позволить другому разработчику повторить результат?"}
          answer={<p>{"Точная последовательность команд, входные условия, ожидаемый вывод и путь диагностики отклонения."}</p>}
        />
      </Section>

      <Section number="08" title={"Контрольная точка и самостоятельная практика"}>
        <Lead>
          {"Ответьте на вопросы без запуска, затем проверьте себя. После контроля выполните проектную практику и объясните результат словами, не читая готовый текст."}
        </Lead>

        <div className="lesson-check-group">
          <QuizCard
            question={"Какое поле должно оставаться стабильным для программной реакции клиента?"}
            options={[
              "message",
              "code",
              "traceback",
            ]}
            correctIndex={1}
            explanation={"Message можно уточнять, а machine-readable code является частью внешнего контракта."}
          />
          <QuizCard
            question={"Что безопасно возвращать при unexpected 500?"}
            options={[
              "Полный repr исключения",
              "Общее сообщение и request_id",
              "SQL statement",
            ]}
            correctIndex={1}
            explanation={"Внутренняя причина пишется в защищённый лог, клиент получает безопасную форму."}
          />
          <QuizCard
            question={"Какое изменение обычно совместимо внутри /api/v1?"}
            options={[
              "Удалить обязательное поле",
              "Переименовать endpoint",
              "Добавить необязательное поле",
            ]}
            correctIndex={2}
            explanation={"Клиент старой версии может проигнорировать новое необязательное поле."}
          />
          <QuizCard
            question={"Где нормализовать RequestValidationError?"}
            options={[
              "В каждом endpoint",
              "В общем exception handler",
              "В README",
            ]}
            correctIndex={1}
            explanation={"Общий handler устраняет повторение и гарантирует одну форму 422."}
          />
        </div>

        <KeyTakeaways
          points={[

            <>{"HTTP status задаёт класс результата, а code — конкретную машинную причину."}</>,

            <>{"ApiError имеет одинаковые поля для validation, auth, domain, rate limit и unexpected failures."}</>,

            <>{"Request ID связывает внешний ответ с серверным логом и не раскрывает внутренние данные."}</>,

            <>{"Unexpected exception логируется с traceback, но клиент получает безопасное сообщение."}</>,

            <>{"Префикс /api/v1 фиксирует внешнюю границу, а не создаёт несколько параллельных реализаций."}</>,

            <>{"Совместимость проверяется тестами и OpenAPI examples, а не обещанием автора."}</>,

          ]}
        />


        <PracticeCta text={"Проведите инвентаризацию всех error responses StudyHub, реализуйте ApiError и handlers для 422, DomainError, 429 и 500, подключите /api/v1, добавьте минимум восемь contract tests и приложите before/after таблицу."} />
      </Section>
    </RichLesson>
  );
}
