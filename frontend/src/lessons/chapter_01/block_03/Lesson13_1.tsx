import {
  BugHunt,
  Callout,
  Diagram,
  DiagramArrow,
  DiagramFlow,
  DiagramNode,
  FillBlank,
  KeyTakeaways,
  Lead,
  LinkedNotes,
  MatchPairs,
  QuizCard,
  RichHero,
  RichLesson,
  Section,
  TerminalDemo,
  TrueFalse,
  TypeCard,
  TypeCards,
} from "../../shared";

// 13.1. Отправляем код на GitHub
export function Lesson13_1({ module }: { module?: string }) {
  return (
    <RichLesson>
      <RichHero
        variant="project"
        chip={module ?? "Блок 3 · Функции и инструменты"}
        title="Отправляем код на GitHub"
        intro="Опубликуем существующий локальный commit и проверим, что на GitHub появилась именно эта версия проекта."
      />

      <Section number="00" title="От локальной истории к серверной копии">
        <Lead>
          После создания проекта и первого локального commit у нас должен быть собственный clone StudyHub.
          Это ожидаемая подготовка, а не доказательство того, что файлы уже готовы. Проверим её, затем опубликуем
          существующий commit в ветке main на GitHub.
        </Lead>
        <LinkedNotes
          variant="connected"
          items={[
            {
              title: "Точка старта",
              description: "Ожидаем main.py, .gitignore и один локальный commit в своём clone. Сначала проверим файлы, origin и HEAD.",
            },
            {
              title: "Новый вопрос",
              description: "Как безопасно направить имеющийся commit в origin/main, не создав другой commit?",
            },
            {
              title: "Результат",
              description: "В origin/main окажется тот же commit. Проверим адрес, ветку main, полный ID и оба файла.",
            },
          ]}
        />
        <p>
          Локальный commit даёт точку сравнения с серверной историей. Мы сначала выясним направление передачи, а после
          публикации проверим GitHub по фактическим данным проекта. Если собственного clone, нужного commit или пустого
          удалённого репозитория ещё нет, вернёмся к соответствующему шагу 12.1 или 13 и отложим push.
        </p>
      </Section>

      <Section number="01" title="Три разных состояния проекта">
        <p>
          Сначала разделим сохранённый файл, commit в локальной истории и копию истории на GitHub. Когда мы нажимаем Save в
          редакторе, меняется файл на диске. Commit фиксирует выбранное состояние в истории Git на нашем компьютере. Push
          передаёт уже созданную историю на выбранный сервер и обновляет там ветку. Это три отдельные границы.
        </p>
        <p>
          Представим рабочую тетрадь. Исправленная страница лежит на столе, запись в журнале хранит выбранный снимок, а
          отправленная копия находится в другом месте. Если мы исправили страницу после записи в журнал, старая запись не
          меняется автоматически. Так же и незакоммиченная правка не входит в уже созданный commit, а push не добавляет в
          историю правки, которых в commit не было.
        </p>
        <Callout tone="info">
          <code>HEAD</code> означает текущую точку локальной истории Git. Когда мы на обычной ветке, HEAD обозначает её
          последний commit. Запомните это имя: именно его полный ID сравним с серверной копией.
        </Callout>
        <Diagram caption="Путь уже созданного commit до GitHub">
          <DiagramFlow label="Локальный commit отправляется в удалённую ветку">
            <DiagramNode title="Локальная ветка">
              <p>HEAD указывает на созданный commit</p>
              <code>main.py + .gitignore</code>
            </DiagramNode>
            <DiagramArrow label="push: remote и направление ветки" />
            <DiagramNode title="Ветка на GitHub" shape="database">
              <p>Сервер получает эту историю</p>
              <code>тот же commit</code>
            </DiagramNode>
          </DiagramFlow>
        </Diagram>
        <p>
          Слова «commit уже есть» важны: в этом занятии мы не готовим файлы и не создаём снимок. Мы отправляем имеющийся
          снимок. Это похоже на отправку запечатанной версии: после нового изменения потребуется новый commit, но сейчас
          наша цель только проверить доставку уже выбранной версии.
        </p>
        <QuizCard
          question="Файл сохранён, локальный commit создан, но push ещё не выполняли. Где сейчас подтверждён этот commit?"
          options={[
            "Только в локальной истории",
            "Уже на GitHub, потому что git status чистый",
            "В новом commit, который Git создаст при push",
          ]}
          correctIndex={0}
          explanation="Сохранение и локальная история не подтверждают серверную копию. Push передаёт существующую историю, а не создаёт новый commit."
        />
        <Callout tone="info">
          Пустой git status сообщает только об отсутствии локальных незакоммиченных изменений. Он не показывает, совпадает
          ли GitHub с нашим HEAD.
        </Callout>
      </Section>

      <Section number="02" title="Проверяем адрес, ветку и commit">
        <p>
          Проверим <strong>корень текущего clone</strong>, адрес назначения, локальную ветку и её последний commit.
          <code>git rev-parse --show-toplevel</code> показывает корневую папку Git-проекта. Сверяем, что это именно
          созданный ранее StudyHub, а не случайная папка со своим репозиторием.
        </p>
        <p>
          <code>origin</code> - короткое имя для сохранённого адреса удалённого репозитория. Команда
          <code>git remote -v</code> показывает отдельно адрес получения (fetch) и отправки (push). Проверяем
          именно <strong>push URL</strong>: владелец и название репозитория должны совпасть с нашим пустым GitHub-проектом.
        </p>
        <TerminalDemo
          title="проверка перед отправкой"
          lines={[
            { cmd: "git rev-parse --show-toplevel" },
            { out: "C:/Projects/studyhub" },
            { cmd: "git status --short" },
            { out: "(пустой вывод: незакоммиченных изменений нет)" },
            { cmd: "git branch --show-current" },
            { out: "main" },
            { cmd: "git remote -v" },
            { out: "origin  https://github.com/example-user/studyhub.git (fetch)" },
            { out: "origin  https://github.com/example-user/studyhub.git (push)" },
            { cmd: "git log -1 --format=%H" },
            { out: "a14c9e2b7f048c6124d03fae8b6c91d08b4e5c71" },
          ]}
        />
        <p>
          <code>git status --short</code> показывает незакоммиченные изменения (пустой вывод ожидаем здесь),
          <code>git branch --show-current</code> называет текущую ветку, а <code>git log -1 --format=%H</code>
          выдаёт полный ID commit в <code>HEAD</code>. В примере путь, владелец example-user и ID условные.
        </p>
        <TerminalDemo
          title="проверяем именно содержимое сохранённого commit"
          lines={[
            { cmd: "git show HEAD:main.py" },
            { out: "print(\"Hello world\")" },
            { cmd: "git show HEAD:.gitignore" },
            { out: "__pycache__/" },
            { out: "*.pyc" },
            { cmd: "git ls-remote origin" },
            { out: "(до первого push в пустой репозиторий ссылок ещё нет)" },
          ]}
        />
        <p>
          <code>git show HEAD:имя_файла</code> читает файл именно из последнего commit, а не из редактора;
          так мы подтверждаем <code>main.py</code> с Hello world и правила <code>__pycache__/</code> и
          <code>*.pyc</code> в <code>.gitignore</code>. Запись в примере показывает ожидаемое содержимое,
          но ваша проверка должна вывести реальные строки собственного проекта. Если Git не находит один из файлов в
          commit, возвращаемся к подготовке предыдущего занятия.
        </p>
        <Callout tone="warn">
          <code>git ls-remote origin</code> запрашивает ссылки удалённого репозитория без изменения его истории.
          Для исходно пустого GitHub-репозитория успешная команда не выводит ссылок. Если появились строки либо произошла
          ошибка доступа, считать remote пустым нельзя; сначала выясним состояние и не выполняем push.
        </Callout>
        <LinkedNotes
          items={[
            { title: "origin", description: "Имя remote в настройках Git. URL под ним указывает фактическое место обмена." },
            { title: "Текущая ветка", description: "Локальная линия commit, которую мы проверили в этом clone." },
            { title: "Полный ID", description: "Точный commit из локального HEAD, с которым затем сравним GitHub." },
          ]}
        />
        <p>
          Цель занятия - опубликовать ветку с именем <code>main</code>. Если сейчас она уже называется main, имя
          не меняем. Если это другая <strong>ещё не опубликованная</strong> ветка, сначала убеждаемся через
          <code>git branch --list main</code>, что локальное имя main свободно, и по результату
          <code>git ls-remote origin</code>, что remote по-прежнему пуст. Только тогда <code>git branch -m main</code>
          переименует текущую локальную ветку, не меняя commit; после команды повторяем <code>git branch --show-current</code>.
        </p>
        <Callout tone="warn">
          Если имя main уже занято другой локальной веткой, текущая ветка опубликована, remote непуст или имя ветки
          вообще не выводится, останавливаемся и выясняем историю. Не применяем git branch -M, удаление веток или force push.
        </Callout>
        <QuizCard
          question="Как поступить, если наша текущая ветка называется master, ещё не публиковалась, имя main свободно, а собственный remote пуст?"
          options={[
            "После проверки выполнить git branch -m main и убедиться, что ветка стала main",
            "Отправить master и считать цель origin/main достигнутой",
            "Использовать git branch -M main без проверки истории",
          ]}
          correctIndex={0}
          explanation="При выполнении всех условий можно переименовать неопубликованную локальную ветку. Название отправляемой ветки в этом уроке должно быть main."
        />
        <MatchPairs
          prompt="Сопоставим команду с тем фактом, который она показывает."
          leftTitle="Команда"
          rightTitle="Результат"
          pairs={[
            { left: "git remote -v", right: "URL remote для получения и отправки" },
            { left: "git branch --show-current", right: "Имя активной локальной ветки" },
            { left: "git log -1 --format=%H", right: "Полный ID текущего верхнего commit" },
            { left: "git status --short", right: "Незакоммиченные локальные изменения" },
          ]}
          explanation="Теперь отдельно известны адрес назначения, локальная ветка, commit и состояние рабочей папки."
        />
        <p>
          Если URL не принадлежит нашему пустому репозиторию, мы останавливаемся. Если в status видны неожиданные изменения,
          сначала выясняем, откуда они взялись. Push передаёт commit, а не каждую строку из открытой папки, но отправлять
          неизвестную историю или в неизвестное место нельзя.
        </p>
      </Section>

      <Section number="03" title="Первый push и направление ветки">
        <p>
          К этому шагу уже подтверждены собственный пустой remote <code>origin</code>, существующий commit
          и локальная ветка <code>main</code>. Теперь явно зададим направление: <code>git push -u origin main</code>.
          Команда передаёт уже созданную локальную историю main в ветку main удалённого origin.
        </p>
        <Callout tone="info">
          <strong>Как читать команду:</strong> push - отправить commit; -u (сокращение --set-upstream) - запомнить
          связь веток после успеха; origin - проверенный адрес; main - локальная ветка и одноимённая ветка назначения.
        </Callout>
        <p>
          Слово <code>upstream</code> обозначает связь локальной ветки с удалённой, которую Git сможет учитывать
          в следующих обменах. После успешного push <code>git branch -vv</code> покажет рядом с локальной main
          её отслеживаемую ветку <code>[origin/main]</code>. Это настройка связи, а не второй commit.
        </p>
        <p>
          Если выполнить просто <code>git push</code> до установки upstream, Git может не знать, куда отправлять
          ветку. Поэтому первый push указывает адрес и имя явно. Он не включает случайные несохранённые в commit строки.
        </p>
        <FillBlank
          prompt="Мы проверили: локальная ветка main, origin указывает на собственный пустой репозиторий. Какое имя отправим после origin?"
          before="git push -u origin "
          after=""
          options={["main", "origin", "--force"]}
          answer="main"
          explanation="Цель этого маршрута - main на GitHub. До команды мы убедились, что локальная ветка тоже называется main."
        />
        <TerminalDemo
          title="схематичный успешный ответ Git"
          lines={[
            { cmd: "git push -u origin main" },
            { out: "Enumerating objects: 3, done." },
            { out: " * [new branch]      main -> main" },
            { out: "branch 'main' set up to track 'origin/main'." },
            { cmd: "git branch -vv" },
            { out: "* main a14c9e2 [origin/main] First commit" },
          ]}
        />
        <p>
          Вывод Git сообщает об отправке, а страница GitHub подтверждает опубликованную версию. Если push отклонён или
          remote неожиданно содержит другую историю, сначала выясняем причину.
        </p>
        <Callout tone="info">
          Для справки: <a href="https://git-scm.com/docs/git-push" target="_blank" rel="noreferrer">описание git push в Git</a>{" "}
          и <a href="https://docs.github.com/en/get-started/using-git/pushing-commits-to-a-remote-repository" target="_blank" rel="noreferrer">инструкция GitHub по push</a>.
        </Callout>
      </Section>

      <Section number="04" title="Автор commit, вход и право записи">
        <p>
          На публикации встречаются три разные роли. Автор commit записан в метаданных локального снимка. Аккаунт
          подтверждает сетевой запрос к GitHub. Разрешение на запись определяет, может ли этот аккаунт менять конкретный
          репозиторий. Совпадение этих ролей возможно, но одна не доказывает другую.
        </p>
        <p>
          Это похоже на отправку посылки. Подпись на вложенной записке говорит, кто подготовил содержимое. Документ,
          который предъявили на стойке, указывает, кто сейчас проходит проверку. А правила доступа решают, куда этому
          человеку разрешено положить посылку. Подпись автора не становится паролем от GitHub и не выдаёт право записи.
        </p>
        <TypeCards>
          <TypeCard badge="COMMIT" title="Автор">
            user.name и user.email попадают в сведения о commit. Они не выполняют вход в GitHub.
          </TypeCard>
          <TypeCard badge="HTTPS" title="Аккаунт">
            Git или Git Credential Manager подтверждает учётную запись для сетевой операции через HTTPS, защищённое сетевое соединение.
          </TypeCard>
          <TypeCard badge="REPOSITORY" title="Доступ">
            У вошедшего аккаунта должно быть право записи именно в проверенный репозиторий.
          </TypeCard>
        </TypeCards>
        <p>
          Просмотр публичного commit не даёт права записи. Для нашего private-репозитория GitHub отдельно проверяет
          доступ вошедшего аккаунта; даже привязанный к профилю email автора не заменяет вход.
        </p>
        <p>
          При HTTPS Git Credential Manager может открыть браузер для штатного входа. Следуем системному запросу в своём
          браузере и не включаем секреты в команду, код, текст урока или переписку. У GitHub пароль аккаунта не является
          способом авторизации в командной строке; используем поддерживаемый менеджер учётных данных. Самостоятельно
          создавать токен в этом задании не требуется.
        </p>
        <TrueFalse
          statement="Если имя автора в git log совпало с именем ученика в GitHub, это доказывает, что push выполнен его аккаунтом и у него есть право записи."
          isTrue={false}
          explanation="Git хранит автора в commit отдельно от сетевой авторизации. Доступ проверяется для аккаунта, которым мы вошли, и конкретного remote."
        />
        <p>
          Если окно входа открылось, это ещё не доказывает право записи. Если вошедший аккаунт не может изменять репозиторий,
          GitHub откажет. Тогда проверим, тот ли аккаунт открыт и принадлежит ли ему выбранный private-репозиторий. Не
          переписываем автора существующего commit ради исправления входа и не просим пользователя передавать пароль или
          токен.
        </p>
        <Callout tone="warn">
          Не вставляем access token, пароль, резервный код или содержимое credential manager в терминал, файл проекта,
          скриншот или сообщение. При неожиданном запросе останавливаемся и уточняем штатный способ входа.
        </Callout>
      </Section>

      <Section number="05" title="Ошибки показывают разные границы">
        <p>
          При отказе определяем его источник: ветка/commit на компьютере, адрес remote, сетевой вход,
          право записи или история на сервере. Выбираем безопасную проверку по тексту ошибки.
        </p>
        <Callout tone="info">
          Сообщение <code>src refspec main does not match any</code> означает, что Git не может найти локальный
          источник main для отправки: проверьте <code>git branch --show-current</code> и наличие commit.
          <code>Repository not found</code> может означать опечатку в URL <strong>или</strong> отсутствие доступа
          к private-репозиторию; проверяем и адрес, и аккаунт, которому он виден. Сообщение об отказе записи требует
          проверки прав вошедшего аккаунта.
        </Callout>
        <BugHunt
          code={"$ git push --set-upstream origin main\nremote: Permission to example-user/studyhub.git denied to another-account"}
          question="Какую проверку выполнить первой, если URL проверен, а сообщение называет другой аккаунт?"
          options={[
            "Сверить аккаунт в штатном GitHub-входе и его право записи",
            "Заменить user.name и создать новый commit",
            "Повторить push с --force",
          ]}
          correctIndex={0}
          explanation="Отказ относится к аккаунту или его доступу. Автор commit остаётся сведением о снимке, а force изменил бы риск истории без связи с причиной."
        />
        <p>
          Сообщение <code>non-fast-forward</code> означает, что серверная ветка содержит историю, которой нет в нашей локальной ветке.
          В текущем маршруте remote ожидался пустым, поэтому такой случай означает, что исходное состояние отличается от
          плана. Мы останавливаем push и передаём вопрос на отдельное согласование истории. Не используем pull, merge,
          rebase или force наугад.
        </p>
      </Section>

      <Section number="06" title="Подтверждаем серверную версию">
        <p>
          После push открываем именно свой GitHub-репозиторий и выбираем опубликованную ветку. Сначала сравним полный ID
          commit на странице с ID, который получили из локального log. Затем посмотрим содержимое main.py и .gitignore.
          В задании это Hello world и правила для __pycache__/ и *.pyc, подготовленные в предыдущих шагах.
        </p>
        <figure style={{ width: "100%", maxWidth: "960px", margin: "24px auto" }}>
          <a
            href="https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/managing-branches-in-your-repository/viewing-branches-in-your-repository?apiVersion=2022-11-28"
            target="_blank"
            rel="noreferrer"
            style={{ display: "flex", justifyContent: "center" }}
          >
            <img
              src="https://docs.github.com/assets/cb-36152/images/help/repository/file-tree-view-branch-dropdown-expanded.png"
              alt="Пример GitHub: открыто меню выбора ветки над списком файлов; текущая ветка main, ниже видна другая ветка"
              style={{ display: "block", maxWidth: "100%", height: "auto", borderRadius: "8px" }}
            />
          </a>
          <figcaption style={{ marginTop: "8px" }}>
            <strong>1. Выберем ветку.</strong> В меню над списком файлов выберем ветку из команды push. На снимке показаны
            примерные имена, поэтому сверим свою ветку с именем из команды.
          </figcaption>
        </figure>
        <figure style={{ width: "100%", maxWidth: "960px", margin: "24px auto" }}>
          <a
            href="https://docs.github.com/en/pull-requests/how-tos/commit-changes/troubleshooting-commits"
            target="_blank"
            rel="noreferrer"
            style={{ display: "flex", justifyContent: "center" }}
          >
            <img
              src="https://docs.github.com/assets/cb-48469/images/help/commits/commits-page.png"
              alt="Пример GitHub: над списком файлов показана выбранная ветка main и выделенная ссылка на список commits"
              style={{ display: "block", maxWidth: "100%", height: "auto", borderRadius: "8px" }}
            />
          </a>
          <figcaption style={{ marginTop: "8px" }}>
            <strong>2. Откроем commits.</strong> Нажмём ссылку с количеством commits над списком файлов, затем выберем
            сообщение нужного commit. Это официальные примеры интерфейса GitHub Docs.
          </figcaption>
        </figure>
        <p>
          <strong>3. Найдём полный ID.</strong> На странице выбранного commit найдём адрес вида{" "}
          <code>https://github.com/OWNER/REPOSITORY/commit/FULL_COMMIT_ID</code>. Сравним часть после /commit/ с полным
          ID из git log. В списке commits часто отображается только короткая запись. Открывайте сам commit либо используйте
          отдельную проверку Git ниже: по первым семи символам равенство всей версии установить нельзя.
        </p>
        <TerminalDemo
          title="независимая сверка двух полных ID после успешного push"
          lines={[
            { cmd: "git log -1 --format=%H" },
            { out: "a14c9e2b40d1ef0c512a99563ba9f1c7006d4e22" },
            { cmd: "git ls-remote origin refs/heads/main" },
            { out: "a14c9e2b40d1ef0c512a99563ba9f1c7006d4e22    refs/heads/main" },
          ]}
        />
        <p>
          Первая команда читает полный ID локального HEAD, вторая <strong>запрашивает у origin указатель ветки main</strong>
          без изменения удалённых данных. Сравните все 40 шестнадцатеричных символов слева в обеих строках. Если
          <code>git ls-remote origin refs/heads/main</code> не вывела строку, не смогла подключиться или показала другой ID,
          публикация в origin/main не подтверждена. Не создавайте новый commit для исправления неизвестного расхождения.
        </p>
        <Callout tone="info">
          Одна команда проверяет серверную ссылку, а браузер показывает сам проект. Сверьте оба источника: адрес должен
          вести в ваш репозиторий, на странице должна быть выбрана main, а файлы main.py и .gitignore содержать ожидаемые
          строки. Вывод <code>git status</code> подтверждает лишь состояние локальных файлов.
        </Callout>
        <p>
          Если строка Hello world или правила .gitignore отличаются, проверьте сначала адрес, выбранную ветку и ID.
          Различие означает, что открыта другая версия или исходная подготовка не совпала с планом; исправлять это
          случайным новым commit нельзя.
        </p>
        <MatchPairs
          prompt="Соберём порядок финальной сверки."
          leftTitle="Что сверяем"
          rightTitle="С чем сравниваем"
          pairs={[
            { left: "Адрес страницы", right: "Проверенный push URL remote origin" },
            { left: "Ветка на GitHub", right: "main из git push -u origin main" },
            { left: "Полный commit ID", right: "Локальный HEAD и ответ git ls-remote origin refs/heads/main" },
            { left: "main.py и .gitignore", right: "Ожидаемые файлы после создания проекта и первого локального commit" },
          ]}
          explanation="Только совпадение адреса, ветки, commit и файлов подтверждает передачу именно ожидаемой версии."
        />
        <p>
          В следующем уроке работа продолжится с этим же Hello world-коммитом. Здесь мы проверяем только опубликованную версию.
        </p>
        <Callout tone="info">
          Дополнительная справка: <a href="https://git-scm.com/docs/git-config" target="_blank" rel="noreferrer">поля автора и commit в настройках Git</a> и{" "}
          <a href="https://docs.github.com/en/get-started/git-basics/caching-your-github-credentials-in-git" target="_blank" rel="noreferrer">вход через Git Credential Manager</a>.
        </Callout>
      </Section>

      <Section number="07" title="Что сделаем в практике">
        <p>
          Теперь повторим путь самостоятельно на собственном clone. Каждое действие должно оставить наблюдаемый след:
          вывод команды, подтверждённую ветку или содержимое GitHub. Если проверка не удалась, дальнейшие шаги отложим.
        </p>
        <LinkedNotes
          variant="connected"
          items={[
            { title: "Проверим исходное состояние", description: "Сверим корень clone, два файла в HEAD, push URL, пустой remote и ветку main." },
            { title: "Отправим историю", description: "После проверки выполним один git push -u origin main и прочитаем upstream." },
            { title: "Подтвердим копию", description: "Сверим страницу GitHub, origin/main, полный ID из двух команд и содержимое файлов." },
            { title: "Разберём отказы", description: "На безопасных примерах назовём причину и следующую проверку." },
          ]}
        />
        <p>
          Если clone, адрес, ветка, состав commit или исходная пустота remote не совпадают с проверками, сначала
          уточните состояние. Результат практики: опубликован <strong>именно прежний commit</strong>, без новых файлов,
          нового commit и опасного исправления расхождений командой force.
        </p>
      </Section>

      <KeyTakeaways
        points={[
          <>Save, commit и push меняют разные состояния проекта.</>,
          <>Перед первым push проверяем корень clone, origin, пустой remote, ветку main и содержимое HEAD.</>,
          <>Автор commit, аккаунт входа и право записи являются разными фактами.</>,
          <>После push сверяем origin/main, полный ID локального и удалённого commit и оба файла на GitHub.</>,
        ]}
      />
    </RichLesson>
  );
}
