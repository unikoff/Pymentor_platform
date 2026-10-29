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
            "API уже получает полный список и статистику через прежний Planner, а маршрут чтения одной задачи тоже готов. Здесь добавим выборку в сервис; перед практикой сверим эти опоры в фактическом проекте."
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
            "В этом занятии HTTP-маршруты не меняются: метод PlannerService проверяем напрямую. Он строит отдельный ответ из list_tasks(), а статистика и CLI продолжают читать полный набор."
          }
        </p>
        <p>
          {
            "При подключении HTTP FastAPI передаст query-параметры готовому методу. Здесь важно сохранить list_tasks() для полного списка CLI."
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
            "Оба метода читают через один PlannerService: list_tasks() остаётся полным чтением, а select_tasks() только преобразует его результат. Поэтому новый метод не открывает JSON напрямую и не меняет CLI."
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
            "По умолчанию is_done=None оставляет оба статуса, sort_desc=False упорядочивает id по возрастанию, а limit=None возвращает весь результат. HTTP-default и проверка границ limit появятся отдельно; сервисная сигнатура останется прежней."
          }
        </p>
        <p>
          {
            "list[Task] означает список объектов Task. Мы сравним их id, чтобы увидеть состав и порядок результата."
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
            "sorted вызывает key для каждой задачи и использует id для сравнения. В новом списке остаются те же объекты Task, меняется порядок. reverse=False задаёт возрастание, reverse=True: убывание; sort_desc передаёт это значение в reverse."
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
            "Срез tasks[:limit] берёт начало списка. Например, tasks[:2] возвращает первые две задачи и не меняет исходный список. Если limit=None, срез не нужен: вернём весь подготовленный результат. Значение HTTP по умолчанию разберём отдельно."
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

      <Section number="05" title={"Подготовим самостоятельную практику"}>
        <Lead>
          {"Перед кодом рассчитайте результат, затем реализуйте метод в существующем PlannerService."}
        </Lead>
        <p>
          {"Практика выполняется в редакторе проекта. Сначала проверьте фактическую версию: найдите PlannerService.list_tasks(), его JsonStorage и полный список через прежний CLI. Если структура проекта отличается от JSON-версии StudyHub, остановитесь на сверке входа и используйте подтверждённые имена."}
        </p>
        <p>
          {"Для ручного прогноза возьмите задачи (id, is_done): (8, False), (3, True), (17, True), (5, False). Например, is_done=False, sort_desc=False, limit=1 даёт [5]: сначала остаются 8 и 5, затем они упорядочиваются как 5 и 8, после чего limit берёт первый id."}
        </p>
        <CodeBlock
          caption={"Порядок действий метода"}
          code={
            "tasks = self.list_tasks()\n" +
            "# фильтр по is_done, если он задан\n" +
            "# sorted по task.id с reverse=sort_desc\n" +
            "# срез [:limit], только если limit задан"
          }
        />
        <p>
          {"Самостоятельно напишите весь select_tasks. Проверьте None, True и False, оба направления сортировки, limit=None и limit=1. Используйте разрывы в id: это показывает, что сортируется именно id, а не исходное место задачи."}
        </p>
        <p>
          {"Завершите проверку повторным чтением полного списка, get_statistics(), прежней CLI-командой и JSON. Они должны совпасть с состоянием до выборки. HTTP и query-параметры относятся к отдельной проверке HTTP-выборки."}
        </p>
        <QuizCard
          question={"Что должно произойти с is_done=False?"}
          options={[
            "Сервис оставит только открытые задачи",
            "Фильтр не применится, потому что False считается отсутствием значения",
            "Сервис изменит is_done у задач"
          ]}
          correctIndex={0}
          explanation={"False: заданное значение статуса. Фильтр проверяют через is_done is not None."}
        />
      </Section>

      <Section number="06" title={"План самостоятельной работы"}>
        <Lead>
          {"Сначала предскажите результат, затем напишите метод и проверьте перенос."}
        </Lead>
        <LinkedNotes
          variant="connected"
          items={[
            {
              title: "Рассчитать результат",
              description:
                "Запишите ID после фильтра, сортировки и limit до запуска кода.",
            },
            {
              title: "Написать метод",
              description:
                "Самостоятельно реализуйте select_tasks в существующем PlannerService.",
            },
            {
              title: "Сверить поведение",
              description:
                "Проверьте три состояния фильтра, оба направления и ограничение.",
            },
            {
              title: "Проверить сохранность и перенос",
              description:
                "Сверьте полный список, статистику и JSON; решите новый случай.",
            },
          ]}
        />
        <p>
          {"Ручной прогноз отделяет понимание алгоритма от случайного совпадения с выводом. Если результат не совпал, проверьте по шагам: присутствует ли фильтр, каким ключом сортируются задачи и только ли после этого применяется limit."}
        </p>
        <p>
          {"Для последней проверки придумайте новый набор с другими ID и статусами. Выберите условие, при котором limit до фильтра дал бы неверный ответ, и объясните расхождение. Затем убедитесь, что полный список, статистика и JSON не изменились."}
        </p>
        <PracticeCta
          text={
            "В редакторе PlannerService добавьте select_tasks, сопоставьте его результат с прогнозом и проверьте сохранность данных."
          }
        />
      </Section>
    </RichLesson>
  );
}
