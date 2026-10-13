import { Database, ShieldCheck } from "lucide-react";
import { BranchExplorer, BugHunt, Callout, CodeBlock, CodeSequence, CompareSolutions, FillBlank, KeyTakeaways, Lead, MatchPairs, PracticeCta, QuizCard, RecallCard, RichHero, RichLesson, Section, StepThrough, TerminalDemo, TrueFalse, TypeCard, TypeCards } from "../../shared";
import { TheoryBridge } from "../../shared";
const BLOCK_TITLE = "Блок 19 · Bearer tokens, JWT и права";

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
      <TheoryBridge link={"Token уже извлекается и декодируется; теперь subject связывается с актуальной записью User."} boundary={"Валидный JWT не гарантирует, что User существует и активен сейчас."} />
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
