import {
  Boxes,
  Puzzle,
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

// 36. Класс, объект, __init__ и self
export function Lesson36({ module }: { module?: string }) {
  return (
    <RichLesson>
      <RichHero
        variant="project"
        chip={module ?? "Блок 7 · Файлы, JSON и объектная модель"}
        title="Класс, объект, __init__ и self"
        intro="Перенесём модель задачи из словаря в класс Task: разделим описание типа и конкретные объекты, разберём создание экземпляра, роль __init__, ссылку self и независимое состояние нескольких задач."
        tags={[
          { icon: <Boxes size={14} />, label: "класс и экземпляры" },
          { icon: <Puzzle size={14} />, label: "__init__ · self" },
        ]}
      />
      <TheoryBridge link={"Словарь уже хранит поля Task, но класс объединяет форму создания объекта, его состояние и связанные действия."} boundary={"self не глобальная переменная и не делает класс обязательным для всего кода; он относится к объекту текущего вызова."} />

      <Section number="01" title="Когда словарь перестаёт быть достаточной моделью">
        <Lead>
          Словарь хорошо хранит небольшую запись, но его ключи являются строками без единого владельца. Любая часть
          проекта может создать <code>titel</code> вместо <code>title</code>, забыть <code>is_done</code> или записать
          приоритет другого типа. Класс объединяет форму объекта и операции, которые относятся к этой форме.
        </Lead>

        <div className="lesson-route">
          <ol>
            <li>
              <strong>Описать тип:</strong> создать класс <code className="lesson-token">Task</code> с ожидаемыми
              полями.
            </li>
            <li>
              <strong>Создать экземпляры:</strong> вызвать класс несколько раз и получить независимые объекты.
            </li>
            <li>
              <strong>Инициализировать состояние:</strong> принять значения в <code>__init__</code> и записать их в
              атрибуты через <code>self</code>.
            </li>
          </ol>
          <p>
            В конце сервисы будут работать с <code>Task</code>, но JSON-хранилище пока сможет получать словарь через
            отдельное явное преобразование.
          </p>
        </div>

        <CompareSolutions
          question="Что добавляет класс по сравнению с отдельным словарём?"
          left={{
            title: "Договор только по соглашению",
            code:
              'task = {\n' +
              '    "id": 1,\n' +
              '    "title": "SQL",\n' +
              '    "priority": 3,\n' +
              '    "is_done": False,\n' +
              '}',
            note: "Форма существует только в договорённости разработчиков.",
          }}
          right={{
            title: "Именованный тип",
            code:
              'class Task:\n' +
              '    def __init__(self, task_id, title, priority):\n' +
              '        self.id = task_id\n' +
              '        self.title = title\n' +
              '        self.priority = priority\n' +
              '        self.is_done = False',
            note: "Создание задач сосредоточено в одном месте.",
          }}
          preferred="right"
          explanation="Класс даёт модели имя и одну точку инициализации, но не отменяет необходимость продуманной валидации."
        />

        <Callout tone="info">
          Класс нужен не потому, что «ООП профессиональнее». Он полезен, когда у сущности появляется устойчивая форма
          и связанное с ней поведение.
        </Callout>
      </Section>

      <Section number="02" title="Класс — описание, объект — конкретное состояние">
        <Lead>
          Класс можно сравнить с формой карточки, а объект — с заполненной карточкой. Одно описание Task позволяет
          создать любое количество задач с разными значениями.
        </Lead>

        <TypeCards>
          <TypeCard badge="class" title="Описание типа" code={'class Task:\n    ...'}>
            Определяет, как создаются объекты и какие действия относятся к задаче.
          </TypeCard>
          <TypeCard badge="instance" badgeTone="float" title="Конкретный объект" code={'first = Task(1, "Python", 4)'}>
            Хранит состояние одной задачи.
          </TypeCard>
          <TypeCard badge="instance" badgeTone="str" title="Другой объект" code={'second = Task(2, "SQL", 3)'}>
            Создан тем же классом, но имеет независимые атрибуты.
          </TypeCard>
        </TypeCards>

        <PredictOutput
          code={
            'class Task:\n' +
            '    def __init__(self, title):\n' +
            '        self.title = title\n\n' +
            'first = Task("Python")\n' +
            'second = Task("SQL")\n' +
            'print(first.title)\n' +
            'print(second.title)'
          }
          output={"Python\nSQL"}
          hint="Каждый вызов Task(...) создаёт отдельный экземпляр."
        />

        <TrueFalse
          statement={
            <>
              Переменные <code>first</code> и <code>second</code> выше указывают на один объект, потому что созданы
              одним классом.
            </>
          }
          isTrue={false}
          explanation="Класс общий, но каждый вызов создаёт новый экземпляр со своим состоянием."
        />

        <RecallCard
          question="Чем класс отличается от созданного из него объекта?"
          answer={
            <p>
              Класс описывает способ создания и поведение типа. Объект является конкретным экземпляром этого типа и
              хранит собственные значения атрибутов.
            </p>
          }
        />
      </Section>

      <Section number="03" title="Что происходит при вызове Task(...) ">
        <Lead>
          Запись <code className="lesson-token">Task(...)</code> выглядит как вызов функции, но запускает создание
          экземпляра. Python получает новый объект, затем вызывает для него <code>__init__</code>, чтобы заполнить
          начальное состояние.
        </Lead>

        <StepThrough
          code={
            'class Task:\n' +
            '    def __init__(self, task_id, title):\n' +
            '        self.id = task_id\n' +
            '        self.title = title\n\n' +
            'task = Task(7, "Изучить классы")'
          }
          steps={[
            { line: 0, note: "Python создаёт объект класса при выполнении вызова Task(...).", vars: { объект: "новый Task" } },
            { line: 1, note: "Новый объект автоматически передаётся в параметр self.", vars: { self: "новый Task", task_id: "7", title: '"Изучить классы"' } },
            { line: 2, note: "В объекте создаётся атрибут id.", vars: { "self.id": "7" } },
            { line: 3, note: "В том же объекте создаётся атрибут title.", vars: { "self.title": '"Изучить классы"' } },
            { line: 5, note: "После инициализации ссылка на объект сохраняется в task.", vars: { "task.id": "7" } },
          ]}
        />

        <Callout>
          В учебной речи <code>__init__</code> часто называют конструктором. Точнее: объект создаётся до него, а
          <code>__init__</code> инициализирует уже созданный экземпляр.
        </Callout>

        <BugHunt
          code={
            'class Task:\n' +
            '    def __init__(task_id, title):\n' +
            '        self.id = task_id\n' +
            '        self.title = title\n\n' +
            'task = Task(1, "SQL")'
          }
          question="Почему сигнатура метода нарушена?"
          options={[
            "Первый параметр должен принять сам экземпляр",
            "__init__ не может принимать title",
            "Класс нельзя вызывать со скобками",
          ]}
          correctIndex={0}
          explanation="Python автоматически передаёт объект первым аргументом. Обычно этот параметр называют self."
          fix={
            'class Task:\n' +
            '    def __init__(self, task_id, title):\n' +
            '        self.id = task_id\n' +
            '        self.title = title'
          }
        />
      </Section>

      <Section number="04" title="self указывает на объект текущего вызова">
        <Lead>
          <code className="lesson-token">self</code> не является глобальной переменной и не означает весь класс.
          При каждом вызове метода оно указывает на тот объект, у которого вызван метод. Благодаря этому один метод
          работает с разными экземплярами.
        </Lead>

        <CompareSolutions
          question="Почему значение нужно записать в self.title?"
          left={{
            title: "Локальная переменная",
            code:
              'class Task:\n' +
              '    def __init__(self, title):\n' +
              '        title = title.strip()',
            note: "После завершения метода локальное имя исчезнет, объект не получит атрибут.",
          }}
          right={{
            title: "Состояние объекта",
            code:
              'class Task:\n' +
              '    def __init__(self, title):\n' +
              '        self.title = title.strip()',
            note: "Значение доступно через task.title после создания.",
          }}
          preferred="right"
          explanation="Префикс self сохраняет значение внутри конкретного экземпляра."
        />

        <PredictOutput
          code={
            'class Task:\n' +
            '    def __init__(self, title):\n' +
            '        self.title = title\n\n' +
            'first = Task("Python")\n' +
            'second = Task("SQL")\n' +
            'first.title = "Git"\n' +
            'print(first.title, second.title)'
          }
          output={"Git SQL"}
          hint="Изменён атрибут только объекта first."
        />

        <FillBlank
          prompt="Сохраните приоритет в атрибуте текущего объекта."
          before="        "
          after=" = priority"
          options={["self.priority", "Task.priority", "priority.self"]}
          answer="self.priority"
          explanation="self.priority создаёт или изменяет атрибут конкретного экземпляра."
        />

        <TrueFalse
          statement={
            <>
              Имя <code>self</code> технически можно заменить другим именем, но общепринятое имя нужно сохранять для
              читаемости.
            </>
          }
          isTrue={true}
          explanation="Python ориентируется на позицию параметра, однако стандартное имя self является важной договорённостью."
        />
      </Section>

      <Section number="05" title="Параметр и атрибут могут иметь одинаковое имя">
        <Lead>
          В строке <code className="lesson-token">self.title = title</code> справа находится параметр текущего вызова,
          а слева — атрибут объекта. Одинаковое имя подчёркивает, что значение переносится с границы создания внутрь
          модели.
        </Lead>

        <CodeBlock
          caption="полная начальная модель Task"
          code={
            'class Task:\n' +
            '    def __init__(self, task_id, title, priority, is_done=False):\n' +
            '        self.id = task_id\n' +
            '        self.title = title.strip()\n' +
            '        self.priority = priority\n' +
            '        self.is_done = is_done'
          }
        />

        <MatchPairs
          prompt="Соедините фрагмент с его ролью."
          pairs={[
            { left: "title в параметрах __init__", right: "входное значение вызова" },
            { left: "self.title", right: "атрибут конкретного объекта" },
            { left: "Task", right: "класс модели" },
            { left: "Task(1, 'SQL', 3)", right: "создание экземпляра" },
          ]}
          explanation="Параметр существует во время вызова, атрибут продолжает жить вместе с объектом."
        />

        <BugHunt
          code={
            'class Task:\n' +
            '    def __init__(self, task_id, title):\n' +
            '        self.id = id\n' +
            '        self.title = title'
          }
          question="Почему self.id получает не переданный task_id?"
          options={[
            "Справа использовано встроенное имя id вместо параметра task_id",
            "Атрибут id запрещён",
            "self нельзя использовать в __init__",
          ]}
          correctIndex={0}
          explanation="Нужно присвоить именно значение параметра task_id."
          fix={
            'class Task:\n' +
            '    def __init__(self, task_id, title):\n' +
            '        self.id = task_id\n' +
            '        self.title = title'
          }
        />
      </Section>

      <Section number="06" title="Одинаковая форма не означает одинаковые объекты">
        <Lead>
          Два экземпляра могут содержать равные значения, но оставаться разными объектами. На этом этапе оператор
          <code>==</code> для пользовательского класса не сравнивает автоматически все атрибуты так, как это делает
          словарь.
        </Lead>

        <PredictOutput
          code={
            'class Task:\n' +
            '    def __init__(self, title):\n' +
            '        self.title = title\n\n' +
            'first = Task("SQL")\n' +
            'second = Task("SQL")\n' +
            'alias = first\n' +
            'print(first is second)\n' +
            'print(first is alias)'
          }
          output={"False\nTrue"}
          hint="is проверяет идентичность объекта, а не равенство атрибутов."
        />

        <TypeCards>
          <TypeCard badge="is" title="Один объект" code={'first is alias  # True'}>
            Проверяется, ведут ли две ссылки к одному экземпляру.
          </TypeCard>
          <TypeCard badge="attrs" badgeTone="float" title="Равные поля" code={'first.title == second.title'}>
            Можно сравнить конкретные значения явно.
          </TypeCard>
          <TypeCard badge="copy" badgeTone="str" title="Новый экземпляр" code={'Task(first.title)'}>
            Создаёт независимый объект с похожим состоянием.
          </TypeCard>
        </TypeCards>

        <RecallCard
          question="Что произойдёт после alias = task и alias.is_done = True?"
          answer={
            <p>
              <code>alias</code> и <code>task</code> указывают на один экземпляр. Изменение атрибута через alias будет
              видно и через task.
            </p>
          }
        />
      </Section>

      <Section number="07" title="Переход от словаря к объекту без поломки JSON">
        <Lead>
          Модуль json не умеет автоматически сериализовать Task. На границе хранения объект нужно явно превратить в
          словарь поддерживаемых значений, а после чтения создать новый экземпляр из словаря.
        </Lead>

        <CodeBlock
          caption="временные функции преобразования"
          code={
            'def task_to_dict(task):\n' +
            '    return {\n' +
            '        "id": task.id,\n' +
            '        "title": task.title,\n' +
            '        "priority": task.priority,\n' +
            '        "is_done": task.is_done,\n' +
            '    }\n\n' +
            'def task_from_dict(data):\n' +
            '    return Task(\n' +
            '        data["id"],\n' +
            '        data["title"],\n' +
            '        data["priority"],\n' +
            '        data.get("is_done", False),\n' +
            '    )'
          }
        />

        <CodeSequence
          title="Восстановите список объектов"
          prompt="Расположите шаги загрузки от JSON до экземпляров Task."
          pieces={[
            { id: "load", code: "raw_tasks = json.load(file)" },
            { id: "result", code: "tasks = []" },
            { id: "loop", code: "for data in raw_tasks:" },
            { id: "create", code: "    tasks.append(task_from_dict(data))" },
            { id: "return", code: "return tasks" },
          ]}
          correctOrder={["load", "result", "loop", "create", "return"]}
          explanation="JSON сначала возвращает словари, затем каждый словарь становится отдельным объектом Task."
        />

        <Callout tone="info">
          В следующем уроке преобразования можно сделать методами модели. Сейчас важнее увидеть границу: объект
          удобен в программе, словарь удобен для JSON.
        </Callout>
      </Section>

      <Section number="08" title="Проверка базовой объектной модели">
        <div className="lesson-check-group">
          <QuizCard
            question="Что описывает класс?"
            options={["тип и способ создания объектов", "один конкретный JSON-файл", "только функцию print"]}
            correctIndex={0}
            explanation="Класс задаёт общую модель для экземпляров."
          />
          <QuizCard
            question="Когда вызывается __init__?"
            options={["при создании экземпляра", "при каждом чтении атрибута", "только при импорте json"]}
            correctIndex={0}
            explanation="Python вызывает метод для инициализации нового объекта."
          />
          <QuizCard
            question="На что указывает self?"
            options={["на объект текущего вызова", "на все объекты класса", "на файл models.py"]}
            correctIndex={0}
            explanation="Каждый вызов метода получает конкретный экземпляр первым аргументом."
          />
          <QuizCard
            question="Почему Task нельзя напрямую передать json.dump?"
            options={["это пользовательский объект без стандартного JSON-представления", "классы нельзя хранить в списке", "JSON принимает только строки"]}
            correctIndex={0}
            explanation="Объект нужно преобразовать в dict/list и простые значения."
          />
        </div>

        <KeyTakeaways
          points={[
            <>Класс описывает тип, объект хранит конкретное состояние.</>,
            <>Каждый вызов класса создаёт отдельный экземпляр.</>,
            <><code>__init__</code> инициализирует новый объект.</>,
            <><code>self</code> указывает на экземпляр текущего вызова.</>,
            <>Атрибут создаётся присваиванием вида <code>self.title = title</code>.</>,
            <>Простое присваивание объекта создаёт вторую ссылку, а не копию.</>,
            <>Для JSON объект явно переводится в словарь и восстанавливается обратно.</>,
          ]}
        />

        <PracticeCta text="Создайте models.py с классом Task. Перенесите id, title, priority и is_done в атрибуты, создайте три независимых объекта и добавьте функции task_to_dict/task_from_dict для совместимости с JSON." />
      </Section>
    </RichLesson>
  );
}

// 37. Атрибуты, методы и __str__
