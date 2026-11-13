import { CodeBlock, Lead, LinkedNotes, RichHero, RichLesson, Section } from "../../shared";

const example = `from pathlib import Path
import sqlite3

root = Path("data/block17")
root.mkdir(parents=True, exist_ok=True)
source_path = root / "notes.sqlite3"
target_path = root / "notes-copy.sqlite3"

# Используем только новые имена: существующие файлы не заменяем.
source_path.touch(exist_ok=False)
target_path.touch(exist_ok=False)
source = sqlite3.connect(source_path)
try:
    source.execute("CREATE TABLE notes (text TEXT NOT NULL)")
    source.execute("INSERT INTO notes VALUES (?)", ("Купить бумагу",))
    source.commit()
finally:
    source.close()

source = sqlite3.connect(source_path.resolve().as_uri() + "?mode=ro", uri=True)
try:
    target = sqlite3.connect(target_path)
    try:
        result = source.backup(target)
        print("backup вернул:", result)
    finally:
        target.close()
finally:
    source.close()

copy = sqlite3.connect(target_path.resolve().as_uri() + "?mode=ro", uri=True)
try:
    print(copy.execute("SELECT text FROM notes").fetchall())
finally:
    copy.close()`;

const snapshot = `from pathlib import Path
import argparse
import os
import sqlite3
import sys


def main():
    parser = argparse.ArgumentParser(description="Учебный снимок SQLite")
    parser.add_argument("--source", required=True)
    parser.add_argument("--destination", required=True)
    parser.add_argument("--root", required=True)
    args = parser.parse_args()

    try:
        root = Path(args.root).resolve(strict=True)
        source_path = Path(args.source).resolve(strict=True)
        destination = Path(args.destination).resolve()
        if not root.is_dir() or not source_path.is_file():
            raise ValueError("Нужны существующие учебный каталог и исходный файл")
        if not source_path.is_relative_to(root) or not destination.is_relative_to(root):
            raise ValueError("Пути должны быть внутри учебного каталога")
        if source_path == destination or destination == root:
            raise ValueError("Источник и назначение должны различаться")
        if not destination.parent.is_dir():
            raise ValueError("Каталог назначения не существует")

        source = sqlite3.connect(source_path.as_uri() + "?mode=ro", uri=True)
        try:
            # O_EXCL занимает имя одной операцией и не заменяет занятый путь.
            fd = os.open(destination, os.O_CREAT | os.O_EXCL | os.O_WRONLY, 0o600)
            os.close(fd)
            target = sqlite3.connect(destination)
            try:
                source.backup(target)
            finally:
                target.close()
        finally:
            source.close()
    except (OSError, ValueError, sqlite3.Error) as error:
        print(f"Снимок не создан: {error}", file=sys.stderr)
        return 1
    print(f"Снимок создан: {destination}")
    return 0


if __name__ == "__main__":
    sys.exit(main())`;

const trial = `.\\.venv\\Scripts\\python.exe backup_lab/snapshot.py --source "data/block17/notes.sqlite3" --destination "data/block17/notes-safe.sqlite3" --root "data/block17"
$LASTEXITCODE
Set-Content -Path "data/block17/guard.txt" -Value "не заменять" -NoNewline
.\\.venv\\Scripts\\python.exe backup_lab/snapshot.py --source "data/block17/notes.sqlite3" --destination "data/block17/guard.txt" --root "data/block17"
$LASTEXITCODE
Get-Content -Raw "data/block17/guard.txt"`;

