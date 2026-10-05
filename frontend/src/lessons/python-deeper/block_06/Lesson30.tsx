import {
  AlertTriangle,
  Wrench,
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
      <TheoryBridge link={"У конструкции обработки несколько разных ролей: else продолжает успех, finally делает обязательное завершение, raise сообщает о нарушенном правиле."} boundary={"finally не исправляет ошибку и не заменяет except; он нужен только для действия при любом исходе."} />

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
