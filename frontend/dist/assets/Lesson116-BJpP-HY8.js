import{t as e}from"./jsx-runtime-lw2jiZar.js";import{A as t,C as n,D as r,E as i,I as a,L as o,M as s,N as c,O as l,P as u,T as d,b as f,f as p,j as m,v as h,w as g,x as _}from"./shared-pB8LFUv2.js";import{t as v}from"./trophy-K5q5OZIy.js";import{k as y}from"./index-J3P0holD.js";import{t as b}from"./CodeEditor-BZlrvoTL.js";var x=e(),S=`Блок 20 · Остальные возможности FastAPI и Personal StudyHub`;function C({module:e}){return(0,x.jsxs)(c,{children:[(0,x.jsx)(s,{variant:`project`,chip:e??S,title:`Финальный проект 4: документация и защита`,intro:`Доведём Personal StudyHub до передаваемого результата: проверим чистый запуск, напишем точный README, оформим OpenAPI и env-примеры, проведём security-аудит и защитим архитектурные решения на живом сценарии.`,tags:[{icon:(0,x.jsx)(v,{size:14}),label:`релиз и защита`},{icon:(0,x.jsx)(y,{size:14}),label:`README и OpenAPI`}]}),(0,x.jsxs)(i,{tone:`info`,children:[(0,x.jsx)(`strong`,{children:`Связь с курсом.`}),` `,`Код и тесты уже проходят end-to-end. Последний урок не добавляет возможности, а доказывает воспроизводимость, безопасность и понимание всего пути запроса.`,` `,(0,x.jsx)(`strong`,{children:`Важно не перепутать:`}),` `,`Документация не маскирует незавершённый проект. README считается верным только после запуска по нему в чистой папке и совпадения описания с фактическим API.`]}),(0,x.jsxs)(`div`,{className:`lesson-route`,children:[(0,x.jsxs)(`ol`,{children:[(0,x.jsxs)(`li`,{children:[(0,x.jsx)(`strong`,{children:`Очистить окружение.`}),` `,`клонировать проект или использовать новую папку, создать venv и заполнить .env по примеру.`]}),(0,x.jsxs)(`li`,{children:[(0,x.jsx)(`strong`,{children:`Воспроизвести систему.`}),` `,`alembic upgrade head → запуск → tests → ручной smoke scenario.`]}),(0,x.jsxs)(`li`,{children:[(0,x.jsx)(`strong`,{children:`Описать результат.`}),` `,`README, OpenAPI examples, error contract, security decisions и known limitations.`]}),(0,x.jsxs)(`li`,{children:[(0,x.jsx)(`strong`,{children:`Защитить проект.`}),` `,`проследить запрос, объяснить решение и внести маленькое изменение под наблюдением.`]})]}),(0,x.jsx)(`p`,{children:`Маршрут занятия проходит от знакомой проблемы к проверяемому изменению сквозного проекта.`})]}),(0,x.jsxs)(o,{children:[(0,x.jsx)(a,{badge:`до`,title:`Состояние проекта`,code:`release candidate проходит тесты`,children:`release candidate проходит тесты`}),(0,x.jsx)(a,{badge:`+`,badgeTone:`float`,title:`Изменение урока`,code:`документация, аудит и защита`,children:`документация, аудит и защита`}),(0,x.jsx)(a,{badge:`после`,badgeTone:`str`,title:`Новый результат`,code:`этап 5 завершён объяснимым Personal StudyHub`,children:`этап 5 завершён объяснимым Personal StudyHub`})]}),(0,x.jsxs)(u,{number:`01`,title:`Готовый проект — это воспроизводимый проект`,children:[(0,x.jsx)(l,{children:`Фраза «у меня запускается» недостаточна. Другой разработчик должен получить репозиторий, выполнить конечный набор команд и увидеть ту же схему, API и тесты без устных подсказок.`}),(0,x.jsxs)(`div`,{className:`lesson-practice-steps`,children:[(0,x.jsx)(`h3`,{children:`Code`}),(0,x.jsx)(`p`,{children:`реализует согласованный scope без placeholder и debug-обходов.`}),(0,x.jsx)(`h3`,{children:`Automation`}),(0,x.jsx)(`p`,{children:`migrations и tests повторяют состояние системы.`}),(0,x.jsx)(`h3`,{children:`Explanation`}),(0,x.jsx)(`p`,{children:`README и защита объясняют запуск, ограничения и ключевые решения.`})]}),(0,x.jsx)(b,{caption:`семь условий воспроизводимости`,code:`reproducible_release = (
    clean_clone
    and documented_environment
    and alembic_upgrade_head
    and application_starts
    and tests_pass
    and manual_smoke_passes
    and no_secrets_in_git
)

print(reproducible_release)`}),(0,x.jsxs)(o,{children:[(0,x.jsx)(a,{badge:`run`,title:`Чистый запуск`,code:`venv -> env -> migrate -> uvicorn`,children:`Команды README проверены на новой копии проекта.`}),(0,x.jsx)(a,{badge:`test`,badgeTone:`float`,title:`Повторяемая проверка`,code:`python -m pytest -q`,children:`Негативные auth и ownership сценарии не требуют ручной настройки.`}),(0,x.jsx)(a,{badge:`explain`,badgeTone:`str`,title:`Осознанная защита`,code:`request -> dependency -> service -> DB`,children:`Автор может проследить данные и назвать причину решения.`})]}),(0,x.jsx)(i,{tone:`info`,children:`Не добавляйте новую функцию в день защиты. Незакрытый scope лучше честно записать как limitation, чем скрыть нестабильной реализацией.`})]}),(0,x.jsxs)(u,{number:`02`,title:`README как инструкция с нулевого состояния`,children:[(0,x.jsx)(l,{children:`README пишется для человека без контекста. Он объясняет назначение, стек, требования, установку, конфигурацию, миграции, запуск, тесты, основные маршруты и известные ограничения.`}),(0,x.jsxs)(`div`,{className:`lesson-practice-steps`,children:[(0,x.jsx)(`h3`,{children:`До запуска`}),(0,x.jsx)(`p`,{children:`версия Python, создание venv, установка зависимостей и .env.`}),(0,x.jsx)(`h3`,{children:`Запуск`}),(0,x.jsx)(`p`,{children:`migration command, uvicorn и адрес документации.`}),(0,x.jsx)(`h3`,{children:`Проверка`}),(0,x.jsx)(`p`,{children:`pytest, тестовая база и короткий ручной сценарий.`})]}),(0,x.jsx)(b,{caption:`минимальный каркас README`,code:`# Personal StudyHub API

## Requirements
- Python 3.10+
- SQLite

## Local setup
python -m venv .venv
python -m pip install -r requirements.txt
cp .env.example .env
alembic upgrade head
uvicorn app.main:app --reload

## Tests
python -m pytest -q

## Documentation
http://127.0.0.1:8000/docs`}),(0,x.jsx)(t,{rows:[[(0,x.jsx)(x.Fragment,{children:`Project goal`}),`что решает Personal StudyHub и для кого`],[(0,x.jsx)(x.Fragment,{children:`Setup`}),`команды от чистого клона до первого ответа`],[(0,x.jsx)(x.Fragment,{children:`Configuration`}),`таблица env-переменных без реальных секретов`],[(0,x.jsx)(x.Fragment,{children:`API flows`}),`registration, session, JWT, refresh и ownership`],[(0,x.jsx)(x.Fragment,{children:`Known limitations`}),`честные границы учебного релиза`]]}),(0,x.jsx)(i,{tone:`info`,children:`README не должен содержать настоящий JWT secret, API key или рабочий пароль. .env.example показывает только имена и безопасные шаблонные значения.`})]}),(0,x.jsxs)(u,{number:`03`,title:`.env.example, секреты и репозиторий`,children:[(0,x.jsx)(l,{children:`Файл .env.example является контрактом конфигурации, а .env — локальным секретным состоянием. Перед релизом история Git проверяется на случайно добавленные credentials и файлы базы.`}),(0,x.jsxs)(`div`,{className:`lesson-practice-steps`,children:[(0,x.jsx)(`h3`,{children:`.env.example`}),(0,x.jsx)(`p`,{children:`коммитится и перечисляет обязательные переменные.`}),(0,x.jsx)(`h3`,{children:`.env`}),(0,x.jsx)(`p`,{children:`игнорируется и содержит реальные development secrets.`}),(0,x.jsx)(`h3`,{children:`.gitignore`}),(0,x.jsx)(`p`,{children:`исключает venv, caches, .env, SQLite runtime files и upload directory.`})]}),(0,x.jsx)(b,{caption:`публичный шаблон и приватное состояние`,code:`# .env.example
DATABASE_URL=sqlite:///./studyhub.db
JWT_SECRET=replace-with-random-secret
IMPORT_API_KEY=replace-with-random-key
COOKIE_SECURE=false

# .gitignore
.venv/
__pycache__/
.pytest_cache/
.env
*.db
uploads/`}),(0,x.jsx)(n,{code:`JWT_SECRET=prod-secret-123
IMPORT_API_KEY=real-import-key

# git status
new file: .env`,question:`Что нужно сделать до публикации?`,options:[`убрать .env из коммита и заменить уже раскрытые секреты`,`переименовать .env в secrets.txt и коммитить`,`добавить значения в README`],correctIndex:0,explanation:`Секрет, попавший в историю или отправленный наружу, считается раскрытым и требует rotation.`,fix:`# .gitignore
.env

# .env.example содержит только безопасные placeholders`}),(0,x.jsx)(i,{tone:`info`,children:`Удаление строки из последнего коммита не отменяет утечку, если секрет уже был опубликован. Его нужно заменить у источника доверия.`})]}),(0,x.jsxs)(u,{number:`04`,title:`OpenAPI, примеры и ручной smoke flow`,children:[(0,x.jsx)(l,{children:`Swagger UI полезен только когда схемы, descriptions и status codes совпадают с реальностью. Финальная ручная проверка проходит один полный пользовательский путь и фиксирует ожидаемые ответы.`}),(0,x.jsxs)(`div`,{className:`lesson-practice-steps`,children:[(0,x.jsx)(`h3`,{children:`Contract`}),(0,x.jsx)(`p`,{children:`response_model, documented errors и security schemes видны в OpenAPI.`}),(0,x.jsx)(`h3`,{children:`Examples`}),(0,x.jsx)(`p`,{children:`показывают безопасные request/response данные без секретов.`}),(0,x.jsx)(`h3`,{children:`Smoke flow`}),(0,x.jsx)(`p`,{children:`register → login → create task → read profile → upload → logout.`})]}),(0,x.jsx)(b,{caption:`ручной сценарий защиты`,code:`smoke_flow = [
    "POST /auth/register -> 201",
    "POST /auth/token -> 200 access + refresh",
    "POST /tasks -> 201",
    "GET /tasks -> 200 only own tasks",
    "POST /tasks/{id}/attachments -> 201",
    "POST /auth/refresh -> 200 rotated pair",
    "reuse old refresh -> 401",
    "POST /auth/token/logout -> 204",
]

for step in smoke_flow:
    print(step)`}),(0,x.jsx)(g,{title:`Соберите демонстрацию проекта`,prompt:`Расположите шаги так, чтобы аудитория увидела полный пользовательский путь.`,pieces:[{id:`clean`,code:`показать чистую базу и alembic upgrade head`},{id:`register`,code:`зарегистрировать пользователя`},{id:`login`,code:`получить access/refresh или session cookie`},{id:`task`,code:`создать и прочитать свою задачу`},{id:`negative`,code:`доказать отказ чужому пользователю или reuse token`},{id:`tests`,code:`запустить pytest`},{id:`random`,code:`открыть случайный файл без объяснения`,note:`не показывает сценарий`}],correctOrder:[`clean`,`register`,`login`,`task`,`negative`,`tests`],explanation:`Защита идёт от воспроизводимости к положительному и отрицательному поведению.`}),(0,x.jsx)(i,{tone:`info`,children:`Ручная демонстрация не заменяет tests. Она подтверждает, что автор умеет объяснить уже автоматизированный контракт.`})]}),(0,x.jsxs)(u,{number:`05`,title:`Security-аудит перед релизом`,children:[(0,x.jsx)(l,{children:`Финальный аудит проходит по поверхностям атаки, уже изученным в этапе 5. Для каждого пункта нужна ссылка на код или тест, а не ответ «должно работать».`}),(0,x.jsxs)(`div`,{className:`lesson-practice-steps`,children:[(0,x.jsx)(`h3`,{children:`Credentials`}),(0,x.jsx)(`p`,{children:`password hashes, HttpOnly cookie, short access, refresh rotation и API key из env.`}),(0,x.jsx)(`h3`,{children:`Authorization`}),(0,x.jsx)(`p`,{children:`ownership, admin 403 и отсутствие доверия к user_id из body.`}),(0,x.jsx)(`h3`,{children:`Input`}),(0,x.jsx)(`p`,{children:`Pydantic validation, upload size/type/name и единые безопасные ошибки.`})]}),(0,x.jsx)(b,{caption:`контрольные security-инварианты`,code:`security_checklist = {
    "passwords": "specialized hashing + no hash in responses",
    "sessions": "random id + hash at rest + expiry + revoke",
    "jwt": "signature + exp + type + short access",
    "refresh": "rotation + old-token rejection",
    "ownership": "task id + current user id",
    "admin": "explicit permission dependency",
    "upload": "size + allowlist + generated name",
    "secrets": "environment + no logs + no git",
}`}),(0,x.jsx)(p,{cards:[{front:(0,x.jsx)(`strong`,{children:`Пароль`}),back:(0,x.jsx)(`span`,{children:`Хешируется специализированной библиотекой и никогда не возвращается.`})},{front:(0,x.jsx)(`strong`,{children:`Cookie-session`}),back:(0,x.jsx)(`span`,{children:`HttpOnly credential связан с отзывной записью на сервере.`})},{front:(0,x.jsx)(`strong`,{children:`Refresh token`}),back:(0,x.jsx)(`span`,{children:`Rotation отзывает старую запись и выдаёт новую пару.`})},{front:(0,x.jsx)(`strong`,{children:`Ownership`}),back:(0,x.jsx)(`span`,{children:`Поиск ресурса включает current_user.id.`})},{front:(0,x.jsx)(`strong`,{children:`Upload`}),back:(0,x.jsx)(`span`,{children:`Сервер ограничивает размер и сам выбирает storage_name.`})},{front:(0,x.jsx)(`strong`,{children:`API key`}),back:(0,x.jsx)(`span`,{children:`Хранится в environment и не попадает в URL или логи.`})}]}),(0,x.jsx)(i,{tone:`info`,children:`Учебный аудит не заменяет профессиональный penetration test, но доказывает, что базовые риски не игнорируются.`})]}),(0,x.jsxs)(u,{number:`06`,title:`Как объяснить путь одного запроса`,children:[(0,x.jsx)(l,{children:`На защите важно не перечислять файлы, а проследить конкретный запрос. Хороший ответ показывает данные, проверки, транзакцию, response schema и возможные отказы.`}),(0,x.jsxs)(`div`,{className:`lesson-practice-steps`,children:[(0,x.jsx)(`h3`,{children:`Вход`}),(0,x.jsx)(`p`,{children:`Authorization header и TaskPatch проходят parsing и Pydantic validation.`}),(0,x.jsx)(`h3`,{children:`Контекст`}),(0,x.jsx)(`p`,{children:`get_db и get_current_user выполняются до endpoint.`}),(0,x.jsx)(`h3`,{children:`Сценарий`}),(0,x.jsx)(`p`,{children:`service ищет owned task, меняет разрешённые поля, commit и возвращает ORM object.`})]}),(0,x.jsx)(b,{caption:`путь PATCH-запроса`,code:`PATCH /tasks/42
Authorization: Bearer <access>
{"priority": 5}

client
  -> router + Pydantic
  -> get_db
  -> bearer dependency
  -> token decode
  -> load active user
  -> task service
  -> SELECT id=42 AND user_id=current_user.id
  -> update + commit + refresh
  -> TaskRead
  -> 200 JSON`}),(0,x.jsx)(h,{code:`payload = validate_body(request)
user = get_current_user(request)
task = get_owned_task(db, task_id, user.id)
apply_patch(task, payload)
db.commit()
db.refresh(task)
return TaskRead.model_validate(task)`,steps:[{line:0,note:`Pydantic отделяет невалидное тело до бизнес-логики.`,vars:{payload:`TaskPatch`}},{line:1,note:`Credential превращается в активного User.`,vars:{user:`current user`}},{line:2,note:`Ownership входит в запрос к базе.`,vars:{filter:`task_id + user.id`}},{line:3,note:`Меняются только разрешённые поля.`,vars:{task:`dirty ORM object`}},{line:4,note:`Commit фиксирует транзакцию.`,vars:{transaction:`committed`}},{line:6,note:`Response schema формирует безопасный JSON.`,vars:{status:`200`}}]}),(0,x.jsx)(i,{tone:`info`,children:`Если автор не может объяснить, где возникает 401, 404 или rollback, соответствующая часть проекта ещё не считается усвоенной.`})]}),(0,x.jsxs)(u,{number:`07`,title:`Живое изменение без разрушения проекта`,children:[(0,x.jsx)(l,{children:`Последняя часть защиты проверяет не память, а способность найти ответственное место. Наставник даёт маленькое изменение: новый filter, дополнительное разрешение или новый лимит upload.`}),(0,x.jsxs)(`div`,{className:`lesson-practice-steps`,children:[(0,x.jsx)(`h3`,{children:`Найти контракт`}),(0,x.jsx)(`p`,{children:`определить route, schema, service и тест, которых касается изменение.`}),(0,x.jsx)(`h3`,{children:`Сделать минимально`}),(0,x.jsx)(`p`,{children:`не переписывать auth flow и соседние модули.`}),(0,x.jsx)(`h3`,{children:`Проверить регрессию`}),(0,x.jsx)(`p`,{children:`новый тест плюс полный существующий набор.`})]}),(0,x.jsx)(b,{caption:`пример задачи на защите`,code:`change_request = "Admin can deactivate a user"

affected_surface = [
    "PATCH /admin/users/{user_id}/deactivate",
    "require_admin dependency",
    "user service deactivate operation",
    "UserRead response",
    "tests: admin success + user 403 + inactive login 401",
]`}),(0,x.jsx)(d,{question:`Как безопаснее внести изменение?`,left:{title:`Править всё сразу`,code:`router + auth rewrite + models rename + tests later`,note:`Большой diff скрывает причину ошибки.`},right:{title:`Один контракт`,code:`schema -> service -> route -> focused tests -> full suite`,note:`Изменение ограничено конкретным сценарием.`},preferred:`right`,explanation:`Минимальный вертикальный срез сохраняет существующее поведение и облегчает ревью.`}),(0,x.jsx)(i,{tone:`info`,children:`Изменение считается завершённым после обновления README/OpenAPI, если внешний контракт действительно изменился.`})]}),(0,x.jsxs)(u,{number:`08`,title:`Финальная контрольная точка этапа 5`,children:[(0,x.jsx)(l,{children:`Ученик завершает этап не списком терминов, а защищённым Personal StudyHub API. Проект запускается с нуля, проходит тесты и остаётся понятным без наставника рядом.`}),(0,x.jsxs)(`div`,{className:`lesson-practice-steps`,children:[(0,x.jsx)(`h3`,{children:`Техническая готовность`}),(0,x.jsx)(`p`,{children:`migrations, auth flows, CRUD, rights, uploads и tests работают.`}),(0,x.jsx)(`h3`,{children:`Объяснение`}),(0,x.jsx)(`p`,{children:`различаются identity, authentication, authorization, session, JWT и API key.`}),(0,x.jsx)(`h3`,{children:`Передача`}),(0,x.jsx)(`p`,{children:`README, .env.example, OpenAPI и known limitations совпадают с кодом.`})]}),(0,x.jsx)(b,{caption:`готовность этапа 5`,code:`final_gate = {
    "clean_setup": True,
    "migrations": True,
    "session_auth": True,
    "jwt_refresh_rotation": True,
    "ownership_and_admin": True,
    "safe_upload": True,
    "error_contract": True,
    "isolated_tests": True,
    "readme_verified": True,
    "defense_passed": True,
}

print(all(final_gate.values()))`}),(0,x.jsx)(_,{question:`Какой главный результат этапа 5?`,hint:`Не количество auth-механизмов, а законченный продукт.`,answer:(0,x.jsx)(`p`,{children:`Воспроизводимый Personal StudyHub API с пользователями, session и JWT flow, refresh rotation, ownership, admin permission, безопасным upload, едиными ошибками, миграциями, изолированными тестами и объяснимой архитектурой.`})}),(0,x.jsx)(i,{tone:`info`,children:`Следующий этап может вводить новые технологии только после сохранения этой базы качества. Завершённый монолит важнее набора незакреплённых инструментов.`}),(0,x.jsxs)(`div`,{className:`lesson-check-group`,children:[(0,x.jsx)(f,{question:`Что доказывает чистый запуск?`,options:[`проект воспроизводим без скрытого локального состояния`,`код содержит больше файлов`,`Swagger открыт в браузере`],correctIndex:0,explanation:`Новая копия должна пройти setup, migrations, run и tests по документации.`}),(0,x.jsx)(f,{question:`Что хранится в .env.example?`,options:[`имена переменных и безопасные шаблоны`,`реальные production secrets`,`пароли пользователей`],correctIndex:0,explanation:`Пример конфигурации коммитится без действительных credential.`}),(0,x.jsx)(f,{question:`Что нужно уметь на защите?`,options:[`проследить конкретный запрос и объяснить отказы`,`только перечислить библиотеки`,`показать число строк`],correctIndex:0,explanation:`Понимание видно по пути данных и причинам решений.`}),(0,x.jsx)(f,{question:`Когда изменение готово?`,options:[`после focused test, full suite и обновления контракта`,`сразу после правки router`,`после нового названия ветки`],correctIndex:0,explanation:`Проверка регрессии и документация завершают изменение.`})]}),(0,x.jsx)(r,{points:[(0,x.jsx)(x.Fragment,{children:`Завершённый проект воспроизводится с чистого клона.`}),(0,x.jsx)(x.Fragment,{children:`README описывает фактические setup, migrations, run и tests.`}),(0,x.jsx)(x.Fragment,{children:`.env.example коммитится, реальные secrets — нет.`}),(0,x.jsx)(x.Fragment,{children:`OpenAPI и ручной smoke flow должны совпадать с реализацией.`}),(0,x.jsx)(x.Fragment,{children:`Security-аудит ссылается на код и негативные тесты.`}),(0,x.jsx)(x.Fragment,{children:`Защита прослеживает один запрос через все слои.`}),(0,x.jsx)(x.Fragment,{children:`Живое изменение выполняется минимальным вертикальным срезом.`}),(0,x.jsx)(x.Fragment,{children:`Known limitations указываются честно.`}),(0,x.jsx)(x.Fragment,{children:`Этап 5 завершается Personal StudyHub API, а не набором фрагментов.`})]}),(0,x.jsx)(m,{text:`Проведите clean-room запуск, завершите README и .env.example, проверьте OpenAPI и security checklist, выполните smoke flow, запустите tests дважды и проведите защиту с объяснением PATCH /tasks/{task_id}.`})]})]})}export{C as Lesson116};