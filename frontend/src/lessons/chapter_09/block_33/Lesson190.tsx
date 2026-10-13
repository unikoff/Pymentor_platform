import { Boxes, Database } from "lucide-react";
import { BranchExplorer, BugHunt, Callout, CodeBlock, CompareSolutions, FillBlank, FlipCards, KeyTakeaways, Lead, MethodGrid, PracticeCta, QuizCard, RecallCard, RichHero, RichLesson, Section, StepThrough, TrueFalse, TypeCard, TypeCards } from "../../shared";
const BLOCK_TITLE = "Блок 33 · Проектирование StudyHub LMS Core";

type LessonProps = { module?: string };

export function Lesson190({ module }: LessonProps) {
  return (
    <RichLesson>
      <RichHero
        variant="project"
        chip={module ?? BLOCK_TITLE}
        title={"Course, Module и Lesson: структура учебного контента"}
        intro={"Спроектируем ядро учебного контента: Course содержит упорядоченные Module, Module содержит Lesson, foreign keys сохраняют связь, position фиксирует порядок, а draft/published отделяет подготовку от публичного каталога."}
        tags={[
          { icon: <Boxes size={14} />, label: "Course → Module → Lesson" },
          { icon: <Database size={14} />, label: "foreign keys и constraints" },
        ]}
      />
      <Callout tone="info">
        <strong>{"Связь с курсом."}</strong> {" Product brief уже определил основной flow. Теперь нужно превратить слова «курс», «модуль» и «урок» в устойчивые сущности, которые поддерживают публикацию и прохождение. "}
        <strong>{"Важно не перепутать:"}</strong> {" Схема описывает структуру и инварианты, но не пытается хранить все уроки одним JSON-полем или реализовать полноценное медиа-хранилище."}
      </Callout>

      <Section number={"01"} title={"Иерархия контента как дерево"}>
        <Lead>
          {"Курс — не один большой текст. Он объединяет модули, а каждый модуль — упорядоченные уроки. Такая иерархия позволяет изменять часть контента без перезаписи всего документа."}
        </Lead>

        <div className="lesson-practice-steps">
          <h3>{"Course"}</h3>
          <p>{"Верхняя единица каталога и ownership teacher."}</p>
          <h3>{"Module"}</h3>
          <p>{"Тематическая группа внутри конкретного курса."}</p>
          <h3>{"Lesson"}</h3>
          <p>{"Минимальная единица прохождения student."}</p>
        </div>

        <CodeBlock
          caption={"дерево учебного контента"}
          code={"Course: Backend Foundations\n├── Module 1: HTTP\n│   ├── Lesson 1: Request\n│   └── Lesson 2: Response\n└── Module 2: FastAPI\n    ├── Lesson 1: First endpoint\n    └── Lesson 2: Validation"}
        />

        <TypeCards>
          <TypeCard badge={"course"} title={"Каталог и владелец"} code={"id · teacher_id · title · status"}>
            {"Определяет публичность и общую тему."}
          </TypeCard>
          <TypeCard badge={"module"} badgeTone={"float"} title={"Раздел курса"} code={"id · course_id · title · position"}>
            {"Группирует уроки и задаёт их порядок на верхнем уровне."}
          </TypeCard>
          <TypeCard badge={"lesson"} badgeTone={"str"} title={"Единица прохождения"} code={"id · module_id · title · position"}>
            {"Именно lesson отмечается завершённым student."}
          </TypeCard>
        </TypeCards>

        <Callout tone="info">
          {"Иерархия должна отвечать на простой вопрос: через какой foreign key любой Lesson однозначно приводит к своему Course?"}
        </Callout>
      </Section>

      <Section number={"02"} title={"Поля сущностей и минимальный контракт"}>
        <Lead>
          {"Поле входит в модель только когда оно необходимо для идентичности, связи, порядка, публикации или отображения MVP. Остальные свойства можно добавить позже миграцией."}
        </Lead>

        <div className="lesson-practice-steps">
          <h3>{"Identity"}</h3>
          <p>{"id и устойчивые уникальные значения."}</p>
          <h3>{"Relationship"}</h3>
          <p>{"teacher_id, course_id и module_id."}</p>
          <h3>{"Behavior"}</h3>
          <p>{"status и position поддерживают сценарии продукта."}</p>
        </div>

        <MethodGrid
          rows={[
            [<>{"Course.teacher_id"}</>, "владелец и основа object-level permission"],
            [<>{"Course.slug"}</>, "устойчивый адрес в каталоге"],
            [<>{"Course.status"}</>, "draft или published"],
            [<>{"Module.course_id"}</>, "принадлежность одному курсу"],
            [<>{"Module.position"}</>, "порядок модулей внутри курса"],
            [<>{"Lesson.module_id"}</>, "принадлежность одному модулю"],
            [<>{"Lesson.position"}</>, "порядок уроков внутри модуля"],
          ]}
        />

        <FillBlank
          prompt={"Выберите поле, которое связывает Module с Course."}
          before={"module."}
          after={" -> course.id"}
          options={[
            "course_id",
            "teacher_id",
            "lesson_id",
          ]}
          answer={"course_id"}
          explanation={"Foreign key хранится на дочерней стороне отношения one-to-many."}
        />

        <Callout tone="info">
          {"Не добавляйте поле «вдруг пригодится». Для каждого поля должна существовать история, constraint или запрос, который его оправдывает."}
        </Callout>
      </Section>

      <Section number={"03"} title={"One-to-many и направление foreign key"}>
        <Lead>
          {"Один Course содержит много Module, но каждый Module относится к одному Course. Поэтому course_id находится в modules. Аналогично module_id находится в lessons."}
        </Lead>

        <div className="lesson-practice-steps">
          <h3>{"Parent"}</h3>
          <p>{"Существование родителя не требует хранить список child ids в одной колонке."}</p>
          <h3>{"Child"}</h3>
          <p>{"Каждая дочерняя строка хранит foreign key родителя."}</p>
          <h3>{"Query"}</h3>
          <p>{"Связанные строки выбираются по равенству foreign key."}</p>
        </div>

        <StepThrough
          code={"courses.id = 10\nmodules.course_id = 10\nmodules.id = 21\nlessons.module_id = 21"}
          steps={[
            { line: 0, note: "Course получает собственный primary key.", vars: { "course_id": "10" } },
            { line: 1, note: "Module ссылается на Course.", vars: { "module.course_id": "10" } },
            { line: 2, note: "Module имеет отдельную идентичность.", vars: { "module_id": "21" } },
            { line: 3, note: "Lesson ссылается на Module, а через него — на Course.", vars: { "lesson.module_id": "21" } },
          ]}
        />

        <CompareSolutions
          question={"Как лучше хранить уроки курса?"}
          left={{
            title: "Один JSON внутри Course",
            code: "courses.lessons_json = [...]",
            note: "Сложнее задавать foreign keys, порядок, публикацию и progress по отдельному lesson.",
          }}
          right={{
            title: "Отдельные таблицы",
            code: "courses <- modules <- lessons",
            note: "Каждая сущность имеет id, constraints и независимый жизненный цикл.",
          }}
          preferred={"right"}
          explanation={"Реляционная структура поддерживает связи и запросы без переписывания одного большого документа."}
        />

        <Callout tone="info">
          {"Список child ids внутри parent дублирует связь и создаёт риск рассинхронизации. Источник истины — foreign key дочерней строки."}
        </Callout>
      </Section>

      <Section number={"04"} title={"Position и устойчивый порядок"}>
        <Lead>
          {"Порядок нельзя оставлять случайным. Поле position хранит намерение автора, а уникальный constraint не допускает два элемента на одной позиции внутри одного родителя."}
        </Lead>

        <div className="lesson-practice-steps">
          <h3>{"Scope"}</h3>
          <p>{"Позиция уникальна внутри конкретного course или module."}</p>
          <h3>{"Stable order"}</h3>
          <p>{"Запрос сортируется по position и id."}</p>
          <h3>{"Reorder"}</h3>
          <p>{"Изменение порядка выполняется как отдельная согласованная операция."}</p>
        </div>

        <CodeBlock
          caption={"constraints порядка"}
          code={"UNIQUE(course_id, position)   -- modules\nUNIQUE(module_id, position)   -- lessons\nCHECK(position >= 1)\n\nORDER BY position, id"}
        />

        <BugHunt
          code={"Module(course_id=7, position=1)\nModule(course_id=7, position=1)"}
          question={"Какой инвариант нарушен?"}
          options={[
            "Две позиции совпали внутри одного Course",
            "Нельзя иметь два Module",
            "position должен быть строкой",
          ]}
          correctIndex={0}
          explanation={"Порядок внутри родителя должен быть однозначным."}
          fix={"UNIQUE(course_id, position)\n\nModule(course_id=7, position=1)\nModule(course_id=7, position=2)"}
        />

        <Callout tone="info">
          {"Сортировка только по created_at не выражает учебный порядок. Teacher должен управлять position явно."}
        </Callout>
      </Section>

      <Section number={"05"} title={"Draft, published и публичная видимость"}>
        <Lead>
          {"Teacher должен спокойно готовить структуру, не показывая её student. Статус Course отделяет рабочий черновик от версии, доступной в каталоге."}
        </Lead>

        <div className="lesson-practice-steps">
          <h3>{"Draft"}</h3>
          <p>{"Виден владельцу и admin, может быть неполным."}</p>
          <h3>{"Published"}</h3>
          <p>{"Доступен каталогу и enrollment."}</p>
          <h3>{"Transition"}</h3>
          <p>{"Публикация проверяет минимальные инварианты контента."}</p>
        </div>

        <BranchExplorer
          code={"course.status\n├── draft\n│   └── teacher owner can edit\n└── published\n    ├── catalog can read\n    └── student can enroll"}
          scenarios={[
            { label: "teacher edits draft", activeLine: 2, output: "разрешено владельцу" },
            { label: "student opens draft", activeLine: 1, output: "ресурс не должен попадать в публичный каталог" },
            { label: "student enrolls published", activeLine: 5, output: "разрешено при выполнении остальных правил" },
          ]}
        />

        <TrueFalse
          statement={<>{"Публикация Course автоматически означает, что любой пользователь может его редактировать."}</>}
          isTrue={false}
          explanation={"Published меняет видимость для чтения, но ownership и права изменения остаются отдельным правилом."}
        />

        <Callout tone="info">
          {"Не смешивайте status и permission: published отвечает за состояние контента, teacher_id — за владение, role — за тип полномочий."}
        </Callout>
      </Section>

      <Section number={"06"} title={"Удаление, сохранность и каскады"}>
        <Lead>
          {"Удаление Course может затронуть modules, lessons, enrollments и completion. До реализации нужно определить, какие данные можно каскадно удалить, а какие требуют запрета или архивирования."}
        </Lead>

        <div className="lesson-practice-steps">
          <h3>{"Content draft"}</h3>
          <p>{"Черновик без enrollment можно удалить вместе с дочерним контентом."}</p>
          <h3>{"Published course"}</h3>
          <p>{"Удаление требует осторожности из-за пользовательской истории."}</p>
          <h3>{"Decision"}</h3>
          <p>{"Для MVP можно запретить destructive delete после enrollment и использовать archived status позже."}</p>
        </div>

        <CompareSolutions
          question={"Какой контракт безопаснее после появления enrollments?"}
          left={{
            title: "Безусловный cascade",
            code: "DELETE Course -> all content and history",
            note: "Быстро, но уничтожает факты обучения.",
          }}
          right={{
            title: "Ограниченный delete",
            code: "delete draft without enrollments; otherwise reject",
            note: "Сохраняет историю и делает риск видимым.",
          }}
          preferred={"right"}
          explanation={"Сохранность пользовательских фактов важнее удобства одной команды удаления."}
        />

        <FlipCards
          cards={[
            { front: <>{"CASCADE"}</>, back: <>{"Подходит для дочернего чернового контента, который не имеет самостоятельной истории."}</> },
            { front: <>{"RESTRICT"}</>, back: <>{"Блокирует удаление, если существуют критичные зависимости."}</> },
            { front: <>{"SET NULL"}</>, back: <>{"Используется только когда связь действительно может стать необязательной."}</> },
            { front: <>{"archive"}</>, back: <>{"Скрывает ресурс без физического уничтожения истории."}</> },
          ]}
        />

        <Callout tone="info">
          {"Cascade — не настройка «по умолчанию». Это решение о судьбе данных, которое нужно защитить пользовательским сценарием."}
        </Callout>
      </Section>

      <Section number={"07"} title={"ER-фрагмент и проверка инвариантов"}>
        <Lead>
          {"Финальная схема занятия должна показывать ключи, cardinality и constraints. Другой разработчик обязан восстановить по ней путь от Lesson к teacher-владельцу Course."}
        </Lead>

        <div className="lesson-practice-steps">
          <h3>{"Keys"}</h3>
          <p>{"PK у каждой сущности, FK на дочерней стороне."}</p>
          <h3>{"Constraints"}</h3>
          <p>{"slug, position и обязательные поля защищены базой."}</p>
          <h3>{"Scenarios"}</h3>
          <p>{"Схема проверяется созданием, публикацией, reorder и запрещённым удалением."}</p>
        </div>

        <CodeBlock
          caption={"ER-фрагмент LMS Core"}
          code={"users 1 ─── * courses\ncourses 1 ─── * modules\nmodules 1 ─── * lessons\n\nCourse.teacher_id -> User.id\nModule.course_id -> Course.id\nLesson.module_id -> Module.id"}
        />

        <RecallCard
          question={"Как пройти от Lesson к владельцу Course?"}
          hint={"Назовите обе foreign-key границы."}
          answer={<p>{"Lesson.module_id ведёт к Module, Module.course_id ведёт к Course, а Course.teacher_id указывает на User с ролью teacher."}</p>}
        />

        <Callout tone="info">
          {"ER-диаграмма готова не тогда, когда выглядит красиво, а когда по ней можно проверить каждый обязательный сценарий и нарушение constraint."}
        </Callout>
      </Section>

      <Section number="08" title="Контрольная точка и проектный артефакт">
        <Lead>
          {"Завершите занятие не конспектом, а проверяемым документом docs/lms/content-model.md. Он должен быть понятен другому разработчику без устных пояснений и связывать модель, успешный путь, ожидаемый отказ и критерии готовности."}
        </Lead>

        <div className="lesson-practice-steps">
          <h3>{"Проверка модели"}</h3>
          <p>{"Другой разработчик может восстановить сущности, связи и источник истины по документу docs/lms/content-model.md."}</p>
          <h3>{"Проверка поведения"}</h3>
          <p>{"Документ содержит один полный happy path и минимум один ожидаемый отказ с наблюдаемым результатом."}</p>
          <h3>{"Проверка границы"}</h3>
          <p>{"Явно перечислено, что не входит в текущий slice и какое решение переносится в следующий блок."}</p>
          <h3>{"Проверка воспроизводимости"}</h3>
          <p>{"Критерии можно превратить в migration, API или permission tests без устного уточнения автора."}</p>
        </div>

        <CodeBlock
          caption={"definition of ready"}
          code={"model is explicit\nhappy path is complete\nexpected failure is named\nboundary is protected\nnext implementation step is small"}
        />

        <div className="lesson-check-group">
          <QuizCard
            question={"Где хранится foreign key для отношения Course 1 → * Module?"}
            options={[
              "В Module.course_id",
              "В Course.module_ids",
              "В User.course_id",
            ]}
            correctIndex={0}
            explanation={"Foreign key хранится на стороне many."}
          />
          <QuizCard
            question={"Зачем нужен UNIQUE(course_id, position)?"}
            options={[
              "Не допустить две одинаковые позиции в одном курсе",
              "Сделать все position глобально уникальными",
              "Запретить несколько модулей",
            ]}
            correctIndex={0}
            explanation={"Порядок должен быть однозначным в пределах родителя."}
          />
          <QuizCard
            question={"Что меняет status=published?"}
            options={[
              "Публичную видимость и доступность enrollment",
              "Ownership курса",
              "Роль teacher",
            ]}
            correctIndex={0}
            explanation={"Статус и права остаются разными измерениями."}
          />
          <QuizCard
            question={"Почему опасно безусловно удалять опубликованный Course?"}
            options={[
              "Можно уничтожить историю enrollment и completion",
              "SQL не поддерживает DELETE",
              "Course всегда должен жить вечно",
            ]}
            correctIndex={0}
            explanation={"После пользовательских фактов destructive delete требует отдельной политики."}
          />
        </div>

        <KeyTakeaways
          points={[
            <>{"Course, Module и Lesson образуют иерархию one-to-many."}</>,
            <>{"Foreign key хранится на дочерней стороне связи."}</>,
            <>{"Position выражает авторский порядок и защищается составным unique constraint."}</>,
            <>{"Draft отделяет подготовку от публичного каталога."}</>,
            <>{"Published не отменяет ownership и permissions."}</>,
            <>{"Cascade, restrict и archive выбираются по смыслу данных."}</>,
            <>{"ER-фрагмент должен позволять проследить Lesson до teacher-владельца."}</>,
          ]}
        />

        <PracticeCta text={"Создайте docs/lms/content-model.md: нарисуйте Course → Module → Lesson, перечислите поля и constraints, опишите publish transition, правила reorder и политику удаления. Добавьте минимум шесть проверочных сценариев и коммит docs: design LMS content tree."} />
      </Section>
    </RichLesson>
  );
}
