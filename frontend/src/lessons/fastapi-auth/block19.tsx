import {
  AlertTriangle,
  Database,
  GitFork,
  KeyRound,
  Layers,
  LockKeyhole,
  ShieldCheck,
} from "lucide-react";
import {
  BranchExplorer,
  BugHunt,
  Callout,
  CodeBlock,
  CodeSequence,
  CompareSolutions,
  FillBlank,
  KeyTakeaways,
  Lead,
  MatchPairs,
  PracticeCta,
  QuizCard,
  RecallCard,
  RichHero,
  RichLesson,
  Section,
  StepThrough,
  TerminalDemo,
  TrueFalse,
  TypeCard,
  TypeCards,
} from "../shared";

const BLOCK_TITLE = "Блок 19 · Bearer tokens, JWT и права";

type Bridge = { link: string; boundary: string };
const BRIDGES: Record<number, Bridge> = {
  105: {
    link: "После cookie-session клиент начинает явно предъявлять credential в каждом защищённом запросе.",
    boundary:
      "JWT подписан, но payload не зашифрован: пароли и secrets в него не помещают.",
  },
  106: {
    link: "После изучения структуры JWT проект начинает выпускать собственный access token.",
    boundary:
      "Secret и algorithm задаются серверными settings, а не клиентом или header token.",
  },
  107: {
    link: "Готовые authenticate_user и create_access_token соединяются на HTTP-границе.",
    boundary:
      "OAuth2PasswordBearer извлекает credential и описывает OpenAPI, но сам не проверяет JWT.",
  },
  108: {
    link: "Token уже извлекается и декодируется; теперь subject связывается с актуальной записью User.",
    boundary:
      "Валидный JWT не гарантирует, что User существует и активен сейчас.",
  },
  109: {
    link: "Короткий access token безопаснее, но требует способа получать новую пару без повторного password.",
    boundary:
      "Refresh token принимается только на /auth/refresh и проверяется вместе с записью session в базе.",
  },
  110: {
    link: "CurrentUser подтверждает личность; теперь API проверяет разрешение на конкретное действие.",
    boundary:
      "Валидный JWT не предоставляет автоматический доступ ко всем endpoint и чужим ресурсам.",
  },
};
function TheoryBridge({ lesson }: { lesson: number }) {
  const b = BRIDGES[lesson];
  return (
    <Callout tone="info">
      <strong>Связь с курсом.</strong> {b.link}{" "}
      <strong>Важно не перепутать:</strong> {b.boundary}
    </Callout>
  );
}

