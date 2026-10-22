import{t as e}from"./jsx-runtime-lw2jiZar.js";import{C as t,D as n,E as r,I as i,L as a,M as o,N as s,O as c,P as l,T as u,_ as d,b as f,g as p,h as m,j as h,p as g,w as _}from"./shared-DoR5oW6-.js";import{t as v}from"./key-round-D-Q1K68g.js";import{O as y}from"./index-ChLJS9_n.js";import{t as b}from"./CodeEditor-BZlrvoTL.js";var x=e(),S=`Блок 20 · Остальные возможности FastAPI и Personal StudyHub`;function C({module:e}){return(0,x.jsxs)(s,{children:[(0,x.jsx)(o,{variant:`project`,chip:e??S,title:`HTTP Basic и API key`,intro:`Сравним два простых способа доступа без смешения ролей: HTTP Basic подтвердит человека парой логин/пароль, а X-API-Key защитит служебный импорт постоянным секретом интеграции.`,tags:[{icon:(0,x.jsx)(v,{size:14}),label:`Basic credentials`},{icon:(0,x.jsx)(y,{size:14}),label:`X-API-Key`}]}),(0,x.jsxs)(r,{tone:`info`,children:[(0,x.jsx)(`strong`,{children:`Связь с курсом.`}),` `,`Пользовательские session и JWT уже работают. Теперь важно увидеть, что FastAPI поддерживает и более простые схемы, но каждая отвечает на другой вопрос.`,` `,(0,x.jsx)(`strong`,{children:`Важно не перепутать:`}),` `,`Basic и API key не заменяют полноценную пользовательскую авторизацию автоматически. Basic передаёт credentials при каждом запросе, а API key обычно идентифицирует сервис или интеграцию.`]}),(0,x.jsxs)(`div`,{className:`lesson-route`,children:[(0,x.jsxs)(`ol`,{children:[(0,x.jsxs)(`li`,{children:[(0,x.jsx)(`strong`,{children:`Разделить роли.`}),` `,`человек входит по credentials, служебный клиент предъявляет заранее выданный ключ.`]}),(0,x.jsxs)(`li`,{children:[(0,x.jsx)(`strong`,{children:`Построить dependency.`}),` `,`извлечь credential из стандартного места и сравнить безопасным способом.`]}),(0,x.jsxs)(`li`,{children:[(0,x.jsx)(`strong`,{children:`Защитить сценарий.`}),` `,`подключить X-API-Key только к endpoint импорта и проверить негативные случаи.`]}),(0,x.jsxs)(`li`,{children:[(0,x.jsx)(`strong`,{children:`Объяснить границу.`}),` `,`не хранить ключ в query string и не считать Base64 шифрованием.`]})]}),(0,x.jsx)(`p`,{children:`Маршрут занятия проходит от знакомой проблемы к проверяемому изменению сквозного проекта.`})]}),(0,x.jsxs)(a,{children:[(0,x.jsx)(i,{badge:`до`,title:`Состояние проекта`,code:`session и JWT защищают пользователей`,children:`session и JWT защищают пользователей`}),(0,x.jsx)(i,{badge:`+`,badgeTone:`float`,title:`Изменение урока`,code:`Basic-пример и служебный X-API-Key`,children:`Basic-пример и служебный X-API-Key`}),(0,x.jsx)(i,{badge:`после`,badgeTone:`str`,title:`Новый результат`,code:`разные схемы доступа не смешаны`,children:`разные схемы доступа не смешаны`})]}),(0,x.jsxs)(l,{number:`01`,title:`Два механизма — две разные задачи`,children:[(0,x.jsx)(c,{children:`В Personal StudyHub уже есть пользовательские cookie-session и JWT. HTTP Basic и API key добавляются не как «ещё два логина», а как отдельные инструменты для ограниченных сценариев.`}),(0,x.jsxs)(`div`,{className:`lesson-practice-steps`,children:[(0,x.jsx)(`h3`,{children:`HTTP Basic`}),(0,x.jsx)(`p`,{children:`клиент отправляет имя и пароль в заголовке Authorization при каждом запросе.`}),(0,x.jsx)(`h3`,{children:`API key`}),(0,x.jsx)(`p`,{children:`клиент предъявляет заранее выданный секрет интеграции, например для импорта данных.`}),(0,x.jsx)(`h3`,{children:`Главный вопрос`}),(0,x.jsx)(`p`,{children:`кого или что мы идентифицируем: пользователя, устройство, скрипт или внешний сервис.`})]}),(0,x.jsx)(b,{caption:`два независимых контракта доступа`,code:`# Пользовательский сценарий
GET /basic/profile
Authorization: Basic <base64(username:password)>

# Служебный сценарий
POST /integrations/import
X-API-Key: <service-secret>`}),(0,x.jsxs)(a,{children:[(0,x.jsx)(i,{badge:`Basic`,title:`Человек предъявляет credentials`,code:`Authorization: Basic ...`,children:`Сервер получает username и password и проверяет их как обычные учётные данные.`}),(0,x.jsx)(i,{badge:`API key`,badgeTone:`float`,title:`Интеграция предъявляет секрет`,code:`X-API-Key: ...`,children:`Ключ обычно связан со служебным клиентом, а не с интерактивной формой входа пользователя.`}),(0,x.jsx)(i,{badge:`Session/JWT`,badgeTone:`str`,title:`Основной вход StudyHub`,code:`Cookie или Bearer`,children:`Уже изученные механизмы остаются основой защищённого CRUD пользователей.`})]}),(0,x.jsx)(r,{tone:`info`,children:`Сначала назовите субъект доступа и срок жизни credential. Только после этого выбирайте конкретную схему.`})]}),(0,x.jsxs)(l,{number:`02`,title:`Что реально передаёт HTTP Basic`,children:[(0,x.jsx)(c,{children:`Basic складывает username и password в строку, кодирует её Base64 и помещает в Authorization. Base64 позволяет передать байты текстом, но не скрывает содержимое от перехвата.`}),(0,x.jsxs)(`div`,{className:`lesson-practice-steps`,children:[(0,x.jsx)(`h3`,{children:`Формат`}),(0,x.jsx)(`p`,{children:`Authorization: Basic <credentials>.`}),(0,x.jsx)(`h3`,{children:`Base64`}),(0,x.jsx)(`p`,{children:`это кодирование, которое легко обратимо без секретного ключа.`}),(0,x.jsx)(`h3`,{children:`Защита канала`}),(0,x.jsx)(`p`,{children:`Basic допустим только поверх HTTPS, иначе пароль можно прочитать из трафика.`})]}),(0,x.jsx)(b,{caption:`Base64 можно обратить`,code:`import base64

raw = b"mentor:correct-horse"
encoded = base64.b64encode(raw).decode("ascii")
decoded = base64.b64decode(encoded).decode("utf-8")

print(encoded)
print(decoded)`}),(0,x.jsx)(d,{code:`import base64

value = base64.b64encode(b"nikita:secret").decode("ascii")
print(base64.b64decode(value).decode("utf-8"))`,output:`nikita:secret`,hint:`Кодирование не использует секретный ключ и потому не является шифрованием.`}),(0,x.jsx)(r,{tone:`info`,children:`В учебном локальном запуске можно увидеть механику, но реальный Basic endpoint нельзя публиковать без HTTPS.`})]}),(0,x.jsxs)(l,{number:`03`,title:`HTTPBasicCredentials и безопасное сравнение`,children:[(0,x.jsx)(c,{children:`FastAPI извлекает пару через HTTPBasic. Dependency получает объект HTTPBasicCredentials, затем приложение само решает, где и как проверить пользователя.`}),(0,x.jsxs)(`div`,{className:`lesson-practice-steps`,children:[(0,x.jsx)(`h3`,{children:`Извлечение`}),(0,x.jsx)(`p`,{children:`HTTPBasic читает стандартный заголовок и разбирает credentials.`}),(0,x.jsx)(`h3`,{children:`Проверка`}),(0,x.jsx)(`p`,{children:`username и password сравниваются с ожидаемыми значениями или через auth service.`}),(0,x.jsx)(`h3`,{children:`Ответ`}),(0,x.jsx)(`p`,{children:`при ошибке возвращается 401 и заголовок WWW-Authenticate: Basic.`})]}),(0,x.jsx)(b,{caption:`dependency для учебного Basic endpoint`,code:`import secrets
from typing import Annotated

from fastapi import Depends, FastAPI, HTTPException, status
from fastapi.security import HTTPBasic, HTTPBasicCredentials

app = FastAPI()
basic = HTTPBasic()


def require_basic_user(
    credentials: Annotated[HTTPBasicCredentials, Depends(basic)],
) -> str:
    username_ok = secrets.compare_digest(credentials.username, "mentor")
    password_ok = secrets.compare_digest(credentials.password, "studyhub")
    if not (username_ok and password_ok):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid basic credentials",
            headers={"WWW-Authenticate": "Basic"},
        )
    return credentials.username`}),(0,x.jsx)(_,{title:`Соберите путь Basic-запроса`,prompt:`Расположите действия от входящего запроса до выполнения endpoint.`,pieces:[{id:`header`,code:`прочитать Authorization`},{id:`decode`,code:`разобрать Basic credentials`},{id:`compare`,code:`сравнить username и password`},{id:`reject`,code:`при ошибке вернуть 401 + WWW-Authenticate`},{id:`endpoint`,code:`передать username в endpoint`},{id:`store`,code:`сохранить открытый пароль в базе`,note:`опасное лишнее действие`}],correctOrder:[`header`,`decode`,`compare`,`reject`,`endpoint`],explanation:`Security dependency отвечает за извлечение и проверку, а endpoint получает уже подтверждённое имя.`}),(0,x.jsx)(r,{tone:`info`,children:`В реальном проекте открытый пароль не сравнивают с константой: используется существующий password service с хешем.`})]}),(0,x.jsxs)(l,{number:`04`,title:`API key в заголовке X-API-Key`,children:[(0,x.jsx)(c,{children:`Служебный импорт не требует пользовательского профиля. Ему нужен отдельный секрет интеграции, который удобно читать через APIKeyHeader и проверять в dependency.`}),(0,x.jsxs)(`div`,{className:`lesson-practice-steps`,children:[(0,x.jsx)(`h3`,{children:`Имя заголовка`}),(0,x.jsx)(`p`,{children:`X-API-Key становится частью публичного контракта интеграции.`}),(0,x.jsx)(`h3`,{children:`auto_error=False`}),(0,x.jsx)(`p`,{children:`позволяет сформировать собственный единый ответ при отсутствии ключа.`}),(0,x.jsx)(`h3`,{children:`Настройки`}),(0,x.jsx)(`p`,{children:`эталонный ключ приходит из окружения, а не записывается в исходный код.`})]}),(0,x.jsx)(b,{caption:`dependency служебного ключа`,code:`import secrets
from typing import Annotated

from fastapi import Depends, HTTPException, status
from fastapi.security import APIKeyHeader

api_key_header = APIKeyHeader(name="X-API-Key", auto_error=False)


def require_import_key(
    api_key: Annotated[str | None, Depends(api_key_header)],
) -> None:
    if api_key is None or not secrets.compare_digest(
        api_key,
        settings.import_api_key,
    ):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid API key",
        )`}),(0,x.jsx)(p,{prompt:`Укажите имя заголовка, которое увидит клиент интеграции.`,before:`APIKeyHeader(name="`,after:`", auto_error=False)`,options:[`X-API-Key`,`password`,`api_key_query`],answer:`X-API-Key`,explanation:`Клиент передаёт ключ в выделенном HTTP-заголовке.`}),(0,x.jsx)(r,{tone:`info`,children:`Dependency возвращает None: после успешной проверки endpoint не обязан получать сам секрет и случайно логировать его.`})]}),(0,x.jsxs)(l,{number:`05`,title:`Почему query-параметр хуже заголовка`,children:[(0,x.jsx)(c,{children:`Ключ в URL технически возможен, но URL чаще попадает в историю браузера, reverse-proxy логи, аналитику и referrer. Заголовок не решает все проблемы, но лучше выражает credential.`}),(0,x.jsxs)(`div`,{className:`lesson-practice-steps`,children:[(0,x.jsx)(`h3`,{children:`Query`}),(0,x.jsx)(`p`,{children:`виден прямо в адресе и часто сохраняется инфраструктурой целиком.`}),(0,x.jsx)(`h3`,{children:`Header`}),(0,x.jsx)(`p`,{children:`отделяет служебный credential от адреса ресурса.`}),(0,x.jsx)(`h3`,{children:`Всегда`}),(0,x.jsx)(`p`,{children:`секрет нельзя печатать, коммитить и возвращать в тексте ошибки.`})]}),(0,x.jsx)(b,{caption:`URL против credential-заголовка`,code:`# Плохой публичный контракт
POST /integrations/import?api_key=top-secret

# Предпочтительный контракт
POST /integrations/import
X-API-Key: top-secret`}),(0,x.jsx)(u,{question:`Как передать постоянный служебный секрет импортёра?`,left:{title:`Ключ в URL`,code:`POST /import?api_key=secret`,note:`Может оказаться в истории, логах и аналитике URL.`},right:{title:`Ключ в заголовке`,code:`X-API-Key: secret`,note:`Credential отделён от пути и query-параметров ресурса.`},preferred:`right`,explanation:`Для API key заголовок лучше выражает назначение и снижает число случайных утечек через URL.`}),(0,x.jsx)(r,{tone:`info`,children:`Даже правильный заголовок требует HTTPS, безопасного хранения, ротации и запрета на логирование значения.`})]}),(0,x.jsxs)(l,{number:`06`,title:`Защищаем endpoint импорта StudyHub`,children:[(0,x.jsx)(c,{children:`Endpoint принимает подготовленный набор задач от доверенного служебного клиента. API key проверяется до чтения и изменения базы, а бизнес-операция остаётся в сервисе импорта.`}),(0,x.jsxs)(`div`,{className:`lesson-practice-steps`,children:[(0,x.jsx)(`h3`,{children:`До endpoint`}),(0,x.jsx)(`p`,{children:`Depends(require_import_key) останавливает запрос без доверенного ключа.`}),(0,x.jsx)(`h3`,{children:`В endpoint`}),(0,x.jsx)(`p`,{children:`валидированная схема передаётся import service.`}),(0,x.jsx)(`h3`,{children:`В сервисе`}),(0,x.jsx)(`p`,{children:`транзакция создаёт записи или откатывается как единая операция.`})]}),(0,x.jsx)(b,{caption:`endpoint связывает security и import service`,code:`from typing import Annotated

from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

router = APIRouter(prefix="/integrations", tags=["integrations"])


@router.post(
    "/tasks/import",
    status_code=status.HTTP_201_CREATED,
    dependencies=[Depends(require_import_key)],
)
def import_tasks(
    payload: TaskImportRequest,
    db: Annotated[Session, Depends(get_db)],
) -> ImportResult:
    return import_service.import_tasks(db, payload.items)`}),(0,x.jsx)(m,{code:`key = request.headers.get("X-API-Key")
if key is None:
    return "401 missing"
elif not key_is_valid(key):
    return "401 invalid"
else:
    return "run import"`,scenarios:[{label:`заголовка нет`,activeLine:2,output:`401 missing`},{label:`ключ неверный`,activeLine:4,output:`401 invalid`},{label:`ключ верный`,activeLine:6,output:`run import`}]}),(0,x.jsx)(r,{tone:`info`,children:`Использование dependencies=[...] подходит, когда результат dependency не нужен среди параметров endpoint.`})]}),(0,x.jsxs)(l,{number:`07`,title:`Негативные сценарии и ротация ключа`,children:[(0,x.jsx)(c,{children:`Схема считается законченной, когда проверены отсутствие credential, неправильное значение, старый ключ после ротации и корректный доступ. Секрет должен меняться без правки исходного кода.`}),(0,x.jsxs)(`div`,{className:`lesson-practice-steps`,children:[(0,x.jsx)(`h3`,{children:`Missing`}),(0,x.jsx)(`p`,{children:`клиент получает одинаково оформленный отказ и операция не начинается.`}),(0,x.jsx)(`h3`,{children:`Invalid`}),(0,x.jsx)(`p`,{children:`ответ не сообщает, какая часть ключа совпала или какой ключ ожидался.`}),(0,x.jsx)(`h3`,{children:`Rotated`}),(0,x.jsx)(`p`,{children:`новое значение берётся из окружения после контролируемого перезапуска.`})]}),(0,x.jsx)(b,{caption:`два обязательных интеграционных теста`,code:`from fastapi.testclient import TestClient


def test_import_rejects_missing_api_key(client: TestClient) -> None:
    response = client.post("/integrations/tasks/import", json={"items": []})
    assert response.status_code == 401


def test_import_accepts_valid_api_key(client: TestClient) -> None:
    response = client.post(
        "/integrations/tasks/import",
        headers={"X-API-Key": "test-key"},
        json={"items": []},
    )
    assert response.status_code == 201`}),(0,x.jsx)(t,{code:`logger.info("import key=%s", api_key)
if api_key != settings.import_api_key:
    raise HTTPException(401, detail=f"Expected {settings.import_api_key}")`,question:`Какая ошибка опаснее всего?`,options:[`Секрет попадает и в лог, и в HTTP-ответ`,`Используется status code 401`,`Dependency получает строку`],correctIndex:0,explanation:`Credential нельзя выводить ни в логи, ни в detail ошибки.`,fix:`if not secrets.compare_digest(api_key, settings.import_api_key):
    raise HTTPException(status_code=401, detail="Invalid API key")`}),(0,x.jsx)(r,{tone:`info`,children:`Логи могут содержать имя интеграции, request id и результат импорта, но не сам ключ.`})]}),(0,x.jsxs)(l,{number:`08`,title:`Контрольная точка: выбрать схему осознанно`,children:[(0,x.jsx)(c,{children:`Закрепите различие на трёх клиентах: браузерный пользователь, внутренний импортёр и учебный диагностический endpoint. У каждого должен быть свой минимальный credential.`}),(0,x.jsxs)(`div`,{className:`lesson-practice-steps`,children:[(0,x.jsx)(`h3`,{children:`Пользователь`}),(0,x.jsx)(`p`,{children:`session или JWT связывает запросы с User и правами.`}),(0,x.jsx)(`h3`,{children:`Импортёр`}),(0,x.jsx)(`p`,{children:`X-API-Key подтверждает доверенную интеграцию без пользовательской сессии.`}),(0,x.jsx)(`h3`,{children:`Basic-пример`}),(0,x.jsx)(`p`,{children:`изолированно демонстрирует стандартный Authorization и обязательность HTTPS.`})]}),(0,x.jsx)(b,{caption:`карта доступа блока`,code:`access_map = {
    "GET /users/me": "session or bearer",
    "POST /integrations/tasks/import": "X-API-Key",
    "GET /examples/basic": "HTTP Basic",
}

for route, scheme in access_map.items():
    print(f"{route} -> {scheme}")`}),(0,x.jsx)(g,{prompt:`Соедините сценарий с наиболее подходящей схемой.`,leftTitle:`Сценарий`,rightTitle:`Схема`,pairs:[{left:`профиль пользователя`,right:`session или JWT`},{left:`служебный импорт`,right:`X-API-Key`},{left:`минимальный стандартный пример`,right:`HTTP Basic`}],explanation:`Схема выбирается по субъекту и жизненному циклу credential.`}),(0,x.jsx)(r,{tone:`info`,children:`Готовность урока определяется не количеством схем, а способностью объяснить, почему конкретный endpoint использует именно эту.`}),(0,x.jsxs)(`div`,{className:`lesson-check-group`,children:[(0,x.jsx)(f,{question:`Что делает Base64 в HTTP Basic?`,options:[`шифрует пароль`,`кодирует строку обратимым способом`,`создаёт JWT`],correctIndex:1,explanation:`Base64 не использует секрет и легко декодируется.`}),(0,x.jsx)(f,{question:`Где предпочтительно передавать API key?`,options:[`в X-API-Key`,`в имени файла`,`в query URL`],correctIndex:0,explanation:`Выделенный заголовок лучше выражает credential и реже сохраняется как часть URL.`}),(0,x.jsx)(f,{question:`Что должно защищать Basic в сети?`,options:[`HTTPS`,`длинное имя пользователя`,`формат JSON`],correctIndex:0,explanation:`Без TLS credentials можно перехватить.`}),(0,x.jsx)(f,{question:`Когда результат dependency можно не добавлять в сигнатуру endpoint?`,options:[`когда важен только факт успешной проверки`,`никогда`,`только для GET`],correctIndex:0,explanation:`dependencies=[Depends(...)] подходит для проверки без передаваемого результата.`})]}),(0,x.jsx)(n,{points:[(0,x.jsx)(x.Fragment,{children:`HTTP Basic передаёт credentials при каждом запросе.`}),(0,x.jsx)(x.Fragment,{children:`Base64 — кодирование, а не шифрование.`}),(0,x.jsx)(x.Fragment,{children:`Basic требует HTTPS и стандартного WWW-Authenticate при отказе.`}),(0,x.jsx)(x.Fragment,{children:`API key обычно идентифицирует интеграцию, а не пользователя.`}),(0,x.jsx)(x.Fragment,{children:`Служебный ключ лучше передавать в заголовке X-API-Key.`}),(0,x.jsx)(x.Fragment,{children:`Секреты приходят из окружения и никогда не попадают в логи.`}),(0,x.jsx)(x.Fragment,{children:`Security dependency останавливает запрос до бизнес-операции.`})]}),(0,x.jsx)(h,{text:`Добавьте отдельный Basic-пример и защитите POST /integrations/tasks/import через X-API-Key. Покройте отсутствие, неверный и корректный ключ TestClient-тестами.`})]})]})}export{C as Lesson111};