import {
  Boxes,
  Cloud,
  Download,
  FileCode,
  GitBranch,
  Hash,
  Keyboard,
  Percent,
  Play,
  Terminal,
  Variable,
  Wrench,
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
  PracticeCta,
  PredictOutput,
  QuizCard,
  RichHero,
  RichLesson,
  Section,
  StepThrough,
  TerminalDemo,
  TypeCard,
  TypeCards,
} from "../shared";

type TheoryBridgeData = { link: string; boundary: string };

const THEORY_BRIDGES: Record<number, TheoryBridgeData> = {
  1: {"link":"Начинаем с нуля: пока достаточно увидеть цепочку «файл → интерпретатор → команды сверху вниз → результат».","boundary":"Редактор, терминал и Git будут введены отдельно; не нужно искать их смысл в первом примере."},
  2: {"link":"Теперь программа уже существует как файл, поэтому различаем редактор, Проводник и терминал: это разные инструменты, а путь — адрес файла.","boundary":"Терминал не заменяет Python и не является языком программирования; он лишь запускает нужный файл."},
  3: {"link":"Когда файл можно запустить, появляется вопрос о безопасной истории изменений: Git хранит версии локально, GitHub — опубликованную копию репозитория.","boundary":"Коммит и отправка на GitHub — не одно действие; важен привычный порядок, а не запоминание всех команд."},
  4: {"link":"После готового вывода программа учится хранить данные под понятными именами: переменная связывает имя с текущим значением.","boundary":"После нового присваивания имя обозначает новое значение; переменная не обязана сохранять первоначальный смысл."},
  5: {"link":"Тип переменной определяет допустимые операции: числа вычисляют, строки хранят текст, а преобразование делает переход явным.","boundary":"Цифры из input() остаются строкой, пока вы сами не превратите их в число; Python не должен угадывать намерение."},
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


// 01. Как Python выполняет программу
export function Lesson01({ module }: { module?: string }) {
  return (
    <RichLesson>
      <RichHero
        chip={module ?? "Блок 1 · Старт и данные"}
        title="Как Python выполняет программу"
        intro="Начнём с самого начала: разберём, кто запускает Python-код, что означает слово «интерпретатор», как читать print() и почему одна пропущенная кавычка может остановить программу."
        tags={[
          { icon: <FileCode size={14} />, label: "первый Python-файл" },
          { icon: <Play size={14} />, label: "код → запуск → результат" },
        ]}
      />
      <TheoryBridge lesson={1} />

      <Section number="01" title="Что произойдёт на первом занятии">
        <Lead>
          Здесь не нужно заранее знать программирование. Мы не будем писать большую программу или использовать
          сложные термины без объяснения. Сначала разберём один короткий путь: от текста в файле до результата на
          экране.
        </Lead>

        <div className="lesson-route">
          <ol>
            <li>
              <strong>Поймём, кто выполняет код:</strong> зачем нужен Python-интерпретатор и что значит
              «интерпретируемый язык».
            </li>
            <li>
              <strong>Запустим первую команду:</strong> соберём традиционную программу{" "}
              <code className="lesson-token">Hello, World!</code>.
            </li>
            <li>
              <strong>Научимся читать одну строку:</strong> разберём{" "}
              <code className="lesson-token">print</code>, скобки, кавычки и комментарии.
            </li>
          </ol>
          <p>
            Все задания будут короткими: восстановить порядок строк, выбрать правильные кавычки, добавить
            закрывающую скобку или исправить одну опечатку.
          </p>
        </div>

        <Callout tone="info">
          Рабочий ритм занятия: <strong>посмотреть → предположить → запустить → изменить одну деталь → проверить</strong>.
        </Callout>
      </Section>

      <Section number="02" title="Кто выполняет Python-код">
        <Lead>
          Файл с кодом похож на рецепт. В рецепте записаны действия, но сам лист бумаги ничего не приготовит.
          Нужен тот, кто прочитает инструкции и выполнит их. Для Python эту роль выполняет{" "}
          <span className="lesson-emphasis">Python-интерпретатор</span>.
        </Lead>

        <TypeCards>
          <TypeCard badge="1" title="Файл с кодом" code={'print("Привет")'}>
            Это текстовая инструкция, сохранённая в файле с расширением <code>.py</code>. Пока файл просто лежит на
            диске, ничего не происходит.
          </TypeCard>
          <TypeCard badge="2" badgeTone="float" title="Интерпретатор" code="python main.py">
            Это установленная на компьютере программа Python. Она открывает файл, разбирает инструкции и начинает
            их выполнять.
          </TypeCard>
          <TypeCard badge="3" badgeTone="str" title="Результат" code="Привет">
            После выполнения в терминале появляется обычный вывод или сообщение о проблеме.
          </TypeCard>
        </TypeCards>

        <div className="lesson-practice-steps">
          <h3>Простая аналогия</h3>
          <p>
            <strong>Код</strong> — рецепт. <strong>Интерпретатор</strong> — повар, который умеет читать этот рецепт.
            <strong> Терминал</strong> — место, где мы видим результат работы.
          </p>

          <h3>Что значит «интерпретируемый язык»</h3>
          <p>
            Когда мы запускаем <code className="lesson-token">python main.py</code>, Python читает сохранённый файл
            и выполняет его инструкции. Для первого месяца достаточно такой модели:{" "}
            <span className="lesson-emphasis">каждый запуск снова передаёт файл интерпретатору</span>.
          </p>

          <h3>Почему компьютер не понимает файл сам</h3>
          <p>
            Компьютер не знает, что означает слово <code>print</code>. Это знает установленный Python. Поэтому без
            интерпретатора файл <code>main.py</code> остаётся обычным текстовым файлом с командами.
          </p>
        </div>

        <div className="execution-example">
          <CodeBlock caption="код внутри main.py" code={'print("Привет из Python")'} />
          <TerminalDemo
            title="интерпретатор выполняет файл"
            lines={[
              { cmd: "python main.py" },
              { out: "Привет из Python" },
            ]}
          />
        </div>

        <Callout>
          Внутри Python есть дополнительные технические шаги, но сейчас они не нужны. Главная модель:
          <strong> файл хранит инструкции, интерпретатор их выполняет, терминал показывает результат</strong>.
        </Callout>
      </Section>

      <Section number="03" title="Первая программа: Hello, World!">
        <Lead>
          У программистов есть традиция начинать знакомство с языком с фразы{" "}
          <code className="lesson-token">Hello, World!</code>. Такая программа ничего не вычисляет, зато сразу
          подтверждает: файл сохранён, Python установлен и запуск работает.
        </Lead>

        <div className="execution-example">
          <CodeBlock caption="main.py" code={'print("Hello, World!")'} />
          <TerminalDemo
            title="первый запуск"
            lines={[
              { cmd: "python main.py" },
              { out: "Hello, World!" },
            ]}
          />
        </div>

        <StepThrough
          code={'print("Hello, World!")'}
          steps={[
            {
              line: 0,
              note: "Python встречает команду print — показать данные на экране.",
              vars: { команда: "print" },
            },
            {
              line: 0,
              note: 'Внутри скобок находится текст "Hello, World!". Кавычки показывают его границы.',
              vars: { текст: '"Hello, World!"' },
            },
            {
              line: 0,
              note: "После выполнения текст появляется в терминале без кавычек.",
              vars: { вывод: "Hello, World!" },
            },
          ]}
        />

        <FillBlank
          prompt="Дополните первую программу."
          before={'print("Hello, '}
          after={'!")'}
          options={["World", "print", "main.py"]}
          answer="World"
          explanation="Мы изменяем только текст внутри кавычек. Команда print и скобки уже готовы."
        />

        <Callout tone="info">
          Кавычки нужны в коде, чтобы обозначить текст. В самом выводе они не появляются.
        </Callout>
      </Section>

      <Section number="04" title="Python идёт сверху вниз">
        <Lead>
          Представьте список дел на бумаге: сначала первый пункт, затем второй, затем третий. В простом Python-файле
          инструкции выполняются так же — <span className="lesson-emphasis">сверху вниз</span>.
        </Lead>

        <StepThrough
          code={'print("Открываем StudyHub")\nprint("Показываем название")\nprint("Завершаем запуск")'}
          steps={[
            {
              line: 0,
              note: "Сначала выполняется верхняя строка.",
              vars: { вывод: "Открываем StudyHub" },
            },
            {
              line: 1,
              note: "Затем Python переходит к следующей строке.",
              vars: { вывод: "Открываем StudyHub ⏎ Показываем название" },
            },
            {
              line: 2,
              note: "После последней строки файл заканчивается, и программа завершает работу.",
              vars: { вывод: "Открываем StudyHub ⏎ Показываем название ⏎ Завершаем запуск" },
            },
          ]}
        />

        <CodeSequence
          title="Восстановите порядок запуска"
          prompt="Соберите программу: сначала начало, затем название проекта, затем завершение."
          pieces={[
            { id: "start", code: 'print("Начинаем запуск")' },
            { id: "name", code: 'print("StudyHub")' },
            { id: "finish", code: 'print("Запуск завершён")' },
          ]}
          correctOrder={["start", "name", "finish"]}
          explanation="Python выполнит строки в том порядке, в котором они стоят в файле."
        />

        <div className="lesson-practice-steps">
          <p>
            Если поменять местами вторую и третью строки, Python не исправит порядок. Он честно покажет результат
            сверху вниз именно так, как записал автор.
          </p>
        </div>
      </Section>

      <Section number="05" title="Как читать print(), скобки и кавычки">
        <Lead>
          Одну строку можно разобрать как простое поручение:{" "}
          <strong>«выполни действие print и передай ему текст внутри скобок»</strong>.
        </Lead>

        <CodeBlock caption="одна команда по частям" code={'print("Привет")'} />

        <div className="lesson-practice-steps">
          <h3><code className="lesson-token">print</code> — действие</h3>
          <p>
            Слово <code>print</code> сообщает Python: «покажи переданные данные в терминале». Это готовая команда,
            которую уже знает интерпретатор.
          </p>

          <h3><code className="lesson-token">( )</code> — место для данных</h3>
          <p>
            Скобки показывают, что именно мы передаём команде. Их можно представить как конверт: команда получает
            содержимое, лежащее внутри.
          </p>

          <h3><code className="lesson-token">"Привет"</code> — текст</h3>
          <p>
            Кавычки отмечают начало и конец текста. Без них Python решит, что{" "}
            <code className="lesson-token">Привет</code> — это имя, значение которого нужно найти.
          </p>
        </div>

        <TypeCards>
          <TypeCard badge="✓" title="Двойные кавычки" code={'print("Привет")'}>
            Прямые двойные кавычки подходят для текста.
          </TypeCard>
          <TypeCard badge="✓" badgeTone="float" title="Одинарные кавычки" code={"print('Привет')"}>
            Прямые одинарные кавычки тоже подходят.
          </TypeCard>
          <TypeCard badge="✗" badgeTone="str" title="Без кавычек" code="print(Привет)">
            Python ищет имя <code>Привет</code> и не находит его.
          </TypeCard>
        </TypeCards>

        <BugHunt
          code={'print(Привет)'}
          question="Почему Python не показывает слово Привет?"
          options={[
            "Текст записан без кавычек",
            "Команду print можно использовать только на английском",
            "В конце строки нет точки",
          ]}
          correctIndex={0}
          explanation="Без кавычек Python воспринимает Привет как имя, а не как текст."
          fix={'print("Привет")'}
        />
      </Section>

      <Section number="06" title="Первые правила Python без перегрузки">
        <Lead>
          У каждого языка есть свои правила записи. Они похожи на правила оформления адреса: если убрать важный
          элемент или заменить знак похожим, получатель может не понять сообщение.
        </Lead>

        <div className="lesson-practice-steps">
          <h3>1. Используйте прямые кавычки</h3>
          <p>
            Подходят <code className="lesson-token">" "</code> и <code className="lesson-token">' '</code>.
            Русские типографские кавычки{" "}
            <code className="lesson-token lesson-token--danger">« »</code> выглядят похоже, но Python не считает их
            кавычками языка.
          </p>
          <CodeBlock code={'print("Привет")   # правильно\nprint(\'Привет\')   # правильно\nprint(«Привет»)   # ошибка'} />

          <h3>2. Закрывайте скобку</h3>
          <p>
            Закрывающая скобка <code className="lesson-token">)</code> показывает, где команда закончилась. Python
            не будет угадывать её место.
          </p>
          <CodeBlock code={'print("Готово")   # правильно\nprint("Готово"    # скобка не закрыта'} />

          <h3>3. Комментарий начинается с #</h3>
          <p>
            Комментарий — заметка для человека. Python пропускает текст после{" "}
            <code className="lesson-token">#</code>. Так можно оставить пояснение или временно отключить строку.
          </p>
          <CodeBlock code={'print("Видно")\n# print("Временно скрыто")\nprint("Тоже видно")'} />

          <h3>4. Точка с запятой в конце не нужна</h3>
          <p>
            В некоторых языках обычную инструкцию завершают символом <code className="lesson-token">;</code>. В
            Python каждая простая команда обычно записывается на своей строке, поэтому точку с запятой в конце
            ставить не нужно.
          </p>
          <CodeBlock code={'print("Первая строка")\nprint("Вторая строка")'} />

          <h3>5. Пустая строка ничего не печатает</h3>
          <p>
            Пустая строка внутри файла только разделяет код визуально. Чтобы вывести пустую строку в терминале,
            нужна команда <code className="lesson-token">print()</code>.
          </p>
        </div>

        <Callout tone="info">
          Исправляйте по одному правилу за раз. Если в одном примере сразу четыре ошибки, первая ошибка может
          помешать увидеть остальные.
        </Callout>
      </Section>

      <Section number="07" title="Два момента возникновения ошибки">
        <Lead>
          Ошибку можно сравнить с проверкой инструкции перед работой. Иногда Python видит, что запись составлена
          неправильно, ещё до выполнения. Иногда запись понятна, но проблема появляется уже во время работы.
        </Lead>

        <TypeCards>
          <TypeCard badge="до выполнения" title="Python не понял запись" code={'print("Шаг 2"'}>
            Не закрыта скобка. Интерпретатор не может нормально разобрать файл, поэтому программа может вообще не
            начать выполнение.
          </TypeCard>
          <TypeCard badge="во время" badgeTone="str" title="Проблема на конкретной строке" code="print(Готово)">
            Запись устроена понятно, но Python ищет имя <code>Готово</code> и не находит его. Предыдущие строки уже
            могли выполниться.
          </TypeCard>
        </TypeCards>

        <div className="execution-example">
          <CodeBlock caption="ошибка до выполнения" code={'print("Первая строка")\nprint("Вторая строка"'} />
          <TerminalDemo
            title="Python не начал выполнять команды"
            lines={[
              { cmd: "python main.py" },
              { out: "SyntaxError: '(' was never closed" },
            ]}
          />
        </div>

        <div className="execution-example">
          <CodeBlock
            caption="ошибка во время выполнения"
            code={'print("Первая строка")\nprint(Вторая)\nprint("Третья строка")'}
          />
          <TerminalDemo
            title="первая строка успела появиться"
            lines={[
              { cmd: "python main.py" },
              { out: "Первая строка" },
              { out: "NameError: name 'Вторая' is not defined" },
            ]}
          />
        </div>

        <div className="lesson-practice-steps">
          <p><code className="lesson-token">SyntaxError</code> часто означает: Python не смог понять структуру записи.</p>
          <p>
            <code className="lesson-token">NameError</code> часто означает: Python встретил имя, но до этого не
            получил для него значение.
          </p>
          <p>
            Пока достаточно одного вопроса:{" "}
            <span className="lesson-emphasis">программа не начала работу или остановилась на конкретной строке?</span>
          </p>
        </div>
      </Section>

      <Section number="08" title="Первый файл StudyHub">
        <Lead>
          Теперь соберём небольшой файл проекта. Сначала оставим традиционный Hello, World!, затем добавим название
          StudyHub. Это уже настоящий запускаемый Python-файл, хотя в нём всего несколько строк.
        </Lead>

        <div className="execution-example">
          <CodeBlock
            caption="studyhub/main.py"
            code={
              '# Первый файл проекта StudyHub\n' +
              'print("Hello, World!")\n' +
              'print("StudyHub Planner")\n' +
              'print("Первый запуск выполнен")'
            }
          />
          <TerminalDemo
            title="результат"
            lines={[
              { cmd: "python main.py" },
              { out: "Hello, World!" },
              { out: "StudyHub Planner" },
              { out: "Первый запуск выполнен" },
            ]}
          />
        </div>

        <div className="lesson-practice-steps">
          <h3>Шаг 1. Измените текст</h3>
          <p>
            Замените <code>Первый запуск выполнен</code> на{" "}
            <code className="lesson-token">Я запустил свой первый Python-файл</code>.
          </p>

          <h3>Шаг 2. Временно скройте Hello, World!</h3>
          <p>
            Добавьте <code className="lesson-token">#</code> перед первой командой print. Строка должна остаться в
            файле, но исчезнуть из терминала.
          </p>

          <h3>Шаг 3. Верните строку обратно</h3>
          <p>
            Уберите <code className="lesson-token">#</code> и снова запустите файл. Это показывает, что комментарий
            временно отключает инструкцию, а не удаляет её.
          </p>
        </div>

        <FillBlank
          prompt="Платформа уже подготовила оболочку. Измените только текст внутри кавычек."
          before={'def solve():\n    return "'}
          after={'"'}
          options={["Hello, World!", "python main.py", "print"]}
          answer="Hello, World!"
          explanation="def и return пока не нужно разбирать. В этом задании меняется только готовый текстовый результат."
        />

        <div className="lesson-check-group">
          <QuizCard
            question="Кто выполняет инструкции из main.py?"
            options={["Python-интерпретатор", "сам текстовый файл", "браузер"]}
            correctIndex={0}
            explanation="Интерпретатор открывает сохранённый файл и выполняет Python-код."
          />
          <QuizCard
            question={'Что означает текст в кавычках внутри print("Привет")?'}
            options={["данные, которые нужно показать", "имя файла", "команда терминала"]}
            correctIndex={0}
            explanation="Кавычки обозначают текстовые данные."
          />
          <QuizCard
            question="Что произойдёт со строкой, перед которой стоит #?"
            options={["Python пропустит её", "она выполнится два раза", "Python удалит файл"]}
            correctIndex={0}
            explanation="Комментарий остаётся в файле, но не выполняется."
          />
        </div>

        <KeyTakeaways
          points={[
            <>Файл <code className="lesson-token">.py</code> хранит инструкции и сам себя не выполняет.</>,
            <>Python-интерпретатор читает сохранённый файл и выполняет его команды.</>,
            <>В простом файле инструкции выполняются сверху вниз.</>,
            <>
              <code className="lesson-token">print</code> — действие, <code className="lesson-token">( )</code> —
              место для данных, кавычки обозначают текст.
            </>,
            <>Комментарий после <code className="lesson-token">#</code> не выполняется.</>,
            <>В конце обычной строки Python точка с запятой не нужна.</>,
            <>Первую ошибку лучше исправлять отдельно, а затем запускать файл снова.</>,
          ]}
        />

        <PracticeCta text="Откройте main.py, соберите Hello, World!, добавьте две строки StudyHub и по очереди временно отключите каждую команду через #." />
      </Section>
    </RichLesson>
  );
}

