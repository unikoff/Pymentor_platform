import { Cloud, Wrench } from "lucide-react";
import { Callout, BugHunt, CodeBlock, CodeSequence, CompareSolutions, FillBlank, KeyTakeaways, Lead, LinkedNotes, MatchPairs, PracticeCta, QuizCard, RecallCard, RichHero, RichLesson, Section, TrueFalse, TheoryBridge } from "../../shared";
import fastapiUvicornInfographic from "./images/fastapi-uvicorn-health-flow.svg";

// 52. Первое FastAPI-приложение, Uvicorn и Swagger
export function Lesson52({ module }: { module?: string }) {
  return (
    <RichLesson>
      <RichHero
        chip={module ?? "Месяц 3 · Блок 10 · Первый FastAPI"}
        title={"52. Первое FastAPI-приложение, Uvicorn и Swagger"}
        intro={"В прошлом занятии мы увидели HTTP-запрос в Postman. Теперь тот же существующий Planner получит собственный серверный вход, не теряя привычный CLI."}
        tags={[
          { icon: <Wrench size={14} />, label: "FastAPI + Uvicorn" },
          { icon: <Cloud size={14} />, label: "GET /health" },
        ]}
      />
      <LinkedNotes variant="connected" items={[
        { title: "Прежняя опора", description: "В прошлом занятии мы отправляли запросы через Postman и исследовали ответы Echo." },
        { title: "Новый вопрос", description: "Как принять HTTP в самом Planner и при этом сохранить прежний CLI?" },
        { title: "Результат", description: "Добавим отдельный FastAPI-вход и запустим его через Uvicorn в том же проекте." },
      ]} />

      <Section number="00" title={"От Echo к своему приложению"}>
        <Lead>
          {"Echo показал, как сервер отвечает на запрос. Теперь мы сами опишем небольшой обработчик и запустим его как HTTP-приложение."}
        </Lead>
        <p>
          {"В нашем Planner уже есть CLI, модель задачи, сервис и JSON-хранилище. Мы не создаём отдельный проект и не переписываем app/main.py. В существующем пакете app появится новый модуль app/api.py. Сначала он будет отвечать только на GET /health, не обращаясь к задачам."}
        </p>
        <CodeBlock
          caption={"Тот же проект, новый вход"}
          code={"planner/\n" +
            "├── app/\n" +
            "│   ├── __init__.py\n" +
            "│   ├── main.py\n" +
            "│   ├── cli.py\n" +
            "│   ├── services.py\n" +
            "│   ├── models.py\n" +
            "│   ├── storage.py\n" +
            "│   ├── validators.py\n" +
            "│   ├── exceptions.py\n" +
            "│   └── api.py\n" +
            "├── docs/\n" +
            "├── labs/\n" +
            "├── tests/\n" +
            "├── requirements.txt  # обновим или добавим, если его ещё нет\n" +
            "├── postman/\n" +
            "│   ├── HTTP collection\n" +
            "│   └── Echo environment\n" +
            "├── .gitignore\n" +
            "└── README.md"}
        />
        <Callout tone="info">
          <strong>Один настроенный источник данных.</strong>{" Путь к JSON не угадываем по текущей папке и не задаём отдельно для каждого интерфейса. Его выбирает существующий "}
          <code>build_service()</code>{", который собирает PlannerService с настроенным JsonStorage. Когда API начнёт работать с задачами, CLI и API должны использовать эту же фабрику и конфигурацию. Если путь действительно нужно исправить, меняем его в одном месте и отдельно проверяем, где лежат текущие записи. Второй JSON ради нового интерфейса не создаём. Сейчас "}
          <code>GET /health</code>{" к хранилищу не обращается."}
        </Callout>
        <p>
          {"Внутри app/ остаются Python-модули проекта. services.py содержит правила PlannerService, storage.py читает и сохраняет данные, models.py описывает Task. Новый HTTP-вход появится в api.py, а main.py продолжит запускать CLI. Существующие каталоги и данные остаются на своих местах."}
        </p>
        <p>
          {"Сценарии Postman хранятся отдельно от кода. В этой работе добавим локальное окружение для GET /health, не меняя Echo collection и environment. Файл requirements.txt находится в корне проекта: сохраним его текущие зависимости и допишем FastAPI с Uvicorn; если файла ещё нет, создадим его."}
        </p>
        <RecallCard
          question={"Что изменится в проекте, а что должно остаться прежним?"}
          answer={<p>{"Добавится app/api.py с FastAPI и GET /health. Модель, сервис, хранилище, данные и app/main.py с CLI останутся на месте."}</p>}
        />
      </Section>

      <Section number="01" title={"FastAPI описывает приложение"}>
        <Lead>
          {"FastAPI это Python-фреймворк для описания HTTP API. Он связывает запросы с функциями и готовит ответы."}
        </Lead>
        <p>
          {"Фреймворк даёт общие механизмы, чтобы не писать разбор HTTP с нуля. Мы задаём конкретные маршруты и правила. Такой слой часто стоит перед прикладным сервисом, а не заменяет его."}
        </p>
        <CodeBlock
          caption={"Объект приложения"}
          code={"from fastapi import FastAPI\n\n" +
            "app = FastAPI(title=\"Уведомления\")"}
        />
        <p>
          {"FastAPI это класс, а app это созданный экземпляр. К нему мы будем добавлять маршруты. Параметр title задаёт название для документации, но не меняет URL. Эта строка ещё не запускает сервер и не открывает порт."}
        </p>
        <TrueFalse
          statement={<>{"После app = FastAPI() браузер уже может подключиться к порту 8000."}</>}
          isTrue={false}
          explanation={"Появился объект приложения. Сетевой адрес начнёт принимать запросы только после запуска сервера."}
        />
      </Section>

      <Section number="02" title={"Маршрут связывает запрос и функцию"}>
        <Lead>
          {"Маршрут отвечает на вопрос: какую функцию вызвать для этой пары HTTP-метода и пути?"}
        </Lead>
        <p>
          {"Например, GET /status и POST /status это разные операции. Декоратор FastAPI регистрирует метод и путь, а функция под ним описывает обработку подходящего запроса."}
        </p>
        <CodeBlock
          caption={"Независимый маршрут уведомлений"}
          code={"from fastapi import FastAPI\n\n" +
            "app = FastAPI()\n\n" +
            "@app.get(\"/status\")\n" +
            "def read_status():\n" +
            "    return {\"service\": \"notifications\", \"active\": True}"}
        />
        <p>
          {"При загрузке модуля FastAPI записывает маршрут. Тело read_status не исполняется в этот момент. Оно запускается, когда приходит GET на /status. Возвращённый словарь станет содержимым ответа."}
        </p>
        <MatchPairs
          prompt={"Соединим фрагмент с его ролью."}
          leftTitle={"Фрагмент"}
          rightTitle={"Роль"}
          pairs={[
            { left: "@app.get(\"/status\")", right: "Задаёт метод и путь" },
            { left: "def read_status():", right: "Обрабатывает подходящий запрос" },
            { left: "return {...}", right: "Возвращает данные ответа" },
          ]}
          explanation={"Декоратор выбирает операцию, функция выполняет её, а return передаёт результат FastAPI."}
        />
        <p>
          {"Python выполняет верхнеуровневые инструкции модуля при импорте. Поэтому app.main не должен запускать CLI только из-за того, что следующий модуль импортирует из него build_service. Вызов CLI помещают под условие прямого запуска:"}
        </p>
        <CodeBlock
          caption={"Импорт app.main не запускает CLI"}
          code={'if __name__ == "__main__":\n    main()'}
        />
        <p>
          {"При команде python -m app.main имя модуля становится __main__, и guard запускает main(). При import app.main имя будет app.main, поэтому меню и ожидание ввода не начнутся."}
        </p>
        <p>
          {"В Planner первым маршрутом станет GET /health. Он вернёт короткое состояние приложения. Это учебный endpoint без доступа к списку задач."}
        </p>
      </Section>

      <Section number="03" title={"FastAPI готовит HTTP-ответ"}>
        <Lead>
          {"Обработчик возвращает значение Python. FastAPI преобразует его в ответ, который понимает HTTP-клиент."}
        </Lead>
        <p>
          {"Если вернуть словарь, FastAPI сериализует его в JSON body. Обычный успешный маршрут по умолчанию отвечает статусом 200. Значение в теле и статус это разные части response, поэтому посмотрим на оба."}
        </p>
        <CodeBlock
          caption={"Словарь Python и JSON"}
          code={"# Python\n" +
            "{\"service\": \"notifications\", \"active\": True}\n\n" +
            "# JSON в ответе\n" +
            "{\"service\": \"notifications\", \"active\": true}"}
        />
        <p>
          {"В Python логическое значение записывается как True, а в JSON как true. FastAPI выполняет преобразование. Функция не отправляет сетевые пакеты и сама не выбирает порт."}
        </p>
        <CompareSolutions
          question={"Что доказывает GET /health со статусом 200 и body {\"status\": \"ok\"}?"}
          left={{
            title: "Слишком широкий вывод",
            code: "Вся система Planner и каждое хранилище исправны",
            note: "Этот маршрут ещё не проверяет данные и сервис.",
          }}
          right={{
            title: "Точный вывод",
            code: "Приложение обработало этот запрос и вернуло ожидаемый ответ",
            note: "Проверено только поведение health-маршрута.",
          }}
          preferred={"right"}
          explanation={"Health полезен для простой проверки доступности, но его результат ограничен теми проверками, которые маршрут действительно выполняет."}
        />
      </Section>

      <Section number="04" title={"Uvicorn передаёт запрос приложению"}>
        <Lead>
          {"FastAPI описывает, что делать с запросом. Uvicorn запускает процесс, принимает соединение и вызывает приложение."}
        </Lead>
        <p>
          {"Uvicorn это ASGI-сервер. ASGI задаёт общий интерфейс между сетевым сервером и Python-приложением. Представим стандартный разъём: Uvicorn не обязан знать правила Planner, а FastAPI не должен управлять портом. Для этого занятия достаточно проследить путь сообщения. Асинхронное выполнение пока не изучаем, поэтому endpoint может быть обычной функцией def."}
        </p>
        <p>
          {"FastAPI и Uvicorn это устанавливаемые Python-библиотеки. Сначала активируем выбранное окружение проекта. Команда python -m pip использует pip именно того интерпретатора, который запускается как python; так мы не устанавливаем пакеты в одну версию Python, а запускаем сервер другой. requirements.txt служит списком зависимостей для повторной установки. Добавим в него новые библиотеки, сохранив прежние строки."}
        </p>
        <LinkedNotes items={[
          { title: "Окружение", description: "Выбранный интерпретатор Python и установленные в него пакеты." },
          { title: "pip", description: "Устанавливает FastAPI и Uvicorn в активное окружение." },
          { title: "requirements.txt", description: "Записывает зависимости проекта, чтобы их можно было установить снова." },
        ]} />
        <CodeBlock
          caption={"Список и установка зависимостей"}
          code={"# requirements.txt: сохраняем прежние строки и добавляем\nfastapi\nuvicorn\n\n# терминал, из активного окружения проекта\npython -m pip install -r requirements.txt\npython -m pip show fastapi uvicorn"}
        />
        <p>
          {"Сначала дополняем requirements.txt, затем команда с -r устанавливает перечисленные пакеты в окружение выбранного python. pip show подтверждает, что FastAPI и Uvicorn доступны именно там."}
        </p>
        <figure className="lesson-infographic">
          <img
            src={fastapiUvicornInfographic}
            alt="Браузер отправляет GET /health серверу Uvicorn. Uvicorn передаёт запрос приложению FastAPI, обработчик формирует JSON, ответ возвращается через Uvicorn."
            width={1672}
            height={836}
            loading="lazy"
            decoding="async"
          />
          <figcaption>Клиент обращается к Uvicorn. Сервер передаёт запрос FastAPI, а затем возвращает клиенту готовый ответ.</figcaption>
        </figure>
        <CodeSequence
          title={"Путь запроса"}
          prompt={"Проследим путь запроса от отправки до ответа."}
          pieces={[
            { id: "client", code: "клиент отправляет HTTP-запрос" },
            { id: "server", code: "Uvicorn принимает соединение" },
            { id: "app", code: "FastAPI выбирает маршрут" },
            { id: "handler", code: "функция возвращает значение" },
            { id: "response", code: "клиент получает HTTP-ответ" },
          ]}
          correctOrder={["client", "server", "app", "handler", "response"]}
          explanation={"Приложение не увидит сообщение, пока сервер не примет соединение. Ответ проходит обратно через Uvicorn."}
          incorrectExplanation={"Клиент сначала отправляет запрос Uvicorn. Сервер передаёт его FastAPI, маршрут вызывает обработчик, а ответ возвращается клиенту через Uvicorn."}
        />
      </Section>

      <Section number="05" title={"Команда указывает, что импортировать"}>
        <Lead>
          {"Uvicorn запускает приложение по строке импорта. Поэтому важны имя файла, имя объекта и текущая папка терминала."}
        </Lead>
        <p>
          {"Для нашего модуля команда выглядит так:"}
        </p>
        <CodeBlock
          caption={"Запуск из корня проекта"}
          code={"python -m uvicorn app.api:app --reload\n\n" +
            "app.api  → модуль app/api.py\n" +
            ":app     → объект FastAPI внутри модуля"}
        />
        <p>
          {"Команду запускают из корня существующего проекта, где Python может импортировать пакет app. Ключ --reload перезапускает сервер при изменениях и удобен во время разработки. Он не нужен на рабочем сервере."}
        </p>
        <p>
          {"В этом проекте app/main.py уже отвечает за CLI. Запись app.main:app укажет Uvicorn на CLI-модуль и попросит взять из него объект app. Это не адрес нового HTTP-приложения: оно находится в app/api.py."}
        </p>
        <FillBlank
          prompt={"Какой объект Uvicorn возьмёт после двоеточия?"}
          before={"app.api:"}
          after={""}
          options={["app", "api", "uvicorn"]}
          answer={"app"}
          explanation={"Слева указано имя модуля app.api, справа имя объекта FastAPI, который в нём создан."}
        />
        <BugHunt
          code={"Терминал открыт в app/\npython -m uvicorn app.api:app --reload"}
          question={"Python не находит пакет app. Что проверим в первую очередь?"}
          options={[
            "Запущена ли команда из корня проекта",
            "Есть ли задачи в JSON-файле",
            "Какой JSON возвращает health",
          ]}
          correctIndex={0}
          explanation={"При ошибке импорта Uvicorn ещё не загрузил приложение. Данные Planner и HTTP body пока не участвуют."}
          fix={"Остановим процесс, перейдём в корень проекта и повторим команду оттуда."}
        />
      </Section>

      <Section number="06" title={"Отделяем запуск от маршрутизации"}>
        <Lead>
          {"Похожие сообщения об ошибке относятся к разным этапам. Сначала выясним, запустился ли сервер и дошёл ли запрос до приложения."}
        </Lead>
        <LinkedNotes items={[
          { title: "Ошибка импорта", description: "Uvicorn не нашёл app.api или объект app. До HTTP-обработки дело не дошло." },
          { title: "Connection refused", description: "По адресу и порту никто не принимает соединение. Проверим, запущен ли Uvicorn." },
          { title: "404 Not Found", description: "Соединение есть, но path не зарегистрирован. Например, GET /unknown." },
          { title: "405 Method Not Allowed", description: "Path зарегистрирован, но для него нет такого метода. Например, POST /health при маршруте только для GET." },
        ]} />
        <p>
          {"404 и 405 это полученные HTTP-ответы. Ошибка импорта и отказ соединения возникают раньше. Поэтому сначала проверим, есть ли у клиента статус, и только затем изучим body."}
        </p>
        <TrueFalse
          statement={<>{"Если GET /health работает, незарегистрированный GET / тоже обязан вернуть 200."}</>}
          isTrue={false}
          explanation={"Каждая пара method и path регистрируется отдельно. Health-маршрут не создаёт автоматически маршрут корня."}
        />
      </Section>

      <Section number="07" title={"Swagger показывает зарегистрированный API"}>
        <Lead>
          {"FastAPI строит описание OpenAPI по маршрутам приложения. Swagger UI отображает это описание и может отправить настоящий запрос."}
        </Lead>
        <p>
          {"OpenAPI это машинно-читаемое описание путей и операций API. Swagger UI показывает его человеку в браузере. Это не два разных сервера: /docs берёт схему, которую FastAPI формирует для приложения."}
        </p>
        <CodeBlock
          caption={"Три адреса на локальном сервере"}
          code={"http://127.0.0.1:8000/health\n" +
            "http://127.0.0.1:8000/docs\n" +
            "http://127.0.0.1:8000/openapi.json"}
        />
        <p>
          {"В /docs откроем GET /health. Try it out подготавливает поля запроса, а Execute отправляет его. Затем сравним status и JSON body с прямым ответом браузера. OpenAPI перечислит только фактически зарегистрированные маршруты, а не весь будущий план Planner API."}
        </p>
        <QuizCard
          question={"Кто создаёт маршрут GET /health, а кто показывает его в браузере?"}
          options={[
            "FastAPI регистрирует маршрут в коде, Swagger UI отображает его описание",
            "Swagger UI создаёт маршрут, а Uvicorn сохраняет его в JSON",
            "Uvicorn добавляет все будущие маршруты при запуске",
          ]}
          correctIndex={0}
          explanation={"Маршрут объявлен в Python. FastAPI включает его в OpenAPI, а Swagger UI отображает эту схему."}
        />
        <p>
          {"Документация помогает исследовать API, но не доказывает, что бизнес-правила верны. В этой работе проверяется только health-маршрут."}
        </p>
      </Section>

      <Section number="08" title={"Проверим модель перед переходом"}>
        <Lead>
          {"Объясним цепочку своими словами, не подменяя один инструмент другим."}
        </Lead>
        <div className="lesson-check-group">
          <RecallCard
            question={"Что означает строка app.api:app?"}
            answer={<p>{"Загрузить модуль app.api, соответствующий app/api.py, и взять из него объект с именем app."}</p>}
          />
          <QuizCard
            question={"Что означает 405 для POST /health, если зарегистрирован только GET /health?"}
            options={[
              "Сервер работает, но этот метод не разрешён для пути",
              "Uvicorn не смог импортировать приложение",
              "Клиент вообще не получил HTTP-ответ",
            ]}
            correctIndex={0}
            explanation={"405 это HTTP-ответ о неподдерживаемом методе на существующем пути."}
          />
          <RecallCard
            question={"Что доказывает успешный GET /health и чего он не доказывает?"}
            answer={<p>{"Приложение обработало этот запрос и вернуло ответ. Этот маршрут не проверяет JSON-хранилище или операции над задачами."}</p>}
          />
          <RecallCard
            question={"Что произойдёт при import app.main, если CLI-запуск защищён условием __name__ == \"__main__\"?"}
            answer={<p>{"Модуль импортируется, но CLI не запускается. Поэтому следующая работа сможет получить build_service без меню и ожидания ввода."}</p>}
          />
        </div>
        <p>
          {"Когда мы различаем модуль приложения, процесс Uvicorn и HTTP-маршрут, можно переходить к подключению существующего PlannerService."}
        </p>
      </Section>

      <Section number="09" title={"Что мы будем делать в практике"}>
        <Lead>
          {"Добавим сетевой вход к уже работающему Planner, не меняя его CLI и хранение."}
        </Lead>
        <p>
          {"Установим FastAPI и Uvicorn в выбранное окружение и добавим их в requirements.txt, сохранив остальные зависимости. Если файла ещё нет, создадим его в корне проекта. Затем добавим app/api.py с объектом FastAPI и GET /health. Браузером проверим JSON-тело, а статус 200 прочитаем в Swagger UI или Postman."}
        </p>
        <CodeBlock
          caption={"Новый вход, прежний проект"}
          code={"существующий Planner\n" +
            "  app/main.py  → прежний CLI\n" +
            "  app/api.py   → GET /health\n" +
            "  postman/     → Planner API collection + Local environment"}
        />
        <p>
          {"В Postman настроим Local environment с base_url=http://127.0.0.1:8000 и сохраним GET /health отдельно от Echo-запросов. Затем проверим 404 и 405, импортируем app.main без запуска меню и запустим прежний CLI."}
        </p>
        <p>
          {"Мы не подключаем чтение списка задач, новые хранилища или CRUD. Следующая работа добавит GET-маршруты к PlannerService, собранному через тот же build_service и настроенный путь JsonStorage."}
        </p>
        <KeyTakeaways
          points={[
            <>{"FastAPI описывает маршруты, Uvicorn принимает сетевые запросы."}</>,
            <>{"Импорт app.api:app указывает модуль и объект приложения."}</>,
            <>{"python -m pip устанавливает пакеты в окружение выбранного интерпретатора."}</>,
            <>{"Импорт app.main не должен запускать CLI; build_service настраивает общий путь хранилища."}</>,
            <>{"GET /health проверяет только ответ этого маршрута."}</>,
          ]}
        />
        <PracticeCta text={"Установим FastAPI и Uvicorn в окружение Planner, добавим GET /health, проверим тело и статус отдельно, затем подтвердим безопасный импорт app.main и прежний CLI."} />
      </Section>
    </RichLesson>
  );
}
