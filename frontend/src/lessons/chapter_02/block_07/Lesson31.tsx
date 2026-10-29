import {
  Boxes,
  Puzzle,
} from "lucide-react";
import {
  CodeBlock,
  BugHunt,
  Callout,
  CompareSolutions,
  DiagramArrow,
  DiagramFlow,
  DiagramGroup,
  DiagramNode,
  KeyTakeaways,
  Lead,
  LinkedNotes,
  MatchPairs,
  QuizCard,
  RecallCard,
  RichHero,
  RichLesson,
  Section,
  StepThrough,
  TheoryBridge,
  TypeCard,
  TypeCards,
} from "../../shared";

// 31. Зачем нужен класс
export function Lesson31({ module }: { module?: string }) {
  return (
    <RichLesson>
      <RichHero
        chip={module ?? "Блок 7 · Объектная модель"}
        title="Зачем нужен класс"
        intro="Сравним знакомый словарь с классом и проследим, как два вызова создают два объекта. Затем разберём __init__, self и чтение атрибутов."
          tags={[
            { icon: <Boxes size={14} />, label: "класс и экземпляр" },
            { icon: <Puzzle size={14} />, label: "начальная настройка" },
        ]}
      />

      <Section number="00" title="От знакомой записи к новому вопросу">
        <Lead>
          Вы уже знаете словари и функции. Сегодня попробуем другой способ описать одну запись: создадим собственный класс и проверим, что происходит с его экземплярами. В код Planner ничего добавлять не нужно.
        </Lead>
        <LinkedNotes
          variant="connected"
          items={[
            {
              title: "Точка старта",
              description: "У записи есть поля, а функции получают её как аргумент.",
            },
            {
              title: "Новый вопрос",
              description: "Что меняется, когда мы описываем общий тип и затем создаём его отдельные экземпляры?",
            },
            {
              title: "Результат",
              description: "Мы различим класс и экземпляр, проследим начальную настройку и чтение атрибута.",
            },
          ]}
        />
        <p>
          Сначала отличим описание от конкретного объекта, затем проследим путь значения от аргумента до поля. В конце проверим, что будет, если поле забыли записать.
        </p>
      </Section>

      <Section number="01" title="Класс добавляет общее описание, а не отменяет словарь">
        <Lead>
          В словаре <code>{'{"title": "Read", "priority": 2}'}</code> хранятся значения одной задачи. Внешняя функция <code>show_task(task)</code> получает этот словарь и читает нужные ключи. Чтобы работать правильно, обе части кода должны договориться о названиях полей.
        </Lead>
        <p>
          Класс позволяет дать общему устройству имя и описать, как настраивать каждый новый экземпляр. Позже в классе можно определить действия для его объектов. Это удобно, когда поля и действия относятся к одной сущности. Для простой записи словарь с функциями по-прежнему подходит.
        </p>
        <p>
          Представьте две карточки чтения. У обеих есть тема и срок, но значения различаются. По одному описанию можно получить много таких карточек. Проверим это сначала на коде, а затем на двух объектах.
        </p>
        <CompareSolutions
          question="Где хранятся данные одной записи, а где задаётся общий способ создания экземпляров?"
          left={{
            title: "Форма только в словаре",
            code: 'plan = {"topic": "functions", "days": 3}',
            note: "Значения уже хранятся, но общий способ создавать такие записи отдельно не описан.",
          }}
          right={{
            title: "Имя класса",
            code: "ReadingPlan",
            note: "Появляется имя общего типа, которое можно будет вызвать для создания объектов.",
          }}
          preferred="right"
          explanation="Здесь разные задачи: словарь хранит запись, а класс задаёт тип объектов и код их настройки. Необязательно заменять одно другим."
        />
        <Callout tone="info">
          Мы не переписываем словари только ради знакомства с ООП. Выбор зависит от задачи: для простой записи словаря может быть достаточно.
        </Callout>
      </Section>

      <Section number="02" title="Класс, объект и экземпляр">
        <Lead>
          <code>ReadingPlan</code> обозначает класс, то есть описание типа. Выражение <code>ReadingPlan("functions", 3)</code> создаёт экземпляр. Экземпляр здесь означает конкретный объект со своими значениями. Списки и словари тоже объекты Python.
        </Lead>
        <p>
          В строке <code>first = ReadingPlan("functions", 3)</code> имя <code>first</code> начинает указывать на полученный объект. Имя не является самим объектом. Мы используем его позже, чтобы обратиться к атрибутам.
        </p>
        <p>
          Второй вызов <code>ReadingPlan("modules", 5)</code> создаст ещё один экземпляр. Оба относятся к одному классу, но их значения различаются. Создание второго не заменяет данные первого.
        </p>
        <TypeCards>
          <TypeCard badge="class" title="Общее описание" code={"class ReadingPlan"}>
            Даёт имя типу и содержит определения, общие для создаваемых экземпляров.
          </TypeCard>
          <TypeCard badge="call" badgeTone="float" title="Вызов класса" code={'ReadingPlan("functions", 3)'}>
            Запрашивает создание одного нового объекта с переданными значениями.
          </TypeCard>
          <TypeCard badge="instance" badgeTone="str" title="Имя со ссылкой" code="weekend_plan">
            Имя переменной позволяет обратиться к экземпляру после создания.
          </TypeCard>
        </TypeCards>
        <p>
          Названия имеют разные роли: <code>ReadingPlan</code> это класс, <code>ReadingPlan(...)</code> это вызов, <code>first</code> это имя со ссылкой. Сам экземпляр появится при вызове и получит свои атрибуты во время настройки.
        </p>
      </Section>

      <Section number="03" title="Что делает __init__ при создании">
        <Lead>
          При вызове класса Python создаёт экземпляр и запускает <code>__init__</code> для его начальной настройки. Этот метод записывает значения в уже создаваемый объект. Сам экземпляр он не возвращает: после обычного завершения <code>__init__</code> возвращается <code>None</code>.
        </Lead>
        <p>
          Разберём порядок по строкам. У первого и второго вызова общая программа настройки, но разные входные значения и разные объекты.
        </p>
        <StepThrough
          code={
            'class ReadingPlan:\n' +
            '    def __init__(self, topic, days):\n' +
            '        self.topic = topic\n' +
            '        self.days = days\n\n' +
            'first = ReadingPlan("functions", 3)\n' +
            'second = ReadingPlan("modules", 5)\n' +
            'print(first.topic)\n' +
            'print(second.days)'
          }
          steps={[
            { line: 0, note: "Мы объявляем общее описание ReadingPlan.", vars: { класс: "ReadingPlan" } },
            { line: 1, note: "Метод определён внутри класса. Пока вызова нет, эти присваивания не выполняются.", vars: { параметры: "self, topic, days" } },
            { line: 2, note: "Во время первого вызова значение topic станет атрибутом текущего объекта.", vars: { "self.topic": '"functions"' } },
            { line: 3, note: "Затем запишется days. Оба атрибута принадлежат одному экземпляру.", vars: { "self.days": "3" } },
            { line: 5, note: "Первый вызов: Python передаёт новый объект в self, а остальные значения в topic и days.", vars: { topic: '"functions"', days: "3" } },
            { line: 6, note: "Второй вызов настраивает другой объект. Атрибуты первого сохраняются.", vars: { topic: '"modules"', days: "5" } },
            { line: 7, note: "Читаем topic у первого объекта.", vars: { вывод: "functions" } },
            { line: 8, note: "Читаем days у второго объекта.", vars: { вывод: "5" } },
          ]}
        />
        <figure
          className="lesson-infographic lesson-diagram"
          aria-labelledby="lesson36-init-flow-caption"
          aria-describedby="lesson36-init-flow-description"
        >
          <figcaption id="lesson36-init-flow-caption" className="lesson-diagram-caption">
            Одно описание класса настраивает два отдельных экземпляра
          </figcaption>
          <DiagramGroup title="Общее описание">
            <DiagramNode title="Класс ReadingPlan">
              <code>class ReadingPlan:</code>
              <p>Задаёт общий способ начальной настройки.</p>
            </DiagramNode>
          </DiagramGroup>
          <DiagramFlow label="Первый вызов ReadingPlan и его атрибуты">
            <DiagramNode title="Первый вызов">
              <code>first = ReadingPlan("functions", 3)</code>
            </DiagramNode>
            <DiagramArrow label="self = first" />
            <DiagramNode title="Запись полей">
              <code>self.topic = "functions"</code>
              <code>self.days = 3</code>
            </DiagramNode>
            <DiagramArrow label="позже читаем" />
            <DiagramNode title="Доступ через точку">
              <code>first.topic</code>
              <code>first.days</code>
            </DiagramNode>
          </DiagramFlow>
          <DiagramFlow label="Второй вызов ReadingPlan и его атрибуты">
            <DiagramNode title="Второй вызов">
              <code>second = ReadingPlan("modules", 5)</code>
            </DiagramNode>
            <DiagramArrow label="self = second" />
            <DiagramNode title="Запись полей">
              <code>self.topic = "modules"</code>
              <code>self.days = 5</code>
            </DiagramNode>
            <DiagramArrow label="позже читаем" />
            <DiagramNode title="Доступ через точку">
              <code>second.topic</code>
              <code>second.days</code>
            </DiagramNode>
          </DiagramFlow>
          <p id="lesson36-init-flow-description" className="lesson-diagram-caption">
          Для каждого вызова создаётся свой текущий экземпляр: в первом self связан с first, во втором self связан с second. Инициализатор записывает значения в атрибуты этого экземпляра, а после вызова мы читаем их через его имя и точку.
          </p>
        </figure>
        <p>
          Трассировка помогает разложить механизм на шаги: класс уже объявлен; вызов передаёт параметры; для текущего вызова есть экземпляр; тело инициализатора записывает значения; после этого имя слева от присваивания ссылается на результат вызова. <code>__init__</code> не должен возвращать объект. Он только настраивает его, а выражение с вызовом класса даёт экземпляр.
        </p>
        <CodeBlock
          caption="Читаем состояние каждого экземпляра отдельно"
          code={
            'print(first.topic)\n' +
            'print(first.days)\n' +
            'print(second.topic)\n' +
            'print(second.days)'
          }
        />
        <p>
          Для примера выше выводом будут четыре строки: <code>functions</code>, <code>3</code>, <code>modules</code>, <code>5</code>. Одинаковое описание не объединяет значения: точка после <code>first</code> читает первый экземпляр, а после <code>second</code> читается второй.
        </p>
        <p>
          Не каждое начальное значение обязательно передавать параметром. Если мы хотим, чтобы новая карточка всегда начиналась, например, с выключенного напоминания, инициализатор может записать это фиксированное значение через <code>self</code>. Значение относится к каждому создаваемому экземпляру, хотя вызывающий код его не передавал. Другие поля могут зависеть от входа и поступать через параметры.
        </p>
        <p>
          Если у метода несколько параметров, значения сопоставляются с ними в порядке вызова, если мы явно не указали имена аргументов. Поэтому важно сверять вызов и заголовок <code>__init__</code>: переданное число ещё не говорит, в какой параметр оно попадёт. В теле метод выполняется сверху вниз. Когда две строки подряд присваивают значения через <code>self</code>, в объекте последовательно появляются два атрибута; локальные переменные вызова при этом остаются отдельными именами.
        </p>
        <p>
          Представим сотрудника, который заполняет отдельную папку при её заведении. Входные параметры похожи на сведения для заполнения, а <code>__init__</code> выполняет начальную настройку конкретной папки. Граница аналогии: Python не создаёт физическую папку, а связывает имена с объектом и его атрибутами в памяти.
        </p>
        <Callout>
          Для этого занятия нам важно различать создание экземпляра и его инициализацию. Мы не вводим внутренний механизм <code>__new__</code> и не пишем собственную фабрику.
        </Callout>
      </Section>

      <Section number="04" title="self, параметр и атрибут">
        <Lead>
          Посмотрите на заголовок <code>__init__(self, topic, days)</code>. При вызове класса мы передаём два значения: тему и число дней. Ссылку на новый объект Python передаёт в первый параметр автоматически. Его принято называть <code>self</code>; это не ключевое слово и не глобальная переменная.
        </Lead>
        <p>
          Строка <code>self.topic = topic</code> берёт значение параметра <code>topic</code> справа и записывает его в атрибут текущего объекта слева. Когда метод завершится, параметр больше не нужен, а <code>first.topic</code> можно прочитать через точку. Для словаря запись другая: <code>record["topic"]</code> читает ключ.
        </p>
        <p>
          Если написать только <code>topic = topic</code>, атрибут не появится: присваивание касается локального имени. При чтении <code>first.topic</code> Python выдаст <code>AttributeError</code>, если атрибут больше нигде не задан. У второго вызова будет свой <code>self</code>, поэтому новое значение попадёт в другой объект.
        </p>
        <CodeBlock
          caption="Имя параметра и имя атрибута могут различаться"
          code={
            'class ReadingPlan:\n' +
            '    def __init__(self, topic, initial_days):\n' +
            '        self.topic = topic\n' +
            '        self.days = initial_days\n\n' +
            'weekend = ReadingPlan("modules", 5)\n' +
            'print(weekend.days)  # 5'
          }
        />
        <p>
          Название входного параметра не обязано совпадать с именем атрибута: <code>initial_days</code> здесь записывается в <code>self.days</code>. После вызова нужно читать <code>weekend.days</code>.
        </p>
        <BugHunt
          code={
            'class ReadingPlan:\n' +
            '    def __init__(self, topic, days):\n' +
            '        self.topic = topic\n' +
            '        days = days\n\n' +
            'plan = ReadingPlan("modules", 5)\n' +
            'print(plan.days)'
          }
          question="Какое присваивание не сохраняет значение в объекте?"
          options={[
            "Строка с self.topic создаёт атрибут экземпляра",
            "Строка days = days изменяет только локальное имя",
            "Вызов ReadingPlan создаёт экземпляр",
          ]}
          correctIndex={1}
          explanation="Мы видим, что days слева и справа обозначает локальный параметр. Для состояния объекта слева нужен атрибут с получателем self."
          fix={
            'class ReadingPlan:\n' +
            '    def __init__(self, topic, days):\n' +
            '        self.topic = topic\n' +
            '        self.days = days'
          }
        />
      </Section>

      <Section number="05" title="Читаем состояние двух экземпляров">
        <Lead>
          Проверьте цепочку: аргумент вызова попадает в параметр <code>__init__</code>, присваивание <code>self.поле = параметр</code> сохраняет значение у текущего экземпляра, а точка позволяет прочитать его позже.
        </Lead>
        <MatchPairs
          prompt="Свяжем каждое имя с его ролью."
          leftTitle="Фрагмент"
          rightTitle="Роль"
          pairs={[
            { left: <code>ReadingPlan</code>, right: "общее описание класса" },
            { left: <code>first = ReadingPlan(...)</code>, right: "получение ссылки на экземпляр" },
            { left: <code>self</code>, right: "первый параметр, связанный с текущим объектом" },
            { left: <code>topic</code>, right: "локальный входной параметр вызова" },
            { left: <code>self.topic</code>, right: "атрибут состояния экземпляра" },
          ]}
          explanation="Мы отделяем описание класса, имя экземпляра, входные параметры и сохранённые атрибуты. В похожем написании могут быть разные роли."
        />
        <QuizCard
          question="Доказывает ли объявление класса, что каждый экземпляр получит только допустимые значения?"
          options={[
            "Да, Python автоматически проверит все поля",
            "Нет, необходимые правила проверки задаются отдельно",
            "Да, если у класса есть имя",
          ]}
          correctIndex={1}
          explanation="Класс описывает тип и доступный код создания. Проверки значений мы должны определить отдельно."
        />
        <p>
          Предскажите вывод двух строк из примера: <code>first.topic</code> даст <code>"functions"</code>, а <code>second.days</code> даст <code>5</code>. Второй вызов использовал другой экземпляр, поэтому не изменил первый. Попробуйте объяснить это без слов «Python просто так сделал».
        </p>
        <Callout tone="info">
          Словарь Planner хранит <code>id</code>, <code>title</code>, <code>priority</code> и <code>is_done</code>. В будущем эти четыре значения могут стать атрибутами одной <code>Task</code>. Поиск по списку, выдача id и запись JSON не возникают автоматически при объявлении класса.
        </Callout>
        <CodeBlock
          caption="Одна запись задачи и будущая модель описывают знакомые поля"
          code={
            'task_data = {"id": 1, "title": "Review",\n' +
            '              "priority": 2, "is_done": False}\n\n' +
            '# Task будет описывать состояние одной задачи\n' +
            '# поиск, список, CLI и хранение останутся работой Planner'
          }
        />
        <RecallCard
          question="Коротко вспомним: что должно быть слева, чтобы сохранить поле у текущего экземпляра?"
          answer={
            <p>
              Имя текущего объекта и точка, например <code>self.topic</code>. Правый параметр содержит значение, которое мы записываем.
            </p>
          }
        />
        <KeyTakeaways
          points={[
            <>Класс задаёт общий тип; вызов класса создаёт конкретный экземпляр.</>,
            <><code>__init__</code> настраивает начальное состояние уже создаваемого объекта.</>,
            <><code>self</code> является обычным первым параметром метода и указывает на текущий экземпляр.</>,
            <>Параметр вызова и атрибут объекта имеют разный срок жизни и разную роль.</>,
            <>Мы читаем атрибут через точку; класс сам по себе не валидирует каждое поле.</>,
          ]}
        />
      </Section>

      <Section number="06" title="Что мы будем делать в практике">
        <Lead>
          Сначала потренируйтесь на двух объектах <code>ReadingPlan</code>, затем без копирования готового класса создайте <code>StudySession</code> с полями <code>subject</code> и <code>minutes</code>. Работайте в тренажёре или отдельном файле: Planner пока не меняем.
        </Lead>
        <LinkedNotes
          variant="connected"
          items={[
            {
              title: "Создадим учебный класс",
              description: "Начнём с ReadingPlan, затем самостоятельно напишем StudySession с двумя атрибутами.",
            },
            {
              title: "Проследим инициализацию",
              description: "Увидим, какие значения приходят в параметры и где они становятся атрибутами.",
            },
            {
              title: "Прочитаем результат",
              description: "До запуска предскажем четыре значения у двух объектов и сверим их через точку.",
            },
            {
              title: "Разберём локальное имя",
              description: "Временно уберём self у одного присваивания и проверим AttributeError на новом экземпляре.",
            },
            {
              title: "Свяжем знакомые поля с будущей Task",
              description: "Разделим состояние одной задачи и действия, которые остаются у Planner.",
            },
          ]}
        />
        <p>
          Для переноса на будущую <code>Task</code> назовите поля <code>id/title/priority/is_done</code> и отдельно функции, которые работают со списком и файлом. Далее применим механику в <code>app.models</code> после проверки готовности проекта.
        </p>
      </Section>
    </RichLesson>
  );
}
