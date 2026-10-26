"""Учебная практика блока. Редактируйте задания здесь."""

from __future__ import annotations

from typing import Any


MANUAL_PRACTICE: dict[int | str, list[dict[str, Any]]] = {
    "46.1": [
        {
            "title": "POST с JSON и восстановление запросов",
            "task": (
                "В Planner HTTP Lab уже есть GET из занятия 46. Итог: один GET и один POST в той же collection, "
                "два отдельных экспорта и повтор обоих запросов. Если POST, файлы или импортированная копия уже "
                "есть, сначала сверяем их и используем. Дубликаты не создаём."
            ),
            "tasks": [
                {
                    "title": "GET Echo возвращает query из занятия 46",
                    "task": (
                        "В Postman повторяем сохранённый GET {{base_url}}/get из Planner HTTP Lab. В Params остаются "
                        "is_done=false и limit=2, выбрано Echo environment. При соединении Echo отвечает status 200 "
                        "и показывает обе пары как строки в response.args. Если GET или environment отсутствует, "
                        "возвращаемся к занятию 46."
                    ),
                    "requirements": [
                        "GET отправлен из существующей Planner HTTP Lab; второй запрос не создан.",
                        "Выбрано Echo environment с base_url=https://postman-echo.com.",
                        "При соединении ответ имеет status 200, а response.args содержит строки false и 2.",
                        "Если GET или environment отсутствует, используется объяснение занятия 46.",
                    ],
                    "hint": (
                        "Теория 01: Params хранит query, а Echo возвращает её в args. Выберем Echo и проверим base_url."
                    ),
                    "answer": {
                        "explanation": (
                            "Мы проверяем результат занятия 46. Echo environment задаёт адрес, а Echo показывает "
                            "query-параметры как строки в args."
                        ),
                        "steps": [
                            "Откроем Planner HTTP Lab и найдём сохранённый GET.",
                            "Выберем Echo environment и проверим base_url.",
                            "В Params сверим is_done=false и limit=2.",
                            "Отправим GET и проверим status и строки в response.args.",
                            "Если GET или environment отсутствует, вернёмся к занятию 46.",
                        ],
                        "code": (
                            "GET {{base_url}}/get\n"
                            "Params:\n"
                            "  is_done = false\n"
                            "  limit = 2\n"
                            "Ожидаем в response.args:\n"
                            "  is_done = \"false\"\n"
                            "  limit = \"2\""
                        ),
                        "checks": [
                            "GET повторяется из существующей collection.",
                            "Параметры найдены в args, а не в response.json.",
                            "Отсутствующий сетевой ответ не выдан за HTTP-ошибку Planner.",
                        ],
                    },
                    "result": (
                        "В Planner HTTP Lab сохранён GET {{base_url}}/get с is_done=false и limit=2, "
                        "выбран Echo environment с base_url=https://postman-echo.com. При ответе Echo status 200, "
                        "response.args содержит строки false и 2."
                    ),
                },
                {
                    "title": "POST с JSON сохранён рядом с GET",
                    "task": (
                        "В Planner HTTP Lab сохранён один POST {{base_url}}/post с JSON-body. Если такого запроса "
                        "нет, создаём его; если он уже есть, проверяем и при необходимости меняем на месте. "
                        "Echo возвращает поля POST в response.json, а GET остаётся в той же collection."
                    ),
                    "requirements": [
                        "В Planner HTTP Lab находится один POST {{base_url}}/post рядом с GET.",
                        "Body выбран как raw/JSON; title передан строкой, priority числом.",
                        "В request есть Content-Type: application/json без дубликата.",
                        "При соединении Echo отвечает status 200 и показывает оба поля в response.json.",
                        "Ответ Echo не означает, что Task создана в Planner.",
                    ],
                    "hint": (
                        "Теория 02: Body → raw/JSON. title пишем в кавычках, priority оставляем числом. Теория 03: проверяем Content-Type."
                    ),
                    "answer": {
                        "explanation": (
                            "В POST объект передаётся в JSON-body. Echo отражает его в response.json, но не вызывает PlannerService и не сохраняет Task."
                        ),
                        "steps": [
                            "В Planner HTTP Lab найдём POST Echo with JSON body. Если его нет, создадим POST {{base_url}}/post; дубликат не добавляем.",
                            "В Body выберем raw, затем JSON.",
                            "Укажем title строкой, priority числом.",
                            "Проверим Content-Type: application/json. Второй такой же заголовок не добавляем.",
                            "Сохраним запрос и отправим его.",
                            "Проверим status 200 и поля в response.json.",
                        ],
                        "code": (
                            "POST {{base_url}}/post\n"
                            "Content-Type: application/json\n\n"
                            "{\n"
                            "  \"title\": \"Изучить HTTP\",\n"
                            "  \"priority\": 4\n"
                            "}"
                        ),
                        "checks": [
                            "В collection сохранён один POST рядом с GET, без повторной записи того же сценария.",
                            "priority передан числом, без кавычек.",
                            "Поля найдены в response.json, а Planner не объявлен изменённым.",
                        ],
                    },
                    "result": (
                        "Planner HTTP Lab содержит GET и один сохранённый POST {{base_url}}/post. "
                        "POST использует raw JSON с title-строкой и числовым priority; при ответе Echo status 200 "
                        "оба значения видны в response.json."
                    ),
                },
                {
                    "title": "Два экспорта готовы к восстановлению",
                    "task": (
                        "В StudyHub/postman/ лежат два файла: collection с GET и POST и Echo environment с base_url. "
                        "Сначала проверяем их. Подходящие файлы оставляем, отсутствующий или устаревший экспортируем заново."
                    ),
                    "requirements": [
                        "Файлы находятся в postman/ того же проекта StudyHub.",
                        "planner-http-lab.postman_collection.json содержит GET с is_done=false и limit=2 и POST с JSON.",
                        "echo.postman_environment.json содержит base_url=https://postman-echo.com.",
                        "В файлах нет паролей, токенов и личных данных.",
                        "Подходящие экспорты не перезаписаны.",
                    ],
                    "hint": (
                        "Теория 05: collection хранит запросы, environment хранит адрес. Сверим оба файла и обновим только неподходящий."
                    ),
                    "answer": {
                        "explanation": (
                            "Collection хранит запросы, а Echo environment хранит base_url. Поэтому это два разных файла."
                        ),
                        "steps": [
                            "В корне проекта StudyHub откроем папку postman/ и найдём оба файла.",
                            "Проверим имя collection, GET, POST и значение base_url в Echo environment.",
                            "Если collection отсутствует или устарела, экспортируем её из Planner HTTP Lab в формате v2.1 под именем planner-http-lab.postman_collection.json.",
                            "Если environment отсутствует или устарел, отдельно экспортируем Echo как echo.postman_environment.json.",
                            "Перед сохранением проверим, что в файлах нет секретов и личных данных.",
                        ],
                        "code": (
                            "StudyHub/\n"
                            "└── postman/\n"
                            "    ├── planner-http-lab.postman_collection.json\n"
                            "    └── echo.postman_environment.json"
                        ),
                        "checks": [
                            "Получились два отдельных JSON-файла с точными именами.",
                            "Collection содержит GET и POST, environment содержит Echo base_url.",
                            "Код, CLI и рабочие данные Planner не заменены Postman-экспортом.",
                        ],
                    },
                    "result": (
                        "В StudyHub/postman/ находятся planner-http-lab.postman_collection.json с GET и POST "
                        "и echo.postman_environment.json с base_url=https://postman-echo.com. Секретных значений нет."
                    ),
                },
                {
                    "title": "Импортированная collection повторяет оба запроса",
                    "task": (
                        "В Postman выбираем копию collection и Echo environment из этих файлов. Если подходящей "
                        "копии нет, импортируем оба файла как копии, сохраняя исходные ресурсы. Отправляем GET и POST."
                    ),
                    "requirements": [
                        "В Postman выбрана подходящая импортированная collection и её Echo environment; если их нет, файлы импортированы как копии.",
                        "В Echo environment указан base_url=https://postman-echo.com.",
                        "GET возвращает query-параметры в response.args.",
                        "POST возвращает title и числовой priority в response.json.",
                        "Ответы подтверждают работу Echo, а не создание Task в Planner.",
                    ],
                    "hint": (
                        "Теория 04–05: выберем Echo и сравним args у GET с json у POST. Если копии нет, импортируем оба файла как копии."
                    ),
                    "answer": {
                        "explanation": (
                            "После импорта выбираем Echo environment и отправляем оба запроса. Ответы подтверждают, что base_url и сохранённые настройки работают."
                        ),
                        "steps": [
                            "В Postman найдём копию с нужными GET и POST и Echo environment.",
                            "Если её нет, импортируем два файла как копии с различимыми именами.",
                            "Выберем Echo environment и проверим base_url.",
                            "Отправим GET и проверим false и 2 в response.args.",
                            "Отправим POST и проверим title и число priority в response.json.",
                            "Сделаем вывод только о повторяемости запросов к Echo.",
                        ],
                        "code": (
                            "GET /get → response.args:\n"
                            "  is_done = \"false\"\n"
                            "  limit = \"2\"\n\n"
                            "POST /post → response.json:\n"
                            "  title = \"Изучить HTTP\"\n"
                            "  priority = 4\n"
                            "Planner task: не создана"
                        ),
                        "checks": [
                            "Оба ответа получены из импортированных ресурсов.",
                            "GET query и POST JSON находятся в разных полях Echo response.",
                            "Локальный API Planner ещё не проверялся.",
                        ],
                    },
                    "result": (
                        "В Postman выбрана импортированная копия collection с GET и POST и соответствующее Echo "
                        "environment. При доступном соединении GET возвращает query-строки в response.args, а POST "
                        "возвращает title и числовой priority в response.json."
                    ),
                },
            ],
            "result": (
                "Planner HTTP Lab содержит GET с query и один POST с JSON; в StudyHub/postman/ находятся отдельные "
                "проверенные экспорты collection и Echo environment. В Postman доступна соответствующая импортированная "
                "копия. Повторные ответы подтверждают query в args и JSON в json. Код и данные Planner не меняются."
            ),
        }
    ],
    46: [
        {
            "title": "Повторяемый GET к Echo с query",
            "task": (
                "Соберите и сохраните в Postman один GET к Echo. Он передаёт две query-пары и открывается повторно. "
                "Echo показывает полученные значения. Planner этот запрос не получает и не меняет."
            ),
            "tasks": [
                {
                    "title": "Подготовьте collection и environment",
                    "task": (
                        "В текущем workspace Postman найдите collection `Planner HTTP Lab` и environment `Echo`. "
                        "Используйте готовые ресурсы. Создайте только те, которых нет. "
                        "В `Echo` задайте `base_url=https://postman-echo.com`."
                    ),
                    "requirements": [
                        "Открыта одна collection `Planner HTTP Lab`; дубликат не создан.",
                        "Активен `Echo`. В `base_url` записан только `https://postman-echo.com`, без `/get` и query.",
                        "Существующие запросы и настройки сохранены.",
                    ],
                    "hint": "Проверьте список Collections и выберите `Echo` в списке environments. Сверьте `base_url` отдельно от `/get`.",
                    "answer": {
                        "explanation": (
                            "Collection хранит запросы, environment хранит адрес. Готовые ресурсы можно использовать снова. "
                            "Так не появятся лишние копии, а сохранённые запросы останутся на месте."
                        ),
                        "steps": [
                            "Откройте текущий workspace. Найдите `Planner HTTP Lab` и `Echo`.",
                            "Создайте только недостающую collection или environment.",
                            "В `Echo` запишите `base_url=https://postman-echo.com` и выберите это environment активным.",
                            "Если Postman требует войти для сохранения, отметьте блокер. Новый аккаунт создавать не нужно.",
                        ],
                        "code": "Collection: Planner HTTP Lab\nEnvironment: Echo\nbase_url = https://postman-echo.com",
                        "checks": [
                            "Используются ресурсы текущего workspace без копий.",
                            "Активно `Echo`; `base_url` не содержит `/get`.",
                            "Сохранённые запросы не удалены.",
                        ],
                    },
                },
                {
                    "title": "Отправьте GET без query",
                    "task": (
                        "В `Planner HTTP Lab` откройте GET к `/get` или создайте его. "
                        "Выберите GET, укажите `{{base_url}}/get`, оставьте Params пустым и нажмите Send."
                    ),
                    "requirements": [
                        "Раскрытый адрес равен `https://postman-echo.com/get`.",
                        "При доступном соединении Echo отвечает status 200.",
                        "При ошибке соединения ответа и HTTP status нет; такую ошибку не называют 404 или ошибкой Planner.",
                    ],
                    "hint": "Перед Send выберите `Echo` и проверьте полный адрес. Status появляется только вместе с HTTP-ответом.",
                    "answer": {
                        "explanation": (
                            "Этот GET проверяет адрес и соединение. Ответ Echo не сообщает ничего о списке Planner. "
                            "Если соединение не установилось, серверный status ещё не получен."
                        ),
                        "steps": [
                            "Откройте готовый GET к `/get` или создайте новый в `Planner HTTP Lab`.",
                            "Выберите `Echo`. Убедитесь, что `{{base_url}}/get` раскрывается в `https://postman-echo.com/get`.",
                            "Оставьте Params пустым и нажмите Send.",
                            "Если ответ пришёл, проверьте status 200. Если Postman сообщает об ошибке соединения, HTTP status нет.",
                        ],
                        "code": "GET {{base_url}}/get\nОжидаем при доступном Echo: HTTP status 200",
                        "checks": [
                            "GET отправлен на Echo, не на Planner или локальный файл.",
                            "При ответе проверен status 200; сетевой сбой не принят за HTTP status.",
                            "Planner и его данные не изменились.",
                        ],
                    },
                },
                {
                    "title": "Сохраните GET с query",
                    "task": (
                        "В том же GET добавьте через Params пары `is_done=false` и `limit=2`. "
                        "Сохраните запрос в `Planner HTTP Lab`, отправьте его ещё раз и проверьте ответ."
                    ),
                    "requirements": [
                        "В Params указаны `is_done=false` и `limit=2`. Они передаются в query, не в Body.",
                        "При доступном соединении ответ Echo имеет status 200. В `args` значения `false` и `2` показаны строками.",
                        "GET сохранён в `Planner HTTP Lab`. Существующий POST не изменён.",
                    ],
                    "hint": "Добавьте пары в Params. Затем сохраните GET в collection и найдите значения в `args` ответа.",
                    "answer": {
                        "explanation": (
                            "Echo показывает query в `args` как текст. Это подтверждает передачу значений, "
                            "но не фильтрацию задач и не изменение Planner."
                        ),
                        "steps": [
                            "В Params добавьте `is_done` со значением `false` и `limit` со значением `2`.",
                            "Проверьте итоговый адрес. Сохраните этот GET в `Planner HTTP Lab` или обновите сохранённый запрос.",
                            "Откройте GET из collection и нажмите Send.",
                            "Проверьте status 200 и строки `\"false\"` и `\"2\"` в `args`.",
                            "Не меняйте другие запросы collection.",
                        ],
                        "code": (
                            "GET {{base_url}}/get\n"
                            "Params:\n"
                            "  is_done = false\n"
                            "  limit = 2\n\n"
                            "Ожидаем в args:\n"
                            "  is_done: \"false\"\n"
                            "  limit: \"2\""
                        ),
                        "checks": [
                            "В `args` есть `is_done` и `limit`.",
                            "Значения показаны как строки.",
                            "Ответ не принят за результат работы Planner.",
                        ],
                    },
                },
            ],
            "result": (
                "В `Planner HTTP Lab` сохранён GET к Echo с `is_done=false` и `limit=2`. "
                "При доступной сети ответ имеет status 200, а `args` содержит эти значения как строки. "
                "В 46.1 к collection добавятся POST с JSON и экспорт с импортом."
            ),
        }
    ],
    47: [
        {
            "title": "Первый маршрут Planner",
            "task": (
                "В исходном Planner есть пакет app и прежний CLI, а файла app/api.py ещё нет. "
                "Отдельное FastAPI-приложение отвечает на GET /health кодом 200 и JSON {\"status\": \"ok\"}. "
                "После остановки Uvicorn прежний CLI запускается своей командой. "
                "Проект с существующим app/api.py сохраняется без изменений."
            ),
            "tasks": [
                {
                    "title": "Закреплены версии FastAPI и Uvicorn",
                    "task": (
                        "В корневом requirements.txt указаны fastapi==0.142.2 и uvicorn==0.54.0. "
                        "Прежние runtime-зависимости сохранены, а выбранный Python видит оба пакета."
                    ),
                    "requirements": [
                        "Используется requirements.txt в корне Planner.",
                        "В файле указаны версии fastapi==0.142.2 и uvicorn==0.54.0.",
                        "Прежние runtime-зависимости и requirements-dev.txt сохранены.",
                        "Пакеты установлены выбранным Python проекта.",
                    ],
                    "hint": (
                        "Открой корневой requirements.txt. Добавь две строки ниже, сохранив прежние зависимости; "
                        "если файла нет, создай его. Затем установи пакеты выбранным Python."
                    ),
                    "answer": {
                        "explanation": (
                            "requirements.txt хранит список runtime-пакетов. Команда python -m pip "
                            "устанавливает их через выбранный Python."
                        ),
                        "steps": [
                            "Откроем requirements.txt в корне Planner. Добавим две строки ниже или создадим файл, если его нет.",
                            "Сохраним все прежние runtime-зависимости.",
                            "Из корня запустим python -m pip install -r requirements.txt.",
                            "Проверим пакеты командой python -m pip show fastapi uvicorn.",
                        ],
                        "code": (
                            "# Добавить в корневой requirements.txt\n"
                            "fastapi==0.142.2\n"
                            "uvicorn==0.54.0"
                        ),
                        "checks": [
                            "pip show выводит обе закреплённые версии.",
                            "Прежние runtime-зависимости и requirements-dev.txt сохранены.",
                            "Установка выполнена тем Python, которым будет запущен Planner.",
                        ],
                    },
                },
                {
                    "title": "Создан маршрут GET /health",
                    "task": (
                        "В существующем пакете app создан файл app/api.py с объектом FastAPI. "
                        "Маршрут GET /health возвращает JSON {\"status\": \"ok\"} и не читает данные Planner."
                    ),
                    "requirements": [
                        "Пакет app уже есть, а app/api.py в исходном проекте отсутствует.",
                        "Объект app создан вызовом FastAPI().",
                        "Декоратор связывает GET /health с функцией health.",
                        "Функция возвращает словарь {\"status\": \"ok\"}.",
                        "CLI, сервисы и JSON-файлы Planner не изменены.",
                    ],
                    "hint": (
                        "Создай app/api.py внутри пакета app. Используй порядок из примера /status: "
                        "импорт, объект app, декоратор, функция и return."
                    ),
                    "answer": {
                        "explanation": (
                            "Декоратор регистрирует health для GET /health. FastAPI превращает "
                            "возвращённый словарь в JSON-ответ."
                        ),
                        "steps": [
                            "Убедимся, что пакет app есть, а файла app/api.py ещё нет. Существующий файл сохраняем без изменений.",
                            "Создадим app/api.py и импортируем FastAPI.",
                            "Создадим объект app, затем зарегистрируем GET /health над функцией health.",
                            "Вернём словарь через return; не будем читать или менять данные Planner.",
                        ],
                        "code": (
                            "# app/api.py\n"
                            "from fastapi import FastAPI\n\n"
                            "app = FastAPI(title=\"Planner API\")\n\n"
                            "@app.get(\"/health\")\n"
                            "def health():\n"
                            "    return {\"status\": \"ok\"}"
                        ),
                        "checks": [
                            "Файл создаёт объект app.",
                            "GET /health зарегистрирован для функции health.",
                            "Ответ содержит только status со значением ok.",
                            "Обработчик не вызывает PlannerService или JsonStorage.",
                        ],
                    },
                },
                {
                    "title": "Запуск и проверка GET /health",
                    "task": (
                        "Из корня Planner команда Uvicorn запускает app.api:app выбранным Python. "
                        "GET /health возвращает HTTP 200 и JSON {\"status\": \"ok\"}; проверенная команда записана в README."
                    ),
                    "requirements": [
                        "Uvicorn запущен из корня командой python -m uvicorn app.api:app --reload.",
                        "Браузер показывает JSON {\"status\": \"ok\"} от Planner.",
                        "Журнал Uvicorn показывает GET /health со статусом 200.",
                        "В README записана проверенная команда запуска.",
                        "После проверки Uvicorn остановлен через Ctrl+C.",
                    ],
                    "hint": (
                        "Запусти команду из корня и дождись готовности сервера. Проверь URL и журнал Uvicorn; "
                        "после этого запиши команду в README и останови сервер."
                    ),
                    "answer": {
                        "explanation": (
                            "В app.api:app часть до двоеточия указывает модуль, часть после него — объект приложения. "
                            "Браузер показывает ответ, а журнал подтверждает статус запроса."
                        ),
                        "steps": [
                            "Откроем терминал в корне Planner.",
                            "Запустим python -m uvicorn app.api:app --reload.",
                            "Откроем http://127.0.0.1:8000/health и проверим JSON со status=ok.",
                            "В журнале Uvicorn найдём GET /health со статусом 200.",
                            "Добавим эту команду в README и остановим Uvicorn клавишами Ctrl+C.",
                        ],
                        "code": "python -m uvicorn app.api:app --reload",
                        "checks": [
                            "Uvicorn нашёл модуль app.api и объект app.",
                            "Браузер получил ожидаемый JSON от Planner.",
                            "Тело ответа и журнал подтверждают один GET /health.",
                            "README содержит проверенную команду, а Uvicorn остановлен.",
                        ],
                    },
                },
                {
                    "title": "Старый CLI работает отдельно",
                    "task": (
                        "После остановки Uvicorn прежняя команда запускает Planner CLI. "
                        "Знакомое чтение или выход проходит без изменения JSON-данных."
                    ),
                    "requirements": [
                        "CLI запущен прежней командой после остановки Uvicorn.",
                        "Выполнено знакомое чтение списка или выбран выход.",
                        "JSON-файлы Planner остались без изменений.",
                    ],
                    "hint": (
                        "После Ctrl+C запусти CLI прежней командой. Выбери чтение списка или выход."
                    ),
                    "answer": {
                        "explanation": (
                            "Uvicorn и CLI запускаются отдельно. После остановки сервера команда "
                            "python -m app.main по-прежнему открывает CLI."
                        ),
                        "steps": [
                            "После Ctrl+C дождёмся приглашения командной строки.",
                            "Запустим CLI командой python -m app.main.",
                            "Выполним знакомое чтение списка или выберем выход.",
                        ],
                        "code": "python -m app.main",
                        "checks": [
                            "CLI запускается без Uvicorn.",
                            "Привычное чтение списка или выход работает.",
                            "Данные Planner не изменены.",
                        ],
                    },
                },
            ],
            "result": (
                "FastAPI и Uvicorn закреплены в runtime-зависимостях. "
                "GET /health возвращает HTTP 200 и JSON {\"status\": \"ok\"}; проверенная команда запуска записана в README. "
                "После остановки Uvicorn прежний CLI работает, а данные Planner сохранены."
            ),
        }
    ],
    "47.1": [
        {
            "title": "Проверяем готовый Planner API",
            "task": (
                "По результату 47 в Planner должны быть FastAPI, GET /health и прежний CLI. Сверь проект с README, затем выполни задания по порядку. "
                "Если фактический проект отличается, запиши расхождение и не перезаписывай его файлы."
            ),
            "tasks": [
                {
                    "title": "Проверяем список маршрутов",
                    "task": (
                        "В корне Planner запусти сервер командой из README. Открой /docs и /openapi.json по тому же адресу. "
                        "Сверь список HTTP-методов и путей с app/api.py. Запиши, какие маршруты зарегистрированы."
                    ),
                    "requirements": [
                        "Команда из README запускает существующее приложение; его файлы не заменены.",
                        "/docs и /openapi.json показывают GET /health.",
                        "До занятия 48 маршруты /tasks и /stats не зарегистрированы.",
                        "Записаны реальные адреса /docs, /openapi.json и увиденные HTTP-методы и пути.",
                    ],
                    "hint": (
                        "Сверь оба документа и app/api.py. Имя функции само по себе не подтверждает, что маршрут зарегистрирован."
                    ),
                    "answer": {
                        "explanation": (
                            "OpenAPI показывает маршруты запущенного приложения. План будущего занятия не означает, что маршрут уже зарегистрирован."
                        ),
                        "steps": [
                            "В README найди команду запуска и адрес сервера. Запусти сервер из корня проекта.",
                            "Открой <base URL>/docs и <base URL>/openapi.json.",
                            "Сверь HTTP-методы и пути в обоих документах с app/api.py.",
                            "Запиши фактические адреса и список. После 47 ожидается GET /health; /tasks и /stats появятся в 48.",
                        ],
                        "code": (
                            "Ожидаемая опора после занятия 47:\n"
                            "GET /health\n"
                            "Другие операции: не заявлены\n"
                            "Документация: <проверенный base URL>/docs\n"
                            "OpenAPI JSON: <проверенный base URL>/openapi.json"
                        ),
                        "checks": [
                            "В обоих документах совпадают HTTP-методы и пути.",
                            "Проверены адреса текущего Planner, а не другого сервера.",
                            "Состояние сверено с проектом.",
                        ],
                    },
                },
                {
                    "title": "Проверяем health в Swagger",
                    "task": (
                        "В /docs выполни GET /health. Запиши отдельно HTTP-статус и JSON-тело. Объясни, что эта проверка подтверждает."
                    ),
                    "requirements": [
                        "Запрос отправлен в тот же Planner API, что и в задании 1.",
                        "Ожидаемый ответ: HTTP 200 и {\"status\": \"ok\"}.",
                        "Статус и JSON-тело записаны отдельно.",
                        "Вывод касается только health, не задач, CLI или хранилища.",
                    ],
                    "hint": (
                        "Нажми Try it out и Execute. Сверь код и тело ответа с результатом занятия 47."
                    ),
                    "answer": {
                        "explanation": (
                            "HTTP 200 означает, что сервер ответил успешно. JSON показывает результат health-обработчика, но не проверяет весь Planner."
                        ),
                        "steps": [
                            "В /docs раскрой GET /health и нажми Try it out, затем Execute.",
                            "Убедись, что Request URL ведёт к Planner из задания 1.",
                            "Запиши Status code и Response body отдельно.",
                            "Сверь ответ с ожиданием: 200 и {\"status\": \"ok\"}. Сделай вывод только о health.",
                        ],
                        "code": (
                            "GET /health\n"
                            "HTTP status: 200\n"
                            "Response body: {\"status\": \"ok\"}\n"
                            "Проверено: ответ health-обработчика\n"
                            "Не проверено: задачи, CLI и JSON-хранилище"
                        ),
                        "checks": [
                            "В Swagger видны фактические Request URL, статус и body.",
                            "Статус 200 не смешан с JSON-телом.",
                            "Результат не трактуется как создание или изменение задачи.",
                        ],
                    },
                },
                {
                    "title": "Сохраняем запрос в Postman",
                    "task": (
                        "Создай collection Planner API и environment Local. Укажи в Local проверенный адрес сервера, сохрани GET {{base_url}}/health "
                        "и отправь его через Postman Desktop Agent. Экспортируй оба ресурса в postman/. Echo-файлы не меняй."
                    ),
                    "requirements": [
                        "Planner API и Local созданы отдельно от Echo.",
                        "base_url содержит протокол, адрес сервера и порт, но не путь /health.",
                        "Сохранённый GET {{base_url}}/health отправлен через Desktop Agent.",
                        "Ответ: HTTP 200 и {\"status\": \"ok\"}.",
                        "Экспорты лежат в postman/planner-api.postman_collection.json и postman/local.postman_environment.json; Echo-файлы сохранены.",
                    ],
                    "hint": (
                        "Выбери Local и проверь полный URL. Для адреса 127.0.0.1 используй агент на своём компьютере."
                    ),
                    "answer": {
                        "explanation": (
                            "Collection хранит запрос, Local подставляет адрес. Отдельные ресурсы не смешивают ответы Planner и Echo."
                        ),
                        "steps": [
                            "Создать Planner API и Local. Echo-ресурсы оставить без изменений.",
                            "В Local задать base_url по README, без /health.",
                            "Сохранить GET {{base_url}}/health и выбрать Local.",
                            "Выбрать Desktop Agent, отправить запрос и сверить статус и JSON.",
                            "Экспортировать collection и environment в два файла из условия.",
                        ],
                        "code": (
                            "postman/planner-api.postman_collection.json\n"
                            "  GET {{base_url}}/health\n\n"
                            "postman/local.postman_environment.json\n"
                            "  base_url = <адрес сервера из README без /health>\n\n"
                            "Ожидаемый ответ: HTTP 200, {\"status\": \"ok\"}"
                        ),
                        "checks": [
                            "Полный URL ведёт к локальному Planner и заканчивается на /health.",
                            "Запрос отправлен через Desktop Agent.",
                            "Оба JSON-файла сохранены отдельно от Echo.",
                        ],
                    },
                },
                {
                    "title": "Различаем HTTP-ошибки и сбой соединения",
                    "task": (
                        "При работающем сервере отправь GET /missing и POST /health. Останови Uvicorn и повтори GET /health. "
                        "Для каждого случая запиши статус или отсутствие HTTP-ответа и следующий шаг диагностики."
                    ),
                    "requirements": [
                        "GET /missing при запущенном сервере даёт HTTP 404.",
                        "POST /health при запущенном сервере даёт HTTP 405.",
                        "После остановки сервера нет HTTP-статуса, есть ошибка соединения.",
                        "При сбое проверяются сервер и адрес; при HTTP-ответе метод и путь.",
                    ],
                    "hint": (
                        "Сначала отправь два запроса при работающем сервере. Останови его перед последним запросом и проверь, есть ли status code."
                    ),
                    "answer": {
                        "explanation": (
                            "404 и 405 означают, что сервер ответил. При сбое соединения HTTP-ответа нет, поэтому сначала проверяют сервер и адрес."
                        ),
                        "steps": [
                            "При работающем Uvicorn отправить GET /missing: ожидается 404.",
                            "Отправить POST /health: ожидается 405.",
                            "Остановить Uvicorn и отправить GET /health: HTTP-статуса не будет.",
                            "При сбое проверить сервер и адрес. При 404 проверить путь, при 405 метод.",
                        ],
                        "code": (
                            "GET /missing при запущенном сервере → HTTP 404: проверить путь\n"
                            "POST /health при запущенном сервере → HTTP 405: проверить метод\n"
                            "GET /health при остановленном сервере → HTTP-статуса нет: проверить сервер и адрес"
                        ),
                        "checks": [
                            "404 связан с неизвестным path.",
                            "405 связан с неподдерживаемым методом.",
                            "Сбой соединения не назван HTTP-статусом.",
                        ],
                    },
                },
                {
                    "title": "Проверяем CLI и обновляем README",
                    "task": (
                        "Проверь импорт app.main, затем отдельно запусти и штатно заверши прежний CLI. После обеих проверок добавь в README "
                        "фактические адреса /docs и /openapi.json, а также результат GET /health. Сохрани команду запуска CLI."
                    ),
                    "requirements": [
                        "Импорт app.main завершён без меню и запуска Uvicorn.",
                        "Прежний CLI запущен отдельно и завершён штатно.",
                        "README содержит проверенные адреса и объясняет назначение GET /health.",
                        "Команда CLI сохранена отдельно от запуска Uvicorn.",
                        "README изменён после обеих проверок.",
                    ],
                    "hint": (
                        "Выполни команды отдельно. Для CLI используй команду и Python из README проекта."
                    ),
                    "answer": {
                        "explanation": (
                            "Импорт проверяет, что модуль загрузился без меню. Отдельная команда проверяет CLI. README обновляют по результатам обеих проверок."
                        ),
                        "steps": [
                            "В корне проекта выполнить python -c \"import app.main; print('import ok')\".",
                            "Проверить, что появилась строка import ok, но не меню и не сервер.",
                            "Выполнить прежнюю команду CLI из README и штатно закрыть его.",
                            "После проверок записать в README реальные URL документации и результат GET /health.",
                            "Оставить команды CLI и Uvicorn раздельными.",
                        ],
                        "code": (
                            "python -c \"import app.main; print('import ok')\"\n"
                            "Ожидание: import ok, без меню и без запуска сервера\n\n"
                            "README: <проверенный base URL>/docs\n"
                            "README: <проверенный base URL>/openapi.json\n"
                            "README: GET /health → HTTP 200, {\"status\": \"ok\"}\n"
                            "CLI: прежняя отдельная команда сохранена"
                        ),
                        "checks": [
                            "Импорт и CLI проверены отдельно.",
                            "В README указаны проверенные host и порт.",
                            "CLI и сервер запускаются отдельными командами.",
                        ],
                    },
                },
            ],
            "result": (
                "В OpenAPI подтверждён GET /health. Он отвечает HTTP 200 и {\"status\": \"ok\"} через Swagger и Postman. "
                "Экспорты Planner API и Local не затрагивают Echo. 404, 405 и сбой соединения различаются. Импорт и CLI проверены отдельно, "
                "а README содержит проверенные адреса. Данные Planner и маршруты не менялись."
            ),
        }
    ],
    49: [
        {
            'title': 'Выборка задач в существующем Planner',
            'task': (
                'Работайте в корне JSON-версии StudyHub: в app/services.py уже есть PlannerService.list_tasks(), а данные хранит JsonStorage. '
                'Если PlannerService использует SQL и repository, это другая версия проекта. '
                'В tests/test_services.py создайте прямые тесты на tmp_path, затем добавьте выборку в сервис. Карточки выполняйте по порядку.'
            ),
            'tasks': [
                {
                    'title': 'Изолированные данные для прямого теста',
                    'task': (
                        'Создайте tests/test_services.py и подготовьте три Task: id 9 завершена, id 13 и 4 открыты. '
                        'Сохраните их в JsonStorage(tmp_path / "tasks.json") и передайте это хранилище в PlannerService. '
                        'Базовый результат: id [9, 13, 4], статистика all=3, open=2, done=1.'
                    ),
                    'requirements': [
                        'Импортируйте Task, PlannerService и JsonStorage из app.models, app.services и app.storage. Передайте tmp_path в тестовую функцию.',
                        'Создайте helper make_planner(tmp_path): он сохраняет задачи во временный JSON и возвращает PlannerService(storage).',
                        'Проверьте полный порядок [9, 13, 4] и статистику {"all": 3, "open": 2, "done": 1}.',
                        'Используйте только tmp_path. Рабочий JSON не меняйте.',
                    ],
                    'hint': (
                        'pytest сам создаёт tmp_path. Сохраните задачи через JsonStorage и передайте тот же storage в PlannerService.'
                    ),
                    'answer': {
                        'explanation': (
                            'Так тест получает отдельный файл и заранее заданные данные. Разные статусы и пропуски в id помогут увидеть ошибки фильтра и сортировки.'
                        ),
                        'steps': [
                            'Создайте tests/test_services.py.',
                            'В make_planner(tmp_path) сохраните Task с id 9, 13 и 4.',
                            'Проверьте полный список и get_statistics().',
                        ],
                        'code': (
                            'from app.models import Task\n'
                            'from app.services import PlannerService\n'
                            'from app.storage import JsonStorage\n\n'
                            'def make_planner(tmp_path):\n'
                            '    storage = JsonStorage(tmp_path / "tasks.json")\n'
                            '    storage.save([\n'
                            '        Task(9, "Подготовить релиз", is_done=True),\n'
                            '        Task(13, "Проверить отчёт", is_done=False),\n'
                            '        Task(4, "Обновить список", is_done=False),\n'
                            '    ])\n'
                            '    return PlannerService(storage)\n\n'
                            'def test_planner_uses_isolated_json(tmp_path):\n'
                            '    planner = make_planner(tmp_path)\n'
                            '    assert [task.id for task in planner.list_tasks()] == [9, 13, 4]\n'
                            '    assert planner.get_statistics() == {"all": 3, "open": 2, "done": 1}'
                        ),
                        'checks': [
                            'Временный файл содержит три Task.',
                            'list_tasks() возвращает [9, 13, 4].',
                            'get_statistics() возвращает all=3, open=2, done=1.',
                        ],
                    },
                    'result': 'Тестовый Planner читает три Task из tmp_path; полный список и статистика совпадают с исходными данными.',
                },
                {
                    'title': 'select_tasks в существующем PlannerService',
                    'task': (
                        'В app/services.py добавьте в PlannerService метод '
                        'select_tasks(is_done=None, sort_desc=False, limit=None) -> list[Task]. '
                        'Он читает через list_tasks() и возвращает выборку, не меняя JSON.'
                    ),
                    'requirements': [
                        'Начните с self.list_tasks(). Не открывайте JSON внутри нового метода.',
                        'Фильтруйте только если is_done не равен None: True оставляет завершённые, False оставляет открытые.',
                        'Отсортируйте по id: sort_desc=False задаёт возрастание, True задаёт убывание.',
                        'Примените limit после фильтра и сортировки. При limit=None верните весь результат.',
                        'Оставьте без изменений list_tasks(), Task, CLI, API и формат JSON.',
                    ],
                    'hint': (
                        'Порядок метода: list_tasks(), необязательный фильтр, sorted по id, затем срез при заданном limit.'
                    ),
                    'answer': {
                        'explanation': (
                            'Метод использует прежний путь чтения. sorted создаёт новый список; limit=None означает «без ограничения».'
                        ),
                        'steps': [
                            'Добавьте метод в класс PlannerService.',
                            'Получите задачи через self.list_tasks().',
                            'Если задан статус, оставьте только совпадения.',
                            'Отсортируйте задачи по id.',
                            'Если limit задан, возьмите начало готового списка.',
                        ],
                        'code': (
                            'def select_tasks(\n'
                            '    self,\n'
                            '    is_done: bool | None = None,\n'
                            '    sort_desc: bool = False,\n'
                            '    limit: int | None = None,\n'
                            ') -> list[Task]:\n'
                            '    tasks = self.list_tasks()\n\n'
                            '    if is_done is not None:\n'
                            '        tasks = [task for task in tasks if task.is_done == is_done]\n\n'
                            '    tasks = sorted(\n'
                            '        tasks,\n'
                            '        key=lambda task: task.id,\n'
                            '        reverse=sort_desc,\n'
                            '    )\n\n'
                            '    if limit is not None:\n'
                            '        tasks = tasks[:limit]\n\n'
                            '    return tasks'
                        ),
                        'checks': [
                            'Сначала вызывается self.list_tasks().',
                            'None, True и False дают ожидаемый состав задач.',
                            'limit применяется после фильтра и сортировки; None оставляет весь список.',
                        ],
                    },
                    'result': 'select_tasks возвращает выбранные задачи в порядке id и применяет limit последним.',
                },
                {
                    'title': 'Выборка с фильтром, сортировкой и limit',
                    'task': (
                        'В tests/test_services.py проверьте select_tasks на тех же задачах. '
                        'При is_done=True, sort_desc=False, limit=1 ожидается id [9]. '
                        'Если применить limit раньше фильтра, получится пустой список.'
                    ),
                    'requirements': [
                        'Проверьте фильтр None, True и False.',
                        'Проверьте сортировку по id в обе стороны.',
                        'Проверьте limit=None и limit=1 после фильтра и сортировки.',
                        'Вызывайте PlannerService напрямую. HTTP в этой задаче не нужен.',
                    ],
                    'hint': (
                        'По возрастанию первым идёт открытая задача id 4. Сначала уберите её фильтром True, затем limit=1 вернёт id 9.'
                    ),
                    'answer': {
                        'explanation': (
                            'Разные id показывают результат каждого шага. Случай [9] проверяет, что фильтр выполняется до limit.'
                        ),
                        'steps': [
                            'Добавьте тесты в tests/test_services.py.',
                            'Сравните id для None, True, False и двух направлений сортировки.',
                            'Отдельно проверьте is_done=True с limit=1.',
                            'Запустите python -m pytest -q tests/test_services.py.',
                        ],
                        'code': (
                            'def test_select_tasks_filters_and_sorts(tmp_path):\n'
                            '    planner = make_planner(tmp_path)\n'
                            '    ids = lambda tasks: [task.id for task in tasks]\n\n'
                            '    assert ids(planner.select_tasks(is_done=None, limit=None)) == [4, 9, 13]\n'
                            '    assert ids(planner.select_tasks(is_done=True)) == [9]\n'
                            '    assert ids(planner.select_tasks(is_done=False)) == [4, 13]\n'
                            '    assert ids(planner.select_tasks(sort_desc=True)) == [13, 9, 4]\n'
                            '    assert ids(planner.select_tasks(is_done=False, sort_desc=True)) == [13, 4]\n'
                            '    assert ids(planner.select_tasks(is_done=False, sort_desc=True, limit=1)) == [13]\n\n'
                            'def test_limit_follows_filter_and_sort(tmp_path):\n'
                            '    planner = make_planner(tmp_path)\n'
                            '    selected = planner.select_tasks(is_done=True, sort_desc=False, limit=1)\n'
                            '    assert [task.id for task in selected] == [9]'
                        ),
                        'checks': [
                            'Фильтр возвращает id нужного статуса.',
                            'sort_desc меняет порядок id.',
                            'Сценарий is_done=True, limit=1 возвращает [9].',
                        ],
                    },
                    'result': 'Тесты подтверждают фильтр, оба порядка и limit после сортировки.',
                },
                {
                    'title': 'Чтение сохраняет данные Planner',
                    'task': (
                        'Перед вызовами select_tasks сохраните байты JSON, list_tasks() и get_statistics(). '
                        'После выборок все три значения должны остаться прежними.'
                    ),
                    'requirements': [
                        'Сохраните исходные данные после make_planner(tmp_path).',
                        'Вызовите select_tasks с разными статусами и limit.',
                        'Сравните полный список, статистику и байты файла с исходными значениями.',
                        'Запустите python -m pytest -q tests/test_services.py, затем python -m pytest -q.',
                    ],
                    'hint': (
                        'Путь файла: tmp_path / "tasks.json". Сравните read_bytes() до и после выборок.'
                    ),
                    'answer': {
                        'explanation': (
                            'Сравните три значения до и после: полный список, статистику и сам JSON-файл. Так мы проверим, что выборка только читает данные.'
                        ),
                        'steps': [
                            'Сохраните байты файла, полный список и статистику.',
                            'Выполните выборки с разными значениями.',
                            'Сравните данные до и после.',
                            'Запустите целевые и все проектные pytest-тесты.',
                        ],
                        'code': (
                            'def test_select_tasks_preserves_json_and_existing_reads(tmp_path):\n'
                            '    planner = make_planner(tmp_path)\n'
                            '    path = tmp_path / "tasks.json"\n'
                            '    before_bytes = path.read_bytes()\n'
                            '    before_tasks = planner.list_tasks()\n'
                            '    before_stats = planner.get_statistics()\n\n'
                            '    planner.select_tasks(is_done=None, sort_desc=True, limit=None)\n'
                            '    planner.select_tasks(is_done=False, sort_desc=False, limit=1)\n'
                            '    planner.select_tasks(is_done=True, sort_desc=False, limit=1)\n\n'
                            '    assert planner.list_tasks() == before_tasks\n'
                            '    assert planner.get_statistics() == before_stats\n'
                            '    assert path.read_bytes() == before_bytes'
                        ),
                        'checks': [
                            'list_tasks() сохраняет записи и исходный порядок.',
                            'get_statistics() не меняется.',
                            'Байты tasks.json совпадают.',
                            'Оба запуска pytest завершаются успешно.',
                        ],
                    },
                    'result': 'Полный список, статистика и JSON не меняются после выборок.',
                },
            ],
            'result': (
                'select_tasks читает через list_tasks(), фильтрует по статусу, сортирует по id и применяет limit последним. '
                'Прямые тесты на JsonStorage(tmp_path) подтверждают фильтр, оба направления, limit и сохранность списка, '
                'статистики и JSON. GET-параметры появятся в занятии 49.1.'
            ),
        }
    ],
    50: [
        {
            "title": "Проверим входную модель TaskCreate",
            "task": (
                "В существующем проекте StudyHub подготовим или проверим TaskCreate в app/api.py. "
                "Модель описывает обязательные клиентские title и priority. Прямое создание проверим "
                "интерпретатором Python из уже существующей .venv. Не добавляем POST, не вызываем "
                "сервис и не меняем JSON Planner."
            ),
            "tasks": [
                {
                    "title": "Найдём проект и сверим исходное состояние",
                    "task": (
                        "Откройте корень того же StudyHub, где находятся app/api.py и каталог .venv. "
                        "До редактирования просмотрите API-модуль и найдите объявление TaskCreate, если оно уже есть. "
                        "Работаем только с этим проектом и его окружением."
                    ),
                    "requirements": [
                        "Выбран существующий корень StudyHub, а не новая копия проекта.",
                        "Для проверки используется Python из существующей .venv.",
                        "До изменения записано, есть ли уже TaskCreate и где она объявлена.",
                        "Существующие маршруты, сервисы и файлы JSON не запускались на изменение.",
                    ],
                    "hint": (
                        "Начнём с app/api.py и .venv в корне StudyHub. Посмотрим на класс и импорты до правки, "
                        "чтобы не создавать второе объявление TaskCreate."
                    ),
                    "answer": {
                        "explanation": (
                            "Сначала устанавливаем фактическую точку входа. Историческое занятие 56 уже знакомило "
                            "с TaskCreate, а состояние текущего файла может содержать более поздние изменения. "
                            "Снимок проекта нельзя выводить из плана, поэтому класс сначала ищем в реальном API-модуле."
                        ),
                        "steps": [
                            "Открыть каталог StudyHub, где рядом находятся app/ и .venv/.",
                            "Открыть app/api.py и найти импорты Pydantic и объявление TaskCreate.",
                            "Записать, существует ли модель и какие поля она принимает.",
                            "Не очищать данные, не создавать новое окружение и не менять другие модули.",
                        ],
                        "code": (
                            "StudyHub/\n"
                            "├── .venv/\n"
                            "└── app/\n"
                            "    └── api.py  # проверяем существующую модель"
                        ),
                        "checks": [
                            "Путь ведёт к действующему проекту с app/api.py.",
                            "Для команд Python выбрано существующее локальное окружение .venv.",
                            "До правки известно, нужно ли добавлять класс или достаточно проверить текущий.",
                        ],
                    },
                },
                {
                    "title": "Создадим модель только при необходимости",
                    "task": (
                        "Если подходящего TaskCreate ещё нет, добавьте импорт BaseModel и один класс в app/api.py. "
                        "Объявите обязательные title: str и priority: int. Если модель уже есть и подходит роли "
                        "входного контракта, оставьте её и не создавайте дубликат. Не добавляйте сюда id, is_done, "
                        "Field, валидаторы, маршрут или запись в хранилище."
                    ),
                    "requirements": [
                        "В app/api.py используется один подходящий класс TaskCreate на основе pydantic.BaseModel.",
                        "В модели присутствуют клиентские поля title: str и priority: int.",
                        "Не создаётся второе объявление TaskCreate и не перезаписывается существующий API-модуль.",
                        "В рамках этой правки не добавляются маршрут, вызов PlannerService и поля полной Task.",
                    ],
                    "hint": (
                        "Сначала проверьте найденное объявление. Если его нет, импортируйте BaseModel один раз и "
                        "вставьте минимальную модель рядом с остальными схемами, до маршрутов."
                    ),
                    "answer": {
                        "explanation": (
                            "Аннотации задают форму входа, а BaseModel проверяет создание экземпляра. Если в уже "
                            "существующем классе есть более поздние ограничения из прежней работы, не удаляйте их "
                            "ради повторного прохождения этого шага. Здесь важно не дублировать схему и не расширять её новыми правилами."
                        ),
                        "steps": [
                            "При отсутствии подходящего импорта добавить from pydantic import BaseModel.",
                            "При отсутствии модели объявить class TaskCreate(BaseModel).",
                            "Оставить title: str и priority: int обязательными полями без значений по умолчанию.",
                            "Если класс уже есть, сохранить его и проверить соответствие входному контракту.",
                        ],
                        "code": (
                            "from pydantic import BaseModel\n\n\n"
                            "class TaskCreate(BaseModel):\n"
                            "    title: str\n"
                            "    priority: int"
                        ),
                        "checks": [
                            "Имя TaskCreate связано ровно с одной подходящей моделью в API-модуле.",
                            "title и priority обязательны и имеют аннотации str и int.",
                            "Новые id и is_done в схему входа не добавлены.",
                            "Изменение касается импорта или модели в app/api.py, без нового endpoint.",
                        ],
                    },
                },
                {
                    "title": "Проверим модель в Python",
                    "task": (
                        "Запустите Python из .venv и импортируйте TaskCreate. Проверьте priority=4 и priority=\"4\": "
                        "оба раза атрибут должен быть int. Затем пропустите priority и передайте title=4. "
                        "Прочитайте обе ошибки ValidationError."
                    ),
                    "requirements": [
                        "Проверка запущена Python из существующей .venv.",
                        "priority=4 и priority=\"4\" дают атрибут priority типа int.",
                        "Без priority модель выдаёт ValidationError.",
                        "title=4 приводит к ValidationError.",
                        "Проверка выполняется напрямую, без HTTP-запроса и вызова сервиса.",
                    ],
                    "hint": (
                        "Повторите примеры из раздела 03. Проверьте type(payload.priority) и выведите сообщение ValidationError."
                    ),
                    "answer": {
                        "explanation": (
                            "Число и строка \"4\" дают int. Если пропустить поле или передать число вместо строки title, "
                            "Pydantic покажет ValidationError с указанием поля. HTTP 422 появится позже, когда модель подключат к body."
                        ),
                        "steps": [
                            "Из корня StudyHub запустите .venv\\Scripts\\python.exe.",
                            "Выполните import TaskCreate из app.api и импортируйте ValidationError из pydantic.",
                            "Создайте модель с priority=4 и ещё одну с priority=\"4\".",
                            "Выведите значение и тип priority у обоих объектов.",
                            "Создайте модель без priority, затем вызовите TaskCreate(title=4, priority=4).",
                            "Для обоих случаев выведите сообщение ValidationError.",
                        ],
                        "code": (
                            "from app.api import TaskCreate\n"
                            "from pydantic import ValidationError\n\n"
                            "number = TaskCreate(title=\"Проверить вход\", priority=4)\n"
                            "text_number = TaskCreate(title=\"Проверить вход\", priority=\"4\")\n"
                            "print(number.priority, type(number.priority).__name__)\n"
                            "print(text_number.priority, type(text_number.priority).__name__)\n\n"
                            "try:\n"
                            "    TaskCreate(title=\"Проверить вход\")\n"
                            "except ValidationError as error:\n"
                            "    print(error)\n\n"
                            "try:\n"
                            "    TaskCreate(title=4, priority=4)\n"
                            "except ValidationError as error:\n"
                            "    print(error)"
                        ),
                        "checks": [
                            "Для priority=4 и priority=\"4\" выведено 4 и int.",
                            "Сообщения ошибок указывают на отсутствующий priority и неверный тип title.",
                            "HTTP-запрос не отправлен, данные Planner не менялись.",
                        ],
                    },
                },
                {
                    "title": "Проверим результат",
                    "task": (
                        "Просмотрите изменения в app/api.py. Результат этого занятия: только проверенная TaskCreate. "
                        "Существующую работу в маршрутах, сервисе, CLI и JSON оставьте без изменений."
                    ),
                    "requirements": [
                        "В этой практике POST и другие маршруты не добавлялись и не менялись.",
                        "PlannerService, CLI и JSON не менялись.",
                        "Существующий код до и после модели сохранён.",
                        "TaskCreate готова к занятию 50.1.",
                    ],
                    "hint": (
                        "Сверьте изменения с исходным состоянием. Проверьте импорт и модель; остальной код не трогайте."
                    ),
                    "answer": {
                        "explanation": (
                            "В 50.1 обработчик подключит эту модель к POST. Сейчас мы проверили форму данных, но не создавали задачу."
                        ),
                        "steps": [
                            "Просмотрите изменения app/api.py.",
                            "Проверьте, что TaskCreate не объявлена дважды.",
                            "Убедитесь, что POST, add_task и JSON не менялись.",
                            "Запишите результат: TaskCreate проверена в .venv.",
                        ],
                        "code": (
                            "Итог занятия 50:\n"
                            "TaskCreate(title: str, priority: int)\n"
                            "Прямое создание: проверено\n"
                            "POST /tasks: следующий шаг 50.1"
                        ),
                        "checks": [
                            "В app/api.py есть подходящая TaskCreate.",
                            "Проверены число, строка \"4\" и две ошибки модели.",
                            "Новая задача и запись в JSON не создавались.",
                        ],
                    },
                },
            ],
            "result": (
                "В app/api.py есть одна TaskCreate с обязательными title и priority. В .venv проверены "
                "число, строка \"4\", пропущенное поле и неверный тип title. POST, сервис и JSON не менялись."
            ),
        }
    ],
    48: [
        {
            'title': 'Добавить GET /tasks и GET /stats',
            'task': (
                'Точка A: app/api.py отвечает на GET /health; CLI, build_service(), PlannerService и JsonStorage работают. Если одна из этих опор '
                'не готова, отметьте это и не считайте новые маршруты готовыми. Точка B: GET /tasks и GET /stats читают '
                'актуальные данные того же Planner; сами GET не меняют JSON.'
            ),
            'tasks': [
                {
                    'title': 'Проверить данные через CLI',
                    'task': (
                        'Проверьте GET /health в Swagger или Planner API Local. В app/main.py найдите DATA_PATH и проследите '
                        'build_service() до JsonStorage. Запустите CLI из корня проекта командой из README. В CLI выполните '
                        'list и stats, запишите реальные id и значения. Если список пуст, добавьте одну задачу командой add. '
                        'Выйдите и запустите CLI снова, чтобы проверить сохранение.'
                    ),
                    'requirements': [
                        'Команду запуска из README выполняют в PowerShell из корня проекта; list, stats, add и exit вводят после приглашения CLI.',
                        'Путь к JSON найден через DATA_PATH и build_service() в app/main.py; файл не создаётся и не редактируется вручную.',
                        'До изменений маршрутов GET /health возвращает статус 200 и тело {"status":"ok"}.',
                        'Список и счётчики сняты с реального вывода CLI; если задач не было, одна добавлена командой add.',
                        'После перезапуска CLI показывает те же сохранённые задачи и статистику.'
                    ],
                    'hint': (
                        'Сначала найдите путь в app/main.py, затем запускайте CLI по README. list и stats вводятся после строки «Команда:».'
                    ),
                    'answer': {
                        'explanation': (
                            'CLI и Uvicorn работают в разных процессах. build_service() настраивает PlannerService на один '
                            'JsonStorage и DATA_PATH. Поэтому CLI сохраняет изменения в JSON, а следующий запуск читает их снова.'
                        ),
                        'steps': [
                            'В app/main.py проследите DATA_PATH и build_service() до JsonStorage.',
                            'В PowerShell из корня проекта запустите CLI командой из README.',
                            'После приглашения «Команда:» выполните list и stats. Запишите фактические id и значения.',
                            'Если список пуст, выполните add и введите название и приоритет. Затем снова выполните list и stats.',
                            'Введите exit, запустите CLI повторно и сравните вывод с записанными данными.'
                        ],
                        'code': 'build_service() -> PlannerService(JsonStorage(DATA_PATH))',
                        'checks': [
                            'Путь к файлу найден в настройках проекта.',
                            'Список и stats прочитаны командами CLI, реальные значения записаны.',
                            'Данные сохранились после перезапуска CLI.'
                        ]
                    },
                    'result': (
                        'GET /health отвечает, путь к JSON найден, CLI после перезапуска показывает те же данные.'
                    )
                },
                {
                    'title': 'GET /tasks: полный список и публичные поля',
                    'task': (
                        'В app/api.py оставьте GET /health. Сохраните один результат build_service() в app.state.planner. '
                        'Добавьте GET /tasks: получите сервис через Request, вызовите list_tasks() и примените '
                        '_task_read_data() к каждой задаче. Сравните полный ответ с CLI list.'
                    ),
                    'requirements': [
                        'Создаётся один PlannerService через build_service() и сохраняется в app.state.planner.',
                        '_task_read_data(task) возвращает только id, title, priority и is_done; сама Task и tags не меняются.',
                        'Обработчик получает Planner через request: Request и вызывает list_tasks() при каждом запросе.',
                        'Весь список превращается в JSON-массив; пустой список возвращается как [].',
                        'GET /health продолжает работать. Item-маршрут и query-параметры здесь не добавляются.'
                    ],
                    'hint': (
                        'Сначала сохраните сервис в app.state.planner. В обработчике получите его через Request и передайте каждую Task в helper.'
                    ),
                    'answer': {
                        'explanation': (
                            'app.state хранит сервис, а не список задач. Request даёт к нему доступ, list_tasks() читает данные '
                            'при запросе, а _task_read_data() возвращает четыре публичных поля.'
                        ),
                        'steps': [
                            'Импортируйте Request и build_service. Один раз сохраните build_service() в app.state.planner.',
                            'Оставьте GET /health без изменений.',
                            'Создайте _task_read_data(task) с ключами id, title, priority и is_done.',
                            'В GET /tasks получите Planner через Request, вызовите list_tasks() и примените helper ко всем задачам.',
                            'Сравните JSON-ответ со списком CLI через Swagger или Planner API Local.'
                        ],
                        'code': '''from fastapi import FastAPI, Request
from app.main import build_service

app = FastAPI(title="StudyHub Planner")
app.state.planner = build_service()


@app.get("/health")
def health_check():
    return {"status": "ok"}


def _task_read_data(task):
    return {
        "id": task.id,
        "title": task.title,
        "priority": task.priority,
        "is_done": task.is_done,
    }


@app.get("/tasks")
def read_tasks(request: Request):
    planner = request.app.state.planner
    tasks = planner.list_tasks()
    return [_task_read_data(task) for task in tasks]''',
                        'checks': [
                            'GET /health возвращает 200 и {"status":"ok"}.',
                            'GET /tasks совпадает с полным CLI list и не содержит tags.',
                            'В каждой записи ровно четыре поля; пустой Planner возвращает [].',
                            'Чтение не вызывает сохранение.'
                        ]
                    },
                    'result': (
                        'GET /tasks возвращает полный список из четырёх публичных полей, совпадающий с CLI.'
                    )
                },
                {
                    'title': 'GET /stats: общие счётчики Planner',
                    'task': (
                        'В app/api.py добавьте GET /stats. Вызовите get_statistics() и верните total из all, а open и done '
                        'возьмите из одноимённых значений. Сравните ответ с CLI stats.'
                    ),
                    'requirements': [
                        'Обработчик получает Planner через request: Request и вызывает get_statistics().',
                        'Значение all возвращается как total; open и done сохраняют имена и значения.',
                        'Все три числа совпадают с CLI stats: Всего, Осталось и Выполнено.',
                        'Статистика относится ко всему Planner, а GET /health и GET /tasks продолжают работать.'
                    ],
                    'hint': (
                        'Посмотрите, какие три ключа возвращает get_statistics(). В ответе меняется только имя общего ключа; '
                        'не проходите по списку задач повторно.'
                    ),
                    'answer': {
                        'explanation': (
                            'PlannerService уже считает all, open и done по всему хранилищу. Обработчик только меняет имя all '
                            'на total и возвращает готовые значения.'
                        ),
                        'steps': [
                            'Добавьте GET /stats с параметром request: Request.',
                            'Вызовите request.app.state.planner.get_statistics().',
                            'Верните all под именем total, а open и done оставьте без изменений.',
                            'Сравните ответ с CLI stats.'
                        ],
                        'code': '''@app.get("/stats")
def read_stats(request: Request):
    statistics = request.app.state.planner.get_statistics()
    return {
        "total": statistics["all"],
        "open": statistics["open"],
        "done": statistics["done"],
    }''',
                        'checks': [
                            'total совпадает с Всего, open с Осталось, done с Выполнено в CLI stats.',
                            'Обработчик вызывает get_statistics(), не пересчитывая значения по GET /tasks.',
                            'GET /health и GET /tasks продолжают работать.'
                        ]
                    },
                    'result': (
                        'GET /stats возвращает общие счётчики Planner и совпадает с CLI.'
                    )
                },
                {
                    'title': 'Проверить свежесть данных и сохранность файла',
                    'task': (
                        'Оставьте Uvicorn работающим. Во втором окне запустите CLI и добавьте открытую задачу командой add '
                        'с приоритетом 3. Запишите её id. В Swagger или Planner API Local проверьте /tasks и /stats, '
                        'затем повторите запросы после перезапуска Uvicorn.'
                    ),
                    'requirements': [
                        'Задача добавляется через CLI; закройте CLI после команды add и до HTTP-запросов.',
                        'Без перезапуска Uvicorn /tasks показывает новый id; total и open растут на 1, done не меняется.',
                        'После перезапуска Uvicorn /tasks и /stats показывают те же задачу и счётчики.',
                        'Содержимое JSON сразу до GET и после GET совпадает.',
                        'GET /health продолжает отвечать; параллельная запись и ручная правка JSON не используются.'
                    ],
                    'hint': (
                        'Сначала завершите add и выйдите из CLI. Запишите id из его вывода, а файл сравнивайте после команды CLI, но до GET.'
                    ),
                    'answer': {
                        'explanation': (
                            'Команда CLI сохраняет открытую задачу в JSON. list_tasks() и get_statistics() читают новый файл '
                            'при следующем запросе, даже если Uvicorn не перезапускали. GET не сохраняют данные. После рестарта '
                            'новый сервис читает тот же DATA_PATH.'
                        ),
                        'steps': [
                            'С работающим API снимите ответы /health, /tasks и /stats.',
                            'Во втором окне запустите CLI, выполните add, введите название «Проверка свежего чтения» и приоритет 3. Запишите id и введите exit.',
                            'Откройте файл по DATA_PATH и зафиксируйте его содержимое. Это исходная точка для проверки GET.',
                            'Без перезапуска Uvicorn повторите /tasks и /stats. Найдите новый id: total и open выросли на 1, done не изменился.',
                            'Снова откройте JSON и сравните его с содержимым до запросов. Они должны совпадать.',
                            'Перезапустите Uvicorn и повторите /health, /tasks и /stats. Id и счётчики должны сохраниться.'
                        ],
                        'checks': [
                            'Новый id взят из вывода CLI.',
                            'API видит задачу до перезапуска и после него.',
                            'total и open выросли на 1, done осталось прежним.',
                            'GET не меняет JSON.'
                        ]
                    },
                    'result': (
                        'Оба GET показывают изменение CLI до и после перезапуска. Запросы не меняют JSON, /health и CLI работают.'
                    )
                }
            ],
            'result': (
                'GET /tasks возвращает полный список с реальными id и четырьмя публичными полями. GET /stats использует общий подсчёт Planner. Оба маршрута показывают изменения CLI до и после перезапуска, а GET не меняют JSON. Реальный id и проекция переходят в занятие 48.1.'
            )
        }
    ],
    "49.1": [
        {
            "title": "GET /tasks выбирает задачи по query",
            "task": (
                "В занятии 49 мы подготовили select_tasks: он фильтрует и сортирует задачи, затем применяет limit. "
                "Теперь подключим его к существующему GET /tasks и проверим параметры из URL. Если маршрут уже "
                "работает по условию, оставим его без изменений."
            ),
            "tasks": [
                {
                    "title": "Подготовим данные и исходный снимок",
                    "task": (
                        "Для проверки в Planner нужно не меньше 12 задач, завершённых и открытых. Минимальный id "
                        "должен быть завершён, а задача с большим id остаётся открытой. Так мы проверим limit=10 и порядок "
                        "фильтрации перед limit."
                    ),
                    "requirements": [
                        "Меняем данные только командами CLI. JSON-файл вручную не редактируем.",
                        "В полном списке не меньше 12 задач: есть завершённые и открытые.",
                        "Задача с минимальным id завершена; задача с большим id открыта.",
                        "Сохраняем исходные полный CLI-список, GET /stats, одну задачу и JSON-файл.",
                    ],
                    "hint": (
                        "Сначала посмотрим полный список в CLI и найдём минимальный id. Если не хватает задач "
                        "или нужных статусов, добавим или отметим их знакомыми командами CLI. Если данные уже "
                        "подходят, менять их не нужно."
                    ),
                    "answer": {
                        "explanation": (
                            "Двенадцать задач позволяют проверить, что без limit API возвращает не больше десяти. "
                            "Минимальная завершённая задача и более поздняя открытая покажут, что сервис сначала "
                            "фильтрует список. Исходные снимки помогут проверить, что GET ничего не изменил."
                        ),
                        "steps": [
                            "В Planner выведем полный список через CLI. Посчитаем задачи и найдём минимальный id.",
                            "Если задач меньше 12 или нет обоих статусов, добавим задачи или отметим часть завершёнными командами CLI.",
                            "Проверим: минимальная задача завершена, а задача с большим id открыта.",
                            "Запишем полный CLI-список, ответы GET /stats и одной существующей задачи, а также содержимое JSON-файла.",
                        ],
                        "checks": [
                            "Есть не меньше 12 задач обоих статусов.",
                            "Минимальная задача завершена, а более поздняя задача открыта.",
                            "Исходные список, stats, задача и JSON записаны для сравнения.",
                        ],
                    },
                },
                {
                    "title": "Подключим query к GET /tasks",
                    "task": (
                        "Добавим is_done, sort_desc и limit к существующему GET /tasks. FastAPI проверит значения, "
                        "а маршрут передаст их готовому select_tasks. Путь, поля ответа и логика сервиса не меняются."
                    ),
                    "requirements": [
                        "Меняем обработчик GET /tasks в app/api.py; новый путь не добавляем.",
                        "Используем is_done: bool | None = None, sort_desc: bool = False и limit: int = Query(default=10, ge=1, le=50).",
                        "Передаём все три значения именованными аргументами в request.app.state.planner.select_tasks.",
                        "В ответе остаются id, title, priority и is_done. GET не вызывает save и не ограничивает CLI.",
                    ],
                    "hint": (
                        "Пропущенный фильтр получает None. Для HTTP-limit используем Query(default=10, ge=1, le=50); "
                        "сервисный limit=None по-прежнему означает полный список. Сначала проверим существующий "
                        "обработчик и изменим только то, чего не хватает."
                    ),
                    "answer": {
                        "explanation": (
                            "FastAPI преобразует и проверяет query. Маршрут передаёт значения сервису, а формат ответа "
                            "и данные Planner остаются прежними."
                        ),
                        "steps": [
                            "В app/api.py найдем существующий GET /tasks.",
                            "Сверим параметры, типы, значения по умолчанию и границы с условием.",
                            "Добавим только недостающие части. Если маршрут уже подходит, код не меняем.",
                            "Передадим параметры в select_tasks именованными аргументами и сохраним прежние поля ответа.",
                            "Отправим запросы через существующую Postman collection и Local environment к тому же API-процессу.",
                        ],
                        "code": (
                            "from fastapi import Query, Request\n\n"
                            "@app.get(\"/tasks\")\n"
                            "def read_tasks(\n"
                            "    request: Request,\n"
                            "    is_done: bool | None = None,\n"
                            "    sort_desc: bool = False,\n"
                            "    limit: int = Query(default=10, ge=1, le=50),\n"
                            "):\n"
                            "    tasks = request.app.state.planner.select_tasks(\n"
                            "        is_done=is_done,\n"
                            "        sort_desc=sort_desc,\n"
                            "        limit=limit,\n"
                            "    )\n"
                            "    return [\n"
                            "        {\n"
                            "            \"id\": task.id,\n"
                            "            \"title\": task.title,\n"
                            "            \"priority\": task.priority,\n"
                            "            \"is_done\": task.is_done,\n"
                            "        }\n"
                            "        for task in tasks\n"
                            "    ]"
                        ),
                        "checks": [
                            "Используется один маршрут GET /tasks.",
                            "None, False и 10 сохраняют свой смысл на HTTP- и сервисном уровнях.",
                            "Маршрут не повторяет фильтрацию, сортировку и limit.",
                            "Ответ содержит четыре прежних поля и не содержит tags.",
                        ],
                    },
                },
                {
                    "title": "Проверим правильные query",
                    "task": (
                        "Отправим правильные query через Postman. Без limit API вернёт не больше 10 задач. Фильтр и "
                        "сортировка должны совпасть с данными CLI; limit=1 и limit=50 должны пройти проверку."
                    ),
                    "requirements": [
                        "Без query GET /tasks возвращает HTTP 200 и не больше 10 задач.",
                        "is_done=false выбирает открытые, is_done=true выбирает завершённые; без фильтра остаются оба статуса.",
                        "С sort_desc=false и limit=1 возвращается минимальный подходящий id.",
                        "sort_desc=true сортирует id по убыванию; limit=1 и limit=50 возвращают HTTP 200.",
                        "В каждой задаче ответа есть id, title, priority и is_done.",
                    ],
                    "hint": (
                        "Сначала отправим GET без параметров и сравним ответ с полным списком CLI. Затем запросим одну "
                        "открытую задачу: минимальная задача имеет противоположный статус."
                    ),
                    "answer": {
                        "explanation": (
                            "Полный список CLI покажет, что HTTP-limit ограничивает только ответ. Запрос с limit=1 "
                            "проверит порядок сервиса: фильтр, сортировка, затем limit."
                        ),
                        "steps": [
                            "Отправим GET {{base_url}}/tasks без query. Сравним ответ с полным списком CLI.",
                            "Запросим is_done=false, sort_desc=false и limit=1. Ожидаем минимальный id среди открытых задач.",
                            "Запросим is_done=true и limit=50, затем список без фильтра с limit=50. Сверим статусы и количество с CLI.",
                            "Запросим sort_desc=true и limit=2. Ожидаем два наибольших id по убыванию.",
                            "Проверим, что limit=1 и limit=50 дают HTTP 200 и не меняют список CLI.",
                        ],
                        "code": (
                            "GET {{base_url}}/tasks\n"
                            "GET {{base_url}}/tasks?is_done=false&sort_desc=false&limit=1\n"
                            "GET {{base_url}}/tasks?is_done=true&limit=50\n"
                            "GET {{base_url}}/tasks?sort_desc=true&limit=2\n"
                            "GET {{base_url}}/tasks?limit=1\n"
                            "GET {{base_url}}/tasks?limit=50"
                        ),
                        "checks": [
                            "Без limit HTTP использует 10; сервисный None не ограничивает CLI.",
                            "При filter=false, sort_desc=false, limit=1 возвращается первый id после фильтрации.",
                            "Границы limit=1 и limit=50 принимаются.",
                            "Порядок и четыре поля ответа соответствуют Planner API.",
                        ],
                    },
                },
                {
                    "title": "Проверим ошибочные query",
                    "task": (
                        "Проверим, что FastAPI отклоняет неверные query до вызова GET-обработчика. "
                        "Каждый такой запрос должен вернуть HTTP 422 и оставить данные Planner без изменений."
                    ),
                    "requirements": [
                        "limit=0, limit=51 и limit=abc возвращают HTTP 422.",
                        "is_done=maybe и sort_desc=maybe возвращают HTTP 422.",
                        "Отличаем ошибку query (422) от отсутствующей задачи (404).",
                        "После ошибок список, задача, stats и JSON не меняются.",
                    ],
                    "hint": (
                        "Передадим неверные значения в query URL, не в JSON body. Проверим статус ответа и сравним данные."
                    ),
                    "answer": {
                        "explanation": (
                            "FastAPI проверяет тип и границы до вызова обработчика, поэтому неверный query даёт 422. "
                            "404 относится к отдельному запросу задачи, которой нет."
                        ),
                        "steps": [
                            "Отправим запросы с limit=0, limit=51 и limit=abc.",
                            "Отправим запросы с is_done=maybe и sort_desc=maybe.",
                            "Убедимся, что каждый запрос вернул HTTP 422. Данные не меняем.",
                            "Запросим корректный id, которого нет в Planner. Этот запрос одной задачи должен вернуть 404.",
                        ],
                        "code": (
                            "GET {{base_url}}/tasks?limit=0       -> 422\n"
                            "GET {{base_url}}/tasks?limit=51      -> 422\n"
                            "GET {{base_url}}/tasks?limit=abc     -> 422\n"
                            "GET {{base_url}}/tasks?is_done=maybe -> 422\n"
                            "GET {{base_url}}/tasks?sort_desc=maybe -> 422"
                        ),
                        "checks": [
                            "Значения за границами limit отклонены.",
                            "Неверные limit и boolean не преобразуются в допустимые значения.",
                        "422 относится к query, а 404 получают при запросе отсутствующей задачи.",
                        ],
                    },
                },
                {
                    "title": "Убедимся, что GET не меняет данные",
                    "task": (
                        "После всех запросов сравним CLI-список, существующую задачу, GET /stats и JSON с исходным снимком. "
                        "Выборка должна менять только ответ GET /tasks."
                    ),
                    "requirements": [
                        "Полный список сравниваем через CLI, не через GET с limit=10.",
                        "Общее число задач, open и done в GET /stats не меняются.",
                        "У выбранной задачи остаются прежние четыре публичных поля.",
                        "JSON-файл, включая tags, совпадает с исходным снимком.",
                    ],
                    "hint": (
                        "Повторим те же чтения, что сделали перед запросами: полный список CLI, ту же задачу, stats и JSON."
                    ),
                    "answer": {
                        "explanation": (
                            "GET только читает данные. Он не сохраняет выборку и не сокращает общий список, поэтому все "
                            "сравнения должны совпасть с исходным снимком."
                        ),
                        "steps": [
                            "После запросов снова выведем полный список теми же командами CLI и сравним с исходным.",
                            "Запросим ту же задачу через GET /tasks/{task_id} и сравним её поля.",
                            "Снова вызовем GET /stats и сравним total, open и done.",
                            "Сравним JSON с исходным снимком, включая все записи и поле tags.",
                        ],
                        "checks": [
                            "Список CLI и порядок задач не изменились.",
                            "Запросы списка не изменили задачу и общую статистику.",
                            "JSON не изменился после успешных запросов и ответов 422.",
                        ],
                    },
                },
            ],
            "result": (
                "GET /tasks принимает is_done, sort_desc и limit с defaults None/False/10; limit от 1 до 50 включительно. "
                "Корректный запрос возвращает выборку filter → sort по id → limit, а ошибочный query даёт HTTP 422. "
                "CLI-list, item, GET /stats и JSON сохраняют исходное состояние."
            ),
        }
    ],
    "50.1": [
        {
            "title": "POST /tasks сохраняет задачу в общем Planner",
            "task": (
                "Продолжаем существующий StudyHub после шага 50. Проверим исходную точку A, подключим один POST "
                "к общему Planner и подтвердим результат B. Сохраняем прежние GET, CLI и JSON. "
                "Если состояние проекта отличается от задания, запишите расхождение и не добавляйте второй маршрут."
            ),
            "tasks": [
                {
                    "title": "Подтверждены исходная схема и данные",
                    "task": (
                        "Откройте существующий StudyHub и файл `app/api.py`. Найдите `TaskCreate` и маршруты "
                        "`GET /tasks`, `GET /stats`, `GET /tasks/{task_id}`. До изменений запишите статистику "
                        "и прочитайте одну прежнюю задачу по её настоящему id."
                    ),
                    "requirements": [
                        "В `app/api.py` есть одна `TaskCreate` с обязательными полями `title: str` и `priority: int`.",
                        "Все три GET-маршрута читают Planner из `request.app.state.planner`.",
                        "`add_task` сохраняет задачи через `JsonStorage`; CLI читает тот же JSON-файл.",
                        "`POST /tasks` ещё не зарегистрирован.",
                        "До изменений записаны `GET /stats` и ответ для одной прежней задачи; JSON не менялся.",
                        "Если исходное состояние отличается, расхождение записано и новый маршрут не добавлен.",
                    ],
                    "hint": (
                        "Раздел 00 теории описывает точку старта. Проверьте файлы `app/api.py`, `app/services.py` "
                        "и `app/storage.py`: номер занятия сам по себе не подтверждает состояние проекта."
                    ),
                    "answer": {
                        "explanation": (
                            "Сначала сверяем реальный код. Так мы не добавим вторую модель или маршрут и не изменим "
                            "данные в другой версии проекта."
                        ),
                        "steps": [
                            "В `app/api.py` найдём одну `TaskCreate` с `title` и `priority` и проверим три GET-маршрута.",
                            "Убедимся, что API и CLI используют тот же Planner и JSON-файл.",
                            "Запишем `GET /stats` и ответ для одной прежней задачи по её id.",
                            "Если нужного кода нет или версия другая, запишем расхождение и остановимся.",
                        ],
                        "code": (
                            "Старт в app/api.py: TaskCreate(title: str, priority: int)\n"
                            "Существующее чтение: GET /tasks, GET /stats, GET /tasks/{task_id}\n"
                            "Planner и JsonStorage: общее состояние; исходная статистика записана"
                        ),
                        "checks": [
                            "Модель, три GET-маршрута, общий Planner и JSON-хранилище подтверждены.",
                            "Статистика и прежняя задача прочитаны до изменений; JSON сохранён.",
                            "Несовпадение с целевой версией записано; дубликаты не добавлены.",
                        ],
                    },
                    "result": (
                        "Если состояние совпало, `TaskCreate`, три GET-маршрута и общий Planner подтверждены. "
                        "Статистика и прежняя задача записаны, JSON не менялся. При расхождении работа остановлена."
                    ),
                },
                {
                    "title": "POST /tasks создаёт задачу через Planner",
                    "task": (
                        "В `app/api.py` добавьте один `POST /tasks`. Он принимает JSON как `TaskCreate`, передаёт "
                        "`title` и `priority` прежнему `add_task`, а после сохранения возвращает "
                        "`_task_read_data(task)` со статусом 201. Если такой маршрут уже есть, оставьте один."
                    ),
                    "requirements": [
                        "В `app/api.py` зарегистрирован ровно один `POST /tasks` со статусом 201.",
                        "`payload: TaskCreate` получает JSON; `request: Request` даёт доступ к прежнему Planner.",
                        "В `add_task` передаются только `payload.title` и `payload.priority`.",
                        "После сохранения `_task_read_data` возвращает `id`, `title`, `priority`, `is_done`.",
                        "Planner назначает `id` и `is_done=False`; маршрут не создаёт свой список или хранилище.",
                        "Схема и ответ не расширяются новыми полями или `response_model`.",
                    ],
                    "hint": (
                        "Разделы 02–03 теории показывают, как поля проходят через сервис и становятся ответом. "
                        "Возьмите тот же `request.app.state.planner`, который уже используют GET-маршруты."
                    ),
                    "answer": {
                        "explanation": (
                            "`TaskCreate` описывает вход. `add_task` создаёт и сохраняет задачу, а "
                            "`_task_read_data` готовит четыре поля ответа."
                        ),
                        "steps": [
                            "В `app/api.py` используем уже имеющиеся импорты; недостающие добавляем один раз.",
                            "Добавляем `POST /tasks` со статусом 201 и параметрами `payload` и `request`.",
                            "Вызываем прежний `add_task` только с `title` и `priority` из `payload`.",
                            "Возвращаем `_task_read_data` для созданной задачи.",
                            "Если маршрут уже есть, сравниваем его с требованиями и не дублируем.",
                        ],
                        "code": (
                            "@app.post(\"/tasks\", status_code=status.HTTP_201_CREATED)\n"
                            "def create_task(payload: TaskCreate, request: Request):\n"
                            "    try:\n"
                            "        task = request.app.state.planner.add_task(\n"
                            "            payload.title,\n"
                            "            priority=payload.priority,\n"
                            "        )\n"
                            "    except ValueError as error:\n"
                            "        raise HTTPException(\n"
                            "            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,\n"
                            "            detail=str(error),\n"
                            "        ) from error\n"
                            "    return _task_read_data(task)"
                        ),
                        "checks": [
                            "Маршрут вызывает прежний `add_task` ровно один раз.",
                            "Planner задаёт служебные поля; маршрут передаёт только поля клиента.",
                            "Ответ формирует прежний `_task_read_data`; новая схема не добавлена.",
                        ],
                    },
                    "result": (
                        "Один `POST /tasks` принимает `TaskCreate`, вызывает прежний `add_task` и после сохранения "
                        "возвращает четыре поля со статусом 201."
                    ),
                },
                {
                    "title": "Два отказа не добавляют задачу",
                    "task": (
                        "В Swagger по адресу `/docs` отправьте два запроса в `POST /tasks`: "
                        "`{\"title\": \"Повторить HTTP\"}` и "
                        "`{\"title\": \"Повторить HTTP\", \"priority\": 0}`. "
                        "В первом нет обязательного поля. Во втором поле есть, но значение нарушает правило Task."
                    ),
                    "requirements": [
                        "Без `priority` FastAPI возвращает 422 до маршрута; `detail` содержит список ошибок тела.",
                        "`priority=0` доходит до `add_task`; `ValueError` возвращается как 422 со строкой в `detail`.",
                        "В 422 переводится только `ValueError` от `add_task`; `except Exception` не используется.",
                        "После обоих запросов статистика и прежние задачи не изменились.",
                        "Сбой хранилища не маскируется под ошибку запроса.",
                    ],
                    "hint": (
                        "Разделы 01 и 04 теории показывают, где возникают эти ошибки. Проверьте, успел ли запрос "
                        "попасть в маршрут и как выглядит `detail`."
                    ),
                    "answer": {
                        "explanation": (
                            "Без `priority` модель не создаётся, поэтому маршрут не запускается. Ноль проходит "
                            "проверку типа, но его отклоняет правило задачи внутри `add_task`. Только этот ожидаемый "
                            "`ValueError` превращаем в 422."
                        ),
                        "steps": [
                            "Отправляем тело без `priority`: получаем 422 со списком ошибок в `detail`.",
                            "Проверяем, что маршрут не запускался и статистика не изменилась.",
                            "Отправляем тело с `priority=0`: получаем 422 со строкой в `detail`.",
                            "Проверяем, что новая задача не появилась и статистика прежняя.",
                            "В обработчике оставляем только `except ValueError` вокруг `add_task`.",
                        ],
                        "code": (
                            "body без priority → FastAPI/Pydantic → 422 до обработчика\n"
                            "body с priority=0 → add_task / Task → ValueError → 422\n"
                            "оба отказа → статистика Planner не меняется"
                        ),
                        "checks": [
                            "Первый 422 возник до маршрута, второй внутри `add_task`.",
                            "Оба запроса оставили список и статистику без изменений.",
                            "Другие ошибки не превращаются в 422.",
                        ],
                    },
                    "result": (
                        "Без `priority` запрос остановлен до маршрута. `priority=0` отклонён внутри `add_task`. "
                        "Оба ответа имеют статус 422, но разные `detail`; данные не изменились."
                    ),
                },
                {
                    "title": "Задача найдена через API и CLI",
                    "task": (
                        "В Swagger UI `http://127.0.0.1:8000/docs` отправьте тело "
                        "`{\"title\": \"Повторить HTTP\", \"priority\": 4}` в `POST /tasks`. "
                        "Возьмите `id` из ответа. В PowerShell из корня проекта запустите CLI командой "
                        "`.\\.venv\\Scripts\\python.exe -m app.main`, выполните `list` и `exit`. "
                        "Перезапустите API по README и снова прочитайте задачу по тому же `id`."
                    ),
                    "requirements": [
                        "`POST /tasks` возвращает 201, целый `id`, `title=Повторить HTTP`, `priority=4`, `is_done=false`.",
                        "`GET /tasks/{task_id}` по этому `id` возвращает те же четыре поля.",
                        "`GET /stats`: `total` и `open` выросли на 1, `done` не изменился.",
                        "Команда CLI `list` показывает задачу из того же JSON; `exit` закрывает CLI.",
                        "После перезапуска API GET по сохранённому `id` снова находит задачу.",
                        "Новая задача проверена по `id`, а не поиском в первых десяти строках списка.",
                        "Два ответа 422 не добавили задачи; прежние данные сохранены.",
                    ],
                    "hint": (
                        "Раздел 05 теории показывает весь путь проверки. Начните с `id` из ответа POST: точечный GET "
                        "надёжнее короткого списка."
                    ),
                    "answer": {
                        "explanation": (
                            "Ответ 201 подтверждает создание. GET по настоящему `id`, статистика, CLI и повторный GET "
                            "после перезапуска подтверждают, что задача сохранена в общем JSON."
                        ),
                        "steps": [
                            "В Swagger отправляем указанное тело и записываем статус 201 и выданный `id`.",
                            "Читаем задачу через `GET /tasks/{task_id}` по этому `id`; сверяем четыре поля.",
                            "Сравниваем статистику до и после: `total` и `open` выросли на 1, `done` прежний.",
                            "Из корня проекта запускаем CLI. Командой `list` находим задачу, `exit` закрывает CLI.",
                            "Перезапускаем API по команде из README и снова читаем задачу по тому же `id`.",
                            "После двух отказов ещё раз проверяем статистику; JSON вручную не очищаем.",
                        ],
                        "code": (
                            "POST /tasks → 201\n"
                            "Ответ: id=<целое>, title=Повторить HTTP, priority=4, is_done=false\n"
                            "GET /tasks/{id} → те же четыре поля\n"
                            "GET /stats → total и open +1, done без изменений\n"
                            "CLI list и GET после перезапуска → задача найдена"
                        ),
                        "checks": [
                            "Для проверки использован `id` из ответа, а не угаданное число.",
                            "API, CLI и перезапущенный API находят одну сохранённую задачу.",
                            "Прежние данные сохранены; сбой хранилища не проверялся.",
                        ],
                    },
                    "result": (
                        "POST вернул 201 и целый `id`. GET, статистика, CLI и API после перезапуска находят одну "
                        "задачу с нужными четырьмя полями. Два неверных запроса не изменили список."
                    ),
                },
            ],
            "result": (
                "Один POST /tasks принимает TaskCreate, создаёт запись существующим Planner и возвращает HTTP 201 с "
                "четырьмя публичными полями. Ошибка body и предметный ValueError различены при общем статусе 422. "
                "Успешный id прочитан через API и CLI после перезапуска, прежние данные и GET сохранены. Следующий "
                "шаг нормализует границы title, затем добавит ограничения длины и диапазона."
            ),
        }
    ],
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
    "48.1": [
        {
            'title': 'Читаем одну задачу по положительному id',
            'task': (
                'Теория показывает, как выбрать задачу по id, проверить адрес и найти запись через PlannerService. '
                'Добавим один GET /tasks/{task_id}: он вернёт четыре публичных поля, 422 для неверного id и 404, '
                'если положительный id не найден. Остальные данные и маршруты сохранятся.'
            ),
            'tasks': [
                {
                    'title': 'Запишем исходный список, статистику и id',
                    'task': (
                        'Теория раздела 01 различает список и одну задачу. До изменения маршрута сохраним ответы GET /tasks '
                        'и GET /stats. Из списка выберем реальную задачу и запишем её id и четыре поля. Если список пуст '
                        'или маршруты не работают, сначала завершим предыдущий шаг.'
                    ),
                    'requirements': [
                        'Записаны исходные ответы GET /tasks и GET /stats.',
                        'Id взят из текущего списка, а не из номера строки или примера.',
                        'Записаны id, title, priority и is_done выбранной задачи.',
                        'Для item-запроса используется этот id.'
                    ],
                    'hint': (
                        'Возьмём ответы из своего Planner API. Число из примера может не совпасть с id в вашем списке.'
                    ),
                    'answer': {
                        'explanation': (
                            'Это исходное состояние для сравнения. Реальный id поможет проверить, что новый маршрут вернул '
                            'ту же задачу и те же публичные поля.'
                        ),
                        'steps': [
                            'В прежней Planner collection отправим GET /tasks и GET /stats.',
                            'Из списка выберем одну задачу и запишем её id, title, priority и is_done.',
                            'Не меняем задачи и JSON ради примера.'
                        ],
                        'checks': [
                            'GET /tasks показывает реальные задачи, а GET /stats считает весь Planner.',
                            'Id и четыре поля взяты из одной записи.',
                            'Ответы сохранены до изменения app/api.py.'
                        ]
                    }
                },
                {
                    'title': 'Добавим один маршрут к готовому сервису',
                    'task': (
                        'Теория разделов 02, 03, 04 и 05 объясняет проверку id, доступ к PlannerService и обработку отсутствующей задачи. '
                        'Добавим один GET /tasks/{task_id}: FastAPI проверит положительный int, а маршрут вызовет готовый '
                        'get_task и вернёт общую проекцию _task_read_data.'
                    ),
                    'requirements': [
                        'Path-параметр объявлен как Annotated[int, Path(gt=0)], а не как строка с ручным разбором.',
                        'Обработчик использует request.app.state.planner.get_task и общую _task_read_data.',
                        'Зарегистрирован только один GET /tasks/{task_id}.',
                        'Helper переводит только TaskNotFoundError в HTTP 404 с detail Task not found.'
                    ],
                    'hint': (
                        'FastAPI проверит id до вызова обработчика. Helper вызовет готовый get_task и поймает только '
                        'TaskNotFoundError. Поиск и чтение JSON заново не пишем.'
                    ),
                    'answer': {
                        'explanation': (
                            'FastAPI проверяет id до вызова функции. Обработчик берёт тот же PlannerService, который использует '
                            'список. Сервис ищет задачу, helper переводит TaskNotFoundError в 404, а общая проекция возвращает '
                            'те же четыре поля, что и GET /tasks.'
                        ),
                        'steps': [
                            'Импортируем Annotated, Path, Request, HTTPException и существующий TaskNotFoundError.',
                            'Создадим helper, который вызывает переданную функцию и ловит только TaskNotFoundError.',
                            'Для этой ошибки helper поднимает HTTPException со статусом 404 и detail Task not found.',
                            'Добавим один GET /tasks/{task_id}; объявим task_id как Annotated[int, Path(gt=0)].',
                            'Возьмём сервис из request.app.state.planner, вызовем helper с planner.get_task и вернём _task_read_data(task).',
                            'В Postman запросим id из первой карточки и сравним четыре поля с GET /tasks.'
                        ],
                        'code': '''from typing import Annotated
from fastapi import HTTPException, Path, Request
from app.errors import TaskNotFoundError


def _call_with_task_not_found_as_404(operation, *args, **kwargs):
    try:
        return operation(*args, **kwargs)
    except TaskNotFoundError as error:
        raise HTTPException(
            status_code=404,
            detail="Task not found",
        ) from error


@app.get("/tasks/{task_id}")
def read_task(request: Request, task_id: Annotated[int, Path(gt=0)]):
    planner = request.app.state.planner
    task = _call_with_task_not_found_as_404(planner.get_task, task_id)
    return _task_read_data(task)''',
                        'checks': [
                            'Реальный id возвращает 200 и четыре значения, совпадающие с GET /tasks.',
                            'В app/api.py зарегистрирован только один item-маршрут.',
                            'Item-маршрут использует прежние Request, PlannerService и _task_read_data.',
                            'Helper переводит TaskNotFoundError в 404 и не перехватывает прочие исключения.'
                        ]
                    }
                },
                {
                    'title': 'Проверим ответы 422 и 404',
                    'task': (
                        'Разделы 03, 05 и 06 объясняют, где появляются 422 и 404. В Postman проверим id из первой карточки, '
                        'неверные значения /tasks/abc, /tasks/0 и /tasks/-1, а также отсутствующий положительный id. '
                        'Перед отправкой заменим заполнители в URL числами из своего списка. Запросы только читают Planner.'
                    ),
                    'requirements': [
                        'Текстовый id, 0 и отрицательный id дают 422 до вызова сервиса.',
                        'Положительный id без записи даёт 404 и detail Task not found.',
                        'Существующий id даёт 200.',
                        'В URL подставлены реальные числа, заполнители не отправляются.',
                        'Общий except Exception не превращает сбои в 404.'
                    ],
                    'hint': (
                        'Для 404 возьмём число на 1 больше максимального id из списка. Вставим само число, а не имя '
                        'заполнителя. Если список пуст, сначала завершим предыдущий шаг.'
                    ),
                    'answer': {
                        'explanation': (
                            'FastAPI возвращает 422, если id не целое или не больше нуля. Положительный id доходит до сервиса. '
                            'Если записи нет, сервис поднимает TaskNotFoundError, и маршрут возвращает 404. Это разные причины.'
                        ),
                        'steps': [
                            'Подставим сохранённый id и проверим ответ 200.',
                            'Отправим GET /tasks/abc, /tasks/0 и /tasks/-1. Каждый запрос должен получить 422 до вызова обработчика.',
                            'К максимальному id из списка прибавим 1 и подставим полученное число в URL. Задачи не создаём и не удаляем.',
                            'Проверим 404 и значение detail: Task not found.',
                            'Убедимся, что helper ловит только TaskNotFoundError. JSON ради проверки не повреждаем.'
                        ],
                        'code': '''GET {{base_url}}/tasks/<existing_id>
GET {{base_url}}/tasks/abc
GET {{base_url}}/tasks/0
GET {{base_url}}/tasks/-1
GET {{base_url}}/tasks/<missing_positive_id>

# Перед отправкой подставим вместо заполнителей фактические целые числа.

Ожидаемые статусы:
существующий положительный id: 200
abc, 0 и отрицательный id: 422
положительный отсутствующий id: 404

Тело 404:
{"detail": "Task not found"}''',
                        'checks': [
                            'Существующий id возвращает Task со статусом 200.',
                            'abc, 0 и отрицательный id дают 422 до вызова PlannerService.',
                            'Положительный id без записи даёт 404 и detail Task not found.',
                            'StorageError и другие ошибки не превращаются в 404.'
                        ]
                    }
                },
                {
                    'title': 'Сверим Planner до и после чтения',
                    'task': (
                        'Разделы 04 и 06 показывают, что GET читает через общий Planner и не меняет данные. '
                        'После запросов сравним список, статистику, выбранную задачу, CLI и JSON с исходным состоянием.'
                    ),
                    'requirements': [
                        'GET /tasks и GET /stats после проверок совпадают с исходными ответами.',
                        'Четыре поля item совпадают с этой задачей в списке.',
                        'JSON не изменён, поле tags сохранено.',
                        'GET /tasks, GET /stats и CLI продолжают работать.'
                    ],
                    'hint': (
                        'Сравним ответы до и после GET. Проверим CLI и JSON, не меняя задачи.'
                    ),
                    'answer': {
                        'explanation': (
                            'Новый маршрут только читает задачу через готовый сервис. Сравнение list, stats, CLI и JSON '
                            'подтверждает, что данные остались прежними.'
                        ),
                        'steps': [
                            'Повторно отправим GET /tasks и GET /stats и сравним ответы с первой карточкой.',
                            'Сравним четыре поля item с записью того же id в списке.',
                            'Через CLI проверим, что задачи остались на месте.',
                            'Проверим настроенный JSON-файл и убедимся, что поле tags сохранено.',
                            'Сохраним запросы в прежней Planner collection.'
                        ],
                        'code': '''# До добавления item-route
GET /tasks
GET /stats

# После добавления и проверочных GET
GET /tasks
GET /stats
GET {{base_url}}/tasks/<existing_id>

# Перед отправкой подставим id из первой карточки.
# Сравним ответы и файл данных.
# Запросы GET не добавляют, не обновляют и не удаляют Task.''',
                        'checks': [
                            'Список и статистика совпадают с исходными ответами.',
                            'Четыре поля item совпадают с выбранной задачей в списке.',
                            'JSON и поле tags сохранены.',
                            'Маршруты и CLI продолжают работать с тем же Planner.'
                        ]
                    }
                }
            ],
            'result': (
                'GET /tasks/{task_id} возвращает существующую Task со статусом 200 и четырьмя публичными полями. '
                'FastAPI отвечает 422 на неверный id, а TaskNotFoundError становится 404. '
                'Список, статистика, CLI и JSON сохраняют прежнее состояние.'
            )
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
