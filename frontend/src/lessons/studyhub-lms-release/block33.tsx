import {
  Boxes,
  CheckCircle2,
  Database,
  FileText,
  GitBranch,
  KeyRound,
  ListChecks,
  Route,
  ShieldCheck,
  Users,
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
  PredictOutput,
  QuizCard,
  RecallCard,
  RichHero,
  RichLesson,
  Section,
  StepThrough,
  TrueFalse,
  TypeCard,
  TypeCards,
} from "../shared";

type LessonProps = { module?: string };
const BLOCK_TITLE = "Блок 33 · Проектирование StudyHub LMS Core";

export function Lesson189({ module }: LessonProps) {
  return (
    <RichLesson>
      <RichHero
        variant="project"
        chip={module ?? BLOCK_TITLE}
        title={"От Planner к LMS: требования и границы MVP"}
        intro={"Переведём технически зрелый StudyHub из домена задач в понятный LMS-продукт: назовём роли, проблемы и обязательный пользовательский путь, проведём линию MVP и превратим пожелания в проверяемые acceptance criteria."}
        tags={[
          { icon: <Users size={14} />, label: "student · teacher · admin" },
          { icon: <ListChecks size={14} />, label: "MVP и acceptance criteria" },
        ]}
      />
      <Callout tone="info">
        <strong>{"Связь с курсом."}</strong> {" StudyHub уже умеет хранить данные, защищать API и проходить тесты. Теперь технологии должны обслуживать конкретный продуктовый сценарий, а не существовать как отдельная демонстрация. "}
        <strong>{"Важно не перепутать:"}</strong> {" Проектирование не означает собрать список всех возможных функций. MVP ограничивает первую завершённую ценность и явно фиксирует то, что останется за пределами релиза."}
      </Callout>

      <Section number={"01"} title={"Почему кодирование начинается не с таблиц"}>
        <Lead>
          {"Если сразу создавать Course, Module и Lesson, можно получить технически правильные таблицы без понятного пользовательского результата. Сначала нужно доказать, для кого существует LMS и какое изменение человек должен увидеть."}
        </Lead>

        <div className="lesson-practice-steps">
          <h3>{"Проблема"}</h3>
          <p>{"Список сущностей не объясняет, какую задачу решает продукт."}</p>
          <h3>{"Главная модель"}</h3>
          <p>{"Роль испытывает проблему, выполняет действие и получает измеримый результат."}</p>
          <h3>{"Артефакт"}</h3>
          <p>{"Короткий product brief становится общей точкой для следующих решений."}</p>
        </div>

        <CodeBlock
          caption={"от технологии к продуктовой ценности"}
          code={"FastAPI + PostgreSQL + Redis\nне являются результатом сами по себе\n\nteacher создаёт курс\nstudent записывается\nstudent завершает урок\nstudent видит вычисленный progress"}
        />

        <TypeCards>
          <TypeCard badge={"роль"} title={"Кто действует"} code={"student | teacher | admin"}>
            {"Определяет ожидания и доступные действия."}
          </TypeCard>
          <TypeCard badge={"проблема"} badgeTone={"float"} title={"Что мешает сейчас"} code={"нет единого пути обучения"}>
            {"Объясняет, почему продукт вообще нужен."}
          </TypeCard>
          <TypeCard badge={"результат"} badgeTone={"str"} title={"Что изменится"} code={"progress = 50%"}>
            {"Позволяет проверить ценность наблюдаемым сценарием."}
          </TypeCard>
        </TypeCards>

        <Callout tone="info">
          {"Первый вопрос проектирования: не «какую таблицу создать?», а «какой пользовательский путь должен работать от начала до конца?»."}
        </Callout>
      </Section>

      <Section number={"02"} title={"Три роли и разные причины использовать LMS"}>
        <Lead>
          {"Student, teacher и admin работают с одним продуктом, но решают разные задачи. Роль полезна только тогда, когда за ней закреплены действия, данные и ограничения."}
        </Lead>

        <div className="lesson-practice-steps">
          <h3>{"Student"}</h3>
          <p>{"Находит опубликованный курс, записывается и проходит уроки."}</p>
          <h3>{"Teacher"}</h3>
          <p>{"Создаёт структуру курса, редактирует контент и публикует результат."}</p>
          <h3>{"Admin"}</h3>
          <p>{"Поддерживает систему и может выполнять ограниченный override."}</p>
        </div>

        <MatchPairs
          prompt={"Соедините роль с её основной ответственностью в MVP."}
          pairs={[
            { left: "student", right: "проходить опубликованный контент" },
            { left: "teacher", right: "создавать и публиковать собственный курс" },
            { left: "admin", right: "разрешать исключительные операционные ситуации" },
          ]}
          explanation={"Роль определяется не названием аккаунта, а разрешённым набором действий."}
        />

        <MethodGrid
          rows={[
            [<>{"student → catalog"}</>, "видит только published courses"],
            [<>{"student → enrollment"}</>, "создаёт одну активную запись на курс"],
            [<>{"teacher → course"}</>, "управляет только собственным ресурсом"],
            [<>{"admin → audit"}</>, "не подменяет обычный пользовательский flow"],
          ]}
        />

        <Callout tone="info">
          {"Admin не должен становиться обходным путём для отсутствующих правил. Его полномочия фиксируются так же явно, как права student и teacher."}
        </Callout>
      </Section>

      <Section number={"03"} title={"User story связывает роль, действие и ценность"}>
        <Lead>
          {"User story не заменяет техническое задание, но помогает увидеть цель действия до деталей endpoint. Хорошая формулировка содержит роль, намерение и ценность."}
        </Lead>

        <div className="lesson-practice-steps">
          <h3>{"Роль"}</h3>
          <p>{"Кто выполняет действие."}</p>
          <h3>{"Намерение"}</h3>
          <p>{"Что именно человек хочет сделать."}</p>
          <h3>{"Ценность"}</h3>
          <p>{"Зачем результат важен пользователю или системе."}</p>
        </div>

        <CompareSolutions
          question={"Какая формулировка лучше задаёт продуктовый смысл?"}
          left={{
            title: "Список функций",
            code: "Сделать POST /courses и таблицу courses",
            note: "Есть техника, но нет пользователя и ценности.",
          }}
          right={{
            title: "User story",
            code: "Как teacher, я хочу создать черновик курса, чтобы подготовить структуру до публикации.",
            note: "Видны роль, действие и причина.",
          }}
          preferred={"right"}
          explanation={"Endpoint появится позже как реализация истории, а не как её замена."}
        />

        <FillBlank
          prompt={"Завершите шаблон user story."}
          before={"Как student, я хочу записаться на курс, "}
          after={"."}
          options={[
            "чтобы он появился в моём обучении",
            "потому что нужен POST",
            "чтобы создать таблицу",
          ]}
          answer={"чтобы он появился в моём обучении"}
          explanation={"Последняя часть описывает пользовательскую ценность."}
        />

        <Callout tone="info">
          {"Слова «как пользователь» слишком широки. В LMS важно назвать конкретную роль, потому что права и сценарии заметно различаются."}
        </Callout>
      </Section>

      <Section number={"04"} title={"Functional и non-functional requirements"}>
        <Lead>
          {"Функциональное требование описывает поведение продукта. Нефункциональное фиксирует качество и ограничения: безопасность, воспроизводимость, время ответа или совместимость."}
        </Lead>

        <div className="lesson-practice-steps">
          <h3>{"Functional"}</h3>
          <p>{"Что система делает в конкретном сценарии."}</p>
          <h3>{"Non-functional"}</h3>
          <p>{"Насколько надёжно и при каких ограничениях она это делает."}</p>
          <h3>{"Проверка"}</h3>
          <p>{"Каждое требование должно иметь наблюдаемое доказательство."}</p>
        </div>

        <TypeCards>
          <TypeCard badge={"F"} title={"Функциональное"} code={"student can enroll"}>
            {"После запроса появляется Enrollment."}
          </TypeCard>
          <TypeCard badge={"NF"} badgeTone={"float"} title={"Безопасность"} code={"teacher edits own course"}>
            {"Чужой teacher получает отказ."}
          </TypeCard>
          <TypeCard badge={"NF"} badgeTone={"str"} title={"Воспроизводимость"} code={"fresh database + migrations"}>
            {"Проект поднимается по README без ручной правки таблиц."}
          </TypeCard>
        </TypeCards>

        <TrueFalse
          statement={<>{"Требование «использовать PostgreSQL» само по себе описывает пользовательскую функцию LMS."}</>}
          isTrue={false}
          explanation={"Это техническое решение. Функциональное требование должно описывать поведение, наблюдаемое через сценарий."}
        />

        <Callout tone="info">
          {"Не превращайте non-functional requirements в абстрактное «быстро и безопасно». Укажите, как качество будет проверяться."}
        </Callout>
      </Section>

      <Section number={"05"} title={"Story Map и линия MVP"}>
        <Lead>
          {"Story Map располагает действия вдоль пользовательского пути. Линия MVP отделяет минимальный завершённый flow от полезных, но не обязательных улучшений."}
        </Lead>

        <div className="lesson-practice-steps">
          <h3>{"Backbone"}</h3>
          <p>{"Крупные шаги: создать → опубликовать → записаться → пройти → увидеть progress."}</p>
          <h3>{"MVP line"}</h3>
          <p>{"Минимальные истории под каждым шагом."}</p>
          <h3>{"Later"}</h3>
          <p>{"Функции, без которых первый flow всё равно остаётся завершённым."}</p>
        </div>

        <BranchExplorer
          code={"teacher creates draft\n→ adds module and lesson\n→ publishes course\n\nstudent opens catalog\n→ enrolls\n→ completes lesson\n→ reads progress"}
          scenarios={[
            { label: "MVP", activeLine: 2, output: "публикация связывает teacher flow и student flow" },
            { label: "без enrollment", activeLine: 5, output: "student не получает законного доступа к прохождению" },
            { label: "без progress", activeLine: 7, output: "путь заканчивается без наблюдаемого результата" },
          ]}
        />

        <CodeSequence
          title={"Соберите минимальный пользовательский flow"}
          prompt={"Расположите действия так, чтобы результат был проверяемым от teacher до student."}
          pieces={[
            { id: "draft", code: "teacher создаёт draft Course" },
            { id: "content", code: "teacher добавляет Module и Lesson" },
            { id: "publish", code: "teacher публикует Course" },
            { id: "enroll", code: "student создаёт Enrollment" },
            { id: "complete", code: "student завершает Lesson" },
            { id: "progress", code: "student получает progress" },
            { id: "chat", code: "student пишет в чат", note: "не входит в MVP" },
          ]}
          correctOrder={[
            "draft",
            "content",
            "publish",
            "enroll",
            "complete",
            "progress",
          ]}
          explanation={"Каждый шаг создаёт условие для следующего и завершает один сквозной сценарий."}
        />

        <Callout tone="info">
          {"MVP — не «самая маленькая система». Это самая маленькая версия, которая доказывает законченную ценность."}
        </Callout>
      </Section>

      <Section number={"06"} title={"Acceptance criteria превращают идею в проверку"}>
        <Lead>
          {"История становится готовой к реализации, когда команда может однозначно проверить успех и ожидаемый отказ. Критерий описывает начальное состояние, действие и наблюдаемый результат."}
        </Lead>

        <div className="lesson-practice-steps">
          <h3>{"Given"}</h3>
          <p>{"Исходные данные и права."}</p>
          <h3>{"When"}</h3>
          <p>{"Одно ключевое действие."}</p>
          <h3>{"Then"}</h3>
          <p>{"Наблюдаемый ответ и изменение состояния."}</p>
        </div>

        <StepThrough
          code={"Given: published course and student without enrollment\nWhen: student enrolls\nThen: Enrollment is created\nAnd: repeated enroll returns conflict"}
          steps={[
            { line: 0, note: "Сначала фиксируется опубликованный курс и отсутствие связи.", vars: { "course": "published", "enrollment": "none" } },
            { line: 1, note: "Student выполняет одно действие.", vars: { "action": "enroll" } },
            { line: 2, note: "Появляется новая запись связи.", vars: { "enrollment": "active" } },
            { line: 3, note: "Повтор не создаёт дубликат.", vars: { "response": "409 conflict" } },
          ]}
        />

        <BugHunt
          code={"Критерий: запись на курс должна работать правильно."}
          question={"Почему этот критерий нельзя надёжно проверить?"}
          options={[
            "Нет конкретного начального состояния и результата",
            "Нельзя тестировать enrollment",
            "Acceptance criteria пишутся только после кода",
          ]}
          correctIndex={0}
          explanation={"Слово «правильно» не задаёт измеримого контракта."}
          fix={"Given published Course\nWhen student enrolls first time\nThen response is 201 and one Enrollment exists"}
        />

        <Callout tone="info">
          {"Обязательно добавляйте отрицательный критерий: чужой ресурс, повторное действие или неверное состояние часто раскрывают главный инвариант."}
        </Callout>
      </Section>

      <Section number={"07"} title={"Product brief и защита границ"}>
        <Lead>
          {"Финальный документ занятия кратко фиксирует проблему, роли, основной flow, обязательные истории, ограничения качества и список out of scope. Он должен помещаться в несколько экранов и помогать отклонять лишнее."}
        </Lead>

        <div className="lesson-practice-steps">
          <h3>{"In scope"}</h3>
          <p>{"Course tree, publish, enrollment, completion, progress, permissions."}</p>
          <h3>{"Out of scope"}</h3>
          <p>{"Платежи, видео-хостинг, чат, сертификаты, сложная админ-панель."}</p>
          <h3>{"Decision rule"}</h3>
          <p>{"Новая функция входит только если обязательный flow без неё не завершён."}</p>
        </div>

        <FlipCards
          cards={[
            { front: <>{"Платежи"}</>, back: <>{"Не нужны для доказательства teacher/student flow."}</> },
            { front: <>{"Видео-хостинг"}</>, back: <>{"Контент можно представить текстовой ссылкой или полем без медиа-инфраструктуры."}</> },
            { front: <>{"Сертификаты"}</>, back: <>{"Появятся только после надёжной модели progress и completion."}</> },
            { front: <>{"Чат"}</>, back: <>{"Отдельный домен, который не усиливает основной MVP."}</> },
          ]}
        />

        <RecallCard
          question={"Как одним предложением объяснить границу MVP StudyHub LMS?"}
          hint={"Назовите teacher flow, student flow и то, что сознательно исключено."}
          answer={<p>{"MVP позволяет teacher опубликовать структурированный курс, а student — записаться, завершить уроки и увидеть progress; платежи, медиа, чат и сертификаты остаются вне первой версии."}</p>}
        />

        <Callout tone="info">
          {"Out of scope — не отказ навсегда. Это защита текущего этапа от функций, которые мешают завершить основной flow."}
        </Callout>
      </Section>

      <Section number="08" title="Контрольная точка и проектный артефакт">
        <Lead>
          {"Завершите занятие не конспектом, а проверяемым документом docs/lms/product-brief.md. Он должен быть понятен другому разработчику без устных пояснений и связывать модель, успешный путь, ожидаемый отказ и критерии готовности."}
        </Lead>

        <div className="lesson-practice-steps">
          <h3>{"Проверка модели"}</h3>
          <p>{"Другой разработчик может восстановить сущности, связи и источник истины по документу docs/lms/product-brief.md."}</p>
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
            question={"Что должно появиться раньше ER-диаграммы?"}
            options={[
              "Product brief и основной flow",
              "Redis cache",
              "Docker image",
            ]}
            correctIndex={0}
            explanation={"Сначала фиксируется продуктовый смысл и граница MVP."}
          />
          <QuizCard
            question={"Что делает user story полезной?"}
            options={[
              "Связывает роль, действие и ценность",
              "Содержит SQL",
              "Всегда описывает один endpoint",
            ]}
            correctIndex={0}
            explanation={"User story задаёт продуктовый контекст до технической реализации."}
          />
          <QuizCard
            question={"Что находится ниже линии MVP?"}
            options={[
              "Необязательные улучшения",
              "Все ошибки",
              "Только нефункциональные требования",
            ]}
            correctIndex={0}
            explanation={"Ниже линии остаются истории, без которых первый законченный flow всё ещё работает."}
          />
          <QuizCard
            question={"Какой критерий готовности точнее?"}
            options={[
              "Повторный enrollment возвращает 409 и не создаёт вторую запись",
              "Enrollment работает хорошо",
              "Сделан красивый экран",
            ]}
            correctIndex={0}
            explanation={"Точный критерий задаёт действие, ответ и состояние данных."}
          />
        </div>

        <KeyTakeaways
          points={[
            <>{"Продукт начинается с роли, проблемы и наблюдаемого результата."}</>,
            <>{"User story связывает роль, действие и ценность."}</>,
            <>{"Functional и non-functional requirements проверяются разными доказательствами."}</>,
            <>{"Story Map показывает полный путь, а линия MVP ограничивает первую версию."}</>,
            <>{"Acceptance criteria описывают успешный и ошибочный сценарий."}</>,
            <>{"Out of scope защищает блок от расползания требований."}</>,
            <>{"Результат занятия — короткий product brief для всего LMS Core."}</>,
          ]}
        />

        <PracticeCta text={"Создайте docs/lms/product-brief.md: опишите три роли, 8–12 user stories, обязательный teacher → student flow, 6–10 acceptance criteria и отдельный список out of scope. Завершите одним коммитом docs: define LMS MVP."} />
      </Section>
    </RichLesson>
  );
}

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

