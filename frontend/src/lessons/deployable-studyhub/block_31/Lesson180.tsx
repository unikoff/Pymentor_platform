import { Activity, Workflow } from "lucide-react";
import { BranchExplorer, Callout, CodeBlock, CodeSequence, CompareSolutions, KeyTakeaways, Lead, MatchPairs, PracticeCta, QuizCard, RichHero, RichLesson, Section, TerminalDemo, TrueFalse, TypeCard, TypeCards } from "../../shared";
import { TheoryBridge } from "../../shared";
const BLOCK_TITLE = "Блок 31 · Docker Compose: API, PostgreSQL и Redis";

export function Lesson180({ module }: { module?: string }) {
  return (
    <RichLesson>
      <RichHero
        variant="project"
        chip={module ?? BLOCK_TITLE}
        title={"Readiness, healthcheck и запуск migrations"}
        intro={
          "Уберём гонку старта: научим Compose отличать started от healthy, добавим pg_isready, отдельный migration service и порядок db healthy → migrations completed → API started."
        }
        tags={[
          { icon: <Activity size={14} />, label: "readiness dependency" },
          { icon: <Workflow size={14} />, label: "migrations до API" },
        ]}
      />
      <TheoryBridge link={"Database теперь имеет постоянный volume, поэтому чистый и существующий environments должны одинаково получать актуальную schema до первого request."} boundary={"Порядок создания containers не равен готовности processes. Healthcheck проверяет конкретный сигнал, а migrations должны завершаться отдельным контролируемым шагом."} />

      <Section number={"01"} title={"Started ещё не означает ready"}>
        <Lead>
          {
            "Docker может запустить PostgreSQL process, но несколько секунд database инициализирует cluster и ещё не принимает connections. Если API стартует немедленно, результат зависит от случайного timing."
          }
        </Lead>

        <div className="lesson-route">
          <ol>
            <li>
              <strong>Измерить:</strong> увидеть промежуток между container
              started и database ready
            </li>
            <li>
              <strong>Проверить:</strong> добавить pg_isready как healthcheck
            </li>
            <li>
              <strong>Применить schema:</strong> запустить Alembic отдельным
              one-shot service
            </li>
            <li>
              <strong>Открыть API:</strong> стартовать только после успешных
              migrations
            </li>
          </ol>
          <p>
            Результат — детерминированный startup чистого и повторного local
            stack.
          </p>
        </div>

        <Callout tone={"info"}>
          {
            "Readiness — это ответ на вопрос «может ли dependency обслужить ожидаемую операцию сейчас?», а не просто «существует ли process»."
          }
        </Callout>
      </Section>

      <Section number={"02"} title={"Healthcheck PostgreSQL через pg_isready"}>
        <Lead>
          {
            "Команда pg_isready проверяет, принимает ли server connections. Compose периодически запускает test и хранит health status: starting, healthy или unhealthy."
          }
        </Lead>

        <CodeBlock
          caption={"healthcheck db"}
          code={`services:
          db:
            image: postgres:16-alpine
            healthcheck:
              test: ["CMD-SHELL", "pg_isready -U studyhub -d studyhub"]
              interval: 5s
              timeout: 3s
              retries: 10
              start_period: 5s`}
        />

        <TypeCards>
          <TypeCard badge={"interval"} title={"Частота"} code={`5s`}>
            {"Как часто повторять проверку."}
          </TypeCard>
          <TypeCard
            badge={"timeout"}
            badgeTone={"float"}
            title={"Лимит попытки"}
            code={`3s`}
          >
            {"Сколько ждать один запуск test."}
          </TypeCard>
          <TypeCard
            badge={"retries"}
            badgeTone={"str"}
            title={"Порог ошибки"}
            code={`10`}
          >
            {"Сколько неудач допускается до unhealthy."}
          </TypeCard>
        </TypeCards>
      </Section>

      <Section number={"03"} title={"depends_on с условиями"}>
        <Lead>
          {
            "Compose может связать старт service с состоянием зависимости. Migrate ждёт service_healthy для db, а API — service_completed_successfully для migrate. Так декларация отражает настоящий порядок готовности."
          }
        </Lead>

        <CodeBlock
          caption={"условия запуска"}
          code={`services:
          migrate:
            build: .
            command: alembic upgrade head
            depends_on:
              db:
                condition: service_healthy
        
          api:
            build: .
            depends_on:
              migrate:
                condition: service_completed_successfully`}
        />

        <MatchPairs
          prompt={"Соедините условие с ожидаемым состоянием."}
          leftTitle={"Condition"}
          rightTitle={"Состояние"}
          pairs={[
            {
              left: "service_started",
              right: "container запущен, readiness не доказана",
            },
            {
              left: "service_healthy",
              right: "healthcheck зависимости успешен",
            },
            {
              left: "service_completed_successfully",
              right: "one-shot service завершился с code 0",
            },
          ]}
          explanation={"Условия выбираются по реальному контракту dependency."}
        />
      </Section>

      <Section number={"04"} title={"Migration service как конечная операция"}>
        <Lead>
          {
            "Migrations не являются долгоживущим server process. Service migrate использует тот же application image и DATABASE_URL, выполняет alembic upgrade head и завершается. Code 0 разрешает запуск API, ненулевой code блокирует его."
          }
        </Lead>

        <CompareSolutions
          question={"Где безопаснее фиксировать schema startup?"}
          left={{
            title: "create_all в API",
            code: `await conn.run_sync(Base.metadata.create_all)`,
            note: "Application startup незаметно изменяет schema и обходит историю Alembic.",
          }}
          right={{
            title: "Отдельный migrate service",
            code: `command: alembic upgrade head`,
            note: "История migrations применяется наблюдаемым one-shot шагом.",
          }}
          preferred={"right"}
          explanation={
            "Alembic service делает schema change явным и останавливает startup при ошибке."
          }
        />

        <Callout>
          {
            "Idempotent означает, что повторный upgrade head на уже актуальной schema завершается успешно без повторного создания изменений."
          }
        </Callout>
      </Section>

      <Section number={"05"} title={"Правильный timeline запуска stack"}>
        <Lead>
          {
            "Теперь порядок определяется не скоростью машины, а условиями. Database сначала становится healthy, затем migrations достигают head, после чего API начинает принимать traffic."
          }
        </Lead>

        <CodeSequence
          title={"Соберите startup pipeline"}
          prompt={"Расположите состояния в причинном порядке."}
          pieces={[
            { id: "db-start", code: "db container started" },
            { id: "db-health", code: "pg_isready → healthy" },
            { id: "migrate", code: "alembic upgrade head" },
            { id: "migrate-ok", code: "migrate exit code 0" },
            { id: "api", code: "api process started" },
            { id: "request", code: "GET /ready → 200" },
          ]}
          correctOrder={[
            "db-start",
            "db-health",
            "migrate",
            "migrate-ok",
            "api",
            "request",
          ]}
          explanation={
            "Каждый следующий шаг опирается на подтверждённый результат предыдущего."
          }
        />
      </Section>

      <Section number={"06"} title={"Что происходит при ошибке migration"}>
        <Lead>
          {
            "Ошибка revision, конфликт schema или неверный DATABASE_URL должны остановить startup, а не быть скрыты retry-циклом API. Logs migrate становятся первым источником диагностики."
          }
        </Lead>

        <BranchExplorer
          code={`migrate exit code == 0
          -> start api
        migrate exit code != 0
          -> keep api stopped
          -> inspect migrate logs
          -> fix migration or config
          -> rerun`}
          scenarios={[
            {
              label: "migration success",
              activeLine: 1,
              output: "API получает разрешение на старт",
            },
            {
              label: "migration failed",
              activeLine: 3,
              output: "API остаётся остановленным",
            },
            {
              label: "после исправления",
              activeLine: 5,
              output: "Compose повторяет one-shot service",
            },
          ]}
        />

        <Callout>
          {
            "Автоматический startup не должен автоматически скрывать destructive migration errors. Система останавливается и показывает место сбоя."
          }
        </Callout>
      </Section>

      <Section number={"07"} title={"Health status и диагностика Compose"}>
        <Lead>
          {
            "Для расследования нужно увидеть сразу три состояния: health db, exit code migrate и logs api. Команда ps показывает сводку, а logs раскрывает причину."
          }
        </Lead>

        <TerminalDemo
          title={"проверка готовности stack"}
          lines={[
            { cmd: `docker compose up -d --build` },
            { cmd: `docker compose ps` },
            {
              out: `db        Up (healthy)
        migrate   Exited (0)
        api       Up (healthy)`,
            },
            { cmd: `docker compose logs migrate` },
            { out: `Running upgrade -> head` },
            { cmd: `curl -f http://localhost:8000/ready` },
            { out: `{"status":"ready"}` },
          ]}
        />

        <TrueFalse
          statement={
            <>
              {"Если db healthy, таблицы StudyHub гарантированно существуют."}
            </>
          }
          isTrue={false}
          explanation={
            "Database принимает connections, но schema подтверждается успешным migrate service."
          }
        />
      </Section>

      <Section
        number={"08"}
        title={"Контрольная точка: детерминированный startup"}
      >
        <Lead>
          {
            "Закрепите не команды сами по себе, а причинную модель: какой service запускается, какую dependency ожидает, где находится состояние и каким наблюдаемым сигналом подтверждается готовность."
          }
        </Lead>

        <div className="lesson-check-group">
          <QuizCard
            question={"Что проверяет pg_isready?"}
            options={[
              "Готовность PostgreSQL принимать connections",
              "Наличие всех API routes",
              "Версию Redis",
            ]}
            correctIndex={0}
            explanation={"Это database readiness probe."}
          />
          <QuizCard
            question={"Когда запускается migrate?"}
            options={[
              "После db service_healthy",
              "До создания db container",
              "После первого HTTP request",
            ]}
            correctIndex={0}
            explanation={"Migration зависит от реальной готовности базы."}
          />
          <QuizCard
            question={"Что должно произойти при migration exit code 1?"}
            options={[
              "API не запускается",
              "API игнорирует ошибку",
              "Volume удаляется автоматически",
            ]}
            correctIndex={0}
            explanation={"Неуспешная schema operation блокирует startup."}
          />
          <QuizCard
            question={"Почему create_all не заменяет Alembic?"}
            options={[
              "Не ведёт управляемую историю изменений schema",
              "Не умеет создавать таблицы",
              "Работает только с Redis",
            ]}
            correctIndex={0}
            explanation={
              "Migrations фиксируют последовательность schema revisions."
            }
          />
        </div>

        <KeyTakeaways
          points={[
            <>{"Container started и dependency ready — разные состояния."}</>,
            <>{"PostgreSQL readiness проверяется через pg_isready."}</>,
            <>
              {"Healthcheck имеет interval, timeout, retries и start_period."}
            </>,
            <>{"Migrate является отдельным one-shot service."}</>,
            <>{"API ждёт успешного завершения migrations."}</>,
            <>
              {"Ошибка migration должна остановить startup и остаться видимой."}
            </>,
            <>
              {
                "Compose ps, logs migrate и /ready образуют диагностическую цепочку."
              }
            </>,
          ]}
        />

        <PracticeCta
          text={
            "Добавьте db healthcheck, migrate service и условия depends_on. Проверьте чистый startup, повторный startup на актуальной schema и намеренно сломанную migration. Зафиксируйте ожидаемые статусы db/migrate/api в runbook."
          }
        />
      </Section>
    </RichLesson>
  );
}
