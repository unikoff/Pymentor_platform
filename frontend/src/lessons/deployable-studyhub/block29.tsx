import {
  CheckCircle2,
  FileText,
  FolderGit2,
  KeyRound,
  Layers,
  ListChecks,
  Play,
  Search,
  ShieldCheck,
  Terminal,
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
  StepThrough,
  TerminalDemo,
  TrueFalse,
  TypeCard,
  TypeCards,
} from "../shared";

type LessonProps = { module?: string };
const BLOCK_TITLE = "Блок 29 · Linux, процессы, окружения и логи";


export function Lesson165({ module }: LessonProps) {
  return (
    <RichLesson>
      <RichHero
        variant="project"
        chip={module ?? BLOCK_TITLE}
        title={"Linux-путь проекта и базовая навигация"}
        intro={"Перенесём привычный запуск StudyHub в Linux-подобную среду: найдём проект, различим абсолютный и относительный путь, проверим текущую рабочую директорию и научимся безопасно читать и перемещать файлы из терминала."}
        tags={[
          { icon: <FolderGit2 size={14} />, label: "cwd и структура проекта" },
          { icon: <Terminal size={14} />, label: "команды без IDE" },
        ]}
      />
      <Callout tone="info">
        <strong>Связь с курсом.</strong> {"Async StudyHub уже работает, но до Docker важно увидеть среду процесса без оболочки IDE: какой каталог выбран, где лежит код и откуда вычисляются относительные пути."}{" "}
        <strong>Важно не перепутать:</strong> {"Терминал не заменяет файловую систему и Python. Он лишь выполняет команды из конкретной текущей директории."}
      </Callout>

      <Section number={"01"} title={"Зачем backend-разработчику видеть cwd"}>
        <Lead>
          {"IDE часто незаметно выбирает рабочую папку. В Linux-подобной среде процесс стартует из того каталога, который указал человек или система запуска, поэтому один и тот же относительный путь может вести в разные места."}
        </Lead>

        <div className="lesson-practice-steps">
          <h3>{"Проблема"}</h3>
          <p>{"Запуск из неверной папки меняет смысл относительных путей."}</p>
          <h3>{"Главная модель"}</h3>
          <p>{"cwd — точка отсчёта процесса, а не расположение открытого файла."}</p>
          <h3>{"Результат"}</h3>
          <p>{"Перед запуском ученик умеет доказать, где находится."}</p>
        </div>

        <CodeBlock
          caption={"минимальная модель или команда"}
          code={"project file: /srv/studyhub/app/main.py\nprocess cwd: /srv/studyhub\nrelative path: ./alembic.ini\nresolved path: /srv/studyhub/alembic.ini"}
        />

        <TypeCards>
          <TypeCard badge={"file"} title={"Файл проекта"} code={"app/main.py"}>
            {"Хранит исходный код и не запускается сам."}
          </TypeCard>
          <TypeCard badge={"cwd"} badgeTone="float" title={"Рабочая директория"} code={"pwd"}>
            {"Определяет начало относительного пути."}
          </TypeCard>
          <TypeCard badge={"process"} badgeTone="str" title={"Команда запуска"} code={"python -m uvicorn app.main:app"}>
            {"Создаёт процесс из текущего каталога."}
          </TypeCard>
        </TypeCards>

        <Callout tone="info">
          {"Первый диагностический вопрос при ошибке пути: «из какой директории запущена команда?»."}
        </Callout>
      </Section>

      <Section number={"02"} title={"Корень, home и путь к проекту"}>
        <Lead>
          {"Корень файловой системы обозначается символом `/`, домашний каталог пользователя обычно открывается через `~`, а проект может лежать в отдельном каталоге вроде `/srv/studyhub` или `~/projects/studyhub`."}
        </Lead>

        <div className="lesson-practice-steps">
          <h3>{"Корень"}</h3>
          <p>{"`/` — верхняя точка дерева файловой системы."}</p>
          <h3>{"Домашний каталог"}</h3>
          <p>{"`~` раскрывается в home текущего пользователя."}</p>
          <h3>{"Проект"}</h3>
          <p>{"Путь проекта должен быть указан явно в runbook."}</p>
        </div>

        <CodeBlock
          caption={"минимальная модель или команда"}
          code={"/\n├── home/\n│   └── nikita/\n│       └── projects/studyhub/\n├── srv/\n│   └── studyhub/\n└── var/\n    └── log/"}
        />

        <MatchPairs
          prompt={"Соедините обозначение и его эксплуатационный смысл."}
          pairs={[
            { left: "/", right: "корень файловой системы" },
            { left: "~", right: "домашний каталог текущего пользователя" },
            { left: "./app", right: "каталог app относительно cwd" },
            { left: "../", right: "родитель текущего каталога" },
          ]}
          explanation={"Пары закрепляют не команду отдельно, а её место в диагностическом маршруте."}
        />

        <Callout tone="info">
          {"Символ `~` относится к пользователю, а `.` — к текущей рабочей директории. Это разные точки отсчёта."}
        </Callout>
      </Section>

      <Section number={"03"} title={"pwd, ls и cd: минимальный маршрут"}>
        <Lead>
          {"Три команды закрывают основной сценарий навигации: `pwd` отвечает «где я», `ls` показывает содержимое, `cd` меняет рабочую директорию. Перед любой опасной операцией полезно снова выполнить `pwd`."}
        </Lead>

        <div className="lesson-practice-steps">
          <h3>{"Сначала адрес"}</h3>
          <p>{"`pwd` фиксирует текущую директорию."}</p>
          <h3>{"Затем содержимое"}</h3>
          <p>{"`ls -la` показывает обычные и скрытые файлы."}</p>
          <h3>{"Потом переход"}</h3>
          <p>{"`cd` меняет cwd следующей команды."}</p>
        </div>

        <CodeBlock
          caption={"минимальная модель или команда"}
          code={"pwd\nls -la\ncd ~/projects/studyhub\npwd\nls -la"}
        />

        <TerminalDemo
          title={"находим StudyHub"}
          lines={[
            { cmd: "pwd" },
            { out: "/home/student" },
            { cmd: "ls -la" },
            { out: "projects  .bashrc  .profile" },
            { cmd: "cd projects/studyhub" },
            { cmd: "pwd" },
            { out: "/home/student/projects/studyhub" },
            { cmd: "ls" },
            { out: "app  alembic.ini  migrations  tests  README.md" },
          ]}
        />

        <Callout tone="info">
          {"Не начинайте с `rm`, `mv` или запуска migrations, пока `pwd` и `ls` не подтвердили ожидаемую папку."}
        </Callout>
      </Section>

      <Section number={"04"} title={"Абсолютный и относительный path"}>
        <Lead>
          {"Абсолютный путь начинается от `/` и не зависит от cwd. Относительный путь короче, но его результат меняется вместе с рабочей директорией. Для runbook важно явно указать, откуда выполняются команды."}
        </Lead>

        <div className="lesson-practice-steps">
          <h3>{"Абсолютный"}</h3>
          <p>{"Полный адрес от корня."}</p>
          <h3>{"Относительный"}</h3>
          <p>{"Маршрут от текущей директории."}</p>
          <h3>{"Контроль"}</h3>
          <p>{"Одинаковая команда проверяется из двух cwd."}</p>
        </div>

        <CodeBlock
          caption={"минимальная модель или команда"}
          code={"absolute: /home/student/projects/studyhub/app/main.py\nrelative: app/main.py\n\n# корректно только при cwd=/home/student/projects/studyhub\npython -m uvicorn app.main:app"}
        />

        <CompareSolutions
          question={"Какой вариант оставляет более ясную и воспроизводимую границу?"}
          left={{
            title: "Зависимость скрыта",
            code: "python app/main.py",
            note: "Работает только из ожидаемой папки.",
          }}
          right={{
            title: "Точка запуска зафиксирована",
            code: "cd /srv/studyhub && python -m uvicorn app.main:app",
            note: "Runbook явно задаёт cwd.",
          }}
          preferred="right"
          explanation={"Для воспроизводимого запуска место выполнения должно быть частью инструкции."}
        />

        <Callout tone="info">
          {"Абсолютный путь не всегда лучше, но он делает точку отсчёта очевидной. В репозитории чаще фиксируют команду `cd` и используют относительные пути."}
        </Callout>
      </Section>

      <Section number={"05"} title={"Безопасные операции с файлами"}>
        <Lead>
          {"Backend-разработчику достаточно небольшого набора операций: создать каталог, скопировать пример конфигурации, переименовать файл и удалить только явно выбранный временный артефакт. Для удаления полезен интерактивный флаг `-i`."}
        </Lead>

        <div className="lesson-practice-steps">
          <h3>{"Создание"}</h3>
          <p>{"`mkdir -p` создаёт цепочку каталогов без ошибки при повторе."}</p>
          <h3>{"Копирование"}</h3>
          <p>{"`cp` оставляет исходный файл."}</p>
          <h3>{"Удаление"}</h3>
          <p>{"`rm -i` просит подтвердить выбранный путь."}</p>
        </div>

        <CodeBlock
          caption={"минимальная модель или команда"}
          code={"mkdir -p docs/runbooks\ntouch docs/runbooks/linux.md\ncp .env.example .env.local\nmv notes.txt docs/notes.txt\nrm -i tmp/debug.log"}
        />

        <CodeSequence
          title={"Соберите безопасный порядок действий"}
          prompt={"Выберите только необходимые шаги и расположите их так, чтобы каждое предположение проверялось до изменения системы."}
          pieces={[
            { id: "check", code: "pwd" },
            { id: "list", code: "ls -la tmp" },
            { id: "remove", code: "rm -i tmp/debug.log" },
            { id: "verify", code: "ls -la tmp" },
            { id: "danger", code: "rm -rf /", note: "опасная лишняя команда" },
          ]}
          correctOrder={["check", "list", "remove", "verify"]}
          explanation={"Сначала подтверждается директория и выбранный файл, затем выполняется удаление и повторная проверка."}
        />

        <Callout tone="info">
          {"Команда `rm` не имеет корзины по умолчанию. В учебной среде удаляйте только заранее созданные временные файлы."}
        </Callout>
      </Section>

      <Section number={"06"} title={"Скрытые файлы и конфигурация"}>
        <Lead>
          {"Файлы, начинающиеся с точки, скрыты обычным `ls`, но не являются защищёнными. `.env`, `.gitignore` и `.env.example` имеют разные роли: секреты, правила Git и публичный шаблон конфигурации."}
        </Lead>

        <div className="lesson-practice-steps">
          <h3>{"Показать скрытые"}</h3>
          <p>{"`ls -la` делает dotfiles видимыми."}</p>
          <h3>{"Прочитать начало"}</h3>
          <p>{"`head` быстро проверяет структуру файла."}</p>
          <h3>{"Прочитать конец"}</h3>
          <p>{"`tail` показывает свежие строки лога."}</p>
        </div>

        <CodeBlock
          caption={"минимальная модель или команда"}
          code={"ls -la\ncat .env.example\nhead -n 20 README.md\ntail -n 30 logs/app.log"}
        />

        <TrueFalse
          statement={<>{"Если файл начинается с точки, Linux автоматически запрещает его чтение."}</>}
          isTrue={false}
          explanation={"Точка влияет на отображение в обычном `ls`, но доступ определяется правами файловой системы."}
        />

        <Callout tone="info">
          {"Не печатайте содержимое настоящего `.env` в общий терминал, запись экрана или CI-log. Для обучения используйте `.env.example`."}
        </Callout>
      </Section>

      <Section number={"07"} title={"Почему StudyHub не находится"}>
        <Lead>
          {"Ошибка импорта часто маскирует неверный cwd. Если команда запускается из `~/projects`, модуль `app` внутри `~/projects/studyhub` не находится как пакет верхнего уровня."}
        </Lead>

        <div className="lesson-practice-steps">
          <h3>{"Симптом"}</h3>
          <p>{"Uvicorn не может импортировать `app.main`."}</p>
          <h3>{"Проверка"}</h3>
          <p>{"`pwd` показывает родитель проекта."}</p>
          <h3>{"Исправление"}</h3>
          <p>{"Перейти в `studyhub` и повторить запуск."}</p>
        </div>

        <CodeBlock
          caption={"минимальная модель или команда"}
          code={"$ pwd\n/home/student/projects\n$ python -m uvicorn app.main:app\nERROR: Could not import module \"app\""}
        />

        <BugHunt
          code={"pwd\n# /home/student/projects\npython -m uvicorn app.main:app"}
          question={"Почему импорт app.main завершается ошибкой?"}
          options={[
            "Команда запущена не из корня репозитория",
            "Uvicorn не работает в Linux",
            "Папка app должна называться src всегда",
          ]}
          correctIndex={0}
          explanation={"Папка StudyHub не находится в текущем пути импорта."}
          fix={"cd /home/student/projects/studyhub\npython -m uvicorn app.main:app"}
        />

        <Callout tone="info">
          {"Сначала исправляется точка запуска. Добавление случайных путей в `PYTHONPATH` не должно скрывать ошибку структуры."}
        </Callout>
      </Section>

      <Section number={"08"} title={"Контрольная точка и проектный результат"}>
        <Lead>
          {"Завершите занятие не чтением, а воспроизводимой проверкой: выполните основной сценарий, намеренно создайте ожидаемый сбой, устраните его по наблюдаемым данным и зафиксируйте процедуру в Linux-runbook."}
        </Lead>

        <div className="lesson-check-group">
          <QuizCard
            question={"Что задаёт точку отсчёта относительного пути?"}
            options={[
              "cwd процесса",
              "имя файла",
              "Git branch",
            ]}
            correctIndex={0}
            explanation={"Правильный ответ следует из модели урока и проверяется конкретной командой, состоянием процесса или HTTP-result."}
          />
          <QuizCard
            question={"Какая команда показывает текущую директорию?"}
            options={[
              "pwd",
              "ps",
              "curl",
            ]}
            correctIndex={0}
            explanation={"Правильный ответ следует из модели урока и проверяется конкретной командой, состоянием процесса или HTTP-result."}
          />
          <QuizCard
            question={"Что показывает скрытые файлы?"}
            options={[
              "ls -la",
              "ls без флагов всегда",
              "python -V",
            ]}
            correctIndex={0}
            explanation={"Правильный ответ следует из модели урока и проверяется конкретной командой, состоянием процесса или HTTP-result."}
          />
          <QuizCard
            question={"Как безопаснее начать удаление учебного файла?"}
            options={[
              "проверить pwd и использовать rm -i",
              "сразу rm -rf",
              "открыть другой терминал",
            ]}
            correctIndex={0}
            explanation={"Правильный ответ следует из модели урока и проверяется конкретной командой, состоянием процесса или HTTP-result."}
          />
        </div>

        <MethodGrid
          rows={[
            [<>Команда</>, "может быть скопирована и выполнена без догадки"],
            [<>Ожидаемый результат</>, "показывает, как выглядит успешное состояние"],
            [<>Ошибочный сценарий</>, "воспроизводится безопасно и имеет наблюдаемый симптом"],
            [<>Исправление</>, "устраняет причину и заканчивается повторной проверкой"],
          ]}
        />

        <div className="execution-example">
          <CodeBlock
            caption={"проверка project root"}
            code={"pwd\ntest -f app/main.py && echo project-root-ok"}
          />
          <TerminalDemo
            title={"контрольный прогон"}
            lines={[
              { cmd: "pwd" },
              { out: "/srv/studyhub" },
              { cmd: "test -f app/main.py && echo project-root-ok" },
              { out: "project-root-ok" },
            ]}
          />
        </div>

        <RecallCard
          question={"Какой наблюдаемый факт доказывает, что основной сценарий этого занятия выполнен корректно?"}
          hint={"Назовите команду, ожидаемый output и отличие от ошибочного состояния."}
          answer={<p>{"Готовность подтверждается не отсутствием ошибок на глаз, а конкретной командой и ожидаемым результатом, записанными в runbook."}</p>}
        />

        <KeyTakeaways
          points={[
            <>{"cwd определяет смысл относительных путей."}</>,
            <>{"`pwd`, `ls -la` и `cd` образуют базовый маршрут."}</>,
            <>{"Абсолютный путь начинается от корня `/`."}</>,
            <>{"`~` и `.` обозначают разные точки."}</>,
            <>{"Скрытый файл не является защищённым."}</>,
            <>{"Удаление начинается с проверки выбранного каталога."}</>,
            <>{"Runbook фиксирует директорию запуска."}</>,
          ]}
        />

        <div className="lesson-practice-steps">
          <h3>{"Артефакт"}</h3>
          <p>{"Обновлён `docs/runbook-linux.md` и сохранён проверяемый результат занятия."}</p>
          <h3>{"Проверка сбоя"}</h3>
          <p>{"Есть минимум один намеренно созданный ошибочный сценарий и объяснение причины по наблюдаемым данным."}</p>
          <h3>{"Git"}</h3>
          <p>{"Изменение оформлено отдельным commit с узким техническим смыслом."}</p>
        </div>

        <PracticeCta text={"Создайте раздел `Путь проекта` в `docs/runbook-linux.md`: укажите команду перехода в репозиторий, ожидаемый вывод `pwd`, четыре обязательных файла и безопасную проверку запуска."} />
      </Section>

    </RichLesson>
  );
}

