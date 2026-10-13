import { Boxes, Layers } from "lucide-react";
import { BranchExplorer, BugHunt, Callout, CodeBlock, CodeSequence, CompareSolutions, FillBlank, FlipCards, KeyTakeaways, Lead, MatchPairs, MethodGrid, PracticeCta, QuizCard, RecallCard, RichHero, RichLesson, Section, StepThrough, TerminalDemo, TrueFalse, TypeCard, TypeCards } from "../../shared";
const BLOCK_TITLE = "Блок 28 · Async SQLAlchemy, нагрузка и наблюдаемость";

export function Lesson163({ module }: { module?: string }) {
  return (
    <RichLesson>
      <RichHero
        variant="project"
        chip={module ?? BLOCK_TITLE}
        title={"Связи, N+1 и connection pool"}
        intro={"Асинхронный стек не устраняет N+1 и не создаёт бесконечные подключения. Сделаем загрузку связей явной через selectinload, проследим SQL и разберём, почему длинная транзакция способна исчерпать connection pool."}
        tags={[
          { icon: <Layers size={14} />, label: "selectinload без N+1" },
          { icon: <Boxes size={14} />, label: "короткая работа с pool" },
        ]}
      />

      <Callout tone="info">
        <strong>Связь с этапом.</strong>
        {" Связи owner → tasks уже знакомы по SQLAlchemy и PostgreSQL. Теперь важно не перенести в async-приложение скрытый lazy I/O: запросы должны быть видны в statement и выполняться в предсказуемой точке await. "}
        <strong>Важно не перепутать:</strong>
        {" Увеличение pool_size не лечит N+1 и долгие транзакции. Сначала сокращают число запросов и время удержания connection, затем настраивают pool по измеренной конкурентной нагрузке."}
      </Callout>

      <Section number="01" title="Зачем эта тема появляется сейчас">
        <Lead>
          {"Асинхронный стек не устраняет N+1 и не создаёт бесконечные подключения. Сделаем загрузку связей явной через selectinload, проследим SQL и разберём, почему длинная транзакция способна исчерпать connection pool."}
        </Lead>

        <div className="lesson-route">
          <ol>
            <li>
              <strong>{"Увидеть N+1: "}</strong>
              {"включить SQL-лог и посчитать запросы для списка задач с owner."}
            </li>
            <li>
              <strong>{"Сделать загрузку явной: "}</strong>
              {"добавить selectinload(TaskModel.owner) в statement."}
            </li>
            <li>
              <strong>{"Освободить соединение раньше: "}</strong>
              {"не выполнять форматирование и внешний I/O внутри транзакции."}
            </li>
            <li>
              <strong>{"Смоделировать предел: "}</strong>
              {"запустить больше конкурентных операций, чем доступно connections."}
            </li>
          </ol>
          <p>
            {"Итог занятия — проверяемое изменение Async StudyHub, а не отдельный фрагмент синтаксиса."}
          </p>
        </div>

        <TypeCards>
          <TypeCard
            badge={"N+1"}
            title={"Один запрос списка плюс запрос на связи"}
          >
            {"Проблема растёт вместе с количеством строк, даже если endpoint выглядит коротким."}
          </TypeCard>
          <TypeCard
            badge={"EAGER"}
            badgeTone={"float"}
            title={"Связи загружены заранее"}
          >
            {"selectinload выполняет отдельный групповой SELECT и собирает связанные объекты."}
          </TypeCard>
          <TypeCard
            badge={"POOL"}
            badgeTone={"str"}
            title={"Ограниченный набор connections"}
          >
            {"Каждая активная database-операция временно занимает соединение и должна быстро вернуть его."}
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
          question={"Какую наблюдаемую проблему решает занятие 163?"}
          hint={"Назовите исходный риск, одно изменение и способ проверки."}
          answer={
            <p>
              {"включить SQL-лог и посчитать запросы для списка задач с owner; затем результат подтверждается воспроизводимой проверкой."}
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
            [<>{"lazy loading"}</>, "связь может инициировать SQL в неожиданном месте обращения"],
            [<>{"selectinload(...)"}</>, "загружает связанные строки отдельным IN-запросом"],
            [<>{"joinedload(...)"}</>, "получает связь через JOIN; подходит не для каждого набора"],
            [<>{"pool_size"}</>, "число постоянно поддерживаемых connections на процесс"],
            [<>{"max_overflow"}</>, "дополнительные временные connections сверх базового размера"],
            [<>{"pool_timeout"}</>, "сколько ждать свободное connection до ошибки"],
          ]}
        />

        <MatchPairs
          prompt={"Соедините инструмент и его ответственность в этом занятии."}
          leftTitle={"Инструмент"}
          rightTitle={"Ответственность"}
          pairs={[
            {
              left: "lazy loading",
              right: "связь может инициировать SQL в неожиданном месте обращения",
            },
            {
              left: "selectinload(...)",
              right: "загружает связанные строки отдельным IN-запросом",
            },
            {
              left: "joinedload(...)",
              right: "получает связь через JOIN; подходит не для каждого набора",
            },
            {
              left: "pool_size",
              right: "число постоянно поддерживаемых connections на процесс",
            },
            {
              left: "max_overflow",
              right: "дополнительные временные connections сверх базового размера",
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

      <Section number="03" title={"Явная загрузка owner для списка задач"}>
        <Lead>
          {"Разберём минимальный рабочий пример построчно. До запуска предскажите, где появляется реальное обращение к PostgreSQL и какой объект остаётся локальным."}
        </Lead>

        <CodeBlock
          caption={"минимальный рабочий пример"}
          code={"from sqlalchemy import select\nfrom sqlalchemy.ext.asyncio import AsyncSession\nfrom sqlalchemy.orm import selectinload\n\nfrom app.models import TaskModel\n\n\nasync def list_tasks_with_owner(\n    session: AsyncSession,\n) -> list[TaskModel]:\n    statement = (\n        select(TaskModel)\n        .options(selectinload(TaskModel.owner))\n        .order_by(TaskModel.id)\n    )\n\n    result = await session.execute(statement)\n    return list(result.scalars().all())"}
        />

        <StepThrough
          code={"from sqlalchemy import select\nfrom sqlalchemy.ext.asyncio import AsyncSession\nfrom sqlalchemy.orm import selectinload\n\nfrom app.models import TaskModel\n\n\nasync def list_tasks_with_owner(\n    session: AsyncSession,\n) -> list[TaskModel]:\n    statement = (\n        select(TaskModel)\n        .options(selectinload(TaskModel.owner))\n        .order_by(TaskModel.id)\n    )\n\n    result = await session.execute(statement)\n    return list(result.scalars().all())"}
          steps={[
            {
              line: 0,
              note: "Строится SQLAlchemy statement; connection пока не нужен.",
              vars: {
                "SQL": "не выполнен",
              },
            },
            {
              line: 10,
              note: "selectinload объявляет требуемую связь до выполнения запроса.",
              vars: {
                "relationship": "owner",
              },
            },
            {
              line: 14,
              note: "Первый await загружает задачи.",
              vars: {
                "query": "SELECT tasks",
              },
            },
            {
              line: 14,
              note: "Стратегия выполняет дополнительный групповой SELECT пользователей.",
              vars: {
                "query": "SELECT users WHERE id IN (...)",
              },
            },
            {
              line: 15,
              note: "При чтении task.owner новый SQL не требуется.",
              vars: {
                "queries": "2",
              },
            },
          ]}
        />

        <FillBlank
          prompt={"Заполните ключевой фрагмент рабочего контракта."}
          before={"select(TaskModel).options("}
          after={"(TaskModel.owner))"}
          options={[
            "selectinload",
            "sessionmaker",
            "rollback",
          ]}
          answer={"selectinload"}
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
            code: "result = await session.execute(select(TaskModel))\ntasks = result.scalars().all()\n\nfor task in tasks:\n    print(task.owner.email)",
            note: "Обращение к owner может породить отдельный SQL для каждой задачи или неожиданное async I/O",
          }}
          right={{
            title: "Явный async-контракт",
            code: "statement = (\n    select(TaskModel)\n    .options(selectinload(TaskModel.owner))\n    .order_by(TaskModel.id)\n)\nresult = await session.execute(statement)\ntasks = result.scalars().all()",
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
          {"Увеличение pool_size не лечит N+1 и долгие транзакции. Сначала сокращают число запросов и время удержания connection, затем настраивают pool по измеренной конкурентной нагрузке."}
        </Callout>
      </Section>

      <Section number="05" title="Ожидаемая ошибка и диагностический порядок">
        <Lead>
          {"Ошибка ценна как проверка модели. Сначала определите нарушенное ожидание, затем найдите границу I/O, восстановите ресурс и только после этого формируйте ответ клиенту."}
        </Lead>

        <BugHunt
          code={"result = await session.execute(select(TaskModel))\ntasks = result.scalars().all()\n\nfor task in tasks:\n    print(task.owner.email)"}
          question={"Какой дефект здесь наиболее опасен?"}
          options={[
            "Обращение к owner может породить отдельный SQL для каждой задачи или неожиданное async I/O",
            "Асинхронный Python запрещает функции длиннее пяти строк",
            "Все SQLAlchemy-методы должны вызываться с await",
          ]}
          correctIndex={0}
          explanation={"Проблема связана с нарушением жизненного цикла или database-контракта, а не с самим словом async."}
          fix={"statement = (\n    select(TaskModel)\n    .options(selectinload(TaskModel.owner))\n)\nresult = await session.execute(statement)\ntasks = result.scalars().all()"}
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
          code={"async def build_task_cards(\n    session: AsyncSession,\n) -> list[dict[str, object]]:\n    tasks = await list_tasks_with_owner(session)\n\n    # После database I/O формируем response без удержания транзакции.\n    return [\n        {\n            \"id\": task.id,\n            \"title\": task.title,\n            \"owner_email\": task.owner.email,\n        }\n        for task in tasks\n    ]"}
        />

        <BranchExplorer
          code={"async def build_task_cards(\n    session: AsyncSession,\n) -> list[dict[str, object]]:\n    tasks = await list_tasks_with_owner(session)\n\n    # После database I/O формируем response без удержания транзакции.\n    return [\n        {\n            \"id\": task.id,\n            \"title\": task.title,\n            \"owner_email\": task.owner.email,\n        }\n        for task in tasks\n    ]"}
          scenarios={[
            {
              label: "1 задача",
              activeLine: 6,
              output: "без eager loading: обычно 2 запроса",
            },
            {
              label: "50 задач разных владельцев",
              activeLine: 6,
              output: "N+1: число запросов резко растёт",
            },
            {
              label: "50 задач + selectinload",
              activeLine: 2,
              output: "предсказуемо: запрос задач + групповой запрос owners",
            },
          ]}
        />

        <TerminalDemo
          title={"проверка проектного изменения"}
          lines={[
            {
              cmd: "pytest -q tests/test_task_queries.py",
            },
            {
              out: "2 passed",
            },
            {
              cmd: "python scripts/count_sql.py",
            },
            {
              out: "lazy_queries=51\neager_queries=2",
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
              id: "logs",
              code: "включить SQL-лог в тестовом окружении",
              note: "увидеть фактические statements",
            },
            {
              id: "count",
              code: "посчитать запросы базового сценария",
              note: "зафиксировать N+1",
            },
            {
              id: "eager",
              code: "добавить selectinload",
              note: "сделать relation loading явным",
            },
            {
              id: "verify",
              code: "повторить тест числа запросов",
              note: "получить стабильный предел",
            },
            {
              id: "pool",
              code: "измерить время удержания connection",
              note: "проверить pool под concurrency",
            },
          ]}
          correctOrder={[
            "logs",
            "count",
            "eager",
            "verify",
            "pool",
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
            question={"Что означает N+1 для списка задач и владельцев?"}
            options={[
              "Один запрос задач и дополнительные запросы связей",
              "Один запрос с N колонками",
              "N транзакций без SQL",
            ]}
            correctIndex={0}
            explanation={"Проблема описывает рост числа обращений к базе при чтении связанных объектов."}
          />
          <QuizCard
            question={"Что делает selectinload на прикладном уровне?"}
            options={[
              "Заранее загружает связь отдельным групповым SELECT",
              "Увеличивает pool_size",
              "Удаляет foreign key",
            ]}
            correctIndex={0}
            explanation={"Стратегия делает загрузку связи предсказуемой и избегает запроса на каждый объект."}
          />
          <QuizCard
            question={"Что чаще всего нужно сделать до увеличения connection pool?"}
            options={[
              "Убрать лишние запросы и сократить транзакции",
              "Добавить sleep внутри транзакции",
              "Отключить SQL-логи навсегда",
            ]}
            correctIndex={0}
            explanation={"Больший pool не исправляет неэффективный жизненный цикл connection."}
          />
          <QuizCard
            question={"Где лучше форматировать response после чтения данных?"}
            options={[
              "После завершения необходимого database I/O",
              "Внутри длинной открытой транзакции",
              "В Alembic migration",
            ]}
            correctIndex={0}
            explanation={"Работа без базы не должна зря удерживать connection."}
          />
        </div>

        <KeyTakeaways
          points={[
            <>
              {"AsyncSession не устраняет N+1 автоматически."}
            </>,
            <>
              {"Связи загружаются явно в statement, а не случайно во время сериализации."}
            </>,
            <>
              {"selectinload обычно даёт запрос основной таблицы и групповой запрос связанных строк."}
            </>,
            <>
              {"Число SQL-запросов нужно проверять тестом или логом."}
            </>,
            <>
              {"Connection pool ограничен и принадлежит процессу приложения."}
            </>,
            <>
              {"Долгая транзакция удерживает connection и снижает доступную конкурентность."}
            </>,
            <>
              {"Параметры pool настраиваются после исправления запросов и измерения нагрузки."}
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

        <PracticeCta text={"Возьмите endpoint списка задач с владельцем. Зафиксируйте число SQL-запросов, добавьте selectinload, повторите проверку и отдельно убедитесь, что форматирование response выполняется после чтения данных."} />
      </Section>
    </RichLesson>
  );
}
