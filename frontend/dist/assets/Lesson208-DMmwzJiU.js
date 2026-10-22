import{t as e}from"./jsx-runtime-lw2jiZar.js";import{A as t,C as n,D as r,E as i,I as a,L as o,M as s,N as c,O as l,P as u,S as d,T as f,b as p,g as m,h,j as g,p as _,v,w as y,x as b,y as x}from"./shared-CsAEn-Fy.js";import{t as S}from"./search-f2spAuW6.js";import{t as C}from"./triangle-alert-DqRaRrys.js";import{t as w}from"./CodeEditor-BZlrvoTL.js";var T=e(),E=`Блок 36 · Финальное качество, портфолио и интервью`;function D({module:e}){return(0,T.jsxs)(c,{children:[(0,T.jsx)(s,{variant:`project`,chip:e??E,title:`Аудит безопасности и производительности`,intro:`Проведём инженерный аудит без ложного ярлыка production-ready: составим риск-реестр, проверим secrets, auth, ownership, CORS, SQL, N+1, indexes, transactions, cache invalidation и rate limit, затем подтвердим минимум три исправления наблюдаемыми данными.`,tags:[{icon:(0,T.jsx)(S,{size:14}),label:`risk → evidence → fix`},{icon:(0,T.jsx)(C,{size:14}),label:`security · queries · cache`}]}),(0,T.jsxs)(i,{tone:`info`,children:[(0,T.jsx)(`strong`,{children:`Связь с проектом.`}),` `,`После стабилизации внешнего error contract можно исследовать системные границы: где проект раскрывает данные, допускает чужое действие или выполняет лишнюю работу.`,` `,(0,T.jsx)(`strong`,{children:`Важно не перепутать:`}),` `,`Учебный checklist не является penetration test, formal certification или гарантией безопасности. Результат — прозрачный список проверок, рисков и подтверждённых исправлений.`]}),(0,T.jsxs)(u,{number:`01`,title:`Почему финальный проект нужен аудит`,children:[(0,T.jsx)(l,{children:`Проведём инженерный аудит без ложного ярлыка production-ready: составим риск-реестр, проверим secrets, auth, ownership, CORS, SQL, N+1, indexes, transactions, cache invalidation и rate limit, затем подтвердим минимум три исправления наблюдаемыми данными.`}),(0,T.jsxs)(`div`,{className:`lesson-route`,children:[(0,T.jsxs)(`ol`,{children:[(0,T.jsxs)(`li`,{children:[(0,T.jsxs)(`strong`,{children:[`Определить активы`,`:`]}),` `,`назвать данные и операции, ущерб от которых действительно важен.`]}),(0,T.jsxs)(`li`,{children:[(0,T.jsxs)(`strong`,{children:[`Проверить контроль`,`:`]}),` `,`для каждого риска найти код, configuration, test, query plan или log.`]}),(0,T.jsxs)(`li`,{children:[(0,T.jsxs)(`strong`,{children:[`Оценить приоритет`,`:`]}),` `,`сопоставить вероятность и влияние вместо случайного порядка fixes.`]}),(0,T.jsxs)(`li`,{children:[(0,T.jsxs)(`strong`,{children:[`Доказать улучшение`,`:`]}),` `,`сохранить before/after evidence и отдельный commit на каждую проблему.`]})]}),(0,T.jsx)(`p`,{children:`Маршрут заканчивается проверяемым артефактом, а не только чтением теории.`})]}),(0,T.jsxs)(o,{children:[(0,T.jsx)(a,{badge:`asset`,title:`Что защищаем`,children:`Пароль, token, персональные данные, ownership курса и доступность API.`}),(0,T.jsx)(a,{badge:`threat`,badgeTone:`float`,title:`Что может случиться`,children:`Утечка secret, чужое изменение course, SQL injection, N+1 или stale cache.`}),(0,T.jsx)(a,{badge:`control`,badgeTone:`str`,title:`Что снижает риск`,children:`Environment config, hash, permission check, parameters, eager loading или invalidation.`}),(0,T.jsx)(a,{badge:`evidence`,title:`Чем подтверждаем`,children:`Тест, redacted log, EXPLAIN, benchmark, git diff или воспроизводимый сценарий.`})]}),(0,T.jsx)(b,{question:`Какой проверяемый результат должно дать это занятие?`,hint:`Назовите не тему, а конкретный artifact или evidence.`,answer:(0,T.jsx)(`p`,{children:`Результат должен воспроизводиться другим человеком и иметь успешный, ошибочный и диагностический сценарий.`})})]}),(0,T.jsxs)(u,{number:`02`,title:`Risk register вместо общего списка`,children:[(0,T.jsx)(l,{children:`Сначала фиксируем небольшую модель, которая помогает принимать решения. Термин ценен только тогда, когда его можно связать с наблюдаемым поведением проекта.`}),(0,T.jsx)(t,{rows:[[(0,T.jsx)(T.Fragment,{children:`critical`}),`высокое влияние и реалистичный путь — исправить до release`],[(0,T.jsx)(T.Fragment,{children:`high`}),`существенный риск — назначить owner и ближайший commit`],[(0,T.jsx)(T.Fragment,{children:`medium`}),`ограниченный ущерб или сложный путь — документировать и планировать`],[(0,T.jsx)(T.Fragment,{children:`low`}),`малое влияние — не маскировать им более важные проблемы`],[(0,T.jsx)(T.Fragment,{children:`accepted`}),`осознанное ограничение с причиной и сроком пересмотра`]]}),(0,T.jsx)(_,{prompt:`Соедините элемент модели с его практической ролью.`,leftTitle:`Элемент`,rightTitle:`Роль`,pairs:[{left:`critical`,right:`высокое влияние и реалистичный путь — исправить до release`},{left:`high`,right:`существенный риск — назначить owner и ближайший commit`},{left:`medium`,right:`ограниченный ущерб или сложный путь — документировать и планировать`},{left:`low`,right:`малое влияние — не маскировать им более важные проблемы`}],explanation:`Пары закрепляют не термин отдельно, а его место в рабочем процессе StudyHub.`}),(0,T.jsx)(d,{statement:(0,T.jsx)(T.Fragment,{children:`Количество найденных пунктов важнее подтверждения того, что каждый пункт действительно применим к StudyHub.`}),isTrue:!1,explanation:`Аудит ценен точностью. Двадцать общих предупреждений без evidence хуже трёх конкретных рисков с воспроизводимым сценарием и исправлением.`}),(0,T.jsx)(i,{tone:`info`,children:`Модель должна сокращать область поиска решения. Если после схемы всё равно непонятно, что запускать и проверять, схема слишком абстрактна.`})]}),(0,T.jsxs)(u,{number:`03`,title:`Фиксируем находку как проверяемый объект`,children:[(0,T.jsx)(l,{children:`Разбираем минимальный рабочий фрагмент до интеграции. Сначала читаем контракт, затем прослеживаем значения и только после этого меняем одну деталь.`}),(0,T.jsx)(w,{caption:`структура записи аудита`,code:`from dataclasses import dataclass
from enum import StrEnum


class Severity(StrEnum):
    CRITICAL = "critical"
    HIGH = "high"
    MEDIUM = "medium"
    LOW = "low"


@dataclass(frozen=True)
class AuditFinding:
    finding_id: str
    area: str
    severity: Severity
    evidence: str
    risk: str
    remediation: str
    verification: str


finding = AuditFinding(
    finding_id="AUTH-03",
    area="object ownership",
    severity=Severity.CRITICAL,
    evidence="teacher B can PATCH course owned by teacher A",
    risk="unauthorized course modification",
    remediation="load course and compare owner_id before update",
    verification="integration test returns 403 and row stays unchanged",
)`}),(0,T.jsx)(v,{code:`from dataclasses import dataclass
from enum import StrEnum


class Severity(StrEnum):
    CRITICAL = "critical"
    HIGH = "high"
    MEDIUM = "medium"
    LOW = "low"


@dataclass(frozen=True)
class AuditFinding:
    finding_id: str
    area: str
    severity: Severity
    evidence: str
    risk: str
    remediation: str
    verification: str


finding = AuditFinding(
    finding_id="AUTH-03",
    area="object ownership",
    severity=Severity.CRITICAL,
    evidence="teacher B can PATCH course owned by teacher A",
    risk="unauthorized course modification",
    remediation="load course and compare owner_id before update",
    verification="integration test returns 403 and row stays unchanged",
)`,steps:[{line:11,note:`AuditFinding хранит факт, риск и проверку раздельно.`,vars:{формат:`finding`}},{line:23,note:`Evidence описывает воспроизводимое наблюдение, а не впечатление автора.`,vars:{evidence:`PATCH чужого course`}},{line:24,note:`Risk отвечает на вопрос об ущербе.`,vars:{impact:`чужое изменение`}},{line:25,note:`Remediation задаёт минимальное изменение контроля.`,vars:{control:`ownership check`}},{line:26,note:`Verification заранее определяет доказательство закрытия.`,vars:{proof:`403 + unchanged row`}}]}),(0,T.jsx)(m,{prompt:`Какое поле должно описывать наблюдаемый факт до исправления?`,before:`    `,after:`: str`,options:[`evidence`,`opinion`,`marketing_score`],answer:`evidence`,explanation:`Evidence должно позволять другому разработчику воспроизвести проблему и сравнить результат после fix.`}),(0,T.jsx)(i,{tone:`info`,children:`После заполнения измените одно входное значение, предскажите результат и только затем запускайте проверку.`})]}),(0,T.jsxs)(u,{number:`04`,title:`Исправлять по ощущению или по риску`,children:[(0,T.jsx)(l,{children:`Сравнение нужно не для выбора «красивого» кода, а для явного обсуждения контракта, риска и стоимости следующего изменения.`}),(0,T.jsx)(f,{question:`Какой отчёт помогает принять решение о release?`,left:{title:`Общий чек-лист`,code:`- passwords secure
- database optimized
- CORS configured
- tests exist`,note:`Нет места, сценария, severity и способа проверки.`},right:{title:`Risk register`,code:`AUTH-03 | critical
Evidence: PATCH чужого course = 200
Fix: owner check
Verify: 403 + unchanged row`,note:`Проблема воспроизводится, имеет приоритет и критерий закрытия.`},preferred:`right`,explanation:`Release decision требует evidence и остаточного риска, а не зелёных слов без контекста.`}),(0,T.jsxs)(`div`,{className:`lesson-practice-steps`,children:[(0,T.jsx)(`h3`,{children:`Сначала назовите критерий`}),(0,T.jsx)(`p`,{children:`До выбора варианта сформулируйте, какое свойство проекта нужно сохранить: совместимость, безопасность, воспроизводимость или понятность.`}),(0,T.jsx)(`h3`,{children:`Затем найдите evidence`}),(0,T.jsx)(`p`,{children:`Подтвердите решение тестом, логом, планом запроса, clean start или повторяемым demo-сценарием.`}),(0,T.jsx)(`h3`,{children:`После этого зафиксируйте границу`}),(0,T.jsx)(`p`,{children:`Укажите, при каком изменении требований выбранный вариант перестанет быть достаточным.`})]}),(0,T.jsx)(b,{question:`Почему более сложный вариант не считается автоматически более профессиональным?`,answer:(0,T.jsx)(`p`,{children:`Профессиональность определяется соответствием риску и требованиям. Лишний механизм увеличивает стоимость поддержки без доказанной пользы.`})})]}),(0,T.jsxs)(u,{number:`05`,title:`Находим дефект безопасности или производительности`,children:[(0,T.jsx)(l,{children:`Финальное качество проявляется в работе со сбоями. Намеренно запускаем дефектный сценарий, объясняем причину и проверяем исправление отдельным evidence.`}),(0,T.jsx)(n,{code:`@router.patch("/courses/{course_id}")
async def update_course(
    course_id: int,
    payload: CourseUpdate,
    user: CurrentUser,
    session: AsyncSession,
):
    course = await session.get(Course, course_id)
    if course is None:
        raise CourseNotFound(course_id)

    apply_patch(course, payload)
    await session.commit()
    return course`,question:`Какой critical permission defect виден в endpoint?`,options:[`Не проверено владение course или роль admin`,`AsyncSession нельзя использовать с PATCH`,`Commit должен быть до изменения`],correctIndex:0,explanation:`Любой authenticated user может изменить найденный course, если отдельная permission dependency отсутствует.`,fix:`course = await get_course_or_404(session, course_id)

if user.role != "admin" and course.owner_id != user.id:
    raise CourseForbidden(course_id)

apply_patch(course, payload)
await session.commit()
await session.refresh(course)
return course`}),(0,T.jsxs)(`div`,{className:`lesson-practice-steps`,children:[(0,T.jsx)(`h3`,{children:`1. Воспроизведите`}),(0,T.jsx)(`p`,{children:`Сведите проблему к короткому сценарию и сохраните точный вход, команду и наблюдаемый результат.`}),(0,T.jsx)(`h3`,{children:`2. Найдите нарушенное ожидание`}),(0,T.jsx)(`p`,{children:`Не маскируйте симптом. Назовите контракт, который код нарушает, и слой, отвечающий за исправление.`}),(0,T.jsx)(`h3`,{children:`3. Защитите результат`}),(0,T.jsx)(`p`,{children:`Добавьте тест, проверку, runbook или diagnostic evidence, чтобы дефект не вернулся незаметно.`})]})]}),(0,T.jsxs)(u,{number:`06`,title:`Проводим аудит реального StudyHub`,children:[(0,T.jsx)(l,{children:`Теперь переносим минимальную модель в StudyHub. Endpoint или infrastructure step остаётся координатором, а правило и диагностическая граница получают отдельное место.`}),(0,T.jsx)(w,{caption:`аудит read-path каталога`,code:`async def list_catalog(
    session: AsyncSession,
    *,
    limit: int,
    offset: int,
) -> list[Course]:
    statement = (
        select(Course)
        .where(Course.status == CourseStatus.PUBLISHED)
        .options(selectinload(Course.modules))
        .order_by(Course.published_at.desc(), Course.id.desc())
        .limit(limit)
        .offset(offset)
    )
    result = await session.scalars(statement)
    return list(result.unique().all())`}),(0,T.jsx)(h,{code:`if finding.area == "secret":
    evidence = inspect_config_and_git_history()
elif finding.area == "permission":
    evidence = run_negative_access_test()
elif finding.area == "query":
    evidence = capture_explain_and_query_count()
elif finding.area == "cache":
    evidence = reproduce_stale_read()
else:
    evidence = document_manual_review()`,scenarios:[{label:`secret in .env`,activeLine:1,output:`remove, rotate, scan history`},{label:`foreign course PATCH`,activeLine:3,output:`403 negative integration test`},{label:`catalog N+1`,activeLine:5,output:`query count + eager loading`},{label:`stale after publish`,activeLine:7,output:`commit → invalidate → miss`}]}),(0,T.jsxs)(o,{children:[(0,T.jsx)(a,{badge:`01`,title:`Security lane`,children:`Secrets, password/token handling, ownership, permissions matrix, CORS и parameterized SQL.`}),(0,T.jsx)(a,{badge:`02`,badgeTone:`float`,title:`Performance lane`,children:`Query count, EXPLAIN, N+1, indexes, transaction duration, cache hit/miss и invalidation.`}),(0,T.jsx)(a,{badge:`03`,badgeTone:`str`,title:`Operational lane`,children:`Rate limit behavior, logs without secrets, health endpoints, dependency failure и rollback procedure.`})]}),(0,T.jsx)(i,{tone:`info`,children:`Интеграция считается завершённой только после проверки happy path, запрета или сбоя и возможности объяснить путь данных без чтения всего проекта.`})]}),(0,T.jsxs)(u,{number:`07`,title:`Собираем evidence и commits`,children:[(0,T.jsx)(l,{children:`Финальный шаг урока превращает знание в воспроизводимую процедуру. Команды, ожидаемые результаты и порядок действий сохраняются в репозитории.`}),(0,T.jsx)(x,{title:`проверяем результат`,lines:[{cmd:`pytest tests/security/test_course_ownership.py -q`},{out:`4 passed`},{cmd:`python scripts/query_count.py /api/v1/courses`},{out:`before: 31 SQL statements
after: 3 SQL statements`},{cmd:`git grep -nE "SECRET_KEY=|postgresql.*:.*@|Bearer " -- . ":(exclude).env.example"`},{out:`no tracked secrets found`},{cmd:`python scripts/audit_summary.py`},{out:`critical: 0 | high: 0 | medium accepted: 2 | evidence files: 20`}]}),(0,T.jsx)(y,{title:`Соберите рабочий порядок`,prompt:`Расположите шаги так, чтобы результат оставался проверяемым и обратимым.`,pieces:[{id:`scope`,code:`зафиксировать scope и assets`},{id:`checklist`,code:`пройти checklist с evidence`},{id:`triage`,code:`назначить severity и owner`},{id:`fix`,code:`исправить critical/high отдельными commits`},{id:`verify`,code:`повторить сценарии и измерения`},{id:`report`,code:`записать accepted risks и итог`}],correctOrder:[`scope`,`checklist`,`triage`,`fix`,`verify`,`report`],explanation:`Исправление начинается после фиксации evidence и приоритета, иначе audit превращается в хаотичный refactoring.`}),(0,T.jsxs)(`div`,{className:`lesson-practice-steps`,children:[(0,T.jsx)(`h3`,{children:`Коммит 1 — наблюдение`}),(0,T.jsx)(`p`,{children:`Зафиксируйте baseline, failing scenario или исходный документ до изменения.`}),(0,T.jsx)(`h3`,{children:`Коммит 2 — минимальное исправление`}),(0,T.jsx)(`p`,{children:`Измените только ответственную границу и сохраните маленький читаемый diff.`}),(0,T.jsx)(`h3`,{children:`Коммит 3 — evidence`}),(0,T.jsx)(`p`,{children:`Добавьте тест, документацию, diagram или runbook, который доказывает результат.`})]}),(0,T.jsx)(b,{question:`Что должно позволить другому разработчику повторить результат?`,answer:(0,T.jsx)(`p`,{children:`Точная последовательность команд, входные условия, ожидаемый вывод и путь диагностики отклонения.`})})]}),(0,T.jsxs)(u,{number:`08`,title:`Контрольная точка и самостоятельная практика`,children:[(0,T.jsx)(l,{children:`Ответьте на вопросы без запуска, затем проверьте себя. После контроля выполните проектную практику и объясните результат словами, не читая готовый текст.`}),(0,T.jsxs)(`div`,{className:`lesson-check-group`,children:[(0,T.jsx)(p,{question:`Что делает finding воспроизводимым?`,options:[`Severity без примера`,`Evidence и verification`,`Количество строк отчёта`],correctIndex:1,explanation:`Другой разработчик должен повторить исходный сценарий и проверить закрытие.`}),(0,T.jsx)(p,{question:`Какой контроль защищает object ownership?`,options:[`Сравнение owner_id или admin role`,`CORS wildcard`,`Redis TTL`],correctIndex:0,explanation:`Ownership проверяется на конкретном resource перед изменением.`}),(0,T.jsx)(p,{question:`Чем доказать исправление N+1?`,options:[`Переименованием функции`,`Query count и повторным измерением`,`Увеличением timeout`],correctIndex:1,explanation:`Нужно показать уменьшение количества запросов при том же результате.`}),(0,T.jsx)(p,{question:`Что честно указать после учебного аудита?`,options:[`Formal certification passed`,`Проверенный scope и известные ограничения`,`Абсолютную безопасность`],correctIndex:1,explanation:`Аудит ограничен конкретными сценариями и не даёт абсолютной гарантии.`})]}),(0,T.jsx)(r,{points:[(0,T.jsx)(T.Fragment,{children:`Аудит начинается с assets, угроз и evidence, а не с случайного списка модных проверок.`}),(0,T.jsx)(T.Fragment,{children:`Severity связывает вероятность и влияние и помогает выпускать fixes в правильном порядке.`}),(0,T.jsx)(T.Fragment,{children:`Security и performance требуют наблюдаемого before/after, а не заявления «стало лучше».`}),(0,T.jsx)(T.Fragment,{children:`Ownership, parameterized SQL, secret handling и безопасные logs входят в обязательную границу.`}),(0,T.jsx)(T.Fragment,{children:`N+1, indexes, transactions и cache invalidation проверяются измерением на одном сценарии.`}),(0,T.jsx)(T.Fragment,{children:`Итог аудита честно описывает scope, закрытые findings и принятые ограничения.`})]}),(0,T.jsx)(g,{text:`Создайте audit-register минимум из 20 пунктов, воспроизведите три реальных findings StudyHub, исправьте critical/high отдельными commits и приложите тест, query count, EXPLAIN, log или другой before/after evidence.`})]})]})}export{D as Lesson208};