import { CodeBlock, Diagram, DiagramArrow, DiagramFlow, DiagramNode, Lead, LinkedNotes, RichHero, RichLesson, Section } from "../../shared";

const commands = `.venv/Scripts/python.exe --version
.venv/Scripts/python.exe -m pip install alembic==1.18.4
.venv/Scripts/python.exe -c "import sqlalchemy; print(sqlalchemy.__version__)"
.venv/Scripts/python.exe -m alembic --version
.venv/Scripts/python.exe -m alembic init alembic`;

const model = `# catalog/model.py
from sqlalchemy import Integer, String
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column

class Base(DeclarativeBase):
    pass

class Book(Base):
    __tablename__ = "books"
    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    title: Mapped[str] = mapped_column(String, nullable=False)`;

const envExample = `# alembic/env.py в отдельном учебном каталоге catalog-demo/
import os
from pathlib import Path
from alembic import context
from sqlalchemy import create_engine, pool
from sqlalchemy.engine import make_url
from catalog.model import Base

root = Path(__file__).resolve().parents[1]
raw = os.environ.get("DATABASE_URL")
if not raw:
    raise ValueError("DATABASE_URL is required")
url = make_url(raw)
if (url.drivername != "sqlite" or not url.database
        or url.database == ":memory:" or url.query):
    raise ValueError("Expected a plain SQLite file URL")
path = Path(url.database)
if not path.is_absolute():
    path = root / path
path = path.resolve()
allowed = (root / "data" / "catalog-probe.sqlite3").resolve()
if path != allowed:
    raise ValueError("Unexpected database path")
print("Selected database:", path)
url = url.set(database=path.as_posix())
target_metadata = Base.metadata

if context.is_offline_mode():
    context.configure(url=url, target_metadata=target_metadata,
                      literal_binds=True)
    with context.begin_transaction():
        context.run_migrations()
else:
    engine = create_engine(url, poolclass=pool.NullPool)
    with engine.connect() as connection:
        context.configure(connection=connection, target_metadata=target_metadata)
        with context.begin_transaction():
            context.run_migrations()
    engine.dispose()`;

