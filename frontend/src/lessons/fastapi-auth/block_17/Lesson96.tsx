import { LockKeyhole, ShieldCheck } from "lucide-react";
import { BranchExplorer, BugHunt, Callout, CodeBlock, CodeSequence, CompareSolutions, FillBlank, KeyTakeaways, Lead, MatchPairs, MethodGrid, PracticeCta, PredictOutput, QuizCard, RecallCard, RichHero, RichLesson, Section, StepThrough, TerminalDemo, TrueFalse, TypeCard, TypeCards } from "../../shared";
import { TheoryBridge } from "../../shared";
const BLOCK_TITLE = "Блок 17 · Пользователь и основы безопасности";

type LessonProps = { module?: string };

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
      <TheoryBridge link={"Модель User уже имеет password_hash, теперь открытый password нужно безопасно преобразовать и проверять через готовую библиотеку."} boundary={"Новый salted hash нельзя сравнивать строкой с сохранённым; используется verify_password."} />

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
