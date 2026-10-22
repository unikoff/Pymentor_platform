import{t as e}from"./jsx-runtime-lw2jiZar.js";import{A as t,C as n,D as r,E as i,F as a,M as o,N as s,O as c,P as l,T as u,b as d,f,h as p,j as m,w as h,x as g,y as _}from"./shared-DoR5oW6-.js";import{t as v}from"./refresh-ccw-mBpE9WdV.js";import{t as y}from"./workflow-BlnqNw4V.js";import{t as b}from"./CodeEditor-BZlrvoTL.js";var x=e(),S=`Блок 31 · Docker Compose: API, PostgreSQL и Redis`;function C({module:e}){return(0,x.jsxs)(s,{children:[(0,x.jsx)(o,{variant:`project`,chip:e??S,title:`Полный local stack и сценарии восстановления`,intro:`Соберём финальный Compose stack Deployable StudyHub: одна команда поднимает db, migrations, API и Redis, а README и runbook помогают другому разработчику проверить health, найти сбой и безопасно восстановить окружение.`,tags:[{icon:(0,x.jsx)(y,{size:14}),label:`единый startup route`},{icon:(0,x.jsx)(v,{size:14}),label:`восстановление среды`}]}),(0,x.jsx)(a,{link:`Все services уже разобраны отдельно. Финальная задача блока — доказать воспроизводимость системы с чистой директории и после намеренных ошибок.`,boundary:`Это local development stack, а не production deployment. Secrets manager, registry, remote host и rollout появятся в блоке 32.`}),(0,x.jsxs)(l,{number:`01`,title:`Финальная topology Deployable StudyHub`,children:[(0,x.jsx)(c,{children:`Рабочий stack состоит из четырёх ролей: db хранит истину, migrate приводит schema к head, api обслуживает HTTP, redis предоставляет будущую временную инфраструктуру. Compose network и environment связывают роли, но не смешивают их обязанности.`}),(0,x.jsxs)(`div`,{className:`lesson-route`,children:[(0,x.jsxs)(`ol`,{children:[(0,x.jsxs)(`li`,{children:[(0,x.jsx)(`strong`,{children:`Подготовить:`}),` скопировать .env.example и заполнить local values`]}),(0,x.jsxs)(`li`,{children:[(0,x.jsx)(`strong`,{children:`Поднять:`}),` выполнить docker compose up --build -d`]}),(0,x.jsxs)(`li`,{children:[(0,x.jsx)(`strong`,{children:`Проверить:`}),` прочитать ps, health, migrations и smoke request`]}),(0,x.jsxs)(`li`,{children:[(0,x.jsx)(`strong`,{children:`Восстановить:`}),` пройти runbook для типового сбоя или reset`]})]}),(0,x.jsx)(`p`,{children:`Результат — quick start, который выполняется другим человеком без устных инструкций автора.`})]}),(0,x.jsx)(i,{tone:`info`,children:`Готовность блока доказывает не красивый YAML, а воспроизводимый путь clone → configure → up → migrate → ready → API scenario.`})]}),(0,x.jsxs)(l,{number:`02`,title:`Полный compose.yaml и контракт .env.example`,children:[(0,x.jsx)(c,{children:`Финальный файл соединяет уже изученные части. Важно читать его по services и зависимостям, а не как длинный набор ключей.`}),(0,x.jsx)(b,{caption:`финальный Compose stack`,code:`services:
          db:
            image: postgres:16-alpine
            env_file: .env
            volumes:
              - postgres_data:/var/lib/postgresql/data
            healthcheck:
              test: ["CMD-SHELL", "pg_isready -U studyhub -d studyhub"]
              interval: 5s
              timeout: 3s
              retries: 10
        
          migrate:
            build: .
            command: alembic upgrade head
            env_file: .env
            depends_on:
              db:
                condition: service_healthy
        
          redis:
            image: redis:7-alpine
            healthcheck:
              test: ["CMD", "redis-cli", "ping"]
              interval: 5s
              timeout: 3s
              retries: 10
        
          api:
            build: .
            env_file: .env
            ports:
              - "8000:8000"
            depends_on:
              migrate:
                condition: service_completed_successfully
            healthcheck:
              test: ["CMD", "python", "-c", "import urllib.request; urllib.request.urlopen('http://127.0.0.1:8000/health')"]
              interval: 10s
              timeout: 3s
              retries: 5
        
        volumes:
          postgres_data:`}),(0,x.jsx)(t,{rows:[[`db`,`постоянные relational data и readiness`],[`migrate`,`one-shot применение Alembic revisions`],[`api`,`HTTP process и application health`],[`redis`,`временная инфраструктура и connectivity`],[`postgres_data`,`жизненный цикл data отдельно от container`]]}),(0,x.jsx)(c,{children:`Quick start начинается с полного списка необходимых variables. .env.example содержит названия и безопасные placeholders, а локальный .env — реальные значения и исключается через .gitignore.`}),(0,x.jsx)(b,{caption:`контракт local config`,code:`# .env.example
        APP_ENV=development
        LOG_LEVEL=INFO
        POSTGRES_USER=studyhub
        POSTGRES_PASSWORD=change-me
        POSTGRES_DB=studyhub
        DATABASE_URL=postgresql+asyncpg://studyhub:change-me@db:5432/studyhub
        REDIS_URL=redis://redis:6379/0
        SECRET_KEY=replace-with-local-secret`}),(0,x.jsx)(f,{cards:[{front:`.env.example`,back:`Коммитится: имена variables и безопасные placeholders.`},{front:`.env`,back:`Не коммитится: локальные passwords и secret key.`},{front:`compose.yaml`,back:`Коммитится: topology, healthchecks и dependencies.`},{front:`postgres_data`,back:`Не является файлом репозитория: управляется Docker volume.`}]})]}),(0,x.jsxs)(l,{number:`03`,title:`Quick start из чистой директории`,children:[(0,x.jsx)(c,{children:`Проверка выполняется как новый разработчик: clone, создание .env, build/up, ожидание health, smoke request и чтение Swagger. Нельзя опираться на уже запущенные local processes или старый volume без явного решения.`}),(0,x.jsx)(h,{title:`Соберите README Quick Start`,prompt:`Расположите команды в воспроизводимом порядке.`,pieces:[{id:`clone`,code:`git clone <repo> && cd studyhub`},{id:`env`,code:`cp .env.example .env`},{id:`edit`,code:`заполнить local secrets`},{id:`up`,code:`docker compose up --build -d`},{id:`ps`,code:`docker compose ps`},{id:`smoke`,code:`curl -f http://localhost:8000/health`},{id:`docs`,code:`открыть http://localhost:8000/docs`}],correctOrder:[`clone`,`env`,`edit`,`up`,`ps`,`smoke`,`docs`],explanation:`Quick start сначала создаёт конфигурацию, затем stack и только после health выполняет пользовательскую проверку.`})]}),(0,x.jsxs)(l,{number:`04`,title:`Панель состояния и logs нескольких services`,children:[(0,x.jsx)(c,{children:`Диагностика начинается со сводной панели. Статус db healthy, migrate exited 0, redis healthy и api healthy описывает успешный startup. Любое отклонение направляет к logs конкретного service.`}),(0,x.jsx)(_,{title:`операционная проверка`,lines:[{cmd:`docker compose ps -a`},{out:`db        Up (healthy)
        migrate   Exited (0)
        redis     Up (healthy)
        api       Up (healthy)`},{cmd:`docker compose logs --tail=50 db migrate api redis`},{out:`db | ready to accept connections
        migrate | upgrade complete
        redis | Ready to accept connections
        api | Application startup complete`},{cmd:`curl -f http://localhost:8000/ready`},{out:`{"status":"ready","database":"ok","redis":"ok"}`}]}),(0,x.jsx)(i,{children:`Exited (0) для migrate является успешным конечным состоянием, а не падением long-running service.`})]}),(0,x.jsxs)(l,{number:`05`,title:`Диагностическое дерево типовых сбоев`,children:[(0,x.jsx)(c,{children:`Runbook должен начинаться с наблюдаемого симптома. API отсутствует в ps — читайте api logs. API ждёт migrate — читайте migrate logs. Migrate ждёт db — проверяйте db health. HTTP не открывается при healthy API — проверяйте published port.`}),(0,x.jsx)(p,{code:`api missing or exited
          -> docker compose logs api
        api waiting for migrate
          -> docker compose logs migrate
        migrate waiting for db
          -> docker compose ps db
        all healthy, HTTP unavailable
          -> check ports and host conflict`,scenarios:[{label:`API exited`,activeLine:1,output:`проверить CMD, config и traceback`},{label:`migrate failed`,activeLine:3,output:`проверить revision и DATABASE_URL`},{label:`db unhealthy`,activeLine:5,output:`проверить POSTGRES_* и volume`},{label:`port conflict`,activeLine:7,output:`сменить host port или остановить другой process`}]})]}),(0,x.jsxs)(l,{number:`06`,title:`Восстановление после четырёх намеренных ошибок`,children:[(0,x.jsx)(c,{children:`Финальная практика должна включать не только success. Воспроизведите неверный password, конфликт host port, сломанную migration и устаревший local volume с другой начальной конфигурацией.`}),(0,x.jsx)(n,{code:`POSTGRES_PASSWORD=new-password
        DATABASE_URL=postgresql+asyncpg://studyhub:new-password@db:5432/studyhub
        
        # postgres_data уже создан со старым password`,question:`Почему изменение POSTGRES_PASSWORD не меняет существующую роль?`,options:[`Init variables применяются при создании нового cluster, а volume уже содержит старый cluster`,`Compose не передаёт environment в db`,`Asyncpg всегда кеширует password навсегда`],correctIndex:0,explanation:`Существующий volume сохраняет созданные credentials; нужно использовать прежний password, изменить роль SQL-командой или выполнить осознанный reset.`,fix:`Согласовать действующий password или сделать backup → down -v → up на чистом volume`}),(0,x.jsx)(i,{children:`Не используйте down -v как универсальное лечение. Сначала установите, можно ли удалить local data, и при необходимости сделайте dump.`})]}),(0,x.jsxs)(l,{number:`07`,title:`README, reset и финальный smoke scenario`,children:[(0,x.jsx)(c,{children:`README завершает блок конкретными командами: quick start, status, logs, stop, reset и backup. Smoke scenario проверяет создание и чтение задачи, затем restart stack и повторное чтение той же записи.`}),(0,x.jsx)(u,{question:`Какой README помогает новому разработчику?`,left:{title:`Только одна команда`,code:`docker compose up`,note:`Не описаны config, health, migrations, stop и диагностика.`},right:{title:`Проверяемая процедура`,code:`cp .env.example .env
        docker compose up --build -d
        docker compose ps
        curl -f localhost:8000/ready`,note:`Есть подготовка, запуск и наблюдаемый критерий успеха.`},preferred:`right`,explanation:`Quick start обязан сообщать не только действие, но и способ доказать успешный результат.`}),(0,x.jsx)(g,{question:`Как доказать, что local stack действительно воспроизводим?`,hint:`Нужен внешний проверяющий сценарий, а не только запуск у автора.`,answer:(0,x.jsx)(`p`,{children:`Другой человек поднимает его из чистой директории по README, получает healthy services, выполняет API smoke scenario, перезапускает stack и сохраняет database data.`})})]}),(0,x.jsxs)(l,{number:`08`,title:`Контрольная точка: Deployable StudyHub local stack`,children:[(0,x.jsx)(c,{children:`Закрепите не команды сами по себе, а причинную модель: какой service запускается, какую dependency ожидает, где находится состояние и каким наблюдаемым сигналом подтверждается готовность.`}),(0,x.jsxs)(`div`,{className:`lesson-check-group`,children:[(0,x.jsx)(d,{question:`Какое состояние migrate является успешным?`,options:[`Exited (0)`,`Up forever`,`Unhealthy`],correctIndex:0,explanation:`One-shot migration service должен завершиться с code 0.`}),(0,x.jsx)(d,{question:`Что проверяют после docker compose up?`,options:[`ps, logs, health и smoke request`,`Только наличие compose.yaml`,`Только размер image`],correctIndex:0,explanation:`Воспроизводимость доказывается наблюдаемыми состояниями и сценарием API.`}),(0,x.jsx)(d,{question:`Когда допустим down -v?`,options:[`При осознанном reset после решения о данных и backup`,`При любой ошибке connection`,`При обычной остановке каждый вечер`],correctIndex:0,explanation:`Команда удаляет local database volume и должна быть явно разрушительной.`}),(0,x.jsx)(d,{question:`Что остаётся границей блока?`,options:[`Production deployment`,`Compose network`,`PostgreSQL healthcheck`],correctIndex:0,explanation:`Remote deployment и CI/CD изучаются в следующем блоке.`})]}),(0,x.jsx)(r,{points:[(0,x.jsx)(x.Fragment,{children:`Финальный stack разделяет db, migrate, api и redis.`}),(0,x.jsx)(x.Fragment,{children:`Одна команда запуска не отменяет подготовку .env и проверку результата.`}),(0,x.jsx)(x.Fragment,{children:`Migrate успешно завершается с exit code 0.`}),(0,x.jsx)(x.Fragment,{children:`Compose ps и service logs образуют первую линию диагностики.`}),(0,x.jsx)(x.Fragment,{children:`Quick start проверяется из чистой директории другим человеком.`}),(0,x.jsx)(x.Fragment,{children:`Reset с down -v требует осознанного решения и backup.`}),(0,x.jsx)(x.Fragment,{children:`Production deployment остаётся задачей следующего блока.`})]}),(0,x.jsx)(m,{text:`Проведите чистую проверку блока: скопируйте проект в новую директорию, создайте .env, поднимите stack одной командой, дождитесь healthy, выполните CRUD smoke scenario, перезапустите stack и подтвердите persistence. Затем воспроизведите один сбой и восстановите систему строго по runbook.`})]})]})}export{C as Lesson182};