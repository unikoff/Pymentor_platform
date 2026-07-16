import {
  Braces,
  CheckCircle2,
  Cloud,
  FileText,
  GitBranch,
  KeyRound,
  Layers,
  ListChecks,
  Puzzle,
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
  KeyTakeaways,
  Lead,
  MatchPairs,
  PracticeCta,
  QuizCard,
  RecallCard,
  RichHero,
  RichLesson,
  Section,
  StepThrough,
  TrueFalse,
} from "../shared";

type TheoryBridgeData = {
  link: string;
  boundary: string;
};

const BLOCK_TITLE = "Месяц 3 · Блок 9 · Интернет и HTTP";

const THEORY_BRIDGES: Record<number, TheoryBridgeData> = {
  45: {
    link: "Persistent Planner уже умеет хранить и изменять задачи, но пользователь должен запускать Python рядом с проектом. Теперь отделяем интерфейс от программы и даём другим клиентам обращаться к одному серверу.",
    boundary: "Клиент и сервер — роли процессов, а не обязательно два разных компьютера. На первом этапе оба могут работать на одном ноутбуке.",
  },
  46: {
    link: "В прошлом занятии клиент уже нашёл сервер. Теперь разбираем содержимое сообщения, которое клиент отправляет по этому адресу.",
    boundary: "HTTP request — не вызов Python-функции. Клиент передаёт стандартизированное сообщение, а сервер уже решает, какой код выполнить.",
  },
  47: {
    link: "Клиент уже отправил понятный request. Сервер должен вернуть стандартизированный результат, чтобы любой клиент одинаково понял успех или проблему.",
    boundary: "Status и body не дублируют друг друга: status задаёт категорию исхода, body передаёт конкретные данные и детали.",
  },
  48: {
    link: "Мы уже знаем, что method выражает намерение. Теперь каждому CRUD-действию назначаем устойчивый HTTP-смысл.",
    boundary: "Метод выбирают не по удобству обработчика и не по длине body, а по смыслу операции для ресурса.",
  },
  49: {
    link: "Методы уже описывают действия. REST помогает последовательно назвать объекты, над которыми эти действия выполняются.",
    boundary: "REST — не библиотека и не специальный синтаксис Python. Это набор договорённостей о понятном сетевом интерфейсе.",
  },
  50: {
    link: "Ресурсы и endpoints уже названы. Теперь каждому значению назначаем место во входном запросе и фиксируем полный договор до реализации.",
    boundary: "Path, query и body не являются тремя стилями для одних и тех же данных. Их выбирают по роли значения в операции.",
  },
};

function TheoryBridge({ lesson }: { lesson: number }) {
  const bridge = THEORY_BRIDGES[lesson];

  if (!bridge) {
    return null;
  }

  return (
    <Callout tone="info">
      <strong>Связь с курсом.</strong> {bridge.link}{" "}
      <strong>Важно не перепутать:</strong> {bridge.boundary}
    </Callout>
  );
}

// 45. Почему CLI недостаточно: клиент и сервер
export function Lesson45({ module }: { module?: string }) {
  return (
    <RichLesson>
      <RichHero
        chip={module ?? BLOCK_TITLE}
        title={"Почему CLI недостаточно: клиент и сервер"}
        intro={"Переведём знакомый Persistent Planner из модели «человек запускает программу рядом с файлом» в модель «клиент обращается к серверу». Без FastAPI и сложных сетевых терминов разберём роли, адрес, порт, localhost и полный путь одного запроса."}
        tags={[
          { icon: <Terminal size={14} />, label: "CLI → сетевое приложение" },
          { icon: <Cloud size={14} />, label: "клиент · сервер · localhost" },
        ]}
      />
      <TheoryBridge lesson={45} />

      <Section number="01" title={"От готового CLI к следующей проблеме"}>
        <Lead>
          {"В конце второго месяца StudyHub уже умеет сохранять задачи, выполнять CRUD и переживать перезапуск. Но пользоваться им можно только через терминал того компьютера, где запущен проект. Это ограничение интерфейса, а не ошибка Python."}
        </Lead>

        <div className="lesson-practice-steps">
          <h3>Что уже работает</h3>
          <p>{"Модель Task, сервис, JSON-хранилище, меню и тесты."}</p>

          <h3>Что неудобно</h3>
          <p>{"Каждый пользователь должен получить код, открыть терминал и знать команды запуска."}</p>

          <h3>Новая цель</h3>
          <p>{"Оставить правила задач на сервере, а управление передать отдельному клиенту."}</p>

        </div>

        <CodeBlock
          caption={"текущая модель"}
          code={`пользователь
    ↓
input() и print()
    ↓
PlannerService
    ↓
tasks.json`}
        />

        <CodeBlock
          caption={"целевая модель"}
          code={`клиент
    ↓ запрос
сервер StudyHub
    ↓
PlannerService
    ↓
данные
    ↑ ответ
клиент`}
        />

        <CompareSolutions
          question={"Как предоставить доступ к задачам другому интерфейсу?"}
          left={{
            title: "Скопировать весь проект",
            code: "передать папку и объяснить python -m app.main",
            note: "Каждый клиент получает код и локальные данные.",
          }}
          right={{
            title: "Оставить правила на сервере",
            code: "клиент отправляет запрос серверу",
            note: "Один сервер управляет правилами, клиенты получают ответы.",
          }}
          preferred={"right"}
          explanation={"Сетевой интерфейс отделяет использование приложения от его внутреннего Python-кода."}
        />

        <Callout tone="info">
          {"Мы не выбрасываем Persistent Planner. Его модель и сервисы становятся внутренней частью будущего Planner API."}
        </Callout>
      </Section>

      <Section number="02" title={"Клиент — тот, кто просит"}>
        <Lead>
          {"Клиент начинает взаимодействие: формулирует запрос, указывает адрес сервера и ждёт ответ. Клиентом может быть браузер, мобильное приложение, Swagger, Postman или другой Python-скрипт."}
        </Lead>

        <div className="lesson-practice-steps">
          <h3>Не обязательно человек</h3>
          <p>{"Клиентом часто является программа, которая действует от имени пользователя."}</p>

          <h3>Инициатор</h3>
          <p>{"Без запроса сервер обычно не отправляет конкретному клиенту список задач сам."}</p>

          <h3>Разные интерфейсы</h3>
          <p>{"Один и тот же сервер может обслуживать браузер и мобильное приложение."}</p>

        </div>

        <CodeBlock
          caption={"примеры клиентов"}
          code={`браузер
мобильное приложение
Postman или Insomnia
Swagger UI
Python-скрипт
frontend-сайт`}
        />

        <CodeBlock
          caption={"один смысл"}
          code={`клиент: «дай задачи»
сервер: «вот список задач»`}
        />

        <MatchPairs
          prompt={"Соедините пример с ролью."}
          leftTitle={"Пример"}
          rightTitle={"Роль"}
          pairs={[
            { left: "браузер", right: "клиент" },
            { left: "Planner API", right: "сервер" },
            { left: "кнопка «Показать задачи»", right: "причина отправить запрос" },
            { left: "JSON со списком задач", right: "данные ответа" },
          ]}
          explanation={"Клиент формирует запрос, сервер обрабатывает его и возвращает данные."}
        />

        <Callout tone="info">
          {"В этом блоке мы изучаем договор между клиентом и сервером. Сам frontend писать не нужно."}
        </Callout>
      </Section>

      <Section number="03" title={"Сервер — процесс, который ждёт запросы"}>
        <Lead>
          {"Серверная программа запускается и продолжает работать. Она слушает выбранный адрес и порт, принимает запросы, вызывает нужное правило приложения и возвращает ответ."}
        </Lead>

        <div className="lesson-practice-steps">
          <h3>Долгоживущий процесс</h3>
          <p>{"В отличие от короткого CLI-сценария сервер не завершается после одной команды."}</p>

          <h3>Одна точка правил</h3>
          <p>{"Проверка priority и поиск Task выполняются на сервере."}</p>

          <h3>Несколько клиентов</h3>
          <p>{"Разные клиенты могут обращаться к одному набору правил."}</p>

        </div>

        <CodeBlock
          caption={"упрощённый серверный цикл"}
          code={`запустить сервер
пока сервер работает:
    ждать запрос
    разобрать запрос
    вызвать нужную операцию
    собрать ответ
    отправить ответ`}
        />

        <CodeBlock
          caption={"что остаётся внутри"}
          code={`Task
PlannerService
валидация
ошибки
хранилище`}
        />

        <TrueFalse
          statement={<>{"Сервер обязан находиться на отдельном физическом компьютере."}</>}
          isTrue={false}
          explanation={"Клиент и сервер могут быть двумя процессами на одном ноутбуке. Важны роли и направление общения."}
        />

        <Callout tone="info">
          {"Пока это модель поведения. Реальный сервер через FastAPI и Uvicorn появится в следующем блоке."}
        </Callout>
      </Section>

      <Section number="04" title={"Один компьютер может играть обе роли"}>
        <Lead>
          {"Во время разработки браузер и будущий FastAPI-сервер часто работают на одном компьютере. Они остаются разными процессами и общаются через сетевой интерфейс."}
        </Lead>

        <div className="lesson-practice-steps">
          <h3>Процесс клиента</h3>
          <p>{"Браузер или Postman формирует запрос."}</p>

          <h3>Процесс сервера</h3>
          <p>{"Python-приложение слушает порт."}</p>

          <h3>Изоляция ролей</h3>
          <p>{"Клиент не вызывает функцию PlannerService напрямую."}</p>

        </div>

        <CodeBlock
          caption={"локальная разработка"}
          code={`ноутбук
├── браузер — клиент
└── Python-сервер — сервер`}
        />

        <CodeBlock
          caption={"не прямой вызов"}
          code={`# клиент не делает так:
service.list_tasks()

# клиент обращается к адресу:
http://localhost:8000/tasks`}
        />

        <RecallCard
          question={"Почему браузер и Python-сервер считаются разными сторонами, если запущены на одном ноутбуке?"}
          answer={<p>{"Это разные процессы с разными ролями. Браузер отправляет запрос по адресу, а сервер слушает адрес и возвращает ответ."}</p>}
        />

        <Callout tone="info">
          {"Даже на одном компьютере запрос проходит через договор HTTP. Это позволяет позже вынести сервер на другой компьютер без переписывания клиента целиком."}
        </Callout>
      </Section>

      <Section number="05" title={"localhost и 127.0.0.1"}>
        <Lead>
          {"Имя localhost означает «этот же компьютер». Адрес 127.0.0.1 выражает ту же локальную идею в числовой форме. Такой адрес удобен для разработки, потому что запрос не уходит на внешний сервер."}
        </Lead>

        <div className="lesson-practice-steps">
          <h3>localhost</h3>
          <p>{"Понятное человеку имя локального компьютера."}</p>

          <h3>127.0.0.1</h3>
          <p>{"Специальный loopback-адрес для связи компьютера с самим собой."}</p>

          <h3>Не публичный адрес</h3>
          <p>{"Другой компьютер обычно не сможет открыть ваш localhost."}</p>

        </div>

        <CodeBlock
          caption={"локальные варианты"}
          code={`http://localhost:8000
http://127.0.0.1:8000`}
        />

        <CodeBlock
          caption={"чтение"}
          code={`localhost  → этот компьютер
8000       → конкретная дверь процесса`}
        />

        <FillBlank
          prompt={"Дополните локальный адрес будущего Planner API."}
          before={"http://"}
          after={":8000/tasks"}
          options={[
            "localhost",
            "tasks.json",
            "python",
          ]}
          answer={"localhost"}
          explanation={"localhost указывает на текущий компьютер, а порт и путь дополняют адрес."}
        />

        <Callout tone="info">
          {"Не пытайтесь публиковать проект через localhost. Это адрес разработки и проверки на собственной машине."}
        </Callout>
      </Section>

      <Section number="06" title={"Порт — номер двери процесса"}>
        <Lead>
          {"На одном компьютере одновременно работают браузер, редактор, база данных и несколько серверов. Порт помогает выбрать конкретный процесс, которому предназначен запрос."}
        </Lead>

        <div className="lesson-practice-steps">
          <h3>Адрес компьютера</h3>
          <p>{"localhost определяет машину."}</p>

          <h3>Порт процесса</h3>
          <p>{"8000 определяет слушающий сервер."}</p>

          <h3>Конфликт</h3>
          <p>{"Два процесса не могут одновременно слушать одну и ту же пару адрес + порт."}</p>

        </div>

        <CodeBlock
          caption={"аналогия"}
          code={`дом: localhost
дверь 8000: Planner API
дверь 3000: frontend
дверь 5432: PostgreSQL позже`}
        />

        <CodeBlock
          caption={"два адреса"}
          code={`http://localhost:8000/tasks
http://localhost:3000/tasks`}
        />

        <BugHunt
          code={`Server cannot start
Address already in use
port 8000`}
          question={"Что чаще всего означает сообщение?"}
          options={[
            "Другой процесс уже слушает порт 8000",
            "В URL запрещены числа",
            "Файл tasks.json пуст",
          ]}
          correctIndex={0}
          explanation={"Нужно остановить старый процесс или выбрать свободный порт."}
          fix={"# остановить старый сервер\n# или временно использовать другой порт, например 8001"}
        />

        <Callout tone="info">
          {"Одинаковый путь /tasks на разных портах может вести к совершенно разным приложениям."}
        </Callout>
      </Section>

      <Section number="07" title={"DNS как телефонная книга адресов"}>
        <Lead>
          {"Людям проще помнить pymentor.ru, чем числовой IP-адрес. DNS помогает клиенту получить сетевой адрес по доменному имени. Для localhost внешний DNS обычно не нужен."}
        </Lead>

        <div className="lesson-practice-steps">
          <h3>Домен</h3>
          <p>{"Удобное имя сервера для человека."}</p>

          <h3>IP-адрес</h3>
          <p>{"Числовой сетевой адрес, к которому подключается клиент."}</p>

          <h3>DNS</h3>
          <p>{"Система, которая помогает сопоставить имя и адрес."}</p>

        </div>

        <CodeBlock
          caption={"упрощённый путь"}
          code={`клиент знает имя:
api.studyhub.example

DNS сообщает адрес:
203.0.113.10

клиент подключается к серверу`}
        />

        <CodeBlock
          caption={"локальная разработка"}
          code={`localhost
→ специальное локальное имя
→ этот же компьютер`}
        />

        <CodeSequence
          title={"Как клиент находит внешний сервер"}
          prompt={"Расположите этапы в простом порядке."}
          pieces={[
            { id: "name", code: "клиент получает доменное имя" },
            { id: "dns", code: "DNS возвращает IP-адрес" },
            { id: "connect", code: "клиент подключается к адресу и порту" },
            { id: "request", code: "клиент отправляет HTTP-запрос" },
          ]}
          correctOrder={[
            "name",
            "dns",
            "connect",
            "request",
          ]}
          explanation={"Имя сначала преобразуется в адрес, затем начинается HTTP-общение."}
        />

        <Callout tone="info">
          {"На текущем этапе достаточно понимать назначение DNS. Настройка доменов и серверной инфраструктуры относится к более позднему этапу."}
        </Callout>
      </Section>

      <Section number="08" title={"Полный цикл и первая карта Planner API"}>
        <Lead>
          {"Соберём изученные роли в один маршрут. Кнопка или команда клиента создаёт запрос, сервер выбирает операцию, вызывает знакомый сервис и возвращает ответ."}
        </Lead>

        <div className="lesson-practice-steps">
          <h3>Запрос</h3>
          <p>{"Клиент сообщает, что хочет получить или изменить."}</p>

          <h3>Обработка</h3>
          <p>{"Сервер сопоставляет запрос с операцией PlannerService."}</p>

          <h3>Ответ</h3>
          <p>{"Клиент получает статус и данные."}</p>

          <h3>Повторяемость</h3>
          <p>{"Следующий запрос проходит тот же договор независимо от клиента."}</p>

        </div>

        <CodeBlock
          caption={"цикл"}
          code={`1. клиент выбирает «Показать задачи»
2. отправляет запрос на localhost:8000
3. сервер принимает запрос
4. вызывает service.list_tasks()
5. превращает Task в данные ответа
6. возвращает ответ клиенту`}
        />

        <CodeBlock
          caption={"граница блока"}
          code={`сейчас:
кто общается и по какому адресу

дальше:
как устроены request и response`}
        />

        <Callout tone="info">
          {"Перед переходом к HTTP ученик должен уверенно объяснять роли без слов «магия», «сайт сам вызывает Python» и «localhost — это интернет»."}
        </Callout>

        <div className="lesson-check-group">
          <QuizCard
            question={"Кто начинает обычное взаимодействие?"}
            options={[
              "клиент",
              "JSON-файл",
              "порт",
            ]}
            correctIndex={0}
            explanation={"Клиент отправляет запрос."}
          />
          <QuizCard
            question={"Что делает сервер?"}
            options={[
              "ждёт запросы и возвращает ответы",
              "только хранит HTML",
              "заменяет Python",
            ]}
            correctIndex={0}
            explanation={"Сервер является работающим процессом."}
          />
          <QuizCard
            question={"Что означает localhost?"}
            options={[
              "текущий компьютер",
              "любой сервер интернета",
              "имя папки",
            ]}
            correctIndex={0}
            explanation={"Это локальный адрес разработки."}
          />
          <QuizCard
            question={"Зачем нужен порт?"}
            options={[
              "выбрать конкретный процесс",
              "назвать функцию",
              "зашифровать JSON",
            ]}
            correctIndex={0}
            explanation={"Порт похож на номер двери."}
          />
        </div>

        <KeyTakeaways
          points={[
            <>{"CLI требует запускать интерфейс рядом с проектом."}</>,
            <>{"Клиент формирует запрос и ждёт ответ."}</>,
            <>{"Сервер слушает адрес и обрабатывает запросы."}</>,
            <>{"Клиент и сервер могут работать на одном компьютере."}</>,
            <>{"localhost и 127.0.0.1 указывают на локальную машину."}</>,
            <>{"Порт выбирает конкретный серверный процесс."}</>,
            <>{"DNS связывает доменное имя с сетевым адресом."}</>,
            <>{"Persistent Planner становится внутренней частью Planner API."}</>,
          ]}
        />

        <PracticeCta text={"Нарисуйте путь запроса Planner API от браузера до PlannerService и обратно. Подпишите клиент, сервер, localhost, порт и данные ответа."} />
      </Section>

    </RichLesson>
  );
}

