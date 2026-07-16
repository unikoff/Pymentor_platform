#!/usr/bin/env bash
# Запуск Pymentor на Linux-сервере: бэкенд (FastAPI/uvicorn) + фронтенд (Vite).
# Аналог start.bat. Пути берутся относительно этого файла, поэтому папку
# проекта можно переносить. Первый запуск сам создаёт .venv и ставит зависимости.
#
# Использование:
#   chmod +x start.sh      # один раз
#   ./start.sh             # запустить оба сервера (Ctrl+C — остановить оба)
#
# Требования на сервере: python3 (+ venv), node/npm, запущенный Redis
# (адрес берётся из backend/.env, по умолчанию redis://localhost:6379).

set -euo pipefail

# Каталог, где лежит этот скрипт (корень проекта).
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$ROOT"

VENV_PY="$ROOT/.venv/bin/python"

echo "Запускаю Pymentor..."
echo "  - backend:  http://127.0.0.1:8001"
echo "  - frontend: http://127.0.0.1:5173"
echo

# --- 1. Бэкенд: виртуальное окружение и зависимости ---------------------------
if [ ! -x "$VENV_PY" ]; then
    echo "[setup] Создаю виртуальное окружение .venv ..."
    python3 -m venv .venv
    "$VENV_PY" -m pip install --upgrade pip
    echo "[setup] Устанавливаю зависимости backend из requirements.txt ..."
    "$VENV_PY" -m pip install -r requirements.txt
fi

# --- 2. Фронтенд: node_modules ------------------------------------------------
if [ ! -d "$ROOT/frontend/node_modules" ]; then
    echo "[setup] Устанавливаю зависимости frontend (npm install) ..."
    (cd "$ROOT/frontend" && npm install)
fi

# --- 3. Останавливаем оба процесса при выходе ---------------------------------
BACKEND_PID=""
FRONTEND_PID=""

cleanup() {
    echo
    echo "Останавливаю серверы..."
    [ -n "$BACKEND_PID" ]  && kill "$BACKEND_PID"  2>/dev/null || true
    [ -n "$FRONTEND_PID" ] && kill "$FRONTEND_PID" 2>/dev/null || true
    wait 2>/dev/null || true
}
trap cleanup INT TERM EXIT

# --- 4. Запуск бэкенда --------------------------------------------------------
(cd "$ROOT/backend" && exec "$VENV_PY" -X utf8 -m uvicorn main:app --host 127.0.0.1 --port 8001) &
BACKEND_PID=$!

# --- 5. Запуск фронтенда ------------------------------------------------------
(cd "$ROOT/frontend" && exec npm run dev) &
FRONTEND_PID=$!

echo
echo "Оба сервера запущены. Нажмите Ctrl+C, чтобы остановить."
echo "Откройте в браузере: http://127.0.0.1:5173"

# Ждём, пока работает любой из процессов; если один упадёт — выходим и глушим второй.
wait -n "$BACKEND_PID" "$FRONTEND_PID"
