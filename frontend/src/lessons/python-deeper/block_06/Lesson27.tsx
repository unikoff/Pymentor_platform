import {
  FunctionSquare,
  Layers,
} from "lucide-react";
import {
  Callout,
  CodeBlock,
  CompareSolutions,
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
  TrueFalse,
  TheoryBridge,
} from "../../shared";

// 27. Декораторы: от обычной обёртки к синтаксису @
export function Lesson27({ module }: { module?: string }) {
  return (
    <RichLesson>
      <RichHero
        chip={module ?? "Месяц 2 · Модуль 6"}
        title={"Декораторы: от обычной обёртки к синтаксису @"}
        intro={"Пройдём весь путь без магии: функция как значение, передача функции аргументом, wrapper, возврат новой функции и только после этого запись @decorator."}
        tags={[
          { icon: <FunctionSquare size={14} />, label: "функция как значение" },
          { icon: <Layers size={14} />, label: "wrapper и @" },
        ]}
      />
      <TheoryBridge link={"Декоратор опирается на функции как значения и замыкания: он создаёт wrapper и возвращает новую функцию, а @ лишь сокращает запись."} boundary={"Обёртка обязана сохранить ожидаемые аргументы и результат исходной функции; краткий синтаксис не отменяет понимание развёрнутой формы."} />

      <Section number="01" title={"От повторяющегося кода к оболочке"}>
        <Lead>
          {"Представьте несколько инструментов, возле каждого из которых нужно записать начало и конец работы. Если одинаковые строки добавлять внутрь каждой функции, бизнес-правило смешивается со служебным поведением. Декоратор позволяет получить новую функцию с общей оболочкой."}
        </Lead>

        <div className="lesson-practice-steps">
          <h3>{"Проблема повторения"}</h3>
          <p>
            {"Логирование, измерение времени и проверка доступа могут понадобиться нескольким функциям. Копирование строк усложняет изменение и тестирование."}
          </p>
          <h3>{"Главная модель"}</h3>
          <p>
            {"Декоратор — обычная функция. Она получает функцию как значение и возвращает новую функцию."}
          </p>
          <h3>{"Граница применения"}</h3>
          <p>
            {"Оболочка подходит для поведения вокруг вызова. Уникальное предметное правило обычно понятнее оставить внутри функции."}
          </p>
        </div>

        <CodeBlock
          caption={"повторение без декоратора"}
          code={
            "def normalize_title(title):\n" +
            "    print(\"start\")\n" +
            "    result = title.strip()\n" +
            "    print(\"done\")\n" +
            "    return result"
          }
        />

        <CodeBlock
          caption={"цель преобразования"}
          code={
            "logged_normalize = log_call(normalize_title)\n" +
            "result = logged_normalize(\"  SQL  \")"
          }
        />

        <RecallCard
          question={"Сформулируйте основную идею раздела своими словами."}
          answer={
            <p>
              {"Логирование, измерение времени и проверка доступа могут понадобиться нескольким функциям. Копирование строк усложняет изменение и тестирование."}
            </p>
          }
        />

        <Callout tone="info">
          {"Не запоминайте символ @ отдельно. Сначала постройте механизм обычными функциями."}
        </Callout>
      </Section>

      <Section number="02" title={"Функция и результат вызова"}>
        <Lead>
          {"Имя функции без скобок обозначает саму функцию. Имя со скобками запускает её и даёт результат конкретного вызова. Это различие является обязательной основой декораторов."}
        </Lead>

        <div className="lesson-practice-steps">
          <h3>{"Без скобок"}</h3>
          <p>
            {"operation = normalize_title сохраняет функцию в переменной."}
          </p>
          <h3>{"Со скобками"}</h3>
          <p>
            {"normalize_title(\" SQL \") немедленно выполняет функцию и возвращает строку."}
          </p>
          <h3>{"Функция как аргумент"}</h3>
          <p>
            {"Другая функция может получить инструмент и решить, когда и с какими данными его запустить."}
          </p>
        </div>

        <CodeBlock
          caption={"передаём функцию"}
          code={
            "def execute(operation, value):\n" +
            "    return operation(value)\n" +
            "\n" +
            "def double(number):\n" +
            "    return number * 2\n" +
            "\n" +
            "result = execute(double, 5)"
          }
        />

        <CodeBlock
          caption={"ошибочный вариант"}
          code={
            "result = execute(double(5), 5)  # передано число 10, а не функция"
          }
        />

        <TrueFalse
          statement={
            <>
              {"operation = normalize_title сохраняет функцию в переменной."}
            </>
          }
          isTrue={true}
          explanation={"Утверждение повторяет ключевое правило раздела."}
        />

        <Callout tone="info">
          {"Круглые скобки — граница между передачей функции и её выполнением."}
        </Callout>
      </Section>

      <Section number="03" title={"Функция возвращает wrapper"}>
        <Lead>
          {"Внешняя функция может создать внутреннюю функцию и вернуть её без запуска. Wrapper помнит исходную функцию, потому что был создан в области, где параметр operation был доступен."}
        </Lead>

        <div className="lesson-practice-steps">
          <h3>{"Внешняя функция"}</h3>
          <p>
            {"make_logged получает исходную операцию."}
          </p>
          <h3>{"Внутренняя функция"}</h3>
          <p>
            {"wrapper добавляет действия до и после вызова operation."}
          </p>
          <h3>{"Замыкание"}</h3>
          <p>
            {"После завершения make_logged внутренняя функция продолжает хранить доступ к operation."}
          </p>
        </div>

        <CodeBlock
          caption={"первая оболочка"}
          code={
            "def make_logged(operation):\n" +
            "    def wrapper(value):\n" +
            "        print(\"Начало\")\n" +
            "        result = operation(value)\n" +
            "        print(\"Конец\")\n" +
            "        return result\n" +
            "\n" +
            "    return wrapper"
          }
        />

        <CodeBlock
          caption={"создаём новую функцию"}
          code={
            "logged_double = make_logged(double)\n" +
            "answer = logged_double(5)"
          }
        />

        <PredictOutput
          code={`def double(number):
    return number * 2


def make_logged(operation):
    def wrapper(value):
        print("Начало")
        result = operation(value)
        print("Конец")
        return result

    return wrapper


logged_double = make_logged(double)
print(logged_double(5))`}
          output={`Начало
Конец
10`}
          hint="Сначала создаётся wrapper, затем он вызывает double и возвращает число 10."
        />

        <Callout tone="info">
          {"В строке return wrapper нет скобок: наружу передаётся функция, а не результат преждевременного запуска."}
        </Callout>
      </Section>

      <Section number="04" title={"Универсальная оболочка через *args и **kwargs"}>
        <Lead>
          {"Wrapper с одним параметром подходит только для одной формы функций. Универсальная оболочка собирает позиционные аргументы в args, именованные в kwargs и распаковывает их в исходный вызов."}
        </Lead>

        <div className="lesson-practice-steps">
          <h3>{"Сбор аргументов"}</h3>
          <p>
            {"*args создаёт кортеж позиционных значений, а **kwargs — словарь именованных."}
          </p>
          <h3>{"Передача дальше"}</h3>
          <p>
            {"operation(*args, **kwargs) восстанавливает исходную форму вызова."}
          </p>
          <h3>{"Сохранение результата"}</h3>
          <p>
            {"Wrapper обязан вернуть результат, иначе вычисляющая функция после декорирования начнёт возвращать None."}
          </p>
        </div>

        <CodeBlock
          caption={"универсальный log_call"}
          code={
            "def log_call(operation):\n" +
            "    def wrapper(*args, **kwargs):\n" +
            "        print(operation.__name__)\n" +
            "        result = operation(*args, **kwargs)\n" +
            "        print(result)\n" +
            "        return result\n" +
            "\n" +
            "    return wrapper"
          }
        />

        <CodeBlock
          caption={"разные формы вызова"}
          code={
            "logged_add(3, 4)\n" +
            "logged_add(3, b=4)\n" +
            "logged_add(a=3, b=4)"
          }
        />

        <CompareSolutions
          question={"Какой подход точнее выражает правило раздела?"}
          left={{
            title: "Скрытая логика",
            code: "# правило смешано с другим действием",
            note: "Источник поведения трудно увидеть.",
          }}
          right={{
            title: "Явный контракт",
            code: "def log_call(operation):\n    def wrapper(*args, **kwargs):\n        print(operation.__name__)\n        result = operation(*args, **kwargs)\n        print(result)\n        return result\n\n    return wrapper",
            note: "Ответственность и граница видны в коде.",
          }}
          preferred="right"
          explanation={"Оболочка не должна незаметно менять форму вызова и возвращаемое значение исходной функции."}
        />

        <Callout tone="info">
          {"Оболочка не должна незаметно менять форму вызова и возвращаемое значение исходной функции."}
        </Callout>
      </Section>

      <Section number="05" title={"Синтаксис @ как короткое присваивание"}>
        <Lead>
          {"После создания обычной функции её можно передать декоратору вручную. Запись @log_call над def выполняет то же преобразование: прежнее имя начинает ссылаться на возвращённый wrapper."}
        </Lead>

        <div className="lesson-practice-steps">
          <h3>{"Явная форма"}</h3>
          <p>
            {"add = log_call(add) показывает весь механизм."}
          </p>
          <h3>{"Короткая форма"}</h3>
          <p>
            {"@log_call применяется при создании функции."}
          </p>
          <h3>{"Момент выполнения"}</h3>
          <p>
            {"Декоратор применяется один раз при определении. Каждый последующий вызов запускает уже созданный wrapper."}
          </p>
        </div>

        <CodeBlock
          caption={"без @"}
          code={
            "def add(a, b):\n" +
            "    return a + b\n" +
            "\n" +
            "add = log_call(add)"
          }
        />

        <CodeBlock
          caption={"с @"}
          code={
            "@log_call\n" +
            "def add(a, b):\n" +
            "    return a + b"
          }
        />

        <MatchPairs
          prompt={"Соедините понятие и его смысл."}
          pairs={[
            { left: "Явная форма", right: "add = log_call(add) показывает весь механизм." },
            { left: "Короткая форма", right: "@log_call применяется при создании функции." },
            { left: "Момент выполнения", right: "Декоратор применяется один раз при определении. Каждый последующий вызов запускает уже созданный wrapper." },
          ]}
          explanation={"Пары закрепляют термин и его роль."}
        />

        <Callout tone="info">
          {"Читайте @log_call как фразу: передай созданную ниже функцию в log_call и сохрани wrapper под прежним именем."}
        </Callout>
      </Section>

      <Section number="06" title={"wraps и рабочий log_call"}>
        <Lead>
          {"После декорирования имя переменной указывает на wrapper. Готовый помощник wraps переносит имя, документацию и другие метаданные исходной функции на оболочку."}
        </Lead>

        <div className="lesson-practice-steps">
          <h3>{"Имя функции"}</h3>
          <p>
            {"Без wraps значение __name__ обычно становится строкой wrapper."}
          </p>
          <h3>{"Метаданные"}</h3>
          <p>
            {"С wraps документация и инструменты продолжают видеть исходное имя."}
          </p>
          <h3>{"Разделение правил"}</h3>
          <p>
            {"log_call записывает факт вызова, но не меняет title, priority или статус задачи."}
          </p>
        </div>

        <CodeBlock
          caption={"рабочая версия"}
          code={
            "from functools import wraps\n" +
            "\n" +
            "def log_call(operation):\n" +
            "    @wraps(operation)\n" +
            "    def wrapper(*args, **kwargs):\n" +
            "        print(f\"[START] {operation.__name__}\")\n" +
            "        result = operation(*args, **kwargs)\n" +
            "        print(f\"[DONE] {result}\")\n" +
            "        return result\n" +
            "\n" +
            "    return wrapper"
          }
        />

        <CodeBlock
          caption={"применение"}
          code={
            "@log_call\n" +
            "def normalize_title(title):\n" +
            "    return title.strip()"
          }
        />

        <RecallCard
          question={"Сформулируйте основную идею раздела своими словами."}
          answer={
            <p>
              {"Без wraps значение __name__ обычно становится строкой wrapper."}
            </p>
          }
        />

        <Callout tone="info">
          {"Полное устройство стандартной библиотеки разберётся позже. Сейчас wraps используется как готовый инструмент."}
        </Callout>
      </Section>

      <Section number="07" title={"Типичные ошибки и границы"}>
        <Lead>
          {"Декоратор делает путь вызова менее прямым. Его стоит применять к повторяемому поведению, а не превращать каждую маленькую функцию в цепочку скрытых оболочек."}
        </Lead>

        <div className="lesson-practice-steps">
          <h3>{"Потерян return"}</h3>
          <p>
            {"Вызов исходной функции без возврата меняет контракт."}
          </p>
          <h3>{"Неверные скобки"}</h3>
          <p>
            {"Наш log_call ждёт функцию напрямую, поэтому используется @log_call, а не @log_call()."}
          </p>
          <h3>{"Слишком много оболочек"}</h3>
          <p>
            {"Несколько декораторов усложняют порядок выполнения и диагностику."}
          </p>
        </div>

        <CodeBlock
          caption={"неподходящий вызов"}
          code={
            "@log_call()\n" +
            "def add(a, b):\n" +
            "    return a + b"
          }
        />

        <CodeBlock
          caption={"правильная форма"}
          code={
            "@log_call\n" +
            "def add(a, b):\n" +
            "    return a + b"
          }
        />

        <TrueFalse
          statement={
            <>
              {"Вызов исходной функции без возврата меняет контракт."}
            </>
          }
          isTrue={true}
          explanation={"Утверждение повторяет ключевое правило раздела."}
        />

        <Callout tone="info">
          {"Декоратор оправдан, когда общее внешнее поведение действительно одинаково для многих функций."}
        </Callout>
      </Section>

      <Section number="08" title={"Практика StudyHub и проверка"}>
        <Lead>
          {"Закрепите механизм на функции count_open. Сначала напишите явное присваивание без @, затем замените его коротким синтаксисом и убедитесь, что результат совпадает."}
        </Lead>

        <div className="lesson-practice-steps">
          <h3>{"Основная практика"}</h3>
          <p>
            {"Создайте log_call и примените его к функциям с нулём, одним и несколькими аргументами."}
          </p>
          <h3>{"Граничная проверка"}</h3>
          <p>
            {"Проверьте функцию, которая возвращает None: wrapper должен вернуть тот же None."}
          </p>
          <h3>{"Объяснение"}</h3>
          <p>
            {"Разверните @log_call в обычное присваивание и проговорите порядок создания функций."}
          </p>
        </div>

        <CodeBlock
          caption={"StudyHub"}
          code={
            "from functools import wraps\n" +
            "\n" +
            "def log_call(operation):\n" +
            "    @wraps(operation)\n" +
            "    def wrapper(*args, **kwargs):\n" +
            "        print(f\"call:{operation.__name__}\")\n" +
            "        result = operation(*args, **kwargs)\n" +
            "        print(f\"result:{result}\")\n" +
            "        return result\n" +
            "    return wrapper\n" +
            "\n" +
            "@log_call\n" +
            "def count_open(tasks):\n" +
            "    count = 0\n" +
            "    for task in tasks:\n" +
            "        if not task.get(\"is_done\", False):\n" +
            "            count += 1\n" +
            "    return count"
          }
        />

        <PredictOutput
          code={`from functools import wraps


def log_call(operation):
    @wraps(operation)
    def wrapper(*args, **kwargs):
        print(f"call:{operation.__name__}")
        result = operation(*args, **kwargs)
        print(f"result:{result}")
        return result

    return wrapper


@log_call
def count_open(tasks):
    count = 0
    for task in tasks:
        if not task.get("is_done", False):
            count += 1
    return count


tasks = [
    {"is_done": False},
    {"is_done": True},
]

print(count_open(tasks))`}
          output={`call:count_open
result:1
1`}
          hint="Wrapper печатает служебные строки, а внешний print показывает возвращённый результат."
        />

        <Callout tone="info">
          {"Задача платформы должна проверять возвращённое значение, а не служебный вывод."}
        </Callout>

        <div className="lesson-check-group">
          <QuizCard
            question={"Что получает обычный декоратор?"}
            options={[
              "функцию",
              "только строку",
              "готовый результат",
            ]}
            correctIndex={0}
            explanation={"Декоратор получает функцию как значение."}
          />
          <QuizCard
            question={"Что возвращает log_call?"}
            options={[
              "wrapper",
              "результат первого вызова",
              "имя строкой",
            ]}
            correctIndex={0}
            explanation={"Наружу передаётся новая функция."}
          />
          <QuizCard
            question={"Чему эквивалентен @log_call?"}
            options={[
              "function = log_call(function)",
              "log_call = function()",
              "function = log_call()",
            ]}
            correctIndex={0}
            explanation={"Это повторное присваивание имени."}
          />
          <QuizCard
            question={"Зачем wrapper возвращает result?"}
            options={[
              "сохранить контракт",
              "создать глобальную переменную",
              "повторить декорирование",
            ]}
            correctIndex={0}
            explanation={"Вызывающий код должен получить исходный результат."}
          />
        </div>

        <KeyTakeaways
          points={[
            <>{"Функция может передаваться как значение."}</>,
            <>{"Декоратор получает функцию и возвращает wrapper."}</>,
            <>{"Замыкание сохраняет доступ к исходной функции."}</>,
            <>{"*args и **kwargs сохраняют разные формы вызова."}</>,
            <>{"@decorator сокращает обычное присваивание."}</>,
            <>{"Wrapper обязан вернуть результат."}</>,
            <>{"wraps сохраняет метаданные."}</>,
          ]}
        />

        <PracticeCta text={"Создайте @log_call, примените его к двум функциям StudyHub и объясните развёрнутую запись без @."} />
      </Section>

    </RichLesson>
  );
}

// 28. Как возникает исключение и как читать traceback