// 46. HTTP request: адрес, метод, headers и body
export function Lesson46({ module }: { module?: string }) {
  return (
    <RichLesson>
      <RichHero
        chip={module ?? BLOCK_TITLE}
        title={"HTTP request: адрес, метод, headers и body"}
        intro={"Разберём HTTP-запрос как понятную форму заказа: куда обращается клиент, какое действие просит выполнить, какие служебные сведения прикладывает и какие данные передаёт серверу."}
        tags={[
          { icon: <Braces size={14} />, label: "структура request" },
          { icon: <FileText size={14} />, label: "URL · method · headers · body" },
        ]}
      />
      <TheoryBridge lesson={46} />

      <Section number="01" title={"Запрос как бланк обращения"}>
        <Lead>
          {"Представьте форму в учебном центре. В ней есть адрес отдела, выбранное действие, служебные отметки и данные ученика. HTTP-запрос устроен похожим образом."}
        </Lead>

        <div className="lesson-practice-steps">
          <h3>Адрес</h3>
          <p>{"Куда отправить сообщение."}</p>

          <h3>Метод</h3>
          <p>{"Какое намерение выражает клиент."}</p>

          <h3>Headers</h3>
          <p>{"Служебные сведения о запросе."}</p>

          <h3>Body</h3>
          <p>{"Основные данные для создания или изменения."}</p>

        </div>

        <CodeBlock
          caption={"четыре части"}
          code={`адрес:   http://localhost:8000/tasks
метод:  POST
headers: Content-Type: application/json
body:   {"title": "HTTP", "priority": 4}`}
        />

        <MatchPairs
          prompt={"Соедините часть запроса и её вопрос."}
          leftTitle={"Часть"}
          rightTitle={"Вопрос"}
          pairs={[
            { left: "URL", right: "куда отправить?" },
            { left: "method", right: "что сделать?" },
            { left: "headers", right: "как описано сообщение?" },
            { left: "body", right: "какие данные переданы?" },
          ]}
          explanation={"Четыре части отвечают на разные вопросы."}
        />

        <Callout tone="info">
          {"Не каждый запрос содержит body, но каждый запрос должен иметь понятный адрес и метод."}
        </Callout>
      </Section>

      <Section number="02" title={"URL — адрес ресурса"}>
        <Lead>
          {"URL можно читать слева направо. На этом этапе достаточно видеть схему, хост, порт и путь. Query-параметры подробно появятся в занятии 50."}
        </Lead>

        <div className="lesson-practice-steps">
          <h3>Схема</h3>
          <p>{"http сообщает способ прикладного общения."}</p>

          <h3>Хост</h3>
          <p>{"localhost указывает на компьютер."}</p>

          <h3>Порт</h3>
          <p>{"8000 выбирает процесс."}</p>

          <h3>Путь</h3>
          <p>{"/tasks указывает нужную область API."}</p>

        </div>

        <CodeBlock
          caption={"разбор URL"}
          code={`http://localhost:8000/tasks
│      │         │    └─ path
│      │         └────── port
│      └──────────────── host
└─────────────────────── scheme`}
        />

        <CodeBlock
          caption={"адрес одной задачи"}
          code={`http://localhost:8000/tasks/7`}
        />

        <FillBlank
          prompt={"Выберите часть URL, которая обозначает путь к коллекции задач."}
          before={"http://localhost:8000"}
          after={""}
          options={[
            "/tasks",
            "POST",
            "application/json",
          ]}
          answer={"/tasks"}
          explanation={"Путь начинается с / и следует после хоста и порта."}
        />

        <Callout tone="info">
          {"URL не содержит пробелы и не является названием Python-файла. Он адресует сетевой ресурс."}
        </Callout>
      </Section>

      <Section number="03" title={"Метод выражает намерение"}>
        <Lead>
          {"Один путь может поддерживать разные действия. Метод помогает серверу отличить чтение списка от создания новой задачи."}
        </Lead>

        <div className="lesson-practice-steps">
          <h3>GET</h3>
          <p>{"Попросить данные."}</p>

          <h3>POST</h3>
          <p>{"Передать данные для создания."}</p>

          <h3>Не имя функции</h3>
          <p>{"Клиент не знает, как называется Python-обработчик."}</p>

        </div>

        <CodeBlock
          caption={"один путь, разные намерения"}
          code={`GET  /tasks
POST /tasks`}
        />

        <CodeBlock
          caption={"чтение"}
          code={`GET /tasks
body отсутствует`}
        />

        <TrueFalse
          statement={<>{"Путь /tasks сам по себе полностью определяет действие."}</>}
          isTrue={false}
          explanation={"GET /tasks и POST /tasks имеют одинаковый путь, но разные методы и смысл."}
        />

        <Callout tone="info">
          {"Полный выбор методов изучается в занятии 48. Сейчас важно увидеть, что метод является отдельной частью запроса."}
        </Callout>
      </Section>

      <Section number="04" title={"Headers — служебные сведения"}>
        <Lead>
          {"Headers похожи на отметки на конверте. Они не являются основной задачей, но помогают серверу правильно понять формат, язык, авторизацию или желаемый ответ."}
        </Lead>

        <div className="lesson-practice-steps">
          <h3>Пары имя-значение</h3>
          <p>{"Каждый header имеет название и значение."}</p>

          <h3>Content-Type</h3>
          <p>{"Описывает формат body, когда body присутствует."}</p>

          <h3>Не бизнес-поля</h3>
          <p>{"Priority задачи не нужно прятать в header."}</p>

        </div>

        <CodeBlock
          caption={"пример headers"}
          code={`Content-Type: application/json
Accept: application/json
User-Agent: ExampleClient/1.0`}
        />

        <CodeBlock
          caption={"неправильная идея"}
          code={`Priority: 4
Title: HTTP

# предметные данные лучше передать в body`}
        />

        <CompareSolutions
          question={"Где передать title новой задачи?"}
          left={{
            title: "В headers",
            code: "Title: Изучить HTTP",
            note: "Служебная область начинает хранить предметные данные.",
          }}
          right={{
            title: "В body",
            code: "{\"title\": \"Изучить HTTP\"}",
            note: "Основные данные запроса находятся в теле.",
          }}
          preferred={"right"}
          explanation={"Headers описывают сообщение, body переносит данные операции."}
        />

        <Callout tone="info">
          {"На старте не нужно запоминать десятки headers. Достаточно уверенно понимать роль Content-Type."}
        </Callout>
      </Section>

      <Section number="05" title={"Body — тело запроса"}>
        <Lead>
          {"Body содержит основные данные, необходимые серверу. У запроса чтения body часто отсутствует, а создание задачи обычно передаёт title и priority в JSON."}
        </Lead>

        <div className="lesson-practice-steps">
          <h3>Не всегда нужен</h3>
          <p>{"GET списка задач обычно обходится без body."}</p>

          <h3>Создание</h3>
          <p>{"POST передаёт поля новой задачи."}</p>

          <h3>Изменение</h3>
          <p>{"PUT или PATCH передаёт новые значения."}</p>

        </div>

        <CodeBlock
          caption={"body создания"}
          code={`{
  "title": "Изучить HTTP",
  "priority": 4,
  "tags": ["backend"]
}`}
        />

        <CodeBlock
          caption={"без body"}
          code={`GET /tasks

# клиент просит уже существующие данные`}
        />

        <RecallCard
          question={"Почему GET /tasks обычно не требует body?"}
          answer={<p>{"Клиент только просит существующую коллекцию. Для базового запроса достаточно метода и адреса."}</p>}
        />

        <Callout tone="info">
          {"Не передавайте идентификатор новой задачи, если сервер отвечает за его создание. Контракт должен явно распределять ответственность."}
        </Callout>
      </Section>

      <Section number="06" title={"JSON как формат body"}>
        <Lead>
          {"HTTP переносит последовательность данных, а JSON задаёт текстовую форму объекта. Знакомые словари Python похожи на JSON, но это не один и тот же объект в памяти."}
        </Lead>

        <div className="lesson-practice-steps">
          <h3>Ключи в кавычках</h3>
          <p>{"JSON требует строковые ключи в двойных кавычках."}</p>

          <h3>Значения</h3>
          <p>{"Поддерживаются строки, числа, bool, null, массивы и объекты."}</p>

          <h3>Граница</h3>
          <p>{"Сервер преобразует JSON в структуры своего языка."}</p>

        </div>

        <CodeBlock
          caption={"JSON body"}
          code={`{
  "title": "SQL",
  "priority": 3,
  "is_done": false
}`}
        />

        <CodeBlock
          caption={"Python после разбора"}
          code={`{
    "title": "SQL",
    "priority": 3,
    "is_done": False,
}`}
        />

        <BugHunt
          code={`{
  'title': 'SQL',
  'priority': 3,
  'is_done': False
}`}
          question={"Почему это не строгий JSON?"}
          options={[
            "Использованы одинарные кавычки и Python-значение False",
            "JSON не поддерживает числа",
            "Поле title должно быть header",
          ]}
          correctIndex={0}
          explanation={"Строгий JSON использует двойные кавычки и false."}
          fix={"{\n  \"title\": \"SQL\",\n  \"priority\": 3,\n  \"is_done\": false\n}"}
        />

        <Callout tone="info">
          {"В JSON используются true, false и null, а в Python — True, False и None."}
        </Callout>
      </Section>

      <Section number="07" title={"Собираем запрос целиком"}>
        <Lead>
          {"Теперь прочитаем один запрос как последовательный договор. Клиент обращается к коллекции задач, просит создать ресурс, сообщает формат JSON и передаёт поля."}
        </Lead>

        <div className="lesson-practice-steps">
          <h3>Стартовая строка</h3>
          <p>{"Метод и путь описывают действие."}</p>

          <h3>Headers</h3>
          <p>{"Content-Type сообщает формат body."}</p>

          <h3>Пустая строка</h3>
          <p>{"В сыром HTTP отделяет headers от body."}</p>

          <h3>Body</h3>
          <p>{"Содержит JSON новой задачи."}</p>

        </div>

        <CodeBlock
          caption={"условная запись HTTP"}
          code={`POST /tasks HTTP/1.1
Host: localhost:8000
Content-Type: application/json

{
  "title": "HTTP request",
  "priority": 4
}`}
        />

        <CodeBlock
          caption={"читаем словами"}
          code={`создай задачу
на сервере localhost:8000
в коллекции /tasks
данные переданы как JSON`}
        />

        <StepThrough
          code={`POST /tasks HTTP/1.1
Host: localhost:8000
Content-Type: application/json

{"title": "HTTP", "priority": 4}`}
          steps={[
            {
              line: 0,
              note: "Клиент выбирает POST и путь /tasks.",
              vars: { "намерение": "создать" },
            },
            {
              line: 1,
              note: "Host указывает сервер и порт.",
              vars: { "server": "localhost:8000" },
            },
            {
              line: 2,
              note: "Content-Type описывает body.",
              vars: { "format": "application/json" },
            },
            {
              line: 4,
              note: "JSON передаёт title и priority.",
              vars: { "title": "HTTP", "priority": "4" },
            },
          ]}
        />

        <Callout tone="info">
          {"Сырой формат полезен для понимания, но вручную собирать такие строки в FastAPI не придётся."}
        </Callout>
      </Section>

      <Section number="08" title={"Практика чтения request"}>
        <Lead>
          {"Научитесь сначала читать запрос, а только потом обсуждать серверный код. Это снижает порог входа в FastAPI: декоратор маршрута позже будет просто описывать уже понятный контракт."}
        </Lead>

        <div className="lesson-practice-steps">
          <h3>Шаг 1</h3>
          <p>{"Назвать метод и намерение."}</p>

          <h3>Шаг 2</h3>
          <p>{"Разобрать host, port и path."}</p>

          <h3>Шаг 3</h3>
          <p>{"Найти Content-Type."}</p>

          <h3>Шаг 4</h3>
          <p>{"Отделить body и проверить JSON."}</p>

        </div>

        <CodeBlock
          caption={"запрос для анализа"}
          code={`POST http://localhost:8000/tasks
Content-Type: application/json

{
  "title": "Разобрать request",
  "priority": 5
}`}
        />

        <CodeBlock
          caption={"контрольные вопросы"}
          code={`куда отправлен запрос?
какой метод?
есть ли body?
какой формат body?
какие предметные поля переданы?`}
        />

        <Callout tone="info">
          {"Не пытайтесь одновременно выбирать статус ответа. В этом занятии мы читаем только сообщение клиента."}
        </Callout>

        <div className="lesson-check-group">
          <QuizCard
            question={"Что сообщает URL?"}
            options={[
              "куда отправить запрос",
              "какой Python-класс создать",
              "какой статус вернуть",
            ]}
            correctIndex={0}
            explanation={"URL является адресом."}
          />
          <QuizCard
            question={"Что выражает method?"}
            options={[
              "намерение клиента",
              "формат JSON",
              "номер процесса",
            ]}
            correctIndex={0}
            explanation={"Метод отделён от пути."}
          />
          <QuizCard
            question={"Для чего нужен Content-Type?"}
            options={[
              "описать формат body",
              "передать title",
              "выбрать порт",
            ]}
            correctIndex={0}
            explanation={"Это служебный header."}
          />
          <QuizCard
            question={"Где передаются поля новой задачи?"}
            options={[
              "в body",
              "в имени сервера",
              "в статусе",
            ]}
            correctIndex={0}
            explanation={"Основные данные находятся в теле."}
          />
        </div>

        <KeyTakeaways
          points={[
            <>{"HTTP request состоит из адреса, метода, headers и возможного body."}</>,
            <>{"URL содержит схему, host, port и path."}</>,
            <>{"Метод выражает намерение клиента."}</>,
            <>{"Headers описывают сообщение."}</>,
            <>{"Content-Type сообщает формат body."}</>,
            <>{"GET-запросу body обычно не нужен."}</>,
            <>{"JSON является текстовым форматом обмена."}</>,
            <>{"Сервер позже связывает запрос с Python-обработчиком."}</>,
          ]}
        />

        <PracticeCta text={"Разберите три подготовленных HTTP-запроса. Для каждого подпишите URL, method, headers, body и человеческий смысл."} />
      </Section>

    </RichLesson>
  );
}

