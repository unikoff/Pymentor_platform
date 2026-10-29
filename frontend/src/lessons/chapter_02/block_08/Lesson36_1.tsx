import { Database, FolderOpen, Share2 } from "lucide-react";
import {
  BugHunt,
  Callout,
  CodeBlock,
  CodeSequence,
  Diagram,
  DiagramArrow,
  DiagramExchange,
  DiagramFlow,
  DiagramNode,
  LinkedNotes,
  Lead,
  MethodGrid,
  PredictOutput,
  QuizCard,
  RichHero,
  RichLesson,
  Section,
  StepThrough,
} from "../../shared";

export function Lesson36_1({ module }: { module?: string }) {
  return (
    <RichLesson>
      <RichHero
        chip={module ?? "Месяц 2 · Блок 8"}
        title="JsonStorage вокруг готового хранения"
        intro="Продолжим тот же Planner после перехода на Task. Перенесём настройку пути и файловый договор в один объект, затем подключим его к существующим операциям."
        tags={[
          { icon: <Database size={14} />, label: "объектное хранение" },
          { icon: <Share2 size={14} />, label: "композиция" },
          { icon: <FolderOpen size={14} />, label: "актуальные данные" },
        ]}
      />

      <Section number="00" title="От функций к объекту с настройкой">
        <Lead>
          В предыдущем шаге мы подключили подготовленную Task, а чтение и запись всё ещё выполняют файловые функции. Теперь свяжем путь с поведением хранения так, чтобы каждая команда обращалась к актуальным данным.
        </Lead>
        <LinkedNotes
          variant="connected"
          items={[
            {
              title: "Точка старта",
              description: "Операции работают с Task, а функциональные load_tasks и save_tasks переводят её данные через JSON-записи.",
            },
            {
              title: "Новый вопрос",
              description: "Как закрепить выбранный путь за хранилищем и перестать держать отдельный список на всё время работы CLI?",
            },
            {
              title: "Результат",
              description: "JsonStorage(path) получает load() и save(tasks), а действующие команды передают ему работу с данными.",
            },
          ]}
        />
        <p>
          Уже работают чтение, сохранение, проверка записей и обработка ошибок. Меняем место хранения пути и вызова этих действий. Сначала разберём экземпляр, затем перенесём функции и подключим операции.
        </p>
      </Section>

      <Section number="01" title="Путь становится состоянием экземпляра">
        <Lead>
          Раньше мы передавали путь функции при каждом чтении или сохранении. Теперь один экземпляр запомнит путь и предоставит два действия. Это и есть связь состояния объекта с его методами.
        </Lead>
        <MethodGrid
          rows={[
            ["load_tasks(path)", "Функция получает путь при каждом вызове."],
            ["storage = JsonStorage(path)", "Создание экземпляра сохраняет настройку; файл пока не читается."],
            ["storage.load()", "Метод читает файл по пути из этого экземпляра."],
          ]}
        />
        <p>
          Сначала разберём независимый пример без работы с файлом. Класс FileLabel хранит путь и умеет вернуть только имя файла. Конструктор <code>__init__</code> записывает аргумент в <code>self.path</code>. Слово <code>self</code> обозначает тот экземпляр, чей метод сейчас вызван.
        </p>
        <CodeBlock
          caption="независимый пример: два экземпляра помнят разные пути"
          code={
            "from pathlib import Path\n" +
            "\n" +
            "class FileLabel:\n" +
            "    def __init__(self, path: Path):\n" +
            "        self.path = path\n" +
            "\n" +
            "    def name(self) -> str:\n" +
            "        return self.path.name\n" +
            "\n" +
            "first = FileLabel(Path(\"probe_a.json\"))\n" +
            "second = FileLabel(Path(\"probe_b.json\"))\n" +
            "print(first.name(), second.name())"
          }
        />
        <p>
          Вывод: <code>probe_a.json probe_b.json</code>. Первый вызов <code>name()</code> берёт путь из <code>first.path</code>, второй из <code>second.path</code>. Поле хранится у каждого объекта отдельно, поэтому создание второго экземпляра не меняет первый.
        </p>
        <PredictOutput
          code={
            "first = FileLabel(Path(\"probe_a.json\"))\n" +
            "second = FileLabel(Path(\"probe_b.json\"))\n" +
            "print(first.path.name)\n" +
            "print(second.path.name)\n" +
            "print(first.path == second.path)"
          }
          output={"probe_a.json\nprobe_b.json\nFalse"}
          hint="У каждого экземпляра свой self.path. Path можно сравнить, не открывая файл."
        />
        <p>
          Подписанный конверт хранит адрес, но не отправляет письмо. Так и <code>self.path</code>: настройка, а <code>load()</code> и <code>save(tasks)</code>: действия. JsonStorage не держит список задач между командами и не предотвращает ошибки файла.
        </p>
        <QuizCard
          question="Что уже произошло после создания JsonStorage(path)?"
          options={[
            "Экземпляр запомнил путь, файлового чтения ещё не было",
            "Файл автоматически прочитан и список задач сохранён в поле",
            "Запустился CLI и запросил команду",
          ]}
          correctIndex={0}
          explanation="Мы разделяем настройку и действие: конструктор связывает path с экземпляром, а чтение начнётся при явном вызове load()."
        />
      </Section>

      <Section number="02" title="Переносим известный договор в JsonStorage">
        <Lead>
          Перенесём две файловые функции в класс. <code>load()</code> возвращает список Task, <code>save(tasks)</code> записывает его целиком. Оба метода используют <code>self.path</code>.
        </Lead>
        <MethodGrid
          rows={[
            ["load_tasks(path) → storage.load()", "Те же чтение, проверка всего списка и Task.from_dict."],
            ["save_tasks(path, tasks) → storage.save(tasks)", "Те же Task.to_dict, проверка и запись полного JSON."],
            ["path → self.path", "Путь задаётся при создании объекта и доступен обоим методам."],
          ]}
        />
        <p>
          Файл содержит список словарей. При загрузке проверяем весь список, включая повторяющиеся id, затем <code>Task.from_dict</code> создаёт объекты. При сохранении <code>Task.to_dict</code> готовит словари; проверку и кодирование JSON заканчиваем до открытия файла в режиме <code>w</code>.
        </p>
        <CodeBlock
          caption="структурный фрагмент класса, тела методов переносят готовый IO"
          code={
            "from pathlib import Path\n" +
            "from app.models import Task\n" +
            "\n" +
            "class JsonStorage:\n" +
            "    def __init__(self, path: Path) -> None:\n" +
            "        self.path = path\n" +
            "\n" +
            "    def load(self) -> list[Task]:\n" +
            "        # Здесь остаются чтение, проверка снимка и from_dict\n" +
            "        ...\n" +
            "\n" +
            "    def save(self, tasks: list[Task]) -> None:\n" +
            "        # Здесь остаются проверка, to_dict и запись JSON\n" +
            "        ..."
          }
        />
        <p>
          <code>...</code> обозначает место для старого кода, а не готовую реализацию. В теле методов заменяем <code>path</code> на <code>self.path</code>. Помощники проверки остаются; публичные <code>load_tasks</code> и <code>save_tasks</code> после переключения вызовов удаляем.
        </p>
        <MethodGrid
          rows={[
            ["Полная старая запись без tags", "from_dict применяет согласованное правило совместимости; это допустимые данные."],
            ["Нет обязательного title", "Неверный снимок: ошибка, а не пустой список."],
            ["Повреждённый JSON", "Ошибка чтения сохраняет причину в StorageError."],
          ]}
        />
        <p>
          Операции работают с Task, а файл хранит словари. Не заменяем <code>to_dict</code> на <code>str(task)</code> и не открываем файл из Task. Сборка задаёт путь: обычно <code>data/tasks.json</code>, при проверке отдельный файл.
        </p>
        <Callout tone="info">
          Для отсутствующего файла допустим <code>[]</code>. Неверный JSON или записи в существующем файле требуют <code>StorageError</code> с причиной: пустой список скрыл бы повреждение и мог привести к перезаписи.
        </Callout>
      </Section>

      <Section number="03" title="Операция использует хранилище через композицию">
        <Lead>
          Сборка выбирает путь и создаёт JsonStorage. CLI передаёт объект операции, а операция решает, когда читать и сохранять.
        </Lead>
        <p>
          Как мастер пользуется настроенным инструментом, операция получает JsonStorage и вызывает его методы. Это композиция: использование другого объекта без наследования от него.
        </p>
        <Diagram caption="Путь зависимости и данных для одной команды">
          <DiagramFlow label="Сборка передаёт зависимость, операция обращается к файлу" orientation="horizontal">
            <DiagramNode title="app.main" shape="process">
              <p>Выбирает Path и создаёт JsonStorage</p>
            </DiagramNode>
            <DiagramArrow label="передаёт экземпляр" />
            <DiagramNode title="CLI и операция" shape="process">
              <p>Принимают команду и выполняют прежний сценарий</p>
            </DiagramNode>
            <DiagramExchange forward="load(); save(tasks) при изменении" reverse="актуальный list[Task]" />
            <DiagramNode title="JsonStorage" shape="subprocess">
              <p>Использует сохранённый path</p>
            </DiagramNode>
            <DiagramArrow label="читает или записывает полный снимок" />
            <DiagramNode title="JSON-файл" shape="database">
              <p>Словарные записи задач</p>
            </DiagramNode>
          </DiagramFlow>
        </Diagram>
        <p>
          Разделим стрелки: <code>main → CLI → операция</code> передаёт один экземпляр с путём. <code>storage.load()</code> возвращает новый список Task. Операция решает, изменять ли его и вызывать ли <code>save(tasks)</code>.
        </p>
        <p>
          Task описывает одну задачу, JsonStorage отвечает за файл, операция выполняет действие над списком, а CLI отвечает за ввод и ответ. Эти роли сохраняем при переносе.
        </p>
      </Section>

      <Section number="04" title="Актуальный список на время одной операции">
        <Lead>
          CLI раньше держал список между командами. Теперь каждая операция сама читает файл, поэтому следующее действие видит сохранённые изменения.
        </Lead>
        <p>
          В проверочном файле одна задача. Экземпляры <code>a</code> и <code>b</code> получили один Path, а <code>extra_task</code> заранее создана с новым id. Сравним старый список и повторную загрузку после записи.
        </p>
        <StepThrough
          code={
            "a = JsonStorage(probe_path)\n" +
            "b = JsonStorage(probe_path)\n" +
            "before = a.load()\n" +
            "new = b.load()\n" +
            "new.append(extra_task)\n" +
            "b.save(new)\n" +
            "after = a.load()\n" +
            "print(len(before), len(after))"
          }
          steps={[
            { line: 1, note: "Оба объекта помнят один путь. При создании файл ещё не открывался.", vars: { "a.path == b.path": "True" } },
            { line: 2, note: "Первая загрузка a возвращает отдельный список из одной Task.", vars: { "len(before)": "1" } },
            { line: 4, note: "b загрузил свой список, затем мы добавили в него вторую Task с новым id.", vars: { "len(new)": "2", "len(before)": "1" } },
            { line: 5, note: "b сохраняет обе задачи в тот же файл. Ранее полученный before сам не обновляется.", vars: { "len(before)": "1" } },
            { line: 7, note: "Новый вызов a.load читает уже сохранённый файл. Вывод: 1 2.", vars: { "len(after)": "2" } },
          ]}
        />
        <p>
          <code>before</code> не меняется после записи файла: это отдельный список в памяти. Повторный <code>load()</code> читает новое состояние. Одной загрузки на команду достаточно.
        </p>
        <MethodGrid
          rows={[
            ["list / find / search / stats", "Один load; данных не меняем, save не вызываем."],
            ["add / первый done", "load, проверка, новое изменение и один save."],
            ["неверный id / повторный done", "Нового изменения нет, save не вызываем."],
          ]}
        />
        <p>
          Рассмотрим <code>done</code>: файл записывается лишь при изменении статуса.
        </p>
        <CodeBlock
          caption="фрагмент изменяющей операции после получения актуального списка"
          code={
            "tasks = storage.load()\n" +
            "task = get_task(tasks, task_id)  # неизвестный id сохраняет прежнюю ошибку\n" +
            "if not task.is_done:\n" +
            "    task.mark_done()\n" +
            "    storage.save(tasks)\n" +
            "return True"
          }
        />
        <p>
          <code>get_task</code> по-прежнему выдаёт <code>TaskNotFoundError</code> для неизвестного id. При <code>is_done == True</code> повторная команда не пишет файл. Иначе сохраняется весь список.
        </p>
        <BugHunt
          code={
            "def list_tasks(storage):\n" +
            "    tasks = storage.load()\n" +
            "    storage.save(tasks)\n" +
            "    return tasks"
          }
          question="Какой вызов лишний в операции чтения?"
          options={[
            "storage.load(), потому что список уже задан конструктору",
            "storage.save(tasks), потому что просмотр не изменяет снимок",
            "return tasks, потому что метод обязан менять файл",
          ]}
          correctIndex={1}
          explanation="Мы сохраняем только после реального изменения. Лишний save может перезаписать файл на чтении и породить ненужную ошибку записи."
          fix={"def list_tasks(storage):\n    return storage.load()"}
        />
        <p>
          Соберите порядок шагов <code>done</code>, оставив сохранение внутри условия.
        </p>
        <CodeSequence
          title="Один путь для завершения задачи"
          prompt="Соберём порядок, который сохраняет только новый переход в done."
          pieces={[
            { id: "load", code: "tasks = storage.load()", note: "Берём актуальный список." },
            { id: "find", code: "task = get_task(tasks, task_id)", note: "Сохраняем договор неизвестного id." },
            { id: "check", code: "if not task.is_done:", note: "Проверяем, будет ли изменение." },
            { id: "change", code: "    task.mark_done()", note: "Меняем одну Task." },
            { id: "save", code: "    storage.save(tasks)", note: "Записываем только новый переход." },
          ]}
          correctOrder={["load", "find", "check", "change", "save"]}
          explanation="Мы сначала загружаем и находим задачу, затем проверяем её старый статус. Повторное завершение не вызывает запись."
          incorrectExplanation="Мы сначала читаем актуальный список и находим задачу. Затем проверяем прежний статус, меняем его и сохраняем только новый переход."
        />
        <p>
          Когда обработчики переведены, удаляем список CLI и <code>on_change</code>. Иначе останется двойная запись через callback. CLI сообщает об успехе лишь после успешного завершения операции.
        </p>
      </Section>

      <Section number="05" title="Сохранить прежние ограничения файла">
        <Lead>
          Новый класс организует вызовы, но не делает файловую запись безопасной от любого сбоя. Режим <code>w</code> может оставить файл частично записанным; изменённый объект в памяти сам не возвращается в прежнее состояние.
        </Lead>
        <p>
          Отсутствующий файл даёт <code>[]</code>. Неверный JSON или структура существующего файла вызывают <code>StorageError</code>. Ошибка записи тоже доходит до CLI: об успехе сообщаем после <code>save()</code>.
        </p>
        <QuizCard
          question="Файл probe.json существует, но содержит только символ {. Что должен сделать load()?"
          options={[
            "Вернуть [], потому что задачи ещё не найдены",
            "Сообщить StorageError с причиной ошибки JSON",
            "Сразу перезаписать файл пустым списком",
          ]}
          correctIndex={1}
          explanation="Отсутствие файла и повреждённый файл различаются. Повреждение нельзя скрывать пустым списком, иначе следующее сохранение уничтожит данные."
        />
        <p>
          На отдельном <code>probe.json</code> сравним байты до и после просмотра, неизвестного id и повторного done: они совпадают. Повреждённый JSON проверим на другой копии. Два экземпляра доказывают повторное чтение, но не защищают от одновременной записи.
        </p>
        <Callout tone="info">
          Сохраняем прежние ошибки операций и причины StorageError. Проверка снимка и кодирование JSON завершаются до открытия файла на запись.
        </Callout>
      </Section>

      <Section number="06" title="Что мы будем делать в практике">
        <Lead>
          В практике продолжим тот же Planner после подтверждения результата предыдущего шага. Перенесём существующий файловый договор, затем переключим на него действия, не вводя новую прикладную архитектуру.
        </Lead>
        <LinkedNotes
          variant="connected"
          items={[
            {
              title: "Перенесём хранение",
              description: "JsonStorage получит выбранный Path и методы load/save с прежними преобразованиями, полной проверкой и StorageError.",
            },
            {
              title: "Передадим зависимость",
              description: "Операции будут загружать актуальные Task через один переданный экземпляр, а CLI перестанет держать постоянный список.",
            },
            {
              title: "Ограничим запись",
              description: "Save будет вызываться после успешного нового изменения; чтение, ошибка и повторный done не будут переписывать JSON.",
            },
            {
              title: "Проверим регрессию",
              description: "Прежние команды, перезапуск и новый экземпляр с тем же путём подтвердят, что данные и ошибки сохранили смысл.",
            },
          ]}
        />
        <p>
          Сначала убедимся, что подготовленный <code>Task</code> и функциональное хранение действительно существуют в рабочем проекте; если состояние отличается, отдельно назовём недостающую опору, не приписывая её ученику. Затем проследим один путь операции и применим его к остальным потребителям. Проверку проведём на выбранной копии файла, сравним снимок до и после читающих и ошибочных команд и повторно запустим прежний сценарий.
        </p>
        <p>
          Готовый результат этого шага: работающий Planner с одним объектом JsonStorage, выбранным путём и актуальным чтением на каждую команду. Успешное изменение сохраняет снимок, а просмотр, ошибка и повторный done оставляют файл прежним.
        </p>
      </Section>
    </RichLesson>
  );
}
