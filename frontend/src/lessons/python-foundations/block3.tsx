import { AlertTriangle, Boxes, Braces, Bug, FunctionSquare, KeyRound, Layers, Puzzle, ShieldCheck } from "lucide-react";
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
  TrueFalse,
  TypeCard,
  TypeCards,
} from "../shared";

type TheoryBridgeData = { link: string; boundary: string };

const THEORY_BRIDGES: Record<number, TheoryBridgeData> = {
  11: {"link":"Циклы уже обходят значения по одному, теперь выбираем форму для их хранения: список, кортеж и множество решают разные задачи.","boundary":"Новое имя списка не создаёт копию: два имени могут указывать на один объект."},
  12: {"link":"Список хранит набор задач, а словарь описывает поля одной задачи по именам; вместе они создают простую модель проекта.","boundary":"Квадратные скобки нужны для обязательного поля, get() — для необязательного; это разные договорённости."},
  13: {"link":"Повторяемое правило получает имя и границу: функция принимает аргументы, выполняет действие и при необходимости возвращает результат.","boundary":"print показывает значение человеку, а return передаёт его коду; одно не заменяет другое."},
  14: {"link":"Функции позволяют разбить широкое действие на контракты с понятными входами и выходами, не скрывая зависимости.","boundary":"Не каждую строку нужно превращать в функцию: отдельный блок нужен, когда у него есть самостоятельная цель и результат."},
  15: {"link":"Ошибки теперь могут возникать в данных, условиях, циклах и функциях; traceback показывает место, тип и путь до сбоя.","boundary":"Не скрывайте непонятную ошибку случайным except: сначала нужно установить нарушенное предположение."},
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


// 11. Списки, кортежи и множества
export function Lesson11({ module }: { module?: string }) {
  return (
    <RichLesson>
      <RichHero
        chip={module ?? "Блок 3 · Данные проекта и функции"}
        title="Списки, кортежи и множества"
        intro="Перейдём от отдельных переменных к коллекциям: научимся безопасно менять список, понимать ссылки и копии, выбирать кортеж для фиксированных данных и множество для уникальности."
        tags={[
          { icon: <Layers size={14} />, label: "list и изменение" },
          { icon: <ShieldCheck size={14} />, label: "tuple · set" },
        ]}
      />
      <TheoryBridge lesson={11} />

      <Section number="01" title="Маршрут занятия">
        <Lead>
          Коллекции решают разные задачи. Важно не просто запомнить три названия, а выбрать структуру по требованиям:
          нужен ли порядок, допустимы ли изменения и должны ли повторы сохраняться.
        </Lead>

        <div className="lesson-route">
          <ol>
            <li>
              <strong>Хранить последовательность:</strong> использовать{" "}
              <code className="lesson-token">list</code>, когда элементы имеют порядок и набор будет меняться.
            </li>
            <li>
              <strong>Зафиксировать запись:</strong> выбрать{" "}
              <code className="lesson-token">tuple</code>, когда позиции имеют постоянный смысл.
            </li>
            <li>
              <strong>Контролировать уникальность:</strong> применить{" "}
              <code className="lesson-token">set</code> для проверки повторов и принадлежности.
            </li>
          </ol>
          <p>
            Дополнительно вы разберёте индексы, пустые коллекции, <code>append</code>, <code>pop</code>,{" "}
            <code>remove</code>, второе имя одного списка и алгоритм уникальности с сохранением порядка.
          </p>
        </div>

        <Callout tone="info">
          Основной вопрос урока: <strong>какое поведение данных требуется проекту</strong>, а не какая запись короче.
        </Callout>
      </Section>

      <Section number="02" title="Список — упорядоченная изменяемая последовательность">
        <Lead>
          Список хранит несколько значений под одним именем. Позиции начинаются с{" "}
          <span className="lesson-emphasis">нуля</span>, а индекс <code className="lesson-token">-1</code> обозначает
          последний элемент.
        </Lead>

        <CodeBlock
          caption="индексы списка"
          code={
            'tasks = ["Python", "Git", "SQL"]\n\n' +
            "print(tasks[0])   # Python\n" +
            "print(tasks[1])   # Git\n" +
            "print(tasks[-1])  # SQL\n" +
            "print(len(tasks)) # 3"
          }
        />

        <PredictOutput
          code={'tasks = ["Python", "Git", "SQL"]\nprint(tasks[0:2])\nprint("Docker" in tasks)'}
          output={"['Python', 'Git']\nFalse"}
          hint="Правая граница среза не включается, а in проверяет наличие значения."
        />

        <BugHunt
          code={'tasks = []\nprint(tasks[0])'}
          question="Почему программа завершается ошибкой?"
          options={[
            "Списки нельзя передавать в print",
            "У пустого списка нет индекса 0",
            "Первый индекс списка равен 1",
          ]}
          correctIndex={1}
          explanation="Пустой список не содержит ни одного элемента, поэтому обращение по индексу невозможно."
          fix={'tasks = []\nif tasks:\n    print(tasks[0])\nelse:\n    print("Список пуст")'}
        />

        <div className="lesson-practice-steps">
          <p>
            <code className="lesson-token">len(tasks)</code> возвращает количество элементов, а{" "}
            <code className="lesson-token">&quot;Git&quot; in tasks</code> проверяет принадлежность.
          </p>
          <p>
            Срез <code className="lesson-token">tasks[1:3]</code> создаёт новый верхний список и не включает правую
            границу.
          </p>
        </div>
      </Section>

      <Section number="03" title="Добавление, замена и удаление">
        <Lead>
          Список можно менять на месте. Перед операцией сформулируйте, что известно:{" "}
          <span className="lesson-emphasis">новое значение, позиция или существующее значение</span>.
        </Lead>

        <MethodGrid
          rows={[
            [<>tasks.append("Docker")</>, "добавить один объект в конец"],
            [<>tasks[1] = "GitHub"</>, "заменить элемент по позиции"],
            [<>tasks.pop()</>, "удалить и вернуть последний элемент"],
            [<>tasks.pop(0)</>, "удалить и вернуть элемент по индексу"],
            [<>tasks.remove("Git")</>, "удалить первое совпадение по значению"],
          ]}
        />

        <PredictOutput
          code={'numbers = [1]\nnumbers.append([2, 3])\nprint(numbers)\nprint(len(numbers))'}
          output={"[1, [2, 3]]\n2"}
          hint="append добавляет переданный список как один вложенный элемент."
        />

        <CompareSolutions
          question="Как безопасно удалить Git, если значения может не быть?"
          left={{
            title: "Без проверки",
            code: 'tasks.remove("Git")',
            note: "При отсутствии Git возникнет ValueError.",
          }}
          right={{
            title: "С проверкой",
            code: 'if "Git" in tasks:\n    tasks.remove("Git")',
            note: "Удаление выполняется только для существующего значения.",
          }}
          preferred="right"
          explanation="remove работает по значению и требует, чтобы совпадение существовало."
        />

        <Callout>
          <code className="lesson-token lesson-token--danger">pop()</code> пустого списка вызывает{" "}
          <code>IndexError</code>, а <code className="lesson-token lesson-token--danger">remove(value)</code> без
          совпадения — <code>ValueError</code>.
        </Callout>
      </Section>

      <Section number="04" title="Второе имя не создаёт копию">
        <Lead>
          Список — изменяемый объект. Присваивание сохраняет ещё одну ссылку, поэтому изменение через одно имя видно
          через другое.
        </Lead>

        <StepThrough
          code={'first = ["Python"]\nsecond = first\nsecond.append("SQL")\nprint(first)'}
          steps={[
            { line: 0, note: 'Создан один список ["Python"].', vars: { first: '→ ["Python"]' } },
            {
              line: 1,
              note: "second получает ссылку на тот же объект, содержимое не копируется.",
              vars: { first: "→ один список", second: "→ тот же список" },
            },
            {
              line: 2,
              note: "append меняет общий объект.",
              vars: { first: '→ ["Python", "SQL"]', second: '→ ["Python", "SQL"]' },
            },
            {
              line: 3,
              note: "Через first видно изменение, сделанное через second.",
              vars: { вывод: "['Python', 'SQL']" },
            },
          ]}
        />

        <CompareSolutions
          question="Как получить отдельный верхний список?"
          left={{
            title: "Второе имя",
            code: "second = first",
            note: "Оба имени указывают на один объект.",
          }}
          right={{
            title: "Поверхностная копия",
            code: "second = first.copy()",
            note: "Верхние списки становятся независимыми.",
          }}
          preferred="right"
          explanation="copy() создаёт новый список верхнего уровня. Вложенные изменяемые объекты могут остаться общими."
        />

        <TrueFalse
          statement={
            <>
              После <code>copy = original.copy()</code> вызов <code>copy.append(value)</code> изменит сам{" "}
              <code>original</code>.
            </>
          }
          isTrue={false}
          explanation="append меняет отдельную верхнюю копию, поэтому original остаётся прежним."
        />
      </Section>

      <Section number="05" title="Кортеж и множество решают другие задачи">
        <Lead>
          <code className="lesson-token">tuple</code> сохраняет порядок, но не позволяет заменить позицию.{" "}
          <code className="lesson-token">set</code> хранит уникальные значения и удобен для проверки принадлежности.
        </Lead>

        <TypeCards>
          <TypeCard
            badge="list"
            title="Последовательность проекта"
            code={'tasks = ["Python", "Git"]\ntasks.append("SQL")'}
          >
            Порядок важен, элементы добавляются и изменяются.
          </TypeCard>
          <TypeCard
            badge="tuple"
            badgeTone="float"
            title="Фиксированная запись"
            code={"screen_size = (1920, 1080)\nsingle = (5,)"}
          >
            Позиции имеют постоянный смысл. Кортеж из одного элемента требует запятую.
          </TypeCard>
          <TypeCard
            badge="set"
            badgeTone="str"
            title="Уникальность"
            code={'tags = {"python", "sql", "python"}\ntags.add("git")'}
          >
            Повторы схлопываются. Пустое множество создаётся через <code>set()</code>, а не <code>{"{}"}</code>.
          </TypeCard>
        </TypeCards>

        <MatchPairs
          prompt="Соедините требование проекта с подходящей структурой."
          leftTitle="Требование"
          rightTitle="Структура"
          pairs={[
            { left: "задачи в порядке создания", right: "list" },
            { left: "фиксированная пара ширина/высота", right: "tuple" },
            { left: "набор уникальных допустимых команд", right: "set" },
          ]}
          explanation="Выбор структуры определяется поведением данных."
        />

        <BugHunt
          code={"tags = {}\ntags.add(\"python\")"}
          question="Почему вызов add не работает?"
          options={[
            "{} создаёт пустой словарь",
            "Множества не поддерживают строки",
            "Метод add требует два аргумента",
          ]}
          correctIndex={0}
          explanation="Пустое множество создаётся вызовом set()."
          fix={'tags = set()\ntags.add("python")'}
        />
      </Section>

      <Section number="06" title="Уникальность с сохранением порядка">
        <Lead>
          Запись <code className="lesson-token lesson-token--danger">list(set(tags))</code> удаляет повторы, но не
          выражает требование сохранить первое появление. Для двух требований нужны две структуры.
        </Lead>

        <StepThrough
          code={
            'tags = ["python", "sql", "python", "git"]\n' +
            "result = []\n" +
            "seen = set()\n\n" +
            "for tag in tags:\n" +
            "    if tag not in seen:\n" +
            "        result.append(tag)\n" +
            "        seen.add(tag)"
          }
          steps={[
            {
              line: 0,
              note: "Исходный порядок задан списком tags.",
              vars: { tags: '["python", "sql", "python", "git"]' },
            },
            { line: 1, note: "result будет хранить порядок первого появления.", vars: { result: "[]" } },
            { line: 2, note: "seen отвечает только за проверку повторов.", vars: { seen: "set()" } },
            {
              line: 5,
              note: "Первый python отсутствует в seen, поэтому добавляется в обе структуры.",
              vars: { result: '["python"]', seen: '{"python"}' },
            },
            {
              line: 5,
              note: "sql тоже встречен впервые.",
              vars: { result: '["python", "sql"]', seen: '{"python", "sql"}' },
            },
            {
              line: 5,
              note: "Второй python уже есть в seen, тело if пропускается.",
              vars: { result: '["python", "sql"]' },
            },
            {
              line: 5,
              note: "git добавляется как новое значение.",
              vars: { result: '["python", "sql", "git"]' },
            },
          ]}
        />

        <CodeSequence
          title="Соберите алгоритм уникальных тегов"
          prompt="Расположите строки так, чтобы порядок первого появления сохранился."
          pieces={[
            { id: "result", code: "result = []" },
            { id: "seen", code: "seen = set()" },
            { id: "loop", code: "for tag in tags:" },
            { id: "check", code: "    if tag not in seen:" },
            { id: "append", code: "        result.append(tag)" },
            { id: "mark", code: "        seen.add(tag)" },
            { id: "wrong", code: "result = list(set(tags))", note: "не выражает требование порядка" },
          ]}
          correctOrder={["result", "seen", "loop", "check", "append", "mark"]}
          explanation="Список сохраняет порядок результата, множество сообщает, встречался ли тег раньше."
        />
      </Section>

      <Section number="07" title="Практика и связь со StudyHub">
        <Lead>
          В StudyHub список хранит задачи в порядке создания, кортеж может описывать фиксированную пару, а множество
          помогает отслеживать уже добавленные теги.
        </Lead>

        <CodeBlock
          caption="локальный пример"
          code={
            'tasks = ["Строки", "Boolean", "Циклы"]\n' +
            'allowed_statuses = ("new", "in_progress", "done")\n' +
            "seen_tags = set()\n\n" +
            'tasks.append("Коллекции")\n' +
            'for tag in ["python", "backend", "python"]:\n' +
            "    if tag not in seen_tags:\n" +
            "        seen_tags.add(tag)\n\n" +
            "print(tasks)\n" +
            "print(allowed_statuses)\n" +
            "print(len(seen_tags))"
          }
        />

        <RecallCard
          question="Почему для удаления повторов с сохранением порядка используются и list, и set?"
          hint="У каждой структуры своя ответственность."
          answer={
            <p>
              <code>list</code> сохраняет порядок первого появления, а <code>set</code> быстро сообщает, встречалось ли
              значение. Одна структура не выражает оба требования так ясно.
            </p>
          }
        />

        <Callout tone="info">
          В задаче платформы исходный список нельзя менять. Функция <code>solve(tags)</code> возвращает новый список,
          а для пустого входа возвращает <code>[]</code>.
        </Callout>
      </Section>

      <Section number="08" title="Проверь себя">
        <div className="lesson-check-group">
          <QuizCard
            question="Что делает append([1, 2])?"
            options={["добавляет два числа", "добавляет один вложенный список", "заменяет весь список"]}
            correctIndex={1}
            explanation="append всегда добавляет переданный объект как один элемент."
          />
          <QuizCard
            question="Чем pop отличается от remove?"
            options={["pop работает по позиции и возвращает значение", "remove всегда возвращает значение", "разницы нет"]}
            correctIndex={0}
            explanation="pop ориентируется на индекс, remove ищет первое совпадение по значению."
          />
          <QuizCard
            question="Что создаёт запись second = first?"
            options={["глубокую копию", "поверхностную копию", "второе имя одного объекта"]}
            correctIndex={2}
            explanation="Содержимое не копируется."
          />
          <QuizCard
            question="Как записать кортеж из одного элемента?"
            options={["(5)", "(5,)", "[5]"]}
            correctIndex={1}
            explanation="Тип создаёт запятая: (5,) — tuple, (5) — int."
          />
          <QuizCard
            question="Почему нельзя полагаться на list(set(tags)) при требовании порядка?"
            options={["set не принимает строки", "set отвечает за уникальность, а не пользовательский порядок", "результат будет словарём"]}
            correctIndex={1}
            explanation="Требование порядка нужно явно сохранять отдельным списком."
          />
        </div>

        <KeyTakeaways
          points={[
            <>Список упорядочен и изменяем.</>,
            <><code>append</code> добавляет один объект.</>,
            <><code>pop</code> работает по позиции, <code>remove</code> — по значению.</>,
            <>Присваивание не копирует изменяемый объект.</>,
            <>Кортеж подходит для фиксированной записи.</>,
            <>Множество выражает уникальность и принадлежность.</>,
            <>Порядок и уникальность удобно разделить между списком и множеством.</>,
          ]}
        />

        <PracticeCta text="Откройте practice.py: решите задачи на уникальные теги и обнаружение повторов." />
      </Section>
    </RichLesson>
  );
}

// 12. Словари и модель задачи
export function Lesson12({ module }: { module?: string }) {
  return (
    <RichLesson>
      <RichHero
        chip={module ?? "Блок 3 · Данные проекта и функции"}
        title="Словари и модель задачи"
        intro="Соберём одну задачу как набор именованных полей: разберём ключи и значения, обязательный доступ через [], безопасный get(), изменение словаря и список словарей как модель проекта."
        tags={[
          { icon: <Braces size={14} />, label: "ключ → значение" },
          { icon: <KeyRound size={14} />, label: "модель задачи" },
        ]}
      />
      <TheoryBridge lesson={12} />

      <Section number="01" title="Маршрут занятия">
        <Lead>
          Список отвечает на вопрос «какой элемент стоит на позиции?», а словарь — «какое значение хранится в поле с
          таким именем?». Это позволяет описать одну задачу понятнее, чем набором числовых индексов.
        </Lead>

        <div className="lesson-route">
          <ol>
            <li>
              <strong>Создать форму:</strong> записать поля задачи как пары{" "}
              <code className="lesson-token">ключ: значение</code>.
            </li>
            <li>
              <strong>Выбрать доступ:</strong> использовать{" "}
              <code className="lesson-token">task[&quot;title&quot;]</code> для обязательного поля и{" "}
              <code className="lesson-token">task.get(...)</code> для необязательного.
            </li>
            <li>
              <strong>Собрать проект:</strong> хранить одну задачу в словаре, а несколько задач — в списке словарей.
            </li>
          </ol>
          <p>
            Дополнительно вы добавите и удалите поля, переберёте пары через <code>items()</code>, разберёте{" "}
            <code>KeyError</code>, ссылки и копирование словаря.
          </p>
        </div>

        <Callout tone="info">
          Главная идея: <strong>имена ключей становятся договором между частями проекта</strong>.
        </Callout>
      </Section>

      <Section number="02" title="Словарь хранит именованные поля">
        <Lead>
          Вместо неясного <code className="lesson-token">task[2]</code> словарь позволяет написать{" "}
          <code className="lesson-token">task[&quot;priority&quot;]</code> и сразу увидеть смысл значения.
        </Lead>

        <CompareSolutions
          question="Какая модель понятнее описывает одну задачу?"
          left={{
            title: "Позиции без имён",
            code: 'task = [1, "SQL", 3, False]\nprint(task[2])',
            note: "Нужно помнить смысл каждой позиции.",
          }}
          right={{
            title: "Именованные поля",
            code: 'task = {\n    "id": 1,\n    "title": "SQL",\n    "priority": 3,\n    "is_done": False,\n}',
            note: "Каждое значение читается по предметному имени.",
          }}
          preferred="right"
          explanation="Словарь делает структуру данных самодокументируемой."
        />

        <CodeBlock
          caption="форма одной задачи"
          code={
            'task = {\n' +
            '    "id": 1,\n' +
            '    "title": "Изучить словари",\n' +
            '    "priority": 3,\n' +
            '    "is_done": False,\n' +
            "}\n\n" +
            'print(task["title"])\n' +
            'print(task["priority"])'
          }
        />

        <PredictOutput
          code={'task = {"priority": 1, "priority": 5}\nprint(task)'}
          output={"{'priority': 5}"}
          hint="Ключи одного словаря уникальны, повторное значение заменяет предыдущее."
        />

        <TrueFalse
          statement={
            <>
              Запись <code>{"{}"}</code> создаёт пустое множество.
            </>
          }
          isTrue={false}
          explanation="{} создаёт пустой словарь. Для пустого множества нужен set()."
        />
      </Section>

      <Section number="03" title="Обязательное поле и KeyError">
        <Lead>
          Квадратные скобки означают:{" "}
          <span className="lesson-emphasis">ключ обязан существовать по договору модели</span>.
        </Lead>

        <BugHunt
          code={'task = {"title": "SQL"}\nprint(task["priority"])'}
          question="Какое правило нарушено?"
          options={[
            "Словарь не может хранить строки",
            "Обязательный ключ priority отсутствует",
            "print нельзя использовать со словарём",
          ]}
          correctIndex={1}
          explanation="Доступ через [] требует существующий ключ и при его отсутствии вызывает KeyError."
          fix={'task = {"title": "SQL", "priority": 1}\nprint(task["priority"])'}
        />

        <div className="lesson-practice-steps">
          <p>
            <code className="lesson-token">&quot;priority&quot; in task</code> проверяет наличие{" "}
            <span className="lesson-emphasis">ключа</span>, а не значения.
          </p>
          <p>
            Для обязательного <code>title</code> ошибка полезна: она быстро показывает, что форма данных нарушена.
          </p>
          <p>
            Если одна функция создаёт ключ <code>name</code>, а другая читает <code>title</code>, исправлять нужно
            место создания, а не маскировать проблему.
          </p>
        </div>

        <RecallCard
          question="Почему KeyError иногда полезнее значения по умолчанию?"
          hint="Подумайте об обязательном поле модели."
          answer={
            <p>
              Если поле обязательно, ошибка сразу сообщает о нарушении формы. Значение по умолчанию могло бы скрыть
              опечатку или дефект места, где словарь был создан.
            </p>
          }
        />
      </Section>

      <Section number="04" title="get() для действительно необязательного поля">
        <Lead>
          <code className="lesson-token">get()</code> возвращает значение либо выбранный запасной вариант, но{" "}
          <span className="lesson-emphasis">не добавляет ключ в словарь</span>.
        </Lead>

        <StepThrough
          code={'task = {"title": "Git"}\npriority = task.get("priority", 1)\nprint(priority)\nprint(task)'}
          steps={[
            { line: 0, note: "Словарь содержит только обязательный title.", vars: { task: "{title: Git}" } },
            {
              line: 1,
              note: "Ключ priority отсутствует, поэтому get возвращает значение по умолчанию 1.",
              vars: { priority: "1" },
            },
            { line: 2, note: "Печатается возвращённое значение.", vars: { вывод: "1" } },
            {
              line: 3,
              note: "Словарь не изменился: get ничего не добавляет.",
              vars: { task: "{title: Git}", вывод: "1 ⏎ {'title': 'Git'}" },
            },
          ]}
        />

        <FillBlank
          prompt="Прочитайте необязательный приоритет со значением 1"
          before={"priority = task."}
          after={'("priority", 1)'}
          options={["get", "pop", "items"]}
          answer="get"
          explanation='get("priority", 1) возвращает значение либо 1 и не меняет словарь.'
        />

        <BugHunt
          code={'task = {"priority": 0}\npriority = task.get("priority") or 1\nprint(priority)'}
          question="Почему вывод равен 1, хотя ключ существует?"
          options={[
            "Ноль является falsy, поэтому or выбирает 1",
            "get не умеет возвращать числа",
            "В словаре нельзя хранить 0",
          ]}
          correctIndex={0}
          explanation="Значение 0 ложно в логическом контексте. Значение по умолчанию лучше передать вторым аргументом get."
          fix={'task = {"priority": 0}\npriority = task.get("priority", 1)\nprint(priority)  # 0'}
        />

        <Callout>
          Не заменяйте через <code>get()</code> все обращения. Опечатка{" "}
          <code className="lesson-token lesson-token--danger">task.get(&quot;titel&quot;)</code> тихо вернёт{" "}
          <code>None</code>.
        </Callout>
      </Section>

      <Section number="05" title="Добавление, изменение, удаление и перебор">
        <Lead>
          Присваивание по ключу добавляет новое поле или заменяет существующее. <code>pop()</code> удаляет ключ и
          возвращает старое значение.
        </Lead>

        <MethodGrid
          rows={[
            [<>task["category"] = "python"</>, "добавить новое поле"],
            [<>task["priority"] = 5</>, "заменить существующее значение"],
            [<>task.pop("category")</>, "удалить ключ и вернуть старое значение"],
            [<>task.pop("category", None)</>, "не падать, если ключ отсутствует"],
            [<>task.items()</>, "получить пары ключ–значение для цикла"],
          ]}
        />

        <CodeBlock
          caption="изменение и перебор"
          code={
            'task = {"title": "SQL", "priority": 3}\n' +
            'task["is_done"] = False\n' +
            'task["priority"] = 4\n\n' +
            "for key, value in task.items():\n" +
            "    print(key, value)"
          }
        />

        <MatchPairs
          prompt="Соедините способ перебора с данными на каждой итерации."
          leftTitle="Запись"
          rightTitle="Результат шага"
          pairs={[
            { left: "for key in task", right: "ключ" },
            { left: "for value in task.values()", right: "значение" },
            { left: "for key, value in task.items()", right: "пара ключ и значение" },
          ]}
          explanation="В бизнес-логике чаще читают конкретные ключи, а универсальный перебор полезен для диагностики."
        />
      </Section>

      <Section number="06" title="Одна модель во всём проекте">
        <Lead>
          В StudyHub одна задача имеет фиксированную форму. Если части проекта используют разные ключи, ошибка
          появляется далеко от места создания данных.
        </Lead>

        <CodeBlock
          caption="договор модели"
          code={
            'task = {\n' +
            '    "id": 1,\n' +
            '    "title": "Изучить словари",\n' +
            '    "priority": 3,\n' +
            '    "is_done": False,\n' +
            "}"
          }
        />

        <TypeCards>
          <TypeCard badge="обязательно" title="Стабильные поля" code={'task["id"]\ntask["title"]\ntask["priority"]\ntask["is_done"]'}>
            Их отсутствие означает нарушение модели.
          </TypeCard>
          <TypeCard badge="необязательно" badgeTone="float" title="Расширяемое поле" code={'task.get("deadline")\ntask.get("category", "other")'}>
            Для отсутствия заранее определено понятное поведение.
          </TypeCard>
        </TypeCards>

        <BugHunt
          code={'created = {"name": "SQL"}\nprint(created["title"])'}
          question="Где находится первичная проблема?"
          options={[
            "В print",
            "В месте создания словаря с ключом name",
            "В типе строки SQL",
          ]}
          correctIndex={1}
          explanation="Потребитель ожидает title. Нужно согласовать форму данных, а не случайно подставлять значение."
          fix={'created = {"title": "SQL"}\nprint(created["title"])'}
        />

        <Callout tone="info">
          На следующем занятии создание словаря будет сосредоточено в функции{" "}
          <code className="lesson-token">create_task(...)</code>.
        </Callout>
      </Section>

      <Section number="07" title="Список словарей и копирование">
        <Lead>
          Одна задача — один словарь. Список хранит множество таких записей и позволяет обрабатывать их циклом.
        </Lead>

        <CodeBlock
          caption="модель проекта"
          code={
            "tasks = [\n" +
            '    {"id": 1, "title": "Python", "is_done": True},\n' +
            '    {"id": 2, "title": "SQL", "is_done": False},\n' +
            "]\n\n" +
            "for task in tasks:\n" +
            '    if task.get("is_done", False):\n' +
            '        print(task["title"])'
          }
        />

        <CompareSolutions
          question="Как создать обновлённую задачу, сохранив исходную?"
          left={{
            title: "Второе имя",
            code: 'updated = task\nupdated["is_done"] = True',
            note: "Меняется тот же словарь.",
          }}
          right={{
            title: "Копия",
            code: 'updated = task.copy()\nupdated["is_done"] = True',
            note: "Верхний словарь original остаётся прежним.",
          }}
          preferred="right"
          explanation="Словарь изменяем, поэтому простое присваивание не создаёт независимую запись."
        />

        <RecallCard
          question="Чем одна задача отличается от списка задач?"
          answer={
            <p>
              Одна задача — словарь с именованными полями. Все задачи — список, каждый элемент которого является
              словарём одной записи.
            </p>
          }
        />

        <Callout tone="info">
          В практике функция не должна менять переданный словарь или список. Автопроверка может отдельно сравнить
          исходные данные после вызова.
        </Callout>
      </Section>

      <Section number="08" title="Проверь себя">
        <div className="lesson-check-group">
          <QuizCard
            question="Что произойдёт при отсутствующем task['title']?"
            options={["вернётся None", "возникнет KeyError", "добавится пустая строка"]}
            correctIndex={1}
            explanation="Квадратные скобки требуют существующий ключ."
          />
          <QuizCard
            question="Что делает task.get('priority', 1)?"
            options={["возвращает значение или 1", "всегда добавляет ключ", "удаляет ключ"]}
            correctIndex={0}
            explanation="get читает значение и не изменяет словарь."
          />
          <QuizCard
            question="Что проверяет выражение 'title' in task?"
            options={["наличие ключа", "наличие значения", "тип словаря"]}
            correctIndex={0}
            explanation="Оператор in для словаря проверяет ключи."
          />
          <QuizCard
            question="Что делает task.items()?"
            options={["возвращает пары ключ–значение", "копирует словарь", "оставляет только значения"]}
            correctIndex={0}
            explanation="items() используется для одновременного перебора ключа и значения."
          />
          <QuizCard
            question="Почему updated = task не создаёт независимую задачу?"
            options={["словарь неизменяем", "оба имени указывают на один объект", "Python запрещает копирование"]}
            correctIndex={1}
            explanation="Для отдельного верхнего словаря используется copy()."
          />
        </div>

        <KeyTakeaways
          points={[
            <>Словарь хранит пары ключ–значение.</>,
            <>Ключи одного словаря уникальны.</>,
            <><code>[]</code> выражает обязательность поля.</>,
            <><code>get()</code> подходит для необязательных полей и не добавляет ключ.</>,
            <>Присваивание по ключу добавляет или заменяет поле.</>,
            <>Одна задача — словарь, все задачи — список словарей.</>,
            <><code>copy()</code> создаёт отдельный верхний словарь.</>,
          ]}
        />

        <PracticeCta text="Откройте practice.py: соберите карточку задачи и посчитайте выполненные записи." />
      </Section>
    </RichLesson>
  );
}

// 13. Функции, параметры и return
export function Lesson13({ module }: { module?: string }) {
  return (
    <RichLesson>
      <RichHero
        chip={module ?? "Блок 3 · Данные проекта и функции"}
        title="Функции, параметры и return"
        intro="Научимся превращать повторяемые правила в функции: разделим определение и вызов, передадим аргументы в параметры, вернём результат через return и разберём локальные переменные."
        tags={[
          { icon: <FunctionSquare size={14} />, label: "def · вызов · return" },
          { icon: <Puzzle size={14} />, label: "параметры и контракт" },
        ]}
      />
      <TheoryBridge lesson={13} />

      <Section number="01" title="Маршрут занятия">
        <Lead>
          Функция — не просто способ сократить код. Она даёт действию имя, задаёт вход и выход и позволяет проверить
          правило отдельно от остального проекта.
        </Lead>

        <div className="lesson-route">
          <ol>
            <li>
              <strong>Определить инструмент:</strong> создать функцию через{" "}
              <code className="lesson-token">def</code>, не выполняя её тело сразу.
            </li>
            <li>
              <strong>Передать данные:</strong> сопоставить аргументы вызова с параметрами функции.
            </li>
            <li>
              <strong>Получить результат:</strong> вернуть значение через{" "}
              <code className="lesson-token">return</code> и использовать его дальше.
            </li>
          </ol>
          <p>
            Дополнительно вы разберёте вызов без параметров, порядок аргументов, ранний <code>return</code>, значение{" "}
            <code>None</code>, локальные переменные и одну ответственность функции.
          </p>
        </div>

        <Callout tone="info">
          Рабочий вопрос: <strong>что функция получает, что делает и что возвращает?</strong>
        </Callout>
      </Section>

      <Section number="02" title="Определение и вызов — разные моменты">
        <Lead>
          <code className="lesson-token">def</code> создаёт функцию, но тело начинает выполняться только при вызове со
          скобками.
        </Lead>

        <StepThrough
          code={'def greet(name):\n    return f"Привет, {name}!"\n\nmessage = greet("Анна")\nprint(message)'}
          steps={[
            {
              line: 0,
              note: "Python создаёт функцию greet и связывает её с именем. Тело пока не выполняется.",
              vars: { greet: "функция" },
            },
            {
              line: 3,
              note: 'Вызов greet("Анна") передаёт значение "Анна" в параметр name.',
              vars: { name: '"Анна"' },
            },
            {
              line: 1,
              note: "Функция создаёт строку и возвращает её месту вызова.",
              vars: { результат: '"Привет, Анна!"' },
            },
            {
              line: 3,
              note: "Возвращённое значение сохраняется в message.",
              vars: { message: '"Привет, Анна!"' },
            },
            {
              line: 4,
              note: "print показывает сохранённый результат.",
              vars: { вывод: "Привет, Анна!" },
            },
          ]}
        />

        <CompareSolutions
          question="Что окажется в переменной result?"
          left={{
            title: "Без вызова",
            code: "result = greet",
            note: "Сохраняется сама функция.",
          }}
          right={{
            title: "С вызовом",
            code: 'result = greet("Анна")',
            note: "Сохраняется возвращённая строка.",
          }}
          preferred="right"
          explanation="Скобки означают выполнить функцию сейчас."
        />

        <TrueFalse
          statement={
            <>
              Функция без параметров вызывается без скобок: <code>app_name</code>.
            </>
          }
          isTrue={false}
          explanation="Даже без параметров вызов записывается как app_name()."
        />
      </Section>

      <Section number="03" title="Параметры и аргументы">
        <Lead>
          Параметры — имена входных значений в определении. Аргументы — конкретные значения каждого вызова.
        </Lead>

        <CodeBlock
          caption="параметры и аргументы"
          code={
            "def format_task(title, priority):\n" +
            '    return f"[{priority}] {title}"\n\n' +
            'message = format_task("SQL", 5)\n' +
            "print(message)"
          }
        />

        <PredictOutput
          code={"def subtract(total, completed):\n    return total - completed\n\nprint(subtract(10, 3))\nprint(subtract(3, 10))"}
          output={"7\n-7"}
          hint="Позиционные аргументы сопоставляются слева направо."
        />

        <MatchPairs
          prompt="Соедините элемент записи с его ролью."
          leftTitle="Фрагмент"
          rightTitle="Роль"
          pairs={[
            { left: "title в def format_task(title, priority)", right: "параметр" },
            { left: '"SQL" в format_task("SQL", 5)', right: "аргумент" },
            { left: "format_task(...)", right: "вызов функции" },
            { left: "message =", right: "сохранение результата" },
          ]}
          explanation="Параметр существует внутри вызова, аргумент предоставляет ему конкретное значение."
        />

        <BugHunt
          code={'def format_task(title, priority):\n    return f"[{priority}] {title}"\n\nprint(format_task("SQL"))'}
          question="Почему возникнет TypeError?"
          options={[
            "Строка SQL слишком короткая",
            "Параметр priority не получил аргумент",
            "Функции нельзя вызывать внутри print",
          ]}
          correctIndex={1}
          explanation="Определение требует два входных значения, а вызов передал только одно."
          fix={'print(format_task("SQL", 5))'}
        />
      </Section>

      <Section number="04" title="return передаёт значение и завершает вызов">
        <Lead>
          <code className="lesson-token">return</code> возвращает значение вызывающему коду. После первого
          сработавшего <code>return</code> остальные строки текущего вызова не выполняются.
        </Lead>

        <StepThrough
          code={
            'def normalize_title(title):\n' +
            "    cleaned = title.strip()\n" +
            '    if cleaned == "":\n' +
            '        return "Без названия"\n' +
            "    return cleaned\n\n" +
            'print(normalize_title("   "))\n' +
            'print(normalize_title("  SQL  "))'
          }
          steps={[
            { line: 6, note: "Первый вызов получает строку из пробелов.", vars: { title: '"   "' } },
            { line: 1, note: "strip создаёт пустую строку.", vars: { cleaned: '""' } },
            {
              line: 3,
              note: "Условие истинно, возвращается запасной текст. Нижний return пропускается.",
              vars: { результат: '"Без названия"' },
            },
            { line: 7, note: "Второй вызов начинается с новыми локальными значениями.", vars: { title: '"  SQL  "' } },
            { line: 1, note: "cleaned становится SQL.", vars: { cleaned: '"SQL"' } },
            { line: 4, note: "Условие ложно, выполняется итоговый return.", vars: { результат: '"SQL"' } },
          ]}
        />

        <CodeSequence
          title="Соберите функцию проверки заголовка"
          prompt="Расположите строки так, чтобы функция возвращала bool."
          pieces={[
            { id: "def", code: "def is_valid_title(title):" },
            { id: "clean", code: "    cleaned = title.strip()" },
            { id: "return", code: '    return cleaned != ""' },
            { id: "wrong", code: "    print(cleaned)", note: "показывает значение, но не возвращает bool" },
          ]}
          correctOrder={["def", "clean", "return"]}
          explanation="Функция получает строку, очищает её и возвращает результат сравнения."
        />

        <RecallCard
          question="Что происходит с кодом после сработавшего return?"
          answer={<p>Текущий вызов функции завершается, поэтому следующие строки этого вызова не выполняются.</p>}
        />
      </Section>

      <Section number="05" title="print и return решают разные задачи">
        <Lead>
          <code className="lesson-token">print</code> показывает данные человеку, а{" "}
          <code className="lesson-token">return</code> передаёт результат программе.
        </Lead>

        <CompareSolutions
          question="Какой вариант подходит для функции расчёта?"
          left={{
            title: "Только печать",
            code: "def add(a, b):\n    print(a + b)\n\nresult = add(2, 3)",
            note: "Человек увидит 5, но result станет None.",
          }}
          right={{
            title: "Возврат результата",
            code: "def add(a, b):\n    return a + b\n\nresult = add(2, 3)",
            note: "result получает число 5 и может использовать его дальше.",
          }}
          preferred="right"
          explanation="Платформа сравнивает возвращённое значение solve, а не текст в терминале."
        />

        <PredictOutput
          code={"def wrong_add(a, b):\n    print(a + b)\n\nresult = wrong_add(2, 3)\nprint(result)"}
          output={"5\nNone"}
          hint="Функция без сработавшего return возвращает None."
        />

        <BugHunt
          code={"def calculate_left(total, completed):\n    left = total - completed\n    print(left)\n\nresult = calculate_left(10, 4)\nprint(result * 2)"}
          question="Почему последняя строка завершится TypeError?"
          options={[
            "left слишком маленькое",
            "result равен None, потому что функция ничего не вернула",
            "Функция не может содержать переменные",
          ]}
          correctIndex={1}
          explanation="Печать внутри функции не становится её возвращаемым значением."
          fix={"def calculate_left(total, completed):\n    return total - completed\n\nresult = calculate_left(10, 4)\nprint(result * 2)"}
        />

        <Callout>
          В заданиях платформы не заменяйте <code>return</code> выводом. Даже визуально правильное число не будет
          результатом функции.
        </Callout>
      </Section>

      <Section number="06" title="Локальные переменные и явные зависимости">
        <Lead>
          Параметры и переменные, созданные внутри функции, относятся к конкретному вызову и недоступны снаружи.
        </Lead>

        <CodeBlock
          caption="локальное значение"
          code={
            "def calculate_left(total, completed):\n" +
            "    left = total - completed\n" +
            "    return left\n\n" +
            "result = calculate_left(10, 4)\n" +
            "print(result)\n" +
            "# print(left)  # NameError"
          }
        />

        <CompareSolutions
          question="Как сделать зависимость функции видимой?"
          left={{
            title: "Скрытая внешняя переменная",
            code: 'priority = 5\n\ndef format_task(title):\n    return f"[{priority}] {title}"',
            note: "По параметрам не видно, откуда берётся priority.",
          }}
          right={{
            title: "Явный параметр",
            code: 'def format_task(title, priority):\n    return f"[{priority}] {title}"',
            note: "Все необходимые данные передаются в вызов.",
          }}
          preferred="right"
          explanation="Явные зависимости легче проверять и переиспользовать."
        />

        <TrueFalse
          statement={
            <>
              Две разные функции могут иметь локальную переменную с именем <code>result</code>, не мешая друг другу.
            </>
          }
          isTrue={true}
          explanation="Локальные области разных вызовов не являются одной общей переменной."
        />
      </Section>

      <Section number="07" title="Контракт и одна ответственность">
        <Lead>
          Хорошая функция отвечает на один основной вопрос. Её контракт описывает вход, возвращаемое значение,
          изменение аргументов и граничные случаи.
        </Lead>

        <TypeCards>
          <TypeCard
            badge="ясно"
            title="Предметное имя"
            code={'def is_valid_title(title):\n    return title.strip() != ""'}
          >
            По имени понятно, что функция возвращает boolean-ответ.
          </TypeCard>
          <TypeCard
            badge="слишком широко"
            badgeTone="str"
            title="Несколько ответственностей"
            code={"def add_validate_print_and_save_task(...):\n    ..."}
          >
            Название перечисляет независимые действия и сигнализирует о перегруженной функции.
          </TypeCard>
        </TypeCards>

        <CodeBlock
          caption="StudyHub: три небольших правила"
          code={
            "def normalize_title(title):\n" +
            "    return title.strip()\n\n" +
            "def is_valid_title(title):\n" +
            '    return normalize_title(title) != ""\n\n' +
            "def format_task(title, priority):\n" +
            "    clean_title = normalize_title(title)\n" +
            '    return f"[{priority}] {clean_title}"'
          }
        />

        <RecallCard
          question="Какие четыре вопроса описывают контракт функции?"
          hint="Вход, выход, изменение и границы."
          answer={
            <p>
              Что функция принимает, что возвращает, меняет ли переданные объекты и как обрабатывает пустые или
              граничные значения.
            </p>
          }
        />

        <Callout tone="info">
          Не превращайте каждую строку в функцию. Выделение оправдано, если правило имеет имя, повторяется, отдельно
          проверяется или делает основной сценарий понятнее.
        </Callout>
      </Section>

      <Section number="08" title="Проверь себя">
        <div className="lesson-check-group">
          <QuizCard
            question="Когда выполняется тело функции?"
            options={["при чтении def", "при вызове со скобками", "только внутри print"]}
            correctIndex={1}
            explanation="def создаёт функцию, а вызов запускает её тело."
          />
          <QuizCard
            question="Что является параметром?"
            options={["имя во входной части def", "конкретное значение вызова", "результат print"]}
            correctIndex={0}
            explanation="Параметр получает аргумент на время вызова."
          />
          <QuizCard
            question="Что делает return?"
            options={["показывает текст", "возвращает значение и завершает вызов", "создаёт глобальное имя"]}
            correctIndex={1}
            explanation="После сработавшего return код ниже в этом вызове не выполняется."
          />
          <QuizCard
            question="Что вернёт функция без return?"
            options={["0", "None", "пустой список"]}
            correctIndex={1}
            explanation="Неявное возвращаемое значение — None."
          />
          <QuizCard
            question="Почему print не заменяет return в solve?"
            options={["платформа сравнивает возвращённое значение", "print медленнее", "print запрещён в Python"]}
            correctIndex={0}
            explanation="Вывод предназначен человеку, return — вызывающему коду."
          />
        </div>

        <KeyTakeaways
          points={[
            <><code>def</code> определяет функцию, но не вызывает её.</>,
            <>Вызов требует скобок.</>,
            <>Параметр — имя в определении, аргумент — значение вызова.</>,
            <>Позиционные аргументы сопоставляются слева направо.</>,
            <><code>return</code> отдаёт значение и завершает вызов.</>,
            <>Без return функция возвращает <code>None</code>.</>,
            <>Локальные переменные существуют внутри вызова.</>,
            <>Хорошая функция имеет ясный контракт и одну основную ответственность.</>,
          ]}
        />

        <PracticeCta text="Откройте practice.py: реализуйте формат задачи и проверку непустого заголовка." />
      </Section>
    </RichLesson>
  );
}

// 14. Декомпозиция и чистые функции
export function Lesson14({ module }: { module?: string }) {
  return (
    <RichLesson>
      <RichHero
        chip={module ?? "Блок 3 · Данные проекта и функции"}
        title="Декомпозиция и чистые функции"
        intro="Разделим широкую задачу на именованные шаги, зафиксируем вход и выход, отличим вычисление от побочного эффекта и научимся возвращать обновлённые копии данных."
        tags={[
          { icon: <Puzzle size={14} />, label: "декомпозиция и контракт" },
          { icon: <FunctionSquare size={14} />, label: "чистые функции" },
        ]}
      />
      <TheoryBridge lesson={14} />

      <Section number="01" title="Маршрут занятия">
        <Lead>
          Большая функция часто скрывает несколько разных правил. Декомпозиция делает их видимыми, но цель не в
          количестве функций, а в ясной ответственности каждой части.
        </Lead>

        <div className="lesson-route">
          <ol>
            <li>
              <strong>Разложить сценарий:</strong> превратить «добавить задачу» в очистку, проверку, создание и
              добавление.
            </li>
            <li>
              <strong>Зафиксировать контракт:</strong> назвать вход, результат и возможное изменение данных.
            </li>
            <li>
              <strong>Сделать поведение явным:</strong> отделить чистые расчёты от{" "}
              <code className="lesson-token">input</code>, <code className="lesson-token">print</code> и изменения
              внешнего состояния.
            </li>
          </ol>
          <p>
            Дополнительно вы разберёте глобальные зависимости, копирование словарей, композицию функций и границу
            между полезной и чрезмерной декомпозицией.
          </p>
        </div>

        <Callout tone="info">
          Хороший основной сценарий читается как последовательность предметных действий, а не как набор технических
          деталей.
        </Callout>
      </Section>

      <Section number="02" title="Широкую задачу разбивают на шаги">
        <Lead>
          Фраза «добавить задачу» скрывает несколько независимых действий: получить данные, очистить название,
          проверить правила, создать словарь и изменить список.
        </Lead>

        <CompareSolutions
          question="Какой вариант легче проверять и изменять?"
          left={{
            title: "Всё в одной функции",
            code:
              'def add_task():\n' +
              '    title = input("Название: ").strip()\n' +
              '    priority = int(input("Приоритет: "))\n' +
              '    if title and 1 <= priority <= 5:\n' +
              '        tasks.append({"title": title, "priority": priority})\n' +
              '        print("Добавлено")',
            note: "Ввод, проверка, создание данных, изменение списка и печать связаны вместе.",
          }}
          right={{
            title: "Правила получили имена",
            code:
              "def normalize_title(title):\n" +
              "    return title.strip()\n\n" +
              "def is_valid_priority(priority):\n" +
              "    return 1 <= priority <= 5",
            note: "Каждое правило можно вызвать и проверить отдельно.",
          }}
          preferred="right"
          explanation="Декомпозиция уменьшает число причин, которые приходится анализировать одновременно."
        />

        <CodeSequence
          title="Разложите добавление задачи"
          prompt="Расположите действия от получения данных до изменения списка."
          pieces={[
            { id: "read", code: "получить title и priority" },
            { id: "normalize", code: "очистить title" },
            { id: "validate", code: "проверить title и priority" },
            { id: "create", code: "создать словарь task" },
            { id: "append", code: "добавить task в tasks" },
            { id: "message", code: "сообщить результат пользователю" },
          ]}
          correctOrder={["read", "normalize", "validate", "create", "append", "message"]}
          explanation="Проверка выполняется до изменения состояния приложения."
        />

        <RecallCard
          question="Почему валидация должна идти до append?"
          answer={
            <p>
              Некорректная запись не должна попадать в состояние приложения. Сначала правило доказывает допустимость
              данных, затем список изменяется.
            </p>
          }
        />
      </Section>

      <Section number="03" title="Контракт делает функцию предсказуемой">
        <Lead>
          Контракт отвечает на четыре вопроса: что функция получает, что возвращает, меняет ли переданные объекты и
          какие граничные случаи учитывает.
        </Lead>

        <TypeCards>
          <TypeCard
            badge="normalize"
            title="Преобразование"
            code={"def normalize_title(title):\n    return title.strip()"}
          >
            Вход: строка. Выход: новая строка. Исходная строка не изменяется.
          </TypeCard>
          <TypeCard
            badge="validate"
            badgeTone="float"
            title="Проверка"
            code={"def is_valid_priority(priority):\n    return 1 <= priority <= 5"}
          >
            Вход: число. Выход: <code>bool</code>. Границы 1 и 5 включены.
          </TypeCard>
          <TypeCard
            badge="create"
            badgeTone="str"
            title="Создание модели"
            code={
              'def create_task(title, priority):\n' +
              '    return {"title": title.strip(), "priority": priority, "is_done": False}'
            }
          >
            Входы явны, результатом является новый словарь.
          </TypeCard>
        </TypeCards>

        <MatchPairs
          prompt="Соедините вопрос контракта с примером ответа."
          leftTitle="Вопрос"
          rightTitle="Ответ"
          pairs={[
            { left: "что принимает?", right: "title: str, priority: int" },
            { left: "что возвращает?", right: "словарь новой задачи" },
            { left: "что меняет?", right: "ничего вне функции" },
            { left: "какая граница?", right: "priority от 1 до 5 включительно" },
          ]}
          explanation="Контракт позволяет понять функцию до чтения тела."
        />

        <Callout>
          Два подхода к добавлению допустимы: изменить переданный список или вернуть новый. Ошибка — не сообщить,
          какой контракт выбран.
        </Callout>
      </Section>

      <Section number="04" title="Чистая функция зависит только от аргументов">
        <Lead>
          Для одинаковых аргументов чистая функция возвращает одинаковый результат и не меняет внешний мир.
        </Lead>

        <CodeBlock
          caption="чистое правило"
          code={"def is_urgent(priority, is_done):\n    return priority >= 4 and not is_done"}
        />

        <TrueFalse
          statement={
            <>
              Функция <code>is_urgent(5, False)</code> может вернуть разные результаты в двух последовательных вызовах,
              даже если внешнее состояние не менялось.
            </>
          }
          isTrue={false}
          explanation="Результат определяется только одинаковыми аргументами."
        />

        <CompareSolutions
          question="Где зависимость видна явно?"
          left={{
            title: "Глобальное состояние",
            code: 'tasks = []\n\ndef count_tasks():\n    return len(tasks)',
            note: "По параметрам не видно, откуда берутся данные.",
          }}
          right={{
            title: "Аргумент функции",
            code: "def count_tasks(tasks):\n    return len(tasks)",
            note: "Источник данных указан в сигнатуре.",
          }}
          preferred="right"
          explanation="Явная зависимость упрощает повторное использование и тестирование."
        />

        <RecallCard
          question="Почему чистую функцию легко тестировать?"
          answer={
            <p>
              Для проверки достаточно передать аргументы и сравнить возвращённое значение. Не нужно заранее готовить
              глобальное состояние, ввод или терминал.
            </p>
          }
        />
      </Section>

      <Section number="05" title="Побочные эффекты должны быть видимыми">
        <Lead>
          Побочный эффект — изменение внешнего состояния: печать, ввод, изменение переданного списка, запись файла
          или сетевой запрос. Эффекты нужны приложению, но не должны быть спрятаны внутри расчёта.
        </Lead>

        <MethodGrid
          rows={[
            [<>return a + b</>, "чистый результат"],
            [<>print(message)</>, "вывод в терминал"],
            [<>input("Название: ")</>, "чтение внешнего ввода"],
            [<>tasks.append(task)</>, "изменение переданного объекта"],
            [<>global_tasks.append(task)</>, "скрытое изменение глобального состояния"],
          ]}
        />

        <BugHunt
          code={'tasks = []\n\ndef add_default_task():\n    tasks.append("Python")'}
          question="Что скрывает сигнатура функции?"
          options={[
            "Функция зависит от глобального списка и меняет его",
            "Строку Python нельзя добавить",
            "Список должен быть кортежем",
          ]}
          correctIndex={0}
          explanation="По пустым скобкам вызова невозможно увидеть зависимость от tasks."
          fix={
            "def with_default_task(tasks):\n" +
            "    result = tasks.copy()\n" +
            '    result.append("Python")\n' +
            "    return result"
          }
        />

        <CompareSolutions
          question="Как отделить интерфейс от правила?"
          left={{
            title: "Ввод внутри проверки",
            code:
              'def is_valid_title():\n' +
              '    title = input("Название: ")\n' +
              '    return title.strip() != ""',
            note: "Функцию трудно вызвать с подготовленным тестовым значением.",
          }}
          right={{
            title: "Значение передано аргументом",
            code: 'def is_valid_title(title):\n    return title.strip() != ""',
            note: "Источник данных может быть input, тест или другой код.",
          }}
          preferred="right"
          explanation="Интерфейс получает данные, а правило работает с уже переданным значением."
        />
      </Section>

      <Section number="06" title="Изменяемые аргументы и обновлённая копия">
        <Lead>
          Список и словарь могут измениться внутри функции. Если контракт обещает новую версию, сначала создайте
          копию верхнего уровня.
        </Lead>

        <StepThrough
          code={
            'original = {"title": "SQL", "is_done": False}\n' +
            "updated = original.copy()\n" +
            'updated["is_done"] = True\n' +
            "print(original)\n" +
            "print(updated)"
          }
          steps={[
            {
              line: 0,
              note: "Создан исходный словарь.",
              vars: { original: "{title: SQL, is_done: False}" },
            },
            {
              line: 1,
              note: "copy создаёт отдельный верхний словарь с теми же полями.",
              vars: { original: "объект A", updated: "объект B" },
            },
            {
              line: 2,
              note: "Меняется только updated.",
              vars: { original: "is_done: False", updated: "is_done: True" },
            },
            {
              line: 3,
              note: "Исходные данные сохранены.",
              vars: { вывод: "{...False}" },
            },
            {
              line: 4,
              note: "Новая версия содержит обновление.",
              vars: { вывод: "{...False} ⏎ {...True}" },
            },
          ]}
        />

        <CompareSolutions
          question="Как сохранить дополнительные ключи?"
          left={{
            title: "Собрать заново",
            code: 'return {"title": task["title"], "is_done": True}',
            note: "Поля priority и category могут потеряться.",
          }}
          right={{
            title: "Скопировать и обновить",
            code: 'result = task.copy()\nresult["is_done"] = True\nreturn result',
            note: "Все существующие верхние поля сохраняются.",
          }}
          preferred="right"
          explanation="Копирование уменьшает риск случайно удалить неизвестные вызывающей функции поля."
        />

        <BugHunt
          code={'def marked_copy(task):\n    task["is_done"] = True\n    return task'}
          question="Почему название marked_copy вводит в заблуждение?"
          options={[
            "Функция меняет исходный словарь вместо создания копии",
            "Ключ is_done нельзя менять",
            "return нельзя использовать со словарём",
          ]}
          correctIndex={0}
          explanation="Имя обещает копию, но тело изменяет аргумент."
          fix={'def marked_copy(task):\n    result = task.copy()\n    result["is_done"] = True\n    return result'}
        />
      </Section>

      <Section number="07" title="Композиция без чрезмерной дробности">
        <Lead>
          Маленькие функции соединяются в сценарий. Управляющая функция может вызывать правила, но не должна
          дублировать их реализацию.
        </Lead>

        <CodeBlock
          caption="StudyHub: подготовка задачи"
          code={
            "def normalize_title(title):\n" +
            "    return title.strip()\n\n" +
            "def is_valid_title(title):\n" +
            '    return normalize_title(title) != ""\n\n' +
            "def create_task(title, priority):\n" +
            "    return {\n" +
            '        "title": normalize_title(title),\n' +
            '        "priority": priority,\n' +
            '        "is_done": False,\n' +
            "    }\n\n" +
            "def prepare_task(title, priority):\n" +
            "    if not is_valid_title(title):\n" +
            "        return None\n" +
            "    if not 1 <= priority <= 5:\n" +
            "        return None\n" +
            "    return create_task(title, priority)"
          }
        />

        <CodeSequence
          title="Соберите чистое обновление задачи"
          prompt="Выберите порядок, который не меняет исходный словарь."
          pieces={[
            { id: "def", code: "def marked_copy(task):" },
            { id: "copy", code: "    result = task.copy()" },
            { id: "change", code: '    result["is_done"] = True' },
            { id: "return", code: "    return result" },
            { id: "wrong", code: '    task["is_done"] = True', note: "меняет аргумент" },
          ]}
          correctOrder={["def", "copy", "change", "return"]}
          explanation="Копия создаётся до изменения, затем возвращается как новый результат."
        />

        <RecallCard
          question="Когда не нужно выделять новую функцию?"
          answer={
            <p>
              Когда действие очевидно, не повторяется, не имеет самостоятельного предметного смысла и отдельное имя
              заставит читателя переходить по коду без пользы.
            </p>
          }
        />

        <Callout tone="info">
          Декомпозиция не означает «одна строка — одна функция». Критерий — улучшение понимания и проверяемости.
        </Callout>
      </Section>

      <Section number="08" title="Проверь себя">
        <div className="lesson-check-group">
          <QuizCard
            question="Что означает декомпозиция?"
            options={["разбиение задачи на понятные шаги", "удаление половины кода", "замена функций классами"]}
            correctIndex={0}
            explanation="Каждый шаг получает собственную ответственность."
          />
          <QuizCard
            question="Какой признак чистой функции?"
            options={["зависит только от аргументов", "всегда печатает", "обязательно состоит из одной строки"]}
            correctIndex={0}
            explanation="Для одинаковых аргументов результат одинаков, внешнее состояние не меняется."
          />
          <QuizCard
            question="Что является побочным эффектом?"
            options={["return a + b", "изменение внешнего списка", "сравнение priority >= 4"]}
            correctIndex={1}
            explanation="Изменяется состояние за пределами возвращаемого значения."
          />
          <QuizCard
            question="Зачем использовать task.copy()?"
            options={["обновить отдельный верхний словарь", "сделать словарь кортежем", "удалить лишние поля"]}
            correctIndex={0}
            explanation="Исходный словарь остаётся прежним."
          />
          <QuizCard
            question="Нужно ли создавать функцию для каждой строки?"
            options={["нет, только для осмысленного правила", "да, всегда", "только если строка длинная"]}
            correctIndex={0}
            explanation="Чрезмерная дробность ухудшает связность чтения."
          />
        </div>

        <KeyTakeaways
          points={[
            <>Декомпозиция превращает широкое действие в именованные шаги.</>,
            <>Контракт описывает вход, выход, изменение и границы.</>,
            <>Чистая функция зависит только от аргументов.</>,
            <>Побочные эффекты допустимы, но должны быть видимыми.</>,
            <>Глобальная зависимость скрывает источник данных.</>,
            <>Изменяемый аргумент может измениться снаружи.</>,
            <><code>copy()</code> помогает вернуть обновлённую версию.</>,
            <>Полезная декомпозиция улучшает чтение, а не просто увеличивает число функций.</>,
          ]}
        />

        <PracticeCta text="Откройте practice.py: верните обновлённую копию задачи и отфильтруйте выполненные записи." />
      </Section>
    </RichLesson>
  );
}

// 15. Ошибки, traceback и отладка
export function Lesson15({ module }: { module?: string }) {
  return (
    <RichLesson>
      <RichHero
        chip={module ?? "Блок 3 · Данные проекта и функции"}
        title="Ошибки, traceback и отладка"
        intro="Научимся читать traceback снизу вверх, различать типы ошибок, отделять симптом от причины и исправлять проблему как проверяемый эксперимент, а не случайным редактированием."
        tags={[
          { icon: <AlertTriangle size={14} />, label: "traceback и тип ошибки" },
          { icon: <Bug size={14} />, label: "диагностика и регрессия" },
        ]}
      />
      <TheoryBridge lesson={15} />

      <Section number="01" title="Маршрут занятия">
        <Lead>
          Ошибка — это техническое сообщение о нарушенном правиле. Отладка начинается не с переписывания кода, а с
          наблюдения: что именно произошло, на каких данных и где остановилось выполнение.
        </Lead>

        <div className="lesson-route">
          <ol>
            <li>
              <strong>Прочитать сообщение:</strong> начать с последней строки traceback и определить тип ошибки.
            </li>
            <li>
              <strong>Проверить гипотезу:</strong> найти строку своего файла и увидеть реальные значения перед ней.
            </li>
            <li>
              <strong>Доказать исправление:</strong> изменить одну причину и повторить ошибочный, обычный и граничный
              сценарии.
            </li>
          </ol>
          <p>
            Дополнительно вы разберёте <code>SyntaxError</code>, <code>NameError</code>, <code>TypeError</code>,{" "}
            <code>ValueError</code>, <code>IndexError</code>, <code>KeyError</code>, минимальный пример и опасность{" "}
            <code>except: pass</code>.
          </p>
        </div>

        <Callout tone="info">
          Полезная формулировка ошибки описывает не цвет текста, а{" "}
          <strong>неверное предположение кода о данных</strong>.
        </Callout>
      </Section>

      <Section number="02" title="Traceback читают с последней строки">
        <Lead>
          Внизу находится тип и краткое сообщение. Затем поднимайтесь к ближайшей строке собственного файла.
        </Lead>

        <CodeBlock
          caption="код"
          code={"def show_first(tasks):\n    print(tasks[0])\n\nshow_first([])"}
        />

        <CodeBlock
          caption="упрощённый traceback"
          code={
            'Traceback (most recent call last):\n' +
            '  File "main.py", line 4, in <module>\n' +
            "    show_first([])\n" +
            '  File "main.py", line 2, in show_first\n' +
            "    print(tasks[0])\n" +
            "IndexError: list index out of range"
          }
        />

        <CodeSequence
          title="Порядок чтения traceback"
          prompt="Расположите действия от первого наблюдения до изменения кода."
          pieces={[
            { id: "last", code: "прочитать последнюю строку" },
            { id: "own", code: "найти ближайшую строку своего файла" },
            { id: "values", code: "проверить реальные значения" },
            { id: "rule", code: "сформулировать нарушенное правило" },
            { id: "change", code: "изменить одну причину" },
            { id: "wrong", code: "переписать всю функцию сразу", note: "теряется причинность" },
          ]}
          correctOrder={["last", "own", "values", "rule", "change"]}
          explanation="Сначала наблюдение и гипотеза, затем минимальное изменение."
        />

        <RecallCard
          question="Почему причина не в print, хотя traceback указывает на строку print(tasks[0])?"
          answer={
            <p>
              <code>print</code> только пытается показать переданное значение. Реальная причина — предположение, что у
              пустого списка существует элемент с индексом 0.
            </p>
          }
        />
      </Section>

      <Section number="03" title="SyntaxError и NameError">
        <Lead>
          <code className="lesson-token">SyntaxError</code> означает, что Python не смог разобрать структуру файла.{" "}
          <code className="lesson-token">NameError</code> возникает уже при выполнении, когда имя не найдено.
        </Lead>

        <TypeCards>
          <TypeCard
            badge="SyntaxError"
            badgeTone="str"
            title="Структура кода нарушена"
            code={'if priority > 3\n    print("Высокий")'}
          >
            Проверьте двоеточия, скобки, кавычки, отступы и строку выше указателя.
          </TypeCard>
          <TypeCard
            badge="NameError"
            badgeTone="float"
            title="Имя не определено"
            code={'print(task_title)\n# task_title не присваивался'}
          >
            Проверьте порядок выполнения, регистр, опечатку и область видимости.
          </TypeCard>
        </TypeCards>

        <BugHunt
          code={'print("Начало")\nif priority > 3\n    print("Высокий")\nprint("Конец")'}
          question="Успеет ли напечататься Начало?"
          options={[
            "Да, ошибка находится ниже",
            "Нет, Python не сможет разобрать файл",
            "Только если priority равен 3",
          ]}
          correctIndex={1}
          explanation="SyntaxError мешает построить структуру программы, поэтому выполнение файла не начинается."
          fix={'print("Начало")\npriority = 5\nif priority > 3:\n    print("Высокий")\nprint("Конец")'}
        />

        <BugHunt
          code={'title = "SQL"\nprint(Title)'}
          question="Почему возникает NameError?"
          options={[
            "Python различает регистр, имя Title не определено",
            "Строки нельзя хранить в переменных",
            "print требует два аргумента",
          ]}
          correctIndex={0}
          explanation="title и Title — разные имена."
          fix={'title = "SQL"\nprint(title)'}
        />

        <Callout>
          При <code>SyntaxError</code> указатель может стоять там, где Python окончательно заметил проблему, а
          незакрытая скобка находиться строкой выше.
        </Callout>
      </Section>

      <Section number="04" title="TypeError и ValueError">
        <Lead>
          Эти ошибки часто путают. <code>TypeError</code> сообщает о неподходящем типе или операции,{" "}
          <code>ValueError</code> — о неподходящем содержимом допустимого типа.
        </Lead>

        <CompareSolutions
          question="Чем отличаются два случая?"
          left={{
            title: "TypeError",
            code: 'age = "18"\nprint(age + 1)',
            note: "Операция + не определена между str и int.",
          }}
          right={{
            title: "ValueError",
            code: 'age = int("восемнадцать")',
            note: "int принимает строку, но её содержимое нельзя преобразовать.",
          }}
          preferred="right"
          explanation="Оба фрагмента ошибочны, но нарушают разные правила."
        />

        <MatchPairs
          prompt="Соедините фрагмент с типом ошибки."
          leftTitle="Код"
          rightTitle="Ошибка"
          pairs={[
            { left: '"18" + 1', right: "TypeError" },
            { left: 'int("абв")', right: "ValueError" },
            { left: "[1, 2][5]", right: "IndexError" },
            { left: '{"title": "SQL"}["priority"]', right: "KeyError" },
          ]}
          explanation="Тип ошибки сужает список возможных причин."
        />

        <BugHunt
          code={'age_text = "18"\nnext_age = age_text + 1'}
          question="Какое наблюдение нужно сделать первым?"
          options={[
            "Проверить тип age_text",
            "Переименовать next_age",
            "Удалить число 1",
          ]}
          correctIndex={0}
          explanation="Фактический тип показывает, почему операция не определена."
          fix={'age_text = "18"\nage = int(age_text)\nnext_age = age + 1'}
        />

        <TrueFalse
          statement={
            <>
              <code>int([])</code> и <code>int(&quot;abc&quot;)</code> обязательно вызовут один и тот же тип ошибки.
            </>
          }
          isTrue={false}
          explanation="Список приводит к TypeError, а строка неподходящего содержания — к ValueError."
        />
      </Section>

      <Section number="05" title="IndexError, KeyError и неверные предположения">
        <Lead>
          Эти ошибки часто показывают, что код ожидал данные, которых нет: позицию в последовательности или поле в
          словаре.
        </Lead>

        <TypeCards>
          <TypeCard badge="IndexError" badgeTone="str" title="Позиция отсутствует" code={'items = ["Python"]\nprint(items[1])'}>
            В списке существует только индекс 0.
          </TypeCard>
          <TypeCard badge="KeyError" badgeTone="float" title="Ключ отсутствует" code={'task = {"title": "SQL"}\nprint(task["priority"])'}>
            Обязательное поле не создано или имя ключа написано неверно.
          </TypeCard>
        </TypeCards>

        <CompareSolutions
          question="Как исправлять отсутствующий priority?"
          left={{
            title: "Скрыть обязательное поле",
            code: 'priority = task.get("priority")',
            note: "Ошибка исчезла, но priority может стать None.",
          }}
          right={{
            title: "Сначала определить правило",
            code:
              '# если поле обязательно\n' +
              'task = {"title": "SQL", "priority": 1}\n\n' +
              '# если поле необязательно\n' +
              'priority = task.get("priority", 1)',
            note: "Решение соответствует договору модели.",
          }}
          preferred="right"
          explanation="Техническое подавление ошибки не заменяет предметное решение."
        />

        <BugHunt
          code={'task = {"title": "SQL"}\npriority = task.get("priority")\nprint(priority + 1)'}
          question="Почему замена [] на get не решила проблему?"
          options={[
            "get вернул None, и сложение с числом невозможно",
            "Словарь нельзя передавать в get",
            "Ключи должны быть числами",
          ]}
          correctIndex={0}
          explanation="KeyError исчез, но обязательное значение не появилось."
          fix={'task = {"title": "SQL"}\npriority = task.get("priority", 1)\nprint(priority + 1)'}
        />

        <RecallCard
          question="Что важнее: убрать текст ошибки или восстановить верное правило данных?"
          answer={
            <p>
              Нужно восстановить правило. Ошибка может исчезнуть после неудачной подстановки, но программа продолжит
              работать с неверным состоянием.
            </p>
          }
        />
      </Section>

      <Section number="06" title="Отладка как управляемый эксперимент">
        <Lead>
          Надёжная отладка повторяет научную проверку: воспроизвести, наблюдать, сформулировать гипотезу, изменить одну
          вещь и повторить.
        </Lead>

        <MethodGrid
          rows={[
            [<>1. воспроизвести</>, "получить ошибку стабильно на известном входе"],
            [<>2. наблюдать</>, "прочитать traceback, значение и тип"],
            [<>3. предположить</>, "сформулировать конкретную причину"],
            [<>4. одно изменение</>, "не переписывать соседние части"],
            [<>5. повторить</>, "запустить тот же вход"],
            [<>6. проверить регрессию</>, "обычный и граничный сценарии"],
          ]}
        />

        <CodeBlock
          caption="диагностическая печать"
          code={'print("DEBUG task:", task)\nprint("DEBUG type:", type(task))\nprint("DEBUG keys:", list(task.keys()))'}
        />

        <CompareSolutions
          question="Какой процесс сохраняет причинность?"
          left={{
            title: "Случайная серия правок",
            code: "переименовать переменные\nпереписать условие\nдобавить try/except\nизменить данные",
            note: "Непонятно, какое изменение повлияло на результат.",
          }}
          right={{
            title: "Одна гипотеза",
            code: "проверить, пуст ли список\nдобавить одну явную проверку\nповторить тот же вход",
            note: "Можно доказать связь причины и исправления.",
          }}
          preferred="right"
          explanation="Маленькое изменение уменьшает риск нового дефекта."
        />

        <Callout tone="info">
          Диагностические <code>print</code> удаляют после расследования. Иначе они засоряют интерфейс и могут сломать
          ожидаемый вывод платформы.
        </Callout>
      </Section>

      <Section number="07" title="Минимальный пример и регрессионная проверка">
        <Lead>
          Уменьшите данные до самого короткого сценария, который всё ещё воспроизводит проблему. После исправления
          проверьте исходный, обычный и граничный входы.
        </Lead>

        <CodeBlock
          caption="минимальный пример KeyError"
          code={'tasks = [{"title": "Python"}]\nprint(tasks[0]["priority"])'}
        />

        <StepThrough
          code={
            "def first_char(text):\n" +
            '    if text == "":\n' +
            '        return ""\n' +
            "    return text[0]\n\n" +
            'print(first_char(""))\n' +
            'print(first_char("P"))\n' +
            'print(first_char("Python"))\n' +
            'print(first_char(" "))'
          }
          steps={[
            { line: 5, note: "Сценарий исходной ошибки: пустая строка.", vars: { результат: '""' } },
            { line: 6, note: "Минимальный обычный вход из одного символа.", vars: { результат: '"P"' } },
            { line: 7, note: "Обычная строка сохраняет старое корректное поведение.", vars: { результат: '"P"' } },
            { line: 8, note: "Пробел не является пустой строкой и возвращается как символ.", vars: { результат: '" "' } },
          ]}
        />

        <BugHunt
          code={'try:\n    print(task["priority"])\nexcept:\n    pass'}
          question="Почему этот код мешает отладке?"
          options={[
            "Он скрывает тип и причину любой ошибки",
            "try нельзя использовать со словарями",
            "pass автоматически удаляет ключ",
          ]}
          correctIndex={0}
          explanation="Голый except поглощает любую ошибку и уничтожает информацию."
          fix={'if "priority" in task:\n    print(task["priority"])\nelse:\n    print("Нет обязательного приоритета")'}
        />

        <CodeSequence
          title="Соберите регрессионную проверку"
          prompt="Расположите сценарии после исправления."
          pieces={[
            { id: "broken", code: "вход, на котором была ошибка" },
            { id: "normal", code: "обычный рабочий вход" },
            { id: "boundary", code: "пустой или граничный вход" },
            { id: "neighbor", code: "соседний сценарий, который мог затронуть фикс" },
          ]}
          correctOrder={["broken", "normal", "boundary", "neighbor"]}
          explanation="Исправление должно устранить дефект и сохранить прежнее корректное поведение."
        />
      </Section>

      <Section number="08" title="Проверь себя">
        <div className="lesson-check-group">
          <QuizCard
            question="С какой части traceback начинать?"
            options={["с последней строки", "с первой строки файла", "с названия папки"]}
            correctIndex={0}
            explanation="Внизу находится тип и краткое сообщение."
          />
          <QuizCard
            question={'Что вызовет выражение "18" + 1?'}
            options={["TypeError", "ValueError", "IndexError"]}
            correctIndex={0}
            explanation="Операция не определена между str и int."
          />
          <QuizCard
            question={'Что вызовет int("abc")?'}
            options={["TypeError", "ValueError", "KeyError"]}
            correctIndex={1}
            explanation="Тип str допустим, но содержимое нельзя преобразовать."
          />
          <QuizCard
            question="Зачем уменьшать данные до минимального примера?"
            options={["сократить число возможных причин", "скрыть traceback", "не исправлять проект"]}
            correctIndex={0}
            explanation="Короткий воспроизводимый случай быстрее запускать и анализировать."
          />
          <QuizCard
            question="Что проверить после исправления?"
            options={["только удачный вход", "ошибочный, обычный и граничный сценарии", "только синтаксис"]}
            correctIndex={1}
            explanation="Регрессионная проверка защищает старое корректное поведение."
          />
        </div>

        <KeyTakeaways
          points={[
            <>Traceback читают с последней строки.</>,
            <>Тип ошибки сужает круг причин.</>,
            <><code>SyntaxError</code> мешает разобрать структуру.</>,
            <><code>TypeError</code> и <code>ValueError</code> описывают разные нарушения.</>,
            <><code>IndexError</code> и <code>KeyError</code> часто показывают неверное предположение о данных.</>,
            <>Отладка начинается с воспроизведения и наблюдения.</>,
            <>Меняйте одну причину за раз.</>,
            <>После исправления проверяйте регрессию и удаляйте DEBUG-печать.</>,
          ]}
        />

        <PracticeCta text="Откройте practice.py: сделайте безопасный первый символ и чтение приоритета по умолчанию." />
      </Section>
    </RichLesson>
  );
}