// 47. HTTP response: status, headers, body и Content-Type
export function Lesson47({ module }: { module?: string }) {
  return (
    <RichLesson>
      <RichHero
        chip={module ?? BLOCK_TITLE}
        title={"HTTP response: status, headers, body и Content-Type"}
        intro={"Теперь прочитаем ответ сервера: как статус кратко сообщает исход, headers описывают формат, body переносит данные или детали ошибки, а клиент отличает успех от неуспеха без анализа русской фразы."}
        tags={[
          { icon: <CheckCircle2 size={14} />, label: "структура response" },
          { icon: <FileText size={14} />, label: "status · headers · body" },
        ]}
      />
      <TheoryBridge lesson={47} />

      <Section number="01" title={"Ответ как результат обработки"}>
        <Lead>
          {"Ответ сервера похож на квитанцию после обращения. В ней есть краткий итог, служебные сведения и при необходимости подробности."}
        </Lead>

        <div className="lesson-practice-steps">
          <h3>Status</h3>
          <p>{"Короткий числовой код исхода."}</p>

          <h3>Headers</h3>
          <p>{"Служебное описание ответа."}</p>

          <h3>Body</h3>
          <p>{"Данные результата или детали ошибки."}</p>

        </div>

        <CodeBlock
          caption={"пример"}
          code={`HTTP/1.1 200 OK
Content-Type: application/json

[
  {"id": 1, "title": "HTTP"}
]`}
        />

        <MatchPairs
          prompt={"Соедините часть response и её роль."}
          leftTitle={"Часть"}
          rightTitle={"Роль"}
          pairs={[
            { left: "status", right: "краткий исход" },
            { left: "headers", right: "служебные сведения" },
            { left: "body", right: "данные или детали" },
            { left: "Content-Type", right: "формат body" },
          ]}
          explanation={"Каждая часть ответа имеет отдельную ответственность."}
        />

        <Callout tone="info">
          {"Клиент не должен определять успех только по тексту в body. Для этого существует status."}
        </Callout>
      </Section>

      <Section number="02" title={"Status — машинно читаемый исход"}>
        <Lead>
          {"Status code позволяет клиенту быстро понять класс результата. Он состоит из трёх цифр и стандартного смысла."}
        </Lead>

        <div className="lesson-practice-steps">
          <h3>2xx</h3>
          <p>{"Запрос успешно обработан."}</p>

          <h3>4xx</h3>
          <p>{"Проблема в запросе или доступном клиенту ресурсе."}</p>

          <h3>5xx</h3>
          <p>{"Сервер не смог выполнить корректный запрос из-за внутренней проблемы."}</p>

        </div>

        <CodeBlock
          caption={"группы"}
          code={`2xx — успех
4xx — проблема запроса клиента
5xx — проблема сервера`}
        />

        <CodeBlock
          caption={"не анализ текста"}
          code={`if response.status == 404:
    show_not_found()

# клиенту не нужно искать
# слова «не найдена» в body`}
        />

        <TrueFalse
          statement={<>{"Любой ответ с JSON body считается успешным."}</>}
          isTrue={false}
          explanation={"Ошибка тоже может иметь JSON body. Успех определяется status и контрактом."}
        />

        <Callout tone="info">
          {"Первая цифра даёт категорию, но конкретный код всё равно имеет отдельный смысл."}
        </Callout>
      </Section>

      <Section number="03" title={"200, 201 и 204"}>
        <Lead>
          {"Успешные операции могут завершаться разными кодами. Выбор сообщает клиенту, что именно произошло."}
        </Lead>

        <div className="lesson-practice-steps">
          <h3>200 OK</h3>
          <p>{"Операция успешна, body обычно содержит результат."}</p>

          <h3>201 Created</h3>
          <p>{"Успешно создан новый ресурс."}</p>

          <h3>204 No Content</h3>
          <p>{"Операция успешна, но body отсутствует."}</p>

        </div>

        <CodeBlock
          caption={"получение списка"}
          code={`GET /tasks
→ 200 OK
→ body: [ ... ]`}
        />

        <CodeBlock
          caption={"создание"}
          code={`POST /tasks
→ 201 Created
→ body: созданная задача`}
        />

        <CodeBlock
          caption={"удаление без body"}
          code={`DELETE /tasks/7
→ 204 No Content
→ body отсутствует`}
        />

        <CompareSolutions
          question={"Какой ответ точнее после создания Task?"}
          left={{
            title: "200 OK",
            code: "200 + новая задача",
            note: "Работает, но не сообщает факт создания так точно.",
          }}
          right={{
            title: "201 Created",
            code: "201 + новая задача",
            note: "Стандартный смысл соответствует созданию ресурса.",
          }}
          preferred={"right"}
          explanation={"201 точнее выражает успешное создание."}
        />

        <Callout tone="info">
          {"204 нельзя сопровождать обычным JSON body. Сам код уже сообщает, что содержимого нет."}
        </Callout>
      </Section>

      <Section number="04" title={"400, 404 и 422"}>
        <Lead>
          {"Коды 4xx описывают ситуации, которые клиент может понять и исправить. В учебном API особенно важны неверная структура данных, ошибка валидации и отсутствующий ресурс."}
        </Lead>

        <div className="lesson-practice-steps">
          <h3>400 Bad Request</h3>
          <p>{"Запрос в целом невозможно корректно обработать по договору."}</p>

          <h3>404 Not Found</h3>
          <p>{"Ресурс по указанному адресу или id не найден."}</p>

          <h3>422 Unprocessable Content</h3>
          <p>{"Форма запроса понятна, но значения не проходят проверку."}</p>

        </div>

        <CodeBlock
          caption={"не найдено"}
          code={`GET /tasks/999
→ 404 Not Found
{
  "detail": "Task 999 not found"
}`}
        />

        <CodeBlock
          caption={"ошибка поля"}
          code={`POST /tasks
body: {"title": "", "priority": 9}
→ 422 Unprocessable Content`}
        />

        <BranchExplorer
          code={`if task_exists:
    return task
else:
    raise not_found`}
          scenarios={[
            { label: "task exists", activeLine: 1, output: "200 + Task" },
            { label: "unknown id", activeLine: 3, output: "404 + detail" },
          ]}
        />

        <Callout tone="info">
          {"Конкретная граница 400 и 422 будет закреплена в FastAPI. Сейчас важнее не использовать 200 для ошибки."}
        </Callout>
      </Section>

      <Section number="05" title={"500 — непредвиденная проблема сервера"}>
        <Lead>
          {"Если корректный запрос приводит к необработанному дефекту, сервер обычно отвечает категорией 5xx. Клиент не обязан знать traceback и внутреннее устройство проекта."}
        </Lead>

        <div className="lesson-practice-steps">
          <h3>Не ошибка пользователя</h3>
          <p>{"Повторная отправка тех же данных может не исправить проблему."}</p>

          <h3>Не раскрывать детали</h3>
          <p>{"Traceback, пути к файлам и секреты не возвращаются клиенту."}</p>

          <h3>Диагностика сервера</h3>
          <p>{"Разработчик изучает лог и исправляет дефект."}</p>

        </div>

        <CodeBlock
          caption={"внешний ответ"}
          code={`500 Internal Server Error
{
  "detail": "Internal server error"
}`}
        />

        <CodeBlock
          caption={"внутри сервера"}
          code={`traceback
тип исключения
файл и строка
контекст для разработчика`}
        />

        <RecallCard
          question={"Почему клиенту не отправляют полный traceback?"}
          answer={<p>{"Traceback предназначен разработчику, может раскрыть внутренние пути и не является стабильным контрактом API."}</p>}
        />

        <Callout tone="info">
          {"Не превращайте все исключения в 500 вручную. Ожидаемые ситуации получают конкретные 4xx."}
        </Callout>
      </Section>

      <Section number="06" title={"Headers ответа и Content-Type"}>
        <Lead>
          {"Как и в request, response headers описывают сообщение. Content-Type сообщает клиенту, как интерпретировать body."}
        </Lead>

        <div className="lesson-practice-steps">
          <h3>application/json</h3>
          <p>{"Body нужно разобрать как JSON."}</p>

          <h3>text/plain</h3>
          <p>{"Body является обычным текстом."}</p>

          <h3>Нет body</h3>
          <p>{"Для 204 Content-Type тела не играет обычной роли."}</p>

        </div>

        <CodeBlock
          caption={"JSON response"}
          code={`Content-Type: application/json

{"id": 1, "title": "HTTP"}`}
        />

        <CodeBlock
          caption={"текстовый response"}
          code={`Content-Type: text/plain; charset=utf-8

Server is running`}
        />

        <BugHunt
          code={`HTTP/1.1 200 OK
Content-Type: text/plain

{"id": 1, "title": "HTTP"}`}
          question={"Что в ответе противоречит body?"}
          options={[
            "Content-Type сообщает text/plain, хотя body задуман как JSON",
            "Status 200 запрещает объекты",
            "JSON не может содержать id",
          ]}
          correctIndex={0}
          explanation={"Для JSON нужен application/json."}
          fix={"HTTP/1.1 200 OK\nContent-Type: application/json\n\n{\"id\": 1, \"title\": \"HTTP\"}"}
        />

        <Callout tone="info">
          {"Расширение URL не определяет формат ответа. Клиент ориентируется на Content-Type и договор API."}
        </Callout>
      </Section>

      <Section number="07" title={"Body успеха и body ошибки"}>
        <Lead>
          {"Форма body зависит от исхода. Успех возвращает ресурс или коллекцию, ошибка — стабильное описание проблемы. Клиенту полезно получать одинаковую форму ошибок."}
        </Lead>

        <div className="lesson-practice-steps">
          <h3>Ресурс</h3>
          <p>{"Одна Task представлена JSON-объектом."}</p>

          <h3>Коллекция</h3>
          <p>{"Список задач представлен JSON-массивом."}</p>

          <h3>Ошибка</h3>
          <p>{"Минимально содержит поле detail."}</p>

        </div>

        <CodeBlock
          caption={"одна задача"}
          code={`{
  "id": 7,
  "title": "HTTP response",
  "priority": 4,
  "is_done": false
}`}
        />

        <CodeBlock
          caption={"ошибка"}
          code={`{
  "detail": "Task 7 not found"
}`}
        />

        <CompareSolutions
          question={"Какой body полезнее после POST /tasks?"}
          left={{
            title: "Только сообщение",
            code: "{\"message\": \"created\"}",
            note: "Клиент не получает id и поля ресурса.",
          }}
          right={{
            title: "Созданный ресурс",
            code: "{\"id\": 7, \"title\": \"HTTP\", \"priority\": 4}",
            note: "Клиент сразу знает серверное представление.",
          }}
          preferred={"right"}
          explanation={"Созданный ресурс даёт клиенту результат, включая назначенный сервером id."}
        />

        <Callout tone="info">
          {"Не возвращайте строку «всё хорошо» вместо данных, если клиенту затем нужен созданный id."}
        </Callout>
      </Section>

      <Section number="08" title={"Читаем request и response парой"}>
        <Lead>
          {"Один response всегда относится к конкретному request. Полезно записывать контракт парами: вход клиента и ожидаемый результат сервера."}
        </Lead>

        <div className="lesson-practice-steps">
          <h3>Request</h3>
          <p>{"Метод, путь, headers и возможный body."}</p>

          <h3>Response</h3>
          <p>{"Status, headers и возможный body."}</p>

          <h3>Ошибочный сценарий</h3>
          <p>{"Тот же endpoint имеет отдельный ожидаемый ответ."}</p>

        </div>

        <CodeBlock
          caption={"успешная пара"}
          code={`REQUEST
POST /tasks
{"title": "HTTP", "priority": 4}

RESPONSE
201 Created
{"id": 7, "title": "HTTP", "priority": 4}`}
        />

        <CodeBlock
          caption={"ошибочная пара"}
          code={`REQUEST
GET /tasks/999

RESPONSE
404 Not Found
{"detail": "Task 999 not found"}`}
        />

        <Callout tone="info">
          {"В следующих занятиях методы, пути и источники параметров будут собраны в полный контракт."}
        </Callout>

        <div className="lesson-check-group">
          <QuizCard
            question={"Что сообщает status?"}
            options={[
              "исход обработки",
              "адрес клиента",
              "тело запроса",
            ]}
            correctIndex={0}
            explanation={"Status является кратким результатом."}
          />
          <QuizCard
            question={"Какой код подходит созданию?"}
            options={[
              "201",
              "404",
              "500",
            ]}
            correctIndex={0}
            explanation={"201 означает Created."}
          />
          <QuizCard
            question={"Что означает 404?"}
            options={[
              "ресурс не найден",
              "ресурс создан",
              "body отсутствует",
            ]}
            correctIndex={0}
            explanation={"Это клиентская ситуация отсутствия."}
          />
          <QuizCard
            question={"Что сообщает response Content-Type?"}
            options={[
              "формат body",
              "номер Task",
              "метод запроса",
            ]}
            correctIndex={0}
            explanation={"Клиент выбирает способ разбора."}
          />
        </div>

        <KeyTakeaways
          points={[
            <>{"HTTP response состоит из status, headers и возможного body."}</>,
            <>{"2xx сообщает об успехе."}</>,
            <>{"4xx описывает понятную клиенту проблему."}</>,
            <>{"5xx сообщает о внутреннем сбое сервера."}</>,
            <>{"200 подходит обычному успешному ответу."}</>,
            <>{"201 точнее выражает создание."}</>,
            <>{"204 означает успех без body."}</>,
            <>{"Content-Type сообщает формат ответа."}</>,
          ]}
        />

        <PracticeCta text={"Для шести сценариев Planner API выберите status и body: список, одна задача, создание, удаление, неизвестный id и невалидный priority."} />
      </Section>

    </RichLesson>
  );
}

