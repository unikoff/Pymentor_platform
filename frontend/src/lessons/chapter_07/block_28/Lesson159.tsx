import { GitFork, Layers } from "lucide-react";
import { BranchExplorer, BugHunt, Callout, CodeBlock, CodeSequence, CompareSolutions, FillBlank, FlipCards, KeyTakeaways, Lead, MatchPairs, MethodGrid, PracticeCta, QuizCard, RecallCard, RichHero, RichLesson, Section, StepThrough, TerminalDemo, TrueFalse, TypeCard, TypeCards } from "../../shared";
const BLOCK_TITLE = "Блок 28 · Async SQLAlchemy, нагрузка и наблюдаемость";

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
