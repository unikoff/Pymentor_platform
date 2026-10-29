import{t as e}from"./jsx-runtime-CY_jTiqj.js";import{A as t,C as n,D as r,E as i,I as a,L as o,M as s,N as c,O as l,P as u,T as d,b as f,j as p,v as m,x as h,y as g}from"./shared-JA1PGxXr.js";import{t as _}from"./file-text-BJyuJnB_.js";import{t as v}from"./save-BnHI4CDM.js";import{t as y}from"./CodeEditor-DqHMt3P8.js";var b=e(),x=`Блок 20 · Остальные возможности FastAPI и Personal StudyHub`;function S({module:e}){return(0,b.jsxs)(c,{children:[(0,b.jsx)(s,{variant:`project`,chip:e??x,title:`Form, multipart и UploadFile`,intro:`Научим Personal StudyHub принимать не только JSON: разберём HTML-формы, multipart/form-data и безопасную загрузку вложения задачи без доверия к имени, типу и размеру файла.`,tags:[{icon:(0,b.jsx)(_,{size:14}),label:`Form и multipart`},{icon:(0,b.jsx)(v,{size:14}),label:`безопасный UploadFile`}]}),(0,b.jsxs)(i,{tone:`info`,children:[(0,b.jsx)(`strong`,{children:`Связь с курсом.`}),` `,`Маршруты уже принимают JSON-схемы, а auth token endpoint знаком с form-urlencoded. Теперь запрос должен одновременно передать текстовые поля и бинарный файл.`,` `,(0,b.jsx)(`strong`,{children:`Важно не перепутать:`}),` `,`UploadFile предоставляет поток и метаданные, но не доказывает безопасность содержимого. Content-Type, имя и размер считаются недоверенными входными данными.`]}),(0,b.jsxs)(`div`,{className:`lesson-route`,children:[(0,b.jsxs)(`ol`,{children:[(0,b.jsxs)(`li`,{children:[(0,b.jsx)(`strong`,{children:`Сравнить тела.`}),` `,`понять, когда нужен JSON, application/x-www-form-urlencoded или multipart/form-data.`]}),(0,b.jsxs)(`li`,{children:[(0,b.jsx)(`strong`,{children:`Принять файл.`}),` `,`использовать UploadFile и синхронный file.file внутри обычного def endpoint.`]}),(0,b.jsxs)(`li`,{children:[(0,b.jsx)(`strong`,{children:`Проверить границы.`}),` `,`ограничить размер и тип, сгенерировать серверное имя, не доверять filename.`]}),(0,b.jsxs)(`li`,{children:[(0,b.jsx)(`strong`,{children:`Сохранить согласованно.`}),` `,`разделить файл на диске и метаданные в базе, затем протестировать оба результата.`]})]}),(0,b.jsx)(`p`,{children:`Маршрут занятия проходит от знакомой проблемы к проверяемому изменению сквозного проекта.`})]}),(0,b.jsxs)(o,{children:[(0,b.jsx)(a,{badge:`до`,title:`Состояние проекта`,code:`API принимает JSON и credentials form`,children:`API принимает JSON и credentials form`}),(0,b.jsx)(a,{badge:`+`,badgeTone:`float`,title:`Изменение урока`,code:`multipart и вложение задачи`,children:`multipart и вложение задачи`}),(0,b.jsx)(a,{badge:`после`,badgeTone:`str`,title:`Новый результат`,code:`файл и метаданные сохраняются безопасно`,children:`файл и метаданные сохраняются безопасно`})]}),(0,b.jsxs)(u,{number:`01`,title:`Три формата тела запроса`,children:[(0,b.jsx)(l,{children:`Тело HTTP-запроса имеет Content-Type. FastAPI выбирает способ разбора не по названию endpoint, а по объявленным параметрам и фактическому формату клиента.`}),(0,b.jsxs)(`div`,{className:`lesson-practice-steps`,children:[(0,b.jsx)(`h3`,{children:`application/json`}),(0,b.jsx)(`p`,{children:`удобен для вложенных структур и обычного API CRUD.`}),(0,b.jsx)(`h3`,{children:`application/x-www-form-urlencoded`}),(0,b.jsx)(`p`,{children:`передаёт простые пары полей, как форма логина.`}),(0,b.jsx)(`h3`,{children:`multipart/form-data`}),(0,b.jsx)(`p`,{children:`разделяет тело на части и может переносить текст вместе с бинарным файлом.`})]}),(0,b.jsx)(y,{caption:`один HTTP endpoint — один ожидаемый формат`,code:`POST /tasks
Content-Type: application/json
{"title": "Read SQL", "priority": 4}

POST /auth/token
Content-Type: application/x-www-form-urlencoded
username=nikita&password=secret

POST /tasks/7/attachments
Content-Type: multipart/form-data; boundary=...
title=diagram&file=<binary bytes>`}),(0,b.jsxs)(o,{children:[(0,b.jsx)(a,{badge:`JSON`,title:`Структурированные данные`,code:`{"title": "SQL"}`,children:`Основной формат request schemas и response schemas в REST API.`}),(0,b.jsx)(a,{badge:`Form`,badgeTone:`float`,title:`Простые поля формы`,code:`username=...&password=...`,children:`Подходит для HTML-форм и OAuth2PasswordRequestForm.`}),(0,b.jsx)(a,{badge:`Multipart`,badgeTone:`str`,title:`Поля плюс файл`,code:`description + file`,children:`Каждая часть имеет собственные заголовки и содержимое.`})]}),(0,b.jsx)(i,{tone:`info`,children:`JSON и multipart не объединяются автоматически в одну Pydantic body-модель: формат контракта нужно спроектировать явно.`})]}),(0,b.jsxs)(u,{number:`02`,title:`Form и установка python-multipart`,children:[(0,b.jsx)(l,{children:`Параметр Form сообщает FastAPI, что значение приходит не из JSON. Для разбора form-data и multipart проекту нужна зависимость python-multipart.`}),(0,b.jsxs)(`div`,{className:`lesson-practice-steps`,children:[(0,b.jsx)(`h3`,{children:`Явное объявление`}),(0,b.jsx)(`p`,{children:`Form(...) отличает поле формы от query-параметра.`}),(0,b.jsx)(`h3`,{children:`Annotated`}),(0,b.jsx)(`p`,{children:`метаданные источника остаются рядом с типом.`}),(0,b.jsx)(`h3`,{children:`Зависимость проекта`}),(0,b.jsx)(`p`,{children:`python-multipart фиксируется в requirements или pyproject.`})]}),(0,b.jsx)(y,{caption:`два валидируемых поля формы`,code:`from typing import Annotated

from fastapi import APIRouter, Form

router = APIRouter()


@router.post("/feedback")
def create_feedback(
    topic: Annotated[str, Form(min_length=3, max_length=80)],
    message: Annotated[str, Form(min_length=1, max_length=1000)],
) -> dict[str, str]:
    return {"topic": topic, "message": message}`}),(0,b.jsx)(g,{title:`подготовка multipart`,lines:[{cmd:`python -m pip install python-multipart`},{out:`Successfully installed python-multipart`},{cmd:`curl -X POST http://127.0.0.1:8000/feedback -F "topic=API" -F "message=Works"`},{out:`{"topic":"API","message":"Works"}`}]}),(0,b.jsx)(i,{tone:`info`,children:`Отсутствующая библиотека проявляется при построении маршрута. Это зависимость приложения, а не случайная настройка локального компьютера.`})]}),(0,b.jsxs)(u,{number:`03`,title:`UploadFile вместо bytes для больших файлов`,children:[(0,b.jsx)(l,{children:`Параметр bytes заставляет собрать всё содержимое в памяти. UploadFile предоставляет метаданные и файловый объект, который может быть временно сохранён на диск и читаться порциями.`}),(0,b.jsxs)(`div`,{className:`lesson-practice-steps`,children:[(0,b.jsx)(`h3`,{children:`filename`}),(0,b.jsx)(`p`,{children:`исходное имя клиента полезно только как метаданные для отображения.`}),(0,b.jsx)(`h3`,{children:`content_type`}),(0,b.jsx)(`p`,{children:`заявленный MIME-type помогает первичной проверке, но может быть подделан.`}),(0,b.jsx)(`h3`,{children:`file`}),(0,b.jsx)(`p`,{children:`синхронный file-like объект подходит для обычного def endpoint текущего этапа.`})]}),(0,b.jsx)(y,{caption:`метаданные UploadFile`,code:`from typing import Annotated

from fastapi import File, UploadFile


def inspect_upload(
    upload: Annotated[UploadFile, File(description="Task attachment")],
) -> dict[str, str | None]:
    return {
        "filename": upload.filename,
        "content_type": upload.content_type,
    }`}),(0,b.jsx)(d,{question:`Как принимать файл, который может быть больше нескольких килобайт?`,left:{title:`bytes`,code:`file: bytes`,note:`Всё содержимое собирается в оперативной памяти до вызова endpoint.`},right:{title:`UploadFile`,code:`file: UploadFile`,note:`Доступны поток, filename, content_type и временное хранение.`},preferred:`right`,explanation:`UploadFile даёт более подходящий контракт для потоковой проверки и сохранения.`}),(0,b.jsx)(i,{tone:`info`,children:`На этом этапе endpoint остаётся синхронным: чтение выполняется через upload.file, без введения async/await.`})]}),(0,b.jsxs)(u,{number:`04`,title:`Размер нужно ограничить до сохранения`,children:[(0,b.jsx)(l,{children:`Заявленный Content-Length может отсутствовать или быть неверным. Надёжный учебный контроль читает максимум limit + 1 байт и отклоняет файл, если получено больше лимита.`}),(0,b.jsxs)(`div`,{className:`lesson-practice-steps`,children:[(0,b.jsx)(`h3`,{children:`Лимит`}),(0,b.jsx)(`p`,{children:`задаётся константой или настройкой и отражается в документации.`}),(0,b.jsx)(`h3`,{children:`Проверка`}),(0,b.jsx)(`p`,{children:`читается только ограниченный объём, а не бесконечный поток в память.`}),(0,b.jsx)(`h3`,{children:`Позиция`}),(0,b.jsx)(`p`,{children:`после проверки file.seek(0) возвращает поток к началу перед копированием.`})]}),(0,b.jsx)(y,{caption:`жёсткая граница 2 MiB`,code:`from fastapi import HTTPException, UploadFile, status

MAX_UPLOAD_BYTES = 2 * 1024 * 1024


def validate_size(upload: UploadFile) -> None:
    chunk = upload.file.read(MAX_UPLOAD_BYTES + 1)
    if len(chunk) > MAX_UPLOAD_BYTES:
        raise HTTPException(
            status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
            detail="File is too large",
        )
    upload.file.seek(0)`}),(0,b.jsx)(m,{code:`limit = 4
data = stream.read(limit + 1)
if len(data) > limit:
    result = "reject"
else:
    stream.seek(0)
    result = "save"`,steps:[{line:0,note:`Приложение знает максимально допустимый объём.`,vars:{limit:`4 bytes`}},{line:1,note:`Читаем на один байт больше, чтобы заметить превышение.`,vars:{read:`up to 5 bytes`}},{line:2,note:`Сравниваем фактически прочитанный размер.`,vars:{condition:`len(data) > 4`}},{line:4,note:`Для допустимого файла возвращаем указатель к началу.`,vars:{position:`0`}},{line:5,note:`Только после проверки начинается сохранение.`,vars:{result:`save`}}]}),(0,b.jsx)(i,{tone:`info`,children:`413 сообщает именно о слишком большом теле. Это понятнее, чем общий 400 без причины.`})]}),(0,b.jsxs)(u,{number:`05`,title:`Не доверяем filename и content_type`,children:[(0,b.jsx)(l,{children:`Клиент может прислать имя ../../config.py или указать image/png для произвольных байтов. Сервер генерирует собственное имя и ограничивает разрешённые типы.`}),(0,b.jsxs)(`div`,{className:`lesson-practice-steps`,children:[(0,b.jsx)(`h3`,{children:`Серверное имя`}),(0,b.jsx)(`p`,{children:`UUID или другой идентификатор исключает путь, переданный клиентом.`}),(0,b.jsx)(`h3`,{children:`Расширение`}),(0,b.jsx)(`p`,{children:`выбирается из allowlist по проверенному типу, а не копируется целиком.`}),(0,b.jsx)(`h3`,{children:`Папка`}),(0,b.jsx)(`p`,{children:`итоговый Path должен оставаться внутри заранее определённого upload directory.`})]}),(0,b.jsx)(y,{caption:`сервер выбирает безопасный путь`,code:`from pathlib import Path
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
    return upload_dir / f"{uuid4().hex}{suffix}"`}),(0,b.jsx)(n,{code:`target = UPLOAD_DIR / upload.filename
with target.open("wb") as output:
    shutil.copyfileobj(upload.file, output)`,question:`Почему такой путь нельзя считать безопасным?`,options:[`filename контролирует клиент и может содержать путь`,`Path не умеет записывать bytes`,`UploadFile запрещён в def endpoint`],correctIndex:0,explanation:`Исходное имя нельзя использовать как путь хранения без строгой нормализации и собственной схемы имён.`,fix:`target = build_storage_path(UPLOAD_DIR, upload.content_type)
with target.open("wb") as output:
    shutil.copyfileobj(upload.file, output)`}),(0,b.jsx)(i,{tone:`info`,children:`Allowlist MIME-type — только первый барьер. Для чувствительных файлов в реальном продукте нужна проверка содержимого и антивирусная обработка.`})]}),(0,b.jsxs)(u,{number:`06`,title:`Файл на диске, метаданные в базе`,children:[(0,b.jsx)(l,{children:`База не обязана хранить бинарные байты. Для StudyHub достаточно сохранить файл в контролируемой папке, а в AttachmentModel записать идентификатор владельца, безопасное имя, исходное имя и размер.`}),(0,b.jsxs)(`div`,{className:`lesson-practice-steps`,children:[(0,b.jsx)(`h3`,{children:`Файловая система`}),(0,b.jsx)(`p`,{children:`хранит содержимое по внутреннему storage_name.`}),(0,b.jsx)(`h3`,{children:`SQLite`}),(0,b.jsx)(`p`,{children:`хранит связь task_id, owner_id, original_name, media_type и size.`}),(0,b.jsx)(`h3`,{children:`Компенсация`}),(0,b.jsx)(`p`,{children:`если commit не прошёл, уже записанный файл удаляется, чтобы не остался сиротой.`})]}),(0,b.jsx)(y,{caption:`согласование двух хранилищ`,code:`from pathlib import Path
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
        raise`}),(0,b.jsx)(t,{rows:[[(0,b.jsx)(b.Fragment,{children:`target.open("wb")`}),`создаёт файл только после валидации`],[(0,b.jsx)(b.Fragment,{children:`AttachmentModel(...)`}),`фиксирует метаданные и принадлежность`],[(0,b.jsx)(b.Fragment,{children:`db.commit()`}),`делает запись видимой в базе`],[(0,b.jsx)(b.Fragment,{children:`db.rollback()`}),`восстанавливает Session после ошибки`],[(0,b.jsx)(b.Fragment,{children:`target.unlink(...)`}),`компенсирует уже созданный файл`]]}),(0,b.jsx)(i,{tone:`info`,children:`Файловая система и SQLite не образуют одну настоящую транзакцию. Поэтому код явно описывает компенсацию при частичном сбое.`})]}),(0,b.jsxs)(u,{number:`07`,title:`Endpoint и TestClient-сценарий`,children:[(0,b.jsx)(l,{children:`Маршрут принимает текстовое описание и файл одной multipart-формой, получает current user, проверяет владение задачей и возвращает только безопасные метаданные.`}),(0,b.jsxs)(`div`,{className:`lesson-practice-steps`,children:[(0,b.jsx)(`h3`,{children:`Form`}),(0,b.jsx)(`p`,{children:`description приходит отдельной текстовой частью.`}),(0,b.jsx)(`h3`,{children:`File`}),(0,b.jsx)(`p`,{children:`upload приходит бинарной частью multipart.`}),(0,b.jsx)(`h3`,{children:`Ownership`}),(0,b.jsx)(`p`,{children:`task ищется одновременно по id и current_user.id.`})]}),(0,b.jsx)(y,{caption:`multipart endpoint с ownership`,code:`@router.post(
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
    return attachment_service.create(db, task, upload, description)`}),(0,b.jsx)(g,{title:`проверка загрузки`,lines:[{cmd:`curl -X POST http://127.0.0.1:8000/tasks/7/attachments -H "Authorization: Bearer TOKEN" -F "description=ER diagram" -F "upload=@schema.png;type=image/png"`},{out:`{"id":3,"task_id":7,"original_name":"schema.png","media_type":"image/png"}`}]}),(0,b.jsx)(i,{tone:`info`,children:`Response schema не возвращает абсолютный путь на сервере: это внутренняя деталь хранения.`})]}),(0,b.jsxs)(u,{number:`08`,title:`Контрольная точка: тестируем не только 201`,children:[(0,b.jsx)(l,{children:`Положительный upload — только один сценарий. Готовый маршрут также отклоняет чужую задачу, неподдерживаемый тип, превышение размера и запрос без файла.`}),(0,b.jsxs)(`div`,{className:`lesson-practice-steps`,children:[(0,b.jsx)(`h3`,{children:`Успех`}),(0,b.jsx)(`p`,{children:`метаданные записаны, файл существует, owner и task связаны.`}),(0,b.jsx)(`h3`,{children:`Валидация`}),(0,b.jsx)(`p`,{children:`неподдерживаемый MIME-type и большой размер возвращают согласованные ошибки.`}),(0,b.jsx)(`h3`,{children:`Безопасность`}),(0,b.jsx)(`p`,{children:`второй пользователь не может добавить или прочитать чужое вложение.`})]}),(0,b.jsx)(y,{caption:`multipart в TestClient`,code:`def test_upload_attachment(client, auth_headers, png_bytes) -> None:
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
    assert response.status_code == 413`}),(0,b.jsx)(h,{question:`Почему недостаточно проверить только content_type?`,hint:`Это строка из входящего запроса.`,answer:(0,b.jsx)(`p`,{children:`Клиент сам объявляет Content-Type, поэтому строка может не соответствовать фактическим байтам. Она подходит для первичного allowlist, но не является доказательством безопасного содержимого.`})}),(0,b.jsx)(i,{tone:`info`,children:`В тесте лимит можно уменьшить через settings override, чтобы не создавать многомегабайтный объект.`}),(0,b.jsxs)(`div`,{className:`lesson-check-group`,children:[(0,b.jsx)(f,{question:`Когда нужен multipart/form-data?`,options:[`когда есть текстовые части и файл`,`для любого GET`,`только для JSON`],correctIndex:0,explanation:`Multipart делит тело на несколько частей с собственными метаданными.`}),(0,b.jsx)(f,{question:`Почему UploadFile предпочтительнее bytes для файла?`,options:[`даёт поток и метаданные`,`автоматически удаляет вирусы`,`всегда шифрует содержимое`],correctIndex:0,explanation:`UploadFile не требует сразу держать весь файл как bytes в памяти.`}),(0,b.jsx)(f,{question:`Можно ли использовать upload.filename как путь хранения?`,options:[`нет, имя контролирует клиент`,`да, всегда`,`только без расширения`],correctIndex:0,explanation:`Сервер должен генерировать собственное безопасное имя.`}),(0,b.jsx)(f,{question:`Что сделать после чтения файла для проверки размера?`,options:[`seek(0)`,`commit()`,`base64 encode`],correctIndex:0,explanation:`Перед последующим копированием указатель возвращают к началу.`})]}),(0,b.jsx)(r,{points:[(0,b.jsx)(b.Fragment,{children:`Content-Type определяет формат тела запроса.`}),(0,b.jsx)(b.Fragment,{children:`Form читает поля формы, а multipart переносит поля и бинарные части.`}),(0,b.jsx)(b.Fragment,{children:`Для Form и UploadFile нужен python-multipart.`}),(0,b.jsx)(b.Fragment,{children:`UploadFile предоставляет метаданные и file-like поток.`}),(0,b.jsx)(b.Fragment,{children:`Размер проверяется по фактически прочитанным байтам.`}),(0,b.jsx)(b.Fragment,{children:`Filename и content_type считаются недоверенными.`}),(0,b.jsx)(b.Fragment,{children:`Сервер генерирует storage_name и хранит метаданные отдельно.`}),(0,b.jsx)(b.Fragment,{children:`Файл и запись базы требуют компенсации при частичном сбое.`})]}),(0,b.jsx)(p,{text:`Реализуйте POST /tasks/{task_id}/attachments с Form, UploadFile, лимитом размера, allowlist типов, серверным именем, ownership и TestClient-проверками успеха и отказов.`})]})]})}export{S as Lesson112};