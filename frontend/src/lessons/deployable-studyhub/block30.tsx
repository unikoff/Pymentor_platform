import {
  Boxes,
  CheckCircle2,
  Cloud,
  FileCode,
  FolderGit2,
  HardDrive,
  Layers,
  Play,
  ShieldCheck,
  Terminal,
  Wrench,
} from "lucide-react";
import {
  BranchExplorer,
  BugHunt,
  Callout,
  CodeBlock,
  CodeSequence,
  CompareSolutions,
  FillBlank,
  FlipCards,
  KeyTakeaways,
  Lead,
  MatchPairs,
  MethodGrid,
  PracticeCta,
  QuizCard,
  RichHero,
  RichLesson,
  Section,
  StepThrough,
  TerminalDemo,
  TrueFalse,
  TypeCard,
  TypeCards,
} from "../shared";

const BLOCK_TITLE = "Блок 30 · Dockerfile и контейнер приложения";

type TheoryBridgeData = { link: string; boundary: string };
const THEORY_BRIDGES: Record<number, TheoryBridgeData> = {
  171: {
    link: "В блоке 29 StudyHub уже запускался как Linux-процесс, получал конфигурацию из environment и писал диагностические логи. Теперь фиксируем для этого процесса подготовленную файловую систему и повторяемый способ запуска.",
    boundary: "Container не является отдельной виртуальной машиной: в учебной модели это изолированный процесс с собственной файловой системой, сетью и конфигурацией.",
  },
  172: {
    link: "Image и container уже разведены. Теперь вместо готового Python image создаём собственный шаблон среды StudyHub.",
    boundary: "Первый Dockerfile намеренно не оптимален. Сначала нужен прозрачный рабочий путь, а cache и hardening появятся после наблюдаемой проблемы.",
  },
  173: {
    link: "Первый image работает, поэтому теперь можно измерить стоимость rebuild и улучшить Dockerfile на основании наблюдаемой проблемы.",
    boundary: "Cache является оптимизацией сборки, а не гарантией корректности. Изменение входа должно честно инвалидировать зависимый layer.",
  },
  174: {
    link: "Image собирается быстро и предсказуемо. Теперь один и тот же артефакт должен запускаться с разной конфигурацией и не смешивать runtime state с содержимым image.",
    boundary: "Bind mount полезен для development, но не становится универсальным production-хранилищем. Постоянные данные PostgreSQL будут настроены в Compose-блоке.",
  },
  175: {
    link: "Build context и runtime state уже понятны. Теперь можно осмысленно определить, какие файлы вообще разрешено отправлять builder-у и с какими правами должен работать API.",
    boundary: "Non-root и чистый image уменьшают очевидный риск, но не заменяют обновление dependencies, security review, read-only filesystem и сканирование vulnerabilities.",
  },
  176: {
    link: "Image уже чистый, cache-предсказуемый и non-root. Финальный шаг — перестать воспринимать успешный docker run как единственную проверку и построить диагностический маршрут.",
    boundary: "Registry, Compose, CI/CD и deployment ещё не входят в блок. Здесь создаётся локальный release artifact и воспроизводимый runbook.",
  },
};

function TheoryBridge({ lesson }: { lesson: number }) {
  const bridge = THEORY_BRIDGES[lesson];
  return (
    <Callout tone="info">
      <strong>{"Связь с курсом."}</strong> {bridge.link}{" "}
      <strong>{"Важно не перепутать:"}</strong> {bridge.boundary}
    </Callout>
  );
}