export function Lesson82() {
  return <RichLesson>
    <RichHero chip="SQLite и данные" title="Получаем согласованный снимок" intro="Сохраним отдельную копию учебной базы и разберём, что подтверждает результат команды." />
    <Section number="00" title="От описи к снимку">
      <LinkedNotes variant="connected" items={[
        { title: "Уже знаем", description: "Мы сверили фактическую схему и записали количество, ID и все поля учебных задач." },
        { title: "Теперь сохраним", description: "Назовём существующий источник, свободное назначение и учебный каталог, затем получим согласованный снимок." },
        { title: "Дальше проверим", description: "Сам снимок ещё не доказывает восстановление. Его содержимое и восстановленную копию проверим отдельно." },
      ]} />
      <p>Если путь базы, её синтетические данные или опись неизвестны, сначала вернёмся к диагностике. Не направляем команды на личную или единственную рабочую базу.</p>
    </Section>
    <Section number="01" title="Какое состояние сохраняем">
      <Lead>Снимок сохраняет согласованное состояние базы в другом файле. Позже из него можно создать ещё одну копию для проверки восстановления.</Lead>
      <p>Представим заметки: сначала в исходном файле сохранена запись «Купить бумагу», затем мы создаём снимок, а позже меняем исходник. Снимок и исходник имеют разные пути; будущая восстановленная копия получит третий путь. Наличие снимка ещё не подтверждает, что восстановление удастся.</p>
      <p>Транзакция объединяет изменения, а commit подтверждает их. Журнал SQLite помогает восстановить согласованность транзакций. В режиме WAL подтверждённые изменения могут пока находиться в отдельном файле журнала: простое копирование одного основного файла работающей базы может пропустить их. SQLite Backup API создаёт согласованную копию и при доступе других клиентов. В нашем опыте мы всё же останавливаем API и CLI, завершаем транзакции и закрываем соединения: так опись и снимок относятся к одному неподвижному состоянию.</p>
    </Section>
    <Section number="02" title="Первая проба Backup API">
      <p>Из папки <code>project/</code> сохраним этот независимый пример в новый файл <code>backup_lab/notes_demo.py</code>, предварительно создав каталог <code>backup_lab/</code>. Запустим тем же интерпретатором проекта: <code>.\.venv\Scripts\python.exe backup_lab/notes_demo.py</code> в PowerShell. В другом окружении используем путь к его Python. Для повторной пробы выберем новые имена обоих файлов и другой текст заметки; пример не заменяет существующие файлы.</p>
      <CodeBlock code={example} caption="Отдельная база заметок и её копия" />
      <p>Ожидаем две строки: <code>backup вернул: None</code> и <code>[('Купить бумагу',)]</code>. Сначала создаём и подтверждаем заметку, затем открываем два разных соединения. <code>resolve().as_uri()</code> строит корректный URI даже для пути с пробелами; <code>?mode=ro</code> и <code>uri=True</code> открывают существующий источник только для чтения. Отсутствующий файл вызовет ошибку, а не создание пустой базы. Вызов <code>source.backup(target)</code> направлен от источника к цели и возвращает <code>None</code>, а не код завершения процесса.</p>
      <p><code>finally</code> закрывает каждое соединение даже при ошибке. Контекстный менеджер самого соединения управляет транзакцией, но не закрывает соединение. Повторим пример с другой заметкой и новыми путями: какая запись осталась в полученной копии?</p>
    </Section>
    <Section number="03" title="Команда, которая не заменяет занятую цель">
      <p>Сам <code>backup()</code> не отказывает только потому, что целевая база уже существует: её содержимое может быть заменено. Подготовим учебную команду. Создадим <code>project/backup_lab/snapshot.py</code> и сохраним в нём код целиком. Он работает только внутри указанного каталога и требует существующий источник и свободное имя назначения.</p>
      <CodeBlock code={snapshot} caption="project/backup_lab/snapshot.py" />
      <p><code>argparse</code> читает обязательные именованные параметры: <code>--source</code> задаёт источник, <code>--destination</code> новый файл, <code>--root</code> границу учебного каталога. <code>resolve</code> приводит пути к абсолютному виду, <code>is_relative_to</code> проверяет их принадлежность каталогу. Существование проверяем до создания цели. <code>os.open</code> с <code>O_CREAT | O_EXCL</code> занимает имя одной операцией и отказывает, если оно занято. Внешние процессы не должны одновременно менять эти учебные каталоги или ссылки.</p>
      <p>После занятия имени открываются отдельные соединения, выполняется backup и оба соединения закрываются. Успех печатается только затем; <code>sys.exit</code> передаёт оболочке 0 при успехе или 1 при ошибке. При ошибке после создания файла может остаться частичный результат: не считаем его снимком, не удаляем и не заменяем чужие файлы. Выясним причину и для новой попытки выберем новое имя.</p>
      <p>Из <code>project/</code> выполним пробу на ранее созданных заметках. В PowerShell <code>$LASTEXITCODE</code> читаем сразу после внешней команды: 0 означает завершение без ошибки, ненулевое число означает отказ. <code>Set-Content</code> создаёт отдельный текстовый файл-сторож, а <code>Get-Content -Raw</code> читает его целиком. До пробы убедимся, что оба имени назначения ещё свободны.</p>
      <CodeBlock code={trial} caption="Успех и отказ на занятом пути в PowerShell" />
      <p>Первая команда сообщает об успехе и возвращает 0. Вторая возвращает ненулевой код, а текст сторожа остаётся «не заменять». В bash вместо <code>$LASTEXITCODE</code> сразу используем <code>echo $?</code>. Повторим отказ с другим новым именем сторожа и другим известным текстом.</p>
    </Section>
    <Section number="04" title="Что проверяем после команды">
      <p>Код 0 и новый файл подтверждают выполнение операции, но не успешное восстановление. Для исходника отдельно повторяем ранее освоенное чтение только для чтения и сверяем с описью схему, число и ID строк, а также все поля: <code>id</code>, <code>title</code>, <code>priority</code>, <code>is_done</code>, <code>tags</code>, <code>title_normalized</code>. Схема включает столбцы, ключи, ограничения, индексы и прочие учтённые объекты. Внутренние tags читаем SQL, не через API или CLI.</p>
      <p>Чтобы сравнение было предметным, повторяем те же запросы из описи: <code>sqlite_schema</code> и изученные <code>PRAGMA</code> для структуры, а для строк <code>SELECT id, title, priority, is_done, tags, title_normalized FROM tasks ORDER BY id</code>. Сравниваем значения каждой строки с записанными значениями по тому же ID; совпадение количества не доказывает совпадение данных. При отличии хотя бы одного свойства останавливаемся.</p>
      <p>В практике используем один существующий <code>project/</code>, исходник <code>data/block17/source.sqlite3</code> и новый снимок <code>data/block17/backup.sqlite3</code>, если именно эти пути были подготовлены. Если выбран другой учебный путь внутри того же каталога, сохраняем его. При неизвестном пути, ошибке или различии с описью останавливаемся и выясняем причину. После снимка передадим пути и результаты для отдельной проверки восстановления.</p>
    </Section>
  </RichLesson>;
}
