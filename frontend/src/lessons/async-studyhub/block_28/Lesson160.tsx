import { Boxes, ShieldCheck } from "lucide-react";
import { BranchExplorer, BugHunt, Callout, CodeBlock, CodeSequence, CompareSolutions, FillBlank, FlipCards, KeyTakeaways, Lead, MatchPairs, MethodGrid, PracticeCta, QuizCard, RecallCard, RichHero, RichLesson, Section, StepThrough, TerminalDemo, TrueFalse, TypeCard, TypeCards } from "../../shared";
const BLOCK_TITLE = "Блок 28 · Async SQLAlchemy, нагрузка и наблюдаемость";

export function Lesson160({ module }: { module?: string }) {
  return (
    <RichLesson>
      <RichHero
        variant="project"
        chip={module ?? BLOCK_TITLE}
        title={"async_sessionmaker и get_db"}
        intro={"Создадим фабрику AsyncSession и dependency get_db, которая выдаёт каждому HTTP-запросу собственную единицу работы, гарантированно закрывает её и не превращает database state в global object."}
        tags={[
          { icon: <Boxes size={14} />, label: "одна session на request" },
          { icon: <ShieldCheck size={14} />, label: "yield и cleanup" },
        ]}
      />

      <Callout tone="info">
        <strong>Связь с этапом.</strong>
        {" AsyncEngine уже умеет выдавать совместимые соединения. Следующий слой ограничивает время жизни ORM-state одним request. "}
        <strong>Важно не перепутать:</strong>
        {" AsyncSession является mutable unit of work и не предназначена для совместного использования конкурентными tasks."}
      </Callout>

      <Section number="01" title="Зачем эта тема появляется сейчас">
        <Lead>
          {"Создадим фабрику AsyncSession и dependency get_db, которая выдаёт каждому HTTP-запросу собственную единицу работы, гарантированно закрывает её и не превращает database state в global object."}
        </Lead>

        <div className="lesson-route">
          <ol>
            <li>
              <strong>{"Создать фабрику: "}</strong>
              {"async_sessionmaker хранит общий рецепт создания sessions."}
            </li>
            <li>
              <strong>{"Описать lifecycle: "}</strong>
              {"async with открывает session, yield передаёт её endpoint."}
            </li>
            <li>
              <strong>{"Привязать к request: "}</strong>
              {"Каждый запрос получает отдельный ORM-state."}
            </li>
            <li>
              <strong>{"Проверить cleanup: "}</strong>
              {"Исключение не оставляет session и connection занятыми."}
            </li>
          </ol>
          <p>
            {"Итог занятия — проверяемое изменение Async StudyHub, а не отдельный фрагмент синтаксиса."}
          </p>
        </div>

        <TypeCards>
          <TypeCard
            badge={"factory"}
            title={"async_sessionmaker"}
          >
            {"Создаёт новые sessions с одинаковыми настройками."}
          </TypeCard>
          <TypeCard
            badge={"unit"}
            badgeTone={"float"}
            title={"AsyncSession"}
          >
            {"Хранит identity map, pending changes и transaction state."}
          </TypeCard>
          <TypeCard
            badge={"scope"}
            badgeTone={"str"}
            title={"get_db"}
          >
            {"Задаёт момент создания, передачи и освобождения session."}
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
          question={"Какую наблюдаемую проблему решает занятие 160?"}
          hint={"Назовите исходный риск, одно изменение и способ проверки."}
          answer={
            <p>
              {"async_sessionmaker хранит общий рецепт создания sessions; затем результат подтверждается воспроизводимой проверкой."}
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
            [<>{"async_engine"}</>, "общая конфигурация и pool"],
            [<>{"AsyncSessionFactory"}</>, "фабрика новых sessions"],
            [<>{"AsyncSession"}</>, "единица работы request"],
            [<>{"yield"}</>, "граница setup и cleanup dependency"],
          ]}
        />

        <MatchPairs
          prompt={"Соедините инструмент и его ответственность в этом занятии."}
          leftTitle={"Инструмент"}
          rightTitle={"Ответственность"}
          pairs={[
            {
              left: "async_engine",
              right: "общая конфигурация и pool",
            },
            {
              left: "AsyncSessionFactory",
              right: "фабрика новых sessions",
            },
            {
              left: "AsyncSession",
              right: "единица работы request",
            },
            {
              left: "yield",
              right: "граница setup и cleanup dependency",
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

      <Section number="03" title={"Фабрика и request-scoped dependency"}>
        <Lead>
          {"Разберём минимальный рабочий пример построчно. До запуска предскажите, где появляется реальное обращение к PostgreSQL и какой объект остаётся локальным."}
        </Lead>

        <CodeBlock
          caption={"минимальный рабочий пример"}
          code={"from collections.abc import AsyncIterator\n\nfrom sqlalchemy.ext.asyncio import (\n    AsyncSession,\n    async_sessionmaker,\n)\n\nfrom app.core.engine import async_engine\n\nAsyncSessionFactory = async_sessionmaker(\n    bind=async_engine,\n    class_=AsyncSession,\n    expire_on_commit=False,\n    autoflush=False,\n)\n\n\nasync def get_db() -> AsyncIterator[AsyncSession]:\n    async with AsyncSessionFactory() as session:\n        try:\n            yield session\n        except Exception:\n            await session.rollback()\n            raise"}
        />

        <StepThrough
          code={"from collections.abc import AsyncIterator\n\nfrom sqlalchemy.ext.asyncio import (\n    AsyncSession,\n    async_sessionmaker,\n)\n\nfrom app.core.engine import async_engine\n\nAsyncSessionFactory = async_sessionmaker(\n    bind=async_engine,\n    class_=AsyncSession,\n    expire_on_commit=False,\n    autoflush=False,\n)\n\n\nasync def get_db() -> AsyncIterator[AsyncSession]:\n    async with AsyncSessionFactory() as session:\n        try:\n            yield session\n        except Exception:\n            await session.rollback()\n            raise"}
          steps={[
            {
              line: 8,
              note: "Фабрика связывается с engine.",
              vars: {
                "bind": "async_engine",
              },
            },
            {
              line: 11,
              note: "expire_on_commit сохраняет поля.",
              vars: {
                "expire": "False",
              },
            },
            {
              line: 16,
              note: "Dependency создаёт новую session.",
              vars: {
                "scope": "request",
              },
            },
            {
              line: 18,
              note: "yield передаёт session.",
              vars: {
                "owner": "endpoint",
              },
            },
            {
              line: 20,
              note: "Ошибка приводит к rollback.",
              vars: {
                "state": "clean",
              },
            },
          ]}
        />

        <FillBlank
          prompt={"Заполните ключевой фрагмент рабочего контракта."}
          before={"        "}
          after={" session"}
          options={[
            "yield",
            "return",
            "await",
          ]}
          answer={"yield"}
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
            code: "global_session = AsyncSessionFactory()\n\nasync def get_db():\n    yield global_session",
            note: "Все конкурентные запросы делят одну mutable AsyncSession и смешивают transaction state.",
          }}
          right={{
            title: "Явный async-контракт",
            code: "async def get_db():\n    async with AsyncSessionFactory() as session:\n        yield session",
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
          {"AsyncSession является mutable unit of work и не предназначена для совместного использования конкурентными tasks."}
        </Callout>
      </Section>

      <Section number="05" title="Ожидаемая ошибка и диагностический порядок">
        <Lead>
          {"Ошибка ценна как проверка модели. Сначала определите нарушенное ожидание, затем найдите границу I/O, восстановите ресурс и только после этого формируйте ответ клиенту."}
        </Lead>

        <BugHunt
          code={"global_session = AsyncSessionFactory()\n\nasync def get_db():\n    yield global_session"}
          question={"Какой дефект здесь наиболее опасен?"}
          options={[
            "Все конкурентные запросы делят одну mutable AsyncSession и смешивают transaction state.",
            "Асинхронный Python запрещает функции длиннее пяти строк",
            "Все SQLAlchemy-методы должны вызываться с await",
          ]}
          correctIndex={0}
          explanation={"Проблема связана с нарушением жизненного цикла или database-контракта, а не с самим словом async."}
          fix={"async def get_db():\n    async with AsyncSessionFactory() as session:\n        yield session"}
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
          code={"DbSession = Annotated[AsyncSession, Depends(get_db)]\n\n\n@router.get(\"/tasks\")\nasync def read_tasks(session: DbSession):\n    return await list_tasks(session)"}
        />

        <BranchExplorer
          code={"DbSession = Annotated[AsyncSession, Depends(get_db)]\n\n\n@router.get(\"/tasks\")\nasync def read_tasks(session: DbSession):\n    return await list_tasks(session)"}
          scenarios={[
            {
              label: "Успешный request",
              activeLine: 4,
              output: "endpoint получает отдельную session",
            },
            {
              label: "Ошибка repository",
              activeLine: 4,
              output: "rollback и cleanup",
            },
            {
              label: "Следующий request",
              activeLine: 4,
              output: "новая независимая session",
            },
          ]}
        />

        <TerminalDemo
          title={"проверка проектного изменения"}
          lines={[
            {
              cmd: "pytest tests/api/test_session_scope.py -q",
            },
            {
              out: "3 passed",
            },
            {
              cmd: "git diff --stat",
            },
            {
              out: "database_async.py | 22 +",
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
              id: "testdb",
              code: "создать test session factory",
              note: "",
            },
            {
              id: "override",
              code: "назначить dependency override",
              note: "",
            },
            {
              id: "requests",
              code: "выполнить два request",
              note: "",
            },
            {
              id: "assert",
              code: "проверить независимый state",
              note: "",
            },
            {
              id: "clear",
              code: "очистить overrides",
              note: "",
            },
            {
              id: "share",
              code: "передать одну session двум request",
              note: "нарушает изоляцию",
            },
          ]}
          correctOrder={[
            "testdb",
            "override",
            "requests",
            "assert",
            "clear",
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
            question={"Что создаёт async_sessionmaker?"}
            options={[
              "новые AsyncSession",
              "новые таблицы",
              "event loop",
            ]}
            correctIndex={0}
            explanation={"Это фабрика единиц работы."}
          />
          <QuizCard
            question={"Зачем get_db использует yield?"}
            options={[
              "передать session и cleanup",
              "ускорить SQL",
              "global state",
            ]}
            correctIndex={0}
            explanation={"Код после yield завершает lifecycle."}
          />
          <QuizCard
            question={"Какой scope выбран?"}
            options={[
              "session на request",
              "session на app",
              "session на table",
            ]}
            correctIndex={0}
            explanation={"Request scope изолирует state."}
          />
          <QuizCard
            question={"Почему session нельзя делить?"}
            options={[
              "mutable ORM-state",
              "нет execute",
              "только SQLite",
            ]}
            correctIndex={0}
            explanation={"Concurrent use смешивает состояние."}
          />
        </div>

        <KeyTakeaways
          points={[
            <>
              {"async_sessionmaker является фабрикой, а не session."}
            </>,
            <>
              {"Каждый request получает отдельную AsyncSession."}
            </>,
            <>
              {"yield делает lifecycle dependency видимым."}
            </>,
            <>
              {"async with гарантирует закрытие session."}
            </>,
            <>
              {"После database error нужен rollback."}
            </>,
            <>
              {"Dependency override изолирует test database."}
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

        <PracticeCta text={"Создайте AsyncSessionFactory и get_db, подключите dependency к одному read endpoint, добавьте test override и докажите cleanup после ошибки repository."} />
      </Section>
    </RichLesson>
  );
}
