import { Save, Search } from "lucide-react";
import { BranchExplorer, BugHunt, Callout, CodeBlock, CodeSequence, CompareSolutions, FillBlank, FlipCards, KeyTakeaways, Lead, MatchPairs, MethodGrid, PracticeCta, QuizCard, RecallCard, RichHero, RichLesson, Section, StepThrough, TerminalDemo, TrueFalse, TypeCard, TypeCards } from "../../shared";
const BLOCK_TITLE = "Блок 28 · Async SQLAlchemy, нагрузка и наблюдаемость";

export function Lesson161({ module }: { module?: string }) {
  return (
    <RichLesson>
      <RichHero
        variant="project"
        chip={module ?? BLOCK_TITLE}
        title={"Асинхронный SELECT и CRUD"}
        intro={"Перенесём знакомый CRUD на AsyncSession. SQLAlchemy statements останутся прежними, а database I/O станет явным через await. Отдельно разберём, почему session.add await не требует."}
        tags={[
          { icon: <Search size={14} />, label: "execute · scalars" },
          { icon: <Save size={14} />, label: "commit · refresh · delete" },
        ]}
      />

      <Callout tone="info">
        <strong>Связь с этапом.</strong>
        {" Request-scoped AsyncSession уже приходит в endpoint. Теперь repository должен выполнять чтение и запись через async API. "}
        <strong>Важно не перепутать:</strong>
        {" Не каждое действие с session является I/O: add меняет local unit-of-work state, а execute, commit, refresh и delete обращаются к базе."}
      </Callout>

      <Section number="01" title="Зачем эта тема появляется сейчас">
        <Lead>
          {"Перенесём знакомый CRUD на AsyncSession. SQLAlchemy statements останутся прежними, а database I/O станет явным через await. Отдельно разберём, почему session.add await не требует."}
        </Lead>

        <div className="lesson-route">
          <ol>
            <li>
              <strong>{"Перенести список: "}</strong>
              {"await execute возвращает Result, scalars извлекает ORM-объекты."}
            </li>
            <li>
              <strong>{"Сохранить object-by-id contract: "}</strong>
              {"scalar_one_or_none различает объект и отсутствие."}
            </li>
            <li>
              <strong>{"Перенести создание: "}</strong>
              {"add без await, commit и refresh с await."}
            </li>
            <li>
              <strong>{"Закрыть CRUD: "}</strong>
              {"Update/delete сохраняют прежние 404, 403 и schemas."}
            </li>
          </ol>
          <p>
            {"Итог занятия — проверяемое изменение Async StudyHub, а не отдельный фрагмент синтаксиса."}
          </p>
        </div>

        <TypeCards>
          <TypeCard
            badge={"statement"}
            title={"select(TaskModel)"}
          >
            {"Строит SQL expression без сети."}
          </TypeCard>
          <TypeCard
            badge={"execute"}
            badgeTone={"float"}
            title={"await session.execute"}
          >
            {"Передаёт statement driver и ждёт PostgreSQL."}
          </TypeCard>
          <TypeCard
            badge={"result"}
            badgeTone={"str"}
            title={"scalars"}
          >
            {"Преобразует Result в прикладной контракт."}
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
          question={"Какую наблюдаемую проблему решает занятие 161?"}
          hint={"Назовите исходный риск, одно изменение и способ проверки."}
          answer={
            <p>
              {"await execute возвращает Result, scalars извлекает ORM-объекты; затем результат подтверждается воспроизводимой проверкой."}
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
            [<>{"select(...)"}</>, "строит expression без await"],
            [<>{"session.add"}</>, "меняет local unit of work"],
            [<>{"session.execute"}</>, "database I/O с await"],
            [<>{"session.commit"}</>, "фиксация transaction"],
            [<>{"session.refresh"}</>, "чтение server values"],
            [<>{"session.delete"}</>, "async ORM delete"],
          ]}
        />

        <MatchPairs
          prompt={"Соедините инструмент и его ответственность в этом занятии."}
          leftTitle={"Инструмент"}
          rightTitle={"Ответственность"}
          pairs={[
            {
              left: "select(...)",
              right: "строит expression без await",
            },
            {
              left: "session.add",
              right: "меняет local unit of work",
            },
            {
              left: "session.execute",
              right: "database I/O с await",
            },
            {
              left: "session.commit",
              right: "фиксация transaction",
            },
            {
              left: "session.refresh",
              right: "чтение server values",
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

      <Section number="03" title={"SELECT списка и объекта по id"}>
        <Lead>
          {"Разберём минимальный рабочий пример построчно. До запуска предскажите, где появляется реальное обращение к PostgreSQL и какой объект остаётся локальным."}
        </Lead>

        <CodeBlock
          caption={"минимальный рабочий пример"}
          code={"from sqlalchemy import select\nfrom sqlalchemy.ext.asyncio import AsyncSession\n\nfrom app.models import TaskModel\n\n\nasync def list_tasks(\n    session: AsyncSession,\n) -> list[TaskModel]:\n    statement = select(TaskModel).order_by(TaskModel.id)\n    result = await session.execute(statement)\n    return list(result.scalars().all())\n\n\nasync def get_task(\n    session: AsyncSession,\n    task_id: int,\n) -> TaskModel | None:\n    statement = select(TaskModel).where(\n        TaskModel.id == task_id\n    )\n    result = await session.execute(statement)\n    return result.scalar_one_or_none()"}
        />

        <StepThrough
          code={"from sqlalchemy import select\nfrom sqlalchemy.ext.asyncio import AsyncSession\n\nfrom app.models import TaskModel\n\n\nasync def list_tasks(\n    session: AsyncSession,\n) -> list[TaskModel]:\n    statement = select(TaskModel).order_by(TaskModel.id)\n    result = await session.execute(statement)\n    return list(result.scalars().all())\n\n\nasync def get_task(\n    session: AsyncSession,\n    task_id: int,\n) -> TaskModel | None:\n    statement = select(TaskModel).where(\n        TaskModel.id == task_id\n    )\n    result = await session.execute(statement)\n    return result.scalar_one_or_none()"}
          steps={[
            {
              line: 8,
              note: "Statement строится в памяти.",
              vars: {
                "I/O": "нет",
              },
            },
            {
              line: 9,
              note: "execute отправляет SQL.",
              vars: {
                "await": "да",
              },
            },
            {
              line: 10,
              note: "scalars извлекает ORM-объекты.",
              vars: {
                "result": "list",
              },
            },
            {
              line: 18,
              note: "WHERE ограничивает выборку.",
              vars: {
                "task_id": "parameter",
              },
            },
            {
              line: 21,
              note: "Метод возвращает объект или None.",
              vars: {
                "contract": "object | None",
              },
            },
          ]}
        />

        <FillBlank
          prompt={"Заполните ключевой фрагмент рабочего контракта."}
          before={"    "}
          after={" session.commit()"}
          options={[
            "await",
            "yield",
            "return",
          ]}
          answer={"await"}
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
            code: "task = TaskModel(title=data.title)\nawait session.add(task)\nsession.commit()",
            note: "add не является coroutine, а commit забыли ожидать.",
          }}
          right={{
            title: "Явный async-контракт",
            code: "task = TaskModel(title=data.title)\nsession.add(task)\nawait session.commit()\nawait session.refresh(task)",
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
          {"Не каждое действие с session является I/O: add меняет local unit-of-work state, а execute, commit, refresh и delete обращаются к базе."}
        </Callout>
      </Section>

      <Section number="05" title="Ожидаемая ошибка и диагностический порядок">
        <Lead>
          {"Ошибка ценна как проверка модели. Сначала определите нарушенное ожидание, затем найдите границу I/O, восстановите ресурс и только после этого формируйте ответ клиенту."}
        </Lead>

        <BugHunt
          code={"task = TaskModel(title=data.title)\nawait session.add(task)\nsession.commit()"}
          question={"Какой дефект здесь наиболее опасен?"}
          options={[
            "add не является coroutine, а commit забыли ожидать.",
            "Асинхронный Python запрещает функции длиннее пяти строк",
            "Все SQLAlchemy-методы должны вызываться с await",
          ]}
          correctIndex={0}
          explanation={"Проблема связана с нарушением жизненного цикла или database-контракта, а не с самим словом async."}
          fix={"task = await get_task(session, task_id)\nif task is None:\n    raise HTTPException(status_code=404)"}
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
          code={"task = await get_task(session, task_id)\n\nif task is None:\n    raise HTTPException(status_code=404)\n\nif task.owner_id != user.id:\n    raise HTTPException(status_code=403)\n\nawait session.delete(task)\nawait session.commit()"}
        />

        <BranchExplorer
          code={"task = await get_task(session, task_id)\n\nif task is None:\n    raise HTTPException(status_code=404)\n\nif task.owner_id != user.id:\n    raise HTTPException(status_code=403)\n\nawait session.delete(task)\nawait session.commit()"}
          scenarios={[
            {
              label: "Запись отсутствует",
              activeLine: 3,
              output: "404 до изменения базы",
            },
            {
              label: "Чужой owner",
              activeLine: 6,
              output: "403 без delete",
            },
            {
              label: "Owner удаляет",
              activeLine: 8,
              output: "delete и commit",
            },
          ]}
        />

        <TerminalDemo
          title={"проверка проектного изменения"}
          lines={[
            {
              cmd: "pytest tests/api/test_tasks_async_crud.py -q",
            },
            {
              out: "8 passed",
            },
            {
              cmd: "curl -s http://localhost:8000/tasks/999",
            },
            {
              out: "{\"detail\":\"Task not found\"}",
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
              id: "select",
              code: "оставить прежний statement",
              note: "",
            },
            {
              id: "execute",
              code: "добавить await к execute",
              note: "",
            },
            {
              id: "result",
              code: "сохранить scalars contract",
              note: "",
            },
            {
              id: "write",
              code: "проверить add/commit/refresh/delete",
              note: "",
            },
            {
              id: "tests",
              code: "запустить API tests",
              note: "",
            },
            {
              id: "schemas",
              code: "переписать schemas одновременно",
              note: "не относится к миграции",
            },
          ]}
          correctOrder={[
            "select",
            "execute",
            "result",
            "write",
            "tests",
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
            question={"Где нужен await при SELECT?"}
            options={[
              "session.execute",
              "select(TaskModel)",
              "where",
            ]}
            correctIndex={0}
            explanation={"I/O происходит при execute."}
          />
          <QuizCard
            question={"Что возвращает scalar_one_or_none?"}
            options={[
              "объект или None",
              "всегда список",
              "count",
            ]}
            correctIndex={0}
            explanation={"Это object-by-id contract."}
          />
          <QuizCard
            question={"Нужен ли await для add?"}
            options={[
              "нет",
              "да",
              "только тестам",
            ]}
            correctIndex={0}
            explanation={"add меняет local state."}
          />
          <QuizCard
            question={"Что сохраняется после миграции?"}
            options={[
              "HTTP-контракт",
              "обязательное ускорение",
              "global session",
            ]}
            correctIndex={0}
            explanation={"Меняется boundary I/O."}
          />
        </div>

        <KeyTakeaways
          points={[
            <>
              {"Statements строятся без await."}
            </>,
            <>
              {"execute выполняет database I/O."}
            </>,
            <>
              {"scalars извлекает ORM-объекты."}
            </>,
            <>
              {"session.add не требует await."}
            </>,
            <>
              {"commit, refresh и delete используют async API."}
            </>,
            <>
              {"HTTP-контракт сохраняется."}
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

        <PracticeCta text={"Перенесите GET list, GET item, POST, PATCH и DELETE одного ресурса на AsyncSession, сохраните 404/403 и запустите CRUD test suite."} />
      </Section>
    </RichLesson>
  );
}
