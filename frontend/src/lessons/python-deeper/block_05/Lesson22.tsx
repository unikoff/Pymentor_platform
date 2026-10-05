import {
  FunctionSquare,
  ShieldCheck,
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
  TheoryBridge,
} from "../../shared";

// 22. Функция как контракт: вход, правило, результат
export function Lesson22({ module }: { module?: string }) {
  return (
    <RichLesson>
      <RichHero
        chip={module ?? "Блок 5 · Функции и поток данных"}
        title="Функция как контракт: вход, правило, результат"
        intro="Углубим знакомство с функциями: научимся описывать их как договор между частями программы, различать return и print, замечать побочные эффекты и проектировать результат до написания тела функции."
        tags={[
          { icon: <FunctionSquare size={14} />, label: "вход → правило → выход" },
          { icon: <ShieldCheck size={14} />, label: "явный контракт" },
        ]}
      />
      <TheoryBridge link={"Знакомая функция становится контрактом: до деталей тела нужно назвать вход, правило и результат."} boundary={"Функция не обязана печатать то, что возвращает: вывод и значение для другой части программы остаются разными ролями."} />

      <Section number="01" title="Функция обещает предсказуемое поведение">
        <Lead>
          Контракт функции отвечает на четыре вопроса: какие данные она получает, какие значения допустимы, что
          возвращает и меняет ли что-нибудь вне себя.
        </Lead>

        <div className="lesson-route">
          <ol>
            <li><strong>Определить вход:</strong> какие параметры нужны и что они означают.</li>
            <li><strong>Сформулировать правило:</strong> какое преобразование или проверка выполняется.</li>
            <li><strong>Выбрать выход:</strong> значение какого типа возвращается при успехе и особом случае.</li>
            <li><strong>Назвать эффект:</strong> меняется ли переданный объект, файл или терминал.</li>
          </ol>
          <p>В конце занятия вы перепроектируете несколько функций StudyHub по явным контрактам.</p>
        </div>

        <Callout tone="info">
          Хорошую функцию можно использовать, зная её имя, параметры и обещанный результат, не читая каждую строку тела.
        </Callout>
      </Section>

      <Section number="02" title="Сигнатура показывает способ вызова">
        <Lead>
          Строка с <code>def</code> похожа на заголовок инструкции: она сообщает имя действия и перечень входных
          значений.
        </Lead>

        <CodeBlock
          caption="сигнатура и тело"
          code={
            'def calculate_progress(completed, total):\n' +
            '    if total == 0:\n' +
            '        return 0\n' +
            '    return completed / total * 100'
          }
        />

        <MatchPairs
          prompt="Соедините часть функции с её ролью."
          pairs={[
            { left: "calculate_progress", right: "имя функции" },
            { left: "completed, total", right: "параметры" },
            { left: "total == 0", right: "особый случай" },
            { left: "return ...", right: "результат вызова" },
          ]}
          explanation="Сигнатура описывает вызов, тело реализует обещанное правило."
        />

        <PredictOutput
          code={
            'def calculate_progress(completed, total):\n' +
            '    if total == 0:\n' +
            '        return 0\n' +
            '    return completed / total * 100\n\n' +
            'print(calculate_progress(3, 4))\n' +
            'print(calculate_progress(0, 0))'
          }
          output={'75.0\n0'}
          hint="Сначала проверьте особый случай total == 0."
        />
      </Section>

      <Section number="03" title="return и print решают разные задачи">
        <Lead>
          <code>return</code> передаёт значение вызывающему коду. <code>print</code> только показывает текст в
          терминале. Напечатанный результат нельзя автоматически использовать в следующем вычислении.
        </Lead>

        <CompareSolutions
          question="Какая функция подходит для дальнейших вычислений?"
          left={{
            title: "Только показывает",
            code: 'def double(value):\n    print(value * 2)',
            note: "Функция не возвращает число и неявно возвращает None.",
          }}
          right={{
            title: "Возвращает значение",
            code: 'def double(value):\n    return value * 2',
            note: "Результат можно сохранить, сравнить или передать дальше.",
          }}
          preferred="right"
          explanation="Вычислительная функция обычно возвращает данные, а интерфейс решает, печатать ли их."
        />

        <StepThrough
          code={
            'def double(value):\n' +
            '    print(value * 2)\n\n' +
            'result = double(5)\n' +
            'print(result)'
          }
          steps={[
            { line: 3, note: "Начинается вызов double(5).", vars: { value: "5" } },
            { line: 1, note: "В терминал выводится 10.", vars: { вывод: "10" } },
            { line: 3, note: "Явного return нет, поэтому вызов возвращает None.", vars: { result: "None" } },
            { line: 4, note: "Вторая команда print показывает None.", vars: { вывод: "10 ⏎ None" } },
          ]}
        />

        <BugHunt
          code={
            'def get_task_title(task):\n' +
            '    print(task["title"])\n\n' +
            'title = get_task_title({"title": "SQL"})\n' +
            'print(title.upper())'
          }
          question="Почему вызов upper завершится ошибкой?"
          options={[
            "title содержит None, потому что функция только печатает",
            "Словарь нельзя передавать функции",
            "Метод upper работает только внутри return",
          ]}
          correctIndex={0}
          explanation="Напечатанная строка не стала возвращённым значением."
          fix={
            'def get_task_title(task):\n' +
            '    return task["title"]\n\n' +
            'title = get_task_title({"title": "SQL"})\n' +
            'print(title.upper())'
          }
        />
      </Section>

      <Section number="04" title="Чистый результат и побочный эффект">
        <Lead>
          Побочный эффект — изменение, заметное вне возвращённого значения: изменение списка, запись файла,
          печать или изменение глобальной переменной.
        </Lead>

        <TypeCards>
          <TypeCard badge="чистая" title="Возвращает новое значение" code={'def normalize(title):\n    return title.strip()'}>
            Для одинакового входа возвращает одинаковый результат и не меняет внешнее состояние.
          </TypeCard>
          <TypeCard badge="эффект" badgeTone="float" title="Изменяет объект" code={'def add_task(tasks, task):\n    tasks.append(task)'}>
            Изменение списка видно вызывающему коду.
          </TypeCard>
          <TypeCard badge="интерфейс" badgeTone="str" title="Печатает" code={'def show_message(text):\n    print(text)'}>
            Результат наблюдается в терминале, а не возвращается как данные.
          </TypeCard>
        </TypeCards>

        <TrueFalse
          statement={
            <>
              Побочный эффект всегда является ошибкой и должен быть полностью запрещён.
            </>
          }
          isTrue={false}
          explanation="Приложению нужны эффекты, но они должны быть намеренными, ограниченными и понятными по контракту."
        />

        <RecallCard
          question="Почему полезно отделять calculate_statistics() от show_statistics()?"
          answer={
            <p>
              Первая функция может вернуть словарь с числами и легко проверяться. Вторая отвечает только за
              отображение. Изменение текста интерфейса не затрагивает формулу расчёта.
            </p>
          }
        />
      </Section>

      <Section number="05" title="Ранний return делает особые случаи видимыми">
        <Lead>
          Ранний возврат завершает функцию, когда продолжать основной сценарий бессмысленно. Это уменьшает
          вложенность и показывает защитные условия в начале.
        </Lead>

        <CompareSolutions
          question="Какая версия проще читается сверху вниз?"
          left={{
            title: "Глубокая вложенность",
            code:
              'def completion_rate(tasks):\n' +
              '    if tasks:\n' +
              '        completed = 0\n' +
              '        for task in tasks:\n' +
              '            if task["is_done"]:\n' +
              '                completed += 1\n' +
              '        return completed / len(tasks) * 100\n' +
              '    else:\n' +
              '        return 0',
            note: "Основной сценарий находится внутри большого if.",
          }}
          right={{
            title: "Защитный возврат",
            code:
              'def completion_rate(tasks):\n' +
              '    if not tasks:\n' +
              '        return 0\n\n' +
              '    completed = 0\n' +
              '    for task in tasks:\n' +
              '        if task["is_done"]:\n' +
              '            completed += 1\n' +
              '    return completed / len(tasks) * 100',
            note: "Пустой список обработан сразу, основной путь не вложен.",
          }}
          preferred="right"
          explanation="Особый случай завершает функцию в начале, а основной алгоритм остаётся на одном уровне."
        />

        <CodeSequence
          title="Соберите функцию безопасного поиска"
          prompt="Функция должна вернуть найденную задачу или None."
          pieces={[
            { id: "def", code: "def find_task(tasks, task_id):" },
            { id: "loop", code: "    for task in tasks:" },
            { id: "check", code: '        if task["id"] == task_id:' },
            { id: "found", code: "            return task" },
            { id: "missing", code: "    return None" },
          ]}
          correctOrder={["def", "loop", "check", "found", "missing"]}
          explanation="return None находится после полного цикла, поэтому поиск проверяет все записи."
        />
      </Section>

      <Section number="06" title="Проектируем результат до тела функции">
        <Lead>
          Перед написанием кода полезно записать примеры вызовов. Они заставляют заранее решить, что функция
          возвращает в обычном, граничном и ошибочном сценарии.
        </Lead>

        <CodeBlock
          caption="контракт через примеры"
          code={
            '# find_task(tasks, 2) -> словарь задачи\n' +
            '# find_task(tasks, 999) -> None\n\n' +
            '# is_valid_priority(1) -> True\n' +
            '# is_valid_priority(5) -> True\n' +
            '# is_valid_priority(0) -> False\n\n' +
            '# format_task(task) -> строка\n' +
            '# исходный task не изменяется'
          }
        />

        <MethodGrid
          rows={[
            [<>обычный случай</>, "типичное допустимое значение"],
            [<>нижняя граница</>, "минимальное допустимое значение"],
            [<>верхняя граница</>, "максимальное допустимое значение"],
            [<>пустой ввод</>, "пустая строка или коллекция"],
            [<>отсутствие</>, "объект не найден"],
          ]}
        />

        <FillBlank
          prompt="Завершите контракт проверки приоритета."
          before={'def is_valid_priority(priority):\n    return '}
          after={''}
          options={["1 <= priority <= 5", "priority == 5", "bool(priority)"]}
          answer="1 <= priority <= 5"
          explanation="Контракт включает обе границы диапазона от 1 до 5."
        />
      </Section>

      <Section number="07" title="Практикум: функции слоя правил StudyHub">
        <Lead>
          Перепишите три функции так, чтобы интерфейс не был смешан с вычислением: проверка приоритета, поиск задачи
          и расчёт статистики.
        </Lead>

        <CodeBlock
          caption="целевые контракты"
          code={
            'def is_valid_priority(priority):\n' +
            '    return 1 <= priority <= 5\n\n' +
            'def find_task(tasks, task_id):\n' +
            '    for task in tasks:\n' +
            '        if task["id"] == task_id:\n' +
            '            return task\n' +
            '    return None\n\n' +
            'def calculate_statistics(tasks):\n' +
            '    total = len(tasks)\n' +
            '    completed = 0\n' +
            '    for task in tasks:\n' +
            '        if task["is_done"]:\n' +
            '            completed += 1\n' +
            '    return {"total": total, "completed": completed}'
          }
        />

        <BugHunt
          code={
            'def calculate_statistics(tasks):\n' +
            '    completed = 0\n' +
            '    for task in tasks:\n' +
            '        if task["is_done"]:\n' +
            '            completed += 1\n' +
            '    print(completed)'
          }
          question="Что мешает использовать результат в другой функции?"
          options={[
            "Значение печатается, но не возвращается",
            "Цикл for нельзя использовать в функции",
            "completed должен быть строкой",
          ]}
          correctIndex={0}
          explanation="Интерфейс получает вывод, но вызывающий код получает None."
          fix={
            'def calculate_statistics(tasks):\n' +
            '    completed = 0\n' +
            '    for task in tasks:\n' +
            '        if task["is_done"]:\n' +
            '            completed += 1\n' +
            '    return completed'
          }
        />
      </Section>

      <Section number="08" title="Проверьте контракт функции">
        <div className="lesson-check-group">
          <QuizCard
            question="Что возвращает функция без явного return?"
            options={["None", "0", "Последний print"]}
            correctIndex={0}
            explanation="Python неявно возвращает None."
          />
          <QuizCard
            question="Что является побочным эффектом?"
            options={["Изменение переданного списка", "Создание локальной переменной", "Сравнение чисел"]}
            correctIndex={0}
            explanation="Изменение списка заметно вне функции."
          />
          <QuizCard
            question="Где лучше обрабатывать пустой список?"
            options={["Явным особым случаем контракта", "Случайным try/except", "Нигде"]}
            correctIndex={0}
            explanation="Поведение для пустого входа должно быть заранее определено."
          />
        </div>

        <KeyTakeaways
          points={[
            <>Контракт описывает вход, правило, результат и побочные эффекты.</>,
            <><code>return</code> передаёт значение к месту вызова.</>,
            <><code>print</code> отображает данные, но не заменяет return.</>,
            <>Побочные эффекты допустимы, если они явны и ограничены.</>,
            <>Ранний return делает особые случаи заметнее.</>,
            <>Примеры вызовов помогают спроектировать функцию до реализации.</>,
          ]}
        />

        <PracticeCta text="Опишите контракты is_valid_priority(), find_task() и calculate_statistics(), реализуйте их без input/print и проверьте минимум по три сценария для каждой." />
      </Section>
    </RichLesson>
  );
}

// 23. Позиционные, именованные аргументы и значения по умолчанию
