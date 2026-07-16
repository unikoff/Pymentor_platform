import {
  Boxes,
  Braces,
  CheckCircle2,
  FileText,
  FolderGit2,
  KeyRound,
  Layers,
  ListChecks,
  Puzzle,
  ShieldCheck,
  Trophy,
} from "lucide-react";
import {
  BugHunt,
  Callout,
  CodeBlock,
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
} from "../shared";

type TheoryBridgeData = { link: string; boundary: string };

const THEORY_BRIDGES: Record<number, TheoryBridgeData> = {
  39: {"link":"Task уже имеет поля и методы, поэтому @dataclass убирает шаблонный код, default_factory защищает изменяемые значения, а композиция соединяет разные роли.","boundary":"dataclass не создаёт бизнес-правила сам, а наследование выбирают только при настоящем отношении «является»."},
  40: {"link":"После модели, сервиса и хранения SOLID становится набором вопросов к реальным зависимостям и смешанным обязанностям.","boundary":"Это не требование создать пять новых абстракций: сначала находят боль, затем делают минимальное изменение."},
  41: {"link":"Контракты уже названы, поэтому тест превращает ожидаемое поведение в повторяемую проверку входа, действия и результата.","boundary":"Тесты не доказывают отсутствие всех ошибок, но защищают важные договорённости при следующем изменении."},
  42: {"link":"Перед реализацией финального проекта фиксируются пользовательские сценарии, роли файлов и направление зависимостей.","boundary":"Схема папок сама не архитектура: у каждой границы должен быть понятный вход, результат и причина существования."},
  43: {"link":"Финальная структура готова: модель хранит правила Task, сервис выполняет сценарии, storage сохраняет данные, интерфейс связывает человека с сервисом.","boundary":"Хранилище не принимает решения о приоритете или статусе, а сервис не зависит от деталей JSON больше, чем требует контракт."},
  44: {"link":"Готовый проект объединяет модель, сервис, хранилище и тесты; README, Git и Release делают конкретную версию воспроизводимой.","boundary":"Релиз не заменяет понимание кода: важно уметь объяснить путь одной задачи и причину архитектурного решения."},
};

function TheoryBridge({ lesson }: { lesson: number }) {
  const bridge = THEORY_BRIDGES[lesson];
  if (!bridge) return null;

  return (
    <Callout tone="info">
      <strong>Связь с курсом.</strong> {bridge.link}{" "}
      <strong>Важно не перепутать:</strong> {bridge.boundary}
    </Callout>
  );
}


// 39. dataclass, композиция и границы наследования
export function Lesson39({ module }: { module?: string }) {
  return (
    <RichLesson>
      <RichHero
        variant="project"
        chip={module ?? "Месяц 2 · Блок 8"}
        title={"dataclass, композиция и границы наследования"}
        intro={"Упростим модель Task через @dataclass, разберём безопасные значения по умолчанию и научимся выбирать композицию вместо наследования там, где объекты просто работают вместе."}
        tags={[
          { icon: <Boxes size={14} />, label: "@dataclass и field" },
          { icon: <Puzzle size={14} />, label: "композиция без магии" },
        ]}
      />
      <TheoryBridge lesson={39} />

      <Section number="01" title={"Почему обычная модель начинает шуметь"}>
        <Lead>
          {"В обычном классе разработчик вручную пишет конструктор, строковое представление и сравнение. После освоения механизма повторяющийся служебный код начинает скрывать реальные поля и правила модели."}
        </Lead>

        <div className="lesson-practice-steps">
          <h3>Ручной класс</h3>
          <p>
            {"Поля приходится искать среди присваиваний self, а новое поле добавлять в несколько методов."}
          </p>

          <h3>Класс данных</h3>
          <p>
            {"@dataclass строит стандартные методы по объявлениям полей."}
          </p>

          <h3>Что остаётся вручную</h3>
          <p>
            {"Валидация, предметные методы и ответственность модели не исчезают."}
          </p>

        </div>

        <CodeBlock
          caption={"обычная модель Task"}
          code={
            "class Task:\n" +
            "    def __init__(\n" +
            "        self,\n" +
            "        task_id,\n" +
            "        title,\n" +
            "        priority,\n" +
            "        is_done=False,\n" +
            "    ):\n" +
            "        self.id = task_id\n" +
            "        self.title = title\n" +
            "        self.priority = priority\n" +
            "        self.is_done = is_done\n" +
            "\n" +
            "    def __repr__(self):\n" +
            "        return (\n" +
            "            f\"Task(id={self.id!r}, \"\n" +
            "            f\"title={self.title!r}, \"\n" +
            "            f\"priority={self.priority!r}, \"\n" +
            "            f\"is_done={self.is_done!r})\"\n" +
            "        )"
          }
        />

        <RecallCard
          question={"Что именно упрощает dataclass?"}
          hint={"Не предметные правила, а повторяющийся служебный код."}
          answer={<p>{"Он создаёт типовой конструктор, repr и сравнение по объявленным полям."}</p>}
        />

        <Callout tone="info">
          {"Dataclass не заменяет ООП. Он убирает шаблонные части у класса, основная роль которого — хранить понятный набор данных."}
        </Callout>
      </Section>

      <Section number="02" title={"Что создаёт декоратор @dataclass"}>
        <Lead>
          {"Декоратор получает класс и добавляет стандартные методы на основе полей. Так теория декораторов связывается с реальной моделью Persistent Planner."}
        </Lead>

        <div className="lesson-practice-steps">
          <h3>Сгенерированный __init__</h3>
          <p>
            {"Параметры появляются в порядке объявления полей."}
          </p>

          <h3>Сгенерированный __repr__</h3>
          <p>
            {"Объект удобно читать в терминале, тестах и traceback."}
          </p>

          <h3>Сгенерированный __eq__</h3>
          <p>
            {"Два объекта сравниваются по значениям полей."}
          </p>

        </div>

        <CodeBlock
          caption={"проверяем созданные методы"}
          code={
            "from dataclasses import dataclass\n" +
            "\n" +
            "@dataclass\n" +
            "class Task:\n" +
            "    id: int\n" +
            "    title: str\n" +
            "    priority: int\n" +
            "    is_done: bool = False\n" +
            "\n" +
            "first = Task(1, \"Python\", 4)\n" +
            "second = Task(1, \"Python\", 4)\n" +
            "\n" +
            "print(first)\n" +
            "print(first == second)"
          }
        />

        <TrueFalse
          statement={<>{"Аннотация title: str сама создаёт runtime-проверку типа."}</>}
          isTrue={false}
          explanation={"Обычные type hints не выполняют автоматическую проверку во время запуска."}
        />

        <Callout tone="info">
          {"Аннотация priority: int документирует ожидание, но обычный Python не запрещает передать строку во время выполнения."}
        </Callout>
      </Section>

      <Section number="03" title={"Обязательные поля и значения по умолчанию"}>
        <Lead>
          {"Поля без значения по умолчанию обязательны. После первого поля с default нельзя объявлять обязательное поле, иначе сгенерированный конструктор получил бы недопустимый порядок параметров."}
        </Lead>

        <div className="lesson-practice-steps">
          <h3>Обязательные данные</h3>
          <p>
            {"id, title и priority нужны для создания задачи."}
          </p>

          <h3>Согласованный default</h3>
          <p>
            {"Новая задача создаётся с is_done=False."}
          </p>

          <h3>Порядок</h3>
          <p>
            {"Сначала обязательные поля, затем поля со значениями по умолчанию."}
          </p>

        </div>

        <CodeBlock
          caption={"корректный порядок полей"}
          code={
            "from dataclasses import dataclass\n" +
            "\n" +
            "@dataclass\n" +
            "class Task:\n" +
            "    id: int\n" +
            "    title: str\n" +
            "    priority: int\n" +
            "    is_done: bool = False\n" +
            "    description: str = \"\"\n" +
            "\n" +
            "first = Task(\n" +
            "    id=1,\n" +
            "    title=\"Python\",\n" +
            "    priority=4,\n" +
            ")\n" +
            "\n" +
            "print(first.is_done)"
          }
        />

        <PredictOutput
          code={
            "print(first.is_done)"
          }
          output={"False"}
          hint={"Значение взято из default поля is_done."}
        />

        <Callout tone="info">
          {"Порядок полей становится частью публичного конструктора и проектируется так же внимательно, как параметры функции."}
        </Callout>
      </Section>

      <Section number="04" title={"Изменяемые поля и default_factory"}>
        <Lead>
          {"Список тегов должен быть отдельным для каждой задачи. field(default_factory=list) вызывает list при создании каждого объекта и не создаёт общее изменяемое состояние."}
        </Lead>

        <div className="lesson-practice-steps">
          <h3>Проблема общего списка</h3>
          <p>
            {"Изменение тегов одной задачи не должно менять другую."}
          </p>

          <h3>Фабрика значения</h3>
          <p>
            {"default_factory=list передаёт функцию без скобок."}
          </p>

          <h3>Другие варианты</h3>
          <p>
            {"Так же создаются новые dict, set или собственные объекты."}
          </p>

        </div>

        <CodeBlock
          caption={"независимые списки тегов"}
          code={
            "from dataclasses import dataclass, field\n" +
            "\n" +
            "@dataclass\n" +
            "class Task:\n" +
            "    id: int\n" +
            "    title: str\n" +
            "    priority: int\n" +
            "    tags: list[str] = field(\n" +
            "        default_factory=list,\n" +
            "    )\n" +
            "\n" +
            "first = Task(1, \"Python\", 4)\n" +
            "second = Task(2, \"SQL\", 3)\n" +
            "\n" +
            "first.tags.append(\"backend\")\n" +
            "\n" +
            "print(first.tags)\n" +
            "print(second.tags)"
          }
        />

        <BugHunt
          code={
            "tags: list[str] = []"
          }
          question={"Почему такой default опасен?"}
          options={[
            "Один список может стать общим состоянием",
            "Списки запрещены в классах",
            "Поле станет строкой",
          ]}
          correctIndex={0}
          explanation={"Для изменяемого значения нужна фабрика."}
          fix={"tags: list[str] = field(default_factory=list)"}
        />

        <Callout tone="info">
          {"В default_factory передаётся фабрика без вызова: list, а не list()."}
        </Callout>
      </Section>

      <Section number="05" title={"__post_init__ и инварианты модели"}>
        <Lead>
          {"После присваивания полей dataclass автоматически вызывает __post_init__. Здесь удобно очистить title и проверить диапазон priority."}
        </Lead>

        <div className="lesson-practice-steps">
          <h3>Нормализация</h3>
          <p>
            {"Пробелы по краям title удаляются один раз при создании."}
          </p>

          <h3>Инвариант</h3>
          <p>
            {"Успешно созданная задача всегда имеет непустой title и priority от 1 до 5."}
          </p>

          <h3>Граница</h3>
          <p>
            {"Файловые операции и input внутри модели не нужны."}
          </p>

        </div>

        <CodeBlock
          caption={"модель с правилами"}
          code={
            "from dataclasses import dataclass\n" +
            "\n" +
            "@dataclass\n" +
            "class Task:\n" +
            "    id: int\n" +
            "    title: str\n" +
            "    priority: int\n" +
            "\n" +
            "    def __post_init__(self):\n" +
            "        self.title = self.title.strip()\n" +
            "\n" +
            "        if not self.title:\n" +
            "            raise ValueError(\n" +
            "                \"title не должен быть пустым\"\n" +
            "            )\n" +
            "\n" +
            "        if not 1 <= self.priority <= 5:\n" +
            "            raise ValueError(\n" +
            "                \"priority должен быть от 1 до 5\"\n" +
            "            )"
          }
        />

        <RecallCard
          question={"Когда dataclass вызывает __post_init__?"}
          hint={"Сначала поля, затем дополнительная проверка."}
          answer={<p>{"После того как сгенерированный __init__ присвоил значения полям."}</p>}
        />

        <Callout tone="info">
          {"__post_init__ защищает правила создания объекта. Сценарий добавления задачи остаётся в сервисе."}
        </Callout>
      </Section>

      <Section number="06" title={"Композиция: объект содержит другой объект"}>
        <Lead>
          {"Композиция описывает отношение «содержит» или «использует». PlannerService хранит ссылку на storage и делегирует ему загрузку и сохранение."}
        </Lead>

        <div className="lesson-practice-steps">
          <h3>Явная зависимость</h3>
          <p>
            {"Storage передаётся в конструктор PlannerService."}
          </p>

          <h3>Разные обязанности</h3>
          <p>
            {"Сервис знает правила задач, storage знает способ хранения."}
          </p>

          <h3>Замена</h3>
          <p>
            {"В тесте JsonStorage заменяется MemoryStorage."}
          </p>

        </div>

        <CodeBlock
          caption={"композиция сервиса и хранилища"}
          code={
            "class PlannerService:\n" +
            "    def __init__(self, storage):\n" +
            "        self.storage = storage\n" +
            "\n" +
            "    def list_tasks(self):\n" +
            "        return self.storage.load()\n" +
            "\n" +
            "    def add_task(self, task):\n" +
            "        tasks = self.storage.load()\n" +
            "        tasks.append(task)\n" +
            "        self.storage.save(tasks)\n" +
            "\n" +
            "        return task\n" +
            "\n" +
            "storage = JsonStorage(\"data/tasks.json\")\n" +
            "service = PlannerService(storage)"
          }
        />

        <TrueFalse
          statement={<>{"PlannerService является разновидностью JsonStorage."}</>}
          isTrue={false}
          explanation={"Сервис использует хранилище, но не является хранилищем."}
        />

        <Callout tone="info">
          {"Композиция не требует отдельного фреймворка. Обычного параметра конструктора достаточно."}
        </Callout>
      </Section>

      <Section number="07" title={"Где наследование уместно"}>
        <Lead>
          {"Наследование полезно, когда дочерний объект действительно является более конкретным вариантом общего типа и сохраняет его контракт."}
        </Lead>

        <div className="lesson-practice-steps">
          <h3>Хороший мотив</h3>
          <p>
            {"MemoryStorage и JsonStorage реализуют один смысл load и save."}
          </p>

          <h3>Плохой мотив</h3>
          <p>
            {"Наследоваться только ради доступа к двум готовым методам."}
          </p>

          <h3>Глубина</h3>
          <p>
            {"Для учебного проекта достаточно одного простого уровня или неформального контракта."}
          </p>

        </div>

        <CodeBlock
          caption={"умеренный общий контракт"}
          code={
            "class Storage:\n" +
            "    def load(self):\n" +
            "        raise NotImplementedError\n" +
            "\n" +
            "    def save(self, tasks):\n" +
            "        raise NotImplementedError\n" +
            "\n" +
            "\n" +
            "class MemoryStorage(Storage):\n" +
            "    def __init__(self):\n" +
            "        self.tasks = []\n" +
            "\n" +
            "    def load(self):\n" +
            "        return list(self.tasks)\n" +
            "\n" +
            "    def save(self, tasks):\n" +
            "        self.tasks = list(tasks)"
          }
        />

        <PredictOutput
          code={
            "print(isinstance(MemoryStorage(), Storage))"
          }
          output={"True"}
          hint={"MemoryStorage наследуется от Storage."}
        />

        <Callout tone="info">
          {"Даже при общем Storage сервис не наследуется от него: это два разных объекта с разными обязанностями."}
        </Callout>
      </Section>

      <Section number="08" title={"Практика: миграция Task"}>
        <Lead>
          {"Переведите существующую модель небольшими шагами. Сначала сохраните поведение, затем замените только модель и повторите проверки."}
        </Lead>

        <div className="lesson-practice-steps">
          <h3>Шаг 1</h3>
          <p>
            {"Зафиксировать рабочий сценарий создания и вывода."}
          </p>

          <h3>Шаг 2</h3>
          <p>
            {"Перенести поля в dataclass и добавить __post_init__."}
          </p>

          <h3>Шаг 3</h3>
          <p>
            {"Добавить mark_done и независимые tags."}
          </p>

        </div>

        <CodeBlock
          caption={"итоговая модель урока"}
          code={
            "from dataclasses import dataclass, field\n" +
            "\n" +
            "@dataclass\n" +
            "class Task:\n" +
            "    id: int\n" +
            "    title: str\n" +
            "    priority: int\n" +
            "    is_done: bool = False\n" +
            "    tags: list[str] = field(\n" +
            "        default_factory=list,\n" +
            "    )\n" +
            "\n" +
            "    def __post_init__(self):\n" +
            "        self.title = self.title.strip()\n" +
            "\n" +
            "        if not self.title:\n" +
            "            raise ValueError(\"empty title\")\n" +
            "\n" +
            "        if not 1 <= self.priority <= 5:\n" +
            "            raise ValueError(\"bad priority\")\n" +
            "\n" +
            "    def mark_done(self):\n" +
            "        self.is_done = True"
          }
        />

        <Callout tone="info">
          {"Не подключайте одновременно новый JSON-формат, Enum и дополнительные поля. Цель урока — ясная модель и ясные зависимости."}
        </Callout>

        <div className="lesson-check-group">
          <QuizCard
            question={"Что обычно создаёт @dataclass?"}
            options={[
              "__init__, repr и сравнение",
              "JSON-файл",
              "виртуальное окружение",
            ]}
            correctIndex={0}
            explanation={"Методы строятся по полям."}
          />
          <QuizCard
            question={"Зачем default_factory=list?"}
            options={[
              "создать отдельный список каждому объекту",
              "запретить списки",
              "сделать поле обязательным",
            ]}
            correctIndex={0}
            explanation={"Фабрика вызывается для каждого экземпляра."}
          />
          <QuizCard
            question={"Когда вызывается __post_init__?"}
            options={[
              "после __init__",
              "до класса",
              "только вручную",
            ]}
            correctIndex={0}
            explanation={"Dataclass запускает его после присваивания полей."}
          />
          <QuizCard
            question={"Что связывает PlannerService и storage?"}
            options={[
              "композиция",
              "наследование сервиса от файла",
              "глобальная переменная",
            ]}
            correctIndex={0}
            explanation={"Сервис использует отдельный объект хранения."}
          />
        </div>

        <KeyTakeaways
          points={[
            <>{"@dataclass уменьшает шаблонный код модели."}</>,
            <>{"Default_factory создаёт независимые изменяемые значения."}</>,
            <>{"__post_init__ защищает инварианты Task."}</>,
            <>{"Композиция выражает отношение «содержит» или «использует»."}</>,
            <>{"Наследование требует честного отношения «является»."}</>,
            <>{"Storage передаётся сервису как явная зависимость."}</>,
          ]}
        />

        <PracticeCta text={"Переведите Task на dataclass, добавьте tags через default_factory и подключите storage к PlannerService через композицию."} />
      </Section>

    </RichLesson>
  );
}

