import { FileText, ShieldCheck } from "lucide-react";
import { BranchExplorer, BugHunt, Callout, CodeBlock, CodeSequence, CompareSolutions, FillBlank, KeyTakeaways, Lead, MethodGrid, PracticeCta, QuizCard, RecallCard, RichHero, RichLesson, Section, StepThrough, TerminalDemo, TrueFalse, TypeCard, TypeCards } from "../../shared";
import { TheoryBridge } from "../../shared";
const BLOCK_TITLE = "Блок 17 · Пользователь и основы безопасности";

type LessonProps = { module?: string };

export function Lesson97({ module }: LessonProps) {
  return (
    <RichLesson>
      <RichHero
        variant="project"
        chip={module ?? BLOCK_TITLE}
        title={"Регистрация"}
        intro={"Соберём POST /auth/register как прозрачный конвейер: Pydantic проверяет форму, сервис нормализует email, база гарантирует уникальность, пароль хешируется до ORM-модели, а клиент получает только UserRead."}
        tags={[
          { 
            icon: <FileText size={14} />,
            label: "POST /auth/register",
          },
          { 
            icon: <ShieldCheck size={14} />,
            label: "201 · 409 · безопасный ответ",
          }
        ]}
      />
      <TheoryBridge link={"Модель и password service готовы, поэтому регистрация собирает валидацию, уникальность, хеширование, транзакцию и безопасный ответ."} boundary={"Предварительный SELECT улучшает сообщение, но окончательную уникальность гарантирует constraint базы и rollback после IntegrityError."} />

      <Section
        number="01"
        title={"Регистрация — операция создания пользователя"}
      >
        <Lead>
          {"Регистрация похожа на создание задачи, но цена ошибки выше: в запросе присутствует секрет, email должен быть уникальным, а ответ обязан быть уже очищенным от внутренних полей."}
        </Lead>

        <div className="lesson-route">
          <ol>
            <li>
              <strong>Валидация:</strong> проверить формат email, длину username и password до вызова сервиса.
            </li>
            <li>
              <strong>Нормализация:</strong> привести email к единой форме, чтобы регистр не создавал псевдодубликаты.
            </li>
            <li>
              <strong>Уникальность:</strong> выполнить понятную предварительную проверку и сохранить ограничение базы.
            </li>
            <li>
              <strong>Хеширование:</strong> создать password_hash до построения ORM-модели.
            </li>
            <li>
              <strong>Безопасный ответ:</strong> вернуть 201 и UserRead без password/password_hash.
            </li>
          </ol>
        <p>Endpoint остаётся тонким, а транзакционная операция живёт в сервисе.</p>
        </div>

        <TypeCards>
          <TypeCard
            badge={"201"}
            title={"Создано"}
            code={"HTTP_201_CREATED"}
          >
            {"Новая запись успешно сохранена и представлена через response schema."}
          </TypeCard>

          <TypeCard
            badge={"422"}
            badgeTone="float"
            title={"Неверная форма"}
            code={"invalid email / short password"}
          >
            {"Pydantic отклоняет данные до предметной операции."}
          </TypeCard>

          <TypeCard
            badge={"409"}
            badgeTone="str"
            title={"Конфликт"}
            code={"HTTP_409_CONFLICT"}
          >
            {"Email уже занят и новая запись нарушает уникальность."}
          </TypeCard>
        </TypeCards>

        <Callout tone="info">
          {"Регистрация создаёт аккаунт, но не обязана сразу создавать session или token. Это отдельное решение следующего слоя."}
        </Callout>
      </Section>

      <Section
        number="02"
        title={"Входная схема останавливает плохую форму"}
      >
        <Lead>
          {"Pydantic проверяет структуру, типы и локальные ограничения. Он не ходит в базу за уникальностью — эта проверка относится к сервису."}
        </Lead>

        <div className="lesson-practice-steps">
          <h3>{"Главный вопрос сцены"}</h3>
          <p>
            {"Раздел «Входная схема останавливает плохую форму» показывает, как правило влияет на UserCreate → service → Session → UserRead."}
          </p>

          <h3>{"Что нужно уметь объяснить"}</h3>
          <p>
            {"Назовите входные данные, выполняемую проверку, успешный результат и ожидаемый отказ до перехода к следующей сцене."}
          </p>

          <h3>{"Граница сложности"}</h3>
          <p>
            {"Не смешивайте создание аккаунта с выдачей cookie или JWT: регистрация заканчивается безопасной записью пользователя."}
          </p>
        </div>

        <CodeBlock
          caption={"UserCreate с Pydantic v2"}
          code={"from pydantic import BaseModel, EmailStr, Field, field_validator\n\n\nclass UserCreate(BaseModel):\n    email: EmailStr\n    username: str = Field(min_length=2, max_length=50)\n    password: str = Field(min_length=8, max_length=128)\n\n    @field_validator(\"username\")\n    @classmethod\n    def username_must_not_be_blank(cls, value: str) -> str:\n        cleaned = value.strip()\n        if not cleaned:\n            raise ValueError(\"username не должен быть пустым\")\n        return cleaned"}
        />

        <BranchExplorer
          code={"payload = UserCreate.model_validate(data)\nif email_has_bad_format:\n    return 422\nif username_is_blank:\n    return 422\nif password_is_short:\n    return 422\nreturn payload"}
          scenarios={[
            { label: "email = bad", activeLine: 2, output: "422 до сервиса" },
            { label: "username = пробелы", activeLine: 4, output: "422 до сервиса" },
            { label: "корректная форма", activeLine: 7, output: "UserCreate" }
          ]}
        />

        <TrueFalse
          statement={
            <>
              {"Field(min_length=8) доказывает, что пароль устойчив к подбору."}
            </>
          }
          isTrue={false}
          explanation={"Это только минимальное формальное ограничение. Реальная стойкость зависит от значения, политики и password hashing."}
        />
      </Section>

      <Section
        number="03"
        title={"Нормализация email и предварительный поиск"}
      >
        <Lead>
          {"До запроса к базе email приводится к согласованной форме. Иначе User@Example.com и user@example.com могут стать разными прикладными идентификаторами."}
        </Lead>

        <div className="lesson-practice-steps">
          <h3>{"Главный вопрос сцены"}</h3>
          <p>
            {"Раздел «Нормализация email и предварительный поиск» показывает, как правило влияет на UserCreate → service → Session → UserRead."}
          </p>

          <h3>{"Что нужно уметь объяснить"}</h3>
          <p>
            {"Назовите входные данные, выполняемую проверку, успешный результат и ожидаемый отказ до перехода к следующей сцене."}
          </p>

          <h3>{"Граница сложности"}</h3>
          <p>
            {"Не смешивайте создание аккаунта с выдачей cookie или JWT: регистрация заканчивается безопасной записью пользователя."}
          </p>
        </div>

        <CodeBlock
          caption={"нормализация и поиск"}
          code={"from sqlalchemy import select\nfrom sqlalchemy.orm import Session\n\n\ndef normalize_email(email: str) -> str:\n    return email.strip().lower()\n\n\ndef get_user_by_email(db: Session, email: str) -> UserModel | None:\n    statement = select(UserModel).where(UserModel.email == email)\n    return db.scalar(statement)"}
        />

        <StepThrough
          code={"email = normalize_email(payload.email)\nexisting = get_user_by_email(db, email)\nif existing is not None:\n    raise EmailAlreadyExists\npassword_hash = hash_password(payload.password)"}
          steps={[
            { line: 0, note: "Email принимает единую форму до поиска и сохранения.", vars: {"email": "\"user@example.com\""} },
            { line: 1, note: "Session выполняет SELECT по индексированной колонке.", vars: {"existing": "None"} },
            { line: 2, note: "Ветка конфликта проверяется до дорогого хеширования.", vars: {"condition": "False"} },
            { line: 4, note: "Только свободный email доходит до password service.", vars: {"password_hash": "$argon2id$..."} }
          ]}
        />

        <RecallCard
          question={"Почему предварительный SELECT полезен, хотя база всё равно имеет unique constraint?"}
          answer={
            <p>
              {"Он позволяет вернуть понятный прикладной конфликт в обычном последовательном сценарии. Constraint остаётся страховкой от гонки между SELECT и commit."}
            </p>
          }
        />
      </Section>

      <Section
        number="04"
        title={"Явное преобразование UserCreate в UserModel"}
      >
        <Lead>
          {"Не нужно передавать model_dump() целиком: во входной схеме есть password, а в ORM-модели требуется password_hash. Явное сопоставление делает границу заметной."}
        </Lead>

        <div className="lesson-practice-steps">
          <h3>{"Главный вопрос сцены"}</h3>
          <p>
            {"Раздел «Явное преобразование UserCreate в UserModel» показывает, как правило влияет на UserCreate → service → Session → UserRead."}
          </p>

          <h3>{"Что нужно уметь объяснить"}</h3>
          <p>
            {"Назовите входные данные, выполняемую проверку, успешный результат и ожидаемый отказ до перехода к следующей сцене."}
          </p>

          <h3>{"Граница сложности"}</h3>
          <p>
            {"Не смешивайте создание аккаунта с выдачей cookie или JWT: регистрация заканчивается безопасной записью пользователя."}
          </p>
        </div>

        <CompareSolutions
          question={"Как безопаснее построить ORM-объект?"}
          left={{
            title: "Распаковать весь payload",
            code: "user = UserModel(**payload.model_dump())",
            note: "ORM не ждёт password, а секрет может попасть в неподходящее место.",
          }}
          right={{
            title: "Назвать поля явно",
            code: "user = UserModel(\n    email=email,\n    username=payload.username,\n    password_hash=hash_password(payload.password),\n)",
            note: "Видно преобразование секрета и серверные defaults.",
          }}
          preferred="right"
          explanation={"На чувствительной границе явность важнее одной короткой строки."}
        />

        <CodeBlock
          caption={"создание модели"}
          code={"user = UserModel(\n    email=email,\n    username=payload.username,\n    password_hash=hash_password(payload.password),\n    role=\"user\",\n    is_active=True,\n)\n\ndb.add(user)"}
        />

        <FillBlank
          prompt={"Выберите значение для password_hash."}
          before={"password_hash="}
          after={","}
          options={["hash_password(payload.password)", "payload.password", "payload.model_dump()"]}
          answer={"hash_password(payload.password)"}
          explanation={"В сохраняемую модель передаётся только результат password hashing."}
        />
      </Section>

      <Section
        number="05"
        title={"Commit, IntegrityError и обязательный rollback"}
      >
        <Lead>
          {"Два параллельных запроса могут пройти предварительный SELECT почти одновременно. Unique constraint остановит второй commit, после чего Session нужно вернуть в рабочее состояние."}
        </Lead>

        <div className="lesson-practice-steps">
          <h3>{"Главный вопрос сцены"}</h3>
          <p>
            {"Раздел «Commit, IntegrityError и обязательный rollback» показывает, как правило влияет на UserCreate → service → Session → UserRead."}
          </p>

          <h3>{"Что нужно уметь объяснить"}</h3>
          <p>
            {"Назовите входные данные, выполняемую проверку, успешный результат и ожидаемый отказ до перехода к следующей сцене."}
          </p>

          <h3>{"Граница сложности"}</h3>
          <p>
            {"Не смешивайте создание аккаунта с выдачей cookie или JWT: регистрация заканчивается безопасной записью пользователя."}
          </p>
        </div>

        <CodeBlock
          caption={"транзакционная часть сервиса"}
          code={"from sqlalchemy.exc import IntegrityError\n\n\ndef create_user(db: Session, payload: UserCreate) -> UserModel:\n    email = normalize_email(str(payload.email))\n\n    if get_user_by_email(db, email) is not None:\n        raise EmailAlreadyExists\n\n    user = UserModel(\n        email=email,\n        username=payload.username,\n        password_hash=hash_password(payload.password),\n    )\n    db.add(user)\n\n    try:\n        db.commit()\n    except IntegrityError as error:\n        db.rollback()\n        raise EmailAlreadyExists from error\n\n    db.refresh(user)\n    return user"}
        />

        <BugHunt
          code={"try:\n    db.commit()\nexcept IntegrityError:\n    raise HTTPException(status_code=409)"}
          question={"Чего не хватает после неудачного commit?"}
          options={["db.rollback()", "ещё одного db.add()", "повторного hash_password()"]}
          correctIndex={0}
          explanation={"Session остаётся в failed transaction и не должна использоваться до rollback."}
          fix={"try:\n    db.commit()\nexcept IntegrityError as error:\n    db.rollback()\n    raise EmailAlreadyExists from error"}
        />

        <Callout>
          {"Сервис переводит SQLAlchemy-ошибку в прикладную EmailAlreadyExists. Router позже переводит прикладную ошибку в HTTP 409."}
        </Callout>
      </Section>

      <Section
        number="06"
        title={"Тонкий endpoint и безопасный response_model"}
      >
        <Lead>
          {"Router связывает HTTP с сервисом: получает payload и Session, вызывает use case, переводит ожидаемый конфликт и возвращает результат через UserRead."}
        </Lead>

        <div className="lesson-practice-steps">
          <h3>{"Главный вопрос сцены"}</h3>
          <p>
            {"Раздел «Тонкий endpoint и безопасный response_model» показывает, как правило влияет на UserCreate → service → Session → UserRead."}
          </p>

          <h3>{"Что нужно уметь объяснить"}</h3>
          <p>
            {"Назовите входные данные, выполняемую проверку, успешный результат и ожидаемый отказ до перехода к следующей сцене."}
          </p>

          <h3>{"Граница сложности"}</h3>
          <p>
            {"Не смешивайте создание аккаунта с выдачей cookie или JWT: регистрация заканчивается безопасной записью пользователя."}
          </p>
        </div>

        <CodeBlock
          caption={"app/routers/auth.py"}
          code={"from typing import Annotated\n\nfrom fastapi import APIRouter, Depends, HTTPException, status\nfrom sqlalchemy.orm import Session\n\nfrom app.database import get_db\nfrom app.schemas.user import UserCreate, UserRead\nfrom app.services.users import EmailAlreadyExists, create_user\n\n\nrouter = APIRouter(prefix=\"/auth\", tags=[\"auth\"])\nDbSession = Annotated[Session, Depends(get_db)]\n\n\n@router.post(\n    \"/register\",\n    response_model=UserRead,\n    status_code=status.HTTP_201_CREATED,\n)\ndef register_user(payload: UserCreate, db: DbSession):\n    try:\n        return create_user(db, payload)\n    except EmailAlreadyExists as error:\n        raise HTTPException(\n            status_code=status.HTTP_409_CONFLICT,\n            detail=\"Email уже зарегистрирован\",\n        ) from error"}
        />

        <TypeCards>
          <TypeCard
            badge={"router"}
            title={"HTTP-контракт"}
            code={"POST /auth/register"}
          >
            {"Path, status code, response model и перевод ожидаемой ошибки."}
          </TypeCard>

          <TypeCard
            badge={"service"}
            badgeTone="float"
            title={"Use case"}
            code={"create_user(db, payload)"}
          >
            {"Нормализация, уникальность, хеширование и транзакция."}
          </TypeCard>

          <TypeCard
            badge={"schema"}
            badgeTone="str"
            title={"Фильтр ответа"}
            code={"response_model=UserRead"}
          >
            {"Разрешает только публичные поля UserRead."}
          </TypeCard>
        </TypeCards>

        <TrueFalse
          statement={
            <>
              {"Endpoint регистрации должен сам создавать JWT, иначе пользователь не считается созданным."}
            </>
          }
          isTrue={false}
          explanation={"Создание аккаунта и выдача способа доступа являются разными операциями и могут иметь разные правила."}
        />
      </Section>

      <Section
        number="07"
        title={"Интеграционные проверки регистрации"}
      >
        <Lead>
          {"Тесты проходят через HTTP-границу и отдельную тестовую базу. Они проверяют не внутренние строки хеша, а статус, сохранённые данные и отсутствие секретов в JSON."}
        </Lead>

        <div className="lesson-practice-steps">
          <h3>{"Главный вопрос сцены"}</h3>
          <p>
            {"Раздел «Интеграционные проверки регистрации» показывает, как правило влияет на UserCreate → service → Session → UserRead."}
          </p>

          <h3>{"Что нужно уметь объяснить"}</h3>
          <p>
            {"Назовите входные данные, выполняемую проверку, успешный результат и ожидаемый отказ до перехода к следующей сцене."}
          </p>

          <h3>{"Граница сложности"}</h3>
          <p>
            {"Не смешивайте создание аккаунта с выдачей cookie или JWT: регистрация заканчивается безопасной записью пользователя."}
          </p>
        </div>

        <CodeBlock
          caption={"tests/test_register.py"}
          code={"def test_register_user(client, db_session):\n    response = client.post(\n        \"/auth/register\",\n        json={\n            \"email\": \"student@example.com\",\n            \"username\": \"student\",\n            \"password\": \"safe-password-42\",\n        },\n    )\n\n    assert response.status_code == 201\n    body = response.json()\n    assert body[\"email\"] == \"student@example.com\"\n    assert \"password\" not in body\n    assert \"password_hash\" not in body\n\n    user = get_user_by_email(db_session, \"student@example.com\")\n    assert user is not None\n    assert user.password_hash != \"safe-password-42\"\n    assert verify_password(\"safe-password-42\", user.password_hash)"}
        />

        <MethodGrid
          rows={[
            [<>{"201"}</>, <>{"валидный пользователь создан"}</>],
            [<>{"422"}</>, <>{"неверный email, короткий password или пустой username"}</>],
            [<>{"409"}</>, <>{"повторный email отклонён"}</>],
            [<>{"response"}</>, <>{"нет password и password_hash"}</>],
            [<>{"database"}</>, <>{"email нормализован, пароль проверяется через verify"}</>]
          ]}
        />

        <TerminalDemo
          title={"ручная проверка"}
          lines={[
            { cmd: "pytest tests/test_register.py -q" },
            { out: "4 passed" },
            { cmd: "curl -X POST http://127.0.0.1:8000/auth/register ..." },
            { out: "HTTP/1.1 201 Created" }
          ]}
        />
      </Section>

      <Section
        number="08"
        title={"Контрольная точка: полный конвейер регистрации"}
      >
        <Lead>
          {"Ученик должен проследить одно значение password и доказать, что оно исчезает до ORM-модели, базы и ответа."}
        </Lead>

        <CodeSequence
          title={"Соберите регистрацию"}
          prompt={"Расположите этапы от HTTP до ответа."}
          pieces={[
            { id: "schema", code: "UserCreate валидирует форму" },
            { id: "normalize", code: "нормализовать email" },
            { id: "lookup", code: "проверить существующего пользователя" },
            { id: "hash", code: "вычислить password_hash" },
            { id: "commit", code: "add → commit → refresh" },
            { id: "response", code: "вернуть UserRead и 201" },
            { id: "wrong", code: "вернуть model_dump с password", note: "секрет не должен выходить наружу" }
          ]}
          correctOrder={["schema", "normalize", "lookup", "hash", "commit", "response"]}
          explanation={"Каждая граница выполняет одну роль и не передаёт открытый пароль дальше необходимого."}
        />

        <div className="lesson-check-group">
          <QuizCard
            question={"Какой статус возвращает успешная регистрация?"}
            options={["201", "204", "409"]}
            correctIndex={0}
            explanation={"Операция создала новый ресурс пользователя."}
          />
          <QuizCard
            question={"Кто окончательно защищает уникальность email?"}
            options={["unique constraint", "field_validator", "response_model"]}
            correctIndex={0}
            explanation={"Constraint работает и при конкурирующих транзакциях."}
          />
          <QuizCard
            question={"Что делать после IntegrityError на commit?"}
            options={["rollback", "refresh", "ещё раз add"]}
            correctIndex={0}
            explanation={"Session должна выйти из failed transaction."}
          />
          <QuizCard
            question={"Зачем нужен response_model=UserRead?"}
            options={["ограничить публичные поля", "хешировать password", "создать таблицу"]}
            correctIndex={0}
            explanation={"Response schema предотвращает выдачу внутреннего состояния."}
          />
        </div>

        <KeyTakeaways
          points={[
            <>{"Pydantic проверяет форму, а сервис выполняет прикладную регистрацию."}</>,
            <>{"Email нормализуется до поиска и сохранения."}</>,
            <>{"Предварительный SELECT улучшает ошибку, unique constraint гарантирует правило."}</>,
            <>{"Открытый password заменяется password_hash до ORM-модели."}</>,
            <>{"IntegrityError требует rollback."}</>,
            <>{"Router переводит прикладной конфликт в 409 и возвращает UserRead."}</>
          ]}
        />

        <PracticeCta text={"Реализуйте POST /auth/register, сервис create_user и интеграционные тесты на 201, 422, 409, нормализацию email, Argon2 verify и отсутствие password/password_hash в ответе."} />
      </Section>
    </RichLesson>
  );
}
