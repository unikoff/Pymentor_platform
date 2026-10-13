import { FileCode, Terminal } from "lucide-react";
import { BugHunt, Callout, CodeSequence, CompareSolutions, FillBlank, KeyTakeaways, Lead, MethodGrid, PracticeCta, QuizCard, RichHero, RichLesson, Section, TerminalDemo } from "../../shared";
import { TheoryBridge } from "../../shared";
const BLOCK_TITLE = "Блок 30 · Dockerfile и контейнер приложения";

export function Lesson172({ module }: { module?: string }) {
  return (
    <RichLesson>
      <RichHero
        variant="project"
        chip={module ?? BLOCK_TITLE}
        title={"Первый Dockerfile для FastAPI"}
        intro={"Опишем минимальную сборку StudyHub инструкциями FROM, WORKDIR, COPY, RUN и CMD, затем получим собственный image и откроем health endpoint с host-машины."}
        tags={[
          { icon: <FileCode size={14} />, label: "Dockerfile по шагам" },
          { icon: <Terminal size={14} />, label: "build → run → request" },
        ]}
      />
      <TheoryBridge link={"Image и container уже разведены. Теперь вместо готового Python image создаём собственный шаблон среды StudyHub."} boundary={"Первый Dockerfile намеренно не оптимален. Сначала нужен прозрачный рабочий путь, а cache и hardening появятся после наблюдаемой проблемы."} />

      <Section number={"01"} title={"Dockerfile заменяет ручную подготовку среды"}>
        <Lead>
          {"Dockerfile — текстовый рецепт сборки image. Каждая инструкция отвечает на конкретный вопрос: от какого base image начать, куда положить файлы, какие команды выполнить при build и что запускать при start."}
        </Lead>

        <div className="lesson-practice-steps">
          <h3>{"Build time"}</h3>
          <p>{"FROM, COPY и RUN создают содержимое image до запуска приложения."}</p>
          <h3>{"Runtime"}</h3>
          <p>{"CMD задаёт команду по умолчанию для нового container."}</p>
          <h3>{"Критерий успеха"}</h3>
          <p>{"Один docker build и один docker run дают работающий /health без ручной установки Python."}</p>
        </div>

        <div className="lesson-route">
          <ol>
            <li>
              <strong>{"FROM:"}</strong> {" выбрать Python runtime"}
            </li>
            <li>
              <strong>{"WORKDIR:"}</strong> {" зафиксировать рабочую директорию"}
            </li>
            <li>
              <strong>{"COPY + RUN:"}</strong> {" перенести manifest и установить dependencies"}
            </li>
            <li>
              <strong>{"CMD:"}</strong> {" запустить Uvicorn как главный процесс"}
            </li>
          </ol>
        </div>

        <MethodGrid
          rows={[
            [
              <>наблюдать</>,
              "Зафиксируйте наблюдаемый результат раздела «Dockerfile заменяет ручную подготовку среды» до изменения параметров.",
            ],
            [
              <>предсказать</>,
              "Выберите один параметр из шага «Runtime» и сначала запишите ожидаемый эффект.",
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
          {"Dockerfile не выполняется при каждом request. Он читается во время build, а созданный image используется многократно."}
        </Callout>
      </Section>

      <Section number={"02"} title={"FROM и выбор base image"}>
        <Lead>
          {"Инструкция FROM задаёт начальную файловую систему и runtime. Для курса используем официальный Python slim image: он заметно меньше полного варианта, но остаётся понятным новичку."}
        </Lead>

        <div className="lesson-practice-steps">
          <h3>{"Тег версии"}</h3>
          <p>{"python:3.12-slim фиксирует major/minor Python и семейство slim."}</p>
          <h3>{"Воспроизводимость"}</h3>
          <p>{"Случайный latest может измениться между сборками и усложнить диагностику."}</p>
          <h3>{"Граница"}</h3>
          <p>{"Digest даёт ещё более точную фиксацию, но вводится как дополнительная практика, а не обязательная первая ступень."}</p>
        </div>

        <CompareSolutions
          question={"Какой base image лучше выражает учебный контракт?"}
          left={{
            title: "Неявная версия",
            code: "FROM python:latest",
            note: "Содержимое может измениться вместе с latest.",
          }}
          right={{
            title: "Зафиксированная линия",
            code: "FROM python:3.12-slim",
            note: "Понятны версия runtime и размерная линия image.",
          }}
          preferred="right"
          explanation={"Для воспроизводимой сборки версия runtime должна быть явной."}
        />

        <MethodGrid
          rows={[
            [
              <>наблюдать</>,
              "Зафиксируйте наблюдаемый результат раздела «FROM и выбор base image» до изменения параметров.",
            ],
            [
              <>предсказать</>,
              "Выберите один параметр из шага «Воспроизводимость» и сначала запишите ожидаемый эффект.",
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
          {"Slim image может потребовать системные build-пакеты для некоторых Python-зависимостей. Не добавляйте их заранее, пока конкретный package не показал такую необходимость."}
        </Callout>
      </Section>

      <Section number={"03"} title={"WORKDIR и предсказуемые относительные пути"}>
        <Lead>
          {"WORKDIR задаёт директорию для последующих COPY, RUN и CMD. Это устраняет зависимость от случайной текущей папки внутри base image."}
        </Lead>

        <div className="lesson-practice-steps">
          <h3>{"Создание"}</h3>
          <p>{"Если /app отсутствует, Docker создаст рабочую директорию."}</p>
          <h3>{"Последующие команды"}</h3>
          <p>{"RUN pip и COPY используют /app как текущую директорию."}</p>
          <h3>{"Python import"}</h3>
          <p>{"Команда uvicorn сможет найти package app относительно /app."}</p>
        </div>

        <FillBlank
          prompt={"Укажите стабильную рабочую директорию проекта."}
          before={"FROM python:3.12-slim\n"}
          after={" /app"}
          options={["WORKDIR", "RUN", "CMD"]}
          answer={"WORKDIR"}
          explanation={"WORKDIR меняет текущую директорию для следующих инструкций и runtime-команды."}
        />

        <MethodGrid
          rows={[
            [
              <>наблюдать</>,
              "Зафиксируйте наблюдаемый результат раздела «WORKDIR и предсказуемые относительные пути» до изменения параметров.",
            ],
            [
              <>предсказать</>,
              "Выберите один параметр из шага «Последующие команды» и сначала запишите ожидаемый эффект.",
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
          {"Не используйте RUN cd /app как замену: изменение директории в одном RUN не задаёт контекст для следующих инструкций."}
        </Callout>
      </Section>

      <Section number={"04"} title={"COPY и RUN: зависимости до кода приложения"}>
        <Lead>
          {"Сначала копируем dependency manifest, затем устанавливаем packages. На этом уроке важен сам механизм; влияние порядка на cache будет измерено в следующем занятии."}
        </Lead>

        <div className="lesson-practice-steps">
          <h3>{"COPY requirements.txt ."}</h3>
          <p>{"В image попадает только manifest зависимостей."}</p>
          <h3>{"RUN pip install"}</h3>
          <p>{"Команда выполняется при build и записывает установленные packages в новый layer."}</p>
          <h3>{"COPY app ./app"}</h3>
          <p>{"Код приложения переносится после установки dependencies."}</p>
        </div>

        <CodeSequence
          title={"Соберите минимальный Dockerfile"}
          prompt={"Расположите инструкции в рабочем порядке."}
          pieces={[
            { id: "from", code: "FROM python:3.12-slim" },
            { id: "workdir", code: "WORKDIR /app" },
            { id: "manifest", code: "COPY requirements.txt ." },
            { id: "install", code: "RUN pip install --no-cache-dir -r requirements.txt" },
            { id: "code", code: "COPY app ./app" },
            { id: "cmd", code: "CMD [\"uvicorn\", \"app.main:app\", \"--host\", \"0.0.0.0\", \"--port\", \"8000\"]" },
          ]}
          correctOrder={["from", "workdir", "manifest", "install", "code", "cmd"]}
          explanation={"Image сначала получает runtime, затем dependencies, затем код и команду запуска."}
        />

        <MethodGrid
          rows={[
            [
              <>наблюдать</>,
              "Зафиксируйте наблюдаемый результат раздела «COPY и RUN: зависимости до кода приложения» до изменения параметров.",
            ],
            [
              <>предсказать</>,
              "Выберите один параметр из шага «RUN pip install» и сначала запишите ожидаемый эффект.",
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
          {"Флаг pip --no-cache-dir убирает download cache pip из image; это не Docker build cache и не отключает кеширование layer."}
        </Callout>
      </Section>

      <Section number={"05"} title={"CMD и Uvicorn как главный процесс"}>
        <Lead>
          {"CMD в exec form передаёт аргументы без промежуточного shell. Uvicorn становится главным процессом container и корректно получает сигналы остановки."}
        </Lead>

        <div className="lesson-practice-steps">
          <h3>{"Module path"}</h3>
          <p>{"app.main:app означает объект app в Python-модуле app.main."}</p>
          <h3>{"Host 0.0.0.0"}</h3>
          <p>{"Сервер слушает сетевые интерфейсы container, а не только loopback внутри него."}</p>
          <h3>{"Port 8000"}</h3>
          <p>{"Это внутренний port процесса; доступ с host появится после публикации -p."}</p>
        </div>

        <BugHunt
          code={"CMD [\"uvicorn\", \"app.main:app\", \"--host\", \"127.0.0.1\", \"--port\", \"8000\"]"}
          question={"Почему опубликованный port может не отвечать с host?"}
          options={["Uvicorn слушает только loopback внутри container", "CMD запрещает запускать Python packages", "Port 8000 всегда зарезервирован Docker"]}
          correctIndex={0}
          explanation={"Для входящих соединений через сетевой интерфейс container Uvicorn должен слушать 0.0.0.0."}
          fix={"CMD [\"uvicorn\", \"app.main:app\", \"--host\", \"0.0.0.0\", \"--port\", \"8000\"]"}
        />

        <MethodGrid
          rows={[
            [
              <>наблюдать</>,
              "Зафиксируйте наблюдаемый результат раздела «CMD и Uvicorn как главный процесс» до изменения параметров.",
            ],
            [
              <>предсказать</>,
              "Выберите один параметр из шага «Host 0.0.0.0» и сначала запишите ожидаемый эффект.",
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
          {"Exec-form CMD предпочтительнее shell-form для серверного процесса: аргументы видны явно, а сигналы не проходят через лишний shell."}
        </Callout>
      </Section>

      <Section number={"06"} title={"Build: превращаем Dockerfile в image"}>
        <Lead>
          {"Команда docker build читает Dockerfile, отправляет build context builder-у и создаёт tagged image. Точка в конце команды обозначает текущую папку как context."}
        </Lead>

        <div className="lesson-practice-steps">
          <h3>{"Tag"}</h3>
          <p>{"-t studyhub-api:dev задаёт понятное repository:tag."}</p>
          <h3>{"Context"}</h3>
          <p>{"Dockerfile, requirements.txt и app должны находиться внутри переданного context."}</p>
          <h3>{"Проверка"}</h3>
          <p>{"docker image ls показывает созданный image независимо от запущенных containers."}</p>
        </div>

        <TerminalDemo
          title={"первая сборка"}
          lines={[
            { cmd: "docker build -t studyhub-api:dev ." },
            { out: "[+] Building ... FINISHED" },
            { cmd: "docker image ls studyhub-api" },
            { out: "studyhub-api   dev   ..." },
          ]}
        />

        <MethodGrid
          rows={[
            [
              <>наблюдать</>,
              "Зафиксируйте наблюдаемый результат раздела «Build: превращаем Dockerfile в image» до изменения параметров.",
            ],
            [
              <>предсказать</>,
              "Выберите один параметр из шага «Context» и сначала запишите ожидаемый эффект.",
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
          {"Build failure и runtime failure — разные классы проблем. На этом шаге приложение ещё не запущено."}
        </Callout>
      </Section>

      <Section number={"07"} title={"Run: публикуем port и проверяем health"}>
        <Lead>
          {"Новый container получает имя, mapping host:container и удаляется после остановки благодаря --rm. HTTP request с host проходит через опубликованный port к Uvicorn внутри container."}
        </Lead>

        <div className="lesson-practice-steps">
          <h3>{"Создать"}</h3>
          <p>{"docker run создаёт новый экземпляр studyhub-api:dev."}</p>
          <h3>{"Опубликовать"}</h3>
          <p>{"-p 8000:8000 связывает host port 8000 с container port 8000."}</p>
          <h3>{"Проверить"}</h3>
          <p>{"Запрос /health подтверждает, что процесс слушает и FastAPI отвечает."}</p>
        </div>

        <TerminalDemo
          title={"запуск StudyHub"}
          lines={[
            { cmd: "docker run --rm --name studyhub-api -p 8000:8000 studyhub-api:dev" },
            { out: "Uvicorn running on http://0.0.0.0:8000" },
            { cmd: "curl http://127.0.0.1:8000/health" },
            { out: "{\"status\":\"ok\"}" },
          ]}
        />

        <MethodGrid
          rows={[
            [
              <>наблюдать</>,
              "Зафиксируйте наблюдаемый результат раздела «Run: публикуем port и проверяем health» до изменения параметров.",
            ],
            [
              <>предсказать</>,
              "Выберите один параметр из шага «Опубликовать» и сначала запишите ожидаемый эффект.",
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
          {"Swagger доступен по host URL, но сам Uvicorn внутри container по-прежнему слушает container port 8000."}
        </Callout>
      </Section>

      <Section number="08" title="Контрольная точка и проектная практика">
        <Lead>
          {"Соберите модель занятия, проверьте четыре принципиальных различия и примените результат к текущему Docker-артефакту StudyHub."}
        </Lead>

        <div className="lesson-check-group">
          <QuizCard
            question={"Когда выполняется RUN?"}
            options={["Во время build", "При каждом HTTP request", "Только после docker logs"]}
            correctIndex={0}
            explanation={"RUN изменяет создаваемый image."}
          />
          <QuizCard
            question={"Зачем нужен WORKDIR?"}
            options={["Задать текущую директорию для следующих шагов", "Опубликовать port", "Удалить container"]}
            correctIndex={0}
            explanation={"WORKDIR делает пути предсказуемыми."}
          />
          <QuizCard
            question={"Почему Uvicorn слушает 0.0.0.0?"}
            options={["Чтобы принимать соединения через интерфейс container", "Чтобы отключить сеть", "Чтобы выбрать host port"]}
            correctIndex={0}
            explanation={"127.0.0.1 относится только к loopback container."}
          />
          <QuizCard
            question={"Что означает точка в docker build ... .?"}
            options={["Build context", "Имя container", "Port"]}
            correctIndex={0}
            explanation={"Точка передаёт текущую папку как context."}
          />
        </div>

        <KeyTakeaways
          points={[
            <>{"Dockerfile описывает сборку image инструкциями."}</>,
            <>{"FROM задаёт base image, а WORKDIR — текущую директорию."}</>,
            <>{"RUN выполняется при build, CMD — при запуске container."}</>,
            <>{"Dependency manifest копируется отдельно от приложения."}</>,
            <>{"Uvicorn внутри container слушает 0.0.0.0."}</>,
            <>{"Port становится доступен host только после публикации."}</>,
          ]}
        />

        <PracticeCta text={"Создайте минимальный Dockerfile StudyHub, соберите studyhub-api:dev, запустите container с именем и mapping 8000:8000, откройте /health и /docs. Затем намеренно укажите неверный module path и зафиксируйте отличие build success от runtime failure."} />
      </Section>
    </RichLesson>
  );
}
