import { KeyRound, LockKeyhole } from "lucide-react";
import { BranchExplorer, BugHunt, Callout, CodeBlock, CodeSequence, CompareSolutions, FillBlank, KeyTakeaways, Lead, MatchPairs, PracticeCta, QuizCard, RecallCard, RichHero, RichLesson, Section, StepThrough, TerminalDemo, TrueFalse, TypeCard, TypeCards } from "../../shared";
import { TheoryBridge } from "../../shared";
const BLOCK_TITLE = "Блок 19 · Bearer tokens, JWT и права";

export function Lesson109({ module }: { module?: string }) {
  return (
    <RichLesson>
      <RichHero
        variant="project"
        chip={module ?? BLOCK_TITLE}
        title={"Refresh token, rotation и revocation"}
        intro={
          "Добавим долгоживущий refresh token, server-side refresh-session, rotation, reuse detection и logout."
        }
        tags={[
          { icon: <KeyRound size={14} />, label: "access + refresh" },
          { icon: <LockKeyhole size={14} />, label: "rotation · revocation" },
        ]}
      />
      <TheoryBridge link={"Короткий access token безопаснее, но требует способа получать новую пару без повторного password."} boundary={"Refresh token принимается только на /auth/refresh и проверяется вместе с записью session в базе."} />
      <Section number="01" title="Зачем нужна тема">
        <Lead>
          {
            "Реализовать одноразовую rotation и управляемый отзыв refresh credentials."
          }
        </Lead>
        <div className="lesson-route">
          <ol>
            <li>
              <strong>Понять:</strong> назвать проблему до кода.
            </li>
            <li>
              <strong>Увидеть:</strong> проследить credential по слоям.
            </li>
            <li>
              <strong>Проверить:</strong> success и два отказа.
            </li>
            <li>
              <strong>Объяснить:</strong> обосновать status code.
            </li>
          </ol>
          <p>
            {
              "Короткий access token безопаснее, но требует способа получать новую пару без повторного password."
            }
          </p>
        </div>
        <Callout tone="info">
          {
            "Refresh token принимается только на /auth/refresh и проверяется вместе с записью session в базе."
          }
        </Callout>
      </Section>
      <Section number="02" title="Главная модель">
        <Lead>
          Три опорных понятия урока образуют один путь, но сохраняют разные
          ответственности.
        </Lead>
        <TypeCards>
          <TypeCard
            badge={"access"}
            title={"Частые запросы"}
            code={"type=access · 15m"}
          >
            Проверьте вход, результат и границу доверия этого элемента.
          </TypeCard>
          <TypeCard
            badge={"refresh"}
            badgeTone="float"
            title={"Обновление пары"}
            code={"type=refresh · 30d"}
          >
            Проверьте вход, результат и границу доверия этого элемента.
          </TypeCard>
          <TypeCard
            badge={"jti"}
            badgeTone="str"
            title={"Идентификатор"}
            code={"uuid4().hex"}
          >
            Проверьте вход, результат и границу доверия этого элемента.
          </TypeCard>
        </TypeCards>
        <MatchPairs
          prompt="Соедините термин и роль."
          pairs={[
            { left: "access", right: "Частые запросы" },
            { left: "refresh", right: "Обновление пары" },
            { left: "jti", right: "Идентификатор" },
          ]}
          explanation="Модель разделяет HTTP, security и данные."
        />
        <div className="lesson-practice-steps">
          <h3>Термин</h3>
          <p>Назовите его без чтения кода.</p>
          <h3>Источник</h3>
          <p>Определите, кто создаёт значение.</p>
          <h3>Граница</h3>
          <p>Скажите, чему ещё нельзя доверять.</p>
        </div>
      </Section>
      <Section number="03" title="Механизм в коде">
        <Lead>
          {
            "Реализовать одноразовую rotation и управляемый отзыв refresh credentials."
          }
        </Lead>
        <div className="lesson-practice-steps">
          <h3>Вход</h3>
          <p>Что получает функция.</p>
          <h3>Преобразование</h3>
          <p>Какие проверки выполняются.</p>
          <h3>Выход</h3>
          <p>Что получает следующий слой.</p>
        </div>
        <CodeBlock
          caption="основной код"
          code={`class RefreshSessionModel(Base):
    __tablename__ = "refresh_sessions"
    id: Mapped[int] = mapped_column(primary_key=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"), index=True)
    jti_hash: Mapped[str] = mapped_column(String(64), unique=True, index=True)
    expires_at: Mapped[datetime]
    revoked_at: Mapped[datetime | None] = mapped_column(nullable=True)
    replaced_by_id: Mapped[int | None] = mapped_column(ForeignKey("refresh_sessions.id"), nullable=True)`}
        />
        <StepThrough
          code={`class RefreshSessionModel(Base):
    __tablename__ = "refresh_sessions"
    id: Mapped[int] = mapped_column(primary_key=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"), index=True)
    jti_hash: Mapped[str] = mapped_column(String(64), unique=True, index=True)
    expires_at: Mapped[datetime]
    revoked_at: Mapped[datetime | None] = mapped_column(nullable=True)
    replaced_by_id: Mapped[int | None] = mapped_column(ForeignKey("refresh_sessions.id"), nullable=True)`}
          steps={[
            { line: 0, note: "Начинается контракт.", vars: { шаг: "1" } },
            {
              line: 2,
              note: "Выполняется основная проверка.",
              vars: { шаг: "2" },
            },
            {
              line: 4,
              note: "Формируется доверенный результат.",
              vars: { шаг: "3" },
            },
            {
              line: 6,
              note: "Значение передаётся дальше.",
              vars: { шаг: "4" },
            },
          ]}
        />
        <Callout tone="info">Проверки выполняются до бизнес-действия.</Callout>
      </Section>
      <Section number="04" title="Сравнение решений">
        <Lead>Сравните источник доверия и последствия ошибки.</Lead>
        <CompareSolutions
          question={
            "Реализовать одноразовую rotation и управляемый отзыв refresh credentials."
          }
          left={{
            title: "переиспользовать один refresh",
            code: "return new_access, same_refresh",
            note: "Рискованная граница.",
          }}
          right={{
            title: "rotation",
            code: "revoke(old); issue(new_pair)",
            note: "Явный безопасный контракт.",
          }}
          preferred="right"
          explanation={
            "Rotation ограничивает жизнь украденной копии и позволяет обнаружить reuse."
          }
        />
        <TrueFalse
          statement={
            <>
              {
                "Refresh token принимается только на /auth/refresh и проверяется вместе с записью session в базе."
              }
            </>
          }
          isTrue={true}
          explanation={
            "Refresh token принимается только на /auth/refresh и проверяется вместе с записью session в базе."
          }
        />
        <div className="lesson-practice-steps">
          <h3>До проверки</h3>
          <p>Данные недоверенные.</p>
          <h3>После проверки</h3>
          <p>Разрешено использовать только подтверждённый результат.</p>
          <h3>При ошибке</h3>
          <p>Операция прекращается.</p>
        </div>
      </Section>
      <Section number="05" title="Соберите порядок">
        <Lead>В security-коде порядок является частью корректности.</Lead>
        <CodeSequence
          title="Путь запроса"
          prompt="Расположите действия безопасно."
          pieces={[
            { id: "0", code: "decode type=refresh" },
            { id: "1", code: "вычислить jti_hash" },
            { id: "2", code: "загрузить active session" },
            { id: "3", code: "отозвать старую" },
            { id: "4", code: "создать новую пару" },
            { id: "5", code: "commit транзакции" },
          ]}
          correctOrder={["0", "1", "2", "3", "4", "5"]}
          explanation="Сначала проверка, затем действие."
        />
        <FillBlank
          prompt="Какой HTTP status означает отсутствие подтверждённой личности?"
          before="status_code="
          after=""
          options={["401", "403", "200"]}
          answer="401"
          explanation="401 требует действительной authentication."
        />
        <div className="lesson-practice-steps">
          <h3>Не переставлять</h3>
          <p>Claim нельзя использовать до проверки.</p>
          <h3>Не пропускать</h3>
          <p>Каждая граница имеет свой отказ.</p>
          <h3>Не смешивать</h3>
          <p>Endpoint не заменяет security service.</p>
        </div>
      </Section>
      <Section number="06" title="Запуск и отладка">
        <Lead>
          Проверяем наблюдаемое поведение и исправляем одну конкретную причину.
        </Lead>
        <TerminalDemo
          title="проверка"
          lines={[
            { cmd: "pytest -q" },
            { out: "security success PASSED" },
            { out: "invalid credential PASSED" },
            { out: "forbidden action PASSED" },
          ]}
        />
        <BugHunt
          code={`session = find_refresh_session(db, jti_hash)
if session is None: raise invalid_refresh
return issue_new_pair(user)`}
          question="Что нарушено?"
          options={[
            "Не проверены revoked_at и expires_at.",
            "Ошибка в названии переменной.",
            "Нужно добавить print.",
          ]}
          correctIndex={0}
          explanation={"Не проверены revoked_at и expires_at."}
          fix={`if session.revoked_at is not None or session.expires_at <= now_utc():
    raise invalid_refresh`}
        />
        <div className="lesson-practice-steps">
          <h3>Воспроизвести</h3>
          <p>Получите ошибку тестом.</p>
          <h3>Локализовать</h3>
          <p>Найдите нарушенный контракт.</p>
          <h3>Повторить</h3>
          <p>Запустите success и regression.</p>
        </div>
      </Section>
      <Section number="07" title="Проектное применение">
        <Lead>
          Тема встраивается в Personal StudyHub API, а не существует отдельной
          демонстрацией.
        </Lead>
        <CodeBlock
          caption="Personal StudyHub API"
          code={`@router.post("/refresh", response_model=TokenPair)
def refresh_tokens(payload: RefreshRequest, db: DbSession, settings: AppSettings):
    claims = decode_refresh_token(payload.refresh_token, settings)
    session = get_active_refresh_session(db, jti_hash=hash_jti(claims.jti))
    if session is None: raise invalid_refresh_exception()
    return rotate_refresh_session(db, session=session, settings=settings)`}
        />
        <BranchExplorer
          code={`if credential_is_missing:
    result = '401'
elif permission_is_missing:
    result = '403'
else:
    result = 'allow'`}
          scenarios={[
            { label: "anonymous", activeLine: 1, output: "401" },
            { label: "known without permission", activeLine: 3, output: "403" },
            { label: "allowed", activeLine: 5, output: "allow" },
          ]}
        />
        <RecallCard
          question={
            "Реализовать одноразовую rotation и управляемый отзыв refresh credentials."
          }
          hint="Назовите источник доверия."
          answer={
            <p>
              {
                "Короткий access token безопаснее, но требует способа получать новую пару без повторного password."
              }
            </p>
          }
        />
        <div className="lesson-practice-steps">
          <h3>Файл</h3>
          <p>Разместите код по ответственности.</p>
          <h3>Endpoint</h3>
          <p>Оставьте его коротким.</p>
          <h3>Тест</h3>
          <p>Проверьте два разных пользователя.</p>
        </div>
      </Section>
      <Section number="08" title="Контрольная точка">
        <Lead>Проверьте модель, код, status и граничные случаи.</Lead>
        <div className="lesson-check-group">
          <QuizCard
            question={"Зачем refresh?"}
            options={[
              "новая пара без password",
              "замена HTTPS",
              "хранение hash",
            ]}
            correctIndex={0}
            explanation={"Ответ следует из security-контракта урока."}
          />
          <QuizCard
            question={"Старый refresh после rotation?"}
            options={["отозван", "вечный", "становится access"]}
            correctIndex={0}
            explanation={"Ответ следует из security-контракта урока."}
          />
          <QuizCard
            question={"Зачем jti?"}
            options={["управлять session", "ускорить CSS", "CORS"]}
            correctIndex={0}
            explanation={"Ответ следует из security-контракта урока."}
          />
          <QuizCard
            question={"Reuse означает?"}
            options={["компрометацию", "успех", "valid access"]}
            correctIndex={0}
            explanation={"Ответ следует из security-контракта урока."}
          />
        </div>
        <KeyTakeaways
          points={[
            <>{"Access и refresh имеют разные type."}</>,
            <>{"Refresh используется редко."}</>,
            <>{"Session хранит jti hash."}</>,
            <>{"Rotation заменяет credential."}</>,
            <>{"Reuse вызывает security reaction."}</>,
            <>{"Logout отзывает refresh."}</>,
          ]}
        />
        <div className="lesson-practice-steps">
          <h3>Модель</h3>
          <p>Объясните без подсказки.</p>
          <h3>Код</h3>
          <p>Покажите место каждой проверки.</p>
          <h3>Тесты</h3>
          <p>Продемонстрируйте success, invalid и forbidden.</p>
        </div>
        <PracticeCta
          text={
            "Создайте RefreshSessionModel, миграцию, /auth/refresh и logout; протестируйте rotation, reuse и expiration."
          }
        />
      </Section>
    </RichLesson>
  );
}
