import{t as e}from"./jsx-runtime-lw2jiZar.js";import{A as t,C as n,D as r,E as i,F as a,H as o,I as s,L as c,M as l,N as u,O as d,P as f,S as p,T as m,b as h,g,h as _,j as v,w as y,x as b,y as x}from"./shared-C5BCElVa.js";import{t as S}from"./lock-keyhole-JZvqd0_O.js";import{t as C}from"./CodeEditor-BZlrvoTL.js";var w=e(),T=`Блок 18 · Cookie и серверные сессии`;function E({module:e}){return(0,w.jsxs)(u,{children:[(0,w.jsx)(l,{variant:`project`,chip:e??T,title:`Session login`,intro:`Соединим готовую проверку credentials с серверной session: endpoint примет email и пароль, вызовет authenticate_user, сохранит session, установит HttpOnly-cookie и вернёт безопасный профиль.`,tags:[{icon:(0,w.jsx)(S,{size:14}),label:`credentials → session`},{icon:(0,w.jsx)(o,{size:14}),label:`service + HTTP response`}]}),(0,w.jsx)(a,{link:`Функция authenticate_user уже проверяет email и пароль. Session login превращает успешную проверку credentials в сохранённую серверную сессию и HttpOnly-cookie.`,boundary:`Проверка пароля, создание session и формирование HTTP-ответа — три разные ответственности. Endpoint только координирует их.`}),(0,w.jsxs)(f,{number:`01`,title:`Login — оркестрация нескольких готовых контрактов`,children:[(0,w.jsx)(d,{children:`В блоке 17 уже появились authenticate_user и безопасная проверка пароля. На этом занятии мы не переписываем их. Login endpoint связывает существующую аутентификацию с созданием session и HTTP-cookie.`}),(0,w.jsxs)(`div`,{className:`lesson-route`,children:[(0,w.jsxs)(`ol`,{children:[(0,w.jsxs)(`li`,{children:[(0,w.jsx)(`strong`,{children:`Принять credentials:`}),` `,`Pydantic проверяет форму email и password.`]}),(0,w.jsxs)(`li`,{children:[(0,w.jsx)(`strong`,{children:`Аутентифицировать:`}),` `,`authenticate_user возвращает активного User или None.`]}),(0,w.jsxs)(`li`,{children:[(0,w.jsx)(`strong`,{children:`Создать session:`}),` `,`сервис фиксирует token_digest, user_id и expires_at.`]}),(0,w.jsxs)(`li`,{children:[(0,w.jsx)(`strong`,{children:`Сформировать ответ:`}),` `,`raw token уходит в HttpOnly-cookie, профиль — в JSON.`]})]}),(0,w.jsx)(`p`,{children:`Главная профессиональная модель: endpoint является application boundary и координирует операции, но не реализует криптографию или SQL вручную.`})]}),(0,w.jsx)(_,{code:`request credentials
  ↓ validate
LoginRequest
  ↓ authenticate
authenticate_user
  ↓ create state
create_session
  ↓ HTTP response
Set-Cookie + UserRead`,scenarios:[{label:`body`,activeLine:2,output:`валидная Pydantic-модель`},{label:`credentials`,activeLine:4,output:`User или None`},{label:`session`,activeLine:6,output:`raw token после commit`},{label:`response`,activeLine:8,output:`cookie и безопасный JSON`}]}),(0,w.jsx)(i,{tone:`info`,children:`Session login не означает, что пароль хранится в session. Credentials используются только для входа, после чего следующие запросы предъявляют случайный session token.`})]}),(0,w.jsxs)(f,{number:`02`,title:`Контракт запроса и ответа`,children:[(0,w.jsx)(d,{children:`Отдельные схемы делают границу видимой: LoginRequest содержит секрет входа, а UserRead гарантирует, что password и password_hash не попадут в ответ.`}),(0,w.jsx)(C,{caption:`Pydantic-схемы login`,code:`from pydantic import BaseModel, EmailStr, Field

class SessionLoginRequest(BaseModel):
    email: EmailStr
    password: str = Field(min_length=8, max_length=128)

class UserRead(BaseModel):
    id: int
    email: EmailStr
    username: str
    is_active: bool

    model_config = {"from_attributes": True}`}),(0,w.jsxs)(c,{children:[(0,w.jsx)(s,{badge:`input`,title:`SessionLoginRequest`,code:`email + password`,children:`Существует только на входной границе. Password не записывается в session и не возвращается клиенту.`}),(0,w.jsx)(s,{badge:`domain`,badgeTone:`float`,title:`UserModel`,code:`password_hash`,children:`Загружается из базы для проверки, но не является HTTP-ответом.`}),(0,w.jsx)(s,{badge:`output`,badgeTone:`str`,title:`UserRead`,code:`id + email + username`,children:`Фильтрует публичные поля и документирует OpenAPI-контракт.`})]}),(0,w.jsx)(n,{code:`@router.post("/login")
def login(data: SessionLoginRequest, db: SessionDep):
    user = find_user_by_email(db, data.email)
    return user`,question:`Какой риск появляется при возврате ORM-модели без response schema?`,options:[`Можно случайно выдать password_hash и внутренние поля`,`Cookie станет Secure`,`SQLAlchemy удалит пользователя`],correctIndex:0,explanation:`HTTP-ответ должен иметь отдельную безопасную схему.`,fix:`@router.post("/login", response_model=UserRead)
def login(...):
    ...
    return user`}),(0,w.jsx)(i,{children:`Даже если текущая сериализация не показывает hash, контракт должен запрещать его явно. Безопасность не строится на случайном наборе полей.`})]}),(0,w.jsxs)(f,{number:`03`,title:`Единое сообщение для неверных credentials`,children:[(0,w.jsx)(d,{children:`Login не должен подсказывать, существует ли конкретный email. Одинаковый ответ для неизвестного пользователя и неправильного пароля уменьшает утечку информации через контракт API.`}),(0,w.jsx)(C,{caption:`проверка credentials`,code:`from fastapi import HTTPException, status

INVALID_CREDENTIALS = HTTPException(
    status_code=status.HTTP_401_UNAUTHORIZED,
    detail="Неверные данные для входа",
)

def require_authenticated_user(
    db: Session,
    data: SessionLoginRequest,
) -> UserModel:
    user = authenticate_user(
        db=db,
        email=str(data.email),
        password=data.password,
    )

    if user is None:
        raise INVALID_CREDENTIALS

    return user`}),(0,w.jsx)(m,{question:`Какой ответ меньше раскрывает состояние базы?`,left:{title:`Разные сообщения`,code:`404 email не найден
401 пароль неверен`,note:`Клиент может перебирать email и узнавать зарегистрированные адреса.`},right:{title:`Единый контракт`,code:`401 Неверные данные для входа`,note:`Не раскрывает, какая часть credentials не совпала.`},preferred:`right`,explanation:`Внутренние причины можно логировать осторожно, но внешний ответ остаётся единым.`}),(0,w.jsx)(p,{statement:(0,w.jsx)(w.Fragment,{children:`401 при login означает, что сервер обязан сообщить, был ли неверным email или пароль.`}),isTrue:!1,explanation:`HTTP-статус сообщает, что аутентификация не состоялась. Детализировать конкретную причину небезопасно.`}),(0,w.jsx)(i,{tone:`info`,children:`Не логируйте введённый пароль. Для диагностики достаточно технического события, безопасного идентификатора запроса и общей причины отказа.`})]}),(0,w.jsxs)(f,{number:`04`,title:`Endpoint фиксирует session до установки cookie`,children:[(0,w.jsx)(d,{children:`Клиент должен получить token только для реально сохранённой session. Поэтому create_session завершает commit, и лишь затем endpoint добавляет Set-Cookie в успешный response.`}),(0,w.jsx)(C,{caption:`session login endpoint`,code:`from fastapi import APIRouter, Response, status

router = APIRouter(prefix="/auth/session", tags=["session auth"])

@router.post(
    "/login",
    response_model=UserRead,
    status_code=status.HTTP_200_OK,
)
def session_login(
    data: SessionLoginRequest,
    response: Response,
    db: SessionDep,
):
    user = require_authenticated_user(db, data)
    raw_token = create_session(db, user.id)
    set_session_cookie(response, raw_token)
    return user`}),(0,w.jsx)(y,{title:`Соберите endpoint login`,prompt:`Выберите порядок, при котором невалидный пользователь не получает cookie.`,pieces:[{id:`user`,code:`user = require_authenticated_user(db, data)`},{id:`session`,code:`raw_token = create_session(db, user.id)`},{id:`cookie`,code:`set_session_cookie(response, raw_token)`},{id:`return`,code:`return user`},{id:`wrong`,code:`set_session_cookie(response, data.password)`,note:`секрет нельзя помещать в cookie`}],correctOrder:[`user`,`session`,`cookie`,`return`],explanation:`Аутентификация предшествует созданию состояния, а cookie устанавливается только для сохранённой session.`}),(0,w.jsx)(g,{prompt:`Что передаётся в session cookie?`,before:`set_session_cookie(response, `,after:`)`,options:[`raw_token`,`data.password`,`user.password_hash`],answer:`raw_token`,explanation:`Cookie получает случайный token, а не пароль или hash.`}),(0,w.jsx)(i,{children:`HTTP status 200 подходит для успешного login: новый пользователь не создаётся, создаётся только состояние входа.`})]}),(0,w.jsxs)(f,{number:`05`,title:`Ошибка транзакции не должна оставлять ложный login`,children:[(0,w.jsx)(d,{children:`Создание session может завершиться ошибкой базы. Сервис выполняет rollback и не возвращает raw token. Endpoint в таком случае не должен формировать Set-Cookie.`}),(0,w.jsx)(C,{caption:`транзакционная защита`,code:`from sqlalchemy.exc import SQLAlchemyError

class SessionCreationError(Exception):
    pass

def create_session(db: Session, user_id: int) -> str:
    raw_token = generate_session_token()
    model = build_session_model(raw_token, user_id)

    try:
        db.add(model)
        db.commit()
    except SQLAlchemyError as error:
        db.rollback()
        raise SessionCreationError from error

    return raw_token`}),(0,w.jsx)(_,{code:`try:
    add session
    commit
except database error:
    rollback
    raise service error
else:
    return raw token`,scenarios:[{label:`commit успешен`,activeLine:7,output:`token передаётся endpoint`},{label:`ошибка базы`,activeLine:4,output:`rollback`},{label:`после rollback`,activeLine:5,output:`cookie не устанавливается`}]}),(0,w.jsx)(n,{code:`raw_token = generate_session_token()
set_session_cookie(response, raw_token)
create_session(db, user.id)`,question:`Почему порядок создаёт несогласованное состояние?`,options:[`Ответ уже содержит token до успешного commit`,`Cookie нельзя устанавливать в POST`,`Session должна создаваться в браузере`],correctIndex:0,explanation:`При ошибке базы клиент получил бы token, которому не соответствует запись.`,fix:`raw_token = create_session(db, user.id)
set_session_cookie(response, raw_token)`}),(0,w.jsx)(i,{tone:`info`,children:`Граница успешного login — не генерация token, а успешная фиксация server-side session.`})]}),(0,w.jsxs)(f,{number:`06`,title:`Политика повторного входа`,children:[(0,w.jsx)(d,{children:`Повторный login можно моделировать по-разному. В этом блоке каждый успешный вход создаёт новую session. Такой контракт прост, поддерживает несколько устройств и не требует скрытого поиска предыдущей cookie.`}),(0,w.jsxs)(c,{children:[(0,w.jsx)(s,{badge:`new`,title:`Новая session на login`,code:`INSERT user_sessions`,children:`Основной учебный вариант: каждый вход получает независимый token и lifecycle.`}),(0,w.jsx)(s,{badge:`rotate`,badgeTone:`float`,title:`Ротация текущей`,code:`revoke old → create new`,children:`Возможная политика, но требует сначала надёжно определить текущую session.`}),(0,w.jsx)(s,{badge:`single`,badgeTone:`str`,title:`Только одно устройство`,code:`revoke all before login`,children:`Допустимое бизнес-правило, но не используется в StudyHub по умолчанию.`})]}),(0,w.jsx)(m,{question:`Какой вариант соответствует выбранному контракту StudyHub?`,left:{title:`Перезаписывать token в users`,code:`user.session_token = new_token`,note:`Смешивает учётную запись и конкретное устройство.`},right:{title:`Добавлять строку session`,code:`create_session(db, user.id)`,note:`Сохраняет независимые входы и позволяет точечный logout.`},preferred:`right`,explanation:`Политика нескольких устройств выражается отдельными строками user_sessions.`}),(0,w.jsx)(b,{question:`Что произойдёт при двух успешных login одного пользователя?`,answer:(0,w.jsx)(`p`,{children:`Будут созданы две независимые server-side sessions. Каждый клиент получит собственный raw token.`})}),(0,w.jsx)(i,{children:`Политику нужно документировать. Неявное поведение login приводит к неожиданным logout на других устройствах.`})]}),(0,w.jsxs)(f,{number:`07`,title:`Интеграционный тест login`,children:[(0,w.jsx)(d,{children:`Тест должен доказать не только status code. Он проверяет Set-Cookie, отсутствие секретов в JSON, создание digest в базе и возможность продолжить сценарий тем же клиентом.`}),(0,w.jsx)(C,{caption:`успешный login`,code:`def test_session_login_sets_cookie(
    client,
    db_session,
    registered_user,
):
    response = client.post(
        "/auth/session/login",
        json={
            "email": registered_user.email,
            "password": "correct-password",
        },
    )

    assert response.status_code == 200
    assert "studyhub_session" in response.cookies
    assert "password_hash" not in response.json()

    session = db_session.scalar(
        select(UserSessionModel).where(
            UserSessionModel.user_id == registered_user.id,
        )
    )
    assert session is not None`}),(0,w.jsx)(C,{caption:`неверный пароль`,code:`def test_session_login_rejects_bad_password(client, registered_user):
    response = client.post(
        "/auth/session/login",
        json={
            "email": registered_user.email,
            "password": "wrong-password",
        },
    )

    assert response.status_code == 401
    assert "studyhub_session" not in response.cookies`}),(0,w.jsx)(x,{title:`контрольный сценарий`,lines:[{cmd:`pytest tests/test_session_login.py -q`},{out:`test_session_login_sets_cookie PASSED`},{out:`test_session_login_rejects_bad_password PASSED`},{out:`2 passed`}]}),(0,w.jsx)(i,{tone:`info`,children:`В тестовой базе не сравнивайте raw token с token_digest: это разные представления. Вычислите digest cookie и найдите соответствующую запись.`}),(0,w.jsxs)(`div`,{className:`lesson-practice-steps`,children:[(0,w.jsx)(`h3`,{children:`Ручной happy path`}),(0,w.jsx)(`p`,{children:`Зарегистрируйте пользователя, выполните login и убедитесь, что JSON не содержит password_hash, а response содержит Set-Cookie.`}),(0,w.jsx)(`h3`,{children:`Ручной negative path`}),(0,w.jsx)(`p`,{children:`Повторите запрос с неверным паролем. Ответ должен быть 401, новая запись session не создаётся, а Set-Cookie отсутствует.`}),(0,w.jsx)(`h3`,{children:`Повторный login`}),(0,w.jsx)(`p`,{children:`Выполните login вторым TestClient и подтвердите две строки user_sessions с одним user_id и разными token_digest.`})]}),(0,w.jsx)(t,{rows:[[(0,w.jsx)(w.Fragment,{children:`201 registration`}),`создаёт учётную запись`],[(0,w.jsx)(w.Fragment,{children:`200 session login`}),`создаёт состояние входа`],[(0,w.jsx)(w.Fragment,{children:`401 invalid credentials`}),`не создаёт session и cookie`],[(0,w.jsx)(w.Fragment,{children:`UserRead`}),`не содержит password или password_hash`]]}),(0,w.jsx)(i,{children:`Не проверяйте наличие password_hash только визуально. Автоматический тест должен явно утверждать, что секретного поля нет в JSON.`})]}),(0,w.jsxs)(f,{number:`08`,title:`Контрольная точка: credentials становятся session`,children:[(0,w.jsx)(d,{children:`Полный login flow теперь читается как последовательность контрактов: Pydantic проверяет форму, authenticate_user подтверждает credentials, create_session фиксирует состояние, response устанавливает cookie.`}),(0,w.jsxs)(`div`,{className:`lesson-check-group`,children:[(0,w.jsx)(h,{question:`Кто проверяет пароль?`,options:[`authenticate_user`,`set_session_cookie`,`UserRead`],correctIndex:0,explanation:`Login использует готовую функцию проверки credentials.`}),(0,w.jsx)(h,{question:`Когда можно устанавливать cookie?`,options:[`после успешного сохранения session`,`до проверки email`,`в момент импорта роутера`],correctIndex:0,explanation:`Клиент получает token только для существующей server-side записи.`}),(0,w.jsx)(h,{question:`Что возвращает response_model?`,options:[`безопасный публичный профиль`,`password_hash`,`raw ORM Session`],correctIndex:0,explanation:`UserRead ограничивает HTTP-ответ.`}),(0,w.jsx)(h,{question:`Что делает повторный login в выбранной модели?`,options:[`создаёт новую независимую session`,`удаляет пользователя`,`превращает cookie в JWT`],correctIndex:0,explanation:`Каждый успешный вход имеет отдельный lifecycle.`})]}),(0,w.jsx)(r,{points:[(0,w.jsx)(w.Fragment,{children:`Session login использует готовый контракт authenticate_user.`}),(0,w.jsx)(w.Fragment,{children:`LoginRequest принимает секрет, а UserRead исключает его из ответа.`}),(0,w.jsx)(w.Fragment,{children:`Неизвестный email и неверный пароль получают единый 401.`}),(0,w.jsx)(w.Fragment,{children:`Server-side session фиксируется до установки cookie.`}),(0,w.jsx)(w.Fragment,{children:`После ошибки commit выполняется rollback, token клиенту не выдаётся.`}),(0,w.jsx)(w.Fragment,{children:`Каждый login создаёт отдельную session для конкретного клиента.`}),(0,w.jsx)(w.Fragment,{children:`Интеграционный тест проверяет HTTP, cookie и запись базы одновременно.`})]}),(0,w.jsx)(v,{text:`Реализуйте POST /auth/session/login поверх существующего authenticate_user. Добавьте безопасный UserRead, транзакционный create_session и тесты успешного входа, неверного password и отсутствия password_hash в ответе.`})]})]})}export{E as Lesson101};