export function Lesson191({ module }: LessonProps) {
  return (
    <RichLesson>
      <RichHero
        variant="project"
        chip={module ?? BLOCK_TITLE}
        title={"Enrollment как отдельная сущность связи"}
        intro={"Разберём many-to-many без скрытой магии: student и Course связываются через Enrollment, а сама связь хранит дату, статус и уникальность пары, поддерживает запросы в обе стороны и защищает от повторной записи."}
        tags={[
          { icon: <GitBranch size={14} />, label: "User ↔ Enrollment ↔ Course" },
          { icon: <ShieldCheck size={14} />, label: "unique pair и lifecycle" },
        ]}
      />
      <Callout tone="info">
        <strong>{"Связь с курсом."}</strong> {" Course tree уже спроектирован. Теперь student должен законно получить доступ к прохождению, а система — сохранить сам факт записи и его жизненный цикл. "}
        <strong>{"Важно не перепутать:"}</strong> {" Enrollment — не список course ids внутри User и не просто автоматическая secondary table. Связь имеет собственные поля, правила и ошибки."}
      </Callout>

      <Section number={"01"} title={"Почему many-to-many требует отдельной модели"}>
        <Lead>
          {"Один student может записаться на несколько courses, а один Course — иметь много students. Когда связи нужны enrolled_at и status, она становится полноценной сущностью."}
        </Lead>

        <div className="lesson-practice-steps">
          <h3>{"User"}</h3>
          <p>{"Существует независимо от конкретного Course."}</p>
          <h3>{"Course"}</h3>
          <p>{"Существует независимо от конкретного student."}</p>
          <h3>{"Enrollment"}</h3>
          <p>{"Фиксирует конкретную пару и её состояние."}</p>
        </div>

        <CodeBlock
          caption={"связь многие-ко-многим"}
          code={"User 1 ─── * Enrollment * ─── 1 Course\n\nEnrollment\n- id\n- student_id\n- course_id\n- status\n- enrolled_at"}
        />

        <TypeCards>
          <TypeCard badge={"student_id"} title={"Кто записан"} code={"FK -> users.id"}>
            {"Указывает пользователя с ролью student."}
          </TypeCard>
          <TypeCard badge={"course_id"} badgeTone={"float"} title={"Куда записан"} code={"FK -> courses.id"}>
            {"Указывает опубликованный Course."}
          </TypeCard>
          <TypeCard badge={"status"} badgeTone={"str"} title={"Состояние связи"} code={"active | withdrawn | completed"}>
            {"Позволяет изменять lifecycle без удаления факта."}
          </TypeCard>
        </TypeCards>

        <Callout tone="info">
          {"Если связь имеет собственную дату, статус или бизнес-правило, она уже заслуживает отдельной модели и API-контракта."}
        </Callout>
      </Section>

      <Section number={"02"} title={"Поля Enrollment и источник истины"}>
        <Lead>
          {"Enrollment хранит только данные самой связи. Title курса остаётся в Course, email студента — в User. Дублирование полей быстро создаёт расхождения."}
        </Lead>

        <div className="lesson-practice-steps">
          <h3>{"Identity"}</h3>
          <p>{"id нужен для ссылок, логов и расширения модели."}</p>
          <h3>{"Pair"}</h3>
          <p>{"student_id + course_id определяют смысл связи."}</p>
          <h3>{"Lifecycle"}</h3>
          <p>{"status и timestamps описывают развитие связи."}</p>
        </div>

        <MethodGrid
          rows={[
            [<>{"Enrollment.id"}</>, "стабильный идентификатор связи"],
            [<>{"Enrollment.student_id"}</>, "FK на student"],
            [<>{"Enrollment.course_id"}</>, "FK на Course"],
            [<>{"Enrollment.status"}</>, "active, withdrawn или completed"],
            [<>{"Enrollment.enrolled_at"}</>, "время первой записи"],
            [<>{"Enrollment.updated_at"}</>, "время изменения lifecycle"],
          ]}
        />

        <BugHunt
          code={"Enrollment(student_id=5, course_title=\"Python\")"}
          question={"Почему course_title не должен быть источником связи?"}
          options={[
            "Название может измениться и не является foreign key",
            "Строки нельзя хранить в таблице",
            "Enrollment не может иметь поля",
          ]}
          correctIndex={0}
          explanation={"Связь должна указывать на устойчивый Course.id."}
          fix={"Enrollment(student_id=5, course_id=17)"}
        />

        <Callout tone="info">
          {"Enrollment не копирует display-поля связанных сущностей. Их получают JOIN или ORM relationship при чтении."}
        </Callout>
      </Section>

      <Section number={"03"} title={"Unique pair блокирует повторную запись"}>
        <Lead>
          {"Проверка SELECT перед INSERT улучшает сообщение, но только constraint базы гарантирует уникальность при конкурирующих запросах."}
        </Lead>

        <div className="lesson-practice-steps">
          <h3>{"Friendly check"}</h3>
          <p>{"Приложение может заранее проверить существующую запись."}</p>
          <h3>{"Database guarantee"}</h3>
          <p>{"UNIQUE(student_id, course_id) не допускает дубликат."}</p>
          <h3>{"Error contract"}</h3>
          <p>{"Нарушение переводится в предсказуемый 409 Conflict."}</p>
        </div>

        <CompareSolutions
          question={"Что действительно гарантирует отсутствие дублей?"}
          left={{
            title: "Только Python check",
            code: "if not exists: insert()",
            note: "Два запроса могут одновременно увидеть отсутствие записи.",
          }}
          right={{
            title: "Constraint + обработка",
            code: "UNIQUE(student_id, course_id)",
            note: "База защищает инвариант, сервис переводит ошибку в контракт API.",
          }}
          preferred={"right"}
          explanation={"Проверка приложения полезна, но гарантия должна жить в источнике истины."}
        />

        <StepThrough
          code={"request A: SELECT none\nrequest B: SELECT none\nrequest A: INSERT\nrequest B: INSERT -> unique violation"}
          steps={[
            { line: 0, note: "Первый запрос пока не видит Enrollment.", vars: { "A": "none" } },
            { line: 1, note: "Второй запрос получает тот же результат.", vars: { "B": "none" } },
            { line: 2, note: "A создаёт единственную допустимую строку.", vars: { "rows": "1" } },
            { line: 3, note: "Constraint отклоняет второй INSERT.", vars: { "response": "409" } },
          ]}
        />

        <Callout tone="info">
          {"Инвариант, важный при одновременных запросах, нельзя оставлять только на уровне предварительного SELECT."}
        </Callout>
      </Section>

      <Section number={"04"} title={"Запросы в обе стороны"}>
        <Lead>
          {"Одна и та же модель поддерживает два пользовательских вопроса: какие courses изучает student и какие students записаны на Course."}
        </Lead>

        <div className="lesson-practice-steps">
          <h3>{"Student view"}</h3>
          <p>{"Фильтр Enrollment.student_id и JOIN Course."}</p>
          <h3>{"Teacher view"}</h3>
          <p>{"Фильтр Enrollment.course_id и JOIN User."}</p>
          <h3>{"Status filter"}</h3>
          <p>{"Active связи отделяются от withdrawn или completed."}</p>
        </div>

        <MatchPairs
          prompt={"Соедините вопрос и направление запроса."}
          pairs={[
            { left: "Мои курсы", right: "Enrollment.student_id = current_user.id" },
            { left: "Студенты курса", right: "Enrollment.course_id = owned_course.id" },
            { left: "Активные записи", right: "Enrollment.status = active" },
            { left: "Карточка курса", right: "JOIN Course by course_id" },
          ]}
          explanation={"Одна association model поддерживает оба направления навигации."}
        />

        <CodeBlock
          caption={"концептуальные запросы"}
          code={"courses_for_student(student_id)\nstudents_for_course(course_id)\nactive_enrollment(student_id, course_id)\n\nвсе операции читают одну таблицу enrollments"}
        />

        <Callout tone="info">
          {"Teacher может читать students только для собственного Course — запрос данных и permission проверяются вместе."}
        </Callout>
      </Section>

      <Section number={"05"} title={"Lifecycle: active, withdrawn и completed"}>
        <Lead>
          {"Удаление Enrollment стирает историю. Статус позволяет сохранить факт записи и отдельно управлять текущим доступом."}
        </Lead>

        <div className="lesson-practice-steps">
          <h3>{"active"}</h3>
          <p>{"Student учится и может создавать completion."}</p>
          <h3>{"withdrawn"}</h3>
          <p>{"Доступ прекращён, но история записи сохранена."}</p>
          <h3>{"completed"}</h3>
          <p>{"Курс завершён по согласованному правилу progress."}</p>
        </div>

        <BranchExplorer
          code={"new enrollment\n└── active\n    ├── withdrawn\n    └── completed"}
          scenarios={[
            { label: "first enroll", activeLine: 1, output: "создаётся active" },
            { label: "student leaves", activeLine: 2, output: "история сохраняется как withdrawn" },
            { label: "progress reaches rule", activeLine: 3, output: "может перейти в completed" },
          ]}
        />

        <TrueFalse
          statement={<>{"Withdrawn Enrollment лучше всегда физически удалить, потому что он больше не даёт доступа."}</>}
          isTrue={false}
          explanation={"Статус сохраняет историю и позволяет объяснить прошлые completion или аудит доступа."}
        />

        <Callout tone="info">
          {"Не добавляйте сложный workflow заявок. Для MVP достаточно трёх понятных состояний и явных допустимых переходов."}
        </Callout>
      </Section>

      <Section number={"06"} title={"Ошибочные сценарии и HTTP-контракт"}>
        <Lead>
          {"Enrollment создаётся только для опубликованного Course и student-роли. Повторная запись, чужая роль и несуществующий Course должны иметь предсказуемый ответ."}
        </Lead>

        <div className="lesson-practice-steps">
          <h3>{"404"}</h3>
          <p>{"Course не существует или сознательно скрывается."}</p>
          <h3>{"409"}</h3>
          <p>{"Пара student/course уже существует."}</p>
          <h3>{"403"}</h3>
          <p>{"Аутентифицированный пользователь не имеет права на действие."}</p>
        </div>

        <BranchExplorer
          code={"POST /courses/{course_id}/enrollments\n├── course not found -> 404\n├── course draft -> 404 or 409 by contract\n├── role is not student -> 403\n├── pair exists -> 409\n└── create active -> 201"}
          scenarios={[
            { label: "первый enrollment", activeLine: 5, output: "201 Created" },
            { label: "повторный enrollment", activeLine: 4, output: "409 Conflict" },
            { label: "teacher tries student action", activeLine: 3, output: "403 Forbidden" },
          ]}
        />

        <FillBlank
          prompt={"Выберите статус для повторной записи на тот же Course."}
          before={"HTTP "}
          after={" Conflict"}
          options={[
            "409",
            "201",
            "204",
          ]}
          answer={"409"}
          explanation={"Ресурс уже конфликтует с unique pair."}
        />

        <Callout tone="info">
          {"HTTP-статус — часть API contract. Он должен быть одинаковым в документации, сервисе и тестах."}
        </Callout>
      </Section>

      <Section number={"07"} title={"ER-фрагмент и test matrix Enrollment"}>
        <Lead>
          {"Документ занятия объединяет структуру таблицы, переходы статусов, запросы и отрицательные тесты. Он станет входом для реализации блока 34."}
        </Lead>

        <div className="lesson-practice-steps">
          <h3>{"Schema"}</h3>
          <p>{"Поля, FK и unique pair."}</p>
          <h3>{"Behavior"}</h3>
          <p>{"Allowed transitions и доступ по active status."}</p>
          <h3>{"Tests"}</h3>
          <p>{"Первый enroll, repeat, draft course, wrong role и ownership teacher view."}</p>
        </div>

        <CodeSequence
          title={"Соберите безопасный сценарий enrollment"}
          prompt={"Расположите проверки и изменение состояния."}
          pieces={[
            { id: "auth", code: "получить current student" },
            { id: "course", code: "загрузить published Course" },
            { id: "existing", code: "проверить существующую пару" },
            { id: "insert", code: "создать active Enrollment" },
            { id: "commit", code: "commit и вернуть 201" },
            { id: "delete", code: "удалить все старые связи", note: "не относится к сценарию" },
          ]}
          correctOrder={[
            "auth",
            "course",
            "existing",
            "insert",
            "commit",
          ]}
          explanation={"Сервис сначала подтверждает actor и target, затем защищает unique pair и фиксирует новую связь."}
        />

        <RecallCard
          question={"Почему Enrollment является сущностью, а не технической таблицей?"}
          hint={"Назовите собственные поля и lifecycle."}
          answer={<p>{"Enrollment имеет собственный id, timestamps, status, unique pair и правила доступа; он описывает бизнес-факт записи student на Course."}</p>}
        />

        <Callout tone="info">
          {"Готовая модель Enrollment должна объяснять не только INSERT, но и последующее чтение, withdrawal, completion и аудит."}
        </Callout>
      </Section>

      <Section number="08" title="Контрольная точка и проектный артефакт">
        <Lead>
          {"Завершите занятие не конспектом, а проверяемым документом docs/lms/enrollment-model.md. Он должен быть понятен другому разработчику без устных пояснений и связывать модель, успешный путь, ожидаемый отказ и критерии готовности."}
        </Lead>

        <div className="lesson-practice-steps">
          <h3>{"Проверка модели"}</h3>
          <p>{"Другой разработчик может восстановить сущности, связи и источник истины по документу docs/lms/enrollment-model.md."}</p>
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
            question={"Почему Enrollment — отдельная модель?"}
            options={[
              "Связь имеет собственные поля и lifecycle",
              "SQL требует отдельную таблицу для любого поля",
              "Чтобы увеличить число классов",
            ]}
            correctIndex={0}
            explanation={"Association model хранит бизнес-факт связи."}
          />
          <QuizCard
            question={"Что гарантирует отсутствие дублей?"}
            options={[
              "UNIQUE(student_id, course_id)",
              "Только SELECT перед INSERT",
              "Название Course",
            ]}
            correctIndex={0}
            explanation={"Constraint защищает инвариант при конкурирующих запросах."}
          />
          <QuizCard
            question={"Какой статус сохраняет факт ухода без удаления истории?"}
            options={[
              "withdrawn",
              "missing",
              "draft",
            ]}
            correctIndex={0}
            explanation={"Withdrawn прекращает активный доступ, сохраняя запись."}
          />
          <QuizCard
            question={"Что возвращать при повторном enrollment?"}
            options={[
              "409 Conflict",
              "201 Created",
              "500 Internal Server Error",
            ]}
            correctIndex={0}
            explanation={"Повтор конфликтует с уникальностью пары и является ожидаемым сценарием."}
          />
        </div>

        <KeyTakeaways
          points={[
            <>{"User и Course связаны many-to-many через Enrollment."}</>,
            <>{"Enrollment хранит данные самой связи, а не копии Course и User."}</>,
            <>{"UNIQUE(student_id, course_id) гарантирует отсутствие дублей."}</>,
            <>{"Запросы работают в обе стороны через одну association model."}</>,
            <>{"Status сохраняет lifecycle без физического удаления истории."}</>,
            <>{"Ошибочные сценарии заранее фиксируются в HTTP-контракте."}</>,
            <>{"Результат занятия — schema, transitions и test matrix Enrollment."}</>,
          ]}
        />

        <PracticeCta text={"Создайте docs/lms/enrollment-model.md: опишите таблицу, FK, unique pair, lifecycle active/withdrawn/completed, два направления запросов и минимум восемь тестовых сценариев. Зафиксируйте коммит docs: design enrollment lifecycle."} />
      </Section>
    </RichLesson>
  );
}

