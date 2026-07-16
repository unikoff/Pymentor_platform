import {
  Boxes,
  Bug,
  CheckCircle2,
  FileText,
  FolderGit2,
  GitBranch,
  GitFork,
  Layers,
  ListChecks,
  ShieldCheck,
  Trophy,
} from "lucide-react";
import {
  BugHunt,
  Callout,
  CodeBlock,
  CodeSequence,
  CompareSolutions,
  KeyTakeaways,
  Lead,
  PracticeCta,
  PredictOutput,
  QuizCard,
  RecallCard,
  RichHero,
  RichLesson,
  Section,
  StepThrough,
  TypeCard,
  TypeCards,
} from "../shared";

type TheoryBridgeData = { link: string; boundary: string };

const BLOCK_TITLE = "Блок 12 · Архитектура, тесты и релиз Planner API";

const THEORY_BRIDGES: Record<number, TheoryBridgeData> = {
  63: {
    link: "CRUD уже работает в одном файле. Теперь мы сохраняем поведение и только организуем маршруты.",
    boundary: "APIRouter не является отдельным сервером или базой данных.",
  },
  64: {
    link: "Router сделал контракт стабильнее, поэтому его можно закрепить автоматическими HTTP-тестами.",
    boundary: "TestClient не требует ручного запуска Uvicorn для обычных тестов.",
  },
  65: {
    link: "Все отдельные операции знакомы; теперь сначала фиксируется общий договор проекта.",
    boundary: "Новые архитектурные слои без новой проблемы не добавляются.",
  },
  66: {
    link: "Контракт утверждён, поэтому каждый файл получает одну известную ответственность.",
    boundary: "Обычных функций и списка достаточно для текущей сложности.",
  },
  67: {
    link: "Каркас работает; теперь все операции соединяются в жизненный цикл одного ресурса.",
    boundary: "Новые функции вроде фильтрации откладываются до завершения обязательного CRUD.",
  },
  68: {
    link: "CRUD завершён; последний урок доказывает воспроизводимость и качество результата.",
    boundary: "Release фиксирует учебную версию, а не объявляет систему production-ready.",
  },
};

function TheoryBridge({ lesson }: { lesson: number }) {
  const bridge = THEORY_BRIDGES[lesson];
  if (!bridge) return null;
  return (
    <Callout tone="info">
      <strong>Связь с курсом.</strong> {bridge.link}{" "}
      <strong>Важно не перепутать:</strong> {bridge.boundary}
    </Callout>
  );
}

// 63. APIRouter, prefix, tags и include_router
export function Lesson63({ module }: { module?: string }) {
  return (
    <RichLesson>
      <RichHero
        variant="project"
        chip={module ?? BLOCK_TITLE}
        title={"APIRouter, prefix, tags и include_router"}
        intro={"Полный CRUD уже работает, но main.py одновременно создаёт приложение, хранит маршруты и содержит детали ресурса tasks. Мы не меняем HTTP-контракт, а только уменьшаем область чтения кода. Материал развивается маленькими шагами и использует только уже знакомые части Planner API."}
        tags={[
          { icon: <FolderGit2 size={14} />, label: "маршруты по файлам" },
          { icon: <GitFork size={14} />, label: "подключение router" },
        ]}
      />
      <TheoryBridge lesson={63} />

      <Section number="01" title={"Почему main.py стал перегруженным"}>
        <Lead>
          {"Полный CRUD уже работает, но main.py одновременно создаёт приложение, хранит маршруты и содержит детали ресурса tasks. Мы не меняем HTTP-контракт, а только уменьшаем область чтения кода."}
        </Lead>

        <div className="lesson-practice-steps">
          <h3>{"Опора на прошлый шаг"}</h3>
          <p>
            {"Используем то, что уже было проверено в предыдущих занятиях, и меняем только одну часть системы."}
          </p>

          <h3>{"Новый небольшой шаг"}</h3>
          <p>
            {"Разбираем «Почему main.py стал перегруженным» на одном небольшом примере и связываем его с текущим Planner API."}
          </p>

          <h3>{"Граница сложности"}</h3>
          <p>
            {"Не добавляем новый стек: текущая цель — уверенно понять почему main.py стал перегруженным и проверить наблюдаемый результат."}
          </p>
        </div>

        <TypeCards>
          <TypeCard badge={"вход"} title={"Что уже известно"} code={"проверенный контракт"}>
            {"Начинаем с существующего поведения и не переписываем соседние части без необходимости."}
          </TypeCard>
          <TypeCard badge={"шаг"} badgeTone="float" title={"Что делаем"} code={"Почему main.py стал перегруженным"}>
            {"Разбираем «Почему main.py стал перегруженным» на одном небольшом примере и связываем его с текущим Planner API."}
          </TypeCard>
          <TypeCard badge={"результат"} badgeTone="str" title={"Что проверяем"} code={"status + JSON + state"}>
            {"Проверяем публичный результат и только затем переходим к следующему разделу."}
          </TypeCard>
        </TypeCards>

        <CodeBlock
          caption={"Почему main.py стал перегруженным"}
          code={"app = FastAPI()\n\n@app.get(\"/tasks/\")\ndef list_tasks():\n    ...\n\n@app.post(\"/tasks/\", status_code=201)\ndef create_task(payload: TaskCreate):\n    ..."}
        />

        <RecallCard
          question={"Сформулируйте главную идею раздела своими словами."}
          answer={<p>
            {"Полный CRUD уже работает, но main.py одновременно создаёт приложение, хранит маршруты и содержит детали ресурса tasks. Мы не меняем HTTP-контракт, а только уменьшаем область чтения кода."}
          </p>}
        />

        <Callout tone="info">
          {"Не добавляем новый стек: текущая цель — уверенно понять почему main.py стал перегруженным и проверить наблюдаемый результат."}
        </Callout>
      </Section>

      <Section number="02" title={"Первый объект APIRouter"}>
        <Lead>
          {"APIRouter хранит связанные path operations. Декораторы остаются знакомыми, но вместо app используются методы router; клиент увидит их только после подключения к FastAPI."}
        </Lead>

        <div className="lesson-practice-steps">
          <h3>{"Опора на прошлый шаг"}</h3>
          <p>
            {"Используем то, что уже было проверено в разделе 01, и меняем только одну часть системы."}
          </p>

          <h3>{"Новый небольшой шаг"}</h3>
          <p>
            {"Разбираем «Первый объект APIRouter» на одном небольшом примере и связываем его с текущим Planner API."}
          </p>

          <h3>{"Граница сложности"}</h3>
          <p>
            {"Не добавляем новый стек: текущая цель — уверенно понять первый объект apirouter и проверить наблюдаемый результат."}
          </p>
        </div>

        <TypeCards>
          <TypeCard badge={"вход"} title={"Что уже известно"} code={"проверенный контракт"}>
            {"Начинаем с существующего поведения и не переписываем соседние части без необходимости."}
          </TypeCard>
          <TypeCard badge={"шаг"} badgeTone="float" title={"Что делаем"} code={"Первый объект APIRouter"}>
            {"Разбираем «Первый объект APIRouter» на одном небольшом примере и связываем его с текущим Planner API."}
          </TypeCard>
          <TypeCard badge={"результат"} badgeTone="str" title={"Что проверяем"} code={"status + JSON + state"}>
            {"Проверяем публичный результат и только затем переходим к следующему разделу."}
          </TypeCard>
        </TypeCards>

        <CodeBlock
          caption={"Первый объект APIRouter"}
          code={"from fastapi import APIRouter\n\nrouter = APIRouter()\n\n@router.get(\"/\")\ndef list_tasks():\n    return []"}
        />

        <PredictOutput
          code={"from fastapi import APIRouter\n\nrouter = APIRouter()\n\n@router.get(\"/\")\ndef list_tasks():\n    return []"}
          output={"Результат соответствует контракту текущего раздела"}
          hint={"Сначала проследите вход, затем действие и только потом итог."}
        />

        <RecallCard
          question={"Сформулируйте главную идею раздела своими словами."}
          answer={<p>
            {"APIRouter хранит связанные path operations. Декораторы остаются знакомыми, но вместо app используются методы router; клиент увидит их только после подключения к FastAPI."}
          </p>}
        />

        <Callout tone="info">
          {"Не добавляем новый стек: текущая цель — уверенно понять первый объект apirouter и проверить наблюдаемый результат."}
        </Callout>
      </Section>

      <Section number="03" title={"Общий prefix для ресурса"}>
        <Lead>
          {"Параметр prefix задаёт повторяющуюся часть URL один раз. Путь внутри декоратора читается относительно prefix: корень router становится списком задач, а /{task_id} — одной задачей."}
        </Lead>

        <div className="lesson-practice-steps">
          <h3>{"Опора на прошлый шаг"}</h3>
          <p>
            {"Используем то, что уже было проверено в разделе 02, и меняем только одну часть системы."}
          </p>

          <h3>{"Новый небольшой шаг"}</h3>
          <p>
            {"Разбираем «Общий prefix для ресурса» на одном небольшом примере и связываем его с текущим Planner API."}
          </p>

          <h3>{"Граница сложности"}</h3>
          <p>
            {"Не добавляем новый стек: текущая цель — уверенно понять общий prefix для ресурса и проверить наблюдаемый результат."}
          </p>
        </div>

        <TypeCards>
          <TypeCard badge={"вход"} title={"Что уже известно"} code={"проверенный контракт"}>
            {"Начинаем с существующего поведения и не переписываем соседние части без необходимости."}
          </TypeCard>
          <TypeCard badge={"шаг"} badgeTone="float" title={"Что делаем"} code={"Общий prefix для ресурса"}>
            {"Разбираем «Общий prefix для ресурса» на одном небольшом примере и связываем его с текущим Planner API."}
          </TypeCard>
          <TypeCard badge={"результат"} badgeTone="str" title={"Что проверяем"} code={"status + JSON + state"}>
            {"Проверяем публичный результат и только затем переходим к следующему разделу."}
          </TypeCard>
        </TypeCards>

        <CodeBlock
          caption={"Общий prefix для ресурса"}
          code={"router = APIRouter(prefix=\"/tasks\")\n\n@router.get(\"/\")\ndef list_tasks():\n    ...\n\n@router.get(\"/{task_id}\")\ndef get_task(task_id: int):\n    ..."}
        />

        <RecallCard
          question={"Сформулируйте главную идею раздела своими словами."}
          answer={<p>
            {"Параметр prefix задаёт повторяющуюся часть URL один раз. Путь внутри декоратора читается относительно prefix: корень router становится списком задач, а /{task_id} — одной задачей."}
          </p>}
        />

        <Callout tone="info">
          {"Не добавляем новый стек: текущая цель — уверенно понять общий prefix для ресурса и проверить наблюдаемый результат."}
        </Callout>
      </Section>

      <Section number="04" title={"tags и документация Swagger"}>
        <Lead>
          {"Tags группируют операции в OpenAPI и помогают быстро найти маршруты tasks. Они не меняют URL, body или результат endpoint, поэтому их нужно отличать от prefix."}
        </Lead>

        <div className="lesson-practice-steps">
          <h3>{"Опора на прошлый шаг"}</h3>
          <p>
            {"Используем то, что уже было проверено в разделе 03, и меняем только одну часть системы."}
          </p>

          <h3>{"Новый небольшой шаг"}</h3>
          <p>
            {"Разбираем «tags и документация Swagger» на одном небольшом примере и связываем его с текущим Planner API."}
          </p>

          <h3>{"Граница сложности"}</h3>
          <p>
            {"Не добавляем новый стек: текущая цель — уверенно понять tags и документация swagger и проверить наблюдаемый результат."}
          </p>
        </div>

        <TypeCards>
          <TypeCard badge={"вход"} title={"Что уже известно"} code={"проверенный контракт"}>
            {"Начинаем с существующего поведения и не переписываем соседние части без необходимости."}
          </TypeCard>
          <TypeCard badge={"шаг"} badgeTone="float" title={"Что делаем"} code={"tags и документация Swagger"}>
            {"Разбираем «tags и документация Swagger» на одном небольшом примере и связываем его с текущим Planner API."}
          </TypeCard>
          <TypeCard badge={"результат"} badgeTone="str" title={"Что проверяем"} code={"status + JSON + state"}>
            {"Проверяем публичный результат и только затем переходим к следующему разделу."}
          </TypeCard>
        </TypeCards>

        <CodeBlock
          caption={"tags и документация Swagger"}
          code={"router = APIRouter(\n    prefix=\"/tasks\",\n    tags=[\"tasks\"],\n)"}
        />

        <CompareSolutions
          question={"Какой подход лучше сохраняет ясную границу ответственности?"}
          left={{
            title: "Смешать всё в одном месте",
            code: "# HTTP, данные и правила в одной функции",
            note: "Изменение одной части требует читать весь сценарий.",
          }}
          right={{
            title: "Оставить явный контракт",
            code: "router = APIRouter(\n    prefix=\"/tasks\",\n    tags=[\"tasks\"],\n)",
            note: "Каждая часть делает одну понятную работу.",
          }}
          preferred="right"
          explanation={"Явная граница снижает нагрузку на новичка и упрощает проверку результата."}
        />

        <RecallCard
          question={"Сформулируйте главную идею раздела своими словами."}
          answer={<p>
            {"Tags группируют операции в OpenAPI и помогают быстро найти маршруты tasks. Они не меняют URL, body или результат endpoint, поэтому их нужно отличать от prefix."}
          </p>}
        />

        <Callout tone="info">
          {"Не добавляем новый стек: текущая цель — уверенно понять tags и документация swagger и проверить наблюдаемый результат."}
        </Callout>
      </Section>

      <Section number="05" title={"include_router в main.py"}>
        <Lead>
          {"Router не подключается автоматически. Main импортирует готовый объект и вызывает app.include_router, после чего операции становятся частью общего приложения."}
        </Lead>

        <div className="lesson-practice-steps">
          <h3>{"Опора на прошлый шаг"}</h3>
          <p>
            {"Используем то, что уже было проверено в разделе 04, и меняем только одну часть системы."}
          </p>

          <h3>{"Новый небольшой шаг"}</h3>
          <p>
            {"Разбираем «include_router в main.py» на одном небольшом примере и связываем его с текущим Planner API."}
          </p>

          <h3>{"Граница сложности"}</h3>
          <p>
            {"Не добавляем новый стек: текущая цель — уверенно понять include_router в main.py и проверить наблюдаемый результат."}
          </p>
        </div>

        <TypeCards>
          <TypeCard badge={"вход"} title={"Что уже известно"} code={"проверенный контракт"}>
            {"Начинаем с существующего поведения и не переписываем соседние части без необходимости."}
          </TypeCard>
          <TypeCard badge={"шаг"} badgeTone="float" title={"Что делаем"} code={"include_router в main.py"}>
            {"Разбираем «include_router в main.py» на одном небольшом примере и связываем его с текущим Planner API."}
          </TypeCard>
          <TypeCard badge={"результат"} badgeTone="str" title={"Что проверяем"} code={"status + JSON + state"}>
            {"Проверяем публичный результат и только затем переходим к следующему разделу."}
          </TypeCard>
        </TypeCards>

        <CodeBlock
          caption={"include_router в main.py"}
          code={"from fastapi import FastAPI\nfrom app.routers.tasks import router as tasks_router\n\napp = FastAPI(title=\"StudyHub Planner API\")\napp.include_router(tasks_router)"}
        />

        <BugHunt
          code={"# ошибка: важное правило пропущено\nfrom fastapi import FastAPI\nfrom app.routers.tasks import router as tasks_router\n\napp = FastAPI(title=\"StudyHub Planner API\")\napp.include_router(tasks_router)"}
          question={"Какую проблему нужно проверить в первую очередь?"}
          options={[
            "Нарушен публичный контракт текущей операции",
            "Нужно немедленно добавить PostgreSQL",
            "Нужно удалить все типы данных",
          ]}
          correctIndex={0}
          explanation={"Сначала сравнивают метод, путь, статус, JSON и состояние с утверждённым контрактом."}
          fix={"from fastapi import FastAPI\nfrom app.routers.tasks import router as tasks_router\n\napp = FastAPI(title=\"StudyHub Planner API\")\napp.include_router(tasks_router)"}
        />

        <RecallCard
          question={"Сформулируйте главную идею раздела своими словами."}
          answer={<p>
            {"Router не подключается автоматически. Main импортирует готовый объект и вызывает app.include_router, после чего операции становятся частью общего приложения."}
          </p>}
        />

        <Callout tone="info">
          {"Не добавляем новый стек: текущая цель — уверенно понять include_router в main.py и проверить наблюдаемый результат."}
        </Callout>
      </Section>

      <Section number="06" title={"Безопасный перенос существующих endpoint"}>
        <Lead>
          {"Перенос является рефакторингом: методы, итоговые пути, статусы и JSON должны остаться прежними. Сначала переносим GET, проверяем их, затем переносим операции изменения состояния."}
        </Lead>

        <div className="lesson-practice-steps">
          <h3>{"Опора на прошлый шаг"}</h3>
          <p>
            {"Используем то, что уже было проверено в разделе 05, и меняем только одну часть системы."}
          </p>

          <h3>{"Новый небольшой шаг"}</h3>
          <p>
            {"Разбираем «Безопасный перенос существующих endpoint» на одном небольшом примере и связываем его с текущим Planner API."}
          </p>

          <h3>{"Граница сложности"}</h3>
          <p>
            {"Не добавляем новый стек: текущая цель — уверенно понять безопасный перенос существующих endpoint и проверить наблюдаемый результат."}
          </p>
        </div>

        <TypeCards>
          <TypeCard badge={"вход"} title={"Что уже известно"} code={"проверенный контракт"}>
            {"Начинаем с существующего поведения и не переписываем соседние части без необходимости."}
          </TypeCard>
          <TypeCard badge={"шаг"} badgeTone="float" title={"Что делаем"} code={"Безопасный перенос существующих endpoint"}>
            {"Разбираем «Безопасный перенос существующих endpoint» на одном небольшом примере и связываем его с текущим Planner API."}
          </TypeCard>
          <TypeCard badge={"результат"} badgeTone="str" title={"Что проверяем"} code={"status + JSON + state"}>
            {"Проверяем публичный результат и только затем переходим к следующему разделу."}
          </TypeCard>
        </TypeCards>

        <CodeBlock
          caption={"Безопасный перенос существующих endpoint"}
          code={"# было\n@app.get(\"/tasks/{task_id}\")\ndef get_task(task_id: int):\n    ...\n\n# стало при prefix=\"/tasks\"\n@router.get(\"/{task_id}\")\ndef get_task(task_id: int):\n    ..."}
        />

        <StepThrough
          code={"# было\n@app.get(\"/tasks/{task_id}\")\ndef get_task(task_id: int):\n    ...\n\n# стало при prefix=\"/tasks\"\n@router.get(\"/{task_id}\")\ndef get_task(task_id: int):\n    ..."}
          steps={[
            { line: 0, note: "Определяется вход текущей операции.", vars: { этап: "input" } },
            { line: 1, note: "Выполняется одна основная ответственность.", vars: { этап: "action" } },
            { line: 2, note: "Получается проверяемый результат.", vars: { этап: "result" } },
          ]}
        />

        <RecallCard
          question={"Сформулируйте главную идею раздела своими словами."}
          answer={<p>
            {"Перенос является рефакторингом: методы, итоговые пути, статусы и JSON должны остаться прежними. Сначала переносим GET, проверяем их, затем переносим операции изменения состояния."}
          </p>}
        />

        <Callout tone="info">
          {"Не добавляем новый стек: текущая цель — уверенно понять безопасный перенос существующих endpoint и проверить наблюдаемый результат."}
        </Callout>
      </Section>

      <Section number="07" title={"Пакет routers и направление импортов"}>
        <Lead>
          {"Main подключает router, router вызывает crud, crud работает со storage. Обратный импорт app из main.py создаёт цикл и смешивает сборку приложения с логикой ресурса."}
        </Lead>

        <div className="lesson-practice-steps">
          <h3>{"Опора на прошлый шаг"}</h3>
          <p>
            {"Используем то, что уже было проверено в разделе 06, и меняем только одну часть системы."}
          </p>

          <h3>{"Новый небольшой шаг"}</h3>
          <p>
            {"Разбираем «Пакет routers и направление импортов» на одном небольшом примере и связываем его с текущим Planner API."}
          </p>

          <h3>{"Граница сложности"}</h3>
          <p>
            {"Не добавляем новый стек: текущая цель — уверенно понять пакет routers и направление импортов и проверить наблюдаемый результат."}
          </p>
        </div>

        <TypeCards>
          <TypeCard badge={"вход"} title={"Что уже известно"} code={"проверенный контракт"}>
            {"Начинаем с существующего поведения и не переписываем соседние части без необходимости."}
          </TypeCard>
          <TypeCard badge={"шаг"} badgeTone="float" title={"Что делаем"} code={"Пакет routers и направление импортов"}>
            {"Разбираем «Пакет routers и направление импортов» на одном небольшом примере и связываем его с текущим Planner API."}
          </TypeCard>
          <TypeCard badge={"результат"} badgeTone="str" title={"Что проверяем"} code={"status + JSON + state"}>
            {"Проверяем публичный результат и только затем переходим к следующему разделу."}
          </TypeCard>
        </TypeCards>

        <CodeBlock
          caption={"Пакет routers и направление импортов"}
          code={"app/\n├── main.py\n├── schemas.py\n├── storage.py\n├── crud.py\n└── routers/\n    ├── __init__.py\n    └── tasks.py"}
        />

        <CodeSequence
          title={"Соберите безопасную последовательность"}
          prompt={"Расположите действия так, чтобы каждый шаг можно было проверить отдельно."}
          pieces={[
            { id: "baseline", code: "зафиксировать текущее поведение" },
            { id: "change", code: "изменить одну ответственность" },
            { id: "run", code: "повторить запрос или тест" },
            { id: "compare", code: "сравнить статус, JSON и состояние" },
            { id: "commit", code: "сохранить отдельный Git-коммит" },
          ]}
          correctOrder={["baseline", "change", "run", "compare", "commit"]}
          explanation={"Маленькие проверяемые изменения не создают резкого скачка сложности."}
        />

        <RecallCard
          question={"Сформулируйте главную идею раздела своими словами."}
          answer={<p>
            {"Main подключает router, router вызывает crud, crud работает со storage. Обратный импорт app из main.py создаёт цикл и смешивает сборку приложения с логикой ресурса."}
          </p>}
        />

        <Callout tone="info">
          {"Не добавляем новый стек: текущая цель — уверенно понять пакет routers и направление импортов и проверить наблюдаемый результат."}
        </Callout>
      </Section>

      <Section number="08" title={"Практика: готовый router задач"}>
        <Lead>
          {"Финал урока переносит все шесть CRUD-операций в routers/tasks.py. Ученик проверяет итоговые URL в /docs и объясняет, из каких частей они складываются."}
        </Lead>

        <div className="lesson-practice-steps">
          <h3>{"Опора на прошлый шаг"}</h3>
          <p>
            {"Используем то, что уже было проверено в разделе 07, и меняем только одну часть системы."}
          </p>

          <h3>{"Новый небольшой шаг"}</h3>
          <p>
            {"Разбираем «Практика: готовый router задач» на одном небольшом примере и связываем его с текущим Planner API."}
          </p>

          <h3>{"Граница сложности"}</h3>
          <p>
            {"Не добавляем новый стек: текущая цель — уверенно понять практика: готовый router задач и проверить наблюдаемый результат."}
          </p>
        </div>

        <TypeCards>
          <TypeCard badge={"вход"} title={"Что уже известно"} code={"проверенный контракт"}>
            {"Начинаем с существующего поведения и не переписываем соседние части без необходимости."}
          </TypeCard>
          <TypeCard badge={"шаг"} badgeTone="float" title={"Что делаем"} code={"Практика: готовый router задач"}>
            {"Разбираем «Практика: готовый router задач» на одном небольшом примере и связываем его с текущим Planner API."}
          </TypeCard>
          <TypeCard badge={"результат"} badgeTone="str" title={"Что проверяем"} code={"status + JSON + state"}>
            {"Проверяем публичный результат и только затем переходим к следующему разделу."}
          </TypeCard>
        </TypeCards>

        <CodeBlock
          caption={"Практика: готовый router задач"}
          code={"router = APIRouter(prefix=\"/tasks\", tags=[\"tasks\"])\n\n@router.get(\"/\", response_model=list[TaskRead])\ndef list_tasks():\n    return crud.list_tasks()\n\n@router.get(\"/{task_id}\", response_model=TaskRead)\ndef get_task(task_id: int):\n    return get_task_or_404(task_id)"}
        />

        <RecallCard
          question={"Сформулируйте главную идею раздела своими словами."}
          answer={<p>
            {"Финал урока переносит все шесть CRUD-операций в routers/tasks.py. Ученик проверяет итоговые URL в /docs и объясняет, из каких частей они складываются."}
          </p>}
        />

        <Callout tone="info">
          {"Не добавляем новый стек: текущая цель — уверенно понять практика: готовый router задач и проверить наблюдаемый результат."}
        </Callout>

        <div className="lesson-check-group">
          <QuizCard
            question={"Что проверяем после изменения?"}
            options={[
              "публичный контракт",
              "только число строк",
              "название папки",
            ]}
            correctIndex={0}
            explanation={"Текущий блок строится на явном результате и последовательной проверке."}
          />
          <QuizCard
            question={"Как повышается сложность?"}
            options={[
              "по одному небольшому шагу",
              "сразу новым стеком",
              "без проверки",
            ]}
            correctIndex={0}
            explanation={"Текущий блок строится на явном результате и последовательной проверке."}
          />
          <QuizCard
            question={"Что остаётся главным артефактом?"}
            options={[
              "работающий Planner API",
              "случайный пример",
              "неиспользуемый файл",
            ]}
            correctIndex={0}
            explanation={"Текущий блок строится на явном результате и последовательной проверке."}
          />
          <QuizCard
            question={"Когда переходить дальше?"}
            options={[
              "после проверки текущего результата",
              "до запуска кода",
              "после удаления тестов",
            ]}
            correctIndex={0}
            explanation={"Текущий блок строится на явном результате и последовательной проверке."}
          />
        </div>

        <KeyTakeaways
          points={[
            <>{"Каждый новый шаг опирается на уже работающий контракт."}</>,
            <>{"Структура проекта остаётся небольшой и объяснимой."}</>,
            <>{"Метод, путь, статус и JSON проверяются отдельно."}</>,
            <>{"Ошибочные сценарии являются частью API-контракта."}</>,
            <>{"Git-коммит фиксирует одну завершённую мысль."}</>,
            <>{"Следующий стек появляется только после понятной проблемы."}</>,
          ]}
        />

        <PracticeCta text={"Повторите все восемь разделов урока на Planner API и сохраните проверенный результат отдельным коммитом."} />
      </Section>

    </RichLesson>
  );
}

