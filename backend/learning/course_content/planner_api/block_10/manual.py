"""Учебная практика блока. Редактируйте задания здесь."""

from __future__ import annotations

from typing import Any


MANUAL_PRACTICE: dict[int, list[dict[str, Any]]] = {
    51: [
        {
            "title": "Два запроса к Postman Echo",
            "task": (
                "Вместе проверим настоящие HTTP-сообщения через Postman, пока у Planner ещё нет собственного сервера. "
                "Сохраним GET с query и POST с JSON body в одной collection. Echo отразит переданные значения, "
                "а экспорт Postman окажется в уже существующем проекте Planner."
            ),
            "tasks": [
                {
                    "title": "Папка для экспорта",
                    "task": (
                        "В корне существующего проекта Planner появится папка `postman/` для экспортированных запросов "
                        "и окружения. Остальные файлы Planner остаются на своих местах."
                    ),
                    "requirements": [
                        "Папка postman/ находится внутри уже существующего проекта Planner.",
                        "Остальные файлы проекта остались на месте и не были перезаписаны.",
                    ],
                    "hint": "Найдём корень проекта по его исходникам и данным. Рядом с ними появится одна папка для экспорта.",
                    "answer": {
                        "explanation": (
                            "Postman-файлы должны сопровождать существующий Planner, а не изображать новый проект. "
                            "На этом шаге достаточно подготовить место для последующего экспорта."
                        ),
                        "steps": [
                            "Найдём корневую папку уже созданного Planner.",
                            "Создадим в ней новую папку postman.",
                            "Проверим, что прежние файлы приложения, CLI и данных не изменились.",
                        ],
                        "code": "Planner/\n├── прежние файлы проекта\n└── postman/",
                        "checks": [
                            "Новая папка находится в корне Planner.",
                            "Для практики не создана копия приложения.",
                        ],
                    },
                },
                {
                    "title": "Collection и Echo environment",
                    "task": (
                        "Войдём в workspace Postman, то есть рабочее пространство аккаунта: сохранённые collections и environments "
                        "доступны там, а lightweight API Client подходит только для отправки запросов. В боковой панели откроем "
                        "Collections, нажмём + → Collection и зададим имя `Planner HTTP Lab`. Запросы добавим и сохраним в неё "
                        "на следующих шагах, когда их method, URL и данные уже будут заданы. "
                        "Environment `Echo` создадим через + в боковой панели → Environments или через селектор окружения сверху справа. "
                        "Добавим `base_url=https://postman-echo.com` и выберем Echo активным."
                    ),
                    "requirements": [
                        "Для создания и сохранения collection выполнен вход в Postman.",
                        "Переменная base_url содержит только базовый адрес Echo, без /get или /post.",
                        "Environment Echo выбран активным; пароли и токены не добавлены.",
                    ],
                    "hint": "Сейчас подготовим место для сценариев и базовый адрес. GET и POST сохраним в уже созданную collection после настройки каждого запроса.",
                    "answer": {
                        "explanation": (
                            "Запросы и адрес назначения меняются независимо. Collection сохраняет сценарии, а environment "
                            "позволяет переиспользовать базовый адрес со схемой и host. Echo не требует данных для входа."
                        ),
                        "steps": [
                            "Войдём в Postman account и workspace. В боковой панели выберем Collections → + → Collection и зададим имя Planner HTTP Lab.",
                            "Через + → Environments или + в селекторе сверху справа создадим environment Echo и добавим base_url со значением https://postman-echo.com.",
                            "Выберем Echo активным. На следующих шагах подставим base_url в уже настроенные GET и POST запросы.",
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
                    "title": "GET с query",
                    "task": (
                        "Настроим GET на `{{base_url}}/get`, передадим через Params пары `is_done=false` и `limit=2`, "
                        "сохраним готовый запрос в уже существующую collection `Planner HTTP Lab`, затем отправим его и найдём обе пары в response.args."
                    ),
                    "requirements": [
                        "Response содержит status 200 и обе переданные пары в args.",
                        "Значения false и 2 показаны как строки.",
                        "Результат не называется фильтрацией Planner: запрос получил Echo.",
                    ],
                    "hint": "Сначала отправим запрос. В body найдём args и сравним полученные значения с Params.",
                    "answer": {
                        "explanation": (
                            "GET отправляет параметры в URL. Echo отражает их в args как текст и не имеет списка Planner, "
                            "который можно было бы фильтровать."
                        ),
                        "steps": [
                            "Создадим HTTP request с методом GET и URL {{base_url}}/get.",
                            "Добавим обе пары во вкладке Params, нажмём Save и выберем существующую Planner HTTP Lab. Не выбираем New Collection.",
                            "Отправим сохранённый request.",
                            "Проверим status и найдём строковые значения в response.args.",
                        ],
                        "code": '{"args": {"is_done": "false", "limit": "2"}}',
                        "checks": [
                            "Обе пары находятся в query, а не в body.",
                            "Ответ подтверждает только то, что Echo получил параметры.",
                        ],
                    },
                },
                {
                    "title": "POST с JSON body",
                    "task": (
                        "Добавим POST на `{{base_url}}/post` и отправим JSON с полями `title` и `priority`. "
                        "Сохраним его в ту же collection `Planner HTTP Lab`. В response проверим status и объект `json`, "
                        "затем объясним, что Echo сделал с данными."
                    ),
                    "requirements": [
                        "Body отправлен как raw JSON с Content-Type application/json.",
                        "В response.json отражены title и числовой priority.",
                        "Status 200 не трактуется как создание или сохранение Task в Planner.",
                    ],
                    "hint": "Сравним тип priority в body и response. Кавычки меняют число на строку.",
                    "answer": {
                        "explanation": (
                            "Echo возвращает отправленный JSON внутри поля json. Он не вызывает PlannerService и не "
                            "записывает задачу в файл. Поэтому его status относится только к учебному endpoint."
                        ),
                        "steps": [
                            "Создадим POST request на {{base_url}}/post.",
                            "В Body выберем raw и формат JSON, зададим текстовый title и числовой priority, нажмём Save и выберем существующую Planner HTTP Lab.",
                            "Отправим сохранённый request.",
                            "Проверим status 200 и сравним поля внутри response.json с отправленным объектом.",
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
                    "title": "Экспортируем и восстановим сценарии",
                    "task": (
                        "Проверим, что оба request уже находятся в Planner HTTP Lab, повторно отправим их оттуда, экспортируем collection и environment "
                        "в папку `postman/` проекта Planner, затем импортируем оба файла обратно в Postman."
                    ),
                    "requirements": [
                        "Оба запроса можно повторно открыть и отправить без ручного восстановления Params и body.",
                        "Collection и environment экспортированы раздельными JSON-файлами в Planner/postman/.",
                        "После импорта collection снова содержит оба запроса, а активное environment подставляет base_url.",
                        "Экспорт содержит только учебные данные, без паролей, токенов и персональных данных.",
                    ],
                    "hint": "Проверим, что request сохранён именно в collection, а Echo активен. После экспорта загрузим оба JSON через Use resources or import → Import.",
                    "answer": {
                        "explanation": (
                            "Открытое окно может содержать несохранённые изменения. Collection фиксирует сами запросы, "
                            "а отдельный export environment сохраняет адрес, на который они рассчитаны."
                        ),
                        "steps": [
                            "Откроем GET и POST из существующей Planner HTTP Lab и проверим, что оба запроса сохранены там.",
                            "Повторно отправим оба запроса из collection.",
                            "В Collections выберем More → Export collection → Export JSON. В Environments отдельно экспортируем Echo.",
                            "Поместим два файла в postman/ внутри существующего Planner.",
                            "В Postman выберем Use resources or import → Import и загрузим оба JSON-файла.",
                            "Откроем импортированную collection, проверим два запроса, выберем Echo активным и проверим подстановку base_url. Затем повторим GET и POST.",
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
                "После импорта оба запроса открываются и используют активный base_url. Ответ Echo подтверждает переданные query и JSON, но не создание задачи Planner."
            ),
        }
    ],

    52: [
        {
            'title': 'Добавим HTTP-вход к существующему Planner',
            'task': 'Продолжим проект, в котором уже работают CLI, модель, сервис и JSON-хранилище. Добавим FastAPI рядом с прежним кодом и проверим первый HTTP-маршрут. Не создаём вторую копию Planner.',
            'tasks': [
                {
                    'title': 'Подключим FastAPI и Uvicorn',
                    'task': 'Установим FastAPI и Uvicorn в существующее окружение проекта. Запишем обе зависимости в requirements.txt в корне; если файла ещё нет, создадим его, не теряя остальные зависимости.',
                    'requirements': [
                        'FastAPI и Uvicorn доступны через выбранный Python проекта.',
                        'В requirements.txt записаны обе зависимости.'
                    ],
                    'hint': 'Запускаем pip через тот же интерпретатор, которым будем запускать Uvicorn. Команда python -m pip помогает сохранить эту связь.',
                    'answer': {
                        'explanation': 'Окружение проекта хранит его установленные библиотеки, а requirements.txt перечисляет, что нужно установить заново. Не создаём новое окружение, если у проекта уже есть настроенное.',
                        'steps': [
                            'Активируем прежнее окружение Planner.',
                            'Проверим корень проекта. Создадим requirements.txt, если его пока нет; иначе сохраним текущие строки и добавим fastapi и uvicorn.',
                            'Установим перечисленные зависимости через выбранный Python и проверим, что оба пакета доступны.'
                        ],
                        'code': '''# В корневом requirements.txt:
fastapi
uvicorn

# В терминале из активного окружения:
python -m pip install -r requirements.txt
python -m pip show fastapi uvicorn''',
                        'checks': [
                            'Команда python -m pip show находит оба пакета.',
                            'Зависимости записаны в requirements.txt в корне проекта; прежние зависимости сохранены.'
                        ]
                    }
                },
                {
                    'title': 'Добавим отдельный модуль API',
                    'task': 'Создадим app/api.py с объектом FastAPI и маршрутом GET /health. Он возвращает {"status": "ok"} и не обращается к задачам. Оставим app/main.py и прежний запуск CLI без изменений.',
                    'requirements': [
                        'Объект FastAPI находится в app/api.py и называется app.',
                        'GET /health возвращает словарь с полем status и значением ok.',
                        'Маршрут не читает и не меняет данные Planner.'
                    ],
                    'hint': 'Используем декоратор FastAPI для пары GET и /health. Функция под ним должна вернуть обычный Python-словарь.',
                    'answer': {
                        'explanation': 'app/api.py становится сетевой точкой входа, а app/main.py продолжает запускать CLI. FastAPI преобразует возвращённый словарь в JSON; отдельный сервер пока запускает Uvicorn.',
                        'steps': [
                            'Добавим новый файл app/api.py рядом с app/main.py.',
                            'Создадим объект FastAPI с названием Planner API.',
                            'Зарегистрируем GET /health и вернём status со значением ok.'
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
                    'title': 'Запустим сервер и проверим ответ',
                    'task': 'Из корня существующего проекта запустим Uvicorn для app.api:app. В браузере проверим JSON-тело GET /health, а HTTP-статус посмотрим в Swagger UI.',
                    'requirements': [
                        'Браузер показывает JSON {"status": "ok"} для GET /health.',
                        'В /docs пробный запрос показывает статус 200 и то же JSON-тело.',
                        'В /openapi.json маршрут /health записан для метода get.'
                    ],
                    'hint': 'Разберём import string по двоеточию: слева находится модуль, справа имя объекта в этом модуле. Команду выполняем там, где Python видит пакет app.',
                    'answer': {
                        'explanation': 'Uvicorn импортирует модуль и объект, затем начинает принимать соединения. /health проверяет ответ приложения, /docs показывает зарегистрированный контракт, а /openapi.json позволяет увидеть его данные.',
                        'steps': [
                            'Откроем терминал в корне Planner и активируем его прежнее окружение.',
                            'Запустим команду Uvicorn и оставим сервер работающим.',
                            'Откроем /health в браузере и сверим показанный JSON.',
                            'В /docs нажмём Try it out, затем Execute. Проверим статус 200 и JSON в результате.',
                            'В /openapi.json найдём GET-операцию для /health.'
                        ],
                        'code': '''python -m uvicorn app.api:app --reload

http://127.0.0.1:8000/health
http://127.0.0.1:8000/docs
http://127.0.0.1:8000/openapi.json''',
                        'checks': [
                            'Uvicorn запущен из корня проекта.',
                            'Браузер подтвердил тело ответа, а Swagger UI показал статус 200 и то же тело.',
                            'Пока сервер работает, терминал с Uvicorn остаётся занят.'
                        ]
                    }
                },
                {
                    'title': 'Сверим API с клиентом',
                    'task': 'Сохраним GET /health в отдельной collection Planner API с окружением Local. Проверим неизвестный path и неподдерживаемый метод, затем остановим сервер.',
                    'requirements': [
                        'В Postman запрос использует base_url=http://127.0.0.1:8000 и path /health; Echo-настройки не изменены.',
                        'GET /unknown возвращает 404, а POST /health возвращает 405 от работающего сервера.'
                    ],
                    'hint': 'Для Local используем отдельное окружение и не меняем Echo environment. Статус читаем в ответе Postman, а не по виду страницы браузера.',
                    'answer': {
                        'explanation': 'Collection сохраняет запрос, а environment подставляет локальный адрес. 404 означает, что path не зарегистрирован; 405 означает, что path есть, но для него не зарегистрирован POST.',
                        'steps': [
                            'В Postman создадим Planner API collection и запрос GET {{base_url}}/health.',
                            'Создадим Local environment с base_url=http://127.0.0.1:8000 и выберем его.',
                            'Отправим запрос и сохраним его в collection.',
                            'Откроем GET /unknown и отправим POST на /health, пока Uvicorn работает.',
                            'Нажмём Ctrl+C в терминале сервера.'
                        ],
                        'code': '''Local environment:
base_url = http://127.0.0.1:8000

Saved request:
GET {{base_url}}/health

GET /unknown  → 404
POST /health  → 405''',
                        'checks': [
                            'Planner API использует отдельное Local environment.',
                            '404 и 405 получены от работающего сервера.'
                        ]
                    }
                },
                {
                    'title': 'Проверим безопасный импорт app.main',
                    'task': 'Убедимся, что следующий модуль сможет импортировать build_service из app.main, не запуская CLI. Затем отдельно запустим прежнюю команду Planner.',
                    'requirements': [
                        'Команда python -c "import app.main; print(\'import ok\')" завершается и выводит import ok без меню и ожидания ввода.',
                        'Команда python -m app.main по-прежнему запускает CLI.'
                    ],
                    'hint': 'Если импорт сам запускает меню, CLI-вызов должен находиться под if __name__ == "__main__". При импорте имя модуля — app.main, при прямом запуске — __main__.',
                    'answer': {
                        'explanation': 'Python выполняет верхнеуровневые инструкции при импорте. Guard оставляет вызов main() только для прямого запуска, поэтому импорт app.main не ждёт пользовательский ввод и позволяет получить build_service для нового модуля.',
                        'steps': [
                            'Из корня проекта выполним python -c "import app.main; print(\'import ok\')". Ожидаем import ok и завершение команды без меню.',
                            'Если меню запускается при импорте, оставим определение main(), а её вызов поместим под if __name__ == "__main__".',
                            'Повторим импортную проверку, затем запустим CLI командой python -m app.main.'
                        ],
                        'code': '''# В app/main.py
if __name__ == "__main__":
    main()

# Проверки из корня проекта
python -c "import app.main; print('import ok')"
python -m app.main''',
                        'checks': [
                            'Импорт app.main не запускает меню и не ждёт ввода.',
                            'Прямой запуск app.main по-прежнему открывает CLI.'
                        ]
                    }
                }
            ],
            'result': 'В существующем Planner отдельно работают прежний CLI и новый API: GET /health возвращает ожидаемый JSON, Swagger показывает статус 200, а импорт app.main не запускает CLI.'
        }
    ],
    53: [
        {
            'title': 'Подключим чтение Planner к FastAPI',
            'task': 'Продолжим существующий Persistent Planner: задачи уже проходят через PlannerService и сохраняются JsonStorage. Сначала проверим в build_service, какой JsonStorage и путь использует CLI. Через этот же CLI подготовим реальные данные, затем добавим в app/api.py GET /tasks и GET /stats. Не создаём отдельный список задач или новое хранилище.',
            'tasks': [
                {
                    'title': 'Проверим путь и подготовим данные через CLI',
                    'task': 'Проследим в build_service, какой JsonStorage и путь настроены для CLI. Убедимся, что CLI получает сервис через эту фабрику. Затем добавим задачи и завершим часть из них обычными командами. Сохраним фактический список, id и статистику для сверки с API.',
                    'requirements': [
                        'Прослеживаем build_service() → JsonStorage → путь к JSON и фиксируем фактический файл, который использует CLI.',
                        'Через существующий CLI добавляем задачи и завершаем часть из них: остаются как минимум две открытые и одна завершённая задача. Существующие записи не удаляем, файл вручную не редактируем и id не задаём заранее.',
                        'Сверяем фактические list и stats, затем перезапускаем CLI и подтверждаем, что это состояние сохранилось.'
                    ],
                    'hint': 'В app/main.py проследим вызов build_service() до созданного JsonStorage и настройки пути файла. Сначала запишем исходные list и stats, затем добавим данные командами add и done.',
                    'answer': {
                        'explanation': 'CLI и Uvicorn не разделяют оперативную память. build_service() выбирает для проекта один настроенный JsonStorage; CLI и API не должны создавать отдельные пути к данным. CLI записывает задачи через готовые service и storage, а отдельный запуск снова читает их. Фактические id и числа зависят от текущего состояния файла.',
                        'steps': [
                            'От CLI проследим цепочку к build_service(), созданному JsonStorage и настройке пути. Запишем путь и подтвердим, что CLI получает сервис через эту фабрику.',
                            'Запустим CLI из корня существующего проекта и получим исходные list и stats.',
                            'Добавим несколько учебных задач через add, чтобы после завершения части остались открытые задачи.',
                            'Через done завершим хотя бы одну из подготовленных или уже существующих задач.',
                            'Снова запросим list и stats и запишем реальные id и значения.',
                            'Закроем CLI, запустим его заново и проверим, что список и статистика сохранились.'
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
                    'title': 'Добавим GET /tasks и GET /stats',
                    'task': 'В app/api.py подключим готовый PlannerService и добавим два маршрута чтения. GET /tasks должен показывать реальные данные из JsonStorage, путь к которому мы подтвердили по build_service, а GET /stats должен использовать готовый подсчёт сервиса. Оставив Uvicorn работать в одном терминале, во втором последовательно изменим данные через CLI. После завершения команды вызовем оба GET без перезапуска API; затем перезапустим Uvicorn и повторим оба запроса.',
                    'requirements': [
                        'Сохраним GET /health и используем готовый build_service в app.state.planner.',
                        'GET /tasks вызывает list_tasks и возвращает для каждой Task только id, title, priority и is_done.',
                        'GET /stats вызывает get_statistics; поле all становится total, а open и done сохраняют значения сервиса.',
                        'После последовательного изменения через CLI GET /tasks и GET /stats показывают новые данные без перезапуска Uvicorn.',
                        'После перезапуска Uvicorn оба маршрута по-прежнему показывают сохранённые данные; чтение не меняет JSON.',
                        'Сохраним запросы Planner отдельно от Echo и сверим список и статистику с CLI.'
                    ],
                    'hint': 'Маршруты должны каждый раз обращаться к сервису, а не к списку, загруженному при импорте app.api. Для ответа GET /stats достаточно преобразовать имена полей готового словаря.',
                    'answer': {
                        'explanation': 'app.state хранит сервис приложения, а не задачи. Вызов list_tasks внутри запроса получает актуальное состояние через настроенный JsonStorage. Явная проекция не раскрывает tags, а get_statistics сохраняет единственную реализацию подсчёта.',
                        'steps': [
                            'Импортируем build_service из app.main и сохраним собранный PlannerService в app.state.planner рядом с созданием FastAPI app.',
                            'Добавим GET /tasks. Внутри обработчика вызовем app.state.planner.list_tasks и соберём список словарей с четырьмя публичными полями.',
                            'Добавим GET /stats. Вызовем app.state.planner.get_statistics и вернём его значения под ключами total, open и done.',
                            'Запустим Uvicorn, выполним оба запроса через Swagger UI или Planner collection в Postman.',
                            'Сравним список и статистику с выводом CLI. Оставим Uvicorn работать в первом терминале, во втором запустим CLI и выполним изменение. После завершения команды, не перезапуская API, вызовем GET /tasks и GET /stats. Затем перезапустим Uvicorn и повторим оба запроса.'
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
                            'Оба GET после изменения через CLI показывают новое состояние без перезапуска Uvicorn.',
                            'Оба GET после перезапуска Uvicorn показывают сохранённые данные из рабочего JSON.',
                            'CLI и API изменяют данные последовательно, без параллельной записи.'
                        ]
                    }
                }
            ],
            'result': 'GET /tasks и GET /stats совпадают с CLI; изменение через CLI видно в обоих GET без перезапуска Uvicorn и сохраняется после нового запуска API.'
        }
    ],
    54: [
        {
            'title': 'Подключим чтение одной Task к Planner API',
            'task': 'Продолжим существующий API, который уже читает список и статистику Planner. Добавим получение одной задачи по id из адреса. Используем те же данные и сервис, не создаём отдельный поиск.',
            'tasks': [
                {
                    'title': 'Вернём задачу по id',
                    'task': 'В app/api.py добавим GET /tasks/{task_id}. Маршрут должен получить одну реальную задачу и вернуть её клиенту в публичном формате Planner.',
                    'requirements': [
                        'Объявим task_id как int и вызовем app.state.planner.get_task(task_id).',
                        'Вернём только поля id, title, priority и is_done.',
                        'Проверим запросом один id, который сейчас виден в GET /tasks.'
                    ],
                    'hint': 'Сервис уже ищет запись и использует настроенное хранилище. Маршруту остаётся связать path-параметр с этим вызовом и собрать знакомую проекцию ответа.',
                    'answer': {
                        'explanation': 'Path-параметр FastAPI передаёт в обработчик как целое число. Готовый PlannerService находит Task в источнике проекта, а маршрут возвращает только согласованные поля публичного ответа.',
                        'steps': [
                            'Откроем app/api.py и оставим создание сервиса из предыдущего занятия в app.state.planner.',
                            'Объявим маршрут GET /tasks/{task_id} с аргументом task_id: int.',
                            'Вызовем app.state.planner.get_task(task_id), затем соберём словарь из четырёх публичных полей.',
                            'Запросим существующий id из GET /tasks и сравним ответ с соответствующей записью списка.'
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
                    'title': 'Различим отсутствие задачи и неверный тип',
                    'task': 'Изменим уже созданный в первом задании обработчик read_task: добавим обработку отсутствующего числового id и проверим значение, которое нельзя разобрать как int. Второй маршрут с той же парой GET и /tasks/{task_id} не регистрируем. Запросы только читают данные, а сценарии останутся в прежней Planner collection.',
                    'requirements': [
                        'Переведём только TaskNotFoundError в HTTP 404 с detail Task not found.',
                        'Проверим 404 на отсутствующем целом id и 422 на адресе с abc.',
                        'Оставим одну регистрацию GET /tasks/{task_id} и изменим её существующую функцию read_task.',
                        'Сравним GET /tasks, stats и рабочий JSON до и после чтения.'
                    ],
                    'hint': 'Числовой id проверяется сервисом. Текст abc не проходит проверку FastAPI и не попадает в обработчик. Общие исключения не перехватываем.',
                    'answer': {
                        'explanation': 'TaskNotFoundError означает, что тип id допустим, но записи нет, поэтому маршрут отвечает 404. Строка abc не становится int: FastAPI возвращает 422 до вызова read_task. Узкий except оставляет ошибки файла и программы видимыми, а не маскирует их как отсутствие ресурса.',
                        'steps': [
                            'Импортируем HTTPException из FastAPI и используем существующий TaskNotFoundError из модуля, где он уже объявлен. Не создаём второй класс ошибки.',
                            'Изменим read_task из первого задания: обернём существующий вызов get_task в try и поймаем только TaskNotFoundError. Декоратор маршрута и успешный return оставим на месте.',
                            'При исключении поднимем HTTPException со статусом 404 и detail Task not found.',
                            'Отправим запрос с отсутствующим целым id, затем с abc. Проверим соответственно 404 и 422.',
                            'Убедимся, что GET /tasks/{task_id} зарегистрирован один раз. Повторно запросим список и статистику, сравним рабочий JSON и сохраним сценарии в Planner collection.'
                        ],
                        'code': '''from fastapi import HTTPException

# Внутри уже существующего read_task.
# Декоратор маршрута и успешный return остаются без изменений.
try:
    task = app.state.planner.get_task(task_id)
except TaskNotFoundError as error:
    raise HTTPException(
        status_code=404,
        detail="Task not found",
    ) from error

# Здесь остаётся прежний успешный return.''',
                        'checks': [
                            'Существующий id возвращает 200 и четыре публичных поля.',
                            'Отсутствующий числовой id возвращает 404 и detail Task not found.',
                            'Адрес с abc возвращает 422 до вызова обработчика.',
                            'GET /tasks/{task_id} зарегистрирован один раз; существующий обработчик изменён на месте.',
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
            'title': 'Добавим выборку в существующий GET /tasks',
            'task': (
                'Расширим Planner API: клиент должен фильтровать, сортировать и ограничивать реальный список задач. '
                'Используем существующий PlannerService и сохранённый JSON.'
            ),
            'tasks': [
                {
                    'title': 'Добавим выборку в PlannerService',
                    'task': (
                        'Добавим в существующий PlannerService метод с контрактом '
                        '`select_tasks(is_done=None, sort_desc=False, limit=None) -> list[Task]`. '
                        '`is_done=None` оставляет оба статуса; `sort_desc=False` сортирует id по возрастанию, '
                        'а `True` — по убыванию. `limit=None` не ограничивает результат. Метод использует '
                        'имеющийся list_tasks и не читает JSON самостоятельно.'
                    ),
                    'requirements': [
                        'is_done=None оставляет оба статуса, а True и False выбирают точные совпадения.',
                        'При sort_desc=False id идут по возрастанию, при True — по убыванию; заданный limit применяется после фильтра и сортировки, а None не ограничивает список.',
                        'Не меняем list_tasks, Task или данные в хранилище.',
                    ],
                    'hint': (
                        'Разобьём операцию на короткие этапы. Сначала получим список через list_tasks, '
                        'затем при заданном is_done отберём совпадения, создадим отсортированный список '
                        'и только после этого применим срез, если limit не None.'
                    ),
                    'answer': {
                        'explanation': (
                            'PlannerService использует уже настроенное хранилище через list_tasks. Метод готовит '
                            'новый список результата и не сохраняет его. Проверка is_done is not None сохраняет '
                            'разницу между отсутствием фильтра и явным False. Сервисный limit по умолчанию None, '
                            'поскольку правило «по умолчанию десять» относится только к HTTP.'
                        ),
                        'steps': [
                            'Добавим метод в существующий класс PlannerService.',
                            'Сначала вызовем self.list_tasks(). Не открываем JSON из нового метода.',
                            'Если is_done не равен None, оставим только Task с совпадающим task.is_done.',
                            'Вызовем sorted по task.id и передадим sort_desc в reverse.',
                            'Если limit задан, вернём начало отсортированного списка. Если он None, вернём весь отсортированный результат.',
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
                    'title': 'Подключим query к GET /tasks',
                    'task': (
                        'Расширим существующий GET /tasks. Передадим разобранные query-параметры в select_tasks '
                        'и сохраним публичный формат ответа Planner.'
                    ),
                    'requirements': [
                        'Используем is_done=None, sort_desc=False и HTTP limit=10 с диапазоном от 1 до 50.',
                        'Вызовем select_tasks из app.state.planner и вернём только id, title, priority и is_done.',
                        'Не меняем отдельный GET /tasks/{task_id} и GET /stats.',
                    ],
                    'hint': (
                        'Query объявляется в сигнатуре уже существующего endpoint. Для limit зададим Query(default=10, '
                        'ge=1, le=50); остальные значения имеют обычные типы и значения по умолчанию.'
                    ),
                    'answer': {
                        'explanation': (
                            'FastAPI преобразует query из текста в bool и int до входа в функцию маршрута. Query '
                            'задаёт HTTP-дефолт и границы limit. Endpoint передаёт валидированные значения сервису, '
                            'а затем строит тот же публичный ответ из четырёх полей.'
                        ),
                        'steps': [
                            'Импортируем Query из fastapi, если его ещё нет в app/api.py.',
                            'Добавим is_done, sort_desc и limit в сигнатуру существующего GET /tasks.',
                            'Вызовем app.state.planner.select_tasks с именованными аргументами.',
                            'Оставим в JSON только id, title, priority и is_done для каждой Task.',
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
                    'title': 'Проверим выборку и сохранность Planner',
                    'task': (
                        'Через CLI подготовим различимые данные в существующем Planner и проверим выборку на них. '
                        'Временный список и фиксированные id не используем.'
                    ),
                    'requirements': [
                        'Если задач десять или меньше, добавим через CLI записи, пока в рабочем JSON не станет больше десяти. GET /tasks без query должен вернуть ровно первые десять id по возрастанию.',
                        'После подготовки более десяти задач найдём Task с минимальным id и выберем противоположное значение is_done. Если совпадений нет, добавим нужную задачу через CLI и перечитаем список. Запрос с этим фильтром, sort_desc=false и limit=1 должен вернуть одну запись; порядок sort → limit=1 → filter вернул бы пустой список.',
                        'Для обоих статусов, направлений sort_desc и limit=1/50 сравним HTTP с префиксом полного CLI-результата после фильтрации и сортировки. Не ожидаем, что ограниченный ответ покажет все подходящие записи.',
                        'Проверим limit=0, limit=-1, limit=51, limit=many и is_done=maybe: каждый запрос должен получить 422.',
                        'После запросов сравним CLI-list, GET одной задачи, GET /stats и JSON-файл с исходным состоянием.',
                    ],
                    'hint': (
                        'Сначала через CLI подготовим больше десяти задач и обеспечим запись со статусом, отличным '
                        'от статуса задачи с минимальным id. Затем, до HTTP-запросов, сохраним полный CLI-list, stats и JSON '
                        'как исходное состояние для сравнения. Новые записи добавляем только через CLI.'
                    ),
                    'answer': {
                        'explanation': (
                            'Ожидание строится из полного CLI-списка проекта: выбираем нужный статус, сортируем id, '
                            'затем берём первые limit записей. HTTP-ответ сравнивается с этим префиксом, а не со всеми '
                            'задачами выбранного статуса. Для раннего limit создаём различающий случай: задача с минимальным '
                            'id имеет противоположный статус, но подходящая задача существует. При limit=1 '
                            'правильная последовательность возвращает совпадение, а срез после сортировки, но до фильтра, дал '
                            'бы пустой список. GET не записывает результат.'
                        ),
                        'steps': [
                            'Посчитаем задачи через CLI. Если их десять или меньше, добавим записи в тот же Planner, пока их не станет одиннадцать. Найдём задачу с минимальным id и выберем противоположный is_done. Если совпадений нет, добавим задачу этого статуса через CLI и перечитаем список.',
                            'После подготовки данных и до HTTP-запросов сохраним полный вывод CLI list, stats, ответ GET одной существующей задачи и рабочий JSON. Это исходное состояние для проверки, что чтение ничего не изменило.',
                            'Отправим GET /tasks без query. При количестве записей больше десяти ответ должен содержать ровно первые десять id по возрастанию. Сверим их с первыми десятью id полного CLI-list после сортировки по id.',
                            'Отправим запрос с выбранным is_done, sort_desc=false и limit=1. Ответ должен содержать задачу с минимальным id среди совпадений. Сравним с ошибочным порядком sort → limit=1 → filter: он оставил бы только задачу с неподходящим статусом и вернул бы пустой список.',
                            'Проверим оба значения is_done, sort_desc=false/true и limit=1/50. Для каждого запроса вычислим ожидаемый список по полному CLI-list: фильтр, сортировка по id, первые limit элементов. Ответ с limit не обязан содержать все совпадения.',
                            'Отправим limit=0, limit=-1, limit=51, limit=many и is_done=maybe. Каждый запрос должен получить 422 до вызова маршрута.',
                            'Повторно получим полный CLI-list, GET той же задачи, GET /stats и JSON. Убедимся, что чтение не изменило их.',
                        ],
                        'code': '''# Примеры запросов. id и фактическое число задач зависят от рабочего JSON.
GET /tasks
GET /tasks?is_done=false&sort_desc=false&limit=1
GET /tasks?is_done=true&sort_desc=true&limit=50

# Эти параметры должны завершиться ответом 422
GET /tasks?limit=0
GET /tasks?limit=-1
GET /tasks?limit=51
GET /tasks?limit=many
GET /tasks?is_done=maybe''',
                        'checks': [
                            'При более чем десяти задачах GET /tasks без query возвращает ровно первые десять id по возрастанию.',
                            'Для различающего набора фильтр при limit=1 возвращает задачу с минимальным id среди совпадений, хотя задача с минимальным id в полном списке имеет другой статус.',
                            'Каждый ограниченный HTTP-ответ совпадает с началом полного результата CLI после фильтра и сортировки.',
                            'sort_desc меняет направление id, а limit применяется к уже подготовленной выборке.',
                            'Все пять невалидных запросов получают 422 до вызова маршрута.',
                            'Полный CLI-list, ранее выбранная Task, GET /stats и рабочий JSON не изменились после запросов.',
                        ],
                    },
                },
            ],
            'result': (
                'GET /tasks без query возвращает десять первых записей, если их в Planner больше десяти. '
                'Ограниченная выборка совпадает с префиксом полного CLI-результата после filter и sort; '
                'статистика и JSON Planner остаются прежними.'
            ),
        },
    ],
    56: [
        {
            'title': 'Создадим задачу через настоящий POST /tasks',
            'task': 'Продолжим Planner API, который уже читает задачи через сервис и общий JSON. Добавим входную модель, затем подключим её к маршруту создания. Клиент передаёт название и приоритет, а сервер назначает остальные поля.',
            'tasks': [
                {
                    'title': 'Опишем вход TaskCreate',
                    'task': 'В app/api.py объявим Pydantic-модель TaskCreate для данных новой задачи. Клиент сообщает title и priority; постоянный id и начальное состояние назначает Planner.',
                    'requirements': [
                        'Оба поля обязательные: title: str и priority: int.',
                        'Не добавляем id, is_done, Field или новые ограничения.'
                    ],
                    'hint': 'У обязательного поля нет значения по умолчанию. Схема создания описывает только сведения, которые клиент сообщает о новой задаче.',
                    'answer': {
                        'explanation': 'TaskCreate является входной формой API, а не заменой предметной Task. В ней только title и priority. Серверные id и is_done остаются за существующим PlannerService.',
                        'steps': [
                            'Импортируем BaseModel из pydantic в app/api.py.',
                            'Объявим TaskCreate до функции маршрута.',
                            'Оставим у title и priority аннотации типов без значений по умолчанию.'
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
                    'title': 'Подключим POST к существующему сервису',
                    'task': 'Добавим POST /tasks в app/api.py. Передадим title и priority в app.state.planner.add_task, а клиенту вернём созданную задачу с публичными полями и статусом 201.',
                    'requirements': [
                        'Сохраним задачу через существующий PlannerService, не создаём отдельный список и не вызываем JsonStorage.save из маршрута.',
                        'Переведём только ожидаемый ValueError от add_task в HTTP 422; ошибки хранилища не маскируем.'
                    ],
                    'hint': 'Сначала вызовем add_task и получим готовую Task. Только после успешного возврата собираем ответ с серверными id и is_done.',
                    'answer': {
                        'explanation': 'Сервис применяет правила модели Task и сохраняет её через настроенный JsonStorage. Поэтому ответ 201 отправляется после реального создания, а обработчик не дублирует логику и не пишет в файл сам.',
                        'steps': [
                            'Импортируем HTTPException и status из fastapi.',
                            'Объявим маршрут с payload: TaskCreate и статусом 201.',
                            'В try вызовем app.state.planner.add_task(payload.title, priority=payload.priority).',
                            'Перехватим ValueError рядом с этим вызовом и вернём HTTP 422.',
                            'Вернём id, title, priority и is_done из созданной Task.'
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
                    'title': 'Проверим создание и оба уровня отказа',
                    'task': 'В /docs проверим схему и отправим POST из Planner collection. Сравним JSON-поля "priority": 4 и "priority": "4": оба значения должны пройти Pydantic и создать задачу, а в ответе priority будет числом. Повторная отправка создаёт новую задачу с новым серверным id. Затем проверим ошибки валидации: они не должны создавать запись или вызывать сохранение. Сбой самого хранилища в этом задании не моделируем.',
                    'requirements': [
                        'Полученный в ответе id проверим через GET /tasks/{task_id}. Список сверим отдельным запросом GET /tasks?sort_desc=true&limit=1, затем сравним статистику, CLI и чтение после перезапуска API.',
                        'Проверим, что JSON "priority": "4" проходит преобразование Pydantic, создаёт задачу со статусом 201 и возвращается числом 4; "priority": "высокий" и отсутствие поля дают 422.',
                        'Пробельный title и priority за пределами 1–5 отклоняются правилами Task.',
                        'Передадим дополнительные поля {"id": 999, "is_done": true} и проверим, что серверные значения назначает Planner; не требуем отклонять лишние поля.'
                    ],
                    'hint': 'Различим ошибки по месту: FastAPI отклоняет недостающие или неразбираемые поля до маршрута, а правила Task срабатывают внутри add_task.',
                    'answer': {
                        'explanation': 'Корректное тело проходит Pydantic, сервис создаёт и сохраняет Task, а API возвращает 201. При обычной нестрогой проверке Pydantic преобразует строку "4" в int 4; строку "высокий" преобразовать нельзя. Неверная форма даёт 422 до вызова функции. Пробельное название и приоритет вне 1–5 доходят до предметной модели, её ValueError маршрут переводит в 422. Эти validation-отказы происходят до сохранения и не добавляют запись. Ошибку хранилища не переводим в 422 и не обещаем откат обычной записи через write_text.',
                        'steps': [
                            'Откроем /docs, проверим обязательные title и priority, затем сохраним POST /tasks в Planner collection.',
                            'Отправим {"title": "Повторить HTTP", "priority": 4}. Ожидаем 201 и ответ с назначенными сервером id и is_done.',
                            'Отправим тот же POST повторно. Он создаёт ещё одну запись с новым id, а не возвращает старую.',
                            'Отправим валидный body с priority как строкой: {"title": "Числовая строка", "priority": "4"}. Ожидаем 201 и число 4 в поле priority ответа.',
                            'Передадим в body дополнительные {"id": 999, "is_done": true}. При стандартной конфигурации лишние поля не управляют Task: сервис назначает собственный id и начальное состояние.',
                            'Каждый id из ответа проверим точным GET /tasks/{task_id}. Последнюю запись отдельно найдём через GET /tasks?sort_desc=true&limit=1 и сверим статистику с CLI.',
                            'Отправим тело без priority и тело с priority="высокий". Оба запроса должны получить 422 до выполнения маршрута.',
                            'Отправим title из пробелов и priority 0 или 6. Их отклонит правило модели Task через 422.',
                            'После каждого validation-отказа убедимся, что новая Task не появилась в списке и JSON. Сбой записи не имитируем. Перезапустим API и снова найдём успешную запись по её id.'
                        ],
                        'code': '''POST priority=4           → 201, новая Task
POST priority="4"         → 201, priority в ответе — число 4
POST без priority          → 422 до обработчика
POST priority="высокий"    → 422 до обработчика
POST title из пробелов     → 422 от правила Task
POST priority=0 или 6      → 422 от правила Task
GET по id из ответа        → точная созданная Task
GET ?sort_desc=true&limit=1 → последняя Task в списке
CLI, перезапуск            → та же сохранённая Task''',
                        'checks': [
                            'Успешная запись видна через API и CLI после перезапуска.',
                            'Строка "4" преобразуется в целое число, а не отклоняется как нечисловое значение.',
                            'Оба вида ошибки дают 422 по разным причинам.',
                            'Validation-отказы не добавляют Task; сбой хранилища не выдаётся за ошибку клиента.'
                        ]
                    }
                }
            ],
            'result': 'POST /tasks создаёт и сохраняет Task через PlannerService, возвращает её с кодом 201; ошибки body и известные нарушения правил Task дают 422 до сохранения.'
        }
    ],
}
