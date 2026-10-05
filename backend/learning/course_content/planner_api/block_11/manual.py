"""Учебная практика блока. Редактируйте задания здесь."""

from __future__ import annotations

from typing import Any


MANUAL_PRACTICE: dict[int, list[dict[str, Any]]] = {
    57: [
        {
            'title': 'Уточним вход настоящего POST /tasks',
            'task': (
                'В настоящем POST /tasks нормализуется title и проверяются границы входа. '
                'Ошибка body останавливается до PlannerService, а допустимое значение проходит прежний путь. '
                'Очищенное название сохраняется обычным путём Planner.'
            ),
            'tasks': [
                {
                    'title': 'Title нормализуется до проверки ограничений',
                    'task': (
                        'Существующая TaskCreate убирает пробелы по краям title до '
                        'проверки длины. Итоговое название имеет от 1 до 120 символов, а priority — '
                        'от 1 до 5.'
                    ),
                    'requirements': [
                        'Оба поля остаются обязательными, а id и is_done не добавляются во вход.',
                        'Нестроковое значение title отклоняет Pydantic без AttributeError.',
                        'Не меняйте endpoint, PlannerService, Task и сохранение JSON.'
                    ],
                    'hint': 'Посмотрим, как before-validator передаёт очищенную строку обычным ограничениям поля.',
                    'answer': {
                        'explanation': (
                            'Field задаёт проверяемые границы, но не обрезает строку. Before-validator выполняет '
                            'нормализацию до этих ограничений. Для значения нестрокового типа он ничего не вызывает '
                            'напрямую, поэтому ошибку типа формирует Pydantic.'
                        ),
                        'steps': [
                            'Импортируем Field и field_validator из pydantic.',
                            'Задаём title границы min_length=1 и max_length=120, priority — ge=1 и le=5.',
                            'Добавляем валидатор title в режиме before и очищаем значение только тогда, когда оно является строкой.'
                        ],
                        'code': '''from pydantic import BaseModel, Field, field_validator


class TaskCreate(BaseModel):
    title: str = Field(min_length=1, max_length=120)
    priority: int = Field(ge=1, le=5)

    @field_validator("title", mode="before")
    @classmethod
    def strip_title(cls, value: object) -> object:
        if isinstance(value, str):
            return value.strip()
        return value''',
                        'checks': [
                            'title из пробелов превращается в пустую строку и не проходит min_length.',
                            'Строка после очистки проверяется по длине от 1 до 120.',
                            'priority и title остаются обязательными полями входа.'
                        ]
                    }
                },
                {
                    'title': 'Границы и причины 422',
                    'task': (
                        'Запросы через /docs или сохранённую Planner collection показывают ошибки и допустимые '
                        'края для title и priority. Каждый отказ содержит проверяемое поле и правило, без фиксации '
                        'дословного английского текста ответа.'
                    ),
                    'requirements': [
                        'Пустой и пробельный title, title длиной 121 символ после очистки, отсутствующие поля, нестроковый title, priority 0 и 6 дают 422.',
                        'Title длиной 1 и 120 символов, priority 1 и 5 допустимы; длинный сырой title принимается, если после очистки укладывается в лимит.',
                        'Ошибочный вход получает 422, а ответ указывает на неверное поле; точная формулировка msg не является стабильным критерием.'
                    ],
                    'hint': 'От успешного body меняется одно значение; длина title до и после очистки объясняет результат.',
                    'answer': {
                        'explanation': (
                            'Проверки разделяют нормализацию и ограничения. Например, строка из 122 пробелов и букв может '
                            'иметь допустимую длину после удаления пробелов по краям. И наоборот, строка из одних пробелов '
                            'после очистки пуста. Для диагностики важны статус и путь loc к полю; формулировка msg может '
                            'меняться между версиями библиотеки.'
                        ),
                        'steps': [
                            'Берём за основу body с обычными title и priority=3.',
                            'Отдельно проверяем пустое, пробельное, слишком короткое и слишком длинное название, а затем неподходящий тип.',
                            'Проверяем priority на обеих границах и за ними.',
                            'В успешных сценариях используем длину title ровно 1 и 120, а также значение с краевыми пробелами, которое после очистки допустимо.',
                            'Для каждого отказа сверяем 422 и loc; отсутствие задачи проверим следующим заданием.'
                        ],
                        'code': '''"x" * 1 и "x" * 120       -> допустимые границы title
"  API  "                 -> title становится "API"
"   " и "x" * 121        -> 422, ошибка title
priority=1 и priority=5  -> допустимые границы
priority=0 и priority=6  -> 422, ошибка priority

# Для каждого отказа loc указывает на body и проблемное поле.
# Полный текст msg не фиксируем: он зависит от версии Pydantic.''',
                        'checks': [
                            'Нормализация происходит до min_length и max_length.',
                            'Поле priority принимает границы 1 и 5 включительно.',
                            'Проверка не требует совпадения полного текста сообщения Pydantic.'
                        ]
                    }
                },
                {
                    'title': 'Проверка состояния Planner после отказа',
                    'task': (
                        'Список задач и stats фиксируются до ошибочных запросов и сверяются '
                        'с исходным состоянием после каждого отказа. Допустимое название с краевыми '
                        'пробелами сохраняется и читается через API и CLI.'
                    ),
                    'requirements': [
                        'Некорректные запросы не добавляют Task и не меняют рабочий JSON.',
                        'Успешный POST возвращает 201 и очищенный title; ответный id читается через GET /tasks/{task_id}.',
                        'Созданная задача видна CLI и остаётся после перезапуска API.'
                    ],
                    'hint': 'Одного числа элементов недостаточно: список, stats и файл сравниваются с исходным состоянием. Успех подтверждает чтение по id.',
                    'answer': {
                        'explanation': (
                            'FastAPI завершает проверку body до вызова обработчика. Поэтому при ошибке TaskCreate сервис '
                            'не запускается и его путь сохранения не затрагивается. Успешный запрос проходит через тот же '
                            'add_task и JsonStorage, что уже использовались в предыдущем занятии.'
                        ),
                        'steps': [
                            'До тестов сохраняем результат GET списка, GET /stats и содержимое рабочего JSON.',
                            'Отправляем некорректные запросы и после каждого повторяем чтение. Список, stats и файл должны совпасть с исходным состоянием.',
                            'Отправляем валидный body с краевыми пробелами. Ожидаем 201 и очищенное название в ответе.',
                            'Читаем полученный id через GET /tasks/{task_id}, проверяем CLI и повторяем GET после перезапуска API.'
                        ],
                        'code': '''До ошибочного POST: tasks = T, stats = S, JSON = J
POST с невалидным body -> 422
После запроса:          tasks = T, stats = S, JSON = J

POST с допустимым body -> 201 и id=N
GET /tasks/N           -> созданная Task с очищенным title''',
                        'checks': [
                            'Отказ не создаёт частичную запись и не вызывает сохранение.',
                            'Успех подтверждён чтением сохранённой Task, а не только ответом POST.',
                            'API и CLI по-прежнему используют общий источник данных.'
                        ]
                    }
                }
            ],
            'result': (
                'Ошибочные запросы получают 422 без изменения списка, stats и JSON. Допустимый title сохраняется очищенным '
                'через существующий POST и читается через API и CLI.'
            )
        }
    ],
    58: [
        {
            'title': 'HTTP-схемы Planner API отделены от доменной модели',
            'task': (
                'Существующий POST создаёт Task через PlannerService, а GET читает её из общего JSON. HTTP-вход и публичный ответ '
                'описаны разными схемами в app/schemas.py, а действующие маршруты объявляют формы успешных ответов. Операции Planner, '
                'формат JSON и работу CLI сохранены.'
            ),
            'tasks': [
                {
                    'title': 'HTTP-схемы содержат вход и публичный ответ',
                    'task': (
                        'app/schemas.py содержит прежнюю TaskCreate со всеми правилами входа из предыдущего занятия и отдельную '
                        'TaskRead для публичного ответа.'
                    ),
                    'requirements': [
                        'TaskCreate требует title и priority и сохраняет прежние ограничения и нормализацию title.',
                        'TaskRead содержит id, title, priority и is_done; tags остаётся полем доменной Task.',
                        'Схемы PUT и PATCH в этом занятии отсутствуют: операции обновления появятся позже.'
                    ],
                    'hint': 'Одна схема описывает данные от клиента, другая описывает результат, который сервер отдаёт после создания.',
                    'answer': {
                        'explanation': (
                            'schemas.py хранит формы HTTP-обмена, а не доменную модель. При переносе TaskCreate её поведение '
                            'должно остаться прежним. TaskRead описывает четыре публичных поля и не заменяет Task, в которой '
                            'Planner продолжает хранить tags.'
                        ),
                        'steps': [
                            'Создаём schemas.py рядом с api.py.',
                            'Переносим TaskCreate без упрощения её полей, Field-ограничений и before-validator.',
                            'Объявляем TaskRead с четырьмя публичными полями.',
                            'В api.py импортируем обе схемы из нового модуля.'
                        ],
                        'code': '''from pydantic import BaseModel, Field, field_validator


class TaskCreate(BaseModel):
    title: str = Field(min_length=1, max_length=120)
    priority: int = Field(ge=1, le=5)

    @field_validator("title", mode="before")
    @classmethod
    def strip_title(cls, value: object) -> object:
        if isinstance(value, str):
            return value.strip()
        return value


class TaskRead(BaseModel):
    id: int
    title: str
    priority: int
    is_done: bool''',
                        'checks': [
                            'Правила TaskCreate совпадают с предыдущим занятием.',
                            'TaskRead требует четыре поля и не содержит tags.',
                            'Схема не импортирует FastAPI, PlannerService или JsonStorage.'
                        ]
                    }
                },
                {
                    'title': 'Действующие маршруты объявляют схемы ответа',
                    'task': (
                        'GET /tasks, GET /tasks/{task_id} и настоящий POST /tasks объявляют response_model=TaskRead или '
                        'list[TaskRead]. POST принимает TaskCreate, вызывает прежний сервис и отвечает кодом 201.'
                    ),
                    'requirements': [
                        'Коллекция возвращает list[TaskRead], а item и успешный POST возвращают TaskRead.',
                        'Query-параметры списка и ответ 404 для отсутствующего item сохраняют прежнее поведение.',
                        'Публичная форма ответа содержит четыре поля TaskRead, без tags.'
                    ],
                    'hint': 'Мы задаём response_model у маршрута, а для коллекции указываем, что её элементы имеют форму TaskRead.',
                    'answer': {
                        'explanation': (
                            'Request и успешный response относятся к разным направлениям. FastAPI проверяет вход через '
                            'TaskCreate, а результат ограничивает по TaskRead. Это не меняет сервис и не переводит POST '
                            'из настоящего создания в echo. Каждый response_model добавляется к декоратору своего '
                            'существующего маршрута, а его параметры и тело остаются прежними.'
                        ),
                        'steps': [
                            'Оставляем параметр POST типа TaskCreate.',
                            'У GET /tasks задаём response_model=list[TaskRead], сохраняя query-аргументы.',
                            'У GET /tasks/{task_id} задаём response_model=TaskRead и сохраняем ветку 404.',
                            'У POST задаём response_model=TaskRead и оставляем статус 201 Created.'
                        ],
                        'checks': [
                            'POST по-прежнему вызывает PlannerService и возвращает 201.',
                            'Item route продолжает возвращать 404 для отсутствующего id.',
                            'В обработчиках нет второго списка задач или прямой записи в JSON.'
                        ]
                    }
                },
                {
                    'title': 'HTTP-договор совпадает с данными Planner',
                    'task': (
                        '/docs показывает модели request и успешных response. Результат одного POST подтверждается полями TaskRead '
                        'в API и той же доменной записью, включая tags, в общем JSON и CLI.'
                    ),
                    'requirements': [
                        'OpenAPI показывает TaskCreate у POST request, TaskRead у POST 201, list[TaskRead] у списка и TaskRead у item.',
                        'GET сохраняет прежние query-параметры и 404 для отсутствующей задачи.',
                        'Ответ POST и обоих GET содержит поля TaskRead, но не tags.',
                        'Полная запись в JSON и вывод CLI сохраняют tags. Дополнительный ключ не обязан давать 422 без отдельной настройки extra-полей.'
                    ],
                    'hint': 'Сначала посмотрим объявленные схемы в /docs, затем сопоставим один HTTP-ответ с записью в файле и выводом CLI.',
                    'answer': {
                        'explanation': (
                            'response_model задаёт публичную форму HTTP-ответа. Она не переписывает доменную Task и не '
                            'меняет сериализатор JsonStorage. Поэтому одно и то же поле tags может присутствовать в JSON '
                            'и CLI, но отсутствовать в ответах API.'
                        ),
                        'steps': [
                            'В /docs проверяем TaskCreate у request POST, TaskRead у успешного POST и GET по id, а также список TaskRead у GET коллекции.',
                            'Отправляем один корректный POST и сверяем ответ: в нём есть id, title, priority и is_done, но нет tags.',
                            'Находим созданную задачу по id в JSON и CLI: поле tags осталось частью внутренней записи.',
                            'Убеждаемся, что параметры GET списка и ответ 404 для отсутствующего id не изменились.'
                        ],
                        'checks': [
                            'Request, доменная Task, JSON-запись и response не смешаны.',
                            'HTTP-ответ ограничен публичной схемой, а запись и CLI сохраняют внутренние tags.',
                            'Проверены существующие query-параметры списка и 404 item route.'
                        ]
                    }
                }
            ],
            'result': (
                'TaskCreate и TaskRead находятся в app/schemas.py. Три маршрута имеют явные response models, POST сохраняет '
                'статус 201, а JSON и CLI сохраняют прежнюю Task вместе с tags.'
            )
        }
    ],
    59: [
        {
            'title': 'Проверим сохранение и серверные id Planner',
            'task': (
                'Planner сохраняет созданные задачи в JSON через существующий сервис. В практике прослеживается путь POST, '
                'сверяются API и CLI, а сохранение и назначение id защищаются изолированными тестами.'
            ),
            'tasks': [
                {
                    'title': 'Путь от POST до JSON',
                    'task': (
                        'Маршрут POST передаёт проверенные title и priority существующему PlannerService.add_task(). '
                        'Сервис назначает id и сохраняет полную Task через настроенный JsonStorage до успешного ответа 201.'
                    ),
                    'requirements': [
                        'API получает сервис через существующую точку сборки, а не создаёт список задач в модуле маршрута.',
                        'id вычисляется из фактических сохранённых записей; TaskRead ограничивает ответ, не формат JSON.',
                        'Настройки CLI и API указывают на один и тот же путь файла.',
                        'Если API сохраняет собственный снимок или пишет JSON из маршрута, создание возвращается в существующий сервис.'
                    ],
                    'hint': 'Сначала найдём app.state.planner и build_service(). Затем проследим add_task до load/save у JsonStorage.',
                    'answer': {
                        'explanation': (
                            'TaskCreate проверяет поля клиента. API передаёт их существующему сервису, который применяет '
                            'правило id и сохраняет доменную Task. Только после успешного действия маршрут возвращает '
                            'TaskRead со статусом 201. CLI и API используют общий файл благодаря одинаковой настройке '
                            'JsonStorage, а не общему объекту Python между процессами.'
                        ),
                        'steps': [
                            'В build_service найдём, какой JsonStorage получает PlannerService и какой путь ему передан.',
                            'В точке сборки API проверим, что app.state.planner содержит созданный сервис, а не отдельный список.',
                            'В POST проследим передачу TaskCreate.title и priority в add_task().',
                            'В сервисе найдём загрузку актуальных Task, назначение id и вызов save() до возврата.',
                            'В JsonStorage сверим, что сериализуется полная Task; TaskRead используется на HTTP-границе.'
                        ],
                        'checks': [
                            'Маршрут не дублирует создание, вычисление id или запись JSON.',
                            'Ответ 201 следует после успешного сервиса; настройки CLI и API ведут к одному файлу.'
                        ]
                    }
                },
                {
                    'title': 'Один результат виден API и CLI',
                    'task': (
                        'Два POST с различимыми title создают две новые задачи с серверными id. GET и существующий CLI '
                        'показывают те же записи до и после перезапуска API; ранее сохранённые задачи остаются на месте.'
                    ),
                    'requirements': [
                        'Проверка использует фактические id из ответов, а не заранее выбранные номера.',
                        'В корректном body поля id и is_done не переопределяют значения сервиса; для проверки входной id отличен от ожидаемого следующего номера.',
                        'Путь JSON не меняется между CLI и API, файл не редактируется вручную.'
                    ],
                    'hint': 'В TaskCreate нет полей id и is_done. Проверим фактическую политику Pydantic для лишних полей и значение, которое создал сервис.',
                    'answer': {
                        'explanation': (
                            'Пример запроса показывает, что лишние поля не становятся командами для сервиса. При обычной '
                            'настройке Pydantic они игнорируются: сервер назначает фактический id и is_done=False. '
                            'Успешное сохранение проверяется повторным GET, чтением через CLI и после перезапуска, а не '
                            'только одним ответом POST.'
                        ),
                        'code': '''POST /tasks
Content-Type: application/json

{"id": 999, "title": "Проверка JSON A", "priority": 4, "is_done": true}''',
                        'steps': [
                            'Через GET /tasks или CLI выясним сохранённые id и вычислим следующий номер по действующему правилу Planner.',
                            'В первом корректном body укажем id, отличный от ожидаемого следующего номера, и is_done=true. Отправим POST и запишем статус 201 и фактический id.',
                            'Отправим второй POST с другим title и без дополнительных полей; сохраним его фактический id. Через GET /tasks/{id} проверим обе записи: первый id совпадает с расчётом Planner, а is_done равен false.',
                            'Откроем CLI по его существующей инструкции, найдём те же title и сохраним прежние записи.',
                            'Перезапустим API и повторим GET по фактическим id.'
                        ],
                        'checks': [
                            'Клиент не задаёт серверные id и начальный статус.',
                            'Ответ API, CLI и новый процесс показывают одни сохранённые записи.'
                        ]
                    }
                },
                {
                    'title': 'Тест сохранения через новый сервис',
                    'task': (
                        'Тест в существующем tests/test_services.py сохраняет две Task с id 2 и 7 во временный JSON, '
                        'добавляет новую задачу через PlannerService и читает файл новым экземпляром сервиса.'
                    ),
                    'requirements': [
                        'Тест использует существующие Task, PlannerService и JsonStorage, не создаёт их копии.',
                        'Новый id равен 8, хотя в JSON только две старые записи.',
                        'Повторное чтение сохраняет title, priority, is_done и tags всех трёх полных Task.'
                    ],
                    'hint': 'Создадим JsonStorage на tmp_path. Для новой проверки важны и разрыв между id, и новый PlannerService с тем же путём.',
                    'answer': {
                        'explanation': (
                            'Тест проверяет операцию приложения, а не копию алгоритма над Python-списком. Задачи 2 и 7 '
                            'показывают, почему следующий id берётся от максимального значения, а не от количества записей. '
                            'Новый сервис не имеет состояния старого объекта и заново читает JSON. Проверка tags подтверждает, '
                            'что публичная схема ответа не урезала доменную запись в хранилище.'
                        ),
                        'code': '''from app.models import Task
from app.services import PlannerService
from app.storage import JsonStorage


def test_add_task_persists_full_task_for_new_service(tmp_path):
    path = tmp_path / "tasks.json"
    storage = JsonStorage(path)
    storage.save([
        Task(id=2, title="HTTP", priority=3, tags=["existing"]),
        Task(id=7, title="JSON", priority=4, is_done=True, tags=["keep"]),
    ])

    first = PlannerService(storage)
    created = first.add_task("Planner API", priority=5)

    second = PlannerService(JsonStorage(path))
    loaded = second.list_tasks()

    assert created.id == 8
    assert [(task.id, task.title, task.priority, task.is_done, task.tags) for task in loaded] == [
        (2, "HTTP", 3, False, ["existing"]),
        (7, "JSON", 4, True, ["keep"]),
        (8, "Planner API", 5, False, []),
    ]''',
                        'checks': [
                            'Тест читает временный JSON через новый объект JsonStorage.',
                            'id=8 зависит от max([2, 7]), а поля и tags прежних записей остаются в файле.'
                        ]
                    }
                },
                {
                    'title': 'Повреждённый JSON остаётся ошибкой',
                    'task': (
                        'Нечитаемый JSON вызывает StorageError при чтении PlannerService. Исходное содержимое файла '
                        'остаётся неизменным после отказа.'
                    ),
                    'requirements': [
                        'Файл создаётся внутри tmp_path и содержит синтаксически неверный JSON.',
                        'Сервис не возвращает пустой список и не перезаписывает исходный файл.',
                        'Тест ожидает StorageError, а не 404 или 422.'
                    ],
                    'hint': 'Сохраним исходный текст, вызовем list_tasks() и сравним файл после исключения.',
                    'answer': {
                        'explanation': (
                            'StorageError сообщает, что всё хранилище нельзя корректно прочитать. Это не означает, что '
                            'внутри нет одной искомой задачи. Возврат пустого списка скрыл бы проблему и мог бы привести '
                            'к перезаписи исходных данных.'
                        ),
                        'code': '''import pytest

from app.exceptions import StorageError
from app.services import PlannerService
from app.storage import JsonStorage


def test_corrupt_json_is_not_treated_as_empty(tmp_path):
    path = tmp_path / "tasks.json"
    path.write_text("{broken", encoding="utf-8")
    original = path.read_text(encoding="utf-8")
    service = PlannerService(JsonStorage(path))

    with pytest.raises(StorageError):
        service.list_tasks()

    assert path.read_text(encoding="utf-8") == original''',
                        'steps': [
                            'Запишем в отдельный файл заведомо неверный JSON и сохраним его исходный текст.',
                            'Вызовем list_tasks() у сервиса с этим JsonStorage.',
                            'Проверим, что появляется StorageError и текст файла совпадает с исходным.'
                        ],
                        'checks': [
                            'StorageError остаётся видимой причиной отказа.',
                            'Повреждённый источник не превращается в пустой Planner и не изменяется.'
                        ]
                    }
                }
            ],
            'result': (
                'Один POST-путь использует PlannerService и общий JsonStorage. API и CLI видят фактические серверные id, '
                'сохранение полных Task подтверждено новым сервисом на tmp_path, а повреждённый JSON не скрывается.'
            )
        }
    ],
    60: [
        {
            'title': 'Оставим одно ядро Planner для CLI и API',
            'task': (
                'Проверим существующую архитектуру и закрепим её регрессионными тестами. Не создаём новый CRUD, '
                'сервис или storage.'
            ),
            'tasks': [
                {
                    'title': 'Проследите обе точки входа',
                    'task': (
                        'Найдите build_service в CLI и при сборке FastAPI. Проследите вызовы списка, поиска и статистики '
                        'до PlannerService. Исправьте найденное дублирование, не меняя внешний контракт.'
                    ),
                    'requirements': [
                        'Каждый интерфейс использует PlannerService, собранный через существующий build_service.',
                        'PlannerService не импортирует FastAPI, а HTTP-обработчик не читает JSON напрямую.',
                        'Отдельные экземпляры сервиса указывают на один настроенный файл; глобальный Python-объект не требуется.'
                    ],
                    'hint': 'Начните с build_service и app.state.planner. Затем проверьте, кто выполняет поиск и статистику внутри GET-маршрутов.',
                    'answer': {
                        'explanation': (
                            'CLI и FastAPI обычно работают в разных процессах, поэтому у них отдельные экземпляры сервиса. '
                            'Общее состояние обеспечивает одинаковая настройка JsonStorage. HTTP-слой вызывает методы '
                            'PlannerService и формирует публичный ответ, но не повторяет поиск и чтение файла.'
                        ),
                        'steps': [
                            'Найдите создание сервиса для CLI и проверьте, что оно идёт через build_service().',
                            'Найдите настройку app.state.planner при сборке API и проверьте тот же build_service().',
                            'Проследите GET списка, item и stats до соответствующих методов сервиса.',
                            'Если endpoint открывает файл или повторяет предметный поиск/подсчёт, замените этот участок вызовом уже существующего метода.',
                            'Оставьте HTTP-проекцию и перевод ожидаемого отсутствия на HTTP-границе.'
                        ],
                        'checks': [
                            'Сервис остаётся независимым от FastAPI.',
                            'Оба интерфейса используют настроенный общий JSON, даже если экземпляры PlannerService разные.'
                        ]
                    }
                },
                {
                    'title': 'Закрепите контракт выборки тестом',
                    'task': (
                        'В tests/test_services.py добавьте тест на select_tasks с временным JsonStorage. После выборки '
                        'проверьте полный список, статистику и повторно загруженные записи.'
                    ),
                    'requirements': [
                        'Подготовьте Task с id 2, 7 и 11; завершена только задача 7.',
                        'Запросите незавершённые задачи по убыванию id с limit=1 и получите id 11.',
                        'Полный список остаётся [2, 7, 11], статистика остаётся all=3, open=2, done=1.',
                        'Тест не читает и не меняет рабочий data/tasks.json.'
                    ],
                    'hint': 'Создайте JsonStorage(path) внутри tmp_path. Сохраните исходные Task, вызовите select_tasks, затем сравните отдельные чтения сервиса и файла.',
                    'answer': {
                        'explanation': (
                            'select_tasks возвращает новый список для ответа. Он не сохраняет отфильтрованную выборку. '
                            'Поэтому новый экземпляр сервиса, полный list_tasks, статистика и файл должны по-прежнему '
                            'содержать все три задачи.'
                        ),
                        'steps': [
                            'Создайте три Task на временном пути и сохраните их через JsonStorage.',
                            'Создайте PlannerService с этим хранилищем.',
                            'Получите незавершённые задачи с сортировкой по убыванию и limit=1.',
                            'Создайте новый PlannerService для того же пути и проверьте список, статистику и файл.'
                        ],
                        'code': '''from app.models import Task
from app.services import PlannerService
from app.storage import JsonStorage


def test_select_tasks_does_not_change_full_planner(tmp_path):
    path = tmp_path / "tasks.json"
    original = [
        Task(id=2, title="CLI", priority=2, is_done=False, tags=["terminal"]),
        Task(id=7, title="HTTP", priority=4, is_done=True, tags=["api"]),
        Task(id=11, title="Tests", priority=3, is_done=False, tags=["pytest"]),
    ]
    JsonStorage(path).save(original)
    service = PlannerService(JsonStorage(path))

    selected = service.select_tasks(
        is_done=False,
        sort_desc=True,
        limit=1,
    )

    reader = PlannerService(JsonStorage(path))
    assert [task.id for task in selected] == [11]
    assert [task.id for task in reader.list_tasks()] == [2, 7, 11]
    assert reader.get_statistics() == {"all": 3, "open": 2, "done": 1}
    assert JsonStorage(path).load() == original''',
                        'checks': [
                            'Выборка сортирует и ограничивает результат, не меняя полный JSON.',
                            'Статистика считает все записи, а не только текущую выборку.'
                        ]
                    }
                },
                {
                    'title': 'Не маскируйте сбой хранилища',
                    'task': (
                        'В существующих сервисных тестах проверьте, что обращение к отсутствующему id даёт '
                        'TaskNotFoundError, а ошибка чтения JSON остаётся StorageError.'
                    ),
                    'requirements': [
                        'Для отсутствующего id проверяется доменное исключение сервиса.',
                        'Для пробельного title проверяется ValueError и отсутствие частичной записи.',
                        'Для повреждённого временного JSON проверяется StorageError.',
                        'Ни одну из этих ошибок не заменяйте пустым списком или общей ошибкой 404.'
                    ],
                    'hint': 'Разведите случаи: файл читается, но записи нет; файл нельзя прочитать вовсе. Это разные входные условия.',
                    'answer': {
                        'explanation': (
                            'TaskNotFoundError относится к одному ресурсу, которого нет в корректно прочитанном Planner. '
                            'ValueError сообщает о нарушении правила Planner, а StorageError означает, что само состояние недоступно. Если обработчик ловит обе ошибки '
                            'как 404, он скрывает поломку хранилища.'
                        ),
                        'steps': [
                            'На исправном временном JSON запросите отсутствующий id и ожидайте TaskNotFoundError.',
                            'Передайте пробельный title в add_task и проверьте ValueError без изменения файла.',
                            'Создайте отдельный файл с некорректным JSON.',
                            'Вызовите чтение через PlannerService и ожидайте StorageError.',
                            'Сравните содержимое повреждённого файла до и после ошибки.'
                        ],
                        'code': '''import pytest

from app.exceptions import StorageError, TaskNotFoundError
from app.services import PlannerService
from app.storage import JsonStorage


def test_missing_task_has_domain_error(tmp_path):
    path = tmp_path / "tasks.json"
    JsonStorage(path).save([])
    service = PlannerService(JsonStorage(path))

    with pytest.raises(TaskNotFoundError):
        service.get_task(404)


def test_invalid_title_does_not_write(tmp_path):
    path = tmp_path / "tasks.json"
    JsonStorage(path).save([])
    service = PlannerService(JsonStorage(path))

    with pytest.raises(ValueError):
        service.add_task("   ", 3)
    assert JsonStorage(path).load() == []


def test_broken_json_is_not_a_missing_task(tmp_path):
    path = tmp_path / "broken.json"
    path.write_text("{broken", encoding="utf-8")
    original = path.read_text(encoding="utf-8")
    service = PlannerService(JsonStorage(path))

    with pytest.raises(StorageError):
        service.list_tasks()
    assert path.read_text(encoding="utf-8") == original''',
                        'checks': [
                            'Отсутствующий id и нечитаемый файл дают разные исключения.',
                            'Все три теста используют tmp_path и не трогают рабочие данные.'
                        ]
                    }
                },
                {
                    'title': 'Сверьте чтение через CLI и HTTP',
                    'task': (
                        'На текущих данных получите список и stats через CLI, затем вызовите GET /tasks и GET /stats. '
                        'Сравните соответствующие значения, не меняя записи.'
                    ),
                    'requirements': [
                        'Первые десять HTTP-записей совпадают с первыми десятью задачами CLI после сортировки по id.',
                        'all из сервиса соответствует total в API; open и done совпадают.',
                        'После GET список, stats и рабочий JSON остались прежними.'
                    ],
                    'hint': 'HTTP-список ограничен и не содержит tags. Сравнивайте общие публичные поля и поле all сервиса с total API.',
                    'answer': {
                        'explanation': (
                            'GET /tasks возвращает публичную проекцию и по умолчанию ограничивает список десятью записями. '
                            'Поэтому сравниваем его с первыми десятью CLI-задачами по id и только по общим полям. '
                            'Статистика берётся для всего Planner; API лишь называет all полем total.'
                        ),
                        'steps': [
                            'Получите через CLI полный список и stats, запишите значения all, open и done.',
                            'Вызовите GET /tasks и сравните порядок и общие поля с первыми десятью CLI-записями.',
                            'Вызовите GET /stats и сверьте total с all, а также open и done.',
                            'Повторите чтение CLI и убедитесь, что GET не изменил сохранённые данные.'
                        ],
                        'checks': [
                            'Не ожидайте увидеть tags в публичном HTTP-ответе.',
                            'Ограниченная выборка не меняет полный список и статистику Planner.'
                        ]
                    }
                }
            ],
            'result': (
                'CLI и API делегируют операции одному PlannerService, сервисные тесты подтверждают границы выборки и ошибок, '
                'а GET показывает данные общего JSON без изменения состояния.'
            )
        }
    ],
    61: [
        {
            'title': 'Добавим полное и частичное обновление Task',
            'task': (
                'Продолжим тот же Planner: POST создаёт задачу, GET читает её из общего JSON. Добавьте PUT для полной '
                'замены редактируемых полей и PATCH для изменения выбранных. Сохраняйте через существующие '
                'PlannerService и JsonStorage, не создавайте второй путь данных.'
            ),
            'tasks': [
                {
                    'title': 'Опишите два входных договора',
                    'task': (
                        'В существующем app/schemas.py добавьте TaskUpdate для PUT и TaskPatch для PATCH. Оставьте '
                        'уже готовые TaskCreate и TaskRead на месте.'
                    ),
                    'requirements': [
                        'TaskUpdate требует title, priority и is_done. Title очищается от краевых пробелов и остаётся длиной от 1 до 120; priority от 1 до 5.',
                        'В TaskPatch те же поля необязательны. Пропущенное поле и null означают «оставить прежнее значение».',
                        'Не добавляйте id или tags во входные схемы. Не меняйте TaskCreate и TaskRead.'
                    ],
                    'hint': 'Возьмите нормализацию title из существующей TaskCreate. Поля полной схемы не получают defaults, а поля PATCH получают None.',
                    'answer': {
                        'explanation': (
                            'TaskUpdate описывает весь редактируемый набор, поэтому у его полей нет значений по умолчанию. '
                            'TaskPatch принимает частичный набор. Нормализация и ограничения остаются такими же, как '
                            'для создания. Id выбирается URL, а tags принадлежат внутренней модели.'
                        ),
                        'steps': [
                            'Оставьте существующий TaskCreate и его validator без изменений.',
                            'Объявите TaskUpdate с тремя обязательными полями и прежними ограничениями.',
                            'Объявите TaskPatch с теми же ограничениями, но с None по умолчанию.',
                            'Добавьте before-validator для title в обе схемы, чтобы сначала убрать краевые пробелы.'
                        ],
                        'code': '''from pydantic import BaseModel, Field, field_validator


class TaskUpdate(BaseModel):
    title: str = Field(min_length=1, max_length=120)
    priority: int = Field(ge=1, le=5)
    is_done: bool

    @field_validator("title", mode="before")
    @classmethod
    def strip_title(cls, value: object) -> object:
        return value.strip() if isinstance(value, str) else value


class TaskPatch(BaseModel):
    title: str | None = Field(default=None, min_length=1, max_length=120)
    priority: int | None = Field(default=None, ge=1, le=5)
    is_done: bool | None = None

    @field_validator("title", mode="before")
    @classmethod
    def strip_title(cls, value: object) -> object:
        return value.strip() if isinstance(value, str) else value''',
                        'checks': [
                            'TaskUpdate без любого из трёх полей не проходит валидацию.',
                            'TaskPatch принимает одно допустимое поле, но отвергает неверные title и priority.',
                            'id и tags отсутствуют в обеих схемах обновления.'
                        ]
                    }
                },
                {
                    'title': 'Обновите существующий PlannerService',
                    'task': (
                        'В app/services.py добавьте replace_task и patch_task. Оба метода работают с доменными Task и '
                        'загружают и сохраняют список через уже внедрённый storage.'
                    ),
                    'requirements': [
                        'replace_task находит id, создаёт новую Task с тремя значениями PUT и сохраняет прежние id и tags.',
                        'patch_task сохраняет старые значения пропущенных полей. Явное is_done=False должно применяться.',
                        'Сначала соберите и проверьте новую Task, затем замените элемент и вызовите save один раз.',
                        'Неизвестный id даёт TaskNotFoundError. Пустое изменение возвращает Task без записи в JSON.'
                    ],
                    'hint': 'Создавайте Task до изменения списка: её прежние правила проверят новое состояние. Для PATCH отличайте None от False, а tags копируйте из найденной задачи.',
                    'answer': {
                        'explanation': (
                            'Сервис не знает HTTP-статусов. Он находит объект в полном списке Planner, строит новую '
                            'корректную Task, сохраняет её и возвращает. Если создание Task завершится ошибкой, вызов '
                            'save ещё не произошёл. Проверка значения через is not None не теряет False.'
                        ),
                        'steps': [
                            'Загрузите список и найдите индекс задачи с нужным id.',
                            'До изменения списка создайте новый Task, сохранив id и копию tags.',
                            'Замените объект по найденному индексу, сохраните полный список и верните Task.',
                            'Если id не найден, поднимите существующий TaskNotFoundError.',
                            'В PATCH соберите каждое поле из нового значения, если оно не None, иначе из текущей Task.'
                        ],
                        'code': '''def replace_task(self, task_id, *, title, priority, is_done):
    tasks = self.storage.load()
    for index, current in enumerate(tasks):
        if current.id == task_id:
            updated = Task(
                id=current.id,
                title=title,
                priority=priority,
                is_done=is_done,
                tags=current.tags.copy(),
            )
            tasks[index] = updated
            self.storage.save(tasks)
            return updated
    raise TaskNotFoundError(task_id)


def patch_task(
    self, task_id, *, title=None, priority=None, is_done=None
):
    tasks = self.storage.load()
    for index, current in enumerate(tasks):
        if current.id == task_id:
            if title is None and priority is None and is_done is None:
                return current
            updated = Task(
                id=current.id,
                title=current.title if title is None else title,
                priority=current.priority if priority is None else priority,
                is_done=current.is_done if is_done is None else is_done,
                tags=current.tags.copy(),
            )
            tasks[index] = updated
            self.storage.save(tasks)
            return updated
    raise TaskNotFoundError(task_id)''',
                        'checks': [
                            'PUT меняет все три редактируемых поля, но оставляет id и tags.',
                            'PATCH с is_done=False действительно возвращает задачу в открытые.',
                            'При ошибке конструктора и при неизвестном id JSON не перезаписывается.'
                        ]
                    }
                },
                {
                    'title': 'Подключите PUT и PATCH к тем же маршрутам Planner',
                    'task': (
                        'В существующем app/api.py добавьте PUT /tasks/{task_id} и PATCH с тем же адресом. Оба маршрута '
                        'используют app.state.planner и отвечают через TaskRead.'
                    ),
                    'requirements': [
                        'PUT принимает TaskUpdate и вызывает replace_task с title, priority и is_done.',
                        'PATCH принимает TaskPatch и передаёт только model_dump(exclude_unset=True, exclude_none=True).',
                        'TaskNotFoundError переводится в HTTP 404; неверное тело получает 422 до вызова сервиса.',
                        'Не читайте JSON, не создавайте новую задачу при отсутствующем id и не ловите общую Exception.'
                    ],
                    'hint': 'Для PATCH распакуйте отобранный словарь аргументов в существующий PlannerService. Обработчик не должен формировать список Task или писать файл.',
                    'answer': {
                        'explanation': (
                            'HTTP-обработчик связывает входную схему, метод сервиса и публичную схему ответа. FastAPI '
                            'проверяет body прежде, чем запускать функцию. Сервисное отсутствие превращается в 404, '
                            'а StorageError остаётся видимой серверной проблемой.'
                        ),
                        'steps': [
                            'Импортируйте обе входные схемы, TaskRead, HTTPException и существующий TaskNotFoundError.',
                            'Добавьте маршруты на общий адрес item и задайте response_model=TaskRead.',
                            'В PUT вызовите replace_task со всеми полями TaskUpdate.',
                            'В PATCH получите changes с exclude_unset и exclude_none и передайте его в patch_task.',
                            'Поймайте только TaskNotFoundError и верните 404.'
                        ],
                        'code': '''@app.put("/tasks/{task_id}", response_model=TaskRead)
def update_task(task_id: int, payload: TaskUpdate):
    try:
        return app.state.planner.replace_task(
            task_id,
            title=payload.title,
            priority=payload.priority,
            is_done=payload.is_done,
        )
    except TaskNotFoundError:
        raise HTTPException(status_code=404, detail="Task not found")


@app.patch("/tasks/{task_id}", response_model=TaskRead)
def patch_task_endpoint(task_id: int, payload: TaskPatch):
    changes = payload.model_dump(
        exclude_unset=True,
        exclude_none=True,
    )
    try:
        return app.state.planner.patch_task(task_id, **changes)
    except TaskNotFoundError:
        raise HTTPException(status_code=404, detail="Task not found")''',
                        'checks': [
                            'Успешные ответы проходят через TaskRead и содержат публичные поля.',
                            'Ошибка body даёт 422, корректный запрос с неизвестным id даёт 404.',
                            'Ошибка storage не превращается в 404, а отсутствие не запускает создание Task.'
                        ]
                    }
                },
                {
                    'title': 'Докажите обновление на файле и через оба интерфейса',
                    'task': (
                        'Проверьте методы PlannerService на временном JsonStorage, затем выполните цепочку запросов через '
                        '/docs. Сравните результат с новым чтением JSON и CLI.'
                    ),
                    'requirements': [
                        'PUT меняет title, priority и is_done у существующей Task; id и tags остаются прежними после нового чтения.',
                        'Неполный PUT и PATCH с пустым или пробельным title дают 422 без изменения JSON.',
                        'После завершения Task примените PATCH только is_done=false. Другие поля сохраняются, общая статистика обновляется.',
                        'PATCH с JSON-телом {} или null в поле не меняет данные; неверный тип, например priority="high", получает 422.',
                        'Корректные PUT/PATCH к отсутствующему id дают 404 и не добавляют запись.'
                    ],
                    'hint': 'Снимите значения Task и JSON до запроса. Сверьте не только ответ, но и свежий PlannerService. Для False проверьте, что ключ остался в PATCH changes.',
                    'answer': {
                        'explanation': (
                            'HTTP-ответ показывает проекцию, но только независимое чтение подтверждает сохранение. '
                            'Сервисные тесты с tmp_path отдельно доказывают, что методы работают с доменной Task и не '
                            'зависят от API. Ошибки входа и отсутствующий id не должны изменять файл.'
                        ),
                        'steps': [
                            'В тесте создайте JsonStorage на tmp_path, сохраните одну Task с тегами и создайте PlannerService.',
                            'Проверьте PUT, затем создайте новый сервис для того же пути и сверьте id, tags и три изменённых поля.',
                            'Завершите Task и выполните PATCH только с is_done=False. Проверьте title, priority, id, tags и статистику.',
                            'Сохраните исходный текст JSON, выполните ошибки валидации и запрос неизвестного id, затем сравните файл.',
                            'В /docs повторите успешную цепочку и сверьте GET, вывод CLI и чтение после перезапуска API.'
                        ],
                        'code': '''# После PUT и повторного чтения:
assert updated.id == original.id
assert updated.tags == original.tags
assert (updated.title, updated.priority, updated.is_done) == (
    "Новый заголовок", 5, False
)

# PATCH должен сохранить явный False и остальные поля:
patch = TaskPatch(is_done=False)
assert patch.model_dump(
    exclude_unset=True, exclude_none=True
) == {"is_done": False}

# Неверный body -> 422; неизвестный id с верным body -> 404.
# В обоих случаях повторное чтение JSON совпадает с исходным.''',
                        'checks': [
                            'JSON хранит полную доменную Task, включая tags, а не TaskRead.',
                            'Новый сервис для того же пути видит успешное обновление.',
                            'После PATCH is_done=False задача открыта, а статистика отражает новое состояние.'
                        ]
                    }
                }
            ],
            'result': (
                'Существующая Task обновляется через PUT или PATCH и сохраняется в общем JSON. Идентификатор и tags '
                'не теряются, PATCH сохраняет явно переданный False, а ошибки 422 и 404 не создают и не меняют записи.'
            )
        }
    ],
    62: [
        {
            'title': 'Подключим удаление к настоящему Planner API',
            'task': (
                'Одна цепочка проводит новую Task через настоящий API и общий JSON: проверенный вход, сохранение, '
                'изменения, HTTP-удаление и подтверждение отсутствия после нового чтения.'
            ),
            'tasks': [
                {
                    'title': 'DELETE-маршрут с ответом 204',
                    'task': (
                        'В app/api.py маршрут DELETE /tasks/{task_id} вызывает app.state.planner.delete_task. '
                        'Успех возвращает пустой Response со статусом 204, а известное отсутствие задачи получает 404.'
                    ),
                    'requirements': [
                        'Маршрут задаёт статус 204 и возвращает Response без response_model и тела.',
                        'Только TaskNotFoundError переводится в HTTP 404; StorageError не скрывается.',
                        'Удаление выполняет существующий сервис, а endpoint не читает JSON и не повторяет логику.'
                    ],
                    'hint': 'Мы уже знаем, что у 204 нет тела. Посмотрим, как связать его с готовой операцией и перехватить только ожидаемое отсутствие.',
                    'answer': {
                        'explanation': (
                            'Endpoint связывает path-параметр с готовой операцией. PlannerService удаляет Task и '
                            'сохраняет оставшийся список. Response со статусом 204 подтверждает HTTP-успех без '
                            'сериализации удалённой модели. Узкий except переводит только известное отсутствие ресурса.'
                        ),
                        'steps': [
                            'Мы импортируем HTTPException, Response, status и существующий TaskNotFoundError.',
                            'Мы объявляем DELETE-маршрут для item-пути и задаём ему статус 204.',
                            'Мы вызываем delete_task через app.state.planner.',
                            'Мы переводим TaskNotFoundError в 404 и возвращаем пустой Response после успеха.'
                        ],
                        'code': '''from fastapi import HTTPException, Response, status
from app.exceptions import TaskNotFoundError


@app.delete(
    "/tasks/{task_id}",
    status_code=status.HTTP_204_NO_CONTENT,
)
def delete_task(task_id: int):
    try:
        app.state.planner.delete_task(task_id)
    except TaskNotFoundError:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Task not found",
        )
    return Response(status_code=status.HTTP_204_NO_CONTENT)''',
                        'checks': [
                            'Успех возвращает именно 204 и пустое тело.',
                            'Отсутствующая Task даёт 404.',
                            'Endpoint не импортирует JsonStorage и не повторяет сервисную операцию.'
                        ]
                    }
                },
                {
                    'title': 'Пустой успех и причины отказа',
                    'task': (
                        'Проверка различает пустой успешный ответ, корректный отсутствующий ID, неверный тип path '
                        'и сбой хранения. Запросы сохраняются в прежней Planner collection.'
                    ),
                    'requirements': [
                        'Успешный DELETE получает 204 и пустое содержимое; у ответа не вызывается json().',
                        'После удаления GET и повторный DELETE для того же ID дают 404, если между запросами не создаётся новая Task.',
                        'Неизвестный целый ID, подтверждённо отсутствующий в текущем Planner, даёт 404; текст вместо int даёт 422 до вызова сервиса.'
                    ],
                    'hint': 'Мы сравним status и content отдельно. Для 404 выберем целый ID, которого нет в актуальном GET /tasks, а не предположим знакомое число.',
                    'answer': {
                        'explanation': (
                            '204 означает, что существующая Task удалена. Повторный DELETE не удаляет её ещё раз: '
                            'сервис теперь сообщает об отсутствии, и HTTP отвечает 404. Некорректный тип останавливается '
                            'раньше endpoint с 422. StorageError не относится ни к одному из этих клиентских случаев.'
                        ),
                        'steps': [
                            'Мы удаляем существующую задачу и записываем status_code и content ответа.',
                            'Мы проверяем GET этого ID и повторяем DELETE до создания других задач.',
                            'Мы выбираем целый ID, отсутствующий в текущем GET /tasks, и проверяем 404.',
                            'Мы отправляем текст вместо целого числа в path и сравниваем статус.',
                            'Мы проверяем по коду, что StorageError не превращается в 404, не вызывая сбой специально.'
                        ],
                        'code': '''# ID берём из ответа POST
DELETE /tasks/{created_id} -> 204, content == b""
GET    /tasks/{created_id} -> 404
DELETE /tasks/{created_id} -> 404

# missing_id заранее подтверждён как отсутствующий через GET /tasks
DELETE /tasks/{missing_id} -> 404
DELETE /tasks/not-an-int -> 422

# Для 204 не вызываем response.json().''',
                        'checks': [
                            '204 не содержит TaskRead, JSON null или другого тела.',
                            'GET и повторный DELETE подтверждают отсутствие без промежуточного POST.',
                            '404, 422 и ошибка storage остаются разными ситуациями.'
                        ]
                    }
                },
                {
                    'title': 'Сохранённое удаление через общий JSON',
                    'task': (
                        'Одна открытая Task проходит POST, полный PUT, PATCH с is_done=False и DELETE. '
                        'Новый load, GET и CLI подтверждают её отсутствие и сохранность соседних записей.'
                    ),
                    'requirements': [
                        'ID берётся из ответа POST; исходные ID, tags и stats сверяются с результатом.',
                        'После POST счётчики равны N+1/O+1/D; после PUT True: N+1/O/D+1; после PATCH False: N+1/O+1/D; после DELETE: N/O/D.',
                        'Новый load того же JSON не находит Task; повторные GET и DELETE дают 404 до следующего POST. Запросы остаются в прежней Planner collection.'
                    ],
                    'hint': 'Мы сначала снимем реальное состояние CLI и создадим отдельную Task. Затем проследим тот же ID через PUT, PATCH, DELETE и свежую загрузку.',
                    'answer': {
                        'explanation': (
                            'Ответ 204 подтверждает HTTP-контракт, а новый load подтверждает постоянное состояние. '
                            'PATCH возвращает учебную Task в открытое состояние, поэтому её удаление уменьшает total и open. '
                            'После удаления исходные счётчики и соседние записи должны сохраниться.'
                        ),
                        'steps': [
                            'Мы записываем исходные total/open/done и существующие ID/tags через CLI.',
                            'Мы создаём одну открытую Task через POST и используем фактически выданный ID.',
                            'Мы выполняем PUT с is_done=True, затем PATCH только с is_done=False.',
                            'Мы удаляем эту Task и фиксируем пустой ответ 204.',
                            'Не создавая новые задачи, мы проверяем GET и повторный DELETE: оба дают 404.',
                            'Мы перечитываем тот же JSON новым PlannerService или после перезапуска и сравниваем исходные stats и соседние записи.'
                        ],
                        'code': '''# До удаления: total=N, open=O, done=D
# У учебной Task после PATCH is_done=False.

DELETE /tasks/{created_id} -> 204, body пустой
GET    /tasks/{created_id} -> 404
DELETE /tasks/{created_id} -> 404

# После нового чтения того же JSON:
total == N
open == O
done == D
# Существующие ID и tags соседних Task не изменились.''',
                        'checks': [
                            'Проверяется ID, фактически выданный POST, а не индекс списка.',
                            'Новое чтение того же JSON не находит удалённую Task.',
                            'Статистика возвращается к исходным значениям, соседние записи и tags сохранены.'
                        ]
                    }
                }
            ],
            'result': (
                'DELETE возвращает пустой 204 для существующей Task. Новый load, GET и CLI подтверждают её отсутствие; '
                'повторный запрос даёт 404, статистика возвращается к исходной, а соседние записи и их tags сохраняются.'
            )
        }
    ],
}
