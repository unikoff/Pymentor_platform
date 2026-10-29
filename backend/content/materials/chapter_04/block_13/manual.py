from typing import Any



MANUAL_PRACTICE: dict[int | str, list[dict[str, Any]]] = {

    61: [{

        "title": "Перенесите HTTP-ресурс tasks в пакет",

        "task": "На checkpoint A перенесите router и схемы задач в пакет ресурса, обновите импорты и сохраните контракт Planner API и CLI. Если ваша копия уже соответствует B, не повторяйте перенос: разберите переход A → B и подтвердите результат проверками.",

        "tasks": [

            {

                "title": "1. Зафиксируйте исходную точку A",

                "task": "Найдите активные router и схемы, проверьте их импорты и точку подключения в api.py. Запишите исходное поведение API и CLI на тестовых данных.",

                "requirements": [

                    "В A найдены активные app/routers/tasks.py и app/schemas.py и потребители этих модулей.",

                    "Исходные проверки API и CLI используют временные данные, а не рабочий JSON.",

                    "Для уже готовой B определён diff, который объясняет перенос файлов и импортов."

                ],

                "hint": "Начните с импорта router в app/api.py и фикстур в tests/conftest.py. Они покажут, что загружается и где изолируются данные.",

                "answer": {

                    "explanation": "До рефакторинга router и схемы были отдельными модулями. Сначала фиксируем эту отправную точку и поведение, чтобы после перемещения сравнивать структуру и результат, а не полагаться только на успешный импорт.",

                    "steps": [

                        "Проверьте git status и откройте app/api.py, app/routers/tasks.py и app/schemas.py.",

                        "Найдите все импорты старых путей через поиск по проекту.",

                        "Запустите существующие API- и CLI-проверки до переноса; тестовая фикстура должна использовать временный JSON.",

                        "Если рабочая копия уже в B, сравните структуру с переходом ad6782a → 9298d10 и не выполняйте перемещение повторно."

                    ],

                    "code": "A: активные модули:\napp/routers/tasks.py\napp/schemas.py\n\nA: подключение в app/api.py:\nfrom app.routers.tasks import router as tasks_router",

                    "checks": [

                        "В app/api.py виден действующий импорт router, а router импортирует схемы.",

                        "Тесты до рефакторинга проходят на изолированном хранилище."

                    ]

                }

            },

            {

                "title": "2. Соберите пакет ресурса и обновите импорты",

                "task": "Переместите router и схемы, добавьте предусмотренные пустые файлы и направьте импорты на новые модули. Сохраните обработчики, схемы и знакомую форму Path-параметра из темы «Path-параметры и поиск объекта».",

                "requirements": [

                    "Активные router и схемы находятся только в app/routers/tasks/router.py и app/routers/tasks/schemas.py.",

                    "app/api.py и router.py используют новые адреса импортов; пустые config.py, dependencies.py и crud.py не содержат будущую логику.",

                    "task_id сохраняет форму Annotated[int, Path(gt=0)], а Task, сервис, storage, API и CLI остаются на прежних границах."

                ],

                "hint": "Имя app/routers/tasks.py конфликтует с каталогом app/routers/tasks/. Сначала временно переместите старый файл, затем создайте пакет и положите router.py внутрь.",

                "answer": {

                    "explanation": "Пакет группирует файлы одного HTTP-ресурса. Точка сборки приложения подключает его router, а router использует схемы по их новому пути; сервис и хранение остаются общими для API и CLI.",

                    "steps": [

                        "Если начинаете с A, переместите tasks.py во временное имя, создайте app/routers/tasks/ и завершите перенос в router.py; schemas.py переместите из app/schemas.py.",

                        "Добавьте пустые __init__.py, app/core/config.py, app/core/dependencies.py и app/routers/tasks/crud.py.",

                        "В app/api.py импортируйте router из app.routers.tasks.router; в router.py импортируйте схемы из app.routers.tasks.schemas.",

                        "Оставьте __init__.py пустыми и не переносите Task, PlannerService, JsonStorage, build_service или CLI."

                    ],

                    "code": "app/\n├── api.py\n├── main.py\n├── core/\n│   ├── __init__.py\n│   ├── config.py\n│   └── dependencies.py\n└── routers/\n    ├── __init__.py\n    └── tasks/\n        ├── __init__.py\n        ├── router.py\n        ├── schemas.py\n        └── crud.py\n\n# app/api.py\nfrom app.routers.tasks.router import router as tasks_router\n\n# app/routers/tasks/router.py\nfrom app.routers.tasks.schemas import TaskCreate, TaskPatch, TaskRead, TaskUpdate\n\nfrom typing import Annotated\nfrom fastapi import Path, Request\n\ndef read_task(request: Request, task_id: Annotated[int, Path(gt=0)]):\n    ...",

                    "checks": [

                        "Новый путь импорта проходит от api.py к router.py и далее к schemas.py без обратной зависимости.",

                        "В проекте не осталось активных app/routers/tasks.py и app/schemas.py.",

                        "Пустые файлы не объявляют Settings, Depends-provider или CRUD."

                    ]

                }

            },

            {

                "title": "3. Подтвердите B регрессией",

                "task": "Сравните целевую структуру с исходной и пройдите прежние HTTP- и CLI-сценарии. Проверьте, что перестановка модулей не меняет данные, статусы и публичную форму ответа.",

                "requirements": [

                    "API и CLI-проверки проходят с временным JSON-файлом.",

                    "GET, POST, невалидный ID, PATCH, DELETE и /stats сохраняют прежние результаты.",

                    "PATCH различает пропущенное поле, null и явное False; DELETE возвращает пустой ответ 204."

                ],

                "hint": "В API-тестах отдельно посмотрите параметризацию ID и проверку bytes ответа DELETE; для CLI запустите его существующие тесты.",

                "answer": {

                    "explanation": "Одна зелёная проверка импорта не подтверждает сохранение контракта. Регрессия проходит через API и CLI, а просмотр дерева и импортов подтверждает, что старые модули не остались вторым активным источником.",

                    "steps": [

                        "Запустите API- и CLI-тесты из корня StudyHub.",

                        "Сверьте ответы GET/POST, 422 для ID меньше или равного нулю, PATCH для False, пропуска и null, а также 204 без тела для DELETE.",

                        "Проверьте /stats и CLI после сценариев; убедитесь, что рабочий JSON не изменился.",

                        "Просмотрите git status и сравните изменения с целевой структурой B; поиском подтвердите отсутствие импортов старых путей."

                    ],

                    "code": "python -m pytest tests/test_api.py tests/test_cli.py\n\n# Старые пути, которых больше не должно быть в активных импортах:\nrg -n 'from app\\.schemas|from app\\.routers\\.tasks import' app",

                    "checks": [

                        "Команда pytest завершается успешно; fixture использует tmp_path/tasks.json.",

                        "Поиск не находит импортов app.schemas или app.routers.tasks как старого модуля.",

                        "В git status видны перемещения и новые файлы пакета, а не копии старого router или схем."

                    ]

                }

            }

        ],

        "result": "Router и схемы собраны в единственном пакете tasks с обновлёнными импортами. Annotated[int, Path(gt=0)] и прежний контракт API, общее хранилище, сервис и CLI сохранены; регрессия проходит на изолированных данных."

    }],

    62: [{

        "title": "Подключите JSON_PATH из окружения и корневого .env",

        "task": (

            "Вынесите путь к JSON Planner в JSON_PATH, сохраните прежний путь по умолчанию и проверьте, "

            "что API, CLI и явно переданный storage сохраняют прежнее поведение."

        ),

        "tasks": [

            {

                "title": "Чтение JSON_PATH",

                "task": (

                    "Модуль app/core/config.py возвращает путь из переменной процесса или корневого .env. "

                    "Если JSON_PATH отсутствует в обоих источниках, используется прежний data/tasks.json."

                ),

                "requirements": [

                    "Зависимость python-dotenv указана в requirements.txt.",

                    "Корневой .env загружается явно через load_dotenv до чтения JSON_PATH.",

                    "Значение процесса имеет приоритет над .env, а отсутствующий ключ выбирает прежний default.",

                    "Пустой JSON_PATH считается заданным и не выбирает default; явный отказ от него и проверка этого случая относятся к теме валидации настроек."

                ],

                "hint": "Найдите корень проекта относительно config.py. load_dotenv получает путь к .env, а override=False сохраняет уже заданное значение процесса.",

                "answer": {

                    "explanation": (

                        "Путь конфигурации теперь читается в одном модуле. load_dotenv с override=False добавляет "

                        "значения файла в окружение, не подменяя уже установленную переменную. Отсутствующее "

                        "значение возвращает прежний путь. Пустой JSON_PATH не включает default и преобразуется в Path('.'), то есть в текущий каталог. Это промежуточное поведение; тема валидации настроек добавит явный отказ и проверит его тестом."

                    ),

                    "steps": [

                        "Добавьте python-dotenv в requirements.txt.",

                        "В config.py определите корень проекта, путь к data/tasks.json и путь к корневому .env.",

                        "В get_json_path сначала вызовите load_dotenv с явным dotenv_path и override=False, затем прочитайте JSON_PATH.",

                        "При значении None верните прежний default, иначе верните Path со считанным значением."

                    ],

                    "code": "from pathlib import Path\nimport os\nfrom dotenv import load_dotenv\n\nPROJECT_ROOT = Path(__file__).resolve().parents[2]\nDEFAULT_JSON_PATH = PROJECT_ROOT / 'data' / 'tasks.json'\nENV_FILE = PROJECT_ROOT / '.env'\n\ndef get_json_path() -> Path:\n    load_dotenv(dotenv_path=ENV_FILE, override=False)\n    value = os.getenv('JSON_PATH')\n    if value is None:\n        return DEFAULT_JSON_PATH\n    return Path(value)",

                    "checks": [

                        "Вызов без JSON_PATH возвращает прежний data/tasks.json.",

                        "Пустой JSON_PATH не включает default и даёт Path('.'); явный отказ и его тест относятся к теме валидации настроек. Settings и валидация путей здесь не появляются."

                    ]

                }

            },

            {

                "title": "Одна конфигурация для сборки сервиса",

                "task": (

                    "Default-сборка PlannerService создаёт JsonStorage с путём из get_json_path. "

                    "Переданный вызывающим кодом storage остаётся тем же объектом."

                ),

                "requirements": [

                    "build_service без аргумента использует get_json_path для JsonStorage.",

                    "build_service(storage) передаёт PlannerService именно этот storage.",

                    "API и CLI продолжают получать сервис через прежнюю функцию build_service."

                ],

                "hint": "Сохраните условие storage is None. Только внутри этой ветки создавайте JsonStorage с результатом get_json_path.",

                "answer": {

                    "explanation": (

                        "Переменную процесса и .env нужно прочитать только для default-сборки. Если вызывающий код "

                        "передал хранилище, замена на JsonStorage изменила бы тестовую изоляцию и поведение клиента."

                    ),

                    "steps": [

                        "Импортируйте get_json_path в main.py.",

                        "Оставьте проверку storage is None.",

                        "В этой ветке создайте JsonStorage(get_json_path()); после ветки соберите PlannerService(storage).",

                        "Проверьте, что существующие вызовы build_service в API и CLI не меняются."

                    ],

                    "code": "from app.core.config import get_json_path\n\ndef build_service(storage=None):\n    if storage is None:\n        storage = JsonStorage(get_json_path())\n    return PlannerService(storage)",

                    "checks": [

                        "Без аргумента сервис получает JsonStorage с выбранным путём.",

                        "С явно переданным storage сервис сохраняет идентичность объекта."

                    ]

                }

            },

            {

                "title": "Безопасный шаблон .env",

                "task": (

                    "В корне проекта находится .env.example с примером JSON_PATH. Личный .env исключён из Git, "

                    "а остальные правила игнорирования сохранены."

                ),

                "requirements": [

                    ".env.example содержит только пример настройки без секретов.",

                    "В корневом .gitignore добавлена точная запись для .env.",

                    "Проверка Git не показывает личный .env среди отслеживаемых файлов."

                ],

                "hint": "Шаблон хранит имя переменной и безопасный пример значения. В ignore добавьте именно .env, не исключая .env.example.",

                "answer": {

                    "explanation": (

                        ".env.example помогает воспроизвести настройку, но не содержит личных данных. Точная запись "

                        ".env скрывает локальный файл и оставляет шаблон доступным для Git."

                    ),

                    "steps": [

                        "Создайте в корне .env.example с одной строкой JSON_PATH=C:/planner-data/tasks-copy.json.",

                        "Добавьте .env в корневой .gitignore, сохранив остальные записи.",

                        "Проверьте git status и git check-ignore для личного .env и шаблона."

                    ],

                    "code": ".env.example\nJSON_PATH=C:/planner-data/tasks-copy.json\n\n.gitignore\n.env",

                    "checks": [

                        ".env.example остаётся видимым для Git.",

                        "Личный .env не попадает в индекс Git.",

                        "В примере нет токенов, паролей и других секретов."

                    ]

                }

            },

            {

                "title": "Изолированная проверка источников и запуска",

                "task": (

                    "Проверки на отдельных временных JSON-файлах подтверждают default, значение процесса, значение .env, "

                    "приоритет процесса и общий выбранный файл для API и CLI."

                ),

                "requirements": [

                    "Каждый сценарий использует изолированный временный .env или JSON-файл.",

                    "Проверены отсутствие настройки, только процесс, только файл и конфликт процесса с файлом.",

                    "API GET/POST и команда CLI list читают один выбранный временный JSON.",

                    "Явно переданный storage остаётся изолированным и не подменяется настройкой среды.",

                    "Рабочий data/tasks.json не перезаписывается тестами."

                ],

                "hint": "Патчите ENV_FILE на путь внутри tmp_path. Для конфликта задайте JSON_PATH через monkeypatch и запишите другое значение в тестовый .env.",

                "answer": {

                    "explanation": (

                        "Каждый источник проверяется отдельно, чтобы значение из одного сценария не загрязняло следующий. "

                        "В интеграционной проверке API и CLI получают сервис через одну default-сборку и указывают на "

                        "тот же временный JSON; рабочие данные проекта остаются вне теста."

                    ),

                    "steps": [

                        "В тестах направьте ENV_FILE в tmp_path и удалите JSON_PATH из окружения через monkeypatch для сценариев без переменной процесса.",

                        "Сравните возвращаемый путь с прежним default, временным путём из окружения и временным путём из тестового .env.",

                        "Для проверки приоритета задайте разные пути в процессе и .env; ожидаемым остаётся путь процесса.",

                        "Подключите API к сервису на временном JSON, выполните GET и POST, затем вызовите CLI list через ту же конфигурацию.",

                        "Отдельно передайте временный storage в build_service и проверьте, что сервис хранит именно его."

                    ],

                    "code": "def test_process_value_wins_over_env_file(monkeypatch, tmp_path):\n    env_file = tmp_path / '.env'\n    env_file.write_text(f'JSON_PATH={tmp_path / \"from_file.json\"}\\n', encoding='utf-8')\n    process_path = tmp_path / 'from_process.json'\n    monkeypatch.setattr(config, 'ENV_FILE', env_file)\n    monkeypatch.setenv('JSON_PATH', str(process_path))\n\n    assert config.get_json_path() == process_path",

                    "checks": [

                        "Тесты не читают и не перезаписывают data/tasks.json.",

                        "Значение процесса выигрывает у конфликтующего значения в .env.",

                        "Ответы API и результат CLI отражают состояние одного выбранного временного файла."

                    ]

                }

            }

        ],

        "result": (

            "Обычный запуск сохраняет прежний путь; JSON_PATH читается из процесса или корневого .env с приоритетом процесса. "

            "API и CLI используют один выбранный JSON, явный storage сохраняется, а проверки изолированы от рабочих данных."

        )

    }],    "62.1": [{

        "title": "Централизуйте Settings в существующем Planner",

        "task": (

            "Обновите текущую конфигурационную границу StudyHub Planner после настройки окружения. "

            "API и CLI должны загружать общую конфигурацию и использовать одинаковые правила JSON_PATH. "

            "FastAPI использует проверенный app_name как заголовок, CLI сохраняет фиксированную подпись меню; PlannerService, JSON-контракт и явно переданный storage остаются прежними."

        ),

        "tasks": [

            {

                "title": "Соберите Settings и загрузчик значений",

                "task": (

                    "Реализуйте app/core/config.py так, чтобы load_settings превращал строки окружения "

                    "в один проверенный Settings до создания storage или приложения."

                ),

                "requirements": [

                    "Settings: обычная dataclass с json_path: Path и app_name: str; она хранит значения, а не загружает или проверяет их сама.",

                    "При отсутствии JSON_PATH используйте прежний data/tasks.json, а при отсутствии APP_NAME используйте StudyHub Planner; явно пустые значения отклоняйте с ошибкой, называющей настройку. Общий загрузчик проверяет APP_NAME для обоих запусков; FastAPI использует его в заголовке, CLI сохраняет фиксированную подпись меню.",

                    "Относительный JSON_PATH привяжите к корню проекта, абсолютный сохраните, существующую папку вместо файла отклоните; отсутствие самого файла допустимо.",

                    "Читайте уже подготовленное окружение; не добавляйте BaseSettings, lru_cache или повторную загрузку .env."

                ],

                "hint": "Начните с различия между values.get(key) == None и пустой строкой. Затем преобразуйте JSON_PATH в Path и разрешите только относительный путь от корня проекта.",

                "answer": {

                    "explanation": (

                        "Загрузчик принимает отдельное отображение окружения для изолированных проверок и использует os.environ в обычном запуске. "

                        "Default применяется только при отсутствии ключа; пробельная строка считается явно пустым вводом. Dataclass создаётся после преобразований и проверки каталога."

                    ),

                    "steps": [

                        "Определяем корень рядом с app/core/config.py, а не через текущую рабочую папку процесса.",

                        "Подставляем прежний путь и имя только при отсутствии соответствующего ключа.",

                        "Отклоняем пустые значения до преобразования, чтобы ошибка не скрылась за default.",

                        "Преобразуем путь и привязываем относительный вариант к корню проекта.",

                        "Отклоняем существующий каталог, но разрешаем ещё не созданный JSON-файл.",

                        "Возвращаем Settings только после успешных проверок."

                    ],

                    "code": """# app/core/config.py

from collections.abc import Mapping

from dataclasses import dataclass

import os

from pathlib import Path





PROJECT_ROOT = Path(__file__).resolve().parents[2]

DEFAULT_JSON_PATH = Path("data/tasks.json")

DEFAULT_APP_NAME = "StudyHub Planner"





@dataclass

class Settings:

    json_path: Path

    app_name: str





def load_settings(

    environ: Mapping[str, str] | None = None,

    project_root: Path = PROJECT_ROOT,

) -> Settings:

    values = os.environ if environ is None else environ



    raw_path = values.get("JSON_PATH")

    if raw_path is None:

        raw_path = str(DEFAULT_JSON_PATH)

    elif not raw_path.strip():

        raise ValueError("JSON_PATH must not be empty")



    json_path = Path(raw_path)

    if not json_path.is_absolute():

        json_path = (project_root / json_path).resolve()

    if json_path.exists() and json_path.is_dir():

        raise ValueError("JSON_PATH must point to a file, not a directory")



    raw_name = values.get("APP_NAME")

    if raw_name is None:

        app_name = DEFAULT_APP_NAME

    elif not raw_name.strip():

        raise ValueError("APP_NAME must not be empty")

    else:

        app_name = raw_name



    return Settings(json_path=json_path, app_name=app_name)""",

                    "checks": [

                        "Пустое отображение даёт абсолютный путь <корень проекта>/data/tasks.json и имя StudyHub Planner.",

                        "Относительное значение разрешается от project_root, даже если текущая папка процесса другая.",

                        "Пустые JSON_PATH и APP_NAME называют неверный ключ в ValueError; путь-каталог отклоняется до создания JsonStorage."

                    ]

                }

            },

            {

                "title": "Передайте конфигурацию точкам запуска",

                "task": (

                    "Подключите готовый Settings к существующим app/main.py и app/api.py. "

                    "Обе точки должны использовать один способ загрузки и прежний build_service, "

                    "а явный тестовый storage должен оставаться выбранным объектом."

                ),

                "requirements": [

                    "Расширьте build_service необязательным settings; при переданном storage верните PlannerService именно с этим объектом и не читайте для выбора storage рабочее окружение.",

                    "В default-ветке создайте JsonStorage из settings.json_path; прямой build_service() по-прежнему получает конфигурацию запуска.",

                    "API один раз загружает Settings, передаёт app_name в FastAPI и сохраняет settings и прежний сервис в app.state.settings и app.state.planner.",

                    "CLI загружает Settings при запуске и передаёт их build_service; использует json_path, не читает окружение в командах и сохраняет фиксированную подпись show_menu. APP_NAME задаёт заголовок FastAPI, но не меняет меню CLI.",

                    "Не создавайте второй PlannerService и не переносите настройки в HTTP-схему."

                ],

                "hint": "Оставьте одну точку создания PlannerService. Сначала проверьте явный storage, затем выбирайте Settings и JsonStorage только для default-ветки.",

                "answer": {

                    "explanation": (

                        "Обе точки запуска вызывают один load_settings, но получают отдельный объект в каждом процессе. "

                        "API использует имя при создании FastAPI и хранит конфигурацию рядом с готовым сервисом; CLI берёт json_path без FastAPI-механизмов и сохраняет фиксированную подпись show_menu. "

                        "Ранний возврат для storage сохраняет существующую тестовую опору и не зависит от пользовательского JSON_PATH."

                    ),

                    "steps": [

                        "Добавляем settings в build_service, сохраняя прежний аргумент storage.",

                        "Если storage передан явно, собираем PlannerService на нём и выходим без чтения настроек для хранения.",

                        "Иначе загружаем Settings при необходимости и создаём единственный JsonStorage по json_path.",

                        "В API загружаем объект до создания FastAPI и сохраняем его в app.state.settings.",

                        "Оставляем PlannerService в app.state.planner, чтобы существующие task-роуты и /stats продолжили работать.",

                        "В CLI загружаем Settings на старте; build_service использует json_path, а show_menu сохраняет фиксированную подпись StudyHub Planner."

                    ],

                    "code": """# app/main.py: единая фабрика сервиса

def build_service(storage=None, settings=None):

    if storage is not None:

        return PlannerService(storage)

    if settings is None:

        settings = load_settings()

    return PlannerService(JsonStorage(settings.json_path))





# app/api.py: сборка API

settings = load_settings()

app = FastAPI(title=settings.app_name)

app.state.settings = settings

app.state.planner = build_service(settings=settings)





# app/main.py: CLI entry point

def main():

    settings = load_settings()

    try:

        return run(build_service(settings=settings))

    except StorageError as error:

        print(f"Planner остановлен: {error}")""",

                    "checks": [

                        "При build_service(storage=test_storage) у результата service.storage is test_storage.",

                        "API сохраняет тот же PlannerService в app.state.planner; settings доступны в app.state.settings.",

                        "CLI и API выбирают один JSON-путь по общим правилам; APP_NAME меняет заголовок FastAPI, подпись меню CLI остаётся StudyHub Planner."

                    ]

                }

            },

            {

                "title": "Докажите изоляцию и сохранность Planner",

                "task": (

                    "Добавьте проверки загрузчика и сборки на временных путях. "

                    "Подтвердите, что относительный JSON_PATH не зависит от cwd, неверная конфигурация "

                    "останавливается до записи, а прежние операции API и CLI остаются рабочими."

                ),

                "requirements": [

                    "Используйте явное отображение environ и временный project_root; не наследуйте случайные JSON_PATH и APP_NAME процесса.",

                    "Проверьте defaults, оба пустых значения, абсолютный путь, существующий каталог и одинаковый относительный путь из двух cwd.",

                    "Проверьте, что явно переданный JsonStorage сохраняет идентичность и не открывается рабочий data/tasks.json.",

                    "После настройки повторно проверьте CRUD, /stats и CLI на изолированном JSON; при временной подмене app.state восстановите прежние значения."

                ],

                "hint": "Сравните абсолютный результат load_settings при двух текущих папках. Для ошибок используйте pytest.raises, а для сборки передайте JsonStorage с путём внутри tmp_path.",

                "answer": {

                    "explanation": (

                        "Входы теста заданы явно, поэтому результат не меняется из-за локального .env или настроек машины. "

                        "Проверка двух cwd доказывает, что источник относительного пути находится в корне проекта. "

                        "Отдельный тест идентичности storage подтверждает, что настройки default не подменяют явно выбранное хранилище."

                    ),

                    "steps": [

                        "Создаём две рабочие папки и вызываем load_settings с одним project_root из каждой.",

                        "Сравниваем полученный абсолютный путь и default-имя приложения.",

                        "Отдельно проверяем отказ на пустых настройках и существующем каталоге.",

                        "Собираем сервис с JsonStorage внутри tmp_path и сравниваем идентичность объекта.",

                        "Запускаем существующие проверки API, stats и CLI, направляя их на временные данные."

                    ],

                    "code": """# tests/test_config.py

import pytest



from app.core.config import load_settings

from app.main import build_service

from app.storage import JsonStorage





def test_relative_path_is_stable_across_working_directories(tmp_path, monkeypatch):

    first_cwd = tmp_path / "first"

    second_cwd = tmp_path / "second"

    first_cwd.mkdir()

    second_cwd.mkdir()



    monkeypatch.chdir(first_cwd)

    first = load_settings({}, project_root=tmp_path)

    monkeypatch.chdir(second_cwd)

    second = load_settings({}, project_root=tmp_path)



    expected = (tmp_path / "data" / "tasks.json").resolve()

    assert first.json_path == expected

    assert second.json_path == expected

    assert first.app_name == "StudyHub Planner"





@pytest.mark.parametrize(

    ("environ", "key"),

    [({"JSON_PATH": "  "}, "JSON_PATH"), ({"APP_NAME": ""}, "APP_NAME")],

)

def test_explicit_empty_values_are_rejected(tmp_path, environ, key):

    with pytest.raises(ValueError, match=key):

        load_settings(environ, project_root=tmp_path)





def test_absolute_path_is_not_rebased(tmp_path):
    absolute = (tmp_path / "external.json").resolve()
    settings = load_settings(
        {"JSON_PATH": str(absolute)},
        project_root=tmp_path / "other",
    )

    assert settings.json_path == absolute


def test_directory_is_not_a_json_file(tmp_path):

    directory = tmp_path / "tasks"

    directory.mkdir()



    with pytest.raises(ValueError, match="JSON_PATH"):

        load_settings({"JSON_PATH": str(directory)}, project_root=tmp_path)





def test_build_service_keeps_injected_storage(tmp_path):

    storage = JsonStorage(tmp_path / "tasks.json")



    service = build_service(storage)



    assert service.storage is storage""",

                    "checks": [

                        "Тестовый файл лежит под tmp_path, а рабочий JSON после сценариев не изменился.",

                        "Отсутствующий JSON допустим до первой записи, а каталог и пустые значения вызывают ошибку настройки.",

                        "Существующие API, /stats и CLI сохраняют CRUD и видят одно состояние после перезапуска сервиса."

                    ]

                }

            }

        ],

        "result": "API использует app_name как заголовок FastAPI, а API и CLI выбирают JSON по одинаковым правилам; меню CLI сохраняет StudyHub Planner, сервис и JSON-файл прежние.",

    }],

    63: [{

        "title": "Подключить PlannerService через простой Depends",

        "task": "Task-обработчики и /stats получают один готовый PlannerService из состояния текущего приложения. Provider возвращает существующий экземпляр и не создаёт сервис или хранилище на каждый запрос. Публичные операции, ответы и CLI сохраняют прежнее поведение.",

        "tasks": [

            {

                "title": "Provider возвращает PlannerService текущего приложения",

                "task": "Функция get_planner принимает Request текущего приложения и возвращает объект из app.state.planner.",

                "requirements": [

                    "app/core/dependencies.py содержит get_planner с параметром Request и результатом типа PlannerService.",

                    "Функция возвращает существующий объект и не вызывает build_service или JsonStorage."

                ],

                "hint": "Посмотри, какой объект приложение уже назначает в app.state при сборке. Request даёт доступ к состоянию именно того приложения, которое обслуживает запрос.",

                "answer": {

                    "explanation": "Provider здесь является обычной функцией с явным входом и результатом. Она читает ссылку из текущего Request и возвращает тот же экземпляр PlannerService, не создавая ещё один сервис.",

                    "steps": [

                        "Импорт Request задаёт тип входа функции, а PlannerService описывает возвращаемый объект.",

                        "request.app указывает на приложение текущего запроса; его state содержит ранее собранный Planner.",

                        "Возврат app.state.planner сохраняет общий сервис для API и статистики."

                    ],

                    "code": "from fastapi import Request\n\nfrom app.services import PlannerService\n\n\ndef get_planner(request: Request) -> PlannerService:\n    return request.app.state.planner",

                    "checks": [

                        "Provider не вызывает конструктор PlannerService, build_service или JsonStorage.",

                        "Вызов возвращает тот же объект, который был установлен в app.state.planner."

                    ]

                }

            },

            {

                "title": "Task-маршруты и /stats получают сервис через Depends",

                "task": "Каждый HTTP-обработчик получает PlannerService параметром, а его тело вызывает прежний метод сервиса.",

                "requirements": [

                    "В Depends передаётся get_planner без скобок; прямая ссылка request.app.state.planner остаётся только в provider и сборке приложения.",

                    "Маршруты, CLI, схемы, коды ответов и обработка ошибок сохраняют прежнее поведение."

                ],

                "hint": "Сначала замени источник Planner у одного GET. Оставь вызов select_tasks прежним, затем перенеси тот же параметр в остальные handlers и /stats.",

                "answer": {

                    "explanation": "Depends принимает callable и описывает FastAPI источник аргумента. FastAPI вызывает provider во время обработки запроса и передаёт возвращённый PlannerService в параметр; остальные методы сервиса не меняются.",

                    "steps": [

                        "Импортируй Depends, get_planner и PlannerService в router и app.api.",

                        "В каждом из шести task-handlers замени Request на параметр planner: PlannerService = Depends(get_planner); в теле используй planner вместо request.app.state.planner.",

                        "Для /stats объяви такой же параметр и оставь вызов planner.get_statistics().",

                        "Не создавай alias через Annotated: простая запись Depends относится к этому шагу, а общий alias разбирается дальше."

                    ],

                    "code": """# app/routers/tasks/router.py
from fastapi import APIRouter, Depends, HTTPException, Path, Query, Response, status

from app.core.dependencies import get_planner
from app.errors import TaskNotFoundError
from app.routers.tasks.schemas import TaskCreate, TaskPatch, TaskRead, TaskUpdate
from app.services import PlannerService


router = APIRouter(prefix="/tasks", tags=["tasks"])


def _call_with_task_not_found_as_404(operation, *args, **kwargs):
    try:
        return operation(*args, **kwargs)
    except TaskNotFoundError as error:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Task not found",
        ) from error


def _task_read_data(task):
    return {
        "id": task.id,
        "title": task.title,
        "priority": task.priority,
        "is_done": task.is_done,
    }


@router.get("", response_model=list[TaskRead])
def read_tasks(
    planner: PlannerService = Depends(get_planner),
    is_done: bool | None = None,
    sort_desc: bool = False,
    limit: int = Query(default=10, ge=1, le=50),
):
    tasks = planner.select_tasks(
        is_done=is_done,
        sort_desc=sort_desc,
        limit=limit,
    )
    return [_task_read_data(task) for task in tasks]


@router.get("/{task_id}", response_model=TaskRead)
def read_task(
    planner: PlannerService = Depends(get_planner),
    task_id: int = Path(gt=0),
):
    task = _call_with_task_not_found_as_404(planner.get_task, task_id)
    return _task_read_data(task)


@router.put("/{task_id}", response_model=TaskRead)
def update_task(
    payload: TaskUpdate,
    planner: PlannerService = Depends(get_planner),
    task_id: int = Path(gt=0),
):
    task = _call_with_task_not_found_as_404(
        planner.replace_task,
        task_id,
        title=payload.title,
        priority=payload.priority,
        is_done=payload.is_done,
    )
    return _task_read_data(task)


@router.patch("/{task_id}", response_model=TaskRead)
def patch_task_endpoint(
    payload: TaskPatch,
    planner: PlannerService = Depends(get_planner),
    task_id: int = Path(gt=0),
):
    changes = payload.model_dump(
        exclude_unset=True,
        exclude_none=True,
    )
    task = _call_with_task_not_found_as_404(
        planner.patch_task, task_id, **changes
    )
    return _task_read_data(task)


@router.delete(
    "/{task_id}",
    status_code=status.HTTP_204_NO_CONTENT,
)
def delete_task_endpoint(
    planner: PlannerService = Depends(get_planner),
    task_id: int = Path(gt=0),
):
    _call_with_task_not_found_as_404(planner.delete_task, task_id)
    return Response(status_code=status.HTTP_204_NO_CONTENT)


@router.post("", status_code=status.HTTP_201_CREATED, response_model=TaskRead)
def create_task(
    payload: TaskCreate,
    planner: PlannerService = Depends(get_planner),
):
    try:
        task = planner.add_task(
            payload.title,
            priority=payload.priority,
        )
    except ValueError as error:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=str(error),
        ) from error

    return _task_read_data(task)


# app/api.py imports:
from fastapi import Depends
from app.core.dependencies import get_planner
from app.services import PlannerService


@app.get("/stats")
def read_stats(planner: PlannerService = Depends(get_planner)):
    statistics = planner.get_statistics()
    return {
        "total": statistics["all"],
        "open": statistics["open"],
        "done": statistics["done"],
    }
""",

                    "checks": [

                        "Все task-маршруты и /stats используют параметр planner из Depends(get_planner).",

                        "CLI продолжает собирать сервис через build_service и не вызывает HTTP-provider."

                    ]

                }

            },

            {

                "title": "API-fixture подтверждает общий сервис и прежние ответы",

                "task": "Связанный HTTP-тест использует временный JsonStorage из api_client и проверяет состояние после нескольких запросов.",

                "requirements": [

                    "Сценарий проверяет создание и чтение задачи, /stats, неизвестный id, PATCH с is_done=False и пустой ответ DELETE 204.",

                    "Fixture восстанавливает прежний app.state.planner, а данные остаются во временном файле."

                ],

                "hint": "Используй уже подготовленный api_client: он подключает api_service на временном JSON и возвращает исходную ссылку после завершения теста.",

                "answer": {

                    "explanation": "Тест проходит через FastAPI, поэтому проверяет фактическое разрешение Depends. Последовательные запросы показывают, что запись создана одним сервисом и видна следующему запросу и статистике.",

                    "steps": [

                        "api_client использует api_service, собранный на tmp_path, а fixture гарантирует возврат прежнего состояния в finally.",

                        "После POST возьми выданный сервером id и проверь GET и /stats через тот же клиент.",

                        "Проверь 404, сначала отметь задачу выполненной, затем отправь PATCH с явным false и проверь удаление с пустым body и статусом 204."

                    ],

                    "code": "def test_api_uses_one_planner(api_client):\n    created = api_client.post(\"/tasks\", json={\"title\": \"Read\", \"priority\": 2})\n    assert created.status_code == 201\n    task_id = created.json()[\"id\"]\n    path = f\"/tasks/{task_id}\"\n\n    assert api_client.get(path).json() == created.json()\n    assert api_client.get(\"/stats\").json() == {\"total\": 1, \"open\": 1, \"done\": 0}\n    assert api_client.get(\"/tasks/999\").status_code == 404\n\n    done = api_client.put(\n        path, json={\"title\": \"Read\", \"priority\": 2, \"is_done\": True}\n    )\n    assert done.status_code == 200\n    reopened = api_client.patch(path, json={\"is_done\": False})\n    assert reopened.status_code == 200\n    assert reopened.json()[\"is_done\"] is False\n\n    deleted = api_client.delete(path)\n    assert deleted.status_code == 204\n    assert deleted.text == \"\"",

                    "checks": [

                        "POST returns 201, GET sees the created task and /stats reports the same single record.",

                        "Unknown task id returns 404; PATCH preserves explicit false; DELETE returns 204 without a response body.",

                        "The api_client fixture stores data under tmp_path and restores app.state.planner in finally."

                    ]

                }

            }

        ],

        "result": "Task API и /stats используют один собранный PlannerService; последовательный сценарий CRUD подтверждает прежние ответы, а fixture сохраняет временный JSON и восстанавливает состояние."

    }],

    "63.1": [{

        "title": "Обновите объявления Planner API без изменения HTTP-договора",

        "task": "После простого provider маршруты задач и /stats получают прежний PlannerService через Annotated aliases. Параметры и запросы сохраняют прежний договор.",

        "tasks": [

            {

                "title": "Объявите общий PlannerDep",

                "task": "Task-маршруты и /stats получают собранный PlannerService через alias, ссылающийся на существующий get_planner.",

                "requirements": [

                    "PlannerDep связывает PlannerService и Depends(get_planner) через typing.Annotated.",

                    "Все task-обработчики и /stats принимают PlannerDep и вызывают прежние методы сервиса.",

                    "get_planner возвращает сервис из app.state и не создаёт новый PlannerService или JsonStorage."

                ],

                "hint": "Сверьте возвращаемый тип get_planner. В metadata передаётся функция provider, без круглых скобок.",

                "answer": {

                    "explanation": "Мы сохраняем provider из предыдущего шага и переиспользуем его декларацию. FastAPI вызывает get_planner при обработке запроса; Annotated не создаёт новый тип сервиса и не добавляет поле в запрос.",

                    "steps": [

                        "Оставляем get_planner без изменений: он возвращает уже собранный app.state.planner.",

                        "Добавляем Annotated и Depends, затем объявляем PlannerDep рядом с provider.",

                        "В каждом обработчике принимаем planner: PlannerDep и сохраняем прежний вызов сервиса; так же меняем /stats."

                    ],

                    "code": "from typing import Annotated\nfrom fastapi import Depends, Request\n\nfrom app.services import PlannerService\n\n\ndef get_planner(request: Request) -> PlannerService:\n    return request.app.state.planner\n\n\nPlannerDep = Annotated[PlannerService, Depends(get_planner)]",

                    "checks": [

                        "В app.state остаётся тот же PlannerService.",

                        "В обработчиках больше нет прямого request.app.state.planner.",

                        "В OpenAPI нет нового параметра planner."

                    ]

                }

            },

            {

                "title": "Свяжите Path и Query с базовыми типами",

                "task": "Path и Query задают источник и ограничения прежних параметров, а Python defaults сохраняют поведение при пропуске query.",

                "requirements": [

                    "TaskId соответствует положительному path-id.",

                    "IsDoneFilter, SortDescFilter и TaskLimit сохраняют типы и прежние defaults.",

                    "limit сохраняет границы 1–50; None, False и 10 остаются defaults функции."

                ],

                "hint": "Оставьте Path(gt=0) и Query(ge=1, le=50) в Annotated, а defaults укажите после alias.",

                "answer": {

                    "explanation": "Мы отделяем metadata FastAPI от Python default. Annotated задаёт источник и границы; присваивание после типа задаёт значение, когда query не передан.",

                    "steps": [

                        "Объявляем aliases рядом с сигнатурами task-router.",

                        "В списке задач сохраняем None у is_done, False у sort_desc и 10 у limit.",

                        "Используем TaskId во всех item-маршрутах, не меняя их пути и методы."

                    ],

                    "code": "from typing import Annotated\nfrom fastapi import Path, Query\n\nTaskId = Annotated[int, Path(gt=0)]\nIsDoneFilter = Annotated[bool | None, Query()]\nSortDescFilter = Annotated[bool, Query()]\nTaskLimit = Annotated[int, Query(ge=1, le=50)]\n\n\ndef read_tasks(\n    planner: PlannerDep,\n    is_done: IsDoneFilter = None,\n    sort_desc: SortDescFilter = False,\n    limit: TaskLimit = 10,\n):\n    ...\n\n\ndef read_task(task_id: TaskId, planner: PlannerDep):\n    ...",

                    "checks": [

                        "Path id остаётся положительным.",

                        "limit по умолчанию равен 10; границы остаются 1 и 50.",

                        "is_done без query равен None, sort_desc равен False."

                    ]

                }

            },

            {

                "title": "Сохраните сигнатуры PUT и PATCH",

                "task": "PUT и PATCH принимают обязательные payload и task_id, затем получают прежний PlannerDep. Схемы тела и методы сервиса остаются прежними.",

                "requirements": [

                    "payload в обоих обработчиках остаётся обязательным.",

                    "task_id использует TaskId без default.",

                    "Порядок аргументов не нарушает правила Python."

                ],

                "hint": "Path(gt=0) без присваивания оставляет id обязательным. Сначала разместите аргументы без default.",

                "answer": {

                    "explanation": "Мы сохраняем обязательность body и path-id. PlannerDep тоже не имеет Python default, поэтому сигнатура остаётся допустимой, а PUT/PATCH продолжают работать с прежними схемами.",

                    "steps": [

                        "Меняем только объявления параметров и получение сервиса.",

                        "Оставляем вызовы replace_task и patch_task с прежними аргументами.",

                        "Не добавляем default к payload, не меняем схемы и не переносим CRUD в dependency."

                    ],

                    "code": "# Фрагменты сигнатур; тела обработчиков сохраняются\ndef update_task(payload: TaskUpdate, task_id: TaskId, planner: PlannerDep):\n    ...\n\n\ndef patch_task_endpoint(payload: TaskPatch, task_id: TaskId, planner: PlannerDep):\n    ...",

                    "checks": [

                        "Модуль импортируется без SyntaxError.",

                        "Отсутствующий body по-прежнему получает 422.",

                        "PUT сохраняет tags; PATCH сохраняет обработку отсутствующего поля, null и False."

                    ]

                }

            },

            {

                "title": "Подтвердите прежний контракт",

                "task": "OpenAPI описывает прежние path/query/body и ответы; изолированные запросы подтверждают defaults, границы и результаты Planner.",

                "requirements": [

                    "Сравните OpenAPI до и после; planner не является параметром клиента.",

                    "На api_client/api_service проверьте defaults, limit 1/50, отказы 0/51 и положительный path-id.",

                    "Проверьте фильтр, сортировку, PUT/PATCH, DELETE и /stats на временном JSON."

                ],

                "hint": "Используйте fixtures api_client и api_service: JsonStorage работает в tmp_path.",

                "answer": {

                    "explanation": "Мы проверяем и описание, и runtime. OpenAPI показывает публичную форму, а запросы подтверждают преобразование значений, граничную валидацию и вызов того же сервиса. Данные остаются в tmp_path.",

                    "steps": [

                        "Сравниваем имена, расположение и defaults параметров, ограничения limit, body-схемы и ответы.",

                        "Проверяем обычный GET, фильтр is_done, sort_desc, limit 1/50 и отказы 0/51.",

                        "Проверяем положительный id, 0 и нечисловой id, затем прежние POST, PUT, PATCH, DELETE и /stats.",

                        "Различаем старую и новую запись: Annotated прикрепляет metadata, но не меняет тип, default или HTTP-контракт."

                    ],

                    "code": "def test_annotated_query_contract(api_client, api_service):\n    first = api_service.add_task(\"Open\", 2)\n    second = api_service.add_task(\"Done\", 3)\n    api_service.mark_done(second.id)\n\n    assert [item[\"id\"] for item in api_client.get(\"/tasks\").json()] == [first.id, second.id]\n    assert [item[\"id\"] for item in api_client.get(\"/tasks?is_done=true\").json()] == [second.id]\n    assert [item[\"id\"] for item in api_client.get(\"/tasks?sort_desc=true&limit=1\").json()] == [second.id]\n    assert api_client.get(\"/tasks?limit=1\").status_code == 200\n    assert api_client.get(\"/tasks?limit=50\").status_code == 200\n    assert api_client.get(\"/tasks?limit=0\").status_code == 422\n    assert api_client.get(\"/tasks?limit=51\").status_code == 422\n    assert api_client.get(\"/tasks/0\").status_code == 422\n    assert api_client.get(\"/tasks/not-an-int\").status_code == 422\n    assert api_client.get(\"/stats\").json() == {\"total\": 2, \"open\": 1, \"done\": 1}",

                    "checks": [

                        "PlannerDep не появляется среди HTTP-параметров OpenAPI.",

                        "Прежний публичный договор подтверждён успешными и граничными запросами.",

                        "Тестовый JsonStorage находится под tmp_path."

                    ]

                }

            }

        ],

        "result": "Task-router и /stats используют один PlannerService через PlannerDep; Path, Query, defaults, схемы и ответы сохраняют прежний HTTP-договор. Регрессия подтверждает обычные и граничные сценарии на изолированном JSON."

    }],

    64: [{
        "title": "Подготовленная выборка сохраняет контракт и тестовую изоляцию",
        "task": "GET /tasks использует небольшой граф зависимостей для прежних query-параметров и PlannerService. Тестовый provider возвращает отдельный сервис, а рабочие данные остаются изолированными.",
        "tasks": [
            {
                "title": "SelectionParams и provider сохраняют прежнюю выборку",
                "task": "SelectionParams собирает прежние query-параметры, а get_selected_tasks передаёт их существующему PlannerService.",
                "requirements": [
                    "is_done остаётся необязательным, sort_desc по умолчанию равен False, limit по умолчанию равен 10 и ограничен диапазоном 1–50.",
                    "get_selection возвращает SelectionParams; get_selected_tasks вызывает select_tasks без дублирования фильтрации."
                ],
                "hint": "Сверьте defaults и ограничения с текущим GET /tasks. Контейнер описывает HTTP-вход, а не поля Task.",
                "answer": {
                    "explanation": "FastAPI получает значения через небольшой граф и передаёт их сервису. Фильтрация остаётся в select_tasks, поэтому provider не создаёт вторую бизнес-операцию.",
                    "steps": [
                        "SelectionParams хранит только is_done, sort_desc и limit.",
                        "get_selection собирает прежние Query-параметры и ограничения limit.",
                        "get_selected_tasks получает параметры и Planner через Depends, затем вызывает select_tasks."
                    ],
                    "code": '''# Фрагмент provider-ов; PlannerDep, Depends и Task берутся из приложения
from dataclasses import dataclass
from typing import Annotated

from fastapi import Depends, Query


@dataclass(frozen=True)
class SelectionParams:
    is_done: bool | None = None
    sort_desc: bool = False
    limit: int = 10


def get_selection(
    is_done: Annotated[bool | None, Query()] = None,
    sort_desc: Annotated[bool, Query()] = False,
    limit: Annotated[int, Query(ge=1, le=50)] = 10,
) -> SelectionParams:
    return SelectionParams(is_done, sort_desc, limit)


def get_selected_tasks(
    planner: PlannerDep,
    selection: Annotated[SelectionParams, Depends(get_selection)],
) -> list[Task]:
    return planner.select_tasks(
        is_done=selection.is_done,
        sort_desc=selection.sort_desc,
        limit=selection.limit,
    )''',
                    "checks": ["GET сохраняет прежние ответы без query и с фильтрами.", "Изменяющие маршруты продолжают использовать существующий PlannerService."]
                }
            },
            {
                "title": "Override изолирует API-проверку от рабочего JSON",
                "task": "API-fixture временно подменяет get_planner provider-ом отдельного сервиса и восстанавливает исходные overrides после запроса.",
                "requirements": [
                    "Тестовый JsonStorage находится под tmp_path и содержит подготовленные задачи.",
                    "Ошибка query или provider не меняет данные, а после проверки снова работает штатный provider."
                ],
                "hint": "Ключом app.dependency_overrides является get_planner, а значением служит provider-функция. Сохраните словарь и восстановите его в finally.",
                "answer": {
                    "explanation": "Подмена действует только на тестовое приложение. Снимок и восстановление словаря сохраняют прежнее состояние даже при ошибке проверки.",
                    "steps": ["Создаём тестовый PlannerService на JsonStorage из tmp_path.", "Назначаем provider под ключом исходного get_planner.", "Выполняем запрос и в finally возвращаем сохранённые overrides."],
                    "code": '''# Фрагмент API-fixture; app, client и get_test_planner заданы тестом
original_overrides = app.dependency_overrides.copy()
app.dependency_overrides[get_planner] = get_test_planner
try:
    response = client.get("/tasks", params={"is_done": True})
    assert response.status_code == 200
    assert response.json() == expected_test_tasks
finally:
    app.dependency_overrides.clear()
    app.dependency_overrides.update(original_overrides)''',
                    "checks": ["Ответ содержит задачи только тестового сервиса.", "Рабочий JSON не изменился, после запроса активен штатный provider."]
                }
            }
        ],
        "result": "GET /tasks использует подготовленную выборку без изменения контракта. API-fixture работает на отдельном JSON и восстанавливает override."
    }],

    65: [{
        "title": "Первый GET /preferences в существующем Planner",
        "task": "Новый HTTP-ресурс сообщает default-представление и диагностический контекст запроса. Он остаётся частью текущего приложения и не сохраняет настройку между запросами.",
        "tasks": [
            {
                "title": "Роутер возвращает default preference",
                "task": "GET /preferences подключён к существующему приложению и возвращает JSON с view=compact и необязательным client_version.",
                "requirements": [
                    "X-Client-Version читается как client_version через alias; длина переданной строки ограничена 64 символами.",
                    "Отсутствующий заголовок даёт null в JSON, а переданное значение сохраняется без изменения.",
                    "Response отправляет X-Planner-Version со значением сервера, независимым от входного header."
                ],
                "hint": "Словарь задаёт body, а переданный Response добавляет метаданные ответа.",
                "answer": {
                    "explanation": "Header объявляет источник клиентского значения, а alias связывает Python-имя с HTTP-именем. FastAPI сериализует словарь в JSON и переносит заголовок из Response в итоговый ответ.",
                    "steps": ["Создаём router для /preferences и подключаем его один раз.", "Объявляем необязательный Header с alias и ограничением длины.", "Задаём X-Planner-Version значением приложения и возвращаем compact с принятым значением."],
                    "code": '''from typing import Annotated

from fastapi import APIRouter, Header, Response

router = APIRouter(prefix="/preferences", tags=["preferences"])

@router.get("")
def read_preferences(
    response: Response,
    client_version: Annotated[
        str | None,
        Header(alias="X-Client-Version", max_length=64),
    ] = None,
):
    response.headers["X-Planner-Version"] = "1"
    return {"view": "compact", "client_version": client_version}

# app/api.py
from app.routers.preferences.router import router as preferences_router
app.include_router(preferences_router)''',
                    "checks": ["Точный GET /preferences отвечает без redirect.", "Входной header не становится значением X-Planner-Version."]
                }
            },
            {
                "title": "HTTP-контракт и регрессия подтверждены запросами",
                "task": "TestClient различает отсутствующий, обычный, пустой и слишком длинный header, а состояние Planner остаётся прежним.",
                "requirements": [
                    "Первые три запроса возвращают 200 с соответствующим client_version; значение длиннее 64 символов получает 422 до обработчика.",
                    "Изолированные GET /tasks, GET /stats, JSON и CLI сохраняют прежнее состояние."
                ],
                "hint": "Передайте follow_redirects=False и сравнивайте status, JSON и headers раздельно. Для регрессии используйте временный JSON из существующей API-fixture.",
                "answer": {
                    "explanation": "Статус, body и headers подтверждают разные части HTTP-ответа. Изолированная фикстура показывает, что новая настройка не затрагивает Planner, не обращаясь к пользовательским данным.",
                    "steps": ["Сравниваем ответы для отсутствующего, обычного, пустого и слишком длинного значения.", "Сохраняем задачи, статистику и байты тестового JSON до запроса, затем сравниваем их после него.", "Запускаем существующий CLI-сценарий на том же временном пути."],
                    "code": '''absent = client.get("/preferences", follow_redirects=False)
normal = client.get("/preferences", headers={"X-Client-Version": "web-2"}, follow_redirects=False)
empty = client.get("/preferences", headers={"X-Client-Version": ""}, follow_redirects=False)
too_long = client.get("/preferences", headers={"X-Client-Version": "x" * 65}, follow_redirects=False)

assert absent.status_code == 200
assert absent.json() == {"view": "compact", "client_version": None}
assert absent.headers["X-Planner-Version"] == "1"
assert normal.json()["client_version"] == "web-2"
assert empty.json()["client_version"] == ""
assert too_long.status_code == 422

tasks_before = client.get("/tasks").json()
stats_before = client.get("/stats").json()
json_before = json_path.read_bytes()
client.get("/preferences", headers={"X-Client-Version": "test"}, follow_redirects=False)
assert client.get("/tasks").json() == tasks_before
assert client.get("/stats").json() == stats_before
assert json_path.read_bytes() == json_before''',
                    "checks": ["Формулировка 422 не фиксируется как часть договора.", "Проверки не читают и не изменяют пользовательский JSON."]
                }
            }
        ],
        "result": "GET /preferences возвращает default compact, принимает необязательный диагностический header и отправляет серверную версию. JSON и прежние API/CLI-сценарии сохраняют состояние."
    }],

    "65.1": [{

        "title": "Режим preferences хранится в cookie конкретного клиента",

        "task": (

            "GET /preferences возвращает выбранное view, а PUT и DELETE устанавливают и сбрасывают его в cookie planner_view. "

            "GET и PUT сохраняют client_version и X-Planner-Version; отсутствие или неизвестное значение cookie даёт compact, "

            "а DELETE отвечает 204 без тела. Task API, статистика, JSON-backed Planner и CLI сохраняют прежнее состояние."

        ),

        "tasks": [

            {

                "title": "Схема принимает только два режима",

                "task": (

                    "Мы разделяем новый выбор в теле PUT и представление ответа. Так Pydantic проверяет новое значение до "

                    "выполнения обработчика, а старую cookie мы сможем обработать отдельным безопасным правилом."

                ),

                "requirements": [

                    "PreferenceWrite.view принимает только compact или detailed через Literal.",

                    "PreferenceRead содержит view и необязательный client_version.",

                ],

                "hint": "Сначала зададим один общий тип режима, затем используем его в обеих схемах.",

                "answer": {

                    "explanation": (

                        "Literal ограничивает допустимые строки ещё при проверке тела запроса. Та же аннотация в схеме ответа "

                        "фиксирует публичный формат view, а client_version остаётся необязательным полем прежнего контракта."

                    ),

                    "steps": [

                        "Определим Literal из двух значений, которые принимает Planner.",

                        "Используем этот тип и для входной схемы PUT, и для поля ответа.",

                    ],

                    "code": '''from typing import Literal



from pydantic import BaseModel





PreferenceView = Literal["compact", "detailed"]





class PreferenceWrite(BaseModel):

    view: PreferenceView





class PreferenceRead(BaseModel):

    view: PreferenceView

    client_version: str | None = None

''',

                    "checks": [

                        "PreferenceWrite(view='detailed') проходит валидацию.",

                        "PreferenceWrite(view='wide') получает ошибку валидации до вызова маршрута.",

                        "PreferenceRead(view='compact', client_version=None) сохраняет прежнюю форму ответа.",

                    ],

                },

            },

            {

                "title": "Один router читает, устанавливает и сбрасывает cookie",

                "task": (

                    "Теперь мы развиваем подключённый preferences-router. Cookie приходит от клиента как недоверенная строка, "

                    "а тело PUT проходит строгую схему; для установки и удаления согласуем имя и Path."

                ),

                "requirements": [

                    "GET читает необязательную planner_view через Cookie, возвращает только compact или detailed и оставляет прежние client_version и X-Planner-Version.",

                    "PUT возвращает выбранное view, сохраняет client_version и выставляет planner_view с Path=/preferences, HttpOnly, SameSite=lax и Secure=False.",

                    "DELETE удаляет planner_view с тем же Path, сохраняет серверный header и возвращает 204 без body.",

                ],

                "hint": "Сравни входную cookie с двумя разрешёнными строками явно. Для DELETE настрой и верни тот же Response, к которому добавлена инструкция удаления.",

                "answer": {

                    "explanation": (

                        "Мы оставляем один APIRouter с прежним префиксом. GET использует обычную строку для входной cookie, "

                        "поэтому чужое значение можно свести к compact вместо ошибки схемы. PUT принимает PreferenceWrite, "

                        "а DELETE возвращает настроенный Response, чтобы Set-Cookie и статус 204 попали в один фактический ответ."

                    ),

                    "steps": [

                        "Cookie читает строку из запроса; проверка membership отделяет допустимое старое значение от любого другого.",

                        "Pydantic проверяет body до входа в PUT, поэтому невалидное значение не устанавливает cookie.",

                        "Response.set_cookie и Response.delete_cookie работают с одним именем и Path; для 204 мы явно выставляем статус и возвращаем этот объект.",

                    ],

                    "code": '''from fastapi import APIRouter, Cookie, Header, Response, status



from .schemas import PreferenceRead, PreferenceView, PreferenceWrite





router = APIRouter(prefix="/preferences", tags=["preferences"])





@router.get("", response_model=PreferenceRead)

def read_preferences(

    response: Response,

    client_version: str | None = Header(

        default=None,

        alias="X-Client-Version",

        max_length=64,

    ),

    planner_view: str | None = Cookie(default=None),

) -> PreferenceRead:

    view: PreferenceView = (

        planner_view

        if planner_view in {"compact", "detailed"}

        else "compact"

    )

    response.headers["X-Planner-Version"] = "1"

    return PreferenceRead(view=view, client_version=client_version)





@router.put("", response_model=PreferenceRead)

def set_preferences(

    payload: PreferenceWrite,

    response: Response,

    client_version: str | None = Header(

        default=None,

        alias="X-Client-Version",

        max_length=64,

    ),

) -> PreferenceRead:

    response.set_cookie(

        key="planner_view",

        value=payload.view,

        path="/preferences",

        httponly=True,

        secure=False,

        samesite="lax",

    )

    response.headers["X-Planner-Version"] = "1"

    return PreferenceRead(view=payload.view, client_version=client_version)





@router.delete(

    "",

    status_code=status.HTTP_204_NO_CONTENT,

    response_model=None,

)

def reset_preferences(response: Response) -> Response:

    response.delete_cookie(key="planner_view", path="/preferences")

    response.headers["X-Planner-Version"] = "1"

    response.status_code = status.HTTP_204_NO_CONTENT

    return response

''',

                    "checks": [

                        "Новый TestClient без cookie получает view=compact.",

                        "PUT с view=detailed возвращает Set-Cookie с Path=/preferences; следующий GET того же клиента возвращает detailed.",

                        "DELETE возвращает статус 204 и пустой body; следующий GET этого клиента снова возвращает compact.",

                    ],

                },

            },

            {

                "title": "Два клиента подтверждают границы изменения",

                "task": (

                    "Мы проверяем реальный HTTP-путь через TestClient, чтобы увидеть cookie jar, а не только прямой вызов функции. "

                    "Сравним обе клиентские сессии и состояние Planner до и после сценария."

                ),

                "requirements": [

                    "Cookie jar первого клиента сохраняет выбор между запросами; независимый второй клиент получает compact.",

                    "Невалидный body получает 422 и не заменяет действующее значение; неизвестная cookie возвращает compact.",

                    "Задачи, stats и байты JSON-файла не меняются; существующие команды CLI list и stats продолжают читать тот же сервис.",

                ],

                "hint": "Снимем задачи, статистику и байты временного JSON до запросов. Создадим второй TestClient для того же app, чтобы его jar была отдельной.",

                "answer": {

                    "explanation": (

                        "TestClient принимает Set-Cookie в jar и сам отправляет Cookie в следующем запросе. Второй клиент начинает "

                        "со своей jar. Ошибочный body проверяем после успешного PUT: тогда можно доказать, что ответ 422 не затёр "

                        "прежний выбор. Отдельные снимки задач, stats и JSON подтверждают, что настройка осталась вне Planner."

                    ),

                    "steps": [

                        "Создадим одну тестовую задачу в изолированном api_service и зафиксируем ответы API и байты его временного JSON.",

                        "Пройдём default → PUT detailed → повторный GET → DELETE → default, одновременно проверяя отдельный клиент и недопустимые входы.",

                        "Вызовем существующие list и stats CLI-команды на том же api_service и сравним состояние после HTTP-сценария.",

                    ],

                    "code": '''from fastapi.testclient import TestClient



from app.cli import run





def test_preferences_cookie_round_trip_and_isolation(api_client, api_service):

    api_service.add_task("Keep", priority=2)

    data_path = api_service.storage.path

    data_before = data_path.read_bytes() if data_path.exists() else None

    tasks_before = api_client.get("/tasks").json()

    stats_before = api_client.get("/stats").json()

    second_client = TestClient(api_client.app, follow_redirects=False)



    try:

        initial = api_client.get(

            "/preferences",

            headers={"X-Client-Version": "test-1"},

        )

        assert initial.status_code == 200

        assert initial.json() == {

            "view": "compact",

            "client_version": "test-1",

        }

        assert initial.headers["X-Planner-Version"] == "1"



        saved = api_client.put(

            "/preferences",

            json={"view": "detailed"},

            headers={"X-Client-Version": "test-2"},

        )

        assert saved.status_code == 200

        assert saved.json() == {

            "view": "detailed",

            "client_version": "test-2",

        }

        assert "planner_view=detailed" in saved.headers["set-cookie"]

        assert "Path=/preferences" in saved.headers["set-cookie"]

        assert saved.headers["X-Planner-Version"] == "1"

        assert api_client.cookies.get("planner_view") == "detailed"



        repeated = api_client.get("/preferences")

        assert repeated.json()["view"] == "detailed"

        assert second_client.get("/preferences").json()["view"] == "compact"



        invalid = api_client.put(

            "/preferences",

            json={"view": "wide"},

        )

        assert invalid.status_code == 422

        assert api_client.get("/preferences").json()["view"] == "detailed"

        assert (

            second_client.get(

                "/preferences",

                cookies={"planner_view": "unknown"},

            ).json()["view"]

            == "compact"

        )



        deleted = api_client.delete("/preferences")

        assert deleted.status_code == 204

        assert deleted.content == b""

        assert "Path=/preferences" in deleted.headers["set-cookie"]

        assert api_client.get("/preferences").json()["view"] == "compact"



        assert api_client.get("/tasks").json() == tasks_before

        assert api_client.get("/stats").json() == stats_before

        data_after = data_path.read_bytes() if data_path.exists() else None

        assert data_after == data_before



        cli_output = []

        commands = iter(["list", "stats", "exit"])

        run(

            api_service,

            read=lambda _prompt: next(commands),

            write=cli_output.append,

        )

        assert any(line.startswith("[1] Keep") for line in cli_output)

        assert "Всего: 1" in cli_output

    finally:

        second_client.close()

''',

                    "checks": [

                        "Последовательность одного клиента равна compact → detailed → compact.",

                        "Второй клиент без собственного выбора и запрос с неизвестной cookie возвращают compact.",

                        "После сценария ответы /tasks и /stats совпадают со снимками, а байты тестового JSON не меняются.",

                        "CLI list показывает тестовую задачу, а stats сообщает Всего: 1.",

                    ],

                },

            },

        ],

        "result": (

            "Один preferences-router управляет режимом compact или detailed через cookie конкретного HTTP-клиента; "

            "GET применяет безопасный default, PUT валидирует выбор, а DELETE сбрасывает ту же cookie с 204 без body. "

            "Прежние задачи, статистика, JSON и CLI остаются без изменений."

        ),

    }],

    "65.2": [{

        "title": "Свяжите политику cookie с Settings и проверьте границы доверия",

        "task": "Preference-cookie planner_view получает транспортную политику из единого Settings. Конфигурация проверяется при сборке приложения, а cookie остаётся только предпочтением представления. HTTP-контракт preference-ресурса и прежние Task API, stats, CLI и JSON_PATH сохраняются.",

        "tasks": [

            {

                "title": "Настройка возвращает проверенный cookie_secure",

                "task": "Settings содержит cookie_secure, который загрузчик получает из COOKIE_SECURE. Отсутствующая настройка означает False для локального HTTP; строки true и false разбираются явно, а пустое или неизвестное значение останавливает сборку с ошибкой COOKIE_SECURE.",

                "requirements": [

                    "Строка false разбирается как False, а не как истинность непустой строки.",

                    "Проверка выполняется в существующей точке сборки настроек."

                ],

                "hint": "Различите отсутствие переменной и переданную строку. Сначала нормализуйте регистр и пробелы, затем сопоставьте только два разрешённых значения.",

                "answer": {

                    "explanation": "Окружение передаёт строки, поэтому bool(raw) неверно трактует false. Отсутствие разрешает локальный default, но пустая и любая неизвестная строка остаются ошибками конфигурации.",

                    "steps": [

                        "Добавляем cookie_secure: bool в существующую dataclass Settings.",

                        'Загрузчик вызывает parse_cookie_secure(os.environ.get("COOKIE_SECURE")) и передаёт результат в конструктор Settings вместе с прежними полями.',

                        "Явная ошибка называет COOKIE_SECURE и возникает до обработки запросов."

                    ],

                    "code": '''def parse_cookie_secure(raw: str | None) -> bool:\n    if raw is None:\n        return False\n\n    value = raw.strip().lower()\n    if value == "true":\n        return True\n    if value == "false":\n        return False\n    raise ValueError("COOKIE_SECURE must be 'true' or 'false'")''',

                    "checks": [

                        "None даёт False; true и false дают соответствующие bool.",

                        "Пустая строка и значение вроде yes завершаются ValueError с именем COOKIE_SECURE."

                    ]

                }

            },

            {

                "title": "Preference-операции получают тот же Settings",

                "task": "В app/api.py приложение уже сохраняет собранный Settings в app.state.settings. Добавьте get_settings и SettingsDep в app/core/dependencies.py: provider должен возвращать именно этот объект. Затем preference-router читает cookie_secure через эту dependency. Обработчики не читают окружение и не создают вторую конфигурацию.",

                "requirements": [

                    "Создайте get_settings(request: Request) -> Settings и SettingsDep = Annotated[Settings, Depends(get_settings)] в app/core/dependencies.py; provider возвращает request.app.state.settings.",

                    "Planner и providers других ресурсов получают прежние зависимости."

                ],

                "hint": "app/api.py уже сохраняет готовый объект в app.state.settings. Добавьте общий Settings-provider рядом с PlannerDep в app/core/dependencies.py, затем передайте SettingsDep в preference-обработчики.",

                "answer": {

                    "explanation": "После настройки app.state.settings уже содержит собранный объект, но provider для Settings ещё не добавлен. В этом шаге мы создаём get_settings и SettingsDep, которые передают именно сохранённый объект. Загрузчик окружения и сам Settings не дублируются; тест по-прежнему может подменить dependency через override.",

                    "steps": [

                        "Оставляем существующее присваивание app.state.settings в app/api.py: оно хранит тот же объект, который собрал загрузчик.",

                        "Добавляем get_settings(request: Request) -> Settings в app/core/dependencies.py и возвращаем request.app.state.settings.",

                        "Объявляем SettingsDep = Annotated[Settings, Depends(get_settings)] и добавляем settings: SettingsDep в обработчики установки и удаления cookie.",

                        "Передаём settings.cookie_secure в параметры cookie; JSON_PATH и get_planner не меняются."

                    ],

                    "code": '''from typing import Annotated\nfrom fastapi import Depends, Request\nfrom app.core.config import Settings\n\n# Добавить в app/core/dependencies.py\ndef get_settings(request: Request) -> Settings:\n    return request.app.state.settings\n\nSettingsDep = Annotated[Settings, Depends(get_settings)]\n\n# В preference-обработчиках\nsettings: SettingsDep\nsecure=settings.cookie_secure''',

                    "checks": [

                        "Обе операции получают cookie_secure из Settings, который provider возвращает из app.state.settings.",

                        "В preference-router нет чтения os.environ и вызова load_settings."

                    ]

                }

            },

            {

                "title": "Установка и удаление используют одну область cookie",

                "task": "PUT устанавливает planner_view с Secure из Settings и прежними HttpOnly=True, SameSite=lax и Path=/preferences. DELETE удаляет запись с теми же именем и Path, возвращает прежний статус 204 без тела и сохраняет X-Planner-Version на отправляемом Response.",

                "requirements": [

                    "Domain, Max-Age и Expires не задаются; cookie остаётся session-cookie.",

                    "DELETE меняет тот же объект Response, который возвращается клиенту."

                ],

                "hint": "Сверьте имя и Path в обоих ответах. Для DELETE сначала измените переданный Response, а затем верните этот же объект со статусом 204.",

                "answer": {

                    "explanation": "Клиент адресует запись по имени и области Path. Установка и удаление должны совпасть по этой области; Secure берётся из проверенной конфигурации. Если создать новый Response после удаления, заголовок Set-Cookie и диагностический заголовок останутся на другом объекте.",

                    "steps": [

                        "PUT вызывает set_cookie на Response, который входит в существующий ответ.",

                        "DELETE вызывает delete_cookie с тем же key и path, задаёт status_code=204 и возвращает настроенный response.",

                        "Существующая модель ответа, X-Planner-Version и другие заголовки сохраняются."

                    ],

                    "code": '''response.set_cookie(\n    key="planner_view",\n    value=view,\n    path="/preferences",\n    secure=settings.cookie_secure,\n    httponly=True,\n    samesite="lax",\n)\n\nresponse.delete_cookie(\n    key="planner_view",\n    path="/preferences",\n    secure=settings.cookie_secure,\n    httponly=True,\n    samesite="lax",\n)\nresponse.status_code = 204\nreturn response''',

                    "checks": [

                        "Set-Cookie сохраняет Path=/preferences, HttpOnly и SameSite=lax; Domain и срок хранения не появляются.",

                        "DELETE отвечает статусом 204 с пустым телом и содержит заголовки настроенного Response."

                    ]

                }

            },

            {

                "title": "HTTP-проверки отделяют команду от cookie клиента",

                "task": "PUT принимает только допустимые значения view и отклоняет неверный body со статусом 422 без замены прежней cookie. GET нормализует отсутствующую или неизвестную cookie в compact; cookie одного клиента не попадает в jar другого.",

                "requirements": [

                    "Cookie planner_view не выбирает пользователя, роль, права или JSON-файл.",

                    "Проверка проходит через TestClient, чтобы клиентская jar приняла Set-Cookie."

                ],

                "hint": "Используйте два TestClient и выполняйте запросы последовательно: успешный PUT, повторный GET, ошибочный PUT и отдельный GET второго клиента.",

                "answer": {

                    "explanation": "Body является новой командой и проходит строгую схему Pydantic, поэтому неверное значение получает 422. Cookie является недоверенным необязательным вводом, поэтому неизвестная строка получает безопасный fallback, не расширяющий доступ.",

                    "steps": [

                        "Первый TestClient сохраняет detailed и повторный GET возвращает detailed из его jar.",

                        "Неверный PUT возвращает 422; следующий GET первого клиента всё ещё возвращает detailed.",

                        "Второй клиент без собственного выбора получает compact. Ручная cookie planner_view=admin также даёт compact."

                    ],

                    "code": '''preferred = TestClient(app)\nother = TestClient(app)\n\nassert preferred.put(\n    "/preferences", json={"view": "detailed"}\n).status_code == 200\nassert preferred.get("/preferences").json()["view"] == "detailed"\nassert preferred.put(\n    "/preferences", json={"view": "admin"}\n).status_code == 422\nassert preferred.get("/preferences").json()["view"] == "detailed"\nassert other.get("/preferences").json()["view"] == "compact"\nother.cookies.set("planner_view", "admin", path="/preferences")\nassert other.get("/preferences").json()["view"] == "compact"''',

                    "checks": [

                        "Ответы сохраняют прежние client_version и X-Planner-Version.",

                        "Список задач и результаты Task API не зависят от подменённого view."

                    ]

                }

            },

            {

                "title": "Настройка Secure не меняет Planner и проходит регрессию",

                "task": "COOKIE_SECURE=False формирует заголовок без Secure, а COOKIE_SECURE=True добавляет Secure. Проверки Task API, stats, CLI и JSON_PATH показывают прежнее поведение на изолированных данных; тестовые Settings и dependency overrides очищаются после сценария.",

                "requirements": [

                    "Проверка заголовка Set-Cookie не выдаётся за проверку настоящего TLS или браузерной политики SameSite.",

                    "Неверная COOKIE_SECURE останавливает сборку настроек до запросов."

                ],

                "hint": "Сравните именно Set-Cookie для двух экземпляров приложения с разными Settings. Регрессионные запросы запускайте на отдельном временном JSON, затем очистите overrides в finally.",

                "answer": {

                    "explanation": "Тестовый HTTP-клиент показывает сформированные заголовки, статусы, тела и работу своей jar. Он не запускает TLS-сервер и не воспроизводит все правила реального браузера. Раздельные Settings подтверждают, что политика пришла из конфигурации, а не зашита в обработчик.",

                    "steps": [

                        "Собираем изолированные приложения или подменяем существующий provider отдельно для False и True.",

                        "После PUT проверяем отсутствие или наличие атрибута Secure в Set-Cookie; неверную настройку проверяем на загрузчике.",

                        "На временном JSON повторяем Task API, stats и CLI, сравниваем их результаты и путь JSON_PATH с исходным контрактом.",

                        "В finally очищаем dependency_overrides и временные данные."

                    ],

                    "code": '''header_http = response_http.headers["set-cookie"].lower()\nheader_secure = response_secure.headers["set-cookie"].lower()\nassert "secure" not in header_http\nassert "secure" in header_secure''',

                    "checks": [

                        "COOKIE_SECURE отсутствует: локальная настройка равна False; явные true и false работают ожидаемо.",

                        "Task API, stats, CLI и JSON_PATH используют прежний Planner и изолированный тестовый файл.",

                        "Результат описывает HTTP-контракт, а не реальное TLS-развёртывание или политику браузера."

                    ]

                }

            }

        ],

        "result": "Set-Cookie отражает настройку Secure, неизвестное значение view не меняет формат безопасного ответа, а предпочтение остаётся независимым от задач, прав и JSON Planner."

    }]

}
