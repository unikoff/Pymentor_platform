import { Save, ShieldCheck } from "lucide-react";
import { BugHunt, Callout, CodeBlock, CodeSequence, CompareSolutions, KeyTakeaways, Lead, MethodGrid, PracticeCta, QuizCard, RecallCard, RichHero, RichLesson, Section, StepThrough, TerminalDemo, TrueFalse, TypeCard, TypeCards } from "../../shared";
const BLOCK_TITLE = "Блок 24 · Индексы, планы запросов и модели хранения";

export function Lesson138({ module }: { module?: string }) {
  return (
    <RichLesson>
      <RichHero
        variant="project"
        chip={module ?? BLOCK_TITLE}
        title={"Backup, restore и проверка восстановления"}
        intro={"Построим не просто команду pg_dump, а проверяемую процедуру: создадим backup, восстановим его в отдельную базу, сверим данные и запустим smoke tests."}
        tags={[
          {
            icon: <Save size={14} />,
            label: "pg_dump и pg_restore",
          },
          {
            icon: <ShieldCheck size={14} />,
            label: "restore drill",
          },
        ]}
      />
      <Callout tone="info">
        <strong>{"Связь с курсом."}</strong>
        {" "}
        {"Миграции уже воспроизводят структуру PostgreSQL StudyHub, но они не возвращают пользовательские данные. Для потери данных нужна отдельная стратегия backup и restore."}
        {" "}
        <strong>{"Важно не перепутать:"}</strong>
        {" "}
        {"Файл backup не считается надёжным, пока его не удалось восстановить и проверить. Наличие архива и работоспособное восстановление — разные факты."}
      </Callout>
      <Section number={"01"} title={"Проблема и маршрут занятия"}>
        <Lead>
          {"Построим не просто команду pg_dump, а проверяемую процедуру: создадим backup, восстановим его в отдельную базу, сверим данные и запустим smoke tests."}
        </Lead>
        <div className="lesson-route">
          <ol>
            <li>
              <strong>{"Выбрать формат."}</strong>
              {" "}
              {"plain SQL удобно читать, custom format гибче восстанавливать через pg_restore."}
            </li>
            <li>
              <strong>{"Создать backup."}</strong>
              {" "}
              {"зафиксировать команду, время и источник."}
            </li>
            <li>
              <strong>{"Восстановить отдельно."}</strong>
              {" "}
              {"не проверять процедуру поверх единственной рабочей базы."}
            </li>
            <li>
              <strong>{"Подтвердить результат."}</strong>
              {" "}
              {"сверить таблицы, row counts и ключевые API-сценарии."}
            </li>
          </ol>
          <p>{"Результат занятия становится частью общего аудита PostgreSQL StudyHub."}</p>
        </div>
        <TypeCards>
          <TypeCard
            badge={"migration"}
            title={"История схемы"}
            code={"alembic upgrade head"}
          >
            {"Создаёт таблицы и индексы, но не возвращает реальные данные."}
          </TypeCard>
          <TypeCard
            badge={"backup"}
            badgeTone={"float"}
            title={"Снимок схемы и данных"}
            code={"pg_dump -Fc"}
          >
            {"Хранит состояние базы на момент создания."}
          </TypeCard>
          <TypeCard
            badge={"restore"}
            badgeTone={"str"}
            title={"Проверка восстановления"}
            code={"studyhub_restore_test"}
          >
            {"Разворачивает снимок в отдельной database и проходит smoke tests."}
          </TypeCard>
        </TypeCards>
        <Callout tone="info">
          {"Сначала сформулируйте наблюдаемую проблему и критерий успеха. Инструмент появляется только после этого."}
        </Callout>
      </Section>
      <Section number={"02"} title={"Главная модель и термины"}>
        <Lead>
          {"Миграции уже воспроизводят структуру PostgreSQL StudyHub, но они не возвращают пользовательские данные. Для потери данных нужна отдельная стратегия backup и restore."}
        </Lead>
        <MethodGrid
          rows={[
            [<>{"plain format"}</>, "SQL-текст; восстанавливается через psql"],
            [<>{"custom format"}</>, "архив pg_dump; восстанавливается через pg_restore"],
            [<>{"schema + data"}</>, "структура и строки на момент backup"],
            [<>{"restore target"}</>, "отдельная пустая database для проверки"],
            [<>{"smoke test"}</>, "короткий набор критических сценариев после restore"],
          ]}
        />
        <CodeBlock
          caption={"custom backup без пароля в истории shell"}
          code={[
          "export PGPASSWORD=\"$POSTGRES_PASSWORD\"",
          "pg_dump   --format=custom   --file=backups/studyhub.dump   \"$DATABASE_URL\"",
        ] .join(String.fromCharCode(10))}
        />
        <RecallCard
          question={"Объясните главную модель этого раздела без терминов из документации."}
          hint={"Назовите вход, выполняемую работу и наблюдаемый результат."}
          answer={
            <p>{"Файл backup не считается надёжным, пока его не удалось восстановить и проверить. Наличие архива и работоспособное восстановление — разные факты."}</p>
          }
        />
      </Section>
      <Section number={"03"} title={"Процедура считается завершённой после restore"}>
        <Lead>
          {"Архив проходит путь от рабочей базы до отдельной восстановленной базы. Только после проверки строк и API можно считать backup пригодным."}
        </Lead>
        <StepThrough
          code={[
          "PostgreSQL StudyHub",
          "  -> pg_dump",
          "  -> backups/studyhub.dump",
          "  -> createdb studyhub_restore_test",
          "  -> pg_restore",
          "  -> row counts + smoke tests",
        ] .join(String.fromCharCode(10))}
          steps={[
            {
              line: 0,
              note: "Источник должен быть явно назван и доступен.",
              vars: {"source": "studyhub"},
            },
            {
              line: 1,
              note: "pg_dump читает согласованное состояние базы.",
              vars: {"artifact": "dump"},
            },
            {
              line: 2,
              note: "Файл backup хранится отдельно от самой database.",
              vars: {"file": "studyhub.dump"},
            },
            {
              line: 3,
              note: "Создаётся отдельная цель восстановления.",
              vars: {"target": "studyhub_restore_test"},
            },
            {
              line: 4,
              note: "pg_restore разворачивает структуру и данные.",
              vars: {"restore": "running"},
            },
            {
              line: 5,
              note: "Проверки подтверждают пригодность результата.",
              vars: {"status": "verified"},
            },
          ]}
        />
        <Callout tone="info">
          {"Пошаговый разбор нужен не для запоминания вывода, а для объяснения причин каждого перехода."}
        </Callout>
        <TrueFalse
          statement={<>{"Файл backup не считается надёжным, пока его не удалось восстановить и проверить. Наличие архива и работоспособное восстановление — разные факты."}</>}
          isTrue={true}
          explanation={"Это ключевая граница урока: без неё инструмент легко применить механически."}
        />
      </Section>
      <Section number={"04"} title={"Соберите безопасный restore drill"}>
        <Lead>
          {"Сейчас нужно не копировать готовую команду, а выбрать ветку или структуру по требованиям конкретного сценария."}
        </Lead>
        <CodeSequence
          title={"Соберите безопасный restore drill"}
          prompt={"Расположите действия в безопасном порядке."}
          pieces={[
            { id: "dump", code: "создать custom backup" },
            { id: "db", code: "создать пустую studyhub_restore_test" },
            { id: "restore", code: "выполнить pg_restore" },
            { id: "counts", code: "сверить row counts" },
            { id: "smoke", code: "запустить smoke tests" },
            { id: "prod", code: "восстановить поверх production", note: "опасный шаг" },
          ]}
          correctOrder={["dump", "db", "restore", "counts", "smoke"]}
          explanation={"Проверка идёт в отдельной базе и заканчивается наблюдаемыми проверками данных и приложения."}
        />
        <Callout>
          {"После выбора проговорите, какое условие изменило решение и какой альтернативный результат был бы возможен."}
        </Callout>
      </Section>
      <Section number={"05"} title={"Сравнение решений и цена выбора"}>
        <Lead>
          {"Два варианта могут быть синтаксически корректны, но только один соответствует измеряемому query pattern, модели данных или эксплуатационной процедуре."}
        </Lead>
        <CompareSolutions
          question={"Что подтверждает готовность к восстановлению?"}
          left={{
            title: "Файл существует",
            code: "ls -lh backups/studyhub.dump",
            note: "Мы знаем только размер и дату файла, но не знаем, читается ли он и полон ли набор данных.",
          }}
          right={{
            title: "Restore drill прошёл",
            code: [
          "pg_restore ... studyhub_restore_test",
          "pytest tests/smoke",
        ] .join(String.fromCharCode(10)),
            note: "Архив развёрнут в отдельную базу, строки сверены, критические сценарии работают.",
          }}
          preferred={"right"}
          explanation={"Надёжность backup подтверждается успешным восстановлением, а не самим фактом наличия файла."}
        />
        <TrueFalse
          statement={<>{"Корректный синтаксис сам по себе ещё не доказывает, что решение подходит проектному сценарию."}</>}
          isTrue={true}
          explanation={"Решение оценивается по query pattern, модели данных, измерению и эксплуатационной цене."}
        />
        <div className="lesson-practice-steps">
          <h3>{"Вопрос перед изменением"}</h3>
          <p>{"Какую конкретную работу перестанет выполнять система или какую гарантию добавит выбранный вариант?"}</p>
          <h3>{"Вопрос после изменения"}</h3>
          <p>{"Каким измерением, plan, smoke test или наблюдаемым сценарием подтверждается результат?"}</p>
          <h3>{"Граница"}</h3>
          <p>{"Файл backup не считается надёжным, пока его не удалось восстановить и проверить. Наличие архива и работоспособное восстановление — разные факты."}</p>
        </div>
      </Section>
      <Section number={"06"} title={"Runbook восстановления StudyHub"}>
        <Lead>
          {"Команды должны быть воспроизводимы другим разработчиком. В README фиксируем prerequisites, переменные, создание цели, restore, проверку и очистку тестовой базы."}
        </Lead>
        <CodeBlock
          caption={"scripts/restore_check.sh"}
          code={[
          "set -euo pipefail",
          "",
          "createdb studyhub_restore_test",
          "pg_restore   --no-owner   --dbname=studyhub_restore_test   backups/studyhub.dump",
          "",
          "psql studyhub_restore_test   -c \"SELECT COUNT(*) FROM tasks;\"",
          "",
          "TEST_DATABASE_URL=postgresql://localhost/studyhub_restore_test   pytest tests/smoke -q",
        ] .join(String.fromCharCode(10))}
        />
        <TerminalDemo
          title={"проверка в терминале"}
          lines={[
            { cmd: "pg_dump -Fc -f backups/studyhub.dump \"$DATABASE_URL\"" },
            { cmd: "createdb studyhub_restore_test" },
            { cmd: "pg_restore --no-owner -d studyhub_restore_test backups/studyhub.dump" },
            { cmd: "psql studyhub_restore_test -c \"SELECT COUNT(*) FROM tasks\"" },
            { out: "100000" },
            { cmd: "TEST_DATABASE_URL=postgresql://localhost/studyhub_restore_test pytest tests/smoke -q" },
            { out: "5 passed" },
          ]}
        />
        <div className="lesson-practice-steps">
          <h3>{"До запуска"}</h3>
          <p>{"Зафиксируйте входные данные, версию команды и ожидаемый наблюдаемый результат."}</p>
          <h3>{"После запуска"}</h3>
          <p>{"Сохраните фактический вывод, сравните его с ожиданием и объясните расхождение."}</p>
          <h3>{"Перед коммитом"}</h3>
          <p>{"Повторите успешный и ошибочный сценарий из чистого состояния."}</p>
        </div>
        <Callout tone="info">
          {"Проектный артефакт должен запускаться повторно: SQL-файл, migration, script, test или runbook сохраняется в репозитории."}
        </Callout>
      </Section>
      <Section number={"07"} title={"Диагностика ошибки и объяснение результата"}>
        <Lead>
          {"Профессиональный сценарий включает не только успех. Найдите ошибочное предположение, исправьте минимальную часть и повторите прежнюю проверку."}
        </Lead>
        <MethodGrid
          rows={[
            [<>{"наблюдение"}</>, "записать точный вывод, plan, row count или cache result"],
            [<>{"ожидание"}</>, "назвать результат, который считался правильным"],
            [<>{"расхождение"}</>, "найти первое место, где факт перестал совпадать с ожиданием"],
            [<>{"минимальное исправление"}</>, "изменить одну причину и повторить прежнюю проверку"],
          ]}
        />
        <BugHunt
          code={"pg_restore   --dbname=studyhub   backups/studyhub.dump"}
          question={"Какая главная ошибка в учебной проверке?"}
          options={[
            "Restore выполняется прямо в рабочую database",
            "pg_restore не поддерживает custom format",
            "Имя файла слишком длинное",
          ]}
          correctIndex={0}
          explanation={"Проверку нельзя проводить поверх единственной рабочей базы: ошибка может повредить или смешать данные."}
          fix={[
          "createdb studyhub_restore_test",
          "pg_restore   --no-owner   --dbname=studyhub_restore_test   backups/studyhub.dump",
        ] .join(String.fromCharCode(10))}
        />
        <RecallCard
          question={"Чем migration отличается от backup?"}
          answer={
            <p>{"Migration описывает изменение схемы между версиями. Backup хранит состояние схемы и данных на конкретный момент и нужен для восстановления после потери."}</p>
          }
        />
        <Callout>
          {"Не скрывайте ошибку новой технологией. Сначала назовите нарушенное ожидание, затем покажите проверяемое исправление."}
        </Callout>
      </Section>
      <Section number={"08"} title={"Контрольная точка и практика"}>
        <Lead>
          {"Урок завершён, когда вы можете воспроизвести сценарий, объяснить выбранный инструмент и показать отрицательный путь без подсказки."}
        </Lead>
        <TypeCards>
          <TypeCard
            badge={"артефакт"}
            title={"Что предъявить"}
            code={"reproducible artifact"}
          >
            {"SQL, migration, script, plan, backup report или cache lab сохранены в репозитории."}
          </TypeCard>
          <TypeCard
            badge={"проверка"}
            badgeTone={"float"}
            title={"Что доказать"}
            code={"success + failure"}
          >
            {"Успешный и ошибочный сценарии дают ожидаемый наблюдаемый результат."}
          </TypeCard>
          <TypeCard
            badge={"защита"}
            badgeTone={"str"}
            title={"Что объяснить"}
            code={"decision + trade-off"}
          >
            {"Выбор связан с требованиями проекта и имеет названную цену."}
          </TypeCard>
        </TypeCards>
        <div className="lesson-check-group">
          <QuizCard
            question={"Что восстанавливает Alembic migration?"}
            options={[
              "Структуру и её изменения",
              "Все пользовательские строки",
              "Файлы вложений автоматически",
            ]}
            correctIndex={0}
            explanation={"Migration воспроизводит схему, а не снимок данных."}
          />
          <QuizCard
            question={"Как проверить backup безопасно?"}
            options={[
              "В отдельной database",
              "Поверх production",
              "Только командой ls",
            ]}
            correctIndex={0}
            explanation={"Изолированная цель не рискует рабочими данными."}
          />
          <QuizCard
            question={"Чем custom format удобен?"}
            options={[
              "Гибким pg_restore",
              "Он является Python-файлом",
              "Не содержит схемы",
            ]}
            correctIndex={0}
            explanation={"Custom dump управляется через pg_restore."}
          />
          <QuizCard
            question={"Что завершает restore drill?"}
            options={[
              "Row counts и smoke tests",
              "Создание пустого файла",
              "Новый Git branch",
            ]}
            correctIndex={0}
            explanation={"Нужно подтвердить данные и ключевое поведение приложения."}
          />
        </div>
        <KeyTakeaways
          points={[
            <>{"Миграции и backup решают разные задачи."}</>,
            <>{"Custom format создаётся pg_dump и восстанавливается pg_restore."}</>,
            <>{"Restore проверяется в отдельной database."}</>,
            <>{"Файл backup без restore drill не считается проверенным."}</>,
            <>{"После восстановления сверяются данные и критические API-сценарии."}</>,
            <>{"Runbook должен быть понятен другому разработчику."}</>,
          ]}
        />
        <PracticeCta text={"Создайте custom backup StudyHub, восстановите его в studyhub_restore_test, сверяйте минимум три row count и запустите smoke tests."} />
        <div className="lesson-practice-steps">
          <h3>{"Критерий готовности"}</h3>
          <p>{"Есть воспроизводимый артефакт, успешная проверка, ожидаемый сбой, объяснение результата и отдельный осмысленный Git-коммит."}</p>
        </div>
      </Section>
    </RichLesson>
  );
}
