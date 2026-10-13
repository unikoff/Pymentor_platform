import { ShieldCheck, Timer } from "lucide-react";
import { BranchExplorer, Callout, CodeBlock, CompareSolutions, KeyTakeaways, Lead, MatchPairs, PracticeCta, PredictOutput, QuizCard, RecallCard, RichHero, RichLesson, Section, StepThrough, TerminalDemo, TrueFalse, TypeCard, TypeCards } from "../../shared";
import { TheoryBridge } from "../../shared";
const BLOCK_TITLE = "Блок 35 · Redis, кеш и фоновые операции";

export function Lesson204({ module }: { module?: string }) {
  return (
    <RichLesson>
      <RichHero
        variant="project"
        chip={module ?? BLOCK_TITLE}
        title={"Простой rate limit через Redis"}
        intro={
          "Используем Redis как временное shared state для одного чувствительного endpoint: считаем запросы пользователя внутри короткого окна, возвращаем 429 и Retry-After после лимита, а затем проверяем автоматический reset по TTL."
        }
        tags={[
          { icon: <ShieldCheck size={14} />, label: "429 и граница доступа" },
          { icon: <Timer size={14} />, label: "окно и TTL" },
        ]}
      />
      <TheoryBridge link={"Redis уже хранит временный кеш и generation. Rate limit показывает вторую оправданную задачу: общий счётчик между несколькими API processes, который должен автоматически исчезать после временного окна."} boundary={"Это учебный fixed-window limiter для одного endpoint. Global distributed algorithms, sliding window, Lua-оптимизация, защита от DDoS и инфраструктурный gateway не входят."} />

      <Section number={"01"} title={"Один чувствительный сценарий"}>
        <Lead>
          {
            "Rate limit не добавляется ко всему API. StudyHub ограничивает отправку учебного напоминания: несколько повторов допустимы, но десятки запросов подряд создают лишнюю работу и шум. Остальные endpoints сохраняют прежний контракт."
          }
        </Lead>

        <div className="lesson-route">
          <ol>
            <li>
              <strong>{"Идентифицировать:"}</strong>{" "}
              {"выбрать user_id после authentication"}
            </li>
            <li>
              <strong>{"Посчитать:"}</strong>{" "}
              {"увеличить Redis counter для endpoint и окна"}
            </li>
            <li>
              <strong>{"Разрешить или отклонить:"}</strong>{" "}
              {"сравнить count с limit"}
            </li>
            <li>
              <strong>{"Сообщить:"}</strong>{" "}
              {"вернуть 429 и Retry-After до reset"}
            </li>
          </ol>
          <p>
            {
              "Результат урока — dependency/service, ограничивающий POST /courses/{id}/reminders и не затрагивающий чтение каталога."
            }
          </p>
        </div>

        <Callout tone={"info"}>
          {
            "Rate limit является частью HTTP-контракта: клиент должен знать status 429, границу и время следующей попытки."
          }
        </Callout>
      </Section>

      <Section number={"02"} title={"Key счётчика и идентификатор клиента"}>
        <Lead>
          {
            "Authenticated user_id обычно точнее IP для пользовательского действия: несколько людей могут разделять IP, а один человек менять сеть. Key включает endpoint, user_id и версию policy."
          }
        </Lead>

        <CodeBlock
          caption={"key одной rate-limit policy"}
          code={`def reminder_rate_key(user_id: int) -> str:
            return (
                "studyhub:rate:v1:"
                f"course-reminder:user={user_id}"
            )`}
        />

        <TypeCards>
          <TypeCard
            badge={"user_id"}
            title={"Authenticated identity"}
            code={`user=42`}
          >
            {"Подходит для действия, доступного только вошедшему пользователю."}
          </TypeCard>
          <TypeCard
            badge={"IP"}
            badgeTone={"float"}
            title={"Network identity"}
            code={`ip=203.0.113.8`}
          >
            {"Может быть дополнительным сигналом, но не равен одному человеку."}
          </TypeCard>
          <TypeCard
            badge={"policy"}
            badgeTone={"str"}
            title={"Отдельный namespace"}
            code={`course-reminder`}
          >
            {"Лимит одного действия не влияет на другие endpoints."}
          </TypeCard>
        </TypeCards>
      </Section>

      <Section number={"03"} title={"Fixed window: INCR и EXPIRE"}>
        <Lead>
          {
            "Первый request создаёт counter=1 и TTL окна. Следующие requests выполняют atomic INCR. Пока key существует, count растёт; после expiration key исчезает и новое окно начинается снова с единицы."
          }
        </Lead>

        <StepThrough
          code={`count = await redis.incr(key)
        if count == 1:
            await redis.expire(key, window_seconds)
        
        ttl = await redis.ttl(key)
        if count > limit:
            raise RateLimitExceeded(retry_after=ttl)`}
          steps={[
            {
              line: 0,
              note: "INCR атомарно создаёт key со значением 1 либо увеличивает существующий.",
              vars: { count: "1" },
            },
            {
              line: 1,
              note: "TTL устанавливается только для первого request окна.",
              vars: { window: "60 секунд" },
            },
            {
              line: 4,
              note: "Текущий TTL нужен клиенту как Retry-After.",
              vars: { ttl: "58" },
            },
            {
              line: 5,
              note: "Requests сверх limit не запускают business action.",
              vars: { status: "429" },
            },
          ]}
        />

        <Callout>
          {
            "Между INCR и EXPIRE остаётся небольшая граница отказа. Для production часто используют transaction/Lua. В учебном блоке это ограничение фиксируется явно, а не скрывается."
          }
        </Callout>
      </Section>

      <Section number={"04"} title={"Allowed, blocked и reset"}>
        <Lead>
          {
            "Поведение легче понять как три состояния. Пока count ≤ limit, request разрешён. При count > limit возвращается 429. После TTL key отсутствует, и следующий request открывает новое окно."
          }
        </Lead>

        <BranchExplorer
          code={`count = await limiter.hit(user_id=42)
        if count <= 3:
            return "allowed"
        if count > 3:
            return "blocked: 429"
        # после expiration новый INCR вернёт 1`}
          scenarios={[
            {
              label: "request 1–3",
              activeLine: 2,
              output: "allowed, action выполняется",
            },
            {
              label: "request 4",
              activeLine: 4,
              output: "429 Too Many Requests",
            },
            {
              label: "после TTL",
              activeLine: 5,
              output: "counter=1, новое окно",
            },
          ]}
        />

        <PredictOutput
          code={`limit = 3
        counts = [1, 2, 3, 4]
        for count in counts:
            print("allowed" if count <= limit else "429")`}
          output={`allowed
        allowed
        allowed
        429`}
          hint={"Первые три requests входят в policy, четвёртый блокируется."}
        />
      </Section>

      <Section number={"05"} title={"HTTP 429 и Retry-After"}>
        <Lead>
          {
            "Rate-limit service не должен возвращать случайную строку. Endpoint преобразует доменное превышение в HTTPException со status 429 и header Retry-After, округлённым до неотрицательного количества секунд."
          }
        </Lead>

        <CodeBlock
          caption={"явный HTTP-контракт"}
          code={`from fastapi import HTTPException, status
        
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail={
                "code": "rate_limit_exceeded",
                "message": "Too many reminder requests",
            },
            headers={"Retry-After": str(max(ttl, 1))},
        )`}
        />

        <MatchPairs
          prompt={"Соедините поле ответа с назначением."}
          leftTitle={"Поле"}
          rightTitle={"Назначение"}
          pairs={[
            { left: "429", right: "клиент временно превысил частоту" },
            { left: "Retry-After", right: "через сколько секунд повторить" },
            { left: "detail.code", right: "машиночитаемая причина" },
            { left: "TTL", right: "источник значения Retry-After" },
          ]}
          explanation={
            "Клиент получает предсказуемый контракт и может корректно отложить retry."
          }
        />
      </Section>

      <Section
        number={"06"}
        title={"Redis unavailable: fail-open или fail-closed"}
      >
        <Lead>
          {
            "При недоступном Redis приложение не знает текущий count. Для некритичного mock-reminder можно выбрать fail-open: выполнить действие и записать warning. Для login или оплаты решение могло бы быть fail-closed. Policy должна быть осознанной."
          }
        </Lead>

        <CompareSolutions
          question={"Какая деградация подходит учебному reminder endpoint?"}
          left={{
            title: "Fail-closed",
            code: `RedisError -> 503, reminder blocked`,
            note: "Защита сохраняется, но временная dependency блокирует некритичное действие.",
          }}
          right={{
            title: "Fail-open",
            code: `RedisError -> warning, reminder allowed`,
            note: "Доступность выше, риск краткого превышения принят.",
          }}
          preferred={"right"}
          explanation={
            "Для учебного некритичного уведомления выбран fail-open и это задокументировано."
          }
        />

        <TrueFalse
          statement={
            <>
              {"Одна стратегия fail-open подходит любому endpoint приложения."}
            </>
          }
          isTrue={false}
          explanation={
            "Решение зависит от риска конкретного действия и требований безопасности."
          }
        />
      </Section>

      <Section number={"07"} title={"Проверка окна без долгого ожидания"}>
        <Lead>
          {
            "В integration test окно задаётся коротким, например 2 секунды, или clock/limiter dependency заменяется тестовой. Проверяются первые разрешённые requests, 429, Retry-After и новый разрешённый request после expiration."
          }
        </Lead>

        <TerminalDemo
          title={"ручной сценарий лимита 3/10s"}
          lines={[
            {
              cmd: `for i in 1 2 3 4; do curl -i -X POST http://localhost:8000/courses/42/reminders; done`,
            },
            {
              out: `200
        200
        200
        HTTP/1.1 429 Too Many Requests
        Retry-After: 8`,
            },
            {
              cmd: `sleep 10 && curl -i -X POST http://localhost:8000/courses/42/reminders`,
            },
            { out: `HTTP/1.1 200 OK` },
          ]}
        />

        <RecallCard
          question={"Что обязательно проверить кроме status 429?"}
          hint={"Status без side-effect проверки не доказывает защиту."}
          answer={
            <p>
              {
                "Header Retry-After, отсутствие business action на заблокированном request и reset после TTL."
              }
            </p>
          }
        />
      </Section>

      <Section number={"08"} title={"Контрольная точка: rate limit"}>
        <Lead>
          {
            "Проверьте не только знание команд, но и способность проследить путь данных, назвать source of truth, предсказать режим деградации и объяснить результат теста без чтения готового ответа."
          }
        </Lead>

        <div className="lesson-check-group">
          <QuizCard
            question={"Что хранит rate-limit key?"}
            options={[
              "Временный счётчик одного action/user",
              "Course entity",
              "JWT secret",
            ]}
            correctIndex={0}
            explanation={
              "Counter исчезает после окна и не является продуктовым фактом."
            }
          />
          <QuizCard
            question={"Какой status используется после лимита?"}
            options={["429", "201", "404"]}
            correctIndex={0}
            explanation={"429 обозначает Too Many Requests."}
          />
          <QuizCard
            question={"Откуда берётся Retry-After?"}
            options={[
              "Из оставшегося TTL окна",
              "Из course title",
              "Из PostgreSQL id",
            ]}
            correctIndex={0}
            explanation={"TTL показывает время до reset."}
          />
          <QuizCard
            question={"Что означает fail-open?"}
            options={[
              "Разрешить действие при сбое limiter и залогировать",
              "Всегда блокировать",
              "Удалить Redis volume",
            ]}
            correctIndex={0}
            explanation={
              "Availability при dependency failure выше, но риск превышения принят."
            }
          />
        </div>

        <KeyTakeaways
          points={[
            <>
              {
                "Rate limit вводится для одного конкретного чувствительного action."
              }
            </>,
            <>{"Key включает policy и authenticated user_id."}</>,
            <>{"INCR создаёт общий counter, TTL ограничивает окно."}</>,
            <>{"Requests сверх limit не запускают business action."}</>,
            <>{"HTTP-контракт использует 429 и Retry-After."}</>,
            <>{"Fail-open или fail-closed выбираются по риску сценария."}</>,
            <>{"Тест проверяет allowed, blocked, side effect и reset."}</>,
          ]}
        />

        <PracticeCta
          text={
            "Ограничьте POST /courses/{course_id}/reminders до 3 запросов за 10 секунд на пользователя. Верните 429 с Retry-After, подтвердите отсутствие mock-notification на четвёртом request, проверьте reset и задокументируйте выбранный fail-open режим при RedisError."
          }
        />
      </Section>
    </RichLesson>
  );
}
