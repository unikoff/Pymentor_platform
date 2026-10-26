import { Clock3, Database, Terminal } from "lucide-react";
import {
  BugHunt,
  Callout,
  CodeBlock,
  Diagram,
  DiagramArrow,
  DiagramFlow,
  DiagramLane,
  DiagramNode,
  Lead,
  LinkedNotes,
  QuizCard,
  RecallCard,
  RichHero,
  RichLesson,
  Section,
  StepThrough,
} from "../../shared";

const BLOCK_TITLE = "Этап 4 · Блок 14 · Подготовка базы и новой границы хранения";

export function Lesson70_1({ module }: { module?: string }) {
  return (
    <RichLesson>
      <RichHero
        variant="project"
        chip={module ?? BLOCK_TITLE}
        title={"Ресурс на один запрос"}
        intro={"Ограничим срок жизни SQLAlchemy Session одним запросом или одной CLI-командой, сохранив JSON рабочим путём Planner."}
        tags={[
          { icon: <Database size={14} />, label: "фабрика Session и Session" },
          { icon: <Clock3 size={14} />, label: "область ресурса" },
          { icon: <Terminal size={14} />, label: "FastAPI и CLI" },
        ]}
      />

      <Section number="00" title={"От подготовленного SQL-чтения к владельцу ресурса"}>
        <Lead>
          {"После подготовки базы и SQL-чтения у нас есть возможность выполнить знакомый GET по id через отдельный SQL-путь. Но у каждой открытой Session должен быть понятный владелец: кто выдаст её обработчику и кто закроет после работы?"}
        </Lead>

        <LinkedNotes
          variant="connected"
          items={[
            {
              title: "Точка старта",
              description: "По целевой опоре предыдущих занятий фабрика Session создаёт отдельные сессии, а SqlTaskRepository умеет читать список и задачу. Обычный API и CLI всё ещё получают полный сервис через JSON.",
            },
            {
              title: "Новый вопрос",
              description: "Как дать Session одному HTTP-запросу или одной CLI-команде и освободить её, даже если чтение завершилось ошибкой?",
            },
            {
              title: "Результат",
              description: "FastAPI получает ресурс через yield-зависимость, CLI использует контекст одной команды, а SQL остаётся изолированной проверкой.",
            },
          ]}
        />

        <p>
          {"Сначала разберём границу между Session, транзакцией и долгоживущей фабрикой. Затем проследим, как Python и FastAPI выполняют завершающий код, и отдельно увидим, почему CLI управляет ресурсом сам. В конце подключим узкий тестовый путь к знакомому GET и сохраним прежний JSON-поведенческий маршрут."}
        </p>
      </Section>

      <Section number="01" title={"Session и транзакция отвечают за разное"}>
        <Lead>
          {"Для безопасной области важно различать три вещи: инфраструктуру подключения, объект разговора с базой и отрезок, в котором подтверждаются изменения."}
        </Lead>

        <p>
          {"Engine связывает приложение с базой и управляет пулом соединений. Фабрика Session, созданная через sessionmaker, хранит настройки этой связи и выдаёт новые Session. Session представляет одну работу с ORM: держит загруженные объекты, отслеживает их состояние и направляет запросы. Это не файл SQLite, не само физическое соединение и не PlannerService. Фабрика может жить всё время работы приложения; созданная ею Session принадлежит конкретному действию."}
        </p>

        <p>
          {"Транзакция описывает, какие изменения базы будут приняты вместе или отменены вместе. Она может начаться при первом обращении Session к базе. commit подтверждает изменения, rollback отменяет текущие изменения, а close освобождает ресурсы Session. Поэтому время жизни Session и время жизни транзакции связаны, но не совпадают. Закрытие не является скрытой командой commit. В этой части маршрута мы выполняем чтение, а решение о записи и транзакции не прячем в очистку."}
        </p>

        <p>
          {"Можно представить библиотеку. Engine похож на здание с общей системой обслуживания, а фабрика Session на стойку, которая оформляет новый визит. Session похожа на карточку текущего визита: в ней отмечено, какие записи уже загружены и какие изменения подготовлены. Но карточка визита не равна решению библиотекаря подтвердить изменения в каталоге. В коде этим решением остаётся явная транзакционная операция."}
        </p>

        <p>
          {"Session не нужно создавать один раз на всё приложение и класть в app.state: тогда параллельные запросы начнут делить один изменяемый объект. Вместо этого мы храним долгоживущими Engine и фабрику, а Session создаём на ограниченную работу. После закрытия мы больше не передаём её сервису и не используем ORM-объекты, которым ещё требуется обратиться к базе."}
        </p>

        <RecallCard
          question={"Вспомним различие: что закрывает ресурсную область, а что определяет исход изменений?"}
          hint={"Сравним Session и транзакцию по их назначению."}
          answer={
            <p>
              {"Session ограничивает разговор с базой и удерживаемые ресурсы. commit или rollback задают исход транзакции. Освобождение Session само по себе не подтверждает изменения."}
            </p>
          }
        />

        <QuizCard
          question={"Какой объект обычно разделяют между операциями, а какой создают отдельно?"}
          options={[
            "Один Engine и фабрику Session, отдельную Session на каждое действие.",
            "Одну Session на всё приложение, новый Engine на каждый запрос.",
            "Один PlannerService на каждую строку базы, одну Session на все команды.",
          ]}
          correctIndex={0}
          explanation={"Engine и фабрика Session служат общей инфраструктурой. Session содержит состояние текущей работы, поэтому её область ограничивают одним запросом или командой."}
        />

        <Callout tone="info">
          {"В примерах чтения не добавляем commit в get_db или закрывающий контекст. Позже операции записи будут задавать транзакционную границу явно."}
        </Callout>
      </Section>

      <Section number="02" title={"yield передаёт ресурс и оставляет место для завершения"}>
        <Lead>
          {"Обычный return отдаёт значение и завершает функцию. Генераторный yield выдаёт значение, приостанавливает функцию, а затем позволяет выполнить продолжение."}
        </Lead>

        <p>
          {"Для ресурса важны обе половины: код до yield подготавливает объект, само yield передаёт его потребителю, а код после него выполняется при завершении области. Если обернуть yield в try/finally, завершающее действие сработает при обычном выходе и при раскрутке ошибки. Это позволяет гарантировать close, не превращая зависимость в место, где незаметно меняются данные."}
        </p>

        <p>
          {"В примере мы попросим contextlib сделать из генератора менеджер контекста. Когда начинается with, генератор доходит до yield и отдаёт метку. Тело with работает с ней. Когда тело заканчивается, менеджер продолжает генератор, и finally отмечает освобождение. Мы наблюдаем последовательность событий, а не подключаем базу и не вызываем FastAPI вручную."}
        </p>

        <StepThrough
          code={"from contextlib import contextmanager\n\nevents = []\n\n@contextmanager\ndef reservation():\n    events.append('open')\n    try:\n        yield 'mic'\n    finally:\n        events.append('close')\n\nwith reservation() as item:\n    print(item)\n\nprint(events)"}
          steps={[
            {
              line: 12,
              note: "Входим в with. Менеджер начинает генератор, выполняет подготовку и приостанавливает его на yield.",
              vars: { events: "['open']" },
            },
            {
              line: 8,
              note: "Генератор останавливается на yield и передаёт значение менеджеру контекста.",
              vars: { item: "'mic'" },
            },
            {
              line: 13,
              note: "В тело with попадает item; теперь мы можем выполнить действие с выданным значением.",
              vars: { item: "'mic'" },
            },
            {
              line: 9,
              note: "После тела with менеджер продолжает генератор и входит в finally.",
              vars: { events: "['open']" },
            },
            {
              line: 10,
              note: "Завершающая часть отмечает освобождение ресурса.",
              vars: { events: "['open', 'close']" },
            },
            {
              line: 15,
              note: "После выхода из области мы видим обе отметки в порядке их выполнения.",
              vars: { output: "mic; ['open', 'close']" },
            },
          ]}
        />

        <p>
          {"Аналогия здесь похожа на временно выданный ключ от комнаты. Подготовка открывает комнату, yield передаёт ключ, а finally возвращает его после встречи. Аналогия помогает увидеть границы времени, но не объясняет транзакцию: решение подтвердить запись в базе не должно возникать только потому, что ключ возвращают."}
        </p>

        <p>
          {"Менеджер контекста скрывает ручное продвижение генератора и связывает его с синтаксисом with. В FastAPI похожую работу выполняет граф зависимостей. Поэтому обычную зависимость с yield не вызываем через next(get_db()) в обработчике или CLI: framework либо контекстный менеджер управляет её входом и выходом целиком."}
        </p>
      </Section>

      <Section number="03" title={"FastAPI связывает Session с HTTP-запросом"}>
        <Lead>
          {"FastAPI может управлять генераторной зависимостью вокруг обработчика. Provider открывает Session до передачи её в граф, а завершающий блок закрывает её после работы зависимости."}
        </Lead>

        <p>
          {"В StudyHub функция make_session_factory(engine) создаёт фабрику из уже подготовленного Engine. get_db получает Request и читает фабрику из request.app.state.session_factory; готовой глобальной фабрики модуль не предоставляет. Для узкой SQL-проверки отдельная fixture создаёт Engine на временном SQLite-файле и тест временно помещает фабрику в app.state. Штатная сборка приложения и обычный get_planner продолжают использовать JSON."}
        </p>

        <CodeBlock
          caption={"Фрагмент get_db, владелец HTTP-ресурса"}
          code={"from collections.abc import Iterator\n\nfrom fastapi import Request\nfrom sqlalchemy.orm import Session\n\ndef get_db(request: Request) -> Iterator[Session]:\n    session_factory = getattr(request.app.state, \"session_factory\", None)\n    if session_factory is None:\n        raise RuntimeError(\"SQL session factory is not configured\")\n\n    db = session_factory()\n    try:\n        yield db\n    finally:\n        db.close()"}
        />

        <p>
          {"Engine и фабрика создаются отдельно от короткоживущей Session. Функция make_session_factory(engine) в app.DBase.session возвращает sessionmaker; дальше приложение может передать эту фабрику через app.state. В B70.1 мы показываем именно временную настройку теста, а не утверждаем, что у текущего JSON-приложения уже есть постоянный SQL-lifespan. get_db создаёт Session на один запрос. В репозитории TaskRow преобразуется в доменный Task, пока сессия доступна; сервис получает уже понятный предметный результат."}
        </p>

        <p>
          {"Фабрика создаёт новую Session для области одного запроса. Сам provider не создаёт таблицы, не меняет JSON-настройку и не выбирает постоянный backend. Его ответственность уже: выдать один ресурс и гарантировать освобождение. Если запрос завершился контролируемой ошибкой, ошибка продолжает свой путь к обработчику FastAPI, а finally всё равно закрывает Session. Время жизни зависимости не меняет публичный статус ответа и форму TaskRead."}
        </p>

        <p>
          {"Закрытие здесь не означает подтверждение записи. Мы не добавляем commit в finally: этот блок отвечает за освобождение ресурса, а результат SQL-чтения уже определён. Если будущий сценарий начнёт менять данные, для него понадобятся явные правила транзакции и обработки ошибки. Сейчас GET остаётся безопасным чтением, а работа сессии заканчивается независимо от того, нашлась задача или обработчик вернул 404."}
        </p>

        <CodeBlock
          caption={"Тестовый SQL-provider собирает read-only сервис"}
          code={"from fastapi import Depends\nfrom sqlalchemy.orm import Session\n\nfrom app.core.dependencies import get_db\nfrom app.main import build_service\nfrom app.DBase.repositories import SqlTaskRepository\nfrom app.services import PlannerService\n\ndef get_sql_planner(db: Session = Depends(get_db)) -> PlannerService:\n    repository = SqlTaskRepository(db)\n    return build_service(repository=repository)"}
        />

        <p>
          {"Эта сборка использует существующий repository-вход build_service. SQL-репозиторий пока реализует только list() и get(), поэтому у такого сервиса доступны соответствующие list_tasks() и get_task(). Остальные методы PlannerService не становятся SQL-операциями автоматически: поиск, выборка, статистика и изменения остаются вне этого SQL-provider."}
        </p>

        <Diagram caption={"Один общий механизм создания, две отдельные области владельца"} orientation="vertical">
          <DiagramFlow label={"Области жизни Session"} orientation="vertical">
            <DiagramLane title={"HTTP-запрос"}>
              <DiagramFlow label={"FastAPI открывает, передаёт и закрывает Session"}>
                <DiagramNode title={"session_factory"} shape="database">
                  <p>{"Создана make_session_factory(engine)"}</p>
                </DiagramNode>
                <DiagramArrow label={"получает ресурс"} />
                <DiagramNode title={"get_db"}>
                  <p>{"читает request.app.state и выдаёт Session"}</p>
                </DiagramNode>
                <DiagramArrow label={"пока идёт запрос"} />
                <DiagramNode title={"GET /tasks/{id}"}>
                  <p>{"Сервис и SQL-репозиторий читают задачу"}</p>
                </DiagramNode>
                <DiagramArrow label={"область завершается"} />
                <DiagramNode title={"finally"}>
                  <p>{"Session закрывается"}</p>
                </DiagramNode>
              </DiagramFlow>
            </DiagramLane>
            <DiagramLane title={"Одна CLI-команда"}>
              <DiagramFlow label={"Контекстный менеджер ограничивает работу команды"}>
                <DiagramNode title={"Контекст ресурса"}>
                  <p>{"получает session_factory аргументом"}</p>
                </DiagramNode>
                <DiagramArrow label={"на одно действие"} />
                <DiagramNode title={"get или list"}>
                  <p>{"Команда использует сервис внутри with"}</p>
                </DiagramNode>
                <DiagramArrow label={"выход из with"} />
                <DiagramNode title={"Закрытие"}>
                  <p>{"Контекст завершает ресурс"}</p>
                </DiagramNode>
              </DiagramFlow>
            </DiagramLane>
          </DiagramFlow>
        </Diagram>

        <p>
          {"Session, привязанная к одному запросу, не должна попадать в app.state вместе с долгоживущим JSON-сервисом. Иначе поздний запрос мог бы получить сервис, который хранит Session уже завершённой области. Для тестовой сборки мы создадим сервис внутри provider, когда FastAPI уже разрешил get_db. После завершения запроса не оставляем ссылок, которые продолжают использовать эту Session."}
        </p>

        <p>
          {"Срок запуска завершающего кода зависит от области yield-зависимости. В закреплённом окружении FastAPI по умолчанию использует request-scope, а function-scope завершает зависимость раньше, до отправки ответа. Для нашего обычного GET данные ответа уже сформированы обработчиком, но потоковая выдача потребовала бы отдельной проверки scope. Мы не называем cleanup универсально происходящим только после ответа."}
        </p>

        <QuizCard
          question={"Какая часть FastAPI-зависимости исполняется до того, как Session попадёт в обработчик?"}
          options={[
            "Код до yield; сам yield отдаёт значение в dependency-граф.",
            "Вся функция до finally, затем обработчик получает новый объект.",
            "Только код finally, потому что FastAPI завершает зависимость заранее.",
          ]}
          correctIndex={0}
          explanation={"FastAPI запускает provider до yield, передаёт выданное значение зависимым функциям, а затем выполняет завершающую часть в соответствии с областью зависимости."}
        />

        <p>
          {"Версия проекта указана в requirements, а детали yield и scope следует сверять с документацией выбранной FastAPI. Объяснение и пример в этом материале достаточны для практики; внешняя документация остаётся дополнительной опорой."}
        </p>
      </Section>

      <Section number="04" title={"Тест подменяет provider, но сохраняет границы проекта"}>
        <Lead>
          {"Чтобы проверить SQL, не нужно переключать приложение целиком. Мы временно подменим знакомую зависимость сервиса и направим только тестовый запрос на отдельную SQLite-базу."}
        </Lead>

        <p>
          {"В обычном приложении get_planner продолжает возвращать PlannerService над JSON. В тесте app.dependency_overrides может заменить именно get_planner на SQL-provider, который получает Session через get_db. FastAPI разрешает его подзависимость, так что тест не должен вызывать get_db вручную или передавать одну Session из потока теста в поток TestClient."}
        </p>

        <p>
          {"Подготовим отдельный файл базы и заполним его известной задачей с внутренним tags. Fixture создаёт Engine для временного файла и фабрику вызовом make_session_factory(engine). На время тестового запроса мы кладём эту фабрику в app.state.session_factory, затем восстанавливаем прежнее состояние. Через GET /tasks/{id} проверим прежние TaskRead и статус, а неизвестный id останется 404. Отдельная проверка mapping подтвердит внутренние tags. Это доказывает только SQL-чтение, не полный CRUD."}
        </p>

        <p>
          {"Словарь overrides общий для приложения, поэтому тест возвращает его исходное состояние в finally, включая случай провала проверки. После этого отдельный JSON-запрос должен снова пройти обычным get_planner. Рабочий JSON не используется. Если ошибка возникает после получения Session, она распространяется наружу, а зависимость всё равно закрывает ресурс."}
        </p>

        <CodeBlock
          caption={"Создание фабрики и временная настройка app.state в тесте"}
          code={"# sql_database creates an Engine for a file under tmp_path\n# Its fixture returns make_session_factory(engine).\nengine, session_factory = sql_database\nprevious_factory = getattr(app.state, \"session_factory\", None)\nhad_factory = hasattr(app.state, \"session_factory\")\nprevious_overrides = app.dependency_overrides.copy()\napp.state.session_factory = session_factory\ntry:\n    app.dependency_overrides[get_planner] = get_sql_planner\n    response = api_client.get(\"/tasks/7\")\nfinally:\n    app.dependency_overrides.clear()\n    app.dependency_overrides.update(previous_overrides)\n    if had_factory:\n        app.state.session_factory = previous_factory\n    else:\n        del app.state.session_factory"}
        />

        <BugHunt
          code={"from fastapi import Request\n\ndef get_db(request: Request):\n    session_factory = getattr(request.app.state, \"session_factory\", None)\n    if session_factory is None:\n        raise RuntimeError(\"SQL session factory is not configured\")\n    db = session_factory()\n    try:\n        yield db\n    finally:\n        db.commit()\n        db.close()"}
          question={"Что здесь опасно при чтении и контролируемой ошибке?"}
          options={[
            "Cleanup подтверждает изменения; если commit завершится ошибкой, close уже не выполнится.",
            "Фабрику нужно пересоздавать после каждого вызова close.",
            "FastAPI не умеет передавать результат yield в другие зависимости.",
          ]}
          correctIndex={0}
          explanation={"get_db отвечает за ресурс, а не за решение о сохранении. commit в finally может подтвердить незавершённое изменение; кроме того, его исключение прервёт выполнение до close."}
          fix={"from fastapi import Request\n\ndef get_db(request: Request):\n    session_factory = getattr(request.app.state, \"session_factory\", None)\n    if session_factory is None:\n        raise RuntimeError(\"SQL session factory is not configured\")\n    db = session_factory()\n    try:\n        yield db\n    finally:\n        db.close()"}
        />

        <p>
          {"В тесте мы также оставляем исходный override-словарь нетронутым за пределами своей проверки. Вместо clear() без сохранения исходного состояния копируем overrides заранее, а затем восстанавливаем копию. Это важно, если другие фикстуры приложения уже установили подмены."}
        </p>
      </Section>

      <Section number="05" title={"CLI ограничивает Session одной командой самостоятельно"}>
        <Lead>
          {"CLI работает вне HTTP, поэтому его срок жизни ресурса задаёт обычный Python-контекст, а не Depends."}
        </Lead>

        <p>
          {"Командная строка не получает Request и не проходит через FastAPI dependency-граф. Зато у неё есть понятная граница: одна команда get или list. Для неё можно открыть SQL-сервис внутри with, выполнить одно действие и выйти. Если оставить Session на весь интерактивный run, она переживёт независимые команды без учебной причины и удержит ресурс дольше нужного."}
        </p>

        <p>
          {"Менеджер контекста похож на гардероб с номерком. Мы сдаём вещь при входе в команду, пользуемся выданным номерком внутри неё и возвращаем его при выходе. Если тело with выбросит исключение, протокол выхода всё равно запускает cleanup. Граница аналогии в том, что менеджер не решает, нужно ли подтверждать транзакцию: это отдельная ответственность операций записи."}
        </p>

        <p>
          {"contextlib.contextmanager превращает генераторную функцию с одним yield в объект для with. До yield helper вызывает переданную ему фабрику и собирает SQL-сервис. Тело команды пользуется сервисом; после выхода генератор возобновляется, а вложенный контекст закрывает Session. Фабрика создаёт новую Session для каждой отдельной команды."}
        </p>

        <CodeBlock
          caption={"Фрагмент контекста для будущего одиночного вызова CLI"}
          code={"from contextlib import contextmanager\nfrom collections.abc import Iterator\n\nfrom app.services import PlannerService\nfrom app.DBase.repositories import SqlTaskRepository\n\n# build_service уже определён в app/main.py\n@contextmanager\ndef sql_service_context(session_factory) -> Iterator[PlannerService]:\n    with session_factory() as db:\n        yield build_service(repository=SqlTaskRepository(db))\n\nwith sql_service_context(session_factory) as planner:\n    task = planner.get_task(task_id)"}
        />

        <p>
          {"Контекст получает фабрику явным аргументом и не импортирует Depends. Он не меняет главный цикл run. SQL-репозиторий сейчас поддерживает только list() и get(), поэтому внутри контекста используем только list_tasks() или get_task(). Остальные операции обычного Planner продолжают идти через прежний JSON-сервис; этот пример не создаёт второго штатного backend."}
        </p>

        <RecallCard
          question={"Что именно FastAPI делает за HTTP-provider, а что CLI делает самостоятельно?"}
          hint={"Сопоставим владельца Session с границей операции."}
          answer={
            <p>
              {"FastAPI строит dependency-граф и запускает завершающую часть yield-зависимости. CLI открывает менеджер контекста для вызова и выходит из него сам. В обоих случаях Session принадлежит одной ограниченной операции."}
            </p>
          }
        />
      </Section>

      <Section number="06" title={"Что мы будем делать в практике"}>
        <Lead>
          {"Мы подготовим ресурсные области для ограниченного SQL-чтения и подтвердим, что приложение продолжает работать по прежнему JSON-пути."}
        </Lead>

        <LinkedNotes
          variant="connected"
          items={[
            {
              title: "Выдадим Session запросу",
              description: "get_db получает фабрику из request.app.state.session_factory. Тест создаёт её через make_session_factory(engine) и временно размещает в app.state; Session закрывается через finally.",
            },
            {
              title: "Подменим один GET",
              description: "Соберём SQL-provider для существующего GET по id. Отдельная SQLite-fixture подтвердит известную Task, прежний TaskRead, внутренние tags и знакомый 404.",
            },
            {
              title: "Проверим восстановление",
              description: "Понаблюдаем cleanup, сохраним и восстановим прежние dependency overrides, затем выполним запрос через обычный JSON-provider.",
            },
            {
              title: "Ограничим CLI-вызов",
              description: "Подготовим contextlib-контекст для одного get или list. Контекст откроется и закроется вокруг действия, не меняя обычный run.",
            },
          ]}
        />

        <p>
          {"Для этих шагов нужна подтверждённая точка B70: Engine, фабрика Session, SQL-репозиторий чтения list/get и сервис с репозиторным входом. Мы сначала проследим независимые механизмы yield и контекста, затем применим их к запросу и команде. Рабочая база и данные JSON не участвуют: SQL-проверка использует отдельную SQLite-fixture."}
        </p>

        <p>
          {"Практика заканчивается узким SQL GET и подготовленным ресурсом команды. SQL-репозиторий не объявляется поддержкой select, search, statistics или записи. Обычный API и CLI, полный JSON-путь и публичный HTTP-контракт продолжают работать как прежде. Так у следующего шага уже будет фабрика и проверенное владение Session для безопасного импорта отдельной копии данных."}
        </p>
      </Section>
    </RichLesson>
  );
}
