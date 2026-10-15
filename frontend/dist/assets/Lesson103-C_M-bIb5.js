import{t as e}from"./jsx-runtime-lw2jiZar.js";import{A as t,C as n,D as r,E as i,F as a,I as o,L as s,M as c,N as l,O as u,P as d,S as f,T as p,b as m,h,j as g,p as _,w as v,x as y,y as b}from"./shared-f6Drw7Sx.js";import{t as x}from"./hard-drive-CkZKRuK9.js";import{t as S}from"./lock-keyhole-JZvqd0_O.js";import{t as C}from"./CodeEditor-BZlrvoTL.js";var w=e(),T=`Блок 18 · Cookie и серверные сессии`;function E({module:e}){return(0,w.jsxs)(l,{children:[(0,w.jsx)(c,{variant:`project`,chip:e??T,title:`Logout, expiration и revocation`,intro:`Завершим lifecycle server-side session: найдём именно текущую запись, отзовём её в базе, удалим cookie у клиента, реализуем logout всех устройств и разберём очистку просроченных sessions.`,tags:[{icon:(0,w.jsx)(S,{size:14}),label:`revoke + delete cookie`},{icon:(0,w.jsx)(x,{size:14}),label:`one device · all devices`}]}),(0,w.jsx)(a,{link:`Current user уже определяется через session. Теперь нужно корректно завершать вход, отзывать отдельные устройства и отличать истечение срока от физической очистки записей.`,boundary:`Удаление cookie только очищает браузер. Надёжный logout также отзывает session на сервере, иначе скопированный token продолжит работать.`}),(0,w.jsxs)(d,{number:`01`,title:`Logout имеет клиентскую и серверную половину`,children:[(0,w.jsx)(u,{children:`В session-based authentication существуют два состояния: cookie в браузере и строка в user_sessions. Надёжный logout меняет оба. Одного delete_cookie недостаточно, потому что скопированный raw token останется действующим на сервере.`}),(0,w.jsxs)(`div`,{className:`lesson-route`,children:[(0,w.jsxs)(`ol`,{children:[(0,w.jsxs)(`li`,{children:[(0,w.jsx)(`strong`,{children:`Определить текущую session:`}),` `,`получить не только User, но и строку, найденную по cookie.`]}),(0,w.jsxs)(`li`,{children:[(0,w.jsx)(`strong`,{children:`Отозвать на сервере:`}),` `,`записать revoked_at и выполнить commit.`]}),(0,w.jsxs)(`li`,{children:[(0,w.jsx)(`strong`,{children:`Очистить клиента:`}),` `,`добавить удаляющий Set-Cookie с теми же path и domain.`]}),(0,w.jsxs)(`li`,{children:[(0,w.jsx)(`strong`,{children:`Проверить повторный request:`}),` `,`старая session должна давать 401.`]})]}),(0,w.jsx)(`p`,{children:`После урока StudyHub поддерживает logout текущего устройства, logout всех устройств и понятную политику истечения срока.`})]}),(0,w.jsx)(p,{question:`Какой logout отзывает доступ, даже если token был скопирован?`,left:{title:`Только удалить cookie`,code:`response.delete_cookie("studyhub_session")`,note:`Очищает конкретный браузер, но server-side запись остаётся активной.`},right:{title:`Revoke и удалить cookie`,code:`session.revoked_at = now
commit
response.delete_cookie(...)`,note:`Сервер перестаёт принимать старый token.`},preferred:`right`,explanation:`Источник решения о доступе находится на сервере.`}),(0,w.jsx)(i,{tone:`info`,children:`Logout не удаляет User и не меняет password_hash. Он завершает только один или несколько экземпляров входа.`})]}),(0,w.jsxs)(d,{number:`02`,title:`Dependency текущей session`,children:[(0,w.jsx)(u,{children:`Для logout нужен объект UserSessionModel, а не только current_user. Поэтому цепочку удобно разделить: CurrentSession возвращает активную session, CurrentUser использует её user_id.`}),(0,w.jsx)(C,{caption:`переиспользуемая dependency`,code:`from typing import Annotated

from fastapi import Depends

CurrentSession = Annotated[
    UserSessionModel,
    Depends(get_current_session),
]

def get_current_session(
    raw_token: SessionToken,
    db: SessionDep,
) -> UserSessionModel:
    return require_active_session(db, raw_token)

def get_current_user(
    session: CurrentSession,
    db: SessionDep,
) -> UserModel:
    user = db.get(UserModel, session.user_id)
    if user is None or not user.is_active:
        raise unauthorized()
    return user`}),(0,w.jsxs)(s,{children:[(0,w.jsx)(o,{badge:`session`,title:`CurrentSession`,code:`UserSessionModel`,children:`Нужна операциям logout, просмотра устройств и обновления last_seen.`}),(0,w.jsx)(o,{badge:`user`,badgeTone:`float`,title:`CurrentUser`,code:`UserModel`,children:`Нужна предметным endpoint, которые работают от имени пользователя.`}),(0,w.jsx)(o,{badge:`chain`,badgeTone:`str`,title:`Одна проверка`,code:`token → session → user`,children:`FastAPI переиспользует resolved dependency в рамках одного request.`})]}),(0,w.jsx)(_,{prompt:`Соедините endpoint и минимальный обязательный контекст.`,pairs:[{left:`POST /auth/session/logout`,right:`CurrentSession`},{left:`GET /users/me`,right:`CurrentUser`},{left:`DELETE /tasks/{task_id}`,right:`CurrentUser`},{left:`GET /auth/sessions`,right:`CurrentUser`}],explanation:`Endpoint объявляет именно тот подтверждённый контекст, который ему нужен.`}),(0,w.jsx)(i,{children:`Не выполняйте повторный SELECT session внутри logout, если CurrentSession уже разрешена dependency chain.`})]}),(0,w.jsxs)(d,{number:`03`,title:`Отзыв текущей session`,children:[(0,w.jsx)(u,{children:`Отзыв сохраняет запись для аудита, но помечает её недействительной. Повторная операция должна быть предсказуемой: защищённый logout вызывается только для активной session, поэтому после первого logout тот же token уже не проходит dependency.`}),(0,w.jsx)(C,{caption:`session service`,code:`from sqlalchemy.orm import Session

def revoke_session(
    db: Session,
    session: UserSessionModel,
) -> None:
    session.revoked_at = utc_now()
    db.commit()`}),(0,w.jsx)(C,{caption:`endpoint logout`,code:`from fastapi import Response, status

@router.post(
    "/logout",
    status_code=status.HTTP_204_NO_CONTENT,
)
def session_logout(
    response: Response,
    current_session: CurrentSession,
    db: SessionDep,
) -> None:
    revoke_session(db, current_session)
    response.delete_cookie(
        key=settings.session_cookie_name,
        path="/",
    )`}),(0,w.jsx)(v,{title:`Соберите logout текущего устройства`,prompt:`Расположите действия в порядке изменения источников состояния.`,pieces:[{id:`resolve`,code:`resolve CurrentSession`},{id:`revoke`,code:`set revoked_at`},{id:`commit`,code:`db.commit()`},{id:`delete`,code:`response.delete_cookie(...)`},{id:`empty`,code:`return 204 without body`}],correctOrder:[`resolve`,`revoke`,`commit`,`delete`,`empty`],explanation:`Сначала сервер прекращает доверять token, затем клиент получает инструкцию удалить cookie.`}),(0,w.jsx)(i,{tone:`info`,children:`Статус 204 означает отсутствие response body. Не возвращайте JSON-сообщение вместе с 204.`})]}),(0,w.jsxs)(d,{number:`04`,title:`Expiration, revocation и cleanup — разные действия`,children:[(0,w.jsx)(u,{children:`Session может перестать работать автоматически по expires_at или вручную по revoked_at. Физическое удаление старых строк — отдельная housekeeping-операция и не должно быть условием безопасности.`}),(0,w.jsx)(t,{rows:[[(0,w.jsx)(w.Fragment,{children:`expiration`}),`сервер отклоняет session после заранее заданного expires_at`],[(0,w.jsx)(w.Fragment,{children:`revocation`}),`сервер завершает session раньше срока по явному событию`],[(0,w.jsx)(w.Fragment,{children:`delete_cookie`}),`клиент перестаёт автоматически отправлять значение`],[(0,w.jsx)(w.Fragment,{children:`cleanup`}),`удаляет старые записи для обслуживания хранилища`],[(0,w.jsx)(w.Fragment,{children:`audit retention`}),`может сохранять минимальную историю по политике проекта`]]}),(0,w.jsx)(h,{code:`request token
if revoked_at is not None:
    reject
elif expires_at <= now:
    reject
else:
    accept

cleanup later removes old rows`,scenarios:[{label:`manual logout`,activeLine:2,output:`revoked → 401`},{label:`time passed`,activeLine:4,output:`expired → 401`},{label:`active`,activeLine:6,output:`request continues`},{label:`maintenance`,activeLine:8,output:`old rows may be deleted later`}]}),(0,w.jsx)(f,{statement:(0,w.jsx)(w.Fragment,{children:`Просроченная session остаётся безопасной только после физического DELETE из базы.`}),isTrue:!1,explanation:`Доступ прекращается из-за проверки expires_at. Cleanup отвечает за объём данных, а не за основное решение авторизации.`}),(0,w.jsx)(i,{children:`Не пытайтесь удалять все просроченные sessions внутри каждого request. Это смешивает authentication check с обслуживанием таблицы.`})]}),(0,w.jsxs)(d,{number:`05`,title:`Logout всех устройств`,children:[(0,w.jsx)(u,{children:`Операция «выйти везде» отзывает все активные sessions пользователя одной транзакцией. Текущая cookie также удаляется, а другие устройства получат 401 при следующем запросе.`}),(0,w.jsx)(C,{caption:`массовый update`,code:`from sqlalchemy import update

def revoke_all_user_sessions(
    db: Session,
    user_id: int,
) -> int:
    statement = (
        update(UserSessionModel)
        .where(
            UserSessionModel.user_id == user_id,
            UserSessionModel.revoked_at.is_(None),
        )
        .values(revoked_at=utc_now())
    )

    result = db.execute(statement)
    db.commit()
    return result.rowcount`}),(0,w.jsx)(C,{caption:`endpoint logout all`,code:`@router.post(
    "/logout-all",
    status_code=status.HTTP_204_NO_CONTENT,
)
def logout_all_sessions(
    response: Response,
    current_user: CurrentUser,
    db: SessionDep,
) -> None:
    revoke_all_user_sessions(db, current_user.id)
    response.delete_cookie(
        key=settings.session_cookie_name,
        path="/",
    )`}),(0,w.jsx)(p,{question:`По какому условию отзываются все устройства?`,left:{title:`Только текущий token`,code:`WHERE token_digest = current_digest`,note:`Завершает одну session.`},right:{title:`Все sessions пользователя`,code:`WHERE user_id = current_user.id AND revoked_at IS NULL`,note:`Завершает каждый активный вход.`},preferred:`right`,explanation:`Logout-all выражает область операции через user_id.`}),(0,w.jsx)(i,{tone:`info`,children:`Количество обновлённых строк полезно для внутренних тестов и логов, но не обязательно возвращать клиенту в 204 response.`})]}),(0,w.jsxs)(d,{number:`06`,title:`Ошибка rollback при отзыве`,children:[(0,w.jsx)(u,{children:`Revocation изменяет базу и поэтому подчиняется тем же транзакционным правилам, что CRUD. При ошибке commit выполняется rollback, а endpoint не должен заявлять успешный logout.`}),(0,w.jsx)(C,{caption:`безопасный service`,code:`from sqlalchemy.exc import SQLAlchemyError

class SessionRevocationError(Exception):
    pass

def revoke_session(db: Session, session: UserSessionModel) -> None:
    session.revoked_at = utc_now()

    try:
        db.commit()
    except SQLAlchemyError as error:
        db.rollback()
        raise SessionRevocationError from error`}),(0,w.jsx)(n,{code:`session.revoked_at = utc_now()
try:
    db.commit()
except SQLAlchemyError:
    response.delete_cookie("studyhub_session")`,question:`Какое обязательное действие пропущено после database error?`,options:[`db.rollback()`,`создание нового пользователя`,`декодирование JWT`],correctIndex:0,explanation:`Session SQLAlchemy должна выйти из failed transaction state.`,fix:`try:
    db.commit()
except SQLAlchemyError as error:
    db.rollback()
    raise SessionRevocationError from error`}),(0,w.jsx)(y,{question:`Почему нельзя удалить cookie и скрыть ошибку commit?`,answer:(0,w.jsx)(`p`,{children:`Клиент подумает, что logout завершён, хотя server-side token продолжит действовать. Нельзя сообщать успех при несогласованном состоянии.`})}),(0,w.jsx)(i,{children:`При временной ошибке пользователь может повторить logout. Безопасность требует честно сохранить серверный результат, а не только изменить интерфейс браузера.`})]}),(0,w.jsxs)(d,{number:`07`,title:`Два клиента доказывают область logout`,children:[(0,w.jsx)(u,{children:`Два экземпляра TestClient моделируют два устройства с независимыми cookie jar. Это позволяет доказать разницу между logout текущей session и logout-all.`}),(0,w.jsx)(C,{caption:`logout одного устройства`,code:`def test_logout_revokes_only_current_session(app, user):
    laptop = TestClient(app)
    phone = TestClient(app)

    login(laptop, user)
    login(phone, user)

    assert laptop.post("/auth/session/logout").status_code == 204
    assert laptop.get("/users/me").status_code == 401
    assert phone.get("/users/me").status_code == 200`}),(0,w.jsx)(C,{caption:`logout всех устройств`,code:`def test_logout_all_revokes_every_session(app, user):
    laptop = TestClient(app)
    phone = TestClient(app)

    login(laptop, user)
    login(phone, user)

    assert laptop.post("/auth/session/logout-all").status_code == 204
    assert laptop.get("/users/me").status_code == 401
    assert phone.get("/users/me").status_code == 401`}),(0,w.jsx)(b,{title:`session lifecycle tests`,lines:[{cmd:`pytest tests/test_session_logout.py -q`},{out:`logout current device PASSED`},{out:`old token rejected PASSED`},{out:`other device remains active PASSED`},{out:`logout all devices PASSED`},{out:`4 passed`}]}),(0,w.jsx)(i,{tone:`info`,children:`Не копируйте cookies между laptop и phone fixtures. Их независимость и является частью тестируемого контракта.`}),(0,w.jsxs)(`div`,{className:`lesson-practice-steps`,children:[(0,w.jsx)(`h3`,{children:`Security decision`}),(0,w.jsx)(`p`,{children:`Проверка expires_at и revoked_at остаётся в request pipeline независимо от наличия cleanup job.`}),(0,w.jsx)(`h3`,{children:`Housekeeping decision`}),(0,w.jsx)(`p`,{children:`Старые строки можно удалять отдельной командой обслуживания по согласованному retention period.`}),(0,w.jsx)(`h3`,{children:`Operational boundary`}),(0,w.jsx)(`p`,{children:`Планировщик фоновых задач и распределённая очистка относятся к будущим этапам. Сейчас достаточно тестируемой функции cleanup_expired_sessions.`})]}),(0,w.jsx)(C,{caption:`явная очистка для административной команды`,code:`from sqlalchemy import delete

def cleanup_old_sessions(db: Session, cutoff: datetime) -> int:
    statement = delete(UserSessionModel).where(
        UserSessionModel.expires_at < cutoff,
    )
    result = db.execute(statement)
    db.commit()
    return result.rowcount`}),(0,w.jsx)(i,{children:`Cleanup не вызывается из get_current_user. Authentication request должен оставаться коротким и не выполнять несвязанное массовое удаление.`})]}),(0,w.jsxs)(d,{number:`08`,title:`Контрольная точка: lifecycle session`,children:[(0,w.jsx)(u,{children:`Session теперь имеет полный жизненный цикл: создаётся при login, используется current_user dependency, завершается по expires_at или revoked_at и может очищаться отдельной служебной операцией.`}),(0,w.jsxs)(`div`,{className:`lesson-check-group`,children:[(0,w.jsx)(m,{question:`Почему delete_cookie недостаточно?`,options:[`server-side session останется активной`,`удалится User`,`изменится password_hash`],correctIndex:0,explanation:`Сервер продолжит принимать скопированный token без revocation.`}),(0,w.jsx)(m,{question:`Что изменяет logout текущего устройства?`,options:[`одну CurrentSession`,`все Users`,`все задачи`],correctIndex:0,explanation:`Точечный logout работает с записью, найденной по текущей cookie.`}),(0,w.jsx)(m,{question:`Чем cleanup отличается от expiration?`,options:[`cleanup удаляет старые строки, expiration запрещает доступ`,`ничем`,`cleanup создаёт token`],correctIndex:0,explanation:`Безопасность обеспечивается проверкой времени, а cleanup обслуживает хранилище.`}),(0,w.jsx)(m,{question:`Как проверить несколько устройств?`,options:[`двумя независимыми TestClient`,`одним request body`,`двумя endpoint в одном client`],correctIndex:0,explanation:`Каждый клиент должен иметь собственный cookie jar.`})]}),(0,w.jsx)(r,{points:[(0,w.jsx)(w.Fragment,{children:`Logout изменяет server-side session и клиентскую cookie.`}),(0,w.jsx)(w.Fragment,{children:`CurrentSession предоставляет endpoint конкретную запись входа.`}),(0,w.jsx)(w.Fragment,{children:`revoked_at завершает доступ раньше expires_at.`}),(0,w.jsx)(w.Fragment,{children:`Expiration не зависит от физического удаления строки.`}),(0,w.jsx)(w.Fragment,{children:`Logout-all отзывает активные sessions по user_id.`}),(0,w.jsx)(w.Fragment,{children:`Ошибка commit требует rollback и честного ответа.`}),(0,w.jsx)(w.Fragment,{children:`Два TestClient моделируют два независимых устройства.`})]}),(0,w.jsx)(g,{text:`Реализуйте CurrentSession, POST /auth/session/logout и POST /auth/session/logout-all. Докажите тестами, что старый token получает 401, обычный logout не завершает второе устройство, а logout-all завершает оба.`})]})]})}export{E as Lesson103};