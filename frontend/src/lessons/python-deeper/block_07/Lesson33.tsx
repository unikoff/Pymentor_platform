import {
  FolderGit2,
  GitFork,
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
  MatchPairs,
  MethodGrid,
  PracticeCta,
  QuizCard,
  RecallCard,
  RichHero,
  RichLesson,
  Section,
  TerminalDemo,
  TrueFalse,
  TypeCard,
  TypeCards,
  TheoryBridge,
} from "../../shared";

// 33. Ответственность файлов небольшого проекта
export function Lesson33({ module }: { module?: string }) {
  return (
    <RichLesson>
      <RichHero
        variant="project"
        chip={module ?? "Блок 7 · Файлы, JSON и объектная модель"}
        title="Ответственность файлов небольшого проекта"
        intro="Перестроим Console Planner из одного большого файла в небольшой проект: определим ответственность main, models, services, storage и validators, проведём зависимости в одном направлении и перенесём код без изменения поведения."
        tags={[
          { icon: <FolderGit2 size={14} />, label: "структура проекта" },
          { icon: <GitFork size={14} />, label: "направление зависимостей" },
        ]}
      />
      <TheoryBridge link={"Модули уже разделены, теперь файлы получают роли: main, models, services, storage и validators существуют ради разных причин для изменения."} boundary={"Разнести код по файлам недостаточно: зависимости всё равно должны идти в одну понятную сторону."} />

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
