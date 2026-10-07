import { GitFork, ShieldCheck } from "lucide-react";
import { BranchExplorer, BugHunt, Callout, CodeBlock, CodeSequence, CompareSolutions, FillBlank, FlipCards, KeyTakeaways, Lead, MatchPairs, MethodGrid, PracticeCta, QuizCard, RecallCard, RichHero, RichLesson, Section, StepThrough, TerminalDemo, TrueFalse, TypeCard, TypeCards } from "../../shared";
const BLOCK_TITLE = "Блок 28 · Async SQLAlchemy, нагрузка и наблюдаемость";

export function Lesson162({ module }: { module?: string }) {
  return (
    <RichLesson>
      <RichHero
        variant="project"
        chip={module ?? BLOCK_TITLE}
        title={"Асинхронные транзакции и rollback"}
        intro={"Перенесём знакомую транзакционную модель на AsyncSession: несколько связанных изменений либо фиксируются вместе, либо полностью отменяются. Разберём границу commit, flush, IntegrityError и состояние session после сбоя."}
        tags={[
          { icon: <ShieldCheck size={14} />, label: "атомарная операция" },
          { icon: <GitFork size={14} />, label: "rollback после ошибки" },
        ]}
      />

      <Callout tone="info">
        <strong>Связь с этапом.</strong>
        {" На синхронном этапе StudyHub уже использовал транзакции. Асинхронный API не меняет смысл атомарности: await появляется у операций ввода-вывода, а бизнес-операция по-прежнему имеет одну границу успеха. "}
        <strong>Важно не перепутать:</strong>
        {" async with session.begin() не делает любое содержимое безопасным автоматически. Внутри транзакции не следует выполнять долгий внешний HTTP-запрос или другую работу, которая зря удерживает соединение."}
      </Callout>

      <Section number="01" title="Зачем эта тема появляется сейчас">
        <Lead>
          {"Перенесём знакомую транзакционную модель на AsyncSession: несколько связанных изменений либо фиксируются вместе, либо полностью отменяются. Разберём границу commit, flush, IntegrityError и состояние session после сбоя."}
        </Lead>

        <div className="lesson-route">
          <ol>
            <li>
              <strong>{"Назвать единицу работы: "}</strong>
              {"задача и запись аудита должны появиться как один результат."}
            </li>
            <li>
              <strong>{"Открыть транзакцию: "}</strong>
              {"использовать async with session.begin() вокруг связанных изменений."}
            </li>
            <li>
              <strong>{"Получить промежуточный id: "}</strong>
              {"вызвать await session.flush() без преждевременного commit."}
            </li>
            <li>
              <strong>{"Смоделировать сбой: "}</strong>
              {"нарушить ограничение и проверить отсутствие обеих записей."}
            </li>
          </ol>
          <p>
            {"Итог занятия — проверяемое изменение Async StudyHub, а не отдельный фрагмент синтаксиса."}
          </p>
        </div>

        <TypeCards>
          <TypeCard
            badge={"BEGIN"}
            title={"Начало общей операции"}
          >
            {"Все изменения до выхода из блока принадлежат одной транзакции."}
          </TypeCard>
          <TypeCard
            badge={"FLUSH"}
            badgeTone={"float"}
            title={"SQL до commit"}
          >
            {"flush отправляет накопленные изменения базе и позволяет получить id, но не завершает транзакцию."}
          </TypeCard>
          <TypeCard
            badge={"ROLLBACK"}
            badgeTone={"str"}
            title={"Отмена всей единицы"}
          >
            {"После ошибки база возвращается к состоянию до начала транзакции."}
          </TypeCard>
        </TypeCards>

        <div className="lesson-practice-steps">
          <h3>{"До изменения"}</h3>
          <p>
            {"Зафиксируйте работающий сценарий и сохраните синхронную реализацию как контрольную точку."}
          </p>
          <h3>{"Во время изменения"}</h3>
          <p>
            {"Меняйте один инфраструктурный слой и наблюдайте конкретный эффект в логах, тестах или результате запроса."}
          </p>
          <h3>{"После изменения"}</h3>
          <p>
            {"Повторите успешный и ошибочный сценарии, затем объясните, что именно стало асинхронным."}
          </p>
        </div>

        <RecallCard
          question={"Какую наблюдаемую проблему решает занятие 162?"}
          hint={"Назовите исходный риск, одно изменение и способ проверки."}
          answer={
            <p>
              {"задача и запись аудита должны появиться как один результат; затем результат подтверждается воспроизводимой проверкой."}
            </p>
          }
        />
      </Section>

      <Section number="02" title="Главная модель и роли объектов">
        <Lead>
          {"Сначала разложим механизм на роли. Так новый async API читается как продолжение знакомого SQLAlchemy, а не как набор магических await."}
        </Lead>

        <MethodGrid
          rows={[
            [<>{"session.add(object)"}</>, "помещает ORM-объект в unit of work; await не нужен"],
            [<>{"await session.flush()"}</>, "выполняет текущие INSERT/UPDATE внутри открытой транзакции"],
            [<>{"async with session.begin()"}</>, "задаёт общую границу commit или rollback"],
            [<>{"await session.rollback()"}</>, "явно восстанавливает session после ошибки вне managed-блока"],
            [<>{"IntegrityError"}</>, "сообщает о нарушении UNIQUE, FK, CHECK или другого ограничения"],
          ]}
        />

        <MatchPairs
          prompt={"Соедините инструмент и его ответственность в этом занятии."}
          leftTitle={"Инструмент"}
          rightTitle={"Ответственность"}
          pairs={[
            {
              left: "session.add(object)",
              right: "помещает ORM-объект в unit of work; await не нужен",
            },
            {
              left: "await session.flush()",
              right: "выполняет текущие INSERT/UPDATE внутри открытой транзакции",
            },
            {
              left: "async with session.begin()",
              right: "задаёт общую границу commit или rollback",
            },
            {
              left: "await session.rollback()",
              right: "явно восстанавливает session после ошибки вне managed-блока",
            },
            {
              left: "IntegrityError",
              right: "сообщает о нарушении UNIQUE, FK, CHECK или другого ограничения",
            },
          ]}
          explanation={"Пара считается понятой, когда вы можете назвать момент использования и границу ответственности."}
        />

        <div className="lesson-practice-steps">
          <h3>{"Читайте слева направо"}</h3>
          <p>
            {"Сначала создаётся statement или объект конфигурации, затем I/O запускается в явной точке await."}
          </p>
          <h3>{"Отделяйте локальную работу"}</h3>
          <p>
            {"Создание ORM-объекта и построение statement не требуют connection, пока не началась операция с базой."}
          </p>
          <h3>{"Следите за жизненным циклом"}</h3>
          <p>
            {"Session и connection имеют ограниченный срок жизни и не должны превращаться в глобальное состояние."}
          </p>
          <h3>{"Фиксируйте границу ошибки"}</h3>
          <p>
            {"Ожидаемый database-сбой переводится в понятный контракт, но неожиданный дефект не скрывается."}
          </p>
        </div>

        <TrueFalse
          statement={
            <>
              {"Добавление async def само по себе гарантирует ускорение database endpoint."}
            </>
          }
          isTrue={false}
          explanation={"Производительность зависит от характера I/O, SQL, pool, транзакций и нагрузки; её подтверждают измерением."}
        />
      </Section>

      <Section number="03" title={"Одна задача и одно событие аудита"}>
        <Lead>
          {"Разберём минимальный рабочий пример построчно. До запуска предскажите, где появляется реальное обращение к PostgreSQL и какой объект остаётся локальным."}
        </Lead>

        <CodeBlock
          caption={"минимальный рабочий пример"}
          code={"from sqlalchemy.ext.asyncio import AsyncSession\n\nfrom app.models import AuditEventModel, TaskModel\nfrom app.schemas import TaskCreate\n\n\nasync def create_task_with_audit(\n    session: AsyncSession,\n    payload: TaskCreate,\n    owner_id: int,\n) -> TaskModel:\n    async with session.begin():\n        task = TaskModel(\n            title=payload.title,\n            owner_id=owner_id,\n            is_done=False,\n        )\n        session.add(task)\n        await session.flush()\n\n        event = AuditEventModel(\n            action=\"task.created\",\n            task_id=task.id,\n            actor_id=owner_id,\n        )\n        session.add(event)\n\n    return task"}
        />

        <StepThrough
          code={"from sqlalchemy.ext.asyncio import AsyncSession\n\nfrom app.models import AuditEventModel, TaskModel\nfrom app.schemas import TaskCreate\n\n\nasync def create_task_with_audit(\n    session: AsyncSession,\n    payload: TaskCreate,\n    owner_id: int,\n) -> TaskModel:\n    async with session.begin():\n        task = TaskModel(\n            title=payload.title,\n            owner_id=owner_id,\n            is_done=False,\n        )\n        session.add(task)\n        await session.flush()\n\n        event = AuditEventModel(\n            action=\"task.created\",\n            task_id=task.id,\n            actor_id=owner_id,\n        )\n        session.add(event)\n\n    return task"}
          steps={[
            {
              line: 0,
              note: "Endpoint передаёт одну request-scoped AsyncSession.",
              vars: {
                "session": "open",
              },
            },
            {
              line: 7,
              note: "Контекст begin открывает общую транзакцию.",
              vars: {
                "transaction": "active",
              },
            },
            {
              line: 13,
              note: "Task добавлена в unit of work, но commit ещё не выполнен.",
              vars: {
                "task.id": "None",
              },
            },
            {
              line: 14,
              note: "flush выполняет INSERT и получает id внутри той же транзакции.",
              vars: {
                "task.id": "42",
              },
            },
            {
              line: 22,
              note: "Успешный выход фиксирует Task и AuditEvent вместе.",
              vars: {
                "transaction": "committed",
              },
            },
          ]}
        />

        <FillBlank
          prompt={"Заполните ключевой фрагмент рабочего контракта."}
          before={"async with session."}
          after={"():\n    session.add(task)"}
          options={[
            "begin",
            "commit",
            "execute",
          ]}
          answer={"begin"}
          explanation={"Этот вариант сохраняет явную границу async database I/O."}
        />

        <div className="lesson-practice-steps">
          <h3>{"Предсказать"}</h3>
          <p>
            {"Отметьте строку первого I/O до запуска примера."}
          </p>
          <h3>{"Запустить"}</h3>
          <p>
            {"Выполните пример в отдельном script или тесте с тестовой PostgreSQL-базой."}
          </p>
          <h3>{"Изменить"}</h3>
          <p>
            {"Поменяйте один параметр и заранее запишите ожидаемый эффект."}
          </p>
          <h3>{"Объяснить"}</h3>
          <p>
            {"Назовите объект, который создаётся локально, и операцию, которая требует await."}
          </p>
        </div>
      </Section>

      <Section number="04" title="Сравнение двух реализаций">
        <Lead>
          {"Async-код остаётся качественным только при ясных границах. Сравните варианты по атомарности, времени удержания ресурса и возможности воспроизвести ошибку."}
        </Lead>

        <CompareSolutions
          question={"Какой вариант точнее сохраняет контракт и жизненный цикл ресурса?"}
          left={{
            title: "Скрытая или разорванная граница",
            code: "session.add(task)\nawait session.commit()\n\nsession.add(audit_event)\nawait session.commit()",
            note: "После первого commit задача уже сохранена; ошибка второй записи оставит неполный результат",
          }}
          right={{
            title: "Явный async-контракт",
            code: "async with session.begin():\n    task = TaskModel(title=title, owner_id=owner_id)\n    session.add(task)\n    await session.flush()\n\n    session.add(\n        AuditEventModel(\n            action=\"task.created\",\n            task_id=task.id,\n        )\n    )",
            note: "I/O, cleanup и результат расположены в предсказуемых границах.",
          }}
          preferred="right"
          explanation={"Лучший вариант не просто содержит await, а делает ответственность и время жизни connection/session наблюдаемыми."}
        />

        <div className="lesson-practice-steps">
          <h3>{"Контракт"}</h3>
          <p>
            {"Проверьте, что успешный путь возвращает то же прикладное значение, что и прежняя версия."}
          </p>
          <h3>{"Cleanup"}</h3>
          <p>
            {"Проверьте освобождение session или connection при success, exception и cancellation."}
          </p>
          <h3>{"Измеримость"}</h3>
          <p>
            {"Добавьте лог, тест или счётчик, который подтверждает реальное отличие вариантов."}
          </p>
          <h3>{"Минимальный diff"}</h3>
          <p>
            {"Не переписывайте одновременно schemas, routes, service и database config без необходимости."}
          </p>
        </div>

        <Callout>
          {"async with session.begin() не делает любое содержимое безопасным автоматически. Внутри транзакции не следует выполнять долгий внешний HTTP-запрос или другую работу, которая зря удерживает соединение."}
        </Callout>
      </Section>

      <Section number="05" title="Ожидаемая ошибка и диагностический порядок">
        <Lead>
          {"Ошибка ценна как проверка модели. Сначала определите нарушенное ожидание, затем найдите границу I/O, восстановите ресурс и только после этого формируйте ответ клиенту."}
        </Lead>

        <BugHunt
          code={"session.add(task)\nawait session.commit()\n\nsession.add(audit_event)\nawait session.commit()"}
          question={"Какой дефект здесь наиболее опасен?"}
          options={[
            "После первого commit задача уже сохранена; ошибка второй записи оставит неполный результат",
            "Асинхронный Python запрещает функции длиннее пяти строк",
            "Все SQLAlchemy-методы должны вызываться с await",
          ]}
          correctIndex={0}
          explanation={"Проблема связана с нарушением жизненного цикла или database-контракта, а не с самим словом async."}
          fix={"try:\n    async with session.begin():\n        session.add(task)\n        await session.flush()\n        session.add(audit_event)\nexcept IntegrityError:\n    # managed transaction уже выполнит rollback\n    raise DuplicateTaskError"}
        />

        <RecallCard
          question={"Каков порядок диагностики этого сбоя?"}
          hint={"Симптом → точка await → состояние session/transaction → данные после ошибки."}
          answer={
            <p>
              {"Сначала воспроизведите сбой тестом, найдите конкретную операцию I/O, проверьте состояние ресурса и подтвердите итоговое состояние PostgreSQL отдельным запросом."}
            </p>
          }
        />

        <div className="lesson-practice-steps">
          <h3>{"Симптом"}</h3>
          <p>
            {"Запишите исключение, status code, request_id и последнюю успешную операцию."}
          </p>
          <h3>{"Причина"}</h3>
          <p>
            {"Не начинайте с широкого except; найдите конкретное нарушенное ожидание."}
          </p>
          <h3>{"Восстановление"}</h3>
          <p>
            {"Убедитесь, что session не используется в failed-state и connection возвращается в pool."}
          </p>
          <h3>{"Регрессия"}</h3>
          <p>
            {"Добавьте тест, который падает до исправления и проходит после него."}
          </p>
        </div>
      </Section>

      <Section number="06" title="Встраиваем механизм в Async StudyHub">
        <Lead>
          {"Теперь переносим механизм в сквозной проект. Endpoint остаётся тонкой границей, service выражает сценарий, а database layer отвечает за statement и жизненный цикл session."}
        </Lead>

        <CodeBlock
          caption={"проектное применение"}
          code={"async def transfer_task(\n    session: AsyncSession,\n    task_id: int,\n    new_owner_id: int,\n) -> TaskModel:\n    async with session.begin():\n        task = await session.get(TaskModel, task_id)\n        if task is None:\n            raise TaskNotFoundError(task_id)\n\n        old_owner_id = task.owner_id\n        task.owner_id = new_owner_id\n\n        session.add(\n            AuditEventModel(\n                action=\"task.transferred\",\n                task_id=task.id,\n                actor_id=new_owner_id,\n                details={\n                    \"from\": old_owner_id,\n                    \"to\": new_owner_id,\n                },\n            )\n        )\n\n    return task"}
        />

        <BranchExplorer
          code={"async def transfer_task(\n    session: AsyncSession,\n    task_id: int,\n    new_owner_id: int,\n) -> TaskModel:\n    async with session.begin():\n        task = await session.get(TaskModel, task_id)\n        if task is None:\n            raise TaskNotFoundError(task_id)\n\n        old_owner_id = task.owner_id\n        task.owner_id = new_owner_id\n\n        session.add(\n            AuditEventModel(\n                action=\"task.transferred\",\n                task_id=task.id,\n                actor_id=new_owner_id,\n                details={\n                    \"from\": old_owner_id,\n                    \"to\": new_owner_id,\n                },\n            )\n        )\n\n    return task"}
          scenarios={[
            {
              label: "обе записи корректны",
              activeLine: 2,
              output: "commit: task и audit_event сохранены",
            },
            {
              label: "audit нарушает constraint",
              activeLine: 10,
              output: "rollback: task тоже не появляется",
            },
            {
              label: "task не найдена",
              activeLine: 6,
              output: "исключение до изменения данных",
            },
          ]}
        />

        <TerminalDemo
          title={"проверка проектного изменения"}
          lines={[
            {
              cmd: "pytest -q tests/test_task_transactions.py",
            },
            {
              out: "3 passed",
            },
            {
              cmd: "pytest -q tests/test_task_transactions.py::test_rolls_back_both_rows -vv",
            },
            {
              out: "PASSED: tasks=0, audit_events=0",
            },
          ]}
        />

        <div className="lesson-practice-steps">
          <h3>{"Router"}</h3>
          <p>
            {"Получает dependency и переводит предметные ошибки в стабильные HTTP-ответы."}
          </p>
          <h3>{"Service"}</h3>
          <p>
            {"Координирует один пользовательский сценарий без знания о FastAPI Response."}
          </p>
          <h3>{"Repository или statement"}</h3>
          <p>
            {"Выполняет предсказуемые запросы через переданную AsyncSession."}
          </p>
          <h3>{"Test"}</h3>
          <p>
            {"Подменяет окружение, запускает success/error path и проверяет состояние базы."}
          </p>
        </div>

        <Callout tone="info">
          {"Не удаляйте рабочую sync-ветку до прохождения согласованной регрессии. Миграция выполняется вертикальными slices."}
        </Callout>
      </Section>

      <Section number="07" title="Управляемая практика и самостоятельное изменение">
        <Lead>
          {"Соберите изменение в безопасном порядке. Один шаг должен давать один проверяемый результат и отдельный Git-коммит или понятный diff."}
        </Lead>

        <CodeSequence
          title={"Соберите маршрут проектной работы"}
          prompt={"Расположите действия от исходной проверки до подтверждённого результата."}
          pieces={[
            {
              id: "start",
              code: "открыть session.begin()",
              note: "одна граница операции",
            },
            {
              id: "task",
              code: "добавить Task и выполнить flush",
              note: "получить task.id",
            },
            {
              id: "audit",
              code: "добавить AuditEvent",
              note: "вторая связанная запись",
            },
            {
              id: "break",
              code: "нарушить ограничение в тесте",
              note: "контролируемый сбой",
            },
            {
              id: "verify",
              code: "проверить отсутствие обеих строк",
              note: "доказать rollback",
            },
          ]}
          correctOrder={[
            "start",
            "task",
            "audit",
            "break",
            "verify",
          ]}
          explanation={"Порядок сохраняет рабочую контрольную точку и делает причину ошибки локальной."}
        />

        <FlipCards
          cards={[
            {
              front: <strong>{"Что предсказать до запуска?"}</strong>,
              back: <span>{"Точку первого I/O, число запросов или итоговое состояние transaction."}</span>,
            },
            {
              front: <strong>{"Что изменить самостоятельно?"}</strong>,
              back: <span>{"Один параметр конфигурации, один statement или одну границу ресурса."}</span>,
            },
            {
              front: <strong>{"Что проверить после ошибки?"}</strong>,
              back: <span>{"Состояние базы, session, pool и стабильный API-контракт."}</span>,
            },
            {
              front: <strong>{"Что записать в Git?"}</strong>,
              back: <span>{"Небольшой diff, тест и объяснение измеримого результата."}</span>,
            },
          ]}
        />

        <div className="lesson-practice-steps">
          <h3>{"Минимум"}</h3>
          <p>
            {"Повторите основной пример и добейтесь ожидаемого результата."}
          </p>
          <h3>{"Изменение"}</h3>
          <p>
            {"Поменяйте один параметр, заранее запишите прогноз и сравните его с фактом."}
          </p>
          <h3>{"Ошибка"}</h3>
          <p>
            {"Создайте контролируемый сбой и подтвердите cleanup или rollback."}
          </p>
          <h3>{"Объяснение"}</h3>
          <p>
            {"Нарисуйте путь request → dependency → service → AsyncSession → PostgreSQL → response."}
          </p>
          <h3>{"Коммит"}</h3>
          <p>
            {"Зафиксируйте только завершённый проверяемый шаг без случайных файлов и секретов."}
          </p>
        </div>
      </Section>

      <Section number="08" title="Контрольная точка и критерии готовности">
        <Lead>
          {"Занятие завершено, когда ученик может воспроизвести результат, объяснить механизм и показать отрицательный сценарий без подсказки."}
        </Lead>

        <div className="lesson-check-group">
          <QuizCard
            question={"Зачем нужен flush внутри транзакции?"}
            options={[
              "Получить результат SQL, например новый id, не завершая общую транзакцию",
              "Закрыть session",
              "Создать новый connection pool",
            ]}
            correctIndex={0}
            explanation={"flush синхронизирует текущий unit of work с базой, но commit остаётся общей финальной границей."}
          />
          <QuizCard
            question={"Что должно произойти, если AuditEvent нарушил constraint?"}
            options={[
              "Task и AuditEvent должны отсутствовать",
              "Task должна остаться",
              "Нужно открыть вторую session и продолжить",
            ]}
            correctIndex={0}
            explanation={"Атомарная бизнес-операция либо сохраняется полностью, либо полностью откатывается."}
          />
          <QuizCard
            question={"Почему внешний HTTP-запрос не стоит держать внутри session.begin()?"}
            options={[
              "Он может долго удерживать транзакцию и соединение",
              "HTTP нельзя вызывать из Python",
              "begin запрещает await",
            ]}
            correctIndex={0}
            explanation={"В транзакции оставляют только работу, необходимую для согласованного изменения базы."}
          />
          <QuizCard
            question={"Как проверить rollback надёжнее всего?"}
            options={[
              "После ожидаемой ошибки запросить обе таблицы и проверить исходное состояние",
              "Проверить только текст исключения",
              "Посчитать строки Python-файла",
            ]}
            correctIndex={0}
            explanation={"Проверка состояния базы доказывает, что частичный результат не сохранился."}
          />
        </div>

        <KeyTakeaways
          points={[
            <>
              {"Асинхронность не меняет смысл транзакции и атомарности."}
            </>,
            <>
              {"session.begin() задаёт одну границу commit или rollback."}
            </>,
            <>
              {"session.add() не требует await, потому что пока меняет локальный unit of work."}
            </>,
            <>
              {"flush выполняет SQL внутри транзакции и позволяет получить сгенерированные значения."}
            </>,
            <>
              {"После ошибки состояние базы проверяется отдельным запросом."}
            </>,
            <>
              {"Долгую внешнюю работу нельзя без причины удерживать внутри транзакции."}
            </>,
            <>
              {"Ошибка ограничения переводится в предметный контракт API, а не выдаётся клиенту как traceback."}
            </>,
          ]}
        />

        <div className="lesson-practice-steps">
          <h3>{"Понять"}</h3>
          <p>
            {"Объяснить модель своими словами без чтения определения."}
          </p>
          <h3>{"Увидеть"}</h3>
          <p>
            {"Показать, где создаётся объект и где начинается реальный I/O."}
          </p>
          <h3>{"Предсказать"}</h3>
          <p>
            {"Назвать результат изменения до запуска."}
          </p>
          <h3>{"Запустить"}</h3>
          <p>
            {"Воспроизвести success path одной командой."}
          </p>
          <h3>{"Найти ошибку"}</h3>
          <p>
            {"Получить ожидаемый сбой и локализовать причину."}
          </p>
          <h3>{"Проверить"}</h3>
          <p>
            {"Подтвердить состояние данных, cleanup и регрессию тестом."}
          </p>
          <h3>{"Зафиксировать"}</h3>
          <p>
            {"Обновить README или техническую заметку и сделать осмысленный коммит."}
          </p>
        </div>

        <PracticeCta text={"Перенесите одну двухшаговую операцию Async StudyHub в session.begin(). Добавьте failure-test, который намеренно ломает второй шаг и доказывает, что первая запись также отсутствует."} />
      </Section>
    </RichLesson>
  );
}
