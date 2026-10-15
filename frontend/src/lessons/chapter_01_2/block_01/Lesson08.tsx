import { useState } from "react";
import {
  BugHunt,
  CompareSolutions,
  Diagram,
  DiagramArrow,
  DiagramFlow,
  DiagramNode,
  Lead,
  LinkedNotes,
  MethodGrid,
  PredictOutput,
  RichHero,
  RichLesson,
  Section,
  StepThrough,
  TrueFalse,
} from "../../shared";

function LogicOperatorDemo() {
  const [first, setFirst] = useState(true);
  const [second, setSecond] = useState(false);
  const label = (value: boolean) => (value ? "True" : "False");

  return (
    <section className="slice-card">
      <div className="interactive-heading">
        <div>
          <span>ПОПРОБУЙТЕ</span>
          <h3>Что получится у and и or?</h3>
        </div>
      </div>
      <p className="interactive-prompt">
        Меняйте два ответа и смотрите, как меняются результаты and и or.
      </p>
      <div className="interactive-actions">
        <button
          className="interactive-secondary"
          type="button"
          role="switch"
          aria-checked={first}
          onClick={() => setFirst((value) => !value)}
        >
          Первый ответ: {label(first)}
        </button>
        <button
          className="interactive-secondary"
          type="button"
          role="switch"
          aria-checked={second}
          onClick={() => setSecond((value) => !value)}
        >
          Второй ответ: {label(second)}
        </button>
      </div>
      <MethodGrid
        rows={[
          [
            <>{label(first)} and {label(second)}</>,
            <>
              <code>and</code> даёт <code>{label(first && second)}</code>.
            </>,
          ],
          [
            <>{label(first)} or {label(second)}</>,
            <>
              <code>or</code> даёт <code>{label(first || second)}</code>.
            </>,
          ],
        ]}
      />
    </section>
  );
}

function RangeBoundaryDemo() {
  const [value, setValue] = useState(14);
  const [includeStart, setIncludeStart] = useState(true);
  const [includeEnd, setIncludeEnd] = useState(false);
  const start = 10;
  const end = 20;
  const lowerPasses = includeStart ? value >= start : value > start;
  const upperPasses = includeEnd ? value <= end : value < end;
  const lowerOperator = includeStart ? ">=" : ">";
  const upperOperator = includeEnd ? "<=" : "<";
  const valuePasses = lowerPasses && upperPasses;
  const boolLabel = (answer: boolean) => (answer ? "True" : "False");
  const startPosition = ((start - 8) / 14) * 100;
  const endPosition = ((end - 8) / 14) * 100;

  return (
    <section className="slice-card">
      <div className="interactive-heading">
        <div>
          <span>ПОПРОБУЙТЕ</span>
          <h3>Передвиньте точку по диапазону</h3>
        </div>
      </div>
      <p className="interactive-prompt">
        Выберите число от 8 до 22. Затем решите, входят ли сами числа 10 и 20 в диапазон.
      </p>
      <label style={{ display: "grid", gap: 6 }}>
        <span style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
          <span>Выбранное число</span>
          <output
            htmlFor="lesson08-range-value"
            aria-live="polite"
            style={{ minWidth: 42, padding: "2px 10px", borderRadius: 999, background: "var(--accent-soft)", color: "var(--text)", fontWeight: 700, textAlign: "center" }}
          >
            {value}
          </output>
        </span>
        <span style={{ position: "relative", display: "block" }}>
          <input
            id="lesson08-range-value"
            type="range"
            min={8}
            max={22}
            step={1}
            value={value}
            onChange={(event) => setValue(Number(event.target.value))}
            aria-label="Положение точки на числовой прямой"
            aria-valuetext={`Число ${value}`}
            style={{ display: "block", width: "100%", accentColor: "var(--accent)" }}
          />
          {[{ point: startPosition, included: includeStart }, { point: endPosition, included: includeEnd }].map(({ point, included }) => (
            <span
              key={point}
              aria-hidden="true"
              style={{
                position: "absolute", left: `${point}%`, top: "50%", width: 12, height: 12,
                border: "2px solid var(--accent)", borderRadius: "50%",
                background: included ? "var(--accent)" : "var(--card)",
                boxSizing: "border-box", transform: "translate(-50%, -50%)", pointerEvents: "none",
              }}
            />
          ))}
        </span>
        <span
          aria-hidden="true"
          style={{ position: "relative", display: "block", height: 20, marginInline: 10, color: "var(--muted)", fontSize: "0.78rem" }}
        >
          {[8, 10, 20, 22].map((tick) => (
            <span key={tick} style={{ position: "absolute", left: `${((tick - 8) / 14) * 100}%`, transform: "translateX(-50%)" }}>
              {tick}
            </span>
          ))}
        </span>
      </label>
      <div className="interactive-actions">
        <label><input type="checkbox" checked={includeStart} onChange={(event) => setIncludeStart(event.target.checked)} /> Включать нижний край 10</label>
        <label><input type="checkbox" checked={includeEnd} onChange={(event) => setIncludeEnd(event.target.checked)} /> Включать верхний край 20</label>
      </div>
      <p className="interactive-feedback" aria-live="polite">
        Число {value} {valuePasses ? "входит" : "не входит"} в диапазон.
      </p>
      <MethodGrid
        rows={[
          [<>value {lowerOperator} {start}</>, <code>{boolLabel(lowerPasses)}</code>],
          [<>value {upperOperator} {end}</>, <code>{boolLabel(upperPasses)}</code>],
        ]}
      />
      <div className="branch-code" aria-live="polite">
        <code className="branch-line">
          (value {lowerOperator} {start}) and (value {upperOperator} {end}) → {boolLabel(valuePasses)}
        </code>
      </div>
      <p className="interactive-prompt">
        На шкале закрашенный кружок отмечает включённую границу, пустой — исключённую. Для включённого края используем
        <code>&gt;=</code> или <code>&lt;=</code>, для исключённого — <code>&gt;</code> или <code>&lt;</code>.
      </p>
    </section>
  );
}

