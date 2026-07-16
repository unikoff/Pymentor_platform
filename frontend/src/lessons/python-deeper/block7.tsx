import {
  AlertTriangle,
  Boxes,
  Braces,
  FileText,
  FolderGit2,
  GitFork,
  HardDrive,
  KeyRound,
  Layers,
  ListChecks,
  LockKeyhole,
  Puzzle,
  Save,
  ShieldCheck,
  Wrench,
} from "lucide-react";
import {
  BranchExplorer,
  BugHunt,
  Callout,
  CodeBlock,
  CodeSequence,
  CompareSolutions,
  FillBlank,
  FlipCards,
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
  TerminalDemo,
  TrueFalse,
  TypeCard,
  TypeCards,
} from "../shared";

type TheoryBridgeData = { link: string; boundary: string };

const THEORY_BRIDGES: Record<number, TheoryBridgeData> = {
  33: {"link":"Модули уже разделены, теперь файлы получают роли: main, models, services, storage и validators существуют ради разных причин для изменения.","boundary":"Разнести код по файлам недостаточно: зависимости всё равно должны идти в одну понятную сторону."},
  34: {"link":"Пока задачи живут только в памяти; файловый слой учит их переживать завершение программы через Path, with и явную UTF-8 кодировку.","boundary":"Относительный путь зависит от рабочей папки, а режим w полностью заменяет содержимое файла."},
  35: {"link":"Файл умеет хранить текст, а JSON становится договором между памятью и диском: сериализация переводит данные в текст, чтение возвращает их назад.","boundary":"Корректный JSON ещё не гарантирует корректную задачу: обязательные поля и типы всё равно проверяются моделью."},
  36: {"link":"Словарь уже хранит поля Task, но класс объединяет форму создания объекта, его состояние и связанные действия.","boundary":"self не глобальная переменная и не делает класс обязательным для всего кода; он относится к объекту текущего вызова."},
  37: {"link":"Объекты Task теперь независимы, поэтому методы могут менять состояние именно своего экземпляра и возвращать вычисленный результат.","boundary":"Атрибут класса разделяется всеми объектами, атрибут экземпляра — нет, даже если имена похожи."},
  38: {"link":"Модель должна не только хранить данные, но и защищать правило их изменения: setter проверяет значение, property сохраняет удобный доступ.","boundary":"Подчёркивание в имени — соглашение, не защита; ценность инкапсуляции в одном месте для правила изменения."},
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


const BLOCK_TITLE = "Блок 7 · Файлы, JSON и объектная модель";

// 33. Ответственность файлов небольшого проекта
export function Lesson33({ module }: { module?: string }) {
  return (
    <RichLesson>
      <RichHero
        variant="project"
        chip={module ?? BLOCK_TITLE}
        title="Ответственность файлов небольшого проекта"
        intro="Перестроим Console Planner из одного большого файла в небольшой проект: определим ответственность main, models, services, storage и validators, проведём зависимости в одном направлении и перенесём код без изменения поведения."
        tags={[
          { icon: <FolderGit2 size={14} />, label: "структура проекта" },
          { icon: <GitFork size={14} />, label: "направление зависимостей" },
        ]}
      />
      <TheoryBridge lesson={33} />

      <Section number="01" title="Зачем проекту несколько файлов">
        <Lead>
          Один файл удобен, пока программа маленькая. Когда в нём одновременно находятся меню, проверка ввода,
          поиск задач, форматирование, сохранение и запуск приложения, изменение одной части начинает требовать
          чтения всего файла. Разделение нужно не ради количества папок, а ради понятных границ ответственности.
        </Lead>

        <div className="lesson-route">
          <ol>
            <li>
              <strong>Зафиксировать обязанности:</strong> определить, какая часть кода отвечает за интерфейс,
              правила, модель данных и хранение.
            </li>
            <li>
              <strong>Провести зависимости:</strong> решить, кто может импортировать кого, чтобы не получить
              циклические импорты.
            </li>
            <li>
              <strong>Переносить постепенно:</strong> после каждого переноса запускать прежние сценарии и делать
              отдельный Git-коммит.
            </li>
          </ol>
          <p>
            Итог занятия — работающий каркас Persistent Planner, в котором назначение каждого файла можно объяснить
            одним предложением.
          </p>
        </div>

        <Callout tone="info">
          Хорошая структура не делает программу умнее. Она сокращает область, которую нужно держать в голове при
          изменении конкретного поведения.
        </Callout>
      </Section>

      <Section number="02" title="Монолит скрывает разные причины изменения">
        <Lead>
          Файл становится перегруженным, когда его приходится менять по несвязанным причинам. Новая команда меню,
          новое правило приоритета и новый формат файла — три разных причины изменения.
        </Lead>

        <CodeBlock
          caption="main.py до разделения"
          code={
            'tasks = []\n\n' +
            'def validate_priority(value):\n    ...\n\n' +
            'def create_task(title, priority):\n    ...\n\n' +
            'def save_tasks(tasks):\n    ...\n\n' +
            'def show_menu():\n    ...\n\n' +
            'def run():\n    ...\n\n' +
            'run()'
          }
        />

        <TypeCards>
          <TypeCard badge="интерфейс" title="Меню и input" code={'show_menu()\ncommand = input("Команда: ")'}>
            Меняется, когда пользовательский сценарий получает новую команду или другое сообщение.
          </TypeCard>
          <TypeCard badge="правила" badgeTone="float" title="Сервисные функции" code={'create_task(...)\nmark_task_done(...)'}>
            Меняются, когда меняется поведение задач, независимо от терминала и формата хранения.
          </TypeCard>
          <TypeCard badge="хранение" badgeTone="str" title="Чтение и запись" code={'load_tasks()\nsave_tasks(tasks)'}>
            Меняется при переходе с текста на JSON или при изменении пути к данным.
          </TypeCard>
        </TypeCards>

        <RecallCard
          question="Как понять, что файл взял слишком много ответственности?"
          hint="Посчитайте независимые причины, по которым его приходится редактировать."
          answer={
            <p>
              Если один файл нужно менять из-за интерфейса, бизнес-правил, формата хранения и запуска приложения,
              он объединяет несколько обязанностей. Это сигнал выделить устойчивые части в отдельные модули.
            </p>
          }
        />
      </Section>

      <Section number="03" title="Пять ролей проекта StudyHub">
        <Lead>
          Для небольшого учебного проекта достаточно пяти понятных ролей. Они не являются обязательным шаблоном для
          любого Python-кода, но хорошо показывают границы Persistent Planner.
        </Lead>

        <MethodGrid
          rows={[
            [<>main.py</>, "точка входа, цикл меню и связывание частей приложения"],
            [<>models.py</>, "форма одной задачи и операции, относящиеся к самой модели"],
            [<>services.py</>, "сценарии поиска, добавления, удаления и изменения статуса"],
            [<>storage.py</>, "путь к данным, загрузка и сохранение"],
            [<>validators.py</>, "проверки названия, приоритета и пользовательских значений"],
          ]}
        />

        <CodeBlock
          caption="минимальная структура"
          code={
            'studyhub/\n' +
            '├── main.py\n' +
            '├── models.py\n' +
            '├── services.py\n' +
            '├── storage.py\n' +
            '├── validators.py\n' +
            '└── data/\n' +
            '    └── tasks.json'
          }
        />

        <MatchPairs
          prompt="Соедините изменение с файлом, который должен знать о нём первым."
          leftTitle="Изменение"
          rightTitle="Ответственный файл"
          pairs={[
            { left: "добавить команду экспорта в меню", right: "main.py" },
            { left: "запретить приоритет 0", right: "validators.py" },
            { left: "изменить формат сохранения", right: "storage.py" },
            { left: "добавить операцию завершения задачи", right: "services.py" },
            { left: "описать поля объекта Task", right: "models.py" },
          ]}
          explanation="Файл выбирается по причине изменения, а не по случайному месту, где функцию впервые вызвали."
        />

        <Callout>
          Не создавайте папку <code className="lesson-token lesson-token--danger">utils</code> для всего, что не
          удалось классифицировать. Название должно объяснять ответственность, а не скрывать её.
        </Callout>
      </Section>

      <Section number="04" title="Импорты должны идти в понятном направлении">
        <Lead>
          Разделить код на файлы недостаточно. Если каждый файл импортирует каждый, проект превращается в сеть
          скрытых связей. Для небольшого приложения полезно заранее выбрать направление зависимостей.
        </Lead>

        <BranchExplorer
          code={
            'main.py\n' +
            '├── imports services\n' +
            '├── imports storage\n' +
            '└── imports validators\n\n' +
            'services.py\n' +
            '└── imports models\n\n' +
            'storage.py\n' +
            '└── works with serializable data'
          }
          scenarios={[
            { label: "запуск приложения", activeLine: 1, output: "main связывает сервисы и интерфейс" },
            { label: "создание задачи", activeLine: 5, output: "services использует модель Task" },
            { label: "сохранение", activeLine: 8, output: "storage записывает подготовленные данные" },
          ]}
        />

        <CompareSolutions
          question="Какое направление проще поддерживать?"
          left={{
            title: "Круговая связь",
            code:
              '# services.py\nfrom main import tasks\n\n' +
              '# main.py\nfrom services import add_task',
            note: "services зависит от точки входа, а точка входа зависит от services.",
          }}
          right={{
            title: "Явная передача данных",
            code:
              '# services.py\ndef add_task(tasks, task):\n    tasks.append(task)\n\n' +
              '# main.py\nadd_task(tasks, task)',
            note: "Низкоуровневая функция получает зависимость аргументом.",
          }}
          preferred="right"
          explanation="Сервис не должен импортировать состояние из main. Точка входа создаёт состояние и передаёт его функциям."
        />

        <TrueFalse
          statement={
            <>
              Если <code>services.py</code> импортирует <code>main.py</code>, чтобы получить список задач, связь
              становится проще и прозрачнее.
            </>
          }
          isTrue={false}
          explanation="Точка входа должна связывать части проекта, а не становиться источником глобальных данных для нижних модулей."
        />
      </Section>

      <Section number="05" title="Циклический импорт — следствие перепутанных ролей">
        <Lead>
          Цикл появляется, когда модуль A ждёт определения из B, а B во время загрузки уже ждёт A. Часто проблема не
          в синтаксисе import, а в том, что общая ответственность находится не в том файле.
        </Lead>

        <BugHunt
          code={
            '# models.py\n' +
            'from services import normalize_title\n\n' +
            'def create_task(title):\n' +
            '    return {"title": normalize_title(title)}\n\n' +
            '# services.py\n' +
            'from models import create_task'
          }
          question="Почему два модуля образуют цикл?"
          options={[
            "models импортирует services, а services импортирует models",
            "Python запрещает больше одного файла",
            "Имя create_task должно быть короче",
          ]}
          correctIndex={0}
          explanation="Во время импорта каждый модуль ожидает, что другой уже полностью загрузился."
          fix={
            '# validators.py\n' +
            'def normalize_title(title):\n    return title.strip()\n\n' +
            '# models.py\n' +
            'from validators import normalize_title\n\n' +
            '# services.py\n' +
            'from models import create_task'
          }
        />

        <div className="lesson-practice-steps">
          <h3>Шаг 1. Найдите общую нижнюю зависимость</h3>
          <p>
            Если двум модулям нужна одна маленькая проверка, перенесите её в модуль, который не зависит от них.
          </p>

          <h3>Шаг 2. Уберите импорт точки входа</h3>
          <p>
            <code>main.py</code> обычно импортирует остальные части. Остальные части не должны импортировать
            <code>main.py</code> обратно.
          </p>

          <h3>Шаг 3. Проверьте роль функции</h3>
          <p>
            Нормализация входа относится к проверке данных, создание модели — к модели или сервису, вывод меню — к
            интерфейсу.
          </p>
        </div>
      </Section>

      <Section number="06" title="Переносим код маленькими безопасными шагами">
        <Lead>
          Большой перенос десятков функций за один раз затрудняет поиск ошибки. Безопаснее выделять один связный
          кусок, запускать приложение и фиксировать результат отдельным коммитом.
        </Lead>

        <CodeSequence
          title="Соберите безопасный план рефакторинга"
          prompt="Расположите действия так, чтобы после каждого переноса проект оставался запускаемым."
          pieces={[
            { id: "baseline", code: "пройти контрольные сценарии старой программы" },
            { id: "validators", code: "перенести проверки в validators.py" },
            { id: "imports", code: "обновить импорты и запустить сценарии" },
            { id: "commit", code: "сделать отдельный коммит" },
            { id: "services", code: "перенести следующую ответственность" },
            { id: "rewrite", code: "одновременно переписать все функции", note: "слишком большой шаг" },
          ]}
          correctOrder={["baseline", "validators", "imports", "commit", "services"]}
          explanation="Каждый перенос должен иметь проверяемую границу и небольшой diff."
        />

        <TerminalDemo
          title="проверка после переноса"
          lines={[
            { cmd: "python main.py" },
            { out: "StudyHub Planner" },
            { cmd: "git status" },
            { out: "modified: main.py\nnew file: validators.py" },
            { cmd: 'git commit -am "refactor: extract validators"' },
          ]}
        />

        <Callout tone="info">
          Рефакторинг и новая функциональность лучше не смешивать в одном коммите. Тогда причина поломки находится
          быстрее.
        </Callout>
      </Section>

      <Section number="07" title="Каркас проекта перед файловым хранением">
        <Lead>
          В этом уроке storage пока может возвращать пустой список. Важно сначала провести границу, а уже на
          следующем занятии наполнить её реальным чтением и записью.
        </Lead>

        <CodeBlock
          caption="storage.py как контракт"
          code={
            'def load_tasks():\n' +
            '    """Вернуть задачи из постоянного хранилища."""\n' +
            '    return []\n\n' +
            'def save_tasks(tasks):\n' +
            '    """Сохранить текущее состояние задач."""\n' +
            '    pass'
          }
        />

        <CodeBlock
          caption="main.py связывает части"
          code={
            'from services import add_task, delete_task, mark_task_done\n' +
            'from storage import load_tasks, save_tasks\n\n' +
            'def run():\n' +
            '    tasks = load_tasks()\n' +
            '    while True:\n' +
            '        command = input("Команда: ").strip()\n' +
            '        if command == "5":\n' +
            '            save_tasks(tasks)\n' +
            '            break\n\n' +
            'if __name__ == "__main__":\n' +
            '    run()'
          }
        />

        <FillBlank
          prompt="Импортируйте функцию загрузки из модуля storage."
          before="from storage import "
          after=""
          options={["load_tasks", "storage.py", "tasks.json"]}
          answer="load_tasks"
          explanation="В import указывается имя модуля без .py и имя доступного объекта."
        />

        <RecallCard
          question="Почему допустимо сначала сделать storage-заглушку?"
          answer={
            <p>
              Она позволяет закрепить контракт и направление зависимостей до реализации деталей. Main уже знает,
              что получает список через load_tasks и передаёт состояние в save_tasks, но не знает формат файла.
            </p>
          }
        />
      </Section>

      <Section number="08" title="Проверка структуры и итоговая практика">
        <Lead>
          Структура считается удачной не потому, что в ней много файлов, а потому, что разработчик быстро находит
          место изменения и может проверить модуль отдельно.
        </Lead>

        <div className="lesson-check-group">
          <QuizCard
            question="Какова основная ответственность main.py?"
            options={["связать части и запустить сценарий", "хранить все правила", "описывать JSON вручную"]}
            correctIndex={0}
            explanation="Точка входа управляет сценарием и передаёт данные между модулями."
          />
          <QuizCard
            question="Где должна находиться проверка диапазона приоритета?"
            options={["validators.py", "tasks.json", "README.md"]}
            correctIndex={0}
            explanation="Проверка входного значения относится к валидаторам."
          />
          <QuizCard
            question="Почему services.py не должен импортировать список из main.py?"
            options={["возникает обратная зависимость", "списки нельзя импортировать", "main всегда пустой"]}
            correctIndex={0}
            explanation="Нижний модуль начинает зависеть от точки входа и глобального состояния."
          />
          <QuizCard
            question="Что проверять после переноса одной функции?"
            options={["прежние пользовательские сценарии", "только количество строк", "только имя файла"]}
            correctIndex={0}
            explanation="Рефакторинг должен сохранить наблюдаемое поведение."
          />
        </div>

        <KeyTakeaways
          points={[
            <>Файл получает одну основную причину изменения.</>,
            <><code>main.py</code> связывает интерфейс, сервисы и хранилище.</>,
            <><code>models.py</code> описывает форму данных, а <code>services.py</code> — сценарии работы.</>,
            <><code>storage.py</code> скрывает детали постоянного хранения.</>,
            <>Зависимости идут от точки входа к более самостоятельным модулям.</>,
            <>Глобальное состояние лучше передавать аргументами.</>,
            <>Код переносится маленькими шагами с проверкой и отдельными коммитами.</>,
          ]}
        />

        <PracticeCta text="Разделите Console Planner на main.py, models.py, services.py, storage.py и validators.py. Сохраните прежнее поведение, добавьте дерево проекта в README и сделайте отдельный коммит на каждую выделенную ответственность." />
      </Section>
    </RichLesson>
  );
}

// 34. Файлы, pathlib, with и кодировка
export function Lesson34({ module }: { module?: string }) {
  return (
    <RichLesson>
      <RichHero
        variant="project"
        chip={module ?? BLOCK_TITLE}
        title="Файлы, pathlib, with и кодировка"
        intro="Научим Persistent Planner работать с диском: построим путь через pathlib, прочитаем и запишем текст в UTF-8, разберём режимы открытия и гарантированно закроем файл через контекстный менеджер with."
        tags={[
          { icon: <HardDrive size={14} />, label: "путь и файловая система" },
          { icon: <FileText size={14} />, label: "чтение · запись · UTF-8" },
        ]}
      />
      <TheoryBridge lesson={34} />

      <Section number="01" title="От памяти процесса к данным на диске">
        <Lead>
          Список задач живёт только внутри запущенного процесса. После завершения программы оперативная память
          освобождается, поэтому следующий запуск начинает с пустого списка. Файл создаёт постоянную границу:
          программа может записать данные перед завершением и прочитать их при следующем запуске.
        </Lead>

        <div className="lesson-route">
          <ol>
            <li>
              <strong>Найти файл:</strong> собрать путь объектом <code className="lesson-token">Path</code>, а не
              склеивать строку вручную.
            </li>
            <li>
              <strong>Открыть безопасно:</strong> использовать <code className="lesson-token">with</code>, чтобы
              ресурс закрылся и при успехе, и при исключении.
            </li>
            <li>
              <strong>Зафиксировать текст:</strong> явно указать режим и кодировку <code>UTF-8</code>, затем проверить
              содержимое после повторного открытия.
            </li>
          </ol>
          <p>
            В конце storage.py сможет сохранять и загружать текстовый снимок задач, но преобразование в JSON появится
            только на следующем занятии.
          </p>
        </div>

        <TypeCards>
          <TypeCard badge="RAM" title="Временное состояние" code={'tasks = [{"title": "SQL"}]'}>
            Значения доступны, пока работает конкретный процесс Python.
          </TypeCard>
          <TypeCard badge="disk" badgeTone="float" title="Постоянный файл" code={'data/tasks.txt'}>
            Байты остаются на диске после завершения программы.
          </TypeCard>
          <TypeCard badge="storage" badgeTone="str" title="Граница проекта" code={'load_text()\nsave_text(text)'}>
            Остальные модули вызывают функции хранения и не управляют файлом напрямую.
          </TypeCard>
        </TypeCards>

        <Callout tone="info">
          Файл не является «продолжением списка». Между объектами Python и содержимым диска всегда есть этап
          преобразования.
        </Callout>
      </Section>

      <Section number="02" title="Путь зависит от текущей рабочей папки">
        <Lead>
          Относительная строка <code className="lesson-token">data/tasks.txt</code> отсчитывается от текущей рабочей
          папки процесса, а не обязательно от файла storage.py. Поэтому один код может работать из IDE и не находить
          данные при запуске из другой папки.
        </Lead>

        <TerminalDemo
          title="один файл, разные рабочие папки"
          lines={[
            { cmd: "pwd" },
            { out: "C:\\projects\\studyhub" },
            { cmd: "python main.py" },
            { out: "Файл: C:\\projects\\studyhub\\data\\tasks.txt" },
            { cmd: "cd .." },
            { cmd: "python studyhub/main.py" },
            { out: "Относительный путь теперь отсчитывается от C:\\projects" },
          ]}
        />

        <CompareSolutions
          question="Как получить устойчивый путь к data рядом с модулями проекта?"
          left={{
            title: "Зависимость от cwd",
            code: 'DATA_FILE = "data/tasks.txt"',
            note: "Путь работает только при ожидаемой текущей папке.",
          }}
          right={{
            title: "Путь от расположения модуля",
            code:
              'from pathlib import Path\n\n' +
              'BASE_DIR = Path(__file__).resolve().parent\n' +
              'DATA_FILE = BASE_DIR / "data" / "tasks.txt"',
            note: "Адрес строится относительно storage.py.",
          }}
          preferred="right"
          explanation="__file__ указывает на модуль, resolve() получает полный путь, parent выбирает его папку."
        />

        <StepThrough
          code={
            'from pathlib import Path\n\n' +
            'BASE_DIR = Path(__file__).resolve().parent\n' +
            'DATA_DIR = BASE_DIR / "data"\n' +
            'DATA_FILE = DATA_DIR / "tasks.txt"'
          }
          steps={[
            { line: 0, note: "Импортируется класс Path.", vars: { Path: "класс пути" } },
            { line: 2, note: "Получаем абсолютный путь текущего модуля и его родительскую папку.", vars: { BASE_DIR: ".../studyhub" } },
            { line: 3, note: "Оператор / добавляет сегмент пути с правилами текущей ОС.", vars: { DATA_DIR: ".../studyhub/data" } },
            { line: 4, note: "Последний сегмент задаёт конкретный файл.", vars: { DATA_FILE: ".../studyhub/data/tasks.txt" } },
          ]}
        />

        <Callout>
          Не вставляйте Windows-разделители вручную в общий код. <code>Path</code> корректно строит путь и на Windows,
          и на Linux, и на macOS.
        </Callout>
      </Section>

      <Section number="03" title="Path — объект с операциями над путём">
        <Lead>
          <code className="lesson-token">Path</code> хранит адрес и предоставляет именованные операции: проверить
          существование, создать папку, получить имя файла или прочитать текст. Это выразительнее набора строковых
          операций.
        </Lead>

        <MethodGrid
          rows={[
            [<>path.exists()</>, "существует ли файл или папка"],
            [<>path.is_file()</>, "указывает ли путь на обычный файл"],
            [<>path.parent</>, "родительская папка"],
            [<>path.name</>, "имя с расширением"],
            [<>path.suffix</>, "расширение, например .txt"],
            [<>path.mkdir(parents=True, exist_ok=True)</>, "создать папку и недостающих родителей"],
          ]}
        />

        <PredictOutput
          code={
            'from pathlib import Path\n\n' +
            'path = Path("data") / "tasks.txt"\n' +
            'print(path.name)\n' +
            'print(path.suffix)\n' +
            'print(path.parent)'
          }
          output={"tasks.txt\n.txt\ndata"}
          hint="Объект Path можно исследовать без существующего файла."
        />

        <BugHunt
          code={
            'from pathlib import Path\n\n' +
            'path = Path("data/tasks.txt")\n' +
            'path.mkdir(parents=True, exist_ok=True)'
          }
          question="Почему создаётся папка tasks.txt вместо папки data?"
          options={[
            "mkdir вызывается у полного пути к файлу",
            "Path не поддерживает расширения",
            "parents=True удаляет имя файла",
          ]}
          correctIndex={0}
          explanation="mkdir создаёт каталог по тому пути, у которого вызван метод. Для файла сначала выбирают parent."
          fix={
            'from pathlib import Path\n\n' +
            'path = Path("data/tasks.txt")\n' +
            'path.parent.mkdir(parents=True, exist_ok=True)'
          }
        />

        <TrueFalse
          statement={
            <>
              Вызов <code>path.exists()</code> создаёт отсутствующий файл и возвращает <code>True</code>.
            </>
          }
          isTrue={false}
          explanation="exists только проверяет состояние файловой системы и ничего не создаёт."
        />
      </Section>

      <Section number="04" title="Контекстный менеджер with закрывает файл">
        <Lead>
          Открытый файл является ресурсом операционной системы. Его нужно закрыть, чтобы буферы были записаны, а
          файловый дескриптор освобождён. Контекстный менеджер делает завершение ресурса частью структуры кода.
        </Lead>

        <CompareSolutions
          question="Какой вариант гарантирует закрытие при ошибке во время чтения?"
          left={{
            title: "Ручное управление",
            code:
              'file = open("data/tasks.txt", "r", encoding="utf-8")\n' +
              'text = file.read()\n' +
              'file.close()',
            note: "Если read() завершится исключением, close() может не выполниться.",
          }}
          right={{
            title: "Контекстный менеджер",
            code:
              'with open("data/tasks.txt", "r", encoding="utf-8") as file:\n' +
              '    text = file.read()',
            note: "Выход из блока закрывает ресурс автоматически.",
          }}
          preferred="right"
          explanation="with вызывает протокол входа и выхода и освобождает ресурс даже при исключении внутри блока."
        />

        <StepThrough
          code={
            'path = Path("data/tasks.txt")\n' +
            'with path.open("r", encoding="utf-8") as file:\n' +
            '    text = file.read()\n' +
            '    print(file.closed)\n' +
            'print(file.closed)'
          }
          steps={[
            { line: 0, note: "Создан объект пути, файл ещё не открыт.", vars: { path: "data/tasks.txt" } },
            { line: 1, note: "Вход в with открывает файл и связывает объект с именем file.", vars: { "file.closed": "False" } },
            { line: 2, note: "read возвращает всё текстовое содержимое.", vars: { text: "строка" } },
            { line: 3, note: "Внутри блока ресурс открыт.", vars: { вывод: "False" } },
            { line: 4, note: "После выхода контекстный менеджер закрыл файл.", vars: { вывод: "False ⏎ True" } },
          ]}
        />

        <FillBlank
          prompt="Откройте файл на чтение с кодировкой UTF-8."
          before={'with path.open("r", '}
          after={') as file:'}
          options={['encoding="utf-8"', 'mode="json"', 'close=True']}
          answer={'encoding="utf-8"'}
          explanation="Кодировка задаёт правило преобразования байтов файла в символы строки."
        />

        <Callout tone="info">
          После блока <code>with</code> использовать объект <code>file</code> для чтения уже нельзя, но полученная
          строка <code>text</code> остаётся обычным объектом Python.
        </Callout>
      </Section>

      <Section number="05" title="Режимы r, w и a меняют поведение открытия">
        <Lead>
          Режим открытия является частью контракта. Чтение требует существующий файл, запись создаёт или полностью
          заменяет содержимое, а добавление пишет в конец. Ошибочный режим может уничтожить данные до выполнения
          основной логики.
        </Lead>

        <TypeCards>
          <TypeCard badge="r" title="Прочитать" code={'path.open("r", encoding="utf-8")'}>
            Файл должен существовать. Указатель начинается в начале содержимого.
          </TypeCard>
          <TypeCard badge="w" badgeTone="float" title="Перезаписать" code={'path.open("w", encoding="utf-8")'}>
            Создаёт файл или очищает существующий перед записью.
          </TypeCard>
          <TypeCard badge="a" badgeTone="str" title="Добавить в конец" code={'path.open("a", encoding="utf-8")'}>
            Сохраняет прежнее содержимое и дописывает новые символы после него.
          </TypeCard>
        </TypeCards>

        <PredictOutput
          code={
            'path.write_text("первая", encoding="utf-8")\n' +
            'path.write_text("вторая", encoding="utf-8")\n' +
            'print(path.read_text(encoding="utf-8"))'
          }
          output={"вторая"}
          hint="write_text использует перезапись, а не добавление."
        />

        <BugHunt
          code={
            'with path.open("w", encoding="utf-8") as file:\n' +
            '    old_text = file.read()'
          }
          question="Почему прежнее содержимое уже нельзя прочитать?"
          options={[
            "Режим w очищает файл при открытии и не предназначен для чтения",
            "UTF-8 запрещает read",
            "with удаляет файл",
          ]}
          correctIndex={0}
          explanation="Открытие в режиме w обнуляет файл до выполнения тела блока."
          fix={
            'with path.open("r", encoding="utf-8") as file:\n' +
            '    old_text = file.read()'
          }
        />

        <RecallCard
          question="Почему режим w нельзя выбирать автоматически для любой операции?"
          hint="Подумайте, что происходит в момент открытия уже существующего файла."
          answer={
            <p>
              Режим <code>w</code> немедленно очищает существующее содержимое. Его выбирают только для осознанной
              полной записи нового снимка данных.
            </p>
          }
        />
      </Section>

      <Section number="06" title="Кодировка превращает байты в символы">
        <Lead>
          На диске хранится последовательность байтов. Кодировка определяет, как эти байты соответствуют буквам,
          цифрам и знакам. Явный <code className="lesson-token">encoding=&quot;utf-8&quot;</code> делает результат
          одинаковым на разных компьютерах и сохраняет русский текст.
        </Lead>

        <CodeBlock
          caption="запись и чтение русского текста"
          code={
            'from pathlib import Path\n\n' +
            'path = Path("data") / "note.txt"\n' +
            'path.parent.mkdir(parents=True, exist_ok=True)\n\n' +
            'path.write_text("Изучить pathlib", encoding="utf-8")\n' +
            'text = path.read_text(encoding="utf-8")\n' +
            'print(text)'
          }
        />

        <MatchPairs
          prompt="Соедините уровень данных с его представлением."
          leftTitle="Уровень"
          rightTitle="Что находится в программе"
          pairs={[
            { left: "файл на диске", right: "байты" },
            { left: "read_text(..., encoding='utf-8')", right: "строка Python" },
            { left: "write_text(text, encoding='utf-8')", right: "преобразование строки в байты" },
          ]}
          explanation="Кодировка используется на границе между текстовыми объектами Python и байтами файла."
        />

        <TrueFalse
          statement={
            <>
              Если при записи использовалась одна кодировка, при чтении можно без последствий выбрать любую другую.
            </>
          }
          isTrue={false}
          explanation="Несовпадение может вызвать UnicodeDecodeError или превратить символы в нечитаемый текст."
        />

        <Callout>
          Не исправляйте проблемы кодировки удалением русских букв. Исправьте договор чтения и записи: обе стороны
          должны использовать UTF-8.
        </Callout>
      </Section>

      <Section number="07" title="Storage должен обрабатывать ожидаемое отсутствие файла">
        <Lead>
          При первом запуске tasks.txt ещё не существует. Это ожидаемое состояние нового приложения, а не авария.
          Слой хранения может вернуть пустой результат, но не должен скрывать все возможные ошибки одним широким
          <code>except</code>.
        </Lead>

        <CompareSolutions
          question="Как обработать первый запуск без маскировки остальных проблем?"
          left={{
            title: "Скрыть всё",
            code:
              'def load_text():\n' +
              '    try:\n' +
              '        return DATA_FILE.read_text()\n' +
              '    except Exception:\n' +
              '        return ""',
            note: "Ошибка прав доступа и ошибка программирования тоже становятся пустой строкой.",
          }}
          right={{
            title: "Проверить ожидаемое состояние",
            code:
              'def load_text():\n' +
              '    if not DATA_FILE.exists():\n' +
              '        return ""\n' +
              '    return DATA_FILE.read_text(encoding="utf-8")',
            note: "Отсутствие файла обработано явно, остальные ошибки остаются видимыми.",
          }}
          preferred="right"
          explanation="Ожидаемый сценарий описывается точно, а неожиданные ошибки не превращаются в ложный успех."
        />

        <CodeBlock
          caption="storage.py после занятия"
          code={
            'from pathlib import Path\n\n' +
            'BASE_DIR = Path(__file__).resolve().parent\n' +
            'DATA_FILE = BASE_DIR / "data" / "tasks.txt"\n\n' +
            'def load_text():\n' +
            '    if not DATA_FILE.exists():\n' +
            '        return ""\n' +
            '    return DATA_FILE.read_text(encoding="utf-8")\n\n' +
            'def save_text(text):\n' +
            '    DATA_FILE.parent.mkdir(parents=True, exist_ok=True)\n' +
            '    DATA_FILE.write_text(text, encoding="utf-8")'
          }
        />

        <CodeSequence
          title="Соберите безопасную запись текста"
          prompt="Расположите шаги так, чтобы папка существовала до открытия файла."
          pieces={[
            { id: "path", code: 'path = BASE_DIR / "data" / "tasks.txt"' },
            { id: "mkdir", code: "path.parent.mkdir(parents=True, exist_ok=True)" },
            { id: "open", code: 'with path.open("w", encoding="utf-8") as file:' },
            { id: "write", code: "    file.write(text)" },
          ]}
          correctOrder={["path", "mkdir", "open", "write"]}
          explanation="Сначала строится путь и создаётся родительская папка, затем выполняется запись."
        />
      </Section>

      <Section number="08" title="Проверка файлового слоя">
        <Lead>
          Файловый код нужно проверять не только чтением функций. Выполните полный цикл: отсутствующий файл,
          первая запись, повторное чтение, перезапись и русский текст.
        </Lead>

        <div className="lesson-check-group">
          <QuizCard
            question="От чего отсчитывается простой относительный путь?"
            options={["от текущей рабочей папки", "всегда от storage.py", "от домашней папки Python"]}
            correctIndex={0}
            explanation="Относительный путь разрешается относительно cwd процесса."
          />
          <QuizCard
            question="Зачем использовать with при работе с файлом?"
            options={["гарантировать закрытие ресурса", "автоматически создать JSON", "изменить кодировку"]}
            correctIndex={0}
            explanation="Контекстный менеджер освобождает ресурс при любом выходе из блока."
          />
          <QuizCard
            question="Что делает режим w при открытии существующего файла?"
            options={["очищает его", "только читает", "добавляет текст в конец"]}
            correctIndex={0}
            explanation="w создаёт новый снимок содержимого и обнуляет прежний."
          />
          <QuizCard
            question="Какую кодировку фиксируем в проекте?"
            options={["UTF-8", "случайную системную", "кодировку терминала"]}
            correctIndex={0}
            explanation="Единый явный договор делает файлы переносимыми."
          />
        </div>

        <KeyTakeaways
          points={[
            <>Состояние в памяти исчезает после завершения процесса, файл остаётся на диске.</>,
            <><code>Path</code> строит переносимые пути и предоставляет файловые операции.</>,
            <>Путь от <code>__file__</code> не зависит от папки запуска.</>,
            <><code>with</code> гарантирует закрытие файла.</>,
            <>Режим <code>r</code> читает, <code>w</code> перезаписывает, <code>a</code> дописывает.</>,
            <>Чтение и запись используют одинаковую кодировку UTF-8.</>,
            <>Ожидаемое отсутствие файла обрабатывается точно, остальные ошибки остаются видимыми.</>,
          ]}
        />

        <PracticeCta text="Реализуйте storage.py с DATA_FILE на основе Path. Проверьте первый запуск без файла, запись русского текста, повторное чтение и полную перезапись содержимого." />
      </Section>
    </RichLesson>
  );
}

// 35. JSON: сериализация и десериализация
export function Lesson35({ module }: { module?: string }) {
  return (
    <RichLesson>
      <RichHero
        variant="project"
        chip={module ?? BLOCK_TITLE}
        title="JSON: сериализация и десериализация"
        intro="Переведём задачи StudyHub между объектами Python и текстовым форматом JSON: разберём dumps/loads и dump/load, допустимые типы, читаемую запись UTF-8, проверку структуры и восстановление после повреждённого файла."
        tags={[
          { icon: <Braces size={14} />, label: "Python ↔ JSON" },
          { icon: <Save size={14} />, label: "сохранение состояния" },
        ]}
      />
      <TheoryBridge lesson={35} />

      <Section number="01" title="JSON нужен как договор хранения">
        <Lead>
          Обычная строка может сохранить название одной задачи, но плохо описывает список записей с id, приоритетом
          и статусом. JSON хранит вложенные списки, объекты и простые значения в текстовой форме, которую можно
          прочитать человеку и обработать программой.
        </Lead>

        <div className="lesson-route">
          <ol>
            <li>
              <strong>Сериализовать:</strong> превратить список и словари Python в JSON-текст.
            </li>
            <li>
              <strong>Записать:</strong> сохранить текст в UTF-8 с понятными отступами.
            </li>
            <li>
              <strong>Десериализовать:</strong> прочитать файл, восстановить объекты и проверить ожидаемую форму.
            </li>
          </ol>
          <p>
            Итогом станет storage.py, который возвращает список задач при первом запуске, сохраняет снимок после
            изменения и сообщает о повреждённом JSON понятной ошибкой.
          </p>
        </div>

        <CompareSolutions
          question="Какой формат лучше сохраняет структуру одной задачи?"
          left={{
            title: "Строка с разделителями",
            code: '1|Изучить JSON|3|False',
            note: "Нужно помнить порядок полей и экранировать символ-разделитель внутри текста.",
          }}
          right={{
            title: "JSON-объект",
            code:
              '{\n' +
              '  "id": 1,\n' +
              '  "title": "Изучить JSON",\n' +
              '  "priority": 3,\n' +
              '  "is_done": false\n' +
              '}',
            note: "Поля имеют имена, а типы описаны синтаксисом формата.",
          }}
          preferred="right"
          explanation="JSON сохраняет явную структуру и не связывает смысл поля с его позицией в строке."
        />

        <Callout tone="info">
          JSON является форматом данных, а не базой данных и не Python-кодом. Он не выполняет функции и не хранит
          произвольные объекты автоматически.
        </Callout>
      </Section>

      <Section number="02" title="Сериализация и десериализация — два направления">
        <Lead>
          Сериализация превращает объекты программы в представление для хранения или передачи. Десериализация идёт
          обратно: читает представление и создаёт новые объекты Python с теми же данными.
        </Lead>

        <TypeCards>
          <TypeCard badge="serialize" title="Python → JSON" code={'json.dumps(tasks)'}>
            Список и словари превращаются в одну строку формата JSON.
          </TypeCard>
          <TypeCard badge="text" badgeTone="float" title="JSON на границе" code={'[{"id": 1, "is_done": false}]'}>
            Это текст с правилами JSON: двойные кавычки, <code>false</code>, <code>true</code>, <code>null</code>.
          </TypeCard>
          <TypeCard badge="deserialize" badgeTone="str" title="JSON → Python" code={'json.loads(text)'}>
            Возвращаются новый список, новые словари и простые значения Python.
          </TypeCard>
        </TypeCards>

        <StepThrough
          code={
            'import json\n\n' +
            'tasks = [{"id": 1, "title": "SQL", "is_done": False}]\n' +
            'text = json.dumps(tasks, ensure_ascii=False)\n' +
            'restored = json.loads(text)\n' +
            'print(restored[0]["title"])'
          }
          steps={[
            { line: 2, note: "В памяти находится список со словарём Python.", vars: { "type(tasks)": "list" } },
            { line: 3, note: "dumps создаёт строку JSON. False записывается как false.", vars: { "type(text)": "str" } },
            { line: 4, note: "loads разбирает строку и создаёт новый список.", vars: { "type(restored)": "list" } },
            { line: 5, note: "К восстановленному словарю применим обычный доступ по ключу.", vars: { вывод: "SQL" } },
          ]}
        />

        <TrueFalse
          statement={
            <>
              После <code>restored = json.loads(json.dumps(tasks))</code> имена <code>restored</code> и
              <code>tasks</code> указывают на один список.
            </>
          }
          isTrue={false}
          explanation="Десериализация создаёт новые контейнеры. Равные данные не означают один объект в памяти."
        />
      </Section>

      <Section number="03" title="dumps/loads работают со строкой, dump/load — с файлом">
        <Lead>
          Буква <code>s</code> в <code>dumps</code> и <code>loads</code> помогает запомнить работу со строкой. Без
          неё функции принимают файловый объект, уже открытый в подходящем режиме.
        </Lead>

        <MethodGrid
          rows={[
            [<>json.dumps(value)</>, "вернуть JSON-строку"],
            [<>json.loads(text)</>, "разобрать JSON-строку"],
            [<>json.dump(value, file)</>, "записать JSON в открытый текстовый файл"],
            [<>json.load(file)</>, "прочитать JSON из открытого текстового файла"],
          ]}
        />

        <CompareSolutions
          question="Как сохранить список напрямую через открытый файл?"
          left={{
            title: "Получить строку отдельно",
            code:
              'text = json.dumps(tasks, ensure_ascii=False, indent=2)\n' +
              'file.write(text)',
            note: "Полезно, если строку нужно дополнительно обработать.",
          }}
          right={{
            title: "Передать файловый объект",
            code:
              'json.dump(tasks, file, ensure_ascii=False, indent=2)',
            note: "Короткая прямая запись в открытый файл.",
          }}
          preferred="both"
          explanation="Оба варианта корректны. Выбор зависит от того, нужен ли промежуточный JSON-текст."
        />

        <BugHunt
          code={
            'with DATA_FILE.open("w", encoding="utf-8") as file:\n' +
            '    json.dumps(tasks, file)'
          }
          question="Почему вызов записан неверно?"
          options={[
            "dumps не принимает файловый объект вторым аргументом",
            "JSON нельзя писать в UTF-8",
            "режим w запрещён для JSON",
          ]}
          correctIndex={0}
          explanation="Для файла используется dump, а dumps только возвращает строку."
          fix={
            'with DATA_FILE.open("w", encoding="utf-8") as file:\n' +
            '    json.dump(tasks, file, ensure_ascii=False, indent=2)'
          }
        />

        <FillBlank
          prompt="Прочитайте JSON из уже открытого файла."
          before="tasks = json."
          after="(file)"
          options={["load", "loads", "dump"]}
          answer="load"
          explanation="load получает файловый объект и возвращает восстановленное значение Python."
        />
      </Section>

      <Section number="04" title="JSON поддерживает ограниченный набор типов">
        <Lead>
          Формат умеет хранить объект, массив, строку, число, логическое значение и null. Большинство базовых
          структур StudyHub переводятся напрямую, но множество, Path, функция и пользовательский класс не имеют
          стандартного JSON-представления.
        </Lead>

        <MatchPairs
          prompt="Соедините тип Python с представлением JSON."
          leftTitle="Python"
          rightTitle="JSON"
          pairs={[
            { left: "dict", right: "object" },
            { left: "list / tuple", right: "array" },
            { left: "str", right: "string" },
            { left: "int / float", right: "number" },
            { left: "True / False", right: "true / false" },
            { left: "None", right: "null" },
          ]}
          explanation="После обратного преобразования массив становится list, а объект — dict."
        />

        <BugHunt
          code={
            'import json\n\n' +
            'task = {"title": "Python", "tags": {"backend", "study"}}\n' +
            'print(json.dumps(task))'
          }
          question="Почему возникает TypeError?"
          options={[
            "set не является стандартным типом JSON",
            "словари нельзя сериализовать",
            "строки должны быть только латинскими",
          ]}
          correctIndex={0}
          explanation="Множество нужно заранее превратить в список или определить собственное правило преобразования."
          fix={
            'import json\n\n' +
            'task = {"title": "Python", "tags": ["backend", "study"]}\n' +
            'print(json.dumps(task, ensure_ascii=False))'
          }
        />

        <PredictOutput
          code={
            'import json\n\n' +
            'text = json.dumps({"done": False, "deadline": None})\n' +
            'print(text)'
          }
          output={'{"done": false, "deadline": null}'}
          hint="JSON использует собственные литералы false и null."
        />

        <Callout>
          Не вызывайте <code>str(task)</code> вместо сериализации. Строковое представление Python не обязано быть
          корректным JSON и использует другие литералы.
        </Callout>
      </Section>

      <Section number="05" title="Читаемый JSON: ensure_ascii, indent и единый снимок">
        <Lead>
          Параметры записи не меняют данные, но влияют на удобство проверки файла и Git-diff. Русские символы лучше
          оставлять читаемыми, а вложенность показывать отступами.
        </Lead>

        <CodeBlock
          caption="понятный tasks.json"
          code={
            'with DATA_FILE.open("w", encoding="utf-8") as file:\n' +
            '    json.dump(\n' +
            '        tasks,\n' +
            '        file,\n' +
            '        ensure_ascii=False,\n' +
            '        indent=2,\n' +
            '    )'
          }
        />

        <TypeCards>
          <TypeCard badge="ensure_ascii" title="Сохранить буквы" code={'ensure_ascii=False'}>
            Кириллица остаётся кириллицей, а не последовательностью <code>\uXXXX</code>.
          </TypeCard>
          <TypeCard badge="indent" badgeTone="float" title="Показать вложенность" code={'indent=2'}>
            Каждый уровень структуры получает два пробела.
          </TypeCard>
          <TypeCard badge="snapshot" badgeTone="str" title="Перезаписать целиком" code={'mode="w"'}>
            Файл отражает текущее состояние списка, а не журнал отдельных операций.
          </TypeCard>
        </TypeCards>

        <RecallCard
          question="Почему для списка задач режим добавления a обычно не подходит?"
          hint="Что получится, если два полных JSON-массива записать подряд?"
          answer={
            <p>
              Два массива подряд не образуют один корректный JSON-документ. Для снимка состояния формируется один
              актуальный список и файл полностью перезаписывается.
            </p>
          }
        />

        <TrueFalse
          statement={
            <>
              Параметр <code>indent=2</code> добавляет новые поля в словари задач.
            </>
          }
          isTrue={false}
          explanation="Он меняет только пробелы и переносы в текстовом представлении."
        />
      </Section>

      <Section number="06" title="Корректный JSON ещё не гарантирует корректную модель">
        <Lead>
          Строка <code className="lesson-token">42</code> является корректным JSON, но Persistent Planner ожидает
          список задач. После синтаксического разбора слой хранения должен проверить корневой тип и минимальную форму
          каждой записи.
        </Lead>

        <CodeBlock
          caption="проверка корневого значения"
          code={
            'def validate_loaded_tasks(value):\n' +
            '    if not isinstance(value, list):\n' +
            '        raise ValueError("Корень tasks.json должен быть списком")\n\n' +
            '    for index, task in enumerate(value):\n' +
            '        if not isinstance(task, dict):\n' +
            '            raise ValueError(f"Элемент {index} должен быть объектом")\n' +
            '        if "id" not in task or "title" not in task:\n' +
            '            raise ValueError(f"У элемента {index} нет обязательных полей")\n\n' +
            '    return value'
          }
        />

        <BranchExplorer
          code={
            'value = json.load(file)\n' +
            'if not isinstance(value, list):\n' +
            '    raise ValueError("Ожидался список")\n' +
            'for task in value:\n' +
            '    if not isinstance(task, dict):\n' +
            '        raise ValueError("Ожидался объект задачи")\n' +
            'return value'
          }
          scenarios={[
            { label: "[]", activeLine: 6, output: "пустой список принят" },
            { label: '{"id": 1}', activeLine: 2, output: "ошибка корневого типа" },
            { label: '["SQL"]', activeLine: 5, output: "элемент не является словарём" },
          ]}
        />

        <CompareSolutions
          question="Нужно ли молча заменять любую неверную структуру пустым списком?"
          left={{
            title: "Маскировать данные",
            code: 'if not isinstance(value, list):\n    return []',
            note: "Пользователь увидит будто задач нет, хотя файл повреждён.",
          }}
          right={{
            title: "Сообщить о нарушении контракта",
            code: 'if not isinstance(value, list):\n    raise ValueError("Ожидался список задач")',
            note: "Причина потери данных остаётся видимой.",
          }}
          preferred="right"
          explanation="Повреждение структуры нельзя выдавать за нормальное пустое состояние."
        />
      </Section>

      <Section number="07" title="Повреждённый JSON и резервная копия">
        <Lead>
          Пользователь может вручную удалить кавычку или программа может завершиться во время записи. Модуль json
          сообщает о синтаксической проблеме через <code>JSONDecodeError</code>. Её можно преобразовать в понятную
          ошибку уровня хранилища, сохранив исходную причину.
        </Lead>

        <CodeBlock
          caption="точная обработка повреждённого файла"
          code={
            'import json\n\n' +
            'def load_tasks():\n' +
            '    if not DATA_FILE.exists():\n' +
            '        return []\n\n' +
            '    try:\n' +
            '        with DATA_FILE.open("r", encoding="utf-8") as file:\n' +
            '            value = json.load(file)\n' +
            '    except json.JSONDecodeError as error:\n' +
            '        raise ValueError(\n' +
            '            f"tasks.json повреждён: строка {error.lineno}"\n' +
            '        ) from error\n\n' +
            '    return validate_loaded_tasks(value)'
          }
        />

        <CodeSequence
          title="Сохранение с резервной копией"
          prompt="Расположите действия так, чтобы прежний корректный файл можно было восстановить."
          pieces={[
            { id: "mkdir", code: "DATA_FILE.parent.mkdir(parents=True, exist_ok=True)" },
            { id: "backup", code: "if DATA_FILE.exists(): copy2(DATA_FILE, BACKUP_FILE)" },
            { id: "open", code: 'with DATA_FILE.open("w", encoding="utf-8") as file:' },
            { id: "dump", code: "    json.dump(tasks, file, ensure_ascii=False, indent=2)" },
          ]}
          correctOrder={["mkdir", "backup", "open", "dump"]}
          explanation="Сначала подготавливается папка и копируется старый снимок, затем основной файл заменяется новым."
        />

        <Callout tone="info">
          В этом блоке резервная копия остаётся простой учебной защитой. Атомарная запись через временный файл может
          быть добавлена позже как отдельное улучшение.
        </Callout>
      </Section>

      <Section number="08" title="Готовый контракт JSON-хранилища">
        <Lead>
          Остальная программа должна знать только два действия: получить список задач и сохранить новый снимок.
          Детали JSON, пути, кодировки и ошибок остаются внутри storage.py.
        </Lead>

        <CodeBlock
          caption="storage.py"
          code={
            'import json\n' +
            'from pathlib import Path\n\n' +
            'BASE_DIR = Path(__file__).resolve().parent\n' +
            'DATA_FILE = BASE_DIR / "data" / "tasks.json"\n\n' +
            'def load_tasks():\n' +
            '    if not DATA_FILE.exists():\n' +
            '        return []\n' +
            '    with DATA_FILE.open("r", encoding="utf-8") as file:\n' +
            '        tasks = json.load(file)\n' +
            '    return validate_loaded_tasks(tasks)\n\n' +
            'def save_tasks(tasks):\n' +
            '    DATA_FILE.parent.mkdir(parents=True, exist_ok=True)\n' +
            '    with DATA_FILE.open("w", encoding="utf-8") as file:\n' +
            '        json.dump(tasks, file, ensure_ascii=False, indent=2)'
          }
        />

        <div className="lesson-check-group">
          <QuizCard
            question="Что возвращает json.dumps?"
            options={["строку", "открытый файл", "объект Path"]}
            correctIndex={0}
            explanation="dumps сериализует значение в JSON-текст."
          />
          <QuizCard
            question="Какая функция читает JSON из файлового объекта?"
            options={["json.load", "json.loads", "json.dump"]}
            correctIndex={0}
            explanation="load работает с открытым файлом, loads — со строкой."
          />
          <QuizCard
            question="Почему set нельзя сохранить напрямую?"
            options={["у JSON нет стандартного типа set", "множество всегда пустое", "set является файлом"]}
            correctIndex={0}
            explanation="Его нужно преобразовать в поддерживаемую структуру, обычно list."
          />
          <QuizCard
            question="Что проверяется после json.load?"
            options={["форма восстановленных данных", "цвет редактора", "версия Git"]}
            correctIndex={0}
            explanation="Синтаксически корректный JSON может не соответствовать модели приложения."
          />
        </div>

        <KeyTakeaways
          points={[
            <>Сериализация переводит объекты Python в JSON, десериализация выполняет обратный переход.</>,
            <><code>dumps/loads</code> работают со строками, <code>dump/load</code> — с файлами.</>,
            <>JSON поддерживает ограниченный набор простых типов.</>,
            <><code>ensure_ascii=False</code> сохраняет читаемую кириллицу, <code>indent=2</code> показывает структуру.</>,
            <>Корневой тип и обязательные поля проверяются после чтения.</>,
            <><code>JSONDecodeError</code> не нужно скрывать как пустой список.</>,
            <>storage.py скрывает формат и предоставляет функции load_tasks/save_tasks.</>,
          ]}
        />

        <PracticeCta text="Переведите storage.py с текста на JSON. Проверьте пустой первый запуск, сохранение двух задач, русский текст, повреждённую кавычку, неверный корневой тип и восстановление из резервной копии." />
      </Section>
    </RichLesson>
  );
}

// 36. Класс, объект, __init__ и self
export function Lesson36({ module }: { module?: string }) {
  return (
    <RichLesson>
      <RichHero
        variant="project"
        chip={module ?? BLOCK_TITLE}
        title="Класс, объект, __init__ и self"
        intro="Перенесём модель задачи из словаря в класс Task: разделим описание типа и конкретные объекты, разберём создание экземпляра, роль __init__, ссылку self и независимое состояние нескольких задач."
        tags={[
          { icon: <Boxes size={14} />, label: "класс и экземпляры" },
          { icon: <Puzzle size={14} />, label: "__init__ · self" },
        ]}
      />
      <TheoryBridge lesson={36} />

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
export function Lesson37({ module }: { module?: string }) {
  return (
    <RichLesson>
      <RichHero
        variant="project"
        chip={module ?? BLOCK_TITLE}
        title="Атрибуты, методы и __str__"
        intro="Добавим модели Task поведение: разберём атрибуты экземпляра и класса, вызов методов через объект, изменение собственного состояния, возврат результата, строковое представление __str__ и подготовку словаря для JSON."
        tags={[
          { icon: <Wrench size={14} />, label: "состояние и методы" },
          { icon: <FileText size={14} />, label: "__str__ и формат" },
        ]}
      />
      <TheoryBridge lesson={37} />

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
export function Lesson38({ module }: { module?: string }) {
  return (
    <RichLesson>
      <RichHero
        variant="project"
        chip={module ?? BLOCK_TITLE}
        title="Инкапсуляция, геттеры, сеттеры и property"
        intro="Защитим допустимое состояние Task: разберём публичный интерфейс и внутренние атрибуты, добавим явные геттеры и сеттеры, затем сохраним удобный синтаксис через @property и проведём все изменения через единые правила валидации."
        tags={[
          { icon: <LockKeyhole size={14} />, label: "границы объекта" },
          { icon: <ShieldCheck size={14} />, label: "property и инварианты" },
        ]}
      />
      <TheoryBridge lesson={38} />

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
