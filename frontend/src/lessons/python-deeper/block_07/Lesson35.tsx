import {
  Braces,
  Save,
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

// 35. JSON: сериализация и десериализация
export function Lesson35({ module }: { module?: string }) {
  return (
    <RichLesson>
      <RichHero
        variant="project"
        chip={module ?? "Блок 7 · Файлы, JSON и объектная модель"}
        title="JSON: сериализация и десериализация"
        intro="Переведём задачи StudyHub между объектами Python и текстовым форматом JSON: разберём dumps/loads и dump/load, допустимые типы, читаемую запись UTF-8, проверку структуры и восстановление после повреждённого файла."
        tags={[
          { icon: <Braces size={14} />, label: "Python ↔ JSON" },
          { icon: <Save size={14} />, label: "сохранение состояния" },
        ]}
      />
      <TheoryBridge link={"Файл умеет хранить текст, а JSON становится договором между памятью и диском: сериализация переводит данные в текст, чтение возвращает их назад."} boundary={"Корректный JSON ещё не гарантирует корректную задачу: обязательные поля и типы всё равно проверяются моделью."} />

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
