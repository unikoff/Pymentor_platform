import { Braces, ShieldCheck } from "lucide-react";
import { BugHunt, Callout, CodeBlock, CodeSequence, CompareSolutions, FillBlank, FlipCards, KeyTakeaways, Lead, MatchPairs, MethodGrid, PracticeCta, QuizCard, RecallCard, RichHero, RichLesson, Section, TerminalDemo, TrueFalse, TypeCard, TypeCards } from "../../shared";
import { TheoryBridge } from "../../shared";
const BLOCK_TITLE = "Блок 17 · Пользователь и основы безопасности";

type LessonProps = { module?: string };

export function Lesson95({ module }: LessonProps) {
  return (
    <RichLesson>
      <RichHero
        variant="project"
        chip={module ?? BLOCK_TITLE}
        title={"Модель User и схемы"}
        intro={"Добавим в StudyHub серверную модель пользователя, отделим данные регистрации от безопасного ответа и свяжем задачи с владельцем. Учимся проектировать поля до регистрации и не отдавать password_hash клиенту."}
        tags={[
          { 
            icon: <Braces size={14} />,
            label: "ORM-модель и Pydantic",
          },
          { 
            icon: <ShieldCheck size={14} />,
            label: "безопасная граница ответа",
          }
        ]}
      />
      <TheoryBridge link={"Перед регистрацией системе нужна устойчивая модель User, безопасные схемы входа/ответа и связь задач с владельцем."} boundary={"ORM-модель не должна автоматически становиться публичным JSON: password_hash остаётся внутренним полем."} />

      <Section
        number="01"
        title={"Пользователь становится частью домена"}
      >
        <Lead>
          {"Database API уже хранит задачи и категории. Чтобы перейти к персональному приложению, каждой задаче нужен владелец, а серверу — устойчивая запись пользователя."}
        </Lead>

        <div className="lesson-route">
          <ol>
            <li>
              <strong>Описать User:</strong> зафиксировать идентификатор, публичные поля, хеш пароля, активность и роль.
            </li>
            <li>
              <strong>Разделить схемы:</strong> принимать пароль в UserCreate, но никогда не включать его или хеш в UserRead.
            </li>
            <li>
              <strong>Связать задачи:</strong> добавить owner_id как внешний ключ на users.id.
            </li>
            <li>
              <strong>Изменить схему базы:</strong> создать миграцию и осознанно обработать существующие записи.
            </li>
          </ol>
        <p>После занятия модель готова к безопасной регистрации, но пароль ещё не хешируется — это следующий урок.</p>
        </div>

        <TypeCards>
          <TypeCard
            badge={"ORM"}
            title={"UserModel"}
            code={"email, password_hash, role"}
          >
            {"Описывает таблицу users и серверное состояние."}
          </TypeCard>

          <TypeCard
            badge={"input"}
            badgeTone="float"
            title={"UserCreate"}
            code={"password: str"}
          >
            {"Контракт регистрации: email, username и сырой password только на входе."}
          </TypeCard>

          <TypeCard
            badge={"output"}
            badgeTone="str"
            title={"UserRead"}
            code={"id, email, username, is_active, role"}
          >
            {"Безопасное публичное представление пользователя."}
          </TypeCard>
        </TypeCards>

        <Callout tone="info">
          {"ORM-модель, request schema и response schema решают разные задачи. Одинаковая сущность не означает одинаковый набор полей на каждой границе."}
        </Callout>
      </Section>

      <Section
        number="02"
        title={"Поля User и их обязанности"}
      >
        <Lead>
          {"Поле добавляют не потому, что оно часто встречается в других проектах, а потому что оно участвует в конкретном контракте StudyHub."}
        </Lead>

        <div className="lesson-practice-steps">
          <h3>{"Главный вопрос сцены"}</h3>
          <p>
            {"Раздел «Поля User и их обязанности» показывает, как правило влияет на UserModel, UserCreate, UserRead и связь Task.owner_id."}
          </p>

          <h3>{"Что нужно уметь объяснить"}</h3>
          <p>
            {"Назовите входные данные, выполняемую проверку, успешный результат и ожидаемый отказ до перехода к следующей сцене."}
          </p>

          <h3>{"Граница сложности"}</h3>
          <p>
            {"Не делайте ORM-модель публичным контрактом и не добавляйте password_hash в response schema."}
          </p>
        </div>

        <MethodGrid
          rows={[
            [<>{"id"}</>, <>{"внутренний первичный ключ и цель внешних ключей"}</>],
            [<>{"email"}</>, <>{"уникальный адрес для входа и связи"}</>],
            [<>{"username"}</>, <>{"публичное имя пользователя"}</>],
            [<>{"password_hash"}</>, <>{"результат безопасного хеширования, не ответ API"}</>],
            [<>{"is_active"}</>, <>{"серверный флаг разрешённого использования аккаунта"}</>],
            [<>{"role"}</>, <>{"минимальная роль user/admin для будущей авторизации"}</>]
          ]}
        />

        <MatchPairs
          prompt={"Соедините поле с тем, кто имеет право его задавать."}
          pairs={[
            { left: "password", right: "клиент передаёт только при регистрации или смене" },
            { left: "password_hash", right: "сервер вычисляет и хранит" },
            { left: "role", right: "сервер назначает по безопасному правилу" },
            { left: "is_active", right: "сервер управляет состоянием аккаунта" }
          ]}
          explanation={"Клиент не должен назначать себе роль, активность или готовый хеш."}
        />

        <TrueFalse
          statement={
            <>
              {"Поле role можно принять из UserCreate, потому что Pydantic уже проверит строку."}
            </>
          }
          isTrue={false}
          explanation={"Валидная строка всё равно может дать пользователю недопустимые полномочия."}
        />
      </Section>

      <Section
        number="03"
        title={"SQLAlchemy-модель users"}
      >
        <Lead>
          {"ORM-модель описывает таблицу и ограничения базы. Уникальность email должна существовать в базе, а не только в предварительной Python-проверке."}
        </Lead>

        <div className="lesson-practice-steps">
          <h3>{"Главный вопрос сцены"}</h3>
          <p>
            {"Раздел «SQLAlchemy-модель users» показывает, как правило влияет на UserModel, UserCreate, UserRead и связь Task.owner_id."}
          </p>

          <h3>{"Что нужно уметь объяснить"}</h3>
          <p>
            {"Назовите входные данные, выполняемую проверку, успешный результат и ожидаемый отказ до перехода к следующей сцене."}
          </p>

          <h3>{"Граница сложности"}</h3>
          <p>
            {"Не делайте ORM-модель публичным контрактом и не добавляйте password_hash в response schema."}
          </p>
        </div>

        <CodeBlock
          caption={"app/models/user.py"}
          code={"from sqlalchemy import Boolean, String\nfrom sqlalchemy.orm import Mapped, mapped_column, relationship\n\nfrom app.database import Base\n\n\nclass UserModel(Base):\n    __tablename__ = \"users\"\n\n    id: Mapped[int] = mapped_column(primary_key=True)\n    email: Mapped[str] = mapped_column(\n        String(320), unique=True, index=True, nullable=False\n    )\n    username: Mapped[str] = mapped_column(String(50), nullable=False)\n    password_hash: Mapped[str] = mapped_column(String(255), nullable=False)\n    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)\n    role: Mapped[str] = mapped_column(String(20), default=\"user\", nullable=False)\n\n    tasks: Mapped[list[\"TaskModel\"]] = relationship(back_populates=\"owner\")"}
        />

        <TypeCards>
          <TypeCard
            badge={"unique"}
            title={"Гарантия базы"}
            code={"unique=True"}
          >
            {"Две строки не могут сохранить один email даже при конкурентных запросах."}
          </TypeCard>

          <TypeCard
            badge={"index"}
            badgeTone="float"
            title={"Поиск входа"}
            code={"WHERE users.email = ?"}
          >
            {"Индекс помогает находить пользователя по email."}
          </TypeCard>

          <TypeCard
            badge={"nullable"}
            badgeTone="str"
            title={"Обязательность"}
            code={"nullable=False"}
          >
            {"Сервер не может сохранить пользователя без ключевых данных."}
          </TypeCard>
        </TypeCards>

        <RecallCard
          question={"Почему Python-проверка email не заменяет unique constraint?"}
          answer={
            <p>
              {"Между проверкой и commit другой запрос может сохранить тот же email. Только база является окончательной границей уникальности."}
            </p>
          }
        />
      </Section>

      <Section
        number="04"
        title={"Request и response schemas"}
      >
        <Lead>
          {"Pydantic-схемы проектируются по направлению данных. Пароль нужен сервису регистрации, а password_hash нужен только внутреннему слою и базе."}
        </Lead>

        <div className="lesson-practice-steps">
          <h3>{"Главный вопрос сцены"}</h3>
          <p>
            {"Раздел «Request и response schemas» показывает, как правило влияет на UserModel, UserCreate, UserRead и связь Task.owner_id."}
          </p>

          <h3>{"Что нужно уметь объяснить"}</h3>
          <p>
            {"Назовите входные данные, выполняемую проверку, успешный результат и ожидаемый отказ до перехода к следующей сцене."}
          </p>

          <h3>{"Граница сложности"}</h3>
          <p>
            {"Не делайте ORM-модель публичным контрактом и не добавляйте password_hash в response schema."}
          </p>
        </div>

        <CodeBlock
          caption={"app/schemas/user.py"}
          code={"from pydantic import BaseModel, ConfigDict, EmailStr, Field\n\n\nclass UserCreate(BaseModel):\n    email: EmailStr\n    username: str = Field(min_length=2, max_length=50)\n    password: str = Field(min_length=8, max_length=128)\n\n\nclass UserRead(BaseModel):\n    model_config = ConfigDict(from_attributes=True)\n\n    id: int\n    email: EmailStr\n    username: str\n    is_active: bool\n    role: str"}
        />

        <CompareSolutions
          question={"Какой response_model безопасен для регистрации?"}
          left={{
            title: "UserModel как есть",
            code: "return db_user.__dict__",
            note: "Внутренние поля и password_hash могут попасть в ответ.",
          }}
          right={{
            title: "Явный UserRead",
            code: "@router.post(..., response_model=UserRead)",
            note: "Ответ ограничен заранее названными публичными полями.",
          }}
          preferred="right"
          explanation={"Безопасность ответа строится через allowlist полей, а не через надежду удалить секрет позже."}
        />

        <FillBlank
          prompt={"Выберите поле, которое не должно находиться в UserRead."}
          before={"class UserRead(BaseModel):\n    id: int\n    email: EmailStr\n    "}
          after={": str"}
          options={["password_hash", "username", "role"]}
          answer={"password_hash"}
          explanation={"Хеш остаётся внутренним credential verifier и не нужен клиенту."}
        />
      </Section>

      <Section
        number="05"
        title={"User владеет задачами"}
      >
        <Lead>
          {"Связь one-to-many означает: один пользователь может иметь много задач, каждая задача принадлежит одному пользователю."}
        </Lead>

        <div className="lesson-practice-steps">
          <h3>{"Главный вопрос сцены"}</h3>
          <p>
            {"Раздел «User владеет задачами» показывает, как правило влияет на UserModel, UserCreate, UserRead и связь Task.owner_id."}
          </p>

          <h3>{"Что нужно уметь объяснить"}</h3>
          <p>
            {"Назовите входные данные, выполняемую проверку, успешный результат и ожидаемый отказ до перехода к следующей сцене."}
          </p>

          <h3>{"Граница сложности"}</h3>
          <p>
            {"Не делайте ORM-модель публичным контрактом и не добавляйте password_hash в response schema."}
          </p>
        </div>

        <CodeBlock
          caption={"дополнение TaskModel"}
          code={"from sqlalchemy import ForeignKey\nfrom sqlalchemy.orm import Mapped, mapped_column, relationship\n\n\nclass TaskModel(Base):\n    __tablename__ = \"tasks\"\n\n    id: Mapped[int] = mapped_column(primary_key=True)\n    title: Mapped[str]\n    owner_id: Mapped[int] = mapped_column(\n        ForeignKey(\"users.id\"), nullable=False, index=True\n    )\n\n    owner: Mapped[\"UserModel\"] = relationship(back_populates=\"tasks\")"}
        />

        <TypeCards>
          <TypeCard
            badge={"FK"}
            title={"owner_id"}
            code={"ForeignKey(\"users.id\")"}
          >
            {"Реальная колонка и ограничение ссылки на users.id."}
          </TypeCard>

          <TypeCard
            badge={"ORM"}
            badgeTone="float"
            title={"task.owner"}
            code={"relationship(...)"}
          >
            {"Навигация от задачи к объекту пользователя."}
          </TypeCard>

          <TypeCard
            badge={"collection"}
            badgeTone="str"
            title={"user.tasks"}
            code={"Mapped[list[TaskModel]]"}
          >
            {"Навигация от пользователя к его задачам."}
          </TypeCard>
        </TypeCards>

        <TrueFalse
          statement={
            <>
              {"relationship создаёт внешний ключ owner_id автоматически, даже если mapped_column отсутствует."}
            </>
          }
          isTrue={false}
          explanation={"Внешний ключ задаётся колонкой. relationship добавляет ORM-навигацию поверх схемы."}
        />
      </Section>

      <Section
        number="06"
        title={"Миграция без потери существующих данных"}
      >
        <Lead>
          {"Если таблица tasks уже содержит строки, сразу добавить обязательный owner_id обычно нельзя: старым записям нечего записать в новую колонку."}
        </Lead>

        <div className="lesson-practice-steps">
          <h3>{"Главный вопрос сцены"}</h3>
          <p>
            {"Раздел «Миграция без потери существующих данных» показывает, как правило влияет на UserModel, UserCreate, UserRead и связь Task.owner_id."}
          </p>

          <h3>{"Что нужно уметь объяснить"}</h3>
          <p>
            {"Назовите входные данные, выполняемую проверку, успешный результат и ожидаемый отказ до перехода к следующей сцене."}
          </p>

          <h3>{"Граница сложности"}</h3>
          <p>
            {"Не делайте ORM-модель публичным контрактом и не добавляйте password_hash в response schema."}
          </p>
        </div>

        <CodeSequence
          title={"Соберите безопасный план миграции"}
          prompt={"Расположите этапы для базы с существующими задачами."}
          pieces={[
            { id: "users", code: "создать таблицу users" },
            { id: "nullable", code: "добавить owner_id nullable=True" },
            { id: "system", code: "создать технического/первого пользователя" },
            { id: "backfill", code: "заполнить owner_id старых задач" },
            { id: "constraint", code: "сделать owner_id nullable=False" },
            { id: "wrong", code: "сразу nullable=False без default", note: "старые строки нарушат ограничение" }
          ]}
          correctOrder={["users", "nullable", "system", "backfill", "constraint"]}
          explanation={"Схема и данные изменяются последовательными проверяемыми шагами."}
        />

        <TerminalDemo
          title={"Alembic workflow"}
          lines={[
            { cmd: "alembic revision --autogenerate -m \"add users and task owner\"" },
            { out: "Generating ..._add_users_and_task_owner.py" },
            { cmd: "проверить upgrade() и downgrade() вручную" },
            { cmd: "alembic upgrade head" },
            { out: "Running upgrade ..." }
          ]}
        />

        <Callout>
          {"Autogenerate предлагает изменения схемы, но не знает бизнес-правило заполнения старых owner_id. Data migration нужно спроектировать вручную."}
        </Callout>
      </Section>

      <Section
        number="07"
        title={"Безопасная сериализация и границы модели"}
      >
        <Lead>
          {"Хеш не является открытым паролем, но остаётся чувствительным материалом. Его утечка даёт атакующему возможность подбирать пароль вне сервера."}
        </Lead>

        <div className="lesson-practice-steps">
          <h3>{"Главный вопрос сцены"}</h3>
          <p>
            {"Раздел «Безопасная сериализация и границы модели» показывает, как правило влияет на UserModel, UserCreate, UserRead и связь Task.owner_id."}
          </p>

          <h3>{"Что нужно уметь объяснить"}</h3>
          <p>
            {"Назовите входные данные, выполняемую проверку, успешный результат и ожидаемый отказ до перехода к следующей сцене."}
          </p>

          <h3>{"Граница сложности"}</h3>
          <p>
            {"Не делайте ORM-модель публичным контрактом и не добавляйте password_hash в response schema."}
          </p>
        </div>

        <BugHunt
          code={"@router.get(\"/users/{user_id}\")\ndef get_user(user_id: int, db: Session):\n    user = db.get(UserModel, user_id)\n    return user.__dict__"}
          question={"Почему возврат __dict__ опасен?"}
          options={["В ответ могут попасть внутренние поля и password_hash", "Pydantic запрещает словари", "id станет строкой"]}
          correctIndex={0}
          explanation={"Внутренняя модель шире публичного контракта."}
          fix={"@router.get(\"/users/{user_id}\", response_model=UserRead)\ndef get_user(user_id: int, db: Session):\n    return get_user_or_404(db, user_id)"}
        />

        <FlipCards
          cards={[
            { front: <>{"password"}</>, back: <>{"Кратковременно существует на входной границе и передаётся в hash_password."}</> },
            { front: <>{"password_hash"}</>, back: <>{"Хранится в users, используется verify_password, не сериализуется наружу."}</> },
            { front: <>{"role"}</>, back: <>{"Хранится сервером; клиент может читать только при необходимости, но не назначает."}</> },
            { front: <>{"email"}</>, back: <>{"Публичность зависит от продукта; в текущем API входит в собственный профиль."}</> }
          ]}
        />

        <Callout tone="info">
          {"Response schema является техническим контрактом и частью защиты от случайной утечки новых внутренних колонок."}
        </Callout>
      </Section>

      <Section
        number="08"
        title={"Контрольная точка: модель до регистрации"}
      >
        <Lead>
          {"Перед реализацией endpoint проверьте, что слой данных уже не допускает очевидных утечек и двусмысленных владельцев."}
        </Lead>

        <MethodGrid
          rows={[
            [<>{"UserModel"}</>, <>{"users, unique email, password_hash, active, role"}</>],
            [<>{"UserCreate"}</>, <>{"email, username, password"}</>],
            [<>{"UserRead"}</>, <>{"только разрешённые публичные поля"}</>],
            [<>{"TaskModel.owner_id"}</>, <>{"обязательная серверная связь с владельцем"}</>],
            [<>{"Alembic"}</>, <>{"история схемы и план для существующих строк"}</>]
          ]}
        />

        <div className="lesson-check-group">
          <QuizCard
            question={"Где должен находиться сырой password?"}
            options={["только во входной схеме и кратком процессе обработки", "в UserRead", "в таблице tasks"]}
            correctIndex={0}
            explanation={"Пароль нужен для хеширования или проверки и не сохраняется открытым."}
          />
          <QuizCard
            question={"Что окончательно гарантирует уникальность email?"}
            options={["unique constraint базы", "один if перед commit", "длина строки"]}
            correctIndex={0}
            explanation={"База защищает ограничение и при конкурирующих запросах."}
          />
          <QuizCard
            question={"Что создаёт внешний ключ?"}
            options={["mapped_column(ForeignKey(...))", "response_model", "relationship без колонки"]}
            correctIndex={0}
            explanation={"relationship даёт навигацию, а FK является частью схемы таблицы."}
          />
          <QuizCard
            question={"Почему UserRead не содержит password_hash?"}
            options={["он не нужен клиенту и чувствителен", "Pydantic не поддерживает строки", "хеш всегда пустой"]}
            correctIndex={0}
            explanation={"Публичный контракт строится из минимально необходимых полей."}
          />
        </div>

        <KeyTakeaways
          points={[
            <>{"UserModel хранит серверное состояние пользователя."}</>,
            <>{"UserCreate и UserRead имеют разные направления и наборы полей."}</>,
            <>{"Сырой password не сохраняется, password_hash не возвращается."}</>,
            <>{"Unique constraint является окончательной гарантией уникальности email."}</>,
            <>{"owner_id связывает задачу с владельцем на уровне базы."}</>,
            <>{"Изменение схемы существующей базы требует плана для старых данных."}</>
          ]}
        />

        <PracticeCta text={"Создайте UserModel, UserCreate, UserRead и миграцию users. Добавьте TaskModel.owner_id, опишите план backfill для существующих задач и проверьте, что OpenAPI-ответ пользователя не содержит password и password_hash."} />
      </Section>
    </RichLesson>
  );
}