// 02. Терминал, файлы и запуск скрипта
export function Lesson02({ module }: { module?: string }) {
  return (
    <RichLesson>
      <RichHero
        chip={module ?? "Блок 1 · Старт и данные"}
        title="Терминал, файлы и запуск скрипта"
        intro="Установим необходимые инструменты, создадим папку проекта и запустим один и тот же Python-файл через терминал, VS Code или PyCharm."
        tags={[
          { icon: <Download size={14} />, label: "установка и запуск" },
          { icon: <Terminal size={14} />, label: "терминал или IDE" },
        ]}
      />
      <TheoryBridge lesson={2} />

      <Section number="01" title="Что понадобится для работы">
        <Lead>
          Для первых проектов нужны три вещи: Python, папка с файлами и удобное место для редактирования кода.
          Представьте рабочий стол: Python — исполнитель, папка — ящик с проектом, редактор — место, где мы меняем
          инструкции.
        </Lead>

        <div className="lesson-route">
          <ol>
            <li>
              <strong>Установить Python:</strong> он нужен, чтобы компьютер мог выполнять файлы <code>.py</code>.
            </li>
            <li>
              <strong>Выбрать редактор:</strong> можно использовать VS Code или PyCharm.
            </li>
            <li>
              <strong>Создать папку проекта:</strong> все файлы StudyHub будут лежать в одном понятном месте.
            </li>
          </ol>
          <p>
            Затем мы запустим файл двумя способами и создадим виртуальное окружение, которое понадобится проекту
            позже.
          </p>
        </div>

        <TypeCards>
          <TypeCard badge="Python" title="Исполнитель кода" code="python --version">
            Скачивается с официального сайта Python. В Windows при установке важно разрешить добавление Python в
            PATH, чтобы команда работала в терминале.
          </TypeCard>
          <TypeCard badge="VS Code" badgeTone="float" title="Лёгкий редактор">
            После установки добавьте расширение Python. Внутри есть редактор, дерево файлов, терминал и кнопка
            запуска.
          </TypeCard>
          <TypeCard badge="PyCharm" badgeTone="str" title="Готовая Python-IDE">
            В PyCharm многие инструменты уже собраны вместе. Нужно открыть папку проекта и выбрать установленный
            интерпретатор.
          </TypeCard>
        </TypeCards>

        <Callout tone="info">
          VS Code и PyCharm — не разные версии Python. Это разные рабочие столы. В обоих случаях код выполняет тот
          же интерпретатор.
        </Callout>
      </Section>

      <Section number="02" title="Редактор, Проводник и терминал — разные инструменты">
        <Lead>
          Новичок часто видит несколько окон и думает, что это одна программа. Проще представить мастерскую: в
          одном месте лежат детали, в другом мы редактируем чертёж, в третьем запускаем работу.
        </Lead>

        <TypeCards>
          <TypeCard badge="Проводник" title="Показывает папки и файлы">
            Здесь можно увидеть папку <code>studyhub</code>, файл <code>main.py</code> и проверить точное имя.
          </TypeCard>
          <TypeCard badge="редактор" badgeTone="float" title="Изменяет код" code={'print("StudyHub")'}>
            Здесь пишется и сохраняется содержимое файла. Несохранённые изменения ещё не попали на диск.
          </TypeCard>
          <TypeCard badge="терминал" badgeTone="str" title="Выполняет команды" code="python main.py">
            Здесь мы сообщаем компьютеру, какой файл нужно запустить, и видим результат.
          </TypeCard>
        </TypeCards>

        <div className="execution-example">
          <CodeBlock caption="код в редакторе" code={'print("StudyHub Planner")'} />
          <TerminalDemo
            title="команда и результат"
            lines={[
              { cmd: "python main.py" },
              { out: "StudyHub Planner" },
            ]}
          />
        </div>

        <Callout>
          Команда <code className="lesson-token">python main.py</code> пишется в терминале, а строка{" "}
          <code className="lesson-token">print("StudyHub")</code> — внутри файла.
        </Callout>
      </Section>

      <Section number="03" title="Папка проекта и путь как адрес">
        <Lead>
          Путь к файлу похож на почтовый адрес. Чтобы найти квартиру, нужно знать дом и номер. Чтобы найти
          <code>main.py</code>, терминалу нужно знать папку, в которой он лежит.
        </Lead>

        <CodeBlock
          caption="простая структура"
          code={
            "backend-course/\n" +
            "└── studyhub/\n" +
            "    ├── main.py\n" +
            "    └── .venv/"
          }
        />

        <div className="lesson-practice-steps">
          <h3><code className="lesson-token">pwd</code> — где я нахожусь?</h3>
          <p>
            Команда показывает текущую папку. Это как посмотреть на табличку с адресом комнаты, в которой вы сейчас
            стоите.
          </p>

          <h3><code className="lesson-token">dir</code> — что лежит рядом?</h3>
          <p>
            Команда показывает файлы и папки внутри текущего места. Если <code>main.py</code> не виден, команда
            <code>python main.py</code> не сможет найти его по короткому имени.
          </p>

          <h3><code className="lesson-token">cd</code> — перейти в другую папку</h3>
          <p>
            <code>cd studyhub</code> открывает дочернюю папку, а <code>cd ..</code> возвращает на один уровень выше.
          </p>
        </div>

        <StepThrough
          code={"pwd\ndir\ncd studyhub\ndir"}
          steps={[
            { line: 0, note: "Сначала узнаём текущий адрес.", vars: { папка: "backend-course" } },
            { line: 1, note: "Проверяем, что рядом есть папка studyhub.", vars: { найдено: "studyhub" } },
            { line: 2, note: "Переходим внутрь проекта.", vars: { папка: "backend-course/studyhub" } },
            { line: 3, note: "Проверяем, что теперь рядом находится main.py.", vars: { найдено: "main.py" } },
          ]}
        />

        <Callout tone="info">
          Если в Windows файл называется <code>main.py.txt</code>, Python не считает его обычным Python-файлом.
          Проверяйте расширение через Проводник или <code>dir</code>.
        </Callout>
      </Section>

      <Section number="04" title="Два способа запуска: терминал и IDE">
        <Lead>
          Один файл можно запустить разными кнопками, но внутри происходит одно и то же: выбранный интерпретатор
          получает путь до <code>main.py</code> и выполняет код.
        </Lead>

        <TypeCards>
          <TypeCard badge="терминал" title="Прямой запуск" code="python main.py">
            Самый прозрачный способ. Видно текущую папку, команду, путь и результат.
          </TypeCard>
          <TypeCard badge="VS Code" badgeTone="float" title="Кнопка Run или встроенный терминал">
            Можно нажать запуск файла или открыть терминал внутри VS Code и ввести ту же команду.
          </TypeCard>
          <TypeCard badge="PyCharm" badgeTone="str" title="Run main">
            PyCharm сам формирует команду, используя выбранный интерпретатор и текущую конфигурацию проекта.
          </TypeCard>
        </TypeCards>

        <div className="lesson-practice-steps">
          <h3>Какой способ основной в курсе</h3>
          <p>
            Мы чаще используем терминал, потому что он показывает все шаги без скрытой магии. Кнопка IDE остаётся
            удобным дополнительным способом.
          </p>

          <h3>Почему результат должен совпадать</h3>
          <p>
            Если IDE и терминал запускают один сохранённый файл тем же Python, вывод будет одинаковым. Если он
            отличается, обычно выбран другой файл, другой интерпретатор или изменения не сохранены.
          </p>
        </div>

        <CompareSolutions
          question="Как объяснить разницу между способами запуска?"
          left={{
            title: "Терминал",
            code: "python main.py",
            note: "Мы вручную указываем интерпретатору файл.",
          }}
          right={{
            title: "Кнопка IDE",
            code: "Run main.py",
            note: "IDE собирает похожую команду за нас.",
          }}
          preferred="right"
          explanation="Оба способа нормальны. Для обучения полезно уметь хотя бы один раз выполнить прямую команду самостоятельно."
        />
      </Section>

      <Section number="05" title="Сохранение файла и первые проблемы запуска">
        <Lead>
          Python выполняет сохранённую версию файла. Это похоже на отправку документа: пока вы не нажали
          «Сохранить», на диске остаётся предыдущая версия.
        </Lead>

        <div className="execution-example">
          <CodeBlock caption="studyhub/main.py" code={'print("Новая версия StudyHub")'} />
          <TerminalDemo
            title="проверяем запуск"
            lines={[
              { cmd: "python main.py" },
              { out: "Новая версия StudyHub" },
            ]}
          />
        </div>

        <div className="lesson-practice-steps">
          <h3>Команда python не найдена</h3>
          <p>
            Проверьте <code>python --version</code>. В Windows также может работать <code>py --version</code>. Если
            не работает ничего, нужно вернуться к установке Python.
          </p>

          <h3>Сообщение can't open file</h3>
          <p>
            Python запустился, но не нашёл файл по указанному адресу. Проверьте <code>pwd</code>, <code>dir</code> и
            имя файла.
          </p>

          <h3>Показывается старый текст</h3>
          <p>
            Сначала сохраните файл. Затем убедитесь, что запускается именно тот <code>main.py</code>, который открыт
            в редакторе.
          </p>
        </div>

        <BugHunt
          code={'print("Новый текст")'}
          question="Код изменён, но после запуска виден старый результат. Что проверить первым?"
          options={[
            "Файл сохранён и запускается нужный main.py",
            "Удалить Python",
            "Добавить вторую команду print",
          ]}
          correctIndex={0}
          explanation="Интерпретатор читает сохранённый файл по конкретному пути."
        />
      </Section>

      <Section number="06" title="Виртуальное окружение: отдельный набор инструментов">
        <Lead>
          Виртуальное окружение можно представить как отдельный ящик с инструментами для одного проекта. Сейчас он
          почти пустой, поэтому внешне ничего не изменится. Позже в него будут устанавливаться библиотеки StudyHub.
        </Lead>

        <div className="lesson-practice-steps">
          <h3>Зачем оно обязательно проекту</h3>
          <p>
            У разных проектов могут быть разные библиотеки и разные версии. Отдельный ящик не позволяет
            инструментам одного проекта случайно смешаться с другим.
          </p>

          <h3>Нужно ли скачивать .venv отдельно</h3>
          <p>
            Нет. После установки Python модуль <code className="lesson-token">venv</code> уже доступен. Папка
            создаётся командой <code className="lesson-token">python -m venv .venv</code>.
          </p>

          <h3>Почему сейчас почти ничего не поменяется</h3>
          <p>
            В первых файлах используются только возможности самого Python. Настоящую пользу окружения мы увидим в
            следующих блоках, когда начнём устанавливать дополнительные библиотеки.
          </p>
        </div>

        <TerminalDemo
          title="создание и активация в PowerShell"
          lines={[
            { cmd: "python -m venv .venv" },
            { cmd: ".\\.venv\\Scripts\\Activate.ps1" },
            { out: "(.venv) PS C:\\backend-course\\studyhub>" },
            { cmd: "python main.py" },
            { out: "StudyHub Planner" },
            { cmd: "deactivate" },
          ]}
        />

        <Callout tone="info">
          Создать окружение нужно один раз. После открытия нового терминала существующее окружение просто активируют
          снова. Если PowerShell блокирует активацию, не вводите случайные команды из интернета — разберите настройку
          с наставником.
        </Callout>
      </Section>

      <Section number="07" title="Практикум: один файл, три запуска">
        <Lead>
          Цель практики — увидеть, что терминал, VS Code и PyCharm могут запускать один и тот же сохранённый файл.
          Разница находится в интерфейсе, а не в самом Python-коде.
        </Lead>

        <div className="execution-example">
          <CodeBlock
            caption="studyhub/main.py"
            code={'print("StudyHub Planner")\nprint("Файл сохранён и найден")'}
          />
          <TerminalDemo
            title="прямой запуск"
            lines={[
              { cmd: "pwd" },
              { out: "C:\\backend-course\\studyhub" },
              { cmd: "dir" },
              { out: ".venv   main.py" },
              { cmd: "python main.py" },
              { out: "StudyHub Planner" },
              { out: "Файл сохранён и найден" },
            ]}
          />
        </div>

        <div className="lesson-practice-steps">
          <h3>Шаг 1. Запуск из терминала</h3>
          <p>Проверьте папку через <code>pwd</code> и <code>dir</code>, затем выполните <code>python main.py</code>.</p>

          <h3>Шаг 2. Запуск из редактора</h3>
          <p>Откройте тот же файл в VS Code или PyCharm и используйте кнопку Run.</p>

          <h3>Шаг 3. Изменение и повтор</h3>
          <p>
            Замените вторую строку на <code className="lesson-token">Запуск проверен двумя способами</code>,
            сохраните файл и повторите оба запуска.
          </p>
        </div>

        <CodeSequence
          title="Соберите безопасный запуск"
          prompt="Расположите действия в понятном порядке."
          pieces={[
            { id: "open", code: "открыть папку studyhub" },
            { id: "save", code: "сохранить main.py" },
            { id: "check", code: "pwd и dir" },
            { id: "run", code: "python main.py" },
          ]}
          correctOrder={["open", "save", "check", "run"]}
          explanation="Сначала выбираем проект и сохраняем файл, затем подтверждаем путь и запускаем."
        />
      </Section>

      <Section number="08" title="Что должно получиться после занятия">
        <Lead>
          После урока не требуется помнить все команды без подсказки. Важно понимать маршрут и уметь повторить его
          по короткой инструкции.
        </Lead>

        <div className="lesson-check-group">
          <QuizCard
            question="Что выполняет Python-код при нажатии Run в IDE?"
            options={["Выбранный Python-интерпретатор", "сама кнопка", "браузер"]}
            correctIndex={0}
            explanation="IDE только помогает сформировать запуск. Код выполняет интерпретатор."
          />
          <QuizCard
            question="Зачем перед запуском использовать pwd и dir?"
            options={["Проверить папку и наличие файла", "Изменить код", "Создать GitHub"]}
            correctIndex={0}
            explanation="Эти команды помогают понять, где находится терминал и что лежит рядом."
          />
          <QuizCard
            question="Нужно ли скачивать .venv отдельной программой?"
            options={["Нет, её создаёт установленный Python", "Да, с GitHub", "Да, из VS Code"]}
            correctIndex={0}
            explanation="Команда python -m venv .venv создаёт окружение внутри проекта."
          />
        </div>

        <KeyTakeaways
          points={[
            <>Python скачивается отдельно и выполняет файлы <code>.py</code>.</>,
            <>VS Code и PyCharm являются рабочими средами, а не заменой интерпретатора.</>,
            <><code>pwd</code> показывает текущую папку, <code>dir</code> — содержимое, <code>cd</code> меняет папку.</>,
            <>Один файл можно запускать командой терминала или кнопкой IDE.</>,
            <>Перед запуском файл нужно сохранить.</>,
            <>Виртуальное окружение создаётся для проекта сейчас, а его польза станет заметна с появлением библиотек.</>,
          ]}
        />

        <PracticeCta text="Установите Python и один редактор, создайте папку studyhub, запустите main.py через терминал и через кнопку IDE, затем создайте .venv." />
      </Section>
    </RichLesson>
  );
}