export function Lesson166({ module }: LessonProps) {
  return (
    <RichLesson>
      <RichHero
        variant="project"
        chip={module ?? BLOCK_TITLE}
        title={"Процессы, PID, порты и сигналы"}
        intro={"Посмотрим на Uvicorn как на долгоживущий процесс: запустим сервер, найдём его PID, проверим слушающий порт, воспроизведём конфликт адреса и завершим приложение штатным сигналом."}
        tags={[
          { icon: <Play size={14} />, label: "program → process → PID" },
          { icon: <Search size={14} />, label: "порт и диагностика" },
        ]}
      />
      <Callout tone="info">
        <strong>Связь с курсом.</strong> {"После уверенной навигации команда запуска перестаёт быть строкой в IDE: операционная система создаёт процесс с PID, окружением и открытым сокетом."}{" "}
        <strong>Важно не перепутать:</strong> {"Процесс и файл программы — не одно и то же. Один файл может запускаться несколько раз, но два процесса не могут одновременно занять один host:port."}
      </Callout>

      <Section number={"01"} title={"Программа на диске и процесс в памяти"}>
        <Lead>
          {"Файл Uvicorn или модуль StudyHub — это программа. После запуска операционная система создаёт процесс: живой экземпляр с PID, состоянием, окружением и открытыми ресурсами."}
        </Lead>

        <div className="lesson-practice-steps">
          <h3>{"Program"}</h3>
          <p>{"Код и исполняемые файлы на диске."}</p>
          <h3>{"Process"}</h3>
          <p>{"Конкретный запущенный экземпляр."}</p>
          <h3>{"PID"}</h3>
          <p>{"Числовой идентификатор процесса в ОС."}</p>
        </div>

        <CodeBlock
          caption={"минимальная модель или команда"}
          code={"program: python + uvicorn + app.main\ncommand: python -m uvicorn app.main:app --port 8000\nprocess: PID 4127\nresource: TCP 127.0.0.1:8000"}
        />

        <TypeCards>
          <TypeCard badge={"program"} title={"Программа"} code={"app/main.py"}>
            {"Может лежать на диске без выполнения."}
          </TypeCard>
          <TypeCard badge={"process"} badgeTone="float" title={"Процесс"} code={"PID=4127"}>
            {"Существует во время выполнения."}
          </TypeCard>
          <TypeCard badge={"socket"} badgeTone="str" title={"Слушающий адрес"} code={"127.0.0.1:8000"}>
            {"Принимает сетевые подключения."}
          </TypeCard>
        </TypeCards>

        <Callout tone="info">
          {"Перезапуск создаёт новый процесс и обычно новый PID, даже если команда и код не изменились."}
        </Callout>
      </Section>

      <Section number={"02"} title={"Foreground и управляемый запуск"}>
        <Lead>
          {"При запуске в foreground сервер занимает текущий терминал и пишет туда логи. Это удобно для обучения: Ctrl+C отправляет сигнал прерывания, а завершение видно сразу."}
        </Lead>

        <div className="lesson-practice-steps">
          <h3>{"Запуск"}</h3>
          <p>{"Команда создаёт Uvicorn-процесс."}</p>
          <h3>{"Наблюдение"}</h3>
          <p>{"Терминал показывает startup и request logs."}</p>
          <h3>{"Остановка"}</h3>
          <p>{"Ctrl+C инициирует штатное завершение."}</p>
        </div>

        <CodeBlock
          caption={"минимальная модель или команда"}
          code={"python -m uvicorn app.main:app --host 127.0.0.1 --port 8000"}
        />

        <TerminalDemo
          title={"foreground-сервер"}
          lines={[
            { cmd: "python -m uvicorn app.main:app --host 127.0.0.1 --port 8000" },
            { out: "INFO: Started server process [4127]" },
            { out: "INFO: Application startup complete." },
            { out: "INFO: Uvicorn running on http://127.0.0.1:8000" },
            { cmd: "Ctrl+C" },
            { out: "INFO: Shutting down" },
            { out: "INFO: Application shutdown complete." },
          ]}
        />

        <Callout tone="info">
          {"Фоновый запуск нужен позже для эксплуатации. Сначала важно увидеть полный lifecycle в одном терминале."}
        </Callout>
      </Section>

      <Section number={"03"} title={"Как найти PID процесса"}>
        <Lead>
          {"Команда `ps` показывает процессы. Фильтр по строке `uvicorn` сокращает вывод, а шаблон `[u]vicorn` не захватывает сам процесс `grep`."}
        </Lead>

        <div className="lesson-practice-steps">
          <h3>{"Список"}</h3>
          <p>{"`ps -ef` показывает процессы системы."}</p>
          <h3>{"Фильтр"}</h3>
          <p>{"`grep` оставляет строки Uvicorn."}</p>
          <h3>{"Идентификатор"}</h3>
          <p>{"PID используется для адресного сигнала."}</p>
        </div>

        <CodeBlock
          caption={"минимальная модель или команда"}
          code={"ps -ef | grep '[u]vicorn'\n# student  4127  ... python -m uvicorn app.main:app --port 8000"}
        />

        <FillBlank
          prompt={"Заполните команду поиска Uvicorn-процесса."}
          before={"ps -ef | "}
          after={""}
          options={["grep '[u]vicorn'", "pwd", "curl"]}
          answer={"grep '[u]vicorn'"}
          explanation={"Фильтр оставляет только строку процесса Uvicorn."}
        />

        <Callout tone="info">
          {"Не завершайте процесс по случайному PID из старого скриншота. Сначала найдите актуальный экземпляр и сверьте команду."}
        </Callout>
      </Section>

      <Section number={"04"} title={"Host и port как сетевой адрес процесса"}>
        <Lead>
          {"Host определяет интерфейс, на котором сервер принимает соединения, а port выбирает номер точки входа. Для локальной проверки используется `127.0.0.1`; `0.0.0.0` означает слушать все доступные интерфейсы процесса."}
        </Lead>

        <div className="lesson-practice-steps">
          <h3>{"Host"}</h3>
          <p>{"Адрес сетевого интерфейса."}</p>
          <h3>{"Port"}</h3>
          <p>{"Номер точки входа процесса."}</p>
          <h3>{"URL"}</h3>
          <p>{"Клиент соединяет схему, host и port."}</p>
        </div>

        <CodeBlock
          caption={"минимальная модель или команда"}
          code={"127.0.0.1:8000 → локальный адрес\n0.0.0.0:8000   → слушать все интерфейсы\nclient → TCP connection → Uvicorn process"}
        />

        <MatchPairs
          prompt={"Соедините обозначение и его эксплуатационный смысл."}
          pairs={[
            { left: "127.0.0.1", right: "локальный loopback" },
            { left: "0.0.0.0", right: "слушать все интерфейсы" },
            { left: "8000", right: "номер порта" },
            { left: "http://127.0.0.1:8000", right: "адрес клиента" },
          ]}
          explanation={"Пары закрепляют не команду отдельно, а её место в диагностическом маршруте."}
        />

        <Callout tone="info">
          {"`0.0.0.0` используется для bind сервера, но клиент обычно обращается к конкретному адресу, например `127.0.0.1` или имени хоста."}
        </Callout>
      </Section>

      <Section number={"05"} title={"Проверка слушающего порта"}>
        <Lead>
          {"Сервер может существовать как процесс, но не слушать ожидаемый порт. Команда `ss -ltnp` показывает TCP-sockets в состоянии listen; затем `curl` проверяет HTTP-ответ."}
        </Lead>

        <div className="lesson-practice-steps">
          <h3>{"Процесс"}</h3>
          <p>{"Проверить, существует ли PID."}</p>
          <h3>{"Socket"}</h3>
          <p>{"Проверить, слушает ли процесс 8000."}</p>
          <h3>{"HTTP"}</h3>
          <p>{"Проверить ответ конкретного endpoint."}</p>
        </div>

        <CodeBlock
          caption={"минимальная модель или команда"}
          code={"ss -ltnp | grep ':8000'\ncurl -i http://127.0.0.1:8000/health"}
        />

        <StepThrough
          code={"process → socket → HTTP"}
          steps={[
            { line: 0, note: "Есть ли Uvicorn-процесс?", vars: {"process": "running"} },
            { line: 1, note: "Какой PID слушает 8000?", vars: {"port": "8000", "pid": "4127"} },
            { line: 2, note: "Отвечает ли приложение по HTTP?", vars: {"status": "200"} },
          ]}
        />

        <Callout tone="info">
          {"Один `curl` не заменяет диагностику процесса: connection refused и HTTP 500 указывают на разные уровни проблемы."}
        </Callout>
      </Section>

      <Section number={"06"} title={"Почему второй сервер не запускается"}>
        <Lead>
          {"Операционная система не разрешает двум процессам одновременно слушать один и тот же адрес и порт. Второй Uvicorn завершится с ошибкой address already in use."}
        </Lead>

        <div className="lesson-practice-steps">
          <h3>{"Свободно"}</h3>
          <p>{"Процесс успешно bind к порту."}</p>
          <h3>{"Занято"}</h3>
          <p>{"Второй bind отклоняется."}</p>
          <h3>{"Решение"}</h3>
          <p>{"Остановить старый процесс или выбрать другой порт."}</p>
        </div>

        <CodeBlock
          caption={"минимальная модель или команда"}
          code={"first process  → 127.0.0.1:8000 ✓\nsecond process → 127.0.0.1:8000 ✗ address already in use\nsecond process → 127.0.0.1:8001 ✓"}
        />

        <BranchExplorer
          code={"if port_is_free:\n    start_server()\nelif old_process_is_expected:\n    stop_old_process()\nelse:\n    choose_another_port()"}
          scenarios={[
            { label: "порт 8000 свободен", activeLine: 1, output: "сервер запускается" },
            { label: "старый StudyHub занимает 8000", activeLine: 3, output: "остановить ожидаемый старый PID" },
            { label: "чужой процесс занимает 8000", activeLine: 5, output: "не завершать вслепую; выбрать порт или выяснить владельца" },
          ]}
        />

        <Callout tone="info">
          {"Не используйте `kill -9` как первую реакцию на занятый порт. Сначала определите владельца socket."}
        </Callout>
      </Section>

      <Section number={"07"} title={"SIGINT, SIGTERM и принудительное завершение"}>
        <Lead>
          {"SIGINT обычно приходит от Ctrl+C, SIGTERM просит процесс завершиться штатно, а SIGKILL немедленно прекращает его без возможности выполнить cleanup. Для сервера предпочтителен управляемый shutdown."}
        </Lead>

        <div className="lesson-practice-steps">
          <h3>{"SIGINT"}</h3>
          <p>{"Интерактивное прерывание из терминала."}</p>
          <h3>{"SIGTERM"}</h3>
          <p>{"Стандартный запрос штатного завершения."}</p>
          <h3>{"SIGKILL"}</h3>
          <p>{"Последняя мера без cleanup."}</p>
        </div>

        <CodeBlock
          caption={"минимальная модель или команда"}
          code={"kill -TERM 4127\n# процесс получает запрос завершиться\n\nkill -KILL 4127\n# немедленное прекращение без cleanup"}
        />

        <CompareSolutions
          question={"Какой вариант оставляет более ясную и воспроизводимую границу?"}
          left={{
            title: "Штатное завершение",
            code: "kill -TERM \"$PID\"",
            note: "Приложение получает возможность закрыть ресурсы.",
          }}
          right={{
            title: "Принудительное",
            code: "kill -KILL \"$PID\"",
            note: "ОС прекращает процесс немедленно.",
          }}
          preferred="left"
          explanation={"Для обычного restart сначала используется SIGTERM; SIGKILL нужен только если процесс не реагирует."}
        />

        <Callout tone="info">
          {"Сигнал не гарантирует успешный cleanup сам по себе: приложение и сервер должны корректно обрабатывать lifecycle."}
        </Callout>
      </Section>

      <Section number={"08"} title={"Контрольная точка и проектный результат"}>
        <Lead>
          {"Завершите занятие не чтением, а воспроизводимой проверкой: выполните основной сценарий, намеренно создайте ожидаемый сбой, устраните его по наблюдаемым данным и зафиксируйте процедуру в Linux-runbook."}
        </Lead>

        <div className="lesson-check-group">
          <QuizCard
            question={"Что идентифицирует конкретный запущенный процесс?"}
            options={[
              "PID",
              "имя файла",
              "Git tag",
            ]}
            correctIndex={0}
            explanation={"Правильный ответ следует из модели урока и проверяется конкретной командой, состоянием процесса или HTTP-result."}
          />
          <QuizCard
            question={"Почему второй сервер не занимает 8000?"}
            options={[
              "порт уже слушает другой процесс",
              "Python запрещает два терминала",
              "curl заблокировал порт",
            ]}
            correctIndex={0}
            explanation={"Правильный ответ следует из модели урока и проверяется конкретной командой, состоянием процесса или HTTP-result."}
          />
          <QuizCard
            question={"Чем проверить слушающий TCP-port?"}
            options={[
              "ss -ltnp",
              "pwd",
              "cat README",
            ]}
            correctIndex={0}
            explanation={"Правильный ответ следует из модели урока и проверяется конкретной командой, состоянием процесса или HTTP-result."}
          />
          <QuizCard
            question={"Какой сигнал предпочтителен для штатной остановки?"}
            options={[
              "SIGTERM",
              "SIGKILL всегда",
              "никакой",
            ]}
            correctIndex={0}
            explanation={"Правильный ответ следует из модели урока и проверяется конкретной командой, состоянием процесса или HTTP-result."}
          />
        </div>

        <MethodGrid
          rows={[
            [<>Команда</>, "может быть скопирована и выполнена без догадки"],
            [<>Ожидаемый результат</>, "показывает, как выглядит успешное состояние"],
            [<>Ошибочный сценарий</>, "воспроизводится безопасно и имеет наблюдаемый симптом"],
            [<>Исправление</>, "устраняет причину и заканчивается повторной проверкой"],
          ]}
        />

        <div className="execution-example">
          <CodeBlock
            caption={"process и socket"}
            code={"ps -ef | grep '[u]vicorn'\nss -ltnp | grep ':8000'"}
          />
          <TerminalDemo
            title={"контрольный прогон"}
            lines={[
              { cmd: "ps -ef | grep '[u]vicorn'" },
              { out: "student 4127 python -m uvicorn app.main:app --port 8000" },
              { cmd: "ss -ltnp | grep ':8000'" },
              { out: "LISTEN 0 2048 127.0.0.1:8000" },
            ]}
          />
        </div>

        <RecallCard
          question={"Какой наблюдаемый факт доказывает, что основной сценарий этого занятия выполнен корректно?"}
          hint={"Назовите команду, ожидаемый output и отличие от ошибочного состояния."}
          answer={<p>{"Готовность подтверждается не отсутствием ошибок на глаз, а конкретной командой и ожидаемым результатом, записанными в runbook."}</p>}
        />

        <KeyTakeaways
          points={[
            <>{"Программа и процесс — разные сущности."}</>,
            <>{"PID относится к конкретному запуску."}</>,
            <>{"Host и port образуют сетевую точку входа."}</>,
            <>{"`ps`, `ss` и `curl` проверяют разные уровни."}</>,
            <>{"Конфликт порта требует определить владельца."}</>,
            <>{"SIGTERM даёт шанс на cleanup."}</>,
            <>{"Foreground упрощает первый разбор lifecycle."}</>,
          ]}
        />

        <div className="lesson-practice-steps">
          <h3>{"Артефакт"}</h3>
          <p>{"Обновлён `docs/runbook-linux.md` и сохранён проверяемый результат занятия."}</p>
          <h3>{"Проверка сбоя"}</h3>
          <p>{"Есть минимум один намеренно созданный ошибочный сценарий и объяснение причины по наблюдаемым данным."}</p>
          <h3>{"Git"}</h3>
          <p>{"Изменение оформлено отдельным commit с узким техническим смыслом."}</p>
        </div>

        <PracticeCta text={"Добавьте в runbook раздел `Процесс и порт`: команду запуска, поиск PID, проверку `ss`, запрос `/health`, штатную остановку и сценарий конфликта порта."} />
      </Section>

    </RichLesson>
  );
}

