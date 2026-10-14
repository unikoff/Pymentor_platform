import{t as e}from"./jsx-runtime-lw2jiZar.js";import{A as t,C as n,D as r,E as i,F as a,H as o,I as s,L as c,M as l,N as u,O as d,P as f,S as p,T as m,_ as h,b as g,g as _,h as v,j as y,w as b,x,y as S}from"./shared-pB8LFUv2.js";import{t as C}from"./key-round-D-Q1K68g.js";import{t as w}from"./CodeEditor-BZlrvoTL.js";var T=e(),E=`Блок 18 · Cookie и серверные сессии`;function D({module:e}){return(0,T.jsxs)(u,{children:[(0,T.jsx)(l,{variant:`project`,chip:e??E,title:`get_current_user через session`,intro:`Научим FastAPI восстанавливать пользователя до запуска endpoint: dependency прочитает cookie, найдёт server-side session по digest, проверит срок и отзыв, затем загрузит активного User.`,tags:[{icon:(0,T.jsx)(C,{size:14}),label:`cookie → current user`},{icon:(0,T.jsx)(o,{size:14}),label:`dependency chain`}]}),(0,T.jsx)(a,{link:`После login браузер автоматически отправляет session cookie. Dependency get_current_user восстанавливает пользователя до выполнения защищённого endpoint.`,boundary:`Наличие cookie недостаточно: сервер проверяет существование session, отзыв, срок действия и активность пользователя.`}),(0,T.jsxs)(f,{number:`01`,title:`Защищённый endpoint не должен повторять проверки`,children:[(0,T.jsx)(d,{children:`После login каждый endpoint мог бы вручную читать cookie, искать session и загружать пользователя. Повторение создаёт риск: один маршрут забудет проверить expires_at, другой — is_active. Dependency собирает единый authentication pipeline.`}),(0,T.jsxs)(`div`,{className:`lesson-route`,children:[(0,T.jsxs)(`ol`,{children:[(0,T.jsxs)(`li`,{children:[(0,T.jsx)(`strong`,{children:`Получить cookie:`}),` `,`FastAPI извлекает значение по alias studyhub_session.`]}),(0,T.jsxs)(`li`,{children:[(0,T.jsx)(`strong`,{children:`Найти session:`}),` `,`raw token преобразуется в digest, затем выполняется SELECT.`]}),(0,T.jsxs)(`li`,{children:[(0,T.jsx)(`strong`,{children:`Проверить состояние:`}),` `,`неизвестная, отозванная или просроченная session отклоняется.`]}),(0,T.jsxs)(`li`,{children:[(0,T.jsx)(`strong`,{children:`Загрузить User:`}),` `,`dependency возвращает только существующего активного пользователя.`]})]}),(0,T.jsx)(`p`,{children:`Endpoint получает готовый current_user и занимается только своим предметным сценарием.`})]}),(0,T.jsx)(v,{code:`request Cookie
  ↓ get_session_token
raw token
  ↓ get_active_session
UserSessionModel
  ↓ get_current_user
UserModel
  ↓ endpoint
business operation`,scenarios:[{label:`cookie`,activeLine:2,output:`raw token или 401`},{label:`session`,activeLine:4,output:`активная запись или 401`},{label:`user`,activeLine:6,output:`активный User или 401`},{label:`endpoint`,activeLine:8,output:`предметная логика`}]}),(0,T.jsx)(i,{tone:`info`,children:`Dependency injection здесь не является отдельной архитектурой. Это способ объявить обязательные данные и централизовать их получение до выполнения endpoint.`})]}),(0,T.jsxs)(f,{number:`02`,title:`Первая dependency читает cookie`,children:[(0,T.jsx)(d,{children:`Cookie может отсутствовать: пользователь ещё не входил, удалил данные браузера или отправил запрос другим клиентом. Это ожидаемый authentication failure, а не внутренняя ошибка сервера.`}),(0,T.jsx)(w,{caption:`тип session cookie`,code:`from typing import Annotated

from fastapi import Cookie, HTTPException, status

SESSION_COOKIE_NAME = "studyhub_session"

SessionCookie = Annotated[
    str | None,
    Cookie(alias=SESSION_COOKIE_NAME),
]

def get_session_token(
    raw_token: SessionCookie = None,
) -> str:
    if raw_token is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Требуется вход",
        )

    return raw_token`}),(0,T.jsxs)(c,{children:[(0,T.jsx)(s,{badge:`alias`,title:`HTTP-имя`,code:`studyhub_session`,children:`Имя в request header Cookie. Оно может отличаться от Python-параметра.`}),(0,T.jsx)(s,{badge:`optional`,badgeTone:`float`,title:`str | None`,code:`None до проверки`,children:`FastAPI не превращает отсутствие cookie в 422. Dependency сама формирует 401.`}),(0,T.jsx)(s,{badge:`result`,badgeTone:`str`,title:`str`,code:`raw token`,children:`После функции следующий слой получает гарантированно существующее значение.`})]}),(0,T.jsx)(_,{prompt:`Какой HTTP-статус возвращается, когда cookie отсутствует?`,before:`status_code=status.HTTP_`,after:``,options:[`401_UNAUTHORIZED`,`422_UNPROCESSABLE_ENTITY`,`201_CREATED`],answer:`401_UNAUTHORIZED`,explanation:`Форма запроса допустима, но пользователь не аутентифицирован.`}),(0,T.jsx)(i,{children:`Не используйте 403 для отсутствующей session. 403 относится к подтверждённому пользователю, которому не разрешено конкретное действие.`})]}),(0,T.jsxs)(f,{number:`03`,title:`Поиск session выполняется по digest`,children:[(0,T.jsx)(d,{children:`Raw token не хранится в таблице. Dependency вычисляет digest тем же детерминированным способом и использует его в условии SELECT.`}),(0,T.jsx)(w,{caption:`получить запись session`,code:`from sqlalchemy import select
from sqlalchemy.orm import Session

def find_session_by_token(
    db: Session,
    raw_token: str,
) -> UserSessionModel | None:
    token_digest = digest_session_token(raw_token)

    statement = select(UserSessionModel).where(
        UserSessionModel.token_digest == token_digest,
    )

    return db.scalar(statement)`}),(0,T.jsx)(m,{question:`Какой поиск согласован с моделью хранения?`,left:{title:`Сравнить raw token`,code:`where(UserSessionModel.token_digest == raw_token)`,note:`Представления различаются, поэтому запись не будет найдена.`},right:{title:`Сравнить digest`,code:`where(UserSessionModel.token_digest == digest(raw_token))`,note:`Обе стороны имеют одно и то же представление.`},preferred:`right`,explanation:`Raw token преобразуется на входной границе поиска.`}),(0,T.jsx)(h,{code:`cookie = "raw-token"
stored = sha256(cookie).hexdigest()
lookup = sha256(cookie).hexdigest()

print(stored == lookup)`,output:`True`,hint:`Один и тот же вход даёт один и тот же digest.`}),(0,T.jsx)(n,{code:`statement = select(UserSessionModel).where(
    UserSessionModel.user_id == raw_token,
)`,question:`Почему условие не выражает назначение token?`,options:[`Token нужно сопоставлять с token_digest, а не с user_id`,`SELECT запрещён в dependency`,`user_id должен храниться в cookie`],correctIndex:0,explanation:`Session token идентифицирует строку session, и уже она содержит user_id.`,fix:`statement = select(UserSessionModel).where(
    UserSessionModel.token_digest == digest_session_token(raw_token),
)`})]}),(0,T.jsxs)(f,{number:`04`,title:`Активность session — составное условие`,children:[(0,T.jsx)(d,{children:`Найденная строка ещё не означает действующий вход. Session должна существовать, не быть отозванной и иметь expires_at позже текущего времени.`}),(0,T.jsx)(w,{caption:`проверить session`,code:`def require_active_session(
    db: Session,
    raw_token: str,
) -> UserSessionModel:
    session = find_session_by_token(db, raw_token)

    if session is None:
        raise unauthorized()

    if session.revoked_at is not None:
        raise unauthorized()

    if session.expires_at <= utc_now():
        raise unauthorized()

    return session`}),(0,T.jsx)(v,{code:`session = lookup(token)
if session is None:
    401 unknown
elif session.revoked_at:
    401 revoked
elif session.expires_at <= now:
    401 expired
else:
    active session`,scenarios:[{label:`unknown`,activeLine:2,output:`401`},{label:`revoked`,activeLine:4,output:`401`},{label:`expired`,activeLine:6,output:`401`},{label:`active`,activeLine:8,output:`continue`}]}),(0,T.jsx)(p,{statement:(0,T.jsx)(T.Fragment,{children:`Если token найден в таблице, expires_at можно не проверять.`}),isTrue:!1,explanation:`Просроченные записи могут оставаться в базе для аудита или последующей очистки.`}),(0,T.jsx)(x,{question:`Почему все невалидные состояния дают один внешний 401?`,answer:(0,T.jsx)(`p`,{children:`Клиенту достаточно знать, что текущая authentication session недействительна. Внутреннюю причину приложение может учитывать отдельно, не раскрывая детали.`})}),(0,T.jsx)(i,{tone:`info`,children:`Проверки выполняются на каждом защищённом запросе. Наличие cookie в браузере не кеширует решение сервера.`})]}),(0,T.jsxs)(f,{number:`05`,title:`Загрузка и проверка пользователя`,children:[(0,T.jsx)(d,{children:`Session указывает на user_id, но пользователь мог быть удалён или деактивирован после login. Поэтому current user загружается заново и проходит собственную проверку.`}),(0,T.jsx)(w,{caption:`dependency current user`,code:`from fastapi import Depends

SessionToken = Annotated[str, Depends(get_session_token)]

def get_current_user(
    raw_token: SessionToken,
    db: SessionDep,
) -> UserModel:
    session = require_active_session(db, raw_token)
    user = db.get(UserModel, session.user_id)

    if user is None or not user.is_active:
        raise unauthorized()

    return user

CurrentUser = Annotated[
    UserModel,
    Depends(get_current_user),
]`}),(0,T.jsx)(t,{rows:[[(0,T.jsx)(T.Fragment,{children:`get_session_token`}),`гарантирует наличие cookie`],[(0,T.jsx)(T.Fragment,{children:`require_active_session`}),`проверяет session lifecycle`],[(0,T.jsx)(T.Fragment,{children:`db.get(UserModel, user_id)`}),`загружает актуальное состояние пользователя`],[(0,T.jsx)(T.Fragment,{children:`is_active`}),`запрещает доступ деактивированной учётной записи`],[(0,T.jsx)(T.Fragment,{children:`CurrentUser`}),`переиспользуемый тип зависимости endpoint`]]}),(0,T.jsx)(n,{code:`def get_current_user(session):
    return {"id": session.user_id, "is_active": True}`,question:`Почему нельзя собирать пользователя только из session?`,options:[`Состояние User могло измениться после login`,`Словари запрещены в FastAPI`,`Session всегда содержит password`],correctIndex:0,explanation:`Права и активность должны загружаться из актуальной серверной записи User.`,fix:`user = db.get(UserModel, session.user_id)
if user is None or not user.is_active:
    raise unauthorized()
return user`}),(0,T.jsx)(i,{children:`Session подтверждает предыдущий вход, но не замораживает пользователя навсегда. Изменение is_active должно влиять на следующий request.`})]}),(0,T.jsxs)(f,{number:`06`,title:`GET /users/me становится коротким`,children:[(0,T.jsx)(d,{children:`После подготовки dependency endpoint профиля не знает о cookie, digest и таблице sessions. Он объявляет CurrentUser и возвращает безопасную схему.`}),(0,T.jsx)(w,{caption:`защищённый профиль`,code:`from fastapi import APIRouter

router = APIRouter(prefix="/users", tags=["users"])

@router.get("/me", response_model=UserRead)
def read_current_user(
    current_user: CurrentUser,
):
    return current_user`}),(0,T.jsx)(m,{question:`Где должна находиться authentication pipeline?`,left:{title:`В каждом endpoint`,code:`read cookie → SELECT session → SELECT user`,note:`Проверки копируются и легко расходятся.`},right:{title:`В dependency`,code:`current_user: CurrentUser`,note:`Endpoint явно требует подтверждённого пользователя.`},preferred:`right`,explanation:`Dependency централизует получение обязательного контекста.`}),(0,T.jsx)(b,{title:`Проследите защищённый request`,prompt:`Расположите этапы до выполнения read_current_user.`,pieces:[{id:`request`,code:`GET /users/me + Cookie`},{id:`token`,code:`get_session_token`},{id:`session`,code:`require_active_session`},{id:`user`,code:`get_current_user`},{id:`endpoint`,code:`read_current_user`},{id:`response`,code:`UserRead response`}],correctOrder:[`request`,`token`,`session`,`user`,`endpoint`,`response`],explanation:`FastAPI разрешает цепочку dependencies прежде, чем вызвать тело endpoint.`}),(0,T.jsx)(i,{tone:`info`,children:`Короткий endpoint — не признак скрытой магии, если dependency разбита на именованные проверяемые шаги.`})]}),(0,T.jsxs)(f,{number:`07`,title:`Тесты активной и невалидной session`,children:[(0,T.jsx)(d,{children:`Набор тестов должен покрывать каждую ветку pipeline. Один успешный тест не доказывает поведение при неизвестном, просроченном или отозванном token.`}),(0,T.jsx)(w,{caption:`успешный профиль`,code:`def test_me_returns_logged_user(client, registered_user):
    login(client, registered_user.email, "correct-password")

    response = client.get("/users/me")

    assert response.status_code == 200
    assert response.json()["id"] == registered_user.id`}),(0,T.jsx)(w,{caption:`матрица отказов`,code:`def test_me_requires_cookie(client):
    assert client.get("/users/me").status_code == 401


def test_me_rejects_revoked_session(client, revoked_cookie):
    client.cookies.set("studyhub_session", revoked_cookie)
    assert client.get("/users/me").status_code == 401


def test_me_rejects_expired_session(client, expired_cookie):
    client.cookies.set("studyhub_session", expired_cookie)
    assert client.get("/users/me").status_code == 401`}),(0,T.jsx)(S,{title:`authentication matrix`,lines:[{cmd:`pytest tests/test_current_user.py -q`},{out:`active session PASSED`},{out:`missing cookie PASSED`},{out:`unknown token PASSED`},{out:`revoked session PASSED`},{out:`expired session PASSED`},{out:`5 passed`}]}),(0,T.jsx)(i,{children:`Создавайте просроченную session через fixture с явным expires_at, а не через sleep. Тест должен быть быстрым и детерминированным.`}),(0,T.jsxs)(`div`,{className:`lesson-practice-steps`,children:[(0,T.jsx)(`h3`,{children:`Одна причина на dependency`}),(0,T.jsx)(`p`,{children:`get_session_token отвечает за транспорт, require_active_session — за lifecycle входа, get_current_user — за актуальную учётную запись.`}),(0,T.jsx)(`h3`,{children:`Единый внешний контракт`}),(0,T.jsx)(`p`,{children:`Missing, unknown, revoked и expired session возвращают одинаковый 401. Внутренние причины остаются деталями диагностики сервера.`}),(0,T.jsx)(`h3`,{children:`Регрессионная проверка`}),(0,T.jsx)(`p`,{children:`После деактивации User ранее выданная session не должна открывать /users/me. Это доказывает повторную загрузку User.`})]}),(0,T.jsx)(w,{caption:`единая фабрика 401`,code:`def unauthorized() -> HTTPException:
    return HTTPException(
        status_code=401,
        detail="Требуется действующая session",
    )`}),(0,T.jsx)(i,{children:`Не передавайте различающиеся причины authentication failure клиенту через detail. Такой контракт облегчает enumeration и привязывает frontend к внутренней модели.`})]}),(0,T.jsxs)(f,{number:`08`,title:`Контрольная точка: current user как dependency`,children:[(0,T.jsx)(d,{children:`Полная модель должна объясняться без фразы «FastAPI сам понял пользователя». Framework только вызывает объявленные функции; каждая функция преобразует один вход в более сильную гарантию.`}),(0,T.jsxs)(`div`,{className:`lesson-check-group`,children:[(0,T.jsx)(g,{question:`Что возвращает get_session_token?`,options:[`существующий raw token или 401`,`готовый UserRead`,`новую cookie`],correctIndex:0,explanation:`Первая dependency отвечает только за наличие значения.`}),(0,T.jsx)(g,{question:`По какому полю ищется session?`,options:[`token_digest`,`password_hash`,`username`],correctIndex:0,explanation:`Raw token сначала преобразуется в digest.`}),(0,T.jsx)(g,{question:`Почему User загружается заново?`,options:[`проверить актуальное существование и is_active`,`обновить cookie`,`создать SQL migration`],correctIndex:0,explanation:`Состояние учётной записи могло измениться после login.`}),(0,T.jsx)(g,{question:`Что получает endpoint /users/me?`,options:[`CurrentUser`,`сырой заголовок Cookie`,`пароль`],correctIndex:0,explanation:`Authentication pipeline завершена до вызова endpoint.`})]}),(0,T.jsx)(r,{points:[(0,T.jsx)(T.Fragment,{children:`Dependency устраняет повторение authentication checks.`}),(0,T.jsx)(T.Fragment,{children:`Отсутствующая cookie формирует 401, а не validation error 422.`}),(0,T.jsx)(T.Fragment,{children:`Raw token преобразуется в digest перед SELECT.`}),(0,T.jsx)(T.Fragment,{children:`Активная session одновременно существует, не отозвана и не просрочена.`}),(0,T.jsx)(T.Fragment,{children:`Пользователь загружается заново и проверяется через is_active.`}),(0,T.jsxs)(T.Fragment,{children:[(0,T.jsx)(`code`,{children:`CurrentUser`}),` делает требование endpoint явным.`]}),(0,T.jsx)(T.Fragment,{children:`Негативные ветки проверяются отдельными детерминированными тестами.`})]}),(0,T.jsx)(y,{text:`Реализуйте цепочку get_session_token → require_active_session → get_current_user и endpoint GET /users/me. Добавьте тесты отсутствующей cookie, неизвестного token, revoked_at, expires_at и деактивированного пользователя.`})]})]})}export{D as Lesson102};