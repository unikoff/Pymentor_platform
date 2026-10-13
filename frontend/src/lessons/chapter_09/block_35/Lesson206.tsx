import { Activity, TestTube2 } from "lucide-react";
import { BranchExplorer, BugHunt, Callout, CodeBlock, CompareSolutions, KeyTakeaways, Lead, MatchPairs, MethodGrid, PracticeCta, PredictOutput, QuizCard, RecallCard, RichHero, RichLesson, Section, TerminalDemo, TrueFalse } from "../../shared";
import { TheoryBridge } from "../../shared";
const BLOCK_TITLE = "Блок 35 · Redis, кеш и фоновые операции";

export function Lesson206({ module }: { module?: string }) {
  return (
    <RichLesson>
      <RichHero
        variant="project"
        chip={module ?? BLOCK_TITLE}
        title={"Тестирование кеша, rate limit и фоновых ошибок"}
        intro={
          "Финализируем блок измеримыми сценариями: проверяем cache miss/hit, invalidation, TTL, 429, Redis unavailable fallback, BackgroundTasks и ошибки уведомления так, чтобы Redis не превращал StudyHub в хрупкую систему."
        }
        tags={[
          { icon: <TestTube2 size={14} />, label: "integration tests" },
          { icon: <Activity size={14} />, label: "degradation matrix" },
        ]}
      />
      <TheoryBridge link={"Кеш, invalidation, rate limit и background action работают по отдельности. Финальный урок должен доказать их совместимость, наблюдаемость и предсказуемую деградацию без реальной внешней сети."} boundary={"Тесты не маскируют PostgreSQL failure кешем и не утверждают performance benefit по одному случайному числу. Production load testing и полноценный observability stack остаются отдельными задачами."} />

      <Section number={"01"} title={"Что именно должен доказать test suite"}>
        <Lead>
          {
            "Недостаточно проверить, что redis.get был вызван. Тесты описывают пользовательские эффекты: одинаковый response при hit/miss, свежий каталог после write, 429 без side effect, работа read-path при Redis failure и видимая background error."
          }
        </Lead>

        <div className="lesson-route">
          <ol>
            <li>
              <strong>{"Изолировать:"}</strong>{" "}
              {"заменить Redis test instance или fake dependency"}
            </li>
            <li>
              <strong>{"Наблюдать:"}</strong>{" "}
              {"считать database calls, cache events и notification results"}
            </li>
            <li>
              <strong>{"Ломать:"}</strong>{" "}
              {"инъецировать RedisError и ProviderError"}
            </li>
            <li>
              <strong>{"Сверить:"}</strong>{" "}
              {"проверить HTTP contract и logs в каждом режиме"}
            </li>
          </ol>
          <p>
            {
              "Результат урока — test matrix и повторяемый набор проверок для всех эксплуатационных функций блока."
            }
          </p>
        </div>

        <Callout tone={"info"}>
          {
            "Хороший failure test заранее фиксирует ожидаемую деградацию. Он не просто ждёт, что приложение «не упадёт»."
          }
        </Callout>
      </Section>

      <Section number={"02"} title={"Fake Redis или изолированный service"}>
        <Lead>
          {
            "Unit tests могут использовать небольшой fake с get/set/delete/incr/ttl, а integration tests — отдельную Redis database или Compose service. Главное — очищать state между tests и не зависеть от developer Redis."
          }
        </Lead>

        <CompareSolutions
          question={"Как разделить уровни проверки?"}
          left={{
            title: "Только mock вызовов",
            code: `redis.get.assert_called_once()`,
            note: "Быстро, но не проверяет TTL, counter и реальные данные.",
          }}
          right={{
            title: "Fake + integration Redis",
            code: `unit policy tests + small real integration suite`,
            note: "Policy проверяется быстро, а протокол и TTL подтверждаются отдельно.",
          }}
          preferred={"right"}
          explanation={
            "Комбинация даёт быстрый feedback и несколько проверок реального поведения Redis."
          }
        />

        <MethodGrid
          rows={[
            ["unit", "key builder, serialization, branches и exception policy"],
            ["service", "cache service с fake repository и fake Redis"],
            [
              "integration",
              "FastAPI client + PostgreSQL test DB + isolated Redis",
            ],
            ["manual", "latency/log scenario в Compose"],
          ]}
        />
      </Section>

      <Section number={"03"} title={"Cache hit, invalidation и TTL"}>
        <Lead>
          {
            "Test считает обращения repository. На первом request fake Redis пуст, repository вызывается один раз и value появляется. На втором request repository call count остаётся один, а response полностью совпадает."
          }
        </Lead>

        <CodeBlock
          caption={"repository вызывается только на miss"}
          code={`async def test_catalog_cache_miss_then_hit(
            client,
            catalog_repository,
            redis,
        ):
            first = await client.get("/courses?page=1")
            second = await client.get("/courses?page=1")
        
            assert first.status_code == 200
            assert second.json() == first.json()
            assert catalog_repository.list_calls == 1
            assert await redis.get(
                "studyhub:catalog:g1:page=1:size=20:category=all"
            ) is not None`}
        />

        <PredictOutput
          code={`repository_calls = 0
        cache = {}
        for _ in range(2):
            if "catalog" not in cache:
                repository_calls += 1
                cache["catalog"] = ["SQL"]
        print(repository_calls)`}
          output={`1`}
          hint={"Второй read использует уже заполненный cache value."}
        />

        <Lead>
          {
            "Invalidation test воспроизводит Old → PATCH → New. TTL policy удобнее проверять через fake clock или короткий isolated Redis TTL, а не ждать минуту в каждом test. Test должен оставаться быстрым и детерминированным."
          }
        </Lead>

        <CodeBlock
          caption={"stale scenario становится тестом"}
          code={`async def test_update_invalidates_catalog(client):
            old = await client.get("/courses")
        
            updated = await client.patch(
                "/courses/42",
                json={"title": "New title"},
            )
        
            fresh = await client.get("/courses")
        
            assert old.json()[0]["title"] == "Old title"
            assert updated.status_code == 200
            assert fresh.json()[0]["title"] == "New title"`}
        />

        <TrueFalse
          statement={<>{"Надёжный TTL test обязан выполнять sleep(60)."}</>}
          isTrue={false}
          explanation={
            "Можно использовать короткий TTL, fake clock или проверку expiration metadata."
          }
        />
      </Section>

      <Section
        number={"04"}
        title={"Rate limit: status и отсутствие side effect"}
      >
        <Lead>
          {
            "Тест делает limit разрешённых requests, затем ещё один. Для заблокированного вызова проверяются 429, Retry-After и неизменившийся notification call count. После reset следующий request снова разрешён."
          }
        </Lead>

        <CodeBlock
          caption={"429 не запускает действие"}
          code={`async def test_reminder_rate_limit(client, notifier):
            for _ in range(3):
                response = await client.post(
                    "/courses/42/reminders"
                )
                assert response.status_code == 200
        
            blocked = await client.post(
                "/courses/42/reminders"
            )
        
            assert blocked.status_code == 429
            assert int(blocked.headers["Retry-After"]) >= 1
            assert notifier.calls == 3`}
        />

        <BranchExplorer
          code={`if request_number <= 3:
            notifier.send()
            return 200
        else:
            return 429
        # after reset -> 200`}
          scenarios={[
            {
              label: "1–3",
              activeLine: 2,
              output: "200 и notifier.calls растёт",
            },
            {
              label: "4",
              activeLine: 5,
              output: "429, notifier.calls не меняется",
            },
            {
              label: "после reset",
              activeLine: 6,
              output: "200 и новый window",
            },
          ]}
        />
      </Section>

      <Section number={"05"} title={"Redis unavailable matrix"}>
        <Lead>
          {
            "Failure injection должен различать функции. Catalog read работает через PostgreSQL; invalidation failure логируется после успешного update; reminder limiter следует задокументированному fail-open; PostgreSQL failure по-прежнему возвращает database error и не скрывается старым кешем."
          }
        </Lead>

        <MatchPairs
          prompt={"Соедините отказ dependency и ожидаемое поведение."}
          leftTitle={"Сбой"}
          rightTitle={"Ожидаемое поведение"}
          pairs={[
            {
              left: "Redis GET error в каталоге",
              right: "PostgreSQL fallback + warning",
            },
            {
              left: "Redis invalidation error после commit",
              right:
                "write успешен + error log + TTL ограничивает stale window",
            },
            {
              left: "Redis rate-limit error",
              right: "fail-open reminder + warning",
            },
            {
              left: "PostgreSQL error",
              right: "не маскировать обычным cache miss",
            },
          ]}
          explanation={"Каждая функция имеет отдельную degradation policy."}
        />

        <BugHunt
          code={`try:
            return await get_catalog()
        except Exception:
            return decode(await redis.get("catalog"))`}
          question={"Почему fallback опасен?"}
          options={[
            "PostgreSQL и programming errors скрываются устаревшим кешем",
            "Redis нельзя читать",
            "HTTP response всегда должен быть пустым",
          ]}
          correctIndex={0}
          explanation={
            "Широкий except маскирует source-of-truth failure и дефекты кода."
          }
          fix={`try:
            cached = await redis.get(key)
        except RedisError:
            cached = None
        
        # PostgreSQL errors проходят отдельно
        return await load_from_db_if_needed(cached)`}
        />
      </Section>

      <Section number={"06"} title={"Background task: успех и ошибка"}>
        <Lead>
          {
            "TestClient обычно выполняет зарегистрированные BackgroundTasks до завершения тестового response context, поэтому можно проверить созданную строку или spy call. Для ошибки provider проверяется logger record, а enrollment остаётся сохранённым."
          }
        </Lead>

        <CodeBlock
          caption={"ошибка вторичного действия не отменяет enrollment"}
          code={`async def test_enrollment_survives_notification_error(
            client,
            failing_notifier,
            caplog,
            enrollment_repository,
        ):
            response = await client.post(
                "/courses/42/enrollments"
            )
        
            assert response.status_code == 201
            assert await enrollment_repository.exists(
                response.json()["id"]
            )
            assert "background notification failed" in caplog.text`}
        />

        <RecallCard
          question={"Какие две независимые вещи проверяет этот test?"}
          hint={"Разделите главный результат и вторичную операцию."}
          answer={
            <p>
              {
                "Product fact Enrollment сохранён, а background failure наблюдаем в logs. Одно не подменяет другое."
              }
            </p>
          }
        />
      </Section>

      <Section
        number={"07"}
        title={"Финальная dashboard сценариев и измерение"}
      >
        <Lead>
          {
            "Блок завершается таблицей сценариев и повторным измерением каталога. Ученик показывает cache hit ratio на маленьком demo, latency miss/hit, число 429 и background errors, но не делает громких выводов без нагрузки."
          }
        </Lead>

        <TerminalDemo
          title={"финальный набор проверок"}
          lines={[
            { cmd: `pytest tests/cache tests/rate_limit tests/background -q` },
            { out: `18 passed` },
            { cmd: `python scripts/measure_catalog.py --requests 20` },
            { out: `miss=1 hit=19 avg_hit_ms=11.8 avg_miss_ms=82.4` },
            {
              cmd: `docker compose logs api | grep -E "cache|rate_limit|background" | tail`,
            },
            {
              out: `catalog_cache hit
        rate_limit blocked user=42
        background notification failed enrollment=91`,
            },
          ]}
        />

        <Callout>
          {
            "Измерение описывает конкретную среду и demo dataset. Оно подтверждает механизм, но не заменяет production profiling."
          }
        </Callout>
      </Section>

      <Section number={"08"} title={"Контрольная точка: устойчивый Redis-блок"}>
        <Lead>
          {
            "Проверьте не только знание команд, но и способность проследить путь данных, назвать source of truth, предсказать режим деградации и объяснить результат теста без чтения готового ответа."
          }
        </Lead>

        <div className="lesson-check-group">
          <QuizCard
            question={"Что доказывает cache hit test?"}
            options={[
              "Одинаковый response и отсутствие второго repository call",
              "Только status 200",
              "Наличие Redis image",
            ]}
            correctIndex={0}
            explanation={"Проверяется наблюдаемое поведение и источник данных."}
          />
          <QuizCard
            question={"Что проверять при 429?"}
            options={[
              "Retry-After и отсутствие side effect",
              "Только JSON title",
              "Database migration",
            ]}
            correctIndex={0}
            explanation={"Заблокированный action не должен выполняться."}
          />
          <QuizCard
            question={"Как каталог ведёт себя при Redis GET error?"}
            options={[
              "Читает PostgreSQL и логирует warning",
              "Удаляет courses",
              "Всегда возвращает 429",
            ]}
            correctIndex={0}
            explanation={"Кеш является временной оптимизацией."}
          />
          <QuizCard
            question={"Что должно остаться после background error?"}
            options={[
              "Committed enrollment и error log",
              "Откат PostgreSQL",
              "Пустой response",
            ]}
            correctIndex={0}
            explanation={"Вторичная операция не отменяет product transaction."}
          />
        </div>

        <KeyTakeaways
          points={[
            <>
              {
                "Tests проверяют пользовательский эффект, а не только вызовы Redis methods."
              }
            </>,
            <>
              {
                "Miss/hit подтверждаются repository call count и одинаковым response."
              }
            </>,
            <>{"Invalidation test воспроизводит Old → write → New."}</>,
            <>{"TTL проверяется детерминированно без длинных ожиданий."}</>,
            <>
              {
                "Rate-limit test проверяет 429, Retry-After и отсутствие side effect."
              }
            </>,
            <>
              {
                "Redis failure имеет отдельную policy для cache, invalidation и limiter."
              }
            </>,
            <>
              {
                "Background error оставляет product transaction и создаёт наблюдаемый log."
              }
            </>,
          ]}
        />

        <PracticeCta
          text={
            "Создайте test matrix минимум из 10 сценариев: miss, hit, different filter key, invalidation, TTL, 429, reset, Redis GET failure, Redis invalidation failure, notification success и failure. Добавьте scripts/measure_catalog.py и обновите README фактическими командами и ограничениями измерения."
          }
        />
      </Section>
    </RichLesson>
  );
}
