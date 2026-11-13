import { CodeBlock, Lead, LinkedNotes, RichHero, RichLesson, Section } from "../../shared";

export function Lesson84() {
  return (
    <RichLesson>
      <RichHero chip="Изменение заполненной схемы" title="Проверяем baseline заполненной базы" intro="Сначала докажем, что восстановленная схема соответствует исходной ревизии, и только потом запишем метку истории." />
      <Section number="00" title="От восстановления к истории">
        <Lead>Восстановленная копия уже содержит задачи. Новая база создана исходной ревизией. Нам нужно выяснить, действительно ли обе схемы описывают одно состояние.</Lead>
        <LinkedNotes variant="connected" items={[
          { title: "Исходник и резерв", description: "Исходная база и проверенный согласованный снимок сохраняются без изменений." },
          { title: "Восстановленная копия", description: "В ней проверяем схему и данные до записи метки." },
          { title: "Новая база", description: "Её схема получена исходной ревизией и служит ещё одной опорой для сравнения." },
        ]} />
        <p>Один файл работающей базы в режиме WAL может не содержать все последние изменения. Для согласованного снимка применяем изученный SQLite Backup API. Перед сопоставлением останавливаем процессы и закрываем соединения.</p>
      </Section>
      <Section number="01" title="Что сравниваем">
        <Lead>Одинаковые названия колонок и количество строк ещё не доказывают совпадение ограничений.</Lead>
        <p>Например, два каталога книг могут иметь колонку pages INTEGER, но один запрещает отрицательное число через CHECK, а другой разрешает. Перед маркировкой изучаем DDL в sqlite_schema и сведения PRAGMA: колонки, типы, первичный ключ, NOT NULL, SQL-default, состав и свойства индексов, внешние ключи, представления и триггеры. CHECK читаем в определении таблицы. Автоматический индекс может иметь SQL со значением NULL: его причину ищем в ограничениях таблицы.</p>
        <p>Python-default модели применяется приложением и не обязательно записан как SQL DEFAULT в базе. Сравниваем реальные определения с документированной исходной ревизией и с базой, созданной этой ревизией. Служебную таблицу alembic_version учитываем отдельно. Неизвестный объект или непонятное отличие останавливает маркировку. Даже совпадение текста или пустой результат autogenerate не доказывает семантическую равнозначность любых схем.</p>
        <p>Попробуем независимо от Planner. Из папки project/ сохраним следующий пример как compare_books.py и запустим подготовленным интерпретатором: .venv/Scripts/python.exe compare_books.py. Он создаёт только временные базы в памяти и выводит определения и сведения о каждой схеме.</p>
        <CodeBlock code={`import sqlite3\n\nfor check in ("CHECK (pages >= 0)", "CHECK (pages > 0)"):\n    db = sqlite3.connect(":memory:")\n    db.execute(f"CREATE TABLE books (id INTEGER PRIMARY KEY, pages INTEGER NOT NULL {check})")\n    print(db.execute("SELECT sql FROM sqlite_schema WHERE name = 'books'").fetchone())\n    print(db.execute("PRAGMA table_xinfo('books')").fetchall())\n    print(db.execute("PRAGMA index_list('books')").fetchall())\n    print(db.execute("PRAGMA foreign_key_list('books')").fetchall())\n    db.close()`} />
        <p>Найдите различие CHECK и объясните, почему метка одинакового состояния была бы преждевременной. Затем сделайте ограничения одинаковыми и перечислите проверенные признаки. Для найденного индекса его колонки можно прочитать через PRAGMA index_xinfo('имя_индекса'); определения остальных объектов видны запросом SELECT type, name, tbl_name, sql FROM sqlite_schema ORDER BY type, name.</p>
        <p>Когда объектов несколько, удобно пройти их в цикле. Табличные функции pragma_table_xinfo, pragma_index_list, pragma_index_xinfo и pragma_foreign_key_list возвращают те же сведения, но позволяют безопасно передать имя параметром. Следующий полный пример включает ограничение UNIQUE и внешний ключ; его можно сохранить как inspect_demo.py и выполнить тем же Python из project/.</p>
        <CodeBlock code={`import sqlite3

db = sqlite3.connect(":memory:")
try:
    db.execute("CREATE TABLE shelves (id INTEGER PRIMARY KEY)")
    db.execute("""CREATE TABLE books (
        id INTEGER PRIMARY KEY, title TEXT NOT NULL UNIQUE,
        shelf_id INTEGER REFERENCES shelves(id), CHECK (length(title) > 0)
    )""")
    objects = db.execute(
        "SELECT type, name, tbl_name, sql FROM sqlite_schema ORDER BY type, name"
    ).fetchall()
    for kind, name, table, ddl in objects:
        print("Объект:", kind, name, table, ddl)
        if kind == "table":
            print("Колонки:", db.execute("SELECT * FROM pragma_table_xinfo(?)", (name,)).fetchall())
            print("Внешние ключи:", db.execute("SELECT * FROM pragma_foreign_key_list(?)", (name,)).fetchall())
            indexes = db.execute("SELECT * FROM pragma_index_list(?)", (name,)).fetchall()
            print("Индексы:", indexes)
            for index in indexes:
                print("Состав:", index[1], db.execute(
                    "SELECT * FROM pragma_index_xinfo(?)", (index[1],)
                ).fetchall())
finally:
    db.close()`} />
        <p>В выводе есть автоматический индекс для UNIQUE; его SQL может быть None, а состав показан отдельно. Прочитайте CHECK в CREATE TABLE и найдите внешний ключ. Для реального файла вместо :memory: используем проверенный существующий путь и read-only подключение через path.resolve().as_uri() + "?mode=ro" с uri=True, как при восстановлении. Сравниваем свойства всех объектов, а не считаем одинаковые имена доказательством.</p>
        <p>Неожиданная таблица тоже является отличием. В следующем независимом примере создадим её только в базе в памяти. Сначала виден один объект, а после CREATE TABLE появляется второй. Это контролируемое отличие не меняет учебные файлы.</p>
        <CodeBlock code={`import sqlite3\n\ndb = sqlite3.connect(":memory:")\ndb.execute("CREATE TABLE books (id INTEGER PRIMARY KEY)")\nquery = "SELECT type, name, sql FROM sqlite_schema ORDER BY type, name"\nprint("До:", db.execute(query).fetchall())\ndb.execute("CREATE TABLE sample_extra (id INTEGER PRIMARY KEY)")\nprint("После:", db.execute(query).fetchall())\ndb.close()`} />
        <p>В самостоятельной работе такое отличие можно создать лишь в специально выделенной отрицательной копии, убедившись в её точном пути. Для существующего файла sqlite3.connect("file:путь?mode=rw", uri=True) открывает его для чтения и записи, но не создаёт новый при ошибке в имени. После изменения db.commit() сохраняет транзакцию, а db.close() закрывает соединение. Такая копия не становится частью истории и не передаётся для обновления.</p>
      </Section>
      <Section number="02" title="Метка и реальная схема">
        <Lead>Файл ревизии описывает изменение и содержит revision и down_revision. Таблица alembic_version хранит отметку о текущем положении базы в истории.</Lead>
        <p>Команда stamp записывает отметку, но не выполняет операции ревизии. Upgrade, напротив, выполняет путь изменений. Поэтому stamp не создаст отсутствующий CHECK и не исправит данные. Head может измениться, поэтому для проверенной исходной схемы выбираем конкретный revision из файла в alembic/versions, а не stamp head.</p>
        <h3>Первая проба на каталоге книг</h3>
        <p>В предыдущей теме мы создали независимые books.ini, books_history и books-apply.sqlite3. Исходная ревизия книг создаёт books с id, copies и ограничением copies &gt;= 0. Для пробы создадим ещё одну базу тем же SQL без Alembic: так в ней появятся таблица и строки, но не отметка истории. Сохраним код как project/make_books_stamp.py и запустим из project/ подготовленным Python. Имя должно быть свободно: xb откажет, если файл уже есть.</p>
        <CodeBlock code={`from pathlib import Path
import sqlite3

path = Path("data/block17/books-stamp.sqlite3").resolve()
with path.open("xb"):
    pass
db = sqlite3.connect(path)
try:
    db.execute("""CREATE TABLE books (
        id INTEGER NOT NULL,
        copies INTEGER NOT NULL,
        CONSTRAINT ck_books_copies CHECK (copies >= 0),
        PRIMARY KEY (id)
    )""")
    db.executemany("INSERT INTO books (id, copies) VALUES (?, ?)", [(1, 0), (3, 4)])
    db.commit()
    print(db.execute("SELECT id, copies FROM books ORDER BY id").fetchall())
finally:
    db.close()
# [(1, 0), (3, 4)]`} />
        <p>Откроем файл своей исходной ревизии в books_history/versions и сравним его операции с определением выше и фактической таблицей books в books-apply.sqlite3. Сравним DDL, table_xinfo, index_list, index_xinfo, foreign_key_list и остальные объекты, как в предыдущем разделе. Служебную alembic_version книги после upgrade учитываем отдельно. Убедимся, что ревизия исходная, down_revision равен None, а у books-stamp.sqlite3 таблица версии отсутствует. При отличии или неизвестном объекте остановимся.</p>
        <p>Для этого примера изменим только проверку allowed в books_history/env.py: к существующим двум учебным адресам добавим books-stamp.sqlite3. Сохраним требование явного DATABASE_URL, нормализацию и запрет параметров URL до подключения. Файл должен существовать: перед текущим действием проверим Test-Path. В отдельной истории Planner эту настройку не меняем.</p>
        <CodeBlock code={`# Фрагмент books_history/env.py после нормализации url и root
allowed = {
    (root / "data/block17/books-generate.sqlite3").resolve(),
    (root / "data/block17/books-apply.sqlite3").resolve(),
    (root / "data/block17/books-stamp.sqlite3").resolve(),
}
if Path(make_url(url).database).resolve() not in allowed:
    raise ValueError("Для опыта выберите отдельную учебную базу книг")

# PowerShell, из project/: проверьте True и сверенный путь до следующих команд
Test-Path ./data/block17/books-stamp.sqlite3
$env:DATABASE_URL = "sqlite:///data/block17/books-stamp.sqlite3"
.venv/Scripts/python.exe -c "from app.core.config import load_settings; print(load_settings().database_url)"
.venv/Scripts/python.exe -m alembic -c books.ini current
.venv/Scripts/python.exe -m alembic -c books.ini stamp ID_ИЗ_ФАЙЛА
$LASTEXITCODE
.venv/Scripts/python.exe -m alembic -c books.ini current`} />
        <p>Подставим реальный ID без скобок. Перед stamp current не показывает исходную revision; после успешной команды он показывает её ID. Отдельно откроем books-stamp.sqlite3 только для чтения: SELECT version_num FROM alembic_version и SELECT id, copies FROM books ORDER BY id. В первом результате ожидаем наш ID, во втором прежние две строки. Если команда завершилась ошибкой, сначала выясним фактическое состояние таблиц, версии и строк. Попробуйте объяснить, почему отличие CHECK в другом экземпляре запретило бы ту же запись метки.</p>
        <h3>Выбираем восстановленную копию Planner</h3>
        <p>История Planner отдельно настроена в project/alembic/env.py и после предыдущей темы разрешает только две свежие базы. До команды для восстановленной копии дополним набор allowed точным путём restored.sqlite3. Чтобы позднее прочитать current отдельной upgrade-копии, также добавим её точный путь. Исходник и резерв не разрешаем. Само добавление пути не открывает файл; перед любой командой убедимся, что нужный файл уже существует, и сверим нормализованный URL. Требование явной переменной, запрет query и проверку до create_engine сохраняем.</p>
        <CodeBlock code={`# Фрагмент project/alembic/env.py после вычисления root и path
allowed = {
    (root / "data/block17/fresh.sqlite3").resolve(),
    (root / "data/block17/fresh-compare.sqlite3").resolve(),
    (root / "data/block17/restored.sqlite3").resolve(),
    (root / "data/block17/upgrade.sqlite3").resolve(),
}
if path not in allowed or not path.is_file():
    raise ValueError("Ожидается существующая учебная база")
`} />
        <p>Перед каждой командой из project/ явно выбираем учебный DATABASE_URL и проверяем нормализованный путь через настройки приложения. Для работы с проверенной восстановленной копией в PowerShell зададим $env:DATABASE_URL = "sqlite:///data/block17/restored.sqlite3". Команда ниже покажет фактический URL; убедитесь, что это нужная учебная копия, прежде чем подключаться. Для других оболочек синтаксис переменной отличается.</p>
        <CodeBlock code={`.venv/Scripts/python.exe -c "from app.core.config import load_settings; print(load_settings().database_url)"\n.venv/Scripts/python.exe -m alembic current\n.venv/Scripts/python.exe -m alembic stamp ВАШ_ID_РЕВИЗИИ\n.venv/Scripts/python.exe -m alembic current`} />
        <p>Здесь ВАШ_ID_РЕВИЗИИ заменяем фактическим ID, а не вводим буквально. Команду stamp выполняем только в настроенном проекте с подходящей схемой, известной историей и ожидаемым отсутствием прежней метки. После записи отдельно читаем alembic_version и данные. Если команда завершилась ошибкой или её исход неизвестен, останавливаемся и исследуем фактическое состояние, а не повторяем запись вслепую.</p>
      </Section>
      <Section number="03" title="Данные и отдельная копия">
        <Lead>Проверка целостности, содержимого и версии отвечает на разные вопросы.</Lead>
        <p>PRAGMA integrity_check со значением ok проверяет внутреннюю целостность SQLite, но не доказывает полноту данных. Сравниваем число строк и все значения задач в порядке id: id, title, priority, is_done, tags и title_normalized. Tags и нормализованный заголовок читаем непосредственно SQL-запросом. Сравнение только числа не обнаружит изменение значения.</p>
        <p>Посмотрим на независимую таблицу заметок в памяти. JSON хранит список в текстовом представлении: json.dumps превращает список в строку, а параметры вопросительного знака передают значения отдельно от SQL. UPDATE относится только к выбранному id; commit сохраняет изменение. В примере сравниваем каждую строку, а не только её количество.</p>
        <CodeBlock code={`import json
import sqlite3

db = sqlite3.connect(":memory:")
try:
    db.execute("CREATE TABLE notes (id INTEGER PRIMARY KEY, text TEXT NOT NULL, labels JSON NOT NULL)")
    db.executemany("INSERT INTO notes VALUES (?, ?, ?)", [
        (1, "чай", json.dumps([])),
        (3, "книга", json.dumps(["дом"], ensure_ascii=False)),
    ])
    db.execute("UPDATE notes SET labels = ? WHERE id = ?",
               (json.dumps(["покупки"], ensure_ascii=False), 1))
    db.commit()
    rows = db.execute("SELECT id, text, labels FROM notes ORDER BY id").fetchall()
    print("Количество:", len(rows))
    for note_id, text, labels in rows:
        print(note_id, text, json.loads(labels))
finally:
    db.close()
# Количество: 2
# 1 чай ['покупки']
# 3 книга ['дом']`} />
        <p>Для первой пробы измените в примере метку второй заметки и проверьте обе строки. В Planner tags тоже читаем SQL, потому что публичные API и CLI их не показывают. Изменение tags допускается только в отдельной учебной восстановленной копии и отмечается в описи; остальные поля при этом не должны незаметно измениться.</p>
        <p>Для новой копии используем уже подготовленный backup_lab/snapshot.py. Он проверяет разрешённый каталог, открывает источник только для чтения и не перезаписывает занятое назначение. При закрытых соединениях из project/ вызов выглядит так:</p>
        <CodeBlock code={`.venv/Scripts/python.exe backup_lab/snapshot.py --source data/block17/books-stamp.sqlite3 --destination data/block17/books-copy.sqlite3 --root data/block17
$LASTEXITCODE`} />
        <p>Источник здесь учебная база книг из пробы выше. Убедитесь, что books-copy.sqlite3 отсутствует. После успешного кода процесса откройте оба файла отдельно и сравните схему, строки и метку версии. Если путь занят, возникла ошибка или данные расходятся, остановитесь: такую копию нельзя передавать дальше. Сам метод backup возвращает None и не защищает назначение от перезаписи; эту защиту обеспечивает наша обёртка.</p>
        <p>В проекте будем проверять восстановленную базу и после доказанного совпадения сохраним отдельную upgrade-копию. Исходник и резерв остаются нетронутыми.</p>
      </Section>
    </RichLesson>
  );
}
