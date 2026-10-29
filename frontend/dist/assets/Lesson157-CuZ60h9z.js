import{t as e}from"./jsx-runtime-CY_jTiqj.js";import{A as t,C as n,D as r,E as i,F as a,I as o,L as s,M as c,N as l,O as u,P as d,S as f,T as p,b as m,h,j as g,v as _,w as v,x as y,y as b}from"./shared-JA1PGxXr.js";import{t as x}from"./network-CJbRQfoW.js";import{t as S}from"./refresh-cw-DYYcYCGM.js";import{t as C}from"./CodeEditor-DqHMt3P8.js";var w=e(),T=`Блок 27 · Асинхронный FastAPI и внешние HTTP-сервисы`;function E({module:e}){return(0,w.jsxs)(l,{children:[(0,w.jsx)(c,{variant:`project`,chip:e??T,title:`Lifespan и переиспользование AsyncClient`,intro:`Перенесём AsyncClient с уровня одного request на уровень жизни FastAPI-приложения, сохраним его в app.state, переиспользуем connection pool и гарантированно закроем ресурс при shutdown.`,tags:[{icon:(0,w.jsx)(S,{size:14}),label:`startup → requests → shutdown`},{icon:(0,w.jsx)(x,{size:14}),label:`переиспользование соединений`}]}),(0,w.jsx)(a,{link:`Dependency уже делает клиент заменяемым, но пока создаёт его заново на каждый request. Теперь меняем только lifecycle, не меняя service и router.`,boundary:`Один клиент на приложение не означает один HTTP-запрос за раз. AsyncClient управляет пулом соединений и поддерживает конкурентные requests.`}),(0,w.jsxs)(d,{number:`01`,title:`Почему клиент на каждый request — рабочий, но дорогой старт`,children:[(0,w.jsx)(u,{children:`Создание AsyncClient внутри dependency безопасно для первых примеров, однако серия запросов постоянно создаёт и закрывает новые пулы соединений. Для долгоживущего приложения удобнее один клиент на startup и закрытие на shutdown.`}),(0,w.jsx)(p,{question:`Какой lifecycle лучше для повторяющейся интеграции?`,left:{title:`Клиент на каждый request`,code:`async def dependency():
            async with AsyncClient(...) as client:
                yield client`,note:`Просто, но соединения не переиспользуются между запросами.`},right:{title:`Клиент на lifespan приложения`,code:`@asynccontextmanager
        async def lifespan(app):
            client = AsyncClient(...)
            app.state.catalog_client = client
            yield
            await client.aclose()`,note:`Один управляемый pool живёт вместе с приложением.`},preferred:`right`,explanation:`Lifespan подходит ресурсу, который используется многими requests и имеет явный shutdown.`}),(0,w.jsx)(i,{tone:`info`,children:`Сначала важна корректность. Оптимизация lifecycle появляется после работающего provider и тестов.`})]}),(0,w.jsxs)(d,{number:`02`,title:`Модель lifespan: до yield и после yield`,children:[(0,w.jsx)(u,{children:`Lifespan — async context manager уровня приложения. Код до yield выполняется при startup, затем приложение обслуживает requests, а код после yield выполняется при shutdown.`}),(0,w.jsx)(_,{code:`@asynccontextmanager
        async def lifespan(app):
            client = build_client()
            app.state.catalog_client = client
            yield
            await client.aclose()`,steps:[{line:0,note:`FastAPI получает async context manager.`,vars:{phase:`startup`}},{line:2,note:`Создаётся сетевой клиент и connection pool.`,vars:{client:`open`}},{line:3,note:`Ссылка сохраняется в состоянии приложения.`,vars:{"app.state":`catalog_client`}},{line:4,note:`На yield начинается обслуживание requests.`,vars:{phase:`running`}},{line:5,note:`После сигнала shutdown клиент закрывается.`,vars:{phase:`shutdown`,client:`closed`}}]}),(0,w.jsx)(f,{statement:(0,w.jsx)(w.Fragment,{children:`Код после yield выполняется после каждого HTTP request.`}),isTrue:!1,explanation:`Он выполняется один раз при завершении lifespan приложения.`})]}),(0,w.jsxs)(d,{number:`03`,title:`Создаём FastAPI с управляемым клиентом`,children:[(0,w.jsx)(u,{children:`Функция create_app подключает lifespan. Внутри startup используется Settings, чтобы создать один AsyncClient с base URL, timeout и limits.`}),(0,w.jsx)(C,{caption:`единый lifecycle клиента`,code:`from contextlib import asynccontextmanager
        from fastapi import FastAPI
        import httpx
        
        @asynccontextmanager
        async def lifespan(app: FastAPI):
            settings = get_settings()
            http_client = httpx.AsyncClient(
                base_url=settings.catalog_url,
                timeout=settings.catalog_timeout,
                limits=httpx.Limits(
                    max_connections=20,
                    max_keepalive_connections=10,
                ),
            )
            app.state.recommendation_client = (
                RecommendationClient(http_client)
            )
        
            try:
                yield
            finally:
                await http_client.aclose()
        
        app = FastAPI(lifespan=lifespan)`}),(0,w.jsx)(t,{rows:[[`max_connections`,`верхняя граница одновременно открытых соединений`],[`max_keepalive_connections`,`сколько idle-соединений сохранить для повторного использования`],[`app.state`,`явное состояние конкретного экземпляра приложения`],[`finally + aclose`,`cleanup даже при ошибке shutdown-сценария`]]})]}),(0,w.jsxs)(d,{number:`04`,title:`Dependency теперь получает объект из Request`,children:[(0,w.jsx)(u,{children:`Router по-прежнему просит RecommendationClient через Depends. Provider больше не создаёт ресурс: он берёт уже готовый объект из request.app.state.`}),(0,w.jsx)(C,{caption:`provider после перехода на lifespan`,code:`from fastapi import Request
        
        async def get_recommendation_client(
            request: Request,
        ) -> RecommendationClient:
            return request.app.state.recommendation_client`}),(0,w.jsx)(h,{code:`if app_started:
            client = request.app.state.recommendation_client
        elif app_not_started:
            fail_test_or_start_lifespan()
        if app_shutting_down:
            stop_accepting_new_work()`,scenarios:[{label:`обычный request`,activeLine:1,output:`получить существующий client`},{label:`тест без lifespan`,activeLine:3,output:`state отсутствует — исправить способ запуска теста`},{label:`shutdown`,activeLine:5,output:`новую работу не начинать`}]}),(0,w.jsx)(y,{question:`Почему router не изменился после перехода на lifespan?`,hint:`Вспомните принцип заменяемой зависимости.`,answer:(0,w.jsx)(`p`,{children:`Router зависит от контракта provider, а не от способа создания клиента. Мы изменили сборку и lifecycle внутри инфраструктурной границы.`})})]}),(0,w.jsxs)(d,{number:`05`,title:`Переиспользование connection pool без магии`,children:[(0,w.jsx)(u,{children:`Один AsyncClient может отправлять много запросов. Он не хранит один-единственный socket; внутри находится пул. Keep-alive позволяет повторно использовать подходящее соединение и не выполнять полное подключение каждый раз.`}),(0,w.jsxs)(s,{children:[(0,w.jsx)(o,{badge:`request 1`,title:`Открыть соединение`,code:`connect → send → read`,children:`Первый запрос создаёт подходящее соединение.`}),(0,w.jsx)(o,{badge:`idle`,badgeTone:`float`,title:`Сохранить keep-alive`,code:`connection stays in pool`,children:`После ответа соединение может остаться готовым к повторному использованию.`}),(0,w.jsx)(o,{badge:`request 2`,badgeTone:`str`,title:`Переиспользовать`,code:`pool → send → read`,children:`Следующий запрос экономит повторное установление соединения.`})]}),(0,w.jsx)(i,{children:`Пул не отменяет limits и timeout. Он управляет соединениями, а не гарантирует доступность upstream.`})]}),(0,w.jsxs)(d,{number:`06`,title:`Cleanup должен происходить при любом shutdown`,children:[(0,w.jsx)(u,{children:`Незакрытый AsyncClient оставляет предупреждения и ресурсы. Конструкция try/finally делает cleanup видимым. Вызов aclose является асинхронным и требует await.`}),(0,w.jsx)(v,{title:`Соберите корректный lifespan`,prompt:`Расположите startup, running и shutdown по порядку.`,pieces:[{id:`decorator`,code:`@asynccontextmanager`},{id:`def`,code:`async def lifespan(app):`},{id:`create`,code:`    client = httpx.AsyncClient(...)`},{id:`store`,code:`    app.state.client = client`},{id:`yield`,code:`    yield`},{id:`close`,code:`    await client.aclose()`},{id:`wrong`,code:`    client.close()`,note:`не тот async cleanup`}],correctOrder:[`decorator`,`def`,`create`,`store`,`yield`,`close`],explanation:`Ресурс создаётся до yield и закрывается после завершения обслуживания приложения.`}),(0,w.jsx)(n,{code:`@asynccontextmanager
        async def lifespan(app):
            client = httpx.AsyncClient()
            app.state.client = client
            yield
            client.aclose()`,question:`Почему клиент может остаться незакрытым?`,options:[`aclose() вызван без await`,`app.state запрещён в FastAPI`,`yield должен быть return`],correctIndex:0,explanation:`Асинхронный cleanup нужно дождаться.`,fix:`@asynccontextmanager
        async def lifespan(app):
            client = httpx.AsyncClient()
            app.state.client = client
            try:
                yield
            finally:
                await client.aclose()`})]}),(0,w.jsxs)(d,{number:`07`,title:`Тест должен реально запускать lifespan`,children:[(0,w.jsx)(u,{children:`Если тест создаёт клиент приложения без контекстного менеджера, startup может не выполниться. Используйте TestClient как context manager или подходящий async transport, который запускает lifespan.`}),(0,w.jsx)(C,{caption:`проверка одного lifecycle`,code:`def test_reuses_one_client(app):
            with TestClient(app) as client:
                first = client.get("/courses/1/insight")
                second = client.get("/courses/2/insight")
        
                assert first.status_code == 200
                assert second.status_code == 200
                assert app.state.client_created_count == 1
        
            assert app.state.client_closed is True`}),(0,w.jsx)(b,{title:`lifecycle test`,lines:[{cmd:`pytest tests/test_lifespan.py -q -s`},{out:`startup: create catalog client
        request 1
        request 2
        shutdown: close catalog client
        1 passed`}]}),(0,w.jsx)(f,{statement:(0,w.jsx)(w.Fragment,{children:`Dependency override полностью отменяет необходимость проверить lifespan production-клиента.`}),isTrue:!1,explanation:`Override удобен для endpoint-тестов, но отдельный тест должен подтвердить startup, reuse и shutdown реального provider.`})]}),(0,w.jsxs)(d,{number:`08`,title:`Проверка понимания и проектная практика`,children:[(0,w.jsx)(u,{children:`Закройте подсказки и объясните маршрут данных своими словами. Затем пройдите четыре вопроса и только после этого переходите к проектной задаче.`}),(0,w.jsxs)(`div`,{className:`lesson-check-group`,children:[(0,w.jsx)(m,{question:`Когда выполняется код до yield в lifespan?`,options:[`При startup приложения`,`После каждого response`,`Только при 500`],correctIndex:0,explanation:`До yield создаются долгоживущие ресурсы.`}),(0,w.jsx)(m,{question:`Где хранится клиент в примере?`,options:[`request.app.state`,`Глобально в модуле теста`,`В cookie пользователя`],correctIndex:0,explanation:`app.state относится к конкретному приложению.`}),(0,w.jsx)(m,{question:`Зачем нужен await client.aclose()?`,options:[`Корректно закрыть async-ресурс`,`Создать новый pool`,`Проверить status 200`],correctIndex:0,explanation:`Cleanup AsyncClient является асинхронным.`}),(0,w.jsx)(m,{question:`Что даёт connection pool?`,options:[`Переиспользование соединений с ограничениями`,`Автоматический бесконечный retry`,`Параллельное CPU-вычисление`],correctIndex:0,explanation:`Pool управляет сетевыми соединениями.`})]}),(0,w.jsx)(r,{points:[`Lifespan управляет ресурсами на уровне startup и shutdown приложения.`,`Код до yield создаёт ресурс, код после yield выполняет cleanup.`,`Один AsyncClient может обслуживать множество конкурентных requests.`,`Connection pool переиспользует соединения и соблюдает limits.`,`Provider получает готовый клиент из request.app.state.`,`Тесты отдельно проверяют endpoint override и production lifecycle.`]}),(0,w.jsx)(g,{text:`Перенесите AsyncClient в FastAPI lifespan, сохраните RecommendationClient в app.state и измените provider так, чтобы router не менялся. Добавьте тесты: клиент создаётся один раз, используется двумя requests и закрывается после выхода из TestClient.`})]})]})}export{E as Lesson157};