// 03. Git, GitHub и история изменений
export function Lesson03({ module }: { module?: string }) {
  return (
    <RichLesson>
      <RichHero
        chip={module ?? "Блок 1 · Старт и данные"}
        title="Git, GitHub и история изменений"
        intro="Создадим первый репозиторий блока: установим Git, зарегистрируемся на GitHub, сохраним первую версию проекта и отправим её в интернет."
        tags={[
          { icon: <GitBranch size={14} />, label: "первые коммиты" },
          { icon: <Cloud size={14} />, label: "репозиторий на GitHub" },
        ]}
      />
      <TheoryBridge lesson={3} />

      <Section number="01" title="Зачем вообще нужен Git">
        <Lead>
          Представьте игру без сохранений. Ошибка на последнем уровне заставит начинать заново. Git добавляет
          проекту точки сохранения: можно увидеть, что изменилось, и вернуться к прошлой рабочей версии.
        </Lead>

        <div className="lesson-route">
          <ol>
            <li>
              <strong>Установить Git:</strong> программу, которая хранит историю файлов на компьютере.
            </li>
            <li>
              <strong>Создать репозиторий блока:</strong> одну папку с историей для занятий 01–05.
            </li>
            <li>
              <strong>Отправить копию на GitHub:</strong> чтобы проект был доступен через интернет.
            </li>
          </ol>
          <p>
            На этом занятии нужны только базовые команды. Подробные состояния Git, ветки и сложные сценарии будут
            изучаться позже.
          </p>
        </div>

        <TypeCards>
          <TypeCard badge="Git" title="История на компьютере">
            Делает снимки проекта и показывает, какие файлы изменились.
          </TypeCard>
          <TypeCard badge="GitHub" badgeTone="float" title="Копия в интернете">
            Хранит отправленные коммиты и позволяет показать проект наставнику или другому разработчику.
          </TypeCard>
          <TypeCard badge="репозиторий" badgeTone="str" title="Папка проекта с историей">
            Обычная папка становится репозиторием после команды <code>git init</code>.
          </TypeCard>
        </TypeCards>

        <Callout tone="info">
          Git и GitHub — не одно и то же. Git может работать без интернета. GitHub получает копию истории только
          после команды push.
        </Callout>
      </Section>

      <Section number="02" title="Что нужно установить и где зарегистрироваться">
        <Lead>
          Перед первой историей подготовим два инструмента: Git на компьютере и учётную запись GitHub в интернете.
        </Lead>

        <div className="lesson-practice-steps">
          <h3>1. Установите Git</h3>
          <p>
            Скачайте Git с официального сайта Git. Для первого занятия можно оставить стандартные параметры
            установки. После установки откройте новый терминал.
          </p>

          <h3>2. Проверьте установку</h3>
          <p>Команда <code className="lesson-token">git --version</code> должна показать номер версии.</p>

          <h3>3. Зарегистрируйтесь на GitHub</h3>
          <p>
            Создайте обычную учётную запись. Запомните имя пользователя: оно будет частью адреса ваших
            репозиториев.
          </p>

          <h3>4. Укажите автора коммитов</h3>
          <p>
            Git сохраняет имя и email автора. Эти настройки выполняются один раз на компьютере.
          </p>
        </div>

        <TerminalDemo
          title="первая настройка Git"
          lines={[
            { cmd: "git --version" },
            { out: "git version 2.x.x" },
            { cmd: 'git config --global user.name "Student Name"' },
            { cmd: 'git config --global user.email "student@example.com"' },
          ]}
        />

        <Callout>
          Лучше использовать email, связанный с GitHub. Пароль от GitHub в команды не записывают.
        </Callout>
      </Section>

      <Section number="03" title="Один репозиторий на один блок">
        <Lead>
          В курсе каждый блок хранится в отдельном репозитории. Это похоже на отдельную папку для одного предмета:
          внутри находятся все материалы блока, но файлы других блоков не смешиваются.
        </Lead>

        <CodeBlock
          caption="пример папки блока"
          code={
            "python-block-1/\n" +
            "├── lesson01/\n" +
            "├── lesson02/\n" +
            "├── lesson03/\n" +
            "├── lesson04/\n" +
            "├── lesson05/\n" +
            "├── studyhub/\n" +
            "├── .gitignore\n" +
            "└── README.md"
          }
        />

        <div className="lesson-practice-steps">
          <h3>Правило курса</h3>
          <p>
            Для блока 1 создайте репозиторий <code className="lesson-token">python-block-1</code>. Внутри могут
            лежать упражнения пяти занятий и текущая версия StudyHub.
          </p>

          <h3>Правило для собственных проектов</h3>
          <p>
            Обычно один самостоятельный проект хранится в одном репозитории. Интернет-магазин и Telegram-бот — два
            разных проекта, поэтому им удобнее иметь отдельные истории.
          </p>

          <h3>Где выполнять git init</h3>
          <p>
            Сначала перейдите в папку <code>python-block-1</code>, проверьте её через <code>pwd</code> и только затем
            запускайте <code className="lesson-token">git init</code>.
          </p>
        </div>

        <Callout tone="info">
          Не запускайте git init в общей папке «Документы» или на рабочем столе. Иначе Git может начать следить за
          посторонними файлами.
        </Callout>
      </Section>

      <Section number="04" title="Первое локальное сохранение">
        <Lead>
          Коммит похож на фотографию текущего состояния проекта. Перед фотографией мы выбираем, что попадёт в кадр,
          затем подписываем снимок понятным сообщением.
        </Lead>

        <TypeCards>
          <TypeCard badge="status" title="Посмотреть состояние" code="git status">
            Git показывает новые и изменённые файлы. Команда ничего не сохраняет и безопасна для проверки.
          </TypeCard>
          <TypeCard badge="add" badgeTone="float" title="Подготовить файлы" code="git add .">
            Изменения складываются в набор для следующего коммита. Перед этой командой нужен правильный
            <code>.gitignore</code>.
          </TypeCard>
          <TypeCard badge="commit" badgeTone="str" title="Создать точку сохранения" code={'git commit -m "start block 1"'}>
            Git записывает подготовленный набор в локальную историю.
          </TypeCard>
        </TypeCards>

        <TerminalDemo
          title="первый коммит"
          lines={[
            { cmd: "pwd" },
            { out: "C:\\backend-course\\python-block-1" },
            { cmd: "git init" },
            { out: "Initialized empty Git repository" },
            { cmd: "git status" },
            { out: "Untracked files: lesson01/ studyhub/ README.md" },
            { cmd: "git add ." },
            { cmd: 'git commit -m "start block 1"' },
            { out: "files changed" },
          ]}
        />

        <div className="lesson-practice-steps">
          <p><code>git status</code> можно запускать сколько угодно: он только показывает ситуацию.</p>
          <p><code>git add .</code> подготавливает содержимое текущей папки и вложенных папок.</p>
          <p>
            Сообщение коммита должно объяснять этап: <code>start block 1</code>, <code>complete lesson 4</code>,
            <code>add StudyHub greeting</code>.
          </p>
        </div>
      </Section>

      <Section number="05" title="Файл .gitignore: что не нужно сохранять">
        <Lead>
          В папке проекта появляются технические файлы, которые можно создать заново. Хранить их в истории — всё
          равно что складывать в фотоальбом упаковку от каждого инструмента.
        </Lead>

        <CodeBlock caption=".gitignore для первого блока" code={".venv/\n__pycache__/\n*.pyc"} />

        <div className="lesson-practice-steps">
          <h3><code className="lesson-token">.venv/</code></h3>
          <p>
            Виртуальное окружение содержит много автоматически созданных файлов. Каждый ученик сможет создать его
            заново командой <code>python -m venv .venv</code>.
          </p>

          <h3><code className="lesson-token">__pycache__/</code> и <code className="lesson-token">*.pyc</code></h3>
          <p>
            Это служебные файлы Python. Они появляются автоматически и не являются вашим исходным кодом.
          </p>

          <h3>Когда создать .gitignore</h3>
          <p>
            Лучше сделать это до первого <code>git add .</code>, чтобы лишние файлы сразу не попали в набор.
          </p>
        </div>

        <BugHunt
          code={"git add .\n# Git показывает сотни файлов из .venv"}
          question="Почему Git пытается добавить слишком много файлов?"
          options={[
            "В .gitignore не указана папка .venv",
            "Git сломан",
            "В проекте слишком мало Python-кода",
          ]}
          correctIndex={0}
          explanation="Виртуальное окружение нужно исключить до массового добавления."
          fix={"# .gitignore\n.venv/\n__pycache__/\n*.pyc\n\ngit add ."}
        />
      </Section>

      <Section number="06" title="Создаём репозиторий на GitHub">
        <Lead>
          Локальный коммит уже хранится на компьютере. Теперь создадим пустое место на GitHub и свяжем его с
          папкой блока. Это похоже на отправку копии фотоальбома в облако.
        </Lead>

        <div className="lesson-practice-steps">
          <h3>Шаг 1. Создайте новый репозиторий</h3>
          <p>
            На GitHub выберите создание репозитория и задайте имя <code className="lesson-token">python-block-1</code>.
            Для первого подключения удобнее создать его пустым, без автоматически добавленных файлов.
          </p>

          <h3>Шаг 2. Скопируйте HTTPS-адрес</h3>
          <p>
            Адрес будет похож на <code>https://github.com/USERNAME/python-block-1.git</code>. Вместо USERNAME будет
            ваше имя пользователя.
          </p>

          <h3>Шаг 3. Свяжите локальную папку с GitHub</h3>
          <p>
            Команда <code>git remote add origin ...</code> сохраняет адрес удалённого репозитория под коротким
            именем <code>origin</code>.
          </p>
        </div>

        <TerminalDemo
          title="первое подключение и отправка"
          lines={[
            { cmd: "git branch -M main" },
            { cmd: "git remote add origin https://github.com/USERNAME/python-block-1.git" },
            { cmd: "git push -u origin main" },
            { out: "branch 'main' set up to track 'origin/main'" },
          ]}
        />

        <Callout tone="info">
          При первом push может открыться окно входа в браузере. Завершите авторизацию и вернитесь в терминал.
          Пароль нельзя вставлять прямо в адрес репозитория.
        </Callout>
      </Section>

      <Section number="07" title="Обычный цикл после каждого занятия">
        <Lead>
          После первого подключения ежедневный процесс становится коротким. Его можно сравнить с уборкой стола:
          посмотреть изменения, сложить нужное, подписать коробку и отправить копию.
        </Lead>

        <CodeSequence
          title="Соберите рабочий цикл Git"
          prompt="Расположите команды после завершения занятия."
          pieces={[
            { id: "status", code: "git status" },
            { id: "add", code: "git add ." },
            { id: "commit", code: 'git commit -m "complete lesson 4"' },
            { id: "push", code: "git push" },
          ]}
          correctOrder={["status", "add", "commit", "push"]}
          explanation="Сначала проверяем изменения, затем создаём локальную точку сохранения и отправляем её на GitHub."
        />

        <div className="execution-example">
          <TerminalDemo
            title="проверяем историю"
            lines={[
              { cmd: "git log --oneline" },
              { out: "a8f21bc complete lesson 4" },
              { out: "3c911e2 start block 1" },
            ]}
          />
          <CodeBlock
            caption="как читать историю"
            code={
              "новый коммит находится сверху\n" +
              "короткий набор символов — идентификатор\n" +
              "текст справа — сообщение автора"
            }
          />
        </div>

        <div className="lesson-practice-steps">
          <p><code>commit</code> сохраняет версию на компьютере.</p>
          <p><code>push</code> отправляет уже созданные коммиты на GitHub.</p>
          <p>
            Если <code>git status</code> показывает чистое состояние, это значит только отсутствие новых изменений.
            Git не проверяет, правильно ли работает программа.
          </p>
        </div>
      </Section>

      <Section number="08" title="Итог: первый репозиторий блока">
        <Lead>
          В конце занятия у вас должна быть одна папка блока, локальная история и репозиторий с тем же содержимым
          на GitHub.
        </Lead>

        <div className="lesson-practice-steps">
          <h3>Минимальный результат</h3>
          <p>
            Репозиторий называется <code>python-block-1</code>, содержит упражнения блока и папку StudyHub. В
            истории есть хотя бы один понятный коммит.
          </p>

          <h3>Что показать наставнику</h3>
          <p>
            Папку проекта, вывод <code>git status</code>, историю <code>git log --oneline</code> и страницу
            репозитория на GitHub.
          </p>
        </div>

        <div className="lesson-check-group">
          <QuizCard
            question="Зачем нужен Git?"
            options={["Хранить историю изменений проекта", "Запускать Python", "Рисовать интерфейс"]}
            correctIndex={0}
            explanation="Git создаёт точки сохранения и показывает изменения файлов."
          />
          <QuizCard
            question="Чем GitHub отличается от Git?"
            options={["GitHub хранит отправленную копию в интернете", "GitHub заменяет Python", "Разницы нет"]}
            correctIndex={0}
            explanation="Git работает локально, а GitHub хранит удалённую копию репозитория."
          />
          <QuizCard
            question="Что делает git commit?"
            options={["Создаёт локальную точку сохранения", "Удаляет проект", "Скачивает Python"]}
            correctIndex={0}
            explanation="Коммит сохраняет подготовленную версию в локальной истории."
          />
          <QuizCard
            question="Сколько репозиториев создаём для блока 1?"
            options={["Один", "По одному на каждую строку", "Ни одного"]}
            correctIndex={0}
            explanation="Все материалы первого блока хранятся в одном репозитории python-block-1."
          />
        </div>

        <KeyTakeaways
          points={[
            <>Git похож на систему точек сохранения проекта.</>,
            <>GitHub хранит отправленную копию истории в интернете.</>,
            <>Один учебный блок хранится в одном репозитории.</>,
            <><code>git status</code> показывает изменения, <code>git add .</code> подготавливает их.</>,
            <><code>git commit</code> создаёт локальную версию, <code>git push</code> отправляет её.</>,
            <>Папку <code>.venv</code> нужно исключить через <code>.gitignore</code>.</>,
          ]}
        />

        <PracticeCta text="Создайте репозиторий python-block-1, сделайте первый коммит, создайте пустой репозиторий на GitHub, подключите origin и выполните первый push." />
      </Section>
    </RichLesson>
  );
}

