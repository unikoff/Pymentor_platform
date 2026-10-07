"""Загрузка треков и уроков из course_content.

Структура каталога:

    course_content/
      README.md                <- инструкция для автора курса (не отдаётся студентам)
      chapter_01/  <- Python-safe имя курса; публичный ID — в track.json
        track.json
        block_00/              <- обзор и карта обучения
          План обучения.md
          Теория месяца.md
        block_01/              <- занятия и их практика
          01 - ...md
          manual.py
          code_tasks.py

Все пути в конфигах ниже указываются относительно course_content
(т.е. начинаются с папки трека).
"""

from __future__ import annotations

import hashlib
import json
import re
from pathlib import Path
from typing import Any

from learning.rich_code_tasks import get_code_tasks
from learning.rich_practice import get_manual_practice


COURSE_ROOT = Path(__file__).resolve().parent / "course_content"
YOUTUBE_MARKER_RE = re.compile(r"<!--\s*youtube\s*:\s*(.*?)\s*-->", re.IGNORECASE | re.DOTALL)
YOUTUBE_URL_RE = re.compile(
    r"(?:youtu\.be/|youtube(?:-nocookie)?\.com/(?:watch\?[^#\s]*?v=|embed/|shorts/|live/))([A-Za-z0-9_-]{11})",
    re.IGNORECASE,
)

# Порядок уроков python-трека. Файлы, которых нет в списке, идут после — по алфавиту.
LESSON_SEQUENCE = [
    "python-basics/План обучения.md",
    "python-basics/Блок 1 - Введение в Python (4 занятия)/Базовые типы данных 1.md",
    "python-basics/Блок 1 - Введение в Python (4 занятия)/Базовые типы данных 2.md",
    "python-basics/Блок 2 - Основные структуры данных (6 занятий)/Списки (Часть 1).md",
    "python-basics/Блок 2 - Основные структуры данных (6 занятий)/Списки (Часть 2).md",
    "python-basics/Блок 2 - Основные структуры данных (6 занятий)/Кортежи и множества.md",
    "python-basics/Блок 2 - Основные структуры данных (6 занятий)/Словари (Часть 1).md",
    "python-basics/Блок 2 - Основные структуры данных (6 занятий)/Словари (Часть 2).md",
    "python-basics/Блок 2 - Основные структуры данных (6 занятий)/Контрольная точка 1.md",
    "python-basics/Блок 3 - Условные операторы и циклы (5 занятий)/Условные операторы.md",
    "python-basics/Блок 3 - Условные операторы и циклы (5 занятий)/Циклы (Часть 1).md",
    "python-basics/Блок 3 - Условные операторы и циклы (5 занятий)/Циклы (Часть 2).md",
    "python-basics/Блок 4 - Функции и модули (5 занятий)/Функции (Часть 1).md",
    "python-basics/Блок 4 - Функции и модули (5 занятий)/Функции (Часть 2).md",
    "python-basics/Блок 4 - Функции и модули (5 занятий)/Модули.md",
    "python-basics/Блок 4 - Функции и модули (5 занятий)/Виртуальное окружение.md",
    "python-basics/Блок 5 - ООП/Классы, атрибуты, методы.md",
    "python-basics/Блок 5 - ООП/Наследование.md",
    "python-basics/Блок 5 - ООП/Инкапсуляция.md",
]

# Короткие подписи модулей. Ключ — имя подпапки (или имя файла в корне трека).
# Для папок без записи здесь используется само имя папки.
MODULE_LABELS = {
    "План обучения.md": "00 Старт",
    "Блок 1 - Введение в Python (4 занятия)": "01 Python",
    "Блок 2 - Основные структуры данных (6 занятий)": "02 Структуры данных",
    "Блок 3 - Условные операторы и циклы (5 занятий)": "03 Условия и циклы",
    "Блок 4 - Функции и модули (5 занятий)": "04 Функции и модули",
    "Блок 5 - ООП": "05 ООП",
}

NEW_PYTHON_TRACK_NAME = "Основы Python и мышление программиста"
PYTHON_DEEPER_TRACK_NAME = "Python глубже, файлы и структура небольшого проекта"
PLANNER_API_TRACK_NAME = "HTTP, API и FastAPI - Planner API"

NEW_PYTHON_MODULE_LABELS = {
    "План обучения.md": "00 Обзор месяца",
    "Теория месяца.md": "00 Обзор месяца",
    "01 - Как Python выполняет программу.md": "Блок 1. Старт и работа с данными",
    "02 - Терминал, файлы и запуск скрипта.md": "Блок 1. Старт и работа с данными",
    "03 - Git, GitHub и история изменений.md": "Блок 1. Старт и работа с данными",
    "03.1 - Состояния файлов, staging и diff.md": "Блок 1. Старт и работа с данными",
    "03.2 - GitHub, remote, авторизация и push.md": "Блок 1. Старт и работа с данными",
    "03.3 - Clone и получение своего проекта заново.md": "Блок 1. Старт и работа с данными",
    "04 - Переменные и базовые типы.md": "Блок 1. Старт и работа с данными",
    "05 - Числа, операции и преобразование типов.md": "Блок 1. Старт и работа с данными",
    "06 - Строки и форматирование.md": "Блок 2. Текст, логика и повторение",
    "07 - Boolean, сравнения и логика.md": "Блок 2. Текст, логика и повторение",
    "08 - Ветвления if elif else.md": "Блок 2. Текст, логика и повторение",
    "09 - Цикл for и последовательности.md": "Блок 2. Текст, логика и повторение",
    "09.1 - Накопление, счётчик и итог после цикла.md": "Блок 2. Текст, логика и повторение",
    "10 - Цикл while и проверка ввода.md": "Блок 2. Текст, логика и повторение",
    "10.1 - Повторный ввод и безопасный выход.md": "Блок 2. Текст, логика и повторение",
    "11 - Списки, кортежи и множества.md": "Блок 3. Данные проекта и функции",
    "11.1 - Другие коллекции, текст и распаковка.md": "Блок 3. Данные проекта и функции",
    "12 - Словари и модель задачи.md": "Блок 3. Данные проекта и функции",
    "12.1 - Список словарей и границы копирования.md": "Блок 3. Данные проекта и функции",
    "13 - Функции, параметры и return.md": "Блок 3. Данные проекта и функции",
    "13.1 - Результат функции, локальные имена и состояние.md": "Блок 3. Данные проекта и функции",
    "14 - Декомпозиция и чистые функции.md": "Блок 3. Данные проекта и функции",
    "15 - Ошибки, traceback и отладка.md": "Блок 3. Данные проекта и функции",
    "16 - Проектное меню и валидация.md": "Блок 4. Сборка и защита проекта",
    "16.1 - Ввод данных и границы отказа.md": "Блок 4. Сборка и защита проекта",
    "17 - Проект добавление и вывод задач.md": "Блок 4. Сборка и защита проекта",
    "17.1 - Полный вывод и пустое состояние.md": "Блок 4. Сборка и защита проекта",
    "18 - Проект поиск, статус и статистика.md": "Блок 4. Сборка и защита проекта",
    "18.1 - Поиск по части названия.md": "Блок 4. Сборка и защита проекта",
    "18.2 - Статистика и проверка согласованности.md": "Блок 4. Сборка и защита проекта",
    "19 - README, .gitignore и публикация.md": "Блок 4. Сборка и защита проекта",
    "19.1 - Проверка передачи из чистой копии.md": "Блок 4. Сборка и защита проекта",
    "20 - Контрольная точка месяца.md": "Блок 4. Сборка и защита проекта",
}

