# Pymentor — архитектура и деплой

Документ описывает, как устроены лендинг и платформа на проде, почему именно так,
и как выкатывать обновления.

---

## 1. Два проекта, два репозитория

| Проект | Репозиторий | Что это | Адрес на проде |
|---|---|---|---|
| **Лендинг** | `github.com/unikoff/pymentor` | Flask: посадочная страница, форма заявок (доставка в Telegram) | `https://pymentor.ru/` |
| **Платформа** | `github.com/unikoff/Pymentor_platform` | FastAPI (backend) + React/Vite (frontend): уроки, задачи, брони, админка | `https://pymentor.ru/platform/` |

Это **разные проекты с разной историей**, но на проде они работают **в одном процессе**.
Почему — см. следующий раздел.

---

## 2. Главное ограничение, которое определило всю схему

Хостинг — **шаред** (reg.ru, панель ISPmanager, пользователь `u3343606`, сервер `server292`).
Из него следует:

| Ограничение | Последствие |
|---|---|
| **Разрешён только 1 сайт** | Нельзя сделать отдельный сайт/поддомен под платформу. Оба приложения обязаны жить под одной точкой входа |
| **Нет root** | Нельзя поставить свой nginx / systemd / Redis. Только то, что даёт панель |
| **Python-приложения только через Passenger** | Точка входа — `passenger_wsgi.py`, отдающий WSGI-объект `application` |
| **Мало памяти** | **Сервер не может собрать фронт** — `npm run build` падает с `WebAssembly Out of memory`. Поэтому `dist` собирается локально и коммитится в git |
| Системный `python3` = 3.8.6 | Используем `/usr/bin/python3.12` явно |
| Системный `node` = v10 (2021) | Для сборки на сервере не годится (Vite 8 требует Node 20+). Сборка локальная |

> Попытка развернуть платформу на поддомене `platform.pymentor.ru` провалилась именно
> из-за лимита в 1 сайт: поддомен подхватывался wildcard-алиасом `*.pymentor.ru`
> основного сайта и отдавал лендинг.

---

## 3. Как устроено взаимодействие

### Точка входа

ISPmanager знает про **один сайт** `pymentor.ru` с корнем `/www/pymentor.ru` и
обработчиком **Python** (Passenger). Passenger запускает единственный файл:

```
~/www/pymentor.ru/passenger_wsgi.py
```

Он делает четыре вещи:

1. **Перезапускается под venv** — `os.execl` в `~/www/pymentor.ru/.venv/bin/python` (Python 3.12).
   Панельный интерпретатор нужен только чтобы прочитать эти строки и передать управление.
2. **Создаёт Flask-приложение** — `from app.main import create_app`.
3. **Находит платформу рядом** — `../Pymentor_platform/backend` добавляется в `sys.path`,
   оттуда импортируется FastAPI-приложение (`from main import app`).
4. **Склеивает оба приложения**:

```python
application = DispatcherMiddleware(
    flask_app,                                   # всё остальное
    {"/platform": ASGIMiddleware(platform_app)}  # платформа
)
```

`DispatcherMiddleware` (из Werkzeug, приезжает вместе с Flask) **срезает префикс**
`/platform`, поэтому FastAPI продолжает видеть свои привычные `/user`, `/learning`,
`/admin` — **бэкенд платформы ради этой схемы менять не пришлось**.
`ASGIMiddleware` (пакет `a2wsgi`) переводит ASGI-приложение FastAPI в WSGI,
который только и умеет Passenger.

### Поток запроса

```
Браузер
  │  https://pymentor.ru/...
  ▼
nginx (443, SSL Let's Encrypt)
  ▼
Apache + Phusion Passenger (127.0.0.1:8080)
  ▼
passenger_wsgi.py   ← ОДИН процесс, ОДНА venv (Python 3.12)
  │
  ├── /                     → Flask (лендинг, шаблоны, /api/form)
  │
  └── /platform/*           → DispatcherMiddleware срезает "/platform"
                              → a2wsgi → FastAPI
                                 ├── /assets/*                  → StaticFiles (frontend/dist/assets)
                                 ├── /user/*, /learning/*, /admin/*  → API платформы
                                 └── всё остальное              → index.html (SPA-роутинг)
```

### Почему фронт знает про префикс

Фронт собирается с `VITE_BASE=/platform/`, из-за чего:

- **Ассеты** в `index.html` ссылаются на `/platform/assets/...`
- **API-запросы** префиксуются в одном месте — [`apiRequest`](frontend/src/main.tsx):

