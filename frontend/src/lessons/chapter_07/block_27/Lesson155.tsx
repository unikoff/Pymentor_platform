import { ShieldCheck, Timer } from "lucide-react";
import { BranchExplorer, BugHunt, Callout, CodeBlock, CompareSolutions, FlipCards, KeyTakeaways, Lead, MatchPairs, MethodGrid, PracticeCta, QuizCard, RecallCard, RichHero, RichLesson, Section, StepThrough, TerminalDemo, TrueFalse, TypeCard, TypeCards } from "../../shared";
import { TheoryBridge } from "../../shared";
const BLOCK_TITLE = "Блок 27 · Асинхронный FastAPI и внешние HTTP-сервисы";

type LessonProps = { module?: string };

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
      <TheoryBridge link={"Успешный AsyncClient-запрос уже работает. Теперь интеграция должна оставаться предсказуемой, когда внешний сервис тормозит, недоступен или отвечает ошибкой."} boundary={"Timeout, transport error и HTTP status — разные классы событий. Один широкий except лишает нас диагностики и мешает выбрать правильный ответ клиенту."} />

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