PYTHON_DEEPER_MODULE_LABELS = {
    "План обучения.md": "00 Обзор месяца",
    "Теория месяца.md": "00 Обзор месяца",
    "21 - Переход от первого месяца, разбираем Console Planner.md": "Блок 5. Функции как строительный материал",
    "22 - Функция как контракт, вход, правило, результат.md": "Блок 5. Функции как строительный материал",
    "23 - Позиционные, именованные аргументы и значения по умолчанию.md": "Блок 5. Функции как строительный материал",
    "24 - Область видимости и изменяемые объекты.md": "Блок 5. Функции как строительный материал",
    "24.1 - Состояние запуска и изменяемый default.md": "Блок 5. Функции как строительный материал",
    "25 - args, kwargs и распаковка.md": "Блок 5. Функции как строительный материал",
    "26 - Функция как значение, callbacks и замыкания.md": "Блок 5. Функции как строительный материал",
    "26.1 - Вложенная функция и замыкание.md": "Блок 5. Функции как строительный материал",
    "27 - Диагностическая обёртка существующей функции.md": "Блок 5. Функции как строительный материал",
    "27.1 - Синтаксис @ и границы применения.md": "Блок 5. Функции как строительный материал",
    "28 - Как возникает исключение и как читать traceback.md": "Блок 6. Ошибки, модули и рабочее JSON-хранение",
    "29 - try и конкретные except.md": "Блок 6. Ошибки, модули и рабочее JSON-хранение",
    "30 - else, finally, raise и собственные исключения.md": "Блок 6. Ошибки, модули и рабочее JSON-хранение",
    "30.1 - Собственная ошибка и обязательное получение задачи.md": "Блок 6. Ошибки, модули и рабочее JSON-хранение",
    "31 - Модули, импорты и точка входа.md": "Блок 6. Ошибки, модули и рабочее JSON-хранение",
    "32 - Пакеты, init.py и направление импортов.md": "Блок 6. Ошибки, модули и рабочее JSON-хранение",
    "33 - Отделить CLI от сборки.md": "Блок 6. Ошибки, модули и рабочее JSON-хранение",
    "34 - Файл как ресурс, путь, режим, with и UTF-8.md": "Блок 6. Ошибки, модули и рабочее JSON-хранение",
    "35 - Подключить загрузку и сохранение после изменения.md": "Блок 6. Ошибки, модули и рабочее JSON-хранение",
    "35.1 - Проверить форму восстановленного состояния.md": "Блок 6. Ошибки, модули и рабочее JSON-хранение",
    "35.2 - Ошибки хранения и сохранность данных.md": "Блок 6. Ошибки, модули и рабочее JSON-хранение",
    "36 - Класс, объект, init и self.md": "Блок 7. Архитектура, файлы, JSON и начало ООП",
    "36.1 - Обычная Task в настоящем пакете.md": "Блок 7. Архитектура, файлы, JSON и начало ООП",
    "36.2 - Экземпляр, атрибут класса и общие ссылки.md": "Блок 7. Архитектура, файлы, JSON и начало ООП",
    "37 - Атрибуты, методы и str.md": "Блок 7. Архитектура, файлы, JSON и начало ООП",
    "37.1 - Представление, инкапсуляция и вычисляемое property.md": "Блок 7. Архитектура, файлы, JSON и начало ООП",
    "37.2 - Task на границе словаря.md": "Блок 7. Архитектура, файлы, JSON и начало ООП",
    "38 - Инкапсуляция, геттеры, сеттеры и property.md": "Блок 7. Архитектура, файлы, JSON и начало ООП",
    "38.1 - Независимые tags и совместимость записи.md": "Блок 7. Архитектура, файлы, JSON и начало ООП",
    "38.2 - Выбор формы и базовая композиция.md": "Блок 7. Архитектура, файлы, JSON и начало ООП",
    "39 - Включить Task в существующий Planner.md": "Блок 8. Проектирование, SOLID, тесты и финальный проект",
    "39.1 - JsonStorage вокруг готового хранения.md": "Блок 8. Проектирование, SOLID, тесты и финальный проект",
    "40 - MemoryStorage и один договор.md": "Блок 8. Проектирование, SOLID, тесты и финальный проект",
    "40.1 - PlannerService и перенос чтения.md": "Блок 8. Проектирование, SOLID, тесты и финальный проект",
    "40.2 - Единое изменение и тонкий CLI.md": "Блок 8. Проектирование, SOLID, тесты и финальный проект",
    "41 - Первые тесты через pytest.md": "Блок 8. Проектирование, SOLID, тесты и финальный проект",
    "41.1 - Свежая fixture и параметризация.md": "Блок 8. Проектирование, SOLID, тесты и финальный проект",
    "41.2 - Файловая интеграция через tmp_path.md": "Блок 8. Проектирование, SOLID, тесты и финальный проект",
    "42 - Финальный проект 1, архитектура Persistent Planner.md": "Блок 8. Проектирование, SOLID, тесты и финальный проект",
    "42.1 - Регрессия команд, сохранений и безопасной сборки.md": "Блок 8. Проектирование, SOLID, тесты и финальный проект",
    "43 - Финальный проект 2, модель, сервисы и хранение.md": "Блок 8. Проектирование, SOLID, тесты и финальный проект",
    "44 - Финальный проект 3, тесты, README, GitHub Release и защита.md": "Блок 8. Проектирование, SOLID, тесты и финальный проект",
}