```ts
const API_PREFIX = import.meta.env.BASE_URL.replace(/\/+$/, "");  // "/platform" на проде, "" в dev
await fetch(API_PREFIX + url, ...)
```

В dev база остаётся `/`, префикс пустой, и всё работает через Vite-прокси как раньше.
**Одна и та же кодовая база** годится и для dev, и для прода.

### Раскладка на сервере

```
/var/www/u3343606/data/www/            (= ~/www)
│
├── pymentor.ru/                ← корень сайта, ЕДИНСТВЕННАЯ точка входа
│   ├── passenger_wsgi.py       ← склейка Flask + платформа
│   ├── app/                    ← код лендинга
│   ├── .env                    ← секреты лендинга (в git НЕ хранится)
│   ├── .venv/                  ← ОДНА venv на оба приложения (Python 3.12)
│   └── tmp/restart.txt         ← touch по нему = перезапуск всего
│
└── Pymentor_platform/          ← ВНЕ веб-корня (недоступен из браузера — так безопаснее)
    ├── backend/
    │   ├── main.py             ← FastAPI: API + раздача dist
    │   └── test.db             ← SQLite (в git НЕ хранится)
    ├── frontend/dist/          ← готовый билд, приезжает ИЗ GIT
    └── .venv/                  ← в проде не используется; нужна для CLI-скриптов
```

> **Важно:** каталог платформы лежит **вне** `pymentor.ru/`, поэтому исходники,
> `.git` и `test.db` физически недоступны по HTTP.

> **Про две venv:** прод работает на venv **лендинга** (`pymentor.ru/.venv`) — там
> установлены зависимости обоих проектов. Venv платформы (`Pymentor_platform/.venv`)
> осталась от прежней схемы и используется только для скриптов вроде `make_admin.py`.

### База и авторизация

- **SQLite** — `backend/test.db`. Схема создаётся сама при импорте (`ensure_schema()` в `main.py`).
- **Сессии — в SQLite**, таблица `sessions`. Cookie `session` (`httponly`, `samesite=lax`).
- **Redis НЕ используется.** Код в `backend/DataBase/session.py` — заготовка на будущее,
  нигде не импортируется. Пакет `redis` в зависимостях тоже не нужен.
- **CORS не нужен**: лендинг и платформа на одном origin, cookie ходит сама собой.

---

## 4. Локальная разработка

```bash
# Backend платформы
cd backend && ../.venv/Scripts/python -m uvicorn main:app --host 127.0.0.1 --port 8001

# Frontend платформы (в другом окне)
cd frontend && npm run dev        # http://127.0.0.1:5173
```

Или разом: `start.bat` (Windows) / `start.sh` (Linux).

В dev фронт крутит Vite, а `/user`, `/learning`, `/admin` он проксирует на `127.0.0.1:8001`
(см. `vite.config.ts`). Если папки `frontend/dist` нет — backend работает как чистое API.

---

## 5. CI/CD

**Автоматического CI/CD нет.** Ни GitHub Actions, ни вебхуков — деплой ручной, через git.
Ниже — фактический процесс.

### Ключевая особенность: `dist` лежит в git

Обычно собранный фронт в репозиторий не коммитят. Здесь — **коммитим намеренно**,
потому что **сервер физически не может собрать фронт** (не хватает памяти).
Git выступает транспортом для готового билда.

Следствие: **после любой правки фронта нужно пересобрать `dist` локально и закоммитить**,
иначе на прод уедет старый бандл.

### Обновление платформы (частый случай)

**Локально:**
```bash
# 1. Правим код

# 2. Пересобираем фронт с прод-базой (ОБЯЗАТЕЛЬНО, если трогали frontend/)
cd frontend
$env:VITE_BASE="/platform/"; npm run build     # PowerShell
# VITE_BASE=/platform/ npm run build           # bash/Linux

# 3. Коммитим (вместе с dist) и пушим
git add -A && git commit -m "..." && git push
```

> ⚠️ В Git Bash на Windows `VITE_BASE=/platform/` **ломается**: MSYS превращает
> путь в `C:/Program Files/Git/platform/`. Собирай через **PowerShell**
> (или `MSYS_NO_PATHCONV=1`).

**На сервере (одной строкой — веб-терминал ISPmanager не умеет многострочные вставки):**
```
cd ~/www/Pymentor_platform && git fetch origin -q && git reset --hard origin/main && touch ~/www/pymentor.ru/tmp/restart.txt && echo DEPLOY_OK
```

### Обновление лендинга

