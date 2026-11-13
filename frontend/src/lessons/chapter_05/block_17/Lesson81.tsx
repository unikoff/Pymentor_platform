import { RichLesson, RichHero, Section, Lead, LinkedNotes, CodeBlock, Callout } from "../../shared";

export function Lesson81() {
  return (
    <RichLesson>
      <RichHero chip="SQL Planner" title="Проверяем Planner" intro="Подготовим проверяемую точку в одном учебном проекте перед исследованием его схемы." />
      <Section number="00" title="От работающего проекта к проверяемой точке">
        <Lead>У нас есть принятый проект с API и консольным интерфейсом. Проверим, что они действительно читают и изменяют одни данные.</Lead>
        <LinkedNotes variant="connected" items={[
          { title: "Уже есть", description: "Planner хранит задачи в SQLite; интерфейсы используют короткие SQL Session." },
          { title: "Проверим", description: "Выберем отдельный файл и пройдём путь записи через API и изменения через новый процесс CLI." },
          { title: "Получим", description: "Сохраним наблюдения о двух задачах для следующего исследования схемы." },
        ]} />
        <p>Принятая версия показывает, что проект доступен, но не заменяет наш собственный запуск. Можем ли мы назвать абсолютный путь учебной базы и объяснить, как оба процесса получат этот адрес? Если нет, сначала восстановим окружение и запуск по README проекта. Ответ <code>/health</code> подтверждает лишь доступность HTTP-процесса, а не чтение базы.</p>
      </Section>
      <Section number="01" title="Какая база получит запись">
        <Lead>Прежде чем писать данные, проверим путь в каждом терминале.</Lead>
        <p><code>load_settings()</code> читает <code>DATABASE_URL</code> из окружения. Файл <code>.env</code> загружается без замены уже заданной переменной. Если переменной нет, используется <code>project/data/planner.sqlite3</code>. Это может быть рабочий файл, поэтому явно выбираем другой. Относительный путь нормализуется относительно корня <code>project/</code>, независимо от текущей папки терминала.</p>
        <p>Например, если корень проекта <code>C:/work/project</code>, адрес <code>sqlite:///data/block17/demo.sqlite3</code> указывает на файл <code>C:/work/project/data/block17/demo.sqlite3</code>. Префикс <code>sqlite:///</code> входит в URL SQLAlchemy, но не в имя файла. Реальный абсолютный путь зависит от расположения нашего проекта.</p>
        <p>В двух отдельных окнах PowerShell перейдём в один <code>project/</code> и в каждом выполним команды ниже. <code>.venv/Scripts/python.exe</code> запускает интерпретатор подготовленного окружения; <code>-c</code> выполняет короткий код. Повторяем установку переменной в каждом окне до запуска процесса:</p>
        <CodeBlock code={`$env:DATABASE_URL = 'sqlite:///data/block17/demo.sqlite3'
.venv/Scripts/python.exe -c "from app.core.config import load_settings; print(load_settings().database_url)"`} />
        <p>Сравним напечатанный нормализованный URL с ожидаемым абсолютным файлом в обоих окнах. Значение переменной в одном окне не меняет уже запущенный процесс или окружение другого окна. Одинаковый порт тоже не доказывает общий файл. Для уже созданного файла команда PowerShell `Resolve-Path data/block17/demo.sqlite3` показывает его абсолютный путь; сравним его с путём в URL до SQL-записи. Если файл уже содержит неизвестные данные или пути различаются, остановимся до записи и выберем другой новый путь, ничего не удаляя.</p>
        <p>Первая проба: зададим в обоих окнах другой новый путь внутри <code>data/block17/</code>, выведем настройки и объясним, где окажется файл. Эта проверка пока не создаёт схему.</p>
      </Section>
      <Section number="02" title="Два процесса и одна запись">
        <Lead>Явная инициализация готовит пустую схему, а новый процесс показывает сохранение в файле.</Lead>
        <p>В демонстрации ниже используем новый отсутствующий <code>data/block17/demo.sqlite3</code>. Из <code>project/</code> сначала проверим отсутствие файла, создадим только каталог и зададим URL в каждом из двух терминалов. Если файл существует, выберем другое новое имя и согласованно заменим его в командах.</p>
        <CodeBlock code={`Test-Path data/block17/demo.sqlite3
New-Item -ItemType Directory -Force data/block17 | Out-Null
$env:DATABASE_URL = 'sqlite:///data/block17/demo.sqlite3'
.venv/Scripts/python.exe -c "from app.core.config import load_settings; print(load_settings().database_url)"
.venv/Scripts/python.exe -m app.DBase.init_db`} />
        <p><code>Test-Path</code> возвращает <code>False</code> для отсутствующего файла; <code>New-Item</code> создаёт каталог, <code>-Force</code> допускает уже существующий каталог, а <code>Out-Null</code> скрывает его служебный вывод. Команда с <code>-m</code> запускает модуль проекта. Она создаёт отсутствующие таблицы через <code>create_all</code>, но не исправляет уже существующую схему и не импортирует данные.</p>
        <p>В первом терминале из <code>project/</code> запустим API командой ниже. Параметр `--host` выбирает локальный адрес, а `--port` номер порта. Порт должен быть свободен: убедимся, что команда осталась работать без ошибки привязки и ответ на адресе принадлежит этому запущенному процессу. Если занят, выберем свободный порт и заменим его во всех адресах.</p>
        <CodeBlock code={`.venv/Scripts/python.exe -m uvicorn app.api:app --host 127.0.0.1 --port 8000`} />
        <p>Откроем <code>http://127.0.0.1:8000/docs</code>. Это локальная интерактивная документация API. В GET <code>/tasks</code> нажмём Try it out (попробовать), затем Execute (выполнить): список новой базы пуст, ответ 200. В POST <code>/tasks</code> те же кнопки позволяют отправить тело ниже; ответ 201 содержит созданную задачу и её настоящий <code>id</code>.</p>
        <CodeBlock code={`{"title": "Разобрать карты", "priority": 2}`} />
        <p>GET <code>/tasks/&#123;task_id&#125;</code> принимает полученный ID и возвращает <code>id</code>, <code>title</code>, <code>priority</code>, <code>is_done</code>. Во втором терминале с тем же URL запустим <code>.venv/Scripts/python.exe -m app.main</code>. В меню CLI, а не в PowerShell, введём <code>find</code>, затем ID, после этого <code>done</code> и тот же ID; <code>exit</code> завершает CLI. Запустим CLI заново и через <code>find</code> прочитаем задачу: статус выполнен. Повторный GET по ID покажет то же публичное состояние.</p>
        <p>API открывает Session на запрос, CLI на распознанную команду. Это отдельные короткие рабочие сеансы, а сохранённое состояние остаётся в файле. Первая проба: повторим переход с другой синтетической задачей в другом новом пробном файле, закроем CLI и откроем новый процесс. Сравним ID и статус, а не только HTTP-код.</p>
      </Section>
      <Section number="03" title="Внутренние поля и безопасное наблюдение">
        <Lead>Публичный ответ не показывает <code>tags</code> и <code>title_normalized</code>. Для учебной проверки прочитаем их отдельно через SQL.</Lead>
        <p>SQL <code>SELECT</code> читает строки, <code>UPDATE</code> меняет их, а <code>WHERE id = ?</code> ограничивает изменение одной записью. Без WHERE изменятся все строки. Знак вопроса передаёт значение отдельно от текста SQL. <code>json.dumps</code> превращает список строк в JSON-текст, понятный SQLite и модели Planner. Это только подготовка синтетических данных, не новый публичный интерфейс tags.</p>
        <p>Полный независимый пример создаёт отдельный новый файл <code>sample with spaces.sqlite3</code> и две учебные строки. Сохраним его как <code>sample_sql.py</code> в <code>project/</code> и запустим <code>.venv/Scripts/python.exe sample_sql.py</code>. Если файл образца уже есть, выберем другое новое имя в коде. Пример не обращается к Planner:</p>
        <CodeBlock code={`import json
import sqlite3
from pathlib import Path

path = Path('data/block17/sample with spaces.sqlite3').resolve()
path.parent.mkdir(parents=True, exist_ok=True)
with path.open('xb'):
    pass  # резервируем новое имя; существующий файл не перезаписываем
con = sqlite3.connect(path)
try:
    con.execute('CREATE TABLE notes (id INTEGER PRIMARY KEY, tags TEXT NOT NULL)')
    con.executemany('INSERT INTO notes VALUES (?, ?)', [(1, '[]'), (2, '[]')])
    con.commit()
finally:
    con.close()

uri = path.as_uri() + '?mode=rw'
con = sqlite3.connect(uri, uri=True)
try:
    print('до:', con.execute('SELECT id, tags FROM notes ORDER BY id').fetchall())
    cursor = con.execute('UPDATE notes SET tags = ? WHERE id = ?',
                         (json.dumps(['карта'], ensure_ascii=False), 1))
    if cursor.rowcount != 1:
        raise ValueError('Ожидалась одна строка')
    con.commit()
except Exception:
    con.rollback()
    raise
finally:
    con.close()
con = sqlite3.connect(uri, uri=True)
try:
    print('после:', con.execute('SELECT id, tags FROM notes ORDER BY id').fetchall())
finally:
    con.close()`} />
        <p>В примере `mkdir(..., exist_ok=True)` создаёт каталог при необходимости, `open("xb")` занимает только новое имя, а `executemany` добавляет несколько подготовленных строк. `fetchall()` возвращает все найденные строки, `ORDER BY id` задаёт порядок. `try`, `except` и `finally` позволяют при ошибке отменить работу и закрыть соединение. До изменения обе строки содержат <code>[]</code>; после первая содержит JSON <code>["карта"]</code>, вторая остаётся <code>[]</code>. <code>Path.resolve()</code> получает абсолютный путь, <code>as_uri()</code> кодирует пробелы, а <code>mode=rw</code> запрещает незаметно создать отсутствующий файл. Это SQLite URI, не SQLAlchemy URL. <code>uri=True</code> включает разбор URI. <code>rowcount</code> проверяет число затронутых строк; <code>commit</code> сохраняет транзакцию, <code>rollback</code> отменяет незавершённое изменение при ошибке, <code>close</code> закрывает соединение. Затем новое соединение подтверждает сохранение.</p>
        <p>Попробуем на отдельном новом образце изменить вторую строку другим списком, сначала прочитав обе строки, и после закрытия соединения убедимся, что первая не изменилась. Если ID отсутствует, <code>rowcount</code> равен нулю: не делаем commit, проверяем адрес и ID. Для Planner сначала проверяем выбранный путь, затем подставляем таблицу <code>tasks</code>, реальный ID и читаем все шесть полей: <code>id, title, priority, is_done, tags, title_normalized</code>.</p>
      </Section>
      <Section number="04" title="Ошибка и свидетельство">
        <Lead>Код ответа и наблюдаемое состояние отвечают на разные вопросы.</Lead>
        <p>На демонстрационной базе запомним ID из GET <code>/tasks</code> и число строк. В POST <code>/tasks</code> отправим <code>{'{"title": "Проверить отказ", "priority": 9}'}</code>. Приоритет должен быть целым от 1 до 5, поэтому ожидаем 422. Повторный GET и сравнение ID и количества показывают, не добавилась ли запись. Сам код 422 этого сравнения не заменяет.</p>
        <p>Из <code>project/</code> запускаем <code>.venv/Scripts/python.exe -m pytest -q</code>: <code>-m pytest</code> запускает установленный тестовый инструмент, <code>-q</code> сокращает вывод. Сохраняем фактический итог или ошибку. Изолированные тесты используют собственные временные базы, а ручной сценарий проверяет выбранный файл. Прежний прогон не является нашим результатом.</p>
      </Section>
      <Section number="05" title="Что мы будем делать в практике">
        <Lead>Теперь подготовим исходную учебную базу и зафиксируем свидетельства её состояния.</Lead>
        <LinkedNotes variant="connected" items={[
          { title: "Выберем адрес", description: "Проверим новый файл и одинаковый URL в двух терминалах до создания схемы." },
          { title: "Сравним данные", description: "Создадим две разные задачи, подготовим tags и проверим переход API и CLI по всем полям." },
          { title: "Проверим отказ", description: "Сравним ID после неверного запроса, запустим тесты и сохраним опись для следующего шага." },
        ]} />
        <Callout tone="info">Работаем только с синтетическими данными внутри <code>project/data/block17/</code>. При неожиданном пути, существующем файле или неверном числе строк остановимся и выясним причину до продолжения.</Callout>
        <p>В конце остановим API и CLI, закроем соединения и сохраним путь, URL, наблюдаемые значения и результат тестов. Это исходная база, ещё не резерв и не миграция.</p>
      </Section>
    </RichLesson>
  );
}
