import { ListChecks, Wrench } from "lucide-react";
import { BranchExplorer, BugHunt, Callout, CodeBlock, CodeSequence, CompareSolutions, KeyTakeaways, Lead, MethodGrid, PracticeCta, QuizCard, RecallCard, RichHero, RichLesson, Section, TerminalDemo, TypeCard, TypeCards } from "../../shared";
const BLOCK_TITLE = "Блок 29 · Linux, процессы, окружения и логи";

type LessonProps = { module?: string };

export function Lesson170({ module }: LessonProps) {
  return (
    <RichLesson>
      <RichHero
        variant="project"
        chip={module ?? BLOCK_TITLE}
        title={"Linux-runbook и диагностика запуска StudyHub"}
        intro={"Соберём знания блока в `docs/runbook-linux.md`: проведём чистый запуск, зафиксируем preflight-checks и по одной процедуре устраним неверный cwd, отсутствующую variable, занятый port и недоступную database."}
        tags={[
          { icon: <ListChecks size={14} />, label: "процедура вместо памяти" },
          { icon: <Wrench size={14} />, label: "диагностическое дерево" },
        ]}
      />
      <Callout tone="info">
        <strong>Связь с курсом.</strong> {"Отдельные команды уже понятны. Финальная задача — превратить их в воспроизводимый маршрут, которым воспользуется другой разработчик без устных подсказок."}{" "}
        <strong>Важно не перепутать:</strong> {"Runbook не должен скрывать проблему магической командой «переустановить всё». Каждый шаг проверяет одно предположение и сохраняет наблюдаемый результат."}
      </Callout>

      <Section number={"01"} title={"Runbook — это исполняемая процедура"}>
        <Lead>
          {"Хороший runbook содержит цель, prerequisites, команды, ожидаемый результат и ветки для типовых ошибок. Он уменьшает зависимость проекта от памяти одного автора."}
        </Lead>

        <div className="lesson-practice-steps">
          <h3>{"Команда"}</h3>
          <p>{"Что именно выполнить."}</p>
          <h3>{"Ожидание"}</h3>
          <p>{"Как выглядит успешный результат."}</p>
          <h3>{"Ветка"}</h3>
          <p>{"Что проверить, если результат другой."}</p>
        </div>

        <CodeBlock
          caption={"минимальная модель или команда"}
          code={"# Linux runbook\n1. проверить prerequisites\n2. перейти в корень проекта\n3. загрузить config\n4. запустить process\n5. проверить port и health\n6. прочитать logs\n7. остановить штатно"}
        />

        <TypeCards>
          <TypeCard badge={"input"} title={"Prerequisites"} code={"Python, dependencies, config"}>
            {"Что должно существовать до запуска."}
          </TypeCard>
          <TypeCard badge={"action"} badgeTone="float" title={"Procedure"} code={"команды по порядку"}>
            {"Минимальный путь запуска."}
          </TypeCard>
          <TypeCard badge={"failure"} badgeTone="str" title={"Troubleshooting"} code={"симптом → проверка → исправление"}>
            {"Контролируемые ветки диагностики."}
          </TypeCard>
        </TypeCards>

        <Callout tone="info">
          {"Фраза «запустите проект как обычно» недопустима: другой человек не знает локальных привычек автора."}
        </Callout>
      </Section>

      <Section number={"02"} title={"Preflight: Python, зависимости, cwd и config"}>
        <Lead>
          {"До старта сервера проверяются четыре независимых условия. Такой порядок отделяет проблему среды от проблемы приложения."}
        </Lead>

        <div className="lesson-practice-steps">
          <h3>{"Runtime"}</h3>
          <p>{"Версия Python доступна."}</p>
          <h3>{"Dependencies"}</h3>
          <p>{"`pip check` не видит конфликтов."}</p>
          <h3>{"Path"}</h3>
          <p>{"В cwd существует app/main.py."}</p>
          <h3>{"Config"}</h3>
          <p>{"Обязательная variable непуста."}</p>
        </div>

        <CodeBlock
          caption={"минимальная модель или команда"}
          code={"python --version\npython -m pip check\npwd\ntest -f app/main.py && echo \"project root ok\"\ntest -n \"$DATABASE_URL\" && echo \"DATABASE_URL is set\""}
        />

        <CodeSequence
          title={"Соберите безопасный порядок действий"}
          prompt={"Выберите только необходимые шаги и расположите их так, чтобы каждое предположение проверялось до изменения системы."}
          pieces={[
            { id: "python", code: "python --version" },
            { id: "deps", code: "python -m pip check" },
            { id: "cwd", code: "pwd && test -f app/main.py" },
            { id: "config", code: "test -n \"$DATABASE_URL\"" },
            { id: "start", code: "python -m uvicorn app.main:app --port 8000" },
          ]}
          correctOrder={["python", "deps", "cwd", "config", "start"]}
          explanation={"Сервер запускается только после подтверждения runtime, dependencies, cwd и config."}
        />

        <Callout tone="info">
          {"Preflight не доказывает, что database доступна, но быстро исключает четыре частых причины startup failure."}
        </Callout>
      </Section>

      <Section number={"03"} title={"Запуск, PID, port и endpoints"}>
        <Lead>
          {"После preflight runbook запускает Uvicorn в foreground, а второй терминал проверяет process, socket, health и readiness. Каждый шаг отвечает на отдельный вопрос."}
        </Lead>

        <div className="lesson-practice-steps">
          <h3>{"Process"}</h3>
          <p>{"Есть ли Uvicorn PID."}</p>
          <h3>{"Port"}</h3>
          <p>{"Слушает ли он 8000."}</p>
          <h3>{"Live"}</h3>
          <p>{"Отвечает ли `/health`."}</p>
          <h3>{"Ready"}</h3>
          <p>{"Доступна ли database."}</p>
        </div>

        <CodeBlock
          caption={"минимальная модель или команда"}
          code={"python -m uvicorn app.main:app --host 127.0.0.1 --port 8000\n\nps -ef | grep '[u]vicorn'\nss -ltnp | grep ':8000'\ncurl -fsS http://127.0.0.1:8000/health\ncurl -i http://127.0.0.1:8000/ready"}
        />

        <TerminalDemo
          title={"успешный запуск по runbook"}
          lines={[
            { cmd: "python -m uvicorn app.main:app --host 127.0.0.1 --port 8000" },
            { out: "INFO application_started app_env=development" },
            { out: "INFO Uvicorn running on http://127.0.0.1:8000" },
            { cmd: "curl -fsS http://127.0.0.1:8000/health" },
            { out: "{\"status\":\"ok\"}" },
            { cmd: "curl -fsS http://127.0.0.1:8000/ready" },
            { out: "{\"status\":\"ready\"}" },
          ]}
        />

        <Callout tone="info">
          {"Runbook фиксирует ожидаемый status и body, а не только команду curl."}
        </Callout>
      </Section>

      <Section number={"04"} title={"Диагностическое дерево по уровню отказа"}>
        <Lead>
          {"Симптом определяет следующий вопрос. Если команда не стартует — проверяются runtime, cwd и config. Если процесс падает — читается traceback. Если процесс жив, но API не отвечает — проверяются port, host и endpoints."}
        </Lead>

        <div className="lesson-practice-steps">
          <h3>{"Нет процесса"}</h3>
          <p>{"Проверить запуск и stderr."}</p>
          <h3>{"Процесс падает"}</h3>
          <p>{"Найти первый traceback cause."}</p>
          <h3>{"Процесс жив"}</h3>
          <p>{"Проверить socket и HTTP."}</p>
          <h3>{"Ready 503"}</h3>
          <p>{"Проверить критическую dependency."}</p>
        </div>

        <CodeBlock
          caption={"минимальная модель или команда"}
          code={"command fails\n├── python missing?\n├── wrong cwd?\n└── required env missing?\n\nprocess exits\n├── traceback\n├── database unavailable\n└── migration/config error\n\nprocess alive, API fails\n├── wrong host/port\n├── /health\n└── /ready"}
        />

        <BranchExplorer
          code={"if command_does_not_start:\n    check_runtime_cwd_and_env()\nelif process_exits:\n    read_traceback_and_startup_logs()\nelif port_is_not_listening:\n    inspect_bind_and_owner()\nelif health_fails:\n    inspect_application_logs()\nelif ready_fails:\n    inspect_database_connection()\nelse:\n    run_smoke_scenario()"}
          scenarios={[
            { label: "команда не запускается", activeLine: 1, output: "runtime → cwd → env" },
            { label: "process сразу завершился", activeLine: 3, output: "startup logs → traceback" },
            { label: "порт не слушается", activeLine: 5, output: "host/port → owner" },
            { label: "/health не отвечает", activeLine: 7, output: "application logs" },
            { label: "/ready возвращает 503", activeLine: 9, output: "database connection" },
            { label: "health и ready успешны", activeLine: 11, output: "smoke scenario" },
          ]}
        />

        <Callout tone="info">
          {"Не перескакивайте сразу к database, если Python-команда вообще не создала процесс."}
        </Callout>
      </Section>

      <Section number={"05"} title={"Инцидент 1–2: неверный cwd и отсутствующая variable"}>
        <Lead>
          {"Первые две неисправности диагностируются до сетевого уровня. `pwd` и наличие `app/main.py` подтверждают root проекта; startup-message называет отсутствующую переменную."}
        </Lead>

        <div className="lesson-practice-steps">
          <h3>{"Wrong cwd"}</h3>
          <p>{"Модуль app не импортируется."}</p>
          <h3>{"Check"}</h3>
          <p>{"`test -f app/main.py` завершается неуспешно."}</p>
          <h3>{"Missing env"}</h3>
          <p>{"Settings завершает startup с именем variable."}</p>
        </div>

        <CodeBlock
          caption={"минимальная модель или команда"}
          code={"# wrong cwd\npwd\ntest -f app/main.py || echo \"not project root\"\n\n# missing config\nprintenv DATABASE_URL\npython scripts/check_config.py"}
        />

        <CompareSolutions
          question={"Какой вариант оставляет более ясную и воспроизводимую границу?"}
          left={{
            title: "Случайная починка",
            code: "export PYTHONPATH=$PYTHONPATH:$(pwd)/studyhub",
            note: "Маскирует неверную точку запуска.",
          }}
          right={{
            title: "Исправить причину",
            code: "cd /srv/studyhub && test -f app/main.py",
            note: "Возвращает ожидаемый project root.",
          }}
          preferred="right"
          explanation={"Runbook исправляет нарушенное предположение, а не добавляет глобальный обходной путь."}
        />

        <Callout tone="info">
          {"Не выводите значение SECRET_KEY при проверке. Достаточно подтвердить наличие непустой variable."}
        </Callout>
      </Section>

      <Section number={"06"} title={"Инцидент 3–4: занятый port и недоступная database"}>
        <Lead>
          {"Конфликт порта виден до HTTP, а недоступная database проявляется как ready=503 при живом процессе. Это разные уровни и разные процедуры."}
        </Lead>

        <div className="lesson-practice-steps">
          <h3>{"Port busy"}</h3>
          <p>{"Найти PID владельца и команду."}</p>
          <h3>{"Health 200"}</h3>
          <p>{"Процесс и HTTP-path живы."}</p>
          <h3>{"Ready 503"}</h3>
          <p>{"Проверить database URL, DNS, port и credentials."}</p>
          <h3>{"Fix"}</h3>
          <p>{"Перезапустить только после устранения причины."}</p>
        </div>

        <CodeBlock
          caption={"минимальная модель или команда"}
          code={"ss -ltnp | grep ':8000'\nps -fp \"$PID\"\n\ncurl -i http://127.0.0.1:8000/health\ncurl -i http://127.0.0.1:8000/ready\ngrep 'database' logs/app.log | tail -n 20"}
        />

        <BugHunt
          code={"curl -i http://127.0.0.1:8000/health\n# 200 OK\ncurl -i http://127.0.0.1:8000/ready\n# 503 Service Unavailable\n\n# оператор перезапускает API десять раз"}
          question={"Почему повторный restart не решает проблему?"}
          options={[
            "Liveness успешна, а readiness указывает на database dependency",
            "curl нельзя использовать дважды",
            "503 означает занятый HTTP-port",
          ]}
          correctIndex={0}
          explanation={"Нужно диагностировать соединение с базой, а не повторять запуск живого процесса."}
          fix={"printenv DATABASE_URL\n# проверить host/port database\n# прочитать startup и readiness logs\n# после исправления повторить /ready"}
        />

        <Callout tone="info">
          {"Runbook должен ограничивать destructive actions: reset базы не является первой проверкой connection failure."}
        </Callout>
      </Section>

      <Section number={"07"} title={"Чистая репетиция и критерий завершения"}>
        <Lead>
          {"Финальная проверка выполняется в новой shell-сессии или чистой директории по одной документации. Другой человек фиксирует места, где пришлось догадаться, и эти пробелы возвращаются в runbook."}
        </Lead>

        <div className="lesson-practice-steps">
          <h3>{"Чистый старт"}</h3>
          <p>{"Нет скрытого состояния IDE и старой shell."}</p>
          <h3>{"Наблюдение"}</h3>
          <p>{"Записываются реальные outputs и ошибки."}</p>
          <h3>{"Исправление docs"}</h3>
          <p>{"Каждая догадка превращается в явный шаг."}</p>
          <h3>{"Готовность"}</h3>
          <p>{"Другой человек повторяет сценарий без автора."}</p>
        </div>

        <CodeBlock
          caption={"минимальная модель или команда"}
          code={"git clone <repository> studyhub-clean\ncd studyhub-clean\ncp .env.example .env.local\n# заполнить безопасные local values\npython -m pip install -r requirements.txt\n# выполнить runbook от preflight до shutdown"}
        />

        <RecallCard
          question={"Какие четыре неисправности обязан различать финальный runbook?"}
          hint={"Вспомните уровни: path → config → process/socket → dependency."}
          answer={<p>{"Неверный cwd, отсутствующая обязательная environment variable, занятый port и недоступная database. Для каждой нужны симптом, проверка и безопасное исправление."}</p>}
        />

        <Callout tone="info">
          {"Новая функциональность API не добавляется. Результат блока — воспроизводимый запуск и понятная диагностика."}
        </Callout>
      </Section>

      <Section number={"08"} title={"Контрольная точка и проектный результат"}>
        <Lead>
          {"Завершите занятие не чтением, а воспроизводимой проверкой: выполните основной сценарий, намеренно создайте ожидаемый сбой, устраните его по наблюдаемым данным и зафиксируйте процедуру в Linux-runbook."}
        </Lead>

        <div className="lesson-check-group">
          <QuizCard
            question={"С чего начинается preflight?"}
            options={[
              "runtime, dependencies, cwd и config",
              "с удаления базы",
              "с Docker build",
            ]}
            correctIndex={0}
            explanation={"Правильный ответ следует из модели урока и проверяется конкретной командой, состоянием процесса или HTTP-result."}
          />
          <QuizCard
            question={"Что проверяет ready=503 при health=200?"}
            options={[
              "критическая dependency недоступна",
              "Python не установлен",
              "порт свободен",
            ]}
            correctIndex={0}
            explanation={"Правильный ответ следует из модели урока и проверяется конкретной командой, состоянием процесса или HTTP-result."}
          />
          <QuizCard
            question={"Зачем runbook указывает ожидаемый output?"}
            options={[
              "чтобы отличить успех от другого состояния",
              "для красоты",
              "чтобы скрыть ошибки",
            ]}
            correctIndex={0}
            explanation={"Правильный ответ следует из модели урока и проверяется конкретной командой, состоянием процесса или HTTP-result."}
          />
          <QuizCard
            question={"Как проверить качество runbook?"}
            options={[
              "дать другому человеку чистый запуск",
              "прочитать только заголовки",
              "добавить больше команд без проверки",
            ]}
            correctIndex={0}
            explanation={"Правильный ответ следует из модели урока и проверяется конкретной командой, состоянием процесса или HTTP-result."}
          />
        </div>

        <MethodGrid
          rows={[
            [<>Команда</>, "может быть скопирована и выполнена без догадки"],
            [<>Ожидаемый результат</>, "показывает, как выглядит успешное состояние"],
            [<>Ошибочный сценарий</>, "воспроизводится безопасно и имеет наблюдаемый симптом"],
            [<>Исправление</>, "устраняет причину и заканчивается повторной проверкой"],
          ]}
        />

        <div className="execution-example">
          <CodeBlock
            caption={"preflight runbook"}
            code={"python --version\npython -m pip check\npwd\ntest -f app/main.py"}
          />
          <TerminalDemo
            title={"контрольный прогон"}
            lines={[
              { cmd: "python --version" },
              { out: "Python 3.x" },
              { cmd: "python -m pip check" },
              { out: "No broken requirements found." },
            ]}
          />
        </div>

        <RecallCard
          question={"Какой наблюдаемый факт доказывает, что основной сценарий этого занятия выполнен корректно?"}
          hint={"Назовите команду, ожидаемый output и отличие от ошибочного состояния."}
          answer={<p>{"Готовность подтверждается не отсутствием ошибок на глаз, а конкретной командой и ожидаемым результатом, записанными в runbook."}</p>}
        />

        <KeyTakeaways
          points={[
            <>{"Runbook содержит команды, ожидания и ветки отказа."}</>,
            <>{"Preflight отделяет environment-проблемы от application-проблем."}</>,
            <>{"Process, socket, health и ready проверяются отдельно."}</>,
            <>{"Симптом выбирает следующий диагностический шаг."}</>,
            <>{"Wrong cwd не лечится случайным PYTHONPATH."}</>,
            <>{"Ready 503 направляет к database dependency."}</>,
            <>{"Чистая репетиция выявляет скрытые предположения автора."}</>,
          ]}
        />

        <div className="lesson-practice-steps">
          <h3>{"Артефакт"}</h3>
          <p>{"Обновлён `docs/runbook-linux.md` и сохранён проверяемый результат занятия."}</p>
          <h3>{"Проверка сбоя"}</h3>
          <p>{"Есть минимум один намеренно созданный ошибочный сценарий и объяснение причины по наблюдаемым данным."}</p>
          <h3>{"Git"}</h3>
          <p>{"Изменение оформлено отдельным commit с узким техническим смыслом."}</p>
        </div>

        <PracticeCta text={"Создайте `docs/runbook-linux.md`, выполните его в чистой shell-сессии и приложите журнал четырёх неисправностей: symptom → command → observation → fix → verification. Завершите отдельным Git-коммитом `docs: add linux startup runbook`."} />
      </Section>

    </RichLesson>
  );
}
