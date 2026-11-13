import { CodeBlock, LinkedNotes, RichHero, RichLesson, Section, KeyTakeaways } from "../../shared";

const prepare = `from pathlib import Path
import sqlite3

path = Path("data/block17/books-demo.sqlite3").resolve()
path.parent.mkdir(parents=True, exist_ok=True)
# x запрещает перезапись существующего файла
with path.open("xb"):
    pass
con = sqlite3.connect(path)
try:
    con.executescript("""
        CREATE TABLE books (
            id INTEGER PRIMARY KEY,
            title TEXT NOT NULL,
            rating INTEGER CHECK (rating BETWEEN 1 AND 5)
        );
        CREATE INDEX ix_books_title ON books(title);
        INSERT INTO books VALUES (1, 'Python', 4);
    """)
    con.commit()
finally:
    con.close()
print(path)`;

const observe = `from pathlib import Path
import sqlite3

path = Path("data/block17/books-demo.sqlite3").resolve(strict=True)
print("Файл:", path)
con = sqlite3.connect(path.as_uri() + "?mode=ro", uri=True)
try:
    objects = con.execute(
        "SELECT type, name, tbl_name, sql FROM sqlite_schema ORDER BY type, name"
    ).fetchall()
    print("Объекты:", objects)
    print("Поля:", con.execute("PRAGMA table_xinfo('books')").fetchall())
    indexes = con.execute("PRAGMA index_list('books')").fetchall()
    print("Индексы:", indexes)
    for index in indexes:
        print("Поля индекса:", con.execute(
            "SELECT * FROM pragma_index_info(?)", (index[1],)
        ).fetchall())
    print("Внешние ключи:", con.execute("PRAGMA foreign_key_list('books')").fetchall())
    print("Строки:", con.execute("SELECT * FROM books ORDER BY id").fetchall())
finally:
    con.close()`;

const createAll = `from sqlalchemy import Column, Integer, MetaData, Table, create_engine, inspect

engine = create_engine("sqlite:///:memory:")
old = MetaData()
Table("notes", old, Column("id", Integer, primary_key=True))
old.create_all(engine)
new = MetaData()
Table("notes", new, Column("id", Integer, primary_key=True), Column("text", Integer))
new.create_all(engine)
print([c["name"] for c in inspect(engine).get_columns("notes")])
engine.dispose()
# ['id'], а не ['id', 'text']`;

const alter = `from pathlib import Path
import sqlite3

path = Path("data/block17/books-demo.sqlite3").resolve(strict=True)
# Только после проверки, что это учебный books-demo, а не Planner!
con = sqlite3.connect(path)
try:
    con.execute("ALTER TABLE books ADD COLUMN shelf TEXT")
    con.commit()
finally:
    con.close()
con = sqlite3.connect(path.as_uri() + "?mode=ro", uri=True)
try:
    print(con.execute("PRAGMA table_xinfo('books')").fetchall())
finally:
    con.close()`;

const checkUrl = `from pathlib import Path
from sqlalchemy.engine import make_url
from app.core.config import load_settings

expected = Path("data/block17/source.sqlite3").resolve(strict=True)
url = load_settings().database_url
actual = Path(make_url(url).database).resolve()
print("DATABASE_URL:", url)
print("Выбранный файл:", actual)
print("Совпадает с учебным путём:", actual == expected)`;

const init = `from pathlib import Path
import os
import subprocess
import sys
from sqlalchemy.engine import URL

source = Path("data/block17/source.sqlite3").resolve(strict=True)
target = Path("data/block17/schema-sample.sqlite3").resolve()
root = Path("data/block17").resolve(strict=True)
if target.parent != root or target == source or target.exists():
    raise SystemExit("Путь образца занят или недопустим")
url = URL.create("sqlite", database=target.as_posix()).render_as_string(hide_password=False)
env = os.environ.copy()
env["DATABASE_URL"] = url
print("Образец:", target, "DATABASE_URL:", url, flush=True)
if input("Путь и URL указывают на новый образец? Введите yes: ").strip() != "yes":
    raise SystemExit("Создание отменено")
subprocess.run([sys.executable, "-m", "app.DBase.init_db"], env=env, check=True)`;

