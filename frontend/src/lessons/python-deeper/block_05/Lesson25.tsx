import {
  Braces,
  FunctionSquare,
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
  TheoryBridge,
} from "../../shared";

// 25. *args, **kwargs и распаковка
export function Lesson25({ module }: { module?: string }) {
  return (
    <RichLesson>
      <RichHero
        chip={module ?? "Блок 5 · Функции и поток данных"}
        title="*args, **kwargs и распаковка"
        intro="Научимся собирать переменное количество аргументов и распаковывать готовые коллекции в вызов функции. Разберём, что именно создают *args и **kwargs, когда они полезны и почему ими не стоит скрывать обычный ясный контракт."
        tags={[
          { icon: <Braces size={14} />, label: "*args · **kwargs" },
          { icon: <FunctionSquare size={14} />, label: "распаковка вызова" },
        ]}
      />
      <TheoryBridge link={"Звёздочка меняет форму передачи значений: *args собирает позиционные, **kwargs — именованные, распаковка делает обратное."} boundary={"Эти конструкции не делают контракт яснее сами по себе; явные параметры лучше, когда набор данных известен."} />

      <Section number="01" title="Звёздочка меняет способ передачи значений">
        <Lead>
          Оператор <code>*</code> работает с последовательностью позиционных значений, а <code>**</code> — со
          словарём именованных значений. В определении они собирают аргументы, в вызове — распаковывают их.
        </Lead>

        <div className="lesson-route">
          <ol>
            <li><strong>*args в определении:</strong> собирает лишние позиционные аргументы в tuple.</li>
            <li><strong>**kwargs в определении:</strong> собирает лишние именованные аргументы в dict.</li>
            <li><strong>*items в вызове:</strong> раскладывает последовательность по позициям.</li>
            <li><strong>**options в вызове:</strong> передаёт пары словаря как именованные аргументы.</li>
          </ol>
          <p>Финальная практика блока свяжет распаковку с фабрикой задач и конфигурацией фильтра.</p>
        </div>

        <Callout tone="info">
          Одинаковый символ выполняет обратные действия в разных местах: в <code>def</code> собирает, в вызове распаковывает.
        </Callout>
      </Section>

      <Section number="02" title="*args собирает позиционные аргументы в кортеж">
        <Lead>
          Параметр со звёздочкой получает все оставшиеся позиционные значения. Имя <code>args</code> является
          соглашением, но технически можно выбрать другое имя.
        </Lead>

        <StepThrough
          code={
            'def total_points(*points):\n' +
            '    total = 0\n' +
            '    for point in points:\n' +
            '        total += point\n' +
            '    return total\n\n' +
            'result = total_points(10, 20, 5)'
          }
          steps={[
            { line: 6, note: "В вызове переданы три позиционных аргумента.", vars: { аргументы: "10, 20, 5" } },
            { line: 0, note: "*points собирает их в кортеж.", vars: { points: "(10, 20, 5)" } },
            { line: 2, note: "Цикл перебирает элементы кортежа.", vars: { point: "10 → 20 → 5" } },
            { line: 4, note: "Функция возвращает сумму.", vars: { result: "35" } },
          ]}
        />

        <PredictOutput
          code={
            'def show_args(*args):\n' +
            '    print(type(args).__name__)\n' +
            '    print(args)\n\n' +
            'show_args("SQL", 5, False)'
          }
          output={'tuple\n(\'SQL\', 5, False)'}
          hint="Даже разные типы собираются в один кортеж."
        />

        <TrueFalse
          statement={
            <>
              Параметр <code>*args</code> всегда обязан называться именно <code>args</code>.
            </>
          }
          isTrue={false}
          explanation="Важна звёздочка. Имя args используется для узнаваемости кода."
        />
      </Section>

      <Section number="03" title="Обычные параметры и *args можно сочетать">
        <Lead>
          Явные обязательные параметры остаются в начале, а <code>*args</code> собирает дополнительную часть вызова.
        </Lead>

        <CodeBlock
          caption="основное значение и дополнительные теги"
          code={
            'def create_tagged_title(title, *tags):\n' +
            '    normalized = title.strip()\n' +
            '    if not tags:\n' +
            '        return normalized\n' +
            '    return f"{normalized} [{\', \'.join(tags)}]"\n\n' +
            'print(create_tagged_title("SQL"))\n' +
            'print(create_tagged_title("API", "python", "backend"))'
          }
        />

        <BugHunt
          code={
            'def create_tagged_title(*tags, title):\n' +
            '    return title'
          }
          question="Как нужно передать title при такой сигнатуре?"
          options={[
            "Только по имени",
            "Только первым позиционно",
            "Передать через список без звёздочки",
          ]}
          correctIndex={0}
          explanation="Параметры после *args становятся keyword-only и передаются по имени."
          fix={'create_tagged_title("python", "backend", title="API")'}
        />

        <Callout>
          Keyword-only параметры полезны, когда настройку важно назвать явно. Подробно этот приём будет закрепляться
          позже при чтении сигнатур библиотек.
        </Callout>
      </Section>

      <Section number="04" title="**kwargs собирает именованные аргументы в словарь">
        <Lead>
          Две звёздочки собирают дополнительные пары <code>имя=значение</code>. Ключами словаря становятся имена
          аргументов.
        </Lead>

        <StepThrough
          code={
            'def build_options(**kwargs):\n' +
            '    return kwargs\n\n' +
            'options = build_options(priority=5, is_done=False, category="python")'
          }
          steps={[
            { line: 3, note: "Переданы три именованных аргумента.", vars: { вызов: "priority=5, is_done=False, category=..." } },
            { line: 0, note: "**kwargs собирает их в словарь.", vars: { kwargs: "dict" } },
            { line: 1, note: "Функция возвращает собранный словарь.", vars: { "options['priority']": "5" } },
          ]}
        />

        <PredictOutput
          code={
            'def inspect(**kwargs):\n' +
            '    print(type(kwargs).__name__)\n' +
            '    print(sorted(kwargs))\n\n' +
            'inspect(status="new", priority=3)'
          }
          output={'dict\n[\'priority\', \'status\']'}
          hint="Перебор словаря даёт ключи, sorted упорядочивает их."
        />

        <MatchPairs
          prompt="Соедините объект внутри функции с источником."
          pairs={[
            { left: "args", right: "кортеж позиционных аргументов" },
            { left: "kwargs", right: "словарь именованных аргументов" },
            { left: "kwargs['priority']", right: "значение аргумента priority" },
          ]}
          explanation="* и ** определяют форму собранных данных."
        />
      </Section>

      <Section number="05" title="Распаковка списка и кортежа в вызове">
        <Lead>
          В вызове одна звёздочка берёт элементы последовательности и передаёт их как отдельные позиционные
          аргументы.
        </Lead>

        <CompareSolutions
          question="Какие вызовы эквивалентны?"
          left={{
            title: "Аргументы записаны отдельно",
            code: 'create_task("SQL", 5, False)',
            note: "Три значения переданы явно.",
          }}
          right={{
            title: "Последовательность распакована",
            code: 'data = ("SQL", 5, False)\ncreate_task(*data)',
            note: "Элементы кортежа распределяются по трём параметрам.",
          }}
          preferred="both"
          explanation="После распаковки функция получает те же три позиционных значения."
        />

        <PredictOutput
          code={
            'def subtract(a, b):\n' +
            '    return a - b\n\n' +
            'numbers = [10, 3]\n' +
            'print(subtract(*numbers))'
          }
          output={'7'}
          hint="Список превращается в вызов subtract(10, 3)."
        />

        <BugHunt
          code={
            'values = ["SQL", 5]\n' +
            'create_task(*values)'
          }
          question="Что произойдёт, если is_done не имеет значения по умолчанию?"
          options={[
            "Возникнет TypeError из-за отсутствующего аргумента",
            "Python добавит None автоматически",
            "Список станет словарём",
          ]}
          correctIndex={0}
          explanation="После распаковки переданы только два позиционных аргумента."
          fix={
            'values = ["SQL", 5, False]\n' +
            'create_task(*values)'
          }
        />
      </Section>

      <Section number="06" title="Распаковка словаря в именованные аргументы">
        <Lead>
          Вызов с <code>**mapping</code> использует ключи словаря как имена параметров, а значения — как переданные
          аргументы.
        </Lead>

        <CodeBlock
          caption="словарь конфигурации"
          code={
            'task_data = {\n' +
            '    "title": "Изучить распаковку",\n' +
            '    "priority": 4,\n' +
            '    "is_done": False,\n' +
            '}\n\n' +
            'task = create_task(**task_data)'
          }
        />

        <StepThrough
          code={
            'def create_task(title, priority=3, is_done=False):\n' +
            '    return {"title": title, "priority": priority, "is_done": is_done}\n\n' +
            'data = {"title": "SQL", "priority": 5}\n' +
            'task = create_task(**data)'
          }
          steps={[
            { line: 3, note: "Словарь содержит ключи, совпадающие с параметрами.", vars: { data: "title, priority" } },
            { line: 4, note: "**data превращается в title='SQL', priority=5.", vars: { title: '"SQL"', priority: "5" } },
            { line: 0, note: "is_done не передан и получает False по умолчанию.", vars: { is_done: "False" } },
            { line: 1, note: "Функция возвращает готовую задачу.", vars: { task: "dict" } },
          ]}
        />

        <BugHunt
          code={
            'data = {"name": "SQL", "priority": 5}\n' +
            'create_task(**data)'
          }
          question="Почему возникнет unexpected keyword argument 'name'?"
          options={[
            "Ключ name не совпадает ни с одним параметром",
            "Словари нельзя распаковывать",
            "priority должен быть строкой",
          ]}
          correctIndex={0}
          explanation="Ключи распакованного словаря должны соответствовать именам параметров или приниматься через **kwargs."
          fix={
            'data = {"title": "SQL", "priority": 5}\n' +
            'create_task(**data)'
          }
        />
      </Section>

      <Section number="07" title="Не скрывайте контракт за *args и **kwargs">
        <Lead>
          Переменное количество аргументов полезно для адаптеров, логирования и передачи настроек. Но обычная
          бизнес-функция должна по возможности сохранять явные параметры.
        </Lead>

        <CompareSolutions
          question="Какая сигнатура лучше описывает создание задачи?"
          left={{
            title: "Всё спрятано",
            code:
              'def create_task(*args, **kwargs):\n' +
              '    ...',
            note: "Не видно обязательных полей и допустимых форм вызова.",
          }}
          right={{
            title: "Основной контракт явный",
            code:
              'def create_task(title, priority=3, is_done=False):\n' +
              '    ...',
            note: "Сигнатура документирует модель задачи.",
          }}
          preferred="right"
          explanation="Гибкость не должна уничтожать понятность основного сценария."
        />

        <MethodGrid
          rows={[
            [<>*args полезен</>, "когда число однотипных позиционных значений действительно переменно"],
            [<>**kwargs полезен</>, "для адаптера дополнительных именованных настроек"],
            [<>явные параметры лучше</>, "для обязательных бизнес-данных и стабильного контракта"],
            [<>*data и **data полезны</>, "когда значения уже собраны в подходящую коллекцию"],
          ]}
        />

        <RecallCard
          question="Почему create_task(**task_data) связывает тему функций с будущими API-схемами?"
          hint="Подумайте о словаре данных с именованными полями."
          answer={
            <p>
              Словарь с ключами <code>title</code>, <code>priority</code> и <code>is_done</code> уже похож на
              структурированный запрос. Позже Pydantic и FastAPI будут проверять такие именованные поля до вызова
              прикладной логики.
            </p>
          }
        />
      </Section>

      <Section number="08" title="Финальная практика блока">
        <Lead>
          Соберите маленький модуль функций, который создаёт задачи из словарей, объединяет теги и применяет
          именованные параметры фильтрации.
        </Lead>

        <CodeBlock
          caption="итоговый пример"
          code={
            'def create_task(title, priority=3, is_done=False):\n' +
            '    return {\n' +
            '        "title": title.strip(),\n' +
            '        "priority": priority,\n' +
            '        "is_done": is_done,\n' +
            '    }\n\n' +
            'def add_tags(task, *tags):\n' +
            '    result = task.copy()\n' +
            '    result["tags"] = list(tags)\n' +
            '    return result\n\n' +
            'task_data = {"title": "FastAPI", "priority": 5}\n' +
            'task = create_task(**task_data)\n' +
            'tagged = add_tags(task, "python", "backend")'
          }
        />

        <CodeSequence
          title="Соберите путь данных"
          prompt="Словарь должен превратиться в задачу, затем получить теги."
          pieces={[
            { id: "data", code: 'data = {"title": "API", "priority": 5}' },
            { id: "create", code: "task = create_task(**data)" },
            { id: "tags", code: 'result = add_tags(task, "python", "backend")' },
            { id: "return", code: "return result" },
          ]}
          correctOrder={["data", "create", "tags", "return"]}
          explanation="**data передаёт именованные поля, а обычные позиционные строки собираются в *tags."
        />

        <div className="lesson-check-group">
          <QuizCard
            question="Какой тип получает *args внутри функции?"
            options={["tuple", "dict", "set"]}
            correctIndex={0}
            explanation="Позиционные аргументы собираются в кортеж."
          />
          <QuizCard
            question="Какой тип получает **kwargs?"
            options={["dict", "list", "str"]}
            correctIndex={0}
            explanation="Именованные аргументы собираются в словарь."
          />
          <QuizCard
            question="Что делает create_task(**data)?"
            options={["Распаковывает ключи как имена параметров", "Передаёт один словарь", "Создаёт args"]}
            correctIndex={0}
            explanation="Пары ключ–значение становятся именованными аргументами."
          />
        </div>

        <KeyTakeaways
          points={[
            <><code>*args</code> собирает дополнительные позиционные аргументы в tuple.</>,
            <><code>**kwargs</code> собирает дополнительные именованные аргументы в dict.</>,
            <><code>*sequence</code> распаковывает элементы в позиционный вызов.</>,
            <><code>**mapping</code> распаковывает ключи и значения в именованный вызов.</>,
            <>Ключи словаря должны соответствовать параметрам функции.</>,
            <>Обязательные бизнес-данные лучше оставлять явными параметрами.</>,
            <>Навык распаковки подготовит чтение декораторов, библиотечных функций и FastAPI-кода.</>,
          ]}
        />

        <PracticeCta text="Реализуйте create_task(), add_tags(*tags) и вызов create_task(**task_data). Добавьте пять проверочных вызовов и финальный Git-коммит feat: add flexible function calls." />
      </Section>
    </RichLesson>
  );
}

// 26. Функция как значение: callbacks и замыкания
