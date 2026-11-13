"""Ручная практика: история схемы и настройка Alembic."""

MANUAL_PRACTICE = {
    83: [
        {
            "title": "Подготовим безопасное исследование истории",
            "task": "Мы продолжаем один учебный Planner в project/. Уже подготовлены исходная база с синтетическими задачами, её опись, резерв и проверенная восстановленная копия. Мы сохраним их и будем исследовать историю на новом отдельном файле.",
            "tasks": [
                {
                    "title": "Сверим вход и выберем отдельную цель",
                    "task": "Остановим API и CLI и закроем их соединения. Найдём свои сохранённые пути исходной базы, резерва, восстановленной копии и неполного образца, а также опись схемы и строк. Проверим исходную и восстановленную базы способом read-only, который использовали при восстановлении, и сравним их с описью. В project/data/block17/ выберем ещё не существующий history-probe.sqlite3 для исследования истории и отдельный незанятый путь upgrade.sqlite3 для будущего шага. Запишем абсолютные пути и убедимся, что они различаются. Если в предыдущем действии выбрали другие имена учебных файлов, используем именно свои сохранённые пути внутри того же каталога. При расхождении с описью или неизвестном состоянии остановимся и сначала выясним причину.",
                    "requirements": [
                        "Исходник, резерв, восстановленная копия, неполный образец, будущая upgrade-копия и новая цель исследования имеют разные абсолютные пути внутри учебного каталога.",
                        "Сравнение исходной и восстановленной базы с описью охватывает схему, ID и все шесть полей каждой строки, включая tags и title_normalized.",
                        "Существующие данные не изменяются; зарезервированные пути двух будущих файлов свободны."
                    ],
                    "result": "Есть сверенные опись и пути, а отдельная цель исследования ещё не существует.",
                    "hint": "Вспомним read-only проверку после восстановления и различие между файлом базы и его URL. Остановимся при неизвестном расхождении.",
                    "answer": {
                        "explanation": "Отметка Alembic не проверяет данные. Поэтому сначала убедимся, что известные исходник и восстановленная копия по-прежнему совпадают с сохранённым состоянием, и выберем новый отдельный файл.",
                        "steps": [
                            "Остановим использующие SQLite процессы. Найдём свою опись и пути source.sqlite3, backup.sqlite3, restored.sqlite3 и incomplete.sqlite3 либо ранее выбранные собственные имена.",
                            "Повторим read-only проверку из темы восстановления: сопоставим столбцы, ограничения, индексы, внешние ключи, представления и триггеры, затем упорядоченные по ID строки со всеми шестью значениями. Не заменяем сравнение подсчётом задач.",
                            "Из project/ посмотрим абсолютные пути предложенных целей командой ниже. Сверим их с сохранёнными путями, убедимся в попарном различии и отсутствии обоих новых файлов. Если имя занято, остановимся и выберем другое свободное имя в учебном каталоге; в дальнейшей настройке явно используем именно его.",
                            "Резерв и неполный образец оставим без изменений. При несовпадении восстановленной копии с описью не начинаем настройку наугад."
                        ],
                        "code": "(Resolve-Path ./data/block17).Path\nTest-Path ./data/block17/history-probe.sqlite3\nTest-Path ./data/block17/upgrade.sqlite3",
                        "checks": ["Оба Test-Path для новых имён показывают False; при другом имени проверяется именно оно.", "Схема и значения каждой строки исходника и восстановленной копии совпадают с описью."]
                    }
                },
                {
                    "title": "Настроим Alembic для выбранного файла",
                    "task": "Откроем project/requirements.txt и app/DBase/models.py. Добавим к закреплённым зависимостям Alembic, установим его тем же интерпретатором виртуальной среды и проверим версию. Из project/ создадим свободный каталог alembic командой init. Затем откроем созданные alembic.ini и alembic/env.py: оставим расположение истории в ini, а в env.py подключим metadata модели Planner и настроим выбор DATABASE_URL из текущего окружения через существующую load_settings. До создания соединения проверим, что нормализованный адрес указывает ровно на выбранный отдельный history-probe.sqlite3, без параметров URL. В нашем учебном примере это точное разрешённое имя; для другого ранее выбранного имени явно заменим его в проверке. Вопросы и полный независимый пример находятся в разделах «Одна среда и отдельный адрес» и «Независимая проба: каталог книг».",
                    "requirements": [
                        "В requirements.txt закреплены SQLAlchemy==2.0.55 и alembic==1.18.4; Python и обе версии пакетов проверены тем же интерпретатором Planner.",
                        "Из корня project/ созданы alembic.ini, alembic/env.py и пустой alembic/versions/; существующая история не перезаписывается.",
                        "env.py требует явно заданный DATABASE_URL, передаёт его в app.core.config.load_settings и использует полученный URL как единственный адрес соединения.",
                        "До соединения env.py отклоняет адрес с параметрами или путь, отличный от выбранного абсолютного пути исследования; исходник, резерв, восстановленная и будущая upgrade-копия не разрешены.",
                        "target_metadata содержит Base.metadata из app.DBase.models; установка metadata сама по себе не создаёт таблиц.",
                        "Не создаются ревизия, stamp, upgrade или таблица задач, init_db не запускается."
                    ],
                    "result": "Настроенные файлы истории и проектная metadata готовы для наблюдения отдельной базы; папка revisions пуста.",
                    "hint": "Сопоставим пример catalog-demo с реальным модулем модели и используем load_settings для нормализации. Проверка пути должна находиться до create_engine и connect.",
                    "answer": {
                        "explanation": "Сначала запомним явно заданный URL, не допуская значения по умолчанию, а затем нормализуем его существующей настройкой проекта. Только точная учебная цель допускается до создания engine. При переходе к другой базе разрешённую цель потребуется явно изменить и заново проверить.",
                        "steps": [
                            "Добавим отдельную строку alembic==1.18.4 в requirements.txt. Из project/ запустим указанные команды. Если alembic/ уже существует, не перезаписываем его и сначала выясняем его происхождение.",
                            "В созданном alembic.ini оставим script_location, указывающий на каталог alembic. Значение sqlalchemy.url в ini не является источником соединения в нашем env.py.",
                            "Заменим содержимое alembic/env.py приведённым кодом. Перед импортом конфигурации мы захватываем переменную текущего процесса: модуль конфигурации также умеет читать .env. Для нашего опыта отсутствие явной переменной должно остановить команду.",
                            "Если выбрали другое свободное имя учебного файла, изменим только разрешённый путь и снова сравним его со всеми сохранёнными путями. Код не вызывает создание таблиц приложения."
                        ],
                        "code": ".venv/Scripts/python.exe --version\n.venv/Scripts/python.exe -m pip install -r requirements.txt\n.venv/Scripts/python.exe -c \"import sqlalchemy; print(sqlalchemy.__version__)\"\n.venv/Scripts/python.exe -m alembic --version\n.venv/Scripts/python.exe -m alembic init alembic\n\n# project/alembic/env.py\nimport os\nfrom pathlib import Path\nfrom alembic import context\nfrom sqlalchemy import create_engine, pool\nfrom sqlalchemy.engine import make_url\n\nraw = os.environ.get('DATABASE_URL')\nif not raw:\n    raise ValueError('DATABASE_URL is required')\nfrom app.core.config import load_settings\nfrom app.DBase.models import Base\n\nroot = Path(__file__).resolve().parents[1]\nsettings = load_settings(environment={'DATABASE_URL': raw})\nurl = make_url(settings.database_url)\nif url.query:\n    raise ValueError('SQLite URL query parameters are not allowed')\npath = Path(url.database).resolve()\nallowed = (root / 'data' / 'block17' / 'history-probe.sqlite3').resolve()\nif path != allowed:\n    raise ValueError('Unexpected database path')\nprint('Selected database:', path)\ntarget_metadata = Base.metadata\n\nif context.is_offline_mode():\n    context.configure(url=url, target_metadata=target_metadata, literal_binds=True)\n    with context.begin_transaction():\n        context.run_migrations()\nelse:\n    engine = create_engine(url, poolclass=pool.NullPool)\n    with engine.connect() as connection:\n        context.configure(connection=connection, target_metadata=target_metadata)\n        with context.begin_transaction():\n            context.run_migrations()\n    engine.dispose()",
                        "checks": ["Команда версии показывает Alembic 1.18.4; импорт app.DBase.models доступен из project/.", "В versions/ нет файлов ревизий; проверка пути находится до create_engine и connect."]
                    }
                },
                {
                    "title": "Наблюдаем пустую историю и проверяем отказ",
                    "task": "Из project/ зададим DATABASE_URL для выбранного нового файла, проверим импорт metadata и затем выполним history, heads и current тем же интерпретатором. Сравним выводы: первые две команды читают файлы истории, последняя обращается к выбранной базе. Проверим коды завершения и фактический путь, а не только отсутствие строк с ревизией. Затем зададим другой ещё не существующий файл внутри учебного каталога и повторим current: настройка должна остановить команду до соединения, а ошибочный файл не должен появиться. Вернём правильный адрес и повторим current. После наблюдения снова сопоставим исходник и восстановленную копию с полной описью, сохраним резерв и запишем результаты для следующего шага.",
                    "requirements": [
                        "Импорт Base.metadata показывает tasks без вызова create_all и без создания таблицы tasks в исследуемой базе.",
                        "Успешные history и heads не показывают ревизий; успешный current показывает выбранную цель и не показывает текущую ревизию.",
                        "Неверный адрес завершает current ошибкой до открытия соединения, неправильный файл не создан; после восстановления верного адреса current снова успешен.",
                        "Исходник и восстановленная копия после работы совпадают с описью схемы и всех шести полей по каждому ID, резерв сохранён.",
                        "Записаны проект, интерпретатор, версии, выбранные пути, отсутствие ревизий и current, результат проверки metadata и отказа."
                    ],
                    "result": "Пустая история и отсутствие current подтверждены успешными командами на отдельной цели, неверный адрес отклонён до соединения.",
                    "hint": "Сравним $LASTEXITCODE после каждой команды и путь, напечатанный env.py. Отсутствие ревизии при ошибке не означает пустую историю.",
                    "answer": {
                        "explanation": "Первые две команды смотрят файлы истории, current обращается к базе. Отсутствие current не говорит, что в другой базе нет таблиц. Отдельный неверный путь проверяет именно ранний отказ конфигурации.",
                        "steps": [
                            "Из project/ зададим URL выбранной цели. Проведём команды по одной, после каждой проверяя нулевой $LASTEXITCODE. Импорт показывает tasks, но не открывает базу.",
                            "В новом history-probe.sqlite3 при current может появиться служебная таблица версий; это не таблица задач и не миграция. После current прочитаем имена таблиц через read-only запрос, как в независимом примере; tasks среди них быть не должно. Если путь или импорт не совпадает с ожиданием, остановимся и исправим конфигурацию.",
                            "Выберем новый незанятый wrong.sqlite3 в том же учебном каталоге и зададим его URL. Current должен завершиться ненулевым кодом с Unexpected database path; Test-Path должен вернуть False. Восстановим исходный URL, повторим current и проверим нулевой код.",
                            "Повторим ранее изученную read-only сверку обеих заполненных баз с описью, включая определения схемы, ID и все шесть значений каждой строки. Запишем пути, версию и результаты, не называя несозданную будущую ревизию выполненной."
                        ],
                        "code": "$env:DATABASE_URL = 'sqlite:///data/block17/history-probe.sqlite3'\n.venv/Scripts/python.exe -c \"from app.DBase.models import Base; print(list(Base.metadata.tables))\"\n$LASTEXITCODE\n.venv/Scripts/python.exe -m alembic history\n$LASTEXITCODE\n.venv/Scripts/python.exe -m alembic heads\n$LASTEXITCODE\n.venv/Scripts/python.exe -m alembic current\n$LASTEXITCODE\n\n# Сохраним как inspect_history.py и запустим из project/ тем же Python:\nimport sqlite3\nfrom pathlib import Path\npath = Path('data/block17/history-probe.sqlite3').resolve()\nconnection = sqlite3.connect(path.as_uri() + '?mode=ro', uri=True)\ntry:\n    print(connection.execute(\"SELECT name FROM sqlite_master WHERE type='table' ORDER BY name\").fetchall())\nfinally:\n    connection.close()\n\n# Снова PowerShell из project/:\n.venv/Scripts/python.exe inspect_history.py\nTest-Path ./data/block17/wrong.sqlite3\n$env:DATABASE_URL = 'sqlite:///data/block17/wrong.sqlite3'\n.venv/Scripts/python.exe -m alembic current\n$LASTEXITCODE\nTest-Path ./data/block17/wrong.sqlite3\n$env:DATABASE_URL = 'sqlite:///data/block17/history-probe.sqlite3'\n.venv/Scripts/python.exe -m alembic current\n$LASTEXITCODE",
                        "checks": ["Корректные команды завершаются с кодом 0; ошибочный current с ненулевым кодом, wrong.sqlite3 отсутствует.", "В исследуемой базе нет tasks; наличие файла или служебной таблицы не является подтверждением схемы Planner.", "Опись и все данные исходной и восстановленной базы не изменились."]
                    }
                }
            ],
            "result": "Настроена проверяемая пустая история для отдельного учебного файла; сохранены данные, опись и пути для последующего построения baseline."
        }
    ]
}