export function Lesson167({ module }: LessonProps) {
  return (
    <RichLesson>
      <RichHero
        variant="project"
        chip={module ?? BLOCK_TITLE}
        title={"Environment variables и конфигурация окружений"}
        intro={"Вынесем изменяемую конфигурацию из Python-кода: увидим environment variable как часть окружения процесса, разделим development, test и production, подготовим `.env.example` и заставим StudyHub завершаться при отсутствии обязательного секрета."}
        tags={[
          { icon: <KeyRound size={14} />, label: "config вне кода" },
          { icon: <Layers size={14} />, label: "development · test · production" },
        ]}
      />
      <Callout tone="info">
        <strong>Связь с курсом.</strong> {"Процесс уже имеет PID и порт. Следующий вопрос — какие значения он получает при старте и почему один и тот же код должен работать в нескольких окружениях."}{" "}
        <strong>Важно не перепутать:</strong> {"Environment variable не является секретным хранилищем сама по себе. Она только доставляет значение процессу; способ безопасной передачи остаётся ответственностью окружения."}
      </Callout>

      <Section number={"01"} title={"Почему config не хранится рядом с логикой"}>
        <Lead>
          {"URL базы, уровень логов и секреты меняются между окружениями. Если они записаны в исходном коде, любое переключение требует правки файла, нового commit и риска случайно опубликовать значение."}
        </Lead>

        <div className="lesson-practice-steps">
          <h3>{"Код"}</h3>
          <p>{"Описывает неизменяемую логику чтения настроек."}</p>
          <h3>{"Окружение"}</h3>
          <p>{"Передаёт конкретные значения при запуске."}</p>
          <h3>{"Результат"}</h3>
          <p>{"Один commit работает в dev, test и production."}</p>
        </div>

        <CodeBlock
          caption={"минимальная модель или команда"}
          code={"# плохо: значение зашито в код\nDATABASE_URL = \"postgresql://local-only\"\nSECRET_KEY = \"real-secret\"\n\n# лучше: код читает внешний config"}
        />

        <CompareSolutions
          question={"Какой вариант оставляет более ясную и воспроизводимую границу?"}
          left={{
            title: "Секрет в репозитории",
            code: "SECRET_KEY = \"prod-secret\"",
            note: "Значение попадает в историю Git.",
          }}
          right={{
            title: "Секрет приходит извне",
            code: "SECRET_KEY = os.environ[\"SECRET_KEY\"]",
            note: "Код хранит только имя обязательной настройки.",
          }}
          preferred="right"
          explanation={"Конфигурация меняется без редактирования Python-файла, а настоящий секрет не коммитится."}
        />

        <Callout tone="info">
          {"Даже удалённый из последнего commit секрет может остаться в истории Git. Его нужно считать скомпрометированным и заменить."}
        </Callout>
      </Section>

      <Section number={"02"} title={"Environment variable принадлежит процессу"}>
        <Lead>
          {"Shell хранит набор переменных и передаёт их дочернему процессу. Python читает собственное окружение через `os.environ` или `os.getenv`."}
        </Lead>

        <div className="lesson-practice-steps">
          <h3>{"Shell"}</h3>
          <p>{"Получает переменную через `export`."}</p>
          <h3>{"Process"}</h3>
          <p>{"Наследует значение при старте."}</p>
          <h3>{"Python"}</h3>
          <p>{"Читает его из `os.environ`."}</p>
        </div>

        <CodeBlock
          caption={"минимальная модель или команда"}
          code={"export APP_ENV=development\nexport LOG_LEVEL=DEBUG\npython scripts/show_config.py"}
        />

        <StepThrough
          code={"shell → process → Settings"}
          steps={[
            { line: 0, note: "Shell сохраняет значение.", vars: {"APP_ENV": "development"} },
            { line: 1, note: "Новый процесс наследует environment.", vars: {"process_env": "development"} },
            { line: 2, note: "Код читает строку.", vars: {"settings.app_env": "development"} },
          ]}
        />

        <Callout tone="info">
          {"Изменение переменной в другом терминале не переписывает окружение уже запущенного процесса."}
        </Callout>
      </Section>

      <Section number={"03"} title={"export, printenv и одноразовая переменная"}>
        <Lead>
          {"`export NAME=value` действует для последующих команд текущей shell-сессии. Запись `NAME=value command` передаёт значение только одному запуску, что удобно для контролируемого эксперимента."}
        </Lead>

        <div className="lesson-practice-steps">
          <h3>{"Постоянно в shell"}</h3>
          <p>{"`export` влияет на следующие дочерние процессы."}</p>
          <h3>{"Один запуск"}</h3>
          <p>{"Префикс перед командой действует локально."}</p>
          <h3>{"Проверка"}</h3>
          <p>{"`printenv` показывает текущее значение shell."}</p>
        </div>

        <CodeBlock
          caption={"минимальная модель или команда"}
          code={"export APP_ENV=development\nprintenv APP_ENV\n\nAPP_ENV=test python scripts/show_config.py\nprintenv APP_ENV  # снова development"}
        />

        <TerminalDemo
          title={"два окружения без изменения кода"}
          lines={[
            { cmd: "APP_ENV=development python scripts/show_config.py" },
            { out: "app_env=development" },
            { cmd: "APP_ENV=test python scripts/show_config.py" },
            { out: "app_env=test" },
            { cmd: "git diff -- app" },
            { out: "нет изменений" },
          ]}
        />

        <Callout tone="info">
          {"Runbook должен показывать источник config, а не требовать ручной правки `settings.py` перед каждым запуском."}
        </Callout>
      </Section>

      <Section number={"04"} title={"Settings как единая граница"}>
        <Lead>
          {"Остальной код не должен читать environment хаотично в десятках файлов. Объект Settings собирает, нормализует и проверяет конфигурацию один раз при старте."}
        </Lead>

        <div className="lesson-practice-steps">
          <h3>{"Сбор"}</h3>
          <p>{"Один loader читает environment."}</p>
          <h3>{"Проверка"}</h3>
          <p>{"Обязательное значение не имеет скрытого fallback."}</p>
          <h3>{"Передача"}</h3>
          <p>{"Приложение использует готовый Settings."}</p>
        </div>

        <CodeBlock
          caption={"минимальная модель или команда"}
          code={"from dataclasses import dataclass\nimport os\n\n@dataclass(frozen=True)\nclass Settings:\n    app_env: str\n    database_url: str\n    log_level: str\n\ndef load_settings() -> Settings:\n    return Settings(\n        app_env=os.getenv(\"APP_ENV\", \"development\"),\n        database_url=os.environ[\"DATABASE_URL\"],\n        log_level=os.getenv(\"LOG_LEVEL\", \"INFO\"),\n    )"}
        />

        <MatchPairs
          prompt={"Соедините обозначение и его эксплуатационный смысл."}
          pairs={[
            { left: "APP_ENV", right: "выбор режима приложения" },
            { left: "DATABASE_URL", right: "адрес основной базы" },
            { left: "LOG_LEVEL", right: "минимальный уровень событий" },
            { left: "SECRET_KEY", right: "криптографический секрет приложения" },
          ]}
          explanation={"Пары закрепляют не команду отдельно, а её место в диагностическом маршруте."}
        />

        <Callout tone="info">
          {"Значение по умолчанию допустимо для безопасной локальной настройки, но не для обязательного production-секрета."}
        </Callout>
      </Section>

      <Section number={"05"} title={"Development, test и production"}>
        <Lead>
          {"Окружения используют один код, но разные ресурсы и уровень строгости. Test не должен случайно подключаться к production database, а production не должен стартовать с debug-секретом."}
        </Lead>

        <div className="lesson-practice-steps">
          <h3>{"Development"}</h3>
          <p>{"Быстрая локальная обратная связь."}</p>
          <h3>{"Test"}</h3>
          <p>{"Изоляция и воспроизводимость."}</p>
          <h3>{"Production"}</h3>
          <p>{"Безопасные внешние ресурсы и строгая конфигурация."}</p>
        </div>

        <CodeBlock
          caption={"минимальная модель или команда"}
          code={"development → local database, DEBUG logs\ntest        → isolated database, deterministic config\nproduction  → managed database, INFO logs, real secrets"}
        />

        <TypeCards>
          <TypeCard badge={"dev"} title={"Development"} code={"APP_ENV=development"}>
            {"Локальная база и подробные логи."}
          </TypeCard>
          <TypeCard badge={"test"} badgeTone="float" title={"Test"} code={"APP_ENV=test"}>
            {"Отдельная база и предсказуемые значения."}
          </TypeCard>
          <TypeCard badge={"prod"} badgeTone="str" title={"Production"} code={"APP_ENV=production"}>
            {"Нет локальных fallback для секретов."}
          </TypeCard>
        </TypeCards>

        <Callout tone="info">
          {"Название окружения не должно менять бизнес-правила. Оно выбирает инфраструктурные значения и режим диагностики."}
        </Callout>
      </Section>

      <Section number={"06"} title={".env, .env.example и Git"}>
        <Lead>
          {"`.env.example` документирует имена переменных и безопасные примеры. Настоящий `.env` содержит локальные значения и исключается из Git. Production-секреты не должны храниться в репозитории."}
        </Lead>

        <div className="lesson-practice-steps">
          <h3>{"Шаблон"}</h3>
          <p>{"Коммитится и объясняет обязательные имена."}</p>
          <h3>{"Локальный файл"}</h3>
          <p>{"Не коммитится и содержит значения разработчика."}</p>
          <h3>{"Production"}</h3>
          <p>{"Получает секреты из среды развертывания."}</p>
        </div>

        <CodeBlock
          caption={"минимальная модель или команда"}
          code={"# .env.example\nAPP_ENV=development\nDATABASE_URL=postgresql://user:password@localhost/studyhub\nLOG_LEVEL=INFO\nSECRET_KEY=replace-me\n\n# .gitignore\n.env\n.env.*\n!.env.example"}
        />

        <BugHunt
          code={"# .env\nSECRET_KEY=prod-real-secret\n\n$ git add .env\n$ git commit -m \"add config\""}
          question={"В чём главная проблема?"}
          options={[
            "Настоящий секрет попадает в историю репозитория",
            "Файл должен называться settings.py",
            "Git не поддерживает текст",
          ]}
          correctIndex={0}
          explanation={"Секрет необходимо удалить из истории по процедуре и немедленно ротировать."}
          fix={"# .gitignore\n.env\n.env.*\n!.env.example\n\n# commit only .env.example"}
        />

        <Callout tone="info">
          {"`.gitignore` предотвращает новый commit, но не удаляет файл, который уже отслеживается Git."}
        </Callout>
      </Section>

      <Section number={"07"} title={"Fail fast при отсутствующей конфигурации"}>
        <Lead>
          {"Если `DATABASE_URL` или `SECRET_KEY` обязательны, приложение должно остановиться при старте с понятным сообщением. Поздний сбой на первом request усложняет диагностику."}
        </Lead>

        <div className="lesson-practice-steps">
          <h3>{"Старт"}</h3>
          <p>{"Настройки загружаются до обслуживания traffic."}</p>
          <h3>{"Ошибка"}</h3>
          <p>{"Сообщение называет отсутствующее имя."}</p>
          <h3>{"Исправление"}</h3>
          <p>{"Оператор задаёт variable и перезапускает процесс."}</p>
        </div>

        <CodeBlock
          caption={"минимальная модель или команда"}
          code={"import os\n\ndef require_env(name: str) -> str:\n    value = os.getenv(name)\n    if not value:\n        raise RuntimeError(f\"Missing required environment variable: {name}\")\n    return value\n\nDATABASE_URL = require_env(\"DATABASE_URL\")"}
        />

        <BranchExplorer
          code={"database_url = os.getenv(\"DATABASE_URL\")\nif not database_url:\n    fail_startup(\"DATABASE_URL\")\nelif database_url.startswith(\"postgresql\"):\n    start_application()\nelse:\n    fail_startup(\"unsupported database URL\")"}
          scenarios={[
            { label: "variable отсутствует", activeLine: 2, output: "startup failed: DATABASE_URL missing" },
            { label: "корректный PostgreSQL URL", activeLine: 4, output: "application starts" },
            { label: "неподдерживаемое значение", activeLine: 6, output: "startup failed: unsupported URL" },
          ]}
        />

        <Callout tone="info">
          {"Fail fast должен сообщать имя настройки, но не печатать секретное значение целиком."}
        </Callout>
      </Section>

      <Section number={"08"} title={"Контрольная точка и проектный результат"}>
        <Lead>
          {"Завершите занятие не чтением, а воспроизводимой проверкой: выполните основной сценарий, намеренно создайте ожидаемый сбой, устраните его по наблюдаемым данным и зафиксируйте процедуру в Linux-runbook."}
        </Lead>

        <div className="lesson-check-group">
          <QuizCard
            question={"Где должен находиться production SECRET_KEY?"}
            options={[
              "в окружении развертывания, не в Git",
              "в README",
              "в названии branch",
            ]}
            correctIndex={0}
            explanation={"Правильный ответ следует из модели урока и проверяется конкретной командой, состоянием процесса или HTTP-result."}
          />
          <QuizCard
            question={"Что делает `NAME=value command`?"}
            options={[
              "задаёт variable одному запуску",
              "меняет Git config",
              "создаёт файл",
            ]}
            correctIndex={0}
            explanation={"Правильный ответ следует из модели урока и проверяется конкретной командой, состоянием процесса или HTTP-result."}
          />
          <QuizCard
            question={"Зачем нужен Settings?"}
            options={[
              "собрать и проверить config в одной границе",
              "ускорить CPU",
              "заменить database",
            ]}
            correctIndex={0}
            explanation={"Правильный ответ следует из модели урока и проверяется конкретной командой, состоянием процесса или HTTP-result."}
          />
          <QuizCard
            question={"Что означает fail fast?"}
            options={[
              "остановить startup при неверном обязательном config",
              "скрыть ошибку",
              "использовать пустой секрет",
            ]}
            correctIndex={0}
            explanation={"Правильный ответ следует из модели урока и проверяется конкретной командой, состоянием процесса или HTTP-result."}
          />
        </div>

        <MethodGrid
          rows={[
            [<>Команда</>, "может быть скопирована и выполнена без догадки"],
            [<>Ожидаемый результат</>, "показывает, как выглядит успешное состояние"],
            [<>Ошибочный сценарий</>, "воспроизводится безопасно и имеет наблюдаемый симптом"],
            [<>Исправление</>, "устраняет причину и заканчивается повторной проверкой"],
          ]}
        />

        <div className="execution-example">
          <CodeBlock
            caption={"обязательный config"}
            code={"test -n \"$DATABASE_URL\" && echo database-url-ok"}
          />
          <TerminalDemo
            title={"контрольный прогон"}
            lines={[
              { cmd: "test -n \"$DATABASE_URL\" && echo database-url-ok" },
              { out: "database-url-ok" },
              { cmd: "APP_ENV=test python scripts/show_config.py" },
              { out: "app_env=test" },
            ]}
          />
        </div>

        <RecallCard
          question={"Какой наблюдаемый факт доказывает, что основной сценарий этого занятия выполнен корректно?"}
          hint={"Назовите команду, ожидаемый output и отличие от ошибочного состояния."}
          answer={<p>{"Готовность подтверждается не отсутствием ошибок на глаз, а конкретной командой и ожидаемым результатом, записанными в runbook."}</p>}
        />

        <KeyTakeaways
          points={[
            <>{"Environment передаётся процессу при старте."}</>,
            <>{"Один код работает с разными config."}</>,
            <>{"Settings централизует чтение и проверку."}</>,
            <>{"`.env.example` документирует имена без настоящих секретов."}</>,
            <>{"Настоящий `.env` не коммитится."}</>,
            <>{"Test database изолируется от production."}</>,
            <>{"Обязательные настройки проверяются до traffic."}</>,
          ]}
        />

        <div className="lesson-practice-steps">
          <h3>{"Артефакт"}</h3>
          <p>{"Обновлён `docs/runbook-linux.md` и сохранён проверяемый результат занятия."}</p>
          <h3>{"Проверка сбоя"}</h3>
          <p>{"Есть минимум один намеренно созданный ошибочный сценарий и объяснение причины по наблюдаемым данным."}</p>
          <h3>{"Git"}</h3>
          <p>{"Изменение оформлено отдельным commit с узким техническим смыслом."}</p>
        </div>

        <PracticeCta text={"Расширьте runbook разделом `Конфигурация`: перечислите APP_ENV, DATABASE_URL, LOG_LEVEL и SECRET_KEY, добавьте `.env.example`, проверку обязательных значений и два запуска без изменения кода."} />
      </Section>

    </RichLesson>
  );
}