PLANNER_API_MODULE_LABELS = {
    "План обучения.md": "00 Обзор месяца",
    "Теория месяца.md": "00 Обзор месяца",
    "45 - Почему CLI недостаточно, клиент и сервер.md": "Блок 9. От консольной команды к HTTP",
    "46 - HTTP request, адрес, метод, headers и body.md": "Блок 9. От консольной команды к HTTP",
    "47 - HTTP response, status, headers, body и Content-Type.md": "Блок 9. От консольной команды к HTTP",
    "48 - Методы GET, POST, PUT, PATCH, DELETE.md": "Блок 9. От консольной команды к HTTP",
    "49 - REST, ресурс, endpoint и URL.md": "Блок 9. От консольной команды к HTTP",
    "50 - Path, query, body и контракт API.md": "Блок 9. От консольной команды к HTTP",
    "51 - Postman, отправляем запрос вручную.md": "Блок 10. Postman, FastAPI и Pydantic",
    "52 - Первое FastAPI-приложение, Uvicorn и Swagger.md": "Блок 10. Postman, FastAPI и Pydantic",
    "53 - GET-endpoints и ответы FastAPI.md": "Блок 10. Postman, FastAPI и Pydantic",
    "54 - Path-параметры и поиск объекта.md": "Блок 10. Postman, FastAPI и Pydantic",
    "55 - Query-параметры, фильтрация, сортировка и границы.md": "Блок 10. Postman, FastAPI и Pydantic",
    "56 - Pydantic BaseModel и request body.md": "Блок 10. Postman, FastAPI и Pydantic",
    "57 - Pydantic-валидация и ошибка 422.md": "Блок 11. Схемы, CRUD и организация приложения",
    "58 - Разные схемы, TaskCreate, TaskUpdate, TaskRead.md": "Блок 11. Схемы, CRUD и организация приложения",
    "59 - Хранилище в памяти и генерация идентификатора.md": "Блок 11. Схемы, CRUD и организация приложения",
    "60 - CRUD, создать, получить список и найти по id.md": "Блок 11. Схемы, CRUD и организация приложения",
    "61 - PUT и PATCH, полная и частичная замена.md": "Блок 11. Схемы, CRUD и организация приложения",
    "62 - DELETE, 204 и HTTPException.md": "Блок 11. Схемы, CRUD и организация приложения",
    "63 - Тесты FastAPI через TestClient и независимое состояние.md": "Блок 12. Роутеры, архитектура, тестирование и финальный проект",
    "64 - APIRouter, prefix, tags и include_router.md": "Блок 12. Роутеры, архитектура, тестирование и финальный проект",
    "65 - Финальный проект 1, контракт и архитектура Planner API.md": "Блок 12. Роутеры, архитектура, тестирование и финальный проект",
    "66 - Финальный проект 2, schemas, storage, crud и routers.md": "Блок 12. Роутеры, архитектура, тестирование и финальный проект",
    "67 - Финальный проект 3, полная CRUD-логика.md": "Блок 12. Роутеры, архитектура, тестирование и финальный проект",
    "68 - Финальный проект 4, Postman, тесты, README и GitHub Release.md": "Блок 12. Роутеры, архитектура, тестирование и финальный проект",
}

RICH_TRACK_MODULE_LABELS = {
    NEW_PYTHON_TRACK_NAME: NEW_PYTHON_MODULE_LABELS,
    PYTHON_DEEPER_TRACK_NAME: PYTHON_DEEPER_MODULE_LABELS,
    PLANNER_API_TRACK_NAME: PLANNER_API_MODULE_LABELS,
}