// 64. Тесты FastAPI через TestClient
export function Lesson64({ module }: { module?: string }) {
  return (
    <RichLesson>
      <RichHero
        variant="project"
        chip={module ?? BLOCK_TITLE}
        title={"Тесты FastAPI через TestClient"}
        intro={"Swagger помогает исследовать API, но человек может забыть повторить один сценарий. Автоматический тест фиксирует метод, путь, статус и JSON и повторяет проверку после каждого изменения. Материал развивается маленькими шагами и использует только уже знакомые части Planner API."}
        tags={[
          { icon: <Bug size={14} />, label: "TestClient и pytest" },
          { icon: <ShieldCheck size={14} />, label: "успех и ошибки" },
        ]}
      />
      <TheoryBridge lesson={64} />

      <Section number="01" title={"Почему ручной проверки недостаточно"}>
        <Lead>
          {"Swagger помогает исследовать API, но человек может забыть повторить один сценарий. Автоматический тест фиксирует метод, путь, статус и JSON и повторяет проверку после каждого изменения."}
        </Lead>

        <div className="lesson-practice-steps">
          <h3>{"Опора на прошлый шаг"}</h3>
          <p>
            {"Используем то, что уже было проверено в предыдущих занятиях, и меняем только одну часть системы."}
          </p>

          <h3>{"Новый небольшой шаг"}</h3>
          <p>
            {"Разбираем «Почему ручной проверки недостаточно» на одном небольшом примере и связываем его с текущим Planner API."}
          </p>

          <h3>{"Граница сложности"}</h3>
          <p>
            {"Не добавляем новый стек: текущая цель — уверенно понять почему ручной проверки недостаточно и проверить наблюдаемый результат."}
          </p>
        </div>

        <TypeCards>
          <TypeCard badge={"вход"} title={"Что уже известно"} code={"проверенный контракт"}>
            {"Начинаем с существующего поведения и не переписываем соседние части без необходимости."}
          </TypeCard>
          <TypeCard badge={"шаг"} badgeTone="float" title={"Что делаем"} code={"Почему ручной проверки недостаточно"}>
            {"Разбираем «Почему ручной проверки недостаточно» на одном небольшом примере и связываем его с текущим Planner API."}
          </TypeCard>
          <TypeCard badge={"результат"} badgeTone="str" title={"Что проверяем"} code={"status + JSON + state"}>
            {"Проверяем публичный результат и только затем переходим к следующему разделу."}
          </TypeCard>
        </TypeCards>

        <CodeBlock
          caption={"Почему ручной проверки недостаточно"}
          code={"GET /tasks/\nожидаемый статус: 200\nожидаемое тело: []"}
        />

        <RecallCard
          question={"Сформулируйте главную идею раздела своими словами."}
          answer={<p>
            {"Swagger помогает исследовать API, но человек может забыть повторить один сценарий. Автоматический тест фиксирует метод, путь, статус и JSON и повторяет проверку после каждого изменения."}
          </p>}
        />

        <Callout tone="info">
          {"Не добавляем новый стек: текущая цель — уверенно понять почему ручной проверки недостаточно и проверить наблюдаемый результат."}
        </Callout>
      </Section>

      <Section number="02" title={"Создание TestClient"}>
        <Lead>
          {"TestClient получает готовый объект FastAPI app и отправляет запросы без отдельного запуска Uvicorn. Функции test_ обнаруживаются pytest по знакомому соглашению имён."}
        </Lead>

        <div className="lesson-practice-steps">
          <h3>{"Опора на прошлый шаг"}</h3>
          <p>
            {"Используем то, что уже было проверено в разделе 01, и меняем только одну часть системы."}
          </p>

          <h3>{"Новый небольшой шаг"}</h3>
          <p>
            {"Разбираем «Создание TestClient» на одном небольшом примере и связываем его с текущим Planner API."}
          </p>

          <h3>{"Граница сложности"}</h3>
          <p>
            {"Не добавляем новый стек: текущая цель — уверенно понять создание testclient и проверить наблюдаемый результат."}
          </p>
        </div>

        <TypeCards>
          <TypeCard badge={"вход"} title={"Что уже известно"} code={"проверенный контракт"}>
            {"Начинаем с существующего поведения и не переписываем соседние части без необходимости."}
          </TypeCard>
          <TypeCard badge={"шаг"} badgeTone="float" title={"Что делаем"} code={"Создание TestClient"}>
            {"Разбираем «Создание TestClient» на одном небольшом примере и связываем его с текущим Planner API."}
          </TypeCard>
          <TypeCard badge={"результат"} badgeTone="str" title={"Что проверяем"} code={"status + JSON + state"}>
            {"Проверяем публичный результат и только затем переходим к следующему разделу."}
          </TypeCard>
        </TypeCards>

        <CodeBlock
          caption={"Создание TestClient"}
          code={"from fastapi.testclient import TestClient\nfrom app.main import app\n\nclient = TestClient(app)\n\ndef test_list_tasks():\n    response = client.get(\"/tasks/\")\n    assert response.status_code == 200"}
        />

        <PredictOutput
          code={"from fastapi.testclient import TestClient\nfrom app.main import app\n\nclient = TestClient(app)\n\ndef test_list_tasks():\n    response = client.get(\"/tasks/\")\n    assert response.status_code == 200"}
          output={"Результат соответствует контракту текущего раздела"}
          hint={"Сначала проследите вход, затем действие и только потом итог."}
        />

        <RecallCard
          question={"Сформулируйте главную идею раздела своими словами."}
          answer={<p>
            {"TestClient получает готовый объект FastAPI app и отправляет запросы без отдельного запуска Uvicorn. Функции test_ обнаруживаются pytest по знакомому соглашению имён."}
          </p>}
        />

        <Callout tone="info">
          {"Не добавляем новый стек: текущая цель — уверенно понять создание testclient и проверить наблюдаемый результат."}
        </Callout>
      </Section>

      <Section number="03" title={"Статус и JSON проверяются отдельно"}>
        <Lead>
          {"Status code сообщает общий HTTP-результат, а response.json() показывает публичное тело. Раздельные assert помогают быстрее понять, что именно нарушилось."}
        </Lead>

        <div className="lesson-practice-steps">
          <h3>{"Опора на прошлый шаг"}</h3>
          <p>
            {"Используем то, что уже было проверено в разделе 02, и меняем только одну часть системы."}
          </p>

          <h3>{"Новый небольшой шаг"}</h3>
          <p>
            {"Разбираем «Статус и JSON проверяются отдельно» на одном небольшом примере и связываем его с текущим Planner API."}
          </p>

          <h3>{"Граница сложности"}</h3>
          <p>
            {"Не добавляем новый стек: текущая цель — уверенно понять статус и json проверяются отдельно и проверить наблюдаемый результат."}
          </p>
        </div>

        <TypeCards>
          <TypeCard badge={"вход"} title={"Что уже известно"} code={"проверенный контракт"}>
            {"Начинаем с существующего поведения и не переписываем соседние части без необходимости."}
          </TypeCard>
          <TypeCard badge={"шаг"} badgeTone="float" title={"Что делаем"} code={"Статус и JSON проверяются отдельно"}>
            {"Разбираем «Статус и JSON проверяются отдельно» на одном небольшом примере и связываем его с текущим Planner API."}
          </TypeCard>
          <TypeCard badge={"результат"} badgeTone="str" title={"Что проверяем"} code={"status + JSON + state"}>
            {"Проверяем публичный результат и только затем переходим к следующему разделу."}
          </TypeCard>
        </TypeCards>

        <CodeBlock
          caption={"Статус и JSON проверяются отдельно"}
          code={"response = client.get(\"/tasks/\")\n\nassert response.status_code == 200\nassert response.json() == []"}
        />

        <RecallCard
          question={"Сформулируйте главную идею раздела своими словами."}
          answer={<p>
            {"Status code сообщает общий HTTP-результат, а response.json() показывает публичное тело. Раздельные assert помогают быстрее понять, что именно нарушилось."}
          </p>}
        />

        <Callout tone="info">
          {"Не добавляем новый стек: текущая цель — уверенно понять статус и json проверяются отдельно и проверить наблюдаемый результат."}
        </Callout>
      </Section>

      <Section number="04" title={"POST-запрос через параметр json"}>
        <Lead>
          {"Python-словарь передаётся через json, после чего TestClient сериализует его как JSON body. Тест проверяет 201 и поля TaskRead, которые добавляет сервер."}
        </Lead>

        <div className="lesson-practice-steps">
          <h3>{"Опора на прошлый шаг"}</h3>
          <p>
            {"Используем то, что уже было проверено в разделе 03, и меняем только одну часть системы."}
          </p>

          <h3>{"Новый небольшой шаг"}</h3>
          <p>
            {"Разбираем «POST-запрос через параметр json» на одном небольшом примере и связываем его с текущим Planner API."}
          </p>

          <h3>{"Граница сложности"}</h3>
          <p>
            {"Не добавляем новый стек: текущая цель — уверенно понять post-запрос через параметр json и проверить наблюдаемый результат."}
          </p>
        </div>

        <TypeCards>
          <TypeCard badge={"вход"} title={"Что уже известно"} code={"проверенный контракт"}>
            {"Начинаем с существующего поведения и не переписываем соседние части без необходимости."}
          </TypeCard>
          <TypeCard badge={"шаг"} badgeTone="float" title={"Что делаем"} code={"POST-запрос через параметр json"}>
            {"Разбираем «POST-запрос через параметр json» на одном небольшом примере и связываем его с текущим Planner API."}
          </TypeCard>
          <TypeCard badge={"результат"} badgeTone="str" title={"Что проверяем"} code={"status + JSON + state"}>
            {"Проверяем публичный результат и только затем переходим к следующему разделу."}
          </TypeCard>
        </TypeCards>

        <CodeBlock
          caption={"POST-запрос через параметр json"}
          code={"response = client.post(\n    \"/tasks/\",\n    json={\"title\": \"Python\", \"priority\": 4},\n)\n\nassert response.status_code == 201\nassert response.json()[\"is_done\"] is False"}
        />

        <CompareSolutions
          question={"Какой подход лучше сохраняет ясную границу ответственности?"}
          left={{
            title: "Смешать всё в одном месте",
            code: "# HTTP, данные и правила в одной функции",
            note: "Изменение одной части требует читать весь сценарий.",
          }}
          right={{
            title: "Оставить явный контракт",
            code: "response = client.post(\n    \"/tasks/\",\n    json={\"title\": \"Python\", \"priority\": 4},\n)\n\nassert response.status_code == 201\nassert response.json()[\"is_done\"] is False",
            note: "Каждая часть делает одну понятную работу.",
          }}
          preferred="right"
          explanation={"Явная граница снижает нагрузку на новичка и упрощает проверку результата."}
        />

        <RecallCard
          question={"Сформулируйте главную идею раздела своими словами."}
          answer={<p>
            {"Python-словарь передаётся через json, после чего TestClient сериализует его как JSON body. Тест проверяет 201 и поля TaskRead, которые добавляет сервер."}
          </p>}
        />

        <Callout tone="info">
          {"Не добавляем новый стек: текущая цель — уверенно понять post-запрос через параметр json и проверить наблюдаемый результат."}
        </Callout>
      </Section>

      <Section number="05" title={"Ошибочный сценарий 404"}>
        <Lead>
          {"Успешное чтение не выполняет ветку отсутствующего id. Отдельный тест фиксирует 404 и единый detail, не проверяя внутренний traceback приложения."}
        </Lead>

        <div className="lesson-practice-steps">
          <h3>{"Опора на прошлый шаг"}</h3>
          <p>
            {"Используем то, что уже было проверено в разделе 04, и меняем только одну часть системы."}
          </p>

          <h3>{"Новый небольшой шаг"}</h3>
          <p>
            {"Разбираем «Ошибочный сценарий 404» на одном небольшом примере и связываем его с текущим Planner API."}
          </p>

          <h3>{"Граница сложности"}</h3>
          <p>
            {"Не добавляем новый стек: текущая цель — уверенно понять ошибочный сценарий 404 и проверить наблюдаемый результат."}
          </p>
        </div>

        <TypeCards>
          <TypeCard badge={"вход"} title={"Что уже известно"} code={"проверенный контракт"}>
            {"Начинаем с существующего поведения и не переписываем соседние части без необходимости."}
          </TypeCard>
          <TypeCard badge={"шаг"} badgeTone="float" title={"Что делаем"} code={"Ошибочный сценарий 404"}>
            {"Разбираем «Ошибочный сценарий 404» на одном небольшом примере и связываем его с текущим Planner API."}
          </TypeCard>
          <TypeCard badge={"результат"} badgeTone="str" title={"Что проверяем"} code={"status + JSON + state"}>
            {"Проверяем публичный результат и только затем переходим к следующему разделу."}
          </TypeCard>
        </TypeCards>

        <CodeBlock
          caption={"Ошибочный сценарий 404"}
          code={"response = client.get(\"/tasks/999\")\n\nassert response.status_code == 404\nassert response.json() == {\"detail\": \"Task not found\"}"}
        />

        <BugHunt
          code={"# ошибка: важное правило пропущено\nresponse = client.get(\"/tasks/999\")\n\nassert response.status_code == 404\nassert response.json() == {\"detail\": \"Task not found\"}"}
          question={"Какую проблему нужно проверить в первую очередь?"}
          options={[
            "Нарушен публичный контракт текущей операции",
            "Нужно немедленно добавить PostgreSQL",
            "Нужно удалить все типы данных",
          ]}
          correctIndex={0}
          explanation={"Сначала сравнивают метод, путь, статус, JSON и состояние с утверждённым контрактом."}
          fix={"response = client.get(\"/tasks/999\")\n\nassert response.status_code == 404\nassert response.json() == {\"detail\": \"Task not found\"}"}
        />

        <RecallCard
          question={"Сформулируйте главную идею раздела своими словами."}
          answer={<p>
            {"Успешное чтение не выполняет ветку отсутствующего id. Отдельный тест фиксирует 404 и единый detail, не проверяя внутренний traceback приложения."}
          </p>}
        />

        <Callout tone="info">
          {"Не добавляем новый стек: текущая цель — уверенно понять ошибочный сценарий 404 и проверить наблюдаемый результат."}
        </Callout>
      </Section>

      <Section number="06" title={"Ошибочный сценарий 422"}>
        <Lead>
          {"Невалидное body останавливается Pydantic до выполнения endpoint. После ответа 422 тест дополнительно убеждается, что storage не получил новую задачу."}
        </Lead>

        <div className="lesson-practice-steps">
          <h3>{"Опора на прошлый шаг"}</h3>
          <p>
            {"Используем то, что уже было проверено в разделе 05, и меняем только одну часть системы."}
          </p>

          <h3>{"Новый небольшой шаг"}</h3>
          <p>
            {"Разбираем «Ошибочный сценарий 422» на одном небольшом примере и связываем его с текущим Planner API."}
          </p>

          <h3>{"Граница сложности"}</h3>
          <p>
            {"Не добавляем новый стек: текущая цель — уверенно понять ошибочный сценарий 422 и проверить наблюдаемый результат."}
          </p>
        </div>

        <TypeCards>
          <TypeCard badge={"вход"} title={"Что уже известно"} code={"проверенный контракт"}>
            {"Начинаем с существующего поведения и не переписываем соседние части без необходимости."}
          </TypeCard>
          <TypeCard badge={"шаг"} badgeTone="float" title={"Что делаем"} code={"Ошибочный сценарий 422"}>
            {"Разбираем «Ошибочный сценарий 422» на одном небольшом примере и связываем его с текущим Planner API."}
          </TypeCard>
          <TypeCard badge={"результат"} badgeTone="str" title={"Что проверяем"} code={"status + JSON + state"}>
            {"Проверяем публичный результат и только затем переходим к следующему разделу."}
          </TypeCard>
        </TypeCards>

        <CodeBlock
          caption={"Ошибочный сценарий 422"}
          code={"response = client.post(\n    \"/tasks/\",\n    json={\"title\": \"SQL\", \"priority\": 10},\n)\nassert response.status_code == 422\nassert client.get(\"/tasks/\").json() == []"}
        />

        <StepThrough
          code={"response = client.post(\n    \"/tasks/\",\n    json={\"title\": \"SQL\", \"priority\": 10},\n)\nassert response.status_code == 422\nassert client.get(\"/tasks/\").json() == []"}
          steps={[
            { line: 0, note: "Определяется вход текущей операции.", vars: { этап: "input" } },
            { line: 1, note: "Выполняется одна основная ответственность.", vars: { этап: "action" } },
            { line: 2, note: "Получается проверяемый результат.", vars: { этап: "result" } },
          ]}
        />

        <RecallCard
          question={"Сформулируйте главную идею раздела своими словами."}
          answer={<p>
            {"Невалидное body останавливается Pydantic до выполнения endpoint. После ответа 422 тест дополнительно убеждается, что storage не получил новую задачу."}
          </p>}
        />

        <Callout tone="info">
          {"Не добавляем новый стек: текущая цель — уверенно понять ошибочный сценарий 422 и проверить наблюдаемый результат."}
        </Callout>
      </Section>

      <Section number="07" title={"Очистка состояния между тестами"}>
        <Lead>
          {"Глобальный список хранится между запросами одного процесса. Fixture очищает тот же объект через clear, поэтому результат теста не зависит от порядка запуска."}
        </Lead>

        <div className="lesson-practice-steps">
          <h3>{"Опора на прошлый шаг"}</h3>
          <p>
            {"Используем то, что уже было проверено в разделе 06, и меняем только одну часть системы."}
          </p>

          <h3>{"Новый небольшой шаг"}</h3>
          <p>
            {"Разбираем «Очистка состояния между тестами» на одном небольшом примере и связываем его с текущим Planner API."}
          </p>

          <h3>{"Граница сложности"}</h3>
          <p>
            {"Не добавляем новый стек: текущая цель — уверенно понять очистка состояния между тестами и проверить наблюдаемый результат."}
          </p>
        </div>

        <TypeCards>
          <TypeCard badge={"вход"} title={"Что уже известно"} code={"проверенный контракт"}>
            {"Начинаем с существующего поведения и не переписываем соседние части без необходимости."}
          </TypeCard>
          <TypeCard badge={"шаг"} badgeTone="float" title={"Что делаем"} code={"Очистка состояния между тестами"}>
            {"Разбираем «Очистка состояния между тестами» на одном небольшом примере и связываем его с текущим Planner API."}
          </TypeCard>
          <TypeCard badge={"результат"} badgeTone="str" title={"Что проверяем"} code={"status + JSON + state"}>
            {"Проверяем публичный результат и только затем переходим к следующему разделу."}
          </TypeCard>
        </TypeCards>

        <CodeBlock
          caption={"Очистка состояния между тестами"}
          code={"import pytest\nfrom app.storage import tasks\n\n@pytest.fixture(autouse=True)\ndef clear_tasks():\n    tasks.clear()\n    yield\n    tasks.clear()"}
        />

        <CodeSequence
          title={"Соберите безопасную последовательность"}
          prompt={"Расположите действия так, чтобы каждый шаг можно было проверить отдельно."}
          pieces={[
            { id: "baseline", code: "зафиксировать текущее поведение" },
            { id: "change", code: "изменить одну ответственность" },
            { id: "run", code: "повторить запрос или тест" },
            { id: "compare", code: "сравнить статус, JSON и состояние" },
            { id: "commit", code: "сохранить отдельный Git-коммит" },
          ]}
          correctOrder={["baseline", "change", "run", "compare", "commit"]}
          explanation={"Маленькие проверяемые изменения не создают резкого скачка сложности."}
        />

        <RecallCard
          question={"Сформулируйте главную идею раздела своими словами."}
          answer={<p>
            {"Глобальный список хранится между запросами одного процесса. Fixture очищает тот же объект через clear, поэтому результат теста не зависит от порядка запуска."}
          </p>}
        />

        <Callout tone="info">
          {"Не добавляем новый стек: текущая цель — уверенно понять очистка состояния между тестами и проверить наблюдаемый результат."}
        </Callout>
      </Section>

      <Section number="08" title={"Минимальный набор API-тестов"}>
        <Lead>
          {"Финал урока включает пустой список, создание, чтение, 404 и 422. PUT, PATCH и DELETE добавятся в финальном проекте, когда ученик уже уверен в базовом устройстве теста."}
        </Lead>

        <div className="lesson-practice-steps">
          <h3>{"Опора на прошлый шаг"}</h3>
          <p>
            {"Используем то, что уже было проверено в разделе 07, и меняем только одну часть системы."}
          </p>

          <h3>{"Новый небольшой шаг"}</h3>
          <p>
            {"Разбираем «Минимальный набор API-тестов» на одном небольшом примере и связываем его с текущим Planner API."}
          </p>

          <h3>{"Граница сложности"}</h3>
          <p>
            {"Не добавляем новый стек: текущая цель — уверенно понять минимальный набор api-тестов и проверить наблюдаемый результат."}
          </p>
        </div>

        <TypeCards>
          <TypeCard badge={"вход"} title={"Что уже известно"} code={"проверенный контракт"}>
            {"Начинаем с существующего поведения и не переписываем соседние части без необходимости."}
          </TypeCard>
          <TypeCard badge={"шаг"} badgeTone="float" title={"Что делаем"} code={"Минимальный набор API-тестов"}>
            {"Разбираем «Минимальный набор API-тестов» на одном небольшом примере и связываем его с текущим Planner API."}
          </TypeCard>
          <TypeCard badge={"результат"} badgeTone="str" title={"Что проверяем"} code={"status + JSON + state"}>
            {"Проверяем публичный результат и только затем переходим к следующему разделу."}
          </TypeCard>
        </TypeCards>

        <CodeBlock
          caption={"Минимальный набор API-тестов"}
          code={"$ pytest -q\n.....                                                    [100%]\n5 passed"}
        />

        <RecallCard
          question={"Сформулируйте главную идею раздела своими словами."}
          answer={<p>
            {"Финал урока включает пустой список, создание, чтение, 404 и 422. PUT, PATCH и DELETE добавятся в финальном проекте, когда ученик уже уверен в базовом устройстве теста."}
          </p>}
        />

        <Callout tone="info">
          {"Не добавляем новый стек: текущая цель — уверенно понять минимальный набор api-тестов и проверить наблюдаемый результат."}
        </Callout>

        <div className="lesson-check-group">
          <QuizCard
            question={"Что проверяем после изменения?"}
            options={[
              "публичный контракт",
              "только число строк",
              "название папки",
            ]}
            correctIndex={0}
            explanation={"Текущий блок строится на явном результате и последовательной проверке."}
          />
          <QuizCard
            question={"Как повышается сложность?"}
            options={[
              "по одному небольшому шагу",
              "сразу новым стеком",
              "без проверки",
            ]}
            correctIndex={0}
            explanation={"Текущий блок строится на явном результате и последовательной проверке."}
          />
          <QuizCard
            question={"Что остаётся главным артефактом?"}
            options={[
              "работающий Planner API",
              "случайный пример",
              "неиспользуемый файл",
            ]}
            correctIndex={0}
            explanation={"Текущий блок строится на явном результате и последовательной проверке."}
          />
          <QuizCard
            question={"Когда переходить дальше?"}
            options={[
              "после проверки текущего результата",
              "до запуска кода",
              "после удаления тестов",
            ]}
            correctIndex={0}
            explanation={"Текущий блок строится на явном результате и последовательной проверке."}
          />
        </div>

        <KeyTakeaways
          points={[
            <>{"Каждый новый шаг опирается на уже работающий контракт."}</>,
            <>{"Структура проекта остаётся небольшой и объяснимой."}</>,
            <>{"Метод, путь, статус и JSON проверяются отдельно."}</>,
            <>{"Ошибочные сценарии являются частью API-контракта."}</>,
            <>{"Git-коммит фиксирует одну завершённую мысль."}</>,
            <>{"Следующий стек появляется только после понятной проблемы."}</>,
          ]}
        />

        <PracticeCta text={"Повторите все восемь разделов урока на Planner API и сохраните проверенный результат отдельным коммитом."} />
      </Section>

    </RichLesson>
  );
}

