import {
  AlertTriangle,
  Bug,
  FolderGit2,
  FunctionSquare,
  GitBranch,
  Layers,
  Package,
  ShieldCheck,
  Wrench,
} from "lucide-react";
import {
  BugHunt,
  Callout,
  CodeBlock,
  CodeSequence,
  CompareSolutions,
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
  27: {"link":"Декоратор опирается на функции как значения и замыкания: он создаёт wrapper и возвращает новую функцию, а @ лишь сокращает запись.","boundary":"Обёртка обязана сохранить ожидаемые аргументы и результат исходной функции; краткий синтаксис не отменяет понимание развёрнутой формы."},
  28: {"link":"Когда функции вызывают друг друга, ошибка проходит по стеку; traceback показывает этот путь и тип нарушенного ожидания.","boundary":"Длинный traceback не означает много причин: начинайте с последней строки и места в своём коде."},
  29: {"link":"После чтения traceback отделяем ожидаемый сбой от дефекта: try окружает рискованную операцию, конкретный except даёт понятную реакцию.","boundary":"Голый except и широкий Exception делают программу тише, но скрывают неожиданные ошибки."},
  30: {"link":"У конструкции обработки несколько разных ролей: else продолжает успех, finally делает обязательное завершение, raise сообщает о нарушенном правиле.","boundary":"finally не исправляет ошибку и не заменяет except; он нужен только для действия при любом исходе."},
  31: {"link":"Когда функций становится много, модуль задаёт границу ответственности; import выполняет верхний уровень файла, а __name__ отделяет импорт от запуска.","boundary":"import не копирует текст: побочный эффект наверху модуля сработает при импорте, поэтому запуск нельзя оставлять без защиты."},
  32: {"link":"Пакет объединяет связанные модули, а направление импортов показывает, какая часть знает о какой и почему.","boundary":"__init__.py не лечит циклический импорт автоматически: цикл исчезает после разделения перепутанных ответственностей."},
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
      <TheoryBridge lesson={27} />

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
export function Lesson28({ module }: { module?: string }) {
  return (
    <RichLesson>
      <RichHero
        chip={module ?? "Месяц 2 · Модуль 6"}
        title={"Как возникает исключение и как читать traceback"}
        intro={"Разберём путь ошибки через несколько функций: где возникло исключение, как оно поднимается по цепочке вызовов и какие строки traceback читать в первую очередь."}
        tags={[
          { icon: <Bug size={14} />, label: "тип и сообщение" },
          { icon: <GitBranch size={14} />, label: "цепочка вызовов" },
        ]}
      />
      <TheoryBridge lesson={28} />

      <Section number="01" title={"Исключение как аварийный сигнал"}>
        <Lead>
          {"Представьте конвейер из нескольких станций. Если одна станция не может продолжить работу, она подаёт аварийный сигнал. Если обработчика нет, сигнал поднимается через вызовы, программа останавливается и показывает traceback."}
        </Lead>

        <div className="lesson-practice-steps">
          <h3>{"Исключение"}</h3>
          <p>
            {"Объект и событие, сообщающее о невозможности продолжить текущую операцию."}
          </p>
          <h3>{"Traceback"}</h3>
          <p>
            {"Текстовый отчёт о необработанном исключении."}
          </p>
          <h3>{"Цель чтения"}</h3>
          <p>
            {"Связать тип, место, путь вызовов и фактические данные."}
          </p>
        </div>

        <CodeBlock
          caption={"первая ошибка"}
          code={
            "priority = int(\"high\")"
          }
        />

        <CodeBlock
          caption={"итоговый сигнал"}
          code={
            "ValueError: invalid literal for int() with base 10: 'high'"
          }
        />

        <RecallCard
          question={"Сформулируйте основную идею раздела своими словами."}
          answer={
            <p>
              {"Объект и событие, сообщающее о невозможности продолжить текущую операцию."}
            </p>
          }
        />

        <Callout tone="info">
          {"Ошибка не оценивает ученика. Она сообщает, какое ожидание кода не совпало с данными."}
        </Callout>
      </Section>

      <Section number="02" title={"Последняя строка и место возникновения"}>
        <Lead>
          {"Короткий traceback уже содержит четыре опорные точки: тип исключения, сообщение, невозможную операцию и вызов, который передал данные."}
        </Lead>

        <div className="lesson-practice-steps">
          <h3>{"Последняя строка"}</h3>
          <p>
            {"Начните с ValueError и сообщения после двоеточия."}
          </p>
          <h3>{"Нижний frame своего кода"}</h3>
          <p>
            {"Он обычно находится ближе всего к конкретной операции."}
          </p>
          <h3>{"Frame выше"}</h3>
          <p>
            {"Показывает, откуда пришло фактическое значение."}
          </p>
        </div>

        <CodeBlock
          caption={"код"}
          code={
            "def parse_priority(text):\n" +
            "    return int(text)\n" +
            "\n" +
            "priority = parse_priority(\"high\")"
          }
        />

        <CodeBlock
          caption={"traceback"}
          code={
            "Traceback (most recent call last):\n" +
            "  File \"main.py\", line 4, in <module>\n" +
            "    priority = parse_priority(\"high\")\n" +
            "  File \"main.py\", line 2, in parse_priority\n" +
            "    return int(text)\n" +
            "ValueError: invalid literal for int() with base 10: 'high'"
          }
        />

        <TrueFalse
          statement={
            <>
              {"Начните с ValueError и сообщения после двоеточия."}
            </>
          }
          isTrue={true}
          explanation={"Утверждение повторяет ключевое правило раздела."}
        />

        <Callout tone="info">
          {"Номер строки помогает найти место, но смысл причины восстанавливается через данные и контракт операции."}
        </Callout>
      </Section>

      <Section number="03" title={"Стек вызовов"}>
        <Lead>
          {"Каждый активный вызов можно представить как карточку в стопке. Новая функция кладёт карточку сверху, return снимает её, а исключение идёт обратно по стопке в поиске обработчика."}
        </Lead>

        <div className="lesson-practice-steps">
          <h3>{"Внешний вызов"}</h3>
          <p>
            {"Модуль запускает handle_add."}
          </p>
          <h3>{"Промежуточные функции"}</h3>
          <p>
            {"handle_add вызывает build_task, а build_task — parse_priority."}
          </p>
          <h3>{"Глубокая операция"}</h3>
          <p>
            {"int создаёт ValueError, который поднимается через все незавершённые вызовы."}
          </p>
        </div>

        <CodeBlock
          caption={"цепочка"}
          code={
            "def parse_priority(text):\n" +
            "    return int(text)\n" +
            "\n" +
            "def build_task(title, priority_text):\n" +
            "    priority = parse_priority(priority_text)\n" +
            "    return {\"title\": title, \"priority\": priority}\n" +
            "\n" +
            "def handle_add():\n" +
            "    return build_task(\"SQL\", \"high\")\n" +
            "\n" +
            "task = handle_add()"
          }
        />

        <PredictOutput
          code={`def parse_priority(text):
    return int(text)


def build_task(title, priority_text):
    priority = parse_priority(priority_text)
    return {"title": title, "priority": priority}


def handle_add():
    return build_task("SQL", "high")


try:
    handle_add()
except ValueError as error:
    print(type(error).__name__)
    print(error)`}
          output={`ValueError
invalid literal for int() with base 10: 'high' `}
          hint="ValueError возникает в int и поднимается через build_task и handle_add."
        />

        <Callout tone="info">
          {"Frame не является отдельной ошибкой. Это один активный уровень единой цепочки вызовов."}
        </Callout>
      </Section>

      <Section number="04" title={"Тип исключения сужает поиск"}>
        <Lead>
          {"Название исключения похоже на категорию сигнала. Оно не даёт готового исправления, но позволяет проверить подходящие причины и не переписывать проект наугад."}
        </Lead>

        <div className="lesson-practice-steps">
          <h3>{"ValueError"}</h3>
          <p>
            {"Тип значения допустим, но содержимое не подходит."}
          </p>
          <h3>{"TypeError"}</h3>
          <p>
            {"Операция не поддерживает фактический тип."}
          </p>
          <h3>{"KeyError и IndexError"}</h3>
          <p>
            {"Код ожидал поле или позицию, которых нет."}
          </p>
        </div>

        <CodeBlock
          caption={"категории"}
          code={
            "int(\"abc\")          # ValueError\n" +
            "\"3\" + 1            # TypeError\n" +
            "{\"title\": \"SQL\"}[\"id\"]  # KeyError\n" +
            "[][0]               # IndexError"
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
            code: "int(\"abc\")          # ValueError\n\"3\" + 1            # TypeError\n{\"title\": \"SQL\"}[\"id\"]  # KeyError\n[][0]               # IndexError",
            note: "Ответственность и граница видны в коде.",
          }}
          preferred="right"
          explanation={"Тип исключения сужает гипотезы, но исправление должно восстановить правило данных."}
        />

        <Callout tone="info">
          {"Тип исключения сужает гипотезы, но исправление должно восстановить правило данных."}
        </Callout>
      </Section>

      <Section number="05" title={"Распространение до обработчика"}>
        <Lead>
          {"Функция не обязана ловить ошибку, если не знает, как правильно продолжить. Исключение поднимается к уровню, где известен пользовательский сценарий."}
        </Lead>

        <div className="lesson-practice-steps">
          <h3>{"Глубокая функция"}</h3>
          <p>
            {"parse_priority знает преобразование, но не знает интерфейс."}
          </p>
          <h3>{"Сервис"}</h3>
          <p>
            {"create_task соединяет правила, но может передать ожидаемую ошибку выше."}
          </p>
          <h3>{"Обработчик"}</h3>
          <p>
            {"handle_add знает, нужно ли показать сообщение и повторить ввод."}
          </p>
        </div>

        <CodeBlock
          caption={"обработка на границе"}
          code={
            "def handle_add(title, priority_text):\n" +
            "    try:\n" +
            "        task = create_task(title, priority_text)\n" +
            "    except ValueError:\n" +
            "        return \"Приоритет должен быть целым числом\"\n" +
            "    return task"
          }
        />

        <MatchPairs
          prompt={"Соедините понятие и его смысл."}
          pairs={[
            { left: "Глубокая функция", right: "parse_priority знает преобразование, но не знает интерфейс." },
            { left: "Сервис", right: "create_task соединяет правила, но может передать ожидаемую ошибку выше." },
            { left: "Обработчик", right: "handle_add знает, нужно ли показать сообщение и повторить ввод." },
          ]}
          explanation={"Пары закрепляют термин и его роль."}
        />

        <Callout tone="info">
          {"Не ловите одно исключение на каждом уровне. Обработчик размещается там, где есть восстановление."}
        </Callout>
      </Section>

      <Section number="06" title={"Алгоритм чтения большого traceback"}>
        <Lead>
          {"Длинный отчёт не нужно читать одинаково внимательно сверху вниз. Сначала найдите опорные точки, затем оставьте только frames своих файлов и восстановите путь значения."}
        </Lead>

        <div className="lesson-practice-steps">
          <h3>{"Шаг 1"}</h3>
          <p>
            {"Последняя строка: тип и сообщение."}
          </p>
          <h3>{"Шаг 2"}</h3>
          <p>
            {"Нижний frame своего кода: операция и строка."}
          </p>
          <h3>{"Шаг 3"}</h3>
          <p>
            {"Frames выше: путь вызовов и источник данных."}
          </p>
          <h3>{"Шаг 4"}</h3>
          <p>
            {"Фактический тип и содержимое переменной."}
          </p>
          <h3>{"Шаг 5"}</h3>
          <p>
            {"Одно проверяемое предположение и минимальное изменение."}
          </p>
        </div>

        <CodeBlock
          caption={"временная диагностика"}
          code={
            "print(\"DEBUG value:\", repr(priority_text))\n" +
            "print(\"DEBUG type:\", type(priority_text).__name__)\n" +
            "priority = parse_priority(priority_text)"
          }
        />

        <RecallCard
          question={"Сформулируйте основную идею раздела своими словами."}
          answer={
            <p>
              {"Последняя строка: тип и сообщение."}
            </p>
          }
        />

        <Callout tone="info">
          {"DEBUG-печать удаляется после расследования, чтобы не засорять интерфейс."}
        </Callout>
      </Section>

      <Section number="07" title={"Защитный raise в traceback"}>
        <Lead>
          {"Traceback может указывать на правильную строку raise. Она намеренно сообщает, что данные нарушили предметное правило."}
        </Lead>

        <div className="lesson-practice-steps">
          <h3>{"Преобразование"}</h3>
          <p>
            {"Строка может успешно превратиться в число."}
          </p>
          <h3>{"Предметная проверка"}</h3>
          <p>
            {"Число 9 не входит в диапазон 1–5."}
          </p>
          <h3>{"Причина"}</h3>
          <p>
            {"Исправляется источник значения или обработчик ввода, а не защитная строка."}
          </p>
        </div>

        <CodeBlock
          caption={"StudyHub"}
          code={
            "def validate_priority(priority):\n" +
            "    if not 1 <= priority <= 5:\n" +
            "        raise ValueError(\"priority должен быть от 1 до 5\")\n" +
            "    return priority\n" +
            "\n" +
            "def create_task(title, priority_text):\n" +
            "    priority = int(priority_text)\n" +
            "    validate_priority(priority)\n" +
            "    return {\"title\": title, \"priority\": priority}\n" +
            "\n" +
            "create_task(\"SQL\", \"9\")"
          }
        />

        <TrueFalse
          statement={
            <>
              {"Строка может успешно превратиться в число."}
            </>
          }
          isTrue={true}
          explanation={"Утверждение повторяет ключевое правило раздела."}
        />

        <Callout tone="info">
          {"Строка возникновения исключения и строка с дефектом не всегда совпадают."}
        </Callout>
      </Section>

      <Section number="08" title={"Практика и проверка"}>
        <Lead>
          {"Создайте цепочку из трёх функций, вызовите ValueError в самой глубокой и подпишите каждый frame. Затем уменьшите пример и верните обычный контекст."}
        </Lead>

        <div className="lesson-practice-steps">
          <h3>{"Подпись traceback"}</h3>
          <p>
            {"Укажите тип, сообщение, место, вызывающую функцию и фактическое значение."}
          </p>
          <h3>{"Минимальный пример"}</h3>
          <p>
            {"Оставьте одну строку int(\"wrong\"), затем постепенно верните функции."}
          </p>
          <h3>{"Повторная проверка"}</h3>
          <p>
            {"После исправления запустите проблемный, обычный и граничный вход."}
          </p>
        </div>

        <CodeBlock
          caption={"учебная цепочка"}
          code={
            "def level_three(value):\n" +
            "    return int(value)\n" +
            "\n" +
            "def level_two(value):\n" +
            "    return level_three(value)\n" +
            "\n" +
            "def level_one(value):\n" +
            "    return level_two(value)\n" +
            "\n" +
            "level_one(\"wrong\")"
          }
        />

        <PredictOutput
          code={`def level_three(value):
    return int(value)


def level_two(value):
    return level_three(value)


def level_one(value):
    return level_two(value)


try:
    level_one("wrong")
except ValueError as error:
    print(type(error).__name__)
    print(error)`}
          output={`ValueError
invalid literal for int() with base 10: 'wrong' `}
          hint="Исключение создаётся в level_three, но обработчик находится снаружи всей цепочки."
        />

        <Callout tone="info">
          {"Задача платформы может возвращать диагностический вопрос по имени типа исключения."}
        </Callout>

        <div className="lesson-check-group">
          <QuizCard
            question={"С чего начинают чтение traceback?"}
            options={[
              "с последней строки",
              "с первого import",
              "с README",
            ]}
            correctIndex={0}
            explanation={"Внизу находятся тип и сообщение."}
          />
          <QuizCard
            question={"Что показывают frames?"}
            options={[
              "путь вызовов",
              "историю Git",
              "пакеты venv",
            ]}
            correctIndex={0}
            explanation={"Frames описывают активные вызовы."}
          />
          <QuizCard
            question={"Что происходит без обработчика?"}
            options={[
              "исключение поднимается выше",
              "возвращается None",
              "ошибка становится строкой",
            ]}
            correctIndex={0}
            explanation={"Поиск обработчика продолжается."}
          />
          <QuizCard
            question={"Всегда ли raise является дефектом?"}
            options={[
              "нет",
              "да",
              "только в цикле",
            ]}
            correctIndex={0}
            explanation={"Raise может защищать правило."}
          />
        </div>

        <KeyTakeaways
          points={[
            <>{"Исключение возникает на конкретной операции."}</>,
            <>{"Traceback является отчётом."}</>,
            <>{"Чтение начинается с последней строки."}</>,
            <>{"Frames показывают стек вызовов."}</>,
            <>{"Исключение поднимается до обработчика."}</>,
            <>{"Тип исключения сужает гипотезы."}</>,
            <>{"Исправлять нужно нарушенное правило."}</>,
          ]}
        />

        <PracticeCta text={"Разберите три traceback и подпишите тип, место, путь вызовов, фактическое значение и нарушенное ожидание."} />
      </Section>

    </RichLesson>
  );
}

