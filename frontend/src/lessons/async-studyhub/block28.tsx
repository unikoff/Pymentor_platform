import {
  BarChart3,
  Boxes,
  GitFork,
  Layers,
  Save,
  Search,
  ShieldCheck,
  Trophy,
} from "lucide-react";
import {
  BranchExplorer,
  BugHunt,
  Callout,
  CodeBlock,
  CodeSequence,
  CompareSolutions,
  FillBlank,
  FlipCards,
  KeyTakeaways,
  Lead,
  MatchPairs,
  MethodGrid,
  PracticeCta,
  QuizCard,
  RecallCard,
  RichHero,
  RichLesson,
  Section,
  StepThrough,
  TerminalDemo,
  TrueFalse,
  TypeCard,
  TypeCards,
} from "../shared";

const BLOCK_TITLE = "Блок 28 · Async SQLAlchemy, нагрузка и наблюдаемость";

// 159. AsyncEngine и async driver PostgreSQL
export function Lesson159({ module }: { module?: string }) {
  return (
    <RichLesson>
      <RichHero
        variant="project"
        chip={module ?? BLOCK_TITLE}
        title={"AsyncEngine и async driver PostgreSQL"}
        intro={"Подключим асинхронный драйвер PostgreSQL и создадим AsyncEngine без резкого переписывания проекта. Проверим самый короткий путь через SELECT 1 и сохраним рабочую sync-конфигурацию как контрольную точку."}
        tags={[
          { icon: <GitFork size={14} />, label: "sync → async слоями" },
          { icon: <Layers size={14} />, label: "driver · engine · pool" },
        ]}
      />

      <Callout tone="info">
        <strong>Связь с этапом.</strong>
        {" Async StudyHub уже умеет неблокирующе ждать внешний HTTP. Теперь совместимым с event loop должен стать database I/O. "}
        <strong>Важно не перепутать:</strong>
        {" AsyncEngine не ускоряет CPU-код и не запускает запросы конкурентно сам по себе. Он даёт async API поверх совместимого драйвера и pool подключений."}
      </Callout>

      <Section number="01" title="Зачем эта тема появляется сейчас">
        <Lead>
          {"Подключим асинхронный драйвер PostgreSQL и создадим AsyncEngine без резкого переписывания проекта. Проверим самый короткий путь через SELECT 1 и сохраним рабочую sync-конфигурацию как контрольную точку."}
        </Lead>

        <div className="lesson-route">
          <ol>
            <li>
              <strong>{"Разделить роли: "}</strong>
              {"URL выбирает dialect и driver, engine управляет подключениями, PostgreSQL исполняет SQL."}
            </li>
            <li>
              <strong>{"Создать соседнюю конфигурацию: "}</strong>
              {"Async-версия появляется рядом с рабочей sync-версией."}
            </li>
            <li>
              <strong>{"Проверить SELECT 1: "}</strong>
              {"Минимальный запрос изолирует URL, driver, сеть и credentials."}
            </li>
            <li>
              <strong>{"Мигрировать вертикально: "}</strong>
              {"Сначала один read endpoint, затем CRUD и regression suite."}
            </li>
          </ol>
          <p>
            {"Итог занятия — проверяемое изменение Async StudyHub, а не отдельный фрагмент синтаксиса."}
          </p>
        </div>

        <TypeCards>
          <TypeCard
            badge={"driver"}
            title={"asyncpg"}
          >
            {"Передаёт SQL PostgreSQL через неблокирующий сетевой протокол."}
          </TypeCard>
          <TypeCard
            badge={"engine"}
            badgeTone={"float"}
            title={"AsyncEngine"}
          >
            {"Хранит конфигурацию, dialect и правила работы с pool."}
          </TypeCard>
          <TypeCard
            badge={"pool"}
            badgeTone={"str"}
            title={"connection pool"}
          >
            {"Переиспользует конечное число дорогих подключений."}
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
          question={"Какую наблюдаемую проблему решает занятие 159?"}
          hint={"Назовите исходный риск, одно изменение и способ проверки."}
          answer={
            <p>
              {"URL выбирает dialect и driver, engine управляет подключениями, PostgreSQL исполняет SQL; затем результат подтверждается воспроизводимой проверкой."}
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
            [<>{"postgresql+asyncpg"}</>, "dialect PostgreSQL и async driver"],
            [<>{"create_async_engine"}</>, "фабрика AsyncEngine"],
            [<>{"engine.connect"}</>, "получение AsyncConnection"],
            [<>{"SELECT 1"}</>, "минимальная проверка подключения"],
          ]}
        />

        <MatchPairs
          prompt={"Соедините инструмент и его ответственность в этом занятии."}
          leftTitle={"Инструмент"}
          rightTitle={"Ответственность"}
          pairs={[
            {
              left: "postgresql+asyncpg",
              right: "dialect PostgreSQL и async driver",
            },
            {
              left: "create_async_engine",
              right: "фабрика AsyncEngine",
            },
            {
              left: "engine.connect",
              right: "получение AsyncConnection",
            },
            {
              left: "SELECT 1",
              right: "минимальная проверка подключения",
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

      <Section number="03" title={"От URL до первого результата"}>
        <Lead>
          {"Разберём минимальный рабочий пример построчно. До запуска предскажите, где появляется реальное обращение к PostgreSQL и какой объект остаётся локальным."}
        </Lead>

        <CodeBlock
          caption={"минимальный рабочий пример"}
          code={"import asyncio\n\nfrom sqlalchemy import text\nfrom sqlalchemy.ext.asyncio import AsyncEngine, create_async_engine\n\nASYNC_DATABASE_URL = (\n    \"postgresql+asyncpg://studyhub:secret\"\n    \"@localhost:5432/studyhub\"\n)\n\nasync_engine: AsyncEngine = create_async_engine(\n    ASYNC_DATABASE_URL,\n    pool_pre_ping=True,\n    echo=False,\n)\n\n\nasync def check_database() -> None:\n    async with async_engine.connect() as connection:\n        result = await connection.execute(text(\"SELECT 1\"))\n        print(result.scalar_one())\n\n    await async_engine.dispose()\n\n\nif __name__ == \"__main__\":\n    asyncio.run(check_database())"}
        />

        <StepThrough
          code={"import asyncio\n\nfrom sqlalchemy import text\nfrom sqlalchemy.ext.asyncio import AsyncEngine, create_async_engine\n\nASYNC_DATABASE_URL = (\n    \"postgresql+asyncpg://studyhub:secret\"\n    \"@localhost:5432/studyhub\"\n)\n\nasync_engine: AsyncEngine = create_async_engine(\n    ASYNC_DATABASE_URL,\n    pool_pre_ping=True,\n    echo=False,\n)\n\n\nasync def check_database() -> None:\n    async with async_engine.connect() as connection:\n        result = await connection.execute(text(\"SELECT 1\"))\n        print(result.scalar_one())\n\n    await async_engine.dispose()\n\n\nif __name__ == \"__main__\":\n    asyncio.run(check_database())"}
          steps={[
            {
              line: 5,
              note: "URL явно выбирает asyncpg.",
              vars: {
                "driver": "asyncpg",
              },
            },
            {
              line: 10,
              note: "Фабрика создаёт AsyncEngine.",
              vars: {
                "engine": "AsyncEngine",
              },
            },
            {
              line: 17,
              note: "connect получает connection из pool.",
              vars: {
                "pool": "checkout",
              },
            },
            {
              line: 18,
              note: "execute ожидает сетевой I/O.",
              vars: {
                "result": "1",
              },
            },
            {
              line: 21,
              note: "dispose закрывает ресурсы скрипта.",
              vars: {
                "cleanup": "done",
              },
            },
          ]}
        />

        <FillBlank
          prompt={"Заполните ключевой фрагмент рабочего контракта."}
          before={"engine = "}
          after={"(ASYNC_DATABASE_URL)"}
          options={[
            "create_async_engine",
            "create_engine",
            "AsyncSession",
          ]}
          answer={"create_async_engine"}
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
            code: "engine = create_engine(ASYNC_DATABASE_URL)\n\nwith engine.connect() as connection:\n    result = connection.execute(text(\"SELECT 1\"))",
            note: "Sync engine и sync context manager смешаны с async driver и не образуют согласованный стек.",
          }}
          right={{
            title: "Явный async-контракт",
            code: "engine = create_async_engine(ASYNC_DATABASE_URL)\n\nasync with engine.connect() as connection:\n    result = await connection.execute(text(\"SELECT 1\"))",
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
          {"AsyncEngine не ускоряет CPU-код и не запускает запросы конкурентно сам по себе. Он даёт async API поверх совместимого драйвера и pool подключений."}
        </Callout>
      </Section>

      <Section number="05" title="Ожидаемая ошибка и диагностический порядок">
        <Lead>
          {"Ошибка ценна как проверка модели. Сначала определите нарушенное ожидание, затем найдите границу I/O, восстановите ресурс и только после этого формируйте ответ клиенту."}
        </Lead>

        <BugHunt
          code={"engine = create_engine(ASYNC_DATABASE_URL)\n\nwith engine.connect() as connection:\n    result = connection.execute(text(\"SELECT 1\"))"}
          question={"Какой дефект здесь наиболее опасен?"}
          options={[
            "Sync engine и sync context manager смешаны с async driver и не образуют согласованный стек.",
            "Асинхронный Python запрещает функции длиннее пяти строк",
            "Все SQLAlchemy-методы должны вызываться с await",
          ]}
          correctIndex={0}
          explanation={"Проблема связана с нарушением жизненного цикла или database-контракта, а не с самим словом async."}
          fix={"from sqlalchemy.ext.asyncio import create_async_engine\n\nengine = create_async_engine(\n    \"postgresql+asyncpg://user:pass@db/studyhub\"\n)"}
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
          code={"try:\n    await check_database()\nexcept OSError:\n    print(\"network or host problem\")\nexcept Exception:\n    print(\"inspect URL, driver and credentials\")\nelse:\n    print(\"async database path works\")"}
        />

        <BranchExplorer
          code={"try:\n    await check_database()\nexcept OSError:\n    print(\"network or host problem\")\nexcept Exception:\n    print(\"inspect URL, driver and credentials\")\nelse:\n    print(\"async database path works\")"}
          scenarios={[
            {
              label: "PostgreSQL доступен",
              activeLine: 7,
              output: "async database path works",
            },
            {
              label: "Неверный host",
              activeLine: 3,
              output: "network or host problem",
            },
            {
              label: "Неверный URL",
              activeLine: 5,
              output: "inspect URL, driver and credentials",
            },
          ]}
        />

        <TerminalDemo
          title={"проверка проектного изменения"}
          lines={[
            {
              cmd: "python -m scripts.check_async_db",
            },
            {
              out: "1",
            },
            {
              cmd: "git status --short",
            },
            {
              out: "?? app/core/database_async.py",
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
              id: "baseline",
              code: "запустить существующие sync-тесты",
              note: "",
            },
            {
              id: "engine",
              code: "добавить AsyncEngine и SELECT 1",
              note: "",
            },
            {
              id: "read",
              code: "перевести один read endpoint",
              note: "",
            },
            {
              id: "crud",
              code: "перевести один CRUD-модуль",
              note: "",
            },
            {
              id: "suite",
              code: "запустить regression suite",
              note: "",
            },
            {
              id: "delete",
              code: "удалить sync stack до сравнения",
              note: "слишком рано",
            },
          ]}
          correctOrder={[
            "baseline",
            "engine",
            "read",
            "crud",
            "suite",
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
            question={"Что выбирает +asyncpg в URL?"}
            options={[
              "async driver PostgreSQL",
              "имя таблицы",
              "режим Alembic",
            ]}
            correctIndex={0}
            explanation={"Эта часть URL выбирает driver."}
          />
          <QuizCard
            question={"Что представляет AsyncEngine?"}
            options={[
              "конфигурацию и pool",
              "одну global session",
              "копию базы",
            ]}
            correctIndex={0}
            explanation={"Engine выдаёт connections и управляет pool."}
          />
          <QuizCard
            question={"Зачем выполнять SELECT 1?"}
            options={[
              "изолировать подключение",
              "создать таблицы",
              "измерить p95",
            ]}
            correctIndex={0}
            explanation={"Минимальная проверка уменьшает область диагностики."}
          />
          <QuizCard
            question={"Почему sync-версию сохраняют?"}
            options={[
              "для сравнения и возврата",
              "async не работает",
              "для пароля",
            ]}
            correctIndex={0}
            explanation={"Поэтапный переход требует контрольной версии."}
          />
        </div>

        <KeyTakeaways
          points={[
            <>
              {"AsyncEngine требует совместимый async driver."}
            </>,
            <>
              {"Driver, engine, pool и PostgreSQL выполняют разные роли."}
            </>,
            <>
              {"Engine не является одной вечной connection."}
            </>,
            <>
              {"SELECT 1 проверяет инфраструктуру до FastAPI."}
            </>,
            <>
              {"Sync и async API нельзя смешивать."}
            </>,
            <>
              {"Миграция выполняется вертикальными шагами."}
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

        <PracticeCta text={"Добавьте async database config рядом с sync-конфигурацией, выполните SELECT 1, зафиксируйте неверный URL и сделайте отдельный Git-коммит без изменения endpoints."} />
      </Section>
    </RichLesson>
  );
}

// 160. async_sessionmaker и get_db
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

// 161. Асинхронный SELECT и CRUD
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

// 162. Асинхронные транзакции и rollback
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

// 163. Связи, N+1 и connection pool
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

// 164. Нагрузочная проверка и финальный Async StudyHub
export function Lesson164({ module }: { module?: string }) {
  return (
    <RichLesson>
      <RichHero
        variant="project"
        chip={module ?? BLOCK_TITLE}
        title={"Нагрузочная проверка и финальный Async StudyHub"}
        intro={"Завершим миграцию не обещанием «async быстрее», а воспроизводимым измерением. Зафиксируем baseline, сравним одинаковые сценарии, добавим request id и structured logs, проверим p50/p95 и подготовим Async StudyHub к технической защите."}
        tags={[
          { icon: <BarChart3 size={14} />, label: "latency и throughput" },
          { icon: <Trophy size={14} />, label: "финальная защита проекта" },
        ]}
      />

      <Callout tone="info">
        <strong>Связь с этапом.</strong>
        {" Engine, request-scoped AsyncSession, CRUD, транзакции и связи уже перенесены. Финальный шаг — доказать, что HTTP-контракт сохранился, ошибки наблюдаемы, а вывод о производительности опирается на повторяемые данные. "}
        <strong>Важно не перепутать:</strong>
        {" Один локальный benchmark не доказывает production-производительность. Результат описывает только конкретный сценарий, окружение, dataset и уровень concurrency."}
      </Callout>

      <Section number="01" title="Зачем эта тема появляется сейчас">
        <Lead>
          {"Завершим миграцию не обещанием «async быстрее», а воспроизводимым измерением. Зафиксируем baseline, сравним одинаковые сценарии, добавим request id и structured logs, проверим p50/p95 и подготовим Async StudyHub к технической защите."}
        </Lead>

        <div className="lesson-route">
          <ol>
            <li>
              <strong>{"Зафиксировать baseline: "}</strong>
              {"записать версию кода, данные, команду и параметры запуска."}
            </li>
            <li>
              <strong>{"Сравнить одинаковое: "}</strong>
              {"не менять одновременно driver, SQL, dataset и hardware."}
            </li>
            <li>
              <strong>{"Смотреть распределение: "}</strong>
              {"использовать p50 и p95, а не только среднее."}
            </li>
            <li>
              <strong>{"Связать с логами: "}</strong>
              {"проследить медленный request по request_id и SQL-событиям."}
            </li>
            <li>
              <strong>{"Закрыть регрессию: "}</strong>
              {"запустить полный набор API и database tests."}
            </li>
          </ol>
          <p>
            {"Итог занятия — проверяемое изменение Async StudyHub, а не отдельный фрагмент синтаксиса."}
          </p>
        </div>

        <TypeCards>
          <TypeCard
            badge={"LATENCY"}
            title={"Время одного запроса"}
          >
            {"p50 показывает типичный request, p95 — медленный хвост распределения."}
          </TypeCard>
          <TypeCard
            badge={"THROUGHPUT"}
            badgeTone={"float"}
            title={"Завершённые requests за время"}
          >
            {"Показатель всегда читается вместе с concurrency и error rate."}
          </TypeCard>
          <TypeCard
            badge={"TRACE"}
            badgeTone={"str"}
            title={"Путь конкретной операции"}
          >
            {"request_id связывает вход HTTP, service, database и итоговый response."}
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
          question={"Какую наблюдаемую проблему решает занятие 164?"}
          hint={"Назовите исходный риск, одно изменение и способ проверки."}
          answer={
            <p>
              {"записать версию кода, данные, команду и параметры запуска; затем результат подтверждается воспроизводимой проверкой."}
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
            [<>{"concurrency"}</>, "сколько requests выполняется одновременно"],
            [<>{"p50"}</>, "медианная latency: половина запросов быстрее этого значения"],
            [<>{"p95"}</>, "граница, быстрее которой завершились 95% requests"],
            [<>{"throughput"}</>, "число успешных requests в секунду"],
            [<>{"error rate"}</>, "доля ошибок, timeout и отклонённых запросов"],
            [<>{"baseline"}</>, "контрольный запуск до целевого изменения"],
          ]}
        />

        <MatchPairs
          prompt={"Соедините инструмент и его ответственность в этом занятии."}
          leftTitle={"Инструмент"}
          rightTitle={"Ответственность"}
          pairs={[
            {
              left: "concurrency",
              right: "сколько requests выполняется одновременно",
            },
            {
              left: "p50",
              right: "медианная latency: половина запросов быстрее этого значения",
            },
            {
              left: "p95",
              right: "граница, быстрее которой завершились 95% requests",
            },
            {
              left: "throughput",
              right: "число успешных requests в секунду",
            },
            {
              left: "error rate",
              right: "доля ошибок, timeout и отклонённых запросов",
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

      <Section number="03" title={"Минимальный воспроизводимый load-сценарий"}>
        <Lead>
          {"Разберём минимальный рабочий пример построчно. До запуска предскажите, где появляется реальное обращение к PostgreSQL и какой объект остаётся локальным."}
        </Lead>

        <CodeBlock
          caption={"минимальный рабочий пример"}
          code={"import asyncio\nfrom statistics import median\n\nimport httpx\n\n\nasync def worker(\n    client: httpx.AsyncClient,\n    samples: list[float],\n) -> None:\n    for _ in range(20):\n        started = asyncio.get_running_loop().time()\n        response = await client.get(\"/tasks?limit=20\")\n        response.raise_for_status()\n        samples.append(\n            asyncio.get_running_loop().time() - started\n        )\n\n\nasync def main() -> None:\n    samples: list[float] = []\n\n    async with httpx.AsyncClient(\n        base_url=\"http://127.0.0.1:8000\",\n        timeout=5.0,\n    ) as client:\n        await asyncio.gather(\n            *(worker(client, samples) for _ in range(10))\n        )\n\n    ordered = sorted(samples)\n    p50 = median(ordered)\n    p95 = ordered[int(len(ordered) * 0.95) - 1]\n\n    print(f\"requests={len(ordered)}\")\n    print(f\"p50={p50:.3f}s\")\n    print(f\"p95={p95:.3f}s\")\n\n\nif __name__ == \"__main__\":\n    asyncio.run(main())"}
        />

        <StepThrough
          code={"import asyncio\nfrom statistics import median\n\nimport httpx\n\n\nasync def worker(\n    client: httpx.AsyncClient,\n    samples: list[float],\n) -> None:\n    for _ in range(20):\n        started = asyncio.get_running_loop().time()\n        response = await client.get(\"/tasks?limit=20\")\n        response.raise_for_status()\n        samples.append(\n            asyncio.get_running_loop().time() - started\n        )\n\n\nasync def main() -> None:\n    samples: list[float] = []\n\n    async with httpx.AsyncClient(\n        base_url=\"http://127.0.0.1:8000\",\n        timeout=5.0,\n    ) as client:\n        await asyncio.gather(\n            *(worker(client, samples) for _ in range(10))\n        )\n\n    ordered = sorted(samples)\n    p50 = median(ordered)\n    p95 = ordered[int(len(ordered) * 0.95) - 1]\n\n    print(f\"requests={len(ordered)}\")\n    print(f\"p50={p50:.3f}s\")\n    print(f\"p95={p95:.3f}s\")\n\n\nif __name__ == \"__main__\":\n    asyncio.run(main())"}
          steps={[
            {
              line: 0,
              note: "Создаётся один сценарий, который можно запустить повторно.",
              vars: {
                "endpoint": "/tasks?limit=20",
              },
            },
            {
              line: 14,
              note: "Каждый worker выполняет 20 последовательных requests.",
              vars: {
                "per_worker": "20",
              },
            },
            {
              line: 28,
              note: "gather запускает 10 worker конкурентно.",
              vars: {
                "concurrency": "10",
              },
            },
            {
              line: 33,
              note: "Latency сортируется для расчёта распределения.",
              vars: {
                "samples": "200",
              },
            },
            {
              line: 35,
              note: "p95 показывает медленный хвост, а не единичный максимум.",
              vars: {
                "metric": "p95",
              },
            },
          ]}
        />

        <FillBlank
          prompt={"Заполните ключевой фрагмент рабочего контракта."}
          before={"p95 = ordered[int(len(ordered) * "}
          after={") - 1]"}
          options={[
            "0.95",
            "95",
            "0.05",
          ]}
          answer={"0.95"}
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
            code: "sync_run = {\n    \"endpoint\": \"/tasks?limit=20\",\n    \"rows\": 100,\n    \"concurrency\": 1,\n}\n\nasync_run = {\n    \"endpoint\": \"/tasks?limit=100\",\n    \"rows\": 50000,\n    \"concurrency\": 50,\n}",
            note: "Одновременно изменены endpoint, dataset и concurrency, поэтому разницу нельзя связать с async migration",
          }}
          right={{
            title: "Явный async-контракт",
            code: "baseline = {\n    \"endpoint\": \"/tasks?limit=20\",\n    \"rows\": 5000,\n    \"concurrency\": 10,\n    \"requests\": 200,\n    \"revision\": \"before-async-db\",\n}\n\ncandidate = {\n    **baseline,\n    \"revision\": \"async-db\",\n}",
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
          {"Один локальный benchmark не доказывает production-производительность. Результат описывает только конкретный сценарий, окружение, dataset и уровень concurrency."}
        </Callout>
      </Section>

      <Section number="05" title="Ожидаемая ошибка и диагностический порядок">
        <Lead>
          {"Ошибка ценна как проверка модели. Сначала определите нарушенное ожидание, затем найдите границу I/O, восстановите ресурс и только после этого формируйте ответ клиенту."}
        </Lead>

        <BugHunt
          code={"sync_run = {\n    \"endpoint\": \"/tasks?limit=20\",\n    \"rows\": 100,\n    \"concurrency\": 1,\n}\n\nasync_run = {\n    \"endpoint\": \"/tasks?limit=100\",\n    \"rows\": 50000,\n    \"concurrency\": 50,\n}"}
          question={"Какой дефект здесь наиболее опасен?"}
          options={[
            "Одновременно изменены endpoint, dataset и concurrency, поэтому разницу нельзя связать с async migration",
            "Асинхронный Python запрещает функции длиннее пяти строк",
            "Все SQLAlchemy-методы должны вызываться с await",
          ]}
          correctIndex={0}
          explanation={"Проблема связана с нарушением жизненного цикла или database-контракта, а не с самим словом async."}
          fix={"compare = {\n    \"same_endpoint\": True,\n    \"same_dataset\": True,\n    \"same_concurrency\": True,\n    \"same_machine\": True,\n    \"warmup_recorded\": True,\n}"}
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
          code={"import logging\nfrom uuid import uuid4\n\nlogger = logging.getLogger(\"studyhub.request\")\n\n\nasync def log_request(\n    method: str,\n    path: str,\n    handler,\n):\n    request_id = str(uuid4())\n    started = asyncio.get_running_loop().time()\n\n    try:\n        response = await handler()\n        return response\n    finally:\n        latency_ms = (\n            asyncio.get_running_loop().time() - started\n        ) * 1000\n        logger.info(\n            \"request_finished\",\n            extra={\n                \"request_id\": request_id,\n                \"method\": method,\n                \"path\": path,\n                \"latency_ms\": round(latency_ms, 2),\n            },\n        )"}
        />

        <BranchExplorer
          code={"import logging\nfrom uuid import uuid4\n\nlogger = logging.getLogger(\"studyhub.request\")\n\n\nasync def log_request(\n    method: str,\n    path: str,\n    handler,\n):\n    request_id = str(uuid4())\n    started = asyncio.get_running_loop().time()\n\n    try:\n        response = await handler()\n        return response\n    finally:\n        latency_ms = (\n            asyncio.get_running_loop().time() - started\n        ) * 1000\n        logger.info(\n            \"request_finished\",\n            extra={\n                \"request_id\": request_id,\n                \"method\": method,\n                \"path\": path,\n                \"latency_ms\": round(latency_ms, 2),\n            },\n        )"}
          scenarios={[
            {
              label: "p50 стабилен, p95 вырос",
              activeLine: 4,
              output: "исследовать ожидание pool, locks и отдельные медленные запросы",
            },
            {
              label: "throughput вырос, errors тоже",
              activeLine: 5,
              output: "результат не принят: проверить saturation и timeout",
            },
            {
              label: "метрики стабильны и тесты зелёные",
              activeLine: 2,
              output: "зафиксировать отчёт, ограничения и решение",
            },
          ]}
        />

        <TerminalDemo
          title={"проверка проектного изменения"}
          lines={[
            {
              cmd: "pytest -q",
            },
            {
              out: "148 passed",
            },
            {
              cmd: "python scripts/load_check.py",
            },
            {
              out: "requests=200\np50=0.041s\np95=0.118s",
            },
            {
              cmd: "git status --short",
            },
            {
              out: "M README.md\n?? docs/async-migration-report.md",
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
              id: "tests",
              code: "запустить регрессионные tests",
              note: "контракт приложения сохранён",
            },
            {
              id: "seed",
              code: "подготовить фиксированный dataset",
              note: "одинаковые входные условия",
            },
            {
              id: "baseline",
              code: "измерить контрольную версию",
              note: "записать p50/p95/errors",
            },
            {
              id: "candidate",
              code: "измерить async-версию тем же сценарием",
              note: "сравнить одно изменение",
            },
            {
              id: "trace",
              code: "разобрать медленный request по request_id",
              note: "связать метрику с причиной",
            },
            {
              id: "report",
              code: "обновить README и migration report",
              note: "зафиксировать ограничения",
            },
          ]}
          correctOrder={[
            "tests",
            "seed",
            "baseline",
            "candidate",
            "trace",
            "report",
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
            question={"Почему среднего времени недостаточно?"}
            options={[
              "Оно может скрыть медленный хвост, который виден в p95",
              "Среднее нельзя вычислить в Python",
              "p50 всегда равно нулю",
            ]}
            correctIndex={0}
            explanation={"Распределение latency показывает типичный и медленный сценарии отдельно."}
          />
          <QuizCard
            question={"Как сравнивать sync и async корректно?"}
            options={[
              "С одинаковым endpoint, dataset, concurrency и окружением",
              "С разными данными для реалистичности",
              "Только по одной самой быстрой попытке",
            ]}
            correctIndex={0}
            explanation={"Контролируемый эксперимент меняет одну существенную переменную."}
          />
          <QuizCard
            question={"Что связывает события одного запроса в логах?"}
            options={[
              "request_id",
              "Название виртуального окружения",
              "Порядок строк в README",
            ]}
            correctIndex={0}
            explanation={"Один идентификатор позволяет восстановить путь операции через слои."}
          />
          <QuizCard
            question={"Когда миграция Async StudyHub считается завершённой?"}
            options={[
              "Контракт сохранён, тесты проходят, ошибки наблюдаемы и измерение воспроизводимо",
              "Когда все функции получили async def",
              "Когда p50 однажды оказался меньше",
            ]}
            correctIndex={0}
            explanation={"Финальный результат включает корректность, наблюдаемость и честную фиксацию ограничений."}
          />
        </div>

        <KeyTakeaways
          points={[
            <>
              {"Async не объявляется ускорением без измерения."}
            </>,
            <>
              {"Baseline и candidate должны использовать одинаковые условия."}
            </>,
            <>
              {"Latency читается как распределение; p50 и p95 отвечают на разные вопросы."}
            </>,
            <>
              {"Throughput оценивается вместе с concurrency и error rate."}
            </>,
            <>
              {"request_id связывает HTTP-запрос, database-операции и итоговый лог."}
            </>,
            <>
              {"Полный test suite защищает HTTP-контракт при смене database stack."}
            </>,
            <>
              {"Финальный отчёт фиксирует команду запуска, dataset, окружение, результаты и ограничения."}
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

        <PracticeCta text={"Проведите финальный migration drill Async StudyHub: полный test suite, фиксированный seed, baseline и candidate load-run, разбор одного request_id и краткий отчёт с p50, p95, error rate и ограничениями."} />
      </Section>
    </RichLesson>
  );
}
