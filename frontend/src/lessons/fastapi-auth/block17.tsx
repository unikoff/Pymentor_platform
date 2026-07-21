import {
  Braces,
  FileText,
  KeyRound,
  Layers,
  ListChecks,
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
  FlipCards,
  KeyTakeaways,
  Lead,
  MatchPairs,
  MethodGrid,
  PracticeCta,
  PredictOutput,
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

type LessonProps = { module?: string };
type TheoryBridgeData = { link: string; boundary: string };

const BLOCK_TITLE = "Блок 17 · Пользователь и основы безопасности";

const THEORY_BRIDGES: Record<number, TheoryBridgeData> = {
  93: {
    link: "После Database API данные уже сохраняются надёжно, но все клиенты пока равны. Теперь запрос получает подтверждённого пользователя, а ресурс — владельца.",
    boundary: "Аутентификация подтверждает личность, но не разрешает автоматически читать и изменять любые записи.",
  },
  94: {
    link: "Три уровня безопасности определены, поэтому можно сравнить способы доставки и проверки credentials по одним критериям.",
    boundary: "Cookie, Bearer и JWT не являются синонимами: транспорт, формат значения и серверное состояние проектируются отдельно.",
  },
  95: {
    link: "Перед регистрацией системе нужна устойчивая модель User, безопасные схемы входа/ответа и связь задач с владельцем.",
    boundary: "ORM-модель не должна автоматически становиться публичным JSON: password_hash остаётся внутренним полем.",
  },
  96: {
    link: "Модель User уже имеет password_hash, теперь открытый password нужно безопасно преобразовать и проверять через готовую библиотеку.",
    boundary: "Новый salted hash нельзя сравнивать строкой с сохранённым; используется verify_password.",
  },
  97: {
    link: "Модель и password service готовы, поэтому регистрация собирает валидацию, уникальность, хеширование, транзакцию и безопасный ответ.",
    boundary: "Предварительный SELECT улучшает сообщение, но окончательную уникальность гарантирует constraint базы и rollback после IntegrityError.",
  },
  98: {
    link: "После регистрации можно проверить новый набор credentials: найти User, проверить hash и состояние аккаунта.",
    boundary: "authenticate_user ещё не создаёт cookie или JWT; выдача продолжительного доступа начинается в следующем блоке.",
  }
};

function TheoryBridge({ lesson }: { lesson: number }) {
  const bridge = THEORY_BRIDGES[lesson];

  if (!bridge) {
    return null;
  }

  return (
    <Callout tone="info">
      <strong>Связь с курсом.</strong> {bridge.link}{" "}
      <strong>Важно не перепутать:</strong> {bridge.boundary}
    </Callout>
  );
}


// 93. Идентификация, аутентификация и авторизация
export function Lesson93({ module }: LessonProps) {
  return (
    <RichLesson>
      <RichHero
        variant="project"
        chip={module ?? BLOCK_TITLE}
        title={"Идентификация, аутентификация и авторизация"}
        intro={"Разделим три вопроса безопасности: кого называет запрос, как система подтверждает личность и какие действия разрешены этому пользователю. На примерах StudyHub научимся отличать 401 от 403 и проверять владельца задачи."}
        tags={[
          { 
            icon: <KeyRound size={14} />,
            label: "кто → подтверждение → права",
          },
          { 
            icon: <ShieldCheck size={14} />,
            label: "401 · 403 · владелец",
          }
        ]}
      />
      <TheoryBridge lesson={93} />

      <Section
        number="01"
        title={"Один запрос — три разных вопроса"}
      >
        <Lead>
          {"До этого Database API работал с задачами без понятия пользователя. Теперь одна и та же команда должна давать разный результат в зависимости от того, кто отправил запрос и принадлежит ли ему ресурс."}
        </Lead>

        <div className="lesson-route">
          <ol>
            <li>
              <strong>Идентифицировать:</strong> получить заявленную личность, например email, username или идентификатор сессии.
            </li>
            <li>
              <strong>Аутентифицировать:</strong> проверить доказательство: пароль, session id, API key или токен.
            </li>
            <li>
              <strong>Авторизовать:</strong> сопоставить подтверждённого пользователя с правилом доступа к конкретному действию.
            </li>
          </ol>
        <p>Результат урока — функция проверки владельца и ясная карта ответов 401/403.</p>
        </div>

        <TypeCards>
          <TypeCard
            badge={"до блока"}
            title={"Общий API"}
            code={"GET /tasks"}
          >
            {"Любой клиент видит одну коллекцию задач. У запроса нет подтверждённого владельца."}
          </TypeCard>

          <TypeCard
            badge={"после"}
            badgeTone="float"
            title={"Персональный контекст"}
            code={"task.owner_id == current_user.id"}
          >
            {"Система знает current user и проверяет связь задачи с ним."}
          </TypeCard>

          <TypeCard
            badge={"граница"}
            badgeTone="str"
            title={"Без токенов пока"}
            code={"authenticate → authorize"}
          >
            {"В этом блоке строится модель безопасности. Cookie-сессии и JWT появятся позднее."}
          </TypeCard>
        </TypeCards>

        <Callout tone="info">
          {"Аутентификация не выдаёт права автоматически: подтверждённый пользователь всё ещё может не иметь доступа к чужой задаче."}
        </Callout>
      </Section>

      <Section
        number="02"
        title={"Три термина без смешивания"}
      >
        <Lead>
          {"Термины похожи, потому что идут подряд в одном запросе. Разделение полезно: при ошибке разработчик понимает, какой именно контракт нарушен."}
        </Lead>

        <div className="lesson-practice-steps">
          <h3>{"Главный вопрос сцены"}</h3>
          <p>
            {"Раздел «Три термина без смешивания» показывает, как правило влияет на current_user, role, owner_id и HTTP-статус."}
          </p>

          <h3>{"Что нужно уметь объяснить"}</h3>
          <p>
            {"Назовите входные данные, выполняемую проверку, успешный результат и ожидаемый отказ до перехода к следующей сцене."}
          </p>

          <h3>{"Граница сложности"}</h3>
          <p>
            {"Не подменяйте авторизацию фактом успешного входа: право проверяется для конкретного действия и ресурса."}
          </p>
        </div>

        <MatchPairs
          prompt={"Соедините вопрос системы с термином."} leftTitle={"Вопрос"} rightTitle={"Термин"}
          pairs={[
            { left: "Кого называет запрос?", right: "идентификация" },
            { left: "Доказана ли эта личность?", right: "аутентификация" },
            { left: "Разрешено ли действие?", right: "авторизация" }
          ]}
          explanation={"Это последовательные, но самостоятельные проверки."}
        />

        <CodeBlock
          caption={"упрощённый маршрут запроса"}
          code={"identity = read_identity(request)\nuser = authenticate(identity, proof)\nauthorize(user, action, resource)\nresult = perform_action()"}
        />

        <TrueFalse
          statement={
            <>
              {"Если клиент прислал email существующего пользователя, он уже аутентифицирован."}
            </>
          }
          isTrue={false}
          explanation={"Email только заявляет личность. Нужна проверка секрета или другого доказательства."}
        />
      </Section>

      <Section
        number="03"
        title={"Пользователь, роль и владелец ресурса"}
      >
        <Lead>
          {"Права можно получить по разным причинам. Обычный пользователь управляет своими задачами, администратор может выполнять отдельные служебные операции, а неактивный пользователь не должен продолжать работу."}
        </Lead>

        <div className="lesson-practice-steps">
          <h3>{"Главный вопрос сцены"}</h3>
          <p>
            {"Раздел «Пользователь, роль и владелец ресурса» показывает, как правило влияет на current_user, role, owner_id и HTTP-статус."}
          </p>

          <h3>{"Что нужно уметь объяснить"}</h3>
          <p>
            {"Назовите входные данные, выполняемую проверку, успешный результат и ожидаемый отказ до перехода к следующей сцене."}
          </p>

          <h3>{"Граница сложности"}</h3>
          <p>
            {"Не подменяйте авторизацию фактом успешного входа: право проверяется для конкретного действия и ресурса."}
          </p>
        </div>

        <MethodGrid
          rows={[
            [<>{"current_user"}</>, <>{"подтверждённый пользователь текущего запроса"}</>],
            [<>{"role"}</>, <>{"общая категория полномочий: user или admin"}</>],
            [<>{"owner_id"}</>, <>{"ссылка ресурса на конкретного владельца"}</>],
            [<>{"is_active"}</>, <>{"может ли учётная запись использовать приложение"}</>]
          ]}
        />

        <BranchExplorer
          code={"if current_user is None:\n    return 401\nif not current_user.is_active:\n    return 403\nif task.owner_id == current_user.id:\n    return 200\nif current_user.role == \"admin\":\n    return 200\nreturn 403"}
          scenarios={[
            { label: "нет пользователя", activeLine: 1, output: "401: личность не подтверждена" },
            { label: "своя задача", activeLine: 5, output: "200: владелец совпал" },
            { label: "чужая задача", activeLine: 8, output: "403: пользователь известен, права нет" }
          ]}
        />

        <RecallCard
          question={"Почему owner_id и role не являются одним и тем же?"}
          hint={"Один признак относится к конкретному ресурсу, второй — к учётной записи."}
          answer={
            <p>
              {"owner_id отвечает, кому принадлежит конкретная запись. role описывает общие полномочия пользователя и не делает его владельцем всех данных."}
            </p>
          }
        />
      </Section>

      <Section
        number="04"
        title={"401 и 403 сообщают о разных проблемах"}
      >
        <Lead>
          {"HTTP-статус является частью контракта API. Клиент по нему решает: запросить вход заново или показать сообщение о недостатке прав."}
        </Lead>

        <div className="lesson-practice-steps">
          <h3>{"Главный вопрос сцены"}</h3>
          <p>
            {"Раздел «401 и 403 сообщают о разных проблемах» показывает, как правило влияет на current_user, role, owner_id и HTTP-статус."}
          </p>

          <h3>{"Что нужно уметь объяснить"}</h3>
          <p>
            {"Назовите входные данные, выполняемую проверку, успешный результат и ожидаемый отказ до перехода к следующей сцене."}
          </p>

          <h3>{"Граница сложности"}</h3>
          <p>
            {"Не подменяйте авторизацию фактом успешного входа: право проверяется для конкретного действия и ресурса."}
          </p>
        </div>

        <CompareSolutions
          question={"Какой статус выбрать для подтверждённого пользователя, который открывает чужую задачу?"}
          left={{
            title: "401 Unauthorized",
            code: "raise HTTPException(status_code=401)",
            note: "Подходит, когда сервер не получил действительное подтверждение личности.",
          }}
          right={{
            title: "403 Forbidden",
            code: "raise HTTPException(status_code=403)",
            note: "Подходит, когда пользователь известен, но действие ему запрещено.",
          }}
          preferred="right"
          explanation={"Пользователь уже аутентифицирован, поэтому проблема находится на уровне авторизации."}
        />

        <TypeCards>
          <TypeCard
            badge={"401"}
            title={"Нужно подтвердить личность"}
            code={"WWW-Authenticate: Bearer"}
          >
            {"Нет credentials, они неверны или срок доказательства истёк."}
          </TypeCard>

          <TypeCard
            badge={"403"}
            badgeTone="float"
            title={"Личность известна"}
            code={"detail=\"Forbidden\""}
          >
            {"Правило роли, владельца или состояния аккаунта запрещает действие."}
          </TypeCard>

          <TypeCard
            badge={"404"}
            badgeTone="str"
            title={"Ресурс не найден"}
            code={"detail=\"Task not found\""}
          >
            {"Иногда API скрывает существование чужого ресурса через 404, но это должно быть единым осознанным правилом."}
          </TypeCard>
        </TypeCards>

        <Callout>
          {"Название 401 исторически сбивает с толку: на практике его читают как «не аутентифицирован», а 403 — «аутентифицирован, но запрещено»."}
        </Callout>
      </Section>

      <Section
        number="05"
        title={"Путь защищённого запроса"}
      >
        <Lead>
          {"Разберём последовательность до предметной логики. Чем раньше отклоняется недействительный запрос, тем меньше кода получает сомнительные данные."}
        </Lead>

        <div className="lesson-practice-steps">
          <h3>{"Главный вопрос сцены"}</h3>
          <p>
            {"Раздел «Путь защищённого запроса» показывает, как правило влияет на current_user, role, owner_id и HTTP-статус."}
          </p>

          <h3>{"Что нужно уметь объяснить"}</h3>
          <p>
            {"Назовите входные данные, выполняемую проверку, успешный результат и ожидаемый отказ до перехода к следующей сцене."}
          </p>

          <h3>{"Граница сложности"}</h3>
          <p>
            {"Не подменяйте авторизацию фактом успешного входа: право проверяется для конкретного действия и ресурса."}
          </p>
        </div>

        <StepThrough
          code={"def update_task(task_id, payload, current_user, db):\n    task = get_task_or_404(db, task_id)\n    ensure_active(current_user)\n    ensure_owner(task, current_user)\n    task.title = payload.title\n    db.commit()\n    return task"}
          steps={[
            { line: 0, note: "FastAPI уже передал проверенный payload и зависимость current_user.", vars: {"task_id": "17", "current_user.id": "4"} },
            { line: 1, note: "Задача загружается из базы или запрос получает 404.", vars: {"task.owner_id": "4"} },
            { line: 2, note: "Неактивная учётная запись останавливается до изменения данных.", vars: {"is_active": "True"} },
            { line: 3, note: "Сравнивается владелец конкретной записи.", vars: {"4 == 4": "True"} },
            { line: 4, note: "Только после проверок меняется предметное поле.", vars: {"title": "\"Новая тема\""} },
            { line: 5, note: "Успешное изменение фиксируется транзакцией.", vars: {"commit": "done"} }
          ]}
        />

        <CodeSequence
          title={"Соберите защиту endpoint"}
          prompt={"Расположите этапы до изменения задачи."}
          pieces={[
            { id: "identity", code: "получить current_user" },
            { id: "load", code: "загрузить task" },
            { id: "active", code: "проверить is_active" },
            { id: "owner", code: "сравнить owner_id" },
            { id: "change", code: "изменить task" },
            { id: "commit", code: "выполнить commit" },
            { id: "wrong", code: "сначала изменить, потом проверить", note: "проверка слишком поздняя" }
          ]}
          correctOrder={["identity", "load", "active", "owner", "change", "commit"]}
          explanation={"Доверие и право проверяются до предметного изменения и commit."}
        />
      </Section>

      <Section
        number="06"
        title={"Явная функция проверки владельца"}
      >
        <Lead>
          {"Повторяемое правило лучше назвать. Функция получает ресурс и пользователя, ничего не ищет глобально и либо завершает проверку, либо останавливает запрос."}
        </Lead>

        <div className="lesson-practice-steps">
          <h3>{"Главный вопрос сцены"}</h3>
          <p>
            {"Раздел «Явная функция проверки владельца» показывает, как правило влияет на current_user, role, owner_id и HTTP-статус."}
          </p>

          <h3>{"Что нужно уметь объяснить"}</h3>
          <p>
            {"Назовите входные данные, выполняемую проверку, успешный результат и ожидаемый отказ до перехода к следующей сцене."}
          </p>

          <h3>{"Граница сложности"}</h3>
          <p>
            {"Не подменяйте авторизацию фактом успешного входа: право проверяется для конкретного действия и ресурса."}
          </p>
        </div>

        <CodeBlock
          caption={"access.py"}
          code={"from fastapi import HTTPException, status\n\n\ndef ensure_task_owner(task, current_user) -> None:\n    if task.owner_id != current_user.id:\n        raise HTTPException(\n            status_code=status.HTTP_403_FORBIDDEN,\n            detail=\"Недостаточно прав\",\n        )"}
        />

        <FillBlank
          prompt={"Дополните сравнение владельца."}
          before={"if task.owner_id "}
          after={" current_user.id:\n    raise HTTPException(status_code=403)"}
          options={["!=", "==", "in"]}
          answer={"!="}
          explanation={"Запрет возникает, когда идентификаторы владельца и пользователя не совпали."}
        />

        <CompareSolutions
          question={"Где понятнее хранить правило владельца?"}
          left={{
            title: "Повтор в каждом endpoint",
            code: "if task.owner_id != user.id:\n    raise HTTPException(403)",
            note: "Правило легко изменить не во всех местах.",
          }}
          right={{
            title: "Одна именованная проверка",
            code: "ensure_task_owner(task, current_user)",
            note: "Смысл читается в endpoint, реализация находится в одном месте.",
          }}
          preferred="right"
          explanation={"Общее правило имеет одно имя и одну точку изменения."}
        />
      </Section>

      <Section
        number="07"
        title={"Типичные ошибки проектирования доступа"}
      >
        <Lead>
          {"Большинство ошибок здесь не синтаксические. Код запускается, но доверяет данным клиента или проверяет право не на тот объект."}
        </Lead>

        <div className="lesson-practice-steps">
          <h3>{"Главный вопрос сцены"}</h3>
          <p>
            {"Раздел «Типичные ошибки проектирования доступа» показывает, как правило влияет на current_user, role, owner_id и HTTP-статус."}
          </p>

          <h3>{"Что нужно уметь объяснить"}</h3>
          <p>
            {"Назовите входные данные, выполняемую проверку, успешный результат и ожидаемый отказ до перехода к следующей сцене."}
          </p>

          <h3>{"Граница сложности"}</h3>
          <p>
            {"Не подменяйте авторизацию фактом успешного входа: право проверяется для конкретного действия и ресурса."}
          </p>
        </div>

        <BugHunt
          code={"def update_task(task_id, payload, current_user, db):\n    task = db.get(TaskModel, task_id)\n    task.owner_id = payload.owner_id\n    task.title = payload.title\n    db.commit()"}
          question={"Какая строка позволяет захватить чужую задачу?"}
          options={["owner_id берётся из тела запроса", "title изменяется строкой", "используется db.get"]}
          correctIndex={0}
          explanation={"Владелец является серверным фактом. Клиент не должен назначать его произвольным значением."}
          fix={"task = db.get(TaskModel, task_id)\nensure_task_owner(task, current_user)\ntask.title = payload.title\ndb.commit()"}
        />

        <FlipCards
          cards={[
            { front: <>{"«В теле owner_id = 7»"}</>, back: <>{"Это только вход клиента, а не доказательство личности."}</> },
            { front: <>{"«Пользователь admin»"}</>, back: <>{"Роль проверяется сервером по загруженной модели User."}</> },
            { front: <>{"«Задача существует»"}</>, back: <>{"Существование не означает право чтения или изменения."}</> },
            { front: <>{"«Пароль совпал»"}</>, back: <>{"Аутентификация завершена, но авторизация ещё нужна."}</> }
          ]}
        />

        <Callout tone="info">
          {"Не доверяйте owner_id, role и is_active из пользовательского JSON. Эти значения загружаются из доверенного серверного состояния."}
        </Callout>
      </Section>

      <Section
        number="08"
        title={"Контрольная точка: классифицируем сценарии"}
      >
        <Lead>
          {"К концу занятия важно не запомнить три определения, а быстро определить уровень сбоя и выбрать проверку до изменения данных."}
        </Lead>

        <MethodGrid
          rows={[
            [<>{"нет credentials"}</>, <>{"аутентификация не состоялась → 401"}</>],
            [<>{"неверный пароль"}</>, <>{"доказательство не принято → 401"}</>],
            [<>{"чужая задача"}</>, <>{"личность известна, право отсутствует → 403"}</>],
            [<>{"своя задача"}</>, <>{"проверка owner_id пройдена → действие разрешено"}</>],
            [<>{"неактивный пользователь"}</>, <>{"запрет по серверному состоянию → 403"}</>]
          ]}
        />

        <div className="lesson-check-group">
          <QuizCard
            question={"Что делает идентификация?"}
            options={["называет предполагаемую личность", "хеширует пароль", "выдаёт все права"]}
            correctIndex={0}
            explanation={"Она отвечает на вопрос «кто заявлен», но ещё не подтверждает ответ."}
          />
          <QuizCard
            question={"Когда подходит статус 401?"}
            options={["личность не подтверждена", "пользователь открыл чужую задачу", "поле title слишком длинное"]}
            correctIndex={0}
            explanation={"401 относится к отсутствующим или недействительным credentials."}
          />
          <QuizCard
            question={"Что проверяет авторизация владельца?"}
            options={["task.owner_id == current_user.id", "payload.owner_id существует", "пароль длиннее восьми символов"]}
            correctIndex={0}
            explanation={"Сравниваются серверные идентификаторы ресурса и подтверждённого пользователя."}
          />
          <QuizCard
            question={"Почему нельзя доверять role из JSON клиента?"}
            options={["клиент может подставить admin", "JSON не умеет хранить строки", "роль всегда равна user"]}
            correctIndex={0}
            explanation={"Права должны происходить из серверной модели, а не из самодекларации клиента."}
          />
        </div>

        <KeyTakeaways
          points={[
            <>{"Идентификация называет личность, аутентификация проверяет доказательство."}</>,
            <>{"Авторизация выполняется после аутентификации и относится к конкретному действию."}</>,
            <>{"401 означает отсутствие действительной аутентификации, 403 — недостаток прав."}</>,
            <>{"owner_id является серверным фактом конкретного ресурса."}</>,
            <>{"Роль и владение решают разные задачи."}</>,
            <>{"Проверки доступа выполняются до изменения модели и commit."}</>
          ]}
        />

        <PracticeCta text={"Создайте access.py с ensure_active() и ensure_task_owner(), подключите проверки к одному endpoint StudyHub и письменно классифицируйте пять сценариев по уровням идентификации, аутентификации и авторизации."} />
      </Section>
    </RichLesson>
  );
}

// 94. Карта способов аутентификации
export function Lesson94({ module }: LessonProps) {
  return (
    <RichLesson>
      <RichHero
        variant="project"
        chip={module ?? BLOCK_TITLE}
        title={"Карта способов аутентификации"}
        intro={"Сравним HTTP Basic, API key, cookie-сессию, opaque Bearer token и JWT по одному набору критериев: где хранится состояние, что передаёт клиент, как выполняется проверка и насколько управляем logout."}
        tags={[
          { 
            icon: <Layers size={14} />,
            label: "пять способов",
          },
          { 
            icon: <KeyRound size={14} />,
            label: "состояние · передача · logout",
          }
        ]}
      />
      <TheoryBridge lesson={94} />

      <Section
        number="01"
        title={"Почему одного слова «логин» недостаточно"}
      >
        <Lead>
          {"Разные проекты подтверждают пользователя разными механизмами. Выбор нельзя делать по популярности: нужно понимать транспорт credentials, место хранения состояния и способ отзыва доступа."}
        </Lead>

        <div className="lesson-route">
          <ol>
            <li>
              <strong>Что передаёт клиент:</strong> пароль, ключ, идентификатор сессии или токен.
            </li>
            <li>
              <strong>Что хранит сервер:</strong> учётные данные, активные сессии, отозванные токены или только секрет проверки подписи.
            </li>
            <li>
              <strong>Как завершить доступ:</strong> удалить server-side session, отозвать ключ, дождаться TTL или вести дополнительное состояние.
            </li>
            <li>
              <strong>Для кого механизм:</strong> человек в браузере, мобильное приложение, внутренний сервис или внешний интегратор.
            </li>
          </ol>
        <p>Итог — сравнительная карта без преждевременной реализации cookie и JWT.</p>
        </div>

        <TypeCards>
          <TypeCard
            badge={"credential"}
            title={"Доказательство"}
            code={"Authorization / Cookie"}
          >
            {"То, что клиент предъявляет серверу: пароль, API key, session id или token."}
          </TypeCard>

          <TypeCard
            badge={"transport"}
            badgeTone="float"
            title={"Способ передачи"}
            code={"Bearer <token>"}
          >
            {"HTTP-заголовок или cookie. Транспорт не определяет внутреннее устройство проверки."}
          </TypeCard>

          <TypeCard
            badge={"state"}
            badgeTone="str"
            title={"Состояние"}
            code={"sessions[session_id]"}
          >
            {"Данные, которые сервер должен помнить между запросами."}
          </TypeCard>
        </TypeCards>

        <Callout tone="info">
          {"Cookie и Bearer — способы доставки значения. Внутри cookie может быть session id, а Bearer token может быть opaque-строкой или JWT."}
        </Callout>
      </Section>

      <Section
        number="02"
        title={"HTTP Basic и API key"}
      >
        <Lead>
          {"Basic передаёт логин и пароль при каждом запросе, а API key обычно идентифицирует приложение или интеграцию. Оба механизма требуют HTTPS: кодирование не делает секрет зашифрованным."}
        </Lead>

        <div className="lesson-practice-steps">
          <h3>{"Главный вопрос сцены"}</h3>
          <p>
            {"Раздел «HTTP Basic и API key» показывает, как правило влияет на credential, транспорт, server-side state и способ revoke."}
          </p>

          <h3>{"Что нужно уметь объяснить"}</h3>
          <p>
            {"Назовите входные данные, выполняемую проверку, успешный результат и ожидаемый отказ до перехода к следующей сцене."}
          </p>

          <h3>{"Граница сложности"}</h3>
          <p>
            {"Не реализуйте все схемы одновременно: сначала сравните их, затем выберите одну под пользовательский сценарий."}
          </p>
        </div>

        <CompareSolutions
          question={"Как точнее описать заголовок Basic?"}
          left={{
            title: "«Пароль зашифрован Base64»",
            code: "Authorization: Basic dXNlcjpwYXNz",
            note: "Base64 легко декодируется и не является шифрованием.",
          }}
          right={{
            title: "«Пара закодирована для передачи»",
            code: "base64(\"user:pass\")",
            note: "Конфиденциальность обеспечивает HTTPS, а не Base64.",
          }}
          preferred="right"
          explanation={"Кодирование меняет представление данных, но не скрывает секрет от того, кто их перехватил."}
        />

        <MethodGrid
          rows={[
            [<>{"HTTP Basic"}</>, <>{"простая встроенная схема; пароль участвует в каждом запросе"}</>],
            [<>{"API key"}</>, <>{"длинный секрет для клиента или интеграции; может иметь отдельные права"}</>],
            [<>{"HTTPS"}</>, <>{"защищает credentials при передаче по сети"}</>],
            [<>{"rotation"}</>, <>{"замена ключа без смены всей учётной записи"}</>]
          ]}
        />

        <TrueFalse
          statement={
            <>
              {"API key всегда обозначает конкретного человека и подходит для браузерного логина."}
            </>
          }
          isTrue={false}
          explanation={"Чаще ключ выдают приложению или интеграции. Модель владельца и правила использования проектируются отдельно."}
        />
      </Section>

      <Section
        number="03"
        title={"Cookie и server-side session"}
      >
        <Lead>
          {"При серверной сессии после успешного входа сервер создаёт случайный session id, хранит связанную запись у себя и отправляет идентификатор браузеру в cookie."}
        </Lead>

        <div className="lesson-practice-steps">
          <h3>{"Главный вопрос сцены"}</h3>
          <p>
            {"Раздел «Cookie и server-side session» показывает, как правило влияет на credential, транспорт, server-side state и способ revoke."}
          </p>

          <h3>{"Что нужно уметь объяснить"}</h3>
          <p>
            {"Назовите входные данные, выполняемую проверку, успешный результат и ожидаемый отказ до перехода к следующей сцене."}
          </p>

          <h3>{"Граница сложности"}</h3>
          <p>
            {"Не реализуйте все схемы одновременно: сначала сравните их, затем выберите одну под пользовательский сценарий."}
          </p>
        </div>

        <StepThrough
          code={"user = authenticate_user(email, password)\nsession_id = create_session(user.id)\nresponse.set_cookie(\"session_id\", session_id)\n\n# следующий запрос\nsession_id = request.cookies.get(\"session_id\")\nuser_id = find_active_session(session_id)"}
          steps={[
            { line: 0, note: "Пароль проверяется один раз во время входа.", vars: {"user.id": "12"} },
            { line: 1, note: "Сервер создаёт непредсказуемый идентификатор и хранит соответствие.", vars: {"session_id": "\"a8f...\""} },
            { line: 2, note: "Браузер получает cookie, а не пароль пользователя.", vars: {"Set-Cookie": "session_id=a8f..."} },
            { line: 5, note: "В следующем запросе браузер возвращает cookie.", vars: {"Cookie": "session_id=a8f..."} },
            { line: 6, note: "Сервер ищет активную запись и восстанавливает пользователя.", vars: {"user_id": "12"} }
          ]}
        />

        <TypeCards>
          <TypeCard
            badge={"browser"}
            title={"Cookie"}
            code={"session_id=a8f..."}
          >
            {"Небольшое значение, которое браузер отправляет подходящему домену по правилам cookie."}
          </TypeCard>

          <TypeCard
            badge={"server"}
            badgeTone="float"
            title={"Session store"}
            code={"session_id → user_id"}
          >
            {"Таблица или другое хранилище активных сессий и их срока жизни."}
          </TypeCard>

          <TypeCard
            badge={"logout"}
            badgeTone="str"
            title={"Удаление сессии"}
            code={"DELETE session; Max-Age=0"}
          >
            {"Сервер деактивирует запись, а ответ удаляет cookie у клиента."}
          </TypeCard>
        </TypeCards>

        <RecallCard
          question={"Почему cookie не является готовой server-side session?"}
          answer={
            <p>
              {"Cookie только переносит значение между браузером и сервером. Сессия появляется, когда сервер создаёт и проверяет собственную запись состояния."}
            </p>
          }
        />
      </Section>

      <Section
        number="04"
        title={"Opaque Bearer token"}
      >
        <Lead>
          {"Bearer означает: обладатель значения получает связанный доступ. Opaque token выглядит как случайная строка без читаемой внутренней структуры; сервер ищет её в своём хранилище."}
        </Lead>

        <div className="lesson-practice-steps">
          <h3>{"Главный вопрос сцены"}</h3>
          <p>
            {"Раздел «Opaque Bearer token» показывает, как правило влияет на credential, транспорт, server-side state и способ revoke."}
          </p>

          <h3>{"Что нужно уметь объяснить"}</h3>
          <p>
            {"Назовите входные данные, выполняемую проверку, успешный результат и ожидаемый отказ до перехода к следующей сцене."}
          </p>

          <h3>{"Граница сложности"}</h3>
          <p>
            {"Не реализуйте все схемы одновременно: сначала сравните их, затем выберите одну под пользовательский сценарий."}
          </p>
        </div>

        <CodeBlock
          caption={"заголовок запроса"}
          code={"Authorization: Bearer Qx7pY2mK9..."}
        />

        <BranchExplorer
          code={"token = read_bearer_token(request)\nrecord = find_token_hash(token)\nif record is None:\n    return 401\nif record.revoked_at is not None:\n    return 401\nif record.expires_at <= now:\n    return 401\nreturn record.user_id"}
          scenarios={[
            { label: "неизвестный token", activeLine: 3, output: "401" },
            { label: "отозванный token", activeLine: 5, output: "401" },
            { label: "активный token", activeLine: 8, output: "user_id" }
          ]}
        />

        <CompareSolutions
          question={"Чем opaque token похож на session id?"}
          left={{
            title: "Сервер хранит запись",
            code: "token_hash → user_id, expires_at",
            note: "Для проверки нужен поиск серверного состояния.",
          }}
          right={{
            title: "Токен содержит весь профиль",
            code: "decode(token).user",
            note: "Это уже другая модель, похожая на подписанный self-contained token.",
          }}
          preferred="left"
          explanation={"Opaque token сам по себе ничего не сообщает приложению; смысл находится в серверной записи."}
        />
      </Section>

      <Section
        number="05"
        title={"JWT: подписанный, но не секретный контейнер"}
      >
        <Lead>
          {"JWT обычно состоит из header, payload и signature. Подпись позволяет обнаружить изменение данных, но payload часто лишь кодирован и читается без секретного ключа."}
        </Lead>

        <div className="lesson-practice-steps">
          <h3>{"Главный вопрос сцены"}</h3>
          <p>
            {"Раздел «JWT: подписанный, но не секретный контейнер» показывает, как правило влияет на credential, транспорт, server-side state и способ revoke."}
          </p>

          <h3>{"Что нужно уметь объяснить"}</h3>
          <p>
            {"Назовите входные данные, выполняемую проверку, успешный результат и ожидаемый отказ до перехода к следующей сцене."}
          </p>

          <h3>{"Граница сложности"}</h3>
          <p>
            {"Не реализуйте все схемы одновременно: сначала сравните их, затем выберите одну под пользовательский сценарий."}
          </p>
        </div>

        <TypeCards>
          <TypeCard
            badge={"header"}
            title={"Метаданные"}
            code={"{\"alg\": \"HS256\", \"typ\": \"JWT\"}"}
          >
            {"Описывает тип токена и алгоритм подписи."}
          </TypeCard>

          <TypeCard
            badge={"payload"}
            badgeTone="float"
            title={"Claims"}
            code={"{\"sub\": \"12\", \"exp\": 1710000000}"}
          >
            {"Содержит утверждения: subject, срок действия и другие минимальные данные."}
          </TypeCard>

          <TypeCard
            badge={"signature"}
            badgeTone="str"
            title={"Подпись"}
            code={"sign(header.payload, key)"}
          >
            {"Связывает предыдущие части с ключом и защищает от незаметного изменения."}
          </TypeCard>
        </TypeCards>

        <BugHunt
          code={"payload = {\n    \"sub\": str(user.id),\n    \"password\": user.password,\n    \"card_number\": user.card_number,\n}"}
          question={"Почему payload небезопасен даже при корректной подписи?"}
          options={["Содержимое JWT обычно можно прочитать", "JWT не поддерживает числа", "Поле sub запрещено"]}
          correctIndex={0}
          explanation={"Подпись подтверждает целостность, но не шифрует пользовательские данные."}
          fix={"payload = {\n    \"sub\": str(user.id),\n    \"exp\": expires_at,\n}"}
        />

        <TrueFalse
          statement={
            <>
              {"Если JWT имеет корректную подпись, его payload автоматически скрыт от клиента."}
            </>
          }
          isTrue={false}
          explanation={"Обычный подписанный JWT не является зашифрованным контейнером."}
        />
      </Section>

      <Section
        number="06"
        title={"Access, refresh и OAuth2 — разные уровни"}
      >
        <Lead>
          {"Access token обслуживает короткий доступ к API, refresh token помогает получить новую пару, а OAuth2 описывает протокол делегирования и несколько потоков. Эти понятия нельзя заменять друг другом."}
        </Lead>

        <div className="lesson-practice-steps">
          <h3>{"Главный вопрос сцены"}</h3>
          <p>
            {"Раздел «Access, refresh и OAuth2 — разные уровни» показывает, как правило влияет на credential, транспорт, server-side state и способ revoke."}
          </p>

          <h3>{"Что нужно уметь объяснить"}</h3>
          <p>
            {"Назовите входные данные, выполняемую проверку, успешный результат и ожидаемый отказ до перехода к следующей сцене."}
          </p>

          <h3>{"Граница сложности"}</h3>
          <p>
            {"Не реализуйте все схемы одновременно: сначала сравните их, затем выберите одну под пользовательский сценарий."}
          </p>
        </div>

        <MatchPairs
          prompt={"Соедините понятие и его основную роль."} leftTitle={"Понятие"} rightTitle={"Роль"}
          pairs={[
            { left: "access token", right: "предъявляется защищённому API" },
            { left: "refresh token", right: "используется для обновления доступа" },
            { left: "OAuth2", right: "протокол выдачи делегированного доступа" },
            { left: "Bearer", right: "схема предъявления токена обладателем" }
          ]}
          explanation={"Термины связаны, но описывают разные части системы."}
        />

        <CodeSequence
          title={"Соберите типичный цикл пары токенов"}
          prompt={"Расположите действия без реализации криптографии."}
          pieces={[
            { id: "login", code: "проверить credentials" },
            { id: "issue", code: "выдать access и refresh" },
            { id: "api", code: "использовать access для API" },
            { id: "expire", code: "access истёк" },
            { id: "refresh", code: "предъявить refresh" },
            { id: "rotate", code: "получить новую пару" }
          ]}
          correctOrder={["login", "issue", "api", "expire", "refresh", "rotate"]}
          explanation={"Refresh не отправляют каждому endpoint и не используют как обычный access token."}
        />

        <Callout tone="info">
          {"В этом занятии строится карта. Реализация OAuth2 password flow, JWT, refresh rotation и revoke будет позже, после server-side sessions."}
        </Callout>
      </Section>

      <Section
        number="07"
        title={"Сравнительная матрица и критерии выбора"}
      >
        <Lead>
          {"Ни один механизм не выигрывает во всех строках. Удобство отзыва, объём серверного состояния и тип клиента образуют компромисс."}
        </Lead>

        <div className="lesson-practice-steps">
          <h3>{"Главный вопрос сцены"}</h3>
          <p>
            {"Раздел «Сравнительная матрица и критерии выбора» показывает, как правило влияет на credential, транспорт, server-side state и способ revoke."}
          </p>

          <h3>{"Что нужно уметь объяснить"}</h3>
          <p>
            {"Назовите входные данные, выполняемую проверку, успешный результат и ожидаемый отказ до перехода к следующей сцене."}
          </p>

          <h3>{"Граница сложности"}</h3>
          <p>
            {"Не реализуйте все схемы одновременно: сначала сравните их, затем выберите одну под пользовательский сценарий."}
          </p>
        </div>

        <MethodGrid
          rows={[
            [<>{"HTTP Basic"}</>, <>{"минимум инфраструктуры; пароль участвует в каждом запросе"}</>],
            [<>{"API key"}</>, <>{"удобен для интеграций; нужен выпуск, хранение, scope и revoke"}</>],
            [<>{"Cookie + session"}</>, <>{"понятный browser login и простой централизованный logout"}</>],
            [<>{"Opaque Bearer"}</>, <>{"токен в заголовке и серверный контроль состояния"}</>],
            [<>{"JWT"}</>, <>{"проверяемая подпись и меньше lookup; revoke требует отдельного решения"}</>]
          ]}
        />

        <FlipCards
          cards={[
            { front: <>{"Нужен немедленный logout"}</>, back: <>{"Server-side session или stateful token отзывается напрямую."}</> },
            { front: <>{"Внешняя интеграция"}</>, back: <>{"API key или Bearer token обычно удобнее браузерной cookie."}</> },
            { front: <>{"Минимум данных в клиенте"}</>, back: <>{"Храните только непрозрачный идентификатор, а смысл — на сервере."}</> },
            { front: <>{"JWT без state"}</>, back: <>{"Учитывайте короткий TTL и сложность мгновенного revoke."}</> }
          ]}
        />

        <Callout>
          {"Выбор механизма является частью модели угроз и пользовательского сценария, а не соревнованием по количеству аббревиатур."}
        </Callout>
      </Section>

      <Section
        number="08"
        title={"Контрольная точка: выбираем механизм осознанно"}
      >
        <Lead>
          {"Для StudyHub следующим шагом станет cookie + server-side session: это позволит наглядно увидеть серверное состояние, срок жизни и logout. JWT появится после этой модели, а не вместо неё."}
        </Lead>

        <TerminalDemo
          title={"мысленный аудит запроса"}
          lines={[
            { cmd: "Что передаёт клиент?" },
            { out: "credential или идентификатор" },
            { cmd: "Где сервер проверяет состояние?" },
            { out: "user/session/token store или подпись" },
            { cmd: "Как отозвать доступ?" },
            { out: "delete, revoke, rotate или TTL" }
          ]}
        />

        <div className="lesson-check-group">
          <QuizCard
            question={"Что защищает HTTP Basic в сети?"}
            options={["HTTPS", "Base64", "имя пользователя"]}
            correctIndex={0}
            explanation={"Base64 только кодирует пару, а конфиденциальность канала обеспечивает HTTPS."}
          />
          <QuizCard
            question={"Что обычно хранит cookie при server-side session?"}
            options={["случайный session id", "открытый пароль", "всю таблицу users"]}
            correctIndex={0}
            explanation={"Смысл и состояние сессии остаются на сервере."}
          />
          <QuizCard
            question={"Что верно для обычного подписанного JWT?"}
            options={["payload можно прочитать", "payload всегда зашифрован", "подпись хранит пароль"]}
            correctIndex={0}
            explanation={"Подпись обеспечивает целостность, а не секретность содержимого."}
          />
          <QuizCard
            question={"Для чего нужен refresh token?"}
            options={["получить новый доступ", "заменить owner_id", "передавать пароль каждому endpoint"]}
            correctIndex={0}
            explanation={"Он обслуживает обновление доступа и требует отдельной защиты."}
          />
        </div>

        <KeyTakeaways
          points={[
            <>{"Механизмы сравнивают по credentials, серверному состоянию, клиенту и отзыву."}</>,
            <>{"Base64 не является шифрованием, поэтому Basic требует HTTPS."}</>,
            <>{"Cookie переносит значение, а server-side session хранится на сервере."}</>,
            <>{"Opaque token получает смысл только через серверную запись."}</>,
            <>{"Подписанный JWT не скрывает payload."}</>,
            <>{"Access, refresh, Bearer и OAuth2 описывают разные уровни системы."}</>
          ]}
        />

        <PracticeCta text={"Составьте таблицу для HTTP Basic, API key, cookie-session, opaque Bearer и JWT: клиент, транспорт, серверное состояние, logout/revoke и подходящий сценарий StudyHub. Обоснуйте выбор server-side session для следующего блока."} />
      </Section>
    </RichLesson>
  );
}

// 95. Модель User и схемы
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
      <TheoryBridge lesson={95} />

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

// 96. Пароль и хеширование
export function Lesson96({ module }: LessonProps) {
  return (
    <RichLesson>
      <RichHero
        variant="project"
        chip={module ?? BLOCK_TITLE}
        title={"Пароль и хеширование"}
        intro={"Проследим пароль от входного запроса до безопасного сравнения: разберём односторонний хеш, salt, стоимость вычисления и готовую библиотеку pwdlib с Argon2. Самодельную криптографию оставим музею плохих идей."}
        tags={[
          { 
            icon: <LockKeyhole size={14} />,
            label: "hash · salt · verify",
          },
          { 
            icon: <ShieldCheck size={14} />,
            label: "pwdlib · Argon2",
          }
        ]}
      />
      <TheoryBridge lesson={96} />

      <Section
        number="01"
        title={"Почему открытый пароль нельзя хранить"}
      >
        <Lead>
          {"Пароль является секретом пользователя, а не данными профиля. Сервер должен проверять его, не имея возможности прочитать исходное значение из базы."}
        </Lead>

        <div className="lesson-route">
          <ol>
            <li>
              <strong>Получить пароль:</strong> принять его только по защищённому соединению во входной схеме.
            </li>
            <li>
              <strong>Преобразовать:</strong> вычислить медленный односторонний password hash через проверенную библиотеку.
            </li>
            <li>
              <strong>Сохранить:</strong> записать только результат хеширования в password_hash.
            </li>
            <li>
              <strong>Проверить позже:</strong> передать новый кандидат и сохранённый хеш функции verify.
            </li>
          </ol>
        <p>После урока проект получает маленький password service и тесты его поведения.</p>
        </div>

        <CompareSolutions
          question={"Какое хранение переживает утечку базы лучше?"}
          left={{
            title: "Открытый password",
            code: "password = \"qwerty123\"",
            note: "Секрет сразу пригоден для входа и повторного использования на других сайтах.",
          }}
          right={{
            title: "Password hash",
            code: "password_hash = \"$argon2id$...\"",
            note: "Для проверки кандидата требуется дорогой подбор.",
          }}
          preferred="right"
          explanation={"Хеш не отменяет последствия слабого пароля, но не раскрывает исходный секрет напрямую."}
        />

        <Callout tone="info">
          {"Пароль не логируют, не включают в traceback вручную, не помещают в URL и не возвращают в ответе — даже на локальной разработке."}
        </Callout>
      </Section>

      <Section
        number="02"
        title={"Хеширование, шифрование и кодирование"}
      >
        <Lead>
          {"Три операции часто смешивают. Для хранения пароля нужен односторонний verifier, а не способ восстановить исходный текст."}
        </Lead>

        <div className="lesson-practice-steps">
          <h3>{"Главный вопрос сцены"}</h3>
          <p>
            {"Раздел «Хеширование, шифрование и кодирование» показывает, как правило влияет на password, password_hash, salt и verify_password."}
          </p>

          <h3>{"Что нужно уметь объяснить"}</h3>
          <p>
            {"Назовите входные данные, выполняемую проверку, успешный результат и ожидаемый отказ до перехода к следующей сцене."}
          </p>

          <h3>{"Граница сложности"}</h3>
          <p>
            {"Не изобретайте алгоритм и не сравнивайте новый salted hash с сохранённой строкой."}
          </p>
        </div>

        <TypeCards>
          <TypeCard
            badge={"encode"}
            title={"Кодирование"}
            code={"Base64"}
          >
            {"Меняет представление для совместимости. Обратное преобразование не требует секрета."}
          </TypeCard>

          <TypeCard
            badge={"encrypt"}
            badgeTone="float"
            title={"Шифрование"}
            code={"ciphertext ↔ plaintext"}
          >
            {"Скрывает данные и предполагает расшифрование ключом."}
          </TypeCard>

          <TypeCard
            badge={"hash"}
            badgeTone="str"
            title={"Хеширование пароля"}
            code={"verify(candidate, stored_hash)"}
          >
            {"Создаёт verifier для проверки кандидата без восстановления исходного пароля."}
          </TypeCard>
        </TypeCards>

        <MatchPairs
          prompt={"Соедините задачу и подходящий механизм."}
          pairs={[
            { left: "передать бинарные данные текстом", right: "кодирование" },
            { left: "позже восстановить секретный документ", right: "шифрование" },
            { left: "проверить пароль пользователя", right: "password hashing" }
          ]}
          explanation={"Операции имеют разные цели и свойства."}
        />

        <TrueFalse
          statement={
            <>
              {"Если password_hash можно проверить, значит сервер сначала расшифровывает его в исходный пароль."}
            </>
          }
          isTrue={false}
          explanation={"Verify запускает алгоритм над кандидатом и сравнивает результат по правилам формата хеша."}
        />
      </Section>

      <Section
        number="03"
        title={"Salt разрушает одинаковые отпечатки"}
      >
        <Lead>
          {"Случайный salt добавляется к каждому паролю перед вычислением. Поэтому одинаковые пароли разных пользователей получают разные хеши."}
        </Lead>

        <div className="lesson-practice-steps">
          <h3>{"Главный вопрос сцены"}</h3>
          <p>
            {"Раздел «Salt разрушает одинаковые отпечатки» показывает, как правило влияет на password, password_hash, salt и verify_password."}
          </p>

          <h3>{"Что нужно уметь объяснить"}</h3>
          <p>
            {"Назовите входные данные, выполняемую проверку, успешный результат и ожидаемый отказ до перехода к следующей сцене."}
          </p>

          <h3>{"Граница сложности"}</h3>
          <p>
            {"Не изобретайте алгоритм и не сравнивайте новый salted hash с сохранённой строкой."}
          </p>
        </div>

        <StepThrough
          code={"first = password_hash.hash(\"same-password\")\nsecond = password_hash.hash(\"same-password\")\n\nprint(first == second)\nprint(password_hash.verify(\"same-password\", first))\nprint(password_hash.verify(\"wrong\", first))"}
          steps={[
            { line: 0, note: "Библиотека создаёт новый случайный salt и хеш.", vars: {"first": "$argon2id$...A"} },
            { line: 1, note: "Для того же пароля создаётся другой salt.", vars: {"second": "$argon2id$...B"} },
            { line: 3, note: "Строки хешей различаются.", vars: {"first == second": "False"} },
            { line: 4, note: "Формат первого хеша содержит параметры и salt для корректной проверки.", vars: {"verify": "True"} },
            { line: 5, note: "Неверный кандидат не проходит проверку.", vars: {"verify": "False"} }
          ]}
        />

        <PredictOutput
          code={"first = hash_password(\"secret123\")\nsecond = hash_password(\"secret123\")\nprint(first == second)\nprint(verify_password(\"secret123\", first))"}
          output={"False\nTrue"}
          hint={"Новый salt меняет строку хеша, но verify понимает его формат."}
        />

        <RecallCard
          question={"Зачем хранить salt рядом с хешем, если он не является секретом?"}
          answer={
            <p>
              {"Salt нужен алгоритму проверки и делает одинаковые пароли различимыми в базе. Его задача — уникальность вычисления, а не секретность."}
            </p>
          }
        />
      </Section>

      <Section
        number="04"
        title={"Стоимость вычисления замедляет подбор"}
      >
        <Lead>
          {"Обычный быстрый SHA-256 хорош для контроля целостности файлов, но плох как самостоятельный password hash: атакующий может перебирать кандидаты слишком быстро."}
        </Lead>

        <div className="lesson-practice-steps">
          <h3>{"Главный вопрос сцены"}</h3>
          <p>
            {"Раздел «Стоимость вычисления замедляет подбор» показывает, как правило влияет на password, password_hash, salt и verify_password."}
          </p>

          <h3>{"Что нужно уметь объяснить"}</h3>
          <p>
            {"Назовите входные данные, выполняемую проверку, успешный результат и ожидаемый отказ до перехода к следующей сцене."}
          </p>

          <h3>{"Граница сложности"}</h3>
          <p>
            {"Не изобретайте алгоритм и не сравнивайте новый salted hash с сохранённой строкой."}
          </p>
        </div>

        <CompareSolutions
          question={"Какой подход подходит для паролей?"}
          left={{
            title: "Один быстрый SHA-256",
            code: "sha256(password.encode()).hexdigest()",
            note: "Очень быстрый массовый перебор и нет готовой политики параметров.",
          }}
          right={{
            title: "Специализированный password hash",
            code: "PasswordHash.recommended()",
            note: "Алгоритм хранит salt и параметры стоимости в стандартном формате.",
          }}
          preferred="right"
          explanation={"Для паролей нужна управляемая стоимость вычисления и готовая реализация безопасной проверки."}
        />

        <MethodGrid
          rows={[
            [<>{"time cost"}</>, <>{"сколько раундов вычисления выполняется"}</>],
            [<>{"memory cost"}</>, <>{"сколько памяти требует алгоритм"}</>],
            [<>{"parallelism"}</>, <>{"настройка параллельной работы алгоритма"}</>],
            [<>{"rehash"}</>, <>{"обновление старого хеша при изменении рекомендуемых параметров"}</>]
          ]}
        />

        <Callout>
          {"Чем выше стоимость, тем дороже и вход пользователя, и атака. Параметры измеряют на реальном окружении, а не увеличивают бесконечно."}
        </Callout>
      </Section>

      <Section
        number="05"
        title={"Password service через pwdlib"}
      >
        <Lead>
          {"В проекте создадим две маленькие функции. Они скрывают библиотечную деталь от регистрации и аутентификации, но не изобретают собственный алгоритм."}
        </Lead>

        <div className="lesson-practice-steps">
          <h3>{"Главный вопрос сцены"}</h3>
          <p>
            {"Раздел «Password service через pwdlib» показывает, как правило влияет на password, password_hash, salt и verify_password."}
          </p>

          <h3>{"Что нужно уметь объяснить"}</h3>
          <p>
            {"Назовите входные данные, выполняемую проверку, успешный результат и ожидаемый отказ до перехода к следующей сцене."}
          </p>

          <h3>{"Граница сложности"}</h3>
          <p>
            {"Не изобретайте алгоритм и не сравнивайте новый salted hash с сохранённой строкой."}
          </p>
        </div>

        <TerminalDemo
          title={"установка рекомендованного backend"}
          lines={[
            { cmd: "pip install \"pwdlib[argon2]\"" },
            { out: "Successfully installed pwdlib argon2-cffi ..." }
          ]}
        />

        <CodeBlock
          caption={"app/security/passwords.py"}
          code={"from pwdlib import PasswordHash\n\n\npassword_hash = PasswordHash.recommended()\n\n\ndef hash_password(password: str) -> str:\n    return password_hash.hash(password)\n\n\ndef verify_password(password: str, stored_hash: str) -> bool:\n    return password_hash.verify(password, stored_hash)"}
        />

        <FillBlank
          prompt={"Передайте в verify сначала кандидат, затем сохранённый хеш."}
          before={"return password_hash.verify("}
          after={")"}
          options={["password, stored_hash", "stored_hash, password", "password_hash, password"]}
          answer={"password, stored_hash"}
          explanation={"Первый аргумент — открытый кандидат текущего входа, второй — verifier из базы."}
        />
      </Section>

      <Section
        number="06"
        title={"Регистрация и вход используют функции по-разному"}
      >
        <Lead>
          {"При регистрации пароль преобразуется один раз перед сохранением. При входе новый кандидат сравнивается с уже сохранённым хешем — новый хеш для прямого сравнения строк создавать нельзя."}
        </Lead>

        <div className="lesson-practice-steps">
          <h3>{"Главный вопрос сцены"}</h3>
          <p>
            {"Раздел «Регистрация и вход используют функции по-разному» показывает, как правило влияет на password, password_hash, salt и verify_password."}
          </p>

          <h3>{"Что нужно уметь объяснить"}</h3>
          <p>
            {"Назовите входные данные, выполняемую проверку, успешный результат и ожидаемый отказ до перехода к следующей сцене."}
          </p>

          <h3>{"Граница сложности"}</h3>
          <p>
            {"Не изобретайте алгоритм и не сравнивайте новый salted hash с сохранённой строкой."}
          </p>
        </div>

        <BranchExplorer
          code={"# регистрация\nstored_hash = hash_password(password)\n\n# вход\nif verify_password(password, stored_hash):\n    return authenticated_user\nreturn None"}
          scenarios={[
            { label: "регистрация", activeLine: 1, output: "создан новый salted hash" },
            { label: "верный пароль", activeLine: 4, output: "authenticated_user" },
            { label: "неверный пароль", activeLine: 6, output: "None" }
          ]}
        />

        <BugHunt
          code={"candidate_hash = hash_password(login.password)\nif candidate_hash == user.password_hash:\n    return user"}
          question={"Почему сравнение почти всегда ложно?"}
          options={["Новый hash получает новый salt", "Строки нельзя сравнивать", "password_hash всегда None"]}
          correctIndex={0}
          explanation={"Для salted hashes используют verify, а не повторное хеширование и сравнение строк."}
          fix={"if verify_password(login.password, user.password_hash):\n    return user"}
        />

        <Callout tone="info">
          {"Password service не знает о FastAPI, Session и HTTPException. Он получает строки и возвращает строку или bool."}
        </Callout>
      </Section>

      <Section
        number="07"
        title={"Тестируем контракт, а не случайную строку"}
      >
        <Lead>
          {"Из-за salt точная строка хеша меняется. Тест должен проверять полезное поведение: исходный пароль проходит, неверный — нет, открытый пароль не сохраняется как результат."}
        </Lead>

        <div className="lesson-practice-steps">
          <h3>{"Главный вопрос сцены"}</h3>
          <p>
            {"Раздел «Тестируем контракт, а не случайную строку» показывает, как правило влияет на password, password_hash, salt и verify_password."}
          </p>

          <h3>{"Что нужно уметь объяснить"}</h3>
          <p>
            {"Назовите входные данные, выполняемую проверку, успешный результат и ожидаемый отказ до перехода к следующей сцене."}
          </p>

          <h3>{"Граница сложности"}</h3>
          <p>
            {"Не изобретайте алгоритм и не сравнивайте новый salted hash с сохранённой строкой."}
          </p>
        </div>

        <CodeBlock
          caption={"tests/test_passwords.py"}
          code={"from app.security.passwords import hash_password, verify_password\n\n\ndef test_hash_and_verify_password():\n    raw = \"correct-horse-42\"\n\n    stored_hash = hash_password(raw)\n\n    assert stored_hash != raw\n    assert verify_password(raw, stored_hash) is True\n    assert verify_password(\"wrong-password\", stored_hash) is False\n\n\ndef test_same_password_gets_different_hashes():\n    first = hash_password(\"same-password\")\n    second = hash_password(\"same-password\")\n\n    assert first != second\n    assert verify_password(\"same-password\", first)\n    assert verify_password(\"same-password\", second)"}
        />

        <CompareSolutions
          question={"Какой тест устойчив к случайному salt?"}
          left={{
            title: "Сравнить с фиксированной строкой",
            code: "assert hash_password(\"abc\") == \"$argon2id$fixed...\"",
            note: "Зависит от salt и конкретных параметров.",
          }}
          right={{
            title: "Проверить поведение",
            code: "assert verify_password(\"abc\", hash_password(\"abc\"))",
            note: "Фиксирует контракт, а не внутреннюю строку.",
          }}
          preferred="right"
          explanation={"Тесты должны позволять библиотеке безопасно менять случайные данные и параметры."}
        />

        <TrueFalse
          statement={
            <>
              {"Логировать первые восемь символов пароля безопасно, потому что это не весь пароль."}
            </>
          }
          isTrue={false}
          explanation={"Любая часть секрета увеличивает риск и не нужна для диагностики входа."}
        />
      </Section>

      <Section
        number="08"
        title={"Контрольная точка: безопасный жизненный цикл"}
      >
        <Lead>
          {"Пароль должен существовать открытым минимально необходимое время и не выходить за входную границу, password service и вызов verify."}
        </Lead>

        <CodeSequence
          title={"Соберите путь регистрации"}
          prompt={"Расположите действия до сохранения User."}
          pieces={[
            { id: "receive", code: "получить UserCreate" },
            { id: "validate", code: "проверить ограничения password" },
            { id: "hash", code: "вызвать hash_password" },
            { id: "model", code: "создать UserModel(password_hash=...)" },
            { id: "commit", code: "сохранить и вернуть UserRead" },
            { id: "wrong", code: "записать password в БД", note: "секрет нельзя хранить открытым" }
          ]}
          correctOrder={["receive", "validate", "hash", "model", "commit"]}
          explanation={"Открытый пароль заменяется хешем до создания сохраняемой модели."}
        />

        <div className="lesson-check-group">
          <QuizCard
            question={"Что нужно сохранять в users?"}
            options={["password_hash", "открытый password", "повтор пароля"]}
            correctIndex={0}
            explanation={"Исходный пароль не должен оставаться в базе."}
          />
          <QuizCard
            question={"Зачем нужен salt?"}
            options={["делать одинаковые пароли разными в хранилище", "расшифровать пароль", "сократить пароль"]}
            correctIndex={0}
            explanation={"Уникальный salt препятствует одинаковым отпечаткам и готовым таблицам совпадений."}
          />
          <QuizCard
            question={"Как проверить пароль при входе?"}
            options={["verify_password(candidate, stored_hash)", "hash(candidate) == stored_hash", "candidate == stored_hash"]}
            correctIndex={0}
            explanation={"Функция verify учитывает salt и параметры сохранённого формата."}
          />
          <QuizCard
            question={"Что должен проверять тест хеширования?"}
            options={["поведение verify", "точную случайную строку", "наличие пароля в логах"]}
            correctIndex={0}
            explanation={"Полезный контракт — правильное принятие и отклонение кандидатов."}
          />
        </div>

        <KeyTakeaways
          points={[
            <>{"Открытый пароль нельзя сохранять, логировать или возвращать."}</>,
            <>{"Кодирование, шифрование и password hashing решают разные задачи."}</>,
            <>{"Salt делает хеши одинаковых паролей различными."}</>,
            <>{"Специализированный алгоритм намеренно дорог для массового перебора."}</>,
            <>{"pwdlib скрывается за маленькими функциями hash_password и verify_password."}</>,
            <>{"Salted hashes проверяются через verify, а не сравнением новых строк."}</>
          ]}
        />

        <PracticeCta text={"Установите pwdlib с Argon2, создайте app/security/passwords.py и тесты: верный пароль, неверный пароль, разные хеши одного значения и отсутствие открытого пароля в результате."} />
      </Section>
    </RichLesson>
  );
}

// 97. Регистрация
export function Lesson97({ module }: LessonProps) {
  return (
    <RichLesson>
      <RichHero
        variant="project"
        chip={module ?? BLOCK_TITLE}
        title={"Регистрация"}
        intro={"Соберём POST /auth/register как прозрачный конвейер: Pydantic проверяет форму, сервис нормализует email, база гарантирует уникальность, пароль хешируется до ORM-модели, а клиент получает только UserRead."}
        tags={[
          { 
            icon: <FileText size={14} />,
            label: "POST /auth/register",
          },
          { 
            icon: <ShieldCheck size={14} />,
            label: "201 · 409 · безопасный ответ",
          }
        ]}
      />
      <TheoryBridge lesson={97} />

      <Section
        number="01"
        title={"Регистрация — операция создания пользователя"}
      >
        <Lead>
          {"Регистрация похожа на создание задачи, но цена ошибки выше: в запросе присутствует секрет, email должен быть уникальным, а ответ обязан быть уже очищенным от внутренних полей."}
        </Lead>

        <div className="lesson-route">
          <ol>
            <li>
              <strong>Валидация:</strong> проверить формат email, длину username и password до вызова сервиса.
            </li>
            <li>
              <strong>Нормализация:</strong> привести email к единой форме, чтобы регистр не создавал псевдодубликаты.
            </li>
            <li>
              <strong>Уникальность:</strong> выполнить понятную предварительную проверку и сохранить ограничение базы.
            </li>
            <li>
              <strong>Хеширование:</strong> создать password_hash до построения ORM-модели.
            </li>
            <li>
              <strong>Безопасный ответ:</strong> вернуть 201 и UserRead без password/password_hash.
            </li>
          </ol>
        <p>Endpoint остаётся тонким, а транзакционная операция живёт в сервисе.</p>
        </div>

        <TypeCards>
          <TypeCard
            badge={"201"}
            title={"Создано"}
            code={"HTTP_201_CREATED"}
          >
            {"Новая запись успешно сохранена и представлена через response schema."}
          </TypeCard>

          <TypeCard
            badge={"422"}
            badgeTone="float"
            title={"Неверная форма"}
            code={"invalid email / short password"}
          >
            {"Pydantic отклоняет данные до предметной операции."}
          </TypeCard>

          <TypeCard
            badge={"409"}
            badgeTone="str"
            title={"Конфликт"}
            code={"HTTP_409_CONFLICT"}
          >
            {"Email уже занят и новая запись нарушает уникальность."}
          </TypeCard>
        </TypeCards>

        <Callout tone="info">
          {"Регистрация создаёт аккаунт, но не обязана сразу создавать session или token. Это отдельное решение следующего слоя."}
        </Callout>
      </Section>

      <Section
        number="02"
        title={"Входная схема останавливает плохую форму"}
      >
        <Lead>
          {"Pydantic проверяет структуру, типы и локальные ограничения. Он не ходит в базу за уникальностью — эта проверка относится к сервису."}
        </Lead>

        <div className="lesson-practice-steps">
          <h3>{"Главный вопрос сцены"}</h3>
          <p>
            {"Раздел «Входная схема останавливает плохую форму» показывает, как правило влияет на UserCreate → service → Session → UserRead."}
          </p>

          <h3>{"Что нужно уметь объяснить"}</h3>
          <p>
            {"Назовите входные данные, выполняемую проверку, успешный результат и ожидаемый отказ до перехода к следующей сцене."}
          </p>

          <h3>{"Граница сложности"}</h3>
          <p>
            {"Не смешивайте создание аккаунта с выдачей cookie или JWT: регистрация заканчивается безопасной записью пользователя."}
          </p>
        </div>

        <CodeBlock
          caption={"UserCreate с Pydantic v2"}
          code={"from pydantic import BaseModel, EmailStr, Field, field_validator\n\n\nclass UserCreate(BaseModel):\n    email: EmailStr\n    username: str = Field(min_length=2, max_length=50)\n    password: str = Field(min_length=8, max_length=128)\n\n    @field_validator(\"username\")\n    @classmethod\n    def username_must_not_be_blank(cls, value: str) -> str:\n        cleaned = value.strip()\n        if not cleaned:\n            raise ValueError(\"username не должен быть пустым\")\n        return cleaned"}
        />

        <BranchExplorer
          code={"payload = UserCreate.model_validate(data)\nif email_has_bad_format:\n    return 422\nif username_is_blank:\n    return 422\nif password_is_short:\n    return 422\nreturn payload"}
          scenarios={[
            { label: "email = bad", activeLine: 2, output: "422 до сервиса" },
            { label: "username = пробелы", activeLine: 4, output: "422 до сервиса" },
            { label: "корректная форма", activeLine: 7, output: "UserCreate" }
          ]}
        />

        <TrueFalse
          statement={
            <>
              {"Field(min_length=8) доказывает, что пароль устойчив к подбору."}
            </>
          }
          isTrue={false}
          explanation={"Это только минимальное формальное ограничение. Реальная стойкость зависит от значения, политики и password hashing."}
        />
      </Section>

      <Section
        number="03"
        title={"Нормализация email и предварительный поиск"}
      >
        <Lead>
          {"До запроса к базе email приводится к согласованной форме. Иначе User@Example.com и user@example.com могут стать разными прикладными идентификаторами."}
        </Lead>

        <div className="lesson-practice-steps">
          <h3>{"Главный вопрос сцены"}</h3>
          <p>
            {"Раздел «Нормализация email и предварительный поиск» показывает, как правило влияет на UserCreate → service → Session → UserRead."}
          </p>

          <h3>{"Что нужно уметь объяснить"}</h3>
          <p>
            {"Назовите входные данные, выполняемую проверку, успешный результат и ожидаемый отказ до перехода к следующей сцене."}
          </p>

          <h3>{"Граница сложности"}</h3>
          <p>
            {"Не смешивайте создание аккаунта с выдачей cookie или JWT: регистрация заканчивается безопасной записью пользователя."}
          </p>
        </div>

        <CodeBlock
          caption={"нормализация и поиск"}
          code={"from sqlalchemy import select\nfrom sqlalchemy.orm import Session\n\n\ndef normalize_email(email: str) -> str:\n    return email.strip().lower()\n\n\ndef get_user_by_email(db: Session, email: str) -> UserModel | None:\n    statement = select(UserModel).where(UserModel.email == email)\n    return db.scalar(statement)"}
        />

        <StepThrough
          code={"email = normalize_email(payload.email)\nexisting = get_user_by_email(db, email)\nif existing is not None:\n    raise EmailAlreadyExists\npassword_hash = hash_password(payload.password)"}
          steps={[
            { line: 0, note: "Email принимает единую форму до поиска и сохранения.", vars: {"email": "\"user@example.com\""} },
            { line: 1, note: "Session выполняет SELECT по индексированной колонке.", vars: {"existing": "None"} },
            { line: 2, note: "Ветка конфликта проверяется до дорогого хеширования.", vars: {"condition": "False"} },
            { line: 4, note: "Только свободный email доходит до password service.", vars: {"password_hash": "$argon2id$..."} }
          ]}
        />

        <RecallCard
          question={"Почему предварительный SELECT полезен, хотя база всё равно имеет unique constraint?"}
          answer={
            <p>
              {"Он позволяет вернуть понятный прикладной конфликт в обычном последовательном сценарии. Constraint остаётся страховкой от гонки между SELECT и commit."}
            </p>
          }
        />
      </Section>

      <Section
        number="04"
        title={"Явное преобразование UserCreate в UserModel"}
      >
        <Lead>
          {"Не нужно передавать model_dump() целиком: во входной схеме есть password, а в ORM-модели требуется password_hash. Явное сопоставление делает границу заметной."}
        </Lead>

        <div className="lesson-practice-steps">
          <h3>{"Главный вопрос сцены"}</h3>
          <p>
            {"Раздел «Явное преобразование UserCreate в UserModel» показывает, как правило влияет на UserCreate → service → Session → UserRead."}
          </p>

          <h3>{"Что нужно уметь объяснить"}</h3>
          <p>
            {"Назовите входные данные, выполняемую проверку, успешный результат и ожидаемый отказ до перехода к следующей сцене."}
          </p>

          <h3>{"Граница сложности"}</h3>
          <p>
            {"Не смешивайте создание аккаунта с выдачей cookie или JWT: регистрация заканчивается безопасной записью пользователя."}
          </p>
        </div>

        <CompareSolutions
          question={"Как безопаснее построить ORM-объект?"}
          left={{
            title: "Распаковать весь payload",
            code: "user = UserModel(**payload.model_dump())",
            note: "ORM не ждёт password, а секрет может попасть в неподходящее место.",
          }}
          right={{
            title: "Назвать поля явно",
            code: "user = UserModel(\n    email=email,\n    username=payload.username,\n    password_hash=hash_password(payload.password),\n)",
            note: "Видно преобразование секрета и серверные defaults.",
          }}
          preferred="right"
          explanation={"На чувствительной границе явность важнее одной короткой строки."}
        />

        <CodeBlock
          caption={"создание модели"}
          code={"user = UserModel(\n    email=email,\n    username=payload.username,\n    password_hash=hash_password(payload.password),\n    role=\"user\",\n    is_active=True,\n)\n\ndb.add(user)"}
        />

        <FillBlank
          prompt={"Выберите значение для password_hash."}
          before={"password_hash="}
          after={","}
          options={["hash_password(payload.password)", "payload.password", "payload.model_dump()"]}
          answer={"hash_password(payload.password)"}
          explanation={"В сохраняемую модель передаётся только результат password hashing."}
        />
      </Section>

      <Section
        number="05"
        title={"Commit, IntegrityError и обязательный rollback"}
      >
        <Lead>
          {"Два параллельных запроса могут пройти предварительный SELECT почти одновременно. Unique constraint остановит второй commit, после чего Session нужно вернуть в рабочее состояние."}
        </Lead>

        <div className="lesson-practice-steps">
          <h3>{"Главный вопрос сцены"}</h3>
          <p>
            {"Раздел «Commit, IntegrityError и обязательный rollback» показывает, как правило влияет на UserCreate → service → Session → UserRead."}
          </p>

          <h3>{"Что нужно уметь объяснить"}</h3>
          <p>
            {"Назовите входные данные, выполняемую проверку, успешный результат и ожидаемый отказ до перехода к следующей сцене."}
          </p>

          <h3>{"Граница сложности"}</h3>
          <p>
            {"Не смешивайте создание аккаунта с выдачей cookie или JWT: регистрация заканчивается безопасной записью пользователя."}
          </p>
        </div>

        <CodeBlock
          caption={"транзакционная часть сервиса"}
          code={"from sqlalchemy.exc import IntegrityError\n\n\ndef create_user(db: Session, payload: UserCreate) -> UserModel:\n    email = normalize_email(str(payload.email))\n\n    if get_user_by_email(db, email) is not None:\n        raise EmailAlreadyExists\n\n    user = UserModel(\n        email=email,\n        username=payload.username,\n        password_hash=hash_password(payload.password),\n    )\n    db.add(user)\n\n    try:\n        db.commit()\n    except IntegrityError as error:\n        db.rollback()\n        raise EmailAlreadyExists from error\n\n    db.refresh(user)\n    return user"}
        />

        <BugHunt
          code={"try:\n    db.commit()\nexcept IntegrityError:\n    raise HTTPException(status_code=409)"}
          question={"Чего не хватает после неудачного commit?"}
          options={["db.rollback()", "ещё одного db.add()", "повторного hash_password()"]}
          correctIndex={0}
          explanation={"Session остаётся в failed transaction и не должна использоваться до rollback."}
          fix={"try:\n    db.commit()\nexcept IntegrityError as error:\n    db.rollback()\n    raise EmailAlreadyExists from error"}
        />

        <Callout>
          {"Сервис переводит SQLAlchemy-ошибку в прикладную EmailAlreadyExists. Router позже переводит прикладную ошибку в HTTP 409."}
        </Callout>
      </Section>

      <Section
        number="06"
        title={"Тонкий endpoint и безопасный response_model"}
      >
        <Lead>
          {"Router связывает HTTP с сервисом: получает payload и Session, вызывает use case, переводит ожидаемый конфликт и возвращает результат через UserRead."}
        </Lead>

        <div className="lesson-practice-steps">
          <h3>{"Главный вопрос сцены"}</h3>
          <p>
            {"Раздел «Тонкий endpoint и безопасный response_model» показывает, как правило влияет на UserCreate → service → Session → UserRead."}
          </p>

          <h3>{"Что нужно уметь объяснить"}</h3>
          <p>
            {"Назовите входные данные, выполняемую проверку, успешный результат и ожидаемый отказ до перехода к следующей сцене."}
          </p>

          <h3>{"Граница сложности"}</h3>
          <p>
            {"Не смешивайте создание аккаунта с выдачей cookie или JWT: регистрация заканчивается безопасной записью пользователя."}
          </p>
        </div>

        <CodeBlock
          caption={"app/routers/auth.py"}
          code={"from typing import Annotated\n\nfrom fastapi import APIRouter, Depends, HTTPException, status\nfrom sqlalchemy.orm import Session\n\nfrom app.database import get_db\nfrom app.schemas.user import UserCreate, UserRead\nfrom app.services.users import EmailAlreadyExists, create_user\n\n\nrouter = APIRouter(prefix=\"/auth\", tags=[\"auth\"])\nDbSession = Annotated[Session, Depends(get_db)]\n\n\n@router.post(\n    \"/register\",\n    response_model=UserRead,\n    status_code=status.HTTP_201_CREATED,\n)\ndef register_user(payload: UserCreate, db: DbSession):\n    try:\n        return create_user(db, payload)\n    except EmailAlreadyExists as error:\n        raise HTTPException(\n            status_code=status.HTTP_409_CONFLICT,\n            detail=\"Email уже зарегистрирован\",\n        ) from error"}
        />

        <TypeCards>
          <TypeCard
            badge={"router"}
            title={"HTTP-контракт"}
            code={"POST /auth/register"}
          >
            {"Path, status code, response model и перевод ожидаемой ошибки."}
          </TypeCard>

          <TypeCard
            badge={"service"}
            badgeTone="float"
            title={"Use case"}
            code={"create_user(db, payload)"}
          >
            {"Нормализация, уникальность, хеширование и транзакция."}
          </TypeCard>

          <TypeCard
            badge={"schema"}
            badgeTone="str"
            title={"Фильтр ответа"}
            code={"response_model=UserRead"}
          >
            {"Разрешает только публичные поля UserRead."}
          </TypeCard>
        </TypeCards>

        <TrueFalse
          statement={
            <>
              {"Endpoint регистрации должен сам создавать JWT, иначе пользователь не считается созданным."}
            </>
          }
          isTrue={false}
          explanation={"Создание аккаунта и выдача способа доступа являются разными операциями и могут иметь разные правила."}
        />
      </Section>

      <Section
        number="07"
        title={"Интеграционные проверки регистрации"}
      >
        <Lead>
          {"Тесты проходят через HTTP-границу и отдельную тестовую базу. Они проверяют не внутренние строки хеша, а статус, сохранённые данные и отсутствие секретов в JSON."}
        </Lead>

        <div className="lesson-practice-steps">
          <h3>{"Главный вопрос сцены"}</h3>
          <p>
            {"Раздел «Интеграционные проверки регистрации» показывает, как правило влияет на UserCreate → service → Session → UserRead."}
          </p>

          <h3>{"Что нужно уметь объяснить"}</h3>
          <p>
            {"Назовите входные данные, выполняемую проверку, успешный результат и ожидаемый отказ до перехода к следующей сцене."}
          </p>

          <h3>{"Граница сложности"}</h3>
          <p>
            {"Не смешивайте создание аккаунта с выдачей cookie или JWT: регистрация заканчивается безопасной записью пользователя."}
          </p>
        </div>

        <CodeBlock
          caption={"tests/test_register.py"}
          code={"def test_register_user(client, db_session):\n    response = client.post(\n        \"/auth/register\",\n        json={\n            \"email\": \"student@example.com\",\n            \"username\": \"student\",\n            \"password\": \"safe-password-42\",\n        },\n    )\n\n    assert response.status_code == 201\n    body = response.json()\n    assert body[\"email\"] == \"student@example.com\"\n    assert \"password\" not in body\n    assert \"password_hash\" not in body\n\n    user = get_user_by_email(db_session, \"student@example.com\")\n    assert user is not None\n    assert user.password_hash != \"safe-password-42\"\n    assert verify_password(\"safe-password-42\", user.password_hash)"}
        />

        <MethodGrid
          rows={[
            [<>{"201"}</>, <>{"валидный пользователь создан"}</>],
            [<>{"422"}</>, <>{"неверный email, короткий password или пустой username"}</>],
            [<>{"409"}</>, <>{"повторный email отклонён"}</>],
            [<>{"response"}</>, <>{"нет password и password_hash"}</>],
            [<>{"database"}</>, <>{"email нормализован, пароль проверяется через verify"}</>]
          ]}
        />

        <TerminalDemo
          title={"ручная проверка"}
          lines={[
            { cmd: "pytest tests/test_register.py -q" },
            { out: "4 passed" },
            { cmd: "curl -X POST http://127.0.0.1:8000/auth/register ..." },
            { out: "HTTP/1.1 201 Created" }
          ]}
        />
      </Section>

      <Section
        number="08"
        title={"Контрольная точка: полный конвейер регистрации"}
      >
        <Lead>
          {"Ученик должен проследить одно значение password и доказать, что оно исчезает до ORM-модели, базы и ответа."}
        </Lead>

        <CodeSequence
          title={"Соберите регистрацию"}
          prompt={"Расположите этапы от HTTP до ответа."}
          pieces={[
            { id: "schema", code: "UserCreate валидирует форму" },
            { id: "normalize", code: "нормализовать email" },
            { id: "lookup", code: "проверить существующего пользователя" },
            { id: "hash", code: "вычислить password_hash" },
            { id: "commit", code: "add → commit → refresh" },
            { id: "response", code: "вернуть UserRead и 201" },
            { id: "wrong", code: "вернуть model_dump с password", note: "секрет не должен выходить наружу" }
          ]}
          correctOrder={["schema", "normalize", "lookup", "hash", "commit", "response"]}
          explanation={"Каждая граница выполняет одну роль и не передаёт открытый пароль дальше необходимого."}
        />

        <div className="lesson-check-group">
          <QuizCard
            question={"Какой статус возвращает успешная регистрация?"}
            options={["201", "204", "409"]}
            correctIndex={0}
            explanation={"Операция создала новый ресурс пользователя."}
          />
          <QuizCard
            question={"Кто окончательно защищает уникальность email?"}
            options={["unique constraint", "field_validator", "response_model"]}
            correctIndex={0}
            explanation={"Constraint работает и при конкурирующих транзакциях."}
          />
          <QuizCard
            question={"Что делать после IntegrityError на commit?"}
            options={["rollback", "refresh", "ещё раз add"]}
            correctIndex={0}
            explanation={"Session должна выйти из failed transaction."}
          />
          <QuizCard
            question={"Зачем нужен response_model=UserRead?"}
            options={["ограничить публичные поля", "хешировать password", "создать таблицу"]}
            correctIndex={0}
            explanation={"Response schema предотвращает выдачу внутреннего состояния."}
          />
        </div>

        <KeyTakeaways
          points={[
            <>{"Pydantic проверяет форму, а сервис выполняет прикладную регистрацию."}</>,
            <>{"Email нормализуется до поиска и сохранения."}</>,
            <>{"Предварительный SELECT улучшает ошибку, unique constraint гарантирует правило."}</>,
            <>{"Открытый password заменяется password_hash до ORM-модели."}</>,
            <>{"IntegrityError требует rollback."}</>,
            <>{"Router переводит прикладной конфликт в 409 и возвращает UserRead."}</>
          ]}
        />

        <PracticeCta text={"Реализуйте POST /auth/register, сервис create_user и интеграционные тесты на 201, 422, 409, нормализацию email, Argon2 verify и отсутствие password/password_hash в ответе."} />
      </Section>
    </RichLesson>
  );
}

// 98. Проверка credentials
export function Lesson98({ module }: LessonProps) {
  return (
    <RichLesson>
      <RichHero
        variant="project"
        chip={module ?? BLOCK_TITLE}
        title={"Проверка credentials"}
        intro={"Соберём authenticate_user как отдельную функцию: найдём пользователя, проверим активность и password hash, но ещё не будем создавать cookie или JWT. Внешняя ошибка останется одинаковой для неизвестного email и неверного пароля."}
        tags={[
          { 
            icon: <KeyRound size={14} />,
            label: "email + password → User | None",
          },
          { 
            icon: <ListChecks size={14} />,
            label: "единая ошибка входа",
          }
        ]}
      />
      <TheoryBridge lesson={98} />

      <Section
        number="01"
        title={"Аутентификация отделяется от выдачи доступа"}
      >
        <Lead>
          {"Проверка credentials отвечает только на один вопрос: соответствует ли пара email/password активному пользователю. Создание session, cookie или token является следующим самостоятельным действием."}
        </Lead>

        <div className="lesson-route">
          <ol>
            <li>
              <strong>Нормализовать email:</strong> использовать ту же форму, что и при регистрации.
            </li>
            <li>
              <strong>Найти User:</strong> выполнить SELECT по уникальному индексированному email.
            </li>
            <li>
              <strong>Проверить password:</strong> вызвать verify_password с кандидатом и сохранённым хешем.
            </li>
            <li>
              <strong>Проверить состояние:</strong> не аутентифицировать деактивированный аккаунт.
            </li>
            <li>
              <strong>Вернуть результат:</strong> User при успехе или None при любом недействительном наборе credentials.
            </li>
          </ol>
        <p>После занятия сервис готов стать основанием cookie-session и token login.</p>
        </div>

        <CompareSolutions
          question={"Какая ответственность должна остаться в authenticate_user?"}
          left={{
            title: "Проверить и выдать JWT",
            code: "return create_access_token(user)",
            note: "Смешиваются проверка credentials и конкретный способ доступа.",
          }}
          right={{
            title: "Вернуть User или None",
            code: "return user if valid else None",
            note: "Следующий слой сам решит, создать session, token или отказ.",
          }}
          preferred="right"
          explanation={"Чистая граница позволяет переиспользовать аутентификацию в разных механизмах."}
        />

        <Callout tone="info">
          {"Успешный authenticate_user ещё не означает авторизацию любой операции: после него остаются role, owner_id и другие правила доступа."}
        </Callout>
      </Section>

      <Section
        number="02"
        title={"Одинаковая нормализация регистрации и входа"}
      >
        <Lead>
          {"Если регистрация сохраняет email в нижнем регистре, вход обязан искать тем же способом. Два разных правила нормализации создают аккаунты, в которые нельзя войти."}
        </Lead>

        <div className="lesson-practice-steps">
          <h3>{"Главный вопрос сцены"}</h3>
          <p>
            {"Раздел «Одинаковая нормализация регистрации и входа» показывает, как правило влияет на email/password → authenticate_user → UserModel | None."}
          </p>

          <h3>{"Что нужно уметь объяснить"}</h3>
          <p>
            {"Назовите входные данные, выполняемую проверку, успешный результат и ожидаемый отказ до перехода к следующей сцене."}
          </p>

          <h3>{"Граница сложности"}</h3>
          <p>
            {"Не добавляйте session и token внутрь проверки credentials: это следующий слой проекта."}
          </p>
        </div>

        <CodeBlock
          caption={"единая функция нормализации"}
          code={"def normalize_email(email: str) -> str:\n    return email.strip().lower()\n\n\ndef get_user_by_email(db: Session, email: str) -> UserModel | None:\n    normalized = normalize_email(email)\n    statement = select(UserModel).where(UserModel.email == normalized)\n    return db.scalar(statement)"}
        />

        <PredictOutput
          code={"print(normalize_email(\"  Student@Example.COM \"))"}
          output={"student@example.com"}
          hint={"Сначала удаляются пробелы по краям, затем меняется регистр."}
        />

        <TrueFalse
          statement={
            <>
              {"Вход может использовать email как есть, потому что SQLAlchemy сам нормализует строки."}
            </>
          }
          isTrue={false}
          explanation={"ORM выполняет сравнение, но не придумывает прикладное правило регистра и пробелов."}
        />
      </Section>

      <Section
        number="03"
        title={"Не раскрываем, какая часть credentials неверна"}
      >
        <Lead>
          {"Сообщение «такого email нет» помогает перебирать зарегистрированные адреса. Для клиента неизвестный пользователь и неверный пароль должны выглядеть одинаково."}
        </Lead>

        <div className="lesson-practice-steps">
          <h3>{"Главный вопрос сцены"}</h3>
          <p>
            {"Раздел «Не раскрываем, какая часть credentials неверна» показывает, как правило влияет на email/password → authenticate_user → UserModel | None."}
          </p>

          <h3>{"Что нужно уметь объяснить"}</h3>
          <p>
            {"Назовите входные данные, выполняемую проверку, успешный результат и ожидаемый отказ до перехода к следующей сцене."}
          </p>

          <h3>{"Граница сложности"}</h3>
          <p>
            {"Не добавляйте session и token внутрь проверки credentials: это следующий слой проекта."}
          </p>
        </div>

        <CompareSolutions
          question={"Какой внешний ответ безопаснее?"}
          left={{
            title: "Подробности по шагам",
            code: "404: email не найден\n401: пароль неверен",
            note: "Позволяет отличать существующие аккаунты.",
          }}
          right={{
            title: "Единая ошибка",
            code: "401: неверный email или пароль",
            note: "Не подтверждает существование конкретного email.",
          }}
          preferred="right"
          explanation={"Клиенту достаточно знать, что набор credentials не принят."}
        />

        <FlipCards
          cards={[
            { front: <>{"Неизвестный email"}</>, back: <>{"Внешне: 401 и общее сообщение."}</> },
            { front: <>{"Неверный password"}</>, back: <>{"Внешне: тот же 401 и то же сообщение."}</> },
            { front: <>{"Неактивный account"}</>, back: <>{"В учебной модели вход не выдаёт доступ; внешний текст можно оставить общим."}</> },
            { front: <>{"Логи сервера"}</>, back: <>{"Могут хранить безопасную категорию события, но никогда не password."}</> }
          ]}
        />

        <Callout>
          {"Единый текст не решает все side-channel риски, но убирает очевидное перечисление пользователей через API."}
        </Callout>
      </Section>

      <Section
        number="04"
        title={"Функция authenticate_user"}
      >
        <Lead>
          {"Сервис получает Session и две строки. Он не знает HTTP, cookie и JWT; ожидаемые неуспехи выражаются значением None."}
        </Lead>

        <div className="lesson-practice-steps">
          <h3>{"Главный вопрос сцены"}</h3>
          <p>
            {"Раздел «Функция authenticate_user» показывает, как правило влияет на email/password → authenticate_user → UserModel | None."}
          </p>

          <h3>{"Что нужно уметь объяснить"}</h3>
          <p>
            {"Назовите входные данные, выполняемую проверку, успешный результат и ожидаемый отказ до перехода к следующей сцене."}
          </p>

          <h3>{"Граница сложности"}</h3>
          <p>
            {"Не добавляйте session и token внутрь проверки credentials: это следующий слой проекта."}
          </p>
        </div>

        <CodeBlock
          caption={"app/services/auth.py"}
          code={"from sqlalchemy.orm import Session\n\nfrom app.models.user import UserModel\nfrom app.security.passwords import verify_password\nfrom app.services.users import get_user_by_email\n\n\ndef authenticate_user(\n    db: Session,\n    email: str,\n    password: str,\n) -> UserModel | None:\n    user = get_user_by_email(db, email)\n\n    if user is None:\n        return None\n\n    if not verify_password(password, user.password_hash):\n        return None\n\n    if not user.is_active:\n        return None\n\n    return user"}
        />

        <StepThrough
          code={"user = get_user_by_email(db, email)\nif user is None:\n    return None\nif not verify_password(password, user.password_hash):\n    return None\nif not user.is_active:\n    return None\nreturn user"}
          steps={[
            { line: 0, note: "Поиск возвращает ORM-объект или None.", vars: {"user": "UserModel(id=4)"} },
            { line: 1, note: "Неизвестный email завершается без чтения password_hash.", vars: {"condition": "False"} },
            { line: 3, note: "Кандидат проверяется библиотекой против сохранённого хеша.", vars: {"verify": "True"} },
            { line: 5, note: "Серверное состояние аккаунта проверяется отдельно.", vars: {"is_active": "True"} },
            { line: 7, note: "Только полностью прошедший User возвращается вызывающему слою.", vars: {"result": "UserModel(id=4)"} }
          ]}
        />

        <RecallCard
          question={"Почему authenticate_user возвращает None, а не HTTPException?"}
          answer={
            <p>
              {"Сервис описывает прикладной результат и остаётся независимым от HTTP. Router или будущий login use case выберет статус и формат ответа."}
            </p>
          }
        />
      </Section>

      <Section
        number="05"
        title={"HTTP-граница пока не выдаёт session или token"}
      >
        <Lead>
          {"Для учебной проверки можно сделать временный endpoint, который подтверждает корректность credentials без выпуска доступа. В продукте его заменит login с server-side session."}
        </Lead>

        <div className="lesson-practice-steps">
          <h3>{"Главный вопрос сцены"}</h3>
          <p>
            {"Раздел «HTTP-граница пока не выдаёт session или token» показывает, как правило влияет на email/password → authenticate_user → UserModel | None."}
          </p>

          <h3>{"Что нужно уметь объяснить"}</h3>
          <p>
            {"Назовите входные данные, выполняемую проверку, успешный результат и ожидаемый отказ до перехода к следующей сцене."}
          </p>

          <h3>{"Граница сложности"}</h3>
          <p>
            {"Не добавляйте session и token внутрь проверки credentials: это следующий слой проекта."}
          </p>
        </div>

        <CodeBlock
          caption={"учебный endpoint проверки"}
          code={"from fastapi import HTTPException, Response, status\n\n\n@router.post(\"/credentials/check\", status_code=status.HTTP_204_NO_CONTENT)\ndef check_credentials(payload: LoginRequest, db: DbSession):\n    user = authenticate_user(db, str(payload.email), payload.password)\n\n    if user is None:\n        raise HTTPException(\n            status_code=status.HTTP_401_UNAUTHORIZED,\n            detail=\"Неверный email или пароль\",\n        )\n\n    return Response(status_code=status.HTTP_204_NO_CONTENT)"}
        />

        <TypeCards>
          <TypeCard
            badge={"204"}
            title={"Успех без тела"}
            code={"No Content"}
          >
            {"Credentials приняты, но новый ресурс или токен не создаётся."}
          </TypeCard>

          <TypeCard
            badge={"401"}
            badgeTone="float"
            title={"Единый отказ"}
            code={"invalid credentials"}
          >
            {"Неизвестный email, неверный пароль или запрещённое состояние не раскрываются отдельно."}
          </TypeCard>

          <TypeCard
            badge={"next"}
            badgeTone="str"
            title={"Login позже"}
            code={"authenticate → create_session"}
          >
            {"Следующий блок создаст server-side session и установит cookie."}
          </TypeCard>
        </TypeCards>

        <TrueFalse
          statement={
            <>
              {"Endpoint credentials/check является готовым login, потому что возвращает 204."}
            </>
          }
          isTrue={false}
          explanation={"Он ничего не создаёт для последующих запросов. Login должен выдать или установить средство доступа."}
        />
      </Section>

      <Section
        number="06"
        title={"Юнит-тесты четырёх веток"}
      >
        <Lead>
          {"Основной контракт authenticate_user проверяется без HTTP: успешный вход, неизвестный email, неверный password и неактивный пользователь."}
        </Lead>

        <div className="lesson-practice-steps">
          <h3>{"Главный вопрос сцены"}</h3>
          <p>
            {"Раздел «Юнит-тесты четырёх веток» показывает, как правило влияет на email/password → authenticate_user → UserModel | None."}
          </p>

          <h3>{"Что нужно уметь объяснить"}</h3>
          <p>
            {"Назовите входные данные, выполняемую проверку, успешный результат и ожидаемый отказ до перехода к следующей сцене."}
          </p>

          <h3>{"Граница сложности"}</h3>
          <p>
            {"Не добавляйте session и token внутрь проверки credentials: это следующий слой проекта."}
          </p>
        </div>

        <CodeBlock
          caption={"tests/test_authenticate_user.py"}
          code={"def test_authenticate_user_success(db_session, user_factory):\n    user = user_factory(\n        email=\"student@example.com\",\n        password=\"safe-password-42\",\n    )\n\n    result = authenticate_user(\n        db_session,\n        \" STUDENT@example.com \",\n        \"safe-password-42\",\n    )\n\n    assert result is not None\n    assert result.id == user.id\n\n\ndef test_authenticate_user_wrong_password(db_session, user_factory):\n    user_factory(email=\"student@example.com\", password=\"correct-password\")\n\n    result = authenticate_user(\n        db_session,\n        \"student@example.com\",\n        \"wrong-password\",\n    )\n\n    assert result is None"}
        />

        <MethodGrid
          rows={[
            [<>{"success"}</>, <>{"возвращается тот же UserModel"}</>],
            [<>{"unknown email"}</>, <>{"возвращается None"}</>],
            [<>{"wrong password"}</>, <>{"возвращается None"}</>],
            [<>{"inactive user"}</>, <>{"возвращается None"}</>],
            [<>{"normalization"}</>, <>{"регистр и пробелы email не ломают вход"}</>]
          ]}
        />

        <CompareSolutions
          question={"Что лучше проверять в unit test?"}
          left={{
            title: "Текст HTTPException",
            code: "assert error.detail == \"...\"",
            note: "Это ответственность router и HTTP-контракта.",
          }}
          right={{
            title: "User или None",
            code: "assert authenticate_user(...) is None",
            note: "Это прямой контракт сервисной функции.",
          }}
          preferred="right"
          explanation={"Слой тестируется по собственной ответственности."}
        />
      </Section>

      <Section
        number="07"
        title={"Ошибки, которые делают вход опасным"}
      >
        <Lead>
          {"Самая заметная ошибка — сравнение password со строкой хеша. Менее заметные — логирование секрета, разные ответы и отсутствие проверки is_active."}
        </Lead>

        <div className="lesson-practice-steps">
          <h3>{"Главный вопрос сцены"}</h3>
          <p>
            {"Раздел «Ошибки, которые делают вход опасным» показывает, как правило влияет на email/password → authenticate_user → UserModel | None."}
          </p>

          <h3>{"Что нужно уметь объяснить"}</h3>
          <p>
            {"Назовите входные данные, выполняемую проверку, успешный результат и ожидаемый отказ до перехода к следующей сцене."}
          </p>

          <h3>{"Граница сложности"}</h3>
          <p>
            {"Не добавляйте session и token внутрь проверки credentials: это следующий слой проекта."}
          </p>
        </div>

        <BugHunt
          code={"def authenticate_user(user, password):\n    print(f\"login password={password}\")\n    if password == user.password_hash:\n        return user\n    return None"}
          question={"Какие две проблемы находятся в функции?"}
          options={["Пароль логируется и сравнивается с хешем напрямую", "Нельзя использовать return", "Имя user слишком короткое"]}
          correctIndex={0}
          explanation={"Секрет не попадает в логи, а проверка выполняется через verify_password."}
          fix={"def authenticate_user(user, password):\n    if not verify_password(password, user.password_hash):\n        return None\n    if not user.is_active:\n        return None\n    return user"}
        />

        <CodeSequence
          title={"Соберите безопасную диагностику входа"}
          prompt={"Выберите допустимые шаги без записи секрета."}
          pieces={[
            { id: "event", code: "записать событие login_failed" },
            { id: "user", code: "использовать внутренний user_id, если он известен" },
            { id: "request", code: "добавить request/correlation id" },
            { id: "password", code: "записать password для отладки", note: "секрет запрещён" },
            { id: "response", code: "вернуть общее сообщение клиенту" }
          ]}
          correctOrder={["event", "user", "request", "response"]}
          explanation={"Для диагностики достаточно категории события и технического контекста без credentials."}
        />

        <Callout tone="info">
          {"Неуспешный вход является ожидаемым сценарием, но массовые повторения позже потребуют rate limiting и наблюдаемости."}
        </Callout>
      </Section>

      <Section
        number="08"
        title={"Контрольная точка блока 17"}
      >
        <Lead>
          {"StudyHub теперь умеет создать безопасную запись пользователя и проверить credentials. Средство продолжительного доступа намеренно ещё не создано."}
        </Lead>

        <MethodGrid
          rows={[
            [<>{"модель безопасности"}</>, <>{"идентификация → аутентификация → авторизация"}</>],
            [<>{"User"}</>, <>{"ORM-модель, request/response schemas и owner_id"}</>],
            [<>{"password"}</>, <>{"pwdlib + Argon2, hash и verify"}</>],
            [<>{"register"}</>, <>{"201, 422, 409, rollback и безопасный UserRead"}</>],
            [<>{"authenticate_user"}</>, <>{"UserModel | None без cookie/JWT"}</>],
            [<>{"следующий блок"}</>, <>{"server-side session, cookie, TTL и logout"}</>]
          ]}
        />

        <div className="lesson-check-group">
          <QuizCard
            question={"Что возвращает authenticate_user при успехе?"}
            options={["UserModel", "JWT всегда", "password_hash"]}
            correctIndex={0}
            explanation={"Способ выдачи доступа остаётся следующему слою."}
          />
          <QuizCard
            question={"Какой внешний ответ нужен для неизвестного email и неверного пароля?"}
            options={["одинаковый 401", "404 и 401", "201"]}
            correctIndex={0}
            explanation={"API не должен подтверждать существование аккаунта через разные тексты."}
          />
          <QuizCard
            question={"Что проверяется после verify_password?"}
            options={["is_active", "длина таблицы", "owner_id всех задач"]}
            correctIndex={0}
            explanation={"Неактивная учётная запись не должна получить успешный результат входа."}
          />
          <QuizCard
            question={"Почему сервис не создаёт cookie?"}
            options={["проверка credentials отделена от механизма доступа", "cookie запрещены в FastAPI", "Session не умеет commit"]}
            correctIndex={0}
            explanation={"Это позволяет использовать один сервис для sessions и tokens."}
          />
        </div>

        <KeyTakeaways
          points={[
            <>{"Регистрация и вход используют одно правило нормализации email."}</>,
            <>{"authenticate_user ищет пользователя, проверяет password hash и is_active."}</>,
            <>{"Неизвестный email и неверный пароль получают одинаковый внешний отказ."}</>,
            <>{"Сервис возвращает UserModel или None и не зависит от HTTP."}</>,
            <>{"Проверка credentials не равна выдаче session или token."}</>,
            <>{"Блок готовит прямой переход к server-side sessions."}</>
          ]}
        />

        <PracticeCta text={"Реализуйте authenticate_user и временный credentials/check, добавьте unit-тесты пяти веток и integration-тесты 204/401. Убедитесь, что пароль не логируется, а session и JWT ещё не создаются."} />
      </Section>
    </RichLesson>
  );
}