// 48. Методы GET, POST, PUT, PATCH, DELETE
export function Lesson48({ module }: { module?: string }) {
  return (
    <RichLesson>
      <RichHero
        chip={module ?? BLOCK_TITLE}
        title={"Методы GET, POST, PUT, PATCH, DELETE"}
        intro={"Свяжем знакомые CRUD-действия с HTTP-методами. Для каждого метода разберём смысл, адрес, данные запроса, ожидаемый ответ и опасную путаницу, не переходя пока к коду FastAPI."}
        tags={[
          { icon: <GitBranch size={14} />, label: "CRUD → HTTP methods" },
          { icon: <Wrench size={14} />, label: "GET · POST · PUT · PATCH · DELETE" },
        ]}
      />
      <TheoryBridge lesson={48} />

      <Section number="01" title={"Метод — глагол сетевого договора"}>
        <Lead>
          {"Путь называет ресурс, а метод выражает действие над ним. Вместе они образуют понятную операцию."}
        </Lead>

        <div className="lesson-practice-steps">
          <h3>Ресурс</h3>
          <p>{"/tasks или /tasks/7."}</p>

          <h3>Действие</h3>
          <p>{"GET, POST, PUT, PATCH или DELETE."}</p>

          <h3>Контракт</h3>
          <p>{"Клиент заранее знает ожидаемый смысл комбинации."}</p>

        </div>

        <CodeBlock
          caption={"CRUD и методы"}
          code={`Create → POST
Read   → GET
Update → PUT или PATCH
Delete → DELETE`}
        />

        <CodeBlock
          caption={"комбинации"}
          code={`GET    /tasks
POST   /tasks
GET    /tasks/7
PATCH  /tasks/7
DELETE /tasks/7`}
        />

        <MatchPairs
          prompt={"Соедините CRUD и HTTP."}
          leftTitle={"CRUD"}
          rightTitle={"Метод"}
          pairs={[
            { left: "Create", right: "POST" },
            { left: "Read", right: "GET" },
            { left: "Update", right: "PUT или PATCH" },
            { left: "Delete", right: "DELETE" },
          ]}
          explanation={"CRUD описывает предметное действие, HTTP задаёт сетевую форму."}
        />

        <Callout tone="info">
          {"Не добавляйте действие в путь, если стандартный method уже выражает его."}
        </Callout>
      </Section>

      <Section number="02" title={"GET — получить без изменения"}>
        <Lead>
          {"GET используется для чтения ресурса или коллекции. Повторный GET не должен неожиданно отмечать задачу выполненной или удалять данные."}
        </Lead>

        <div className="lesson-practice-steps">
          <h3>Коллекция</h3>
          <p>{"GET /tasks возвращает список."}</p>

          <h3>Один ресурс</h3>
          <p>{"GET /tasks/7 возвращает Task или 404."}</p>

          <h3>Без предметного body</h3>
          <p>{"Основные параметры чтения позже передаются через path или query."}</p>

        </div>

        <CodeBlock
          caption={"получение списка"}
          code={`GET /tasks
→ 200
→ [ ... ]`}
        />

        <CodeBlock
          caption={"получение одной задачи"}
          code={`GET /tasks/7
→ 200 + Task
или
→ 404 + detail`}
        />

        <BugHunt
          code={`GET /tasks/7/mark-done`}
          question={"Что концептуально плохо в таком GET?"}
          options={[
            "Запрос чтения изменяет состояние задачи",
            "GET нельзя использовать с id",
            "Путь не может содержать дефис",
          ]}
          correctIndex={0}
          explanation={"Изменение статуса должно использовать PATCH или другой явный update-контракт."}
          fix={"PATCH /tasks/7\nContent-Type: application/json\n\n{\"is_done\": true}"}
        />

        <Callout tone="info">
          {"GET можно безопасно повторить с тем же смыслом: он читает текущее состояние, а не выполняет скрытую команду изменения."}
        </Callout>
      </Section>

      <Section number="03" title={"POST — создать новый ресурс"}>
        <Lead>
          {"POST к коллекции передаёт данные новой задачи. Сервер проверяет их, назначает id и возвращает созданный ресурс."}
        </Lead>

        <div className="lesson-practice-steps">
          <h3>Адрес коллекции</h3>
          <p>{"Создание направляется на /tasks, потому что id ещё нет."}</p>

          <h3>Body</h3>
          <p>{"Клиент передаёт поля, которыми управляет."}</p>

          <h3>Ответ</h3>
          <p>{"Обычно 201 и созданный Task."}</p>

        </div>

        <CodeBlock
          caption={"request"}
          code={`POST /tasks
Content-Type: application/json

{
  "title": "HTTP methods",
  "priority": 4
}`}
        />

        <CodeBlock
          caption={"response"}
          code={`201 Created

{
  "id": 8,
  "title": "HTTP methods",
  "priority": 4,
  "is_done": false
}`}
        />

        <RecallCard
          question={"Почему POST отправляется на /tasks, а не /tasks/8?"}
          answer={<p>{"До создания клиент ещё не знает серверный id. Он обращается к коллекции, а сервер создаёт элемент и назначает идентификатор."}</p>}
        />

        <Callout tone="info">
          {"Клиент обычно не назначает id самостоятельно. Сервер отвечает за уникальность идентификатора."}
        </Callout>
      </Section>

      <Section number="04" title={"PUT — заменить представление целиком"}>
        <Lead>
          {"PUT удобно мыслить как замену всей редактируемой карточки. Клиент передаёт полный набор полей, требуемых контрактом обновления."}
        </Lead>

        <div className="lesson-practice-steps">
          <h3>Полная форма</h3>
          <p>{"Пропущенное поле может получить default или считаться удалённым по договору."}</p>

          <h3>Известный ресурс</h3>
          <p>{"Адрес обычно содержит id."}</p>

          <h3>Одинаковый повтор</h3>
          <p>{"Повтор того же полного PUT приводит к тому же состоянию."}</p>

        </div>

        <CodeBlock
          caption={"полное обновление"}
          code={`PUT /tasks/7
Content-Type: application/json

{
  "title": "Изучить REST",
  "priority": 5,
  "is_done": true,
  "tags": ["backend", "http"]
}`}
        />

        <CodeBlock
          caption={"мысленная модель"}
          code={`старая карточка
→ полностью заменить новой карточкой`}
        />

        <CompareSolutions
          question={"Какой body похож на PUT?"}
          left={{
            title: "Одно поле",
            code: "{\"priority\": 5}",
            note: "Это больше похоже на частичное изменение.",
          }}
          right={{
            title: "Полная редактируемая форма",
            code: "{\"title\": \"REST\", \"priority\": 5, \"is_done\": true, \"tags\": []}",
            note: "Передано полное новое представление.",
          }}
          preferred={"right"}
          explanation={"PUT выражает полную замену согласно контракту."}
        />

        <Callout tone="info">
          {"Для первого API не нужно реализовывать PUT и PATCH одновременно любой ценой. Но различие их смысла нужно понимать."}
        </Callout>
      </Section>

      <Section number="05" title={"PATCH — изменить часть ресурса"}>
        <Lead>
          {"PATCH передаёт только поля, которые клиент хочет изменить. Остальные значения задачи сохраняются."}
        </Lead>

        <div className="lesson-practice-steps">
          <h3>Частичный body</h3>
          <p>{"Можно передать только is_done."}</p>

          <h3>Проверка полей</h3>
          <p>{"Переданные значения всё равно проходят валидацию."}</p>

          <h3>Не отдельный endpoint на каждое поле</h3>
          <p>{"Один update-маршрут может менять разрешённые части."}</p>

        </div>

        <CodeBlock
          caption={"изменить статус"}
          code={`PATCH /tasks/7
Content-Type: application/json

{
  "is_done": true
}`}
        />

        <CodeBlock
          caption={"изменить приоритет"}
          code={`PATCH /tasks/7
Content-Type: application/json

{
  "priority": 5
}`}
        />

        <TrueFalse
          statement={<>{"PATCH обязан содержать все поля Task."}</>}
          isTrue={false}
          explanation={"PATCH предназначен для частичного изменения и передаёт только изменяемые поля."}
        />

        <Callout tone="info">
          {"PATCH не означает «принять любые поля». Контракт явно перечисляет, что разрешено изменять."}
        </Callout>
      </Section>

      <Section number="06" title={"DELETE — удалить ресурс"}>
        <Lead>
          {"DELETE обращается к конкретному ресурсу по id. Успех может вернуть 204 без body или 200 с понятным представлением удалённого объекта по выбранному договору."}
        </Lead>

        <div className="lesson-practice-steps">
          <h3>Адрес элемента</h3>
          <p>{"/tasks/7."}</p>

          <h3>Неизвестный id</h3>
          <p>{"Возвращается 404."}</p>

          <h3>Повтор после удаления</h3>
          <p>{"Ресурс уже отсутствует, поэтому следующий результат может быть 404."}</p>

        </div>

        <CodeBlock
          caption={"удаление"}
          code={`DELETE /tasks/7
→ 204 No Content`}
        />

        <CodeBlock
          caption={"неизвестный ресурс"}
          code={`DELETE /tasks/999
→ 404 Not Found
{"detail": "Task 999 not found"}`}
        />

        <FillBlank
          prompt={"Выберите метод для удаления Task 7."}
          before={""}
          after={" /tasks/7"}
          options={[
            "DELETE",
            "GET",
            "POST",
          ]}
          answer={"DELETE"}
          explanation={"Метод DELETE выражает удаление конкретного ресурса."}
        />

        <Callout tone="info">
          {"DELETE не требует body для базового удаления по id: идентификатор уже находится в path."}
        </Callout>
      </Section>

      <Section number="07" title={"Повтор запроса и предсказуемость"}>
        <Lead>
          {"Клиент может повторить запрос из-за сетевой задержки. Полезно понимать, изменит ли повтор состояние ещё раз."}
        </Lead>

        <div className="lesson-practice-steps">
          <h3>GET</h3>
          <p>{"Повтор остаётся чтением."}</p>

          <h3>PUT</h3>
          <p>{"Повтор полной замены теми же данными оставляет то же состояние."}</p>

          <h3>DELETE</h3>
          <p>{"После первого удаления ресурс отсутствует."}</p>

          <h3>POST</h3>
          <p>{"Повтор может создать вторую задачу, если нет дополнительной защиты."}</p>

        </div>

        <CodeBlock
          caption={"два POST"}
          code={`POST /tasks {"title": "SQL"}
POST /tasks {"title": "SQL"}

# могут появиться две разные задачи`}
        />

        <CodeBlock
          caption={"два PUT"}
          code={`PUT /tasks/7 {полная форма}
PUT /tasks/7 {та же полная форма}

# состояние остаётся тем же`}
        />

        <CodeSequence
          title={"CRUD одной задачи"}
          prompt={"Соберите логичную последовательность."}
          pieces={[
            { id: "create", code: "POST /tasks" },
            { id: "read", code: "GET /tasks/7" },
            { id: "update", code: "PATCH /tasks/7" },
            { id: "delete", code: "DELETE /tasks/7" },
            { id: "missing", code: "GET /tasks/7 → 404" },
          ]}
          correctOrder={[
            "create",
            "read",
            "update",
            "delete",
            "missing",
          ]}
          explanation={"После удаления повторное чтение больше не находит ресурс."}
        />

        <Callout tone="info">
          {"Термин idempotency полезен, но на текущем уровне важнее уметь предсказать результат повтора обычными словами."}
        </Callout>
      </Section>

      <Section number="08" title={"Проектируем CRUD Planner API"}>
        <Lead>
          {"Сведём методы к одной небольшой таблице контрактов. Это ещё не FastAPI-код, а проектирование поведения до реализации."}
        </Lead>

        <div className="lesson-practice-steps">
          <h3>Коллекция</h3>
          <p>{"GET и POST работают с /tasks."}</p>

          <h3>Элемент</h3>
          <p>{"GET, PUT, PATCH и DELETE работают с /tasks/{task_id}."}</p>

          <h3>Ошибки</h3>
          <p>{"Неизвестный id даёт 404, невалидные данные — 422."}</p>

        </div>

        <CodeBlock
          caption={"карта endpoints"}
          code={`GET    /tasks
POST   /tasks
GET    /tasks/{task_id}
PUT    /tasks/{task_id}
PATCH  /tasks/{task_id}
DELETE /tasks/{task_id}`}
        />

        <CodeBlock
          caption={"контрольные вопросы"}
          code={`что читает запрос?
что изменяет?
где находится id?
нужен ли body?
какой status при успехе?
что вернуть при неизвестном id?`}
        />

        <Callout tone="info">
          {"На практике первый Planner API может начать с GET, POST, PATCH и DELETE. PUT допустимо оставить учебным контрактом, если полная замена пока не нужна."}
        </Callout>

        <div className="lesson-check-group">
          <QuizCard
            question={"Какой метод читает данные?"}
            options={[
              "GET",
              "POST",
              "DELETE",
            ]}
            correctIndex={0}
            explanation={"GET выражает чтение."}
          />
          <QuizCard
            question={"Какой метод создаёт Task?"}
            options={[
              "POST",
              "PATCH",
              "GET",
            ]}
            correctIndex={0}
            explanation={"POST к коллекции создаёт ресурс."}
          />
          <QuizCard
            question={"Чем PATCH отличается от PUT?"}
            options={[
              "PATCH меняет часть, PUT заменяет полную форму",
              "PATCH только читает",
              "разницы нет",
            ]}
            correctIndex={0}
            explanation={"Смысл update различается."}
          />
          <QuizCard
            question={"Какой метод удаляет?"}
            options={[
              "DELETE",
              "GET",
              "POST",
            ]}
            correctIndex={0}
            explanation={"DELETE обращается к конкретному ресурсу."}
          />
        </div>

        <KeyTakeaways
          points={[
            <>{"Метод выражает действие над ресурсом."}</>,
            <>{"GET читает и не должен менять состояние."}</>,
            <>{"POST создаёт ресурс в коллекции."}</>,
            <>{"PUT выражает полную замену."}</>,
            <>{"PATCH выражает частичное изменение."}</>,
            <>{"DELETE удаляет конкретный ресурс."}</>,
            <>{"Path элемента содержит id."}</>,
            <>{"Повтор POST может создать дубликат."}</>,
          ]}
        />

        <PracticeCta text={"Для десяти действий StudyHub выберите method, path, body и успешный status. Отдельно объясните три различия между PUT и PATCH."} />
      </Section>

    </RichLesson>
  );
}

