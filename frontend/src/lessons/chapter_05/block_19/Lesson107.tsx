import { GitFork, KeyRound } from "lucide-react";
import { BranchExplorer, BugHunt, Callout, CodeBlock, CodeSequence, CompareSolutions, FillBlank, KeyTakeaways, Lead, MatchPairs, PracticeCta, QuizCard, RecallCard, RichHero, RichLesson, Section, StepThrough, TerminalDemo, TrueFalse, TypeCard, TypeCards } from "../../shared";
import { TheoryBridge } from "../../shared";
const BLOCK_TITLE = "Блок 19 · Bearer tokens, JWT и права";

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
      <TheoryBridge link={"Готовые authenticate_user и create_access_token соединяются на HTTP-границе."} boundary={"OAuth2PasswordBearer извлекает credential и описывает OpenAPI, но сам не проверяет JWT."} />
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
