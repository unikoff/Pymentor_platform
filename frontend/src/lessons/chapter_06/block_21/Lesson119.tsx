import { FileText, ShieldCheck } from "lucide-react";
import { BugHunt, Callout, CodeBlock, CodeSequence, CompareSolutions, KeyTakeaways, Lead, MethodGrid, PracticeCta, QuizCard, RecallCard, RichHero, RichLesson, Section, StepThrough, TerminalDemo, TypeCard, TypeCards } from "../../shared";
import { TheoryBridge } from "../../shared";
const BLOCK_TITLE = "Блок 21 · SQL как язык работы с данными";

type LessonProps = { module?: string };

export function Lesson119({ module }: LessonProps) {
  return (
    <RichLesson>
      <RichHero
        variant="project"
        chip={module ?? BLOCK_TITLE}
        title={"INSERT и безопасные параметры"}
        intro={"Научимся добавлять строки без склеивания SQL с пользовательским текстом: разберём явный список колонок, server default, RETURNING, пакетную вставку и параметризованный запрос через SQLAlchemy text()."}
        tags={[
          { icon: <FileText size={14} />, label: "INSERT · VALUES · RETURNING" },
          { icon: <ShieldCheck size={14} />, label: "statement отдельно от данных" },
        ]}
      />
      <TheoryBridge link={"SQL statement описывает структуру операции, а параметры передают значения отдельно. Драйвер сам кодирует данные, поэтому кавычки внутри title остаются частью значения, а не становятся фрагментом SQL."} boundary={"Параметризация защищает значения, но не подставляет безопасно имена таблиц, колонок или ключевые слова. Структура запроса остаётся кодом."} />

      <Section number="01" title={"INSERT добавляет новую строку"}>
        <Lead>
          {"Команда INSERT INTO называет таблицу, список колонок и значения. Явный список колонок делает запрос устойчивее к порядку полей и понятнее при чтении."}
        </Lead>

        <div className="lesson-route">
          <ol>
            <li>
              <strong>Назвать колонки:</strong> {"явно указать, какие поля получает новая строка"}
            </li>
            <li>
              <strong>Передать значения:</strong> {"использовать параметры вместо сборки SQL-строки"}
            </li>
            <li>
              <strong>Проверить результат:</strong> {"получить id через RETURNING или повторный SELECT"}
            </li>
          </ol>
          <p>{"Результат — insert_task.py, который принимает данные отдельно от текста statement."}</p>
        </div>

        <MethodGrid
          rows={[
            [<>Назвать колонки</>, "явно указать, какие поля получает новая строка"],
            [<>Передать значения</>, "использовать параметры вместо сборки SQL-строки"],
            [<>Проверить результат</>, "получить id через RETURNING или повторный SELECT"],
          ]}
        />

        <TypeCards>
          <TypeCard badge={"table"} title={"Куда записываем"} code={"INSERT INTO tasks_sql_lab"}>
            {"Имя таблицы является частью структуры statement."}
          </TypeCard>
          <TypeCard badge={"columns"} badgeTone="float" title={"Что заполняем"} code={"(title, priority, is_done)"}>
            {"Колонки перечисляются явно и в согласованном порядке."}
          </TypeCard>
          <TypeCard badge={"values"} badgeTone="str" title={"Какие данные"} code={"VALUES (:title, :priority, :is_done)"}>
            {"Значения передаются параметрами, а не конкатенацией."}
          </TypeCard>
        </TypeCards>

        <Callout tone="info">
          {"Хороший INSERT можно прочитать как предложение: добавить в таблицу такие колонки, используя такие параметры."}
        </Callout>
      </Section>

      <Section number="02" title={"Явный список колонок и server default"}>
        <Lead>
          {"Если колонка имеет default и не указана в INSERT, значение выбирает база. Явное перечисление защищает от случайной зависимости от физического порядка колонок."}
        </Lead>

        <div className="lesson-practice-steps">
          <h3>Минимальный INSERT</h3>
          <p>{"Передаём только title — priority и is_done получают defaults."}</p>
          <h3>Полный INSERT</h3>
          <p>{"Явно задаём поля, которые действительно отличаются от defaults."}</p>
          <h3>Не использовать VALUES без колонок</h3>
          <p>{"Такая форма требует помнить точный порядок всей таблицы."}</p>
        </div>

        <CodeBlock
          caption={"два корректных варианта"}
          code={`INSERT INTO tasks_sql_lab (title)
VALUES ('Прочитать INSERT');

INSERT INTO tasks_sql_lab (title, priority, is_done)
VALUES ('Проверить параметры', 5, FALSE);`}
        />

        <CompareSolutions
          question={"Какой INSERT легче переживёт добавление новой колонки с default?"}
          left={{
            title: "Зависимость от порядка",
            code: "INSERT INTO tasks_sql_lab VALUES (1, 'SQL', 3, FALSE, CURRENT_TIMESTAMP)",
            note: "Нужно помнить все колонки и их физический порядок.",
          }}
          right={{
            title: "Явные колонки",
            code: "INSERT INTO tasks_sql_lab (title, priority) VALUES (:title, :priority)",
            note: "Запрос называет только заполняемые поля.",
          }}
          preferred="right"
          explanation={"Явный список колонок делает контракт INSERT видимым и не зависит от порядка объявления всех полей."}
        />

        <Callout tone="info">
          {"DEFAULT — поведение базы. Если приложение должно вернуть итоговую строку, после INSERT нужно получить значения, созданные сервером."}
        </Callout>
      </Section>

      <Section number="03" title={"Параметры отделяют код запроса от данных"}>
        <Lead>
          {"Пользовательский title может содержать апостроф. При параметризации это обычный символ данных; драйвер не вставляет строку как готовый фрагмент SQL."}
        </Lead>

        <div className="lesson-practice-steps">
          <h3>Statement</h3>
          <p>{"Фиксированная структура с именованными placeholders."}</p>
          <h3>Parameters</h3>
          <p>{"Отдельный словарь Python со значениями."}</p>
          <h3>Driver</h3>
          <p>{"Передаёт statement и данные базе по протоколу без ручного экранирования."}</p>
        </div>

        <CodeBlock
          caption={"SQLAlchemy text"}
          code={`from sqlalchemy import text

statement = text("""
    INSERT INTO tasks_sql_lab (title, priority)
    VALUES (:title, :priority)
""")

params = {
    "title": "Разобрать O'Reilly",
    "priority": 4,
}

connection.execute(statement, params)`}
        />

        <StepThrough
          code={`statement = text(SQL)
params = {"title": user_title, "priority": 4}
connection.execute(statement, params)
connection.commit()`}
          steps={[
            { line: 0, note: "Структура INSERT создаётся один раз и не содержит пользовательского title.", vars: {"SQL": "... VALUES (:title, :priority)"} },
            { line: 1, note: "Значения лежат в отдельном словаре.", vars: {"title": "пользовательский текст"} },
            { line: 2, note: "Драйвер связывает placeholders со значениями.", vars: {"операция": "parameter binding"} },
            { line: 3, note: "Commit делает успешную вставку постоянной.", vars: {"transaction": "committed"} },
          ]}
        />

        <Callout tone="info">
          {"Не нужно вручную заменять одинарные кавычки или добавлять обратные слеши. Это задача драйвера."}
        </Callout>
      </Section>

      <Section number="04" title={"Почему f-строка в SQL опасна"}>
        <Lead>
          {"При f-строке данные становятся частью синтаксиса. Даже без злого умысла title с кавычкой ломает statement; при специальном вводе структура запроса может измениться."}
        </Lead>

        <div className="lesson-practice-steps">
          <h3>Смешение уровней</h3>
          <p>{"Код SQL и внешние данные соединяются в одну строку."}</p>
          <h3>Невозможность надёжного ручного escaping</h3>
          <p>{"Правила отличаются по драйверам и типам."}</p>
          <h3>Правильная замена</h3>
          <p>{"Фиксированный statement плюс параметры."}</p>
        </div>

        <BugHunt
          code={`title = input("Название: ")
sql = f"INSERT INTO tasks_sql_lab (title) VALUES ('{title}')"
connection.execute(text(sql))`}
          question={"В чём основная проблема такого кода?"}
          options={[
            "Пользовательское значение встроено в синтаксис SQL",
            "INSERT нельзя выполнять из Python",
            "Название таблицы слишком длинное",
          ]}
          correctIndex={0}
          explanation={"F-строка смешивает statement и данные, создавая ошибки кавычек и риск SQL injection."}
          fix={`title = input("Название: ")
statement = text("""
    INSERT INTO tasks_sql_lab (title)
    VALUES (:title)
""")
connection.execute(statement, {"title": title})`}
        />

        <Callout>
          {"Учебный вывод простой: пользовательские значения никогда не собираются с SQL через f-строку, + или format()."}
        </Callout>
      </Section>

      <Section number="05" title={"RETURNING показывает созданную строку"}>
        <Lead>
          {"После INSERT часто нужен id и server defaults. RETURNING просит базу вернуть выбранные колонки той же операцией, если используемая СУБД и конкретный сценарий это поддерживают."}
        </Lead>

        <div className="lesson-practice-steps">
          <h3>Вставка</h3>
          <p>{"База создаёт строку и применяет defaults."}</p>
          <h3>Возврат</h3>
          <p>{"RETURNING id, priority, created_at возвращает итоговые значения."}</p>
          <h3>Использование</h3>
          <p>{"Приложение строит ответ без отдельного поиска по title."}</p>
        </div>

        <CodeBlock
          caption={"INSERT с RETURNING"}
          code={`INSERT INTO tasks_sql_lab (title)
VALUES (:title)
RETURNING id, title, priority, is_done, created_at;`}
        />

        <CodeSequence
          title={"Соберите безопасный INSERT с результатом"}
          prompt={"Выберите только части одной параметризованной операции."}
          pieces={[
            { id: "insert", code: "INSERT INTO tasks_sql_lab (title, priority)" },
            { id: "values", code: "VALUES (:title, :priority)" },
            { id: "returning", code: "RETURNING id, title, priority" },
            { id: "params", code: "params = {\"title\": title, \"priority\": priority}" },
            { id: "execute", code: "connection.execute(text(sql), params)" },
            { id: "fstring", code: "VALUES (f\"{title}\")", note: "Смешивает данные и SQL." },
          ]}
          correctOrder={["insert", "values", "returning", "params", "execute"]}
          explanation={"Структура statement остаётся фиксированной, значения передаются отдельно, RETURNING возвращает созданные поля."}
        />

        <Callout tone="info">
          {"В ORM похожую задачу решают add, commit и refresh. В финальном занятии блока сравним обе формы."}
        </Callout>
      </Section>

      <Section number="06" title={"Несколько строк и транзакционная граница"}>
        <Lead>
          {"Несколько INSERT можно выполнить в одной транзакции. Если одна обязательная вставка нарушает constraint, решение о commit или rollback относится ко всей операции."}
        </Lead>

        <div className="lesson-practice-steps">
          <h3>executemany</h3>
          <p>{"Один statement выполняется для списка словарей параметров."}</p>
          <h3>Атомарность сценария</h3>
          <p>{"Группа связанных вставок либо фиксируется, либо откатывается по выбранному правилу."}</p>
          <h3>Независимые записи</h3>
          <p>{"Не объединяйте случайно большой импорт в одну непрозрачную операцию без стратегии ошибок."}</p>
        </div>

        <CodeBlock
          caption={"пакет параметров"}
          code={`statement = text("""
    INSERT INTO tasks_sql_lab (title, priority)
    VALUES (:title, :priority)
""")

rows = [
    {"title": "SQL 1", "priority": 3},
    {"title": "SQL 2", "priority": 4},
]

with engine.begin() as connection:
    connection.execute(statement, rows)`}
        />

        <TerminalDemo
          title={"две строки одной операцией"}
          lines={[
            { cmd: "python sql-lab/insert_many.py" },
            { out: "BEGIN" },
            { out: "INSERT INTO tasks_sql_lab ... [2 parameter sets]" },
            { out: "COMMIT" },
            { out: "Добавлено строк: 2" },
          ]}
        />

        <Callout tone="info">
          {"engine.begin() создаёт контекст транзакции: успешный блок фиксируется, исключение приводит к rollback."}
        </Callout>
      </Section>

      <Section number="07" title={"Проверяем параметры и границы ответственности"}>
        <Lead>
          {"Параметризация не освобождает от валидации. Драйвер безопасно передаст priority = 99, а CHECK отклонит его; приложение должно раньше дать понятное сообщение пользователю."}
        </Lead>

        <div className="lesson-practice-steps">
          <h3>Pydantic</h3>
          <p>{"Проверяет форму HTTP-входа."}</p>
          <h3>Parameters</h3>
          <p>{"Безопасно доставляют уже выбранные значения в statement."}</p>
          <h3>Constraint</h3>
          <p>{"Не допускает некорректную строку в таблицу."}</p>
        </div>

        <RecallCard
          question={"Почему параметризованный запрос всё равно может завершиться IntegrityError?"}
          hint={"Безопасность синтаксиса и корректность данных — разные свойства."}
          answer={
            <p>{"Параметризация не превращает неверное значение в допустимое. CHECK, NOT NULL или UNIQUE по-прежнему проверяют данные и могут отклонить операцию."}</p>
          }
        />

        <Callout tone="info">
          {"Безопасный INSERT — это три слоя вместе: понятная валидация, параметризованный statement и constraints таблицы."}
        </Callout>
      </Section>

      <Section number="08" title={"Контрольная точка блока"}>
        <Lead>
          {"Выполните один INSERT с апострофом в title, один INSERT с server default, один RETURNING и одну пакетную вставку. В коде не должно быть ни одной f-строки, собирающей SQL."}
        </Lead>

        <div className="lesson-check-group">
          <QuizCard
            question={"Зачем перечислять колонки в INSERT?"}
            options={[
              "сделать контракт явным",
              "ускорить любой запрос автоматически",
              "отключить constraints",
            ]}
            correctIndex={0}
            explanation={"Явный список не зависит от полного физического порядка таблицы."}
          />
          <QuizCard
            question={"Как передавать пользовательский title?"}
            options={[
              "отдельным параметром",
              "через f-строку",
              "через ручную замену кавычек",
            ]}
            correctIndex={0}
            explanation={"Драйвер должен связывать значение с placeholder."}
          />
          <QuizCard
            question={"Что делает RETURNING?"}
            options={[
              "возвращает выбранные поля созданной строки",
              "откатывает INSERT",
              "создаёт constraint",
            ]}
            correctIndex={0}
            explanation={"RETURNING позволяет получить итоговые значения той же операцией."}
          />
          <QuizCard
            question={"Что обеспечивает engine.begin()?"}
            options={[
              "контекст транзакции",
              "новую ORM-модель",
              "HTTP-валидацию",
            ]}
            correctIndex={0}
            explanation={"Контекст фиксирует успешный блок и откатывает его при исключении."}
          />
        </div>

        <KeyTakeaways
          points={[
            <>{"INSERT называет таблицу, колонки и значения."}</>,
            <>{"Колонки лучше перечислять явно."}</>,
            <>{"Server default применяется к пропущенной колонке."}</>,
            <>{"Statement и параметры передаются отдельно."}</>,
            <>{"F-строка в SQL смешивает код и данные."}</>,
            <>{"RETURNING может вернуть id и server defaults."}</>,
            <>{"Параметризация дополняет, но не заменяет валидацию и constraints."}</>,
          ]}
        />

        <PracticeCta text={"Создайте insert_task.py на SQLAlchemy text(): один именованный statement, отдельный словарь параметров, RETURNING итоговой строки и тестовый title с апострофом. Добавьте insert_many.py с двумя параметрическими наборами внутри engine.begin()."} />
      </Section>
    </RichLesson>
  );
}