// 40. SOLID на примере StudyHub
export function Lesson40({ module }: { module?: string }) {
  return (
    <RichLesson>
      <RichHero
        variant="project"
        chip={module ?? "Месяц 2 · Блок 8"}
        title={"SOLID на примере StudyHub"}
        intro={"Разберём пять принципов не как набор лозунгов, а как пять вопросов к небольшому Persistent Planner: где смешаны обязанности, что трудно заменить и какие зависимости скрыты."}
        tags={[
          { icon: <ShieldCheck size={14} />, label: "SOLID без культа" },
          { icon: <Layers size={14} />, label: "StudyHub как пример" },
        ]}
      />
      <TheoryBridge lesson={40} />

      <Section number="01" title={"SOLID как диагностические вопросы"}>
        <Lead>
          {"SOLID не гарантирует хороший проект и не требует пяти интерфейсов для каждой функции. Это набор вопросов о причинах изменения, заменяемости и видимости зависимостей."}
        </Lead>

        <div className="lesson-practice-steps">
          <h3>Не ритуал</h3>
          <p>
            {"Принцип применяется к наблюдаемой проблеме."}
          </p>

          <h3>Не запрет простоты</h3>
          <p>
            {"Короткая функция может быть лучше иерархии классов."}
          </p>

          <h3>Цель</h3>
          <p>
            {"Изменение должно затрагивать ожидаемую небольшую область."}
          </p>

        </div>

        <CodeBlock
          caption={"монолитный сценарий"}
          code={
            "def run():\n" +
            "    path = \"data/tasks.json\"\n" +
            "    tasks = load_json(path)\n" +
            "    command = input(\"Команда: \")\n" +
            "\n" +
            "    # валидация\n" +
            "    # CRUD\n" +
            "    # форматирование\n" +
            "    # запись файла\n" +
            "    # обработка всех ошибок"
          }
        />

        <RecallCard
          question={"Зачем изучать SOLID на маленьком проекте?"}
          hint={"Смотрите на стоимость изменения."}
          answer={<p>{"Чтобы раньше замечать смешанные обязанности и жёсткие зависимости."}</p>}
        />

        <Callout tone="info">
          {"Если принцип не помогает объяснить конкретную проблему, его не нужно притягивать к коду искусственно."}
        </Callout>
      </Section>

      <Section number="02" title={"S — одна связная ответственность"}>
        <Lead>
          {"Модуль или класс должен иметь одну связанную область и одну основную причину изменения."}
        </Lead>

        <div className="lesson-practice-steps">
          <h3>main.py</h3>
          <p>
            {"Меню, ввод и пользовательские сообщения."}
          </p>

          <h3>storage.py</h3>
          <p>
            {"Чтение и сохранение данных."}
          </p>

          <h3>models.py</h3>
          <p>
            {"Структура Task и её инварианты."}
          </p>

        </div>

        <CodeBlock
          caption={"разделение причин изменения"}
          code={
            "app/\n" +
            "├── main.py        # интерфейс\n" +
            "├── models.py      # Task\n" +
            "├── services.py    # операции\n" +
            "├── storage.py     # JSON\n" +
            "└── exceptions.py  # ошибки"
          }
        />

        <TrueFalse
          statement={<>{"SRP требует, чтобы в каждом классе был ровно один метод."}</>}
          isTrue={false}
          explanation={"Принцип говорит об одной связной причине изменения."}
        />

        <Callout tone="info">
          {"SRP не означает «один метод на класс». Несколько методов могут обслуживать одну связанную ответственность."}
        </Callout>
      </Section>

      <Section number="03" title={"O — расширение без переписывания сервиса"}>
        <Lead>
          {"Новое хранилище должно подключаться без изменения правил добавления и поиска задач."}
        </Lead>

        <div className="lesson-practice-steps">
          <h3>Стабильная часть</h3>
          <p>
            {"PlannerService использует load и save."}
          </p>

          <h3>Расширение</h3>
          <p>
            {"Можно передать MemoryStorage или JsonStorage."}
          </p>

          <h3>Граница</h3>
          <p>
            {"Не нужно заранее проектировать десять реализаций."}
          </p>

        </div>

        <CodeBlock
          caption={"замена компонента"}
          code={
            "class PlannerService:\n" +
            "    def __init__(self, storage):\n" +
            "        self.storage = storage\n" +
            "\n" +
            "    def list_tasks(self):\n" +
            "        return self.storage.load()\n" +
            "\n" +
            "production = PlannerService(\n" +
            "    JsonStorage(\"data/tasks.json\")\n" +
            ")\n" +
            "\n" +
            "tests = PlannerService(\n" +
            "    MemoryStorage()\n" +
            ")"
          }
        />

        <PredictOutput
          code={
            "print(type(tests.storage).__name__)"
          }
          output={"MemoryStorage"}
          hint={"В тестовый сервис передан объект памяти."}
        />

        <Callout tone="info">
          {"OCP не запрещает менять код. Он отделяет стабильное правило от вариативной технической детали."}
        </Callout>
      </Section>

      <Section number="04" title={"L — заменяемые объекты сохраняют контракт"}>
        <Lead>
          {"Если два storage заявлены как варианты одного хранилища, сервис использует любой из них без проверки конкретного класса."}
        </Lead>

        <div className="lesson-practice-steps">
          <h3>Одинаковый результат</h3>
          <p>
            {"load возвращает list[Task]."}
          </p>

          <h3>Одинаковый вход</h3>
          <p>
            {"save принимает list[Task]."}
          </p>

          <h3>Одинаковый смысл</h3>
          <p>
            {"Первый запуск без данных даёт пустой список."}
          </p>

        </div>

        <CodeBlock
          caption={"совместимые реализации"}
          code={
            "class MemoryStorage:\n" +
            "    def load(self):\n" +
            "        return list(self.tasks)\n" +
            "\n" +
            "    def save(self, tasks):\n" +
            "        self.tasks = list(tasks)\n" +
            "\n" +
            "\n" +
            "class JsonStorage:\n" +
            "    def load(self):\n" +
            "        data = self._read_data()\n" +
            "        return [\n" +
            "            Task.from_dict(item)\n" +
            "            for item in data\n" +
            "        ]\n" +
            "\n" +
            "    def save(self, tasks):\n" +
            "        self._write_data([\n" +
            "            task.to_dict()\n" +
            "            for task in tasks\n" +
            "        ])"
          }
        />

        <BugHunt
          code={
            "if isinstance(storage, JsonStorage):\n" +
            "    tasks = storage.load()\n" +
            "else:\n" +
            "    tasks = storage.items"
          }
          question={"Что показывает такая проверка?"}
          options={[
            "Контракты реализаций несовместимы",
            "JSON запрещён",
            "Нужен глобальный список",
          ]}
          correctIndex={0}
          explanation={"Сервис вынужден знать конкретный тип."}
          fix={"tasks = storage.load()"}
        />

        <Callout tone="info">
          {"Если сервис постоянно проверяет isinstance(storage, JsonStorage), общий контракт фактически не работает."}
        </Callout>
      </Section>

      <Section number="05" title={"I — клиент зависит только от нужных операций"}>
        <Lead>
          {"Функция подсчёта открытых задач нуждается только в чтении. Ей не нужен объект, который также управляет меню, релизом и экспортом."}
        </Lead>

        <div className="lesson-practice-steps">
          <h3>Узкий контракт</h3>
          <p>
            {"Для count_open нужна операция load."}
          </p>

          <h3>Лишняя зависимость</h3>
          <p>
            {"Большой Application раскрывает ненужные методы."}
          </p>

          <h3>Практический уровень</h3>
          <p>
            {"Пока достаточно договорённости по методам."}
          </p>

        </div>

        <CodeBlock
          caption={"узкая зависимость функции"}
          code={
            "def count_open(storage):\n" +
            "    tasks = storage.load()\n" +
            "\n" +
            "    return sum(\n" +
            "        not task.is_done\n" +
            "        for task in tasks\n" +
            "    )\n" +
            "\n" +
            "storage = MemoryStorage()\n" +
            "print(count_open(storage))"
          }
        />

        <RecallCard
          question={"Почему count_open лучше получить storage, а не всё приложение?"}
          hint={"Смотрите на минимальный необходимый контракт."}
          answer={<p>{"Потому что функции нужна только операция чтения, а остальные зависимости лишние."}</p>}
        />

        <Callout tone="info">
          {"Не нужно дробить каждый метод в отдельный интерфейс без реальной причины."}
        </Callout>
      </Section>

      <Section number="06" title={"D — зависимость передаётся извне"}>
        <Lead>
          {"PlannerService не создаёт конкретный JsonStorage самостоятельно. Main выбирает реализацию и передаёт готовый объект."}
        </Lead>

        <div className="lesson-practice-steps">
          <h3>Жёсткое создание</h3>
          <p>
            {"JsonStorage внутри сервиса трудно заменить."}
          </p>

          <h3>Передача</h3>
          <p>
            {"Конструктор получает готовый storage."}
          </p>

          <h3>Точка сборки</h3>
          <p>
            {"Main соединяет конкретные компоненты."}
          </p>

        </div>

        <CodeBlock
          caption={"передача зависимости"}
          code={
            "class PlannerService:\n" +
            "    def __init__(self, storage):\n" +
            "        self.storage = storage\n" +
            "\n" +
            "\n" +
            "def build_service():\n" +
            "    storage = JsonStorage(\n" +
            "        \"data/tasks.json\"\n" +
            "    )\n" +
            "\n" +
            "    return PlannerService(storage)"
          }
        />

        <TrueFalse
          statement={<>{"Для DIP обязательно установить отдельный dependency injection framework."}</>}
          isTrue={false}
          explanation={"Обычной передачи объекта через конструктор достаточно."}
        />

        <Callout tone="info">
          {"На текущем уровне DIP реализуется обычным параметром конструктора. Контейнер зависимостей не нужен."}
        </Callout>
      </Section>

      <Section number="07" title={"Пять принципов в одной схеме"}>
        <Lead>
          {"Модель отвечает за данные, сервис за операции, хранилища выполняют общий контракт, а main соединяет объекты."}
        </Lead>

        <div className="lesson-practice-steps">
          <h3>S</h3>
          <p>
            {"Каждый модуль имеет связанную причину изменения."}
          </p>

          <h3>O и L</h3>
          <p>
            {"Новое storage подключается и соблюдает тот же контракт."}
          </p>

          <h3>I и D</h3>
          <p>
            {"Сервис использует нужные операции и получает зависимость извне."}
          </p>

        </div>

        <CodeBlock
          caption={"production-сборка"}
          code={
            "def build_application():\n" +
            "    storage = JsonStorage(\n" +
            "        \"data/tasks.json\"\n" +
            "    )\n" +
            "\n" +
            "    service = PlannerService(\n" +
            "        storage\n" +
            "    )\n" +
            "\n" +
            "    return ConsoleApplication(\n" +
            "        service\n" +
            "    )\n" +
            "\n" +
            "application = build_application()\n" +
            "application.run()"
          }
        />

        <PredictOutput
          code={
            "print(type(build_application()).__name__)"
          }
          output={"ConsoleApplication"}
          hint={"Функция возвращает собранное приложение."}
        />

        <Callout tone="info">
          {"Хорошая структура позволяет собрать рабочую и тестовую версии из тех же предметных компонентов."}
        </Callout>
      </Section>

      <Section number="08" title={"Рефакторинг без архитектурного культа"}>
        <Lead>
          {"Выберите одну реальную боль и исправьте её минимальным изменением. Не добавляйте фабрики и универсальные репозитории только потому, что выучили пять букв."}
        </Lead>

        <div className="lesson-practice-steps">
          <h3>Диагностика</h3>
          <p>
            {"Назовите изменение, которое затрагивает слишком много мест."}
          </p>

          <h3>Минимальная граница</h3>
          <p>
            {"Отделите только вариативную часть."}
          </p>

          <h3>Остановка</h3>
          <p>
            {"Если усложнение не решает новую проблему, рефакторинг закончен."}
          </p>

        </div>

        <CodeBlock
          caption={"достаточная структура"}
          code={
            "app/\n" +
            "├── main.py\n" +
            "├── models.py\n" +
            "├── services.py\n" +
            "├── storage.py\n" +
            "└── exceptions.py\n" +
            "\n" +
            "# Для Persistent Planner этого достаточно."
          }
        />

        <Callout tone="info">
          {"Понятные модули, рабочее JSON-хранилище и тесты важнее имитации enterprise-архитектуры."}
        </Callout>

        <div className="lesson-check-group">
          <QuizCard
            question={"Что означает SRP?"}
            options={[
              "одна связная ответственность",
              "один метод",
              "один файл",
            ]}
            correctIndex={0}
            explanation={"Речь о причине изменения."}
          />
          <QuizCard
            question={"Как OCP проявляется в StudyHub?"}
            options={[
              "другой storage без переписывания сервиса",
              "запрет менять код",
              "обязательное наследование",
            ]}
            correctIndex={0}
            explanation={"Вариативный компонент подключается снаружи."}
          />
          <QuizCard
            question={"Когда нарушается LSP?"}
            options={[
              "storage имеют несовместимый контракт",
              "классы имеют разные имена",
              "используется dataclass",
            ]}
            correctIndex={0}
            explanation={"Замена меняет ожидаемое поведение."}
          />
          <QuizCard
            question={"Как реализовать DIP сейчас?"}
            options={[
              "передать storage в конструктор",
              "глобальная переменная",
              "контейнер из 20 классов",
            ]}
            correctIndex={0}
            explanation={"Обычной передачи зависимости достаточно."}
          />
        </div>

        <KeyTakeaways
          points={[
            <>{"SOLID применяется к наблюдаемым проблемам."}</>,
            <>{"SRP разделяет причины изменения."}</>,
            <>{"OCP отделяет стабильное правило от вариативного компонента."}</>,
            <>{"LSP требует совместимого поведения заменяемых объектов."}</>,
            <>{"ISP уменьшает ненужные зависимости клиента."}</>,
            <>{"DIP передаёт storage извне."}</>,
          ]}
        />

        <PracticeCta text={"Найдите по одному реальному нарушению S, O/L и D в текущем StudyHub и исправьте их отдельными коммитами."} />
      </Section>

    </RichLesson>
  );
}

