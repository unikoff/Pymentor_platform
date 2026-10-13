import { ListChecks, ShieldCheck } from "lucide-react";
import { BranchExplorer, BugHunt, Callout, CodeBlock, CodeSequence, CompareSolutions, KeyTakeaways, Lead, MethodGrid, PracticeCta, PredictOutput, QuizCard, RecallCard, RichHero, RichLesson, Section, TerminalDemo, TrueFalse, TypeCard, TypeCards } from "../../shared";
import { TheoryBridge } from "../../shared";
const BLOCK_TITLE = "Блок 18 · Cookie и серверные сессии";

export function Lesson104({ module }: { module?: string }) {
  return (
    <RichLesson>
      <RichHero
        variant="project"
        chip={module ?? BLOCK_TITLE}
        title={"Владение задачами и session-тесты"}
        intro={"Превратим общий CRUD StudyHub в личное пространство: сервер назначит task.user_id из CurrentUser, каждый SELECT будет ограничен владельцем, а тесты двух пользователей докажут отсутствие горизонтального доступа."}
        tags={[
          { icon: <ShieldCheck size={14} />, label: "ownership authorization" },
          { icon: <ListChecks size={14} />, label: "two-user test matrix" },
        ]}
      />
      <TheoryBridge link={"Аутентифицированный пользователь известен приложению. Последний шаг блока — ограничить CRUD задач владельцем и доказать это интеграционными тестами двух пользователей."} boundary={"user_id из request body не является источником истины. Владельца назначает сервер из current_user, а поиск выполняется сразу по task_id и user_id."} />

      <Section number="01" title="Аутентификация отвечает «кто», ownership — «можно ли»">
        <Lead>
          {"CurrentUser подтверждает личность, но этого недостаточно для доступа к любой задаче. Authorization проверяет отношение пользователя к конкретному ресурсу. В StudyHub базовое правило звучит так: пользователь работает только со своими задачами."}
        </Lead>

        <div className="lesson-route">
          <ol>
            <li>
              <strong>{"Назначить владельца:"}</strong> {"при создании server записывает current_user.id в task.user_id."}
            </li>
            <li>
              <strong>{"Ограничить коллекцию:"}</strong> {"список выбирает только строки текущего пользователя."}
            </li>
            <li>
              <strong>{"Ограничить объект:"}</strong> {"поиск объединяет task_id и user_id в одном WHERE."}
            </li>
            <li>
              <strong>{"Доказать тестами:"}</strong> {"User B не читает, не изменяет и не удаляет Task A."}
            </li>
          </ol>
          <p>
            {"Это первая полноценная object-level authorization: решение зависит не только от роли пользователя, но и от владельца конкретной строки."}
          </p>
        </div>

        <BranchExplorer
          code={"authenticated request\n  ↓ CurrentUser\nuser id=8\n  ↓ query scope\nWHERE task.user_id = 8\n  ↓ result\nown task or 404\n  ↓ operation\nread/update/delete"}
          scenarios={[
            { label: "личность", activeLine: 2, output: "current_user.id = 8" },
            { label: "область", activeLine: 4, output: "только owner_id=8" },
            { label: "чужая задача", activeLine: 6, output: "404 без раскрытия" },
            { label: "своя задача", activeLine: 8, output: "операция разрешена" },
          ]}
        />

        <Callout tone="info">
          {"Authentication и authorization выполняются последовательно. Действующая session не даёт автоматического доступа к ресурсам других пользователей."}
        </Callout>
      </Section>

      <Section number="02" title="Foreign key владельца в TaskModel">
        <Lead>
          {"Владение становится частью модели хранения. Колонка user_id ссылается на users.id и является обязательной для новой личной задачи."}
        </Lead>

        <CodeBlock
          caption="ORM-модель задачи"
          code={"from sqlalchemy import ForeignKey, String\nfrom sqlalchemy.orm import Mapped, mapped_column, relationship\n\nclass TaskModel(Base):\n    __tablename__ = \"tasks\"\n\n    id: Mapped[int] = mapped_column(primary_key=True)\n    title: Mapped[str] = mapped_column(String(200))\n    is_done: Mapped[bool] = mapped_column(default=False)\n    user_id: Mapped[int] = mapped_column(\n        ForeignKey(\"users.id\"),\n        nullable=False,\n        index=True,\n    )\n\n    owner: Mapped[\"UserModel\"] = relationship(\n        back_populates=\"tasks\",\n    )"}
        />

        <CodeBlock
          caption="обратная relationship"
          code={"class UserModel(Base):\n    __tablename__ = \"users\"\n\n    # id, email, password_hash, ...\n\n    tasks: Mapped[list[\"TaskModel\"]] = relationship(\n        back_populates=\"owner\",\n    )"}
        />

        <TypeCards>
          <TypeCard badge="foreign key" title="user_id" code={"tasks.user_id → users.id"}>
            {"Хранит идентификатор владельца и поддерживает ссылочную целостность."}
          </TypeCard>
          <TypeCard badge="relationship" badgeTone="float" title="owner" code={"task.owner"}>
            {"ORM-навигация к объекту User. Она не заменяет колонку foreign key."}
          </TypeCard>
          <TypeCard badge="scope" badgeTone="str" title="query condition" code={"TaskModel.user_id == current_user.id"}>
            {"Фактическое authorization-ограничение каждого запроса."}
          </TypeCard>
        </TypeCards>

        <RecallCard
          question="Достаточно ли наличия foreign key для запрета чужого доступа?"
          answer={<p>{"Нет. Foreign key проверяет существование связанного User, но endpoint всё равно обязан ограничить SELECT владельцем."}</p>}
        />

        <Callout>
          {"Миграция существующей таблицы с данными требует отдельной стратегии заполнения user_id. В учебной чистой базе можно сразу сделать колонку nullable=False."}
        </Callout>
      </Section>

      <Section number="03" title="Владелец назначается сервером">
        <Lead>
          {"TaskCreate не содержит user_id. Клиент описывает предметные поля задачи, а ownership вычисляется из CurrentUser. Это предотвращает подмену владельца через request body."}
        </Lead>

        <CodeBlock
          caption="HTTP-схема без user_id"
          code={"from pydantic import BaseModel, Field\n\nclass TaskCreate(BaseModel):\n    title: str = Field(min_length=1, max_length=200)\n\nclass TaskRead(BaseModel):\n    id: int\n    title: str\n    is_done: bool\n    user_id: int\n\n    model_config = {\"from_attributes\": True}"}
        />

        <CodeBlock
          caption="создание от имени current user"
          code={"@router.post(\n    \"\",\n    response_model=TaskRead,\n    status_code=201,\n)\ndef create_task(\n    data: TaskCreate,\n    current_user: CurrentUser,\n    db: SessionDep,\n):\n    task = TaskModel(\n        title=data.title,\n        is_done=False,\n        user_id=current_user.id,\n    )\n\n    db.add(task)\n    db.commit()\n    db.refresh(task)\n    return task"}
        />

        <CompareSolutions
          question="Как определяется owner новой задачи?"
          left={{
            title: "Довериться body",
            code: "{\"title\": \"SQL\", \"user_id\": 1}",
            note: "Клиент может указать id другого пользователя.",
          }}
          right={{
            title: "Использовать CurrentUser",
            code: "user_id=current_user.id",
            note: "Сервер выводит владельца из проверенной session.",
          }}
          preferred="right"
          explanation={"Authorization context формируется сервером, а не принимается как свободный ввод."}
        />

        <BugHunt
          code={"class TaskCreate(BaseModel):\n    title: str\n    user_id: int\n\n# endpoint сохраняет data.user_id"}
          question="Какую уязвимость создаёт такой контракт?"
          options={[
            "Клиент может назначить задачу другому владельцу",
            "Pydantic перестанет проверять title",
            "Cookie станет просроченной",
          ]}
          correctIndex={0}
          explanation="Владелец является server-controlled полем."
          fix={"class TaskCreate(BaseModel):\n    title: str\n\n# endpoint использует current_user.id"}
        />
      </Section>

      <Section number="04" title="Список задач всегда ограничен пользователем">
        <Lead>
          {"GET /tasks не должен сначала загружать все строки и фильтровать Python-кодом. Ownership выражается в SQLAlchemy statement, чтобы чужие записи вообще не попадали в результат."}
        </Lead>

        <CodeBlock
          caption="scoped collection query"
          code={"from sqlalchemy import select\n\n@router.get(\"\", response_model=list[TaskRead])\ndef list_tasks(\n    current_user: CurrentUser,\n    db: SessionDep,\n):\n    statement = (\n        select(TaskModel)\n        .where(TaskModel.user_id == current_user.id)\n        .order_by(TaskModel.id)\n    )\n\n    return list(db.scalars(statement))"}
        />

        <CompareSolutions
          question="Где лучше применять ownership filter?"
          left={{
            title: "После SELECT всех задач",
            code: "[task for task in all_tasks if task.user_id == user.id]",
            note: "Чужие строки уже загружены в процесс и могут случайно утечь.",
          }}
          right={{
            title: "В WHERE базы",
            code: "where(TaskModel.user_id == current_user.id)",
            note: "База возвращает только разрешённую область.",
          }}
          preferred="right"
          explanation={"Authorization scope должен быть частью запроса к данным."}
        />

        <PredictOutput
          code={"tasks in database:\n  #1 user_id=7\n  #2 user_id=8\n  #3 user_id=7\n\ncurrent_user.id = 7\nWHERE Task.user_id == 7"}
          output={"Вернутся задачи #1 и #3."}
          hint="Task #2 не должна попадать в Python-результат."
        />

        <TrueFalse
          statement={<>{"CurrentUser автоматически добавляет WHERE user_id к любому SQLAlchemy-запросу."}</>}
          isTrue={false}
          explanation={"Dependency предоставляет User, но разработчик явно применяет authorization scope к statement."}
        />

        <Callout tone="info">
          {"Явное условие полезно для обучения и code review: из запроса видно, на каком основании данные доступны."}
        </Callout>
      </Section>

      <Section number="05" title="Один объект ищется сразу по id и owner">
        <Lead>
          {"Для чтения, изменения и удаления используется общий helper get_owned_task_or_404. Он объединяет идентификатор ресурса и владельца в одном запросе."}
        </Lead>

        <CodeBlock
          caption="ownership helper"
          code={"from fastapi import HTTPException\n\ndef get_owned_task_or_404(\n    db: Session,\n    task_id: int,\n    user_id: int,\n) -> TaskModel:\n    statement = select(TaskModel).where(\n        TaskModel.id == task_id,\n        TaskModel.user_id == user_id,\n    )\n\n    task = db.scalar(statement)\n\n    if task is None:\n        raise HTTPException(\n            status_code=404,\n            detail=\"Задача не найдена\",\n        )\n\n    return task"}
        />

        <TypeCards>
          <TypeCard badge="missing" title="Задачи нет" code={"id=999"}>
            {"Helper возвращает 404."}
          </TypeCard>
          <TypeCard badge="foreign" badgeTone="float" title="Задача чужая" code={"id=5, owner=other"}>
            {"Helper также возвращает 404 и не подтверждает существование ресурса."}
          </TypeCard>
          <TypeCard badge="owned" badgeTone="str" title="Задача своя" code={"id=5, owner=current"}>
            {"Helper возвращает ORM-объект для дальнейшей операции."}
          </TypeCard>
        </TypeCards>

        <BranchExplorer
          code={"SELECT task\nWHERE id = task_id\n  AND user_id = current_user.id\n\nif no row:\n    404\nelse:\n    return owned task"}
          scenarios={[
            { label: "не существует", activeLine: 5, output: "404" },
            { label: "существует, но чужая", activeLine: 5, output: "404" },
            { label: "существует и своя", activeLine: 7, output: "TaskModel" },
          ]}
        />

        <RecallCard
          question="Почему для missing и foreign task используется одинаковый 404?"
          answer={<p>{"Ответ не раскрывает аутентифицированному пользователю существование чужого ресурса. Для его области обе ситуации выглядят как отсутствие доступной задачи."}</p>}
        />

        <Callout>
          {"Сначала загрузить задачу только по id, а затем проверить owner тоже возможно, но единый scoped query уменьшает шанс забыть вторую проверку."}
        </Callout>
      </Section>

      <Section number="06" title="Update и delete используют один authorization helper">
        <Lead>
          {"После get_owned_task_or_404 предметная операция становится обычной: обновить разрешённый объект или удалить его. Ownership не копируется отдельными if во все endpoint."}
        </Lead>

        <CodeBlock
          caption="частичное обновление"
          code={"@router.patch(\"/{task_id}\", response_model=TaskRead)\ndef update_task(\n    task_id: int,\n    data: TaskPatch,\n    current_user: CurrentUser,\n    db: SessionDep,\n):\n    task = get_owned_task_or_404(\n        db,\n        task_id,\n        current_user.id,\n    )\n\n    for field, value in data.model_dump(\n        exclude_unset=True,\n    ).items():\n        setattr(task, field, value)\n\n    db.commit()\n    db.refresh(task)\n    return task"}
        />

        <CodeBlock
          caption="удаление"
          code={"@router.delete(\n    \"/{task_id}\",\n    status_code=204,\n)\ndef delete_task(\n    task_id: int,\n    current_user: CurrentUser,\n    db: SessionDep,\n) -> None:\n    task = get_owned_task_or_404(\n        db,\n        task_id,\n        current_user.id,\n    )\n\n    db.delete(task)\n    db.commit()"}
        />

        <CodeSequence
          title="Соберите защищённый PATCH"
          prompt="Расположите действия от authentication до response."
          pieces={[
            { id: "current", code: "resolve CurrentUser" },
            { id: "owned", code: "get_owned_task_or_404" },
            { id: "patch", code: "apply provided fields" },
            { id: "commit", code: "db.commit()" },
            { id: "refresh", code: "db.refresh(task)" },
            { id: "return", code: "return TaskRead" },
          ]}
          correctOrder={["current", "owned", "patch", "commit", "refresh", "return"]}
          explanation="Изменение начинается только после подтверждения пользователя и владения ресурсом."
        />

        <BugHunt
          code={"task = db.get(TaskModel, task_id)\ntask.title = data.title\ndb.commit()"}
          question="Какая проверка отсутствует?"
          options={[
            "Task.user_id должен совпасть с current_user.id",
            "Session cookie должна стать JWT",
            "title нужно сохранить в users",
          ]}
          correctIndex={0}
          explanation="Поиск только по id позволяет менять чужой ресурс."
          fix={"task = get_owned_task_or_404(\n    db,\n    task_id,\n    current_user.id,\n)\ntask.title = data.title\ndb.commit()"}
        />
      </Section>

      <Section number="07" title="Session-тесты двух пользователей">
        <Lead>
          {"Наиболее важный тест блока строит два независимых аккаунта и два клиента. Он доказывает не только успешный CRUD, но и отрицательную границу: User B не может воздействовать на Task A."}
        </Lead>

        <CodeBlock
          caption="fixture двух клиентов"
          code={"def make_logged_client(app, email, password):\n    client = TestClient(app)\n    response = client.post(\n        \"/auth/session/login\",\n        json={\"email\": email, \"password\": password},\n    )\n    assert response.status_code == 200\n    return client\n\nalice = make_logged_client(app, \"alice@example.com\", \"alice-pass\")\nbob = make_logged_client(app, \"bob@example.com\", \"bob-password\")"}
        />

        <CodeBlock
          caption="чужая задача недоступна"
          code={"created = alice.post(\n    \"/tasks\",\n    json={\"title\": \"Private task\"},\n)\ntask_id = created.json()[\"id\"]\n\nassert bob.get(f\"/tasks/{task_id}\").status_code == 404\nassert bob.patch(\n    f\"/tasks/{task_id}\",\n    json={\"title\": \"Hacked\"},\n).status_code == 404\nassert bob.delete(f\"/tasks/{task_id}\").status_code == 404\n\nstill_owned = alice.get(f\"/tasks/{task_id}\")\nassert still_owned.status_code == 200\nassert still_owned.json()[\"title\"] == \"Private task\""}
        />

        <MethodGrid
          rows={[
            [<>anonymous → GET /tasks</>, "401: нет действующей session"],
            [<>Alice → Alice task</>, "200: ресурс принадлежит current user"],
            [<>Bob → Alice task</>, "404: ресурс отсутствует в области Bob"],
            [<>Bob PATCH → Alice task</>, "404 и данные не изменены"],
            [<>Bob DELETE → Alice task</>, "404 и строка остаётся в базе"],
          ]}
        />

        <TerminalDemo
          title="authorization regression suite"
          lines={[
            { cmd: "pytest tests/test_task_ownership.py -q" },
            { out: "anonymous list rejected PASSED" },
            { out: "owner reads task PASSED" },
            { out: "foreign read hidden PASSED" },
            { out: "foreign update blocked PASSED" },
            { out: "foreign delete blocked PASSED" },
            { out: "owner data unchanged PASSED" },
            { out: "6 passed" },
          ]}
        />

        <Callout tone="info">
          {"После запрещённого PATCH обязательно проверьте состояние задачи владельцем. Один status code не доказывает отсутствие побочного изменения."}
        </Callout>

        <div className="lesson-practice-steps">
          <h3>{"Проверить create"}</h3>
          <p>
            {"Alice создаёт задачу без user_id в body. В response и базе owner равен Alice."}
          </p>
          <h3>{"Проверить collection scope"}</h3>
          <p>
            {"После создания задач Alice и Bob каждый GET /tasks возвращает только собственные строки."}
          </p>
          <h3>{"Проверить object scope"}</h3>
          <p>
            {"Read, PATCH и DELETE чужого id возвращают 404. Затем владелец подтверждает, что ресурс не изменился."}
          </p>
        </div>

        <MethodGrid
          rows={[
            [<>create without user_id</>, "сервер назначает current_user.id"],
            [<>list own tasks</>, "WHERE user_id ограничивает коллекцию"],
            [<>get foreign task</>, "404 без раскрытия существования"],
            [<>patch foreign task</>, "404 и отсутствие изменения"],
            [<>delete foreign task</>, "404 и строка остаётся в базе"],
          ]}
        />

        <CodeBlock
          caption="минимальный security regression checklist"
          code={"[ ] anonymous request → 401\n[ ] owner request → success\n[ ] foreign read → 404\n[ ] foreign patch → 404 + unchanged row\n[ ] foreign delete → 404 + existing row\n[ ] request body cannot assign user_id"}
        />

        <Callout>
          {"Тест считается сильным, когда проверяет наблюдаемый результат и отсутствие запрещённого побочного эффекта, а не только одну цифру status_code."}
        </Callout>


        <TerminalDemo
          title="полный session + ownership flow"
          lines={[
            { cmd: "Alice POST /auth/session/login" },
            { out: "200 · cookie A" },
            { cmd: "Bob POST /auth/session/login" },
            { out: "200 · cookie B" },
            { cmd: "Alice POST /tasks" },
            { out: "201 · task.user_id = Alice.id" },
            { cmd: "Bob GET /tasks/{task_id}" },
            { out: "404 · foreign resource hidden" },
            { cmd: "Alice GET /tasks/{task_id}" },
            { out: "200 · owner receives task" },
          ]}
        />

        <RecallCard
          question="Как проследить решение о доступе от HTTP до SQL?"
          hint="Начните с Cookie и закончите условием WHERE."
          answer={
            <p>
              {"Cookie даёт raw session token; dependency находит активную session и User; endpoint передаёт current_user.id в scoped query; база возвращает только ресурс этого владельца."}
            </p>
          }
        />

        <Callout tone="info">
          {"Эта трассировка является итоговой моделью блока. JWT в следующем блоке изменит способ предъявления authentication data, но ownership query останется тем же."}
        </Callout>

      </Section>

      <Section number="08" title="Контрольная точка блока 18">
        <Lead>
          {"Блок завершает stateful authentication flow: браузер хранит opaque token, сервер проверяет session, CurrentUser определяет личность, а ownership ограничивает доступ к строкам. Тесты подтверждают lifecycle и изоляцию пользователей."}
        </Lead>

        <div className="lesson-check-group">
          <QuizCard
            question="Откуда берётся user_id новой задачи?"
            options={["из CurrentUser", "из request body", "из title"]}
            correctIndex={0}
            explanation="Владелец назначается сервером после проверки session."
          />
          <QuizCard
            question="Как получить список личных задач?"
            options={["добавить WHERE Task.user_id == current_user.id", "загрузить всё и довериться frontend", "читать user_id из cookie JSON"]}
            correctIndex={0}
            explanation="Authorization scope применяется на уровне запроса к базе."
          />
          <QuizCard
            question="Что вернуть для чужого task_id?"
            options={["404 без подтверждения существования", "200 с пустым owner", "500"]}
            correctIndex={0}
            explanation="Ресурс отсутствует в доступной пользователю области."
          />
          <QuizCard
            question="Что доказывает тест после запрещённого PATCH?"
            options={["чужая задача осталась неизменной", "cookie стала Secure", "пользователь удалён"]}
            correctIndex={0}
            explanation="Негативный сценарий проверяет отсутствие побочного эффекта."
          />
        </div>

        <KeyTakeaways
          points={[
            <>{"Authentication определяет пользователя, authorization — допустимую операцию."}</>,
            <><code>{"Task.user_id"}</code>{" хранит владельца как foreign key."}</>,
            <>{"user_id не принимается из TaskCreate и назначается сервером."}</>,
            <>{"Коллекции ограничиваются владельцем непосредственно в WHERE."}</>,
            <>{"Один объект ищется по task_id и current_user.id одновременно."}</>,
            <>{"Missing и foreign resource получают одинаковый 404."}</>,
            <>{"Тесты двух клиентов доказывают изоляцию и отсутствие побочных изменений."}</>,
          ]}
        />

        <PracticeCta text="Добавьте Task.user_id, миграцию и ownership scope во все CRUD endpoint. Напишите тестовую матрицу для anonymous, owner и foreign user; после запрещённых PATCH и DELETE подтвердите, что задача владельца не изменилась." />
      </Section>
    </RichLesson>
  );
}
