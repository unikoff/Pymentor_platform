@echo off
rem Local canonical Core PostgreSQL/Redis + Vite. Export required settings first.
setlocal
if not defined DATABASE_URL goto missing_environment
if not defined REDIS_URL goto missing_environment
if not defined KNOWI_REDIS_PREFIX if not defined PYMENTOR_REDIS_PREFIX goto missing_environment
if not defined KNOWI_LOGIN_RECOVERY_KEY if not defined PYMENTOR_LOGIN_RECOVERY_KEY goto missing_environment
set "PYTHONPATH=%~dp0..\services\core-api;%~dp0..\backend;%PYTHONPATH%"
if not exist "%~dp0..\.venv\Scripts\python.exe" (
    echo Create .venv and install services/core-api/requirements-runtime.txt first.
    exit /b 1
)

echo Запускаю Pymentor...
echo   - backend:  http://127.0.0.1:8001
echo   - frontend: http://127.0.0.1:5173
echo.

start "Pymentor Backend" cmd /k "cd /d "%~dp0.." && "%~dp0..\.venv\Scripts\python.exe" -X utf8 -m uvicorn pymentor_core.app.asgi:create_app --factory --host 127.0.0.1 --port 8001 --reload"

start "Pymentor Frontend" cmd /k "cd /d "%~dp0..\frontend" && npm run dev"

echo Открылись два окна. Закройте их, чтобы остановить серверы.
echo Откройте в браузере: http://127.0.0.1:5173
exit /b 0

:missing_environment
echo Export PostgreSQL DATABASE_URL, REDIS_URL, Redis prefix and login recovery key. Core does not load .env automatically.
exit /b 1
