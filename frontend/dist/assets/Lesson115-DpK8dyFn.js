import{t as e}from"./jsx-runtime-lw2jiZar.js";import{C as t,D as n,E as r,I as i,L as a,M as o,N as s,O as c,P as l,T as u,b as d,h as f,j as p,p as m,w as h,x as g,y as _}from"./shared-pB8LFUv2.js";import{t as v}from"./git-fork-WIYO3FwZ.js";import{j as y}from"./index-J3P0holD.js";import{t as b}from"./CodeEditor-BZlrvoTL.js";var x=e(),S=`Блок 20 · Остальные возможности FastAPI и Personal StudyHub`;function C({module:e}){return(0,x.jsxs)(s,{children:[(0,x.jsx)(o,{variant:`project`,chip:e??S,title:`Финальный проект 3: маршруты, ошибки и тесты`,intro:`Подключим готовые database и auth services к FastAPI: соберём routers, current user, ownership, admin permission, единый error envelope и изолированные TestClient-сценарии.`,tags:[{icon:(0,x.jsx)(v,{size:14}),label:`маршруты и dependencies`},{icon:(0,x.jsx)(y,{size:14}),label:`ошибки и TestClient`}]}),(0,x.jsxs)(r,{tone:`info`,children:[(0,x.jsx)(`strong`,{children:`Связь с курсом.`}),` `,`Нижние слои уже проверены без HTTP. Теперь endpoint должен оставаться тонкой точкой сборки: получить dependency, вызвать сервис и вернуть схему.`,` `,(0,x.jsx)(`strong`,{children:`Важно не перепутать:`}),` `,`Router не должен повторять password, token, ownership или transaction logic. HTTPException не используется как универсальная доменная ошибка внутри services.`]}),(0,x.jsxs)(`div`,{className:`lesson-route`,children:[(0,x.jsxs)(`ol`,{children:[(0,x.jsxs)(`li`,{children:[(0,x.jsx)(`strong`,{children:`Собрать routers.`}),` `,`разделить auth, users, tasks, attachments и admin по публичным контрактам.`]}),(0,x.jsxs)(`li`,{children:[(0,x.jsx)(`strong`,{children:`Получить личность.`}),` `,`session cookie и bearer token приводят к одному UserModel.`]}),(0,x.jsxs)(`li`,{children:[(0,x.jsx)(`strong`,{children:`Проверить права.`}),` `,`ownership и admin permission выполняются до изменения данных.`]}),(0,x.jsxs)(`li`,{children:[(0,x.jsx)(`strong`,{children:`Доказать поведение.`}),` `,`dependency overrides и отдельная SQLite-база воспроизводят позитивные и негативные сценарии.`]})]}),(0,x.jsx)(`p`,{children:`Маршрут занятия проходит от знакомой проблемы к проверяемому изменению сквозного проекта.`})]}),(0,x.jsxs)(a,{children:[(0,x.jsx)(i,{badge:`до`,title:`Состояние проекта`,code:`database и auth services готовы`,children:`database и auth services готовы`}),(0,x.jsx)(i,{badge:`+`,badgeTone:`float`,title:`Изменение урока`,code:`routers, handlers и интеграционные тесты`,children:`routers, handlers и интеграционные тесты`}),(0,x.jsx)(i,{badge:`после`,badgeTone:`str`,title:`Новый результат`,code:`Personal StudyHub работает end-to-end`,children:`Personal StudyHub работает end-to-end`})]}),(0,x.jsxs)(l,{number:`01`,title:`Routers как карта публичного API`,children:[(0,x.jsx)(c,{children:`Каждый router группирует связанные HTTP-контракты, но не становится новым сервисным слоем. Он отвечает за path, method, status code, dependencies, schemas и перевод результата в ответ.`}),(0,x.jsxs)(`div`,{className:`lesson-practice-steps`,children:[(0,x.jsx)(`h3`,{children:`auth`}),(0,x.jsx)(`p`,{children:`регистрация, session login/logout, token, refresh и revoke.`}),(0,x.jsx)(`h3`,{children:`users/tasks`}),(0,x.jsx)(`p`,{children:`профиль и protected CRUD текущего пользователя.`}),(0,x.jsx)(`h3`,{children:`admin`}),(0,x.jsx)(`p`,{children:`узкие операции, требующие отдельного разрешения.`})]}),(0,x.jsx)(b,{caption:`main.py только собирает приложение`,code:`from fastapi import FastAPI

from app.routers import admin, auth, tasks, users


def create_app() -> FastAPI:
    app = FastAPI(title="Personal StudyHub API")
    app.include_router(auth.router)
    app.include_router(users.router)
    app.include_router(tasks.router)
    app.include_router(admin.router)
    return app


app = create_app()`}),(0,x.jsxs)(a,{children:[(0,x.jsx)(i,{badge:`router`,title:`HTTP-контракт`,code:`path + method + schemas`,children:`Принимает валидированные данные и вызывает готовый сервис.`}),(0,x.jsx)(i,{badge:`service`,badgeTone:`float`,title:`Сценарий`,code:`authenticate/create/update/revoke`,children:`Не знает про APIRouter и выбирает транзакционную границу.`}),(0,x.jsx)(i,{badge:`dependency`,badgeTone:`str`,title:`Контекст запроса`,code:`db/current_user/permission`,children:`Подготавливает повторяемое значение до выполнения endpoint.`})]}),(0,x.jsx)(r,{tone:`info`,children:`Фабрика create_app упрощает тестирование и не требует глобально переопределять настройки до импорта модулей.`})]}),(0,x.jsxs)(l,{number:`02`,title:`Session login и logout в HTTP-слое`,children:[(0,x.jsx)(c,{children:`Session service возвращает raw session id, а router устанавливает его в HttpOnly cookie. Logout читает credential, отзывает запись и удаляет cookie независимо от того, существовала ли она у клиента.`}),(0,x.jsxs)(`div`,{className:`lesson-practice-steps`,children:[(0,x.jsx)(`h3`,{children:`Login`}),(0,x.jsx)(`p`,{children:`authenticate_user → create_session → set_cookie.`}),(0,x.jsx)(`h3`,{children:`Cookie flags`}),(0,x.jsx)(`p`,{children:`HttpOnly, SameSite, Secure по окружению, Path и Max-Age.`}),(0,x.jsx)(`h3`,{children:`Logout`}),(0,x.jsx)(`p`,{children:`revocation на сервере и delete_cookie в ответе.`})]}),(0,x.jsx)(b,{caption:`cookie transport вокруг session service`,code:`from typing import Annotated

from fastapi import APIRouter, Cookie, Depends, Form, Response, status
from sqlalchemy.orm import Session

router = APIRouter(prefix="/auth/session", tags=["auth-session"])


@router.post("/login", status_code=status.HTTP_204_NO_CONTENT)
def session_login(
    response: Response,
    email: Annotated[str, Form()],
    password: Annotated[str, Form()],
    db: Annotated[Session, Depends(get_db)],
) -> None:
    user = authenticate_user(db, email, password)
    session_id = session_service.create(db, user.id)
    response.set_cookie(
        key="studyhub_session",
        value=session_id,
        httponly=True,
        secure=settings.cookie_secure,
        samesite="lax",
        max_age=settings.session_ttl_seconds,
    )


@router.post("/logout", status_code=status.HTTP_204_NO_CONTENT)
def session_logout(
    response: Response,
    db: Annotated[Session, Depends(get_db)],
    session_id: Annotated[str | None, Cookie(alias="studyhub_session")] = None,
) -> None:
    if session_id is not None:
        session_service.revoke(db, session_id)
    response.delete_cookie("studyhub_session")`}),(0,x.jsx)(h,{title:`Соберите session login`,prompt:`Расположите действия успешного входа.`,pieces:[{id:`form`,code:`FastAPI читает email и password из Form`},{id:`auth`,code:`authenticate_user проверяет credentials`},{id:`session`,code:`session service создаёт server-side record`},{id:`cookie`,code:`Response.set_cookie отправляет raw id`},{id:`response`,code:`вернуть 204 без пользовательских секретов`},{id:`hash`,code:`вернуть password_hash клиенту`,note:`опасное действие`}],correctOrder:[`form`,`auth`,`session`,`cookie`,`response`],explanation:`Проверка и хранение остаются в services, cookie — в HTTP-слое.`}),(0,x.jsx)(r,{tone:`info`,children:`Для production cookie Secure включается под HTTPS. Локальная настройка может отличаться, но причина различия фиксируется в config.`})]}),(0,x.jsxs)(l,{number:`03`,title:`Bearer flow и единый current user`,children:[(0,x.jsx)(c,{children:`Token endpoint выдаёт пару после authenticate_user. Dependency OAuth2PasswordBearer извлекает access token, token service декодирует sub, а user repository загружает активного пользователя.`}),(0,x.jsxs)(`div`,{className:`lesson-practice-steps`,children:[(0,x.jsx)(`h3`,{children:`Transport`}),(0,x.jsx)(`p`,{children:`Authorization: Bearer <access token>.`}),(0,x.jsx)(`h3`,{children:`Decode`}),(0,x.jsx)(`p`,{children:`проверяются подпись, exp и type=access.`}),(0,x.jsx)(`h3`,{children:`Resolve`}),(0,x.jsx)(`p`,{children:`sub преобразуется в user id, затем проверяются existence и is_active.`})]}),(0,x.jsx)(b,{caption:`current user из bearer token`,code:`from typing import Annotated

from fastapi import Depends
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/token")


def get_current_token_user(
    token: Annotated[str, Depends(oauth2_scheme)],
    db: Annotated[Session, Depends(get_db)],
) -> UserModel:
    user_id = token_service.decode_access(token)
    user = user_repository.get_by_id(db, user_id)
    if user is None or not user.is_active:
        raise InvalidTokenError()
    return user`}),(0,x.jsx)(f,{code:`token = read_bearer()
try:
    user_id = decode_access(token)
except InvalidTokenError:
    return "401"
user = find_user(user_id)
if user is None or not user.is_active:
    return "401"
return "current user"`,scenarios:[{label:`подпись неверна`,activeLine:4,output:`401`},{label:`user удалён`,activeLine:7,output:`401`},{label:`user неактивен`,activeLine:7,output:`401`},{label:`всё корректно`,activeLine:8,output:`current user`}]}),(0,x.jsx)(r,{tone:`info`,children:`user_id из request body никогда не заменяет current user. Клиент не выбирает владельца защищённого ресурса.`})]}),(0,x.jsxs)(l,{number:`04`,title:`Ownership и admin permission`,children:[(0,x.jsx)(c,{children:`Аутентификация отвечает «кто это», авторизация — «разрешено ли действие». Для задач ownership проверяется запросом по id и owner_id, для admin endpoint — dependency role/permission.`}),(0,x.jsxs)(`div`,{className:`lesson-practice-steps`,children:[(0,x.jsx)(`h3`,{children:`Own resource`}),(0,x.jsx)(`p`,{children:`repository возвращает task только при совпадении task_id и user_id.`}),(0,x.jsx)(`h3`,{children:`Foreign resource`}),(0,x.jsx)(`p`,{children:`проект выбирает 404, чтобы не подтверждать существование чужого id.`}),(0,x.jsx)(`h3`,{children:`Admin`}),(0,x.jsx)(`p`,{children:`current user существует, но role не подходит — 403.`})]}),(0,x.jsx)(b,{caption:`две формы авторизации`,code:`def get_owned_task(
    db: Session,
    task_id: int,
    owner_id: int,
) -> TaskModel:
    statement = select(TaskModel).where(
        TaskModel.id == task_id,
        TaskModel.user_id == owner_id,
    )
    task = db.scalar(statement)
    if task is None:
        raise TaskNotFoundError(task_id)
    return task


def require_admin(
    current_user: Annotated[UserModel, Depends(get_current_token_user)],
) -> UserModel:
    if current_user.role != "admin":
        raise PermissionDeniedError("admin_stats")
    return current_user`}),(0,x.jsx)(m,{prompt:`Соедините ситуацию с HTTP-результатом финального контракта.`,leftTitle:`Ситуация`,rightTitle:`Результат`,pairs:[{left:`нет действительного credential`,right:`401 Unauthorized`},{left:`user есть, но не admin`,right:`403 Forbidden`},{left:`чужая task скрыта ownership query`,right:`404 Not Found`},{left:`своя task найдена`,right:`выполнить сценарий`}],explanation:`401, 403 и 404 отражают разные границы доступа.`}),(0,x.jsx)(r,{tone:`info`,children:`Проверка role строкой сосредоточена в одной dependency. Если появятся permissions, routers не придётся переписывать полностью.`})]}),(0,x.jsxs)(l,{number:`05`,title:`Доменные исключения и exception handlers`,children:[(0,x.jsx)(c,{children:`Services поднимают понятные исключения предметной области. FastAPI handlers централизованно переводят их в status code и ErrorResponse, сохраняя одинаковую внешнюю форму.`}),(0,x.jsxs)(`div`,{className:`lesson-practice-steps`,children:[(0,x.jsx)(`h3`,{children:`Domain error`}),(0,x.jsx)(`p`,{children:`не зависит от FastAPI и несёт минимальный контекст.`}),(0,x.jsx)(`h3`,{children:`Handler`}),(0,x.jsx)(`p`,{children:`выбирает status code и безопасный message.`}),(0,x.jsx)(`h3`,{children:`Unexpected error`}),(0,x.jsx)(`p`,{children:`логируется с request id, но клиент получает общий 500 без traceback.`})]}),(0,x.jsx)(b,{caption:`единый перевод доменной ошибки`,code:`from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse


class TaskNotFoundError(Exception):
    def __init__(self, task_id: int) -> None:
        self.task_id = task_id


def install_exception_handlers(app: FastAPI) -> None:
    @app.exception_handler(TaskNotFoundError)
    def task_not_found_handler(
        request: Request,
        error: TaskNotFoundError,
    ) -> JSONResponse:
        return JSONResponse(
            status_code=404,
            content={
                "error": {
                    "code": "task_not_found",
                    "message": "Task was not found",
                    "request_id": getattr(request.state, "request_id", None),
                }
            },
        )`}),(0,x.jsx)(u,{question:`Где лучше выбирать HTTP status code для TaskNotFoundError?`,left:{title:`В task service`,code:`raise HTTPException(status_code=404)`,note:`Сервис становится зависимым от FastAPI transport.`},right:{title:`В exception handler`,code:`raise TaskNotFoundError(task_id)`,note:`Сервис описывает предметный отказ, handler — HTTP-представление.`},preferred:`right`,explanation:`Разделение позволяет тестировать service без FastAPI и сохраняет единый error envelope.`}),(0,x.jsx)(r,{tone:`info`,children:`Не превращайте каждую ValueError в отдельную иерархию. Доменные исключения нужны там, где отказ имеет устойчивый смысл для сценария.`})]}),(0,x.jsxs)(l,{number:`06`,title:`Изолированная SQLite-база и dependency overrides`,children:[(0,x.jsx)(c,{children:`Тесты не должны читать development database. Они создают отдельный engine, поднимают схему, отдают test Session через override и очищают ресурсы после сценария.`}),(0,x.jsxs)(`div`,{className:`lesson-practice-steps`,children:[(0,x.jsx)(`h3`,{children:`Engine`}),(0,x.jsx)(`p`,{children:`отдельный файл во временной папке или in-memory конфигурация с подходящим pool.`}),(0,x.jsx)(`h3`,{children:`Override`}),(0,x.jsx)(`p`,{children:`app.dependency_overrides[get_db] заменяет production dependency.`}),(0,x.jsx)(`h3`,{children:`Cleanup`}),(0,x.jsx)(`p`,{children:`override удаляется, Session закрывается, база не влияет на следующий тест.`})]}),(0,x.jsx)(b,{caption:`fixture изолированного приложения`,code:`import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker


@pytest.fixture
def client(tmp_path):
    url = f"sqlite:///{tmp_path / 'test.db'}"
    engine = create_engine(url, connect_args={"check_same_thread": False})
    TestingSession = sessionmaker(bind=engine, expire_on_commit=False)
    Base.metadata.create_all(engine)

    def override_get_db():
        db = TestingSession()
        try:
            yield db
        finally:
            db.close()

    app = create_app()
    app.dependency_overrides[get_db] = override_get_db
    with TestClient(app) as test_client:
        yield test_client
    app.dependency_overrides.clear()`}),(0,x.jsx)(t,{code:`def test_create_task():
    client = TestClient(production_app)
    response = client.post("/tasks", json={"title": "SQL"})`,question:`Какой риск скрыт в тесте?`,options:[`Он может использовать production get_db и реальные данные`,`TestClient запрещает POST`,`JSON нельзя передавать словарём`],correctIndex:0,explanation:`Без override тест зависит от production configuration и может загрязнить рабочую SQLite-базу.`,fix:`app.dependency_overrides[get_db] = override_get_db
with TestClient(app) as client:
    response = client.post("/tasks", json={"title": "SQL"})`}),(0,x.jsx)(r,{tone:`info`,children:`В финальной проверке предпочтительно прогонять Alembic и на тестовой базе. create_all допустим для быстрых unit fixtures, но не заменяет migration test.`})]}),(0,x.jsxs)(l,{number:`07`,title:`Полные TestClient-сценарии`,children:[(0,x.jsx)(c,{children:`Хороший интеграционный тест проходит не один endpoint, а пользовательский поток: регистрация, вход, создание ресурса, доступ, отказ второго пользователя и logout/revocation.`}),(0,x.jsxs)(`div`,{className:`lesson-practice-steps`,children:[(0,x.jsx)(`h3`,{children:`Session flow`}),(0,x.jsx)(`p`,{children:`cookie автоматически сохраняется внутри одного TestClient.`}),(0,x.jsx)(`h3`,{children:`JWT flow`}),(0,x.jsx)(`p`,{children:`access передаётся в Authorization, refresh rotation проверяет старый токен.`}),(0,x.jsx)(`h3`,{children:`Isolation`}),(0,x.jsx)(`p`,{children:`два клиента или два token set доказывают ownership.`})]}),(0,x.jsx)(b,{caption:`двухпользовательский ownership test`,code:`def test_two_users_cannot_share_tasks(client: TestClient) -> None:
    first = register_and_login_token(client, "first@example.com")
    second = register_and_login_token(client, "second@example.com")

    created = client.post(
        "/tasks",
        headers=bearer(first.access_token),
        json={"title": "Private SQL task", "priority": 4},
    )
    task_id = created.json()["id"]

    foreign_read = client.get(
        f"/tasks/{task_id}",
        headers=bearer(second.access_token),
    )
    assert foreign_read.status_code == 404

    owner_read = client.get(
        f"/tasks/{task_id}",
        headers=bearer(first.access_token),
    )
    assert owner_read.status_code == 200`}),(0,x.jsx)(_,{title:`финальный набор тестов`,lines:[{cmd:`python -m pytest -q`},{out:`58 passed in 4.12s`},{cmd:`python -m pytest tests/test_auth.py -q`},{out:`21 passed in 1.66s`},{cmd:`python -m pytest tests/test_permissions.py -q`},{out:`12 passed in 0.84s`}]}),(0,x.jsx)(r,{tone:`info`,children:`Число тестов не является целью. Набор считается сильным, когда покрывает критические договорённости и объясняет причину каждого ожидаемого отказа.`})]}),(0,x.jsxs)(l,{number:`08`,title:`Контрольная точка end-to-end`,children:[(0,x.jsx)(c,{children:`Перед документацией проект должен пройти чистый сценарий от alembic upgrade head до полного набора TestClient. Любая ручная правка базы или секрет в исходнике означает незавершённость.`}),(0,x.jsxs)(`div`,{className:`lesson-practice-steps`,children:[(0,x.jsx)(`h3`,{children:`Clean start`}),(0,x.jsx)(`p`,{children:`новая база создаётся миграциями, приложение стартует с .env.example.`}),(0,x.jsx)(`h3`,{children:`Positive path`}),(0,x.jsx)(`p`,{children:`registration, login, CRUD, upload и admin работают по контракту.`}),(0,x.jsx)(`h3`,{children:`Negative path`}),(0,x.jsx)(`p`,{children:`401, 403, ownership 404, duplicate 409, refresh reuse и upload limits проверены.`})]}),(0,x.jsx)(b,{caption:`definition of done для Lesson115`,code:`release_candidate = all([
    migrations_pass_on_empty_database,
    routes_match_openapi_contract,
    error_envelope_is_consistent,
    two_user_isolation_passes,
    refresh_rotation_passes,
    upload_boundaries_pass,
    secrets_are_not_in_repository,
    tests_pass_twice,
])`}),(0,x.jsx)(g,{question:`Почему тест нужно запустить два раза подряд?`,hint:`Подумайте об остаточном состоянии и порядке тестов.`,answer:(0,x.jsx)(`p`,{children:`Повторный зелёный прогон помогает обнаружить тесты, которые оставляют данные, зависят от порядка выполнения или не очищают dependency overrides и временные ресурсы.`})}),(0,x.jsx)(r,{tone:`info`,children:`После этой точки Lesson116 не добавляет backend-функции. Он делает уже работающий результат воспроизводимым, объяснимым и защищаемым.`}),(0,x.jsxs)(`div`,{className:`lesson-check-group`,children:[(0,x.jsx)(d,{question:`Что должен делать router?`,options:[`связывать HTTP-контракт с готовым сервисом`,`самостоятельно хешировать пароль`,`создавать engine на каждый запрос`],correctIndex:0,explanation:`Router управляет транспортом и вызывает нижние слои.`}),(0,x.jsx)(d,{question:`Чем 401 отличается от 403?`,options:[`401 — нет подтверждённой личности, 403 — личности не хватает права`,`разницы нет`,`403 означает отсутствующую таблицу`],correctIndex:0,explanation:`Эти статусы отражают разные границы доступа.`}),(0,x.jsx)(d,{question:`Зачем dependency override в тесте?`,options:[`подменить production get_db на изолированную Session`,`отключить все проверки`,`заменить pytest`],correctIndex:0,explanation:`Override направляет приложение в тестовую базу.`}),(0,x.jsx)(d,{question:`Как доказать ownership?`,options:[`сценарием двух пользователей`,`только тестом 200`,`скрытием OpenAPI`],correctIndex:0,explanation:`Второй пользователь должен получить отказ на чужой ресурс.`})]}),(0,x.jsx)(n,{points:[(0,x.jsx)(x.Fragment,{children:`Routers отвечают за HTTP-контракт, а services — за сценарии.`}),(0,x.jsx)(x.Fragment,{children:`Session service не устанавливает cookie самостоятельно.`}),(0,x.jsx)(x.Fragment,{children:`Bearer dependency декодирует access token и загружает active user.`}),(0,x.jsx)(x.Fragment,{children:`Ownership проверяется запросом task_id + owner_id.`}),(0,x.jsx)(x.Fragment,{children:`401, 403 и 404 имеют разные смыслы доступа.`}),(0,x.jsx)(x.Fragment,{children:`Доменные исключения переводятся централизованными handlers.`}),(0,x.jsx)(x.Fragment,{children:`Dependency overrides изолируют тестовую SQLite-базу.`}),(0,x.jsx)(x.Fragment,{children:`End-to-end тесты проходят реальные auth и resource flows.`}),(0,x.jsx)(x.Fragment,{children:`Release candidate обязан стартовать с чистой базы.`})]}),(0,x.jsx)(p,{text:`Реализуйте auth/users/tasks/admin routers, current user, ownership, exception handlers и isolated TestClient fixtures. Пройдите session, JWT, refresh rotation, two-user и upload сценарии.`})]})]})}export{C as Lesson115};