// 41. Первые тесты через pytest
export function Lesson41({ module }: { module?: string }) {
  return (
    <RichLesson>
      <RichHero
        variant="project"
        chip={module ?? "Месяц 2 · Блок 8"}
        title={"Первые тесты через pytest"}
        intro={"Превратим ожидания в исполняемые проверки: установим pytest, напишем первые assert, проверим исключения, параметризуем границы и протестируем JSON через временную папку."}
        tags={[
          { icon: <CheckCircle2 size={14} />, label: "pytest и assert" },
          { icon: <ListChecks size={14} />, label: "5–8 полезных тестов" },
        ]}
      />
      <TheoryBridge lesson={41} />

      <Section number="01" title={"Тест как исполняемое ожидание"}>
        <Lead>
          {"Ручную проверку через print приходится повторять после каждого изменения. Автоматический тест сам подготавливает вход, выполняет действие и сравнивает результат."}
        </Lead>

        <div className="lesson-practice-steps">
          <h3>Не абсолютное доказательство</h3>
          <p>
            {"Тест подтверждает только записанный сценарий."}
          </p>

          <h3>Защита поведения</h3>
          <p>
            {"После рефакторинга тест быстро показывает изменение контракта."}
          </p>

          <h3>Документация</h3>
          <p>
            {"По тесту видно, как вызывается функция."}
          </p>

        </div>

        <CodeBlock
          caption={"первая автоматическая проверка"}
          code={
            "def test_normalize_title_removes_spaces():\n" +
            "    result = normalize_title(\n" +
            "        \"  SQL  \"\n" +
            "    )\n" +
            "\n" +
            "    assert result == \"SQL\""
          }
        />

        <RecallCard
          question={"Что доказывает один тест?"}
          hint={"Не весь проект, а один сценарий."}
          answer={<p>{"Что конкретный записанный сценарий даёт ожидаемый результат."}</p>}
        />

        <Callout tone="info">
          {"Хороший тест проверяет одно наблюдаемое поведение и падает с понятной причиной."}
        </Callout>
      </Section>

      <Section number="02" title={"Установка, структура и запуск"}>
        <Lead>
          {"Pytest устанавливается в виртуальное окружение. Файлы и функции называются по соглашению, чтобы раннер нашёл их автоматически."}
        </Lead>

        <div className="lesson-practice-steps">
          <h3>Установка</h3>
          <p>
            {"python -m pip install pytest использует pip выбранного Python."}
          </p>

          <h3>Файлы</h3>
          <p>
            {"Названия начинаются с test_."}
          </p>

          <h3>Запуск</h3>
          <p>
            {"python -m pytest выполняется из корня проекта."}
          </p>

        </div>

        <CodeBlock
          caption={"структура и команды"}
          code={
            "studyhub/\n" +
            "├── app/\n" +
            "│   ├── models.py\n" +
            "│   ├── services.py\n" +
            "│   └── storage.py\n" +
            "├── tests/\n" +
            "│   ├── test_models.py\n" +
            "│   ├── test_services.py\n" +
            "│   └── test_storage.py\n" +
            "└── README.md\n" +
            "\n" +
            "# terminal:\n" +
            "python -m pip install pytest\n" +
            "python -m pytest -q"
          }
        />

        <TrueFalse
          statement={<>{"Функция test_add_task будет найдена pytest по соглашению имени."}</>}
          isTrue={true}
          explanation={"Имя начинается с test_."}
        />

        <Callout tone="info">
          {"Запускайте pytest тем же Python, которым запускается проект."}
        </Callout>
      </Section>

      <Section number="03" title={"Arrange, Act, Assert"}>
        <Lead>
          {"Структура AAA отделяет подготовку данных, одно проверяемое действие и сравнение результата."}
        </Lead>

        <div className="lesson-practice-steps">
          <h3>Arrange</h3>
          <p>
            {"Создать storage, service и входные данные."}
          </p>

          <h3>Act</h3>
          <p>
            {"Вызвать один метод или функцию."}
          </p>

          <h3>Assert</h3>
          <p>
            {"Проверить публичный результат или состояние."}
          </p>

        </div>

        <CodeBlock
          caption={"тест добавления"}
          code={
            "def test_add_task_returns_created_task():\n" +
            "    storage = MemoryStorage()\n" +
            "    service = PlannerService(storage)\n" +
            "\n" +
            "    task = service.add_task(\n" +
            "        title=\"Python\",\n" +
            "        priority=4,\n" +
            "    )\n" +
            "\n" +
            "    assert task.id == 1\n" +
            "    assert task.title == \"Python\"\n" +
            "    assert storage.load() == [task]"
          }
        />

        <PredictOutput
          code={
            "print(1 + 1 == 2)"
          }
          output={"True"}
          hint={"Assert использует обычное логическое выражение."}
        />

        <Callout tone="info">
          {"Несколько assert допустимы, если описывают один результат одного сценария."}
        </Callout>
      </Section>

      <Section number="04" title={"Понятные имена тестов"}>
        <Lead>
          {"Имя теста должно сообщать действие и ожидаемый результат. При падении оно становится частью диагностического сообщения."}
        </Lead>

        <div className="lesson-practice-steps">
          <h3>Формула имени</h3>
          <p>
            {"test_<действие>_<ожидание>."}
          </p>

          <h3>Публичное поведение</h3>
          <p>
            {"Проверяется результат, состояние storage или исключение."}
          </p>

          <h3>Не детали</h3>
          <p>
            {"Тест не зависит от имени локальной переменной."}
          </p>

        </div>

        <CodeBlock
          caption={"конкретные имена"}
          code={
            "def test_task_strips_title():\n" +
            "    task = Task(\n" +
            "        id=1,\n" +
            "        title=\"  SQL  \",\n" +
            "        priority=3,\n" +
            "    )\n" +
            "\n" +
            "    assert task.title == \"SQL\"\n" +
            "\n" +
            "\n" +
            "def test_new_task_is_not_done():\n" +
            "    task = Task(1, \"SQL\", 3)\n" +
            "\n" +
            "    assert task.is_done is False"
          }
        />

        <BugHunt
          code={
            "def test_task():\n" +
            "    ..."
          }
          question={"Что не хватает имени теста?"}
          options={[
            "Сценария и ожидаемого результата",
            "Символа @",
            "JSON-файла",
          ]}
          correctIndex={0}
          explanation={"Общее имя не помогает диагностике."}
          fix={"def test_task_strips_title():\n    ..."}
        />

        <Callout tone="info">
          {"Когда тест падает, его имя должно сразу объяснять нарушенное обещание проекта."}
        </Callout>
      </Section>

      <Section number="05" title={"Ожидаемые исключения через pytest.raises"}>
        <Lead>
          {"Если функция обязана отклонить неверные данные, успешным результатом является исключение нужного типа."}
        </Lead>

        <div className="lesson-practice-steps">
          <h3>Точный тип</h3>
          <p>
            {"Проверяется ValueError или TaskNotFoundError."}
          </p>

          <h3>Момент</h3>
          <p>
            {"Рискованное действие выполняется внутри with."}
          </p>

          <h3>Текст</h3>
          <p>
            {"При необходимости используется match."}
          </p>

        </div>

        <CodeBlock
          caption={"проверка исключений"}
          code={
            "import pytest\n" +
            "\n" +
            "\n" +
            "def test_task_rejects_empty_title():\n" +
            "    with pytest.raises(\n" +
            "        ValueError,\n" +
            "        match=\"title\",\n" +
            "    ):\n" +
            "        Task(\n" +
            "            id=1,\n" +
            "            title=\"   \",\n" +
            "            priority=3,\n" +
            "        )\n" +
            "\n" +
            "\n" +
            "def test_unknown_id_raises():\n" +
            "    service = PlannerService(\n" +
            "        MemoryStorage()\n" +
            "    )\n" +
            "\n" +
            "    with pytest.raises(TaskNotFoundError):\n" +
            "        service.get_task(999)"
          }
        />

        <TrueFalse
          statement={<>{"Голый try/except pass надёжно проверяет, что исключение обязательно возникло."}</>}
          isTrue={false}
          explanation={"Без дополнительного assert тест может ложно пройти."}
        />

        <Callout tone="info">
          {"pytest.raises падает, если ожидаемое исключение не возникло."}
        </Callout>
      </Section>

      <Section number="06" title={"Параметризация границ"}>
        <Lead>
          {"Parametrize запускает один тест с разными наборами аргументов и показывает отдельное падение для каждого значения."}
        </Lead>

        <div className="lesson-practice-steps">
          <h3>Допустимые границы</h3>
          <p>
            {"Проверяются 1, значение внутри и 5."}
          </p>

          <h3>Недопустимые значения</h3>
          <p>
            {"Проверяются 0, 6 и другие значения."}
          </p>

          <h3>Один смысл</h3>
          <p>
            {"Меняются данные, но не сценарий."}
          </p>

        </div>

        <CodeBlock
          caption={"валидные приоритеты"}
          code={
            "import pytest\n" +
            "\n" +
            "\n" +
            "@pytest.mark.parametrize(\n" +
            "    \"priority\",\n" +
            "    [1, 3, 5],\n" +
            ")\n" +
            "def test_task_accepts_valid_priority(\n" +
            "    priority,\n" +
            "):\n" +
            "    task = Task(\n" +
            "        id=1,\n" +
            "        title=\"SQL\",\n" +
            "        priority=priority,\n" +
            "    )\n" +
            "\n" +
            "    assert task.priority == priority"
          }
        />

        <PredictOutput
          code={
            "Параметры: [1, 3, 5]"
          }
          output={"три отдельных запуска теста"}
          hint={"Каждое значение создаёт тестовый случай."}
        />

        <Callout tone="info">
          {"Параметризация полезна, когда случаи отличаются только входными данными."}
        </Callout>
      </Section>

      <Section number="07" title={"Фикстуры и tmp_path"}>
        <Lead>
          {"Фикстура подготавливает повторяемую зависимость. tmp_path даёт отдельную временную папку, поэтому тест JsonStorage не портит настоящий файл."}
        </Lead>

        <div className="lesson-practice-steps">
          <h3>Изоляция</h3>
          <p>
            {"Каждый тест получает безопасный каталог."}
          </p>

          <h3>Реальная запись</h3>
          <p>
            {"Storage всё ещё работает с настоящим временным файлом."}
          </p>

          <h3>Своя фикстура</h3>
          <p>
            {"Нужна только при повторяющейся подготовке."}
          </p>

        </div>

        <CodeBlock
          caption={"round trip JSON"}
          code={
            "def test_json_storage_round_trip(\n" +
            "    tmp_path,\n" +
            "):\n" +
            "    path = tmp_path / \"tasks.json\"\n" +
            "    storage = JsonStorage(path)\n" +
            "\n" +
            "    tasks = [\n" +
            "        Task(1, \"Python\", 4),\n" +
            "    ]\n" +
            "\n" +
            "    storage.save(tasks)\n" +
            "    loaded = storage.load()\n" +
            "\n" +
            "    assert loaded == tasks"
          }
        />

        <RecallCard
          question={"Почему tmp_path лучше data/tasks.json?"}
          hint={"Каждый тест должен быть изолирован."}
          answer={<p>{"Тест не портит пользовательские данные и не зависит от прошлых запусков."}</p>}
        />

        <Callout tone="info">
          {"Уникальную подготовку можно оставить прямо внутри теста, не превращая всё в фикстуры."}
        </Callout>
      </Section>

      <Section number="08" title={"Минимальный набор Persistent Planner"}>
        <Lead>
          {"Первый набор покрывает ключевые контракты, а не каждую строку. Начните с модели, CRUD-сервиса и хранения."}
        </Lead>

        <div className="lesson-practice-steps">
          <h3>Модель</h3>
          <p>
            {"Очистка title и границы priority."}
          </p>

          <h3>Сервис</h3>
          <p>
            {"Id, поиск, статус и удаление."}
          </p>

          <h3>Storage</h3>
          <p>
            {"Нет файла, round trip и повреждённый JSON."}
          </p>

        </div>

        <CodeBlock
          caption={"рекомендуемые тесты"}
          code={
            "test_task_strips_title\n" +
            "test_task_rejects_invalid_priority\n" +
            "test_add_task_assigns_id\n" +
            "test_get_task_raises_for_unknown_id\n" +
            "test_mark_task_done\n" +
            "test_missing_json_returns_empty_list\n" +
            "test_json_storage_round_trip\n" +
            "test_broken_json_raises_storage_error\n" +
            "\n" +
            "python -m pytest -q"
          }
        />

        <Callout tone="info">
          {"Пять–восемь качественных тестов важнее искусственной цифры покрытия без понимания сценариев."}
        </Callout>

        <div className="lesson-check-group">
          <QuizCard
            question={"Как pytest находит тест?"}
            options={[
              "по имени test_",
              "по print",
              "по dataclass",
            ]}
            correctIndex={0}
            explanation={"Используется соглашение имён."}
          />
          <QuizCard
            question={"Что делает assert?"}
            options={[
              "проверяет условие",
              "создаёт фикстуру",
              "запускает Git",
            ]}
            correctIndex={0}
            explanation={"Ложное условие делает тест падающим."}
          />
          <QuizCard
            question={"Как проверить ValueError?"}
            options={[
              "pytest.raises",
              "голый except",
              "print(error)",
            ]}
            correctIndex={0}
            explanation={"Raises проверяет обязательность исключения."}
          />
          <QuizCard
            question={"Зачем tmp_path?"}
            options={[
              "изолировать файл",
              "создать package",
              "установить pytest",
            ]}
            correctIndex={0}
            explanation={"Тест не трогает реальные данные."}
          />
        </div>

        <KeyTakeaways
          points={[
            <>{"Тест фиксирует конкретное ожидаемое поведение."}</>,
            <>{"AAA разделяет подготовку, действие и проверку."}</>,
            <>{"Понятное имя теста ускоряет диагностику."}</>,
            <>{"pytest.raises проверяет исключения."}</>,
            <>{"Parametrize повторяет сценарий на разных данных."}</>,
            <>{"tmp_path изолирует файловые тесты."}</>,
          ]}
        />

        <PracticeCta text={"Создайте tests/ и напишите минимум восемь тестовых случаев для Task, PlannerService и JsonStorage."} />
      </Section>

    </RichLesson>
  );
}

