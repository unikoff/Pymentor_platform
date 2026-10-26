import { ArrowDownUp, Database, Filter } from "lucide-react";
import {
  BugHunt,
  Callout,
  CodeBlock,
  CompareSolutions,
  Diagram,
  DiagramArrow,
  DiagramFlow,
  DiagramNode,
  Lead,
  LinkedNotes,
  MatchPairs,
  MethodGrid,
  PredictOutput,
  PracticeCta,
  QuizCard,
  RecallCard,
  RichHero,
  RichLesson,
  Section,
  StepThrough,
  TrueFalse,
} from "../../shared";

export function Lesson49({ module }: { module?: string }) {
  return (
    <RichLesson>
      <RichHero
        chip={module ?? "Глава 3 · Блок 10 · HTTP к готовому Planner"}
        title={"Выборка внутри сервиса"}
        intro={
          "Добавим выборку по статусу, id и limit. CLI сохранит полный список."
        }
        variant="project"
        tags={[
          { icon: <Filter size={14} />, label: "фильтр по статусу" },
          { icon: <ArrowDownUp size={14} />, label: "порядок по id" },
          { icon: <Database size={14} />, label: "чтение без записи" },
        ]}
      />

      <Section number="00" title={"От полного списка к выборке"}>
        <Lead>
          {
            "В 48 мы подключили к FastAPI список и статистику Planner, а в 48.1 научились читать одну задачу по id. Теперь подготовим выборку в самом сервисе."
          }
        </Lead>
        <LinkedNotes
          variant="connected"
          items={[
            {
              title: "Точка старта",
              description:
                "list_tasks() возвращает полный список того же Planner для API и CLI.",
            },
            {
              title: "Новый вопрос",
              description:
                "Как выбрать задачи по статусу, упорядочить по id и ограничить ответ?",
            },
            {
              title: "Результат",
              description:
                "Добавим select_tasks и проверим фильтр, сортировку и limit по порядку.",
            },
          ]}
        />
        <p>
          {
            "GET /tasks пока возвращает весь список, GET /stats считает все задачи, а item-маршрут находит одну задачу. Эти маршруты остаются без изменений. В 49 мы добавим операцию в PlannerService и вызовем её напрямую, без HTTP."
          }
        </p>
        <p>
          {
            "В 49.1 FastAPI прочитает параметры query и передаст их готовому методу. Поэтому сейчас мы проверим сервисную выборку, а полный list_tasks для CLI сохраним."
          }
        </p>
      </Section>

      <Section number="01" title={"Полный список и отдельная операция"}>
        <Lead>
          {
            "list_tasks() читает все задачи. select_tasks() подготовит отдельный список для нового запроса."
          }
        </Lead>
        <MethodGrid
          rows={[
            [
              <code key="list">list_tasks()</code>,
              "Возвращает все задачи, как и раньше.",
            ],
            [
              <code key="select">select_tasks(...)</code>,
              "Выбирает часть списка, не меняя данные.",
            ],
          ]}
        />
        <p>
          {
            "Представим библиотеку: каталог хранит все книги, а отдельная подборка показывает подходящие. Подборка не переставляет и не удаляет книги. Так же select_tasks готовит ответ и не заменяет полный список."
          }
        </p>
        <p>
          {
            "CLI продолжит получать все задачи через list_tasks(). Позже API сможет запросить выборку через select_tasks(). Мы не меняем list_tasks и не читаем JSON из нового метода: так у Planner останется один путь к данным и полный список для CLI."
          }
        </p>
        <CodeBlock
          caption={"Сигнатура новой операции"}
          code={
            "def select_tasks(\n" +
            "    self,\n" +
            "    is_done: bool | None = None,\n" +
            "    sort_desc: bool = False,\n" +
            "    limit: int | None = None,\n" +
            ") -> list[Task]:"
          }
        />
        <p>
          {
            "is_done принимает True, False или None. None значит, что фильтра нет. sort_desc выбирает направление сортировки. limit задаёт число элементов или None, если ограничение не нужно. По умолчанию метод оставляет оба статуса, сортирует id по возрастанию и возвращает весь список. В 49.1 HTTP передаст свои значения, не меняя эти defaults сервиса."
          }
        </p>
        <p>
          {
            "Тип list[Task] в конце сигнатуры означает, что метод возвращает список объектов Task. Это тот же тип данных, с которым уже работает PlannerService. В практике мы оставим этот формат и будем сравнивать id возвращённых задач."
          }
        </p>
        <RecallCard
          question={
            "Какую операцию оставим CLI, если ему нужен полный список Planner?"
          }
          answer={
            <p>
              {
                "list_tasks(). select_tasks() готовит выборку и не заменяет полный список."
              }
            </p>
          }
        />
      </Section>

      <Section number="02" title={"None, True и False задают разные запросы"}>
        <Lead>
          {
            "У фильтра три состояния: без условия, только завершённые или только открытые задачи."
          }
        </Lead>
        <p>
          {
            "is_done=None оставляет оба статуса. is_done=True оставляет завершённые задачи, а is_done=False открытые. None значит «условия нет», False значит «выбрать открытые»."
          }
        </p>
        <p>
          {
            "Например, для статусов [True, False, False] фильтр None оставит все три значения. True вернёт [True], а False вернёт [False, False]. Такие ответы мы проверим в третьей карточке практики."
          }
        </p>
        <p>
          {
            "Проверяем наличие фильтра выражением is_done is not None. Оно срабатывает и для False, поэтому открытые задачи не теряются. Списковое включение создаёт новый список: оно берёт по одной задаче и оставляет только совпадения. Исходный список остаётся прежним."
          }
        </p>
        <CodeBlock
          caption={"Фрагмент фильтра: отбор товаров по скидке"}
          code={
            "if has_discount is not None:\n" +
            "    products = [product for product in products if product.has_discount == has_discount]"
          }
        />
        <p>
          {
            "У обычного выключателя два положения, но у нашего фильтра есть третье: его не задавали. Это None. Если написать if is_done, значение False будет ошибочно выглядеть как отсутствие условия. Проверка is_done is not None сохраняет запрос на открытые задачи."
          }
        </p>
        <MatchPairs
          prompt={"Соединим значение фильтра с составом результата."}
          leftTitle={"is_done"}
          rightTitle={"Что остаётся"}
          pairs={[
            { left: "None", right: "Открытые и завершённые задачи" },
            { left: "True", right: "Только завершённые задачи" },
            { left: "False", right: "Только открытые задачи" },
          ]}
          explanation={
            "None означает, что статус не ограничивает список. True и False являются двумя явными значениями статуса, поэтому каждый из них оставляет только совпадения."
          }
        />
        <TrueFalse
          statement={
            <>{"При is_done=False фильтра нет, потому что False считается пустым значением."}</>
          }
          isTrue={false}
          explanation={
            "False является переданным значением. Проверка is_done is not None включает фильтр и оставляет только открытые задачи."
          }
        />
        <TrueFalse
          statement={
            <>{"При is_done=None список сохраняет оба статуса."}</>
          }
          isTrue={true}
          explanation={
            "None означает отсутствие условия. Поэтому остаются как задачи с is_done=True, так и задачи с is_done=False."
          }
        />
      </Section>

      <Section number="03" title={"Сортируем новый список по нужному признаку"}>
        <Lead>
          {
            "Отсортируем выбранные задачи по id, а не по названию или месту в списке."
          }
        </Lead>
        <p>
          {
            "sorted(list) возвращает новый список в нужном порядке и не переставляет исходный. Параметр key задаёт, какое поле сравнивать: функция из key получает один объект и возвращает признак для сортировки."
          }
        </p>
        <p>
          {
            "У книги есть название и год. Функция by_year возвращает год, поэтому sorted сравнивает книги по нему. В Planner таким признаком будет task.id."
          }
        </p>
        <CodeBlock
          caption={"Фрагмент: сортируем книги по году"}
          code={
            "def by_year(book):\n" +
            "    return book[\"year\"]\n\n" +
            "ordered_books = sorted(books, key=by_year, reverse=True)"
          }
        />
        <p>
          {
            "Если функция нужна один раз, её можно записать как lambda. Выражение lambda book: book[\"year\"] берёт книгу и возвращает её год. Это та же функция by_year в короткой форме. Для задач key будет lambda task: task.id."
          }
        </p>
        <p>
          {
            "sorted вызывает key для каждой задачи и использует полученный id только для сравнения. В ответе остаются те же объекты Task и их поля; меняются только места в новом списке."
          }
        </p>
        <p>
          {
            "reverse=False сортирует по возрастанию, reverse=True по убыванию. В нашем методе sort_desc передаёт это значение в reverse. sorted меняет только порядок нового списка."
          }
        </p>
        <PredictOutput
          code={
            "years = [2019, 2008, 2015]\n" +
            "ascending = sorted(years)\n" +
            "descending = sorted(years, reverse=True)\n" +
            "print(ascending[0], descending[0])"
          }
          output={"2008 2019"}
          hint={"Сначала упорядочим годы по возрастанию, затем по убыванию."}
        />
        <p>
          {
            "На экран попадут первые числа каждого результата: минимум 2008 и максимум 2019. Так мы видим оба направления. В Planner по такому же правилу сравним id."
          }
        </p>
        <CompareSolutions
          question={
            "Как отсортировать по id, не меняя исходный список?"
          }
          left={{
            title: "Переставить элементы на месте",
            code: "books.sort(key=lambda book: book[\"year\"])\nreturn books",
            note:
              "sort переставляет элементы исходного списка.",
          }}
          right={{
            title: "Получить новый список",
            code: "return sorted(books, key=lambda book: book[\"year\"])",
            note:
              "sorted создаёт новый список, исходный порядок сохраняется.",
          }}
          preferred="right"
          explanation={
            "select_tasks возвращает новый результат чтения. Поэтому используем sorted."
          }
        />
      </Section>

      <Section number="04" title={"Сначала подготовим список, потом применим limit"}>
        <Lead>
          {
            "Сначала отфильтруем и отсортируем список. Затем limit возьмёт нужное число задач."
          }
        </Lead>
        <p>
          {
            "Срез tasks[:limit] берёт начало списка. Например, tasks[:2] возвращает первые две задачи и не меняет исходный список. Если limit=None, срез не нужен: вернём весь подготовленный результат. HTTP-default появится отдельно в 49.1."
          }
        </p>
        <p>
          {
            "На наших id полный порядок по возрастанию будет [4, 9, 13]. Фильтр True сначала оставит [9], затем limit=1 вернёт [9]. Если взять limit раньше, срез даст [4], и фильтр True вернёт пустой список. Этот же случай проверит третья карточка."
          }
        </p>
        <p>
          {
            "Порядок важен: фильтр выбирает нужный статус, sorted ставит задачи по id, limit берёт первые результаты. Представим запись на мастер-класс: сначала выберем практикумы, потом отсортируем их по времени и возьмём ближайший. Если ограничить общий список раньше, первым может оказаться доклад, а практикум потеряется."
          }
        </p>
        <Diagram caption={"Как формируется результат select_tasks"}>
          <DiagramFlow label={"Последовательность обработки списка Planner"}>
            <DiagramNode title={"list_tasks()"} shape={"process"}>
              <p>{"Читаем полный список задач"}</p>
            </DiagramNode>
            <DiagramArrow label={"полный список"} />
            <DiagramNode title={"Фильтр по статусу"}>
              <p>{"None оставляет оба статуса, True или False оставляет совпадения"}</p>
            </DiagramNode>
            <DiagramArrow label={"совпадения"} />
            <DiagramNode title={"sorted по id"}>
              <p>{"Создаём новый список в выбранном направлении"}</p>
            </DiagramNode>
            <DiagramArrow label={"готовый порядок"} />
            <DiagramNode title={"limit"}>
              <p>{"Берём начало списка или оставляем его целиком"}</p>
            </DiagramNode>
          </DiagramFlow>
        </Diagram>
        <p>
          {
            "Читайте схему слева направо: полный список, фильтр, сортировка, limit. Каждый шаг передаёт результат следующему; JSON-файл не меняется."
          }
        </p>
        <p>
          {
            "В примере с событиями самый ранний пункт это доклад, а нам нужен практикум. Если взять одно событие до фильтра, ответ будет пустым. Если сначала выбрать практикумы, limit=1 вернёт ближайший. В Planner ту же роль играют статус и id."
          }
        </p>
        <StepThrough
          code={
            "events = [\n" +
            "    {\"name\": \"Доклад\", \"track\": \"talk\", \"start\": 8},\n" +
            "    {\"name\": \"Формы\", \"track\": \"workshop\", \"start\": 11},\n" +
            "    {\"name\": \"Хранилище\", \"track\": \"workshop\", \"start\": 9},\n" +
            "]\n" +
            "picked = [event for event in events if event[\"track\"] == \"workshop\"]\n" +
            "ordered = sorted(picked, key=lambda event: event[\"start\"])\n" +
            "first = ordered[:1]"
          }
          steps={[
            {
              line: 5,
              note:
                "Оставляем два практикума. events не меняется.",
              vars: {
                "events": "[Доклад 8, Формы 11, Хранилище 9]",
                "picked": "[Формы, Хранилище]",
              },
            },
            {
              line: 6,
              note:
                "sorted ставит их по времени: сначала 9, затем 11.",
              vars: {
                "events": "[Доклад 8, Формы 11, Хранилище 9]",
                "picked": "[Формы 11, Хранилище 9]",
                "ordered": "[Хранилище 9, Формы 11]",
              },
            },
            {
              line: 7,
              note:
                "Срез берёт первый элемент готового списка.",
              vars: {
                "events": "[Доклад 8, Формы 11, Хранилище 9]",
                "picked": "[Формы 11, Хранилище 9]",
                "ordered": "[Хранилище 9, Формы 11]",
                "first": "[Хранилище 9]",
              },
            },
          ]}
        />
        <BugHunt
          code={
            "ordered = sorted(events, key=lambda event: event[\"start\"])\n" +
            "first = ordered[:1]\n" +
            "result = [event for event in first if event[\"track\"] == \"workshop\"]"
          }
          question={
            "Почему результат может оказаться пустым?"
          }
          options={[
            "Сначала ограничили общий список, и ранний доклад занял единственное место",
            "sorted всегда возвращает события в обратном порядке",
            "Фильтр по строке track меняет сами события",
          ]}
          correctIndex={0}
          explanation={
            "Сначала взяли один элемент общего списка. Это доклад, поэтому фильтр удалил его."
          }
          fix={
            "picked = [event for event in events if event[\"track\"] == \"workshop\"]\n" +
            "ordered = sorted(picked, key=lambda event: event[\"start\"])\n" +
            "result = ordered[:1]"
          }
        />
        <Callout tone={"info"}>
          <strong>Что остаётся общим.</strong>{" "}
          {
            "select_tasks ограничивает только свой ответ. GET /stats считает все задачи, а CLI получает полный список через list_tasks()."
          }
        </Callout>
      </Section>

      <Section number="05" title={"Проверим сервис отдельно от HTTP"}>
        <Lead>
          {
            "Проверим select_tasks прямым вызовом. FastAPI для этих тестов не нужен."
          }
        </Lead>
        <p>
          {
            "pytest создаёт для tmp_path отдельную временную папку. В ней тест сохранит задачи через JsonStorage и передаст это хранилище в PlannerService. Рабочий JSON не затрагивается."
          }
        </p>
        <p>
          {
            "Выражение tmp_path / \"tasks.json\" строит путь к файлу внутри временной папки. В четвёртой карточке мы сохраним его байты через read_bytes(): это точное содержимое файла. Если байты до и после совпали, выборки не переписали JSON."
          }
        </p>
        <p>
          {
            "Возьмём задачи с id 9, 13 и 4. Завершена только задача 9. Эти данные помогут отдельно проверить статусы, порядок id и limit."
          }
        </p>
        <CodeBlock
          caption={"Изолированное хранилище для прямого теста"}
          code={
            "storage = JsonStorage(tmp_path / \"tasks.json\")\n" +
            "planner = PlannerService(storage)"
          }
        />
        <p>
          {
            "Первая карточка практики создаёт этот helper и проверяет исходный список со статистикой. Следующие карточки проверяют id из select_tasks. В конце мы снова сверим список, статистику и байты файла."
          }
        </p>
        <p>
          {
            "Порядок карточек повторяет порядок работы: сначала подготовить вход, затем написать метод, проверить результаты и в конце проверить сохранность данных. Для каждого шага нужный приём уже показан выше."
          }
        </p>
        <p>
          {
            "Мы тестируем только сервис. В 49.1 проверим, как FastAPI читает query и вызывает этот метод. Здесь тесты охватят оба направления сортировки, limit=None и limit=1."
          }
        </p>
        <QuizCard
          question={
            "Какой объект используем, чтобы проверить select_tasks в этом занятии?"
          }
          options={[
            "PlannerService с JsonStorage на tmp_path",
            "TestClient с запросом к GET /tasks",
            "Отдельный список внутри FastAPI handler",
          ]}
          correctIndex={0}
          explanation={
            "Сначала проверяем прикладной метод напрямую и изолируем его файл. HTTP-границу подключит занятие 49.1."
          }
        />
        <p>
          {
            "Последняя карточка практики сравнит данные до и после вызовов. select_tasks не должен менять полный список, статистику или JSON."
          }
        </p>
      </Section>

      <Section number="06" title={"Что мы будем делать в практике"}>
        <Lead>
          {
            "Создадим прямые тесты, добавим метод и проверим, что прежнее чтение не изменилось."
          }
        </Lead>
        <LinkedNotes
          variant="connected"
          items={[
            {
              title: "Подготовим данные",
              description:
                "Сохраним три задачи с разными статусами и id в tmp_path.",
            },
            {
              title: "Добавим фильтр",
              description:
                "Проверим None, True и False через PlannerService.",
            },
            {
              title: "Соберём порядок и limit",
              description:
                "Проверим порядок по id и limit после фильтра.",
            },
            {
              title: "Сверим прежние чтения",
              description:
                "Убедимся, что list_tasks(), статистика и JSON не изменились.",
            },
          ]}
        />
        <p>
          {
            "Практика повторяет разделы теории: данные и tmp_path разобраны в 05, фильтр в 02, сортировка в 03, limit в 04. Каждый тест сравнит конкретные id или состояние файла."
          }
        </p>
        <p>
          {
            "В 49.1 передадим query готовому select_tasks. Там появятся HTTP-default 10 и границы limit от 1 до 50. Алгоритм не переписываем; list, stats, item и CLI остаются прежними."
          }
        </p>
        <PracticeCta
          text={
            "Добавим select_tasks и проверим его прямыми тестами на временном JSON."
          }
        />
      </Section>
    </RichLesson>
  );
}
