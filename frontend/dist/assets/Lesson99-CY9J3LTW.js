import{t as e}from"./jsx-runtime-lw2jiZar.js";import{A as t,C as n,D as r,E as i,F as a,I as o,L as s,M as c,N as l,O as u,P as d,S as f,T as p,_ as m,b as h,f as g,g as _,h as v,j as y,p as b,w as x,x as S,y as C}from"./shared-DhavWP79.js";import{D as w,k as T}from"./index-CPmvoNjB.js";import{t as E}from"./CodeEditor-BZlrvoTL.js";var D=e(),O=`Блок 18 · Cookie и серверные сессии`;function k({module:e}){return(0,D.jsxs)(l,{children:[(0,D.jsx)(c,{variant:`project`,chip:e??O,title:`Cookie в браузере`,intro:`Разберём первый слой session-based authentication: как сервер отправляет Set-Cookie, почему браузер сохраняет значение и при каких условиях автоматически возвращает его в заголовке Cookie.`,tags:[{icon:(0,D.jsx)(T,{size:14}),label:`Set-Cookie → Cookie`},{icon:(0,D.jsx)(w,{size:14}),label:`HttpOnly · Secure · SameSite`}]}),(0,D.jsx)(a,{link:`В блоке 17 StudyHub научился регистрировать пользователя и проверять credentials. Теперь браузеру нужен безопасный способ сообщать о ранее выполненном входе в следующих запросах.`,boundary:`Cookie — механизм хранения и автоматической отправки небольшого значения. Сама по себе cookie не доказывает личность и не является server-side session.`}),(0,D.jsxs)(d,{number:`01`,title:`Почему одного успешного login недостаточно`,children:[(0,D.jsx)(u,{children:`HTTP-запросы независимы. Сервер может проверить email и пароль в запросе login, но следующий GET /users/me приходит отдельно. Без дополнительного признака приложение не знает, что оба запроса отправил один и тот же вошедший пользователь.`}),(0,D.jsxs)(`div`,{className:`lesson-route`,children:[(0,D.jsxs)(`ol`,{children:[(0,D.jsxs)(`li`,{children:[(0,D.jsx)(`strong`,{children:`Выполнить вход:`}),` `,`клиент отправляет credentials, а сервер проверяет их.`]}),(0,D.jsxs)(`li`,{children:[(0,D.jsx)(`strong`,{children:`Получить маркер:`}),` `,`сервер добавляет заголовок Set-Cookie в HTTP-ответ.`]}),(0,D.jsxs)(`li`,{children:[(0,D.jsx)(`strong`,{children:`Вернуть маркер:`}),` `,`браузер автоматически прикрепляет подходящую cookie к следующим запросам.`]}),(0,D.jsxs)(`li`,{children:[(0,D.jsx)(`strong`,{children:`Проверить на сервере:`}),` `,`приложение ещё должно связать значение cookie с действующей session.`]})]}),(0,D.jsx)(`p`,{children:`На этом занятии мы изучаем транспорт cookie. Таблица sessions и проверка пользователя появятся в следующих уроках.`})]}),(0,D.jsx)(v,{code:`POST /auth/session/login
  ↓
HTTP 200 + Set-Cookie
  ↓
browser cookie storage
  ↓
GET /users/me + Cookie
  ↓
server checks value`,scenarios:[{label:`первый login`,activeLine:2,output:`браузер получает Set-Cookie`},{label:`следующий запрос`,activeLine:4,output:`браузер отправляет Cookie`},{label:`серверная проверка`,activeLine:6,output:`значение ещё нужно валидировать`}]}),(0,D.jsx)(i,{tone:`info`,children:`Cookie решает задачу доставки небольшого значения между запросами. Она не заменяет базу пользователей, проверку пароля или server-side session.`})]}),(0,D.jsxs)(d,{number:`02`,title:`Два заголовка одного обмена`,children:[(0,D.jsx)(u,{children:`Сервер устанавливает cookie через response header Set-Cookie. Клиент возвращает сохранённую пару name=value через request header Cookie. Это разные направления HTTP-обмена.`}),(0,D.jsxs)(s,{children:[(0,D.jsx)(o,{badge:`response`,title:`Set-Cookie`,code:`Set-Cookie: studyhub_session=abc123; HttpOnly`,children:`Инструкция браузеру сохранить cookie с заданным именем, значением и атрибутами.`}),(0,D.jsx)(o,{badge:`storage`,badgeTone:`float`,title:`Cookie jar`,code:`studyhub_session → abc123`,children:`Хранилище браузера применяет правила domain, path, срока действия и безопасности.`}),(0,D.jsx)(o,{badge:`request`,badgeTone:`str`,title:`Cookie`,code:`Cookie: studyhub_session=abc123`,children:`Заголовок следующего подходящего запроса. Браузер формирует его автоматически.`})]}),(0,D.jsx)(b,{prompt:`Соедините участника и действие.`,pairs:[{left:`FastAPI response`,right:`добавляет Set-Cookie`},{left:`браузер`,right:`хранит значение и проверяет атрибуты`},{left:`следующий request`,right:`несёт заголовок Cookie`},{left:`dependency`,right:`читает cookie и проверяет session`}],explanation:`Cookie проходит полный круг: сервер → клиентское хранилище → новый запрос → серверная проверка.`}),(0,D.jsx)(m,{code:`response.set_cookie(
    key="studyhub_session",
    value="abc123",
)

# следующий запрос браузера
Cookie: studyhub_session=abc123`,output:`В HTTP-ответе появится Set-Cookie, а в подходящем следующем запросе — Cookie.`,hint:`set_cookie не меняет текущий request. Он формирует инструкцию для клиента.`}),(0,D.jsx)(i,{children:`В инструментах разработчика Set-Cookie ищут во вкладке Response Headers, а Cookie — во вкладке Request Headers следующего запроса.`})]}),(0,D.jsxs)(d,{number:`03`,title:`Атрибуты ограничивают отправку cookie`,children:[(0,D.jsx)(u,{children:`Cookie имеет не только значение, но и политику доставки. Атрибуты уменьшают область использования и защищают session token от некоторых типовых угроз.`}),(0,D.jsx)(t,{rows:[[(0,D.jsx)(D.Fragment,{children:`httponly=True`}),`JavaScript страницы не получает значение через document.cookie`],[(0,D.jsx)(D.Fragment,{children:`secure=True`}),`браузер отправляет cookie только по HTTPS`],[(0,D.jsx)(D.Fragment,{children:`samesite="lax"`}),`ограничивает отправку в межсайтовых сценариях`],[(0,D.jsx)(D.Fragment,{children:`path="/"`}),`разрешает отправку на все маршруты приложения`],[(0,D.jsx)(D.Fragment,{children:`max_age=1800`}),`задаёт срок хранения в секундах`]]}),(0,D.jsx)(g,{cards:[{front:(0,D.jsx)(`strong`,{children:`HttpOnly`}),back:(0,D.jsx)(`span`,{children:`Снижает риск чтения session token клиентским JavaScript. Это не защита от всех XSS-последствий.`})},{front:(0,D.jsx)(`strong`,{children:`Secure`}),back:(0,D.jsx)(`span`,{children:`Нужен в production с HTTPS. При локальной разработке по http его часто задают через конфигурацию.`})},{front:(0,D.jsx)(`strong`,{children:`SameSite`}),back:(0,D.jsx)(`span`,{children:`Управляет межсайтовой отправкой cookie и влияет на CSRF-модель приложения.`})},{front:(0,D.jsx)(`strong`,{children:`Max-Age`}),back:(0,D.jsx)(`span`,{children:`Определяет время хранения cookie у клиента, но не заменяет серверный expires_at.`})}]}),(0,D.jsx)(f,{statement:(0,D.jsx)(D.Fragment,{children:`HttpOnly-cookie никогда не отправляется браузером в HTTP-запросе.`}),isTrue:!1,explanation:`HttpOnly запрещает чтение через JavaScript, но браузер продолжает автоматически отправлять cookie подходящему серверу.`}),(0,D.jsx)(i,{tone:`info`,children:`Клиентский срок и серверный срок проверяются независимо. Даже если браузер сохранил cookie, сервер может считать session просроченной или отозванной.`})]}),(0,D.jsxs)(d,{number:`04`,title:`Установка, чтение и удаление в FastAPI`,children:[(0,D.jsx)(u,{children:`FastAPI позволяет изменить объект Response и одновременно вернуть обычную Pydantic-модель. Для чтения cookie используется параметр Cookie с alias, совпадающим с HTTP-именем.`}),(0,D.jsx)(E,{caption:`установить учебную cookie`,code:`from fastapi import FastAPI, Response

app = FastAPI()

@app.post("/demo/cookie")
def set_demo_cookie(response: Response):
    response.set_cookie(
        key="studyhub_demo",
        value="lesson-99",
        httponly=True,
        samesite="lax",
        path="/",
    )
    return {"status": "saved"}`}),(0,D.jsx)(E,{caption:`прочитать cookie`,code:`from typing import Annotated

from fastapi import Cookie

@app.get("/demo/cookie")
def read_demo_cookie(
    value: Annotated[str | None, Cookie(alias="studyhub_demo")] = None,
):
    return {"cookie_value": value}`}),(0,D.jsx)(E,{caption:`удалить cookie`,code:`@app.delete("/demo/cookie")
def delete_demo_cookie(response: Response):
    response.delete_cookie(
        key="studyhub_demo",
        path="/",
    )
    return {"status": "deleted"}`}),(0,D.jsx)(_,{prompt:`Укажите HTTP-имя cookie, которое должен прочитать параметр.`,before:`value: Annotated[str | None, Cookie(alias="`,after:`")] = None`,options:[`studyhub_demo`,`Response`,`set_cookie`],answer:`studyhub_demo`,explanation:`Alias связывает Python-параметр с именем cookie в HTTP-запросе.`}),(0,D.jsx)(i,{children:`Параметры path и domain при удалении должны совпадать с областью исходной cookie. Иначе браузер может сохранить старую запись.`})]}),(0,D.jsxs)(d,{number:`05`,title:`Что нельзя считать доверенными данными`,children:[(0,D.jsx)(u,{children:`Значение cookie находится у клиента: его можно удалить, заменить или скопировать. Поэтому сервер не должен хранить в cookie пароль, password_hash, роль или сериализованный профиль и затем доверять этим данным без проверки.`}),(0,D.jsx)(p,{question:`Какой HTTP-контракт безопаснее для будущей server-side session?`,left:{title:`Профиль внутри cookie`,code:`user_id=7; role=admin; email=user@example.com`,note:`Клиент видит и может изменить предметные данные.`},right:{title:`Непрозрачный token`,code:`studyhub_session=V9b...random...K2`,note:`Значение только указывает на серверную запись session.`},preferred:`right`,explanation:`Сервер получает идентификатор, затем загружает действующие данные пользователя из базы.`}),(0,D.jsx)(n,{code:`response.set_cookie(
    key="current_user",
    value='{"id": 7, "role": "admin"}',
)

# endpoint доверяет role из cookie`,question:`Какое предположение нарушено?`,options:[`Данные клиента считаются источником прав доступа`,`Cookie не может содержать строку`,`FastAPI запрещает JSON`],correctIndex:0,explanation:`Клиентская cookie не должна самостоятельно назначать роль или владельца.`,fix:`response.set_cookie(
    key="studyhub_session",
    value=session_token,
    httponly=True,
)

# роль загружается из базы после проверки session`}),(0,D.jsx)(S,{question:`Почему непрозрачный token лучше профиля пользователя в cookie?`,answer:(0,D.jsx)(`p`,{children:`Он не раскрывает предметные данные и не является самостоятельным доказательством роли. Сервер использует token только для поиска и проверки собственной записи session.`})}),(0,D.jsx)(i,{tone:`info`,children:`Непрозрачный означает, что клиенту не нужно понимать внутреннее устройство значения. Оно не кодирует полезные для интерфейса поля.`})]}),(0,D.jsxs)(d,{number:`06`,title:`Конфигурация cookie для development и production`,children:[(0,D.jsx)(u,{children:`Локальный сервер часто работает по HTTP, а production — по HTTPS. Поэтому флаг Secure и имя cookie лучше задавать через объект настроек, а не размазывать литералы по endpoint.`}),(0,D.jsx)(E,{caption:`настройки session cookie`,code:`from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    session_cookie_name: str = "studyhub_session"
    session_cookie_secure: bool = False
    session_cookie_max_age: int = 1800

    model_config = SettingsConfigDict(
        env_file=".env",
        extra="ignore",
    )

settings = Settings()`}),(0,D.jsx)(E,{caption:`единая функция установки`,code:`def set_session_cookie(response: Response, token: str) -> None:
    response.set_cookie(
        key=settings.session_cookie_name,
        value=token,
        max_age=settings.session_cookie_max_age,
        httponly=True,
        secure=settings.session_cookie_secure,
        samesite="lax",
        path="/",
    )`}),(0,D.jsx)(x,{title:`Соберите путь настройки`,prompt:`Расположите действия от окружения до HTTP-ответа.`,pieces:[{id:`env`,code:`SESSION_COOKIE_SECURE=true`},{id:`settings`,code:`Settings читает переменную`},{id:`helper`,code:`set_session_cookie использует settings`},{id:`header`,code:`Response получает Set-Cookie`},{id:`browser`,code:`браузер применяет атрибут Secure`}],correctOrder:[`env`,`settings`,`helper`,`header`,`browser`],explanation:`Политика определяется окружением, проходит через настройки и материализуется в HTTP-заголовке.`}),(0,D.jsx)(i,{children:`Не коммитьте реальные секреты в .env. Само имя cookie и max_age не являются секретами, но единая конфигурация предотвращает расхождение между login и logout.`})]}),(0,D.jsxs)(d,{number:`07`,title:`Диагностика в браузере и TestClient`,children:[(0,D.jsx)(u,{children:`Проверять cookie нужно как последовательность запросов. Отдельный вызов login показывает Set-Cookie, но реальный сценарий подтверждается только следующим запросом через тот же браузер или тот же объект TestClient.`}),(0,D.jsx)(C,{title:`ручной сценарий`,lines:[{cmd:`POST /demo/cookie`},{out:`200 OK · Set-Cookie: studyhub_demo=lesson-99; HttpOnly`},{cmd:`GET /demo/cookie`},{out:`Request Headers · Cookie: studyhub_demo=lesson-99`},{out:`Response JSON · {"cookie_value":"lesson-99"}`},{cmd:`DELETE /demo/cookie`},{out:`Set-Cookie с истёкшим значением удаляет запись у клиента`}]}),(0,D.jsx)(E,{caption:`TestClient сохраняет cookie между вызовами`,code:`from fastapi.testclient import TestClient

client = TestClient(app)

set_response = client.post("/demo/cookie")
assert set_response.status_code == 200

read_response = client.get("/demo/cookie")
assert read_response.json() == {
    "cookie_value": "lesson-99",
}

client.delete("/demo/cookie")
assert client.get("/demo/cookie").json() == {
    "cookie_value": None,
}`}),(0,D.jsx)(n,{code:`TestClient(app).post("/demo/cookie")
response = TestClient(app).get("/demo/cookie")
assert response.json()["cookie_value"] == "lesson-99"`,question:`Почему второй запрос может не содержать cookie?`,options:[`Созданы два независимых TestClient с разными cookie jar`,`GET не поддерживает cookie`,`Cookie работает только в JavaScript`],correctIndex:0,explanation:`Состояние клиента сохраняется внутри конкретного экземпляра TestClient.`,fix:`client = TestClient(app)
client.post("/demo/cookie")
response = client.get("/demo/cookie")
assert response.json()["cookie_value"] == "lesson-99"`}),(0,D.jsx)(i,{tone:`info`,children:`При ошибке проверяйте четыре места: Set-Cookie в ответе, cookie jar клиента, область path/domain и Cookie в следующем запросе.`}),(0,D.jsxs)(`div`,{className:`lesson-practice-steps`,children:[(0,D.jsx)(`h3`,{children:`Проверка в DevTools`}),(0,D.jsx)(`p`,{children:`Откройте Network, выполните POST и найдите Set-Cookie. Затем выполните GET и найдите Cookie в request headers. Отдельно проверьте Application или Storage, где браузер показывает атрибуты записи.`}),(0,D.jsx)(`h3`,{children:`Проверка области`}),(0,D.jsx)(`p`,{children:`Измените path на /demo и сравните запрос к /demo/cookie с запросом к /users/me. Cookie должна отправляться только в разрешённой области.`}),(0,D.jsx)(`h3`,{children:`Граница следующего урока`}),(0,D.jsx)(`p`,{children:`Пока значение lesson-99 не подтверждает пользователя. На следующем занятии оно будет заменено случайным token, связанным с server-side session.`})]}),(0,D.jsx)(t,{rows:[[(0,D.jsx)(D.Fragment,{children:`Response Headers`}),`проверить Set-Cookie и атрибуты`],[(0,D.jsx)(D.Fragment,{children:`Application / Cookies`}),`увидеть сохранённую запись браузера`],[(0,D.jsx)(D.Fragment,{children:`Request Headers`}),`подтвердить автоматическую отправку Cookie`],[(0,D.jsx)(D.Fragment,{children:`TestClient.cookies`}),`проверить состояние программного клиента`]]}),(0,D.jsx)(i,{children:`CORS и cookie credentials важны при отдельном frontend origin, но здесь запросы сначала проверяются в одном origin. Межсайтовый сценарий не смешивается с первой моделью session.`}),(0,D.jsx)(S,{question:`Какой следующий слой превращает cookie в аутентификацию?`,answer:(0,D.jsx)(`p`,{children:`Server-side session: сервер связывает случайный token с пользователем и проверяет срок действия при каждом запросе.`})})]}),(0,D.jsxs)(d,{number:`08`,title:`Контрольная точка: cookie как транспорт`,children:[(0,D.jsx)(u,{children:`Соберите модель без пропусков: сервер формирует Set-Cookie, браузер хранит значение по правилам атрибутов и отправляет Cookie в следующем подходящем запросе. Только после этого сервер сможет проверить session.`}),(0,D.jsxs)(`div`,{className:`lesson-check-group`,children:[(0,D.jsx)(h,{question:`Какой заголовок устанавливает cookie?`,options:[`Set-Cookie в response`,`Cookie в response`,`Authorization в request`],correctIndex:0,explanation:`Сервер инструктирует клиент через Set-Cookie.`}),(0,D.jsx)(h,{question:`Что делает HttpOnly?`,options:[`ограничивает чтение через JavaScript`,`шифрует значение`,`создаёт пользователя`],correctIndex:0,explanation:`Браузер продолжает отправлять cookie, но клиентский JavaScript не должен читать её напрямую.`}),(0,D.jsx)(h,{question:`Можно ли доверять role из обычной cookie?`,options:[`нет, роль нужно загрузить после серверной проверки`,`да, браузер всегда честен`,`только для DELETE`],correctIndex:0,explanation:`Клиентские данные изменяемы и не являются источником разрешений.`}),(0,D.jsx)(h,{question:`Почему в тесте нужен один экземпляр TestClient?`,options:[`он сохраняет cookie jar между запросами`,`он запускает SQL`,`он заменяет Response`],correctIndex:0,explanation:`Последовательный session-сценарий зависит от состояния конкретного клиента.`})]}),(0,D.jsx)(r,{points:[(0,D.jsx)(D.Fragment,{children:`HTTP-запросы независимы, поэтому вход нужно связать с последующими запросами.`}),(0,D.jsxs)(D.Fragment,{children:[(0,D.jsx)(`code`,{children:`Set-Cookie`}),` идёт от сервера к клиенту, а `,(0,D.jsx)(`code`,{children:`Cookie`}),` — обратно.`]}),(0,D.jsx)(D.Fragment,{children:`HttpOnly, Secure, SameSite, Path и Max-Age управляют доставкой cookie.`}),(0,D.jsx)(D.Fragment,{children:`Cookie находится у клиента и не является доверенным профилем пользователя.`}),(0,D.jsx)(D.Fragment,{children:`В session cookie будет храниться только непрозрачный случайный token.`}),(0,D.jsx)(D.Fragment,{children:`Конфигурация login и logout должна использовать одинаковое имя и область cookie.`}),(0,D.jsx)(D.Fragment,{children:`TestClient проверяет сценарий через один сохраняющий состояние экземпляр.`})]}),(0,D.jsx)(y,{text:`Добавьте три учебных endpoint: установить, прочитать и удалить cookie studyhub_demo. Проверьте Set-Cookie и Cookie в DevTools, затем повторите тот же сценарий одним TestClient.`})]})]})}export{k as Lesson99};