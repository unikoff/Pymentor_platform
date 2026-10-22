import{t as e}from"./jsx-runtime-lw2jiZar.js";import{A as t,C as n,D as r,E as i,F as a,I as o,L as s,M as c,N as l,O as u,P as d,S as f,T as p,_ as m,b as h,f as g,h as _,j as v,p as y,v as b,x,y as S}from"./shared-DoR5oW6-.js";import{t as C}from"./test-tube-diagonal-B6T5NWDX.js";import{t as w}from"./workflow-BlnqNw4V.js";import{t as T}from"./CodeEditor-BZlrvoTL.js";var E=e(),D=`Блок 27 · Асинхронный FastAPI и внешние HTTP-сервисы`;function O({module:e}){return(0,E.jsxs)(l,{children:[(0,E.jsx)(c,{variant:`project`,chip:e??D,title:`Агрегирующий endpoint и mock внешнего API`,intro:`Соберём финальную вертикаль блока: endpoint overview конкурентно получает несколько внешних данных, сохраняет полезный частичный результат и проверяется через MockTransport без реальной сети.`,tags:[{icon:(0,E.jsx)(w,{size:14}),label:`несколько источников → один response`},{icon:(0,E.jsx)(C,{size:14}),label:`MockTransport и деградация`}]}),(0,E.jsx)(a,{link:`У нас есть выбор async endpoint, AsyncClient, ошибки, dependency и lifespan. Финальный урок соединяет их в один наблюдаемый пользовательский сценарий.`,boundary:`Агрегация не означает скрыть любую ошибку. Контракт явно сообщает, какие части доступны, какие деградировали и когда весь endpoint должен завершиться ошибкой.`}),(0,E.jsxs)(d,{number:`01`,title:`Финальный сценарий блока: course overview`,children:[(0,E.jsx)(u,{children:`Клиенту нужен один экран курса: локальные сведения, рекомендации и состояние внешнего учебного ресурса. Эти внешние операции независимы, поэтому service запускает их конкурентно и собирает один response.`}),(0,E.jsxs)(`div`,{className:`lesson-route`,children:[(0,E.jsxs)(`ol`,{children:[(0,E.jsxs)(`li`,{children:[(0,E.jsx)(`strong`,{children:`Получить local course:`}),` проверить существование до внешних вызовов.`]}),(0,E.jsxs)(`li`,{children:[(0,E.jsx)(`strong`,{children:`Запустить внешние coroutine:`}),` recommendations и resource status.`]}),(0,E.jsxs)(`li`,{children:[(0,E.jsx)(`strong`,{children:`Собрать частичный результат:`}),` сохранить доступные данные при контролируемом сбое.`]}),(0,E.jsxs)(`li`,{children:[(0,E.jsx)(`strong`,{children:`Проверить без сети:`}),` использовать httpx.MockTransport для success, timeout и 500.`]})]}),(0,E.jsx)(`p`,{children:`Итог — GET /courses/{course_id}/overview с явным degradation contract.`})]}),(0,E.jsx)(i,{tone:`info`,children:`Локальный 404 должен завершить сценарий до обращения к внешним сервисам.`})]}),(0,E.jsxs)(d,{number:`02`,title:`Контракт overview до реализации`,children:[(0,E.jsx)(u,{children:`Response-модель заранее показывает обязательные и деградируемые части. Course обязателен. Recommendations и resource_status могут иметь status unavailable, но структура ответа остаётся стабильной.`}),(0,E.jsxs)(s,{children:[(0,E.jsx)(o,{badge:`local`,title:`CourseSummary`,code:`id, title, lessons_count`,children:`Обязательная часть из собственной базы StudyHub.`}),(0,E.jsx)(o,{badge:`external A`,badgeTone:`float`,title:`RecommendationResult`,code:`status, items, error`,children:`Полезные рекомендации или контролируемая причина недоступности.`}),(0,E.jsx)(o,{badge:`external B`,badgeTone:`str`,title:`ResourceStatus`,code:`status, checked_url`,children:`Результат проверки дополнительного учебного ресурса.`})]}),(0,E.jsx)(t,{rows:[[`operation_id`,`связывает логи всех частей одного overview`],[`course`,`обязательные локальные данные`],[`recommendations.status`,`ok / timeout / unavailable / bad_response`],[`recommendations.items`,`список только при успешном ответе`],[`degraded`,`быстрый признак частичного результата`]]})]}),(0,E.jsxs)(d,{number:`03`,title:`Конкурентный запуск независимых запросов`,children:[(0,E.jsx)(u,{children:`После проверки локального курса две внешние операции не зависят друг от друга. asyncio.gather запускает обе coroutine и возвращает результаты в порядке переданных аргументов.`}),(0,E.jsx)(b,{code:`recommendations_coro = load_recommendations(course_id)
        resource_coro = check_resource(course.resource_url)
        recommendations, resource = await asyncio.gather(
            recommendations_coro,
            resource_coro,
        )
        return build_overview(course, recommendations, resource)`,steps:[{line:0,note:`Создаётся coroutine рекомендаций.`,vars:{A:`not started until scheduled`}},{line:1,note:`Создаётся coroutine проверки ресурса.`,vars:{B:`independent`}},{line:2,note:`gather планирует обе операции конкурентно.`,vars:{A:`waiting I/O`,B:`waiting I/O`}},{line:3,note:`Результаты связываются с порядком аргументов.`,vars:{recommendations:`result A`,resource:`result B`}},{line:6,note:`Собирается единая response-модель.`,vars:{degraded:`depends on statuses`}}]}),(0,E.jsx)(m,{code:`async def fast():
            await asyncio.sleep(0.1)
            return "fast"
        
        async def slow():
            await asyncio.sleep(0.3)
            return "slow"
        
        result = await asyncio.gather(slow(), fast())
        print(result)`,output:`["slow", "fast"]`,hint:`Порядок списка соответствует аргументам gather, а не времени завершения.`})]}),(0,E.jsxs)(d,{number:`04`,title:`Частичная деградация вместо случайного падения`,children:[(0,E.jsx)(u,{children:`Каждая внешняя операция сама переводит ожидаемую ошибку в result object. Тогда gather не теряет полезный соседний результат. Неожиданный программный дефект не скрывается и должен упасть в тесте.`}),(0,E.jsx)(_,{code:`if recommendations.ok and resource.ok:
            degraded = False
        elif recommendations.expected_error or resource.expected_error:
            degraded = True
        else:
            raise unexpected_error
        return overview`,scenarios:[{label:`оба success`,activeLine:1,output:`degraded=false`},{label:`recommendations timeout`,activeLine:3,output:`degraded=true, resource сохранён`},{label:`resource 500`,activeLine:3,output:`degraded=true, recommendations сохранены`},{label:`KeyError в нашем коде`,activeLine:5,output:`не скрывать как частичную деградацию`}]}),(0,E.jsx)(g,{cards:[{front:`ok`,back:`Данные получены и прошли проверку контракта.`},{front:`timeout`,back:`Время ожидания превышено; items пуст, error безопасен.`},{front:`unavailable`,back:`Транспортная ошибка; соседний результат можно сохранить.`},{front:`bad_response`,back:`Upstream ответил 4xx/5xx или нарушил ожидаемую форму.`}]}),(0,E.jsx)(i,{children:`Частичный результат полезен только при явном поле status. Пустой список без причины скрывает сбой.`})]}),(0,E.jsxs)(d,{number:`05`,title:`Pydantic response фиксирует форму деградации`,children:[(0,E.jsx)(u,{children:`Response-схемы не должны зависеть от случайного словаря upstream. Они описывают собственный API-контракт и позволяют клиенту обработать частичный результат без догадок.`}),(0,E.jsx)(T,{caption:`стабильная response-модель`,code:`from typing import Literal
        from pydantic import BaseModel
        
        class ExternalPart(BaseModel):
            status: Literal[
                "ok",
                "timeout",
                "unavailable",
                "bad_response",
            ]
            items: list[str] = []
            error: str | None = None
        
        class CourseOverview(BaseModel):
            operation_id: str
            course: CourseSummary
            recommendations: ExternalPart
            resource: ExternalPart
            degraded: bool`}),(0,E.jsx)(y,{prompt:`Соедините поле и его гарантию.`,leftTitle:`Поле`,rightTitle:`Смысл`,pairs:[{left:`course`,right:`обязательные локальные данные`},{left:`status`,right:`явный исход одной внешней части`},{left:`items`,right:`полезные данные при status=ok`},{left:`error`,right:`безопасное пояснение ожидаемого сбоя`},{left:`degraded`,right:`хотя бы одна внешняя часть недоступна`}],explanation:`Схема позволяет клиенту принимать решение без анализа traceback или косвенных признаков.`})]}),(0,E.jsxs)(d,{number:`06`,title:`MockTransport перехватывает реальные httpx requests`,children:[(0,E.jsx)(u,{children:`httpx.MockTransport получает Request и возвращает подготовленный Response. Production RecommendationClient остаётся настоящим: тест заменяет только транспорт, поэтому проверяются URL, query params, status и parsing.`}),(0,E.jsx)(T,{caption:`mock без реальной сети`,code:`def handler(request: httpx.Request) -> httpx.Response:
            if request.url.path == "/recommendations":
                course_id = request.url.params["course_id"]
                return httpx.Response(
                    200,
                    json={
                        "course_id": int(course_id),
                        "items": [
                            {"title": "Повторить gather"}
                        ],
                    },
                )
        
            if request.url.path == "/resource-status":
                return httpx.Response(
                    200,
                    json={"available": True},
                )
        
            return httpx.Response(404)
        
        transport = httpx.MockTransport(handler)
        http_client = httpx.AsyncClient(
            transport=transport,
            base_url="https://catalog.test",
        )`}),(0,E.jsx)(n,{code:`def handler(request):
            return {
                "status_code": 200,
                "json": {"items": []},
            }`,question:`Почему MockTransport не примет такой результат?`,options:[`Handler должен вернуть httpx.Response`,`Handler обязан быть async def`,`JSON нельзя использовать в тестах`],correctIndex:0,explanation:`MockTransport ожидает объект Response с HTTP-семантикой.`,fix:`def handler(request: httpx.Request) -> httpx.Response:
            return httpx.Response(
                200,
                json={"items": []},
            )`})]}),(0,E.jsxs)(d,{number:`07`,title:`Три обязательных теста финальной интеграции`,children:[(0,E.jsx)(u,{children:`Финальный набор проверяет полный success, частичный timeout и внешний 500. Ни один тест не обращается в интернет и не зависит от отдельного процесса mock-service.`}),(0,E.jsx)(S,{title:`финальная матрица`,lines:[{cmd:`pytest tests/test_course_overview.py -q`},{out:`test_overview_success PASSED`},{out:`test_overview_recommendations_timeout PASSED`},{out:`test_overview_resource_bad_status PASSED`},{out:`test_overview_local_course_not_found_skips_external_calls PASSED`},{out:`4 passed in 0.28s`}]}),(0,E.jsx)(p,{question:`Какой тест устойчивее?`,left:{title:`Реальный публичный URL`,code:`response = client.get(
            "https://public-api.example/recommendations"
        )`,note:`Зависит от сети, данных, лимитов и доступности чужого сервиса.`},right:{title:`MockTransport`,code:`transport = httpx.MockTransport(handler)
        client = httpx.AsyncClient(transport=transport)`,note:`Полностью контролирует HTTP-сценарий и остаётся быстрым.`},preferred:`right`,explanation:`Интеграционный тест должен быть воспроизводимым и проверять наш контракт, а не доступность интернета.`}),(0,E.jsx)(x,{question:`Когда частичный response лучше полного 503?`,hint:`Назовите обязательную и дополнительную часть сценария.`,answer:(0,E.jsx)(`p`,{children:`Когда локальная обязательная часть доступна, а ожидаемый сбой одной дополнительной внешней части не делает весь ответ бесполезным. Контракт должен явно отметить degraded и status части.`})}),(0,E.jsx)(`h3`,{className:`lesson-subtitle`,children:`Контрольная точка Async HTTP-интеграции`}),(0,E.jsx)(u,{children:`Блок завершён, когда ученик может проследить request от router до двух внешних операций, объяснить lifecycle клиента, показать timeout и подтвердить тестом, что полезный соседний результат сохраняется.`}),(0,E.jsx)(T,{caption:`финальный маршрут данных`,code:`GET /courses/7/overview
          -> load local course
          -> gather(
               recommendations client,
               resource status client,
             )
          -> normalize result objects
          -> CourseOverview
          -> 200 with degraded flag`}),(0,E.jsx)(i,{tone:`info`,children:`Следующий блок переведёт database I/O на AsyncSession. Здесь локальная база остаётся синхронной границей и не смешивается с внешним AsyncClient.`}),(0,E.jsx)(f,{statement:(0,E.jsx)(E.Fragment,{children:`Если одна дополнительная внешняя часть вернула ожидаемый timeout, endpoint всегда обязан скрыть весь локальный course и ответить 500.`}),isTrue:!1,explanation:`При заранее определённом degradation contract можно вернуть локальные данные и статус недоступной части.`})]}),(0,E.jsxs)(d,{number:`08`,title:`Проверка понимания и проектная практика`,children:[(0,E.jsx)(u,{children:`Закройте подсказки и объясните маршрут данных своими словами. Затем пройдите четыре вопроса и только после этого переходите к проектной задаче.`}),(0,E.jsxs)(`div`,{className:`lesson-check-group`,children:[(0,E.jsx)(h,{question:`Что сохраняет порядок результатов gather?`,options:[`Порядок переданных awaitables`,`Время завершения`,`HTTP status`],correctIndex:0,explanation:`Результаты соответствуют порядку аргументов gather.`}),(0,E.jsx)(h,{question:`Зачем нужно поле degraded?`,options:[`Явно сообщить о частичном результате`,`Скрыть status_code`,`Ускорить CPU`],correctIndex:0,explanation:`Клиент видит, что одна из дополнительных частей недоступна.`}),(0,E.jsx)(h,{question:`Что возвращает handler MockTransport?`,options:[`httpx.Response`,`Обычный dict`,`FastAPI APIRouter`],correctIndex:0,explanation:`MockTransport моделирует HTTP-ответ объектом Response.`}),(0,E.jsx)(h,{question:`Когда внешний вызов не должен запускаться?`,options:[`Когда локальный course не найден`,`Когда course_id положительный`,`После успешного response`],correctIndex:0,explanation:`Обязательная локальная проверка выполняется до внешней работы.`})]}),(0,E.jsx)(r,{points:[`Агрегирующий endpoint сначала проверяет обязательные локальные данные.`,`Независимые внешние coroutine можно ожидать конкурентно через gather.`,`Ожидаемая ошибка превращается в result object, а не скрытый пустой список.`,`Pydantic response фиксирует status, items, error и degraded.`,`MockTransport проверяет настоящий httpx-клиент без реальной сети.`,`Финальная матрица включает success, timeout, bad status и local 404.`]}),(0,E.jsx)(v,{text:`Реализуйте GET /courses/{course_id}/overview: локальный course, конкурентные recommendations и resource status, частичный degradation contract и Pydantic response. Добавьте MockTransport-тесты success, timeout, внешний 500 и local 404 без внешних вызовов.`})]})]})}export{O as Lesson158};