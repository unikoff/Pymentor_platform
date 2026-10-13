import { Layers, ListChecks } from "lucide-react";
import { BugHunt, Callout, CodeBlock, CompareSolutions, FillBlank, KeyTakeaways, Lead, MatchPairs, MethodGrid, PracticeCta, PredictOutput, QuizCard, RecallCard, RichHero, RichLesson, Section, StepThrough, TerminalDemo, TypeCard, TypeCards } from "../../shared";
const BLOCK_TITLE = "Блок 25 · Coroutine, event loop и async/await";

type LessonProps = { module?: string };

export function Lesson146({ module }: LessonProps) {
  return (
    <RichLesson>
      <RichHero
        variant="project"
        chip={module ?? BLOCK_TITLE}
        title={"Мини-проект: трассировка асинхронного загрузчика"}
        intro={"Соберём последовательный async-loader профиля StudyHub: coroutine для пользователя и задач, обычную статистику, async main, измерение времени и ожидаемую ошибку."}
        tags={[
          { icon: <Layers size={14} />, label: "profile loader" },
          { icon: <ListChecks size={14} />, label: "timeline и проверка" },
        ]}
      />
      <Callout tone="info">
        <strong>Связь с курсом.</strong> {"Все базовые элементы соединяются в один воспроизводимый сценарий."}{" "}
        <strong>Важно не перепутать:</strong> {"Loader остаётся последовательным; create_task, timeout и cancellation относятся к блоку 26."}
      </Callout>

      <Section number={"01"} title={"Контракт проекта"}>
        <Lead>
          {"user_id проходит через user, tasks, stats и итоговый profile."}
        </Lead>

        <div className="lesson-practice-steps">
          <h3>{"Понять"}</h3>
          <p>{"Сформулировать основную модель своими словами."}</p>
          <h3>{"Проверить"}</h3>
          <p>{"Предсказать результат и запустить минимальный пример."}</p>
          <h3>{"Объяснить"}</h3>
          <p>{"Связать наблюдение с конкретной строкой или состоянием."}</p>
        </div>

        <CodeBlock
          caption={"минимальный эксперимент"}
          code={
            "user_id\n" +
            "→ await load_user\n" +
            "→ await load_tasks\n" +
            "→ calculate_stats\n" +
            "→ profile"
          }
        />

        <TypeCards>
          <TypeCard badge={"model"} title={"Главная модель"} code={"user_id"}>
            {"user_id проходит через user, tasks, stats и итоговый profile."}
          </TypeCard>
          <TypeCard badge={"flow"} badgeTone="float" title={"Поток выполнения"} code={"async-loader/"}>
            {"Источники, orchestration, ошибки, тесты и README разделены по ответственности."}
          </TypeCard>
          <TypeCard badge={"check"} badgeTone="str" title={"Проверяемый результат"} code={"predict → run → explain"}>
            {"Каждое предположение подтверждается запуском, типом значения или измерением."}
          </TypeCard>
        </TypeCards>

        <Callout tone="info">
          {"Loader остаётся последовательным; create_task, timeout и cancellation относятся к блоку 26."}
        </Callout>
      </Section>

      <Section number={"02"} title={"Структура файлов"}>
        <Lead>
          {"Источники, orchestration, ошибки, тесты и README разделены по ответственности."}
        </Lead>

        <div className="lesson-practice-steps">
          <h3>{"Понять"}</h3>
          <p>{"Сформулировать основную модель своими словами."}</p>
          <h3>{"Проверить"}</h3>
          <p>{"Предсказать результат и запустить минимальный пример."}</p>
          <h3>{"Объяснить"}</h3>
          <p>{"Связать наблюдение с конкретной строкой или состоянием."}</p>
        </div>

        <CodeBlock
          caption={"минимальный эксперимент"}
          code={
            "async-loader/\n" +
            "├── sources.py\n" +
            "├── profile_loader.py\n" +
            "├── errors.py\n" +
            "├── test_profile_loader.py\n" +
            "└── README.md"
          }
        />

        <MethodGrid
          rows={[
            [<>вход</>, "user_id проходит через user, tasks, stats и итоговый profile."],
            [<>операция</>, "Каждый источник логирует start/ready, ожидает I/O и возвращает данные."],
            [<>наблюдение</>, "Точка входа измеряет полный сценарий и печатает один итог."],
            [<>граница</>, "Loader остаётся последовательным; create_task, timeout и cancellation относятся к блоку 26."],
          ]}
        />

        <MatchPairs
          prompt={"Соедините шаг лаборатории с его смыслом."}
          pairs={[
            { left: "понять", right: "сформулировать модель" },
            { left: "предсказать", right: "назвать результат до запуска" },
            { left: "запустить", right: "получить наблюдение" },
            { left: "объяснить", right: "связать код и результат" },
          ]}
          explanation={"Порядок эксперимента защищает от случайного запоминания синтаксиса."}
        />

        <Callout tone="info">
          {"Loader остаётся последовательным; create_task, timeout и cancellation относятся к блоку 26."}
        </Callout>
      </Section>

      <Section number={"03"} title={"Coroutine-источники"}>
        <Lead>
          {"Каждый источник логирует start/ready, ожидает I/O и возвращает данные."}
        </Lead>

        <div className="lesson-practice-steps">
          <h3>{"Понять"}</h3>
          <p>{"Сформулировать основную модель своими словами."}</p>
          <h3>{"Проверить"}</h3>
          <p>{"Предсказать результат и запустить минимальный пример."}</p>
          <h3>{"Объяснить"}</h3>
          <p>{"Связать наблюдение с конкретной строкой или состоянием."}</p>
        </div>

        <CodeBlock
          caption={"минимальный эксперимент"}
          code={
            "async def load_user(user_id):\n" +
            "    await asyncio.sleep(0.4)\n" +
            "    if user_id == 404:\n" +
            "        raise UserNotFoundError(user_id)\n" +
            "    return {\"id\": user_id}"
          }
        />

        <StepThrough
          code={
            "async def load_user(user_id):\n" +
            "    await asyncio.sleep(0.4)\n" +
            "    if user_id == 404:\n" +
            "        raise UserNotFoundError(user_id)\n" +
            "    return {\"id\": user_id}"
          }
          steps={[
            { line: 0, note: "Начинается сценарий и фиксируется исходное состояние.", vars: { этап: "1" } },
            { line: 1, note: "Выполняется первый значимый шаг.", vars: { этап: "2" } },
            { line: 2, note: "Наблюдается основная точка изменения или ожидания.", vars: { этап: "3" } },
            { line: 4, note: "Формируется итог, который сравнивается с прогнозом.", vars: { этап: "5" } },
          ]}
        />

        <Callout tone="info">
          {"Loader остаётся последовательным; create_task, timeout и cancellation относятся к блоку 26."}
        </Callout>
      </Section>

      <Section number={"04"} title={"Обычная статистика"}>
        <Lead>
          {"Локальное вычисление без I/O остаётся обычным def."}
        </Lead>

        <div className="lesson-practice-steps">
          <h3>{"Понять"}</h3>
          <p>{"Сформулировать основную модель своими словами."}</p>
          <h3>{"Проверить"}</h3>
          <p>{"Предсказать результат и запустить минимальный пример."}</p>
          <h3>{"Объяснить"}</h3>
          <p>{"Связать наблюдение с конкретной строкой или состоянием."}</p>
        </div>

        <CodeBlock
          caption={"минимальный эксперимент"}
          code={
            "def calculate_stats(tasks):\n" +
            "    total=len(tasks)\n" +
            "    done=sum(t[\"is_done\"] for t in tasks)\n" +
            "    return {\"total\":total,\"done\":done}"
          }
        />

        <CompareSolutions
          question={"Какой вариант точнее выражает модель занятия?"}
          left={{ title: "Лишняя coroutine", code: "async def calculate_stats(tasks): ...", note: "Источник заблуждения или ограничение." }}
          right={{ title: "Обычная функция", code: "def calculate_stats(tasks): ...", note: "Явный контракт и наблюдаемое поведение." }}
          preferred={"right"}
          explanation={"Локальное вычисление без await честнее оставить синхронным."}
        />

        <Callout tone="info">
          {"Loader остаётся последовательным; create_task, timeout и cancellation относятся к блоку 26."}
        </Callout>
      </Section>

      <Section number={"05"} title={"Зависимый build_profile"}>
        <Lead>
          {"Tasks используют user.id, поэтому порядок предметно необходим."}
        </Lead>

        <div className="lesson-practice-steps">
          <h3>{"Понять"}</h3>
          <p>{"Сформулировать основную модель своими словами."}</p>
          <h3>{"Проверить"}</h3>
          <p>{"Предсказать результат и запустить минимальный пример."}</p>
          <h3>{"Объяснить"}</h3>
          <p>{"Связать наблюдение с конкретной строкой или состоянием."}</p>
        </div>

        <CodeBlock
          caption={"минимальный эксперимент"}
          code={
            "async def build_profile(user_id):\n" +
            "    user=await load_user(user_id)\n" +
            "    tasks=await load_tasks(user[\"id\"])\n" +
            "    return {\"user\":user,\"tasks\":tasks,\"stats\":calculate_stats(tasks)}"
          }
        />

        <PredictOutput
          code={
            "user=await load_user(7)\n" +
            "tasks=await load_tasks(user[\"id\"])"
          }
          output={
            "user:start\n" +
            "user:ready\n" +
            "tasks:start\n" +
            "tasks:ready"
          }
          hint={"Tasks начинаются после user."}
        />

        <FillBlank prompt="Получите готовый профиль в main." before="profile = " after="" options={["await build_profile()", "build_profile()", "asyncio.run"]} answer="await build_profile()" explanation="build_profile — async-функция, поэтому её результат получают через await." />

        <Callout tone="info">
          {"Loader остаётся последовательным; create_task, timeout и cancellation относятся к блоку 26."}
        </Callout>
      </Section>

      <Section number={"06"} title={"main и timeline"}>
        <Lead>
          {"Точка входа измеряет полный сценарий и печатает один итог."}
        </Lead>

        <div className="lesson-practice-steps">
          <h3>{"Понять"}</h3>
          <p>{"Сформулировать основную модель своими словами."}</p>
          <h3>{"Проверить"}</h3>
          <p>{"Предсказать результат и запустить минимальный пример."}</p>
          <h3>{"Объяснить"}</h3>
          <p>{"Связать наблюдение с конкретной строкой или состоянием."}</p>
        </div>

        <CodeBlock
          caption={"минимальный эксперимент"}
          code={
            "async def main(user_id=7):\n" +
            "    started=perf_counter()\n" +
            "    profile=await build_profile(user_id)\n" +
            "    print(profile, perf_counter()-started)"
          }
        />

        <TerminalDemo
          title={"async-loader"}
          lines={[
            { cmd: "python async-loader/lab.py" },
            { out: "start" },
            { out: "observe model" },
            { out: "finish without hidden warnings" },
          ]}
        />

        <Callout tone="info">
          {"Loader остаётся последовательным; create_task, timeout и cancellation относятся к блоку 26."}
        </Callout>
      </Section>

      <Section number={"07"} title={"Ожидаемая ошибка"}>
        <Lead>
          {"Main переводит UserNotFoundError в понятное CLI-сообщение."}
        </Lead>

        <div className="lesson-practice-steps">
          <h3>{"Понять"}</h3>
          <p>{"Сформулировать основную модель своими словами."}</p>
          <h3>{"Проверить"}</h3>
          <p>{"Предсказать результат и запустить минимальный пример."}</p>
          <h3>{"Объяснить"}</h3>
          <p>{"Связать наблюдение с конкретной строкой или состоянием."}</p>
        </div>

        <CodeBlock
          caption={"минимальный эксперимент"}
          code={
            "try:\n" +
            "    profile=await build_profile(404)\n" +
            "except UserNotFoundError as error:\n" +
            "    print(f\"profile:error:{error}\")"
          }
        />

        <BugHunt
          code={
            "profile = await build_profile(404)\n" +
            "print(profile)"
          }
          question={"Где обработать ожидаемое отсутствие пользователя?"}
          options={[
            "в main вокруг build_profile",
            "в calculate_stats",
            "подавить в load_user",
          ]}
          correctIndex={0}
          explanation={"Main является границей пользовательского сценария."}
          fix={
            "try:\n" +
            "    profile=await build_profile(404)\n" +
            "except UserNotFoundError as error:\n" +
            "    print(error)"
          }
        />

        <RecallCard question="Сформулируйте причину результата одним предложением." answer={<p>Модель подтверждается типом объекта, порядком логов, warning или измерением времени.</p>} />

        <Callout tone="info">
          {"Loader остаётся последовательным; create_task, timeout и cancellation относятся к блоку 26."}
        </Callout>
      </Section>

      <Section number="08" title={"Контрольная точка и практика"}>
        <Lead>
          {"Соберите результат занятия в async-loader, воспроизведите успешный и ошибочный сценарии и объясните timeline без слова «магия»."}
        </Lead>

        <div className="lesson-check-group">
          <QuizCard
            question={"Какая функция должна быть def?"}
            options={[
              "calculate_stats",
              "load_user",
              "async main",
            ]}
            correctIndex={0}
            explanation={"Ответ следует из основной модели и проверяется минимальным запуском."}
          />
          <QuizCard
            question={"Где обрабатывать CLI-ошибку?"}
            options={[
              "в main",
              "в случайном helper",
              "голым except везде",
            ]}
            correctIndex={0}
            explanation={"Ответ следует из основной модели и проверяется минимальным запуском."}
          />
          <QuizCard
            question={"Почему user→tasks последовательны?"}
            options={[
              "tasks использует user.id",
              "async запрещает concurrency",
              "perf_counter требует",
            ]}
            correctIndex={0}
            explanation={"Ответ следует из основной модели и проверяется минимальным запуском."}
          />
          <QuizCard
            question={"Что станет baseline блока 26?"}
            options={[
              "измеренный sequential loader",
              "случайный benchmark",
              "FastAPI endpoint",
            ]}
            correctIndex={0}
            explanation={"Ответ следует из основной модели и проверяется минимальным запуском."}
          />
        </div>

        <KeyTakeaways
          points={[
            <>{"Проект имеет async entry point."}</>,
            <>{"Источники являются coroutine."}</>,
            <>{"Зависимый flow последовательный."}</>,
            <>{"Статистика остаётся def."}</>,
            <>{"Elapsed измеряет полный сценарий."}</>,
            <>{"Ошибка обрабатывается в main."}</>,
            <>{"Loader становится baseline следующего блока."}</>,
          ]}
        />

        <PracticeCta text={"Соберите async-loader, добавьте user_id=7 и 404, три теста и README с timeline и командами запуска."} />
      </Section>

    </RichLesson>
  );
}
