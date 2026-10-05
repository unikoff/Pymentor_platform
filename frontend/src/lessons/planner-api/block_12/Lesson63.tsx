import { Bug, ShieldCheck } from "lucide-react";
import { BugHunt, CodeBlock, Lead, LinkedNotes, MatchPairs, PracticeCta, QuizCard, RichHero, RichLesson, Section, StepThrough, TheoryBridge } from "../../shared";

// 63. Тесты FastAPI через TestClient и независимое состояние
function TestClientLifecycleDiagram() {
  return (
    <figure className="lesson-diagram testclient-lifecycle" aria-labelledby="testclient-flow-title" aria-describedby="testclient-flow-description">
      <figcaption id="testclient-flow-title" className="lesson-diagram-caption">Жизненный цикл одной функции теста</figcaption>
      <div className="lesson-diagram-flow" role="group" aria-label="pytest setup, request, assertions, and teardown">
        <div className="lesson-diagram-node"><h3>{"pytest"}</h3><p>{"starts test"}</p></div>
        <div className="lesson-diagram-connector"><span>{"setup"}</span><span className="lesson-diagram-arrow" aria-hidden="true" /></div>
        <div className="lesson-diagram-node"><h3>{"tmp_path"}</h3><p>{"new JSON"}</p></div>
        <div className="lesson-diagram-connector"><span>{"service"}</span><span className="lesson-diagram-arrow" aria-hidden="true" /></div>
        <div className="lesson-diagram-node"><h3>{"app.state"}</h3><p>{"temporary Planner"}</p></div>
        <div className="lesson-diagram-connector"><span>{"request"}</span><span className="lesson-diagram-arrow" aria-hidden="true" /></div>
        <div className="lesson-diagram-node"><h3>{"TestClient"}</h3><p>{"HTTP response"}</p></div>
        <div className="lesson-diagram-connector"><span>{"assert"}</span><span className="lesson-diagram-arrow" aria-hidden="true" /></div>
        <div className="lesson-diagram-node"><h3>{"teardown"}</h3><p>{"restore app"}</p></div>
      </div>
      <p id="testclient-flow-description" className="lesson-diagram-caption">Сначала создаётся временный файл и тестовый сервис, затем запросы проверяют приложение; после закрытия клиента прежний сервис возвращается в app.state.planner.</p>
    </figure>
  );
}

