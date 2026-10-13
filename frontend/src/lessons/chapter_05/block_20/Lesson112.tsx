import { FileText, Save } from "lucide-react";
import { BugHunt, Callout, CodeBlock, CompareSolutions, KeyTakeaways, Lead, MethodGrid, PracticeCta, QuizCard, RecallCard, RichHero, RichLesson, Section, StepThrough, TerminalDemo, TypeCard, TypeCards } from "../../shared";
const BLOCK_TITLE = "Блок 20 · Остальные возможности FastAPI и Personal StudyHub";

export function Lesson112({
  module,
}: {
  module?: string;
}) {
  return (
    <RichLesson>
      <RichHero
        variant="project"
        chip={module ?? BLOCK_TITLE}
        title={"Form, multipart и UploadFile"}
        intro={"Научим Personal StudyHub принимать не только JSON: разберём HTML-формы, multipart/form-data и безопасную загрузку вложения задачи без доверия к имени, типу и размеру файла."}
        tags={[
          {
            icon: <FileText size={14} />,
            label: "Form и multipart",
          },
          {
            icon: <Save size={14} />,
            label: "безопасный UploadFile",
          },
        ]}
      />

      <Callout tone="info">
        <strong>{"Связь с курсом."}</strong>
        {" "}
        {"Маршруты уже принимают JSON-схемы, а auth token endpoint знаком с form-urlencoded. Теперь запрос должен одновременно передать текстовые поля и бинарный файл."}
        {" "}
        <strong>{"Важно не перепутать:"}</strong>
        {" "}
        {"UploadFile предоставляет поток и метаданные, но не доказывает безопасность содержимого. Content-Type, имя и размер считаются недоверенными входными данными."}
      </Callout>

      <div className="lesson-route">
        <ol>
        <li>
          <strong>{"Сравнить тела."}</strong>
          {" "}
          {"понять, когда нужен JSON, application/x-www-form-urlencoded или multipart/form-data."}
        </li>
        <li>
          <strong>{"Принять файл."}</strong>
          {" "}
          {"использовать UploadFile и синхронный file.file внутри обычного def endpoint."}
        </li>
        <li>
          <strong>{"Проверить границы."}</strong>
          {" "}
          {"ограничить размер и тип, сгенерировать серверное имя, не доверять filename."}
        </li>
        <li>
          <strong>{"Сохранить согласованно."}</strong>
          {" "}
          {"разделить файл на диске и метаданные в базе, затем протестировать оба результата."}
        </li>
        </ol>
        <p>
          {"Маршрут занятия проходит от знакомой проблемы к проверяемому изменению сквозного проекта."}
        </p>
      </div>

      <TypeCards>
        <TypeCard
          badge={"до"}
          title={"Состояние проекта"}
          code={`API принимает JSON и credentials form`}
        >
          {"API принимает JSON и credentials form"}
        </TypeCard>
        <TypeCard
          badge={"+"}
          badgeTone={"float"}
          title={"Изменение урока"}
          code={`multipart и вложение задачи`}
        >
          {"multipart и вложение задачи"}
        </TypeCard>
        <TypeCard
          badge={"после"}
          badgeTone={"str"}
          title={"Новый результат"}
          code={`файл и метаданные сохраняются безопасно`}
        >
          {"файл и метаданные сохраняются безопасно"}
        </TypeCard>
      </TypeCards>

      <Section
        number={"01"}
        title={"Три формата тела запроса"}
      >
        <Lead>
          {"Тело HTTP-запроса имеет Content-Type. FastAPI выбирает способ разбора не по названию endpoint, а по объявленным параметрам и фактическому формату клиента."}
        </Lead>

        <div className="lesson-practice-steps">
        <h3>{"application/json"}</h3>
        <p>{"удобен для вложенных структур и обычного API CRUD."}</p>
        <h3>{"application/x-www-form-urlencoded"}</h3>
        <p>{"передаёт простые пары полей, как форма логина."}</p>
        <h3>{"multipart/form-data"}</h3>
        <p>{"разделяет тело на части и может переносить текст вместе с бинарным файлом."}</p>
        </div>

        <CodeBlock
          caption={"один HTTP endpoint — один ожидаемый формат"}
          code={`POST /tasks
Content-Type: application/json
{"title": "Read SQL", "priority": 4}

POST /auth/token
Content-Type: application/x-www-form-urlencoded
username=nikita&password=secret

POST /tasks/7/attachments
Content-Type: multipart/form-data; boundary=...
title=diagram&file=<binary bytes>`}
        />

        <TypeCards>
          <TypeCard badge={"JSON"} title={"Структурированные данные"} code={`{"title": "SQL"}`}>
            {"Основной формат request schemas и response schemas в REST API."}
          </TypeCard>
          <TypeCard badge={"Form"} badgeTone={"float"} title={"Простые поля формы"} code={`username=...&password=...`}>
            {"Подходит для HTML-форм и OAuth2PasswordRequestForm."}
          </TypeCard>
          <TypeCard badge={"Multipart"} badgeTone={"str"} title={"Поля плюс файл"} code={`description + file`}>
            {"Каждая часть имеет собственные заголовки и содержимое."}
          </TypeCard>
        </TypeCards>

        <Callout tone="info">
          {"JSON и multipart не объединяются автоматически в одну Pydantic body-модель: формат контракта нужно спроектировать явно."}
        </Callout>
      </Section>

      <Section
        number={"02"}
        title={"Form и установка python-multipart"}
      >
        <Lead>
          {"Параметр Form сообщает FastAPI, что значение приходит не из JSON. Для разбора form-data и multipart проекту нужна зависимость python-multipart."}
        </Lead>

        <div className="lesson-practice-steps">
        <h3>{"Явное объявление"}</h3>
        <p>{"Form(...) отличает поле формы от query-параметра."}</p>
        <h3>{"Annotated"}</h3>
        <p>{"метаданные источника остаются рядом с типом."}</p>
        <h3>{"Зависимость проекта"}</h3>
        <p>{"python-multipart фиксируется в requirements или pyproject."}</p>
        </div>

        <CodeBlock
          caption={"два валидируемых поля формы"}
          code={`from typing import Annotated

from fastapi import APIRouter, Form

router = APIRouter()


@router.post("/feedback")
def create_feedback(
    topic: Annotated[str, Form(min_length=3, max_length=80)],
    message: Annotated[str, Form(min_length=1, max_length=1000)],
) -> dict[str, str]:
    return {"topic": topic, "message": message}`}
        />

        <TerminalDemo
          title={"подготовка multipart"}
          lines={[
            { cmd: "python -m pip install python-multipart" },
            { out: "Successfully installed python-multipart" },
            { cmd: "curl -X POST http://127.0.0.1:8000/feedback -F \"topic=API\" -F \"message=Works\"" },
            { out: "{\"topic\":\"API\",\"message\":\"Works\"}" }
          ]}
        />

        <Callout tone="info">
          {"Отсутствующая библиотека проявляется при построении маршрута. Это зависимость приложения, а не случайная настройка локального компьютера."}
        </Callout>
      </Section>

      <Section
        number={"03"}
        title={"UploadFile вместо bytes для больших файлов"}
      >
        <Lead>
          {"Параметр bytes заставляет собрать всё содержимое в памяти. UploadFile предоставляет метаданные и файловый объект, который может быть временно сохранён на диск и читаться порциями."}
        </Lead>

        <div className="lesson-practice-steps">
        <h3>{"filename"}</h3>
        <p>{"исходное имя клиента полезно только как метаданные для отображения."}</p>
        <h3>{"content_type"}</h3>
        <p>{"заявленный MIME-type помогает первичной проверке, но может быть подделан."}</p>
        <h3>{"file"}</h3>
        <p>{"синхронный file-like объект подходит для обычного def endpoint текущего этапа."}</p>
        </div>

        <CodeBlock
          caption={"метаданные UploadFile"}
          code={`from typing import Annotated

from fastapi import File, UploadFile


def inspect_upload(
    upload: Annotated[UploadFile, File(description="Task attachment")],
) -> dict[str, str | None]:
    return {
        "filename": upload.filename,
        "content_type": upload.content_type,
    }`}
        />

        <CompareSolutions
          question={"Как принимать файл, который может быть больше нескольких килобайт?"}
          left={{
            title: "bytes",
            code: `file: bytes`,
            note: "Всё содержимое собирается в оперативной памяти до вызова endpoint.",
          }}
          right={{
            title: "UploadFile",
            code: `file: UploadFile`,
            note: "Доступны поток, filename, content_type и временное хранение.",
          }}
          preferred={"right"}
          explanation={"UploadFile даёт более подходящий контракт для потоковой проверки и сохранения."}
        />

        <Callout tone="info">
          {"На этом этапе endpoint остаётся синхронным: чтение выполняется через upload.file, без введения async/await."}
        </Callout>
      </Section>

      <Section
        number={"04"}
        title={"Размер нужно ограничить до сохранения"}
      >
        <Lead>
          {"Заявленный Content-Length может отсутствовать или быть неверным. Надёжный учебный контроль читает максимум limit + 1 байт и отклоняет файл, если получено больше лимита."}
        </Lead>

        <div className="lesson-practice-steps">
        <h3>{"Лимит"}</h3>
        <p>{"задаётся константой или настройкой и отражается в документации."}</p>
        <h3>{"Проверка"}</h3>
        <p>{"читается только ограниченный объём, а не бесконечный поток в память."}</p>
        <h3>{"Позиция"}</h3>
        <p>{"после проверки file.seek(0) возвращает поток к началу перед копированием."}</p>
        </div>

        <CodeBlock
          caption={"жёсткая граница 2 MiB"}
          code={`from fastapi import HTTPException, UploadFile, status

MAX_UPLOAD_BYTES = 2 * 1024 * 1024


def validate_size(upload: UploadFile) -> None:
    chunk = upload.file.read(MAX_UPLOAD_BYTES + 1)
    if len(chunk) > MAX_UPLOAD_BYTES:
        raise HTTPException(
            status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
            detail="File is too large",
        )
    upload.file.seek(0)`}
        />

        <StepThrough
          code={`limit = 4
data = stream.read(limit + 1)
if len(data) > limit:
    result = "reject"
else:
    stream.seek(0)
    result = "save"`}
          steps={[
            { line: 0, note: "Приложение знает максимально допустимый объём.", vars: {"limit": "4 bytes"} },
            { line: 1, note: "Читаем на один байт больше, чтобы заметить превышение.", vars: {"read": "up to 5 bytes"} },
            { line: 2, note: "Сравниваем фактически прочитанный размер.", vars: {"condition": "len(data) > 4"} },
            { line: 4, note: "Для допустимого файла возвращаем указатель к началу.", vars: {"position": "0"} },
            { line: 5, note: "Только после проверки начинается сохранение.", vars: {"result": "save"} }
          ]}
        />

        <Callout tone="info">
          {"413 сообщает именно о слишком большом теле. Это понятнее, чем общий 400 без причины."}
        </Callout>
      </Section>

      <Section
        number={"05"}
        title={"Не доверяем filename и content_type"}
      >
        <Lead>
          {"Клиент может прислать имя ../../config.py или указать image/png для произвольных байтов. Сервер генерирует собственное имя и ограничивает разрешённые типы."}
        </Lead>

        <div className="lesson-practice-steps">
        <h3>{"Серверное имя"}</h3>
        <p>{"UUID или другой идентификатор исключает путь, переданный клиентом."}</p>
        <h3>{"Расширение"}</h3>
        <p>{"выбирается из allowlist по проверенному типу, а не копируется целиком."}</p>
        <h3>{"Папка"}</h3>
        <p>{"итоговый Path должен оставаться внутри заранее определённого upload directory."}</p>
        </div>

        <CodeBlock
          caption={"сервер выбирает безопасный путь"}
          code={`from pathlib import Path
from uuid import uuid4

ALLOWED_TYPES = {
    "image/png": ".png",
    "image/jpeg": ".jpg",
    "application/pdf": ".pdf",
}


def build_storage_path(upload_dir: Path, content_type: str | None) -> Path:
    suffix = ALLOWED_TYPES.get(content_type or "")
    if suffix is None:
        raise ValueError("Unsupported file type")
    return upload_dir / f"{uuid4().hex}{suffix}"`}
        />

        <BugHunt
          code={`target = UPLOAD_DIR / upload.filename
with target.open("wb") as output:
    shutil.copyfileobj(upload.file, output)`}
          question={"Почему такой путь нельзя считать безопасным?"}
          options={[
            "filename контролирует клиент и может содержать путь",
            "Path не умеет записывать bytes",
            "UploadFile запрещён в def endpoint"
          ]}
          correctIndex={0}
          explanation={"Исходное имя нельзя использовать как путь хранения без строгой нормализации и собственной схемы имён."}
          fix={`target = build_storage_path(UPLOAD_DIR, upload.content_type)
with target.open("wb") as output:
    shutil.copyfileobj(upload.file, output)`}
        />

        <Callout tone="info">
          {"Allowlist MIME-type — только первый барьер. Для чувствительных файлов в реальном продукте нужна проверка содержимого и антивирусная обработка."}
        </Callout>
      </Section>

      <Section
        number={"06"}
        title={"Файл на диске, метаданные в базе"}
      >
        <Lead>
          {"База не обязана хранить бинарные байты. Для StudyHub достаточно сохранить файл в контролируемой папке, а в AttachmentModel записать идентификатор владельца, безопасное имя, исходное имя и размер."}
        </Lead>

        <div className="lesson-practice-steps">
        <h3>{"Файловая система"}</h3>
        <p>{"хранит содержимое по внутреннему storage_name."}</p>
        <h3>{"SQLite"}</h3>
        <p>{"хранит связь task_id, owner_id, original_name, media_type и size."}</p>
        <h3>{"Компенсация"}</h3>
        <p>{"если commit не прошёл, уже записанный файл удаляется, чтобы не остался сиротой."}</p>
        </div>

        <CodeBlock
          caption={"согласование двух хранилищ"}
          code={`from pathlib import Path
import shutil

from sqlalchemy.orm import Session


def save_attachment(
    db: Session,
    task: TaskModel,
    upload: UploadFile,
    target: Path,
    size: int,
) -> AttachmentModel:
    try:
        with target.open("wb") as output:
            shutil.copyfileobj(upload.file, output)

        attachment = AttachmentModel(
            task_id=task.id,
            owner_id=task.user_id,
            storage_name=target.name,
            original_name=upload.filename or "upload",
            media_type=upload.content_type,
            size=size,
        )
        db.add(attachment)
        db.commit()
        db.refresh(attachment)
        return attachment
    except Exception:
        db.rollback()
        target.unlink(missing_ok=True)
        raise`}
        />

        <MethodGrid
          rows={[
            [<>{"target.open(\"wb\")"}</>, "создаёт файл только после валидации"],
            [<>{"AttachmentModel(...)"}</>, "фиксирует метаданные и принадлежность"],
            [<>{"db.commit()"}</>, "делает запись видимой в базе"],
            [<>{"db.rollback()"}</>, "восстанавливает Session после ошибки"],
            [<>{"target.unlink(...)"}</>, "компенсирует уже созданный файл"]
          ]}
        />

        <Callout tone="info">
          {"Файловая система и SQLite не образуют одну настоящую транзакцию. Поэтому код явно описывает компенсацию при частичном сбое."}
        </Callout>
      </Section>

      <Section
        number={"07"}
        title={"Endpoint и TestClient-сценарий"}
      >
        <Lead>
          {"Маршрут принимает текстовое описание и файл одной multipart-формой, получает current user, проверяет владение задачей и возвращает только безопасные метаданные."}
        </Lead>

        <div className="lesson-practice-steps">
        <h3>{"Form"}</h3>
        <p>{"description приходит отдельной текстовой частью."}</p>
        <h3>{"File"}</h3>
        <p>{"upload приходит бинарной частью multipart."}</p>
        <h3>{"Ownership"}</h3>
        <p>{"task ищется одновременно по id и current_user.id."}</p>
        </div>

        <CodeBlock
          caption={"multipart endpoint с ownership"}
          code={`@router.post(
    "/tasks/{task_id}/attachments",
    response_model=AttachmentRead,
    status_code=201,
)
def upload_attachment(
    task_id: int,
    description: Annotated[str, Form(max_length=300)],
    upload: Annotated[UploadFile, File()],
    current_user: Annotated[UserModel, Depends(get_current_user)],
    db: Annotated[Session, Depends(get_db)],
) -> AttachmentModel:
    task = task_service.get_owned_task(db, task_id, current_user.id)
    return attachment_service.create(db, task, upload, description)`}
        />

        <TerminalDemo
          title={"проверка загрузки"}
          lines={[
            { cmd: "curl -X POST http://127.0.0.1:8000/tasks/7/attachments -H \"Authorization: Bearer TOKEN\" -F \"description=ER diagram\" -F \"upload=@schema.png;type=image/png\"" },
            { out: "{\"id\":3,\"task_id\":7,\"original_name\":\"schema.png\",\"media_type\":\"image/png\"}" }
          ]}
        />

        <Callout tone="info">
          {"Response schema не возвращает абсолютный путь на сервере: это внутренняя деталь хранения."}
        </Callout>
      </Section>

      <Section
        number={"08"}
        title={"Контрольная точка: тестируем не только 201"}
      >
        <Lead>
          {"Положительный upload — только один сценарий. Готовый маршрут также отклоняет чужую задачу, неподдерживаемый тип, превышение размера и запрос без файла."}
        </Lead>

        <div className="lesson-practice-steps">
        <h3>{"Успех"}</h3>
        <p>{"метаданные записаны, файл существует, owner и task связаны."}</p>
        <h3>{"Валидация"}</h3>
        <p>{"неподдерживаемый MIME-type и большой размер возвращают согласованные ошибки."}</p>
        <h3>{"Безопасность"}</h3>
        <p>{"второй пользователь не может добавить или прочитать чужое вложение."}</p>
        </div>

        <CodeBlock
          caption={"multipart в TestClient"}
          code={`def test_upload_attachment(client, auth_headers, png_bytes) -> None:
    response = client.post(
        "/tasks/1/attachments",
        headers=auth_headers,
        data={"description": "diagram"},
        files={"upload": ("diagram.png", png_bytes, "image/png")},
    )
    assert response.status_code == 201
    assert response.json()["original_name"] == "diagram.png"


def test_rejects_large_attachment(client, auth_headers) -> None:
    response = client.post(
        "/tasks/1/attachments",
        headers=auth_headers,
        data={"description": "too large"},
        files={"upload": ("big.pdf", b"x" * 50, "application/pdf")},
    )
    assert response.status_code == 413`}
        />

        <RecallCard
          question={"Почему недостаточно проверить только content_type?"}
          hint={"Это строка из входящего запроса."}
          answer={
            <p>{"Клиент сам объявляет Content-Type, поэтому строка может не соответствовать фактическим байтам. Она подходит для первичного allowlist, но не является доказательством безопасного содержимого."}</p>
          }
        />

        <Callout tone="info">
          {"В тесте лимит можно уменьшить через settings override, чтобы не создавать многомегабайтный объект."}
        </Callout>

        <div className="lesson-check-group">
          <QuizCard
            question={"Когда нужен multipart/form-data?"}
            options={[
              "когда есть текстовые части и файл",
              "для любого GET",
              "только для JSON"
            ]}
            correctIndex={0}
            explanation={"Multipart делит тело на несколько частей с собственными метаданными."}
          />
          <QuizCard
            question={"Почему UploadFile предпочтительнее bytes для файла?"}
            options={[
              "даёт поток и метаданные",
              "автоматически удаляет вирусы",
              "всегда шифрует содержимое"
            ]}
            correctIndex={0}
            explanation={"UploadFile не требует сразу держать весь файл как bytes в памяти."}
          />
          <QuizCard
            question={"Можно ли использовать upload.filename как путь хранения?"}
            options={[
              "нет, имя контролирует клиент",
              "да, всегда",
              "только без расширения"
            ]}
            correctIndex={0}
            explanation={"Сервер должен генерировать собственное безопасное имя."}
          />
          <QuizCard
            question={"Что сделать после чтения файла для проверки размера?"}
            options={[
              "seek(0)",
              "commit()",
              "base64 encode"
            ]}
            correctIndex={0}
            explanation={"Перед последующим копированием указатель возвращают к началу."}
          />
        </div>

        <KeyTakeaways
          points={[
            <>{"Content-Type определяет формат тела запроса."}</>,
            <>{"Form читает поля формы, а multipart переносит поля и бинарные части."}</>,
            <>{"Для Form и UploadFile нужен python-multipart."}</>,
            <>{"UploadFile предоставляет метаданные и file-like поток."}</>,
            <>{"Размер проверяется по фактически прочитанным байтам."}</>,
            <>{"Filename и content_type считаются недоверенными."}</>,
            <>{"Сервер генерирует storage_name и хранит метаданные отдельно."}</>,
            <>{"Файл и запись базы требуют компенсации при частичном сбое."}</>
          ]}
        />

        <PracticeCta
          text={"Реализуйте POST /tasks/{task_id}/attachments с Form, UploadFile, лимитом размера, allowlist типов, серверным именем, ownership и TestClient-проверками успеха и отказов."}
        />
      </Section>
    </RichLesson>
  );
}
