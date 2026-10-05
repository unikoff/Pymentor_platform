import {
  FileText,
  Wrench,
} from "lucide-react";
import {
  BranchExplorer,
  BugHunt,
  Callout,
  CodeBlock,
  CodeSequence,
  CompareSolutions,
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
  TheoryBridge,
} from "../../shared";

// 37. Атрибуты, методы и __str__
export function Lesson37({ module }: { module?: string }) {
  return (
    <RichLesson>
      <RichHero
        variant="project"
        chip={module ?? "Блок 7 · Файлы, JSON и объектная модель"}
        title="Атрибуты, методы и __str__"
        intro="Добавим модели Task поведение: разберём атрибуты экземпляра и класса, вызов методов через объект, изменение собственного состояния, возврат результата, строковое представление __str__ и подготовку словаря для JSON."
        tags={[
          { icon: <Wrench size={14} />, label: "состояние и методы" },
          { icon: <FileText size={14} />, label: "__str__ и формат" },
        ]}
      />
      <TheoryBridge link={"Объекты Task теперь независимы, поэтому методы могут менять состояние именно своего экземпляра и возвращать вычисленный результат."} boundary={"Атрибут класса разделяется всеми объектами, атрибут экземпляра — нет, даже если имена похожи."} />

      <Section number="01" title="Объект объединяет данные и связанные действия">
        <Lead>
          На прошлом занятии Task только хранил значения. Но завершение задачи, изменение названия и форматирование
          карточки относятся именно к задаче. Метод помещает такое действие рядом с состоянием, которое оно читает
          или изменяет.
        </Lead>

        <div className="lesson-route">
          <ol>
            <li>
              <strong>Разделить атрибуты:</strong> понять, какие значения принадлежат каждому объекту, а какие общие
              для класса.
            </li>
            <li>
              <strong>Добавить методы:</strong> выполнять операции через <code className="lesson-token">task.method()</code>
              и явно возвращать результат.
            </li>
            <li>
              <strong>Определить текст:</strong> реализовать <code className="lesson-token">__str__</code>, чтобы
              <code>print(task)</code> показывал карточку, а не технический адрес объекта.
            </li>
          </ol>
          <p>
            Итоговая модель будет сама уметь завершаться, менять название, форматироваться и превращаться в
            сериализуемый словарь.
          </p>
        </div>

        <CompareSolutions
          question="Где логичнее разместить операцию завершения одной задачи?"
          left={{
            title: "Внешняя функция",
            code:
              'def mark_task_done(task):\n' +
              '    task.is_done = True\n\n' +
              'mark_task_done(task)',
            note: "Допустимо, но действие отделено от модели, к которой относится.",
          }}
          right={{
            title: "Метод объекта",
            code:
              'class Task:\n' +
              '    def mark_done(self):\n' +
              '        self.is_done = True\n\n' +
              'task.mark_done()',
            note: "Вызов читается как действие конкретной задачи.",
          }}
          preferred="right"
          explanation="Метод полезен, когда действие естественно принадлежит модели и работает с её атрибутами."
        />

        <Callout tone="info">
          Не каждую функцию нужно превращать в метод. Сохранение списка задач по-прежнему относится к storage, а
          не к одному объекту Task.
        </Callout>
      </Section>

      <Section number="02" title="Атрибут экземпляра хранится у конкретного объекта">
        <Lead>
          Атрибуты <code>id</code>, <code>title</code>, <code>priority</code> и <code>is_done</code> описывают одну
          конкретную задачу. Их значения создаются через <code>self</code> и могут отличаться у каждого экземпляра.
        </Lead>

        <CodeBlock
          caption="атрибуты экземпляра"
          code={
            'class Task:\n' +
            '    def __init__(self, task_id, title, priority):\n' +
            '        self.id = task_id\n' +
            '        self.title = title\n' +
            '        self.priority = priority\n' +
            '        self.is_done = False\n\n' +
            'first = Task(1, "Python", 5)\n' +
            'second = Task(2, "SQL", 3)'
          }
        />

        <StepThrough
          code={
            'first = Task(1, "Python", 5)\n' +
            'second = Task(2, "SQL", 3)\n' +
            'second.priority = 4\n' +
            'print(first.priority)\n' +
            'print(second.priority)'
          }
          steps={[
            { line: 0, note: "Первый объект получает собственный priority.", vars: { "first.priority": "5" } },
            { line: 1, note: "Второй объект получает другое значение.", vars: { "second.priority": "3" } },
            { line: 2, note: "Меняется атрибут только второго экземпляра.", vars: { "second.priority": "4" } },
            { line: 3, note: "Первый объект не изменился.", vars: { вывод: "5" } },
            { line: 4, note: "Второй хранит новое значение.", vars: { вывод: "5 ⏎ 4" } },
          ]}
        />

        <BugHunt
          code={
            'class Task:\n' +
            '    def __init__(self, title):\n' +
            '        self.title = title\n\n' +
            'task = Task("SQL")\n' +
            'print(task.priority)'
          }
          question="Почему возникает AttributeError?"
          options={[
            "Атрибут priority не был создан у объекта",
            "Строка SQL не поддерживает атрибуты",
            "print удаляет priority",
          ]}
          correctIndex={0}
          explanation="Обращение возможно только к атрибуту, который был создан в __init__ или позже."
          fix={
            'class Task:\n' +
            '    def __init__(self, title, priority):\n' +
            '        self.title = title\n' +
            '        self.priority = priority'
          }
        />
      </Section>

      <Section number="03" title="Атрибут класса общий для всех экземпляров">
        <Lead>
          Иногда значение относится к типу целиком. Например, допустимые статусы одинаковы для всех задач. Такое
          значение можно записать в теле класса, вне методов. Но изменяемые списки и словари как атрибуты класса
          требуют осторожности, потому что объект у них общий.
        </Lead>

        <TypeCards>
          <TypeCard badge="instance" title="Уникальное состояние" code={'self.title = title'}>
            Создаётся отдельно у каждого экземпляра.
          </TypeCard>
          <TypeCard badge="class" badgeTone="float" title="Общее правило" code={'DEFAULT_PRIORITY = 3'}>
            Доступно через <code>Task.DEFAULT_PRIORITY</code> и через экземпляр.
          </TypeCard>
          <TypeCard badge="danger" badgeTone="str" title="Общий изменяемый объект" code={'tags = []'}>
            Один список будет разделён всеми экземплярами, если не переопределить его на объекте.
          </TypeCard>
        </TypeCards>

        <PredictOutput
          code={
            'class Task:\n' +
            '    category = "study"\n\n' +
            '    def __init__(self, title):\n' +
            '        self.title = title\n\n' +
            'first = Task("Python")\n' +
            'second = Task("SQL")\n' +
            'print(first.category, second.category)\n' +
            'Task.category = "backend"\n' +
            'print(first.category, second.category)'
          }
          output={"study study\nbackend backend"}
          hint="Оба объекта читают значение из класса, пока у них нет собственного category."
        />

        <TrueFalse
          statement={
            <>
              Значение <code>self.title</code> следует сделать атрибутом класса, потому что название есть у каждой
              задачи.
            </>
          }
          isTrue={false}
          explanation="Наличие поля у всех объектов не делает значение общим: у каждой задачи своё название."
        />

        <RecallCard
          question="Какой атрибут выбрать для DEFAULT_PRIORITY?"
          answer={
            <p>
              Если это единая настройка по умолчанию для типа Task, подойдёт атрибут класса. Фактический приоритет
              конкретной задачи всё равно сохраняется как <code>self.priority</code>.
            </p>
          }
        />
      </Section>

      <Section number="04" title="Метод получает объект автоматически">
        <Lead>
          В определении метода первым параметром записывается <code>self</code>. При вызове
          <code className="lesson-token">task.mark_done()</code> Python автоматически передаёт объект task в этот
          параметр. Поэтому вручную указывать task внутри скобок не нужно.
        </Lead>

        <StepThrough
          code={
            'class Task:\n' +
            '    def mark_done(self):\n' +
            '        self.is_done = True\n' +
            '        return self.is_done\n\n' +
            'task = Task(1, "Python", 4)\n' +
            'result = task.mark_done()'
          }
          steps={[
            { line: 5, note: "Создан объект с is_done=False.", vars: { "task.is_done": "False" } },
            { line: 6, note: "Вызов через точку передаёт task как self.", vars: { self: "task" } },
            { line: 2, note: "Метод меняет состояние этого объекта.", vars: { "task.is_done": "True" } },
            { line: 3, note: "Возвращённое значение сохраняется отдельно.", vars: { result: "True" } },
          ]}
        />

        <CompareSolutions
          question="Как правильно вызвать метод экземпляра?"
          left={{
            title: "Обычный вызов через объект",
            code: 'task.mark_done()',
            note: "Python сам передаёт task как self.",
          }}
          right={{
            title: "Явный вызов через класс",
            code: 'Task.mark_done(task)',
            note: "Технически возможен, но обычно читается хуже.",
          }}
          preferred="left"
          explanation="Повседневный интерфейс метода строится через экземпляр: объект.метод()."
        />

        <BugHunt
          code={
            'class Task:\n' +
            '    def mark_done(self):\n' +
            '        self.is_done = True\n\n' +
            'task.mark_done(task)'
          }
          question="Почему передан лишний аргумент?"
          options={[
            "task уже передаётся автоматически как self",
            "методы не могут менять bool",
            "mark_done должен быть функцией",
          ]}
          correctIndex={0}
          explanation="В скобках указываются только дополнительные аргументы после self."
          fix={'task.mark_done()'}
        />
      </Section>

      <Section number="05" title="Метод может менять состояние или вычислять результат">
        <Lead>
          Контракт метода должен быть понятен из имени. <code>mark_done()</code> изменяет объект,
          <code>is_high_priority()</code> только отвечает на вопрос, а <code>rename(new_title)</code> проверяет и
          сохраняет новое значение.
        </Lead>

        <MethodGrid
          rows={[
            [<>task.mark_done()</>, "изменить is_done на True"],
            [<>task.reopen()</>, "вернуть is_done в False"],
            [<>task.rename(title)</>, "проверить и заменить название"],
            [<>task.is_high_priority()</>, "вернуть bool без изменения объекта"],
            [<>task.to_dict()</>, "создать сериализуемое представление"],
          ]}
        />

        <CodeBlock
          caption="методы с разными контрактами"
          code={
            'class Task:\n' +
            '    def mark_done(self):\n' +
            '        self.is_done = True\n\n' +
            '    def is_high_priority(self):\n' +
            '        return self.priority >= 4\n\n' +
            '    def rename(self, new_title):\n' +
            '        cleaned = new_title.strip()\n' +
            '        if not cleaned:\n' +
            '            raise ValueError("Название не может быть пустым")\n' +
            '        self.title = cleaned'
          }
        />

        <BranchExplorer
          code={
            'cleaned = new_title.strip()\n' +
            'if not cleaned:\n' +
            '    raise ValueError("Пустое название")\n' +
            'self.title = cleaned\n' +
            'return self.title'
          }
          scenarios={[
            { label: 'new_title = "  SQL  "', activeLine: 4, output: "title становится SQL" },
            { label: 'new_title = "   "', activeLine: 2, output: "ValueError, старое название сохранено" },
          ]}
        />

        <Callout>
          Не изменяйте атрибут до проверки. Иначе объект может на короткое время или навсегда получить некорректное
          состояние.
        </Callout>
      </Section>

      <Section number="06" title="__str__ определяет человекочитаемый текст объекта">
        <Lead>
          Без специального метода <code>print(task)</code> показывает техническое представление с классом и адресом
          памяти. <code className="lesson-token">__str__</code> возвращает строку, которую удобно показывать
          пользователю.
        </Lead>

        <CompareSolutions
          question="Что увидит пользователь при print(task)?"
          left={{
            title: "Без __str__",
            code: '<models.Task object at 0x...>',
            note: "Техническая ссылка не объясняет содержимое задачи.",
          }}
          right={{
            title: "С __str__",
            code: '[ ] 4. Изучить методы (приоритет 5)',
            note: "Объект сам предоставляет единый формат карточки.",
          }}
          preferred="right"
          explanation="__str__ вызывается функциями str() и print() и обязан вернуть строку."
        />

        <CodeBlock
          caption="строковое представление Task"
          code={
            'class Task:\n' +
            '    def __str__(self):\n' +
            '        mark = "x" if self.is_done else " "\n' +
            '        return (\n' +
            '            f"[{mark}] {self.id}. {self.title} "\n' +
            '            f"(приоритет {self.priority})"\n' +
            '        )'
          }
        />

        <PredictOutput
          code={
            'task = Task(4, "Изучить методы", 5)\n' +
            'print(str(task))\n' +
            'task.mark_done()\n' +
            'print(task)'
          }
          output={"[ ] 4. Изучить методы (приоритет 5)\n[x] 4. Изучить методы (приоритет 5)"}
          hint="Оба вызова используют __str__, но статус между ними изменился."
        />

        <BugHunt
          code={
            'class Task:\n' +
            '    def __str__(self):\n' +
            '        print(self.title)'
          }
          question="Почему __str__ нарушает контракт?"
          options={[
            "Метод печатает, но должен вернуть строку",
            "__str__ не может читать title",
            "print принимает только числа",
          ]}
          correctIndex={0}
          explanation="str(task) ожидает результат типа str. Побочный print возвращает None."
          fix={
            'class Task:\n' +
            '    def __str__(self):\n' +
            '        return self.title'
          }
        />
      </Section>

      <Section number="07" title="to_dict связывает объект с JSON-хранилищем">
        <Lead>
          Строка из <code>__str__</code> предназначена для человека и не должна использоваться для восстановления
          модели. Для JSON нужен отдельный метод, который возвращает словарь с устойчивыми именами полей и простыми
          типами.
        </Lead>

        <CodeBlock
          caption="два разных представления"
          code={
            'class Task:\n' +
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

        <MatchPairs
          prompt="Соедините представление с потребителем."
          pairs={[
            { left: "str(task)", right: "пользователь терминала" },
            { left: "task.to_dict()", right: "json.dump" },
            { left: "task.title", right: "внутренняя логика Python" },
          ]}
          explanation="У каждого представления своя ответственность и стабильность."
        />

        <CodeSequence
          title="Сохраните список объектов"
          prompt="Сначала подготовьте сериализуемые словари, затем передайте их json.dump."
          pieces={[
            { id: "result", code: "payload = []" },
            { id: "loop", code: "for task in tasks:" },
            { id: "append", code: "    payload.append(task.to_dict())" },
            { id: "open", code: 'with DATA_FILE.open("w", encoding="utf-8") as file:' },
            { id: "dump", code: "    json.dump(payload, file, ensure_ascii=False, indent=2)" },
          ]}
          correctOrder={["result", "loop", "append", "open", "dump"]}
          explanation="Пользовательские объекты преобразуются до передачи стандартному JSON-кодировщику."
        />

        <Callout tone="info">
          Формат <code>__str__</code> можно менять ради интерфейса. Ключи <code>to_dict()</code> меняют осторожнее,
          потому что они являются форматом сохранённых данных.
        </Callout>
      </Section>

      <Section number="08" title="Итоговая модель с поведением">
        <CodeBlock
          caption="models.py после занятия"
          code={
            'class Task:\n' +
            '    DEFAULT_PRIORITY = 3\n\n' +
            '    def __init__(self, task_id, title, priority=DEFAULT_PRIORITY, is_done=False):\n' +
            '        self.id = task_id\n' +
            '        self.title = title.strip()\n' +
            '        self.priority = priority\n' +
            '        self.is_done = is_done\n\n' +
            '    def mark_done(self):\n' +
            '        self.is_done = True\n\n' +
            '    def is_high_priority(self):\n' +
            '        return self.priority >= 4\n\n' +
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
            question="Где хранится title конкретной задачи?"
            options={["в атрибуте экземпляра", "только в атрибуте класса", "в функции print"]}
            correctIndex={0}
            explanation="У каждого объекта своё self.title."
          />
          <QuizCard
            question="Что Python передаёт в self при task.mark_done()?"
            options={["объект task", "класс str", "список всех задач"]}
            correctIndex={0}
            explanation="Вызов через экземпляр автоматически передаёт этот экземпляр."
          />
          <QuizCard
            question="Что должен вернуть __str__?"
            options={["строку", "словарь", "файловый объект"]}
            correctIndex={0}
            explanation="Контракт str() требует результат типа str."
          />
          <QuizCard
            question="Почему to_dict не заменяется вызовом str(task)?"
            options={["это разные представления для разных потребителей", "строки нельзя печатать", "dict не поддерживает JSON"]}
            correctIndex={0}
            explanation="Человекочитаемая карточка не является устойчивым форматом хранения."
          />
        </div>

        <KeyTakeaways
          points={[
            <>Атрибут экземпляра хранит состояние конкретного объекта.</>,
            <>Атрибут класса описывает общее значение или правило типа.</>,
            <>Метод вызывается через объект и получает его в параметре <code>self</code>.</>,
            <>Методы изменения и методы вычисления должны иметь ясные контракты.</>,
            <><code>__str__</code> возвращает человекочитаемую строку.</>,
            <><code>to_dict()</code> создаёт отдельное сериализуемое представление.</>,
            <>Поведение одной задачи остаётся в models.py, работа со списком и файлами — в других модулях.</>,
          ]}
        />

        <PracticeCta text="Добавьте Task методы mark_done, reopen, rename, is_high_priority, __str__ и to_dict. Проверьте независимость двух объектов, ошибки пустого названия, вывод до и после завершения и сохранение списка объектов в JSON." />
      </Section>
    </RichLesson>
  );
}

// 38. Инкапсуляция, геттеры, сеттеры и property
