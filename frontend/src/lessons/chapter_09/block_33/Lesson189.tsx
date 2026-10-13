import { ListChecks, Users } from "lucide-react";
import { BranchExplorer, BugHunt, Callout, CodeBlock, CodeSequence, CompareSolutions, FillBlank, FlipCards, KeyTakeaways, Lead, MatchPairs, MethodGrid, PracticeCta, QuizCard, RecallCard, RichHero, RichLesson, Section, StepThrough, TrueFalse, TypeCard, TypeCards } from "../../shared";
const BLOCK_TITLE = "Блок 33 · Проектирование StudyHub LMS Core";

type LessonProps = { module?: string };

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
