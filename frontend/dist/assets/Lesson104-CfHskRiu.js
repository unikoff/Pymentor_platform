import{t as e}from"./jsx-runtime-CY_jTiqj.js";import{A as t,B as n,C as r,D as i,E as a,F as o,I as s,L as c,M as l,N as u,O as d,P as f,S as p,T as m,_ as h,b as g,h as _,j as v,w as y,x as b,y as x}from"./shared-JA1PGxXr.js";import{t as S}from"./shield-check-r4OxDZ2w.js";import{t as C}from"./CodeEditor-DqHMt3P8.js";var w=e(),T=`Блок 18 · Cookie и серверные сессии`;function E({module:e}){return(0,w.jsxs)(u,{children:[(0,w.jsx)(l,{variant:`project`,chip:e??T,title:`Владение задачами и session-тесты`,intro:`Превратим общий CRUD StudyHub в личное пространство: сервер назначит task.user_id из CurrentUser, каждый SELECT будет ограничен владельцем, а тесты двух пользователей докажут отсутствие горизонтального доступа.`,tags:[{icon:(0,w.jsx)(S,{size:14}),label:`ownership authorization`},{icon:(0,w.jsx)(n,{size:14}),label:`two-user test matrix`}]}),(0,w.jsx)(o,{link:`Аутентифицированный пользователь известен приложению. Последний шаг блока — ограничить CRUD задач владельцем и доказать это интеграционными тестами двух пользователей.`,boundary:`user_id из request body не является источником истины. Владельца назначает сервер из current_user, а поиск выполняется сразу по task_id и user_id.`}),(0,w.jsxs)(f,{number:`01`,title:`Аутентификация отвечает «кто», ownership — «можно ли»`,children:[(0,w.jsx)(d,{children:`CurrentUser подтверждает личность, но этого недостаточно для доступа к любой задаче. Authorization проверяет отношение пользователя к конкретному ресурсу. В StudyHub базовое правило звучит так: пользователь работает только со своими задачами.`}),(0,w.jsxs)(`div`,{className:`lesson-route`,children:[(0,w.jsxs)(`ol`,{children:[(0,w.jsxs)(`li`,{children:[(0,w.jsx)(`strong`,{children:`Назначить владельца:`}),` `,`при создании server записывает current_user.id в task.user_id.`]}),(0,w.jsxs)(`li`,{children:[(0,w.jsx)(`strong`,{children:`Ограничить коллекцию:`}),` `,`список выбирает только строки текущего пользователя.`]}),(0,w.jsxs)(`li`,{children:[(0,w.jsx)(`strong`,{children:`Ограничить объект:`}),` `,`поиск объединяет task_id и user_id в одном WHERE.`]}),(0,w.jsxs)(`li`,{children:[(0,w.jsx)(`strong`,{children:`Доказать тестами:`}),` `,`User B не читает, не изменяет и не удаляет Task A.`]})]}),(0,w.jsx)(`p`,{children:`Это первая полноценная object-level authorization: решение зависит не только от роли пользователя, но и от владельца конкретной строки.`})]}),(0,w.jsx)(_,{code:`authenticated request
  ↓ CurrentUser
user id=8
  ↓ query scope
WHERE task.user_id = 8
  ↓ result
own task or 404
  ↓ operation
read/update/delete`,scenarios:[{label:`личность`,activeLine:2,output:`current_user.id = 8`},{label:`область`,activeLine:4,output:`только owner_id=8`},{label:`чужая задача`,activeLine:6,output:`404 без раскрытия`},{label:`своя задача`,activeLine:8,output:`операция разрешена`}]}),(0,w.jsx)(a,{tone:`info`,children:`Authentication и authorization выполняются последовательно. Действующая session не даёт автоматического доступа к ресурсам других пользователей.`})]}),(0,w.jsxs)(f,{number:`02`,title:`Foreign key владельца в TaskModel`,children:[(0,w.jsx)(d,{children:`Владение становится частью модели хранения. Колонка user_id ссылается на users.id и является обязательной для новой личной задачи.`}),(0,w.jsx)(C,{caption:`ORM-модель задачи`,code:`from sqlalchemy import ForeignKey, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

class TaskModel(Base):
    __tablename__ = "tasks"

    id: Mapped[int] = mapped_column(primary_key=True)
    title: Mapped[str] = mapped_column(String(200))
    is_done: Mapped[bool] = mapped_column(default=False)
    user_id: Mapped[int] = mapped_column(
        ForeignKey("users.id"),
        nullable=False,
        index=True,
    )

    owner: Mapped["UserModel"] = relationship(
        back_populates="tasks",
    )`}),(0,w.jsx)(C,{caption:`обратная relationship`,code:`class UserModel(Base):
    __tablename__ = "users"

    # id, email, password_hash, ...

    tasks: Mapped[list["TaskModel"]] = relationship(
        back_populates="owner",
    )`}),(0,w.jsxs)(c,{children:[(0,w.jsx)(s,{badge:`foreign key`,title:`user_id`,code:`tasks.user_id → users.id`,children:`Хранит идентификатор владельца и поддерживает ссылочную целостность.`}),(0,w.jsx)(s,{badge:`relationship`,badgeTone:`float`,title:`owner`,code:`task.owner`,children:`ORM-навигация к объекту User. Она не заменяет колонку foreign key.`}),(0,w.jsx)(s,{badge:`scope`,badgeTone:`str`,title:`query condition`,code:`TaskModel.user_id == current_user.id`,children:`Фактическое authorization-ограничение каждого запроса.`})]}),(0,w.jsx)(b,{question:`Достаточно ли наличия foreign key для запрета чужого доступа?`,answer:(0,w.jsx)(`p`,{children:`Нет. Foreign key проверяет существование связанного User, но endpoint всё равно обязан ограничить SELECT владельцем.`})}),(0,w.jsx)(a,{children:`Миграция существующей таблицы с данными требует отдельной стратегии заполнения user_id. В учебной чистой базе можно сразу сделать колонку nullable=False.`})]}),(0,w.jsxs)(f,{number:`03`,title:`Владелец назначается сервером`,children:[(0,w.jsx)(d,{children:`TaskCreate не содержит user_id. Клиент описывает предметные поля задачи, а ownership вычисляется из CurrentUser. Это предотвращает подмену владельца через request body.`}),(0,w.jsx)(C,{caption:`HTTP-схема без user_id`,code:`from pydantic import BaseModel, Field

class TaskCreate(BaseModel):
    title: str = Field(min_length=1, max_length=200)

class TaskRead(BaseModel):
    id: int
    title: str
    is_done: bool
    user_id: int

    model_config = {"from_attributes": True}`}),(0,w.jsx)(C,{caption:`создание от имени current user`,code:`@router.post(
    "",
    response_model=TaskRead,
    status_code=201,
)
def create_task(
    data: TaskCreate,
    current_user: CurrentUser,
    db: SessionDep,
):
    task = TaskModel(
        title=data.title,
        is_done=False,
        user_id=current_user.id,
    )

    db.add(task)
    db.commit()
    db.refresh(task)
    return task`}),(0,w.jsx)(m,{question:`Как определяется owner новой задачи?`,left:{title:`Довериться body`,code:`{"title": "SQL", "user_id": 1}`,note:`Клиент может указать id другого пользователя.`},right:{title:`Использовать CurrentUser`,code:`user_id=current_user.id`,note:`Сервер выводит владельца из проверенной session.`},preferred:`right`,explanation:`Authorization context формируется сервером, а не принимается как свободный ввод.`}),(0,w.jsx)(r,{code:`class TaskCreate(BaseModel):
    title: str
    user_id: int

# endpoint сохраняет data.user_id`,question:`Какую уязвимость создаёт такой контракт?`,options:[`Клиент может назначить задачу другому владельцу`,`Pydantic перестанет проверять title`,`Cookie станет просроченной`],correctIndex:0,explanation:`Владелец является server-controlled полем.`,fix:`class TaskCreate(BaseModel):
    title: str

# endpoint использует current_user.id`})]}),(0,w.jsxs)(f,{number:`04`,title:`Список задач всегда ограничен пользователем`,children:[(0,w.jsx)(d,{children:`GET /tasks не должен сначала загружать все строки и фильтровать Python-кодом. Ownership выражается в SQLAlchemy statement, чтобы чужие записи вообще не попадали в результат.`}),(0,w.jsx)(C,{caption:`scoped collection query`,code:`from sqlalchemy import select

@router.get("", response_model=list[TaskRead])
def list_tasks(
    current_user: CurrentUser,
    db: SessionDep,
):
    statement = (
        select(TaskModel)
        .where(TaskModel.user_id == current_user.id)
        .order_by(TaskModel.id)
    )

    return list(db.scalars(statement))`}),(0,w.jsx)(m,{question:`Где лучше применять ownership filter?`,left:{title:`После SELECT всех задач`,code:`[task for task in all_tasks if task.user_id == user.id]`,note:`Чужие строки уже загружены в процесс и могут случайно утечь.`},right:{title:`В WHERE базы`,code:`where(TaskModel.user_id == current_user.id)`,note:`База возвращает только разрешённую область.`},preferred:`right`,explanation:`Authorization scope должен быть частью запроса к данным.`}),(0,w.jsx)(h,{code:`tasks in database:
  #1 user_id=7
  #2 user_id=8
  #3 user_id=7

current_user.id = 7
WHERE Task.user_id == 7`,output:`Вернутся задачи #1 и #3.`,hint:`Task #2 не должна попадать в Python-результат.`}),(0,w.jsx)(p,{statement:(0,w.jsx)(w.Fragment,{children:`CurrentUser автоматически добавляет WHERE user_id к любому SQLAlchemy-запросу.`}),isTrue:!1,explanation:`Dependency предоставляет User, но разработчик явно применяет authorization scope к statement.`}),(0,w.jsx)(a,{tone:`info`,children:`Явное условие полезно для обучения и code review: из запроса видно, на каком основании данные доступны.`})]}),(0,w.jsxs)(f,{number:`05`,title:`Один объект ищется сразу по id и owner`,children:[(0,w.jsx)(d,{children:`Для чтения, изменения и удаления используется общий helper get_owned_task_or_404. Он объединяет идентификатор ресурса и владельца в одном запросе.`}),(0,w.jsx)(C,{caption:`ownership helper`,code:`from fastapi import HTTPException

def get_owned_task_or_404(
    db: Session,
    task_id: int,
    user_id: int,
) -> TaskModel:
    statement = select(TaskModel).where(
        TaskModel.id == task_id,
        TaskModel.user_id == user_id,
    )

    task = db.scalar(statement)

    if task is None:
        raise HTTPException(
            status_code=404,
            detail="Задача не найдена",
        )

    return task`}),(0,w.jsxs)(c,{children:[(0,w.jsx)(s,{badge:`missing`,title:`Задачи нет`,code:`id=999`,children:`Helper возвращает 404.`}),(0,w.jsx)(s,{badge:`foreign`,badgeTone:`float`,title:`Задача чужая`,code:`id=5, owner=other`,children:`Helper также возвращает 404 и не подтверждает существование ресурса.`}),(0,w.jsx)(s,{badge:`owned`,badgeTone:`str`,title:`Задача своя`,code:`id=5, owner=current`,children:`Helper возвращает ORM-объект для дальнейшей операции.`})]}),(0,w.jsx)(_,{code:`SELECT task
WHERE id = task_id
  AND user_id = current_user.id

if no row:
    404
else:
    return owned task`,scenarios:[{label:`не существует`,activeLine:5,output:`404`},{label:`существует, но чужая`,activeLine:5,output:`404`},{label:`существует и своя`,activeLine:7,output:`TaskModel`}]}),(0,w.jsx)(b,{question:`Почему для missing и foreign task используется одинаковый 404?`,answer:(0,w.jsx)(`p`,{children:`Ответ не раскрывает аутентифицированному пользователю существование чужого ресурса. Для его области обе ситуации выглядят как отсутствие доступной задачи.`})}),(0,w.jsx)(a,{children:`Сначала загрузить задачу только по id, а затем проверить owner тоже возможно, но единый scoped query уменьшает шанс забыть вторую проверку.`})]}),(0,w.jsxs)(f,{number:`06`,title:`Update и delete используют один authorization helper`,children:[(0,w.jsx)(d,{children:`После get_owned_task_or_404 предметная операция становится обычной: обновить разрешённый объект или удалить его. Ownership не копируется отдельными if во все endpoint.`}),(0,w.jsx)(C,{caption:`частичное обновление`,code:`@router.patch("/{task_id}", response_model=TaskRead)
def update_task(
    task_id: int,
    data: TaskPatch,
    current_user: CurrentUser,
    db: SessionDep,
):
    task = get_owned_task_or_404(
        db,
        task_id,
        current_user.id,
    )

    for field, value in data.model_dump(
        exclude_unset=True,
    ).items():
        setattr(task, field, value)

    db.commit()
    db.refresh(task)
    return task`}),(0,w.jsx)(C,{caption:`удаление`,code:`@router.delete(
    "/{task_id}",
    status_code=204,
)
def delete_task(
    task_id: int,
    current_user: CurrentUser,
    db: SessionDep,
) -> None:
    task = get_owned_task_or_404(
        db,
        task_id,
        current_user.id,
    )

    db.delete(task)
    db.commit()`}),(0,w.jsx)(y,{title:`Соберите защищённый PATCH`,prompt:`Расположите действия от authentication до response.`,pieces:[{id:`current`,code:`resolve CurrentUser`},{id:`owned`,code:`get_owned_task_or_404`},{id:`patch`,code:`apply provided fields`},{id:`commit`,code:`db.commit()`},{id:`refresh`,code:`db.refresh(task)`},{id:`return`,code:`return TaskRead`}],correctOrder:[`current`,`owned`,`patch`,`commit`,`refresh`,`return`],explanation:`Изменение начинается только после подтверждения пользователя и владения ресурсом.`}),(0,w.jsx)(r,{code:`task = db.get(TaskModel, task_id)
task.title = data.title
db.commit()`,question:`Какая проверка отсутствует?`,options:[`Task.user_id должен совпасть с current_user.id`,`Session cookie должна стать JWT`,`title нужно сохранить в users`],correctIndex:0,explanation:`Поиск только по id позволяет менять чужой ресурс.`,fix:`task = get_owned_task_or_404(
    db,
    task_id,
    current_user.id,
)
task.title = data.title
db.commit()`})]}),(0,w.jsxs)(f,{number:`07`,title:`Session-тесты двух пользователей`,children:[(0,w.jsx)(d,{children:`Наиболее важный тест блока строит два независимых аккаунта и два клиента. Он доказывает не только успешный CRUD, но и отрицательную границу: User B не может воздействовать на Task A.`}),(0,w.jsx)(C,{caption:`fixture двух клиентов`,code:`def make_logged_client(app, email, password):
    client = TestClient(app)
    response = client.post(
        "/auth/session/login",
        json={"email": email, "password": password},
    )
    assert response.status_code == 200
    return client

alice = make_logged_client(app, "alice@example.com", "alice-pass")
bob = make_logged_client(app, "bob@example.com", "bob-password")`}),(0,w.jsx)(C,{caption:`чужая задача недоступна`,code:`created = alice.post(
    "/tasks",
    json={"title": "Private task"},
)
task_id = created.json()["id"]

assert bob.get(f"/tasks/{task_id}").status_code == 404
assert bob.patch(
    f"/tasks/{task_id}",
    json={"title": "Hacked"},
).status_code == 404
assert bob.delete(f"/tasks/{task_id}").status_code == 404

still_owned = alice.get(f"/tasks/{task_id}")
assert still_owned.status_code == 200
assert still_owned.json()["title"] == "Private task"`}),(0,w.jsx)(t,{rows:[[(0,w.jsx)(w.Fragment,{children:`anonymous → GET /tasks`}),`401: нет действующей session`],[(0,w.jsx)(w.Fragment,{children:`Alice → Alice task`}),`200: ресурс принадлежит current user`],[(0,w.jsx)(w.Fragment,{children:`Bob → Alice task`}),`404: ресурс отсутствует в области Bob`],[(0,w.jsx)(w.Fragment,{children:`Bob PATCH → Alice task`}),`404 и данные не изменены`],[(0,w.jsx)(w.Fragment,{children:`Bob DELETE → Alice task`}),`404 и строка остаётся в базе`]]}),(0,w.jsx)(x,{title:`authorization regression suite`,lines:[{cmd:`pytest tests/test_task_ownership.py -q`},{out:`anonymous list rejected PASSED`},{out:`owner reads task PASSED`},{out:`foreign read hidden PASSED`},{out:`foreign update blocked PASSED`},{out:`foreign delete blocked PASSED`},{out:`owner data unchanged PASSED`},{out:`6 passed`}]}),(0,w.jsx)(a,{tone:`info`,children:`После запрещённого PATCH обязательно проверьте состояние задачи владельцем. Один status code не доказывает отсутствие побочного изменения.`}),(0,w.jsxs)(`div`,{className:`lesson-practice-steps`,children:[(0,w.jsx)(`h3`,{children:`Проверить create`}),(0,w.jsx)(`p`,{children:`Alice создаёт задачу без user_id в body. В response и базе owner равен Alice.`}),(0,w.jsx)(`h3`,{children:`Проверить collection scope`}),(0,w.jsx)(`p`,{children:`После создания задач Alice и Bob каждый GET /tasks возвращает только собственные строки.`}),(0,w.jsx)(`h3`,{children:`Проверить object scope`}),(0,w.jsx)(`p`,{children:`Read, PATCH и DELETE чужого id возвращают 404. Затем владелец подтверждает, что ресурс не изменился.`})]}),(0,w.jsx)(t,{rows:[[(0,w.jsx)(w.Fragment,{children:`create without user_id`}),`сервер назначает current_user.id`],[(0,w.jsx)(w.Fragment,{children:`list own tasks`}),`WHERE user_id ограничивает коллекцию`],[(0,w.jsx)(w.Fragment,{children:`get foreign task`}),`404 без раскрытия существования`],[(0,w.jsx)(w.Fragment,{children:`patch foreign task`}),`404 и отсутствие изменения`],[(0,w.jsx)(w.Fragment,{children:`delete foreign task`}),`404 и строка остаётся в базе`]]}),(0,w.jsx)(C,{caption:`минимальный security regression checklist`,code:`[ ] anonymous request → 401
[ ] owner request → success
[ ] foreign read → 404
[ ] foreign patch → 404 + unchanged row
[ ] foreign delete → 404 + existing row
[ ] request body cannot assign user_id`}),(0,w.jsx)(a,{children:`Тест считается сильным, когда проверяет наблюдаемый результат и отсутствие запрещённого побочного эффекта, а не только одну цифру status_code.`}),(0,w.jsx)(x,{title:`полный session + ownership flow`,lines:[{cmd:`Alice POST /auth/session/login`},{out:`200 · cookie A`},{cmd:`Bob POST /auth/session/login`},{out:`200 · cookie B`},{cmd:`Alice POST /tasks`},{out:`201 · task.user_id = Alice.id`},{cmd:`Bob GET /tasks/{task_id}`},{out:`404 · foreign resource hidden`},{cmd:`Alice GET /tasks/{task_id}`},{out:`200 · owner receives task`}]}),(0,w.jsx)(b,{question:`Как проследить решение о доступе от HTTP до SQL?`,hint:`Начните с Cookie и закончите условием WHERE.`,answer:(0,w.jsx)(`p`,{children:`Cookie даёт raw session token; dependency находит активную session и User; endpoint передаёт current_user.id в scoped query; база возвращает только ресурс этого владельца.`})}),(0,w.jsx)(a,{tone:`info`,children:`Эта трассировка является итоговой моделью блока. JWT в следующем блоке изменит способ предъявления authentication data, но ownership query останется тем же.`})]}),(0,w.jsxs)(f,{number:`08`,title:`Контрольная точка блока 18`,children:[(0,w.jsx)(d,{children:`Блок завершает stateful authentication flow: браузер хранит opaque token, сервер проверяет session, CurrentUser определяет личность, а ownership ограничивает доступ к строкам. Тесты подтверждают lifecycle и изоляцию пользователей.`}),(0,w.jsxs)(`div`,{className:`lesson-check-group`,children:[(0,w.jsx)(g,{question:`Откуда берётся user_id новой задачи?`,options:[`из CurrentUser`,`из request body`,`из title`],correctIndex:0,explanation:`Владелец назначается сервером после проверки session.`}),(0,w.jsx)(g,{question:`Как получить список личных задач?`,options:[`добавить WHERE Task.user_id == current_user.id`,`загрузить всё и довериться frontend`,`читать user_id из cookie JSON`],correctIndex:0,explanation:`Authorization scope применяется на уровне запроса к базе.`}),(0,w.jsx)(g,{question:`Что вернуть для чужого task_id?`,options:[`404 без подтверждения существования`,`200 с пустым owner`,`500`],correctIndex:0,explanation:`Ресурс отсутствует в доступной пользователю области.`}),(0,w.jsx)(g,{question:`Что доказывает тест после запрещённого PATCH?`,options:[`чужая задача осталась неизменной`,`cookie стала Secure`,`пользователь удалён`],correctIndex:0,explanation:`Негативный сценарий проверяет отсутствие побочного эффекта.`})]}),(0,w.jsx)(i,{points:[(0,w.jsx)(w.Fragment,{children:`Authentication определяет пользователя, authorization — допустимую операцию.`}),(0,w.jsxs)(w.Fragment,{children:[(0,w.jsx)(`code`,{children:`Task.user_id`}),` хранит владельца как foreign key.`]}),(0,w.jsx)(w.Fragment,{children:`user_id не принимается из TaskCreate и назначается сервером.`}),(0,w.jsx)(w.Fragment,{children:`Коллекции ограничиваются владельцем непосредственно в WHERE.`}),(0,w.jsx)(w.Fragment,{children:`Один объект ищется по task_id и current_user.id одновременно.`}),(0,w.jsx)(w.Fragment,{children:`Missing и foreign resource получают одинаковый 404.`}),(0,w.jsx)(w.Fragment,{children:`Тесты двух клиентов доказывают изоляцию и отсутствие побочных изменений.`})]}),(0,w.jsx)(v,{text:`Добавьте Task.user_id, миграцию и ownership scope во все CRUD endpoint. Напишите тестовую матрицу для anonymous, owner и foreign user; после запрещённых PATCH и DELETE подтвердите, что задача владельца не изменилась.`})]})]})}export{E as Lesson104};