export function Lesson83({ module }: {
    module?: string;
}) {
    return <RichLesson>
<RichHero variant={`project`} chip={module ?? `Этап 5 · Блок 17`} title={`История схемы и настройка Alembic`} intro={`Разберём, как файлы истории связаны с состоянием конкретной базы, и подготовим безопасное первое наблюдение.`}/>
<Section number={`00`} title={`От восстановления к истории`}>
<Lead>
{`Проверенное восстановление помогает вернуться к данным. Но как узнать, какие изменения схемы должны следовать друг за другом?`}
</Lead>
<LinkedNotes variant={`connected`} items={[{ title: `Точка старта`, description: `У нас есть исходная база Planner, резерв и отдельно проверенная восстановленная копия. Они остаются сохранёнными.` }, { title: `Новый вопрос`, description: `Чем общая история изменений отличается от отметки конкретной базы?` }, { title: `Результат`, description: `Настроим Alembic и увидим пустую историю на отдельной учебной базе без изменения таблицы задач.` }]}/>
<p>
{`Будущая копия для обновления тоже получает отдельный путь. Первую пробу выполним ещё на одном новом файле: существующие данные не нужны для изучения инструмента.`}
</p>
</Section>
<Section number={`01`} title={`История и отметка базы`}>
<Lead>
{`Файл ревизии описывает изменение и его место в истории. Идентификатор revision отличает файл от других, а down_revision указывает на родительскую ревизию.`}
</Lead>
<p>
{`Представим каталог книг: ревизия `}
<code>
{`alpha`}
</code>
{` создаёт таблицу, её родитель отсутствует; ревизия `}
<code>
{`beta`}
</code>
{` добавляет поле и имеет `}
<code>
{`down_revision = "alpha"`}
</code>
{`. Последняя доступная ревизия в этой линейной истории называется `}
<code>
{`head`}
</code>
{`, здесь это beta. Это свойство файлов, общих для разных баз.`}
</p>
<Diagram caption={`Одна история файлов для разных баз`}>
<DiagramFlow label={`Порядок ревизий каталога книг`}>
<DiagramNode title={`alpha`}>
{`Первая ревизия, без родителя`}
</DiagramNode>
<DiagramArrow label={`следующая ревизия`}/>
<DiagramNode title={`beta`}>
{`Родитель: alpha; head истории`}
</DiagramNode>
</DiagramFlow>
</Diagram>
<p>
<code>
{`current`}
</code>
{` относится к выбранной базе: Alembic читает её служебную таблицу версий. Если применена только alpha, current равен alpha, хотя head уже beta. Если отметки нет, current отсутствует. Это не доказывает, что в базе нет таблиц: её могли создать другим способом. Даже имеющаяся отметка не доказывает, что фактическая схема совпадает с файлом ревизии.`}
</p>
<p>
{`Попробуем: в истории red, затем blue с родителем red. У первой базы отметка red, у второй отметки нет. Кто родитель blue и какой current у каждой? Ответ: red; соответственно red и отсутствие current. Head для обеих баз задаётся файлами и равен blue. Теперь придумаем собственные две ревизии и отметку отстающей базы: назовём родителя, head и current, затем объясним, какое действие применяет операции, а какое только записывает отметку. Настоящую ревизию для этой пробы создавать не нужно.`}
</p>
</Section>
<Section number={`02`} title={`Операция и отметка`}>
<p>
<code>
{`upgrade`}
</code>
{` выполняет операции ревизий на пути к выбранной цели и обновляет отметку. `}
<code>
{`stamp`}
</code>
{` устанавливает отметку, но операции миграции не исполняет и совпадение схемы не проверяет. Ложная отметка способна скрыть отсутствие необходимых изменений.`}
</p>
<p>
<code>
{`Base.metadata.create_all`}
</code>
{` создаёт отсутствующие таблицы по текущим описаниям моделей; это не журнал изменений и не способ обновить уже существующую таблицу. В нашем первом исследовании не запускаем ни upgrade, ни stamp, ни создание схемы.`}
</p>
<p>
{`Проверим себя: если схема книги уже совпадает с проверенной исходной ревизией, какая операция только записывает отметку? Stamp. Какая выполняет действия для перехода? Upgrade. В заполненной базе прежде нужно действительно сравнить схему с исходной ревизией; одна отметка этого не делает.`}
</p>
</Section>
<Section number={`03`} title={`Одна среда и отдельный адрес`}>
<Lead>
{`В PowerShell выполняем команды из корня выбранного учебного проекта. Путь к Python указывает на один интерпретатор виртуальной среды: через него и устанавливаем пакет, и запускаем инструмент.`}
</Lead>
<CodeBlock caption={`Команды подготовки в отдельном проекте`} code={commands}/>
<p>
<code>
{`-m pip install`}
</code>
{` устанавливает пакет в среду указанного Python; `}
<code>
{`==`}
</code>
{` закрепляет версию. Вместо одного пакета `}
<code>
{`-r requirements.txt`}
</code>
{` передаёт pip список зависимостей из файла. Импорт и `}
<code>
{`sqlalchemy.__version__`}
</code>
{` показывают установленную версию SQLAlchemy, а `}
<code>
{`-m alembic --version`}
</code>
{` показывает версию инструмента. Проверенный набор: Python 3.12.10, SQLAlchemy 2.0.55 и Alembic 1.18.4. `}
<code>
{`init alembic`}
</code>
{` создаёт конфигурацию `}
<code>
{`alembic.ini`}
</code>
{`, сценарий `}
<code>
{`alembic/env.py`}
</code>
{` и каталог `}
<code>
{`alembic/versions/`}
</code>
{`. Свободное имя каталога важно: init не предназначен для перезаписи существующей истории. Сам init ревизию не создаёт.`}
</p>
<p>
{`В PowerShell `}
<code>
{`(Resolve-Path ./data).Path`}
</code>
{` показывает абсолютный путь существующего каталога data; `}
<code>
{`Test-Path ./data/example.sqlite3`}
</code>
{` возвращает True, если объект существует, и False, если его нет. Эти команды помогают сравнить места до эксперимента, но не проверяют содержимое базы.`}
</p>
<p>
{`SQLite URL `}
<code>
{`sqlite:///data/example.sqlite3`}
</code>
{` содержит относительный путь. В нашем проекте настройка разрешает его относительно корня проекта; абсолютный путь указывает на конкретное место независимо от текущего каталога. При подключении SQLite может создать несуществующий файл: опечатка способна выглядеть как пустая база. Поэтому сначала выбираем и сравниваем нормализованный абсолютный путь, а потом подключаемся.`}
</p>
<p>
{`Для проекта используем только явно заданный в текущем окружении `}
<code>
{`DATABASE_URL`}
</code>
{`. Существующая `}
<code>
{`load_settings`}
</code>
{` нормализует путь; её значение по умолчанию указывает на обычную базу Planner и для опыта не подходит. Отказываемся от пустого адреса, параметров URL, неожиданных и защищённых путей до вызова подключения. Допускаем только отдельный согласованный файл в `}
<code>
{`data/block17/`}
</code>
{`.`}
</p>
<p>
{`Посмотрим отдельно, как существующая настройка преобразует относительный адрес, не открывая базу. Из project/ можно сохранить пример как `}
<code>
{`check_example_url.py`}
</code>
{` и запустить тем же Python. Пример сравнивает пути к вымышленному файлу, а не создаёт его.`}
</p>
<CodeBlock caption={`Нормализация адреса без подключения`} code={`from pathlib import Path
from sqlalchemy.engine import make_url
from app.core.config import load_settings

settings = load_settings(environment={"DATABASE_URL": "sqlite:///data/block17/example.sqlite3"})
url = make_url(settings.database_url)
expected = Path("data/block17/example.sqlite3").resolve()
print(Path(url.database) == expected)`}/>
<p>
{`Вывод `}
<code>
{`True`}
</code>
{` показывает совпадение нормализованных путей при запуске из project/. Словарь `}
<code>
{`environment`}
</code>
{` задаёт конкретное значение вместо значения по умолчанию. В настоящей настройке сначала читаем обязательную переменную процесса, затем передаём её в такой словарь. Это важно сделать до импорта `}
<code>
{`app.core.config`}
</code>
{`: модуль умеет загружать локальный .env, но файл не заменяет наше требование явно заданной переменной процесса.`}
</p>
<p>
{`Проба: если мы хотели `}
<code>
{`data/catalog-probe.sqlite3`}
</code>
{`, а выбрали `}
<code>
{`data/catalog-probee.sqlite3`}
</code>
{`, соединение ещё не открываем. Исправляем выбор и снова сравниваем абсолютный путь. Одно имя файла без проверки расположения недостаточно.`}
</p>
</Section>
<Section number={`04`} title={`Независимая проба: каталог книг`}>
<Lead>
{`В отдельной папке catalog-demo создадим пакет catalog с пустым __init__.py и моделью книги. Это самостоятельный пример, а не файл Planner.`}
</Lead>
<CodeBlock caption={`Описание модели catalog/model.py`} code={model}/>
<p>
{`Импорт модели исполняет объявление класса: таблица books попадает в `}
<code>
{`Base.metadata`}
</code>
{`, набор описаний таблиц в памяти. Он не является реальной SQLite-схемой. Ключ Python `}
<code>
{`-c`}
</code>
{` исполняет переданную строку как программу. Проверим из корня catalog-demo: `}
<code>
{`.venv/Scripts/python.exe -c "from catalog.model import Base; print(list(Base.metadata.tables))"`}
</code>
{`. Ожидаем `}
<code>
{`['books']`}
</code>
{`; база этим импортом не создаётся.`}
</p>
<p>
{`После init создадим внутри catalog-demo пустой каталог data и заменим созданный `}
<code>
{`alembic/env.py`}
</code>
{` следующим примером. В нём разрешён ровно один файл. `}
<code>
{`make_url`}
</code>
{` разбирает адрес, `}
<code>
{`Path.resolve()`}
</code>
{` приводит путь к абсолютному, а `}
<code>
{`create_engine`}
</code>
{` и `}
<code>
{`connect`}
</code>
{` находятся только после проверок. `}
<code>
{`NullPool`}
</code>
{` не удерживает соединение для повторного использования; блок with закрывает соединение.`}
</p>
<CodeBlock caption={`Полный env.py независимого примера`} code={envExample}/>
<p>
{`В PowerShell из catalog-demo зададим `}
<code>
{`$env:DATABASE_URL = "sqlite:///data/catalog-probe.sqlite3"`}
</code>
{` и выполним команды ниже тем же Python. Переменная окружения действует в текущем окне PowerShell. В примере ini хранит расположение истории, но адрес подключения берётся из DATABASE_URL, а не из значения sqlalchemy.url в ini.`}
</p>
<CodeBlock caption={`Смотрим историю и выбранную базу`} code={`.venv/Scripts/python.exe -m alembic history
.venv/Scripts/python.exe -m alembic heads
.venv/Scripts/python.exe -m alembic current`}/>
<p>
{`History и heads читают файлы истории; до первой ревизии успешные команды не показывают ревизий. Current обращается к выбранной базе: при успехе появится диагностическая строка о выбранном файле, но не будет current revision. Журнальные строки Alembic возможны. Проверяем код завершения PowerShell `}
<code>
{`$LASTEXITCODE`}
</code>
{`: ноль означает успех, ошибка импорта или подключения не является пустой историей. Файл SQLite и служебная таблица версий не доказывают наличие books.`}
</p>
<p>
{`Проверим реальную базу уже знакомым read-only подключением. URI из `}
<code>
{`Path.as_uri()`}
</code>
{` правильно кодирует путь; `}
<code>
{`mode=ro`}
</code>
{` запрещает запись, а `}
<code>
{`uri=True`}
</code>
{` включает разбор URI. Запрос читает имена таблиц из sqlite_master и не создаёт их.`}
</p>
<CodeBlock caption={`Фактические таблицы, а не metadata`} code={`import sqlite3
from pathlib import Path

path = Path("data/catalog-probe.sqlite3").resolve()
connection = sqlite3.connect(path.as_uri() + "?mode=ro", uri=True)
try:
    rows = connection.execute("SELECT name FROM sqlite_master WHERE type='table' ORDER BY name").fetchall()
    print(rows)
finally:
    connection.close()`}/>
<p>
{`Сохраним пример, например в `}
<code>
{`inspect_catalog.py`}
</code>
{`, и запустим из catalog-demo через `}
<code>
{`.venv/Scripts/python.exe inspect_catalog.py`}
</code>
{`. Отсутствие books среди имён подтверждает только отсутствие этой таблицы в выбранной базе в момент проверки; набор служебных таблиц может зависеть от версии инструмента.`}
</p>
<p>
{`Для первой пробы заменим адрес на `}
<code>
{`sqlite:///data/wrong.sqlite3`}
</code>
{` и запустим только current. Ожидаем ошибку Unexpected database path и отсутствие wrong.sqlite3. Восстановим разрешённый адрес и повторим current. Проверка защищает этот учебный маршрут, а не произвольные процессы, которые могут открыть файл напрямую.`}
</p>
</Section>
<Section number={`05`} title={`Что мы будем делать в практике`}>
<Lead>
{`Перенесём принцип в один продолжающийся Planner: у него модель уже находится в app/DBase/models.py, а конфигурация в app/core/config.py.`}
</Lead>
<p>
{`Сначала сверим исходник и восстановленную копию с ранее подготовленной описью, сохраним резерв и различим пути. Затем закрепим версию инструмента, создадим его файлы, подключим `}
<code>
{`Base.metadata`}
</code>
{` и настроим проверку отдельной цели через `}
<code>
{`load_settings`}
</code>
{`. После этого проверим metadata и пустую историю, включая намеренно неверный адрес.`}
</p>
<p>
{`Импорт `}
<code>
{`Base`}
</code>
{` из модуля модели также исполняет определение TaskRow, поэтому в metadata ожидаем `}
<code>
{`tasks`}
</code>
{`. Это наблюдение не создаёт таблицу и не сравнивает её со схемой базы. Следующий шаг будет строить исходную ревизию на новых пустых базах; сейчас никакую ревизию не создаём.`}
</p>
</Section>
</RichLesson>;
}