// 29. try и конкретные except
export function Lesson29({ module }: { module?: string }) {
  return (
    <RichLesson>
      <RichHero
        chip={module ?? "Месяц 2 · Модуль 6"}
        title={"try и конкретные except"}
        intro={"Научимся обрабатывать ожидаемые сбои на границах программы: помещать в try только рискованную операцию, ловить конкретный тип и не скрывать программные дефекты."}
        tags={[
          { icon: <ShieldCheck size={14} />, label: "try и except" },
          { icon: <AlertTriangle size={14} />, label: "ожидаемые ошибки" },
        ]}
      />
      <TheoryBridge lesson={29} />

      <Section number="01" title={"Ожидаемая ошибка и дефект"}>
        <Lead>
          {"Пользователь может написать high вместо числа — это ожидаемый сценарий ввода. Опечатка pritn вместо print является дефектом кода. Try/except нужен только там, где программа знает осмысленное продолжение."}
        </Lead>

        <div className="lesson-practice-steps">
          <h3>{"Ожидаемая граница"}</h3>
          <p>
            {"Ввод, файл и внешний формат могут содержать неподходящие данные."}
          </p>
          <h3>{"Дефект программы"}</h3>
          <p>
            {"Неизвестное имя или ошибка алгоритма не должны бесследно превращаться в успех."}
          </p>
          <h3>{"Обработка"}</h3>
          <p>
            {"Она выбирает дальнейшее действие, а не просто удаляет красный текст."}
          </p>
        </div>

        <CodeBlock
          caption={"ожидаемый ValueError"}
          code={
            "priority = int(\"high\")"
          }
        />

        <CodeBlock
          caption={"дефект NameError"}
          code={
            "pritn(priority)"
          }
        />

        <RecallCard
          question={"Сформулируйте основную идею раздела своими словами."}
          answer={
            <p>
              {"Ввод, файл и внешний формат могут содержать неподходящие данные."}
            </p>
          }
        />

        <Callout tone="info">
          {"Перед except сформулируйте: от какого события программа умеет восстановиться и как именно."}
        </Callout>
      </Section>

      <Section number="02" title={"Короткий try"}>
        <Lead>
          {"Try похож на выделенную зону риска. Чем меньше зона, тем понятнее, какая операция считается ожидаемо опасной и какие исключения относятся к её контракту."}
        </Lead>

        <div className="lesson-practice-steps">
          <h3>{"Рискованная операция"}</h3>
          <p>
            {"В parse_priority ожидаемым риском является int(text)."}
          </p>
          <h3>{"После try"}</h3>
          <p>
            {"Обычные вычисления остаются снаружи и не попадают случайно в тот же except."}
          </p>
          <h3>{"Читаемость"}</h3>
          <p>
            {"Узкий try показывает намерение автора без комментария."}
          </p>
        </div>

        <CodeBlock
          caption={"безопасное преобразование"}
          code={
            "def parse_priority(text):\n" +
            "    try:\n" +
            "        value = int(text)\n" +
            "    except ValueError:\n" +
            "        return None\n" +
            "    return value"
          }
        />

        <CodeBlock
          caption={"слишком широкий try"}
          code={
            "try:\n" +
            "    value = int(text)\n" +
            "    validated = validate_priority(value)\n" +
            "    task = create_task(title, validated)\n" +
            "    save_task(task)\n" +
            "except ValueError:\n" +
            "    return None"
          }
        />

        <TrueFalse
          statement={
            <>
              {"В parse_priority ожидаемым риском является int(text)."}
            </>
          }
          isTrue={true}
          explanation={"Утверждение повторяет ключевое правило раздела."}
        />

        <Callout tone="info">
          {"Широкий try может скрыть ValueError из функции, которую автор не собирался считать ожидаемой."}
        </Callout>
      </Section>

      <Section number="03" title={"Конкретный except"}>
        <Lead>
          {"Except реагирует только на указанный тип. ValueError не превращает NameError или TypeError в успешный результат, поэтому неизвестные дефекты сохраняют traceback."}
        </Lead>

        <div className="lesson-practice-steps">
          <h3>{"Точное имя"}</h3>
          <p>
            {"except ValueError описывает известный сценарий."}
          </p>
          <h3>{"Другие типы"}</h3>
          <p>
            {"Если возникает TypeError, блок ValueError пропускается."}
          </p>
          <h3>{"Выбор по факту"}</h3>
          <p>
            {"Тип определяется поведением операции и наблюдаемым traceback, а не угадывается."}
          </p>
        </div>

        <CodeBlock
          caption={"верный тип"}
          code={
            "def parse_priority(text):\n" +
            "    try:\n" +
            "        return int(text)\n" +
            "    except ValueError:\n" +
            "        return None"
          }
        />

        <CodeBlock
          caption={"неверный тип"}
          code={
            "def parse_priority(text):\n" +
            "    try:\n" +
            "        return int(text)\n" +
            "    except TypeError:\n" +
            "        return None\n" +
            "\n" +
            "parse_priority(\"high\")"
          }
        />

        <PredictOutput
          code={`def parse_priority(text):
    try:
        return int(text)
    except ValueError:
        return None


print(parse_priority("4"))
print(parse_priority("high"))`}
          output={`4
None`}
          hint="Первое значение преобразуется, второе попадает в except ValueError."
        />

        <Callout tone="info">
          {"Конкретность except является частью контракта функции и документацией ожидаемой ошибки."}
        </Callout>
      </Section>

      <Section number="04" title={"Несколько типов и разные реакции"}>
        <Lead>
          {"Одна граница может иметь несколько известных проблем. Отдельные except нужны для разных действий, а кортеж типов — когда реакция действительно одинакова."}
        </Lead>

        <div className="lesson-practice-steps">
          <h3>{"FileNotFoundError"}</h3>
          <p>
            {"Отсутствующий файл на первом запуске может означать пустое начальное состояние."}
          </p>
          <h3>{"PermissionError"}</h3>
          <p>
            {"Запрет доступа нельзя выдавать за пустой файл."}
          </p>
          <h3>{"Кортеж"}</h3>
          <p>
            {"except (TypeError, ValueError) уместен только при общем контракте восстановления."}
          </p>
        </div>

        <CodeBlock
          caption={"разные обработчики"}
          code={
            "def load_text(path):\n" +
            "    try:\n" +
            "        with open(path, \"r\", encoding=\"utf-8\") as file:\n" +
            "            return file.read()\n" +
            "    except FileNotFoundError:\n" +
            "        return \"\"\n" +
            "    except PermissionError:\n" +
            "        raise RuntimeError(\"Нет доступа\")"
          }
        />

        <CodeBlock
          caption={"одинаковая реакция"}
          code={
            "try:\n" +
            "    value = convert(raw)\n" +
            "except (TypeError, ValueError):\n" +
            "    return None"
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
            code: "def load_text(path):\n    try:\n        with open(path, \"r\", encoding=\"utf-8\") as file:\n            return file.read()\n    except FileNotFoundError:\n        return \"\"\n    except PermissionError:\n        raise RuntimeError(\"Нет доступа\")",
            note: "Ответственность и граница видны в коде.",
          }}
          preferred="right"
          explanation={"Не объединяйте исключения только ради короткого кода, если последствия различаются."}
        />

        <Callout tone="info">
          {"Не объединяйте исключения только ради короткого кода, если последствия различаются."}
        </Callout>
      </Section>

      <Section number="05" title={"FileNotFoundError и JSONDecodeError"}>
        <Lead>
          {"Во втором месяце проект начнёт читать JSON. Отсутствующий файл может быть нормальным первым запуском, а повреждённый файл означает, что существующие данные нельзя молча заменить пустым списком."}
        </Lead>

        <div className="lesson-practice-steps">
          <h3>{"Нет файла"}</h3>
          <p>
            {"load_tasks может вернуть [] и создать файл позже."}
          </p>
          <h3>{"Повреждённый JSON"}</h3>
          <p>
            {"Нужно явно сообщить о проблеме, иначе старые задачи выглядят как отсутствующие."}
          </p>
          <h3>{"Предварительный обзор"}</h3>
          <p>
            {"Полная сериализация будет в следующем модуле, сейчас изучается контракт исключений."}
          </p>
        </div>

        <CodeBlock
          caption={"предварительная загрузка"}
          code={
            "import json\n" +
            "\n" +
            "def load_tasks(path):\n" +
            "    try:\n" +
            "        with open(path, \"r\", encoding=\"utf-8\") as file:\n" +
            "            return json.load(file)\n" +
            "    except FileNotFoundError:\n" +
            "        return []\n" +
            "    except json.JSONDecodeError as error:\n" +
            "        raise ValueError(\"Файл задач повреждён\") from error"
          }
        />

        <MatchPairs
          prompt={"Соедините понятие и его смысл."}
          pairs={[
            { left: "Нет файла", right: "load_tasks может вернуть [] и создать файл позже." },
            { left: "Повреждённый JSON", right: "Нужно явно сообщить о проблеме, иначе старые задачи выглядят как отсутствующие." },
            { left: "Предварительный обзор", right: "Полная сериализация будет в следующем модуле, сейчас изучается контракт исключений." },
          ]}
          explanation={"Пары закрепляют термин и его роль."}
        />

        <Callout tone="info">
          {"Отсутствие данных и невозможность прочитать существующие данные — разные состояния."}
        </Callout>
      </Section>

      <Section number="06" title={"Голый except и слишком широкий Exception"}>
        <Lead>
          {"Голый except похож на отключение всей сигнализации. Он скрывает опечатки, алгоритмические дефекты и системные сигналы, от которых функция не умеет восстанавливаться."}
        </Lead>

        <div className="lesson-practice-steps">
          <h3>{"Голый except"}</h3>
          <p>
            {"Перехватывает почти всё и уничтожает полезный traceback."}
          </p>
          <h3>{"except Exception"}</h3>
          <p>
            {"Иногда нужен на верхней границе для логирования, но не должен молча возвращать успех."}
          </p>
          <h3>{"Неизвестная ошибка"}</h3>
          <p>
            {"Должна подняться выше или быть записана и повторно создана через raise."}
          </p>
        </div>

        <CodeBlock
          caption={"опасная загрузка"}
          code={
            "def load_tasks(path):\n" +
            "    try:\n" +
            "        return read_json(path)\n" +
            "    except:\n" +
            "        return []"
          }
        />

        <CodeBlock
          caption={"конкретный вариант"}
          code={
            "def load_tasks(path):\n" +
            "    try:\n" +
            "        return read_json(path)\n" +
            "    except FileNotFoundError:\n" +
            "        return []"
          }
        />

        <RecallCard
          question={"Сформулируйте основную идею раздела своими словами."}
          answer={
            <p>
              {"Перехватывает почти всё и уничтожает полезный traceback."}
            </p>
          }
        />

        <Callout tone="info">
          {"Широкий обработчик без повторного raise превращает дефект программы в ложный успешный результат."}
        </Callout>
      </Section>

      <Section number="07" title={"Контракт результата после except"}>
        <Lead>
          {"После обработки вызывающий код должен отличить успех от неуспеха. Для учебного проекта можно использовать None, явный словарь результата или предметное исключение, но один сценарий должен оставаться согласованным."}
        </Lead>

        <div className="lesson-practice-steps">
          <h3>{"None"}</h3>
          <p>
            {"Подходит, если отсутствие нельзя спутать с нормальным значением."}
          </p>
          <h3>{"Словарь результата"}</h3>
          <p>
            {"Поля ok, value и error делают состояние явным."}
          </p>
          <h3>{"Исключение наружу"}</h3>
          <p>
            {"Подходит, если верхний уровень должен выбрать восстановление."}
          </p>
        </div>

        <CodeBlock
          caption={"parse_priority"}
          code={
            "def parse_priority(text):\n" +
            "    try:\n" +
            "        value = int(text)\n" +
            "    except ValueError:\n" +
            "        return None\n" +
            "\n" +
            "    if not 1 <= value <= 5:\n" +
            "        return None\n" +
            "\n" +
            "    return value"
          }
        />

        <CodeBlock
          caption={"интерфейс"}
          code={
            "priority = parse_priority(text)\n" +
            "if priority is None:\n" +
            "    return \"Введите число от 1 до 5\"\n" +
            "return f\"Принято: {priority}\""
          }
        />

        <TrueFalse
          statement={
            <>
              {"Подходит, если отсутствие нельзя спутать с нормальным значением."}
            </>
          }
          isTrue={true}
          explanation={"Утверждение повторяет ключевое правило раздела."}
        />

        <Callout tone="info">
          {"Не используйте число 0 как универсальный сигнал ошибки, если оно может попасть в вычисления."}
        </Callout>
      </Section>

      <Section number="08" title={"Практика и проверка"}>
        <Lead>
          {"Реализуйте три границы: преобразование строки, чтение текста и предварительную загрузку JSON. Для каждой подпишите ожидаемый тип и выбранное восстановление."}
        </Lead>

        <div className="lesson-practice-steps">
          <h3>{"parse_int"}</h3>
          <p>
            {"Возвращает число или None только при ValueError."}
          </p>
          <h3>{"load_text"}</h3>
          <p>
            {"Возвращает пустую строку при FileNotFoundError и не скрывает PermissionError."}
          </p>
          <h3>{"Проверка дефекта"}</h3>
          <p>
            {"Добавьте NameError внутрь try и убедитесь, что конкретный except его не ловит."}
          </p>
        </div>

        <CodeBlock
          caption={"задание платформы"}
          code={
            "def solve(value):\n" +
            "    try:\n" +
            "        return int(value)\n" +
            "    except ValueError:\n" +
            "        return None"
          }
        />

        <PredictOutput
          code={`def solve(value):
    try:
        return int(value)
    except ValueError:
        return None


print(solve("12"))
print(solve("wrong"))`}
          output={`12
None`}
          hint="Solve возвращает число либо None только при ValueError."
        />

        <Callout tone="info">
          {"Автопроверка должна видеть, что объект неподходящего типа не скрывается обработчиком ValueError."}
        </Callout>

        <div className="lesson-check-group">
          <QuizCard
            question={"Что помещают в try?"}
            options={[
              "минимальную рискованную операцию",
              "всю программу",
              "только print",
            ]}
            correctIndex={0}
            explanation={"Узкий try показывает ожидаемый риск."}
          />
          <QuizCard
            question={"Что ловит except ValueError?"}
            options={[
              "ValueError",
              "любое исключение",
              "только SyntaxError",
            ]}
            correctIndex={0}
            explanation={"Другие типы поднимаются выше."}
          />
          <QuizCard
            question={"Почему нет файла и повреждённый JSON различаются?"}
            options={[
              "разные сценарии восстановления",
              "они всегда равны",
              "JSONDecodeError означает нет файла",
            ]}
            correctIndex={0}
            explanation={"Первый запуск и повреждение имеют разный смысл."}
          />
          <QuizCard
            question={"Чем опасен голый except?"}
            options={[
              "скрывает дефекты",
              "не ловит ValueError",
              "работает только в цикле",
            ]}
            correctIndex={0}
            explanation={"Traceback исчезает и для неизвестных ошибок."}
          />
        </div>

        <KeyTakeaways
          points={[
            <>{"Try ограничивает рискованную операцию."}</>,
            <>{"Except называет конкретный тип."}</>,
            <>{"Разные типы требуют разных действий."}</>,
            <>{"Кортеж типов используется при одинаковой реакции."}</>,
            <>{"Отсутствующий и повреждённый файл не равны."}</>,
            <>{"Голый except скрывает дефекты."}</>,
            <>{"Неуспешный результат является частью контракта."}</>,
          ]}
        />

        <PracticeCta text={"Реализуйте три безопасные границы и докажите, что неизвестный NameError не скрывается."} />
      </Section>

    </RichLesson>
  );
}

