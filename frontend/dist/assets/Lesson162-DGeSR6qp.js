import{t as e}from"./jsx-runtime-lw2jiZar.js";import{A as t,C as n,D as r,E as i,I as a,L as o,M as s,N as c,O as l,P as u,S as d,T as f,b as p,f as m,g as h,h as g,j as _,p as v,v as y,w as b,x,y as S}from"./shared-DoR5oW6-.js";import{t as C}from"./git-fork-WIYO3FwZ.js";import{O as w}from"./index-ChLJS9_n.js";import{t as T}from"./CodeEditor-BZlrvoTL.js";var E=e(),D=`Блок 28 · Async SQLAlchemy, нагрузка и наблюдаемость`;function O({module:e}){return(0,E.jsxs)(c,{children:[(0,E.jsx)(s,{variant:`project`,chip:e??D,title:`Асинхронные транзакции и rollback`,intro:`Перенесём знакомую транзакционную модель на AsyncSession: несколько связанных изменений либо фиксируются вместе, либо полностью отменяются. Разберём границу commit, flush, IntegrityError и состояние session после сбоя.`,tags:[{icon:(0,E.jsx)(w,{size:14}),label:`атомарная операция`},{icon:(0,E.jsx)(C,{size:14}),label:`rollback после ошибки`}]}),(0,E.jsxs)(i,{tone:`info`,children:[(0,E.jsx)(`strong`,{children:`Связь с этапом.`}),` На синхронном этапе StudyHub уже использовал транзакции. Асинхронный API не меняет смысл атомарности: await появляется у операций ввода-вывода, а бизнес-операция по-прежнему имеет одну границу успеха. `,(0,E.jsx)(`strong`,{children:`Важно не перепутать:`}),` async with session.begin() не делает любое содержимое безопасным автоматически. Внутри транзакции не следует выполнять долгий внешний HTTP-запрос или другую работу, которая зря удерживает соединение.`]}),(0,E.jsxs)(u,{number:`01`,title:`Зачем эта тема появляется сейчас`,children:[(0,E.jsx)(l,{children:`Перенесём знакомую транзакционную модель на AsyncSession: несколько связанных изменений либо фиксируются вместе, либо полностью отменяются. Разберём границу commit, flush, IntegrityError и состояние session после сбоя.`}),(0,E.jsxs)(`div`,{className:`lesson-route`,children:[(0,E.jsxs)(`ol`,{children:[(0,E.jsxs)(`li`,{children:[(0,E.jsx)(`strong`,{children:`Назвать единицу работы: `}),`задача и запись аудита должны появиться как один результат.`]}),(0,E.jsxs)(`li`,{children:[(0,E.jsx)(`strong`,{children:`Открыть транзакцию: `}),`использовать async with session.begin() вокруг связанных изменений.`]}),(0,E.jsxs)(`li`,{children:[(0,E.jsx)(`strong`,{children:`Получить промежуточный id: `}),`вызвать await session.flush() без преждевременного commit.`]}),(0,E.jsxs)(`li`,{children:[(0,E.jsx)(`strong`,{children:`Смоделировать сбой: `}),`нарушить ограничение и проверить отсутствие обеих записей.`]})]}),(0,E.jsx)(`p`,{children:`Итог занятия — проверяемое изменение Async StudyHub, а не отдельный фрагмент синтаксиса.`})]}),(0,E.jsxs)(o,{children:[(0,E.jsx)(a,{badge:`BEGIN`,title:`Начало общей операции`,children:`Все изменения до выхода из блока принадлежат одной транзакции.`}),(0,E.jsx)(a,{badge:`FLUSH`,badgeTone:`float`,title:`SQL до commit`,children:`flush отправляет накопленные изменения базе и позволяет получить id, но не завершает транзакцию.`}),(0,E.jsx)(a,{badge:`ROLLBACK`,badgeTone:`str`,title:`Отмена всей единицы`,children:`После ошибки база возвращается к состоянию до начала транзакции.`})]}),(0,E.jsxs)(`div`,{className:`lesson-practice-steps`,children:[(0,E.jsx)(`h3`,{children:`До изменения`}),(0,E.jsx)(`p`,{children:`Зафиксируйте работающий сценарий и сохраните синхронную реализацию как контрольную точку.`}),(0,E.jsx)(`h3`,{children:`Во время изменения`}),(0,E.jsx)(`p`,{children:`Меняйте один инфраструктурный слой и наблюдайте конкретный эффект в логах, тестах или результате запроса.`}),(0,E.jsx)(`h3`,{children:`После изменения`}),(0,E.jsx)(`p`,{children:`Повторите успешный и ошибочный сценарии, затем объясните, что именно стало асинхронным.`})]}),(0,E.jsx)(x,{question:`Какую наблюдаемую проблему решает занятие 162?`,hint:`Назовите исходный риск, одно изменение и способ проверки.`,answer:(0,E.jsx)(`p`,{children:`задача и запись аудита должны появиться как один результат; затем результат подтверждается воспроизводимой проверкой.`})})]}),(0,E.jsxs)(u,{number:`02`,title:`Главная модель и роли объектов`,children:[(0,E.jsx)(l,{children:`Сначала разложим механизм на роли. Так новый async API читается как продолжение знакомого SQLAlchemy, а не как набор магических await.`}),(0,E.jsx)(t,{rows:[[(0,E.jsx)(E.Fragment,{children:`session.add(object)`}),`помещает ORM-объект в unit of work; await не нужен`],[(0,E.jsx)(E.Fragment,{children:`await session.flush()`}),`выполняет текущие INSERT/UPDATE внутри открытой транзакции`],[(0,E.jsx)(E.Fragment,{children:`async with session.begin()`}),`задаёт общую границу commit или rollback`],[(0,E.jsx)(E.Fragment,{children:`await session.rollback()`}),`явно восстанавливает session после ошибки вне managed-блока`],[(0,E.jsx)(E.Fragment,{children:`IntegrityError`}),`сообщает о нарушении UNIQUE, FK, CHECK или другого ограничения`]]}),(0,E.jsx)(v,{prompt:`Соедините инструмент и его ответственность в этом занятии.`,leftTitle:`Инструмент`,rightTitle:`Ответственность`,pairs:[{left:`session.add(object)`,right:`помещает ORM-объект в unit of work; await не нужен`},{left:`await session.flush()`,right:`выполняет текущие INSERT/UPDATE внутри открытой транзакции`},{left:`async with session.begin()`,right:`задаёт общую границу commit или rollback`},{left:`await session.rollback()`,right:`явно восстанавливает session после ошибки вне managed-блока`},{left:`IntegrityError`,right:`сообщает о нарушении UNIQUE, FK, CHECK или другого ограничения`}],explanation:`Пара считается понятой, когда вы можете назвать момент использования и границу ответственности.`}),(0,E.jsxs)(`div`,{className:`lesson-practice-steps`,children:[(0,E.jsx)(`h3`,{children:`Читайте слева направо`}),(0,E.jsx)(`p`,{children:`Сначала создаётся statement или объект конфигурации, затем I/O запускается в явной точке await.`}),(0,E.jsx)(`h3`,{children:`Отделяйте локальную работу`}),(0,E.jsx)(`p`,{children:`Создание ORM-объекта и построение statement не требуют connection, пока не началась операция с базой.`}),(0,E.jsx)(`h3`,{children:`Следите за жизненным циклом`}),(0,E.jsx)(`p`,{children:`Session и connection имеют ограниченный срок жизни и не должны превращаться в глобальное состояние.`}),(0,E.jsx)(`h3`,{children:`Фиксируйте границу ошибки`}),(0,E.jsx)(`p`,{children:`Ожидаемый database-сбой переводится в понятный контракт, но неожиданный дефект не скрывается.`})]}),(0,E.jsx)(d,{statement:(0,E.jsx)(E.Fragment,{children:`Добавление async def само по себе гарантирует ускорение database endpoint.`}),isTrue:!1,explanation:`Производительность зависит от характера I/O, SQL, pool, транзакций и нагрузки; её подтверждают измерением.`})]}),(0,E.jsxs)(u,{number:`03`,title:`Одна задача и одно событие аудита`,children:[(0,E.jsx)(l,{children:`Разберём минимальный рабочий пример построчно. До запуска предскажите, где появляется реальное обращение к PostgreSQL и какой объект остаётся локальным.`}),(0,E.jsx)(T,{caption:`минимальный рабочий пример`,code:`from sqlalchemy.ext.asyncio import AsyncSession

from app.models import AuditEventModel, TaskModel
from app.schemas import TaskCreate


async def create_task_with_audit(
    session: AsyncSession,
    payload: TaskCreate,
    owner_id: int,
) -> TaskModel:
    async with session.begin():
        task = TaskModel(
            title=payload.title,
            owner_id=owner_id,
            is_done=False,
        )
        session.add(task)
        await session.flush()

        event = AuditEventModel(
            action="task.created",
            task_id=task.id,
            actor_id=owner_id,
        )
        session.add(event)

    return task`}),(0,E.jsx)(y,{code:`from sqlalchemy.ext.asyncio import AsyncSession

from app.models import AuditEventModel, TaskModel
from app.schemas import TaskCreate


async def create_task_with_audit(
    session: AsyncSession,
    payload: TaskCreate,
    owner_id: int,
) -> TaskModel:
    async with session.begin():
        task = TaskModel(
            title=payload.title,
            owner_id=owner_id,
            is_done=False,
        )
        session.add(task)
        await session.flush()

        event = AuditEventModel(
            action="task.created",
            task_id=task.id,
            actor_id=owner_id,
        )
        session.add(event)

    return task`,steps:[{line:0,note:`Endpoint передаёт одну request-scoped AsyncSession.`,vars:{session:`open`}},{line:7,note:`Контекст begin открывает общую транзакцию.`,vars:{transaction:`active`}},{line:13,note:`Task добавлена в unit of work, но commit ещё не выполнен.`,vars:{"task.id":`None`}},{line:14,note:`flush выполняет INSERT и получает id внутри той же транзакции.`,vars:{"task.id":`42`}},{line:22,note:`Успешный выход фиксирует Task и AuditEvent вместе.`,vars:{transaction:`committed`}}]}),(0,E.jsx)(h,{prompt:`Заполните ключевой фрагмент рабочего контракта.`,before:`async with session.`,after:`():
    session.add(task)`,options:[`begin`,`commit`,`execute`],answer:`begin`,explanation:`Этот вариант сохраняет явную границу async database I/O.`}),(0,E.jsxs)(`div`,{className:`lesson-practice-steps`,children:[(0,E.jsx)(`h3`,{children:`Предсказать`}),(0,E.jsx)(`p`,{children:`Отметьте строку первого I/O до запуска примера.`}),(0,E.jsx)(`h3`,{children:`Запустить`}),(0,E.jsx)(`p`,{children:`Выполните пример в отдельном script или тесте с тестовой PostgreSQL-базой.`}),(0,E.jsx)(`h3`,{children:`Изменить`}),(0,E.jsx)(`p`,{children:`Поменяйте один параметр и заранее запишите ожидаемый эффект.`}),(0,E.jsx)(`h3`,{children:`Объяснить`}),(0,E.jsx)(`p`,{children:`Назовите объект, который создаётся локально, и операцию, которая требует await.`})]})]}),(0,E.jsxs)(u,{number:`04`,title:`Сравнение двух реализаций`,children:[(0,E.jsx)(l,{children:`Async-код остаётся качественным только при ясных границах. Сравните варианты по атомарности, времени удержания ресурса и возможности воспроизвести ошибку.`}),(0,E.jsx)(f,{question:`Какой вариант точнее сохраняет контракт и жизненный цикл ресурса?`,left:{title:`Скрытая или разорванная граница`,code:`session.add(task)
await session.commit()

session.add(audit_event)
await session.commit()`,note:`После первого commit задача уже сохранена; ошибка второй записи оставит неполный результат`},right:{title:`Явный async-контракт`,code:`async with session.begin():
    task = TaskModel(title=title, owner_id=owner_id)
    session.add(task)
    await session.flush()

    session.add(
        AuditEventModel(
            action="task.created",
            task_id=task.id,
        )
    )`,note:`I/O, cleanup и результат расположены в предсказуемых границах.`},preferred:`right`,explanation:`Лучший вариант не просто содержит await, а делает ответственность и время жизни connection/session наблюдаемыми.`}),(0,E.jsxs)(`div`,{className:`lesson-practice-steps`,children:[(0,E.jsx)(`h3`,{children:`Контракт`}),(0,E.jsx)(`p`,{children:`Проверьте, что успешный путь возвращает то же прикладное значение, что и прежняя версия.`}),(0,E.jsx)(`h3`,{children:`Cleanup`}),(0,E.jsx)(`p`,{children:`Проверьте освобождение session или connection при success, exception и cancellation.`}),(0,E.jsx)(`h3`,{children:`Измеримость`}),(0,E.jsx)(`p`,{children:`Добавьте лог, тест или счётчик, который подтверждает реальное отличие вариантов.`}),(0,E.jsx)(`h3`,{children:`Минимальный diff`}),(0,E.jsx)(`p`,{children:`Не переписывайте одновременно schemas, routes, service и database config без необходимости.`})]}),(0,E.jsx)(i,{children:`async with session.begin() не делает любое содержимое безопасным автоматически. Внутри транзакции не следует выполнять долгий внешний HTTP-запрос или другую работу, которая зря удерживает соединение.`})]}),(0,E.jsxs)(u,{number:`05`,title:`Ожидаемая ошибка и диагностический порядок`,children:[(0,E.jsx)(l,{children:`Ошибка ценна как проверка модели. Сначала определите нарушенное ожидание, затем найдите границу I/O, восстановите ресурс и только после этого формируйте ответ клиенту.`}),(0,E.jsx)(n,{code:`session.add(task)
await session.commit()

session.add(audit_event)
await session.commit()`,question:`Какой дефект здесь наиболее опасен?`,options:[`После первого commit задача уже сохранена; ошибка второй записи оставит неполный результат`,`Асинхронный Python запрещает функции длиннее пяти строк`,`Все SQLAlchemy-методы должны вызываться с await`],correctIndex:0,explanation:`Проблема связана с нарушением жизненного цикла или database-контракта, а не с самим словом async.`,fix:`try:
    async with session.begin():
        session.add(task)
        await session.flush()
        session.add(audit_event)
except IntegrityError:
    # managed transaction уже выполнит rollback
    raise DuplicateTaskError`}),(0,E.jsx)(x,{question:`Каков порядок диагностики этого сбоя?`,hint:`Симптом → точка await → состояние session/transaction → данные после ошибки.`,answer:(0,E.jsx)(`p`,{children:`Сначала воспроизведите сбой тестом, найдите конкретную операцию I/O, проверьте состояние ресурса и подтвердите итоговое состояние PostgreSQL отдельным запросом.`})}),(0,E.jsxs)(`div`,{className:`lesson-practice-steps`,children:[(0,E.jsx)(`h3`,{children:`Симптом`}),(0,E.jsx)(`p`,{children:`Запишите исключение, status code, request_id и последнюю успешную операцию.`}),(0,E.jsx)(`h3`,{children:`Причина`}),(0,E.jsx)(`p`,{children:`Не начинайте с широкого except; найдите конкретное нарушенное ожидание.`}),(0,E.jsx)(`h3`,{children:`Восстановление`}),(0,E.jsx)(`p`,{children:`Убедитесь, что session не используется в failed-state и connection возвращается в pool.`}),(0,E.jsx)(`h3`,{children:`Регрессия`}),(0,E.jsx)(`p`,{children:`Добавьте тест, который падает до исправления и проходит после него.`})]})]}),(0,E.jsxs)(u,{number:`06`,title:`Встраиваем механизм в Async StudyHub`,children:[(0,E.jsx)(l,{children:`Теперь переносим механизм в сквозной проект. Endpoint остаётся тонкой границей, service выражает сценарий, а database layer отвечает за statement и жизненный цикл session.`}),(0,E.jsx)(T,{caption:`проектное применение`,code:`async def transfer_task(
    session: AsyncSession,
    task_id: int,
    new_owner_id: int,
) -> TaskModel:
    async with session.begin():
        task = await session.get(TaskModel, task_id)
        if task is None:
            raise TaskNotFoundError(task_id)

        old_owner_id = task.owner_id
        task.owner_id = new_owner_id

        session.add(
            AuditEventModel(
                action="task.transferred",
                task_id=task.id,
                actor_id=new_owner_id,
                details={
                    "from": old_owner_id,
                    "to": new_owner_id,
                },
            )
        )

    return task`}),(0,E.jsx)(g,{code:`async def transfer_task(
    session: AsyncSession,
    task_id: int,
    new_owner_id: int,
) -> TaskModel:
    async with session.begin():
        task = await session.get(TaskModel, task_id)
        if task is None:
            raise TaskNotFoundError(task_id)

        old_owner_id = task.owner_id
        task.owner_id = new_owner_id

        session.add(
            AuditEventModel(
                action="task.transferred",
                task_id=task.id,
                actor_id=new_owner_id,
                details={
                    "from": old_owner_id,
                    "to": new_owner_id,
                },
            )
        )

    return task`,scenarios:[{label:`обе записи корректны`,activeLine:2,output:`commit: task и audit_event сохранены`},{label:`audit нарушает constraint`,activeLine:10,output:`rollback: task тоже не появляется`},{label:`task не найдена`,activeLine:6,output:`исключение до изменения данных`}]}),(0,E.jsx)(S,{title:`проверка проектного изменения`,lines:[{cmd:`pytest -q tests/test_task_transactions.py`},{out:`3 passed`},{cmd:`pytest -q tests/test_task_transactions.py::test_rolls_back_both_rows -vv`},{out:`PASSED: tasks=0, audit_events=0`}]}),(0,E.jsxs)(`div`,{className:`lesson-practice-steps`,children:[(0,E.jsx)(`h3`,{children:`Router`}),(0,E.jsx)(`p`,{children:`Получает dependency и переводит предметные ошибки в стабильные HTTP-ответы.`}),(0,E.jsx)(`h3`,{children:`Service`}),(0,E.jsx)(`p`,{children:`Координирует один пользовательский сценарий без знания о FastAPI Response.`}),(0,E.jsx)(`h3`,{children:`Repository или statement`}),(0,E.jsx)(`p`,{children:`Выполняет предсказуемые запросы через переданную AsyncSession.`}),(0,E.jsx)(`h3`,{children:`Test`}),(0,E.jsx)(`p`,{children:`Подменяет окружение, запускает success/error path и проверяет состояние базы.`})]}),(0,E.jsx)(i,{tone:`info`,children:`Не удаляйте рабочую sync-ветку до прохождения согласованной регрессии. Миграция выполняется вертикальными slices.`})]}),(0,E.jsxs)(u,{number:`07`,title:`Управляемая практика и самостоятельное изменение`,children:[(0,E.jsx)(l,{children:`Соберите изменение в безопасном порядке. Один шаг должен давать один проверяемый результат и отдельный Git-коммит или понятный diff.`}),(0,E.jsx)(b,{title:`Соберите маршрут проектной работы`,prompt:`Расположите действия от исходной проверки до подтверждённого результата.`,pieces:[{id:`start`,code:`открыть session.begin()`,note:`одна граница операции`},{id:`task`,code:`добавить Task и выполнить flush`,note:`получить task.id`},{id:`audit`,code:`добавить AuditEvent`,note:`вторая связанная запись`},{id:`break`,code:`нарушить ограничение в тесте`,note:`контролируемый сбой`},{id:`verify`,code:`проверить отсутствие обеих строк`,note:`доказать rollback`}],correctOrder:[`start`,`task`,`audit`,`break`,`verify`],explanation:`Порядок сохраняет рабочую контрольную точку и делает причину ошибки локальной.`}),(0,E.jsx)(m,{cards:[{front:(0,E.jsx)(`strong`,{children:`Что предсказать до запуска?`}),back:(0,E.jsx)(`span`,{children:`Точку первого I/O, число запросов или итоговое состояние transaction.`})},{front:(0,E.jsx)(`strong`,{children:`Что изменить самостоятельно?`}),back:(0,E.jsx)(`span`,{children:`Один параметр конфигурации, один statement или одну границу ресурса.`})},{front:(0,E.jsx)(`strong`,{children:`Что проверить после ошибки?`}),back:(0,E.jsx)(`span`,{children:`Состояние базы, session, pool и стабильный API-контракт.`})},{front:(0,E.jsx)(`strong`,{children:`Что записать в Git?`}),back:(0,E.jsx)(`span`,{children:`Небольшой diff, тест и объяснение измеримого результата.`})}]}),(0,E.jsxs)(`div`,{className:`lesson-practice-steps`,children:[(0,E.jsx)(`h3`,{children:`Минимум`}),(0,E.jsx)(`p`,{children:`Повторите основной пример и добейтесь ожидаемого результата.`}),(0,E.jsx)(`h3`,{children:`Изменение`}),(0,E.jsx)(`p`,{children:`Поменяйте один параметр, заранее запишите прогноз и сравните его с фактом.`}),(0,E.jsx)(`h3`,{children:`Ошибка`}),(0,E.jsx)(`p`,{children:`Создайте контролируемый сбой и подтвердите cleanup или rollback.`}),(0,E.jsx)(`h3`,{children:`Объяснение`}),(0,E.jsx)(`p`,{children:`Нарисуйте путь request → dependency → service → AsyncSession → PostgreSQL → response.`}),(0,E.jsx)(`h3`,{children:`Коммит`}),(0,E.jsx)(`p`,{children:`Зафиксируйте только завершённый проверяемый шаг без случайных файлов и секретов.`})]})]}),(0,E.jsxs)(u,{number:`08`,title:`Контрольная точка и критерии готовности`,children:[(0,E.jsx)(l,{children:`Занятие завершено, когда ученик может воспроизвести результат, объяснить механизм и показать отрицательный сценарий без подсказки.`}),(0,E.jsxs)(`div`,{className:`lesson-check-group`,children:[(0,E.jsx)(p,{question:`Зачем нужен flush внутри транзакции?`,options:[`Получить результат SQL, например новый id, не завершая общую транзакцию`,`Закрыть session`,`Создать новый connection pool`],correctIndex:0,explanation:`flush синхронизирует текущий unit of work с базой, но commit остаётся общей финальной границей.`}),(0,E.jsx)(p,{question:`Что должно произойти, если AuditEvent нарушил constraint?`,options:[`Task и AuditEvent должны отсутствовать`,`Task должна остаться`,`Нужно открыть вторую session и продолжить`],correctIndex:0,explanation:`Атомарная бизнес-операция либо сохраняется полностью, либо полностью откатывается.`}),(0,E.jsx)(p,{question:`Почему внешний HTTP-запрос не стоит держать внутри session.begin()?`,options:[`Он может долго удерживать транзакцию и соединение`,`HTTP нельзя вызывать из Python`,`begin запрещает await`],correctIndex:0,explanation:`В транзакции оставляют только работу, необходимую для согласованного изменения базы.`}),(0,E.jsx)(p,{question:`Как проверить rollback надёжнее всего?`,options:[`После ожидаемой ошибки запросить обе таблицы и проверить исходное состояние`,`Проверить только текст исключения`,`Посчитать строки Python-файла`],correctIndex:0,explanation:`Проверка состояния базы доказывает, что частичный результат не сохранился.`})]}),(0,E.jsx)(r,{points:[(0,E.jsx)(E.Fragment,{children:`Асинхронность не меняет смысл транзакции и атомарности.`}),(0,E.jsx)(E.Fragment,{children:`session.begin() задаёт одну границу commit или rollback.`}),(0,E.jsx)(E.Fragment,{children:`session.add() не требует await, потому что пока меняет локальный unit of work.`}),(0,E.jsx)(E.Fragment,{children:`flush выполняет SQL внутри транзакции и позволяет получить сгенерированные значения.`}),(0,E.jsx)(E.Fragment,{children:`После ошибки состояние базы проверяется отдельным запросом.`}),(0,E.jsx)(E.Fragment,{children:`Долгую внешнюю работу нельзя без причины удерживать внутри транзакции.`}),(0,E.jsx)(E.Fragment,{children:`Ошибка ограничения переводится в предметный контракт API, а не выдаётся клиенту как traceback.`})]}),(0,E.jsxs)(`div`,{className:`lesson-practice-steps`,children:[(0,E.jsx)(`h3`,{children:`Понять`}),(0,E.jsx)(`p`,{children:`Объяснить модель своими словами без чтения определения.`}),(0,E.jsx)(`h3`,{children:`Увидеть`}),(0,E.jsx)(`p`,{children:`Показать, где создаётся объект и где начинается реальный I/O.`}),(0,E.jsx)(`h3`,{children:`Предсказать`}),(0,E.jsx)(`p`,{children:`Назвать результат изменения до запуска.`}),(0,E.jsx)(`h3`,{children:`Запустить`}),(0,E.jsx)(`p`,{children:`Воспроизвести success path одной командой.`}),(0,E.jsx)(`h3`,{children:`Найти ошибку`}),(0,E.jsx)(`p`,{children:`Получить ожидаемый сбой и локализовать причину.`}),(0,E.jsx)(`h3`,{children:`Проверить`}),(0,E.jsx)(`p`,{children:`Подтвердить состояние данных, cleanup и регрессию тестом.`}),(0,E.jsx)(`h3`,{children:`Зафиксировать`}),(0,E.jsx)(`p`,{children:`Обновить README или техническую заметку и сделать осмысленный коммит.`})]}),(0,E.jsx)(_,{text:`Перенесите одну двухшаговую операцию Async StudyHub в session.begin(). Добавьте failure-test, который намеренно ломает второй шаг и доказывает, что первая запись также отсутствует.`})]})]})}export{O as Lesson162};