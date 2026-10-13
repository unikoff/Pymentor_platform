import { KeyRound, ListChecks } from "lucide-react";
import { BugHunt, Callout, CodeBlock, CodeSequence, CompareSolutions, FlipCards, KeyTakeaways, Lead, MethodGrid, PracticeCta, PredictOutput, QuizCard, RecallCard, RichHero, RichLesson, Section, StepThrough, TrueFalse, TypeCard, TypeCards } from "../../shared";
import { TheoryBridge } from "../../shared";
const BLOCK_TITLE = "Блок 17 · Пользователь и основы безопасности";

type LessonProps = { module?: string };

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
      <TheoryBridge link={"После регистрации можно проверить новый набор credentials: найти User, проверить hash и состояние аккаунта."} boundary={"authenticate_user ещё не создаёт cookie или JWT; выдача продолжительного доступа начинается в следующем блоке."} />

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
