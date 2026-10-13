import { Server, ShieldCheck } from "lucide-react";
import { BranchExplorer, BugHunt, Callout, CodeBlock, CompareSolutions, FillBlank, KeyTakeaways, Lead, PracticeCta, QuizCard, RichHero, RichLesson, Section, StepThrough, TerminalDemo, TrueFalse, TypeCard, TypeCards } from "../../shared";
import { TheoryBridge } from "../../shared";
const BLOCK_TITLE = "Блок 31 · Docker Compose: API, PostgreSQL и Redis";

export function Lesson181({ module }: { module?: string }) {
  return (
    <RichLesson>
      <RichHero
        variant="project"
        chip={module ?? BLOCK_TITLE}
        title={"Redis service как будущая инфраструктура"}
        intro={
          "Добавим Redis в local stack, проверим ping и healthcheck, но сознательно не превратим его в источник истины и не начнём кешировать бизнес-данные до появления измеримой потребности."
        }
        tags={[
          { icon: <Server size={14} />, label: "Redis service" },
          { icon: <ShieldCheck size={14} />, label: "границы ответственности" },
        ]}
      />
      <TheoryBridge link={"Compose stack уже умеет ждать PostgreSQL и применять migrations. Теперь добавляется ещё одна dependency, роль которой пока инфраструктурная и диагностическая."} boundary={"Наличие Redis-container не является причиной немедленно писать cache, sessions или rate limit. Бизнес-функция появится в этапе 9 после готового LMS-сценария."} />

      <Section number={"01"} title={"Почему Redis появляется раньше кеша"}>
        <Lead>
          {
            "Этап 8 отвечает за воспроизводимую инфраструктуру. Redis добавляется сейчас, чтобы local, CI и будущий deployment имели одинаковую topology. Прикладное использование появится позже, когда будет понятен конкретный read-path или rate-limit scenario."
          }
        </Lead>

        <div className="lesson-route">
          <ol>
            <li>
              <strong>Поднять:</strong> добавить service redis и устойчивый
              hostname
            </li>
            <li>
              <strong>Проверить:</strong> выполнить ping и healthcheck
            </li>
            <li>
              <strong>Разделить роли:</strong> оставить PostgreSQL source of
              truth
            </li>
            <li>
              <strong>Зафиксировать границу:</strong> не менять HTTP-контракт и
              бизнес-данные
            </li>
          </ol>
          <p>
            Результат — Redis доступен приложению, но его отказ не уничтожает
            постоянные данные StudyHub.
          </p>
        </div>

        <Callout tone={"info"}>
          {
            "Инфраструктура может быть готова раньше use case. Это не означает, что use case нужно изобретать ради технологии."
          }
        </Callout>
      </Section>

      <Section number={"02"} title={"Service redis и внутренний URL"}>
        <Lead>
          {
            "Redis запускается отдельным process на port 6379. В Compose network API обращается к нему по hostname redis. Database number /0 является логическим пространством ключей, а не отдельным server."
          }
        </Lead>

        <CodeBlock
          caption={"Redis в Compose"}
          code={`services:
          redis:
            image: redis:7-alpine
            command: redis-server --appendonly no
            expose:
              - "6379"
        
          api:
            environment:
              REDIS_URL: redis://redis:6379/0`}
        />

        <FillBlank
          prompt={"Завершите REDIS_URL внутри Compose network."}
          before={"redis://"}
          after={":6379/0"}
          options={["localhost", "redis", "api"]}
          answer={"redis"}
          explanation={"Service name redis разрешается внутренним DNS."}
        />
      </Section>

      <Section number={"03"} title={"PING и healthcheck Redis"}>
        <Lead>
          {
            "Минимальная проверка connectivity — команда PING с ответом PONG. Healthcheck может использовать redis-cli ping и переводить service из starting в healthy."
          }
        </Lead>

        <CodeBlock
          caption={"healthcheck Redis"}
          code={`redis:
          image: redis:7-alpine
          healthcheck:
            test: ["CMD", "redis-cli", "ping"]
            interval: 5s
            timeout: 3s
            retries: 10`}
        />

        <TerminalDemo
          title={"проверка Redis"}
          lines={[
            { cmd: `docker compose up -d redis` },
            { cmd: `docker compose exec redis redis-cli ping` },
            { out: `PONG` },
            { cmd: `docker compose ps redis` },
            { out: `redis   Up (healthy)` },
          ]}
        />
      </Section>

      <Section
        number={"04"}
        title={"PostgreSQL и Redis имеют разные контракты"}
      >
        <Lead>
          {
            "PostgreSQL хранит пользователей, курсы и задачи как связанные постоянные данные. Redis предназначен для временных значений, быстрых lookups и coordination. Удаление Redis data не должно удалять продуктовые факты."
          }
        </Lead>

        <TypeCards>
          <TypeCard
            badge={"PostgreSQL"}
            title={"Source of truth"}
            code={`users, tasks, courses`}
          >
            {"Целостные постоянные данные и транзакции."}
          </TypeCard>
          <TypeCard
            badge={"Redis"}
            badgeTone={"float"}
            title={"Временная инфраструктура"}
            code={`future cache, TTL, rate limit`}
          >
            {"Значения, которые можно восстановить или потерять по контракту."}
          </TypeCard>
          <TypeCard
            badge={"HTTP"}
            badgeTone={"str"}
            title={"Контракт пока прежний"}
            code={`GET /tasks`}
          >
            {"Добавление service не меняет response API."}
          </TypeCard>
        </TypeCards>

        <TrueFalse
          statement={
            <>
              {
                "После добавления Redis список задач можно удалить из PostgreSQL и хранить только в кеше."
              }
            </>
          }
          isTrue={false}
          explanation={
            "Кеш не заменяет source of truth; бизнес-данные остаются в PostgreSQL."
          }
        />
      </Section>

      <Section number={"05"} title={"TTL как предварительная модель"}>
        <Lead>
          {
            "TTL задаёт срок жизни key. Сейчас достаточно изолированного диагностического эксперимента: создать временный key, увидеть остаток времени и дождаться исчезновения. Прикладной cache-aside появится позже."
          }
        </Lead>

        <StepThrough
          code={`SETEX diagnostic:compose 30 ok
        TTL diagnostic:compose
        GET diagnostic:compose
        wait 30 seconds
        GET diagnostic:compose`}
          steps={[
            {
              line: 0,
              note: "Создаётся временный диагностический key.",
              vars: { value: "ok", ttl: "30s" },
            },
            {
              line: 1,
              note: "Redis показывает оставшееся время.",
              vars: { ttl: "<= 30" },
            },
            {
              line: 2,
              note: "До истечения key читается.",
              vars: { result: "ok" },
            },
            {
              line: 3,
              note: "Время жизни заканчивается.",
              vars: { key: "expired" },
            },
            {
              line: 4,
              note: "После expiration значение отсутствует.",
              vars: { result: "nil" },
            },
          ]}
        />

        <Callout>
          {
            "Эксперимент показывает механику TTL, но не вводит cache policy для StudyHub."
          }
        </Callout>
      </Section>

      <Section
        number={"06"}
        title={"Является ли Redis обязательным для readiness API"}
      >
        <Lead>
          {
            "Пока Redis не участвует в пользовательском сценарии, его недоступность не обязана делать весь API unready. Диагностический endpoint может показать degraded dependency, сохранив доступ к PostgreSQL-функциям."
          }
        </Lead>

        <BranchExplorer
          code={`postgres_ok and redis_ok
          -> ready
        postgres_failed
          -> not ready
        postgres_ok and redis_failed
          -> ready with degraded redis status`}
          scenarios={[
            { label: "всё доступно", activeLine: 1, output: "200 ready" },
            {
              label: "PostgreSQL недоступен",
              activeLine: 3,
              output: "503 not ready",
            },
            {
              label: "Redis недоступен",
              activeLine: 5,
              output: "200 ready, redis=degraded",
            },
          ]}
        />

        <Callout>
          {
            "Критичность dependency определяется текущим контрактом продукта. После появления rate limit или кеша решение может измениться."
          }
        </Callout>
      </Section>

      <Section number={"07"} title={"Конфигурация и типичные ошибки Redis"}>
        <Lead>
          {
            "Финальная декларация добавляет service, healthcheck и REDIS_URL. Application может иметь небольшой connectivity probe, но не записывает tasks, users или sessions в Redis на этом блоке."
          }
        </Lead>

        <CompareSolutions
          question={"Какое изменение соответствует границе урока?"}
          left={{
            title: "Сразу заменить database",
            code: `await redis.set(f"task:{id}", payload)`,
            note: "Постоянные данные переносятся без модели consistency.",
          }}
          right={{
            title: "Добавить инфраструктурный probe",
            code: `await redis.ping()`,
            note: "Проверяется connectivity без изменения бизнес-контракта.",
          }}
          preferred={"right"}
          explanation={
            "Цель блока — topology и диагностика, а не внедрение неготовой cache policy."
          }
        />

        <Lead>
          {
            "Ошибки похожи на database connection: localhost внутри API, неверный port, service unhealthy или клиент не закрывается. Начинайте с compose ps redis и redis-cli ping."
          }
        </Lead>

        <BugHunt
          code={`REDIS_URL=redis://localhost:6379/0
        
        # код выполняется внутри api service`}
          question={"Почему client не видит Redis?"}
          options={[
            "Нужен hostname redis",
            "Redis не поддерживает URLs",
            "Database number должен быть 5432",
          ]}
          correctIndex={0}
          explanation={"localhost относится к API-container."}
          fix={`REDIS_URL=redis://redis:6379/0`}
        />
      </Section>

      <Section
        number={"08"}
        title={"Контрольная точка: Redis без смешения ролей"}
      >
        <Lead>
          {
            "Закрепите не команды сами по себе, а причинную модель: какой service запускается, какую dependency ожидает, где находится состояние и каким наблюдаемым сигналом подтверждается готовность."
          }
        </Lead>

        <div className="lesson-check-group">
          <QuizCard
            question={"Какой hostname Redis внутри Compose?"}
            options={["redis", "localhost", "6379"]}
            correctIndex={0}
            explanation={"Service name используется внутренним DNS."}
          />
          <QuizCard
            question={"Что отвечает redis-cli ping?"}
            options={["PONG", "READY SQL", "HTTP 200"]}
            correctIndex={0}
            explanation={
              "PING является минимальной connectivity-командой Redis."
            }
          />
          <QuizCard
            question={"Где остаются задачи StudyHub?"}
            options={["В PostgreSQL", "Только в Redis", "В Docker image"]}
            correctIndex={0}
            explanation={"PostgreSQL остаётся source of truth."}
          />
          <QuizCard
            question={"Нужно ли уже реализовывать cache-aside?"}
            options={[
              "Нет, use case появится на этапе 9",
              "Да, иначе Compose не работает",
              "Да, вместо migrations",
            ]}
            correctIndex={0}
            explanation={
              "Текущий результат ограничен инфраструктурой и connectivity."
            }
          />
        </div>

        <KeyTakeaways
          points={[
            <>
              {"Redis запускается отдельным service на внутреннем port 6379."}
            </>,
            <>{"API использует REDIS_URL с hostname redis."}</>,
            <>{"PING/PONG подтверждает connectivity."}</>,
            <>{"PostgreSQL остаётся источником истины."}</>,
            <>
              {"TTL изучается на диагностическом key, а не на бизнес-данных."}
            </>,
            <>
              {"Критичность Redis для readiness зависит от текущего use case."}
            </>,
            <>{"Добавление инфраструктуры не обязано менять HTTP-контракт."}</>,
          ]}
        />

        <PracticeCta
          text={
            "Добавьте service redis и healthcheck, выполните ping из redis-container и из API-кода, проведите SETEX/TTL эксперимент и реализуйте диагностический dependency status, где PostgreSQL обязателен, а Redis пока отображается как optional/degraded."
          }
        />
      </Section>
    </RichLesson>
  );
}
