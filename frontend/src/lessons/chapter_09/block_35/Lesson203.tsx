import { GitBranch, RefreshCcw } from "lucide-react";
import { BugHunt, Callout, CodeBlock, CodeSequence, CompareSolutions, KeyTakeaways, Lead, MethodGrid, PracticeCta, PredictOutput, QuizCard, RecallCard, RichHero, RichLesson, Section, StepThrough, TrueFalse, TypeCard, TypeCards } from "../../shared";
import { TheoryBridge } from "../../shared";
const BLOCK_TITLE = "Блок 35 · Redis, кеш и фоновые операции";

export function Lesson203({ module }: { module?: string }) {
  return (
    <RichLesson>
      <RichHero
        variant="project"
        chip={module ?? BLOCK_TITLE}
        title={"Cache invalidation после изменения курса"}
        intro={
          "Решаем главную цену кеша — устаревшие данные. После успешных publish, update и delete удаляем затронутые catalog keys, соблюдаем порядок commit → invalidate и тестируем сценарий, в котором stale response больше не переживает изменение PostgreSQL."
        }
        tags={[
          { icon: <RefreshCcw size={14} />, label: "invalidation" },
          { icon: <GitBranch size={14} />, label: "commit → delete key" },
        ]}
      />
      <TheoryBridge link={"Cache-aside ускорил повторное чтение, но теперь Redis может продолжить отдавать старый каталог после изменения курса. Значит write-path должен сообщить кешу, что прежняя копия больше недействительна."} boundary={"Урок использует простую invalidation policy: известные keys или versioned namespace. Distributed events, tag-based invalidation и сложная согласованность нескольких сервисов не вводятся."} />

      <Section
        number={"01"}
        title={"Stale data появляется после успешного ускорения"}
      >
        <Lead>
          {
            "Кеш не наблюдает PostgreSQL. Если teacher переименовал или опубликовал курс, старый JSON остаётся валидным для Redis до TTL, но уже неверным для продукта. Это состояние называется stale data."
          }
        </Lead>

        <div className="lesson-route">
          <ol>
            <li>
              <strong>{"Воспроизвести:"}</strong>{" "}
              {"заполнить кеш старым каталогом"}
            </li>
            <li>
              <strong>{"Изменить:"}</strong>{" "}
              {"успешно обновить course в PostgreSQL"}
            </li>
            <li>
              <strong>{"Инвалидировать:"}</strong>{" "}
              {"удалить keys только после commit"}
            </li>
            <li>
              <strong>{"Проверить:"}</strong>{" "}
              {"следующий GET должен стать miss и вернуть новое значение"}
            </li>
          </ol>
          <p>
            {
              "Результат урока — write-path, после которого старый каталог не остаётся незамеченным."
            }
          </p>
        </div>

        <Callout tone={"info"}>
          {
            "TTL ограничивает максимальную длительность stale data, но не заменяет invalidation после известного изменения."
          }
        </Callout>
      </Section>

      <Section
        number={"02"}
        title={"Правильный порядок: commit, затем invalidation"}
      >
        <Lead>
          {
            "До commit изменение ещё может завершиться rollback. Если удалить cache key раньше, другой request заполнит кеш старыми database data, а текущая transaction затем может commit. Получится свежий по времени, но устаревший value."
          }
        </Lead>

        <CodeSequence
          title={"Соберите безопасный write-path"}
          prompt={
            "Расположите действия update course так, чтобы кеш отражал только подтверждённую transaction."
          }
          pieces={[
            { id: "load", code: "course = await repository.get(course_id)" },
            { id: "change", code: "course.title = payload.title" },
            { id: "commit", code: "await session.commit()" },
            { id: "refresh", code: "await session.refresh(course)" },
            { id: "invalidate", code: "await catalog_cache.invalidate()" },
            {
              id: "wrong",
              code: "await catalog_cache.invalidate()  # до commit",
              note: "создаёт окно гонки",
            },
          ]}
          correctOrder={["load", "change", "commit", "refresh", "invalidate"]}
          explanation={
            "Инвалидация выполняется только после подтверждения source of truth."
          }
        />
      </Section>

      <Section number={"03"} title={"Ошибка invalidation до commit"}>
        <Lead>
          {
            "Порядок легко перепутать, потому что delete key технически не зависит от database session. Но бизнес-смысл зависит: кеш становится недействительным только после успешного изменения основной записи."
          }
        </Lead>

        <BugHunt
          code={`await catalog_cache.invalidate()
        course.title = payload.title
        await session.commit()`}
          question={"Почему такой порядок опасен?"}
          options={[
            "Cache удалён до гарантии commit",
            "Redis запрещает DELETE",
            "Title нельзя менять",
          ]}
          correctIndex={0}
          explanation={
            "Transaction может откатиться или другой request может заполнить кеш между delete и commit."
          }
          fix={`course.title = payload.title
        await session.commit()
        await session.refresh(course)
        await catalog_cache.invalidate()`}
        />

        <Callout>
          {
            "Если invalidation после commit не удалась, database data уже изменены. Нужно логировать проблему и полагаться на короткий TTL либо повторный механизм, но нельзя откатывать успешный HTTP write только из-за временного кеша без явного контракта."
          }
        </Callout>
      </Section>

      <Section number={"04"} title={"Как удалить несколько вариантов каталога"}>
        <Lead>
          {
            "Каталог имеет keys для разных страниц и filters. Удалить один точный key недостаточно. Для учебного проекта подходят небольшой registry известных keys или versioned namespace, где смена версии делает старые entries недоступными."
          }
        </Lead>

        <TypeCards>
          <TypeCard
            badge={"known keys"}
            title={"Удалить зарегистрированные keys"}
            code={`await redis.delete(*keys)`}
          >
            {"Просто и прозрачно при небольшом конечном наборе вариантов."}
          </TypeCard>
          <TypeCard
            badge={"version"}
            badgeTone={"float"}
            title={"Поднять generation"}
            code={`catalog:version = 18`}
          >
            {
              "Новые reads формируют keys с новой generation, старые исчезают по TTL."
            }
          </TypeCard>
          <TypeCard
            badge={"SCAN"}
            badgeTone={"str"}
            title={"Осторожный поиск"}
            code={`SCAN studyhub:catalog:v1:*`}
          >
            {
              "Возможен для tooling, но не должен превращаться в KEYS на горячем production-path."
            }
          </TypeCard>
        </TypeCards>

        <CompareSolutions
          question={"Какой вариант подходит маленькому учебному каталогу?"}
          left={{
            title: "KEYS + DELETE на каждый update",
            code: `keys = await redis.keys("studyhub:catalog:*")`,
            note: "Глобальный поиск может блокировать Redis на большом keyspace.",
          }}
          right={{
            title: "Versioned generation",
            code: `key = f"catalog:g{generation}:page={page}"`,
            note: "Write увеличивает generation, старые values доживают TTL.",
          }}
          preferred={"right"}
          explanation={
            "Generation делает invalidation ограниченной операцией без полного обхода keyspace."
          }
        />
      </Section>

      <Section number={"05"} title={"Versioned namespace пошагово"}>
        <Lead>
          {
            "Отдельный key хранит текущую generation каталога. Read сначала получает generation и включает её в data key. Write после commit увеличивает generation. Следующий read не видит старый key и выполняет miss."
          }
        </Lead>

        <StepThrough
          code={`generation = await redis.get("studyhub:catalog:generation") or "1"
        key = f"studyhub:catalog:g{generation}:page=1"
        cached = await redis.get(key)
        
        # после успешного commit
        await redis.incr("studyhub:catalog:generation")`}
          steps={[
            {
              line: 0,
              note: "Read получает текущую generation.",
              vars: { generation: "17" },
            },
            {
              line: 1,
              note: "Data key привязан к generation 17.",
              vars: { key: "catalog:g17:page=1" },
            },
            {
              line: 2,
              note: "Redis может вернуть старый каталог только внутри текущей generation.",
              vars: { cache: "hit или miss" },
            },
            {
              line: 5,
              note: "После commit write повышает generation.",
              vars: { generation: "18" },
            },
            {
              line: 1,
              note: "Следующий read строит g18 и получает miss.",
              vars: { "old g17": "недоступен и истечёт по TTL" },
            },
          ]}
        />

        <TrueFalse
          statement={
            <>
              {
                "Повышение generation обязано немедленно физически удалить все старые values."
              }
            </>
          }
          isTrue={false}
          explanation={
            "Старые keys становятся недостижимыми для новых reads и удаляются по TTL."
          }
        />
      </Section>

      <Section number={"06"} title={"Fail-safe invalidation"}>
        <Lead>
          {
            "Redis может быть недоступен после database commit. Write endpoint не должен притворяться, что commit не произошёл. Service логирует invalidation failure с course_id и generation, а короткий TTL ограничивает stale window."
          }
        </Lead>

        <CodeBlock
          caption={"commit остаётся главным фактом"}
          code={`await session.commit()
        await session.refresh(course)
        
        try:
            await catalog_cache.invalidate()
        except RedisError:
            logger.error(
                "catalog invalidation failed",
                extra={"course_id": course.id},
            )
        
        return CourseRead.model_validate(course)`}
        />

        <RecallCard
          question={
            "Почему нельзя выполнить rollback после успешного commit только из-за RedisError?"
          }
          hint={"Отделите database transaction от best-effort кеша."}
          answer={
            <p>
              {
                "Commit уже изменил source of truth. Rollback новой session state не отменит зафиксированную transaction, а клиенту нужен честный контракт о результате database write."
              }
            </p>
          }
        />
      </Section>

      <Section number={"07"} title={"Тест stale scenario"}>
        <Lead>
          {
            "Полезный тест не просто проверяет вызов delete. Он воспроизводит пользовательский путь: первый GET заполняет старое значение, PATCH меняет course, второй GET возвращает новое title и выполняет database read из-за miss."
          }
        </Lead>

        <MethodGrid
          rows={[
            [
              "Arrange",
              "создать published course и сделать первый GET /courses",
            ],
            ["Assert cache", "подтвердить старое title в cache value"],
            ["Act write", "выполнить PATCH и дождаться успешного commit"],
            ["Act read", "повторить тот же GET /courses"],
            ["Assert fresh", "увидеть новое title и miss log"],
          ]}
        />

        <PredictOutput
          code={`first = await client.get("/courses")
        await client.patch("/courses/42", json={"title": "New"})
        second = await client.get("/courses")
        print(first.json()[0]["title"])
        print(second.json()[0]["title"])`}
          output={`Old
        New`}
          hint={
            "PATCH после commit инвалидирует прежнюю generation; второй GET заново читает PostgreSQL."
          }
        />
      </Section>

      <Section number={"08"} title={"Контрольная точка: cache invalidation"}>
        <Lead>
          {
            "Проверьте не только знание команд, но и способность проследить путь данных, назвать source of truth, предсказать режим деградации и объяснить результат теста без чтения готового ответа."
          }
        </Lead>

        <div className="lesson-check-group">
          <QuizCard
            question={"Когда выполнять invalidation?"}
            options={[
              "После успешного database commit",
              "До загрузки course",
              "Только при старте",
            ]}
            correctIndex={0}
            explanation={
              "Кеш становится устаревшим после подтверждённого изменения source of truth."
            }
          />
          <QuizCard
            question={"Что такое stale data?"}
            options={[
              "Кешированное значение, не соответствующее текущей базе",
              "Любой JSON",
              "Истёкший access token",
            ]}
            correctIndex={0}
            explanation={
              "Stale value формально читается, но уже неверен для продукта."
            }
          />
          <QuizCard
            question={"Зачем нужна generation?"}
            options={[
              "Сделать старые keys недоступными без полного обхода",
              "Заменить PostgreSQL id",
              "Продлить transaction",
            ]}
            correctIndex={0}
            explanation={"Read использует только текущую generation."}
          />
          <QuizCard
            question={"Что делать при RedisError после commit?"}
            options={[
              "Логировать и ограничить stale window TTL",
              "Притвориться, что database write не был выполнен",
              "Удалить PostgreSQL",
            ]}
            correctIndex={0}
            explanation={"Source of truth уже изменён."}
          />
        </div>

        <KeyTakeaways
          points={[
            <>{"Кеш создаёт риск stale data после любого write-path."}</>,
            <>{"Безопасный порядок — database commit, затем invalidation."}</>,
            <>
              {
                "TTL ограничивает stale window, но не заменяет известную invalidation."
              }
            </>,
            <>{"Разные filter/page keys требуют общей invalidation policy."}</>,
            <>
              {
                "Versioned generation делает старые keys недоступными новым reads."
              }
            </>,
            <>
              {"Redis failure после commit не отменяет факт database write."}
            </>,
            <>{"Интеграционный тест должен доказать Old → write → New."}</>,
          ]}
        />

        <PracticeCta
          text={
            "Добавьте invalidation после publish, update и delete course. Реализуйте versioned generation либо registry keys, воспроизведите ошибочный порядок invalidate-before-commit, затем напишите тест: первый GET возвращает Old, PATCH фиксирует New, второй GET возвращает New и логирует cache miss."
          }
        />
      </Section>
    </RichLesson>
  );
}