```
cd ~/www/pymentor.ru && git fetch origin -q && git reset --hard origin/main && touch ~/www/pymentor.ru/tmp/restart.txt && echo DEPLOY_OK
```

### Если менялись зависимости Python

Оба приложения живут в **одной** venv — ставим туда же:
```
~/www/pymentor.ru/.venv/bin/pip install -r ~/www/Pymentor_platform/requirements.txt && touch ~/www/pymentor.ru/tmp/restart.txt
```

### Перезапуск

Passenger перезапускает приложение, когда меняется `tmp/restart.txt` **корня сайта**:
```
touch ~/www/pymentor.ru/tmp/restart.txt
```
Платформа живёт в процессе лендинга, поэтому её перезапуск — это тот же файл.

### Проверка после деплоя

```
curl -skS -o /dev/null -w "landing: %{http_code}\n" https://pymentor.ru/; curl -skS https://pymentor.ru/platform/ | grep -o 'platform/assets/[^"]*'; curl -skS -o /dev/null -w "API: %{http_code}\n" https://pymentor.ru/platform/learning/tracks
```
Ждём `200`, актуальные хэши ассетов и `200` от API.
В браузере — **Ctrl+Shift+R** (хэш бандла меняется, но перестраховаться стоит).

---

## 6. Обслуживание

### Выдать админку

Аккаунт должен быть уже зарегистрирован на платформе:
```
cd ~/www/Pymentor_platform/backend && ../.venv/bin/python make_admin.py user@example.com
# снять права: ... make_admin.py user@example.com --revoke
```
После выдачи — **выйти и войти заново** (фронт берёт `is_admin` из `/user/me`).

### Посмотреть аккаунты

```
cd ~/www/Pymentor_platform/backend && ../.venv/bin/python -c "from DataBase.engine import SessionLocal; from DataBase import model as m; db=SessionLocal(); print([(u.id,u.email,u.is_admin) for u in db.query(m.User).all()])"
```

### Логи

```
tail -n 40 /var/www/u3343606/data/logs/pymentor.ru.error.log
```
Только текущий `.log` — файлы `*.gz` это сжатые архивы, `tail` покажет мусор.
В логах много `ModSecurity 403` на ботов (`/wp-admin`, `/.env`) — это фоновый шум, не ошибки.

### Откат

```
cp ~/passenger_wsgi.py.bak ~/www/pymentor.ru/passenger_wsgi.py && touch ~/www/pymentor.ru/tmp/restart.txt
```
Есть также полный архив лендинга: `~/pymentor.ru-backup.tar.gz`.

---

## 7. Грабли (проверено на своей шкуре)

| Грабля | Что делать |
|---|---|
| **Веб-терминал ISPmanager схлопывает переносы строк** в пробелы | Только однострочные команды. Никаких heredoc (`<<EOF`) — зависнет. Файлы создавать через `printf '%s\n' 'строка1' 'строка2' > файл` |
| **Сервер не собирает фронт** (`WebAssembly Out of memory`) | Собирать локально, `dist` доставлять через git |
| **Git Bash ломает `VITE_BASE=/platform/`** | Собирать через PowerShell |
| `python3` на сервере = 3.8.6 | Всегда явно `python3.12` |
| `node` на сервере = v10 | Для сборки не годится; если нужен — есть nvm с Node 20 |
| venv **нельзя переносить** между Windows и Linux | `Scripts/` vs `bin/` — пересоздавать на месте |
| `requirements.txt` был в **UTF-16** | pip на Linux его не читает. Переведён в UTF-8 — не сохраняй его через PowerShell без `-Encoding utf8` |
| `*.sh` с CRLF | `bad interpreter: bash^M`. В `.gitattributes` зафиксировано `*.sh text eol=lf` |
| Wildcard-алиас `*.pymentor.ru` | Перехватывает все поддомены и отдаёт их основному сайту |

---

## 8. Что можно улучшить

- **Автоматизировать деплой** — GitHub Actions, который собирает фронт и кладёт `dist`
  в отдельную ветку/артефакт, чтобы не коммитить билд в основную историю.
- **Миграции БД** — сейчас схема правится вручную в `ensure_schema()`; при росте
  напрашивается Alembic.
- **Уехать на VPS** — снимет разом лимит в 1 сайт, лимит памяти (можно собирать на сервере),
  даст свой nginx, systemd и отдельные процессы вместо склейки в одном.
- **Выкинуть мёртвый код** — `DataBase/session.py` (Redis) и зависимость `redis`.