// 42. Финальный проект 1: архитектура Persistent Planner
export function Lesson42({ module }: { module?: string }) {
  return (
    <RichLesson>
      <RichHero
        variant="project"
        chip={module ?? "Месяц 2 · Блок 8"}
        title={"Финальный проект 1: архитектура Persistent Planner"}
        intro={"Спроектируем финальную версию второго месяца до написания новых функций: зафиксируем обязательное поведение, структуру пакета, контракты модулей и безопасный план переноса."}
        tags={[
          { icon: <FolderGit2 size={14} />, label: "архитектура проекта" },
          { icon: <Braces size={14} />, label: "план переноса" },
        ]}
      />
      <TheoryBridge lesson={42} />

      <Section number="01" title={"Финальный проект начинается с границ"}>
        <Lead>
          {"Перед добавлением кода нужно определить, что проект обязан делать и что сознательно остаётся за пределами второго месяца."}
        </Lead>

        <div className="lesson-practice-steps">
          <h3>Обязательный результат</h3>
          <p>
            {"Консольный Persistent Planner с JSON, Task, модулями, ожидаемыми ошибками и тестами."}
          </p>

          <h3>Не входит</h3>
          <p>
            {"FastAPI, база данных, ORM, Docker и авторизация."}
          </p>

          <h3>Критерий готовности</h3>
          <p>
            {"Проект запускается с чистого состояния, а ученик объясняет путь данных."}
          </p>

        </div>

        <CodeBlock
          caption={"обязательные сценарии"}
          code={
            "1 — добавить задачу\n" +
            "2 — показать задачи\n" +
            "3 — найти задачу\n" +
            "4 — отметить выполненной\n" +
            "5 — удалить задачу\n" +
            "6 — фильтровать задачи\n" +
            "0 — выйти\n" +
            "\n" +
            "Persistent Planner\n" +
            "├── сохраняет данные после выхода\n" +
            "├── не скрывает повреждённый JSON\n" +
            "├── разделён по ответственности\n" +
            "├── имеет минимум 5 тестов\n" +
            "└── запускается по README"
          }
        />

        <RecallCard
          question={"Какой главный результат второго месяца?"}
          hint={"Не API, а законченный консольный проект."}
          answer={<p>{"Persistent Planner с JSON, модулями, Task, ожидаемыми ошибками и тестами."}</p>}
        />

        <Callout tone="info">
          {"Возможность не входит в проект только потому, что её можно реализовать. Она должна поддерживать учебную цель месяца."}
        </Callout>
      </Section>

      <Section number="02" title={"Пользовательские сценарии до файлов"}>
        <Lead>
          {"Архитектура обслуживает поведение. Сначала сценарии записываются обычным языком, затем определяется, какие части проекта за них отвечают."}
        </Lead>

        <div className="lesson-practice-steps">
          <h3>Добавление</h3>
          <p>
            {"Пользователь вводит title и priority, получает Task, данные сохраняются."}
          </p>

          <h3>Первый запуск</h3>
          <p>
            {"Если файла нет, приложение начинает с пустого списка."}
          </p>

          <h3>Повреждение</h3>
          <p>
            {"Проект сообщает о проблеме и не перезаписывает файл пустым состоянием."}
          </p>

        </div>

        <CodeBlock
          caption={"два основных пути данных"}
          code={
            "ввод пользователя\n" +
            "→ преобразование priority\n" +
            "→ PlannerService.add_task\n" +
            "→ Task\n" +
            "→ JsonStorage.save\n" +
            "→ сообщение интерфейса\n" +
            "\n" +
            "main\n" +
            "→ JsonStorage.load\n" +
            "→ list[Task]\n" +
            "→ PlannerService\n" +
            "→ ConsoleApplication.run"
          }
        />

        <TrueFalse
          statement={<>{"Сохранение должно происходить до проверки title и priority."}</>}
          isTrue={false}
          explanation={"Неверные данные не должны менять состояние."}
        />

        <Callout tone="info">
          {"У каждого перехода должен быть понятный тип: строка, число, Task, list[Task] или предметное исключение."}
        </Callout>
      </Section>

      <Section number="03" title={"Финальная структура проекта"}>
        <Lead>
          {"Структура должна быть достаточно разделённой для ясности, но не имитировать крупную систему."}
        </Lead>

        <div className="lesson-practice-steps">
          <h3>app</h3>
          <p>
            {"Пакет рабочего кода."}
          </p>

          <h3>data</h3>
          <p>
            {"Каталог пользовательского JSON."}
          </p>

          <h3>tests</h3>
          <p>
            {"Автоматические проверки."}
          </p>

        </div>

        <CodeBlock
          caption={"дерево проекта"}
          code={
            "studyhub/\n" +
            "├── app/\n" +
            "│   ├── __init__.py\n" +
            "│   ├── main.py\n" +
            "│   ├── models.py\n" +
            "│   ├── services.py\n" +
            "│   ├── storage.py\n" +
            "│   └── exceptions.py\n" +
            "├── data/\n" +
            "│   └── tasks.json\n" +
            "├── tests/\n" +
            "│   ├── test_models.py\n" +
            "│   ├── test_services.py\n" +
            "│   └── test_storage.py\n" +
            "├── .gitignore\n" +
            "└── README.md"
          }
        />

        <PredictOutput
          code={
            "Количество модулей внутри app"
          }
          output={"6"}
          hint={"Считайте __init__, main, models, services, storage и exceptions."}
        />

        <Callout tone="info">
          {"Не создавайте отдельную папку для каждого файла. Эта структура достаточна для учебного проекта."}
        </Callout>
      </Section>

      <Section number="04" title={"Контракты до реализации"}>
        <Lead>
          {"До написания методов нужно записать, что они получают, возвращают и какие ожидаемые исключения создают."}
        </Lead>

        <div className="lesson-practice-steps">
          <h3>Task</h3>
          <p>
            {"Создаётся из валидных данных, умеет mark_done, to_dict и from_dict."}
          </p>

          <h3>Storage</h3>
          <p>
            {"load возвращает list[Task], save принимает list[Task]."}
          </p>

          <h3>PlannerService</h3>
          <p>
            {"Выполняет CRUD и сохраняет состояние."}
          </p>

        </div>

        <CodeBlock
          caption={"контракты хранения и сервиса"}
          code={
            "class Storage:\n" +
            "    def load(self) -> list[Task]:\n" +
            "        ...\n" +
            "\n" +
            "    def save(\n" +
            "        self,\n" +
            "        tasks: list[Task],\n" +
            "    ) -> None:\n" +
            "        ...\n" +
            "\n" +
            "\n" +
            "class PlannerService:\n" +
            "    def add_task(\n" +
            "        self,\n" +
            "        title: str,\n" +
            "        priority: int,\n" +
            "    ) -> Task:\n" +
            "        ...\n" +
            "\n" +
            "    def get_task(\n" +
            "        self,\n" +
            "        task_id: int,\n" +
            "    ) -> Task:\n" +
            "        ..."
          }
        />

        <BugHunt
          code={
            "def add_task(title: str, priority: int):\n" +
            "    return Task(1, title, priority)"
          }
          question={"Что ещё нужно для runtime-правил?"}
          options={[
            "Валидация внутри Task",
            "Только комментарий",
            "Смена имени функции",
          ]}
          correctIndex={0}
          explanation={"Type hints не заменяют проверки."}
          fix={"Task.__post_init__ проверяет title и priority"}
        />

        <Callout tone="info">
          {"Type hints документируют ожидания, но не выполняют runtime-валидацию обычного Python-кода."}
        </Callout>
      </Section>

      <Section number="05" title={"Однонаправленный граф импортов"}>
        <Lead>
          {"Main является точкой сборки. Services зависит от модели и исключений. Storage знает формат Task. Нижние модули не импортируют main."}
        </Lead>

        <div className="lesson-practice-steps">
          <h3>Точка сборки</h3>
          <p>
            {"Main создаёт JsonStorage и PlannerService."}
          </p>

          <h3>Предметный слой</h3>
          <p>
            {"Services получает storage и работает с Task."}
          </p>

          <h3>Запрет</h3>
          <p>
            {"Storage не импортирует service, service не импортирует main."}
          </p>

        </div>

        <CodeBlock
          caption={"граф и точка сборки"}
          code={
            "main\n" +
            "  ↓\n" +
            "services ─────→ exceptions\n" +
            "  ↓\n" +
            "models\n" +
            "  ↑\n" +
            "storage ──────→ exceptions\n" +
            "\n" +
            "\n" +
            "def build_service():\n" +
            "    storage = JsonStorage(\n" +
            "        Path(\"data/tasks.json\")\n" +
            "    )\n" +
            "\n" +
            "    return PlannerService(storage)"
          }
        />

        <RecallCard
          question={"Почему services не импортирует main?"}
          hint={"Нижний уровень не должен знать точку запуска."}
          answer={<p>{"Main уже зависит от services; обратная стрелка создаёт цикл и смешивает уровни."}</p>}
        />

        <Callout tone="info">
          {"Небольшой граф на бумаге предотвращает циклические импорты лучше случайного import внутри функции."}
        </Callout>
      </Section>

      <Section number="06" title={"План миграции небольшими коммитами"}>
        <Lead>
          {"Финальный проект не переписывается одним огромным изменением. Каждый шаг сохраняет рабочее состояние."}
        </Lead>

        <div className="lesson-practice-steps">
          <h3>Шаг 1</h3>
          <p>
            {"Создать каркас и точку запуска."}
          </p>

          <h3>Шаг 2</h3>
          <p>
            {"Перенести модель и исключения."}
          </p>

          <h3>Шаг 3</h3>
          <p>
            {"Подключить storage, service, меню, тесты и README."}
          </p>

        </div>

        <CodeBlock
          caption={"история коммитов"}
          code={
            "chore: create application structure\n" +
            "refactor: move task model\n" +
            "feat: add JSON storage\n" +
            "feat: implement planner service\n" +
            "refactor: connect console menu\n" +
            "test: cover model and storage\n" +
            "docs: write project README"
          }
        />

        <TrueFalse
          statement={<>{"Лучше перенести модель, storage и меню одним коммитом, чтобы история была короче."}</>}
          isTrue={false}
          explanation={"Небольшие коммиты упрощают проверку и откат."}
        />

        <Callout tone="info">
          {"Сообщение final project не объясняет историю. Один коммит должен описывать одно понятное изменение."}
        </Callout>
      </Section>

      <Section number="07" title={"Main как точка сборки"}>
        <Lead>
          {"Main соединяет зависимости и запускает приложение. Он не читает JSON вручную, не вычисляет id и не проверяет поля Task."}
        </Lead>

        <div className="lesson-practice-steps">
          <h3>build_service</h3>
          <p>
            {"Создаёт конкретное хранилище и сервис."}
          </p>

          <h3>main</h3>
          <p>
            {"Создаёт интерфейс и запускает его."}
          </p>

          <h3>Граница ошибок</h3>
          <p>
            {"Верхний уровень сообщает о StorageError."}
          </p>

        </div>

        <CodeBlock
          caption={"app/main.py"}
          code={
            "from pathlib import Path\n" +
            "\n" +
            "from app.services import PlannerService\n" +
            "from app.storage import JsonStorage\n" +
            "\n" +
            "\n" +
            "def build_service():\n" +
            "    storage = JsonStorage(\n" +
            "        Path(\"data/tasks.json\")\n" +
            "    )\n" +
            "\n" +
            "    return PlannerService(storage)\n" +
            "\n" +
            "\n" +
            "def main():\n" +
            "    service = build_service()\n" +
            "    application = ConsoleApplication(service)\n" +
            "    application.run()\n" +
            "\n" +
            "\n" +
            "if __name__ == \"__main__\":\n" +
            "    main()"
          }
        />

        <PredictOutput
          code={
            "build_service() возвращает"
          }
          output={"PlannerService"}
          hint={"JsonStorage передаётся внутрь сервиса."}
        />

        <Callout tone="info">
          {"ConsoleApplication можно оставить в main.py или перенести в cli.py, если интерфейс не смешан с storage."}
        </Callout>
      </Section>

      <Section number="08" title={"Контрольная точка проектирования"}>
        <Lead>
          {"К концу первой проектной сессии CRUD может быть не полностью реализован, но структура, импорты, точка запуска и контракты должны быть готовы."}
        </Lead>

        <div className="lesson-practice-steps">
          <h3>Должно работать</h3>
          <p>
            {"Импорт модулей и python -m app.main."}
          </p>

          <h3>Может быть заглушкой</h3>
          <p>
            {"Некоторые методы временно содержат NotImplementedError."}
          </p>

          <h3>Не должно быть</h3>
          <p>
            {"Циклов, input в storage, JSON в main и голого except."}
          </p>

        </div>

        <CodeBlock
          caption={"контрольные команды"}
          code={
            "python -m app.main\n" +
            "python -c \"import app.models\"\n" +
            "python -c \"import app.services\"\n" +
            "python -c \"import app.storage\"\n" +
            "python -m pytest -q\n" +
            "\n" +
            "[ ] структура создана\n" +
            "[ ] импорты однонаправленные\n" +
            "[ ] main является точкой запуска\n" +
            "[ ] контракты записаны\n" +
            "[ ] старый код сохранён в Git"
          }
        />

        <Callout tone="info">
          {"Сессия успешна, если назначение каждого файла можно объяснить без чтения всего проекта."}
        </Callout>

        <div className="lesson-check-group">
          <QuizCard
            question={"Что проектируют раньше файлов?"}
            options={[
              "сценарии",
              "максимум папок",
              "release",
            ]}
            correctIndex={0}
            explanation={"Структура обслуживает поведение."}
          />
          <QuizCard
            question={"Где создаётся JsonStorage?"}
            options={[
              "в main",
              "в Task",
              "в exceptions",
            ]}
            correctIndex={0}
            explanation={"Main соединяет зависимости."}
          />
          <QuizCard
            question={"Что возвращает storage.load?"}
            options={[
              "list[Task]",
              "меню",
              "input",
            ]}
            correctIndex={0}
            explanation={"Контракт един для сервиса."}
          />
          <QuizCard
            question={"Что не должно импортировать main?"}
            options={[
              "services и storage",
              "ничто",
              "README",
            ]}
            correctIndex={0}
            explanation={"Нижние модули не зависят от точки запуска."}
          />
        </div>

        <KeyTakeaways
          points={[
            <>{"Финальный проект начинается с обязательного поведения."}</>,
            <>{"Структура разделяет модель, сервис, хранение и интерфейс."}</>,
            <>{"Контракты записываются до реализации."}</>,
            <>{"Граф импортов строится сверху вниз."}</>,
            <>{"Перенос выполняется небольшими коммитами."}</>,
            <>{"Main соединяет зависимости."}</>,
          ]}
        />

        <PracticeCta text={"Создайте каркас Persistent Planner, карту зависимостей и минимум четыре осмысленных коммита без лишних возможностей."} />
      </Section>

    </RichLesson>
  );
}

