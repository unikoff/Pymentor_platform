import {
  BugHunt,
  Callout,
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
  QuizCard,
  RichHero,
  RichLesson,
  Section,
  StepThrough,
} from "../../shared";

export function Lesson54() {
  return (
    <RichLesson>
      <RichHero
        chip={"ЗАНЯТИЕ 54"}
        title={"Частичное изменение задачи"}
        intro={
          "Добавим в PlannerService операцию patch_task: она меняет переданные поля, сохраняет остальные и проверяет новую Task до записи."
        }
        variant={"project"}
      />

      <Section number={"00"} title={"Поставим PATCH рядом с PUT"}>
        <Lead>
          {"Сравним полную замену и частичное изменение на одной задаче."}
        </Lead>
        <LinkedNotes
          variant={"connected"}
          items={[
            {
              title: "A · Что уже готово",
              description:
                "Есть Task, JsonStorage, _find_task и replace_task. patch_task ещё нет.",
            },
            {
              title: "Что добавим",
              description:
                "Как изменить одно поле и оставить остальные прежними?",
            },
            {
              title: "B · Что должно получиться",
              description:
                "Добавим patch_task: None оставит старое, False применится; новая Task проверится до записи, id, tags и сосед сохранятся.",
            },
          ]}
        />
        <p>
          {"В занятии 53.1 мы подготовили полную форму для replace_task. Теперь добавим частичное изменение в PlannerService. TaskPatch и HTTP-маршрут разберём позже."}
        </p>
      </Section>

      <Section number={"01"} title={"Полная форма и выборочные поля"}>
        <Lead>
          {"При PUT передают всю новую форму. При patch_task можно передать только те поля, которые нужно изменить."}
        </Lead>
        <p>
          {"replace_task получает все три изменяемых поля: title, priority и is_done. Для patch_task можно передать только title. Тогда priority и is_done нужно взять из текущей Task."}
        </p>
        <p>
          {"Представим настройки профиля. Мы меняем имя, а язык и уведомления оставляем как были. В Planner так же выбираются поля, но результатом всё равно будет полная Task."}
        </p>
        <CompareSolutions
          question={
            "Какой подход сохранит текущие поля, когда клиент меняет только title?"
          }
          left={{
            title: "Передать None вместо старых значений",
            code: "return self.replace_task(\n    task_id,\n    title=title,\n    priority=priority,\n    is_done=is_done,\n)",
            note: "None может затереть текущие поля.",
          }}
          right={{
            title: "Сохранить поля, которых нет в запросе",
            code: "new_title = current.title if title is None else title\nnew_done = current.is_done if is_done is None else is_done",
            note: "Сервис подставит старые значения и соберёт Task.",
          }}
          preferred={"right"}
          explanation={"replace_task получает всю форму. patch_task меняет только те поля, для которых передано новое значение."}
        />
      </Section>

      <Section number={"02"} title={"None оставляет поле, False меняет его"}>
        <Lead>
          {"None означает «оставить как было». False тоже нужно применить, хотя в Python это ложное значение."}
        </Lead>
        <p>
          {"Если is_done=None, статус не меняется. Если is_done=False, задача открывается. Проверка `if is_done` потеряет False, потому что Python считает его ложным. Проверяйте именно `is_done is None`."}
        </p>
        <p>
          {"Правило для каждого поля простое: None оставляет старое значение, любое другое значение применяется. False не равен None. Конструктор Task по-прежнему проверяет title и priority."}
        </p>
        <MethodGrid
          rows={[
            [<code>title=None</code>, "Сохраняем прежний title"],
            [<code>is_done=False</code>, "Применяем False и открываем задачу"],
            [<code>priority=4</code>, "Применяем новый приоритет"],
          ]}
        />
        <PredictOutput
          code={
            "settings = {\"email\": True, \"push\": True}\nemail = None\npush = False\n\nif email is not None:\n    settings[\"email\"] = email\nif push is not None:\n    settings[\"push\"] = push\n\nprint(settings)"
          }
          output={"{'email': True, 'push': False}"}
          hint={
            "Сравните две проверки: None оставляет настройку, а False проходит проверку `is not None`."
          }
        />
        <Callout tone={"info"}>
          {"Здесь None означает «оставить старое значение». Позже в TaskPatch мы разберём, чем пропущенное поле отличается от null в JSON."}
        </Callout>
      </Section>

      <Section number={"03"} title={"Собрать итог по каждому полю"}>
        <Lead>
          {"Сервис собирает новую Task: берёт старые поля и заменяет только переданные."}
        </Lead>
        <p>
          {"Выражение `a if условие else b` выбирает `a`, когда условие истинно, иначе выбирает `b`. Для patch проверяем `value is None`, а не истинность самого значения."}
        </p>
        <p>
          {"Если меняем только title, остальные поля берём из current. Если передали is_done=False, оставляем title и priority, но меняем статус. Так получается полная новая Task."}
        </p>
        <p>
          {"Например, у задачи 11 title='Прочитать JSON', priority=3 и is_done=True. При смене только title два других значения останутся прежними. При is_done=False изменится только статус. Эти два случая проверяются во второй карточке практики."}
        </p>
        <p>
          {"Представим три переключателя. Мы меняем один, а два других оставляем как были. В Planner это означает: собрать один полный объект Task из старых и новых значений."}
        </p>
        <StepThrough
          code={
            "current_done = True\npatch_done = False\nupdated_done = current_done if patch_done is None else patch_done\nprint(updated_done)"
          }
          steps={[
            {
              line: 0,
              note: "Исходная Task уже завершена.",
              vars: { current_done: "True" },
            },
            {
              line: 1,
              note: "Аргумент явно содержит False, а не None.",
              vars: { patch_done: "False" },
            },
            {
              line: 2,
              note:
                "Проверка patch_done is None ложна, поэтому выбирается переданное значение.",
              vars: { updated_done: "False" },
            },
            {
              line: 3,
              note: "После частичного изменения задача открыта.",
              vars: { "print(updated_done)": "False" },
            },
          ]}
        />
        <p>
          {"Это правило понадобится в первой карточке практики. Во второй проверим два случая: изменить только title и передать is_done=False."}
        </p>
      </Section>

      <Section number={"04"} title={"Найти адресуемую Task"}>
        <Lead>
          {"Сначала сервис загружает список и находит в нём задачу по id."}
        </Lead>
        <p>
          {"id показывает, какую задачу ищем. index показывает её место в списке. Список загружается, _find_task находит задачу, а tasks.index(current) даёт позицию для замены. После сортировки позиция может измениться, id остаётся прежним."}
        </p>
        <p>
          {"Второй поиск не нужен. Если id отсутствует, _find_task поднимет TaskNotFoundError. Поэтому сначала ищем задачу, даже когда менять нечего."}
        </p>
        <MatchPairs
          prompt={"Соединим действие сервиса и его роль"}
          leftTitle={"Действие"}
          rightTitle={"Результат"}
          pairs={[
            { left: "storage.load()", right: "Актуальный полный список" },
            { left: "_find_task(...)", right: "Task по устойчивому id" },
            { left: "tasks.index(current)", right: "Позиция для замены" },
            { left: "TaskNotFoundError", right: "Ожидаемое отсутствие записи" },
          ]}
          explanation={
            "Сервис ищет задачу в загруженном списке. Если находит, получает её позицию; если нет, возникает TaskNotFoundError."
          }
        />
      </Section>

      <Section number={"05"} title={"Проверить новую Task до изменения списка"}>
        <Lead>
          {"Сначала создаём новую Task. Пока конструктор её проверяет, список ещё не изменён."}
        </Lead>
        <p>
          {"Передайте конструктору прежний id, итоговые поля и копию tags. Priority должен быть от 1 до 5; при priority=6 Task выдаст ошибку до замены записи и вызова save()."}
        </p>
        <p>
          {"Это как проверить черновик карточки перед заменой записи. Если проверка не прошла, исходная Task остаётся. Черновик существует только в памяти."}
        </p>
        <BugHunt
          code={
            "current.title = \"Новое название\"\nself.storage.save(tasks)\nupdated = Task(\n    id=current.id,\n    title=current.title,\n    priority=6,\n    is_done=current.is_done,\n    tags=current.tags.copy(),\n)"
          }
          question={
            "Что пойдёт не так, если сохранить список до проверки priority=6?"
          }
          options={[
            "Список уже сохранён до проверки нового объекта",
            "Копирование tags сразу удаляет исходную задачу",
            "Конструктор Task автоматически добавляет новую запись",
          ]}
          correctIndex={0}
          explanation={"Список уже сохранён до проверки. Сначала создайте и проверьте новую Task, потом замените запись и сохраните список."}
          fix={
            "updated = Task(\n    id=current.id,\n    title=\"Новое название\",\n    priority=6,\n    is_done=current.is_done,\n    tags=current.tags.copy(),\n)\ntasks[index] = updated\nself.storage.save(tasks)"
          }
        />
        <p>
          {"Копия tags сохраняет метки. Клиент их не меняет; id берём из current."}
        </p>
      </Section>

      <Section number={"06"} title={"Заменить одну позицию и сохранить"}>
        <Lead>
          {"После проверки сервис заменяет одну запись и сохраняет весь список через JsonStorage."}
        </Lead>
        <p>
          {"Порядок работы: загрузить список → найти Task → выбрать значения → создать и проверить новую Task → заменить одну позицию → сохранить список → вернуть результат. До проверки исходный список не меняется."}
        </p>
        <p>
          {"PlannerService меняет Task, JsonStorage сохраняет список. Метод возвращает новую Task. Ошибка хранилища остаётся StorageError; откат записи этот метод не выполняет."}
        </p>
        <p>
          {"Сохраняйте весь список, а не одну updated Task, иначе пропадут соседи. Во второй карточке задача с id=4 проверяет, что этого не произошло."}
        </p>
        <Diagram caption={"Частичное изменение внутри PlannerService"}>
          <DiagramFlow label={"Порядок сервисного частичного изменения"}>
            <DiagramNode title={"JsonStorage"} shape={"database"}>
              <p>load() читает полный список</p>
            </DiagramNode>
            <DiagramArrow label={"передать список"} />
            <DiagramNode title={"PlannerService"}>
              <p>Найти current и выбрать значения полей</p>
            </DiagramNode>
            <DiagramArrow label={"проверить до замены"} />
            <DiagramNode title={"Новая Task"}>
              <p>Конструктор проверяет итоговое состояние</p>
            </DiagramNode>
            <DiagramArrow label={"проверка прошла"} />
            <DiagramNode title={"Список Planner"}>
              <p>Заменить одну найденную позицию</p>
            </DiagramNode>
            <DiagramArrow label={"сохранить полный список"} />
            <DiagramNode title={"JsonStorage"} shape={"database"}>
              <p>save() записывает результат</p>
            </DiagramNode>
          </DiagramFlow>
        </Diagram>
        <p>
          {"Проверка идёт до замены. Пустой набор возвращается до save; неизвестный id даёт TaskNotFoundError; ошибка проверки не меняет список. Эти случаи не нужно объединять одним обработчиком."}
        </p>
      </Section>

      <Section number={"07"} title={"Различить пустое изменение и отсутствие задачи"}>
        <Lead>
          {"Для найденной задачи пустой запрос ничего не меняет. Для неизвестного id всё равно возникает TaskNotFoundError."}
        </Lead>
        <p>
          {"После поиска сервис проверяет три поля. Если все равны None, он возвращает current и не вызывает save()."}
        </p>
        <p>
          {"Поиск выполняется до этой проверки. Отсутствующий id не превратится в новую задачу, даже если изменений нет."}
        </p>
        <QuizCard
          question={
            "Куда поставить проверку трёх аргументов на None?"
          }
          options={[
            "После _find_task и до создания новой Task",
            "До storage.load(), чтобы не читать файл",
            "После storage.save(), чтобы проверить результат",
          ]}
          correctIndex={0}
          explanation={
            "Сначала найдите задачу. Тогда пустой запрос можно вернуть без сохранения. Проверка до поиска скроет отсутствующий id, а проверка после save будет слишком поздней."
          }
        />
        <p>
          {"Одинаковый JSON не доказывает, что save() не вызывался. Здесь проверьте ранний return в коде. Счётчик вызовов появится в 55.1."}
        </p>
      </Section>

      <Section number={"08"} title={"Проверить контракт через прямой сервисный тест"}>
        <Lead>
          {"Проверим сервис напрямую, без HTTP. Временный JsonStorage не затронет рабочие данные."}
        </Lead>
        <p>
          {"Создайте две Task в tmp_path. Проверьте результат patch_task, затем откройте тот же файл новым PlannerService. Так мы проверим сохранённую задачу и её соседа."}
        </p>
        <p>
          {"Карточка 1 собирает метод. Карточка 2 проверяет title, False и соседа. Карточка 3 проверяет пустой запрос и ошибки. Карточка 4 открывает тот же файл новым сервисом."}
        </p>
        <Callout tone={"info"}>
          {"Здесь не создаются TaskPatch, body-модель или HTTP PATCH. Следующий шаг оформит входные поля и научит схему сохранять различие между пропущенным полем и явным значением."}
        </Callout>
      </Section>

      <Section number={"09"} title={"Что мы будем делать в практике"}>
        <Lead>
          {"Практика повторит порядок из теории: собрать новую Task, проверить поля, разобрать no-op и ошибки, перечитать сохранённый список."}
        </Lead>
        <LinkedNotes
          variant={"connected"}
          items={[
            {
              title: "1. Собрать Task",
              description:
                "Найти current, выбрать значения и проверить новую Task до save.",
            },
            {
              title: "2. Проверить поля",
              description:
                "Изменить title и is_done=False; сверить id, tags и соседа.",
            },
            {
              title: "3. Проверить пустой запрос и ошибки",
              description:
                "Пустой набор ничего не сохранит; неизвестный id даст TaskNotFoundError.",
            },
            {
              title: "4. Перечитать файл",
              description:
                "Новый PlannerService прочитает полную Task и соседа из того же файла.",
            },
          ]}
        />
        <p>
          {"Старт A: replace_task, Task и JsonStorage уже есть. В этой практике вы добавите patch_task рядом с полной заменой."}
        </p>
        <p>
          {"Результат B: меняются только переданные поля; None оставляет прежнее значение, False применяется, id, tags и сосед сохраняются. Пустой запрос, неизвестный id и ValueError обрабатываются по-разному. Следующая часть добавит TaskPatch и HTTP PATCH."}
        </p>
      </Section>
    </RichLesson>
  );
}