# New package/block names are Python-safe. This table preserves the old source
# paths and module labels used by saved progress, lesson pages, and the UI.
LEGACY_COURSE_LAYOUTS = {
    "chapter_01": {"track_id": NEW_PYTHON_TRACK_NAME, "source_dirs": {"block_00": None, "block_01": None, "block_02": None, "block_03": None, "block_04": None}},
    "chapter_02": {"track_id": PYTHON_DEEPER_TRACK_NAME, "source_dirs": {"block_00": None, "block_05": None, "block_06": None, "block_07": None, "block_08": None}},
    "chapter_03": {"track_id": PLANNER_API_TRACK_NAME, "source_dirs": {"block_00": None, "block_09": None, "block_10": None, "block_11": None, "block_12": None}},
    "chapter_04": {
        "track_id": "FastAPI, SQLite и SQLAlchemy - StudyHub Database API",
        "source_dirs": {"block_00": "00 Обзор", "block_13": "Блок 13 - FastAPI как цельное приложение (6 занятий)", "block_14": "Блок 14 - SQLite и основы SQLAlchemy (6 занятий)", "block_15": "Блок 15 - CRUD и запросы SQLAlchemy (6 занятий)", "block_16": "Блок 16 - Связи, Alembic и Database API (6 занятий)"},
    },
    "chapter_05": {
        "track_id": "Аутентификация, сессии, токены и завершение FastAPI - Personal StudyHub API",
        "source_dirs": {"block_00": "00 Обзор", "block_17": "Блок 17 - Пользователь и основы безопасности (6 занятий)", "block_18": "Блок 18 - Cookie и server-side sessions (6 занятий)", "block_19": "Блок 19 - Bearer, JWT, refresh и права (6 занятий)", "block_20": "Блок 20 - Остальные возможности и Personal StudyHub (6 занятий)"},
    },
    "chapter_06": {
        "track_id": "SQL, PostgreSQL и выбор хранилища - PostgreSQL StudyHub",
        "source_dirs": {"block_00": "00 Обзор", "block_21": "Блок 21 - SQL как язык работы с данными (6 занятий)", "block_22": "Блок 22 - PostgreSQL и перенос StudyHub (6 занятий)", "block_23": "Блок 23 - JOIN, агрегаты и транзакции (6 занятий)", "block_24": "Блок 24 - Индексы, планы запросов и модели хранения (6 занятий)"},
    },
    "chapter_07": {
        "track_id": "Асинхронность и производительность backend - Async StudyHub",
        "source_dirs": {"block_00": "00 Обзор", "block_25": "Блок 25 - Coroutine, event loop и async,await (6 занятий)", "block_26": "Блок 26 - Конкурентные задачи, timeout и cancellation (6 занятий)", "block_27": "Блок 27 - Асинхронный FastAPI и внешние HTTP-сервисы (6 занятий)", "block_28": "Блок 28 - Async SQLAlchemy, нагрузка и наблюдаемость (6 занятий)"},
    },
    "chapter_08": {
        "track_id": "Docker, CI-CD и первый стабильный деплой - Deployable StudyHub",
        "source_dirs": {"block_00": "00 Обзор", "block_29": "Блок 29 - Linux, процессы, окружения и логи (6 занятий)", "block_30": "Блок 30 - Dockerfile и контейнер приложения (6 занятий)", "block_31": "Блок 31 - Docker Compose, API, PostgreSQL и Redis (6 занятий)", "block_32": "Блок 32 - GitHub Actions, CI,CD и первый деплой (6 занятий)"},
    },
    "chapter_09": {
        "track_id": "StudyHub LMS, Redis, портфолио и собеседования - StudyHub LMS Release",
        "source_dirs": {"block_00": "00 Обзор", "block_33": "Блок 33 - Проектирование StudyHub LMS Core (6 занятий)", "block_34": "Блок 34 - Курсы, зачисление и прогресс (6 занятий)", "block_35": "Блок 35 - Redis, кеш и фоновые операции (6 занятий)", "block_36": "Блок 36 - Финальное качество, портфолио и интервью (6 занятий)"},
    },
}
MIGRATED_TRACKS_BY_ID = {layout["track_id"]: (package, layout) for package, layout in LEGACY_COURSE_LAYOUTS.items()}

# Уроки без автопроверки: студент отмечает выполнение сам кнопкой «Выполнено».
SELF_CHECK_LESSONS = {
    "python-basics/Блок 1 - Введение в Python (4 занятия)/Базовые типы данных 2.md",
    "sql-basics/01 Основы баз данных/01 Знакомство с SQL.md",
    "sql-basics/01 Основы баз данных/02 SELECT и фильтрация.md",
    "Основы Python и мышление программиста/План обучения.md",
    "Основы Python и мышление программиста/Теория месяца.md",
    "Python глубже, файлы и структура небольшого проекта/План обучения.md",
    "Python глубже, файлы и структура небольшого проекта/Теория месяца.md",
    "HTTP, API и FastAPI - Planner API/План обучения.md",
    "HTTP, API и FastAPI - Planner API/Теория месяца.md",
}


# Задания, описанные кодом (альтернатива блокам ```tests / ```starter в .md).
TASK_OVERRIDES: dict[str, list[dict[str, Any]]] = {
    "python-basics/Блок 1 - Введение в Python (4 занятия)/Базовые типы данных 1.md": [
        {
            "title": "Форматирование ФИО",
            "level": "easy",
            "prompt": (
                "Напишите функцию solve(name, surname, patronymic, age), которая возвращает строку в формате "
                "'Фамилия И.О. возраст'. Возраст нужно уменьшить на 5. Например: "
                "solve('Андрей', 'Смородин', 'Николаевич', '45') -> 'Смородин А.Н. 40'."
            ),
            "starter_code": (
                "def solve(name, surname, patronymic, age):\n"
                "    # Верните строку вида: Фамилия И.О. возраст-5\n"
                "    pass\n"
            ),
            "tests": [
                {
                    "name": "пример из урока",
                    "args": ["Андрей", "Смородин", "Николаевич", "45"],
                    "expected": "Смородин А.Н. 40",
                },
                {
                    "name": "женское имя",
                    "args": ["Мария", "Иванова", "Петровна", "30"],
                    "expected": "Иванова М.П. 25",
                },
                {
                    "name": "короткий возраст",
                    "args": ["Олег", "Сидоров", "Сергеевич", "18"],
                    "expected": "Сидоров О.С. 13",
                },
            ],
        }
    ],
}

HEADING_RE = re.compile(r"^(#{1,6})\s+(.*)$")
CODE_FENCE_RE = re.compile(r"^```")
TASK_MARKERS = ("домашнее задание", "контрольная точка", "практика для автопроверки")
TASK_TITLE_RE = re.compile(r"^задача\s*\d*\.?\s*(.*)$", re.IGNORECASE)
TESTS_FENCE_RE = re.compile(r"```tests\s*\n(.*?)```", re.DOTALL)
STARTER_FENCE_RE = re.compile(r"```starter\s*\n(.*?)```", re.DOTALL)
PYTHON_FENCE_RE = re.compile(r"```python\s*\n(.*?)```", re.DOTALL)
IGNORED_FILES = {"README.md", "Задания.md"}


def _clean_markdown(text: str) -> str:
    text = text.replace("[[", "").replace("]]", "")
    text = re.sub(r"\*\*(.*?)\*\*", r"\1", text)
    text = re.sub(r"`([^`]+)`", r"\1", text)
    text = re.sub(r"\s+", " ", text)
    return text.strip()


def _normalise_heading(text: str) -> str:
    text = _clean_markdown(text)
    text = re.sub(r"^Урок\s*:\s*", "", text, flags=re.IGNORECASE)
    return text.strip(" -")


