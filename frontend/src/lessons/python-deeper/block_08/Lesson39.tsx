import type { ReactNode } from "react";
import {
  Boxes,
  Braces,
} from "lucide-react";
import {
  BugHunt,
  Callout,
  CodeBlock,
  CodeSequence,
  KeyTakeaways,
  Lead,
  PracticeCta,
  PredictOutput,
  QuizCard,
  RecallCard,
  RichHero,
  RichLesson,
  Section,
  TrueFalse,
  TheoryBridge,
} from "../../shared";


const Lesson39ConceptGrid = ({ children }: { children: ReactNode }) => <div className="lesson39-concept-grid">{children}</div>;
const Lesson39Concept = ({ title, children }: { title: string; children: ReactNode }) => <article className="lesson39-concept"><h3>{title}</h3><p>{children}</p></article>;
const Lesson39Explainer = ({ title, label, children }: { title: string; label?: string; children: ReactNode }) => <article className="lesson39-explainer"><header>{label && <span>{label}</span>}<h3>{title}</h3></header><div className="lesson39-explainer-body">{children}</div></article>;
const Lesson39Narrative = ({ children }: { children: ReactNode }) => <div className="lesson39-narrative">{children}</div>;

// 39. dataclass, композиция и границы наследования
export function Lesson39({ module }: { module?: string }) {
  return (
    <RichLesson className="lesson39">
      <RichHero
        chip={module ?? "Месяц 2 · Блок 8"}
        title={"39. dataclass, композиция и границы наследования"}
        intro={"Начнём один Persistent Planner с самой маленькой устойчивой детали: модели Task. Сначала разберём данные, правила и композицию. Storage, сервис и JSON появятся только после этой основы."}
        tags={[
          { icon: <Braces size={14} />, label: "dataclass и инварианты" },
          { icon: <Boxes size={14} />, label: "композиция" },
        ]}
      />
      <TheoryBridge link={"Task получает понятные поля, инварианты и независимые изменяемые данные. Композиция показана как принцип, а коллекция задач появится только вместе с MemoryStorage."} boundary={"dataclass не создаёт бизнес-правила сам, а storage, service и JSON ещё не входят в модель Task."} />

      <Section number="00" title={"С чего начинается живой проект"}>
        <Lead>
          {"Планировщик легко начать с одного списка и пары функций. Но у задачи быстро появляются собственные данные, статус и правила. В этот момент ей нужна ясная форма, которая не зависит от будущего файла, меню или базы данных."}
        </Lead>

        <div className="lesson-practice-steps">
          <h3>Сейчас</h3>
          <p>
            {"Мы создаём только Task и её правила. Это первая контрольная точка одного проекта, а не отдельная проба кода."}
          </p>

          <h3>Позже</h3>
          <p>
            {"В следующем занятии впервые появятся MemoryStorage и service, затем pytest, JSON и CLI. Каждый новый слой будет использовать уже готовую часть."}
          </p>

          <h3>Главный вопрос</h3>
          <p>
            {"Какая часть отвечает за корректность одной задачи? Ответ не зависит от того, где задача хранится и как пользователь её создаёт."}
          </p>
        </div>

        <CodeBlock
          caption={"путь развития одного продукта"}
          code={
            "Task\n" +
            "→ MemoryStorage + PlannerService\n" +
            "→ pytest для in-memory ядра\n" +
            "→ JsonStorage + CLI\n" +
            "→ приёмка и release"
          }
        />

        <RecallCard
          question={"Почему на старте не стоит добавлять JSON и меню?"}
          hint={"Сначала найдите слой, который должен оставаться корректным при любом интерфейсе."}
          answer={
            <p>
              {"Пока не определены правила Task, сложно понять источник ошибки. Модель должна стать устойчивой раньше инфраструктуры и интерфейса."}
            </p>
          }
        />
      </Section>

      <Section number="01" title={"Dataclass: модель одной задачи"}>
        <Lead>
          {"Dataclass полезен классам, которые прежде всего описывают данные: задачу, заказ, настройку или результат. Он убирает повторяющийся код и оставляет внимание на смысле полей."}
        </Lead>

        <CodeBlock
          caption={"независимый пример модели"}
          code={
            "from dataclasses import dataclass\n" +
            "\n" +
            "@dataclass\n" +
            "class Book:\n" +
            "    title: str\n" +
            "    pages: int\n" +
            "    is_read: bool = False\n" +
            "\n" +
            "book = Book(\"Python\", 420)\n" +
            "print(book)"
          }
        />

        <div className="lesson-practice-steps">
          <h3>Что даёт dataclass</h3>
          <p>
            {"Он создаёт удобный конструктор, представление объекта и сравнение по полям. Класс при этом остаётся обычным Python-классом с вашими методами."}
          </p>

          <h3>Чего он не делает</h3>
          <p>
            {"Dataclass не знает, допустима ли пустая строка, нужен ли файл и какой приоритет разрешён. Предметные правила остаются частью модели."}
          </p>

          <h3>Что будет в проекте</h3>
          <p>
            {"Task получит id, title, priority, is_done и tags. Пока это только данные и правила одной задачи."}
          </p>
        </div>

        <QuizCard
          question={"Какое правило dataclass не может выбрать сам?"}
          options={[
            "Создать конструктор по полям",
            "Запретить пустой title именно в планировщике",
            "Показать поля объекта при отладке",
          ]}
          correctIndex={1}
          explanation={"Dataclass не знает предметную область. Правило пустого title относится к модели Task."}
        />

        <Callout tone="info">
          {"Аннотация title: str описывает ожидаемый тип. Она не превращает строку из пробелов в корректное название."}
        </Callout>
      </Section>

      <Section number="02" title={"Tags и граница изменяемого состояния"}>
        <Lead>
          {"Список tags меняется после создания Task. Поэтому важно, чтобы у каждой задачи был собственный список, а не один общий список на весь класс."}
        </Lead>

        <PredictOutput
          code={
            "class Playlist:\n" +
            "    tags = []\n" +
            "\n" +
            "first = Playlist()\n" +
            "second = Playlist()\n" +
            "first.tags.append(\"study\")\n" +
            "\n" +
            "print(second.tags)\n" +
            "print(first.tags is second.tags)"
          }
          output={"['study']\nTrue"}
          hint={"Список создан на классе Playlist один раз, поэтому оба объекта видят одну ссылку."}
        />

        <p>
          {"Dataclass решает эту проблему через field(default_factory=list). Python вызовет list отдельно для каждой новой Task. В результате списки могут быть одинаково пустыми, но не будут одним объектом."}
        </p>

        <CodeBlock
          caption={"новый список для каждого объекта"}
          code={
            "from dataclasses import dataclass, field\n" +
            "\n" +
            "@dataclass\n" +
            "class Playlist:\n" +
            "    name: str\n" +
            "    tags: list[str] = field(default_factory=list)"
          }
        />

        <BugHunt
          code={
            "@dataclass\n" +
            "class Task:\n" +
            "    title: str\n" +
            "    tags: list[str] = []"
          }
          question={"Что нарушает такое поле tags?"}
          options={[
            "Несколько Task могут получить общий список",
            "Dataclass не сможет создать __init__",
            "Список нельзя использовать в модели",
          ]}
          correctIndex={0}
          explanation={"Проблема не в списке. Изменяемое значение нельзя неявно разделять между экземплярами."}
          fix={"tags: list[str] = field(default_factory=list)"}
        />

        <RecallCard
          question={"Почему в проверке нужны и ==, и is not?"}
          hint={"Один оператор сравнивает содержимое, другой проверяет сам объект списка."}
          answer={
            <p>
              {"== доказывает, что у второй задачи нет чужого тега. is not доказывает, что два списка действительно независимы."}
            </p>
          }
        />
      </Section>

      <Section number="03" title={"Инварианты и действие mark_done"}>
        <Lead>
          {"Инвариант это правило, которое должно быть верно у каждой корректной Task. Модель проверяет его при создании, а не надеется на один конкретный интерфейс."}
        </Lead>

        <CodeBlock
          caption={"независимый пример проверки модели"}
          code={
            "@dataclass\n" +
            "class Temperature:\n" +
            "    value: int\n" +
            "\n" +
            "    def __post_init__(self):\n" +
            "        if not -80 <= self.value <= 60:\n" +
            "            raise ValueError(\"outside allowed range\")"
          }
        />

        <p>
          {"У Task сначала очищается title, затем проверяется его смысл. Такой порядок отличает название с пробелами по краям от строки, в которой после очистки ничего не осталось."}
        </p>

        <CodeSequence
          title={"Соберите проверку title"}
          prompt={"Расположите действия модели в правильном порядке."}
          pieces={[
            { id: "receive", code: "Task получает title", note: "Dataclass уже заполнил поле." },
            { id: "strip", code: "self.title = self.title.strip()", note: "Модель нормализует вход." },
            { id: "check", code: "if not self.title: raise ValueError", note: "Проверяется уже очищенное значение." },
            { id: "use", code: "Task передаётся дальше", note: "Остальные слои получают корректный объект." },
          ]}
          correctOrder={["receive", "strip", "check", "use"]}
          explanation={"Проверка после strip не позволяет строке из одних пробелов пройти в приложение."}
        />

        <div className="lesson-practice-steps">
          <h3>Кто владеет title и priority</h3>
          <p>
            {"Task. Если правила оставить в CLI, другой вход сможет их обойти."}
          </p>

          <h3>Зачем mark_done</h3>
          <p>
            {"Метод выражает предметное действие. Позже внутри него можно добавить дату или аудит, не меняя все вызовы в проекте."}
          </p>

          <h3>Что пока отсутствует</h3>
          <p>
            {"Task не сохраняет себя, не ищет другие задачи и не печатает сообщения. Это будут роли других объектов."}
          </p>
        </div>

        <TrueFalse
          statement={<>{"Правило пустого title достаточно проверить только около input()."}</>}
          isTrue={false}
          explanation={"Task может создаваться из теста, файла или будущего API. Инвариант должен жить в модели."}
        />
      </Section>

      <Section number="04" title={"Композиция и границы наследования"}>
        <Lead>
          {"Композиция описывает связь «содержит» или «использует». Она важна для следующего слоя, но не требует создавать новый класс только ради примера."}
        </Lead>

        <CodeBlock
          caption={"независимый пример композиции"}
          code={
            "class Library:\n" +
            "    def __init__(self, books):\n" +
            "        self.books = list(books)"
          }
        />

        <p>
          {"Library содержит книги, но не является книгой. Поэтому наследование здесь неверно: у библиотеки и книги разные данные, правила и причины изменения."}
        </p>

        <BugHunt
          code={
            "class Library(Book):\n" +
            "    pass"
          }
          question={"Почему это неверная связь?"}
          options={[
            "Library содержит книги, но не является книгой",
            "Наследование нельзя использовать в Python",
            "Список нельзя хранить в классе",
          ]}
          correctIndex={0}
          explanation={"Наследование отвечает на вопрос «является ли». Для отношения «имеет» или «использует» нужна композиция."}
          fix={"class Library:\n    def __init__(self, books):\n        self.books = list(books)"}
        />

        <Callout tone="info">
          {"В следующем занятии MemoryStorage станет первым объектом учебного проекта, который содержит список Task. Тогда композиция получит прикладную роль и понятный договор load/save."}
        </Callout>
      </Section>

      <Section number="05" title={"Граница текущей контрольной точки"}>
        <Lead>
          {"Полнота не означает добавить все технологии в один вечер. Сейчас проект получает модель и in-memory контейнер. Остальные слои появятся, когда для них уже есть понятная проблема."}
        </Lead>

        <div className="lesson-practice-steps">
          <h3>Готово после этой работы</h3>
          <p>
            {"Task, её инварианты, независимые tags, mark_done и smoke-сценарий модели."}
          </p>

          <h3>Появится дальше</h3>
          <p>
            {"MemoryStorage, PlannerService, pytest, JsonStorage, CLI и полный набор пользовательских операций."}
          </p>

          <h3>Почему это полезно</h3>
          <p>
            {"Если ошибка появится позже, мы сможем отделить проблему модели от проблемы storage и интерфейса."}
          </p>
        </div>

        <QuizCard
          question={"Кто должен читать JSON-файл на текущем этапе?"}
          options={[
            "Никто, persistent слой ещё не введён",
            "Task",
            "Будущий PlannerService",
          ]}
          correctIndex={0}
          explanation={"JSON требует отдельной границы сериализации и хранения. Сейчас она ещё сознательно отсутствует."}
        />
      </Section>

      <Section number="06" title={"Где это встретится в production"}>
        <Lead>
          {"В большом продукте модель, хранение, прикладной сценарий и интерфейс тоже часто разделены. Меняется масштаб, но не смысл ролей."}
        </Lead>

        <div className="lesson-practice-steps">
          <h3>Модель</h3>
          <p>
            {"Task похожа на доменную сущность, которая хранит правила предметной области."}
          </p>

          <h3>Будущее хранилище</h3>
          <p>
            {"MemoryStorage в следующем занятии станет первым in-memory хранилищем. Он не переживает перезапуск, но даст сервису понятный контракт."}
          </p>

          <h3>Будущее storage</h3>
          <p>
            {"Файл, база данных или внешний сервис смогут выполнять похожую роль хранения, не меняя смысл Task."}
          </p>
        </div>

        <Callout tone="info">
          {"В production хранилищем может стать файл, база или внешний сервис. В учебном проекте первым будет MemoryStorage, чтобы отделить состояние от прикладного действия."}
        </Callout>
      </Section>

      <Section number="07" title={"Минимальная самопроверка"}>
        <Lead>
          {"До pytest будет небольшой smoke-скрипт с assert. Он проверит модель и композицию, но ещё не заменит полноценный тестовый набор."}
        </Lead>

        <CodeBlock
          caption={"что должен подтвердить smoke-скрипт"}
          code={
            "Task нормализует title\n" +
            "Task отклоняет неправильный priority\n" +
            "две Task не делят tags\n" +
            "mark_done меняет is_done"
          }
        />

        <RecallCard
          question={"Какой факт smoke-скрипт пока не может доказать?"}
          hint={"Вспомните, каких частей ещё нет в проекте."}
          answer={
            <p>
              {"Он не может доказать сохранение после перезапуска, потому что JsonStorage и файловая граница ещё не существуют."}
            </p>
          }
        />
      </Section>

      <Section number="08" title={"Что мы будем делать в практике"}>
        <Lead>
          {"Практика создаст первую контрольную точку одного Persistent Planner. Она не будет заранее реализовывать service или JSON, которые должны появиться в следующих занятиях."}
        </Lead>

        <div className="lesson-practice-steps">
          <h3>Модель</h3>
          <p>
            {"Создадите app/models.py, Task, инварианты, независимые tags и mark_done."}
          </p>

          <h3>Smoke-сценарий</h3>
          <p>
            {"Соберёте один сценарий assert, который связывает правила Task без добавления storage раньше времени."}
          </p>

          <h3>Доказательство</h3>
          <p>
            {"Напишете smoke-скрипт с assert и document project-path.md, где честно зафиксируете будущие слои."}
          </p>
        </div>

        <KeyTakeaways
          points={[
            <>{"Dataclass сокращает технический код, но не выбирает инварианты."}</>,
            <>{"Task владеет правилами одной задачи."}</>,
            <>{"default_factory создаёт независимый tags для каждого объекта."}</>,
            <>{"Композиция отличает связь «содержит» от отношения «является»."}</>,
            <>{"MemoryStorage, service, JSON и CLI появятся в следующих контрольных точках."}</>,
          ]}
        />

        <PracticeCta text={"Создайте модель Task и докажите её правила одним smoke-скриптом."} />
      </Section>

      <Section number="09" title={"Самопроверка перед редактором"}>
        <div className="lesson-check-group">
          <QuizCard
            question={"Где должен жить инвариант priority от 1 до 5?"}
            options={["В Task", "Только в CLI", "В будущем JSON-файле"]}
            correctIndex={0}
            explanation={"Правило относится к одной задаче, поэтому его защищает модель."}
          />
          <QuizCard
            question={"Что показывает first.tags is not second.tags?"}
            options={["Списки являются разными объектами", "Списки одинаковы по содержимому", "Теги нельзя менять"]}
            correctIndex={0}
            explanation={"is сравнивает идентичность объектов, а не содержимое."}
          />
          <QuizCard
            question={"Какой вопрос помогает выбрать композицию вместо наследования?"}
            options={["Объект содержит другую роль или является ею?", "Сколько строк в классе?", "Есть ли в классе список?"]}
            correctIndex={0}
            explanation={"Наследование описывает отношение «является», композиция описывает связь «содержит» или «использует»."}
          />
        </div>
      </Section>
    </RichLesson>
  );
}
// 40. SOLID на примере StudyHub
