import{t as e}from"./jsx-runtime-lw2jiZar.js";import{A as t,C as n,D as r,E as i,F as a,I as o,L as s,M as c,N as l,O as u,P as d,S as f,T as p,_ as m,b as h,h as g,j as _,p as v,w as y,x as b}from"./shared-UmZHo_CQ.js";import{t as x}from"./hard-drive-CkZKRuK9.js";import{t as S}from"./key-round-D-Q1K68g.js";import{t as C}from"./CodeEditor-BZlrvoTL.js";var w=e(),T=`Блок 18 · Cookie и серверные сессии`;function E({module:e}){return(0,w.jsxs)(l,{children:[(0,w.jsx)(c,{variant:`project`,chip:e??T,title:`Server-side session и session_id`,intro:`Построим серверное состояние входа: создадим криптографически случайный token, сохраним его digest в таблице user_sessions и свяжем с пользователем, сроком действия и признаком отзыва.`,tags:[{icon:(0,w.jsx)(x,{size:14}),label:`session хранится на сервере`},{icon:(0,w.jsx)(S,{size:14}),label:`opaque token → digest`}]}),(0,w.jsx)(a,{link:`Браузер уже умеет вернуть cookie. Теперь сервер создаёт собственную запись session, связывает её с пользователем и хранит срок действия независимо от клиента.`,boundary:`В cookie передаётся непрозрачный случайный token. Данные пользователя, роль и срок действия остаются в базе и не доверяются клиенту.`}),(0,w.jsxs)(d,{number:`01`,title:`Cookie получает смысл только через серверную запись`,children:[(0,w.jsx)(u,{children:`На прошлом занятии браузер научился возвращать значение cookie. Теперь сервер должен решить, что это значение означает. В server-side session клиент хранит только случайный token, а состояние входа находится в таблице приложения.`}),(0,w.jsxs)(`div`,{className:`lesson-route`,children:[(0,w.jsxs)(`ol`,{children:[(0,w.jsxs)(`li`,{children:[(0,w.jsx)(`strong`,{children:`Сгенерировать token:`}),` `,`получить непредсказуемое значение достаточной длины.`]}),(0,w.jsxs)(`li`,{children:[(0,w.jsx)(`strong`,{children:`Сохранить session:`}),` `,`связать digest token с user_id и expires_at.`]}),(0,w.jsxs)(`li`,{children:[(0,w.jsx)(`strong`,{children:`Отдать raw token:`}),` `,`поместить исходное значение только в HttpOnly-cookie.`]}),(0,w.jsxs)(`li`,{children:[(0,w.jsx)(`strong`,{children:`Проверять каждый request:`}),` `,`повторно вычислять digest и искать активную запись.`]})]}),(0,w.jsx)(`p`,{children:`Итог — модель состояния, которую можно отозвать на сервере без изменения учётной записи пользователя.`})]}),(0,w.jsx)(g,{code:`raw token in browser
  ↓ hash
session token_digest in database
  ↓ belongs to
user_id
  ↓ limited by
expires_at and revoked_at`,scenarios:[{label:`создание`,activeLine:2,output:`в базе сохраняется digest`},{label:`проверка`,activeLine:4,output:`session указывает на пользователя`},{label:`отзыв`,activeLine:6,output:`revoked_at прекращает доступ`}]}),(0,w.jsx)(i,{tone:`info`,children:`Session является отдельной сущностью. Пользователь может существовать без активной session, а один пользователь может иметь несколько sessions для разных устройств.`})]}),(0,w.jsxs)(d,{number:`02`,title:`Состав таблицы user_sessions`,children:[(0,w.jsx)(u,{children:`Таблица должна отвечать на четыре вопроса: какой token предъявлен, кому принадлежит session, до какого момента она действует и была ли отозвана раньше срока.`}),(0,w.jsx)(t,{rows:[[(0,w.jsx)(w.Fragment,{children:`id`}),`технический primary key записи session`],[(0,w.jsx)(w.Fragment,{children:`token_digest`}),`уникальный digest случайного token`],[(0,w.jsx)(w.Fragment,{children:`user_id`}),`foreign key владельца session`],[(0,w.jsx)(w.Fragment,{children:`created_at`}),`момент создания для аудита и сортировки`],[(0,w.jsx)(w.Fragment,{children:`expires_at`}),`жёсткая серверная граница срока действия`],[(0,w.jsx)(w.Fragment,{children:`revoked_at`}),`момент ручного отзыва или null для активной session`]]}),(0,w.jsx)(C,{caption:`ORM-модель session`,code:`from datetime import datetime

from sqlalchemy import DateTime, ForeignKey, String
from sqlalchemy.orm import Mapped, mapped_column

class UserSessionModel(Base):
    __tablename__ = "user_sessions"

    id: Mapped[int] = mapped_column(primary_key=True)
    token_digest: Mapped[str] = mapped_column(
        String(64),
        unique=True,
        index=True,
    )
    user_id: Mapped[int] = mapped_column(
        ForeignKey("users.id"),
        index=True,
    )
    created_at: Mapped[datetime] = mapped_column(DateTime())
    expires_at: Mapped[datetime] = mapped_column(DateTime(), index=True)
    revoked_at: Mapped[datetime | None] = mapped_column(
        DateTime(),
        default=None,
    )`}),(0,w.jsx)(v,{prompt:`Соедините поле и проверку, которую оно поддерживает.`,pairs:[{left:`token_digest`,right:`найти session по предъявленному token`},{left:`user_id`,right:`загрузить владельца session`},{left:`expires_at`,right:`отклонить просроченный вход`},{left:`revoked_at`,right:`отклонить отозванный вход`}],explanation:`Каждое поле существует ради конкретной части контракта проверки.`}),(0,w.jsx)(i,{children:`Уникальность token_digest защищается ограничением базы. Индекс ускоряет поиск, но подробная работа индексов остаётся для этапа SQL и PostgreSQL.`})]}),(0,w.jsxs)(d,{number:`03`,title:`Генерация непрозрачного token`,children:[(0,w.jsx)(u,{children:`Session token должен быть непредсказуемым. Для этого используется модуль secrets, предназначенный для security-sensitive случайных значений. Последовательный id, email или текущее время для этой роли не подходят.`}),(0,w.jsx)(C,{caption:`генерация raw token`,code:`import secrets

def generate_session_token() -> str:
    return secrets.token_urlsafe(32)

raw_token = generate_session_token()
print(len(raw_token))`}),(0,w.jsx)(p,{question:`Какой token сложнее угадать внешнему клиенту?`,left:{title:`Предсказуемый идентификатор`,code:`token = str(user.id)`,note:`Значения идут последовательно и раскрывают внутренний id.`},right:{title:`Криптографически случайный token`,code:`token = secrets.token_urlsafe(32)`,note:`Значение имеет высокую энтропию и не кодирует user_id.`},preferred:`right`,explanation:`Session token должен быть capability: кто владеет значением, тот может предъявить его серверу.`}),(0,w.jsx)(n,{code:`from random import randint

def generate_session_token():
    return str(randint(100000, 999999))`,question:`Почему шестизначное значение не подходит для долгоживущей session?`,options:[`Пространство значений мало и token можно перебирать`,`Функция возвращает строку`,`FastAPI принимает только UUID`],correctIndex:0,explanation:`Для session нужен непредсказуемый token с большим пространством вариантов.`,fix:`import secrets

def generate_session_token() -> str:
    return secrets.token_urlsafe(32)`}),(0,w.jsx)(i,{tone:`info`,children:`Token не нужно делать читаемым. Его задача — быть уникальным и практически неугадываемым, а не нести данные пользователя.`})]}),(0,w.jsxs)(d,{number:`04`,title:`Почему в базе хранится digest`,children:[(0,w.jsx)(u,{children:`Если база утечёт вместе с raw session tokens, злоумышленник сможет сразу предъявить их API. Поэтому StudyHub сохраняет односторонний SHA-256 digest, а исходный token показывает только клиенту в момент создания.`}),(0,w.jsx)(C,{caption:`digest session token`,code:`from hashlib import sha256

def digest_session_token(raw_token: str) -> str:
    return sha256(raw_token.encode("utf-8")).hexdigest()

raw_token = generate_session_token()
token_digest = digest_session_token(raw_token)`}),(0,w.jsxs)(s,{children:[(0,w.jsx)(o,{badge:`browser`,title:`Raw token`,code:`V9b...случайное значение...K2`,children:`Предъявляется в cookie. После ответа серверу не нужно хранить его в открытом виде.`}),(0,w.jsx)(o,{badge:`database`,badgeTone:`float`,title:`Digest`,code:`64 hex symbols`,children:`Используется как ключ поиска. Из digest нельзя практично восстановить случайный token.`}),(0,w.jsx)(o,{badge:`password`,badgeTone:`str`,title:`Другая задача`,code:`Argon2 / bcrypt`,children:`Пароли имеют низкую энтропию и требуют медленного password hashing. Их нельзя заменять быстрым SHA-256.`})]}),(0,w.jsx)(f,{statement:(0,w.jsx)(w.Fragment,{children:`Раз SHA-256 подходит для случайного session token, его можно использовать вместо password hashing.`}),isTrue:!1,explanation:`Пароль выбирает человек и его можно перебирать по словарю. Для паролей нужен специализированный медленный алгоритм с солью.`}),(0,w.jsx)(b,{question:`Как сервер находит session, не сохраняя raw token?`,answer:(0,w.jsx)(`p`,{children:`Он получает raw token из cookie, вычисляет тем же способом digest и ищет строку по token_digest.`})})]}),(0,w.jsxs)(d,{number:`05`,title:`Срок действия рассчитывает сервер`,children:[(0,w.jsx)(u,{children:`Срок действия session фиксируется как абсолютный момент expires_at. При каждой проверке сервер сравнивает его с текущим временем. Max-Age в cookie помогает браузеру, но не является серверной гарантией.`}),(0,w.jsx)(C,{caption:`создание временной границы`,code:`from datetime import UTC, datetime, timedelta

SESSION_TTL = timedelta(minutes=30)

def utc_now() -> datetime:
    return datetime.now(UTC)

def calculate_expiration() -> datetime:
    return utc_now() + SESSION_TTL`}),(0,w.jsx)(g,{code:`if session is None:
    reject 401
elif session.revoked_at is not None:
    reject 401
elif session.expires_at <= now:
    reject 401
else:
    session is active`,scenarios:[{label:`неизвестный token`,activeLine:1,output:`401`},{label:`отозван`,activeLine:3,output:`401`},{label:`просрочен`,activeLine:5,output:`401`},{label:`действует`,activeLine:7,output:`continue`}]}),(0,w.jsx)(m,{code:`created_at = 12:00
expires_at = 12:30
request_time = 12:31

active = expires_at > request_time`,output:`False`,hint:`Сервер сравнивает абсолютные моменты, а не доверяет наличию cookie.`}),(0,w.jsx)(i,{children:`В проекте выберите одну временную модель и используйте её последовательно. Наивные и timezone-aware datetime нельзя смешивать без явного преобразования.`})]}),(0,w.jsxs)(d,{number:`06`,title:`create_session как сервисная операция`,children:[(0,w.jsx)(u,{children:`Создание session объединяет генерацию token, подготовку ORM-объекта и сохранение транзакции. Функция возвращает raw token вызывающему endpoint, но в базе оставляет только digest.`}),(0,w.jsx)(C,{caption:`session service`,code:`from sqlalchemy.orm import Session

def create_session(db: Session, user_id: int) -> str:
    raw_token = generate_session_token()

    session = UserSessionModel(
        token_digest=digest_session_token(raw_token),
        user_id=user_id,
        created_at=utc_now(),
        expires_at=calculate_expiration(),
        revoked_at=None,
    )

    db.add(session)
    db.commit()
    return raw_token`}),(0,w.jsx)(y,{title:`Соберите создание session`,prompt:`Расположите действия так, чтобы клиент получил token только после успешной фиксации.`,pieces:[{id:`raw`,code:`raw_token = generate_session_token()`},{id:`digest`,code:`token_digest = digest_session_token(raw_token)`},{id:`model`,code:`session = UserSessionModel(...)`},{id:`add`,code:`db.add(session)`},{id:`commit`,code:`db.commit()`},{id:`return`,code:`return raw_token`}],correctOrder:[`raw`,`digest`,`model`,`add`,`commit`,`return`],explanation:`Сначала создаётся и фиксируется серверное состояние, затем raw token передаётся HTTP-слою.`}),(0,w.jsx)(n,{code:`def create_session(db, user_id):
    raw_token = generate_session_token()
    db.add(UserSessionModel(...))
    return raw_token
    db.commit()`,question:`Почему клиент получит token без сохранённой session?`,options:[`commit расположен после недостижимого return`,`token слишком длинный`,`user_id должен быть строкой`],correctIndex:0,explanation:`Код после return не выполняется, поэтому запись не фиксируется.`,fix:`def create_session(db, user_id):
    raw_token = generate_session_token()
    db.add(UserSessionModel(...))
    db.commit()
    return raw_token`}),(0,w.jsx)(i,{tone:`info`,children:`Endpoint не должен заново реализовывать генерацию и digest. Он вызывает один сервисный контракт create_session.`})]}),(0,w.jsxs)(d,{number:`07`,title:`Несколько устройств и независимый отзыв`,children:[(0,w.jsx)(u,{children:`Один пользователь может войти с ноутбука и телефона. В server-side модели каждое устройство получает отдельную строку user_sessions и отдельный raw token.`}),(0,w.jsx)(C,{caption:`две sessions одного пользователя`,code:`user_id=7

session A:
  token_digest=aaa...
  device=browser
  revoked_at=None

session B:
  token_digest=bbb...
  device=phone
  revoked_at=None`}),(0,w.jsxs)(s,{children:[(0,w.jsx)(o,{badge:`device A`,title:`Текущий браузер`,code:`session id=41`,children:`Logout может отозвать только эту строку.`}),(0,w.jsx)(o,{badge:`device B`,badgeTone:`float`,title:`Телефон`,code:`session id=52`,children:`Продолжает работать, если политика требует logout только текущего устройства.`}),(0,w.jsx)(o,{badge:`all`,badgeTone:`str`,title:`Все устройства`,code:`UPDATE sessions SET revoked_at=now`,children:`Отдельная операция отзывает все активные sessions пользователя.`})]}),(0,w.jsx)(p,{question:`Что лучше моделирует вход с нескольких устройств?`,left:{title:`Одна колонка token в users`,code:`users.session_token`,note:`Новый login перезаписывает предыдущий и смешивает учётную запись с устройством.`},right:{title:`Отдельная таблица sessions`,code:`user_sessions(user_id, token_digest, ...)`,note:`Каждый вход имеет собственный lifecycle.`},preferred:`right`,explanation:`Отдельная сущность поддерживает несколько устройств, срок действия и точечный отзыв.`}),(0,w.jsx)(b,{question:`Почему session не стоит хранить одной колонкой в users?`,answer:(0,w.jsx)(`p`,{children:`Учётная запись и конкретный вход имеют разные жизненные циклы. Один пользователь может иметь несколько входов и отзывать их независимо.`})}),(0,w.jsxs)(`div`,{className:`lesson-practice-steps`,children:[(0,w.jsx)(`h3`,{children:`Размещение кода`}),(0,w.jsx)(`p`,{children:`ORM-модель остаётся в models/session.py, генерация и digest — в services/session.py, а HTTP-cookie будет формироваться в auth router. Такое разделение не требует generic repository.`}),(0,w.jsx)(`h3`,{children:`Инвариант хранения`}),(0,w.jsx)(`p`,{children:`Ни один SELECT из user_sessions не должен возвращать raw token, потому что этого поля нет в таблице.`}),(0,w.jsx)(`h3`,{children:`Проверка коллизии`}),(0,w.jsx)(`p`,{children:`Уникальное ограничение token_digest остаётся последней гарантией. При практически невероятной коллизии сервис не выдаёт несохранённый token и обрабатывает transaction error.`})]}),(0,w.jsx)(C,{caption:`границы файлов`,code:`app/
├── models/session.py        # UserSessionModel
├── services/session.py      # generate, digest, create
├── routers/session_auth.py  # login/logout HTTP
└── config.py                # ttl и имя cookie`}),(0,w.jsx)(i,{children:`Не добавляйте device fingerprinting, IP-binding или Redis на этом этапе. Они создают новые риски и не нужны для понимания базового server-side lifecycle.`})]}),(0,w.jsxs)(d,{number:`08`,title:`Контрольная точка: серверное состояние входа`,children:[(0,w.jsx)(u,{children:`Ученик должен уметь проследить token от генерации до проверки: raw значение получает браузер, digest хранится в user_sessions, а user_id, expires_at и revoked_at определяют серверное состояние.`}),(0,w.jsxs)(`div`,{className:`lesson-check-group`,children:[(0,w.jsx)(h,{question:`Что хранит браузер?`,options:[`случайный raw session token`,`password_hash`,`полную ORM-модель`],correctIndex:0,explanation:`Клиент получает только непрозрачный token.`}),(0,w.jsx)(h,{question:`Зачем token_digest в базе?`,options:[`не хранить предъявляемый token открыто`,`ускорить password hashing`,`создать cookie`],correctIndex:0,explanation:`При утечке базы digest нельзя напрямую предъявить как session token.`}),(0,w.jsx)(h,{question:`Что определяет server-side срок?`,options:[`expires_at в session`,`наличие вкладки браузера`,`заголовок Accept`],correctIndex:0,explanation:`Сервер проверяет абсолютный момент окончания.`}),(0,w.jsx)(h,{question:`Почему session — отдельная таблица?`,options:[`поддержать несколько входов и независимый отзыв`,`заменить users`,`хранить JSON body`],correctIndex:0,explanation:`У session собственный lifecycle, отличный от пользователя.`})]}),(0,w.jsx)(r,{points:[(0,w.jsx)(w.Fragment,{children:`Server-side session хранит состояние входа в базе приложения.`}),(0,w.jsx)(w.Fragment,{children:`Клиент получает непрозрачный криптографически случайный token.`}),(0,w.jsx)(w.Fragment,{children:`В базе сохраняется digest, а не raw token.`}),(0,w.jsx)(w.Fragment,{children:`SHA-256 для случайного token не заменяет password hashing.`}),(0,w.jsx)(w.Fragment,{children:`expires_at проверяется сервером при каждом защищённом запросе.`}),(0,w.jsx)(w.Fragment,{children:`revoked_at позволяет завершить session раньше срока.`}),(0,w.jsx)(w.Fragment,{children:`Отдельная таблица поддерживает несколько устройств одного пользователя.`})]}),(0,w.jsx)(_,{text:`Создайте UserSessionModel, функции generate_session_token(), digest_session_token() и create_session(). Проверьте, что raw token не попадает в SQLite, а один пользователь может иметь две независимые session.`})]})]})}export{E as Lesson100};