def _read_text(path: Path) -> str:
    return path.read_text(encoding="utf-8-sig")


def _strip_generated_task_dump(text: str) -> str:
    return text.split("\n## Tasks for compiler", 1)[0]


def _extract_youtube_video(text: str, title: str) -> dict[str, str] | None:
    """Read a YouTube URL from the lesson marker at the end of Markdown."""
    marker_match = YOUTUBE_MARKER_RE.search(text)
    if marker_match is None:
        return None

    url_match = YOUTUBE_URL_RE.search(marker_match.group(1))
    if url_match is None:
        return None

    youtube_id = url_match.group(1)
    return {
        "title": f"Видео к занятию: {title}",
        "youtube_id": youtube_id,
        "embed_url": f"https://www.youtube.com/embed/{youtube_id}",
    }


def _strip_service_fences(text: str) -> str:
    """Убирает из markdown сервисные блоки ```tests и ```starter — студент их видеть не должен."""
    text = TESTS_FENCE_RE.sub("", text)
    text = STARTER_FENCE_RE.sub("", text)
    text = YOUTUBE_MARKER_RE.sub("", text)
    return text.strip()


def _module_label(path: Path, track_dir: Path, track_id: str | None = None) -> str:
    track_id = track_id or track_dir.name
    rich_module_labels = RICH_TRACK_MODULE_LABELS.get(track_id)
    if rich_module_labels is not None and path.name in rich_module_labels:
        return rich_module_labels[path.name]
    migrated = MIGRATED_TRACKS_BY_ID.get(track_id)
    if migrated is not None:
        return migrated[1]["source_dirs"].get(path.parent.name) or path.parent.name
    if path.parent == track_dir:
        return MODULE_LABELS.get(path.name, "00 Обзор")
    return MODULE_LABELS.get(path.parent.name, path.parent.name)


def _lesson_number_parts(filename: str) -> tuple[int, ...] | None:
    match = re.match(r"^(\d+(?:\.\d+)*)", filename)
    if match is None:
        return None
    return tuple(int(part) for part in match.group(1).split("."))


def _sort_key(path: Path, track_id: str | None = None) -> tuple[int, bool, tuple[int, ...], str]:
    relative = path.relative_to(COURSE_ROOT).as_posix()
    overview_order = {"План обучения.md": -2, "Теория месяца.md": -1}
    if path.name in overview_order:
        return (overview_order[path.name], False, (), relative)
    number_parts = _lesson_number_parts(path.name)
    if track_id in RICH_TRACK_MODULE_LABELS:
        if number_parts is None:
            return (999, False, (), relative)
        return (number_parts[0], len(number_parts) > 1, number_parts[1:], relative)
    try:
        return (LESSON_SEQUENCE.index(relative), False, (), relative)
    except ValueError:
        if number_parts is not None:
            return (len(LESSON_SEQUENCE) + number_parts[0], len(number_parts) > 1, number_parts[1:], relative)
        return (len(LESSON_SEQUENCE) + 999, False, (), relative)


def _collect_markdown_files(track_dir: Path, track_id: str | None = None) -> list[Path]:
    files = [
        path
        for path in track_dir.rglob("*.md")
        if path.name not in IGNORED_FILES and not path.name.startswith("Ответы")
    ]
    resolved_track_id = track_id or track_dir.name
    rich_filenames = RICH_TRACK_MODULE_LABELS.get(resolved_track_id)
    if rich_filenames is not None:
        files = [path for path in files if path.name in rich_filenames]
    else:
        migrated = MIGRATED_TRACKS_BY_ID.get(resolved_track_id)
        if migrated is not None:
            allowed_blocks = set(migrated[1]["source_dirs"])
            files = [path for path in files if path.parent.name in allowed_blocks]
    return sorted(files, key=lambda path: _sort_key(path, resolved_track_id))


def _split_paragraphs(text: str) -> list[str]:
    paragraphs: list[str] = []
    buffer: list[str] = []
    in_code = False

    for raw_line in text.splitlines():
        stripped = raw_line.strip()

        if CODE_FENCE_RE.match(stripped):
            in_code = not in_code
            continue
        if in_code:
            continue
        if HEADING_RE.match(stripped):
            if buffer:
                paragraphs.append(_clean_markdown(" ".join(buffer)))
                buffer = []
            continue
        if not stripped or stripped == "---":
            if buffer:
                paragraphs.append(_clean_markdown(" ".join(buffer)))
                buffer = []
            continue

        item = stripped.lstrip("-*0123456789. ").strip()
        if item:
            buffer.append(item)

    if buffer:
        paragraphs.append(_clean_markdown(" ".join(buffer)))

    return [paragraph for paragraph in paragraphs if paragraph]


def _extract_intro_theory(text: str) -> list[str]:
    text = YOUTUBE_MARKER_RE.sub("", text)
    before_tasks = re.split(r"\n##\s+.*?(?:Домашнее задание|Практика).*?\n", text, maxsplit=1, flags=re.IGNORECASE)
    paragraphs = _split_paragraphs(before_tasks[0])
    return paragraphs[:5] or ["Материал урока скоро будет расширен."]


def _extract_title(path: Path, text: str) -> str:
    for raw_line in text.splitlines():
        match = HEADING_RE.match(raw_line.strip())
        if match:
            return _normalise_heading(match.group(2))
    return _normalise_heading(path.stem)


def _compute_fence_mask(lines: list[str]) -> list[bool]:
    """True для строк внутри код-фенсов (включая сами ```): их нельзя считать заголовками.

    Иначе комментарий вида `# удалите "dog"` внутри ```starter обрывает блок задания.
    """
    mask: list[bool] = []
    fenced = False
    for line in lines:
        if CODE_FENCE_RE.match(line.strip()):
            mask.append(True)
            fenced = not fenced
        else:
            mask.append(fenced)
    return mask