export function Lesson08({ module }: { module?: string }) {
  return (
    <RichLesson>
      <RichHero
        chip={module ?? "Блок 1 · Первые шаги в Python"}
        title="Сравнения и логика"
        intro="Проверим числа и составим правило, которое возвращает понятный ответ True или False."
      />

      <Section number="00" title="От знакомых значений к точному ответу">
        <Lead>
          Мы уже работали с числами, выражениями и сообщениями из данных. Теперь впервые в этом
          блоке научимся задавать значениям вопросы: достигло ли число порога, подходят ли сразу два
          признака, входит ли число в диапазон? Python вернёт ответ, а мы научимся его читать. Пока
          программа только получает ответ и показывает его.
        </Lead>
        <LinkedNotes
          variant="connected"
          items={[
            { title: "Точка старта", description: "Знакомые числа, строки, выражения и вывод результата." },
            { title: "Новый вопрос", description: "Как проверить границу и объединить несколько отдельных ответов?" },
            { title: "Результат", description: "Получим True или False и проверим правило на изменённых данных." },
          ]}
        />
        <p>
          Сравнения и слова <code>and</code>, <code>or</code>, <code>not</code> мы разбираем впервые
          в этом блоке. Сначала научимся читать каждый ответ, затем соединять их в правило. Цепное
          сравнение прочитаем по шагам и сравним с двумя отдельными проверками. Пока мы не выбираем
          следующую команду и не используем строки как логические ответы.
        </p>
      </Section>

      <Section number="01" title="Сравнение возвращает ответ bool">
        <Lead>
          Сравнение не меняет числа. Оно отвечает на вопрос и возвращает один из двух ответов:
          <code>True</code> или <code>False</code>. Такой тип ответа называется <code>bool</code>.
        </Lead>
        <p>
          Например, сравним число прочитанных страниц с планом. Если прочитали семь страниц и хотели
          прочитать десять, выражение <code>7 &lt; 10</code> возвращает <code>True</code>: семь меньше
          десяти. Ответ можно сохранить под именем или сразу вывести на экран. Сравнение сообщает
          результат, но не выполняет за нас другое действие.
        </p>
        <p>
          На схеме проследим один путь: знакомые значения становятся вопросом сравнения, а его
          результатом будет bool.
        </p>
        <Diagram caption="Как сравнение превращается в булев ответ">
          <DiagramFlow label="Путь от числовых значений к результату сравнения">
            <DiagramNode title="Два значения" shape="input-output">
              <div style={{ display: "grid", gap: 10, paddingInline: "12%" }}>
                <p>pages_read и page_goal</p>
              </div>
            </DiagramNode>
            <DiagramArrow label="подставляем в вопрос" />
            <DiagramNode title="Сравнение" shape="decision">
              <p>pages_read &lt; page_goal</p>
            </DiagramNode>
            <DiagramArrow label="получаем ответ" />
            <DiagramNode title="Результат bool" shape="terminator">
              <p>True или False</p>
            </DiagramNode>
          </DiagramFlow>
        </Diagram>
        <p>
          Читаем схему по стрелкам: берём два значения, задаём вопрос знаком сравнения и получаем
          ответ <code>True</code> или <code>False</code>.
        </p>
        <p>
          Представим план чтения и отметку рядом с ним. Числа показывают, сколько страниц уже
          прочитано и сколько мы планировали. Сравнение отвечает на вопрос «план ещё не выполнен?».
          Бумажная отметка помогает представить ответ, но в Python мы получаем точные значения
          <code>True</code> или <code>False</code>.
        </p>
        <PredictOutput
          code={'pages_read = 7\npage_goal = 10\nprint(pages_read < page_goal)'}
          output="True"
          hint="Сначала прочитаем знак как вопрос «меньше ли», затем сравним 7 и 10."
        />
        <p>
          Теперь мысленно заменим 7 на 12. Вопрос остаётся «меньше ли десяти», поэтому ответ станет
          <code>False</code>. Проверим, как изменится ответ, если страниц ровно десять.
        </p>
        <p>
          Слово <code>True</code> без кавычек показывает значение типа <code>bool</code>. Кавычки
          меняют смысл: <code>"False"</code> становится строкой из букв, а <code>False</code> без
          кавычек остаётся ответом типа <code>bool</code>. Здесь сравниваем числа с числами и строки
          с такими же строками. Преобразовывать их для этого не нужно.
        </p>
        <p>
          Само слово <code>True</code> не означает «всё хорошо». Оно означает только, что наш вопрос
          получил ответ «да». Для выражения <code>pages_read &lt; page_goal</code> это значит, что мы
          прочитали меньше запланированного. Если изменить знак на <code>&gt;=</code>, то
          <code>True</code> уже будет означать, что план достигнут. Сначала читаем вопрос, потом
          объясняем ответ.
        </p>
        <p>
          Имя хранит значение, а сравнение вычисляет ответ. Если сохранить ответ в другом имени,
          позже мы сможем его вывести. Пока этот ответ ничего не выбирает за программу. Мы можем
          посмотреть на него и объяснить, почему получили именно его.
        </p>
      </Section>

      <Section number="02" title="Знак задаёт точный вопрос">
        <Lead>
          Прочитаем знак до подстановки чисел. Так мы сначала поймём правило, а потом проверим,
          подходит ли ему значение.
        </Lead>
        <MethodGrid
          rows={[
            [<code>==</code>, "Значения равны?"],
            [<code>!=</code>, "Значения различаются?"],
            [<code>&lt;</code>, "Первое значение строго меньше второго?"],
            [<code>&gt;</code>, "Первое значение строго больше второго?"],
            [<code>&lt;=</code>, "Первое значение меньше второго или равно ему?"],
            [<code>&gt;=</code>, "Первое значение больше второго или равно ему?"],
          ]}
        />
        <p>
          Два знака равенства <code>==</code> спрашивают, равны ли значения. Один знак <code>=</code>
          сохраняет значение в имени. В строке <code>limit = 12</code> мы сохраняем число 12 под
          именем <code>limit</code>. В выражении <code>limit == 12</code> спрашиваем, равно ли
          сохранённое число двенадцати. Знаки похожи, действия разные.
        </p>
        <p>
          Например, проверим число билетов. Если у нас 12 билетов, выражение
          <code>tickets == 12</code> даёт <code>True</code>. Оно не меняет число билетов. Если
          поставить один знак <code>=</code>, мы уже не задаём вопрос, а сохраняем значение. Перед
          запуском прочитаем строку словами: «равно ли это 12?» или «сохраним ли мы 12 в имени?»
        </p>
        <p>
          Знаки порядка тоже читаем точно. <code>&lt;</code> и <code>&gt;</code> не включают равенство.
          Знаки <code>&lt;=</code> и <code>&gt;=</code> включают его. Python не угадывает, что значит
          «достаточно». Сначала решаем, подходит ли число на границе, затем выбираем знак.
        </p>
        <p>
          Проверим знаки на одинаковых числах. <code>12 == 12</code> отвечает <code>True</code>, а
          <code>12 != 12</code> отвечает <code>False</code>: числа равны. Для пары 12 и 13 ответы
          будут обратными. Значит, <code>==</code> спрашивает о совпадении, а <code>!=</code> о
          различии. Такой маленький пример помогает не спутать знак с присваиванием.
        </p>
        <p>Проверим, не превратился ли вопрос о равенстве в присваивание.</p>
        <BugHunt
          code={'target = 12\nanswer = target\nprint(answer)'}
          question="Почему программа показывает число 12, а не ответ на вопрос «target равно 12»?"
          options={[
            "Строка answer = target сохраняет само число. Вопроса-сравнения здесь нет",
            "Число 12 нельзя сравнивать с целым значением",
            "Для ответа обязательно нужен if",
          ]}
          correctIndex={0}
          explanation="Строка answer = target сохраняет число 12 во втором имени. Для вопроса о равенстве добавим сравнение с ==. if для такого ответа не нужен."
          fix={'target = 12\nanswer = target == 12\nprint(answer)'}
        />
        <p>
          Теперь в <code>answer</code> сохраняется результат сравнения. Он равен <code>True</code>,
          потому что <code>target</code> содержит 12. Условный блок не нужен: Python уже вычислил
          ответ, и мы можем сразу его вывести. Позже мы научимся выбирать действия по такому ответу.
        </p>
      </Section>

      <Section number="03" title="Проверяем границу с трёх сторон">
        <Lead>
          Чтобы понять, входит ли граница в правило, проверим число ниже неё, само число на границе и
          число выше неё.
        </Lead>
        <p>
          Допустим, цель выполнена, если решено не меньше 18 примеров. Это значит: число больше 18
          или равно 18. Подходит знак <code>&gt;=</code>. Для 17 ответ будет <code>False</code>, для
          18 и 19 ответ будет <code>True</code>. Знак <code>&gt;</code> не пропустит ровно 18.
        </p>
        <p>
          Представим линию на табло с числом 18. Правило «строго больше 18» пропускает только числа
          после линии. Правило «18 или больше» включает саму линию. Так легче увидеть разницу между
          <code>&gt;</code> и <code>&gt;=</code>. Это только образ: Python не видит физическую линию,
          он сравнивает числа.
        </p>
        <p>
          У диапазона две границы. Мы отдельно решаем, входит ли число на каждой из них. Например,
          «от 10 до 20 включительно» принимает и 10, и 20. Если нужно число больше 10, но меньше 20,
          оба края исключены. Слова «от» и «до» могут быть неясными, поэтому в правиле уточняем оба
          края. Знаки у них могут быть разными.
        </p>
        <p>
          Одного числа внутри диапазона мало: оно не покажет, включён ли край. Поэтому сравним оба
          правила на трёх значениях. Таблица показывает, что изменится, если заменить строгий знак на
          знак с равенством.
        </p>
        <MethodGrid
          rows={[
            [<>Число 17, ниже 18</>, <><code>&gt; 18</code>: False; <code>&gt;= 18</code>: False</>],
            [<>Число 18, ровно на границе</>, <><code>&gt; 18</code>: False; <code>&gt;= 18</code>: True</>],
            [<>Число 19, выше 18</>, <><code>&gt; 18</code>: True; <code>&gt;= 18</code>: True</>],
          ]}
        />
        <p>
          Сначала смотрим на строку 18. Только знак <code>&gt;=</code> включает равенство порогу.
          Числа 17 и 19 помогают убедиться, что правило работает и ниже, и выше границы.
        </p>
        <p>
          У полного диапазона проверяем оба края. Для числа 12 правило от 10 до 20 проходит слева и
          справа. Для 9 не проходит левая граница, а для 21 не проходит правая. Поэтому одного
          примера внутри диапазона мало: проверим также числа за обоими краями и сами границы.
        </p>
        <p>Сравним строгое правило с правилом, которое включает порог.</p>
        <BugHunt
          code={'solved = 18\nminimum = 18\nmeets_goal = solved > minimum\nprint(meets_goal)'}
          question="В правиле «не меньше 18» число 18 должно пройти. Какая деталь не совпадает с этим правилом?"
          options={[
            "Знак > исключает равенство, хотя граница включена",
            "Знак > изменяет значение solved",
            "Сравнение обязано использовать строки",
          ]}
          correctIndex={0}
          explanation="При solved = 18 строгое > возвращает False. Мы включаем порог знаком >=, чтобы равенство тоже подходило."
          fix={'solved = 18\nminimum = 18\nmeets_goal = solved >= minimum\nprint(meets_goal)'}
        />
        <p>
          После исправления число 18 подходит, а 17 нет. Число 19 тоже подходит. Если правило
          изменится на «строго больше 18», вернём <code>&gt;</code>, и на самой границе получим
          <code>False</code>. Знак выбираем по смыслу правила.
        </p>
      </Section>

      <Section number="04" title="Соединяем ответы через and, or и not">
        <Lead>
          В сложном правиле сначала получаем несколько простых ответов. Потом соединяем их словами
          <code>and</code>, <code>or</code> или <code>not</code>.
        </Lead>
        <p>
          <code>and</code> означает «оба ответа True». Если хотя бы один ответ <code>False</code>,
          весь результат тоже <code>False</code>. <code>or</code> означает «достаточно одного True».
          <code>not</code> меняет один ответ на противоположный: <code>True</code> становится
          <code>False</code>, а <code>False</code> становится <code>True</code>. Сейчас будем
          соединять именно такие ответы.
        </p>
        <LogicOperatorDemo />
        <p>
          Добейтесь, чтобы <code>or</code> дал <code>True</code>, а <code>and</code> дал
          <code>False</code>. Какой ответ должен быть <code>False</code>?
        </p>
        <p>
          Представим вход на выставку. Для входа нужен билет и свободное место. Оба пункта обязательны,
          поэтому здесь подходит <code>and</code>. Билет можно получить по приглашению или купить:
          достаточно одного способа, поэтому между ними подходит <code>or</code>. Значит, правило
          целиком такое: «есть приглашение или билет куплен, и есть свободное место». В программе мы
          только вычисляем ответ, а не управляем настоящим входом.
        </p>
        <p>
          Проверим отдельно слово <code>not</code>. Если <code>has_invitation</code> равно
          <code>False</code>, то <code>not has_invitation</code> даст <code>True</code>: приглашения
          действительно нет. Сам исходный ответ остаётся <code>False</code>, а новое выражение
          возвращает обратный ответ. Представим две карточки: на первой записан факт, на второй
          ответ на обратный вопрос.
        </p>
        <TrueFalse
          statement={<>Если <code>has_invitation = False</code>, то <code>not has_invitation</code> даст <code>True</code>.</>}
          isTrue={true}
          explanation="not меняет один ответ на противоположный: False становится True."
        />
        <p>
          Команда <code>print(a, b, c)</code> показывает несколько значений в одной строке, в том
          порядке, в котором они записаны. Запятые отделяют значения, а Python ставит между ними
          пробелы. Запятая здесь не объединяет логические ответы: за это отвечают <code>and</code> и
          <code>or</code>.
        </p>
        <p>
          Перед общим правилом назовём три ответа: есть ли приглашение, куплен ли билет и есть ли
          свободное место. Сначала объединим два способа получить билет скобками:
          <code>(has_invitation or has_paid)</code> и сохраним ответ в <code>has_ticket</code>. Затем
          добавим через <code>and</code> обязательное свободное место:
          <code>has_ticket and has_seat</code>. Так скобки сразу показывают, что билет можно получить
          любым из двух способов, а место нужно обязательно.
        </p>
        <StepThrough
          code={'has_invitation = False\nhas_paid = True\nhas_seat = True\nhas_ticket = (has_invitation or has_paid)\ncan_enter = has_ticket and has_seat\nprint(has_ticket, has_seat, can_enter)'}
          steps={[
            { line: 0, note: "Приглашения нет. Первый ответ: False.", vars: { has_invitation: "False" } },
            { line: 1, note: "Билет куплен. Второй ответ: True.", vars: { has_invitation: "False", has_paid: "True" } },
            { line: 2, note: "Есть свободное место. Третий ответ: True.", vars: { has_invitation: "False", has_paid: "True", has_seat: "True" } },
            { line: 3, note: "Скобки сначала соединяют два способа получить билет через or. Поэтому has_ticket равен True.", vars: { has_ticket: "True" } },
            { line: 4, note: "and проверяет билет и место. Оба ответа True, поэтому войти можно.", vars: { has_ticket: "True", can_enter: "True" } },
            { line: 5, note: "print выводит строку True True True: значения идут по порядку и разделены пробелами.", vars: { has_ticket: "True", has_seat: "True", can_enter: "True" } },
          ]}
        />
        <p>
          Здесь <code>and</code> требует два основания: билет и свободное место. Билет появляется,
          если сработало хотя бы одно из двух: есть приглашение или покупка. Если спросим «есть
          приглашение или билет куплен?», ответ <code>or</code> будет <code>True</code>, потому что
          билет куплен. Чтобы спросить, отсутствует ли приглашение, поставим перед именем
          <code>not</code>: <code>not has_invitation</code>. Оно меняет только следующий за ним ответ.
        </p>
        <p>
          Скобки могут менять вопрос. <code>not (has_ticket and has_seat)</code> переворачивает общий
          ответ о билете и месте. А <code>(not has_ticket) and has_seat</code> сначала меняет только
          ответ о билете, затем соединяет его со вторым. Без скобок действует установленный порядок:
          сначала <code>not</code>, потом <code>and</code>, затем <code>or</code>. Пока проще
          поставить скобки явно и читать выражение по частям.
        </p>
        <p>
          Здесь <code>and</code>, <code>or</code> и <code>not</code> работают с ответами
          <code>True</code> и <code>False</code>. Строка <code>"False"</code> состоит из букв и не
          становится ответом <code>False</code>. Другие правила этих слов мы разберём позже.
        </p>
      </Section>

      <Section number="05" title="Читаем диапазон одной цепочкой">
        <Lead>
          Мы уже умеем проверять две границы отдельно и соединять ответы через <code>and</code>.
          Теперь запишем тот же диапазон короче.
        </Lead>
        <p>
          Возьмём числа от 10 включительно до 20, не включая 20. Отдельно спросим: «value не меньше
          10?» и «value меньше 20?». Обе проверки должны дать <code>True</code>:
          <code>value &gt;= 10 and value &lt; 20</code>. Те же две границы можно записать одной
          цепочкой: <code>10 &lt;= value &lt; 20</code>.
        </p>
        <p>
          Читаем слева направо. Сначала проверяем, что 10 меньше либо равно <code>value</code>. Потом
          проверяем, что <code>value</code> меньше 20. Например, при <code>value = 14</code> обе
          проверки дают <code>True</code>, значит, 14 внутри диапазона. При 10 ответ тоже
          <code>True</code>, а при 20 уже <code>False</code>.
        </p>
        <MethodGrid
          rows={[
            ["Шаг 1", <><code>10 &lt;= 14</code> даёт True: левая граница подходит.</>],
            ["Шаг 2", <><code>14 &lt; 20</code> даёт True: правая граница тоже подходит.</>],
            ["Ответ", <>Обе проверки True, значит, число 14 внутри диапазона.</>],
          ]}
        />
        <RangeBoundaryDemo />
        <p>
          Представим бумажную линейку: отметили участок от 10 до 20. Значение посередине должно
          пройти проверку у левого края и у правого. Линейка показывает границы, но не считает ответ.
          В коде за каждую проверку отвечает знак сравнения.
        </p>
        <p>
          Если вместо 14 подставить 22, первая часть <code>10 &lt;= 22</code> будет верной, а вторая
          <code>22 &lt; 20</code> ложной. Вся цепочка даст <code>False</code>, потому что обе
          границы одновременно не пройдены. Так мы читаем цепочку как два коротких вопроса, а не как
          один непонятный знак.
        </p>
        <p>
          Перед записью цепочки прочитаем её как два вопроса. Так мы заметим, если край должен
          входить в диапазон, а знак его исключает. Можно развернуть цепочку через <code>and</code> и
          проверить, что обе записи принимают одни и те же числа.
        </p>
        <CompareSolutions
          question="Обе записи описывают диапазон от 10 включительно до 20 не включительно. Совпадает ли смысл?"
          left={{
            title: "Цепное сравнение",
            code: "10 <= value < 20",
            note: "Нижняя граница включена, верхняя исключена.",
          }}
          right={{
            title: "Два сравнения через and",
            code: "value >= 10 and value < 20",
            note: "Оба булевых ответа должны быть True.",
          }}
          preferred="both"
          explanation="Обе формы проверяют одни и те же две границы. Для value = 10 обе дают True, для value = 20 обе дают False."
        />
        <p>
          Проверим обе записи на краях и внутри диапазона. Если внутри ответы совпали, а на границе
          различаются, один знак выбран неверно. В цепочке каждый знак отвечает за свою границу.
        </p>
        <p>
          В практике сравним две формы и исправим один знак. Затем посмотрим, почему число 5 входит
          в диапазон, а 13 нет.
        </p>
      </Section>

      <Section number="06" title="Что мы будем делать в практике">
        <Lead>
          Мы начнём с подготовленных числовых значений в редакторе платформы. В каждом коротком
          скрипте сначала предскажем bool, затем запустим программу и объясним расхождение, если
          ответ окажется неожиданным.
        </Lead>
        <LinkedNotes
          variant="connected"
          items={[
            { title: "Проверим порог", description: "Сравним число с 60 и увидим, подходит ли само значение на границе." },
            { title: "Составим правило", description: "Соединим три простых ответа и увидим, когда занятие можно начать." },
            { title: "Сверим диапазон", description: "Исправим две записи и проверим, что они одинаково отвечают на новых числах." },
          ]}
        />
        <p>
          Сначала сравним числа с порогом. Затем отдельно получим ответы о паузе, плане и напоминании,
          а после соединим их. В последней части вернёмся к двум границам и сравним короткую и
          подробную запись диапазона.
        </p>
        <p>
          Результат увидим в выводе для нескольких наборов чисел, в том числе на границах. Объясним,
          почему получили каждый ответ. Всё делаем в редакторе платформы: без файлов, проекта и
          ввода с клавиатуры. Учебные примеры помогут понять правило, а новые значения покажут,
          можем ли мы применить его сами.
        </p>
      </Section>
    </RichLesson>
  );
}
