import { FileText, Wrench } from "lucide-react";
import { BugHunt, Callout, CodeBlock, CompareSolutions, FillBlank, KeyTakeaways, Lead, MatchPairs, PracticeCta, QuizCard, RichHero, RichLesson, Section, StepThrough, TerminalDemo } from "../../shared";
const BLOCK_TITLE = "Этап 4 · Блок 13 · FastAPI как цельное приложение";

export function Lesson72({ module }: { module?: string }) {
  return (
    <RichLesson>
      <RichHero
        variant="project"
        chip={module ?? BLOCK_TITLE}
        title={"Настройки и переменные окружения"}
        intro={"Вынесем изменяемые значения из кода: начнём с environment variables, создадим Settings через pydantic-settings, подключим .env и .env.example и получим настройки через dependency."}
        tags={[
          { icon: <Wrench size={14} />, label: "pydantic-settings" },
          { icon: <FileText size={14} />, label: "dev · test · secrets" },
        ]}
      />

      <Section number="01" title={"Настройка — значение, которое меняется между окружениями"}>
        <Lead>
          {"Название приложения, режим API и будущий DATABASE_URL могут отличаться на компьютере разработчика, в тестах и при запуске сервиса. Если они зашиты в код, каждое изменение требует редактирования файла."}
        </Lead>

        <div className="lesson-practice-steps">
          <h3>{"Code"}</h3>
          <p>
            {"Описывает стабильное поведение приложения."}
          </p>

          <h3>{"Configuration"}</h3>
          <p>
            {"Выбирает значение для конкретного окружения."}
          </p>

          <h3>{"Secret"}</h3>
          <p>
            {"Конфигурация, которую нельзя публиковать: ключ, пароль, token."}
          </p>

          <h3>{"Пример"}</h3>
          <p>
            {"SQLite URL в development и отдельный URL тестовой базы."}
          </p>

        </div>

        <CodeBlock
          caption={"жёстко в коде"}
          code={
            "APP_NAME = \"StudyHub Database API\"\n" +
            "API_MODE = \"development\"\n" +
            "DATABASE_URL = \"sqlite:///./studyhub.db\""
          }
        />

        <CodeBlock
          caption={"ожидаемая идея"}
          code={
            "код приложения\n" +
            "+ значения окружения\n" +
            "→ готовая конфигурация запуска"
          }
        />

        <MatchPairs
          prompt={"Разделите примеры по смыслу."}
          leftTitle={"Значение"}
          rightTitle={"Категория"}
          pairs={[
            { left: "DATABASE_URL", right: "environment setting" },
            { left: "SECRET_KEY", right: "secret setting" },
            { left: "MAX_PRIORITY = 5", right: "business constant" },
            { left: "APP_NAME", right: "display/config setting" },
          ]}
          explanation={"Настройки выбирают окружение, предметные константы определяют правило."}
        />

        <Callout tone="info">
          {"Не каждое число является setting. Константа предметного правила, например MAX_PRIORITY=5, не обязана меняться между окружениями."}
        </Callout>
      </Section>

      <Section number="02" title={"Environment variable приходит в Python как текст"}>
        <Lead>
          {"Операционная система хранит пары имя–значение. Python может получить их через os.getenv, но преобразование типов и обязательность придётся контролировать вручную."}
        </Lead>

        <div className="lesson-practice-steps">
          <h3>{"Имя"}</h3>
          <p>
            {"Обычно используется uppercase: APP_NAME, API_MODE, DATABASE_URL."}
          </p>

          <h3>{"Строка"}</h3>
          <p>
            {"Внешнее значение поступает как str."}
          </p>

          <h3>{"Default"}</h3>
          <p>
            {"os.getenv может вернуть запасное значение."}
          </p>

          <h3>{"Ограничение"}</h3>
          <p>
            {"Ручные conversions быстро повторяются."}
          </p>

        </div>

        <CodeBlock
          caption={"первый шаг"}
          code={
            "import os\n" +
            "\n" +
            "app_name = os.getenv(\n" +
            "    \"APP_NAME\",\n" +
            "    \"StudyHub Database API\",\n" +
            ")\n" +
            "\n" +
            "api_mode = os.getenv(\n" +
            "    \"API_MODE\",\n" +
            "    \"development\",\n" +
            ")"
          }
        />

        <CodeBlock
          caption={"PowerShell"}
          code={
            "$env:APP_NAME = \"StudyHub Local API\"\n" +
            "$env:API_MODE = \"test\"\n" +
            "python -m uvicorn app.main:app --reload"
          }
        />

        <TerminalDemo
          title={"проверка environment"}
          lines={[
            { cmd: "python -c \"import os; print(os.getenv('API_MODE'))\"" },
            { out: "development" },
          ]}
        />

        <Callout tone="info">
          {"os.getenv полезен для понимания механизма, но объект Settings даст типы, defaults и единое место конфигурации."}
        </Callout>
      </Section>

      <Section number="03" title={"Pydantic Settings собирает и проверяет конфигурацию"}>
        <Lead>
          {"Пакет pydantic-settings использует знакомую модель полей. При создании Settings он читает environment variables, преобразует типы и применяет defaults."}
        </Lead>

        <div className="lesson-practice-steps">
          <h3>{"Отдельный пакет"}</h3>
          <p>
            {"BaseSettings импортируется из pydantic_settings."}
          </p>

          <h3>{"Type hints"}</h3>
          <p>
            {"Поля получают ожидаемые Python-типы."}
          </p>

          <h3>{"Defaults"}</h3>
          <p>
            {"Локальный запуск возможен без полного набора variables."}
          </p>

          <h3>{"Required secret"}</h3>
          <p>
            {"Поле без default потребует внешнее значение."}
          </p>

        </div>

        <CodeBlock
          caption={"установка"}
          code={
            "python -m pip install pydantic-settings"
          }
        />

        <CodeBlock
          caption={"config.py"}
          code={
            "from pydantic_settings import BaseSettings\n" +
            "\n" +
            "\n" +
            "class Settings(BaseSettings):\n" +
            "    app_name: str = \"StudyHub Database API\"\n" +
            "    api_mode: str = \"development\"\n" +
            "    database_url: str = \"sqlite:///./studyhub.db\"\n" +
            "    debug: bool = False"
          }
        />

        <CodeBlock
          caption={"создание"}
          code={
            "settings = Settings()\n" +
            "\n" +
            "print(settings.app_name)\n" +
            "print(type(settings.debug))"
          }
        />

        <FillBlank
          prompt={"Выберите актуальный импорт."}
          before={"from "}
          after={" import BaseSettings"}
          options={[
            "pydantic_settings",
            "pydantic",
            "fastapi",
          ]}
          answer={"pydantic_settings"}
          explanation={"Settings вынесены в отдельный пакет."}
        />

        <Callout tone="info">
          {"В новом коде BaseSettings не импортируется из pydantic. Для Pydantic v2 используется пакет pydantic-settings."}
        </Callout>
      </Section>

      <Section number="04" title={".env удобен для локального запуска"}>
        <Lead>
          {"Файл .env хранит пары KEY=VALUE рядом с проектом. SettingsConfigDict сообщает модели, какой dotenv-файл прочитать и в какой кодировке."}
        </Lead>

        <div className="lesson-practice-steps">
          <h3>{"Локальная конфигурация"}</h3>
          <p>
            {"Не нужно каждый раз вводить несколько variables в терминале."}
          </p>

          <h3>{"Приоритет"}</h3>
          <p>
            {"Реальные environment variables могут переопределять значения dotenv."}
          </p>

          <h3>{"Кодировка"}</h3>
          <p>
            {"UTF-8 делает поведение предсказуемым."}
          </p>

          <h3>{"Не публикация"}</h3>
          <p>
            {"Рабочий .env обычно исключается из Git."}
          </p>

        </div>

        <CodeBlock
          caption={"SettingsConfigDict"}
          code={
            "from pydantic_settings import (\n" +
            "    BaseSettings,\n" +
            "    SettingsConfigDict,\n" +
            ")\n" +
            "\n" +
            "\n" +
            "class Settings(BaseSettings):\n" +
            "    app_name: str = \"StudyHub Database API\"\n" +
            "    api_mode: str = \"development\"\n" +
            "    database_url: str = \"sqlite:///./studyhub.db\"\n" +
            "\n" +
            "    model_config = SettingsConfigDict(\n" +
            "        env_file=\".env\",\n" +
            "        env_file_encoding=\"utf-8\",\n" +
            "    )"
          }
        />

        <CodeBlock
          caption={".env"}
          code={
            "APP_NAME=StudyHub Local API\n" +
            "API_MODE=development\n" +
            "DATABASE_URL=sqlite:///./studyhub.db"
          }
        />

        <CompareSolutions
          question={"Где хранить локальный DATABASE_URL?"}
          left={{
            title: "В router",
            code: "DATABASE_URL = \"...\"",
            note: "HTTP-модуль становится источником конфигурации.",
          }}
          right={{
            title: "В .env + Settings",
            code: "DATABASE_URL=sqlite:///./studyhub.db",
            note: "Значение выбирается окружением и проверяется моделью.",
          }}
          preferred={"right"}
          explanation={"Router получает готовые settings через dependency."}
        />

        <Callout tone="info">
          {".env не является Python-файлом: кавычки, пробелы и синтаксис должны соответствовать dotenv-формату."}
        </Callout>
      </Section>

      <Section number="05" title={".env.example документирует обязательные имена"}>
        <Lead>
          {"Рабочий .env не коммитится, но новый разработчик должен знать, какие variables требуются. Для этого создаётся безопасный .env.example без настоящих secrets."}
        </Lead>

        <div className="lesson-practice-steps">
          <h3>{"Шаблон"}</h3>
          <p>
            {"Содержит имена и безопасные демонстрационные значения."}
          </p>

          <h3>{"README"}</h3>
          <p>
            {"Объясняет копирование .env.example → .env."}
          </p>

          <h3>{"Без secrets"}</h3>
          <p>
            {"Настоящий SECRET_KEY или пароль не попадает в repository."}
          </p>

          <h3>{"Синхронизация"}</h3>
          <p>
            {"При добавлении новой setting обновляются model, example и README."}
          </p>

        </div>

        <CodeBlock
          caption={".env.example"}
          code={
            "APP_NAME=StudyHub Database API\n" +
            "API_MODE=development\n" +
            "DATABASE_URL=sqlite:///./studyhub.db\n" +
            "SECRET_KEY=replace-me-locally"
          }
        />

        <CodeBlock
          caption={".gitignore"}
          code={
            ".env\n" +
            ".venv/\n" +
            "__pycache__/\n" +
            ".pytest_cache/\n" +
            "*.pyc"
          }
        />

        <BugHunt
          code={
            ".env\n" +
            "SECRET_KEY=real-production-secret\n" +
            "\n" +
            "# затем\n" +
            "git add .env\n" +
            "git commit -m \"add config\""
          }
          question={"В чём риск?"}
          options={[
            "Секрет попадает в историю Git",
            "dotenv не поддерживает строки",
            "FastAPI удалит файл",
          ]}
          correctIndex={0}
          explanation={"Даже удалённый следующим commit secret останется в истории и должен считаться раскрытым."}
          fix={".gitignore\n.env\n\n.env.example\nSECRET_KEY=replace-me"}
        />

        <Callout tone="info">
          {"Само имя SECRET_KEY можно публиковать. Нельзя публиковать реальное значение, которое используется сервисом."}
        </Callout>
      </Section>

      <Section number="06" title={"get_settings и lru_cache"}>
        <Lead>
          {"Создание Settings может читать dotenv. Для одного процесса достаточно создать объект один раз и возвращать его через dependency. lru_cache хранит результат обычной Python-функции между requests."}
        </Lead>

        <div className="lesson-practice-steps">
          <h3>{"get_settings"}</h3>
          <p>
            {"Единая функция-provider для FastAPI."}
          </p>

          <h3>{"lru_cache"}</h3>
          <p>
            {"После первого вызова возвращает тот же объект для одинаковых аргументов."}
          </p>

          <h3>{"Dependency"}</h3>
          <p>
            {"Endpoints объявляют SettingsDep."}
          </p>

          <h3>{"Тест"}</h3>
          <p>
            {"Provider можно override, не изменяя рабочий endpoint."}
          </p>

        </div>

        <CodeBlock
          caption={"provider"}
          code={
            "from functools import lru_cache\n" +
            "from typing import Annotated\n" +
            "\n" +
            "from fastapi import Depends\n" +
            "\n" +
            "\n" +
            "@lru_cache\n" +
            "def get_settings() -> Settings:\n" +
            "    return Settings()\n" +
            "\n" +
            "\n" +
            "SettingsDep = Annotated[\n" +
            "    Settings,\n" +
            "    Depends(get_settings),\n" +
            "]"
          }
        />

        <CodeBlock
          caption={"endpoint"}
          code={
            "@router.get(\"/info\")\n" +
            "def get_info(settings: SettingsDep):\n" +
            "    return {\n" +
            "        \"app_name\": settings.app_name,\n" +
            "        \"api_mode\": settings.api_mode,\n" +
            "    }"
          }
        />

        <CompareSolutions
          question={"Почему не создать Settings() прямо в каждом endpoint?"}
          left={{
            title: "В каждом handler",
            code: "settings = Settings()",
            note: "Повторное чтение конфигурации и жёсткое создание внутри route.",
          }}
          right={{
            title: "Provider + cache",
            code: "settings: SettingsDep",
            note: "Получение централизовано и заменяется в тестах.",
          }}
          preferred={"right"}
          explanation={"FastAPI dependency и lru_cache дают ясную точку получения settings."}
        />

        <Callout tone="info">
          {"lru_cache и request dependency cache — разные уровни. Первый живёт в Python-процессе, второй действует при решении одного request graph."}
        </Callout>
      </Section>

      <Section number="07" title={"Development и test используют разные значения"}>
        <Lead>
          {"Тесты не должны случайно использовать рабочий database_url или режим. Dependency override позволяет передать TestSettings либо отдельный Settings с тестовыми значениями."}
        </Lead>

        <div className="lesson-practice-steps">
          <h3>{"Development"}</h3>
          <p>
            {"Локальный SQLite-файл и debug-настройки."}
          </p>

          <h3>{"Test"}</h3>
          <p>
            {"Отдельный временный URL и api_mode=test."}
          </p>

          <h3>{"Override"}</h3>
          <p>
            {"app.dependency_overrides связывает рабочий provider с тестовым."}
          </p>

          <h3>{"Очистка"}</h3>
          <p>
            {"Override удаляется после теста, чтобы сценарии не влияли друг на друга."}
          </p>

        </div>

        <CodeBlock
          caption={"test provider"}
          code={
            "def get_test_settings() -> Settings:\n" +
            "    return Settings(\n" +
            "        api_mode=\"test\",\n" +
            "        database_url=\"sqlite:///./test.db\",\n" +
            "    )\n" +
            "\n" +
            "app.dependency_overrides[get_settings] = get_test_settings"
          }
        />

        <CodeBlock
          caption={"cleanup"}
          code={
            "app.dependency_overrides.clear()"
          }
        />

        <StepThrough
          code={
            "test starts\n" +
            "→ override get_settings\n" +
            "→ request\n" +
            "→ endpoint receives test settings\n" +
            "→ assertions\n" +
            "→ clear overrides"
          }
          steps={[
            {
              line: 0,
              note: "Тест подготавливает окружение.",
              vars: { "mode": "test" },
            },
            {
              line: 1,
              note: "Рабочий provider заменяется.",
              vars: { "override": "active" },
            },
            {
              line: 2,
              note: "TestClient отправляет request.",
              vars: { "request": "GET /info" },
            },
            {
              line: 3,
              note: "Endpoint получает test Settings.",
              vars: { "database_url": "test.db" },
            },
            {
              line: 4,
              note: "Проверяется response.",
              vars: { "status": "200" },
            },
            {
              line: 5,
              note: "Override очищается.",
              vars: { "isolation": "restored" },
            },
          ]}
        />

        <Callout tone="info">
          {"В блоке 14 DATABASE_URL начнёт реально управлять SQLAlchemy engine. Сейчас важно подготовить безопасную конфигурационную границу."}
        </Callout>
      </Section>

      <Section number="08" title={"Практика: конфигурация перед SQLite"}>
        <Lead>
          {"Создайте config.py до подключения SQLAlchemy. Блок должен закончиться settings, которые уже содержат будущий DATABASE_URL, но ещё не открывают соединение."}
        </Lead>

        <div className="lesson-practice-steps">
          <h3>{"Шаг 1"}</h3>
          <p>
            {"Установите pydantic-settings."}
          </p>

          <h3>{"Шаг 2"}</h3>
          <p>
            {"Создайте Settings и SettingsConfigDict."}
          </p>

          <h3>{"Шаг 3"}</h3>
          <p>
            {"Добавьте .env, .env.example и .gitignore."}
          </p>

          <h3>{"Шаг 4"}</h3>
          <p>
            {"Подключите get_settings и SettingsDep."}
          </p>

          <h3>{"Шаг 5"}</h3>
          <p>
            {"Сделайте /info без выдачи secrets."}
          </p>

          <h3>{"Шаг 6"}</h3>
          <p>
            {"Проверьте test override."}
          </p>

        </div>

        <CodeBlock
          caption={"структура"}
          code={
            "app/\n" +
            "├── main.py\n" +
            "├── config.py\n" +
            "├── dependencies.py\n" +
            "└── routers/\n" +
            "\n" +
            ".env\n" +
            ".env.example\n" +
            ".gitignore"
          }
        />

        <Callout tone="info">
          {"Endpoint /info может возвращать app_name и api_mode, но не должен раскрывать SECRET_KEY или пароль базы."}
        </Callout>

        <div className="lesson-check-group">
          <QuizCard
            question={"Откуда импортируется BaseSettings в Pydantic v2?"}
            options={[
              "pydantic_settings",
              "fastapi",
              "sqlite3",
            ]}
            correctIndex={0}
            explanation={"Settings находятся в отдельном пакете."}
          />
          <QuizCard
            question={"Зачем .env.example?"}
            options={[
              "документировать имена без настоящих secrets",
              "хранить production secret",
              "заменить .gitignore",
            ]}
            correctIndex={0}
            explanation={"Новый разработчик видит шаблон конфигурации."}
          />
          <QuizCard
            question={"Что делает lru_cache для get_settings?"}
            options={[
              "переиспользует созданный объект в процессе",
              "кэширует HTTP body",
              "создаёт cookie",
            ]}
            correctIndex={0}
            explanation={"Settings не читается заново на каждый request."}
          />
          <QuizCard
            question={"Что нельзя возвращать из /info?"}
            options={[
              "SECRET_KEY",
              "app_name",
              "api_mode",
            ]}
            correctIndex={0}
            explanation={"Секреты не становятся публичным response."}
          />
        </div>

        <KeyTakeaways
          points={[
            <>{"Configuration отделяется от стабильного кода."}</>,
            <>{"Environment variables поступают как текст."}</>,
            <>{"Pydantic Settings преобразует и проверяет значения."}</>,
            <>{"SettingsConfigDict подключает .env."}</>,
            <>{".env обычно не коммитится."}</>,
            <>{".env.example документирует безопасный шаблон."}</>,
            <>{"get_settings используется как dependency provider."}</>,
            <>{"lru_cache и dependency override упрощают запуск и тесты."}</>,
          ]}
        />

        <PracticeCta
          text={"Создайте config.py, .env и .env.example, подключите SettingsDep к /info и проверьте отдельные development/test значения."}
        />
      </Section>

    </RichLesson>
  );
}
