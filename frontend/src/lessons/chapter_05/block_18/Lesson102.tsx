import { KeyRound, Layers } from "lucide-react";
import { BranchExplorer, BugHunt, Callout, CodeBlock, CodeSequence, CompareSolutions, FillBlank, KeyTakeaways, Lead, MethodGrid, PracticeCta, PredictOutput, QuizCard, RecallCard, RichHero, RichLesson, Section, TerminalDemo, TrueFalse, TypeCard, TypeCards } from "../../shared";
import { TheoryBridge } from "../../shared";
const BLOCK_TITLE = "Блок 18 · Cookie и серверные сессии";

export function Lesson102({ module }: { module?: string }) {
  return (
    <RichLesson>
      <RichHero
        variant="project"
        chip={module ?? BLOCK_TITLE}
        title={"get_current_user через session"}
        intro={"Научим FastAPI восстанавливать пользователя до запуска endpoint: dependency прочитает cookie, найдёт server-side session по digest, проверит срок и отзыв, затем загрузит активного User."}
        tags={[
          { icon: <KeyRound size={14} />, label: "cookie → current user" },
          { icon: <Layers size={14} />, label: "dependency chain" },
        ]}
      />
      <TheoryBridge link={"После login браузер автоматически отправляет session cookie. Dependency get_current_user восстанавливает пользователя до выполнения защищённого endpoint."} boundary={"Наличие cookie недостаточно: сервер проверяет существование session, отзыв, срок действия и активность пользователя."} />

      <Section number="01" title="Защищённый endpoint не должен повторять проверки">
        <Lead>
          {"После login каждый endpoint мог бы вручную читать cookie, искать session и загружать пользователя. Повторение создаёт риск: один маршрут забудет проверить expires_at, другой — is_active. Dependency собирает единый authentication pipeline."}
        </Lead>

        <div className="lesson-route">
          <ol>
            <li><strong>{"Получить cookie:"}</strong> {"FastAPI извлекает значение по alias studyhub_session."}</li>
            <li><strong>{"Найти session:"}</strong> {"raw token преобразуется в digest, затем выполняется SELECT."}</li>
            <li><strong>{"Проверить состояние:"}</strong> {"неизвестная, отозванная или просроченная session отклоняется."}</li>
            <li><strong>{"Загрузить User:"}</strong> {"dependency возвращает только существующего активного пользователя."}</li>
          </ol>
          <p>{"Endpoint получает готовый current_user и занимается только своим предметным сценарием."}</p>
        </div>

        <BranchExplorer
          code={"request Cookie\n  ↓ get_session_token\nraw token\n  ↓ get_active_session\nUserSessionModel\n  ↓ get_current_user\nUserModel\n  ↓ endpoint\nbusiness operation"}
          scenarios={[
            { label: "cookie", activeLine: 2, output: "raw token или 401" },
            { label: "session", activeLine: 4, output: "активная запись или 401" },
            { label: "user", activeLine: 6, output: "активный User или 401" },
            { label: "endpoint", activeLine: 8, output: "предметная логика" },
          ]}
        />

        <Callout tone="info">
          {"Dependency injection здесь не является отдельной архитектурой. Это способ объявить обязательные данные и централизовать их получение до выполнения endpoint."}
        </Callout>
      </Section>

      <Section number="02" title="Первая dependency читает cookie">
        <Lead>
          {"Cookie может отсутствовать: пользователь ещё не входил, удалил данные браузера или отправил запрос другим клиентом. Это ожидаемый authentication failure, а не внутренняя ошибка сервера."}
        </Lead>

        <CodeBlock
          caption="тип session cookie"
          code={"from typing import Annotated\n\nfrom fastapi import Cookie, HTTPException, status\n\nSESSION_COOKIE_NAME = \"studyhub_session\"\n\nSessionCookie = Annotated[\n    str | None,\n    Cookie(alias=SESSION_COOKIE_NAME),\n]\n\ndef get_session_token(\n    raw_token: SessionCookie = None,\n) -> str:\n    if raw_token is None:\n        raise HTTPException(\n            status_code=status.HTTP_401_UNAUTHORIZED,\n            detail=\"Требуется вход\",\n        )\n\n    return raw_token"}
        />

        <TypeCards>
          <TypeCard badge="alias" title="HTTP-имя" code={"studyhub_session"}>
            {"Имя в request header Cookie. Оно может отличаться от Python-параметра."}
          </TypeCard>
          <TypeCard badge="optional" badgeTone="float" title="str | None" code={"None до проверки"}>
            {"FastAPI не превращает отсутствие cookie в 422. Dependency сама формирует 401."}
          </TypeCard>
          <TypeCard badge="result" badgeTone="str" title="str" code={"raw token"}>
            {"После функции следующий слой получает гарантированно существующее значение."}
          </TypeCard>
        </TypeCards>

        <FillBlank
          prompt="Какой HTTP-статус возвращается, когда cookie отсутствует?"
          before="status_code=status.HTTP_"
          after=""
          options={["401_UNAUTHORIZED", "422_UNPROCESSABLE_ENTITY", "201_CREATED"]}
          answer="401_UNAUTHORIZED"
          explanation="Форма запроса допустима, но пользователь не аутентифицирован."
        />

        <Callout>
          {"Не используйте 403 для отсутствующей session. 403 относится к подтверждённому пользователю, которому не разрешено конкретное действие."}
        </Callout>
      </Section>

      <Section number="03" title="Поиск session выполняется по digest">
        <Lead>
          {"Raw token не хранится в таблице. Dependency вычисляет digest тем же детерминированным способом и использует его в условии SELECT."}
        </Lead>

        <CodeBlock
          caption="получить запись session"
          code={"from sqlalchemy import select\nfrom sqlalchemy.orm import Session\n\ndef find_session_by_token(\n    db: Session,\n    raw_token: str,\n) -> UserSessionModel | None:\n    token_digest = digest_session_token(raw_token)\n\n    statement = select(UserSessionModel).where(\n        UserSessionModel.token_digest == token_digest,\n    )\n\n    return db.scalar(statement)"}
        />

        <CompareSolutions
          question="Какой поиск согласован с моделью хранения?"
          left={{
            title: "Сравнить raw token",
            code: "where(UserSessionModel.token_digest == raw_token)",
            note: "Представления различаются, поэтому запись не будет найдена.",
          }}
          right={{
            title: "Сравнить digest",
            code: "where(UserSessionModel.token_digest == digest(raw_token))",
            note: "Обе стороны имеют одно и то же представление.",
          }}
          preferred="right"
          explanation={"Raw token преобразуется на входной границе поиска."}
        />

        <PredictOutput
          code={"cookie = \"raw-token\"\nstored = sha256(cookie).hexdigest()\nlookup = sha256(cookie).hexdigest()\n\nprint(stored == lookup)"}
          output={"True"}
          hint="Один и тот же вход даёт один и тот же digest."
        />

        <BugHunt
          code={"statement = select(UserSessionModel).where(\n    UserSessionModel.user_id == raw_token,\n)"}
          question="Почему условие не выражает назначение token?"
          options={[
            "Token нужно сопоставлять с token_digest, а не с user_id",
            "SELECT запрещён в dependency",
            "user_id должен храниться в cookie",
          ]}
          correctIndex={0}
          explanation="Session token идентифицирует строку session, и уже она содержит user_id."
          fix={"statement = select(UserSessionModel).where(\n    UserSessionModel.token_digest == digest_session_token(raw_token),\n)"}
        />
      </Section>

      <Section number="04" title="Активность session — составное условие">
        <Lead>
          {"Найденная строка ещё не означает действующий вход. Session должна существовать, не быть отозванной и иметь expires_at позже текущего времени."}
        </Lead>

        <CodeBlock
          caption="проверить session"
          code={"def require_active_session(\n    db: Session,\n    raw_token: str,\n) -> UserSessionModel:\n    session = find_session_by_token(db, raw_token)\n\n    if session is None:\n        raise unauthorized()\n\n    if session.revoked_at is not None:\n        raise unauthorized()\n\n    if session.expires_at <= utc_now():\n        raise unauthorized()\n\n    return session"}
        />

        <BranchExplorer
          code={"session = lookup(token)\nif session is None:\n    401 unknown\nelif session.revoked_at:\n    401 revoked\nelif session.expires_at <= now:\n    401 expired\nelse:\n    active session"}
          scenarios={[
            { label: "unknown", activeLine: 2, output: "401" },
            { label: "revoked", activeLine: 4, output: "401" },
            { label: "expired", activeLine: 6, output: "401" },
            { label: "active", activeLine: 8, output: "continue" },
          ]}
        />

        <TrueFalse
          statement={<>{"Если token найден в таблице, expires_at можно не проверять."}</>}
          isTrue={false}
          explanation={"Просроченные записи могут оставаться в базе для аудита или последующей очистки."}
        />

        <RecallCard
          question="Почему все невалидные состояния дают один внешний 401?"
          answer={<p>{"Клиенту достаточно знать, что текущая authentication session недействительна. Внутреннюю причину приложение может учитывать отдельно, не раскрывая детали."}</p>}
        />

        <Callout tone="info">
          {"Проверки выполняются на каждом защищённом запросе. Наличие cookie в браузере не кеширует решение сервера."}
        </Callout>
      </Section>

      <Section number="05" title="Загрузка и проверка пользователя">
        <Lead>
          {"Session указывает на user_id, но пользователь мог быть удалён или деактивирован после login. Поэтому current user загружается заново и проходит собственную проверку."}
        </Lead>

        <CodeBlock
          caption="dependency current user"
          code={"from fastapi import Depends\n\nSessionToken = Annotated[str, Depends(get_session_token)]\n\ndef get_current_user(\n    raw_token: SessionToken,\n    db: SessionDep,\n) -> UserModel:\n    session = require_active_session(db, raw_token)\n    user = db.get(UserModel, session.user_id)\n\n    if user is None or not user.is_active:\n        raise unauthorized()\n\n    return user\n\nCurrentUser = Annotated[\n    UserModel,\n    Depends(get_current_user),\n]"}
        />

        <MethodGrid
          rows={[
            [<>get_session_token</>, "гарантирует наличие cookie"],
            [<>require_active_session</>, "проверяет session lifecycle"],
            [<>db.get(UserModel, user_id)</>, "загружает актуальное состояние пользователя"],
            [<>is_active</>, "запрещает доступ деактивированной учётной записи"],
            [<>CurrentUser</>, "переиспользуемый тип зависимости endpoint"],
          ]}
        />

        <BugHunt
          code={"def get_current_user(session):\n    return {\"id\": session.user_id, \"is_active\": True}"}
          question="Почему нельзя собирать пользователя только из session?"
          options={[
            "Состояние User могло измениться после login",
            "Словари запрещены в FastAPI",
            "Session всегда содержит password",
          ]}
          correctIndex={0}
          explanation="Права и активность должны загружаться из актуальной серверной записи User."
          fix={"user = db.get(UserModel, session.user_id)\nif user is None or not user.is_active:\n    raise unauthorized()\nreturn user"}
        />

        <Callout>
          {"Session подтверждает предыдущий вход, но не замораживает пользователя навсегда. Изменение is_active должно влиять на следующий request."}
        </Callout>
      </Section>

      <Section number="06" title="GET /users/me становится коротким">
        <Lead>
          {"После подготовки dependency endpoint профиля не знает о cookie, digest и таблице sessions. Он объявляет CurrentUser и возвращает безопасную схему."}
        </Lead>

        <CodeBlock
          caption="защищённый профиль"
          code={"from fastapi import APIRouter\n\nrouter = APIRouter(prefix=\"/users\", tags=[\"users\"])\n\n@router.get(\"/me\", response_model=UserRead)\ndef read_current_user(\n    current_user: CurrentUser,\n):\n    return current_user"}
        />

        <CompareSolutions
          question="Где должна находиться authentication pipeline?"
          left={{
            title: "В каждом endpoint",
            code: "read cookie → SELECT session → SELECT user",
            note: "Проверки копируются и легко расходятся.",
          }}
          right={{
            title: "В dependency",
            code: "current_user: CurrentUser",
            note: "Endpoint явно требует подтверждённого пользователя.",
          }}
          preferred="right"
          explanation={"Dependency централизует получение обязательного контекста."}
        />

        <CodeSequence
          title="Проследите защищённый request"
          prompt="Расположите этапы до выполнения read_current_user."
          pieces={[
            { id: "request", code: "GET /users/me + Cookie" },
            { id: "token", code: "get_session_token" },
            { id: "session", code: "require_active_session" },
            { id: "user", code: "get_current_user" },
            { id: "endpoint", code: "read_current_user" },
            { id: "response", code: "UserRead response" },
          ]}
          correctOrder={["request", "token", "session", "user", "endpoint", "response"]}
          explanation="FastAPI разрешает цепочку dependencies прежде, чем вызвать тело endpoint."
        />

        <Callout tone="info">
          {"Короткий endpoint — не признак скрытой магии, если dependency разбита на именованные проверяемые шаги."}
        </Callout>
      </Section>

      <Section number="07" title="Тесты активной и невалидной session">
        <Lead>
          {"Набор тестов должен покрывать каждую ветку pipeline. Один успешный тест не доказывает поведение при неизвестном, просроченном или отозванном token."}
        </Lead>

        <CodeBlock
          caption="успешный профиль"
          code={"def test_me_returns_logged_user(client, registered_user):\n    login(client, registered_user.email, \"correct-password\")\n\n    response = client.get(\"/users/me\")\n\n    assert response.status_code == 200\n    assert response.json()[\"id\"] == registered_user.id"}
        />

        <CodeBlock
          caption="матрица отказов"
          code={"def test_me_requires_cookie(client):\n    assert client.get(\"/users/me\").status_code == 401\n\n\ndef test_me_rejects_revoked_session(client, revoked_cookie):\n    client.cookies.set(\"studyhub_session\", revoked_cookie)\n    assert client.get(\"/users/me\").status_code == 401\n\n\ndef test_me_rejects_expired_session(client, expired_cookie):\n    client.cookies.set(\"studyhub_session\", expired_cookie)\n    assert client.get(\"/users/me\").status_code == 401"}
        />

        <TerminalDemo
          title="authentication matrix"
          lines={[
            { cmd: "pytest tests/test_current_user.py -q" },
            { out: "active session PASSED" },
            { out: "missing cookie PASSED" },
            { out: "unknown token PASSED" },
            { out: "revoked session PASSED" },
            { out: "expired session PASSED" },
            { out: "5 passed" },
          ]}
        />

        <Callout>
          {"Создавайте просроченную session через fixture с явным expires_at, а не через sleep. Тест должен быть быстрым и детерминированным."}
        </Callout>

        <div className="lesson-practice-steps">
          <h3>{"Одна причина на dependency"}</h3>
          <p>
            {"get_session_token отвечает за транспорт, require_active_session — за lifecycle входа, get_current_user — за актуальную учётную запись."}
          </p>
          <h3>{"Единый внешний контракт"}</h3>
          <p>
            {"Missing, unknown, revoked и expired session возвращают одинаковый 401. Внутренние причины остаются деталями диагностики сервера."}
          </p>
          <h3>{"Регрессионная проверка"}</h3>
          <p>
            {"После деактивации User ранее выданная session не должна открывать /users/me. Это доказывает повторную загрузку User."}
          </p>
        </div>

        <CodeBlock
          caption="единая фабрика 401"
          code={"def unauthorized() -> HTTPException:\n    return HTTPException(\n        status_code=401,\n        detail=\"Требуется действующая session\",\n    )"}
        />

        <Callout>
          {"Не передавайте различающиеся причины authentication failure клиенту через detail. Такой контракт облегчает enumeration и привязывает frontend к внутренней модели."}
        </Callout>

      </Section>

      <Section number="08" title="Контрольная точка: current user как dependency">
        <Lead>
          {"Полная модель должна объясняться без фразы «FastAPI сам понял пользователя». Framework только вызывает объявленные функции; каждая функция преобразует один вход в более сильную гарантию."}
        </Lead>

        <div className="lesson-check-group">
          <QuizCard
            question="Что возвращает get_session_token?"
            options={["существующий raw token или 401", "готовый UserRead", "новую cookie"]}
            correctIndex={0}
            explanation="Первая dependency отвечает только за наличие значения."
          />
          <QuizCard
            question="По какому полю ищется session?"
            options={["token_digest", "password_hash", "username"]}
            correctIndex={0}
            explanation="Raw token сначала преобразуется в digest."
          />
          <QuizCard
            question="Почему User загружается заново?"
            options={["проверить актуальное существование и is_active", "обновить cookie", "создать SQL migration"]}
            correctIndex={0}
            explanation="Состояние учётной записи могло измениться после login."
          />
          <QuizCard
            question="Что получает endpoint /users/me?"
            options={["CurrentUser", "сырой заголовок Cookie", "пароль"]}
            correctIndex={0}
            explanation="Authentication pipeline завершена до вызова endpoint."
          />
        </div>

        <KeyTakeaways
          points={[
            <>{"Dependency устраняет повторение authentication checks."}</>,
            <>{"Отсутствующая cookie формирует 401, а не validation error 422."}</>,
            <>{"Raw token преобразуется в digest перед SELECT."}</>,
            <>{"Активная session одновременно существует, не отозвана и не просрочена."}</>,
            <>{"Пользователь загружается заново и проверяется через is_active."}</>,
            <><code>{"CurrentUser"}</code>{" делает требование endpoint явным."}</>,
            <>{"Негативные ветки проверяются отдельными детерминированными тестами."}</>,
          ]}
        />

        <PracticeCta text="Реализуйте цепочку get_session_token → require_active_session → get_current_user и endpoint GET /users/me. Добавьте тесты отсутствующей cookie, неизвестного token, revoked_at, expires_at и деактивированного пользователя." />
      </Section>
    </RichLesson>
  );
}
