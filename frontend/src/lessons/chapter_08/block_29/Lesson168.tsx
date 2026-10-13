import { FileText, Search } from "lucide-react";
import { BugHunt, Callout, CodeBlock, CodeSequence, CompareSolutions, KeyTakeaways, Lead, MatchPairs, MethodGrid, PracticeCta, QuizCard, RecallCard, RichHero, RichLesson, Section, StepThrough, TerminalDemo, TypeCard, TypeCards } from "../../shared";
const BLOCK_TITLE = "Блок 29 · Linux, процессы, окружения и логи";

type LessonProps = { module?: string };

export function Lesson168({ module }: LessonProps) {
  return (
    <RichLesson>
      <RichHero
        variant="project"
        chip={module ?? BLOCK_TITLE}
        title={"stdout, stderr и структурированные логи"}
        intro={"Перейдём от случайных `print` к диагностируемым событиям: разделим stdout и stderr, настроим уровни logging, добавим request id и operation, сохраним traceback через `logger.exception` и исключим пароли и токены."}
        tags={[
          { icon: <FileText size={14} />, label: "события вместо print" },
          { icon: <Search size={14} />, label: "request id и traceback" },
        ]}
      />
      <Callout tone="info">
        <strong>Связь с курсом.</strong> {"Конфигурация уже приходит извне, поэтому LOG_LEVEL может управлять детализацией без правки кода. Логи становятся главным следом процесса в Linux и будущем container."}{" "}
        <strong>Важно не перепутать:</strong> {"Лог — техническое событие для диагностики, а HTTP-response — контракт клиента. Traceback нужен разработчику, но не должен возвращаться пользователю целиком."}
      </Callout>

      <Section number={"01"} title={"Почему print перестаёт хватать"}>
        <Lead>
          {"`print(\"ошибка\")` не сообщает время, уровень, operation или request. Когда несколько запросов выполняются рядом, строки невозможно уверенно связать с одним сценарием."}
        </Lead>

        <div className="lesson-practice-steps">
          <h3>{"Событие"}</h3>
          <p>{"Что именно произошло."}</p>
          <h3>{"Контекст"}</h3>
          <p>{"С каким request и объектом."}</p>
          <h3>{"Уровень"}</h3>
          <p>{"Насколько срочно нужна реакция."}</p>
        </div>

        <CodeBlock
          caption={"минимальная модель или команда"}
          code={"print(\"error\")\n\n# диагностическое событие\n2026-07-21T15:20:12Z ERROR task_load_failed request_id=req-42 user_id=7"}
        />

        <CompareSolutions
          question={"Какой вариант оставляет более ясную и воспроизводимую границу?"}
          left={{
            title: "Случайная строка",
            code: "print(\"problem\")",
            note: "Неясно где, когда и с чем.",
          }}
          right={{
            title: "Диагностическое событие",
            code: "logger.error(\"task_load_failed request_id=%s task_id=%s\", request_id, task_id)",
            note: "Содержит стабильное имя и контекст.",
          }}
          preferred="right"
          explanation={"Хороший лог помогает найти запрос и операцию без чтения исходного кода."}
        />

        <Callout tone="info">
          {"Логи не должны дублировать весь request body. Сначала выбираются минимальные поля для расследования."}
        </Callout>
      </Section>

      <Section number={"02"} title={"stdout и stderr как два потока"}>
        <Lead>
          {"Процесс имеет стандартный поток вывода и поток ошибок. В Linux оба можно перенаправлять отдельно; logging handler обычно пишет в stderr, а полезный машинный результат CLI может идти в stdout."}
        </Lead>

        <div className="lesson-practice-steps">
          <h3>{"stdout"}</h3>
          <p>{"Нормальный вывод программы."}</p>
          <h3>{"stderr"}</h3>
          <p>{"Диагностика и ошибки."}</p>
          <h3>{"Redirect"}</h3>
          <p>{"Shell направляет потоки в разные файлы."}</p>
        </div>

        <CodeBlock
          caption={"минимальная модель или команда"}
          code={"python script.py >stdout.log 2>stderr.log\n\n# stdout.log  — обычный результат\n# stderr.log  — warnings, errors, traceback"}
        />

        <TerminalDemo
          title={"разделяем потоки"}
          lines={[
            { cmd: "python scripts/log_demo.py >out.log 2>err.log" },
            { cmd: "cat out.log" },
            { out: "result=ok" },
            { cmd: "cat err.log" },
            { out: "WARNING configuration fallback used" },
          ]}
        />

        <Callout tone="info">
          {"В server-приложении оба потока обычно собирает среда запуска. Не нужно писать собственный бесконечный файл без стратегии rotation."}
        </Callout>
      </Section>

      <Section number={"03"} title={"Уровни DEBUG, INFO, WARNING и ERROR"}>
        <Lead>
          {"Уровень отвечает не за эмоциональность сообщения, а за эксплуатационный смысл. DEBUG помогает разработке, INFO фиксирует нормальный lifecycle, WARNING показывает необычное восстановимое состояние, ERROR — неуспешную операцию."}
        </Lead>

        <div className="lesson-practice-steps">
          <h3>{"DEBUG"}</h3>
          <p>{"Детали диагностики, обычно выключены в production."}</p>
          <h3>{"INFO"}</h3>
          <p>{"Нормальные значимые события."}</p>
          <h3>{"WARNING"}</h3>
          <p>{"Необычное состояние без полного отказа."}</p>
          <h3>{"ERROR"}</h3>
          <p>{"Операция не завершилась успешно."}</p>
        </div>

        <CodeBlock
          caption={"минимальная модель или команда"}
          code={"DEBUG   parsed_query_params\nINFO    request_completed\nWARNING deprecated_client_version\nERROR   database_query_failed"}
        />

        <MatchPairs
          prompt={"Соедините обозначение и его эксплуатационный смысл."}
          pairs={[
            { left: "DEBUG", right: "подробности разбора фильтра" },
            { left: "INFO", right: "приложение успешно стартовало" },
            { left: "WARNING", right: "использован fallback" },
            { left: "ERROR", right: "запрос к базе завершился ошибкой" },
          ]}
          explanation={"Пары закрепляют не команду отдельно, а её место в диагностическом маршруте."}
        />

        <Callout tone="info">
          {"Не повышайте каждое исключение до CRITICAL. Уровень выбирается по влиянию на операцию и сервис."}
        </Callout>
      </Section>

      <Section number={"04"} title={"Настройка logging из environment"}>
        <Lead>
          {"LOG_LEVEL считывается один раз при старте. Формат включает timestamp, level, logger name и message; код модулей получает именованный logger через `logging.getLogger`."}
        </Lead>

        <div className="lesson-practice-steps">
          <h3>{"Config"}</h3>
          <p>{"Один раз на entry point."}</p>
          <h3>{"Logger"}</h3>
          <p>{"Имя показывает источник события."}</p>
          <h3>{"Message"}</h3>
          <p>{"Стабильное имя и key=value контекст."}</p>
        </div>

        <CodeBlock
          caption={"минимальная модель или команда"}
          code={"import logging\nimport os\n\nlogging.basicConfig(\n    level=os.getenv(\"LOG_LEVEL\", \"INFO\"),\n    format=\"%(asctime)s %(levelname)s %(name)s %(message)s\",\n)\n\nlogger = logging.getLogger(\"studyhub.api\")\nlogger.info(\"application_started app_env=%s\", os.getenv(\"APP_ENV\", \"development\"))"}
        />

        <StepThrough
          code={"config → logger → record"}
          steps={[
            { line: 0, note: "Создаётся базовый handler и format.", vars: {"level": "INFO"} },
            { line: 1, note: "Модуль получает именованный logger.", vars: {"logger": "studyhub.api"} },
            { line: 2, note: "Формируется LogRecord.", vars: {"event": "application_started"} },
          ]}
        />

        <Callout tone="info">
          {"`basicConfig` должен выполняться до первых сообщений приложения, иначе ранние события могут получить другой handler или format."}
        </Callout>
      </Section>

      <Section number={"05"} title={"Request id связывает путь одного запроса"}>
        <Lead>
          {"Request id создаётся на границе HTTP и добавляется в каждое ключевое событие. По нему можно собрать startup запроса, database-operation и финальный status даже среди параллельных логов."}
        </Lead>

        <div className="lesson-practice-steps">
          <h3>{"Создание"}</h3>
          <p>{"ID появляется в начале request."}</p>
          <h3>{"Передача"}</h3>
          <p>{"Контекст сопровождает внутренние операции."}</p>
          <h3>{"Поиск"}</h3>
          <p>{"grep по ID восстанавливает timeline."}</p>
        </div>

        <CodeBlock
          caption={"минимальная модель или команда"}
          code={"request_started request_id=req-42 method=GET path=/tasks\ndatabase_query request_id=req-42 operation=list_tasks\nrequest_completed request_id=req-42 status=200 duration_ms=18"}
        />

        <TypeCards>
          <TypeCard badge={"request"} title={"Request context"} code={"request_id=req-42"}>
            {"Связывает события одного HTTP-запроса."}
          </TypeCard>
          <TypeCard badge={"user"} badgeTone="float" title={"Subject context"} code={"user_id=7"}>
            {"Помогает найти затронутого пользователя без email."}
          </TypeCard>
          <TypeCard badge={"operation"} badgeTone="str" title={"Action context"} code={"operation=list_tasks"}>
            {"Называет технический шаг."}
          </TypeCard>
        </TypeCards>

        <Callout tone="info">
          {"Не используйте access token или session id как request id: это секреты с другим жизненным циклом."}
        </Callout>
      </Section>

      <Section number={"06"} title={"Traceback через logger.exception"}>
        <Lead>
          {"Внутри `except` метод `logger.exception` добавляет текущий traceback. Клиент получает безопасный error contract, а серверный лог сохраняет путь до причины."}
        </Lead>

        <div className="lesson-practice-steps">
          <h3>{"Перехват"}</h3>
          <p>{"Граница знает request context."}</p>
          <h3>{"Запись"}</h3>
          <p>{"`logger.exception` добавляет traceback."}</p>
          <h3>{"Контракт"}</h3>
          <p>{"Внешний response не раскрывает внутренности."}</p>
        </div>

        <CodeBlock
          caption={"минимальная модель или команда"}
          code={"try:\n    tasks = await repository.list_tasks(user_id)\nexcept Exception:\n    logger.exception(\n        \"task_list_failed request_id=%s user_id=%s\",\n        request_id,\n        user_id,\n    )\n    raise"}
        />

        <BugHunt
          code={"except Exception as exc:\n    logger.error(\"failed password=%s token=%s error=%s\", password, token, exc)"}
          question={"Почему этот лог опасен?"}
          options={[
            "Он записывает пароль и token",
            "logger.error нельзя вызывать в except",
            "Exception нельзя преобразовать в строку",
          ]}
          correctIndex={0}
          explanation={"Credentials могут попасть в терминал, агрегатор логов и резервные копии."}
          fix={"except Exception:\n    logger.exception(\n        \"login_failed request_id=%s user_id=%s\",\n        request_id,\n        user_id,\n    )"}
        />

        <Callout tone="info">
          {"Даже DEBUG-log не является безопасным местом для пароля, access token, refresh token или полного cookie."}
        </Callout>
      </Section>

      <Section number={"07"} title={"Чтение последних логов и фильтрация"}>
        <Lead>
          {"В локальной Linux-среде `tail` показывает свежие строки, `grep` оставляет нужный request id или уровень. Runbook должен предлагать узкий поиск, а не чтение тысяч строк вручную."}
        </Lead>

        <div className="lesson-practice-steps">
          <h3>{"Окно"}</h3>
          <p>{"Сначала последние 100 строк."}</p>
          <h3>{"Корреляция"}</h3>
          <p>{"Затем конкретный request id."}</p>
          <h3>{"Ошибка"}</h3>
          <p>{"Отдельно найти ERROR рядом по времени."}</p>
        </div>

        <CodeBlock
          caption={"минимальная модель или команда"}
          code={"tail -n 100 logs/app.log\ngrep 'request_id=req-42' logs/app.log\ngrep ' ERROR ' logs/app.log | tail -n 20"}
        />

        <CodeSequence
          title={"Соберите безопасный порядок действий"}
          prompt={"Выберите только необходимые шаги и расположите их так, чтобы каждое предположение проверялось до изменения системы."}
          pieces={[
            { id: "tail", code: "tail -n 100 logs/app.log" },
            { id: "request", code: "grep 'request_id=req-42' logs/app.log" },
            { id: "error", code: "grep ' ERROR ' logs/app.log | tail -n 20" },
            { id: "context", code: "сопоставить timestamp и operation" },
            { id: "dump", code: "cat logs/app.log", note: "слишком широкий первый шаг" },
          ]}
          correctOrder={["tail", "request", "error", "context"]}
          explanation={"Поиск сужается от свежего окна к одному request и конкретной операции."}
        />

        <Callout tone="info">
          {"В container-среде источник логов изменится, но модель останется: получить свежие события → отфильтровать correlation id → найти traceback."}
        </Callout>
      </Section>

      <Section number={"08"} title={"Контрольная точка и проектный результат"}>
        <Lead>
          {"Завершите занятие не чтением, а воспроизводимой проверкой: выполните основной сценарий, намеренно создайте ожидаемый сбой, устраните его по наблюдаемым данным и зафиксируйте процедуру в Linux-runbook."}
        </Lead>

        <div className="lesson-check-group">
          <QuizCard
            question={"Для чего нужен request id?"}
            options={[
              "связать события одного запроса",
              "заменить пароль",
              "выбрать порт",
            ]}
            correctIndex={0}
            explanation={"Правильный ответ следует из модели урока и проверяется конкретной командой, состоянием процесса или HTTP-result."}
          />
          <QuizCard
            question={"Что делает logger.exception внутри except?"}
            options={[
              "добавляет текущий traceback",
              "останавливает ОС",
              "удаляет лог",
            ]}
            correctIndex={0}
            explanation={"Правильный ответ следует из модели урока и проверяется конкретной командой, состоянием процесса или HTTP-result."}
          />
          <QuizCard
            question={"Какой уровень подходит успешному startup?"}
            options={[
              "INFO",
              "ERROR",
              "CRITICAL всегда",
            ]}
            correctIndex={0}
            explanation={"Правильный ответ следует из модели урока и проверяется конкретной командой, состоянием процесса или HTTP-result."}
          />
          <QuizCard
            question={"Что нельзя записывать в лог?"}
            options={[
              "пароли и токены",
              "operation name",
              "status code",
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
            caption={"поиск request timeline"}
            code={"tail -n 100 logs/app.log\ngrep 'request_id=req-42' logs/app.log"}
          />
          <TerminalDemo
            title={"контрольный прогон"}
            lines={[
              { cmd: "grep 'request_id=req-42' logs/app.log" },
              { out: "INFO request_started request_id=req-42" },
              { out: "INFO request_completed request_id=req-42 status=200" },
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
            <>{"Logging создаёт события с уровнем и контекстом."}</>,
            <>{"stdout и stderr можно перенаправлять отдельно."}</>,
            <>{"LOG_LEVEL приходит из environment."}</>,
            <>{"Request id связывает timeline одного запроса."}</>,
            <>{"`logger.exception` сохраняет traceback."}</>,
            <>{"HTTP-response не раскрывает server traceback."}</>,
            <>{"Секреты не попадают ни в один уровень логов."}</>,
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

        <PracticeCta text={"Добавьте в StudyHub именованный logger, startup-событие, request id, событие завершения и один ожидаемый error с traceback. В runbook зафиксируйте `tail` и фильтрацию по request id."} />
      </Section>

    </RichLesson>
  );
}
