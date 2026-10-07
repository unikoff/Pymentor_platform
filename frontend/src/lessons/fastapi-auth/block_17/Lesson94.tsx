import { KeyRound, Layers } from "lucide-react";
import { BranchExplorer, BugHunt, Callout, CodeBlock, CodeSequence, CompareSolutions, FlipCards, KeyTakeaways, Lead, MatchPairs, MethodGrid, PracticeCta, QuizCard, RecallCard, RichHero, RichLesson, Section, StepThrough, TerminalDemo, TrueFalse, TypeCard, TypeCards } from "../../shared";
import { TheoryBridge } from "../../shared";
const BLOCK_TITLE = "Блок 17 · Пользователь и основы безопасности";

type LessonProps = { module?: string };

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
      <TheoryBridge link={"Три уровня безопасности определены, поэтому можно сравнить способы доставки и проверки credentials по одним критериям."} boundary={"Cookie, Bearer и JWT не являются синонимами: транспорт, формат значения и серверное состояние проектируются отдельно."} />

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
