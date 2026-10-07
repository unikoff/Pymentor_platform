import { GitFork, Save } from "lucide-react";
import { BranchExplorer, BugHunt, Callout, CodeBlock, CodeSequence, CompareSolutions, FillBlank, KeyTakeaways, Lead, PracticeCta, QuizCard, RecallCard, RichHero, RichLesson, Section, StepThrough, TerminalDemo, TrueFalse, TypeCard, TypeCards } from "../../shared";
import { TheoryBridge } from "../../shared";
const BLOCK_TITLE = "Блок 14 · SQLite и основы SQLAlchemy";

export function Lesson80({ module }: { module?: string }) {
  return (
    <RichLesson>
      <RichHero
        variant="project"
        chip={module ?? BLOCK_TITLE}
        title={"get_db и первая запись из FastAPI"}
        intro={"Свяжем FastAPI с SQLite через dependency injection: создадим Session на один запрос, преобразуем TaskCreate в TaskModel, выполним транзакцию и вернём TaskRead из ORM-атрибутов."}
        tags={[
          { icon: <GitFork size={14} />, label: "dependency lifecycle" },
          { icon: <Save size={14} />, label: "POST → SQLite" },
        ]}
      />
      <TheoryBridge link={"Мы уже умеем создать ORM-объект отдельным скриптом. Последний шаг блока — выдавать отдельную Session каждому HTTP-запросу через dependency get_db."} boundary={"Session не должна быть глобальной и общей для всех запросов. Dependency управляет временем жизни ресурса, а endpoint — предметным сценарием создания задачи."} />

      <Section number="01" title="Соединяем HTTP-конвейер и database-конвейер">
        <Lead>
          {"До этого задача создавалась отдельным Python-скриптом. Теперь вернёмся к FastAPI: request body проходит Pydantic-валидацию, dependency выдаёт Session, endpoint создаёт ORM-объект, а response model сериализует сохранённую строку."}
        </Lead>

        <div className="lesson-route">
          <ol>
            <li><strong>{"Открыть ресурс:"}</strong> {"get_db создаёт Session перед endpoint."}</li>
            <li><strong>{"Проверить вход:"}</strong> {"TaskCreate принимает только разрешённые поля."}</li>
            <li><strong>{"Преобразовать:"}</strong> {"Pydantic-данные превращаются в TaskModel."}</li>
            <li><strong>{"Зафиксировать:"}</strong> {"Session выполняет add, commit и refresh."}</li>
            <li><strong>{"Вернуть контракт:"}</strong> {"TaskRead читает ORM-атрибуты и формирует JSON."}</li>
          </ol>
          <p>{"Результат блока — POST /tasks, который сохраняет запись в SQLite и переживает перезапуск API."}</p>
        </div>

        <BranchExplorer
          code={`POST /tasks JSON
  ↓
TaskCreate validation
  ↓
get_db → Session
  ↓
TaskModel
  ↓
INSERT + COMMIT
  ↓
TaskRead
  ↓
201 JSON response`}
          scenarios={[
            { label: "невалидный body", activeLine: 1, output: "422 до endpoint" },
            { label: "валидный body", activeLine: 4, output: "строка сохранена" },
            { label: "ответ", activeLine: 6, output: "клиент получает id и is_done" },
          ]}
        />

        <Callout tone="info">
          {"Endpoint остаётся orchestration layer: связывает контракты и инфраструктуру, но не создаёт Engine и не управляет глобальным состоянием."}
        </Callout>
      </Section>
      <Section number="02" title="Dependency с yield управляет временем жизни Session">
        <Lead>
          {"FastAPI dependency может не только вернуть значение, но и выполнить завершающее действие после ответа. Код до yield подготавливает ресурс, значение yield передаётся endpoint, а выход из with закрывает Session."}
        </Lead>

        <CodeBlock
          caption="app/database.py"
          code={`from collections.abc import Generator

from sqlalchemy.orm import Session


def get_db() -> Generator[Session, None, None]:
    with SessionFactory() as session:
        yield session`}
        />

        <StepThrough
          code={`def get_db():
    with SessionFactory() as session:
        yield session


def endpoint(session = Depends(get_db)):
    return {"ok": True}`}
          steps={[
            { line: 1, note: "Dependency вызывается для запроса.", vars: { request: "started" } },
            { line: 2, note: "Создаётся отдельная Session.", vars: { session: "open" } },
            { line: 3, note: "Session передаётся endpoint.", vars: { ownership: "request" } },
            { line: 6, note: "Endpoint формирует ответ.", vars: { response: "ready" } },
            { line: 2, note: "После завершения with закрывает Session.", vars: { session: "closed" } },
          ]}
        />

        <CodeSequence
          title="Соберите жизненный цикл dependency"
          prompt="Расположите события одного HTTP-запроса."
          pieces={[
            { id: "call", code: "FastAPI вызывает get_db" },
            { id: "open", code: "SessionFactory создаёт Session" },
            { id: "yield", code: "yield передаёт Session endpoint" },
            { id: "endpoint", code: "endpoint выполняет database operation" },
            { id: "close", code: "контекстный менеджер закрывает Session" },
          ]}
          correctOrder={["call", "open", "yield", "endpoint", "close"]}
          explanation="Dependency владеет ресурсом от подготовки до завершения запроса."
        />

        <Callout>
          {"get_db не обязана выполнять commit автоматически. Транзакционная граница должна оставаться видимой в сценарии записи."}
        </Callout>
      </Section>
      <Section number="03" title="Annotated создаёт читаемый тип SessionDep">
        <Lead>
          {"Сигнатура Session вместе с Depends повторяется во многих endpoint. Annotated позволяет сохранить и Python-тип, и инструкцию FastAPI в одном переиспользуемом alias."}
        </Lead>

        <CodeBlock
          caption="app/dependencies.py"
          code={`from typing import Annotated

from fastapi import Depends
from sqlalchemy.orm import Session

from app.database import get_db

SessionDep = Annotated[Session, Depends(get_db)]`}
        />

        <CompareSolutions
          question="Какая сигнатура яснее отделяет dependency declaration?"
          left={{
            title: "Повтор в endpoint",
            code: "session: Session = Depends(get_db)",
            note: "Работает, но повторяет связку во многих функциях.",
          }}
          right={{
            title: "Типизированный alias",
            code: "session: SessionDep",
            note: "Тип и источник зависимости определены один раз.",
          }}
          preferred="right"
          explanation="Alias уменьшает шум, не скрывая реальный тип Session."
        />

        <FillBlank
          prompt="Укажите функцию, которая создаёт Session для запроса."
          before="SessionDep = Annotated[Session, Depends("
          after=")]"
          options={["get_db", "create_engine", "TaskModel"]}
          answer="get_db"
          explanation="Depends вызывает dependency provider get_db."
        />

        <TrueFalse
          statement={<>SessionDep создаёт глобальную Session во время импорта модуля.</>}
          isTrue={false}
          explanation="Alias хранит метаданные dependency; реальная Session создаётся при обработке каждого запроса."
        />
      </Section>
      <Section number="04" title="Pydantic → ORM: явное преобразование входа">
        <Lead>
          {"TaskCreate уже прошла HTTP-валидацию. Через model_dump получаем словарь разрешённых полей и распаковываем его в конструктор TaskModel. Служебные id и is_done клиент не контролирует."}
        </Lead>

        <CodeBlock
          caption="создаём ORM-объект"
          code={`def create_task(
    payload: TaskCreate,
    session: SessionDep,
) -> TaskModel:
    task_data = payload.model_dump()
    task = TaskModel(**task_data)

    session.add(task)
    session.commit()
    session.refresh(task)

    return task`}
        />

        <StepThrough
          code={`payload = TaskCreate(
    title="SQLite из FastAPI",
    priority=4,
)
task_data = payload.model_dump()
task = TaskModel(**task_data)`}
          steps={[
            { line: 0, note: "Pydantic уже проверил значения.", vars: { payload: "TaskCreate" } },
            { line: 4, note: "model_dump создаёт словарь публичных полей.", vars: { task_data: "{title, description, priority}" } },
            { line: 5, note: "Распаковка передаёт поля ORM-конструктору.", vars: { task: "transient TaskModel" } },
          ]}
        />

        <BugHunt
          code={`task = TaskModel(
    id=payload.id,
    title=payload.title,
    is_done=payload.is_done,
)`}
          question="Почему такой контракт создания опасен?"
          options={[
            "клиент получает контроль над служебными полями id и is_done",
            "SQLAlchemy запрещает title",
            "Pydantic не поддерживает числа",
          ]}
          correctIndex={0}
          explanation="Create-schema должна разрешать только поля, которые пользователь вправе задавать."
          fix={`task = TaskModel(**payload.model_dump())`}
        />

        <Callout tone="info">
          {"Явный mapper-функционал понадобится, когда имена и структура слоёв разойдутся. Пока model_dump и конструктор сохраняют минимальную прозрачную версию."}
        </Callout>
      </Section>
      <Section number="05" title="TaskRead читает ORM-атрибуты">
        <Lead>
          {"После commit endpoint возвращает TaskModel. Pydantic должна уметь читать не словарь, а атрибуты ORM-объекта. В Pydantic v2 это включается через ConfigDict(from_attributes=True)."}
        </Lead>

        <CodeBlock
          caption="app/schemas.py"
          code={`from pydantic import BaseModel, ConfigDict, Field


class TaskCreate(BaseModel):
    title: str = Field(min_length=1, max_length=120)
    description: str | None = Field(
        default=None,
        max_length=500,
    )
    priority: int = Field(default=3, ge=1, le=5)


class TaskRead(TaskCreate):
    model_config = ConfigDict(from_attributes=True)

    id: int
    is_done: bool`}
        />

        <TypeCards>
          <TypeCard badge="input" title="TaskCreate">
            {"Проверяет JSON клиента до выполнения endpoint."}
          </TypeCard>
          <TypeCard badge="ORM" badgeTone="float" title="TaskModel">
            {"Содержит mapped-атрибуты и связан со строкой SQLite."}
          </TypeCard>
          <TypeCard badge="output" badgeTone="str" title="TaskRead">
            {"Фильтрует и сериализует ответ по публичному контракту."}
          </TypeCard>
        </TypeCards>

        <TrueFalse
          statement={<>from_attributes=True превращает Pydantic-схему в ORM-модель.</>}
          isTrue={false}
          explanation="Настройка только разрешает валидацию из атрибутов объекта; ответственности классов остаются разными."
        />

        <Callout>
          {"Response model защищает границу API. Даже если в TaskModel позже появится внутреннее поле, оно не попадёт в JSON без объявления в TaskRead."}
        </Callout>
      </Section>
      <Section number="06" title="Полный POST /tasks с кодом 201">
        <Lead>
          {"Соберём минимальный endpoint. Он принимает знакомую TaskCreate, получает Session через DI и возвращает сохранённую задачу по TaskRead."}
        </Lead>

        <CodeBlock
          caption="app/routers/tasks.py"
          code={`from fastapi import APIRouter, status

from app.dependencies import SessionDep
from app.models import TaskModel
from app.schemas import TaskCreate, TaskRead

router = APIRouter(
    prefix="/tasks",
    tags=["tasks"],
)


@router.post(
    "",
    response_model=TaskRead,
    status_code=status.HTTP_201_CREATED,
)
def create_task(
    payload: TaskCreate,
    session: SessionDep,
) -> TaskModel:
    task = TaskModel(**payload.model_dump())

    session.add(task)
    session.commit()
    session.refresh(task)

    return task`}
        />

        <BranchExplorer
          code={`request body
  ↓
TaskCreate
  ↓
TaskModel(**model_dump())
  ↓
session.add
  ↓
session.commit
  ↓
session.refresh
  ↓
TaskRead response`}
          scenarios={[
            { label: "title пустой", activeLine: 1, output: "422, INSERT не выполняется" },
            { label: "валидная задача", activeLine: 4, output: "COMMIT фиксирует строку" },
            { label: "успешный ответ", activeLine: 6, output: "201 с id" },
          ]}
        />

        <Callout tone="info">
          {"Мы намеренно не добавляем try/except вокруг каждого вызова. Конкретные database exceptions и единый rollback-сценарий подробно появятся в блоке 15."}
        </Callout>
      </Section>
      <Section number="07" title="Доказываем постоянство и исключаем глобальную Session">
        <Lead>
          {"Готовность блока проверяется не только ответом 201. Нужно остановить API, запустить его снова и убедиться, что созданная строка осталась в SQLite. Для диагностики пока используем отдельный inspection-скрипт."}
        </Lead>

        <TerminalDemo
          title="сквозной сценарий"
          lines={[
            { cmd: "uvicorn app.main:app --reload" },
            { out: "POST /tasks → 201 {\"id\":1,\"title\":\"SQLite\",...}" },
            { cmd: "Ctrl+C" },
            { out: "процесс остановлен" },
            { cmd: "python -m scripts.inspect_tasks" },
            { out: "1 | SQLite | priority=4 | is_done=0" },
            { cmd: "uvicorn app.main:app --reload" },
            { out: "следующий POST /tasks получает id=2" },
          ]}
        />

        <BugHunt
          code={`session = SessionFactory()


@router.post("/tasks")
def create_task(payload: TaskCreate):
    # все запросы используют один session
    ...`}
          question="Какой архитектурный дефект показан?"
          options={[
            "одна mutable Session разделяется между запросами",
            "endpoint использует POST",
            "TaskCreate содержит title",
          ]}
          correctIndex={0}
          explanation="Ошибки, транзакции и identity map разных запросов будут смешиваться."
          fix={`def get_db():
    with SessionFactory() as session:
        yield session


@router.post("/tasks")
def create_task(payload: TaskCreate, session: SessionDep):
    ...`}
        />

        <RecallCard
          question="Как доказать, что API больше не использует временное in-memory storage?"
          answer={<p>{"Создать запись через HTTP, полностью остановить процесс и прочитать ту же строку из файла SQLite после нового запуска."}</p>}
        />

        <Callout>
          {"GET /tasks через ORM появится в следующем занятии блока 15. Сейчас inspection-скрипт помогает проверить хранение без преждевременного введения select."}
        </Callout>
      </Section>
      <Section number="08" title="Контрольная точка">
        <Lead>
          {"Соберите модель занятия целиком: назовите назначение механизма, проследите путь данных, объясните границу применения и только затем переходите к практической проверке."}
        </Lead>

        <div className="lesson-check-group">
          <QuizCard
            question={"Что делает get_db?"}
            options={[
              "выдаёт Session на время запроса",
              "создаёт ORM-модель",
              "валидирует JSON",
            ]}
            correctIndex={0}
            explanation={"Dependency управляет жизненным циклом database Session."}
          />
          <QuizCard
            question={"Зачем используется yield?"}
            options={[
              "передать ресурс и затем завершить его",
              "создать таблицу",
              "вернуть HTTP 422",
            ]}
            correctIndex={0}
            explanation={"Код после yield/выход из context manager выполняет cleanup."}
          />
          <QuizCard
            question={"Что передаётся в TaskModel?"}
            options={[
              "payload.model_dump()",
              "response.headers",
              "Base.metadata",
            ]}
            correctIndex={0}
            explanation={"Словарь проверенных create-полей распаковывается в ORM-конструктор."}
          />
          <QuizCard
            question={"Зачем TaskRead from_attributes=True?"}
            options={[
              "читать атрибуты ORM-объекта",
              "открывать SQLite-файл",
              "выполнять commit",
            ]}
            correctIndex={0}
            explanation={"Pydantic сериализует объект по его атрибутам."}
          />
        </div>

        <KeyTakeaways
          points={[
            <>{"get_db создаёт отдельную Session для одного HTTP-запроса."}</>,
            <>{"Dependency с yield связывает выдачу ресурса и cleanup."}</>,
            <>{"Annotated сохраняет тип Session и декларацию Depends."}</>,
            <>{"TaskCreate ограничивает разрешённые входные поля."}</>,
            <>{"model_dump передаёт проверенные данные ORM-модели."}</>,
            <>{"TaskRead с from_attributes сериализует ORM-объект."}</>,
            <>{"POST /tasks возвращает 201 только после успешного commit."}</>,
            <>{"Постоянство доказывается повторным чтением после перезапуска."}</>,
          ]}
        />

        <div className="lesson-practice-steps">
          <h3>{"Критерии готовности"}</h3>
          <ul>
            <li>{"объясняете lifecycle dependency с yield"}</li>
            <li>{"получаете отдельную Session в endpoint"}</li>
            <li>{"преобразуете TaskCreate в TaskModel"}</li>
            <li>{"возвращаете TaskRead с id и is_done"}</li>
            <li>{"доказываете сохранение после перезапуска процесса"}</li>
          </ul>
        </div>

        <PracticeCta text={"Подключите get_db и SessionDep, реализуйте POST /tasks, создайте задачу через Swagger или Postman и подтвердите строку inspection-скриптом после полного перезапуска API. Зафиксируйте результат отдельным Git-коммитом."} />
      </Section>
    </RichLesson>
  );
}
