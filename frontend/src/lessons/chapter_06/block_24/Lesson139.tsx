import { Boxes, GitFork } from "lucide-react";
import { BugHunt, Callout, CodeBlock, CompareSolutions, KeyTakeaways, Lead, MatchPairs, MethodGrid, PracticeCta, QuizCard, RecallCard, RichHero, RichLesson, Section, StepThrough, TerminalDemo, TrueFalse, TypeCard, TypeCards } from "../../shared";
const BLOCK_TITLE = "Блок 24 · Индексы, планы запросов и модели хранения";

export function Lesson139({ module }: { module?: string }) {
  return (
    <RichLesson>
      <RichHero
        variant="project"
        chip={module ?? BLOCK_TITLE}
        title={"MongoDB и документная модель"}
        intro={"Рассмотрим MongoDB как отдельную модель, а не замену PostgreSQL по умолчанию: сохраним snapshot курса одним документом и сравним embed/reference с нормализованными таблицами."}
        tags={[
          {
            icon: <Boxes size={14} />,
            label: "document и BSON",
          },
          {
            icon: <GitFork size={14} />,
            label: "embed или reference",
          },
        ]}
      />
      <Callout tone="info">
        <strong>{"Связь с курсом."}</strong>
        {" "}
        {"PostgreSQL StudyHub остаётся реляционным источником истины. MongoDB появляется как изолированный эксперимент, чтобы научиться выбирать форму хранения по единице чтения и изменения."}
        {" "}
        <strong>{"Важно не перепутать:"}</strong>
        {" "}
        {"Гибкая схема не означает отсутствие контракта. Форму документа всё равно защищают приложение, validation rules, тесты и миграция данных при изменении формата."}
      </Callout>
      <Section number={"01"} title={"Проблема и маршрут занятия"}>
        <Lead>
          {"Рассмотрим MongoDB как отдельную модель, а не замену PostgreSQL по умолчанию: сохраним snapshot курса одним документом и сравним embed/reference с нормализованными таблицами."}
        </Lead>
        <div className="lesson-route">
          <ol>
            <li>
              <strong>{"Определить документ."}</strong>
              {" "}
              {"выбрать данные, которые обычно читаются и обновляются как единое целое."}
            </li>
            <li>
              <strong>{"Выбрать embed/reference."}</strong>
              {" "}
              {"вложить небольшую связанную часть или хранить отдельную ссылку."}
            </li>
            <li>
              <strong>{"Проверить изменение."}</strong>
              {" "}
              {"понять цену дублирования и массового обновления копий."}
            </li>
            <li>
              <strong>{"Сравнить с PostgreSQL."}</strong>
              {" "}
              {"выбор делается по требованиям, а не по отсутствию JOIN."}
            </li>
          </ol>
          <p>{"Результат занятия становится частью общего аудита PostgreSQL StudyHub."}</p>
        </div>
        <TypeCards>
          <TypeCard
            badge={"database"}
            title={"База MongoDB"}
            code={"studyhub_lab"}
          >
            {"Содержит collections."}
          </TypeCard>
          <TypeCard
            badge={"collection"}
            badgeTone={"float"}
            title={"Набор документов"}
            code={"course_snapshots"}
          >
            {"Документы похожего назначения, но не обязаны быть байт-в-байт одинаковыми."}
          </TypeCard>
          <TypeCard
            badge={"document"}
            badgeTone={"str"}
            title={"Единица чтения"}
            code={"{course_id, modules: [...]}"}
          >
            {"BSON-объект с полями, массивами и вложенными документами."}
          </TypeCard>
        </TypeCards>
        <Callout tone="info">
          {"Сначала сформулируйте наблюдаемую проблему и критерий успеха. Инструмент появляется только после этого."}
        </Callout>
      </Section>
      <Section number={"02"} title={"Главная модель и термины"}>
        <Lead>
          {"PostgreSQL StudyHub остаётся реляционным источником истины. MongoDB появляется как изолированный эксперимент, чтобы научиться выбирать форму хранения по единице чтения и изменения."}
        </Lead>
        <MethodGrid
          rows={[
            [<>{"BSON"}</>, "бинарное представление документов с типами"],
            [<>{"embed"}</>, "связанные данные вложены и читаются одним документом"],
            [<>{"reference"}</>, "документ хранит идентификатор другого документа"],
            [<>{"duplication"}</>, "часть данных копируется ради удобного чтения"],
            [<>{"flexible schema"}</>, "разные документы могут иметь разные поля, но контракт всё равно нужен"],
          ]}
        />
        <CodeBlock
          caption={"snapshot курса как документ"}
          code={[
          "{",
          "  \"course_id\": 17,",
          "  \"title\": \"PostgreSQL StudyHub\",",
          "  \"version\": 3,",
          "  \"modules\": [",
          "    {",
          "      \"position\": 1,",
          "      \"title\": \"SQL\",",
          "      \"lesson_ids\": [117, 118, 119]",
          "    }",
          "  ]",
          "}",
        ] .join(String.fromCharCode(10))}
        />
        <RecallCard
          question={"Объясните главную модель этого раздела без терминов из документации."}
          hint={"Назовите вход, выполняемую работу и наблюдаемый результат."}
          answer={
            <p>{"Гибкая схема не означает отсутствие контракта. Форму документа всё равно защищают приложение, validation rules, тесты и миграция данных при изменении формата."}</p>
          }
        />
      </Section>
      <Section number={"03"} title={"Embed или reference зависит от жизненного цикла"}>
        <Lead>
          {"Небольшой snapshot курса читается целиком и не является живой моделью прав доступа. Его удобно вложить. Пользователь, который меняется независимо и используется во многих местах, обычно остаётся отдельной сущностью."}
        </Lead>
        <StepThrough
          code={[
          "course_snapshot = {",
          "    \"course_id\": 17,",
          "    \"title\": \"PostgreSQL StudyHub\",",
          "    \"modules\": [",
          "        {\"position\": 1, \"title\": \"SQL\"},",
          "        {\"position\": 2, \"title\": \"PostgreSQL\"},",
          "    ],",
          "}",
        ] .join(String.fromCharCode(10))}
          steps={[
            {
              line: 0,
              note: "Создаётся отдельный экспортный документ.",
              vars: {"purpose": "snapshot"},
            },
            {
              line: 1,
              note: "course_id связывает snapshot с источником в PostgreSQL.",
              vars: {"source": "PostgreSQL"},
            },
            {
              line: 2,
              note: "title дублируется осознанно для автономного чтения snapshot.",
              vars: {"duplication": "accepted"},
            },
            {
              line: 3,
              note: "modules вложены, потому что snapshot читается целиком.",
              vars: {"strategy": "embed"},
            },
          ]}
        />
        <Callout tone="info">
          {"Пошаговый разбор нужен не для запоминания вывода, а для объяснения причин каждого перехода."}
        </Callout>
        <TrueFalse
          statement={<>{"Гибкая схема не означает отсутствие контракта. Форму документа всё равно защищают приложение, validation rules, тесты и миграция данных при изменении формата."}</>}
          isTrue={true}
          explanation={"Это ключевая граница урока: без неё инструмент легко применить механически."}
        />
      </Section>
      <Section number={"04"} title={"Выберите embed или reference"}>
        <Lead>
          {"Сейчас нужно не копировать готовую команду, а выбрать ветку или структуру по требованиям конкретного сценария."}
        </Lead>
        <MatchPairs
          prompt={"Выберите embed или reference"}
          pairs={[
            { left: "небольшие modules внутри неизменяемого snapshot", right: "embed" },
            { left: "author profile используется тысячами документов", right: "reference" },
            { left: "address читается только вместе с order snapshot", right: "embed" },
            { left: "permission role меняется независимо", right: "reference" },
          ]}
          explanation={"Пары связывают требование с подходящей структурой или решением."}
        />
        <Callout>
          {"После выбора проговорите, какое условие изменило решение и какой альтернативный результат был бы возможен."}
        </Callout>
      </Section>
      <Section number={"05"} title={"Сравнение решений и цена выбора"}>
        <Lead>
          {"Два варианта могут быть синтаксически корректны, но только один соответствует измеряемому query pattern, модели данных или эксплуатационной процедуре."}
        </Lead>
        <CompareSolutions
          question={"Где лучше хранить живые задачи, категории, владельцев и транзакционные ограничения StudyHub?"}
          left={{
            title: "Перенести всё в один MongoDB document",
            code: "{user, tasks: [...], categories: [...]}",
            note: "Документ растёт, конкурентные изменения затрагивают одну крупную запись, а реляционные ограничения приходится переносить в приложение.",
          }}
          right={{
            title: "Оставить PostgreSQL источником истины",
            code: "users + tasks + categories + foreign keys",
            note: "Связи, уникальность, транзакции и отчётные запросы уже естественно выражены реляционной моделью.",
          }}
          preferred={"right"}
          explanation={"MongoDB полезна для подходящей единицы документа, но не отменяет преимущества PostgreSQL для текущего домена StudyHub."}
        />
        <TrueFalse
          statement={<>{"Корректный синтаксис сам по себе ещё не доказывает, что решение подходит проектному сценарию."}</>}
          isTrue={true}
          explanation={"Решение оценивается по query pattern, модели данных, измерению и эксплуатационной цене."}
        />
        <div className="lesson-practice-steps">
          <h3>{"Вопрос перед изменением"}</h3>
          <p>{"Какую конкретную работу перестанет выполнять система или какую гарантию добавит выбранный вариант?"}</p>
          <h3>{"Вопрос после изменения"}</h3>
          <p>{"Каким измерением, plan, smoke test или наблюдаемым сценарием подтверждается результат?"}</p>
          <h3>{"Граница"}</h3>
          <p>{"Гибкая схема не означает отсутствие контракта. Форму документа всё равно защищают приложение, validation rules, тесты и миграция данных при изменении формата."}</p>
        </div>
      </Section>
      <Section number={"06"} title={"Изолированный CRUD snapshot"}>
        <Lead>
          {"Эксперимент живёт в отдельной collection course_snapshots. Он не участвует в основном API и не становится вторым источником истины для задач или пользователей."}
        </Lead>
        <CodeBlock
          caption={"mongo_lab.py"}
          code={[
          "from pymongo import MongoClient",
          "",
          "client = MongoClient(\"mongodb://localhost:27017\")",
          "collection = client.studyhub_lab.course_snapshots",
          "",
          "snapshot = {",
          "    \"course_id\": 17,",
          "    \"title\": \"PostgreSQL StudyHub\",",
          "    \"version\": 3,",
          "    \"modules\": [",
          "        {\"position\": 1, \"title\": \"SQL\"},",
          "    ],",
          "}",
          "",
          "result = collection.insert_one(snapshot)",
          "loaded = collection.find_one({\"_id\": result.inserted_id})",
          "print(loaded[\"title\"])",
        ] .join(String.fromCharCode(10))}
        />
        <TerminalDemo
          title={"проверка в терминале"}
          lines={[
            { cmd: "python mongo_lab.py" },
            { out: "PostgreSQL StudyHub" },
            { cmd: "mongosh \"mongodb://localhost:27017/studyhub_lab\"" },
            { cmd: "db.course_snapshots.findOne({course_id: 17})" },
            { out: "{ course_id: 17, title: \"PostgreSQL StudyHub\", version: 3, ... }" },
          ]}
        />
        <div className="lesson-practice-steps">
          <h3>{"До запуска"}</h3>
          <p>{"Зафиксируйте входные данные, версию команды и ожидаемый наблюдаемый результат."}</p>
          <h3>{"После запуска"}</h3>
          <p>{"Сохраните фактический вывод, сравните его с ожиданием и объясните расхождение."}</p>
          <h3>{"Перед коммитом"}</h3>
          <p>{"Повторите успешный и ошибочный сценарий из чистого состояния."}</p>
        </div>
        <Callout tone="info">
          {"Проектный артефакт должен запускаться повторно: SQL-файл, migration, script, test или runbook сохраняется в репозитории."}
        </Callout>
      </Section>
      <Section number={"07"} title={"Диагностика ошибки и объяснение результата"}>
        <Lead>
          {"Профессиональный сценарий включает не только успех. Найдите ошибочное предположение, исправьте минимальную часть и повторите прежнюю проверку."}
        </Lead>
        <MethodGrid
          rows={[
            [<>{"наблюдение"}</>, "записать точный вывод, plan, row count или cache result"],
            [<>{"ожидание"}</>, "назвать результат, который считался правильным"],
            [<>{"расхождение"}</>, "найти первое место, где факт перестал совпадать с ожиданием"],
            [<>{"минимальное исправление"}</>, "изменить одну причину и повторить прежнюю проверку"],
          ]}
        />
        <BugHunt
          code={[
          "collection.insert_one({",
          "    \"course_id\": 17,",
          "    \"title\": \"StudyHub\",",
          "})",
          "",
          "collection.insert_one({",
          "    \"course_id\": \"seventeen\",",
          "    \"modules\": \"SQL\",",
          "})",
        ] .join(String.fromCharCode(10))}
          question={"Что демонстрирует второй документ?"}
          options={[
            "Гибкость без валидации допускает несовместимую форму",
            "MongoDB всегда преобразует строку в число",
            "Collection запрещает разные поля",
          ]}
          correctIndex={0}
          explanation={"Без validation contract collection принимает структуру, которую код может не уметь читать."}
          fix={[
          "snapshot = CourseSnapshot.model_validate(payload)",
          "collection.insert_one(snapshot.model_dump())",
        ] .join(String.fromCharCode(10))}
        />
        <RecallCard
          question={"Когда embed становится проблемой?"}
          answer={
            <p>{"Когда вложенная сущность часто меняется независимо, используется во многих документах или приводит к большому дублированию и массовому обновлению копий."}</p>
          }
        />
        <Callout>
          {"Не скрывайте ошибку новой технологией. Сначала назовите нарушенное ожидание, затем покажите проверяемое исправление."}
        </Callout>
      </Section>
      <Section number={"08"} title={"Контрольная точка и практика"}>
        <Lead>
          {"Урок завершён, когда вы можете воспроизвести сценарий, объяснить выбранный инструмент и показать отрицательный путь без подсказки."}
        </Lead>
        <TypeCards>
          <TypeCard
            badge={"артефакт"}
            title={"Что предъявить"}
            code={"reproducible artifact"}
          >
            {"SQL, migration, script, plan, backup report или cache lab сохранены в репозитории."}
          </TypeCard>
          <TypeCard
            badge={"проверка"}
            badgeTone={"float"}
            title={"Что доказать"}
            code={"success + failure"}
          >
            {"Успешный и ошибочный сценарии дают ожидаемый наблюдаемый результат."}
          </TypeCard>
          <TypeCard
            badge={"защита"}
            badgeTone={"str"}
            title={"Что объяснить"}
            code={"decision + trade-off"}
          >
            {"Выбор связан с требованиями проекта и имеет названную цену."}
          </TypeCard>
        </TypeCards>
        <div className="lesson-check-group">
          <QuizCard
            question={"Что является единицей хранения MongoDB?"}
            options={[
              "Документ",
              "SQL-строка",
              "Python-модуль",
            ]}
            correctIndex={0}
            explanation={"Collection содержит BSON-документы."}
          />
          <QuizCard
            question={"Когда embed особенно удобен?"}
            options={[
              "Связанные данные читаются и меняются как целое",
              "Сущность используется везде независимо",
              "Нужен внешний ключ PostgreSQL",
            ]}
            correctIndex={0}
            explanation={"Вложение соответствует общей единице жизненного цикла."}
          />
          <QuizCard
            question={"Что означает flexible schema?"}
            options={[
              "Форма может различаться, но контракт всё равно нужен",
              "Типы полностью исчезают",
              "Любые данные автоматически корректны",
            ]}
            correctIndex={0}
            explanation={"Гибкость требует осознанной валидации."}
          />
          <QuizCard
            question={"Что остаётся source of truth StudyHub?"}
            options={[
              "PostgreSQL",
              "Snapshot collection",
              "README",
            ]}
            correctIndex={0}
            explanation={"MongoDB используется только для изолированного эксперимента snapshot."}
          />
        </div>
        <KeyTakeaways
          points={[
            <>{"MongoDB хранит BSON-документы в collections."}</>,
            <>{"Документ проектируется как единица совместного чтения и изменения."}</>,
            <>{"Embed уменьшает число чтений, но может увеличить дублирование."}</>,
            <>{"Reference подходит для независимо живущей сущности."}</>,
            <>{"Flexible schema не отменяет validation contract."}</>,
            <>{"PostgreSQL остаётся источником истины PostgreSQL StudyHub."}</>,
          ]}
        />
        <PracticeCta text={"Создайте отдельный course snapshot в MongoDB, выполните insert/find/update и составьте таблицу, почему live-задачи остаются в PostgreSQL."} />
        <div className="lesson-practice-steps">
          <h3>{"Критерий готовности"}</h3>
          <p>{"Есть воспроизводимый артефакт, успешная проверка, ожидаемый сбой, объяснение результата и отдельный осмысленный Git-коммит."}</p>
        </div>
      </Section>
    </RichLesson>
  );
}