// 04. Переменные и базовые типы
export function Lesson04({ module }: { module?: string }) {
  return (
    <RichLesson>
      <RichHero
        chip={module ?? "Блок 1 · Старт и данные"}
        title="Переменные и базовые типы"
        intro="Научимся давать данным понятные имена, менять значения и различать четыре основных типа: текст, целые числа, дробные числа и ответы да или нет."
        tags={[
          { icon: <Variable size={14} />, label: "имя и значение" },
          { icon: <Hash size={14} />, label: "str · int · float · bool" },
        ]}
      />
      <TheoryBridge lesson={4} />

      <Section number="01" title="Зачем данным нужны имена">
        <Lead>
          Представьте несколько одинаковых коробок без подписей. Пока их две, можно помнить содержимое. Когда
          коробок становится двадцать, начинаются ошибки. Переменная — понятная подпись к значению.
        </Lead>

        <div className="lesson-route">
          <ol>
            <li>
              <strong>Создать переменную:</strong> дать значению имя с помощью знака <code>=</code>.
            </li>
            <li>
              <strong>Прочитать значение:</strong> передать имя в <code>print()</code> без кавычек.
            </li>
            <li>
              <strong>Выбрать подходящий тип:</strong> хранить текст, число или логический ответ по смыслу.
            </li>
          </ol>
          <p>
            В конце в StudyHub появятся название проекта, номер версии, процент прогресса и признак готовности.
          </p>
        </div>

        <CompareSolutions
          question="Какой вариант проще изменить?"
          left={{
            title: "Повторять текст",
            code: 'print("StudyHub")\nprint("StudyHub")\nprint("StudyHub")',
            note: "Название записано в трёх местах.",
          }}
          right={{
            title: "Дать тексту имя",
            code: 'project_name = "StudyHub"\nprint(project_name)\nprint(project_name)',
            note: "Название задаётся один раз.",
          }}
          preferred="right"
          explanation="Переменная уменьшает повторение и сразу показывает смысл данных."
        />
      </Section>

      <Section number="02" title="Переменная как коробка с наклейкой">
        <Lead>
          Для первого знакомства удобно думать так: справа находится предмет, слева — наклейка на коробке. Строка
          <code className="lesson-token">task_count = 3</code> кладёт число 3 в коробку с названием task_count.
        </Lead>

        <StepThrough
          code={'project_name = "StudyHub"\nprint(project_name)'}
          steps={[
            {
              line: 0,
              note: 'Создаётся имя project_name и связывается с текстом "StudyHub".',
              vars: { project_name: '"StudyHub"' },
            },
            {
              line: 1,
              note: "print получает имя без кавычек, находит его значение и показывает StudyHub.",
              vars: { вывод: "StudyHub" },
            },
          ]}
        />

        <div className="lesson-practice-steps">
          <h3>Что означает знак =</h3>
          <p>
            Здесь это не школьное «левая часть навсегда равна правой». Знак <code>=</code> означает: «сохрани
            значение справа под именем слева».
          </p>

          <h3>Почему присваивание ничего не печатает</h3>
          <p>
            Положить предмет в коробку — не то же самое, что показать его человеку. Для вывода нужна отдельная
            команда <code>print(project_name)</code>.
          </p>

          <h3>Имя и текст имени — разные вещи</h3>
          <p>
            <code>print(project_name)</code> показывает значение. <code>print("project_name")</code> показывает
            буквальный текст project_name.
          </p>
        </div>

        <BugHunt
          code={'project_name = "StudyHub"\nprint("project_name")'}
          question="Почему выводится project_name, а не StudyHub?"
          options={[
            "Имя записано внутри кавычек и стало обычным текстом",
            "Переменные нельзя выводить",
            "Нужна точка с запятой",
          ]}
          correctIndex={0}
          explanation="Чтобы получить значение переменной, имя передают в print без кавычек."
          fix={'project_name = "StudyHub"\nprint(project_name)'}
        />
      </Section>

      <Section number="03" title="Сначала создать, затем использовать">
        <Lead>
          Python выполняет файл сверху вниз. Нельзя попросить взять предмет из коробки, которую ещё не поставили на
          стол.
        </Lead>

        <CompareSolutions
          question="Какой порядок правильный?"
          left={{
            title: "Сначала использование",
            code: 'print(course_name)\ncourse_name = "Python"',
            note: "На первой строке имя ещё не создано.",
          }}
          right={{
            title: "Сначала значение",
            code: 'course_name = "Python"\nprint(course_name)',
            note: "Имя существует до первого использования.",
          }}
          preferred="right"
          explanation="Python должен встретить присваивание раньше, чем имя понадобится."
        />

        <CodeSequence
          title="Соберите правильный порядок"
          prompt="Сначала создайте две переменные, затем выведите их."
          pieces={[
            { id: "name", code: 'project_name = "StudyHub"' },
            { id: "count", code: "task_count = 3" },
            { id: "print-name", code: "print(project_name)" },
            { id: "print-count", code: "print(task_count)" },
          ]}
          correctOrder={["name", "count", "print-name", "print-count"]}
          explanation="Оба имени появляются до использования."
        />

        <div className="lesson-practice-steps">
          <p>
            Регистр важен: <code>project_name</code> и <code>Project_Name</code> — разные подписи.
          </p>
          <p>
            Опечатка в имени похожа на попытку открыть соседний шкаф: Python не находит нужное значение и сообщает
            <code className="lesson-token">NameError</code>.
          </p>
        </div>
      </Section>

      <Section number="04" title="Значение можно заменить">
        <Lead>
          Переменная хранит текущее значение. Если в коробку положить новый предмет, при следующем обращении мы
          получим уже его.
        </Lead>

        <StepThrough
          code={'status = "new"\nprint(status)\nstatus = "done"\nprint(status)'}
          steps={[
            { line: 0, note: 'Сначала status хранит "new".', vars: { status: '"new"' } },
            { line: 1, note: "Первый print показывает new.", vars: { вывод: "new" } },
            { line: 2, note: 'Новое присваивание заменяет текущее значение на "done".', vars: { status: '"done"' } },
            { line: 3, note: "Второй print показывает done.", vars: { вывод: "new ⏎ done" } },
          ]}
        />

        <div className="lesson-practice-steps">
          <h3>Старое значение не печатается автоматически</h3>
          <p>
            Python не создаёт журнал каждого присваивания. Обычная переменная сообщает только своё текущее
            значение.
          </p>

          <h3>Справа используется текущее значение</h3>
          <p>
            В строке <code className="lesson-token">task_count = task_count + 1</code> Python сначала берёт старое
            число, прибавляет единицу и только затем сохраняет новый результат.
          </p>
        </div>

        <PredictOutput
          code={'task_count = 2\ntask_count = task_count + 1\nprint(task_count)'}
          output="3"
          hint="Сначала справа вычисляется 2 + 1, затем task_count получает новое значение."
        />
      </Section>

      <Section number="05" title="Четыре базовых типа данных">
        <Lead>
          Тип можно сравнить с формой контейнера. В бутылке удобно хранить воду, в коробке — обувь. Python тоже
          должен понимать, что перед ним: текст, целое число, дробь или ответ да/нет.
        </Lead>

        <TypeCards>
          <TypeCard badge="str" title="Текст" code={'project_name = "StudyHub"'}>
            Названия, сообщения, адреса и любые данные, которые нужно хранить как текст.
          </TypeCard>
          <TypeCard badge="int" badgeTone="float" title="Целое число" code="task_count = 5">
            Количество задач, номер версии или приоритет без дробной части.
          </TypeCard>
          <TypeCard badge="float" badgeTone="str" title="Дробное число" code="progress = 62.5">
            Проценты, вес, время или другая величина с дробной частью.
          </TypeCard>
          <TypeCard badge="bool" title="Да или нет" code="is_ready = True">
            Логический ответ: <code>True</code> или <code>False</code>.
          </TypeCard>
        </TypeCards>

        <div className="lesson-practice-steps">
          <p>
            <code>5</code> — число, а <code>"5"</code> — текст. Кавычки меняют смысл значения.
          </p>
          <p>
            Дробное число записывается с точкой: <code>62.5</code>. Запятая в Python не является десятичным
            разделителем одного числа.
          </p>
          <p>
            <code>True</code> и <code>False</code> пишутся без кавычек и с заглавной буквы. В кавычках это будет
            обычный текст.
          </p>
        </div>

        <Callout tone="info">
          Номер телефона и почтовый индекс часто хранят как текст: их не складывают, а ведущий ноль может быть
          важен.
        </Callout>
      </Section>

      <Section number="06" title="Как выбирать понятные имена">
        <Lead>
          Хорошее имя похоже на подпись на банке. Надпись «соль» помогает сразу понять содержимое, а надпись «x»
          заставляет открывать банку и проверять.
        </Lead>

        <CompareSolutions
          question="Какое имя понятнее?"
          left={{
            title: "Смысл скрыт",
            code: "x = 5",
            note: "Непонятно, что означает число.",
          }}
          right={{
            title: "Смысл виден",
            code: "task_count = 5",
            note: "Имя сообщает, что хранится количество задач.",
          }}
          preferred="right"
          explanation="Понятное имя экономит время при чтении и отладке."
        />

        <div className="lesson-practice-steps">
          <h3>Стиль snake_case</h3>
          <p>
            В Python слова в обычных именах соединяют подчёркиванием: <code>project_name</code>,
            <code>task_count</code>, <code>is_ready</code>.
          </p>

          <h3>Формальные правила</h3>
          <p>
            Имя не начинается с цифры, не содержит пробел и дефис. Подходят буквы, цифры после первого символа и
            подчёркивание.
          </p>

          <h3>Логическое имя читается как вопрос</h3>
          <p>
            <code>is_ready</code> читается как «готово ли?», поэтому значения True и False выглядят естественно.
          </p>
        </div>

        <FillBlank
          prompt="Соедините два слова в стиле snake_case."
          before="completed"
          after="tasks = 4"
          options={["_", "-", " "]}
          answer="_"
          explanation="В обычном имени слова соединяются подчёркиванием."
        />
      </Section>

      <Section number="07" title="Практикум StudyHub: первые данные проекта">
        <Lead>
          Добавим четыре простых значения. Они пока не образуют сложную программу, но уже позволяют хранить
          состояние StudyHub понятнее, чем набор несвязанных строк.
        </Lead>

        <div className="execution-example">
          <CodeBlock
            caption="studyhub/main.py"
            code={
              'project_name = "StudyHub Planner"\n' +
              'version = 1\n' +
              'progress_percent = 0.0\n' +
              'is_ready = True\n\n' +
              'print(project_name)\n' +
              'print(version)\n' +
              'print(progress_percent)\n' +
              'print(is_ready)'
            }
          />
          <TerminalDemo
            title="результат"
            lines={[
              { cmd: "python main.py" },
              { out: "StudyHub Planner" },
              { out: "1" },
              { out: "0.0" },
              { out: "True" },
            ]}
          />
        </div>

        <div className="lesson-practice-steps">
          <h3>Шаг 1. Предскажите вывод</h3>
          <p>Сначала прочитайте значения сверху вниз и запишите четыре ожидаемые строки.</p>

          <h3>Шаг 2. Измените по одному значению</h3>
          <p>
            Поменяйте версию на <code>2</code>, прогресс на <code>12.5</code>, затем готовность на <code>False</code>.
            После каждого изменения запускайте файл.
          </p>

          <h3>Шаг 3. Проверьте типы готовой командой</h3>
          <p>
            Временно добавьте <code>print(type(project_name).__name__)</code> и аналогичные строки. Пока не нужно
            разбирать устройство этой записи: она просто показывает названия типов.
          </p>
        </div>

        <BugHunt
          code={'project_name = StudyHub\nis_ready = "True"\nprint("project_name")'}
          question="Сколько разных проблем находится в примере?"
          options={["Три", "Одна", "Ни одной"]}
          correctIndex={0}
          explanation="Название без кавычек, логический ответ в кавычках и печать текста имени вместо значения."
          fix={'project_name = "StudyHub"\nis_ready = True\nprint(project_name)'}
        />
      </Section>

      <Section number="08" title="Проверьте основную модель">
        <Lead>
          Вопросы проверяют только базовые действия: создать имя, отличить имя от текста и выбрать тип по смыслу.
        </Lead>

        <div className="lesson-check-group">
          <QuizCard
            question="Что означает знак = в task_count = 3?"
            options={["Сохранить значение 3 под именем task_count", "Сравнить два числа", "Напечатать 3"]}
            correctIndex={0}
            explanation="Один знак = выполняет присваивание."
          />
          <QuizCard
            question={'Что выведет print("project_name")?'}
            options={["Текст project_name", "Значение переменной", "Ошибка"]}
            correctIndex={0}
            explanation="Кавычки превращают запись в обычный текст."
          />
          <QuizCard
            question="Какой тип лучше подходит для количества задач?"
            options={["int", "str", "bool"]}
            correctIndex={0}
            explanation="Количество без дробной части обычно хранится как целое число."
          />
          <QuizCard
            question="Какое имя подходит для ответа «готов ли проект»?"
            options={["is_ready", "value", "x"]}
            correctIndex={0}
            explanation="Имя is_ready читается как вопрос с ответом True или False."
          />
        </div>

        <KeyTakeaways
          points={[
            <>Переменная — понятное имя для текущего значения.</>,
            <>Знак <code>=</code> сохраняет значение справа под именем слева.</>,
            <>Имя нужно создать до первого использования.</>,
            <>Имя без кавычек означает переменную, а имя в кавычках — обычный текст.</>,
            <><code>str</code> хранит текст, <code>int</code> — целые, <code>float</code> — дробные, <code>bool</code> — True или False.</>,
            <>Понятные имена в snake_case снижают количество догадок.</>,
          ]}
        />

        <PracticeCta text="Создайте четыре переменные StudyHub, выведите их, измените по одному значению и после каждого изменения предскажите новый результат." />
      </Section>
    </RichLesson>
  );
}

