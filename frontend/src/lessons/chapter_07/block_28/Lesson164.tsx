import { BarChart3, Trophy } from "lucide-react";
import { BranchExplorer, BugHunt, Callout, CodeBlock, CodeSequence, CompareSolutions, FillBlank, FlipCards, KeyTakeaways, Lead, MatchPairs, MethodGrid, PracticeCta, QuizCard, RecallCard, RichHero, RichLesson, Section, StepThrough, TerminalDemo, TrueFalse, TypeCard, TypeCards } from "../../shared";
const BLOCK_TITLE = "Блок 28 · Async SQLAlchemy, нагрузка и наблюдаемость";

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
