"""Учебная практика блока. Редактируйте задания здесь."""

from __future__ import annotations

from typing import Any


MANUAL_PRACTICE: dict[int, list[dict[str, Any]]] = {
    51: [
        {
            "title": "Соберите два запроса к Postman Echo",
            "task": (
                "Проверьте настоящие HTTP-сообщения через Postman, пока у Planner ещё нет собственного сервера. "
                "Сохраните GET с query и POST с JSON body в одной collection. Echo должен отразить переданные значения, "
                "а экспорт Postman должен попасть в уже существующий проект Planner."
            ),
            "tasks": [
                {
                    "title": "Подготовьте папку для экспорта",
                    "task": (
                        "В корне существующего проекта Planner создайте папку `postman/`. Она будет хранить только "
                        "экспортированные запросы и окружение. Не создавайте второй проект и не переносите файлы Planner."
                    ),
                    "requirements": [
                        "Папка postman/ находится внутри уже существующего проекта Planner.",
                        "Остальные файлы проекта остались на месте и не были перезаписаны.",
                    ],
                    "hint": "Откройте корень проекта, где уже находятся его исходники и данные. Добавьте рядом одну новую папку.",
                    "answer": {
                        "explanation": (
                            "Postman-файлы должны сопровождать существующий Planner, а не изображать новый проект. "
                            "На этом шаге достаточно подготовить место для последующего экспорта."
                        ),
                        "steps": [
                            "Откройте корневую папку уже созданного Planner.",
                            "Создайте в ней новую папку postman.",
                            "Убедитесь, что прежние файлы приложения, CLI и данных не изменились.",
                        ],
                        "code": "Planner/\n├── прежние файлы проекта\n└── postman/",
                        "checks": [
                            "Новая папка находится в корне Planner.",
                            "Для практики не создана копия приложения.",
                        ],
                    },
                },
                {
                    "title": "Создайте collection и Echo environment",
                    "task": (
                        "Создайте collection `Planner HTTP Lab` для двух запросов и environment `Echo` для адреса сервера. "
                        "Добавьте `base_url=https://postman-echo.com` и выберите Echo активным."
                    ),
                    "requirements": [
                        "Для создания и сохранения collection выполнен вход в Postman.",
                        "Переменная base_url содержит только базовый адрес Echo, без /get или /post.",
                        "Environment Echo выбран активным; пароли и токены не добавлены.",
                    ],
                    "hint": "Collection хранит запросы, environment хранит переменные. Проверьте подстановку base_url до того, как сохраните URL запроса.",
                    "answer": {
                        "explanation": (
                            "Запросы и адрес назначения меняются независимо. Collection сохраняет сценарии, а environment "
                            "позволяет переиспользовать базовый host. Echo не требует данных для входа."
                        ),
                        "steps": [
                            "Создайте collection с названием Planner HTTP Lab.",
                            "Создайте environment Echo и добавьте переменную base_url.",
                            "Выберите Echo активным и проверьте, что {{base_url}}/get раскрывается в полный URL Echo.",
                        ],
                        "code": "Collection: Planner HTTP Lab\nEnvironment: Echo\nbase_url = https://postman-echo.com",
                        "checks": [
                            "Collection и environment созданы отдельно.",
                            "base_url не содержит path endpoint.",
                            "В переменных нет секретных или персональных значений.",
                        ],
                    },
                },
                {
                    "title": "Проверьте GET с query",
                    "task": (
                        "Добавьте в collection GET на `{{base_url}}/get` и передайте через Params пары `is_done=false` "
                        "и `limit=2`. Отправьте запрос и найдите обе пары в response.args."
                    ),
                    "requirements": [
                        "Response содержит status 200 и обе переданные пары в args.",
                        "Значения false и 2 показаны как строки.",
                        "Результат не называется фильтрацией Planner: запрос получил Echo.",
                    ],
                    "hint": "Сначала отправьте запрос без дополнительных проверок. В body найдите args и сравните значения с Params.",
                    "answer": {
                        "explanation": (
                            "GET отправляет параметры в URL. Echo отражает их в args как текст и не имеет списка Planner, "
                            "который можно было бы фильтровать."
                        ),
                        "steps": [
                            "Создайте request с методом GET и URL {{base_url}}/get.",
                            "Добавьте обе пары во вкладке Params и отправьте request.",
                            "Проверьте status и найдите строковые значения в response.args.",
                        ],
                        "code": '{"args": {"is_done": "false", "limit": "2"}}',
                        "checks": [
                            "Обе пары находятся в query, а не в body.",
                            "Ответ подтверждает только то, что Echo получил параметры.",
                        ],
                    },
                },
                {
                    "title": "Проверьте POST с JSON body",
                    "task": (
                        "Добавьте POST на `{{base_url}}/post` и отправьте JSON с полями `title` и `priority`. "
                        "В response проверьте status и объект `json`, затем объясните, что Echo сделал с данными."
                    ),
                    "requirements": [
                        "Body отправлен как raw JSON с Content-Type application/json.",
                        "В response.json отражены title и числовой priority.",
                        "Status 200 не трактуется как создание или сохранение Task в Planner.",
                    ],
                    "hint": "Сравните тип priority в body и response. Кавычки меняют число на строку.",
                    "answer": {
                        "explanation": (
                            "Echo возвращает отправленный JSON внутри поля json. Он не вызывает PlannerService и не "
                            "записывает задачу в файл. Поэтому его status относится только к учебному endpoint."
                        ),
                        "steps": [
                            "Создайте POST request на {{base_url}}/post.",
                            "В Body выберите raw и формат JSON, затем отправьте объект с текстовым title и числовым priority.",
                            "Проверьте status 200 и сравните поля внутри response.json с отправленным объектом.",
                        ],
                        "code": '{"title": "Изучить HTTP", "priority": 4}',
                        "checks": [
                            "Заголовок Content-Type указывает на JSON.",
                            "priority остался числом, не строкой.",
                            "Вывод ограничен Echo: задача Planner не создана.",
                        ],
                    },
                },
                {
                    "title": "Сохраните и экспортируйте сценарии",
                    "task": (
                        "Сохраните оба request в collection, повторно отправьте их из неё и экспортируйте collection "
                        "и environment в подготовленную папку `postman/` проекта Planner."
                    ),
                    "requirements": [
                        "Оба запроса можно повторно открыть и отправить без ручного восстановления Params и body.",
                        "Collection и environment экспортированы раздельными JSON-файлами в Planner/postman/.",
                        "Экспорт содержит только учебные данные, без паролей, токенов и персональных данных.",
                    ],
                    "hint": "Проверьте, что request сохранён именно в collection, а Echo выбран активным перед повторной отправкой.",
                    "answer": {
                        "explanation": (
                            "Открытое окно может содержать несохранённые изменения. Collection фиксирует сами запросы, "
                            "а отдельный export environment сохраняет адрес, на который они рассчитаны."
                        ),
                        "steps": [
                            "Сохраните GET и POST в Planner HTTP Lab.",
                            "Откройте их из collection и повторите отправку.",
                            "Экспортируйте collection в формате JSON и отдельно экспортируйте environment Echo.",
                            "Положите оба файла в postman/ внутри существующего Planner и проверьте их содержимое.",
                        ],
                        "code": (
                            "Planner/postman/\n"
                            "├── planner-http-lab.postman_collection.json\n"
                            "└── echo.postman_environment.json"
                        ),
                        "checks": [
                            "В collection сохранены GET и POST с их параметрами и body.",
                            "В environment сохранён base_url Echo.",
                            "Оба запроса повторяются из сохранённой collection.",
                        ],
                    },
                },
            ],
            "result": (
                "В папке postman существующего Planner лежат экспортированные collection и environment. "
                "Оба запроса повторно отправляются, а ответ Echo подтверждает переданные query и JSON, но не создание задачи Planner."
            ),
        }
    ],

    52: [
        {
            'title': 'Добавьте HTTP-вход к существующему Planner',
            'task': 'Продолжите проект, в котором уже работают CLI, модель, сервис и JSON-хранилище. Добавьте FastAPI рядом с прежним кодом и проверьте первый HTTP-маршрут. Не создавайте вторую копию Planner.',
            'tasks': [
                {
                    'title': 'Подключите FastAPI и Uvicorn',
                    'task': 'Установите FastAPI и Uvicorn в существующее окружение проекта. Запишите обе зависимости в requirements.txt в корне; если файла ещё нет, создайте его, не теряя остальные зависимости.',
                    'requirements': [
                        'FastAPI и Uvicorn доступны через выбранный Python проекта.',
                        'В requirements.txt записаны обе зависимости.'
                    ],
                    'hint': 'Запускайте pip через тот же интерпретатор, которым будете запускать Uvicorn. Команда python -m pip помогает сохранить эту связь.',
                    'answer': {
                        'explanation': 'Окружение проекта хранит его установленные библиотеки, а requirements.txt перечисляет, что нужно установить заново. Не создавайте новое окружение, если у проекта уже есть настроенное.',
                        'steps': [
                            'Активируйте прежнее окружение Planner.',
                            'Установите пакеты через выбранный Python.',
                            'Проверьте корень проекта. Создайте requirements.txt, если его пока нет; иначе сохраните текущие строки и добавьте fastapi и uvicorn.'
                        ],
                        'code': '''python -m pip install fastapi uvicorn
python -m pip show fastapi uvicorn

# В корневом requirements.txt:
fastapi
uvicorn''',
                        'checks': [
                            'Команда python -m pip show находит оба пакета.',
                            'Зависимости записаны в requirements.txt в корне проекта; прежние зависимости сохранены.'
                        ]
                    }
                },
                {
                    'title': 'Добавьте отдельный модуль API',
                    'task': 'Создайте app/api.py с объектом FastAPI и маршрутом GET /health. Он возвращает {"status": "ok"} и не обращается к задачам. Оставьте app/main.py и прежний запуск CLI без изменений.',
                    'requirements': [
                        'Объект FastAPI находится в app/api.py и называется app.',
                        'GET /health возвращает словарь с полем status и значением ok.',
                        'Маршрут не читает и не меняет данные Planner.'
                    ],
                    'hint': 'Используйте декоратор FastAPI для пары GET и /health. Функция под ним должна вернуть обычный Python-словарь.',
                    'answer': {
                        'explanation': 'app/api.py становится сетевой точкой входа, а app/main.py продолжает запускать CLI. FastAPI преобразует возвращённый словарь в JSON; отдельный сервер пока запускает Uvicorn.',
                        'steps': [
                            'Добавьте новый файл app/api.py рядом с app/main.py.',
                            'Создайте объект FastAPI с названием Planner API.',
                            'Зарегистрируйте GET /health и верните status со значением ok.'
                        ],
                        'code': '''# app/api.py
from fastapi import FastAPI

app = FastAPI(title="Planner API")

@app.get("/health")
def health():
    return {"status": "ok"}''',
                        'checks': [
                            'Файл app/main.py не заменён.',
                            'Импорт app.api создаёт приложение, но не запускает CLI.',
                            'GET /health не подключает PlannerService или JSON-хранилище.'
                        ]
                    }
                },
                {
                    'title': 'Запустите сервер и проверьте ответ',
                    'task': 'Из корня существующего проекта запустите Uvicorn для app.api:app. Пока процесс работает, проверьте GET /health в браузере и в Swagger UI.',
                    'requirements': [
                        'GET /health возвращает статус 200 и JSON {"status": "ok"}.',
                        'В /docs виден GET /health, а пробный запрос возвращает тот же ответ.',
                        'В /openapi.json маршрут /health записан для метода get.'
                    ],
                    'hint': 'Разделите import string по двоеточию. Слева находится модуль, справа имя объекта в этом модуле. Команду выполняйте там, где Python видит пакет app.',
                    'answer': {
                        'explanation': 'Uvicorn импортирует модуль и объект, затем начинает принимать соединения. /health проверяет ответ приложения, /docs показывает зарегистрированный контракт, а /openapi.json позволяет увидеть его данные.',
                        'steps': [
                            'Откройте терминал в корне Planner и активируйте его прежнее окружение.',
                            'Запустите команду Uvicorn и оставьте сервер работающим.',
                            'Откройте /health и сравните статус и JSON с ожидаемыми.',
                            'Откройте /docs, выполните GET /health через Try it out и Execute.',
                            'В /openapi.json найдите GET-операцию для /health.'
                        ],
                        'code': '''python -m uvicorn app.api:app --reload

http://127.0.0.1:8000/health
http://127.0.0.1:8000/docs
http://127.0.0.1:8000/openapi.json''',
                        'checks': [
                            'Uvicorn запущен из корня проекта.',
                            'Прямой и Swagger-запросы вернули ожидаемый ответ.',
                            'Пока сервер работает, терминал с Uvicorn остаётся занят.'
                        ]
                    }
                },
                {
                    'title': 'Сверьте API с клиентом и прежним CLI',
                    'task': 'Сохраните GET /health в отдельной collection Planner API с окружением Local. Проверьте неизвестный path и неподдерживаемый метод, затем остановите сервер и запустите прежний CLI.',
                    'requirements': [
                        'В Postman запрос использует base_url=http://127.0.0.1:8000 и path /health; Echo-настройки не изменены.',
                        'GET /unknown возвращает 404, а POST /health возвращает 405.',
                        'После остановки Uvicorn прежняя команда python -m app.main запускает CLI.'
                    ],
                    'hint': 'Если клиент показывает HTTP-статус, сервер уже ответил. Ошибка импорта или подключения возникает раньше. Для Local создайте отдельное окружение, не меняя Echo environment.',
                    'answer': {
                        'explanation': 'Collection сохраняет запрос, а environment подставляет локальный адрес. 404 означает, что path не зарегистрирован; 405 означает, что path есть, но для него не зарегистрирован POST. Запуск прежней CLI-команды проверяет, что новый API-модуль не вытеснил старую точку входа.',
                        'steps': [
                            'В Postman создайте Planner API collection и запрос GET {{base_url}}/health.',
                            'Создайте Local environment с base_url=http://127.0.0.1:8000 и выберите его.',
                            'Отправьте запрос и сохраните его в collection.',
                            'Откройте GET /unknown и отправьте POST на /health, пока Uvicorn работает.',
                            'Нажмите Ctrl+C в терминале сервера, затем выполните python -m app.main из корня проекта.'
                        ],
                        'code': '''Local environment:
base_url = http://127.0.0.1:8000

Saved request:
GET {{base_url}}/health

GET /unknown  → 404
POST /health  → 405''',
                        'checks': [
                            'Planner API использует отдельное Local environment.',
                            '404 и 405 получены от работающего сервера.',
                            'Команда прежнего CLI остаётся доступной.'
                        ]
                    }
                }
            ],
            'result': 'В существующем Planner отдельно работают прежний CLI и новый API: GET /health возвращает ожидаемый ответ, а клиент и Swagger показывают зарегистрированный маршрут.'
        }
    ],
    53: [
        {
            'title': 'Подключите чтение Planner к FastAPI',
            'task': 'Продолжите существующий Persistent Planner: задачи уже проходят через PlannerService и сохраняются JsonStorage. Сначала подготовьте реальные данные через CLI, затем добавьте в app/api.py GET /tasks и GET /stats поверх того же проекта. Не создавайте отдельный список задач или новое хранилище.',
            'tasks': [
                {
                    'title': 'Подготовьте рабочие данные через CLI',
                    'task': 'Добавьте задачи в рабочий JSON обычными операциями CLI и завершите часть из них. Сохраните фактический список, id и статистику, чтобы позже сверить ответы API.',
                    'requirements': [
                        'Используйте существующий CLI и настроенный им data/tasks.json; не создавайте учебный JSON рядом.',
                        'Подготовьте как минимум две открытые и одну завершённую задачу, не удаляя существующие записи.',
                        'Получите list и stats через CLI, затем перезапустите CLI и убедитесь, что данные читаются снова.',
                        'Не редактируйте файл руками и не подставляйте заранее заданные id или счётчики.'
                    ],
                    'hint': 'Сначала проверьте, что именно показывает CLI до изменений. Добавляйте нужные задачи его обычными операциями, а после команды done снова запросите list и stats.',
                    'answer': {
                        'explanation': 'CLI и Uvicorn не разделяют оперативную память. Сохранённый JSON связывает два процесса: CLI записывает задачи через готовые service и storage, а отдельный запуск снова читает их. Фактические id и числа зависят от уже существующего файла.',
                        'steps': [
                            'Запустите CLI из корня существующего проекта и получите исходные list и stats.',
                            'Добавьте несколько учебных задач через add, чтобы после завершения части остались открытые задачи.',
                            'Через done завершите хотя бы одну из подготовленных или уже существующих задач.',
                            'Снова запросите list и stats и запишите реальные id и значения.',
                            'Закройте CLI, запустите его заново и проверьте, что список и статистика сохранились.'
                        ],
                        'checks': [
                            'В списке есть как минимум две открытые и одна завершённая задача.',
                            'id и статистика взяты из фактического вывода CLI.',
                            'Повторный запуск CLI показывает сохранённое состояние.',
                            'Рабочий JSON не заменён ручным примером или отдельным seed-файлом.'
                        ]
                    }
                },
                {
                    'title': 'Добавьте GET /tasks и GET /stats',
                    'task': 'В app/api.py подключите готовый PlannerService и добавьте два маршрута чтения. Список должен содержать реальные задачи из подготовленного файла, а сводка должна использовать готовый подсчёт сервиса.',
                    'requirements': [
                        'Сохраните GET /health и используйте готовый build_service в app.state.planner.',
                        'GET /tasks вызывает list_tasks и возвращает для каждой Task только id, title, priority и is_done.',
                        'GET /stats вызывает get_statistics; поле all становится total, а open и done сохраняют значения сервиса.',
                        'Сохраните запросы Planner отдельно от Echo, сверьте ответы с CLI и убедитесь, что чтение не изменило JSON.'
                    ],
                    'hint': 'Маршруты должны каждый раз обращаться к сервису, а не к списку, загруженному при импорте app.api. Для ответа GET /stats достаточно преобразовать имена полей готового словаря.',
                    'answer': {
                        'explanation': 'app.state хранит сервис приложения, а не задачи. Вызов list_tasks внутри запроса получает актуальное состояние через настроенный JsonStorage. Явная проекция не раскрывает tags, а get_statistics сохраняет единственную реализацию подсчёта.',
                        'steps': [
                            'Импортируйте build_service из app.main и сохраните собранный PlannerService в app.state.planner рядом с созданием FastAPI app.',
                            'Добавьте GET /tasks. Внутри обработчика вызовите app.state.planner.list_tasks и соберите список словарей с четырьмя публичными полями.',
                            'Добавьте GET /stats. Вызовите app.state.planner.get_statistics и верните его значения под ключами total, open и done.',
                            'Запустите Uvicorn, выполните оба запроса через Swagger UI или Planner collection в Postman.',
                            'Сравните список и статистику с выводом CLI. Последовательно измените задачу через CLI, повторите GET, затем перезапустите API и проверьте сохранность.'
                        ],
                        'code': '''from app.main import build_service

app.state.planner = build_service()


@app.get("/tasks")
def get_tasks():
    tasks = app.state.planner.list_tasks()
    return [
        {
            "id": task.id,
            "title": task.title,
            "priority": task.priority,
            "is_done": task.is_done,
        }
        for task in tasks
    ]


@app.get("/stats")
def get_stats():
    statistics = app.state.planner.get_statistics()
    return {
        "total": statistics["all"],
        "open": statistics["open"],
        "done": statistics["done"],
    }''',
                        'checks': [
                            'GET /health продолжает отвечать.',
                            'GET /tasks возвращает JSON-массив реальных задач и не включает tags.',
                            'Значения GET /stats совпадают с CLI, но общее число называется total.',
                            'После последовательного изменения через CLI следующий GET показывает новое состояние.',
                            'После GET и перезапуска API рабочий JSON сохраняет прежние данные.'
                        ]
                    }
                }
            ],
            'result': 'GET /tasks и GET /stats показывают актуальные данные существующего Planner, а CLI и API продолжают использовать один рабочий JSON.'
        }
    ],
    54: [
        {
            'title': 'Подключите чтение одной Task к Planner API',
            'task': 'Продолжите существующий API, который уже читает список и статистику Planner. Добавьте получение одной задачи по id из адреса. Используйте те же данные и сервис, не создавайте отдельный поиск.',
            'tasks': [
                {
                    'title': 'Верните задачу по id',
                    'task': 'В app/api.py добавьте GET /tasks/{task_id}. Маршрут должен получить одну реальную задачу и вернуть её клиенту в публичном формате Planner.',
                    'requirements': [
                        'Объявите task_id как int и вызовите app.state.planner.get_task(task_id).',
                        'Верните только поля id, title, priority и is_done.',
                        'Проверьте запросом один id, который сейчас виден в GET /tasks.'
                    ],
                    'hint': 'Сервис уже ищет запись и использует настроенное хранилище. Маршруту остаётся связать path-параметр с этим вызовом и собрать знакомую проекцию ответа.',
                    'answer': {
                        'explanation': 'Path-параметр FastAPI передаёт в обработчик как целое число. Готовый PlannerService находит Task в источнике проекта, а маршрут возвращает только согласованные поля публичного ответа.',
                        'steps': [
                            'Откройте app/api.py и оставьте создание сервиса из предыдущего занятия в app.state.planner.',
                            'Объявите маршрут GET /tasks/{task_id} с аргументом task_id: int.',
                            'Вызовите app.state.planner.get_task(task_id), затем соберите словарь из четырёх публичных полей.',
                            'Запросите существующий id из GET /tasks и сравните ответ с соответствующей записью списка.'
                        ],
                        'code': '''@app.get("/tasks/{task_id}")
def read_task(task_id: int):
    task = app.state.planner.get_task(task_id)
    return {
        "id": task.id,
        "title": task.title,
        "priority": task.priority,
        "is_done": task.is_done,
    }''',
                        'checks': [
                            'Реальный id возвращает одну Task со статусом 200.',
                            'В JSON ровно четыре публичных поля, значения совпадают с GET /tasks.',
                            'Маршрут обращается к существующему сервису, а не к новому списку.'
                        ]
                    }
                },
                {
                    'title': 'Разделите отсутствие задачи и неверный тип',
                    'task': 'Обработайте отсутствие задачи с корректным числовым id и проверьте значение, которое нельзя разобрать как int. Убедитесь, что запросы только читают данные и сохраните их в прежней Planner collection.',
                    'requirements': [
                        'Переведите только TaskNotFoundError в HTTP 404 с detail Task not found.',
                        'Проверьте 404 на отсутствующем целом id и 422 на адресе с abc.',
                        'Сравните GET /tasks, stats и рабочий JSON до и после чтения.'
                    ],
                    'hint': 'Числовой id проверяется сервисом. Текст abc не проходит проверку FastAPI и не должен попадать в обработчик. Не перехватывайте общие исключения.',
                    'answer': {
                        'explanation': 'TaskNotFoundError означает, что тип id допустим, но записи нет, поэтому маршрут отвечает 404. Строка abc не становится int: FastAPI возвращает 422 до вызова read_task. Узкий except оставляет ошибки файла и программы видимыми, а не маскирует их как отсутствие ресурса.',
                        'steps': [
                            'Импортируйте HTTPException из FastAPI и используйте существующий TaskNotFoundError из модуля, где он уже объявлен. Не создавайте второй класс ошибки.',
                            'Оберните вызов get_task в try и ловите только TaskNotFoundError.',
                            'При исключении поднимите HTTPException со статусом 404 и detail Task not found.',
                            'Отправьте запрос с отсутствующим целым id, затем с abc. Проверьте соответственно 404 и 422.',
                            'Повторно запросите список и статистику, сравните рабочий JSON и сохраните сценарии в Planner collection.'
                        ],
                        'code': '''from fastapi import HTTPException


@app.get("/tasks/{task_id}")
def read_task(task_id: int):
    try:
        task = app.state.planner.get_task(task_id)
    except TaskNotFoundError as error:
        raise HTTPException(
            status_code=404,
            detail="Task not found",
        ) from error

    return {
        "id": task.id,
        "title": task.title,
        "priority": task.priority,
        "is_done": task.is_done,
    }''',
                        'checks': [
                            'Существующий id возвращает 200 и четыре публичных поля.',
                            'Отсутствующий числовой id возвращает 404 и detail Task not found.',
                            'Адрес с abc возвращает 422 до вызова обработчика.',
                            'GET /tasks, статистика, CLI и JSON сохраняют прежние данные.',
                            'Ошибки хранилища не преобразуются в 404.'
                        ]
                    }
                }
            ],
            'result': 'GET /tasks/{task_id} возвращает существующую Task; отсутствие даёт 404, неверный тип path-параметра даёт 422, данные Planner не меняются.'
        }
    ],
    55: [
        {
            'title': 'Добавьте выборку в существующий GET /tasks',
            'task': (
                'Расширьте Planner API: клиент должен фильтровать, сортировать и ограничивать реальный список задач. '
                'Используйте существующий PlannerService и сохранённый JSON.'
            ),
            'tasks': [
                {
                    'title': 'Добавьте выборку в PlannerService',
                    'task': (
                        'Создайте в существующем PlannerService метод select_tasks. Он должен подготовить список '
                        'через уже имеющийся list_tasks, не читая JSON самостоятельно.'
                    ),
                    'requirements': [
                        'is_done=None оставляет оба статуса, а True и False выбирают точные совпадения.',
                        'Сортируйте по id; limit применяйте после фильтра и сортировки. limit=None означает, что сервисный вызов не ограничивает список.',
                        'Не меняйте list_tasks, Task или данные в хранилище.',
                    ],
                    'hint': (
                        'Разделите операцию на короткие этапы. Сначала получите список через list_tasks, '
                        'затем при заданном is_done отберите совпадения, создайте отсортированный список '
                        'и только после этого примените срез, если limit не None.'
                    ),
                    'answer': {
                        'explanation': (
                            'PlannerService использует уже настроенное хранилище через list_tasks. Метод готовит '
                            'новый список результата и не сохраняет его. Проверка is_done is not None сохраняет '
                            'разницу между отсутствием фильтра и явным False. Сервисный limit по умолчанию None, '
                            'поскольку правило «по умолчанию десять» относится только к HTTP.'
                        ),
                        'steps': [
                            'Добавьте метод в существующий класс PlannerService.',
                            'Сначала вызовите self.list_tasks(). Не открывайте JSON из нового метода.',
                            'Если is_done не равен None, оставьте только Task с совпадающим task.is_done.',
                            'Вызовите sorted по task.id и передайте sort_desc в reverse.',
                            'Если limit задан, верните начало отсортированного списка. Если он None, верните весь отсортированный результат.',
                        ],
                        'code': '''def select_tasks(
    self,
    is_done: bool | None = None,
    sort_desc: bool = False,
    limit: int | None = None,
):
    tasks = self.list_tasks()

    if is_done is not None:
        tasks = [task for task in tasks if task.is_done == is_done]

    tasks = sorted(
        tasks,
        key=lambda task: task.id,
        reverse=sort_desc,
    )

    if limit is not None:
        tasks = tasks[:limit]

    return tasks''',
                        'checks': [
                            'is_done=None сохраняет оба статуса, а False и True фильтруют каждый свой статус.',
                            'Сортировка использует id, а заданный limit применяется после фильтра и сортировки.',
                            'Метод начинает чтение с list_tasks и не изменяет исходный список или файл.',
                        ],
                    },
                },
                {
                    'title': 'Подключите query к GET /tasks',
                    'task': (
                        'Расширьте существующий GET /tasks. Передайте разобранные query-параметры в select_tasks '
                        'и сохраните публичный формат ответа Planner.'
                    ),
                    'requirements': [
                        'Используйте is_done=None, sort_desc=False и HTTP limit=10 с диапазоном от 1 до 50.',
                        'Вызовите select_tasks из app.state.planner и верните только id, title, priority и is_done.',
                        'Не меняйте отдельный GET /tasks/{task_id} и GET /stats.',
                    ],
                    'hint': (
                        'Query объявляется в сигнатуре уже существующего endpoint. Для limit задайте Query(default=10, '
                        'ge=1, le=50); остальные значения имеют обычные типы и значения по умолчанию.'
                    ),
                    'answer': {
                        'explanation': (
                            'FastAPI преобразует query из текста в bool и int до входа в функцию маршрута. Query '
                            'задаёт HTTP-дефолт и границы limit. Endpoint передаёт валидированные значения сервису, '
                            'а затем строит тот же публичный ответ из четырёх полей.'
                        ),
                        'steps': [
                            'Импортируйте Query из fastapi, если его ещё нет в app/api.py.',
                            'Добавьте is_done, sort_desc и limit в сигнатуру существующего GET /tasks.',
                            'Вызовите app.state.planner.select_tasks с именованными аргументами.',
                            'Оставьте в JSON только id, title, priority и is_done для каждой Task.',
                        ],
                        'code': '''from fastapi import Query


@app.get("/tasks")
def get_tasks(
    is_done: bool | None = None,
    sort_desc: bool = False,
    limit: int = Query(default=10, ge=1, le=50),
):
    tasks = app.state.planner.select_tasks(
        is_done=is_done,
        sort_desc=sort_desc,
        limit=limit,
    )
    return [
        {
            "id": task.id,
            "title": task.title,
            "priority": task.priority,
            "is_done": task.is_done,
        }
        for task in tasks
    ]''',
                        'checks': [
                            'GET /tasks без query возвращает не больше десяти задач.',
                            'Ответ содержит только id, title, priority и is_done.',
                            'Невалидный query отклоняется FastAPI до вызова обработчика.',
                        ],
                    },
                },
                {
                    'title': 'Проверьте выборку и сохранность Planner',
                    'task': (
                        'Отправьте запросы к запущенному Planner API на фактических данных проекта. '
                        'Сверьте выдачу с CLI и общей статистикой.'
                    ),
                    'requirements': [
                        'Проверьте оба значения is_done, оба направления sort_desc и limit=1 и limit=50. Для проверки фильтра перед limit нужны как минимум две открытые задачи.',
                        'Проверьте limit=0, limit=-1, limit=51, limit=many и is_done=maybe: каждый запрос должен получить 422.',
                        'После запросов сравните CLI-list, GET одной задачи, GET /stats и JSON-файл с исходным состоянием.',
                    ],
                    'hint': (
                        'Сначала сохраните вывод CLI list и stats. Ожидаемые id не фиксированы: проверяйте порядок '
                        'относительно тех задач, которые реально есть. Для ошибки удобно временно поставить отметку '
                        'в первой строке обработчика и проверить, что запрос с 422 до неё не дошёл.'
                    ),
                    'answer': {
                        'explanation': (
                            'Здесь проверяется не заранее заданный список id, а правило выборки на данных конкретного '
                            'проекта. Для is_done=false результат содержит только открытые задачи; sort_desc меняет '
                            'порядок id, а limit берёт начало уже отфильтрованного и отсортированного списка. '
                            'Ошибочные значения останавливает FastAPI до сервисного вызова. GET не записывает результат.'
                        ),
                        'steps': [
                            'До запросов сохраните CLI list, stats, ответ GET /tasks/{existing_id} и рабочий JSON. Убедитесь, что открытых задач как минимум две.',
                            'Сравните GET /tasks?is_done=false с открытыми записями CLI, затем повторите с is_done=true.',
                            'Для одного и того же статуса проверьте sort_desc=false и sort_desc=true. В первом случае id идут по возрастанию, во втором по убыванию.',
                            'Проверьте limit=1 и limit=50. При limit=1 должен остаться первый элемент уже выбранного порядка, а не первый элемент исходного файла.',
                            'Отправьте запросы с limit=0, limit=-1, limit=51, limit=many и is_done=maybe. FastAPI должен вернуть 422 до входа в функцию маршрута.',
                            'Повторно получите CLI list, GET той же задачи, GET /stats и JSON. Сравните их с сохранённым состоянием до запросов.',
                        ],
                        'code': '''# Примеры запросов. id и фактическое число задач зависят от вашего JSON.
GET /tasks?is_done=false&sort_desc=false&limit=1
GET /tasks?is_done=true&sort_desc=true&limit=50

# Эти параметры должны завершиться ответом 422
GET /tasks?limit=0
GET /tasks?limit=-1
GET /tasks?limit=51
GET /tasks?limit=many
GET /tasks?is_done=maybe''',
                        'checks': [
                            'Открытый и завершённый фильтры совпадают с актуальным CLI-list.',
                            'sort_desc меняет направление id, а limit применяется к началу уже подготовленной выборки.',
                            'Все пять невалидных запросов получают 422 до вызова маршрута.',
                            'Полный CLI-list, ранее выбранная Task, GET /stats и рабочий JSON не изменились после запросов.',
                        ],
                    },
                },
            ],
            'result': (
                'Выборку можно проверить по ответу GET /tasks: фильтр и порядок соответствуют query, limit '
                'действует после них, а полный список, статистика и JSON Planner остались прежними.'
            ),
        },
    ],
    56: [
        {
            'title': 'Создайте задачу через настоящий POST /tasks',
            'task': 'Продолжите Planner API, который уже читает задачи через сервис и общий JSON. Добавьте входную модель, затем подключите её к маршруту создания. Клиент передаёт название и приоритет, а сервер назначает остальные поля.',
            'tasks': [
                {
                    'title': 'Опишите вход TaskCreate',
                    'task': 'В app/api.py объявите Pydantic-модель TaskCreate для данных новой задачи. Клиент сообщает title и priority; постоянный id и начальное состояние назначает Planner.',
                    'requirements': [
                        'Оба поля обязательные: title: str и priority: int.',
                        'Не добавляйте id, is_done, Field или новые ограничения.'
                    ],
                    'hint': 'У обязательного поля нет значения по умолчанию. Схема создания описывает только сведения, которые клиент сообщает о новой задаче.',
                    'answer': {
                        'explanation': 'TaskCreate является входной формой API, а не заменой предметной Task. В ней только title и priority. Серверные id и is_done остаются за существующим PlannerService.',
                        'steps': [
                            'Импортируйте BaseModel из pydantic в app/api.py.',
                            'Объявите TaskCreate до функции маршрута.',
                            'Оставьте у title и priority аннотации типов без значений по умолчанию.'
                        ],
                        'code': '''from pydantic import BaseModel


class TaskCreate(BaseModel):
    title: str
    priority: int''',
                        'checks': [
                            'Оба поля обязательны.',
                            'Входная схема не содержит id и is_done.'
                        ]
                    }
                },
                {
                    'title': 'Подключите POST к существующему сервису',
                    'task': 'Добавьте POST /tasks в app/api.py. Передайте title и priority в app.state.planner.add_task, а клиенту верните созданную задачу с публичными полями и статусом 201.',
                    'requirements': [
                        'Сохраните задачу через существующий PlannerService, не создавайте отдельный список и не вызывайте JsonStorage.save из маршрута.',
                        'Переведите только ожидаемый ValueError от add_task в HTTP 422; ошибки хранилища не маскируйте.'
                    ],
                    'hint': 'Сначала вызовите add_task и получите готовую Task. Только после успешного возврата собирайте ответ с серверными id и is_done.',
                    'answer': {
                        'explanation': 'Сервис применяет правила модели Task и сохраняет её через настроенный JsonStorage. Поэтому ответ 201 отправляется после реального создания, а обработчик не дублирует логику и не пишет в файл сам.',
                        'steps': [
                            'Импортируйте HTTPException и status из fastapi.',
                            'Объявите маршрут с payload: TaskCreate и статусом 201.',
                            'В try вызовите app.state.planner.add_task(payload.title, priority=payload.priority).',
                            'Перехватите ValueError рядом с этим вызовом и верните HTTP 422.',
                            'Верните id, title, priority и is_done из созданной Task.'
                        ],
                        'code': '''from fastapi import HTTPException, status


@app.post("/tasks", status_code=status.HTTP_201_CREATED)
def create_task(payload: TaskCreate):
    try:
        task = app.state.planner.add_task(
            payload.title,
            priority=payload.priority,
        )
    except ValueError as error:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=str(error),
        ) from error

    return {
        "id": task.id,
        "title": task.title,
        "priority": task.priority,
        "is_done": task.is_done,
    }''',
                        'checks': [
                            'Параметр payload: TaskCreate связывает JSON body с моделью.',
                            'Успешный вызов сервиса возвращает публичную Task со статусом 201.',
                            'Ожидаемый ValueError даёт 422, а прочие ошибки не поглощаются.'
                        ]
                    }
                },
                {
                    'title': 'Проверьте создание и оба уровня отказа',
                    'task': 'В /docs проверьте схему и отправьте POST из Planner collection. Повторная отправка должна создать ещё одну задачу с новым серверным id, а не вернуть старый ответ. Проверьте ошибки входа и убедитесь, что после отказа JSON не изменился.',
                    'requirements': [
                        'Сверьте созданную запись через GET /tasks, GET по id, статистику, CLI и после перезапуска API.',
                        'Проверьте отсутствие priority, priority="высокий", пробельный title и priority за пределами 1–5.',
                        'Передайте дополнительные поля {"id": 999, "is_done": true} и убедитесь, что серверные значения назначает Planner; не требуйте отклонять лишние поля.'
                    ],
                    'hint': 'Разделите ошибки по месту: FastAPI отклоняет недостающие или неразбираемые поля до маршрута, а правила Task срабатывают внутри add_task.',
                    'answer': {
                        'explanation': 'Корректное тело проходит Pydantic, сервис создаёт и сохраняет Task, а API возвращает 201. Неверная форма даёт 422 до вызова функции. Пробельное название и приоритет вне 1–5 доходят до предметной модели, её ValueError маршрут переводит в 422. Во всех ошибочных случаях новая запись не появляется.',
                        'steps': [
                            'Откройте /docs, проверьте обязательные title и priority, затем сохраните POST /tasks в Planner collection.',
                            'Отправьте {"title": "Повторить HTTP", "priority": 4}. Ожидайте 201 и ответ с назначенными сервером id и is_done.',
                            'Отправьте тот же POST повторно. Он создаёт ещё одну запись с новым id, а не возвращает старую.',
                            'Передайте в body дополнительные {"id": 999, "is_done": true}. При стандартной конфигурации лишние поля не управляют Task: сервис назначает собственный id и начальное состояние.',
                            'Проверьте созданные id через GET /tasks/{task_id}, найдите задачи в GET /tasks и сверьте статистику с CLI.',
                            'Отправьте тело без priority и тело с priority="высокий". Оба запроса должны получить 422 до выполнения маршрута.',
                            'Отправьте title из пробелов и priority 0 или 6. Их отклонит правило модели Task через 422.',
                            'Убедитесь, что после ошибок список и JSON не изменились. Перезапустите API и найдите успешную запись снова.'
                        ],
                        'code': '''POST корректный body       → 201, новая Task
POST без priority          → 422 до обработчика
POST priority="высокий"    → 422 до обработчика
POST title из пробелов     → 422 от правила Task
POST priority=0 или 6      → 422 от правила Task
GET, CLI, перезапуск       → одна сохранённая Task''',
                        'checks': [
                            'Успешная запись видна через API и CLI после перезапуска.',
                            'Оба вида ошибки дают 422 по разным причинам.',
                            'Отказы не добавляют задачу и не меняют файл.'
                        ]
                    }
                }
            ],
            'result': 'POST /tasks создаёт и сохраняет Task через PlannerService, возвращает её с кодом 201, а оба уровня отказа дают 422 без новой записи.'
        }
    ],
}
