import{t as e}from"./jsx-runtime-lw2jiZar.js";import{A as t,C as n,D as r,E as i,I as a,L as o,M as s,N as c,O as l,P as u,S as d,T as f,b as p,g as m,h,j as g,p as _,v,w as y,x as b,y as x}from"./shared-CsAEn-Fy.js";import{t as S}from"./git-branch--KUP4I0u.js";import{j as C}from"./index-u5OB1iPN.js";import{t as w}from"./CodeEditor-BZlrvoTL.js";var T=e(),E=`Блок 36 · Финальное качество, портфолио и интервью`;function D({module:e}){return(0,T.jsxs)(c,{children:[(0,T.jsx)(s,{variant:`project`,chip:e??E,title:`Финальный test suite и quality gate`,intro:`Соберём финальную тестовую стратегию вокруг рисков релиза: auth, permissions, transactions, migrations, cache, Redis failure, external mocks и end-to-end LMS flow. Coverage останется диагностическим сигналом, а release будет блокироваться нарушением ключевого контракта.`,tags:[{icon:(0,T.jsx)(C,{size:14}),label:`risk-based test matrix`},{icon:(0,T.jsx)(S,{size:14}),label:`clean DB · Redis · CI`}]}),(0,T.jsxs)(i,{tone:`info`,children:[(0,T.jsx)(`strong`,{children:`Связь с проектом.`}),` `,`Аудит назвал критичные границы. Теперь самые важные findings и пользовательские сценарии должны превратиться в автоматический quality gate.`,` `,(0,T.jsx)(`strong`,{children:`Важно не перепутать:`}),` `,`Цель не 100% coverage и не тестирование каждой внутренней строки. Тест защищает наблюдаемое правило, риск или интеграционную границу.`]}),(0,T.jsxs)(u,{number:`01`,title:`От множества тестов к доказательству рисков`,children:[(0,T.jsx)(l,{children:`Соберём финальную тестовую стратегию вокруг рисков релиза: auth, permissions, transactions, migrations, cache, Redis failure, external mocks и end-to-end LMS flow. Coverage останется диагностическим сигналом, а release будет блокироваться нарушением ключевого контракта.`}),(0,T.jsxs)(`div`,{className:`lesson-route`,children:[(0,T.jsxs)(`ol`,{children:[(0,T.jsxs)(`li`,{children:[(0,T.jsxs)(`strong`,{children:[`Построить матрицу`,`:`]}),` `,`связать risk, scenario, уровень теста и ожидаемый сигнал failure.`]}),(0,T.jsxs)(`li`,{children:[(0,T.jsxs)(`strong`,{children:[`Изолировать зависимости`,`:`]}),` `,`создать clean PostgreSQL, test Redis, deterministic clock и external mocks.`]}),(0,T.jsxs)(`li`,{children:[(0,T.jsxs)(`strong`,{children:[`Закрыть пробелы`,`:`]}),` `,`добавить tests для permissions, rollback, migrations, cache fallback и полного LMS flow.`]}),(0,T.jsxs)(`li`,{children:[(0,T.jsxs)(`strong`,{children:[`Сделать gate`,`:`]}),` `,`запускать один повторяемый pipeline и блокировать release при красном обязательном check.`]})]}),(0,T.jsx)(`p`,{children:`Маршрут заканчивается проверяемым артефактом, а не только чтением теории.`})]}),(0,T.jsxs)(o,{children:[(0,T.jsx)(a,{badge:`unit`,title:`Одно правило`,children:`Быстро проверяет pure function, validator, policy или mapper без реальной инфраструктуры.`}),(0,T.jsx)(a,{badge:`integration`,badgeTone:`float`,title:`Граница компонентов`,children:`Проверяет API + service + PostgreSQL, Redis adapter или migration на реальном контракте.`}),(0,T.jsx)(a,{badge:`end-to-end`,badgeTone:`str`,title:`Пользовательский flow`,children:`Доказывает teacher → publish → enrollment → completion → progress через внешний API.`}),(0,T.jsx)(a,{badge:`gate`,title:`Условие release`,children:`Обязательный набор checks с ясными командами, артефактами и fail-fast поведением.`})]}),(0,T.jsx)(b,{question:`Какой проверяемый результат должно дать это занятие?`,hint:`Назовите не тему, а конкретный artifact или evidence.`,answer:(0,T.jsx)(`p`,{children:`Результат должен воспроизводиться другим человеком и иметь успешный, ошибочный и диагностический сценарий.`})})]}),(0,T.jsxs)(u,{number:`02`,title:`Test matrix по критическим сценариям`,children:[(0,T.jsx)(l,{children:`Сначала фиксируем небольшую модель, которая помогает принимать решения. Термин ценен только тогда, когда его можно связать с наблюдаемым поведением проекта.`}),(0,T.jsx)(t,{rows:[[(0,T.jsx)(T.Fragment,{children:`permission bypass`}),`negative API integration tests для student/foreign teacher/admin`],[(0,T.jsx)(T.Fragment,{children:`partial transaction`}),`forced second-step failure и проверка rollback`],[(0,T.jsx)(T.Fragment,{children:`broken migration`}),`upgrade clean database → current head → smoke query`],[(0,T.jsx)(T.Fragment,{children:`stale cache`}),`publish/update → invalidate → next miss → fresh response`],[(0,T.jsx)(T.Fragment,{children:`dependency outage`}),`Redis/external API unavailable → documented fallback`]]}),(0,T.jsx)(_,{prompt:`Соедините элемент модели с его практической ролью.`,leftTitle:`Элемент`,rightTitle:`Роль`,pairs:[{left:`permission bypass`,right:`negative API integration tests для student/foreign teacher/admin`},{left:`partial transaction`,right:`forced second-step failure и проверка rollback`},{left:`broken migration`,right:`upgrade clean database → current head → smoke query`},{left:`stale cache`,right:`publish/update → invalidate → next miss → fresh response`}],explanation:`Пары закрепляют не термин отдельно, а его место в рабочем процессе StudyHub.`}),(0,T.jsx)(d,{statement:(0,T.jsx)(T.Fragment,{children:`Высокий coverage автоматически доказывает, что permissions, migrations и rollback защищены.`}),isTrue:!1,explanation:`Coverage показывает исполненные строки, но не качество assertions, выбранные риски и реалистичность environment.`}),(0,T.jsx)(i,{tone:`info`,children:`Модель должна сокращать область поиска решения. Если после схемы всё равно непонятно, что запускать и проверять, схема слишком абстрактна.`})]}),(0,T.jsxs)(u,{number:`03`,title:`Строим устойчивую тестовую границу`,children:[(0,T.jsx)(l,{children:`Разбираем минимальный рабочий фрагмент до интеграции. Сначала читаем контракт, затем прослеживаем значения и только после этого меняем одну деталь.`}),(0,T.jsx)(w,{caption:`risk-based test matrix как данные`,code:`from dataclasses import dataclass
from enum import StrEnum


class TestLevel(StrEnum):
    UNIT = "unit"
    INTEGRATION = "integration"
    E2E = "e2e"


@dataclass(frozen=True)
class RiskCase:
    risk: str
    level: TestLevel
    scenario: str
    expected: str


MATRIX = [
    RiskCase(
        risk="foreign teacher edits course",
        level=TestLevel.INTEGRATION,
        scenario="PATCH /api/v1/courses/{id} as another teacher",
        expected="403 and unchanged database row",
    ),
    RiskCase(
        risk="duplicate completion",
        level=TestLevel.INTEGRATION,
        scenario="repeat completion request",
        expected="idempotent response and one database row",
    ),
]`}),(0,T.jsx)(v,{code:`from dataclasses import dataclass
from enum import StrEnum


class TestLevel(StrEnum):
    UNIT = "unit"
    INTEGRATION = "integration"
    E2E = "e2e"


@dataclass(frozen=True)
class RiskCase:
    risk: str
    level: TestLevel
    scenario: str
    expected: str


MATRIX = [
    RiskCase(
        risk="foreign teacher edits course",
        level=TestLevel.INTEGRATION,
        scenario="PATCH /api/v1/courses/{id} as another teacher",
        expected="403 and unchanged database row",
    ),
    RiskCase(
        risk="duplicate completion",
        level=TestLevel.INTEGRATION,
        scenario="repeat completion request",
        expected="idempotent response and one database row",
    ),
]`,steps:[{line:10,note:`RiskCase связывает риск с уровнем и наблюдаемым результатом.`,vars:{единица:`risk case`}},{line:20,note:`Permission bypass требует реального HTTP и database state.`,vars:{level:`integration`}},{line:22,note:`Assertion проверяет не только status, но и неизменность строки.`,vars:{proof:`403 + unchanged`}},{line:25,note:`Повтор completion проверяет идемпотентность и constraint.`,vars:{rows:`1`}}]}),(0,T.jsx)(m,{prompt:`Какое слово должно завершить проверку отсутствия лишней строки?`,before:`assert completion_count `,after:` 1`,options:[`==`,`=`,`is not`],answer:`==`,explanation:`В тестовом выражении сравнение выполняется оператором ==, а присваивание = недопустимо.`}),(0,T.jsx)(i,{tone:`info`,children:`После заполнения измените одно входное значение, предскажите результат и только затем запускайте проверку.`})]}),(0,T.jsxs)(u,{number:`04`,title:`Coverage или критические гарантии`,children:[(0,T.jsx)(l,{children:`Сравнение нужно не для выбора «красивого» кода, а для явного обсуждения контракта, риска и стоимости следующего изменения.`}),(0,T.jsx)(f,{question:`Какой набор ближе к risk-based release gate?`,left:{title:`Много мелких unit tests`,code:`347 passed
coverage: 98%
PostgreSQL: mocked
Redis: mocked
migrations: skipped`,note:`Большое число не доказывает интеграционные границы релиза.`},right:{title:`Сбалансированная матрица`,code:`unit: policies and mappers
integration: auth, DB, Redis
e2e: teacher/student flow
migrations: clean DB
quality gate: required`,note:`Каждый уровень закрывает риск, который не виден на другом уровне.`},preferred:`right`,explanation:`Качество определяется защищёнными контрактами и воспроизводимой средой, а не только количеством tests.`}),(0,T.jsxs)(`div`,{className:`lesson-practice-steps`,children:[(0,T.jsx)(`h3`,{children:`Сначала назовите критерий`}),(0,T.jsx)(`p`,{children:`До выбора варианта сформулируйте, какое свойство проекта нужно сохранить: совместимость, безопасность, воспроизводимость или понятность.`}),(0,T.jsx)(`h3`,{children:`Затем найдите evidence`}),(0,T.jsx)(`p`,{children:`Подтвердите решение тестом, логом, планом запроса, clean start или повторяемым demo-сценарием.`}),(0,T.jsx)(`h3`,{children:`После этого зафиксируйте границу`}),(0,T.jsx)(`p`,{children:`Укажите, при каком изменении требований выбранный вариант перестанет быть достаточным.`})]}),(0,T.jsx)(b,{question:`Почему более сложный вариант не считается автоматически более профессиональным?`,answer:(0,T.jsx)(`p`,{children:`Профессиональность определяется соответствием риску и требованиям. Лишний механизм увеличивает стоимость поддержки без доказанной пользы.`})})]}),(0,T.jsxs)(u,{number:`05`,title:`Устраняем хрупкий test setup`,children:[(0,T.jsx)(l,{children:`Финальное качество проявляется в работе со сбоями. Намеренно запускаем дефектный сценарий, объясняем причину и проверяем исправление отдельным evidence.`}),(0,T.jsx)(n,{code:`@pytest.fixture
async def session():
    return AsyncSession(engine)


async def test_duplicate_enrollment(session, client):
    await client.post("/api/v1/courses/1/enrollments")
    await client.post("/api/v1/courses/1/enrollments")

    count = await count_enrollments(session)
    assert count == 1`,question:`Почему fixture может сделать suite нестабильным?`,options:[`Session не закрывается и database state не очищается`,`Pytest запрещает async fixtures`,`POST нельзя вызывать дважды`],correctIndex:0,explanation:`Без controlled transaction/cleanup tests делят соединения и строки, а результат зависит от порядка запуска.`,fix:`@pytest_asyncio.fixture
async def session(test_engine):
    async with async_sessionmaker(
        test_engine,
        expire_on_commit=False,
    )() as session:
        yield session
        await session.rollback()


@pytest_asyncio.fixture(autouse=True)
async def clean_database(test_engine):
    await truncate_all_tables(test_engine)
    yield`}),(0,T.jsxs)(`div`,{className:`lesson-practice-steps`,children:[(0,T.jsx)(`h3`,{children:`1. Воспроизведите`}),(0,T.jsx)(`p`,{children:`Сведите проблему к короткому сценарию и сохраните точный вход, команду и наблюдаемый результат.`}),(0,T.jsx)(`h3`,{children:`2. Найдите нарушенное ожидание`}),(0,T.jsx)(`p`,{children:`Не маскируйте симптом. Назовите контракт, который код нарушает, и слой, отвечающий за исправление.`}),(0,T.jsx)(`h3`,{children:`3. Защитите результат`}),(0,T.jsx)(`p`,{children:`Добавьте тест, проверку, runbook или diagnostic evidence, чтобы дефект не вернулся незаметно.`})]})]}),(0,T.jsxs)(u,{number:`06`,title:`Собираем финальный quality gate`,children:[(0,T.jsx)(l,{children:`Теперь переносим минимальную модель в StudyHub. Endpoint или infrastructure step остаётся координатором, а правило и диагностическая граница получают отдельное место.`}),(0,T.jsx)(w,{caption:`negative permission test`,code:`async def test_foreign_teacher_cannot_update_course(
    client: AsyncClient,
    teacher_a_headers: dict[str, str],
    teacher_b_headers: dict[str, str],
    session: AsyncSession,
) -> None:
    course = await create_course(
        client,
        headers=teacher_a_headers,
        title="Async Python",
    )

    response = await client.patch(
        f"/api/v1/courses/{course['id']}",
        headers=teacher_b_headers,
        json={"title": "Hijacked"},
    )

    assert response.status_code == 403
    assert response.json()["code"] == "course_forbidden"

    stored = await session.get(Course, course["id"])
    assert stored is not None
    assert stored.title == "Async Python"`}),(0,T.jsx)(h,{code:`if risk.needs_database:
    environment = clean_postgres()
elif risk.needs_redis:
    environment = isolated_redis_namespace()
elif risk.needs_external_api:
    environment = deterministic_http_mock()
else:
    environment = pure_python_fixture()`,scenarios:[{label:`transaction rollback`,activeLine:1,output:`clean PostgreSQL`},{label:`cache invalidation`,activeLine:3,output:`isolated Redis namespace`},{label:`recommendation timeout`,activeLine:5,output:`deterministic HTTP mock`},{label:`slug normalizer`,activeLine:7,output:`pure Python fixture`}]}),(0,T.jsxs)(o,{children:[(0,T.jsx)(a,{badge:`01`,title:`Migrations gate`,children:`Создать пустую database, выполнить alembic upgrade head, проверить current head и запустить smoke query.`}),(0,T.jsx)(a,{badge:`02`,badgeTone:`float`,title:`Determinism`,children:`Зафиксировать clock, random seed, external responses и unique namespaces вместо sleep и общей state.`}),(0,T.jsx)(a,{badge:`03`,badgeTone:`str`,title:`Artifacts`,children:`Сохранять test report, coverage как сигнал, migration log и service logs при failure.`})]}),(0,T.jsx)(i,{tone:`info`,children:`Интеграция считается завершённой только после проверки happy path, запрета или сбоя и возможности объяснить путь данных без чтения всего проекта.`})]}),(0,T.jsxs)(u,{number:`07`,title:`Запускаем gate в чистом окружении`,children:[(0,T.jsx)(l,{children:`Финальный шаг урока превращает знание в воспроизводимую процедуру. Команды, ожидаемые результаты и порядок действий сохраняются в репозитории.`}),(0,T.jsx)(x,{title:`проверяем результат`,lines:[{cmd:`docker compose -f compose.test.yaml up -d postgres redis`},{out:`postgres healthy
redis healthy`},{cmd:`alembic upgrade head`},{out:`Running upgrade ... -> head`},{cmd:`pytest -m "not slow" -q`},{out:`214 passed in 18.71s`},{cmd:`pytest -m e2e -q`},{out:`12 passed in 9.82s`},{cmd:`python scripts/assert_migration_head.py`},{out:`database revision matches alembic head`}]}),(0,T.jsx)(y,{title:`Соберите рабочий порядок`,prompt:`Расположите шаги так, чтобы результат оставался проверяемым и обратимым.`,pieces:[{id:`services`,code:`поднять clean test services`},{id:`migrate`,code:`применить migrations from zero`},{id:`unit`,code:`запустить быстрые unit checks`},{id:`integration`,code:`запустить API/DB/Redis integration`},{id:`e2e`,code:`запустить основной LMS flow`},{id:`artifacts`,code:`сохранить отчёты и остановить services`}],correctOrder:[`services`,`migrate`,`unit`,`integration`,`e2e`,`artifacts`],explanation:`Интеграционные tests доверяют только базе, созданной текущими migrations, а artifacts сохраняются даже при failure.`}),(0,T.jsxs)(`div`,{className:`lesson-practice-steps`,children:[(0,T.jsx)(`h3`,{children:`Коммит 1 — наблюдение`}),(0,T.jsx)(`p`,{children:`Зафиксируйте baseline, failing scenario или исходный документ до изменения.`}),(0,T.jsx)(`h3`,{children:`Коммит 2 — минимальное исправление`}),(0,T.jsx)(`p`,{children:`Измените только ответственную границу и сохраните маленький читаемый diff.`}),(0,T.jsx)(`h3`,{children:`Коммит 3 — evidence`}),(0,T.jsx)(`p`,{children:`Добавьте тест, документацию, diagram или runbook, который доказывает результат.`})]}),(0,T.jsx)(b,{question:`Что должно позволить другому разработчику повторить результат?`,answer:(0,T.jsx)(`p`,{children:`Точная последовательность команд, входные условия, ожидаемый вывод и путь диагностики отклонения.`})})]}),(0,T.jsxs)(u,{number:`08`,title:`Контрольная точка и самостоятельная практика`,children:[(0,T.jsx)(l,{children:`Ответьте на вопросы без запуска, затем проверьте себя. После контроля выполните проектную практику и объясните результат словами, не читая готовый текст.`}),(0,T.jsxs)(`div`,{className:`lesson-check-group`,children:[(0,T.jsx)(p,{question:`Как выбрать уровень теста?`,options:[`По привычке автора`,`По риску и необходимой границе`,`Всегда E2E`],correctIndex:1,explanation:`Уровень определяется тем, какие реальные компоненты нужны для доказательства правила.`}),(0,T.jsx)(p,{question:`Что обязательно проверить в permission test кроме 403?`,options:[`Цвет лога`,`Неизменность protected resource`,`Количество файлов`],correctIndex:1,explanation:`Запрещённый request не должен оставить побочный эффект.`}),(0,T.jsx)(p,{question:`Зачем migration gate начинает с пустой базы?`,options:[`Чтобы доказать воспроизводимость schema`,`Чтобы ускорить unit tests`,`Чтобы не запускать Alembic`],correctIndex:0,explanation:`Release должен уметь построить актуальную schema без локальной истории разработчика.`}),(0,T.jsx)(p,{question:`Почему sleep делает TTL test слабым?`,options:[`Он использует Python`,`Добавляет время и нестабильность`,`Redis не поддерживает TTL`],correctIndex:1,explanation:`Лучше управляемый clock или короткий изолированный expiry с polling и пределом.`})]}),(0,T.jsx)(r,{points:[(0,T.jsx)(T.Fragment,{children:`Test matrix строится от рисков продукта и инфраструктуры, а не от желания получить красивый процент.`}),(0,T.jsx)(T.Fragment,{children:`Unit, integration и end-to-end уровни отвечают на разные вопросы и не заменяют друг друга.`}),(0,T.jsx)(T.Fragment,{children:`Permission test проверяет status, error code и отсутствие запрещённого изменения.`}),(0,T.jsx)(T.Fragment,{children:`Clean PostgreSQL и migrations from zero входят в release gate.`}),(0,T.jsx)(T.Fragment,{children:`Redis, external HTTP и время изолируются так, чтобы tests были deterministic.`}),(0,T.jsx)(T.Fragment,{children:`CI блокирует release при нарушении ключевого контракта и сохраняет диагностические artifacts.`})]}),(0,T.jsx)(g,{text:`Составьте risk-based matrix минимум из 25 cases, добавьте отсутствующие permission, rollback, migration, cache и outage tests, запустите их на clean PostgreSQL/Redis и оформите один обязательный release quality gate.`})]})]})}export{D as Lesson209};