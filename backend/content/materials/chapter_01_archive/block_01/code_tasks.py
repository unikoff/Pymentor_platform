from typing import Any

CODE_TASKS: dict[int, list[dict[str, Any]]] = {
    1: [
        {
            "title": "Изменённое сообщение",
            "level": "easy",
            "mode": "script",
            "prompt": "Команда print() выводит новое сообщение из одной строки.",
            "contract": {
                "given": "Стартовый код содержит команду print(\"Привет\"); её запуск показывает исходное сообщение.",
                "todo": "Текст между кавычками заменён на Первый запуск; остальная часть команды сохранена.",
                "check": "Область вывода содержит ровно одну строку: Первый запуск."
            },
            "requirements": {
                "items": [
                    "В коде остаётся один вызов print()."
                ],
                "calls": [
                    "print"
                ]
            },
            "hints": [
                "Сначала посмотрим на исходное сообщение кнопкой запуска.",
                "Текст, который нужно изменить, находится между кавычками.",
                "После повторного запуска сравним область вывода с новым сообщением из условия."
            ],
            "starter_code": "print(\"Привет\")\n",
            "tests": [
                {
                    "name": "новый текст вывода",
                    "expected": "Первый запуск",
                    "assert": "stdout"
                }
            ],
            "reference_code": "print(\"Первый запуск\")\n"
        },
        {
            "title": "Новый порядок и комментарий",
            "level": "easy",
            "mode": "script",
            "prompt": "Итоговый вывод содержит первые два сообщения в новом порядке и не содержит закомментированную строку.",
            "contract": {
                "given": "Стартовый код содержит три команды print в заданном порядке.",
                "todo": "Первые две команды поменяны местами, а третья начинается с #.",
                "check": "Вывод состоит из двух строк: Запустим программу, затем Появится экран."
            },
            "requirements": {
                "items": [
                    "Тексты первых двух сообщений сохраняют исходное написание."
                ],
                "calls": [
                    "print"
                ]
            },
            "hints": [
                "Сначала прочитаем команды сверху вниз и назовём исходный порядок.",
                "Поменяем местами первую и вторую строки кода, не меняя текст в кавычках.",
                "Поставим # перед третьей командой и сравним итоговый вывод с прогнозом."
            ],
            "starter_code": "print(\"Появится экран\")\nprint(\"Запустим программу\")\nprint(\"Эта строка станет комментарием\")\n",
            "tests": [
                {
                    "name": "порядок и комментарий",
                    "expected": "Запустим программу\nПоявится экран",
                    "assert": "stdout"
                }
            ],
            "reference_code": "print(\"Запустим программу\")\nprint(\"Появится экран\")\n# print(\"Эта строка станет комментарием\")\n"
        },
        {
            "title": "Исправленная команда print",
            "level": "easy",
            "mode": "script",
            "prompt": "После исправления имени команды программа выводит одну строку.",
            "contract": {
                "given": "В коротком фрагменте имя print записано с переставленными буквами: prnit.",
                "todo": "Имя команды записано как print; текст сообщения оставлен без изменений.",
                "check": "В выводе появляется одна строка: Программа готова."
            },
            "requirements": {
                "items": [
                    "После исправления вызывается готовая функция print()."
                ],
                "calls": [
                    "print"
                ]
            },
            "hints": [
                "Сравним написанное имя в начале команды с print из предыдущих примеров.",
                "Изменим только перепутанные буквы в имени команды.",
                "После исправления запустим весь короткий фрагмент снова."
            ],
            "starter_code": "prnit(\"Программа готова\")\n",
            "tests": [
                {
                    "name": "сообщение после исправления",
                    "expected": "Программа готова",
                    "assert": "stdout"
                }
            ],
            "reference_code": "print(\"Программа готова\")\n"
        },
        {
            "title": "Стартовый экран StudyHub",
            "level": "easy",
            "mode": "script",
            "prompt": "Стартовый экран StudyHub выводит три заданные строки в указанном порядке.",
            "contract": {
                "given": "Редактор содержит только комментарии-подсказки; команд вывода ещё нет.",
                "todo": "Программа выводит StudyHub, Начинаем обучение и Программа запущена по одной строке.",
                "check": "Общий вывод состоит ровно из этих трёх строк и не содержит дополнительного текста."
            },
            "requirements": {
                "items": [
                    "Каждый вызов print() выводит одну из строк экрана."
                ],
                "calls": [
                    "print"
                ]
            },
            "hints": [
                "В print() передадим текст в кавычках.",
                "Каждый отдельный вызов print() выводит переданный текст с новой строки.",
                "Перед проверкой сверим весь вывод с тремя строками из условия."
            ],
            "starter_code": "# Напишем первую строку вывода\n# Затем добавим вторую строку\n# Завершим экран третьей строкой\n",
            "tests": [
                {
                    "name": "стартовый экран",
                    "expected": "StudyHub\nНачинаем обучение\nПрограмма запущена",
                    "assert": "stdout"
                }
            ],
            "reference_code": "print(\"StudyHub\")\nprint(\"Начинаем обучение\")\nprint(\"Программа запущена\")\n"
        }
    ],
    4: [
        {
            "title": "Имена и типы переданных значений",
            "level": "easy",
            "mode": "script",
            "prompt": (
                "Итоговый вывод показывает четыре значения, переданные платформой, и тип каждого в том же порядке."
            ),
            "contract": {
                "given": (
                    "Платформа создаёт source_title (str), source_priority (int), source_progress (float) и "
                    "source_done (bool). Их значения меняются в проверках."
                ),
                "todo": (
                    "Скрипт связывает source_title, source_priority, source_progress и source_done с именами "
                    "title, priority, progress и is_done. Сначала он выводит значения по одному на строку, "
                    "затем результат type() для каждого имени в том же порядке."
                ),
                "check": (
                    "Ожидаются восемь строк: четыре переданных значения, затем типы str, int, float и bool. "
                    "Проверки подставляют разные входы, поэтому фиксированные значения не подходят."
                ),
            },
            "requirements": {
                "items": [
                    "Все результаты строятся из переданных source-переменных, а не из констант из примера.",
                ],
                "names": [
                    "source_title",
                    "source_priority",
                    "source_progress",
                    "source_done",
                    "title",
                    "priority",
                    "progress",
                    "is_done",
                ],
                "calls": ["type", "print"],
            },
            "hints": [
                "Свяжем title, priority, progress и is_done с одноимёнными source-значениями.",
                "Выведем значения в порядке title, priority, progress, is_done.",
                "Чтобы получить тип, передадим имя без кавычек в type(), а его результат в print().",
            ],
            "starter_code": (
                "# source_title, source_priority, source_progress и source_done уже созданы\n"
                "# Создадим четыре переменные, выведем значения и проверим типы\n"
            ),
            "tests": [
                {
                    "name": "первая задача",
                    "namespace": {
                        "source_title": "Сделать README",
                        "source_priority": 2,
                        "source_progress": 0.0,
                        "source_done": False,
                    },
                    "expected": (
                        "Сделать README\n2\n0.0\nFalse\n<class 'str'>\n<class 'int'>\n"
                        "<class 'float'>\n<class 'bool'>"
                    ),
                    "assert": "stdout",
                },
                {
                    "name": "другие значения",
                    "namespace": {
                        "source_title": "Повторить циклы",
                        "source_priority": 4,
                        "source_progress": 37.5,
                        "source_done": True,
                    },
                    "expected": (
                        "Повторить циклы\n4\n37.5\nTrue\n<class 'str'>\n<class 'int'>\n"
                        "<class 'float'>\n<class 'bool'>"
                    ),
                    "assert": "stdout",
                },
            ],
            "reference_code": (
                "title = source_title\n"
                "priority = source_priority\n"
                "progress = source_progress\n"
                "is_done = source_done\n"
                "print(title)\n"
                "print(priority)\n"
                "print(progress)\n"
                "print(is_done)\n"
                "print(type(title))\n"
                "print(type(priority))\n"
                "print(type(progress))\n"
                "print(type(is_done))\n"
            ),
        }
    ],
    5: [
        {
            "title": "Рассчитаем время по переданным значениям",
            "level": "easy",
            "mode": "script",
            "prompt": (
                "Код преобразует raw_lessons в целое число и рассчитывает учебные минуты, общее время, "
                "полные часы и остаток. Значения поступают от платформы и меняются между проверками."
            ),
            "contract": {
                "given": (
                    "Платформа передаёт raw_lessons как текст, а minutes_per_lesson и break_minutes "
                    "как числа."
                ),
                "todo": (
                    "Код получает lesson_count через int(raw_lessons), рассчитывает study_minutes, "
                    "добавляет один перерыв и выводит total_minutes, full_hours и minutes_left по одному значению на строку."
                ),
                "check": (
                    "Ожидаемый вывод строится по переданным значениям. Проверки меняют входы, включая "
                    "границы полного часа."
                ),
            },
            "requirements": {
                "names": [
                    "raw_lessons",
                    "minutes_per_lesson",
                    "break_minutes",
                    "lesson_count",
                    "study_minutes",
                    "total_minutes",
                    "full_hours",
                    "minutes_left",
                ],
                "calls": ["int", "print"],
            },
            "hints": [
                "Платформа уже передала raw_lessons как текст. Преобразуем его до умножения.",
                "Добавим один break_minutes к study_minutes, затем разделим total_minutes на 60 через // и %.",
            ],
            "starter_code": (
                "# Платформа создаёт raw_lessons, minutes_per_lesson и break_minutes\n"
                "# Рассчитаем total_minutes, full_hours и minutes_left\n"
            ),
            "tests": [
                {
                    "name": "расчёт с другими значениями",
                    "namespace": {"raw_lessons": "2", "minutes_per_lesson": 40, "break_minutes": 10},
                    "expected": "90\n1\n30",
                    "assert": "stdout",
                },
                {
                    "name": "расчёт меняется вместе со входом",
                    "namespace": {"raw_lessons": "3", "minutes_per_lesson": 40, "break_minutes": 10},
                    "expected": "130\n2\n10",
                    "assert": "stdout",
                },
                {
                    "name": "ноль минут",
                    "namespace": {"raw_lessons": "0", "minutes_per_lesson": 1, "break_minutes": 0},
                    "expected": "0\n0\n0",
                    "assert": "stdout",
                },
                {
                    "name": "до полного часа",
                    "namespace": {"raw_lessons": "59", "minutes_per_lesson": 1, "break_minutes": 0},
                    "expected": "59\n0\n59",
                    "assert": "stdout",
                },
                {
                    "name": "граница полного часа",
                    "namespace": {"raw_lessons": "60", "minutes_per_lesson": 1, "break_minutes": 0},
                    "expected": "60\n1\n0",
                    "assert": "stdout",
                },
                {
                    "name": "минута после полного часа",
                    "namespace": {"raw_lessons": "61", "minutes_per_lesson": 1, "break_minutes": 0},
                    "expected": "61\n1\n1",
                    "assert": "stdout",
                },
            ],
            "reference_code": (
                "lesson_count = int(raw_lessons)\n"
                "study_minutes = lesson_count * minutes_per_lesson\n"
                "total_minutes = study_minutes + break_minutes\n"
                "full_hours = total_minutes // 60\n"
                "minutes_left = total_minutes % 60\n"
                "print(total_minutes)\n"
                "print(full_hours)\n"
                "print(minutes_left)\n"
            ),
        }
    ],

}
