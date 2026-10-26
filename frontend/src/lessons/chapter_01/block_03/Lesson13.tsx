import {
  BugHunt,
  Callout,
  CodeBlock,
  CompareSolutions,
  Diagram,
  DiagramArrow,
  DiagramFlow,
  DiagramNode,
  LinkedNotes,
  Lead,
  MatchPairs,
  MethodGrid,
  QuizCard,
  RichHero,
  RichLesson,
  Section,
} from "../../shared";

// 13. Первый коммит в Git
export function Lesson13({ module }: { module?: string }) {
  return (
    <RichLesson>
      <RichHero
        chip={module ?? "Блок 3 · Функции и инструменты"}
        title="Первый коммит в Git"
        variant="project"
        intro="Сохраним проверенные файлы в локальной истории и прочитаем содержимое index перед commit."
      />

      <Section number="00" title="Файл уже сохранён, но версии в истории ещё нет">
        <Lead>
          Открой корень основного clone StudyHub и проверь, что рядом лежат main.py и .gitignore. Затем проследим, что Git запишет в первую локальную версию.
        </Lead>
        <LinkedNotes variant="connected" items={[
          {
            title: "Точка старта",
            description: "В корне clone из занятия 12.1 находятся main.py и .gitignore. До записи проверь их через git status и запуск Python 3.12.",
          },
          {
            title: "Новый вопрос",
            description: "Как проверить точные файлы и строки, которые Git сохранит в первой локальной версии?",
          },
          {
            title: "Результат",
            description: "Один локальный commit содержит main.py и .gitignore, его можно найти в истории текущей ветки.",
          },
        ]} />
        <p>
          Представь сохранённый файл как распечатанный лист, а историю Git как журнал версий. Текст на листе уже есть, но запись в журнал появится после выбора файла и commit. У аналогии есть граница: Git хранит данные, а не бумагу. Сегодня работаем с локальной историей.
        </p>
        <p>
          Выполни git status из корня clone, убедись, что main.py и .gitignore на месте, и запусти программу системным Python 3.12. Если clone или файл отсутствует, остановись и восстанови вход занятия 12.1.
        </p>
      </Section>

      <Section number="01" title="Сохранение файла, commit и публикация">
        <Lead>
          Редактор, Git и GitHub отвечают за разные места работы. Разложим действия по результатам, прежде чем запускать команды.
        </Lead>
        <MethodGrid rows={[
          ["Сохранить файл", "Последний текст записан на диск. Python запускает именно сохранённый файл."],
          ["git add", "Текущие данные выбранного пути помещены в index для будущего commit."],
          ["git commit", "Содержимое index записано в локальную историю репозитория."],
          ["git push", "Передаёт локальные commit на удалённый сервер. В этом занятии команда не используется."],
        ]} />
        <p>
          Если мы изменили строку в main.py и сохранили файл, редактор закончил свою работу. Git ещё не получил новую версию автоматически. Команда git add выбирает файл и его содержимое на этот момент. Только после проверки выбранного содержимого git commit записывает локальную версию. Между сохранением и commit остаются отдельные состояния, поэтому команда запуска сама по себе ничего не фиксирует.
        </p>
        <p>
          Commit хранится в этом clone и доступен для проверки без сети.
        </p>
      </Section>

      <Section number="02" title="Рабочая папка, index и локальная история">
        <Lead>
          Между сохранённым файлом и записью в истории есть промежуточная область. Схема показывает, куда переходит выбранное содержимое.
        </Lead>
        <Diagram caption="Выбранный снимок проходит от файлов к локальной истории">
          <DiagramFlow label="Три состояния Git и команды между ними">
            <DiagramNode title="Рабочая папка">
              <p>Сохранённые main.py и .gitignore. Новые файлы пока могут быть untracked, то есть ещё не отслеживаться Git.</p>
            </DiagramNode>
            <DiagramArrow label="git add: выбрать пути" />
            <DiagramNode title="Index, или staging">
              <p>Содержимое выбранных файлов для следующей записи.</p>
            </DiagramNode>
            <DiagramArrow label="git commit: записать" />
            <DiagramNode title="Локальная история">
              <p>Созданный снимок на фактической ветке этого clone.</p>
            </DiagramNode>
          </DiagramFlow>
        </Diagram>
        <p>
          Слева находятся файлы проекта. Index, также называемый staging area, хранит выбранное состояние каждого подготовленного пути. Commit берёт подготовленное содержимое и добавляет запись в локальную историю. Мы можем представить index как лоток с выбранными страницами для следующего выпуска: в нём собран будущий состав, пока выпуск ещё не записан. Но это не просто список названий: в index попадает содержимое файлов на момент git add.
        </p>
        <p>
          Изменение одной области не передвигает автоматически остальные. Сохранение не помещает новый файл в index. Подготовка не создаёт commit. Commit не меняет оригинальный файл и не отправляет его на сервер. Когда мы редактируем файл после git add, новая редакция появляется в рабочей папке, а index сохраняет прежнюю подготовленную редакцию, пока мы не выполним git add снова.
        </p>
        <p>
          До первого commit история пуста. Поэтому git status показывает новые файлы как untracked, а git diff --staged показывает их строки после подготовки в index.
        </p>
        <MatchPairs
          prompt="Сопоставим область Git с тем, что в ней находится."
          leftTitle="Область"
          rightTitle="Состояние данных"
          pairs={[
            { left: "Рабочая папка", right: "Последняя сохранённая редакция файла на диске" },
            { left: "Index, staging", right: "Выбранное содержимое для следующего commit" },
            { left: "Локальная история", right: "Уже записанные на этом компьютере версии" },
          ]}
          explanation="Мы различили сохранённый файл, выбранный снимок и уже созданную локальную запись."
        />
      </Section>

      <Section number="03" title="Status и границы двух diff">
        <Lead>
          Теперь посмотрим, какую пару состояний сравнивает каждая команда. Слово diff означает различие между двумя состояниями.
        </Lead>
        <p>
          Команда git status суммирует состояние путей: какие изменения уже выбраны для следующего commit, какие остались только в рабочей папке, какие файлы Git пока не отслеживает. Это обзор статуса, не просмотр текста строк и не проверка того, запускается ли программа.
        </p>
        <p>
          Обычная команда git diff сравнивает рабочую папку с index. Она помогает заметить несохранённое в будущий снимок изменение уже отслеживаемого файла. Для нового untracked-файла такой diff пуст: файл ещё не находится ни в index, ни в истории, поэтому эта пара состояний не содержит его текста. Наличие нового пути мы смотрим в git status, а его содержимое читаем в редакторе.
        </p>
        <p>
          Команда git diff --staged сравнивает index с последним commit текущей ветки. До первой записи предыдущего commit ещё нет, поэтому подготовленные новые файлы показываются как добавление. Именно этот вывод нужен перед первым commit: он даёт прочитать текст, который Git собирается записать, вместе со списком путей.
        </p>
        <MethodGrid rows={[
          ["git status", "Сводка состояния путей: untracked, staged и незастейдженные изменения."],
          ["git diff", "Рабочая папка сравнена с index; это ещё не просмотр будущего staged-снимка."],
          ["git diff --staged", "Index сравнён с последним commit; видны строки, которые войдут в следующий снимок."],
        ]} />
        <p>
          Допустим, мы подготовили main.py со строкой print('Hello world'), а затем изменили и сохранили её как print('Hello, StudyHub!'). Теперь status покажет изменение в index и более позднюю правку в рабочей папке. git diff --staged всё ещё показывает Hello world, а обычный git diff показывает новую строку. Если в commit должна попасть новая версия, снова запусти git add main.py и проверь staged diff.
        </p>
        <QuizCard
          question="Мы сохранили новую строку в draft.txt уже после git add draft.txt, но не запускали git add повторно. Где находится новая строка?"
          options={["Только в рабочей папке", "В index и рабочей папке", "В локальной истории"]}
          correctIndex={0}
          explanation="git add записал в index содержимое на момент своего запуска. Более поздняя сохранённая строка пока есть только в файле на диске. Для будущего commit её нужно подготовить ещё раз."
        />
        <p>
          Если новый файл ещё не добавлен, git status покажет его как untracked. Обычный git diff сравнивает рабочую папку с index и не раскрывает содержимое такого файла.
        </p>
      </Section>

      <Section number="04" title="Добавляем только выбранные пути">
        <Lead>
          В первом commit будут два файла: main.py и .gitignore. Сначала сохраним и запустим программу, затем подготовим оба пути явно.
        </Lead>
        <p>
          Команда git add принимает имена файлов. Из корня ожидаемого clone команда с main.py и .gitignore помещает в index именно их. Если перед commit есть важная последняя правка, сначала сохраним её и повторно запустим файл тем же способом, который уже проверяли на предыдущем шаге. Иначе мы могли бы сохранить нерабочий вариант, хотя запускаемая версия осталась у нас только в памяти редактора.
        </p>
        <CodeBlock caption="Явно выбираем файлы первого снимка" code={"git add main.py .gitignore"} />
        <p>
          Вызов git add не отправляет файлы и не меняет их имена. Он помещает актуальное сохранённое содержимое этих путей в index. После этого status показывает, что они подготовлены, а staged diff позволяет прочитать сами строки. Если мы отредактируем main.py снова, изменения окажутся по другую сторону index и потребуют отдельной повторной подготовки.
        </p>
        <p>
          Команда git add . выбирает все подходящие изменения в текущем каталоге. Явные пути main.py и .gitignore ограничивают состав записи двумя нужными файлами.
        </p>
        <p>
          Правила в .gitignore помогают не показывать подходящие неотслеживаемые служебные пути. В нашем проекте это как минимум каталог __pycache__/ и файлы *.pyc. Сам .gitignore при этом тоже нужен в истории. Правило игнорирования не удаляет файл с диска и не отменяет содержимое, которое Git уже отслеживает. Поэтому перед созданием первого commit мы всё равно просматриваем фактический список подготовленных путей и содержимое.
        </p>
        <CompareSolutions
          question="В папке проекта есть main.py, .gitignore и незапланированный draft.txt. Какой вариант точнее соответствует первому снимку из двух разрешённых файлов?"
          left={{
            title: "Добавить всё",
            code: "git add .",
            note: "Команда может подготовить и draft.txt, если он не игнорируется.",
          }}
          right={{
            title: "Назвать нужные пути",
            code: "git add main.py .gitignore",
            note: "В index попадают только файлы, которые нужны по плану первого commit.",
          }}
          preferred="right"
          explanation="Мы выбираем два названных файла, чтобы draft.txt не попал в будущую историю. После добавления всё равно сверим пути и строки через status и staged diff."
        />
      </Section>

      <Section number="05" title="Staged diff показывает будущий снимок">
        <Lead>
          Список путей говорит, какие файлы подготовлены. Staged diff показывает, какое содержимое каждого из них попадёт в запись.
        </Lead>
        <p>
          Проследим три состояния на main.py со строкой print('Hello world') и .gitignore с правилами __pycache__/ и *.pyc. В каждом состоянии сначала читаем status, затем смотрим staged diff.
        </p>
        <CodeBlock caption="1. Файлы созданы, но ещё не добавлены" code={"git status\nOn branch main\n\nNo commits yet\n\nUntracked files:\n  (use \"git add <file>...\" to include in what will be committed)\n    .gitignore\n    main.py\n\nnothing added to commit but untracked files present (use \"git add\" to track)\n\ngit diff --staged"} />
        <p>
          После git diff --staged в первом примере нет строк: Git ещё не добавил untracked-файлы в index. Команда git add main.py .gitignore выбирает только эти два пути.
        </p>
        <CodeBlock caption="2. После git add: проверяем подготовленные строки" code={"git status\nOn branch main\n\nNo commits yet\n\nChanges to be committed:\n  (use \"git rm --cached <file>...\" to unstage)\n    new file:   .gitignore\n    new file:   main.py\n\ngit diff --staged\ndiff --git a/.gitignore b/.gitignore\nnew file mode 100644\nindex 0000000..7a60b85\n--- /dev/null\n+++ b/.gitignore\n@@ -0,0 +1,2 @@\n+__pycache__/\n+*.pyc\ndiff --git a/main.py b/main.py\nnew file mode 100644\nindex 0000000..f7d1785\n--- /dev/null\n+++ b/main.py\n@@ -0,0 +1 @@\n+print('Hello world')"} />
        <p>
          Каждый блок начинается с diff --git и называет файл. Заголовок --- /dev/null означает, что прежней версии не было; +++ b/main.py указывает новый файл. Строка @@ -0,0 +1 @@ показывает диапазон изменений, а + отмечает каждую добавленную строку. Для уже существующего файла знак - отмечает удалённые строки. В примере ветка называется main; проверь своё имя командой git branch --show-current. Короткие хэши в твоём выводе будут другими. Если Git открыл pager, нажми q, чтобы вернуться в терминал.
        </p>
        <CodeBlock caption="3. После commit: подготовленных изменений нет" code={"git commit -m \"Add initial StudyHub files\"\n[main (root-commit) 8b7feec] Add initial StudyHub files\n 2 files changed, 3 insertions(+)\n create mode 100644 .gitignore\n create mode 100644 main.py\n\ngit log -1 --oneline\n8b7feec Add initial StudyHub files\n\ngit status\nOn branch main\nnothing to commit, working tree clean\n\ngit diff --staged"} />
        <p>
          До commit мы читаем git diff --staged, чтобы проверить строки в index. После commit git log показывает новую запись, git status сообщает о чистой рабочей папке, а git diff --staged не выводит строк. Index не пуст: его содержимое теперь соответствует новому commit.
        </p>
        <p>
          Найдём одну ошибку в последовательности. Файлы уже staged, но обычный git diff вызван прямо перед commit. Какую команду заменим, чтобы открыть строки index?
        </p>
        <BugHunt
          code={"git add main.py .gitignore\ngit diff\ngit commit -m \"Add first project files\""}
          question="Как исправить проверку перед commit?"
          options={["Заменить git diff на git diff --staged", "Заменить git add на git push", "Удалить git status из истории"]}
          correctIndex={0}
          explanation="Мы проверяем содержимое index, поэтому нужен git diff --staged. git push отправляет commit на сервер и не заменяет просмотр локального снимка."
          fix={"git add main.py .gitignore\ngit diff --staged\ngit commit -m \"Add first project files\""}
        />
        <p>
          Если новый draft.txt случайно попал в index, git rm --cached -- draft.txt убирает его из подготовки, но сохраняет файл на диске. Затем снова проверь git status и git diff --staged.
        </p>
      </Section>

      <Section number="06" title="Автор commit и право войти на GitHub">
        <Lead>
          Git сохраняет имя и email автора внутри commit. Настроим их для этого clone и отделим авторскую подпись от доступа к аккаунту.
        </Lead>
        <p>
          Сначала посмотри текущие значения. Если их нужно задать или исправить, выполни две нижние команды и замени «Ваше имя» на выбранную подпись, а you@example.com на адрес для авторских commit. Параметр --local сохраняет настройки только в этом clone. Не вводи пароль, токен или код входа.
        </p>
        <CodeBlock caption="Посмотреть и настроить автора в текущем clone" code={'git config user.name\ngit config user.email\ngit config --local user.name "Ваше имя"\ngit config --local user.email "you@example.com"'} />
        <p>
          Подпись автора похожа на строку «от кого» в документе: она сообщает имя и адрес, но не открывает аккаунт. GitHub проверяет вход и право записи отдельно.
        </p>
        <p>
          Сообщение commit кратко называет содержимое записи. Для этих файлов подходит Add initial StudyHub files.
        </p>
      </Section>

      <Section number="07" title="Создаём и находим первый локальный commit">
        <Lead>
          Отделим последнюю проверку перед commit от поиска созданной записи.
        </Lead>
        <p>
          Перед commit проверь статус и подготовленные строки. Если main.py менялся после запуска, сохрани его и снова запусти Python 3.12, затем повтори git add и прочитай staged diff. Авторские значения уже проверены, а имя текущей ветки показывает git branch --show-current.
        </p>
        <CodeBlock caption="До commit: проверяем index" code={"git status\ngit branch --show-current\ngit diff --staged"} />
        <p>
          Создай commit только после проверки staged diff. Затем найди его в истории, проверь рабочую папку и убедись, что подготовленных изменений больше нет.
        </p>
        <CodeBlock caption="После commit: проверяем локальную историю" code={"git log -1 --oneline\ngit status\ngit diff --staged"} />
        <Callout tone="info">
          <strong>Короткая опора.</strong> До commit staged diff показывает выбранные строки. После commit log показывает запись, status состояние рабочей папки, а пустой staged diff означает, что index соответствует commit.
        </Callout>
      </Section>

      <Section number="08" title="Что мы будем делать в практике">
        <Lead>
          Практика проведёт от проверки двух исходных файлов до их первой локальной записи.
        </Lead>
        <LinkedNotes variant="connected" items={[
          {
            title: "Проверим clone",
            description: "Найдём main.py и .gitignore, посмотрим status и фактическую ветку, затем запустим программу способом из предыдущего занятия.",
          },
          {
            title: "Проверим снимок",
            description: "Подготовим только два нужных пути и прочитаем status вместе с git diff --staged. Лишние пути и строки остановят commit до исправления.",
          },
          {
            title: "Создадим локальную запись",
            description: "Проверим автора, создадим один commit и найдём его в истории.",
          },
        ]} />
        <p>
          Открой корень clone из занятия 12.1. Если main.py или .gitignore отсутствует, вернись к предыдущему шагу. Подготовь оба файла, проверь их строки и автора, затем создай один commit.
        </p>
        <p>
          Результат виден в трёх местах: main.py запускается, staged diff содержит только main.py и .gitignore, а git log показывает commit с выбранным автором.
        </p>
      </Section>
    </RichLesson>
  );
}
