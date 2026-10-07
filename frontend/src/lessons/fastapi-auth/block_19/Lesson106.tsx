import { AlertTriangle, ShieldCheck } from "lucide-react";
import { BranchExplorer, BugHunt, Callout, CodeBlock, CodeSequence, CompareSolutions, FillBlank, KeyTakeaways, Lead, MatchPairs, PracticeCta, QuizCard, RecallCard, RichHero, RichLesson, Section, StepThrough, TerminalDemo, TrueFalse, TypeCard, TypeCards } from "../../shared";
import { TheoryBridge } from "../../shared";
const BLOCK_TITLE = "Блок 19 · Bearer tokens, JWT и права";

export function Lesson106({ module }: { module?: string }) {
  return (
    <RichLesson>
      <RichHero
        variant="project"
        chip={module ?? BLOCK_TITLE}
        title={"Access token"}
        intro={
          "Соберём короткоживущий access token, проверим signature, expiration и type, затем приведём ошибки к единому 401."
        }
        tags={[
          { icon: <ShieldCheck size={14} />, label: "encode · decode" },
          { icon: <AlertTriangle size={14} />, label: "expiration · 401" },
        ]}
      />
      <TheoryBridge link={"После изучения структуры JWT проект начинает выпускать собственный access token."} boundary={"Secret и algorithm задаются серверными settings, а не клиентом или header token."} />
      <Section number="01" title="Зачем нужна тема">
        <Lead>
          {
            "Реализовать create_access_token и decode_access_token с тестами срока и подписи."
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
              "После изучения структуры JWT проект начинает выпускать собственный access token."
            }
          </p>
        </div>
        <Callout tone="info">
          {
            "Secret и algorithm задаются серверными settings, а не клиентом или header token."
          }
        </Callout>
      </Section>
      <Section number="02" title="Главная модель">
        <Lead>
          Три опорных понятия урока образуют один путь, но сохраняют разные
          ответственности.
        </Lead>
        <TypeCards>
          <TypeCard badge={"sub"} title={"Субъект"} code={"str(user.id)"}>
            Проверьте вход, результат и границу доверия этого элемента.
          </TypeCard>
          <TypeCard
            badge={"iat"}
            badgeTone="float"
            title={"Выпуск"}
            code={"datetime.now(UTC)"}
          >
            Проверьте вход, результат и границу доверия этого элемента.
          </TypeCard>
          <TypeCard
            badge={"exp"}
            badgeTone="str"
            title={"Истечение"}
            code={"now + short TTL"}
          >
            Проверьте вход, результат и границу доверия этого элемента.
          </TypeCard>
        </TypeCards>
        <MatchPairs
          prompt="Соедините термин и роль."
          pairs={[
            { left: "sub", right: "Субъект" },
            { left: "iat", right: "Выпуск" },
            { left: "exp", right: "Истечение" },
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
            "Реализовать create_access_token и decode_access_token с тестами срока и подписи."
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
          code={`from datetime import datetime, timedelta, timezone
import jwt

def create_access_token(subject: str, settings) -> str:
    now = datetime.now(timezone.utc)
    payload = {"sub": subject, "type": "access", "iat": now,
               "exp": now + timedelta(minutes=settings.access_ttl)}
    return jwt.encode(payload, settings.jwt_secret, algorithm=settings.jwt_algorithm)`}
        />
        <StepThrough
          code={`from datetime import datetime, timedelta, timezone
import jwt

def create_access_token(subject: str, settings) -> str:
    now = datetime.now(timezone.utc)
    payload = {"sub": subject, "type": "access", "iat": now,
               "exp": now + timedelta(minutes=settings.access_ttl)}
    return jwt.encode(payload, settings.jwt_secret, algorithm=settings.jwt_algorithm)`}
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
            "Реализовать create_access_token и decode_access_token с тестами срока и подписи."
          }
          left={{
            title: "decode без проверки",
            code: 'jwt.decode(token, options={"verify_signature": False})',
            note: "Рискованная граница.",
          }}
          right={{
            title: "проверка контракта",
            code: "jwt.decode(token, secret, algorithms=[algorithm])",
            note: "Явный безопасный контракт.",
          }}
          preferred="right"
          explanation={
            "Authorization требует проверки signature, exp и явного списка algorithms."
          }
        />
        <TrueFalse
          statement={
            <>
              {
                "Secret и algorithm задаются серверными settings, а не клиентом или header token."
              }
            </>
          }
          isTrue={true}
          explanation={
            "Secret и algorithm задаются серверными settings, а не клиентом или header token."
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
            { id: "0", code: "jwt.decode с algorithms" },
            { id: "1", code: "проверить type=access" },
            { id: "2", code: "получить непустой sub" },
            { id: "3", code: "вернуть subject" },
            { id: "4", code: "загрузить User позже" },
          ]}
          correctOrder={["0", "1", "2", "3", "4"]}
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
          code={`payload = jwt.decode(token, secret, algorithms=["HS256"])
return payload["sub"]`}
          question="Что нарушено?"
          options={[
            "Не проверен claim type=access.",
            "Ошибка в названии переменной.",
            "Нужно добавить print.",
          ]}
          correctIndex={0}
          explanation={"Не проверен claim type=access."}
          fix={`if payload.get("type") != "access":
    raise InvalidAccessToken`}
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
          code={`import jwt
from jwt import ExpiredSignatureError, InvalidTokenError

class InvalidAccessToken(Exception): pass

def decode_access_token(token: str, settings) -> str:
    try:
        payload = jwt.decode(token, settings.jwt_secret, algorithms=[settings.jwt_algorithm])
    except (ExpiredSignatureError, InvalidTokenError) as error:
        raise InvalidAccessToken from error
    if payload.get("type") != "access": raise InvalidAccessToken
    subject = payload.get("sub")
    if not isinstance(subject, str) or not subject: raise InvalidAccessToken
    return subject`}
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
            "Реализовать create_access_token и decode_access_token с тестами срока и подписи."
          }
          hint="Назовите источник доверия."
          answer={
            <p>
              {
                "После изучения структуры JWT проект начинает выпускать собственный access token."
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
            question={"Кто задаёт sub и exp?"}
            options={["сервер", "клиент", "SQLite"]}
            correctIndex={0}
            explanation={"Ответ следует из security-контракта урока."}
          />
          <QuizCard
            question={"Почему TTL короткий?"}
            options={["ограничить ущерб", "ускорить SQL", "заменить HTTPS"]}
            correctIndex={0}
            explanation={"Ответ следует из security-контракта урока."}
          />
          <QuizCard
            question={"Что передают в decode?"}
            options={["algorithms", "password", "Response"]}
            correctIndex={0}
            explanation={"Ответ следует из security-контракта урока."}
          />
          <QuizCard
            question={"Неверная signature даёт?"}
            options={["401", "200", "201"]}
            correctIndex={0}
            explanation={"Ответ следует из security-контракта урока."}
          />
        </div>
        <KeyTakeaways
          points={[
            <>{"Access token короткоживущий."}</>,
            <>{"Payload строит сервер."}</>,
            <>{"Время задаётся в UTC."}</>,
            <>{"Algorithm ограничивается явно."}</>,
            <>{"Проверяются exp и type."}</>,
            <>{"Ошибки нормализуются в 401."}</>,
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
            "Реализуйте encode/decode и тесты roundtrip, expiration, wrong signature и refresh-as-access."
          }
        />
      </Section>
    </RichLesson>
  );
}