// 65. Финальный проект 1: контракт и архитектура Planner API
export function Lesson65({ module }: { module?: string }) {
  return (
    <RichLesson>
      <RichHero
        variant="project"
        chip={module ?? BLOCK_TITLE}
        title={"Финальный проект 1: контракт и архитектура Planner API"}
        intro={"Обязательный результат — один ресурс tasks, полный CRUD в памяти, схемы, router, документация и тесты. PostgreSQL, авторизация, Docker и очереди намеренно остаются за границей этапа. Материал развивается маленькими шагами и использует только уже знакомые части Planner API."}
        tags={[
          { icon: <ListChecks size={14} />, label: "контракт до кода" },
          { icon: <Layers size={14} />, label: "простая архитектура" },
        ]}
      />
      <TheoryBridge lesson={65} />

      <Section number="01" title={"Границы финального проекта"}>
        <Lead>
          {"Обязательный результат — один ресурс tasks, полный CRUD в памяти, схемы, router, документация и тесты. PostgreSQL, авторизация, Docker и очереди намеренно остаются за границей этапа."}
        </Lead>

        <div className="lesson-practice-steps">
          <h3>{"Опора на прошлый шаг"}</h3>
          <p>
            {"Используем то, что уже было проверено в предыдущих занятиях, и меняем только одну часть системы."}
          </p>

          <h3>{"Новый небольшой шаг"}</h3>
          <p>
            {"Разбираем «Границы финального проекта» на одном небольшом примере и связываем его с текущим Planner API."}
          </p>

          <h3>{"Граница сложности"}</h3>
          <p>
            {"Не добавляем новый стек: текущая цель — уверенно понять границы финального проекта и проверить наблюдаемый результат."}
          </p>
        </div>

        <TypeCards>
          <TypeCard badge={"вход"} title={"Что уже известно"} code={"проверенный контракт"}>
            {"Начинаем с существующего поведения и не переписываем соседние части без необходимости."}
          </TypeCard>
          <TypeCard badge={"шаг"} badgeTone="float" title={"Что делаем"} code={"Границы финального проекта"}>
            {"Разбираем «Границы финального проекта» на одном небольшом примере и связываем его с текущим Planner API."}
          </TypeCard>
          <TypeCard badge={"результат"} badgeTone="str" title={"Что проверяем"} code={"status + JSON + state"}>
            {"Проверяем публичный результат и только затем переходим к следующему разделу."}
          </TypeCard>
        </TypeCards>

        <CodeBlock
          caption={"Границы финального проекта"}
          code={"[x] CRUD tasks\n[x] Pydantic validation\n[x] APIRouter\n[x] TestClient tests\n[x] README and release\n[ ] PostgreSQL\n[ ] JWT"}
        />

        <RecallCard
          question={"Сформулируйте главную идею раздела своими словами."}
          answer={<p>
            {"Обязательный результат — один ресурс tasks, полный CRUD в памяти, схемы, router, документация и тесты. PostgreSQL, авторизация, Docker и очереди намеренно остаются за границей этапа."}
          </p>}
        />

        <Callout tone="info">
          {"Не добавляем новый стек: текущая цель — уверенно понять границы финального проекта и проверить наблюдаемый результат."}
        </Callout>
      </Section>

      <Section number="02" title={"Пользовательские сценарии"}>
        <Lead>
          {"До endpoint формулируется действие клиента: что он отправляет, что получает и какая ошибка возможна. Такой сценарий связывает намерение пользователя с HTTP-контрактом."}
        </Lead>

        <div className="lesson-practice-steps">
          <h3>{"Опора на прошлый шаг"}</h3>
          <p>
            {"Используем то, что уже было проверено в разделе 01, и меняем только одну часть системы."}
          </p>

          <h3>{"Новый небольшой шаг"}</h3>
          <p>
            {"Разбираем «Пользовательские сценарии» на одном небольшом примере и связываем его с текущим Planner API."}
          </p>

          <h3>{"Граница сложности"}</h3>
          <p>
            {"Не добавляем новый стек: текущая цель — уверенно понять пользовательские сценарии и проверить наблюдаемый результат."}
          </p>
        </div>

        <TypeCards>
          <TypeCard badge={"вход"} title={"Что уже известно"} code={"проверенный контракт"}>
            {"Начинаем с существующего поведения и не переписываем соседние части без необходимости."}
          </TypeCard>
          <TypeCard badge={"шаг"} badgeTone="float" title={"Что делаем"} code={"Пользовательские сценарии"}>
            {"Разбираем «Пользовательские сценарии» на одном небольшом примере и связываем его с текущим Planner API."}
          </TypeCard>
          <TypeCard badge={"результат"} badgeTone="str" title={"Что проверяем"} code={"status + JSON + state"}>
            {"Проверяем публичный результат и только затем переходим к следующему разделу."}
          </TypeCard>
        </TypeCards>

        <CodeBlock
          caption={"Пользовательские сценарии"}
          code={"Сценарий: отметить задачу выполненной\nДействие: PATCH /tasks/3\nBody: {\"is_done\": true}\nУспех: 200 TaskRead\nОшибка: 404"}
        />

        <PredictOutput
          code={"Сценарий: отметить задачу выполненной\nДействие: PATCH /tasks/3\nBody: {\"is_done\": true}\nУспех: 200 TaskRead\nОшибка: 404"}
          output={"Результат соответствует контракту текущего раздела"}
          hint={"Сначала проследите вход, затем действие и только потом итог."}
        />

        <RecallCard
          question={"Сформулируйте главную идею раздела своими словами."}
          answer={<p>
            {"До endpoint формулируется действие клиента: что он отправляет, что получает и какая ошибка возможна. Такой сценарий связывает намерение пользователя с HTTP-контрактом."}
          </p>}
        />

        <Callout tone="info">
          {"Не добавляем новый стек: текущая цель — уверенно понять пользовательские сценарии и проверить наблюдаемый результат."}
        </Callout>
      </Section>

      <Section number="03" title={"Таблица endpoint как карта"}>
        <Lead>
          {"Одна таблица фиксирует методы, пути, body, статусы и ответы. Она позволяет увидеть несогласованность до реализации и становится основой для тестов и README."}
        </Lead>

        <div className="lesson-practice-steps">
          <h3>{"Опора на прошлый шаг"}</h3>
          <p>
            {"Используем то, что уже было проверено в разделе 02, и меняем только одну часть системы."}
          </p>

          <h3>{"Новый небольшой шаг"}</h3>
          <p>
            {"Разбираем «Таблица endpoint как карта» на одном небольшом примере и связываем его с текущим Planner API."}
          </p>

          <h3>{"Граница сложности"}</h3>
          <p>
            {"Не добавляем новый стек: текущая цель — уверенно понять таблица endpoint как карта и проверить наблюдаемый результат."}
          </p>
        </div>

        <TypeCards>
          <TypeCard badge={"вход"} title={"Что уже известно"} code={"проверенный контракт"}>
            {"Начинаем с существующего поведения и не переписываем соседние части без необходимости."}
          </TypeCard>
          <TypeCard badge={"шаг"} badgeTone="float" title={"Что делаем"} code={"Таблица endpoint как карта"}>
            {"Разбираем «Таблица endpoint как карта» на одном небольшом примере и связываем его с текущим Planner API."}
          </TypeCard>
          <TypeCard badge={"результат"} badgeTone="str" title={"Что проверяем"} code={"status + JSON + state"}>
            {"Проверяем публичный результат и только затем переходим к следующему разделу."}
          </TypeCard>
        </TypeCards>

        <CodeBlock
          caption={"Таблица endpoint как карта"}
          code={"POST   /tasks/      TaskCreate -> 201 TaskRead\nGET    /tasks/                 -> 200 list[TaskRead]\nGET    /tasks/{id}             -> 200 TaskRead | 404\nPUT    /tasks/{id} TaskCreate  -> 200 TaskRead | 404\nPATCH  /tasks/{id} TaskUpdate  -> 200 TaskRead | 404\nDELETE /tasks/{id}             -> 204 | 404"}
        />

        <RecallCard
          question={"Сформулируйте главную идею раздела своими словами."}
          answer={<p>
            {"Одна таблица фиксирует методы, пути, body, статусы и ответы. Она позволяет увидеть несогласованность до реализации и становится основой для тестов и README."}
          </p>}
        />

        <Callout tone="info">
          {"Не добавляем новый стек: текущая цель — уверенно понять таблица endpoint как карта и проверить наблюдаемый результат."}
        </Callout>
      </Section>

      <Section number="04" title={"Контракты TaskCreate, TaskUpdate, TaskRead"}>
        <Lead>
          {"Разные направления обмена получают разные схемы. Клиент не передаёт id при создании, PATCH допускает отсутствие полей, а публичный ответ всегда содержит полный объект."}
        </Lead>

        <div className="lesson-practice-steps">
          <h3>{"Опора на прошлый шаг"}</h3>
          <p>
            {"Используем то, что уже было проверено в разделе 03, и меняем только одну часть системы."}
          </p>

          <h3>{"Новый небольшой шаг"}</h3>
          <p>
            {"Разбираем «Контракты TaskCreate, TaskUpdate, TaskRead» на одном небольшом примере и связываем его с текущим Planner API."}
          </p>

          <h3>{"Граница сложности"}</h3>
          <p>
            {"Не добавляем новый стек: текущая цель — уверенно понять контракты taskcreate, taskupdate, taskread и проверить наблюдаемый результат."}
          </p>
        </div>

        <TypeCards>
          <TypeCard badge={"вход"} title={"Что уже известно"} code={"проверенный контракт"}>
            {"Начинаем с существующего поведения и не переписываем соседние части без необходимости."}
          </TypeCard>
          <TypeCard badge={"шаг"} badgeTone="float" title={"Что делаем"} code={"Контракты TaskCreate, TaskUpdate, TaskRead"}>
            {"Разбираем «Контракты TaskCreate, TaskUpdate, TaskRead» на одном небольшом примере и связываем его с текущим Planner API."}
          </TypeCard>
          <TypeCard badge={"результат"} badgeTone="str" title={"Что проверяем"} code={"status + JSON + state"}>
            {"Проверяем публичный результат и только затем переходим к следующему разделу."}
          </TypeCard>
        </TypeCards>

        <CodeBlock
          caption={"Контракты TaskCreate, TaskUpdate, TaskRead"}
          code={"class TaskCreate(BaseModel):\n    title: str\n    priority: int\n\nclass TaskUpdate(BaseModel):\n    title: str | None = None\n    priority: int | None = None\n    is_done: bool | None = None\n\nclass TaskRead(BaseModel):\n    id: int\n    title: str\n    priority: int\n    is_done: bool"}
        />

        <CompareSolutions
          question={"Какой подход лучше сохраняет ясную границу ответственности?"}
          left={{
            title: "Смешать всё в одном месте",
            code: "# HTTP, данные и правила в одной функции",
            note: "Изменение одной части требует читать весь сценарий.",
          }}
          right={{
            title: "Оставить явный контракт",
            code: "class TaskCreate(BaseModel):\n    title: str\n    priority: int\n\nclass TaskUpdate(BaseModel):\n    title: str | None = None\n    priority: int | None = None\n    is_done: bool | None = None\n\nclass TaskRead(BaseModel):\n    id: int\n    title: str\n    priority: int\n    is_done: bool",
            note: "Каждая часть делает одну понятную работу.",
          }}
          preferred="right"
          explanation={"Явная граница снижает нагрузку на новичка и упрощает проверку результата."}
        />

        <RecallCard
          question={"Сформулируйте главную идею раздела своими словами."}
          answer={<p>
            {"Разные направления обмена получают разные схемы. Клиент не передаёт id при создании, PATCH допускает отсутствие полей, а публичный ответ всегда содержит полный объект."}
          </p>}
        />

        <Callout tone="info">
          {"Не добавляем новый стек: текущая цель — уверенно понять контракты taskcreate, taskupdate, taskread и проверить наблюдаемый результат."}
        </Callout>
      </Section>

      <Section number="05" title={"Статусы и единый смысл ошибок"}>
        <Lead>
          {"201 используется для создания, 204 — для удаления без body, 404 — для отсутствующего id, 422 — для body, не прошедшего схему. Эти значения заранее фиксируются в контракте."}
        </Lead>

        <div className="lesson-practice-steps">
          <h3>{"Опора на прошлый шаг"}</h3>
          <p>
            {"Используем то, что уже было проверено в разделе 04, и меняем только одну часть системы."}
          </p>

          <h3>{"Новый небольшой шаг"}</h3>
          <p>
            {"Разбираем «Статусы и единый смысл ошибок» на одном небольшом примере и связываем его с текущим Planner API."}
          </p>

          <h3>{"Граница сложности"}</h3>
          <p>
            {"Не добавляем новый стек: текущая цель — уверенно понять статусы и единый смысл ошибок и проверить наблюдаемый результат."}
          </p>
        </div>

        <TypeCards>
          <TypeCard badge={"вход"} title={"Что уже известно"} code={"проверенный контракт"}>
            {"Начинаем с существующего поведения и не переписываем соседние части без необходимости."}
          </TypeCard>
          <TypeCard badge={"шаг"} badgeTone="float" title={"Что делаем"} code={"Статусы и единый смысл ошибок"}>
            {"Разбираем «Статусы и единый смысл ошибок» на одном небольшом примере и связываем его с текущим Planner API."}
          </TypeCard>
          <TypeCard badge={"результат"} badgeTone="str" title={"Что проверяем"} code={"status + JSON + state"}>
            {"Проверяем публичный результат и только затем переходим к следующему разделу."}
          </TypeCard>
        </TypeCards>

        <CodeBlock
          caption={"Статусы и единый смысл ошибок"}
          code={"POST success   -> 201\nGET/PUT/PATCH  -> 200\nDELETE success -> 204 without body\nmissing id     -> 404\ninvalid body   -> 422"}
        />

        <BugHunt
          code={"# ошибка: важное правило пропущено\nPOST success   -> 201\nGET/PUT/PATCH  -> 200\nDELETE success -> 204 without body\nmissing id     -> 404\ninvalid body   -> 422"}
          question={"Какую проблему нужно проверить в первую очередь?"}
          options={[
            "Нарушен публичный контракт текущей операции",
            "Нужно немедленно добавить PostgreSQL",
            "Нужно удалить все типы данных",
          ]}
          correctIndex={0}
          explanation={"Сначала сравнивают метод, путь, статус, JSON и состояние с утверждённым контрактом."}
          fix={"POST success   -> 201\nGET/PUT/PATCH  -> 200\nDELETE success -> 204 without body\nmissing id     -> 404\ninvalid body   -> 422"}
        />

        <RecallCard
          question={"Сформулируйте главную идею раздела своими словами."}
          answer={<p>
            {"201 используется для создания, 204 — для удаления без body, 404 — для отсутствующего id, 422 — для body, не прошедшего схему. Эти значения заранее фиксируются в контракте."}
          </p>}
        />

        <Callout tone="info">
          {"Не добавляем новый стек: текущая цель — уверенно понять статусы и единый смысл ошибок и проверить наблюдаемый результат."}
        </Callout>
      </Section>

      <Section number="06" title={"Пять файлов проекта"}>
        <Lead>
          {"Main собирает приложение, router описывает HTTP, crud выполняет операции, storage хранит состояние, schemas задаёт форму данных. У каждого файла есть одна понятная причина изменения."}
        </Lead>

        <div className="lesson-practice-steps">
          <h3>{"Опора на прошлый шаг"}</h3>
          <p>
            {"Используем то, что уже было проверено в разделе 05, и меняем только одну часть системы."}
          </p>

          <h3>{"Новый небольшой шаг"}</h3>
          <p>
            {"Разбираем «Пять файлов проекта» на одном небольшом примере и связываем его с текущим Planner API."}
          </p>

          <h3>{"Граница сложности"}</h3>
          <p>
            {"Не добавляем новый стек: текущая цель — уверенно понять пять файлов проекта и проверить наблюдаемый результат."}
          </p>
        </div>

        <TypeCards>
          <TypeCard badge={"вход"} title={"Что уже известно"} code={"проверенный контракт"}>
            {"Начинаем с существующего поведения и не переписываем соседние части без необходимости."}
          </TypeCard>
          <TypeCard badge={"шаг"} badgeTone="float" title={"Что делаем"} code={"Пять файлов проекта"}>
            {"Разбираем «Пять файлов проекта» на одном небольшом примере и связываем его с текущим Planner API."}
          </TypeCard>
          <TypeCard badge={"результат"} badgeTone="str" title={"Что проверяем"} code={"status + JSON + state"}>
            {"Проверяем публичный результат и только затем переходим к следующему разделу."}
          </TypeCard>
        </TypeCards>

        <CodeBlock
          caption={"Пять файлов проекта"}
          code={"app/\n├── main.py\n├── schemas.py\n├── storage.py\n├── crud.py\n└── routers/tasks.py\ntests/test_tasks.py"}
        />

        <StepThrough
          code={"app/\n├── main.py\n├── schemas.py\n├── storage.py\n├── crud.py\n└── routers/tasks.py\ntests/test_tasks.py"}
          steps={[
            { line: 0, note: "Определяется вход текущей операции.", vars: { этап: "input" } },
            { line: 1, note: "Выполняется одна основная ответственность.", vars: { этап: "action" } },
            { line: 2, note: "Получается проверяемый результат.", vars: { этап: "result" } },
          ]}
        />

        <RecallCard
          question={"Сформулируйте главную идею раздела своими словами."}
          answer={<p>
            {"Main собирает приложение, router описывает HTTP, crud выполняет операции, storage хранит состояние, schemas задаёт форму данных. У каждого файла есть одна понятная причина изменения."}
          </p>}
        />

        <Callout tone="info">
          {"Не добавляем новый стек: текущая цель — уверенно понять пять файлов проекта и проверить наблюдаемый результат."}
        </Callout>
      </Section>

      <Section number="07" title={"Направление зависимостей"}>
        <Lead>
          {"Зависимости идут от точки входа к более самостоятельным частям: main → router → crud → storage. Schemas используются на границах данных, но не импортируют main."}
        </Lead>

        <div className="lesson-practice-steps">
          <h3>{"Опора на прошлый шаг"}</h3>
          <p>
            {"Используем то, что уже было проверено в разделе 06, и меняем только одну часть системы."}
          </p>

          <h3>{"Новый небольшой шаг"}</h3>
          <p>
            {"Разбираем «Направление зависимостей» на одном небольшом примере и связываем его с текущим Planner API."}
          </p>

          <h3>{"Граница сложности"}</h3>
          <p>
            {"Не добавляем новый стек: текущая цель — уверенно понять направление зависимостей и проверить наблюдаемый результат."}
          </p>
        </div>

        <TypeCards>
          <TypeCard badge={"вход"} title={"Что уже известно"} code={"проверенный контракт"}>
            {"Начинаем с существующего поведения и не переписываем соседние части без необходимости."}
          </TypeCard>
          <TypeCard badge={"шаг"} badgeTone="float" title={"Что делаем"} code={"Направление зависимостей"}>
            {"Разбираем «Направление зависимостей» на одном небольшом примере и связываем его с текущим Planner API."}
          </TypeCard>
          <TypeCard badge={"результат"} badgeTone="str" title={"Что проверяем"} code={"status + JSON + state"}>
            {"Проверяем публичный результат и только затем переходим к следующему разделу."}
          </TypeCard>
        </TypeCards>

        <CodeBlock
          caption={"Направление зависимостей"}
          code={"client -> router -> crud -> storage\n            |\n            v\n         schemas"}
        />

        <CodeSequence
          title={"Соберите безопасную последовательность"}
          prompt={"Расположите действия так, чтобы каждый шаг можно было проверить отдельно."}
          pieces={[
            { id: "baseline", code: "зафиксировать текущее поведение" },
            { id: "change", code: "изменить одну ответственность" },
            { id: "run", code: "повторить запрос или тест" },
            { id: "compare", code: "сравнить статус, JSON и состояние" },
            { id: "commit", code: "сохранить отдельный Git-коммит" },
          ]}
          correctOrder={["baseline", "change", "run", "compare", "commit"]}
          explanation={"Маленькие проверяемые изменения не создают резкого скачка сложности."}
        />

        <RecallCard
          question={"Сформулируйте главную идею раздела своими словами."}
          answer={<p>
            {"Зависимости идут от точки входа к более самостоятельным частям: main → router → crud → storage. Schemas используются на границах данных, но не импортируют main."}
          </p>}
        />

        <Callout tone="info">
          {"Не добавляем новый стек: текущая цель — уверенно понять направление зависимостей и проверить наблюдаемый результат."}
        </Callout>
      </Section>

      <Section number="08" title={"План маленьких коммитов"}>
        <Lead>
          {"Проект разбивается на проверяемые этапы: контракт, каркас, схемы и storage, CRUD, router, тесты и документация. После каждого шага проект остаётся запускаемым."}
        </Lead>

        <div className="lesson-practice-steps">
          <h3>{"Опора на прошлый шаг"}</h3>
          <p>
            {"Используем то, что уже было проверено в разделе 07, и меняем только одну часть системы."}
          </p>

          <h3>{"Новый небольшой шаг"}</h3>
          <p>
            {"Разбираем «План маленьких коммитов» на одном небольшом примере и связываем его с текущим Planner API."}
          </p>

          <h3>{"Граница сложности"}</h3>
          <p>
            {"Не добавляем новый стек: текущая цель — уверенно понять план маленьких коммитов и проверить наблюдаемый результат."}
          </p>
        </div>

        <TypeCards>
          <TypeCard badge={"вход"} title={"Что уже известно"} code={"проверенный контракт"}>
            {"Начинаем с существующего поведения и не переписываем соседние части без необходимости."}
          </TypeCard>
          <TypeCard badge={"шаг"} badgeTone="float" title={"Что делаем"} code={"План маленьких коммитов"}>
            {"Разбираем «План маленьких коммитов» на одном небольшом примере и связываем его с текущим Planner API."}
          </TypeCard>
          <TypeCard badge={"результат"} badgeTone="str" title={"Что проверяем"} code={"status + JSON + state"}>
            {"Проверяем публичный результат и только затем переходим к следующему разделу."}
          </TypeCard>
        </TypeCards>

        <CodeBlock
          caption={"План маленьких коммитов"}
          code={"1. docs: define API contract\n2. chore: create app structure\n3. feat: add schemas and storage\n4. feat: add CRUD\n5. feat: expose router\n6. test: cover API\n7. docs: prepare release"}
        />

        <RecallCard
          question={"Сформулируйте главную идею раздела своими словами."}
          answer={<p>
            {"Проект разбивается на проверяемые этапы: контракт, каркас, схемы и storage, CRUD, router, тесты и документация. После каждого шага проект остаётся запускаемым."}
          </p>}
        />

        <Callout tone="info">
          {"Не добавляем новый стек: текущая цель — уверенно понять план маленьких коммитов и проверить наблюдаемый результат."}
        </Callout>

        <div className="lesson-check-group">
          <QuizCard
            question={"Что проверяем после изменения?"}
            options={[
              "публичный контракт",
              "только число строк",
              "название папки",
            ]}
            correctIndex={0}
            explanation={"Текущий блок строится на явном результате и последовательной проверке."}
          />
          <QuizCard
            question={"Как повышается сложность?"}
            options={[
              "по одному небольшому шагу",
              "сразу новым стеком",
              "без проверки",
            ]}
            correctIndex={0}
            explanation={"Текущий блок строится на явном результате и последовательной проверке."}
          />
          <QuizCard
            question={"Что остаётся главным артефактом?"}
            options={[
              "работающий Planner API",
              "случайный пример",
              "неиспользуемый файл",
            ]}
            correctIndex={0}
            explanation={"Текущий блок строится на явном результате и последовательной проверке."}
          />
          <QuizCard
            question={"Когда переходить дальше?"}
            options={[
              "после проверки текущего результата",
              "до запуска кода",
              "после удаления тестов",
            ]}
            correctIndex={0}
            explanation={"Текущий блок строится на явном результате и последовательной проверке."}
          />
        </div>

        <KeyTakeaways
          points={[
            <>{"Каждый новый шаг опирается на уже работающий контракт."}</>,
            <>{"Структура проекта остаётся небольшой и объяснимой."}</>,
            <>{"Метод, путь, статус и JSON проверяются отдельно."}</>,
            <>{"Ошибочные сценарии являются частью API-контракта."}</>,
            <>{"Git-коммит фиксирует одну завершённую мысль."}</>,
            <>{"Следующий стек появляется только после понятной проблемы."}</>,
          ]}
        />

        <PracticeCta text={"Повторите все восемь разделов урока на Planner API и сохраните проверенный результат отдельным коммитом."} />
      </Section>

    </RichLesson>
  );
}

