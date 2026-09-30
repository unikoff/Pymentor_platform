"""Учебная практика блока. Редактируйте задания здесь."""

from __future__ import annotations

from typing import Any


MANUAL_PRACTICE: dict[int, list[dict[str, Any]]] = {
    63: [{'title': 'Соберите API и затем перенесите endpoints в APIRouter',
        'task': 'Сначала пройдите отдельную контрольную точку проекта: упражнения 59-62 проверяли Python-логику в '
                'интерпретаторе и сами не добавляли маршруты в studyhub-api. Соберите и проверьте полный CRUD в '
                'приложении. Только после этого выполните отдельный шаг рефакторинга: перенесите работающие endpoints '
                'из main.py в APIRouter без изменения внешнего поведения.',
        'tasks': [
            {'title': 'Контрольная точка: соберите CRUD в приложении',
             'task': 'Продолжайте studyhub-api из предыдущих проектных занятий. Сначала перенесите проверенные правила '
                     'из упражнений в настоящий FastAPI-проект; пока оставьте все маршруты в app/main.py. Не переходите '
                     'к APIRouter, пока проверки этого пункта не проходят.',
             'requirements': [
                 'Сохраните GET /health, GET /tasks, GET /stats и список в памяти, созданные раньше.',
                  'Проверьте app/schemas.py: TaskCreate, TaskUpdate и TaskRead уже определены в практике 58. Добавьте туда TaskPatch по контракту занятия 61, если ещё не перенесли схему из теории: необязательные title, priority и is_done; title и priority сохраняют ограничения 57. Затем импортируйте все четыре схемы в main.py, не создавая дубликаты.',
                 'Импортируйте Query из fastapi для строгой проверки параметра limit.',
                 'Используйте одну форму задачи: id, title, priority, is_done. Не добавляйте description.',
                 'Добавьте GET /tasks/{task_id} с response_model=TaskRead: используйте правило поиска из 54; целочисленный, но отсутствующий id даёт 404, а нецелый path id — 422.',
                 'Создайте общий HTTP-helper get_task_or_404 поверх поиска по id и используйте его в GET item, PUT, PATCH и DELETE. Не дублируйте четыре немного разные проверки отсутствующего id.',
                  'Расширьте GET /tasks параметрами из 55: is_done: bool | None = None, sort_desc: bool = False и limit: int = Query(default=10, ge=1, le=50). Сначала фильтруйте, затем копируйте и сортируйте по id (sort_desc=False по возрастанию, True по убыванию), после чего применяйте уже проверенный limit. Не нормализуйте неверное значение: HTTP-слой должен вернуть 422 для limit вне диапазона. Исходный storage не меняйте. GET /stats продолжает считать весь storage, а не отфильтрованный ответ.',
                  'У GET /tasks задайте response_model=list[TaskRead].',
                  'Добавьте POST /tasks: TaskCreate принимает обязательные title и priority. Очищайте title через strip() по правилу из 59; если после очистки строка пуста, верните 422 и не меняйте storage. Для новой записи выберите id как max существующих id + 1, а для пустого storage используйте 1. Только после успешного добавления назначьте is_done=False, верните полную TaskRead через response_model=TaskRead и статус 201.',
                  'Добавьте PUT с полным набором изменяемых полей через TaskUpdate и PATCH только с переданными полями через TaskPatch. Для PATCH используйте model_dump(exclude_unset=True, exclude_none=True), чтобы не затирать отсутствующие поля; пустой PATCH оставляет запись без изменений. Оба маршрута сохраняют id, объявляют response_model=TaskRead и возвращают полную TaskRead. Если переданный title после strip() пуст, ответьте 422 до изменения задачи.',
                 'Добавьте DELETE: успешное удаление возвращает 204 без body; отсутствующий id возвращает 404.',
                 'Проверьте через Swagger UI или Postman последовательность create → list → get → PUT → PATCH → DELETE, а также GET /tasks/999 (404), GET /tasks/not-an-int (422), пустой после strip() title, неизменность storage после 422 и limit=1, limit=50, limit=0 и limit=51. Границы 1 и 50 проходят; 0 и 51 дают 422, не меняя storage. Для Planner API создайте отдельные requests: замены base_url в Echo collection недостаточно. Синхронизируйте docs/planner-api-v1.md с query-контрактом и GET /stats, а в Implementation status укажите, что реально работает. Запишите фактические status и body.'
             ],
             'hint': 'Проверьте границы ответственности по шагам: входная схема проверяет body; storage и CRUD меняют состояние и ищут id; FastAPI связывает результат с HTTP-кодом и response schema. Правила 54 и 55 относятся к разным маршрутам: item выбирается по path /tasks/{task_id}; целое отсутствующее значение даёт 404, а нецелый path id не проходит проверку FastAPI и даёт 422. Коллекция настраивается query-параметрами /tasks: фильтр по is_done, направление сортировки по id и ограничение limit, а не поиск текста по title.',
             'answer': {
                 'explanation': 'Здесь лабораторные функции впервые становятся поведением сервера. Контрольная точка нужна до APIRouter: переносить можно только существующие, проверенные endpoints. 201 теперь соответствует факту создания, а TaskRead получает все четыре поля.',
                 'steps': [
                     'Сначала оставьте текущие маршруты и источник данных на месте.',
                     'Сверьте схемы в app/schemas.py. Если TaskPatch ещё нет, добавьте необязательные title, priority и is_done из теории 61; title и priority должны сохранять ограничения 57. Затем импортируйте модели в main.py.',
                     'Перенесите поиск по id в item route, а filter-sort-limit из упражнения 55 — в collection route. Для item route задайте response_model=TaskRead; для списка — response_model=list[TaskRead]. Проверьте различие: /tasks/999 даёт 404, /tasks/not-an-int даёт 422. Для limit используйте Query(default=10, ge=1, le=50): вне диапазона ответ 422, а функция получает только допустимое число.',
                     'Обновите docs/planner-api-v1.md: добавьте GET /stats и query sort_desc; зафиксируйте is_done по умолчанию None, sort_desc по умолчанию False, limit по умолчанию 10 и диапазон 1-50. В Implementation status отличите проверенную реализацию от оставшихся планов.',
                     'Создавайте полную запись до формирования ответа TaskRead и только после этого возвращайте 201.',
                     'Проверьте весь CRUD вручную через Swagger UI или Postman, включая 404, 422, 204 без body и query-границы.',
                     'Только после успешной проверки переходите к следующей карточке и выделяйте router.'
                 ],
                 'checks': [
                      'Проект содержит все шесть маршрутов ресурса tasks, а также GET /health и GET /stats; каждый отвечает ожидаемым status.',
                 'Созданная задача видна в GET /tasks и GET /tasks/{task_id}, имеет server id и все четыре поля.',
                 'GET item, POST после создания, PUT и PATCH возвращают TaskRead; GET collection возвращает list[TaskRead].',
                 'Числовой отсутствующий path id даёт 404, а нецелый path id даёт 422.',
                      'POST возвращает TaskRead только после того, как storage получил полную запись.',
                 'PUT и PATCH имеют разные входные контракты и сохраняют id.',
                 'Один get_task_or_404 задаёт одинаковый 404 для отсутствующей задачи во всех item-маршрутах.',
                     '204 не содержит JSON body; отсутствующая задача даёт 404.',
                      'Фильтр, сортировка и limit применяются к ответной копии/выборке, не переставляя исходный storage; GET /stats считает полное состояние.',
                      'Title нормализуется, а значение из одних пробелов получает 422 без частичного изменения storage.'
                 ]
             }},
            {'title': 'После контрольной точки: вынесите маршруты в APIRouter',
             'task': 'Теперь CRUD уже работает в app/main.py. Перенесите те же endpoints в отдельный router, не переписывая их поведение и не меняя HTTP-контракт.',
             'requirements': [
                 'Создайте app/routers/tasks.py и объявите router = APIRouter(prefix="/tasks", tags=["tasks"]).',
                 'Перенесите list, get, create, put, patch и delete endpoints, убрав повторяющуюся часть /tasks из decorators. Для GET и POST коллекции используйте локальный путь "", чтобы сохранить точный публичный URL /tasks; для item оставьте "/{task_id}".',
                 'В app/main.py импортируйте router и подключите app.include_router(router).',
                 'Запустите API и повторите проверки из предыдущей карточки: все URL, status и response body должны остаться прежними; GET /tasks и POST /tasks не должны требовать redirect на адрес с завершающим слешем.',
                 'Откройте /docs и убедитесь, что endpoints сгруппированы тегом tasks.',
                 'Временно удалите include_router, предскажите результат GET /tasks и подтвердите 404; затем верните подключение.',
                 'Создайте коммит refactor: extract tasks router.'
             ],
             'hint': 'В router используются локальные пути: prefix="/tasks" плюс пустой путь "" сохраняет collection URL /tasks, а "/{task_id}" образует публичный item path /tasks/{task_id}. Не меняйте сигнатуры и вызовы CRUD при переносе.',
             'answer': {
                 'explanation': 'APIRouter группирует готовые path operations, но не создаёт storage и не реализует CRUD. Поэтому сначала мы подтвердили продуктовый контракт, а теперь меняем только расположение HTTP-слоя.',
                 'steps': [
                     'Перенесите декораторы и функции по одному, сохраняя response_model и status_code.',
                     'Уберите из локальных путей router общий префикс /tasks.',
                     'Подключите router через include_router и проверьте /docs.',
                     'Повторите контрольные HTTP-запросы, сравнивая их с результатами первой карточки.'
                 ],
                 'checks': [
                     'Публичные method и URL не изменились.',
                     'Collection routes остаются точными /tasks без завершающего slash redirect.',
                     'Все response schemas и status codes сохранены.',
                     'main.py подключает router, а routers/tasks.py не импортирует app из main.py.',
                     'Без include_router маршрут недоступен; после возврата подключения все проверки проходят.'
                 ]
             }}
        ],
        'result': 'Готово, если сначала в project code собран и вручную проверен полный CRUD по правилам 54-62, а затем тот же API перенесён в APIRouter без изменения URLs, схем, статусов и поведения.'}],
    64: [{'title': 'Закрепите контракт через TestClient',
       'task': 'Создайте автоматические тесты ключевых HTTP-сценариев. Тесты должны проверять status и body, а не '
               'только факт отсутствия исключения.',
       'steps': ['Создайте tests/test_tasks.py и client = TestClient(app).',
                 'Добавьте тест GET /health: status 200 и body {"status": "ok"}.',
                 'Добавьте тест пустого GET /tasks или заранее известного начального списка; состояние должно быть '
                 'предсказуемым.',
                 'Добавьте тест POST /tasks: status 201, id существует, title/priority совпадают, is_done=False.',
                 'Добавьте тест GET отсутствующего id: status 404 и точный detail.',
                 'Добавьте тест невалидного POST: status 422 и storage не изменился.',
                 'Настройте очистку in-memory storage перед каждым тестом через fixture или явную reset-функцию.',
                 'Запустите pytest -q два раза подряд и создайте коммит test: cover Planner API contract.'],
       'result': 'Готово, если оба последовательных запуска pytest зелёные, тесты не зависят от порядка, а минимум '
                 'пять сценариев проверяют status и JSON body.'}],
    65: [{'title': 'Утвердите контракт финального Planner API',
       'task': 'Перед финальной сборкой зафиксируйте внешний HTTP-контракт и внутреннее направление зависимостей. '
               'Новые endpoints после утверждения не добавляются.',
       'steps': ['Создайте docs/final-api-contract.md с таблицей method, path, request schema, success status, '
                 'response schema, error statuses.',
                 'Добавьте строки для GET /health, GET /stats и шести обязательных task-endpoints ресурса tasks.',
                 'Для PUT отдельно запишите полную замену, для PATCH — частичное изменение, для DELETE — 204 без '
                 'body.',
                 'Нарисуйте направление app/main.py → routers → crud → storage и schemas → routers.',
                 'Для каждого слоя запишите одну ответственность и один тип изменения, который должен происходить '
                 'именно там.',
                 'Перечислите ограничения этапа: in-memory storage, данные исчезают после restart, нет SQLAlchemy и '
                 'auth.',
                 'Сверьте документ с текущим /openapi.json и исправьте расхождения до реализации следующих занятий.',
                 'Создайте коммит docs: approve Planner API contract.'],
       'result': 'Готово, если все endpoints, statuses и schemas названы точно, PUT/PATCH не смешаны, направление '
                 'зависимостей не образует цикл, а документ совпадает с OpenAPI.'}],
    66: [{'title': 'Разделите schemas, storage, crud и routers',
       'task': 'Перестройте Planner API по утверждённым ролям без изменения HTTP-контракта. После каждого переноса '
               'запускайте tests.',
       'steps': ['Создайте app/schemas/task.py, app/storage/memory.py, app/crud/tasks.py, app/routers/tasks.py и '
                 'нужные __init__.py.',
                 'Перенесите Pydantic-модели только в schemas/task.py.',
                 'Перенесите список данных и функцию генерации id только в storage/memory.py.',
                 'Перенесите create/list/get/replace/update/delete как обычные Python-функции в crud/tasks.py.',
                 'Оставьте в routers/tasks.py HTTP-параметры, response_model, status_code и преобразование '
                 'HTTPException.',
                 'Оставьте в main.py создание app и include_router.',
                 'После каждого переноса запускайте pytest -q и один ручной request через Swagger.',
                 'Проверьте, что crud не импортирует FastAPI и storage не импортирует routers; создайте коммит '
                 'refactor: split Planner API layers.'],
       'result': 'Готово, если HTTP-тесты проходят без изменений, каждый файл имеет одну объяснимую роль, crud '
                 'остаётся обычным Python-кодом, а imports идут в одном направлении.'}],
    68: [{'title': 'Выпустите Planner API v1.0.0',
       'task': 'Проведите финальную приёмку третьего курса и подготовьте воспроизводимый GitHub Release. Новые '
               'возможности на этом занятии не добавляются.',
       'steps': ['Создайте чистое виртуальное окружение, установите зависимости по README и запустите API указанной '
                 'командой.',
                 'Импортируйте Postman collection и выполните CRUD-цепочку: create → list → get → PUT → PATCH → '
                 'DELETE → повторный get с 404.',
                 'Запустите pytest -q два раза подряд и сохраните итог в docs/release-check.md.',
                 'Проверьте /docs, /openapi.json, status codes, response schemas и отсутствие body у успешного '
                 'DELETE.',
                 'Обновите README: назначение, установка, запуск, структура, endpoints, tests, ограничения in-memory '
                 'storage.',
                 'Добавьте .env.example только если проект реально использует environment variables; не добавляйте '
                 'выдуманные secrets.',
                 'Проверьте git status, создайте финальный коммит release: Planner API 1.0.0 и tag v1.0.0.',
                 'Создайте GitHub Release из tag, приложите Postman collection и краткий demo-сценарий.',
                 'Попросите другого человека или наставника повторить запуск только по README и зафиксируйте '
                 'найденные расхождения.'],
       'result': 'Готово, если чистая установка воспроизводится, CRUD-цепочка и tests проходят, README совпадает с '
                 'проектом, GitHub Release v1.0.0 существует, а ограничения хранения в памяти указаны явно.'}],
}
