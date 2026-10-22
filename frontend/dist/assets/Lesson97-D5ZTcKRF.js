import{t as e}from"./jsx-runtime-lw2jiZar.js";import{A as t,C as n,D as r,E as i,F as a,I as o,L as s,M as c,N as l,O as u,P as d,S as f,T as p,b as m,g as h,h as g,j as _,v,w as y,x as b,y as x}from"./shared-DoR5oW6-.js";import{A as S,O as C}from"./index-ChLJS9_n.js";import{t as w}from"./CodeEditor-BZlrvoTL.js";var T=e(),E=`Блок 17 · Пользователь и основы безопасности`;function D({module:e}){return(0,T.jsxs)(l,{children:[(0,T.jsx)(c,{variant:`project`,chip:e??E,title:`Регистрация`,intro:`Соберём POST /auth/register как прозрачный конвейер: Pydantic проверяет форму, сервис нормализует email, база гарантирует уникальность, пароль хешируется до ORM-модели, а клиент получает только UserRead.`,tags:[{icon:(0,T.jsx)(S,{size:14}),label:`POST /auth/register`},{icon:(0,T.jsx)(C,{size:14}),label:`201 · 409 · безопасный ответ`}]}),(0,T.jsx)(a,{link:`Модель и password service готовы, поэтому регистрация собирает валидацию, уникальность, хеширование, транзакцию и безопасный ответ.`,boundary:`Предварительный SELECT улучшает сообщение, но окончательную уникальность гарантирует constraint базы и rollback после IntegrityError.`}),(0,T.jsxs)(d,{number:`01`,title:`Регистрация — операция создания пользователя`,children:[(0,T.jsx)(u,{children:`Регистрация похожа на создание задачи, но цена ошибки выше: в запросе присутствует секрет, email должен быть уникальным, а ответ обязан быть уже очищенным от внутренних полей.`}),(0,T.jsxs)(`div`,{className:`lesson-route`,children:[(0,T.jsxs)(`ol`,{children:[(0,T.jsxs)(`li`,{children:[(0,T.jsx)(`strong`,{children:`Валидация:`}),` проверить формат email, длину username и password до вызова сервиса.`]}),(0,T.jsxs)(`li`,{children:[(0,T.jsx)(`strong`,{children:`Нормализация:`}),` привести email к единой форме, чтобы регистр не создавал псевдодубликаты.`]}),(0,T.jsxs)(`li`,{children:[(0,T.jsx)(`strong`,{children:`Уникальность:`}),` выполнить понятную предварительную проверку и сохранить ограничение базы.`]}),(0,T.jsxs)(`li`,{children:[(0,T.jsx)(`strong`,{children:`Хеширование:`}),` создать password_hash до построения ORM-модели.`]}),(0,T.jsxs)(`li`,{children:[(0,T.jsx)(`strong`,{children:`Безопасный ответ:`}),` вернуть 201 и UserRead без password/password_hash.`]})]}),(0,T.jsx)(`p`,{children:`Endpoint остаётся тонким, а транзакционная операция живёт в сервисе.`})]}),(0,T.jsxs)(s,{children:[(0,T.jsx)(o,{badge:`201`,title:`Создано`,code:`HTTP_201_CREATED`,children:`Новая запись успешно сохранена и представлена через response schema.`}),(0,T.jsx)(o,{badge:`422`,badgeTone:`float`,title:`Неверная форма`,code:`invalid email / short password`,children:`Pydantic отклоняет данные до предметной операции.`}),(0,T.jsx)(o,{badge:`409`,badgeTone:`str`,title:`Конфликт`,code:`HTTP_409_CONFLICT`,children:`Email уже занят и новая запись нарушает уникальность.`})]}),(0,T.jsx)(i,{tone:`info`,children:`Регистрация создаёт аккаунт, но не обязана сразу создавать session или token. Это отдельное решение следующего слоя.`})]}),(0,T.jsxs)(d,{number:`02`,title:`Входная схема останавливает плохую форму`,children:[(0,T.jsx)(u,{children:`Pydantic проверяет структуру, типы и локальные ограничения. Он не ходит в базу за уникальностью — эта проверка относится к сервису.`}),(0,T.jsxs)(`div`,{className:`lesson-practice-steps`,children:[(0,T.jsx)(`h3`,{children:`Главный вопрос сцены`}),(0,T.jsx)(`p`,{children:`Раздел «Входная схема останавливает плохую форму» показывает, как правило влияет на UserCreate → service → Session → UserRead.`}),(0,T.jsx)(`h3`,{children:`Что нужно уметь объяснить`}),(0,T.jsx)(`p`,{children:`Назовите входные данные, выполняемую проверку, успешный результат и ожидаемый отказ до перехода к следующей сцене.`}),(0,T.jsx)(`h3`,{children:`Граница сложности`}),(0,T.jsx)(`p`,{children:`Не смешивайте создание аккаунта с выдачей cookie или JWT: регистрация заканчивается безопасной записью пользователя.`})]}),(0,T.jsx)(w,{caption:`UserCreate с Pydantic v2`,code:`from pydantic import BaseModel, EmailStr, Field, field_validator


class UserCreate(BaseModel):
    email: EmailStr
    username: str = Field(min_length=2, max_length=50)
    password: str = Field(min_length=8, max_length=128)

    @field_validator("username")
    @classmethod
    def username_must_not_be_blank(cls, value: str) -> str:
        cleaned = value.strip()
        if not cleaned:
            raise ValueError("username не должен быть пустым")
        return cleaned`}),(0,T.jsx)(g,{code:`payload = UserCreate.model_validate(data)
if email_has_bad_format:
    return 422
if username_is_blank:
    return 422
if password_is_short:
    return 422
return payload`,scenarios:[{label:`email = bad`,activeLine:2,output:`422 до сервиса`},{label:`username = пробелы`,activeLine:4,output:`422 до сервиса`},{label:`корректная форма`,activeLine:7,output:`UserCreate`}]}),(0,T.jsx)(f,{statement:(0,T.jsx)(T.Fragment,{children:`Field(min_length=8) доказывает, что пароль устойчив к подбору.`}),isTrue:!1,explanation:`Это только минимальное формальное ограничение. Реальная стойкость зависит от значения, политики и password hashing.`})]}),(0,T.jsxs)(d,{number:`03`,title:`Нормализация email и предварительный поиск`,children:[(0,T.jsx)(u,{children:`До запроса к базе email приводится к согласованной форме. Иначе User@Example.com и user@example.com могут стать разными прикладными идентификаторами.`}),(0,T.jsxs)(`div`,{className:`lesson-practice-steps`,children:[(0,T.jsx)(`h3`,{children:`Главный вопрос сцены`}),(0,T.jsx)(`p`,{children:`Раздел «Нормализация email и предварительный поиск» показывает, как правило влияет на UserCreate → service → Session → UserRead.`}),(0,T.jsx)(`h3`,{children:`Что нужно уметь объяснить`}),(0,T.jsx)(`p`,{children:`Назовите входные данные, выполняемую проверку, успешный результат и ожидаемый отказ до перехода к следующей сцене.`}),(0,T.jsx)(`h3`,{children:`Граница сложности`}),(0,T.jsx)(`p`,{children:`Не смешивайте создание аккаунта с выдачей cookie или JWT: регистрация заканчивается безопасной записью пользователя.`})]}),(0,T.jsx)(w,{caption:`нормализация и поиск`,code:`from sqlalchemy import select
from sqlalchemy.orm import Session


def normalize_email(email: str) -> str:
    return email.strip().lower()


def get_user_by_email(db: Session, email: str) -> UserModel | None:
    statement = select(UserModel).where(UserModel.email == email)
    return db.scalar(statement)`}),(0,T.jsx)(v,{code:`email = normalize_email(payload.email)
existing = get_user_by_email(db, email)
if existing is not None:
    raise EmailAlreadyExists
password_hash = hash_password(payload.password)`,steps:[{line:0,note:`Email принимает единую форму до поиска и сохранения.`,vars:{email:`"user@example.com"`}},{line:1,note:`Session выполняет SELECT по индексированной колонке.`,vars:{existing:`None`}},{line:2,note:`Ветка конфликта проверяется до дорогого хеширования.`,vars:{condition:`False`}},{line:4,note:`Только свободный email доходит до password service.`,vars:{password_hash:`$argon2id$...`}}]}),(0,T.jsx)(b,{question:`Почему предварительный SELECT полезен, хотя база всё равно имеет unique constraint?`,answer:(0,T.jsx)(`p`,{children:`Он позволяет вернуть понятный прикладной конфликт в обычном последовательном сценарии. Constraint остаётся страховкой от гонки между SELECT и commit.`})})]}),(0,T.jsxs)(d,{number:`04`,title:`Явное преобразование UserCreate в UserModel`,children:[(0,T.jsx)(u,{children:`Не нужно передавать model_dump() целиком: во входной схеме есть password, а в ORM-модели требуется password_hash. Явное сопоставление делает границу заметной.`}),(0,T.jsxs)(`div`,{className:`lesson-practice-steps`,children:[(0,T.jsx)(`h3`,{children:`Главный вопрос сцены`}),(0,T.jsx)(`p`,{children:`Раздел «Явное преобразование UserCreate в UserModel» показывает, как правило влияет на UserCreate → service → Session → UserRead.`}),(0,T.jsx)(`h3`,{children:`Что нужно уметь объяснить`}),(0,T.jsx)(`p`,{children:`Назовите входные данные, выполняемую проверку, успешный результат и ожидаемый отказ до перехода к следующей сцене.`}),(0,T.jsx)(`h3`,{children:`Граница сложности`}),(0,T.jsx)(`p`,{children:`Не смешивайте создание аккаунта с выдачей cookie или JWT: регистрация заканчивается безопасной записью пользователя.`})]}),(0,T.jsx)(p,{question:`Как безопаснее построить ORM-объект?`,left:{title:`Распаковать весь payload`,code:`user = UserModel(**payload.model_dump())`,note:`ORM не ждёт password, а секрет может попасть в неподходящее место.`},right:{title:`Назвать поля явно`,code:`user = UserModel(
    email=email,
    username=payload.username,
    password_hash=hash_password(payload.password),
)`,note:`Видно преобразование секрета и серверные defaults.`},preferred:`right`,explanation:`На чувствительной границе явность важнее одной короткой строки.`}),(0,T.jsx)(w,{caption:`создание модели`,code:`user = UserModel(
    email=email,
    username=payload.username,
    password_hash=hash_password(payload.password),
    role="user",
    is_active=True,
)

db.add(user)`}),(0,T.jsx)(h,{prompt:`Выберите значение для password_hash.`,before:`password_hash=`,after:`,`,options:[`hash_password(payload.password)`,`payload.password`,`payload.model_dump()`],answer:`hash_password(payload.password)`,explanation:`В сохраняемую модель передаётся только результат password hashing.`})]}),(0,T.jsxs)(d,{number:`05`,title:`Commit, IntegrityError и обязательный rollback`,children:[(0,T.jsx)(u,{children:`Два параллельных запроса могут пройти предварительный SELECT почти одновременно. Unique constraint остановит второй commit, после чего Session нужно вернуть в рабочее состояние.`}),(0,T.jsxs)(`div`,{className:`lesson-practice-steps`,children:[(0,T.jsx)(`h3`,{children:`Главный вопрос сцены`}),(0,T.jsx)(`p`,{children:`Раздел «Commit, IntegrityError и обязательный rollback» показывает, как правило влияет на UserCreate → service → Session → UserRead.`}),(0,T.jsx)(`h3`,{children:`Что нужно уметь объяснить`}),(0,T.jsx)(`p`,{children:`Назовите входные данные, выполняемую проверку, успешный результат и ожидаемый отказ до перехода к следующей сцене.`}),(0,T.jsx)(`h3`,{children:`Граница сложности`}),(0,T.jsx)(`p`,{children:`Не смешивайте создание аккаунта с выдачей cookie или JWT: регистрация заканчивается безопасной записью пользователя.`})]}),(0,T.jsx)(w,{caption:`транзакционная часть сервиса`,code:`from sqlalchemy.exc import IntegrityError


def create_user(db: Session, payload: UserCreate) -> UserModel:
    email = normalize_email(str(payload.email))

    if get_user_by_email(db, email) is not None:
        raise EmailAlreadyExists

    user = UserModel(
        email=email,
        username=payload.username,
        password_hash=hash_password(payload.password),
    )
    db.add(user)

    try:
        db.commit()
    except IntegrityError as error:
        db.rollback()
        raise EmailAlreadyExists from error

    db.refresh(user)
    return user`}),(0,T.jsx)(n,{code:`try:
    db.commit()
except IntegrityError:
    raise HTTPException(status_code=409)`,question:`Чего не хватает после неудачного commit?`,options:[`db.rollback()`,`ещё одного db.add()`,`повторного hash_password()`],correctIndex:0,explanation:`Session остаётся в failed transaction и не должна использоваться до rollback.`,fix:`try:
    db.commit()
except IntegrityError as error:
    db.rollback()
    raise EmailAlreadyExists from error`}),(0,T.jsx)(i,{children:`Сервис переводит SQLAlchemy-ошибку в прикладную EmailAlreadyExists. Router позже переводит прикладную ошибку в HTTP 409.`})]}),(0,T.jsxs)(d,{number:`06`,title:`Тонкий endpoint и безопасный response_model`,children:[(0,T.jsx)(u,{children:`Router связывает HTTP с сервисом: получает payload и Session, вызывает use case, переводит ожидаемый конфликт и возвращает результат через UserRead.`}),(0,T.jsxs)(`div`,{className:`lesson-practice-steps`,children:[(0,T.jsx)(`h3`,{children:`Главный вопрос сцены`}),(0,T.jsx)(`p`,{children:`Раздел «Тонкий endpoint и безопасный response_model» показывает, как правило влияет на UserCreate → service → Session → UserRead.`}),(0,T.jsx)(`h3`,{children:`Что нужно уметь объяснить`}),(0,T.jsx)(`p`,{children:`Назовите входные данные, выполняемую проверку, успешный результат и ожидаемый отказ до перехода к следующей сцене.`}),(0,T.jsx)(`h3`,{children:`Граница сложности`}),(0,T.jsx)(`p`,{children:`Не смешивайте создание аккаунта с выдачей cookie или JWT: регистрация заканчивается безопасной записью пользователя.`})]}),(0,T.jsx)(w,{caption:`app/routers/auth.py`,code:`from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.schemas.user import UserCreate, UserRead
from app.services.users import EmailAlreadyExists, create_user


router = APIRouter(prefix="/auth", tags=["auth"])
DbSession = Annotated[Session, Depends(get_db)]


@router.post(
    "/register",
    response_model=UserRead,
    status_code=status.HTTP_201_CREATED,
)
def register_user(payload: UserCreate, db: DbSession):
    try:
        return create_user(db, payload)
    except EmailAlreadyExists as error:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Email уже зарегистрирован",
        ) from error`}),(0,T.jsxs)(s,{children:[(0,T.jsx)(o,{badge:`router`,title:`HTTP-контракт`,code:`POST /auth/register`,children:`Path, status code, response model и перевод ожидаемой ошибки.`}),(0,T.jsx)(o,{badge:`service`,badgeTone:`float`,title:`Use case`,code:`create_user(db, payload)`,children:`Нормализация, уникальность, хеширование и транзакция.`}),(0,T.jsx)(o,{badge:`schema`,badgeTone:`str`,title:`Фильтр ответа`,code:`response_model=UserRead`,children:`Разрешает только публичные поля UserRead.`})]}),(0,T.jsx)(f,{statement:(0,T.jsx)(T.Fragment,{children:`Endpoint регистрации должен сам создавать JWT, иначе пользователь не считается созданным.`}),isTrue:!1,explanation:`Создание аккаунта и выдача способа доступа являются разными операциями и могут иметь разные правила.`})]}),(0,T.jsxs)(d,{number:`07`,title:`Интеграционные проверки регистрации`,children:[(0,T.jsx)(u,{children:`Тесты проходят через HTTP-границу и отдельную тестовую базу. Они проверяют не внутренние строки хеша, а статус, сохранённые данные и отсутствие секретов в JSON.`}),(0,T.jsxs)(`div`,{className:`lesson-practice-steps`,children:[(0,T.jsx)(`h3`,{children:`Главный вопрос сцены`}),(0,T.jsx)(`p`,{children:`Раздел «Интеграционные проверки регистрации» показывает, как правило влияет на UserCreate → service → Session → UserRead.`}),(0,T.jsx)(`h3`,{children:`Что нужно уметь объяснить`}),(0,T.jsx)(`p`,{children:`Назовите входные данные, выполняемую проверку, успешный результат и ожидаемый отказ до перехода к следующей сцене.`}),(0,T.jsx)(`h3`,{children:`Граница сложности`}),(0,T.jsx)(`p`,{children:`Не смешивайте создание аккаунта с выдачей cookie или JWT: регистрация заканчивается безопасной записью пользователя.`})]}),(0,T.jsx)(w,{caption:`tests/test_register.py`,code:`def test_register_user(client, db_session):
    response = client.post(
        "/auth/register",
        json={
            "email": "student@example.com",
            "username": "student",
            "password": "safe-password-42",
        },
    )

    assert response.status_code == 201
    body = response.json()
    assert body["email"] == "student@example.com"
    assert "password" not in body
    assert "password_hash" not in body

    user = get_user_by_email(db_session, "student@example.com")
    assert user is not None
    assert user.password_hash != "safe-password-42"
    assert verify_password("safe-password-42", user.password_hash)`}),(0,T.jsx)(t,{rows:[[(0,T.jsx)(T.Fragment,{children:`201`}),(0,T.jsx)(T.Fragment,{children:`валидный пользователь создан`})],[(0,T.jsx)(T.Fragment,{children:`422`}),(0,T.jsx)(T.Fragment,{children:`неверный email, короткий password или пустой username`})],[(0,T.jsx)(T.Fragment,{children:`409`}),(0,T.jsx)(T.Fragment,{children:`повторный email отклонён`})],[(0,T.jsx)(T.Fragment,{children:`response`}),(0,T.jsx)(T.Fragment,{children:`нет password и password_hash`})],[(0,T.jsx)(T.Fragment,{children:`database`}),(0,T.jsx)(T.Fragment,{children:`email нормализован, пароль проверяется через verify`})]]}),(0,T.jsx)(x,{title:`ручная проверка`,lines:[{cmd:`pytest tests/test_register.py -q`},{out:`4 passed`},{cmd:`curl -X POST http://127.0.0.1:8000/auth/register ...`},{out:`HTTP/1.1 201 Created`}]})]}),(0,T.jsxs)(d,{number:`08`,title:`Контрольная точка: полный конвейер регистрации`,children:[(0,T.jsx)(u,{children:`Ученик должен проследить одно значение password и доказать, что оно исчезает до ORM-модели, базы и ответа.`}),(0,T.jsx)(y,{title:`Соберите регистрацию`,prompt:`Расположите этапы от HTTP до ответа.`,pieces:[{id:`schema`,code:`UserCreate валидирует форму`},{id:`normalize`,code:`нормализовать email`},{id:`lookup`,code:`проверить существующего пользователя`},{id:`hash`,code:`вычислить password_hash`},{id:`commit`,code:`add → commit → refresh`},{id:`response`,code:`вернуть UserRead и 201`},{id:`wrong`,code:`вернуть model_dump с password`,note:`секрет не должен выходить наружу`}],correctOrder:[`schema`,`normalize`,`lookup`,`hash`,`commit`,`response`],explanation:`Каждая граница выполняет одну роль и не передаёт открытый пароль дальше необходимого.`}),(0,T.jsxs)(`div`,{className:`lesson-check-group`,children:[(0,T.jsx)(m,{question:`Какой статус возвращает успешная регистрация?`,options:[`201`,`204`,`409`],correctIndex:0,explanation:`Операция создала новый ресурс пользователя.`}),(0,T.jsx)(m,{question:`Кто окончательно защищает уникальность email?`,options:[`unique constraint`,`field_validator`,`response_model`],correctIndex:0,explanation:`Constraint работает и при конкурирующих транзакциях.`}),(0,T.jsx)(m,{question:`Что делать после IntegrityError на commit?`,options:[`rollback`,`refresh`,`ещё раз add`],correctIndex:0,explanation:`Session должна выйти из failed transaction.`}),(0,T.jsx)(m,{question:`Зачем нужен response_model=UserRead?`,options:[`ограничить публичные поля`,`хешировать password`,`создать таблицу`],correctIndex:0,explanation:`Response schema предотвращает выдачу внутреннего состояния.`})]}),(0,T.jsx)(r,{points:[(0,T.jsx)(T.Fragment,{children:`Pydantic проверяет форму, а сервис выполняет прикладную регистрацию.`}),(0,T.jsx)(T.Fragment,{children:`Email нормализуется до поиска и сохранения.`}),(0,T.jsx)(T.Fragment,{children:`Предварительный SELECT улучшает ошибку, unique constraint гарантирует правило.`}),(0,T.jsx)(T.Fragment,{children:`Открытый password заменяется password_hash до ORM-модели.`}),(0,T.jsx)(T.Fragment,{children:`IntegrityError требует rollback.`}),(0,T.jsx)(T.Fragment,{children:`Router переводит прикладной конфликт в 409 и возвращает UserRead.`})]}),(0,T.jsx)(_,{text:`Реализуйте POST /auth/register, сервис create_user и интеграционные тесты на 201, 422, 409, нормализацию email, Argon2 verify и отсутствие password/password_hash в ответе.`})]})]})}export{D as Lesson97};