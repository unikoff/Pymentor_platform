import { CheckCircle2, ShieldCheck } from "lucide-react";
import {
  BugHunt,
  CodeBlock,
  Diagram,
  DiagramArrow,
  DiagramFlow,
  DiagramNode,
  Lead,
  LinkedNotes,
  MatchPairs,
  MethodGrid,
  PredictOutput,
  QuizCard,
  RichHero,
  RichLesson,
  Section,
  StepThrough,
  TrueFalse,
} from "../../shared";

export function Lesson58_2({ module }: { module?: string }) {
  return (
    <RichLesson className="rich-lesson--client-server">
      <RichHero
        variant="project"
        chip={module ?? "Блок 12 · Проверяемая передача"}
        title={"Выборка и схема OpenAPI"}
        intro={
          "В маршруте перед этим занятием идут проверки отказов. Перед практикой сверим нужные fixtures; здесь проверим чтение списка и описание API. Приложение и маршруты останутся без изменений."
        }
        tags={[
          { icon: <CheckCircle2 size={14} />, label: "query-контракт" },
          { icon: <ShieldCheck size={14} />, label: "OpenAPI" },
        ]}
      />

      <Section number="00" title={"От отказа к проверке чтения"}>
        <Lead>
          {"Проверим, как query-параметры влияют на список, и сверим описание API для клиента."}
        </Lead>
        <LinkedNotes
          variant="connected"
          items={[
            {
              title: "Что уже есть",
              description: "В tests/test_contract.py проверены body, path и состояние после отказа. Фикстуры api_client и api_service дают отдельные тестовые данные.",
            },
            {
              title: "Что проверим",
              description: "Покажут ли данные порядок filter → sort → limit? Останутся ли целыми stats и JSON? Все ли маршруты и схемы описаны в OpenAPI?",
            },
            {
              title: "Что получим",
              description: "Тесты подтвердят выборку и описание API. Код маршрутов и данные приложения не меняются.",
            },
          ]}
        />
        <p>
          {"Проверки query и OpenAPI уже находятся в tests/test_contract.py. Мы продолжим в этом файле: сохраним сильные проверки и уточним только те, которые не замечают неверный ответ или порядок обработки. Сначала найдём конкретную проверку и проследим, какие данные она создаёт, какой запрос отправляет и с чем сравнивает ответ. Так мы изменим только проверку, которая действительно пропускает ошибку."}
        </p>
        <p>
          {"Здесь проверим обычные GET-запросы и убедимся, что чтение не меняет источник данных. В отдельных проверках Planner перейдём от HTTP к модели, хранилищу и сервису."}
        </p>
      </Section>

      <Section number="01" title={"Начинаем с уже готовых тестовых опор"}>
        <Lead>
          {"Используем настоящее приложение и готовые фикстуры. Все запросы одного теста работают с одним временным файлом."}
        </Lead>
        <p>
          {"api_service создаёт задачи во временном JSON-файле. api_client отправляет запросы в настоящее приложение, которое читает этот же файл. Рабочий data/tasks.json тест не затрагивает."}
        </p>
        <MethodGrid
          rows={[
            ["api_service", "Создаёт задачи во временном JSON и возвращает их реальные id."],
            ["api_client", "Отправляет запросы к настоящим маршрутам приложения."],
            ["tests/test_contract.py", "Содержит проверки границ, query и OpenAPI."],
          ]}
        />
        <p>
          {"В одном тесте фикстуры используют одно временное хранилище. Поэтому id, полученные через api_service, можно проверить HTTP-запросом через api_client, а затем сравнить stats и байты именно этого файла. Отдельные тесты запускаются независимо: им нельзя полагаться на id или файл, оставшийся после другого теста. Мы создаём записи и отправляем запросы в одной функции, чтобы все сравнения относились к одному временному источнику."}
        </p>
        <p>
          {"Сначала найдём уже готовые проверки. Если они различают нужные случаи, оставим их. Если тест пропускает ошибку, изменим данные или добавим только недостающую проверку в том же файле."}
        </p>
        <QuizCard
          question={"Что означает GET /tasks без параметра is_done?"}
          options={["Вернуть только открытые задачи", "Не фильтровать по статусу", "Передать в сервис False"]}
          correctIndex={1}
          explanation={"Отсутствующий параметр даёт is_done=None, то есть список обоих статусов. Явное is_done=False выбирает только открытые задачи."}
        />
      </Section>

      <Section number="02" title={"Фильтр, порядок и limit отвечают за разное"}>
        <Lead>
          {"GET /tasks принимает три параметра: is_done выбирает статус, sort_desc задаёт порядок id, limit задаёт размер ответа."}
        </Lead>
        <p>
          {"Если параметров нет, is_done=None не фильтрует по статусу, sort_desc=False сортирует id по возрастанию, а limit=10 оставляет первые десять задач. Явное is_done=False выбирает только открытые задачи. В TestClient передаём query через params; FastAPI разбирает значения как bool и int. В адресе GET /tasks?is_done=false&sort_desc=true&limit=1 те же значения стоят после знака вопроса и разделены амперсандами. Это параметры запроса, а не JSON в теле: метод GET получает критерии выбора рядом с адресом, а не как изменяемую запись."}
        </p>
        <p>
          {"Порядок такой: сначала фильтр, затем сортировка по id, потом limit. В HTTP limit можно задать от 1 до 50. У сервиса select_tasks(limit=None) означает «без ограничения», а GET /tasks без limit возвращает не больше десяти задач. Здесь нет противоречия: сервис умеет вернуть полный список, а маршрут устанавливает безопасный размер ответа по умолчанию. Явное limit=50 просит маршрут показать весь набор из 12 тестовых задач."}
        </p>
        <StepThrough
          code={"books = [\n    {\"title\": \"Atlas\", \"genre\": \"essay\", \"pages\": 180},\n    {\"title\": \"Moss\", \"genre\": \"novel\", \"pages\": 220},\n    {\"title\": \"Rain\", \"genre\": \"novel\", \"pages\": 140},\n]\nnovels = [book for book in books if book[\"genre\"] == \"novel\"]\nordered = sorted(novels, key=lambda book: book[\"pages\"])\nvisible = ordered[:1]"}
          steps={[
            {
              line: 5,
              note: "Сначала оставляем романы. Исходный список не меняется.",
              vars: { novels: "[Moss, Rain]" },
            },
            {
              line: 6,
              note: "Теперь располагаем выбранные книги по числу страниц от меньшего к большему.",
              vars: { novels: "[Moss, Rain]", ordered: "[Rain, Moss]" },
            },
            {
              line: 7,
              note: "Последним действием берём одну первую книгу. В результате остаётся Rain.",
              vars: { ordered: "[Rain, Moss]", visible: "[Rain]" },
            },
          ]}
        />
        <p>
          {"visible содержит результат всех трёх шагов. Проверяем и порядок книг, и их количество. Для задач API действует тот же порядок: фильтр, сортировка, limit."}
        </p>
      </Section>

      <Section number="03" title={"Тестовые данные должны выявлять неверный порядок"}>
        <Lead>
          {"Тест найдёт ошибку, только если правильный и неправильный порядок дадут разные ответы."}
        </Lead>
        <p>
          {"Создадим 12 задач, чтобы проверить limit=10. Последнюю, с наибольшим id, отметим завершённой. Тогда запрос открытых задач по убыванию с limit=1 должен вернуть наибольший открытый id."}
        </p>
        <CodeBlock
          caption={"Подготовка внутри теста с api_service"}
          code={"created = [api_service.add_task(f\"Task {index}\", 2) for index in range(12)]\napi_service.mark_done(created[-1].id)\nall_ids = [task.id for task in created]\nopen_ids = [task.id for task in created[:-1]]\ndone_id = created[-1].id"}
        />
        <p>
          {"open_ids хранит id только открытых задач. Сортировка с reverse=True ставит самый большой id первым, а [:1] оставляет одну запись. Сначала status_code == 200 подтверждает успешный ответ. Затем извлечём id через api_client и сравним его с ожидаемым, а не только проверим длину списка: одна запись с неверным id тоже прошла бы проверку длины. Все ожидаемые id берём из созданных объектов, поэтому тест работает при любом начальном счётчике."}
        </p>
        <p>
          {"Если сначала взять одну задачу, а потом отфильтровать, останется пустой список: первым будет завершённый id. Если завершённая задача стоит в середине, ошибка может остаться незамеченной. Поэтому важно, где она находится. Например, при id 3 (открыта), 4 (завершена), 7 (открыта) запрос открытых по убыванию с limit=1 должен вернуть 7. Сравнение только длины не покажет ошибку, если неверный код вернёт другую одну задачу."}
        </p>
        <PredictOutput
          code={"scores = [7, 4, 9, 6]\nqualifying = [score for score in scores if score > 5]\nvisible = sorted(qualifying, reverse=True)[:2]\nprint(visible)\nprint(len(scores))"}
          output={'[9, 7]\n4'}
          hint={"Сначала оставьте оценки больше пяти, затем упорядочьте их и возьмите первые две."}
        />
        <p>
          {"После фильтра и limit остались две оценки, хотя в исходном списке их четыре. Так же GET /tasks может вернуть часть задач, а stats считает весь список."}
        </p>
        <BugHunt
          code={"selected = sorted(tasks, key=lambda task: task[\"id\"], reverse=True)[:1]\nselected = [task for task in selected if task[\"is_done\"] is False]"}
          question={"При каких данных этот порядок даст неверный ответ?"}
          options={[
            "Все задачи открытые и отсортированы по возрастанию",
            "Задача с наибольшим id завершена, запрос ограничен одной открытой задачей",
            "В наборе одна открытая задача и limit=50",
          ]}
          correctIndex={1}
          explanation={"При убывающей сортировке и limit=1 код сначала оставляет максимальный id. Если он завершён, поздняя фильтрация даст пустой список вместо наибольшего открытого id."}
          fix={"open_tasks = [task for task in tasks if task[\"is_done\"] is False]\nselected = sorted(open_tasks, key=lambda task: task[\"id\"], reverse=True)[:1]"}
        />
      </Section>

      <Section number="04" title={"Список не становится источником статистики"}>
        <Lead>
          {"GET /tasks возвращает выбранные задачи. GET /stats считает все задачи в тестовом файле."}
        </Lead>
        <p>
          {"В тесте есть 12 задач. GET без параметров вернёт первые 10, а total в /stats останется равен 12. Параметр is_done=False меняет только список ответа. Общие числа open и done остаются прежними."}
        </p>
        <Diagram caption={"Оба запроса читают один JSON"}>
          <DiagramFlow label={"Как GET /tasks собирает список ответа"}>
            <DiagramNode title={"Тестовый JSON"} shape="database">
              <p>{"Все задачи"}</p>
            </DiagramNode>
            <DiagramArrow label={"GET /tasks"} />
            <DiagramNode title={"Фильтр"}>
              <p>{"Выбранный статус"}</p>
            </DiagramNode>
            <DiagramArrow label={"затем"} />
            <DiagramNode title={"Сортировка по id"}>
              <p>{"Нужное направление"}</p>
            </DiagramNode>
            <DiagramArrow label={"затем"} />
            <DiagramNode title={"Limit"}>
              <p>{"Число задач в ответе"}</p>
            </DiagramNode>
          </DiagramFlow>
          <DiagramFlow label={"Как GET /stats считает данные"}>
            <DiagramNode title={"Тестовый JSON"} shape="database">
              <p>{"Все задачи"}</p>
            </DiagramNode>
            <DiagramArrow label={"GET /stats"} />
            <DiagramNode title={"Общие числа"}>
              <p>{"Все открытые и завершённые задачи"}</p>
            </DiagramNode>
          </DiagramFlow>
        </Diagram>
        <p>
          {"GET /stats читает все данные и не применяет filter, sort или limit. Поэтому длина ответа GET /tasks и значения /stats могут различаться. Это два представления одного источника: список показывает выбранные записи, а статистика отвечает на вопрос о всём наборе. Если один из двенадцати объектов завершён, фильтр меняет выдачу списка, но не уменьшает общее число задач."}
        </p>
        <p>
          {"До запросов сохраним ответ /stats и байты JSON. После успешных GET сравним их с исходными. Метод read_bytes() читает файл целиком; равные байты подтверждают, что чтение не изменило его."}
        </p>
        <CodeBlock
          caption={"Сохраняем исходный файл"}
          code={"# После подготовки и завершения 12 задач\npath = api_service.storage.path\nstats_before = api_client.get(\"/stats\").json()\nbytes_before = path.read_bytes()\n\n# Здесь выполняются успешные GET-запросы\n\nassert api_client.get(\"/stats\").json() == stats_before\nassert path.read_bytes() == bytes_before"}
        />
        <p>
          {"Снимок stats сравнивает ответ отдельного маршрута, а bytes_before хранит содержимое файла до чтения. Эти проверки не заменяют друг друга: одинаковый счётчик не исключает изменение полей или порядка в JSON, а равные байты сами по себе не объясняют, что endpoint /stats по-прежнему посчитал все записи. Вместе они проверяют результат и источник."}
        </p>
        <TrueFalse
          statement={"Если GET /tasks вернул десять записей, GET /stats тоже должен показать total=10."}
          isTrue={false}
          explanation={"Нет. Десять ограничивает только список. Статистика относится ко всем задачам тестового источника."}
        />
      </Section>

      <Section number="05" title={"Границы limit проверяют отдельно"}>
        <Lead>
          {"Проверим два допустимых края, значения за пределами и текст вместо числа."}
        </Lead>
        <p>
          {"Границы limit уже покрыты запросами: 1 и 50 допустимы, а 0, 51 и many должны дать 422 с причиной limit. Менять приложение не нужно."}
        </p>
        <p>
          {"Сохраним готовый параметризованный тест: pytest запускает одну проверку с разными значениями. Два края показывают, что допустимый интервал включает и 1, и 50. Ноль и 51 проверяют нарушение нижней и верхней границы, а many проверяет значение, которое нельзя разобрать как целое число. Поэтому одного случая 422 недостаточно: важно подтвердить, что тесты покрывают обе причины отказа."}
        </p>
        <MethodGrid
          rows={[
            ["1 и 50", "Запрос успешен: оба края входят в диапазон."],
            ["0 и 51", "422: число вне диапазона."],
            ["many", "422: это значение нельзя прочитать как число."],
          ]}
        />
      </Section>

      <Section number="06" title={"OpenAPI показывает форму, но не выполнение"}>
        <Lead>
          {"OpenAPI описывает маршруты и схемы. TestClient проверяет, что приложение действительно работает так, как описано."}
        </Lead>
        <p>
          {"Запросим /openapi.json через api_client. В документе проверим адреса, методы, статусы, параметры и схемы. У списка is_done необязателен, sort_desc по умолчанию равен False, limit равен 10 и ограничен числами от 1 до 50. В пути task_id обязателен и должен быть больше нуля."}
        </p>
        <p>
          {"OpenAPI похоже на меню: оно описывает доступные операции и их входы. Но только запрос покажет, какой ответ вернуло приложение. Поэтому проверим и описание, и реальные ответы. Документ формируется приложением по зарегистрированным маршрутам и схемам. Он помогает клиенту заранее увидеть допустимые поля и статусы, но наличие записи в документе не означает, что обработчик успешно выполнится на конкретном запросе."}
        </p>
        <MatchPairs
          prompt={"Для чего нужна каждая схема?"}
          leftTitle={"Схема"}
          rightTitle={"Роль"}
          pairs={[
            { left: "TaskCreate", right: "Вход POST: title и priority" },
            { left: "TaskUpdate", right: "Полный вход PUT: title, priority и is_done" },
            { left: "TaskPatch", right: "Частичный вход PATCH без обязательных полей" },
            { left: "TaskRead", right: "Публичный ответ: id, title, priority и is_done" },
          ]}
          explanation={"Схемы задают разные стороны обмена. TaskRead не включает tags, хотя доменная Task сохраняет это поле в JSON."}
        />
        <p>
          {"В components.schemas поле required перечисляет поля, которые нужно передать. Пустой required у TaskPatch позволяет пропустить все поля; properties показывает форму каждой схемы. Например, TaskCreate требует оба поля при создании, а PATCH может получить только одно изменяемое поле. Так можно проверить публичный ответ отдельно от внутренней записи с tags; фактический запрос всё равно проверяется отдельно через HTTP-тест."}
        </p>
        <p>
          {"Эти схемы уже использовались в POST, PUT, PATCH и response_model. Новые схемы не нужны. Проверим, какие поля и операции приложение публикует."}
        </p>
      </Section>

      <Section number="07" title={"Проверяем устойчивые части спецификации"}>
        <Lead>
          {"В OpenAPI четыре адреса и восемь операций. На одном адресе могут работать разные методы."}
        </Lead>
        <p>
          {"Есть четыре адреса: /health, /tasks, /tasks/{task_id} и /stats. На /tasks работают GET и POST; на /tasks/{task_id} работают GET, PUT, PATCH и DELETE. Всего восемь операций, но адресов только четыре. Проверим адреса, методы и успешный статус каждого метода."}
        </p>
        <p>
          {"Параметры GET /tasks находятся рядом с этой операцией. У limit проверим default, minimum и maximum. Параметр task_id ищем у /tasks/{task_id}: он обязателен и положителен; OpenAPI может записать границу как minimum=1 или exclusiveMinimum=0. В responses статусы записаны строками, например \"201\"."}
        </p>
        <CodeBlock
          caption={"Фрагмент существующей проверки OpenAPI"}
          code={"document = api_client.get(\"/openapi.json\").json()\npaths = document[\"paths\"]\nassert set(paths) == {\"/health\", \"/tasks\", \"/tasks/{task_id}\", \"/stats\"}\nassert set(paths[\"/tasks\"]) == {\"get\", \"post\"}\nassert set(paths[\"/tasks/{task_id}\"]) == {\"get\", \"put\", \"patch\", \"delete\"}\n\nexpected_statuses = {\n    \"/health\": {\"get\": \"200\"},\n    \"/tasks\": {\"get\": \"200\", \"post\": \"201\"},\n    \"/tasks/{task_id}\": {\"get\": \"200\", \"put\": \"200\", \"patch\": \"200\", \"delete\": \"204\"},\n    \"/stats\": {\"get\": \"200\"},\n}\nfor path, methods in expected_statuses.items():\n    for method, status in methods.items():\n        assert status in paths[path][method][\"responses\"]\n\nlist_operation = paths[\"/tasks\"][\"get\"]\nquery = {item[\"name\"]: item for item in list_operation[\"parameters\"]}\nassert query[\"is_done\"][\"required\"] is False\nassert query[\"sort_desc\"][\"schema\"][\"default\"] is False\nassert query[\"limit\"][\"schema\"][\"default\"] == 10\nassert query[\"limit\"][\"schema\"][\"minimum\"] == 1\nassert query[\"limit\"][\"schema\"][\"maximum\"] == 50\n\nitem_parameters = {item[\"name\"]: item for item in paths[\"/tasks/{task_id}\"][\"get\"][\"parameters\"]}\ntask_id = item_parameters[\"task_id\"]\nassert task_id[\"required\"] is True\nid_schema = task_id[\"schema\"]\nassert id_schema.get(\"minimum\", 0) >= 1 or id_schema.get(\"exclusiveMinimum\", -1) >= 0\n\nschemas = document[\"components\"][\"schemas\"]\nassert set(schemas[\"TaskCreate\"][\"required\"]) == {\"title\", \"priority\"}\nassert set(schemas[\"TaskUpdate\"][\"required\"]) == {\"title\", \"priority\", \"is_done\"}\nassert set(schemas[\"TaskRead\"][\"properties\"]) == {\"id\", \"title\", \"priority\", \"is_done\"}\nassert schemas[\"TaskPatch\"].get(\"required\", []) == []"}
        />
        <p>
          {"В примере показаны два метода на одном адресе. Так же проверяются методы item-пути, /health и /stats. Статус ищем у конкретного метода и пути. В responses коды записаны строками, например \"201\", потому что это поле JSON-документа. Мы проверяем пару «путь + метод»: код 201 у POST не подтверждает ответ GET на том же /tasks. Словарь expected_statuses делает это соответствие явным для всех восьми операций; отсутствующий метод или неверный код сразу нарушит assertion."}
        </p>
        <p>
          {"Не сравниваем весь документ целиком: он может измениться из-за порядка ключей или внутренних ссылок. Проверяем только нужные поля: методы, статусы, обязательные свойства схем и границы limit."}
        </p>
        <BugHunt
          code={"assert len(document[\"paths\"]) == 8"}
          question={"Почему результат этой проверки неверен?"}
          options={[
            "Она считает только query-параметры",
            "Она принимает число операций за число path-шаблонов",
            "В OpenAPI нет методов DELETE",
          ]}
          correctIndex={1}
          explanation={"Путей четыре. Число восемь получается, если сложить методы на этих путях."}
          fix={"assert len(document[\"paths\"]) == 4\nassert set(document[\"paths\"][\"/tasks\"]) == {\"get\", \"post\"}\nassert set(document[\"paths\"][\"/tasks/{task_id}\"]) == {\"get\", \"put\", \"patch\", \"delete\"}"}
        />
        <p>
          {"Ожидаемые статусы: GET возвращает 200, POST возвращает 201, PUT и PATCH возвращают 200, DELETE возвращает 204. В OpenAPI они находятся в responses каждой операции. Проверка запросом показывает, что приложение возвращает эти ответы."}
        </p>
      </Section>

      <Section number="08" title={"Что мы будем делать в практике"}>
        <Lead>
          {"Работаем в tests/test_contract.py. Используем существующие api_client и api_service."}
        </Lead>
        <LinkedNotes
          variant="connected"
          items={[
            {
              title: "Создадим данные для проверки",
              description: "Добавим 12 задач и завершим последнюю, у которой самый большой id.",
            },
            {
              title: "Проверим список",
              description: "Сверим значения по умолчанию, статусы, порядок id и limit. Убедимся, что фильтр применяется до сортировки и ограничения.",
            },
            {
              title: "Проверим описание API",
              description: "Сверим четыре схемы, четыре адреса, восемь операций, параметры и статусы.",
            },
            {
              title: "Проверим, что чтение ничего не меняет",
              description: "Сравним stats и байты временного JSON до и после GET. Рабочие данные не затрагиваем.",
            },
          ]}
        />
        <p>
          {"Оставим готовые проверки, которые уже дают точный ответ. Если query-тест не замечает неверный порядок, перенесём завершённую задачу и сравним реальные id. В OpenAPI добавим только те проверки, которых ещё нет."}
        </p>
        <p>
          {"После работы tests/test_contract.py подтвердит правила списка, неизменность источника и описание API. Приложение останется прежним. В отдельных проверках Planner проверим модель, хранилище и сервис."}
        </p>
      </Section>
    </RichLesson>
  );
}
