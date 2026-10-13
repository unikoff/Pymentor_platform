import { HardDrive, LockKeyhole } from "lucide-react";
import { BranchExplorer, BugHunt, Callout, CodeBlock, CodeSequence, CompareSolutions, KeyTakeaways, Lead, MatchPairs, MethodGrid, PracticeCta, QuizCard, RecallCard, RichHero, RichLesson, Section, TerminalDemo, TrueFalse, TypeCard, TypeCards } from "../../shared";
import { TheoryBridge } from "../../shared";
const BLOCK_TITLE = "Блок 18 · Cookie и серверные сессии";

export function Lesson103({ module }: { module?: string }) {
  return (
    <RichLesson>
      <RichHero
        variant="project"
        chip={module ?? BLOCK_TITLE}
        title={"Logout, expiration и revocation"}
        intro={"Завершим lifecycle server-side session: найдём именно текущую запись, отзовём её в базе, удалим cookie у клиента, реализуем logout всех устройств и разберём очистку просроченных sessions."}
        tags={[
          { icon: <LockKeyhole size={14} />, label: "revoke + delete cookie" },
          { icon: <HardDrive size={14} />, label: "one device · all devices" },
        ]}
      />
      <TheoryBridge link={"Current user уже определяется через session. Теперь нужно корректно завершать вход, отзывать отдельные устройства и отличать истечение срока от физической очистки записей."} boundary={"Удаление cookie только очищает браузер. Надёжный logout также отзывает session на сервере, иначе скопированный token продолжит работать."} />

      <Section number="01" title="Logout имеет клиентскую и серверную половину">
        <Lead>
          {"В session-based authentication существуют два состояния: cookie в браузере и строка в user_sessions. Надёжный logout меняет оба. Одного delete_cookie недостаточно, потому что скопированный raw token останется действующим на сервере."}
        </Lead>

        <div className="lesson-route">
          <ol>
            <li>
              <strong>{"Определить текущую session:"}</strong> {"получить не только User, но и строку, найденную по cookie."}
            </li>
            <li>
              <strong>{"Отозвать на сервере:"}</strong> {"записать revoked_at и выполнить commit."}
            </li>
            <li>
              <strong>{"Очистить клиента:"}</strong> {"добавить удаляющий Set-Cookie с теми же path и domain."}
            </li>
            <li>
              <strong>{"Проверить повторный request:"}</strong> {"старая session должна давать 401."}
            </li>
          </ol>
          <p>
            {"После урока StudyHub поддерживает logout текущего устройства, logout всех устройств и понятную политику истечения срока."}
          </p>
        </div>

        <CompareSolutions
          question="Какой logout отзывает доступ, даже если token был скопирован?"
          left={{
            title: "Только удалить cookie",
            code: "response.delete_cookie(\"studyhub_session\")",
            note: "Очищает конкретный браузер, но server-side запись остаётся активной.",
          }}
          right={{
            title: "Revoke и удалить cookie",
            code: "session.revoked_at = now\ncommit\nresponse.delete_cookie(...)",
            note: "Сервер перестаёт принимать старый token.",
          }}
          preferred="right"
          explanation={"Источник решения о доступе находится на сервере."}
        />

        <Callout tone="info">
          {"Logout не удаляет User и не меняет password_hash. Он завершает только один или несколько экземпляров входа."}
        </Callout>
      </Section>

      <Section number="02" title="Dependency текущей session">
        <Lead>
          {"Для logout нужен объект UserSessionModel, а не только current_user. Поэтому цепочку удобно разделить: CurrentSession возвращает активную session, CurrentUser использует её user_id."}
        </Lead>

        <CodeBlock
          caption="переиспользуемая dependency"
          code={"from typing import Annotated\n\nfrom fastapi import Depends\n\nCurrentSession = Annotated[\n    UserSessionModel,\n    Depends(get_current_session),\n]\n\ndef get_current_session(\n    raw_token: SessionToken,\n    db: SessionDep,\n) -> UserSessionModel:\n    return require_active_session(db, raw_token)\n\ndef get_current_user(\n    session: CurrentSession,\n    db: SessionDep,\n) -> UserModel:\n    user = db.get(UserModel, session.user_id)\n    if user is None or not user.is_active:\n        raise unauthorized()\n    return user"}
        />

        <TypeCards>
          <TypeCard badge="session" title="CurrentSession" code={"UserSessionModel"}>
            {"Нужна операциям logout, просмотра устройств и обновления last_seen."}
          </TypeCard>
          <TypeCard badge="user" badgeTone="float" title="CurrentUser" code={"UserModel"}>
            {"Нужна предметным endpoint, которые работают от имени пользователя."}
          </TypeCard>
          <TypeCard badge="chain" badgeTone="str" title="Одна проверка" code={"token → session → user"}>
            {"FastAPI переиспользует resolved dependency в рамках одного request."}
          </TypeCard>
        </TypeCards>

        <MatchPairs
          prompt="Соедините endpoint и минимальный обязательный контекст."
          pairs={[
            { left: "POST /auth/session/logout", right: "CurrentSession" },
            { left: "GET /users/me", right: "CurrentUser" },
            { left: "DELETE /tasks/{task_id}", right: "CurrentUser" },
            { left: "GET /auth/sessions", right: "CurrentUser" },
          ]}
          explanation="Endpoint объявляет именно тот подтверждённый контекст, который ему нужен."
        />

        <Callout>
          {"Не выполняйте повторный SELECT session внутри logout, если CurrentSession уже разрешена dependency chain."}
        </Callout>
      </Section>

      <Section number="03" title="Отзыв текущей session">
        <Lead>
          {"Отзыв сохраняет запись для аудита, но помечает её недействительной. Повторная операция должна быть предсказуемой: защищённый logout вызывается только для активной session, поэтому после первого logout тот же token уже не проходит dependency."}
        </Lead>

        <CodeBlock
          caption="session service"
          code={"from sqlalchemy.orm import Session\n\ndef revoke_session(\n    db: Session,\n    session: UserSessionModel,\n) -> None:\n    session.revoked_at = utc_now()\n    db.commit()"}
        />

        <CodeBlock
          caption="endpoint logout"
          code={"from fastapi import Response, status\n\n@router.post(\n    \"/logout\",\n    status_code=status.HTTP_204_NO_CONTENT,\n)\ndef session_logout(\n    response: Response,\n    current_session: CurrentSession,\n    db: SessionDep,\n) -> None:\n    revoke_session(db, current_session)\n    response.delete_cookie(\n        key=settings.session_cookie_name,\n        path=\"/\",\n    )"}
        />

        <CodeSequence
          title="Соберите logout текущего устройства"
          prompt="Расположите действия в порядке изменения источников состояния."
          pieces={[
            { id: "resolve", code: "resolve CurrentSession" },
            { id: "revoke", code: "set revoked_at" },
            { id: "commit", code: "db.commit()" },
            { id: "delete", code: "response.delete_cookie(...)" },
            { id: "empty", code: "return 204 without body" },
          ]}
          correctOrder={["resolve", "revoke", "commit", "delete", "empty"]}
          explanation="Сначала сервер прекращает доверять token, затем клиент получает инструкцию удалить cookie."
        />

        <Callout tone="info">
          {"Статус 204 означает отсутствие response body. Не возвращайте JSON-сообщение вместе с 204."}
        </Callout>
      </Section>

      <Section number="04" title="Expiration, revocation и cleanup — разные действия">
        <Lead>
          {"Session может перестать работать автоматически по expires_at или вручную по revoked_at. Физическое удаление старых строк — отдельная housekeeping-операция и не должно быть условием безопасности."}
        </Lead>

        <MethodGrid
          rows={[
            [<>expiration</>, "сервер отклоняет session после заранее заданного expires_at"],
            [<>revocation</>, "сервер завершает session раньше срока по явному событию"],
            [<>delete_cookie</>, "клиент перестаёт автоматически отправлять значение"],
            [<>cleanup</>, "удаляет старые записи для обслуживания хранилища"],
            [<>audit retention</>, "может сохранять минимальную историю по политике проекта"],
          ]}
        />

        <BranchExplorer
          code={"request token\nif revoked_at is not None:\n    reject\nelif expires_at <= now:\n    reject\nelse:\n    accept\n\ncleanup later removes old rows"}
          scenarios={[
            { label: "manual logout", activeLine: 2, output: "revoked → 401" },
            { label: "time passed", activeLine: 4, output: "expired → 401" },
            { label: "active", activeLine: 6, output: "request continues" },
            { label: "maintenance", activeLine: 8, output: "old rows may be deleted later" },
          ]}
        />

        <TrueFalse
          statement={<>{"Просроченная session остаётся безопасной только после физического DELETE из базы."}</>}
          isTrue={false}
          explanation={"Доступ прекращается из-за проверки expires_at. Cleanup отвечает за объём данных, а не за основное решение авторизации."}
        />

        <Callout>
          {"Не пытайтесь удалять все просроченные sessions внутри каждого request. Это смешивает authentication check с обслуживанием таблицы."}
        </Callout>
      </Section>

      <Section number="05" title="Logout всех устройств">
        <Lead>
          {"Операция «выйти везде» отзывает все активные sessions пользователя одной транзакцией. Текущая cookie также удаляется, а другие устройства получат 401 при следующем запросе."}
        </Lead>

        <CodeBlock
          caption="массовый update"
          code={"from sqlalchemy import update\n\ndef revoke_all_user_sessions(\n    db: Session,\n    user_id: int,\n) -> int:\n    statement = (\n        update(UserSessionModel)\n        .where(\n            UserSessionModel.user_id == user_id,\n            UserSessionModel.revoked_at.is_(None),\n        )\n        .values(revoked_at=utc_now())\n    )\n\n    result = db.execute(statement)\n    db.commit()\n    return result.rowcount"}
        />

        <CodeBlock
          caption="endpoint logout all"
          code={"@router.post(\n    \"/logout-all\",\n    status_code=status.HTTP_204_NO_CONTENT,\n)\ndef logout_all_sessions(\n    response: Response,\n    current_user: CurrentUser,\n    db: SessionDep,\n) -> None:\n    revoke_all_user_sessions(db, current_user.id)\n    response.delete_cookie(\n        key=settings.session_cookie_name,\n        path=\"/\",\n    )"}
        />

        <CompareSolutions
          question="По какому условию отзываются все устройства?"
          left={{
            title: "Только текущий token",
            code: "WHERE token_digest = current_digest",
            note: "Завершает одну session.",
          }}
          right={{
            title: "Все sessions пользователя",
            code: "WHERE user_id = current_user.id AND revoked_at IS NULL",
            note: "Завершает каждый активный вход.",
          }}
          preferred="right"
          explanation={"Logout-all выражает область операции через user_id."}
        />

        <Callout tone="info">
          {"Количество обновлённых строк полезно для внутренних тестов и логов, но не обязательно возвращать клиенту в 204 response."}
        </Callout>
      </Section>

      <Section number="06" title="Ошибка rollback при отзыве">
        <Lead>
          {"Revocation изменяет базу и поэтому подчиняется тем же транзакционным правилам, что CRUD. При ошибке commit выполняется rollback, а endpoint не должен заявлять успешный logout."}
        </Lead>

        <CodeBlock
          caption="безопасный service"
          code={"from sqlalchemy.exc import SQLAlchemyError\n\nclass SessionRevocationError(Exception):\n    pass\n\ndef revoke_session(db: Session, session: UserSessionModel) -> None:\n    session.revoked_at = utc_now()\n\n    try:\n        db.commit()\n    except SQLAlchemyError as error:\n        db.rollback()\n        raise SessionRevocationError from error"}
        />

        <BugHunt
          code={"session.revoked_at = utc_now()\ntry:\n    db.commit()\nexcept SQLAlchemyError:\n    response.delete_cookie(\"studyhub_session\")"}
          question="Какое обязательное действие пропущено после database error?"
          options={[
            "db.rollback()",
            "создание нового пользователя",
            "декодирование JWT",
          ]}
          correctIndex={0}
          explanation="Session SQLAlchemy должна выйти из failed transaction state."
          fix={"try:\n    db.commit()\nexcept SQLAlchemyError as error:\n    db.rollback()\n    raise SessionRevocationError from error"}
        />

        <RecallCard
          question="Почему нельзя удалить cookie и скрыть ошибку commit?"
          answer={<p>{"Клиент подумает, что logout завершён, хотя server-side token продолжит действовать. Нельзя сообщать успех при несогласованном состоянии."}</p>}
        />

        <Callout>
          {"При временной ошибке пользователь может повторить logout. Безопасность требует честно сохранить серверный результат, а не только изменить интерфейс браузера."}
        </Callout>
      </Section>

      <Section number="07" title="Два клиента доказывают область logout">
        <Lead>
          {"Два экземпляра TestClient моделируют два устройства с независимыми cookie jar. Это позволяет доказать разницу между logout текущей session и logout-all."}
        </Lead>

        <CodeBlock
          caption="logout одного устройства"
          code={"def test_logout_revokes_only_current_session(app, user):\n    laptop = TestClient(app)\n    phone = TestClient(app)\n\n    login(laptop, user)\n    login(phone, user)\n\n    assert laptop.post(\"/auth/session/logout\").status_code == 204\n    assert laptop.get(\"/users/me\").status_code == 401\n    assert phone.get(\"/users/me\").status_code == 200"}
        />

        <CodeBlock
          caption="logout всех устройств"
          code={"def test_logout_all_revokes_every_session(app, user):\n    laptop = TestClient(app)\n    phone = TestClient(app)\n\n    login(laptop, user)\n    login(phone, user)\n\n    assert laptop.post(\"/auth/session/logout-all\").status_code == 204\n    assert laptop.get(\"/users/me\").status_code == 401\n    assert phone.get(\"/users/me\").status_code == 401"}
        />

        <TerminalDemo
          title="session lifecycle tests"
          lines={[
            { cmd: "pytest tests/test_session_logout.py -q" },
            { out: "logout current device PASSED" },
            { out: "old token rejected PASSED" },
            { out: "other device remains active PASSED" },
            { out: "logout all devices PASSED" },
            { out: "4 passed" },
          ]}
        />

        <Callout tone="info">
          {"Не копируйте cookies между laptop и phone fixtures. Их независимость и является частью тестируемого контракта."}
        </Callout>

        <div className="lesson-practice-steps">
          <h3>{"Security decision"}</h3>
          <p>
            {"Проверка expires_at и revoked_at остаётся в request pipeline независимо от наличия cleanup job."}
          </p>
          <h3>{"Housekeeping decision"}</h3>
          <p>
            {"Старые строки можно удалять отдельной командой обслуживания по согласованному retention period."}
          </p>
          <h3>{"Operational boundary"}</h3>
          <p>
            {"Планировщик фоновых задач и распределённая очистка относятся к будущим этапам. Сейчас достаточно тестируемой функции cleanup_expired_sessions."}
          </p>
        </div>

        <CodeBlock
          caption="явная очистка для административной команды"
          code={"from sqlalchemy import delete\n\ndef cleanup_old_sessions(db: Session, cutoff: datetime) -> int:\n    statement = delete(UserSessionModel).where(\n        UserSessionModel.expires_at < cutoff,\n    )\n    result = db.execute(statement)\n    db.commit()\n    return result.rowcount"}
        />

        <Callout>
          {"Cleanup не вызывается из get_current_user. Authentication request должен оставаться коротким и не выполнять несвязанное массовое удаление."}
        </Callout>

      </Section>

      <Section number="08" title="Контрольная точка: lifecycle session">
        <Lead>
          {"Session теперь имеет полный жизненный цикл: создаётся при login, используется current_user dependency, завершается по expires_at или revoked_at и может очищаться отдельной служебной операцией."}
        </Lead>

        <div className="lesson-check-group">
          <QuizCard
            question="Почему delete_cookie недостаточно?"
            options={["server-side session останется активной", "удалится User", "изменится password_hash"]}
            correctIndex={0}
            explanation="Сервер продолжит принимать скопированный token без revocation."
          />
          <QuizCard
            question="Что изменяет logout текущего устройства?"
            options={["одну CurrentSession", "все Users", "все задачи"]}
            correctIndex={0}
            explanation="Точечный logout работает с записью, найденной по текущей cookie."
          />
          <QuizCard
            question="Чем cleanup отличается от expiration?"
            options={["cleanup удаляет старые строки, expiration запрещает доступ", "ничем", "cleanup создаёт token"]}
            correctIndex={0}
            explanation="Безопасность обеспечивается проверкой времени, а cleanup обслуживает хранилище."
          />
          <QuizCard
            question="Как проверить несколько устройств?"
            options={["двумя независимыми TestClient", "одним request body", "двумя endpoint в одном client"]}
            correctIndex={0}
            explanation="Каждый клиент должен иметь собственный cookie jar."
          />
        </div>

        <KeyTakeaways
          points={[
            <>{"Logout изменяет server-side session и клиентскую cookie."}</>,
            <>{"CurrentSession предоставляет endpoint конкретную запись входа."}</>,
            <>{"revoked_at завершает доступ раньше expires_at."}</>,
            <>{"Expiration не зависит от физического удаления строки."}</>,
            <>{"Logout-all отзывает активные sessions по user_id."}</>,
            <>{"Ошибка commit требует rollback и честного ответа."}</>,
            <>{"Два TestClient моделируют два независимых устройства."}</>,
          ]}
        />

        <PracticeCta text="Реализуйте CurrentSession, POST /auth/session/logout и POST /auth/session/logout-all. Докажите тестами, что старый token получает 401, обычный logout не завершает второе устройство, а logout-all завершает оба." />
      </Section>
    </RichLesson>
  );
}