export function Lesson168({ module }: LessonProps) {
  return (
    <RichLesson>
      <RichHero
        variant="project"
        chip={module ?? BLOCK_TITLE}
        title={"stdout, stderr и структурированные логи"}
        intro={"Перейдём от случайных `print` к диагностируемым событиям: разделим stdout и stderr, настроим уровни logging, добавим request id и operation, сохраним traceback через `logger.exception` и исключим пароли и токены."}
        tags={[
          { icon: <FileText size={14} />, label: "события вместо print" },
          { icon: <Search size={14} />, label: "request id и traceback" },
        ]}
      />
      <Callout tone="info">
        <strong>Связь с курсом.</strong> {"Конфигурация уже приходит извне, поэтому LOG_LEVEL может управлять детализацией без правки кода. Логи становятся главным следом процесса в Linux и будущем container."}{" "}
        <strong>Важно не перепутать:</strong> {"Лог — техническое событие для диагностики, а HTTP-response — контракт клиента. Traceback нужен разработчику, но не должен возвращаться пользователю целиком."}
      </Callout>

      <Section number={"01"} title={"Почему print перестаёт хватать"}>
        <Lead>
          {"`print(\"ошибка\")` не сообщает время, уровень, operation или request. Когда несколько запросов выполняются рядом, строки невозможно уверенно связать с одним сценарием."}
        </Lead>

        <div className="lesson-practice-steps">
          <h3>{"Событие"}</h3>
          <p>{"Что именно произошло."}</p>
          <h3>{"Контекст"}</h3>
          <p>{"С каким request и объектом."}</p>
          <h3>{"Уровень"}</h3>
          <p>{"Насколько срочно нужна реакция."}</p>
        </div>

        <CodeBlock
          caption={"минимальная модель или команда"}
          code={"print(\"error\")\n\n# диагностическое событие\n2026-07-21T15:20:12Z ERROR task_load_failed request_id=req-42 user_id=7"}
        />

        <CompareSolutions
          question={"Какой вариант оставляет более ясную и воспроизводимую границу?"}
          left={{
            title: "Случайная строка",
            code: "print(\"problem\")",
            note: "Неясно где, когда и с чем.",
          }}
          right={{
            title: "Диагностическое событие",
            code: "logger.error(\"task_load_failed request_id=%s task_id=%s\", request_id, task_id)",
            note: "Содержит стабильное имя и контекст.",
          }}
          preferred="right"
          explanation={"Хороший лог помогает найти запрос и операцию без чтения исходного кода."}
        />

        <Callout tone="info">
          {"Логи не должны дублировать весь request body. Сначала выбираются минимальные поля для расследования."}
        </Callout>
      </Section>

      <Section number={"02"} title={"stdout и stderr как два потока"}>
        <Lead>
          {"Процесс имеет стандартный поток вывода и поток ошибок. В Linux оба можно перенаправлять отдельно; logging handler обычно пишет в stderr, а полезный машинный результат CLI может идти в stdout."}
        </Lead>

        <div className="lesson-practice-steps">
          <h3>{"stdout"}</h3>
          <p>{"Нормальный вывод программы."}</p>
          <h3>{"stderr"}</h3>
          <p>{"Диагностика и ошибки."}</p>
          <h3>{"Redirect"}</h3>
          <p>{"Shell направляет потоки в разные файлы."}</p>
        </div>

        <CodeBlock
          caption={"минимальная модель или команда"}
          code={"python script.py >stdout.log 2>stderr.log\n\n# stdout.log  — обычный результат\n# stderr.log  — warnings, errors, traceback"}
        />

        <TerminalDemo
          title={"разделяем потоки"}
          lines={[
            { cmd: "python scripts/log_demo.py >out.log 2>err.log" },
            { cmd: "cat out.log" },
            { out: "result=ok" },
            { cmd: "cat err.log" },
            { out: "WARNING configuration fallback used" },
          ]}
        />

        <Callout tone="info">
          {"В server-приложении оба потока обычно собирает среда запуска. Не нужно писать собственный бесконечный файл без стратегии rotation."}
        </Callout>
      </Section>

      <Section number={"03"} title={"Уровни DEBUG, INFO, WARNING и ERROR"}>
        <Lead>
          {"Уровень отвечает не за эмоциональность сообщения, а за эксплуатационный смысл. DEBUG помогает разработке, INFO фиксирует нормальный lifecycle, WARNING показывает необычное восстановимое состояние, ERROR — неуспешную операцию."}
        </Lead>

        <div className="lesson-practice-steps">
          <h3>{"DEBUG"}</h3>
          <p>{"Детали диагностики, обычно выключены в production."}</p>
          <h3>{"INFO"}</h3>
          <p>{"Нормальные значимые события."}</p>
          <h3>{"WARNING"}</h3>
          <p>{"Необычное состояние без полного отказа."}</p>
          <h3>{"ERROR"}</h3>
          <p>{"Операция не завершилась успешно."}</p>
        </div>

        <CodeBlock
          caption={"минимальная модель или команда"}
          code={"DEBUG   parsed_query_params\nINFO    request_completed\nWARNING deprecated_client_version\nERROR   database_query_failed"}
        />

        <MatchPairs
          prompt={"Соедините обозначение и его эксплуатационный смысл."}
          pairs={[
            { left: "DEBUG", right: "подробности разбора фильтра" },
            { left: "INFO", right: "приложение успешно стартовало" },
            { left: "WARNING", right: "использован fallback" },
            { left: "ERROR", right: "запрос к базе завершился ошибкой" },
          ]}
          explanation={"Пары закрепляют не команду отдельно, а её место в диагностическом маршруте."}
        />

        <Callout tone="info">
          {"Не повышайте каждое исключение до CRITICAL. Уровень выбирается по влиянию на операцию и сервис."}
        </Callout>
      </Section>

      <Section number={"04"} title={"Настройка logging из environment"}>
        <Lead>
          {"LOG_LEVEL считывается один раз при старте. Формат включает timestamp, level, logger name и message; код модулей получает именованный logger через `logging.getLogger`."}
        </Lead>

        <div className="lesson-practice-steps">
          <h3>{"Config"}</h3>
          <p>{"Один раз на entry point."}</p>
          <h3>{"Logger"}</h3>
          <p>{"Имя показывает источник события."}</p>
          <h3>{"Message"}</h3>
          <p>{"Стабильное имя и key=value контекст."}</p>
        </div>

        <CodeBlock
          caption={"минимальная модель или команда"}
          code={"import logging\nimport os\n\nlogging.basicConfig(\n    level=os.getenv(\"LOG_LEVEL\", \"INFO\"),\n    format=\"%(asctime)s %(levelname)s %(name)s %(message)s\",\n)\n\nlogger = logging.getLogger(\"studyhub.api\")\nlogger.info(\"application_started app_env=%s\", os.getenv(\"APP_ENV\", \"development\"))"}
        />

        <StepThrough
          code={"config → logger → record"}
          steps={[
            { line: 0, note: "Создаётся базовый handler и format.", vars: {"level": "INFO"} },
            { line: 1, note: "Модуль получает именованный logger.", vars: {"logger": "studyhub.api"} },
            { line: 2, note: "Формируется LogRecord.", vars: {"event": "application_started"} },
          ]}
        />

        <Callout tone="info">
          {"`basicConfig` должен выполняться до первых сообщений приложения, иначе ранние события могут получить другой handler или format."}
        </Callout>
      </Section>

      <Section number={"05"} title={"Request id связывает путь одного запроса"}>
        <Lead>
          {"Request id создаётся на границе HTTP и добавляется в каждое ключевое событие. По нему можно собрать startup запроса, database-operation и финальный status даже среди параллельных логов."}
        </Lead>

        <div className="lesson-practice-steps">
          <h3>{"Создание"}</h3>
          <p>{"ID появляется в начале request."}</p>
          <h3>{"Передача"}</h3>
          <p>{"Контекст сопровождает внутренние операции."}</p>
          <h3>{"Поиск"}</h3>
          <p>{"grep по ID восстанавливает timeline."}</p>
        </div>

        <CodeBlock
          caption={"минимальная модель или команда"}
          code={"request_started request_id=req-42 method=GET path=/tasks\ndatabase_query request_id=req-42 operation=list_tasks\nrequest_completed request_id=req-42 status=200 duration_ms=18"}
        />

        <TypeCards>
          <TypeCard badge={"request"} title={"Request context"} code={"request_id=req-42"}>
            {"Связывает события одного HTTP-запроса."}
          </TypeCard>
          <TypeCard badge={"user"} badgeTone="float" title={"Subject context"} code={"user_id=7"}>
            {"Помогает найти затронутого пользователя без email."}
          </TypeCard>
          <TypeCard badge={"operation"} badgeTone="str" title={"Action context"} code={"operation=list_tasks"}>
            {"Называет технический шаг."}
          </TypeCard>
        </TypeCards>

        <Callout tone="info">
          {"Не используйте access token или session id как request id: это секреты с другим жизненным циклом."}
        </Callout>
      </Section>

      <Section number={"06"} title={"Traceback через logger.exception"}>
        <Lead>
          {"Внутри `except` метод `logger.exception` добавляет текущий traceback. Клиент получает безопасный error contract, а серверный лог сохраняет путь до причины."}
        </Lead>

        <div className="lesson-practice-steps">
          <h3>{"Перехват"}</h3>
          <p>{"Граница знает request context."}</p>
          <h3>{"Запись"}</h3>
          <p>{"`logger.exception` добавляет traceback."}</p>
          <h3>{"Контракт"}</h3>
          <p>{"Внешний response не раскрывает внутренности."}</p>
        </div>

        <CodeBlock
          caption={"минимальная модель или команда"}
          code={"try:\n    tasks = await repository.list_tasks(user_id)\nexcept Exception:\n    logger.exception(\n        \"task_list_failed request_id=%s user_id=%s\",\n        request_id,\n        user_id,\n    )\n    raise"}
        />

        <BugHunt
          code={"except Exception as exc:\n    logger.error(\"failed password=%s token=%s error=%s\", password, token, exc)"}
          question={"Почему этот лог опасен?"}
          options={[
            "Он записывает пароль и token",
            "logger.error нельзя вызывать в except",
            "Exception нельзя преобразовать в строку",
          ]}
          correctIndex={0}
          explanation={"Credentials могут попасть в терминал, агрегатор логов и резервные копии."}
          fix={"except Exception:\n    logger.exception(\n        \"login_failed request_id=%s user_id=%s\",\n        request_id,\n        user_id,\n    )"}
        />

        <Callout tone="info">
          {"Даже DEBUG-log не является безопасным местом для пароля, access token, refresh token или полного cookie."}
        </Callout>
      </Section>

      <Section number={"07"} title={"Чтение последних логов и фильтрация"}>
        <Lead>
          {"В локальной Linux-среде `tail` показывает свежие строки, `grep` оставляет нужный request id или уровень. Runbook должен предлагать узкий поиск, а не чтение тысяч строк вручную."}
        </Lead>

        <div className="lesson-practice-steps">
          <h3>{"Окно"}</h3>
          <p>{"Сначала последние 100 строк."}</p>
          <h3>{"Корреляция"}</h3>
          <p>{"Затем конкретный request id."}</p>
          <h3>{"Ошибка"}</h3>
          <p>{"Отдельно найти ERROR рядом по времени."}</p>
        </div>

        <CodeBlock
          caption={"минимальная модель или команда"}
          code={"tail -n 100 logs/app.log\ngrep 'request_id=req-42' logs/app.log\ngrep ' ERROR ' logs/app.log | tail -n 20"}
        />

        <CodeSequence
          title={"Соберите безопасный порядок действий"}
          prompt={"Выберите только необходимые шаги и расположите их так, чтобы каждое предположение проверялось до изменения системы."}
          pieces={[
            { id: "tail", code: "tail -n 100 logs/app.log" },
            { id: "request", code: "grep 'request_id=req-42' logs/app.log" },
            { id: "error", code: "grep ' ERROR ' logs/app.log | tail -n 20" },
            { id: "context", code: "сопоставить timestamp и operation" },
            { id: "dump", code: "cat logs/app.log", note: "слишком широкий первый шаг" },
          ]}
          correctOrder={["tail", "request", "error", "context"]}
          explanation={"Поиск сужается от свежего окна к одному request и конкретной операции."}
        />

        <Callout tone="info">
          {"В container-среде источник логов изменится, но модель останется: получить свежие события → отфильтровать correlation id → найти traceback."}
        </Callout>
      </Section>

      <Section number={"08"} title={"Контрольная точка и проектный результат"}>
        <Lead>
          {"Завершите занятие не чтением, а воспроизводимой проверкой: выполните основной сценарий, намеренно создайте ожидаемый сбой, устраните его по наблюдаемым данным и зафиксируйте процедуру в Linux-runbook."}
        </Lead>

        <div className="lesson-check-group">
          <QuizCard
            question={"Для чего нужен request id?"}
            options={[
              "связать события одного запроса",
              "заменить пароль",
              "выбрать порт",
            ]}
            correctIndex={0}
            explanation={"Правильный ответ следует из модели урока и проверяется конкретной командой, состоянием процесса или HTTP-result."}
          />
          <QuizCard
            question={"Что делает logger.exception внутри except?"}
            options={[
              "добавляет текущий traceback",
              "останавливает ОС",
              "удаляет лог",
            ]}
            correctIndex={0}
            explanation={"Правильный ответ следует из модели урока и проверяется конкретной командой, состоянием процесса или HTTP-result."}
          />
          <QuizCard
            question={"Какой уровень подходит успешному startup?"}
            options={[
              "INFO",
              "ERROR",
              "CRITICAL всегда",
            ]}
            correctIndex={0}
            explanation={"Правильный ответ следует из модели урока и проверяется конкретной командой, состоянием процесса или HTTP-result."}
          />
          <QuizCard
            question={"Что нельзя записывать в лог?"}
            options={[
              "пароли и токены",
              "operation name",
              "status code",
            ]}
            correctIndex={0}
            explanation={"Правильный ответ следует из модели урока и проверяется конкретной командой, состоянием процесса или HTTP-result."}
          />
        </div>

        <MethodGrid
          rows={[
            [<>Команда</>, "может быть скопирована и выполнена без догадки"],
            [<>Ожидаемый результат</>, "показывает, как выглядит успешное состояние"],
            [<>Ошибочный сценарий</>, "воспроизводится безопасно и имеет наблюдаемый симптом"],
            [<>Исправление</>, "устраняет причину и заканчивается повторной проверкой"],
          ]}
        />

        <div className="execution-example">
          <CodeBlock
            caption={"поиск request timeline"}
            code={"tail -n 100 logs/app.log\ngrep 'request_id=req-42' logs/app.log"}
          />
          <TerminalDemo
            title={"контрольный прогон"}
            lines={[
              { cmd: "grep 'request_id=req-42' logs/app.log" },
              { out: "INFO request_started request_id=req-42" },
              { out: "INFO request_completed request_id=req-42 status=200" },
            ]}
          />
        </div>

        <RecallCard
          question={"Какой наблюдаемый факт доказывает, что основной сценарий этого занятия выполнен корректно?"}
          hint={"Назовите команду, ожидаемый output и отличие от ошибочного состояния."}
          answer={<p>{"Готовность подтверждается не отсутствием ошибок на глаз, а конкретной командой и ожидаемым результатом, записанными в runbook."}</p>}
        />

        <KeyTakeaways
          points={[
            <>{"Logging создаёт события с уровнем и контекстом."}</>,
            <>{"stdout и stderr можно перенаправлять отдельно."}</>,
            <>{"LOG_LEVEL приходит из environment."}</>,
            <>{"Request id связывает timeline одного запроса."}</>,
            <>{"`logger.exception` сохраняет traceback."}</>,
            <>{"HTTP-response не раскрывает server traceback."}</>,
            <>{"Секреты не попадают ни в один уровень логов."}</>,
          ]}
        />

        <div className="lesson-practice-steps">
          <h3>{"Артефакт"}</h3>
          <p>{"Обновлён `docs/runbook-linux.md` и сохранён проверяемый результат занятия."}</p>
          <h3>{"Проверка сбоя"}</h3>
          <p>{"Есть минимум один намеренно созданный ошибочный сценарий и объяснение причины по наблюдаемым данным."}</p>
          <h3>{"Git"}</h3>
          <p>{"Изменение оформлено отдельным commit с узким техническим смыслом."}</p>
        </div>

        <PracticeCta text={"Добавьте в StudyHub именованный logger, startup-событие, request id, событие завершения и один ожидаемый error с traceback. В runbook зафиксируйте `tail` и фильтрацию по request id."} />
      </Section>

    </RichLesson>
  );
}