// 49. REST: ресурс, endpoint и URL
export function Lesson49({ module }: { module?: string }) {
  return (
    <RichLesson>
      <RichHero
        chip={module ?? BLOCK_TITLE}
        title={"REST: ресурс, endpoint и URL"}
        intro={"Соберём HTTP-части в REST-договорённость: научимся видеть в API ресурсы, давать путям имена существительных, различать collection и item, а также понимать разницу между URL, path и endpoint."}
        tags={[
          { icon: <Layers size={14} />, label: "ресурс и представление" },
          { icon: <Puzzle size={14} />, label: "URL · path · endpoint" },
        ]}
      />
      <TheoryBridge lesson={49} />

      <Section number="01" title={"REST как договорённость, а не магия"}>
        <Lead>
          {"REST помогает разным клиентам предсказать форму API. Если путь называет ресурс, а method выражает действие, интерфейс читается без знания внутреннего кода."}
        </Lead>

        <div className="lesson-practice-steps">
          <h3>Не фреймворк</h3>
          <p>{"REST не устанавливается через pip."}</p>

          <h3>Не единственный стиль</h3>
          <p>{"Но он удобен для учебного CRUD API."}</p>

          <h3>Предсказуемость</h3>
          <p>{"Одинаковые правила применяются ко всем ресурсам."}</p>

        </div>

        <CodeBlock
          caption={"читаемая форма"}
          code={`GET    /tasks
POST   /tasks
GET    /tasks/7
PATCH  /tasks/7
DELETE /tasks/7`}
        />

        <CodeBlock
          caption={"непоследовательная форма"}
          code={`/getTasks
/createNewTask
/taskDeleteById
/changeTaskStatus`}
        />

        <CompareSolutions
          question={"Какой набор легче предсказать?"}
          left={{
            title: "Глаголы в пути",
            code: "/getTasks, /createTask, /deleteTask",
            note: "Каждое действие получает новое имя.",
          }}
          right={{
            title: "Ресурс + method",
            code: "GET /tasks, POST /tasks, DELETE /tasks/7",
            note: "Метод выражает действие, путь остаётся ресурсом.",
          }}
          preferred={"right"}
          explanation={"REST уменьшает количество случайных названий."}
        />

        <Callout tone="info">
          {"Главная цель REST на этом этапе — согласованный интерфейс, а не идеологическая чистота."}
        </Callout>
      </Section>

      <Section number="02" title={"Ресурс — сущность предметной области"}>
        <Lead>
          {"Ресурсом Planner API является учебная задача. Клиент работает не с Python-классом напрямую, а с сетевым представлением этой задачи."}
        </Lead>

        <div className="lesson-practice-steps">
          <h3>Предметный смысл</h3>
          <p>{"Task существует как понятие StudyHub."}</p>

          <h3>Внутри сервера</h3>
          <p>{"Может быть dataclass, словарь или позже ORM-модель."}</p>

          <h3>Снаружи</h3>
          <p>{"Клиент получает JSON-представление."}</p>

        </div>

        <CodeBlock
          caption={"внутренний объект"}
          code={`Task(
    id=7,
    title="REST",
    priority=4,
)`}
        />

        <CodeBlock
          caption={"представление ресурса"}
          code={`{
  "id": 7,
  "title": "REST",
  "priority": 4,
  "is_done": false
}`}
        />

        <TrueFalse
          statement={<>{"Ресурс API обязан быть тем же объектом Python, который хранится в памяти сервера."}</>}
          isTrue={false}
          explanation={"Клиент получает представление ресурса, обычно JSON, а не ссылку на Python-объект."}
        />

        <Callout tone="info">
          {"REST не требует раскрывать все внутренние поля объекта. API возвращает только согласованное представление."}
        </Callout>
      </Section>

      <Section number="03" title={"Collection и item"}>
        <Lead>
          {"Коллекция адресует множество ресурсов, а item — один конкретный ресурс. Это различие определяет форму path и допустимые методы."}
        </Lead>

        <div className="lesson-practice-steps">
          <h3>Collection</h3>
          <p>{"/tasks — набор задач."}</p>

          <h3>Item</h3>
          <p>{"/tasks/7 — одна задача."}</p>

          <h3>Идентификатор</h3>
          <p>{"Сегмент 7 выбирает элемент внутри коллекции."}</p>

        </div>

        <CodeBlock
          caption={"collection"}
          code={`GET  /tasks
POST /tasks`}
        />

        <CodeBlock
          caption={"item"}
          code={`GET    /tasks/7
PUT    /tasks/7
PATCH  /tasks/7
DELETE /tasks/7`}
        />

        <MatchPairs
          prompt={"Соедините path и смысл."}
          leftTitle={"Path"}
          rightTitle={"Смысл"}
          pairs={[
            { left: "/tasks", right: "коллекция" },
            { left: "/tasks/7", right: "один ресурс" },
            { left: "7", right: "идентификатор" },
            { left: "tasks", right: "имя типа ресурса" },
          ]}
          explanation={"Сегменты пути образуют иерархию от коллекции к элементу."}
        />

        <Callout tone="info">
          {"Не используйте /task для списка и /tasksItem для элемента. Одна базовая форма /tasks сохраняет последовательность."}
        </Callout>
      </Section>

      <Section number="04" title={"Имена путей: существительные и множественное число"}>
        <Lead>
          {"Путь лучше называть тем, чем является ресурс. Действие уже выражает method. Для коллекции обычно выбирается множественное число."}
        </Lead>

        <div className="lesson-practice-steps">
          <h3>Существительное</h3>
          <p>{"tasks, а не getTasks."}</p>

          <h3>Один стиль</h3>
          <p>{"Все коллекции называют по одному правилу."}</p>

          <h3>Нижний регистр</h3>
          <p>{"Простые английские слова без пробелов."}</p>

        </div>

        <CodeBlock
          caption={"последовательно"}
          code={`/tasks
/categories
/courses
/lessons`}
        />

        <CodeBlock
          caption={"непоследовательно"}
          code={`/getTasks
/category_list
/CourseItems
/delete-lesson`}
        />

        <BugHunt
          code={`POST /create-task
GET /get-all-tasks
DELETE /delete-task/7`}
          question={"Что повторяется в path без необходимости?"}
          options={[
            "Глаголы действий, которые уже выражают HTTP methods",
            "Идентификатор задачи",
            "Символ /",
          ]}
          correctIndex={0}
          explanation={"Путь лучше оставить ресурсом."}
          fix={"POST   /tasks\nGET    /tasks\nDELETE /tasks/7"}
        />

        <Callout tone="info">
          {"Не нужно переводить каждое внутреннее имя Python в URL буквально. Сначала выбирается публичный язык API."}
        </Callout>
      </Section>

      <Section number="05" title={"URL, path и endpoint — разные термины"}>
        <Lead>
          {"URL — полный адрес. Path — часть после host и port. Endpoint в учебном курсе удобно понимать как конкретную пару method + path."}
        </Lead>

        <div className="lesson-practice-steps">
          <h3>URL</h3>
          <p>{"http://localhost:8000/tasks/7."}</p>

          <h3>Path</h3>
          <p>{"/tasks/7."}</p>

          <h3>Endpoint</h3>
          <p>{"GET /tasks/7."}</p>

          <h3>Один path, разные endpoints</h3>
          <p>{"GET и DELETE имеют разный контракт."}</p>

        </div>

        <CodeBlock
          caption={"термины"}
          code={`URL:
http://localhost:8000/tasks/7

path:
/tasks/7

endpoint:
GET /tasks/7`}
        />

        <CodeBlock
          caption={"два endpoints"}
          code={`GET    /tasks/7
DELETE /tasks/7`}
        />

        <FillBlank
          prompt={"Дополните endpoint чтения Task 7."}
          before={""}
          after={" /tasks/7"}
          options={[
            "GET",
            "POST",
            "Content-Type",
          ]}
          answer={"GET"}
          explanation={"Endpoint объединяет метод и path."}
        />

        <Callout tone="info">
          {"В разговоре endpoint иногда называют и адресом обработчика, но в курсе фиксируем точную пару method + path."}
        </Callout>
      </Section>

      <Section number="06" title={"Представление ресурса и стабильные поля"}>
        <Lead>
          {"Клиент строит интерфейс по ответам API. Поэтому имена полей и их смысл должны быть последовательными между endpoint."}
        </Lead>

        <div className="lesson-practice-steps">
          <h3>Одинаковый id</h3>
          <p>{"Task в списке и Task по id используют одно поле id."}</p>

          <h3>Одинаковый статус</h3>
          <p>{"Не смешивать done, completed и is_done без причины."}</p>

          <h3>Не внутренние детали</h3>
          <p>{"Путь к JSON-файлу не является полем ресурса."}</p>

        </div>

        <CodeBlock
          caption={"стабильное представление"}
          code={`{
  "id": 7,
  "title": "REST",
  "priority": 4,
  "is_done": false
}`}
        />

        <CodeBlock
          caption={"нестабильные варианты"}
          code={`list: {"task_id": 7, "done": false}
item: {"id": 7, "is_done": false}`}
        />

        <RecallCard
          question={"Почему поля ответа должны быть одинаковыми в списке и детальном endpoint?"}
          answer={<p>{"Клиенту не приходится писать две разные модели одной Task и угадывать, какие имена используются в каждом ответе."}</p>}
        />

        <Callout tone="info">
          {"API-контракт меняется дороже внутренней переменной: разные клиенты могут зависеть от публичного имени поля."}
        </Callout>
      </Section>

      <Section number="07" title={"Связанные ресурсы без преждевременной вложенности"}>
        <Lead>
          {"StudyHub позже получит категории и курсы. REST позволяет отражать связь в path, но глубокие цепочки не нужно вводить раньше реальной необходимости."}
        </Lead>

        <div className="lesson-practice-steps">
          <h3>Простой ресурс</h3>
          <p>{"/categories и /tasks."}</p>

          <h3>Фильтрация связи</h3>
          <p>{"/tasks?category_id=3 может быть проще."}</p>

          <h3>Небольшая вложенность</h3>
          <p>{"/categories/3/tasks читается как задачи категории."}</p>

        </div>

        <CodeBlock
          caption={"два допустимых взгляда"}
          code={`GET /tasks?category_id=3

GET /categories/3/tasks`}
        />

        <CodeBlock
          caption={"слишком глубокий путь"}
          code={`/users/4/courses/8/modules/3/lessons/2/tasks/7`}
        />

        <CompareSolutions
          question={"Что выбрать в первом API для фильтра по статусу?"}
          left={{
            title: "Новый глагольный путь",
            code: "/get-open-tasks",
            note: "Для каждого фильтра появится отдельный endpoint.",
          }}
          right={{
            title: "Query к коллекции",
            code: "/tasks?is_done=false",
            note: "Коллекция остаётся одной, меняется условие отбора.",
          }}
          preferred={"right"}
          explanation={"Фильтр не создаёт новый тип ресурса."}
        />

        <Callout tone="info">
          {"Для первого Planner API достаточно плоского /tasks и query-фильтров. Сложные связи появятся вместе с реальной моделью данных."}
        </Callout>
      </Section>

      <Section number="08" title={"Карта REST для Planner API"}>
        <Lead>
          {"Составим публичную карту до FastAPI-кода. Для каждого endpoint определим ресурс, method, path и короткий смысл."}
        </Lead>

        <div className="lesson-practice-steps">
          <h3>Чтение коллекции</h3>
          <p>{"GET /tasks."}</p>

          <h3>Создание</h3>
          <p>{"POST /tasks."}</p>

          <h3>Работа с item</h3>
          <p>{"GET, PATCH и DELETE /tasks/{task_id}."}</p>

          <h3>Фильтрация</h3>
          <p>{"Query остаётся частью обращения к коллекции."}</p>

        </div>

        <CodeBlock
          caption={"минимальная карта"}
          code={`GET    /tasks
POST   /tasks
GET    /tasks/{task_id}
PATCH  /tasks/{task_id}
DELETE /tasks/{task_id}`}
        />

        <CodeBlock
          caption={"проверка именования"}
          code={`path называет ресурс?
method выражает действие?
collection и item согласованы?
поля ответа стабильны?
ошибка 404 имеет один смысл?`}
        />

        <Callout tone="info">
          {"Эта карта станет основой декораторов FastAPI в следующем блоке. Пока никакого серверного кода не требуется."}
        </Callout>

        <div className="lesson-check-group">
          <QuizCard
            question={"Что такое ресурс?"}
            options={[
              "сущность предметной области",
              "только Python-функция",
              "номер порта",
            ]}
            correctIndex={0}
            explanation={"Task является ресурсом Planner API."}
          />
          <QuizCard
            question={"Что обозначает /tasks?"}
            options={[
              "коллекцию",
              "одну задачу 7",
              "метод POST",
            ]}
            correctIndex={0}
            explanation={"Множественное число адресует набор."}
          />
          <QuizCard
            question={"Что такое endpoint в курсе?"}
            options={[
              "method + path",
              "только домен",
              "body ответа",
            ]}
            correctIndex={0}
            explanation={"Пара определяет конкретную операцию."}
          />
          <QuizCard
            question={"Как лучше назвать путь создания?"}
            options={[
              "POST /tasks",
              "POST /create-task",
              "GET /new-task",
            ]}
            correctIndex={0}
            explanation={"Метод выражает действие."}
          />
        </div>

        <KeyTakeaways
          points={[
            <>{"REST является договорённостью о понятном API."}</>,
            <>{"Ресурс имеет предметный смысл."}</>,
            <>{"Клиент получает представление ресурса, а не Python-объект."}</>,
            <>{"Collection и item имеют связанные пути."}</>,
            <>{"Path обычно называет ресурс существительным."}</>,
            <>{"URL является полным адресом."}</>,
            <>{"Endpoint объединяет method и path."}</>,
            <>{"Первый Planner API остаётся плоским и последовательным."}</>,
          ]}
        />

        <PracticeCta text={"Спроектируйте REST-карту задач и категорий. Для каждого endpoint укажите method, path, ресурс, успешный status и ответ при неизвестном id."} />
      </Section>

    </RichLesson>
  );
}

