import {
  FolderGit2,
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
      <TheoryBridge link={"Когда функций становится много, модуль задаёт границу ответственности; import выполняет верхний уровень файла, а __name__ отделяет импорт от запуска."} boundary={"import не копирует текст: побочный эффект наверху модуля сработает при импорте, поэтому запуск нельзя оставлять без защиты."} />

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
