import { FolderGit2, Layers } from "lucide-react";
import { BranchExplorer, BugHunt, Callout, CodeBlock, CompareSolutions, KeyTakeaways, Lead, MatchPairs, MethodGrid, PracticeCta, QuizCard, RichHero, RichLesson, Section, StepThrough, TerminalDemo } from "../../shared";
import { TheoryBridge } from "../../shared";
const BLOCK_TITLE = "Блок 30 · Dockerfile и контейнер приложения";

export function Lesson173({ module }: { module?: string }) {
  return (
    <RichLesson>
      <RichHero
        variant="project"
        chip={module ?? BLOCK_TITLE}
        title={"Build context, layers и кеш сборки"}
        intro={"Разберём, что Docker получает на вход build, как инструкции образуют layers и почему порядок COPY определяет, будет ли повторная сборка быстрой или снова установит все dependencies."}
        tags={[
          { icon: <Layers size={14} />, label: "layers и cache" },
          { icon: <FolderGit2 size={14} />, label: "build context" },
        ]}
      />
      <TheoryBridge link={"Первый image работает, поэтому теперь можно измерить стоимость rebuild и улучшить Dockerfile на основании наблюдаемой проблемы."} boundary={"Cache является оптимизацией сборки, а не гарантией корректности. Изменение входа должно честно инвалидировать зависимый layer."} />

      <Section number={"01"} title={"Почему маленькое изменение вызывает долгий rebuild"}>
        <Lead>
          {"Если Dockerfile сначала копирует весь проект, любое изменение README или Python-файла меняет результат COPY. Все последующие layers, включая pip install, теряют cache."}
        </Lead>

        <div className="lesson-practice-steps">
          <h3>{"Наблюдение"}</h3>
          <p>{"Первая сборка устанавливает packages и занимает заметное время."}</p>
          <h3>{"Проблема"}</h3>
          <p>{"Правка одной строки app/main.py снова запускает pip install."}</p>
          <h3>{"Цель"}</h3>
          <p>{"Сделать dependency layer зависимым только от manifest, а source layer — от кода."}</p>
        </div>

        <CompareSolutions
          question={"Какой Dockerfile лучше использует cache?"}
          left={{
            title: "Весь проект до install",
            code: "COPY . .\nRUN pip install -r requirements.txt",
            note: "Любое изменение context инвалидирует COPY и install.",
          }}
          right={{
            title: "Manifest отдельным layer",
            code: "COPY requirements.txt .\nRUN pip install -r requirements.txt\nCOPY app ./app",
            note: "Правка app не меняет dependency layer.",
          }}
          preferred="right"
          explanation={"Стабильные и редко меняющиеся входы нужно располагать раньше часто изменяемого source code."}
        />

        <MethodGrid
          rows={[
            [
              <>наблюдать</>,
              "Зафиксируйте наблюдаемый результат раздела «Почему маленькое изменение вызывает долгий rebuild» до изменения параметров.",
            ],
            [
              <>предсказать</>,
              "Выберите один параметр из шага «Проблема» и сначала запишите ожидаемый эффект.",
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
          {"Оптимизация не должна скрывать dependency-файл: изменили requirements.txt — install обязан выполниться снова."}
        </Callout>
      </Section>

      <Section number={"02"} title={"Build context — доступная builder-у область файлов"}>
        <Lead>
          {"Последний аргумент docker build определяет context. Инструкция COPY не может читать произвольные файлы за пределами этой области."}
        </Lead>

        <div className="lesson-practice-steps">
          <h3>{"Context ."}</h3>
          <p>{"Текущая папка и её неигнорируемые descendants отправляются builder-у."}</p>
          <h3>{"COPY source"}</h3>
          <p>{"Путь источника вычисляется относительно корня context, а не расположения Dockerfile."}</p>
          <h3>{"Размер и секреты"}</h3>
          <p>{"Лишние архивы, virtualenv и .env увеличивают context и могут попасть в build input."}</p>
        </div>

        <BranchExplorer
          code={"project/\n├── Dockerfile\n├── requirements.txt\n├── app/\n└── ../secret.env"}
          scenarios={[
            { label: "docker build .", activeLine: 1, output: "COPY видит requirements.txt и app" },
            { label: "COPY ../secret.env", activeLine: 4, output: "источник вне context — ошибка" },
            { label: "context project/app", activeLine: 3, output: "Dockerfile и requirements могут оказаться вне context" },
          ]}
        />

        <MethodGrid
          rows={[
            [
              <>наблюдать</>,
              "Зафиксируйте наблюдаемый результат раздела «Build context — доступная builder-у область файлов» до изменения параметров.",
            ],
            [
              <>предсказать</>,
              "Выберите один параметр из шага «COPY source» и сначала запишите ожидаемый эффект.",
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
          {"Флаг -f может указать Dockerfile в другом месте, но context всё равно задаётся отдельным последним аргументом."}
        </Callout>
      </Section>

      <Section number={"03"} title={"Инструкции создают цепочку layers"}>
        <Lead>
          {"Результат большинства build-инструкций образует layer. Следующий layer опирается на предыдущий, поэтому invalidation распространяется вниз по Dockerfile."}
        </Lead>

        <div className="lesson-practice-steps">
          <h3>{"Layer 1"}</h3>
          <p>{"FROM задаёт base filesystem."}</p>
          <h3>{"Layer 2"}</h3>
          <p>{"RUN pip install добавляет packages поверх основы."}</p>
          <h3>{"Layer 3"}</h3>
          <p>{"COPY app добавляет текущий source code."}</p>
        </div>

        <StepThrough
          code={"FROM python:3.12-slim\nWORKDIR /app\nCOPY requirements.txt .\nRUN pip install --no-cache-dir -r requirements.txt\nCOPY app ./app"}
          steps={[
            { line: 0, note: "Builder выбирает base image.", vars: { "layer": "base" } },
            { line: 1, note: "Задаётся metadata рабочей директории.", vars: { "cwd": "/app" } },
            { line: 2, note: "Hash manifest входит в cache key.", vars: { "input": "requirements.txt" } },
            { line: 3, note: "Dependency layer зависит от предыдущих шагов.", vars: { "packages": "installed" } },
            { line: 4, note: "Source layer меняется при изменении app.", vars: { "source": "current" } },
          ]}
        />

        <MethodGrid
          rows={[
            [
              <>наблюдать</>,
              "Зафиксируйте наблюдаемый результат раздела «Инструкции создают цепочку layers» до изменения параметров.",
            ],
            [
              <>предсказать</>,
              "Выберите один параметр из шага «Layer 2» и сначала запишите ожидаемый эффект.",
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
          {"Layer — не отдельный container. Это часть истории файловой системы image и cache сборки."}
        </Callout>
      </Section>

      <Section number={"04"} title={"Cache hit, cache miss и распространение invalidation"}>
        <Lead>
          {"Builder повторно использует layer, если инструкция и её входы не изменились. После первого cache miss следующие шаги обычно тоже перестраиваются."}
        </Lead>

        <div className="lesson-practice-steps">
          <h3>{"Hit"}</h3>
          <p>{"Та же инструкция получает те же входные файлы и предыдущий layer."}</p>
          <h3>{"Miss"}</h3>
          <p>{"Изменился requirements.txt, команда RUN или layer выше."}</p>
          <h3>{"Прогноз"}</h3>
          <p>{"Правка app должна затронуть только COPY app и последующие instructions."}</p>
        </div>

        <MatchPairs
          prompt={"Соедините изменение с ожидаемым cache effect."}
          leftTitle={"Изменение"}
          rightTitle={"Результат"}
          pairs={[
            { left: "app/main.py", right: "dependency install остаётся cached" },
            { left: "requirements.txt", right: "pip install перестраивается" },
            { left: "FROM tag", right: "пересматривается вся цепочка после base" },
            { left: "README.md из .dockerignore", right: "build layers не меняются" },
          ]}
          explanation={"Cache зависит только от тех входов, которые реально участвуют в build."}
        />

        <MethodGrid
          rows={[
            [
              <>наблюдать</>,
              "Зафиксируйте наблюдаемый результат раздела «Cache hit, cache miss и распространение invalidation» до изменения параметров.",
            ],
            [
              <>предсказать</>,
              "Выберите один параметр из шага «Miss» и сначала запишите ожидаемый эффект.",
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
          {"Не оценивайте cache по ощущениям: смотрите строки CACHED в выводе повторного docker build."}
        </Callout>
      </Section>

      <Section number={"05"} title={"Секрет, попавший в layer, нельзя считать удалённым"}>
        <Lead>
          {"Копирование .env, token или private key в image опасно даже при последующем RUN rm. Секрет уже участвовал в более раннем layer и может остаться в истории сборки."}
        </Lead>

        <div className="lesson-practice-steps">
          <h3>{"Плохой путь"}</h3>
          <p>{"COPY . . переносит .env, после чего RUN rm .env создаёт только новый layer удаления."}</p>
          <h3>{"Правильная граница"}</h3>
          <p>{"Секрет не входит в context или передаётся специальным механизмом build secret при реальной необходимости."}</p>
          <h3>{"Runtime config"}</h3>
          <p>{"DATABASE_URL и SECRET_KEY передаются при запуске, а не запекаются в image."}</p>
        </div>

        <BugHunt
          code={"COPY . .\nRUN cat .env && rm .env"}
          question={"Почему удаление .env не делает image безопасным?"}
          options={["Файл уже попал в предыдущий layer и build history", "RUN никогда не удаляет файлы", "Docker автоматически отправляет .env в GitHub"]}
          correctIndex={0}
          explanation={"Следующий layer фиксирует удаление, но не переписывает содержимое предыдущего layer."}
          fix={".dockerignore:\n.env\n.env.*\n!.env.example"}
        />

        <MethodGrid
          rows={[
            [
              <>наблюдать</>,
              "Зафиксируйте наблюдаемый результат раздела «Секрет, попавший в layer, нельзя считать удалённым» до изменения параметров.",
            ],
            [
              <>предсказать</>,
              "Выберите один параметр из шага «Правильная граница» и сначала запишите ожидаемый эффект.",
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
          {"Значения ARG и ENV тоже не являются безопасным способом передачи build secrets: метаданные и history могут раскрыть их."}
        </Callout>
      </Section>

      <Section number={"06"} title={"Измеряем две повторные сборки"}>
        <Lead>
          {"Проверка cache должна быть воспроизводимой: первая сборка заполняет cache, вторая после правки source показывает, какие steps использованы повторно."}
        </Lead>

        <div className="lesson-practice-steps">
          <h3>{"Baseline"}</h3>
          <p>{"Соберите image и сохраните лог."}</p>
          <h3>{"Изменение"}</h3>
          <p>{"Добавьте строку в app/main.py, не меняя requirements.txt."}</p>
          <h3>{"Сравнение"}</h3>
          <p>{"Убедитесь, что dependency install отмечен CACHED, а source COPY выполняется заново."}</p>
        </div>

        <TerminalDemo
          title={"cache experiment"}
          lines={[
            { cmd: "docker build -t studyhub-api:cache-lab ." },
            { out: "#4 RUN pip install ... DONE" },
            { cmd: "echo \"# cache test\" >> app/main.py" },
            { cmd: "docker build -t studyhub-api:cache-lab ." },
            { out: "#4 RUN pip install ... CACHED" },
            { out: "#5 COPY app ./app ... DONE" },
          ]}
        />

        <MethodGrid
          rows={[
            [
              <>наблюдать</>,
              "Зафиксируйте наблюдаемый результат раздела «Измеряем две повторные сборки» до изменения параметров.",
            ],
            [
              <>предсказать</>,
              "Выберите один параметр из шага «Изменение» и сначала запишите ожидаемый эффект.",
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
          {"После эксперимента верните учебную строку, чтобы cache-test не становился случайным изменением проекта."}
        </Callout>
      </Section>

      <Section number={"07"} title={"Оптимизированный Dockerfile StudyHub"}>
        <Lead>
          {"Собираем понятный порядок: стабильная основа и dependencies раньше, часто меняющийся source позже. Multi-stage build пока не нужен, потому что проект не имеет отдельной compile-фазы."}
        </Lead>

        <div className="lesson-practice-steps">
          <h3>{"Стабильные слои"}</h3>
          <p>{"FROM, ENV, WORKDIR и dependency manifest меняются редко."}</p>
          <h3>{"Установка"}</h3>
          <p>{"RUN pip install зависит только от manifest и base."}</p>
          <h3>{"Частые изменения"}</h3>
          <p>{"App, migrations и config templates копируются после packages."}</p>
        </div>

        <CodeBlock
          caption={"Dockerfile после cache-аудита"}
          code={"FROM python:3.12-slim\n\nENV PYTHONDONTWRITEBYTECODE=1 \\\n    PYTHONUNBUFFERED=1\n\nWORKDIR /app\n\nCOPY requirements.txt .\nRUN pip install --no-cache-dir -r requirements.txt\n\nCOPY app ./app\nCOPY migrations ./migrations\nCOPY alembic.ini .\n\nCMD [\"uvicorn\", \"app.main:app\", \"--host\", \"0.0.0.0\", \"--port\", \"8000\"]"}
        />

        <MethodGrid
          rows={[
            [
              <>наблюдать</>,
              "Зафиксируйте наблюдаемый результат раздела «Оптимизированный Dockerfile StudyHub» до изменения параметров.",
            ],
            [
              <>предсказать</>,
              "Выберите один параметр из шага «Установка» и сначала запишите ожидаемый эффект.",
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
          {"Не объединяйте все инструкции в один огромный RUN только ради количества layers. Читаемость и корректная cache boundary важнее мифической минимизации каждого layer."}
        </Callout>
      </Section>

      <Section number="08" title="Контрольная точка и проектная практика">
        <Lead>
          {"Соберите модель занятия, проверьте четыре принципиальных различия и примените результат к текущему Docker-артефакту StudyHub."}
        </Lead>

        <div className="lesson-check-group">
          <QuizCard
            question={"Что определяет build context?"}
            options={["Последний аргумент docker build", "CMD", "Имя container"]}
            correctIndex={0}
            explanation={"Context задаётся отдельным путём."}
          />
          <QuizCard
            question={"Что инвалидирует dependency layer?"}
            options={["Изменение requirements.txt", "Изменение ignored README", "Новое имя container"]}
            correctIndex={0}
            explanation={"Manifest является входом COPY перед install."}
          />
          <QuizCard
            question={"Почему COPY . . до pip install часто плохо?"}
            options={["Любое изменение source сбрасывает install cache", "COPY запрещён Docker", "Pip работает только на host"]}
            correctIndex={0}
            explanation={"Широкий COPY делает layer слишком чувствительным."}
          />
          <QuizCard
            question={"Можно ли удалить секрет следующим RUN?"}
            options={["Удаление не стирает предыдущий layer", "Да, всегда безопасно", "Только на Windows"]}
            correctIndex={0}
            explanation={"Секрет вообще не должен попадать в context/layer."}
          />
        </div>

        <KeyTakeaways
          points={[
            <>{"Build context определяет доступные builder-у файлы."}</>,
            <>{"Dockerfile образует последовательность зависимых layers."}</>,
            <>{"Cache hit требует неизменной инструкции и неизменных входов."}</>,
            <>{"Dependency manifest копируется раньше source code."}</>,
            <>{"Секрет нельзя безопасно удалить из уже созданного layer."}</>,
            <>{"Cache проверяется повторной сборкой и логами builder-а."}</>,
          ]}
        />

        <PracticeCta text={"Сделайте две версии Dockerfile, выполните по две сборки каждой, измените только app/main.py и сравните cache log. Запишите, какой layer стал первым cache miss и почему. Оставьте в проекте вариант с отдельным dependency manifest."} />
      </Section>
    </RichLesson>
  );
}
