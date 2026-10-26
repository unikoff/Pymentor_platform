import { Braces, FileInput, ShieldCheck } from "lucide-react";
import {
  BugHunt,
  Callout,
  CodeBlock,
  CodeSequence,
  Diagram,
  DiagramArrow,
  DiagramFlow,
  DiagramNode,
  KeyTakeaways,
  LinkedNotes,
  QuizCard,
  RichHero,
  RichLesson,
  Section,
  TypeCard,
  TypeCards,
  TrueFalse,
} from "../../shared";

export function Lesson50({ module }: { module?: string }) {
  void module;

  return (
    <RichLesson>
      <RichHero
        chip="Блок 10 · занятие 50"
        title="Модель входящего JSON"
        intro="Опишем поля будущего запроса и проверим TaskCreate в Python до подключения POST."
        variant="project"
        tags={[
          { icon: <FileInput size={15} />, label: "входная схема" },
          { icon: <Braces size={15} />, label: "JSON body" },
          { icon: <ShieldCheck size={15} />, label: "проверка до handler" },
        ]}
      />

      <Section number="00" title="От чтения списка к форме новой задачи">
        <p>
          В занятии 49.1 мы настроили query для чтения `GET /tasks`. Теперь разберём данные для
          будущего создания задачи. В Planner уже есть предметная `Task` и сервис `add_task`.
          В старом занятии 56 мы встречали `TaskCreate` вместе с POST. Это повторение знакомой
          модели, а не первое знакомство с Pydantic. Сейчас восстановим её отдельно, без обработчика
          и сохранения.
        </p>
        <LinkedNotes
          variant="connected"
          items={[
            {
              title: "Точка старта",
              description:
                "GET читает список и отдельную задачу. В Planner уже есть Task и add_task.",
            },
            {
              title: "Новый вопрос",
              description:
                "Какие поля клиент передаёт и как проверить их до создания задачи?",
            },
            {
              title: "Результат",
              description:
                "В app/api.py есть TaskCreate с обязательными title и priority. Её поведение проверено в Python.",
            },
          ]}
        />
        <p>
          Сегодня мы проверим модель в существующем API-модуле. Если её ещё нет, добавим. Результат
          нужен занятию 50.1: готовая форма для JSON body. POST, сервис и файл данных пока не меняем.
        </p>
      </Section>

      <Section number="01" title="Входная форма и предметная задача">
        <p>
          Клиент передаёт название и приоритет. `id` и начальное состояние назначает Planner.
          Поэтому во входной модели оставляем только клиентские поля. Идентификатор из запроса не
          должен заменять тот, который создаёт приложение.
        </p>
        <p>
          JSON передаёт текстовые значения. Pydantic разбирает body и связывает данные с полями
          модели. Так мы заранее описываем, что ждёт API. Модель не создаёт готовую задачу и не
          сохраняет её. После проверки сервис ещё должен выполнить создание.
        </p>
        <TypeCards>
          <TypeCard badge="ВХОД" title="TaskCreate" code="title: str\npriority: int">
            Вход запроса: только название и приоритет от клиента. Модель задаёт форму body, но не
            создаёт и не сохраняет задачу.
          </TypeCard>
          <TypeCard badge="ДОМЕН" title="Task" code="id · title · priority · is_done">
            Полная запись Planner. Сервис создаёт её и назначает id и начальный статус.
          </TypeCard>
        </TypeCards>
        <p>
          Первая аналогия: `TaskCreate` похожа на бланк заказа с названием и приоритетом. `Task` —
          готовая запись с внутренним номером и состоянием. Так проще увидеть, какие значения
          вводит клиент, а какие создаёт Planner.
        </p>
        <Diagram caption="Путь входных данных до обработчика">
          <DiagramFlow label="Проверка формы будущего запроса">
            <DiagramNode title="JSON body" shape="process">
              <p>title и priority как значения клиента</p>
            </DiagramNode>
            <DiagramArrow label="разбор и проверка типов" />
            <DiagramNode title="TaskCreate">
              <p>экземпляр модели с атрибутами title и priority</p>
            </DiagramNode>
            <DiagramArrow label="следующее занятие" />
            <DiagramNode title="POST handler" shape="terminator">
              <p>пока не подключаем</p>
            </DiagramNode>
          </DiagramFlow>
        </Diagram>
        <p>
          Сначала Pydantic проверяет поля и создаёт экземпляр `TaskCreate`. На этом шаге ещё нет
          вызова `add_task`, нового `id` или записи в JSON. Сервис появится в следующем занятии.
        </p>
        <Callout tone="info">
          В `TaskCreate` входят `title` и `priority`. В полной `Task` есть ещё `id` и `is_done`.
          Эти поля назначает Planner.
        </Callout>
      </Section>

      <Section number="02" title="BaseModel строит модель по аннотациям">
        <p>
          Наследуем `TaskCreate` от `BaseModel`. В классе записываем имя и тип каждого поля.
          `title: str` означает строку, а `priority: int` — целое число. Pydantic использует эти
          аннотации при создании экземпляра. Сам класс остаётся обычным Python-классом.
        </p>
        <CodeBlock
          caption="Короткий контракт входа"
          code={`from pydantic import BaseModel


class TaskCreate(BaseModel):
    title: str
    priority: int`}
        />
        <p>
          Поля без значений по умолчанию обязательны. Здесь нужны оба поля: `title` и `priority`.
          Если задать значение по умолчанию, поле станет необязательным. В этом шаге значения по
          умолчанию не добавляем.
        </p>
        <p>
          Эти типы описывают ожидаемую форму входа. В следующем занятии FastAPI использует модель
          для проверки JSON body и показа схемы в OpenAPI. Но `int` ещё не означает, что Planner
          разрешит любое целое число. Модель содержит только данные клиента, а не всю запись `Task`.
        </p>
        <p>
          Вторая аналогия: модель похожа на проверку анкеты перед приёмом. Она смотрит, заполнены
          ли обязательные поля и подходят ли значения по типу. Правила самой задачи проверяет
          Planner. Принятая анкета ещё не означает, что задача создана.
        </p>
        <p>
          Перед правкой найдём `TaskCreate` в `app/api.py`. Если подходящая модель уже есть,
          используем её. Второй класс с тем же именем не создаём: так легко запутать код и следующий
          обработчик. Существующие строки вокруг модели оставляем без изменений.
        </p>
        <CodeSequence
          title="Собираем минимальную модель"
          prompt="Соберите модель из четырёх строк. Не добавляйте поля Planner и ограничения приоритета."
          pieces={[
            { id: "import", code: "from pydantic import BaseModel" },
            { id: "class", code: "class TaskCreate(BaseModel):" },
            { id: "title", code: "    title: str" },
            { id: "priority", code: "    priority: int" },
            { id: "id", code: "    id: int", note: "поле Planner" },
            { id: "field", code: "    priority: int = Field(ge=1, le=5)", note: "ограничение следующей темы" },
          ]}
          correctOrder={["import", "class", "title", "priority"]}
          explanation="Правильно: импорт, класс и два обязательных поля. id задаёт Planner, а ограничение приоритета здесь не добавляем."
          incorrectExplanation="Порядок такой: импорт, класс, title и priority. Уберите id и Field, затем проверьте последовательность ещё раз."
        />
        <p>
          В практике выполним то же действие в `app/api.py`: проверим модель и при необходимости
          добавим этот код рядом с импортами, до маршрутов. После этого перейдём в Python и создадим
          настоящий экземпляр.
        </p>
      </Section>

      <Section number="03" title="Обычное преобразование не задаёт правила задачи">
        <p>
          Аннотация `priority: int` задаёт тип поля. В обычном режиме Pydantic может преобразовать
          строку `"4"` в число `4`. После создания объекта проверим само значение и его тип. Такое
          преобразование уже встречалось в старом занятии 56; сейчас повторим его отдельно.
        </p>
        <QuizCard
          question={'При прямом создании TaskCreate(title="Повторить API", priority="4"), что хранит атрибут priority в обычном режиме Pydantic?'}
          options={["Строку \"4\", потому что такой тип пришёл от клиента", "Целое число 4 после преобразования", "HTTP-ответ 422 ещё до создания объекта"]}
          correctIndex={1}
          explanation={'Pydantic преобразует строку "4" в int. Прямой вызов создаёт объект или даёт ValidationError. HTTP-статуса здесь нет.'}
        />
        <p>
          Преобразование типа не проверяет правила Planner. `priority: int` означает «целое число»,
          но не задаёт диапазон 1–5. Этот диапазон проверяют `Task` и сервис. Здесь мы не добавляем
          `Field`, строгий режим или валидатор.
        </p>
        <p>
          Поэтому простая модель может принять `priority=0`: значение имеет тип `int`. Позже Planner
          отклонит его по правилам задачи. Это две разные проверки. Сейчас проверяем тип и
          преобразование, а не диапазон.
        </p>
        <p>
          Если не передать обязательное поле или дать `title` неподходящего типа, прямое создание
          закончится `ValidationError`. Прочитайте сообщение ошибки: в нём указано проблемное поле.
          В следующем занятии FastAPI вернёт 422 до вызова обработчика. При прямом запуске модели
          HTTP-статуса нет.
        </p>
        <CodeBlock
          caption="Проверим в интерпретаторе"
          code={`from app.api import TaskCreate
from pydantic import ValidationError

number = TaskCreate(title="Проверить вход", priority=4)
text_number = TaskCreate(title="Проверить вход", priority="4")
print(number.priority, type(number.priority).__name__)
print(text_number.priority, type(text_number.priority).__name__)

try:
    TaskCreate(title="Проверить вход")
except ValidationError as error:
    print(error)

try:
    TaskCreate(title=4, priority=4)
except ValidationError as error:
    print(error)`}
        />
        <p>
          Первые две строки проверки должны показать `4 int`. В двух случаях ниже Pydantic покажет
          `ValidationError`: сначала не хватает `priority`, затем число не подходит полю `title`.
          В практике выполним эти же четыре примера в `.venv` проекта.
        </p>
        <TrueFalse
          statement={
            <>
              Если `TaskCreate` приняла `priority: int`, значит любое целое значение, включая 0,
              уже разрешено правилами Planner.
            </>
          }
          isTrue={false}
          explanation="Аннотация проверяет тип. Диапазон проверяет Planner, поэтому в этом уроке не добавляем ограничение к модели."
        />
        <p>
          Так мы отличаем ошибку модели от HTTP-ошибки. В консоли видим `ValidationError`. Когда
          модель подключат к body, FastAPI вернёт 422. В обоих случаях задача ещё не создаётся.
        </p>
      </Section>

      <Section number="04" title="Поле модели не равно полю JSON-файла">
        <p>
          Экземпляр `TaskCreate` пока существует только в памяти. Чтобы создать задачу, следующее
          занятие подключит модель к `POST /tasks` и передаст поля в `PlannerService.add_task`.
          Сегодня этот код не добавляем.
        </p>
        <BugHunt
          code={`class TaskCreate(BaseModel):
    title: str
    priority: int
    id: int
    is_done: bool = False`}
          question="Какие поля убрать, чтобы оставить только данные клиента?"
          options={[
            "Убрать title и priority: они не могут быть полями модели",
            "Убрать id и is_done: их назначает Planner",
            "Добавить POST в класс, чтобы он записывал JSON",
          ]}
          correctIndex={1}
          explanation="id и is_done создаёт Planner. Во входной модели остаются только title и priority от клиента."
          fix={`class TaskCreate(BaseModel):
    title: str
    priority: int`}
        />
        <p>
          Класс схемы только описывает и проверяет вход. Он не записывает JSON. В 50.1 обработчик
          передаст проверенные `title` и `priority` сервису, а сервис создаст `Task`.
        </p>
        <p>
          В 49.1 query настраивал чтение списка. В 50.1 body передаст данные для новой задачи.
          Сейчас мы готовим модель для этих данных. Существующие GET, хранилище и CLI не меняем.
        </p>
        <Callout>
          Проверка модели сама по себе не отправляет HTTP-запрос. До занятия 50.1 не запускаем
          `POST /tasks`, не вызываем `add_task` и не меняем данные Planner.
        </Callout>
      </Section>

      <Section number="05" title="Что мы будем делать в практике">
        <p>
          Откройте тот же проект StudyHub и найдите `TaskCreate` в `app/api.py`. Если подходящая
          модель есть, используйте её. Если нет, добавьте класс из раздела 02. Затем проверьте
          примеры из раздела 03 в Python из существующей `.venv`.
        </p>
        <LinkedNotes
          variant="connected"
          items={[
            {
              title: "Проверим исходное состояние",
              description:
                "В разделе 00 разобрали точку старта. Теперь найдём app/api.py и уже настроенную .venv.",
            },
            {
              title: "Подготовим TaskCreate",
              description:
                "В разделе 02 есть пример. Проверим или добавим одну TaskCreate с title: str и priority: int.",
            },
            {
              title: "Исследуем реальный объект",
              description:
                "В разделе 03 есть четыре проверки. Повторим их в интерпретаторе и прочитаем ValidationError.",
            },
          ]}
        />
        <p>
          Результат: одна модель в `app/api.py`. В интерпретаторе проверены `priority=4`, строка
          `"4"`, пропущенное поле и неверный тип `title`. Если модель уже есть, повторного объявления
          не будет. Это готовый вход для занятия 50.1.
        </p>
        <p>
          В PowerShell из корня проекта запустите интерпретатор из `.venv` командой ниже. Так мы
          используем Pydantic из окружения StudyHub.
        </p>
        <CodeBlock caption="Интерпретатор проекта" code=".\\.venv\\Scripts\\python.exe" />
        <p>
          В 50.1 FastAPI получит эту модель из JSON body, а обработчик вызовет сервис. Здесь
          заканчиваем на проверке входных данных: POST и сохранение будут следующим шагом.
        </p>
      </Section>

      <KeyTakeaways
        points={[
          <span key="shape">`TaskCreate` описывает обязательные клиентские поля `title` и `priority`.</span>,
          <span key="role">`Task` остаётся полной предметной записью с полями, которые назначает Planner.</span>,
          <span key="conversion">Pydantic может преобразовать строку `"4"` к `int`, но аннотация не задаёт предметный диапазон.</span>,
          <span key="error">Прямое создание сообщает `ValidationError`; FastAPI оформит ошибку входного body как HTTP 422.</span>,
          <span key="next">В 50.1 модель подключится к POST; в этом шаге не меняем обработчик, сервис и JSON.</span>,
        ]}
      />
    </RichLesson>
  );
}
