import { CheckCircle2, ShieldCheck } from "lucide-react";
import { BranchExplorer, BugHunt, Callout, CodeBlock, CompareSolutions, FillBlank, KeyTakeaways, Lead, MethodGrid, PracticeCta, QuizCard, RecallCard, RichHero, RichLesson, Section, StepThrough, TerminalDemo, TrueFalse, TypeCard, TypeCards } from "../../shared";
const BLOCK_TITLE = "Блок 29 · Linux, процессы, окружения и логи";

type LessonProps = { module?: string };

export function Lesson169({ module }: LessonProps) {
  return (
    <RichLesson>
      <RichHero
        variant="project"
        chip={module ?? BLOCK_TITLE}
        title={"Healthcheck, readiness и graceful shutdown"}
        intro={"Разделим три состояния сервиса: процесс существует, приложение готово обслуживать запросы и приложение корректно освобождает ресурсы при завершении. Добавим `/health`, `/ready` и cleanup через FastAPI lifespan."}
        tags={[
          { icon: <CheckCircle2 size={14} />, label: "жив · готов · завершается" },
          { icon: <ShieldCheck size={14} />, label: "контролируемый lifecycle" },
        ]}
      />
      <Callout tone="info">
        <strong>Связь с курсом.</strong> {"PID, config и logs уже наблюдаемы. Теперь StudyHub должен сам сообщать, может ли принимать traffic, а при SIGTERM — завершать database resources до остановки процесса."}{" "}
        <strong>Важно не перепутать:</strong> {"Liveness не доказывает доступность базы, а readiness не должна выполнять тяжёлый бизнес-сценарий. Каждая проверка отвечает на один эксплуатационный вопрос."}
      </Callout>

      <Section number={"01"} title={"Три вопроса вместо одного status"}>
        <Lead>
          {"Один endpoint «всё хорошо» смешивает разные состояния. Процесс может быть жив, но ещё выполнять startup; приложение может работать, но перестать принимать новые request во время shutdown."}
        </Lead>

        <div className="lesson-practice-steps">
          <h3>{"Live"}</h3>
          <p>{"Процесс способен быстро ответить."}</p>
          <h3>{"Ready"}</h3>
          <p>{"Можно направлять пользовательский traffic."}</p>
          <h3>{"Draining"}</h3>
          <p>{"Идёт завершение без новых операций."}</p>
        </div>

        <CodeBlock
          caption={"минимальная модель или команда"}
          code={"liveness:  процесс и event loop живы?\nreadiness: критические зависимости доступны?\nshutdown:  новые request прекращены, ресурсы закрываются?"}
        />

        <TypeCards>
          <TypeCard badge={"live"} title={"Liveness"} code={"GET /health"}>
            {"Быстрый ответ без тяжёлых зависимостей."}
          </TypeCard>
          <TypeCard badge={"ready"} badgeTone="float" title={"Readiness"} code={"GET /ready"}>
            {"Проверяет критическую готовность."}
          </TypeCard>
          <TypeCard badge={"stop"} badgeTone="str" title={"Shutdown"} code={"SIGTERM → cleanup"}>
            {"Освобождает ресурсы и завершает процесс."}
          </TypeCard>
        </TypeCards>

        <Callout tone="info">
          {"HTTP 200 от `/health` не означает, что database connection работает. Для этого существует отдельная readiness-проверка."}
        </Callout>
      </Section>

      <Section number={"02"} title={"/health должен быть быстрым"}>
        <Lead>
          {"Liveness endpoint подтверждает, что приложение способно обработать простой request. Он не строит отчёт, не читает все таблицы и не обращается к внешним сервисам без необходимости."}
        </Lead>

        <div className="lesson-practice-steps">
          <h3>{"Вход"}</h3>
          <p>{"Обычный GET без body."}</p>
          <h3>{"Работа"}</h3>
          <p>{"Минимальная функция без тяжёлого I/O."}</p>
          <h3>{"Ответ"}</h3>
          <p>{"Стабильный status для автоматической проверки."}</p>
        </div>

        <CodeBlock
          caption={"минимальная модель или команда"}
          code={"from fastapi import FastAPI\n\napp = FastAPI()\n\n@app.get(\"/health\")\ndef health() -> dict[str, str]:\n    return {\"status\": \"ok\"}"}
        />

        <CompareSolutions
          question={"Какой вариант оставляет более ясную и воспроизводимую границу?"}
          left={{
            title: "Тяжёлый health",
            code: "SELECT * FROM tasks; call external API; build report",
            note: "Проверка сама создаёт нагрузку и новые точки отказа.",
          }}
          right={{
            title: "Минимальный health",
            code: "return {\"status\": \"ok\"}",
            note: "Отвечает только на вопрос liveness.",
          }}
          preferred="right"
          explanation={"Liveness должна быть быстрой, дешёвой и предсказуемой."}
        />

        <Callout tone="info">
          {"Не включайте version, secrets и полный config в публичный health-response."}
        </Callout>
      </Section>

      <Section number={"03"} title={"/ready проверяет критическую зависимость"}>
        <Lead>
          {"Readiness может выполнить короткий запрос `SELECT 1` к основной базе. При недоступности зависимости endpoint возвращает состояние not ready, и traffic не должен направляться в приложение."}
        </Lead>

        <div className="lesson-practice-steps">
          <h3>{"Dependency"}</h3>
          <p>{"Получить session стандартным способом."}</p>
          <h3>{"Probe"}</h3>
          <p>{"Выполнить короткую проверку соединения."}</p>
          <h3>{"Outcome"}</h3>
          <p>{"Готовность зависит от критической базы."}</p>
        </div>

        <CodeBlock
          caption={"минимальная модель или команда"}
          code={"from sqlalchemy import text\n\n@app.get(\"/ready\")\nasync def ready(db: AsyncSession = Depends(get_db)):\n    await db.execute(text(\"SELECT 1\"))\n    return {\"status\": \"ready\"}"}
        />

        <BranchExplorer
          code={"if app_is_starting:\n    return 503, \"starting\"\nelif database_unavailable:\n    return 503, \"not_ready\"\nelif app_is_draining:\n    return 503, \"draining\"\nelse:\n    return 200, \"ready\""}
          scenarios={[
            { label: "startup ещё идёт", activeLine: 1, output: "503 starting" },
            { label: "database недоступна", activeLine: 3, output: "503 not_ready" },
            { label: "получен SIGTERM", activeLine: 5, output: "503 draining" },
            { label: "все зависимости готовы", activeLine: 7, output: "200 ready" },
          ]}
        />

        <Callout tone="info">
          {"Ошибка readiness должна попадать в лог без утечки DATABASE_URL и password."}
        </Callout>
      </Section>

      <Section number={"04"} title={"Lifecycle: startup, running, draining, stopped"}>
        <Lead>
          {"Состояния полезно представить как конечный маршрут. После startup приложение становится ready. После сигнала завершения оно переходит в draining, прекращает новые операции и закрывает ресурсы."}
        </Lead>

        <div className="lesson-practice-steps">
          <h3>{"Starting"}</h3>
          <p>{"Загрузка config и подключение ресурсов."}</p>
          <h3>{"Running"}</h3>
          <p>{"Health и ready отвечают успешно."}</p>
          <h3>{"Draining"}</h3>
          <p>{"Новые request не принимаются."}</p>
          <h3>{"Stopped"}</h3>
          <p>{"Процесс завершён после cleanup."}</p>
        </div>

        <CodeBlock
          caption={"минимальная модель или команда"}
          code={"starting\n→ running + ready\n→ SIGTERM\n→ draining + not ready\n→ close resources\n→ stopped"}
        />

        <StepThrough
          code={"starting → running → draining → stopped"}
          steps={[
            { line: 0, note: "Проверяется обязательный config.", vars: {"state": "starting"} },
            { line: 1, note: "Инициализируется engine/client.", vars: {"state": "running", "ready": "true"} },
            { line: 2, note: "Начинается shutdown.", vars: {"state": "draining", "ready": "false"} },
            { line: 3, note: "Закрываются pools и clients.", vars: {"state": "stopped"} },
          ]}
        />

        <Callout tone="info">
          {"Graceful shutdown имеет ограниченное время. Долгая операция не должна удерживать процесс бесконечно."}
        </Callout>
      </Section>

      <Section number={"05"} title={"FastAPI lifespan задаёт границу ресурсов"}>
        <Lead>
          {"Lifespan выполняет код до начала обслуживания и после завершения. В блоке `yield` приложение работает; после `yield` закрываются engine и внешние clients."}
        </Lead>

        <div className="lesson-practice-steps">
          <h3>{"До yield"}</h3>
          <p>{"Startup-подготовка."}</p>
          <h3>{"Yield"}</h3>
          <p>{"Период обслуживания request."}</p>
          <h3>{"После yield"}</h3>
          <p>{"Shutdown и cleanup."}</p>
        </div>

        <CodeBlock
          caption={"минимальная модель или команда"}
          code={"from contextlib import asynccontextmanager\nfrom fastapi import FastAPI\n\n@asynccontextmanager\nasync def lifespan(app: FastAPI):\n    logger.info(\"application_starting\")\n    yield\n    logger.info(\"application_stopping\")\n    await engine.dispose()\n\napp = FastAPI(lifespan=lifespan)"}
        />

        <FillBlank
          prompt={"Какое действие освобождает pool SQLAlchemy?"}
          before={"await engine."}
          after={"()"}
          options={["dispose", "execute", "refresh"]}
          answer={"dispose"}
          explanation={"`dispose()` закрывает соединения engine во время shutdown."}
        />

        <Callout tone="info">
          {"При использовании lifespan не дублируйте ту же инициализацию в старых startup/shutdown handlers."}
        </Callout>
      </Section>

      <Section number={"06"} title={"SIGTERM запускает управляемое завершение"}>
        <Lead>
          {"Uvicorn принимает системный сигнал и инициирует shutdown приложения. Логи должны показать последовательность: signal → draining → lifespan cleanup → process stopped."}
        </Lead>

        <div className="lesson-practice-steps">
          <h3>{"Signal"}</h3>
          <p>{"ОС просит процесс завершиться."}</p>
          <h3>{"Server"}</h3>
          <p>{"Uvicorn прекращает принимать новые соединения."}</p>
          <h3>{"Application"}</h3>
          <p>{"Lifespan закрывает ресурсы."}</p>
        </div>

        <CodeBlock
          caption={"минимальная модель или команда"}
          code={"kill -TERM \"$PID\"\n\nINFO shutdown_requested signal=SIGTERM\nINFO readiness_changed ready=false\nINFO database_engine_disposed\nINFO application_stopped"}
        />

        <TrueFalse
          statement={<>{"После SIGTERM корректное приложение должно немедленно исчезнуть без выполнения cleanup."}</>}
          isTrue={false}
          explanation={"SIGTERM предназначен для управляемого завершения; приложение получает возможность выполнить shutdown-процедуру."}
        />

        <Callout tone="info">
          {"SIGKILL не запускает lifespan cleanup. Он остаётся последней мерой для зависшего процесса."}
        </Callout>
      </Section>

      <Section number={"07"} title={"Проверяем success и отказ базы"}>
        <Lead>
          {"Контрольный сценарий включает четыре состояния: оба endpoint отвечают 200; база недоступна — health 200, ready 503; shutdown — ready 503; после остановки соединение отклоняется."}
        </Lead>

        <div className="lesson-practice-steps">
          <h3>{"Нормально"}</h3>
          <p>{"health=200, ready=200."}</p>
          <h3>{"DB down"}</h3>
          <p>{"health=200, ready=503."}</p>
          <h3>{"Draining"}</h3>
          <p>{"ready=503 до остановки."}</p>
          <h3>{"Stopped"}</h3>
          <p>{"TCP connection больше не устанавливается."}</p>
        </div>

        <CodeBlock
          caption={"минимальная модель или команда"}
          code={"curl -fsS http://127.0.0.1:8000/health\ncurl -i http://127.0.0.1:8000/ready\nkill -TERM \"$PID\"\ncurl -i http://127.0.0.1:8000/health"}
        />

        <BugHunt
          code={"@app.get(\"/health\")\nasync def health(db: AsyncSession = Depends(get_db)):\n    tasks = (await db.execute(select(TaskModel))).scalars().all()\n    return {\"status\": \"ok\", \"tasks\": len(tasks)}"}
          question={"Почему такой healthcheck неудачен?"}
          options={[
            "Он выполняет тяжёлый бизнес-запрос и зависит от содержимого tasks",
            "FastAPI запрещает async endpoints",
            "health обязан возвращать HTML",
          ]}
          correctIndex={0}
          explanation={"Liveness должна быть быстрой и не зависеть от полной выборки данных."}
          fix={"@app.get(\"/health\")\ndef health():\n    return {\"status\": \"ok\"}"}
        />

        <Callout tone="info">
          {"Отдельная readiness-проверка может зависеть от базы, но остаётся короткой и ограниченной по времени."}
        </Callout>
      </Section>

      <Section number={"08"} title={"Контрольная точка и проектный результат"}>
        <Lead>
          {"Завершите занятие не чтением, а воспроизводимой проверкой: выполните основной сценарий, намеренно создайте ожидаемый сбой, устраните его по наблюдаемым данным и зафиксируйте процедуру в Linux-runbook."}
        </Lead>

        <div className="lesson-check-group">
          <QuizCard
            question={"Что проверяет liveness?"}
            options={[
              "процесс способен быстро ответить",
              "все бизнес-данные корректны",
              "пользователь авторизован",
            ]}
            correctIndex={0}
            explanation={"Правильный ответ следует из модели урока и проверяется конкретной командой, состоянием процесса или HTTP-result."}
          />
          <QuizCard
            question={"Что происходит при недоступной базе?"}
            options={[
              "health может быть 200, ready — 503",
              "оба всегда 200",
              "процесс обязан удалить базу",
            ]}
            correctIndex={0}
            explanation={"Правильный ответ следует из модели урока и проверяется конкретной командой, состоянием процесса или HTTP-result."}
          />
          <QuizCard
            question={"Где выполняется cleanup lifespan?"}
            options={[
              "после yield",
              "до объявления функции",
              "в response model",
            ]}
            correctIndex={0}
            explanation={"Правильный ответ следует из модели урока и проверяется конкретной командой, состоянием процесса или HTTP-result."}
          />
          <QuizCard
            question={"Какой сигнал запускает штатный shutdown?"}
            options={[
              "SIGTERM",
              "SIGKILL только",
              "никакой",
            ]}
            correctIndex={0}
            explanation={"Правильный ответ следует из модели урока и проверяется конкретной командой, состоянием процесса или HTTP-result."}
          />
        </div>

        <MethodGrid
          rows={[
            [<>Команда</>, "может быть скопирована и выполнена без догадки"],
            [<>Ожидаемый результат</>, "показывает, как выглядит успешное состояние"],
            [<>Ошибочный сценарий</>, "воспроизводится безопасно и имеет наблюдаемый симптом"],
            [<>Исправление</>, "устраняет причину и заканчивается повторной проверкой"],
          ]}
        />

        <div className="execution-example">
          <CodeBlock
            caption={"liveness и readiness"}
            code={"curl -i http://127.0.0.1:8000/health\ncurl -i http://127.0.0.1:8000/ready"}
          />
          <TerminalDemo
            title={"контрольный прогон"}
            lines={[
              { cmd: "curl -fsS http://127.0.0.1:8000/health" },
              { out: "{\"status\":\"ok\"}" },
              { cmd: "curl -fsS http://127.0.0.1:8000/ready" },
              { out: "{\"status\":\"ready\"}" },
            ]}
          />
        </div>

        <RecallCard
          question={"Какой наблюдаемый факт доказывает, что основной сценарий этого занятия выполнен корректно?"}
          hint={"Назовите команду, ожидаемый output и отличие от ошибочного состояния."}
          answer={<p>{"Готовность подтверждается не отсутствием ошибок на глаз, а конкретной командой и ожидаемым результатом, записанными в runbook."}</p>}
        />

        <KeyTakeaways
          points={[
            <>{"Liveness и readiness отвечают на разные вопросы."}</>,
            <>{"`/health` остаётся быстрым и дешёвым."}</>,
            <>{"`/ready` проверяет критическую зависимость."}</>,
            <>{"Lifecycle включает starting, running, draining и stopped."}</>,
            <>{"Lifespan задаёт startup и cleanup ресурсов."}</>,
            <>{"SIGTERM инициирует graceful shutdown."}</>,
            <>{"Failure базы проверяется отдельным сценарием."}</>,
          ]}
        />

        <div className="lesson-practice-steps">
          <h3>{"Артефакт"}</h3>
          <p>{"Обновлён `docs/runbook-linux.md` и сохранён проверяемый результат занятия."}</p>
          <h3>{"Проверка сбоя"}</h3>
          <p>{"Есть минимум один намеренно созданный ошибочный сценарий и объяснение причины по наблюдаемым данным."}</p>
          <h3>{"Git"}</h3>
          <p>{"Изменение оформлено отдельным commit с узким техническим смыслом."}</p>
        </div>

        <PracticeCta text={"Добавьте `/health`, `/ready` и lifespan cleanup. В runbook опишите ожидаемые status при рабочей и недоступной базе, а также последовательность логов после SIGTERM."} />
      </Section>

    </RichLesson>
  );
}