export function Lesson192({ module }: LessonProps) {
  return (
    <RichLesson>
      <RichHero
        variant="project"
        chip={module ?? BLOCK_TITLE}
        title={"Progress и инварианты прохождения"}
        intro={"Спроектируем progress из фактов, а не из вручную изменяемого процента: LessonCompletion фиксирует завершение опубликованного урока внутри активного Enrollment, unique constraint делает действие идемпотентным, а формула корректно обрабатывает 0 lessons."}
        tags={[
          { icon: <CheckCircle2 size={14} />, label: "LessonCompletion как факт" },
          { icon: <Route size={14} />, label: "0% → 100% без рассинхронизации" },
        ]}
      />
      <Callout tone="info">
        <strong>{"Связь с курсом."}</strong> {" Enrollment уже связывает student и Course. Следующий наблюдаемый шаг — завершение конкретного Lesson и вычисление общего прогресса по опубликованному контенту. "}
        <strong>{"Важно не перепутать:"}</strong> {" Progress не хранится как произвольное число и не включает баллы, экзамены, дедлайны или адаптивные траектории."}
      </Callout>

      <Section number={"01"} title={"Факт завершения важнее сохранённого процента"}>
        <Lead>
          {"Число progress=60 легко рассинхронизировать с реальными lessons. Надёжнее хранить факты completion и вычислять процент из текущего набора опубликованных уроков."}
        </Lead>

        <div className="lesson-practice-steps">
          <h3>{"Fact"}</h3>
          <p>{"Student завершил конкретный Lesson в конкретном Enrollment."}</p>
          <h3>{"Count"}</h3>
          <p>{"Система считает уникальные completion."}</p>
          <h3>{"Derived value"}</h3>
          <p>{"Процент вычисляется при чтении или в контролируемом query."}</p>
        </div>

        <CompareSolutions
          question={"Какой источник истины устойчивее?"}
          left={{
            title: "Сохранённый процент",
            code: "enrollment.progress = 60",
            note: "Непонятно, какие lessons завершены и когда обновлять число.",
          }}
          right={{
            title: "Completion facts",
            code: "LessonCompletion(enrollment_id, lesson_id)",
            note: "Процент можно воспроизвести и проверить по фактам.",
          }}
          preferred={"right"}
          explanation={"Вычисляемое значение не должно становиться независимым источником истины без необходимости."}
        />

        <CodeBlock
          caption={"формула progress"}
          code={"completed = count(unique published lessons completed)\ntotal = count(published lessons in course)\n\nif total == 0:\n    progress = 0\nelse:\n    progress = completed / total * 100"}
        />

        <Callout tone="info">
          {"Храните события и факты, из которых можно восстановить производное значение. Это упрощает аудит и тестирование."}
        </Callout>
      </Section>

      <Section number={"02"} title={"LessonCompletion как отдельная сущность"}>
        <Lead>
          {"Completion связывает Enrollment и Lesson, добавляет completed_at и защищает уникальность пары. Через Enrollment система уже знает student и Course."}
        </Lead>

        <div className="lesson-practice-steps">
          <h3>{"enrollment_id"}</h3>
          <p>{"Подтверждает законную запись student на Course."}</p>
          <h3>{"lesson_id"}</h3>
          <p>{"Указывает конкретную единицу контента."}</p>
          <h3>{"completed_at"}</h3>
          <p>{"Фиксирует время завершения для истории и статистики."}</p>
        </div>

        <TypeCards>
          <TypeCard badge={"enrollment"} title={"Контекст обучения"} code={"FK -> enrollments.id"}>
            {"Не позволяет завершать lesson вне записи на курс."}
          </TypeCard>
          <TypeCard badge={"lesson"} badgeTone={"float"} title={"Завершённый объект"} code={"FK -> lessons.id"}>
            {"Должен принадлежать тому же Course."}
          </TypeCard>
          <TypeCard badge={"unique"} badgeTone={"str"} title={"Один факт"} code={"UNIQUE(enrollment_id, lesson_id)"}>
            {"Повторный запрос не создаёт вторую completion."}
          </TypeCard>
        </TypeCards>

        <MethodGrid
          rows={[
            [<>{"LessonCompletion.id"}</>, "идентификатор факта"],
            [<>{"LessonCompletion.enrollment_id"}</>, "контекст student/course"],
            [<>{"LessonCompletion.lesson_id"}</>, "завершённый Lesson"],
            [<>{"LessonCompletion.completed_at"}</>, "момент завершения"],
            [<>{"UNIQUE(enrollment_id, lesson_id)"}</>, "защита от двойного учёта"],
          ]}
        />

        <Callout tone="info">
          {"student_id и course_id не нужно дублировать в Completion, если они однозначно определяются через Enrollment."}
        </Callout>
      </Section>

      <Section number={"03"} title={"Инвариант: student должен быть записан на Course"}>
        <Lead>
          {"Наличие Enrollment ещё недостаточно: он должен быть active, а Lesson обязан принадлежать Course этой записи. Проверка защищает от завершения чужого контента."}
        </Lead>

        <div className="lesson-practice-steps">
          <h3>{"Actor"}</h3>
          <p>{"current_user совпадает с Enrollment.student_id."}</p>
          <h3>{"State"}</h3>
          <p>{"Enrollment.status разрешает прохождение."}</p>
          <h3>{"Target"}</h3>
          <p>{"Lesson через Module относится к Enrollment.course_id."}</p>
        </div>

        <BranchExplorer
          code={"complete lesson\n├── enrollment.student_id != current_user.id -> deny\n├── enrollment.status != active -> deny\n├── lesson.course_id != enrollment.course_id -> deny\n└── create or return completion"}
          scenarios={[
            { label: "свой active enrollment", activeLine: 4, output: "разрешённый happy path" },
            { label: "lesson другого course", activeLine: 3, output: "инвариант target нарушен" },
            { label: "withdrawn enrollment", activeLine: 2, output: "прохождение больше не разрешено" },
          ]}
        />

        <BugHunt
          code={"create_completion(enrollment_id=8, lesson_id=999)\n# lesson принадлежит другому Course"}
          question={"Какой контроль отсутствует?"}
          options={[
            "Lesson должен принадлежать Course из Enrollment",
            "Lesson id должен быть строкой",
            "Completion нельзя создавать через API",
          ]}
          correctIndex={0}
          explanation={"Оба foreign key отдельно валидны, но их сочетание нарушает бизнес-инвариант."}
          fix={"enrollment = get_owned_active_enrollment(8)\nlesson = get_lesson(999)\nassert lesson.module.course_id == enrollment.course_id"}
        />

        <Callout tone="info">
          {"Foreign keys подтверждают существование строк, но не всегда подтверждают допустимость их комбинации. Бизнес-инвариант проверяется отдельно."}
        </Callout>
      </Section>

      <Section number={"04"} title={"Идемпотентность и unique completion"}>
        <Lead>
          {"Повторный клик, retry клиента или сетевой timeout не должны увеличить completed count. Unique pair делает факт завершения одноразовым."}
        </Lead>

        <div className="lesson-practice-steps">
          <h3>{"First request"}</h3>
          <p>{"Создаёт Completion и возвращает согласованный успешный ответ."}</p>
          <h3>{"Repeated request"}</h3>
          <p>{"Не создаёт дубликат."}</p>
          <h3>{"Contract choice"}</h3>
          <p>{"Можно вернуть существующий ресурс или 409 — решение фиксируется заранее."}</p>
        </div>

        <StepThrough
          code={"POST complete lesson\nINSERT completion\nnetwork timeout\nclient retries\nUNIQUE prevents duplicate"}
          steps={[
            { line: 0, note: "Клиент отправляет действие.", vars: { "request": "1" } },
            { line: 1, note: "База фиксирует первый факт.", vars: { "rows": "1" } },
            { line: 2, note: "Клиент не знает, дошёл ли ответ.", vars: { "client": "uncertain" } },
            { line: 3, note: "Retry повторяет тот же intent.", vars: { "request": "2" } },
            { line: 4, note: "Unique pair сохраняет один completion.", vars: { "rows": "1" } },
          ]}
        />

        <TrueFalse
          statement={<>{"Два одинаковых Completion допустимы, если completed_at различается."}</>}
          isTrue={false}
          explanation={"Факт «урок завершён» учитывается один раз для конкретного Enrollment."}
        />

        <Callout tone="info">
          {"Идемпотентность проектируется до реализации: команда должна заранее решить ответ на повторный запрос и закрепить его тестом."}
        </Callout>
      </Section>

      <Section number={"05"} title={"Формула progress и случай 0 lessons"}>
        <Lead>
          {"Деление на ноль — не техническая мелочь, а продуктовый сценарий пустого или ещё не опубликованного Course. Для MVP такой Course возвращает 0%, а публикация может требовать хотя бы один Lesson."}
        </Lead>

        <div className="lesson-practice-steps">
          <h3>{"Denominator"}</h3>
          <p>{"Только published lessons, доступные student."}</p>
          <h3>{"Numerator"}</h3>
          <p>{"Уникальные completion этих lessons."}</p>
          <h3>{"Empty course"}</h3>
          <p>{"Явное значение 0 вместо исключения."}</p>
        </div>

        <CodeBlock
          caption={"контрольные примеры"}
          code={"0 completed / 0 published -> 0%\n0 completed / 4 published -> 0%\n2 completed / 4 published -> 50%\n4 completed / 4 published -> 100%"}
        />

        <FillBlank
          prompt={"Завершите безопасную формулу."}
          before={"progress = 0 if total == 0 else "}
          after={""}
          options={[
            "completed / total * 100",
            "total / completed",
            "completed + total",
          ]}
          answer={"completed / total * 100"}
          explanation={"Числитель — завершённые уроки, знаменатель — все учитываемые опубликованные уроки."}
        />

        <Callout tone="info">
          {"Сначала определите, какие lessons входят в denominator. Иначе разные endpoints могут показывать разный progress."}
        </Callout>
      </Section>

      <Section number={"06"} title={"Published lessons и изменение курса"}>
        <Lead>
          {"Если teacher добавляет новый published Lesson, denominator увеличивается и процент student может снизиться. Это ожидаемое следствие выбранной модели и должно быть зафиксировано в продуктовой политике."}
        </Lead>

        <div className="lesson-practice-steps">
          <h3>{"Draft lesson"}</h3>
          <p>{"Не входит в progress student."}</p>
          <h3>{"Publish new lesson"}</h3>
          <p>{"Увеличивает total и может изменить процент."}</p>
          <h3>{"Policy"}</h3>
          <p>{"Команда принимает осознанное решение, а не скрывает эффект."}</p>
        </div>

        <CompareSolutions
          question={"Какие lessons учитывать в progress?"}
          left={{
            title: "Все, включая draft",
            code: "COUNT(all lessons)",
            note: "Student теряет progress из-за невидимого контента.",
          }}
          right={{
            title: "Только published",
            code: "COUNT(published lessons)",
            note: "Denominator соответствует доступному пути обучения.",
          }}
          preferred={"right"}
          explanation={"Progress должен опираться на контент, который student действительно может пройти."}
        />

        <PredictOutput
          code={"published lessons = 4\ncompleted = 4\nprogress = 100%\n\nteacher publishes lesson 5\ncompleted remains 4"}
          output={"progress = 80%"}
          hint={"Denominator увеличился с 4 до 5."}
        />

        <Callout tone="info">
          {"Изменение progress после публикации нового Lesson не обязательно является багом. Это следствие выбранной политики denominator."}
        </Callout>
      </Section>

      <Section number={"07"} title={"API response и test matrix Progress"}>
        <Lead>
          {"Response должен объяснять процент, а не отдавать только число. completed_lessons и total_lessons делают результат проверяемым для клиента и теста."}
        </Lead>

        <div className="lesson-practice-steps">
          <h3>{"Response"}</h3>
          <p>{"progress_percent, completed_lessons, total_lessons."}</p>
          <h3>{"Cases"}</h3>
          <p>{"0%, частичный, 100%, empty course и повторный completion."}</p>
          <h3>{"Negative"}</h3>
          <p>{"Чужой enrollment, withdrawn status и Lesson другого Course."}</p>
        </div>

        <CodeBlock
          caption={"понятный response contract"}
          code={"{\n  \"course_id\": 17,\n  \"completed_lessons\": 2,\n  \"total_lessons\": 4,\n  \"progress_percent\": 50\n}"}
        />

        <RecallCard
          question={"Почему progress лучше вычислять из Completion?"}
          hint={"Назовите воспроизводимость, аудит и защиту от рассинхронизации."}
          answer={<p>{"Completion хранит проверяемые факты по конкретным lessons. Процент можно пересчитать после изменения контента, объяснить пользователю и проверить тестом без доверия к вручную изменяемому числу."}</p>}
        />

        <Callout tone="info">
          {"Достаточный response показывает и производное значение, и числа, из которых оно получено."}
        </Callout>
      </Section>

      <Section number="08" title="Контрольная точка и проектный артефакт">
        <Lead>
          {"Завершите занятие не конспектом, а проверяемым документом docs/lms/progress-model.md. Он должен быть понятен другому разработчику без устных пояснений и связывать модель, успешный путь, ожидаемый отказ и критерии готовности."}
        </Lead>

        <div className="lesson-practice-steps">
          <h3>{"Проверка модели"}</h3>
          <p>{"Другой разработчик может восстановить сущности, связи и источник истины по документу docs/lms/progress-model.md."}</p>
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
            question={"Что является источником истины progress?"}
            options={[
              "LessonCompletion facts",
              "Произвольное поле percent",
              "Количество login",
            ]}
            correctIndex={0}
            explanation={"Процент воспроизводится из фактов завершения."}
          />
          <QuizCard
            question={"Что защищает от двойного учёта урока?"}
            options={[
              "UNIQUE(enrollment_id, lesson_id)",
              "Разный completed_at",
              "Название Lesson",
            ]}
            correctIndex={0}
            explanation={"Одна пара учитывается один раз."}
          />
          <QuizCard
            question={"Какие lessons входят в denominator?"}
            options={[
              "Published lessons, доступные student",
              "Все draft и deleted lessons",
              "Только первый Lesson",
            ]}
            correctIndex={0}
            explanation={"Знаменатель должен соответствовать фактическому пути обучения."}
          />
          <QuizCard
            question={"Что вернуть для Course без published lessons?"}
            options={[
              "Явно согласованные 0%",
              "Division by zero",
              "Случайное значение",
            ]}
            correctIndex={0}
            explanation={"Пустой курс — ожидаемый edge case, а не авария."}
          />
        </div>

        <KeyTakeaways
          points={[
            <>{"Progress вычисляется из фактов Completion."}</>,
            <>{"Completion связывает Enrollment и Lesson."}</>,
            <>{"Foreign keys не заменяют проверку принадлежности Lesson к Course."}</>,
            <>{"Unique pair делает повтор безопасным и предотвращает двойной счёт."}</>,
            <>{"Denominator включает только доступные published lessons."}</>,
            <>{"Пустой Course обрабатывается явным правилом 0%."}</>,
            <>{"Response показывает процент и исходные counts."}</>,
          ]}
        />

        <PracticeCta text={"Создайте docs/lms/progress-model.md: опишите LessonCompletion, инварианты actor/state/target, unique pair, формулу progress, политику published lessons и минимум десять тестовых сценариев. Завершите коммитом docs: design progress invariants."} />
      </Section>
    </RichLesson>
  );
}