def _extract_task_blocks(text: str) -> list[tuple[str, str]]:
    lines = text.splitlines()
    fence_mask = _compute_fence_mask(lines)
    headings: list[tuple[int, int, str]] = []
    for index, line in enumerate(lines):
        match = None if fence_mask[index] else HEADING_RE.match(line.strip())
        if match:
            headings.append((index, len(match.group(1)), _normalise_heading(match.group(2))))

    blocks: list[tuple[str, str]] = []
    for section_index, (start_index, section_level, section_title) in enumerate(headings):
        if not any(marker in section_title.lower() for marker in TASK_MARKERS):
            continue

        section_end = len(lines)
        for next_index, next_level, _ in headings[section_index + 1 :]:
            if next_level <= section_level:
                section_end = next_index
                break

        section_headings = [heading for heading in headings if start_index < heading[0] < section_end]
        for task_position, (task_index, task_level, task_title) in enumerate(section_headings):
            task_match = TASK_TITLE_RE.match(task_title)
            if task_match is None:
                continue

            task_end = section_end
            for next_index, next_level, _ in section_headings[task_position + 1 :]:
                if next_level <= task_level:
                    task_end = next_index
                    break

            title = task_match.group(1).strip() or task_title
            block = "\n".join(lines[task_index + 1 : task_end]).strip()
            if block:
                blocks.append((title, block))

    return blocks


def _extract_task_prompt(block_text: str) -> str:
    prompt_lines: list[str] = []
    in_code = False

    for raw_line in block_text.splitlines():
        stripped = raw_line.strip()
        if CODE_FENCE_RE.match(stripped):
            in_code = not in_code
            continue
        if in_code or not stripped:
            continue
        if stripped == "---":
            continue
        prompt_lines.append(stripped)

    prompt = "\n".join(prompt_lines).strip()
    return prompt or "Выполните практическое задание из урока."


def _starter_code() -> str:
    return "def solve(*args):\n    # Напишите решение здесь\n    pass\n"


def _extract_tests_from_block(block: str) -> tuple[list[dict[str, Any]], str]:
    """Вынимает из блока задания сервисный fenced-блок ```tests с JSON-тестами.

    Формат в .md (внутри секции «Домашнее задание» / «Контрольная точка»):

        ```tests
        [
          {"name": "пример", "args": [1, 2], "expected": 3},
          {"name": "вывод", "args": [5], "expected": "5", "assert": "stdout"}
        ]
        ```

    Возвращает (tests, block_без_этого_фрагмента).
    """
    tests: list[dict[str, Any]] = []

    def _consume(match: re.Match[str]) -> str:
        try:
            parsed = json.loads(match.group(1))
        except json.JSONDecodeError:
            return match.group(0)
        if isinstance(parsed, list):
            tests.extend(item for item in parsed if isinstance(item, dict))
            return ""
        return match.group(0)

    cleaned = TESTS_FENCE_RE.sub(_consume, block)
    return tests, cleaned


def _extract_starter_from_block(block: str) -> tuple[str | None, str]:
    """Вынимает сервисный fenced-блок ```starter с шаблоном кода для студента."""
    starter: str | None = None

    def _consume(match: re.Match[str]) -> str:
        nonlocal starter
        if starter is None:
            starter = match.group(1).rstrip() + "\n"
        return ""

    cleaned = STARTER_FENCE_RE.sub(_consume, block)
    return starter, cleaned


def _extract_python_starter_from_block(block: str) -> str | None:
    for match in PYTHON_FENCE_RE.finditer(block):
        candidate = match.group(1).strip()
        if re.search(r"^def\s+solve\s*\(", candidate, flags=re.MULTILINE):
            return candidate + "\n"
    return None


def build_task_revision(task: dict[str, Any]) -> str:
    """Stable revision of the complete task contract, including hidden tests.

    The client receives only this opaque digest, never the tests themselves.
    It must echo the revision when it submits code so a deployment mismatch is
    reported as a configuration error instead of grading the wrong task.
    """
    payload = {
        key: value
        for key, value in task.items()
        if key not in {"legacy_ids", "revision"}
    }
    serialized = json.dumps(
        payload,
        ensure_ascii=False,
        separators=(",", ":"),
        sort_keys=True,
        default=repr,
    )
    return hashlib.sha256(serialized.encode("utf-8")).hexdigest()


def _task_from_override(
    lesson_id: str,
    legacy_lesson_id: str,
    task_index: int,
    task: dict[str, Any],
) -> dict[str, Any]:
    return {
        "id": f"{lesson_id}-task-{task_index:02d}",
        "legacy_ids": (
            [f"{legacy_lesson_id}-task-{task_index:02d}"]
            if legacy_lesson_id != lesson_id
            else []
        ),
        "title": task["title"],
        "level": task.get("level", "easy"),
        "mode": task.get("mode", "solve"),
        "prompt": task["prompt"],
        "contract": task.get("contract"),
        "requirements": task.get("requirements", {}),
        "hints": task.get("hints", []),
        "starter_code": task.get("starter_code", _starter_code()),
        "tests": task.get("tests", []),
    }


def _tasks_for_lesson(
    relative: str,
    text: str,
    lesson_id: str,
    legacy_lesson_id: str,
    track_id: str,
    filename: str,
) -> list[dict[str, Any]]:
    if relative.endswith("План обучения.md"):
        return []

    if relative in TASK_OVERRIDES:
        source_tasks = TASK_OVERRIDES[relative]
    else:
        source_tasks = get_code_tasks(track_id, filename)

    if source_tasks:
        return [
            _task_from_override(lesson_id, legacy_lesson_id, task_index, task)
            for task_index, task in enumerate(source_tasks, start=1)
        ]

    if relative in SELF_CHECK_LESSONS:
        return []

    tasks: list[dict[str, Any]] = []
    for task_index, (title, block) in enumerate(_extract_task_blocks(text), start=1):
        tests, block = _extract_tests_from_block(block)
        starter, block = _extract_starter_from_block(block)
        starter = starter or _extract_python_starter_from_block(block)
        tasks.append(
            {
                "id": f"{lesson_id}-task-{task_index:02d}",
                "legacy_ids": (
                    [f"{legacy_lesson_id}-task-{task_index:02d}"]
                    if legacy_lesson_id != lesson_id
                    else []
                ),
                "title": title or f"Задание {task_index}",
                "level": "easy" if task_index == 1 else "medium",
                "mode": "solve",
                "prompt": _extract_task_prompt(block),
                "starter_code": starter or _starter_code(),
                "tests": tests,
            }
        )
    return tasks