// 30. else, finally, raise и собственные исключения
export function Lesson30({ module }: { module?: string }) {
  return (
    <RichLesson>
      <RichHero
        chip={module ?? "Месяц 2 · Модуль 6"}
        title={"else, finally, raise и собственные исключения"}
        intro={"Разделим четыре роли: try выполняет рискованную операцию, except восстанавливается, else продолжает успешный путь, finally гарантирует завершение, а raise сообщает о нарушении правила."}
        tags={[
          { icon: <AlertTriangle size={14} />, label: "raise и исключения" },
          { icon: <Wrench size={14} />, label: "else и finally" },
        ]}
      />
      <TheoryBridge lesson={30} />

      <Section number="01" title={"Пять ролей конструкции"}>
        <Lead>
          {"Представьте проверку билета. Сканирование может завершиться ошибкой, успешный билет пропускает дальше, турникет должен вернуться в исходное состояние, а просроченный билет создаёт отдельный сигнал."}
        </Lead>

        <div className="lesson-practice-steps">
          <h3>{"try"}</h3>
          <p>
            {"Рискованная операция."}
          </p>
          <h3>{"except"}</h3>
          <p>
            {"Обработка конкретного неуспеха."}
          </p>
          <h3>{"else"}</h3>
          <p>
            {"Продолжение только после успешного try."}
          </p>
          <h3>{"finally"}</h3>
          <p>
            {"Завершение при любом исходе."}
          </p>
          <h3>{"raise"}</h3>
          <p>
            {"Явное создание исключения по правилу проекта."}
          </p>
        </div>

        <CodeBlock
          caption={"общая форма"}
          code={
            "try:\n" +
            "    risky_operation()\n" +
            "except ExpectedError:\n" +
            "    recover()\n" +
            "else:\n" +
            "    continue_success()\n" +
            "finally:\n" +
            "    finish_attempt()"
          }
        />

        <RecallCard
          question={"Сформулируйте основную идею раздела своими словами."}
          answer={
            <p>
              {"Рискованная операция."}
            </p>
          }
        />

        <Callout tone="info">
          {"Не нужно использовать все блоки одновременно. Каждая часть появляется только при отдельной ответственности."}
        </Callout>
      </Section>

      <Section number="02" title={"else — успешный путь"}>
        <Lead>
          {"Else выполняется только тогда, когда внутри try не возникло исключение. Он помогает не расширять область ошибок, которые считаются ожидаемыми."}
        </Lead>

        <div className="lesson-practice-steps">
          <h3>{"После успеха"}</h3>
          <p>
            {"int завершился, поэтому можно валидировать полученное число."}
          </p>
          <h3>{"После except"}</h3>
          <p>
            {"Else пропускается, даже если исключение было обработано."}
          </p>
          <h3>{"Узкая граница"}</h3>
          <p>
            {"ValueError из validate_priority больше не смешивается с ValueError преобразования."}
          </p>
        </div>

        <CodeBlock
          caption={"parse_priority"}
          code={
            "def parse_priority(text):\n" +
            "    try:\n" +
            "        value = int(text)\n" +
            "    except ValueError:\n" +
            "        return None\n" +
            "    else:\n" +
            "        return validate_priority(value)"
          }
        />

        <TrueFalse
          statement={
            <>
              {"int завершился, поэтому можно валидировать полученное число."}
            </>
          }
          isTrue={true}
          explanation={"Утверждение повторяет ключевое правило раздела."}
        />

        <Callout tone="info">
          {"Else не обязателен, но полезен, когда подчёркивает успешное продолжение."}
        </Callout>
      </Section>

      <Section number="03" title={"finally при любом исходе"}>
        <Lead>
          {"Finally выполняется после успеха, после обработанного исключения и перед фактическим выходом через return. Он подходит для освобождения ресурса или сброса временного состояния."}
        </Lead>

        <div className="lesson-practice-steps">
          <h3>{"Успешный return"}</h3>
          <p>
            {"Finally выполняется перед передачей результата."}
          </p>
          <h3>{"Return из except"}</h3>
          <p>
            {"Finally также выполняется перед возвратом None."}
          </p>
          <h3>{"Опасность"}</h3>
          <p>
            {"Return внутри finally может подавить исходный результат и исключение."}
          </p>
        </div>

        <CodeBlock
          caption={"обязательное завершение"}
          code={
            "def convert(text):\n" +
            "    print(\"start\")\n" +
            "    try:\n" +
            "        return int(text)\n" +
            "    except ValueError:\n" +
            "        return None\n" +
            "    finally:\n" +
            "        print(\"finish\")"
          }
        />

        <CodeBlock
          caption={"опасный вариант"}
          code={
            "def parse(text):\n" +
            "    try:\n" +
            "        return int(text)\n" +
            "    finally:\n" +
            "        return 0"
          }
        />

        <PredictOutput
          code={`def convert(text):
    print("start")
    try:
        return int(text)
    except ValueError:
        return None
    finally:
        print("finish")


print(convert("4"))
print(convert("wrong"))`}
          output={`start
finish
4
start
finish
None`}
          hint="Finally выполняется перед каждым возвратом: и при успехе, и после except."
        />

        <Callout tone="info">
          {"Не возвращайте обычное значение из finally: поток выполнения становится неожиданным."}
        </Callout>
      </Section>

      <Section number="04" title={"raise защищает правило"}>
        <Lead>
          {"Python создаёт некоторые исключения сам, но проект знает собственные границы. Raise позволяет явно сообщить, что приоритет 9 или пустое название нарушают предметное правило."}
        </Lead>

        <div className="lesson-practice-steps">
          <h3>{"Явный сигнал"}</h3>
          <p>
            {"Raise немедленно завершает текущий обычный путь."}
          </p>
          <h3>{"Не print"}</h3>
          <p>
            {"Он не показывает пользовательское сообщение, а создаёт исключение."}
          </p>
          <h3>{"Не заглушка"}</h3>
          <p>
            {"Исключение не маскируется под число 0 или пустой словарь."}
          </p>
        </div>

        <CodeBlock
          caption={"валидатор"}
          code={
            "def validate_priority(priority):\n" +
            "    if not 1 <= priority <= 5:\n" +
            "        raise ValueError(\"priority должен быть от 1 до 5\")\n" +
            "    return priority"
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
            code: "def validate_priority(priority):\n    if not 1 <= priority <= 5:\n        raise ValueError(\"priority должен быть от 1 до 5\")\n    return priority",
            note: "Ответственность и граница видны в коде.",
          }}
          preferred="right"
          explanation={"Строка raise может быть правильной защитой, даже если traceback указывает именно на неё."}
        />

        <Callout tone="info">
          {"Строка raise может быть правильной защитой, даже если traceback указывает именно на неё."}
        </Callout>
      </Section>

      <Section number="05" title={"TaskNotFoundError"}>
        <Lead>
          {"Общий ValueError не всегда выражает предметный смысл. Собственный класс исключения позволяет отдельно обработать отсутствие задачи и не путать его с неверным форматом числа."}
        </Lead>

        <div className="lesson-practice-steps">
          <h3>{"Наследование"}</h3>
          <p>
            {"Класс получает поведение исключения через Exception."}
          </p>
          <h3>{"Имя проекта"}</h3>
          <p>
            {"TaskNotFoundError читается как часть языка StudyHub."}
          </p>
          <h3>{"Минимальное тело"}</h3>
          <p>
            {"На первом этапе достаточно pass и аргумента task_id."}
          </p>
        </div>

        <CodeBlock
          caption={"собственный тип"}
          code={
            "class TaskNotFoundError(Exception):\n" +
            "    pass"
          }
        />

        <CodeBlock
          caption={"поиск или raise"}
          code={
            "def get_task_or_raise(tasks, task_id):\n" +
            "    for task in tasks:\n" +
            "        if task[\"id\"] == task_id:\n" +
            "            return task\n" +
            "    raise TaskNotFoundError(task_id)"
          }
        />

        <MatchPairs
          prompt={"Соедините понятие и его смысл."}
          pairs={[
            { left: "Наследование", right: "Класс получает поведение исключения через Exception." },
            { left: "Имя проекта", right: "TaskNotFoundError читается как часть языка StudyHub." },
            { left: "Минимальное тело", right: "На первом этапе достаточно pass и аргумента task_id." },
          ]}
          explanation={"Пары закрепляют термин и его роль."}
        />

        <Callout tone="info">
          {"Собственный тип нужен, когда вызывающий код должен отличить предметную ситуацию."}
        </Callout>
      </Section>

      <Section number="06" title={"raise from сохраняет причину"}>
        <Lead>
          {"Низкоуровневая библиотечная ошибка может быть непонятна верхнему уровню. Raise from создаёт новый предметный сигнал и сохраняет исходную причину в traceback."}
        </Lead>

        <div className="lesson-practice-steps">
          <h3>{"as error"}</h3>
          <p>
            {"Сохраняет объект исходного исключения."}
          </p>
          <h3>{"from error"}</h3>
          <p>
            {"Связывает новый StorageError с JSONDecodeError."}
          </p>
          <h3>{"Полезный перевод"}</h3>
          <p>
            {"Новый тип должен добавлять смысл уровня проекта, а не просто менять текст."}
          </p>
        </div>

        <CodeBlock
          caption={"цепочка причин"}
          code={
            "import json\n" +
            "\n" +
            "class StorageError(Exception):\n" +
            "    pass\n" +
            "\n" +
            "def decode_tasks(text):\n" +
            "    try:\n" +
            "        return json.loads(text)\n" +
            "    except json.JSONDecodeError as error:\n" +
            "        raise StorageError(\"Не удалось прочитать хранилище\") from error"
          }
        />

        <RecallCard
          question={"Сформулируйте основную идею раздела своими словами."}
          answer={
            <p>
              {"Сохраняет объект исходного исключения."}
            </p>
          }
        />

        <Callout tone="info">
          {"Исходная причина не удаляется: traceback показывает оба уровня."}
        </Callout>
      </Section>

      <Section number="07" title={"Сервис и интерфейс"}>
        <Lead>
          {"Сервис либо возвращает нормальный результат, либо создаёт известное предметное исключение. Интерфейс решает, какое сообщение показать пользователю."}
        </Lead>

        <div className="lesson-practice-steps">
          <h3>{"Сервис"}</h3>
          <p>
            {"mark_task_done не читает input и не печатает сообщение."}
          </p>
          <h3>{"Предметная ошибка"}</h3>
          <p>
            {"get_task_or_raise сообщает об отсутствии."}
          </p>
          <h3>{"Интерфейс"}</h3>
          <p>
            {"Обработчик ловит TaskNotFoundError и выбирает текст."}
          </p>
        </div>

        <CodeBlock
          caption={"сервис"}
          code={
            "def mark_task_done(tasks, task_id):\n" +
            "    task = get_task_or_raise(tasks, task_id)\n" +
            "    task[\"is_done\"] = True\n" +
            "    return task"
          }
        />

        <CodeBlock
          caption={"обработчик"}
          code={
            "try:\n" +
            "    task = mark_task_done(tasks, task_id)\n" +
            "except TaskNotFoundError:\n" +
            "    return \"Задача не найдена\"\n" +
            "else:\n" +
            "    return f\"Готово: {task['title']}\""
          }
        />

        <TrueFalse
          statement={
            <>
              {"mark_task_done не читает input и не печатает сообщение."}
            </>
          }
          isTrue={true}
          explanation={"Утверждение повторяет ключевое правило раздела."}
        />

        <Callout tone="info">
          {"ValueError текста id и TaskNotFoundError после поиска являются разными сценариями."}
        </Callout>
      </Section>

      <Section number="08" title={"Практика и проверка"}>
        <Lead>
          {"Создайте TaskNotFoundError, функцию поиска или raise и операцию изменения статуса. Проверьте найденный id, отсутствующий id и неверный текст до преобразования."}
        </Lead>

        <div className="lesson-practice-steps">
          <h3>{"Основная практика"}</h3>
          <p>
            {"get_task_or_raise возвращает словарь или создаёт TaskNotFoundError."}
          </p>
          <h3>{"Интерфейс"}</h3>
          <p>
            {"handle_mark_done отличает ValueError текста id от отсутствующей задачи."}
          </p>
          <h3>{"Finally"}</h3>
          <p>
            {"Добавьте диагностическое завершение попытки без return внутри finally."}
          </p>
        </div>

        <CodeBlock
          caption={"итог"}
          code={
            "class TaskNotFoundError(Exception):\n" +
            "    pass\n" +
            "\n" +
            "def get_task_or_raise(tasks, task_id):\n" +
            "    for task in tasks:\n" +
            "        if task[\"id\"] == task_id:\n" +
            "            return task\n" +
            "    raise TaskNotFoundError(task_id)\n" +
            "\n" +
            "def mark_task_done(tasks, task_id):\n" +
            "    task = get_task_or_raise(tasks, task_id)\n" +
            "    task[\"is_done\"] = True\n" +
            "    return task"
          }
        />

        <PredictOutput
          code={`class TaskNotFoundError(Exception):
    pass


def get_task_or_raise(tasks, task_id):
    for task in tasks:
        if task["id"] == task_id:
            return task
    raise TaskNotFoundError(task_id)


def mark_task_done(tasks, task_id):
    task = get_task_or_raise(tasks, task_id)
    task["is_done"] = True
    return task


tasks = [
    {"id": 1, "title": "SQL", "is_done": False},
]

print(mark_task_done(tasks, 1)["is_done"])

try:
    mark_task_done(tasks, 999)
except TaskNotFoundError as error:
    print(type(error).__name__)`}
          output={`True
TaskNotFoundError`}
          hint="Первый вызов меняет статус, второй создаёт предметное исключение."
        />

        <Callout tone="info">
          {"Задача платформы может обработать TaskNotFoundError и вернуть строку not found."}
        </Callout>

        <div className="lesson-check-group">
          <QuizCard
            question={"Когда выполняется else?"}
            options={[
              "если try успешен",
              "после любого except",
              "только после finally",
            ]}
            correctIndex={0}
            explanation={"Else является успешной веткой."}
          />
          <QuizCard
            question={"Когда выполняется finally?"}
            options={[
              "при любом исходе",
              "только при ValueError",
              "только с else",
            ]}
            correctIndex={0}
            explanation={"Finally выполняет завершение."}
          />
          <QuizCard
            question={"Что делает raise?"}
            options={[
              "создаёт исключение",
              "только печатает",
              "создаёт модуль",
            ]}
            correctIndex={0}
            explanation={"Обычный поток прерывается."}
          />
          <QuizCard
            question={"Зачем TaskNotFoundError?"}
            options={[
              "назвать предметную ситуацию",
              "заменить все ошибки",
              "хранить задачи",
            ]}
            correctIndex={0}
            explanation={"Тип позволяет отдельно обработать отсутствие."}
          />
        </div>

        <KeyTakeaways
          points={[
            <>{"Else отделяет успешный путь."}</>,
            <>{"Finally выполняет обязательное завершение."}</>,
            <>{"Return внутри finally опасен."}</>,
            <>{"Raise создаёт исключение."}</>,
            <>{"Собственный класс выражает язык проекта."}</>,
            <>{"Raise from сохраняет исходную причину."}</>,
            <>{"Сервис создаёт ошибку, интерфейс выбирает сообщение."}</>,
          ]}
        />

        <PracticeCta text={"Добавьте TaskNotFoundError в StudyHub и покажите успех, отсутствие задачи и неверный текст id."} />
      </Section>

    </RichLesson>
  );
}

