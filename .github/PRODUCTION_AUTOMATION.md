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

## Что проверяет workflow

- `npm ci` и production-сборку frontend;
- наличие `/platform/assets/` в готовом `index.html`;
- `200` от `/platform/` и `/platform/learning/tracks` после выкладки;
- совпадение опубликованного asset hash с ожидаемым.

Если меняется `requirements.txt`, workflow намеренно не продвигает релиз:
зависимости общей venv нужно обновить вручную один раз, иначе безопаснее оставить
production на предыдущей версии.
