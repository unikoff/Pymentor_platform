import {
  Bug,
  GitBranch,
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
      <TheoryBridge link={"Когда функции вызывают друг друга, ошибка проходит по стеку; traceback показывает этот путь и тип нарушенного ожидания."} boundary={"Длинный traceback не означает много причин: начинайте с последней строки и места в своём коде."} />

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
