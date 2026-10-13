import { FolderGit2, ShieldCheck } from "lucide-react";
import { BugHunt, Callout, CodeBlock, CodeSequence, CompareSolutions, KeyTakeaways, Lead, MatchPairs, MethodGrid, PracticeCta, QuizCard, RichHero, RichLesson, Section, TerminalDemo, TypeCard, TypeCards } from "../../shared";
import { TheoryBridge } from "../../shared";
const BLOCK_TITLE = "Блок 30 · Dockerfile и контейнер приложения";

export function Lesson175({ module }: { module?: string }) {
  return (
    <RichLesson>
      <RichHero
        variant="project"
        chip={module ?? BLOCK_TITLE}
        title={".dockerignore, непривилегированный пользователь и чистый image"}
        intro={"Сократим build context, исключим локальные secrets и caches, затем переведём StudyHub с root на отдельного runtime-пользователя с минимальным набором доступных файлов."}
        tags={[
          { icon: <ShieldCheck size={14} />, label: "non-root runtime" },
          { icon: <FolderGit2 size={14} />, label: "чистый context" },
        ]}
      />
      <TheoryBridge link={"Build context и runtime state уже понятны. Теперь можно осмысленно определить, какие файлы вообще разрешено отправлять builder-у и с какими правами должен работать API."} boundary={"Non-root и чистый image уменьшают очевидный риск, но не заменяют обновление dependencies, security review, read-only filesystem и сканирование vulnerabilities."} />

      <Section number={"01"} title={"Build context должен быть минимальным и объяснимым"}>
        <Lead>
          {"Широкий context замедляет передачу файлов builder-у и увеличивает риск случайно включить .env, virtualenv, test artifacts или Git history."}
        </Lead>

        <div className="lesson-practice-steps">
          <h3>{"Нужно"}</h3>
          <p>{"Dockerfile, dependency manifests, app, migrations и runtime config templates."}</p>
          <h3>{"Не нужно"}</h3>
          <p>{".git, __pycache__, .pytest_cache, local virtualenv, coverage и editor settings."}</p>
          <h3>{"Запрещено"}</h3>
          <p>{"Настоящие .env, private keys, dumps и пользовательские данные."}</p>
        </div>

        <TypeCards>
          <TypeCard badge={"runtime"} title={"Код приложения"} code={"COPY app ./app"}>
            {"app/ и migrations нужны работающему image."}
          </TypeCard>
          <TypeCard badge={"build"} badgeTone="float" title={"Dependency manifest"} code={"COPY requirements.txt ."}>
            {"requirements.txt определяет устанавливаемые packages."}
          </TypeCard>
          <TypeCard badge={"exclude"} badgeTone="str" title={"Локальный мусор и secrets"} code={".dockerignore"}>
            {".venv, .git, caches и .env не входят в context."}
          </TypeCard>
        </TypeCards>

        <MethodGrid
          rows={[
            [
              <>наблюдать</>,
              "Зафиксируйте наблюдаемый результат раздела «Build context должен быть минимальным и объяснимым» до изменения параметров.",
            ],
            [
              <>предсказать</>,
              "Выберите один параметр из шага «Не нужно» и сначала запишите ожидаемый эффект.",
            ],
            [
              <>изменить</>,
              "Измените только один вход, команду или runtime-настройку; остальные условия оставьте прежними.",
            ],
            [
              <>диагностировать</>,
              "Если результат не совпал с прогнозом, проверьте факты по logs, state, filesystem или network boundary этого раздела.",
            ],
          ]}
        />

        <Callout tone="info">
          {"Даже если Dockerfile не содержит COPY . ., секрет в context остаётся лишним build input и может попасть в будущую правку."}
        </Callout>
      </Section>

      <Section number={"02"} title={".dockerignore фильтрует context до COPY"}>
        <Lead>
          {".dockerignore читается при подготовке context. Подход похож на .gitignore, но отвечает за другой поток: какие host-файлы доступны Docker build."}
        </Lead>

        <div className="lesson-practice-steps">
          <h3>{"Patterns"}</h3>
          <p>{"Можно исключать директории, расширения и временные artifacts."}</p>
          <h3>{"Exception"}</h3>
          <p>{"!.env.example возвращает безопасный шаблон, даже если .env* исключены."}</p>
          <h3>{"Проверка"}</h3>
          <p>{"Build должен продолжать видеть requirements, app и migrations."}</p>
        </div>

        <CodeBlock
          caption={".dockerignore"}
          code={".git\n.github\n.venv\nvenv\n__pycache__\n*.py[cod]\n.pytest_cache\n.mypy_cache\n.ruff_cache\n.coverage\nhtmlcov\n.env\n.env.*\n!.env.example\n*.sqlite3\n*.db\ntests/.cache\n"}
        />

        <MethodGrid
          rows={[
            [
              <>наблюдать</>,
              "Зафиксируйте наблюдаемый результат раздела «.dockerignore фильтрует context до COPY» до изменения параметров.",
            ],
            [
              <>предсказать</>,
              "Выберите один параметр из шага «Exception» и сначала запишите ожидаемый эффект.",
            ],
            [
              <>изменить</>,
              "Измените только один вход, команду или runtime-настройку; остальные условия оставьте прежними.",
            ],
            [
              <>диагностировать</>,
              "Если результат не совпал с прогнозом, проверьте факты по logs, state, filesystem или network boundary этого раздела.",
            ],
          ]}
        />

        <Callout tone="info">
          {".dockerignore не удаляет уже созданные secrets из старых images. После утечки secret нужно отозвать и пересобрать артефакты."}
        </Callout>
      </Section>

      <Section number={"03"} title={"Secret не должен попадать в COPY или ENV image"}>
        <Lead>
          {"Runtime secrets передаются в environment или secret store конкретного окружения. Запекание SECRET_KEY или DATABASE_URL в Dockerfile связывает image с одним окружением и раскрывает чувствительные данные."}
        </Lead>

        <div className="lesson-practice-steps">
          <h3>{"COPY .env"}</h3>
          <p>{"Файл становится частью image layer."}</p>
          <h3>{"ENV SECRET_KEY=..."}</h3>
          <p>{"Значение остаётся в image configuration и inspect."}</p>
          <h3>{"Runtime injection"}</h3>
          <p>{"Один image получает secret только в момент запуска."}</p>
        </div>

        <BugHunt
          code={"COPY .env .env\nENV SECRET_KEY=real-production-secret"}
          question={"Какая главная проблема этого Dockerfile?"}
          options={["Secrets становятся частью image и его metadata", "Docker не поддерживает ENV", "FastAPI требует хранить secret в Python-файле"]}
          correctIndex={0}
          explanation={"Image можно сохранить, передать и inspect-ировать; секрет не должен быть частью артефакта."}
          fix={".dockerignore:\n.env\n\nrun:\ndocker run --env-file .env.container studyhub-api:dev"}
        />

        <MethodGrid
          rows={[
            [
              <>наблюдать</>,
              "Зафиксируйте наблюдаемый результат раздела «Secret не должен попадать в COPY или ENV image» до изменения параметров.",
            ],
            [
              <>предсказать</>,
              "Выберите один параметр из шага «ENV SECRET_KEY=...» и сначала запишите ожидаемый эффект.",
            ],
            [
              <>изменить</>,
              "Измените только один вход, команду или runtime-настройку; остальные условия оставьте прежними.",
            ],
            [
              <>диагностировать</>,
              "Если результат не совпал с прогнозом, проверьте факты по logs, state, filesystem или network boundary этого раздела.",
            ],
          ]}
        />

        <Callout tone="info">
          {"Не показывайте секрет в примерах команды shell, которые попадут в history. Для локальной практики используйте отдельный env-file вне Git."}
        </Callout>
      </Section>

      <Section number={"04"} title={"Почему process не должен работать от root"}>
        <Lead>
          {"Многие base images по умолчанию запускают команды от root внутри container. Это не root host-машины, но лишние права увеличивают последствия ошибки или уязвимости."}
        </Lead>

        <div className="lesson-practice-steps">
          <h3>{"Least privilege"}</h3>
          <p>{"API получает только права, необходимые для чтения кода и временных runtime-операций."}</p>
          <h3>{"USER"}</h3>
          <p>{"Dockerfile переключает последующие runtime-команды на отдельного пользователя."}</p>
          <h3>{"Проверка"}</h3>
          <p>{"docker exec id показывает uid/gid, отличные от 0."}</p>
        </div>

        <CompareSolutions
          question={"Какой runtime лучше выражает принцип минимальных прав?"}
          left={{
            title: "Root process",
            code: "CMD [\"uvicorn\", \"app.main:app\", ...]\n# USER не задан",
            note: "Process имеет uid 0 внутри container.",
          }}
          right={{
            title: "Отдельный app user",
            code: "RUN useradd --system app\nUSER app\nCMD [\"uvicorn\", ...]",
            note: "Process запускается с ограниченными правами.",
          }}
          preferred="right"
          explanation={"Серверному процессу обычно не нужны root-права для port 8000 и чтения приложения."}
        />

        <MethodGrid
          rows={[
            [
              <>наблюдать</>,
              "Зафиксируйте наблюдаемый результат раздела «Почему process не должен работать от root» до изменения параметров.",
            ],
            [
              <>предсказать</>,
              "Выберите один параметр из шага «USER» и сначала запишите ожидаемый эффект.",
            ],
            [
              <>изменить</>,
              "Измените только один вход, команду или runtime-настройку; остальные условия оставьте прежними.",
            ],
            [
              <>диагностировать</>,
              "Если результат не совпал с прогнозом, проверьте факты по logs, state, filesystem или network boundary этого раздела.",
            ],
          ]}
        />

        <Callout tone="info">
          {"Использование non-root не гарантирует безопасность, но убирает ненужную привилегию из обычного runtime."}
        </Callout>
      </Section>

      <Section number={"05"} title={"Создаём пользователя и настраиваем ownership"}>
        <Lead>
          {"Пользователь должен читать код и при необходимости писать только в разрешённые директории. COPY --chown позволяет сразу назначить owner переносимым файлам."}
        </Lead>

        <div className="lesson-practice-steps">
          <h3>{"Создание"}</h3>
          <p>{"groupadd и useradd создают system account app."}</p>
          <h3>{"Directory owner"}</h3>
          <p>{"Рабочая директория получает app:app, если процесс должен писать временные файлы."}</p>
          <h3>{"COPY --chown"}</h3>
          <p>{"Source и migrations сразу принадлежат runtime user."}</p>
        </div>

        <CodeSequence
          title={"Соберите non-root фрагмент"}
          prompt={"Расположите инструкции до переключения USER."}
          pieces={[
            { id: "create", code: "RUN groupadd --system app && useradd --system --gid app --home-dir /app app" },
            { id: "chown-dir", code: "RUN chown app:app /app" },
            { id: "copy", code: "COPY --chown=app:app app ./app" },
            { id: "user", code: "USER app" },
            { id: "cmd", code: "CMD [\"uvicorn\", \"app.main:app\", \"--host\", \"0.0.0.0\", \"--port\", \"8000\"]" },
          ]}
          correctOrder={["create", "chown-dir", "copy", "user", "cmd"]}
          explanation={"Root выполняет подготовку image, затем runtime переключается на app."}
        />

        <MethodGrid
          rows={[
            [
              <>наблюдать</>,
              "Зафиксируйте наблюдаемый результат раздела «Создаём пользователя и настраиваем ownership» до изменения параметров.",
            ],
            [
              <>предсказать</>,
              "Выберите один параметр из шага «Directory owner» и сначала запишите ожидаемый эффект.",
            ],
            [
              <>изменить</>,
              "Измените только один вход, команду или runtime-настройку; остальные условия оставьте прежними.",
            ],
            [
              <>диагностировать</>,
              "Если результат не совпал с прогнозом, проверьте факты по logs, state, filesystem или network boundary этого раздела.",
            ],
          ]}
        />

        <Callout tone="info">
          {"После USER app последующие RUN тоже выполняются от app. Системные packages и global pip dependencies устанавливаются до переключения."}
        </Callout>
      </Section>

      <Section number={"06"} title={"Копируем только runtime-файлы"}>
        <Lead>
          {"Release image не обязан содержать Git history, локальные тестовые отчёты или editor configuration. При этом migrations и alembic.ini нужны, если release workflow выполняет миграции из этого image."}
        </Lead>

        <div className="lesson-practice-steps">
          <h3>{"Обязательно"}</h3>
          <p>{"app, migrations, alembic.ini и установленные dependencies."}</p>
          <h3>{"По решению команды"}</h3>
          <p>{"Tests могут запускаться в отдельном CI stage и не попадать в runtime image."}</p>
          <h3>{"Не копировать"}</h3>
          <p>{"Local database, uploads, .env и development caches."}</p>
        </div>

        <MatchPairs
          prompt={"Соедините файл с решением для release image."}
          leftTitle={"Файл"}
          rightTitle={"Действие"}
          pairs={[
            { left: "app/", right: "копировать" },
            { left: "migrations/", right: "копировать для migration workflow" },
            { left: ".env", right: "исключить и передать runtime config отдельно" },
            { left: ".venv/", right: "исключить; dependencies устанавливаются внутри image" },
            { left: "local.db", right: "исключить; состояние не является частью release" },
          ]}
          explanation={"Image содержит только воспроизводимый runtime и необходимые служебные артефакты."}
        />

        <MethodGrid
          rows={[
            [
              <>наблюдать</>,
              "Зафиксируйте наблюдаемый результат раздела «Копируем только runtime-файлы» до изменения параметров.",
            ],
            [
              <>предсказать</>,
              "Выберите один параметр из шага «По решению команды» и сначала запишите ожидаемый эффект.",
            ],
            [
              <>изменить</>,
              "Измените только один вход, команду или runtime-настройку; остальные условия оставьте прежними.",
            ],
            [
              <>диагностировать</>,
              "Если результат не совпал с прогнозом, проверьте факты по logs, state, filesystem или network boundary этого раздела.",
            ],
          ]}
        />

        <Callout tone="info">
          {"Размер image является следствием состава, но не единственной целью. Важнее понимать происхождение каждого файла."}
        </Callout>
      </Section>

      <Section number={"07"} title={"Проверяем пользователя и содержимое image"}>
        <Lead>
          {"Изменение считается завершённым только после наблюдаемой проверки: process работает, uid не равен 0, secrets отсутствуют, а необходимые modules импортируются."}
        </Lead>

        <div className="lesson-practice-steps">
          <h3>{"Identity"}</h3>
          <p>{"docker exec studyhub-api id показывает app user."}</p>
          <h3>{"Filesystem"}</h3>
          <p>{"ls -la /app подтверждает owner и ожидаемый состав."}</p>
          <h3>{"Smoke"}</h3>
          <p>{"/health отвечает после перехода на non-root."}</p>
        </div>

        <TerminalDemo
          title={"security smoke check"}
          lines={[
            { cmd: "docker exec studyhub-api id" },
            { out: "uid=999(app) gid=999(app) groups=999(app)" },
            { cmd: "docker exec studyhub-api sh -c \"test ! -f /app/.env && echo no-secret-file\"" },
            { out: "no-secret-file" },
            { cmd: "docker exec studyhub-api python -c \"import app.main; print('import-ok')\"" },
            { out: "import-ok" },
          ]}
        />

        <MethodGrid
          rows={[
            [
              <>наблюдать</>,
              "Зафиксируйте наблюдаемый результат раздела «Проверяем пользователя и содержимое image» до изменения параметров.",
            ],
            [
              <>предсказать</>,
              "Выберите один параметр из шага «Filesystem» и сначала запишите ожидаемый эффект.",
            ],
            [
              <>изменить</>,
              "Измените только один вход, команду или runtime-настройку; остальные условия оставьте прежними.",
            ],
            [
              <>диагностировать</>,
              "Если результат не совпал с прогнозом, проверьте факты по logs, state, filesystem или network boundary этого раздела.",
            ],
          ]}
        />

        <Callout tone="info">
          {"Конкретный uid может отличаться между base images. Критерий — пользователь не root и имеет только необходимые permissions."}
        </Callout>
      </Section>

      <Section number="08" title="Контрольная точка и проектная практика">
        <Lead>
          {"Соберите модель занятия, проверьте четыре принципиальных различия и примените результат к текущему Docker-артефакту StudyHub."}
        </Lead>

        <div className="lesson-check-group">
          <QuizCard
            question={"Что делает .dockerignore?"}
            options={["Исключает файлы из build context", "Удаляет files из host", "Настраивает Git"]}
            correctIndex={0}
            explanation={"Файл влияет на context Docker build."}
          />
          <QuizCard
            question={"Почему .env нельзя COPY?"}
            options={["Secret попадёт в image layer", "FastAPI не читает файлы", "COPY работает только с Python"]}
            correctIndex={0}
            explanation={"Артефакт должен быть независим от secrets."}
          />
          <QuizCard
            question={"Зачем USER app?"}
            options={["Запустить runtime без uid 0", "Увеличить cache", "Опубликовать port"]}
            correctIndex={0}
            explanation={"Это базовый least-privilege шаг."}
          />
          <QuizCard
            question={"Когда ставятся global dependencies?"}
            options={["До переключения на non-root user", "После удаления image", "При каждом request"]}
            correctIndex={0}
            explanation={"Системная подготовка выполняется на build stage с нужными правами."}
          />
        </div>

        <KeyTakeaways
          points={[
            <>{".dockerignore уменьшает context и риск случайного включения файлов."}</>,
            <>{"Настоящий .env не входит в image."}</>,
            <>{"Удаление secret поздним RUN не очищает ранний layer."}</>,
            <>{"Runtime process запускается от отдельного пользователя."}</>,
            <>{"COPY --chown задаёт ownership при переносе файлов."}</>,
            <>{"Состав release image должен быть объяснимым и проверяемым."}</>,
          ]}
        />

        <PracticeCta text={"Добавьте .dockerignore, убедитесь, что .env и .venv не входят в context, создайте пользователя app, примените COPY --chown и USER app. Пересоберите image, проверьте id, imports, owner файлов и /health. Запишите security smoke commands в README."} />
      </Section>
    </RichLesson>
  );
}
