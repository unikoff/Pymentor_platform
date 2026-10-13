import { Play, Search } from "lucide-react";
import { BranchExplorer, Callout, CodeBlock, CompareSolutions, FillBlank, KeyTakeaways, Lead, MatchPairs, MethodGrid, PracticeCta, QuizCard, RecallCard, RichHero, RichLesson, Section, StepThrough, TerminalDemo, TypeCard, TypeCards } from "../../shared";
const BLOCK_TITLE = "Блок 29 · Linux, процессы, окружения и логи";

type LessonProps = { module?: string };

export function Lesson166({ module }: LessonProps) {
  return (
    <RichLesson>
      <RichHero
        variant="project"
        chip={module ?? BLOCK_TITLE}
        title={"Процессы, PID, порты и сигналы"}
        intro={"Посмотрим на Uvicorn как на долгоживущий процесс: запустим сервер, найдём его PID, проверим слушающий порт, воспроизведём конфликт адреса и завершим приложение штатным сигналом."}
        tags={[
          { icon: <Play size={14} />, label: "program → process → PID" },
          { icon: <Search size={14} />, label: "порт и диагностика" },
        ]}
      />
      <Callout tone="info">
        <strong>Связь с курсом.</strong> {"После уверенной навигации команда запуска перестаёт быть строкой в IDE: операционная система создаёт процесс с PID, окружением и открытым сокетом."}{" "}
        <strong>Важно не перепутать:</strong> {"Процесс и файл программы — не одно и то же. Один файл может запускаться несколько раз, но два процесса не могут одновременно занять один host:port."}
      </Callout>

      <Section number={"01"} title={"Программа на диске и процесс в памяти"}>
        <Lead>
          {"Файл Uvicorn или модуль StudyHub — это программа. После запуска операционная система создаёт процесс: живой экземпляр с PID, состоянием, окружением и открытыми ресурсами."}
        </Lead>

        <div className="lesson-practice-steps">
          <h3>{"Program"}</h3>
          <p>{"Код и исполняемые файлы на диске."}</p>
          <h3>{"Process"}</h3>
          <p>{"Конкретный запущенный экземпляр."}</p>
          <h3>{"PID"}</h3>
          <p>{"Числовой идентификатор процесса в ОС."}</p>
        </div>

        <CodeBlock
          caption={"минимальная модель или команда"}
          code={"program: python + uvicorn + app.main\ncommand: python -m uvicorn app.main:app --port 8000\nprocess: PID 4127\nresource: TCP 127.0.0.1:8000"}
        />

        <TypeCards>
          <TypeCard badge={"program"} title={"Программа"} code={"app/main.py"}>
            {"Может лежать на диске без выполнения."}
          </TypeCard>
          <TypeCard badge={"process"} badgeTone="float" title={"Процесс"} code={"PID=4127"}>
            {"Существует во время выполнения."}
          </TypeCard>
          <TypeCard badge={"socket"} badgeTone="str" title={"Слушающий адрес"} code={"127.0.0.1:8000"}>
            {"Принимает сетевые подключения."}
          </TypeCard>
        </TypeCards>

        <Callout tone="info">
          {"Перезапуск создаёт новый процесс и обычно новый PID, даже если команда и код не изменились."}
        </Callout>
      </Section>

      <Section number={"02"} title={"Foreground и управляемый запуск"}>
        <Lead>
          {"При запуске в foreground сервер занимает текущий терминал и пишет туда логи. Это удобно для обучения: Ctrl+C отправляет сигнал прерывания, а завершение видно сразу."}
        </Lead>

        <div className="lesson-practice-steps">
          <h3>{"Запуск"}</h3>
          <p>{"Команда создаёт Uvicorn-процесс."}</p>
          <h3>{"Наблюдение"}</h3>
          <p>{"Терминал показывает startup и request logs."}</p>
          <h3>{"Остановка"}</h3>
          <p>{"Ctrl+C инициирует штатное завершение."}</p>
        </div>

        <CodeBlock
          caption={"минимальная модель или команда"}
          code={"python -m uvicorn app.main:app --host 127.0.0.1 --port 8000"}
        />

        <TerminalDemo
          title={"foreground-сервер"}
          lines={[
            { cmd: "python -m uvicorn app.main:app --host 127.0.0.1 --port 8000" },
            { out: "INFO: Started server process [4127]" },
            { out: "INFO: Application startup complete." },
            { out: "INFO: Uvicorn running on http://127.0.0.1:8000" },
            { cmd: "Ctrl+C" },
            { out: "INFO: Shutting down" },
            { out: "INFO: Application shutdown complete." },
          ]}
        />

        <Callout tone="info">
          {"Фоновый запуск нужен позже для эксплуатации. Сначала важно увидеть полный lifecycle в одном терминале."}
        </Callout>
      </Section>

      <Section number={"03"} title={"Как найти PID процесса"}>
        <Lead>
          {"Команда `ps` показывает процессы. Фильтр по строке `uvicorn` сокращает вывод, а шаблон `[u]vicorn` не захватывает сам процесс `grep`."}
        </Lead>

        <div className="lesson-practice-steps">
          <h3>{"Список"}</h3>
          <p>{"`ps -ef` показывает процессы системы."}</p>
          <h3>{"Фильтр"}</h3>
          <p>{"`grep` оставляет строки Uvicorn."}</p>
          <h3>{"Идентификатор"}</h3>
          <p>{"PID используется для адресного сигнала."}</p>
        </div>

        <CodeBlock
          caption={"минимальная модель или команда"}
          code={"ps -ef | grep '[u]vicorn'\n# student  4127  ... python -m uvicorn app.main:app --port 8000"}
        />

        <FillBlank
          prompt={"Заполните команду поиска Uvicorn-процесса."}
          before={"ps -ef | "}
          after={""}
          options={["grep '[u]vicorn'", "pwd", "curl"]}
          answer={"grep '[u]vicorn'"}
          explanation={"Фильтр оставляет только строку процесса Uvicorn."}
        />

        <Callout tone="info">
          {"Не завершайте процесс по случайному PID из старого скриншота. Сначала найдите актуальный экземпляр и сверьте команду."}
        </Callout>
      </Section>

      <Section number={"04"} title={"Host и port как сетевой адрес процесса"}>
        <Lead>
          {"Host определяет интерфейс, на котором сервер принимает соединения, а port выбирает номер точки входа. Для локальной проверки используется `127.0.0.1`; `0.0.0.0` означает слушать все доступные интерфейсы процесса."}
        </Lead>

        <div className="lesson-practice-steps">
          <h3>{"Host"}</h3>
          <p>{"Адрес сетевого интерфейса."}</p>
          <h3>{"Port"}</h3>
          <p>{"Номер точки входа процесса."}</p>
          <h3>{"URL"}</h3>
          <p>{"Клиент соединяет схему, host и port."}</p>
        </div>

        <CodeBlock
          caption={"минимальная модель или команда"}
          code={"127.0.0.1:8000 → локальный адрес\n0.0.0.0:8000   → слушать все интерфейсы\nclient → TCP connection → Uvicorn process"}
        />

        <MatchPairs
          prompt={"Соедините обозначение и его эксплуатационный смысл."}
          pairs={[
            { left: "127.0.0.1", right: "локальный loopback" },
            { left: "0.0.0.0", right: "слушать все интерфейсы" },
            { left: "8000", right: "номер порта" },
            { left: "http://127.0.0.1:8000", right: "адрес клиента" },
          ]}
          explanation={"Пары закрепляют не команду отдельно, а её место в диагностическом маршруте."}
        />

        <Callout tone="info">
          {"`0.0.0.0` используется для bind сервера, но клиент обычно обращается к конкретному адресу, например `127.0.0.1` или имени хоста."}
        </Callout>
      </Section>

      <Section number={"05"} title={"Проверка слушающего порта"}>
        <Lead>
          {"Сервер может существовать как процесс, но не слушать ожидаемый порт. Команда `ss -ltnp` показывает TCP-sockets в состоянии listen; затем `curl` проверяет HTTP-ответ."}
        </Lead>

        <div className="lesson-practice-steps">
          <h3>{"Процесс"}</h3>
          <p>{"Проверить, существует ли PID."}</p>
          <h3>{"Socket"}</h3>
          <p>{"Проверить, слушает ли процесс 8000."}</p>
          <h3>{"HTTP"}</h3>
          <p>{"Проверить ответ конкретного endpoint."}</p>
        </div>

        <CodeBlock
          caption={"минимальная модель или команда"}
          code={"ss -ltnp | grep ':8000'\ncurl -i http://127.0.0.1:8000/health"}
        />

        <StepThrough
          code={"process → socket → HTTP"}
          steps={[
            { line: 0, note: "Есть ли Uvicorn-процесс?", vars: {"process": "running"} },
            { line: 1, note: "Какой PID слушает 8000?", vars: {"port": "8000", "pid": "4127"} },
            { line: 2, note: "Отвечает ли приложение по HTTP?", vars: {"status": "200"} },
          ]}
        />

        <Callout tone="info">
          {"Один `curl` не заменяет диагностику процесса: connection refused и HTTP 500 указывают на разные уровни проблемы."}
        </Callout>
      </Section>

      <Section number={"06"} title={"Почему второй сервер не запускается"}>
        <Lead>
          {"Операционная система не разрешает двум процессам одновременно слушать один и тот же адрес и порт. Второй Uvicorn завершится с ошибкой address already in use."}
        </Lead>

        <div className="lesson-practice-steps">
          <h3>{"Свободно"}</h3>
          <p>{"Процесс успешно bind к порту."}</p>
          <h3>{"Занято"}</h3>
          <p>{"Второй bind отклоняется."}</p>
          <h3>{"Решение"}</h3>
          <p>{"Остановить старый процесс или выбрать другой порт."}</p>
        </div>

        <CodeBlock
          caption={"минимальная модель или команда"}
          code={"first process  → 127.0.0.1:8000 ✓\nsecond process → 127.0.0.1:8000 ✗ address already in use\nsecond process → 127.0.0.1:8001 ✓"}
        />

        <BranchExplorer
          code={"if port_is_free:\n    start_server()\nelif old_process_is_expected:\n    stop_old_process()\nelse:\n    choose_another_port()"}
          scenarios={[
            { label: "порт 8000 свободен", activeLine: 1, output: "сервер запускается" },
            { label: "старый StudyHub занимает 8000", activeLine: 3, output: "остановить ожидаемый старый PID" },
            { label: "чужой процесс занимает 8000", activeLine: 5, output: "не завершать вслепую; выбрать порт или выяснить владельца" },
          ]}
        />

        <Callout tone="info">
          {"Не используйте `kill -9` как первую реакцию на занятый порт. Сначала определите владельца socket."}
        </Callout>
      </Section>

      <Section number={"07"} title={"SIGINT, SIGTERM и принудительное завершение"}>
        <Lead>
          {"SIGINT обычно приходит от Ctrl+C, SIGTERM просит процесс завершиться штатно, а SIGKILL немедленно прекращает его без возможности выполнить cleanup. Для сервера предпочтителен управляемый shutdown."}
        </Lead>

        <div className="lesson-practice-steps">
          <h3>{"SIGINT"}</h3>
          <p>{"Интерактивное прерывание из терминала."}</p>
          <h3>{"SIGTERM"}</h3>
          <p>{"Стандартный запрос штатного завершения."}</p>
          <h3>{"SIGKILL"}</h3>
          <p>{"Последняя мера без cleanup."}</p>
        </div>

        <CodeBlock
          caption={"минимальная модель или команда"}
          code={"kill -TERM 4127\n# процесс получает запрос завершиться\n\nkill -KILL 4127\n# немедленное прекращение без cleanup"}
        />

        <CompareSolutions
          question={"Какой вариант оставляет более ясную и воспроизводимую границу?"}
          left={{
            title: "Штатное завершение",
            code: "kill -TERM \"$PID\"",
            note: "Приложение получает возможность закрыть ресурсы.",
          }}
          right={{
            title: "Принудительное",
            code: "kill -KILL \"$PID\"",
            note: "ОС прекращает процесс немедленно.",
          }}
          preferred="left"
          explanation={"Для обычного restart сначала используется SIGTERM; SIGKILL нужен только если процесс не реагирует."}
        />

        <Callout tone="info">
          {"Сигнал не гарантирует успешный cleanup сам по себе: приложение и сервер должны корректно обрабатывать lifecycle."}
        </Callout>
      </Section>

      <Section number={"08"} title={"Контрольная точка и проектный результат"}>
        <Lead>
          {"Завершите занятие не чтением, а воспроизводимой проверкой: выполните основной сценарий, намеренно создайте ожидаемый сбой, устраните его по наблюдаемым данным и зафиксируйте процедуру в Linux-runbook."}
        </Lead>

        <div className="lesson-check-group">
          <QuizCard
            question={"Что идентифицирует конкретный запущенный процесс?"}
            options={[
              "PID",
              "имя файла",
              "Git tag",
            ]}
            correctIndex={0}
            explanation={"Правильный ответ следует из модели урока и проверяется конкретной командой, состоянием процесса или HTTP-result."}
          />
          <QuizCard
            question={"Почему второй сервер не занимает 8000?"}
            options={[
              "порт уже слушает другой процесс",
              "Python запрещает два терминала",
              "curl заблокировал порт",
            ]}
            correctIndex={0}
            explanation={"Правильный ответ следует из модели урока и проверяется конкретной командой, состоянием процесса или HTTP-result."}
          />
          <QuizCard
            question={"Чем проверить слушающий TCP-port?"}
            options={[
              "ss -ltnp",
              "pwd",
              "cat README",
            ]}
            correctIndex={0}
            explanation={"Правильный ответ следует из модели урока и проверяется конкретной командой, состоянием процесса или HTTP-result."}
          />
          <QuizCard
            question={"Какой сигнал предпочтителен для штатной остановки?"}
            options={[
              "SIGTERM",
              "SIGKILL всегда",
              "никакой",
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
            caption={"process и socket"}
            code={"ps -ef | grep '[u]vicorn'\nss -ltnp | grep ':8000'"}
          />
          <TerminalDemo
            title={"контрольный прогон"}
            lines={[
              { cmd: "ps -ef | grep '[u]vicorn'" },
              { out: "student 4127 python -m uvicorn app.main:app --port 8000" },
              { cmd: "ss -ltnp | grep ':8000'" },
              { out: "LISTEN 0 2048 127.0.0.1:8000" },
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
            <>{"Программа и процесс — разные сущности."}</>,
            <>{"PID относится к конкретному запуску."}</>,
            <>{"Host и port образуют сетевую точку входа."}</>,
            <>{"`ps`, `ss` и `curl` проверяют разные уровни."}</>,
            <>{"Конфликт порта требует определить владельца."}</>,
            <>{"SIGTERM даёт шанс на cleanup."}</>,
            <>{"Foreground упрощает первый разбор lifecycle."}</>,
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

        <PracticeCta text={"Добавьте в runbook раздел `Процесс и порт`: команду запуска, поиск PID, проверку `ss`, запрос `/health`, штатную остановку и сценарий конфликта порта."} />
      </Section>

    </RichLesson>
  );
}
