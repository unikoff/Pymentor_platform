import { Mail, Workflow } from "lucide-react";
import { BugHunt, Callout, CodeBlock, CodeSequence, CompareSolutions, FillBlank, FlipCards, KeyTakeaways, Lead, PracticeCta, QuizCard, RecallCard, RichHero, RichLesson, Section, TerminalDemo, TrueFalse } from "../../shared";
import { TheoryBridge } from "../../shared";
const BLOCK_TITLE = "Блок 35 · Redis, кеш и фоновые операции";

export function Lesson205({ module }: { module?: string }) {
  return (
    <RichLesson>
      <RichHero
        variant="project"
        chip={module ?? BLOCK_TITLE}
        title={"BackgroundTasks и действие после response"}
        intro={
          "Убираем короткое некритичное уведомление из основного request path: после успешного enrollment commit возвращаем response, а FastAPI BackgroundTasks записывает mock-email в лог или файл, не меняя результат transaction."
        }
        tags={[
          { icon: <Mail size={14} />, label: "mock-уведомление" },
          { icon: <Workflow size={14} />, label: "response → background" },
        ]}
      />
      <TheoryBridge link={"Rate-limit endpoint уже защищает частый action. Теперь другой пользовательский сценарий — enrollment — получает дополнительную работу, которая полезна, но не должна задерживать основной HTTP response."} boundary={"BackgroundTasks не является durable queue. Долгие, критичные, повторяемые jobs и гарантированная доставка требуют отдельного worker/queue и остаются за рамками курса."} />

      <Section number={"01"} title={"Что не должно задерживать enrollment"}>
        <Lead>
          {
            "Главный результат POST /courses/{id}/enrollments — зафиксированная запись Enrollment. Mock-email является вторичным действием: если он занимает 300 мс, клиент не должен ждать эти 300 мс после успешной transaction."
          }
        </Lead>

        <div className="lesson-route">
          <ol>
            <li>
              <strong>{"Зафиксировать:"}</strong>{" "}
              {"создать enrollment и выполнить commit"}
            </li>
            <li>
              <strong>{"Запланировать:"}</strong>{" "}
              {"добавить короткую background function"}
            </li>
            <li>
              <strong>{"Ответить:"}</strong> {"вернуть EnrollmentRead клиенту"}
            </li>
            <li>
              <strong>{"Наблюдать:"}</strong>{" "}
              {"проверить background log и отдельную ошибку"}
            </li>
          </ol>
          <p>
            {
              "Результат урока — enrollment endpoint, где product transaction и некритичное уведомление имеют разные границы."
            }
          </p>
        </div>

        <Callout tone={"info"}>
          {
            "Сначала должен быть успешный business result. Background task нельзя добавлять до commit, иначе уведомление может сообщить о зачислении, которого нет."
          }
        </Callout>
      </Section>

      <Section number={"02"} title={"Синхронный путь против background action"}>
        <Lead>
          {
            "Обычный await send_mock_email внутри endpoint задерживает response. BackgroundTasks сохраняет callable и arguments, а FastAPI запускает действие после отправки response в рамках того же процесса."
          }
        </Lead>

        <CompareSolutions
          question={"Где выполнять некритичное уведомление?"}
          left={{
            title: "В request path",
            code: `enrollment = await create()
        await send_email(enrollment)
        return enrollment`,
            note: "Клиент ждёт завершения email operation.",
          }}
          right={{
            title: "После response",
            code: `enrollment = await create()
        background_tasks.add_task(send_email, enrollment.id)
        return enrollment`,
            note: "Основной response не зависит от длительности уведомления.",
          }}
          preferred={"right"}
          explanation={
            "Для короткого некритичного mock-email встроенный background mechanism уменьшает latency основного сценария."
          }
        />
      </Section>

      <Section number={"03"} title={"Правильный порядок transaction → task"}>
        <Lead>
          {
            "Background action получает только устойчивые идентификаторы и простые данные. Нельзя передавать открытую AsyncSession или ORM object, жизненный цикл которых связан с завершившимся request."
          }
        </Lead>

        <CodeSequence
          title={"Соберите enrollment endpoint"}
          prompt={"Расположите действия в безопасном порядке."}
          pieces={[
            {
              id: "validate",
              code: "проверить course и отсутствие enrollment",
            },
            { id: "create", code: "создать Enrollment ORM object" },
            { id: "commit", code: "await session.commit()" },
            { id: "refresh", code: "await session.refresh(enrollment)" },
            {
              id: "task",
              code: "background_tasks.add_task(write_mock_email, enrollment.id)",
            },
            {
              id: "return",
              code: "return EnrollmentRead.model_validate(enrollment)",
            },
            {
              id: "wrong",
              code: "add_task(..., session)",
              note: "request dependency уже завершится",
            },
          ]}
          correctOrder={[
            "validate",
            "create",
            "commit",
            "refresh",
            "task",
            "return",
          ]}
          explanation={
            "Task добавляется после commit и получает устойчивый enrollment_id."
          }
        />
      </Section>

      <Section number={"04"} title={"Background function и endpoint"}>
        <Lead>
          {
            "Background function должна быть небольшой и самостоятельной. Учебный вариант записывает событие в append-only log file. Function сама обрабатывает ожидаемую ошибку и не раскрывает токены или персональные данные."
          }
        </Lead>

        <CodeBlock
          caption={"короткий mock-notification"}
          code={`from pathlib import Path
        from datetime import datetime, timezone
        
        NOTIFICATION_LOG = Path("var/mock_notifications.log")
        
        
        def write_enrollment_notification(
            enrollment_id: int,
            user_email: str,
        ) -> None:
            timestamp = datetime.now(timezone.utc).isoformat()
            line = (
                f"{timestamp} enrollment={enrollment_id} "
                f"recipient={user_email}\n"
            )
            NOTIFICATION_LOG.parent.mkdir(parents=True, exist_ok=True)
            with NOTIFICATION_LOG.open("a", encoding="utf-8") as file:
                file.write(line)`}
        />

        <Callout>
          {
            "В реальном проекте email provider является внешней dependency. Здесь файл нужен только для наблюдаемого результата без новой инфраструктуры."
          }
        </Callout>

        <Lead>
          {
            "FastAPI инжектирует объект BackgroundTasks в endpoint. После commit endpoint добавляет функцию и аргументы. HTTP response возвращает enrollment независимо от того, когда именно будет записана строка."
          }
        </Lead>

        <CodeBlock
          caption={"task добавляется после service commit"}
          code={`from fastapi import BackgroundTasks
        
        @router.post("/courses/{course_id}/enrollments")
        async def enroll(
            course_id: int,
            background_tasks: BackgroundTasks,
            current_user: CurrentUser,
            session: AsyncSessionDep,
        ) -> EnrollmentRead:
            enrollment = await enrollment_service.create(
                session=session,
                course_id=course_id,
                user_id=current_user.id,
            )
        
            background_tasks.add_task(
                write_enrollment_notification,
                enrollment.id,
                current_user.email,
            )
        
            return EnrollmentRead.model_validate(enrollment)`}
        />

        <FillBlank
          prompt={
            "Какой объект передаётся endpoint для регистрации работы после response?"
          }
          before={"background_tasks: "}
          after={""}
          options={["BackgroundTasks", "AsyncSession", "Redis"]}
          answer={"BackgroundTasks"}
          explanation={"FastAPI создаёт контейнер задач для текущего response."}
        />
      </Section>

      <Section number={"05"} title={"Ошибки фоновой операции"}>
        <Lead>
          {
            "Response уже отправлен, поэтому background exception не может превратить его в HTTP 500. Ошибка должна попасть в logger с operation и enrollment_id. Клиент может получить 201, даже если mock-email затем не записался."
          }
        </Lead>

        <BugHunt
          code={`def write_notification(enrollment_id: int):
            provider.send(enrollment_id)
        
        # нет try/except и контекстного log`}
          question={"Что потеряется при ошибке provider?"}
          options={[
            "Наблюдаемая причина и идентификатор операции",
            "Enrollment автоматически откатится",
            "HTTP request станет GET",
          ]}
          correctIndex={0}
          explanation={
            "После response ошибка должна быть диагностируема по server log."
          }
          fix={`def write_notification(enrollment_id: int):
            try:
                provider.send(enrollment_id)
            except ProviderError:
                logger.exception(
                    "background notification failed",
                    extra={"enrollment_id": enrollment_id},
                )`}
        />

        <Callout>
          {
            "Не перехватывайте BaseException и не скрывайте проблему пустым except. Background failure должен быть виден в logs и tests."
          }
        </Callout>
      </Section>

      <Section number={"06"} title={"Граница встроенного механизма"}>
        <Lead>
          {
            "BackgroundTasks выполняется в процессе API. Перезапуск process может потерять незавершённое действие, нет отдельного retry broker и независимого scaling. Поэтому механизм подходит только для короткой best-effort работы."
          }
        </Lead>

        <FlipCards
          cards={[
            {
              front: "Короткий audit/mock log",
              back: "Подходит: быстро, некритично, результат наблюдаем.",
            },
            {
              front: "Отправка обязательного платежа",
              back: "Не подходит: нужна гарантированная доставка, retry и отдельный worker.",
            },
            {
              front: "Пересчёт отчёта на 20 минут",
              back: "Не подходит: долгий job конкурирует с API process.",
            },
            {
              front: "Удаление временного файла",
              back: "Может подходить, если потеря cleanup допустима и есть дополнительная уборка.",
            },
          ]}
        />

        <TrueFalse
          statement={
            <>
              {
                "BackgroundTasks гарантирует выполнение после аварийного завершения API process."
              }
            </>
          }
          isTrue={false}
          explanation={
            "Встроенный механизм не является durable queue и не переживает потерю процесса."
          }
        />
      </Section>

      <Section number={"07"} title={"Измеряем response и наблюдаем task"}>
        <Lead>
          {
            "Проверка разделяет два результата: HTTP response должен прийти быстро и содержать enrollment; затем notification log должен получить строку. Для демонстрации background function может намеренно sleep 0.3 секунды."
          }
        </Lead>

        <TerminalDemo
          title={"response раньше mock-notification"}
          lines={[
            {
              cmd: `curl -s -w "response=%{time_total}\n" -X POST http://localhost:8000/courses/42/enrollments`,
            },
            {
              out: `{"id":91,"course_id":42,"status":"active"}
        response=0.047`,
            },
            { cmd: `tail -n 1 var/mock_notifications.log` },
            {
              out: `2026-07-21T... enrollment=91 recipient=student@example.test`,
            },
          ]}
        />

        <RecallCard
          question={
            "Какой результат является главным, если background notification упала?"
          }
          hint={"Сначала определите transaction boundary."}
          answer={
            <p>
              {
                "Успешно committed Enrollment остаётся главным product result. Ошибка уведомления фиксируется отдельно и не переписывает уже отправленный response."
              }
            </p>
          }
        />
      </Section>

      <Section number={"08"} title={"Контрольная точка: BackgroundTasks"}>
        <Lead>
          {
            "Проверьте не только знание команд, но и способность проследить путь данных, назвать source of truth, предсказать режим деградации и объяснить результат теста без чтения готового ответа."
          }
        </Lead>

        <div className="lesson-check-group">
          <QuizCard
            question={"Когда добавлять notification task?"}
            options={[
              "После успешного enrollment commit",
              "До проверки course",
              "В middleware для всех requests",
            ]}
            correctIndex={0}
            explanation={
              "Task должен соответствовать существующему product fact."
            }
          />
          <QuizCard
            question={"Что передавать task вместо session?"}
            options={[
              "Устойчивый id и простые данные",
              "Открытую AsyncSession",
              "Response object",
            ]}
            correctIndex={0}
            explanation={"Request-scoped dependencies могут быть уже закрыты."}
          />
          <QuizCard
            question={
              "Может ли background exception изменить отправленный 201?"
            }
            options={["Нет", "Всегда да", "Только через Redis TTL"]}
            correctIndex={0}
            explanation={"Response уже отправлен клиенту."}
          />
          <QuizCard
            question={"Для чего BackgroundTasks не подходит?"}
            options={[
              "Для критичного durable job с retries",
              "Для короткого mock-log",
              "Для best-effort cleanup",
            ]}
            correctIndex={0}
            explanation={
              "Гарантированная работа требует внешней очереди и worker."
            }
          />
        </div>

        <KeyTakeaways
          points={[
            <>
              {
                "Product transaction завершается до регистрации background action."
              }
            </>,
            <>
              {"BackgroundTasks выполняет callable после отправки response."}
            </>,
            <>
              {
                "Task получает устойчивые ids, а не request-scoped session или ORM object."
              }
            </>,
            <>
              {
                "Background error логируется отдельно и не меняет уже отправленный response."
              }
            </>,
            <>
              {
                "Механизм подходит только для короткой некритичной best-effort работы."
              }
            </>,
            <>
              {"Перезапуск API может потерять незавершённую встроенную задачу."}
            </>,
            <>
              {
                "Проверка разделяет latency response и наблюдаемый результат task."
              }
            </>,
          ]}
        />

        <PracticeCta
          text={
            "После успешного enrollment commit добавьте BackgroundTasks, который записывает mock-email в var/mock_notifications.log. Передавайте enrollment_id и email, измерьте response latency, намеренно вызовите ProviderError и подтвердите: Enrollment сохранён, клиент получил 201, ошибка видна в server log."
          }
        />
      </Section>
    </RichLesson>
  );
}
