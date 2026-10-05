import {
  Puzzle,
  Scale,
} from "lucide-react";
import {
  BugHunt,
  Callout,
  CodeBlock,
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

// 23. Позиционные, именованные аргументы и значения по умолчанию
export function Lesson23({ module }: { module?: string }) {
  return (
    <RichLesson>
      <RichHero
        chip={module ?? "Блок 5 · Функции и поток данных"}
        title="Позиционные, именованные аргументы и значения по умолчанию"
        intro="Научимся вызывать одну функцию разными способами: передавать значения по позиции и по имени, проектировать безопасные значения по умолчанию и читать TypeError как сообщение о нарушенном контракте вызова."
        tags={[
          { icon: <Puzzle size={14} />, label: "позиция и имя" },
          { icon: <Scale size={14} />, label: "значения по умолчанию" },
        ]}
      />
      <TheoryBridge link={"Способ вызова входит в контракт: позиционные аргументы связываются порядком, именованные — названием, значение по умолчанию делает параметр необязательным."} boundary={"Именованный аргумент не отменяет обязательность параметра: имя должно совпасть, а нужные данные всё равно передаются."} />

      <Section number="01" title="Одна функция, несколько форм вызова">
        <Lead>
          Аргументы можно сопоставить параметрам по порядку или по имени. Оба способа вызывают одну и ту же функцию,
          но отличаются читаемостью и устойчивостью к ошибкам.
        </Lead>

        <div className="lesson-route">
          <ol>
            <li><strong>Позиционный вызов:</strong> значения сопоставляются слева направо.</li>
            <li><strong>Именованный вызов:</strong> значение явно связывается с параметром.</li>
            <li><strong>Значение по умолчанию:</strong> параметр становится необязательным для вызова.</li>
            <li><strong>Проверка контракта:</strong> TypeError объясняет пропущенные, лишние и повторные значения.</li>
          </ol>
          <p>В практике вы улучшите функции создания и фильтрации задач StudyHub.</p>
        </div>

        <Callout tone="info">
          Чем больше параметров одного типа, тем полезнее именованные аргументы: они показывают смысл каждого значения прямо в вызове.
        </Callout>
      </Section>

      <Section number="02" title="Позиционные аргументы зависят от порядка">
        <Lead>
          При позиционном вызове первое значение получает первый параметр, второе — второй и так далее. Python не
          угадывает смысл по содержимому.
        </Lead>

        <StepThrough
          code={
            'def create_task(title, priority, is_done):\n' +
            '    return {\n' +
            '        "title": title,\n' +
            '        "priority": priority,\n' +
            '        "is_done": is_done,\n' +
            '    }\n\n' +
            'task = create_task("SQL", 4, False)'
          }
          steps={[
            { line: 7, note: 'Первый аргумент попадает в title.', vars: { title: '"SQL"' } },
            { line: 7, note: 'Второй аргумент попадает в priority.', vars: { priority: "4" } },
            { line: 7, note: 'Третий аргумент попадает в is_done.', vars: { is_done: "False" } },
            { line: 1, note: 'Функция собирает словарь из сопоставленных значений.', vars: { task: "dict" } },
          ]}
        />

        <PredictOutput
          code={
            'def describe_range(start, end):\n' +
            '    return f"{start}..{end}"\n\n' +
            'print(describe_range(1, 5))\n' +
            'print(describe_range(5, 1))'
          }
          output={'1..5\n5..1'}
          hint="Порядок аргументов не исправляется автоматически."
        />

        <BugHunt
          code={'task = create_task(4, "SQL", False)'}
          question="Почему словарь получится логически неверным, хотя вызов может выполниться?"
          options={[
            "Позиции title и priority перепутаны",
            "Boolean нельзя передавать третьим",
            "Функция принимает только именованные аргументы",
          ]}
          correctIndex={0}
          explanation="Python сопоставляет значения по порядку и не знает, что строка ожидалась раньше числа."
          fix={'task = create_task("SQL", 4, False)'}
        />
      </Section>

      <Section number="03" title="Именованные аргументы показывают намерение">
        <Lead>
          Именованный аргумент записывается как <code>parameter=value</code>. Порядок таких аргументов можно менять,
          потому что связь указана явно.
        </Lead>

        <CompareSolutions
          question="Какой вызов легче проверить глазами?"
          left={{
            title: "Только позиции",
            code: 'create_task("SQL", 4, False)',
            note: "Нужно помнить порядок трёх параметров.",
          }}
          right={{
            title: "Явные имена",
            code: 'create_task(title="SQL", priority=4, is_done=False)',
            note: "Назначение каждого значения видно в месте вызова.",
          }}
          preferred="right"
          explanation="Именованные аргументы особенно полезны для флагов, числовых настроек и длинных вызовов."
        />

        <TrueFalse
          statement={
            <>
              Вызов <code>create_task(is_done=False, title="SQL", priority=4)</code> допустим, если все параметры
              переданы по имени.
            </>
          }
          isTrue={true}
          explanation="Именованные аргументы сопоставляются по именам, поэтому их порядок не определяет результат."
        />

        <MatchPairs
          prompt="Соедините форму вызова с её свойством."
          pairs={[
            { left: 'filter_tasks(tasks, False, 5)', right: "кратко, но смысл чисел и флага скрыт" },
            { left: 'filter_tasks(tasks, is_done=False, limit=5)', right: "смысл значений виден" },
            { left: 'filter_tasks(tasks=tasks, limit=5)', right: "все переданные параметры названы" },
          ]}
          explanation="Выбор формы вызова зависит от читаемости, а не от стремления всегда писать меньше символов."
        />
      </Section>

      <Section number="04" title="Сначала позиционные, затем именованные">
        <Lead>
          В обычном вызове позиционные аргументы должны идти раньше именованных. После явного имени возвращаться к
          безымянной позиции нельзя.
        </Lead>

        <CodeBlock
          caption="допустимые формы"
          code={
            'create_task("SQL", 4, is_done=False)\n' +
            'create_task("SQL", priority=4, is_done=False)\n' +
            'create_task(title="SQL", priority=4, is_done=False)'
          }
        />

        <BugHunt
          code={'create_task(title="SQL", 4, False)'}
          question="Почему Python не принимает такой вызов?"
          options={[
            "Позиционные аргументы стоят после именованного",
            "title нельзя передавать по имени",
            "False нужно записать строкой",
          ]}
          correctIndex={0}
          explanation="После title=... оставшиеся значения тоже нужно связать с именами."
          fix={'create_task(title="SQL", priority=4, is_done=False)'}
        />

        <FillBlank
          prompt="Завершите читаемый смешанный вызов."
          before={'task = create_task("SQL", '}
          after={', is_done=False)'}
          options={["priority=4", "4=priority", '"priority"']}
          answer="priority=4"
          explanation="Первый аргумент передан позиционно, остальные — по именам."
        />
      </Section>

      <Section number="05" title="Значение по умолчанию делает параметр необязательным">
        <Lead>
          Значение справа от <code>=</code> в определении используется только тогда, когда вызывающий код не передал
          собственное значение.
        </Lead>

        <CodeBlock
          caption="новая задача по умолчанию не выполнена"
          code={
            'def create_task(title, priority=3, is_done=False):\n' +
            '    return {\n' +
            '        "title": title.strip(),\n' +
            '        "priority": priority,\n' +
            '        "is_done": is_done,\n' +
            '    }\n\n' +
            'first = create_task("Git")\n' +
            'second = create_task("SQL", priority=5)'
          }
        />

        <PredictOutput
          code={
            'def label(title, prefix="TASK"):\n' +
            '    return f"[{prefix}] {title}"\n\n' +
            'print(label("SQL"))\n' +
            'print(label("Ошибка", prefix="BUG"))'
          }
          output={'[TASK] SQL\n[BUG] Ошибка'}
          hint="Во втором вызове значение по умолчанию заменяется переданным аргументом."
        />

        <Callout>
          Значение по умолчанию должно выражать нормальное поведение домена. Не делайте важный параметр
          необязательным только ради короткого вызова.
        </Callout>
      </Section>

      <Section number="06" title="Обязательные параметры идут раньше необязательных">
        <Lead>
          Python должен однозначно понимать, какие значения можно пропустить. Поэтому параметр без значения по
          умолчанию нельзя ставить после обычного необязательного параметра.
        </Lead>

        <BugHunt
          code={'def create_task(priority=3, title):\n    return {"title": title, "priority": priority}'}
          question="Почему определение функции содержит SyntaxError?"
          options={[
            "Обязательный title стоит после параметра со значением по умолчанию",
            "Словарь нельзя возвращать из функции",
            "priority не может равняться 3",
          ]}
          correctIndex={0}
          explanation="Сначала записываются обязательные позиционные параметры, затем параметры со значениями по умолчанию."
          fix={'def create_task(title, priority=3):\n    return {"title": title, "priority": priority}'}
        />

        <MethodGrid
          rows={[
            [<>title</>, "обязательный параметр: без него задачу создать нельзя"],
            [<>priority=3</>, "обычный приоритет по умолчанию"],
            [<>is_done=False</>, "новая задача открыта"],
            [<>category=None</>, "категория может отсутствовать"],
          ]}
        />

        <RecallCard
          question="Почему параметр title не должен иметь пустую строку по умолчанию?"
          answer={
            <p>
              Название является обязательной частью модели. Значение <code>title=""</code> позволило бы вызвать
              функцию без важных данных и перенесло бы ошибку дальше по программе.
            </p>
          }
        />
      </Section>

      <Section number="07" title="TypeError объясняет нарушение вызова">
        <Lead>
          Ошибки вызова полезны: они показывают, что количество или способ передачи аргументов не соответствует
          сигнатуре функции.
        </Lead>

        <TypeCards>
          <TypeCard badge="missing" title="Не хватает аргумента" code={'create_task()'}>
            Обязательный параметр <code>title</code> не получил значение.
          </TypeCard>
          <TypeCard badge="multiple" badgeTone="float" title="Значение передано дважды" code={'create_task("SQL", title="Git")'}>
            <code>title</code> получил позиционное и именованное значение одновременно.
          </TypeCard>
          <TypeCard badge="unexpected" badgeTone="str" title="Неизвестное имя" code={'create_task(name="SQL")'}>
            В сигнатуре нет параметра <code>name</code>.
          </TypeCard>
        </TypeCards>

        <BugHunt
          code={'create_task("SQL", 5, priority=4)'}
          question="Какой параметр получает два значения?"
          options={["priority", "title", "is_done"]}
          correctIndex={0}
          explanation="Позиционное число 5 уже связано с priority, затем priority=4 передаёт второе значение."
          fix={'create_task("SQL", priority=4)'}
        />
      </Section>

      <Section number="08" title="Практика StudyHub и проверка понимания">
        <Lead>
          Обновите фабрику задач и функцию фильтрации так, чтобы вызовы были короткими для обычного случая и
          понятными для дополнительных настроек.
        </Lead>

        <CodeBlock
          caption="целевой вариант"
          code={
            'def create_task(title, priority=3, is_done=False):\n' +
            '    return {\n' +
            '        "title": title.strip(),\n' +
            '        "priority": priority,\n' +
            '        "is_done": is_done,\n' +
            '    }\n\n' +
            'def filter_tasks(tasks, is_done=None, min_priority=1):\n' +
            '    result = []\n' +
            '    for task in tasks:\n' +
            '        status_ok = is_done is None or task["is_done"] == is_done\n' +
            '        priority_ok = task["priority"] >= min_priority\n' +
            '        if status_ok and priority_ok:\n' +
            '            result.append(task)\n' +
            '    return result'
          }
        />

        <div className="lesson-check-group">
          <QuizCard
            question="Что определяет позиционный аргумент?"
            options={["Порядок", "Тип значения", "Имя переменной снаружи"]}
            correctIndex={0}
            explanation="Значения связываются с параметрами слева направо."
          />
          <QuizCard
            question="Когда используется значение по умолчанию?"
            options={["Когда аргумент не передан", "Всегда", "Только при ошибке"]}
            correctIndex={0}
            explanation="Переданное значение заменяет default."
          />
          <QuizCard
            question="Почему именованные аргументы полезны для bool?"
            options={["Показывают смысл True/False", "Изменяют тип", "Ускоряют Python"]}
            correctIndex={0}
            explanation="Вызов is_done=False читается однозначнее отдельного False."
          />
        </div>

        <KeyTakeaways
          points={[
            <>Позиционные аргументы сопоставляются по порядку.</>,
            <>Именованные аргументы связываются с параметрами явно.</>,
            <>Позиционные аргументы записываются раньше именованных.</>,
            <>Значение по умолчанию используется только при отсутствии аргумента.</>,
            <>Обязательные параметры стоят раньше обычных параметров с default.</>,
            <>TypeError часто указывает на конкретное нарушение контракта вызова.</>,
          ]}
        />

        <PracticeCta text="Добавьте значения по умолчанию в create_task(), перепишите четыре вызова с именованными аргументами и разберите три специально созданных TypeError." />
      </Section>
    </RichLesson>
  );
}

// 24. Область видимости и изменяемые объекты