export function Lesson193({ module }: LessonProps) {
  return (
    <RichLesson>
      <RichHero
        variant="project"
        chip={module ?? BLOCK_TITLE}
        title={"Ownership, роли и permissions matrix"}
        intro={"Соберём права до endpoint-кода: role задаёт базовый тип возможностей, ownership связывает teacher с конкретным Course, enrollment открывает student доступ к прохождению, admin получает ограниченный override, а permissions matrix превращает правила в тестируемый контракт."}
        tags={[
          { icon: <KeyRound size={14} />, label: "role + ownership + state" },
          { icon: <ShieldCheck size={14} />, label: "permissions matrix и 401/403/404" },
        ]}
      />
      <Callout tone="info">
        <strong>{"Связь с курсом."}</strong> {" Сущности Course, Enrollment и Completion уже имеют ясные связи. Теперь каждый action должен получить ответ: кто может выполнить его над каким resource и при каком состоянии. "}
        <strong>{"Важно не перепутать:"}</strong> {" Блок не строит enterprise policy engine. Достаточно явной матрицы и небольшого permission service, который проверяет роль, ownership и состояние ресурса."}
      </Callout>

      <Section number={"01"} title={"Role и ownership отвечают на разные вопросы"}>
        <Lead>
          {"Role говорит, к какому типу действий относится пользователь. Ownership отвечает, может ли конкретный teacher менять конкретный Course. Одной проверки role=teacher недостаточно."}
        </Lead>

        <div className="lesson-practice-steps">
          <h3>{"Role"}</h3>
          <p>{"Teacher в принципе может создавать Courses."}</p>
          <h3>{"Ownership"}</h3>
          <p>{"Редактировать можно только Course с teacher_id=current_user.id."}</p>
          <h3>{"State"}</h3>
          <p>{"Некоторые действия зависят от draft/published или active Enrollment."}</p>
        </div>

        <TypeCards>
          <TypeCard badge={"role"} title={"Тип полномочий"} code={"current_user.role == teacher"}>
            {"Открывает класс действий, но не любой объект."}
          </TypeCard>
          <TypeCard badge={"ownership"} badgeTone={"float"} title={"Связь с resource"} code={"course.teacher_id == current_user.id"}>
            {"Ограничивает действие собственным Course."}
          </TypeCard>
          <TypeCard badge={"state"} badgeTone={"str"} title={"Допустимое состояние"} code={"course.status == draft"}>
            {"Определяет, разрешено ли действие сейчас."}
          </TypeCard>
        </TypeCards>

        <TrueFalse
          statement={<>{"Любой пользователь с role=teacher может редактировать любой Course."}</>}
          isTrue={false}
          explanation={"После role нужно проверить ownership конкретного resource."}
        />

        <Callout tone="info">
          {"Правило доступа удобно читать как conjunction: authenticated AND role allowed AND owns resource AND state allows action."}
        </Callout>
      </Section>

      <Section number={"02"} title={"Permissions matrix до реализации endpoints"}>
        <Lead>
          {"Матрица role × action × resource обнаруживает противоречия раньше кода. Каждая ячейка содержит allow, deny или условие ownership/enrollment."}
        </Lead>

        <div className="lesson-practice-steps">
          <h3>{"Rows"}</h3>
          <p>{"Actions: create, read, update, publish, enroll, complete."}</p>
          <h3>{"Columns"}</h3>
          <p>{"student, teacher, admin."}</p>
          <h3>{"Conditions"}</h3>
          <p>{"own course, published course, active enrollment."}</p>
        </div>

        <MethodGrid
          rows={[
            [<>{"student × read catalog"}</>, "allow published"],
            [<>{"student × enroll"}</>, "allow published course"],
            [<>{"student × complete lesson"}</>, "allow own active enrollment"],
            [<>{"teacher × create course"}</>, "allow"],
            [<>{"teacher × update course"}</>, "allow own"],
            [<>{"teacher × publish course"}</>, "allow own valid draft"],
            [<>{"admin × override"}</>, "allow only documented support action"],
          ]}
        />

        <MatchPairs
          prompt={"Соедините action с условием доступа."}
          pairs={[
            { left: "teacher updates Course", right: "teacher owns Course" },
            { left: "student completes Lesson", right: "student owns active Enrollment" },
            { left: "student opens catalog", right: "Course is published" },
            { left: "admin override", right: "action is explicitly documented and audited" },
          ]}
          explanation={"Матрица связывает actor, resource и condition."}
        />

        <Callout tone="info">
          {"Пустая ячейка — неопределённое поведение. До реализации у каждого endpoint должно быть явное правило."}
        </Callout>
      </Section>

      <Section number={"03"} title={"Teacher ownership проходит через Course"}>
        <Lead>
          {"Module и Lesson не обязаны хранить teacher_id. Ownership можно вывести через Module.course_id и Course.teacher_id, сохраняя один источник истины."}
        </Lead>

        <div className="lesson-practice-steps">
          <h3>{"Course"}</h3>
          <p>{"Хранит teacher_id."}</p>
          <h3>{"Module"}</h3>
          <p>{"Принадлежит Course."}</p>
          <h3>{"Lesson"}</h3>
          <p>{"Принадлежит Module и наследует ownership через дерево."}</p>
        </div>

        <StepThrough
          code={"current_user.id = 9\nlesson.module_id = 30\nmodule.course_id = 12\ncourse.teacher_id = 9\nallow update lesson"}
          steps={[
            { line: 0, note: "Определяется actor.", vars: { "teacher": "9" } },
            { line: 1, note: "Lesson ведёт к Module.", vars: { "module_id": "30" } },
            { line: 2, note: "Module ведёт к Course.", vars: { "course_id": "12" } },
            { line: 3, note: "Course хранит единственный ownership source.", vars: { "teacher_id": "9" } },
            { line: 4, note: "Совпадение разрешает action.", vars: { "decision": "allow" } },
          ]}
        />

        <BugHunt
          code={"if current_user.role == \"teacher\":\n    update_any_lesson()"}
          question={"Какой контроль отсутствует?"}
          options={[
            "Ownership Course, которому принадлежит Lesson",
            "Проверка длины title",
            "Проверка Redis",
          ]}
          correctIndex={0}
          explanation={"Role teacher не разрешает менять чужой ресурс."}
          fix={"course = get_course_for_lesson(lesson_id)\nif course.teacher_id != current_user.id:\n    raise Forbidden()"}
        />

        <Callout tone="info">
          {"Не дублируйте teacher_id в каждой таблице без необходимости. Чем больше источников ownership, тем выше риск расхождения."}
        </Callout>
      </Section>

      <Section number={"04"} title={"Student access проходит через Enrollment"}>
        <Lead>
          {"Student читает публичный каталог без Enrollment, но прохождение и progress требуют собственной active связи с Course."}
        </Lead>

        <div className="lesson-practice-steps">
          <h3>{"Catalog"}</h3>
          <p>{"Published Course доступен для чтения."}</p>
          <h3>{"Learning"}</h3>
          <p>{"Lesson content и completion требуют active Enrollment по правилам MVP."}</p>
          <h3>{"Isolation"}</h3>
          <p>{"Student не видит progress другого student."}</p>
        </div>

        <BranchExplorer
          code={"student action\n├── browse published catalog -> allow\n├── enroll self -> allow if no pair\n├── complete lesson -> own active enrollment\n├── read own progress -> own enrollment\n└── read other progress -> deny"}
          scenarios={[
            { label: "каталог", activeLine: 1, output: "общедоступное чтение опубликованного Course" },
            { label: "completion", activeLine: 3, output: "нужна собственная active связь" },
            { label: "чужой progress", activeLine: 5, output: "object-level deny" },
          ]}
        />

        <CompareSolutions
          question={"Как проверять progress endpoint?"}
          left={{
            title: "Только role=student",
            code: "if user.role == student: return progress(enrollment_id)",
            note: "Student может подставить чужой enrollment_id.",
          }}
          right={{
            title: "Ownership Enrollment",
            code: "enrollment.student_id == current_user.id",
            note: "Resource связан с конкретным actor.",
          }}
          preferred={"right"}
          explanation={"Object-level permission проверяет принадлежность запрошенного ресурса."}
        />

        <Callout tone="info">
          {"Path parameter никогда не является доказательством права. Любой id из запроса нужно связать с current_user."}
        </Callout>
      </Section>

      <Section number={"05"} title={"Admin override должен быть ограничен и наблюдаем"}>
        <Lead>
          {"Admin может помогать в исключительных ситуациях, но безграничный bypass скрывает ошибки продукта и усложняет аудит. Каждое override-действие должно быть названо и залогировано."}
        </Lead>

        <div className="lesson-practice-steps">
          <h3>{"Explicit action"}</h3>
          <p>{"Например, снять ошибочную публикацию или восстановить доступ."}</p>
          <h3>{"Audit"}</h3>
          <p>{"Actor, resource, reason и result записываются."}</p>
          <h3>{"No substitution"}</h3>
          <p>{"Admin не выполняет обычный flow вместо teacher/student."}</p>
        </div>

        <FlipCards
          cards={[
            { front: <>{"Разрешено"}</>, back: <>{"Документированное support-действие с audit trail."}</> },
            { front: <>{"Запрещено"}</>, back: <>{"Использовать admin, чтобы не проектировать ownership."}</> },
            { front: <>{"Причина"}</>, back: <>{"Override принимает обязательное reason."}</> },
            { front: <>{"Проверка"}</>, back: <>{"Отрицательный тест подтверждает, что обычная роль не получила admin action."}</> },
          ]}
        />

        <RecallCard
          question={"Почему admin override нельзя считать обычным allow для всего?"}
          hint={"Подумайте об аудите и скрытых дефектах permissions."}
          answer={<p>{"Безграничный override стирает границы ролей, скрывает ошибки пользовательских сценариев и не позволяет объяснить, кто и почему изменил resource. Нужны конкретные support-actions и audit trail."}</p>}
        />

        <Callout tone="info">
          {"Admin — отдельная политика, а не короткая ветка «если admin, пропустить все проверки»."}
        </Callout>
      </Section>

      <Section number={"06"} title={"401, 403 и безопасный 404"}>
        <Lead>
          {"Коды ответа выражают разные ситуации. 401 означает отсутствие валидной аутентификации, 403 — известный actor не имеет права, 404 иногда используется, чтобы не раскрывать существование чужого resource."}
        </Lead>

        <div className="lesson-practice-steps">
          <h3>{"401"}</h3>
          <p>{"Нет current user или credentials недействительны."}</p>
          <h3>{"403"}</h3>
          <p>{"Actor известен, но action запрещён."}</p>
          <h3>{"404"}</h3>
          <p>{"Resource отсутствует или контракт скрывает его существование."}</p>
        </div>

        <MatchPairs
          prompt={"Соедините ситуацию и статус."}
          pairs={[
            { left: "нет access token", right: "401 Unauthorized" },
            { left: "student пытается publish Course", right: "403 Forbidden" },
            { left: "чужой private draft скрывается", right: "404 Not Found" },
            { left: "повторный enrollment", right: "409 Conflict" },
          ]}
          explanation={"Статусы отличаются причиной отказа и не должны использоваться взаимозаменяемо."}
        />

        <FillBlank
          prompt={"Выберите статус для аутентифицированного student, который пытается publish Course."}
          before={"HTTP "}
          after={" Forbidden"}
          options={[
            "403",
            "401",
            "201",
          ]}
          answer={"403"}
          explanation={"Actor известен, но его роль не разрешает действие."}
        />

        <Callout tone="info">
          {"Решение 403 или 404 для чужого resource фиксируется на уровне API contract и применяется последовательно во всех похожих endpoints."}
        </Callout>
      </Section>

      <Section number={"07"} title={"Permission service и отрицательная test matrix"}>
        <Lead>
          {"Endpoint не должен повторять длинные проверки. Небольшой permission service получает actor и resource, применяет одно правило и возвращает решение или доменную ошибку."}
        </Lead>

        <div className="lesson-practice-steps">
          <h3>{"Load"}</h3>
          <p>{"Сначала безопасно загрузить resource."}</p>
          <h3>{"Authorize"}</h3>
          <p>{"Проверить role, ownership и state."}</p>
          <h3>{"Act"}</h3>
          <p>{"Только после решения выполнять mutation."}</p>
        </div>

        <CodeSequence
          title={"Соберите безопасный permission flow"}
          prompt={"Расположите шаги до изменения Course."}
          pieces={[
            { id: "auth", code: "получить current_user" },
            { id: "load", code: "загрузить Course" },
            { id: "check", code: "проверить role + ownership + state" },
            { id: "mutate", code: "изменить Course" },
            { id: "commit", code: "commit и вернуть response" },
            { id: "log_secret", code: "записать access token в лог", note: "опасный шаг" },
          ]}
          correctOrder={[
            "auth",
            "load",
            "check",
            "mutate",
            "commit",
          ]}
          explanation={"Mutation начинается только после полной object-level authorization."}
        />

        <CodeBlock
          caption={"концептуальный permission service"}
          code={"can_update_course(actor, course)\ncan_publish_course(actor, course)\ncan_complete_lesson(actor, enrollment, lesson)\ncan_read_progress(actor, enrollment)\n\nкаждое правило покрыто allow и deny тестами"}
        />

        <Callout tone="info">
          {"Положительный тест доказывает happy path. Отрицательные тесты доказывают, что соседняя роль, чужой owner и неверное состояние действительно блокируются."}
        </Callout>
      </Section>

      <Section number="08" title="Контрольная точка и проектный артефакт">
        <Lead>
          {"Завершите занятие не конспектом, а проверяемым документом docs/lms/permissions-matrix.md. Он должен быть понятен другому разработчику без устных пояснений и связывать модель, успешный путь, ожидаемый отказ и критерии готовности."}
        </Lead>

        <div className="lesson-practice-steps">
          <h3>{"Проверка модели"}</h3>
          <p>{"Другой разработчик может восстановить сущности, связи и источник истины по документу docs/lms/permissions-matrix.md."}</p>
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
            question={"Почему role=teacher недостаточно для update Course?"}
            options={[
              "Нужно проверить ownership конкретного Course",
              "Teacher не может редактировать",
              "Нужен Redis",
            ]}
            correctIndex={0}
            explanation={"Role задаёт класс действий, ownership — конкретный ресурс."}
          />
          <QuizCard
            question={"Через что student получает право complete Lesson?"}
            options={[
              "Через собственный active Enrollment",
              "Через title Course",
              "Через admin",
            ]}
            correctIndex={0}
            explanation={"Enrollment связывает actor и Course."}
          />
          <QuizCard
            question={"Когда используется 401?"}
            options={[
              "Нет валидной аутентификации",
              "Actor известен, но action запрещён",
              "Повторный ресурс",
            ]}
            correctIndex={0}
            explanation={"401 относится к credentials/current user."}
          />
          <QuizCard
            question={"Что должно быть у admin override?"}
            options={[
              "Явное действие, reason и audit trail",
              "Полный bypass без логов",
              "Только красивое имя",
            ]}
            correctIndex={0}
            explanation={"Override ограничивается и наблюдается."}
          />
        </div>

        <KeyTakeaways
          points={[
            <>{"Role, ownership и resource state являются разными проверками."}</>,
            <>{"Permissions matrix фиксирует правило до endpoint-кода."}</>,
            <>{"Teacher ownership хранится в Course и проходит к Module/Lesson через связи."}</>,
            <>{"Student access к прохождению подтверждается own active Enrollment."}</>,
            <>{"Admin override ограничивается конкретными действиями и аудитом."}</>,
            <>{"401, 403, 404 и 409 имеют разные причины."}</>,
            <>{"Permission service проверяется положительными и отрицательными тестами."}</>,
          ]}
        />

        <PracticeCta text={"Создайте docs/lms/permissions-matrix.md: заполните role × action × resource для Course, Module, Lesson, Enrollment и Progress, добавьте условия ownership/state, политику 401/403/404 и минимум десять конфликтных сценариев. Сделайте коммит docs: define LMS permissions."} />
      </Section>
    </RichLesson>
  );
}

