import { KeyRound, Layers } from "lucide-react";
import { BranchExplorer, BugHunt, Callout, CodeBlock, CompareSolutions, KeyTakeaways, Lead, MatchPairs, MethodGrid, PracticeCta, QuizCard, RecallCard, RichHero, RichLesson, Section, StepThrough, TerminalDemo, TypeCard, TypeCards } from "../../shared";
const BLOCK_TITLE = "Блок 29 · Linux, процессы, окружения и логи";

type LessonProps = { module?: string };

export function Lesson167({ module }: LessonProps) {
  return (
    <RichLesson>
      <RichHero
        variant="project"
        chip={module ?? BLOCK_TITLE}
        title={"Environment variables и конфигурация окружений"}
        intro={"Вынесем изменяемую конфигурацию из Python-кода: увидим environment variable как часть окружения процесса, разделим development, test и production, подготовим `.env.example` и заставим StudyHub завершаться при отсутствии обязательного секрета."}
        tags={[
          { icon: <KeyRound size={14} />, label: "config вне кода" },
          { icon: <Layers size={14} />, label: "development · test · production" },
        ]}
      />
      <Callout tone="info">
        <strong>Связь с курсом.</strong> {"Процесс уже имеет PID и порт. Следующий вопрос — какие значения он получает при старте и почему один и тот же код должен работать в нескольких окружениях."}{" "}
        <strong>Важно не перепутать:</strong> {"Environment variable не является секретным хранилищем сама по себе. Она только доставляет значение процессу; способ безопасной передачи остаётся ответственностью окружения."}
      </Callout>

      <Section number={"01"} title={"Почему config не хранится рядом с логикой"}>
        <Lead>
          {"URL базы, уровень логов и секреты меняются между окружениями. Если они записаны в исходном коде, любое переключение требует правки файла, нового commit и риска случайно опубликовать значение."}
        </Lead>

        <div className="lesson-practice-steps">
          <h3>{"Код"}</h3>
          <p>{"Описывает неизменяемую логику чтения настроек."}</p>
          <h3>{"Окружение"}</h3>
          <p>{"Передаёт конкретные значения при запуске."}</p>
          <h3>{"Результат"}</h3>
          <p>{"Один commit работает в dev, test и production."}</p>
        </div>

        <CodeBlock
          caption={"минимальная модель или команда"}
          code={"# плохо: значение зашито в код\nDATABASE_URL = \"postgresql://local-only\"\nSECRET_KEY = \"real-secret\"\n\n# лучше: код читает внешний config"}
        />

        <CompareSolutions
          question={"Какой вариант оставляет более ясную и воспроизводимую границу?"}
          left={{
            title: "Секрет в репозитории",
            code: "SECRET_KEY = \"prod-secret\"",
            note: "Значение попадает в историю Git.",
          }}
          right={{
            title: "Секрет приходит извне",
            code: "SECRET_KEY = os.environ[\"SECRET_KEY\"]",
            note: "Код хранит только имя обязательной настройки.",
          }}
          preferred="right"
          explanation={"Конфигурация меняется без редактирования Python-файла, а настоящий секрет не коммитится."}
        />

        <Callout tone="info">
          {"Даже удалённый из последнего commit секрет может остаться в истории Git. Его нужно считать скомпрометированным и заменить."}
        </Callout>
      </Section>

      <Section number={"02"} title={"Environment variable принадлежит процессу"}>
        <Lead>
          {"Shell хранит набор переменных и передаёт их дочернему процессу. Python читает собственное окружение через `os.environ` или `os.getenv`."}
        </Lead>

        <div className="lesson-practice-steps">
          <h3>{"Shell"}</h3>
          <p>{"Получает переменную через `export`."}</p>
          <h3>{"Process"}</h3>
          <p>{"Наследует значение при старте."}</p>
          <h3>{"Python"}</h3>
          <p>{"Читает его из `os.environ`."}</p>
        </div>

        <CodeBlock
          caption={"минимальная модель или команда"}
          code={"export APP_ENV=development\nexport LOG_LEVEL=DEBUG\npython scripts/show_config.py"}
        />

        <StepThrough
          code={"shell → process → Settings"}
          steps={[
            { line: 0, note: "Shell сохраняет значение.", vars: {"APP_ENV": "development"} },
            { line: 1, note: "Новый процесс наследует environment.", vars: {"process_env": "development"} },
            { line: 2, note: "Код читает строку.", vars: {"settings.app_env": "development"} },
          ]}
        />

        <Callout tone="info">
          {"Изменение переменной в другом терминале не переписывает окружение уже запущенного процесса."}
        </Callout>
      </Section>

      <Section number={"03"} title={"export, printenv и одноразовая переменная"}>
        <Lead>
          {"`export NAME=value` действует для последующих команд текущей shell-сессии. Запись `NAME=value command` передаёт значение только одному запуску, что удобно для контролируемого эксперимента."}
        </Lead>

        <div className="lesson-practice-steps">
          <h3>{"Постоянно в shell"}</h3>
          <p>{"`export` влияет на следующие дочерние процессы."}</p>
          <h3>{"Один запуск"}</h3>
          <p>{"Префикс перед командой действует локально."}</p>
          <h3>{"Проверка"}</h3>
          <p>{"`printenv` показывает текущее значение shell."}</p>
        </div>

        <CodeBlock
          caption={"минимальная модель или команда"}
          code={"export APP_ENV=development\nprintenv APP_ENV\n\nAPP_ENV=test python scripts/show_config.py\nprintenv APP_ENV  # снова development"}
        />

        <TerminalDemo
          title={"два окружения без изменения кода"}
          lines={[
            { cmd: "APP_ENV=development python scripts/show_config.py" },
            { out: "app_env=development" },
            { cmd: "APP_ENV=test python scripts/show_config.py" },
            { out: "app_env=test" },
            { cmd: "git diff -- app" },
            { out: "нет изменений" },
          ]}
        />

        <Callout tone="info">
          {"Runbook должен показывать источник config, а не требовать ручной правки `settings.py` перед каждым запуском."}
        </Callout>
      </Section>

      <Section number={"04"} title={"Settings как единая граница"}>
        <Lead>
          {"Остальной код не должен читать environment хаотично в десятках файлов. Объект Settings собирает, нормализует и проверяет конфигурацию один раз при старте."}
        </Lead>

        <div className="lesson-practice-steps">
          <h3>{"Сбор"}</h3>
          <p>{"Один loader читает environment."}</p>
          <h3>{"Проверка"}</h3>
          <p>{"Обязательное значение не имеет скрытого fallback."}</p>
          <h3>{"Передача"}</h3>
          <p>{"Приложение использует готовый Settings."}</p>
        </div>

        <CodeBlock
          caption={"минимальная модель или команда"}
          code={"from dataclasses import dataclass\nimport os\n\n@dataclass(frozen=True)\nclass Settings:\n    app_env: str\n    database_url: str\n    log_level: str\n\ndef load_settings() -> Settings:\n    return Settings(\n        app_env=os.getenv(\"APP_ENV\", \"development\"),\n        database_url=os.environ[\"DATABASE_URL\"],\n        log_level=os.getenv(\"LOG_LEVEL\", \"INFO\"),\n    )"}
        />

        <MatchPairs
          prompt={"Соедините обозначение и его эксплуатационный смысл."}
          pairs={[
            { left: "APP_ENV", right: "выбор режима приложения" },
            { left: "DATABASE_URL", right: "адрес основной базы" },
            { left: "LOG_LEVEL", right: "минимальный уровень событий" },
            { left: "SECRET_KEY", right: "криптографический секрет приложения" },
          ]}
          explanation={"Пары закрепляют не команду отдельно, а её место в диагностическом маршруте."}
        />

        <Callout tone="info">
          {"Значение по умолчанию допустимо для безопасной локальной настройки, но не для обязательного production-секрета."}
        </Callout>
      </Section>

      <Section number={"05"} title={"Development, test и production"}>
        <Lead>
          {"Окружения используют один код, но разные ресурсы и уровень строгости. Test не должен случайно подключаться к production database, а production не должен стартовать с debug-секретом."}
        </Lead>

        <div className="lesson-practice-steps">
          <h3>{"Development"}</h3>
          <p>{"Быстрая локальная обратная связь."}</p>
          <h3>{"Test"}</h3>
          <p>{"Изоляция и воспроизводимость."}</p>
          <h3>{"Production"}</h3>
          <p>{"Безопасные внешние ресурсы и строгая конфигурация."}</p>
        </div>

        <CodeBlock
          caption={"минимальная модель или команда"}
          code={"development → local database, DEBUG logs\ntest        → isolated database, deterministic config\nproduction  → managed database, INFO logs, real secrets"}
        />

        <TypeCards>
          <TypeCard badge={"dev"} title={"Development"} code={"APP_ENV=development"}>
            {"Локальная база и подробные логи."}
          </TypeCard>
          <TypeCard badge={"test"} badgeTone="float" title={"Test"} code={"APP_ENV=test"}>
            {"Отдельная база и предсказуемые значения."}
          </TypeCard>
          <TypeCard badge={"prod"} badgeTone="str" title={"Production"} code={"APP_ENV=production"}>
            {"Нет локальных fallback для секретов."}
          </TypeCard>
        </TypeCards>

        <Callout tone="info">
          {"Название окружения не должно менять бизнес-правила. Оно выбирает инфраструктурные значения и режим диагностики."}
        </Callout>
      </Section>

      <Section number={"06"} title={".env, .env.example и Git"}>
        <Lead>
          {"`.env.example` документирует имена переменных и безопасные примеры. Настоящий `.env` содержит локальные значения и исключается из Git. Production-секреты не должны храниться в репозитории."}
        </Lead>

        <div className="lesson-practice-steps">
          <h3>{"Шаблон"}</h3>
          <p>{"Коммитится и объясняет обязательные имена."}</p>
          <h3>{"Локальный файл"}</h3>
          <p>{"Не коммитится и содержит значения разработчика."}</p>
          <h3>{"Production"}</h3>
          <p>{"Получает секреты из среды развертывания."}</p>
        </div>

        <CodeBlock
          caption={"минимальная модель или команда"}
          code={"# .env.example\nAPP_ENV=development\nDATABASE_URL=postgresql://user:password@localhost/studyhub\nLOG_LEVEL=INFO\nSECRET_KEY=replace-me\n\n# .gitignore\n.env\n.env.*\n!.env.example"}
        />

        <BugHunt
          code={"# .env\nSECRET_KEY=prod-real-secret\n\n$ git add .env\n$ git commit -m \"add config\""}
          question={"В чём главная проблема?"}
          options={[
            "Настоящий секрет попадает в историю репозитория",
            "Файл должен называться settings.py",
            "Git не поддерживает текст",
          ]}
          correctIndex={0}
          explanation={"Секрет необходимо удалить из истории по процедуре и немедленно ротировать."}
          fix={"# .gitignore\n.env\n.env.*\n!.env.example\n\n# commit only .env.example"}
        />

        <Callout tone="info">
          {"`.gitignore` предотвращает новый commit, но не удаляет файл, который уже отслеживается Git."}
        </Callout>
      </Section>

      <Section number={"07"} title={"Fail fast при отсутствующей конфигурации"}>
        <Lead>
          {"Если `DATABASE_URL` или `SECRET_KEY` обязательны, приложение должно остановиться при старте с понятным сообщением. Поздний сбой на первом request усложняет диагностику."}
        </Lead>

        <div className="lesson-practice-steps">
          <h3>{"Старт"}</h3>
          <p>{"Настройки загружаются до обслуживания traffic."}</p>
          <h3>{"Ошибка"}</h3>
          <p>{"Сообщение называет отсутствующее имя."}</p>
          <h3>{"Исправление"}</h3>
          <p>{"Оператор задаёт variable и перезапускает процесс."}</p>
        </div>

        <CodeBlock
          caption={"минимальная модель или команда"}
          code={"import os\n\ndef require_env(name: str) -> str:\n    value = os.getenv(name)\n    if not value:\n        raise RuntimeError(f\"Missing required environment variable: {name}\")\n    return value\n\nDATABASE_URL = require_env(\"DATABASE_URL\")"}
        />

        <BranchExplorer
          code={"database_url = os.getenv(\"DATABASE_URL\")\nif not database_url:\n    fail_startup(\"DATABASE_URL\")\nelif database_url.startswith(\"postgresql\"):\n    start_application()\nelse:\n    fail_startup(\"unsupported database URL\")"}
          scenarios={[
            { label: "variable отсутствует", activeLine: 2, output: "startup failed: DATABASE_URL missing" },
            { label: "корректный PostgreSQL URL", activeLine: 4, output: "application starts" },
            { label: "неподдерживаемое значение", activeLine: 6, output: "startup failed: unsupported URL" },
          ]}
        />

        <Callout tone="info">
          {"Fail fast должен сообщать имя настройки, но не печатать секретное значение целиком."}
        </Callout>
      </Section>

      <Section number={"08"} title={"Контрольная точка и проектный результат"}>
        <Lead>
          {"Завершите занятие не чтением, а воспроизводимой проверкой: выполните основной сценарий, намеренно создайте ожидаемый сбой, устраните его по наблюдаемым данным и зафиксируйте процедуру в Linux-runbook."}
        </Lead>

        <div className="lesson-check-group">
          <QuizCard
            question={"Где должен находиться production SECRET_KEY?"}
            options={[
              "в окружении развертывания, не в Git",
              "в README",
              "в названии branch",
            ]}
            correctIndex={0}
            explanation={"Правильный ответ следует из модели урока и проверяется конкретной командой, состоянием процесса или HTTP-result."}
          />
          <QuizCard
            question={"Что делает `NAME=value command`?"}
            options={[
              "задаёт variable одному запуску",
              "меняет Git config",
              "создаёт файл",
            ]}
            correctIndex={0}
            explanation={"Правильный ответ следует из модели урока и проверяется конкретной командой, состоянием процесса или HTTP-result."}
          />
          <QuizCard
            question={"Зачем нужен Settings?"}
            options={[
              "собрать и проверить config в одной границе",
              "ускорить CPU",
              "заменить database",
            ]}
            correctIndex={0}
            explanation={"Правильный ответ следует из модели урока и проверяется конкретной командой, состоянием процесса или HTTP-result."}
          />
          <QuizCard
            question={"Что означает fail fast?"}
            options={[
              "остановить startup при неверном обязательном config",
              "скрыть ошибку",
              "использовать пустой секрет",
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
            caption={"обязательный config"}
            code={"test -n \"$DATABASE_URL\" && echo database-url-ok"}
          />
          <TerminalDemo
            title={"контрольный прогон"}
            lines={[
              { cmd: "test -n \"$DATABASE_URL\" && echo database-url-ok" },
              { out: "database-url-ok" },
              { cmd: "APP_ENV=test python scripts/show_config.py" },
              { out: "app_env=test" },
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
            <>{"Environment передаётся процессу при старте."}</>,
            <>{"Один код работает с разными config."}</>,
            <>{"Settings централизует чтение и проверку."}</>,
            <>{"`.env.example` документирует имена без настоящих секретов."}</>,
            <>{"Настоящий `.env` не коммитится."}</>,
            <>{"Test database изолируется от production."}</>,
            <>{"Обязательные настройки проверяются до traffic."}</>,
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

        <PracticeCta text={"Расширьте runbook разделом `Конфигурация`: перечислите APP_ENV, DATABASE_URL, LOG_LEVEL и SECRET_KEY, добавьте `.env.example`, проверку обязательных значений и два запуска без изменения кода."} />
      </Section>

    </RichLesson>
  );
}