// 105. Bearer token и JWT
export function Lesson105({ module }: { module?: string }) {
  return (
    <RichLesson>
      <RichHero
        variant="project"
        chip={module ?? BLOCK_TITLE}
        title={"Bearer token и JWT"}
        intro={
          "Разберём передачу token через Authorization, три сегмента JWT и границу между чтением payload и доверием к нему."
        }
        tags={[
          { icon: <KeyRound size={14} />, label: "Authorization: Bearer" },
          { icon: <Layers size={14} />, label: "header · payload · signature" },
        ]}
      />
      <TheoryBridge lesson={105} />
      <Section number="01" title="Зачем нужна тема">
        <Lead>
          {
            "Понять bearer credential, header.payload.signature и claims sub, iat, exp."
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
              "После cookie-session клиент начинает явно предъявлять credential в каждом защищённом запросе."
            }
          </p>
        </div>
        <Callout tone="info">
          {
            "JWT подписан, но payload не зашифрован: пароли и secrets в него не помещают."
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
            badge={"Authorization"}
            title={"HTTP-заголовок"}
            code={"Authorization: Bearer eyJ..."}
          >
            Проверьте вход, результат и границу доверия этого элемента.
          </TypeCard>
          <TypeCard
            badge={"payload"}
            badgeTone="float"
            title={"Claims"}
            code={"sub · iat · exp"}
          >
            Проверьте вход, результат и границу доверия этого элемента.
          </TypeCard>
          <TypeCard
            badge={"signature"}
            badgeTone="str"
            title={"Целостность"}
            code={"header + payload + secret"}
          >
            Проверьте вход, результат и границу доверия этого элемента.
          </TypeCard>
        </TypeCards>
        <MatchPairs
          prompt="Соедините термин и роль."
          pairs={[
            { left: "Authorization", right: "HTTP-заголовок" },
            { left: "payload", right: "Claims" },
            { left: "signature", right: "Целостность" },
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
            "Понять bearer credential, header.payload.signature и claims sub, iat, exp."
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
          code={`import jwt

token = "eyJ...header.eyJ...payload.signature"
preview = jwt.decode(token, options={"verify_signature": False})
print(preview)`}
        />
        <StepThrough
          code={`import jwt

token = "eyJ...header.eyJ...payload.signature"
preview = jwt.decode(token, options={"verify_signature": False})
print(preview)`}
          steps={[
            { line: 0, note: "Начинается контракт.", vars: { шаг: "1" } },
            {
              line: 1,
              note: "Выполняется основная проверка.",
              vars: { шаг: "2" },
            },
            {
              line: 2,
              note: "Формируется доверенный результат.",
              vars: { шаг: "3" },
            },
            {
              line: 3,
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
            "Понять bearer credential, header.payload.signature и claims sub, iat, exp."
          }
          left={{
            title: "payload с password",
            code: '{"sub":"7","password":"qwerty"}',
            note: "Рискованная граница.",
          }}
          right={{
            title: "минимальный payload",
            code: '{"sub":"7","iat":1720000000,"exp":1720000900}',
            note: "Явный безопасный контракт.",
          }}
          preferred="right"
          explanation={
            "Payload доступен владельцу token, поэтому секреты внутри небезопасны."
          }
        />
        <TrueFalse
          statement={
            <>
              {
                "JWT подписан, но payload не зашифрован: пароли и secrets в него не помещают."
              }
            </>
          }
          isTrue={true}
          explanation={
            "JWT подписан, но payload не зашифрован: пароли и secrets в него не помещают."
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
            { id: "0", code: "прочитать Authorization" },
            { id: "1", code: "отделить Bearer от token" },
            { id: "2", code: "проверить signature и exp" },
            { id: "3", code: "получить sub" },
            { id: "4", code: "загрузить User" },
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
          code={`authorization = "Bearer eyJ..."
token = authorization.split(" ")[0]`}
          question="Что нарушено?"
          options={[
            "Взята схема Bearer вместо второй части.",
            "Ошибка в названии переменной.",
            "Нужно добавить print.",
          ]}
          correctIndex={0}
          explanation={"Взята схема Bearer вместо второй части."}
          fix={`scheme, token = authorization.split(" ", maxsplit=1)`}
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

def inspect_token(token: str) -> dict:
    return jwt.decode(token, options={"verify_signature": False})

claims = inspect_token("eyJ...demo")
print(claims.get("sub"), claims.get("iat"), claims.get("exp"))`}
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
            "Понять bearer credential, header.payload.signature и claims sub, iat, exp."
          }
          hint="Назовите источник доверия."
          answer={
            <p>
              {
                "После cookie-session клиент начинает явно предъявлять credential в каждом защищённом запросе."
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
            question={"Где передают access token?"}
            options={["в Authorization", "в имени файла", "в таблице tasks"]}
            correctIndex={0}
            explanation={"Ответ следует из security-контракта урока."}
          />
          <QuizCard
            question={"Что защищает signature?"}
            options={["целостность", "payload от чтения", "пароль"]}
            correctIndex={0}
            explanation={"Ответ следует из security-контракта урока."}
          />
          <QuizCard
            question={"Какой claim хранит subject?"}
            options={["sub", "css", "path"]}
            correctIndex={0}
            explanation={"Ответ следует из security-контракта урока."}
          />
          <QuizCard
            question={"Можно ли хранить password в payload?"}
            options={["нет", "да", "только admin"]}
            correctIndex={0}
            explanation={"Ответ следует из security-контракта урока."}
          />
        </div>
        <KeyTakeaways
          points={[
            <>{"Bearer token передаётся в Authorization."}</>,
            <>{"JWT состоит из трёх сегментов."}</>,
            <>{"Payload можно прочитать без проверки."}</>,
            <>{"Signature защищает целостность."}</>,
            <>{"sub связывает token с субъектом."}</>,
            <>{"Secrets не помещаются в payload."}</>,
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
            "Декодируйте учебный JWT, подпишите сегменты и покажите корректный и ошибочный Authorization."
          }
        />
      </Section>
    </RichLesson>
  );
}

// 106. Access token
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
      <TheoryBridge lesson={106} />
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

// 107. Token endpoint и OAuth2PasswordBearer
export function Lesson107({ module }: { module?: string }) {
  return (
    <RichLesson>
      <RichHero
        variant="project"
        chip={module ?? BLOCK_TITLE}
        title={"Token endpoint и OAuth2PasswordBearer"}
        intro={
          "Подключим FastAPI password flow: form credentials, POST /auth/token, OAuth2PasswordBearer и Swagger Authorize."
        }
        tags={[
          { icon: <KeyRound size={14} />, label: "POST /auth/token" },
          { icon: <GitFork size={14} />, label: "OAuth2PasswordBearer" },
        ]}
      />
      <TheoryBridge lesson={107} />
      <Section number="01" title="Зачем нужна тема">
        <Lead>
          {
            "Создать token endpoint и security scheme без смешения HTTP, password service и JWT."
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
              "Готовые authenticate_user и create_access_token соединяются на HTTP-границе."
            }
          </p>
        </div>
        <Callout tone="info">
          {
            "OAuth2PasswordBearer извлекает credential и описывает OpenAPI, но сам не проверяет JWT."
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
            badge={"username"}
            title={"Поле формы"}
            code={"student@example.com"}
          >
            Проверьте вход, результат и границу доверия этого элемента.
          </TypeCard>
          <TypeCard
            badge={"password"}
            badgeTone="float"
            title={"Credential"}
            code={"form-urlencoded"}
          >
            Проверьте вход, результат и границу доверия этого элемента.
          </TypeCard>
          <TypeCard
            badge={"token_type"}
            badgeTone="str"
            title={"Тип ответа"}
            code={"bearer"}
          >
            Проверьте вход, результат и границу доверия этого элемента.
          </TypeCard>
        </TypeCards>
        <MatchPairs
          prompt="Соедините термин и роль."
          pairs={[
            { left: "username", right: "Поле формы" },
            { left: "password", right: "Credential" },
            { left: "token_type", right: "Тип ответа" },
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
            "Создать token endpoint и security scheme без смешения HTTP, password service и JWT."
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
          code={`from typing import Annotated
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm

@router.post("/token", response_model=TokenResponse)
def issue_token(form_data: Annotated[OAuth2PasswordRequestForm, Depends()], db: DbSession, settings: AppSettings):
    user = authenticate_user(db, email=form_data.username, password=form_data.password)
    if user is None:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Incorrect username or password", headers={"WWW-Authenticate":"Bearer"})
    return TokenResponse(access_token=create_access_token(str(user.id), settings), token_type="bearer")`}
        />
        <StepThrough
          code={`from typing import Annotated
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm

@router.post("/token", response_model=TokenResponse)
def issue_token(form_data: Annotated[OAuth2PasswordRequestForm, Depends()], db: DbSession, settings: AppSettings):
    user = authenticate_user(db, email=form_data.username, password=form_data.password)
    if user is None:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Incorrect username or password", headers={"WWW-Authenticate":"Bearer"})
    return TokenResponse(access_token=create_access_token(str(user.id), settings), token_type="bearer")`}
          steps={[
            { line: 0, note: "Начинается контракт.", vars: { шаг: "1" } },
            {
              line: 2,
              note: "Выполняется основная проверка.",
              vars: { шаг: "2" },
            },
            {
              line: 5,
              note: "Формируется доверенный результат.",
              vars: { шаг: "3" },
            },
            {
              line: 8,
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
            "Создать token endpoint и security scheme без смешения HTTP, password service и JWT."
          }
          left={{
            title: "считать, что scheme проверяет JWT",
            code: 'OAuth2PasswordBearer(tokenUrl="/auth/token")',
            note: "Рискованная граница.",
          }}
          right={{
            title: "разделить роли",
            code: "scheme извлекает token, decode проверяет claims",
            note: "Явный безопасный контракт.",
          }}
          preferred="right"
          explanation={
            "HTTP security scheme и криптографическая проверка являются разными слоями."
          }
        />
        <TrueFalse
          statement={
            <>
              {
                "OAuth2PasswordBearer извлекает credential и описывает OpenAPI, но сам не проверяет JWT."
              }
            </>
          }
          isTrue={true}
          explanation={
            "OAuth2PasswordBearer извлекает credential и описывает OpenAPI, но сам не проверяет JWT."
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
            { id: "0", code: "принять OAuth2PasswordRequestForm" },
            { id: "1", code: "authenticate_user" },
            { id: "2", code: "create_access_token" },
            { id: "3", code: "вернуть TokenResponse" },
            { id: "4", code: "Authorize отправляет Bearer" },
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
          code={`@router.post("/auth/token")
def issue_token(credentials: LoginJson): ...`}
          question="Что нарушено?"
          options={[
            "Password flow ожидает form, а не JSON body.",
            "Ошибка в названии переменной.",
            "Нужно добавить print.",
          ]}
          correctIndex={0}
          explanation={"Password flow ожидает form, а не JSON body."}
          fix={`form_data: Annotated[OAuth2PasswordRequestForm, Depends()]`}
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
          code={`from typing import Annotated
from fastapi import Depends
from fastapi.security import OAuth2PasswordBearer
from pydantic import BaseModel

class TokenResponse(BaseModel):
    access_token: str
    token_type: str

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/token")
BearerToken = Annotated[str, Depends(oauth2_scheme)]`}
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
            "Создать token endpoint и security scheme без смешения HTTP, password service и JWT."
          }
          hint="Назовите источник доверия."
          answer={
            <p>
              {
                "Готовые authenticate_user и create_access_token соединяются на HTTP-границе."
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
            question={"Формат password form?"}
            options={["form-urlencoded", "JSON", "SQL"]}
            correctIndex={0}
            explanation={"Ответ следует из security-контракта урока."}
          />
          <QuizCard
            question={"Что делает OAuth2PasswordBearer?"}
            options={["извлекает token", "хеширует password", "создаёт User"]}
            correctIndex={0}
            explanation={"Ответ следует из security-контракта урока."}
          />
          <QuizCard
            question={"Успешный response?"}
            options={["access_token и token_type", "password_hash", "secret"]}
            correctIndex={0}
            explanation={"Ответ следует из security-контракта урока."}
          />
          <QuizCard
            question={"Это social OAuth?"}
            options={["нет", "да", "только Swagger"]}
            correctIndex={0}
            explanation={"Ответ следует из security-контракта урока."}
          />
        </div>
        <KeyTakeaways
          points={[
            <>{"Token endpoint принимает форму."}</>,
            <>{"username может содержать email."}</>,
            <>{"authenticate_user остаётся отдельным."}</>,
            <>{"Ответ содержит access_token."}</>,
            <>{"Scheme извлекает Bearer."}</>,
            <>{"422, 401 и 200 различаются."}</>,
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
            "Реализуйте /auth/token, Swagger Authorize и тесты form success, wrong password, JSON вместо form."
          }
        />
      </Section>
    </RichLesson>
  );
}

// 108. Current user из JWT
export function Lesson108({ module }: { module?: string }) {
  return (
    <RichLesson>
      <RichHero
        variant="project"
        chip={module ?? BLOCK_TITLE}
        title={"Current user из JWT"}
        intro={
          "Построим get_current_user: Bearer token → subject → User из базы → проверка активности → защищённый CRUD."
        }
        tags={[
          { icon: <Database size={14} />, label: "sub → User" },
          { icon: <ShieldCheck size={14} />, label: "get_current_user" },
        ]}
      />
      <TheoryBridge lesson={108} />
      <Section number="01" title="Зачем нужна тема">
        <Lead>
          {
            "Создать dependency CurrentUser и перестать доверять user_id из body."
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
              "Token уже извлекается и декодируется; теперь subject связывается с актуальной записью User."
            }
          </p>
        </div>
        <Callout tone="info">
          {"Валидный JWT не гарантирует, что User существует и активен сейчас."}
        </Callout>
      </Section>
      <Section number="02" title="Главная модель">
        <Lead>
          Три опорных понятия урока образуют один путь, но сохраняют разные
          ответственности.
        </Lead>
        <TypeCards>
          <TypeCard
            badge={"BearerToken"}
            title={"HTTP credential"}
            code={"Authorization → token"}
          >
            Проверьте вход, результат и границу доверия этого элемента.
          </TypeCard>
          <TypeCard
            badge={"subject"}
            badgeTone="float"
            title={"Проверенный claim"}
            code={"token → sub"}
          >
            Проверьте вход, результат и границу доверия этого элемента.
          </TypeCard>
          <TypeCard
            badge={"CurrentUser"}
            badgeTone="str"
            title={"ORM entity"}
            code={"sub → User"}
          >
            Проверьте вход, результат и границу доверия этого элемента.
          </TypeCard>
        </TypeCards>
        <MatchPairs
          prompt="Соедините термин и роль."
          pairs={[
            { left: "BearerToken", right: "HTTP credential" },
            { left: "subject", right: "Проверенный claim" },
            { left: "CurrentUser", right: "ORM entity" },
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
            "Создать dependency CurrentUser и перестать доверять user_id из body."
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
          code={`from typing import Annotated
from fastapi import Depends, HTTPException, status

def get_current_user(token: BearerToken, db: DbSession, settings: AppSettings) -> UserModel:
    try:
        user_id = int(decode_access_token(token, settings))
    except (InvalidAccessToken, ValueError):
        raise HTTPException(status_code=401, headers={"WWW-Authenticate":"Bearer"})
    user = db.get(UserModel, user_id)
    if user is None: raise HTTPException(status_code=401)
    if not user.is_active: raise HTTPException(status_code=403)
    return user

CurrentUser = Annotated[UserModel, Depends(get_current_user)]`}
        />
        <StepThrough
          code={`from typing import Annotated
from fastapi import Depends, HTTPException, status

def get_current_user(token: BearerToken, db: DbSession, settings: AppSettings) -> UserModel:
    try:
        user_id = int(decode_access_token(token, settings))
    except (InvalidAccessToken, ValueError):
        raise HTTPException(status_code=401, headers={"WWW-Authenticate":"Bearer"})
    user = db.get(UserModel, user_id)
    if user is None: raise HTTPException(status_code=401)
    if not user.is_active: raise HTTPException(status_code=403)
    return user

CurrentUser = Annotated[UserModel, Depends(get_current_user)]`}
          steps={[
            { line: 0, note: "Начинается контракт.", vars: { шаг: "1" } },
            {
              line: 3,
              note: "Выполняется основная проверка.",
              vars: { шаг: "2" },
            },
            {
              line: 7,
              note: "Формируется доверенный результат.",
              vars: { шаг: "3" },
            },
            {
              line: 12,
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
            "Создать dependency CurrentUser и перестать доверять user_id из body."
          }
          left={{
            title: "довериться body",
            code: "TaskModel(**payload.model_dump())",
            note: "Рискованная граница.",
          }}
          right={{
            title: "назначить owner сервером",
            code: "TaskModel(**payload.model_dump(), user_id=current_user.id)",
            note: "Явный безопасный контракт.",
          }}
          preferred="right"
          explanation={"Security-поле user_id выводится из CurrentUser."}
        />
        <TrueFalse
          statement={
            <>
              {
                "Валидный JWT не гарантирует, что User существует и активен сейчас."
              }
            </>
          }
          isTrue={true}
          explanation={
            "Валидный JWT не гарантирует, что User существует и активен сейчас."
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
            { id: "0", code: "получить BearerToken" },
            { id: "1", code: "decode access token" },
            { id: "2", code: "преобразовать sub" },
            { id: "3", code: "загрузить User" },
            { id: "4", code: "проверить is_active" },
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
          code={`user = db.get(UserModel, int(subject))
return user`}
          question="Что нарушено?"
          options={[
            "Не проверен случай user is None.",
            "Ошибка в названии переменной.",
            "Нужно добавить print.",
          ]}
          correctIndex={0}
          explanation={"Не проверен случай user is None."}
          fix={`if user is None:
    raise credentials_exception`}
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
          code={`@users_router.get("/me", response_model=UserRead)
def read_me(current_user: CurrentUser):
    return current_user

@tasks_router.get("", response_model=list[TaskRead])
def list_my_tasks(current_user: CurrentUser, db: DbSession):
    statement = select(TaskModel).where(TaskModel.user_id == current_user.id).order_by(TaskModel.id)
    return list(db.scalars(statement).all())`}
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
            "Создать dependency CurrentUser и перестать доверять user_id из body."
          }
          hint="Назовите источник доверия."
          answer={
            <p>
              {
                "Token уже извлекается и декодируется; теперь subject связывается с актуальной записью User."
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
            question={"Что возвращает get_current_user?"}
            options={["ORM User", "raw JWT", "password"]}
            correctIndex={0}
            explanation={"Ответ следует из security-контракта урока."}
          />
          <QuizCard
            question={"Откуда owner?"}
            options={["current_user.id", "payload.user_id", "query"]}
            correctIndex={0}
            explanation={"Ответ следует из security-контракта урока."}
          />
          <QuizCard
            question={"Плохой sub даёт?"}
            options={["401", "User 0", "200"]}
            correctIndex={0}
            explanation={"Ответ следует из security-контракта урока."}
          />
          <QuizCard
            question={"Зачем загрузка из БД?"}
            options={["актуальное состояние", "JWT без точек", "для CORS"]}
            correctIndex={0}
            explanation={"Ответ следует из security-контракта урока."}
          />
        </div>
        <KeyTakeaways
          points={[
            <>{"Scheme извлекает token."}</>,
            <>{"Decode возвращает subject."}</>,
            <>{"User загружается из базы."}</>,
            <>{"Отсутствующий User даёт 401."}</>,
            <>{"Inactive User может дать 403."}</>,
            <>{"Owner берётся из CurrentUser."}</>,
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
            "Реализуйте CurrentUser, /users/me и личные tasks; протестируйте missing, invalid, deleted и inactive user."
          }
        />
      </Section>
    </RichLesson>
  );
}

// 109. Refresh token, rotation и revocation
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
      <TheoryBridge lesson={109} />
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

// 110. Роли, разрешения, 401 и 403
export function Lesson110({ module }: { module?: string }) {
  return (
    <RichLesson>
      <RichHero
        variant="project"
        chip={module ?? BLOCK_TITLE}
        title={"Роли, разрешения, 401 и 403"}
        intro={
          "Завершим блок: role, permission, ownership, require_admin и точная граница 401/403."
        }
        tags={[
          { icon: <ShieldCheck size={14} />, label: "roles · permissions" },
          { icon: <LockKeyhole size={14} />, label: "401 · 403 · ownership" },
        ]}
      />
      <TheoryBridge lesson={110} />
      <Section number="01" title="Зачем нужна тема">
        <Lead>
          {
            "Реализовать admin dependency, ownership policy и матрицу security-тестов."
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
              "CurrentUser подтверждает личность; теперь API проверяет разрешение на конкретное действие."
            }
          </p>
        </div>
        <Callout tone="info">
          {
            "Валидный JWT не предоставляет автоматический доступ ко всем endpoint и чужим ресурсам."
          }
        </Callout>
      </Section>
      <Section number="02" title="Главная модель">
        <Lead>
          Три опорных понятия урока образуют один путь, но сохраняют разные
          ответственности.
        </Lead>
        <TypeCards>
          <TypeCard badge={"role"} title={"Группа"} code={"user / admin"}>
            Проверьте вход, результат и границу доверия этого элемента.
          </TypeCard>
          <TypeCard
            badge={"permission"}
            badgeTone="float"
            title={"Действие"}
            code={"users:read_all"}
          >
            Проверьте вход, результат и границу доверия этого элемента.
          </TypeCard>
          <TypeCard
            badge={"ownership"}
            badgeTone="str"
            title={"Связь"}
            code={"task.user_id == current_user.id"}
          >
            Проверьте вход, результат и границу доверия этого элемента.
          </TypeCard>
        </TypeCards>
        <MatchPairs
          prompt="Соедините термин и роль."
          pairs={[
            { left: "role", right: "Группа" },
            { left: "permission", right: "Действие" },
            { left: "ownership", right: "Связь" },
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
            "Реализовать admin dependency, ownership policy и матрицу security-тестов."
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
          code={`from typing import Annotated
from fastapi import Depends, HTTPException, status

def require_admin(current_user: CurrentUser) -> UserModel:
    if current_user.role != "admin":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Admin permission required")
    return current_user

AdminUser = Annotated[UserModel, Depends(require_admin)]

@admin_router.get("/users")
def list_all_users(admin: AdminUser, db: DbSession):
    return list(db.scalars(select(UserModel)).all())`}
        />
        <StepThrough
          code={`from typing import Annotated
from fastapi import Depends, HTTPException, status

def require_admin(current_user: CurrentUser) -> UserModel:
    if current_user.role != "admin":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Admin permission required")
    return current_user

AdminUser = Annotated[UserModel, Depends(require_admin)]

@admin_router.get("/users")
def list_all_users(admin: AdminUser, db: DbSession):
    return list(db.scalars(select(UserModel)).all())`}
          steps={[
            { line: 0, note: "Начинается контракт.", vars: { шаг: "1" } },
            {
              line: 3,
              note: "Выполняется основная проверка.",
              vars: { шаг: "2" },
            },
            {
              line: 6,
              note: "Формируется доверенный результат.",
              vars: { шаг: "3" },
            },
            {
              line: 11,
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
            "Реализовать admin dependency, ownership policy и матрицу security-тестов."
          }
          left={{
            title: "искать Task только по id",
            code: "db.get(TaskModel, task_id)",
            note: "Рискованная граница.",
          }}
          right={{
            title: "искать по id и owner",
            code: "where(TaskModel.id == task_id, TaskModel.user_id == current_user.id)",
            note: "Явный безопасный контракт.",
          }}
          preferred="right"
          explanation={"Ownership становится частью запроса и защищает CRUD."}
        />
        <TrueFalse
          statement={
            <>
              {
                "Валидный JWT не предоставляет автоматический доступ ко всем endpoint и чужим ресурсам."
              }
            </>
          }
          isTrue={true}
          explanation={
            "Валидный JWT не предоставляет автоматический доступ ко всем endpoint и чужим ресурсам."
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
            { id: "0", code: "получить CurrentUser или 401" },
            { id: "1", code: "проверить active" },
            { id: "2", code: "проверить permission" },
            { id: "3", code: "выполнить действие" },
            { id: "4", code: "commit" },
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
          code={`role = payload.get("role")
if role == "admin": return allow()`}
          question="Что нарушено?"
          options={[
            "Role в token может устареть; нужна актуальная роль User из базы.",
            "Ошибка в названии переменной.",
            "Нужно добавить print.",
          ]}
          correctIndex={0}
          explanation={
            "Role в token может устареть; нужна актуальная роль User из базы."
          }
          fix={`if current_user.role != "admin":
    raise HTTPException(status_code=403)`}
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
          code={`def get_owned_task(db: Session, *, task_id: int, current_user: UserModel):
    statement = select(TaskModel).where(TaskModel.id == task_id, TaskModel.user_id == current_user.id)
    task = db.scalar(statement)
    if task is None: raise HTTPException(status_code=404)
    return task

@admin_router.post("/users/{user_id}/deactivate")
def deactivate_user(user_id: int, admin: AdminUser, db: DbSession):
    user = get_user_or_404(db, user_id)
    user.is_active = False
    db.commit(); db.refresh(user)
    return user`}
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
            "Реализовать admin dependency, ownership policy и матрицу security-тестов."
          }
          hint="Назовите источник доверия."
          answer={
            <p>
              {
                "CurrentUser подтверждает личность; теперь API проверяет разрешение на конкретное действие."
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
            question={"Когда 401?"}
            options={["нет valid identity", "user не admin", "низкий priority"]}
            correctIndex={0}
            explanation={"Ответ следует из security-контракта урока."}
          />
          <QuizCard
            question={"Когда 403?"}
            options={[
              "identity есть, права нет",
              "JWT отсутствует",
              "form пустая",
            ]}
            correctIndex={0}
            explanation={"Ответ следует из security-контракта урока."}
          />
          <QuizCard
            question={"Что проверяет require_admin?"}
            options={["актуальную role", "secret клиента", "CORS"]}
            correctIndex={0}
            explanation={"Ответ следует из security-контракта урока."}
          />
          <QuizCard
            question={"Что защищает ownership?"}
            options={["конкретный ресурс", "password hash", "OpenAPI"]}
            correctIndex={0}
            explanation={"Ответ следует из security-контракта урока."}
          />
        </div>
        <KeyTakeaways
          points={[
            <>{"Authentication подтверждает identity."}</>,
            <>{"Authorization проверяет action."}</>,
            <>{"Role группирует permissions."}</>,
            <>{"Ownership относится к ресурсу."}</>,
            <>{"401 — нет valid identity."}</>,
            <>{"403 — права нет."}</>,
            <>{"Права читаются из базы."}</>,
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
            "Добавьте require_admin, admin endpoint, ownership helper и тесты anonymous/user/admin/two owners."
          }
        />
      </Section>
    </RichLesson>
  );
}
