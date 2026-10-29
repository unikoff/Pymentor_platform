import { CheckCircle2, ListChecks } from "lucide-react";
import {
  BugHunt,
  Callout,
  CodeBlock,
  Diagram,
  DiagramArrow,
  DiagramFlow,
  DiagramNode,
  Lead,
  LinkedNotes,
  MatchPairs,
  PracticeCta,
  QuizCard,
  RichHero,
  RichLesson,
  Section,
  StepThrough,
  TrueFalse,
} from "../../shared";

export function Lesson38_1({ module }: { module?: string }) {
  return (
    <RichLesson>
      <RichHero
        variant="project"
        chip={module ?? "Месяц 2 · Блок 8"}
        title="Свежая fixture и параметризация"
        intro="Первые pytest-проверки уже защищают Task, MemoryStorage и PlannerService. Уберём повтор подготовки, сохраним каждому тесту свои экземпляры и объединим только те варианты, которые проверяют одно правило."
        tags={[
          { icon: <CheckCircle2 size={14} />, label: "свежие fixtures" },
          { icon: <ListChecks size={14} />, label: "параметры одного правила" },
        ]}
      />

      <Section number="00" title="Повтор подготовки не должен связывать тесты">
        <Lead>
          В первых тестах мы создавали MemoryStorage и PlannerService прямо в Arrange. Такой код делает путь зависимости
          видимым, но одна и та же настройка начинает повторяться. Одновременно важно не дать изменяемым объектам
          перетекать между тестами.
        </Lead>
        <LinkedNotes
          variant="connected"
          items={[
            {
              title: "Точка старта",
              description: "У нас есть тесты Task, MemoryStorage и PlannerService с явной подготовкой каждого сценария.",
            },
            {
              title: "Новый вопрос",
              description: "Как вынести повторяемое создание объектов и оставить каждому тесту независимое состояние?",
            },
            {
              title: "Результат",
              description: "Свежие fixtures подготовят зависимости, а небольшие наборы параметров проверят одно правило на разных входах.",
            },
          ]}
        />
        <CodeBlock
          caption="До fixture: две независимые подготовки"
          code={'def test_add_item():\n    items = []            # Arrange\n    items.append("A")     # Act\n    assert items == ["A"] # Assert\n\n\ndef test_starts_empty():\n    items = []            # Arrange\n    assert items == []    # Assert'}
        />
        <p>
          Здесь повторяется создание пустого списка, но действие <code>append</code> нужно только первому тесту.
          Если добавить его в общую подготовку, второй тест перестанет проверять пустое начало. В Planner точно так же
          вынесем конструкторы, а добавление задач и ожидания оставим в сценариях.
        </p>
        <Callout tone="info">
          Проверьте себя до изучения pytest: если заменить два выражения <code>items = []</code> одним глобальным
          <code>items = []</code>, второй тест начнёт зависеть от того, запускался ли первый. Независимость означает,
          что начальные данные каждого сценария определяются его собственной подготовкой. Порядок выполнения тестов
          больше не должен менять ожидаемый ответ.
        </Callout>
      </Section>

      <Section number="01" title="Fixture готовит условие, тест проверяет поведение">
        <Lead>
          В каждом тесте есть подготовка, действие и ожидание результата. В знакомой форме Arrange–Act–Assert часть
          Arrange создаёт данные и зависимости, Act вызывает ровно нужное поведение, а Assert сравнивает наблюдение с
          договором. Если несколько тестов создают одинаковую память и один и тот же сервис, подготовку можно назвать
          отдельно, не вынося туда само проверяемое действие.
        </Lead>
        <p>
          Fixture в pytest является обычной функцией, помеченной декоратором pytest.fixture. Она возвращает значение,
          которое понадобится тесту. Например, одна fixture может создать MemoryStorage, а другая использовать его,
          чтобы собрать PlannerService. Это не особый storage и не новый объектный фреймворк: классы и передача
          зависимости работают так же, как раньше.
        </p>
        <Callout tone="info">
          Синтаксис состоит из трёх частей: <code>import pytest</code> подключает библиотеку,
          <code>@pytest.fixture</code> отмечает функцию подготовки, а параметр теста с тем же именем запрашивает
          её результат. <code>return</code> передаёт объект тесту; <code>print</code> его не заменяет.
        </Callout>
        <CodeBlock
          caption="fixture для одного значения"
          code={'import pytest\n\n\n@pytest.fixture\ndef memory_storage():\n    return MemoryStorage()\n\n\ndef test_empty_storage_is_empty(memory_storage):\n    assert memory_storage.load() == []'}
        />
        <p>
          Имя параметра теста совпадает с именем fixture. Мы не вызываем memory_storage() внутри теста: pytest видит
          запрошенное имя, выполняет подготовку и передаёт возвращённый объект как аргумент. Поэтому fixture должна
          возвращать значение, которым сценарий действительно пользуется, а не печатать его или делать проверку за
          тест.
        </p>
        <Callout tone="info">
          Если pytest сообщает <code>fixture 'memory_storage' not found</code>, сначала проверьте написание имени и
          доступность определения в тестовом файле. В обычном вызове теста pytest сам передаёт аргумент: вручную
          вызывать fixture из теста не требуется.
        </Callout>
        <QuizCard
          question="Где остаётся проверяемое действие после появления fixture?"
          options={[
            "В теле теста между подготовкой и ожиданием",
            "Внутри fixture, которая заранее вызывает все методы сервиса",
            "В декораторе pytest.fixture",
          ]}
          correctIndex={0}
          explanation="Мы выносим подготовку, но сохраняем Act и Assert в тесте. По его телу по-прежнему видно, какой договор проверяется."
        />
      </Section>

      <Section number="02" title="Свежий scope не означает глубокую копию">
        <Lead>
          По умолчанию pytest создаёт обычную fixture с function scope: её значение готовится для каждого отдельного
          тестового вызова. В параметризованном тесте каждый набор аргументов также становится отдельным запуском.
          Тесты получают независимую отправную точку и могут выполняться отдельно или вместе без зависимости от
          соседнего сценария.
        </Lead>
        <CodeBlock
          caption="Два имени у одного списка"
          code={'first = []\nsecond = first\nfirst.append("A")\n\nassert second == ["A"]  # second видит изменение'}
        />
        <p>
          <code>second = first</code> копирует ссылку, а не список. Такой же эффект возникает, если fixture каждый
          раз возвращает глобальный <code>shared_storage</code>. Pytest заново вызывает функцию fixture, но все вызовы
          получают один старый экземпляр. Для свежести создавайте <code>MemoryStorage()</code> внутри функции.
        </p>
        <BugHunt
          code={'shared_storage = MemoryStorage()\n\n@pytest.fixture\ndef memory_storage():\n    return shared_storage'}
          question="Что связывает тесты в этом примере?"
          options={[
            "Каждый запуск возвращает одну общую ссылку, созданную до тестов",
            "pytest запрещает fixtures без параметров",
            "MemoryStorage всегда читает данные с диска",
          ]}
          correctIndex={0}
          explanation="Общий MemoryStorage создан до запуска тестов. Каждый вызов fixture возвращает одну и ту же ссылку. Новый MemoryStorage нужно создавать внутри fixture."
          fix={'@pytest.fixture\ndef memory_storage():\n    return MemoryStorage()'}
        />
        <CodeBlock
          caption="Новый внешний список, прежняя вложенная Task"
          code={'task = Task(1, "Python")\nfirst = [task]\nsecond = list(first)  # новый список, та же Task\n\nfirst[0].is_done = True\nassert second[0].is_done is True'}
        />
        <Callout tone="info">
          <code>first</code> и <code>second</code> здесь разные списки, но внутри лежит один объект
          <code>Task</code>. Копирование контейнера не создаёт новую Task. Поэтому проверки независимых
          <code>tags</code> выполняем на двух отдельно созданных задачах. Это свойство ссылок Python, а не
          обещание конкретной реализации <code>MemoryStorage</code>.
        </Callout>
        <p>
          На практике плохой тест с общим объектом иногда проходит сам по себе и падает при запуске всего файла:
          предыдущий сценарий успел что-то добавить в память. Исправление состоит в создании нового объекта для
          каждого тестового вызова. Очистка глобального списка после проверки хрупка: если тест оборвётся раньше
          очистки, следующий всё равно может получить чужое состояние.
        </p>
        <TrueFalse
          statement={<>Если fixture имеет function scope, pytest глубоко копирует каждый объект внутри её результата.</>}
          isTrue={false}
          explanation="Мы получаем новый результат fixture только если сама подготовка создаёт нужные новые объекты. pytest не копирует внутренние Task и списки автоматически."
        />
      </Section>

      <Section number="03" title="Fixture может запросить другую fixture">
        <Lead>
          Две связанные зависимости лучше готовить в явном порядке. Fixture сервиса принимает memory_storage как
          параметр, поэтому pytest сначала разрешает эту зависимость, а затем вызывает функцию подготовки сервиса.
          Сервис получает тот же экземпляр MemoryStorage, который вернула первая fixture.
        </Lead>
        <p>
          В нашем примере граф объектов читается снизу вверх: fixture памяти создаёт storage, fixture сервиса получает
          его и создаёт PlannerService, а функция теста получает готовый service. Стрелки показывают именно передачу
          возвращённых значений. Они не означают, что pytest меняет состав классов или выбирает реализацию хранения
          вместо приложения.
        </p>
        <Diagram caption="Передача зависимостей одному тесту" orientation="vertical">
          <DiagramFlow label="От fixture storage к функции теста" orientation="vertical">
            <DiagramNode title="Fixture memory_storage">
              <p>Создаёт новый MemoryStorage</p>
            </DiagramNode>
            <DiagramArrow label="возвращает storage" />
            <DiagramNode title="Fixture service">
              <p>Создаёт PlannerService с этим экземпляром</p>
            </DiagramNode>
            <DiagramArrow label="возвращает service" />
            <DiagramNode title="Функция теста">
              <p>Получает service как параметр</p>
            </DiagramNode>
          </DiagramFlow>
        </Diagram>
        <p>
          Если тест запросил service и memory_storage одновременно, pytest использует один результат memory_storage
          внутри этого тестового запуска. Благодаря этому можно вызвать service.add_task, а затем проверить сохранённое
          состояние через тот же memory_storage. В следующем тесте обычная fixture создаст уже другую память и другой
          сервис.
        </p>
        <StepThrough
          code={'@pytest.fixture\ndef memory_storage():\n    return MemoryStorage()\n\n@pytest.fixture\ndef service(memory_storage):\n    return PlannerService(memory_storage)\n\ndef test_add_task(service, memory_storage):\n    created = service.add_task("Python")\n    assert created.title == "Python"\n    assert [task.title for task in memory_storage.load()] == ["Python"]'}
          steps={[
            { line: 8, note: "pytest обнаруживает параметры теста и разрешает service и memory_storage." },
            { line: 5, note: "Для service сначала нужна fixture memory_storage, поэтому выполняется её подготовка." },
            { line: 2, note: "Создаётся новый контейнер; именно эту ссылку pytest передаст дальше." },
            { line: 6, note: "Fixture сервиса получает результат memory_storage и передаёт его конструктору PlannerService." },
            { line: 8, note: "Обе fixtures теперь доступны тесту; запрошенная зависимость storage одна и та же." },
            { line: 9, note: "Начинается Act: тест добавляет задачу через публичный метод сервиса." },
            { line: 10, note: "Первый Assert проверяет возвращённый объект: заголовок соответствует вводу." },
            { line: 11, note: "Второй Assert наблюдает запись через ту же память, которую получил сервис." },
          ]}
        />
        <p>
          Внутри одного запуска pytest сохраняет уже подготовленный результат fixture. Поэтому оба аргумента
          <code>service</code> и <code>memory_storage</code> связаны с одной памятью. При следующем запуске
          pytest построит новые экземпляры. Здесь не нужны более широкие scopes или автоматические fixtures.
        </p>
      </Section>

      <Section number="04" title="Сохраняем смысл теста при рефакторинге">
        <Lead>
          Fixture должна убирать только повтор. Когда мы переносим её в существующие тесты, сам проверяемый сценарий
          остаётся на прежнем месте: тот же вход, то же действие и то же ожидаемое последствие. Так изменения тестового
          кода не становятся случайным изменением договора Planner.
        </Lead>
        <p>
          До переноса сравним несколько тестов сервиса и выделим только одинаковое создание MemoryStorage и
          PlannerService. Если в одном тесте задача уже должна быть добавлена для поиска, это предметная подготовка
          именно поиска и остаётся в этом тесте. Fixture общего назначения не должна прятать причину, по которой
          подготовленные данные нужны.
        </p>
        <CodeBlock
          caption="До: создание зависимостей повторяется в тесте"
          code={'def test_add_task():\n    storage = MemoryStorage()\n    service = PlannerService(storage)\n    created = service.add_task("Python", priority=3)\n    assert created.title == "Python"'}
        />
        <p>
          После переноса первые две строки станут общей подготовкой, а проверка останется прежней. Для теста поиска
          добавление искомых задач остаётся в его теле: без этих данных именно этот сценарий нечего проверять.
          Перенос <code>add_task</code> в fixture для всех тестов сломал бы тест пустого списка.
        </p>
        <CodeBlock
          caption="одна подготовка, отдельное действие"
          code={'@pytest.fixture\ndef service(memory_storage):\n    return PlannerService(memory_storage)\n\n\ndef test_add_task(service):\n    created = service.add_task("Python", priority=3)\n\n    assert created.title == "Python"\n\n\ndef test_list_tasks(service):\n    service.add_task("README")\n\n    assert [task.title for task in service.list_tasks()] == ["README"]'}
        />
        <p>
          В первом тесте мы наблюдаем возвращённую задачу, во втором сначала добавляем предметную запись, а затем
          проверяем список. Обе функции используют один тип подготовки, но их действия и утверждения не смешиваются.
          Unknown id тоже остаётся отдельной проверкой: она должна подтвердить TaskNotFoundError и отсутствие
          изменения состояния, а не затеряться среди успешных примеров.
        </p>
        <Callout tone="info">
          Сравните тест до и после переноса: вход <code>"Python"</code>, вызов <code>add_task</code> и проверка
          <code>created.title</code> совпадают. Изменилось только место создания зависимостей. Если после
          рефакторинга исчез исходный <code>assert</code> или появился заранее добавленный Task, мы изменили смысл
          теста. Такой рефакторинг нельзя считать успешным даже при зелёном результате запуска.
        </Callout>
        <MatchPairs
          prompt="Соединим элемент теста с его ответственностью."
          leftTitle="Элемент"
          rightTitle="Ответственность"
          pairs={[
            { left: "Fixture memory_storage", right: "Создать новое тестовое хранилище" },
            { left: "Fixture service", right: "Собрать сервис с переданным storage" },
            { left: "Act", right: "Вызвать проверяемую операцию" },
            { left: "Assert", right: "Сопоставить наблюдение с договором" },
          ]}
          explanation="Мы держим подготовку, действие и ожидание различимыми. Fixture связывает объекты, а тест показывает, что именно доказывает сценарий."
        />
      </Section>

      <Section number="05" title="Параметризуем варианты одного правила">
        <Lead>
          Иногда два или несколько тестов отличаются лишь значением входа, а правило и форма ожидания у них одинаковы.
          pytest.mark.parametrize позволяет описать такие входы таблицей: каждая строка содержит значения параметров
          одного запуска, pytest отдельно выполняет тест для каждой строки.
        </Lead>
        <p>
          Декоратор задаёт имена и значения параметров. Pytest создаёт отдельный запуск на каждую строку таблицы,
          а function-scoped fixtures этого запуска тоже готовятся заново. Для границ допустимого <code>priority</code>
          достаточно двух значений, <code>1</code> и <code>5</code>; отказ за границами проверяем другим тестом.
        </p>
        <CodeBlock
          caption="две отдельные стороны диапазона"
          code={'@pytest.mark.parametrize("priority", [1, 5])\ndef test_task_accepts_priority_boundaries(priority):\n    task = Task(1, "Python", priority=priority)\n    assert task.priority == priority\n\n\n@pytest.mark.parametrize("priority", [0, 6])\ndef test_task_rejects_priority_outside_range(priority):\n    with pytest.raises(ValueError):\n        Task(1, "Python", priority=priority)'}
        />
        <p>
          Имя "priority" внутри декоратора должно совпадать с параметром функции. Значения из списка подставляются
          по очереди. Мы используем разные имена тестов, потому что первая функция проверяет принятие границ, а вторая
          их отклонение. В отчёте pytest видна строка, на которой сценарий не совпал с ожиданием.
        </p>
        <p>
          Можно аналогично проверить несколько названий, которые после нормализации становятся пустыми: пробелы и
          пустая строка нарушают один и тот же договор title. Для поиска можно подготовить Python и README, а затем
          проверить несколько запросов с разным регистром и соответствующими результатами. Каждый набор параметров
          должен иметь одну ясную причину ожидания.
        </p>
        <CodeBlock
          caption="Один договор: пустой title недопустим"
          code={'@pytest.mark.parametrize("title", ["", "   "])\ndef test_task_rejects_blank_title(title):\n    with pytest.raises(ValueError):\n        Task(1, title)'}
        />
        <QuizCard
          question="Какие примеры удобнее объединить одной параметризацией?"
          options={[
            "Граничные priority 0 и 6, оба должны давать ValueError",
            "Неизвестный id и успешное завершение задачи",
            "Добавление задачи и форматирование CLI",
          ]}
          correctIndex={0}
          explanation="Мы объединяем входы, которые проверяют один договор и имеют одинаковую форму ожидания. Разные действия сохраняют отдельные тесты."
        />
        <Callout tone="info">
          Если в декораторе написано <code>"priority"</code>, тест обязан принимать параметр
          <code>priority</code>. Для двух значений pytest покажет два случая, например с суффиксами
          <code>[1]</code> и <code>[5]</code>. При ошибке одного случая сразу видно проблемный вход.
          Параметры не превращаются в цикл внутри теста: каждый случай запускает всю тестовую функцию отдельно.
        </Callout>
        <CodeBlock
          caption="варианты одного поискового договора"
          code={'@pytest.mark.parametrize(\n    ("query", "expected_titles"),\n    [("PYTHON", ["Python"]), ("ReAdMe", ["README"])],\n)\ndef test_search_is_case_insensitive(service, query, expected_titles):\n    service.add_task("Python")\n    service.add_task("README")\n\n    found = service.search_tasks(query)\n    assert [task.title for task in found] == expected_titles'}
        />
        <p>
          Здесь два параметра подставляются парой: <code>query</code> и <code>expected_titles</code>.
          Оба входа проверяют регистронезависимый поиск; ожидаемые заголовки при этом разные. Исходные задачи
          добавляются в каждом запуске, поэтому второй вариант не наследует данные первого.
        </p>
      </Section>

      <Section number="06" title="Связанные ошибки и изменения остаются самостоятельными">
        <Lead>
          Неизвестный идентификатор и изменение объекта не превращаются в две строки одной таблицы только потому,
          что их можно перечислить. Для неизвестного id мы ожидаем конкретный TaskNotFoundError и отсутствие побочного
          изменения; для mark_done проверяем переход выбранной задачи и состояние другого объекта.
        </Lead>
        <p>
          Аналогично независимость tags лучше проверить на двух новых Task в одном понятном сценарии. Сначала обе
          задачи получают свой default_factory, затем мы меняем список первой и наблюдаем пустой список второй. Новый
          service fixture сам по себе этого свойства не доказывает: он создаёт сервис и storage, а тест должен назвать
          проверяемое правило модели.
        </p>
        <CodeBlock
          caption="Две отдельные Task с независимыми tags"
          code={'def test_tags_are_independent():\n    first = Task(1, "Python")\n    second = Task(2, "Tests")\n    first.tags.append("pytest")\n\n    assert first.tags == ["pytest"]\n    assert second.tags == []'}
        />
        <p>
          Этот тест защищает <code>default_factory</code> модели Task: изменение списка <code>first.tags</code>
          не должно затронуть <code>second.tags</code>. Ему не нужен сервис, потому что правило относится к самой
          модели. Отдельный тест отказа сервиса должен проверить ещё и сохранность данных после исключения.
        </p>
        <StepThrough
          code={'def test_unknown_id_keeps_state(service):\n    service.add_task("Python")\n    before = [task.title for task in service.list_tasks()]\n    with pytest.raises(TaskNotFoundError):\n        service.get_task(999)\n    after = [task.title for task in service.list_tasks()]\n    assert after == before'}
          steps={[
            { line: 1, note: "Arrange: добавляем одну известную задачу, чтобы было что сохранить при отказе." },
            { line: 2, note: "Снимок до вызова нужен для сравнения состояния." },
            { line: 3, note: "Ожидаем именно TaskNotFoundError, а не любую ошибку." },
            { line: 4, note: "Act: запрашиваем неизвестный id; pytest проверяет тип исключения." },
            { line: 5, note: "После отказа снова читаем список из сервиса." },
            { line: 6, note: "Assert: существующие задачи остались теми же." },
          ]}
        />
        <p>
          Для <code>mark_done</code> нужен ещё один тест: завершить первую из двух задач и подтвердить, что вторая
          осталась незавершённой. Нельзя объединить его с неизвестным id только ради одной таблицы: действия и
          ожидаемые результаты отличаются. Запускайте выбранные тесты по отдельности и вместе, чтобы проверить
          независимость от порядка.
        </p>
        <Callout tone="info">
          Проверку проводим из корня учебного проекта: сначала <code>python -m pytest tests/test_models.py -q</code>,
          затем <code>python -m pytest tests/test_services.py -q</code> и <code>python -m pytest -q</code>.
          Все три запуска должны пройти. Если только общий запуск падает, найдите первое изменение состояния,
          которое могло перейти между тестами. Успех отдельного теста ещё не доказывает отсутствие общих ссылок.
        </Callout>
      </Section>

      <Section number="07" title="Что мы будем делать в практике">
        <Lead>
          Мы изменим только организацию уже существующих in-memory проверок. Ожидания к Task, MemoryStorage и
          PlannerService сохранят смысл; новый файловый слой и CLI-тесты не появятся раньше своей последовательности.
        </Lead>
        <LinkedNotes
          variant="connected"
          items={[
            {
              title: "Подготовим свежие зависимости",
              description: "Fixtures создадут MemoryStorage и PlannerService для отдельного запуска теста.",
            },
            {
              title: "Соберём близкие варианты",
              description: "Границы, неверные значения и запросы поиска проверят по одному предметному правилу.",
            },
            {
              title: "Сохраним отдельные сценарии",
              description: "Неизвестный id, изменения состояния и независимые tags останутся видимыми проверками.",
            },
            {
              title: "Сверим порядок запуска",
              description: "Выбранные проверки и полный набор дадут согласованные результаты по отдельности и вместе.",
            },
          ]}
        />
        <p>
          Мы начнём с готовых тестов и сверим их предметные ожидания до рефакторинга. Затем вынесем только повторяющуюся
          сборку объектов, проверим те же действия и применим параметризацию к входам с одинаковым правилом. Результат
          подтверждается самостоятельным и общим запуском набора, а не только более коротким файлом.
        </p>
        <p>
          Это завершит независимые проверки в памяти. В следующем занятии те же идеи свежей подготовки перейдут на
          файловый ресурс: отдельный tmp_path позволит проверить JsonStorage и восстановление без обращения к рабочей
          базе приложения.
        </p>
        <PracticeCta text="Перейдите к существующим тестам и сделайте подготовку свежей, не меняя договоры Planner." />
      </Section>
    </RichLesson>
  );
}
