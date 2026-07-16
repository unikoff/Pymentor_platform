import { GitFork, Quote, Repeat, Scale, Sigma, SkipForward, Type } from "lucide-react";
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
  PracticeCta,
  PredictOutput,
  QuizCard,
  RecallCard,
  RichHero,
  RichLesson,
  Section,
  SliceExplorer,
  StepThrough,
  TrueFalse,
  TypeCard,
  TypeCards,
} from "../shared";

type TheoryBridgeData = { link: string; boundary: string };

const THEORY_BRIDGES: Record<number, TheoryBridgeData> = {
  6: {"link":"После чисел разбираем текст как последовательность символов: индекс, срез и метод позволяют получить новый результат из строки.","boundary":"Первый символ имеет индекс 0, а строка не меняется по одной букве; проверяйте оба правила короткими примерами."},
  7: {"link":"Данные уже можно хранить, но для решения нужен ответ «да» или «нет»: сравнение создаёт bool, а логика соединяет условия.","boundary":"True и False — значения результата; управлять веткой программы они начнут только в следующем уроке."},
  8: {"link":"Логическое условие становится выбором действия: if запускает один блок, elif и else описывают другие варианты той же цепочки.","boundary":"Несколько независимых if могут сработать вместе; это не то же самое, что одна цепочка взаимоисключающих решений."},
  9: {"link":"Условие выбирает путь для одного случая, а for применяет одинаковый шаг к каждому элементу последовательности.","boundary":"range не включает правую границу; сначала проверяйте его на двух-трёх значениях."},
  10: {"link":"for подходит для известной последовательности; while нужен, когда повторение продолжается, пока выполняется условие.","boundary":"while не «сильнее» for: в нём всегда должны быть видны проверка и изменение, которое когда-нибудь остановит цикл."},
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


// 06. Строки и форматирование
export function Lesson06({ module }: { module?: string }) {
  return (
    <RichLesson>
      <RichHero
        chip={module ?? "Блок 2 · Текст, логика, повторение"}
        title="Строки и форматирование"
        intro="Научимся работать с текстом как с последовательностью символов: находить отдельные буквы, брать фрагменты, очищать пользовательский ввод и собирать понятные сообщения."
        tags={[
          { icon: <Quote size={14} />, label: "индексы и срезы" },
          { icon: <Type size={14} />, label: "методы и f-строки" },
        ]}
      />
      <TheoryBridge lesson={6} />

      <Section number="01" title="Что изменится после занятия">
        <Lead>
          В первом блоке строка была просто текстовым значением. Теперь научимся разбирать её на части и аккуратно
          подготавливать для проекта. Представьте надпись на длинной ленте: каждый символ занимает своё место, а
          Python умеет взять одну позицию или вырезать целый фрагмент.
        </Lead>

        <div className="lesson-route">
          <ol>
            <li>
              <strong>Найти символ:</strong> получить одну букву по её позиции через{" "}
              <code className="lesson-token">text[index]</code>.
            </li>
            <li>
              <strong>Взять фрагмент:</strong> получить часть текста через{" "}
              <code className="lesson-token">text[start:end]</code>.
            </li>
            <li>
              <strong>Подготовить ввод:</strong> убрать лишние пробелы и сохранить новый результат.
            </li>
            <li>
              <strong>Собрать сообщение:</strong> вставить значения в готовый шаблон через f-строку.
            </li>
          </ol>
          <p>
            В конце вы подготовите название задачи StudyHub и соберёте из него готовую текстовую карточку.
          </p>
        </div>

        <Callout tone="info">
          На этом уроке достаточно менять одну вещь за раз: один индекс, одну границу среза или один строковый метод.
        </Callout>
      </Section>

      <Section number="02" title="Строка похожа на ряд пронумерованных ячеек">
        <Lead>
          Представьте ряд ящиков, в каждом из которых лежит один символ. Номер ящика называется{" "}
          <span className="lesson-emphasis">индексом</span>. В Python нумерация начинается с нуля.
        </Lead>

        <CodeBlock
          caption="позиции символов"
          code={"P  y  t  h  o  n\n0  1  2  3  4  5\n-6 -5 -4 -3 -2 -1"}
        />

        <div className="lesson-practice-steps">
          <h3>Почему первый индекс равен 0</h3>
          <p>
            Индекс можно читать как количество шагов от начала строки. До первого символа нужно сделать{" "}
            <strong>ноль шагов</strong>, поэтому его индекс — <code className="lesson-token">0</code>.
          </p>

          <h3>Отрицательные индексы</h3>
          <p>
            Если считать удобнее с конца, последний символ имеет индекс{" "}
            <code className="lesson-token">-1</code>, предпоследний — <code>-2</code>.
          </p>
        </div>

        <PredictOutput
          code={'language = "Python"\nprint(language[0])\nprint(language[2])\nprint(language[-1])'}
          output={"P\nt\nn"}
          hint="0 — первый символ, 2 — третий, -1 — последний."
        />

        <BugHunt
          code={'title = "Git"\nprint(title[3])'}
          question="Почему Python не может получить символ с индексом 3?"
          options={[
            "У строки Git существуют только позиции 0, 1 и 2",
            "Индекс нужно записать в кавычках",
            "Строки нельзя передавать в print",
          ]}
          correctIndex={0}
          explanation="Длина строки равна трём, но последний существующий индекс равен двум."
          fix={'title = "Git"\nprint(title[-1])  # t'}
        />

        <Callout>
          Если запрашиваемой позиции нет, Python сообщает <code className="lesson-token">IndexError</code>. У пустой
          строки <code className="lesson-token">""</code> нет даже индекса <code>0</code>.
        </Callout>
      </Section>

      <Section number="03" title="Срез — фрагмент между двумя границами">
        <Lead>
          Одиночный индекс похож на выбор одного ящика. Срез похож на отрезок ленты: мы указываем, где начать и перед
          какой позицией остановиться.
        </Lead>

        <SliceExplorer text="backend" initialStart={0} initialEnd={4} />

        <div className="lesson-practice-steps">
          <h3>Левая граница входит</h3>
          <p>
            В <code className="lesson-token">text[0:4]</code> символ с индексом <code>0</code> попадёт в результат.
          </p>

          <h3>Правая граница не входит</h3>
          <p>
            Индекс <code>4</code> показывает место остановки. Поэтому{" "}
            <code className="lesson-token">"backend"[0:4]</code> возвращает{" "}
            <code className="lesson-token">"back"</code>.
          </p>

          <h3>Одну границу можно пропустить</h3>
          <p>
            <code className="lesson-token">text[:3]</code> означает «от начала до позиции 3», а{" "}
            <code className="lesson-token">text[4:]</code> — «от позиции 4 до конца».
          </p>
        </div>

        <TypeCards>
          <TypeCard badge="[0:4]" title="Начало строки" code={'"backend"[0:4]  # "back"'}>
            Берём символы с позиций 0, 1, 2 и 3.
          </TypeCard>
          <TypeCard badge="[:3]" badgeTone="float" title="Начало можно не писать" code={'"Python"[:3]  # "Pyt"'}>
            Пустое место слева означает начало строки.
          </TypeCard>
          <TypeCard badge="[3:]" badgeTone="str" title="Конец можно не писать" code={'"Python"[3:]  # "hon"'}>
            Пустое место справа означает конец строки.
          </TypeCard>
        </TypeCards>

        <TrueFalse
          statement={
            <>
              Срез <code>"Python"[2:2]</code> вызывает <code>IndexError</code>.
            </>
          }
          isTrue={false}
          explanation="Начало и конец совпадают, поэтому получается пустая строка."
        />

        <Callout tone="info">
          Срезы мягче одиночного индекса: <code>"Git"[0:20]</code> просто остановится на конце строки, а{" "}
          <code>"Git"[20]</code> вызовет ошибку.
        </Callout>
      </Section>

      <Section number="04" title="Строка не меняется по одной букве">
        <Lead>
          Строку удобно представить как уже напечатанную наклейку. Нельзя стереть только одну букву внутри готовой
          наклейки. Нужно создать новую надпись и при необходимости сохранить её под тем же именем.
        </Lead>

        <StepThrough
          code={'title = "python"\ntitle.upper()\nprint(title)\ntitle = title.upper()\nprint(title)'}
          steps={[
            { line: 0, note: 'title получает строку "python".', vars: { title: '"python"' } },
            {
              line: 1,
              note: 'upper() создаёт новую строку "PYTHON", но мы её пока не сохранили.',
              vars: { title: '"python"', "новая строка": '"PYTHON"' },
            },
            { line: 2, note: "Поэтому печатается прежнее значение.", vars: { title: '"python"', вывод: "python" } },
            {
              line: 3,
              note: "Теперь новое значение присваивается обратно переменной title.",
              vars: { title: '"PYTHON"' },
            },
            { line: 4, note: "Печатается уже сохранённая строка.", vars: { title: '"PYTHON"', вывод: "PYTHON" } },
          ]}
        />

        <CompareSolutions
          question="Какой вариант сохраняет результат upper()?"
          left={{
            title: "Новая строка потеряна",
            code: 'title = "python"\ntitle.upper()',
            note: "Метод создал результат, но мы не дали ему имя.",
          }}
          right={{
            title: "Новая строка сохранена",
            code: 'title = "python"\ntitle = title.upper()',
            note: "Переменная title теперь хранит новое значение.",
          }}
          preferred="right"
          explanation="Строковые методы возвращают новую строку. Результат нужно присвоить переменной или сразу использовать."
        />

        <BugHunt
          code={'title = "python"\ntitle[0] = "P"'}
          question="Почему нельзя заменить первый символ таким способом?"
          options={[
            "Строки неизменяемы",
            "Индекс 0 не существует",
            "Буквы можно менять только внутри print",
          ]}
          correctIndex={0}
          explanation="Python не меняет отдельный символ готовой строки."
          fix={'title = "python"\ntitle = "P" + title[1:]\nprint(title)  # Python'}
        />
      </Section>

      <Section number="05" title="Строковые методы — инструменты для нового текста">
        <Lead>
          Методы можно представить как инструменты на рабочем столе. Каждый выполняет одно действие и возвращает
          новую строку. Перед использованием сначала проговорите, какую проблему нужно решить.
        </Lead>

        <TypeCards>
          <TypeCard badge="strip" title="Очистить края" code={'"  SQL  ".strip()  # "SQL"'}>
            Убирает пробельные символы только в начале и в конце.
          </TypeCard>
          <TypeCard badge="lower" badgeTone="float" title="Нижний регистр" code={'"Python".lower()  # "python"'}>
            Удобно для сравнений, когда регистр не должен влиять на результат.
          </TypeCard>
          <TypeCard badge="upper" badgeTone="str" title="Верхний регистр" code={'"sql".upper()  # "SQL"'}>
            Создаёт новую строку из заглавных букв.
          </TypeCard>
          <TypeCard badge="replace" title="Заменить фрагмент" code={'"Python course".replace("course", "backend")'}>
            Находит указанный фрагмент и создаёт строку с заменой.
          </TypeCard>
        </TypeCards>

        <CodeBlock
          caption="понятная последовательность"
          code={
            'raw_title = "  Изучить Python  "\n' +
            "clean_title = raw_title.strip()\n" +
            "normalized_title = clean_title.lower()\n\n" +
            "print(raw_title)\n" +
            "print(clean_title)\n" +
            "print(normalized_title)"
          }
        />

        <div className="lesson-practice-steps">
          <h3>Почему полезны отдельные переменные</h3>
          <p>
            Новичку легче увидеть три этапа: исходный текст, очищенный текст и нормализованный текст. Позже действия
            можно объединять в цепочку.
          </p>

          <h3>Что strip() не делает</h3>
          <p>
            Метод не удаляет пробелы между словами. Строка <code>"  Python   backend  "</code> сохранит внутренние
            пробелы после очистки краёв.
          </p>

          <h3>Не меняйте текст без правила</h3>
          <p>
            Автоматическое <code>capitalize()</code> может превратить <code>"SQL"</code> в <code>"Sql"</code>.
            Сначала определите, допустимо ли это для данных проекта.
          </p>
        </div>
      </Section>

      <Section number="06" title="F-строка — шаблон с местами для значений">
        <Lead>
          Представьте готовый бланк: «Задача: ___; приоритет: ___». F-строка позволяет оставить в тексте места и
          подставить туда значения переменных.
        </Lead>

        <CodeBlock
          caption="карточка задачи"
          code={
            'title = "Изучить строки"\n' +
            "priority = 4\n\n" +
            'message = f"Задача: {title}; приоритет: {priority}"\n' +
            "print(message)"
          }
        />

        <div className="lesson-practice-steps">
          <h3>Буква f включает подстановку</h3>
          <p>
            Без буквы <code className="lesson-token">f</code> фигурные скобки останутся обычным текстом.
          </p>

          <h3>В фигурных скобках находится выражение</h3>
          <p>
            Python берёт значение <code>title</code>, затем значение <code>priority</code> и вставляет их в готовую
            строку.
          </p>

          <h3>Число не нужно преобразовывать вручную</h3>
          <p>
            F-строка умеет вставлять и строки, и числа. Поэтому запись читается проще, чем сложение нескольких частей
            через <code>+</code>.
          </p>
        </div>

        <CompareSolutions
          question="Какой вариант проще прочитать и изменить?"
          left={{
            title: "Склеивание частей",
            code: '"Задача: " + title + "; приоритет: " + str(priority)',
            note: "Нужно вручную преобразовать число и следить за пробелами.",
          }}
          right={{
            title: "Шаблон f-строки",
            code: 'f"Задача: {title}; приоритет: {priority}"',
            note: "Видно итоговую форму сообщения.",
          }}
          preferred="right"
          explanation="F-строка показывает шаблон целиком и сама преобразует вставляемые значения в текст."
        />

        <FillBlank
          prompt="Вставьте значение переменной title в f-строку."
          before={'message = f"Задача: {'}
          after={'}"'}
          options={["title", '"title"', "print"]}
          answer="title"
          explanation="В фигурных скобках указывается имя переменной без кавычек."
        />
      </Section>

      <Section number="07" title="split() и join(): разделить и собрать">
        <Lead>
          Эти методы удобно представить как ножницы и соединительную ленту.{" "}
          <code className="lesson-token">split()</code> разделяет одну строку на части, а{" "}
          <code className="lesson-token">join()</code> соединяет несколько строк выбранным разделителем.
        </Lead>

        <CodeBlock
          caption="теги StudyHub"
          code={
            'tags_text = "python,sql,git"\n' +
            'tags = tags_text.split(",")\n' +
            'formatted_tags = " | ".join(tags)\n\n' +
            "print(tags)\n" +
            "print(formatted_tags)"
          }
        />

        <div className="lesson-practice-steps">
          <h3>Что возвращает split()</h3>
          <p>
            Python получает несколько частей внутри квадратных скобок:{" "}
            <code className="lesson-token">["python", "sql", "git"]</code>. Это список. Подробно списки будут
            изучаться в следующем блоке; сейчас достаточно увидеть результат.
          </p>

          <h3>Кто вызывает join()</h3>
          <p>
            Метод вызывается у строки-разделителя: <code className="lesson-token">" | ".join(tags)</code>. Python
            помещает эту строку между частями.
          </p>
        </div>

        <CodeBlock
          caption="практика StudyHub"
          code={
            'raw_title = "  Изучить строки  "\n' +
            "priority = 4\n\n" +
            "title = raw_title.strip()\n" +
            'card = f"Задача: {title}; приоритет: {priority}"\n' +
            "print(card)"
          }
        />

        <RecallCard
          question="Чем индекс отличается от среза?"
          hint="Подумайте, сколько символов получается и что происходит при слишком большой границе."
          answer={
            <p>
              Индекс получает один символ и требует существующую позицию. Срез получает фрагмент, не включает правую
              границу и может спокойно остановиться на конце строки.
            </p>
          }
        />

        <Callout tone="info">
          В задаче платформы используйте аргументы функции и <code>return</code>. Не добавляйте <code>input()</code>,
          если значение уже передано в <code>solve(...)</code>.
        </Callout>
      </Section>

      <Section number="08" title="Проверь основную модель">
        <Lead>
          Вопросы проверяют только главные действия: получить символ, взять фрагмент, сохранить результат метода и
          собрать сообщение.
        </Lead>

        <div className="lesson-check-group">
          <QuizCard
            question={'Что вернёт "Python"[0]?'}
            options={["P", "y", "Python"]}
            correctIndex={0}
            explanation="Индекс 0 обозначает первый символ."
          />
          <QuizCard
            question={'Что вернёт "backend"[0:4]?'}
            options={["back", "backe", "end"]}
            correctIndex={0}
            explanation="Правая граница 4 не включается."
          />
          <QuizCard
            question="Что произойдёт после title.upper(), если результат не сохранить?"
            options={["title останется прежним", "title изменится навсегда", "возникнет IndexError"]}
            correctIndex={0}
            explanation="Метод возвращает новую строку, но исходная переменная не меняется."
          />
          <QuizCard
            question="Что удаляет strip()?"
            options={["Пробельные символы по краям", "Все пробелы внутри строки", "Все буквы нижнего регистра"]}
            correctIndex={0}
            explanation="Внутренние пробелы сохраняются."
          />
          <QuizCard
            question="Зачем нужна буква f перед строкой?"
            options={[
              "Разрешить подстановку значений в фигурные скобки",
              "Сделать все буквы заглавными",
              "Разделить строку на части",
            ]}
            correctIndex={0}
            explanation="F-строка вычисляет выражения в фигурных скобках и вставляет результат в текст."
          />
        </div>

        <KeyTakeaways
          points={[
            <>Строка состоит из символов с позициями, а первый индекс равен <code>0</code>.</>,
            <>Отрицательный индекс <code>-1</code> обозначает последний символ.</>,
            <>Срез получает фрагмент и не включает правую границу.</>,
            <>Строка неизменяема: методы возвращают новое значение.</>,
            <><code>strip()</code> очищает только края строки.</>,
            <>F-строка вставляет значения в понятный текстовый шаблон.</>,
            <><code>split()</code> разделяет строку, а <code>join()</code> соединяет части.</>,
          ]}
        />

        <PracticeCta text="Откройте practice.py: очистите заголовок задачи, получите его первую и последнюю буквы и соберите карточку через f-строку." />
      </Section>
    </RichLesson>
  );
}

// 07. Boolean, сравнения и логика
export function Lesson07({ module }: { module?: string }) {
  return (
    <RichLesson>
      <RichHero
        variant="bool"
        chip={module ?? "Блок 2 · Текст, логика, повторение"}
        title="Boolean, сравнения и логика"
        intro="Научимся задавать Python простые вопросы с ответом «да» или «нет»: сравнивать значения, учитывать границы и соединять несколько проверок."
        tags={[
          { icon: <Scale size={14} />, label: "сравнения и границы" },
          { icon: <GitFork size={14} />, label: "and · or · not" },
        ]}
      />
      <TheoryBridge lesson={7} />

      <Section number="01" title="Маршрут занятия">
        <Lead>
          Представьте обычный вопрос: «задача выполнена?» Ответ может быть только «да» или «нет». Python хранит
          такие ответы как <code>True</code> и <code>False</code>. Сначала мы формулируем вопрос словами, а затем
          переводим его в код.
        </Lead>

        <div className="lesson-route">
          <ol>
            <li>
              <strong>Получить ответ:</strong> сравнить значения через{" "}
              <code className="lesson-token">&gt;</code>, <code className="lesson-token">&gt;=</code>,{" "}
              <code className="lesson-token">==</code> и другие операторы.
            </li>
            <li>
              <strong>Соединить проверки:</strong> прочитать <code className="lesson-token">and</code>,{" "}
              <code className="lesson-token">or</code> и <code className="lesson-token">not</code> как части правила.
            </li>
            <li>
              <strong>Проверить границы:</strong> отдельно протестировать значение на пороге, ниже и выше него.
            </li>
          </ol>
          <p>
            В конце вы соберёте правило срочной задачи StudyHub и научитесь отличать настоящее <code>False</code> от
            строки <code>&quot;False&quot;</code>.
          </p>
        </div>

        <Callout tone="info">
          Не нужно запоминать таблицу логики заранее. Сначала проговаривайте вопрос обычными словами, затем
          подставляйте конкретные значения и только после этого записывайте операторы.
        </Callout>
      </Section>

      <Section number="02" title="bool отвечает на вопрос">
        <Lead>
          Тип <code className="lesson-token">bool</code> можно сравнить с выключателем: он находится только в одном
          из двух положений. <code>True</code> означает «да», <code>False</code> — «нет». Хорошее имя переменной
          сразу показывает, какой вопрос мы задаём.
        </Lead>

        <TypeCards>
          <TypeCard badge="is_" title="Состояние" code={"is_done = False"}>
            Читается как «выполнена ли задача?».
          </TypeCard>
          <TypeCard badge="has_" badgeTone="float" title="Наличие" code={"has_access = True"}>
            Читается как «есть ли доступ?».
          </TypeCard>
          <TypeCard badge="can_" badgeTone="str" title="Возможность" code={"can_start = True"}>
            Читается как «можно ли начать?».
          </TypeCard>
        </TypeCards>

        <BugHunt
          code={'is_done = "False"\nprint(type(is_done).__name__)'}
          question="Почему переменная не является boolean?"
          options={[
            "False можно использовать только в if",
            "Кавычки превратили значение в строку",
            "Имя должно начинаться с has_",
          ]}
          correctIndex={1}
          explanation={'Значение "False" — обычный текст типа str. Boolean записывается без кавычек.'}
          fix={'is_done = False\nprint(type(is_done).__name__)  # bool'}
        />

        <div className="lesson-practice-steps">
          <p>
            Имя <code className="lesson-token">status</code> слишком широкое: статус может быть строкой{" "}
            <code>&quot;new&quot;</code>, <code>&quot;done&quot;</code> или другим значением. Имя <code>is_done</code> явно обещает
            два состояния.
          </p>
        </div>
      </Section>

      <Section number="03" title="Сравнения создают логический результат">
        <Lead>
          Сравнение похоже на проверку на входе: охранник не меняет возраст человека, а только отвечает, подходит
          ли он под правило. Python тоже не меняет значения, а возвращает <code>True</code> или <code>False</code>.
        </Lead>

        <MatchPairs
          prompt="Соедините оператор с его смыслом."
          leftTitle="Оператор"
          rightTitle="Проверка"
          pairs={[
            { left: ">", right: "больше" },
            { left: ">=", right: "больше или равно" },
            { left: "==", right: "равно" },
            { left: "!=", right: "не равно" },
          ]}
          explanation="Операторы сравнения всегда дают логический ответ."
        />

        <PredictOutput
          code={"priority = 4\nprint(priority > 3)\nprint(priority >= 4)\nprint(priority == 5)\nprint(priority != 1)"}
          output={"True\nTrue\nFalse\nTrue"}
          hint="Проверяйте каждую строку независимо."
        />

        <div className="lesson-practice-steps">
          <p>
            <code className="lesson-token">=</code> выполняет присваивание, а{" "}
            <code className="lesson-token">==</code> сравнивает. Это разные операции.
          </p>
          <p>
            Строки сравниваются вместе с регистром и пробелами: <code>&quot;Done&quot; == &quot;done&quot;</code> и{" "}
            <code>&quot;done &quot; == &quot;done&quot;</code> возвращают <code>False</code>.
          </p>
        </div>
      </Section>

      <Section number="04" title="Граница входит или не входит">
        <Lead>
          Границу удобно представить как ростовую отметку у аттракциона. Фраза «от 120 сантиметров» включает
          ровно 120. Так же правило «приоритет от четырёх» включает значение <code>4</code>, поэтому нужен
          оператор <code>&gt;=</code>.
        </Lead>

        <CodeBlock
          caption="проверяем точку перехода"
          code={
            "print(3 >= 4)  # ниже границы: False\n" +
            "print(4 >= 4)  # на границе: True\n" +
            "print(5 >= 4)  # выше границы: True"
          }
        />

        <CompareSolutions
          question="Какое выражение соответствует правилу «приоритет от 4 включительно»?"
          left={{
            title: "Граница потеряна",
            code: "is_high = priority > 4",
            note: "Значение 4 ошибочно исключено.",
          }}
          right={{
            title: "Граница включена",
            code: "is_high = priority >= 4",
            note: "Подходят 4, 5 и более высокие значения.",
          }}
          preferred="right"
          explanation="Оператор >= включает само граничное значение."
        />

        <TrueFalse
          statement={
            <>
              Для диапазона от 1 до 5 включительно подходит выражение <code>1 &lt;= priority &lt;= 5</code>.
            </>
          }
          isTrue={true}
          explanation="Обе границы включены, а Python поддерживает цепочки сравнений."
        />

        <Callout>
          Минимальный набор проверки правила: значение ниже границы, значение на границе и значение выше границы.
        </Callout>
      </Section>

      <Section number="05" title="and, or и not">
        <Lead>
          Логические операторы соединяют несколько ответов «да» и «нет». Представьте пропуск на мероприятие:
          иногда нужны и билет, и документ; иногда подойдёт телефон или email; иногда нужно проверить, что задача
          ещё не выполнена.
        </Lead>

        <TypeCards>
          <TypeCard badge="and" title="Оба условия" code={"True and False  # False"}>
            Истинно только тогда, когда истинны обе части.
          </TypeCard>
          <TypeCard badge="or" badgeTone="float" title="Хотя бы одно" code={"False or True  # True"}>
            Истинно, когда истинна хотя бы одна часть.
          </TypeCard>
          <TypeCard badge="not" badgeTone="str" title="Отрицание" code={"not False  # True"}>
            Меняет логический ответ на противоположный.
          </TypeCard>
        </TypeCards>

        <MatchPairs
          prompt="Соедините правило с оператором."
          pairs={[
            { left: "нужны пропуск и подтверждение", right: "and" },
            { left: "подойдёт email или телефон", right: "or" },
            { left: "задача ещё не выполнена", right: "not is_done" },
          ]}
          explanation="Оператор выбирается по смыслу человеческой фразы."
        />

        <RecallCard
          question="Когда выражение a or b возвращает False?"
          hint="Достаточно ли одной истинной части?"
          answer={<p>Только когда обе части равны False.</p>}
        />
      </Section>

      <Section number="06" title="Переводим правило в выражение">
        <Lead>
          Длинное правило лучше не читать одним куском. Разделим его на два простых вопроса:
          «приоритет высокий?» и «задача ещё открыта?». Затем соединим ответы словом <code>and</code>.
        </Lead>

        <StepThrough
          code={
            "priority = 5\n" +
            "is_done = True\n" +
            "has_high_priority = priority >= 4\n" +
            "is_open = not is_done\n" +
            "is_urgent = has_high_priority and is_open"
          }
          steps={[
            { line: 0, note: "Приоритет равен 5.", vars: { priority: "5" } },
            { line: 1, note: "Задача уже завершена.", vars: { is_done: "True" } },
            { line: 2, note: "5 >= 4 даёт True.", vars: { has_high_priority: "True" } },
            { line: 3, note: "not True даёт False.", vars: { is_open: "False" } },
            {
              line: 4,
              note: "True and False даёт False: завершённая задача не срочная.",
              vars: { is_urgent: "False" },
            },
          ]}
        />

        <CompareSolutions
          question="Какой вариант легче объяснить при первом знакомстве со сложным правилом?"
          left={{
            title: "Одна строка",
            code: "is_urgent = priority >= 4 and not is_done",
            note: "Коротко, но новичку нужно разобрать несколько операций сразу.",
          }}
          right={{
            title: "Промежуточные вопросы",
            code:
              "has_high_priority = priority >= 4\n" +
              "is_open = not is_done\n" +
              "is_urgent = has_high_priority and is_open",
            note: "Каждая часть правила получила понятное имя.",
          }}
          preferred="right"
          explanation="После понимания промежуточный вариант можно безопасно сократить до одной строки."
        />

        <Callout>
          Избегайте двойных отрицаний вроде{" "}
          <code className="lesson-token lesson-token--danger">not is_not_done</code>. Положительные имена читаются
          быстрее.
        </Callout>
      </Section>

      <Section number="07" title="Truthy, falsy и практика StudyHub">
        <Lead>
          Python умеет воспринимать некоторые значения как «пусто» или «не пусто». Пустая корзина, нулевое
          количество и пустая строка обычно дают <code>False</code>; непустые значения — <code>True</code>.
          Это удобное сокращение, но сначала важно понимать явные сравнения.
        </Lead>

        <PredictOutput
          code={'print(bool(0))\nprint(bool(1))\nprint(bool(""))\nprint(bool("SQL"))'}
          output={"False\nTrue\nFalse\nTrue"}
          hint="Пустая строка ложна, непустая — истинна."
        />

        <CodeBlock
          caption="правило срочной задачи"
          code={
            "priority = 4\n" +
            "is_done = False\n\n" +
            "is_urgent = priority >= 4 and not is_done\n" +
            "print(is_urgent)"
          }
        />

        <div className="lesson-practice-steps">
          <p>
            Сначала замените <code>priority</code> на <code>3</code>, затем верните <code>4</code> и установите{" "}
            <code>is_done = True</code>. Каждый раз сделайте прогноз до запуска.
          </p>
          <p>
            На платформе функция <code>solve(priority, is_done)</code> должна вернуть логическое значение, а не
            строки <code>&quot;True&quot;</code> или <code>&quot;False&quot;</code>.
          </p>
        </div>
      </Section>

      <Section number="08" title="Проверь себя">
        <div className="lesson-check-group">
          <QuizCard
            question="Что возвращает выражение 3 < 5?"
            options={["3", "5", "True"]}
            correctIndex={2}
            explanation="Сравнение возвращает boolean."
          />
          <QuizCard
            question="Как включить значение 4 в правило «от четырёх»?"
            options={["priority > 4", "priority >= 4", "priority == 5"]}
            correctIndex={1}
            explanation=">= включает границу."
          />
          <QuizCard
            question="Когда a and b истинно?"
            options={["когда истинна хотя бы одна часть", "когда истинны обе части", "когда обе части ложны"]}
            correctIndex={1}
            explanation="and требует истинности обеих частей."
          />
          <QuizCard
            question="Что вернёт priority >= 4 and not is_done при priority=5 и is_done=True?"
            options={["True", "False", "5"]}
            correctIndex={1}
            explanation="not True даёт False, поэтому всё выражение ложно."
          />
        </div>

        <KeyTakeaways
          points={[
            <><code>bool</code> хранит <code>True</code> или <code>False</code>.</>,
            <>Сравнения возвращают логический результат.</>,
            <><code>=</code> присваивает, <code>==</code> сравнивает.</>,
            <><code>and</code> означает «оба», <code>or</code> — «хотя бы одно».</>,
            <>Границы нужно проверять отдельными тестовыми значениями.</>,
          ]}
        />

        <PracticeCta text="Откройте practice.py: реализуйте правило срочной задачи и проверку допустимого статуса." />
      </Section>
    </RichLesson>
  );
}

// 08. Ветвления if elif else
export function Lesson08({ module }: { module?: string }) {
  return (
    <RichLesson>
      <RichHero
        chip={module ?? "Блок 2 · Текст, логика, повторение"}
        title="Ветвления if / elif / else"
        intro="Научимся давать программе выбор: выполнить один путь, другой путь или запасной вариант. Разберём if, elif, else и роль отступов."
        tags={[
          { icon: <GitFork size={14} />, label: "if · elif · else" },
          { icon: <Scale size={14} />, label: "порядок и границы" },
        ]}
      />
      <TheoryBridge lesson={8} />

      <Section number="01" title="Маршрут занятия">
        <Lead>
          Ветвление похоже на развилку дороги. Условие решает, по какой дороге пойдёт программа. Сначала мы
          задаём простой вопрос, затем описываем действия для ответа «да» и для остальных случаев.
        </Lead>

        <div className="lesson-route">
          <ol>
            <li>
              <strong>Проверить условие:</strong> получить <code className="lesson-token">True</code> или{" "}
              <code className="lesson-token">False</code>.
            </li>
            <li>
              <strong>Выбрать структуру:</strong> использовать отдельный <code className="lesson-token">if</code>,
              пару <code className="lesson-token">if/else</code> или цепочку{" "}
              <code className="lesson-token">if/elif/else</code>.
            </li>
            <li>
              <strong>Проверить порядок:</strong> поставить узкие условия раньше широких и протестировать границы.
            </li>
          </ol>
          <p>
            В конце вы классифицируете приоритет StudyHub, обработаете неизвестный статус и найдёте недостижимую
            ветку.
          </p>
        </div>

        <Callout tone="info">
          На первом проходе достаточно помнить: отдельные <code>if</code> задают независимые вопросы, а
          <code>if/elif/else</code> выбирает один путь из нескольких.
        </Callout>
      </Section>

      <Section number="02" title="if выполняет блок по условию">
        <Lead>
          <code>if</code> можно читать как слово «если». После него стоит вопрос с ответом True или False.
          Двоеточие открывает список действий, а отступ показывает, какие строки принадлежат этому условию.
          Отступ похож на вложенный пункт обычного списка.
        </Lead>

        <CodeBlock
          code={
            "priority = 5\n\n" +
            "if priority == 5:\n" +
            '    print("Высокий приоритет")\n\n' +
            'print("Обработка завершена")'
          }
        />

        <StepThrough
          code={
            "priority = 5\n" +
            "if priority == 5:\n" +
            '    print("Высокий приоритет")\n' +
            'print("Обработка завершена")'
          }
          steps={[
            { line: 0, note: "priority получает значение 5.", vars: { priority: "5" } },
            { line: 1, note: "Сравнение 5 == 5 даёт True.", vars: { условие: "True" } },
            { line: 2, note: "Строка с отступом выполняется.", vars: { вывод: "Высокий приоритет" } },
            {
              line: 3,
              note: "Строка без отступа находится вне if и выполняется всегда.",
              vars: { вывод: "Высокий приоритет ⏎ Обработка завершена" },
            },
          ]}
        />

        <BugHunt
          code={'if priority >= 4\n    print("Высокий")'}
          question="Почему Python не может прочитать условие?"
          options={[
            "После условия отсутствует двоеточие",
            "print нельзя использовать внутри if",
            "Сравнение >= запрещено",
          ]}
          correctIndex={0}
          explanation="Двоеточие отделяет условие от начинающегося блока."
          fix={'if priority >= 4:\n    print("Высокий")'}
        />
      </Section>

      <Section number="03" title="else обрабатывает остаточный случай">
        <Lead>
          <code>else</code> означает «иначе». Это запасная дверь: если условие <code>if</code> не подошло,
          программа выполняет блок <code>else</code>. Нового вопроса после else нет.
        </Lead>

        <CodeBlock
          code={
            "is_done = False\n\n" +
            "if is_done:\n" +
            '    message = "Задача выполнена"\n' +
            "else:\n" +
            '    message = "Задача открыта"\n\n' +
            "print(message)"
          }
        />

        <PredictOutput
          code={'age = 17\nif age >= 18:\n    access = "разрешён"\nelse:\n    access = "запрещён"\nprint(access)'}
          output={"запрещён"}
          hint="17 не проходит проверку age >= 18."
        />

        <FillBlank
          prompt="Добавьте ветку для всех случаев, не прошедших условие"
          before={'if is_done:\n    message = "Готово"\n'}
          after={':\n    message = "Открыто"'}
          options={["else", "elif", "and"]}
          answer="else"
          explanation="else не проверяет новое условие и ловит остаточный случай."
        />
      </Section>

      <Section number="04" title="elif создаёт цепочку вариантов">
        <Lead>
          <code>elif</code> добавляет ещё один вариант. Python читает цепочку сверху вниз и выбирает первую
          подходящую дверь. После этого остальные двери уже не проверяются.
        </Lead>

        <BranchExplorer
          code={
            'if priority == 5:\n' +
            '    label = "critical"\n' +
            'elif priority >= 3:\n' +
            '    label = "normal"\n' +
            'else:\n' +
            '    label = "low"'
          }
          scenarios={[
            { label: "priority = 5", activeLine: 1, output: '"critical"' },
            { label: "priority = 4", activeLine: 3, output: '"normal"' },
            { label: "priority = 1", activeLine: 5, output: '"low"' },
          ]}
        />

        <div className="lesson-practice-steps">
          <p>
            При <code>priority = 4</code> первая проверка ложна, вторая истинна, поэтому присваивается{" "}
            <code>"normal"</code>.
          </p>
          <p>После выбора ветки Python не возвращается к остальным условиям этой цепочки.</p>
        </div>

        <RecallCard
          question="Сколько веток может выполниться в одной цепочке if/elif/else?"
          answer={<p>Не более одной: первой, чьё условие оказалось истинным, либо else.</p>}
        />
      </Section>

      <Section number="05" title="Строгие условия ставятся раньше">
        <Lead>
          Представьте сортировку посылок: сначала нужно проверить особую категорию «хрупкое», а уже затем общую
          категорию «обычная посылка». Слишком широкое условие сверху может забрать значения, предназначенные
          следующей ветке.
        </Lead>

        <CompareSolutions
          question="Какой порядок корректно классифицирует 95 баллов?"
          left={{
            title: "Широкая граница раньше",
            code:
              'if score >= 60:\n' +
              '    grade = "зачёт"\n' +
              'elif score >= 90:\n' +
              '    grade = "отлично"',
            note: "95 сразу попадает в первую ветку.",
          }}
          right={{
            title: "Строгая граница раньше",
            code:
              'if score >= 90:\n' +
              '    grade = "отлично"\n' +
              'elif score >= 60:\n' +
              '    grade = "зачёт"',
            note: "Сначала проверяется более узкая категория.",
          }}
          preferred="right"
          explanation="Условие >= 60 включает и 95, поэтому его нельзя ставить раньше >= 90."
        />

        <div className="lesson-practice-steps">
          <p>
            Для границ <code>60</code> и <code>90</code> проверьте значения{" "}
            <code>59, 60, 61, 89, 90, 91</code>.
          </p>
          <p>
            Если предыдущая ветка включает все значения следующей, следующая ветка{" "}
            <span className="lesson-emphasis">недостижима</span>.
          </p>
        </div>

        <TrueFalse
          statement={
            <>
              В цепочке категорий условие <code>score &gt;= 60</code> можно поставить раньше{" "}
              <code>score &gt;= 90</code>, потому что Python всё равно проверит обе ветки.
            </>
          }
          isTrue={false}
          explanation="После первой истинной ветки остальные условия цепочки не проверяются."
        />
      </Section>

      <Section number="06" title="Независимые if и вложенные решения">
        <Lead>
          Два отдельных <code>if</code> похожи на два независимых вопроса: оба ответа могут быть «да».
          Цепочка <code>if/elif/else</code> похожа на выбор одной категории: программа выбирает только один вариант.
        </Lead>

        <TypeCards>
          <TypeCard
            badge="if + if"
            title="Независимые признаки"
            code={
              'if priority >= 4:\n    print("Высокий приоритет")\n\n' +
              'if not is_done:\n    print("Задача открыта")'
            }
          >
            Обе надписи могут появиться одновременно.
          </TypeCard>
          <TypeCard
            badge="if / elif"
            badgeTone="float"
            title="Одна категория"
            code={
              'if priority >= 4:\n    label = "high"\n' +
              'elif priority >= 2:\n    label = "medium"\n' +
              'else:\n    label = "low"'
            }
          >
            Выбирается ровно один текстовый уровень.
          </TypeCard>
        </TypeCards>

        <CodeBlock
          caption="вложенное решение"
          code={
            "if user_exists:\n" +
            "    if password_correct:\n" +
            '        print("Доступ разрешён")\n' +
            "    else:\n" +
            '        print("Неверный пароль")\n' +
            "else:\n" +
            '    print("Пользователь не найден")'
          }
        />

        <Callout>
          Глубокая лестница отступов быстро становится тяжёлой. Иногда правило лучше разложить на boolean-переменные
          или объединить через <code>and</code>.
        </Callout>
      </Section>

      <Section number="07" title="Практика StudyHub">
        <Lead>
          Сначала реализуйте классификацию приоритета, затем отдельно обработайте текстовый статус. Не объединяйте две
          разные задачи в одну длинную цепочку.
        </Lead>

        <CodeBlock
          caption="категория приоритета"
          code={
            "priority = 4\n\n" +
            "if priority == 5:\n" +
            '    label = "critical"\n' +
            "elif priority >= 3:\n" +
            '    label = "normal"\n' +
            "elif priority >= 1:\n" +
            '    label = "low"\n' +
            "else:\n" +
            '    label = "invalid"\n\n' +
            "print(label)"
          }
        />

        <BugHunt
          code={
            'status = "done"\n' +
            'if status == "new":\n' +
            '    message = "Новая задача"\n' +
            'if status == "done":\n' +
            '    message = "Задача выполнена"\n' +
            'else:\n' +
            '    message = "Неизвестный статус"'
          }
          question="Почему структура плохо выражает взаимоисключающие статусы?"
          options={[
            "Строки нельзя сравнивать",
            "else относится только ко второму if, а не ко всей классификации",
            "Переменная message запрещена",
          ]}
          correctIndex={1}
          explanation="Для одной категории статуса нужна общая цепочка if/elif/else."
          fix={
            'if status == "new":\n' +
            '    message = "Новая задача"\n' +
            'elif status == "done":\n' +
            '    message = "Задача выполнена"\n' +
            'else:\n' +
            '    message = "Неизвестный статус"'
          }
        />

        <Callout tone="info">
          В задачах платформы верните выбранную строку через <code>return</code>. Значения вне диапазона должны иметь
          явный результат, например <code>"invalid"</code>.
        </Callout>
      </Section>

      <Section number="08" title="Проверь себя">
        <div className="lesson-check-group">
          <QuizCard
            question="Когда выполняется else?"
            options={["всегда", "если все условия выше ложны", "после первого if"]}
            correctIndex={1}
            explanation="else обрабатывает остаточный случай."
          />
          <QuizCard
            question="Что определяет блок в Python?"
            options={["фигурные скобки", "отступ", "точка с запятой"]}
            correctIndex={1}
            explanation="Отступ является частью синтаксиса."
          />
          <QuizCard
            question="Почему >= 90 ставят раньше >= 60?"
            options={["так быстрее", ">= 60 иначе перехватит 90 и выше", "Python требует убывающий порядок"]}
            correctIndex={1}
            explanation="Широкое условие включает значения строгого."
          />
          <QuizCard
            question="Когда нужны два отдельных if?"
            options={["для независимых правил", "для одной категории", "вместо любого else"]}
            correctIndex={0}
            explanation="Независимые проверки могут выполниться одновременно."
          />
        </div>

        <KeyTakeaways
          points={[
            <><code>if</code> выполняет блок при истинном условии.</>,
            <><code>else</code> обрабатывает остаточный случай.</>,
            <><code>elif</code> добавляет проверку в одну цепочку.</>,
            <>Отступ определяет принадлежность строки блоку.</>,
            <>Более строгие условия ставятся раньше широких.</>,
          ]}
        />

        <PracticeCta text="Откройте practice.py: реализуйте категорию приоритета и сообщение статуса." />
      </Section>
    </RichLesson>
  );
}

// 09. Цикл for и последовательности
export function Lesson09({ module }: { module?: string }) {
  return (
    <RichLesson>
      <RichHero
        chip={module ?? "Блок 2 · Текст, логика, повторение"}
        title="Цикл for и последовательности"
        intro="Научимся повторять одно действие для нескольких значений: брать элементы по одному, считать сумму и нумеровать задачи."
        tags={[
          { icon: <Repeat size={14} />, label: "for · range" },
          { icon: <Sigma size={14} />, label: "накопление" },
        ]}
      />
      <TheoryBridge lesson={9} />

      <Section number="01" title="Маршрут занятия">
        <Lead>
          Представьте стопку карточек с задачами. Вместо трёх одинаковых команд можно брать по одной карточке и
          выполнять одно и то же действие. Цикл <code>for</code> делает именно это.
        </Lead>

        <div className="lesson-route">
          <ol>
            <li>
              <strong>Получить текущий элемент:</strong> проследить, как переменная цикла меняется на каждом шаге.
            </li>
            <li>
              <strong>Повторить общий блок:</strong> читать тело <code className="lesson-token">for</code> по
              отступу и понимать поведение пустой последовательности.
            </li>
            <li>
              <strong>Накопить результат:</strong> создать число или новую последовательность до цикла и обновлять её
              на каждом шаге.
            </li>
          </ol>
          <p>
            В конце вы посчитаете сумму приоритетов StudyHub, пронумеруете задачи через <code>enumerate</code> и
            объясните, почему нельзя обнулять накопитель внутри цикла.
          </p>
        </div>

        <Callout tone="info">
          Перед запуском короткого цикла выпишите три строки вручную: какой элемент взяли, что сделали и каким стал
          результат. Это проще, чем пытаться удержать весь цикл в голове.
        </Callout>
      </Section>

      <Section number="02" title="Один элемент на каждой итерации">
        <Lead>
          Цикл похож на конвейер: элементы приезжают по одному. Переменная цикла — рабочее место, на котором
          сейчас лежит только один текущий элемент.
        </Lead>

        <StepThrough
          code={'tasks = ["Python", "Git", "SQL"]\nfor task in tasks:\n    print(task)'}
          steps={[
            { line: 0, note: "Создаётся последовательность из трёх строк.", vars: { tasks: '["Python", "Git", "SQL"]' } },
            { line: 1, note: 'Первая итерация: task = "Python".', vars: { task: '"Python"' } },
            { line: 2, note: "Печатается первый элемент.", vars: { вывод: "Python" } },
            { line: 1, note: 'Вторая итерация: task = "Git".', vars: { task: '"Git"', вывод: "Python" } },
            { line: 1, note: 'Третья итерация: task = "SQL". После неё цикл завершается.', vars: { task: '"SQL"', вывод: "Python ⏎ Git ⏎ SQL" } },
          ]}
        />

        <div className="lesson-practice-steps">
          <p>
            Для пустой последовательности тело цикла <span className="lesson-emphasis">не выполнится ни разу</span>.
            Это нормальный сценарий.
          </p>
          <p>
            Имя переменной должно описывать один элемент: <code>task</code> для <code>tasks</code>, <code>char</code>{" "}
            для символов, <code>priority</code> для приоритетов.
          </p>
        </div>

        <RecallCard
          question="Что хранит переменная task внутри for task in tasks?"
          answer={<p>Один текущий элемент последовательности на конкретной итерации.</p>}
        />
      </Section>

      <Section number="03" title="Строки и range тоже можно обходить">
        <Lead>
          Цикл может обходить разные последовательности. Строка отдаёт буквы по одной, а <code>range</code>
          создаёт ряд чисел. Его можно представить как талончики с номерами.
        </Lead>

        <PredictOutput
          code={'for char in "SQL":\n    print(char)'}
          output={"S\nQ\nL"}
          hint="Строка отдаёт символы слева направо."
        />

        <MatchPairs
          prompt="Соедините вызов range с получаемыми значениями."
          pairs={[
            { left: "range(5)", right: "0, 1, 2, 3, 4" },
            { left: "range(2, 6)", right: "2, 3, 4, 5" },
            { left: "range(2, 10, 2)", right: "2, 4, 6, 8" },
          ]}
          explanation="Правая граница range не включается."
        />

        <Callout>
          Шаг <code className="lesson-token lesson-token--danger">0</code> недопустим. Python не сможет перейти к
          следующему значению и сообщит об ошибке.
        </Callout>
      </Section>

      <Section number="04" title="Накопление числа">
        <Lead>
          Накопитель похож на копилку. До начала она пустая, поэтому сумма равна <code>0</code>. На каждом шаге
          мы добавляем очередное значение. Если поставить пустую копилку внутрь цикла, она будет обнуляться снова
          и снова.
        </Lead>

        <StepThrough
          code={
            "priorities = [1, 3, 2]\n" +
            "total = 0\n" +
            "for priority in priorities:\n" +
            "    total = total + priority\n" +
            "print(total)"
          }
          steps={[
            { line: 1, note: "До цикла total равен 0.", vars: { total: "0" } },
            { line: 2, note: "Первый элемент priority = 1.", vars: { priority: "1", total: "0" } },
            { line: 3, note: "total становится 1.", vars: { priority: "1", total: "1" } },
            { line: 3, note: "После второго элемента total равен 4.", vars: { priority: "3", total: "4" } },
            { line: 3, note: "После третьего элемента total равен 6.", vars: { priority: "2", total: "6" } },
            { line: 4, note: "Цикл завершён, печатается 6.", vars: { total: "6", вывод: "6" } },
          ]}
        />

        <BugHunt
          code={
            "priorities = [1, 3, 2]\n" +
            "for priority in priorities:\n" +
            "    total = 0\n" +
            "    total = total + priority\n" +
            "print(total)"
          }
          question="Почему код не накапливает общую сумму?"
          options={[
            "В цикле нельзя складывать числа",
            "total обнуляется на каждой итерации",
            "print должен находиться внутри цикла",
          ]}
          correctIndex={1}
          explanation="Начальное значение накопителя должно создаваться один раз до цикла."
          fix={
            "priorities = [1, 3, 2]\n" +
            "total = 0\n" +
            "for priority in priorities:\n" +
            "    total = total + priority\n" +
            "print(total)"
          }
        />

        <TrueFalse
          statement={<>Для пустого списка сумма останется равна начальному значению <code>0</code>.</>}
          isTrue={true}
          explanation="Тело цикла не выполнится, поэтому накопитель не изменится."
        />
      </Section>

      <Section number="05" title="Накопление нового результата">
        <Lead>
          Иногда результат — не одно число, а новый список. Это похоже на перекладывание обработанных карточек в
          отдельную коробку: исходная стопка остаётся на месте, а новые значения складываются отдельно.
        </Lead>

        <CodeBlock
          caption="форматируем названия"
          code={
            'titles = ["Python", "SQL"]\n' +
            "formatted = []\n\n" +
            "for title in titles:\n" +
            "    formatted.append(title.upper())\n\n" +
            "print(formatted)"
          }
        />

        <CompareSolutions
          question="Какой вариант сохраняет исходные данные и явно строит результат?"
          left={{
            title: "Менять во время обхода",
            code: "for title in titles:\n    titles.remove(title)",
            note: "Позиции сдвигаются, элементы могут быть пропущены.",
          }}
          right={{
            title: "Собирать отдельно",
            code: "result = []\nfor title in titles:\n    result.append(title.upper())",
            note: "Исходная последовательность остаётся прежней.",
          }}
          preferred="right"
          explanation="Изменение коллекции во время обхода делает поведение трудно предсказуемым."
        />

        <Callout>
          Подробные методы списков будут изучаться отдельно. Сейчас запомните шаблон: пустой результат до цикла,
          преобразование элемента и <code>append()</code>.
        </Callout>
      </Section>

      <Section number="06" title="enumerate: позиция и элемент">
        <Lead>
          Для нумерованного списка нужны сразу две вещи: номер и сама задача. <code>enumerate</code> похож на
          сотрудника, который выдаёт каждой карточке порядковый номер и передаёт карточку дальше.
        </Lead>

        <CodeBlock
          code={
            'titles = ["Python", "Git"]\n\n' +
            "for position, title in enumerate(titles, start=1):\n" +
            '    print(f"{position}. {title}")'
          }
        />

        <PredictOutput
          code={'for i, title in enumerate(["SQL", "Git"], start=1):\n    print(f"{i}. {title}")'}
          output={"1. SQL\n2. Git"}
          hint="start=1 задаёт первое отображаемое число."
        />

        <CompareSolutions
          question="Какой вариант проще, если нужен и номер, и название?"
          left={{
            title: "Ручной счётчик",
            code:
              "position = 1\n" +
              "for title in titles:\n" +
              '    print(f"{position}. {title}")\n' +
              "    position += 1",
            note: "Работает, но требует отдельного обновления.",
          }}
          right={{
            title: "enumerate",
            code:
              "for position, title in enumerate(titles, start=1):\n" +
              '    print(f"{position}. {title}")',
            note: "Позиция и элемент получаются одной конструкцией.",
          }}
          preferred="right"
          explanation="enumerate уменьшает количество состояния, которым нужно управлять вручную."
        />
      </Section>

      <Section number="07" title="Практика StudyHub">
        <Lead>
          Сначала посчитайте суммарный приоритет, затем соберите нумерованные названия. Это два разных накопления:
          число и новая последовательность.
        </Lead>

        <CodeSequence
          title="Соберите алгоритм суммы"
          prompt="Выберите строки в порядке, который корректно накапливает сумму приоритетов."
          pieces={[
            { id: "init", code: "total = 0" },
            { id: "loop", code: "for priority in priorities:" },
            { id: "add", code: "    total = total + priority" },
            { id: "result", code: "print(total)" },
            { id: "wrong", code: "    total = 0", note: "обнуляет накопитель внутри цикла" },
          ]}
          correctOrder={["init", "loop", "add", "result"]}
          explanation="Накопитель создаётся один раз, затем обновляется на каждой итерации."
        />

        <CodeBlock
          caption="нумерация задач"
          code={
            'tasks = ["Строки", "Boolean", "Ветвления"]\n\n' +
            "for position, title in enumerate(tasks, start=1):\n" +
            '    print(f"{position}. {title}")'
          }
        />

        <Callout tone="info">
          В задаче платформы верните итог через <code>return</code>. Для пустого списка сумма должна быть{" "}
          <code>0</code>, а новый список — пустым.
        </Callout>
      </Section>

      <Section number="08" title="Проверь себя">
        <div className="lesson-check-group">
          <QuizCard
            question="Что получает переменная цикла?"
            options={["всю последовательность", "один элемент за шаг", "только индекс"]}
            correctIndex={1}
            explanation="for перебирает элементы по одному."
          />
          <QuizCard
            question="Какие значения даёт range(3)?"
            options={["1, 2, 3", "0, 1, 2", "0, 1, 2, 3"]}
            correctIndex={1}
            explanation="Правая граница не включается."
          />
          <QuizCard
            question="Где создаётся total = 0?"
            options={["до цикла", "в каждой итерации", "после цикла"]}
            correctIndex={0}
            explanation="Иначе накопитель будет обнуляться."
          />
          <QuizCard
            question="Когда нужен enumerate?"
            options={["когда нужны позиция и элемент", "только для строк", "когда нужен только элемент"]}
            correctIndex={0}
            explanation="enumerate возвращает пару: позицию и текущий элемент."
          />
        </div>

        <KeyTakeaways
          points={[
            <><code>for</code> получает элементы по одному.</>,
            <>Тело цикла определяется отступом.</>,
            <>Правая граница <code>range</code> не включается.</>,
            <>Накопитель создаётся до цикла.</>,
            <><code>enumerate</code> даёт позицию и элемент.</>,
          ]}
        />

        <PracticeCta text="Откройте practice.py: посчитайте сумму приоритетов и верните нумерованные задачи." />
      </Section>
    </RichLesson>
  );
}

// 10. Цикл while и проверка ввода
export function Lesson10({ module }: { module?: string }) {
  return (
    <RichLesson>
      <RichHero
        chip={module ?? "Блок 2 · Текст, логика, повторение"}
        title="Цикл while и проверка ввода"
        intro="Научимся повторять действие, пока условие остаётся истинным: проверять ввод, завершать цикл через break и не попадать в бесконечное повторение."
        tags={[
          { icon: <Repeat size={14} />, label: "while и состояние" },
          { icon: <SkipForward size={14} />, label: "break · continue" },
        ]}
      />
      <TheoryBridge lesson={10} />

      <Section number="01" title="Маршрут занятия">
        <Lead>
          <code>while</code> похож на фразу «повторяй, пока дверь закрыта». Мы заранее не знаем, сколько попыток
          потребуется, но понимаем условие продолжения. У цикла обязательно должен быть путь к завершению.
        </Lead>

        <div className="lesson-route">
          <ol>
            <li>
              <strong>Задать состояние:</strong> определить значение до первой проверки.
            </li>
            <li>
              <strong>Записать условие:</strong> объяснить, пока какое правило цикл должен продолжаться.
            </li>
            <li>
              <strong>Гарантировать выход:</strong> изменить состояние или выполнить достижимый{" "}
              <code className="lesson-token">break</code>.
            </li>
          </ol>
          <p>
            В конце вы найдёте бесконечный цикл, повторите ввод до допустимой команды и реализуете алгоритм, который
            вручную двигается по значениям.
          </p>
        </div>

        <Callout tone="info">
          Перед запуском ответьте на два вопроса: «что изменится после одного круга?» и «какое значение остановит
          цикл?». Если ответа нет, цикл пока запускать рано.
        </Callout>
      </Section>

      <Section number="02" title="Три части while">
        <Lead>
          Управляемый <code>while</code> похож на счётчик попыток: есть стартовое значение, правило продолжения
          и действие, которое приближает нас к остановке. Условие проверяется перед каждым новым кругом.
        </Lead>

        <StepThrough
          code={"attempt = 1\nwhile attempt <= 3:\n    print(attempt)\n    attempt = attempt + 1"}
          steps={[
            { line: 0, note: "Начальное состояние attempt = 1.", vars: { attempt: "1" } },
            { line: 1, note: "1 <= 3 даёт True, поэтому начинается первая итерация.", vars: { attempt: "1" } },
            { line: 2, note: "Печатается 1.", vars: { вывод: "1", attempt: "1" } },
            { line: 3, note: "attempt становится 2.", vars: { attempt: "2" } },
            { line: 1, note: "После нескольких шагов attempt станет 4.", vars: { attempt: "4" } },
            { line: 1, note: "4 <= 3 даёт False, цикл завершён.", vars: { attempt: "4", вывод: "1 ⏎ 2 ⏎ 3" } },
          ]}
        />

        <TrueFalse
          statement={
            <>
              Если условие <code>while</code> ложно до первой итерации, тело всё равно выполнится один раз.
            </>
          }
          isTrue={false}
          explanation="while проверяет условие до входа в тело, поэтому возможны ноль итераций."
        />

        <RecallCard
          question="Назовите три части управляемого цикла while."
          answer={<p>Начальное состояние, условие продолжения и изменение состояния либо явный выход.</p>}
        />
      </Section>

      <Section number="03" title="Как появляется бесконечный цикл">
        <Lead>
          Бесконечный цикл похож на будильник без кнопки выключения. Если условие зависит от значения, которое
          никогда не меняется, программа будет повторять один и тот же круг.
        </Lead>

        <BugHunt
          code={"number = 1\nwhile number <= 5:\n    print(number)"}
          question="Почему цикл не завершится?"
          options={[
            "print перезапускает while",
            "number остаётся равным 1",
            "Оператор <= всегда возвращает True",
          ]}
          correctIndex={1}
          explanation="Состояние не обновляется, поэтому условие 1 <= 5 остаётся истинным."
          fix={"number = 1\nwhile number <= 5:\n    print(number)\n    number = number + 1"}
        />

        <div className="lesson-practice-steps">
          <p>
            Бесконечный цикл не всегда является ошибкой. Консольное приложение может использовать{" "}
            <code className="lesson-token">while True</code>, если внутри есть видимый и достижимый выход.
          </p>
          <p>
            Если невозможно словами доказать завершение, не запускайте цикл наугад. Сначала уменьшите пример и
            проследите несколько значений вручную.
          </p>
        </div>

        <CompareSolutions
          question="Какой вариант явно движется к завершению?"
          left={{
            title: "Состояние не меняется",
            code: "number = 1\nwhile number <= 5:\n    print(number)",
            note: "Условие всегда проверяет одно и то же значение.",
          }}
          right={{
            title: "Состояние обновляется",
            code: "number = 1\nwhile number <= 5:\n    print(number)\n    number += 1",
            note: "После каждой итерации число приближается к границе выхода.",
          }}
          preferred="right"
          explanation="Изменение number делает условие ложным после конечного числа шагов."
        />
      </Section>

      <Section number="04" title="Повторный ввод до допустимой команды">
        <Lead>
          Количество неверных попыток заранее неизвестно. Поэтому ввод обновляет состояние, а условие проверяет, можно
          ли завершить повтор.
        </Lead>

        <CodeBlock
          caption="повторяем до допустимой команды"
          code={
            'command = ""\n\n' +
            'while command not in ("add", "list", "exit"):\n' +
            '    command = input("Команда: ").strip().lower()\n\n' +
            'print("Команда принята")'
          }
        />

        <div className="lesson-practice-steps">
          <p>
            После каждой попытки переменная <code>command</code> получает новое значение. Как только оно входит в
            набор допустимых вариантов, условие становится ложным.
          </p>
          <p>
            <code className="lesson-token">strip()</code> и <code className="lesson-token">lower()</code> должны
            применяться к каждой новой строке пользователя, поэтому находятся внутри цикла.
          </p>
        </div>

        <CodeSequence
          title="Соберите цикл проверки команды"
          prompt="Расположите шаги так, чтобы программа повторяла ввод и затем сообщала об успехе."
          pieces={[
            { id: "init", code: 'command = ""' },
            { id: "loop", code: 'while command not in ("add", "list", "exit"):' },
            { id: "input", code: '    command = input("Команда: ").strip().lower()' },
            { id: "done", code: 'print("Команда принята")' },
            { id: "wrong", code: 'command = "exit"', note: "завершит цикл до первого ввода" },
          ]}
          correctOrder={["init", "loop", "input", "done"]}
          explanation="Начальное значение недопустимо, ввод обновляет состояние, а сообщение находится после цикла."
        />
      </Section>

      <Section number="05" title="break завершает ближайший цикл">
        <Lead>
          <code className="lesson-token">break</code> немедленно прекращает ближайший цикл. Строки ниже в текущей
          итерации уже не выполняются.
        </Lead>

        <CodeBlock
          code={
            "while True:\n" +
            '    command = input("Команда: ").strip().lower()\n\n' +
            '    if command == "exit":\n' +
            "        break\n\n" +
            '    print(f"Выполняем: {command}")\n\n' +
            'print("Работа завершена")'
          }
        />

        <PredictOutput
          code={
            "number = 1\n" +
            "while True:\n" +
            "    print(number)\n" +
            "    if number == 3:\n" +
            "        break\n" +
            "    number += 1"
          }
          output={"1\n2\n3"}
          hint="После break цикл прекращается немедленно."
        />

        <Callout>
          <code>while True</code> допустим, когда условие выхода короткое, заметное и гарантированно может стать
          истинным.
        </Callout>
      </Section>

      <Section number="06" title="continue пропускает остаток итерации">
        <Lead>
          <code className="lesson-token">continue</code> не завершает цикл. Оно сразу переходит к следующей проверке
          условия.
        </Lead>

        <StepThrough
          code={
            "number = 0\n" +
            "while number < 5:\n" +
            "    number += 1\n" +
            "    if number == 3:\n" +
            "        continue\n" +
            "    print(number)"
          }
          steps={[
            { line: 0, note: "Начальное значение number = 0.", vars: { number: "0" } },
            { line: 2, note: "На первой итерации number становится 1.", vars: { number: "1" } },
            { line: 5, note: "1 печатается.", vars: { вывод: "1" } },
            { line: 2, note: "На третьей итерации number становится 3.", vars: { number: "3" } },
            { line: 4, note: "continue пропускает print для значения 3.", vars: { number: "3", вывод: "1 ⏎ 2" } },
            { line: 5, note: "Позже печатаются 4 и 5.", vars: { вывод: "1 ⏎ 2 ⏎ 4 ⏎ 5" } },
          ]}
        />

        <BugHunt
          code={
            "number = 0\n" +
            "while number < 5:\n" +
            "    if number == 3:\n" +
            "        continue\n" +
            "    number += 1"
          }
          question="Почему цикл может застрять на значении 3?"
          options={[
            "continue запрещён внутри while",
            "Обновление number находится после continue и перестаёт выполняться",
            "Условие number < 5 неверно",
          ]}
          correctIndex={1}
          explanation="Когда number равен 3, выполнение каждый раз переходит к новой итерации до увеличения."
          fix={
            "number = 0\n" +
            "while number < 5:\n" +
            "    number += 1\n" +
            "    if number == 3:\n" +
            "        continue"
          }
        />
      </Section>

      <Section number="07" title="Выбор цикла и практика StudyHub">
        <Lead>
          Используйте <code>for</code> для готовой последовательности, а <code>while</code> — когда повтор зависит от
          состояния или неизвестного количества попыток.
        </Lead>

        <TypeCards>
          <TypeCard badge="for" title="Готовый набор" code={"for task in tasks:\n    print(task)"}>
            Обрабатывается каждый существующий элемент.
          </TypeCard>
          <TypeCard badge="while" badgeTone="float" title="Состояние" code={'while command != "exit":\n    ...'}>
            Повтор продолжается, пока состояние удовлетворяет условию.
          </TypeCard>
        </TypeCards>

        <CodeBlock
          caption="подсчёт цифр без преобразования в строку"
          code={
            "number = 1250\n" +
            "digits = 0\n\n" +
            "while number > 0:\n" +
            "    number //= 10\n" +
            "    digits += 1\n\n" +
            "print(digits)  # 4"
          }
        />

        <div className="lesson-practice-steps">
          <p>
            Деление на <code>10</code> последовательно превращает <code>1250 → 125 → 12 → 1 → 0</code>.
          </p>
          <p>
            Для исходного <code>0</code> нужен отдельный граничный результат: тело цикла не выполнится ни разу, но
            число всё равно содержит одну цифру.
          </p>
        </div>

        <Callout tone="info">
          В задаче на поиск первого допустимого значения вручную увеличивайте индекс и сначала проверяйте, не вышел ли
          он за границу последовательности.
        </Callout>
      </Section>

      <Section number="08" title="Проверь себя">
        <div className="lesson-check-group">
          <QuizCard
            question="Когда выполняется while?"
            options={["пока условие истинно", "ровно один раз", "только для строк"]}
            correctIndex={0}
            explanation="Условие проверяется перед каждой итерацией."
          />
          <QuizCard
            question="Что делает цикл конечным?"
            options={["print", "изменение состояния или break", "комментарий"]}
            correctIndex={1}
            explanation="Условие должно стать ложным либо должен выполниться выход."
          />
          <QuizCard
            question="Что делает break?"
            options={["пропускает итерацию", "завершает ближайший цикл", "возвращает значение"]}
            correctIndex={1}
            explanation="break немедленно прекращает цикл."
          />
          <QuizCard
            question="Что делает continue?"
            options={["завершает цикл", "пропускает остаток итерации", "удаляет условие"]}
            correctIndex={1}
            explanation="Следующее выполнение начинается с новой проверки условия."
          />
          <QuizCard
            question="Какой цикл подходит для меню до команды exit?"
            options={["while", "for по символам", "цикл не нужен"]}
            correctIndex={0}
            explanation="Количество команд заранее неизвестно и зависит от состояния."
          />
        </div>

        <KeyTakeaways
          points={[
            <><code>while</code> проверяет условие перед каждой итерацией.</>,
            <>У цикла есть состояние, условие и изменение.</>,
            <>Без обновления состояния возможен бесконечный цикл.</>,
            <><code>break</code> завершает цикл, <code>continue</code> пропускает остаток шага.</>,
            <><code>for</code> удобен для набора, <code>while</code> — для состояния.</>,
          ]}
        />

        <PracticeCta text="Откройте practice.py: посчитайте цифры числа и найдите первое допустимое значение через while." />
      </Section>
    </RichLesson>
  );
}