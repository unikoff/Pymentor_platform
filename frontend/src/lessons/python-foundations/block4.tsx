import { BarChart3, CheckCircle2, FileText, FolderGit2, ListChecks, Menu, Search, Trophy } from "lucide-react";
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
} from "../shared";

type TheoryBridgeData = { link: string; boundary: string };

const THEORY_BRIDGES: Record<number, TheoryBridgeData> = {
  16: {"link":"После отдельных функций собираем интерфейс проекта: меню получает ввод, проверяет команду и направляет её к нужному правилу.","boundary":"input и print не должны стать центром логики: правила без них легче читать, проверять и переиспользовать."},
  17: {"link":"Один словарь описывает одну задачу, список словарей — весь набор, а стабильный id связывает создание, поиск и изменение.","boundary":"Изменить старый список и вернуть новую версию списка — разные контракты; решение выбирают осознанно."},
  18: {"link":"Поиск отделяется от изменения: сначала получают задачу или явный признак её отсутствия, затем решают, что делать дальше.","boundary":"Отсутствие задачи — обычный сценарий, а не повод читать поля несуществующего словаря."},
  19: {"link":"Когда код работает, его нужно сделать воспроизводимым для другого человека: README объясняет запуск, .gitignore — состав репозитория.","boundary":"Публикация не исправляет неясный проект: сначала сверяют чистый запуск и совпадение документации с кодом."},
  20: {"link":"Контрольная точка связывает темы месяца: вы прослеживаете путь данных и объясняете причину результата каждой функции.","boundary":"Перед защитой не нужно добавлять возможности; важнее доказать, что существующий сценарий работает и понятен."},
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


// 16. Проектное меню и валидация
export function Lesson16({ module }: { module?: string }) {
  return (
    <RichLesson>
      <RichHero
        variant="project"
        chip={module ?? "Блок 4 · Проект StudyHub"}
        title="Проектное меню и валидация"
        intro="Соберём главное окно консольного приложения: пользователь увидит понятные команды, ошибочный ввод не сломает программу, а каждый выбор будет направлен к своему действию."
        tags={[
          { icon: <Menu size={14} />, label: "цикл меню" },
          { icon: <CheckCircle2 size={14} />, label: "валидация команды" },
        ]}
      />
      <TheoryBridge lesson={16} />

      <Section number="01" title="Как будет работать меню">
        <Lead>
          Представьте администратора в учебном центре. Он показывает список доступных действий, слушает выбор
          посетителя и направляет его в нужный кабинет. Меню StudyHub выполняет ту же роль: показывает команды,
          проверяет ввод и запускает только подходящий обработчик.
    
        </Lead>

        <div className="lesson-route">
          <ol>
            <li>
              <strong>Показать варианты:</strong> отдельная функция{" "}
              <code className="lesson-token">show_menu()</code> объясняет доступные действия.
            </li>
            <li>
              <strong>Получить и проверить ввод:</strong> команда очищается через{" "}
              <code className="lesson-token">strip()</code> до любых сравнений.
            </li>
            <li>
              <strong>Выбрать обработчик:</strong> валидная команда направляется к одной функции, а{" "}
              <code className="lesson-token">5</code> завершает цикл.
            </li>
          </ol>
          <p>
            В конце занятия в <code className="lesson-token">main.py</code> появятся{" "}
            <code>show_menu</code>, <code>is_valid_command</code> и <code>run</code>. Действия с задачами пока могут
            оставаться заглушками.
          </p>
        </div>

        <Callout tone="info">
          Читайте <code>run()</code> как короткий сценарий администратора: показать варианты, получить выбор,
          проверить его, направить к действию или завершить приложение.
        </Callout>
      </Section>

      <Section number="02" title="Меню как администратор приложения">
        <Lead>
          Хорошее меню похоже на понятную табличку у входа. Пользователь не должен угадывать, что вводить.
          <code>show_menu()</code> только показывает варианты, <code>input()</code> получает выбор, а отдельная
          логика решает, что выполнить.
    
        </Lead>

        <TypeCards>
          <TypeCard badge="1" title="Показать варианты" code={"show_menu()"}>
            Функция печатает список команд и не спрашивает ввод.
          </TypeCard>
          <TypeCard badge="2" badgeTone="float" title="Получить команду" code={'input("Выберите действие: ")'}>
            <code>input()</code> возвращает строку, даже если введена цифра.
          </TypeCard>
          <TypeCard badge="3" badgeTone="str" title="Выбрать действие" code={'if command == "1":\n    handle_add(tasks)'}>
            Команда направляется к отдельному обработчику.
          </TypeCard>
        </TypeCards>

        <CodeBlock
          caption="отдельная функция отображения"
          code={
            'def show_menu():\n' +
            '    print()\n' +
            '    print("StudyHub Planner")\n' +
            '    print("1. Добавить задачу")\n' +
            '    print("2. Показать задачи")\n' +
            '    print("3. Изменить статус")\n' +
            '    print("4. Удалить задачу")\n' +
            '    print("5. Выйти")'
          }
        />

        <RecallCard
          question="Почему команды меню удобно сравнивать со строками, а не сразу преобразовывать в int?"
          hint="Вспомните тип результата input() и ввод вроде add или пустой строки."
          answer={
            <p>
              <code>input()</code> уже возвращает строку. Сравнение с <code>"1"</code>–<code>"5"</code> не требует
              преобразования и не создаёт дополнительный <code>ValueError</code>.
            </p>
          }
        />
      </Section>

      <Section number="03" title="Повтор меню и понятная кнопка выхода">
        <Lead>
          Консольное приложение похоже на стойку обслуживания, которая снова предлагает варианты после каждого
          действия. Цикл повторяет меню, а команда выхода работает как понятная кнопка «закрыть»: после неё
          ближайший цикл завершается через <code>break</code>.
    
        </Lead>

        <StepThrough
          code={
            'def run():\n' +
            '    while True:\n' +
            '        show_menu()\n' +
            '        command = input("Команда: ").strip()\n' +
            '        if command == "5":\n' +
            '            print("До свидания")\n' +
            '            break\n' +
            '    print("Приложение завершено")'
          }
          steps={[
            { line: 1, note: "Начинается очередная итерация меню.", vars: { цикл: "активен" } },
            { line: 2, note: "Пользователь видит доступные действия.", vars: { меню: "показано" } },
            { line: 3, note: 'После ввода "5" переменная command содержит очищенную строку.', vars: { command: '"5"' } },
            { line: 4, note: 'Проверка command == "5" истинна.', vars: { условие: "True" } },
            { line: 6, note: "break немедленно завершает ближайший цикл.", vars: { цикл: "завершён" } },
            { line: 7, note: "Строка после while выполняется один раз.", vars: { вывод: "Приложение завершено" } },
          ]}
        />

        <TrueFalse
          statement={
            <>
              Любой <code>while True</code> является ошибкой, даже если внутри есть понятный{" "}
              <code>break</code>.
            </>
          }
          isTrue={false}
          explanation="Бесконечное условие допустимо для меню, если выход видим и достижим."
        />

        <Callout>
          Не прячьте единственный <code>break</code> глубоко внутри нескольких вложенных условий: маршрут завершения
          должен читаться без долгой трассировки.
        </Callout>
      </Section>

      <Section number="04" title="Сначала привести ввод в порядок">
        <Lead>
          Ввод пользователя похож на заполненный от руки номер талона: вокруг цифры могут оказаться случайные
          пробелы. Сначала строку приводят к согласованному виду через <code>strip()</code>, затем проверяют, входит
          ли команда в разрешённый набор.
    
        </Lead>

        <CodeBlock
          caption="чистая проверка команды"
          code={
            'VALID_COMMANDS = {"1", "2", "3", "4", "5"}\n\n' +
            'def is_valid_command(command):\n' +
            '    cleaned = command.strip()\n' +
            '    return cleaned in VALID_COMMANDS'
          }
        />

        <PredictOutput
          code={
            'print(is_valid_command(" 3 "))\n' +
            'print(is_valid_command("add"))\n' +
            'print(is_valid_command(""))\n' +
            'print(is_valid_command("5"))'
          }
          output={"True\nFalse\nFalse\nTrue"}
          hint="strip() удаляет края, после чего in проверяет членство в множестве."
        />

        <CompareSolutions
          question="Где лучше один раз очистить пользовательскую команду?"
          left={{
            title: "Повторять в каждой ветке",
            code:
              'if command.strip() == "1":\n    ...\n' +
              'elif command.strip() == "2":\n    ...',
            note: "Одна операция повторяется и легко забывается в новой ветке.",
          }}
          right={{
            title: "Нормализовать до проверок",
            code:
              'command = input("Команда: ").strip()\n' +
              'if command == "1":\n    ...',
            note: "Все дальнейшие ветки работают с одним согласованным значением.",
          }}
          preferred="right"
          explanation="Нормализация относится к границе ввода и выполняется до маршрутизации."
        />
      </Section>

      <Section number="05" title="Ошибочная команда не должна запускать действие">
        <Lead>
          Если посетитель назвал неизвестную команду, администратор не должен отправлять его в случайный кабинет.
          Программа сообщает об ошибке и через <code>continue</code> возвращается к следующему показу меню, не
          запуская обработчик.
    
        </Lead>

        <BugHunt
          code={
            'command = input("Команда: ").strip()\n' +
            'if not is_valid_command(command):\n' +
            '    print("Неизвестная команда")\n\n' +
            'handle_command(command)'
          }
          question="Почему структура опасна?"
          options={[
            "После сообщения программа всё равно вызывает handle_command",
            "strip нельзя использовать с input",
            "В условии запрещён not",
          ]}
          correctIndex={0}
          explanation="После невалидного ввода нужно прекратить текущую итерацию."
          fix={
            'command = input("Команда: ").strip()\n' +
            'if not is_valid_command(command):\n' +
            '    print("Неизвестная команда")\n' +
            '    continue\n\n' +
            'handle_command(command)'
          }
        />

        <CodeSequence
          title="Соберите одну итерацию меню"
          prompt="Расположите действия в безопасном порядке."
          pieces={[
            { id: "show", code: "show_menu()" },
            { id: "read", code: 'command = input("Команда: ").strip()' },
            { id: "check", code: "if not is_valid_command(command):" },
            { id: "error", code: '    print("Неизвестная команда")\n    continue' },
            { id: "dispatch", code: "handle_command(command)" },
          ]}
          correctOrder={["show", "read", "check", "error", "dispatch"]}
          explanation="Сначала пользователь видит варианты, затем ввод проверяется и только после этого выполняется действие."
        />

        <Callout>
          Валидация после обработчика слишком поздняя: неверные данные уже могли изменить состояние приложения.
        </Callout>
      </Section>

      <Section number="06" title="Куда направлять каждую команду">
        <Lead>
          Главный цикл похож на диспетчера. Он не выполняет всю работу самостоятельно, а выбирает специалиста:
          добавление, вывод, изменение статуса или удаление. Такие отдельные функции называются обработчиками.
    
        </Lead>

        <BranchExplorer
          code={
            'if command == "1":\n' +
            '    handle_add(tasks)\n' +
            'elif command == "2":\n' +
            '    handle_list(tasks)\n' +
            'elif command == "3":\n' +
            '    handle_done(tasks)\n' +
            'elif command == "4":\n' +
            '    handle_delete(tasks)\n' +
            'else:\n' +
            '    break'
          }
          scenarios={[
            { label: 'command = "1"', activeLine: 1, output: "handle_add(tasks)" },
            { label: 'command = "3"', activeLine: 5, output: "handle_done(tasks)" },
            { label: 'command = "5"', activeLine: 9, output: "выход из цикла" },
          ]}
        />

        <TypeCards>
          <TypeCard badge="run" title="Управляет сценарием" code={"run()"}>
            Показывает меню, получает команду и выбирает обработчик.
          </TypeCard>
          <TypeCard badge="handler" badgeTone="float" title="Работает с интерфейсом" code={"handle_add(tasks)"}>
            Может запросить данные и показать сообщение.
          </TypeCard>
          <TypeCard badge="rule" badgeTone="str" title="Реализует правило" code={"create_task(...)"}>
            Создаёт или проверяет данные без знания о меню.
          </TypeCard>
        </TypeCards>

        <Callout tone="info">
          Передача <code>tasks</code> аргументом делает зависимость обработчика явной. Глобальный список скрывает эту
          связь и усложняет тестирование.
        </Callout>
      </Section>

      <Section number="07" title="Один принцип для проекта и платформы">
        <Lead>
          В локальном проекте команда приходит от <code>input()</code>, а на платформе — через аргумент
          <code>solve(command)</code>. Это два разных способа доставки одной строки. Само правило проверки команды
          остаётся одинаковым.
    
        </Lead>

        <CompareSolutions
          question="Как использовать одно правило в двух средах?"
          left={{
            title: "Локальный проект",
            code:
              'command = input("Команда: ")\n' +
              'if is_valid_command(command):\n    ...',
            note: "Интерфейс получает строку от пользователя.",
          }}
          right={{
            title: "Автопроверка",
            code:
              'def solve(command):\n' +
              '    return is_valid_command(command)',
            note: "Платформа передаёт строку как аргумент.",
          }}
          preferred="both"
          explanation="Правило одно, различается только источник входного значения."
        />

        <CodeBlock
          caption="каркас main.py"
          code={
            'VALID_COMMANDS = {"1", "2", "3", "4", "5"}\n\n' +
            'def show_menu():\n    ...\n\n' +
            'def is_valid_command(command):\n' +
            '    return command.strip() in VALID_COMMANDS\n\n' +
            'def run():\n' +
            '    tasks = []\n' +
            '    while True:\n' +
            '        show_menu()\n' +
            '        command = input("Команда: ").strip()\n' +
            '        if not is_valid_command(command):\n' +
            '            print("Неизвестная команда")\n' +
            '            continue\n' +
            '        if command == "5":\n' +
            '            break'
          }
        />

        <RecallCard
          question="Какие пять ручных сценариев нужно проверить до коммита?"
          answer={
            <p>
              Валидную команду, команду с пробелами, неизвестное число, пустую строку и команду выхода. После каждой
              команды нужно проверить, повторилось ли меню или завершилось приложение.
            </p>
          }
        />
      </Section>

      <Section number="08" title="Проверьте основную модель">
        <div className="lesson-check-group">
          <QuizCard
            question="Какова главная задача меню?"
            options={["хранить данные", "связать выбор пользователя с действием", "заменить функции"]}
            correctIndex={1}
            explanation="Меню является интерфейсом и маршрутизатором команд."
          />
          <QuizCard
            question={'Почему команда " 1 " может быть допустимой?'}
            options={["strip удаляет пробелы по краям", "Python игнорирует пробелы в строке", "множество меняет строку"]}
            correctIndex={0}
            explanation="После strip значение становится строкой 1."
          />
          <QuizCard
            question="Что делает continue после неверной команды?"
            options={["завершает программу", "начинает следующую итерацию", "возвращает список"]}
            correctIndex={1}
            explanation="Оставшаяся часть текущей итерации пропускается."
          />
          <QuizCard
            question="Почему tasks передаётся обработчику?"
            options={["зависимость становится явной", "иначе список неизменяем", "так требует print"]}
            correctIndex={0}
            explanation="Функция явно получает объект, с которым работает."
          />
        </div>

        <KeyTakeaways
          points={[
            <>Меню состоит из отображения, ввода, проверки и маршрутизации.</>,
            <>Ввод нормализуется до сравнений.</>,
            <><code>continue</code> защищает обработчики от неверной команды.</>,
            <><code>break</code> создаёт видимую точку выхода.</>,
            <>Состояние передаётся обработчикам аргументом.</>,
          ]}
        />

        <PracticeCta text="Соберите main.py с устойчивым меню и реализуйте solve(command) для проверки команды." />
      </Section>
    </RichLesson>
  );
}

// 17. Проект: добавление и вывод задач
export function Lesson17({ module }: { module?: string }) {
  return (
    <RichLesson>
      <RichHero
        variant="project"
        chip={module ?? "Блок 4 · Проект StudyHub"}
        title="Проект: добавление и вывод задач"
        intro="Добавим первые настоящие данные StudyHub: создадим карточку задачи, проверим её поля, сохраним в список и выведем в едином формате."
        tags={[
          { icon: <ListChecks size={14} />, label: "модель и состояние" },
          { icon: <FileText size={14} />, label: "создание и вывод" },
        ]}
      />
      <TheoryBridge lesson={17} />

      <Section number="01" title="Путь новой задачи">
        <Lead>
          Добавление задачи похоже на оформление новой карточки в каталоге. Сначала проверяют название и приоритет,
          затем создают карточку единой формы, присваивают ей номер и только после этого кладут в общую папку.
    
        </Lead>

        <div className="lesson-route">
          <ol>
            <li>
              <strong>Проверить данные:</strong> пустое название и неверный приоритет не попадают в состояние.
            </li>
            <li>
              <strong>Создать модель:</strong> функция{" "}
              <code className="lesson-token">create_task()</code> возвращает словарь единой формы.
            </li>
            <li>
              <strong>Добавить и показать:</strong> список хранит задачи, а{" "}
              <code className="lesson-token">format_task()</code> отвечает за одну строку вывода.
            </li>
          </ol>
          <p>
            Дополнительно вы разберёте правило id, изменение списка, возврат новой копии и поведение пустого
            приложения.
          </p>
        </div>

        <Callout tone="info">
          Запомните маршрут карточки: <strong>проверить → создать → добавить → показать</strong>. Если проверка
          выполняется после <code>append()</code>, неверная карточка уже попала в общую папку.
        </Callout>
      </Section>

      <Section number="02" title="Карточка задачи и папка со всеми задачами">
        <Lead>
          Один словарь — это карточка одной задачи с подписанными полями. Список <code>tasks</code> похож на папку,
          в которой такие карточки лежат по порядку создания. Пока программа работает, папка хранится в памяти.
    
        </Lead>

        <TypeCards>
          <TypeCard
            badge="dict"
            title="Одна задача"
            code={
              'task = {\n' +
              '    "id": 1,\n' +
              '    "title": "SQL",\n' +
              '    "priority": 3,\n' +
              '    "is_done": False,\n' +
              '}'
            }
          >
            Поля одной связанной записи.
          </TypeCard>
          <TypeCard
            badge="list"
            badgeTone="float"
            title="Все задачи"
            code={"tasks = [task]"}
          >
            Упорядоченное состояние приложения.
          </TypeCard>
          <TypeCard badge="memory" badgeTone="str" title="Ограничение" code={"tasks = []"}>
            После завершения процесса данные исчезнут. JSON будет изучаться позже.
          </TypeCard>
        </TypeCards>

        <CompareSolutions
          question="Как правильно получить название?"
          left={{
            title: "Из одной задачи",
            code: 'print(task["title"])',
            note: "task — словарь.",
          }}
          right={{
            title: "Из списка задач",
            code: 'print(tasks[0]["title"])',
            note: "Сначала выбирается элемент списка, затем ключ словаря.",
          }}
          preferred="both"
          explanation="Обе записи корректны, но работают с разным уровнем структуры данных."
        />

        <Callout>
          Не смешивайте <code>task["title"]</code> и <code>tasks["title"]</code>: список не имеет строкового ключа{" "}
          <code>"title"</code>.
        </Callout>
      </Section>

      <Section number="03" title="Одна форма карточки">
        <Lead>
          Все карточки должны заполняться по одному шаблону. Если на одной написано <code>title</code>, а на другой
          <code>name</code>, функции поиска и вывода перестают понимать данные одинаково. Поэтому форму создаёт одна
          функция <code>create_task()</code>.
    
        </Lead>

        <CodeBlock
          caption="единая фабрика задачи"
          code={
            'def create_task(task_id, title, priority):\n' +
            '    return {\n' +
            '        "id": task_id,\n' +
            '        "title": title.strip(),\n' +
            '        "priority": priority,\n' +
            '        "is_done": False,\n' +
            '    }'
          }
        />

        <StepThrough
          code={
            'title = "  Изучить SQL  "\n' +
            'priority = 3\n' +
            'is_title_valid = title.strip() != ""\n' +
            'is_priority_valid = 1 <= priority <= 5\n' +
            'task = create_task(1, title, priority)'
          }
          steps={[
            { line: 0, note: "Исходное название содержит пробелы по краям.", vars: { title: '"  Изучить SQL  "' } },
            { line: 2, note: "После strip строка не пустая.", vars: { is_title_valid: "True" } },
            { line: 3, note: "Приоритет входит в диапазон 1–5.", vars: { is_priority_valid: "True" } },
            {
              line: 4,
              note: "Функция создаёт словарь с очищенным названием и is_done=False.",
              vars: { "task['title']": '"Изучить SQL"', "task['is_done']": "False" },
            },
          ]}
        />

        <MatchPairs
          prompt="Соедините поле модели с его назначением."
          pairs={[
            { left: "id", right: "однозначный идентификатор" },
            { left: "title", right: "название задачи" },
            { left: "priority", right: "уровень от 1 до 5" },
            { left: "is_done", right: "логический статус завершения" },
          ]}
          explanation="Стабильные имена ключей позволяют функциям понимать одну модель одинаково."
        />

        <BugHunt
          code={
            'task = {"name": "SQL", "priority": 3}\n' +
            'print(task["title"])'
          }
          question="Почему вывод завершится KeyError?"
          options={[
            "В словаре создан ключ name, а читается title",
            "Словари нельзя печатать",
            "priority должен быть строкой",
          ]}
          correctIndex={0}
          explanation="Функции используют разные имена одного поля."
          fix={'task = {"title": "SQL", "priority": 3}\nprint(task["title"])'}
        />
      </Section>

      <Section number="04" title="Как выдавать следующий номер задачи">
        <Lead>
          Идентификатор похож на номер талона. Даже если карточку удалили, номер другой существующей карточки не
          должен повториться. Поэтому количество элементов не всегда подходит для вычисления следующего id.
    
        </Lead>

        <CompareSolutions
          question="Какое правило устойчивее после удаления последней задачи?"
          left={{
            title: "Количество плюс один",
            code: "def get_next_id(tasks):\n    return len(tasks) + 1",
            note: "Может повторить удалённый максимальный id.",
          }}
          right={{
            title: "Максимум плюс один",
            code:
              "def get_next_id(tasks):\n" +
              "    if not tasks:\n        return 1\n" +
              "    max_id = tasks[0]['id']\n" +
              "    for task in tasks:\n" +
              "        if task['id'] > max_id:\n" +
              "            max_id = task['id']\n" +
              "    return max_id + 1",
            note: "Не зависит от длины и порядка списка.",
          }}
          preferred="right"
          explanation="Количество элементов не гарантирует, что такой id ещё не использовался."
        />

        <PredictOutput
          code={
            'tasks = [{"id": 2}, {"id": 7}, {"id": 4}]\n' +
            'max_id = tasks[0]["id"]\n' +
            'for task in tasks:\n' +
            '    if task["id"] > max_id:\n' +
            '        max_id = task["id"]\n' +
            'print(max_id + 1)'
          }
          output={"8"}
          hint="Цикл хранит максимальное увиденное значение."
        />

        <Callout>
          Вариант <code>tasks[-1]["id"] + 1</code> допустим только при гарантии, что последний элемент всегда имеет
          максимальный id.
        </Callout>
      </Section>

      <Section number="05" title="Изменить список или вернуть новую версию">
        <Lead>
          Есть два честных способа работы. Локальный обработчик может изменить общую папку задач через
          <code>append()</code>. Чистая платформенная функция может сначала скопировать внешний список и вернуть
          новую версию. Важно заранее назвать выбранное поведение.
    
        </Lead>

        <CompareSolutions
          question="Чем отличаются два контракта?"
          left={{
            title: "Изменить состояние",
            code: "def add_task(tasks, task):\n    tasks.append(task)",
            note: "Исходный список становится длиннее.",
          }}
          right={{
            title: "Вернуть новую версию",
            code:
              "def with_added_task(tasks, task):\n" +
              "    result = tasks.copy()\n" +
              "    result.append(task)\n" +
              "    return result",
            note: "Исходный внешний список остаётся прежним.",
          }}
          preferred="both"
          explanation="Оба контракта допустимы, если название и документация честно сообщают о поведении."
        />

        <StepThrough
          code={
            'original = [{"title": "Git"}]\n' +
            'result = original.copy()\n' +
            'result.append({"title": "SQL"})\n' +
            'print(original)\n' +
            'print(result)'
          }
          steps={[
            { line: 0, note: "Создан исходный список с одной задачей.", vars: { original: '[{"title": "Git"}]' } },
            { line: 1, note: "copy создаёт новый внешний список.", vars: { result: '[{"title": "Git"}]' } },
            { line: 2, note: "Новая задача добавляется только в result.", vars: { "len(original)": "1", "len(result)": "2" } },
            { line: 3, note: "Исходный список не изменился.", vars: { original: '[{"title": "Git"}]' } },
            { line: 4, note: "Новый список содержит две записи.", vars: { result: '[{"title": "Git"}, {"title": "SQL"}]' } },
          ]}
        />

        <TrueFalse
          statement={
            <>
              <code>tasks.copy()</code> создаёт глубокие независимые копии всех словарей внутри списка.
            </>
          }
          isTrue={false}
          explanation="Копируется только внешний список; вложенные словари остаются теми же объектами."
        />
      </Section>

      <Section number="06" title="Один формат вывода для всех задач">
        <Lead>
          Представьте, что каждая карточка печатается по одному шаблону. Если значок статуса или порядок полей
          изменится, лучше исправить один шаблон <code>format_task()</code>, а не несколько разных участков проекта.
    
        </Lead>

        <CodeBlock
          caption="форматирование одной задачи"
          code={
            'def format_task(task):\n' +
            '    mark = "x" if task["is_done"] else " "\n' +
            '    return (\n' +
            '        f"[{mark}] {task[\'id\']}. {task[\'title\']} "\n' +
            '        f"(приоритет {task[\'priority\']})"\n' +
            '    )'
          }
        />

        <CodeBlock
          caption="вывод всего списка"
          code={
            'def show_tasks(tasks):\n' +
            '    if not tasks:\n' +
            '        print("Задач пока нет")\n' +
            '        return\n\n' +
            '    for task in tasks:\n' +
            '        print(format_task(task))'
          }
        />

        <PredictOutput
          code={
            'tasks = [\n' +
            '    {"id": 1, "title": "SQL", "priority": 3, "is_done": False},\n' +
            '    {"id": 2, "title": "Git", "priority": 2, "is_done": True},\n' +
            ']\n' +
            'for task in tasks:\n' +
            '    mark = "x" if task["is_done"] else " "\n' +
            '    print(f"[{mark}] {task[\'id\']}. {task[\'title\']}")'
          }
          output={"[ ] 1. SQL\n[x] 2. Git"}
          hint="Знак зависит только от is_done."
        />

        <Callout tone="info">
          Пустой список — нормальное состояние нового приложения. Для него нужен понятный текст, а не обращение к{" "}
          <code>tasks[0]</code>.
        </Callout>
      </Section>

      <Section number="07" title="Подключаем добавление к меню">
        <Lead>
          Обработчик меню похож на сотрудника у стойки: он спрашивает данные, вызывает готовые правила и показывает
          результат. Он не должен заново придумывать форму карточки, правило id или формат вывода.
    
        </Lead>

        <CodeSequence
          title="Соберите сценарий добавления"
          prompt="Расположите действия в безопасном порядке."
          pieces={[
            { id: "read", code: 'title = input("Название: ")' },
            { id: "validate", code: "if not is_valid_title(title):\n    return" },
            { id: "id", code: "task_id = get_next_id(tasks)" },
            { id: "create", code: "task = create_task(task_id, title, priority)" },
            { id: "append", code: "add_task(tasks, task)" },
          ]}
          correctOrder={["read", "validate", "id", "create", "append"]}
          explanation="Некорректные данные отсеиваются до создания и изменения списка."
        />

        <BugHunt
          code={
            'def handle_add(tasks):\n' +
            '    title = input("Название: ")\n' +
            '    task = create_task(1, title, 3)\n' +
            '    tasks.append(task)\n' +
            '    if title.strip() == "":\n' +
            '        print("Пустое название")'
          }
          question="Какая проблема уже произошла до сообщения об ошибке?"
          options={[
            "Некорректная задача уже добавлена",
            "Список автоматически очистился",
            "create_task вернула None",
          ]}
          correctIndex={0}
          explanation="Проверка выполняется после изменения состояния."
          fix={
            'def handle_add(tasks):\n' +
            '    title = input("Название: ")\n' +
            '    if title.strip() == "":\n' +
            '        print("Пустое название")\n' +
            '        return\n' +
            '    task = create_task(1, title, 3)\n' +
            '    tasks.append(task)'
          }
        />

        <Callout>
          Команда <code>2</code> может вызывать короткий обработчик{" "}
          <code>handle_list(tasks)</code>, который делегирует работу функции <code>show_tasks()</code>.
        </Callout>
      </Section>

      <Section number="08" title="Проверьте основную модель">
        <div className="lesson-check-group">
          <QuizCard
            question="Почему форма словаря должна быть стабильной?"
            options={["функции ожидают одинаковые ключи", "иначе list не работает", "так требует Git"]}
            correctIndex={0}
            explanation="Создание, поиск и вывод должны одинаково понимать модель."
          />
          <QuizCard
            question="Почему новая задача получает is_done=False?"
            options={["это правило проекта", "bool всегда False", "иначе id не создастся"]}
            correctIndex={0}
            explanation="Новая задача ещё не завершена."
          />
          <QuizCard
            question="Зачем в платформенной задаче использовать copy?"
            options={["не менять исходный список", "иначе нельзя добавить словарь", "для преобразования типов"]}
            correctIndex={0}
            explanation="Возвращается новая версия состояния."
          />
          <QuizCard
            question="Зачем выделять format_task?"
            options={["единое правило отображения", "ускорить input", "заменить словарь"]}
            correctIndex={0}
            explanation="Формат меняется в одном месте."
          />
        </div>

        <KeyTakeaways
          points={[
            <>Одна задача — словарь, все задачи — список словарей.</>,
            <>Данные проверяются до добавления.</>,
            <>Форма модели создаётся одной функцией.</>,
            <>Правило id должно учитывать удаление.</>,
            <><code>append</code> изменяет список, а <code>copy</code> помогает вернуть новый.</>,
            <>Пустой список обрабатывается явно.</>,
          ]}
        />

        <PracticeCta text="Подключите добавление и вывод к меню, затем решите задачи на создание словаря и новую копию списка." />
      </Section>
    </RichLesson>
  );
}

// 18. Проект: поиск, статус и статистика
export function Lesson18({ module }: { module?: string }) {
  return (
    <RichLesson>
      <RichHero
        variant="project"
        chip={module ?? "Блок 4 · Проект StudyHub"}
        title="Проект: поиск, статус и статистика"
        intro="Научим StudyHub находить задачу, безопасно менять её статус и считать прогресс, не смешивая поиск, изменение данных и вывод сообщений."
        tags={[
          { icon: <Search size={14} />, label: "поиск и None" },
          { icon: <BarChart3 size={14} />, label: "статистика" },
        ]}
      />
      <TheoryBridge lesson={18} />

      <Section number="01" title="Поиск, изменение и подсчёт — разные шаги">
        <Lead>
          Работа с задачей напоминает обращение в архив. Сначала нужно найти нужную карточку, затем отдельно изменить
          её, а сводный отчёт строится ещё одной функцией. Если смешать эти действия, код станет труднее проверять.
    
        </Lead>

        <div className="lesson-route">
          <ol>
            <li>
              <strong>Найти задачу:</strong> пройти список и вернуть словарь либо{" "}
              <code className="lesson-token">None</code>.
            </li>
            <li>
              <strong>Изменить безопасно:</strong> проверить результат поиска и только затем обновить{" "}
              <code className="lesson-token">is_done</code>.
            </li>
            <li>
              <strong>Посчитать прогресс:</strong> отдельно получить количество выполненных задач и процент.
            </li>
          </ol>
          <p>
            Дополнительно вы разберёте тип id, ранний <code>return</code>, пустой список и поиск по фрагменту
            названия.
          </p>
        </div>

        <Callout tone="info">
          Для каждой функции заранее проговорите два результата: что она вернёт при успехе и что вернёт, если
          подходящей задачи нет.
        </Callout>
      </Section>

      <Section number="02" title="Ищем карточку по номеру">
        <Lead>
          Список похож на папку без отдельного алфавитного указателя. Чтобы найти карточку с нужным id, функция
          просматривает задачи по одной и завершает поиск сразу после совпадения.
    
        </Lead>

        <StepThrough
          code={
            'tasks = [\n' +
            '    {"id": 1, "title": "Python"},\n' +
            '    {"id": 2, "title": "SQL"},\n' +
            '    {"id": 3, "title": "Git"},\n' +
            ']\n' +
            'task_id = 2\n' +
            'for task in tasks:\n' +
            '    if task["id"] == task_id:\n' +
            '        result = task\n' +
            '        break'
          }
          steps={[
            { line: 5, note: "Искомый id равен 2.", vars: { task_id: "2" } },
            { line: 6, note: "Первая итерация получает задачу с id 1.", vars: { "task['id']": "1" } },
            { line: 7, note: "1 == 2 ложно, цикл идёт дальше.", vars: { условие: "False" } },
            { line: 6, note: "Вторая итерация получает задачу с id 2.", vars: { "task['id']": "2" } },
            { line: 7, note: "2 == 2 истинно.", vars: { условие: "True" } },
            { line: 8, note: "Найденный словарь сохраняется как результат.", vars: { "result['title']": '"SQL"' } },
          ]}
        />

        <CodeBlock
          caption="рабочий контракт поиска"
          code={
            'def find_task(tasks, task_id):\n' +
            '    for task in tasks:\n' +
            '        if task["id"] == task_id:\n' +
            '            return task\n\n' +
            '    return None'
          }
        />

        <BugHunt
          code={
            'def find_task(tasks, task_id):\n' +
            '    for task in tasks:\n' +
            '        if task["id"] == task_id:\n' +
            '            return task\n' +
            '        return None'
          }
          question="Почему функция проверяет только первый элемент?"
          options={[
            "return None находится внутри цикла",
            "Словари нельзя сравнивать по id",
            "Нужен while вместо for",
          ]}
          correctIndex={0}
          explanation="После первой неудачной проверки функция немедленно завершается."
          fix={
            'def find_task(tasks, task_id):\n' +
            '    for task in tasks:\n' +
            '        if task["id"] == task_id:\n' +
            '            return task\n' +
            '    return None'
          }
        />
      </Section>

      <Section number="03" title="Что вернуть, если карточка не найдена">
        <Lead>
          Архивариус может вернуть найденную карточку или прийти с пустыми руками. В Python явное отсутствие объекта
          обозначается значением <code>None</code>. Оно не притворяется повреждённой задачей и требует отдельной
          проверки.
    
        </Lead>

        <CompareSolutions
          question="Что лучше вернуть при отсутствии задачи?"
          left={{
            title: "Пустой словарь",
            code: "return {}",
            note: "Может быть принят за настоящую, но повреждённую задачу.",
          }}
          right={{
            title: "Явное отсутствие",
            code: "return None",
            note: "Контракт однозначно сообщает, что результата нет.",
          }}
          preferred="right"
          explanation="None не маскируется под объект предметной области."
        />

        <CodeBlock
          code={
            'task = find_task(tasks, task_id)\n\n' +
            'if task is None:\n' +
            '    print("Задача не найдена")\n' +
            'else:\n' +
            '    print(task["title"])'
          }
        />

        <MatchPairs
          prompt="Соедините исход поиска с результатом."
          pairs={[
            { left: "id найден", right: "словарь задачи" },
            { left: "id отсутствует", right: "None" },
            { left: "список пуст", right: "None" },
          ]}
          explanation="Один контракт работает для обычного и пустого списка."
        />

        <Callout>
          Не смешивайте в одном проекте <code>None</code>, <code>{"{}"}</code>, <code>False</code> и строку{" "}
          <code>"not found"</code> как четыре разных сигнала одной ситуации.
        </Callout>
      </Section>

      <Section number="04" title="Меняем статус только найденной задачи">
        <Lead>
          Нельзя ставить отметку на карточке, которой нет. Сначала <code>find_task()</code> возвращает словарь или
          <code>None</code>. Только найденная задача получает новое значение <code>is_done</code>.
    
        </Lead>

        <StepThrough
          code={
            'def mark_task_done(tasks, task_id):\n' +
            '    task = find_task(tasks, task_id)\n' +
            '    if task is None:\n' +
            '        return False\n' +
            '    task["is_done"] = True\n' +
            '    return True'
          }
          steps={[
            { line: 1, note: "Поиск возвращает словарь или None.", vars: { task: "словарь / None" } },
            { line: 2, note: "Отсутствие проверяется до доступа к полям.", vars: { проверка: "task is None" } },
            { line: 3, note: "Если задачи нет, функция сообщает False.", vars: { результат: "False" } },
            { line: 4, note: "Для найденного словаря поле меняется на True.", vars: { "task['is_done']": "True" } },
            { line: 5, note: "True сообщает интерфейсу об успешном изменении.", vars: { результат: "True" } },
          ]}
        />

        <TrueFalse
          statement={
            <>
              Словарь, возвращённый <code>find_task()</code>, является независимой копией и его изменение не влияет на
              список.
            </>
          }
          isTrue={false}
          explanation="Функция возвращает тот же словарь, который находится внутри списка."
        />

        <CompareSolutions
          question="Кто должен выбирать текст сообщения?"
          left={{
            title: "Бизнес-функция печатает",
            code:
              'def mark_task_done(...):\n' +
              '    print("Готово")',
            note: "Функцию сложнее тестировать и переиспользовать.",
          }}
          right={{
            title: "Функция возвращает результат",
            code:
              'changed = mark_task_done(tasks, task_id)\n' +
              'if changed:\n    print("Готово")',
            note: "Интерфейс решает, что показать пользователю.",
          }}
          preferred="right"
          explanation="Изменение данных и отображение сообщения имеют разные ответственности."
        />
      </Section>

      <Section number="05" title="Считаем результат без участия меню">
        <Lead>
          Статистика похожа на табло: она читает текущие карточки и вычисляет количество, остаток и прогресс.
          Табло не должно само спрашивать пользователя, какую кнопку он нажал, поэтому функции статистики получают
          список аргументом и возвращают данные.
    
        </Lead>

        <CodeBlock
          caption="считаем выполненные задачи"
          code={
            'def count_done(tasks):\n' +
            '    completed = 0\n\n' +
            '    for task in tasks:\n' +
            '        if task.get("is_done", False):\n' +
            '            completed += 1\n\n' +
            '    return completed'
          }
        />

        <CodeBlock
          caption="строим сводку"
          code={
            'def build_statistics(tasks):\n' +
            '    total = len(tasks)\n' +
            '    completed = count_done(tasks)\n' +
            '    left = total - completed\n\n' +
            '    return {\n' +
            '        "total": total,\n' +
            '        "completed": completed,\n' +
            '        "left": left,\n' +
            '    }'
          }
        />

        <PredictOutput
          code={
            'tasks = [\n' +
            '    {"is_done": True},\n' +
            '    {"is_done": False},\n' +
            '    {},\n' +
            ']\n' +
            'completed = 0\n' +
            'for task in tasks:\n' +
            '    if task.get("is_done", False):\n' +
            '        completed += 1\n' +
            'print(completed)'
          }
          output={"1"}
          hint="Отсутствующий is_done считается False."
        />

        <Callout tone="info">
          Использование <code>get("is_done", False)</code> — явное правило совместимости со старыми или неполными
          тестовыми данными.
        </Callout>
      </Section>

      <Section number="06" title="Что делать, когда задач пока нет">
        <Lead>
          Новое приложение может пока не содержать задач. Это нормальное состояние, как пустая папка в первый день.
          До формулы процента нужно отдельно договориться, какой результат показывать при общем количестве
          <code>0</code>.
    
        </Lead>

        <BugHunt
          code={
            'def completion_percent(tasks):\n' +
            '    completed = count_done(tasks)\n' +
            '    return round(completed / len(tasks) * 100, 1)'
          }
          question="На каком входе функция падает?"
          options={[
            "На пустом списке",
            "Когда все задачи выполнены",
            "Когда одна задача имеет priority=0",
          ]}
          correctIndex={0}
          explanation="len([]) равен нулю, поэтому деление невозможно."
          fix={
            'def completion_percent(tasks):\n' +
            '    if not tasks:\n' +
            '        return 0.0\n' +
            '    completed = count_done(tasks)\n' +
            '    return round(completed / len(tasks) * 100, 1)'
          }
        />

        <MatchPairs
          prompt="Соедините состояние с процентом."
          pairs={[
            { left: "пустой список", right: "0.0" },
            { left: "0 из 3 выполнено", right: "0.0" },
            { left: "1 из 2 выполнено", right: "50.0" },
            { left: "2 из 3 выполнено", right: "66.7" },
            { left: "3 из 3 выполнено", right: "100.0" },
          ]}
          explanation="Пустой список обрабатывается до формулы."
        />

        <RecallCard
          question="Почему 0.0 для пустого списка — правило проекта, а не единственно возможная математика?"
          answer={
            <p>
              У ситуации нет естественного деления completed / total, потому что total равен нулю. Проект выбирает
              удобный и документированный результат для интерфейса.
            </p>
          }
        />
      </Section>

      <Section number="07" title="Поиск по названию и связь с меню">
        <Lead>
          Поиск по id возвращает не более одной карточки. Поиск по фрагменту названия похож на фильтр каталога:
          совпадений может быть несколько, поэтому результатом становится новый список задач.
    
        </Lead>

        <CodeBlock
          caption="поиск всех совпадений"
          code={
            'def search_tasks(tasks, query):\n' +
            '    cleaned_query = query.strip().lower()\n' +
            '    result = []\n\n' +
            '    if cleaned_query == "":\n' +
            '        return result\n\n' +
            '    for task in tasks:\n' +
            '        if cleaned_query in task["title"].lower():\n' +
            '            result.append(task)\n\n' +
            '    return result'
          }
        />

        <CodeSequence
          title="Обработчик завершения задачи"
          prompt="Расположите шаги так, чтобы неверный id не изменил данные."
          pieces={[
            { id: "read", code: 'task_id_text = input("ID: ").strip()' },
            { id: "validate", code: "if not task_id_text.isdigit():\n    return" },
            { id: "convert", code: "task_id = int(task_id_text)" },
            { id: "change", code: "changed = mark_task_done(tasks, task_id)" },
            { id: "message", code: 'print("Готово" if changed else "Не найдено")' },
          ]}
          correctOrder={["read", "validate", "convert", "change", "message"]}
          explanation="Строка проверяется до int(), затем бизнес-функция возвращает результат для интерфейса."
        />

        <Callout>
          Пустой запрос содержится в любой строке, поэтому без отдельной проверки{" "}
          <code>"" in title</code> вернёт <code>True</code> для всех задач.
        </Callout>
      </Section>

      <Section number="08" title="Проверьте основную модель">
        <div className="lesson-check-group">
          <QuizCard
            question="Почему поиск по id надёжнее поиска по названию?"
            options={["id должен быть уникальным", "строки нельзя сравнивать", "название не хранится"]}
            correctIndex={0}
            explanation="Одинаковые названия допустимы, одинаковые id — нет."
          />
          <QuizCard
            question="Что возвращает find_task при отсутствии совпадения?"
            options={["None", "случайную задачу", "обязательно ошибку"]}
            correctIndex={0}
            explanation="None является явным сигналом отсутствия."
          />
          <QuizCard
            question="Где должен находиться return None?"
            options={["после цикла", "внутри первой итерации", "до цикла"]}
            correctIndex={0}
            explanation="Сначала нужно проверить все элементы."
          />
          <QuizCard
            question="Что проверить перед вычислением процента?"
            options={["список не пуст", "все id чётные", "title не содержит пробелы"]}
            correctIndex={0}
            explanation="Иначе произойдёт деление на ноль."
          />
        </div>

        <KeyTakeaways
          points={[
            <>Поиск возвращает словарь или <code>None</code>.</>,
            <><code>return None</code> находится после полного обхода.</>,
            <>Статус меняется только после успешного поиска.</>,
            <>Статистика возвращает данные, а интерфейс их печатает.</>,
            <>Пустой список обрабатывается до деления.</>,
            <>Текстовый поиск нормализует обе стороны.</>,
          ]}
        />

        <PracticeCta text="Добавьте поиск, завершение и статистику в StudyHub, затем решите задачи на id и процент." />
      </Section>
    </RichLesson>
  );
}

// 19. README, .gitignore и публикация
export function Lesson19({ module }: { module?: string }) {
  return (
    <RichLesson>
      <RichHero
        variant="project"
        chip={module ?? "Блок 4 · Проект StudyHub"}
        title="README, .gitignore и публикация"
        intro="Подготовим проект к передаче другому человеку: README объяснит запуск, .gitignore уберёт лишние файлы, а Git-история покажет понятные этапы разработки."
        tags={[
          { icon: <FileText size={14} />, label: "README и запуск" },
          { icon: <FolderGit2 size={14} />, label: "Git и публикация" },
        ]}
      />
      <TheoryBridge lesson={19} />

      <Section number="01" title="Что нужно подготовить перед публикацией">
        <Lead>
          Перед передачей устройства в коробку кладут инструкцию, проверяют комплект и убирают личные данные.
          С проектом так же: сначала проверяется запуск, затем README, состав будущего коммита и только после этого
          выполняется <code>git push</code>.
    
        </Lead>

        <div className="lesson-route">
          <ol>
            <li>
              <strong>Объяснить проект:</strong> README описывает назначение, возможности и ограничения.
            </li>
            <li>
              <strong>Сделать запуск воспроизводимым:</strong> другой человек выполняет конкретные команды без устных
              подсказок.
            </li>
            <li>
              <strong>Проверить историю:</strong> <code className="lesson-token">git status</code>,{" "}
              <code className="lesson-token">git diff --staged</code> и осмысленные коммиты предшествуют push.
            </li>
          </ol>
          <p>
            Дополнительно вы разберёте назначение <code>.gitignore</code>, опасность уже отслеживаемых секретов и
            проверку репозитория после публикации.
          </p>
        </div>

        <Callout tone="info">
          Проверка README простая: сможет ли другой человек понять назначение проекта и запустить его без
          устных подсказок автора.
        </Callout>
      </Section>

      <Section number="02" title="README как инструкция внутри коробки">
        <Lead>
          README похож на инструкцию внутри коробки с устройством. Человек впервые видит проект и должен быстро
          понять, что он делает, что требуется для запуска и какие ограничения есть у текущей версии.
    
        </Lead>

        <CodeBlock
          caption="минимальная структура"
          code={
            '# StudyHub Planner\n\n' +
            'Консольный планировщик учебных задач на Python.\n\n' +
            '## Возможности\n\n' +
            '## Требования\n\n' +
            '## Установка и запуск\n\n' +
            '## Использование\n\n' +
            '## Ограничения'
          }
        />

        <TypeCards>
          <TypeCard badge="что" title="Описание">
            Что делает приложение и для какого сценария оно создано.
          </TypeCard>
          <TypeCard badge="как" badgeTone="float" title="Запуск">
            Какие команды нужно выполнить в новой папке.
          </TypeCard>
          <TypeCard badge="границы" badgeTone="str" title="Ограничения">
            Что сознательно ещё не реализовано.
          </TypeCard>
        </TypeCards>

        <CompareSolutions
          question="Какое описание полезнее?"
          left={{
            title: "Общее",
            code: "Это мой учебный проект.",
            note: "Не объясняет назначение и возможности.",
          }}
          right={{
            title: "Конкретное",
            code:
              "Консольный планировщик учебных задач на Python.\n" +
              "Поддерживает добавление, завершение и статистику.",
            note: "Читатель понимает результат до запуска.",
          }}
          preferred="right"
          explanation="Описание должно отвечать, что получит пользователь."
        />
      </Section>

      <Section number="03" title="Документация не должна обещать лишнего">
        <Lead>
          Инструкция должна описывать устройство, которое действительно лежит в коробке. Если README обещает
          сохранение данных, а задачи исчезают после перезапуска, документация вводит пользователя в заблуждение.
    
        </Lead>

        <CompareSolutions
          question="Как описать хранение данных первого месяца?"
          left={{
            title: "Скрыть ограничение",
            code: "Задачи сохраняются в приложении.",
            note: "Фраза может создать ожидание сохранения после перезапуска.",
          }}
          right={{
            title: "Сказать точно",
            code:
              "Данные хранятся только в памяти программы\n" +
              "и исчезают после завершения процесса.",
            note: "Ограничение текущей версии понятно заранее.",
          }}
          preferred="right"
          explanation="Честное ограничение показывает понимание архитектуры, а не слабость проекта."
        />

        <TrueFalse
          statement={
            <>
              README можно обновить заранее, добавив возможности следующей версии, чтобы репозиторий выглядел
              серьёзнее.
            </>
          }
          isTrue={false}
          explanation="Документация должна соответствовать текущему поведению."
        />

        <RecallCard
          question="Когда README нужно проверять на актуальность?"
          answer={
            <p>
              После изменения пользовательского поведения, команды запуска, структуры файлов, требований или
              известных ограничений.
            </p>
          }
        />
      </Section>

      <Section number="04" title="Другой человек должен повторить запуск">
        <Lead>
          Хорошая инструкция похожа на маршрут с конкретными поворотами. Читатель не должен угадывать папку, имя
          файла или порядок команд. Каждый шаг нужно предварительно повторить в новой папке.
    
        </Lead>

        <CodeBlock
          caption="Windows PowerShell"
          code={
            'git clone <адрес-репозитория>\n' +
            'cd studyhub-planner\n\n' +
            'python -m venv .venv\n' +
            '.\\.venv\\Scripts\\Activate.ps1\n\n' +
            'python main.py'
          }
        />

        <CodeSequence
          title="Порядок чистого запуска"
          prompt="Расположите действия в правильном порядке."
          pieces={[
            { id: "clone", code: "git clone <url>" },
            { id: "cd", code: "cd studyhub-planner" },
            { id: "venv", code: "python -m venv .venv" },
            { id: "activate", code: ".\\.venv\\Scripts\\Activate.ps1" },
            { id: "run", code: "python main.py" },
          ]}
          correctOrder={["clone", "cd", "venv", "activate", "run"]}
          explanation="Сначала создаётся локальная копия и выбирается папка, затем окружение и запуск."
        />

        <Callout>
          Лучший тест инструкции — выполнить её в новой папке строго по README, не используя знания, которых там нет.
        </Callout>
      </Section>

      <Section number="05" title=".gitignore как список «не упаковывать»">
        <Lead>
          <code>.gitignore</code> похож на список вещей, которые нельзя класть в посылку: виртуальное окружение,
          служебные файлы и секреты. Но если предмет уже отправили раньше, новый список не вернёт его из истории.
    
        </Lead>

        <CodeBlock
          caption="базовые правила"
          code={'.venv/\n__pycache__/\n*.pyc\n.env'}
        />

        <MatchPairs
          prompt="Соедините правило с причиной."
          pairs={[
            { left: ".venv/", right: "окружение воспроизводится и зависит от системы" },
            { left: "__pycache__/", right: "служебные файлы Python" },
            { left: "*.pyc", right: "скомпилированные технические файлы" },
            { left: ".env", right: "может содержать токены и пароли" },
          ]}
          explanation="Исходный код и документация остаются в Git, воспроизводимые и секретные файлы — нет."
        />

        <TrueFalse
          statement={
            <>
              Если <code>.env</code> уже был закоммичен, достаточно добавить его в{" "}
              <code>.gitignore</code>, и секрет станет безопасным.
            </>
          }
          isTrue={false}
          explanation="Файл уже находится в истории; секрет нужно заменить и отдельно убрать отслеживание."
        />

        <Callout>
          <code>.gitignore</code> — профилактика, а не машина времени. Скомпрометированный токен нужно отозвать или
          заменить.
        </Callout>
      </Section>

      <Section number="06" title="Проверяем, что попадёт в коммит">
        <Lead>
          <code>git status</code> показывает список подготовленных коробок, а <code>git diff --staged</code>
          позволяет открыть их и увидеть точное содержимое будущего коммита. Это последняя проверка перед созданием
          точки истории.
    
        </Lead>

        <MatchPairs
          prompt="Соедините команду с вопросом, на который она отвечает."
          pairs={[
            { left: "git status", right: "какие файлы новые, изменённые и staged?" },
            { left: "git diff", right: "что изменено, но ещё не добавлено?" },
            { left: "git diff --staged", right: "что войдёт в следующий коммит?" },
            { left: "git log --oneline", right: "как выглядит история проекта?" },
          ]}
          explanation="Команды проверяют разные уровни состояния репозитория."
        />

        <CodeSequence
          title="Безопасный коммит"
          prompt="Расположите действия перед публикацией."
          pieces={[
            { id: "run", code: "python main.py" },
            { id: "status", code: "git status" },
            { id: "add", code: "git add main.py README.md .gitignore" },
            { id: "diff", code: "git diff --staged" },
            { id: "commit", code: 'git commit -m "write setup instructions"' },
          ]}
          correctOrder={["run", "status", "add", "diff", "commit"]}
          explanation="Сначала проверяется поведение, затем состав и содержимое коммита."
        />

        <BugHunt
          code={
            'git add .\n' +
            'git commit -m "final"\n' +
            'git push'
          }
          question="Чего не хватает перед публикацией?"
          options={[
            "Проверки status, staged diff и локального запуска",
            "Удаления README",
            "Преобразования main.py в строку",
          ]}
          correctIndex={0}
          explanation="Массовое добавление без проверки может включить окружение, секреты и временные файлы."
          fix={
            'python main.py\n' +
            'git status\n' +
            'git add main.py README.md .gitignore\n' +
            'git diff --staged\n' +
            'git commit -m "write setup instructions"\n' +
            'git push'
          }
        />
      </Section>

      <Section number="07" title="Публикуем понятную историю проекта">
        <Lead>
          История Git похожа на журнал этапов сборки. Сообщения <code>add task creation</code> и
          <code>write setup instructions</code> объясняют развитие проекта. Названия вроде <code>final2</code> не
          помогают восстановить смысл изменений.
    
        </Lead>

        <CompareSolutions
          question="Какая история полезнее?"
          left={{
            title: "Непонятные точки",
            code: "fix\nupdate\nfinal\nfinal2",
            note: "Нельзя восстановить смысл изменений.",
          }}
          right={{
            title: "Этапы проекта",
            code:
              "create planner menu\n" +
              "add task creation\n" +
              "add search and statistics\n" +
              "write setup instructions",
            note: "Каждый коммит описывает законченную возможность.",
          }}
          preferred="right"
          explanation="История должна показывать развитие, а не настроение автора."
        />

        <CodeBlock
          caption="финальная локальная проверка"
          code={
            'python main.py\n' +
            'git status\n' +
            'git diff --staged\n' +
            'git log --oneline\n' +
            'git push'
          }
        />

        <div className="lesson-practice-steps">
          <p>
            После публикации откройте репозиторий: README должен отображаться, <code>.venv</code> и{" "}
            <code>.env</code> должны отсутствовать, а <code>main.py</code> — находиться в ожидаемом месте.
          </p>
          <p>
            <code>push</code> не исправляет ошибку запуска, не создаёт документацию и не удаляет секреты.
          </p>
        </div>
      </Section>

      <Section number="08" title="Проверьте основную модель">
        <div className="lesson-check-group">
          <QuizCard
            question="Для кого пишется README?"
            options={["для автора и другого разработчика", "только для Python", "только для GitHub"]}
            correctIndex={0}
            explanation="Документ должен быть полезен человеку без контекста проекта."
          />
          <QuizCard
            question="Что делает .gitignore?"
            options={["предотвращает добавление совпадающих новых файлов", "удаляет историю", "запускает тесты"]}
            correctIndex={0}
            explanation="Уже отслеживаемые файлы он автоматически не удаляет."
          />
          <QuizCard
            question="Почему .env не коммитят?"
            options={["там могут быть секреты", "это всегда пустой файл", "Python его не читает"]}
            correctIndex={0}
            explanation="Токены и пароли не должны попадать в историю."
          />
          <QuizCard
            question="Что показывает git diff --staged?"
            options={["будущий коммит", "только удалённые ветки", "версию Python"]}
            correctIndex={0}
            explanation="Команда показывает подготовленные изменения."
          />
        </div>

        <KeyTakeaways
          points={[
            <>README описывает фактическое поведение и запуск.</>,
            <>Ограничения проекта указываются честно.</>,
            <><code>.gitignore</code> предотвращает случайное добавление файлов.</>,
            <>Уже опубликованный секрет нужно заменить.</>,
            <><code>git diff --staged</code> проверяет будущий коммит.</>,
            <><code>git push</code> публикует готовую локальную историю.</>,
          ]}
        />

        <PracticeCta text="Оформите README и .gitignore, проверьте staged diff и опубликуйте чистый репозиторий." />
      </Section>
    </RichLesson>
  );
}

// 20. Контрольная точка месяца
export function Lesson20({ module }: { module?: string }) {
  return (
    <RichLesson>
      <RichHero
        variant="project"
        chip={module ?? "Блок 4 · Проект StudyHub"}
        title="Контрольная точка месяца"
        intro="Проведём практическую защиту Console StudyHub Planner: запустим проект, объясним путь данных, проверим границы и внесём небольшое изменение без переписывания всей программы."
        tags={[
          { icon: <Trophy size={14} />, label: "защита проекта" },
          { icon: <CheckCircle2 size={14} />, label: "граничные случаи" },
        ]}
      />
      <TheoryBridge lesson={20} />

      <Section number="01" title="Как пройдёт защита проекта">
        <Lead>
          Контрольная точка похожа не на тест по определениям, а на практический экзамен по вождению. Недостаточно
          назвать правила: нужно запустить проект, объяснить свои действия, пройти неудобный сценарий и безопасно
          внести небольшую правку.
    
        </Lead>

        <div className="lesson-route">
          <ol>
            <li>
              <strong>Запустить и продемонстрировать:</strong> пройти пользовательский сценарий по README.
            </li>
            <li>
              <strong>Объяснить устройство:</strong> проследить данные от{" "}
              <code className="lesson-token">input()</code> до словаря в списке.
            </li>
            <li>
              <strong>Изменить и проверить:</strong> найти ответственную функцию, внести минимальную правку и повторить
              старые сценарии.
            </li>
          </ol>
          <p>
            В конце вы покажете чистый <code>git status</code>, историю коммитов и честное ограничение хранения данных
            только в памяти.
          </p>
        </div>

        <Callout tone="info">
          На защите важнее самостоятельно объяснить и изменить знакомый проект, чем добавить технологию,
          которую ученик пока не понимает.
        </Callout>
      </Section>

      <Section number="02" title="Минимальный готовый результат">
        <Lead>
          Для защиты не нужны дополнительные технологии ради впечатления. Достаточно законченного консольного
          проекта, который запускается по README, хранит задачи в памяти, устойчиво обрабатывает ввод и имеет
          понятную Git-историю.
    
        </Lead>

        <CodeBlock
          caption="минимальная структура"
          code={
            'studyhub-planner/\n' +
            '├── .gitignore\n' +
            '├── README.md\n' +
            '└── main.py'
          }
        />

        <TypeCards>
          <TypeCard badge="интерфейс" title="Меню" code={"run()"}>
            Показывает команды, проверяет ввод и завершает приложение.
          </TypeCard>
          <TypeCard badge="данные" badgeTone="float" title="Задачи" code={"tasks: list[dict]"}>
            Список словарей хранится в памяти процесса.
          </TypeCard>
          <TypeCard badge="история" badgeTone="str" title="Git и README" code={"git log --oneline"}>
            Репозиторий объясняет запуск и развитие проекта.
          </TypeCard>
        </TypeCards>

        <MatchPairs
          prompt="Соедините требование с доказательством."
          pairs={[
            { left: "меню устойчиво", right: "неизвестная команда не ломает цикл" },
            { left: "модель едина", right: "все задачи имеют одинаковые ключи" },
            { left: "поиск безопасен", right: "отсутствующий id даёт None" },
            { left: "проект передаваем", right: "запуск воспроизводится по README" },
          ]}
          explanation="На защите важно показать наблюдаемое поведение, а не только рассказать о нём."
        />

        <Callout>
          JSON, классы, база данных и FastAPI не требуются. Их раннее добавление не компенсирует непонимание функций,
          циклов и словарей.
        </Callout>
      </Section>

      <Section number="03" title="Проследите путь одной задачи">
        <Lead>
          Представьте одну новую карточку задачи и проследите её путь: пользователь вводит данные, обработчик получает
          их, функция создаёт словарь, список сохраняет его, а форматирование превращает карточку в строку на экране.
    
        </Lead>

        <CodeSequence
          title="Путь новой задачи"
          prompt="Расположите этапы полного сценария."
          pieces={[
            { id: "input", code: 'command = input("Команда: ")' },
            { id: "validate", code: "is_valid_command(command)" },
            { id: "handler", code: "handle_add(tasks)" },
            { id: "create", code: "task = create_task(task_id, title, priority)" },
            { id: "append", code: "add_task(tasks, task)" },
            { id: "show", code: "show_tasks(tasks)" },
            { id: "format", code: "format_task(task)" },
          ]}
          correctOrder={["input", "validate", "handler", "create", "append", "show", "format"]}
          explanation="Интерфейс получает и проверяет ввод, модель создаётся отдельно, затем состояние отображается."
        />

        <RecallCard
          question="Какие проблемы видны, если путь данных невозможно объяснить?"
          answer={
            <p>
              Функции могут скрыто зависеть от глобальных переменных, проверка может происходить после изменения,
              форматирование — дублироваться, а обработчики — выполнять слишком много действий.
            </p>
          }
        />

        <Callout>
          Хороший ответ описывает не только названия функций, но и то,{" "}
          <span className="lesson-emphasis">какое значение передаётся на каждом шаге</span>.
        </Callout>
      </Section>

      <Section number="04" title="Объясните функцию по четырём вопросам">
        <Lead>
          Объяснение функции похоже на описание инструмента. Нужно назвать, что он получает, что возвращает, меняет
          ли переданные данные и что происходит на пустых или граничных значениях.
    
        </Lead>

        <CompareSolutions
          question="Какой ответ показывает понимание find_task?"
          left={{
            title: "Слишком общий",
            code: "Она обрабатывает задачи и ищет нужную.",
            note: "Неясны типы, результат и отсутствие совпадения.",
          }}
          right={{
            title: "Контрактный",
            code:
              "Получает список словарей и целый id.\n" +
              "Возвращает найденный словарь или None.\n" +
              "Исходный список не изменяет.",
            note: "Названы вход, выход и поведение.",
          }}
          preferred="right"
          explanation="Сильное объяснение можно проверить на конкретных данных."
        />

        <CodeBlock
          caption="пять вопросов к функции"
          code={
            '1. Какие аргументы принимает?\n' +
            '2. Какого они типа?\n' +
            '3. Что возвращает?\n' +
            '4. Меняет ли переданные объекты?\n' +
            '5. Какие пустые и граничные случаи обработаны?'
          }
        />

        <TrueFalse
          statement={
            <>
              Любая функция с <code>return</code> является чистой.
            </>
          }
          isTrue={false}
          explanation="Функция может менять список или словарь и при этом возвращать результат."
        />

        <RecallCard
          question="Как объяснить побочный эффект mark_task_done?"
          answer={
            <p>
              Функция находит словарь внутри списка, меняет его поле <code>is_done</code> и возвращает boolean,
              сообщающий, произошло ли изменение.
            </p>
          }
        />
      </Section>

      <Section number="05" title="Пройдите условия и циклы вручную">
        <Lead>
          Трассировка похожа на просмотр записи с камер по кадрам. На каждом шаге называются текущие значения,
          результат условия, выбранная ветка и изменение накопителя. Итог не угадывается заранее.
    
        </Lead>

        <StepThrough
          code={
            'priority = 4\n' +
            'if priority == 5:\n' +
            '    label = "critical"\n' +
            'elif priority >= 3:\n' +
            '    label = "normal"\n' +
            'else:\n' +
            '    label = "low"'
          }
          steps={[
            { line: 0, note: "priority равен 4.", vars: { priority: "4" } },
            { line: 1, note: "4 == 5 ложно.", vars: { условие: "False" } },
            { line: 3, note: "4 >= 3 истинно.", vars: { условие: "True" } },
            { line: 4, note: 'Выбирается label = "normal".', vars: { label: '"normal"' } },
            { line: 5, note: "Остальные ветки цепочки не проверяются.", vars: { label: '"normal"' } },
          ]}
        />

        <PredictOutput
          code={
            'tasks = [\n' +
            '    {"is_done": True},\n' +
            '    {"is_done": False},\n' +
            '    {"is_done": True},\n' +
            ']\n' +
            'completed = 0\n' +
            'for task in tasks:\n' +
            '    if task.get("is_done", False):\n' +
            '        completed += 1\n' +
            'print(completed)'
          }
          output={"2"}
          hint="Накопитель увеличивается только для True."
        />

        <MatchPairs
          prompt="Соедините элемент цикла меню с его ролью."
          pairs={[
            { left: "while True", right: "начинает повтор интерфейса" },
            { left: "continue", right: "возвращает к меню после неверного ввода" },
            { left: "break", right: "завершает приложение по команде выхода" },
            { left: "tasks", right: "сохраняет состояние между итерациями" },
          ]}
          explanation="У каждого элемента управляющего цикла есть отдельная роль."
        />
      </Section>

      <Section number="06" title="Проверьте неудобные сценарии">
        <Lead>
          Рабочий пример показывает только удобную дорогу. Надёжность проверяют на неудобных случаях: пустой список,
          пробелы вместо названия, значения рядом с границей, неизвестная команда и отсутствующий id.
    
        </Lead>

        <TypeCards>
          <TypeCard badge="пусто" title="Нет задач" code={"show_tasks([])"}>
            Выводится понятное сообщение, статистика не делит на ноль.
          </TypeCard>
          <TypeCard badge="границы" badgeTone="float" title="Приоритет" code={"0, 1, 5, 6"}>
            Значения 1 и 5 допустимы, соседние — нет.
          </TypeCard>
          <TypeCard badge="не найдено" badgeTone="str" title="Отсутствующий id" code={"find_task(tasks, 999)"}>
            Возвращается <code>None</code>, случайная задача не меняется.
          </TypeCard>
        </TypeCards>

        <BugHunt
          code={
            'def completion_percent(tasks):\n' +
            '    completed = count_done(tasks)\n' +
            '    return completed / len(tasks) * 100'
          }
          question="Какой обязательный сценарий не обработан?"
          options={[
            "Пустой список",
            "Приоритет 5",
            "Название в нижнем регистре",
          ]}
          correctIndex={0}
          explanation="Для пустого списка len(tasks) равен нулю."
          fix={
            'def completion_percent(tasks):\n' +
            '    if not tasks:\n' +
            '        return 0.0\n' +
            '    completed = count_done(tasks)\n' +
            '    return round(completed / len(tasks) * 100, 1)'
          }
        />

        <CodeBlock
          caption="минимальная матрица ручной проверки"
          code={
            'пустой список\n' +
            'название "" и "   "\n' +
            'приоритеты 0, 1, 5, 6\n' +
            'неизвестная команда\n' +
            'отсутствующий id\n' +
            '0%, частичный прогресс, 100%'
          }
        />
      </Section>

      <Section number="07" title="Внесите небольшое изменение самостоятельно">
        <Lead>
          Небольшое изменение показывает устройство проекта лучше подготовленной демонстрации. Нужно найти функцию,
          которая отвечает за правило, изменить минимальную область и повторить старые и новые сценарии.
    
        </Lead>

        <CodeSequence
          title="Безопасное изменение проекта"
          prompt="Расположите этапы после запроса наставника."
          pieces={[
            { id: "locate", code: "найти функцию, отвечающую за правило" },
            { id: "change", code: "внести минимальное изменение" },
            { id: "old", code: "повторить старый рабочий сценарий" },
            { id: "new", code: "проверить новое поведение и границу" },
            { id: "diff", code: "посмотреть git diff" },
            { id: "commit", code: "сделать отдельный коммит" },
          ]}
          correctOrder={["locate", "change", "old", "new", "diff", "commit"]}
          explanation="Изменение считается готовым только после регрессионной и новой проверки."
        />

        <CodeBlock
          caption="сценарий защиты"
          code={
            '1. Запустить проект по README.\n' +
            '2. Добавить две задачи.\n' +
            '3. Завершить одну задачу.\n' +
            '4. Показать статистику.\n' +
            '5. Найти отсутствующий id.\n' +
            '6. Объяснить функцию.\n' +
            '7. Выполнить небольшую правку.\n' +
            '8. Показать git status и git log --oneline.'
          }
        />

        <CompareSolutions
          question="Что показывает хорошую декомпозицию?"
          left={{
            title: "Изменение размазано",
            code: "Для нового формата нужно исправить пять функций.",
            note: "Правило представления дублируется.",
          }}
          right={{
            title: "Изменение локально",
            code: "Новый формат меняется только в format_task().",
            note: "Ответственность сосредоточена в одном месте.",
          }}
          preferred="right"
          explanation="Маленькая область изменения снижает риск случайной поломки."
        />

        <Callout tone="info">
          После правки обязательно повторите старый сценарий. Успешное новое поведение не гарантирует отсутствие
          регрессии.
        </Callout>
      </Section>

      <Section number="08" title="Проверьте готовность к защите">
        <div className="lesson-check-group">
          <QuizCard
            question="Что должна вернуть solve?"
            options={["результат", "только print", "Git-коммит"]}
            correctIndex={0}
            explanation="Платформа сравнивает возвращённое значение."
          />
          <QuizCard
            question="Какая структура хранит одну задачу?"
            options={["словарь", "множество", "строка"]}
            correctIndex={0}
            explanation="Поля одной записи хранятся по ключам."
          />
          <QuizCard
            question="Что хранит все задачи?"
            options={["список словарей", "один bool", "только README"]}
            correctIndex={0}
            explanation="Список сохраняет порядок нескольких записей."
          />
          <QuizCard
            question="Что проверить до смены статуса?"
            options={["задача найдена", "GitHub открыт", "список отсортирован"]}
            correctIndex={0}
            explanation="Нельзя менять поля у None."
          />
        </div>

        <KeyTakeaways
          points={[
            <>Рабочий проект нужно уметь объяснить и изменить.</>,
            <>Путь данных связывает интерфейс, функции и состояние.</>,
            <>Контракт функции включает вход, выход и побочные эффекты.</>,
            <>Граничные случаи являются частью требований.</>,
            <>Небольшая правка показывает качество декомпозиции.</>,
            <>README и Git-история входят в результат разработки.</>,
          ]}
        />

        <PracticeCta text="Пройдите полный сценарий защиты, решите две итоговые задачи и подготовьте объяснение трёх функций." />
      </Section>
    </RichLesson>
  );
}