export function Lesson81_1() {
  return <RichLesson>
    <RichHero chip="Практика работы с данными" title="Сверяем реальную схему" intro="Узнаем, что действительно находится в учебном файле SQLite, и сравним наблюдения с договором модели." />
    <Section number="00" title="От Planner к договору">
      <LinkedNotes variant="connected" items={[
        { title: "Уже есть", description: "Мы проверяли отдельный учебный Planner, сохранили путь и наблюдали две синтетические задачи с разными tags." },
        { title: "Теперь проверим", description: "Файл содержит данные и фактическую SQL-схему; Python metadata описывает то, что приложение ожидает. Одно не доказывает другое." },
        { title: "Передадим дальше", description: "Опись схемы и всех значений поможет подготовить согласованный снимок. Сама опись ещё не резервная копия." },
      ]} />
    </Section>
    <Section number="01" title="Открываем только существующий файл">
      <p>Схема описывает таблицы, столбцы и ограничения. Данные это строки внутри таблиц. Даже если модель в Python выглядит правильно и приложение запустилось, выбранный файл может иметь другую схему. Остановим API и CLI и закроем их соединения: тогда сравниваемое состояние не будет меняться во время описи.</p>
      <p>Сначала потренируемся на независимом каталоге книг. Все команды запускаем из папки <code>project/</code> одним подготовленным интерпретатором. В Windows это <code>.venv/Scripts/python.exe</code>. Сохраним следующий код во временный учебный файл <code>books_prepare.py</code> в project/ и выполним <code>.venv/Scripts/python.exe books_prepare.py</code>. Если файл уже занят, остановимся и выберем другое свободное имя в коде: пример его не перезапишет.</p>
      <CodeBlock code={prepare} caption="Создаём отдельный учебный пример один раз" />
      <p>Теперь сохраним следующий код как <code>books_read.py</code> и запустим тем же Python. <code>resolve(strict=True)</code> требует существующий путь, <code>as_uri()</code> преобразует абсолютный путь в URI и кодирует специальные символы. Параметр <code>mode=ro</code> запрещает запись; <code>uri=True</code> говорит sqlite3 разобрать адрес как URI. <code>finally</code> закрывает соединение даже при ошибке. Отсутствие файла или ошибка записи означает остановку, а не повод создать пустую базу.</p>
      <CodeBlock code={observe} caption="Читаем объекты, поля, индексы и строки" />
      <p>В выводе увидим таблицу books, индекс ix_books_title и строку (1, 'Python', 4). В <code>table_xinfo</code> у id признак PK равен 1; найдите его и имя таблицы. Попробуйте прочитать этот же файл и объяснить, почему для несуществующего пути программа остановится.</p>
    </Section>
    <Section number="02" title="Читаем определение, а не только строки">
      <p><code>sqlite_schema</code> перечисляет объекты: type, name, tbl_name и исходный CREATE SQL. В нём ищем таблицы, индексы, представления и триггеры. У автоматически созданного индекса SQL может быть NULL. Пустой список объектов определённого вида тоже результат, если он получен запросом.</p>
      <p><code>table_xinfo</code> возвращает cid, name, type, notnull, dflt_value, pk и hidden. Последнее поле показывает обычный, скрытый или генерируемый столбец. <code>notnull=1</code> означает объявленный NOT NULL, а pk показывает порядок поля в составном ключе; для SQLite проверяем ключ вместе с CREATE SQL, а не делаем вывод только по одному notnull. <code>dflt_value</code> это SQL DEFAULT или None. <code>index_list</code> перечисляет индексы, <code>index_info</code> их столбцы, <code>foreign_key_list</code> внешние ключи. CHECK виден в CREATE SQL. В примере выше параметр <code>?</code> безопасно передаёт имя в табличную форму pragma, а не собирает SQL строкой.</p>
      <p>Первая проба: найдите в выводе books все три столбца, индекс по title и ограничение rating от 1 до 5. Значение 4 в строке это данные, а CHECK в CREATE это правило. Запросите отдельно объекты с type view и trigger: отсутствие строк означает, что таких объектов в примере нет.</p>
    </Section>
    <Section number="03" title="Модель и таблица могут расходиться">
      <p>Представим, что модель каталога ожидает <code>id INTEGER PRIMARY KEY</code>, обязательный <code>title TEXT NOT NULL</code> и <code>rating INTEGER CHECK (rating BETWEEN 1 AND 5)</code>. Если в файле title допускает NULL, это отличие, даже если имена совпадают. Если диапазон в CREATE равен 1–10, найдите второе отличие сами. Сравниваем смысл определения и ограничения: простое совпадение текста не распознаёт все эквивалентные формы SQL.</p>
      <p>В SQLAlchemy <code>default=2</code> задаёт клиентское значение при вставке через SQLAlchemy, а <code>server_default</code> создаёт SQL DEFAULT. Поэтому None в dflt_value не доказывает отсутствия Python-default. В нашей модели Planner именно Python задаёт значения priority, is_done и tags; не записываем их как SQL defaults.</p>
      <p>Повторный <code>create_all</code> создаёт недостающие таблицы, но не дополняет уже существующую. Это можно проверить независимым полностью запускаемым примером в файле <code>create_all_demo.py</code>, вызвав его из project/ тем же Python:</p>
      <CodeBlock code={createAll} caption="Metadata изменилась, существующая таблица нет" />
      <p>Сначала создана таблица notes с одним полем. Новая metadata объявляет второе, но повторный вызов оставляет только id. Успешный запуск не означает обновление схемы.</p>
    </Section>
    <Section number="04" title="Отдельный образец с известным отличием">
      <p>Для пробы запишем код ниже в <code>books_alter.py</code>. Это изменение только что созданного books-demo, не Planner. <code>ALTER TABLE ... ADD COLUMN</code> добавляет столбец; без NOT NULL значение может быть NULL. После записи commit сохраняет изменение, close освобождает соединение, а повторное открытие read-only позволяет увидеть shelf в table_xinfo. Повторный запуск остановится на существующем столбце. Попробуйте на новом независимом файле другое имя и найдите его в выводе.</p>
      <CodeBlock code={alter} caption="Одно контролируемое изменение образца" />
      <p>Путь к файлу и DATABASE_URL это разные записи одного адреса. Чтобы сверить текущую настройку с учебным файлом, сохраним следующий код как <code>check_url.py</code> и запустим из project/ тем же Python. <code>load_settings()</code> читает настройки проекта, <code>make_url</code> разбирает SQLAlchemy URL, а <code>database</code> содержит путь к файлу. Если ранее выбрано другое учебное имя, изменим expected. Результат True означает совпадение путей, а не правильность содержимого. При False остановимся и выясним настройку до работы.</p>
      <CodeBlock code={checkUrl} caption="Сверяем URL и путь исходного учебного файла" />
      <p>В проектной практике нужен другой новый файл с исходной схемой Planner. Код ниже можно сохранить как <code>sample_init.py</code> и вызвать из project/ тем же Python. Он проверяет путь и формирует SQLite DATABASE_URL из абсолютного пути. <code>env.copy()</code> создаёт настройки дочернего процесса, поэтому значение родительского окружения не меняется. <code>sys.executable</code> выбирает текущий Python; <code>-m app.DBase.init_db</code> запускает существующий модуль, <code>check=True</code> останавливает программу при ошибке. Перед запуском убедитесь, что исходный путь совпадает с вашей описью. Программа выведет адрес и дождётся ответа: введите yes только после сверки нового пути и URL. Если он занят или путь неясен, отмените создание.</p>
      <CodeBlock code={init} caption="Инициализация только нового образца" />
      <p>Затем закройте соединение чтения, откройте только подтверждённый образец для записи и добавьте в tasks учебный nullable-столбец по примеру books. Закройте запись и снова прочитайте образец через mode=ro. Наличие лишнего поля означает неизвестную схему: автоматически отмечать её исходной ревизией нельзя. Это не резерв и не миграция.</p>
    </Section>
    <KeyTakeaways points={["Проверяем сам выбранный файл, его объекты, ограничения и все данные, а не только модель.", "Отличаем SQL DEFAULT от Python-default и фиксируем неизвестные расхождения.", "Образец для изменения создаём отдельно; исходный Planner остаётся доступным только для чтения."]} />
  </RichLesson>;
}
