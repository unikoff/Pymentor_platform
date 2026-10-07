import { Braces, GitBranch } from "lucide-react";
import { BugHunt, Callout, CodeBlock, CodeSequence, CompareSolutions, FillBlank, KeyTakeaways, Lead, PracticeCta, QuizCard, RecallCard, RichHero, RichLesson, Section, TrueFalse } from "../../shared";
const BLOCK_TITLE = "Этап 4 · Блок 13 · FastAPI как цельное приложение";

export function Lesson71({ module }: { module?: string }) {
  return (
    <RichLesson>
      <RichHero
        variant="project"
        chip={module ?? BLOCK_TITLE}
        title={"Annotated и цепочки зависимостей"}
        intro={"Сделаем сигнатуры читаемее через Annotated, создадим повторно используемые aliases и соберём короткую цепочку get_settings → require_api_mode → endpoint."}
        tags={[
          { icon: <Braces size={14} />, label: "Annotated aliases" },
          { icon: <GitBranch size={14} />, label: "sub-dependencies" },
        ]}
      />

      <Section number="01" title={"Почему старая сигнатура становится шумной"}>
        <Lead>
          {"Форма parameter: Type = Depends(provider) работает, но смешивает Python-тип и механизм FastAPI в default. При нескольких dependencies сигнатура становится труднее читать."}
        </Lead>

        <div className="lesson-practice-steps">
          <h3>{"Python type"}</h3>
          <p>
            {"Разработчику важно видеть, какое значение получит функция."}
          </p>

          <h3>{"FastAPI metadata"}</h3>
          <p>
            {"Depends сообщает, как получить это значение."}
          </p>

          <h3>{"Проблема повторения"}</h3>
          <p>
            {"Одинаковая длинная запись встречается в нескольких endpoints."}
          </p>

          <h3>{"Решение"}</h3>
          <p>
            {"Annotated связывает основной тип и дополнительную метаинформацию."}
          </p>

        </div>

        <CodeBlock
          caption={"до Annotated"}
          code={
            "@router.get(\"/\")\n" +
            "def get_tasks(\n" +
            "    settings: Settings = Depends(get_settings),\n" +
            "    pagination: Pagination = Depends(get_pagination),\n" +
            "):\n" +
            "    ..."
          }
        />

        <CodeBlock
          caption={"после"}
          code={
            "@router.get(\"/\")\n" +
            "def get_tasks(\n" +
            "    settings: SettingsDep,\n" +
            "    pagination: PaginationDep,\n" +
            "):\n" +
            "    ..."
          }
        />

        <CompareSolutions
          question={"Какая сигнатура лучше показывает итоговые типы?"}
          left={{
            title: "Defaults",
            code: "settings: Settings = Depends(get_settings)",
            note: "Работает, но FastAPI-механизм занимает default.",
          }}
          right={{
            title: "Aliases",
            code: "settings: SettingsDep",
            note: "Короткое имя можно раскрыть в одном месте.",
          }}
          preferred={"right"}
          explanation={"Alias полезен, когда dependency действительно переиспользуется."}
        />

        <Callout tone="info">
          {"Annotated не запускает dependency сам по себе. Он хранит тип и метаданные, которые читает FastAPI."}
        </Callout>
      </Section>

      <Section number="02" title={"Как читать Annotated слева направо"}>
        <Lead>
          {"Запись Annotated[Settings, Depends(get_settings)] читается как: значение имеет тип Settings, а FastAPI должен получить его через get_settings."}
        </Lead>

        <div className="lesson-practice-steps">
          <h3>{"Первый элемент"}</h3>
          <p>
            {"Основной Python-тип значения."}
          </p>

          <h3>{"Второй элемент"}</h3>
          <p>
            {"Метаданные для FastAPI."}
          </p>

          <h3>{"Имя аргумента"}</h3>
          <p>
            {"Обычная локальная переменная endpoint."}
          </p>

          <h3>{"Результат"}</h3>
          <p>
            {"IDE и человек видят тип, FastAPI — provider."}
          </p>

        </div>

        <CodeBlock
          caption={"минимальная запись"}
          code={
            "from typing import Annotated\n" +
            "from fastapi import Depends\n" +
            "\n" +
            "SettingsDep = Annotated[\n" +
            "    Settings,\n" +
            "    Depends(get_settings),\n" +
            "]"
          }
        />

        <CodeBlock
          caption={"использование"}
          code={
            "@router.get(\"/info\")\n" +
            "def get_info(settings: SettingsDep):\n" +
            "    return {\n" +
            "        \"app_name\": settings.app_name,\n" +
            "        \"api_mode\": settings.api_mode,\n" +
            "    }"
          }
        />

        <FillBlank
          prompt={"Что является основным типом?"}
          before={"Annotated["}
          after={", Depends(get_settings)]"}
          options={[
            "Settings",
            "Depends",
            "get_settings()",
          ]}
          answer={"Settings"}
          explanation={"Первый аргумент Annotated описывает итоговое значение."}
        />

        <Callout tone="info">
          {"Имя alias должно сообщать смысл результата: SettingsDep, PaginationDep, ActiveModeDep. Сокращение SD экономит символы, но ухудшает обучение."}
        </Callout>
      </Section>

      <Section number="03" title={"Alias объявляется один раз и переиспользуется"}>
        <Lead>
          {"Повторяемую dependency удобно назвать рядом с provider. Тогда изменение способа получения не требует переписывать сигнатуры всех endpoints."}
        </Lead>

        <div className="lesson-practice-steps">
          <h3>{"Один источник"}</h3>
          <p>
            {"Provider и alias находятся в одном модуле dependencies.py."}
          </p>

          <h3>{"Переиспользование"}</h3>
          <p>
            {"Endpoints импортируют SettingsDep."}
          </p>

          <h3>{"Явность"}</h3>
          <p>
            {"Alias всё ещё показывает, что значение является dependency."}
          </p>

          <h3>{"Не для единичной строки"}</h3>
          <p>
            {"Если dependency используется один раз, отдельный alias может не окупиться."}
          </p>

        </div>

        <CodeBlock
          caption={"dependencies.py"}
          code={
            "from typing import Annotated\n" +
            "from fastapi import Depends\n" +
            "\n" +
            "\n" +
            "def get_pagination(...) -> Pagination:\n" +
            "    ...\n" +
            "\n" +
            "PaginationDep = Annotated[\n" +
            "    Pagination,\n" +
            "    Depends(get_pagination),\n" +
            "]"
          }
        />

        <CodeBlock
          caption={"router"}
          code={
            "from app.dependencies import PaginationDep\n" +
            "\n" +
            "@router.get(\"/\")\n" +
            "def get_tasks(pagination: PaginationDep):\n" +
            "    ..."
          }
        />

        <RecallCard
          question={"Когда dependency alias оправдан?"}
          answer={
            <p>
              {"Когда одна и та же комбинация итогового типа и Depends используется в нескольких endpoints или sub-dependencies."}
            </p>
          }
        />

        <Callout tone="info">
          {"Не создавайте один файл aliases.py без ответственности. Dependency alias логично хранить рядом с соответствующей функцией."}
        </Callout>
      </Section>

      <Section number="04" title={"Dependency может зависеть от другой dependency"}>
        <Lead>
          {"FastAPI строит дерево: require_api_mode требует Settings, а endpoint требует результат require_api_mode. Сначала решается нижняя потребность."}
        </Lead>

        <div className="lesson-practice-steps">
          <h3>{"Sub-dependency"}</h3>
          <p>
            {"Одна dependency объявляет аргумент, который тоже получается через Depends."}
          </p>

          <h3>{"Порядок"}</h3>
          <p>
            {"get_settings выполняется раньше require_api_mode."}
          </p>

          <h3>{"Результат"}</h3>
          <p>
            {"Проверенные settings передаются дальше."}
          </p>

          <h3>{"Ранний error"}</h3>
          <p>
            {"Если режим запрещён, endpoint не запускается."}
          </p>

        </div>

        <CodeBlock
          caption={"цепочка"}
          code={
            "SettingsDep = Annotated[\n" +
            "    Settings,\n" +
            "    Depends(get_settings),\n" +
            "]\n" +
            "\n" +
            "\n" +
            "def require_api_mode(\n" +
            "    settings: SettingsDep,\n" +
            ") -> Settings:\n" +
            "    if settings.api_mode == \"maintenance\":\n" +
            "        raise HTTPException(\n" +
            "            status_code=503,\n" +
            "            detail=\"API is under maintenance\",\n" +
            "        )\n" +
            "\n" +
            "    return settings\n" +
            "\n" +
            "ActiveSettingsDep = Annotated[\n" +
            "    Settings,\n" +
            "    Depends(require_api_mode),\n" +
            "]"
          }
        />

        <CodeBlock
          caption={"endpoint"}
          code={
            "@router.get(\"/\")\n" +
            "def get_tasks(settings: ActiveSettingsDep):\n" +
            "    return tasks"
          }
        />

        <CodeSequence
          title={"Решите dependency graph"}
          prompt={"Расположите фактические вызовы."}
          pieces={[
            { id: "settings", code: "get_settings()" },
            { id: "mode", code: "require_api_mode(settings)" },
            { id: "endpoint", code: "get_tasks(settings)" },
          ]}
          correctOrder={[
            "settings",
            "mode",
            "endpoint",
          ]}
          explanation={"Сначала создаётся Settings, затем проверяется режим, после этого вызывается endpoint."}
        />

        <Callout tone="info">
          {"Цепочка выражает зависимость значений, а не порядок строк в файле. FastAPI строит граф по сигнатурам."}
        </Callout>
      </Section>

      <Section number="05" title={"Одна общая sub-dependency вызывается один раз на request"}>
        <Lead>
          {"Если несколько dependencies внутри одного request используют get_settings, FastAPI по умолчанию переиспользует полученный результат в рамках этого request."}
        </Lead>

        <div className="lesson-practice-steps">
          <h3>{"Request cache"}</h3>
          <p>
            {"Значение сохраняется только для решения текущего dependency graph."}
          </p>

          <h3>{"Не глобальный cache"}</h3>
          <p>
            {"Следующий request может решить dependency заново."}
          </p>

          <h3>{"use_cache=False"}</h3>
          <p>
            {"Существует для особых случаев, но пока не нужен."}
          </p>

          <h3>{"Настройки"}</h3>
          <p>
            {"Для settings позже дополнительно используется lru_cache на уровне Python."}
          </p>

        </div>

        <CodeBlock
          caption={"общая dependency"}
          code={
            "def require_api_mode(settings: SettingsDep) -> Settings:\n" +
            "    ...\n" +
            "\n" +
            "def build_response_meta(settings: SettingsDep) -> dict:\n" +
            "    ...\n" +
            "\n" +
            "@router.get(\"/\")\n" +
            "def get_tasks(\n" +
            "    active: Annotated[Settings, Depends(require_api_mode)],\n" +
            "    meta: Annotated[dict, Depends(build_response_meta)],\n" +
            "):\n" +
            "    ..."
          }
        />

        <CodeBlock
          caption={"схема"}
          code={
            "        get_settings\n" +
            "        /          require_api_mode  build_response_meta\n" +
            "        \\          /\n" +
            "           endpoint"
          }
        />

        <TrueFalse
          statement={
            <>
              {"Если get_settings нужна двум sub-dependencies одного endpoint, FastAPI обычно решит её один раз для этого request."}
            </>
          }
          isTrue={true}
          explanation={"По умолчанию результат dependency переиспользуется внутри текущего request graph."}
        />

        <Callout tone="info">
          {"Не используйте cache как причину строить сложное дерево. Сначала дерево должно быть понятным по ответственности."}
        </Callout>
      </Section>

      <Section number="06" title={"Dependency может преобразовать или проверить результат"}>
        <Lead>
          {"Цепочка полезна, когда каждый уровень добавляет одну понятную гарантию: получить settings, проверить mode, затем передать разрешённую конфигурацию."}
        </Lead>

        <div className="lesson-practice-steps">
          <h3>{"Provider"}</h3>
          <p>
            {"Создаёт или получает значение."}
          </p>

          <h3>{"Validator dependency"}</h3>
          <p>
            {"Проверяет условие и возвращает то же либо новое значение."}
          </p>

          <h3>{"Endpoint"}</h3>
          <p>
            {"Использует уже гарантированный результат."}
          </p>

          <h3>{"Ошибка"}</h3>
          <p>
            {"HTTPException остаётся на HTTP-границе."}
          </p>

        </div>

        <CodeBlock
          caption={"три уровня"}
          code={
            "def get_settings() -> Settings:\n" +
            "    return Settings()\n" +
            "\n" +
            "\n" +
            "def require_api_mode(\n" +
            "    settings: SettingsDep,\n" +
            ") -> Settings:\n" +
            "    if settings.api_mode not in {\"development\", \"test\"}:\n" +
            "        raise HTTPException(503, \"API is unavailable\")\n" +
            "    return settings\n" +
            "\n" +
            "\n" +
            "@router.post(\"/\")\n" +
            "def create_task(\n" +
            "    task: TaskCreate,\n" +
            "    settings: ActiveSettingsDep,\n" +
            "):\n" +
            "    ..."
          }
        />

        <BugHunt
          code={
            "def get_settings() -> Settings:\n" +
            "    settings = Settings()\n" +
            "    tasks.append({\"title\": \"hidden side effect\"})\n" +
            "    return settings"
          }
          question={"Что делает dependency опасной?"}
          options={[
            "Она неожиданно меняет предметное состояние",
            "Settings нельзя возвращать",
            "Depends запрещает списки",
          ]}
          correctIndex={0}
          explanation={"Получение конфигурации должно быть предсказуемым и не выполнять скрытый CRUD."}
          fix={"def get_settings() -> Settings:\n    return Settings()"}
        />

        <Callout tone="info">
          {"Если dependency начинает изменять tasks или выполнять основной CRUD, граница смещена: предметная операция должна остаться в crud/service."}
        </Callout>
      </Section>

      <Section number="07" title={"Граница чрезмерной вложенности"}>
        <Lead>
          {"FastAPI допускает глубокие dependency trees, но возможность не равна необходимости. Новичку и команде легче поддерживать короткую цепочку с говорящими именами."}
        </Lead>

        <div className="lesson-practice-steps">
          <h3>{"Хорошая глубина"}</h3>
          <p>
            {"Один provider и одна проверка перед endpoint."}
          </p>

          <h3>{"Сигнал перегруза"}</h3>
          <p>
            {"Чтобы понять значение, нужно открыть пять functions в четырёх файлах."}
          </p>

          <h3>{"Скрытая логика"}</h3>
          <p>
            {"Dependency tree не должна заменять service layer."}
          </p>

          <h3>{"Диагностика"}</h3>
          <p>
            {"Каждый уровень отвечает на один вопрос и имеет отдельный тест."}
          </p>

        </div>

        <CodeBlock
          caption={"понятная цепочка"}
          code={
            "get_settings\n" +
            "→ require_api_mode\n" +
            "→ endpoint"
          }
        />

        <CodeBlock
          caption={"перегруженная"}
          code={
            "get_environment\n" +
            "→ get_flags\n" +
            "→ get_policy\n" +
            "→ get_context\n" +
            "→ get_actor\n" +
            "→ get_workspace\n" +
            "→ endpoint"
          }
        />

        <CompareSolutions
          question={"Какой graph подходит текущему проекту?"}
          left={{
            title: "Глубокий",
            code: "6 providers до любого endpoint",
            note: "Скрывает простой режим приложения.",
          }}
          right={{
            title: "Короткий",
            code: "get_settings → require_api_mode → endpoint",
            note: "Каждый шаг легко объяснить и проверить.",
          }}
          preferred={"right"}
          explanation={"Сложность dependency graph должна расти вместе с реальной потребностью."}
        />

        <Callout tone="info">
          {"До появления реальной аутентификации и DB-session блоку достаточно 1–2 уровней sub-dependencies."}
        </Callout>
      </Section>

      <Section number="08" title={"Практика: get_settings → require_api_mode → endpoint"}>
        <Lead>
          {"Соберите цепочку и добавьте её только к write-endpoints. GET /health может работать даже в maintenance, а POST/PATCH/DELETE должны вернуть 503."}
        </Lead>

        <div className="lesson-practice-steps">
          <h3>{"Шаг 1"}</h3>
          <p>
            {"Создайте Settings с api_mode."}
          </p>

          <h3>{"Шаг 2"}</h3>
          <p>
            {"Объявите SettingsDep."}
          </p>

          <h3>{"Шаг 3"}</h3>
          <p>
            {"Создайте require_api_mode и ActiveSettingsDep."}
          </p>

          <h3>{"Шаг 4"}</h3>
          <p>
            {"Подключите alias к POST, PATCH и DELETE."}
          </p>

          <h3>{"Шаг 5"}</h3>
          <p>
            {"Проверьте development и maintenance."}
          </p>

        </div>

        <CodeBlock
          caption={"матрица"}
          code={
            "api_mode=development\n" +
            "GET /tasks    → 200\n" +
            "POST /tasks   → 201\n" +
            "\n" +
            "api_mode=maintenance\n" +
            "GET /health   → 200\n" +
            "GET /tasks    → 200\n" +
            "POST /tasks   → 503"
          }
        />

        <Callout tone="info">
          {"Итог занятия — не максимальное число aliases, а читаемая сигнатура и объяснимый порядок выполнения."}
        </Callout>

        <div className="lesson-check-group">
          <QuizCard
            question={"Что хранит Annotated?"}
            options={[
              "основной тип и metadata",
              "только return",
              "HTTP body",
            ]}
            correctIndex={0}
            explanation={"FastAPI читает Depends из metadata."}
          />
          <QuizCard
            question={"Что выполняется первым в цепочке?"}
            options={[
              "нижняя sub-dependency",
              "endpoint",
              "response model",
            ]}
            correctIndex={0}
            explanation={"Значение должно быть подготовлено до зависимого callable."}
          />
          <QuizCard
            question={"Сколько раз общая dependency обычно вызывается в одном request?"}
            options={[
              "один раз с cache",
              "обязательно для каждой ветки",
              "никогда",
            ]}
            correctIndex={0}
            explanation={"FastAPI переиспользует результат в request graph."}
          />
          <QuizCard
            question={"Когда graph слишком глубокий?"}
            options={[
              "когда скрывает простую логику и трудно проследить значение",
              "после двух функций всегда",
              "только при async",
            ]}
            correctIndex={0}
            explanation={"Глубина должна оправдываться ответственностями."}
          />
        </div>

        <KeyTakeaways
          points={[
            <>{"Annotated отделяет итоговый type от FastAPI metadata."}</>,
            <>{"Dependency alias сокращает повторяемые сигнатуры."}</>,
            <>{"Sub-dependency получает результат другой dependency."}</>,
            <>{"FastAPI строит граф по сигнатурам."}</>,
            <>{"Нижние providers выполняются раньше endpoint."}</>,
            <>{"Общая dependency обычно кэшируется внутри request."}</>,
            <>{"Каждый уровень должен добавлять одну понятную гарантию."}</>,
            <>{"Короткий граф лучше преждевременно глубокой вложенности."}</>,
          ]}
        />

        <PracticeCta
          text={"Создайте SettingsDep и ActiveSettingsDep, подключите maintenance-check к write-endpoints и нарисуйте фактический порядок вызовов."}
        />
      </Section>

    </RichLesson>
  );
}
