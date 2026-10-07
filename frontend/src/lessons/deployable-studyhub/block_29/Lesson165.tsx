import { FolderGit2, Terminal } from "lucide-react";
import { BugHunt, Callout, CodeBlock, CodeSequence, CompareSolutions, KeyTakeaways, Lead, MatchPairs, MethodGrid, PracticeCta, QuizCard, RecallCard, RichHero, RichLesson, Section, TerminalDemo, TrueFalse, TypeCard, TypeCards } from "../../shared";
const BLOCK_TITLE = "Блок 29 · Linux, процессы, окружения и логи";

type LessonProps = { module?: string };

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
