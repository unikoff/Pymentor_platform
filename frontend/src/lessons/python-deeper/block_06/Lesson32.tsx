import {
  GitBranch,
  Package,
} from "lucide-react";
import {
  BugHunt,
  Callout,
  CodeBlock,
  CodeSequence,
  CompareSolutions,
  KeyTakeaways,
  Lead,
  MethodGrid,
  PracticeCta,
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
      <TheoryBridge link={"Пакет объединяет связанные модули, а направление импортов показывает, какая часть знает о какой и почему."} boundary={"__init__.py не лечит циклический импорт автоматически: цикл исчезает после разделения перепутанных ответственностей."} />

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