export function Lesson169({ module }: LessonProps) {
  return (
    <RichLesson>
      <RichHero
        variant="project"
        chip={module ?? BLOCK_TITLE}
        title={"Healthcheck, readiness и graceful shutdown"}
        intro={"Разделим три состояния сервиса: процесс существует, приложение готово обслуживать запросы и приложение корректно освобождает ресурсы при завершении. Добавим `/health`, `/ready` и cleanup через FastAPI lifespan."}
        tags={[
          { icon: <CheckCircle2 size={14} />, label: "жив · готов · завершается" },
          { icon: <ShieldCheck size={14} />, label: "контролируемый lifecycle" },
        ]}
      />
      <Callout tone="info">
        <strong>Связь с курсом.</strong> {"PID, config и logs уже наблюдаемы. Теперь StudyHub должен сам сообщать, может ли принимать traffic, а при SIGTERM — завершать database resources до остановки процесса."}{" "}
        <strong>Важно не перепутать:</strong> {"Liveness не доказывает доступность базы, а readiness не должна выполнять тяжёлый бизнес-сценарий. Каждая проверка отвечает на один эксплуатационный вопрос."}
      </Callout>

      <Section number={"01"} title={"Три вопроса вместо одного status"}>
        <Lead>
          {"Один endpoint «всё хорошо» смешивает разные состояния. Процесс может быть жив, но ещё выполнять startup; приложение может работать, но перестать принимать новые request во время shutdown."}
        </Lead>

        <div className="lesson-practice-steps">
          <h3>{"Live"}</h3>
          <p>{"Процесс способен быстро ответить."}</p>
          <h3>{"Ready"}</h3>
          <p>{"Можно направлять пользовательский traffic."}</p>
          <h3>{"Draining"}</h3>
          <p>{"Идёт завершение без новых операций."}</p>
        </div>

        <CodeBlock
          caption={"минимальная модель или команда"}
          code={"liveness:  процесс и event loop живы?\nreadiness: критические зависимости доступны?\nshutdown:  новые request прекращены, ресурсы закрываются?"}
        />

        <TypeCards>
          <TypeCard badge={"live"} title={"Liveness"} code={"GET /health"}>
            {"Быстрый ответ без тяжёлых зависимостей."}
          </TypeCard>
          <TypeCard badge={"ready"} badgeTone="float" title={"Readiness"} code={"GET /ready"}>
            {"Проверяет критическую готовность."}
          </TypeCard>
          <TypeCard badge={"stop"} badgeTone="str" title={"Shutdown"} code={"SIGTERM → cleanup"}>
            {"Освобождает ресурсы и завершает процесс."}
          </TypeCard>
        </TypeCards>

        <Callout tone="info">
          {"HTTP 200 от `/health` не означает, что database connection работает. Для этого существует отдельная readiness-проверка."}
        </Callout>
      </Section>

      <Section number={"02"} title={"/health должен быть быстрым"}>
        <Lead>
          {"Liveness endpoint подтверждает, что приложение способно обработать простой request. Он не строит отчёт, не читает все таблицы и не обращается к внешним сервисам без необходимости."}
        </Lead>

        <div className="lesson-practice-steps">
          <h3>{"Вход"}</h3>
          <p>{"Обычный GET без body."}</p>
          <h3>{"Работа"}</h3>
          <p>{"Минимальная функция без тяжёлого I/O."}</p>
          <h3>{"Ответ"}</h3>
          <p>{"Стабильный status для автоматической проверки."}</p>
        </div>

        <CodeBlock
          caption={"минимальная модель или команда"}
          code={"from fastapi import FastAPI\n\napp = FastAPI()\n\n@app.get(\"/health\")\ndef health() -> dict[str, str]:\n    return {\"status\": \"ok\"}"}
        />

        <CompareSolutions
          question={"Какой вариант оставляет более ясную и воспроизводимую границу?"}
          left={{
            title: "Тяжёлый health",
            code: "SELECT * FROM tasks; call external API; build report",
            note: "Проверка сама создаёт нагрузку и новые точки отказа.",
          }}
          right={{
            title: "Минимальный health",
            code: "return {\"status\": \"ok\"}",
            note: "Отвечает только на вопрос liveness.",
          }}
          preferred="right"
          explanation={"Liveness должна быть быстрой, дешёвой и предсказуемой."}
        />

        <Callout tone="info">
          {"Не включайте version, secrets и полный config в публичный health-response."}
        </Callout>
      </Section>

      <Section number={"03"} title={"/ready проверяет критическую зависимость"}>
        <Lead>
          {"Readiness может выполнить короткий запрос `SELECT 1` к основной базе. При недоступности зависимости endpoint возвращает состояние not ready, и traffic не должен направляться в приложение."}
        </Lead>

        <div className="lesson-practice-steps">
          <h3>{"Dependency"}</h3>
          <p>{"Получить session стандартным способом."}</p>
          <h3>{"Probe"}</h3>
          <p>{"Выполнить короткую проверку соединения."}</p>
          <h3>{"Outcome"}</h3>
          <p>{"Готовность зависит от критической базы."}</p>
        </div>

        <CodeBlock
          caption={"минимальная модель или команда"}
          code={"from sqlalchemy import text\n\n@app.get(\"/ready\")\nasync def ready(db: AsyncSession = Depends(get_db)):\n    await db.execute(text(\"SELECT 1\"))\n    return {\"status\": \"ready\"}"}
        />

        <BranchExplorer
          code={"if app_is_starting:\n    return 503, \"starting\"\nelif database_unavailable:\n    return 503, \"not_ready\"\nelif app_is_draining:\n    return 503, \"draining\"\nelse:\n    return 200, \"ready\""}
          scenarios={[
            { label: "startup ещё идёт", activeLine: 1, output: "503 starting" },
            { label: "database недоступна", activeLine: 3, output: "503 not_ready" },
            { label: "получен SIGTERM", activeLine: 5, output: "503 draining" },
            { label: "все зависимости готовы", activeLine: 7, output: "200 ready" },
          ]}
        />

        <Callout tone="info">
          {"Ошибка readiness должна попадать в лог без утечки DATABASE_URL и password."}
        </Callout>
      </Section>

      <Section number={"04"} title={"Lifecycle: startup, running, draining, stopped"}>
        <Lead>
          {"Состояния полезно представить как конечный маршрут. После startup приложение становится ready. После сигнала завершения оно переходит в draining, прекращает новые операции и закрывает ресурсы."}
        </Lead>

        <div className="lesson-practice-steps">
          <h3>{"Starting"}</h3>
          <p>{"Загрузка config и подключение ресурсов."}</p>
          <h3>{"Running"}</h3>
          <p>{"Health и ready отвечают успешно."}</p>
          <h3>{"Draining"}</h3>
          <p>{"Новые request не принимаются."}</p>
          <h3>{"Stopped"}</h3>
          <p>{"Процесс завершён после cleanup."}</p>
        </div>

        <CodeBlock
          caption={"минимальная модель или команда"}
          code={"starting\n→ running + ready\n→ SIGTERM\n→ draining + not ready\n→ close resources\n→ stopped"}
        />

        <StepThrough
          code={"starting → running → draining → stopped"}
          steps={[
            { line: 0, note: "Проверяется обязательный config.", vars: {"state": "starting"} },
            { line: 1, note: "Инициализируется engine/client.", vars: {"state": "running", "ready": "true"} },
            { line: 2, note: "Начинается shutdown.", vars: {"state": "draining", "ready": "false"} },
            { line: 3, note: "Закрываются pools и clients.", vars: {"state": "stopped"} },
          ]}
        />

        <Callout tone="info">
          {"Graceful shutdown имеет ограниченное время. Долгая операция не должна удерживать процесс бесконечно."}
        </Callout>
      </Section>

      <Section number={"05"} title={"FastAPI lifespan задаёт границу ресурсов"}>
        <Lead>
          {"Lifespan выполняет код до начала обслуживания и после завершения. В блоке `yield` приложение работает; после `yield` закрываются engine и внешние clients."}
        </Lead>

        <div className="lesson-practice-steps">
          <h3>{"До yield"}</h3>
          <p>{"Startup-подготовка."}</p>
          <h3>{"Yield"}</h3>
          <p>{"Период обслуживания request."}</p>
          <h3>{"После yield"}</h3>
          <p>{"Shutdown и cleanup."}</p>
        </div>

        <CodeBlock
          caption={"минимальная модель или команда"}
          code={"from contextlib import asynccontextmanager\nfrom fastapi import FastAPI\n\n@asynccontextmanager\nasync def lifespan(app: FastAPI):\n    logger.info(\"application_starting\")\n    yield\n    logger.info(\"application_stopping\")\n    await engine.dispose()\n\napp = FastAPI(lifespan=lifespan)"}
        />

        <FillBlank
          prompt={"Какое действие освобождает pool SQLAlchemy?"}
          before={"await engine."}
          after={"()"}
          options={["dispose", "execute", "refresh"]}
          answer={"dispose"}
          explanation={"`dispose()` закрывает соединения engine во время shutdown."}
        />

        <Callout tone="info">
          {"При использовании lifespan не дублируйте ту же инициализацию в старых startup/shutdown handlers."}
        </Callout>
      </Section>

      <Section number={"06"} title={"SIGTERM запускает управляемое завершение"}>
        <Lead>
          {"Uvicorn принимает системный сигнал и инициирует shutdown приложения. Логи должны показать последовательность: signal → draining → lifespan cleanup → process stopped."}
        </Lead>

        <div className="lesson-practice-steps">
          <h3>{"Signal"}</h3>
          <p>{"ОС просит процесс завершиться."}</p>
          <h3>{"Server"}</h3>
          <p>{"Uvicorn прекращает принимать новые соединения."}</p>
          <h3>{"Application"}</h3>
          <p>{"Lifespan закрывает ресурсы."}</p>
        </div>

        <CodeBlock
          caption={"минимальная модель или команда"}
          code={"kill -TERM \"$PID\"\n\nINFO shutdown_requested signal=SIGTERM\nINFO readiness_changed ready=false\nINFO database_engine_disposed\nINFO application_stopped"}
        />

        <TrueFalse
          statement={<>{"После SIGTERM корректное приложение должно немедленно исчезнуть без выполнения cleanup."}</>}
          isTrue={false}
          explanation={"SIGTERM предназначен для управляемого завершения; приложение получает возможность выполнить shutdown-процедуру."}
        />

        <Callout tone="info">
          {"SIGKILL не запускает lifespan cleanup. Он остаётся последней мерой для зависшего процесса."}
        </Callout>
      </Section>

      <Section number={"07"} title={"Проверяем success и отказ базы"}>
        <Lead>
          {"Контрольный сценарий включает четыре состояния: оба endpoint отвечают 200; база недоступна — health 200, ready 503; shutdown — ready 503; после остановки соединение отклоняется."}
        </Lead>

        <div className="lesson-practice-steps">
          <h3>{"Нормально"}</h3>
          <p>{"health=200, ready=200."}</p>
          <h3>{"DB down"}</h3>
          <p>{"health=200, ready=503."}</p>
          <h3>{"Draining"}</h3>
          <p>{"ready=503 до остановки."}</p>
          <h3>{"Stopped"}</h3>
          <p>{"TCP connection больше не устанавливается."}</p>
        </div>

        <CodeBlock
          caption={"минимальная модель или команда"}
          code={"curl -fsS http://127.0.0.1:8000/health\ncurl -i http://127.0.0.1:8000/ready\nkill -TERM \"$PID\"\ncurl -i http://127.0.0.1:8000/health"}
        />

        <BugHunt
          code={"@app.get(\"/health\")\nasync def health(db: AsyncSession = Depends(get_db)):\n    tasks = (await db.execute(select(TaskModel))).scalars().all()\n    return {\"status\": \"ok\", \"tasks\": len(tasks)}"}
          question={"Почему такой healthcheck неудачен?"}
          options={[
            "Он выполняет тяжёлый бизнес-запрос и зависит от содержимого tasks",
            "FastAPI запрещает async endpoints",
            "health обязан возвращать HTML",
          ]}
          correctIndex={0}
          explanation={"Liveness должна быть быстрой и не зависеть от полной выборки данных."}
          fix={"@app.get(\"/health\")\ndef health():\n    return {\"status\": \"ok\"}"}
        />

        <Callout tone="info">
          {"Отдельная readiness-проверка может зависеть от базы, но остаётся короткой и ограниченной по времени."}
        </Callout>
      </Section>

      <Section number={"08"} title={"Контрольная точка и проектный результат"}>
        <Lead>
          {"Завершите занятие не чтением, а воспроизводимой проверкой: выполните основной сценарий, намеренно создайте ожидаемый сбой, устраните его по наблюдаемым данным и зафиксируйте процедуру в Linux-runbook."}
        </Lead>

        <div className="lesson-check-group">
          <QuizCard
            question={"Что проверяет liveness?"}
            options={[
              "процесс способен быстро ответить",
              "все бизнес-данные корректны",
              "пользователь авторизован",
            ]}
            correctIndex={0}
            explanation={"Правильный ответ следует из модели урока и проверяется конкретной командой, состоянием процесса или HTTP-result."}
          />
          <QuizCard
            question={"Что происходит при недоступной базе?"}
            options={[
              "health может быть 200, ready — 503",
              "оба всегда 200",
              "процесс обязан удалить базу",
            ]}
            correctIndex={0}
            explanation={"Правильный ответ следует из модели урока и проверяется конкретной командой, состоянием процесса или HTTP-result."}
          />
          <QuizCard
            question={"Где выполняется cleanup lifespan?"}
            options={[
              "после yield",
              "до объявления функции",
              "в response model",
            ]}
            correctIndex={0}
            explanation={"Правильный ответ следует из модели урока и проверяется конкретной командой, состоянием процесса или HTTP-result."}
          />
          <QuizCard
            question={"Какой сигнал запускает штатный shutdown?"}
            options={[
              "SIGTERM",
              "SIGKILL только",
              "никакой",
            ]}
            correctIndex={0}
            explanation={"Правильный ответ следует из модели урока и проверяется конкретной командой, состоянием процесса или HTTP-result."}
          />
        </div>

        <MethodGrid
          rows={[
            [<>Команда</>, "может быть скопирована и выполнена без догадки"],
            [<>Ожидаемый результат</>, "показывает, как выглядит успешное состояние"],
            [<>Ошибочный сценарий</>, "воспроизводится безопасно и имеет наблюдаемый симптом"],
            [<>Исправление</>, "устраняет причину и заканчивается повторной проверкой"],
          ]}
        />

        <div className="execution-example">
          <CodeBlock
            caption={"liveness и readiness"}
            code={"curl -i http://127.0.0.1:8000/health\ncurl -i http://127.0.0.1:8000/ready"}
          />
          <TerminalDemo
            title={"контрольный прогон"}
            lines={[
              { cmd: "curl -fsS http://127.0.0.1:8000/health" },
              { out: "{\"status\":\"ok\"}" },
              { cmd: "curl -fsS http://127.0.0.1:8000/ready" },
              { out: "{\"status\":\"ready\"}" },
            ]}
          />
        </div>

        <RecallCard
          question={"Какой наблюдаемый факт доказывает, что основной сценарий этого занятия выполнен корректно?"}
          hint={"Назовите команду, ожидаемый output и отличие от ошибочного состояния."}
          answer={<p>{"Готовность подтверждается не отсутствием ошибок на глаз, а конкретной командой и ожидаемым результатом, записанными в runbook."}</p>}
        />

        <KeyTakeaways
          points={[
            <>{"Liveness и readiness отвечают на разные вопросы."}</>,
            <>{"`/health` остаётся быстрым и дешёвым."}</>,
            <>{"`/ready` проверяет критическую зависимость."}</>,
            <>{"Lifecycle включает starting, running, draining и stopped."}</>,
            <>{"Lifespan задаёт startup и cleanup ресурсов."}</>,
            <>{"SIGTERM инициирует graceful shutdown."}</>,
            <>{"Failure базы проверяется отдельным сценарием."}</>,
          ]}
        />

        <div className="lesson-practice-steps">
          <h3>{"Артефакт"}</h3>
          <p>{"Обновлён `docs/runbook-linux.md` и сохранён проверяемый результат занятия."}</p>
          <h3>{"Проверка сбоя"}</h3>
          <p>{"Есть минимум один намеренно созданный ошибочный сценарий и объяснение причины по наблюдаемым данным."}</p>
          <h3>{"Git"}</h3>
          <p>{"Изменение оформлено отдельным commit с узким техническим смыслом."}</p>
        </div>

        <PracticeCta text={"Добавьте `/health`, `/ready` и lifespan cleanup. В runbook опишите ожидаемые status при рабочей и недоступной базе, а также последовательность логов после SIGTERM."} />
      </Section>

    </RichLesson>
  );
}