// 31. Модули, импорты и точка входа
export function Lesson31({ module }: { module?: string }) {
  return (
    <RichLesson>
      <RichHero
        chip={module ?? "Месяц 2 · Модуль 6"}
        title="Модули, импорты и точка входа"
        intro="Перенесём связанные функции из большого main.py в отдельные модули, разберём выполнение import и настроим безопасную точку запуска через __name__."
        tags={[
          { icon: <FolderGit2 size={14} />, label: "модули и import" },
          { icon: <FunctionSquare size={14} />, label: "точка входа" },
        ]}
      />
      <TheoryBridge lesson={31} />

      <Section number="01" title="Когда одного файла становится мало">
        <Lead>
          Один файл похож на рабочий стол. Пока инструментов мало, всё видно. Когда рядом оказываются меню,
          валидация, поиск, исключения и создание задач, связанные функции лучше разложить по подписанным модулям.
        </Lead>

        <div className="lesson-route">
          <ol>
            <li><strong>Определить ответственность:</strong> найти связанные функции.</li>
            <li><strong>Создать модуль:</strong> перенести их в отдельный файл <code>.py</code>.</li>
            <li><strong>Подключить import:</strong> явно указать зависимость.</li>
            <li><strong>Защитить запуск:</strong> не открывать меню при импорте.</li>
          </ol>
          <p>После занятия StudyHub будет состоять из четырёх модулей без изменения пользовательского поведения.</p>
        </div>

        <CompareSolutions
          question="Какой файл легче сопровождать?"
          left={{
            title: "Монолитный main.py",
            code: `menu + input + validators + services + exceptions + run`,
            note: "Несколько обязанностей находятся в одном месте.",
          }}
          right={{
            title: "Разделение по смыслу",
            code: `main.py
services.py
validators.py
exceptions.py`,
            note: "Каждый файл отвечает за одну область.",
          }}
          preferred="right"
          explanation="Разделение уменьшает область поиска и показывает зависимости."
        />

        <Callout tone="info">
          Новый файл создаётся ради отдельной ответственности, а не ради формального количества модулей.
        </Callout>
      </Section>

      <Section number="02" title="Модуль — обычный Python-файл">
        <Lead>
          Файл <code>validators.py</code> становится модулем, когда другой код импортирует его. Реализация остаётся
          в одном месте, а другие файлы используют готовые имена.
        </Lead>

        <CodeBlock
          caption="validators.py"
          code={`def normalize_title(title):
    cleaned = title.strip()

    if cleaned == "":
        raise ValueError("title не должен быть пустым")

    return cleaned


def validate_priority(priority):
    if not 1 <= priority <= 5:
        raise ValueError("priority должен быть от 1 до 5")

    return priority`}
        />

        <CodeBlock
          caption="main.py"
          code={`from validators import normalize_title
from validators import validate_priority

title = normalize_title("  SQL  ")
priority = validate_priority(4)

print(title, priority)`}
        />

        <MatchPairs
          prompt="Соедините файл и ответственность."
          pairs={[
            { left: "main.py", right: "интерфейс и запуск" },
            { left: "services.py", right: "операции над задачами" },
            { left: "validators.py", right: "проверка значений" },
            { left: "exceptions.py", right: "предметные исключения" },
          ]}
          explanation="Имя модуля должно позволять предсказать его содержимое."
        />

        <Callout>
          Перенос функции не меняет её контракт: параметры, результат и исключения остаются прежними.
        </Callout>
      </Section>

      <Section number="03" title="Формы импорта">
        <Lead>
          Python позволяет импортировать весь модуль, конкретное имя или псевдоним. Выбор определяется читаемостью
          и количеством используемых функций.
        </Lead>

        <TypeCards>
          <TypeCard badge="module" title="Импорт модуля" code={`import validators
validators.normalize_title(title)`}>
            Источник имени виден в месте вызова.
          </TypeCard>
          <TypeCard badge="from" badgeTone="float" title="Импорт имени" code={`from validators import normalize_title
normalize_title(title)`}>
            Короткая запись для нескольких часто используемых функций.
          </TypeCard>
          <TypeCard badge="as" badgeTone="str" title="Псевдоним" code={`import validators as task_validators
task_validators.normalize_title(title)`}>
            Полезен при длинном названии или конфликте.
          </TypeCard>
        </TypeCards>

        <BugHunt
          code={`from validators import *


def normalize_title(title):
    return "local"

print(normalize_title(" SQL "))`}
          question="Почему import * усложняет чтение?"
          options={[
            "Непонятно, какое имя используется и откуда оно пришло",
            "Python запрещает локальные функции",
            "Импорт работает только внутри класса",
          ]}
          correctIndex={0}
          explanation="Импортированные имена могут незаметно перекрываться локальными."
          fix={`import validators

print(validators.normalize_title(" SQL "))`}
        />

        <Callout tone="info">
          Явные импорты делают зависимости файла видимыми и уменьшают риск конфликтов.
        </Callout>
      </Section>

      <Section number="04" title="Что выполняется во время import">
        <Lead>
          При первом import Python находит файл, создаёт объект модуля и выполняет верхнеуровневые инструкции.
          Повторный обычный import в том же процессе использует созданный модуль из кэша.
        </Lead>

        <CodeBlock
          caption="config.py"
          code={`print("config imported")

DATA_PATH = "data/tasks.json"`}
        />

        <PredictOutput
          code={`import config
import config

print(config.DATA_PATH)`}
          output={`config imported
data/tasks.json`}
          hint="Верхнеуровневый код config обычно выполняется один раз за процесс."
        />

        <div className="lesson-practice-steps">
          <h3>Функции создаются</h3>
          <p>Python создаёт объект функции, но её тело не выполняется до вызова.</p>
          <h3>Обычные инструкции выполняются</h3>
          <p><code>print</code>, <code>input</code> и присваивания вне функций срабатывают при импорте.</p>
          <h3>Импорты показывают зависимости</h3>
          <p>Их размещают в начале файла, чтобы связь с другими модулями была заметна.</p>
        </div>

        <Callout>
          Библиотечный модуль не должен неожиданно запускать меню или пользовательский ввод.
        </Callout>
      </Section>

      <Section number="05" title="Почему input нельзя оставлять наверху">
        <Lead>
          Если <code>services.py</code> читает input на верхнем уровне, любой тестовый import становится
          интерактивным. Сценарий нужно поместить в функцию <code>run()</code>.
        </Lead>

        <BugHunt
          code={`# services.py
print("StudyHub")
command = input("Команда: ")


def create_task(title):
    return {"title": title}`}
          question="Что произойдёт при import services?"
          options={[
            "Сразу выполнятся print и input",
            "Создастся только функция create_task",
            "Python пропустит верхнеуровневый код",
          ]}
          correctIndex={0}
          explanation="Верхнеуровневые инструкции выполняются при первом импорте."
          fix={`# services.py

def create_task(title):
    return {"title": title}`}
        />

        <CompareSolutions
          question="Где должен находиться сценарий?"
          left={{
            title: "На верхнем уровне",
            code: `command = input("Команда: ")
create_task(command)`,
            note: "Import запускает приложение.",
          }}
          right={{
            title: "Внутри run",
            code: `def run():
    command = input("Команда: ")
    create_task(command)`,
            note: "Сценарий запускается явно.",
          }}
          preferred="right"
          explanation="Функция отделяет определение сценария от момента запуска."
        />

        <Callout tone="info">
          Константы и определения функций допустимы наверху, если они не создают неожиданный пользовательский эффект.
        </Callout>
      </Section>

      <Section number="06" title="Точка входа и __name__">
        <Lead>
          Один файл можно запустить напрямую или импортировать. Переменная <code>__name__</code> позволяет отличить
          эти режимы и запускать <code>run()</code> только при прямом старте.
        </Lead>

        <CodeBlock
          caption="main.py"
          code={`def run():
    print("StudyHub started")


if __name__ == "__main__":
    run()`}
        />

        <StepThrough
          code={`def run():
    print("StudyHub started")


if __name__ == "__main__":
    run()`}
          steps={[
            { line: 0, note: "Создаётся функция run.", vars: { run: "функция" } },
            { line: 4, note: "При прямом запуске __name__ равен __main__.", vars: { __name__: '"__main__"' } },
            { line: 5, note: "Условие истинно, поэтому запускается run.", vars: { вывод: "StudyHub started" } },
          ]}
        />

        <TrueFalse
          statement={<>При импорте файла его <code>__name__</code> всегда равно <code>"__main__"</code>.</>}
          isTrue={false}
          explanation="При импорте используется имя модуля, например main или app.main."
        />

        <Callout>
          Защита нужна точке запуска, а не каждому файлу без разбора.
        </Callout>
      </Section>

      <Section number="07" title="Безопасный порядок рефакторинга">
        <Lead>
          Перенос кода выполняется небольшими шагами. Если одновременно менять структуру и поведение, источник новой
          ошибки становится неясным.
        </Lead>

        <CodeSequence
          title="Порядок переноса"
          prompt="Расположите действия от проверки к коммиту."
          pieces={[
            { id: "before", code: "проверить старый сценарий" },
            { id: "file", code: "создать один модуль" },
            { id: "move", code: "перенести одну группу функций" },
            { id: "imports", code: "добавить явные imports" },
            { id: "after", code: "повторить сценарии" },
            { id: "commit", code: "сделать отдельный коммит" },
          ]}
          correctOrder={["before", "file", "move", "imports", "after", "commit"]}
          explanation="Структурный шаг проверяется до следующего изменения."
        />

        <CodeBlock
          caption="результат занятия"
          code={`studyhub/
├── main.py
├── services.py
├── validators.py
├── exceptions.py
├── .gitignore
└── README.md`}
        />

        <RecallCard
          question="Почему перенос и изменение алгоритма лучше разделить?"
          answer={<p>Так легче понять, вызвана ли проблема новым импортом или изменением поведения функции.</p>}
        />

        <Callout tone="info">
          В занятии 32 эти модули будут объединены в пакет <code>app</code> и получат однонаправленные импорты.
        </Callout>
      </Section>

      <Section number="08" title="Практика и проверка основной модели">
        <div className="lesson-practice-steps">
          <h3>Создайте validators.py</h3>
          <p>Перенесите нормализацию title и проверку priority.</p>
          <h3>Создайте services.py</h3>
          <p>Перенесите операции над задачами без input и print.</p>
          <h3>Создайте exceptions.py</h3>
          <p>Перенесите TaskNotFoundError.</p>
          <h3>Оставьте main.py точкой запуска</h3>
          <p>Добавьте run и защиту через __name__.</p>
          <h3>Проверьте два режима</h3>
          <p>Прямой запуск открывает приложение, обычный import не показывает меню.</p>
        </div>

        <div className="lesson-check-group">
          <QuizCard question="Что является модулем?" options={["файл .py", "только папка", "каждая функция"]} correctIndex={0} explanation="Модуль обычно соответствует отдельному Python-файлу." />
          <QuizCard question="Что выполняет import?" options={["верхнеуровневый код", "только комментарии", "только return"]} correctIndex={0} explanation="Модуль создаётся и выполняется при первом импорте." />
          <QuizCard question="Зачем защита __name__?" options={["не запускать интерфейс при импорте", "поймать ValueError", "создать Git-ветку"]} correctIndex={0} explanation="Прямой запуск отделяется от импорта." />
          <QuizCard question="Где должен находиться input?" options={["в интерфейсной функции", "в services наверху", "в exceptions"]} correctIndex={0} explanation="Сервисные модули не запускают интерфейс." />
        </div>

        <KeyTakeaways
          points={[
            <>Модуль — Python-файл с понятной ответственностью.</>,
            <>Import выполняет верхнеуровневый код.</>,
            <>Тело функции запускается только при вызове.</>,
            <>Явный import показывает источник имени.</>,
            <>Input и меню не должны срабатывать при импорте.</>,
            <><code>__name__ == "__main__"</code> задаёт точку запуска.</>,
            <>Перенос кода проверяется небольшими шагами.</>,
          ]}
        />

        <PracticeCta text="Разделите StudyHub на четыре модуля и проверьте прямой запуск и безопасный import." />
      </Section>
    </RichLesson>
  );
}

