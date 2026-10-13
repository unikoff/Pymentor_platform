import { LockKeyhole, ShieldCheck } from "lucide-react";
import { BranchExplorer, BugHunt, Callout, CodeBlock, CodeSequence, CompareSolutions, FillBlank, KeyTakeaways, Lead, MatchPairs, PracticeCta, QuizCard, RecallCard, RichHero, RichLesson, Section, StepThrough, TerminalDemo, TrueFalse, TypeCard, TypeCards } from "../../shared";
import { TheoryBridge } from "../../shared";
const BLOCK_TITLE = "Блок 19 · Bearer tokens, JWT и права";

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
      <TheoryBridge link={"CurrentUser подтверждает личность; теперь API проверяет разрешение на конкретное действие."} boundary={"Валидный JWT не предоставляет автоматический доступ ко всем endpoint и чужим ресурсам."} />
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
