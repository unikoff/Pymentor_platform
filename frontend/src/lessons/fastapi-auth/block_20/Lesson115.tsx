import { CheckCircle2, GitFork } from "lucide-react";
import { BranchExplorer, BugHunt, Callout, CodeBlock, CodeSequence, CompareSolutions, KeyTakeaways, Lead, MatchPairs, PracticeCta, QuizCard, RecallCard, RichHero, RichLesson, Section, TerminalDemo, TypeCard, TypeCards } from "../../shared";
const BLOCK_TITLE = "Блок 20 · Остальные возможности FastAPI и Personal StudyHub";

export function Lesson115({
  module,
}: {
  module?: string;
}) {
  return (
    <RichLesson>
      <RichHero
        variant="project"
        chip={module ?? BLOCK_TITLE}
        title={"Финальный проект 3: маршруты, ошибки и тесты"}
        intro={"Подключим готовые database и auth services к FastAPI: соберём routers, current user, ownership, admin permission, единый error envelope и изолированные TestClient-сценарии."}
        tags={[
          {
            icon: <GitFork size={14} />,
            label: "маршруты и dependencies",
          },
          {
            icon: <CheckCircle2 size={14} />,
            label: "ошибки и TestClient",
          },
        ]}
      />

      <Callout tone="info">
        <strong>{"Связь с курсом."}</strong>
        {" "}
        {"Нижние слои уже проверены без HTTP. Теперь endpoint должен оставаться тонкой точкой сборки: получить dependency, вызвать сервис и вернуть схему."}
        {" "}
        <strong>{"Важно не перепутать:"}</strong>
        {" "}
        {"Router не должен повторять password, token, ownership или transaction logic. HTTPException не используется как универсальная доменная ошибка внутри services."}
      </Callout>

      <div className="lesson-route">
        <ol>
        <li>
          <strong>{"Собрать routers."}</strong>
          {" "}
          {"разделить auth, users, tasks, attachments и admin по публичным контрактам."}
        </li>
        <li>
          <strong>{"Получить личность."}</strong>
          {" "}
          {"session cookie и bearer token приводят к одному UserModel."}
        </li>
        <li>
          <strong>{"Проверить права."}</strong>
          {" "}
          {"ownership и admin permission выполняются до изменения данных."}
        </li>
        <li>
          <strong>{"Доказать поведение."}</strong>
          {" "}
          {"dependency overrides и отдельная SQLite-база воспроизводят позитивные и негативные сценарии."}
        </li>
        </ol>
        <p>
          {"Маршрут занятия проходит от знакомой проблемы к проверяемому изменению сквозного проекта."}
        </p>
      </div>

      <TypeCards>
        <TypeCard
          badge={"до"}
          title={"Состояние проекта"}
          code={`database и auth services готовы`}
        >
          {"database и auth services готовы"}
        </TypeCard>
        <TypeCard
          badge={"+"}
          badgeTone={"float"}
          title={"Изменение урока"}
          code={`routers, handlers и интеграционные тесты`}
        >
          {"routers, handlers и интеграционные тесты"}
        </TypeCard>
        <TypeCard
          badge={"после"}
          badgeTone={"str"}
          title={"Новый результат"}
          code={`Personal StudyHub работает end-to-end`}
        >
          {"Personal StudyHub работает end-to-end"}
        </TypeCard>
      </TypeCards>

      <Section
        number={"01"}
        title={"Routers как карта публичного API"}
      >
        <Lead>
          {"Каждый router группирует связанные HTTP-контракты, но не становится новым сервисным слоем. Он отвечает за path, method, status code, dependencies, schemas и перевод результата в ответ."}
        </Lead>

        <div className="lesson-practice-steps">
        <h3>{"auth"}</h3>
        <p>{"регистрация, session login/logout, token, refresh и revoke."}</p>
        <h3>{"users/tasks"}</h3>
        <p>{"профиль и protected CRUD текущего пользователя."}</p>
        <h3>{"admin"}</h3>
        <p>{"узкие операции, требующие отдельного разрешения."}</p>
        </div>

        <CodeBlock
          caption={"main.py только собирает приложение"}
          code={`from fastapi import FastAPI

from app.routers import admin, auth, tasks, users


def create_app() -> FastAPI:
    app = FastAPI(title="Personal StudyHub API")
    app.include_router(auth.router)
    app.include_router(users.router)
    app.include_router(tasks.router)
    app.include_router(admin.router)
    return app


app = create_app()`}
        />

        <TypeCards>
          <TypeCard badge={"router"} title={"HTTP-контракт"} code={`path + method + schemas`}>
            {"Принимает валидированные данные и вызывает готовый сервис."}
          </TypeCard>
          <TypeCard badge={"service"} badgeTone={"float"} title={"Сценарий"} code={`authenticate/create/update/revoke`}>
            {"Не знает про APIRouter и выбирает транзакционную границу."}
          </TypeCard>
          <TypeCard badge={"dependency"} badgeTone={"str"} title={"Контекст запроса"} code={`db/current_user/permission`}>
            {"Подготавливает повторяемое значение до выполнения endpoint."}
          </TypeCard>
        </TypeCards>

        <Callout tone="info">
          {"Фабрика create_app упрощает тестирование и не требует глобально переопределять настройки до импорта модулей."}
        </Callout>
      </Section>

      <Section
        number={"02"}
        title={"Session login и logout в HTTP-слое"}
      >
        <Lead>
          {"Session service возвращает raw session id, а router устанавливает его в HttpOnly cookie. Logout читает credential, отзывает запись и удаляет cookie независимо от того, существовала ли она у клиента."}
        </Lead>

        <div className="lesson-practice-steps">
        <h3>{"Login"}</h3>
        <p>{"authenticate_user → create_session → set_cookie."}</p>
        <h3>{"Cookie flags"}</h3>
        <p>{"HttpOnly, SameSite, Secure по окружению, Path и Max-Age."}</p>
        <h3>{"Logout"}</h3>
        <p>{"revocation на сервере и delete_cookie в ответе."}</p>
        </div>

        <CodeBlock
          caption={"cookie transport вокруг session service"}
          code={`from typing import Annotated

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
    response.delete_cookie("studyhub_session")`}
        />

        <CodeSequence
          title={"Соберите session login"}
          prompt={"Расположите действия успешного входа."}
          pieces={[
            { id: "form", code: "FastAPI читает email и password из Form" },
            { id: "auth", code: "authenticate_user проверяет credentials" },
            { id: "session", code: "session service создаёт server-side record" },
            { id: "cookie", code: "Response.set_cookie отправляет raw id" },
            { id: "response", code: "вернуть 204 без пользовательских секретов" },
            { id: "hash", code: "вернуть password_hash клиенту", note: "опасное действие" }
          ]}
          correctOrder={["form", "auth", "session", "cookie", "response"]}
          explanation={"Проверка и хранение остаются в services, cookie — в HTTP-слое."}
        />

        <Callout tone="info">
          {"Для production cookie Secure включается под HTTPS. Локальная настройка может отличаться, но причина различия фиксируется в config."}
        </Callout>
      </Section>

      <Section
        number={"03"}
        title={"Bearer flow и единый current user"}
      >
        <Lead>
          {"Token endpoint выдаёт пару после authenticate_user. Dependency OAuth2PasswordBearer извлекает access token, token service декодирует sub, а user repository загружает активного пользователя."}
        </Lead>

        <div className="lesson-practice-steps">
        <h3>{"Transport"}</h3>
        <p>{"Authorization: Bearer <access token>."}</p>
        <h3>{"Decode"}</h3>
        <p>{"проверяются подпись, exp и type=access."}</p>
        <h3>{"Resolve"}</h3>
        <p>{"sub преобразуется в user id, затем проверяются existence и is_active."}</p>
        </div>

        <CodeBlock
          caption={"current user из bearer token"}
          code={`from typing import Annotated

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
    return user`}
        />

        <BranchExplorer
          code={`token = read_bearer()
try:
    user_id = decode_access(token)
except InvalidTokenError:
    return "401"
user = find_user(user_id)
if user is None or not user.is_active:
    return "401"
return "current user"`}
          scenarios={[
            { label: "подпись неверна", activeLine: 4, output: "401" },
            { label: "user удалён", activeLine: 7, output: "401" },
            { label: "user неактивен", activeLine: 7, output: "401" },
            { label: "всё корректно", activeLine: 8, output: "current user" }
          ]}
        />

        <Callout tone="info">
          {"user_id из request body никогда не заменяет current user. Клиент не выбирает владельца защищённого ресурса."}
        </Callout>
      </Section>

      <Section
        number={"04"}
        title={"Ownership и admin permission"}
      >
        <Lead>
          {"Аутентификация отвечает «кто это», авторизация — «разрешено ли действие». Для задач ownership проверяется запросом по id и owner_id, для admin endpoint — dependency role/permission."}
        </Lead>

        <div className="lesson-practice-steps">
        <h3>{"Own resource"}</h3>
        <p>{"repository возвращает task только при совпадении task_id и user_id."}</p>
        <h3>{"Foreign resource"}</h3>
        <p>{"проект выбирает 404, чтобы не подтверждать существование чужого id."}</p>
        <h3>{"Admin"}</h3>
        <p>{"current user существует, но role не подходит — 403."}</p>
        </div>

        <CodeBlock
          caption={"две формы авторизации"}
          code={`def get_owned_task(
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
    return current_user`}
        />

        <MatchPairs
          prompt={"Соедините ситуацию с HTTP-результатом финального контракта."}
          leftTitle={"Ситуация"}
          rightTitle={"Результат"}
          pairs={[
            { left: "нет действительного credential", right: "401 Unauthorized" },
            { left: "user есть, но не admin", right: "403 Forbidden" },
            { left: "чужая task скрыта ownership query", right: "404 Not Found" },
            { left: "своя task найдена", right: "выполнить сценарий" }
          ]}
          explanation={"401, 403 и 404 отражают разные границы доступа."}
        />

        <Callout tone="info">
          {"Проверка role строкой сосредоточена в одной dependency. Если появятся permissions, routers не придётся переписывать полностью."}
        </Callout>
      </Section>

      <Section
        number={"05"}
        title={"Доменные исключения и exception handlers"}
      >
        <Lead>
          {"Services поднимают понятные исключения предметной области. FastAPI handlers централизованно переводят их в status code и ErrorResponse, сохраняя одинаковую внешнюю форму."}
        </Lead>

        <div className="lesson-practice-steps">
        <h3>{"Domain error"}</h3>
        <p>{"не зависит от FastAPI и несёт минимальный контекст."}</p>
        <h3>{"Handler"}</h3>
        <p>{"выбирает status code и безопасный message."}</p>
        <h3>{"Unexpected error"}</h3>
        <p>{"логируется с request id, но клиент получает общий 500 без traceback."}</p>
        </div>

        <CodeBlock
          caption={"единый перевод доменной ошибки"}
          code={`from fastapi import FastAPI, Request
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
        )`}
        />

        <CompareSolutions
          question={"Где лучше выбирать HTTP status code для TaskNotFoundError?"}
          left={{
            title: "В task service",
            code: `raise HTTPException(status_code=404)`,
            note: "Сервис становится зависимым от FastAPI transport.",
          }}
          right={{
            title: "В exception handler",
            code: `raise TaskNotFoundError(task_id)`,
            note: "Сервис описывает предметный отказ, handler — HTTP-представление.",
          }}
          preferred={"right"}
          explanation={"Разделение позволяет тестировать service без FastAPI и сохраняет единый error envelope."}
        />

        <Callout tone="info">
          {"Не превращайте каждую ValueError в отдельную иерархию. Доменные исключения нужны там, где отказ имеет устойчивый смысл для сценария."}
        </Callout>
      </Section>

      <Section
        number={"06"}
        title={"Изолированная SQLite-база и dependency overrides"}
      >
        <Lead>
          {"Тесты не должны читать development database. Они создают отдельный engine, поднимают схему, отдают test Session через override и очищают ресурсы после сценария."}
        </Lead>

        <div className="lesson-practice-steps">
        <h3>{"Engine"}</h3>
        <p>{"отдельный файл во временной папке или in-memory конфигурация с подходящим pool."}</p>
        <h3>{"Override"}</h3>
        <p>{"app.dependency_overrides[get_db] заменяет production dependency."}</p>
        <h3>{"Cleanup"}</h3>
        <p>{"override удаляется, Session закрывается, база не влияет на следующий тест."}</p>
        </div>

        <CodeBlock
          caption={"fixture изолированного приложения"}
          code={`import pytest
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
    app.dependency_overrides.clear()`}
        />

        <BugHunt
          code={`def test_create_task():
    client = TestClient(production_app)
    response = client.post("/tasks", json={"title": "SQL"})`}
          question={"Какой риск скрыт в тесте?"}
          options={[
            "Он может использовать production get_db и реальные данные",
            "TestClient запрещает POST",
            "JSON нельзя передавать словарём"
          ]}
          correctIndex={0}
          explanation={"Без override тест зависит от production configuration и может загрязнить рабочую SQLite-базу."}
          fix={`app.dependency_overrides[get_db] = override_get_db
with TestClient(app) as client:
    response = client.post("/tasks", json={"title": "SQL"})`}
        />

        <Callout tone="info">
          {"В финальной проверке предпочтительно прогонять Alembic и на тестовой базе. create_all допустим для быстрых unit fixtures, но не заменяет migration test."}
        </Callout>
      </Section>

      <Section
        number={"07"}
        title={"Полные TestClient-сценарии"}
      >
        <Lead>
          {"Хороший интеграционный тест проходит не один endpoint, а пользовательский поток: регистрация, вход, создание ресурса, доступ, отказ второго пользователя и logout/revocation."}
        </Lead>

        <div className="lesson-practice-steps">
        <h3>{"Session flow"}</h3>
        <p>{"cookie автоматически сохраняется внутри одного TestClient."}</p>
        <h3>{"JWT flow"}</h3>
        <p>{"access передаётся в Authorization, refresh rotation проверяет старый токен."}</p>
        <h3>{"Isolation"}</h3>
        <p>{"два клиента или два token set доказывают ownership."}</p>
        </div>

        <CodeBlock
          caption={"двухпользовательский ownership test"}
          code={`def test_two_users_cannot_share_tasks(client: TestClient) -> None:
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
    assert owner_read.status_code == 200`}
        />

        <TerminalDemo
          title={"финальный набор тестов"}
          lines={[
            { cmd: "python -m pytest -q" },
            { out: "58 passed in 4.12s" },
            { cmd: "python -m pytest tests/test_auth.py -q" },
            { out: "21 passed in 1.66s" },
            { cmd: "python -m pytest tests/test_permissions.py -q" },
            { out: "12 passed in 0.84s" }
          ]}
        />

        <Callout tone="info">
          {"Число тестов не является целью. Набор считается сильным, когда покрывает критические договорённости и объясняет причину каждого ожидаемого отказа."}
        </Callout>
      </Section>

      <Section
        number={"08"}
        title={"Контрольная точка end-to-end"}
      >
        <Lead>
          {"Перед документацией проект должен пройти чистый сценарий от alembic upgrade head до полного набора TestClient. Любая ручная правка базы или секрет в исходнике означает незавершённость."}
        </Lead>

        <div className="lesson-practice-steps">
        <h3>{"Clean start"}</h3>
        <p>{"новая база создаётся миграциями, приложение стартует с .env.example."}</p>
        <h3>{"Positive path"}</h3>
        <p>{"registration, login, CRUD, upload и admin работают по контракту."}</p>
        <h3>{"Negative path"}</h3>
        <p>{"401, 403, ownership 404, duplicate 409, refresh reuse и upload limits проверены."}</p>
        </div>

        <CodeBlock
          caption={"definition of done для Lesson115"}
          code={`release_candidate = all([
    migrations_pass_on_empty_database,
    routes_match_openapi_contract,
    error_envelope_is_consistent,
    two_user_isolation_passes,
    refresh_rotation_passes,
    upload_boundaries_pass,
    secrets_are_not_in_repository,
    tests_pass_twice,
])`}
        />

        <RecallCard
          question={"Почему тест нужно запустить два раза подряд?"}
          hint={"Подумайте об остаточном состоянии и порядке тестов."}
          answer={
            <p>{"Повторный зелёный прогон помогает обнаружить тесты, которые оставляют данные, зависят от порядка выполнения или не очищают dependency overrides и временные ресурсы."}</p>
          }
        />

        <Callout tone="info">
          {"После этой точки Lesson116 не добавляет backend-функции. Он делает уже работающий результат воспроизводимым, объяснимым и защищаемым."}
        </Callout>

        <div className="lesson-check-group">
          <QuizCard
            question={"Что должен делать router?"}
            options={[
              "связывать HTTP-контракт с готовым сервисом",
              "самостоятельно хешировать пароль",
              "создавать engine на каждый запрос"
            ]}
            correctIndex={0}
            explanation={"Router управляет транспортом и вызывает нижние слои."}
          />
          <QuizCard
            question={"Чем 401 отличается от 403?"}
            options={[
              "401 — нет подтверждённой личности, 403 — личности не хватает права",
              "разницы нет",
              "403 означает отсутствующую таблицу"
            ]}
            correctIndex={0}
            explanation={"Эти статусы отражают разные границы доступа."}
          />
          <QuizCard
            question={"Зачем dependency override в тесте?"}
            options={[
              "подменить production get_db на изолированную Session",
              "отключить все проверки",
              "заменить pytest"
            ]}
            correctIndex={0}
            explanation={"Override направляет приложение в тестовую базу."}
          />
          <QuizCard
            question={"Как доказать ownership?"}
            options={[
              "сценарием двух пользователей",
              "только тестом 200",
              "скрытием OpenAPI"
            ]}
            correctIndex={0}
            explanation={"Второй пользователь должен получить отказ на чужой ресурс."}
          />
        </div>

        <KeyTakeaways
          points={[
            <>{"Routers отвечают за HTTP-контракт, а services — за сценарии."}</>,
            <>{"Session service не устанавливает cookie самостоятельно."}</>,
            <>{"Bearer dependency декодирует access token и загружает active user."}</>,
            <>{"Ownership проверяется запросом task_id + owner_id."}</>,
            <>{"401, 403 и 404 имеют разные смыслы доступа."}</>,
            <>{"Доменные исключения переводятся централизованными handlers."}</>,
            <>{"Dependency overrides изолируют тестовую SQLite-базу."}</>,
            <>{"End-to-end тесты проходят реальные auth и resource flows."}</>,
            <>{"Release candidate обязан стартовать с чистой базы."}</>
          ]}
        />

        <PracticeCta
          text={"Реализуйте auth/users/tasks/admin routers, current user, ownership, exception handlers и isolated TestClient fixtures. Пройдите session, JWT, refresh rotation, two-user и upload сценарии."}
        />
      </Section>
    </RichLesson>
  );
}
