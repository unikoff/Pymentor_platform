import {
  FileText,
  HardDrive,
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
  TerminalDemo,
  TrueFalse,
  TypeCard,
  TypeCards,
  TheoryBridge,
} from "../../shared";

// 34. Файлы, pathlib, with и кодировка
export function Lesson34({ module }: { module?: string }) {
  return (
    <RichLesson>
      <RichHero
        variant="project"
        chip={module ?? "Блок 7 · Файлы, JSON и объектная модель"}
        title="34. Файлы, pathlib, with и кодировка"
        intro="Научим Persistent Planner работать с диском: построим путь через pathlib, прочитаем и запишем текст в UTF-8, разберём режимы открытия и гарантированно закроем файл через контекстный менеджер with."
        tags={[
          { icon: <HardDrive size={14} />, label: "путь и файловая система" },
          { icon: <FileText size={14} />, label: "чтение · запись · UTF-8" },
        ]}
      />
      <TheoryBridge link={"Пока задачи живут только в памяти; файловый слой учит их переживать завершение программы через Path, with и явную UTF-8 кодировку."} boundary={"Относительный путь зависит от рабочей папки, а режим w полностью заменяет содержимое файла."} />

      <Section number="00" title="От списка в памяти к данным на диске">
        <Lead>
          В предыдущей работе storage был границей на будущее. Теперь дадим ему первое настоящее поведение:
          сохраним список заголовков в текстовый файл и прочитаем его после завершения процесса.
        </Lead>

        <TypeCards>
          <TypeCard badge="RAM" title="Память">
            Список доступен, пока работает процесс Python, и исчезает после его завершения.
          </TypeCard>
          <TypeCard badge="disk" title="Файл">
            Содержимое остаётся на диске и может быть прочитано следующим запуском.
          </TypeCard>
          <TypeCard badge="API" title="Граница">
            storage переводит список в текст и обратно, а остальные слои не управляют файлом напрямую.
          </TypeCard>
        </TypeCards>

        <CodeBlock
          caption="путь данных"
          code={'список Python\n    ↓ запись\nтекстовый файл\n    ↓ чтение\nсписок Python'}
        />

        <Callout tone="info">
          Файл не является вторым списком Python. Между объектом в памяти и байтами на диске всегда есть договор о
          формате, пути и кодировке.
        </Callout>

        <RecallCard
          question="Что не доказывает один успешный запуск add?"
          hint="Подумайте о перезапуске, другой рабочей папке и русских символах."
          answer={
            <p>
              Он не доказывает persistence, устойчивый путь и корректную кодировку. Для этого нужны отдельная запись,
              чтение и проверки после нового запуска.
            </p>
          }
        />
      </Section>

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

      <Section number="03" title="Path: объект с операциями над путём">
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

      <Section number="08" title="Что мы будем делать в практике">
        <Lead>
          Практика собирает только первый текстовый storage. JSON, полноценные Task и новая бизнес-логика появятся
          позже. Сейчас нужно доказать, что путь, запись, чтение и запуск образуют один понятный договор.
        </Lead>

        <TypeCards>
          <TypeCard badge="1" title="Путь">
            Собрать DATA_FILE от расположения storage.py через Path, а не от случайной папки терминала.
          </TypeCard>
          <TypeCard badge="2" title="Запись">
            Создать data и записать заголовки по одному на строку через with и UTF-8.
          </TypeCard>
          <TypeCard badge="3" title="Чтение">
            Вернуть пустой список на первом запуске и непустые строки из существующего файла.
          </TypeCard>
          <TypeCard badge="4" title="Round trip">
            Сохранить три заголовка, прочитать их и сравнить точный список через assert.
          </TypeCard>
          <TypeCard badge="5" title="Режимы">
            Объяснить разницу r, w и a и связать её с намерением каждой функции.
          </TypeCard>
          <TypeCard badge="6" title="Две папки">
            Отделить поиск пакета от cwd и доказать, что DATA_FILE остаётся одним и тем же.
          </TypeCard>
        </TypeCards>

        <CodeSequence
          title="Финальная проверка пути"
          prompt="Что нужно сделать после смены рабочей папки?"
          pieces={[
            { id: "import", code: "сделать пакет studyhub доступным Python" },
            { id: "print", code: "вывести DATA_FILE.resolve()" },
            { id: "change", code: "сменить cwd и повторить вывод" },
            { id: "compare", code: "сравнить два абсолютных пути" },
          ]}
          correctOrder={["import", "print", "change", "compare"]}
          explanation="Сначала отделяем проблему импорта от проблемы пути. Затем сравниваем абсолютный адрес файла при двух cwd."
        />

        <Callout tone="info">
          Если из project-parent появляется ModuleNotFoundError, это проблема поиска пакета. Временно задайте
          PYTHONPATH равным project, повторите импорт и только потом проверяйте DATA_FILE.
        </Callout>

        <PracticeCta text="Соберите storage.py с устойчивым DATA_FILE, записью и чтением UTF-8, затем докажите round trip и одинаковый путь из разных рабочих каталогов." />
      </Section>

      <Section number="09" title="Самопроверка перед практикой">
        <Lead>
          Перед практикой проверьте, можете ли вы объяснить не только синтаксис, но и причину каждого решения.
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

      </Section>
    </RichLesson>
  );
}

// 35. JSON: сериализация и десериализация