export function Lesson194({ module }: LessonProps) {
  return (
    <RichLesson>
      <RichHero
        variant="project"
        chip={module ?? BLOCK_TITLE}
        title={"API contract, ER-диаграмма и migration plan"}
        intro={"Соберём результаты проектирования в реализуемый blueprint: endpoint contract связывает method, path, actor, schemas и errors; ER-диаграмма показывает источник истины; migration plan защищает существующий StudyHub; vertical slices дают маленькие проверяемые коммиты."}
        tags={[
          { icon: <FileText size={14} />, label: "API contract и schemas" },
          { icon: <GitBranch size={14} />, label: "migration plan и vertical slices" },
        ]}
      />
      <Callout tone="info">
        <strong>{"Связь с курсом."}</strong> {" MVP, content tree, Enrollment, Progress и permissions уже определены отдельно. Финальное занятие проверяет, что эти решения не противоречат друг другу и могут быть реализованы безопасной последовательностью. "}
        <strong>{"Важно не перепутать:"}</strong> {" Blueprint не означает один giant commit со всеми таблицами и endpoints. Реализация начнётся только после разбиения на вертикальные пользовательские slices."}
      </Callout>

      <Section number={"01"} title={"Blueprint связывает документы в одну систему"}>
        <Lead>
          {"Отдельные схемы полезны, но финальный blueprint обязан показать единый путь request → permission → service → tables → response и перечислить решения, которые считаются утверждёнными."}
        </Lead>

        <div className="lesson-practice-steps">
          <h3>{"Product"}</h3>
          <p>{"MVP и acceptance criteria."}</p>
          <h3>{"Data"}</h3>
          <p>{"ER-модель и constraints."}</p>
          <h3>{"Behavior"}</h3>
          <p>{"API contract, permissions и migration sequence."}</p>
        </div>

        <CodeBlock
          caption={"состав blueprint"}
          code={"product brief\n+ content model\n+ enrollment model\n+ progress model\n+ permissions matrix\n+ API contract\n+ ER diagram\n+ migration plan\n= LMS Core blueprint"}
        />

        <TypeCards>
          <TypeCard badge={"contract"} title={"Что видит клиент"} code={"method · path · schemas · errors"}>
            {"Не раскрывает внутренние детали хранения."}
          </TypeCard>
          <TypeCard badge={"ER"} badgeTone={"float"} title={"Где живут факты"} code={"tables · PK · FK · constraints"}>
            {"Показывает источник истины и связи."}
          </TypeCard>
          <TypeCard badge={"plan"} badgeTone={"str"} title={"Как безопасно внедрить"} code={"migration · seed · slices · tests"}>
            {"Ограничивает blast radius каждого изменения."}
          </TypeCard>
        </TypeCards>

        <Callout tone="info">
          {"Если одно правило нельзя найти ни в contract, ни в ER, ни в permissions matrix, оно почти наверняка останется неявным в коде."}
        </Callout>
      </Section>

      <Section number={"02"} title={"API contract: method, path, actor, input, output, errors"}>
        <Lead>
          {"Строка contract описывает один endpoint без реализации. По ней frontend, backend и тест могут согласовать поведение до появления кода."}
        </Lead>

        <div className="lesson-practice-steps">
          <h3>{"Request"}</h3>
          <p>{"Method, path params, query и body schema."}</p>
          <h3>{"Authorization"}</h3>
          <p>{"Actor и object-level condition."}</p>
          <h3>{"Response"}</h3>
          <p>{"Status, response schema и ожидаемые errors."}</p>
        </div>

        <MethodGrid
          rows={[
            [<>{"POST /courses"}</>, "teacher | CourseCreate -> 201 CourseRead"],
            [<>{"PATCH /courses/{id}"}</>, "owner teacher | CourseUpdate -> 200"],
            [<>{"POST /courses/{id}/publish"}</>, "owner teacher + valid draft -> 200"],
            [<>{"GET /courses"}</>, "public/student | published catalog -> 200"],
            [<>{"POST /courses/{id}/enrollments"}</>, "student + published + unique -> 201/409"],
            [<>{"POST /enrollments/{id}/lessons/{lesson_id}/complete"}</>, "owner student + active -> 200"],
            [<>{"GET /enrollments/{id}/progress"}</>, "owner student -> 200"],
          ]}
        />

        <MatchPairs
          prompt={"Соедините часть contract и вопрос, на который она отвечает."}
          pairs={[
            { left: "method + path", right: "какое действие и над каким resource" },
            { left: "actor condition", right: "кто имеет право" },
            { left: "request schema", right: "какие данные принимает endpoint" },
            { left: "response schema", right: "что получает клиент" },
            { left: "errors", right: "какие ожидаемые отказы являются частью поведения" },
          ]}
          explanation={"Полный contract отвечает на вопросы клиента, безопасности и тестирования."}
        />

        <Callout tone="info">
          {"В contract не пишут «может вернуть ошибку». Перечисляют конкретные 401, 403, 404, 409 и validation errors для данного endpoint."}
        </Callout>
      </Section>

      <Section number={"03"} title={"Pydantic schemas и границы данных"}>
        <Lead>
          {"Create, Update и Read schemas решают разные задачи. Клиент не должен передавать id, teacher_id или вычисленный progress, если эти значения определяет сервер."}
        </Lead>

        <div className="lesson-practice-steps">
          <h3>{"Create"}</h3>
          <p>{"Только поля, которые actor имеет право задать."}</p>
          <h3>{"Update"}</h3>
          <p>{"Optional-поля для частичного изменения."}</p>
          <h3>{"Read"}</h3>
          <p>{"Server fields, nested summaries и derived values."}</p>
        </div>

        <CompareSolutions
          question={"Как разделить schemas Course?"}
          left={{
            title: "Одна схема для всего",
            code: "CourseSchema(id, teacher_id, status, ...)",
            note: "Клиент может попытаться передать server-managed поля.",
          }}
          right={{
            title: "Schemas по направлению",
            code: "CourseCreate | CourseUpdate | CourseRead",
            note: "Контракт явно разделяет вход и выход.",
          }}
          preferred={"right"}
          explanation={"Разные направления данных имеют разные разрешённые поля."}
        />

        <BugHunt
          code={"CourseCreate(teacher_id=other_user_id, status=\"published\")"}
          question={"Почему такой input опасен?"}
          options={[
            "Клиент управляет ownership и publish state",
            "Pydantic не поддерживает строки",
            "Course нельзя создавать",
          ]}
          correctIndex={0}
          explanation={"teacher_id берётся из current_user, а публикация выполняется отдельным action."}
          fix={"CourseCreate(title, slug, description)\n\nteacher_id = current_user.id\nstatus = \"draft\""}
        />

        <Callout tone="info">
          {"Server-managed поле не включается во входную schema только потому, что существует в ORM-модели."}
        </Callout>
      </Section>

      <Section number={"04"} title={"Финальная ER-диаграмма и инварианты"}>
        <Lead>
          {"ER-диаграмма объединяет User, Course, Module, Lesson, Enrollment и LessonCompletion. Рядом фиксируются unique constraints и правила, которые нельзя выразить одним foreign key."}
        </Lead>

        <div className="lesson-practice-steps">
          <h3>{"Structure"}</h3>
          <p>{"User → Course → Module → Lesson."}</p>
          <h3>{"Learning"}</h3>
          <p>{"User → Enrollment → Course."}</p>
          <h3>{"Facts"}</h3>
          <p>{"Enrollment → LessonCompletion → Lesson."}</p>
        </div>

        <CodeBlock
          caption={"ER-диаграмма LMS Core"}
          code={"User 1 ─── * Course\nCourse 1 ─── * Module\nModule 1 ─── * Lesson\n\nUser 1 ─── * Enrollment * ─── 1 Course\nEnrollment 1 ─── * LessonCompletion * ─── 1 Lesson\n\nUNIQUE(student_id, course_id)\nUNIQUE(enrollment_id, lesson_id)\nUNIQUE(course_id, module.position)\nUNIQUE(module_id, lesson.position)"}
        />

        <RecallCard
          question={"Какие инварианты не гарантируются одними foreign keys?"}
          hint={"Подумайте о совпадении Course и actor."}
          answer={<p>{"Foreign keys не доказывают, что Lesson принадлежит Course из Enrollment, current_user владеет Enrollment или Course, а published/state разрешают действие. Эти правила проверяются сервисом и permissions."}</p>}
        />

        <Callout tone="info">
          {"Диаграмма должна различать database constraints и application invariants — это разные уровни защиты одной системы."}
        </Callout>
      </Section>

      <Section number={"05"} title={"Migration sequence без giant commit"}>
        <Lead>
          {"Существующий StudyHub уже работает. Новые таблицы добавляются последовательно, миграции применяются на чистой и текущей базе, а каждый шаг имеет rollback или понятную стратегию исправления."}
        </Lead>

        <div className="lesson-practice-steps">
          <h3>{"Additive first"}</h3>
          <p>{"Новые таблицы и nullable/default изменения без разрушения старого API."}</p>
          <h3>{"Backfill/seed"}</h3>
          <p>{"Демо-данные создаются отдельным воспроизводимым шагом."}</p>
          <h3>{"Switch behavior"}</h3>
          <p>{"Endpoints подключаются после готовых constraints и tests."}</p>
        </div>

        <CodeSequence
          title={"Соберите безопасный migration plan"}
          prompt={"Расположите шаги от схемы к работающему slice."}
          pieces={[
            { id: "models", code: "описать модели и migration" },
            { id: "fresh", code: "применить migration на пустой базе" },
            { id: "existing", code: "применить на копии текущей базы" },
            { id: "seed", code: "создать воспроизводимые demo data" },
            { id: "slice", code: "подключить один vertical slice" },
            { id: "tests", code: "запустить migration + API tests" },
            { id: "giant", code: "создать все endpoints одним commit", note: "слишком большой шаг" },
          ]}
          correctOrder={[
            "models",
            "fresh",
            "existing",
            "seed",
            "slice",
            "tests",
          ]}
          explanation={"Сначала доказывается схема и воспроизводимость, затем включается одно пользовательское поведение."}
        />

        <TrueFalse
          statement={<>{"Если migration работает на пустой базе, этого достаточно для существующего StudyHub."}</>}
          isTrue={false}
          explanation={"Нужно проверить путь обновления текущей схемы и сохранность имеющихся данных."}
        />

        <Callout tone="info">
          {"Migration plan всегда включает две базы: fresh install и upgrade существующего состояния."}
        </Callout>
      </Section>

      <Section number={"06"} title={"Seed data и обратная совместимость"}>
        <Lead>
          {"Demo data делает flow воспроизводимым: teacher, student, published Course, Enrollment и несколько lessons. Seed не должен обходить constraints или требовать ручного редактирования базы."}
        </Lead>

        <div className="lesson-practice-steps">
          <h3>{"Deterministic"}</h3>
          <p>{"Повторный запуск не создаёт хаотичные дубли."}</p>
          <h3>{"Representative"}</h3>
          <p>{"Данные покрывают happy path и один expected failure."}</p>
          <h3>{"Compatibility"}</h3>
          <p>{"Существующие endpoints остаются рабочими или получают задокументированный migration path."}</p>
        </div>

        <TypeCards>
          <TypeCard badge={"teacher"} title={"Владелец demo Course"} code={"teacher@example.test"}>
            {"Создаёт и публикует контент."}
          </TypeCard>
          <TypeCard badge={"student"} badgeTone={"float"} title={"Участник flow"} code={"student@example.test"}>
            {"Записывается и создаёт completion."}
          </TypeCard>
          <TypeCard badge={"course"} badgeTone={"str"} title={"Проверяемый контент"} code={"2 modules · 4 lessons"}>
            {"Даёт 0%, 50% и 100% progress scenarios."}
          </TypeCard>
        </TypeCards>

        <CompareSolutions
          question={"Какой seed пригоден для команды?"}
          left={{
            title: "Ручная правка БД",
            code: "Открыть GUI и создать строки",
            note: "Невоспроизводимо и легко пропустить constraint.",
          }}
          right={{
            title: "Идемпотентный script/command",
            code: "python -m app.seed_lms",
            note: "Повторяемый результат и явная проверка ошибок.",
          }}
          preferred={"right"}
          explanation={"Другой разработчик должен получить тот же demo flow одной командой."}
        />

        <Callout tone="info">
          {"Seed — часть developer experience и демонстрации, а не скрытая ручная подготовка автора."}
        </Callout>
      </Section>

      <Section number={"07"} title={"Vertical slices и Definition of Done"}>
        <Lead>
          {"Реализация идёт не по слоям «сначала все модели, потом все routers», а по законченным пользовательским сценариям. Каждый slice включает migration, schemas, service, endpoint, permissions и tests."}
        </Lead>

        <div className="lesson-practice-steps">
          <h3>{"Slice 1"}</h3>
          <p>{"Teacher creates and edits own draft Course."}</p>
          <h3>{"Slice 2"}</h3>
          <p>{"Teacher builds content tree and publishes."}</p>
          <h3>{"Slice 3"}</h3>
          <p>{"Student enrolls in published Course."}</p>
          <h3>{"Slice 4"}</h3>
          <p>{"Student completes Lesson and reads progress."}</p>
        </div>

        <BranchExplorer
          code={"vertical slice\n├── migration/model\n├── schemas\n├── service\n├── permission\n├── endpoint\n├── positive test\n├── negative test\n└── docs/demo"}
          scenarios={[
            { label: "Course slice", activeLine: 3, output: "одна пользовательская ценность проходит через все слои" },
            { label: "без negative test", activeLine: 6, output: "permission не доказан" },
            { label: "без docs/demo", activeLine: 8, output: "результат трудно воспроизвести другому человеку" },
          ]}
        />

        <FlipCards
          cards={[
            { front: <>{"Done"}</>, back: <>{"Happy path и expected failure проходят автоматически."}</> },
            { front: <>{"Done"}</>, back: <>{"Migration работает fresh и upgrade."}</> },
            { front: <>{"Done"}</>, back: <>{"OpenAPI и README совпадают с contract."}</> },
            { front: <>{"Not done"}</>, back: <>{"Код написан, но ownership не проверен."}</> },
          ]}
        />

        <Callout tone="info">
          {"Definition of Done описывает доказательства готовности, а не процент написанного кода."}
        </Callout>
      </Section>

      <Section number="08" title="Контрольная точка и проектный артефакт">
        <Lead>
          {"Завершите занятие не конспектом, а проверяемым документом docs/lms/blueprint.md. Он должен быть понятен другому разработчику без устных пояснений и связывать модель, успешный путь, ожидаемый отказ и критерии готовности."}
        </Lead>

        <div className="lesson-practice-steps">
          <h3>{"Проверка модели"}</h3>
          <p>{"Другой разработчик может восстановить сущности, связи и источник истины по документу docs/lms/blueprint.md."}</p>
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
            question={"Что обязательно содержит строка API contract?"}
            options={[
              "Method/path, actor, schemas, response и errors",
              "Только имя endpoint",
              "Только SQL",
            ]}
            correctIndex={0}
            explanation={"Contract связывает запрос, права и наблюдаемый результат."}
          />
          <QuizCard
            question={"Почему CourseCreate не принимает teacher_id?"}
            options={[
              "Ownership задаётся current_user на сервере",
              "Pydantic не поддерживает id",
              "Teacher не нужен",
            ]}
            correctIndex={0}
            explanation={"Server-managed поле нельзя доверять клиенту."}
          />
          <QuizCard
            question={"Что проверяет migration plan кроме fresh database?"}
            options={[
              "Upgrade существующей схемы и сохранность данных",
              "Только длину файла",
              "Только имя revision",
            ]}
            correctIndex={0}
            explanation={"Реальный проект обновляет уже существующее состояние."}
          />
          <QuizCard
            question={"Что является vertical slice?"}
            options={[
              "Один пользовательский flow через schema, service, endpoint, permissions и tests",
              "Все ORM-модели сразу",
              "Только router",
            ]}
            correctIndex={0}
            explanation={"Slice даёт законченное проверяемое поведение."}
          />
        </div>

        <KeyTakeaways
          points={[
            <>{"Blueprint объединяет product, data, behavior и delivery decisions."}</>,
            <>{"API contract фиксирует actor, schemas, response и expected errors."}</>,
            <>{"Create, Update и Read schemas имеют разные направления данных."}</>,
            <>{"ER-диаграмма различает database constraints и application invariants."}</>,
            <>{"Migration проверяется на fresh и существующей базе."}</>,
            <>{"Seed data должен быть воспроизводимым и идемпотентным."}</>,
            <>{"Vertical slices уменьшают blast radius и дают законченную ценность."}</>,
          ]}
        />

        <PracticeCta text={"Соберите docs/lms/blueprint.md: включите contract 12–16 endpoints, финальную ER-диаграмму, список schemas, migration sequence, demo seed и четыре vertical slices с Definition of Done. Проведите защиту blueprint и сделайте коммит docs: approve LMS Core blueprint."} />
      </Section>
    </RichLesson>
  );
}