export function Lesson63({ module }: { module?: string }) {
  return (
    <RichLesson>
      <RichHero variant="project" chip={module ?? "Блок 12 · Архитектура, тесты и релиз Planner API"} title={"Тесты FastAPI через TestClient и независимое состояние"}
        intro={"Закрепим работающий HTTP-договор до изменения структуры маршрутов. Каждый тест получит отдельный JSON, а запросы одного сценария сохранят общее состояние."}
        tags={[{ icon: <Bug size={14} />, label: "TestClient и pytest" }, { icon: <ShieldCheck size={14} />, label: "изолированное состояние" }]} />
      <TheoryBridge link={"Сначала проверим уже работающие HTTP-операции и подготовим изолированное состояние."} boundary={"TestClient не открывает внешний TCP-порт и не заменяет проверку запущенного Uvicorn."} />

      <Section number="00" title={"От ручной проверки к повторяемому доказательству"}>
        <Lead>{"В прошлом занятии мы удалили задачу по её ID, получили пустой ответ 204 и отдельно убедились, что сервис больше не находит запись. Перед переносом обработчиков закрепим это уже работающее поведение автоматическими HTTP-тестами."}</Lead>
        <LinkedNotes variant="connected" items={[
          { title: "Точка старта", description: "Planner API выполняет операции через готовые PlannerService и JSON; pytest и временные файлы уже знакомы." },
          { title: "Новый вопрос", description: "Как повторно проверить настоящий FastAPI app без запущенного сервера и рабочего файла данных?" },
          { title: "Результат", description: "Независимые тесты проверяют статусы, ответы и изменение состояния каждой HTTP-операции." },
        ]} />
        <p>{"Сначала отделим проверку HTTP-границы от запуска сервера, затем свяжем запрос с ответом и явным тестовым состоянием. Прежние тесты пригодятся, когда мы будем перемещать обработчики: они покажут, изменился ли договор."}</p>
      </Section>

      <Section number="01" title={"TestClient обращается к приложению без запуска Uvicorn"}>
        <Lead>{"TestClient принимает готовый объект FastAPI app и отправляет запрос через ASGI внутри процесса Python. Мы проверяем настоящий маршрут и HTTP-ответ, но не открытый TCP-порт или доступность Uvicorn из сети."}</Lead>
        <p>{"При таком запросе FastAPI всё равно разбирает путь и тело, находит зарегистрированный обработчик и формирует ответ. Отличие от обычного вызова Python-функции в том, что мы проходим HTTP-границу приложения. Для этого не нужны отдельный серверный процесс, ручной запуск или окно терминала."}</p>
        <CodeBlock caption={"Независимый пример: маршрут /ping"} code={`from fastapi import FastAPI
from fastapi.testclient import TestClient

demo_app = FastAPI()

@demo_app.get("/ping")
def ping():
    return {"ready": True}

client = TestClient(demo_app)
response = client.get("/ping")
assert response.status_code == 200
assert response.json() == {"ready": True}`} />
        <p>{"Здесь client.get проходит через FastAPI, а не вызывает ping как обычную функцию. Мы наблюдаем статус и JSON. Это похоже на стойку приёма внутри здания: запрос проходит настоящее приложение, хотя курьер не выходит на улицу и не проверяет сетевой маршрут. Граница аналогии важна: TestClient не подтверждает, что Uvicorn открыл внешний порт."}</p>
        <p>{"Клиента создаём именно для app, в котором зарегистрированы проверяемые маршруты. Новый пустой FastAPI объект проверял бы только собственные операции. Для проекта импортируем приложение из его точки сборки API и не создаём второй экземпляр специально для теста."}</p>
        <QuizCard question={"Что подтверждает TestClient в этом примере?"}
          options={["FastAPI app и его HTTP-ответ внутри процесса", "Доступность внешнего TCP-порта Uvicorn", "Работу браузера и DNS"]}
          correctIndex={0} explanation={"TestClient обращается к ASGI-приложению напрямую. Для проверки запущенного сервера и внешней сети нужен отдельный сетевой клиент."} />
      </Section>

      <Section number="02" title={"Статус, тело и состояние отвечают на разные вопросы"}>
        <Lead>{"Тест не ограничивается тем, что запрос завершился без исключения. Отдельные проверки показывают статус, публичное тело и последствия следующего чтения."}</Lead>
        <p>{"Сценарий можно разложить на Arrange, Act и Assert. В Arrange мы подготавливаем известное состояние. В Act отправляем HTTP-запрос. В Assert проверяем ответ и результат действия. Это не отдельная библиотека и не набор обязательных функций; такой порядок помогает увидеть, что именно мы доказали."}</p>
        <p>{"Параметр json= сериализует Python-словарь в JSON-тело запроса, а params= задаёт query-параметры адреса. response.status_code сообщает HTTP-результат, response.json() разбирает структуру тела, response.content возвращает сырые байты. Проверка одного status_code может пропустить неверные поля ответа; проверка только JSON может пропустить неправильный статус."}</p>
        <StepThrough code={`response = client.post("/notes", json={"title": "Draft"})
assert response.status_code == 201
created = response.json()
assert created["title"] == "Draft"
item = client.get(f"/notes/{created['id']}")
assert item.status_code == 200`}
          steps={[{ line: 0, note: "Мы отправляем независимый POST на публичный адрес и передаём JSON-тело." },
            { line: 1, note: "Затем фиксируем обещанный статус создания, а не только отсутствие исключения." },
            { line: 2, note: "Ответ разбирается как JSON, а последующая проверка использует фактический ID." },
            { line: 5, note: "Повторное чтение подтверждает, что запись видна через тот же HTTP-договор." }]} />
        <p>{"В примере используется независимая заметка, чтобы не выдавать готовое решение Planner. При операции с состоянием ответ POST ещё не доказывает, что файл изменился. Обработчик мог вернуть объект, который только что поменял в памяти. Поэтому мы читаем ресурс повторно и сравниваем то, что видит внешний клиент."}</p>
        <p>{"Если проверяем список после неверного запроса, используем публичный GET, а не внутреннюю переменную сервиса. Так тест остаётся на HTTP-границе, ради которой мы и добавляем TestClient."}</p>
      </Section>

      <Section number="03" title={"Function-scoped fixture отделяет тестовые файлы"}>
        <Lead>{"Fixture задаёт повторяемую подготовку и завершение функции теста. Знакомый tmp_path даёт каждому тесту свой временный каталог и собственный JSON."}</Lead>
        <p>{"Pytest находит test-функции и выполняет fixture перед каждым запросом, указанным в параметрах функции. Function scope используется по умолчанию: fixture готовится для одного теста и завершается после него. Новый `JsonStorage` в каталоге tmp_path не читает и не очищает рабочий `data/tasks.json`."}</p>
        <p>{"В Planner handlers берут текущий сервис из `app.state.planner`. Сначала fixture строит тестовый `PlannerService` через прежнюю функцию `build_service` и `JsonStorage` с временным путём. Затем fixture клиента сохраняет старый `app.state.planner`, устанавливает тестовый сервис, открывает `TestClient` и обязательно возвращает прежнее значение в `finally`. Так импортированный app остаётся пригоден для следующего теста."}</p>
        <p>{"Pytest связывает fixture и тест по имени параметра: функция с client получает fixture клиента, а клиент запрашивает planner_service. Мы не вызываем fixture вручную и не храним TestClient в глобальной переменной. Область function используется по умолчанию: после теста завершаются его клиент и сервис, а следующая функция получает отдельный tmp_path. Так понятно, кто владеет JSON и когда заканчивается его использование. Мы не расширяем срок жизни такого сервиса до module или session: отдельный файл на функцию позволяет запускать тест самостоятельно и в любом порядке."}</p>
        <CodeBlock caption={"Сервис получает временный путь"} code={`@pytest.fixture
def test_service(tmp_path):
    return build_service(JsonStorage(tmp_path / "tasks.json"))`} />
        <TestClientLifecycleDiagram />
        <p>{"Fixture клиента зависит от fixture сервиса. Сначала pytest готовит сервис, затем открывает TestClient; teardown идёт в обратном порядке. Поэтому клиент закрывается до восстановления прежнего app.state.planner. Если поменять порядок, приложение может остаться с клиентом, который ещё использует уже возвращённое состояние."}</p>
        <p>{"Это похоже на отдельный поднос для каждого лабораторного опыта: следующий опыт получает чистый поднос, но внутри одного опыта образец остаётся на месте между измерениями. Граница аналогии важна: временный JSON изолирует последовательные тесты, но не делает `JsonStorage` транзакционным и не защищает от одновременных писателей."}</p>
      </Section>

      <Section number="04" title={"Несколько запросов одного теста используют один сервис"}>
        <Lead>{"Новый JSON создаётся на тестовую функцию, а не на каждый запрос. Поэтому POST, следующий GET и проверка stats внутри сценария видят одни данные."}</Lead>
        <p>{"Если очищать файл перед каждым HTTP-запросом, POST создаст задачу в одном состоянии, а GET прочитает другое. Мы оставляем один service fixture на всю функцию. Следующая функция получает новый путь, даже если в ней запрашивается тот же endpoint."}</p>
        <p>{"Фиксированный ID безопасен, если тест сам создал задачу и получил это значение. В Planner ID назначает сервер, поэтому мы сохраняем ID из ответа POST, а не вычисляем его по длине списка и не берём из предыдущего теста."}</p>
        <p>{"Для отказа можно сохранить GET списка и stats, отправить невалидный POST и снова прочитать те же данные. Ответ 422 показывает границу ошибки, а совпавшее состояние подтверждает отсутствие частичного изменения. Если проверяем отказ PUT или PATCH, перечитываем всю затронутую Task: прежний `total` не заметил бы испорченный title или status."}</p>
        <BugHunt code={`@pytest.fixture
def client(test_service):
    app.state.planner = test_service
    with TestClient(app) as client:
        yield client
    app.state.planner = previous_service`}
          question={"Что в этой fixture мешает надёжно вернуть прежний сервис?"}
          options={["previous_service не сохранён до подмены", "TestClient запрещает yield-fixture", "pytest требует очистить JSON после каждого запроса"]}
          correctIndex={0}
          explanation={"Сначала запоминаем app.state.planner, а возврат ставим в finally. Тогда выбранный сервис восстановится и после обычного завершения, и после исключения."}
          fix={`previous_service = app.state.planner
app.state.planner = test_service
try:
    with TestClient(app) as client:
        yield client
finally:
    app.state.planner = previous_service`} />
        <p>{"Пустой GET в новом тесте не означает, что другой тест создаёт для нас данные. Каждая функция сама выполняет Arrange. Поэтому выбранный тест можно запустить отдельно или после любого другого без скрытого общего состояния."}</p>
      </Section>

      <Section number="05" title={"Статусы и тело проверяются по HTTP-договору"}>
        <Lead>{"Восемь операций дают разные наблюдения. Мы проверяем каждое обещание отдельно, включая отсутствие тела у DELETE и сохранность данных после отказа."}</Lead>
        <p>{"Для health ожидаем 200 и статус сервиса. Для пустого списка и статистики явно проверяем начальные значения. Создание получает 201, четыре публичных поля TaskRead и серверные `id` и `is_done=False`; последующий GET подтверждает запись. PUT и PATCH отвечают 200, причём PATCH должен применить переданное `false` и сохранить остальные поля."}</p>
        <p>{"Успешный DELETE возвращает пустой 204. Это не пустой JSON и не `null`, поэтому вызываем `response.content` и сравниваем его с `b\"\"`, но не запускаем `response.json()`. После этого корректный отсутствующий ID даёт 404. Невалидный body или неразбираемый path приводит к 422 до действия сервиса."}</p>
        <p>{"Ожидаем смысловой статус и сохранность записи, а не дословный текст ошибки Pydantic. Так проверки привязаны к обещанию нашего API, а не к формулировке сообщения конкретной версии библиотеки."}</p>
        <MatchPairs prompt={"Сопоставим наблюдение с тем, что оно подтверждает."} leftTitle="Проверка" rightTitle="Факт" pairs={[
          { left: "status_code", right: "HTTP-статус" }, { left: "response.json()", right: "JSON-тело" },
          { left: "response.content", right: "байты тела" }, { left: "последующий GET", right: "видимость изменения" },
        ]} explanation="Мы выбираем несколько наблюдений, потому что каждый из них отвечает на свой вопрос." />
        <p>{"Unit-тест сервиса может проверить правило и JSON без FastAPI, но не докажет status code или route. TestClient дополняет этот уровень: он проверяет приложение с маршрутизацией, схемами и ответами. Позже длинный workflow соединит несколько операций в один сценарий; здесь важнее, чтобы отдельные тесты не зависели друг от друга."}</p>
      </Section>

      <Section number="06" title={"Что мы будем делать в практике"}>
        <Lead>{"Подготовим настоящие HTTP-тесты и временное состояние, не меняя рабочий Planner."}</Lead>
        <p>{"Установим test-набор в окружение проекта вместе с HTTPX, который нужен TestClient. Команда `python -m pytest` запускает pytest тем же интерпретатором, что и выбранное окружение; не полагаемся на глобальную команду из другого виртуального окружения."}</p>
        <LinkedNotes variant="connected" items={[
          { title: "Подготовим состояние", description: "Function-scoped fixtures соберут PlannerService на JsonStorage внутри tmp_path и восстановят прежний app.state.planner." },
          { title: "Покроем операции", description: "Health, list, stats, item, POST, PUT, PATCH с false и DELETE получат независимые проверки." },
          { title: "Проверим порядок", description: "Запустим выбранные node IDs отдельно, вместе и в ином порядке; отказы не должны менять состояние." },
        ]} />
        <p>{"Мы сохраним один файл на сценарий, но новый файл для следующего теста. Результат закрепит текущий HTTP-договор до переноса обработчиков, а Postman останется отдельным способом проверить запущенный Uvicorn и рабочий JSON."}</p>
        <PracticeCta text={"Подготовьте изолированные fixtures и проверьте все восемь HTTP-операций на существующем Planner."} />
      </Section>
    </RichLesson>
  );
}
