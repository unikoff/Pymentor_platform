from typing import Any

MANUAL_PRACTICE: dict[int, list[dict[str, Any]]] = {
    76: [{'title': 'Подключите SQLite по устойчивому пути',
       'task': 'Создайте app/database.py. Database file должен находиться в data/studyhub.db независимо от текущей '
               'директории терминала.',
       'steps': ['Создайте папку data в корне проекта.',
                 'Получите project root через Path(__file__).resolve(), не через строку текущей директории.',
                 'Соберите абсолютный путь к data/studyhub.db.',
                 'Сформируйте SQLAlchemy URL вида sqlite:///absolute_path.',
                 "Создайте engine через create_engine с connect_args={'check_same_thread': False}.",
                 'Свяжите echo с безопасной development-настройкой, а не оставляйте True безусловно.',
                 'В scripts/check_database.py откройте engine.connect() и выполните '
                 "connection.exec_driver_sql('SELECT 1').",
                 'Запустите проверку из корня проекта.',
                 'Перейдите в другую директорию и запустите тот же скрипт через путь к файлу.',
                 'Убедитесь, что в обоих случаях используется один data/studyhub.db.'],
       'result': 'Готово, если SELECT 1 выполняется, database file находится только в data, а запуск из другой '
                 'директории не создаёт второй studyhub.db.'}],
    77: [{'title': 'Опишите первую ORM-модель Task',
       'task': 'Создайте типизированную SQLAlchemy 2.x модель без создания таблицы. На этом шаге проверяется только '
               'соответствие Python-класса будущей schema.',
       'steps': ['Создайте app/models/base.py и объявите class Base(DeclarativeBase).',
                 'Создайте app/models/task.py и импортируйте общий Base.',
                 "Объявите class Task(Base) с __tablename__ = 'tasks'.",
                 'Добавьте id: Mapped[int] как primary key.',
                 'Добавьте title: Mapped[str] с String(200), nullable=False.',
                 'Добавьте priority: Mapped[int] с nullable=False и default=1.',
                 'Добавьте is_done: Mapped[bool] с nullable=False и default=False.',
                 'Добавьте created_at: Mapped[datetime] с server_default=func.now() и nullable=False.',
                 'Не вызывайте Base.metadata.create_all внутри файла модели.',
                 'Напишите тест импорта и проверьте имена columns через Task.__table__.columns.keys().'],
       'result': 'Готово, если модель импортируется без side effects, использует один Base, а metadata содержит '
                 'таблицу tasks и пять ожидаемых columns.'}],
    78: [{'title': 'Создайте таблицу и сравните её с моделью',
       'task': 'Материализуйте metadata в disposable SQLite database и проверьте фактическую schema. Не считайте '
               'наличие Python-класса доказательством существования таблицы.',
       'steps': ['Создайте scripts/create_tables.py.',
                 'До вызова create_all импортируйте Task, чтобы таблица попала в Base.metadata.',
                 'Вызовите Base.metadata.create_all(bind=engine).',
                 'Запустите скрипт два раза: второй запуск не должен падать.',
                 'Откройте data/studyhub.db через sqlite3 или SQLite viewer.',
                 'Выполните запрос к sqlite_master и найдите CREATE TABLE tasks.',
                 'Выполните PRAGMA table_info(tasks).',
                 'Сверьте id, title, priority, is_done и created_at.',
                 'Сверьте primary key и NOT NULL.',
                 'Запишите результат в docs/sqlite-schema-check.md.'],
       'result': 'Готово, если реальная таблица совпадает с ORM-моделью, повторный create_all безопасен, а проверка '
                 'schema зафиксирована в документации.'}],
    80: [{'title': 'Свяжите одну Session с одним HTTP-request',
       'task': 'Создайте session factory, dependency get_db и POST /tasks. Глобальная Session запрещена.',
       'steps': ['В app/database.py создайте SessionFactory через sessionmaker(bind=engine, expire_on_commit=False).',
                 'Создайте get_db, которая открывает Session, отдаёт её через yield и закрывает в finally.',
                 'Создайте alias SessionDep через Annotated[Session, Depends(get_db)].',
                 'Создайте Pydantic-схемы TaskCreate и TaskRead.',
                 'В POST /tasks создайте ORM Task из TaskCreate.',
                 'Выполните session.add(task), session.commit() и session.refresh(task).',
                 'Верните TaskRead со status 201.',
                 'Через TestClient создайте задачу и проверьте, что response содержит integer id.',
                 'Откройте новую Session напрямую и найдите row по возвращённому id.',
                 'Добавьте временный счётчик открытия и закрытия dependency либо monkeypatch close в тесте и '
                 'докажите, что Session закрывается.'],
       'result': 'Готово, если POST создаёт реальную row, новая Session видит данные, а каждый request получает '
                 'собственную закрываемую Session.'}]
}
