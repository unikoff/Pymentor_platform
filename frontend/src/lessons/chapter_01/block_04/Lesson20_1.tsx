import {
  Callout,
  CodeBlock,
  Lead,
  LinkedNotes,
  MatchPairs,
  QuizCard,
  RecallCard,
  RichHero,
  RichLesson,
  Section,
} from "../../shared";

// 20.1. Проверяем чистую копию
export function Lesson20_1({ module }: { module?: string }) {
  return (
    <RichLesson>
      <RichHero
        chip={module ?? "Блок 4 · Собираем свой Planner"}
        title="Проверяем чистую копию"
        intro="Мы завершаем главу передачей уже собранного Planner. Сначала установим, какая версия опубликована, затем получим её отдельно и проверим по README."
        variant="project"
      />

      <Section number="00" title="От готового Planner к проверяемой передаче">
        <Lead>
          Нас ждёт работающий Planner с подготовленным README. Сверим фактическую папку и публикацию, чтобы установить, какую версию получит следующий человек.
        </Lead>
        <LinkedNotes
          variant="connected"
          items={[
            {
              title: "Точка старта",
              description: "Основной каталог StudyHub и ожидаемая опубликованная версия после полной проверки Planner.",
            },
            {
              title: "Новый вопрос",
              description: "Совпадают ли опубликованный commit, файлы clone, инструкция запуска и поведение программы?",
            },
            {
              title: "Результат",
              description: "Независимая копия поможет проверить программу и показать границы этой проверки.",
            },
          ]}
        />
        <p>
          Раньше мы уже получали clone. Теперь связываем его файлы с точным опубликованным commit, выполняем README и проверяем возможности собранного Planner. Отсутствующую публикацию не подменяем более поздней версией общего репозитория.
        </p>
        <p>
          Опираемся на результат предыдущего занятия: собственный Planner с проверенными командами, README и опубликованным commit. Если публикации или проверенного запуска ещё нет, сначала завершаем этот шаг. Проверка чужой копии не исправит пропущенный <code>push</code>.
        </p>
      </Section>

      <Section number="01" title="Выбираем именно опубликованную версию">
        <Lead>
          Есть три состояния проекта: файл на диске, локальный commit и опубликованный commit. Clone получит опубликованное состояние; определим его точно.
        </Lead>
        <p>
          <code>origin</code> обычно называют удалённый репозиторий, но его имя может отличаться. Ветка указывает на commit. <code style={{ whiteSpace: "nowrap" }}>git remote -v</code> показывает имена и адреса для получения и отправки, <code style={{ whiteSpace: "nowrap" }}>git branch --show-current</code> имя ветки, <code style={{ whiteSpace: "nowrap" }}>git rev-parse HEAD</code> полный ID локального commit, а <code style={{ whiteSpace: "nowrap" }}>git status --short</code> изменения, ещё не вошедшие в commit.
        </p>
        <CodeBlock
          caption="Сверяем источник и состояние основной папки"
          code={"git remote -v\ngit branch --show-current\ngit rev-parse HEAD\ngit status --short"}
        />
        <p>
          Ветка похожа на закладку: она перемещается после нового commit, а полный ID определяет конкретную версию. Если поправить README без commit и push, получатель увидит старую строку даже при одинаковом имени ветки.
        </p>
        <MatchPairs
          prompt="Сопоставим каждую команду с тем, какой вопрос она проясняет."
          leftTitle="Команда"
          rightTitle="Что узнаём"
          pairs={[
            { left: "git remote -v", right: "Адрес сохранённого источника" },
            { left: "git branch --show-current", right: "Имя выбранной ветки" },
            { left: "git rev-parse HEAD", right: "Полный ID текущего commit" },
            { left: "git status --short", right: "Местные изменения в этой папке" },
          ]}
          explanation="Мы читаем сигналы вместе. Только адрес, ветка и опубликованный commit определяют, какой проект получим; status отдельно показывает несохранённую работу."
        />
        <p>
          Выберите в выводе адрес получения нужного репозитория и имя remote рядом с ним. Для remote с именем <code>origin</code> команда <code>git fetch origin</code> обновляет сведения об удалённых ветках без изменения рабочих файлов. Если имя другое, подставьте его вместо <code>origin</code> во всех командах ниже. Вместо <code>main</code> подставьте свою ветку. Только после успешного fetch запись <code>origin/main</code> отражает полученную вершину этой ветки.
        </p>
        <CodeBlock
          caption="Сравнение локальной и опубликованной версий для ветки main (замените main своей веткой)"
          code={"git fetch origin\ngit rev-parse HEAD\ngit rev-parse origin/main\ngit status --short"}
        />
        <p>
          Сравните полные ID: равные означают, что <code>HEAD</code> совпал с вершиной опубликованной ветки на момент успешного fetch. При ошибке fetch, отсутствии ветки или разных ID публикация пока не подтверждена. Пустой <code>status</code> сам по себе не доказывает push. Если есть изменения, <code>git diff</code> покажет неподготовленные, а <code style={{ whiteSpace: "nowrap" }}>git diff --cached</code> подготовленные к commit изменения; новые файлы видны в <code>status</code>. Сверьте, что проверенные код и README входят именно в опубликованный commit: локальная правка в clone не попадёт.
        </p>
        <QuizCard
          question="Какой набор позволяет точно назвать версию, которую мы передаём?"
          options={[
            "Имя папки и наличие main.py",
            "Название ветки без commit ID",
            "Свой remote, опубликованная ветка и полный ID checkpoint",
          ]}
          correctIndex={2}
          explanation="Мы фиксируем источник, линию и конкретное опубликованное состояние. Snapshot 383c212b служит функциональным эталоном, а не заменой личного checkpoint после занятия."
        />
      </Section>

      <Section number="02" title="Clone отделяет публикацию от рабочей папки">
        <p>
          Clone получает опубликованные файлы и историю без незакоммиченных и игнорируемых данных. Проверим их установленным Python 3.12, без виртуальной среды и сторонних пакетов.
        </p>
        <p>
          <code>git clone</code> создаёт отдельную папку с историей; <code>git init</code> только начинает новый репозиторий. В основной папке убедитесь, что знаете опубликованный ID, а соседнее имя <code>studyhub-check</code> свободно. Опция <code>--branch</code> выбирает нужную ветку.
        </p>
        <p><strong>Пример PowerShell для свободной папки:</strong> каждая команда начинается с новой строки; на узком экране она может переноситься только визуально.</p>
        <pre style={{ whiteSpace: "pre-wrap", overflowWrap: "anywhere" }}><code>{"$remote = git remote get-url origin\n$branch = git branch --show-current\ngit clone --branch $branch $remote ..\\studyhub-check"}</code></pre>
        <p>Здесь показан PowerShell для remote <code>origin</code>. Если ваш remote называется иначе, замените <code>origin</code> его именем и используйте тот же источник, который проверили через fetch.</p>
        <p>
          Перейдите в новый каталог командой <code>cd ..\studyhub-check</code>. Команда <code>pwd</code> покажет его полный путь. Найдите <code>main.py</code>, README и <code>.gitignore</code>; проверьте <code style={{ whiteSpace: "nowrap" }}>git remote -v</code>, имя ветки, <code style={{ whiteSpace: "nowrap" }}>git rev-parse HEAD</code> и <code style={{ whiteSpace: "nowrap" }}>git status --short</code>. Hash должен совпасть с опубликованным из §01, а status быть пустым. Если за время clone ветка сдвинулась, заново выясните опубликованный ID. Если папка уже есть, выберите другое свободное имя: чужие данные не удаляем.
        </p>
        <p>
          Путь, источник и версию сверяем до запуска; затем выполняем README именно в clone.
        </p>
        <LinkedNotes variant="connected" items={[
          { title: "Основной StudyHub", description: "Устанавливаем, какой commit опубликован." },
          { title: "Независимый clone", description: "Получаем этот commit отдельно и сверяем его ID." },
          { title: "Запуск по README", description: "Проверяем версию Python и запускаем Planner в копии." },
          { title: "Результат проверки", description: "Сопоставляем поведение и файлы, записываем версию и пределы проверки." },
        ]} />
        <p>
          Этот порядок не синхронизирует папки автоматически. Исправление делаем в основном проекте, публикуем его и получаем новую независимую копию.
        </p>
      </Section>

      <Section number="03" title="README выполняем буквально">
        <p>
          README должен позволять повторить запуск без подсказок автора. Запускайте Planner <strong>из clone</strong> по написанной инструкции, а не по памяти.
        </p>
        <p>
          Сначала в терминале вводят <strong>системную команду</strong> запуска Python. После появления меню вводят <strong>команду Planner</strong>, например <code>list</code>. Ошибка «не найден main.py» означает проблему пути или запуска; «неизвестная команда» выдаёт уже запущенный Planner.
        </p>
        <MatchPairs
          prompt="Где вводить каждую строку? Сначала различите терминал системы и запущенный Planner."
          pairs={[
            { left: "py -3.12 --version", right: "Системный терминал: проверка Python" },
            { left: "py -3.12 main.py", right: "Системный терминал: запуск файла" },
            { left: "list", right: "Меню Planner: просмотр задач" },
            { left: "exit", right: "Меню Planner: завершение цикла" },
          ]}
          explanation="После запуска программа читает свои команды. Версия Python и путь проверяются до появления меню."
        />
        <p>
          Windows README может указывать <code style={{ whiteSpace: "nowrap" }}>py -3.12 main.py</code>. Launcher <code>py</code> с опцией <code>-3.12</code> выбирает Python 3.12. Проверьте его наличие командой <code style={{ whiteSpace: "nowrap" }}>py --version</code>, нужную версию через <code style={{ whiteSpace: "nowrap" }}>py -3.12 --version</code>. Если README использует <code style={{ whiteSpace: "nowrap" }}>python main.py</code>, проверьте <code style={{ whiteSpace: "nowrap" }}>python --version</code>: это может быть другой Python.
        </p>
        <CodeBlock
          caption="Windows-пример, только если именно такая команда записана в вашем README"
          code={"py --version\npy -3.12 --version\npy -3.12 main.py"}
        />
        <p>
          README должен объяснять получение проекта, Python 3.12, запуск и семь команд. В <code>.gitignore</code> нужны <code>__pycache__/</code> и <code>*.pyc</code>. При ошибке запишите сообщение. Успех с другой командой помогает диагностике, но не подтверждает README.
        </p>
        <Callout tone="info">
          Мы проверяем README в том же clone, где запускаем Planner. Другая папка или уже настроенная среда могут скрыть ошибку инструкции.
        </Callout>
      </Section>

      <Section number="04" title="Проверяем поведение и новый запуск">
        <p>
          Регрессия означает повторную проверку знакомого поведения после изменения. Записывайте четыре колонки: <strong>ввод → ожидание → наблюдение → вывод</strong>. Наблюдением служит реальный ответ Planner из clone.
        </p>
        <p>
          Разберём учебный пример с двумя задачами «Читать API» (приоритет 2) и «Читать SQL» (приоритет 5). Если обе открыты, <code>stats</code> показывает всего 2, выполнено 0, осталось 2. Поиск по слову «читать» без учёта регистра найдёт обе записи в исходном порядке, но не удалит их из <code>tasks</code>. Если дважды выполнить <code>done</code> для второй, она останется выполненной, а сводка будет 2/1/1 и 50.0%. Повторный <code>done</code> не прибавляет новую выполненную задачу.
        </p>
        <LinkedNotes variant="connected" items={[
          { title: "После двух add", description: "Всего 2, выполнено 0, осталось 2." },
          { title: "После done второй записи", description: "Всего 2, выполнено 1, осталось 1: 50.0%." },
          { title: "После повторного done", description: "Сводка не изменилась: задача уже выполнена." },
          { title: "После search по слову «читать»", description: "Обе исходные записи остаются в list." },
        ]} />
        <p>
          Всегда выполняется <code>total = completed + left</code>. Счёт вызовов <code>done</code> вместо состояния записей нарушит результат. В самостоятельной проверке возьмите <strong>другие названия</strong> и запишите свои наблюдения.
        </p>
        <CodeBlock
          caption="Короткая трасса для самостоятельного сверения (названия и ответы на приглашения выберите сами)"
          code={"list\nstats\nadd\nlist\nadd\nlist\nfind\nsearch\ndone\ndone\nstats\nadd\nstats\nexit"}
        />
        <p>
          На самостоятельном маршруте до успешного <code>add</code> попробуйте пустое и состоящее из пробелов название, текстовый приоритет, 0 и 6; проверьте допустимые границы 1 и 5. Задача не должна появиться частично. Для <code>find</code> и <code>done</code> проверьте текстовый, нулевой и отсутствующий id. В <code>search</code> сравните русский и латинский фрагмент, разные регистры, пустой запрос и отсутствие совпадений. После двух успешных добавлений отметьте выполненной вторую задачу, повторите <code>done</code> и добавьте третью: ожидаем 3/1/2 и 33.3%. Команды выше показывают порядок, а ответы на приглашения вы вводите отдельно.
        </p>
        <RecallCard
          question="Вы вышли через exit, затем снова запустили main.py. Что покажут list и stats? Что при этом произошло с файлами Git?"
          hint="Один список tasks создаётся внутри run() для каждого нового процесса."
          answer="Новый процесс создаёт пустой tasks: list пуст, stats показывает 0/0/0 и 0.0%. Файлы опубликованного commit при этом остаются теми же. Для постоянного хранения понадобился бы отдельный механизм, которого в B ещё нет."
        />
        <p>
          <code>exit</code> завершает приложение. При следующем запуске список создаётся заново, словно записи со стираемой доски; опубликованные файлы не исчезают. Повторите <code>list</code> и <code>stats</code> в новом процессе.
        </p>
      </Section>

      <Section number="05" title="Сверяем состав проекта с его договором">
        <p>
          Ответ меню не проверяет интерфейс функций: имя, аргументы и результат. Меню может вывести «50.0%» само, хотя <code>completion_percent</code> ошибочно принимает два числа вместо одного словаря. Нужны и меню, и прямой вызов.
        </p>
        <LinkedNotes variant="connected" items={[
          { title: "Меню в run()", description: "Создаёт tasks до цикла и выбирает действие по команде." },
          { title: "Обработчик команды", description: "Для add, find, done и search читает ввод и вызывает операцию с тем же tasks." },
          { title: "Операция и результат", description: "Работают с текущими задачами; ветка stats находится непосредственно в run()." },
        ]} />
        <p>
          <code>run()</code> вызывают один раз внизу <code>main.py</code>. Он создаёт <code>tasks</code> <strong>до</strong> цикла <code>while</code> и передаёт его обработчикам <code>handle_*</code>. Новый список на каждой итерации терял бы предыдущие задачи. Список локален для <code>run()</code> и снаружи напрямую недоступен.
        </p>
        <LinkedNotes variant="connected" items={[
          { title: "Создание и работа с задачами", description: "create_task, normalize_title, get_next_id, add_task, find_task, mark_task_done, search_tasks" },
          { title: "Проверка ввода", description: "read_title, read_priority, read_task_id" },
          { title: "Расчёт и вывод", description: "build_statistics, completion_percent, calculate_study_minutes, format_task, show_menu, show_tasks" },
          { title: "Действия меню и цикл", description: "handle_add, handle_find, handle_done, handle_search, run" },
        ]} />
        <p>
          В проекте остаётся 21 перечисленная функция с уже изученными обязанностями. Все записи содержат ровно <code>id</code>, <code>title</code>, <code>priority</code>, <code>is_done</code>. Семь команд остаются <code>add</code>, <code>list</code>, <code>find</code>, <code>done</code>, <code>search</code>, <code>stats</code>, <code>exit</code>. Команда <code>stats</code> обрабатывается прямо внутри <code>run()</code>, постоянный <code>handle_stats</code> не нужен. <code>format_task</code> возвращает строку и не меняет задачу.
        </p>
        <p>
          Для прямой проверки используем диагностический флаг <code>-i</code>. Запуск <code>py -3.12 -i main.py</code> сначала выполняет программу, включая вызов <code>run()</code>. В меню набираем <code>exit</code>, после чего Python показывает приглашение <code>&gt;&gt;&gt;</code>. Теперь можно обращаться к определённым в файле функциям. Это <strong>не строки для main.py</strong>. Чтобы закрыть сам Python, у приглашения <code>&gt;&gt;&gt;</code> введите <code>exit()</code>.
        </p>
        <CodeBlock
          caption="В PowerShell в каталоге clone, если README запускает Python через py"
          code={"py -3.12 -i main.py"}
        />
        <Callout tone="info">
          Вызовы ниже вводят по одному после <code>&gt;&gt;&gt;</code>. <code>build_statistics</code> принимает список и возвращает словарь с тремя ключами; <code>completion_percent</code> принимает <strong>один такой словарь</strong> и возвращает число. Пустой набор должен давать 0.0 без деления на ноль. Если в README выбрана другая команда Python, используйте её интерпретатор с добавленным флагом <code>-i</code>.
        </Callout>
        <p><strong>Прямые вызовы у приглашения Python после выхода из меню:</strong></p>
        <p>На узком экране длинная строка может визуально переноситься. Вводите каждый вызов целиком, без дополнительного нажатия Enter внутри него.</p>
        <pre style={{ whiteSpace: "pre-wrap", overflowWrap: "anywhere" }}><code>{'build_statistics([])\n# {"total": 0, "completed": 0, "left": 0}\ncompletion_percent(build_statistics([]))\n# 0.0\ncompletion_percent({"total": 3, "completed": 1, "left": 2})\n# 33.3\nget_next_id([])\n# 1\nget_next_id([{"id": 10}, {"id": 3}, {"id": 20}])\n# 21'}</code></pre>
        <p>
          Новый id берут после максимального, даже если записи стоят не по порядку; <code>get_next_id</code> не меняет список. <code>find_task</code> возвращает найденный словарь или <code>None</code>. <code>mark_task_done</code> меняет нужный <code>is_done</code> и возвращает булев результат.
        </p>
        <QuizCard
          question="Меню stats вывело 50.0%, но completion_percent(словарь) выдаёт ошибку числа аргументов. Что это значит?"
          options={[
            "Интерфейс нарушен",
            "Достаточно верного меню",
            "Нужен новый обработчик",
          ]}
          correctIndex={0}
          explanation="Интерфейс функции проверяем независимо от экрана: словарь из build_statistics должен подходить completion_percent без дополнительных аргументов."
        />
      </Section>

      <Section number="06" title="Исправляем только найденное расхождение">
        <p>
          Если в clone нет правки, сравните опубликованный hash и локальный <code>HEAD</code>. Если вручную запуск удаётся, но README ошибается, исправляйте инструкцию. Если повторный <code>done</code> увеличивает completed, проверяйте изменение задачи и статистику.
        </p>
        <MatchPairs
          prompt="Выберите первую проверку по наблюдаемому симптому."
          pairs={[
            { left: "В clone не видно опубликованной правки", right: "Сравнить HEAD и origin/ветка после fetch" },
            { left: "Команда README не запускает рабочий файл", right: "Проверить путь, интерпретатор и текст инструкции" },
            { left: "Повторный done меняет число выполненных", right: "Проследить mark_task_done и расчёт статистики" },
          ]}
          explanation="Сначала находим источник несовпадения, затем меняем только затронутую часть."
        />
        <p>
          Исправление выполняем <strong>в основном каталоге</strong>. Повторяем проваленный шаг и ближайший успешный шаг, сверяем README, затем проверяем <code>git status</code>, <code>git diff</code> и <code style={{ whiteSpace: "nowrap" }}>git diff --cached</code>. При действительном изменении готовим commit и публикуем его по знакомому маршруту. После push снова сравниваем хеши выбранной ветки через успешный fetch.
        </p>
        <p>
          Для повторной независимой проверки создаём <strong>другой свободный clone</strong> исправленной ветки и сравниваем его полный ID с опубликованным. Повторяем затронутый сценарий и ближайшую связанную проверку, затем завершаем пропущенные шаги. Старый каталог не удаляем и не сбрасываем. Если дефектов нет, фиксируем «изменений нет», commit не создаём. Наше подтверждение означает воспроизводимость на проверенной машине с известной версией Python, а не обещание работы на любой системе.
        </p>
        <RecallCard
          question="В основном каталоге и clone разные результаты. Почему нельзя сразу исправить только clone и назвать передачу успешной?"
          hint="Подумайте, какую версию получит следующий человек по URL."
          answer="Исправленный только в clone файл не опубликован. Нужно исправить основной проект, проверить изменение, отправить commit и получить новый независимый clone с тем же опубликованным hash."
        />
      </Section>

      <Section number="07" title="Что мы будем делать в практике">
        <p>
          В практике проверим, сможет ли другой человек получить и запустить ваш проект.
        </p>
        <LinkedNotes variant="connected" items={[
          { title: "Публикация", description: "Проверим опубликованную версию и получим чистую копию." },
          { title: "Проверка", description: "Запустим проект по инструкции и проверим его работу." },
          { title: "Передача", description: "Исправим найденные ошибки и подготовим сведения для получателя." },
        ]} />
      </Section>
    </RichLesson>
  );
}