// 43. Финальный проект 2: модель, сервисы и хранение
export function Lesson43({ module }: { module?: string }) {
  return (
    <RichLesson>
      <RichHero
        variant="project"
        chip={module ?? "Месяц 2 · Блок 8"}
        title={"Финальный проект 2: модель, сервисы и хранение"}
        intro={"Заполним архитектурный каркас рабочим кодом: Task через dataclass, переходы в JSON, JsonStorage, MemoryStorage, CRUD-сервис и сохранение после каждого изменения."}
        tags={[
          { icon: <FileText size={14} />, label: "Task и JSON" },
          { icon: <KeyRound size={14} />, label: "CRUD через сервис" },
        ]}
      />
      <TheoryBridge lesson={43} />

      <Section number="01" title={"Единый путь данных"}>
        <Lead>
          {"В приложении существуют объект Task и JSON-совместимый словарь. Переходы между ними должны быть явными."}
        </Lead>

        <div className="lesson-practice-steps">
          <h3>Внутри приложения</h3>
          <p>
            {"Сервис и интерфейс используют Task."}
          </p>

          <h3>На границе хранения</h3>
          <p>
            {"Storage преобразует Task в dict и обратно."}
          </p>

          <h3>В JSON</h3>
          <p>
            {"Хранятся строки, числа, bool, списки и словари."}
          </p>

        </div>

        <CodeBlock
          caption={"два направления преобразования"}
          code={
            "JSON text\n" +
            "→ list[dict]\n" +
            "→ Task.from_dict\n" +
            "→ list[Task]\n" +
            "→ PlannerService\n" +
            "\n" +
            "list[Task]\n" +
            "→ Task.to_dict\n" +
            "→ list[dict]\n" +
            "→ json.dumps\n" +
            "→ tasks.json"
          }
        />

        <RecallCard
          question={"Какие данные использует PlannerService?"}
          hint={"Сырые dict существуют на границе хранения."}
          answer={<p>{"Объекты Task, а не сырые словари JSON."}</p>}
        />

        <Callout tone="info">
          {"Main не должен вручную собирать словари. Преобразование сосредоточено в модели и storage."}
        </Callout>
      </Section>

      <Section number="02" title={"Полная модель Task"}>
        <Lead>
          {"Task хранит данные, защищает инварианты и описывает переход в словарь и обратно."}
        </Lead>

        <div className="lesson-practice-steps">
          <h3>Dataclass</h3>
          <p>
            {"Поля модели видны в начале класса."}
          </p>

          <h3>Проверка</h3>
          <p>
            {"__post_init__ очищает title и проверяет priority."}
          </p>

          <h3>Сериализация</h3>
          <p>
            {"to_dict и from_dict задают формат хранения."}
          </p>

        </div>

        <CodeBlock
          caption={"app/models.py"}
          code={
            "from dataclasses import dataclass, field\n" +
            "\n" +
            "@dataclass\n" +
            "class Task:\n" +
            "    id: int\n" +
            "    title: str\n" +
            "    priority: int\n" +
            "    is_done: bool = False\n" +
            "    tags: list[str] = field(default_factory=list)\n" +
            "\n" +
            "    def __post_init__(self):\n" +
            "        self.title = self.title.strip()\n" +
            "        if not self.title:\n" +
            "            raise ValueError(\"empty title\")\n" +
            "        if not 1 <= self.priority <= 5:\n" +
            "            raise ValueError(\"bad priority\")\n" +
            "\n" +
            "    def mark_done(self):\n" +
            "        self.is_done = True\n" +
            "\n" +
            "    def to_dict(self):\n" +
            "        return {\n" +
            "            \"id\": self.id,\n" +
            "            \"title\": self.title,\n" +
            "            \"priority\": self.priority,\n" +
            "            \"is_done\": self.is_done,\n" +
            "            \"tags\": list(self.tags),\n" +
            "        }\n" +
            "\n" +
            "    @classmethod\n" +
            "    def from_dict(cls, data):\n" +
            "        return cls(\n" +
            "            id=data[\"id\"],\n" +
            "            title=data[\"title\"],\n" +
            "            priority=data[\"priority\"],\n" +
            "            is_done=data.get(\"is_done\", False),\n" +
            "            tags=list(data.get(\"tags\", [])),\n" +
            "        )"
          }
        />

        <TrueFalse
          statement={<>{"Task.from_dict должен возвращать сырой dict."}</>}
          isTrue={false}
          explanation={"Метод создаёт полноценный объект Task."}
        />

        <Callout tone="info">
          {"list(tags) создаёт отдельный список и не связывает Task с изменяемым списком входного словаря."}
        </Callout>
      </Section>

      <Section number="03" title={"JsonStorage: сохранение"}>
        <Lead>
          {"Хранилище получает Path снаружи, создаёт родительский каталог и записывает UTF-8."}
        </Lead>

        <div className="lesson-practice-steps">
          <h3>Path</h3>
          <p>
            {"Путь не зашит внутри класса."}
          </p>

          <h3>Каталог</h3>
          <p>
            {"mkdir поддерживает первый запуск."}
          </p>

          <h3>Формат</h3>
          <p>
            {"ensure_ascii=False и indent=2 делают JSON читаемым."}
          </p>

        </div>

        <CodeBlock
          caption={"app/storage.py — save"}
          code={
            "import json\n" +
            "from pathlib import Path\n" +
            "\n" +
            "class JsonStorage:\n" +
            "    def __init__(self, path: Path):\n" +
            "        self.path = path\n" +
            "\n" +
            "    def save(self, tasks):\n" +
            "        self.path.parent.mkdir(\n" +
            "            parents=True,\n" +
            "            exist_ok=True,\n" +
            "        )\n" +
            "\n" +
            "        data = [\n" +
            "            task.to_dict()\n" +
            "            for task in tasks\n" +
            "        ]\n" +
            "\n" +
            "        text = json.dumps(\n" +
            "            data,\n" +
            "            ensure_ascii=False,\n" +
            "            indent=2,\n" +
            "        )\n" +
            "\n" +
            "        self.path.write_text(\n" +
            "            text,\n" +
            "            encoding=\"utf-8\",\n" +
            "        )"
          }
        />

        <PredictOutput
          code={
            "ensure_ascii=False сохраняет"
          }
          output={"русские символы читаемо"}
          hint={"Без этого JSON может содержать Unicode-escape последовательности."}
        />

        <Callout tone="info">
          {"Storage отвечает за файловую границу и не показывает пользовательские сообщения."}
        </Callout>
      </Section>

      <Section number="04" title={"Загрузка и разные состояния файла"}>
        <Lead>
          {"Отсутствующий файл нормален для первого запуска. Повреждённый JSON должен дать StorageError и не превращаться в пустой список."}
        </Lead>

        <div className="lesson-practice-steps">
          <h3>Нет файла</h3>
          <p>
            {"Возвращается пустой список."}
          </p>

          <h3>Пустой текст</h3>
          <p>
            {"После strip возвращается пустой список."}
          </p>

          <h3>Повреждение</h3>
          <p>
            {"JSONDecodeError преобразуется в StorageError через raise from."}
          </p>

        </div>

        <CodeBlock
          caption={"app/storage.py — load"}
          code={
            "def load(self):\n" +
            "    try:\n" +
            "        text = self.path.read_text(\n" +
            "            encoding=\"utf-8\",\n" +
            "        )\n" +
            "    except FileNotFoundError:\n" +
            "        return []\n" +
            "\n" +
            "    if text.strip() == \"\":\n" +
            "        return []\n" +
            "\n" +
            "    try:\n" +
            "        data = json.loads(text)\n" +
            "    except json.JSONDecodeError as error:\n" +
            "        raise StorageError(\n" +
            "            \"Файл задач повреждён\"\n" +
            "        ) from error\n" +
            "\n" +
            "    if not isinstance(data, list):\n" +
            "        raise StorageError(\n" +
            "            \"Корень JSON должен быть списком\"\n" +
            "        )\n" +
            "\n" +
            "    try:\n" +
            "        return [\n" +
            "            Task.from_dict(item)\n" +
            "            for item in data\n" +
            "        ]\n" +
            "    except (KeyError, TypeError, ValueError) as error:\n" +
            "        raise StorageError(\n" +
            "            \"Структура задачи повреждена\"\n" +
            "        ) from error"
          }
        />

        <BugHunt
          code={
            "except json.JSONDecodeError:\n" +
            "    return []"
          }
          question={"Что скрывает такой обработчик?"}
          options={[
            "Повреждение существующего файла",
            "Отсутствие Python",
            "Ошибку Git",
          ]}
          correctIndex={0}
          explanation={"Повреждение выглядит как пустой проект."}
          fix={"raise StorageError(\"Файл задач повреждён\") from error"}
        />

        <Callout tone="info">
          {"Отсутствие данных и невозможность прочитать существующие данные — разные состояния проекта."}
        </Callout>
      </Section>

      <Section number="05" title={"MemoryStorage для тестов"}>
        <Lead>
          {"MemoryStorage хранит список в памяти и соблюдает тот же контракт load/save. Он позволяет проверять PlannerService без файла."}
        </Lead>

        <div className="lesson-practice-steps">
          <h3>Копии</h3>
          <p>
            {"Load и save не отдают внутренний список напрямую."}
          </p>

          <h3>Одинаковый контракт</h3>
          <p>
            {"Сервис не знает, какое хранилище получил."}
          </p>

          <h3>Ограничение</h3>
          <p>
            {"После завершения процесса данные исчезают, что нормально для теста."}
          </p>

        </div>

        <CodeBlock
          caption={"хранилище в памяти"}
          code={
            "class MemoryStorage:\n" +
            "    def __init__(self, tasks=None):\n" +
            "        self._tasks = list(tasks or [])\n" +
            "\n" +
            "    def load(self):\n" +
            "        return list(self._tasks)\n" +
            "\n" +
            "    def save(self, tasks):\n" +
            "        self._tasks = list(tasks)\n" +
            "\n" +
            "production = PlannerService(\n" +
            "    JsonStorage(Path(\"data/tasks.json\"))\n" +
            ")\n" +
            "\n" +
            "test_service = PlannerService(\n" +
            "    MemoryStorage()\n" +
            ")"
          }
        />

        <TrueFalse
          statement={<>{"PlannerService должен проверять isinstance(storage, MemoryStorage)."}</>}
          isTrue={false}
          explanation={"Одинаковый контракт не требует знания класса."}
        />

        <Callout tone="info">
          {"MemoryStorage — простая реализация контракта, а не отдельный режим внутри PlannerService."}
        </Callout>
      </Section>

      <Section number="06" title={"PlannerService: добавление и id"}>
        <Lead>
          {"Сервис загружает состояние, вычисляет следующий id по максимуму, создаёт Task и сохраняет изменённый список."}
        </Lead>

        <div className="lesson-practice-steps">
          <h3>list_tasks</h3>
          <p>
            {"Возвращает загруженные объекты."}
          </p>

          <h3>Следующий id</h3>
          <p>
            {"Пустой список даёт 1, иначе max(id)+1."}
          </p>

          <h3>Добавление</h3>
          <p>
            {"Task создаётся после вычисления id и сохраняется."}
          </p>

        </div>

        <CodeBlock
          caption={"основа PlannerService"}
          code={
            "class PlannerService:\n" +
            "    def __init__(self, storage):\n" +
            "        self.storage = storage\n" +
            "\n" +
            "    def list_tasks(self):\n" +
            "        return self.storage.load()\n" +
            "\n" +
            "    def _get_next_id(self, tasks):\n" +
            "        if not tasks:\n" +
            "            return 1\n" +
            "\n" +
            "        return max(\n" +
            "            task.id\n" +
            "            for task in tasks\n" +
            "        ) + 1\n" +
            "\n" +
            "    def add_task(self, title, priority, tags=None):\n" +
            "        tasks = self.storage.load()\n" +
            "\n" +
            "        task = Task(\n" +
            "            id=self._get_next_id(tasks),\n" +
            "            title=title,\n" +
            "            priority=priority,\n" +
            "            tags=list(tags or []),\n" +
            "        )\n" +
            "\n" +
            "        tasks.append(task)\n" +
            "        self.storage.save(tasks)\n" +
            "        return task"
          }
        />

        <PredictOutput
          code={
            "max([2, 7, 4]) + 1"
          }
          output={"8"}
          hint={"Следующий id не зависит от длины списка."}
        />

        <Callout tone="info">
          {"Важнее тестировать публичный результат add_task, а не внутренний helper напрямую."}
        </Callout>
      </Section>

      <Section number="07" title={"Поиск, статус и удаление"}>
        <Lead>
          {"CRUD-операции используют id. Если задача отсутствует, сервис создаёт TaskNotFoundError. После изменения список сохраняется."}
        </Lead>

        <div className="lesson-practice-steps">
          <h3>get_task</h3>
          <p>
            {"Возвращает Task или создаёт исключение."}
          </p>

          <h3>mark_done</h3>
          <p>
            {"Меняет объект и сохраняет список."}
          </p>

          <h3>delete_task</h3>
          <p>
            {"Удаляет найденную задачу и возвращает её."}
          </p>

        </div>

        <CodeBlock
          caption={"CRUD-методы"}
          code={
            "def get_task(self, task_id):\n" +
            "    tasks = self.storage.load()\n" +
            "    for task in tasks:\n" +
            "        if task.id == task_id:\n" +
            "            return task\n" +
            "    raise TaskNotFoundError(task_id)\n" +
            "\n" +
            "\n" +
            "def mark_done(self, task_id):\n" +
            "    tasks = self.storage.load()\n" +
            "    for task in tasks:\n" +
            "        if task.id == task_id:\n" +
            "            task.mark_done()\n" +
            "            self.storage.save(tasks)\n" +
            "            return task\n" +
            "    raise TaskNotFoundError(task_id)\n" +
            "\n" +
            "\n" +
            "def delete_task(self, task_id):\n" +
            "    tasks = self.storage.load()\n" +
            "    for index, task in enumerate(tasks):\n" +
            "        if task.id == task_id:\n" +
            "            deleted = tasks.pop(index)\n" +
            "            self.storage.save(tasks)\n" +
            "            return deleted\n" +
            "    raise TaskNotFoundError(task_id)"
          }
        />

        <RecallCard
          question={"Когда CRUD-метод вызывает save?"}
          hint={"Поиск сам по себе состояние не меняет."}
          answer={<p>{"После успешного изменения списка или объекта."}</p>}
        />

        <Callout tone="info">
          {"Не смешивайте False, None и пустой Task для одной ситуации отсутствия. Один тип исключения делает контракт стабильным."}
        </Callout>
      </Section>

      <Section number="08" title={"Интеграция и ручной сценарий"}>
        <Lead>
          {"Соедините JsonStorage и PlannerService в main. Проверьте добавление, перезапуск, изменение статуса, удаление и повреждённый файл."}
        </Lead>

        <div className="lesson-practice-steps">
          <h3>Первый запуск</h3>
          <p>
            {"Нет файла — пустой список."}
          </p>

          <h3>Повторный запуск</h3>
          <p>
            {"Объекты восстанавливаются через Task.from_dict."}
          </p>

          <h3>Повреждение</h3>
          <p>
            {"Неверный JSON не перезаписывается."}
          </p>

        </div>

        <CodeBlock
          caption={"точка сборки и сценарий"}
          code={
            "from pathlib import Path\n" +
            "\n" +
            "\n" +
            "def build_service():\n" +
            "    storage = JsonStorage(\n" +
            "        Path(\"data/tasks.json\")\n" +
            "    )\n" +
            "    return PlannerService(storage)\n" +
            "\n" +
            "# ручная проверка:\n" +
            "# 1. удалить tasks.json\n" +
            "# 2. добавить Python и SQL\n" +
            "# 3. закрыть приложение\n" +
            "# 4. запустить снова\n" +
            "# 5. отметить Python выполненной\n" +
            "# 6. удалить SQL\n" +
            "# 7. снова перезапустить"
          }
        />

        <Callout tone="info">
          {"К завершению занятия Persistent Planner уже работает. Следующий урок защищает его тестами и документацией."}
        </Callout>

        <div className="lesson-check-group">
          <QuizCard
            question={"Что использует сервис?"}
            options={[
              "Task",
              "сырой JSON",
              "input",
            ]}
            correctIndex={0}
            explanation={"Dict появляется на границе хранения."}
          />
          <QuizCard
            question={"Что возвращает load без файла?"}
            options={[
              "[]",
              "StorageError",
              "None",
            ]}
            correctIndex={0}
            explanation={"Это нормальный первый запуск."}
          />
          <QuizCard
            question={"Почему повреждение не равно []?"}
            options={[
              "можно потерять данные",
              "списки запрещены",
              "pytest не работает",
            ]}
            correctIndex={0}
            explanation={"Повреждение отличается от пустого состояния."}
          />
          <QuizCard
            question={"Когда CRUD сохраняет?"}
            options={[
              "после изменения",
              "до проверки id",
              "только при выходе",
            ]}
            correctIndex={0}
            explanation={"Файл отражает новое состояние."}
          />
        </div>

        <KeyTakeaways
          points={[
            <>{"Сервис работает с объектами Task."}</>,
            <>{"To_dict и from_dict задают границу JSON."}</>,
            <>{"JsonStorage получает Path извне."}</>,
            <>{"Отсутствующий и повреждённый файл различаются."}</>,
            <>{"MemoryStorage соблюдает тот же контракт."}</>,
            <>{"CRUD сохраняет состояние после изменения."}</>,
          ]}
        />

        <PracticeCta text={"Реализуйте Task, JsonStorage, MemoryStorage и полный CRUD PlannerService, затем пройдите сценарий с двумя перезапусками."} />
      </Section>

    </RichLesson>
  );
}

