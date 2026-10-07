import { Layers, LockKeyhole } from "lucide-react";
import { BranchExplorer, BugHunt, Callout, CodeBlock, CodeSequence, CompareSolutions, FillBlank, KeyTakeaways, Lead, MethodGrid, PracticeCta, QuizCard, RecallCard, RichHero, RichLesson, Section, TerminalDemo, TrueFalse, TypeCard, TypeCards } from "../../shared";
import { TheoryBridge } from "../../shared";
const BLOCK_TITLE = "Блок 18 · Cookie и серверные сессии";

export function Lesson101({ module }: { module?: string }) {
  return (
    <RichLesson>
      <RichHero
        variant="project"
        chip={module ?? BLOCK_TITLE}
        title={"Session login"}
        intro={"Соединим готовую проверку credentials с серверной session: endpoint примет email и пароль, вызовет authenticate_user, сохранит session, установит HttpOnly-cookie и вернёт безопасный профиль."}
        tags={[
          { icon: <LockKeyhole size={14} />, label: "credentials → session" },
          { icon: <Layers size={14} />, label: "service + HTTP response" },
        ]}
      />
      <TheoryBridge link={"Функция authenticate_user уже проверяет email и пароль. Session login превращает успешную проверку credentials в сохранённую серверную сессию и HttpOnly-cookie."} boundary={"Проверка пароля, создание session и формирование HTTP-ответа — три разные ответственности. Endpoint только координирует их."} />

      <Section number="01" title="Login — оркестрация нескольких готовых контрактов">
        <Lead>
          {"В блоке 17 уже появились authenticate_user и безопасная проверка пароля. На этом занятии мы не переписываем их. Login endpoint связывает существующую аутентификацию с созданием session и HTTP-cookie."}
        </Lead>

        <div className="lesson-route">
          <ol>
            <li>
              <strong>{"Принять credentials:"}</strong> {"Pydantic проверяет форму email и password."}
            </li>
            <li>
              <strong>{"Аутентифицировать:"}</strong> {"authenticate_user возвращает активного User или None."}
            </li>
            <li>
              <strong>{"Создать session:"}</strong> {"сервис фиксирует token_digest, user_id и expires_at."}
            </li>
            <li>
              <strong>{"Сформировать ответ:"}</strong> {"raw token уходит в HttpOnly-cookie, профиль — в JSON."}
            </li>
          </ol>
          <p>
            {"Главная профессиональная модель: endpoint является application boundary и координирует операции, но не реализует криптографию или SQL вручную."}
          </p>
        </div>

        <BranchExplorer
          code={"request credentials\n  ↓ validate\nLoginRequest\n  ↓ authenticate\nauthenticate_user\n  ↓ create state\ncreate_session\n  ↓ HTTP response\nSet-Cookie + UserRead"}
          scenarios={[
            { label: "body", activeLine: 2, output: "валидная Pydantic-модель" },
            { label: "credentials", activeLine: 4, output: "User или None" },
            { label: "session", activeLine: 6, output: "raw token после commit" },
            { label: "response", activeLine: 8, output: "cookie и безопасный JSON" },
          ]}
        />

        <Callout tone="info">
          {"Session login не означает, что пароль хранится в session. Credentials используются только для входа, после чего следующие запросы предъявляют случайный session token."}
        </Callout>
      </Section>

      <Section number="02" title="Контракт запроса и ответа">
        <Lead>
          {"Отдельные схемы делают границу видимой: LoginRequest содержит секрет входа, а UserRead гарантирует, что password и password_hash не попадут в ответ."}
        </Lead>

        <CodeBlock
          caption="Pydantic-схемы login"
          code={"from pydantic import BaseModel, EmailStr, Field\n\nclass SessionLoginRequest(BaseModel):\n    email: EmailStr\n    password: str = Field(min_length=8, max_length=128)\n\nclass UserRead(BaseModel):\n    id: int\n    email: EmailStr\n    username: str\n    is_active: bool\n\n    model_config = {\"from_attributes\": True}"}
        />

        <TypeCards>
          <TypeCard badge="input" title="SessionLoginRequest" code={"email + password"}>
            {"Существует только на входной границе. Password не записывается в session и не возвращается клиенту."}
          </TypeCard>
          <TypeCard badge="domain" badgeTone="float" title="UserModel" code={"password_hash"}>
            {"Загружается из базы для проверки, но не является HTTP-ответом."}
          </TypeCard>
          <TypeCard badge="output" badgeTone="str" title="UserRead" code={"id + email + username"}>
            {"Фильтрует публичные поля и документирует OpenAPI-контракт."}
          </TypeCard>
        </TypeCards>

        <BugHunt
          code={"@router.post(\"/login\")\ndef login(data: SessionLoginRequest, db: SessionDep):\n    user = find_user_by_email(db, data.email)\n    return user"}
          question="Какой риск появляется при возврате ORM-модели без response schema?"
          options={[
            "Можно случайно выдать password_hash и внутренние поля",
            "Cookie станет Secure",
            "SQLAlchemy удалит пользователя",
          ]}
          correctIndex={0}
          explanation="HTTP-ответ должен иметь отдельную безопасную схему."
          fix={"@router.post(\"/login\", response_model=UserRead)\ndef login(...):\n    ...\n    return user"}
        />

        <Callout>
          {"Даже если текущая сериализация не показывает hash, контракт должен запрещать его явно. Безопасность не строится на случайном наборе полей."}
        </Callout>
      </Section>

      <Section number="03" title="Единое сообщение для неверных credentials">
        <Lead>
          {"Login не должен подсказывать, существует ли конкретный email. Одинаковый ответ для неизвестного пользователя и неправильного пароля уменьшает утечку информации через контракт API."}
        </Lead>

        <CodeBlock
          caption="проверка credentials"
          code={"from fastapi import HTTPException, status\n\nINVALID_CREDENTIALS = HTTPException(\n    status_code=status.HTTP_401_UNAUTHORIZED,\n    detail=\"Неверные данные для входа\",\n)\n\ndef require_authenticated_user(\n    db: Session,\n    data: SessionLoginRequest,\n) -> UserModel:\n    user = authenticate_user(\n        db=db,\n        email=str(data.email),\n        password=data.password,\n    )\n\n    if user is None:\n        raise INVALID_CREDENTIALS\n\n    return user"}
        />

        <CompareSolutions
          question="Какой ответ меньше раскрывает состояние базы?"
          left={{
            title: "Разные сообщения",
            code: "404 email не найден\n401 пароль неверен",
            note: "Клиент может перебирать email и узнавать зарегистрированные адреса.",
          }}
          right={{
            title: "Единый контракт",
            code: "401 Неверные данные для входа",
            note: "Не раскрывает, какая часть credentials не совпала.",
          }}
          preferred="right"
          explanation={"Внутренние причины можно логировать осторожно, но внешний ответ остаётся единым."}
        />

        <TrueFalse
          statement={<>{"401 при login означает, что сервер обязан сообщить, был ли неверным email или пароль."}</>}
          isTrue={false}
          explanation={"HTTP-статус сообщает, что аутентификация не состоялась. Детализировать конкретную причину небезопасно."}
        />

        <Callout tone="info">
          {"Не логируйте введённый пароль. Для диагностики достаточно технического события, безопасного идентификатора запроса и общей причины отказа."}
        </Callout>
      </Section>

      <Section number="04" title="Endpoint фиксирует session до установки cookie">
        <Lead>
          {"Клиент должен получить token только для реально сохранённой session. Поэтому create_session завершает commit, и лишь затем endpoint добавляет Set-Cookie в успешный response."}
        </Lead>

        <CodeBlock
          caption="session login endpoint"
          code={"from fastapi import APIRouter, Response, status\n\nrouter = APIRouter(prefix=\"/auth/session\", tags=[\"session auth\"])\n\n@router.post(\n    \"/login\",\n    response_model=UserRead,\n    status_code=status.HTTP_200_OK,\n)\ndef session_login(\n    data: SessionLoginRequest,\n    response: Response,\n    db: SessionDep,\n):\n    user = require_authenticated_user(db, data)\n    raw_token = create_session(db, user.id)\n    set_session_cookie(response, raw_token)\n    return user"}
        />

        <CodeSequence
          title="Соберите endpoint login"
          prompt="Выберите порядок, при котором невалидный пользователь не получает cookie."
          pieces={[
            { id: "user", code: "user = require_authenticated_user(db, data)" },
            { id: "session", code: "raw_token = create_session(db, user.id)" },
            { id: "cookie", code: "set_session_cookie(response, raw_token)" },
            { id: "return", code: "return user" },
            { id: "wrong", code: "set_session_cookie(response, data.password)", note: "секрет нельзя помещать в cookie" },
          ]}
          correctOrder={["user", "session", "cookie", "return"]}
          explanation="Аутентификация предшествует созданию состояния, а cookie устанавливается только для сохранённой session."
        />

        <FillBlank
          prompt="Что передаётся в session cookie?"
          before="set_session_cookie(response, "
          after=")"
          options={["raw_token", "data.password", "user.password_hash"]}
          answer="raw_token"
          explanation="Cookie получает случайный token, а не пароль или hash."
        />

        <Callout>
          {"HTTP status 200 подходит для успешного login: новый пользователь не создаётся, создаётся только состояние входа."}
        </Callout>
      </Section>

      <Section number="05" title="Ошибка транзакции не должна оставлять ложный login">
        <Lead>
          {"Создание session может завершиться ошибкой базы. Сервис выполняет rollback и не возвращает raw token. Endpoint в таком случае не должен формировать Set-Cookie."}
        </Lead>

        <CodeBlock
          caption="транзакционная защита"
          code={"from sqlalchemy.exc import SQLAlchemyError\n\nclass SessionCreationError(Exception):\n    pass\n\ndef create_session(db: Session, user_id: int) -> str:\n    raw_token = generate_session_token()\n    model = build_session_model(raw_token, user_id)\n\n    try:\n        db.add(model)\n        db.commit()\n    except SQLAlchemyError as error:\n        db.rollback()\n        raise SessionCreationError from error\n\n    return raw_token"}
        />

        <BranchExplorer
          code={"try:\n    add session\n    commit\nexcept database error:\n    rollback\n    raise service error\nelse:\n    return raw token"}
          scenarios={[
            { label: "commit успешен", activeLine: 7, output: "token передаётся endpoint" },
            { label: "ошибка базы", activeLine: 4, output: "rollback" },
            { label: "после rollback", activeLine: 5, output: "cookie не устанавливается" },
          ]}
        />

        <BugHunt
          code={"raw_token = generate_session_token()\nset_session_cookie(response, raw_token)\ncreate_session(db, user.id)"}
          question="Почему порядок создаёт несогласованное состояние?"
          options={[
            "Ответ уже содержит token до успешного commit",
            "Cookie нельзя устанавливать в POST",
            "Session должна создаваться в браузере",
          ]}
          correctIndex={0}
          explanation="При ошибке базы клиент получил бы token, которому не соответствует запись."
          fix={"raw_token = create_session(db, user.id)\nset_session_cookie(response, raw_token)"}
        />

        <Callout tone="info">
          {"Граница успешного login — не генерация token, а успешная фиксация server-side session."}
        </Callout>
      </Section>

      <Section number="06" title="Политика повторного входа">
        <Lead>
          {"Повторный login можно моделировать по-разному. В этом блоке каждый успешный вход создаёт новую session. Такой контракт прост, поддерживает несколько устройств и не требует скрытого поиска предыдущей cookie."}
        </Lead>

        <TypeCards>
          <TypeCard badge="new" title="Новая session на login" code={"INSERT user_sessions"}>
            {"Основной учебный вариант: каждый вход получает независимый token и lifecycle."}
          </TypeCard>
          <TypeCard badge="rotate" badgeTone="float" title="Ротация текущей" code={"revoke old → create new"}>
            {"Возможная политика, но требует сначала надёжно определить текущую session."}
          </TypeCard>
          <TypeCard badge="single" badgeTone="str" title="Только одно устройство" code={"revoke all before login"}>
            {"Допустимое бизнес-правило, но не используется в StudyHub по умолчанию."}
          </TypeCard>
        </TypeCards>

        <CompareSolutions
          question="Какой вариант соответствует выбранному контракту StudyHub?"
          left={{
            title: "Перезаписывать token в users",
            code: "user.session_token = new_token",
            note: "Смешивает учётную запись и конкретное устройство.",
          }}
          right={{
            title: "Добавлять строку session",
            code: "create_session(db, user.id)",
            note: "Сохраняет независимые входы и позволяет точечный logout.",
          }}
          preferred="right"
          explanation={"Политика нескольких устройств выражается отдельными строками user_sessions."}
        />

        <RecallCard
          question="Что произойдёт при двух успешных login одного пользователя?"
          answer={<p>{"Будут созданы две независимые server-side sessions. Каждый клиент получит собственный raw token."}</p>}
        />

        <Callout>
          {"Политику нужно документировать. Неявное поведение login приводит к неожиданным logout на других устройствах."}
        </Callout>
      </Section>

      <Section number="07" title="Интеграционный тест login">
        <Lead>
          {"Тест должен доказать не только status code. Он проверяет Set-Cookie, отсутствие секретов в JSON, создание digest в базе и возможность продолжить сценарий тем же клиентом."}
        </Lead>

        <CodeBlock
          caption="успешный login"
          code={"def test_session_login_sets_cookie(\n    client,\n    db_session,\n    registered_user,\n):\n    response = client.post(\n        \"/auth/session/login\",\n        json={\n            \"email\": registered_user.email,\n            \"password\": \"correct-password\",\n        },\n    )\n\n    assert response.status_code == 200\n    assert \"studyhub_session\" in response.cookies\n    assert \"password_hash\" not in response.json()\n\n    session = db_session.scalar(\n        select(UserSessionModel).where(\n            UserSessionModel.user_id == registered_user.id,\n        )\n    )\n    assert session is not None"}
        />

        <CodeBlock
          caption="неверный пароль"
          code={"def test_session_login_rejects_bad_password(client, registered_user):\n    response = client.post(\n        \"/auth/session/login\",\n        json={\n            \"email\": registered_user.email,\n            \"password\": \"wrong-password\",\n        },\n    )\n\n    assert response.status_code == 401\n    assert \"studyhub_session\" not in response.cookies"}
        />

        <TerminalDemo
          title="контрольный сценарий"
          lines={[
            { cmd: "pytest tests/test_session_login.py -q" },
            { out: "test_session_login_sets_cookie PASSED" },
            { out: "test_session_login_rejects_bad_password PASSED" },
            { out: "2 passed" },
          ]}
        />

        <Callout tone="info">
          {"В тестовой базе не сравнивайте raw token с token_digest: это разные представления. Вычислите digest cookie и найдите соответствующую запись."}
        </Callout>

        <div className="lesson-practice-steps">
          <h3>{"Ручной happy path"}</h3>
          <p>
            {"Зарегистрируйте пользователя, выполните login и убедитесь, что JSON не содержит password_hash, а response содержит Set-Cookie."}
          </p>
          <h3>{"Ручной negative path"}</h3>
          <p>
            {"Повторите запрос с неверным паролем. Ответ должен быть 401, новая запись session не создаётся, а Set-Cookie отсутствует."}
          </p>
          <h3>{"Повторный login"}</h3>
          <p>
            {"Выполните login вторым TestClient и подтвердите две строки user_sessions с одним user_id и разными token_digest."}
          </p>
        </div>

        <MethodGrid
          rows={[
            [<>201 registration</>, "создаёт учётную запись"],
            [<>200 session login</>, "создаёт состояние входа"],
            [<>401 invalid credentials</>, "не создаёт session и cookie"],
            [<>UserRead</>, "не содержит password или password_hash"],
          ]}
        />

        <Callout>
          {"Не проверяйте наличие password_hash только визуально. Автоматический тест должен явно утверждать, что секретного поля нет в JSON."}
        </Callout>

      </Section>

      <Section number="08" title="Контрольная точка: credentials становятся session">
        <Lead>
          {"Полный login flow теперь читается как последовательность контрактов: Pydantic проверяет форму, authenticate_user подтверждает credentials, create_session фиксирует состояние, response устанавливает cookie."}
        </Lead>

        <div className="lesson-check-group">
          <QuizCard
            question="Кто проверяет пароль?"
            options={["authenticate_user", "set_session_cookie", "UserRead"]}
            correctIndex={0}
            explanation="Login использует готовую функцию проверки credentials."
          />
          <QuizCard
            question="Когда можно устанавливать cookie?"
            options={["после успешного сохранения session", "до проверки email", "в момент импорта роутера"]}
            correctIndex={0}
            explanation="Клиент получает token только для существующей server-side записи."
          />
          <QuizCard
            question="Что возвращает response_model?"
            options={["безопасный публичный профиль", "password_hash", "raw ORM Session"]}
            correctIndex={0}
            explanation="UserRead ограничивает HTTP-ответ."
          />
          <QuizCard
            question="Что делает повторный login в выбранной модели?"
            options={["создаёт новую независимую session", "удаляет пользователя", "превращает cookie в JWT"]}
            correctIndex={0}
            explanation="Каждый успешный вход имеет отдельный lifecycle."
          />
        </div>

        <KeyTakeaways
          points={[
            <>{"Session login использует готовый контракт authenticate_user."}</>,
            <>{"LoginRequest принимает секрет, а UserRead исключает его из ответа."}</>,
            <>{"Неизвестный email и неверный пароль получают единый 401."}</>,
            <>{"Server-side session фиксируется до установки cookie."}</>,
            <>{"После ошибки commit выполняется rollback, token клиенту не выдаётся."}</>,
            <>{"Каждый login создаёт отдельную session для конкретного клиента."}</>,
            <>{"Интеграционный тест проверяет HTTP, cookie и запись базы одновременно."}</>,
          ]}
        />

        <PracticeCta text="Реализуйте POST /auth/session/login поверх существующего authenticate_user. Добавьте безопасный UserRead, транзакционный create_session и тесты успешного входа, неверного password и отсутствия password_hash в ответе." />
      </Section>
    </RichLesson>
  );
}
