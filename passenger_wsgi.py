"""Точка входа Passenger для Pymentor-платформы (FastAPI).

Аналог passenger_wsgi.py у Flask-лендинга, с двумя отличиями:
  1. FastAPI — это ASGI, а Passenger умеет только WSGI, поэтому оборачиваем
     приложение в a2wsgi.ASGIMiddleware.
  2. Интерпретатор берём из venv проекта (Python 3.12), созданной на сервере.

Ожидается, что этот файл лежит в корне проекта Pymentor_platform (рядом с
папками backend/ и frontend/). Если docroot поддомена — отдельная папка,
скопируйте этот файл туда и поправьте PROJECT_DIR на путь к проекту.
"""

import os
import sys

# Корень проекта (где backend/, frontend/, .venv/).
PROJECT_DIR = os.path.dirname(os.path.abspath(__file__))
BACKEND_DIR = os.path.join(PROJECT_DIR, "backend")

# 1. Перезапускаемся под интерпретатором venv (Python 3.12), если ещё не в ней.
VENV_PYTHON = os.path.join(PROJECT_DIR, ".venv", "bin", "python")
if os.path.exists(VENV_PYTHON) and os.path.realpath(sys.executable) != os.path.realpath(VENV_PYTHON):
    os.execl(VENV_PYTHON, VENV_PYTHON, *sys.argv)

# 2. Делаем пакеты backend импортируемыми (main.py, DataBase/, routers/).
sys.path.insert(0, BACKEND_DIR)

# 3. Оборачиваем ASGI-приложение FastAPI в WSGI для Passenger.
from a2wsgi import ASGIMiddleware  # noqa: E402
from main import app as _asgi_app  # noqa: E402

application = ASGIMiddleware(_asgi_app)
