from typing import Any

MANUAL_PRACTICE: dict[int | str, list[dict[str, Any]]] = {
    66: [
        {
            "title": "Исследуйте полный снимок Planner",
            "task": (
                "В существующем Planner изменения проходят через полный список: сервис загружает задачи, меняет список и передаёт его хранилищу целиком. "
                "Результат разбора показывает путь чтения и записи, прогноз для двух независимых снимков и причину потерянного обновления. "
                "Проектный код и рабочий JSON остаются без изменений."
            ),
            "tasks": [
                {
                    "title": "1. Проследите знакомые методы",
                    "task": "Карта вызовов связывает list_tasks(), get_statistics() и add_task() с точками load() и save() и показывает, что сервис получает от JsonStorage.",
                    "requirements": [
                        "list_tasks() и get_statistics() начинают работу с storage.load().",
                        "add_task() загружает список, добавляет Task и сохраняет список через storage.save(tasks).",
                        "Чтение не описано как запись, API и CLI используют общий PlannerService.",
                    ],
                    "hint": "Мы начинаем с storage.load(), затем прослеживаем, куда уходит полученный список.",
                    "answer": {
                        "explanation": "PlannerService получает список через JsonStorage. Чтение возвращает загруженное состояние; add_task() изменяет его и сохраняет весь новый список. API и CLI вызывают общий сервис.",
                        "steps": [
                            "В list_tasks() storage.load() возвращает список задач.",
                            "В get_statistics() сервис загружает список и считает all, open и done по его элементам.",
                            "В add_task() сервис загружает список, создаёт Task, добавляет её, вызывает storage.save(tasks) и возвращает задачу.",
                            "Чтение не вызывает save(); запись нужна изменяющей операции.",
                        ],
                        "code": "list_tasks(): load() -> полный список Task\nget_statistics(): load() -> подсчёт по полному списку\nadd_task(): load() -> добавить Task -> save(полный список)",
                        "checks": [
                            "В каждом методе названы фактические действия с полным списком.",
                            "API и CLI не описаны как два отдельных хранилища.",
                        ],
                    },
                },
                {
                    "title": "2. Сравните одну задачу и полный список",
                    "task": "Сравнение объясняет, почему чтение по id и подсчёт статистики сейчас получают полный список, хотя результатом становится одна задача или несколько чисел.",
                    "requirements": [
                        "get_task() сначала загружает список, затем находит id в Python.",
                        "get_statistics() получает все задачи и считает их в Python.",
                        "Вывод не обещает конкретный выигрыш от другого хранилища.",
                    ],
                    "hint": "Мы сравниваем нужный результат с входом функции: сколько записей уже загружено к моменту поиска или подсчёта?",
                    "answer": {
                        "explanation": "JsonStorage.load() возвращает весь список. get_task() ищет id в загруженных объектах, а get_statistics() проходит по ним для подсчёта. Это показывает объём операции, но не измеряет скорость.",
                        "steps": [
                            "Для чтения одной задачи отмечаем сначала storage.load(), затем поиск по id внутри результата.",
                            "Для статистики отмечаем загрузку списка, подсчёт выполненных и вычисление общего количества.",
                            "Формулируем наблюдение: результат может быть небольшим, хотя входом операции был весь набор.",
                        ],
                        "code": "get_task(id): load(все задачи) -> найти id в списке\nget_statistics(): load(все задачи) -> посчитать состояния",
                        "checks": [
                            "Различаются размер результата и объём загруженных данных.",
                            "JSON не назван всегда медленным или непригодным.",
                        ],
                    },
                },
                {
                    "title": "3. Предскажите результат двух снимков",
                    "task": "Прогноз показывает, что происходит, когда два независимых списка начинаются с одинаковых JSON-записей, меняют разные задачи и сохраняются по очереди.",
                    "requirements": [
                        "Для опыта используются данные в памяти, не рабочий tasks.json.",
                        "Прогноз фиксируется до выполнения примера.",
                        "В выводе названы сохранённая и потерянная правки.",
                    ],
                    "hint": "Мы проверяем, видит ли снимок B изменение снимка A после того, как B уже был загружен.",
                    "answer": {
                        "explanation": "json.loads(json.dumps(records)) создаёт независимую структуру в памяти из JSON-совместимых записей. После записи A stored содержит A, а полная запись B заменяет его состоянием, которое B получил раньше.",
                        "steps": [
                            "Создаём две записи Task-подобной формы и отдельно загружаем snapshot_a и snapshot_b.",
                            "В snapshot_a меняем title первой записи и сохраняем снимок в stored.",
                            "В старом snapshot_b меняем is_done второй записи и снова сохраняем весь список.",
                            "Сверяем результат: is_done второй записи изменился, а title первой вернулся к исходному.",
                        ],
                        "code": '''import json

initial = [
    {"id": 1, "title": "Прочитать", "priority": 2, "is_done": False, "tags": []},
    {"id": 2, "title": "Проверить тесты", "priority": 3, "is_done": False, "tags": []},
]
snapshot_a = json.loads(json.dumps(initial))
snapshot_b = json.loads(json.dumps(initial))

snapshot_a[0]["title"] = "Прочитать главу 2"
stored = json.loads(json.dumps(snapshot_a))
snapshot_b[1]["is_done"] = True
stored = json.loads(json.dumps(snapshot_b))
print(stored)''',
                        "checks": [
                            "Title первой задачи равно Прочитать, изменение snapshot_a потеряно.",
                            "Вторая задача сохраняет is_done=True из snapshot_b.",
                            "Рабочий JSON не открывается и не перезаписывается.",
                        ],
                    },
                },
                {
                    "title": "4. Объясните границу вывода",
                    "task": "Объяснение отделяет постоянное хранение от объединения обновлений и называет требования к следующей модели хранения.",
                    "requirements": [
                        "Причина потери связана с полной записью старого снимка, а не с ошибкой валидации или правкой одной и той же задачи.",
                        "Адресное чтение и согласованное завершение изменений названы потребностями, а не уже изученными реализациями.",
                        "Проект остаётся на JSON до последующих занятий.",
                    ],
                    "hint": "Мы сопоставляем два результата: задачи переживают перезапуск, но второй старый снимок не содержит первую правку.",
                    "answer": {
                        "explanation": "Файл позволяет читать данные после перезапуска. load() возвращает состояние на момент чтения, а save(tasks) передаёт целый список. Поэтому поздняя запись старого снимка может заменить более новую правку. Обе операции меняли разные задачи и не нарушали валидацию.",
                        "steps": [
                            "Называем подтверждённое свойство: данные записываются в JSON и читаются при новом запуске.",
                            "Называем ограничение: полное чтение охватывает весь набор, а полная запись не объединяет снимки сама.",
                            "Формулируем запрос к следующему механизму: выбирать нужные записи и согласованно завершать связанные изменения.",
                            "Оставляем Planner, API, CLI и рабочий JSON без изменений; таблицы и SQL появятся дальше.",
                        ],
                        "checks": [
                            "Постоянство не объявлено защитой от потери обновления.",
                            "Другая база не объявлена автоматическим исправлением неверных правил приложения.",
                        ],
                    },
                },
            ],
            "result": "Разбор связывает реальные load()/save() Planner с полным списком, объясняет объём чтения и показывает, почему запись старого снимка может потерять более раннее изменение. Рабочий проект и данные не меняются.",
        }
    ],
    "67.1": [
        {
            "title": "Подготовьте исходную ORM-схему Planner",
            "task": (
                "В существующем StudyHub Planner опишите таблицу tasks отдельной ORM-моделью и добавьте "
                "явную команду её создания. Используйте настройки и Engine из предыдущего шага, сохраняя "
                "действующие API, CLI и JSON-путь. Все проверки схемы выполняйте на отдельных SQLite-файлах."
            ),
            "tasks": [
                {
                    "title": "1. Опишите TaskRow отдельно от Task",
                    "task": (
                        "Создайте Base и ORM-класс TaskRow в app/DBase/models.py. Описание сохраняет "
                        "прежние поля, ограничения и служебную копию заголовка, а Task и HTTP-схема "
                        "остаются на своих местах."
                    ),
                    "requirements": [
                        "В metadata зарегистрирована ровно таблица tasks с колонками id, title, priority, is_done, tags и title_normalized.",
                        "id положительный, priority лежит в диапазоне 1–5, обязательные значения не становятся NULL; для title не вводится новый максимум длины.",
                        "tags остаётся JSON-списком, а title_normalized является непубличной копией title.lower(), не уникальным пользовательским полем.",
                    ],
                    "hint": (
                        "Сначала запишите роль и тип каждой колонки. Затем свяжите TaskRow с DeclarativeBase "
                        "и задайте только согласованные настройки mapped_column."
                    ),
                    "answer": {
                        "explanation": (
                            "Task продолжает отвечать за предметные правила, а TaskRow описывает хранение "
                            "строки. DeclarativeBase собирает таблицу в metadata; ограничения повторяют "
                            "нужные инварианты на уровне базы. Callable default=list создаёт отдельный "
                            "список при будущей вставке."
                        ),
                        "steps": [
                            "Импортируйте типы SQLAlchemy и DeclarativeBase, Mapped, mapped_column.",
                            "Объявите Base как наследника DeclarativeBase, затем TaskRow с __tablename__ равным tasks.",
                            "Задайте колонки и ограничения CheckConstraint для положительного id и диапазона priority.",
                            "Не ограничивайте title значением 120: это максимум HTTP-запроса, а не всех старых записей Planner.",
                        ],
                        "code": """from sqlalchemy import Boolean, CheckConstraint, Integer, JSON, String
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column


class Base(DeclarativeBase):
    pass


class TaskRow(Base):
    __tablename__ = "tasks"
    __table_args__ = (
        CheckConstraint("id > 0", name="ck_tasks_id_positive"),
        CheckConstraint("priority BETWEEN 1 AND 5", name="ck_tasks_priority_range"),
    )

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    title: Mapped[str] = mapped_column(String, nullable=False)
    priority: Mapped[int] = mapped_column(Integer, nullable=False, default=2)
    is_done: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)
    tags: Mapped[list[str]] = mapped_column(JSON, nullable=False, default=list)
    title_normalized: Mapped[str] = mapped_column(String, nullable=False)""",
                        "checks": [
                            "Base.metadata содержит таблицу tasks с шестью согласованными колонками.",
                            "Task, TaskRead, PlannerService, JsonStorage и HTTP-контракт не переписаны.",
                        ],
                    },
                },
                {
                    "title": "2. Добавьте отдельную команду создания схемы",
                    "task": (
                        "Создайте app/DBase/init_db.py, который импортирует модели, получает настроенный "
                        "Engine из уже существующей фабрики и явно вызывает создание схемы. Обычный импорт "
                        "приложения не выполняет DDL."
                    ),
                    "requirements": [
                        "Команда использует DATABASE_URL и фабрику Engine из предыдущего шага, не создаёт параллельный источник настроек.",
                        "Импорт моделей выполняется до обращения к Base.metadata.",
                        "Session, INSERT, API и переключение Planner на SQLite не добавляются.",
                    ],
                    "hint": (
                        "Разделите импорт модуля и вызов main. Команду создания держите внутри явной точки "
                        "запуска, а не на верхнем уровне app/api.py."
                    ),
                    "answer": {
                        "explanation": (
                            "У mapped-класса таблица регистрируется в metadata при импорте модуля. "
                            "create_all обращается к базе отдельно. В примере функция фабрики из шага 67 "
                            "называется build_engine; если в проекте она названа иначе, сохраняем фактическое "
                            "имя и вызываем ту же фабрику."
                        ),
                        "steps": [
                            "Импортируйте load_settings и фактическую фабрику Engine из app/DBase/engine.py.",
                            "Импортируйте app.DBase.models до Base.metadata, чтобы TaskRow уже был зарегистрирован.",
                            "В main получите настройки, создайте Engine с settings.database_url и вызовите create_all.",
                            "Защитите вызов main условием запуска файла, затем запустите команду явно как модуль.",
                        ],
                        "code": """import app.DBase.models
from app.core.config import load_settings
from app.DBase.engine import build_engine
from app.DBase.models import Base


def main() -> None:
    settings = load_settings()
    engine = build_engine(settings.database_url)
    Base.metadata.create_all(engine)


if __name__ == "__main__":
    main()""",
                        "checks": [
                            "Команда запускается отдельно и создаёт отсутствующую таблицу на выбранном тестовом URL.",
                            "Простой импорт app.DBase.init_db и app.api не меняет состояние базы.",
                        ],
                    },
                },
                {
                    "title": "3. Сверьте фактическую таблицу с metadata",
                    "task": (
                        "На отдельной файловой базе сравните состав таблицы tasks с моделью и прочитайте "
                        "ограничения. По результатам объясните, почему обязательность, primary key и "
                        "CheckConstraint проверяются разными частями описания."
                    ),
                    "requirements": [
                        "Проверка читает SQLite через уже настроенный Engine и использует PRAGMA table_info и sqlite_master.",
                        "Подтверждены шесть колонок, первичный ключ id, NOT NULL и ограничения id и priority.",
                        "Python default не объявляется серверным default только потому, что поле имеет значение в mapped_column.",
                    ],
                    "hint": (
                        "PRAGMA возвращает строки с именем, типом, nullable, default и признаком primary key. "
                        "SQL sqlite_master покажет сохранённый текст DDL и выражения CHECK."
                    ),
                    "answer": {
                        "explanation": (
                            "PRAGMA table_info подтверждает структуру столбцов и флаг primary key. "
                            "Ограничения CHECK читаются из DDL в sqlite_master. Значение default=2 является "
                            "client-side default SQLAlchemy и применяется при INSERT; SQLite не обязан "
                            "показывать его в PRAGMA как DEFAULT."
                        ),
                        "steps": [
                            "Запросите список колонок на том же Engine, где была создана тестовая схема.",
                            "Соберите имена и сравните с ожидаемыми шестью полями.",
                            "Проверьте id через флаг primary key и обязательность через notnull.",
                            "Прочитайте DDL из sqlite_master и найдите обе проверки CheckConstraint.",
                        ],
                        "code": """from sqlalchemy import text


with engine.connect() as connection:
    columns = connection.execute(text("PRAGMA table_info(tasks)")).all()
    names = {row[1] for row in columns}
    create_sql = connection.execute(
        text("SELECT sql FROM sqlite_master WHERE type = :kind AND name = :name"),
        {"kind": "table", "name": "tasks"},
    ).scalar_one()

required = {"id", "title", "priority", "is_done", "tags", "title_normalized"}
assert names == required
by_name = {row[1]: row for row in columns}
assert by_name["id"][5] == 1
assert all(by_name[name][3] == 1 for name in required)
assert "id > 0" in create_sql.lower()
assert "priority between 1 and 5" in create_sql.lower()""",
                        "checks": [
                            "Имена колонок совпадают с исходной моделью.",
                            "Для id подтверждены первичный ключ и обязательность.",
                            "Текст DDL содержит условия для id и priority.",
                        ],
                    },
                },
                {
                    "title": "4. Проверьте повторный запуск и отсутствие побочных изменений",
                    "task": (
                        "Запустите команду повторно на совпадающей тестовой схеме, а затем отдельно на "
                        "временной базе с несовпадающей таблицей tasks. Подтвердите, что импорт не создаёт "
                        "таблицы, повторный запуск не удаляет данные, а несовпадение не исправляется автоматически."
                    ),
                    "requirements": [
                        "Обе базы изолированы от рабочего JSON и любых пользовательских SQLite-файлов.",
                        "Несовпадающая таблица сохраняет прежний состав и контрольную строку после create_all.",
                        "Никакие drop_all, миграция или автоматический запуск создания схемы не добавлены.",
                    ],
                    "hint": (
                        "Для второй базы вручную создайте только id и marker, добавьте одну контрольную строку, "
                        "затем вызовите тот же create_all. Сравните состав таблицы и значение marker."
                    ),
                    "answer": {
                        "explanation": (
                            "create_all по умолчанию проверяет наличие таблиц. На совпадающей схеме он "
                            "пропускает существующую таблицу; на несовпадающей тоже не переписывает её, "
                            "поэтому старые колонки и контрольная запись сохраняются. Это не механизм миграций."
                        ),
                        "steps": [
                            "Сначала импортируйте init_db на новом тестовом Engine и запросите sqlite_master: таблицы tasks ещё нет.",
                            "Вызовите явную команду дважды на отдельном пустом URL и сравните схему до и после второго запуска.",
                            "На другой временной базе создайте короткую таблицу tasks с колонками id и marker и вставьте контрольную строку.",
                            "Вызовите create_all и снова прочитайте PRAGMA и marker; несовпадающую базу затем удалите как временный файл.",
                        ],
                        "code": """with mismatch_engine.begin() as connection:
    connection.execute(text("CREATE TABLE tasks (id INTEGER PRIMARY KEY, marker TEXT NOT NULL)"))
    connection.execute(
        text("INSERT INTO tasks (marker) VALUES (:marker)"),
        {"marker": "keep"},
    )

Base.metadata.create_all(mismatch_engine)

with mismatch_engine.connect() as connection:
    columns = connection.execute(text("PRAGMA table_info(tasks)")).all()
    marker = connection.scalar(text("SELECT marker FROM tasks WHERE id = 1"))

assert {row[1] for row in columns} == {"id", "marker"}
assert marker == "keep" """,
                        "checks": [
                            "После повторного запуска в тестовой базе по-прежнему одна таблица tasks.",
                            "Контрольная строка и структура несовпадающей схемы не изменились.",
                            "API, CLI и рабочий JSON остаются на прежнем пути.",
                        ],
                    },
                },
            ],
            "result": (
                "В отдельной SQLite-базе создана исходная схема tasks с согласованными полями и ограничениями. "
                "Повторный запуск безопасен для совпадающей схемы, несовпадающая таблица не изменяется автоматически, "
                "обычный импорт не выполняет DDL."
            ),
        }
    ],
    "68.1": [
        {
            "title": "Проверки rollback и закрытия Session",
            "task": (
                "В начале tests/test_dbase_transactions.py создайте отдельную модульную фикстуру isolated_database(tmp_path): "
                "она подготавливает временную SQLite-схему и выдаёт пару (engine, session_factory), закрывая Engine в finally. "
                "Затем четыре теста на этой фикстуре показывают отмену незавершённой записи, атомарность связанных изменений "
                "и восстановление после ошибки flush. Следующая независимая операция подтверждается через новую Session. "
                "Рабочие API, CLI и JSON-хранилище остаются вне проверки."
            ),
            "tasks": [
                {
                    "title": "1. Создайте фикстуру и отмените незавершённую запись",
                    "task": (
                        "В начале tests/test_dbase_transactions.py объявите фикстуру isolated_database(tmp_path), "
                        "которая создаёт схему на отдельном SQLite-файле и выдаёт Engine с фабрикой Session. "
                        "Затем добавьте тест: отправьте корректный TaskRow через flush, вызовите rollback и проверьте "
                        "через новую Session, что запись отсутствует, хотя объект получил id до отмены."
                    ),
                    "requirements": [
                        "Фикстура называется isolated_database и живёт в tests/test_dbase_transactions.py, а не в conftest.py.",
                        "Она инициализирует схему для файла из tmp_path, выдаёт (engine, session_factory) и вызывает engine.dispose() в finally.",
                        "Проверка отсутствия использует новую Session и тот же тестовый файл.",
                    ],
                    "hint": (
                        "Сначала подготовим локальную для этого модуля фикстуру: настроим временный Settings, "
                        "инициализируем схему, создадим Engine и фабрику. В тесте сохраним id после flush, вызовем rollback "
                        "и откроем отдельную Session для проверки."
                    ),
                    "answer": {
                        "explanation": (
                            "Фикстура объявлена в самом модуле транзакционных тестов, поэтому доступна его тестам без изменения "
                            "общего conftest.py. tmp_path изолирует файл, initialize_database создаёт исходную схему, "
                            "а finally освобождает Engine даже при падении теста. Flush отправляет INSERT, но не подтверждает "
                            "транзакцию; rollback отменяет его, а новая Session проверяет базу независимо от первой."
                        ),
                        "steps": [
                            "Объявляем isolated_database(tmp_path) в tests/test_dbase_transactions.py: формируем Settings с временными путями, инициализируем схему, создаём Engine и фабрику Session.",
                            "Гарантируем engine.dispose() в finally и выдаём из фикстуры (engine, session_factory).",
                            "Принимаем isolated_database в тесте и распаковываем фабрику Session.",
                            "Вызываем flush, сохраняем id, выполняем rollback и читаем по id через новую Session.",
                        ],
                        "code": """import pytest
from sqlalchemy import URL
from app.DBase.engine import make_engine
from app.DBase.init_db import initialize_database
from app.DBase.models import TaskRow
from app.DBase.session import make_session_factory
from app.core.config import Settings


@pytest.fixture
def isolated_database(tmp_path):
    database_path = tmp_path / "transactions.sqlite3"
    database_url = URL.create(
        "sqlite", database=database_path.as_posix()
    ).render_as_string(hide_password=False)
    settings = Settings(
        json_path=tmp_path / "tasks.json",
        app_name="Test",
        database_url=database_url,
    )
    initialize_database(settings)
    engine = make_engine(settings.database_url)
    try:
        yield engine, make_session_factory(engine)
    finally:
        engine.dispose()


def test_rollback_hides_uncommitted_row(isolated_database):
    _engine, session_factory = isolated_database
    row = TaskRow(
        title="Проверить отчёт",
        priority=2,
        is_done=False,
        tags=[],
        title_normalized="проверить отчёт",
    )
    with session_factory() as session:
        session.add(row)
        session.flush()
        task_id = row.id
        assert task_id is not None
        session.rollback()

    with session_factory() as verifier:
        assert verifier.get(TaskRow, task_id) is None""",
                        "checks": [
                            "Flush выполнен до rollback, поэтому пример проверяет реальное незавершённое изменение.",
                            "Новая Session не находит строку по выданному id.",
                        ],
                    },
                },
                {
                    "title": "2. Проверьте отмену связанных изменений",
                    "task": (
                        "Один тест отправляет корректную строку, затем получает IntegrityError на строке с "
                        "недопустимым priority. После rollback независимое чтение не находит ни первую, ни ошибочную запись."
                    ),
                    "requirements": [
                        "Недопустимый priority нарушает существующее ограничение таблицы из 67.1.",
                        "Тест принимает isolated_database из tests/test_dbase_transactions.py и использует её фабрику.",
                        "Ошибка не скрывается, а рабочая JSON-база не используется.",
                    ],
                    "hint": (
                        "В начале теста распакуем _engine, session_factory = isolated_database. Затем вызовем flush "
                        "для корректной строки и ошибочной, перехватим только ожидаемый IntegrityError, восстановим Session "
                        "и проверим обе строки через новую."
                    ),
                    "answer": {
                        "explanation": (
                            "Первый flush отправляет SQL в ту же транзакцию, но ещё не подтверждает его. Ошибка ограничения "
                            "на втором flush делает всю транзакцию неуспешной, поэтому после rollback первая строка тоже "
                            "должна отсутствовать."
                        ),
                        "steps": [
                            "Создаём две строки с разными заголовками: первая допустимая, вторая с priority за пределами 1–5.",
                            "Добавляем первую строку и вызываем flush, затем добавляем ошибочную и ожидаем IntegrityError от второго flush.",
                            "Вызываем rollback после ожидаемого отказа.",
                            "Новая Session проверяет отсутствие обеих строк.",
                        ],
                        "code": """import pytest
from sqlalchemy import select
from sqlalchemy.exc import IntegrityError
from app.DBase.models import TaskRow


def test_constraint_error_rolls_back_both_rows(isolated_database):
    _engine, session_factory = isolated_database
    first = TaskRow(
        title="Первая часть",
        priority=2,
        is_done=False,
        tags=[],
        title_normalized="первая часть",
    )
    invalid = TaskRow(
        title="Недопустимая часть",
        priority=6,
        is_done=False,
        tags=[],
        title_normalized="недопустимая часть",
    )
    with session_factory() as session:
        session.add(first)
        session.flush()
        first_id = first.id
        assert first_id is not None
        session.add(invalid)
        with pytest.raises(IntegrityError):
            session.flush()
        session.rollback()

    with session_factory() as verifier:
        assert verifier.get(TaskRow, first_id) is None
        invalid_id = verifier.scalar(
            select(TaskRow.id).where(TaskRow.title == "Недопустимая часть")
        )
        assert invalid_id is None""",
                        "checks": [
                            "Ошибка вызвана реальным CheckConstraint для priority.",
                            "Чтение после rollback подтверждает отсутствие обеих строк.",
                        ],
                    },
                },
                {
                    "title": "3. Восстановите ту же Session после ошибки",
                    "task": (
                        "Тест перехватывает ожидаемую ошибку flush и пробует выполнить запрос до rollback. "
                        "Session отклоняет новый запрос; после явного rollback та же Session успешно фиксирует следующую "
                        "корректную строку, а независимая Session подтверждает итог."
                    ),
                    "requirements": [
                        "До rollback проверяется именно отказ Session, а не только отсутствие строки в базе.",
                        "Тест использует isolated_database из tests/test_dbase_transactions.py.",
                        "После восстановления выполняется новая успешная транзакция.",
                    ],
                    "hint": (
                        "В начале теста получим фабрику из isolated_database. Для запроса в неактивной Session SQLAlchemy "
                        "сообщает PendingRollbackError; зафиксируем этот отказ, вызовем rollback и начнём новую работу."
                    ),
                    "answer": {
                        "explanation": (
                            "Перехват IntegrityError не очищает состояние Session. До rollback она блокирует следующий "
                            "запрос. Явное восстановление позволяет той же Session начать новую транзакцию; новая Session "
                            "нужна уже для независимого подтверждения сохранённого результата."
                        ),
                        "steps": [
                            "Выполняем ошибочный flush и перехватываем ожидаемый IntegrityError.",
                            "До rollback проверяем, что запрос через ту же Session вызывает PendingRollbackError.",
                            "Вызываем rollback, добавляем корректную строку и подтверждаем новую операцию через commit.",
                            "Новая Session читает сохранённую строку, а неуспешный сценарий остаётся отменённым.",
                        ],
                        "code": """import pytest
from sqlalchemy import select
from sqlalchemy.exc import IntegrityError, PendingRollbackError
from app.DBase.models import TaskRow


def test_same_session_recovers_after_rollback(isolated_database):
    _engine, session_factory = isolated_database
    invalid = TaskRow(
        title="Проверка ограничения",
        priority=6,
        is_done=False,
        tags=[],
        title_normalized="проверка ограничения",
    )
    next_row = TaskRow(
        title="Следующая операция",
        priority=3,
        is_done=False,
        tags=[],
        title_normalized="следующая операция",
    )
    with session_factory() as session:
        session.add(invalid)
        with pytest.raises(IntegrityError):
            session.flush()
        with pytest.raises(PendingRollbackError):
            session.scalar(select(TaskRow.id))

        session.rollback()
        session.add(next_row)
        session.commit()
        next_id = next_row.id

    with session_factory() as verifier:
        assert verifier.get(TaskRow, next_id) is not None""",
                        "checks": [
                            "Запрос до rollback отклонён как PendingRollbackError.",
                            "После rollback та же Session выполняет commit, а новая Session читает результат.",
                        ],
                    },
                },
                {
                    "title": "4. Закройте ресурс при исключении",
                    "task": (
                        "Исключение выходит из ресурсной области после flush и не превращается в успешный результат. "
                        "После закрытия Session отдельное чтение подтверждает, что неподтверждённая строка отсутствует "
                        "и тестовая база доступна для следующей операции."
                    ),
                    "requirements": [
                        "Проверка использует isolated_database из tests/test_dbase_transactions.py и её временную базу.",
                        "Engine из фикстуры подтверждает, что соединение освобождено после выхода из контекста.",
                    ],
                    "hint": (
                        "Распакуем engine и session_factory из isolated_database. Оставим исключение видимым через pytest.raises; "
                        "проверим занятое соединение внутри контекста и освобождённый пул после выхода."
                    ),
                    "answer": {
                        "explanation": (
                            "Контекст Session закрывает ресурс, но не выполняет commit. Если исключение выходит из блока "
                            "с незавершённой транзакцией, она не становится сохранённой записью; новый экземпляр "
                            "проверяет это независимо."
                        ),
                        "steps": [
                            "Создаём корректную строку и выполняем flush внутри контекста Session.",
                            "Поднимаем ожидаемое исключение до commit и проверяем, что оно выходит из блока.",
                            "После закрытия исходной Session открываем новую на том же временном файле.",
                            "Подтверждаем отсутствие строки и возможность продолжить проверку базы.",
                        ],
                        "code": """import pytest
from app.DBase.models import TaskRow


def test_session_closes_without_committing_on_error(isolated_database):
    engine, session_factory = isolated_database
    row = TaskRow(
        title="Незавершённая работа",
        priority=2,
        is_done=False,
        tags=[],
        title_normalized="незавершённая работа",
    )
    with pytest.raises(RuntimeError, match="остановка проверки"):
        with session_factory() as session:
            with session.begin():
                session.add(row)
                session.flush()
                task_id = row.id
                assert engine.pool.checkedout() == 1
                raise RuntimeError("остановка проверки")

    assert engine.pool.checkedout() == 0

    with session_factory() as verifier:
        assert verifier.get(TaskRow, task_id) is None""",
                        "checks": [
                            "Исключение выходит из контекста и не проглатывается.",
                            "После выхода неподтверждённая строка отсутствует в новой Session.",
                        ],
                    },
                },
            ],
            "result": (
                "Четыре проверки подтверждают явную отмену, атомарность одной транзакции, "
                "восстановление Session после ошибки и освобождение ресурса без ложного commit."
            ),
        }
    ],    70: [
        {
            "title": "SQL-репозиторий чтения",
            "task": (
                "В checkout StudyHub после подтверждённого результата подготовки JSON-адаптера "
                "появляется частичный SqlTaskRepository с операциями list и get. "
                "Изолированные SQLite-проверки подтверждают их предметный результат, "
                "а рабочие API и CLI продолжают использовать полный JSON-путь."
            ),
            "requirements": [
                "Коммит 3b8498a фиксирует подготовку JSON-адаптера. Проверьте app/DBase/session.py и app/DBase/models.py, а также app/repositories.py и app/services.py: фабрику сессий, схему и mapping, полный JSON-адаптер и его использование сервисом. Для более нового коммита проверьте ту же основу по файлам.",
                "Репозиторий получает Session извне и не закрывает её, не вызывает commit и не читает JSON.",
                "SQL-проверки используют отдельную временную SQLite-базу; штатный JSON-путь остаётся default.",
            ],
            "tasks": [
                {
                    "title": "Реализованы только list и get",
                    "task": (
                        "SqlTaskRepository в app/DBase/repositories.py принимает готовую "
                        "Session. Метод list возвращает Task по возрастанию id, а метод "
                        "get возвращает Task или None."
                    ),
                    "requirements": [
                        "ORM-строки проходят через существующую task_from_row.",
                        "Сессией управляет вызывающая сторона.",
                    ],
                    "hint": (
                        "Сопоставьте select/scalars для набора с Session.get для первичного ключа."
                    ),
                    "answer": {
                        "explanation": (
                            "Мы принимаем Session в конструкторе и возвращаем предметные Task. "
                            "Для списка задаём порядок в SQL. Для неизвестного id сохраняем None, "
                            "чтобы сервис применил своё правило ошибки. Репозиторий не владеет "
                            "переданным ресурсом, поэтому здесь нет commit и close."
                        ),
                        "steps": [
                            "Вызывающая сторона создаёт Session и передаёт её репозиторию.",
                            "list выполняет упорядоченную выборку и отображает каждую строку.",
                            "get проверяет отсутствие до вызова mapping.",
                        ],
                        "code": """from sqlalchemy import select
from sqlalchemy.orm import Session

from app.DBase.models import TaskRow, task_from_row
from app.models import Task


class SqlTaskRepository:
    def __init__(self, session: Session) -> None:
        self.session = session

    def list(self) -> list[Task]:
        rows = self.session.scalars(
            select(TaskRow).order_by(TaskRow.id)
        ).all()
        return [task_from_row(row) for row in rows]

    def get(self, task_id: int) -> Task | None:
        row = self.session.get(TaskRow, task_id)
        if row is None:
            return None
        return task_from_row(row)""",
                        "checks": [
                            "list для пустой таблицы возвращает [].",
                            "list задаёт порядок по id и возвращает предметные Task.",
                            "get возвращает Task или None.",
                        ],
                    },
                },
                {
                    "title": "SQL-результат проверен отдельно",
                    "task": (
                        "Тесты работают с временной файловой SQLite-базой и известными строками. "
                        "Полученные Task остаются пригодны после закрытия Session, а повторная "
                        "сессия видит те же сохранённые поля."
                    ),
                    "requirements": [
                        "Проверены пустой список, порядок, известная и отсутствующая запись.",
                        "Строки содержат разные статусы и независимые tags.",
                    ],
                    "hint": (
                        "Создайте схему на tmp_path, добавьте строки в транзакции и проверьте "
                        "результат list после выхода из Session."
                    ),
                    "answer": {
                        "explanation": (
                            "Мы используем настоящую SQLite и закрываем сессию до проверки "
                            "предметных полей. Отдельный список tags защищает ORM-строку от "
                            "локального изменения Task. Вторая Session подтверждает, что чтение "
                            "не изменило данные."
                        ),
                        "steps": [
                            "Фабрика создаёт Session для временной базы; TaskRow импортирован до создания схемы.",
                            "Записи добавлены в обратном порядке, а list возвращает id по возрастанию.",
                            "После закрытия Session проверены Task, tags и None для отсутствующего id.",
                            "Вторая Session подтверждает исходное значение tags в базе.",
                        ],
                        "code": """import pytest
from sqlalchemy import create_engine, select
from sqlalchemy.orm import sessionmaker

from app.DBase.models import Base, TaskRow
from app.DBase.repositories import SqlTaskRepository


@pytest.fixture
def session_factory(tmp_path):
    engine = create_engine(f"sqlite:///{tmp_path / 'lesson87.sqlite3'}")
    Base.metadata.create_all(engine)
    factory = sessionmaker(bind=engine)
    try:
        yield factory
    finally:
        engine.dispose()


def make_row(task_id, title, priority, is_done, tags):
    return TaskRow(
        id=task_id,
        title=title,
        priority=priority,
        is_done=is_done,
        tags=tags,
        title_normalized=title.lower(),
    )


def test_list_and_get_return_tasks_after_session_closes(session_factory):
    with session_factory.begin() as session:
        session.add_all([
            make_row(9, "Сверить отчёт", 4, True, ["work"]),
            make_row(2, "Купить чай", 2, False, ["home"]),
        ])

    with session_factory() as session:
        repository = SqlTaskRepository(session)
        tasks = repository.list()
        found = repository.get(9)
        missing = repository.get(404)

    assert [task.id for task in tasks] == [2, 9]
    assert tasks[0].to_dict() == {
        "id": 2,
        "title": "Купить чай",
        "priority": 2,
        "is_done": False,
        "tags": ["home"],
    }
    assert "title_normalized" not in tasks[0].to_dict()
    assert found.id == 9
    assert found.tags == ["work"]
    assert missing is None

    tasks[0].tags.append("local")
    with session_factory() as session:
        rows = session.scalars(select(TaskRow).order_by(TaskRow.id)).all()
        assert rows[0].tags == ["home"]""",
                        "checks": [
                            "Схема и данные находятся только в tmp_path.",
                            "Выборка содержит все пять предметных полей, отдельные tags и порядок 2, 9.",
                            "Повторное чтение в новой Session показывает исходные данные.",
                        ],
                    },
                },
                {
                    "title": "Штатная сборка остаётся JSON",
                    "task": (
                        "Обычный build_service и прежние API/CLI-сценарии продолжают работать "
                        "через полный JSON-путь. SqlTaskRepository используется только для "
                        "изолированных проверок уже реализованных операций."
                    ),
                    "hint": (
                        "Проследите, кто создаёт репозиторий при штатной сборке и какие операции "
                        "сервис запрашивает."
                    ),
                    "answer": {
                        "explanation": (
                            "Новый класс покрывает только list и get. Он не может заменить "
                            "полный путь PlannerService, пока отсутствуют SQL-запись, поиск и "
                            "статистика. Скрытый fallback также неверен, потому что он разделил "
                            "бы один сервис между разными источниками данных."
                        ),
                        "steps": [
                            "Проверяем, что штатная сборка по-прежнему выбирает JSON-адаптер.",
                            "Запускаем прежние API, CLI и JSON-проверки на изолированных данных.",
                            "Убеждаемся, что SQL-класс не содержит HTTP-ответов и не создаёт Session сам.",
                        ],
                        "checks": [
                            "Обычные API и CLI не направлены на частичный SQL-класс.",
                            "SQL-тесты не читают и не меняют рабочий JSON.",
                            "Нереализованные операции не маскируются заглушками или fallback.",
                        ],
                    },
                },
            ],
            "result": (
                "Две SQL-операции чтения возвращают привычные Task и None, проходят изолированную "
                "проверку, а приложение продолжает работать через JSON."
            ),
        }
    ],
    "68.2": [
        {
            "title": "Преобразовать ORM-строку в предметную Task",
            "task": (
                "В изолированной тестовой базе TaskRow явно преобразуется в "
                "существующую Task. Проверки чтения списка и записи по id "
                "подтверждают результат после закрытия Session; рабочие API, "
                "CLI и JSON Planner остаются на прежнем пути."
            ),
            "tasks": [
                {
                    "title": "1. Подтвердите вход и mapping",
                    "task": (
                        "В app/DBase/models.py есть task_from_row рядом с "
                        "TaskRow. Функция возвращает существующую предметную "
                        "Task и переносит только её поля."
                    ),
                    "requirements": [
                        "Предварительное состояние содержит Engine, TaskRow, фабрику Session и изолированную схему; отсутствующая предпосылка отмечается, а не создаётся повторно.",
                        "Преобразуются id, title, priority, is_done и tags; для tags создаётся отдельный список.",
                        "title_normalized остаётся только в ORM-таблице. Класс Task и HTTP-схемы не расширяются.",
                    ],
                    "hint": (
                        "Сверим поля Task и TaskRow, затем передадим предметные "
                        "значения через существующий конструктор Task. Функция "
                        "располагается в DBase/models.py рядом с TaskRow."
                    ),
                    "answer": {
                        "explanation": (
                            "DBase/models.py видит ORM-строку и может импортировать "
                            "предметную Task. Новый объект проходит прежнюю "
                            "валидацию Task. Копирование tags делает границу владения "
                            "явной, а служебное поле не переносится."
                        ),
                        "steps": [
                            "Импортируем Task из app.models в модуль DBase, не добавляя обратную зависимость из предметной модели на SQLAlchemy.",
                            "Читаем пять полей, которые входят в Task, и передаём их в существующий конструктор.",
                            "Создаём отдельный список tags; title_normalized не включаем.",
                        ],
                        "code": '''from app.models import Task


def task_from_row(row: TaskRow) -> Task:
    return Task(
        id=row.id,
        title=row.title,
        priority=row.priority,
        is_done=row.is_done,
        tags=list(row.tags),
    )''',
                        "checks": [
                            "Результат является экземпляром существующей Task.",
                            "Совпадают id, title, priority, is_done и tags.",
                            "Изменение списка tags у Task не меняет список исходной строки.",
                            "Task.to_dict() не содержит title_normalized.",
                        ],
                    },
                },
                {
                    "title": "2. Прочитайте список и одну запись",
                    "task": (
                        "Чтение тестовой схемы возвращает несколько Task в "
                        "порядке id, Task для существующего первичного ключа "
                        "и None для отсутствующего."
                    ),
                    "requirements": [
                        "Список получается через select(TaskRow), Session.scalars() и all(); проверяемый порядок задаёт order_by(TaskRow.id).",
                        "Session.get(TaskRow, id) для неизвестного id возвращает None; на уровне DBase результат не превращается в HTTP- или предметную ошибку.",
                        "SQL-проверки используют только изолированную базу тестовой фикстуры.",
                    ],
                    "hint": (
                        "Сначала сохраняем ORM-строку, затем отдельно проверяем "
                        "None. Пустой список и отсутствие одной записи описывают "
                        "разные результаты."
                    ),
                    "answer": {
                        "explanation": (
                            "scalars(...).all() возвращает список ORM-строк, в том "
                            "числе пустой список. get использует первичный ключ и "
                            "возвращает None, если записи нет. Mapping применяется "
                            "только после проверки наличия строки."
                        ),
                        "steps": [
                            "Используем уже существующую фабрику Session из фикстуры; session_factory ниже обозначает её, а не новую фабрику.",
                            "Внутри Session получаем упорядоченный список и одну строку по известному id.",
                            "Отдельно запрашиваем неизвестный id и оставляем результат None.",
                            "Преобразуем найденные строки и выполняем проверки результата.",
                        ],
                        "code": '''from sqlalchemy import select


with session_factory() as session:
    rows = session.scalars(
        select(TaskRow).order_by(TaskRow.id)
    ).all()
    tasks = [task_from_row(row) for row in rows]

    existing_row = session.get(TaskRow, existing_id)
    missing_row = session.get(TaskRow, missing_id)

    existing_task = (
        task_from_row(existing_row)
        if existing_row is not None
        else None
    )
    missing_task = (
        task_from_row(missing_row)
        if missing_row is not None
        else None
    )

assert [task.id for task in tasks] == sorted(task.id for task in tasks)
assert existing_task is not None
assert missing_task is None''',
                        "checks": [
                            "Пустая таблица даёт [], а не исключение.",
                            "Список упорядочен по id и содержит Task, а не TaskRow.",
                            "Известный id даёт Task; неизвестный id даёт None.",
                        ],
                    },
                },
                {
                    "title": "3. Подтвердите независимость результата",
                    "task": (
                        "После выхода из Session поля обычной Task доступны. "
                        "Изменение tags одного результата не меняет соседнюю "
                        "Task или сохранённую строку; предметный и HTTP-контракты "
                        "остаются прежними."
                    ),
                    "requirements": [
                        "Task читается после закрытия исходной Session без обращения к ORM.",
                        "Изменение tags одной Task не меняет другую Task или сохранённую строку.",
                        "В Task и HTTP-схемах нет title_normalized; HTTP handlers не меняются.",
                    ],
                    "hint": (
                        "Сохраняем id и исходные tags до закрытия контекста. "
                        "Состояние таблицы читаем через новую Session, а не по "
                        "тому же ORM-объекту."
                    ),
                    "answer": {
                        "explanation": (
                            "Task содержит собранные значения и не зависит от "
                            "Session. Новая Session подтверждает состояние SQLite, "
                            "поэтому локальное изменение списка нельзя принять за "
                            "изменение таблицы. Commit ради чтения не нужен."
                        ),
                        "steps": [
                            "Копируем id и ожидаемые tags, затем выходим из контекста Session.",
                            "Проверяем поля Task и добавляем уникальную временную метку только в список одной Task.",
                            "Проверяем, что другая Task не изменилась, затем новой Session читаем исходные tags по id.",
                            "Сверяем Task.to_dict и прежние поля TaskRead; рабочие API и CLI остаются на JSON.",
                        ],
                        "code": '''first_id = tasks[0].id
stored_tags = list(tasks[0].tags)
other_tags = list(tasks[1].tags)

tasks[0].tags.append("только-в-памяти")

assert tasks[0].id == first_id
assert tasks[1].tags == other_tags
assert "title_normalized" not in tasks[0].to_dict()

with session_factory() as session:
    stored_row = session.get(TaskRow, first_id)
    assert stored_row is not None
    assert stored_row.tags == stored_tags''',
                        "checks": [
                            "Поля обычной Task читаются после завершения исходной Session.",
                            "Соседняя Task и строка в отдельной базе сохраняют прежние tags.",
                            "title_normalized не входит в предметный словарь или публичную HTTP-схему.",
                            "Рабочий JSON, API, CLI и handlers не изменены.",
                        ],
                    },
                },
            ],
            "result": (
                "DBase явно превращает TaskRow в существующую Task. SQLAlchemy "
                "читает упорядоченный список и одну запись, отсутствие остаётся "
                "None, а независимые Task доступны после закрытия Session. "
                "Проверки изолированы от рабочего JSON Planner."
            ),
        }
    ],
    "66.1": [
        {
            "title": "Первая SQL-сессия в SQLite",
            "task": (
                "Создайте учебную базу SQLite в памяти, добавьте задачи параметрами, "
                "спрогнозируйте результат выборки, измените и удалите строки по id, "
                "затем сравните commit() и rollback(). Рабочий Planner и его JSON "
                "хранилище не меняются."
            ),
            "tasks": [
                {
                    "title": "1. Создайте таблицу и добавьте задачи",
                    "task": "Откройте :memory: и создайте tasks с первичным ключом, названием, приоритетом и признаком выполнения. Добавьте четыре строки, включая Клуб О'Брайен.",
                    "requirements": [
                        "Укажите id INTEGER PRIMARY KEY и обязательные title, priority, is_done.",
                        "Добавьте записи через параметризованный INSERT с плейсхолдерами ?.",
                        "Не собирайте SQL конкатенацией или f-строкой.",
                        "Зафиксируйте исходный набор через commit().",
                    ],
                    "hint": "База :memory: существует в течение жизни соединения. Для повторяющихся INSERT используйте executemany().",
                    "answer": {
                        "explanation": "Плейсхолдеры отделяют запрос от значений, поэтому апостроф остаётся частью заголовка. Таблица и строки существуют только в отдельном учебном соединении.",
                        "steps": [
                            "Создаём соединение и таблицу с четырьмя колонками.",
                            "Передаём значения отдельными кортежами в executemany().",
                            "Фиксируем исходные строки.",
                        ],
                        "code": """import sqlite3

conn = sqlite3.connect(':memory:')
conn.execute(
    'CREATE TABLE tasks ('
    'id INTEGER PRIMARY KEY, title TEXT NOT NULL, '
    'priority INTEGER NOT NULL, is_done INTEGER NOT NULL)'
)
rows = [
    ('Доклад', 2, 0),
    ("Клуб О'Брайен", 5, 0),
    ('Тест', 5, 1),
    ('Письмо', 5, 0),
]
conn.executemany(
    'INSERT INTO tasks (title, priority, is_done) VALUES (?, ?, ?)',
    rows,
)
conn.commit()""",
                    },
                    "checks": [
                        "Создана отдельная база в памяти и таблица tasks с первичным ключом.",
                        "Добавлены четыре строки, включая заголовок с апострофом.",
                        "INSERT использует плейсхолдеры, исходные строки зафиксированы.",
                    ],
                },
                {
                    "title": "2. Предскажите результат SELECT",
                    "task": "Выберите две незавершённые задачи по убыванию priority и возрастанию id при равном приоритете. Запросите также отсутствующий id 999.",
                    "requirements": [
                        "Используйте WHERE is_done = ? и параметры (0, 2).",
                        "Добавьте ORDER BY priority DESC, id ASC и LIMIT 2.",
                        "До чтения назовите порядок строк; отсутствующая запись через fetchone() должна дать None.",
                    ],
                    "hint": "Выполненная строка исключается; равный приоритет разрешает меньший id.",
                    "answer": {
                        "explanation": "Сначала вернётся строка 2, затем строка 4: у обеих priority 5; id 3 с тем же приоритетом исключён как выполненный. Запрос id 999 не находит запись.",
                        "steps": [
                            "Фильтруем незавершённые строки.",
                            "Сортируем сначала по убыванию приоритета, затем по возрастанию id.",
                            "Применяем LIMIT и отдельный поиск неизвестного id.",
                        ],
                        "code": """selected = conn.execute(
    'SELECT id, title, priority, is_done FROM tasks '
    'WHERE is_done = ? ORDER BY priority DESC, id ASC LIMIT ?',
    (0, 2),
).fetchall()
missing = conn.execute(
    'SELECT id FROM tasks WHERE id = ?',
    (999,),
).fetchone()
assert selected == [
    (2, "Клуб О'Брайен", 5, 0),
    (4, 'Письмо', 5, 0),
]
assert missing is None""",
                    },
                    "checks": [
                        "Выборка содержит сначала id 2, затем id 4.",
                        "Равный приоритет сортируется по возрастанию id.",
                        "Для id 999 fetchone() возвращает None.",
                    ],
                },
                {
                    "title": "3. Измените и удалите строки по id",
                    "task": "Поставьте задаче 1 priority 4, удалите задачу 2 и проверьте результат. Не запускайте UPDATE или DELETE без WHERE.",
                    "requirements": [
                        "Используйте параметры и WHERE id для обеих команд.",
                        "Проверьте, что у id 1 приоритет равен 4, а id 2 отсутствует.",
                        "Не вызывайте commit() до следующего шага.",
                    ],
                    "hint": "Без WHERE команда изменения или удаления затрагивает все строки таблицы.",
                    "answer": {
                        "explanation": "WHERE id ограничивает каждую команду конкретной строкой. Повторное чтение показывает изменение и удаление; пока они остаются незавершённой транзакцией.",
                        "steps": [
                            "Обновляем приоритет задачи 1 параметрами.",
                            "Удаляем задачу 2 по её id.",
                            "Проверяем обе строки запросами SELECT.",
                        ],
                        "code": """conn.execute(
    'UPDATE tasks SET priority = ? WHERE id = ?',
    (4, 1),
)
conn.execute('DELETE FROM tasks WHERE id = ?', (2,))
updated = conn.execute(
    'SELECT id, priority FROM tasks WHERE id = ?', (1,)
).fetchone()
deleted = conn.execute(
    'SELECT id FROM tasks WHERE id = ?', (2,)
).fetchone()
assert updated == (1, 4)
assert deleted is None""",
                    },
                    "checks": [
                        "Изменён только id 1, удалён только id 2.",
                        "Команды UPDATE и DELETE имеют WHERE и параметры.",
                        "Обе операции подтверждены чтением.",
                    ],
                },
                {
                    "title": "4. Зафиксируйте и отмените транзакцию",
                    "task": "Зафиксируйте изменение и удаление, временно измените приоритет задачи 1 на 75.1, прочитайте значение, отмените это обновление и проверьте приоритет 4. Затем закройте соединение.",
                    "requirements": [
                        "commit() фиксирует предыдущие UPDATE и DELETE.",
                        "В том же соединении до отката читается значение 99.",
                        "После rollback() приоритет снова равен 4.",
                        "В конце вызовите close().",
                    ],
                    "hint": "rollback() отменяет изменения после последнего commit(); база :memory: живёт только пока открыто соединение.",
                    "answer": {
                        "explanation": "commit() сохраняет завершённые изменение и удаление. Последующее обновление видно в том же соединении, а rollback() отменяет его и возвращает сохранённое значение 4. close() завершает соединение с базой в памяти.",
                        "steps": [
                            "Фиксируем предыдущие операции.",
                            "Обновляем задачу 1 до 75.1 и читаем временное значение.",
                            "Откатываем транзакцию, проверяем значение 4 и закрываем соединение.",
                        ],
                        "code": """conn.commit()
conn.execute(
    'UPDATE tasks SET priority = ? WHERE id = ?',
    (99, 1),
)
temporary = conn.execute(
    'SELECT priority FROM tasks WHERE id = ?', (1,)
).fetchone()
assert temporary == (99,)
conn.rollback()
saved = conn.execute(
    'SELECT priority FROM tasks WHERE id = ?', (1,)
).fetchone()
assert saved == (4,)
conn.close()""",
                    },
                    "checks": [
                        "Изменение и удаление зафиксированы до временного UPDATE.",
                        "Текущее соединение видит значение 99 до отката.",
                        "После rollback() значение возвращается к 4.",
                        "Соединение закрыто, файл базы проекта не создавался.",
                    ],
                },
            ],
            "result": (
                "Отдельная база в памяти хранит таблицу задач. Параметризованные "
                "INSERT и SELECT обрабатывают данные, включая апостроф; изменение и "
                "удаление ограничены id. commit() фиксирует их, rollback() отменяет "
                "последующее обновление, соединение закрывается."
            ),
        }
    ],
    67: [
        {
            "title": "Подготовить проверяемое подключение SQLite",
            "task": (
                "Закрепите SQLAlchemy 2.x в requirements.txt. Существующий StudyHub Planner получает DATABASE_URL и фабрику Engine для будущей базы. "
                "Проверка выполняется на отдельном SQLite-файле, а API и CLI продолжают использовать JSON. "
                "Пустая или неподдерживаемая настройка завершается понятной ошибкой."
            ),
            "tasks": [
                {
                    "title": "1. Дополните существующие Settings",
                    "task": (
                        "Settings сохраняет JSON_PATH, APP_NAME и COOKIE_SECURE и получает database_url. "
                        "Default указывает на файловую SQLite-базу от корня проекта, относительный адрес "
                        "разрешается от этого корня. Явно пустой, неверный или не-SQLite URL отклоняется."
                    ),
                    "requirements": [
                        "SQLAlchemy 2.x установлена в проектное окружение и закреплена в requirements.txt.",
                        "Процессное окружение сохраняет приоритет над .env; .env.example не содержит секретов.",
                        "DATABASE_URL не переключает API/CLI и не меняет JSON_PATH.",
                    ],
                    "hint": "Разберите URL средствами SQLAlchemy, проверьте backend и имя файла, затем нормализуйте относительный путь к project_root.",
                    "answer": {
                        "explanation": (
                            "Добавляем SQLAlchemy в requirements.txt и строим default как абсолютный путь от корня. "
                            "make_url разбирает заданный адрес, а URL.set сохраняет его параметры после привязки "
                            "относительного пути к project_root. Так мы не режем строку вручную по слешам."
                        ),
                        "steps": [
                            "Добавляем database_url после cookie_secure, сохраняя позиционный порядок прежних полей Settings.",
                            "Отсутствующее значение строим из data/planner.sqlite3 и project_root.",
                            "Проверяем, что make_url разбирает SQLite URL с файловой базой.",
                            "Явно пустой, ошибочный, in-memory или другой backend отклоняем с сообщением DATABASE_URL.",
                            "При загрузке .env оставляем прежний override=False.",
                        ],
                        "code": '''from dataclasses import dataclass, field
from pathlib import Path

from sqlalchemy import URL
from sqlalchemy.engine import make_url
from sqlalchemy.exc import ArgumentError


def default_database_url(project_root: Path) -> str:
    path = (project_root / "data" / "planner.sqlite3").resolve()
    return URL.create("sqlite", database=path.as_posix()).render_as_string(
        hide_password=False
    )


def normalize_database_url(raw: str | None, project_root: Path) -> str:
    if raw is None:
        return default_database_url(project_root)
    if not raw.strip():
        raise ValueError("DATABASE_URL must not be empty")

    try:
        url = make_url(raw.strip())
    except ArgumentError as error:
        raise ValueError("DATABASE_URL must be a valid SQLite URL") from error

    if url.get_backend_name() != "sqlite" or not url.database or url.database == ":memory:":
        raise ValueError("DATABASE_URL must point to a file-based SQLite database")

    path = Path(url.database)
    if not path.is_absolute():
        path = (project_root / path).resolve()
    return url.set(database=path.as_posix()).render_as_string(hide_password=False)


@dataclass
class Settings:
    json_path: Path
    app_name: str
    cookie_secure: bool = False
    database_url: str = field(
        default_factory=lambda: default_database_url(PROJECT_ROOT)
    )


# В load_settings передаём:
database_url = normalize_database_url(values.get("DATABASE_URL"), project_root)

# .env.example
# DATABASE_URL=sqlite:///data/planner.sqlite3''',
                        "checks": [
                            "Отсутствие переменной выбирает абсолютный путь от project_root; пустое и неподдерживаемое значение дают ошибку.",
                            "Процессная переменная выше .env; прежние настройки сохраняют смысл.",
                            "Обычная сборка по-прежнему создаёт JSON Planner.",
                        ],
                    },
                },
                {
                    "title": "2. Создайте фабрику Engine",
                    "task": (
                        "make_engine принимает готовый database_url и возвращает Engine. Импорт модуля "
                        "не открывает Connection и не выполняет SQL. Фабрика не читает окружение "
                        "и не подменяет неверный адрес другим файлом."
                    ),
                    "requirements": [
                        "Engine создаётся только при явном вызове фабрики.",
                        "echo выключен по умолчанию.",
                    ],
                    "hint": "Передайте адрес аргументом и проверьте, что в модуле нет вызова connect.",
                    "answer": {
                        "explanation": "create_engine создаёт Engine, но не открывает первое DB-API соединение. Соединение запрашивается отдельно при вызове connect.",
                        "steps": [
                            "Создаём app/DBase/engine.py.",
                            "Импортируем create_engine и тип Engine.",
                            "Принимаем URL и возвращаем результат create_engine.",
                        ],
                        "code": '''# app/DBase/engine.py
from sqlalchemy import create_engine
from sqlalchemy.engine import Engine


def make_engine(database_url: str) -> Engine:
    return create_engine(database_url)''',
                        "checks": [
                            "Импорт app.DBase.engine не создаёт SQLite-файл и не открывает соединение.",
                            "Фабрика использует переданный тестовый URL.",
                            "build_service и JSON-путь не вызывают make_engine.",
                        ],
                    },
                },
                {
                    "title": "3. Проверьте соединение и регрессию",
                    "task": (
                        "SELECT 1 возвращает значение 1 на отдельном SQLite-файле в tmp_path. Default остаётся "
                        "одинаковым после смены cwd. Проверки подтверждают, что API, CLI и build_service "
                        "продолжают использовать прежний JSON Planner."
                    ),
                    "requirements": [
                        "Connection находится внутри with; тест не создаёт таблицу tasks и не касается рабочего JSON.",
                        "Тестовый Engine освобождается после проверки.",
                    ],
                    "hint": "Выполните text('SELECT 1') через Connection, прочитайте scalar_one внутри with, затем вызовите dispose в finally.",
                    "answer": {
                        "explanation": (
                            "Временный файл изолирует SQL-проверку. Сравнение Settings до и после chdir "
                            "доказывает привязку default к корню проекта, а старые тесты подтверждают, "
                            "что новый Engine ещё не включён в рабочий путь Planner."
                        ),
                        "steps": [
                            "Создаём URL для базы внутри tmp_path.",
                            "Получаем Engine явным вызовом фабрики.",
                            "Внутри Connection выполняем text('SELECT 1') и проверяем scalar_one.",
                            "В finally освобождаем тестовый Engine.",
                            "С одним project_root сравниваем Settings до и после смены cwd.",
                        ],
                        "code": '''from sqlalchemy import URL, text


def test_engine_selects_one_on_temporary_file(tmp_path):
    database_path = tmp_path / "probe.sqlite3"
    url = URL.create(
        "sqlite",
        database=database_path.as_posix(),
    ).render_as_string(hide_password=False)
    engine = make_engine(url)

    try:
        with engine.connect() as connection:
            result = connection.execute(text("SELECT 1"))
            assert result.scalar_one() == 1
    finally:
        engine.dispose()


def test_default_url_uses_project_root(tmp_path, monkeypatch):
    project_root = tmp_path / "project"
    other_cwd = tmp_path / "elsewhere"
    other_cwd.mkdir()

    first = load_settings(environ={}, project_root=project_root)
    monkeypatch.chdir(other_cwd)
    second = load_settings(environ={}, project_root=project_root)

    assert first.database_url == second.database_url


# Регрессия исходного StudyHub:
# pytest tests/test_config.py tests/test_api.py tests/test_cli.py tests/test_workflow.py''',
                        "checks": [
                            "Запрос возвращает 1; with завершает Connection, dispose завершает тестовый Engine.",
                            "Default URL не меняется при смене cwd и отличается от тестового URL.",
                            "API и CLI проходят на отдельном JSON-файле; рабочие данные не меняются.",
                            "Smoke check не создаёт таблицу tasks.",
                        ],
                    },
                },
            ],
            "result": (
                "Settings хранит воспроизводимый SQLite URL, а Engine соединяется только по запросу. "
                "SELECT 1 проверен на временном файле; API и CLI остаются на одном JSON Planner. "
                "ORM, таблиц и Session ещё нет."
            ),
        }
    ],
    68: [
        {
            "title": "Session: первая сохранённая запись",
            "task": "В изолированной SQLite-базе одна задача TaskRow сохраняется и читается после завершения первой Session. Практика использует подготовленные Engine, модель и таблицу, не меняет JSON-путь API и CLI.",
            "tasks": [
                {
                    "title": "Создать фабрику Session",
                    "task": "Модуль app/DBase/session.py принимает Engine и возвращает настроенную на него фабрику. Он не создаёт глобальный экземпляр Session и не создаёт таблицы при импорте или открытии сессии.",
                    "requirements": [
                        "Фабрика использует sessionmaker, связанный с переданным Engine.",
                        "Создание таблицы остаётся явным действием тестовой подготовки через Base.metadata.create_all(engine).",
                    ],
                    "hint": "Сохраняем вызываемую фабрику на всё время приложения, а результат её вызова используем в одном with.",
                    "answer": {
                        "explanation": "sessionmaker связывает повторно используемую фабрику с переданным Engine. Каждый вызов фабрики создаёт отдельную Session. Модуль не открывает соединение и не меняет схему.",
                        "steps": [
                            "Импортируем тип Engine и фабрику sessionmaker.",
                            "Принимаем Engine аргументом, а не ищем настройки внутри модуля.",
                            "Возвращаем sessionmaker с bind на этот Engine.",
                        ],
                        "code": """from sqlalchemy.engine import Engine
from sqlalchemy.orm import sessionmaker


def create_session_factory(engine: Engine) -> sessionmaker:
    return sessionmaker(bind=engine)
""",
                        "checks": [
                            "Две последовательные операции могут вызвать фабрику и получить разные экземпляры Session.",
                            "При создании фабрики таблица не появляется без явного вызова create_all.",
                        ],
                    },
                },
                {
                    "title": "Сохранить TaskRow и перечитать в новой Session",
                    "task": "Тестовая база находится во временном каталоге, а исходная таблица создаётся в подготовке теста. Успешная операция отправляет INSERT, подтверждает commit и после закрытия первой Session читает все поля новой Session.",
                    "requirements": [
                        "После add ключ не используется как доказательство записи; после flush сохраняется выданный id, а после commit вызывается refresh.",
                        "Новая Session сверяет id, title, priority, is_done, tags и title_normalized.",
                        "Две строки с default-списком tags получают независимые значения; проверка мутации остаётся только в памяти.",
                    ],
                    "hint": "Сохраняем id в отдельную переменную до выхода из первой области, а затем вызываем get через новый экземпляр Session.",
                    "answer": {
                        "explanation": "Временный Engine не затрагивает рабочую базу. Fixture явно создаёт исходную схему и освобождает Engine после теста. В основной проверке add регистрирует объект, flush отправляет INSERT и возвращает ключ, commit подтверждает транзакцию, а refresh перечитывает объект в прежней Session. Новое чтение выполняется после закрытия этой области отдельной Session. Второй тест проверяет, что default tags создаёт независимые списки для строк.",
                        "steps": [
                            "Создаём Engine из tmp_path и явно вызываем Base.metadata.create_all в fixture.",
                            "Проверяем состояние id до add, после add и после flush.",
                            "Фиксируем транзакцию, вызываем refresh и сверяем поля в текущей области.",
                            "Закрываем первую Session и загружаем TaskRow по id в новой.",
                            "Сохраняем две строки без явного tags, читаем их отдельно и сравниваем списки без commit локальной мутации.",
                        ],
                        "code": """import pytest
from sqlalchemy import create_engine

from app.DBase.models import Base, TaskRow
from app.DBase.session import create_session_factory


@pytest.fixture
def session_factory(tmp_path):
    database_file = tmp_path / "session.db"
    engine = create_engine(f"sqlite:///{database_file.as_posix()}")
    Base.metadata.create_all(engine)
    try:
        yield create_session_factory(engine)
    finally:
        engine.dispose()


def test_taskrow_survives_an_independent_session(session_factory):
    row = TaskRow(
        title="Записать первую задачу",
        priority=2,
        is_done=False,
        tags=["session"],
        title_normalized="записать первую задачу",
    )

    with session_factory() as session:
        assert row.id is None
        session.add(row)
        assert row.id is None
        session.flush()
        task_id = row.id
        assert isinstance(task_id, int)

        session.commit()
        session.refresh(row)
        assert row.id == task_id
        assert row.title == "Записать первую задачу"
        assert row.priority == 2
        assert row.is_done is False
        assert row.tags == ["session"]
        assert row.title_normalized == "записать первую задачу"

    with session_factory() as session:
        saved = session.get(TaskRow, task_id)
        assert saved is not None
        assert saved.id == task_id
        assert saved.title == "Записать первую задачу"
        assert saved.priority == 2
        assert saved.is_done is False
        assert saved.tags == ["session"]
        assert saved.title_normalized == "записать первую задачу"


def test_default_tags_are_independent(session_factory):
    first = TaskRow(
        title="Первая заметка",
        priority=2,
        is_done=False,
        title_normalized="первая заметка",
    )
    second = TaskRow(
        title="Вторая заметка",
        priority=2,
        is_done=False,
        title_normalized="вторая заметка",
    )

    with session_factory() as session:
        session.add_all([first, second])
        session.flush()
        first_id = first.id
        second_id = second.id
        session.commit()

    with session_factory() as session:
        saved_first = session.get(TaskRow, first_id)
        saved_second = session.get(TaskRow, second_id)
        assert saved_first is not None
        assert saved_second is not None
        assert saved_first.tags == []
        assert saved_second.tags == []
        assert saved_first.tags is not saved_second.tags

        saved_first.tags.append("только в памяти первой строки")
        assert saved_second.tags == []
""",
                        "checks": [
                            "Первая запись доступна новой Session после закрытия первой.",
                            "Во второй строке сохранился пустой default tags.",
                            "Локальное изменение списка первой строки не меняет список второй и не фиксируется в базе.",
                        ],
                    },
                },
            ],
            "result": "Фабрика связана с переданным Engine; две изолированные проверки подтверждают успешную запись, независимое чтение и отдельные списки tags. Рабочие API, CLI и JSON остаются прежними.",
        }
    ],
    69: [
        {
            "title": "Переведите чтение PlannerService на JSON-репозиторий",
            "task": (
                "Сохраните один JsonStorage и прежний JSON-файл, добавив предметные "
                "операции чтения. Сервис должен получать список, задачу, выборку, "
                "поиск и статистику через JsonTaskRepository. Изменяющие методы "
                "пока продолжают работать прежним путём через тот же JsonStorage. "
                "Результаты API и CLI не меняются."
            ),
            "tasks": [
                {
                    "title": "1. Зафиксируйте исходный договор сервиса",
                    "task": (
                        "Перед изменением кода сопоставьте пять читающих методов "
                        "PlannerService с их текущими вызовами load() и отметьте, "
                        "какие изменяющие методы сохраняют список через save(). "
                        "Запишите наблюдаемые результаты, которые должны сохраниться."
                    ),
                    "requirements": [
                        "Проверены list_tasks(), get_task(), select_tasks(), search_tasks() и get_statistics().",
                        "Отдельно отмечены add_task(), replace_task(), patch_task(), mark_done() и delete_task(); их путь записи в этом занятии не переносится.",
                        "Зафиксированы порядок по id, фильтр is_done, sort_desc, limit, буквальный поиск после strip().lower() и ключи all/open/done.",
                        "Отсутствующий id остаётся TaskNotFoundError на уровне сервиса; проверка типа и допустимости id также остаётся в сервисе."
                    ],
                    "hint": (
                        "Сначала проследите источник списка каждого результата. "
                        "Для get отдельно отметьте два случая: id некорректен и "
                        "валидная задача не найдена."
                    ),
                    "answer": {
                        "explanation": (
                            "Сейчас читающие методы получают полный список через "
                            "JsonStorage.load(). Выборка фильтрует и сортирует его, "
                            "поиск нормализует строку запроса, статистика считает "
                            "три показателя. Изменяющие методы тоже загружают список, "
                            "а успешное изменение сохраняют через save()."
                        ),
                        "steps": [
                            "list_tasks() возвращает свежий список из storage.load().",
                            "get_task() загружает список и передаёт поиск и проверку id в _find_task().",
                            "select_tasks() начинает с list_tasks(), затем применяет is_done, сортировку по id и limit.",
                            "search_tasks() убирает пробелы по краям, переводит запрос в нижний регистр и ищет буквальную подстроку в title.",
                            "get_statistics() возвращает all, open и done по загруженным задачам.",
                            "add_task(), replace_task(), patch_task(), mark_done() и delete_task() продолжают использовать прежний load/save-путь до перехода чтения на SQL."
                        ],
                        "code": "чтение: load() -> list/get/select/search/statistics -> результат\nизменение: load() -> прежнее правило PlannerService -> save()",
                        "checks": [
                            "Все пять читающих сценариев названы отдельно.",
                            "Сценарии изменения не объявлены переведёнными в репозиторий.",
                            "В HTTP-слой не переносятся поиск id, фильтрация или правила хранения."
                        ]
                    }
                },
                {
                    "title": "2. Добавьте JsonTaskRepository поверх переданного storage",
                    "task": (
                        "В app/storage.py создайте адаптер с операциями list(), get(), "
                        "select(), search() и statistics(). Каждый вызов читает "
                        "актуальный список у переданного JsonStorage или MemoryStorage; "
                        "репозиторий не хранит загруженный снимок."
                    ),
                    "requirements": [
                        "Конструктор сохраняет тот же объект storage и не вызывает load() до запроса.",
                        "get(id) возвращает Task или None, не валидирует HTTP-параметры и не создаёт TaskNotFoundError.",
                        "select() сохраняет фильтр, порядок по id, направление сортировки и прежнее применение limit.",
                        "search() сохраняет strip(), lower() и буквальное вхождение в title; пустой запрос даёт пустой список.",
                        "statistics() сохраняет ровно ключи all, open и done.",
                        "Репозиторий не выполняет запись, не открывает SQL и не вводит кеш."
                    ],
                    "hint": (
                        "Переиспользуйте load() внутри операций чтения. Удобнее "
                        "сначала получить свежий список, затем выполнить над ним "
                        "один предметный запрос."
                    ),
                    "answer": {
                        "explanation": (
                            "JsonTaskRepository меняет форму доступа к тем же данным, "
                            "но пока не меняет само хранилище. Свежий load() на каждый "
                            "вызов позволяет увидеть изменения, выполненные старым "
                            "путём записи."
                        ),
                        "steps": [
                            "Сохраните переданный объект в self.storage.",
                            "list() возвращает self.storage.load(), а get() ищет id в новом результате и возвращает None при отсутствии.",
                            "В select() примените is_done, затем сортировку по id с sort_desc и после неё срез limit, как это делает прежний сервис.",
                            "В search() нормализуйте query через strip().lower(); при пустой строке сразу верните [].",
                            "В statistics() вычислите done, total и open по свежему списку и верните прежний словарь."
                        ],
                        "code": '''class JsonTaskRepository:
    def __init__(self, storage):
        self.storage = storage

    def list(self):
        return self.storage.load()

    def get(self, task_id):
        return next(
            (task for task in self.storage.load() if task.id == task_id),
            None,
        )

    def select(self, is_done=None, sort_desc=False, limit=None):
        tasks = self.storage.load()
        if is_done is not None:
            tasks = [task for task in tasks if task.is_done == is_done]
        tasks = sorted(tasks, key=lambda task: task.id, reverse=sort_desc)
        if limit is not None:
            tasks = tasks[:limit]
        return tasks

    def search(self, query):
        query = query.strip().lower()
        if not query:
            return []
        return [
            task for task in self.storage.load()
            if query in task.title.lower()
        ]

    def statistics(self):
        tasks = self.storage.load()
        done = sum(task.is_done for task in tasks)
        total = len(tasks)
        return {"all": total, "open": total - done, "done": done}''',
                        "checks": [
                            "Методы возвращают существующие Task и списки Task, а не ORM-строки или HTTP-ответы.",
                            "В __init__ нет load(); каждое чтение обращается к актуальному storage.",
                            "Ни один метод репозитория не вызывает save()."
                        ]
                    }
                },
                {
                    "title": "3. Переведите читающие методы сервиса",
                    "task": (
                        "Свяжите PlannerService с JsonTaskRepository, созданным "
                        "поверх переданного storage. Переведите на него только пять "
                        "читающих методов; старый путь изменений и существующие "
                        "предметные ошибки сохраните."
                    ),
                    "requirements": [
                        "PlannerService сохраняет storage для прежних изменяющих методов и создаёт один repository с этим же объектом.",
                        "list_tasks(), select_tasks(), search_tasks() и get_statistics() делегируют соответствующие чтения репозиторию.",
                        "get_task() проверяет тип и допустимость id до repository.get(), затем преобразует None в прежний TaskNotFoundError.",
                        "_find_task() остаётся доступен изменяющим методам, которые пока загружают список напрямую.",
                        "API, CLI, модели Task и сборка рабочего JSON не требуют смены интерфейса."
                    ],
                    "hint": (
                        "Оставьте публичные имена методов сервиса прежними. "
                        "Repository сообщает, есть ли запись; решение о некорректном "
                        "id и предметной ошибке принимает PlannerService."
                    ),
                    "answer": {
                        "explanation": (
                            "Сервис остаётся фасадом для API и CLI и сохраняет "
                            "предметные правила. Репозиторий выполняет чтение. "
                            "На время перехода self.storage нужен старым методам "
                            "изменения, поэтому оба объекта должны ссылаться на "
                            "один переданный storage."
                        ),
                        "steps": [
                            "Импортируйте JsonTaskRepository в app/services.py и в __init__ сохраните storage и создайте JsonTaskRepository(storage).",
                            "Направьте list_tasks, select_tasks, search_tasks и get_statistics на repository.list, repository.select, repository.search и repository.statistics.",
                            "Вынесите существующую проверку типа id и вызов validate_task_id() в общий helper сервиса, чтобы get_task() и _find_task() пользовались одинаковым правилом.",
                            "В get_task() получите валидированный id, вызовите repository.get(), а при None поднимите TaskNotFoundError с прежним сообщением.",
                            "Оставьте add_task, replace_task, patch_task, mark_done и delete_task на прежнем self.storage.load()/save() пути."
                        ],
                        "code": '''def __init__(self, storage):
    self.storage = storage
    self.repository = JsonTaskRepository(storage)

def _validate_task_id(self, task_id):
    if type(task_id) is not int:
        raise ValueError("Номер задачи должен быть целым числом")
    return validate_task_id(task_id)

def _find_task(self, tasks, task_id):
    task_id = self._validate_task_id(task_id)
    for task in tasks:
        if task.id == task_id:
            return task
    raise TaskNotFoundError(f"Задача с номером {task_id} не найдена")

def list_tasks(self):
    return self.repository.list()

def select_tasks(self, is_done=None, sort_desc=False, limit=None):
    return self.repository.select(is_done, sort_desc, limit)

def get_task(self, task_id):
    task_id = self._validate_task_id(task_id)
    task = self.repository.get(task_id)
    if task is None:
        raise TaskNotFoundError(f"Задача с номером {task_id} не найдена")
    return task

def search_tasks(self, query):
    return self.repository.search(query)

def get_statistics(self):
    return self.repository.statistics()''',
                        "checks": [
                            "Невалидный id не доходит до репозитория.",
                            "Для валидного отсутствующего id сервис поднимает TaskNotFoundError.",
                            "Изменяющие методы по-прежнему используют прежний JSON-код и тот же storage.",
                            "В публичных методах не изменились имена, параметры и возвращаемые результаты."
                        ]
                    }
                },
                {
                    "title": "4. Докажите общий источник и свежесть чтения",
                    "task": (
                        "Проверьте переход на MemoryStorage: сначала выполните "
                        "старое изменение через PlannerService, затем измените "
                        "состояние через storage.save() и снова прочитайте его "
                        "сервисом. Оба изменения должны сразу быть видны адаптеру."
                    ),
                    "requirements": [
                        "PlannerService и JsonTaskRepository используют один объект MemoryStorage.",
                        "Созданная через прежний add_task() задача находится новым get_task().",
                        "Новый вызов чтения после save() видит обновлённый список и не возвращает закешированный снимок.",
                        "Тест не открывает рабочий JSON и не создаёт второй источник данных."
                    ],
                    "hint": (
                        "Проверьте идентичность ссылки repository.storage is storage. "
                        "Затем выполните запись через сервис и отдельный save() "
                        "через ту же фикстуру."
                    ),
                    "answer": {
                        "explanation": (
                            "Адаптер оборачивает уже переданное хранилище. Старый "
                            "add_task() сохраняет задачу через него, а последующий "
                            "repository.get() снова загружает список. Внешний save() "
                            "проверяет тот же инвариант без второго Planner или файла."
                        ),
                        "steps": [
                            "Создайте MemoryStorage с одной задачей и передайте его в PlannerService.",
                            "Убедитесь, что planner.repository.storage is storage.",
                            "Добавьте задачу прежним planner.add_task() и найдите её через planner.get_task().",
                            "Вызовите storage.save() с новым списком, затем снова вызовите planner.list_tasks() и planner.get_task().",
                            "Сравните id, title, tags и число элементов с последним сохранённым состоянием."
                        ],
                        "code": '''storage = MemoryStorage([
    Task(id=1, title="План", priority=1, is_done=False, tags=["python"])
])
planner = PlannerService(storage)

assert planner.repository.storage is storage

created = planner.add_task("Новая задача", priority=2, tags=["api"])
assert planner.get_task(created.id).tags == ["api"]

storage.save([
    Task(id=9, title="Внешнее изменение", priority=1, is_done=True, tags=["check"])
])
assert [task.id for task in planner.list_tasks()] == [9]
assert planner.get_task(9).title == "Внешнее изменение"''',
                        "checks": [
                            "У сервиса и репозитория одна ссылка на storage.",
                            "Существующий путь записи и новый путь чтения видят одну задачу.",
                            "После внешнего save() следующий вызов видит новые данные.",
                            "Создание адаптера само по себе не загружает и не сохраняет данные."
                        ]
                    }
                },
                {
                    "title": "5. Сверьте прежние результаты и интерфейсы",
                    "task": (
                        "На изолированных данных сравните чтение до и после "
                        "переработки и выполните точечную регрессию API, CLI и "
                        "preferences. Подтвердите, что менялся только внутренний "
                        "путь чтения."
                    ),
                    "requirements": [
                        "Проверены список, существующий и отсутствующий id, фильтр, направление сортировки, limit, поиск и статистика.",
                        "Порядок списка и результатов поиска сохраняет прежний смысл; поиск остаётся буквальным и нечувствительным к регистру.",
                        "Точечная регрессия подтверждает JSON API, прежние CLI-команды и preferences.",
                        "Изменяющие сценарии продолжают записывать тот же JSON; SQL backend и переключение штатного провайдера не добавлены."
                    ],
                    "hint": (
                        "Возьмите три задачи с разными id, статусами и названиями. "
                        "Сравните фактические значения и ответы существующих "
                        "проверок, не переписывая их под новый интерфейс."
                    ),
                    "answer": {
                        "explanation": (
                            "Репозиторий сохраняет алгоритмы старого сервиса, а "
                            "PlannerService сохраняет его публичный контракт. Поэтому "
                            "проверки сравнивают предметные результаты и существующие "
                            "интерфейсы; они не требуют подключения SQL или переноса "
                            "записей."
                        ),
                        "steps": [
                            "Подготовьте задачи id=1 open с title='Study SQL', id=2 done с title='Read API' и id=3 open с title='Python API'.",
                            "Проверьте list_tasks() в порядке id, get_task(2), select_tasks(is_done=False, sort_desc=True, limit=1), search_tasks(' api ') и get_statistics().",
                            "Убедитесь, что результаты выборки равны [3], поиска равны [2, 3], а статистика равна {'all': 3, 'open': 2, 'done': 1}.",
                            "Проверьте get_task(99): сервис сообщает TaskNotFoundError; некорректный id отклоняется проверкой сервиса.",
                            "Запустите существующие целевые проверки API, CLI и preferences; убедитесь, что add/update/delete всё ещё пользуются одним JSON storage."
                        ],
                        "code": '''assert [task.id for task in planner.list_tasks()] == [1, 2, 3]
assert planner.get_task(2).title == "Read API"
assert [
    task.id for task in planner.select_tasks(
        is_done=False, sort_desc=True, limit=1
    )
] == [3]
assert [task.id for task in planner.search_tasks(" api ")] == [2, 3]
assert planner.get_statistics() == {
    "all": 3,
    "open": 2,
    "done": 1,
}

with pytest.raises(TaskNotFoundError):
    planner.get_task(99)''',
                        "checks": [
                            "Все результаты совпадают с прежними параметрами и порядком.",
                            "Отсутствие записи отличается от некорректного id.",
                            "API, CLI и preferences работают без изменения своего договора.",
                            "Единственным новым путём становится чтение через JsonTaskRepository."
                        ]
                    }
                }
            ],
            "result": (
                "Пять читающих операций PlannerService проходят через JsonTaskRepository "
                "поверх единственного прежнего JsonStorage. Результаты API и CLI "
                "сохранены, чтение видит изменения старого пути записи, а изменяющие "
                "операции остаются на том же JSON до перехода чтения на SQL."
            )
        }
    ],
    "69.1": [{
        "title": "Завершите переход PlannerService на JSON-репозиторий",
        "task": "Рабочая копия после настройки JSON-адаптера читает список, задачу, выборку, поиск и статистику через JsonTaskRepository, а изменения ещё используют тот же JsonStorage. После перехода все сценарии PlannerService используют один репозиторий и один JSON-файл, сохраняя прежние API и CLI.",
        "tasks": [
            {
                "title": "1. Добавьте операции записи в тот же адаптер",
                "task": "JsonTaskRepository выполняет create, replace, update и delete поверх переданного JsonStorage. Создание возвращает Task с очередным положительным JSON-id, а изменение или удаление касается только выбранной записи.",
                "requirements": [
                    "Используется прежний экземпляр JsonStorage и его путь к файлу.",
                    "При отсутствии id репозиторий возвращает отсутствие результата, не формирует HTTP-ошибку."
                ],
                "hint": "Сначала загрузите актуальный снимок, найдите индекс по id, затем меняйте только эту позицию. Проверку состояния Task оставьте модели и сервису.",
                "answer": {
                    "explanation": "Адаптер владеет механикой снимка, но не правилами API. Для замены и обновления сервис передаёт уже проверенную Task; методы выражают намерение вызывающего сценария, хотя файловая запись в обоих случаях обновляет один элемент списка. Если элемента нет, адаптер ничего не сохраняет.",
                    "steps": [
                        "Сохраните переданный JsonStorage в JsonTaskRepository, не создавая новый путь или второй список состояния.",
                        "Для create загрузите актуальные задачи, выберите max(id) + 1 с default=0, создайте Task через существующую модель, добавьте её в список и сохраните снимок.",
                        "Для replace и update найдите позицию задачи, замените только её переданным проверенным объектом, сохраните и верните его.",
                        "Для replace и update при отсутствии id возвращайте None; для delete возвращайте False и ничего не сохраняйте."
                    ],
                    "code": '''class JsonTaskRepository:
    def __init__(self, storage):
        self.storage = storage

    @staticmethod
    def _index(tasks, task_id):
        return next(
            (index for index, task in enumerate(tasks) if task.id == task_id),
            None,
        )

    def create(self, title, priority, tags=None):
        tasks = self.storage.load()
        task = Task(
            id=max((item.id for item in tasks), default=0) + 1,
            title=title,
            priority=priority,
            is_done=False,
            tags=list(tags) if tags is not None else [],
        )
        tasks.append(task)
        self.storage.save(tasks)
        return task

    def _write_one(self, task_id, task):
        tasks = self.storage.load()
        index = self._index(tasks, task_id)
        if index is None:
            return None
        tasks[index] = task
        self.storage.save(tasks)
        return task

    def replace(self, task_id, task):
        return self._write_one(task_id, task)

    def update(self, task_id, task):
        return self._write_one(task_id, task)

    def delete(self, task_id):
        tasks = self.storage.load()
        index = self._index(tasks, task_id)
        if index is None:
            return False
        del tasks[index]
        self.storage.save(tasks)
        return True''',
                    "checks": [
                        "Создание на пустом списке выдаёт id=1, а при пропуске использует максимум существующих id плюс один.",
                        "Замена и удаление сохраняют порядок и значения соседних задач.",
                        "Неизвестный id не меняет снимок и не вызывает save."
                    ]
                }
            },
            {
                "title": "2. Переведите существующие сценарии сервиса",
                "task": "PlannerService получает один JsonTaskRepository и больше не вызывает load или save напрямую. Его методы add_task, replace_task, patch_task, mark_done и delete_task сохраняют свои результаты, ошибки и предметные правила.",
                "requirements": [
                    "PUT сохраняет id и внутренние tags, а PATCH применяет явное False и сохраняет остальные поля.",
                    "Пустой PATCH и повторный done не записывают новый снимок."
                ],
                "hint": "Сервис сначала получает текущую Task через существующий read-договор, затем применяет привычную проверку модели и передаёт завершённое состояние операции репозитория.",
                "answer": {
                    "explanation": "У сервиса остаётся знакомый сценарий. Для PUT он переносит публичные значения в новую Task, но берёт id и tags у найденной записи. Для PATCH он меняет только непустые переданные поля. Репозиторий получает конечный валидный объект и сохраняет его.",
                    "steps": [
                        "В сборке создайте один JsonStorage, оберните его одним JsonTaskRepository и передайте репозиторий в PlannerService.",
                        "Направьте add_task в repository.create и верните созданную Task.",
                        "В replace_task получите текущую Task, создайте замену с тем же id и копией tags, затем вызовите repository.replace.",
                        "В patch_task верните текущую Task без записи, когда все поля отсутствуют или равны None; иначе соберите новый объект, проверяя is_done через is None, и вызовите repository.update.",
                        "В mark_done сохраните ранний возврат для уже завершённой задачи; успешный переход передайте через update.",
                        "В delete_task преобразуйте False от repository.delete в прежний TaskNotFoundError, а при успехе верните None."
                    ],
                    "code": '''def add_task(self, title, priority, tags=None):
    return self.repository.create(title, priority, tags)

def patch_task(self, task_id, *, title=None, priority=None, is_done=None):
    current = self.get_task(task_id)
    if title is None and priority is None and is_done is None:
        return current

    updated = Task(
        id=current.id,
        title=current.title if title is None else title,
        priority=current.priority if priority is None else priority,
        is_done=current.is_done if is_done is None else is_done,
        tags=current.tags.copy(),
    )
    saved = self.repository.update(task_id, updated)
    if saved is None:
        raise TaskNotFoundError(f"Задача с номером {task_id} не найдена")
    return saved''',
                    "checks": [
                        "API и CLI по-прежнему вызывают те же имена методов PlannerService.",
                        "В сервисе отсутствуют прямые storage.load() и storage.save().",
                        "Task и прежний сервисный слой остаются единственными местами предметной проверки."
                    ]
                }
            },
            {
                "title": "3. Сохраните результат и границы отказа",
                "task": "Регрессионные проверки подтверждают, что корректная операция сохраняет один новый снимок, а неверное состояние, неизвестный id и no-op оставляют JSON без изменений. Чтение после записи возвращает те же id, tags, порядок и соседние задачи.",
                "requirements": [
                    "Тесты используют прежние fixtures с отдельным JSON или MemoryStorage.",
                    "Проверки числа save перенесены к адаптеру без требования сохранить старое поле storage у сервиса."
                ],
                "hint": "Сравнивайте сериализованные Task до и после отказа, а число записей наблюдайте на переданном JsonStorage. Для PATCH отдельно проверьте False и None.",
                "answer": {
                    "explanation": "Проверка должна видеть предметный результат и отсутствие побочного сохранения. Наблюдатель теперь оборачивает storage, который передан репозиторию. Невалидная Task возникает до вызова операции записи, а пустое действие заканчивается до save.",
                    "steps": [
                        "Подготовьте три задачи с разными id и tags, сохраните их через изолированное хранилище и обнулите счётчик save.",
                        "Замените или обновите среднюю задачу; сравните её поля и убедитесь, что первая и третья задачи сохранили порядок и данные.",
                        "Выполните PATCH с is_done=False и отдельно вызов с пустыми или None-полями.",
                        "Проверьте невалидный заголовок, неизвестный id и повторный done; в каждом случае сравните снимок до и после и счётчик сохранений."
                    ],
                    "code": '''observed_storage.inner.save([
    Task(1, "First", 2, is_done=False, tags=["left"]),
    Task(2, "Second", 3, is_done=True, tags=["study", "keep"]),
    Task(3, "Third", 4, is_done=False, tags=["right"]),
])
observed_storage.save_calls = 0
repository = JsonTaskRepository(observed_storage)
planner_service = PlannerService(repository)

before = [item.to_dict() for item in observed_storage.inner.load()]
with pytest.raises(ValueError):
    planner_service.replace_task(2, title="   ", priority=2, is_done=False)

after = [item.to_dict() for item in observed_storage.inner.load()]
assert after == before
assert observed_storage.save_calls == 0

updated = planner_service.patch_task(2, is_done=False)
assert updated.is_done is False
assert updated.tags == ["study", "keep"]
after_patch = observed_storage.inner.load()
assert [item.id for item in after_patch] == [1, 2, 3]
assert after_patch[0].to_dict() == before[0]
assert after_patch[2].to_dict() == before[2]
assert observed_storage.save_calls == 1

observed_storage.save_calls = 0
assert planner_service.patch_task(2) == updated
assert observed_storage.save_calls == 0
planner_service.mark_done(2)
assert observed_storage.save_calls == 1
planner_service.mark_done(2)
assert observed_storage.save_calls == 1

observed_storage.save_calls = 0
with pytest.raises(TaskNotFoundError):
    planner_service.delete_task(99)
assert observed_storage.save_calls == 0''',
                    "checks": [
                        "При успешной записи соседние записи, id и tags совпадают с исходными.",
                        "False применено, а отсутствующий параметр и None сохраняют прежнее состояние.",
                        "Невалидная операция, неизвестный id, пустой PATCH и повторный done не вызывают сохранение."
                    ]
                }
            },
            {
                "title": "4. Проверьте один путь через API и CLI",
                "task": "На одном тестовом JSON API создаёт задачу, CLI показывает или меняет её, а следующий API-запрос читает то же состояние. Существующие Task API, stats и preferences продолжают работать без SQL-переключения.",
                "requirements": [
                    "TestClient и CLI используют сервис, собранный с одним временным JSON.",
                    "В тестах не читается и не изменяется рабочий файл tasks.json."
                ],
                "hint": "Сначала создайте задачу HTTP-запросом и сохраните возвращённый id. Затем передайте этот id в команду CLI done и повторно запросите ту же задачу через API.",
                "answer": {
                    "explanation": "Сквозной сценарий отличает общий Planner от двух похожих, но независимых копий. API и CLI получают один сервис, а сервис и репозиторий используют один объект JsonStorage с временным путём.",
                    "steps": [
                        "Создайте api_service через существующий build_service и tmp_path; TestClient должен получать именно этот сервис через прежнюю fixture.",
                        "Отправьте POST /tasks и сохраните id из ответа.",
                        "Передайте CLI команды done, id и exit в run, собирая вывод в список.",
                        "Выполните GET задачи по сохранённому id и проверьте is_done=True; отдельно сравните /stats и результат preferences с прежним договором."
                    ],
                    "code": '''response = api_client.post(
    "/tasks",
    json={"title": "Проверить репозиторий", "priority": 3},
)
task_id = response.json()["id"]

commands = iter(["done", str(task_id), "exit"])
cli_output = []
run(
    api_service,
    read=lambda _prompt: next(commands),
    write=cli_output.append,
)

saved = api_client.get(f"/tasks/{task_id}")
assert saved.json()["is_done"] is True
assert any("выполнена" in line for line in cli_output)''',
                    "checks": [
                        "API получает созданную через JSON задачу с прежним HTTP-статусом и полями.",
                        "CLI завершает ту же задачу, а API после команды возвращает is_done=True.",
                        "Тестовый JSON изолирован, а SQL и новый штатный backend не подключены."
                    ]
                }
            }
        ],
        "result": "Все публичные операции PlannerService проходят через один JsonTaskRepository поверх прежнего JsonStorage. Один JSON-файл, id, tags, API, CLI и предметный договор сохранены; прямых load/save в сервисе нет, SQL-запись ещё не реализована."
    }],
    "70.2": [
        {
            "title": "Перенесите проверенную копию JSON в изолированную SQLite",
            "task": (
                "После подготовки шагов 66–70.1 проект сохраняет обычную работу Planner через JSON, а исходная SQLite-схема и TaskRow уже существуют. "
                "Отдельная команда app/DBase/import_tasks.py получает явно выбранные источник и цель, проверяет все данные до первой записи и переносит их одной транзакцией. "
                "Новая Session подтверждает каждое значение, а ошибочный запуск не меняет цель или исходный файл."
            ),
            "tasks": [
                {
                    "title": "Проверьте снимок и перенесите его одной транзакцией",
                    "task": (
                        "Функция чтения принимает явный Path и возвращает подготовленные TaskRow только после проверки всего JSON-снимка. "
                        "CLI принимает source и target, отказывается от непустой цели и не меняет API, обычный CLI или рабочий JSON."
                    ),
                    "requirements": [
                        "Ошибки чтения, неверный корень, плохая запись, повторный id и ненормализованные title/tags останавливают импорт до SQL-записи.",
                        "Сохраняются id, title, priority, is_done и tags; старый формат без tags получает пустой список, title_normalized вычисляется Python lower().",
                        "Пустая цель получает весь набор одним commit; при любой ошибке записи выполняется rollback и не остаётся частичных строк.",
                    ],
                    "hint": "Сначала подготовьте весь список TaskRow без Session. Только затем откройте ресурс целевой базы, проверьте пустоту и добавьте пакет.",
                    "answer": {
                        "explanation": (
                            "Проверка входа и SQL-запись идут отдельными фазами. Поэтому ошибка поздней записи JSON обнаруживается до изменения цели. "
                            "Одна Session объединяет проверку пустой таблицы и вставку, а один commit подтверждает весь пакет."
                        ),
                        "steps": [
                            "Читаем UTF-8 файл явно и проверяем, что разобранный JSON имеет корень-список.",
                            "Передаём каждую запись Task.from_dict, проверяем исходную нормализацию и уникальность id.",
                            "Создаём ORM-строки из всех исходных полей и только после полного успеха выбираем целевую базу.",
                            "В одной Session проверяем пустую таблицу, добавляем все строки и подтверждаем их один раз.",
                            "Если база отклоняет пакет, откатываем транзакцию и передаём ошибку вызывающему коду.",
                        ],
                        "code": """import argparse
import json
from pathlib import Path

from sqlalchemy import create_engine, func, select
from sqlalchemy.orm import sessionmaker

from app.DBase.models import TaskRow
from app.models import Task


def load_rows(source_path: Path) -> list[TaskRow]:
    try:
        records = json.loads(source_path.read_text(encoding="utf-8"))
    except (OSError, UnicodeDecodeError, json.JSONDecodeError) as exc:
        raise ValueError(f"Не удалось прочитать снимок: {exc}") from exc

    if not isinstance(records, list):
        raise ValueError("Корень JSON должен быть списком задач")

    rows = []
    seen_ids = set()
    for position, record in enumerate(records, start=1):
        try:
            task = Task.from_dict(record)
        except (TypeError, ValueError) as exc:
            raise ValueError(f"Запись {position} не прошла проверку: {exc}") from exc

        if task.title != record["title"] or task.tags != record.get("tags", []):
            raise ValueError(f"Запись {position} не нормализована")
        if task.id in seen_ids:
            raise ValueError(f"Повторяется id задачи {task.id}")
        seen_ids.add(task.id)

        rows.append(
            TaskRow(
                id=task.id,
                title=task.title,
                priority=task.priority,
                is_done=task.is_done,
                tags=list(task.tags),
                title_normalized=task.title.lower(),
            )
        )
    return rows


def import_rows(rows, SessionFactory) -> int:
    with SessionFactory() as session:
        try:
            existing = session.scalar(
                select(func.count()).select_from(TaskRow)
            )
            if existing:
                raise ValueError("Целевая таблица уже содержит задачи")
            session.add_all(rows)
            session.commit()
            return len(rows)
        except Exception:
            session.rollback()
            raise


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--source", type=Path, required=True)
    parser.add_argument("--target", required=True)
    args = parser.parse_args()

    rows = load_rows(args.source)
    engine = create_engine(args.target)
    SessionFactory = sessionmaker(bind=engine)
    try:
        imported_count = import_rows(rows, SessionFactory)
    finally:
        engine.dispose()

    print(f"Перенесено задач: {imported_count}")


if __name__ == "__main__":
    main()""",
                        "checks": [
                            "Source разбирается до создания целевого Engine; файл не найден, неверный JSON и неверная запись не становятся пустым импортом.",
                            "Task.from_dict сохраняет совместимость старого формата; исходные id и все пять предметных полей не подменяются default-значениями.",
                            "Импортёр не вызывает create_all и не использует JsonStorage; модуль не переносит данные при импорте.",
                            "Повторный запуск и искусственная ошибка записи проверяются на отдельной базе и не оставляют частичных изменений.",
                        ],
                    },
                },
                {
                    "title": "Сверьте сохранённые значения и границу репетиции",
                    "task": (
                        "После успешного запуска данные читаются новой Session. "
                        "Сравнение проверяет все id и поля каждой задачи, а отдельный JSON-сценарий подтверждает, что источники не синхронизируются автоматически."
                    ),
                    "requirements": [
                        "Сравниваются title, priority, is_done, tags и title_normalized для каждого исходного id.",
                        "Плохой последний элемент, непустая цель и ошибка записи проверяются по состоянию таблицы после отказа.",
                        "Рабочий JSON остаётся штатным источником API и CLI до отдельного переключения.",
                    ],
                    "hint": "Количество строк не выявит чужой id или потерянный tag. Читайте значения после commit новой Session и сравнивайте по id.",
                    "answer": {
                        "explanation": (
                            "Новое чтение проверяет сохранённую таблицу, а не оставшиеся в памяти ORM-объекты. "
                            "Проверка полей доказывает точность лучше, чем одно число строк; запуск обычного JSON-сценария отдельно подтверждает границу источников."
                        ),
                        "steps": [
                            "Читаем строки новой Session в порядке id.",
                            "Сравниваем множества id и все прежние значения каждой задачи.",
                            "Отдельно проверяем вычисленный title_normalized и пустой tags у старой записи.",
                            "Для каждого отказа перечитываем таблицу и проверяем, что частичного результата нет.",
                            "После репетиции запускаем обычную JSON-команду и не ожидаем автоматического изменения SQLite-копии.",
                        ],
                        "code": """from sqlalchemy import select

from app.DBase.models import TaskRow


with SessionFactory() as session:
    saved_rows = session.scalars(
        select(TaskRow).order_by(TaskRow.id)
    ).all()

expected_by_id = {row.id: row for row in expected_rows}
saved_by_id = {row.id: row for row in saved_rows}
assert saved_by_id.keys() == expected_by_id.keys()

for task_id, expected in expected_by_id.items():
    saved = saved_by_id[task_id]
    assert saved.title == expected.title
    assert saved.priority == expected.priority
    assert saved.is_done == expected.is_done
    assert saved.tags == expected.tags
    assert saved.title_normalized == expected.title.lower()""",
                        "checks": [
                            "Новая Session читает полный результат после завершения импорта.",
                            "Совпадают все id и поля каждой задачи, включая tags и title_normalized.",
                            "Плохая последняя запись, непустая цель и ошибка вставки не оставляют строк после rollback.",
                            "Исходный файл не изменён, а обычные API и CLI по-прежнему используют JSON.",
                        ],
                    },
                },
            ],
            "result": (
                "Отдельный импорт переносит допустимую копию JSON в пустую SQLite-таблицу целиком и подтверждает каждое поле новым чтением. "
                "Ошибочный вход, повторный запуск и ошибка записи не оставляют частичного результата; рабочий Planner остаётся на JSON."
            ),
        }
    ],

    "70.1": [
            {
                "title": "Ограничьте Session одним запросом или одной командой",
                "task": "Практика рассчитана на подтверждённый checkpoint B70: Engine, фабрика Session, mapping TaskRow в Task, read-only SqlTaskRepository.list/get и сервис с репозиторным входом уже готовы. Функция make_session_factory(engine) создаёт фабрику; get_db получает её из request.app.state.session_factory. Для этой узкой SQL-проверки отдельная SQLite-fixture временно задаёт фабрику в app.state. Мы подключаем SQL только к существующему GET по id и подготавливаем контекст одной CLI-команды; обычные API и CLI продолжают использовать JSON. Если B70 не подтверждён, сначала завершаем предыдущие шаги, не выдумывая их реализацию в этой практике.",
                "tasks": [
                    {
                        "title": "1. Выдайте Session через yield-зависимость",
                        "task": "get_db получает фабрику из request.app.state.session_factory, создаёт через неё отдельную Session на запрос и закрывает ресурс в finally. Фабрика создана вызовом make_session_factory(engine) в изолированной SQLite-fixture; в обычном приложении JSON-путь остаётся штатным.",
                        "requirements": [
                            "get_db принимает Request и читает request.app.state.session_factory.",
                            "В app.state хранится фабрика, а не одна общая Session.",
                            "Новая Session создаётся на запрос; finally закрывает её без commit."
                        ],
                        "hint": "Сначала найдите фабричную функцию make_session_factory(engine) в app.DBase.session. get_db получает уже созданную фабрику через request.app.state.session_factory; тест временно задаёт это поле для отдельной SQLite.",
                        "answer": {
                            "explanation": "Engine и фабрика живут дольше одной Session. В этом задании фабрика создаётся на отдельном Engine тестовой SQLite и доступна dependency через состояние тестового приложения. get_db не строит Engine и не выбирает хранилище.",
                            "steps": [
                                "Импортируйте Iterator, Request и Session; реализуйте get_db в app/core/dependencies.py.",
                                "Получите фабрику через getattr(request.app.state, \"session_factory\", None) и явно откажите, если она не настроена.",
                                "Вызовите session_factory(), передайте Session единственным yield и закройте её в finally.",
                                "Не создавайте Engine внутри dependency и не добавляйте commit или переключение JSON/SQL."
                            ],
                            "code": "from collections.abc import Iterator\n\nfrom fastapi import Request\nfrom sqlalchemy.orm import Session\n\n\ndef get_db(request: Request) -> Iterator[Session]:\n    session_factory = getattr(request.app.state, \"session_factory\", None)\n    if session_factory is None:\n        raise RuntimeError(\"SQL session factory is not configured\")\n\n    db = session_factory()\n    try:\n        yield db\n    finally:\n        db.close()",
                            "checks": [
                                "make_session_factory(engine) создаёт вызываемую фабрику для отдельного тестового Engine.",
                                "Каждый запрос получает новую Session; ресурс закрывается и при успехе, и при исключении.",
                                "JSON-сервис не заменяется и app.state не хранит Session."
                            ]
                        }
                    },
                    {
                        "title": "2. Проверьте существующий GET с SQL-provider",
                        "task": "SQL-provider получает Session через Depends(get_db) и собирает PlannerService через уже существующий build_service(repository=...). Отдельный тестовый Engine и его фабрика временно устанавливаются в app.state; override касается только get_planner.",
                        "requirements": [
                            "Изолированная SQLite-fixture создаёт Engine на tmp_path и фабрику через make_session_factory(engine).",
                            "Известная задача сохраняет id, title, priority, is_done и внутренние tags в предметной Task.",
                            "Публичный TaskRead остаётся прежним и не начинает возвращать tags; неизвестная задача остаётся 404.",
                            "SqlTaskRepository используется только через поддерживаемые list/get; не вызываются create, update, delete, select, search или statistics."
                        ],
                        "hint": "Сервисный provider может принять Session как Depends(get_db) и передать SqlTaskRepository в существующий repository-вход build_service. Перед запросом положите фабрику fixture в app.state.session_factory, а в finally восстановите и app.state, и overrides.",
                        "answer": {
                            "explanation": "build_service(repository=...) и PlannerService(repository=...) существуют в точке старта. Это не добавляет SQL-методы: текущий SqlTaskRepository реализует только list() и get(), поэтому SQL-backed сервис годится здесь лишь для list_tasks() и get_task().",
                            "steps": [
                                "Возьмите engine и session_factory из sql_database fixture, которая использует отдельный файл под tmp_path.",
                                "Объявите get_sql_planner с Depends(get_db) и соберите его через build_service(repository=SqlTaskRepository(db)).",
                                "Сохраните текущее app.state.session_factory и полный словарь overrides, временно установите фабрику fixture и override get_planner.",
                                "Проверьте известный GET и прежний 404 для неизвестного id; затем в finally восстановите overrides и app.state.",
                                "После восстановления выполните запрос через обычный JSON-provider; не вызывайте у SQL-backed сервиса неподдерживаемые операции."
                            ],
                            "code": "\nfrom fastapi import Depends\nfrom sqlalchemy.orm import Session\n\nfrom app.api import app\nfrom app.core.dependencies import get_db, get_planner\nfrom app.main import build_service\nfrom app.DBase.models import TaskRow\nfrom app.routers.tasks.crud import SqlTaskRepository\nfrom app.services import PlannerService\n\n\ndef test_sql_get_provider_uses_a_request_session_and_restores_json(\n    sql_database, api_client, api_service\n):\n    engine, session_factory = sql_database\n    with session_factory() as session:\n        session.add(\n            TaskRow(\n                id=7,\n                title=\"SQL task\",\n                priority=3,\n                tags=[\"internal\"],\n                title_normalized=\"sql task\",\n            )\n        )\n        session.commit()\n\n    json_task = api_service.add_task(\"JSON task\", 2)\n\n    def get_sql_planner(db: Session = Depends(get_db)) -> PlannerService:\n        return build_service(repository=SqlTaskRepository(db))\n\n    had_factory = hasattr(app.state, \"session_factory\")\n    previous_factory = getattr(app.state, \"session_factory\", None)\n    previous_overrides = app.dependency_overrides.copy()\n    app.state.session_factory = session_factory\n    try:\n        app.dependency_overrides[get_planner] = get_sql_planner\n        found = api_client.get(\"/tasks/7\")\n        missing = api_client.get(\"/tasks/999\")\n    finally:\n        app.dependency_overrides.clear()\n        app.dependency_overrides.update(previous_overrides)\n        if had_factory:\n            app.state.session_factory = previous_factory\n        else:\n            del app.state.session_factory\n\n    assert found.status_code == 200\n    assert found.json() == {\n        \"id\": 7,\n        \"title\": \"SQL task\",\n        \"priority\": 3,\n        \"is_done\": False,\n    }\n    assert \"tags\" not in found.json()\n    assert missing.status_code == 404\n\n    json_response = api_client.get(f\"/tasks/{json_task.id}\")\n    assert json_response.status_code == 200\n    assert json_response.json()[\"title\"] == \"JSON task\"\n",
                            "checks": [
                                "Известный id возвращает прежний статус и ровно прежние поля TaskRead.",
                                "Неизвестный id остаётся 404, а отдельная проверка mapping подтверждает внутренние tags.",
                                "После восстановления app.state и overrides запрос снова использует полный JSON-путь.",
                                "SQL-backed PlannerService вызывается только через list_tasks() или get_task()."
                            ]
                        }
                    },
                    {
                        "title": "3. Наблюдайте закрытие на успехе и ошибке",
                        "task": "Наблюдайте закрытие Session после успешного чтения и после исключения в SQL-provider, уже получившем db через Depends(get_db). TrackingFactory строится на отдельном Engine; dependency берёт её из app.state, как и в реальном коде.",
                        "requirements": [
                            "TrackingSession записывает вызов close() и затем вызывает super().close().",
                            "Тест временно задаёт app.state.session_factory и восстанавливает предыдущее значение.",
                            "Исключение распространяется к pytest, а исходные dependency overrides возвращаются полностью."
                        ],
                        "hint": "get_db читает фабрику из request.app.state, поэтому в тесте временно задайте app.state.session_factory объектом sessionmaker(bind=db_engine, class_=TrackingSession). После проверки восстановите прежнее состояние приложения в finally.",
                        "answer": {
                            "explanation": "get_db берёт фабрику из request.app.state, поэтому тест подменяет именно это поле. FastAPI создаёт Session для yield-зависимости и закрывает её, даже если зависимый provider выбросил исключение после получения db.",
                            "steps": [
                                "Создайте TrackingSession, который записывает вызов close() перед super().close().",
                                "Соберите TrackingFactory через sessionmaker, привязав её к отдельному db_engine.",
                                "Сохраните предыдущее app.state.session_factory и overrides, временно установите TrackingFactory.",
                                "Проверьте успешный GET, затем provider с Depends(get_db), который поднимает RuntimeError после получения Session.",
                                "В finally восстановите словарь overrides и прежнее наличие или значение app.state.session_factory."
                            ],
                            "code": "\nimport pytest\nfrom fastapi import Depends\nfrom sqlalchemy.orm import Session, sessionmaker\n\nfrom app.api import app\nfrom app.core.dependencies import get_db, get_planner\nfrom app.main import build_service\nfrom app.DBase.models import TaskRow\nfrom app.routers.tasks.crud import SqlTaskRepository\nfrom app.services import PlannerService\n\n\ndef test_sql_dependency_closes_session_after_success_and_error(\n    sql_database, api_client\n):\n    engine, session_factory = sql_database\n    with session_factory() as session:\n        session.add(\n            TaskRow(\n                id=7,\n                title=\"SQL task\",\n                priority=3,\n                tags=[\"internal\"],\n                title_normalized=\"sql task\",\n            )\n        )\n        session.commit()\n\n    created_sessions = []\n\n    class TrackingSession(Session):\n        def __init__(self, *args, **kwargs):\n            super().__init__(*args, **kwargs)\n            self.was_closed = False\n            created_sessions.append(self)\n\n        def close(self):\n            self.was_closed = True\n            super().close()\n\n    tracked_factory = sessionmaker(bind=engine, class_=TrackingSession)\n    had_factory = hasattr(app.state, \"session_factory\")\n    previous_factory = getattr(app.state, \"session_factory\", None)\n    previous_overrides = app.dependency_overrides.copy()\n\n    def get_sql_planner(db: Session = Depends(get_db)) -> PlannerService:\n        return build_service(repository=SqlTaskRepository(db))\n\n    def fail_after_get_db(db: Session = Depends(get_db)):\n        raise RuntimeError(\"expected test failure\")\n\n    app.state.session_factory = tracked_factory\n    try:\n        app.dependency_overrides[get_planner] = get_sql_planner\n        api_client.get(\"/tasks/7\")\n        assert len(created_sessions) == 1\n        assert created_sessions[-1].was_closed\n\n        app.dependency_overrides[get_planner] = fail_after_get_db\n        with pytest.raises(RuntimeError, match=\"expected test failure\"):\n            api_client.get(\"/tasks/7\")\n        assert len(created_sessions) == 2\n        assert created_sessions[-1].was_closed\n    finally:\n        app.dependency_overrides.clear()\n        app.dependency_overrides.update(previous_overrides)\n        if had_factory:\n            app.state.session_factory = previous_factory\n        else:\n            del app.state.session_factory\n",
                            "checks": [
                                "close() наблюдается после успешного GET и после ошибки provider-а.",
                                "Контролируемая ошибка доходит до pytest и не становится HTTP-успехом.",
                                "Тест восстанавливает app.state.session_factory и исходные overrides."
                            ]
                        }
                    },
                    {
                        "title": "4. Подготовьте ресурс для одной CLI-команды",
                        "task": "Используйте ресурсный context для одного get или list. Он получает фабрику явным аргументом, собирает read-only SQL-сервис и закрывает Session при выходе из with. Основной CLI run остаётся на JSON.",
                        "requirements": [
                            "sql_service_context(session_factory) получает фабрику явным аргументом.",
                            "Внутри контекста вызываются только get_task() или list_tasks().",
                            "Контекст закрывает Session после успешного чтения и при исключении.",
                            "Основной CLI run и JSON-provider не переключаются."
                        ],
                        "hint": "Сверьте сигнатуру app.main.sql_service_context(session_factory) и передайте в неё фабрику отдельного тестового Engine. Не создавайте фабрику глобально в модуле.",
                        "answer": {
                            "explanation": "В app.main уже есть sql_service_context(session_factory). Он открывает переданную Session и собирает сервис через repository-вход; SQL-репозиторий поддерживает только get/list. Здесь мы проверяем один вызов и закрытие ресурса, а обычный JSON-run не меняется.",
                            "steps": [
                                "Передайте фабрику в sql_service_context(session_factory), не обращаясь к глобальному символу.",
                                "В контексте откройте session_factory() и соберите сервис через repository-вход build_service.",
                                "Выполните get_task или list_tasks и выйдите из with до следующей операции.",
                                "Проверьте новую Session для следующего контекста; обычный CLI run оставьте на JSON."
                            ],
                            "code": "import pytest\nfrom sqlalchemy.orm import Session, sessionmaker\n\nfrom app.DBase.models import TaskRow\nfrom app.main import sql_service_context\n\n\ndef test_sql_service_context_closes_session_after_success_and_error(sql_database):\n    engine, session_factory = sql_database\n    with session_factory() as session:\n        session.add(\n            TaskRow(\n                id=10,\n                title=\"CLI SQL task\",\n                priority=2,\n                tags=[],\n                title_normalized=\"cli sql task\",\n            )\n        )\n        session.commit()\n\n    class TrackingSession(Session):\n        def __init__(self, *args, **kwargs):\n            super().__init__(*args, **kwargs)\n            self.was_closed = False\n\n        def close(self):\n            self.was_closed = True\n            super().close()\n\n    tracked_factory = sessionmaker(bind=engine, class_=TrackingSession)\n    created = []\n\n    def make_session():\n        session = tracked_factory()\n        created.append(session)\n        return session\n\n    with sql_service_context(make_session) as planner:\n        assert planner.get_task(10).title == \"CLI SQL task\"\n    assert created[-1].was_closed\n\n    with pytest.raises(RuntimeError, match=\"command failed\"):\n        with sql_service_context(make_session):\n            raise RuntimeError(\"command failed\")\n    assert created[-1].was_closed",
                            "checks": [
                                "Контекст открыт вокруг одного вызова get_task() или list_tasks().",
                                "Фабрика передана явно; новая Session закрывается при нормальном и исключительном выходе.",
                                "Основной CLI, его цикл и штатный JSON-provider остаются прежними."
                            ]
                        }
                    }
                ],
                "result": "get_db создаёт Session из фабрики приложения и закрывает её; один существующий GET проходит через SQL-provider с прежним HTTP-договором, а CLI-контекст принимает фабрику явным аргументом. SQL-репозиторий поддерживает только list/get. Полный SQL CRUD, поиск, статистика, штатное переключение API/CLI, SQL-запись и изменение JSON-пути не входят."
            }
        ],
}
