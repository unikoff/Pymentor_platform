import {
  BrainCircuit,
  Layers,
} from "lucide-react";
import {
  BugHunt,
  Callout,
  CodeBlock,
  CodeSequence,
  CompareSolutions,
  FillBlank,
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
} from "../../shared";

export function MonthTheory() {
  return (
    <RichLesson>
      <RichHero
        chip="Блок 0 · инженерная модель"
        title="Как растёт приложение: состояние, границы и ответственность"
        intro="До новых конструкций Python построим общую модель Persistent Planner: где живут данные, как они проходят через приложение, какие ошибки являются ожидаемыми и почему структура проекта важнее количества файлов."
        tags={[
          { icon: <BrainCircuit size={14} />, label: "данные → правило → состояние" },
          { icon: <Layers size={14} />, label: "интерфейс · модель · хранение" },
        ]}
      />

      <Section number="01" title="Программа как управляемое изменение состояния">
        <Lead>
          Console Planner уже не является набором независимых вычислений. Пользователь выполняет команды, которые
          меняют общее состояние приложения: список учебных задач. Persistent Planner добавляет к этому состоянию
          долговечность и формальные границы.
        </Lead>

        <CodeBlock
          caption="базовая модель приложения"
          code={
            "состояние до команды\n" +
            "        ↓\n" +
            "ввод пользователя\n" +
            "        ↓\n" +
            "проверка и правило\n" +
            "        ↓\n" +
            "состояние после команды\n" +
            "        ↓\n" +
            "сохранение и вывод"
          }
        />

        <TypeCards>
          <TypeCard badge="state" title="Состояние" code="tasks: list[Task]">
            Набор задач и значения их атрибутов в конкретный момент работы программы.
          </TypeCard>
          <TypeCard badge="command" badgeTone="float" title="Команда" code='"add" · "done" · "delete"'>
            Намерение пользователя изменить или прочитать состояние.
          </TypeCard>
          <TypeCard badge="transition" badgeTone="str" title="Переход" code="old_state → rule → new_state">
            Проверяемое правило, которое определяет допустимое изменение.
          </TypeCard>
        </TypeCards>

        <StepThrough
          code={
            'tasks = load_tasks()\n' +
            'command = "done"\n' +
            'task = find_task(tasks, 2)\n' +
            'task.mark_done()\n' +
            'save_tasks(tasks)'
          }
          steps={[
            {
              line: 0,
              note: "При старте состояние восстанавливается из долговременного хранилища.",
              vars: { tasks: "список объектов Task" },
            },
            {
              line: 1,
              note: "Команда описывает намерение пользователя, но ещё не меняет данные.",
              vars: { command: '"done"' },
            },
            {
              line: 2,
              note: "Сервис поиска возвращает конкретную задачу или сообщает об отсутствии.",
              vars: { task: "Task(id=2)" },
            },
            {
              line: 3,
              note: "Метод изменяет допустимую часть состояния одной задачи.",
              vars: { "task.is_done": "True" },
            },
            {
              line: 4,
              note: "Новое состояние синхронизируется с JSON-файлом.",
              vars: { "tasks.json": "обновлён" },
            },
          ]}
        />

        <Callout tone="info">
          Команда, правило, изменение и сохранение — разные этапы. Их разделение позволяет понять, где возникла
          ошибка и какая часть проекта должна её обработать.
        </Callout>
      </Section>

      <Section number="02" title="Жизненный цикл данных">
        <Lead>
          Одни и те же сведения существуют в нескольких формах. В JSON задача является объектом данных, после
          загрузки — словарём, затем объектом Task, а в интерфейсе — форматированной строкой. Ошибка часто возникает
          при переходе между формами.
        </Lead>

        <CodeBlock
          caption="одна задача в четырёх представлениях"
          code={
            '# JSON-текст\n' +
            '{"id": 1, "title": "Python", "priority": 4, "is_done": false}\n\n' +
            '# Python-словарь после json.load\n' +
            '{"id": 1, "title": "Python", "priority": 4, "is_done": False}\n\n' +
            '# Объект предметной модели\n' +
            'Task(task_id=1, title="Python", priority=4, is_done=False)\n\n' +
            '# Строка интерфейса\n' +
            '[ ] 1. Python (приоритет 4)'
          }
        />

        <MatchPairs
          prompt="Соедините границу преобразования с ответственным действием."
          leftTitle="Переход"
          rightTitle="Действие"
          pairs={[
            { left: "JSON-текст → Python-данные", right: "json.load / json.loads" },
            { left: "словарь → Task", right: "Task.from_dict или явный конструктор" },
            { left: "Task → словарь", right: "task.to_dict" },
            { left: "Python-данные → JSON-текст", right: "json.dump / json.dumps" },
            { left: "Task → строка интерфейса", right: "__str__ или отдельный formatter" },
          ]}
          explanation="Каждая граница имеет явное направление и может быть проверена отдельно."
        />

        <PredictOutput
          code={
            'import json\n\n' +
            'raw = \'{"title": "SQL", "is_done": false}\'\n' +
            'data = json.loads(raw)\n' +
            'print(type(raw).__name__)\n' +
            'print(type(data).__name__)\n' +
            'print(data["is_done"])'
          }
          output={"str\ndict\nFalse"}
          hint="loads читает JSON из строки и создаёт обычные Python-объекты."
        />

        <BugHunt
          code={
            "tasks = json.load(file)\n" +
            "tasks[0].mark_done()"
          }
          question="Почему метод может отсутствовать после обычной загрузки JSON?"
          options={[
            "json.load создаёт словари и списки, а не экземпляры Task",
            "JSON запрещает хранить boolean",
            "Методы доступны только внутри main.py",
          ]}
          correctIndex={0}
          explanation="После десериализации нужно явно восстановить объекты предметной модели."
          fix={
            "records = json.load(file)\n" +
            "tasks = [Task.from_dict(record) for record in records]\n" +
            "tasks[0].mark_done()"
          }
        />

        <Callout>
          Сериализация не сохраняет «живой объект Python» целиком. Она сохраняет переносимую структуру данных, из
          которой объект можно восстановить по известному контракту.
        </Callout>
      </Section>

      <Section number="03" title="Границы приложения">
        <Lead>
          Граница — место, где приложение получает данные из менее контролируемой среды: пользовательский ввод,
          файл, импорт или внешний вызов. Чем ближе к границе находится проверка, тем меньше некорректных значений
          успевает распространиться по проекту.
        </Lead>

        <TypeCards>
          <TypeCard badge="UI" title="Пользовательский ввод" code='input("Приоритет: ")'>
            Всегда приходит строкой и может быть пустым, содержать пробелы или неверный формат числа.
          </TypeCard>
          <TypeCard badge="FILE" badgeTone="float" title="Файловая система" code="Path.read_text(encoding='utf-8')">
            Файл может отсутствовать, быть недоступным, пустым или повреждённым.
          </TypeCard>
          <TypeCard badge="MODEL" badgeTone="str" title="Создание объекта" code="Task(...)">
            Конструктор и свойства защищают инварианты уже внутри программы.
          </TypeCard>
        </TypeCards>

        <CodeBlock
          caption="проверка по мере прохождения границ"
          code={
            'raw_priority = input("Приоритет: ")\n' +
            'priority = parse_priority(raw_priority)\n' +
            'task = Task(task_id, title, priority)\n' +
            'tasks.append(task)\n' +
            'save_tasks(tasks)'
          }
        />

        <CompareSolutions
          question="Где лучше обнаружить неверный приоритет?"
          left={{
            title: "После сохранения",
            code:
              "tasks.append(task)\n" +
              "save_tasks(tasks)\n" +
              "if task.priority < 1:\n    print('Ошибка')",
            note: "Некорректное состояние уже попало в память и файл.",
          }}
          right={{
            title: "На входной границе",
            code:
              "priority = parse_priority(raw_priority)\n" +
              "task = Task(task_id, title, priority)",
            note: "Неверное значение отклоняется до изменения состояния.",
          }}
          preferred="right"
          explanation="Проверка до мутации сохраняет инварианты списка и JSON-хранилища."
        />

        <CodeSequence
          title="Безопасный путь новой задачи"
          prompt="Расположите этапы от неконтролируемого ввода к сохранённому состоянию."
          pieces={[
            { id: "read", code: "прочитать строки пользователя" },
            { id: "parse", code: "преобразовать и проверить значения" },
            { id: "construct", code: "создать Task с допустимым состоянием" },
            { id: "mutate", code: "добавить объект в список" },
            { id: "persist", code: "сериализовать и записать список" },
            { id: "confirm", code: "показать подтверждение" },
          ]}
          correctOrder={["read", "parse", "construct", "mutate", "persist", "confirm"]}
          explanation="Проверка и создание допустимого объекта происходят до изменения и сохранения общего состояния."
        />

        <RecallCard
          question="Почему внутренняя модель всё равно должна проверять данные, если интерфейс уже выполнил валидацию?"
          answer={
            <p>
              Объект может быть создан не только из текущего меню, но и из JSON, теста или будущего API. Модель не
              должна зависеть от того, что каждый внешний источник всегда проверит данные правильно.
            </p>
          }
        />
      </Section>

      <Section number="04" title="Контракт и ожидаемая ошибка">
        <Lead>
          Контракт функции описывает допустимый вход, результат, изменение состояния и ошибки, которые являются
          частью нормального сценария. Исключение не всегда означает дефект программы: иногда оно честно сообщает,
          что операция не может быть выполнена для конкретных данных.
        </Lead>

        <MethodGrid
          rows={[
            [<>вход</>, "какие значения функция принимает и в какой форме"],
            [<>результат</>, "что возвращается при успешном выполнении"],
            [<>побочный эффект</>, "какое внешнее состояние изменяется"],
            [<>ожидаемая ошибка</>, "какое известное нарушение сообщает вызывающему коду"],
            [<>неожиданная ошибка</>, "дефект или системная проблема, которую нельзя тихо скрывать"],
          ]}
        />

        <CodeBlock
          caption="явный контракт сервисной функции"
          code={
            "def complete_task(tasks, task_id):\n" +
            "    task = find_task(tasks, task_id)\n" +
            "    if task is None:\n" +
            "        raise TaskNotFoundError(task_id)\n" +
            "    task.mark_done()\n" +
            "    return task"
          }
        />

        <CompareSolutions
          question="Как сообщить вызывающему коду об отсутствующей задаче?"
          left={{
            title: "Смешать правило и интерфейс",
            code:
              "def complete_task(...):\n" +
              "    if task is None:\n" +
              "        print('Не найдено')\n" +
              "        return",
            note: "Функция сама выбирает текст и способ отображения.",
          }}
          right={{
            title: "Предметное исключение",
            code:
              "if task is None:\n" +
              "    raise TaskNotFoundError(task_id)",
            note: "Сервис сообщает смысл проблемы, а интерфейс выбирает реакцию.",
          }}
          preferred="right"
          explanation="Предметное исключение сохраняет разделение ответственности и подходит для консоли, тестов и будущего API."
        />

        <BugHunt
          code={
            "try:\n" +
            "    complete_task(tasks, task_id)\n" +
            "except:\n" +
            "    print(\"Не удалось завершить задачу\")"
          }
          question="Какая информация теряется из-за голого except?"
          options={[
            "Разница между ожидаемой TaskNotFoundError и дефектом вроде NameError",
            "Возможность использовать print",
            "Значение task_id автоматически становится строкой",
          ]}
          correctIndex={0}
          explanation="Широкий перехват превращает разные причины в одно сообщение и может скрыть ошибку разработчика."
          fix={
            "try:\n" +
            "    complete_task(tasks, task_id)\n" +
            "except TaskNotFoundError:\n" +
            "    print(\"Задача не найдена\")"
          }
        />

        <TrueFalse
          statement={
            <>
              Блок <code>finally</code> выполняется только тогда, когда исключения не было.
            </>
          }
          isTrue={false}
          explanation="finally выполняется при успешном и ошибочном завершении блока try и используется для обязательного завершающего действия."
        />
      </Section>

      <Section number="05" title="Долговечность и согласованность">
        <Lead>
          Сохранить данные — не значит просто вызвать <code>write_text</code>. Нужно определить, когда запись
          выполняется, что происходит при первом запуске, как распознаётся повреждённый файл и может ли память
          разойтись с диском.
        </Lead>

        <TypeCards>
          <TypeCard badge="start" title="Загрузка при старте" code="tasks = load_tasks(DATA_FILE)">
            Первый запуск возвращает пустой список только при отсутствии файла, а не при любой неизвестной ошибке.
          </TypeCard>
          <TypeCard badge="change" badgeTone="float" title="Сохранение после команды" code="save_tasks(tasks, DATA_FILE)">
            Успешное изменение состояния синхронизируется с диском до сообщения пользователю.
          </TypeCard>
          <TypeCard badge="restart" badgeTone="str" title="Проверка восстановлением" code="закрыть → запустить снова">
            Настоящая проверка долговечности требует нового процесса, а не чтения текущего списка в памяти.
          </TypeCard>
        </TypeCards>

        <StepThrough
          code={
            "tasks = load_tasks(path)\n" +
            "task = create_task(...)\n" +
            "tasks.append(task)\n" +
            "save_tasks(tasks, path)\n" +
            "print(\"Задача добавлена\")"
          }
          steps={[
            {
              line: 0,
              note: "Текущее состояние восстанавливается до показа меню.",
              vars: { tasks: "данные прошлого запуска" },
            },
            {
              line: 1,
              note: "Новый объект создаётся только после проверки входа.",
              vars: { task: "допустимый Task" },
            },
            {
              line: 2,
              note: "Сначала меняется состояние в памяти.",
              vars: { "len(tasks)": "+1" },
            },
            {
              line: 3,
              note: "Затем новое состояние записывается на диск.",
              vars: { "tasks.json": "синхронизирован" },
            },
            {
              line: 4,
              note: "Подтверждение показывается после успешной записи.",
              vars: { пользователь: "получил честный результат" },
            },
          ]}
        />

        <CompareSolutions
          question="Когда показывать сообщение об успешном добавлении?"
          left={{
            title: "До записи",
            code:
              "tasks.append(task)\n" +
              "print('Добавлено')\n" +
              "save_tasks(tasks)",
            note: "Пользователь увидит успех, даже если запись завершится ошибкой.",
          }}
          right={{
            title: "После записи",
            code:
              "tasks.append(task)\n" +
              "save_tasks(tasks)\n" +
              "print('Добавлено')",
            note: "Сообщение соответствует завершённой операции.",
          }}
          preferred="right"
          explanation="Интерфейс не должен подтверждать долговечное изменение до завершения файловой операции."
        />

        <BugHunt
          code={
            "def load_tasks(path):\n" +
            "    if not path.exists():\n" +
            "        return []\n" +
            "    text = path.read_text(encoding=\"utf-8\")\n" +
            "    return json.loads(text)"
          }
          question="Какой отдельный сценарий не обработан для существующего пустого файла?"
          options={[
            "json.loads пустой строки вызовет JSONDecodeError",
            "Path.exists всегда возвращает строку",
            "UTF-8 нельзя использовать с JSON",
          ]}
          correctIndex={0}
          explanation="Пустой файл существует, но не содержит корректного JSON-документа. Нужно заранее определить политику для этого состояния."
        />
      </Section>

      <Section number="06" title="Объектная модель без магии">
        <Lead>
          Класс Task нужен не потому, что ООП считается обязательным стилем. Он становится полезен, когда одна форма
          данных имеет устойчивые правила, повторяющиеся операции и должна защищать своё допустимое состояние.
        </Lead>

        <CompareSolutions
          question="Когда объект начинает давать практическую пользу?"
          left={{
            title: "Словарь и внешние функции",
            code:
              'task = {"title": "SQL", "priority": 3, "is_done": False}\n' +
              'mark_done(task)\n' +
              'rename_task(task, "PostgreSQL")',
            note: "Допустимо для простой записи, но правила распределены по внешним функциям.",
          }}
          right={{
            title: "Task объединяет данные и поведение",
            code:
              'task = Task("SQL", priority=3)\n' +
              'task.mark_done()\n' +
              'task.rename("PostgreSQL")',
            note: "Операции читаются как поведение конкретного объекта.",
          }}
          preferred="right"
          explanation="Класс полезен, когда помогает сосредоточить инварианты и предметные операции, а не просто заменяет фигурные скобки."
        />

        <CodeBlock
          caption="минимальная модель Task"
          code={
            "class Task:\n" +
            "    def __init__(self, task_id, title, priority, is_done=False):\n" +
            "        self.task_id = task_id\n" +
            "        self.title = title\n" +
            "        self.priority = priority\n" +
            "        self.is_done = is_done\n\n" +
            "    def mark_done(self):\n" +
            "        self.is_done = True\n\n" +
            "    def __str__(self):\n" +
            "        mark = \"x\" if self.is_done else \" \"\n" +
            "        return f\"[{mark}] {self.task_id}. {self.title}\""
          }
        />

        <MatchPairs
          prompt="Соедините элемент класса с его назначением."
          pairs={[
            { left: "class Task", right: "описание общего типа объектов" },
            { left: "Task(...) ", right: "создание конкретного экземпляра" },
            { left: "self", right: "ссылка на текущий экземпляр внутри метода" },
            { left: "self.title", right: "атрибут состояния экземпляра" },
            { left: "mark_done", right: "операция над текущей задачей" },
            { left: "__str__", right: "человекочитаемое строковое представление" },
          ]}
          explanation="Класс описывает структуру и поведение, а каждый объект хранит собственные значения атрибутов."
        />

        <BugHunt
          code={
            "class Task:\n" +
            "    def __init__(title, priority):\n" +
            "        title = title\n" +
            "        priority = priority"
          }
          question="Почему объект не получает ожидаемые атрибуты?"
          options={[
            "Первым параметром должен быть self, а значения нужно присвоить self.title и self.priority",
            "__init__ обязан возвращать словарь",
            "Класс нельзя создавать без наследования",
          ]}
          correctIndex={0}
          explanation="Локальные параметры исчезнут после вызова. Атрибуты сохраняются на текущем объекте через self."
          fix={
            "class Task:\n" +
            "    def __init__(self, title, priority):\n" +
            "        self.title = title\n" +
            "        self.priority = priority"
          }
        />

        <TrueFalse
          statement={
            <>
              После <code>second = first</code> создаётся новый независимый объект Task с теми же значениями.
            </>
          }
          isTrue={false}
          explanation="Оба имени указывают на один экземпляр. Для нового объекта нужен отдельный вызов конструктора или явное копирование."
        />
      </Section>

      <Section number="07" title="Инкапсуляция и инварианты">
        <Lead>
          Инкапсуляция не означает запретить любой доступ к данным. Её задача — не позволить объекту незаметно
          перейти в состояние, которое нарушает правила предметной области.
        </Lead>

        <TypeCards>
          <TypeCard badge="invariant" title="Правило допустимого состояния" code="1 <= priority <= 5">
            Условие должно оставаться истинным после создания и каждого изменения объекта.
          </TypeCard>
          <TypeCard badge="_value" badgeTone="float" title="Внутренний атрибут" code="self._priority">
            Подчёркивание сообщает: значение обслуживает реализацию свойства и не предназначено для случайной записи.
          </TypeCard>
          <TypeCard badge="property" badgeTone="str" title="Публичный интерфейс" code="task.priority = 5">
            Для вызывающего кода доступ выглядит как атрибут, но присваивание проходит через проверку setter.
          </TypeCard>
        </TypeCards>

        <CodeBlock
          caption="property защищает диапазон"
          code={
            "class Task:\n" +
            "    def __init__(self, title, priority):\n" +
            "        self.title = title\n" +
            "        self.priority = priority\n\n" +
            "    @property\n" +
            "    def priority(self):\n" +
            "        return self._priority\n\n" +
            "    @priority.setter\n" +
            "    def priority(self, value):\n" +
            "        if not 1 <= value <= 5:\n" +
            "            raise ValueError(\"priority должен быть от 1 до 5\")\n" +
            "        self._priority = value"
          }
        />

        <StepThrough
          code={
            'task = Task("Python", 3)\n' +
            'task.priority = 5\n' +
            'print(task.priority)\n' +
            'task.priority = 10'
          }
          steps={[
            {
              line: 0,
              note: "Конструктор использует публичное свойство и запускает ту же проверку, что будущие изменения.",
              vars: { "task._priority": "3" },
            },
            {
              line: 1,
              note: "Присваивание priority вызывает setter и принимает допустимое значение.",
              vars: { "task._priority": "5" },
            },
            {
              line: 2,
              note: "Чтение вызывает getter и возвращает внутреннее значение.",
              vars: { вывод: "5" },
            },
            {
              line: 3,
              note: "Значение 10 нарушает инвариант, поэтому setter завершает операцию исключением.",
              vars: { "task._priority": "остаётся 5" },
            },
          ]}
        />

        <CompareSolutions
          question="Почему конструктор использует self.priority, а не self._priority?"
          left={{
            title: "Обойти проверку",
            code: "self._priority = priority",
            note: "Конструктор может создать объект с недопустимым значением.",
          }}
          right={{
            title: "Использовать общий контракт",
            code: "self.priority = priority",
            note: "Создание и последующие изменения проходят одну проверку setter.",
          }}
          preferred="right"
          explanation="Единая точка проверки уменьшает дублирование и защищает инвариант на всём жизненном цикле объекта."
        />

        <FillBlank
          prompt="Сохраните проверенное значение во внутренний атрибут свойства."
          before={"self."}
          after={" = value"}
          options={["_priority", "priority", "get_priority()"]}
          answer="_priority"
          explanation="Setter записывает внутреннее поле _priority. Присваивание self.priority вызвало бы setter снова и привело к рекурсии."
        />
      </Section>

      <Section number="08" title="Качество как способность безопасно менять код">
        <Lead>
          Качество небольшого проекта измеряется не количеством абстракций. Хорошая структура помогает понять
          поведение, воспроизвести ошибку и внести изменение с ограниченным риском. Тесты фиксируют важные контракты,
          но не заменяют ясный код.
        </Lead>

        <TypeCards>
          <TypeCard badge="SRP" title="Одна основная ответственность">
            Файл или функция имеют понятную главную причину изменения.
          </TypeCard>
          <TypeCard badge="tests" badgeTone="float" title="Проверка поведения" code="arrange → act → assert">
            Тест подготавливает данные, выполняет одно действие и сравнивает наблюдаемый результат.
          </TypeCard>
          <TypeCard badge="refactor" badgeTone="str" title="Изменение структуры">
            Внешнее поведение сохраняется, а внутреннее устройство становится понятнее или удобнее для развития.
          </TypeCard>
        </TypeCards>

        <CodeBlock
          caption="первый тест модели"
          code={
            "def test_task_rejects_priority_above_five():\n" +
            "    with pytest.raises(ValueError):\n" +
            "        Task(1, \"Python\", priority=6)"
          }
        />

        <CodeBlock
          caption="первый тест хранения"
          code={
            "def test_save_and_load_tasks(tmp_path):\n" +
            "    path = tmp_path / \"tasks.json\"\n" +
            "    original = [Task(1, \"Python\", 3)]\n\n" +
            "    save_tasks(original, path)\n" +
            "    restored = load_tasks(path)\n\n" +
            "    assert restored[0].title == \"Python\"\n" +
            "    assert restored[0].priority == 3"
          }
        />

        <CompareSolutions
          question="Какой тест лучше защищает контракт?"
          left={{
            title: "Проверка реализации",
            code: "assert task._priority == 3",
            note: "Тест связан с внутренним именем и мешает безопасно менять реализацию.",
          }}
          right={{
            title: "Проверка публичного поведения",
            code: "assert task.priority == 3",
            note: "Тест использует тот же интерфейс, что остальная программа.",
          }}
          preferred="right"
          explanation="Публичный контракт должен оставаться стабильным, даже если внутреннее поле или способ хранения изменится."
        />

        <div className="lesson-check-group">
          <QuizCard
            question="Что является состоянием Persistent Planner?"
            options={["список задач и значения их полей", "только текст меню", "название файла main.py"]}
            correctIndex={0}
            explanation="Состояние описывает данные, которые меняются в ходе работы приложения."
          />
          <QuizCard
            question="Что делает json.load?"
            options={["создаёт Python-данные из JSON-файла", "создаёт экземпляры любого класса", "запускает меню"]}
            correctIndex={0}
            explanation="Восстановление объектов Task требует отдельного шага."
          />
          <QuizCard
            question="Зачем нужно предметное исключение?"
            options={[
              "сообщить вызывающему коду конкретный смысл ожидаемой проблемы",
              "скрыть traceback любой ошибки",
              "заменить return во всех функциях",
            ]}
            correctIndex={0}
            explanation="Тип исключения становится частью контракта операции."
          />
          <QuizCard
            question="Какова роль property?"
            options={[
              "сохранить удобный доступ и контролировать чтение или запись",
              "автоматически записать объект в JSON",
              "создать новый модуль",
            ]}
            correctIndex={0}
            explanation="Property позволяет оставить интерфейс атрибута и добавить поведение доступа."
          />
          <QuizCard
            question="Что должен проверять хороший unit-тест?"
            options={[
              "наблюдаемое поведение публичного контракта",
              "точное количество локальных переменных",
              "порядок строк внутри функции",
            ]}
            correctIndex={0}
            explanation="Внутреннюю реализацию можно рефакторить без изменения контракта."
          />
        </div>

        <RecallCard
          question="Сформулируйте общий путь данных Persistent Planner от запуска до повторного запуска."
          hint="Начните с load_tasks и закончите новым процессом Python."
          answer={
            <p>
              При запуске storage читает JSON и восстанавливает список Task. Команда пользователя проходит
              преобразование и проверку, сервис изменяет допустимое состояние, storage сериализует список и записывает
              файл. После завершения новый процесс снова загружает сохранённые данные.
            </p>
          }
        />

        <KeyTakeaways
          points={[
            <>Persistent Planner управляет состоянием и синхронизирует его с долговременным хранилищем.</>,
            <>Одна задача проходит формы JSON-текста, словаря, объекта Task и строки интерфейса.</>,
            <>Ввод, файл и создание модели являются границами, на которых нужны явные проверки.</>,
            <>Ожидаемое исключение является частью контракта, а неожиданный дефект нельзя тихо скрывать.</>,
            <>Класс полезен, когда объединяет устойчивую форму, инварианты и предметное поведение.</>,
            <>Property сохраняет удобный интерфейс и централизует проверку изменений.</>,
            <>Тесты должны проверять публичное поведение и позволять менять внутреннюю реализацию.</>,
          ]}
        />

        <PracticeCta text="Нарисуйте на бумаге путь одной задачи: input → Task → list → to_dict → JSON → from_dict → Task. Для каждой стрелки подпишите возможную ошибку." />
      </Section>
    </RichLesson>
  );
}
