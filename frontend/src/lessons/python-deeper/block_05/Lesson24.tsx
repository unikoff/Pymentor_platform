import {
  AlertTriangle,
  Layers,
} from "lucide-react";
import {
  BugHunt,
  Callout,
  CodeSequence,
  CompareSolutions,
  FillBlank,
  KeyTakeaways,
  Lead,
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

// 24. Область видимости и изменяемые объекты
export function Lesson24({ module }: { module?: string }) {
  return (
    <RichLesson>
      <RichHero
        chip={module ?? "Блок 5 · Функции и поток данных"}
        title="Область видимости и изменяемые объекты"
        intro="Разберём, где живут переменные, почему локальное имя не видно снаружи, как передача списка отличается от передачи числа и почему изменяемое значение по умолчанию может связывать независимые вызовы функции."
        tags={[
          { icon: <Layers size={14} />, label: "локальная и внешняя область" },
          { icon: <AlertTriangle size={14} />, label: "изменяемые значения" },
        ]}
      />
      <TheoryBridge link={"Функция получает объекты через имена, поэтому важно различать локальную переменную, переприсваивание и изменение самого списка."} boundary={"Глобальная переменная доступна, но скрывает зависимость; полезнее показывать нужные данные в параметрах."} />

      <Section number="01" title="Имя существует внутри определённой области">
        <Lead>
          Область видимости определяет, где имя можно использовать. Параметры и переменные, созданные внутри
          функции, обычно локальны и исчезают из доступного пространства после завершения вызова.
        </Lead>

        <div className="lesson-route">
          <ol>
            <li><strong>Локальные имена:</strong> параметры и переменные одного вызова функции.</li>
            <li><strong>Внешние имена:</strong> значения, созданные на уровне файла.</li>
            <li><strong>Передача объектов:</strong> параметр получает ссылку на переданный объект.</li>
            <li><strong>Безопасные defaults:</strong> изменяемый объект создаётся внутри вызова, а не в def.</li>
          </ol>
          <p>В конце вы устраните глобальное состояние из части Console Planner и исправите опасный default.</p>
        </div>

        <Callout tone="info">
          Область видимости относится к именам, а изменяемость — к объектам. Эти темы связаны, но отвечают на разные вопросы.
        </Callout>
      </Section>

      <Section number="02" title="Локальная переменная принадлежит вызову">
        <Lead>
          Каждый вызов функции получает собственный набор локальных имён. Значение параметра одного вызова не
          смешивается со значением следующего.
        </Lead>

        <StepThrough
          code={
            'def normalize_title(title):\n' +
            '    cleaned = title.strip()\n' +
            '    return cleaned\n\n' +
            'first = normalize_title("  SQL  ")\n' +
            'second = normalize_title("  Git  ")'
          }
          steps={[
            { line: 4, note: "Первый вызов создаёт локальный title.", vars: { title: '"  SQL  "' } },
            { line: 1, note: "Создаётся локальный cleaned первого вызова.", vars: { cleaned: '"SQL"' } },
            { line: 5, note: "Второй вызов начинает новый локальный набор имён.", vars: { title: '"  Git  "' } },
            { line: 1, note: "cleaned второго вызова не связан с первым.", vars: { cleaned: '"Git"' } },
          ]}
        />

        <BugHunt
          code={
            'def normalize_title(title):\n' +
            '    cleaned = title.strip()\n' +
            '    return cleaned\n\n' +
            'print(cleaned)'
          }
          question="Почему последняя строка вызывает NameError?"
          options={[
            "cleaned является локальным именем функции",
            "strip удалил переменную",
            "return запрещает print",
          ]}
          correctIndex={0}
          explanation="Имя cleaned доступно только внутри тела функции."
          fix={
            'def normalize_title(title):\n' +
            '    cleaned = title.strip()\n' +
            '    return cleaned\n\n' +
            'result = normalize_title("  SQL  ")\n' +
            'print(result)'
          }
        />

        <RecallCard
          question="Почему параметр title можно использовать внутри функции, хотя снаружи переменная могла называться raw_title?"
          answer={
            <p>
              При вызове передаётся объект, а внутри функции он связывается с локальным именем параметра
              <code>title</code>. Внешнее имя не обязано совпадать с параметром.
            </p>
          }
        />
      </Section>

      <Section number="03" title="Внешняя переменная читается, но зависимость может быть скрыта">
        <Lead>
          Функция может прочитать имя из внешней области, однако такая зависимость не видна в сигнатуре и усложняет
          повторное использование.
        </Lead>

        <CompareSolutions
          question="Какая функция честнее показывает необходимые данные?"
          left={{
            title: "Скрытая зависимость",
            code:
              'tasks = []\n\n' +
              'def count_tasks():\n' +
              '    return len(tasks)',
            note: "По сигнатуре кажется, что функция ничего не получает.",
          }}
          right={{
            title: "Явный параметр",
            code:
              'def count_tasks(tasks):\n' +
              '    return len(tasks)',
            note: "Можно передать любой список и легко проверить результат.",
          }}
          preferred="right"
          explanation="Явная зависимость делает функцию переносимой и предсказуемой."
        />

        <TrueFalse
          statement={
            <>
              Если функция только читает глобальную переменную, глобальное состояние перестаёт быть зависимостью.
            </>
          }
          isTrue={false}
          explanation="Результат всё равно зависит от внешнего объекта, который не указан в параметрах."
        />

        <Callout>
          Константы конфигурации вроде <code>MIN_PRIORITY = 1</code> могут читаться с уровня модуля. Изменяемое
          состояние приложения лучше передавать явно.
        </Callout>
      </Section>

      <Section number="04" title="Присваивание внутри функции создаёт локальное имя">
        <Lead>
          Если внутри функции выполнить присваивание, Python обычно считает это имя локальным. Внешняя переменная с
          тем же названием не меняется автоматически.
        </Lead>

        <PredictOutput
          code={
            'status = "new"\n\n' +
            'def change_status():\n' +
            '    status = "done"\n' +
            '    print(status)\n\n' +
            'change_status()\n' +
            'print(status)'
          }
          output={'done\nnew'}
          hint="Внутри функции создаётся отдельное локальное имя status."
        />

        <CompareSolutions
          question="Как лучше изменить статус конкретной задачи?"
          left={{
            title: "Изменять глобальное имя",
            code: 'global status\nstatus = "done"',
            note: "Функция зависит от одного конкретного внешнего имени.",
          }}
          right={{
            title: "Получить и вернуть значение",
            code: 'def normalize_status(status):\n    return status.strip().lower()',
            note: "Контракт работает с любым переданным статусом.",
          }}
          preferred="right"
          explanation="Для учебного проекта global почти всегда можно заменить параметром, return или явным изменением объекта."
        />

        <Callout tone="info">
          Ключевое слово <code>global</code> существует, но в этом блоке не является основным инструментом. Сначала
          учимся проектировать явную передачу данных.
        </Callout>
      </Section>

      <Section number="05" title="Параметр получает объект, а не автоматическую копию">
        <Lead>
          При вызове функции параметр связывается с переданным объектом. Если объект изменяемый и функция меняет его
          на месте, изменение видно снаружи.
        </Lead>

        <StepThrough
          code={
            'def add_task(tasks, title):\n' +
            '    tasks.append({"title": title})\n\n' +
            'project_tasks = []\n' +
            'add_task(project_tasks, "SQL")\n' +
            'print(project_tasks)'
          }
          steps={[
            { line: 3, note: "Создан один пустой список.", vars: { project_tasks: "→ []" } },
            { line: 4, note: "Параметр tasks указывает на тот же список.", vars: { tasks: "→ тот же объект" } },
            { line: 1, note: "append меняет общий список на месте.", vars: { project_tasks: '[{"title": "SQL"}]' } },
            { line: 5, note: "Снаружи видно изменение объекта.", vars: { вывод: '[{"title": "SQL"}]' } },
          ]}
        />

        <TypeCards>
          <TypeCard badge="immutable" title="Число" code={'def increment(value):\n    value += 1'}>
            Операция связывает локальное имя с новым числом. Внешнее число не меняется.
          </TypeCard>
          <TypeCard badge="mutable" badgeTone="float" title="Список" code={'def append_item(items):\n    items.append(1)'}>
            Метод меняет переданный объект, поэтому эффект виден снаружи.
          </TypeCard>
          <TypeCard badge="new copy" badgeTone="str" title="Новый список" code={'result = items.copy()\nresult.append(1)'}>
            Внешний список верхнего уровня остаётся прежним.
          </TypeCard>
        </TypeCards>

        <TrueFalse
          statement={
            <>
              Передача списка в функцию автоматически создаёт его независимую копию.
            </>
          }
          isTrue={false}
          explanation="Параметр получает ссылку на тот же объект, пока функция явно не создаст копию."
        />
      </Section>

      <Section number="06" title="Изменить объект или вернуть новую версию">
        <Lead>
          Оба подхода допустимы, но контракт должен быть понятен из имени и использования функции.
        </Lead>

        <CompareSolutions
          question="Чем отличаются функции?"
          left={{
            title: "Команда изменяет состояние",
            code:
              'def add_task(tasks, task):\n' +
              '    tasks.append(task)\n' +
              '    return None',
            note: "Эффект — изменение исходного списка.",
          }}
          right={{
            title: "Преобразование возвращает новое",
            code:
              'def with_task(tasks, task):\n' +
              '    result = tasks.copy()\n' +
              '    result.append(task)\n' +
              '    return result',
            note: "Исходный внешний список верхнего уровня не меняется.",
          }}
          preferred="both"
          explanation="Важно не смешивать контракты и не заставлять вызывающий код угадывать, где произошло изменение."
        />

        <BugHunt
          code={
            'def with_task(tasks, task):\n' +
            '    result = tasks\n' +
            '    result.append(task)\n' +
            '    return result'
          }
          question="Почему исходный список всё равно изменится?"
          options={[
            "result является вторым именем того же списка",
            "return всегда меняет аргументы",
            "append создаёт глобальную переменную",
          ]}
          correctIndex={0}
          explanation="Присваивание не создаёт копию изменяемого объекта."
          fix={
            'def with_task(tasks, task):\n' +
            '    result = tasks.copy()\n' +
            '    result.append(task)\n' +
            '    return result'
          }
        />
      </Section>

      <Section number="07" title="Опасный изменяемый аргумент по умолчанию">
        <Lead>
          Значения по умолчанию создаются один раз при выполнении строки <code>def</code>. Поэтому список в default
          может сохранять элементы между независимыми вызовами.
        </Lead>

        <StepThrough
          code={
            'def collect_title(title, titles=[]):\n' +
            '    titles.append(title)\n' +
            '    return titles\n\n' +
            'first = collect_title("SQL")\n' +
            'second = collect_title("Git")'
          }
          steps={[
            { line: 0, note: "При создании функции создаётся один список default.", vars: { titles: "→ []" } },
            { line: 4, note: "Первый вызов добавляет SQL в общий default.", vars: { first: '["SQL"]' } },
            { line: 5, note: "Второй вызов получает тот же список.", vars: { titles: '→ ["SQL"]' } },
            { line: 1, note: "Git добавляется к результату прошлого вызова.", vars: { second: '["SQL", "Git"]' } },
          ]}
        />

        <CompareSolutions
          question="Как создать новый список для каждого вызова?"
          left={{
            title: "Общий изменяемый default",
            code: 'def collect(title, titles=[]):\n    titles.append(title)\n    return titles',
            note: "Список переиспользуется между вызовами.",
          }}
          right={{
            title: "None как сигнал",
            code:
              'def collect(title, titles=None):\n' +
              '    if titles is None:\n' +
              '        titles = []\n' +
              '    titles.append(title)\n' +
              '    return titles',
            note: "Новый список создаётся внутри конкретного вызова.",
          }}
          preferred="right"
          explanation="None является неизменяемым маркером отсутствия переданного списка."
        />

        <FillBlank
          prompt="Заполните безопасную проверку отсутствующего списка."
          before={'def collect(title, titles=None):\n    if titles '}
          after={':\n        titles = []'}
          options={["is None", "== []", "is False"]}
          answer="is None"
          explanation="Мы проверяем специальный маркер отсутствия аргумента, а не содержимое списка."
        />
      </Section>

      <Section number="08" title="Практика и контрольная точка">
        <Lead>
          Исправьте функции проекта так, чтобы изменяемое состояние передавалось явно, а преобразования не меняли
          входные данные неожиданно.
        </Lead>

        <CodeSequence
          title="Соберите безопасную функцию добавления в копию"
          prompt="Исходный список должен остаться прежним."
          pieces={[
            { id: "def", code: "def with_added_task(tasks, task):" },
            { id: "copy", code: "    result = tasks.copy()" },
            { id: "append", code: "    result.append(task)" },
            { id: "return", code: "    return result" },
          ]}
          correctOrder={["def", "copy", "append", "return"]}
          explanation="Копия создаётся до изменения и возвращается как новая версия состояния."
        />

        <div className="lesson-check-group">
          <QuizCard
            question="Где доступна локальная переменная?"
            options={["Внутри её функции", "Во всех файлах проекта", "Только в print"]}
            correctIndex={0}
            explanation="Локальное имя принадлежит области вызова функции."
          />
          <QuizCard
            question="Что произойдёт при append внутри функции?"
            options={["Переданный список изменится", "Создастся копия", "Изменится только имя параметра"]}
            correctIndex={0}
            explanation="append меняет сам объект."
          />
          <QuizCard
            question="Почему default=[] опасен?"
            options={["Один список используется повторно", "Списки нельзя передавать", "Он всегда пустой"]}
            correctIndex={0}
            explanation="Объект default создаётся один раз при определении функции."
          />
        </div>

        <KeyTakeaways
          points={[
            <>Параметры и переменные функции обычно имеют локальную область видимости.</>,
            <>Внешнее изменяемое состояние лучше передавать явным параметром.</>,
            <>Присваивание локальному имени не изменяет одноимённую внешнюю переменную.</>,
            <>Параметр получает ссылку на переданный объект, а не автоматическую копию.</>,
            <>Методы списка могут создавать намеренный побочный эффект.</>,
            <>Для изменяемого default используется <code>None</code> и создание объекта внутри функции.</>,
          ]}
        />

        <PracticeCta text="Найдите в Console Planner глобальный tasks, передайте его минимум в три функции явно и исправьте функцию с изменяемым значением по умолчанию через None." />
      </Section>
    </RichLesson>
  );
}

// 25. *args, **kwargs и распаковка
