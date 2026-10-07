import { ShieldCheck, Trophy } from "lucide-react";
import { BugHunt, Callout, CodeBlock, CodeSequence, CompareSolutions, KeyTakeaways, Lead, MethodGrid, PracticeCta, PredictOutput, QuizCard, RecallCard, RichHero, RichLesson, Section, TerminalDemo, TrueFalse, TypeCard, TypeCards } from "../../shared";
import { TheoryBridge } from "../../shared";
const BLOCK_TITLE = "Блок 16 · Связи, Alembic и Database API";

export function Lesson92({
  module,
}: {
  module?: string;
}) {
  return (
    <RichLesson>
      <RichHero
        variant="project"
        chip={module ?? BLOCK_TITLE}
        title={"Итоговый проект этапа 4"}
        intro={"Соберём StudyHub Database API как законченный синхронный сервис: сведём роутеры, схемы, ORM-модели, CRUD, связи и Alembic, подключим отдельную тестовую SQLite-базу и подготовим проект к защите."}
        tags={[
          { icon: <Trophy size={14} />, label: "Database API" },
          { icon: <ShieldCheck size={14} />, label: "тесты и проверка" }
        ]}
      />

      <TheoryBridge link={"Предыдущие блоки дали отдельные механизмы FastAPI, SQLAlchemy и Alembic. Теперь они должны образовать один объяснимый путь запроса."} boundary={"Финальный проект не добавляет пользователей, JWT или async. Эти темы относятся к следующему этапу."} />

      <div className="lesson-route">
        <ol>
          <li>
            <strong>{"Шаг 1."}</strong>
            {"Создать схему с нуля."}
          </li>
          <li>
            <strong>{"Шаг 2."}</strong>
            {"Запустить тесты отдельно от рабочей бд."}
          </li>
          <li>
            <strong>{"Шаг 3."}</strong>
            {"Показать связанный http-сценарий."}
          </li>
          <li>
            <strong>{"Шаг 4."}</strong>
            {"Защитить архитектурные решения."}
          </li>
        </ol>
        <p>
          {"Маршрут заканчивается проверяемым изменением StudyHub, а не изолированным примером."}
        </p>
      </div>

      <TypeCards>
        <TypeCard badge={"до"} title={"Состояние до урока"} code={`StudyHub Database API`}>
          {"механизмы изучены отдельно"}
        </TypeCard>
        <TypeCard badge={"+"} badgeTone={"float"} title={"Что добавляем"} code={`Итоговый проект этапа 4`}>
          {"сборка и тестовая база"}
        </TypeCard>
        <TypeCard badge={"после"} badgeTone={"str"} title={"Состояние после"} code={`готовый проектный результат`}>
          {"воспроизводимый Database API"}
        </TypeCard>
      </TypeCards>

      <div className="lesson-practice-steps">
        <h3>{"Главная модель"}</h3>
        <p>{"Готовность API измеряется воспроизводимостью и объяснимым путём данных."}</p>

        <h3>{"Граничный сценарий"}</h3>
        <p>{"Тесты не используют рабочую базу, а будущие темы не смешиваются с релизом."}</p>

        <h3>{"Проектный результат"}</h3>
        <p>{"Migrations, tests, HTTP-сценарий и README работают с чистого состояния."}</p>
      </div>

      <Callout tone={"info"}>
  {"Граница урока: users, JWT и async — следующий этап."}
</Callout>

      <Section number={"01"} title={"Что считается завершённым API"}>
        <Lead>
  {"Новый разработчик должен клонировать репозиторий, применить migrations, запустить тесты и увидеть одинаковое поведение. Однократный запуск у автора не является готовностью."}
</Lead>

<TypeCards>
          <TypeCard badge={"API"} title={"HTTP-контракт"} code={`routers + schemas`}>
            {"FastAPI, Pydantic, статусы и OpenAPI."}
          </TypeCard>
          <TypeCard badge={"DB"} badgeTone={"float"} title={"Постоянные данные"} code={`models + crud`}>
            {"SQLite, Session, CRUD и связи."}
          </TypeCard>
          <TypeCard badge={"ops"} badgeTone={"str"} title={"Воспроизводимость"} code={`migrations + tests`}>
            {"Alembic, tests и README."}
          </TypeCard>
        </TypeCards>

<MethodGrid
          rows={[
            [<>{"alembic upgrade head"}</>, "создаёт схему с нуля"],
            [<>{"pytest"}</>, "проверяет ключевые контракты"],
            [<>{"uvicorn"}</>, "запускает приложение"],
            [<>{"README"}</>, "объясняет повторяемый workflow"]
          ]}
        />

<Callout tone={"info"}>
  {"Готовность определяется чистым воспроизводимым сценарием, а не количеством написанных файлов."}
</Callout>
      </Section>

      <Section number={"02"} title={"Структура и ответственности"}>
        <Lead>
  {"Папки разделены по причинам изменения. Новая абстракция добавляется только при реальной необходимости, а не ради архитектурного декора."}
</Lead>

<CodeBlock
          caption={"итоговое дерево"}
          code={`studyhub/
        ├── alembic.ini
        ├── migrations/
        │   ├── env.py
        │   └── versions/
        ├── app/
        │   ├── main.py
        │   ├── config.py
        │   ├── database.py
        │   ├── models/
        │   ├── schemas/
        │   ├── crud/
        │   └── routers/
        ├── tests/
        │   ├── conftest.py
        │   ├── test_categories.py
        │   └── test_tasks.py
        ├── .env.example
        ├── pyproject.toml
        └── README.md`}
        />

<MethodGrid
          rows={[
            [<>{"routers"}</>, "HTTP-параметры, Depends и статусы"],
            [<>{"schemas"}</>, "валидация и публичная форма ответа"],
            [<>{"models"}</>, "таблицы, ForeignKey и relationship"],
            [<>{"crud"}</>, "select, commit, rollback и загрузка"],
            [<>{"database"}</>, "engine, sessionmaker и get_db"],
            [<>{"migrations"}</>, "история схемы"]
          ]}
        />

<RecallCard
          question={"Почему не добавляется service layer автоматически?"}
          answer={<p>{"Для текущего размера CRUD-функции уже ясно выражают операции базы. Новый слой без новой ответственности только усложнит маршрут."}</p>}
        />

<Callout tone={"info"}>
  {"Структура считается хорошей, когда место изменения можно предсказать по причине изменения."}
</Callout>
      </Section>

      <Section number={"03"} title={"Полный путь POST /tasks"}>
        <Lead>
  {"Ученик должен объяснить запрос от JSON до строки базы и обратно, не читая все файлы подряд."}
</Lead>

<CodeBlock
          caption={"тонкий endpoint"}
          code={`@router.post(
            "",
            response_model=TaskReadWithCategory,
            status_code=201,
        )
        def create_task_endpoint(
            data: TaskCreate,
            session: Annotated[
                Session,
                Depends(get_db),
            ],
        ):
            return tasks_crud.create_task(
                session,
                data,
            )`}
        />

<MethodGrid
          rows={[
            [<>{"request"}</>, "клиент отправляет JSON"],
            [<>{"TaskCreate"}</>, "Pydantic проверяет вход"],
            [<>{"get_db"}</>, "выдаёт Session на запрос"],
            [<>{"CRUD"}</>, "проверяет category и создаёт ORM-объект"],
            [<>{"commit"}</>, "фиксирует транзакцию"],
            [<>{"refresh"}</>, "получает id и server defaults"],
            [<>{"response_model"}</>, "строит конечный JSON"]
          ]}
        />

<PredictOutput
          code={`steps = [
            "validation",
            "session",
            "crud",
            "commit",
            "response",
        ]
        print(len(steps))`}
          output={`5`}
          hint={"Путь запроса разделён на пять крупных этапов."}
        />

<Callout tone={"info"}>
  {"Тонкий endpoint отвечает за HTTP-контракт, но не содержит SQL и транзакционные детали."}
</Callout>
      </Section>

      <Section number={"04"} title={"Отдельная тестовая SQLite-база"}>
        <Lead>
  {"Тесты не должны читать или менять рабочий studyhub.db. get_db подменяется, а in-memory SQLite использует StaticPool, чтобы приложение и TestClient видели одно подключение."}
</Lead>

<CodeBlock
          caption={"tests/conftest.py"}
          code={`import pytest
        from fastapi.testclient import TestClient
        from sqlalchemy import create_engine
        from sqlalchemy.orm import sessionmaker
        from sqlalchemy.pool import StaticPool

        from app.database import Base, get_db
        from app.main import app

        engine = create_engine(
            "sqlite://",
            connect_args={
                "check_same_thread": False,
            },
            poolclass=StaticPool,
        )

        TestingSessionLocal = sessionmaker(
            bind=engine,
            expire_on_commit=False,
        )


        @pytest.fixture
        def client():
            Base.metadata.create_all(engine)

            def override_get_db():
                with TestingSessionLocal() as session:
                    yield session

            app.dependency_overrides[
                get_db
            ] = override_get_db

            with TestClient(app) as test_client:
                yield test_client

            app.dependency_overrides.clear()
            Base.metadata.drop_all(engine)`}
        />

<CompareSolutions
          question={"Зачем StaticPool?"}
          left={{
            title: "Обычный pool",
            code: `create_engine("sqlite://")`,
            note: "Разные подключения могут увидеть разные in-memory базы.",
          }}
          right={{
            title: "StaticPool",
            code: `poolclass=StaticPool`,
            note: "TestClient и dependency используют одну базу.",
          }}
          preferred={"right"}
          explanation={"In-memory SQLite существует внутри подключения."}
        />

<TrueFalse
          statement={<>{"dependency_overrides изменяет production-функцию навсегда."}</>}
          isTrue={false}
          explanation={"Override очищается после fixture."}
        />

<Callout tone={"info"}>
  {"Быстрые API-тесты используют create_all, а отдельный migration-test проверяет Alembic на файловой базе."}
</Callout>
      </Section>

      <Section number={"05"} title={"Матрица обязательных тестов"}>
        <Lead>
  {"Тесты выбираются по рискам: успешные сценарии, границы данных, связи, конфликты и восстановление Session."}
</Lead>

<MethodGrid
          rows={[
            [<>{"POST /categories"}</>, "201 и 409 для duplicate name"],
            [<>{"POST /tasks"}</>, "None, существующая и неизвестная category"],
            [<>{"GET /tasks"}</>, "фильтры, сортировка, pagination и category"],
            [<>{"PATCH /tasks/{task_id}"}</>, "частичное обновление и 404"],
            [<>{"DELETE category"}</>, "выбранная политика связи"],
            [<>{"IntegrityError"}</>, "rollback и следующий рабочий запрос"],
            [<>{"Alembic"}</>, "upgrade head на чистой базе"]
          ]}
        />

<CodeBlock
          caption={"тест связанной задачи"}
          code={`def test_create_task_with_category(client):
            category_response = client.post(
                "/categories",
                json={"name": "Python"},
            )
            category_id = (
                category_response.json()["id"]
            )

            response = client.post(
                "/tasks",
                json={
                    "title": "Relationships",
                    "category_id": category_id,
                },
            )

            assert response.status_code == 201
            assert (
                response.json()["category"]["name"]
                == "Python"
            )`}
        />

<RecallCard
          question={"Почему после IntegrityError нужен ещё один запрос?"}
          answer={<p>{"Он доказывает, что rollback вернул Session в рабочее состояние, а тест проверяет не только статус 409."}</p>}
        />

<TrueFalse
          statement={<>{"Чем больше тестов, тем автоматически лучше проект."}</>}
          isTrue={false}
          explanation={"Важнее покрыть значимые риски и контракты."}
        />

<Callout tone={"info"}>
  {"Тест должен проверять наблюдаемое поведение, а не повторять внутренние строки реализации."}
</Callout>
      </Section>

      <Section number={"06"} title={"README и запуск с чистого состояния"}>
        <Lead>
  {"README является исполняемой инструкцией: установка, .env, migrations, тесты, сервер и примеры запросов."}
</Lead>

<CodeBlock
          caption={"раздел запуска"}
          code={`## Запуск

        python -m venv .venv
        source .venv/bin/activate
        pip install -r requirements.txt
        cp .env.example .env
        alembic upgrade head
        uvicorn app.main:app --reload

        ## Проверка

        pytest
        alembic current`}
        />

<TerminalDemo
          title={"чистый прогон"}
          lines={[
            { cmd: "rm -f studyhub.db" },
{ cmd: "alembic upgrade head" },
{ cmd: "pytest" },
{ out: "all tests passed" },
{ cmd: "uvicorn app.main:app --reload" },
{ out: "Application startup complete" }
          ]}
        />

<TypeCards>
          <TypeCard badge={"setup"} title={"Установка"} code={`python -m venv .venv`}>
            {"Версия Python и зависимости."}
          </TypeCard>
          <TypeCard badge={"db"} badgeTone={"float"} title={"Подготовка базы"} code={`cp .env.example .env`}>
            {"DATABASE_URL и upgrade head."}
          </TypeCard>
          <TypeCard badge={"demo"} badgeTone={"str"} title={"Проверка"} code={`http GET :8000/tasks`}>
            {"pytest, docs и HTTP-примеры."}
          </TypeCard>
        </TypeCards>

<Callout tone={"info"}>
  {"README проверяется другим человеком или чистым окружением, а не только автором проекта."}
</Callout>
      </Section>

      <Section number={"07"} title={"Защита и границы следующего этапа"}>
        <Lead>
  {"На защите ученик показывает воспроизводимость, связанный сценарий и объясняет ключевые пары понятий. Новые технологии не добавляются в последний момент."}
</Lead>

<CodeSequence
          title={"Соберите защиту"}
          prompt={"Расположите демонстрацию от чистой базы до объяснения."}
          pieces={[
            { id: "clean", code: `удалить demo-базу` },
{ id: "migrate", code: `alembic upgrade head` },
{ id: "tests", code: `pytest` },
{ id: "run", code: `запустить FastAPI` },
{ id: "category", code: `создать категорию` },
{ id: "task", code: `создать связанную задачу` },
{ id: "explain", code: `объяснить request → Session → ORM → response` },
{ id: "jwt", code: `добавить JWT на защите`, note: "следующий этап" }
          ]}
          correctOrder={["clean", "migrate", "tests", "run", "category", "task", "explain"]}
          explanation={"Защита доказывает воспроизводимость, корректность и понимание."}
        />

<BugHunt
          code={`@pytest.fixture
        def client():
            return TestClient(app)

        # get_db использует рабочий DATABASE_URL`}
          question={"Почему тест опасен?"}
          options={["Он меняет локальную базу", "TestClient запрещён", "Fixture должна называться db"]}
          correctIndex={0}
          explanation={"Без override приложение открывает обычную Session."}
          fix={`@pytest.fixture
        def client():
            app.dependency_overrides[get_db] = override_get_db

            with TestClient(app) as test_client:
                yield test_client

            app.dependency_overrides.clear()`}
        />

<MethodGrid
          rows={[
            [<>{"Pydantic vs ORM"}</>, "контракт данных против отображения таблицы"],
            [<>{"Engine vs Session"}</>, "подключения против единицы работы"],
            [<>{"ForeignKey vs relationship"}</>, "целостность против навигации"],
            [<>{"rollback"}</>, "восстановление Session после ошибки"],
            [<>{"Alembic"}</>, "версионирование схемы"],
            [<>{"следующий этап"}</>, "users, authentication, authorization"]
          ]}
        />

<Callout tone={"info"}>
  {"JWT, пользователи, Docker и async намеренно не входят в финальный commit этапа 4."}
</Callout>
      </Section>

      <Section number={"08"} title={"Контрольная точка и практика"}>
        <Lead>
  {"Соберите модель урока в один маршрут, ответьте на четыре вопроса и выполните проектное задание без добавления будущих тем."}
</Lead>

<div className="lesson-practice-steps">
          <h3>{"Техническая готовность"}</h3>
          <p>{"Код запускается, основной сценарий работает, а ошибки имеют понятный контракт."}</p>

          <h3>{"Диагностическая готовность"}</h3>
          <p>{"Ученик может показать запрос, состояние Session или revision, от которого зависит результат."}</p>

          <h3>{"Объяснение"}</h3>
          <p>{"Главная модель урока объясняется своими словами без чтения готового определения."}</p>
        </div>

<div className="lesson-check-group">
          <QuizCard
            question={"Что создаёт схему на чистой базе?"}
            options={["alembic upgrade head", "первый endpoint", "response_model"]}
            correctIndex={0}
            explanation={"Migration history является путём схемы."}
          />

          <QuizCard
            question={"Зачем override get_db?"}
            options={["дать тестовую Session", "изменить method", "создать relationship"]}
            correctIndex={0}
            explanation={"Тесты изолируются от рабочей базы."}
          />

          <QuizCard
            question={"Где находится SQL списка?"}
            options={["crud", "schema", "README"]}
            correctIndex={0}
            explanation={"CRUD управляет Session и select."}
          />

          <QuizCard
            question={"Что отложено?"}
            options={["пользователи и authentication", "ForeignKey", "Alembic"]}
            correctIndex={0}
            explanation={"Безопасность начинается в следующем этапе."}
          />
        </div>

<KeyTakeaways
          points={[
            <>{"StudyHub Database API является цельным синхронным приложением."}</>,
            <>{"Слои разделены по причинам изменения."}</>,
            <>{"Session создаётся на запрос и подменяется в тестах."}</>,
            <>{"Связи защищены ForeignKey и доступны через relationship."}</>,
            <>{"N+1 диагностируется логом и исправляется явной загрузкой."}</>,
            <>{"Alembic воспроизводит и развивает схему."}</>,
            <>{"README и тесты делают проект проверяемым."}</>
          ]}
        />

<PracticeCta text={"Соберите финальный StudyHub Database API, прогоните его с чистой базы и подготовьте семиминутную защиту: migrations, tests, связанный POST/GET и объяснение архитектуры."} />
      </Section>
    </RichLesson>
  );
}
