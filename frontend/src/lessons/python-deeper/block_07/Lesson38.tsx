import {
  LockKeyhole,
  ShieldCheck,
} from "lucide-react";
import {
  BranchExplorer,
  BugHunt,
  Callout,
  CodeBlock,
  CodeSequence,
  CompareSolutions,
  FillBlank,
  KeyTakeaways,
  Lead,
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
  TheoryBridge,
} from "../../shared";

// 38. Инкапсуляция, геттеры, сеттеры и property
export function Lesson38({ module }: { module?: string }) {
  return (
    <RichLesson>
      <RichHero
        variant="project"
        chip={module ?? "Блок 7 · Файлы, JSON и объектная модель"}
        title="Инкапсуляция, геттеры, сеттеры и property"
        intro="Защитим допустимое состояние Task: разберём публичный интерфейс и внутренние атрибуты, добавим явные геттеры и сеттеры, затем сохраним удобный синтаксис через @property и проведём все изменения через единые правила валидации."
        tags={[
          { icon: <LockKeyhole size={14} />, label: "границы объекта" },
          { icon: <ShieldCheck size={14} />, label: "property и инварианты" },
        ]}
      />
      <TheoryBridge link={"Модель должна не только хранить данные, но и защищать правило их изменения: setter проверяет значение, property сохраняет удобный доступ."} boundary={"Подчёркивание в имени — соглашение, не защита; ценность инкапсуляции в одном месте для правила изменения."} />

      <Section number="01" title="Инкапсуляция защищает правила модели">
        <Lead>
          Пока любой код может выполнить <code className="lesson-token">task.priority = -100</code> или записать в
          title пустую строку. Объект продолжит существовать, но перестанет соответствовать правилам StudyHub.
          Инкапсуляция направляет чтение и изменение через согласованный публичный интерфейс.
        </Lead>

        <div className="lesson-route">
          <ol>
            <li>
              <strong>Определить инварианты:</strong> название непустое, приоритет от 1 до 5, id положительный.
            </li>
            <li>
              <strong>Скрыть внутреннюю запись:</strong> хранить значения в <code className="lesson-token">_title</code>
              и <code className="lesson-token">_priority</code> по соглашению о внутреннем использовании.
            </li>
            <li>
              <strong>Открыть контролируемый доступ:</strong> сначала через методы, затем через
              <code className="lesson-token">@property</code> и сеттер.
            </li>
          </ol>
          <p>
            Итогом станет Task, который не принимает некорректное состояние ни при создании, ни при последующем
            изменении, ни при восстановлении из JSON.
          </p>
        </div>

        <TypeCards>
          <TypeCard badge="state" title="Состояние" code={'_title\n_priority\n_is_done'}>
            Внутренние данные объекта, которые должны подчиняться правилам модели.
          </TypeCard>
          <TypeCard badge="public" badgeTone="float" title="Публичный интерфейс" code={'task.title\ntask.mark_done()'}>
            Стабильные операции, которыми пользуются services и main.
          </TypeCard>
          <TypeCard badge="invariant" badgeTone="str" title="Условие корректности" code={'1 <= priority <= 5'}>
            Правило должно оставаться истинным на протяжении жизни объекта.
          </TypeCard>
        </TypeCards>

        <Callout tone="info">
          Инкапсуляция не означает «запретить всё внешнему коду». Она означает предоставить ясный способ работы, при
          котором объект сохраняет корректное состояние.
        </Callout>
      </Section>

      <Section number="02" title="Подчёркивание обозначает внутренний атрибут">
        <Lead>
          В Python одно начальное подчёркивание является соглашением: атрибут предназначен для внутреннего
          использования класса. Язык технически не запрещает доступ, но разработчик видит границу и понимает, что
          прямое изменение может нарушить контракт.
        </Lead>

        <CompareSolutions
          question="Как показать, что запись должна проходить через правила класса?"
          left={{
            title: "Полностью открытый атрибут",
            code:
              'task.priority = 100\n' +
              'print(task.priority)',
            note: "Любое значение записывается без проверки.",
          }}
          right={{
            title: "Внутреннее хранение",
            code:
              'self._priority = checked_priority\n' +
              'print(task.priority)',
            note: "Внешний интерфейс отделён от способа хранения.",
          }}
          preferred="right"
          explanation="Подчёркивание сообщает о внутренней детали, а публичное имя priority можно связать с property."
        />

        <TrueFalse
          statement={
            <>
              Атрибут <code>_priority</code> становится абсолютно недоступным за пределами класса.
            </>
          }
          isTrue={false}
          explanation="Это соглашение, а не жёсткий модификатор доступа. Ответственный код не обходит публичный интерфейс без необходимости."
        />

        <BugHunt
          code={
            'class Task:\n' +
            '    def __init__(self, priority):\n' +
            '        self._priority = priority\n\n' +
            'task = Task(3)\n' +
            'task._priority = -5'
          }
          question="Почему одно подчёркивание не гарантирует корректность?"
          options={[
            "В Python это только соглашение, прямой доступ технически возможен",
            "Отрицательные числа всегда превращаются в положительные",
            "__init__ запрещает последующие изменения",
          ]}
          correctIndex={0}
          explanation="Корректность обеспечивает публичный интерфейс и дисциплина использования, а не магическая блокировка имени."
        />

        <RecallCard
          question="Зачем тогда использовать _priority, если Python не запрещает доступ?"
          answer={
            <p>
              Имя отделяет внутреннее представление от публичного API. Это позволяет позже изменить хранение или
              добавить проверки, не переписывая все обычные обращения <code>task.priority</code>.
            </p>
          }
        />
      </Section>

      <Section number="03" title="Явный геттер возвращает значение">
        <Lead>
          Геттер является обычным методом чтения. Он полезен как первый учебный шаг: видно, что внешний код вызывает
          действие, а класс решает, какое значение вернуть. Но тривиальный геттер для каждого поля может сделать
          Python-код избыточным.
        </Lead>

        <CodeBlock
          caption="явный метод чтения"
          code={
            'class Task:\n' +
            '    def __init__(self, title):\n' +
            '        self._title = title\n\n' +
            '    def get_title(self):\n' +
            '        return self._title\n\n' +
            'task = Task("Python")\n' +
            'print(task.get_title())'
          }
        />

        <PredictOutput
          code={
            'class Task:\n' +
            '    def __init__(self, priority):\n' +
            '        self._priority = priority\n\n' +
            '    def get_priority(self):\n' +
            '        return self._priority\n\n' +
            'task = Task(4)\n' +
            'print(task.get_priority())'
          }
          output={"4"}
          hint="Метод только читает внутренний атрибут и возвращает его."
        />

        <CompareSolutions
          question="Нужен ли отдельный get_id(), если чтение id не требует логики?"
          left={{
            title: "Метод для каждого поля",
            code: 'task.get_id()\ntask.get_title()\ntask.get_priority()',
            note: "Много церемониального кода без дополнительного правила.",
          }}
          right={{
            title: "Свойства Python",
            code: 'task.id\ntask.title\ntask.priority',
            note: "Читается как атрибут, но класс может выполнить код property.",
          }}
          preferred="right"
          explanation="Property сохраняет естественный синтаксис доступа и оставляет место для логики."
        />

        <Callout>
          Геттер не должен неожиданно менять объект или записывать файл. Операция чтения должна оставаться
          предсказуемой.
        </Callout>
      </Section>

      <Section number="04" title="Сеттер проверяет до изменения">
        <Lead>
          Сеттер получает новое значение, проверяет его и только после успеха заменяет внутренний атрибут. Если
          проверка не пройдена, старое корректное состояние должно сохраниться.
        </Lead>

        <StepThrough
          code={
            'class Task:\n' +
            '    def set_priority(self, value):\n' +
            '        if not 1 <= value <= 5:\n' +
            '            raise ValueError("Приоритет должен быть от 1 до 5")\n' +
            '        self._priority = value\n\n' +
            'task.set_priority(4)'
          }
          steps={[
            { line: 6, note: "В метод передаётся новое значение 4.", vars: { value: "4" } },
            { line: 2, note: "Проверка диапазона проходит.", vars: { условие: "False для ветки ошибки" } },
            { line: 4, note: "Только после проверки изменяется внутренний атрибут.", vars: { "task._priority": "4" } },
          ]}
        />

        <BranchExplorer
          code={
            'cleaned = value.strip()\n' +
            'if not cleaned:\n' +
            '    raise ValueError("Пустое название")\n' +
            'self._title = cleaned\n' +
            'return self._title'
          }
          scenarios={[
            { label: 'value = "  JSON  "', activeLine: 4, output: "сохраняется JSON" },
            { label: 'value = "   "', activeLine: 2, output: "ValueError, старое значение не меняется" },
          ]}
        />

        <BugHunt
          code={
            'def set_title(self, value):\n' +
            '    self._title = value.strip()\n' +
            '    if not self._title:\n' +
            '        raise ValueError("Пустое название")'
          }
          question="Почему порядок действий опасен?"
          options={[
            "Некорректное значение записывается до проверки",
            "strip нельзя использовать в методе",
            "ValueError удаляет объект",
          ]}
          correctIndex={0}
          explanation="При исключении объект уже содержит пустое название. Сначала проверяют локальное значение, затем присваивают."
          fix={
            'def set_title(self, value):\n' +
            '    cleaned = value.strip()\n' +
            '    if not cleaned:\n' +
            '        raise ValueError("Пустое название")\n' +
            '    self._title = cleaned'
          }
        />

        <CodeSequence
          title="Соберите безопасный сеттер"
          prompt="Проверка должна завершиться до изменения объекта."
          pieces={[
            { id: "clean", code: "cleaned = value.strip()" },
            { id: "check", code: "if not cleaned:" },
            { id: "raise", code: '    raise ValueError("Пустое название")' },
            { id: "assign", code: "self._title = cleaned" },
          ]}
          correctOrder={["clean", "check", "raise", "assign"]}
          explanation="Локальная переменная позволяет проверить кандидата, не разрушая прежнее состояние."
        />
      </Section>

      <Section number="05" title="property сохраняет синтаксис обычного атрибута">
        <Lead>
          Декоратор <code className="lesson-token">@property</code> превращает метод чтения в управляемый атрибут.
          Внешний код пишет <code>task.priority</code>, но Python вызывает метод. Сеттер с тем же публичным именем
          перехватывает присваивание <code>task.priority = value</code>.
        </Lead>

        <CodeBlock
          caption="свойство priority"
          code={
            'class Task:\n' +
            '    @property\n' +
            '    def priority(self):\n' +
            '        return self._priority\n\n' +
            '    @priority.setter\n' +
            '    def priority(self, value):\n' +
            '        if not isinstance(value, int):\n' +
            '            raise TypeError("Приоритет должен быть int")\n' +
            '        if not 1 <= value <= 5:\n' +
            '            raise ValueError("Приоритет должен быть от 1 до 5")\n' +
            '        self._priority = value'
          }
        />

        <StepThrough
          code={
            'task.priority = 5\n' +
            'print(task.priority)'
          }
          steps={[
            { line: 0, note: "Присваивание вызывает метод, отмеченный @priority.setter.", vars: { value: "5" } },
            { line: 0, note: "После проверок сеттер записывает self._priority.", vars: { "task._priority": "5" } },
            { line: 1, note: "Чтение вызывает метод, отмеченный @property.", vars: { вывод: "5" } },
          ]}
        />

        <FillBlank
          prompt="Свяжите сеттер с уже объявленным свойством title."
          before="    @"
          after=".setter"
          options={["title", "_title", "property"]}
          answer="title"
          explanation="Имя сеттера должно ссылаться на публичное property title."
        />

        <TrueFalse
          statement={
            <>
              После добавления property внешний код обязан заменить <code>task.priority</code> на
              <code>task.get_priority()</code>.
            </>
          }
          isTrue={false}
          explanation="Преимущество property в сохранении привычного синтаксиса атрибута."
        />
      </Section>

      <Section number="06" title="__init__ использует те же публичные правила">
        <Lead>
          Не нужно дублировать проверку при создании и при последующем изменении. Инициализатор может присваивать
          значения через property: <code className="lesson-token">self.priority = priority</code>. Тогда срабатывает
          тот же сеттер и объект нельзя создать с нарушенным инвариантом.
        </Lead>

        <CompareSolutions
          question="Как избежать двух разных проверок приоритета?"
          left={{
            title: "Обход property",
            code:
              'def __init__(self, priority):\n' +
              '    self._priority = priority',
            note: "Некорректное значение попадёт в объект без сеттера.",
          }}
          right={{
            title: "Единый публичный путь",
            code:
              'def __init__(self, priority):\n' +
              '    self.priority = priority',
            note: "Присваивание вызывает @priority.setter.",
          }}
          preferred="right"
          explanation="Все точки изменения используют одно правило, поэтому поведение не расходится."
        />

        <CodeBlock
          caption="инициализация через свойства"
          code={
            'class Task:\n' +
            '    def __init__(self, task_id, title, priority, is_done=False):\n' +
            '        if not isinstance(task_id, int) or task_id <= 0:\n' +
            '            raise ValueError("id должен быть положительным int")\n' +
            '        self._id = task_id\n' +
            '        self.title = title\n' +
            '        self.priority = priority\n' +
            '        self._is_done = bool(is_done)'
          }
        />

        <PredictOutput
          code={
            'try:\n' +
            '    task = Task(1, "Python", 9)\n' +
            'except ValueError as error:\n' +
            '    print(error)'
          }
          output={"Приоритет должен быть от 1 до 5"}
          hint="__init__ присваивает через priority property, поэтому вызывается сеттер."
        />

        <Callout>
          Не создавайте объект частично, а затем не пытайтесь «довалидировать» его в services. Модель должна защищать
          свои базовые инварианты самостоятельно.
        </Callout>
      </Section>

      <Section number="07" title="Вычисляемое property не обязано храниться">
        <Lead>
          Свойство может вычислять значение из других атрибутов. Например, статусная метка или признак высокого
          приоритета не требуют отдельного поля: иначе сохранённое значение может разойтись с исходными данными.
        </Lead>

        <CodeBlock
          caption="свойства только для чтения"
          code={
            'class Task:\n' +
            '    @property\n' +
            '    def is_high_priority(self):\n' +
            '        return self.priority >= 4\n\n' +
            '    @property\n' +
            '    def status_mark(self):\n' +
            '        return "x" if self.is_done else " "'
          }
        />

        <PredictOutput
          code={
            'task = Task(1, "Python", 4)\n' +
            'print(task.is_high_priority)\n' +
            'print(task.status_mark)\n' +
            'task.mark_done()\n' +
            'print(task.status_mark)'
          }
          output={"True\n \nx"}
          hint="У вычисляемых свойств нет круглых скобок и отдельного сохранённого значения."
        />

        <BugHunt
          code={
            'task.is_high_priority = False'
          }
          question="Почему присваивание свойству только для чтения недопустимо?"
          options={[
            "Для property не объявлен setter, а значение вычисляется из priority",
            "False нельзя присваивать объекту",
            "Все property должны храниться в JSON",
          ]}
          correctIndex={0}
          explanation="Чтобы изменить результат, нужно изменить исходный priority через его контролируемый сеттер."
          fix={'task.priority = 2\nprint(task.is_high_priority)  # False'}
        />

        <RecallCard
          question="Почему is_high_priority лучше вычислять, а не сохранять отдельным bool?"
          answer={
            <p>
              Результат полностью определяется priority. При хранении двух полей пришлось бы синхронизировать их при
              каждом изменении, а вычисляемое property всегда отражает актуальное значение.
            </p>
          }
        />
      </Section>

      <Section number="08" title="Финальная модель блока и интеграция с JSON">
        <Lead>
          Финальный Task принимает данные через единые свойства, предоставляет безопасные операции и возвращает
          обычный словарь для storage. При загрузке JSON создание Task снова запускает те же проверки.
        </Lead>

        <CodeBlock
          caption="models.py: итог блока 7"
          code={
            'class Task:\n' +
            '    def __init__(self, task_id, title, priority, is_done=False):\n' +
            '        if not isinstance(task_id, int) or task_id <= 0:\n' +
            '            raise ValueError("Некорректный id")\n' +
            '        self._id = task_id\n' +
            '        self.title = title\n' +
            '        self.priority = priority\n' +
            '        self._is_done = bool(is_done)\n\n' +
            '    @property\n' +
            '    def id(self):\n' +
            '        return self._id\n\n' +
            '    @property\n' +
            '    def title(self):\n' +
            '        return self._title\n\n' +
            '    @title.setter\n' +
            '    def title(self, value):\n' +
            '        cleaned = value.strip()\n' +
            '        if not cleaned:\n' +
            '            raise ValueError("Пустое название")\n' +
            '        self._title = cleaned\n\n' +
            '    @property\n' +
            '    def priority(self):\n' +
            '        return self._priority\n\n' +
            '    @priority.setter\n' +
            '    def priority(self, value):\n' +
            '        if not isinstance(value, int):\n' +
            '            raise TypeError("Приоритет должен быть int")\n' +
            '        if not 1 <= value <= 5:\n' +
            '            raise ValueError("Приоритет должен быть от 1 до 5")\n' +
            '        self._priority = value\n\n' +
            '    @property\n' +
            '    def is_done(self):\n' +
            '        return self._is_done\n\n' +
            '    def mark_done(self):\n' +
            '        self._is_done = True\n\n' +
            '    def __str__(self):\n' +
            '        mark = "x" if self.is_done else " "\n' +
            '        return f"[{mark}] {self.id}. {self.title}"\n\n' +
            '    def to_dict(self):\n' +
            '        return {\n' +
            '            "id": self.id,\n' +
            '            "title": self.title,\n' +
            '            "priority": self.priority,\n' +
            '            "is_done": self.is_done,\n' +
            '        }'
          }
        />

        <div className="lesson-check-group">
          <QuizCard
            question="Что обозначает _priority?"
            options={["внутреннюю деталь по соглашению", "абсолютно закрытое поле", "атрибут модуля json"]}
            correctIndex={0}
            explanation="Одно подчёркивание просит использовать публичный интерфейс класса."
          />
          <QuizCard
            question="В каком порядке работает безопасный сеттер?"
            options={["подготовить, проверить, присвоить", "присвоить, затем проверить", "сохранить JSON, затем проверить"]}
            correctIndex={0}
            explanation="Объект не должен получать некорректное промежуточное состояние."
          />
          <QuizCard
            question="Что делает @property?"
            options={["даёт методу синтаксис чтения атрибута", "автоматически сохраняет JSON", "создаёт новый класс"]}
            correctIndex={0}
            explanation="Чтение task.priority вызывает метод priority без круглых скобок."
          />
          <QuizCard
            question="Почему __init__ присваивает self.priority = priority?"
            options={["чтобы использовать тот же сеттер", "чтобы обойти проверку", "чтобы создать глобальную переменную"]}
            correctIndex={0}
            explanation="Создание и последующие изменения подчиняются одному правилу."
          />
        </div>

        <KeyTakeaways
          points={[
            <>Инкапсуляция отделяет публичный интерфейс от внутреннего хранения.</>,
            <>Одно подчёркивание обозначает внутреннюю деталь по соглашению Python.</>,
            <>Геттер читает значение, сеттер проверяет кандидата до присваивания.</>,
            <><code>@property</code> сохраняет синтаксис обычного атрибута.</>,
            <><code>@name.setter</code> контролирует присваивание публичному свойству.</>,
            <><code>__init__</code> использует те же свойства и не дублирует валидацию.</>,
            <>Вычисляемое property не нужно отдельно хранить и синхронизировать.</>,
            <>Восстановление Task из JSON снова проверяет инварианты модели.</>,
          ]}
        />

        <PracticeCta text="Переведите title и priority на свойства с внутренними атрибутами. Проверьте создание с пустым title, приоритетами 0 и 6, успешное изменение, сохранение старого значения после ошибки, вычисляемый is_high_priority и загрузку некорректной записи из JSON." />
      </Section>
    </RichLesson>
  );
}
