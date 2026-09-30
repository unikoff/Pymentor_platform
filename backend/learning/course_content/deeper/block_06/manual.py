from typing import Any

MANUAL_PRACTICE: dict[int, list[dict[str, Any]]] = {
    28: [{'title': 'Лаборатория traceback: от симптома к причине',
       'task': 'Создайте воспроизводимую цепочку вызовов, получите исключение, разберите traceback сверху и снизу, '
               'затем исправьте только корневую причину.',
       'steps': ['Создайте файл labs/traceback_28.py с функциями main(), build_task(raw_priority) и '
                 'normalize_priority(raw_priority).',
                 'main() должен вызвать build_task("high"), build_task — normalize_priority, а normalize_priority — '
                 'int(raw_priority).',
                 'Запустите python labs/traceback_28.py и сохраните полный traceback в docs/traceback-28.md.',
                 'Под traceback подпишите: тип исключения, текст ошибки, последнюю строку своего кода, порядок '
                 'вызовов main → build_task → normalize_priority и неверное предположение о raw_priority.',
                 'Создайте минимальное воспроизведение из одной строки int("high") и добавьте его в документ.',
                 'Исправьте вход на "3" или добавьте согласованную обработку ValueError. Не используйте голый '
                 'except.',
                 'Добавьте assert normalize_priority("3") == 3, снова запустите файл и создайте коммит debug: '
                 'document priority traceback.'],
       'result': 'Готово, если сохранён реальный traceback, названа корневая причина, минимальный пример '
                 'воспроизводит ту же ошибку, а исправленная программа и assert проходят.'}],
    31: [{'title': 'Разделите запуск и функции по модулям',
       'task': 'Перенесите код Console Planner минимум в три модуля и докажите, что импорт больше не запускает меню.',
       'steps': ['Создайте models.py для функций создания словаря задачи, services.py для поиска, добавления и '
                 'статистики, main.py для run() и цикла меню.',
                 'Переносите по одной функции. После каждого переноса запускайте python main.py и повторяйте '
                 'добавление и просмотр задач.',
                 'В main.py оставьте запуск только под условием if __name__ == "__main__": run().',
                 'Выполните python -c "import main". Команда должна завершиться без меню, input и пользовательского '
                 'вывода.',
                 'Выполните python main.py и проверьте, что обычный сценарий по-прежнему запускается.',
                 'Создайте docs/import-map-31.md и запишите направление main → services → models. Обратных импортов '
                 'быть не должно.',
                 'Зафиксируйте изменение коммитом refactor: split planner into modules.'],
       'result': 'Готово, если импорт main не имеет побочного запуска, python main.py работает, функции распределены '
                 'по ролям, а import-map не содержит цикла.'}],
    32: [{'title': 'Соберите пакет studyhub и запуск через -m',
       'task': 'Превратите набор модулей в пакет с понятным направлением импортов и единым способом запуска.',
       'steps': ['Создайте папку studyhub и файл studyhub/__init__.py.',
                 'Переместите main.py, models.py и services.py внутрь studyhub. Добавьте studyhub/validators.py с '
                 'normalize_title и validate_priority.',
                 'Используйте согласованные абсолютные импорты вида from studyhub.services import ... . Не '
                 'импортируйте studyhub.main из нижних модулей.',
                 'Запускайте приложение командой python -m studyhub.main из директории над пакетом.',
                 'Выполните python -c "import studyhub" и python -c "import studyhub.services". Ни одна команда не '
                 'должна запускать меню.',
                 'Намеренно создайте временный обратный импорт services → main, получите проблему или объясните '
                 'цикл, затем удалите обратный импорт.',
                 'Обновите docs/import-map-31.md до схемы main → services → models/validators и создайте коммит '
                 'refactor: package studyhub application.'],
       'result': 'Готово, если пакет запускается через python -m studyhub.main, обычные imports не имеют побочных '
                 'эффектов, а зависимости идут в одном направлении.'}]
}