def _lesson_access(path: Path, track_dir: Path, track_id: str | None = None) -> str:
    """Возвращает уровень доступа по новой воронке обучения.

    Карта обучения остаётся открытой в каждом курсе. Бесплатный старт есть
    только у первого курса: весь обзор и блок 1. После регистрации доступен
    блок 2 первого курса; все остальные занятия требуют Pro-подписку.
    """
    if path.name == "План обучения.md":
        return "free"

    if (track_id or track_dir.name) != NEW_PYTHON_TRACK_NAME:
        return "subscription"

    if path.name == "Теория месяца.md":
        return "free"

    lesson_match = re.match(r"^(\d+)", path.name)
    lesson_number = int(lesson_match.group(1)) if lesson_match else None
    if lesson_number is not None and 1 <= lesson_number <= 5:
        return "free"
    if lesson_number is not None and 6 <= lesson_number <= 10:
        return "registered"
    return "subscription"


def _lesson_status(index: int, access: str) -> str:
    if index == 0:
        return "current"
    if access == "subscription":
        return "locked"
    return "done"


def _estimate_duration(text: str, task_count: int) -> str:
    word_count = len(re.findall(r"\w+", text, flags=re.UNICODE))
    minutes = max(12, min(95, round(word_count / 55) + task_count * 5))
    if minutes >= 60:
        hours, rest = divmod(minutes, 60)
        return f"{hours} ч {rest} мин" if rest else f"{hours} ч"
    return f"{minutes} мин"


PLANNER_API_BLOCK_FOLDERS = {
    "00 Обзор месяца": "block_00",
    "Блок 9. От консольной команды к HTTP": "block_09",
    "Блок 10. Postman, FastAPI и Pydantic": "block_10",
    "Блок 11. Схемы, CRUD и организация приложения": "block_11",
    "Блок 12. Роутеры, архитектура, тестирование и финальный проект": "block_12",
}

# Явные алиасы Planner API. Для других перенесённых курсов прежний путь
# восстанавливается из LEGACY_COURSE_LAYOUTS. source_file остаётся физическим.
LESSON_SOURCE_ALIASES = {
    f"chapter_03/{PLANNER_API_BLOCK_FOLDERS[module]}/{filename}":
    f"{PLANNER_API_TRACK_NAME}/{filename}"
    for filename, module in PLANNER_API_MODULE_LABELS.items()
}


def _lesson_identity_source(relative: str) -> str:
    alias = LESSON_SOURCE_ALIASES.get(relative)
    if alias is not None:
        return alias
    parts = relative.split("/")
    if len(parts) == 3:
        migrated = LEGACY_COURSE_LAYOUTS.get(parts[0])
        if migrated is not None:
            old_module = migrated["source_dirs"].get(parts[1])
            suffix = f"{old_module}/{parts[2]}" if old_module else parts[2]
            return f"{migrated['track_id']}/{suffix}"
    return relative


def _stable_lesson_id(relative: str) -> str:
    """Стабильный идентификатор урока, независимый от позиции файла в курсе.

    Порядковый номер в списке меняется, когда в курс добавляют материал. Из-за
    этого открытая до обновления вкладка могла отправить уже несуществующий
    lesson_id. Хеш пути не зависит от сортировки и вместе с суффиксом задачи
    помещается в исторический лимит колонки progress.lesson_id (40 символов).
    """
    # Группировка Markdown по блокам не должна сбрасывать прогресс и task ID.
    relative = _lesson_identity_source(relative)
    digest = hashlib.sha256(relative.encode("utf-8")).hexdigest()[:24]
    return f"lesson-{digest}"


def _legacy_lesson_id(track_id: str, index: int) -> str:
    """ID, использовавшийся до перехода на идентификатор исходного файла."""
    return f"{track_id}-lesson-{index + 1:02d}"


def _build_lesson(
    path: Path,
    index: int,
    total: int,
    track_id: str,
    track_dir: Path,
    legacy_index: int | None = None,
) -> dict[str, Any]:
    text = _strip_generated_task_dump(_read_text(path))
    relative = path.relative_to(COURSE_ROOT).as_posix()
    identity_source = _lesson_identity_source(relative)
    lesson_id = _stable_lesson_id(relative)
    legacy_lesson_id = _legacy_lesson_id(track_id, legacy_index) if legacy_index is not None else lesson_id
    title = "Карта обучения" if path.name == "План обучения.md" else _extract_title(path, text)
    access = _lesson_access(path, track_dir, track_id)
    number_parts = _lesson_number_parts(path.name)
    if track_id in {NEW_PYTHON_TRACK_NAME, PYTHON_DEEPER_TRACK_NAME} and number_parts and not re.match(r"^\d+(?:\.\d+)*\.", title):
        display_number = ".".join(str(part) for part in number_parts)
        title = f"{display_number}. {title}"
    tasks = _tasks_for_lesson(identity_source, text, lesson_id, legacy_lesson_id, track_id, path.name)
    for task in tasks:
        task["revision"] = build_task_revision(task)
    mixed_practice_lessons = {
        "chapter_01/block_01/04 - Переменные и базовые типы.md",
        "chapter_01/block_01/05 - Числа, операции и преобразование типов.md",
        "chapter_01/block_02/06 - Строки и форматирование.md",
        "chapter_01/block_02/07 - Boolean, сравнения и логика.md",
        "chapter_01/block_02/09 - Цикл for и последовательности.md",
        "chapter_01/block_02/09.1 - Накопление, счётчик и итог после цикла.md",
        "chapter_01/block_03/11 - Списки, кортежи и множества.md",
        "chapter_01/block_03/13 - Функции, параметры и return.md",
        "chapter_01/block_03/15 - Ошибки, traceback и отладка.md",
        "chapter_02/block_05/25 - args, kwargs и распаковка.md",
    }
    manual_practice = (
        get_manual_practice(track_id, path.name)
        if not tasks or relative in mixed_practice_lessons
        else []
    )
    self_check = identity_source in SELF_CHECK_LESSONS or bool(manual_practice)
    video = _extract_youtube_video(text, title)

    return {
        "id": lesson_id,
        "legacy_id": legacy_lesson_id,
        "track": track_id,
        "module": _module_label(path, track_dir, track_id),
        "title": title,
        "duration": _estimate_duration(text, len(tasks)),
        "status": _lesson_status(index, access),
        "access": access,
        "theory": _extract_intro_theory(text),
        "theory_markdown": _strip_service_fences(text),
        "self_check": self_check,
        "manual_practice": manual_practice,
        "video": video,
        "tasks": tasks,
        "source_file": relative,
    }


