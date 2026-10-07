import { FileText, KeyRound } from "lucide-react";
import { BranchExplorer, Callout, CodeBlock, CodeSequence, CompareSolutions, FillBlank, KeyTakeaways, Lead, MatchPairs, PracticeCta, QuizCard, RichHero, RichLesson, Section, StepThrough, TrueFalse } from "../../shared";
const BLOCK_TITLE = "Этап 4 · Блок 13 · FastAPI как цельное приложение";

export function Lesson73({ module }: { module?: string }) {
  return (
    <RichLesson>
      <RichHero
        variant="project"
        chip={module ?? BLOCK_TITLE}
        title={"Заголовки, cookies и Response"}
        intro={"Расширим HTTP-контракт за пределы JSON body: прочитаем X-Client-Version, добавим собственный response header, установим и удалим учебную cookie через объект Response."}
        tags={[
          { icon: <FileText size={14} />, label: "Header и Cookie" },
          { icon: <KeyRound size={14} />, label: "управление Response" },
        ]}
      />

      <Section number="01" title={"Headers описывают request, body переносит данные"}>
        <Lead>
          {"JSON body содержит поля создаваемой задачи. Header сообщает метаданные обращения: версию клиента, формат, request id или будущий Authorization."}
        </Lead>

        <div className="lesson-practice-steps">
          <h3>{"Body"}</h3>
          <p>
            {"Предметные данные ресурса: title, priority, is_done."}
          </p>

          <h3>{"Header"}</h3>
          <p>
            {"Служебный контекст request, который не является полем Task."}
          </p>

          <h3>{"Стандартный"}</h3>
          <p>
            {"Content-Type и User-Agent имеют общеизвестный смысл."}
          </p>

          <h3>{"Custom"}</h3>
          <p>
            {"X-Client-Version создаётся для контракта конкретного приложения."}
          </p>

        </div>

        <CodeBlock
          caption={"request"}
          code={
            "POST /tasks HTTP/1.1\n" +
            "Content-Type: application/json\n" +
            "X-Client-Version: 1.4.0\n" +
            "\n" +
            "{\n" +
            "  \"title\": \"Headers\",\n" +
            "  \"priority\": 4\n" +
            "}"
          }
        />

        <MatchPairs
          prompt={"Разместите данные."}
          leftTitle={"Данные"}
          rightTitle={"Место"}
          pairs={[
            { left: "title", right: "JSON body" },
            { left: "priority", right: "JSON body" },
            { left: "X-Client-Version", right: "request header" },
            { left: "Content-Type", right: "request header" },
          ]}
          explanation={"Предметные поля и служебные метаданные разделены."}
        />

        <Callout tone="info">
          {"Не переносите title задачи в header. Выбор части request следует из роли данных."}
        </Callout>
      </Section>

      <Section number="02" title={"Чтение Header через Annotated"}>
        <Lead>
          {"FastAPI предоставляет функцию Header. Параметр x_client_version в Python соответствует HTTP-header X-Client-Version благодаря автоматической замене underscore на hyphen."}
        </Lead>

        <div className="lesson-practice-steps">
          <h3>{"Annotated type"}</h3>
          <p>
            {"Итоговое значение — str или None."}
          </p>

          <h3>{"Header metadata"}</h3>
          <p>
            {"FastAPI читает значение из request headers."}
          </p>

          <h3>{"Default None"}</h3>
          <p>
            {"Header становится необязательным."}
          </p>

          <h3>{"Conversion"}</h3>
          <p>
            {"x_client_version ↔ X-Client-Version."}
          </p>

        </div>

        <CodeBlock
          caption={"endpoint"}
          code={
            "from typing import Annotated\n" +
            "from fastapi import Header\n" +
            "\n" +
            "@router.get(\"/info\")\n" +
            "def get_info(\n" +
            "    x_client_version: Annotated[\n" +
            "        str | None,\n" +
            "        Header(),\n" +
            "    ] = None,\n" +
            "):\n" +
            "    return {\n" +
            "        \"client_version\": x_client_version,\n" +
            "    }"
          }
        />

        <CodeBlock
          caption={"requests"}
          code={
            "GET /info\n" +
            "→ client_version = null\n" +
            "\n" +
            "GET /info\n" +
            "X-Client-Version: 1.4.0\n" +
            "→ client_version = \"1.4.0\""
          }
        />

        <FillBlank
          prompt={"Какое имя header прочитает FastAPI?"}
          before={"x_client_version → "}
          after={""}
          options={[
            "X-Client-Version",
            "x_client_version",
            "client.version",
          ]}
          answer={"X-Client-Version"}
          explanation={"Header автоматически преобразует underscores в hyphens."}
        />

        <Callout tone="info">
          {"Имена headers регистронезависимы на уровне HTTP. В документации принято писать слова через hyphen."}
        </Callout>
      </Section>

      <Section number="03" title={"Обязательный header и понятная ошибка"}>
        <Lead>
          {"Если версия клиента действительно обязательна для operation, default можно не задавать. Тогда отсутствие header станет validation error 422 до endpoint."}
        </Lead>

        <div className="lesson-practice-steps">
          <h3>{"Optional"}</h3>
          <p>
            {"Подходит для аналитики или постепенного внедрения."}
          </p>

          <h3>{"Required"}</h3>
          <p>
            {"Подходит, когда без metadata operation нельзя выполнить."}
          </p>

          <h3>{"422"}</h3>
          <p>
            {"Сообщает о missing header в detail."}
          </p>

          <h3>{"Предметное правило"}</h3>
          <p>
            {"Неподдерживаемая версия может дать 400 или 426 по отдельной договорённости."}
          </p>

        </div>

        <CodeBlock
          caption={"required"}
          code={
            "@router.post(\"/\")\n" +
            "def create_task(\n" +
            "    task: TaskCreate,\n" +
            "    x_client_version: Annotated[\n" +
            "        str,\n" +
            "        Header(),\n" +
            "    ],\n" +
            "):\n" +
            "    ..."
          }
        />

        <CodeBlock
          caption={"manual support check"}
          code={
            "SUPPORTED_CLIENT_VERSIONS = {\"1.3.0\", \"1.4.0\"}\n" +
            "\n" +
            "if x_client_version not in SUPPORTED_CLIENT_VERSIONS:\n" +
            "    raise HTTPException(\n" +
            "        status_code=400,\n" +
            "        detail=\"Unsupported client version\",\n" +
            "    )"
          }
        />

        <BranchExplorer
          code={
            "получить X-Client-Version\n" +
            "if header отсутствует:\n" +
            "    validation 422\n" +
            "elif version не поддерживается:\n" +
            "    HTTPException 400\n" +
            "else:\n" +
            "    вызвать endpoint"
          }
          scenarios={[
            { label: "header missing", activeLine: 2, output: "422" },
            { label: "version 0.1.0", activeLine: 4, output: "400" },
            { label: "version 1.4.0", activeLine: 6, output: "handler called" },
          ]}
        />

        <Callout tone="info">
          {"Не делайте header обязательным только ради демонстрации. Требование должно быть частью API-контракта."}
        </Callout>
      </Section>

      <Section number="04" title={"Response parameter позволяет добавить header"}>
        <Lead>
          {"FastAPI может предоставить временный объект Response. Endpoint изменяет его headers, а обычный return по-прежнему проходит через response_model и JSON serialization."}
        </Lead>

        <div className="lesson-practice-steps">
          <h3>{"Parameter"}</h3>
          <p>
            {"response: Response не читается из request."}
          </p>

          <h3>{"Temporary response"}</h3>
          <p>
            {"FastAPI использует его metadata при создании финального ответа."}
          </p>

          <h3>{"Custom header"}</h3>
          <p>
            {"Например X-API-Mode или X-Process-Source."}
          </p>

          <h3>{"Body"}</h3>
          <p>
            {"Можно продолжать возвращать Pydantic model или dict."}
          </p>

        </div>

        <CodeBlock
          caption={"response header"}
          code={
            "from fastapi import Response\n" +
            "\n" +
            "@router.get(\"/info\")\n" +
            "def get_info(\n" +
            "    response: Response,\n" +
            "    settings: SettingsDep,\n" +
            "):\n" +
            "    response.headers[\"X-API-Mode\"] = settings.api_mode\n" +
            "\n" +
            "    return {\n" +
            "        \"app_name\": settings.app_name,\n" +
            "    }"
          }
        />

        <CodeBlock
          caption={"response"}
          code={
            "HTTP/1.1 200 OK\n" +
            "X-API-Mode: development\n" +
            "Content-Type: application/json\n" +
            "\n" +
            "{\"app_name\":\"StudyHub Database API\"}"
          }
        />

        <CompareSolutions
          question={"Как добавить X-API-Mode, сохранив обычный JSON return?"}
          left={{
            title: "Вернуть только Response",
            code: "return Response(...)",
            note: "Придётся вручную отвечать за serialization.",
          }}
          right={{
            title: "Изменить parameter Response",
            code: "response.headers[\"X-API-Mode\"] = ...\nreturn {\"app_name\": ...}",
            note: "FastAPI сохранит обычную обработку body.",
          }}
          preferred={"right"}
          explanation={"Temporary Response подходит для metadata вокруг обычного результата."}
        />

        <Callout tone="info">
          {"Custom response header и JSON body решают разные задачи. Не дублируйте все поля body в headers."}
        </Callout>
      </Section>

      <Section number="05" title={"Cookie читается как отдельный источник request"}>
        <Lead>
          {"Cookie приходит в header Cookie, но FastAPI предоставляет отдельную функцию Cookie. Это делает сигнатуру понятнее и отражает параметр в OpenAPI."}
        </Lead>

        <div className="lesson-practice-steps">
          <h3>{"Имя"}</h3>
          <p>
            {"studyhub_visit_id — имя cookie в браузере."}
          </p>

          <h3>{"Optional"}</h3>
          <p>
            {"Первый request может прийти без cookie."}
          </p>

          <h3>{"Тип"}</h3>
          <p>
            {"На текущем этапе используется str | None."}
          </p>

          <h3>{"Не body"}</h3>
          <p>
            {"Cookie автоматически отправляется клиентом по правилам браузера."}
          </p>

        </div>

        <CodeBlock
          caption={"чтение"}
          code={
            "from fastapi import Cookie\n" +
            "\n" +
            "@router.get(\"/visits\")\n" +
            "def get_visits(\n" +
            "    studyhub_visit_id: Annotated[\n" +
            "        str | None,\n" +
            "        Cookie(),\n" +
            "    ] = None,\n" +
            "):\n" +
            "    return {\n" +
            "        \"visit_id\": studyhub_visit_id,\n" +
            "    }"
          }
        />

        <CodeBlock
          caption={"request"}
          code={
            "GET /visits HTTP/1.1\n" +
            "Cookie: studyhub_visit_id=demo-123"
          }
        />

        <TrueFalse
          statement={
            <>
              {"Наличие cookie studyhub_visit_id автоматически означает, что пользователь аутентифицирован."}
            </>
          }
          isTrue={false}
          explanation={"Cookie — только переданное значение; доверие и session logic требуют отдельной реализации."}
        />

        <Callout tone="info">
          {"Cookie является транспортом небольшого значения. Она ещё не создаёт server-side session, пользователя или права доступа."}
        </Callout>
      </Section>

      <Section number="06" title={"Установка cookie через Response"}>
        <Lead>
          {"Метод response.set_cookie добавляет Set-Cookie в response. Браузер может сохранить значение и отправлять его в следующих подходящих requests."}
        </Lead>

        <div className="lesson-practice-steps">
          <h3>{"key/value"}</h3>
          <p>
            {"Имя и значение cookie."}
          </p>

          <h3>{"httponly"}</h3>
          <p>
            {"Запрещает JavaScript читать cookie; полезно для будущих session cookies."}
          </p>

          <h3>{"samesite"}</h3>
          <p>
            {"Ограничивает cross-site отправку."}
          </p>

          <h3>{"secure"}</h3>
          <p>
            {"Требует HTTPS; для локального HTTP обычно False."}
          </p>

        </div>

        <CodeBlock
          caption={"установка"}
          code={
            "from uuid import uuid4\n" +
            "\n" +
            "@router.post(\"/visits\")\n" +
            "def start_visit(response: Response):\n" +
            "    visit_id = str(uuid4())\n" +
            "\n" +
            "    response.set_cookie(\n" +
            "        key=\"studyhub_visit_id\",\n" +
            "        value=visit_id,\n" +
            "        httponly=True,\n" +
            "        samesite=\"lax\",\n" +
            "        secure=False,\n" +
            "    )\n" +
            "\n" +
            "    return {\n" +
            "        \"message\": \"Visit started\",\n" +
            "    }"
          }
        />

        <CodeBlock
          caption={"header"}
          code={
            "Set-Cookie: studyhub_visit_id=...; HttpOnly; Path=/; SameSite=lax"
          }
        />

        <StepThrough
          code={
            "POST /visits\n" +
            "→ endpoint creates visit_id\n" +
            "→ response.set_cookie\n" +
            "→ Set-Cookie header\n" +
            "→ browser stores value\n" +
            "→ next request sends Cookie header"
          }
          steps={[
            {
              line: 0,
              note: "Клиент запускает operation.",
              vars: { "request": "POST /visits" },
            },
            {
              line: 1,
              note: "Server создаёт идентификатор.",
              vars: { "visit_id": "uuid" },
            },
            {
              line: 2,
              note: "Response получает cookie metadata.",
              vars: { "method": "set_cookie" },
            },
            {
              line: 3,
              note: "Клиент получает Set-Cookie.",
              vars: { "header": "present" },
            },
            {
              line: 4,
              note: "Браузер применяет свои правила хранения.",
              vars: { "storage": "browser" },
            },
            {
              line: 5,
              note: "Следующий request может отправить cookie.",
              vars: { "Cookie": "studyhub_visit_id=..." },
            },
          ]}
        />

        <Callout tone="info">
          {"В production значение secure обычно True при HTTPS. Не копируйте локальную настройку механически в развёрнутое приложение."}
        </Callout>
      </Section>

      <Section number="07" title={"Удаление cookie и границы учебного примера"}>
        <Lead>
          {"Удаление выполняется response.delete_cookie с тем же key и совместимыми параметрами path/domain. Клиент получает Set-Cookie, который делает старое значение недействительным."}
        </Lead>

        <div className="lesson-practice-steps">
          <h3>{"Не удаление на сервере"}</h3>
          <p>
            {"Браузеру отправляется инструкция изменить cookie."}
          </p>

          <h3>{"Совпадение key/path"}</h3>
          <p>
            {"Иначе можно удалить не ту область или оставить старую cookie."}
          </p>

          <h3>{"Logout позже"}</h3>
          <p>
            {"В server-side session потребуется также удалить запись session на сервере."}
          </p>

          <h3>{"Сейчас"}</h3>
          <p>
            {"Удаляем только учебный visit id."}
          </p>

        </div>

        <CodeBlock
          caption={"удаление"}
          code={
            "@router.delete(\"/visits\", status_code=204)\n" +
            "def finish_visit(response: Response) -> None:\n" +
            "    response.delete_cookie(\n" +
            "        key=\"studyhub_visit_id\",\n" +
            "    )"
          }
        />

        <CodeBlock
          caption={"сценарий"}
          code={
            "POST /visits\n" +
            "→ Set-Cookie\n" +
            "GET /visits\n" +
            "→ cookie read\n" +
            "DELETE /visits\n" +
            "→ cookie expired"
          }
        />

        <CodeSequence
          title={"Жизненный цикл cookie"}
          prompt={"Расположите действия."}
          pieces={[
            { id: "start", code: "server sends Set-Cookie" },
            { id: "store", code: "client stores cookie" },
            { id: "send", code: "client sends Cookie header" },
            { id: "read", code: "FastAPI extracts value" },
            { id: "delete", code: "server sends deletion Set-Cookie" },
          ]}
          correctOrder={[
            "start",
            "store",
            "send",
            "read",
            "delete",
          ]}
          explanation={"Cookie живёт в обмене response и последующих requests."}
        />

        <Callout tone="info">
          {"Cookie может оставаться в интерфейсе клиента до обновления, но последующие requests должны следовать новому Set-Cookie."}
        </Callout>
      </Section>

      <Section number="08" title={"Практика: версия клиента и visit cookie"}>
        <Lead>
          {"Добавьте к StudyHub два независимых механизма: X-Client-Version как request metadata и studyhub_visit_id как учебную cookie. Не связывайте их с user authentication."}
        </Lead>

        <div className="lesson-practice-steps">
          <h3>{"GET /info"}</h3>
          <p>
            {"Принимает optional X-Client-Version и добавляет X-API-Mode."}
          </p>

          <h3>{"POST /visits"}</h3>
          <p>
            {"Устанавливает HttpOnly visit cookie."}
          </p>

          <h3>{"GET /visits"}</h3>
          <p>
            {"Показывает наличие идентификатора."}
          </p>

          <h3>{"DELETE /visits"}</h3>
          <p>
            {"Удаляет cookie со status 204."}
          </p>

          <h3>{"Postman"}</h3>
          <p>
            {"Проверьте request headers и cookie jar."}
          </p>

        </div>

        <CodeBlock
          caption={"контрольная карта"}
          code={
            "request header\n" +
            "X-Client-Version: 1.4.0\n" +
            "→ endpoint argument\n" +
            "\n" +
            "response header\n" +
            "X-API-Mode: development\n" +
            "\n" +
            "response Set-Cookie\n" +
            "→ client cookie storage\n" +
            "→ next request Cookie"
          }
        />

        <Callout tone="info">
          {"Итог занятия — ясное различие body, headers, cookies и response metadata."}
        </Callout>

        <div className="lesson-check-group">
          <QuizCard
            question={"Во что превращается x_client_version?"}
            options={[
              "X-Client-Version",
              "x_client_version body field",
              "query x-client-version",
            ]}
            correctIndex={0}
            explanation={"Header конвертирует underscores в hyphens."}
          />
          <QuizCard
            question={"Как добавить custom response header?"}
            options={[
              "через parameter Response",
              "через TaskCreate",
              "через path",
            ]}
            correctIndex={0}
            explanation={"Temporary Response участвует в финальном ответе."}
          />
          <QuizCard
            question={"Что делает set_cookie?"}
            options={[
              "добавляет Set-Cookie в response",
              "создаёт server-side session автоматически",
              "пишет JSON",
            ]}
            correctIndex={0}
            explanation={"Клиент получает инструкцию сохранить cookie."}
          />
          <QuizCard
            question={"Является ли cookie готовой аутентификацией?"}
            options={[
              "нет",
              "да всегда",
              "только в Swagger",
            ]}
            correctIndex={0}
            explanation={"Нужна отдельная логика доверия и session/user data."}
          />
        </div>

        <KeyTakeaways
          points={[
            <>{"Header читает request metadata."}</>,
            <>{"Underscore в имени обычно становится hyphen."}</>,
            <>{"Required header может дать 422 до endpoint."}</>,
            <>{"Response parameter добавляет headers и cookies к обычному return."}</>,
            <>{"Cookie извлекается отдельным маркером Cookie."}</>,
            <>{"set_cookie отправляет Set-Cookie клиенту."}</>,
            <>{"delete_cookie инструктирует клиента удалить значение."}</>,
            <>{"Cookie является транспортом, а не готовой session."}</>,
          ]}
        />

        <PracticeCta
          text={"Добавьте X-Client-Version, X-API-Mode и полный жизненный цикл studyhub_visit_id, затем проверьте headers и cookies в Postman."}
        />
      </Section>

    </RichLesson>
  );
}
