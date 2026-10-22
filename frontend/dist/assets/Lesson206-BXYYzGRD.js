import{t as e}from"./jsx-runtime-lw2jiZar.js";import{t}from"./activity-BFe0pMCz.js";import{A as n,C as r,D as i,E as a,F as o,M as s,N as c,O as l,P as u,S as d,T as f,_ as p,b as m,h,j as g,p as _,x as v,y}from"./shared-DoR5oW6-.js";import{t as b}from"./test-tube-diagonal-B6T5NWDX.js";import{t as x}from"./CodeEditor-BZlrvoTL.js";var S=e(),C=`Блок 35 · Redis, кеш и фоновые операции`;function w({module:e}){return(0,S.jsxs)(c,{children:[(0,S.jsx)(s,{variant:`project`,chip:e??C,title:`Тестирование кеша, rate limit и фоновых ошибок`,intro:`Финализируем блок измеримыми сценариями: проверяем cache miss/hit, invalidation, TTL, 429, Redis unavailable fallback, BackgroundTasks и ошибки уведомления так, чтобы Redis не превращал StudyHub в хрупкую систему.`,tags:[{icon:(0,S.jsx)(b,{size:14}),label:`integration tests`},{icon:(0,S.jsx)(t,{size:14}),label:`degradation matrix`}]}),(0,S.jsx)(o,{link:`Кеш, invalidation, rate limit и background action работают по отдельности. Финальный урок должен доказать их совместимость, наблюдаемость и предсказуемую деградацию без реальной внешней сети.`,boundary:`Тесты не маскируют PostgreSQL failure кешем и не утверждают performance benefit по одному случайному числу. Production load testing и полноценный observability stack остаются отдельными задачами.`}),(0,S.jsxs)(u,{number:`01`,title:`Что именно должен доказать test suite`,children:[(0,S.jsx)(l,{children:`Недостаточно проверить, что redis.get был вызван. Тесты описывают пользовательские эффекты: одинаковый response при hit/miss, свежий каталог после write, 429 без side effect, работа read-path при Redis failure и видимая background error.`}),(0,S.jsxs)(`div`,{className:`lesson-route`,children:[(0,S.jsxs)(`ol`,{children:[(0,S.jsxs)(`li`,{children:[(0,S.jsx)(`strong`,{children:`Изолировать:`}),` `,`заменить Redis test instance или fake dependency`]}),(0,S.jsxs)(`li`,{children:[(0,S.jsx)(`strong`,{children:`Наблюдать:`}),` `,`считать database calls, cache events и notification results`]}),(0,S.jsxs)(`li`,{children:[(0,S.jsx)(`strong`,{children:`Ломать:`}),` `,`инъецировать RedisError и ProviderError`]}),(0,S.jsxs)(`li`,{children:[(0,S.jsx)(`strong`,{children:`Сверить:`}),` `,`проверить HTTP contract и logs в каждом режиме`]})]}),(0,S.jsx)(`p`,{children:`Результат урока — test matrix и повторяемый набор проверок для всех эксплуатационных функций блока.`})]}),(0,S.jsx)(a,{tone:`info`,children:`Хороший failure test заранее фиксирует ожидаемую деградацию. Он не просто ждёт, что приложение «не упадёт».`})]}),(0,S.jsxs)(u,{number:`02`,title:`Fake Redis или изолированный service`,children:[(0,S.jsx)(l,{children:`Unit tests могут использовать небольшой fake с get/set/delete/incr/ttl, а integration tests — отдельную Redis database или Compose service. Главное — очищать state между tests и не зависеть от developer Redis.`}),(0,S.jsx)(f,{question:`Как разделить уровни проверки?`,left:{title:`Только mock вызовов`,code:`redis.get.assert_called_once()`,note:`Быстро, но не проверяет TTL, counter и реальные данные.`},right:{title:`Fake + integration Redis`,code:`unit policy tests + small real integration suite`,note:`Policy проверяется быстро, а протокол и TTL подтверждаются отдельно.`},preferred:`right`,explanation:`Комбинация даёт быстрый feedback и несколько проверок реального поведения Redis.`}),(0,S.jsx)(n,{rows:[[`unit`,`key builder, serialization, branches и exception policy`],[`service`,`cache service с fake repository и fake Redis`],[`integration`,`FastAPI client + PostgreSQL test DB + isolated Redis`],[`manual`,`latency/log scenario в Compose`]]})]}),(0,S.jsxs)(u,{number:`03`,title:`Cache hit, invalidation и TTL`,children:[(0,S.jsx)(l,{children:`Test считает обращения repository. На первом request fake Redis пуст, repository вызывается один раз и value появляется. На втором request repository call count остаётся один, а response полностью совпадает.`}),(0,S.jsx)(x,{caption:`repository вызывается только на miss`,code:`async def test_catalog_cache_miss_then_hit(
            client,
            catalog_repository,
            redis,
        ):
            first = await client.get("/courses?page=1")
            second = await client.get("/courses?page=1")
        
            assert first.status_code == 200
            assert second.json() == first.json()
            assert catalog_repository.list_calls == 1
            assert await redis.get(
                "studyhub:catalog:g1:page=1:size=20:category=all"
            ) is not None`}),(0,S.jsx)(p,{code:`repository_calls = 0
        cache = {}
        for _ in range(2):
            if "catalog" not in cache:
                repository_calls += 1
                cache["catalog"] = ["SQL"]
        print(repository_calls)`,output:`1`,hint:`Второй read использует уже заполненный cache value.`}),(0,S.jsx)(l,{children:`Invalidation test воспроизводит Old → PATCH → New. TTL policy удобнее проверять через fake clock или короткий isolated Redis TTL, а не ждать минуту в каждом test. Test должен оставаться быстрым и детерминированным.`}),(0,S.jsx)(x,{caption:`stale scenario становится тестом`,code:`async def test_update_invalidates_catalog(client):
            old = await client.get("/courses")
        
            updated = await client.patch(
                "/courses/42",
                json={"title": "New title"},
            )
        
            fresh = await client.get("/courses")
        
            assert old.json()[0]["title"] == "Old title"
            assert updated.status_code == 200
            assert fresh.json()[0]["title"] == "New title"`}),(0,S.jsx)(d,{statement:(0,S.jsx)(S.Fragment,{children:`Надёжный TTL test обязан выполнять sleep(60).`}),isTrue:!1,explanation:`Можно использовать короткий TTL, fake clock или проверку expiration metadata.`})]}),(0,S.jsxs)(u,{number:`04`,title:`Rate limit: status и отсутствие side effect`,children:[(0,S.jsx)(l,{children:`Тест делает limit разрешённых requests, затем ещё один. Для заблокированного вызова проверяются 429, Retry-After и неизменившийся notification call count. После reset следующий request снова разрешён.`}),(0,S.jsx)(x,{caption:`429 не запускает действие`,code:`async def test_reminder_rate_limit(client, notifier):
            for _ in range(3):
                response = await client.post(
                    "/courses/42/reminders"
                )
                assert response.status_code == 200
        
            blocked = await client.post(
                "/courses/42/reminders"
            )
        
            assert blocked.status_code == 429
            assert int(blocked.headers["Retry-After"]) >= 1
            assert notifier.calls == 3`}),(0,S.jsx)(h,{code:`if request_number <= 3:
            notifier.send()
            return 200
        else:
            return 429
        # after reset -> 200`,scenarios:[{label:`1–3`,activeLine:2,output:`200 и notifier.calls растёт`},{label:`4`,activeLine:5,output:`429, notifier.calls не меняется`},{label:`после reset`,activeLine:6,output:`200 и новый window`}]})]}),(0,S.jsxs)(u,{number:`05`,title:`Redis unavailable matrix`,children:[(0,S.jsx)(l,{children:`Failure injection должен различать функции. Catalog read работает через PostgreSQL; invalidation failure логируется после успешного update; reminder limiter следует задокументированному fail-open; PostgreSQL failure по-прежнему возвращает database error и не скрывается старым кешем.`}),(0,S.jsx)(_,{prompt:`Соедините отказ dependency и ожидаемое поведение.`,leftTitle:`Сбой`,rightTitle:`Ожидаемое поведение`,pairs:[{left:`Redis GET error в каталоге`,right:`PostgreSQL fallback + warning`},{left:`Redis invalidation error после commit`,right:`write успешен + error log + TTL ограничивает stale window`},{left:`Redis rate-limit error`,right:`fail-open reminder + warning`},{left:`PostgreSQL error`,right:`не маскировать обычным cache miss`}],explanation:`Каждая функция имеет отдельную degradation policy.`}),(0,S.jsx)(r,{code:`try:
            return await get_catalog()
        except Exception:
            return decode(await redis.get("catalog"))`,question:`Почему fallback опасен?`,options:[`PostgreSQL и programming errors скрываются устаревшим кешем`,`Redis нельзя читать`,`HTTP response всегда должен быть пустым`],correctIndex:0,explanation:`Широкий except маскирует source-of-truth failure и дефекты кода.`,fix:`try:
            cached = await redis.get(key)
        except RedisError:
            cached = None
        
        # PostgreSQL errors проходят отдельно
        return await load_from_db_if_needed(cached)`})]}),(0,S.jsxs)(u,{number:`06`,title:`Background task: успех и ошибка`,children:[(0,S.jsx)(l,{children:`TestClient обычно выполняет зарегистрированные BackgroundTasks до завершения тестового response context, поэтому можно проверить созданную строку или spy call. Для ошибки provider проверяется logger record, а enrollment остаётся сохранённым.`}),(0,S.jsx)(x,{caption:`ошибка вторичного действия не отменяет enrollment`,code:`async def test_enrollment_survives_notification_error(
            client,
            failing_notifier,
            caplog,
            enrollment_repository,
        ):
            response = await client.post(
                "/courses/42/enrollments"
            )
        
            assert response.status_code == 201
            assert await enrollment_repository.exists(
                response.json()["id"]
            )
            assert "background notification failed" in caplog.text`}),(0,S.jsx)(v,{question:`Какие две независимые вещи проверяет этот test?`,hint:`Разделите главный результат и вторичную операцию.`,answer:(0,S.jsx)(`p`,{children:`Product fact Enrollment сохранён, а background failure наблюдаем в logs. Одно не подменяет другое.`})})]}),(0,S.jsxs)(u,{number:`07`,title:`Финальная dashboard сценариев и измерение`,children:[(0,S.jsx)(l,{children:`Блок завершается таблицей сценариев и повторным измерением каталога. Ученик показывает cache hit ratio на маленьком demo, latency miss/hit, число 429 и background errors, но не делает громких выводов без нагрузки.`}),(0,S.jsx)(y,{title:`финальный набор проверок`,lines:[{cmd:`pytest tests/cache tests/rate_limit tests/background -q`},{out:`18 passed`},{cmd:`python scripts/measure_catalog.py --requests 20`},{out:`miss=1 hit=19 avg_hit_ms=11.8 avg_miss_ms=82.4`},{cmd:`docker compose logs api | grep -E "cache|rate_limit|background" | tail`},{out:`catalog_cache hit
        rate_limit blocked user=42
        background notification failed enrollment=91`}]}),(0,S.jsx)(a,{children:`Измерение описывает конкретную среду и demo dataset. Оно подтверждает механизм, но не заменяет production profiling.`})]}),(0,S.jsxs)(u,{number:`08`,title:`Контрольная точка: устойчивый Redis-блок`,children:[(0,S.jsx)(l,{children:`Проверьте не только знание команд, но и способность проследить путь данных, назвать source of truth, предсказать режим деградации и объяснить результат теста без чтения готового ответа.`}),(0,S.jsxs)(`div`,{className:`lesson-check-group`,children:[(0,S.jsx)(m,{question:`Что доказывает cache hit test?`,options:[`Одинаковый response и отсутствие второго repository call`,`Только status 200`,`Наличие Redis image`],correctIndex:0,explanation:`Проверяется наблюдаемое поведение и источник данных.`}),(0,S.jsx)(m,{question:`Что проверять при 429?`,options:[`Retry-After и отсутствие side effect`,`Только JSON title`,`Database migration`],correctIndex:0,explanation:`Заблокированный action не должен выполняться.`}),(0,S.jsx)(m,{question:`Как каталог ведёт себя при Redis GET error?`,options:[`Читает PostgreSQL и логирует warning`,`Удаляет courses`,`Всегда возвращает 429`],correctIndex:0,explanation:`Кеш является временной оптимизацией.`}),(0,S.jsx)(m,{question:`Что должно остаться после background error?`,options:[`Committed enrollment и error log`,`Откат PostgreSQL`,`Пустой response`],correctIndex:0,explanation:`Вторичная операция не отменяет product transaction.`})]}),(0,S.jsx)(i,{points:[(0,S.jsx)(S.Fragment,{children:`Tests проверяют пользовательский эффект, а не только вызовы Redis methods.`}),(0,S.jsx)(S.Fragment,{children:`Miss/hit подтверждаются repository call count и одинаковым response.`}),(0,S.jsx)(S.Fragment,{children:`Invalidation test воспроизводит Old → write → New.`}),(0,S.jsx)(S.Fragment,{children:`TTL проверяется детерминированно без длинных ожиданий.`}),(0,S.jsx)(S.Fragment,{children:`Rate-limit test проверяет 429, Retry-After и отсутствие side effect.`}),(0,S.jsx)(S.Fragment,{children:`Redis failure имеет отдельную policy для cache, invalidation и limiter.`}),(0,S.jsx)(S.Fragment,{children:`Background error оставляет product transaction и создаёт наблюдаемый log.`})]}),(0,S.jsx)(g,{text:`Создайте test matrix минимум из 10 сценариев: miss, hit, different filter key, invalidation, TTL, 429, reset, Redis GET failure, Redis invalidation failure, notification success и failure. Добавьте scripts/measure_catalog.py и обновите README фактическими командами и ограничениями измерения.`})]})]})}export{w as Lesson206};