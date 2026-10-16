import{t as e}from"./jsx-runtime-lw2jiZar.js";import{t}from"./braces-B2_rnCwm.js";import{A as n,C as r,D as i,E as a,I as o,L as s,M as c,N as l,O as u,P as d,S as f,T as p,b as m,g as h,h as g,j as _,p as v,v as y,w as b,x,y as S}from"./shared-UmZHo_CQ.js";import{D as C}from"./index-3E7rQLz6.js";import{t as w}from"./CodeEditor-BZlrvoTL.js";var T=e(),E=`Блок 36 · Финальное качество, портфолио и интервью`;function D({module:e}){return(0,T.jsxs)(l,{children:[(0,T.jsx)(c,{variant:`project`,chip:e??E,title:`Единый API error contract и versioning`,intro:`Соберём единую внешнюю границу ошибок StudyHub: один JSON-контракт для validation, auth, permissions, domain conflicts, rate limit и unexpected failures. Затем закрепим request_id, exception handlers, OpenAPI examples и понятный префикс /api/v1.`,tags:[{icon:(0,T.jsx)(t,{size:14}),label:`code · message · details`},{icon:(0,T.jsx)(C,{size:14}),label:`/api/v1 и совместимость`}]}),(0,T.jsxs)(a,{tone:`info`,children:[(0,T.jsx)(`strong`,{children:`Связь с проектом.`}),` `,`LMS-функциональность завершена, но routers пока могут возвращать разные формы ошибок. Финальный клиентский контракт должен быть стабильнее внутренней реализации.`,` `,(0,T.jsx)(`strong`,{children:`Важно не перепутать:`}),` `,`Версия URL не означает поддержку нескольких активных major-веток. В блоке фиксируется одна текущая версия и правило совместимых изменений.`]}),(0,T.jsxs)(d,{number:`01`,title:`Почему случайные ошибки стали проблемой`,children:[(0,T.jsx)(u,{children:`Соберём единую внешнюю границу ошибок StudyHub: один JSON-контракт для validation, auth, permissions, domain conflicts, rate limit и unexpected failures. Затем закрепим request_id, exception handlers, OpenAPI examples и понятный префикс /api/v1.`}),(0,T.jsxs)(`div`,{className:`lesson-route`,children:[(0,T.jsxs)(`ol`,{children:[(0,T.jsxs)(`li`,{children:[(0,T.jsxs)(`strong`,{children:[`Снять инвентаризацию`,`:`]}),` `,`собрать реальные 400/401/403/404/409/422/429/500 и сравнить их тела.`]}),(0,T.jsxs)(`li`,{children:[(0,T.jsxs)(`strong`,{children:[`Назвать схему`,`:`]}),` `,`зафиксировать code, message, details и request_id как обязательную внешнюю форму.`]}),(0,T.jsxs)(`li`,{children:[(0,T.jsxs)(`strong`,{children:[`Свести источники`,`:`]}),` `,`направить validation, domain и unexpected exceptions в отдельные handlers.`]}),(0,T.jsxs)(`li`,{children:[(0,T.jsxs)(`strong`,{children:[`Защитить контракт`,`:`]}),` `,`добавить тесты, OpenAPI examples и префикс /api/v1 без переписывания сервисов.`]})]}),(0,T.jsx)(`p`,{children:`Маршрут заканчивается проверяемым артефактом, а не только чтением теории.`})]}),(0,T.jsxs)(s,{children:[(0,T.jsx)(o,{badge:`code`,title:`Машинный идентификатор`,children:`Стабильная строка вроде course_not_found, по которой клиент выбирает реакцию.`}),(0,T.jsx)(o,{badge:`message`,badgeTone:`float`,title:`Сообщение человеку`,children:`Короткое безопасное объяснение без traceback, SQL и внутренних секретов.`}),(0,T.jsx)(o,{badge:`details`,badgeTone:`str`,title:`Структурированный контекст`,children:`Поля ошибки: field, reason, limit или conflict, если клиент может их использовать.`}),(0,T.jsx)(o,{badge:`request_id`,title:`Связь с логом`,children:`Идентификатор позволяет сопоставить ответ клиента с серверным событием.`})]}),(0,T.jsx)(x,{question:`Какой проверяемый результат должно дать это занятие?`,hint:`Назовите не тему, а конкретный artifact или evidence.`,answer:(0,T.jsx)(`p`,{children:`Результат должен воспроизводиться другим человеком и иметь успешный, ошибочный и диагностический сценарий.`})})]}),(0,T.jsxs)(d,{number:`02`,title:`Главная модель единого error contract`,children:[(0,T.jsx)(u,{children:`Сначала фиксируем небольшую модель, которая помогает принимать решения. Термин ценен только тогда, когда его можно связать с наблюдаемым поведением проекта.`}),(0,T.jsx)(n,{rows:[[(0,T.jsx)(T.Fragment,{children:`RequestValidationError`}),`422 validation_error с нормализованным списком полей`],[(0,T.jsx)(T.Fragment,{children:`DomainError`}),`осознанный status и code из бизнес-правила`],[(0,T.jsx)(T.Fragment,{children:`HTTPException`}),`переходный адаптер для старых routers`],[(0,T.jsx)(T.Fragment,{children:`RateLimitError`}),`429 rate_limit_exceeded и Retry-After`],[(0,T.jsx)(T.Fragment,{children:`Exception`}),`500 internal_error без раскрытия внутренних деталей`]]}),(0,T.jsx)(v,{prompt:`Соедините элемент модели с его практической ролью.`,leftTitle:`Элемент`,rightTitle:`Роль`,pairs:[{left:`RequestValidationError`,right:`422 validation_error с нормализованным списком полей`},{left:`DomainError`,right:`осознанный status и code из бизнес-правила`},{left:`HTTPException`,right:`переходный адаптер для старых routers`},{left:`RateLimitError`,right:`429 rate_limit_exceeded и Retry-After`}],explanation:`Пары закрепляют не термин отдельно, а его место в рабочем процессе StudyHub.`}),(0,T.jsx)(f,{statement:(0,T.jsx)(T.Fragment,{children:`Клиенту достаточно HTTP status, поэтому стабильный error code и request_id не нужны.`}),isTrue:!1,explanation:`Status задаёт класс результата, но не различает десятки предметных причин. code нужен программе клиента, request_id — диагностике.`}),(0,T.jsx)(a,{tone:`info`,children:`Модель должна сокращать область поиска решения. Если после схемы всё равно непонятно, что запускать и проверять, схема слишком абстрактна.`})]}),(0,T.jsxs)(d,{number:`03`,title:`Минимальная схема и domain exception`,children:[(0,T.jsx)(u,{children:`Разбираем минимальный рабочий фрагмент до интеграции. Сначала читаем контракт, затем прослеживаем значения и только после этого меняем одну деталь.`}),(0,T.jsx)(w,{caption:`минимальная схема и domain exception`,code:`from typing import Any

from pydantic import BaseModel, Field


class ApiError(BaseModel):
    code: str = Field(examples=["course_not_found"])
    message: str
    details: dict[str, Any] | list[dict[str, Any]] | None = None
    request_id: str


class DomainError(Exception):
    def __init__(
        self,
        *,
        status_code: int,
        code: str,
        message: str,
        details: dict[str, Any] | None = None,
    ) -> None:
        super().__init__(message)
        self.status_code = status_code
        self.code = code
        self.message = message
        self.details = details`}),(0,T.jsx)(y,{code:`from typing import Any

from pydantic import BaseModel, Field


class ApiError(BaseModel):
    code: str = Field(examples=["course_not_found"])
    message: str
    details: dict[str, Any] | list[dict[str, Any]] | None = None
    request_id: str


class DomainError(Exception):
    def __init__(
        self,
        *,
        status_code: int,
        code: str,
        message: str,
        details: dict[str, Any] | None = None,
    ) -> None:
        super().__init__(message)
        self.status_code = status_code
        self.code = code
        self.message = message
        self.details = details`,steps:[{line:5,note:`ApiError описывает только данные HTTP-ответа и не зависит от конкретного router.`,vars:{граница:`response schema`}},{line:12,note:`DomainError переносит предметный смысл из service к общему handler.`,vars:{источник:`service`}},{line:20,note:`Status и machine-readable code задаются явно в месте обнаружения правила.`,vars:{code:`course_not_found`}},{line:23,note:`details остаётся структурой, а не строкой со случайным форматом.`,vars:{details:`{course_id: 42}`}}]}),(0,T.jsx)(h,{prompt:`Дополните поле, связывающее HTTP-ошибку с серверным логом.`,before:`    `,after:`: str`,options:[`request_id`,`traceback`,`password`],answer:`request_id`,explanation:`Внешний request_id безопасно возвращается клиенту и помогает найти соответствующее событие в логах.`}),(0,T.jsx)(a,{tone:`info`,children:`После заполнения измените одно входное значение, предскажите результат и только затем запускайте проверку.`})]}),(0,T.jsxs)(d,{number:`04`,title:`Случайные формы против единого контракта`,children:[(0,T.jsx)(u,{children:`Сравнение нужно не для выбора «красивого» кода, а для явного обсуждения контракта, риска и стоимости следующего изменения.`}),(0,T.jsx)(p,{question:`Какой response contract проще использовать frontend-клиенту и тестам?`,left:{title:`Случайные формы`,code:`{"detail": "Not found"}
{"error": "duplicate slug"}
{"message": ["invalid field"]}`,note:`Клиент вынужден угадывать форму по endpoint и status.`},right:{title:`Единая схема`,code:`{
  "code": "course_slug_conflict",
  "message": "Slug is already used",
  "details": {"field": "slug"},
  "request_id": "req-8b1"
}`,note:`Форма постоянна, а предметная причина находится в code.`},preferred:`right`,explanation:`Единая структура уменьшает ветвление клиента и делает отрицательные тесты одинаковыми для всех routers.`}),(0,T.jsxs)(`div`,{className:`lesson-practice-steps`,children:[(0,T.jsx)(`h3`,{children:`Сначала назовите критерий`}),(0,T.jsx)(`p`,{children:`До выбора варианта сформулируйте, какое свойство проекта нужно сохранить: совместимость, безопасность, воспроизводимость или понятность.`}),(0,T.jsx)(`h3`,{children:`Затем найдите evidence`}),(0,T.jsx)(`p`,{children:`Подтвердите решение тестом, логом, планом запроса, clean start или повторяемым demo-сценарием.`}),(0,T.jsx)(`h3`,{children:`После этого зафиксируйте границу`}),(0,T.jsx)(`p`,{children:`Укажите, при каком изменении требований выбранный вариант перестанет быть достаточным.`})]}),(0,T.jsx)(x,{question:`Почему более сложный вариант не считается автоматически более профессиональным?`,answer:(0,T.jsx)(`p`,{children:`Профессиональность определяется соответствием риску и требованиям. Лишний механизм увеличивает стоимость поддержки без доказанной пользы.`})})]}),(0,T.jsxs)(d,{number:`05`,title:`Unexpected 500 не раскрывает внутренности`,children:[(0,T.jsx)(u,{children:`Финальное качество проявляется в работе со сбоями. Намеренно запускаем дефектный сценарий, объясняем причину и проверяем исправление отдельным evidence.`}),(0,T.jsx)(r,{code:`@app.exception_handler(Exception)
async def unexpected_handler(request, exc):
    return JSONResponse(
        status_code=500,
        content={
            "code": "internal_error",
            "message": str(exc),
            "request_id": request.state.request_id,
        },
    )`,question:`Какой риск остаётся в unexpected handler?`,options:[`В message раскрываются внутренние детали исключения`,`JSONResponse нельзя использовать в FastAPI`,`Status 500 должен быть 404`],correctIndex:0,explanation:`Текст неожиданного исключения может содержать SQL, путь, hostname или другое внутреннее состояние.`,fix:`@app.exception_handler(Exception)
async def unexpected_handler(request, exc):
    logger.exception(
        "unexpected request failure",
        extra={"request_id": request.state.request_id},
    )
    return JSONResponse(
        status_code=500,
        content={
            "code": "internal_error",
            "message": "Unexpected server error",
            "details": None,
            "request_id": request.state.request_id,
        },
    )`}),(0,T.jsxs)(`div`,{className:`lesson-practice-steps`,children:[(0,T.jsx)(`h3`,{children:`1. Воспроизведите`}),(0,T.jsx)(`p`,{children:`Сведите проблему к короткому сценарию и сохраните точный вход, команду и наблюдаемый результат.`}),(0,T.jsx)(`h3`,{children:`2. Найдите нарушенное ожидание`}),(0,T.jsx)(`p`,{children:`Не маскируйте симптом. Назовите контракт, который код нарушает, и слой, отвечающий за исправление.`}),(0,T.jsx)(`h3`,{children:`3. Защитите результат`}),(0,T.jsx)(`p`,{children:`Добавьте тест, проверку, runbook или diagnostic evidence, чтобы дефект не вернулся незаметно.`})]})]}),(0,T.jsxs)(d,{number:`06`,title:`Встраиваем handlers и /api/v1`,children:[(0,T.jsx)(u,{children:`Теперь переносим минимальную модель в StudyHub. Endpoint или infrastructure step остаётся координатором, а правило и диагностическая граница получают отдельное место.`}),(0,T.jsx)(w,{caption:`общий handler и versioned router`,code:`from fastapi import APIRouter, FastAPI, Request
from fastapi.responses import JSONResponse

api_v1 = APIRouter(prefix="/api/v1")


@app.exception_handler(DomainError)
async def domain_error_handler(
    request: Request,
    exc: DomainError,
) -> JSONResponse:
    body = ApiError(
        code=exc.code,
        message=exc.message,
        details=exc.details,
        request_id=request.state.request_id,
    )
    return JSONResponse(
        status_code=exc.status_code,
        content=body.model_dump(),
    )


app.include_router(api_v1)`}),(0,T.jsx)(g,{code:`if error_source == "validation":
    response = validation_handler(error)
elif error_source == "domain":
    response = domain_handler(error)
elif error_source == "rate_limit":
    response = rate_limit_handler(error)
else:
    response = unexpected_handler(error)`,scenarios:[{label:`invalid body`,activeLine:1,output:`422 validation_error`},{label:`duplicate enrollment`,activeLine:3,output:`409 enrollment_conflict`},{label:`too many requests`,activeLine:5,output:`429 rate_limit_exceeded`},{label:`unknown defect`,activeLine:7,output:`500 internal_error`}]}),(0,T.jsxs)(s,{children:[(0,T.jsx)(o,{badge:`01`,title:`Version prefix`,children:`Все публичные LMS routers подключаются через один APIRouter(prefix="/api/v1").`}),(0,T.jsx)(o,{badge:`02`,badgeTone:`float`,title:`Compatibility`,children:`Добавление необязательного response-поля совместимо; переименование или удаление требует новой major-границы.`}),(0,T.jsx)(o,{badge:`03`,badgeTone:`str`,title:`OpenAPI`,children:`Для каждого status приводится пример ApiError, а успешные schemas не смешиваются с error schema.`})]}),(0,T.jsx)(a,{tone:`info`,children:`Интеграция считается завершённой только после проверки happy path, запрета или сбоя и возможности объяснить путь данных без чтения всего проекта.`})]}),(0,T.jsxs)(d,{number:`07`,title:`Проверяем контракт и фиксируем порядок`,children:[(0,T.jsx)(u,{children:`Финальный шаг урока превращает знание в воспроизводимую процедуру. Команды, ожидаемые результаты и порядок действий сохраняются в репозитории.`}),(0,T.jsx)(S,{title:`проверяем результат`,lines:[{cmd:`pytest tests/api/test_error_contract.py -q`},{out:`18 passed in 1.42s`},{cmd:`curl -i http://localhost:8000/api/v1/courses/999`},{out:`HTTP/1.1 404 Not Found
X-Request-ID: req-8b1
{"code":"course_not_found","message":"Course not found","details":{"course_id":999},"request_id":"req-8b1"}`},{cmd:`curl -i http://localhost:8000/courses/999`},{out:`HTTP/1.1 404 Not Found
{"code":"route_not_found", ...}`}]}),(0,T.jsx)(b,{title:`Соберите рабочий порядок`,prompt:`Расположите шаги так, чтобы результат оставался проверяемым и обратимым.`,pieces:[{id:`inventory`,code:`собрать текущие error responses`},{id:`schema`,code:`утвердить ApiError`},{id:`handlers`,code:`подключить handlers по источникам`},{id:`version`,code:`перенести routers под /api/v1`},{id:`tests`,code:`зафиксировать statuses и bodies тестами`},{id:`docs`,code:`обновить OpenAPI examples`}],correctOrder:[`inventory`,`schema`,`handlers`,`version`,`tests`,`docs`],explanation:`Сначала фиксируется реальное расхождение, затем единая форма, и только после этого меняются маршруты и документация.`}),(0,T.jsxs)(`div`,{className:`lesson-practice-steps`,children:[(0,T.jsx)(`h3`,{children:`Коммит 1 — наблюдение`}),(0,T.jsx)(`p`,{children:`Зафиксируйте baseline, failing scenario или исходный документ до изменения.`}),(0,T.jsx)(`h3`,{children:`Коммит 2 — минимальное исправление`}),(0,T.jsx)(`p`,{children:`Измените только ответственную границу и сохраните маленький читаемый diff.`}),(0,T.jsx)(`h3`,{children:`Коммит 3 — evidence`}),(0,T.jsx)(`p`,{children:`Добавьте тест, документацию, diagram или runbook, который доказывает результат.`})]}),(0,T.jsx)(x,{question:`Что должно позволить другому разработчику повторить результат?`,answer:(0,T.jsx)(`p`,{children:`Точная последовательность команд, входные условия, ожидаемый вывод и путь диагностики отклонения.`})})]}),(0,T.jsxs)(d,{number:`08`,title:`Контрольная точка и самостоятельная практика`,children:[(0,T.jsx)(u,{children:`Ответьте на вопросы без запуска, затем проверьте себя. После контроля выполните проектную практику и объясните результат словами, не читая готовый текст.`}),(0,T.jsxs)(`div`,{className:`lesson-check-group`,children:[(0,T.jsx)(m,{question:`Какое поле должно оставаться стабильным для программной реакции клиента?`,options:[`message`,`code`,`traceback`],correctIndex:1,explanation:`Message можно уточнять, а machine-readable code является частью внешнего контракта.`}),(0,T.jsx)(m,{question:`Что безопасно возвращать при unexpected 500?`,options:[`Полный repr исключения`,`Общее сообщение и request_id`,`SQL statement`],correctIndex:1,explanation:`Внутренняя причина пишется в защищённый лог, клиент получает безопасную форму.`}),(0,T.jsx)(m,{question:`Какое изменение обычно совместимо внутри /api/v1?`,options:[`Удалить обязательное поле`,`Переименовать endpoint`,`Добавить необязательное поле`],correctIndex:2,explanation:`Клиент старой версии может проигнорировать новое необязательное поле.`}),(0,T.jsx)(m,{question:`Где нормализовать RequestValidationError?`,options:[`В каждом endpoint`,`В общем exception handler`,`В README`],correctIndex:1,explanation:`Общий handler устраняет повторение и гарантирует одну форму 422.`})]}),(0,T.jsx)(i,{points:[(0,T.jsx)(T.Fragment,{children:`HTTP status задаёт класс результата, а code — конкретную машинную причину.`}),(0,T.jsx)(T.Fragment,{children:`ApiError имеет одинаковые поля для validation, auth, domain, rate limit и unexpected failures.`}),(0,T.jsx)(T.Fragment,{children:`Request ID связывает внешний ответ с серверным логом и не раскрывает внутренние данные.`}),(0,T.jsx)(T.Fragment,{children:`Unexpected exception логируется с traceback, но клиент получает безопасное сообщение.`}),(0,T.jsx)(T.Fragment,{children:`Префикс /api/v1 фиксирует внешнюю границу, а не создаёт несколько параллельных реализаций.`}),(0,T.jsx)(T.Fragment,{children:`Совместимость проверяется тестами и OpenAPI examples, а не обещанием автора.`})]}),(0,T.jsx)(_,{text:`Проведите инвентаризацию всех error responses StudyHub, реализуйте ApiError и handlers для 422, DomainError, 429 и 500, подключите /api/v1, добавьте минимум восемь contract tests и приложите before/after таблицу.`})]})]})}export{D as Lesson207};