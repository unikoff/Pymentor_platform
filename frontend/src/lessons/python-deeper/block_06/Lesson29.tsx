import {
  AlertTriangle,
  ShieldCheck,
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
      <TheoryBridge link={"После чтения traceback отделяем ожидаемый сбой от дефекта: try окружает рискованную операцию, конкретный except даёт понятную реакцию."} boundary={"Голый except и широкий Exception делают программу тише, но скрывают неожиданные ошибки."} />

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
