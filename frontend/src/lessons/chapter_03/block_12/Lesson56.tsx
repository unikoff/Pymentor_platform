import { CheckCircle2, FlaskConical, Route } from "lucide-react";
import {
  BugHunt,
  CodeBlock,
  CompareSolutions,
  Diagram,
  DiagramArrow,
  DiagramFlow,
  DiagramNode,
  Lead,
  LinkedNotes,
  QuizCard,
  RichHero,
  RichLesson,
  Section,
  StepThrough,
} from "../../shared";

export function Lesson56({ module }: { module?: string }) {
  return (
    <RichLesson>
      <RichHero
        variant="project"
        chip={module ?? "Блок 12 · Проверяемый API"}
        title="Первый HTTP-тест"
        intro="Проверим один безопасный ответ Planner API через настоящее приложение FastAPI. TestClient пройдёт маршрут внутри процесса, а pytest зафиксирует статус и JSON без запуска сервера."
        tags={[
          { icon: <FlaskConical size={14} />, label: "pytest и TestClient" },
          { icon: <Route size={14} />, label: "граница HTTP" },
          { icon: <CheckCircle2 size={14} />, label: "GET /health" },
        ]}
      />

      <Section number="00" title="От работающего API к проверяемому ответу">
        <Lead>
          API уже работает, но его ответы проверялись вручную. Теперь добавим первый автоматический HTTP-тест.
        </Lead>
        <LinkedNotes
          variant="connected"
          items={[
            { title: "Точка A", description: "pytest, assert и tmp_path уже знакомы; в app/api.py зарегистрирован GET /health. HTTP-теста и TestClient пока нет." },
            { title: "Вопрос", description: "Как проверить маршрут и ответ через приложение, не запуская Uvicorn?" },
            { title: "Точка B", description: "Dev-зависимости и команда записаны; один тест настоящего app проверяет статус 200 и JSON. Uvicorn и данные Planner не затрагиваются." },
          ]}
        />
        <p>
          Начинаем с GET /health: он только читает состояние и не меняет задачи. Запросы POST и PATCH добавим после
          подготовки изоляции в занятии 56.1. Хотя tmp_path уже знаком, здесь он не нужен: health-тест ничего не
          записывает. Проверяем только маршрут и его ответ.
        </p>
      </Section>

      <Section number="01" title="Тестируем маршрут, а не функцию обработчика">
        <Lead>
          Прямой вызов функции не проверяет HTTP-маршрут. Для этого отправим запрос через приложение.
        </Lead>
        <p>
          Прямой вызов функции обработчика проверяет только её Python-код. Он не показывает, зарегистрирован ли
          `/health` и какой HTTP-ответ вернёт приложение. Запрос клиента проходит через FastAPI: приложение находит
          маршрут, вызывает обработчик и формирует ответ.
        </p>
        <Diagram caption="Путь одного запроса в тесте" orientation="vertical">
          <DiagramFlow label="HTTP-путь внутри процесса" orientation="vertical">
            <DiagramNode title="pytest" shape="terminator">запускает функцию теста</DiagramNode>
            <DiagramArrow label="создаёт клиента" />
            <DiagramNode title="TestClient" shape="process">отправляет GET /health приложению</DiagramNode>
            <DiagramArrow label="передаёт запрос" />
            <DiagramNode title="FastAPI app">ищет зарегистрированный маршрут</DiagramNode>
            <DiagramArrow label="возвращает response" />
            <DiagramNode title="HTTP-ответ" shape="terminator">status_code и JSON body</DiagramNode>
          </DiagramFlow>
        </Diagram>
        <p>
          В коротком примере ниже используем отдельный маршрут `/ping`, чтобы увидеть сам запрос. В тесте Planner
          импортируем готовый `app` из `app.api`: только в нём зарегистрированы маршруты проекта. Новая `FastAPI()`
          внутри тестового файла проверяла бы пустое приложение.
        </p>
        <CodeBlock
          caption="Короткий независимый пример для знакомства с API клиента"
          code={`from fastapi import FastAPI
from fastapi.testclient import TestClient

demo_app = FastAPI()

@demo_app.get("/ping")
def ping():
    return {"ready": True}

client = TestClient(demo_app)
response = client.get("/ping")
assert response.status_code == 200
assert response.json() == {"ready": True}`}
        />
        <p>
          В примере `ping()` возвращает обычное значение Python. `client.get()` сначала проходит через маршрут, а
          затем создаёт объект HTTP-ответа. У этого ответа есть статус и тело; позднее мы проверим их отдельно.
          Поэтому сравнение результата функции и ответа клиента отвечает на разные вопросы, даже если данные в теле
          совпадают.
        </p>
        <p>
          Декоратор `@demo_app.get("/ping")` связывает метод GET и путь `/ping` с функцией `ping`. Клиент отправляет
          запрос с теми же методом и путём. FastAPI выбирает эту функцию и превращает её словарь в JSON-тело ответа.
          Если изменить путь или HTTP-метод, проверка проходит уже через другое правило. Прямой вызов `ping()` эту
          ошибку не обнаружит.
        </p>
        <p>
          В тесте импортируем `app` из `app.api`. Так TestClient получает приложение с маршрутами Planner. Если
          создать в тесте новую `FastAPI()` без этих маршрутов, проверка может пройти на пустом приложении и ничего
          не скажет о Planner.
        </p>
        <CompareSolutions
          question="Какой вариант проверяет, что путь /ping зарегистрирован в демонстрационном app?"
          left={{
            title: "Вызвать обработчик напрямую",
            code: "result = ping()",
            note: "Мы увидим возвращаемое значение функции, но не маршрут и не HTTP-статус.",
          }}
          right={{
            title: "Запросить путь через клиент app",
            code: "response = client.get(\"/ping\")",
            note: "Запрос проходит через регистрацию маршрута и возвращает HTTP response.",
          }}
          preferred="right"
          explanation="Нам нужна проверка HTTP-границы. Прямой вызов может дополнять набор тестов для бизнес-логики, но он не заменяет запрос к настоящему объекту app."
        />
      </Section>

      <Section number="02" title="TestClient работает без внешнего сервера">
        <Lead>
          TestClient передаст запрос приложению внутри pytest. Для этого не нужно запускать Uvicorn или открывать порт.
        </Lead>
        <p>
          `TestClient` импортируется из `fastapi.testclient`. Он передаёт запрос ASGI-приложению внутри процесса.
          ASGI (Asynchronous Server Gateway Interface) — стандартный интерфейс между сервером и Python-приложением.
          FastAPI выбирает маршрут, вызывает обработчик и возвращает `response`. Это HTTP-проверка через приложение,
          а не прямой вызов функции.
        </p>
        <p>
          Такой тест подтверждает работу маршрута внутри приложения. Он не проверяет запуск Uvicorn, открытый порт
          или доступность с другого компьютера: для этого нужен отдельный внешний запрос.
        </p>
        <p>
          TestClient также не превращает любую ошибку приложения в ответ со статусом 500. По умолчанию исключение
          передаётся тесту, и pytest показывает место сбоя. Поэтому сейчас проверяем обычный ответ готового `/health`;
          специальные HTTP-ошибки и обработку исключений оставляем для отдельных сценариев.
        </p>
        <QuizCard
          question="Что подтверждает успешный GET через TestClient(app)?"
          options={[
            "Ответ маршрута переданного ASGI-приложения внутри процесса",
            "Открытый порт Uvicorn и доступность с другого компьютера",
            "Только Python-значение, возвращённое функцией обработчика",
          ]}
          correctIndex={0}
          explanation="TestClient проходит через маршрутизацию app и формирует HTTP response. Он не запускает внешний сервер и не заменяет прямой вызов бизнес-функции в тесте самой функции."
        />
      </Section>

      <Section number="03" title="Подготовьте dev-зависимости">
        <Lead>
          TestClient нужен HTTP-клиент. Запишем его версию рядом с pytest и подключим зависимости приложения.
        </Lead>
        <p>
          Для этого маршрута B задаёт `pytest==8.4.2` и `httpx2==2.13.1`. TestClient использует HTTPX2 как клиентскую
          библиотеку. В `requirements-dev.txt` оставляем pytest, добавляем закреплённую версию httpx2 и включаем
          runtime-набор строкой `-r requirements.txt`. Так dev-среда получает пакеты приложения и инструменты теста
          из одного файла; версии runtime-пакетов менять не нужно. Флаг `-r` означает «прочитать зависимости из
          другого файла». Точные версии помогают повторить ту же установку на другом компьютере.
        </p>
        <p>
          После изменения файла установим весь набор тем же Python, которым запустим тест. Команда ниже запускается
          из корня StudyHub и не требует ручной установки отдельного пакета. Вызов `python -m pip` привязывает pip к
          выбранному интерпретатору `.venv`; установка не меняет `requirements.txt` и системный Python.
        </p>
        <CodeBlock
          caption="Установка dev-зависимостей из корня проекта"
          code=".\\.venv\\Scripts\\python.exe -m pip install -r requirements-dev.txt"
        />
        <p>
          В README оставим команду полного набора и добавим рядом запуск нового файла. pytest ищет файлы `test_*.py`
          и функции `test_*`; поэтому назовём файл `test_api.py`, а функцию — `test_health_returns_ok`. Команда
          использует Python из `.venv`, запускает только этот файл, а `-q` сокращает отчёт. Ожидаем один прошедший
          тест. Полный запуск останется в README: команда с именем файла нужна для быстрой проверки нового сценария,
          а не заменяет весь набор.
        </p>
        <CodeBlock
          caption="Запуск нового теста из корня проекта"
          code=".\\.venv\\Scripts\\python.exe -m pytest -q tests/test_api.py"
        />
        <QuizCard
          question="Зачем requirements-dev.txt включает requirements.txt?"
          options={[
            "Чтобы dev-среда получила пакеты приложения вместе с инструментами теста",
            "Чтобы pytest запускал Uvicorn перед каждым тестом",
            "Чтобы заменить runtime-зависимости тестовыми",
          ]}
          correctIndex={0}
          explanation="Строка -r requirements.txt подключает runtime-набор. Файл dev-зависимостей добавляет к нему pytest и клиент для TestClient."
        />
      </Section>

      <Section number="04" title="with закрывает TestClient">
        <Lead>
          Контекстный менеджер ограничивает время жизни клиента одним блоком и закрывает его при выходе.
        </Lead>
        <p>
          Запись `with resource as name` знакома по работе с файлами: ресурс доступен внутри блока и закрывается,
          когда блок завершён. Так же оформим TestClient. Если assert завершится ошибкой, Python всё равно выйдет из
          блока и закроет клиента; pytest при этом покажет исходную ошибку.
        </p>
        <p>
          Порядок такой: создаём TestClient для импортированного `app`, отправляем запрос внутри `with`, проверяем
          ответ и выходим из блока. Имя после `as` — это клиент, а не приложение или ответ. Для этого синхронного
          клиента не нужны `async def` и `await`. Локальное имя `client` делает границу заметной: весь запрос и
          проверки расположены внутри блока, а код после него уже не использует закрытый клиент.
        </p>
        <StepThrough
          code={`with TestClient(demo_app) as client:
    response = client.get("/ping")
    assert response.status_code == 200
    assert response.json() == {"ready": True}`}
          steps={[
            { line: 0, note: "Открываем TestClient для блока и называем его client.", vars: { client: "открыт" } },
            { line: 1, note: "Отправляем GET /ping и получаем response.", vars: { response: "ответ /ping" } },
            { line: 2, note: "Проверяем, что status_code у response равен 200.", vars: { response: "status_code: 200" } },
            { line: 3, note: "Проверяем JSON в том же response.", vars: { response: 'json(): {"ready": True}' } },
          ]}
        />
      </Section>

      <Section number="05" title="Проверьте статус и JSON отдельно">
        <Lead>
          Статус показывает исход HTTP-запроса, а JSON — данные в теле ответа. В тесте проверим оба значения.
        </Lead>
        <p>
          `response.status_code` содержит HTTP-код, а `response.json()` разбирает тело ответа в значение Python.
          Для `/health` ожидаем `200` и словарь {"{"}"status": "ok"{"}"}. Это два отдельных обещания API: успешный код
          ещё не гарантирует правильное тело, а правильное тело не гарантирует нужный код.
        </p>
        <p>
          Это похоже на кассовый чек: итоговая сумма и список покупок отвечают на разные вопросы. Так же проверяем
          обе части ответа отдельными `assert`. Для короткого JSON-контракта `/health` сравним весь словарь; при
          несовпадении pytest покажет фактическое и ожидаемое значения. Поле `response.content` содержит тело в
          байтах, а `response.json()` разбирает JSON в Python-значение; здесь нужен именно словарь. Пустой ответ
          DELETE и произвольный HTTP 500 относятся к другим проверкам. Полное сравнение словаря замечает неверные,
          пропущенные и лишние поля; сравнивать JSON-строку с пробелами не нужно.
        </p>
        <p>
          Если путь не найден, проверка `status_code` заметит, что вместо `200` пришёл другой код. Если маршрут
          вернул `200`, но неверное тело, упадёт сравнение `response.json()`. Первая проверка говорит об успешном
          HTTP-исходе, вторая — о содержимом контракта. `assert` не исправляет ответ и не скрывает ошибку: он
          останавливает тест на первом неверном условии.
        </p>
        <BugHunt
          code={`response = client.get("/health")
assert response.json() == 200`}
          question="Что исправить в проверке?"
          options={[
            "Сравнивать код через status_code, а тело — через json()",
            "Заменить GET на прямой вызов обработчика",
            "Читать JSON только после закрытия клиента",
          ]}
          correctIndex={0}
          explanation={'status_code содержит HTTP-код, а json() возвращает данные тела, например словарь {"status": "ok"}.'}
          fix={`assert response.status_code == 200
assert response.json() == {"status": "ok"}`}
        />
      </Section>

      <Section number="06" title="Практика: зафиксируем один HTTP-контракт">
        <Lead>
          Перейдём от точки A к точке B: подготовим dev-среду, проверим /health и запишем запуск теста в README.
        </Lead>
        <LinkedNotes
          variant="connected"
          items={[
            {
              title: "Подготовьте среду",
              description:
                "Добавьте -r requirements.txt и httpx2==2.13.1, сохраните pytest==8.4.2. Установите dev-зависимости.",
            },
            {
              title: "Проверьте GET /health",
              description:
                "В tests/test_api.py импортируйте app и запросите /health через TestClient внутри with. Два assert подтверждают 200 и JSON {\"status\": \"ok\"}.",
            },
            {
              title: "Запустите именованный тест",
              description:
                "Добавьте в README команду .\\.venv\\Scripts\\python.exe -m pytest -q tests/test_api.py. Запустите её: pytest должен найти один тест.",
            },
          ]}
        />
        <p>
          В первом шаге применим раздел о dev-зависимостях, во втором — пример с настоящим app, TestClient и `with`,
          в третьем — команду pytest из этого раздела. Два assert проверят статус и JSON; GET не меняет задачи.
        </p>
        <p>
          Точка B достигнута, когда именованный запуск находит и проходит один тест, проверяющий статус `200` и JSON
          {"{"}"status": "ok"{"}"}. Uvicorn не запускается. В занятии 56.1 этот клиент получит изолированное состояние для
          тестов, которые меняют данные. Если запуск не проходит, сначала читаем сообщение pytest: оно покажет,
          остановился ли тест на импорте, обнаружении функции, HTTP-статусе или теле ответа.
        </p>
      </Section>
    </RichLesson>
  );
}





