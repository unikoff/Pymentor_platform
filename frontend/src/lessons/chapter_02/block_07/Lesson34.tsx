import { FileText, Wrench } from "lucide-react";
import {
  BugHunt,
  Callout,
  CodeBlock,
  CompareSolutions,
  Diagram,
  DiagramArrow,
  DiagramFlow,
  DiagramNode,
  Lead,
  LinkedNotes,
  MethodGrid,
  PredictOutput,
  QuizCard,
  RecallCard,
  RichHero,
  RichLesson,
  Section,
  StepThrough,
  TrueFalse,
} from "../../shared";

export function Lesson34({ module }: { module?: string }) {
  return (
    <RichLesson>
      <RichHero
        variant="project"
        chip={module ?? "Блок 7 · Обычные классы и модель Task"}
        title="Dataclass после обычного класса"
        intro="Мы уже написали обычную Task и явно задали её проверки, методы и преобразования. Теперь разберём, как dataclass убирает часть повторяющегося кода, что он генерирует и что мы продолжаем отвечать за сами."
        tags={[
          { icon: <Wrench size={14} />, label: "модель без шаблонного кода" },
          { icon: <FileText size={14} />, label: "поля и поведение" },
        ]}
      />

      <Section number="00" title="От обычной Task к dataclass">
        <Lead>
          В предыдущих занятиях мы подготовили одну обычную <code className="lesson-token">Task</code>: её
          конструктор проверяет значения, методы меняют состояние, а явные преобразователи обмениваются данными со
          словарём. Рабочие операции Planner пока используют словари. Поэтому здесь меняется устройство модели, а не
          весь путь приложения.
        </Lead>

        <LinkedNotes
          variant="connected"
          items={[
            {
              title: "Точка старта",
              description: "Обычная Task уже хранит четыре поля, применяет правила и создаёт словарь через явный метод.",
            },
            {
              title: "Новый вопрос",
              description: "Какую повторяющуюся часть класса Python может собрать по объявлениям полей?",
            },
            {
              title: "Результат",
              description: "Та же Task станет dataclass, сохранив проверки, методы и конвертеры.",
            },
          ]}
        />

        <p>
          Мы не объявляем обычный класс ошибкой и не вводим вторую модель. Сначала разберём механизм на отдельном
          примере, затем перенесём уже знакомую Task и сверим, что изменилось только её объявление.
        </p>
      </Section>

      <Section number="01" title="Какая работа повторяется в классе с данными">
        <Lead>
          В обычном классе автор вручную перечисляет поля в <code className="lesson-token">__init__</code>, принимает
          для них параметры и присваивает их экземпляру. Для проверки, отладки и сравнения значений тоже приходится
          писать отдельный код, если такое поведение нужно. Когда класс в основном описывает данные, часть этой
          конструкции повторяет список полей.
        </Lead>

        <p>
          <code className="lesson-token">dataclass</code> находится в стандартной библиотеке Python. Мы импортируем
          декоратор <code className="lesson-token">dataclass</code> из модуля <code>dataclasses</code> и ставим его
          перед определением класса. При обработке объявления Python использует отмеченные поля, чтобы создать
          несколько обычных методов класса. Это не отдельная система хранения и не новый вид объекта: экземпляры
          остаются объектами того же класса.
        </p>

        <CompareSolutions
          question="Какая запись убирает ручное присваивание одних и тех же объявленных полей?"
          left={{
            title: "Обычный класс",
            code:
              "class ReadingPlan:\n" +
              "    def __init__(self, topic, minutes=25):\n" +
              "        self.topic = topic\n" +
              "        self.minutes = minutes",
            note: "Параметры и присваивания перечислены вручную.",
          }}
          right={{
            title: "Dataclass",
            code:
              "@dataclass\n" +
              "class ReadingPlan:\n" +
              "    topic: str\n" +
              "    minutes: int = 25",
            note: "Поля объявлены один раз; типичные методы строятся из них.",
          }}
          preferred="right"
          explanation="Здесь поля и договор конструктора уже описывают одну и ту же структуру. Dataclass снимает повтор присваиваний, но не определяет правила самой предметной области."
        />

        <p>
          Представим бланк для заявки на экскурсию. Названия полей задают, какие ответы должны быть у заявки, а
          типичные операции вроде заполнения и показа можно подготовить по этому бланку. Но бланк не знает, допустимо
          ли название экскурсии и верно ли указано число участников. В Python объявления полей похожи на структуру
          бланка, а проверки предметных правил всё ещё задаём мы.
        </p>

        <Callout tone="info">
          Dataclass не проверяет аннотации, не нормализует строки, не создаёт <code>to_dict</code> и не открывает JSON.
          Она помогает с повторяющимися методами, а не принимает решение о правильности данных за автора.
        </Callout>
      </Section>

      <Section number="02" title="Как поля превращаются в конструктор">
        <Lead>
          Мы пишем поля с аннотациями, а <code className="lesson-token">@dataclass</code> создаёт
          <code>__init__</code>. В отличие от обычного конструктора, нам не приходится повторять
          одно и то же имя в параметрах и присваиваниях. Но именно порядок полей определяет,
          как будут распределяться позиционные аргументы.
        </Lead>

        <p>
          Посмотрим на небольшой план чтения. Строка <code>topic: str</code> описывает обязательную тему,
          а <code>minutes: int = 25</code> задаёт необязательную длительность. Число 25 используется
          только тогда, когда второй аргумент не передали. Для этого примера мы сохраняем
          привычную форму вызова класса и показываем результат по полям.
        </p>

        <CodeBlock
          caption="независимый пример: генерация конструктора"
          code={
            "from dataclasses import dataclass\n\n" +
            "@dataclass\n" +
            "class ReadingPlan:\n" +
            "    topic: str\n" +
            "    minutes: int = 25\n\n" +
            "plan = ReadingPlan(\"Списки\")\n" +
            "print(plan.topic)\n" +
            "print(plan.minutes)"
          }
        />

        <p>
          При создании <code>ReadingPlan("Списки")</code> Python фактически передаёт тему и
          сохраняет её в <code>plan.topic</code>. Второго аргумента нет, поэтому <code>plan.minutes</code>
          получает 25. Это обычные атрибуты объекта. Если передать 40, сохранится 40,
          а определение класса не изменится.
        </p>

        <StepThrough
          code={
            "@dataclass\n" +
            "class ReadingPlan:\n" +
            "    topic: str\n" +
            "    minutes: int = 25\n\n" +
            "plan = ReadingPlan(\"Списки\")"
          }
          steps={[
            { line: 0, note: "При объявлении класса декоратор читает аннотированные поля по порядку.", vars: { поля: "topic, minutes" } },
            { line: 5, note: "Передан один позиционный аргумент. Он относится к первому полю, topic.", vars: { topic: '"Списки"' } },
            { line: 5, note: "Сгенерированный __init__ присваивает topic и берёт default для отсутствующего minutes.", vars: { "plan.topic": '"Списки"', "plan.minutes": "25" } },
          ]}
        />

        <p>
          Сигнатуру такого конструктора удобно представить как
          <code>ReadingPlan(topic, minutes=25)</code>. Все поля без default должны стоять
          раньше полей с default. Если переставить их, при определении класса возникнет ошибка:
          обязательный параметр оказался после необязательного. Свой <code>__init__</code> здесь
          не пишем, иначе меняем ожидаемую генерацию.
        </p>

        <MethodGrid
          rows={[
            ["topic: str", "Обязательное поле. Без темы создать план не получится."],
            ["minutes: int = 25", "Значение 25 берётся только при пропуске аргумента, а не при нуле."],
            ["ReadingPlan('Циклы', 40)", "Позиционные значения попадают в поля по порядку."],
            ["ReadingPlan(minutes=40, topic='Циклы')", "Именованные аргументы можно передать в ином порядке."],
          ]}
        />

        <p>
          Перед проверкой предскажем результат двух вызовов. В первом имена аргументов позволяют
          поменять их порядок. Во втором ноль передан явно, поэтому Python не заменит его на 25.
          Допустим ли ноль по смыслу задачи, мы решим отдельно при валидации.
        </p>

        <PredictOutput
          code={
            "from dataclasses import dataclass\n\n" +
            "@dataclass\n" +
            "class ReadingPlan:\n" +
            "    topic: str\n" +
            "    minutes: int = 25\n\n" +
            "a = ReadingPlan(minutes=40, topic=\"Циклы\")\n" +
            "b = ReadingPlan(\"Циклы\", 0)\n" +
            "print(a.topic, a.minutes)\n" +
            "print(b.minutes)"
          }
          output={'Циклы 40\n0'}
          hint="Значение по умолчанию работает только при пропуске. Имена аргументов важнее их порядка."
        />

        <p>
          Для будущей <code>Task</code> действует та же логика: <code>id</code> и
          <code>title</code> обязательны; <code>priority=2</code> и <code>is_done=False</code>
          можно пропустить. Явное <code>True</code> нельзя заменять на default. Имя
          <code>task_id</code> из старой словарной фабрики не переименовывает поле <code>id</code>
          в конструкторе объекта.
        </p>
      </Section>

      <Section number="03" title="Как __post_init__ сохраняет правила">
        <Lead>
          Аннотации вроде <code className="lesson-token">minutes: int</code> помогают читать
          программу, но Python не проверяет по ним тип при создании dataclass. Поэтому
          <code>ReadingPlan("Списки", "много")</code> без дополнительных условий создаст объект
          со строкой вместо числа. Правила допустимых значений мы добавляем сами.
        </Lead>

        <p>
          Метод <code className="lesson-token">__post_init__</code> вызывается автоматически
          в конце сгенерированного <code>__init__</code>. К этому моменту значения уже записаны
          в поля. Мы проверяем тип, затем диапазон и, если допустимо, нормализуем строку.
          Исключение <code>raise</code> прерывает создание: вызывающий код получает ошибку.
        </p>

        <Diagram caption="Путь данных при создании ReadingPlan">
          <DiagramFlow label="Создание и проверка">
            <DiagramNode title="Аргументы" shape="process">
              <p>Тема и минуты приходят из вызова класса</p>
            </DiagramNode>
            <DiagramArrow label="сгенерированный __init__" />
            <DiagramNode title="Атрибуты объекта">
              <p>Значения присвоены, но ещё не проверены</p>
            </DiagramNode>
            <DiagramArrow label="автоматический вызов" />
            <DiagramNode title="__post_init__">
              <p>Тип, диапазон, strip() и отказ при ошибке</p>
            </DiagramNode>
            <DiagramArrow label="успех" />
            <DiagramNode title="Готовый ReadingPlan" shape="terminator">
              <p>Поля можно читать в вызывающем коде</p>
            </DiagramNode>
          </DiagramFlow>
        </Diagram>

        <p>
          Нам нужен независимый план с непустой темой и положительным целым числом минут.
          Сначала проверим, что тема является строкой, иначе <code>strip()</code> нельзя вызывать
          безопасно. После удаления пробелов проверим, что текст остался. Для минут используем
          <code>type(value) is int</code>: ведь <code>isinstance(True, int)</code> в Python
          возвращает <code>True</code>, хотя логическое значение не должно означать минуты.
        </p>

        <CodeBlock
          caption="ReadingPlan с правилами при создании"
          code={
            "from dataclasses import dataclass\n\n" +
            "@dataclass\n" +
            "class ReadingPlan:\n" +
            "    topic: str\n" +
            "    minutes: int = 25\n\n" +
            "    def __post_init__(self):\n" +
            "        if not isinstance(self.topic, str):\n" +
            "            raise TypeError(\"topic должен быть строкой\")\n" +
            "        self.topic = self.topic.strip()\n" +
            "        if not self.topic:\n" +
            "            raise ValueError(\"Тема не может быть пустой\")\n" +
            "        if type(self.minutes) is not int:\n" +
            "            raise TypeError(\"minutes должен быть целым\")\n" +
            "        if self.minutes <= 0:\n" +
            "            raise ValueError(\"minutes должен быть положительным\")\n\n" +
            "plan = ReadingPlan(\"  Списки  \", 10)\n" +
            "print(plan.topic, plan.minutes)"
          }
        />

        <p>
          Последняя строка выведет <code>Списки 10</code>. Создание с темой из пробелов
          завершится <code>ValueError</code>, а с <code>minutes=True</code> получим
          <code>TypeError</code>. Мы не применяем <code>int(...)</code> или
          <code>bool(...)</code> для маскировки неверного входа: конвертация и проверка
          решают разные задачи. В проекте те же проверки уже живут в валидаторах.
        </p>

        <BugHunt
          code={
            "from dataclasses import dataclass\n\n" +
            "@dataclass\n" +
            "class ReadingPlan:\n" +
            "    topic: str\n" +
            "    minutes: int = 25\n\n" +
            "    def __post_init__(self):\n" +
            "        if self.minutes <= 0:\n" +
            "            raise ValueError(\"minutes должны быть положительными\")\n\n" +
            "plan = ReadingPlan(\"Списки\", \"много\")"
          }
          question="Почему проверка минут не выдаст ожидаемый понятный отказ?"
          options={[
            "Сравнение строки с нулём выбросит TypeError раньше предметной проверки",
            "__post_init__ вызывается только вручную",
            "Аннотация minutes: int автоматически исправит строку на 25",
          ]}
          correctIndex={0}
          explanation="Сначала требуется проверить точный тип int без bool, а затем значение > 0. Аннотация только описывает поле."
          fix={
            "if type(self.minutes) is not int:\n" +
            "    raise TypeError(\"minutes должен быть целым\")\n" +
            "if self.minutes <= 0:\n" +
            "    raise ValueError(\"minutes должны быть положительными\")"
          }
        />

        <p>
          Применим вывод к <code>Task</code>. В <code>__post_init__</code> нужно повторно
          использовать <code>validate_task_id</code>, <code>validate_title</code> и
          <code>validate_priority</code>, сохранив прежнюю нормализацию названия.
          <code>is_done</code> допускает именно <code>bool</code>. При ошибке конструктор
          должен отказать, чтобы непроверенное значение не стало рабочей задачей.
        </p>
      </Section>

      <Section number="04" title="Переносим прежнюю Task, не придумывая новые правила">
        <Lead>
          Теперь свяжем механизм с проектом. В обычном классе <code className="lesson-token">Task</code> уже есть
          идентификатор, название, приоритет и состояние завершения. В её объявлении сначала указываются обязательные
          поля <code>id</code> и <code>title</code>, затем поля со значениями по умолчанию
          <code>priority=2</code> и <code>is_done=False</code>. Эти имена и порядок сохраняют договор привычного
          конструктора.
        </Lead>

        <MethodGrid
          rows={[
            ["Генерируем", "Поле → параметр __init__ → начальное присваивание."],
            ["Сохраняем", "Три валидатора, методы изменения, status_label и конвертеры."],
            ["Наблюдаем новое", "repr и равенство всех полей у двух разных экземпляров."],
          ]}
        />

        <p>
          Сгенерированный конструктор принимает аргументы в этом порядке. Он не должен принудительно сбрасывать
          явно переданное <code>is_done=True</code>: default используется только тогда, когда значение не передали.
          Иначе восстановленная запись о завершённой задаче превратится в незавершённую уже при создании объекта.
          Чтобы оставить прежние позиционные и именованные вызовы понятными, мы не переименовываем поле в
          <code>task_id</code> только из-за имени параметра старой словарной фабрики.
        </p>

        <p>Ниже только объявление полей будущей Task, не полная модель и не готовый ответ для практики.</p>

        <CodeBlock
          caption="фрагмент: поля целевой модели"
          code={
            "@dataclass\n" +
            "class Task:\n" +
            "    id: int\n" +
            "    title: str\n" +
            "    priority: int = 2\n" +
            "    is_done: bool = False"
          }
        />

        <p>
          В <code>__post_init__</code> задача повторно использует
          <code>validate_task_id</code>, <code>validate_title</code> и
          <code>validate_priority</code>. Они проверяют и, где уже предусмотрено, нормализуют свои значения. Статус
          мы проверяем как настоящий <code>bool</code>, а не вызываем <code>bool(value)</code>: преобразование могло
          бы скрыть неверную строку. Новую копию общих правил в модель не переносим.
        </p>

        <TrueFalse
          statement={
            <>
              Если мы создаём <code>Task(12, "Черновик", 3, True)</code>, default поля
              <code>is_done</code> заменит явно переданное значение на <code>False</code>.
            </>
          }
          isTrue={false}
          explanation="Значение по умолчанию используется только при пропущенном аргументе. Переданный True остаётся значением поля, а __post_init__ проверяет его тип."
        />

        <p>
          Как и раньше, словарная фабрика остаётся для действующего CLI. Модель Task только готовит следующий этап
          миграции. Мы не добавляем методы команд, новый список задач или запись JSON внутрь класса.
        </p>
      </Section>

      <Section number="05" title="repr, равенство и идентичность">
        <Lead>
          <code className="lesson-token">@dataclass</code> по умолчанию создаёт ещё
          <code>__repr__</code> для технического показа полей и <code>__eq__</code>
          для сравнения значений. Наш собственный <code>__str__</code> остаётся
          человекочитаемой строкой; явные <code>to_dict</code> и <code>from_dict</code>
          продолжают отвечать за договор со словарём и JSON.
        </Lead>

        <p>
          Разберём различие <code>==</code> и <code>is</code> на двух отдельных
          <code>ReadingPlan</code>. Два вызова конструктора создают два объекта. Если
          значения всех объявленных полей совпадают, <code>==</code> возвращает
          <code>True</code>. Но <code>is</code> отвечает на вопрос, один ли это
          экземпляр в памяти; у двух вызовов результат <code>False</code>.
        </p>

        <CodeBlock
          caption="два равных плана остаются разными объектами"
          code={
            "from dataclasses import dataclass\n\n" +
            "@dataclass\n" +
            "class ReadingPlan:\n" +
            "    topic: str\n" +
            "    minutes: int = 25\n\n" +
            "a = ReadingPlan(\"Списки\", 20)\n" +
            "b = ReadingPlan(\"Списки\", 20)\n" +
            "print(a == b)\n" +
            "print(a is b)\n" +
            "print(repr(a))"
          }
        />

        <p>
          Здесь вывод будет <code>True</code>, затем <code>False</code> и
          <code>ReadingPlan(topic='Списки', minutes=20)</code>. Показ полей полезен
          при отладке, но это не строка JSON. До dataclass наша обычная
          <code>Task</code> не определяла сравнение по четырём полям: это
          намеренное новое поведение, которое мы проверим после переноса.
        </p>

        <Diagram caption="Два отдельных экземпляра с одинаковыми значениями">
          <DiagramFlow label="Равенство значений и ссылки">
            <DiagramNode title="a">
              <p>ReadingPlan('Списки', 20), объект №1</p>
            </DiagramNode>
            <DiagramArrow label="a == b: True, a is b: False" />
            <DiagramNode title="b">
              <p>ReadingPlan('Списки', 20), объект №2</p>
            </DiagramNode>
          </DiagramFlow>
        </Diagram>

        <p>
          Теперь введём <code>c = a</code>. Это присваивание даёт второе имя
          первому объекту, а не создаёт третий. Изменение <code>c.minutes</code>
          меняет одновременно наблюдаемое <code>a.minutes</code>, зато
          <code>b.minutes</code> остаётся прежним. Прогнозируем результат прежде,
          чем раскрывать ответ.
        </p>

        <PredictOutput
          code={
            "from dataclasses import dataclass\n\n" +
            "@dataclass\n" +
            "class ReadingPlan:\n" +
            "    topic: str\n" +
            "    minutes: int = 25\n\n" +
            "a = ReadingPlan(\"Списки\", 20)\n" +
            "b = ReadingPlan(\"Списки\", 20)\n" +
            "c = a\n" +
            "c.minutes = 35\n" +
            "print(a.minutes, b.minutes)\n" +
            "print(a == b, a is c)"
          }
          output={'35 20\nFalse True'}
          hint="c и a указывают на один экземпляр; b создан другим вызовом."
        />

        <p>
          Представим две отдельные тетради с одинаковыми записями. Содержимое совпадает,
          но тетради остаются разными вещами. Именно так <code>==</code> сравнивает значения
          полей, а <code>is</code> различает экземпляры. Если вместо второй тетради
          мы просто дали первой ещё одно имя, нового объекта вообще не появилось.
        </p>

        <MethodGrid
          rows={[
            ["repr(task)", "Диагностическое представление класса и значений всех полей."],
            ["str(task)", "Прежняя пользовательская строка от собственного __str__."],
            ["a == b", "У dataclass сравниваются все объявленные поля экземпляров одного класса."],
            ["a is b", "Сравнивается идентичность объектов, а не содержание полей."],
            ["to_dict() / from_dict()", "Наши явные преобразования, не генерируемые dataclass."],
          ]}
        />

        <p>
          При сравнении двух <code>Task</code> участвуют <code>id</code>,
          <code>title</code>, <code>priority</code> и <code>is_done</code>.
          Одинаковый <code>id</code> не делает задачи равными, если статусы разные.
          Восстановление <code>Task.from_dict(task.to_dict())</code> создаёт
          новый экземпляр с теми же полями, поэтому ожидаем <code>== True</code>
          и <code>is False</code>. Данные проходят границу через словарь.
        </p>

        <QuizCard
          question="Что должно остаться явным кодом после перехода Task на dataclass?"
          options={[
            "Методы изменения, status_label, __str__, to_dict/from_dict и проверки",
            "Только поля, потому что dataclass автоматически создаёт JSON и валидаторы",
            "Новая отдельная модель для словарного CLI",
          ]}
          correctIndex={0}
          explanation="Декоратор создаёт __init__, __repr__ и __eq__ по умолчанию. Предметные правила, свойства и преобразования остаются нашим кодом."
        />
      </Section>

      <Section number="06" title="Почему проверка не действует при прямом присваивании">
        <Lead>
          <code className="lesson-token">__post_init__</code> проверяет объект
          при создании. Он не следит за полями после этого: строка
          <code>plan.minutes = -10</code> просто присваивает новое значение.
          Нам важно понимать предел гарантии, прежде чем передавать модель другим частям программы.
        </Lead>

        <p>
          Вспомним <code>ReadingPlan</code> с проверкой положительных минут из раздела 03.
          При создании <code>ReadingPlan("Списки", -10)</code> возникнет ошибка.
          А после успешного <code>ReadingPlan("Списки", 10)</code> обычное прямое
          присваивание может записать -10. Ни аннотация, ни dataclass не вызывают проверку снова.
        </p>

        <PredictOutput
          code={
            "# ReadingPlan определён как в разделе 03\n" +
            "plan = ReadingPlan(\"Списки\", 10)\n" +
            "plan.minutes = -10\n" +
            "print(plan.minutes)"
          }
          output="-10"
          hint="__post_init__ вызывается при создании; присваивание отдельной строкой проходит мимо него."
        />

        <p>
          Контрпример опровергает фразу «если есть <code>__post_init__</code>, поля
          всегда правильные». Точнее сказать так: «проверяется путь создания».
          В проектной <code>Task</code> изменения названия и приоритета уже проходят
          через <code>rename</code> и <code>set_priority</code>. Они сначала
          проверяют кандидата и лишь затем присваивают его.
        </p>

        <TrueFalse
          statement={
            <>
              После вызова <code>task.set_priority(4)</code> любое прямое
              <code>task.priority = 9</code> автоматически вызовет <code>__post_init__</code>.
            </>
          }
          isTrue={false}
          explanation="Прямое присваивание обходит проверяющий метод. __post_init__ автоматически выполняется только в конце сгенерированного конструктора."
        />

        <p>
          При неверном значении <code>set_priority</code> должен оставить старый
          приоритет. Например, после <code>task.set_priority(3)</code> вызов
          <code>task.set_priority(9)</code> должен закончиться ошибкой, а чтение
          <code>task.priority</code> по-прежнему показать 3. Это можно проверить
          простым <code>assert</code> и без создания нового класса. Нам важен
          порядок «сначала проверка, затем запись».
          Вычисляемое свойство <code>status_label</code> продолжает
          читать актуальный <code>is_done</code>, а отдельный setter мы здесь
          не создаём. На этом этапе не добавляем <code>frozen</code>,
          <code>slots</code>, сортировку, хранение JSON внутри Task и поле
          <code>tags</code>: последнее появится в следующем занятии.
        </p>
      </Section>

      <Section number="07" title="Что мы будем делать в практике">
        <Lead>
          Мы начнём с обычной <code className="lesson-token">Task</code> в
          <code className="lesson-token">app.models</code>, у которой уже есть методы, вычисляемое представление и
          четырёхпольные конвертеры. Задача практики: заменить шаблонную конструкцию класса, сохранив границы
          действующего проекта.
        </Lead>

        <LinkedNotes
          variant="connected"
          items={[
            {
              title: "Заменим шаблон",
              description: "Объявления полей dataclass дадут прежний конструктор с теми же именами и значениями по умолчанию.",
            },
            {
              title: "Перенесём правила",
              description: "__post_init__ применит существующие валидаторы и проверку статуса, а прежние методы и конвертеры останутся в Task.",
            },
            {
              title: "Сверим результат",
              description: "Проверим отказ на ошибочных данных, круг старой записи, repr, равенство и отдельность экземпляров.",
            },
          ]}
        />

        <p>
          Конструктор и <code>__post_init__</code> подготовлены примерами до задания. Мы проверим не только новую
          модель, но и привычное поведение проекта: в <code>app.models</code> останется одна Task, импорт не запустит
          CLI, а функциональные операции, файл и JSON продолжат работать со словарями. Новое поле
          <code>tags</code> появится на следующем шаге.
        </p>
      </Section>
    </RichLesson>
  );
}