export function Lesson170({ module }: LessonProps) {
  return (
    <RichLesson>
      <RichHero
        variant="project"
        chip={module ?? BLOCK_TITLE}
        title={"Linux-runbook и диагностика запуска StudyHub"}
        intro={"Соберём знания блока в `docs/runbook-linux.md`: проведём чистый запуск, зафиксируем preflight-checks и по одной процедуре устраним неверный cwd, отсутствующую variable, занятый port и недоступную database."}
        tags={[
          { icon: <ListChecks size={14} />, label: "процедура вместо памяти" },
          { icon: <Wrench size={14} />, label: "диагностическое дерево" },
        ]}
      />
      <Callout tone="info">
        <strong>Связь с курсом.</strong> {"Отдельные команды уже понятны. Финальная задача — превратить их в воспроизводимый маршрут, которым воспользуется другой разработчик без устных подсказок."}{" "}
        <strong>Важно не перепутать:</strong> {"Runbook не должен скрывать проблему магической командой «переустановить всё». Каждый шаг проверяет одно предположение и сохраняет наблюдаемый результат."}
      </Callout>

      <Section number={"01"} title={"Runbook — это исполняемая процедура"}>
        <Lead>
          {"Хороший runbook содержит цель, prerequisites, команды, ожидаемый результат и ветки для типовых ошибок. Он уменьшает зависимость проекта от памяти одного автора."}
        </Lead>

        <div className="lesson-practice-steps">
          <h3>{"Команда"}</h3>
          <p>{"Что именно выполнить."}</p>
          <h3>{"Ожидание"}</h3>
          <p>{"Как выглядит успешный результат."}</p>
          <h3>{"Ветка"}</h3>
          <p>{"Что проверить, если результат другой."}</p>
        </div>

        <CodeBlock
          caption={"минимальная модель или команда"}
          code={"# Linux runbook\n1. проверить prerequisites\n2. перейти в корень проекта\n3. загрузить config\n4. запустить process\n5. проверить port и health\n6. прочитать logs\n7. остановить штатно"}
        />

        <TypeCards>
          <TypeCard badge={"input"} title={"Prerequisites"} code={"Python, dependencies, config"}>
            {"Что должно существовать до запуска."}
          </TypeCard>
          <TypeCard badge={"action"} badgeTone="float" title={"Procedure"} code={"команды по порядку"}>
            {"Минимальный путь запуска."}
          </TypeCard>
          <TypeCard badge={"failure"} badgeTone="str" title={"Troubleshooting"} code={"симптом → проверка → исправление"}>
            {"Контролируемые ветки диагностики."}
          </TypeCard>
        </TypeCards>

        <Callout tone="info">
          {"Фраза «запустите проект как обычно» недопустима: другой человек не знает локальных привычек автора."}
        </Callout>
      </Section>

      <Section number={"02"} title={"Preflight: Python, зависимости, cwd и config"}>
        <Lead>
          {"До старта сервера проверяются четыре независимых условия. Такой порядок отделяет проблему среды от проблемы приложения."}
        </Lead>

        <div className="lesson-practice-steps">
          <h3>{"Runtime"}</h3>
          <p>{"Версия Python доступна."}</p>
          <h3>{"Dependencies"}</h3>
          <p>{"`pip check` не видит конфликтов."}</p>
          <h3>{"Path"}</h3>
          <p>{"В cwd существует app/main.py."}</p>
          <h3>{"Config"}</h3>
          <p>{"Обязательная variable непуста."}</p>
        </div>

        <CodeBlock
          caption={"минимальная модель или команда"}
          code={"python --version\npython -m pip check\npwd\ntest -f app/main.py && echo \"project root ok\"\ntest -n \"$DATABASE_URL\" && echo \"DATABASE_URL is set\""}
        />

        <CodeSequence
          title={"Соберите безопасный порядок действий"}
          prompt={"Выберите только необходимые шаги и расположите их так, чтобы каждое предположение проверялось до изменения системы."}
          pieces={[
            { id: "python", code: "python --version" },
            { id: "deps", code: "python -m pip check" },
            { id: "cwd", code: "pwd && test -f app/main.py" },
            { id: "config", code: "test -n \"$DATABASE_URL\"" },
            { id: "start", code: "python -m uvicorn app.main:app --port 8000" },
          ]}
          correctOrder={["python", "deps", "cwd", "config", "start"]}
          explanation={"Сервер запускается только после подтверждения runtime, dependencies, cwd и config."}
        />

        <Callout tone="info">
          {"Preflight не доказывает, что database доступна, но быстро исключает четыре частых причины startup failure."}
        </Callout>
      </Section>

      <Section number={"03"} title={"Запуск, PID, port и endpoints"}>
        <Lead>
          {"После preflight runbook запускает Uvicorn в foreground, а второй терминал проверяет process, socket, health и readiness. Каждый шаг отвечает на отдельный вопрос."}
        </Lead>

        <div className="lesson-practice-steps">
          <h3>{"Process"}</h3>
          <p>{"Есть ли Uvicorn PID."}</p>
          <h3>{"Port"}</h3>
          <p>{"Слушает ли он 8000."}</p>
          <h3>{"Live"}</h3>
          <p>{"Отвечает ли `/health`."}</p>
          <h3>{"Ready"}</h3>
          <p>{"Доступна ли database."}</p>
        </div>

        <CodeBlock
          caption={"минимальная модель или команда"}
          code={"python -m uvicorn app.main:app --host 127.0.0.1 --port 8000\n\nps -ef | grep '[u]vicorn'\nss -ltnp | grep ':8000'\ncurl -fsS http://127.0.0.1:8000/health\ncurl -i http://127.0.0.1:8000/ready"}
        />

        <TerminalDemo
          title={"успешный запуск по runbook"}
          lines={[
            { cmd: "python -m uvicorn app.main:app --host 127.0.0.1 --port 8000" },
            { out: "INFO application_started app_env=development" },
            { out: "INFO Uvicorn running on http://127.0.0.1:8000" },
            { cmd: "curl -fsS http://127.0.0.1:8000/health" },
            { out: "{\"status\":\"ok\"}" },
            { cmd: "curl -fsS http://127.0.0.1:8000/ready" },
            { out: "{\"status\":\"ready\"}" },
          ]}
        />

        <Callout tone="info">
          {"Runbook фиксирует ожидаемый status и body, а не только команду curl."}
        </Callout>
      </Section>

      <Section number={"04"} title={"Диагностическое дерево по уровню отказа"}>
        <Lead>
          {"Симптом определяет следующий вопрос. Если команда не стартует — проверяются runtime, cwd и config. Если процесс падает — читается traceback. Если процесс жив, но API не отвечает — проверяются port, host и endpoints."}
        </Lead>

        <div className="lesson-practice-steps">
          <h3>{"Нет процесса"}</h3>
          <p>{"Проверить запуск и stderr."}</p>
          <h3>{"Процесс падает"}</h3>
          <p>{"Найти первый traceback cause."}</p>
          <h3>{"Процесс жив"}</h3>
          <p>{"Проверить socket и HTTP."}</p>
          <h3>{"Ready 503"}</h3>
          <p>{"Проверить критическую dependency."}</p>
        </div>

        <CodeBlock
          caption={"минимальная модель или команда"}
          code={"command fails\n├── python missing?\n├── wrong cwd?\n└── required env missing?\n\nprocess exits\n├── traceback\n├── database unavailable\n└── migration/config error\n\nprocess alive, API fails\n├── wrong host/port\n├── /health\n└── /ready"}
        />

        <BranchExplorer
          code={"if command_does_not_start:\n    check_runtime_cwd_and_env()\nelif process_exits:\n    read_traceback_and_startup_logs()\nelif port_is_not_listening:\n    inspect_bind_and_owner()\nelif health_fails:\n    inspect_application_logs()\nelif ready_fails:\n    inspect_database_connection()\nelse:\n    run_smoke_scenario()"}
          scenarios={[
            { label: "команда не запускается", activeLine: 1, output: "runtime → cwd → env" },
            { label: "process сразу завершился", activeLine: 3, output: "startup logs → traceback" },
            { label: "порт не слушается", activeLine: 5, output: "host/port → owner" },
            { label: "/health не отвечает", activeLine: 7, output: "application logs" },
            { label: "/ready возвращает 503", activeLine: 9, output: "database connection" },
            { label: "health и ready успешны", activeLine: 11, output: "smoke scenario" },
          ]}
        />

        <Callout tone="info">
          {"Не перескакивайте сразу к database, если Python-команда вообще не создала процесс."}
        </Callout>
      </Section>

      <Section number={"05"} title={"Инцидент 1–2: неверный cwd и отсутствующая variable"}>
        <Lead>
          {"Первые две неисправности диагностируются до сетевого уровня. `pwd` и наличие `app/main.py` подтверждают root проекта; startup-message называет отсутствующую переменную."}
        </Lead>

        <div className="lesson-practice-steps">
          <h3>{"Wrong cwd"}</h3>
          <p>{"Модуль app не импортируется."}</p>
          <h3>{"Check"}</h3>
          <p>{"`test -f app/main.py` завершается неуспешно."}</p>
          <h3>{"Missing env"}</h3>
          <p>{"Settings завершает startup с именем variable."}</p>
        </div>

        <CodeBlock
          caption={"минимальная модель или команда"}
          code={"# wrong cwd\npwd\ntest -f app/main.py || echo \"not project root\"\n\n# missing config\nprintenv DATABASE_URL\npython scripts/check_config.py"}
        />

        <CompareSolutions
          question={"Какой вариант оставляет более ясную и воспроизводимую границу?"}
          left={{
            title: "Случайная починка",
            code: "export PYTHONPATH=$PYTHONPATH:$(pwd)/studyhub",
            note: "Маскирует неверную точку запуска.",
          }}
          right={{
            title: "Исправить причину",
            code: "cd /srv/studyhub && test -f app/main.py",
            note: "Возвращает ожидаемый project root.",
          }}
          preferred="right"
          explanation={"Runbook исправляет нарушенное предположение, а не добавляет глобальный обходной путь."}
        />

        <Callout tone="info">
          {"Не выводите значение SECRET_KEY при проверке. Достаточно подтвердить наличие непустой variable."}
        </Callout>
      </Section>

      <Section number={"06"} title={"Инцидент 3–4: занятый port и недоступная database"}>
        <Lead>
          {"Конфликт порта виден до HTTP, а недоступная database проявляется как ready=503 при живом процессе. Это разные уровни и разные процедуры."}
        </Lead>

        <div className="lesson-practice-steps">
          <h3>{"Port busy"}</h3>
          <p>{"Найти PID владельца и команду."}</p>
          <h3>{"Health 200"}</h3>
          <p>{"Процесс и HTTP-path живы."}</p>
          <h3>{"Ready 503"}</h3>
          <p>{"Проверить database URL, DNS, port и credentials."}</p>
          <h3>{"Fix"}</h3>
          <p>{"Перезапустить только после устранения причины."}</p>
        </div>

        <CodeBlock
          caption={"минимальная модель или команда"}
          code={"ss -ltnp | grep ':8000'\nps -fp \"$PID\"\n\ncurl -i http://127.0.0.1:8000/health\ncurl -i http://127.0.0.1:8000/ready\ngrep 'database' logs/app.log | tail -n 20"}
        />

        <BugHunt
          code={"curl -i http://127.0.0.1:8000/health\n# 200 OK\ncurl -i http://127.0.0.1:8000/ready\n# 503 Service Unavailable\n\n# оператор перезапускает API десять раз"}
          question={"Почему повторный restart не решает проблему?"}
          options={[
            "Liveness успешна, а readiness указывает на database dependency",
            "curl нельзя использовать дважды",
            "503 означает занятый HTTP-port",
          ]}
          correctIndex={0}
          explanation={"Нужно диагностировать соединение с базой, а не повторять запуск живого процесса."}
          fix={"printenv DATABASE_URL\n# проверить host/port database\n# прочитать startup и readiness logs\n# после исправления повторить /ready"}
        />

        <Callout tone="info">
          {"Runbook должен ограничивать destructive actions: reset базы не является первой проверкой connection failure."}
        </Callout>
      </Section>

      <Section number={"07"} title={"Чистая репетиция и критерий завершения"}>
        <Lead>
          {"Финальная проверка выполняется в новой shell-сессии или чистой директории по одной документации. Другой человек фиксирует места, где пришлось догадаться, и эти пробелы возвращаются в runbook."}
        </Lead>

        <div className="lesson-practice-steps">
          <h3>{"Чистый старт"}</h3>
          <p>{"Нет скрытого состояния IDE и старой shell."}</p>
          <h3>{"Наблюдение"}</h3>
          <p>{"Записываются реальные outputs и ошибки."}</p>
          <h3>{"Исправление docs"}</h3>
          <p>{"Каждая догадка превращается в явный шаг."}</p>
          <h3>{"Готовность"}</h3>
          <p>{"Другой человек повторяет сценарий без автора."}</p>
        </div>

        <CodeBlock
          caption={"минимальная модель или команда"}
          code={"git clone <repository> studyhub-clean\ncd studyhub-clean\ncp .env.example .env.local\n# заполнить безопасные local values\npython -m pip install -r requirements.txt\n# выполнить runbook от preflight до shutdown"}
        />

        <RecallCard
          question={"Какие четыре неисправности обязан различать финальный runbook?"}
          hint={"Вспомните уровни: path → config → process/socket → dependency."}
          answer={<p>{"Неверный cwd, отсутствующая обязательная environment variable, занятый port и недоступная database. Для каждой нужны симптом, проверка и безопасное исправление."}</p>}
        />

        <Callout tone="info">
          {"Новая функциональность API не добавляется. Результат блока — воспроизводимый запуск и понятная диагностика."}
        </Callout>
      </Section>

      <Section number={"08"} title={"Контрольная точка и проектный результат"}>
        <Lead>
          {"Завершите занятие не чтением, а воспроизводимой проверкой: выполните основной сценарий, намеренно создайте ожидаемый сбой, устраните его по наблюдаемым данным и зафиксируйте процедуру в Linux-runbook."}
        </Lead>

        <div className="lesson-check-group">
          <QuizCard
            question={"С чего начинается preflight?"}
            options={[
              "runtime, dependencies, cwd и config",
              "с удаления базы",
              "с Docker build",
            ]}
            correctIndex={0}
            explanation={"Правильный ответ следует из модели урока и проверяется конкретной командой, состоянием процесса или HTTP-result."}
          />
          <QuizCard
            question={"Что проверяет ready=503 при health=200?"}
            options={[
              "критическая dependency недоступна",
              "Python не установлен",
              "порт свободен",
            ]}
            correctIndex={0}
            explanation={"Правильный ответ следует из модели урока и проверяется конкретной командой, состоянием процесса или HTTP-result."}
          />
          <QuizCard
            question={"Зачем runbook указывает ожидаемый output?"}
            options={[
              "чтобы отличить успех от другого состояния",
              "для красоты",
              "чтобы скрыть ошибки",
            ]}
            correctIndex={0}
            explanation={"Правильный ответ следует из модели урока и проверяется конкретной командой, состоянием процесса или HTTP-result."}
          />
          <QuizCard
            question={"Как проверить качество runbook?"}
            options={[
              "дать другому человеку чистый запуск",
              "прочитать только заголовки",
              "добавить больше команд без проверки",
            ]}
            correctIndex={0}
            explanation={"Правильный ответ следует из модели урока и проверяется конкретной командой, состоянием процесса или HTTP-result."}
          />
        </div>

        <MethodGrid
          rows={[
            [<>Команда</>, "может быть скопирована и выполнена без догадки"],
            [<>Ожидаемый результат</>, "показывает, как выглядит успешное состояние"],
            [<>Ошибочный сценарий</>, "воспроизводится безопасно и имеет наблюдаемый симптом"],
            [<>Исправление</>, "устраняет причину и заканчивается повторной проверкой"],
          ]}
        />

        <div className="execution-example">
          <CodeBlock
            caption={"preflight runbook"}
            code={"python --version\npython -m pip check\npwd\ntest -f app/main.py"}
          />
          <TerminalDemo
            title={"контрольный прогон"}
            lines={[
              { cmd: "python --version" },
              { out: "Python 3.x" },
              { cmd: "python -m pip check" },
              { out: "No broken requirements found." },
            ]}
          />
        </div>

        <RecallCard
          question={"Какой наблюдаемый факт доказывает, что основной сценарий этого занятия выполнен корректно?"}
          hint={"Назовите команду, ожидаемый output и отличие от ошибочного состояния."}
          answer={<p>{"Готовность подтверждается не отсутствием ошибок на глаз, а конкретной командой и ожидаемым результатом, записанными в runbook."}</p>}
        />

        <KeyTakeaways
          points={[
            <>{"Runbook содержит команды, ожидания и ветки отказа."}</>,
            <>{"Preflight отделяет environment-проблемы от application-проблем."}</>,
            <>{"Process, socket, health и ready проверяются отдельно."}</>,
            <>{"Симптом выбирает следующий диагностический шаг."}</>,
            <>{"Wrong cwd не лечится случайным PYTHONPATH."}</>,
            <>{"Ready 503 направляет к database dependency."}</>,
            <>{"Чистая репетиция выявляет скрытые предположения автора."}</>,
          ]}
        />

        <div className="lesson-practice-steps">
          <h3>{"Артефакт"}</h3>
          <p>{"Обновлён `docs/runbook-linux.md` и сохранён проверяемый результат занятия."}</p>
          <h3>{"Проверка сбоя"}</h3>
          <p>{"Есть минимум один намеренно созданный ошибочный сценарий и объяснение причины по наблюдаемым данным."}</p>
          <h3>{"Git"}</h3>
          <p>{"Изменение оформлено отдельным commit с узким техническим смыслом."}</p>
        </div>

        <PracticeCta text={"Создайте `docs/runbook-linux.md`, выполните его в чистой shell-сессии и приложите журнал четырёх неисправностей: symptom → command → observation → fix → verification. Завершите отдельным Git-коммитом `docs: add linux startup runbook`."} />
      </Section>

    </RichLesson>
  );
}
