"""Учебная практика блока. Редактируйте задания здесь."""

from __future__ import annotations

from typing import Any


MANUAL_PRACTICE: dict[int, list[dict[str, Any]]] = {
    57: [
        {
            'title': 'Уточним вход настоящего POST /tasks',
            'task': (
                'В предыдущем занятии POST стал создавать задачу через существующий PlannerService. Теперь уточним '
                'допустимые значения, не меняя этот путь. Проверим, что ошибочный запрос не меняет данные, а '
                'очищенный title сохраняется как обычная задача Planner.'
            ),
            'tasks': [
                {
                    'title': 'Нормализуйте title до проверки ограничений',
                    'task': (
                        'Измените существующую TaskCreate в app/api.py. Пробелы по краям title нужно убрать до '
                        'проверки длины. Ограничьте итоговое название длиной от 1 до 120 символов, а priority — '
                        'диапазоном от 1 до 5.'
                    ),
                    'requirements': [
                        'Оба поля остаются обязательными, а id и is_done не добавляются во вход.',
                        'Неподходящий тип title должен отклонять Pydantic, а не приводить к AttributeError.',
                        'Не меняйте endpoint, PlannerService, Task и сохранение JSON.'
                    ],
                    'hint': 'Сначала подготовьте сырое значение title. Обычные ограничения поля должны увидеть уже очищенную строку.',
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
                    'title': 'Проверьте границы и разберите 422',
                    'task': (
                        'Отправьте запросы через /docs или сохранённую Planner collection. Проверьте ошибки и допустимые '
                        'края для title и priority. Для каждого отказа найдите проблемное поле и правило, не заучивая '
                        'дословный английский текст ответа.'
                    ),
                    'requirements': [
                        'Проверьте пустой и пробельный title, title длиной 121 символ после очистки, отсутствующие поля, нестроковый title, а также priority 0 и 6.',
                        'Проверьте title длиной 1 и 120 символов, priority 1 и 5, а также длинный сырой title, который после обрезки укладывается в лимит.',
                        'Ошибочный вход получает 422; ответ указывает на неверное поле. Не привязывайте проверки к точному тексту msg.'
                    ],
                    'hint': 'Изменяйте по одному значению относительно успешного body. Сравните длину до и после очистки.',
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
                    'title': 'Докажите, что отказ не меняет Planner',
                    'task': (
                        'Перед серией ошибочных запросов зафиксируйте список задач и stats. После каждого отказа сравните '
                        'результат и рабочий JSON с исходным состоянием. Затем отправьте допустимое название с краевыми '
                        'пробелами и проверьте созданную запись через API и CLI.'
                    ),
                    'requirements': [
                        'Некорректные запросы не добавляют Task и не меняют рабочий JSON.',
                        'Успешный POST возвращает 201 и очищенный title; ответный id читается через GET /tasks/{task_id}.',
                        'Созданная задача видна CLI и остаётся после перезапуска API.'
                    ],
                    'hint': 'Сравните состояние до и после отказа, а не только число элементов. Успешный запрос проверьте независимым чтением по id.',
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
            'title': 'Разделите вход Planner API и публичный ответ',
            'task': (
                'Продолжим настоящий Planner API: POST уже создаёт Task, а GET читает её из общего JSON. Вынесите HTTP-схемы '
                'в app/schemas.py и подключите публичную схему ответа к существующим маршрутам. Не меняйте операции Planner, '
                'формат файла или работу CLI.'
            ),
            'tasks': [
                {
                    'title': 'Вынесите схемы без потери правил входа',
                    'task': (
                        'Создайте app/schemas.py. Перенесите туда текущую TaskCreate со всеми ограничениями и нормализацией '
                        'из предыдущего занятия, затем добавьте TaskRead для публичного ответа.'
                    ),
                    'requirements': [
                        'TaskCreate принимает обязательные title и priority и сохраняет прежнюю проверку title.',
                        'TaskRead содержит id, title, priority и is_done. Поле tags остаётся внутренним.',
                        'Не создавайте TaskUpdate: PUT и PATCH ещё не добавлены.'
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
                    'title': 'Подключите TaskRead к настоящим ответам',
                    'task': (
                        'Добавьте response_model к уже работающим GET /tasks, GET /tasks/{task_id} и POST /tasks. POST '
                        'продолжает принимать TaskCreate, вызывать прежний сервис и отвечать кодом 201.'
                    ),
                    'requirements': [
                        'Коллекция использует list[TaskRead], а item и успешный POST используют TaskRead.',
                        'Не меняйте query-параметры списка, поведение item и его ответ 404.',
                        'Публичный ответ не содержит tags.'
                    ],
                    'hint': 'response_model задаётся у маршрута. Для списка укажите, что он состоит из элементов TaskRead.',
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
                    'title': 'Проверьте HTTP-договор и сохранённую Task',
                    'task': (
                        'Откройте /docs, затем отправьте один успешный POST. Сравните его ответ с той же задачей в JSON '
                        'и CLI: наружу уходят четыре поля TaskRead, а внутренние tags остаются в проекте.'
                    ),
                    'requirements': [
                        'OpenAPI показывает TaskCreate у POST request, TaskRead у POST 201, list[TaskRead] у списка и TaskRead у item.',
                        'GET сохраняет прежние query-параметры и 404 для отсутствующей задачи.',
                        'Ответ POST и обоих GET содержит поля TaskRead, но не tags.',
                        'Полная запись в JSON и вывод CLI сохраняют tags. Не требуйте 422 за extra-поля без специальной настройки.'
                    ],
                    'hint': 'Сначала посмотрите объявленные схемы в /docs, затем сопоставьте один HTTP-ответ с записью в файле и выводом CLI.',
                    'answer': {
                        'explanation': (
                            'response_model задаёт публичную форму HTTP-ответа. Она не переписывает доменную Task и не '
                            'меняет сериализатор JsonStorage. Поэтому одно и то же поле tags может присутствовать в JSON '
                            'и CLI, но отсутствовать в ответах API.'
                        ),
                        'steps': [
                            'В /docs проверьте TaskCreate у request POST, TaskRead у успешного POST и GET по id, а также список TaskRead у GET коллекции.',
                            'Отправьте один корректный POST и посмотрите его успешный ответ: в нём есть id, title, priority и is_done, но нет tags.',
                            'Найдите созданную задачу по id в JSON и CLI: поле tags осталось частью внутренней записи.',
                            'Убедитесь, что параметры GET списка и ответ 404 для отсутствующего id не изменились.'
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
            'title': 'Проверьте настоящее сохранение Planner API',
            'task': (
                'В этом упражнении мы не создаём новое хранилище и не переписываем выдачу id. Проследите существующий '
                'путь создания, затем проверьте его через API, CLI и изолированный тестовый файл.'
            ),
            'tasks': [
                {
                    'title': 'Проследите путь от POST до файла',
                    'task': (
                        'Найдите, где API получает PlannerService, и проследите POST до add_task и JsonStorage.save(). '
                        'Запишите, где выбирается путь JSON и где Task превращается в публичный ответ.'
                    ),
                    'requirements': [
                        'Покажите один последовательный путь от TaskCreate до ответа 201.',
                        'Различите роль сервиса, доменной Task, JsonStorage и TaskRead.',
                        'Если API хранит отдельный список или пишет файл напрямую, верните создание в существующий PlannerService.'
                    ],
                    'hint': 'Начните с app.state.planner в API. Затем откройте тип объекта, на котором вызывается add_task().',
                    'answer': {
                        'explanation': (
                            'POST получает проверенные title и priority. Маршрут передаёт их существующему PlannerService. '
                            'Сервис загружает текущее состояние, создаёт Task с серверным id и сохраняет полный список '
                            'через JsonStorage. После успешного сохранения Task возвращается в API, где response_model '
                            'формирует TaskRead и отправляется ответ 201.'
                        ),
                        'steps': [
                            'В точке сборки проверьте, что CLI и API создают PlannerService через одну настройку storage.',
                            'В API найдите вызов app.state.planner.add_task() и поля, переданные из TaskCreate.',
                            'В PlannerService найдите load(), назначение id и save() на существующем storage.',
                            'В JsonStorage проследите Task.to_dict(), запись файла и обратное восстановление через load().',
                            'Вернитесь к endpoint: после результата сервиса API возвращает TaskRead со статусом 201.'
                        ],
                        'checks': [
                            'Второго списка задач и отдельного id-генератора в API нет.',
                            'Публичная схема ответа не заменяет Task и полный формат JSON.'
                        ]
                    }
                },
                {
                    'title': 'Сверьте одну задачу через API и CLI',
                    'task': (
                        'Запустите API и CLI проекта. Создайте через POST две задачи с различимыми названиями, затем найдите '
                        'их по фактическим id в API и CLI. Перезапустите API и проверьте эти записи снова.'
                    ),
                    'requirements': [
                        'Для проверки используйте id из ответа, а не заранее выбранные числа.',
                        'Не редактируйте JSON вручную и не заменяйте существующие записи.',
                        'После перезапуска обе задачи доступны через тот же API и CLI.'
                    ],
                    'hint': 'Сначала запишите id из каждого ответа 201. Затем проверьте, что обе точки входа читают настроенный в проекте файл.',
                    'answer': {
                        'explanation': (
                            'Значения id зависят от текущего JSON, поэтому заранее назвать их нельзя. Успешная проверка состоит '
                            'в том, что каждый POST возвращает фактический id, GET находит ту же задачу, CLI показывает её, '
                            'а после нового запуска API записи остаются доступны.'
                        ),
                        'steps': [
                            'Сохраните исходный список и статистику через CLI.',
                            'Отправьте два корректных POST и запишите статус 201 и оба выданных id.',
                            'Получите созданные записи через GET и найдите те же названия через CLI.',
                            'Перезапустите API и повторите чтение по сохранённым id.',
                            'Убедитесь, что прежние записи и их внутренние поля не исчезли.'
                        ],
                        'checks': [
                            'Проверяется один фактический проектный путь, а не временный список в тестовом endpoint.',
                            'CLI и API видят одно состояние после последовательных операций и перезапуска.'
                        ]
                    }
                },
                {
                    'title': 'Докажите persistence новым сервисом',
                    'task': (
                        'Добавьте тест в существующий tests/test_services.py. Через tmp_path подготовьте JSON с id 2 и 7, '
                        'добавьте задачу существующим сервисом и проверьте результат новым сервисом на том же пути.'
                    ),
                    'requirements': [
                        'Используйте существующие Task, PlannerService и JsonStorage, не создавайте их копии.',
                        'Новая задача получает id 8, хотя в файле только две записи.',
                        'Тест обращается к временному файлу и подтверждает данные новым экземпляром сервиса.'
                    ],
                    'hint': 'Разрыв в id показывает, почему количество записей не подходит для выбора следующего номера.',
                    'answer': {
                        'explanation': (
                            'Новый экземпляр исключает ситуацию, когда результат виден только старому объекту в памяти. '
                            'Набор id 2 и 7 также показывает, что правило опирается на максимальный сохранённый id, '
                            'а не на длину списка.'
                        ),
                        'steps': [
                            'Создайте временный путь и сохраните по нему две Task с id 2 и 7.',
                            'Создайте PlannerService с JsonStorage этого пути и добавьте новую задачу.',
                            'Проверьте id 8, затем создайте новый PlannerService с тем же путём.',
                            'Прочитайте задачи новым экземпляром и проверьте порядок id 2, 7, 8.'
                        ],
                        'code': '''from app.models import Task
from app.services import PlannerService
from app.storage import JsonStorage


def test_add_task_persists_with_id_from_existing_records(tmp_path):
    path = tmp_path / "tasks.json"
    storage = JsonStorage(path)
    storage.save([
        Task(id=2, title="HTTP", priority=3),
        Task(id=7, title="JSON", priority=4),
    ])

    first = PlannerService(storage)
    created = first.add_task("Planner API", priority=5)

    second = PlannerService(JsonStorage(path))
    loaded = second.list_tasks()

    assert created.id == 8
    assert [task.id for task in loaded] == [2, 7, 8]''',
                        'checks': [
                            'Тест не зависит от постоянного data/tasks.json.',
                            'Проверены и фактическое правило id, и чтение новым экземпляром.'
                        ]
                    }
                },
                {
                    'title': 'Не превращайте повреждённый файл в пустой список',
                    'task': (
                        'Добавьте тест на повреждённый JSON в tmp_path. Вызов существующего PlannerService должен показать '
                        'StorageError, а исходный файл должен остаться нетронутым.'
                    ),
                    'requirements': [
                        'Проверяйте ошибку через существующие JsonStorage и PlannerService.',
                        'После ошибки содержимое временного файла не изменилось.',
                        'Не преобразуйте StorageError в 404, 422 или пустой список.'
                    ],
                    'hint': 'Снимите исходный текст до вызова load. Затем проверьте и исключение, и сохранность этого текста.',
                    'answer': {
                        'explanation': (
                            'Повреждённый файл означает, что сохранённое состояние нельзя прочитать. Это не то же самое, '
                            'что новый проект без файла. Если проглотить ошибку и вернуть пустой список, последующий save '
                            'может перезаписать данные, которые не удалось восстановить.'
                        ),
                        'steps': [
                            'Создайте в tmp_path файл с некорректным JSON и запомните его содержимое.',
                            'Вызовите list_tasks() через PlannerService с JsonStorage этого пути.',
                            'Ожидайте StorageError и после него перечитайте файл.',
                            'Сравните содержимое с исходным: ошибка не должна превращаться в пустое сохранение.'
                        ],
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
                        'checks': [
                            'Ожидается StorageError из существующего storage-контракта.',
                            'Тест не разрешает заменять неизвестное состояние пустым списком.'
                        ]
                    }
                }
            ],
            'result': (
                'API и CLI читают созданные задачи после перезапуска, новый PlannerService восстанавливает записи из tmp_path, '
                'а повреждённый JSON остаётся видимой ошибкой.'
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
                        'Для повреждённого временного JSON проверяется StorageError.',
                        'Ни одну из этих ошибок не заменяйте пустым списком или общей ошибкой 404.'
                    ],
                    'hint': 'Разведите случаи: файл читается, но записи нет; файл нельзя прочитать вовсе. Это разные входные условия.',
                    'answer': {
                        'explanation': (
                            'TaskNotFoundError относится к одному ресурсу, которого нет в корректно прочитанном Planner. '
                            'StorageError означает, что само состояние недоступно. Если обработчик ловит обе ошибки '
                            'как 404, он скрывает поломку хранилища.'
                        ),
                        'steps': [
                            'На исправном временном JSON запросите отсутствующий id и ожидайте TaskNotFoundError.',
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
                            'Оба теста используют tmp_path и не трогают рабочие данные.'
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
                'PlannerService уже удаляет Task и сохраняет оставшийся список. Подключите эту операцию к HTTP, '
                'затем проверьте пустой ответ и сохранённое отсутствие задачи. Рабочий JSON не очищайте и не заменяйте.'
            ),
            'tasks': [
                {
                    'title': 'Добавьте DELETE-маршрут с ответом 204',
                    'task': (
                        'В существующем app/api.py добавьте DELETE /tasks/{task_id}. Маршрут должен вызвать '
                        'app.state.planner.delete_task и сообщить клиенту об успешном удалении без тела ответа.'
                    ),
                    'requirements': [
                        'Задайте статус 204 и верните пустой Response без response_model.',
                        'Переведите только TaskNotFoundError в HTTP 404. Не ловите StorageError и общую Exception.',
                        'Не открывайте JSON и не реализуйте удаление второй раз в endpoint.'
                    ],
                    'hint': 'В сервисе уже находится единственный путь к данным. Подумайте, какой объект подходит для успешного статуса, у которого по договору нет body.',
                    'answer': {
                        'explanation': (
                            'Endpoint только связывает path-параметр с готовой операцией. Сервис удаляет задачу и '
                            'сохраняет список. Response со статусом 204 подтверждает HTTP-успех без сериализации '
                            'удалённой модели. Узкий except переводит только известное отсутствие ресурса.'
                        ),
                        'steps': [
                            'Импортируйте HTTPException, Response, status и существующий TaskNotFoundError.',
                            'Объявите DELETE-маршрут для item-пути и задайте статус 204.',
                            'Вызовите delete_task через app.state.planner.',
                            'Перехватите TaskNotFoundError и верните 404; при успехе верните пустой Response.'
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
                    'title': 'Различите пустой успех и три причины отказа',
                    'task': (
                        'Откройте маршрут через /docs или существующую Planner collection. Проверьте успешное удаление, '
                        'повторный запрос, отсутствующий id и id неверного типа.'
                    ),
                    'requirements': [
                        'Успешный DELETE получает 204 и пустое содержимое. Не вызывайте у ответа json().',
                        'После удаления GET и повторный DELETE для того же id дают 404, если между запросами не создавать новую Task.',
                        'Корректный, но неизвестный id даёт 404; текст вместо int в path даёт 422 до вызова сервиса.'
                    ],
                    'hint': 'Сравните status и content отдельно. Затем разделите неверный тип id, отсутствие записи и сбой чтения или записи JSON.',
                    'answer': {
                        'explanation': (
                            '204 означает, что существующая Task была удалена. Повторный DELETE не удаляет её ещё раз: '
                            'сервис теперь сообщает об отсутствии, и HTTP отвечает 404. Некорректный тип останавливается '
                            'раньше endpoint с 422. StorageError не относится ни к одному из этих клиентских случаев.'
                        ),
                        'steps': [
                            'Удалите существующую задачу и запишите status_code и content ответа.',
                            'Проверьте GET этого id и повторите DELETE до создания других задач.',
                            'Отдельно запросите допустимый, но неизвестный id.',
                            'Отправьте текст вместо целого числа в path и сравните статус.',
                            'По коду убедитесь, что StorageError не превращается в 404. Не вызывайте сбой специально.'
                        ],
                        'code': '''DELETE /tasks/18 -> 204, content == b""
GET    /tasks/18 -> 404
DELETE /tasks/18 -> 404

DELETE /tasks/999999 -> 404
DELETE /tasks/not-an-int -> 422

# Для 204 не вызывайте response.json().''',
                        'checks': [
                            '204 не содержит TaskRead, JSON null или другого тела.',
                            'GET и повторный DELETE подтверждают отсутствие без промежуточного POST.',
                            '404, 422 и ошибка storage остаются разными ситуациями.'
                        ]
                    }
                },
                {
                    'title': 'Проверьте удаление через общий JSON',
                    'task': (
                        'Создайте отдельную учебную Task готовым POST, выполните PUT и PATCH с предыдущего занятия и '
                        'удалите её по выданному id. Сверьте состояние через GET, CLI и новое чтение после перезапуска.'
                    ),
                    'requirements': [
                        'До удаления сохраните фактические id, tags и stats; после удаления остальные задачи и tags не изменились.',
                        'Удалённая Task отсутствует после нового чтения JSON и GET. Не создавайте новую задачу между проверкой GET и повторным DELETE.',
                        'Статистика отражает фактическое состояние: удалённая открытая задача уменьшает total и open на единицу.',
                        'Сохраните цепочку запросов в существующей Planner collection.'
                    ],
                    'hint': 'Возьмите id из ответа POST, а не вычисляйте его. Сначала подтвердите удаление по HTTP, затем проверьте тот же путь файла через новый сервис или CLI.',
                    'answer': {
                        'explanation': (
                            'Ответ 204 подтверждает HTTP-контракт, а новый load подтверждает постоянное состояние. '
                            'Поскольку учебная Task после PATCH открыта, её удаление уменьшает total и open. '
                            'Другие записи должны остаться неизменными.'
                        ),
                        'steps': [
                            'Снимите текущие id и stats через CLI. Создайте через POST отдельную Task и запишите выданный id.',
                            'Выполните PUT и PATCH для этой записи, затем убедитесь через GET, что она существует и открыта.',
                            'Удалите её запросом DELETE и проверьте 204 с пустым content.',
                            'Не создавая новые задачи, проверьте GET и повторный DELETE для того же id: оба должны дать 404.',
                            'Прочитайте JSON через новый PlannerService или перезапустите API. Сверьте оставшиеся записи и stats с исходными значениями.'
                        ],
                        'code': '''# До удаления: total=T, open=O, done=D
# Учебная Task после PATCH имеет is_done=False.

DELETE /tasks/{created_id} -> 204, body пустой
GET    /tasks/{created_id} -> 404
DELETE /tasks/{created_id} -> 404

# После нового чтения:
total == T - 1
open == O - 1
done == D
# Остальные id и их tags сохранены.
# Сохраните запросы в существующей Planner collection.''',
                        'checks': [
                            'Проверяется id, фактически выданный POST, а не тестовый индекс списка.',
                            'Новое чтение того же JSON не находит удалённую Task.',
                            'Stats пересчитана по данным, а соседние записи не потеряны.'
                        ]
                    }
                }
            ],
            'result': (
                'DELETE возвращает пустой 204 для существующей Task. Новый load, GET и CLI подтверждают её отсутствие; '
                'повторный запрос даёт 404, остальные записи и их tags сохраняются, а запросы сохраняются в прежней Planner collection.'
            )
        }
    ],
}
