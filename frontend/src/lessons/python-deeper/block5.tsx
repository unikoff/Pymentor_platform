import {
  AlertTriangle,
  Braces,
  Bug,
  FunctionSquare,
  GitFork,
  Layers,
  ListChecks,
  Puzzle,
  Scale,
  ShieldCheck,
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
} from "../shared";

type TheoryBridgeData = { link: string; boundary: string };

const THEORY_BRIDGES: Record<number, TheoryBridgeData> = {
  21: {"link":"Console Planner уже умеет решать задачи первого месяца, поэтому сначала понимаем его внешний контракт и только потом меняем внутренности.","boundary":"Рефакторинг не должен незаметно менять поведение программы; новая структура ценна только при прежнем результате."},
  22: {"link":"Знакомая функция становится контрактом: до деталей тела нужно назвать вход, правило и результат.","boundary":"Функция не обязана печатать то, что возвращает: вывод и значение для другой части программы остаются разными ролями."},
  23: {"link":"Способ вызова входит в контракт: позиционные аргументы связываются порядком, именованные — названием, значение по умолчанию делает параметр необязательным.","boundary":"Именованный аргумент не отменяет обязательность параметра: имя должно совпасть, а нужные данные всё равно передаются."},
  24: {"link":"Функция получает объекты через имена, поэтому важно различать локальную переменную, переприсваивание и изменение самого списка.","boundary":"Глобальная переменная доступна, но скрывает зависимость; полезнее показывать нужные данные в параметрах."},
  25: {"link":"Звёздочка меняет форму передачи значений: *args собирает позиционные, **kwargs — именованные, распаковка делает обратное.","boundary":"Эти конструкции не делают контракт яснее сами по себе; явные параметры лучше, когда набор данных известен."},
  26: {"link":"Функцию можно хранить и передавать как значение: callback получает ясный момент вызова, а замыкание помнит настройку.","boundary":"Замыкание не требует магии или декораторов: важно увидеть, какую внешнюю переменную хранит возвращённая функция."},
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


const BLOCK_TITLE = "Блок 5 · Функции и поток данных";

// 21. Аудит Console Planner: от сценария к функциям
export function Lesson21({ module }: { module?: string }) {
  return (
    <RichLesson>
      <RichHero
        variant="project"
        chip={module ?? BLOCK_TITLE}
        title="Аудит Console Planner: от сценария к функциям"
        intro="Вернёмся к готовому Console Planner и посмотрим на него глазами разработчика: найдём смешанные ответственности, повторения и скрытые зависимости, а затем составим безопасный план рефакторинга без изменения поведения программы."
        tags={[
          { icon: <ListChecks size={14} />, label: "карта поведения" },
          { icon: <GitFork size={14} />, label: "рефакторинг по шагам" },
        ]}
      />
      <TheoryBridge lesson={21} />

      <Section number="01" title="Новая задача: понять программу до изменения">
        <Lead>
          До этого мы в основном добавляли возможности. Теперь цель другая: научиться читать уже работающий код и
          менять его так, чтобы пользователь не заметил поломки. Такой процесс называется рефакторингом.
        </Lead>

        <div className="lesson-route">
          <ol>
            <li>
              <strong>Зафиксировать поведение:</strong> перечислить команды меню, входные данные и ожидаемые
              результаты.
            </li>
            <li>
              <strong>Найти ответственности:</strong> отделить ввод, правила, изменение данных и вывод.
            </li>
            <li>
              <strong>Менять маленькими шагами:</strong> после каждого шага запускать сценарии и делать отдельный
              коммит.
            </li>
          </ol>
          <p>
            Результатом занятия станет карта функций Console Planner и первая безопасная правка одной перегруженной
            функции.
          </p>
        </div>

        <Callout tone="info">
          Рефакторинг меняет устройство кода, но сохраняет наблюдаемое поведение программы.
        </Callout>
      </Section>

      <Section number="02" title="Сначала фиксируем внешний контракт приложения">
        <Lead>
          Пользователь видит не имена функций, а команды и результаты. Перед изменением кода нужно записать, что
          именно считается правильной работой приложения.
        </Lead>

        <TypeCards>
          <TypeCard badge="вход" title="Что получает программа" code={'command = "1"\ntitle = "Изучить функции"'}>
            Команда меню и данные, которые вводит пользователь.
          </TypeCard>
          <TypeCard badge="правило" badgeTone="float" title="Что должна проверить" code={'title.strip() != ""'}>
            Название не пустое, приоритет находится в диапазоне, идентификатор существует.
          </TypeCard>
          <TypeCard badge="результат" badgeTone="str" title="Что наблюдает пользователь" code={'Задача добавлена: #4'}>
            Новое состояние списка и понятное сообщение в терминале.
          </TypeCard>
        </TypeCards>

        <MethodGrid
          rows={[
            [<>1. Добавить задачу</>, "создаёт корректную запись и увеличивает список"],
            [<>2. Показать задачи</>, "не изменяет состояние, только форматирует вывод"],
            [<>3. Изменить статус</>, "находит задачу и меняет одно поле"],
            [<>4. Удалить задачу</>, "удаляет только найденную запись"],
            [<>5. Выйти</>, "завершает цикл меню"],
          ]}
        />

        <RecallCard
          question="Почему до рефакторинга полезно вручную пройти основные команды меню?"
          hint="Подумайте, как понять, что после правки программа работает так же."
          answer={
            <p>
              Ручной прогон создаёт исходную точку сравнения. После каждого изменения можно повторить те же сценарии
              и убедиться, что изменилось устройство кода, а не поведение для пользователя.
            </p>
          }
        />
      </Section>

      <Section number="03" title="Одна большая функция скрывает несколько работ">
        <Lead>
          Перегруженная функция похожа на сотрудника, который одновременно принимает заявку, проверяет документы,
          меняет базу и печатает отчёт. Любая правка затрагивает слишком много действий сразу.
        </Lead>

        <CodeBlock
          caption="смешанные ответственности"
          code={
            'def handle_add(tasks):\n' +
            '    title = input("Название: ").strip()\n' +
            '    if title == "":\n' +
            '        print("Название обязательно")\n' +
            '        return\n' +
            '    priority = int(input("Приоритет: "))\n' +
            '    if priority < 1 or priority > 5:\n' +
            '        print("Неверный приоритет")\n' +
            '        return\n' +
            '    task = {"id": len(tasks) + 1, "title": title, "priority": priority}\n' +
            '    tasks.append(task)\n' +
            '    print(f"Добавлена задача #{task[\'id\']}")'
          }
        />

        <MatchPairs
          prompt="Соедините строку кода с её ответственностью."
          leftTitle="Действие"
          rightTitle="Ответственность"
          pairs={[
            { left: 'input("Название")', right: "получение данных" },
            { left: 'title == ""', right: "валидация" },
            { left: "создание словаря", right: "модель данных" },
            { left: "tasks.append(task)", right: "изменение состояния" },
            { left: "print(...)", right: "интерфейс" },
          ]}
          explanation="Одна функция выполняет пять разных видов работы, поэтому её трудно проверять отдельно."
        />

        <Callout>
          Длина функции сама по себе не является ошибкой. Проблема появляется, когда функция отвечает на несколько
          разных вопросов и меняется по нескольким независимым причинам.
        </Callout>
      </Section>

      <Section number="04" title="Карта вызовов показывает поток данных">
        <Lead>
          Перед переносом строк полезно нарисовать простой маршрут: какая функция кого вызывает и какие данные
          передаёт дальше.
        </Lead>

        <CodeBlock
          caption="целевая карта"
          code={
            'run()\n' +
            '  └── handle_add(tasks)\n' +
            '        ├── read_priority()\n' +
            '        ├── is_valid_title(title)\n' +
            '        ├── create_task(task_id, title, priority)\n' +
            '        └── add_task(tasks, task)'
          }
        />

        <TypeCards>
          <TypeCard badge="handler" title="Связывает интерфейс и правила" code="handle_add(tasks)">
            Получает ввод и вызывает готовые функции, но не хранит внутри все правила проекта.
          </TypeCard>
          <TypeCard badge="rule" badgeTone="float" title="Чистая проверка" code="is_valid_title(title) -> bool">
            Получает значение и возвращает ответ без input, print и изменения списка.
          </TypeCard>
          <TypeCard badge="state" badgeTone="str" title="Изменение состояния" code="add_task(tasks, task)">
            Явно получает список и добавляемую задачу.
          </TypeCard>
        </TypeCards>

        <TrueFalse
          statement={
            <>
              Если функция использует глобальный список <code>tasks</code>, зависимость от состояния всё равно
              существует, просто она не видна в параметрах.
            </>
          }
          isTrue={true}
          explanation="Передача списка аргументом делает зависимость явной и облегчает проверку функции."
        />
      </Section>

      <Section number="05" title="Безопасный рефакторинг делается маленькими шагами">
        <Lead>
          Не нужно сразу переписывать весь проект. Надёжнее выделить одну функцию, проверить сценарии и только затем
          двигаться дальше.
        </Lead>

        <CodeSequence
          title="Соберите порядок безопасного изменения"
          prompt="Расположите действия так, чтобы поломку было легко найти."
          pieces={[
            { id: "baseline", code: "зафиксировать рабочий сценарий" },
            { id: "extract", code: "выделить одну функцию" },
            { id: "run", code: "повторить сценарий" },
            { id: "commit", code: "сделать отдельный Git-коммит" },
            { id: "next", code: "перейти к следующей ответственности" },
          ]}
          correctOrder={["baseline", "extract", "run", "commit", "next"]}
          explanation="Маленькие изменения ограничивают область поиска ошибки и дают понятную историю Git."
        />

        <CompareSolutions
          question="Какой коммит легче проверить и при необходимости отменить?"
          left={{
            title: "Большая перестройка",
            code: "refactor entire app",
            note: "Одновременно изменены меню, модель, вывод и идентификаторы.",
          }}
          right={{
            title: "Одна ответственность",
            code: "extract title validation",
            note: "Изменено только правило проверки названия.",
          }}
          preferred="right"
          explanation="Узкий коммит показывает одну идею и уменьшает риск случайных изменений."
        />
      </Section>

      <Section number="06" title="Выделяем первую чистую функцию">
        <Lead>
          Начнём с правила, которое легко отделить от интерфейса: название задачи должно содержать хотя бы один
          непробельный символ.
        </Lead>

        <StepThrough
          code={
            'def is_valid_title(title):\n' +
            '    cleaned = title.strip()\n' +
            '    return cleaned != ""\n\n' +
            'raw_title = "   SQL   "\n' +
            'result = is_valid_title(raw_title)'
          }
          steps={[
            { line: 4, note: "Исходная строка передаётся как аргумент.", vars: { raw_title: '"   SQL   "' } },
            { line: 1, note: "Внутри функции создаётся очищенная строка.", vars: { cleaned: '"SQL"' } },
            { line: 2, note: "Непустая строка даёт True.", vars: { результат: "True" } },
            { line: 5, note: "Возвращённый ответ сохраняется в result.", vars: { result: "True" } },
          ]}
        />

        <CompareSolutions
          question="Какая версия проще проверяется отдельными вызовами?"
          left={{
            title: "Правило привязано к терминалу",
            code: 'def check_title():\n    title = input("Название: ")\n    print(title.strip() != "")',
            note: "Нужен ручной ввод, результат только печатается.",
          }}
          right={{
            title: "Правило получает и возвращает данные",
            code: 'def is_valid_title(title):\n    return title.strip() != ""',
            note: "Можно вызвать с любым значением и сравнить результат.",
          }}
          preferred="right"
          explanation="Чистая функция не знает, откуда пришла строка и где будет использован ответ."
        />

        <FillBlank
          prompt="Завершите функцию так, чтобы она возвращала bool."
          before={'def is_valid_title(title):\n    return title.strip() '}
          after={' ""'}
          options={["!=", "=", "+"]}
          answer="!="
          explanation="Непустая очищенная строка должна отличаться от пустой строки."
        />
      </Section>

      <Section number="07" title="Практикум: составляем паспорт функций">
        <Lead>
          Для каждой функции проекта запишите короткий паспорт: имя, входные данные, результат и побочный эффект.
          Это подготовка к полноценному контракту функции в следующем занятии.
        </Lead>

        <MethodGrid
          rows={[
            [<>is_valid_title(title)</>, "получает str, возвращает bool, состояние не меняет"],
            [<>find_task(tasks, task_id)</>, "получает список и id, возвращает dict или None"],
            [<>format_task(task)</>, "получает словарь, возвращает str"],
            [<>add_task(tasks, task)</>, "получает список и словарь, изменяет список"],
            [<>show_tasks(tasks)</>, "получает список, печатает строки"],
          ]}
        />

        <BugHunt
          code={
            'def find_task(task_id):\n' +
            '    for task in tasks:\n' +
            '        if task["id"] == task_id:\n' +
            '            return task'
          }
          question="Какая зависимость скрыта внутри функции?"
          options={[
            "Глобальный список tasks",
            "Тип task_id",
            "Команда return",
          ]}
          correctIndex={0}
          explanation="Функция использует объект, которого нет среди параметров."
          fix={
            'def find_task(tasks, task_id):\n' +
            '    for task in tasks:\n' +
            '        if task["id"] == task_id:\n' +
            '            return task\n' +
            '    return None'
          }
        />
      </Section>

      <Section number="08" title="Контрольная точка и GitHub-результат">
        <Lead>
          После занятия программа может выглядеть почти так же, но её устройство становится понятнее. Это и есть
          первый профессиональный результат блока.
        </Lead>

        <div className="lesson-check-group">
          <QuizCard
            question="Что обязательно сохраняется при рефакторинге?"
            options={["Внешнее поведение", "Количество строк", "Все старые имена переменных"]}
            correctIndex={0}
            explanation="Внутреннее устройство можно менять, но пользовательские сценарии должны работать так же."
          />
          <QuizCard
            question="Что означает одна ответственность функции?"
            options={["Одна причина для изменения", "Один параметр", "Одна строка кода"]}
            correctIndex={0}
            explanation="Функция решает одну связанную задачу и меняется по одной основной причине."
          />
          <QuizCard
            question="Зачем передавать tasks параметром?"
            options={["Сделать зависимость явной", "Скопировать список автоматически", "Ускорить цикл"]}
            correctIndex={0}
            explanation="По сигнатуре видно, какие данные нужны функции."
          />
        </div>

        <KeyTakeaways
          points={[
            <>До изменения кода нужно зафиксировать рабочее поведение.</>,
            <>Ввод, правила, состояние и вывод являются разными ответственностями.</>,
            <>Карта вызовов показывает направление передачи данных.</>,
            <>Глобальная переменная скрывает зависимость, но не устраняет её.</>,
            <>Рефакторинг выполняется маленькими проверяемыми шагами.</>,
            <>Первый результат блока — карта функций и один узкий коммит рефакторинга.</>,
          ]}
        />

        <PracticeCta text="Откройте Console Planner, составьте паспорт пяти функций, выделите is_valid_title() и сохраните изменение отдельным коммитом refactor: extract title validation." />
      </Section>
    </RichLesson>
  );
}

// 22. Функция как контракт: вход, правило, результат
export function Lesson22({ module }: { module?: string }) {
  return (
    <RichLesson>
      <RichHero
        chip={module ?? BLOCK_TITLE}
        title="Функция как контракт: вход, правило, результат"
        intro="Углубим знакомство с функциями: научимся описывать их как договор между частями программы, различать return и print, замечать побочные эффекты и проектировать результат до написания тела функции."
        tags={[
          { icon: <FunctionSquare size={14} />, label: "вход → правило → выход" },
          { icon: <ShieldCheck size={14} />, label: "явный контракт" },
        ]}
      />
      <TheoryBridge lesson={22} />

      <Section number="01" title="Функция обещает предсказуемое поведение">
        <Lead>
          Контракт функции отвечает на четыре вопроса: какие данные она получает, какие значения допустимы, что
          возвращает и меняет ли что-нибудь вне себя.
        </Lead>

        <div className="lesson-route">
          <ol>
            <li><strong>Определить вход:</strong> какие параметры нужны и что они означают.</li>
            <li><strong>Сформулировать правило:</strong> какое преобразование или проверка выполняется.</li>
            <li><strong>Выбрать выход:</strong> значение какого типа возвращается при успехе и особом случае.</li>
            <li><strong>Назвать эффект:</strong> меняется ли переданный объект, файл или терминал.</li>
          </ol>
          <p>В конце занятия вы перепроектируете несколько функций StudyHub по явным контрактам.</p>
        </div>

        <Callout tone="info">
          Хорошую функцию можно использовать, зная её имя, параметры и обещанный результат, не читая каждую строку тела.
        </Callout>
      </Section>

      <Section number="02" title="Сигнатура показывает способ вызова">
        <Lead>
          Строка с <code>def</code> похожа на заголовок инструкции: она сообщает имя действия и перечень входных
          значений.
        </Lead>

        <CodeBlock
          caption="сигнатура и тело"
          code={
            'def calculate_progress(completed, total):\n' +
            '    if total == 0:\n' +
            '        return 0\n' +
            '    return completed / total * 100'
          }
        />

        <MatchPairs
          prompt="Соедините часть функции с её ролью."
          pairs={[
            { left: "calculate_progress", right: "имя функции" },
            { left: "completed, total", right: "параметры" },
            { left: "total == 0", right: "особый случай" },
            { left: "return ...", right: "результат вызова" },
          ]}
          explanation="Сигнатура описывает вызов, тело реализует обещанное правило."
        />

        <PredictOutput
          code={
            'def calculate_progress(completed, total):\n' +
            '    if total == 0:\n' +
            '        return 0\n' +
            '    return completed / total * 100\n\n' +
            'print(calculate_progress(3, 4))\n' +
            'print(calculate_progress(0, 0))'
          }
          output={'75.0\n0'}
          hint="Сначала проверьте особый случай total == 0."
        />
      </Section>

      <Section number="03" title="return и print решают разные задачи">
        <Lead>
          <code>return</code> передаёт значение вызывающему коду. <code>print</code> только показывает текст в
          терминале. Напечатанный результат нельзя автоматически использовать в следующем вычислении.
        </Lead>

        <CompareSolutions
          question="Какая функция подходит для дальнейших вычислений?"
          left={{
            title: "Только показывает",
            code: 'def double(value):\n    print(value * 2)',
            note: "Функция не возвращает число и неявно возвращает None.",
          }}
          right={{
            title: "Возвращает значение",
            code: 'def double(value):\n    return value * 2',
            note: "Результат можно сохранить, сравнить или передать дальше.",
          }}
          preferred="right"
          explanation="Вычислительная функция обычно возвращает данные, а интерфейс решает, печатать ли их."
        />

        <StepThrough
          code={
            'def double(value):\n' +
            '    print(value * 2)\n\n' +
            'result = double(5)\n' +
            'print(result)'
          }
          steps={[
            { line: 3, note: "Начинается вызов double(5).", vars: { value: "5" } },
            { line: 1, note: "В терминал выводится 10.", vars: { вывод: "10" } },
            { line: 3, note: "Явного return нет, поэтому вызов возвращает None.", vars: { result: "None" } },
            { line: 4, note: "Вторая команда print показывает None.", vars: { вывод: "10 ⏎ None" } },
          ]}
        />

        <BugHunt
          code={
            'def get_task_title(task):\n' +
            '    print(task["title"])\n\n' +
            'title = get_task_title({"title": "SQL"})\n' +
            'print(title.upper())'
          }
          question="Почему вызов upper завершится ошибкой?"
          options={[
            "title содержит None, потому что функция только печатает",
            "Словарь нельзя передавать функции",
            "Метод upper работает только внутри return",
          ]}
          correctIndex={0}
          explanation="Напечатанная строка не стала возвращённым значением."
          fix={
            'def get_task_title(task):\n' +
            '    return task["title"]\n\n' +
            'title = get_task_title({"title": "SQL"})\n' +
            'print(title.upper())'
          }
        />
      </Section>

      <Section number="04" title="Чистый результат и побочный эффект">
        <Lead>
          Побочный эффект — изменение, заметное вне возвращённого значения: изменение списка, запись файла,
          печать или изменение глобальной переменной.
        </Lead>

        <TypeCards>
          <TypeCard badge="чистая" title="Возвращает новое значение" code={'def normalize(title):\n    return title.strip()'}>
            Для одинакового входа возвращает одинаковый результат и не меняет внешнее состояние.
          </TypeCard>
          <TypeCard badge="эффект" badgeTone="float" title="Изменяет объект" code={'def add_task(tasks, task):\n    tasks.append(task)'}>
            Изменение списка видно вызывающему коду.
          </TypeCard>
          <TypeCard badge="интерфейс" badgeTone="str" title="Печатает" code={'def show_message(text):\n    print(text)'}>
            Результат наблюдается в терминале, а не возвращается как данные.
          </TypeCard>
        </TypeCards>

        <TrueFalse
          statement={
            <>
              Побочный эффект всегда является ошибкой и должен быть полностью запрещён.
            </>
          }
          isTrue={false}
          explanation="Приложению нужны эффекты, но они должны быть намеренными, ограниченными и понятными по контракту."
        />

        <RecallCard
          question="Почему полезно отделять calculate_statistics() от show_statistics()?"
          answer={
            <p>
              Первая функция может вернуть словарь с числами и легко проверяться. Вторая отвечает только за
              отображение. Изменение текста интерфейса не затрагивает формулу расчёта.
            </p>
          }
        />
      </Section>

      <Section number="05" title="Ранний return делает особые случаи видимыми">
        <Lead>
          Ранний возврат завершает функцию, когда продолжать основной сценарий бессмысленно. Это уменьшает
          вложенность и показывает защитные условия в начале.
        </Lead>

        <CompareSolutions
          question="Какая версия проще читается сверху вниз?"
          left={{
            title: "Глубокая вложенность",
            code:
              'def completion_rate(tasks):\n' +
              '    if tasks:\n' +
              '        completed = 0\n' +
              '        for task in tasks:\n' +
              '            if task["is_done"]:\n' +
              '                completed += 1\n' +
              '        return completed / len(tasks) * 100\n' +
              '    else:\n' +
              '        return 0',
            note: "Основной сценарий находится внутри большого if.",
          }}
          right={{
            title: "Защитный возврат",
            code:
              'def completion_rate(tasks):\n' +
              '    if not tasks:\n' +
              '        return 0\n\n' +
              '    completed = 0\n' +
              '    for task in tasks:\n' +
              '        if task["is_done"]:\n' +
              '            completed += 1\n' +
              '    return completed / len(tasks) * 100',
            note: "Пустой список обработан сразу, основной путь не вложен.",
          }}
          preferred="right"
          explanation="Особый случай завершает функцию в начале, а основной алгоритм остаётся на одном уровне."
        />

        <CodeSequence
          title="Соберите функцию безопасного поиска"
          prompt="Функция должна вернуть найденную задачу или None."
          pieces={[
            { id: "def", code: "def find_task(tasks, task_id):" },
            { id: "loop", code: "    for task in tasks:" },
            { id: "check", code: '        if task["id"] == task_id:' },
            { id: "found", code: "            return task" },
            { id: "missing", code: "    return None" },
          ]}
          correctOrder={["def", "loop", "check", "found", "missing"]}
          explanation="return None находится после полного цикла, поэтому поиск проверяет все записи."
        />
      </Section>

      <Section number="06" title="Проектируем результат до тела функции">
        <Lead>
          Перед написанием кода полезно записать примеры вызовов. Они заставляют заранее решить, что функция
          возвращает в обычном, граничном и ошибочном сценарии.
        </Lead>

        <CodeBlock
          caption="контракт через примеры"
          code={
            '# find_task(tasks, 2) -> словарь задачи\n' +
            '# find_task(tasks, 999) -> None\n\n' +
            '# is_valid_priority(1) -> True\n' +
            '# is_valid_priority(5) -> True\n' +
            '# is_valid_priority(0) -> False\n\n' +
            '# format_task(task) -> строка\n' +
            '# исходный task не изменяется'
          }
        />

        <MethodGrid
          rows={[
            [<>обычный случай</>, "типичное допустимое значение"],
            [<>нижняя граница</>, "минимальное допустимое значение"],
            [<>верхняя граница</>, "максимальное допустимое значение"],
            [<>пустой ввод</>, "пустая строка или коллекция"],
            [<>отсутствие</>, "объект не найден"],
          ]}
        />

        <FillBlank
          prompt="Завершите контракт проверки приоритета."
          before={'def is_valid_priority(priority):\n    return '}
          after={''}
          options={["1 <= priority <= 5", "priority == 5", "bool(priority)"]}
          answer="1 <= priority <= 5"
          explanation="Контракт включает обе границы диапазона от 1 до 5."
        />
      </Section>

      <Section number="07" title="Практикум: функции слоя правил StudyHub">
        <Lead>
          Перепишите три функции так, чтобы интерфейс не был смешан с вычислением: проверка приоритета, поиск задачи
          и расчёт статистики.
        </Lead>

        <CodeBlock
          caption="целевые контракты"
          code={
            'def is_valid_priority(priority):\n' +
            '    return 1 <= priority <= 5\n\n' +
            'def find_task(tasks, task_id):\n' +
            '    for task in tasks:\n' +
            '        if task["id"] == task_id:\n' +
            '            return task\n' +
            '    return None\n\n' +
            'def calculate_statistics(tasks):\n' +
            '    total = len(tasks)\n' +
            '    completed = 0\n' +
            '    for task in tasks:\n' +
            '        if task["is_done"]:\n' +
            '            completed += 1\n' +
            '    return {"total": total, "completed": completed}'
          }
        />

        <BugHunt
          code={
            'def calculate_statistics(tasks):\n' +
            '    completed = 0\n' +
            '    for task in tasks:\n' +
            '        if task["is_done"]:\n' +
            '            completed += 1\n' +
            '    print(completed)'
          }
          question="Что мешает использовать результат в другой функции?"
          options={[
            "Значение печатается, но не возвращается",
            "Цикл for нельзя использовать в функции",
            "completed должен быть строкой",
          ]}
          correctIndex={0}
          explanation="Интерфейс получает вывод, но вызывающий код получает None."
          fix={
            'def calculate_statistics(tasks):\n' +
            '    completed = 0\n' +
            '    for task in tasks:\n' +
            '        if task["is_done"]:\n' +
            '            completed += 1\n' +
            '    return completed'
          }
        />
      </Section>

      <Section number="08" title="Проверьте контракт функции">
        <div className="lesson-check-group">
          <QuizCard
            question="Что возвращает функция без явного return?"
            options={["None", "0", "Последний print"]}
            correctIndex={0}
            explanation="Python неявно возвращает None."
          />
          <QuizCard
            question="Что является побочным эффектом?"
            options={["Изменение переданного списка", "Создание локальной переменной", "Сравнение чисел"]}
            correctIndex={0}
            explanation="Изменение списка заметно вне функции."
          />
          <QuizCard
            question="Где лучше обрабатывать пустой список?"
            options={["Явным особым случаем контракта", "Случайным try/except", "Нигде"]}
            correctIndex={0}
            explanation="Поведение для пустого входа должно быть заранее определено."
          />
        </div>

        <KeyTakeaways
          points={[
            <>Контракт описывает вход, правило, результат и побочные эффекты.</>,
            <><code>return</code> передаёт значение к месту вызова.</>,
            <><code>print</code> отображает данные, но не заменяет return.</>,
            <>Побочные эффекты допустимы, если они явны и ограничены.</>,
            <>Ранний return делает особые случаи заметнее.</>,
            <>Примеры вызовов помогают спроектировать функцию до реализации.</>,
          ]}
        />

        <PracticeCta text="Опишите контракты is_valid_priority(), find_task() и calculate_statistics(), реализуйте их без input/print и проверьте минимум по три сценария для каждой." />
      </Section>
    </RichLesson>
  );
}

// 23. Позиционные, именованные аргументы и значения по умолчанию
export function Lesson23({ module }: { module?: string }) {
  return (
    <RichLesson>
      <RichHero
        chip={module ?? BLOCK_TITLE}
        title="Позиционные, именованные аргументы и значения по умолчанию"
        intro="Научимся вызывать одну функцию разными способами: передавать значения по позиции и по имени, проектировать безопасные значения по умолчанию и читать TypeError как сообщение о нарушенном контракте вызова."
        tags={[
          { icon: <Puzzle size={14} />, label: "позиция и имя" },
          { icon: <Scale size={14} />, label: "значения по умолчанию" },
        ]}
      />
      <TheoryBridge lesson={23} />

      <Section number="01" title="Одна функция, несколько форм вызова">
        <Lead>
          Аргументы можно сопоставить параметрам по порядку или по имени. Оба способа вызывают одну и ту же функцию,
          но отличаются читаемостью и устойчивостью к ошибкам.
        </Lead>

        <div className="lesson-route">
          <ol>
            <li><strong>Позиционный вызов:</strong> значения сопоставляются слева направо.</li>
            <li><strong>Именованный вызов:</strong> значение явно связывается с параметром.</li>
            <li><strong>Значение по умолчанию:</strong> параметр становится необязательным для вызова.</li>
            <li><strong>Проверка контракта:</strong> TypeError объясняет пропущенные, лишние и повторные значения.</li>
          </ol>
          <p>В практике вы улучшите функции создания и фильтрации задач StudyHub.</p>
        </div>

        <Callout tone="info">
          Чем больше параметров одного типа, тем полезнее именованные аргументы: они показывают смысл каждого значения прямо в вызове.
        </Callout>
      </Section>

      <Section number="02" title="Позиционные аргументы зависят от порядка">
        <Lead>
          При позиционном вызове первое значение получает первый параметр, второе — второй и так далее. Python не
          угадывает смысл по содержимому.
        </Lead>

        <StepThrough
          code={
            'def create_task(title, priority, is_done):\n' +
            '    return {\n' +
            '        "title": title,\n' +
            '        "priority": priority,\n' +
            '        "is_done": is_done,\n' +
            '    }\n\n' +
            'task = create_task("SQL", 4, False)'
          }
          steps={[
            { line: 7, note: 'Первый аргумент попадает в title.', vars: { title: '"SQL"' } },
            { line: 7, note: 'Второй аргумент попадает в priority.', vars: { priority: "4" } },
            { line: 7, note: 'Третий аргумент попадает в is_done.', vars: { is_done: "False" } },
            { line: 1, note: 'Функция собирает словарь из сопоставленных значений.', vars: { task: "dict" } },
          ]}
        />

        <PredictOutput
          code={
            'def describe_range(start, end):\n' +
            '    return f"{start}..{end}"\n\n' +
            'print(describe_range(1, 5))\n' +
            'print(describe_range(5, 1))'
          }
          output={'1..5\n5..1'}
          hint="Порядок аргументов не исправляется автоматически."
        />

        <BugHunt
          code={'task = create_task(4, "SQL", False)'}
          question="Почему словарь получится логически неверным, хотя вызов может выполниться?"
          options={[
            "Позиции title и priority перепутаны",
            "Boolean нельзя передавать третьим",
            "Функция принимает только именованные аргументы",
          ]}
          correctIndex={0}
          explanation="Python сопоставляет значения по порядку и не знает, что строка ожидалась раньше числа."
          fix={'task = create_task("SQL", 4, False)'}
        />
      </Section>

      <Section number="03" title="Именованные аргументы показывают намерение">
        <Lead>
          Именованный аргумент записывается как <code>parameter=value</code>. Порядок таких аргументов можно менять,
          потому что связь указана явно.
        </Lead>

        <CompareSolutions
          question="Какой вызов легче проверить глазами?"
          left={{
            title: "Только позиции",
            code: 'create_task("SQL", 4, False)',
            note: "Нужно помнить порядок трёх параметров.",
          }}
          right={{
            title: "Явные имена",
            code: 'create_task(title="SQL", priority=4, is_done=False)',
            note: "Назначение каждого значения видно в месте вызова.",
          }}
          preferred="right"
          explanation="Именованные аргументы особенно полезны для флагов, числовых настроек и длинных вызовов."
        />

        <TrueFalse
          statement={
            <>
              Вызов <code>create_task(is_done=False, title="SQL", priority=4)</code> допустим, если все параметры
              переданы по имени.
            </>
          }
          isTrue={true}
          explanation="Именованные аргументы сопоставляются по именам, поэтому их порядок не определяет результат."
        />

        <MatchPairs
          prompt="Соедините форму вызова с её свойством."
          pairs={[
            { left: 'filter_tasks(tasks, False, 5)', right: "кратко, но смысл чисел и флага скрыт" },
            { left: 'filter_tasks(tasks, is_done=False, limit=5)', right: "смысл значений виден" },
            { left: 'filter_tasks(tasks=tasks, limit=5)', right: "все переданные параметры названы" },
          ]}
          explanation="Выбор формы вызова зависит от читаемости, а не от стремления всегда писать меньше символов."
        />
      </Section>

      <Section number="04" title="Сначала позиционные, затем именованные">
        <Lead>
          В обычном вызове позиционные аргументы должны идти раньше именованных. После явного имени возвращаться к
          безымянной позиции нельзя.
        </Lead>

        <CodeBlock
          caption="допустимые формы"
          code={
            'create_task("SQL", 4, is_done=False)\n' +
            'create_task("SQL", priority=4, is_done=False)\n' +
            'create_task(title="SQL", priority=4, is_done=False)'
          }
        />

        <BugHunt
          code={'create_task(title="SQL", 4, False)'}
          question="Почему Python не принимает такой вызов?"
          options={[
            "Позиционные аргументы стоят после именованного",
            "title нельзя передавать по имени",
            "False нужно записать строкой",
          ]}
          correctIndex={0}
          explanation="После title=... оставшиеся значения тоже нужно связать с именами."
          fix={'create_task(title="SQL", priority=4, is_done=False)'}
        />

        <FillBlank
          prompt="Завершите читаемый смешанный вызов."
          before={'task = create_task("SQL", '}
          after={', is_done=False)'}
          options={["priority=4", "4=priority", '"priority"']}
          answer="priority=4"
          explanation="Первый аргумент передан позиционно, остальные — по именам."
        />
      </Section>

      <Section number="05" title="Значение по умолчанию делает параметр необязательным">
        <Lead>
          Значение справа от <code>=</code> в определении используется только тогда, когда вызывающий код не передал
          собственное значение.
        </Lead>

        <CodeBlock
          caption="новая задача по умолчанию не выполнена"
          code={
            'def create_task(title, priority=3, is_done=False):\n' +
            '    return {\n' +
            '        "title": title.strip(),\n' +
            '        "priority": priority,\n' +
            '        "is_done": is_done,\n' +
            '    }\n\n' +
            'first = create_task("Git")\n' +
            'second = create_task("SQL", priority=5)'
          }
        />

        <PredictOutput
          code={
            'def label(title, prefix="TASK"):\n' +
            '    return f"[{prefix}] {title}"\n\n' +
            'print(label("SQL"))\n' +
            'print(label("Ошибка", prefix="BUG"))'
          }
          output={'[TASK] SQL\n[BUG] Ошибка'}
          hint="Во втором вызове значение по умолчанию заменяется переданным аргументом."
        />

        <Callout>
          Значение по умолчанию должно выражать нормальное поведение домена. Не делайте важный параметр
          необязательным только ради короткого вызова.
        </Callout>
      </Section>

      <Section number="06" title="Обязательные параметры идут раньше необязательных">
        <Lead>
          Python должен однозначно понимать, какие значения можно пропустить. Поэтому параметр без значения по
          умолчанию нельзя ставить после обычного необязательного параметра.
        </Lead>

        <BugHunt
          code={'def create_task(priority=3, title):\n    return {"title": title, "priority": priority}'}
          question="Почему определение функции содержит SyntaxError?"
          options={[
            "Обязательный title стоит после параметра со значением по умолчанию",
            "Словарь нельзя возвращать из функции",
            "priority не может равняться 3",
          ]}
          correctIndex={0}
          explanation="Сначала записываются обязательные позиционные параметры, затем параметры со значениями по умолчанию."
          fix={'def create_task(title, priority=3):\n    return {"title": title, "priority": priority}'}
        />

        <MethodGrid
          rows={[
            [<>title</>, "обязательный параметр: без него задачу создать нельзя"],
            [<>priority=3</>, "обычный приоритет по умолчанию"],
            [<>is_done=False</>, "новая задача открыта"],
            [<>category=None</>, "категория может отсутствовать"],
          ]}
        />

        <RecallCard
          question="Почему параметр title не должен иметь пустую строку по умолчанию?"
          answer={
            <p>
              Название является обязательной частью модели. Значение <code>title=""</code> позволило бы вызвать
              функцию без важных данных и перенесло бы ошибку дальше по программе.
            </p>
          }
        />
      </Section>

      <Section number="07" title="TypeError объясняет нарушение вызова">
        <Lead>
          Ошибки вызова полезны: они показывают, что количество или способ передачи аргументов не соответствует
          сигнатуре функции.
        </Lead>

        <TypeCards>
          <TypeCard badge="missing" title="Не хватает аргумента" code={'create_task()'}>
            Обязательный параметр <code>title</code> не получил значение.
          </TypeCard>
          <TypeCard badge="multiple" badgeTone="float" title="Значение передано дважды" code={'create_task("SQL", title="Git")'}>
            <code>title</code> получил позиционное и именованное значение одновременно.
          </TypeCard>
          <TypeCard badge="unexpected" badgeTone="str" title="Неизвестное имя" code={'create_task(name="SQL")'}>
            В сигнатуре нет параметра <code>name</code>.
          </TypeCard>
        </TypeCards>

        <BugHunt
          code={'create_task("SQL", 5, priority=4)'}
          question="Какой параметр получает два значения?"
          options={["priority", "title", "is_done"]}
          correctIndex={0}
          explanation="Позиционное число 5 уже связано с priority, затем priority=4 передаёт второе значение."
          fix={'create_task("SQL", priority=4)'}
        />
      </Section>

      <Section number="08" title="Практика StudyHub и проверка понимания">
        <Lead>
          Обновите фабрику задач и функцию фильтрации так, чтобы вызовы были короткими для обычного случая и
          понятными для дополнительных настроек.
        </Lead>

        <CodeBlock
          caption="целевой вариант"
          code={
            'def create_task(title, priority=3, is_done=False):\n' +
            '    return {\n' +
            '        "title": title.strip(),\n' +
            '        "priority": priority,\n' +
            '        "is_done": is_done,\n' +
            '    }\n\n' +
            'def filter_tasks(tasks, is_done=None, min_priority=1):\n' +
            '    result = []\n' +
            '    for task in tasks:\n' +
            '        status_ok = is_done is None or task["is_done"] == is_done\n' +
            '        priority_ok = task["priority"] >= min_priority\n' +
            '        if status_ok and priority_ok:\n' +
            '            result.append(task)\n' +
            '    return result'
          }
        />

        <div className="lesson-check-group">
          <QuizCard
            question="Что определяет позиционный аргумент?"
            options={["Порядок", "Тип значения", "Имя переменной снаружи"]}
            correctIndex={0}
            explanation="Значения связываются с параметрами слева направо."
          />
          <QuizCard
            question="Когда используется значение по умолчанию?"
            options={["Когда аргумент не передан", "Всегда", "Только при ошибке"]}
            correctIndex={0}
            explanation="Переданное значение заменяет default."
          />
          <QuizCard
            question="Почему именованные аргументы полезны для bool?"
            options={["Показывают смысл True/False", "Изменяют тип", "Ускоряют Python"]}
            correctIndex={0}
            explanation="Вызов is_done=False читается однозначнее отдельного False."
          />
        </div>

        <KeyTakeaways
          points={[
            <>Позиционные аргументы сопоставляются по порядку.</>,
            <>Именованные аргументы связываются с параметрами явно.</>,
            <>Позиционные аргументы записываются раньше именованных.</>,
            <>Значение по умолчанию используется только при отсутствии аргумента.</>,
            <>Обязательные параметры стоят раньше обычных параметров с default.</>,
            <>TypeError часто указывает на конкретное нарушение контракта вызова.</>,
          ]}
        />

        <PracticeCta text="Добавьте значения по умолчанию в create_task(), перепишите четыре вызова с именованными аргументами и разберите три специально созданных TypeError." />
      </Section>
    </RichLesson>
  );
}

// 24. Область видимости и изменяемые объекты
export function Lesson24({ module }: { module?: string }) {
  return (
    <RichLesson>
      <RichHero
        chip={module ?? BLOCK_TITLE}
        title="Область видимости и изменяемые объекты"
        intro="Разберём, где живут переменные, почему локальное имя не видно снаружи, как передача списка отличается от передачи числа и почему изменяемое значение по умолчанию может связывать независимые вызовы функции."
        tags={[
          { icon: <Layers size={14} />, label: "локальная и внешняя область" },
          { icon: <AlertTriangle size={14} />, label: "изменяемые значения" },
        ]}
      />
      <TheoryBridge lesson={24} />

      <Section number="01" title="Имя существует внутри определённой области">
        <Lead>
          Область видимости определяет, где имя можно использовать. Параметры и переменные, созданные внутри
          функции, обычно локальны и исчезают из доступного пространства после завершения вызова.
        </Lead>

        <div className="lesson-route">
          <ol>
            <li><strong>Локальные имена:</strong> параметры и переменные одного вызова функции.</li>
            <li><strong>Внешние имена:</strong> значения, созданные на уровне файла.</li>
            <li><strong>Передача объектов:</strong> параметр получает ссылку на переданный объект.</li>
            <li><strong>Безопасные defaults:</strong> изменяемый объект создаётся внутри вызова, а не в def.</li>
          </ol>
          <p>В конце вы устраните глобальное состояние из части Console Planner и исправите опасный default.</p>
        </div>

        <Callout tone="info">
          Область видимости относится к именам, а изменяемость — к объектам. Эти темы связаны, но отвечают на разные вопросы.
        </Callout>
      </Section>

      <Section number="02" title="Локальная переменная принадлежит вызову">
        <Lead>
          Каждый вызов функции получает собственный набор локальных имён. Значение параметра одного вызова не
          смешивается со значением следующего.
        </Lead>

        <StepThrough
          code={
            'def normalize_title(title):\n' +
            '    cleaned = title.strip()\n' +
            '    return cleaned\n\n' +
            'first = normalize_title("  SQL  ")\n' +
            'second = normalize_title("  Git  ")'
          }
          steps={[
            { line: 4, note: "Первый вызов создаёт локальный title.", vars: { title: '"  SQL  "' } },
            { line: 1, note: "Создаётся локальный cleaned первого вызова.", vars: { cleaned: '"SQL"' } },
            { line: 5, note: "Второй вызов начинает новый локальный набор имён.", vars: { title: '"  Git  "' } },
            { line: 1, note: "cleaned второго вызова не связан с первым.", vars: { cleaned: '"Git"' } },
          ]}
        />

        <BugHunt
          code={
            'def normalize_title(title):\n' +
            '    cleaned = title.strip()\n' +
            '    return cleaned\n\n' +
            'print(cleaned)'
          }
          question="Почему последняя строка вызывает NameError?"
          options={[
            "cleaned является локальным именем функции",
            "strip удалил переменную",
            "return запрещает print",
          ]}
          correctIndex={0}
          explanation="Имя cleaned доступно только внутри тела функции."
          fix={
            'def normalize_title(title):\n' +
            '    cleaned = title.strip()\n' +
            '    return cleaned\n\n' +
            'result = normalize_title("  SQL  ")\n' +
            'print(result)'
          }
        />

        <RecallCard
          question="Почему параметр title можно использовать внутри функции, хотя снаружи переменная могла называться raw_title?"
          answer={
            <p>
              При вызове передаётся объект, а внутри функции он связывается с локальным именем параметра
              <code>title</code>. Внешнее имя не обязано совпадать с параметром.
            </p>
          }
        />
      </Section>

      <Section number="03" title="Внешняя переменная читается, но зависимость может быть скрыта">
        <Lead>
          Функция может прочитать имя из внешней области, однако такая зависимость не видна в сигнатуре и усложняет
          повторное использование.
        </Lead>

        <CompareSolutions
          question="Какая функция честнее показывает необходимые данные?"
          left={{
            title: "Скрытая зависимость",
            code:
              'tasks = []\n\n' +
              'def count_tasks():\n' +
              '    return len(tasks)',
            note: "По сигнатуре кажется, что функция ничего не получает.",
          }}
          right={{
            title: "Явный параметр",
            code:
              'def count_tasks(tasks):\n' +
              '    return len(tasks)',
            note: "Можно передать любой список и легко проверить результат.",
          }}
          preferred="right"
          explanation="Явная зависимость делает функцию переносимой и предсказуемой."
        />

        <TrueFalse
          statement={
            <>
              Если функция только читает глобальную переменную, глобальное состояние перестаёт быть зависимостью.
            </>
          }
          isTrue={false}
          explanation="Результат всё равно зависит от внешнего объекта, который не указан в параметрах."
        />

        <Callout>
          Константы конфигурации вроде <code>MIN_PRIORITY = 1</code> могут читаться с уровня модуля. Изменяемое
          состояние приложения лучше передавать явно.
        </Callout>
      </Section>

      <Section number="04" title="Присваивание внутри функции создаёт локальное имя">
        <Lead>
          Если внутри функции выполнить присваивание, Python обычно считает это имя локальным. Внешняя переменная с
          тем же названием не меняется автоматически.
        </Lead>

        <PredictOutput
          code={
            'status = "new"\n\n' +
            'def change_status():\n' +
            '    status = "done"\n' +
            '    print(status)\n\n' +
            'change_status()\n' +
            'print(status)'
          }
          output={'done\nnew'}
          hint="Внутри функции создаётся отдельное локальное имя status."
        />

        <CompareSolutions
          question="Как лучше изменить статус конкретной задачи?"
          left={{
            title: "Изменять глобальное имя",
            code: 'global status\nstatus = "done"',
            note: "Функция зависит от одного конкретного внешнего имени.",
          }}
          right={{
            title: "Получить и вернуть значение",
            code: 'def normalize_status(status):\n    return status.strip().lower()',
            note: "Контракт работает с любым переданным статусом.",
          }}
          preferred="right"
          explanation="Для учебного проекта global почти всегда можно заменить параметром, return или явным изменением объекта."
        />

        <Callout tone="info">
          Ключевое слово <code>global</code> существует, но в этом блоке не является основным инструментом. Сначала
          учимся проектировать явную передачу данных.
        </Callout>
      </Section>

      <Section number="05" title="Параметр получает объект, а не автоматическую копию">
        <Lead>
          При вызове функции параметр связывается с переданным объектом. Если объект изменяемый и функция меняет его
          на месте, изменение видно снаружи.
        </Lead>

        <StepThrough
          code={
            'def add_task(tasks, title):\n' +
            '    tasks.append({"title": title})\n\n' +
            'project_tasks = []\n' +
            'add_task(project_tasks, "SQL")\n' +
            'print(project_tasks)'
          }
          steps={[
            { line: 3, note: "Создан один пустой список.", vars: { project_tasks: "→ []" } },
            { line: 4, note: "Параметр tasks указывает на тот же список.", vars: { tasks: "→ тот же объект" } },
            { line: 1, note: "append меняет общий список на месте.", vars: { project_tasks: '[{"title": "SQL"}]' } },
            { line: 5, note: "Снаружи видно изменение объекта.", vars: { вывод: '[{"title": "SQL"}]' } },
          ]}
        />

        <TypeCards>
          <TypeCard badge="immutable" title="Число" code={'def increment(value):\n    value += 1'}>
            Операция связывает локальное имя с новым числом. Внешнее число не меняется.
          </TypeCard>
          <TypeCard badge="mutable" badgeTone="float" title="Список" code={'def append_item(items):\n    items.append(1)'}>
            Метод меняет переданный объект, поэтому эффект виден снаружи.
          </TypeCard>
          <TypeCard badge="new copy" badgeTone="str" title="Новый список" code={'result = items.copy()\nresult.append(1)'}>
            Внешний список верхнего уровня остаётся прежним.
          </TypeCard>
        </TypeCards>

        <TrueFalse
          statement={
            <>
              Передача списка в функцию автоматически создаёт его независимую копию.
            </>
          }
          isTrue={false}
          explanation="Параметр получает ссылку на тот же объект, пока функция явно не создаст копию."
        />
      </Section>

      <Section number="06" title="Изменить объект или вернуть новую версию">
        <Lead>
          Оба подхода допустимы, но контракт должен быть понятен из имени и использования функции.
        </Lead>

        <CompareSolutions
          question="Чем отличаются функции?"
          left={{
            title: "Команда изменяет состояние",
            code:
              'def add_task(tasks, task):\n' +
              '    tasks.append(task)\n' +
              '    return None',
            note: "Эффект — изменение исходного списка.",
          }}
          right={{
            title: "Преобразование возвращает новое",
            code:
              'def with_task(tasks, task):\n' +
              '    result = tasks.copy()\n' +
              '    result.append(task)\n' +
              '    return result',
            note: "Исходный внешний список верхнего уровня не меняется.",
          }}
          preferred="both"
          explanation="Важно не смешивать контракты и не заставлять вызывающий код угадывать, где произошло изменение."
        />

        <BugHunt
          code={
            'def with_task(tasks, task):\n' +
            '    result = tasks\n' +
            '    result.append(task)\n' +
            '    return result'
          }
          question="Почему исходный список всё равно изменится?"
          options={[
            "result является вторым именем того же списка",
            "return всегда меняет аргументы",
            "append создаёт глобальную переменную",
          ]}
          correctIndex={0}
          explanation="Присваивание не создаёт копию изменяемого объекта."
          fix={
            'def with_task(tasks, task):\n' +
            '    result = tasks.copy()\n' +
            '    result.append(task)\n' +
            '    return result'
          }
        />
      </Section>

      <Section number="07" title="Опасный изменяемый аргумент по умолчанию">
        <Lead>
          Значения по умолчанию создаются один раз при выполнении строки <code>def</code>. Поэтому список в default
          может сохранять элементы между независимыми вызовами.
        </Lead>

        <StepThrough
          code={
            'def collect_title(title, titles=[]):\n' +
            '    titles.append(title)\n' +
            '    return titles\n\n' +
            'first = collect_title("SQL")\n' +
            'second = collect_title("Git")'
          }
          steps={[
            { line: 0, note: "При создании функции создаётся один список default.", vars: { titles: "→ []" } },
            { line: 4, note: "Первый вызов добавляет SQL в общий default.", vars: { first: '["SQL"]' } },
            { line: 5, note: "Второй вызов получает тот же список.", vars: { titles: '→ ["SQL"]' } },
            { line: 1, note: "Git добавляется к результату прошлого вызова.", vars: { second: '["SQL", "Git"]' } },
          ]}
        />

        <CompareSolutions
          question="Как создать новый список для каждого вызова?"
          left={{
            title: "Общий изменяемый default",
            code: 'def collect(title, titles=[]):\n    titles.append(title)\n    return titles',
            note: "Список переиспользуется между вызовами.",
          }}
          right={{
            title: "None как сигнал",
            code:
              'def collect(title, titles=None):\n' +
              '    if titles is None:\n' +
              '        titles = []\n' +
              '    titles.append(title)\n' +
              '    return titles',
            note: "Новый список создаётся внутри конкретного вызова.",
          }}
          preferred="right"
          explanation="None является неизменяемым маркером отсутствия переданного списка."
        />

        <FillBlank
          prompt="Заполните безопасную проверку отсутствующего списка."
          before={'def collect(title, titles=None):\n    if titles '}
          after={':\n        titles = []'}
          options={["is None", "== []", "is False"]}
          answer="is None"
          explanation="Мы проверяем специальный маркер отсутствия аргумента, а не содержимое списка."
        />
      </Section>

      <Section number="08" title="Практика и контрольная точка">
        <Lead>
          Исправьте функции проекта так, чтобы изменяемое состояние передавалось явно, а преобразования не меняли
          входные данные неожиданно.
        </Lead>

        <CodeSequence
          title="Соберите безопасную функцию добавления в копию"
          prompt="Исходный список должен остаться прежним."
          pieces={[
            { id: "def", code: "def with_added_task(tasks, task):" },
            { id: "copy", code: "    result = tasks.copy()" },
            { id: "append", code: "    result.append(task)" },
            { id: "return", code: "    return result" },
          ]}
          correctOrder={["def", "copy", "append", "return"]}
          explanation="Копия создаётся до изменения и возвращается как новая версия состояния."
        />

        <div className="lesson-check-group">
          <QuizCard
            question="Где доступна локальная переменная?"
            options={["Внутри её функции", "Во всех файлах проекта", "Только в print"]}
            correctIndex={0}
            explanation="Локальное имя принадлежит области вызова функции."
          />
          <QuizCard
            question="Что произойдёт при append внутри функции?"
            options={["Переданный список изменится", "Создастся копия", "Изменится только имя параметра"]}
            correctIndex={0}
            explanation="append меняет сам объект."
          />
          <QuizCard
            question="Почему default=[] опасен?"
            options={["Один список используется повторно", "Списки нельзя передавать", "Он всегда пустой"]}
            correctIndex={0}
            explanation="Объект default создаётся один раз при определении функции."
          />
        </div>

        <KeyTakeaways
          points={[
            <>Параметры и переменные функции обычно имеют локальную область видимости.</>,
            <>Внешнее изменяемое состояние лучше передавать явным параметром.</>,
            <>Присваивание локальному имени не изменяет одноимённую внешнюю переменную.</>,
            <>Параметр получает ссылку на переданный объект, а не автоматическую копию.</>,
            <>Методы списка могут создавать намеренный побочный эффект.</>,
            <>Для изменяемого default используется <code>None</code> и создание объекта внутри функции.</>,
          ]}
        />

        <PracticeCta text="Найдите в Console Planner глобальный tasks, передайте его минимум в три функции явно и исправьте функцию с изменяемым значением по умолчанию через None." />
      </Section>
    </RichLesson>
  );
}

// 25. *args, **kwargs и распаковка
export function Lesson25({ module }: { module?: string }) {
  return (
    <RichLesson>
      <RichHero
        chip={module ?? BLOCK_TITLE}
        title="*args, **kwargs и распаковка"
        intro="Научимся собирать переменное количество аргументов и распаковывать готовые коллекции в вызов функции. Разберём, что именно создают *args и **kwargs, когда они полезны и почему ими не стоит скрывать обычный ясный контракт."
        tags={[
          { icon: <Braces size={14} />, label: "*args · **kwargs" },
          { icon: <FunctionSquare size={14} />, label: "распаковка вызова" },
        ]}
      />
      <TheoryBridge lesson={25} />

      <Section number="01" title="Звёздочка меняет способ передачи значений">
        <Lead>
          Оператор <code>*</code> работает с последовательностью позиционных значений, а <code>**</code> — со
          словарём именованных значений. В определении они собирают аргументы, в вызове — распаковывают их.
        </Lead>

        <div className="lesson-route">
          <ol>
            <li><strong>*args в определении:</strong> собирает лишние позиционные аргументы в tuple.</li>
            <li><strong>**kwargs в определении:</strong> собирает лишние именованные аргументы в dict.</li>
            <li><strong>*items в вызове:</strong> раскладывает последовательность по позициям.</li>
            <li><strong>**options в вызове:</strong> передаёт пары словаря как именованные аргументы.</li>
          </ol>
          <p>Финальная практика блока свяжет распаковку с фабрикой задач и конфигурацией фильтра.</p>
        </div>

        <Callout tone="info">
          Одинаковый символ выполняет обратные действия в разных местах: в <code>def</code> собирает, в вызове распаковывает.
        </Callout>
      </Section>

      <Section number="02" title="*args собирает позиционные аргументы в кортеж">
        <Lead>
          Параметр со звёздочкой получает все оставшиеся позиционные значения. Имя <code>args</code> является
          соглашением, но технически можно выбрать другое имя.
        </Lead>

        <StepThrough
          code={
            'def total_points(*points):\n' +
            '    total = 0\n' +
            '    for point in points:\n' +
            '        total += point\n' +
            '    return total\n\n' +
            'result = total_points(10, 20, 5)'
          }
          steps={[
            { line: 6, note: "В вызове переданы три позиционных аргумента.", vars: { аргументы: "10, 20, 5" } },
            { line: 0, note: "*points собирает их в кортеж.", vars: { points: "(10, 20, 5)" } },
            { line: 2, note: "Цикл перебирает элементы кортежа.", vars: { point: "10 → 20 → 5" } },
            { line: 4, note: "Функция возвращает сумму.", vars: { result: "35" } },
          ]}
        />

        <PredictOutput
          code={
            'def show_args(*args):\n' +
            '    print(type(args).__name__)\n' +
            '    print(args)\n\n' +
            'show_args("SQL", 5, False)'
          }
          output={'tuple\n(\'SQL\', 5, False)'}
          hint="Даже разные типы собираются в один кортеж."
        />

        <TrueFalse
          statement={
            <>
              Параметр <code>*args</code> всегда обязан называться именно <code>args</code>.
            </>
          }
          isTrue={false}
          explanation="Важна звёздочка. Имя args используется для узнаваемости кода."
        />
      </Section>

      <Section number="03" title="Обычные параметры и *args можно сочетать">
        <Lead>
          Явные обязательные параметры остаются в начале, а <code>*args</code> собирает дополнительную часть вызова.
        </Lead>

        <CodeBlock
          caption="основное значение и дополнительные теги"
          code={
            'def create_tagged_title(title, *tags):\n' +
            '    normalized = title.strip()\n' +
            '    if not tags:\n' +
            '        return normalized\n' +
            '    return f"{normalized} [{\', \'.join(tags)}]"\n\n' +
            'print(create_tagged_title("SQL"))\n' +
            'print(create_tagged_title("API", "python", "backend"))'
          }
        />

        <BugHunt
          code={
            'def create_tagged_title(*tags, title):\n' +
            '    return title'
          }
          question="Как нужно передать title при такой сигнатуре?"
          options={[
            "Только по имени",
            "Только первым позиционно",
            "Передать через список без звёздочки",
          ]}
          correctIndex={0}
          explanation="Параметры после *args становятся keyword-only и передаются по имени."
          fix={'create_tagged_title("python", "backend", title="API")'}
        />

        <Callout>
          Keyword-only параметры полезны, когда настройку важно назвать явно. Подробно этот приём будет закрепляться
          позже при чтении сигнатур библиотек.
        </Callout>
      </Section>

      <Section number="04" title="**kwargs собирает именованные аргументы в словарь">
        <Lead>
          Две звёздочки собирают дополнительные пары <code>имя=значение</code>. Ключами словаря становятся имена
          аргументов.
        </Lead>

        <StepThrough
          code={
            'def build_options(**kwargs):\n' +
            '    return kwargs\n\n' +
            'options = build_options(priority=5, is_done=False, category="python")'
          }
          steps={[
            { line: 3, note: "Переданы три именованных аргумента.", vars: { вызов: "priority=5, is_done=False, category=..." } },
            { line: 0, note: "**kwargs собирает их в словарь.", vars: { kwargs: "dict" } },
            { line: 1, note: "Функция возвращает собранный словарь.", vars: { "options['priority']": "5" } },
          ]}
        />

        <PredictOutput
          code={
            'def inspect(**kwargs):\n' +
            '    print(type(kwargs).__name__)\n' +
            '    print(sorted(kwargs))\n\n' +
            'inspect(status="new", priority=3)'
          }
          output={'dict\n[\'priority\', \'status\']'}
          hint="Перебор словаря даёт ключи, sorted упорядочивает их."
        />

        <MatchPairs
          prompt="Соедините объект внутри функции с источником."
          pairs={[
            { left: "args", right: "кортеж позиционных аргументов" },
            { left: "kwargs", right: "словарь именованных аргументов" },
            { left: "kwargs['priority']", right: "значение аргумента priority" },
          ]}
          explanation="* и ** определяют форму собранных данных."
        />
      </Section>

      <Section number="05" title="Распаковка списка и кортежа в вызове">
        <Lead>
          В вызове одна звёздочка берёт элементы последовательности и передаёт их как отдельные позиционные
          аргументы.
        </Lead>

        <CompareSolutions
          question="Какие вызовы эквивалентны?"
          left={{
            title: "Аргументы записаны отдельно",
            code: 'create_task("SQL", 5, False)',
            note: "Три значения переданы явно.",
          }}
          right={{
            title: "Последовательность распакована",
            code: 'data = ("SQL", 5, False)\ncreate_task(*data)',
            note: "Элементы кортежа распределяются по трём параметрам.",
          }}
          preferred="both"
          explanation="После распаковки функция получает те же три позиционных значения."
        />

        <PredictOutput
          code={
            'def subtract(a, b):\n' +
            '    return a - b\n\n' +
            'numbers = [10, 3]\n' +
            'print(subtract(*numbers))'
          }
          output={'7'}
          hint="Список превращается в вызов subtract(10, 3)."
        />

        <BugHunt
          code={
            'values = ["SQL", 5]\n' +
            'create_task(*values)'
          }
          question="Что произойдёт, если is_done не имеет значения по умолчанию?"
          options={[
            "Возникнет TypeError из-за отсутствующего аргумента",
            "Python добавит None автоматически",
            "Список станет словарём",
          ]}
          correctIndex={0}
          explanation="После распаковки переданы только два позиционных аргумента."
          fix={
            'values = ["SQL", 5, False]\n' +
            'create_task(*values)'
          }
        />
      </Section>

      <Section number="06" title="Распаковка словаря в именованные аргументы">
        <Lead>
          Вызов с <code>**mapping</code> использует ключи словаря как имена параметров, а значения — как переданные
          аргументы.
        </Lead>

        <CodeBlock
          caption="словарь конфигурации"
          code={
            'task_data = {\n' +
            '    "title": "Изучить распаковку",\n' +
            '    "priority": 4,\n' +
            '    "is_done": False,\n' +
            '}\n\n' +
            'task = create_task(**task_data)'
          }
        />

        <StepThrough
          code={
            'def create_task(title, priority=3, is_done=False):\n' +
            '    return {"title": title, "priority": priority, "is_done": is_done}\n\n' +
            'data = {"title": "SQL", "priority": 5}\n' +
            'task = create_task(**data)'
          }
          steps={[
            { line: 3, note: "Словарь содержит ключи, совпадающие с параметрами.", vars: { data: "title, priority" } },
            { line: 4, note: "**data превращается в title='SQL', priority=5.", vars: { title: '"SQL"', priority: "5" } },
            { line: 0, note: "is_done не передан и получает False по умолчанию.", vars: { is_done: "False" } },
            { line: 1, note: "Функция возвращает готовую задачу.", vars: { task: "dict" } },
          ]}
        />

        <BugHunt
          code={
            'data = {"name": "SQL", "priority": 5}\n' +
            'create_task(**data)'
          }
          question="Почему возникнет unexpected keyword argument 'name'?"
          options={[
            "Ключ name не совпадает ни с одним параметром",
            "Словари нельзя распаковывать",
            "priority должен быть строкой",
          ]}
          correctIndex={0}
          explanation="Ключи распакованного словаря должны соответствовать именам параметров или приниматься через **kwargs."
          fix={
            'data = {"title": "SQL", "priority": 5}\n' +
            'create_task(**data)'
          }
        />
      </Section>

      <Section number="07" title="Не скрывайте контракт за *args и **kwargs">
        <Lead>
          Переменное количество аргументов полезно для адаптеров, логирования и передачи настроек. Но обычная
          бизнес-функция должна по возможности сохранять явные параметры.
        </Lead>

        <CompareSolutions
          question="Какая сигнатура лучше описывает создание задачи?"
          left={{
            title: "Всё спрятано",
            code:
              'def create_task(*args, **kwargs):\n' +
              '    ...',
            note: "Не видно обязательных полей и допустимых форм вызова.",
          }}
          right={{
            title: "Основной контракт явный",
            code:
              'def create_task(title, priority=3, is_done=False):\n' +
              '    ...',
            note: "Сигнатура документирует модель задачи.",
          }}
          preferred="right"
          explanation="Гибкость не должна уничтожать понятность основного сценария."
        />

        <MethodGrid
          rows={[
            [<>*args полезен</>, "когда число однотипных позиционных значений действительно переменно"],
            [<>**kwargs полезен</>, "для адаптера дополнительных именованных настроек"],
            [<>явные параметры лучше</>, "для обязательных бизнес-данных и стабильного контракта"],
            [<>*data и **data полезны</>, "когда значения уже собраны в подходящую коллекцию"],
          ]}
        />

        <RecallCard
          question="Почему create_task(**task_data) связывает тему функций с будущими API-схемами?"
          hint="Подумайте о словаре данных с именованными полями."
          answer={
            <p>
              Словарь с ключами <code>title</code>, <code>priority</code> и <code>is_done</code> уже похож на
              структурированный запрос. Позже Pydantic и FastAPI будут проверять такие именованные поля до вызова
              прикладной логики.
            </p>
          }
        />
      </Section>

      <Section number="08" title="Финальная практика блока">
        <Lead>
          Соберите маленький модуль функций, который создаёт задачи из словарей, объединяет теги и применяет
          именованные параметры фильтрации.
        </Lead>

        <CodeBlock
          caption="итоговый пример"
          code={
            'def create_task(title, priority=3, is_done=False):\n' +
            '    return {\n' +
            '        "title": title.strip(),\n' +
            '        "priority": priority,\n' +
            '        "is_done": is_done,\n' +
            '    }\n\n' +
            'def add_tags(task, *tags):\n' +
            '    result = task.copy()\n' +
            '    result["tags"] = list(tags)\n' +
            '    return result\n\n' +
            'task_data = {"title": "FastAPI", "priority": 5}\n' +
            'task = create_task(**task_data)\n' +
            'tagged = add_tags(task, "python", "backend")'
          }
        />

        <CodeSequence
          title="Соберите путь данных"
          prompt="Словарь должен превратиться в задачу, затем получить теги."
          pieces={[
            { id: "data", code: 'data = {"title": "API", "priority": 5}' },
            { id: "create", code: "task = create_task(**data)" },
            { id: "tags", code: 'result = add_tags(task, "python", "backend")' },
            { id: "return", code: "return result" },
          ]}
          correctOrder={["data", "create", "tags", "return"]}
          explanation="**data передаёт именованные поля, а обычные позиционные строки собираются в *tags."
        />

        <div className="lesson-check-group">
          <QuizCard
            question="Какой тип получает *args внутри функции?"
            options={["tuple", "dict", "set"]}
            correctIndex={0}
            explanation="Позиционные аргументы собираются в кортеж."
          />
          <QuizCard
            question="Какой тип получает **kwargs?"
            options={["dict", "list", "str"]}
            correctIndex={0}
            explanation="Именованные аргументы собираются в словарь."
          />
          <QuizCard
            question="Что делает create_task(**data)?"
            options={["Распаковывает ключи как имена параметров", "Передаёт один словарь", "Создаёт args"]}
            correctIndex={0}
            explanation="Пары ключ–значение становятся именованными аргументами."
          />
        </div>

        <KeyTakeaways
          points={[
            <><code>*args</code> собирает дополнительные позиционные аргументы в tuple.</>,
            <><code>**kwargs</code> собирает дополнительные именованные аргументы в dict.</>,
            <><code>*sequence</code> распаковывает элементы в позиционный вызов.</>,
            <><code>**mapping</code> распаковывает ключи и значения в именованный вызов.</>,
            <>Ключи словаря должны соответствовать параметрам функции.</>,
            <>Обязательные бизнес-данные лучше оставлять явными параметрами.</>,
            <>Навык распаковки подготовит чтение декораторов, библиотечных функций и FastAPI-кода.</>,
          ]}
        />

        <PracticeCta text="Реализуйте create_task(), add_tags(*tags) и вызов create_task(**task_data). Добавьте пять проверочных вызовов и финальный Git-коммит feat: add flexible function calls." />
      </Section>
    </RichLesson>
  );
}

// 26. Функция как значение: callbacks и замыкания
export function Lesson26({ module }: { module?: string }) {
  return (
    <RichLesson>
      <RichHero
        chip={module ?? BLOCK_TITLE}
        title="Функция как значение: callbacks и замыкания"
        intro="Посмотрим на функцию не только как на команду со скобками, но и как на обычное значение: её можно сохранить, передать другой функции и вернуть как результат. На этой основе соберём callbacks и первые замыкания для StudyHub."
        tags={[
          { icon: <FunctionSquare size={14} />, label: "функции как объекты" },
          { icon: <GitFork size={14} />, label: "callbacks и замыкания" },
        ]}
      />
      <TheoryBridge lesson={26} />

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
