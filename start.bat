@echo off
rem Запуск Pymentor: бэкенд (FastAPI) + фронтенд (Vite) в двух отдельных окнах.
rem Пути берутся относительно этого файла, поэтому папку проекта можно переносить.

echo Запускаю Pymentor...
echo   - backend:  http://127.0.0.1:8001
echo   - frontend: http://127.0.0.1:5173
echo.

start "Pymentor Backend" cmd /k "cd /d "%~dp0backend" && "%~dp0.venv\Scripts\python.exe" -X utf8 -m uvicorn main:app --host 127.0.0.1 --port 8001"

start "Pymentor Frontend" cmd /k "cd /d "%~dp0frontend" && npm run dev"

echo Открылись два окна. Закройте их, чтобы остановить серверы.
echo Откройте в браузере: http://127.0.0.1:5173
