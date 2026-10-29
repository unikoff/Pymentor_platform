import { FolderGit2, GitFork } from "lucide-react";
import {
  BugHunt,
  CodeBlock,
  CodeSequence,
  Diagram,
  DiagramArrow,
  DiagramFlow,
  DiagramNode,
  Lead,
  LinkedNotes,
  PredictOutput,
  QuizCard,
  RichHero,
  RichLesson,
  Section,
  TrueFalse,
} from "../../shared";

export function Lesson57_1({ module }: { module?: string }) {
  return (
    <RichLesson>
      <RichHero
        variant="project"
        chip={module ?? "Блок 12 · Проверяемая передача"}
        title={"Маршруты в APIRouter"}
        intro={"Базовые HTTP-тесты уже охраняют операции Planner. Мы перенесём шесть маршрутов задач в отдельную группу и подключим её к тому же FastAPI-приложению, сохранив внешний договор."}
        tags={[
          { icon: <FolderGit2 size={14} />, label: "группа маршрутов" },
          { icon: <GitFork size={14} />, label: "рефакторинг под тестами" },
        ]}
      />

      <Section number="00" title={"Операции готовы. Перенесём их в router"}>
        <Lead>
          В HTTP-операций Planner мы проверили основные HTTP-операции Planner. В app/api.py уже есть обработчики, выбранный сервис и базовые тесты. Теперь перенесём шесть маршрутов в отдельную группу, сохранив адреса для клиента.
        </Lead>
        <LinkedNotes
          variant="connected"
          items={[
            { title: "Точка старта", description: "В app/api.py зарегистрированы шесть tasks-операций. Тесты проверяют их ответы и состояние." },
            { title: "Новый вопрос", description: "Как сгруппировать handlers и подключить их к тому же FastAPI-app?" },
            { title: "Результат", description: "Один APIRouter соберёт шесть маршрутов. Прежнее приложение подключит группу один раз." },
          ]}
        />
        <p>
          Сначала разберём app, router и handler. Затем сложим prefix с локальным путём, отделим router-tags от Task.tags и получим Planner через Request. В практике повторим этот порядок. Один импорт ещё не подключает маршруты к app.
        </p>
      </Section>

      <Section number="01" title={"APIRouter собирает регистрации, FastAPI создаёт приложение"}>
        <Lead>
          У каждого объекта своя роль. FastAPI создаёт app и принимает маршруты. APIRouter собирает связанные регистрации и их общие настройки. Handler получает HTTP-запрос, вызывает Planner и возвращает ответ. Router не запускает сервер и не заменяет сервис.
        </Lead>
        <p>
          Декоратор <code>@router.get(...)</code> связывает метод и локальный путь с функцией. Пока маршрут записан только в router. Вызов <code>app.include_router(router)</code> добавляет группу к FastAPI-app. Без этого вызова импортированный модуль не появится в API. Поэтому router сначала объявляем, а затем подключаем к приложению. В практике это будут карточки 1 и 3.
        </p>
        <p>
          Представим папку с карточками маршрутов. На каждой указаны метод, адрес и обработчик; папка собирает карточки одной области. FastAPI подключает эту группу к общему API. Это только аналогия: APIRouter не является папкой на диске и не выполняет запросы. Это Python-объект для регистрации маршрутов.
        </p>
        <p>
          Посмотрим на отдельную группу отчётов. Она показывает механику подключения и не является решением переноса Planner.
        </p>
        <CodeBlock
          caption={"Независимый пример группы отчётов"}
          code={"from fastapi import APIRouter, FastAPI\n\nrouter = APIRouter(prefix=\"/reports\", tags=[\"reports\"])\n\n@router.get(\"/daily\")\ndef read_daily_report():\n    return {\"ready\": True}\n\napp = FastAPI()\napp.include_router(router)"}
        />
        <p>
          Декоратор добавляет функцию в router, затем app подключает группу. Клиент видит <code>GET /reports/daily</code> в общем API. В проекте так же: модуль API импортирует router и подключает его к своему app. Читай схему слева направо: группа, приложение, доступные операции.
        </p>
        <Diagram caption={"Один app подключает группу к своей таблице маршрутов"}>
          <DiagramFlow label={"Как определённая группа попадает в приложение"}>
            <DiagramNode title={"app/routers/tasks.py"} shape="subprocess">
              <p>Один APIRouter хранит регистрации задач</p>
            </DiagramNode>
            <DiagramArrow label={"импорт и include_router один раз"} />
            <DiagramNode title={"app/api.py"}>
              <p>Создаёт FastAPI и выбранный Planner</p>
            </DiagramNode>
            <DiagramArrow label={"добавляет routes к этому app"} />
            <DiagramNode title={"Общее API приложения"} shape="terminator">
              <p>Шесть прежних операций доступны клиенту</p>
            </DiagramNode>
          </DiagramFlow>
        </Diagram>
        <p>
          Здесь показано подключение маршрутов, а не хранение данных. Сервис остаётся прежним, приложение одно. Проверим роли вопросом.
        </p>
        <QuizCard
          question={"Как распределены роли в этой схеме?"}
          options={[
            "FastAPI создаёт app, APIRouter группирует регистрации, обработчик выполняет операцию",
            "APIRouter создаёт app, FastAPI хранит задачи, обработчик подключает router",
            "Обработчик создаёт app, Planner группирует routes, APIRouter хранит задачи",
          ]}
          correctIndex={0}
          explanation={"Приложение собирает routes, router хранит регистрации группы, а обработчик выполняет действие для HTTP-запроса."}
        />
      </Section>

      <Section number="02" title={"Prefix и локальный путь складываются в один адрес"}>
        <Lead>
          <code>prefix</code> задаёт общую часть адреса, а декоратор добавляет локальный путь. FastAPI соединяет их. HTTP-метод остаётся отдельной частью route, поэтому один путь коллекции может обслуживать GET и POST.
        </Lead>
        <p>
          Это похоже на адрес здания и номер двери: первая часть задаёт здание, вторая уточняет место. Если prefix равен <code>"/reports"</code>, а локальный путь равен <code>"/daily"</code>, получится <code>"/reports/daily"</code>. Метод проверяем отдельно.
        </p>
        <PredictOutput
          code={"prefix = \"/reports\"\nlocal_path = \"/daily\"\nprint(prefix + local_path)"}
          output={"/reports/daily"}
          hint={"Сохраним порядок: сначала общий сегмент, затем локальный."}
        />
        <p>
          Обычно локальный путь операции начинается с <code>/</code>. У router с непустым prefix есть полезный особый случай: локальный путь <code>""</code> означает сам prefix, поэтому <code>prefix="/tasks"</code> и <code>@router.get("")</code> дают <code>GET /tasks</code>. Это подходит коллекции. Если написать <code>"/"</code>, получится <code>/tasks/</code>, а повторение <code>/tasks</code> в декораторе добавит лишний сегмент <code>/tasks/tasks</code>.
        </p>
        <p>
          Пустой путь работает именно потому, что prefix уже задаёт полный адрес. У router без prefix пустыми окажутся и prefix, и путь операции, а такой маршрут FastAPI не принимает. Для одной задачи локальный путь <code>"/{"{"}task_id{"}"}"</code> добавляет идентификатор к тому же prefix и даёт <code>/tasks/{"{"}task_id{"}"}</code>. Проверка без redirect затем подтверждает, что первый ответ получен для точного адреса.
        </p>
        <CodeBlock
          caption={"Сверяем все прежние пары method/path"}
          code={"GET    /tasks\nPOST   /tasks\nGET    /tasks/{task_id}\nPUT    /tasks/{task_id}\nPATCH  /tasks/{task_id}\nDELETE /tasks/{task_id}"}
        />
        <p>
          GET и POST работают с коллекцией; GET, PUT, PATCH и DELETE используют id элемента. Метод и путь вместе различают операции, поэтому одинаковый путь с разными методами не является дублем. Дубликат возникает, когда в двух местах зарегистрирована одна пара method/path.
        </p>
        <BugHunt
          code={"router = APIRouter(prefix=\"/tasks\", tags=[\"tasks\"])\n\n@router.get(\"/tasks\")\ndef list_tasks():\n    return []"}
          question={"Какой итоговый путь назначен этой функции?"}
          options={["/tasks", "/tasks/tasks", "/tasks/"]}
          correctIndex={1}
          explanation={"Prefix уже содержит /tasks, поэтому локальный сегмент повторяет его. Для коллекции нужен пустой путь: при непустом prefix он даёт /tasks. Путь '/' добавил бы завершающий слеш."}
          fix={"@router.get(\"\")\ndef list_tasks():\n    return []"}
        />
        <p>
          Тесты и OpenAPI проверяют разные вещи. OpenAPI показывает method/path и помогает найти дубли. Запрос без redirect показывает первый ответ сервера для точного адреса. Эти проверки будут в карточке 3.
        </p>
      </Section>

      <Section number="03" title={"Router-tags описывают документацию, Task.tags хранят данные"}>
        <Lead>
          Настройка <code>tags</code> у router группирует операции в OpenAPI и Swagger UI. У модели Planner тоже может быть поле <code>Task.tags</code>, но это данные задачи. Одинаковое имя не связывает эти значения.
        </Lead>
        <p>
          Router-tag не добавляет поле в JSON, не участвует в фильтрации и не входит в URL. Данные задачи проходят через свои схемы и сериализацию. Router-tag описывает API. В практике зададим его один раз, не меняя обработку Task.
        </p>
        <p>
          Проверяй их отдельно: OpenAPI группирует операции под подписью <code>tasks</code>, а поле <code>tags</code> в ответе содержит данные задачи, если этого требует договор. Изменение документации не меняет запись.
        </p>
        <p>
          Перед приёмкой сверим routes в OpenAPI и ответы в тестах. Router-tag не подтверждает состояние Planner. Поле Task.tags не доказывает, что router подключён.
        </p>
      </Section>

      <Section number="04" title={"Request ведёт к Planner текущего приложения"}>
        <Lead>
          Перенесённому handler всё ещё нужен выбранный Planner. FastAPI передаёт ему объект <code>Request</code>. В нём есть приложение, которое приняло запрос, поэтому handler получает Planner через <code>request.app.state.planner</code>. Клиент не передаёт Request в body или query.
        </Lead>
        <p>
          Состояние приложения уже знакомо. После переноса берём Planner из того же места. Не импортируем <code>app</code> из <code>api.py</code> в router: если <code>api.py</code> одновременно импортирует router, модули начнут ждать друг друга. Через Request обработчик получает нужный app без такого цикла.
        </p>
        <p>
          Это похоже на номер стойки, которая приняла обращение: handler получает Planner от текущего app, а не хранит отдельную копию. Это только аналогия. Дополнительного контейнера нет: мы читаем Planner из state приложения.
        </p>
        <CodeBlock
          caption={"Фрагмент обработчика: используем Planner принимающего приложения"}
          code={"from fastapi import APIRouter, Request\n\nrouter = APIRouter(prefix=\"/tasks\", tags=[\"tasks\"])\n\n@router.get(\"/{task_id}\")\ndef read_task(request: Request, task_id: int):\n    return request.app.state.planner.get_task(task_id)"}
        />
        <p>
          Это короткий пример доступа к Planner. При переносе сохраним весь handler: схемы, Path, query, status code, ответ и обработку отсутствующего id. Пример не заменяет рабочую функцию.
        </p>
        <p>
          Вместе с handlers перенесём два HTTP-helper. <code>_task_read_data</code> собирает прежний ответ с данными задачи. <code>_call_with_task_not_found_as_404</code> превращает ожидаемую ошибку отсутствующей задачи в HTTP 404. Не меняем их работу и не скрываем другие ошибки.
        </p>
        <TrueFalse
          statement={"Настройка tags у APIRouter добавляет такие же значения в поле Task.tags каждой задачи."}
          isTrue={false}
          explanation={"Router-tags группируют операции в документации. Task.tags остаются отдельными данными модели."}
        />
      </Section>

      <Section number="05" title={"Переносим одну регистрацию за раз и сохраняем договор"}>
        <Lead>
          Сначала запускаем базовые тесты из HTTP-операций Planner. Они фиксируют исходное состояние A: app, шесть маршрутов, их ответы и данные. Затем переносим функции, не меняя схемы и тела. Новые fixtures здесь не нужны.
        </Lead>
        <p>
          В карточке 1 создадим пакет <code>app/routers</code> и модуль <code>tasks.py</code>. В нём будет один <code>APIRouter(prefix="/tasks", tags=["tasks"])</code>. В карточке 2 перенесём list, get, create, PUT, PATCH и DELETE вместе с двумя helper. В декораторах заменим <code>app</code> на <code>router</code>; функции продолжат делать то же, что в A.
        </p>
        <p>
          После переноса удалим старый декоратор этой функции. Так одна пара method/path не останется зарегистрирована дважды. Между карточками 2 и 3 router ещё не подключён, поэтому `/tasks` временно не работает. Это промежуточное состояние, а не результат B. В карточке 3 подключим группу и только после этого снова запустим HTTP-тесты.
        </p>
        <p>
          В <code>app/api.py</code> останутся один <code>FastAPI()</code>, <code>build_service</code>, <code>app.state.planner</code>, <code>/health</code> и <code>/stats</code>. Там же импортируем router и один раз вызовем <code>app.include_router(tasks_router)</code>. Это и есть результат B: маршруты перенесены, прежний app и Planner сохранены. Второй app или storage не создаём.
        </p>
        <p>
          Это похоже на переезд рабочего места: меняем место, но сохраняем инструменты и порядок работы. В проекте переносим определения и регистрации, оставляя по одной функции на каждый маршрут.
        </p>
        <CodeSequence
          title={"Переносим группу без временного дубля"}
          label={"ПОРЯДОК РЕФАКТОРИНГА"}
          prompt={"Расставим подготовку и перенос так, чтобы в итоговом app у каждой пары method/path была одна регистрация."}
          pieces={[
            { id: "package", code: "создать app/routers и router с общими prefix и tags" },
            { id: "move", code: "перенести одну готовую функцию и её HTTP-helper" },
            { id: "switch", code: "сменить декоратор app на router и удалить старую регистрацию" },
            { id: "connect", code: "подключить router к прежнему app один раз" },
            { id: "verify", code: "повторить тесты, сверить OpenAPI и точный /tasks без redirect" },
          ]}
          correctOrder={["package", "move", "switch", "connect", "verify"]}
          explanation={"Сначала создаём группу, переносим функции и удаляем старые регистрации. Затем подключаем router один раз и проверяем договор."}
          incorrectExplanation={"Сначала подготовим пакет и группу, перенесём функции и уберём старые регистрации. После этого подключим router один раз и проверим API."}
        />
        <p>
          Импорта недостаточно. После подключения проверим тесты и OpenAPI. Отдельно отправим запрос к `/tasks` без redirect: так увидим первый ответ и заметим лишний слеш. Затем повторим сохранённые Postman-запросы. При расхождении сначала проверим регистрацию маршрутов.
        </p>
        <p>
          В конце сверим шесть пар method/path, OpenAPI и базовые тесты. Для <code>GET /tasks</code> и <code>POST /tasks</code> проверим первый ответ без перехода. Схемы, query, статусы и поведение Planner должны остаться такими, как в A.
        </p>
      </Section>

      <Section number="06" title={"Сверим результат и передадим его следующему шагу"}>
        <Lead>
          В результате B есть один tasks-router, один FastAPI-app и прежний Planner. Health и stats остаются в api.py. Шесть операций сохраняют method/path и вызовы сервиса. Это проверяют тесты и OpenAPI.
        </Lead>
        <p>
          Это вход для проверки границ body и path: маршруты уже перенесены, а их договор проверен. Добавим тесты для body и path, не перенося Router повторно. При проверке неизменности данных сравним состояние до и после отказа, а при проверке query и OpenAPI разберём параметры и схему.
        </p>
      </Section>

      <Section number="07" title={"Что мы будем делать в практике"}>
        <Lead>
          Начинаем с A, то есть с состояния после базовых проверок: в app/api.py находятся FastAPI, build_service, шесть tasks-handlers и два HTTP-helper. Там же находятся app.state.planner, /health и /stats. Сначала сверим этот исходный набор и тесты.
        </Lead>
        <LinkedNotes
          variant="connected"
          items={[
            { title: "1. Создадим группу", description: "В карточке 1 объявим один APIRouter с prefix и router-tag. FastAPI и Planner оставим прежними." },
            { title: "2. Перенесём функции", description: "В карточке 2 перенесём шесть handlers и два helper, затем удалим их старые регистрации." },
            { title: "3. Подключим и проверим", description: "В карточке 3 подключим router один раз. Тесты, OpenAPI и запрос без redirect проверят договор." },
          ]}
        />
        <p>
          Порядок карточек повторяет теорию раздела 05: сначала тесты A, затем перенос, затем подключение к app. Во время переноса сохраним схемы, query, статусы и вызовы Planner. Между карточками 2 и 3 tasks-маршруты временно отключены, поэтому тесты запускаем после подключения. Если код отличается от A, сначала сверим его с условием. Готовый результат B станет основой для проверки границ body и path.
        </p>
      </Section>
    </RichLesson>
  );
}