// 66. Финальный проект 2: schemas, storage, crud и routers
export function Lesson66({ module }: { module?: string }) {
  return (
    <RichLesson>
      <RichHero
        variant="project"
        chip={module ?? BLOCK_TITLE}
        title={"Финальный проект 2: schemas, storage, crud и routers"}
        intro={"Сначала создаются части, не зависящие от HTTP: schemas, storage и CRUD. Router подключается после того, как операции можно понять и проверить обычными Python-вызовами. Материал развивается маленькими шагами и использует только уже знакомые части Planner API."}
        tags={[
          { icon: <Boxes size={14} />, label: "данные и CRUD" },
          { icon: <FolderGit2 size={14} />, label: "структура приложения" },
        ]}
      />
      <TheoryBridge lesson={66} />

      <Section number="01" title={"Сборка проекта снизу вверх"}>
        <Lead>
          {"Сначала создаются части, не зависящие от HTTP: schemas, storage и CRUD. Router подключается после того, как операции можно понять и проверить обычными Python-вызовами."}
        </Lead>

        <div className="lesson-practice-steps">
          <h3>{"Опора на прошлый шаг"}</h3>
          <p>
            {"Используем то, что уже было проверено в предыдущих занятиях, и меняем только одну часть системы."}
          </p>

          <h3>{"Новый небольшой шаг"}</h3>
          <p>
            {"Разбираем «Сборка проекта снизу вверх» на одном небольшом примере и связываем его с текущим Planner API."}
          </p>

          <h3>{"Граница сложности"}</h3>
          <p>
            {"Не добавляем новый стек: текущая цель — уверенно понять сборка проекта снизу вверх и проверить наблюдаемый результат."}
          </p>
        </div>

        <TypeCards>
          <TypeCard badge={"вход"} title={"Что уже известно"} code={"проверенный контракт"}>
            {"Начинаем с существующего поведения и не переписываем соседние части без необходимости."}
          </TypeCard>
          <TypeCard badge={"шаг"} badgeTone="float" title={"Что делаем"} code={"Сборка проекта снизу вверх"}>
            {"Разбираем «Сборка проекта снизу вверх» на одном небольшом примере и связываем его с текущим Planner API."}
          </TypeCard>
          <TypeCard badge={"результат"} badgeTone="str" title={"Что проверяем"} code={"status + JSON + state"}>
            {"Проверяем публичный результат и только затем переходим к следующему разделу."}
          </TypeCard>
        </TypeCards>

        <CodeBlock
          caption={"Сборка проекта снизу вверх"}
          code={"schemas.py\n    ↓\nstorage.py ← crud.py\n              ↓\n       routers/tasks.py\n              ↓\n           main.py"}
        />

        <RecallCard
          question={"Сформулируйте главную идею раздела своими словами."}
          answer={<p>
            {"Сначала создаются части, не зависящие от HTTP: schemas, storage и CRUD. Router подключается после того, как операции можно понять и проверить обычными Python-вызовами."}
          </p>}
        />

        <Callout tone="info">
          {"Не добавляем новый стек: текущая цель — уверенно понять сборка проекта снизу вверх и проверить наблюдаемый результат."}
        </Callout>
      </Section>

      <Section number="02" title={"Файл schemas.py"}>
        <Lead>
          {"TaskCreate, TaskUpdate и TaskRead находятся рядом. Ограничения title и priority применяются до endpoint, а response model описывает полный публичный объект."}
        </Lead>

        <div className="lesson-practice-steps">
          <h3>{"Опора на прошлый шаг"}</h3>
          <p>
            {"Используем то, что уже было проверено в разделе 01, и меняем только одну часть системы."}
          </p>

          <h3>{"Новый небольшой шаг"}</h3>
          <p>
            {"Разбираем «Файл schemas.py» на одном небольшом примере и связываем его с текущим Planner API."}
          </p>

          <h3>{"Граница сложности"}</h3>
          <p>
            {"Не добавляем новый стек: текущая цель — уверенно понять файл schemas.py и проверить наблюдаемый результат."}
          </p>
        </div>

        <TypeCards>
          <TypeCard badge={"вход"} title={"Что уже известно"} code={"проверенный контракт"}>
            {"Начинаем с существующего поведения и не переписываем соседние части без необходимости."}
          </TypeCard>
          <TypeCard badge={"шаг"} badgeTone="float" title={"Что делаем"} code={"Файл schemas.py"}>
            {"Разбираем «Файл schemas.py» на одном небольшом примере и связываем его с текущим Planner API."}
          </TypeCard>
          <TypeCard badge={"результат"} badgeTone="str" title={"Что проверяем"} code={"status + JSON + state"}>
            {"Проверяем публичный результат и только затем переходим к следующему разделу."}
          </TypeCard>
        </TypeCards>

        <CodeBlock
          caption={"Файл schemas.py"}
          code={"from pydantic import BaseModel, Field\n\nclass TaskCreate(BaseModel):\n    title: str = Field(min_length=1, max_length=120)\n    priority: int = Field(ge=1, le=5)\n\nclass TaskUpdate(BaseModel):\n    title: str | None = None\n    priority: int | None = Field(default=None, ge=1, le=5)\n    is_done: bool | None = None"}
        />

        <PredictOutput
          code={"from pydantic import BaseModel, Field\n\nclass TaskCreate(BaseModel):\n    title: str = Field(min_length=1, max_length=120)\n    priority: int = Field(ge=1, le=5)\n\nclass TaskUpdate(BaseModel):\n    title: str | None = None\n    priority: int | None = Field(default=None, ge=1, le=5)\n    is_done: bool | None = None"}
          output={"Результат соответствует контракту текущего раздела"}
          hint={"Сначала проследите вход, затем действие и только потом итог."}
        />

        <RecallCard
          question={"Сформулируйте главную идею раздела своими словами."}
          answer={<p>
            {"TaskCreate, TaskUpdate и TaskRead находятся рядом. Ограничения title и priority применяются до endpoint, а response model описывает полный публичный объект."}
          </p>}
        />

        <Callout tone="info">
          {"Не добавляем новый стек: текущая цель — уверенно понять файл schemas.py и проверить наблюдаемый результат."}
        </Callout>
      </Section>

      <Section number="03" title={"Файл storage.py"}>
        <Lead>
          {"Storage содержит только состояние процесса: список задач, следующий id и функцию сброса для тестов. Он не знает о маршрутах, Swagger и HTTPException."}
        </Lead>

        <div className="lesson-practice-steps">
          <h3>{"Опора на прошлый шаг"}</h3>
          <p>
            {"Используем то, что уже было проверено в разделе 02, и меняем только одну часть системы."}
          </p>

          <h3>{"Новый небольшой шаг"}</h3>
          <p>
            {"Разбираем «Файл storage.py» на одном небольшом примере и связываем его с текущим Planner API."}
          </p>

          <h3>{"Граница сложности"}</h3>
          <p>
            {"Не добавляем новый стек: текущая цель — уверенно понять файл storage.py и проверить наблюдаемый результат."}
          </p>
        </div>

        <TypeCards>
          <TypeCard badge={"вход"} title={"Что уже известно"} code={"проверенный контракт"}>
            {"Начинаем с существующего поведения и не переписываем соседние части без необходимости."}
          </TypeCard>
          <TypeCard badge={"шаг"} badgeTone="float" title={"Что делаем"} code={"Файл storage.py"}>
            {"Разбираем «Файл storage.py» на одном небольшом примере и связываем его с текущим Planner API."}
          </TypeCard>
          <TypeCard badge={"результат"} badgeTone="str" title={"Что проверяем"} code={"status + JSON + state"}>
            {"Проверяем публичный результат и только затем переходим к следующему разделу."}
          </TypeCard>
        </TypeCards>

        <CodeBlock
          caption={"Файл storage.py"}
          code={"tasks: list[dict] = []\n_next_id = 1\n\ndef next_task_id() -> int:\n    global _next_id\n    value = _next_id\n    _next_id += 1\n    return value\n\ndef clear_storage():\n    global _next_id\n    tasks.clear()\n    _next_id = 1"}
        />

        <RecallCard
          question={"Сформулируйте главную идею раздела своими словами."}
          answer={<p>
            {"Storage содержит только состояние процесса: список задач, следующий id и функцию сброса для тестов. Он не знает о маршрутах, Swagger и HTTPException."}
          </p>}
        />

        <Callout tone="info">
          {"Не добавляем новый стек: текущая цель — уверенно понять файл storage.py и проверить наблюдаемый результат."}
        </Callout>
      </Section>

      <Section number="04" title={"Создание, список и поиск в crud.py"}>
        <Lead>
          {"CRUD-функции работают с Python-объектами. create_task добавляет серверные поля, list_tasks возвращает список, find_task возвращает словарь или None без HTTP-решений."}
        </Lead>

        <div className="lesson-practice-steps">
          <h3>{"Опора на прошлый шаг"}</h3>
          <p>
            {"Используем то, что уже было проверено в разделе 03, и меняем только одну часть системы."}
          </p>

          <h3>{"Новый небольшой шаг"}</h3>
          <p>
            {"Разбираем «Создание, список и поиск в crud.py» на одном небольшом примере и связываем его с текущим Planner API."}
          </p>

          <h3>{"Граница сложности"}</h3>
          <p>
            {"Не добавляем новый стек: текущая цель — уверенно понять создание, список и поиск в crud.py и проверить наблюдаемый результат."}
          </p>
        </div>

        <TypeCards>
          <TypeCard badge={"вход"} title={"Что уже известно"} code={"проверенный контракт"}>
            {"Начинаем с существующего поведения и не переписываем соседние части без необходимости."}
          </TypeCard>
          <TypeCard badge={"шаг"} badgeTone="float" title={"Что делаем"} code={"Создание, список и поиск в crud.py"}>
            {"Разбираем «Создание, список и поиск в crud.py» на одном небольшом примере и связываем его с текущим Planner API."}
          </TypeCard>
          <TypeCard badge={"результат"} badgeTone="str" title={"Что проверяем"} code={"status + JSON + state"}>
            {"Проверяем публичный результат и только затем переходим к следующему разделу."}
          </TypeCard>
        </TypeCards>

        <CodeBlock
          caption={"Создание, список и поиск в crud.py"}
          code={"def create_task(payload: TaskCreate) -> dict:\n    task = {\n        \"id\": next_task_id(),\n        \"title\": payload.title,\n        \"priority\": payload.priority,\n        \"is_done\": False,\n    }\n    tasks.append(task)\n    return task\n\ndef find_task(task_id: int) -> dict | None:\n    return next((t for t in tasks if t[\"id\"] == task_id), None)"}
        />

        <CompareSolutions
          question={"Какой подход лучше сохраняет ясную границу ответственности?"}
          left={{
            title: "Смешать всё в одном месте",
            code: "# HTTP, данные и правила в одной функции",
            note: "Изменение одной части требует читать весь сценарий.",
          }}
          right={{
            title: "Оставить явный контракт",
            code: "def create_task(payload: TaskCreate) -> dict:\n    task = {\n        \"id\": next_task_id(),\n        \"title\": payload.title,\n        \"priority\": payload.priority,\n        \"is_done\": False,\n    }\n    tasks.append(task)\n    return task\n\ndef find_task(task_id: int) -> dict | None:\n    return next((t for t in tasks if t[\"id\"] == task_id), None)",
            note: "Каждая часть делает одну понятную работу.",
          }}
          preferred="right"
          explanation={"Явная граница снижает нагрузку на новичка и упрощает проверку результата."}
        />

        <RecallCard
          question={"Сформулируйте главную идею раздела своими словами."}
          answer={<p>
            {"CRUD-функции работают с Python-объектами. create_task добавляет серверные поля, list_tasks возвращает список, find_task возвращает словарь или None без HTTP-решений."}
          </p>}
        />

        <Callout tone="info">
          {"Не добавляем новый стек: текущая цель — уверенно понять создание, список и поиск в crud.py и проверить наблюдаемый результат."}
        </Callout>
      </Section>

      <Section number="05" title={"PUT, PATCH и DELETE в CRUD"}>
        <Lead>
          {"Полная замена присваивает весь согласованный набор полей. Частичное обновление использует model_dump(exclude_unset=True), а удаление работает только с уже найденным объектом."}
        </Lead>

        <div className="lesson-practice-steps">
          <h3>{"Опора на прошлый шаг"}</h3>
          <p>
            {"Используем то, что уже было проверено в разделе 04, и меняем только одну часть системы."}
          </p>

          <h3>{"Новый небольшой шаг"}</h3>
          <p>
            {"Разбираем «PUT, PATCH и DELETE в CRUD» на одном небольшом примере и связываем его с текущим Planner API."}
          </p>

          <h3>{"Граница сложности"}</h3>
          <p>
            {"Не добавляем новый стек: текущая цель — уверенно понять put, patch и delete в crud и проверить наблюдаемый результат."}
          </p>
        </div>

        <TypeCards>
          <TypeCard badge={"вход"} title={"Что уже известно"} code={"проверенный контракт"}>
            {"Начинаем с существующего поведения и не переписываем соседние части без необходимости."}
          </TypeCard>
          <TypeCard badge={"шаг"} badgeTone="float" title={"Что делаем"} code={"PUT, PATCH и DELETE в CRUD"}>
            {"Разбираем «PUT, PATCH и DELETE в CRUD» на одном небольшом примере и связываем его с текущим Planner API."}
          </TypeCard>
          <TypeCard badge={"результат"} badgeTone="str" title={"Что проверяем"} code={"status + JSON + state"}>
            {"Проверяем публичный результат и только затем переходим к следующему разделу."}
          </TypeCard>
        </TypeCards>

        <CodeBlock
          caption={"PUT, PATCH и DELETE в CRUD"}
          code={"def replace_task(task: dict, payload: TaskCreate) -> dict:\n    task[\"title\"] = payload.title\n    task[\"priority\"] = payload.priority\n    task[\"is_done\"] = False\n    return task\n\ndef update_task(task: dict, payload: TaskUpdate) -> dict:\n    task.update(payload.model_dump(exclude_unset=True))\n    return task\n\ndef delete_task(task: dict) -> None:\n    tasks.remove(task)"}
        />

        <BugHunt
          code={"# ошибка: важное правило пропущено\ndef replace_task(task: dict, payload: TaskCreate) -> dict:\n    task[\"title\"] = payload.title\n    task[\"priority\"] = payload.priority\n    task[\"is_done\"] = False\n    return task\n\ndef update_task(task: dict, payload: TaskUpdate) -> dict:\n    task.update(payload.model_dump(exclude_unset=True))\n    return task\n\ndef delete_task(task: dict) -> None:\n    tasks.remove(task)"}
          question={"Какую проблему нужно проверить в первую очередь?"}
          options={[
            "Нарушен публичный контракт текущей операции",
            "Нужно немедленно добавить PostgreSQL",
            "Нужно удалить все типы данных",
          ]}
          correctIndex={0}
          explanation={"Сначала сравнивают метод, путь, статус, JSON и состояние с утверждённым контрактом."}
          fix={"def replace_task(task: dict, payload: TaskCreate) -> dict:\n    task[\"title\"] = payload.title\n    task[\"priority\"] = payload.priority\n    task[\"is_done\"] = False\n    return task\n\ndef update_task(task: dict, payload: TaskUpdate) -> dict:\n    task.update(payload.model_dump(exclude_unset=True))\n    return task\n\ndef delete_task(task: dict) -> None:\n    tasks.remove(task)"}
        />

        <RecallCard
          question={"Сформулируйте главную идею раздела своими словами."}
          answer={<p>
            {"Полная замена присваивает весь согласованный набор полей. Частичное обновление использует model_dump(exclude_unset=True), а удаление работает только с уже найденным объектом."}
          </p>}
        />

        <Callout tone="info">
          {"Не добавляем новый стек: текущая цель — уверенно понять put, patch и delete в crud и проверить наблюдаемый результат."}
        </Callout>
      </Section>

      <Section number="06" title={"Тонкий router"}>
        <Lead>
          {"Router получает проверенные параметры, преобразует отсутствие в 404 и вызывает готовый CRUD. Endpoint не должен повторять генерацию id или работу со списком."}
        </Lead>

        <div className="lesson-practice-steps">
          <h3>{"Опора на прошлый шаг"}</h3>
          <p>
            {"Используем то, что уже было проверено в разделе 05, и меняем только одну часть системы."}
          </p>

          <h3>{"Новый небольшой шаг"}</h3>
          <p>
            {"Разбираем «Тонкий router» на одном небольшом примере и связываем его с текущим Planner API."}
          </p>

          <h3>{"Граница сложности"}</h3>
          <p>
            {"Не добавляем новый стек: текущая цель — уверенно понять тонкий router и проверить наблюдаемый результат."}
          </p>
        </div>

        <TypeCards>
          <TypeCard badge={"вход"} title={"Что уже известно"} code={"проверенный контракт"}>
            {"Начинаем с существующего поведения и не переписываем соседние части без необходимости."}
          </TypeCard>
          <TypeCard badge={"шаг"} badgeTone="float" title={"Что делаем"} code={"Тонкий router"}>
            {"Разбираем «Тонкий router» на одном небольшом примере и связываем его с текущим Planner API."}
          </TypeCard>
          <TypeCard badge={"результат"} badgeTone="str" title={"Что проверяем"} code={"status + JSON + state"}>
            {"Проверяем публичный результат и только затем переходим к следующему разделу."}
          </TypeCard>
        </TypeCards>

        <CodeBlock
          caption={"Тонкий router"}
          code={"router = APIRouter(prefix=\"/tasks\", tags=[\"tasks\"])\n\ndef get_task_or_404(task_id: int) -> dict:\n    task = crud.find_task(task_id)\n    if task is None:\n        raise HTTPException(status_code=404, detail=\"Task not found\")\n    return task\n\n@router.post(\"/\", response_model=TaskRead, status_code=201)\ndef create_task(payload: TaskCreate):\n    return crud.create_task(payload)"}
        />

        <StepThrough
          code={"router = APIRouter(prefix=\"/tasks\", tags=[\"tasks\"])\n\ndef get_task_or_404(task_id: int) -> dict:\n    task = crud.find_task(task_id)\n    if task is None:\n        raise HTTPException(status_code=404, detail=\"Task not found\")\n    return task\n\n@router.post(\"/\", response_model=TaskRead, status_code=201)\ndef create_task(payload: TaskCreate):\n    return crud.create_task(payload)"}
          steps={[
            { line: 0, note: "Определяется вход текущей операции.", vars: { этап: "input" } },
            { line: 1, note: "Выполняется одна основная ответственность.", vars: { этап: "action" } },
            { line: 2, note: "Получается проверяемый результат.", vars: { этап: "result" } },
          ]}
        />

        <RecallCard
          question={"Сформулируйте главную идею раздела своими словами."}
          answer={<p>
            {"Router получает проверенные параметры, преобразует отсутствие в 404 и вызывает готовый CRUD. Endpoint не должен повторять генерацию id или работу со списком."}
          </p>}
        />

        <Callout tone="info">
          {"Не добавляем новый стек: текущая цель — уверенно понять тонкий router и проверить наблюдаемый результат."}
        </Callout>
      </Section>

      <Section number="07" title={"Короткий main.py"}>
        <Lead>
          {"Точка входа создаёт FastAPI, задаёт метаданные и подключает tasks_router. Изменение правила PATCH не должно требовать редактирования main.py."}
        </Lead>

        <div className="lesson-practice-steps">
          <h3>{"Опора на прошлый шаг"}</h3>
          <p>
            {"Используем то, что уже было проверено в разделе 06, и меняем только одну часть системы."}
          </p>

          <h3>{"Новый небольшой шаг"}</h3>
          <p>
            {"Разбираем «Короткий main.py» на одном небольшом примере и связываем его с текущим Planner API."}
          </p>

          <h3>{"Граница сложности"}</h3>
          <p>
            {"Не добавляем новый стек: текущая цель — уверенно понять короткий main.py и проверить наблюдаемый результат."}
          </p>
        </div>

        <TypeCards>
          <TypeCard badge={"вход"} title={"Что уже известно"} code={"проверенный контракт"}>
            {"Начинаем с существующего поведения и не переписываем соседние части без необходимости."}
          </TypeCard>
          <TypeCard badge={"шаг"} badgeTone="float" title={"Что делаем"} code={"Короткий main.py"}>
            {"Разбираем «Короткий main.py» на одном небольшом примере и связываем его с текущим Planner API."}
          </TypeCard>
          <TypeCard badge={"результат"} badgeTone="str" title={"Что проверяем"} code={"status + JSON + state"}>
            {"Проверяем публичный результат и только затем переходим к следующему разделу."}
          </TypeCard>
        </TypeCards>

        <CodeBlock
          caption={"Короткий main.py"}
          code={"from fastapi import FastAPI\nfrom app.routers.tasks import router as tasks_router\n\napp = FastAPI(title=\"StudyHub Planner API\", version=\"1.0.0\")\napp.include_router(tasks_router)\n\n@app.get(\"/health\", tags=[\"system\"])\ndef health():\n    return {\"status\": \"ok\"}"}
        />

        <CodeSequence
          title={"Соберите безопасную последовательность"}
          prompt={"Расположите действия так, чтобы каждый шаг можно было проверить отдельно."}
          pieces={[
            { id: "baseline", code: "зафиксировать текущее поведение" },
            { id: "change", code: "изменить одну ответственность" },
            { id: "run", code: "повторить запрос или тест" },
            { id: "compare", code: "сравнить статус, JSON и состояние" },
            { id: "commit", code: "сохранить отдельный Git-коммит" },
          ]}
          correctOrder={["baseline", "change", "run", "compare", "commit"]}
          explanation={"Маленькие проверяемые изменения не создают резкого скачка сложности."}
        />

        <RecallCard
          question={"Сформулируйте главную идею раздела своими словами."}
          answer={<p>
            {"Точка входа создаёт FastAPI, задаёт метаданные и подключает tasks_router. Изменение правила PATCH не должно требовать редактирования main.py."}
          </p>}
        />

        <Callout tone="info">
          {"Не добавляем новый стек: текущая цель — уверенно понять короткий main.py и проверить наблюдаемый результат."}
        </Callout>
      </Section>

      <Section number="08" title={"Проверка собранного каркаса"}>
        <Lead>
          {"После занятия достаточно устойчивого POST, GET списка, GET по id и 404. Ученик отдельно проверяет импорты, прямой вызов CRUD и HTTP-сценарий в Swagger."}
        </Lead>

        <div className="lesson-practice-steps">
          <h3>{"Опора на прошлый шаг"}</h3>
          <p>
            {"Используем то, что уже было проверено в разделе 07, и меняем только одну часть системы."}
          </p>

          <h3>{"Новый небольшой шаг"}</h3>
          <p>
            {"Разбираем «Проверка собранного каркаса» на одном небольшом примере и связываем его с текущим Planner API."}
          </p>

          <h3>{"Граница сложности"}</h3>
          <p>
            {"Не добавляем новый стек: текущая цель — уверенно понять проверка собранного каркаса и проверить наблюдаемый результат."}
          </p>
        </div>

        <TypeCards>
          <TypeCard badge={"вход"} title={"Что уже известно"} code={"проверенный контракт"}>
            {"Начинаем с существующего поведения и не переписываем соседние части без необходимости."}
          </TypeCard>
          <TypeCard badge={"шаг"} badgeTone="float" title={"Что делаем"} code={"Проверка собранного каркаса"}>
            {"Разбираем «Проверка собранного каркаса» на одном небольшом примере и связываем его с текущим Planner API."}
          </TypeCard>
          <TypeCard badge={"результат"} badgeTone="str" title={"Что проверяем"} code={"status + JSON + state"}>
            {"Проверяем публичный результат и только затем переходим к следующему разделу."}
          </TypeCard>
        </TypeCards>

        <CodeBlock
          caption={"Проверка собранного каркаса"}
          code={"1. POST /tasks/ -> 201\n2. GET /tasks/ -> one item\n3. GET /tasks/1 -> created item\n4. GET /tasks/999 -> 404\n5. restart -> storage becomes empty"}
        />

        <RecallCard
          question={"Сформулируйте главную идею раздела своими словами."}
          answer={<p>
            {"После занятия достаточно устойчивого POST, GET списка, GET по id и 404. Ученик отдельно проверяет импорты, прямой вызов CRUD и HTTP-сценарий в Swagger."}
          </p>}
        />

        <Callout tone="info">
          {"Не добавляем новый стек: текущая цель — уверенно понять проверка собранного каркаса и проверить наблюдаемый результат."}
        </Callout>

        <div className="lesson-check-group">
          <QuizCard
            question={"Что проверяем после изменения?"}
            options={[
              "публичный контракт",
              "только число строк",
              "название папки",
            ]}
            correctIndex={0}
            explanation={"Текущий блок строится на явном результате и последовательной проверке."}
          />
          <QuizCard
            question={"Как повышается сложность?"}
            options={[
              "по одному небольшому шагу",
              "сразу новым стеком",
              "без проверки",
            ]}
            correctIndex={0}
            explanation={"Текущий блок строится на явном результате и последовательной проверке."}
          />
          <QuizCard
            question={"Что остаётся главным артефактом?"}
            options={[
              "работающий Planner API",
              "случайный пример",
              "неиспользуемый файл",
            ]}
            correctIndex={0}
            explanation={"Текущий блок строится на явном результате и последовательной проверке."}
          />
          <QuizCard
            question={"Когда переходить дальше?"}
            options={[
              "после проверки текущего результата",
              "до запуска кода",
              "после удаления тестов",
            ]}
            correctIndex={0}
            explanation={"Текущий блок строится на явном результате и последовательной проверке."}
          />
        </div>

        <KeyTakeaways
          points={[
            <>{"Каждый новый шаг опирается на уже работающий контракт."}</>,
            <>{"Структура проекта остаётся небольшой и объяснимой."}</>,
            <>{"Метод, путь, статус и JSON проверяются отдельно."}</>,
            <>{"Ошибочные сценарии являются частью API-контракта."}</>,
            <>{"Git-коммит фиксирует одну завершённую мысль."}</>,
            <>{"Следующий стек появляется только после понятной проблемы."}</>,
          ]}
        />

        <PracticeCta text={"Повторите все восемь разделов урока на Planner API и сохраните проверенный результат отдельным коммитом."} />
      </Section>

    </RichLesson>
  );
}

