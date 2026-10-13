import { Layers, ListOrdered } from "lucide-react";
import { BranchExplorer, BugHunt, Callout, CodeSequence, CompareSolutions, KeyTakeaways, Lead, MethodGrid, RecallCard, PracticeCta, QuizCard, RichHero, RichLesson, Section, StepThrough, TypeCard, TypeCards } from "../../shared";
import { TheoryBridge } from "../../shared";
const BLOCK_TITLE = "Блок 34 · Курсы, зачисление и прогресс";

export function Lesson196({ module }: { module?: string }) {
  return (
    <RichLesson>
      <RichHero
        variant="project"
        chip={module ?? BLOCK_TITLE}
        title={"Modules, Lessons и устойчивый порядок"}
        intro={"Добавим вложенный контент курса и сделаем порядок частью database contract: позиции уникальны внутри родителя, новые элементы добавляются в конец, а reorder выполняется одной transaction с rollback."}
        tags={[
          { icon: <Layers size={14} />, label: "Course → Module → Lesson" },
          { icon: <ListOrdered size={14} />, label: "position и reorder" },
        ]}
      />
      <TheoryBridge link={"Course уже создаётся и защищён ownership. Следующий vertical slice добавляет структуру контента, не ослабляя permission: доступ к Module и Lesson проверяется через родительский Course."} boundary={"relationship помогает перемещаться между ORM-объектами, но порядок не возникает автоматически. Его нужно хранить, ограничивать и явно задавать в query или relationship order_by."} />

      <Section number={"01"} title={"Почему вложенному контенту нужен устойчивый порядок"}>
        <Lead>
          {"Module и Lesson — не просто списки Python. Их порядок должен одинаково читаться после restart, в разных requests и при concurrent изменениях."}
        </Lead>

        <div className="lesson-practice-steps">
          <h3>{"Course"}</h3>
          <p>{"Корневая сущность и permission boundary."}</p>
          <h3>{"Module"}</h3>
          <p>{"Принадлежит одному Course и имеет position внутри курса."}</p>
          <h3>{"Lesson"}</h3>
          <p>{"Принадлежит одному Module и имеет position внутри модуля."}</p>
        </div>

        <div className="lesson-route">
          <ol>
            <li>
              <strong>{"Course 42:"}</strong> {" проверить owner/admin"}
            </li>
            <li>
              <strong>{"Module position=1:"}</strong> {" создать внутри Course"}
            </li>
            <li>
              <strong>{"Lesson position=1:"}</strong> {" создать внутри Module"}
            </li>
            <li>
              <strong>{"Response:"}</strong> {" вернуть отсортированную структуру"}
            </li>
          </ol>
        </div>

        <MethodGrid
          rows={[
            [<>{"Понять"}</>, "Назовите contract и boundary текущего раздела своими словами."],
            [<>{"Предсказать"}</>, "Измените один вход или роль и заранее определите status code и database effect."],
            [<>{"Проверить"}</>, "Запустите positive и negative scenario, затем перечитайте критическое состояние новой session."],
            [<>{"Объяснить"}</>, "Свяжите HTTP response, permission, transaction и invariant одной причинной цепочкой."],
          ]}
        />

        <RecallCard
          question={"Какой invariant защищает этот раздел и какой наблюдаемый факт докажет его нарушение?"}
          answer={
            <p>
              {"Идентификатор parent передаётся в path, но разрешение на действие определяется после загрузки родителя из базы."}
            </p>
          }
        />

        <Callout tone="info">
          {"Идентификатор parent передаётся в path, но разрешение на действие определяется после загрузки родителя из базы."}
        </Callout>
      </Section>

      <Section number={"02"} title={"Foreign keys и ограничения позиции"}>
        <Lead>
          {"Foreign key гарантирует существование parent, а составной UNIQUE выражает правило «одна position внутри конкретного parent»."}
        </Lead>

        <div className="lesson-practice-steps">
          <h3>{"modules.course_id"}</h3>
          <p>{"Связывает Module с Course."}</p>
          <h3>{"lessons.module_id"}</h3>
          <p>{"Связывает Lesson с Module."}</p>
          <h3>{"Composite uniqueness"}</h3>
          <p>{"UNIQUE(course_id, position) и UNIQUE(module_id, position)."}</p>
        </div>

        <TypeCards>
          <TypeCard badge={"FK"} title={"Foreign key"} code={"module.course_id → courses.id"}>
            {"Запрещает ссылку на отсутствующего parent."}
          </TypeCard>
          <TypeCard badge={"UNIQUE"} badgeTone="float" title={"Position boundary"} code={"UNIQUE(course_id, position)"}>
            {"Повтор разрешён в другом parent, но не внутри одного."}
          </TypeCard>
          <TypeCard badge={"ORDER"} badgeTone="str" title={"Read contract"} code={"ORDER BY position, id"}>
            {"Query всегда содержит стабильный tie-breaker."}
          </TypeCard>
        </TypeCards>

        <MethodGrid
          rows={[
            [<>{"Понять"}</>, "Назовите contract и boundary текущего раздела своими словами."],
            [<>{"Предсказать"}</>, "Измените один вход или роль и заранее определите status code и database effect."],
            [<>{"Проверить"}</>, "Запустите positive и negative scenario, затем перечитайте критическое состояние новой session."],
            [<>{"Объяснить"}</>, "Свяжите HTTP response, permission, transaction и invariant одной причинной цепочкой."],
          ]}
        />

        <RecallCard
          question={"Какой invariant защищает этот раздел и какой наблюдаемый факт докажет его нарушение?"}
          answer={
            <p>
              {"Индекс и UNIQUE constraint связаны, но объясняют разные требования: быстрый доступ и допустимость данных."}
            </p>
          }
        />

        <Callout tone="info">
          {"Индекс и UNIQUE constraint связаны, но объясняют разные требования: быстрый доступ и допустимость данных."}
        </Callout>
      </Section>

      <Section number={"03"} title={"Nested endpoints читаются как путь к parent"}>
        <Lead>
          {"Вложенный path показывает контекст операции и уменьшает неоднозначность: module создаётся внутри конкретного course, lesson — внутри module."}
        </Lead>

        <div className="lesson-practice-steps">
          <h3>{"POST /courses/{course_id}/modules"}</h3>
          <p>{"Parent course загружается первым."}</p>
          <h3>{"POST /modules/{module_id}/lessons"}</h3>
          <p>{"Через module определяется course и ownership."}</p>
          <h3>{"GET structure"}</h3>
          <p>{"Результат сортируется по position на каждом уровне."}</p>
        </div>

        <BranchExplorer
          code={"POST /courses/{course_id}/modules\n→ get Course\n→ authorize owner/admin\n→ calculate next position\n→ INSERT Module"}
          scenarios={[
            { label: "course missing", activeLine: 1, output: "404" },
            { label: "other teacher", activeLine: 2, output: "403" },
            { label: "owner", activeLine: 4, output: "201 Created" },
          ]}
        />

        <MethodGrid
          rows={[
            [<>{"Понять"}</>, "Назовите contract и boundary текущего раздела своими словами."],
            [<>{"Предсказать"}</>, "Измените один вход или роль и заранее определите status code и database effect."],
            [<>{"Проверить"}</>, "Запустите positive и negative scenario, затем перечитайте критическое состояние новой session."],
            [<>{"Объяснить"}</>, "Свяжите HTTP response, permission, transaction и invariant одной причинной цепочкой."],
          ]}
        />

        <RecallCard
          question={"Какой invariant защищает этот раздел и какой наблюдаемый факт докажет его нарушение?"}
          answer={
            <p>
              {"Не доверяйте course_id, присланному внутри body, если parent уже однозначно задан path-параметром."}
            </p>
          }
        />

        <Callout tone="info">
          {"Не доверяйте course_id, присланному внутри body, если parent уже однозначно задан path-параметром."}
        </Callout>
      </Section>

      <Section number={"04"} title={"Новый элемент добавляется в конец"}>
        <Lead>
          {"Для первого рабочего варианта server вычисляет next_position как max(position)+1 внутри одного parent. Этот контракт проще ручного ввода позиции клиентом."}
        </Lead>

        <div className="lesson-practice-steps">
          <h3>{"Scope"}</h3>
          <p>{"MAX считается только для выбранного course или module."}</p>
          <h3>{"Empty parent"}</h3>
          <p>{"COALESCE возвращает 0, следующая позиция становится 1."}</p>
          <h3>{"Concurrency boundary"}</h3>
          <p>{"UNIQUE constraint остаётся последней защитой от одинакового next_position."}</p>
        </div>

        <StepThrough
          code={"stmt = select(func.coalesce(func.max(ModuleModel.position), 0)).where(\n    ModuleModel.course_id == course.id\n)\nlast_position = await session.scalar(stmt)\nmodule = ModuleModel(\n    course_id=course.id,\n    title=payload.title,\n    position=last_position + 1,\n)"}
          steps={[
            { line: 0, note: "Statement ограничен одним course.", vars: { "course.id": "42" } },
            { line: 3, note: "Scalar возвращает максимум или 0.", vars: { "last_position": "2" } },
            { line: 4, note: "Новый объект получает следующую позицию.", vars: { "position": "3" } },
          ]}
        />

        <MethodGrid
          rows={[
            [<>{"Понять"}</>, "Назовите contract и boundary текущего раздела своими словами."],
            [<>{"Предсказать"}</>, "Измените один вход или роль и заранее определите status code и database effect."],
            [<>{"Проверить"}</>, "Запустите positive и negative scenario, затем перечитайте критическое состояние новой session."],
            [<>{"Объяснить"}</>, "Свяжите HTTP response, permission, transaction и invariant одной причинной цепочкой."],
          ]}
        />

        <RecallCard
          question={"Какой invariant защищает этот раздел и какой наблюдаемый факт докажет его нарушение?"}
          answer={
            <p>
              {"На больших нагрузках стратегия position потребует более сложного coordination, но для учебного монолита важнее сначала увидеть constraint и transaction."}
            </p>
          }
        />

        <Callout tone="info">
          {"На больших нагрузках стратегия position потребует более сложного coordination, но для учебного монолита важнее сначала увидеть constraint и transaction."}
        </Callout>
      </Section>

      <Section number={"05"} title={"Reorder — одна атомарная операция"}>
        <Lead>
          {"Перестановка нескольких элементов должна завершиться полностью или не изменить ничего. Частично сохранённый порядок нарушает пользовательский контракт."}
        </Lead>

        <div className="lesson-practice-steps">
          <h3>{"Validate input"}</h3>
          <p>{"IDs уникальны и принадлежат одному parent."}</p>
          <h3>{"Temporary positions"}</h3>
          <p>{"Освобождают уникальные значения перед финальным присваиванием."}</p>
          <h3>{"Commit once"}</h3>
          <p>{"Transaction фиксирует весь новый порядок или rollback возвращает старый."}</p>
        </div>

        <CodeSequence
          title={"Соберите безопасный reorder"}
          prompt={"Расположите этапы атомарного изменения позиций."}
          pieces={[
            { id: "load", code: "загрузить все элементы parent" },
            { id: "validate", code: "сравнить набор ids с request" },
            { id: "temporary", code: "назначить временные отрицательные позиции" },
            { id: "flush", code: "await session.flush()" },
            { id: "final", code: "назначить позиции 1..N" },
            { id: "commit", code: "await session.commit()" },
            { id: "bad", code: "commit после каждого элемента", note: "создаёт частичное состояние" },
          ]}
          correctOrder={["load", "validate", "temporary", "flush", "final", "commit"]}
          explanation={"Промежуточный flush освобождает старые UNIQUE-значения внутри той же transaction."}
        />

        <MethodGrid
          rows={[
            [<>{"Понять"}</>, "Назовите contract и boundary текущего раздела своими словами."],
            [<>{"Предсказать"}</>, "Измените один вход или роль и заранее определите status code и database effect."],
            [<>{"Проверить"}</>, "Запустите positive и negative scenario, затем перечитайте критическое состояние новой session."],
            [<>{"Объяснить"}</>, "Свяжите HTTP response, permission, transaction и invariant одной причинной цепочкой."],
          ]}
        />

        <RecallCard
          question={"Какой invariant защищает этот раздел и какой наблюдаемый факт докажет его нарушение?"}
          answer={
            <p>
              {"Алгоритм временных позиций является одним из вариантов; ключевая идея — отсутствие промежуточного commit."}
            </p>
          }
        />

        <Callout tone="info">
          {"Алгоритм временных позиций является одним из вариантов; ключевая идея — отсутствие промежуточного commit."}
        </Callout>
      </Section>

      <Section number={"06"} title={"Ошибка reorder должна оставить прежний порядок"}>
        <Lead>
          {"Неизвестный id, duplicate id или элемент другого parent — ожидаемые ошибки. После них database state должен совпадать с baseline."}
        </Lead>

        <div className="lesson-practice-steps">
          <h3>{"Duplicate id"}</h3>
          <p>{"Request не описывает перестановку всех уникальных элементов."}</p>
          <h3>{"Foreign element"}</h3>
          <p>{"Нельзя перемещать Lesson из другого Module скрытым побочным эффектом."}</p>
          <h3>{"Rollback"}</h3>
          <p>{"Любая начатая mutation отменяется до следующего использования session."}</p>
        </div>

        <BugHunt
          code={"requested_ids = [10, 11, 11]\nfor position, lesson_id in enumerate(requested_ids, start=1):\n    lesson = lessons_by_id[lesson_id]\n    lesson.position = position\nawait session.commit()"}
          question={"Почему такой reorder нельзя выполнять?"}
          options={["Request содержит duplicate id и не описывает полный набор", "enumerate нельзя применять к list", "position должна быть строкой"]}
          correctIndex={0}
          explanation={"Без проверки множества ids один Lesson получает последнее значение, а другой исчезает из порядка."}
          fix={"if len(requested_ids) != len(set(requested_ids)):\n    raise HTTPException(status_code=422, detail=\"lesson ids must be unique\")"}
        />

        <MethodGrid
          rows={[
            [<>{"Понять"}</>, "Назовите contract и boundary текущего раздела своими словами."],
            [<>{"Предсказать"}</>, "Измените один вход или роль и заранее определите status code и database effect."],
            [<>{"Проверить"}</>, "Запустите positive и negative scenario, затем перечитайте критическое состояние новой session."],
            [<>{"Объяснить"}</>, "Свяжите HTTP response, permission, transaction и invariant одной причинной цепочкой."],
          ]}
        />

        <RecallCard
          question={"Какой invariant защищает этот раздел и какой наблюдаемый факт докажет его нарушение?"}
          answer={
            <p>
              {"Validation до mutation делает ошибочный путь дешевле и снижает необходимость восстанавливать изменённые ORM-objects."}
            </p>
          }
        />

        <Callout tone="info">
          {"Validation до mutation делает ошибочный путь дешевле и снижает необходимость восстанавливать изменённые ORM-objects."}
        </Callout>
      </Section>

      <Section number={"07"} title={"Чтение структуры: сортировка и ограничение N+1"}>
        <Lead>
          {"Публичная структура курса должна возвращать modules и lessons в согласованном порядке и не создавать отдельный query на каждый child."}
        </Lead>

        <div className="lesson-practice-steps">
          <h3>{"Stable order"}</h3>
          <p>{"ORDER BY position, id."}</p>
          <h3>{"Eager loading"}</h3>
          <p>{"selectinload загружает коллекции контролируемым числом queries."}</p>
          <h3>{"Response shape"}</h3>
          <p>{"Вложенные schemas не включают обратные ссылки и не создают recursion."}</p>
        </div>

        <CompareSolutions
          question={"Как получить Course structure?"}
          left={{
            title: "Ленивая навигация в цикле",
            code: "for module in course.modules:\n    for lesson in module.lessons: ...",
            note: "Может породить N+1 и скрыть запросы.",
          }}
          right={{
            title: "Явный statement",
            code: "select(CourseModel).options(\n    selectinload(CourseModel.modules)\n      .selectinload(ModuleModel.lessons)\n)",
            note: "План загрузки виден рядом с use case.",
          }}
          preferred="right"
          explanation={"Read-path должен явно управлять загрузкой связанных коллекций."}
        />

        <MethodGrid
          rows={[
            [<>{"Понять"}</>, "Назовите contract и boundary текущего раздела своими словами."],
            [<>{"Предсказать"}</>, "Измените один вход или роль и заранее определите status code и database effect."],
            [<>{"Проверить"}</>, "Запустите positive и negative scenario, затем перечитайте критическое состояние новой session."],
            [<>{"Объяснить"}</>, "Свяжите HTTP response, permission, transaction и invariant одной причинной цепочкой."],
          ]}
        />

        <RecallCard
          question={"Какой invariant защищает этот раздел и какой наблюдаемый факт докажет его нарушение?"}
          answer={
            <p>
              {"Оптимизация не отменяет correctness: сначала проверяются ownership, фильтры и порядок, затем количество SQL statements."}
            </p>
          }
        />

        <Callout tone="info">
          {"Оптимизация не отменяет correctness: сначала проверяются ownership, фильтры и порядок, затем количество SQL statements."}
        </Callout>
      </Section>

      <Section number="08" title="Контрольная точка и проектная практика">
        <Lead>
          {"Соберите модель урока в один проверяемый результат: выполните основной LMS-scenario, намеренно воспроизведите ошибку, докажите отсутствие нежелательного изменения и объясните выбранный contract без чтения готового текста."}
        </Lead>

        <div className="lesson-check-group">
          <QuizCard
            question={"Где уникальна Module.position?"}
            options={["Внутри одного Course", "Во всей базе", "Только в response"]}
            correctIndex={0}
            explanation={"Составной constraint включает course_id."}
          />
          <QuizCard
            question={"Зачем reorder одна transaction?"}
            options={["Не допустить частичный порядок", "Ускорить Pydantic", "Создать JWT"]}
            correctIndex={0}
            explanation={"Все позиции меняются атомарно."}
          />
          <QuizCard
            question={"Что проверяется до mutation?"}
            options={["Полнота и уникальность ids", "Только длина title", "HTTP method сервера"]}
            correctIndex={0}
            explanation={"Невалидный request не должен менять ORM-state."}
          />
          <QuizCard
            question={"Как избежать скрытого N+1?"}
            options={["Явно задать loading strategy", "Удалить foreign keys", "Использовать global session"]}
            correctIndex={0}
            explanation={"selectinload делает read plan наблюдаемым."}
          />
        </div>

        <KeyTakeaways
          points={[
            <>{"Course остаётся permission boundary для вложенного контента."}</>,
            <>{"Position хранится в базе и ограничивается внутри parent."}</>,
            <>{"Новый child добавляется в конец server-side."}</>,
            <>{"Reorder проверяет полный набор ids до mutation."}</>,
            <>{"Все позиции меняются одной transaction."}</>,
            <>{"Read-path задаёт stable ordering и loading strategy."}</>,
          ]}
        />

        <PracticeCta text={"Добавьте Module и Lesson, nested create endpoints, composite UNIQUE constraints, append-to-end и атомарный reorder. Покройте duplicate ids, foreign child, rollback и стабильную сортировку."} />
      </Section>
    </RichLesson>
  );
}
