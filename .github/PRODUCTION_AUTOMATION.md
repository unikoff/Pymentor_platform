# Автоматический production-деплой

Shared-hosting не исполняет внешние команды (`git`, `tar`, `curl`) через
non-interactive SSH, хотя принимает ключ. Поэтому GitHub Actions не подключается
к хосту напрямую.

Вместо этого workflow `release-production.yml` запускается при каждом push в
`main`, собирает frontend с `VITE_BASE=/platform/`, проверяет результат и
публикует ровно этот релиз в ветку `production`. Сборка на сервере не нужна.

Хостинг один раз в минуту сравнивает текущий commit с `origin/production`. Если
появился новый commit, он делает `git reset --hard origin/production` и касается
`tmp/restart.txt`; если релизов нет, процесс не перезапускается.

## Одноразовая настройка Cron в ISPmanager

В разделе «Планировщик CRON» создать задачу:

| Field | Value |
| --- | --- |
| Schedule | `* * * * *` |
| Command | `cd /var/www/u3343606/data/www/Pymentor_platform && git fetch origin -q && current_sha=$(git rev-parse HEAD) && target_sha=$(git rev-parse origin/production) && if [ "$current_sha" != "$target_sha" ]; then git reset --hard origin/production && touch /var/www/u3343606/data/www/pymentor.ru/tmp/restart.txt; fi` |

Перед первым запуском ветка `production` ещё не существует; задача просто
завершится без изменений. Первый успешный workflow создаст её.

## Отправка уведомлений о бронировании

После выкладки версии с transactional outbox добавьте в ISPmanager отдельную
задачу cron. Существующую задачу деплоя оставьте без изменений.

| Field | Value |
| --- | --- |
| Schedule | `* * * * *` |
| Command | `cd /var/www/u3343606/data/www/Pymentor_platform/backend && /var/www/u3343606/data/www/pymentor.ru/.venv/bin/python -m services.notification_worker` |

На проде Passenger использует общую venv лендинга `pymentor.ru/.venv`.
Команда загружает
`backend/.env` и подключается к той же БД, что и приложение. Пользователь cron
должен иметь доступ на запись к каталогу backend и файлу базы SQLite.

При первом запуске приложение идемпотентно создаёт таблицы outbox и общего
cooldown Telegram через
существующий `Base.metadata.create_all`; существующие таблицы и строки эта
миграция не меняет. Перед выкладкой сохраните обычную резервную копию файла БД.
До включения расписания проверьте интерпретатор, подключение и наличие Telegram
настроек командой `--check`. Она не отправляет сообщения. Если credentials заданы
только в окружении Passenger, перенесите эти два значения в защищённый
`backend/.env` или в окружение cron; cron не наследует окружение Passenger.
Обычный запуск
обрабатывает не больше 20 событий и укладывается в бюджет около 45 секунд;
между запусками блокировка не допускает параллельную отправку. Лог хранится в
`backend/notification-worker.log` и ротируется после 2 МБ (три архива). При
расписании раз в минуту уведомление может прийти с задержкой до минуты плюс время
ожидания в очереди.

Для диагностики выполните из каталога `backend`:

```sh
/var/www/u3343606/data/www/pymentor.ru/.venv/bin/python -m services.notification_worker --check
/var/www/u3343606/data/www/pymentor.ru/.venv/bin/python -m services.notification_worker --stats
```

Согласованную копию SQLite перед миграцией создаёт отдельная команда (из backend):

```sh
/var/www/u3343606/data/www/pymentor.ru/.venv/bin/python -m services.notification_worker --backup-db /var/www/u3343606/data/booking-before-outbox.sqlite3
```

Она не создаёт таблицы в исходной БД и не перезаписывает существующий backup.
Для самого первого релиза, когда новой команды ещё нет на сервере, выполнить
backup существующим Python из каталога backend до публикации кода:

```sh
/var/www/u3343606/data/www/pymentor.ru/.venv/bin/python -c "import os, sqlite3; from pathlib import Path; from DataBase.engine import engine; assert engine.dialect.name == 'sqlite' and Path(engine.url.database).is_file(); destination='/var/www/u3343606/data/booking-before-outbox.sqlite3'; descriptor=os.open(destination, os.O_CREAT | os.O_EXCL | os.O_WRONLY, 0o600); os.close(descriptor); source=sqlite3.connect(engine.url.database); backup=sqlite3.connect(destination); source.backup(backup); backup.close(); source.close()"
```

Окончательно неудачные уведомления можно вернуть в очередь командой
`/var/www/u3343606/data/www/pymentor.ru/.venv/bin/python -m services.notification_worker --retry-failed`.
Старые ошибки не возвращаются в очередь, если более позднее событие того же слота
уже отправлено или обрабатывается: повтор нарушил бы порядок уведомлений.
Статистика показывает последние ошибки без персональных данных. Повторная
отправка после неопределённого сетевого таймаута может привести к дубликату в
Telegram.

### Порядок выкладки отдельного релиза уведомлений

1. Применить только изменения backend уведомлений, их тестов, `.gitignore` и
   этой инструкции к чистой версии проекта. Незавершённый frontend не включать.
2. Получить согласованную резервную копию SQLite через `sqlite3.Connection.backup`,
   используя `DATABASE_URL` приложения; обычное копирование работающей БД может
   дать неконсистентный снимок. Резервную копию хранить вне Git и вне web-root.
3. Выложить код штатным workflow: он запускает тесты на Python 3.12 и собирает
   frontend с `VITE_BASE=/platform/` до публикации `production`.
4. Из каталога backend запустить приведённую выше команду `--check` той же venv,
   затем добавить cron раз в минуту. До этого момента события остаются в БД.
5. Выполнить одну бронь и отмену разрешённого будущего слота; проверить ответ API,
   последующий GET слотов, оба сообщения и отсутствие ошибок в `--stats`/логе.
6. Проверить одновременные запросы на фактическом Passenger: количество его
   обработчиков и buffering нельзя подтвердить локальным тестом.

При откате остановить cron и сохранить outbox. Не повторять старые события
вслепую: старая версия снова отправляет уведомления напрямую и может создавать
дубли. Проверить ожидающие события перед возобновлением доставки; предпочтительнее
исправлять текущую версию с сохранением очереди.

## Что проверяет workflow

- `npm ci` и production-сборку frontend;
- наличие `/platform/assets/` в готовом `index.html`;
- `200` от `/platform/` и `/platform/learning/tracks` после выкладки;
- совпадение опубликованного asset hash с ожидаемым.

Если меняется `requirements.txt`, workflow намеренно не продвигает релиз:
зависимости общей venv нужно обновить вручную один раз, иначе безопаснее оставить
production на предыдущей версии.