// 67. Финальный проект 3: полная CRUD-логика
export function Lesson67({ module }: { module?: string }) {
  return (
    <RichLesson>
      <RichHero
        variant="project"
        chip={module ?? BLOCK_TITLE}
        title={"Финальный проект 3: полная CRUD-логика"}
        intro={"Проект проверяется не отдельными декораторами, а последовательностью запросов с одним id: создать, прочитать, заменить, частично изменить, удалить и подтвердить отсутствие. Материал развивается маленькими шагами и использует только уже знакомые части Planner API."}
        tags={[
          { icon: <GitBranch size={14} />, label: "полный CRUD-путь" },
          { icon: <CheckCircle2 size={14} />, label: "сквозная проверка" },
        ]}
      />
      <TheoryBridge lesson={67} />

      <Section number="01" title={"Жизненный цикл одного ресурса"}>
        <Lead>
          {"Проект проверяется не отдельными декораторами, а последовательностью запросов с одним id: создать, прочитать, заменить, частично изменить, удалить и подтвердить отсутствие."}
        </Lead>

        <div className="lesson-practice-steps">
          <h3>{"Опора на прошлый шаг"}</h3>
          <p>
            {"Используем то, что уже было проверено в предыдущих занятиях, и меняем только одну часть системы."}
          </p>

          <h3>{"Новый небольшой шаг"}</h3>
          <p>
            {"Разбираем «Жизненный цикл одного ресурса» на одном небольшом примере и связываем его с текущим Planner API."}
          </p>

          <h3>{"Граница сложности"}</h3>
          <p>
            {"Не добавляем новый стек: текущая цель — уверенно понять жизненный цикл одного ресурса и проверить наблюдаемый результат."}
          </p>
        </div>

        <TypeCards>
          <TypeCard badge={"вход"} title={"Что уже известно"} code={"проверенный контракт"}>
            {"Начинаем с существующего поведения и не переписываем соседние части без необходимости."}
          </TypeCard>
          <TypeCard badge={"шаг"} badgeTone="float" title={"Что делаем"} code={"Жизненный цикл одного ресурса"}>
            {"Разбираем «Жизненный цикл одного ресурса» на одном небольшом примере и связываем его с текущим Planner API."}
          </TypeCard>
          <TypeCard badge={"результат"} badgeTone="str" title={"Что проверяем"} code={"status + JSON + state"}>
            {"Проверяем публичный результат и только затем переходим к следующему разделу."}
          </TypeCard>
        </TypeCards>

        <CodeBlock
          caption={"Жизненный цикл одного ресурса"}
          code={"POST   /tasks/  -> id=1\nGET    /tasks/1 -> 200\nPUT    /tasks/1 -> 200\nPATCH  /tasks/1 -> 200\nDELETE /tasks/1 -> 204\nGET    /tasks/1 -> 404"}
        />

        <RecallCard
          question={"Сформулируйте главную идею раздела своими словами."}
          answer={<p>
            {"Проект проверяется не отдельными декораторами, а последовательностью запросов с одним id: создать, прочитать, заменить, частично изменить, удалить и подтвердить отсутствие."}
          </p>}
        />

        <Callout tone="info">
          {"Не добавляем новый стек: текущая цель — уверенно понять жизненный цикл одного ресурса и проверить наблюдаемый результат."}
        </Callout>
      </Section>

      <Section number="02" title={"POST и GET согласуют состояние"}>
        <Lead>
          {"Объект из ответа POST должен находиться в GET списка и GET по id. Это связывает генерацию id, storage, CRUD и response_model одной проверяемой цепочкой."}
        </Lead>

        <div className="lesson-practice-steps">
          <h3>{"Опора на прошлый шаг"}</h3>
          <p>
            {"Используем то, что уже было проверено в разделе 01, и меняем только одну часть системы."}
          </p>

          <h3>{"Новый небольшой шаг"}</h3>
          <p>
            {"Разбираем «POST и GET согласуют состояние» на одном небольшом примере и связываем его с текущим Planner API."}
          </p>

          <h3>{"Граница сложности"}</h3>
          <p>
            {"Не добавляем новый стек: текущая цель — уверенно понять post и get согласуют состояние и проверить наблюдаемый результат."}
          </p>
        </div>

        <TypeCards>
          <TypeCard badge={"вход"} title={"Что уже известно"} code={"проверенный контракт"}>
            {"Начинаем с существующего поведения и не переписываем соседние части без необходимости."}
          </TypeCard>
          <TypeCard badge={"шаг"} badgeTone="float" title={"Что делаем"} code={"POST и GET согласуют состояние"}>
            {"Разбираем «POST и GET согласуют состояние» на одном небольшом примере и связываем его с текущим Planner API."}
          </TypeCard>
          <TypeCard badge={"результат"} badgeTone="str" title={"Что проверяем"} code={"status + JSON + state"}>
            {"Проверяем публичный результат и только затем переходим к следующему разделу."}
          </TypeCard>
        </TypeCards>

        <CodeBlock
          caption={"POST и GET согласуют состояние"}
          code={"@router.post(\"/\", response_model=TaskRead, status_code=201)\ndef create_task(payload: TaskCreate):\n    return crud.create_task(payload)\n\n@router.get(\"/\", response_model=list[TaskRead])\ndef list_tasks():\n    return crud.list_tasks()"}
        />

        <PredictOutput
          code={"@router.post(\"/\", response_model=TaskRead, status_code=201)\ndef create_task(payload: TaskCreate):\n    return crud.create_task(payload)\n\n@router.get(\"/\", response_model=list[TaskRead])\ndef list_tasks():\n    return crud.list_tasks()"}
          output={"Результат соответствует контракту текущего раздела"}
          hint={"Сначала проследите вход, затем действие и только потом итог."}
        />

        <RecallCard
          question={"Сформулируйте главную идею раздела своими словами."}
          answer={<p>
            {"Объект из ответа POST должен находиться в GET списка и GET по id. Это связывает генерацию id, storage, CRUD и response_model одной проверяемой цепочкой."}
          </p>}
        />

        <Callout tone="info">
          {"Не добавляем новый стек: текущая цель — уверенно понять post и get согласуют состояние и проверить наблюдаемый результат."}
        </Callout>
      </Section>

      <Section number="03" title={"Полная замена через PUT"}>
        <Lead>
          {"PUT выбирает существующий ресурс по path id и требует полную входную схему. Идентификатор сохраняется, а согласованные изменяемые поля получают новую версию."}
        </Lead>

        <div className="lesson-practice-steps">
          <h3>{"Опора на прошлый шаг"}</h3>
          <p>
            {"Используем то, что уже было проверено в разделе 02, и меняем только одну часть системы."}
          </p>

          <h3>{"Новый небольшой шаг"}</h3>
          <p>
            {"Разбираем «Полная замена через PUT» на одном небольшом примере и связываем его с текущим Planner API."}
          </p>

          <h3>{"Граница сложности"}</h3>
          <p>
            {"Не добавляем новый стек: текущая цель — уверенно понять полная замена через put и проверить наблюдаемый результат."}
          </p>
        </div>

        <TypeCards>
          <TypeCard badge={"вход"} title={"Что уже известно"} code={"проверенный контракт"}>
            {"Начинаем с существующего поведения и не переписываем соседние части без необходимости."}
          </TypeCard>
          <TypeCard badge={"шаг"} badgeTone="float" title={"Что делаем"} code={"Полная замена через PUT"}>
            {"Разбираем «Полная замена через PUT» на одном небольшом примере и связываем его с текущим Planner API."}
          </TypeCard>
          <TypeCard badge={"результат"} badgeTone="str" title={"Что проверяем"} code={"status + JSON + state"}>
            {"Проверяем публичный результат и только затем переходим к следующему разделу."}
          </TypeCard>
        </TypeCards>

        <CodeBlock
          caption={"Полная замена через PUT"}
          code={"@router.put(\"/{task_id}\", response_model=TaskRead)\ndef replace_task(task_id: int, payload: TaskCreate):\n    task = get_task_or_404(task_id)\n    return crud.replace_task(task, payload)"}
        />

        <RecallCard
          question={"Сформулируйте главную идею раздела своими словами."}
          answer={<p>
            {"PUT выбирает существующий ресурс по path id и требует полную входную схему. Идентификатор сохраняется, а согласованные изменяемые поля получают новую версию."}
          </p>}
        />

        <Callout tone="info">
          {"Не добавляем новый стек: текущая цель — уверенно понять полная замена через put и проверить наблюдаемый результат."}
        </Callout>
      </Section>

      <Section number="04" title={"Частичное обновление через PATCH"}>
        <Lead>
          {"PATCH принимает TaskUpdate и меняет только поля, присутствующие в body. Title и priority не должны исчезать при обновлении одного is_done."}
        </Lead>

        <div className="lesson-practice-steps">
          <h3>{"Опора на прошлый шаг"}</h3>
          <p>
            {"Используем то, что уже было проверено в разделе 03, и меняем только одну часть системы."}
          </p>

          <h3>{"Новый небольшой шаг"}</h3>
          <p>
            {"Разбираем «Частичное обновление через PATCH» на одном небольшом примере и связываем его с текущим Planner API."}
          </p>

          <h3>{"Граница сложности"}</h3>
          <p>
            {"Не добавляем новый стек: текущая цель — уверенно понять частичное обновление через patch и проверить наблюдаемый результат."}
          </p>
        </div>

        <TypeCards>
          <TypeCard badge={"вход"} title={"Что уже известно"} code={"проверенный контракт"}>
            {"Начинаем с существующего поведения и не переписываем соседние части без необходимости."}
          </TypeCard>
          <TypeCard badge={"шаг"} badgeTone="float" title={"Что делаем"} code={"Частичное обновление через PATCH"}>
            {"Разбираем «Частичное обновление через PATCH» на одном небольшом примере и связываем его с текущим Planner API."}
          </TypeCard>
          <TypeCard badge={"результат"} badgeTone="str" title={"Что проверяем"} code={"status + JSON + state"}>
            {"Проверяем публичный результат и только затем переходим к следующему разделу."}
          </TypeCard>
        </TypeCards>

        <CodeBlock
          caption={"Частичное обновление через PATCH"}
          code={"@router.patch(\"/{task_id}\", response_model=TaskRead)\ndef update_task(task_id: int, payload: TaskUpdate):\n    task = get_task_or_404(task_id)\n    return crud.update_task(task, payload)"}
        />

        <CompareSolutions
          question={"Какой подход лучше сохраняет ясную границу ответственности?"}
          left={{
            title: "Смешать всё в одном месте",
            code: "# HTTP, данные и правила в одной функции",
            note: "Изменение одной части требует читать весь сценарий.",
          }}
          right={{
            title: "Оставить явный контракт",
            code: "@router.patch(\"/{task_id}\", response_model=TaskRead)\ndef update_task(task_id: int, payload: TaskUpdate):\n    task = get_task_or_404(task_id)\n    return crud.update_task(task, payload)",
            note: "Каждая часть делает одну понятную работу.",
          }}
          preferred="right"
          explanation={"Явная граница снижает нагрузку на новичка и упрощает проверку результата."}
        />

        <RecallCard
          question={"Сформулируйте главную идею раздела своими словами."}
          answer={<p>
            {"PATCH принимает TaskUpdate и меняет только поля, присутствующие в body. Title и priority не должны исчезать при обновлении одного is_done."}
          </p>}
        />

        <Callout tone="info">
          {"Не добавляем новый стек: текущая цель — уверенно понять частичное обновление через patch и проверить наблюдаемый результат."}
        </Callout>
      </Section>

      <Section number="05" title={"Удаление и статус 204"}>
        <Lead>
          {"DELETE сначала использует общий поиск, затем удаляет словарь и возвращает пустой Response. Статус 204 не сочетается с JSON body."}
        </Lead>

        <div className="lesson-practice-steps">
          <h3>{"Опора на прошлый шаг"}</h3>
          <p>
            {"Используем то, что уже было проверено в разделе 04, и меняем только одну часть системы."}
          </p>

          <h3>{"Новый небольшой шаг"}</h3>
          <p>
            {"Разбираем «Удаление и статус 204» на одном небольшом примере и связываем его с текущим Planner API."}
          </p>

          <h3>{"Граница сложности"}</h3>
          <p>
            {"Не добавляем новый стек: текущая цель — уверенно понять удаление и статус 204 и проверить наблюдаемый результат."}
          </p>
        </div>

        <TypeCards>
          <TypeCard badge={"вход"} title={"Что уже известно"} code={"проверенный контракт"}>
            {"Начинаем с существующего поведения и не переписываем соседние части без необходимости."}
          </TypeCard>
          <TypeCard badge={"шаг"} badgeTone="float" title={"Что делаем"} code={"Удаление и статус 204"}>
            {"Разбираем «Удаление и статус 204» на одном небольшом примере и связываем его с текущим Planner API."}
          </TypeCard>
          <TypeCard badge={"результат"} badgeTone="str" title={"Что проверяем"} code={"status + JSON + state"}>
            {"Проверяем публичный результат и только затем переходим к следующему разделу."}
          </TypeCard>
        </TypeCards>

        <CodeBlock
          caption={"Удаление и статус 204"}
          code={"@router.delete(\"/{task_id}\", status_code=204)\ndef delete_task(task_id: int) -> Response:\n    task = get_task_or_404(task_id)\n    crud.delete_task(task)\n    return Response(status_code=204)"}
        />

        <BugHunt
          code={"# ошибка: важное правило пропущено\n@router.delete(\"/{task_id}\", status_code=204)\ndef delete_task(task_id: int) -> Response:\n    task = get_task_or_404(task_id)\n    crud.delete_task(task)\n    return Response(status_code=204)"}
          question={"Какую проблему нужно проверить в первую очередь?"}
          options={[
            "Нарушен публичный контракт текущей операции",
            "Нужно немедленно добавить PostgreSQL",
            "Нужно удалить все типы данных",
          ]}
          correctIndex={0}
          explanation={"Сначала сравнивают метод, путь, статус, JSON и состояние с утверждённым контрактом."}
          fix={"@router.delete(\"/{task_id}\", status_code=204)\ndef delete_task(task_id: int) -> Response:\n    task = get_task_or_404(task_id)\n    crud.delete_task(task)\n    return Response(status_code=204)"}
        />

        <RecallCard
          question={"Сформулируйте главную идею раздела своими словами."}
          answer={<p>
            {"DELETE сначала использует общий поиск, затем удаляет словарь и возвращает пустой Response. Статус 204 не сочетается с JSON body."}
          </p>}
        />

        <Callout tone="info">
          {"Не добавляем новый стек: текущая цель — уверенно понять удаление и статус 204 и проверить наблюдаемый результат."}
        </Callout>
      </Section>

      <Section number="06" title={"Единый helper 404"}>
        <Lead>
          {"GET одной задачи, PUT, PATCH и DELETE используют один get_task_or_404. Это защищает одинаковый статус и detail и не заставляет CRUD зависеть от FastAPI."}
        </Lead>

        <div className="lesson-practice-steps">
          <h3>{"Опора на прошлый шаг"}</h3>
          <p>
            {"Используем то, что уже было проверено в разделе 05, и меняем только одну часть системы."}
          </p>

          <h3>{"Новый небольшой шаг"}</h3>
          <p>
            {"Разбираем «Единый helper 404» на одном небольшом примере и связываем его с текущим Planner API."}
          </p>

          <h3>{"Граница сложности"}</h3>
          <p>
            {"Не добавляем новый стек: текущая цель — уверенно понять единый helper 404 и проверить наблюдаемый результат."}
          </p>
        </div>

        <TypeCards>
          <TypeCard badge={"вход"} title={"Что уже известно"} code={"проверенный контракт"}>
            {"Начинаем с существующего поведения и не переписываем соседние части без необходимости."}
          </TypeCard>
          <TypeCard badge={"шаг"} badgeTone="float" title={"Что делаем"} code={"Единый helper 404"}>
            {"Разбираем «Единый helper 404» на одном небольшом примере и связываем его с текущим Planner API."}
          </TypeCard>
          <TypeCard badge={"результат"} badgeTone="str" title={"Что проверяем"} code={"status + JSON + state"}>
            {"Проверяем публичный результат и только затем переходим к следующему разделу."}
          </TypeCard>
        </TypeCards>

        <CodeBlock
          caption={"Единый helper 404"}
          code={"def get_task_or_404(task_id: int) -> dict:\n    task = crud.find_task(task_id)\n    if task is None:\n        raise HTTPException(\n            status_code=404,\n            detail=\"Task not found\",\n        )\n    return task"}
        />

        <StepThrough
          code={"def get_task_or_404(task_id: int) -> dict:\n    task = crud.find_task(task_id)\n    if task is None:\n        raise HTTPException(\n            status_code=404,\n            detail=\"Task not found\",\n        )\n    return task"}
          steps={[
            { line: 0, note: "Определяется вход текущей операции.", vars: { этап: "input" } },
            { line: 1, note: "Выполняется одна основная ответственность.", vars: { этап: "action" } },
            { line: 2, note: "Получается проверяемый результат.", vars: { этап: "result" } },
          ]}
        />

        <RecallCard
          question={"Сформулируйте главную идею раздела своими словами."}
          answer={<p>
            {"GET одной задачи, PUT, PATCH и DELETE используют один get_task_or_404. Это защищает одинаковый статус и detail и не заставляет CRUD зависеть от FastAPI."}
          </p>}
        />

        <Callout tone="info">
          {"Не добавляем новый стек: текущая цель — уверенно понять единый helper 404 и проверить наблюдаемый результат."}
        </Callout>
      </Section>

      <Section number="07" title={"Ручная сквозная проверка"}>
        <Lead>
          {"Swagger или Postman проходит успешный жизненный цикл и отдельно проверяет 404 и 422. После каждой операции ученик сравнивает не только статус, но и итоговое состояние."}
        </Lead>

        <div className="lesson-practice-steps">
          <h3>{"Опора на прошлый шаг"}</h3>
          <p>
            {"Используем то, что уже было проверено в разделе 06, и меняем только одну часть системы."}
          </p>

          <h3>{"Новый небольшой шаг"}</h3>
          <p>
            {"Разбираем «Ручная сквозная проверка» на одном небольшом примере и связываем его с текущим Planner API."}
          </p>

          <h3>{"Граница сложности"}</h3>
          <p>
            {"Не добавляем новый стек: текущая цель — уверенно понять ручная сквозная проверка и проверить наблюдаемый результат."}
          </p>
        </div>

        <TypeCards>
          <TypeCard badge={"вход"} title={"Что уже известно"} code={"проверенный контракт"}>
            {"Начинаем с существующего поведения и не переписываем соседние части без необходимости."}
          </TypeCard>
          <TypeCard badge={"шаг"} badgeTone="float" title={"Что делаем"} code={"Ручная сквозная проверка"}>
            {"Разбираем «Ручная сквозная проверка» на одном небольшом примере и связываем его с текущим Planner API."}
          </TypeCard>
          <TypeCard badge={"результат"} badgeTone="str" title={"Что проверяем"} code={"status + JSON + state"}>
            {"Проверяем публичный результат и только затем переходим к следующему разделу."}
          </TypeCard>
        </TypeCards>

        <CodeBlock
          caption={"Ручная сквозная проверка"}
          code={"[ ] POST -> 201 and id\n[ ] GET -> created task\n[ ] PUT -> full replacement\n[ ] PATCH -> one field changed\n[ ] DELETE -> 204 without body\n[ ] GET after delete -> 404\n[ ] invalid priority -> 422"}
        />

        <CodeSequence
          title={"Соберите безопасную последовательность"}
          prompt={"Расположите действия так, чтобы каждый шаг можно было проверить отдельно."}
          pieces={[
            { id: "baseline", code: "зафиксировать текущее поведение" },
            { id: "change", code: "изменить одну ответственность" },
            { id: "run", code: "повторить запрос или тест" },
            { id: "compare", code: "сравнить статус, JSON и состояние" },
            { id: "commit", code: "сохранить отдельный Git-коммит" },
          ]}
          correctOrder={["baseline", "change", "run", "compare", "commit"]}
          explanation={"Маленькие проверяемые изменения не создают резкого скачка сложности."}
        />

        <RecallCard
          question={"Сформулируйте главную идею раздела своими словами."}
          answer={<p>
            {"Swagger или Postman проходит успешный жизненный цикл и отдельно проверяет 404 и 422. После каждой операции ученик сравнивает не только статус, но и итоговое состояние."}
          </p>}
        />

        <Callout tone="info">
          {"Не добавляем новый стек: текущая цель — уверенно понять ручная сквозная проверка и проверить наблюдаемый результат."}
        </Callout>
      </Section>

      <Section number="08" title={"Контрольная точка CRUD"}>
        <Lead>
          {"Сессия завершена, когда шесть endpoint согласованы, PUT и PATCH различаются, DELETE не возвращает body, а ошибки 404 и 422 воспроизводятся независимо."}
        </Lead>

        <div className="lesson-practice-steps">
          <h3>{"Опора на прошлый шаг"}</h3>
          <p>
            {"Используем то, что уже было проверено в разделе 07, и меняем только одну часть системы."}
          </p>

          <h3>{"Новый небольшой шаг"}</h3>
          <p>
            {"Разбираем «Контрольная точка CRUD» на одном небольшом примере и связываем его с текущим Planner API."}
          </p>

          <h3>{"Граница сложности"}</h3>
          <p>
            {"Не добавляем новый стек: текущая цель — уверенно понять контрольная точка crud и проверить наблюдаемый результат."}
          </p>
        </div>

        <TypeCards>
          <TypeCard badge={"вход"} title={"Что уже известно"} code={"проверенный контракт"}>
            {"Начинаем с существующего поведения и не переписываем соседние части без необходимости."}
          </TypeCard>
          <TypeCard badge={"шаг"} badgeTone="float" title={"Что делаем"} code={"Контрольная точка CRUD"}>
            {"Разбираем «Контрольная точка CRUD» на одном небольшом примере и связываем его с текущим Planner API."}
          </TypeCard>
          <TypeCard badge={"результат"} badgeTone="str" title={"Что проверяем"} code={"status + JSON + state"}>
            {"Проверяем публичный результат и только затем переходим к следующему разделу."}
          </TypeCard>
        </TypeCards>

        <CodeBlock
          caption={"Контрольная точка CRUD"}
          code={"CRUD complete\nmanual scenario complete\n404 consistent\n422 validated\n204 has no body\nready for automated tests"}
        />

        <RecallCard
          question={"Сформулируйте главную идею раздела своими словами."}
          answer={<p>
            {"Сессия завершена, когда шесть endpoint согласованы, PUT и PATCH различаются, DELETE не возвращает body, а ошибки 404 и 422 воспроизводятся независимо."}
          </p>}
        />

        <Callout tone="info">
          {"Не добавляем новый стек: текущая цель — уверенно понять контрольная точка crud и проверить наблюдаемый результат."}
        </Callout>

        <div className="lesson-check-group">
          <QuizCard
            question={"Что проверяем после изменения?"}
            options={[
              "публичный контракт",
              "только число строк",
              "название папки",
            ]}
            correctIndex={0}
            explanation={"Текущий блок строится на явном результате и последовательной проверке."}
          />
          <QuizCard
            question={"Как повышается сложность?"}
            options={[
              "по одному небольшому шагу",
              "сразу новым стеком",
              "без проверки",
            ]}
            correctIndex={0}
            explanation={"Текущий блок строится на явном результате и последовательной проверке."}
          />
          <QuizCard
            question={"Что остаётся главным артефактом?"}
            options={[
              "работающий Planner API",
              "случайный пример",
              "неиспользуемый файл",
            ]}
            correctIndex={0}
            explanation={"Текущий блок строится на явном результате и последовательной проверке."}
          />
          <QuizCard
            question={"Когда переходить дальше?"}
            options={[
              "после проверки текущего результата",
              "до запуска кода",
              "после удаления тестов",
            ]}
            correctIndex={0}
            explanation={"Текущий блок строится на явном результате и последовательной проверке."}
          />
        </div>

        <KeyTakeaways
          points={[
            <>{"Каждый новый шаг опирается на уже работающий контракт."}</>,
            <>{"Структура проекта остаётся небольшой и объяснимой."}</>,
            <>{"Метод, путь, статус и JSON проверяются отдельно."}</>,
            <>{"Ошибочные сценарии являются частью API-контракта."}</>,
            <>{"Git-коммит фиксирует одну завершённую мысль."}</>,
            <>{"Следующий стек появляется только после понятной проблемы."}</>,
          ]}
        />

        <PracticeCta text={"Повторите все восемь разделов урока на Planner API и сохраните проверенный результат отдельным коммитом."} />
      </Section>

    </RichLesson>
  );
}

