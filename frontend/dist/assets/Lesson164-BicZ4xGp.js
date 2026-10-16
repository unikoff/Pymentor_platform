import{t as e}from"./jsx-runtime-lw2jiZar.js";import{A as t,C as n,D as r,E as i,I as a,L as o,M as s,N as c,O as l,P as u,S as d,T as f,b as p,f as m,g as h,h as g,j as _,p as v,v as y,w as b,x,y as S}from"./shared-UmZHo_CQ.js";import{t as C}from"./chart-column-Dqmgii50.js";import{t as w}from"./trophy-K5q5OZIy.js";import{t as T}from"./CodeEditor-BZlrvoTL.js";var E=e(),D=`Блок 28 · Async SQLAlchemy, нагрузка и наблюдаемость`;function O({module:e}){return(0,E.jsxs)(c,{children:[(0,E.jsx)(s,{variant:`project`,chip:e??D,title:`Нагрузочная проверка и финальный Async StudyHub`,intro:`Завершим миграцию не обещанием «async быстрее», а воспроизводимым измерением. Зафиксируем baseline, сравним одинаковые сценарии, добавим request id и structured logs, проверим p50/p95 и подготовим Async StudyHub к технической защите.`,tags:[{icon:(0,E.jsx)(C,{size:14}),label:`latency и throughput`},{icon:(0,E.jsx)(w,{size:14}),label:`финальная защита проекта`}]}),(0,E.jsxs)(i,{tone:`info`,children:[(0,E.jsx)(`strong`,{children:`Связь с этапом.`}),` Engine, request-scoped AsyncSession, CRUD, транзакции и связи уже перенесены. Финальный шаг — доказать, что HTTP-контракт сохранился, ошибки наблюдаемы, а вывод о производительности опирается на повторяемые данные. `,(0,E.jsx)(`strong`,{children:`Важно не перепутать:`}),` Один локальный benchmark не доказывает production-производительность. Результат описывает только конкретный сценарий, окружение, dataset и уровень concurrency.`]}),(0,E.jsxs)(u,{number:`01`,title:`Зачем эта тема появляется сейчас`,children:[(0,E.jsx)(l,{children:`Завершим миграцию не обещанием «async быстрее», а воспроизводимым измерением. Зафиксируем baseline, сравним одинаковые сценарии, добавим request id и structured logs, проверим p50/p95 и подготовим Async StudyHub к технической защите.`}),(0,E.jsxs)(`div`,{className:`lesson-route`,children:[(0,E.jsxs)(`ol`,{children:[(0,E.jsxs)(`li`,{children:[(0,E.jsx)(`strong`,{children:`Зафиксировать baseline: `}),`записать версию кода, данные, команду и параметры запуска.`]}),(0,E.jsxs)(`li`,{children:[(0,E.jsx)(`strong`,{children:`Сравнить одинаковое: `}),`не менять одновременно driver, SQL, dataset и hardware.`]}),(0,E.jsxs)(`li`,{children:[(0,E.jsx)(`strong`,{children:`Смотреть распределение: `}),`использовать p50 и p95, а не только среднее.`]}),(0,E.jsxs)(`li`,{children:[(0,E.jsx)(`strong`,{children:`Связать с логами: `}),`проследить медленный request по request_id и SQL-событиям.`]}),(0,E.jsxs)(`li`,{children:[(0,E.jsx)(`strong`,{children:`Закрыть регрессию: `}),`запустить полный набор API и database tests.`]})]}),(0,E.jsx)(`p`,{children:`Итог занятия — проверяемое изменение Async StudyHub, а не отдельный фрагмент синтаксиса.`})]}),(0,E.jsxs)(o,{children:[(0,E.jsx)(a,{badge:`LATENCY`,title:`Время одного запроса`,children:`p50 показывает типичный request, p95 — медленный хвост распределения.`}),(0,E.jsx)(a,{badge:`THROUGHPUT`,badgeTone:`float`,title:`Завершённые requests за время`,children:`Показатель всегда читается вместе с concurrency и error rate.`}),(0,E.jsx)(a,{badge:`TRACE`,badgeTone:`str`,title:`Путь конкретной операции`,children:`request_id связывает вход HTTP, service, database и итоговый response.`})]}),(0,E.jsxs)(`div`,{className:`lesson-practice-steps`,children:[(0,E.jsx)(`h3`,{children:`До изменения`}),(0,E.jsx)(`p`,{children:`Зафиксируйте работающий сценарий и сохраните синхронную реализацию как контрольную точку.`}),(0,E.jsx)(`h3`,{children:`Во время изменения`}),(0,E.jsx)(`p`,{children:`Меняйте один инфраструктурный слой и наблюдайте конкретный эффект в логах, тестах или результате запроса.`}),(0,E.jsx)(`h3`,{children:`После изменения`}),(0,E.jsx)(`p`,{children:`Повторите успешный и ошибочный сценарии, затем объясните, что именно стало асинхронным.`})]}),(0,E.jsx)(x,{question:`Какую наблюдаемую проблему решает занятие 164?`,hint:`Назовите исходный риск, одно изменение и способ проверки.`,answer:(0,E.jsx)(`p`,{children:`записать версию кода, данные, команду и параметры запуска; затем результат подтверждается воспроизводимой проверкой.`})})]}),(0,E.jsxs)(u,{number:`02`,title:`Главная модель и роли объектов`,children:[(0,E.jsx)(l,{children:`Сначала разложим механизм на роли. Так новый async API читается как продолжение знакомого SQLAlchemy, а не как набор магических await.`}),(0,E.jsx)(t,{rows:[[(0,E.jsx)(E.Fragment,{children:`concurrency`}),`сколько requests выполняется одновременно`],[(0,E.jsx)(E.Fragment,{children:`p50`}),`медианная latency: половина запросов быстрее этого значения`],[(0,E.jsx)(E.Fragment,{children:`p95`}),`граница, быстрее которой завершились 95% requests`],[(0,E.jsx)(E.Fragment,{children:`throughput`}),`число успешных requests в секунду`],[(0,E.jsx)(E.Fragment,{children:`error rate`}),`доля ошибок, timeout и отклонённых запросов`],[(0,E.jsx)(E.Fragment,{children:`baseline`}),`контрольный запуск до целевого изменения`]]}),(0,E.jsx)(v,{prompt:`Соедините инструмент и его ответственность в этом занятии.`,leftTitle:`Инструмент`,rightTitle:`Ответственность`,pairs:[{left:`concurrency`,right:`сколько requests выполняется одновременно`},{left:`p50`,right:`медианная latency: половина запросов быстрее этого значения`},{left:`p95`,right:`граница, быстрее которой завершились 95% requests`},{left:`throughput`,right:`число успешных requests в секунду`},{left:`error rate`,right:`доля ошибок, timeout и отклонённых запросов`}],explanation:`Пара считается понятой, когда вы можете назвать момент использования и границу ответственности.`}),(0,E.jsxs)(`div`,{className:`lesson-practice-steps`,children:[(0,E.jsx)(`h3`,{children:`Читайте слева направо`}),(0,E.jsx)(`p`,{children:`Сначала создаётся statement или объект конфигурации, затем I/O запускается в явной точке await.`}),(0,E.jsx)(`h3`,{children:`Отделяйте локальную работу`}),(0,E.jsx)(`p`,{children:`Создание ORM-объекта и построение statement не требуют connection, пока не началась операция с базой.`}),(0,E.jsx)(`h3`,{children:`Следите за жизненным циклом`}),(0,E.jsx)(`p`,{children:`Session и connection имеют ограниченный срок жизни и не должны превращаться в глобальное состояние.`}),(0,E.jsx)(`h3`,{children:`Фиксируйте границу ошибки`}),(0,E.jsx)(`p`,{children:`Ожидаемый database-сбой переводится в понятный контракт, но неожиданный дефект не скрывается.`})]}),(0,E.jsx)(d,{statement:(0,E.jsx)(E.Fragment,{children:`Добавление async def само по себе гарантирует ускорение database endpoint.`}),isTrue:!1,explanation:`Производительность зависит от характера I/O, SQL, pool, транзакций и нагрузки; её подтверждают измерением.`})]}),(0,E.jsxs)(u,{number:`03`,title:`Минимальный воспроизводимый load-сценарий`,children:[(0,E.jsx)(l,{children:`Разберём минимальный рабочий пример построчно. До запуска предскажите, где появляется реальное обращение к PostgreSQL и какой объект остаётся локальным.`}),(0,E.jsx)(T,{caption:`минимальный рабочий пример`,code:`import asyncio
from statistics import median

import httpx


async def worker(
    client: httpx.AsyncClient,
    samples: list[float],
) -> None:
    for _ in range(20):
        started = asyncio.get_running_loop().time()
        response = await client.get("/tasks?limit=20")
        response.raise_for_status()
        samples.append(
            asyncio.get_running_loop().time() - started
        )


async def main() -> None:
    samples: list[float] = []

    async with httpx.AsyncClient(
        base_url="http://127.0.0.1:8000",
        timeout=5.0,
    ) as client:
        await asyncio.gather(
            *(worker(client, samples) for _ in range(10))
        )

    ordered = sorted(samples)
    p50 = median(ordered)
    p95 = ordered[int(len(ordered) * 0.95) - 1]

    print(f"requests={len(ordered)}")
    print(f"p50={p50:.3f}s")
    print(f"p95={p95:.3f}s")


if __name__ == "__main__":
    asyncio.run(main())`}),(0,E.jsx)(y,{code:`import asyncio
from statistics import median

import httpx


async def worker(
    client: httpx.AsyncClient,
    samples: list[float],
) -> None:
    for _ in range(20):
        started = asyncio.get_running_loop().time()
        response = await client.get("/tasks?limit=20")
        response.raise_for_status()
        samples.append(
            asyncio.get_running_loop().time() - started
        )


async def main() -> None:
    samples: list[float] = []

    async with httpx.AsyncClient(
        base_url="http://127.0.0.1:8000",
        timeout=5.0,
    ) as client:
        await asyncio.gather(
            *(worker(client, samples) for _ in range(10))
        )

    ordered = sorted(samples)
    p50 = median(ordered)
    p95 = ordered[int(len(ordered) * 0.95) - 1]

    print(f"requests={len(ordered)}")
    print(f"p50={p50:.3f}s")
    print(f"p95={p95:.3f}s")


if __name__ == "__main__":
    asyncio.run(main())`,steps:[{line:0,note:`Создаётся один сценарий, который можно запустить повторно.`,vars:{endpoint:`/tasks?limit=20`}},{line:14,note:`Каждый worker выполняет 20 последовательных requests.`,vars:{per_worker:`20`}},{line:28,note:`gather запускает 10 worker конкурентно.`,vars:{concurrency:`10`}},{line:33,note:`Latency сортируется для расчёта распределения.`,vars:{samples:`200`}},{line:35,note:`p95 показывает медленный хвост, а не единичный максимум.`,vars:{metric:`p95`}}]}),(0,E.jsx)(h,{prompt:`Заполните ключевой фрагмент рабочего контракта.`,before:`p95 = ordered[int(len(ordered) * `,after:`) - 1]`,options:[`0.95`,`95`,`0.05`],answer:`0.95`,explanation:`Этот вариант сохраняет явную границу async database I/O.`}),(0,E.jsxs)(`div`,{className:`lesson-practice-steps`,children:[(0,E.jsx)(`h3`,{children:`Предсказать`}),(0,E.jsx)(`p`,{children:`Отметьте строку первого I/O до запуска примера.`}),(0,E.jsx)(`h3`,{children:`Запустить`}),(0,E.jsx)(`p`,{children:`Выполните пример в отдельном script или тесте с тестовой PostgreSQL-базой.`}),(0,E.jsx)(`h3`,{children:`Изменить`}),(0,E.jsx)(`p`,{children:`Поменяйте один параметр и заранее запишите ожидаемый эффект.`}),(0,E.jsx)(`h3`,{children:`Объяснить`}),(0,E.jsx)(`p`,{children:`Назовите объект, который создаётся локально, и операцию, которая требует await.`})]})]}),(0,E.jsxs)(u,{number:`04`,title:`Сравнение двух реализаций`,children:[(0,E.jsx)(l,{children:`Async-код остаётся качественным только при ясных границах. Сравните варианты по атомарности, времени удержания ресурса и возможности воспроизвести ошибку.`}),(0,E.jsx)(f,{question:`Какой вариант точнее сохраняет контракт и жизненный цикл ресурса?`,left:{title:`Скрытая или разорванная граница`,code:`sync_run = {
    "endpoint": "/tasks?limit=20",
    "rows": 100,
    "concurrency": 1,
}

async_run = {
    "endpoint": "/tasks?limit=100",
    "rows": 50000,
    "concurrency": 50,
}`,note:`Одновременно изменены endpoint, dataset и concurrency, поэтому разницу нельзя связать с async migration`},right:{title:`Явный async-контракт`,code:`baseline = {
    "endpoint": "/tasks?limit=20",
    "rows": 5000,
    "concurrency": 10,
    "requests": 200,
    "revision": "before-async-db",
}

candidate = {
    **baseline,
    "revision": "async-db",
}`,note:`I/O, cleanup и результат расположены в предсказуемых границах.`},preferred:`right`,explanation:`Лучший вариант не просто содержит await, а делает ответственность и время жизни connection/session наблюдаемыми.`}),(0,E.jsxs)(`div`,{className:`lesson-practice-steps`,children:[(0,E.jsx)(`h3`,{children:`Контракт`}),(0,E.jsx)(`p`,{children:`Проверьте, что успешный путь возвращает то же прикладное значение, что и прежняя версия.`}),(0,E.jsx)(`h3`,{children:`Cleanup`}),(0,E.jsx)(`p`,{children:`Проверьте освобождение session или connection при success, exception и cancellation.`}),(0,E.jsx)(`h3`,{children:`Измеримость`}),(0,E.jsx)(`p`,{children:`Добавьте лог, тест или счётчик, который подтверждает реальное отличие вариантов.`}),(0,E.jsx)(`h3`,{children:`Минимальный diff`}),(0,E.jsx)(`p`,{children:`Не переписывайте одновременно schemas, routes, service и database config без необходимости.`})]}),(0,E.jsx)(i,{children:`Один локальный benchmark не доказывает production-производительность. Результат описывает только конкретный сценарий, окружение, dataset и уровень concurrency.`})]}),(0,E.jsxs)(u,{number:`05`,title:`Ожидаемая ошибка и диагностический порядок`,children:[(0,E.jsx)(l,{children:`Ошибка ценна как проверка модели. Сначала определите нарушенное ожидание, затем найдите границу I/O, восстановите ресурс и только после этого формируйте ответ клиенту.`}),(0,E.jsx)(n,{code:`sync_run = {
    "endpoint": "/tasks?limit=20",
    "rows": 100,
    "concurrency": 1,
}

async_run = {
    "endpoint": "/tasks?limit=100",
    "rows": 50000,
    "concurrency": 50,
}`,question:`Какой дефект здесь наиболее опасен?`,options:[`Одновременно изменены endpoint, dataset и concurrency, поэтому разницу нельзя связать с async migration`,`Асинхронный Python запрещает функции длиннее пяти строк`,`Все SQLAlchemy-методы должны вызываться с await`],correctIndex:0,explanation:`Проблема связана с нарушением жизненного цикла или database-контракта, а не с самим словом async.`,fix:`compare = {
    "same_endpoint": True,
    "same_dataset": True,
    "same_concurrency": True,
    "same_machine": True,
    "warmup_recorded": True,
}`}),(0,E.jsx)(x,{question:`Каков порядок диагностики этого сбоя?`,hint:`Симптом → точка await → состояние session/transaction → данные после ошибки.`,answer:(0,E.jsx)(`p`,{children:`Сначала воспроизведите сбой тестом, найдите конкретную операцию I/O, проверьте состояние ресурса и подтвердите итоговое состояние PostgreSQL отдельным запросом.`})}),(0,E.jsxs)(`div`,{className:`lesson-practice-steps`,children:[(0,E.jsx)(`h3`,{children:`Симптом`}),(0,E.jsx)(`p`,{children:`Запишите исключение, status code, request_id и последнюю успешную операцию.`}),(0,E.jsx)(`h3`,{children:`Причина`}),(0,E.jsx)(`p`,{children:`Не начинайте с широкого except; найдите конкретное нарушенное ожидание.`}),(0,E.jsx)(`h3`,{children:`Восстановление`}),(0,E.jsx)(`p`,{children:`Убедитесь, что session не используется в failed-state и connection возвращается в pool.`}),(0,E.jsx)(`h3`,{children:`Регрессия`}),(0,E.jsx)(`p`,{children:`Добавьте тест, который падает до исправления и проходит после него.`})]})]}),(0,E.jsxs)(u,{number:`06`,title:`Встраиваем механизм в Async StudyHub`,children:[(0,E.jsx)(l,{children:`Теперь переносим механизм в сквозной проект. Endpoint остаётся тонкой границей, service выражает сценарий, а database layer отвечает за statement и жизненный цикл session.`}),(0,E.jsx)(T,{caption:`проектное применение`,code:`import logging
from uuid import uuid4

logger = logging.getLogger("studyhub.request")


async def log_request(
    method: str,
    path: str,
    handler,
):
    request_id = str(uuid4())
    started = asyncio.get_running_loop().time()

    try:
        response = await handler()
        return response
    finally:
        latency_ms = (
            asyncio.get_running_loop().time() - started
        ) * 1000
        logger.info(
            "request_finished",
            extra={
                "request_id": request_id,
                "method": method,
                "path": path,
                "latency_ms": round(latency_ms, 2),
            },
        )`}),(0,E.jsx)(g,{code:`import logging
from uuid import uuid4

logger = logging.getLogger("studyhub.request")


async def log_request(
    method: str,
    path: str,
    handler,
):
    request_id = str(uuid4())
    started = asyncio.get_running_loop().time()

    try:
        response = await handler()
        return response
    finally:
        latency_ms = (
            asyncio.get_running_loop().time() - started
        ) * 1000
        logger.info(
            "request_finished",
            extra={
                "request_id": request_id,
                "method": method,
                "path": path,
                "latency_ms": round(latency_ms, 2),
            },
        )`,scenarios:[{label:`p50 стабилен, p95 вырос`,activeLine:4,output:`исследовать ожидание pool, locks и отдельные медленные запросы`},{label:`throughput вырос, errors тоже`,activeLine:5,output:`результат не принят: проверить saturation и timeout`},{label:`метрики стабильны и тесты зелёные`,activeLine:2,output:`зафиксировать отчёт, ограничения и решение`}]}),(0,E.jsx)(S,{title:`проверка проектного изменения`,lines:[{cmd:`pytest -q`},{out:`148 passed`},{cmd:`python scripts/load_check.py`},{out:`requests=200
p50=0.041s
p95=0.118s`},{cmd:`git status --short`},{out:`M README.md
?? docs/async-migration-report.md`}]}),(0,E.jsxs)(`div`,{className:`lesson-practice-steps`,children:[(0,E.jsx)(`h3`,{children:`Router`}),(0,E.jsx)(`p`,{children:`Получает dependency и переводит предметные ошибки в стабильные HTTP-ответы.`}),(0,E.jsx)(`h3`,{children:`Service`}),(0,E.jsx)(`p`,{children:`Координирует один пользовательский сценарий без знания о FastAPI Response.`}),(0,E.jsx)(`h3`,{children:`Repository или statement`}),(0,E.jsx)(`p`,{children:`Выполняет предсказуемые запросы через переданную AsyncSession.`}),(0,E.jsx)(`h3`,{children:`Test`}),(0,E.jsx)(`p`,{children:`Подменяет окружение, запускает success/error path и проверяет состояние базы.`})]}),(0,E.jsx)(i,{tone:`info`,children:`Не удаляйте рабочую sync-ветку до прохождения согласованной регрессии. Миграция выполняется вертикальными slices.`})]}),(0,E.jsxs)(u,{number:`07`,title:`Управляемая практика и самостоятельное изменение`,children:[(0,E.jsx)(l,{children:`Соберите изменение в безопасном порядке. Один шаг должен давать один проверяемый результат и отдельный Git-коммит или понятный diff.`}),(0,E.jsx)(b,{title:`Соберите маршрут проектной работы`,prompt:`Расположите действия от исходной проверки до подтверждённого результата.`,pieces:[{id:`tests`,code:`запустить регрессионные tests`,note:`контракт приложения сохранён`},{id:`seed`,code:`подготовить фиксированный dataset`,note:`одинаковые входные условия`},{id:`baseline`,code:`измерить контрольную версию`,note:`записать p50/p95/errors`},{id:`candidate`,code:`измерить async-версию тем же сценарием`,note:`сравнить одно изменение`},{id:`trace`,code:`разобрать медленный request по request_id`,note:`связать метрику с причиной`},{id:`report`,code:`обновить README и migration report`,note:`зафиксировать ограничения`}],correctOrder:[`tests`,`seed`,`baseline`,`candidate`,`trace`,`report`],explanation:`Порядок сохраняет рабочую контрольную точку и делает причину ошибки локальной.`}),(0,E.jsx)(m,{cards:[{front:(0,E.jsx)(`strong`,{children:`Что предсказать до запуска?`}),back:(0,E.jsx)(`span`,{children:`Точку первого I/O, число запросов или итоговое состояние transaction.`})},{front:(0,E.jsx)(`strong`,{children:`Что изменить самостоятельно?`}),back:(0,E.jsx)(`span`,{children:`Один параметр конфигурации, один statement или одну границу ресурса.`})},{front:(0,E.jsx)(`strong`,{children:`Что проверить после ошибки?`}),back:(0,E.jsx)(`span`,{children:`Состояние базы, session, pool и стабильный API-контракт.`})},{front:(0,E.jsx)(`strong`,{children:`Что записать в Git?`}),back:(0,E.jsx)(`span`,{children:`Небольшой diff, тест и объяснение измеримого результата.`})}]}),(0,E.jsxs)(`div`,{className:`lesson-practice-steps`,children:[(0,E.jsx)(`h3`,{children:`Минимум`}),(0,E.jsx)(`p`,{children:`Повторите основной пример и добейтесь ожидаемого результата.`}),(0,E.jsx)(`h3`,{children:`Изменение`}),(0,E.jsx)(`p`,{children:`Поменяйте один параметр, заранее запишите прогноз и сравните его с фактом.`}),(0,E.jsx)(`h3`,{children:`Ошибка`}),(0,E.jsx)(`p`,{children:`Создайте контролируемый сбой и подтвердите cleanup или rollback.`}),(0,E.jsx)(`h3`,{children:`Объяснение`}),(0,E.jsx)(`p`,{children:`Нарисуйте путь request → dependency → service → AsyncSession → PostgreSQL → response.`}),(0,E.jsx)(`h3`,{children:`Коммит`}),(0,E.jsx)(`p`,{children:`Зафиксируйте только завершённый проверяемый шаг без случайных файлов и секретов.`})]})]}),(0,E.jsxs)(u,{number:`08`,title:`Контрольная точка и критерии готовности`,children:[(0,E.jsx)(l,{children:`Занятие завершено, когда ученик может воспроизвести результат, объяснить механизм и показать отрицательный сценарий без подсказки.`}),(0,E.jsxs)(`div`,{className:`lesson-check-group`,children:[(0,E.jsx)(p,{question:`Почему среднего времени недостаточно?`,options:[`Оно может скрыть медленный хвост, который виден в p95`,`Среднее нельзя вычислить в Python`,`p50 всегда равно нулю`],correctIndex:0,explanation:`Распределение latency показывает типичный и медленный сценарии отдельно.`}),(0,E.jsx)(p,{question:`Как сравнивать sync и async корректно?`,options:[`С одинаковым endpoint, dataset, concurrency и окружением`,`С разными данными для реалистичности`,`Только по одной самой быстрой попытке`],correctIndex:0,explanation:`Контролируемый эксперимент меняет одну существенную переменную.`}),(0,E.jsx)(p,{question:`Что связывает события одного запроса в логах?`,options:[`request_id`,`Название виртуального окружения`,`Порядок строк в README`],correctIndex:0,explanation:`Один идентификатор позволяет восстановить путь операции через слои.`}),(0,E.jsx)(p,{question:`Когда миграция Async StudyHub считается завершённой?`,options:[`Контракт сохранён, тесты проходят, ошибки наблюдаемы и измерение воспроизводимо`,`Когда все функции получили async def`,`Когда p50 однажды оказался меньше`],correctIndex:0,explanation:`Финальный результат включает корректность, наблюдаемость и честную фиксацию ограничений.`})]}),(0,E.jsx)(r,{points:[(0,E.jsx)(E.Fragment,{children:`Async не объявляется ускорением без измерения.`}),(0,E.jsx)(E.Fragment,{children:`Baseline и candidate должны использовать одинаковые условия.`}),(0,E.jsx)(E.Fragment,{children:`Latency читается как распределение; p50 и p95 отвечают на разные вопросы.`}),(0,E.jsx)(E.Fragment,{children:`Throughput оценивается вместе с concurrency и error rate.`}),(0,E.jsx)(E.Fragment,{children:`request_id связывает HTTP-запрос, database-операции и итоговый лог.`}),(0,E.jsx)(E.Fragment,{children:`Полный test suite защищает HTTP-контракт при смене database stack.`}),(0,E.jsx)(E.Fragment,{children:`Финальный отчёт фиксирует команду запуска, dataset, окружение, результаты и ограничения.`})]}),(0,E.jsxs)(`div`,{className:`lesson-practice-steps`,children:[(0,E.jsx)(`h3`,{children:`Понять`}),(0,E.jsx)(`p`,{children:`Объяснить модель своими словами без чтения определения.`}),(0,E.jsx)(`h3`,{children:`Увидеть`}),(0,E.jsx)(`p`,{children:`Показать, где создаётся объект и где начинается реальный I/O.`}),(0,E.jsx)(`h3`,{children:`Предсказать`}),(0,E.jsx)(`p`,{children:`Назвать результат изменения до запуска.`}),(0,E.jsx)(`h3`,{children:`Запустить`}),(0,E.jsx)(`p`,{children:`Воспроизвести success path одной командой.`}),(0,E.jsx)(`h3`,{children:`Найти ошибку`}),(0,E.jsx)(`p`,{children:`Получить ожидаемый сбой и локализовать причину.`}),(0,E.jsx)(`h3`,{children:`Проверить`}),(0,E.jsx)(`p`,{children:`Подтвердить состояние данных, cleanup и регрессию тестом.`}),(0,E.jsx)(`h3`,{children:`Зафиксировать`}),(0,E.jsx)(`p`,{children:`Обновить README или техническую заметку и сделать осмысленный коммит.`})]}),(0,E.jsx)(_,{text:`Проведите финальный migration drill Async StudyHub: полный test suite, фиксированный seed, baseline и candidate load-run, разбор одного request_id и краткий отчёт с p50, p95, error rate и ограничениями.`})]})]})}export{O as Lesson164};