def _load_track_meta(track_dir: Path) -> dict[str, Any]:
    meta_path = track_dir / "track.json"
    meta: dict[str, Any] = {}
    if meta_path.exists():
        try:
            meta = json.loads(_read_text(meta_path))
        except json.JSONDecodeError:
            meta = {}
    return {
        "id": meta.get("id", track_dir.name),
        "title": meta.get("title", track_dir.name),
        "tagline": meta.get("tagline", ""),
        "order": meta.get("order", 999),
    }


def _load_tracks() -> list[dict[str, Any]]:
    if not COURSE_ROOT.exists():
        return []

    tracks: list[dict[str, Any]] = []
    for track_dir in sorted(COURSE_ROOT.iterdir()):
        if not track_dir.is_dir() or track_dir.name == "__pycache__":
            continue
        track = _load_track_meta(track_dir)
        files = _collect_markdown_files(track_dir, track["id"])
        if not files:
            continue

        total = len(files)
        lessons = []
        legacy_index = 0
        for index, path in enumerate(files):
            number_parts = _lesson_number_parts(path.name)
            is_supplemental = number_parts is not None and len(number_parts) > 1
            current_legacy_index = None if is_supplemental else legacy_index
            if not is_supplemental:
                legacy_index += 1
            lessons.append(
                _build_lesson(
                    path,
                    index=index,
                    total=total,
                    track_id=track["id"],
                    track_dir=track_dir,
                    legacy_index=current_legacy_index,
                )
            )
        track["lessons"] = lessons
        tracks.append(track)

    tracks.sort(key=lambda t: (t["order"], t["title"]))
    return tracks


TRACKS: list[dict[str, Any]] = _load_tracks()
LESSONS: list[dict[str, Any]] = [lesson for track in TRACKS for lesson in track["lessons"]]


def _build_content_revision() -> str:
    """Отпечаток учебного контента для проверки фактически запущенного релиза."""
    payload = [
        {
            "id": lesson["id"],
            "source_file": lesson["source_file"],
            "self_check": lesson["self_check"],
            "manual_practice": lesson["manual_practice"],
            "tasks": [
                {
                    key: value
                    for key, value in task.items()
                    if key not in {"tests", "legacy_ids"}
                }
                for task in lesson["tasks"]
            ],
        }
        for lesson in LESSONS
    ]
    serialized = json.dumps(payload, ensure_ascii=False, separators=(",", ":"), sort_keys=True)
    return hashlib.sha256(serialized.encode("utf-8")).hexdigest()


CONTENT_REVISION = _build_content_revision()


def get_content_revision() -> str:
    return CONTENT_REVISION


def _is_countable(lesson: dict[str, Any]) -> bool:
    """Урок «зачётный», если у него есть практика или ручная отметка."""
    return bool(lesson["tasks"]) or bool(lesson.get("self_check"))


def get_tracks_summary() -> list[dict[str, Any]]:
    """Список треков без уроков — для переключателя на фронте."""
    return [
        {
            "id": track["id"],
            "title": track["title"],
            "tagline": track["tagline"],
            "lessons_total": len(track["lessons"]),
            "lessons_countable": sum(1 for lesson in track["lessons"] if _is_countable(lesson)),
            "countable_lesson_ids": [lesson["id"] for lesson in track["lessons"] if _is_countable(lesson)],
        }
        for track in TRACKS
    ]


def find_track(track_id: str) -> dict[str, Any] | None:
    for track in TRACKS:
        if track["id"] == track_id:
            return track
    return None


def default_track_id() -> str | None:
    return TRACKS[0]["id"] if TRACKS else None


def get_public_lessons(track_id: str) -> list[dict[str, Any]]:
    """Уроки трека для фронта.

    Не отдаём: theory_markdown (тяжёлый, есть отдельный endpoint) и tests
    (ожидаемые ответы — студент не должен видеть их в network-вкладке).
    """
    track = find_track(track_id)
    if track is None:
        return []

    lessons: list[dict[str, Any]] = []
    for lesson in track["lessons"]:
        item = {
            key: value
            for key, value in lesson.items()
            if key not in {"theory_markdown", "legacy_id"}
        }
        item["tasks"] = [
            {key: value for key, value in task.items() if key not in {"tests", "legacy_ids"}}
            for task in lesson["tasks"]
        ]
        lessons.append(item)
    return lessons


def find_lesson(lesson_id: str) -> dict[str, Any] | None:
    for lesson in LESSONS:
        if lesson["id"] == lesson_id or lesson.get("legacy_id") == lesson_id:
            return lesson
    return None


def find_task(task_id: str) -> dict[str, Any] | None:
    for lesson in LESSONS:
        for task in lesson["tasks"]:
            if task["id"] == task_id or task_id in task.get("legacy_ids", []):
                return task
    return None


def find_lesson_by_task(task_id: str) -> dict[str, Any] | None:
    for lesson in LESSONS:
        for task in lesson["tasks"]:
            if task["id"] == task_id or task_id in task.get("legacy_ids", []):
                return lesson
    return None


def get_legacy_lesson_id_map() -> dict[str, str]:
    """Соответствие позиционных ID их постоянным заменам для миграции прогресса."""
    return {
        lesson["legacy_id"]: lesson["id"]
        for lesson in LESSONS
        if lesson["legacy_id"] != lesson["id"]
    }