// 68. Финальный проект 4: Postman, тесты, README и GitHub Release
export function Lesson68({ module }: { module?: string }) {
  return (
    <RichLesson>
      <RichHero
        variant="project"
        chip={module ?? BLOCK_TITLE}
        title={"Финальный проект 4: Postman, тесты, README и GitHub Release"}
        intro={"Код становится релизом, когда другой человек может клонировать репозиторий, установить зависимости, запустить API, повторить запросы и получить зелёные тесты. Материал развивается маленькими шагами и использует только уже знакомые части Planner API."}
        tags={[
          { icon: <Trophy size={14} />, label: "релиз Planner API" },
          { icon: <FileText size={14} />, label: "документация и тесты" },
        ]}
      />
      <TheoryBridge lesson={68} />

      <Section number="01" title={"От работающего к воспроизводимому проекту"}>
        <Lead>
          {"Код становится релизом, когда другой человек может клонировать репозиторий, установить зависимости, запустить API, повторить запросы и получить зелёные тесты."}
        </Lead>

        <div className="lesson-practice-steps">
          <h3>{"Опора на прошлый шаг"}</h3>
          <p>
            {"Используем то, что уже было проверено в предыдущих занятиях, и меняем только одну часть системы."}
          </p>

          <h3>{"Новый небольшой шаг"}</h3>
          <p>
            {"Разбираем «От работающего к воспроизводимому проекту» на одном небольшом примере и связываем его с текущим Planner API."}
          </p>

          <h3>{"Граница сложности"}</h3>
          <p>
            {"Не добавляем новый стек: текущая цель — уверенно понять от работающего к воспроизводимому проекту и проверить наблюдаемый результат."}
          </p>
        </div>

        <TypeCards>
          <TypeCard badge={"вход"} title={"Что уже известно"} code={"проверенный контракт"}>
            {"Начинаем с существующего поведения и не переписываем соседние части без необходимости."}
          </TypeCard>
          <TypeCard badge={"шаг"} badgeTone="float" title={"Что делаем"} code={"От работающего к воспроизводимому проекту"}>
            {"Разбираем «От работающего к воспроизводимому проекту» на одном небольшом примере и связываем его с текущим Planner API."}
          </TypeCard>
          <TypeCard badge={"результат"} badgeTone="str" title={"Что проверяем"} code={"status + JSON + state"}>
            {"Проверяем публичный результат и только затем переходим к следующему разделу."}
          </TypeCard>
        </TypeCards>

        <CodeBlock
          caption={"От работающего к воспроизводимому проекту"}
          code={"clean clone\ninstall dependencies\nrun uvicorn\nopen /docs\nrun pytest\nimport Postman collection\nreproduce CRUD"}
        />

        <RecallCard
          question={"Сформулируйте главную идею раздела своими словами."}
          answer={<p>
            {"Код становится релизом, когда другой человек может клонировать репозиторий, установить зависимости, запустить API, повторить запросы и получить зелёные тесты."}
          </p>}
        />

        <Callout tone="info">
          {"Не добавляем новый стек: текущая цель — уверенно понять от работающего к воспроизводимому проекту и проверить наблюдаемый результат."}
        </Callout>
      </Section>

      <Section number="02" title={"Postman-коллекция"}>
        <Lead>
          {"Одна коллекция хранит health, полный CRUD, 404 и 422. Переменная base_url убирает повтор адреса и делает запросы переносимыми между окружениями."}
        </Lead>

        <div className="lesson-practice-steps">
          <h3>{"Опора на прошлый шаг"}</h3>
          <p>
            {"Используем то, что уже было проверено в разделе 01, и меняем только одну часть системы."}
          </p>

          <h3>{"Новый небольшой шаг"}</h3>
          <p>
            {"Разбираем «Postman-коллекция» на одном небольшом примере и связываем его с текущим Planner API."}
          </p>

          <h3>{"Граница сложности"}</h3>
          <p>
            {"Не добавляем новый стек: текущая цель — уверенно понять postman-коллекция и проверить наблюдаемый результат."}
          </p>
        </div>

        <TypeCards>
          <TypeCard badge={"вход"} title={"Что уже известно"} code={"проверенный контракт"}>
            {"Начинаем с существующего поведения и не переписываем соседние части без необходимости."}
          </TypeCard>
          <TypeCard badge={"шаг"} badgeTone="float" title={"Что делаем"} code={"Postman-коллекция"}>
            {"Разбираем «Postman-коллекция» на одном небольшом примере и связываем его с текущим Planner API."}
          </TypeCard>
          <TypeCard badge={"результат"} badgeTone="str" title={"Что проверяем"} code={"status + JSON + state"}>
            {"Проверяем публичный результат и только затем переходим к следующему разделу."}
          </TypeCard>
        </TypeCards>

        <CodeBlock
          caption={"Postman-коллекция"}
          code={"Planner API\n├── Health\n├── Create task\n├── List tasks\n├── Get task\n├── Replace task\n├── Patch task\n├── Delete task\n├── Missing 404\n└── Invalid 422"}
        />

        <PredictOutput
          code={"Planner API\n├── Health\n├── Create task\n├── List tasks\n├── Get task\n├── Replace task\n├── Patch task\n├── Delete task\n├── Missing 404\n└── Invalid 422"}
          output={"Результат соответствует контракту текущего раздела"}
          hint={"Сначала проследите вход, затем действие и только потом итог."}
        />

        <RecallCard
          question={"Сформулируйте главную идею раздела своими словами."}
          answer={<p>
            {"Одна коллекция хранит health, полный CRUD, 404 и 422. Переменная base_url убирает повтор адреса и делает запросы переносимыми между окружениями."}
          </p>}
        />

        <Callout tone="info">
          {"Не добавляем новый стек: текущая цель — уверенно понять postman-коллекция и проверить наблюдаемый результат."}
        </Callout>
      </Section>

      <Section number="03" title={"Финальный набор TestClient"}>
        <Lead>
          {"Набор из 8–10 тестов защищает создание, чтение, PUT, PATCH, DELETE и ошибки. После операций изменения тест дополнительно читает ресурс и проверяет состояние."}
        </Lead>

        <div className="lesson-practice-steps">
          <h3>{"Опора на прошлый шаг"}</h3>
          <p>
            {"Используем то, что уже было проверено в разделе 02, и меняем только одну часть системы."}
          </p>

          <h3>{"Новый небольшой шаг"}</h3>
          <p>
            {"Разбираем «Финальный набор TestClient» на одном небольшом примере и связываем его с текущим Planner API."}
          </p>

          <h3>{"Граница сложности"}</h3>
          <p>
            {"Не добавляем новый стек: текущая цель — уверенно понять финальный набор testclient и проверить наблюдаемый результат."}
          </p>
        </div>

        <TypeCards>
          <TypeCard badge={"вход"} title={"Что уже известно"} code={"проверенный контракт"}>
            {"Начинаем с существующего поведения и не переписываем соседние части без необходимости."}
          </TypeCard>
          <TypeCard badge={"шаг"} badgeTone="float" title={"Что делаем"} code={"Финальный набор TestClient"}>
            {"Разбираем «Финальный набор TestClient» на одном небольшом примере и связываем его с текущим Planner API."}
          </TypeCard>
          <TypeCard badge={"результат"} badgeTone="str" title={"Что проверяем"} code={"status + JSON + state"}>
            {"Проверяем публичный результат и только затем переходим к следующему разделу."}
          </TypeCard>
        </TypeCards>

        <CodeBlock
          caption={"Финальный набор TestClient"}
          code={"test_list_tasks_is_empty\ntest_create_task\ntest_get_task_by_id\ntest_get_missing_task\ntest_replace_task\ntest_patch_only_one_field\ntest_delete_task\ntest_delete_missing_task\ntest_invalid_priority\ntest_blank_title"}
        />

        <RecallCard
          question={"Сформулируйте главную идею раздела своими словами."}
          answer={<p>
            {"Набор из 8–10 тестов защищает создание, чтение, PUT, PATCH, DELETE и ошибки. После операций изменения тест дополнительно читает ресурс и проверяет состояние."}
          </p>}
        />

        <Callout tone="info">
          {"Не добавляем новый стек: текущая цель — уверенно понять финальный набор testclient и проверить наблюдаемый результат."}
        </Callout>
      </Section>

      <Section number="04" title={"Fixtures и независимость тестов"}>
        <Lead>
          {"Conftest создаёт TestClient и очищает storage перед каждым сценарием. Каждый тест получает известный пустой список и id, начинающийся с единицы."}
        </Lead>

        <div className="lesson-practice-steps">
          <h3>{"Опора на прошлый шаг"}</h3>
          <p>
            {"Используем то, что уже было проверено в разделе 03, и меняем только одну часть системы."}
          </p>

          <h3>{"Новый небольшой шаг"}</h3>
          <p>
            {"Разбираем «Fixtures и независимость тестов» на одном небольшом примере и связываем его с текущим Planner API."}
          </p>

          <h3>{"Граница сложности"}</h3>
          <p>
            {"Не добавляем новый стек: текущая цель — уверенно понять fixtures и независимость тестов и проверить наблюдаемый результат."}
          </p>
        </div>

        <TypeCards>
          <TypeCard badge={"вход"} title={"Что уже известно"} code={"проверенный контракт"}>
            {"Начинаем с существующего поведения и не переписываем соседние части без необходимости."}
          </TypeCard>
          <TypeCard badge={"шаг"} badgeTone="float" title={"Что делаем"} code={"Fixtures и независимость тестов"}>
            {"Разбираем «Fixtures и независимость тестов» на одном небольшом примере и связываем его с текущим Planner API."}
          </TypeCard>
          <TypeCard badge={"результат"} badgeTone="str" title={"Что проверяем"} code={"status + JSON + state"}>
            {"Проверяем публичный результат и только затем переходим к следующему разделу."}
          </TypeCard>
        </TypeCards>

        <CodeBlock
          caption={"Fixtures и независимость тестов"}
          code={"@pytest.fixture(autouse=True)\ndef reset_storage():\n    clear_storage()\n    yield\n    clear_storage()\n\n@pytest.fixture\ndef client():\n    return TestClient(app)"}
        />

        <CompareSolutions
          question={"Какой подход лучше сохраняет ясную границу ответственности?"}
          left={{
            title: "Смешать всё в одном месте",
            code: "# HTTP, данные и правила в одной функции",
            note: "Изменение одной части требует читать весь сценарий.",
          }}
          right={{
            title: "Оставить явный контракт",
            code: "@pytest.fixture(autouse=True)\ndef reset_storage():\n    clear_storage()\n    yield\n    clear_storage()\n\n@pytest.fixture\ndef client():\n    return TestClient(app)",
            note: "Каждая часть делает одну понятную работу.",
          }}
          preferred="right"
          explanation={"Явная граница снижает нагрузку на новичка и упрощает проверку результата."}
        />

        <RecallCard
          question={"Сформулируйте главную идею раздела своими словами."}
          answer={<p>
            {"Conftest создаёт TestClient и очищает storage перед каждым сценарием. Каждый тест получает известный пустой список и id, начинающийся с единицы."}
          </p>}
        />

        <Callout tone="info">
          {"Не добавляем новый стек: текущая цель — уверенно понять fixtures и независимость тестов и проверить наблюдаемый результат."}
        </Callout>
      </Section>

      <Section number="05" title={"README от установки до ограничений"}>
        <Lead>
          {"README объясняет назначение проекта, стек, структуру, установку, запуск, /docs, тесты и примеры запросов. Отдельно указывается, что данные исчезают после перезапуска."}
        </Lead>

        <div className="lesson-practice-steps">
          <h3>{"Опора на прошлый шаг"}</h3>
          <p>
            {"Используем то, что уже было проверено в разделе 04, и меняем только одну часть системы."}
          </p>

          <h3>{"Новый небольшой шаг"}</h3>
          <p>
            {"Разбираем «README от установки до ограничений» на одном небольшом примере и связываем его с текущим Planner API."}
          </p>

          <h3>{"Граница сложности"}</h3>
          <p>
            {"Не добавляем новый стек: текущая цель — уверенно понять readme от установки до ограничений и проверить наблюдаемый результат."}
          </p>
        </div>

        <TypeCards>
          <TypeCard badge={"вход"} title={"Что уже известно"} code={"проверенный контракт"}>
            {"Начинаем с существующего поведения и не переписываем соседние части без необходимости."}
          </TypeCard>
          <TypeCard badge={"шаг"} badgeTone="float" title={"Что делаем"} code={"README от установки до ограничений"}>
            {"Разбираем «README от установки до ограничений» на одном небольшом примере и связываем его с текущим Planner API."}
          </TypeCard>
          <TypeCard badge={"результат"} badgeTone="str" title={"Что проверяем"} code={"status + JSON + state"}>
            {"Проверяем публичный результат и только затем переходим к следующему разделу."}
          </TypeCard>
        </TypeCards>

        <CodeBlock
          caption={"README от установки до ограничений"}
          code={"# StudyHub Planner API\n\n## Возможности\n## Стек\n## Структура\n## Установка\n## Запуск\n## API docs\n## Тесты\n## Примеры\n## Ограничения\n## Следующий этап"}
        />

        <BugHunt
          code={"# ошибка: важное правило пропущено\n# StudyHub Planner API\n\n## Возможности\n## Стек\n## Структура\n## Установка\n## Запуск\n## API docs\n## Тесты\n## Примеры\n## Ограничения\n## Следующий этап"}
          question={"Какую проблему нужно проверить в первую очередь?"}
          options={[
            "Нарушен публичный контракт текущей операции",
            "Нужно немедленно добавить PostgreSQL",
            "Нужно удалить все типы данных",
          ]}
          correctIndex={0}
          explanation={"Сначала сравнивают метод, путь, статус, JSON и состояние с утверждённым контрактом."}
          fix={"# StudyHub Planner API\n\n## Возможности\n## Стек\n## Структура\n## Установка\n## Запуск\n## API docs\n## Тесты\n## Примеры\n## Ограничения\n## Следующий этап"}
        />

        <RecallCard
          question={"Сформулируйте главную идею раздела своими словами."}
          answer={<p>
            {"README объясняет назначение проекта, стек, структуру, установку, запуск, /docs, тесты и примеры запросов. Отдельно указывается, что данные исчезают после перезапуска."}
          </p>}
        />

        <Callout tone="info">
          {"Не добавляем новый стек: текущая цель — уверенно понять readme от установки до ограничений и проверить наблюдаемый результат."}
        </Callout>
      </Section>

      <Section number="06" title={"Git tag и GitHub Release"}>
        <Lead>
          {"Перед тегом проверяются pytest, git status и README. Тег v1.0.0 указывает на конкретный commit, а Release описывает возможности и ограничения версии."}
        </Lead>

        <div className="lesson-practice-steps">
          <h3>{"Опора на прошлый шаг"}</h3>
          <p>
            {"Используем то, что уже было проверено в разделе 05, и меняем только одну часть системы."}
          </p>

          <h3>{"Новый небольшой шаг"}</h3>
          <p>
            {"Разбираем «Git tag и GitHub Release» на одном небольшом примере и связываем его с текущим Planner API."}
          </p>

          <h3>{"Граница сложности"}</h3>
          <p>
            {"Не добавляем новый стек: текущая цель — уверенно понять git tag и github release и проверить наблюдаемый результат."}
          </p>
        </div>

        <TypeCards>
          <TypeCard badge={"вход"} title={"Что уже известно"} code={"проверенный контракт"}>
            {"Начинаем с существующего поведения и не переписываем соседние части без необходимости."}
          </TypeCard>
          <TypeCard badge={"шаг"} badgeTone="float" title={"Что делаем"} code={"Git tag и GitHub Release"}>
            {"Разбираем «Git tag и GitHub Release» на одном небольшом примере и связываем его с текущим Planner API."}
          </TypeCard>
          <TypeCard badge={"результат"} badgeTone="str" title={"Что проверяем"} code={"status + JSON + state"}>
            {"Проверяем публичный результат и только затем переходим к следующему разделу."}
          </TypeCard>
        </TypeCards>

        <CodeBlock
          caption={"Git tag и GitHub Release"}
          code={"pytest -q\ngit status\ngit tag v1.0.0\ngit push origin main\ngit push origin v1.0.0"}
        />

        <StepThrough
          code={"pytest -q\ngit status\ngit tag v1.0.0\ngit push origin main\ngit push origin v1.0.0"}
          steps={[
            { line: 0, note: "Определяется вход текущей операции.", vars: { этап: "input" } },
            { line: 1, note: "Выполняется одна основная ответственность.", vars: { этап: "action" } },
            { line: 2, note: "Получается проверяемый результат.", vars: { этап: "result" } },
          ]}
        />

        <RecallCard
          question={"Сформулируйте главную идею раздела своими словами."}
          answer={<p>
            {"Перед тегом проверяются pytest, git status и README. Тег v1.0.0 указывает на конкретный commit, а Release описывает возможности и ограничения версии."}
          </p>}
        />

        <Callout tone="info">
          {"Не добавляем новый стек: текущая цель — уверенно понять git tag и github release и проверить наблюдаемый результат."}
        </Callout>
      </Section>

      <Section number="07" title={"Защита пути одного запроса"}>
        <Lead>
          {"Ученик прослеживает POST от JSON body через TaskCreate, router, CRUD и storage до TaskRead и 201. Он также показывает, где запрос останавливается с 422 или 404."}
        </Lead>

        <div className="lesson-practice-steps">
          <h3>{"Опора на прошлый шаг"}</h3>
          <p>
            {"Используем то, что уже было проверено в разделе 06, и меняем только одну часть системы."}
          </p>

          <h3>{"Новый небольшой шаг"}</h3>
          <p>
            {"Разбираем «Защита пути одного запроса» на одном небольшом примере и связываем его с текущим Planner API."}
          </p>

          <h3>{"Граница сложности"}</h3>
          <p>
            {"Не добавляем новый стек: текущая цель — уверенно понять защита пути одного запроса и проверить наблюдаемый результат."}
          </p>
        </div>

        <TypeCards>
          <TypeCard badge={"вход"} title={"Что уже известно"} code={"проверенный контракт"}>
            {"Начинаем с существующего поведения и не переписываем соседние части без необходимости."}
          </TypeCard>
          <TypeCard badge={"шаг"} badgeTone="float" title={"Что делаем"} code={"Защита пути одного запроса"}>
            {"Разбираем «Защита пути одного запроса» на одном небольшом примере и связываем его с текущим Planner API."}
          </TypeCard>
          <TypeCard badge={"результат"} badgeTone="str" title={"Что проверяем"} code={"status + JSON + state"}>
            {"Проверяем публичный результат и только затем переходим к следующему разделу."}
          </TypeCard>
        </TypeCards>

        <CodeBlock
          caption={"Защита пути одного запроса"}
          code={"JSON body\n    ↓\nTaskCreate validation\n    ↓\nrouter endpoint\n    ↓\nCRUD operation\n    ↓\nstorage\n    ↓\nTaskRead + status"}
        />

        <CodeSequence
          title={"Соберите безопасную последовательность"}
          prompt={"Расположите действия так, чтобы каждый шаг можно было проверить отдельно."}
          pieces={[
            { id: "baseline", code: "зафиксировать текущее поведение" },
            { id: "change", code: "изменить одну ответственность" },
            { id: "run", code: "повторить запрос или тест" },
            { id: "compare", code: "сравнить статус, JSON и состояние" },
            { id: "commit", code: "сохранить отдельный Git-коммит" },
          ]}
          correctOrder={["baseline", "change", "run", "compare", "commit"]}
          explanation={"Маленькие проверяемые изменения не создают резкого скачка сложности."}
        />

        <RecallCard
          question={"Сформулируйте главную идею раздела своими словами."}
          answer={<p>
            {"Ученик прослеживает POST от JSON body через TaskCreate, router, CRUD и storage до TaskRead и 201. Он также показывает, где запрос останавливается с 422 или 404."}
          </p>}
        />

        <Callout tone="info">
          {"Не добавляем новый стек: текущая цель — уверенно понять защита пути одного запроса и проверить наблюдаемый результат."}
        </Callout>
      </Section>

      <Section number="08" title={"Финальная контрольная точка"}>
        <Lead>
          {"Этап завершён, когда CRUD демонстрируется через Postman, pytest проходит, README проверен на чистом клоне, а GitHub содержит Release v1.0.0. Следующая проблема — потеря данных после перезапуска."}
        </Lead>

        <div className="lesson-practice-steps">
          <h3>{"Опора на прошлый шаг"}</h3>
          <p>
            {"Используем то, что уже было проверено в разделе 07, и меняем только одну часть системы."}
          </p>

          <h3>{"Новый небольшой шаг"}</h3>
          <p>
            {"Разбираем «Финальная контрольная точка» на одном небольшом примере и связываем его с текущим Planner API."}
          </p>

          <h3>{"Граница сложности"}</h3>
          <p>
            {"Не добавляем новый стек: текущая цель — уверенно понять финальная контрольная точка и проверить наблюдаемый результат."}
          </p>
        </div>

        <TypeCards>
          <TypeCard badge={"вход"} title={"Что уже известно"} code={"проверенный контракт"}>
            {"Начинаем с существующего поведения и не переписываем соседние части без необходимости."}
          </TypeCard>
          <TypeCard badge={"шаг"} badgeTone="float" title={"Что делаем"} code={"Финальная контрольная точка"}>
            {"Разбираем «Финальная контрольная точка» на одном небольшом примере и связываем его с текущим Planner API."}
          </TypeCard>
          <TypeCard badge={"результат"} badgeTone="str" title={"Что проверяем"} code={"status + JSON + state"}>
            {"Проверяем публичный результат и только затем переходим к следующему разделу."}
          </TypeCard>
        </TypeCards>

        <CodeBlock
          caption={"Финальная контрольная точка"}
          code={"[ ] clean install works\n[ ] uvicorn starts\n[ ] /docs shows routers\n[ ] Postman scenario passes\n[ ] pytest passes\n[ ] README matches code\n[ ] in-memory limit documented\n[ ] v1.0.0 published"}
        />

        <RecallCard
          question={"Сформулируйте главную идею раздела своими словами."}
          answer={<p>
            {"Этап завершён, когда CRUD демонстрируется через Postman, pytest проходит, README проверен на чистом клоне, а GitHub содержит Release v1.0.0. Следующая проблема — потеря данных после перезапуска."}
          </p>}
        />

        <Callout tone="info">
          {"Не добавляем новый стек: текущая цель — уверенно понять финальная контрольная точка и проверить наблюдаемый результат."}
        </Callout>

        <div className="lesson-check-group">
          <QuizCard
            question={"Что проверяем после изменения?"}
            options={[
              "публичный контракт",
              "только число строк",
              "название папки",
            ]}
            correctIndex={0}
            explanation={"Текущий блок строится на явном результате и последовательной проверке."}
          />
          <QuizCard
            question={"Как повышается сложность?"}
            options={[
              "по одному небольшому шагу",
              "сразу новым стеком",
              "без проверки",
            ]}
            correctIndex={0}
            explanation={"Текущий блок строится на явном результате и последовательной проверке."}
          />
          <QuizCard
            question={"Что остаётся главным артефактом?"}
            options={[
              "работающий Planner API",
              "случайный пример",
              "неиспользуемый файл",
            ]}
            correctIndex={0}
            explanation={"Текущий блок строится на явном результате и последовательной проверке."}
          />
          <QuizCard
            question={"Когда переходить дальше?"}
            options={[
              "после проверки текущего результата",
              "до запуска кода",
              "после удаления тестов",
            ]}
            correctIndex={0}
            explanation={"Текущий блок строится на явном результате и последовательной проверке."}
          />
        </div>

        <KeyTakeaways
          points={[
            <>{"Каждый новый шаг опирается на уже работающий контракт."}</>,
            <>{"Структура проекта остаётся небольшой и объяснимой."}</>,
            <>{"Метод, путь, статус и JSON проверяются отдельно."}</>,
            <>{"Ошибочные сценарии являются частью API-контракта."}</>,
            <>{"Git-коммит фиксирует одну завершённую мысль."}</>,
            <>{"Следующий стек появляется только после понятной проблемы."}</>,
          ]}
        />

        <PracticeCta text={"Повторите все восемь разделов урока на Planner API и сохраните проверенный результат отдельным коммитом."} />
      </Section>

    </RichLesson>
  );
}
