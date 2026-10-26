import { Filter, Route, ShieldCheck } from "lucide-react";
import {
  BugHunt,
  Callout,
  CodeBlock,
  Diagram,
  DiagramArrow,
  DiagramFlow,
  DiagramNode,
  FillBlank,
  Lead,
  LinkedNotes,
  MatchPairs,
  MethodGrid,
  QuizCard,
  RichHero,
  RichLesson,
  Section,
  StepThrough,
  TrueFalse,
} from "../../shared";

export function Lesson49_1({ module }: { module?: string }) {
  void module;

  return (
    <RichLesson>
      <RichHero
        chip="Блок 10 · занятие 49.1"
        title="Query и границы выборки"
        intro="Добавим настройки к чтению списка через URL и передадим их готовому PlannerService."
        variant="project"
        tags={[
          { icon: <Route size={15} />, label: "один маршрут" },
          { icon: <Filter size={15} />, label: "настройки списка" },
          { icon: <ShieldCheck size={15} />, label: "проверка до действия" },
        ]}
      />

      <Section number="00" title="От готовой выборки к настройкам запроса">
        <Lead>
          В занятии 49 мы подготовили и проверили `select_tasks`. Метод уже умеет отбирать задачи по
          статусу, сортировать их по `id` и ограничивать список. Теперь посмотрим, как клиент передаст
          эти настройки в существующий `GET /tasks`.
        </Lead>
        <LinkedNotes
          variant="connected"
          items={[
            {
              title: "Точка старта",
              description:
                "Список, чтение одной задачи и `GET /stats` уже работают. `select_tasks` из занятия 49 готов.",
            },
            {
              title: "Новый вопрос",
              description:
                "Как передать в URL фильтр, порядок сортировки и limit? Как FastAPI отличает допустимое значение от ошибочного?",
            },
            {
              title: "Результат",
              description:
                "Тот же маршрут передаёт параметры в `select_tasks`. Данные Planner и формат ответа остаются прежними.",
            },
          ]}
        />
        <p>
          В занятии 49 мы сделали выборку, а в занятии 50 перейдём к модели `TaskCreate`. Здесь
          настраиваем только чтение: передаём параметры в готовую выборку. В предыдущем варианте
          Planner мы уже встречали query вместе с выборкой. Теперь отдельно разберём, как FastAPI
          разбирает параметры и проверяет их границы. JSON body и `POST /tasks` появятся в занятии 50.1.
        </p>
      </Section>

      <Section number="01" title="Query меняет выборку, а не адрес ресурса">
        <Lead>
          До `?` находится путь, после него идут настройки запроса. Поэтому
          `/tasks?is_done=false&amp;limit=10` всё ещё обращается к списку `/tasks`. Фильтр и limit не
          создают новый маршрут.
        </Lead>
        <p>
          Представим полку с книгами. Путь `/books` указывает на полку, а query задаёт, какие книги
          показать и сколько их вернуть. Сама полка не меняется. В Planner путь `/tasks` указывает на
          список, а `is_done`, `sort_desc` и `limit` настраивают ответ.
        </p>
        <MethodGrid
          rows={[
            ["/tasks/7", "Path выбирает отдельную задачу с id 7."],
            ["/tasks?limit=7", "Query ограничивает размер ответа списка."],
            ["/tasks?is_done=false&limit=7", "Знак & добавляет ещё одну настройку той же коллекции."],
          ]}
        />
        <p>
          Значение `7` означает разное в зависимости от места. В `/tasks/7` это id задачи. В
          `/tasks?limit=7` это число задач в ответе. Порядок query-параметров можно менять:
          `/tasks?limit=7&amp;is_done=false` и `/tasks?is_done=false&amp;limit=7` задают одни и те же условия.
        </p>
        <p>
          Разделяем три части запроса: path выбирает список или одну задачу, query настраивает чтение,
          а JSON body передаёт данные для записи или изменения. Путь `data/tasks.json` ведёт к файлу
          на диске, не к API.
        </p>
        <MatchPairs
          prompt="Сопоставим фрагмент адреса с тем, что он выбирает или задаёт."
          leftTitle="Фрагмент"
          rightTitle="Смысл"
          pairs={[
            { left: "/tasks", right: "коллекция задач" },
            { left: "/tasks/7", right: "item с id 7" },
            { left: "?limit=7", right: "настройка размера списка" },
            { left: "data/tasks.json", right: "локальный файл Planner" },
          ]}
          explanation="Path выбирает список или задачу, query настраивает ответ, а JSON-файл хранится на диске."
        />
        <p>
          Правильный фильтр может не найти задач. Тогда `/tasks` вернёт пустой список: сам список
          существует. Ошибка `404` относится к запросу одной задачи, которой нет.
        </p>
      </Section>

      <Section number="02" title="FastAPI преобразует текст до входа в маршрут">
        <Lead>
          В URL значения записаны текстом. FastAPI преобразует их в типы из сигнатуры маршрута до
          запуска его кода.
        </Lead>
        <p>
          Например, `limit=12` становится числом `12`, если параметр объявлен как `int`. Значения
          `is_done=false` и `is_done=true` становятся `False` и `True`. Поэтому сервис получает готовые
          значения и не разбирает URL сам.
        </p>
        <p>
          Представим проверку билета перед входом. Если вместо числа указано слово, запрос не проходит
          дальше. В приложении FastAPI проверяет значение до вызова маршрута и сервиса.
        </p>
        <CodeBlock
          caption="Независимый пример маршрута каталога"
          code={`from fastapi import FastAPI, Query

app = FastAPI()

@app.get("/shelves")
def read_shelf(
    borrowed: bool | None = None,
    limit: int = Query(default=5, ge=1, le=20),
):
    return {"borrowed": borrowed, "limit": limit}`}
        />
        <p>
          Это отдельный пример, чтобы увидеть правила FastAPI. Без query маршрут получит `None` и
          `5`. Запрос `/shelves?borrowed=false&amp;limit=2` передаст ему `False` и `2`. Значение
          `limit=abc` не подходит для `int`, поэтому FastAPI вернёт `422` и не вызовет функцию.
          Так же запрос `borrowed=maybe` не подходит для `bool` и вернёт `422`.
        </p>
        <StepThrough
          code={`@app.get("/shelves")
def read_shelf(
    borrowed: bool | None = None,
    limit: int = Query(default=5, ge=1, le=20),
):
    return {"borrowed": borrowed, "limit": limit}`}
          steps={[
            {
              line: 2,
              note: "В URL пришли borrowed=false и limit=2. Пока это текст.",
              vars: { URL: "/shelves?borrowed=false&limit=2" },
            },
            {
              line: 2,
              note: "До вызова функции FastAPI преобразовал значения в bool False и int 2.",
              vars: { borrowed: "False", limit: "2" },
            },
            {
              line: 5,
              note: "Функция получила готовые значения и возвращает их в ответе.",
              vars: { borrowed: "False", limit: "2", ответ: "{borrowed: false, limit: 2}" },
            },
          ]}
        />
        <p>
          Если значение не подходит объявленному типу, FastAPI вернёт `422` до вызова маршрута. Это не
          `404`: такой ответ означает, что path указывает на отсутствующую задачу. Ошибка query не
          должна доходить до сервиса.
        </p>
        <QuizCard
          question="Какое значение получит borrowed в независимом маршруте для /shelves?borrowed=false?"
          options={["False типа bool", '"false" типа str', "None"]}
          correctIndex={0}
          explanation="Аннотация bool говорит FastAPI разобрать текст query до вызова обработчика. Явное false становится False, пропущенный параметр остался бы None."
        />
      </Section>

      <Section number="03" title="Отсутствие фильтра не равно False">
        <Lead>
          У `is_done` есть три разных состояния. Важно сохранить их до вызова `select_tasks`.
        </Lead>
        <p>
          Если `is_done` пропущен, FastAPI передаёт `None`. Сервис не фильтрует задачи по статусу.
          `is_done=true` становится `True` и оставляет завершённые задачи. `is_done=false` становится
          `False` и оставляет открытые. Явное `False` задаёт условие фильтра, а не означает его отсутствие.
        </p>
        <p>
          `None`, `True` и `False` нам уже знакомы по Python. Здесь важно, что пропущенный query даёт
          `None`, а текст `false` даёт `False`. Сервис различает их, поэтому проверяем отсутствие через
          `is_done is not None`, а не через обычное условие `if is_done`.
        </p>
        <MethodGrid
          rows={[
            ["параметр пропущен", "Получаем None: оставляем оба статуса."],
            ["is_done=true", "Получаем True: оставляем завершённые задачи."],
            ["is_done=false", "Получаем False: оставляем открытые задачи."],
          ]}
        />
        <p>
          Например, `is_done` похож на отметку «выдана» у книги. Если параметр не указан, показываем
          книги с любым статусом. Если указано `false`, выбираем только невыданные. Запрос только
          читает данные и ничего не меняет.
        </p>
        <BugHunt
          code={`def select_open_tasks(is_done):
    if is_done:
        return [task for task in tasks if task.is_done == is_done]
    return tasks`}
          question="Почему этот способ теряет выбор открытых задач?"
          options={[
            "Потому что False и None оба ведут в ветку return tasks",
            "Потому что True нельзя передать из URL",
            "Потому что список нельзя фильтровать по bool",
          ]}
          correctIndex={0}
          explanation="При is_done=False обычное условие ложно, и функция возвращает весь список. Отделяем отсутствие параметра от его значения."
          fix={`if is_done is not None:
    return [task for task in tasks if task.is_done == is_done]`}
        />
        <p>
          Условие `is_done is not None` проверяет, передал ли клиент фильтр. Если да, сравниваем статус
          с его значением, даже если это `False`.
        </p>
        <TrueFalse
          statement={
            <>
              Если `GET /tasks?is_done=true` не находит ни одной завершённой задачи, правильный ответ
              API обязательно будет `404`.
            </>
          }
          isTrue={false}
          explanation="Path /tasks всё ещё обозначает существующую коллекцию. Корректный фильтр без совпадений возвращает 200 и пустой список, а 404 относится к отсутствующему item."
        />
      </Section>

      <Section number="04" title="HTTP-default и сервисный limit решают разные задачи">
        <Lead>
          У `limit` есть значение по умолчанию на HTTP-уровне и в сервисе. Они решают разные задачи.
        </Lead>
        <p>
          Если клиент пропустил `limit`, `GET /tasks` использует `10` и вернёт не больше десяти задач.
          У `select_tasks` значение `None` означает «не ограничивать список». Поэтому CLI может получить
          все задачи. Маршрут передаёт сервису число `10` или число из query.
        </p>
        <p>
          Как в каталоге: экран показывает часть списка, но сам каталог остаётся полным. В Planner
          `list_tasks` и `GET /stats` видят все задачи. HTTP `limit` ограничивает только ответ
          `GET /tasks`.
        </p>
        <CodeBlock
          caption="HTTP-границы в независимом примере"
          code={`limit: int = Query(default=5, ge=1, le=20)`}
        />
        <p>
          `default=5` используется, если параметр пропущен. `ge=1` означает «не меньше 1», а `le=20`
          означает «не больше 20». Поэтому `1` и `20` допустимы, а `0` и `21` дают `422`. FastAPI не
          исправляет неверное значение, а отклоняет запрос.
        </p>
        <p>
          `Query(...)` описывает правило FastAPI: значение по умолчанию и границы. Клиент передаёт
          значение в URL, а FastAPI проверяет его по этому правилу.
        </p>
        <FillBlank
          prompt="Вставим нижнюю границу для допустимых значений от 1 до 20 включительно."
          before="limit: int = Query(default=5, "
          after=", le=20)"
          options={["ge=1", "gt=1", "default=1"]}
          answer="ge=1"
          explanation="ge означает «больше или равно», поэтому крайнее значение 1 проходит проверку. gt=1 исключил бы единицу."
        />
        <p>
          В Planner будет `Query(default=10, ge=1, le=50)`: без параметра используем `10`, а допустимы
          числа от `1` до `50` включительно. Поэтому `limit=0` и `limit=51` дадут `422`, а `1` и `50`
          пройдут. В сервисе `limit=None` по-прежнему означает полный список. Ограничение действует
          только для HTTP, не для CLI и общей статистики.
        </p>
      </Section>

      <Section number="05" title="Один GET передаёт параметры готовому сервису">
        <Lead>
          Оставляем один `GET /tasks` и добавляем параметры в его сигнатуру. Саму выборку выполняет
          готовый сервис.
        </Lead>
        <p>
          В занятии 48 обработчик научился получать сервис через
          `request.app.state.planner`. Используем тот же способ: при каждом запросе берём сервис из
          приложения. Теперь добавим к обработчику `is_done`, `sort_desc` и `limit`.
        </p>
        <Diagram caption="От query в URL к ответу коллекции">
          <DiagramFlow label="Путь параметров через готовый Planner">
            <DiagramNode title="URL">
              <p>`/tasks?is_done=false&amp;sort_desc=true&amp;limit=2`</p>
            </DiagramNode>
            <DiagramArrow label="текстовые пары" />
            <DiagramNode title="FastAPI">
              <p>Преобразует типы и проверяет limit до обработчика</p>
            </DiagramNode>
            <DiagramArrow label="проверенные значения" />
            <DiagramNode title="Сервис Planner">
              <p>Получает аргументы через `request.app.state.planner`</p>
            </DiagramNode>
            <DiagramArrow label="список Task" />
            <DiagramNode title="HTTP-ответ">
              <p>Сохраняет прежние четыре публичных поля</p>
            </DiagramNode>
          </DiagramFlow>
        </Diagram>
        <p>
          Путь такой: клиент задаёт query, FastAPI проверяет значения, маршрут передаёт их в
          `select_tasks`, а API формирует привычный ответ. Маршрут не открывает JSON-файл и не
          сохраняет выборку.
        </p>
        <p>
          В занятии 49 сервис уже выполняет операции в нужном порядке: фильтр, сортировка по `id`,
          затем limit. Пусть id `2` завершена, а `5` и `8` открыты. Запрос
          `is_done=false&amp;sort_desc=false&amp;limit=1` должен вернуть id `5`. Если сначала применить
          limit, останется id `2`; фильтр уберёт её и список станет пустым. Поэтому маршрут передаёт
          параметры готовому методу, а не повторяет выборку.
        </p>
        <p>
          Формат ответа не меняется: в нём остаются `id`, `title`, `priority` и `is_done`. `tags` есть в
          задаче и JSON-файле, но API его не возвращает. `GET /stats` считает все задачи. Успешный GET
          только читает данные: он не вызывает `save` и не меняет список или файл.
        </p>
        <Callout tone="info">
          <strong>Различаем ответы.</strong> Неверный query даёт `422`. Правильный фильтр без совпадений
          даёт `200` и `[]`. `404` остаётся для отсутствующей задачи в
          <code>{"GET /tasks/{task_id}"}</code>.
        </Callout>
        <p>
          Мы добавили настройки к HTTP-чтению, а сервисный алгоритм не меняли. CLI по-прежнему
          показывает полный список, item читается по path, а stats считает все задачи. Практика ниже
          проверит каждое из этих условий.
        </p>
      </Section>

      <Section number="06" title="Что мы будем делать в практике">
        <Lead>
          В практике применим правила из теории к тому же Planner и `select_tasks`, которые подготовили
          в занятии 49.
        </Lead>
        <LinkedNotes
          variant="connected"
          items={[
            {
              title: "1. Подготовим данные",
              description:
                "Как в занятиях про CLI и сервисную выборку, подготовим 12 или больше задач с обоими статусами. Сохраним исходные список, item, stats и JSON.",
            },
            {
              title: "2. Подключим параметры",
              description:
                "В обработчике из занятия 48 добавим типы и границы из разделов 2–5, затем передадим параметры в готовый `select_tasks`.",
            },
            {
              title: "3. Проверим ответы и данные",
              description:
                "В Postman, как в занятиях 46.1–47.1, проверим правильные и ошибочные query, а затем сравним CLI, item, stats и JSON с исходным снимком.",
            },
          ]}
        />
        <p>
          Так мы проверим правила из разделов 2–5: FastAPI разбирает query, сервис получает фильтр,
          сортировку и предел в нужном порядке, а HTTP-limit не сокращает полный список. Сравним ответы
          с исходными данными Planner.
        </p>
        <p>
          В итоге существующий `GET /tasks` получит настройки, а полный список, stats, item и данные
          останутся прежними. Это подготовит нас к занятию 50, где появится модель `TaskCreate`; приём
          JSON через `POST /tasks` и сохранение данных будут в занятии 50.1.
        </p>
      </Section>
    </RichLesson>
  );
}