// 32. Пакеты, __init__.py и направление импортов
export function Lesson32({ module }: { module?: string }) {
  return (
    <RichLesson>
      <RichHero
        chip={module ?? "Месяц 2 · Модуль 6"}
        title="Пакеты, __init__.py и направление импортов"
        intro="Объединим модули StudyHub в пакет app, настроим абсолютные импорты, разберём роль __init__.py и научимся находить и устранять циклические зависимости."
        tags={[
          { icon: <Package size={14} />, label: "пакет и __init__.py" },
          { icon: <GitBranch size={14} />, label: "направление импортов" },
        ]}
      />
      <TheoryBridge lesson={32} />

      <Section number="01" title="От модулей к пакету">
        <Lead>
          Несколько связанных модулей можно представить как инструменты одной мастерской. Папка-пакет объединяет
          их под общим именем и создаёт понятный путь импорта.
        </Lead>

        <div className="lesson-route">
          <ol>
            <li><strong>Создать пакет:</strong> переместить модули в папку <code>app</code>.</li>
            <li><strong>Добавить __init__.py:</strong> обозначить границу пакета.</li>
            <li><strong>Настроить импорты:</strong> использовать путь от корня пакета.</li>
            <li><strong>Проверить стрелки:</strong> исключить обратные и циклические зависимости.</li>
          </ol>
          <p>
            После занятия приложение запускается через <code>python -m app.main</code>, а обычный import не открывает меню.
          </p>
        </div>

        <CodeBlock
          caption="структура пакета"
          code={`studyhub/
├── app/
│   ├── __init__.py
│   ├── main.py
│   ├── services.py
│   ├── validators.py
│   └── exceptions.py
├── tests/
├── .gitignore
└── README.md`}
        />

        <Callout tone="info">
          Пакет нужен для группировки связанных модулей. Большое число пустых папок само по себе не создаёт архитектуру.
        </Callout>
      </Section>

      <Section number="02" title="Что делает __init__.py">
        <Lead>
          Файл <code>__init__.py</code> обозначает явную границу пакета. На первом этапе он может быть полностью пустым.
        </Lead>

        <TypeCards>
          <TypeCard badge="empty" title="Пустой файл" code="# app/__init__.py">
            Нормальный начальный вариант без скрытых зависимостей.
          </TypeCard>
          <TypeCard badge="public" badgeTone="float" title="Публичные имена" code={`from app.services import create_task
from app.exceptions import TaskNotFoundError`}>
            Используется только для небольшого осмысленного интерфейса пакета.
          </TypeCard>
          <TypeCard badge="__all__" badgeTone="str" title="Явный список" code={`__all__ = ["create_task", "TaskNotFoundError"]`}>
            Документирует имена, которые пакет считает публичными.
          </TypeCard>
        </TypeCards>

        <CompareSolutions
          question="Какой __init__.py лучше в начале?"
          left={{
            title: "Импортировать всё",
            code: `from app.main import *
from app.services import *
from app.validators import *`,
            note: "Появляются скрытые зависимости и риск циклов.",
          }}
          right={{
            title: "Оставить пустым",
            code: `# app/__init__.py`,
            note: "Граница пакета есть, дополнительных связей нет.",
          }}
          preferred="right"
          explanation="Каждый импорт в __init__.py тоже становится частью графа зависимостей."
        />

        <TrueFalse
          statement={<><code>__init__.py</code> обязан импортировать каждый модуль пакета.</>}
          isTrue={false}
          explanation="Пустой __init__.py является корректным и часто наиболее прозрачным вариантом."
        />
      </Section>

      <Section number="03" title="Абсолютные импорты">
        <Lead>
          Абсолютный импорт показывает полный путь от корня пакета. Читатель сразу видит, где находится модуль и в какую сторону направлена зависимость.
        </Lead>

        <CodeBlock
          caption="app/services.py"
          code={`from app.exceptions import TaskNotFoundError
from app.validators import normalize_title
from app.validators import validate_priority`}
        />

        <CompareSolutions
          question="Какой путь однозначнее?"
          left={{
            title: "Неполный путь",
            code: `from validators import validate_priority`,
            note: "Результат может зависеть от текущей папки и способа запуска.",
          }}
          right={{
            title: "Абсолютный путь",
            code: `from app.validators import validate_priority`,
            note: "Источник модуля виден полностью.",
          }}
          preferred="right"
          explanation="В курсе абсолютные импорты используются как основной прозрачный вариант."
        />

        <BugHunt
          code={`# app/services.py
from validators import validate_priority`}
          question="Почему импорт может перестать работать после запуска через -m?"
          options={[
            "Python может искать validators как модуль верхнего уровня",
            "В пакетах нельзя импортировать функции",
            "Импорт нужно размещать только в try",
          ]}
          correctIndex={0}
          explanation="Полный путь app.validators не зависит от случайного положения текущего файла."
          fix={`from app.validators import validate_priority`}
        />

        <Callout>
          Выберите единое правило импортов для проекта и применяйте его последовательно.
        </Callout>
      </Section>

      <Section number="04" title="Относительные импорты">
        <Lead>
          Относительный импорт описывает положение относительно текущего пакета. Одна точка означает текущую папку-пакет, две точки поднимаются на уровень выше.
        </Lead>

        <TypeCards>
          <TypeCard badge="." title="Текущий пакет" code="from .validators import validate_priority">
            Файл validators.py находится рядом с текущим модулем.
          </TypeCard>
          <TypeCard badge=".." badgeTone="float" title="Родительский пакет" code="from ..common import logger">
            Используется во вложенном пакете для перехода вверх.
          </TypeCard>
          <TypeCard badge="absolute" badgeTone="str" title="Полный путь" code="from app.validators import validate_priority">
            Явно показывает корень зависимости.
          </TypeCard>
        </TypeCards>

        <CompareSolutions
          question="Какой вариант допустим внутри app.services?"
          left={{
            title: "Абсолютный",
            code: `from app.validators import validate_priority`,
            note: "Полный путь виден сразу.",
          }}
          right={{
            title: "Относительный",
            code: `from .validators import validate_priority`,
            note: "Короткий путь внутри текущего пакета.",
          }}
          preferred="both"
          explanation="Оба варианта корректны. В учебном проекте основным остаётся абсолютный импорт."
        />

        <RecallCard
          question="Что означает одна точка в from .validators import ...?"
          answer={<p>Она обозначает текущий пакет, в котором находится импортирующий модуль.</p>}
        />
      </Section>

      <Section number="05" title="Направление зависимостей">
        <Lead>
          Импорты удобно представить стрелками. Верхний уровень собирает приложение и зависит от нижних правил. Нижние уровни не должны импортировать интерфейс и точку запуска.
        </Lead>

        <CodeBlock
          caption="желательное направление"
          code={`main
  ↓
services
  ↓
validators + exceptions`}
        />

        <TypeCards>
          <TypeCard badge="main" title="Сценарий" code="from app.services import create_task">
            Получает ввод, вызывает сервисы и показывает результат.
          </TypeCard>
          <TypeCard badge="services" badgeTone="float" title="Предметные операции" code="from app.validators import normalize_title">
            Работает с задачами без знания о меню.
          </TypeCard>
          <TypeCard badge="lower" badgeTone="str" title="Нижний уровень" code="class TaskNotFoundError(Exception): ...">
            Не импортирует main или services.
          </TypeCard>
        </TypeCards>

        <CompareSolutions
          question="Как services получает список tasks?"
          left={{
            title: "Импортировать main",
            code: `from app.main import tasks`,
            note: "Нижний уровень зависит от точки запуска.",
          }}
          right={{
            title: "Получить аргументом",
            code: `def add_task(tasks, task):
    tasks.append(task)`,
            note: "Зависимость видна в контракте функции.",
          }}
          preferred="right"
          explanation="Состояние передаётся сверху вниз, а не импортируется обратно."
        />
      </Section>

      <Section number="06" title="Как возникает циклический импорт">
        <Lead>
          Циклический импорт похож на двух сотрудников, каждый из которых ждёт документ от другого. Первый модуль ещё не завершил создание имён, когда второй пытается получить одно из них.
        </Lead>

        <CodeBlock
          caption="плохой цикл"
          code={`# app/services.py
from app.main import tasks


def add_task(task):
    tasks.append(task)


# app/main.py
from app.services import add_task

tasks = []`}
        />

        <StepThrough
          code={`main начинает import services
services начинает import main
main ещё не дошёл до tasks = []
services пытается получить tasks
возникает ошибка частично созданного модуля`}
          steps={[
            { line: 0, note: "Запуск main начинает импорт services.", vars: { main: "частично выполняется" } },
            { line: 1, note: "Services в ответ импортирует main.", vars: { services: "частично выполняется" } },
            { line: 2, note: "Переменная tasks ещё не создана.", vars: { tasks: "отсутствует" } },
            { line: 3, note: "Services пытается получить незавершённое имя.", vars: { проблема: "circular import" } },
          ]}
        />

        <Callout tone="info">
          Ошибка часто говорит о partially initialized module. Это важный признак взаимного импорта.
        </Callout>
      </Section>

      <Section number="07" title="Как устранять цикл">
        <Lead>
          Перенос import внутрь функции иногда снимает технический симптом, но не исправляет неправильные ответственности. Сначала нужно разорвать обратную стрелку.
        </Lead>

        <MethodGrid
          rows={[
            [<>Нарисовать граф</>, "увидеть взаимные импорты"],
            [<>Передать состояние аргументом</>, "не импортировать tasks из main"],
            [<>Перенести правило ниже</>, "создать независимый модуль"],
            [<>Разделить обязанности</>, "валидатор не создаёт задачи"],
            [<>Проверить запуск</>, "повторить -m и обычный import"],
          ]}
        />

        <CodeSequence
          title="Порядок исправления"
          prompt="Расположите действия от диагностики к проверке."
          pieces={[
            { id: "map", code: "нарисовать стрелки импортов" },
            { id: "pair", code: "найти взаимную пару" },
            { id: "reason", code: "найти неправильную ответственность" },
            { id: "fix", code: "передать аргумент или перенести правило" },
            { id: "run", code: "проверить python -m app.main" },
            { id: "import", code: "проверить import app.services" },
          ]}
          correctOrder={["map", "pair", "reason", "fix", "run", "import"]}
          explanation="Цикл исправляется направлением зависимостей, а не случайным перемещением строки import."
        />

        <BugHunt
          code={`# app/validators.py
from app.services import create_task

# app/services.py
from app.validators import validate_priority`}
          question="Какая связь лишняя?"
          options={[
            "validators не должен импортировать services",
            "services не должен импортировать validators",
            "оба файла нужно перенести в main",
          ]}
          correctIndex={0}
          explanation="Валидатор находится ниже и не должен зависеть от сервиса."
          fix={`# app/validators.py
def validate_priority(value):
    ...

# app/services.py
from app.validators import validate_priority`}
        />
      </Section>

      <Section number="08" title="Практика и проверка основной модели">
        <div className="lesson-practice-steps">
          <h3>Создайте пакет</h3>
          <p>Переместите модули в <code>app</code> и добавьте пустой <code>__init__.py</code>.</p>

          <h3>Исправьте импорты</h3>
          <p>Используйте пути вида <code>from app.validators import ...</code>.</p>

          <h3>Проверьте запуск</h3>
          <p><code>python -m app.main</code> должен открыть приложение.</p>

          <h3>Проверьте безопасный import</h3>
          <p><code>python -c "import app.main"</code> не должен показывать меню.</p>

          <h3>Проверьте граф</h3>
          <p>В services не должно быть импорта из main.</p>
        </div>

        <div className="lesson-check-group">
          <QuizCard
            question="Что обозначает __init__.py?"
            options={["границу пакета", "JSON-хранилище", "Git-коммит"]}
            correctIndex={0}
            explanation="Файл может оставаться пустым."
          />
          <QuizCard
            question="Какой импорт основной в курсе?"
            options={["абсолютный от app", "import *", "services из main"]}
            correctIndex={0}
            explanation="Полный путь показывает источник зависимости."
          />
          <QuizCard
            question="Что создаёт цикл?"
            options={["взаимные импорты", "пустой __init__.py", "одна функция без return"]}
            correctIndex={0}
            explanation="Модули начинают зависеть друг от друга."
          />
          <QuizCard
            question="Как services получает tasks?"
            options={["аргументом", "импортом из main", "через __all__"]}
            correctIndex={0}
            explanation="Состояние передаётся сверху вниз."
          />
        </div>

        <KeyTakeaways
          points={[
            <>Пакет объединяет связанные модули под общим именем.</>,
            <><code>__init__.py</code> может быть пустым.</>,
            <>Абсолютный импорт показывает полный путь.</>,
            <>Относительный импорт использует точки.</>,
            <>Main зависит от services, а не наоборот.</>,
            <>Состояние передаётся аргументом.</>,
            <>Цикл возникает при взаимной зависимости модулей.</>,
            <>Исправление начинается с направления ответственностей.</>,
          ]}
        />

        <PracticeCta text="Соберите пакет app, запустите его через -m, проверьте безопасный import и устраните подготовленный циклический импорт." />
      </Section>
    </RichLesson>
  );
}
