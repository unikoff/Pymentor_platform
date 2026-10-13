import { KeyRound, Layers } from "lucide-react";
import { BranchExplorer, BugHunt, Callout, CodeBlock, CodeSequence, CompareSolutions, FillBlank, KeyTakeaways, Lead, MatchPairs, PracticeCta, QuizCard, RecallCard, RichHero, RichLesson, Section, StepThrough, TerminalDemo, TrueFalse, TypeCard, TypeCards } from "../../shared";
import { TheoryBridge } from "../../shared";
const BLOCK_TITLE = "Блок 19 · Bearer tokens, JWT и права";

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
      <TheoryBridge link={"После cookie-session клиент начинает явно предъявлять credential в каждом защищённом запросе."} boundary={"JWT подписан, но payload не зашифрован: пароли и secrets в него не помещают."} />
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
