from typing import Any

CODE_TASKS: dict[int, list[dict[str, Any]]] = {
    1: [
        {
            "title": "Меняем текст сообщения",
            "level": "easy",
            "mode": "script",
            "prompt": "Изменим сообщение в готовой команде print().",
            "contract": {
                "given": "В редакторе уже записано print(\"Привет\"). Сначала запустим этот вариант и посмотрим на исходный вывод.",
                "todo": "Поменяем только текст между кавычками на Первый запуск и запустим программу ещё раз.",
                "check": "После запуска увидим одну строку: Первый запуск."
            },
            "requirements": {
                "items": [
                    "Изменим только текст сообщения, сохранив остальную часть команды.",
                    "Используем один вызов print()."
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
            "title": "Исследуем порядок и комментарий",
            "level": "easy",
            "mode": "script",
            "prompt": "Исследуем порядок выполнения и комментарий на отдельном фрагменте. Перед запуском сделаем прогноз.",
            "contract": {
                "given": "В редакторе три команды print; третья сейчас тоже должна появиться в выводе.",
                "todo": "До запуска назовём три сообщения сверху вниз. Затем переставим первые две команды, добавим # перед третьей и запустим код.",
                "check": "Останутся две строки в новом порядке. Третья команда не добавит сообщение."
            },
            "requirements": {
                "items": [
                    "Тексты сообщений не меняем."
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
            "title": "Исправим опечатку в имени команды",
            "level": "easy",
            "mode": "script",
            "prompt": "Найдём опечатку в имени готовой команды и запустим короткий пример ещё раз.",
            "contract": {
                "given": "В коде записано prnit вместо знакомой команды print.",
                "todo": "Исправим только имя команды и снова запустим код.",
                "check": "В выводе появится одна строка: Программа готова."
            },
            "requirements": {
                "items": [
                    "Сохраним текст сообщения между кавычками."
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
            "prompt": "Напишем три строки стартового экрана программы StudyHub.",
            "contract": {
                "given": "Редактор содержит только комментарии-подсказки. Готовых команд вывода нет.",
                "todo": "Выведем StudyHub, Начинаем обучение и Программа запущена, сохранив этот порядок.",
                "check": "Платформа сравнит весь вывод: ожидаются три заданные строки без лишнего текста."
            },
            "requirements": {
                "items": [
                    "Точный текст и порядок строк соответствуют условию."
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
                "Свяжем четыре переменные с переданными платформой значениями и выведем их по порядку. "
                "Затем выведем тип каждого значения через type()."
            ),
            "contract": {
                "given": (
                    "Платформа создаёт source_title (str), source_priority (int), source_progress (float) и "
                    "source_done (bool). Их значения меняются в проверках."
                ),
                "todo": (
                    "Присвоим source_title, source_priority, source_progress и source_done переменным title, "
                    "priority, progress и is_done. Выведем значения по одному на строку, затем выведем "
                    "результат type() для каждой переменной в том же порядке."
                ),
                "check": (
                    "Ожидаются восемь строк: четыре переданных значения, затем типы str, int, float и bool. "
                    "Проверка использует разные значения, поэтому примеры нельзя подставить вместо входов."
                ),
            },
            "requirements": {
                "items": [
                    "Читаем значения из переданных source-переменных.",
                    "Выводим четыре значения и четыре соответствующих типа в заданном порядке.",
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
                "Преобразуем raw_lessons в целое число и рассчитаем учебные минуты, общее время, "
                "полные часы и остаток. Значения поступают от платформы и меняются между проверками."
            ),
            "contract": {
                "given": (
                    "Платформа передаёт raw_lessons как текст, а minutes_per_lesson и break_minutes "
                    "как числа."
                ),
                "todo": (
                    "Получим lesson_count через int(raw_lessons). Рассчитаем study_minutes, добавим "
                    "один перерыв и выведем total_minutes, full_hours и minutes_left по одному значению на строку."
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