// 44. Финальный проект 3: тесты, README, GitHub Release и защита
export function Lesson44({ module }: { module?: string }) {
  return (
    <RichLesson>
      <RichHero
        variant="project"
        chip={module ?? "Месяц 2 · Блок 8"}
        title={"Финальный проект 3: тесты, README, GitHub Release и защита"}
        intro={"Доведём Persistent Planner до защищаемого результата: проверим ключевые сценарии pytest, напишем воспроизводимый README, оформим историю Git и создадим первый GitHub Release."}
        tags={[
          { icon: <Trophy size={14} />, label: "тесты и документация" },
          { icon: <CheckCircle2 size={14} />, label: "release и защита" },
        ]}
      />
      <TheoryBridge lesson={44} />

      <Section number="01" title={"Готовый проект — не только код"}>
        <Lead>
          {"Функция, которая однажды сработала на компьютере автора, ещё не является завершённым проектом."}
        </Lead>

        <div className="lesson-practice-steps">
          <h3>Рабочее поведение</h3>
          <p>
            {"CRUD и сохранение проходят обычные и ошибочные сценарии."}
          </p>

          <h3>Автоматическая проверка</h3>
          <p>
            {"Pytest защищает ключевые контракты."}
          </p>

          <h3>Воспроизводимость</h3>
          <p>
            {"README описывает установку с нуля."}
          </p>

        </div>

        <CodeBlock
          caption={"четыре слоя готовности"}
          code={
            "код\n" +
            "→ тесты\n" +
            "→ документация\n" +
            "→ релиз и защита\n" +
            "\n" +
            "python -m app.main\n" +
            "python -m pytest -q\n" +
            "\n" +
            "# новый человек понимает:\n" +
            "# что делает проект\n" +
            "# как установить\n" +
            "# как запустить\n" +
            "# где хранятся данные\n" +
            "# какие ограничения известны"
          }
        />

        <RecallCard
          question={"Чем рабочий скрипт отличается от завершённого проекта?"}
          hint={"Код — только один слой."}
          answer={<p>{"Завершённый проект воспроизводимо запускается, защищён тестами, описан и имеет версию."}</p>}
        />

        <Callout tone="info">
          {"GitHub Release не исправляет плохой код. Он фиксирует уже проверенную версию."}
        </Callout>
      </Section>

      <Section number="02" title={"Тесты модели Task"}>
        <Lead>
          {"Модель проверяется отдельно от файла и интерфейса: нормализация, границы priority, независимость tags и преобразование."}
        </Lead>

        <div className="lesson-practice-steps">
          <h3>Обычный сценарий</h3>
          <p>
            {"Title очищается."}
          </p>

          <h3>Границы</h3>
          <p>
            {"1 и 5 принимаются, 0 и 6 отклоняются."}
          </p>

          <h3>Изменяемое поле</h3>
          <p>
            {"У задач разные списки tags."}
          </p>

        </div>

        <CodeBlock
          caption={"тесты модели"}
          code={
            "import pytest\n" +
            "from app.models import Task\n" +
            "\n" +
            "\n" +
            "def test_task_strips_title():\n" +
            "    task = Task(1, \"  Python  \", 4)\n" +
            "    assert task.title == \"Python\"\n" +
            "\n" +
            "\n" +
            "@pytest.mark.parametrize(\n" +
            "    \"priority\",\n" +
            "    [1, 5],\n" +
            ")\n" +
            "def test_accepts_boundary_priority(priority):\n" +
            "    task = Task(1, \"SQL\", priority)\n" +
            "    assert task.priority == priority\n" +
            "\n" +
            "\n" +
            "@pytest.mark.parametrize(\n" +
            "    \"priority\",\n" +
            "    [0, 6],\n" +
            ")\n" +
            "def test_rejects_invalid_priority(priority):\n" +
            "    with pytest.raises(ValueError):\n" +
            "        Task(1, \"SQL\", priority)"
          }
        />

        <TrueFalse
          statement={<>{"Для реалистичности каждый тест Task должен читать data/tasks.json."}</>}
          isTrue={false}
          explanation={"Модель тестируется отдельно от файловой границы."}
        />

        <Callout tone="info">
          {"Тест Task не должен создавать JsonStorage или запускать меню."}
        </Callout>
      </Section>

      <Section number="03" title={"Тесты PlannerService"}>
        <Lead>
          {"Сервис проверяется через MemoryStorage. Тесты концентрируются на id, CRUD и предметных исключениях."}
        </Lead>

        <div className="lesson-practice-steps">
          <h3>Добавление</h3>
          <p>
            {"Первый id равен 1, следующий увеличивается."}
          </p>

          <h3>Изменение</h3>
          <p>
            {"mark_done сохраняет новое состояние."}
          </p>

          <h3>Ошибка</h3>
          <p>
            {"Неизвестный id создаёт TaskNotFoundError."}
          </p>

        </div>

        <CodeBlock
          caption={"тесты сервиса"}
          code={
            "import pytest\n" +
            "from app.exceptions import TaskNotFoundError\n" +
            "from app.services import PlannerService\n" +
            "from app.storage import MemoryStorage\n" +
            "\n" +
            "\n" +
            "def test_add_task_assigns_ids():\n" +
            "    service = PlannerService(MemoryStorage())\n" +
            "    first = service.add_task(\"Python\", 4)\n" +
            "    second = service.add_task(\"SQL\", 3)\n" +
            "    assert first.id == 1\n" +
            "    assert second.id == 2\n" +
            "\n" +
            "\n" +
            "def test_mark_done_persists_change():\n" +
            "    storage = MemoryStorage()\n" +
            "    service = PlannerService(storage)\n" +
            "    task = service.add_task(\"Python\", 4)\n" +
            "    service.mark_done(task.id)\n" +
            "    assert storage.load()[0].is_done is True\n" +
            "\n" +
            "\n" +
            "def test_unknown_task_raises():\n" +
            "    service = PlannerService(MemoryStorage())\n" +
            "    with pytest.raises(TaskNotFoundError):\n" +
            "        service.get_task(999)"
          }
        />

        <PredictOutput
          code={
            "Первый add_task в пустом storage получает id"
          }
          output={"1"}
          hint={"Сервис начинает нумерацию с единицы."}
        />

        <Callout tone="info">
          {"Проверяйте публичный контракт add_task, а не внутренний _get_next_id без необходимости."}
        </Callout>
      </Section>

      <Section number="04" title={"Тесты JsonStorage через tmp_path"}>
        <Lead>
          {"Файловая граница получает временную папку. Проверяются первый запуск, round trip и повреждённый JSON."}
        </Lead>

        <div className="lesson-practice-steps">
          <h3>Нет файла</h3>
          <p>
            {"Load возвращает пустой список."}
          </p>

          <h3>Round trip</h3>
          <p>
            {"Сохранённый Task загружается равным объектом."}
          </p>

          <h3>Повреждение</h3>
          <p>
            {"StorageError создаётся явно."}
          </p>

        </div>

        <CodeBlock
          caption={"тесты хранения"}
          code={
            "import pytest\n" +
            "from app.exceptions import StorageError\n" +
            "from app.models import Task\n" +
            "from app.storage import JsonStorage\n" +
            "\n" +
            "\n" +
            "def test_missing_file_returns_empty_list(tmp_path):\n" +
            "    storage = JsonStorage(\n" +
            "        tmp_path / \"tasks.json\"\n" +
            "    )\n" +
            "    assert storage.load() == []\n" +
            "\n" +
            "\n" +
            "def test_json_round_trip(tmp_path):\n" +
            "    storage = JsonStorage(\n" +
            "        tmp_path / \"tasks.json\"\n" +
            "    )\n" +
            "    tasks = [Task(1, \"Python\", 4)]\n" +
            "    storage.save(tasks)\n" +
            "    assert storage.load() == tasks\n" +
            "\n" +
            "\n" +
            "def test_broken_json_raises(tmp_path):\n" +
            "    path = tmp_path / \"tasks.json\"\n" +
            "    path.write_text(\"{broken\", encoding=\"utf-8\")\n" +
            "    storage = JsonStorage(path)\n" +
            "    with pytest.raises(StorageError):\n" +
            "        storage.load()"
          }
        />

        <BugHunt
          code={
            "storage = JsonStorage(Path(\"data/tasks.json\"))"
          }
          question={"Почему строка опасна внутри теста?"}
          options={[
            "Тест может изменить пользовательские данные",
            "Path запрещён",
            "JSON нельзя тестировать",
          ]}
          correctIndex={0}
          explanation={"Нужно использовать tmp_path."}
          fix={"storage = JsonStorage(tmp_path / \"tasks.json\")"}
        />

        <Callout tone="info">
          {"Настоящий data/tasks.json не участвует в автоматических тестах."}
        </Callout>
      </Section>

      <Section number="05" title={"README для нового человека"}>
        <Lead>
          {"README — не дневник автора, а маршрут человека, который впервые открыл репозиторий. Команды проверяются в чистом терминале."}
        </Lead>

        <div className="lesson-practice-steps">
          <h3>Описание</h3>
          <p>
            {"Что решает Persistent Planner."}
          </p>

          <h3>Установка</h3>
          <p>
            {"Clone, venv и pytest."}
          </p>

          <h3>Запуск</h3>
          <p>
            {"python -m app.main и python -m pytest -q."}
          </p>

        </div>

        <CodeBlock
          caption={"структура README"}
          code={
            "# Persistent Planner\n" +
            "\n" +
            "## Возможности\n" +
            "## Структура проекта\n" +
            "## Требования\n" +
            "## Установка\n" +
            "## Запуск\n" +
            "## Запуск тестов\n" +
            "## Формат хранения\n" +
            "## Пример работы\n" +
            "## Известные ограничения\n" +
            "## Что изучено\n" +
            "\n" +
            "# Проверенные команды:\n" +
            "git clone <repository-url>\n" +
            "cd persistent-planner\n" +
            "python -m venv .venv\n" +
            ".\\.venv\\Scripts\\Activate.ps1\n" +
            "python -m pip install pytest\n" +
            "python -m pytest -q\n" +
            "python -m app.main"
          }
        />

        <RecallCard
          question={"На какой вопрос отвечает раздел «Ограничения»?"}
          hint={"Ограничение — честная граница, а не недостаток оформления."}
          answer={<p>{"Чего проект сознательно пока не делает."}</p>}
        />

        <Callout tone="info">
          {"Не пишите команду в README, пока не выполнили её из корня проекта."}
        </Callout>
      </Section>

      <Section number="06" title={"Git-история и чистота репозитория"}>
        <Lead>
          {"Перед релизом история и содержимое очищаются. В коммиты не попадают окружение, кэш Python и личные данные."}
        </Lead>

        <div className="lesson-practice-steps">
          <h3>.gitignore</h3>
          <p>
            {"Исключает .venv, __pycache__, .pytest_cache и рабочий tasks.json."}
          </p>

          <h3>Коммиты</h3>
          <p>
            {"История показывает модель, storage, service, tests и docs отдельными шагами."}
          </p>

          <h3>Чистый статус</h3>
          <p>
            {"git status не показывает случайных изменений."}
          </p>

        </div>

        <CodeBlock
          caption={".gitignore и проверки"}
          code={
            ".venv/\n" +
            "__pycache__/\n" +
            "*.pyc\n" +
            ".pytest_cache/\n" +
            ".idea/\n" +
            ".vscode/\n" +
            "data/tasks.json\n" +
            "\n" +
            "python -m pytest -q\n" +
            "git status\n" +
            "git diff\n" +
            "git log --oneline --decorate -10"
          }
        />

        <TrueFalse
          statement={<>{"Папку .venv нужно отправить в GitHub, чтобы проект запускался у всех."}</>}
          isTrue={false}
          explanation={"Окружение создаётся локально по инструкции и не коммитится."}
        />

        <Callout tone="info">
          {"Если нужен пример данных, храните отдельный example-файл, а не личный рабочий tasks.json."}
        </Callout>
      </Section>

      <Section number="07" title={"Первый тег и GitHub Release"}>
        <Lead>
          {"Тег фиксирует конкретный коммит как версию. GitHub Release добавляет название и описание изменений."}
        </Lead>

        <div className="lesson-practice-steps">
          <h3>Версия</h3>
          <p>
            {"v1.0.0 — первый завершённый учебный релиз."}
          </p>

          <h3>Тег</h3>
          <p>
            {"Создаётся после тестов и финального коммита."}
          </p>

          <h3>Release notes</h3>
          <p>
            {"Коротко перечисляют возможности и ограничения."}
          </p>

        </div>

        <CodeBlock
          caption={"тег и описание релиза"}
          code={
            "git tag -a v1.0.0 -m \"Persistent Planner v1.0.0\"\n" +
            "\n" +
            "git push origin main\n" +
            "git push origin v1.0.0\n" +
            "\n" +
            "Persistent Planner v1.0.0\n" +
            "\n" +
            "Что готово:\n" +
            "- CRUD учебных задач\n" +
            "- JSON persistence\n" +
            "- dataclass Task\n" +
            "- обработка ошибок\n" +
            "- pytest tests\n" +
            "- README\n" +
            "\n" +
            "Ограничения:\n" +
            "- консольный интерфейс\n" +
            "- один локальный пользователь\n" +
            "- без базы данных"
          }
        />

        <PredictOutput
          code={
            "После git push origin v1.0.0 на GitHub появится"
          }
          output={"отправленный тег версии"}
          hint={"Release затем создаётся на основе этого тега."}
        />

        <Callout tone="info">
          {"Не создавайте релиз после каждой опечатки. Релиз фиксирует осмысленную принятую точку."}
        </Callout>
      </Section>

      <Section number="08" title={"Защита и финальная точка"}>
        <Lead>
          {"Защита проверяет понимание, а не скорость кликов. Ученик показывает запуск, CRUD, перезапуск, тесты и объясняет решения."}
        </Lead>

        <div className="lesson-practice-steps">
          <h3>Демонстрация</h3>
          <p>
            {"Чистый запуск, сохранение, повторный запуск и ожидаемая ошибка."}
          </p>

          <h3>Путь данных</h3>
          <p>
            {"Input → service → Task → storage → JSON."}
          </p>

          <h3>Решения</h3>
          <p>
            {"Почему dataclass, композиция, конкретные except и tmp_path."}
          </p>

        </div>

        <CodeBlock
          caption={"план защиты на 7–10 минут"}
          code={
            "1. цель Persistent Planner\n" +
            "2. структура репозитория\n" +
            "3. запуск приложения\n" +
            "4. CRUD и перезапуск\n" +
            "5. запуск pytest\n" +
            "6. разбор одного теста\n" +
            "7. объяснение storage injection\n" +
            "8. известные ограничения\n" +
            "9. следующий этап: Planner API\n" +
            "\n" +
            "python -m pytest -q\n" +
            "python -m app.main\n" +
            "git status\n" +
            "git tag\n" +
            "git log --oneline -8"
          }
        />

        <Callout tone="info">
          {"Контрольная точка пройдена, если ученик объясняет код своими словами и исправляет небольшой дефект по traceback."}
        </Callout>

        <div className="lesson-check-group">
          <QuizCard
            question={"Что тестируется отдельно от JsonStorage?"}
            options={[
              "Task",
              "README",
              "Release",
            ]}
            correctIndex={0}
            explanation={"Модель имеет отдельные тесты."}
          />
          <QuizCard
            question={"Через что тестируется service?"}
            options={[
              "MemoryStorage",
              "личный JSON",
              "input",
            ]}
            correctIndex={0}
            explanation={"Сервис проверяется без файла."}
          />
          <QuizCard
            question={"Что должен содержать README?"}
            options={[
              "проверенные команды",
              "только скриншот",
              "личные заметки",
            ]}
            correctIndex={0}
            explanation={"Документация воспроизводит запуск."}
          />
          <QuizCard
            question={"Когда ставится v1.0.0?"}
            options={[
              "после тестов и коммита",
              "до проекта",
              "после каждой строки",
            ]}
            correctIndex={0}
            explanation={"Тег фиксирует проверенную версию."}
          />
        </div>

        <KeyTakeaways
          points={[
            <>{"Завершённый проект включает код, тесты, документацию и версию."}</>,
            <>{"Task тестируется независимо от файла."}</>,
            <>{"PlannerService проверяется через MemoryStorage."}</>,
            <>{"JsonStorage тестируется через tmp_path."}</>,
            <>{"README содержит проверенные команды."}</>,
            <>{"Git-тег фиксирует принятый коммит."}</>,
            <>{"Защита проверяет понимание пути данных."}</>,
          ]}
        />

        <PracticeCta text={"Доведите Persistent Planner до v1.0.0: запустите тесты, проверьте README, создайте тег, GitHub Release и подготовьте защиту."} />
      </Section>

    </RichLesson>
  );
}
