import { CodeBlock, Lead, LinkedNotes, RichHero, RichLesson, Section } from "../../shared";

export function Lesson82_1({ module }: { module?: string }) {
  return <RichLesson>
    <RichHero variant="project" chip={module ?? "Глава 5 · Блок 17"} title="Проверяем восстановление" intro="Проверим, можно ли получить отдельную базу из снимка и действительно ли в ней сохранились схема и данные." tags={[]} />
    <Section number="00" title="От снимка к восстановлению">
      <Lead>Согласованный снимок уже сохранён отдельно от исходной учебной базы. Но существование файла ещё не доказывает, что нужное состояние можно вернуть.</Lead>
      <LinkedNotes variant="connected" items={[
        { title: "Опора", description: "У нас есть опись схемы и строк и согласованный снимок. Останавливаем запись и закрываем соединения перед сравнением с описью." },
        { title: "Вопрос", description: "Можно ли открыть отдельное восстановление и найти в нём именно те ограничения и значения, которые мы записали?" },
        { title: "Результат", description: "Восстановим копию, проверим структуру, схему и каждую запись, а затем прочитаем данные обычным Planner." },
      ]} />
    </Section>
    <Section number="01" title="Снимок становится источником">
      <p>Для восстановления нужны три разные роли: исходная база, сохранённый снимок и новый файл назначения. В этот раз источником операции служит снимок. Исходник и снимок не изменяем. Работаем только в выделенном учебном каталоге, с закрытыми API, CLI и соединениями. Файл активной WAL-базы сам по себе не считаем согласованным снимком.</p>
      <p>Посмотрим на независимый пример заметок. В пустом учебном каталоге создадим исходник и снимок. Это одноразовый пример: перед повтором выберите новый пустой каталог. Запускаем файл тем же Python из папки project/. Соединение источника вызывает backup и получает соединение назначения. Возвращаемое значение backup равно None, поэтому успех определяем по отсутствию исключения и последующей проверке, а не по числу.</p>
      <CodeBlock caption="Полный пример создания и восстановления заметок" code={`from pathlib import Path
import sqlite3

root = Path("data/block17/notes-demo").resolve()
root.mkdir(parents=True, exist_ok=False)
original = root / "original.sqlite3"
snapshot = root / "snapshot.sqlite3"
restored = root / "restored.sqlite3"

db = sqlite3.connect(original)
try:
    db.execute("CREATE TABLE notes (id INTEGER PRIMARY KEY, text TEXT NOT NULL)")
    db.executemany("INSERT INTO notes VALUES (?, ?)", [(1, "чай"), (3, "книга")])
    db.commit()
finally:
    db.close()

def copy_database(source, target):
    # Обычный connect по отсутствующему пути создаёт пустую БД.
    src = sqlite3.connect(source.resolve().as_uri() + "?mode=ro", uri=True)
    try:
        # Только для нового имени в нашем закрытом примере.
        with target.open("xb"):
            pass
        dst = sqlite3.connect(target)
        try:
            src.backup(dst)
        finally:
            dst.close()
    finally:
        src.close()

copy_database(original, snapshot)
copy_database(snapshot, restored)
db = sqlite3.connect(restored.resolve().as_uri() + "?mode=ro", uri=True)
try:
    print(db.execute("SELECT id, text FROM notes ORDER BY id").fetchall())
finally:
    db.close()
# [(1, 'чай'), (3, 'книга')]`} />
      <p>resolve получает абсолютный путь, as_uri кодирует его как файловый URI, включая пробелы. Параметры mode=ro и uri=True требуют открыть существующий источник только для чтения: отсутствующий файл вызывает ошибку. Режим xb занимает новое имя и отказывает на существующем. Backup сам по себе не обещает защиты назначения от перезаписи. При ошибке частичный файл не принимаем за восстановление.</p>
      <p>Для проекта уже подготовлена обёртка <code>backup_lab/snapshot.py</code>. Она проверяет границы переданного <code>--root</code>, открывает источник только для чтения, занимает новое назначение и закрывает соединения. Код процесса 0 означает нормальное завершение, ненулевой код означает отказ; и после нуля нужны проверки результата. В PowerShell <code>$LASTEXITCODE</code> показывает код последней внешней команды.</p>
      <CodeBlock caption="Первая проба из project/ после примера выше" code={`./.venv/Scripts/python.exe backup_lab/snapshot.py --source data/block17/notes-demo/snapshot.sqlite3 --destination data/block17/notes-demo/another.sqlite3 --root data/block17/notes-demo
$LASTEXITCODE`} />
      <p>Откройте another.sqlite3 отдельно только для чтения, как в примере, и сравните строки с описью: ID 1 содержит «чай», ID 3 содержит «книга». Не выбирайте уже занятое имя. Если команда отказала или файл не открывается, остановитесь и выясните причину.</p>
    </Section>
    <Section number="02" title="Что доказывает каждая проверка">
      <p>Полный <code>PRAGMA integrity_check</code> проверяет внутреннюю целостность SQLite. Единственная строка <code>ok</code> означает, что эта проверка не обнаружила структурных ошибок. Она не доказывает полноту нужных записей или соответствие ожидаемой схеме и не проверяет внешние ключи: для них существует отдельный <code>foreign_key_check</code>. Ошибка открытия или любой иной результат означает остановку.</p>
      <p>Схему читаем из <code>sqlite_schema</code> и PRAGMA: table_info показывает столбцы, типы, notnull и pk; index_list показывает индексы, а index_info их столбцы; SQL создания таблицы содержит CHECK. Табличная форма pragma_index_info принимает имя индекса через параметр, как при составлении описи. Пустой список индексов тоже результат. Сопоставляем смысл ограничений с описью. Равенство текста DDL не является универсальной проверкой семантической эквивалентности.</p>
      <CodeBlock caption="Самостоятельный пример: сверяем заметки" code={`from pathlib import Path
import sqlite3

path = Path("data/block17/notes-demo/another.sqlite3").resolve()
db = sqlite3.connect(path.as_uri() + "?mode=ro", uri=True)
try:
    print(db.execute("PRAGMA integrity_check").fetchall())
    print(db.execute("SELECT type, name, tbl_name, sql FROM sqlite_schema ORDER BY type, name").fetchall())
    print(db.execute("PRAGMA table_info(notes)").fetchall())
    indexes = db.execute("PRAGMA index_list(notes)").fetchall()
    print(indexes)
    for index in indexes:
        print(index[1], db.execute("SELECT * FROM pragma_index_info(?)", (index[1],)).fetchall())
    rows = db.execute("SELECT id, text FROM notes ORDER BY id").fetchall()
    print(rows)
finally:
    db.close()
# integrity_check: [('ok',)]
# rows: [(1, 'чай'), (3, 'книга')]`} />
      <p>Сравним опись <code>{"{1: 'чай', 3: 'книга'}"}</code> с копией <code>{"{1: 'чай', 3: 'тетрадь'}"}</code>. Число строк и множество ID равны, но значение ID 3 отличается. Даже при <code>ok</code> такую копию нельзя принять. Попробуйте найти отличие, если вместо ID 3 появилась запись ID 5: совпадающего количества снова недостаточно.</p>
      <p>Для отрицательного опыта сначала делаем новую копию заметок через обёртку. Только в этой копии удаляем строку по ID. Параметр <code>?</code> передаёт значение отдельно от SQL, commit подтверждает изменение; finally закрывает соединение. Повторите на новой копии с другим ID и сравните строки с описью.</p>
      <CodeBlock caption="Удаление только из отдельной копии заметок" code={`# Из project/: сначала создать новый notes-demo/delete-demo.sqlite3:
./.venv/Scripts/python.exe backup_lab/snapshot.py --source data/block17/notes-demo/another.sqlite3 --destination data/block17/notes-demo/delete-demo.sqlite3 --root data/block17/notes-demo
$LASTEXITCODE

# После успешного кода 0 выполните отдельный Python-файл:
from pathlib import Path
import sqlite3

path = Path("data/block17/notes-demo/delete-demo.sqlite3").resolve()
db = sqlite3.connect(path.as_uri() + "?mode=rw", uri=True)
try:
    db.execute("DELETE FROM notes WHERE id = ?", (1,))
    db.commit()
    print(db.execute("SELECT id, text FROM notes ORDER BY id").fetchall())
    print(db.execute("PRAGMA integrity_check").fetchall())
finally:
    db.close()
# [(3, 'книга')]
# [('ok',)]`} />
      <p>mode=rw открывает существующий файл для записи и не создаёт отсутствующий. Удаление здесь намеренное и относится только к одноразовой копии. Если открытие не удалось, это повод отклонить образец, но не доказательство обнаруженного отсутствия строки.</p>
    </Section>
    <Section number="03" title="Читаем через обычный Planner">
      <p>SQLite-путь указывает на файл, а DATABASE_URL сообщает приложению, какую базу открыть. Настройки Planner разрешают относительный путь от project/. Без явной переменной и настройки в .env используется data/planner.sqlite3, поэтому для опыта явно задаём адрес. Сначала убедимся, что файл существует, и проверим нормализованный адрес до запуска. Сохраним прежнее значение переменной и вернём его после опыта.</p>
      <p>Для первой пробы создадим отдельный учебный Planner в новом файле. <code>Test-Path</code> проверяет занятое имя; при занятости останавливаемся. <code>Join-Path</code> добавляет имя файла к абсолютному каталогу. Команда init_db создаёт исходную пустую схему только в этой новой базе, она не выполняет миграцию. Затем через CLI добавим одну синтетическую задачу и прочитаем её. Это не команда для восстановленного файла.</p>
      <CodeBlock caption="PowerShell из project/: независимый учебный экземпляр Planner" code={`# Каталог data/block17 уже существует; имя cli-demo.sqlite3 должно быть новым.
$oldUrl = $env:DATABASE_URL
$dir = (Resolve-Path 'data/block17').Path
$file = Join-Path $dir 'cli-demo.sqlite3'
if (Test-Path $file) { throw 'Имя занято: выберите новый учебный путь' }
$db = $file.Replace('\\', '/')
$env:DATABASE_URL = "sqlite:///$db"
./.venv/Scripts/python.exe -c "from app.core.config import load_settings; print(load_settings().database_url)"
# Сверьте напечатанный абсолютный путь с $db до продолжения.
./.venv/Scripts/python.exe -m app.DBase.init_db
./.venv/Scripts/python.exe -m app.main
# В CLI: add, затем название «Полить цветок» и приоритет 2.
# Введите list: увидим эту задачу; затем введите exit.
if ($null -eq $oldUrl) { Remove-Item Env:DATABASE_URL } else { $env:DATABASE_URL = $oldUrl }`} />
      <p>Здесь <code>./.venv/Scripts/python.exe</code> это подготовленный интерпретатор проекта, <code>-m</code> запускает модуль, а не файл базы. Сравните показанный нормализованный URL с выбранным абсолютным путём; при несовпадении не запускайте CLI. Проведите пробу на отдельной учебной базе, затем примените тот же порядок к восстановлению. CLI показывает публичные поля, но не внутренние tags и title_normalized, поэтому SQL-сверка остаётся необходимой. Не запускайте init_db на восстановленной копии.</p>
    </Section>
    <Section number="04" title="Перед практикой">
      <p>Восстановление принимаем только вместе с успешным открытием, структурной проверкой, сравнением схемы, всех ID и значений и чтением через CLI. Неполную копию проверяем отдельно и отклоняем по конкретному отличию. Затем сохраним пути и результаты для следующей работы с историей схемы.</p>
    </Section>
  </RichLesson>;
}