// 50. Path, query, body и контракт API
export function Lesson50({ module }: { module?: string }) {
  return (
    <RichLesson>
      <RichHero
        chip={module ?? BLOCK_TITLE}
        title={"Path, query, body и контракт API"}
        intro={"Завершим первый HTTP-блок проектированием контракта до кода: решим, какие данные входят в path, какие управляют выборкой через query, какие передаются в body и какие ответы обещает каждый endpoint."}
        tags={[
          { icon: <KeyRound size={14} />, label: "источник параметра" },
          { icon: <ListChecks size={14} />, label: "контракт до FastAPI" },
        ]}
      />
      <TheoryBridge lesson={50} />

      <Section number="01" title={"Контракт раньше кода"}>
        <Lead>
          {"До создания FastAPI-декоратора полезно записать endpoint обычной таблицей. Это отделяет проектирование поведения от синтаксиса фреймворка."}
        </Lead>

        <div className="lesson-practice-steps">
          <h3>Вход</h3>
          <p>{"Method, path, query, headers и body."}</p>

          <h3>Успех</h3>
          <p>{"Status и форма response body."}</p>

          <h3>Ошибки</h3>
          <p>{"Ожидаемые 4xx и их смысл."}</p>

          <h3>Пример</h3>
          <p>{"Один конкретный request и response."}</p>

        </div>

        <CodeBlock
          caption={"паспорт endpoint"}
          code={`Название: получить Task
Method: GET
Path: /tasks/{task_id}
Path parameter: task_id: int
Success: 200 + Task
Not found: 404 + detail`}
        />

        <CodeBlock
          caption={"зачем"}
          code={`сначала договор
потом FastAPI-код
потом тесты`}
        />

        <CodeSequence
          title={"Порядок разработки endpoint"}
          prompt={"Расположите этапы."}
          pieces={[
            { id: "scenario", code: "описать пользовательский сценарий" },
            { id: "contract", code: "записать method, path, вход и ответы" },
            { id: "implement", code: "реализовать route" },
            { id: "manual", code: "проверить вручную" },
            { id: "test", code: "добавить автоматический тест" },
          ]}
          correctOrder={[
            "scenario",
            "contract",
            "implement",
            "manual",
            "test",
          ]}
          explanation={"Контракт и сценарий появляются раньше реализации."}
        />

        <Callout tone="info">
          {"Если контракт невозможно объяснить без кода, реализация почти наверняка будет случайной."}
        </Callout>
      </Section>

      <Section number="02" title={"Path parameter выбирает конкретный ресурс"}>
        <Lead>
          {"Path parameter является переменной частью пути. Он нужен, когда без значения невозможно понять, к какому ресурсу обращается клиент."}
        </Lead>

        <div className="lesson-practice-steps">
          <h3>Идентичность</h3>
          <p>{"task_id выбирает одну Task."}</p>

          <h3>Обязательность</h3>
          <p>{"Без id endpoint item не имеет смысла."}</p>

          <h3>Форма</h3>
          <p>{"В документации используется {task_id}, в реальном URL — число."}</p>

        </div>

        <CodeBlock
          caption={"шаблон"}
          code={`GET /tasks/{task_id}`}
        />

        <CodeBlock
          caption={"реальный запрос"}
          code={`GET /tasks/7`}
        />

        <CodeBlock
          caption={"ещё операции"}
          code={`PATCH  /tasks/7
DELETE /tasks/7`}
        />

        <FillBlank
          prompt={"Выберите значение для path parameter в /tasks/{task_id}."}
          before={"/tasks/"}
          after={""}
          options={[
            "7",
            "is_done=false",
            "{\"priority\": 4}",
          ]}
          answer={"7"}
          explanation={"Path содержит конкретный идентификатор ресурса."}
        />

        <Callout tone="info">
          {"Path parameter не подходит для необязательного фильтра: сегмент пути является частью адреса ресурса."}
        </Callout>
      </Section>

      <Section number="03" title={"Query parameter настраивает выборку"}>
        <Lead>
          {"Query идёт после знака ? и уточняет получение коллекции: фильтр, поиск, сортировку или ограничение количества. Ресурс остаётся тем же /tasks."}
        </Lead>

        <div className="lesson-practice-steps">
          <h3>Необязательность</h3>
          <p>{"Без query клиент получает обычную коллекцию."}</p>

          <h3>Несколько параметров</h3>
          <p>{"Соединяются символом &."}</p>

          <h3>Не новая команда</h3>
          <p>{"Фильтр не требует отдельного /get-open-tasks."}</p>

        </div>

        <CodeBlock
          caption={"один query"}
          code={`GET /tasks?is_done=false`}
        />

        <CodeBlock
          caption={"несколько"}
          code={`GET /tasks?is_done=false&limit=10`}
        />

        <CodeBlock
          caption={"поиск"}
          code={`GET /tasks?search=http`}
        />

        <MatchPairs
          prompt={"Соедините query и смысл."}
          leftTitle={"Query"}
          rightTitle={"Смысл"}
          pairs={[
            { left: "is_done=false", right: "фильтр статуса" },
            { left: "limit=10", right: "ограничение количества" },
            { left: "search=http", right: "поиск по тексту" },
            { left: "sort=priority", right: "порядок результата" },
          ]}
          explanation={"Query-параметры управляют чтением коллекции."}
        />

        <Callout tone="info">
          {"Query меняет способ выборки, но не идентичность одного конкретного ресурса."}
        </Callout>
      </Section>

      <Section number="04" title={"Body передаёт структуру создания или изменения"}>
        <Lead>
          {"Body нужен, когда операция получает набор полей. Для POST это данные новой Task, для PATCH — изменяемые поля."}
        </Lead>

        <div className="lesson-practice-steps">
          <h3>Создание</h3>
          <p>{"Title и priority передаются вместе."}</p>

          <h3>Частичное обновление</h3>
          <p>{"PATCH может передать только is_done."}</p>

          <h3>Не адрес</h3>
          <p>{"Body не определяет, к какому item обращается PATCH; id остаётся в path."}</p>

        </div>

        <CodeBlock
          caption={"POST body"}
          code={`POST /tasks

{
  "title": "API contract",
  "priority": 4
}`}
        />

        <CodeBlock
          caption={"PATCH body"}
          code={`PATCH /tasks/7

{
  "is_done": true
}`}
        />

        <BugHunt
          code={`PATCH /tasks/7

{
  "task_id": 9,
  "is_done": true
}`}
          question={"Почему контракт создаёт неоднозначность?"}
          options={[
            "Path выбирает Task 7, а body сообщает id 9",
            "PATCH не поддерживает bool",
            "Body запрещён для update",
          ]}
          correctIndex={0}
          explanation={"Идентификатор лучше оставить в одном источнике — path."}
          fix={"PATCH /tasks/7\n\n{\n  \"is_done\": true\n}"}
        />

        <Callout tone="info">
          {"Не дублируйте task_id одновременно в path и body без отдельной причины. Два источника могут противоречить друг другу."}
        </Callout>
      </Section>

      <Section number="05" title={"Как выбрать место значения"}>
        <Lead>
          {"Для каждого значения задайте простой вопрос. Оно выбирает ресурс, настраивает выборку или описывает создаваемые данные?"}
        </Lead>

        <div className="lesson-practice-steps">
          <h3>Выбирает конкретный item</h3>
          <p>{"Path."}</p>

          <h3>Фильтрует или ограничивает collection</h3>
          <p>{"Query."}</p>

          <h3>Описывает создаваемую или изменяемую форму</h3>
          <p>{"Body."}</p>

          <h3>Описывает формат сообщения</h3>
          <p>{"Header."}</p>

        </div>

        <CodeBlock
          caption={"алгоритм выбора"}
          code={`task_id → path
is_done filter → query
title and priority → body
Content-Type → header`}
        />

        <CodeBlock
          caption={"один endpoint"}
          code={`PATCH /tasks/7?notify=false
Content-Type: application/json

{"priority": 5}`}
        />

        <BranchExplorer
          code={`if value_identifies_resource:
    use_path
elif value_changes_collection_view:
    use_query
else:
    use_body`}
          scenarios={[
            { label: "task_id", activeLine: 1, output: "path" },
            { label: "limit", activeLine: 3, output: "query" },
            { label: "title", activeLine: 5, output: "body" },
          ]}
        />

        <Callout tone="info">
          {"В первом Planner API не нужен параметр notify. Пример показывает роли, но контракт должен оставаться минимальным."}
        </Callout>
      </Section>

      <Section number="06" title={"Response входит в контракт"}>
        <Lead>
          {"Контракт не заканчивается входом. Клиент должен знать status, форму успешного body и ожидаемые ошибки."}
        </Lead>

        <div className="lesson-practice-steps">
          <h3>Success model</h3>
          <p>{"Какие поля возвращаются."}</p>

          <h3>Not found</h3>
          <p>{"Когда появляется 404."}</p>

          <h3>Validation</h3>
          <p>{"Какие значения приводят к 422."}</p>

          <h3>No content</h3>
          <p>{"Есть ли body у 204."}</p>

        </div>

        <CodeBlock
          caption={"контракт PATCH"}
          code={`PATCH /tasks/{task_id}

path:
  task_id: int

body:
  title?: str
  priority?: int
  is_done?: bool

responses:
  200: updated Task
  404: Task not found
  422: invalid fields`}
        />

        <CodeBlock
          caption={"контракт DELETE"}
          code={`DELETE /tasks/{task_id}

responses:
  204: no body
  404: Task not found`}
        />

        <TrueFalse
          statement={<>{"Контракт API описывает только request, потому что response сервер выберет позже."}</>}
          isTrue={false}
          explanation={"Клиенту заранее нужны обещанные status и форма ответа."}
        />

        <Callout tone="info">
          {"Один смысл ошибки должен повторяться во всех endpoints. Неизвестная Task в GET, PATCH и DELETE получает 404."}
        </Callout>
      </Section>

      <Section number="07" title={"Таблица endpoints Planner API"}>
        <Lead>
          {"Сведём первый блок месяца в единую таблицу. Она станет заданием для реализации в FastAPI и основой будущих тестов."}
        </Lead>

        <div className="lesson-practice-steps">
          <h3>GET collection</h3>
          <p>{"Query-фильтры, 200 и список."}</p>

          <h3>POST collection</h3>
          <p>{"Body создания, 201 и Task."}</p>

          <h3>GET item</h3>
          <p>{"Path id, 200 или 404."}</p>

          <h3>PATCH item</h3>
          <p>{"Path id + body, 200, 404 или 422."}</p>

          <h3>DELETE item</h3>
          <p>{"Path id, 204 или 404."}</p>

        </div>

        <CodeBlock
          caption={"контрактная карта"}
          code={`GET /tasks
query: is_done?, limit?
200: list[Task]

POST /tasks
body: title, priority
201: Task
422: detail

GET /tasks/{task_id}
200: Task
404: detail

PATCH /tasks/{task_id}
body: optional update fields
200: Task
404 or 422

DELETE /tasks/{task_id}
204: no body
404: detail`}
        />

        <CompareSolutions
          question={"Какой контракт легче реализовать и тестировать?"}
          left={{
            title: "Размытый",
            code: "обновить задачу любыми данными и вернуть что-нибудь",
            note: "Нет границ входа и ответа.",
          }}
          right={{
            title: "Явный",
            code: "PATCH /tasks/{id}; body optional fields; 200/404/422",
            note: "Входы и исходы перечислены.",
          }}
          preferred={"right"}
          explanation={"Явный контракт превращается в понятные схемы и тестовые случаи."}
        />

        <Callout tone="info">
          {"Знак ? в таблице означает необязательность поля, а не часть имени параметра."}
        </Callout>
      </Section>

      <Section number="08" title={"Переход к первому FastAPI route"}>
        <Lead>
          {"Теперь синтаксис FastAPI не будет появляться из пустоты. Декоратор route свяжет method и path, параметры функции получат значения из request, а возвращаемые данные станут response."}
        </Lead>

        <div className="lesson-practice-steps">
          <h3>Уже известно</h3>
          <p>{"Зачем нужен server, request, response и endpoint."}</p>

          <h3>Следующий шаг</h3>
          <p>{"Создать приложение FastAPI и запустить Uvicorn."}</p>

          <h3>После этого</h3>
          <p>{"Описать Pydantic-схемы и CRUD в памяти."}</p>

        </div>

        <CodeBlock
          caption={"будущая связь"}
          code={`контракт:
GET /tasks/{task_id}

FastAPI позже:
@app.get("/tasks/{task_id}")
def get_task(task_id: int):
    ...`}
        />

        <CodeBlock
          caption={"граница блока"}
          code={`сейчас проектируем HTTP
следом реализуем HTTP через FastAPI`}
        />

        <Callout tone="info">
          {"Не нужно заранее копировать FastAPI-код. Сначала ученик должен по одной строке объяснить method, path parameter, успешный response и 404."}
        </Callout>

        <div className="lesson-check-group">
          <QuizCard
            question={"Где находится task_id одного ресурса?"}
            options={[
              "path",
              "Content-Type",
              "response body списка",
            ]}
            correctIndex={0}
            explanation={"Id выбирает item."}
          />
          <QuizCard
            question={"Где передать фильтр is_done?"}
            options={[
              "query",
              "path item",
              "status",
            ]}
            correctIndex={0}
            explanation={"Фильтр уточняет collection."}
          />
          <QuizCard
            question={"Где передать title при POST?"}
            options={[
              "body",
              "port",
              "status",
            ]}
            correctIndex={0}
            explanation={"Body содержит форму создания."}
          />
          <QuizCard
            question={"Что ещё входит в контракт кроме request?"}
            options={[
              "responses и ошибки",
              "только имя Python-функции",
              "цвет Swagger",
            ]}
            correctIndex={0}
            explanation={"Клиенту нужны обещанные исходы."}
          />
        </div>

        <KeyTakeaways
          points={[
            <>{"API-контракт проектируется до FastAPI-кода."}</>,
            <>{"Path parameter выбирает конкретный ресурс."}</>,
            <>{"Query parameter управляет выборкой коллекции."}</>,
            <>{"Body передаёт поля создания или изменения."}</>,
            <>{"Header описывает сообщение."}</>,
            <>{"Не стоит дублировать id в path и body."}</>,
            <>{"Контракт включает успешные и ошибочные responses."}</>,
            <>{"Таблица endpoints становится основой реализации и тестов."}</>,
          ]}
        />

        <PracticeCta text={"Оформите контракт Planner API в Markdown: пять endpoints, источники параметров, примеры request/response и минимум по одному ошибочному сценарию."} />
      </Section>

    </RichLesson>
  );
}
