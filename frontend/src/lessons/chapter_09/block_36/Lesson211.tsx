import { Bug, Wrench } from "lucide-react";
import { BranchExplorer, BugHunt, Callout, CodeBlock, CodeSequence, CompareSolutions, FillBlank, KeyTakeaways, Lead, MatchPairs, MethodGrid, PracticeCta, QuizCard, RecallCard, RichHero, RichLesson, Section, StepThrough, TerminalDemo, TrueFalse, TypeCard, TypeCards } from "../../shared";
const BLOCK_TITLE = "Блок 36 · Финальное качество, портфолио и интервью";

export function Lesson211({ module }: { module?: string }) {
  return (
    <RichLesson>
      <RichHero
        variant="project"
        chip={module ?? BLOCK_TITLE}
        title={"Interview lab: Python, SQL, API и code review"}
        intro={"Проведём ограниченную по времени лабораторию, близкую к junior backend-интервью: уточним требования, прочитаем Python-код, найдём дефект, допишем отрицательный тест, составим SQL JOIN, реализуем маленький endpoint и проведём code review."}
        tags={[
          { icon: <Bug size={14} />, label: "90 минут · рабочие задачи" },
          { icon: <Wrench size={14} />, label: "объяснить → проверить → улучшить" },
        ]}
      />

      <Callout tone="info">
        <strong>{"Связь с проектом."}</strong> {"Проект даёт знакомый контекст, но на интервью подсказок архитектуры может не быть. Нужна отдельная тренировка процесса: понять условие, назвать предположения, сделать минимальное изменение и доказать результат."}{" "}
        <strong>{"Важно не перепутать:"}</strong> {"Лаборатория не превращается в олимпиадный марафон или senior system design. Проверяются базовые рабочие действия и качество объяснения."}
      </Callout>

      <Section number="01" title={"Интервью проверяет процесс решения"}>
        <Lead>
          {"Проведём ограниченную по времени лабораторию, близкую к junior backend-интервью: уточним требования, прочитаем Python-код, найдём дефект, допишем отрицательный тест, составим SQL JOIN, реализуем маленький endpoint и проведём code review."}
        </Lead>

        <div className="lesson-route">
          <ol>
            <li>
              <strong>{"Уточнить"}:</strong> {"пересказать задачу, назвать вход, выход, ограничения и спорные случаи."}
            </li>
            <li>
              <strong>{"Предложить"}:</strong> {"сформулировать минимальное решение и оценить его сложность до кода."}
            </li>
            <li>
              <strong>{"Проверить"}:</strong> {"добавить пример, тест или EXPLAIN, который подтверждает поведение."}
            </li>
            <li>
              <strong>{"Объяснить"}:</strong> {"описать trade-off, обнаруженный риск и следующий шаг без оправданий."}
            </li>
          </ol>
          <p>{"Маршрут заканчивается проверяемым артефактом, а не только чтением теории."}</p>
        </div>

        <TypeCards>
          <TypeCard badge={"Python"} title={"Поток данных"}>
            {"Прочитать функцию, заметить mutability, exceptions и сложность."}
          </TypeCard>
          <TypeCard badge={"SQL"} badgeTone="float" title={"Связи и агрегаты"}>
            {"Написать SELECT/JOIN/GROUP BY и проверить строки без дубликатов."}
          </TypeCard>
          <TypeCard badge={"API"} badgeTone="str" title={"Контракт и границы"}>
            {"Реализовать endpoint с validation, status, permission и service call."}
          </TypeCard>
          <TypeCard badge={"Review"} title={"Риск и улучшение"}>
            {"Отделить blocker от suggestion и дать проверяемое исправление."}
          </TypeCard>
        </TypeCards>

        <RecallCard
          question={"Какой проверяемый результат должно дать это занятие?"}
          hint={"Назовите не тему, а конкретный artifact или evidence."}
          answer={<p>{"Результат должен воспроизводиться другим человеком и иметь успешный, ошибочный и диагностический сценарий."}</p>}
        />
      </Section>

      <Section number="02" title={"Таймлайн 90-минутной лаборатории"}>
        <Lead>
          {"Сначала фиксируем небольшую модель, которая помогает принимать решения. Термин ценен только тогда, когда его можно связать с наблюдаемым поведением проекта."}
        </Lead>

        <MethodGrid
          rows={[
            [<>{"5 минут"}</>, "прочитать условие, задать вопросы, сформулировать acceptance criteria"],
            [<>{"20 минут"}</>, "исправить Python defect и объяснить complexity"],
            [<>{"15 минут"}</>, "написать отрицательный pytest"],
            [<>{"20 минут"}</>, "собрать SQL SELECT/JOIN и проверить результат"],
            [<>{"15 минут"}</>, "реализовать небольшой FastAPI endpoint"],
            [<>{"15 минут"}</>, "провести code review и подвести итог"],
          ]}
        />

        <MatchPairs
          prompt={"Соедините элемент модели с его практической ролью."}
          leftTitle={"Элемент"}
          rightTitle={"Роль"}
          pairs={[
            { left: "5 минут", right: "прочитать условие, задать вопросы, сформулировать acceptance criteria" },
            { left: "20 минут", right: "исправить Python defect и объяснить complexity" },
            { left: "15 минут", right: "написать отрицательный pytest" },
            { left: "20 минут", right: "собрать SQL SELECT/JOIN и проверить результат" },
          ]}
          explanation={"Пары закрепляют не термин отдельно, а его место в рабочем процессе StudyHub."}
        />

        <TrueFalse
          statement={<>{"Во время интервью лучше молча писать код, чтобы не тратить время на объяснения."}</>}
          isTrue={false}
          explanation={"Интервьюер оценивает модель мышления. Короткие гипотезы, проверки и проговаривание trade-offs уменьшают риск неверно понять задачу."}
        />

        <Callout tone="info">
          {"Модель должна сокращать область поиска решения. Если после схемы всё равно непонятно, что запускать и проверять, схема слишком абстрактна."}
        </Callout>
      </Section>

      <Section number="03" title={"Читаем алгоритм и оцениваем сложность"}>
        <Lead>
          {"Разбираем минимальный рабочий фрагмент до интеграции. Сначала читаем контракт, затем прослеживаем значения и только после этого меняем одну деталь."}
        </Lead>

        <CodeBlock
          caption={"линейный поиск первого уникального slug"}

          code={
            "def first_unique_slug(slugs: list[str]) -> str | None:\n" +
            "    counts: dict[str, int] = {}\n" +
            "\n" +
            "    for slug in slugs:\n" +
            "        counts[slug] = counts.get(slug, 0) + 1\n" +
            "\n" +
            "    for slug in slugs:\n" +
            "        if counts[slug] == 1:\n" +
            "            return slug\n" +
            "\n" +
            "    return None\n" +
            "\n" +
            "\n" +
            "assert first_unique_slug([\"python\", \"sql\", \"python\"]) == \"sql\"\n" +
            "assert first_unique_slug([\"api\", \"api\"]) is None"
          }
        />


        <StepThrough
          code={
            "def first_unique_slug(slugs: list[str]) -> str | None:\n" +
            "    counts: dict[str, int] = {}\n" +
            "\n" +
            "    for slug in slugs:\n" +
            "        counts[slug] = counts.get(slug, 0) + 1\n" +
            "\n" +
            "    for slug in slugs:\n" +
            "        if counts[slug] == 1:\n" +
            "            return slug\n" +
            "\n" +
            "    return None\n" +
            "\n" +
            "\n" +
            "assert first_unique_slug([\"python\", \"sql\", \"python\"]) == \"sql\"\n" +
            "assert first_unique_slug([\"api\", \"api\"]) is None"
          }
          steps={[
            { line: 2, note: "Сначала создаётся словарь частот; один проход не теряет исходный порядок.", vars: { "time": "O(n)" } },
            { line: 4, note: "get(..., 0) отделяет отсутствующий ключ от уже встреченного slug.", vars: { "state": "counts" } },
            { line: 7, note: "Второй проход идёт по исходному списку и находит первое, а не любое уникальное значение.", vars: { "order": "preserved" } },
            { line: 10, note: "Явный None фиксирует сценарий отсутствия ответа.", vars: { "result": "str | None" } },
          ]}
        />

        <FillBlank
          prompt={"Какова временная сложность двух последовательных проходов по n элементам?"}
          before={""}
          after={""}
          options={["O(n)", "O(n²)", "O(log n)"]}
          answer={"O(n)"}
          explanation={"Два последовательных линейных прохода дают O(n + n), что упрощается до O(n)."}
        />

        <Callout tone="info">
          {"После заполнения измените одно входное значение, предскажите результат и только затем запускайте проверку."}
        </Callout>
      </Section>

      <Section number="04" title={"Оценка кода или полезный review"}>
        <Lead>
          {"Сравнение нужно не для выбора «красивого» кода, а для явного обсуждения контракта, риска и стоимости следующего изменения."}
        </Lead>

        <CompareSolutions
          question={"Какой комментарий code review помогает автору исправить риск?"}
          left={{
            title: "Оценка без доказательства",
            code: "Плохо. Перепиши этот метод.",
            note: "Не названы сценарий, последствие и критерий исправления.",
          }}
          right={{
            title: "Наблюдаемый риск",
            code: "Blocker: default `items=[]` разделяется между вызовами. Тест с двумя экземплярами воспроизводит утечку; используйте `None` или default_factory.",
            note: "Есть severity, причина, воспроизведение и направление исправления.",
          }}
          preferred="right"
          explanation={"Полезный review-комментарий связывает конкретный фрагмент с наблюдаемым дефектом и проверкой."}
        />

        <div className="lesson-practice-steps">
          <h3>{"Сначала назовите критерий"}</h3>
          <p>{"До выбора варианта сформулируйте, какое свойство проекта нужно сохранить: совместимость, безопасность, воспроизводимость или понятность."}</p>
          <h3>{"Затем найдите evidence"}</h3>
          <p>{"Подтвердите решение тестом, логом, планом запроса, clean start или повторяемым demo-сценарием."}</p>
          <h3>{"После этого зафиксируйте границу"}</h3>
          <p>{"Укажите, при каком изменении требований выбранный вариант перестанет быть достаточным."}</p>
        </div>

        <RecallCard
          question={"Почему более сложный вариант не считается автоматически более профессиональным?"}
          answer={<p>{"Профессиональность определяется соответствием риску и требованиям. Лишний механизм увеличивает стоимость поддержки без доказанной пользы."}</p>}
        />
      </Section>

      <Section number="05" title={"Диагностируем изменяемый default"}>
        <Lead>
          {"Финальное качество проявляется в работе со сбоями. Намеренно запускаем дефектный сценарий, объясняем причину и проверяем исправление отдельным evidence."}
        </Lead>

        <BugHunt
          code={
            "def add_tag(tag: str, tags: list[str] = []):\n" +
            "    tags.append(tag)\n" +
            "    return tags\n" +
            "\n" +
            "\n" +
            "print(add_tag(\"python\"))\n" +
            "print(add_tag(\"sql\"))"
          }
          question={"Почему второй вызов неожиданно содержит оба тега?"}
          options={[
            "Default list создаётся один раз и повторно используется",
            "append сортирует строки",
            "Аннотация list[str] копирует данные",
          ]}
          correctIndex={0}
          explanation={"Изменяемое default-значение живёт между вызовами функции."}
          fix={"def add_tag(\n    tag: str,\n    tags: list[str] | None = None,\n) -> list[str]:\n    result = [] if tags is None else list(tags)\n    result.append(tag)\n    return result"}
        />

        <div className="lesson-practice-steps">
          <h3>{"1. Воспроизведите"}</h3>
          <p>{"Сведите проблему к короткому сценарию и сохраните точный вход, команду и наблюдаемый результат."}</p>
          <h3>{"2. Найдите нарушенное ожидание"}</h3>
          <p>{"Не маскируйте симптом. Назовите контракт, который код нарушает, и слой, отвечающий за исправление."}</p>
          <h3>{"3. Защитите результат"}</h3>
          <p>{"Добавьте тест, проверку, runbook или diagnostic evidence, чтобы дефект не вернулся незаметно."}</p>
        </div>
      </Section>

      <Section number="06" title={"SQL, API и review в одном контексте"}>
        <Lead>
          {"Теперь переносим минимальную модель в StudyHub. Endpoint или infrastructure step остаётся координатором, а правило и диагностическая граница получают отдельное место."}
        </Lead>

        <CodeBlock
          caption={"SQL-задача: прогресс каждого студента"}

          code={
            "SELECT\n" +
            "    u.id,\n" +
            "    u.email,\n" +
            "    COUNT(DISTINCT l.id) AS total_lessons,\n" +
            "    COUNT(DISTINCT c.lesson_id) AS completed_lessons\n" +
            "FROM users AS u\n" +
            "JOIN enrollments AS e\n" +
            "    ON e.student_id = u.id\n" +
            "JOIN modules AS m\n" +
            "    ON m.course_id = e.course_id\n" +
            "JOIN lessons AS l\n" +
            "    ON l.module_id = m.id\n" +
            "    AND l.is_published = TRUE\n" +
            "LEFT JOIN completions AS c\n" +
            "    ON c.enrollment_id = e.id\n" +
            "    AND c.lesson_id = l.id\n" +
            "WHERE e.course_id = :course_id\n" +
            "GROUP BY u.id, u.email\n" +
            "ORDER BY u.id;"
          }
        />


        <BranchExplorer
          code={
            "if task == \"bug\":\n" +
            "    reproduce_then_fix()\n" +
            "elif task == \"test\":\n" +
            "    write_failure_case_first()\n" +
            "elif task == \"sql\":\n" +
            "    inspect_rows_then_aggregate()\n" +
            "else:\n" +
            "    review_risk_and_evidence()"
          }
          scenarios={[
            { label: "traceback task", activeLine: 1, output: "minimal reproduction → failing line → fix" },
            { label: "pytest task", activeLine: 3, output: "negative case → assertion → implementation" },
            { label: "SQL task", activeLine: 5, output: "raw rows → JOIN cardinality → GROUP BY" },
            { label: "review task", activeLine: 7, output: "severity → evidence → suggested change" },
          ]}
        />

        <TypeCards>
          <TypeCard badge={"01"} title={"Clarification"}>
            {"Уточните, считать ли только published lessons и что делать с курсом без уроков."}
          </TypeCard>
          <TypeCard badge={"02"} badgeTone="float" title={"Cardinality"}>
            {"Проверьте raw JOIN до COUNT, иначе дубликаты скрываются DISTINCT."}
          </TypeCard>
          <TypeCard badge={"03"} badgeTone="str" title={"Explanation"}>
            {"Назовите сложность Python-решения и индекс, полезный SQL query, но не оптимизируйте без плана."}
          </TypeCard>
        </TypeCards>

        <Callout tone="info">
          {"Интеграция считается завершённой только после проверки happy path, запрета или сбоя и возможности объяснить путь данных без чтения всего проекта."}
        </Callout>
      </Section>

      <Section number="07" title={"Работаем по таймеру и объясняем"}>
        <Lead>
          {"Финальный шаг урока превращает знание в воспроизводимую процедуру. Команды, ожидаемые результаты и порядок действий сохраняются в репозитории."}
        </Lead>

        <TerminalDemo
          title={"проверяем результат"}
          lines={[
            { cmd: "pytest interview_lab/test_service.py -q" },
            { out: "1 failed, 4 passed" },
            { cmd: "pytest interview_lab/test_service.py::test_foreign_teacher_cannot_update -q" },
            { out: "1 passed" },
            { cmd: "psql \"$DATABASE_URL\" -f interview_lab/progress.sql" },
            { out: " id | email            | total_lessons | completed_lessons\n----+------------------+---------------+------------------\n  7 | student@test.io  |             4 |                3" },
            { cmd: "ruff check interview_lab" },
            { out: "All checks passed!" },
          ]}
        />

        <CodeSequence
          title={"Соберите рабочий порядок"}
          prompt={"Расположите шаги так, чтобы результат оставался проверяемым и обратимым."}
          pieces={[
            { id: "clarify", code: "5 минут: вопросы и acceptance criteria" },
            { id: "python", code: "20 минут: дефект и complexity" },
            { id: "test", code: "15 минут: отрицательный pytest" },
            { id: "sql", code: "20 минут: SELECT/JOIN" },
            { id: "api", code: "15 минут: маленький endpoint" },
            { id: "review", code: "15 минут: review и итог" },
          ]}
          correctOrder={["clarify", "python", "test", "sql", "api", "review"]}
          explanation={"Сначала снимается неопределённость, затем выполняются независимые рабочие задания, а последние минуты остаются на review и объяснение."}
        />

        <div className="lesson-practice-steps">
          <h3>{"Коммит 1 — наблюдение"}</h3>
          <p>{"Зафиксируйте baseline, failing scenario или исходный документ до изменения."}</p>
          <h3>{"Коммит 2 — минимальное исправление"}</h3>
          <p>{"Измените только ответственную границу и сохраните маленький читаемый diff."}</p>
          <h3>{"Коммит 3 — evidence"}</h3>
          <p>{"Добавьте тест, документацию, diagram или runbook, который доказывает результат."}</p>
        </div>

        <RecallCard
          question={"Что должно позволить другому разработчику повторить результат?"}
          answer={<p>{"Точная последовательность команд, входные условия, ожидаемый вывод и путь диагностики отклонения."}</p>}
        />
      </Section>

      <Section number="08" title={"Контрольная точка и самостоятельная практика"}>
        <Lead>
          {"Ответьте на вопросы без запуска, затем проверьте себя. После контроля выполните проектную практику и объясните результат словами, не читая готовый текст."}
        </Lead>

        <div className="lesson-check-group">
          <QuizCard
            question={"Что сделать до первой правки незнакомого кода?"}
            options={[
              "Переписать функцию",
              "Воспроизвести поведение и уточнить контракт",
              "Добавить кеш",
            ]}
            correctIndex={1}
            explanation={"Минимальное воспроизведение отделяет наблюдаемый дефект от догадки."}
          />
          <QuizCard
            question={"Почему LEFT JOIN нужен для completions?"}
            options={[
              "Чтобы сохранить студентов без завершений",
              "Чтобы ускорить любой запрос",
              "Чтобы запретить NULL",
            ]}
            correctIndex={0}
            explanation={"INNER JOIN удалил бы строки без completion и скрыл 0%."}
          />
          <QuizCard
            question={"Что отличает blocker в review?"}
            options={[
              "Он длиннее",
              "Есть риск корректности/безопасности и доказуемый сценарий",
              "Он написан заглавными",
            ]}
            correctIndex={1}
            explanation={"Severity определяется последствием, а не тоном."}
          />
          <QuizCard
            question={"Как лучше завершить задачу на интервью?"}
            options={[
              "Сказать «готово»",
              "Назвать проверки, ограничения и следующий шаг",
              "Начать новый refactoring",
            ]}
            correctIndex={1}
            explanation={"Короткий итог показывает контроль результата и понимание границ."}
          />
        </div>

        <KeyTakeaways
          points={[

            <>{"Сначала уточняются контракт и edge cases, затем пишется код."}</>,

            <>{"Минимальное воспроизведение и failing test важнее случайной догадки."}</>,

            <>{"Два последовательных прохода по n элементам остаются O(n)."}</>,

            <>{"SQL JOIN проверяется на уровне сырых строк до агрегирования."}</>,

            <>{"Review-комментарий содержит severity, риск, evidence и проверяемое улучшение."}</>,

            <>{"На интервью оценивается процесс решения и способность объяснить границы."}</>,

          ]}
        />


        <PracticeCta text={"Проведите 90-минутный mock без подсказок: исправьте один Python bug, добавьте отрицательный pytest, напишите JOIN/aggregate query, реализуйте небольшой FastAPI endpoint и оформите три review-комментария. После таймера запишите, где потеряли время и какую проверку пропустили."} />
      </Section>
    </RichLesson>
  );
}