// 171. Image, container и изоляция процесса
export function Lesson171({ module }: { module?: string }) {
  return (
    <RichLesson>
      <RichHero
        variant="project"
        chip={module ?? BLOCK_TITLE}
        title={"Image, container и изоляция процесса"}
        intro={"Построим точную модель Docker до первого Dockerfile: отделим неизменяемый image от запущенного container, найдём Python-процесс внутри и проверим, какое состояние переживает удаление контейнера."}
        tags={[
          { icon: <Boxes size={14} />, label: "image → container" },
          { icon: <Play size={14} />, label: "process и lifecycle" },
        ]}
      />
      <TheoryBridge lesson={171} />

      <Section number={"01"} title={"От работающего процесса к воспроизводимому запуску"}>
        <Lead>
          {"На машине автора StudyHub запускается, потому что Python, зависимости, файлы и переменные окружения уже подготовлены вручную. Docker нужен, чтобы описать эту среду как повторяемый артефакт, а не как список устных инструкций."}
        </Lead>

        <div className="lesson-practice-steps">
          <h3>{"Старая проблема"}</h3>
          <p>{"Команда uvicorn зависит от установленного Python, рабочей директории и набора пакетов конкретного компьютера."}</p>
          <h3>{"Главная модель"}</h3>
          <p>{"Image хранит подготовленную файловую систему и параметры запуска, а container создаёт из image изолированный runtime."}</p>
          <h3>{"Результат урока"}</h3>
          <p>{"Вы сможете показать путь Dockerfile → image → container → process и назвать состояние каждого объекта."}</p>
        </div>

        <div className="lesson-route">
          <ol>
            <li>
              <strong>{"1. Подготовить шаблон:"}</strong> {" Image фиксирует файлы приложения, runtime и установленные зависимости."}
            </li>
            <li>
              <strong>{"2. Создать экземпляр:"}</strong> {" Container получает writable layer, environment и сетевые настройки."}
            </li>
            <li>
              <strong>{"3. Запустить процесс:"}</strong> {" Команда image становится главным процессом container."}
            </li>
          </ol>
        </div>

        <MethodGrid
          rows={[
            [
              <>наблюдать</>,
              "Зафиксируйте наблюдаемый результат раздела «От работающего процесса к воспроизводимому запуску» до изменения параметров.",
            ],
            [
              <>предсказать</>,
              "Выберите один параметр из шага «Главная модель» и сначала запишите ожидаемый эффект.",
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
          {"Docker не исправляет само приложение. Он делает его среду и процедуру запуска воспроизводимыми."}
        </Callout>
      </Section>

      <Section number={"02"} title={"Docker client, daemon, image и container"}>
        <Lead>
          {"Команда docker в терминале является client. Она отправляет запрос Docker Engine, а daemon выполняет build, создаёт container и управляет его жизненным циклом."}
        </Lead>

        <div className="lesson-practice-steps">
          <h3>{"Client"}</h3>
          <p>{"Принимает команду docker run или docker build и показывает результат пользователю."}</p>
          <h3>{"Daemon"}</h3>
          <p>{"Хранит images, создаёт containers и взаимодействует с возможностями операционной системы."}</p>
          <h3>{"Объекты"}</h3>
          <p>{"Image является шаблоном, container — конкретным экземпляром с именем, id и состоянием."}</p>
        </div>

        <FlipCards
          cards={[
            { front: <strong>{"Dockerfile"}</strong>, back: <span>{"Текстовая инструкция сборки image."}</span> },
            { front: <strong>{"Image"}</strong>, back: <span>{"Read-only шаблон файловой системы и конфигурации запуска."}</span> },
            { front: <strong>{"Container"}</strong>, back: <span>{"Созданный экземпляр image с собственным состоянием."}</span> },
            { front: <strong>{"Process"}</strong>, back: <span>{"Реально выполняющаяся команда внутри запущенного container."}</span> },
          ]}
        />

        <MethodGrid
          rows={[
            [
              <>наблюдать</>,
              "Зафиксируйте наблюдаемый результат раздела «Docker client, daemon, image и container» до изменения параметров.",
            ],
            [
              <>предсказать</>,
              "Выберите один параметр из шага «Daemon» и сначала запишите ожидаемый эффект.",
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
          {"CLI и daemon могут находиться на разных машинах, но в базовом локальном сценарии это одна установленная Docker-среда."}
        </Callout>
      </Section>

      <Section number={"03"} title={"Один image — несколько независимых containers"}>
        <Lead>
          {"Image можно использовать многократно. Каждый docker run создаёт новый container с отдельным id, writable layer и процессом, даже если все экземпляры основаны на одном шаблоне."}
        </Lead>

        <div className="lesson-practice-steps">
          <h3>{"Общее"}</h3>
          <p>{"Base image и файлы, записанные при build, одинаковы для всех экземпляров."}</p>
          <h3>{"Отдельное"}</h3>
          <p>{"Имя, environment, опубликованные порты и изменения writable layer принадлежат конкретному container."}</p>
          <h3>{"Проверка"}</h3>
          <p>{"Два container могут иметь одинаковый внутренний port, если опубликованы на разные host ports."}</p>
        </div>

        <BranchExplorer
          code={"studyhub-api:0.1\n├── container web-a → process uvicorn → host 8001\n└── container web-b → process uvicorn → host 8002"}
          scenarios={[
            { label: "web-a", activeLine: 1, output: "container id A, host port 8001" },
            { label: "web-b", activeLine: 2, output: "container id B, host port 8002" },
            { label: "remove web-a", activeLine: 1, output: "web-b продолжает работать" },
          ]}
        />

        <MethodGrid
          rows={[
            [
              <>наблюдать</>,
              "Зафиксируйте наблюдаемый результат раздела «Один image — несколько независимых containers» до изменения параметров.",
            ],
            [
              <>предсказать</>,
              "Выберите один параметр из шага «Отдельное» и сначала запишите ожидаемый эффект.",
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
          {"Container не является копией Python-процесса в памяти. Сначала создаётся изолированная среда, затем внутри неё запускается команда."}
        </Callout>
      </Section>

      <Section number={"04"} title={"Lifecycle: create, start, stop и remove"}>
        <Lead>
          {"Запущенный process и существующий container — не одно состояние. После завершения процесса container обычно остаётся в списке stopped, пока его явно не удалить или не использовать --rm."}
        </Lead>

        <div className="lesson-practice-steps">
          <h3>{"Created"}</h3>
          <p>{"Файловая система и настройки подготовлены, но главный процесс ещё не работает."}</p>
          <h3>{"Running"}</h3>
          <p>{"Главный процесс запущен; container считается работающим, пока жив этот процесс."}</p>
          <h3>{"Exited"}</h3>
          <p>{"Процесс завершился и оставил exit code, доступный для диагностики."}</p>
        </div>

        <CodeSequence
          title={"Соберите жизненный цикл container"}
          prompt={"Расположите действия от создания экземпляра до очистки."}
          pieces={[
            { id: "create", code: "docker create --name demo python:3.12-slim" },
            { id: "start", code: "docker start demo" },
            { id: "inspect", code: "docker ps -a" },
            { id: "stop", code: "docker stop demo" },
            { id: "remove", code: "docker rm demo" },
            { id: "wrong", code: "docker build demo", note: "build создаёт image, а не запускает этот container" },
          ]}
          correctOrder={["create", "start", "inspect", "stop", "remove"]}
          explanation={"Создание, запуск, остановка и удаление являются разными операциями над одним container."}
        />

        <MethodGrid
          rows={[
            [
              <>наблюдать</>,
              "Зафиксируйте наблюдаемый результат раздела «Lifecycle: create, start, stop и remove» до изменения параметров.",
            ],
            [
              <>предсказать</>,
              "Выберите один параметр из шага «Running» и сначала запишите ожидаемый эффект.",
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
          {"Флаг --rm подходит для одноразовых экспериментов, но stopped container полезен при расследовании exit code и логов."}
        </Callout>
      </Section>

      <Section number={"05"} title={"Writable layer и временное файловое состояние"}>
        <Lead>
          {"Файлы image образуют исходную read-only основу. Изменения работающего container записываются в его writable layer и исчезают при удалении этого container, если данные не вынесены в mount."}
        </Lead>

        <div className="lesson-practice-steps">
          <h3>{"Image layer"}</h3>
          <p>{"Одинаков для новых экземпляров и не меняется командой внутри работающего container."}</p>
          <h3>{"Writable layer"}</h3>
          <p>{"Хранит новые и изменённые файлы конкретного container."}</p>
          <h3>{"Данные проекта"}</h3>
          <p>{"Загруженные файлы, SQLite и пользовательские вложения нельзя считать сохранёнными только потому, что они видны внутри container."}</p>
        </div>

        <BugHunt
          code={"docker run --name studyhub studyhub-api:0.1\n# приложение пишет uploads/avatar.png внутрь /app/uploads\ndocker rm -f studyhub\ndocker run --name studyhub studyhub-api:0.1"}
          question={"Почему avatar.png больше нет?"}
          options={["Файл находился только в writable layer удалённого container", "Docker очищает все файлы host-машины", "Image автоматически откатился к предыдущему Git commit"]}
          correctIndex={0}
          explanation={"Новый container создаётся из исходного image и не наследует writable layer удалённого экземпляра."}
          fix={"Для постоянных данных используйте volume или внешнее хранилище; bind mount применяйте осознанно в development."}
        />

        <MethodGrid
          rows={[
            [
              <>наблюдать</>,
              "Зафиксируйте наблюдаемый результат раздела «Writable layer и временное файловое состояние» до изменения параметров.",
            ],
            [
              <>предсказать</>,
              "Выберите один параметр из шага «Writable layer» и сначала запишите ожидаемый эффект.",
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
          {"В блоке 31 PostgreSQL получит отдельный volume. Здесь достаточно увидеть саму границу постоянного и временного состояния."}
        </Callout>
      </Section>

      <Section number={"06"} title={"Первый управляемый эксперимент без Dockerfile"}>
        <Lead>
          {"До сборки собственного image полезно запустить готовый Python image и увидеть процесс, рабочую директорию и удаление одноразового container."}
        </Lead>

        <div className="lesson-practice-steps">
          <h3>{"Получить image"}</h3>
          <p>{"Docker скачает python:3.12-slim, если его ещё нет локально."}</p>
          <h3>{"Переопределить команду"}</h3>
          <p>{"После имени image указывается команда, которую нужно выполнить в новом container."}</p>
          <h3>{"Очистить экземпляр"}</h3>
          <p>{"--rm удалит container после завершения процесса, но сохранит скачанный image."}</p>
        </div>

        <TerminalDemo
          title={"готовый Python image"}
          lines={[
            { cmd: "docker run --rm python:3.12-slim python -c \"import os; print(os.getpid()); print(os.getcwd())\"" },
            { out: "1" },
            { out: "/" },
            { cmd: "docker image ls python:3.12-slim" },
            { out: "python   3.12-slim   ..." },
          ]}
        />

        <MethodGrid
          rows={[
            [
              <>наблюдать</>,
              "Зафиксируйте наблюдаемый результат раздела «Первый управляемый эксперимент без Dockerfile» до изменения параметров.",
            ],
            [
              <>предсказать</>,
              "Выберите один параметр из шага «Переопределить команду» и сначала запишите ожидаемый эффект.",
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
          {"PID 1 относится к пространству процессов container. Это не означает, что на host-машине у процесса тот же PID."}
        </Callout>
      </Section>

      <Section number={"07"} title={"Применяем модель к StudyHub"}>
        <Lead>
          {"Перед Dockerfile зафиксируем контракт контейнеризации: image содержит код и зависимости, runtime получает environment, главный процесс запускает Uvicorn, а постоянные данные остаются вне writable layer."}
        </Lead>

        <div className="lesson-practice-steps">
          <h3>{"Входит в image"}</h3>
          <p>{"Python runtime, зависимости, app, migrations и команда запуска."}</p>
          <h3>{"Передаётся при run"}</h3>
          <p>{"DATABASE_URL, APP_ENV, секреты, host port и имя container."}</p>
          <h3>{"Не хранится внутри"}</h3>
          <p>{"PostgreSQL data, пользовательские uploads и локальный .env с секретами."}</p>
        </div>

        <MatchPairs
          prompt={"Соедините объект StudyHub с правильной границей."}
          leftTitle={"Объект"}
          rightTitle={"Где находится"}
          pairs={[
            { left: "app/main.py", right: "image" },
            { left: "DATABASE_URL", right: "runtime environment" },
            { left: "PostgreSQL rows", right: "внешнее постоянное хранилище" },
            { left: "container exit code", right: "состояние конкретного container" },
          ]}
          explanation={"Image хранит воспроизводимый код, runtime получает конфигурацию, данные живут отдельно."}
        />

        <MethodGrid
          rows={[
            [
              <>наблюдать</>,
              "Зафиксируйте наблюдаемый результат раздела «Применяем модель к StudyHub» до изменения параметров.",
            ],
            [
              <>предсказать</>,
              "Выберите один параметр из шага «Передаётся при run» и сначала запишите ожидаемый эффект.",
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
          {"Такое разделение делает один image пригодным для development, test и deployment без переписывания Python-кода."}
        </Callout>
      </Section>

      <Section number="08" title="Контрольная точка и проектная практика">
        <Lead>
          {"Соберите модель занятия, проверьте четыре принципиальных различия и примените результат к текущему Docker-артефакту StudyHub."}
        </Lead>

        <div className="lesson-check-group">
          <QuizCard
            question={"Что создаёт docker run?"}
            options={["Новый container из image", "Новый Git repository", "Только Python virtualenv"]}
            correctIndex={0}
            explanation={"Run создаёт экземпляр image и запускает его команду."}
          />
          <QuizCard
            question={"Что прекращает состояние running?"}
            options={["Завершение главного процесса", "Закрытие терминала с docker ps", "Удаление исходного Dockerfile"]}
            correctIndex={0}
            explanation={"Жизнь container связана с главным процессом."}
          />
          <QuizCard
            question={"Где хранится файл, созданный без mount?"}
            options={["В writable layer container", "В Dockerfile", "Во всех containers этого image"]}
            correctIndex={0}
            explanation={"Изменение принадлежит конкретному экземпляру."}
          />
          <QuizCard
            question={"Чем image отличается от container?"}
            options={["Image — шаблон, container — экземпляр", "Image работает, container только хранится", "Разницы нет"]}
            correctIndex={0}
            explanation={"Image используется для создания containers."}
          />
        </div>

        <KeyTakeaways
          points={[
            <>{"Docker client отправляет команды Docker Engine."}</>,
            <>{"Image является воспроизводимым шаблоном, а container — его конкретным экземпляром."}</>,
            <>{"Внутри running container работает главный процесс."}</>,
            <>{"Один image может породить несколько независимых containers."}</>,
            <>{"Writable layer удаляется вместе с container."}</>,
            <>{"Постоянные данные и секреты не должны зависеть от writable layer."}</>,
          ]}
        />

        <PracticeCta text={"Запустите готовый python:3.12-slim, сравните docker ps и docker ps -a, создайте файл внутри именованного container, удалите его и докажите, что новый экземпляр не наследует этот файл. Зафиксируйте наблюдения в docs/docker-model.md."} />
      </Section>
    </RichLesson>
  );
}

// 172. Первый Dockerfile для FastAPI
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
      <TheoryBridge lesson={172} />

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

// 173. Build context, layers и кеш сборки
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
      <TheoryBridge lesson={173} />

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

// 174. Ports, environment и файловое состояние container
export function Lesson174({ module }: { module?: string }) {
  return (
    <RichLesson>
      <RichHero
        variant="project"
        chip={module ?? BLOCK_TITLE}
        title={"Ports, environment и файловое состояние container"}
        intro={"Научимся управлять runtime без пересборки image: разведём container port и host port, передадим environment, запустим два экземпляра StudyHub и проверим границу временной файловой системы."}
        tags={[
          { icon: <Cloud size={14} />, label: "host ↔ container port" },
          { icon: <HardDrive size={14} />, label: "runtime state" },
        ]}
      />
      <TheoryBridge lesson={174} />

      <Section number={"01"} title={"Image одинаковый, runtime-конфигурация разная"}>
        <Lead>
          {"Пересобирать image для каждого APP_ENV, port или DATABASE_URL неправильно. Image хранит код, а конкретный запуск получает environment и сетевые mapping."}
        </Lead>

        <div className="lesson-practice-steps">
          <h3>{"Build artifact"}</h3>
          <p>{"studyhub-api:dev одинаков для нескольких запусков."}</p>
          <h3>{"Runtime parameters"}</h3>
          <p>{"Имя, environment, published ports и mounts задаются docker run."}</p>
          <h3>{"Проверка"}</h3>
          <p>{"Два containers отвечают на разных host ports, хотя внутри слушают один port 8000."}</p>
        </div>

        <div className="lesson-route">
          <ol>
            <li>
              <strong>{"image:"}</strong> {" studyhub-api:dev"}
            </li>
            <li>
              <strong>{"run A:"}</strong> {" APP_ENV=demo-a, host 8001"}
            </li>
            <li>
              <strong>{"run B:"}</strong> {" APP_ENV=demo-b, host 8002"}
            </li>
            <li>
              <strong>{"same process contract:"}</strong> {" container port 8000"}
            </li>
          </ol>
        </div>

        <MethodGrid
          rows={[
            [
              <>наблюдать</>,
              "Зафиксируйте наблюдаемый результат раздела «Image одинаковый, runtime-конфигурация разная» до изменения параметров.",
            ],
            [
              <>предсказать</>,
              "Выберите один параметр из шага «Runtime parameters» и сначала запишите ожидаемый эффект.",
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
          {"Конфигурация окружения — свойство запуска, а не причина создавать новый source branch или новый Dockerfile."}
        </Callout>
      </Section>

      <Section number={"02"} title={"Container port и host port — разные адресные пространства"}>
        <Lead>
          {"Uvicorn слушает 8000 внутри network namespace container. Флаг -p создаёт правило публикации на host; запись читается слева направо как HOST:CONTAINER."}
        </Lead>

        <div className="lesson-practice-steps">
          <h3>{"Внутри"}</h3>
          <p>{"Процесс слушает 0.0.0.0:8000 в container."}</p>
          <h3>{"Снаружи"}</h3>
          <p>{"Host может принять запрос на 127.0.0.1:8001."}</p>
          <h3>{"Mapping"}</h3>
          <p>{"-p 127.0.0.1:8001:8000 направляет host traffic во внутренний port."}</p>
        </div>

        <MatchPairs
          prompt={"Соедините адрес и его роль."}
          leftTitle={"Адрес"}
          rightTitle={"Смысл"}
          pairs={[
            { left: "0.0.0.0:8000 внутри", right: "Uvicorn слушает интерфейсы container" },
            { left: "127.0.0.1:8001 host", right: "доступ только с локальной host-машины" },
            { left: "-p 8001:8000", right: "host 8001 направляется в container 8000" },
            { left: "без -p", right: "process работает, но port не опубликован host" },
          ]}
          explanation={"Внутренний listener и внешний published port являются разными уровнями."}
        />

        <MethodGrid
          rows={[
            [
              <>наблюдать</>,
              "Зафиксируйте наблюдаемый результат раздела «Container port и host port — разные адресные пространства» до изменения параметров.",
            ],
            [
              <>предсказать</>,
              "Выберите один параметр из шага «Снаружи» и сначала запишите ожидаемый эффект.",
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
          {"Публикация без явного host IP часто открывает port на всех host interfaces. Для локальной практики безопаснее использовать 127.0.0.1:HOST:CONTAINER."}
        </Callout>
      </Section>

      <Section number={"03"} title={"EXPOSE документирует, но не публикует"}>
        <Lead>
          {"Dockerfile-инструкция EXPOSE сообщает ожидаемый runtime port image. Она не создаёт firewall rule и не заменяет флаг -p."}
        </Lead>

        <div className="lesson-practice-steps">
          <h3>{"Metadata"}</h3>
          <p>{"EXPOSE 8000 помогает инструментам и читателю понять контракт image."}</p>
          <h3>{"Publication"}</h3>
          <p>{"Только docker run -p делает port доступным через host mapping."}</p>
          <h3>{"Прогноз"}</h3>
          <p>{"Container с EXPOSE, но без -p, не отвечает по host:8000."}</p>
        </div>

        <TrueFalse
          statement={<>{"После EXPOSE 8000 приложение автоматически доступно по http://localhost:8000."}</>}
          isTrue={false}
          explanation={"EXPOSE является metadata. Для доступа с host нужен --publish/-p или сетевой доступ другого container."}
        />

        <MethodGrid
          rows={[
            [
              <>наблюдать</>,
              "Зафиксируйте наблюдаемый результат раздела «EXPOSE документирует, но не публикует» до изменения параметров.",
            ],
            [
              <>предсказать</>,
              "Выберите один параметр из шага «Publication» и сначала запишите ожидаемый эффект.",
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
          {"EXPOSE всё равно полезен: он фиксирует внутренний сетевой контракт рядом с CMD."}
        </Callout>
      </Section>

      <Section number={"04"} title={"Environment через -e и --env-file"}>
        <Lead>
          {"FastAPI settings читает переменные процесса. Docker может передать отдельное значение флагом -e или набор значений из файла при запуске."}
        </Lead>

        <div className="lesson-practice-steps">
          <h3>{"-e NAME=value"}</h3>
          <p>{"Подходит для одной-двух учебных переменных."}</p>
          <h3>{"--env-file"}</h3>
          <p>{"Удобен для локального набора config, но файл с secrets не коммитится."}</p>
          <h3>{"Validation"}</h3>
          <p>{"Отсутствующая обязательная переменная должна приводить к понятной startup error."}</p>
        </div>

        <TerminalDemo
          title={"два runtime окружения"}
          lines={[
            { cmd: "docker run -d --name studyhub-a -p 127.0.0.1:8001:8000 -e APP_ENV=demo-a studyhub-api:dev" },
            { out: "container studyhub-a started" },
            { cmd: "docker run -d --name studyhub-b -p 127.0.0.1:8002:8000 --env-file .env.container studyhub-api:dev" },
            { out: "container studyhub-b started" },
          ]}
        />

        <MethodGrid
          rows={[
            [
              <>наблюдать</>,
              "Зафиксируйте наблюдаемый результат раздела «Environment через -e и --env-file» до изменения параметров.",
            ],
            [
              <>предсказать</>,
              "Выберите один параметр из шага «--env-file» и сначала запишите ожидаемый эффект.",
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
          {"Не выводите весь environment в logs: там могут находиться passwords и tokens."}
        </Callout>
      </Section>

      <Section number={"05"} title={"Writable layer не является постоянным storage"}>
        <Lead>
          {"Приложение может создать файл внутри /app, но этот файл принадлежит конкретному container. Recreate из того же image начинается с исходного состояния."}
        </Lead>

        <div className="lesson-practice-steps">
          <h3>{"Создать"}</h3>
          <p>{"docker exec записывает marker в writable layer."}</p>
          <h3>{"Проверить"}</h3>
          <p>{"Файл виден, пока существует этот container."}</p>
          <h3>{"Пересоздать"}</h3>
          <p>{"После rm новый container не содержит marker."}</p>
        </div>

        <CodeSequence
          title={"Соберите эксперимент с временным файлом"}
          prompt={"Расположите команды так, чтобы доказать потерю writable state."}
          pieces={[
            { id: "run1", code: "docker run -d --name state-lab studyhub-api:dev" },
            { id: "write", code: "docker exec state-lab sh -c \"echo demo > /tmp/marker\"" },
            { id: "read", code: "docker exec state-lab cat /tmp/marker" },
            { id: "remove", code: "docker rm -f state-lab" },
            { id: "run2", code: "docker run -d --name state-lab studyhub-api:dev" },
            { id: "check", code: "docker exec state-lab test -f /tmp/marker" },
          ]}
          correctOrder={["run1", "write", "read", "remove", "run2", "check"]}
          explanation={"Новый container не наследует изменения writable layer удалённого экземпляра."}
        />

        <MethodGrid
          rows={[
            [
              <>наблюдать</>,
              "Зафиксируйте наблюдаемый результат раздела «Writable layer не является постоянным storage» до изменения параметров.",
            ],
            [
              <>предсказать</>,
              "Выберите один параметр из шага «Проверить» и сначала запишите ожидаемый эффект.",
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
          {"Stateless API-container проще заменять и масштабировать, потому что его важное состояние вынесено во внешние services."}
        </Callout>
      </Section>

      <Section number={"06"} title={"Bind mount как отдельный development-режим"}>
        <Lead>
          {"Bind mount подменяет путь container содержимым host-директории. Это удобно для live-edit source, но делает запуск зависимым от структуры файлов host."}
        </Lead>

        <div className="lesson-practice-steps">
          <h3>{"Development"}</h3>
          <p>{"--mount type=bind позволяет container видеть изменения app на host."}</p>
          <h3>{"Shadowing"}</h3>
          <p>{"Mount поверх /app/app скрывает файлы, записанные в image по этому пути."}</p>
          <h3>{"Production boundary"}</h3>
          <p>{"Релизный image должен содержать проверенный source и не зависеть от папки автора."}</p>
        </div>

        <CompareSolutions
          question={"Какой режим подходит для воспроизводимого release?"}
          left={{
            title: "Bind-mounted source",
            code: "docker run --mount type=bind,src=./app,dst=/app/app ...",
            note: "Полезно для разработки, но зависит от host files.",
          }}
          right={{
            title: "Source внутри image",
            code: "docker run studyhub-api:0.1.0",
            note: "Запускается один и тот же проверенный artifact.",
          }}
          preferred="right"
          explanation={"Release должен использовать source из image; bind mount остаётся отдельным dev workflow."}
        />

        <MethodGrid
          rows={[
            [
              <>наблюдать</>,
              "Зафиксируйте наблюдаемый результат раздела «Bind mount как отдельный development-режим» до изменения параметров.",
            ],
            [
              <>предсказать</>,
              "Выберите один параметр из шага «Shadowing» и сначала запишите ожидаемый эффект.",
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
          {"Mount не копирует файлы внутрь image. Он меняет файловый view конкретного container на время запуска."}
        </Callout>
      </Section>

      <Section number={"07"} title={"Два экземпляра StudyHub из одного image"}>
        <Lead>
          {"Финальный эксперимент объединяет ports и environment: один image запускается дважды, containers получают разные имена и APP_ENV, но сохраняют одинаковый внутренний контракт."}
        </Lead>

        <div className="lesson-practice-steps">
          <h3>{"Instance A"}</h3>
          <p>{"127.0.0.1:8001 → container 8000, APP_ENV=blue."}</p>
          <h3>{"Instance B"}</h3>
          <p>{"127.0.0.1:8002 → container 8000, APP_ENV=green."}</p>
          <h3>{"Проверка"}</h3>
          <p>{"/health или служебный config endpoint показывает разные environments без rebuild."}</p>
        </div>

        <TerminalDemo
          title={"one image, two containers"}
          lines={[
            { cmd: "docker run -d --name studyhub-blue -p 127.0.0.1:8001:8000 -e APP_ENV=blue studyhub-api:dev" },
            { cmd: "docker run -d --name studyhub-green -p 127.0.0.1:8002:8000 -e APP_ENV=green studyhub-api:dev" },
            { cmd: "docker ps --format \"table {{.Names}}\\t{{.Ports}}\"" },
            { out: "studyhub-blue    127.0.0.1:8001->8000/tcp" },
            { out: "studyhub-green   127.0.0.1:8002->8000/tcp" },
          ]}
        />

        <MethodGrid
          rows={[
            [
              <>наблюдать</>,
              "Зафиксируйте наблюдаемый результат раздела «Два экземпляра StudyHub из одного image» до изменения параметров.",
            ],
            [
              <>предсказать</>,
              "Выберите один параметр из шага «Instance B» и сначала запишите ожидаемый эффект.",
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
          {"Одинаковый host port нельзя одновременно привязать к двум running containers. Меняется левая часть mapping, а внутренний port может совпадать."}
        </Callout>
      </Section>

      <Section number="08" title="Контрольная точка и проектная практика">
        <Lead>
          {"Соберите модель занятия, проверьте четыре принципиальных различия и примените результат к текущему Docker-артефакту StudyHub."}
        </Lead>

        <div className="lesson-check-group">
          <QuizCard
            question={"Как читается -p 8001:8000?"}
            options={["host 8001 → container 8000", "container 8001 → host 8000", "два host ports"]}
            correctIndex={0}
            explanation={"Слева host, справа container."}
          />
          <QuizCard
            question={"Что делает EXPOSE?"}
            options={["Документирует внутренний port", "Автоматически публикует port", "Запускает Uvicorn"]}
            correctIndex={0}
            explanation={"Публикация выполняется флагом -p."}
          />
          <QuizCard
            question={"Где передавать APP_ENV?"}
            options={["При docker run", "Зашить отдельным source branch", "В имени image layer"]}
            correctIndex={0}
            explanation={"Runtime configuration не требует rebuild."}
          />
          <QuizCard
            question={"Что происходит с writable layer после rm?"}
            options={["Он удаляется вместе с container", "Он добавляется в image", "Он становится volume"]}
            correctIndex={0}
            explanation={"Для persistence нужен mount или внешний storage."}
          />
        </div>

        <KeyTakeaways
          points={[
            <>{"Container port и host port принадлежат разным сетевым пространствам."}</>,
            <>{"-p читается как HOST:CONTAINER."}</>,
            <>{"EXPOSE документирует port, но не публикует его."}</>,
            <>{"Runtime environment передаётся без пересборки image."}</>,
            <>{"Writable layer удаляется вместе с container."}</>,
            <>{"Bind mount полезен в development, но release использует source из image."}</>,
          ]}
        />

        <PracticeCta text={"Запустите studyhub-api:dev дважды на host ports 8001 и 8002 с разными APP_ENV. Проверьте оба /health, создайте marker-файл в одном container, пересоздайте его и зафиксируйте исчезновение файла. Опишите границы image, runtime config и persistence в README."} />
      </Section>
    </RichLesson>
  );
}

// 175. .dockerignore, непривилегированный пользователь и чистый image
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
      <TheoryBridge lesson={175} />

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

// 176. Диагностика container и релизный Dockerfile
export function Lesson176({ module }: { module?: string }) {
  return (
    <RichLesson>
      <RichHero
        variant="project"
        chip={module ?? BLOCK_TITLE}
        title={"Диагностика container и релизный Dockerfile"}
        intro={"Соберём итоговый Dockerfile и научимся расследовать четыре класса сбоев: ошибка build, немедленный exit, неверный network contract и failing healthcheck."}
        tags={[
          { icon: <Wrench size={14} />, label: "build · run · health" },
          { icon: <CheckCircle2 size={14} />, label: "release runbook" },
        ]}
      />
      <TheoryBridge lesson={176} />

      <Section number={"01"} title={"Диагностика начинается с определения фазы сбоя"}>
        <Lead>
          {"Одинаковая фраза «Docker не работает» скрывает разные причины. Сначала определяем, сломался build, container creation, process runtime, network access или application health."}
        </Lead>

        <div className="lesson-practice-steps">
          <h3>{"Build"}</h3>
          <p>{"Image не создан; ищем failing instruction и input context."}</p>
          <h3>{"Run"}</h3>
          <p>{"Container создан, но process завершился; читаем exit code и logs."}</p>
          <h3>{"Health/network"}</h3>
          <p>{"Process жив, но request не проходит или healthcheck сообщает unhealthy."}</p>
        </div>

        <TypeCards>
          <TypeCard badge={"build"} title={"Ошибка сборки"} code={"docker build --progress=plain ..."}>
            {"Dockerfile instruction или dependency install не завершились."}
          </TypeCard>
          <TypeCard badge={"runtime"} badgeTone="float" title={"Container exited"} code={"docker ps -a && docker logs"}>
            {"Главный process завершился с exit code."}
          </TypeCard>
          <TypeCard badge={"health"} badgeTone="str" title={"Process жив, API не готов"} code={"docker inspect && curl"}>
            {"Проверяем port mapping, listener и /health."}
          </TypeCard>
        </TypeCards>

        <MethodGrid
          rows={[
            [
              <>наблюдать</>,
              "Зафиксируйте наблюдаемый результат раздела «Диагностика начинается с определения фазы сбоя» до изменения параметров.",
            ],
            [
              <>предсказать</>,
              "Выберите один параметр из шага «Run» и сначала запишите ожидаемый эффект.",
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
          {"Не начинайте с docker exec, если container уже stopped: сначала logs и inspect state."}
        </Callout>
      </Section>

      <Section number={"02"} title={"Build error: читаем первую реально упавшую instruction"}>
        <Lead>
          {"Build log показывает последовательность steps. Полезная причина обычно находится в первом step со статусом ERROR, а не в последних итоговых строках builder-а."}
        </Lead>

        <div className="lesson-practice-steps">
          <h3>{"Missing file"}</h3>
          <p>{"COPY requirements.txt . падает, если файл вне context или переименован."}</p>
          <h3>{"Dependency failure"}</h3>
          <p>{"RUN pip install показывает package и системную причину."}</p>
          <h3>{"Reproduce"}</h3>
          <p>{"--progress=plain раскрывает подробный вывод команды."}</p>
        </div>

        <BugHunt
          code={"#6 COPY requirements.txt .\n#6 ERROR: failed to calculate checksum: \"/requirements.txt\": not found"}
          question={"Что проверить первым?"}
          options={["Наличие requirements.txt внутри build context и .dockerignore", "Host port 8000", "Health endpoint"]}
          correctIndex={0}
          explanation={"Ошибка возникла на build stage до создания image и не связана с network runtime."}
          fix={"Проверьте путь context: docker build -f Dockerfile .\nУбедитесь, что requirements.txt не исключён .dockerignore."}
        />

        <MethodGrid
          rows={[
            [
              <>наблюдать</>,
              "Зафиксируйте наблюдаемый результат раздела «Build error: читаем первую реально упавшую instruction» до изменения параметров.",
            ],
            [
              <>предсказать</>,
              "Выберите один параметр из шага «Dependency failure» и сначала запишите ожидаемый эффект.",
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
          {"Не очищайте весь cache как первое действие. Сначала установите изменившийся input или failing command."}
        </Callout>
      </Section>

      <Section number={"03"} title={"Exited container: ps -a, logs и exit code"}>
        <Lead>
          {"Если docker run в detached mode вернул id, это ещё не означает, что server продолжает работать. docker ps -a показывает stopped экземпляры, logs — stderr/stdout, inspect — exit code."}
        </Lead>

        <div className="lesson-practice-steps">
          <h3>{"docker ps -a"}</h3>
          <p>{"Находим статус Exited и имя container."}</p>
          <h3>{"docker logs"}</h3>
          <p>{"Читаем traceback, import error или config validation error."}</p>
          <h3>{"docker inspect"}</h3>
          <p>{"Проверяем State.ExitCode и Error без догадок."}</p>
        </div>

        <TerminalDemo
          title={"runtime investigation"}
          lines={[
            { cmd: "docker ps -a --filter name=studyhub-api" },
            { out: "studyhub-api   Exited (1) 5 seconds ago" },
            { cmd: "docker logs studyhub-api" },
            { out: "Error loading ASGI app. Could not import module \"app.main\"." },
            { cmd: "docker inspect --format \"{{.State.ExitCode}}\" studyhub-api" },
            { out: "1" },
          ]}
        />

        <MethodGrid
          rows={[
            [
              <>наблюдать</>,
              "Зафиксируйте наблюдаемый результат раздела «Exited container: ps -a, logs и exit code» до изменения параметров.",
            ],
            [
              <>предсказать</>,
              "Выберите один параметр из шага «docker logs» и сначала запишите ожидаемый эффект.",
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
          {"Сохраняйте failed container до чтения logs и inspect. Флаг --rm неудобен для первого расследования runtime error."}
        </Callout>
      </Section>

      <Section number={"04"} title={"Running, но request не проходит"}>
        <Lead>
          {"Живой process может слушать неверный interface, другой container port или не иметь опубликованного host mapping. Диагностика идёт от процесса наружу."}
        </Lead>

        <div className="lesson-practice-steps">
          <h3>{"Listener"}</h3>
          <p>{"CMD должен запускать Uvicorn на 0.0.0.0:8000."}</p>
          <h3>{"Metadata/runtime"}</h3>
          <p>{"Inspect показывает Config.ExposedPorts и HostConfig.PortBindings."}</p>
          <h3>{"Request"}</h3>
          <p>{"Host обращается к левой части mapping, например 127.0.0.1:8001."}</p>
        </div>

        <BranchExplorer
          code={"process listener\n→ container port\n→ published mapping\n→ host request"}
          scenarios={[
            { label: "127.0.0.1 inside", activeLine: 0, output: "traffic через container interface не принимается" },
            { label: "no -p", activeLine: 2, output: "host mapping отсутствует" },
            { label: "-p 8001:8000", activeLine: 3, output: "request идёт на host 8001" },
          ]}
        />

        <MethodGrid
          rows={[
            [
              <>наблюдать</>,
              "Зафиксируйте наблюдаемый результат раздела «Running, но request не проходит» до изменения параметров.",
            ],
            [
              <>предсказать</>,
              "Выберите один параметр из шага «Metadata/runtime» и сначала запишите ожидаемый эффект.",
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
          {"EXPOSE не исправляет неверный listener и не создаёт mapping. Проверяются все три границы отдельно."}
        </Callout>
      </Section>

      <Section number={"05"} title={"HEALTHCHECK проверяет приложение внутри container"}>
        <Lead>
          {"Running сообщает только о живом главном процессе. HEALTHCHECK периодически запускает отдельную команду и переводит container в starting, healthy или unhealthy."}
        </Lead>

        <div className="lesson-practice-steps">
          <h3>{"Endpoint"}</h3>
          <p>{"/health должен быть быстрым и не выполнять тяжёлый business flow."}</p>
          <h3>{"Инструмент"}</h3>
          <p>{"Slim image не обязан содержать curl, поэтому используем Python standard library."}</p>
          <h3>{"Параметры"}</h3>
          <p>{"start-period даёт приложению время на startup, retries защищает от единичного сбоя."}</p>
        </div>

        <CodeBlock
          caption={"healthcheck без curl"}
          code={"HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 \\\n  CMD python -c \"import urllib.request; urllib.request.urlopen('http://127.0.0.1:8000/health', timeout=2)\""}
        />

        <MethodGrid
          rows={[
            [
              <>наблюдать</>,
              "Зафиксируйте наблюдаемый результат раздела «HEALTHCHECK проверяет приложение внутри container» до изменения параметров.",
            ],
            [
              <>предсказать</>,
              "Выберите один параметр из шага «Инструмент» и сначала запишите ожидаемый эффект.",
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
          {"Healthcheck обращается к container-local port 8000 и не зависит от опубликованного host port."}
        </Callout>
      </Section>

      <Section number={"06"} title={"docker exec и inspect применяются после базовой локализации"}>
        <Lead>
          {"В running container можно проверить environment, пользователя, файлы и imports. Inspect показывает immutable configuration и runtime bindings без изменения системы."}
        </Lead>

        <div className="lesson-practice-steps">
          <h3>{"exec"}</h3>
          <p>{"Выполняет диагностическую команду внутри уже running container."}</p>
          <h3>{"inspect"}</h3>
          <p>{"Показывает image, user, env, ports, state и health history."}</p>
          <h3>{"Ограничение"}</h3>
          <p>{"Ручная правка файла через exec не исправляет Dockerfile и исчезнет после recreate."}</p>
        </div>

        <MatchPairs
          prompt={"Выберите инструмент для каждого вопроса."}
          leftTitle={"Вопрос"}
          rightTitle={"Команда"}
          pairs={[
            { left: "Какой exit code?", right: "docker inspect" },
            { left: "Что написал Uvicorn?", right: "docker logs" },
            { left: "Какой uid у process?", right: "docker exec ... id" },
            { left: "Какие containers stopped?", right: "docker ps -a" },
            { left: "Как настроен port binding?", right: "docker inspect" },
          ]}
          explanation={"Инструмент выбирается по фазе и типу факта, который нужно получить."}
        />

        <MethodGrid
          rows={[
            [
              <>наблюдать</>,
              "Зафиксируйте наблюдаемый результат раздела «docker exec и inspect применяются после базовой локализации» до изменения параметров.",
            ],
            [
              <>предсказать</>,
              "Выберите один параметр из шага «inspect» и сначала запишите ожидаемый эффект.",
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
          {"Исправление делается в source, Dockerfile или run command, затем image/container пересоздаются. Не лечите release ручными изменениями внутри экземпляра."}
        </Callout>
      </Section>

      <Section number={"07"} title={"Финальный Dockerfile и локальный release runbook"}>
        <Lead>
          {"Итоговый artifact объединяет cache boundary, clean context, non-root runtime, явный port contract, healthcheck и exec-form CMD. Runbook доказывает воспроизводимость для другого разработчика."}
        </Lead>

        <div className="lesson-practice-steps">
          <h3>{"Build"}</h3>
          <p>{"Создать versioned tag studyhub-api:0.1.0."}</p>
          <h3>{"Run"}</h3>
          <p>{"Передать env-file, имя и localhost port mapping."}</p>
          <h3>{"Verify"}</h3>
          <p>{"Проверить ps, health status, logs и HTTP smoke request."}</p>
        </div>

        <CodeBlock
          caption={"релизный Dockerfile блока"}
          code={"FROM python:3.12-slim\n\nENV PYTHONDONTWRITEBYTECODE=1 \\\n    PYTHONUNBUFFERED=1\n\nWORKDIR /app\n\nRUN groupadd --system app \\\n    && useradd --system --gid app --home-dir /app app \\\n    && chown app:app /app\n\nCOPY requirements.txt .\nRUN pip install --no-cache-dir -r requirements.txt\n\nCOPY --chown=app:app app ./app\nCOPY --chown=app:app migrations ./migrations\nCOPY --chown=app:app alembic.ini .\n\nUSER app\nEXPOSE 8000\n\nHEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 \\\n  CMD python -c \"import urllib.request; urllib.request.urlopen('http://127.0.0.1:8000/health', timeout=2)\"\n\nCMD [\"uvicorn\", \"app.main:app\", \"--host\", \"0.0.0.0\", \"--port\", \"8000\"]"}
        />

        <MethodGrid
          rows={[
            [
              <>наблюдать</>,
              "Зафиксируйте наблюдаемый результат раздела «Финальный Dockerfile и локальный release runbook» до изменения параметров.",
            ],
            [
              <>предсказать</>,
              "Выберите один параметр из шага «Run» и сначала запишите ожидаемый эффект.",
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
          {"Versioned local tag — начало release discipline. Push в registry и автоматическая сборка будут добавлены только в блоке 32."}
        </Callout>
      </Section>

      <Section number="08" title="Контрольная точка и проектная практика">
        <Lead>
          {"Соберите модель занятия, проверьте четыре принципиальных различия и примените результат к текущему Docker-артефакту StudyHub."}
        </Lead>

        <div className="lesson-check-group">
          <QuizCard
            question={"С чего начинать при Exited (1)?"}
            options={["docker logs и inspect state", "docker exec bash", "изменить host port"]}
            correctIndex={0}
            explanation={"Stopped container сначала исследуется снаружи."}
          />
          <QuizCard
            question={"Что показывает running?"}
            options={["Главный process жив", "Health endpoint обязательно работает", "Database migration завершена"]}
            correctIndex={0}
            explanation={"Health требует отдельной проверки."}
          />
          <QuizCard
            question={"Где выполняется HEALTHCHECK?"}
            options={["Внутри container", "Только в browser", "В Git repository"]}
            correctIndex={0}
            explanation={"Команда использует container-local network."}
          />
          <QuizCard
            question={"Зачем exec-form CMD?"}
            options={["Главный process получает сигналы напрямую", "Увеличить число layers", "Сохранить database"]}
            correctIndex={0}
            explanation={"Лишний shell не становится PID 1."}
          />
        </div>

        <KeyTakeaways
          points={[
            <>{"Сначала определяется фаза сбоя: build, runtime, network или health."}</>,
            <>{"docker ps -a показывает stopped containers."}</>,
            <>{"docker logs и inspect state объясняют exit."}</>,
            <>{"Listener, container port и host mapping проверяются отдельно."}</>,
            <>{"HEALTHCHECK дополняет, но не заменяет application diagnostics."}</>,
            <>{"Release Dockerfile запускает non-root process и имеет versioned runbook."}</>,
          ]}
        />

        <PracticeCta text={"Соберите studyhub-api:0.1.0 и проведите четыре расследования: неверный module path, отсутствующая обязательная environment variable, неправильный port mapping и failing /health. Для каждого зафиксируйте симптом, команду диагностики, найденную причину и исправление. Завершите локальным release runbook."} />
      </Section>
    </RichLesson>
  );
}
