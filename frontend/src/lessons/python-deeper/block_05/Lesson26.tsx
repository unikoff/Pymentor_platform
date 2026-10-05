import {
  FunctionSquare,
  GitFork,
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
  TheoryBridge,
} from "../../shared";

// 26. Функция как значение: callbacks и замыкания
export function Lesson26({ module }: { module?: string }) {
  return (
    <RichLesson>
      <RichHero
        chip={module ?? "Блок 5 · Функции и поток данных"}
        title="Функция как значение: callbacks и замыкания"
        intro="Посмотрим на функцию не только как на команду со скобками, но и как на обычное значение: её можно сохранить, передать другой функции и вернуть как результат. На этой основе соберём callbacks и первые замыкания для StudyHub."
        tags={[
          { icon: <FunctionSquare size={14} />, label: "функции как объекты" },
          { icon: <GitFork size={14} />, label: "callbacks и замыкания" },
        ]}
      />
      <TheoryBridge link={"Функцию можно хранить и передавать как значение: callback получает ясный момент вызова, а замыкание помнит настройку."} boundary={"Замыкание не требует магии или декораторов: важно увидеть, какую внешнюю переменную хранит возвращённая функция."} />

      <Section number="01" title="От вызова функции к передаче поведения">
        <Lead>
          Раньше функция была для нас именованной командой: записали имя, добавили скобки и получили результат.
          Теперь сделаем следующий шаг. В Python само имя функции тоже является значением, поэтому функцию можно
          передать в другую часть программы как готовое правило поведения.
        </Lead>

        <div className="lesson-route">
          <ol>
            <li>
              <strong>Различить функцию и вызов:</strong> понять разницу между <code className="lesson-token">normalize_title</code> и <code className="lesson-token">normalize_title(...)</code>.
            </li>
            <li>
              <strong>Передать функцию:</strong> принять её через параметр и вызвать внутри другой функции.
            </li>
            <li>
              <strong>Создать callback:</strong> заменить жёстко записанное действие передаваемым правилом.
            </li>
            <li>
              <strong>Вернуть функцию:</strong> построить замыкание, которое запоминает значение внешнего вызова.
            </li>
          </ol>
          <p>
            В конце занятия StudyHub сможет применять разные операции и фильтры без копирования одинаковых циклов.
          </p>
        </div>

        <Callout tone="info">
          Главный вопрос урока: <strong>мы передаём готовый результат или правило, которое нужно выполнить позже?</strong>
        </Callout>
      </Section>

      <Section number="02" title="Имя функции и вызов функции — разные значения">
        <Lead>
          Скобки означают «выполни сейчас». Имя без скобок означает «возьми саму функцию». Это похоже на разницу
          между готовым документом и инструкцией, по которой документ можно подготовить позже.
        </Lead>

        <CodeBlock
          caption="функция и результат вызова"
          code={
            'def normalize_title(title):\n' +
            '    return title.strip().capitalize()\n\n' +
            'operation = normalize_title\n' +
            'result = normalize_title("  python  ")\n\n' +
            'print(operation)\n' +
            'print(result)'
          }
        />

        <TypeCards>
          <TypeCard badge="без ()" title="Сама функция" code="operation = normalize_title">
            Переменная <code>operation</code> хранит ссылку на функцию. Тело функции пока не выполняется.
          </TypeCard>
          <TypeCard badge="с ()" badgeTone="float" title="Результат вызова" code={'result = normalize_title(" python ")'}>
            Python вызывает функцию сейчас и сохраняет возвращённую строку.
          </TypeCard>
          <TypeCard badge="callable" badgeTone="str" title="Значение можно вызвать" code="callable(operation)  # True">
            Встроенная функция <code>callable()</code> сообщает, можно ли использовать значение со скобками.
          </TypeCard>
        </TypeCards>

        <CompareSolutions
          question="Как сохранить правило нормализации для будущего вызова?"
          left={{
            title: "Выполнить немедленно",
            code: 'operation = normalize_title(" SQL ")',
            note: "operation получает строку SQL.",
          }}
          right={{
            title: "Сохранить функцию",
            code: "operation = normalize_title",
            note: "operation получает саму функцию.",
          }}
          preferred="right"
          explanation="Для будущего вызова функцию передают без круглых скобок."
        />

        <PredictOutput
          code={
            'def double(number):\n' +
            '    return number * 2\n\n' +
            'operation = double\n' +
            'print(operation(5))\n' +
            'print(operation(8))'
          }
          output={"10\n16"}
          hint="operation и double указывают на одну функцию."
        />
      </Section>

      <Section number="03" title="Callback — функция, переданная для будущего вызова">
        <Lead>
          Callback — это функция, которую одна часть программы получает через параметр и вызывает в подходящий
          момент. Получатель не обязан знать внутреннее устройство callback. Ему достаточно знать его контракт.
        </Lead>

        <StepThrough
          code={
            'def apply_operation(task, operation):\n' +
            '    return operation(task)\n\n' +
            'def mark_done(task):\n' +
            '    result = task.copy()\n' +
            '    result["is_done"] = True\n' +
            '    return result\n\n' +
            'task = {"title": "Python", "is_done": False}\n' +
            'updated = apply_operation(task, mark_done)'
          }
          steps={[
            { line: 9, note: "В apply_operation передаются словарь task и сама функция mark_done без скобок.", vars: { operation: "mark_done", "task['is_done']": "False" } },
            { line: 1, note: "apply_operation вызывает полученное правило и передаёт ему task.", vars: { вызов: "mark_done(task)" } },
            { line: 4, note: "mark_done создаёт копию, чтобы не менять исходный словарь.", vars: { "result is task": "False" } },
            { line: 5, note: "Статус копии становится True.", vars: { "result['is_done']": "True" } },
            { line: 9, note: "Возвращённый словарь сохраняется в updated.", vars: { "task['is_done']": "False", "updated['is_done']": "True" } },
          ]}
        />

        <MatchPairs
          prompt="Соедините часть callback-сценария с её ролью."
          leftTitle="Фрагмент"
          rightTitle="Роль"
          pairs={[
            { left: "operation", right: "параметр для переданной функции" },
            { left: "mark_done", right: "конкретный callback" },
            { left: "operation(task)", right: "вызов callback внутри общей функции" },
            { left: "apply_operation(...) ", right: "функция высшего порядка" },
          ]}
          explanation="Функция высшего порядка принимает или возвращает другую функцию."
        />

        <BugHunt
          code={
            'def apply_operation(task, operation):\n' +
            '    return operation(task)\n\n' +
            'updated = apply_operation(task, mark_done(task))'
          }
          question="Почему второй аргумент передан неверно?"
          options={[
            "mark_done(task) уже выполнилась и передала словарь вместо функции",
            "Callback всегда должен быть строкой",
            "Функцию нельзя вызывать внутри другой функции",
          ]}
          correctIndex={0}
          explanation="apply_operation ожидает вызываемое правило, а не заранее вычисленный результат."
          fix={'updated = apply_operation(task, mark_done)'}
        />
      </Section>

      <Section number="04" title="Контракт callback должен быть понятным">
        <Lead>
          Возможность передать любую функцию не означает, что подойдёт любая функция. Получатель callback ожидает
          определённое количество аргументов и определённый результат. Это и есть контракт callback.
        </Lead>

        <CodeBlock
          caption="callback-предикат"
          code={
            'def filter_tasks(tasks, predicate):\n' +
            '    result = []\n' +
            '    for task in tasks:\n' +
            '        if predicate(task):\n' +
            '            result.append(task)\n' +
            '    return result\n\n' +
            'def is_open(task):\n' +
            '    return not task["is_done"]'
          }
        />

        <MethodGrid
          rows={[
            [<>predicate(task)</>, "получает одну задачу"],
            [<>return True</>, "задача входит в результат"],
            [<>return False</>, "задача пропускается"],
            [<>filter_tasks(tasks, is_open)</>, "передаёт правило без вызова"],
          ]}
        />

        <CompareSolutions
          question="Какой callback подходит функции filter_tasks()?"
          left={{
            title: "Возвращает bool",
            code: 'def has_high_priority(task):\n    return task["priority"] >= 4',
            note: "Совпадает с контрактом predicate(task) -> bool.",
          }}
          right={{
            title: "Ничего не возвращает",
            code: 'def show_title(task):\n    print(task["title"])',
            note: "Функция возвращает None, поэтому условие всегда ложно.",
          }}
          preferred="left"
          explanation="Фильтр ожидает логическое правило, а не функцию вывода."
        />

        <TrueFalse
          statement={
            <>
              Любую функцию можно безопасно передать как callback, даже если она принимает другое количество
              аргументов.
            </>
          }
          isTrue={false}
          explanation="Вызов завершится TypeError, если контракт параметров не совпадает."
        />

        <Callout>
          Хорошее имя параметра сообщает ожидаемую роль: <code>predicate</code> проверяет, <code>operation</code>
          изменяет или преобразует, <code>formatter</code> создаёт строку.
        </Callout>
      </Section>

      <Section number="05" title="Переданное поведение уменьшает повторение">
        <Lead>
          Без callback для каждого фильтра пришлось бы писать новый цикл. Callback позволяет оставить один общий
          алгоритм обхода и менять только правило отбора.
        </Lead>

        <CompareSolutions
          question="Как избежать нескольких одинаковых циклов?"
          left={{
            title: "Отдельный цикл для каждого фильтра",
            code:
              'def get_open_tasks(tasks):\n' +
              '    result = []\n' +
              '    for task in tasks:\n' +
              '        if not task["is_done"]:\n' +
              '            result.append(task)\n' +
              '    return result',
            note: "Следующий фильтр повторит обход и добавление.",
          }}
          right={{
            title: "Один алгоритм и разные callbacks",
            code:
              'open_tasks = filter_tasks(tasks, is_open)\n' +
              'urgent_tasks = filter_tasks(tasks, is_urgent)',
            note: "Меняется только правило predicate.",
          }}
          preferred="right"
          explanation="Общий цикл сосредоточен в filter_tasks, а предметные правила остаются маленькими функциями."
        />

        <CodeBlock
          caption="таблица действий вместо длинной цепочки"
          code={
            'ACTIONS = {\n' +
            '    "done": mark_done,\n' +
            '    "reset": reset_status,\n' +
            '}\n\n' +
            'operation = ACTIONS.get(command)\n' +
            'if operation is None:\n' +
            '    print("Неизвестная операция")\n' +
            'else:\n' +
            '    task = operation(task)'
          }
        />

        <CodeSequence
          title="Соберите безопасный выбор callback"
          prompt="Неизвестная команда не должна вызывать значение None."
          pieces={[
            { id: "get", code: "operation = ACTIONS.get(command)" },
            { id: "check", code: "if operation is None:" },
            { id: "error", code: '    return "Неизвестная операция"' },
            { id: "call", code: "result = operation(task)" },
            { id: "return", code: "return result" },
          ]}
          correctOrder={["get", "check", "error", "call", "return"]}
          explanation="Сначала значение читается и проверяется, затем callback вызывается."
        />

        <Callout tone="info">
          Словарь функций полезен, когда команды уже стабильно соответствуют действиям. Не заменяйте им простой
          <code>if</code>, если вариантов всего два и таблица ухудшает читаемость.
        </Callout>
      </Section>

      <Section number="06" title="Замыкание возвращает настроенную функцию">
        <Lead>
          Функция может не только принимать другую функцию, но и возвращать её. Внутренняя функция сохраняет доступ
          к значениям внешнего вызова. Такая связка называется замыканием.
        </Lead>

        <StepThrough
          code={
            'def make_min_priority_filter(min_priority):\n' +
            '    def matches(task):\n' +
            '        return task["priority"] >= min_priority\n' +
            '    return matches\n\n' +
            'is_high_priority = make_min_priority_filter(4)\n' +
            'print(is_high_priority({"priority": 5}))\n' +
            'print(is_high_priority({"priority": 2}))'
          }
          steps={[
            { line: 5, note: "Внешняя функция вызывается со значением 4.", vars: { min_priority: "4" } },
            { line: 1, note: "Создаётся внутренняя функция matches. Она использует min_priority из внешней области.", vars: { matches: "функция", min_priority: "4" } },
            { line: 3, note: "Наружу возвращается сама функция matches, а не результат её вызова.", vars: { is_high_priority: "matches с порогом 4" } },
            { line: 6, note: "При первом вызове priority 5 сравнивается с сохранённым порогом 4.", vars: { "5 >= 4": "True" } },
            { line: 7, note: "При втором вызове используется тот же сохранённый порог.", vars: { "2 >= 4": "False" } },
          ]}
        />

        <TypeCards>
          <TypeCard badge="внешняя" title="Настраивает правило" code="make_min_priority_filter(4)">
            Получает параметр настройки и создаёт внутреннюю функцию.
          </TypeCard>
          <TypeCard badge="внутренняя" badgeTone="float" title="Работает с задачей" code="matches(task)">
            Получает конкретную задачу и использует сохранённый порог.
          </TypeCard>
          <TypeCard badge="closure" badgeTone="str" title="Помнит окружение" code="min_priority = 4">
            Значение остаётся доступным внутренней функции после завершения внешнего вызова.
          </TypeCard>
        </TypeCards>

        <FillBlank
          prompt="Верните внутреннюю функцию, не вызывая её."
          before={"    return "}
          after={""}
          options={["matches", "matches()", "min_priority"]}
          answer="matches"
          explanation="Замыкание возвращает функцию, поэтому скобки не нужны."
        />

        <Callout>
          Пока используйте замыкания для настройки неизменяемого правила. Изменение захваченного состояния через
          <code>nonlocal</code> будет изучаться только при реальной необходимости.
        </Callout>
      </Section>

      <Section number="07" title="Связываем callback и замыкание в StudyHub">
        <Lead>
          Замыкание создаёт настроенный predicate, а общая функция фильтрации применяет его к каждой задаче. Так
          один механизм поддерживает разные пороги и статусы без копирования циклов.
        </Lead>

        <CodeBlock
          caption="настраиваемые фильтры"
          code={
            'def filter_tasks(tasks, predicate):\n' +
            '    result = []\n' +
            '    for task in tasks:\n' +
            '        if predicate(task):\n' +
            '            result.append(task)\n' +
            '    return result\n\n' +
            'def make_status_filter(required_status):\n' +
            '    def matches(task):\n' +
            '        return task["status"] == required_status\n' +
            '    return matches\n\n' +
            'is_done = make_status_filter("done")\n' +
            'done_tasks = filter_tasks(tasks, is_done)'
          }
        />

        <PredictOutput
          code={
            'def make_multiplier(factor):\n' +
            '    def multiply(number):\n' +
            '        return number * factor\n' +
            '    return multiply\n\n' +
            'double = make_multiplier(2)\n' +
            'triple = make_multiplier(3)\n' +
            'print(double(5))\n' +
            'print(triple(5))'
          }
          output={"10\n15"}
          hint="Каждая возвращённая функция хранит собственное значение factor."
        />

        <RecallCard
          question="Чем callback отличается от замыкания?"
          hint="Один термин описывает роль функции, другой — сохранённое окружение."
          answer={
            <p>
              Callback — функция, переданная для вызова другой частью программы. Замыкание — функция, которая
              сохраняет доступ к значениям внешней области. Одна функция может одновременно быть замыканием и
              использоваться как callback.
            </p>
          }
        />

        <BugHunt
          code={
            'is_done = make_status_filter("done")\n' +
            'done_tasks = filter_tasks(tasks, is_done())'
          }
          question="Почему is_done не нужно вызывать заранее?"
          options={[
            "is_done ожидает конкретную задачу, которую передаст filter_tasks",
            "Замыкания нельзя вызывать",
            "filter_tasks принимает только строки",
          ]}
          correctIndex={0}
          explanation="Фильтр сам вызовет predicate(task) для каждого элемента."
          fix={'done_tasks = filter_tasks(tasks, is_done)'}
        />
      </Section>

      <Section number="08" title="Практика: подготовка к декораторам">
        <Lead>
          Декоратор строится на тех же действиях: принимает функцию, создаёт внутреннюю функцию и возвращает её.
          Сейчас соберём эту механику вручную, не используя синтаксис <code>@</code>.
        </Lead>

        <CodeBlock
          caption="ручная обёртка функции"
          code={
            'def log_call(function):\n' +
            '    def wrapper(*args, **kwargs):\n' +
            '        print(f"Вызов: {function.__name__}")\n' +
            '        return function(*args, **kwargs)\n' +
            '    return wrapper\n\n' +
            'logged_create_task = log_call(create_task)\n' +
            'task = logged_create_task("FastAPI", priority=5)'
          }
        />

        <div className="lesson-practice-steps">
          <h3>Задание 1. Общая операция</h3>
          <p>
            Реализуйте <code className="lesson-token">apply_operation(task, operation)</code>. Проверьте её с
            функциями <code>mark_done</code> и <code>reset_status</code>.
          </p>

          <h3>Задание 2. Общий фильтр</h3>
          <p>
            Реализуйте <code className="lesson-token">filter_tasks(tasks, predicate)</code>. Callback должен
            получать один словарь и возвращать <code>bool</code>.
          </p>

          <h3>Задание 3. Фабрика predicates</h3>
          <p>
            Создайте <code className="lesson-token">make_min_priority_filter(min_priority)</code> и получите
            отдельные фильтры для порогов 3 и 5.
          </p>

          <h3>Задание 4. Ручная обёртка</h3>
          <p>
            Добавьте <code className="lesson-token">log_call(function)</code>, которая печатает имя функции и
            возвращает её настоящий результат.
          </p>
        </div>

        <div className="lesson-check-group">
          <QuizCard
            question="Что передаётся без скобок в filter_tasks(tasks, is_open)?"
            options={["сама функция", "результат функции", "строка с именем"]}
            correctIndex={0}
            explanation="Callback должен быть вызван позже внутри filter_tasks."
          />
          <QuizCard
            question="Что должна возвращать функция predicate?"
            options={["bool", "обязательно dict", "ничего"]}
            correctIndex={0}
            explanation="Логический результат определяет, попадёт ли элемент в фильтр."
          />
          <QuizCard
            question="Что сохраняет замыкание make_min_priority_filter(4)?"
            options={["значение min_priority", "весь список задач", "результат print"]}
            correctIndex={0}
            explanation="Внутренняя функция продолжает видеть параметр внешнего вызова."
          />
          <QuizCard
            question="На какой механике основан декоратор?"
            options={[
              "функция принимает функцию и возвращает новую функцию",
              "цикл обязательно изменяет глобальную переменную",
              "словарь превращается в класс",
            ]}
            correctIndex={0}
            explanation="Именно эту механику показывает ручная обёртка log_call."
          />
        </div>

        <KeyTakeaways
          points={[
            <>Имя функции без скобок является значением, которое можно сохранить или передать.</>,
            <>Скобки запускают функцию и дают результат конкретного вызова.</>,
            <>Callback передаётся другой функции для последующего вызова.</>,
            <>Контракт callback определяет ожидаемые параметры и возвращаемое значение.</>,
            <>Функция высшего порядка принимает или возвращает другую функцию.</>,
            <>Замыкание сохраняет доступ к значениям внешнего вызова.</>,
            <>Настроенное замыкание может использоваться как callback.</>,
            <>Декораторы строятся на той же механике передачи и возврата функций.</>,
          ]}
        />

        <PracticeCta text="Добавьте apply_operation(), filter_tasks(), make_min_priority_filter() и ручную обёртку log_call(). Проверьте функции на данных StudyHub и сделайте коммит feat: add callbacks and closures." />
      </Section>
    </RichLesson>
  );
}