// 05. Числа, операции и преобразование типов
export function Lesson05({ module }: { module?: string }) {
  return (
    <RichLesson>
      <RichHero
        chip={module ?? "Блок 1 · Старт и данные"}
        title="Числа, операции и преобразование типов"
        intro="Используем Python как понятный калькулятор: разберём основные операции, полные группы и остаток, а затем превратим текст с цифрами в настоящие числа."
        tags={[
          { icon: <Percent size={14} />, label: "+ · - · * · / · // · %" },
          { icon: <Keyboard size={14} />, label: "int() · float() · str()" },
        ]}
      />
      <TheoryBridge lesson={5} />

      <Section number="01" title="От чисел к вычислению">
        <Lead>
          Обычный калькулятор получает числа и знак операции. Python делает то же самое, но позволяет сохранить
          результат под понятным именем и использовать его дальше.
        </Lead>

        <div className="lesson-route">
          <ol>
            <li>
              <strong>Выполнить арифметику:</strong> сложить, вычесть, умножить или разделить числа.
            </li>
            <li>
              <strong>Разобрать деление:</strong> получить дробный результат, полные группы и остаток.
            </li>
            <li>
              <strong>Подготовить данные:</strong> превратить текст с цифрами в число перед вычислением.
            </li>
          </ol>
          <p>
            В конце StudyHub рассчитает общее время занятий и разделит минуты на полные часы и остаток.
          </p>
        </div>

        <Callout tone="info">
          Сначала проговаривайте вычисление словами. Код должен повторять понятное правило, а не быть набором
          случайно выбранных знаков.
        </Callout>
      </Section>

      <Section number="02" title="Основные арифметические операции">
        <Lead>
          Представьте кассовый чек: количество товаров умножается на цену, скидка вычитается, а итоговые суммы
          складываются. Операторы Python записывают те же знакомые действия.
        </Lead>

        <TypeCards>
          <TypeCard badge="+" title="Сложение" code="total = 5 + 3">
            Объединяет количества и даёт <code>8</code>.
          </TypeCard>
          <TypeCard badge="-" badgeTone="float" title="Вычитание" code="left = 10 - 4">
            Показывает, сколько осталось: <code>6</code>.
          </TypeCard>
          <TypeCard badge="*" badgeTone="str" title="Умножение" code="minutes = 5 * 45">
            Пять занятий по 45 минут дают <code>225</code> минут.
          </TypeCard>
          <TypeCard badge="/" title="Обычное деление" code="average = 10 / 4">
            Делит число на равные части и может вернуть дробный результат <code>2.5</code>.
          </TypeCard>
        </TypeCards>

        <StepThrough
          code={"lesson_count = 5\nminutes_per_lesson = 45\ntotal_minutes = lesson_count * minutes_per_lesson"}
          steps={[
            { line: 0, note: "Сохраняем количество занятий.", vars: { lesson_count: "5" } },
            { line: 1, note: "Сохраняем продолжительность одного занятия.", vars: { minutes_per_lesson: "45" } },
            {
              line: 2,
              note: "Справа вычисляется 5 * 45, затем результат 225 сохраняется в total_minutes.",
              vars: { total_minutes: "225" },
            },
          ]}
        />

        <div className="lesson-practice-steps">
          <p>
            Имена <code>lesson_count</code> и <code>minutes_per_lesson</code> объясняют формулу лучше, чем запись
            <code>5 * 45</code> без контекста.
          </p>
          <p>
            Отрицательное число не всегда является ошибкой Python. <code>3 - 5</code> честно даёт <code>-2</code>.
            Позже условия помогут запретить неподходящий результат для конкретной задачи.
          </p>
        </div>
      </Section>

      <Section number="03" title="Порядок действий и скобки">
        <Lead>
          Python использует знакомый школьный порядок: сначала скобки, затем умножение и деление, потом сложение и
          вычитание. Скобки похожи на пометку маркером: «эту часть посчитай первой».
        </Lead>

        <PredictOutput
          code={"print(2 + 3 * 4)\nprint((2 + 3) * 4)"}
          output={"14\n20"}
          hint="Без скобок сначала выполняется умножение. Во второй строке сначала вычисляется 2 + 3."
        />

        <CompareSolutions
          question="Как правильно вычислить среднее трёх оценок?"
          left={{
            title: "Делится только последнее число",
            code: "average = a + b + c / 3",
            note: "Python сначала разделит c на 3.",
          }}
          right={{
            title: "Делится вся сумма",
            code: "average = (a + b + c) / 3",
            note: "Скобки сначала собирают общую сумму.",
          }}
          preferred="right"
          explanation="Среднее требует разделить на три сумму всех значений."
        />

        <div className="lesson-practice-steps">
          <p>
            Если формула становится длинной, лучше создать промежуточное имя: сначала <code>total_score</code>,
            затем <code>average</code>.
          </p>
          <p>
            Обычное деление <code>/</code> возвращает дробный тип <code>float</code>, даже если результат выглядит
            целым: <code>8 / 2</code> даёт <code>4.0</code>.
          </p>
        </div>

        <FillBlank
          prompt="Выберите выражение, которое сначала вычислит сумму."
          before="average = "
          after=" / 3"
          options={["(a + b + c)", "a + b + c", "a + (b + c / 3)"]}
          answer="(a + b + c)"
          explanation="Скобки объединяют три числа до деления."
        />
      </Section>

      <Section number="04" title="Деление, полные коробки и остаток">
        <Lead>
          Представьте 125 минут. Можно узнать дробное количество часов, количество полных часов или оставшиеся
          минуты. Для каждого вопроса нужен свой оператор.
        </Lead>

        <TypeCards>
          <TypeCard badge="/" title="Разделить полностью" code="125 / 60">
            Получаем примерно <code>2.0833</code> часа.
          </TypeCard>
          <TypeCard badge="//" badgeTone="float" title="Сколько полных групп" code="125 // 60">
            В 125 минутах помещаются <code>2</code> полных часа.
          </TypeCard>
          <TypeCard badge="%" badgeTone="str" title="Что осталось" code="125 % 60">
            После двух полных часов остаётся <code>5</code> минут.
          </TypeCard>
        </TypeCards>

        <StepThrough
          code={"minutes = 125\nfull_hours = minutes // 60\nminutes_left = minutes % 60"}
          steps={[
            { line: 0, note: "Исходное время — 125 минут.", vars: { minutes: "125" } },
            { line: 1, note: "Оператор // находит два полных часа.", vars: { full_hours: "2" } },
            { line: 2, note: "Оператор % находит пять оставшихся минут.", vars: { minutes_left: "5" } },
          ]}
        />

        <div className="lesson-practice-steps">
          <h3>Аналогия с коробками</h3>
          <p>
            Если есть 8 яблок и коробки по 3, то <code>8 // 3</code> даёт две полные коробки, а <code>8 % 3</code>
            — два яблока, которые остались снаружи.
          </p>

          <h3>Знак % не вычисляет процент автоматически</h3>
          <p>
            В Python это остаток от деления. Процент вычисляется отдельной формулой, например
            <code>completed / total * 100</code>.
          </p>
        </div>
      </Section>

      <Section number="05" title="Почему цифры из input() остаются текстом">
        <Lead>
          Поле ввода похоже на бумажную анкету: всё, что человек написал, сначала приходит как текст. Даже запись
          <code>18</code> после <code>input()</code> имеет тип <code>str</code>.
        </Lead>

        <div className="execution-example">
          <CodeBlock
            caption="неподготовленный ввод"
            code={'age_text = input("Возраст: ")\nprint(age_text + "1")'}
          />
          <TerminalDemo
            title="строки соединяются"
            lines={[
              { cmd: "python main.py" },
              { out: "Возраст: 18" },
              { out: "181" },
            ]}
          />
        </div>

        <TypeCards>
          <TypeCard badge="int()" title="Сделать целое число" code={'age = int("18")'}>
            Получается число <code>18</code>, с которым можно выполнять арифметику.
          </TypeCard>
          <TypeCard badge="float()" badgeTone="float" title="Сделать дробное число" code={'price = float("2.5")'}>
            Получается дробное значение <code>2.5</code>. В записи используется точка.
          </TypeCard>
          <TypeCard badge="str()" badgeTone="str" title="Сделать текст" code="text = str(18)">
            Число превращается в строку <code>"18"</code>.
          </TypeCard>
        </TypeCards>

        <CodeSequence
          title="Подготовьте возраст до вычисления"
          prompt="Соберите понятный маршрут."
          pieces={[
            { id: "input", code: 'age_text = input("Возраст: ")' },
            { id: "convert", code: "age = int(age_text)" },
            { id: "calculate", code: "next_age = age + 1" },
            { id: "show", code: "print(next_age)" },
          ]}
          correctOrder={["input", "convert", "calculate", "show"]}
          explanation="Сначала приходит текст, затем создаётся число, после чего выполняется сложение."
        />

        <Callout tone="info">
          Телефон, индекс или номер документа не всегда нужно превращать в число. Если данные не участвуют в
          арифметике, строка может быть правильным выбором.
        </Callout>
      </Section>

      <Section number="06" title="Три понятных причины ошибки">
        <Lead>
          Название ошибки не нужно зубрить отдельно. Сначала посмотрите, что именно Python пытался сделать: соединить
          несовместимые типы, преобразовать неподходящий текст или разделить на ноль.
        </Lead>

        <TypeCards>
          <TypeCard badge="TypeError" title="Не подходят типы" code={'"18" + 1'}>
            Строка и целое число не складываются одним оператором.
          </TypeCard>
          <TypeCard badge="ValueError" badgeTone="float" title="Не подходит содержимое" code={'int("восемнадцать")'}>
            int умеет принимать строку, но эта строка не является записью целого числа.
          </TypeCard>
          <TypeCard badge="ZeroDivisionError" badgeTone="str" title="Деление на ноль" code="10 / 0">
            Нельзя разделить количество на нулевое число частей.
          </TypeCard>
        </TypeCards>

        <BugHunt
          code={'progress_text = "72,5"\nprogress = float(progress_text)'}
          question="Почему дробное значение не преобразуется?"
          options={[
            "В Python внутри числовой строки нужна точка",
            "float не принимает строки",
            "Имя progress запрещено",
          ]}
          correctIndex={0}
          explanation="Для float используется запись 72.5."
          fix={'progress_text = "72.5"\nprogress = float(progress_text)'}
        />

        <div className="lesson-practice-steps">
          <p>
            После ошибки прочитайте последнюю строку сообщения и найдите операцию, которая не смогла завершиться.
          </p>
          <p>
            Не исправляйте весь файл одновременно. Измените один тип, одну строку или один делитель и запустите код
            снова.
          </p>
        </div>
      </Section>

      <Section number="07" title="Практикум StudyHub: учебное время">
        <Lead>
          Соединим переменные прошлого занятия с арифметикой. Формула остаётся простой: количество занятий умножить
          на продолжительность одного занятия.
        </Lead>

        <div className="execution-example">
          <CodeBlock
            caption="studyhub/main.py"
            code={
              'project_name = "StudyHub"\n' +
              'lesson_count = 5\n' +
              'minutes_per_lesson = 45\n\n' +
              'total_minutes = lesson_count * minutes_per_lesson\n' +
              'full_hours = total_minutes // 60\n' +
              'minutes_left = total_minutes % 60\n\n' +
              'print(project_name)\n' +
              'print(total_minutes)\n' +
              'print(full_hours)\n' +
              'print(minutes_left)'
            }
          />
          <TerminalDemo
            title="ожидаемый результат"
            lines={[
              { cmd: "python main.py" },
              { out: "StudyHub" },
              { out: "225" },
              { out: "3" },
              { out: "45" },
            ]}
          />
        </div>

        <div className="lesson-practice-steps">
          <h3>Шаг 1. Проговорите формулу</h3>
          <p>Пять занятий по 45 минут дают 225 минут.</p>

          <h3>Шаг 2. Разделите время</h3>
          <p>225 минут содержат три полных часа и ещё 45 минут.</p>

          <h3>Шаг 3. Проверьте простые границы</h3>
          <p>
            Временно подставьте <code>0</code>, <code>59</code>, <code>60</code> и <code>61</code>. До запуска
            предскажите количество полных часов и остаток минут.
          </p>

          <h3>Шаг 4. Измените исходные данные</h3>
          <p>
            Поставьте <code>lesson_count = 4</code> и <code>minutes_per_lesson = 30</code>. Ожидается 120 минут,
            два полных часа и ноль минут остатка.
          </p>
        </div>

        <FillBlank
          prompt="Выберите оператор для оставшихся минут."
          before="minutes_left = total_minutes "
          after=" 60"
          options={["%", "//", "/"]}
          answer="%"
          explanation="Оператор % возвращает остаток после выделения полных часов."
        />
      </Section>

      <Section number="08" title="Проверьте числовую модель">
        <Lead>
          Итоговые вопросы проверяют выбор операции и момент преобразования текста в число.
        </Lead>

        <div className="lesson-check-group">
          <QuizCard
            question="Что вернёт 8 // 3?"
            options={["2", "2.666...", "3"]}
            correctIndex={0}
            explanation="В восьми помещаются две полные группы по три."
          />
          <QuizCard
            question="Что вернёт 8 % 3?"
            options={["2", "3", "2.666..."]}
            correctIndex={0}
            explanation="После двух полных групп остаётся два."
          />
          <QuizCard
            question="Какой тип возвращает input()?"
            options={["str", "int", "float"]}
            correctIndex={0}
            explanation="Ввод пользователя сначала приходит как текст."
          />
          <QuizCard
            question={'Что произойдёт при int("abc")?'}
            options={["ValueError", "Получится 0", "Получится abc"]}
            correctIndex={0}
            explanation="Строка abc не является записью целого числа."
          />
        </div>

        <KeyTakeaways
          points={[
            <>Python может использоваться как калькулятор и сохранять результаты в переменных.</>,
            <>Умножение и деление выполняются раньше сложения, если нет скобок.</>,
            <><code>/</code> даёт обычное деление, <code>//</code> — полные группы, <code>%</code> — остаток.</>,
            <><code>input()</code> возвращает строку, даже если человек ввёл цифры.</>,
            <><code>int()</code> и <code>float()</code> подготавливают текстовые числа к вычислению.</>,
            <>TypeError, ValueError и ZeroDivisionError описывают разные причины проблемы.</>,
          ]}
        />

        <PracticeCta text="Рассчитайте учебное время StudyHub, разделите минуты на полные часы и остаток, затем проверьте значения 0, 59, 60 и 61." />
      </Section>
    </RichLesson>
  );
}