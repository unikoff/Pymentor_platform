import { Boxes, Play } from "lucide-react";
import { BranchExplorer, BugHunt, Callout, CodeSequence, FlipCards, KeyTakeaways, Lead, MatchPairs, MethodGrid, PracticeCta, QuizCard, RichHero, RichLesson, Section, TerminalDemo } from "../../shared";
import { TheoryBridge } from "../../shared";
const BLOCK_TITLE = "Блок 30 · Dockerfile и контейнер приложения";

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
      <TheoryBridge link={"В блоке 29 StudyHub уже запускался как Linux-процесс, получал конфигурацию из environment и писал диагностические логи. Теперь фиксируем для этого процесса подготовленную файловую систему и повторяемый способ запуска."} boundary={"Container не является отдельной виртуальной машиной: в учебной модели это изолированный процесс с собственной файловой системой, сетью и конфигурацией."} />

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
