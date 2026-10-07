from typing import Any

MANUAL_PRACTICE: dict[int | str, list[dict[str, Any]]] = {
    "39.1": [{'title': 'Переведите действующий Planner на JsonStorage',
       'task': 'Продолжите тот же Planner после перехода операций на Task. Перенесите готовое JSON-хранение в '
               'объект и передавайте его существующим действиям. Сохраните прежние команды и ошибки; '
               'MemoryStorage, PlannerService и новую команду здесь не добавляйте.',
       'tasks': [
           {'title': 'Перенесите файловый договор',
            'task': 'Соберите настройку пути, чтение и запись полного снимка в JsonStorage. Сохраните проверки, '
                    'конвертеры Task и границы StorageError.',
            'requirements': [
                'В studyhub/app/storage.py остаётся единственное файловое хранилище; второго файлового слоя нет.',
                'JsonStorage(path) сохраняет Path в конструкторе и предоставляет load() -> list[Task] и save(tasks).',
                'Поведение load_tasks/save_tasks перенесено в методы; они используют validate_loaded_tasks, Task.from_dict и Task.to_dict.',
                'Только FileNotFoundError при чтении даёт пустой список; повреждённый JSON, неверная схема и отказ '
                'доступа сохраняют StorageError с исходной причиной.',
                'Полный снимок проверяется, а JSON формируется до открытия файла на запись; родительская папка создаётся.',
                'Старая полная запись без tags совместима с договором Task; обязательные поля не получают произвольных defaults.'
            ],
            'hint': 'Мы переносим существующие тела чтения и записи в методы, а путь берём из self. Чистые проверки '
                    'можно оставить помощниками, если они не открывают файл самостоятельно.',
            'answer': {
                'explanation': 'JsonStorage становится единственным публичным файловым входом. Конструктор хранит '
                               'Path, но не открывает файл. load читает текст, декодирует и проверяет весь набор, '
                               'затем восстанавливает Task. save формирует записи и JSON до режима w, сохраняя '
                               'StorageError и причину ожидаемого отказа.',
                'steps': [
                    'Мы оставляем json, Task, StorageError и validate_loaded_tasks в существующем модуле.',
                    'Мы переносим чтение в load; только FileNotFoundError возвращает пустой список.',
                    'Мы проверяем снимок до Task.from_dict; ValueError оборачиваем в StorageError через from.',
                    'В save мы создаём записи через to_dict, проверяем их и сериализуем до открытия файла.',
                    'После обновления всех вызовов мы удаляем публичные load_tasks/save_tasks.'
                ],
                'code': '''import json
from pathlib import Path

from app.errors import StorageError
from app.models import Task


class JsonStorage:
    def __init__(self, path: Path) -> None:
        self.path = path

    def load(self) -> list[Task]:
        try:
            with self.path.open("r", encoding="utf-8") as file:
                text = file.read()
        except FileNotFoundError:
            return []
        except (OSError, UnicodeDecodeError) as error:
            raise StorageError("Не удалось прочитать файл задач") from error

        try:
            records = json.loads(text)
            validate_loaded_tasks(records)
            return [Task.from_dict(record) for record in records]
        except (json.JSONDecodeError, ValueError) as error:
            raise StorageError("Файл задач имеет неверный JSON или форму") from error

    def save(self, tasks: list[Task]) -> None:
        records = [task.to_dict() for task in tasks]
        try:
            validate_loaded_tasks(records)
        except ValueError as error:
            raise StorageError("Нельзя сохранить неверный снимок") from error

        text = json.dumps(records, ensure_ascii=False, indent=2)
        try:
            self.path.parent.mkdir(parents=True, exist_ok=True)
            with self.path.open("w", encoding="utf-8") as file:
                file.write(text)
        except OSError as error:
            raise StorageError("Не удалось записать файл задач") from error''',
                'checks': [
                    'Создание экземпляра не читает и не создаёт файл.',
                    'Повреждённый JSON не превращается в пустой Planner.',
                    'Проверка невалидного снимка идёт до режима w.',
                    'Старая запись читается, новая содержит tags, кириллица сохраняется.'
                ]
            }},
           {'title': 'Подключите storage и проверьте прежние команды',
            'task': 'Сделайте storage зависимостью операций и CLI. Каждая команда получает актуальный список, '
                    'а запись происходит только после успешного изменения.',
            'requirements': [
                'Операции и обработчики получают storage; run не хранит список всю сессию.',
                'Читающие операции не вызывают save; add сохраняет список после успешного добавления.',
                'mark_task_done сохраняет только переход False -> True; повторный done не переписывает файл.',
                'main создаёт JsonStorage с прежним рабочим путём и передаёт его в run без загрузки на старте.',
                'CLI не хранит список и не использует on_change после переключения обработчиков.',
                'На отдельном probe-файле проходят проверки прежних команд, перезапуска, ошибок и двух объектов с одним Path.'
            ],
            'hint': 'Мы прослеживаем один путь: load, прежнее действие, затем save только при новом состоянии. Сравниваем '
                    'текст probe-файла до и после читающих или ошибочных команд.',
            'answer': {
                'explanation': 'Операции сохраняют известные алгоритмы, но список получают из storage для каждой '
                               'команды. Неизвестный id продолжает давать TaskNotFoundError. Повторный done уже '
                               'не меняет Task и потому не вызывает save; CLI передаёт зависимость, но не хранит список.',
                'steps': [
                    'Мы заменяем аргумент tasks на storage и вызываем storage.load один раз на действие.',
                    'Мы обновляем доступ к Task по атрибутам, сохраняя прежние алгоритмы и результаты.',
                    'После add мы сохраняем полный список; чтение возвращает данные без записи.',
                    'В mark_task_done мы проверяем is_done до вызова mark_done и save.',
                    'Из main мы передаём storage в run и обработчики; CLI не использует callback и список запуска.'
                ],
                'code': '''# Фрагменты заменяемых функций; существующие импорты и имена моделей остаются в модулях.
# app/operations.py
def mark_task_done(storage, task_id):
    tasks = storage.load()
    task = get_task(tasks, task_id)
    if not task.is_done:
        task.mark_done()
        storage.save(tasks)
    return True


def list_tasks(storage):
    return storage.load()


# app/main.py
def main():
    data_file = Path(__file__).resolve().parents[1] / "data" / "tasks.json"
    return run(JsonStorage(data_file))''',
                'checks': [
                    'Читающие команды не меняют содержимое файла.',
                    'Неизвестный id и повторный done не вызывают save.',
                    'Успешный add и новый переход done записываются до сообщения об успехе.',
                    'Обработчики используют тот же экземпляр JsonStorage.'
                ]
            }},
           {'title': 'Подтвердите актуальность данных',
            'task': 'Проведите регрессию на отдельном JSON-пути, не заменяя пользовательские данные.',
            'requirements': [
                'Новая задача переживает перезапуск Planner с теми же id, статусом, приоритетом и tags.',
                'Файл не меняется после list/find/search/stats, неверного ввода, неизвестного id и повторного done.',
                'Повреждённый JSON и неверная форма не перезаписываются пустым списком; проверки идут на копиях.',
                'pytest, MemoryStorage, PlannerService и delete в этом блоке отсутствуют.'
            ],
            'hint': 'Мы создаём второй JsonStorage на том же пути и сравниваем результаты чтения. Байты файла до и после '
                    'читающей команды должны совпасть.',
            'answer': {
                'explanation': 'Два экземпляра не делят кеш списка: оба читают один путь заново. Чтение и ошибка '
                               'не меняют файл, а новый переход сохраняет полный снимок. Это ручная регрессия; pytest '
                               'появится в следующем этапе.',
                'steps': [
                    'Мы используем отдельный probe-файл для add, list, find, search, done и stats.',
                    'После завершения процесса мы восстанавливаем данные новым экземпляром на том же пути.',
                    'Мы сравниваем содержимое файла после читающих и ошибочных команд.',
                    'После проверки мы возвращаем тестовые данные и повторяем штатный запуск.'
                ],
                'code': '''first = JsonStorage(probe_path)
second = JsonStorage(probe_path)

before = probe_path.read_text(encoding="utf-8")
list_tasks(first)
assert probe_path.read_text(encoding="utf-8") == before

task = add_task(first, "Проверить перезапуск", 3)
restored = get_task(second.load(), task.id)
assert restored.title == task.title
assert restored.is_done is False''',
                'checks': [
                    'Новый экземпляр видит добавленную Task и её статус.',
                    'Читающие и ошибочные команды оставляют файл прежним.',
                    'Повреждённый снимок приводит к StorageError и остаётся на месте.',
                    'Прежние команды и перезапуск работают через один JSON-файл.'
                ]
            }}
       ],
       'result': 'Готово, если JsonStorage хранит один Path, операции получают актуальный список на каждую команду, '
                 'а чтения и ошибки не создают лишнюю запись. Повторный запуск и второй экземпляр подтверждают '
                 'сохранность данных и прежних ошибок.'}],
    39: [{'title': 'Planner был переведён на подготовленную Task',
       'task': 'Действующие операции и показ Planner были переведены на подготовленную Task. Функциональные load/save преобразовали объекты и словари JSON. Прежние команды и данные сохранили смысл, модель заново не создавалась.',
       'tasks': [
           {'title': 'Потребители словаря были найдены',
            'task': 'Путь задачи от CLI через операции до JSON и обратно был прослежен; потребители словаря были перечислены.',
            'requirements': [
                'Фактический код после блоков 6–7 был принят за исходную опору.',
                'В коде были найдены создание, поиск, done, stats, форматирование, load/save и проверка снимка.',
                'Вызовы функций и места с доступом к полям по ключу были отмечены.',
                'Новый storage, service и команды не добавлялись.'
            ],
            'hint': 'Частичная замена оставит Task рядом с функцией, которая всё ещё ожидает словарь.',
            'answer': {'explanation': 'Карта по исходному коду помогает изменить типы на всех границах.',
                'steps': ['Мы проследили вызовы CLI и операций.', 'Мы нашли потребителей записи и списка.', 'Мы сверили загрузку и сохранение.'],
                'code': '''# предметные операции: record["title"] -> task.title
# JSON load: Task.from_dict(record)
# JSON save: task.to_dict()''',
                'checks': ['Карта соответствует коду ученика.', 'Все найденные потребители учтены.']}},
           {'title': 'Операции и показ были переведены на Task',
            'task': 'Предметные операции и форматирование были переведены на атрибуты и методы Task; алгоритмы над списком и поведение CLI сохранились.',
            'requirements': [
                'Создание задачи использовало готовый конструктор Task и сохранило прежнее правило id.',
                'Поиск, завершение, статистика и форматирование работали с Task.',
                'Поиск по списку остался за границей модели.',
                'Вызовы всех изменённых функций были согласованы.',
                'Прежняя фабрика была удалена только после перевода её потребителей.'
            ],
            'hint': 'Task представляет одну задачу. Она не хранит весь список и не отвечает за ввод или вывод.',
            'answer': {'explanation': 'Новая внутренняя модель не требует переписывать операции над набором в методы.',
                'steps': ['Мы создали Task вместо словаря.', 'Мы заменили доступ к полям на атрибуты.', 'Мы вызвали метод модели для изменения статуса.', 'Мы обновили вызовы и форматирование.'],
                'code': '''def format_task(task: Task) -> str:
    status = "готово" if task.is_done else "в работе"
    return f"{task.id}. {task.title} | {status}"''',
                'checks': ['Операции и показ используют Task.', 'Прежние команды сохраняют смысл.']}},
           {'title': 'JSON-совместимость была сохранена и проверена',
            'task': 'Функциональные load/save восстановили Task из словарей и сохраняли словари обратно. Старая запись без tags и новая запись с tags прошли цикл на копии данных.',
            'requirements': [
                'Проверка формы снимка и уникальности id сохранилась.',
                'Старая полная запись без tags читалась по контракту готовой модели.',
                'Новая запись сохранила tags через to_dict.',
                'Повреждённый снимок отклонялся и не подменялся пустым списком.',
                'Операции add, list, find/search, done и stats были пройдены; повторный запуск восстановил состояние.',
                'JsonStorage, PlannerService, MemoryStorage и delete не добавлялись.'
            ],
            'hint': 'Конвертер отвечает за одну запись, валидатор за снимок. Для проверки была использована копия JSON.',
            'answer': {'explanation': 'Командная регрессия и перезапуск подтверждают работу цепочки от CLI до JSON.',
                'steps': ['Мы сохранили прежнюю проверку снимка.', 'Мы восстановили Task через from_dict.', 'Мы преобразовали объекты через to_dict.', 'Мы проверили старую запись, tags и перезапуск на копии.'],
                'code': '''tasks = [Task.from_dict(record) for record in records]
records = [task.to_dict() for task in tasks]''',
                'checks': ['JSON содержит словари.', 'Старая запись читается, новая сохраняет tags.', 'Ошибочный снимок отклоняется.', 'Проверены прежние команды и перезапуск.']}}
       ],
       'result': 'Операции и показ были переведены на подготовленную Task, а функциональные load/save преобразовали её в словарь и обратно. Прежние команды, проверка снимка и перезапуск сохранили смысл. Следующему занятию был передан действующий файловый путь для обёртки в JsonStorage.'}],
    40: [{'title': 'Добавьте MemoryStorage с договором JsonStorage',
        'task': 'Продолжите существующий Persistent Planner. После практики те же операции получают один выбранный storage и дают одинаковый предметный результат. Обычный запуск по-прежнему использует JsonStorage.',
        'tasks': [
            {'title': 'Реализация MemoryStorage',
             'task': 'MemoryStorage хранит начальный список задач в отдельном контейнере и реализует тот же договор load/save, что и JsonStorage.',
             'requirements': [
                 'MemoryStorage находится рядом с JsonStorage в app/storage.py.',
                 'Класс реализует __init__(tasks=None), load() и save(tasks).',
                 'Конструктор различает None и переданный пустой список.',
                 'Конструктор, load и save отделяют контейнеры через list(...), не копируя объекты Task.',
                 'PlannerService, build_service, отдельный CLI и второе файловое хранилище не добавляются.'
             ],
             'hint': 'None означает, что начальные данные не переданы. При переданном списке нужен новый контейнер даже тогда, когда список пуст. Для load и save проверяем отдельно контейнер списка и объекты внутри него.',
             'answer': {
                 'explanation': 'Конструктор создаёт свой список из переданного набора или новый пустой список. load возвращает копию контейнера, а save сохраняет копию входного контейнера. list(...) не клонирует Task, поэтому ссылки на объекты остаются общими.',
                 'steps': [
                     'Проверяем tasks is not None, чтобы отдельно обработать переданный пустой список.',
                     'Копируем контейнер при создании объекта.',
                     'Возвращаем отдельный список из load.',
                     'Сохраняем отдельный список из save и оставляем предметные операции за их текущими функциями.'
                 ],
                 'code': '''class MemoryStorage:
    def __init__(self, tasks=None):
        self._tasks = list(tasks) if tasks is not None else []

    def load(self):
        return list(self._tasks)

    def save(self, tasks):
        self._tasks = list(tasks)''',
                 'checks': [
                     'Изменение переданного конструктору списка не меняет контейнер storage.',
                     'Изменение результата load не меняет внутренний состав до save.',
                     'save сохраняет отдельный контейнер и оставляет в нём те же Task.',
                     'В классе нет поиска, CRUD или выбора пути.'
                 ]
             }},
            {'title': 'Сравнение тех же операций',
             'task': 'Существующие операции выполняют add, find, search, done и stats с JsonStorage и MemoryStorage, сохраняя прежний предметный смысл.',
             'requirements': [
                 'Используется один выбранный storage на каждый сценарий.',
                 'Начальные Task независимы, но имеют одинаковые значения.',
                 'JSON проверяется на отдельном учебном пути, не в рабочем data/tasks.json.',
                 'Предметные операции не переписываются, PlannerService не добавляется.'
             ],
             'hint': 'Сравниваем одинаковые входы и последовательность действий. Наблюдаем результат операций, а не внутреннее устройство списка или файла.',
             'answer': {
                 'explanation': 'На обоих storage выполняется одинаковая последовательность с одинаковыми начальными данными. Добавление создаёт задачу с тем же id по существующему правилу; find возвращает те же поля; search находит те же названия; done устанавливает is_done; stats возвращает одинаковые счётчики. Чтение не меняет набор. JSON проверяется на отдельном пути, а обычный запуск сохраняет JsonStorage.',
                 'steps': [
                     'Создаём независимые, но равные по значениям начальные Task.',
                     'Передаём первый storage существующим операциям и фиксируем результаты add/find/search/done/stats.',
                     'Повторяем те же входы через второй storage.',
                     'Сравниваем поля задач, найденные записи и статистику.',
                     'Проверяем штатный запуск с JsonStorage и не подменяем рабочие данные тестовыми.'
                 ],
                 'checks': [
                     'Результаты операций совпадают при одинаковых входах.',
                     'Память и файл не используются одновременно в одном сценарии.',
                     'Обычное приложение продолжает восстанавливать данные из JSON.'
                 ]
             }},
            {'title': 'Проверка границы копирования',
             'task': 'Контейнеры MemoryStorage независимы, а объекты Task внутри них остаются общими ссылками. Изменение состава списка требует save; изменение поля общей Task может быть заметно до save.',
             'requirements': [
                 'Внешний список меняется после передачи конструктору.',
                 'Результат load меняется, затем storage читается снова до save.',
                 'Поле Task меняется через mark_done, затем storage читается снова до save.',
                 'Длина контейнера и поля задачи сравниваются после каждого действия.'
             ],
             'hint': 'Проверяем по очереди сам контейнер и элемент внутри него. list(...) создаёт новый список, но не создаёт новую Task для каждой записи.',
             'answer': {
                 'explanation': 'Очистка source не затрагивает внутренний список. Добавление в результат load тоже не меняет состав storage. Но Task в обеих копиях одна и та же: вызов mark_done изменяет объект, поэтому следующий load увидит is_done=True ещё до save. Это граница поверхностной копии, а не полная изоляция или транзакция.',
                 'steps': [
                     'Создаём задачу и передаём её в MemoryStorage внутри source.',
                     'Очищаем source и убеждаемся, что storage всё ещё содержит задачу.',
                     'Добавляем другую задачу в результат load и убеждаемся, что внутренний список не изменился.',
                     'Вызываем mark_done у Task из load и наблюдаем True при следующем чтении.'
                 ],
                 'code': '''source = [Task(1, "Повторить функции", 2, False)]
storage = MemoryStorage(source)
source.clear()
assert len(storage.load()) == 1

tasks = storage.load()
tasks.append(Task(2, "Разобрать исключения"))
assert len(storage.load()) == 1

tasks = storage.load()
tasks[0].mark_done()
assert storage.load()[0].is_done is True''',
                 'checks': [
                     'Контейнеры source, результата load и внутреннего storage различаются.',
                     'Task с id 1 остаётся тем же объектом внутри списков.',
                     'Общая Task не означает общий контейнер списка.',
                     'Проверка не обещает откат или изоляцию полей Task.'
                 ]
             }}
        ],
        'result': 'Готово, если MemoryStorage соблюдает договор load/save, а прежние операции дают одинаковые результаты на памяти и отдельном JsonStorage-пути. Обычный запуск сохраняет JsonStorage; копии разделяют контейнеры, но не объекты Task.'}],
    '40.1': [{'title': 'Перенесите чтение Planner в PlannerService',
        'task': 'Продолжите Persistent Planner с готовой Task, JsonStorage, MemoryStorage и переходными операциями, получающими storage. Читающие команды используют сервис, а add и done пока сохраняют прежний путь.',
        'tasks': [
            {'title': 'Добавьте методы чтения',
             'task': 'Создайте PlannerService(storage) или расширьте существующий класс. Перенесите список, получение, поиск и статистику, используя готовые модель, валидатор и прикладную ошибку.',
             'requirements': [
                 'Читающий метод загружает актуальный список один раз и не вызывает storage.save().',
                 'Пустой список и пустой поиск возвращают []; допустимый отсутствующий id даёт TaskNotFoundError.',
                 'Неверный или булев id отклоняется как ValueError до поиска.',
                 'Сводка содержит all, open и done, причём all равен open плюс done.'
             ],
             'hint': 'Сначала проверьте точный тип id, затем положительность прежним валидатором. Для поиска очистите фрагмент и сравните его с title без учёта регистра.',
             'answer': {
                 'explanation': 'Сервис хранит ссылку на storage, а не постоянный список. Пустой результат списка отличается от отсутствующей обязательной задачи. bool является подклассом int, поэтому точная проверка типа предшествует валидатору.',
                 'steps': [
                     'Сохраните выбранный storage в конструкторе.',
                     'В list_tasks верните результат одного вызова load.',
                     'В get_task проверьте тип и диапазон id, найдите Task и поднимите TaskNotFoundError только при отсутствии.',
                     'В search_tasks очистите query, верните [] для пустого значения и найдите совпадения без изменения title.',
                     'В get_statistics за один проход посчитайте all/open/done. Чтение не вызывает save.'
                 ],
                 'code': '''from app.errors import TaskNotFoundError
from app.validators import validate_task_id

class PlannerService:
    def __init__(self, storage):
        self.storage = storage
    def list_tasks(self):
        return self.storage.load()
    def get_task(self, task_id):
        if type(task_id) is not int:
            raise ValueError("Номер задачи должен быть целым числом")
        task_id = validate_task_id(task_id)
        for task in self.storage.load():
            if task.id == task_id:
                return task
        raise TaskNotFoundError(f"Задача с номером {task_id} не найдена")
    def search_tasks(self, query):
        query = query.strip().lower()
        if not query:
            return []
        return [task for task in self.storage.load() if query in task.title.lower()]
    def get_statistics(self):
        tasks = self.storage.load()
        done = sum(task.is_done for task in tasks)
        total = len(tasks)
        return {"all": total, "open": total - done, "done": done}''',
                 'checks': [
                     'Пустое хранилище даёт [] и all=0, open=0, done=0.',
                     'Неизвестный id даёт TaskNotFoundError; True и неположительный id дают ValueError.',
                     'Поиск без учёта регистра сохраняет исходный title.',
                     'Чтение не увеличивает число вызовов save.'
                 ]
             }},
            {'title': 'Подключите читающие команды',
             'task': 'Направьте list, find, search и stats в PlannerService. Переходные add и done получают тот же storage, что передан сервису.',
             'requirements': [
                 'CLI сохраняет ввод, форматирование и сообщения.',
                 'ValueError и TaskNotFoundError обрабатываются отдельно.',
                 'Сводка использует all/open/done; процент пустого набора равен 0.0.',
                 'Сервис не использует input/print и не создаёт вторую базу.'
             ],
             'hint': 'Обновите читающие обработчики и ключи статистики одновременно. Не меняйте прежний путь add/done.',
             'answer': {
                 'explanation': 'CLI остаётся границей общения с человеком. Он вызывает сервис для чтения и сохраняет прежние переходные функции для изменений, передавая обеим сторонам один storage.',
                 'steps': [
                     'Получите список через service.list_tasks() и передайте его прежнему показу карточек.',
                     'В find раздельно обработайте неверный id и допустимый отсутствующий id.',
                     'Передайте query в service.search_tasks().',
                     'В stats рассчитайте процент из all и done.',
                     'В цикле передавайте service читающим обработчикам, а storage обработчикам add/done.'
                 ],
                 'code': '''def handle_list(service):
    show_tasks(service.list_tasks())

def handle_find(service):
    try:
        task = service.get_task(read_task_id())
    except ValueError as error:
        print(error)
    except TaskNotFoundError:
        print("Задача не найдена")
    else:
        print(format_task(task))

def handle_search(service):
    query = input("Фрагмент названия: ")
    if query.strip() == "":
        print("Введите непустой фрагмент")
        return
    matches = service.search_tasks(query)
    if not matches:
        print("Совпадений не найдено")
    else:
        show_tasks(matches)

def handle_stats(service):
    stats = service.get_statistics()
    total = stats["all"]
    percent = 0.0 if total == 0 else round(stats["done"] / total * 100, 1)
    print(f"Всего: {total}")
    print(f"Выполнено: {stats['done']}")
    print(f"Осталось: {stats['open']}")
    print(f"Процент выполнения: {percent}%")

def dispatch(command, service, storage):
    handlers = {
        "list": lambda: handle_list(service),
        "find": lambda: handle_find(service),
        "search": lambda: handle_search(service),
        "stats": lambda: handle_stats(service),
        "add": lambda: handle_add(storage),
        "done": lambda: handle_done(storage),
    }
    handlers[command]()

# run вызывает dispatch после проверки команды:
dispatch(command, service, storage)''',
                 'checks': [
                     'Читающие команды показывают актуальные результаты и не вызывают save.',
                     'Ошибки id дают правильные сообщения, цикл CLI продолжается.',
                     'add/done и чтение используют один storage.',
                     'Ключи total/completed/left больше не читаются.'
                 ]
             }},
            {'title': 'Проверьте оба storage',
             'task': 'Сверьте пустое и заполненное состояние на MemoryStorage и JsonStorage с временным путём. Подтвердите отсутствие записи при чтении и актуальность после изменения.',
             'requirements': [
                 'Проверяются список, получение, поиск и all/open/done.',
                 'Рабочий data/tasks.json не используется.',
                 'Читающие методы не увеличивают счётчик save.',
                 'Delete и перенос add/done остаются следующему занятию.'
             ],
             'hint': 'Оберните storage счётчиком save. Для JSON используйте TemporaryDirectory.',
             'answer': {
                 'explanation': 'Сначала пустое состояние проверяет нулевую сводку, пустую выдачу и разные ошибки получения. Затем тот же service читает сохранённый набор после изменения storage. Счётчик подтверждает, что сами чтения не записывают снимок, а временный путь защищает пользовательские данные.',
                 'steps': [
                     'Создайте SaveCounter с делегированием load/save.',
                     'На пустом storage проверьте список, пустой поиск и all/open/done.',
                     'Отдельно подтвердите ValueError для True и TaskNotFoundError для допустимого отсутствующего id.',
                     'Сохраните открытые и завершённые Task, выполните все чтения и сравните save_calls.',
                     'Измените состояние через storage, затем повторно прочитайте сводку тем же service.'
                 ],
                 'code': '''from pathlib import Path
from tempfile import TemporaryDirectory
from app.models import Task
from app.errors import TaskNotFoundError
from app.services import PlannerService
from app.storage import JsonStorage, MemoryStorage

class SaveCounter:
    def __init__(self, storage):
        self.storage = storage
        self.save_calls = 0
    def load(self):
        return self.storage.load()
    def save(self, tasks):
        self.save_calls += 1
        return self.storage.save(tasks)

def expect_error(error_type, action):
    try:
        action()
    except error_type:
        return
    raise AssertionError(f"Ожидалась ошибка {error_type.__name__}")

def verify(storage):
    observed = SaveCounter(storage)
    service = PlannerService(observed)

    assert service.list_tasks() == []
    assert service.search_tasks("   ") == []
    assert service.get_statistics() == {"all": 0, "open": 0, "done": 0}
    expect_error(TaskNotFoundError, lambda: service.get_task(404))
    expect_error(ValueError, lambda: service.get_task(True))
    assert observed.save_calls == 0

    observed.save([
        Task(1, "Курс Python", 2),
        Task(2, "SQL", 3, is_done=True),
    ])
    before = observed.save_calls
    assert [task.id for task in service.list_tasks()] == [1, 2]
    assert service.get_task(1).title == "Курс Python"
    assert [task.id for task in service.search_tasks("PYTHON")] == [1]
    assert service.get_statistics() == {"all": 2, "open": 1, "done": 1}
    assert observed.save_calls == before

    latest = observed.load()
    latest[0].is_done = True
    observed.save(latest)
    assert service.get_statistics() == {"all": 2, "open": 0, "done": 2}
    assert observed.save_calls == before + 1

verify(MemoryStorage())
with TemporaryDirectory() as folder:
    verify(JsonStorage(Path(folder) / "tasks.json"))''',
                 'checks': [
                     'Оба storage возвращают одинаковые результаты для пустого и заполненного состояния.',
                     'ValueError, TaskNotFoundError и пустой поиск соответствуют разным договорам.',
                     'Читающие вызовы не меняют save_calls; после сохранённого изменения service видит новое состояние.',
                     'Временный JSON находится вне пользовательских данных.'
                 ]
             }}
        ],
        'result': 'Читающие сценарии работают через один PlannerService на актуальных данных выбранного storage. Статистика согласована, а чтение не запускает сохранение.'}],

    41: [{'title': 'Первые тесты готового Persistent Planner',
        'task': 'Добавьте обнаруживаемые pytest-тесты, которые защищают договоры Task, MemoryStorage и PlannerService. Набор проверяет наблюдаемые результаты и состояние готового продукта, а не повторяет его внутренние алгоритмы.',
        'tasks': [
            {'title': 'Запуск pytest и первый обнаруживаемый тест',
             'task': 'Окружение разработки содержит pytest, а tests/test_smoke.py импортирует настоящую модель и проверяет один факт её публичного поведения. Импорт не запускает меню, не читает ввод и не создаёт файлы.',
             'requirements': [
                 'Pytest записан в существующие зависимости разработки проекта.',
                 'Файл tests/test_smoke.py и функция test_task_can_be_created обнаруживаются pytest.',
                 'Тест импортирует Task из app.models и проверяет созданный объект.',
                 'python -m pytest tests/test_smoke.py -q и python -m pytest -q запускают выбранное и полное множество проверок.'
             ],
             'hint': 'Сначала проверим, что выбранный Python видит pytest и сам проект. Если тест не попал в запуск, сверим рабочую папку и соглашения test_ до разбора поведения.',
             'answer': {
                 'explanation': 'Небольшая контрольная проверка отделяет настройку окружения и импорт от правил модели. Команда python -m pytest использует модуль pytest именно того интерпретатора, который указан как python.',
                 'steps': [
                     'Добавим pytest в существующую запись зависимостей разработки и установим её выбранным Python.',
                     'Создадим каталог tests и файл test_smoke.py.',
                     'Импортируем публичную Task и проверим видимое значение.',
                     'Запустим файл отдельно, затем весь набор из корня проекта.'
                 ],
                 'code': '''from app.models import Task


def test_task_can_be_created():
    task = Task(1, "Проверить pytest", priority=3)

    assert task.id == 1
    assert task.title == "Проверить pytest"''',
                 'checks': [
                     'Pytest обнаруживает тест.',
                     'Импорт не запускает пользовательский сценарий и не меняет данные.',
                     'Проверяется результат создания настоящей Task.'
                 ]
             }},
            {'title': 'Договоры одной Task',
             'task': 'Тесты модели подтверждают нормализацию title, конкретный ValueError для недопустимых значений, независимость tags и сохранение состояния после неудачного изменения.',
             'requirements': [
                 'Проверки находятся отдельно от CLI, service и файлового storage.',
                 'Неверные приоритеты проверяются отдельными явными сценариями без fixtures и параметризации.',
                 'Два объекта Task не используют один изменяемый список tags.',
                 'После отказа rename прежний title остаётся прежним.'
             ],
             'hint': 'Для каждого теста подготовим один или два объекта, выполним один вызов, затем сравним поля и ожидаемое исключение. Перед pytest.raises оставим только вызов, который должен завершиться ValueError.',
             'answer': {
                 'explanation': 'Тесты вызывают правила там, где они принадлежат модели. Сравнение до и после отказа подтверждает, что проверка нового значения произошла до изменения состояния.',
                 'steps': [
                     'Проверим нормализацию на корректном title.',
                     'Отдельно вызовем конструктор с пустым названием и приоритетами за границами.',
                     'Создадим две Task и изменим метку только первой.',
                     'Вызовем rename с пробелами и после ValueError сравним прежнее значение.'
                 ],
                 'code': '''import pytest

from app.models import Task


def test_title_is_normalized():
    task = Task(1, "  Python  ", priority=3)

    assert task.title == "Python"


def test_task_rejects_empty_title():
    with pytest.raises(ValueError):
        Task(1, "   ", priority=3)


def test_task_rejects_priority_below_range():
    with pytest.raises(ValueError):
        Task(1, "Python", priority=0)


def test_task_rejects_priority_above_range():
    with pytest.raises(ValueError):
        Task(1, "Python", priority=6)


def test_tags_belong_to_each_task():
    first = Task(1, "Python", tags=["backend"])
    second = Task(2, "Tests")

    first.tags.append("oop")

    assert first.tags == ["backend", "oop"]
    assert second.tags == []
    assert first.tags is not second.tags


def test_failed_rename_keeps_previous_title():
    task = Task(1, "Python", priority=3)

    with pytest.raises(ValueError):
        task.rename("   ")

    assert task.title == "Python"''',
                 'checks': [
                     'Пустой title и два неверных приоритета дают ValueError.',
                     'Нормализация проверяется по значению поля.',
                     'Изменение tags первой Task не влияет на вторую.',
                     'Ошибка rename не меняет сохранённый title.'
                 ]
             }},
            {'title': 'Граница копирования MemoryStorage',
             'task': 'Тесты подтверждают копирование контейнера при save и load, а также наблюдаемую границу: Task внутри контейнера остаются общими объектами.',
             'requirements': [
                 'Тесты работают только с MemoryStorage и не обращаются к tmp_path или рабочему JSON.',
                 'Очистка внешнего списка после save не очищает сохранённое состояние.',
                 'Очистка списка, полученного через load, не меняет следующий результат load.',
                 'Вызов метода у общей Task наблюдаем в storage, поэтому глубокая копия не предполагается.'
             ],
             'hint': 'Разделим два вопроса: изменился ли сам список и изменился ли объект, на который ссылаются элементы списка.',
             'answer': {
                 'explanation': 'MemoryStorage копирует список-контейнер, но сохраняет ссылки на Task. Поэтому структурные изменения внешнего списка изолированы, а мутация общей Task видна через обе ссылки.',
                 'steps': [
                     'Создадим Task и передадим её во внешнем списке в save.',
                     'Очистим внешний список и проверим новое чтение.',
                     'Очистим список, который вернул load, и снова проверим storage.',
                     'Изменим сам объект Task и наблюдаем его новое состояние.'
                 ],
                 'code': '''from app.models import Task
from app.storage import MemoryStorage


def test_memory_storage_copies_containers_but_shares_tasks():
    task = Task(1, "Python")
    storage = MemoryStorage()
    source = [task]

    storage.save(source)
    source.clear()

    loaded = storage.load()
    loaded.clear()

    assert storage.load() == [task]

    storage.load()[0].mark_done()

    assert storage.load()[0].is_done is True''',
                 'checks': [
                     'Списки до и после границ хранения независимы.',
                     'Новый load всё ещё возвращает сохранённую Task после очистки внешних списков.',
                     'Изменение общей Task видно через storage.',
                     'Проверка не обещает транзакцию или глубокое копирование.'
                 ]
             }},
            {'title': 'Публичные действия PlannerService',
             'task': 'Набор на свежем MemoryStorage проверяет успешные результаты сервиса, состояние после действий и предусмотренные ValueError/TaskNotFoundError.',
             'requirements': [
                 'Каждый тест создаёт собственные MemoryStorage и PlannerService прямо в теле, без общей изменяемой fixture.',
                 'Добавление, чтение, поиск, завершение, удаление и статистика проверяются через публичные методы.',
                 'Неизвестный допустимый id отличается от недопустимого id; оба отказа не меняют набор.',
                 'JSON, CLI и файловая интеграция не входят в эти тесты.'
             ],
             'hint': 'Сначала сверим имена методов с готовым договором PlannerService. Для ошибки сохраним наблюдаемое состояние, вызовем операцию внутри pytest.raises и сравним состояние после отказа.',
             'answer': {
                 'explanation': 'Публичные вызовы связывают сервис с выбранным storage без копирования внутренней формулы. Сценарии вместе подтверждают успешные действия, ошибки и состояние после удаления.',
                 'steps': [
                     'Создадим сервис на отдельном MemoryStorage в каждом тесте.',
                     'Проверим добавление, чтение и поиск по возвращаемым Task.',
                     'Проверим переход done и повторное действие.',
                     'Удалим одну Task, проверим оставшийся id и сводку.',
                     'Отдельно вызовем сервис с неверным и отсутствующим id.'
                 ],
                 'code': '''import pytest

from app.errors import TaskNotFoundError
from app.models import Task
from app.services import PlannerService
from app.storage import MemoryStorage


def test_add_and_list_tasks():
    service = PlannerService(MemoryStorage())

    created = service.add_task("  Python  ", priority=3)

    assert created.id == 1
    assert created.title == "Python"
    assert service.list_tasks() == [created]


def test_get_and_search_tasks():
    service = PlannerService(
        MemoryStorage([Task(4, "Python testing", priority=2)])
    )

    assert service.get_task(4).title == "Python testing"
    assert [task.id for task in service.search_tasks("PYTHON")] == [4]
    assert service.search_tasks("   ") == []

    with pytest.raises(TaskNotFoundError):
        service.get_task(99)


def test_mark_done_changes_the_selected_task():
    service = PlannerService(
        MemoryStorage([Task(1, "Python"), Task(2, "Tests")])
    )

    completed = service.mark_done(1)

    assert completed.is_done is True
    assert service.list_tasks()[0].is_done is True
    assert service.list_tasks()[1].is_done is False
    assert service.mark_done(1).is_done is True


def test_delete_preserves_remaining_ids_and_statistics():
    service = PlannerService(
        MemoryStorage([
            Task(1, "Remove me"),
            Task(2, "Keep me", is_done=True),
        ])
    )

    result = service.delete_task(1)

    assert result is None
    assert [task.id for task in service.list_tasks()] == [2]
    assert service.get_statistics() == {"all": 1, "open": 0, "done": 1}

    with pytest.raises(TaskNotFoundError):
        service.delete_task(1)

    assert [task.id for task in service.list_tasks()] == [2]


def test_invalid_id_is_not_an_unknown_task():
    service = PlannerService(MemoryStorage())

    with pytest.raises(ValueError):
        service.get_task(0)''',
                 'checks': [
                     'Успешные вызовы дают Task или сводку по договору сервиса.',
                     'Поиск не меняет данные, а пустой очищенный запрос возвращает пустой список.',
                     'ValueError и TaskNotFoundError проверяются как разные причины.',
                     'Отказ удаления не меняет оставшийся набор.',
                     'Каждый тест использует свежий storage без fixture и JSON.'
                 ]
             }},
            {'title': 'Прочитать одно контролируемое падение',
             'task': 'Одно тестовое ожидание временно расходится с результатом, отчёт pytest локализует сравнение, затем восстановленный набор снова проходит.',
             'requirements': [
                 'Временно изменяется одно expected-значение без изменения кода Planner.',
                 'По отчёту определяются тест, строка сравнения, expected и actual.',
                 'Проверяется, соответствует ли договору ожидание или реализация.',
                 'Правильное ожидание восстановлено до полного запуска.',
                 'Намеренно красный тест и коммит в итоговом наборе отсутствуют.'
             ],
             'hint': 'Красный итог показывает расхождение, но не говорит автоматически, что исправлять. Проследим Arrange, Act и Assert, затем сверим оба значения с договором.',
             'answer': {
                 'explanation': 'Одно контролируемое изменение показывает, как pytest сообщает о несовпадении. Мы возвращаем корректное ожидание до финального запуска, а не удаляем тест или ослабляем договор ради зелёного вывода.',
                 'steps': [
                     'В одном тесте временно зададим заведомо неверное ожидаемое значение.',
                     'Запустим файл этого теста и прочитаем имя, место сравнения и значения.',
                     'Сверим ожидание с договором и вернём правильное значение.',
                     'Запустим полный pytest-набор и проверим чистый diff.'
                 ],
                 'code': '''python -m pytest tests/test_services.py -q
python -m pytest -q''',
                 'checks': [
                     'Контролируемое падение указывает на выбранное сравнение.',
                     'Код Planner не менялся ради неверного ожидания.',
                     'Перед завершением тесты проходят с восстановленным договором.',
                     'Новые тесты не обращаются к пользовательскому data/tasks.json.'
                 ]
             }}
        ],
        'result': 'Тесты обнаруживаются и проходят, отдельно защищая правила Task, границу MemoryStorage и публичные действия PlannerService. Набор запускается через python -m pytest; fixtures, параметризация и файловые тесты остаются следующими шагами.'}],    '41.1': [{'title': 'Сделайте тесты независимыми и короче',
        'task': 'Продолжите набор pytest из занятия 41. Сохраните договоры Task, MemoryStorage и PlannerService, вынесите только повторяемую подготовку и объедините только варианты одного правила.',
        'tasks': [
            {'title': 'Вынесите свежую подготовку в fixtures',
             'task': 'В tests/test_services.py создайте function-scoped fixture для нового MemoryStorage и fixture PlannerService, которая запрашивает storage. Переведите повторяющиеся тесты на эти зависимости, оставив Act и Assert в самих тестах.',
             'requirements': [
                 'Каждый запуск получает новый MemoryStorage и новый PlannerService.',
                 'Внутри одного теста service и memory_storage относятся к одной подготовке.',
                 'Fixture только возвращает зависимости; проверяемое действие остаётся в тесте.',
                 'Нет module/session scope, autouse, глобального изменяемого service или tmp_path.'
             ],
             'hint': 'Вынесем только одинаковые конструкторы. Если тест проверяет состояние после добавления, запросим и service, и memory_storage из одной подготовки.',
             'answer': {
                 'explanation': 'Pytest разрешает fixtures по именам параметров. Fixture сервиса получает storage из fixture памяти; оба запроса в одном тесте используют один результат этой подготовки.',
                 'steps': [
                     'Импортируем pytest, PlannerService и MemoryStorage из модулей проекта.',
                     'Создадим обычную fixture memory_storage, возвращающую новый объект.',
                     'Создадим fixture service с параметром memory_storage и передадим тот же объект сервису.',
                     'В одном тесте запросим обе fixtures, вызовем add_task и проверим задачу и состояние storage.'
                 ],
                 'code': '''import pytest

from app.services import PlannerService
from app.storage import MemoryStorage


@pytest.fixture
def memory_storage():
    return MemoryStorage()


@pytest.fixture
def service(memory_storage):
    return PlannerService(memory_storage)


def test_add_task(service, memory_storage):
    created = service.add_task("Python", priority=3)

    assert created.title == "Python"
    assert [task.title for task in memory_storage.load()] == ["Python"]''',
                 'checks': [
                     'В каждом тестовом вызове создаются новые storage и service.',
                     'service и memory_storage одного теста используют одну подготовленную зависимость.',
                     'Act и наблюдаемое ожидание находятся в тесте.'
                 ]
             }},
            {'title': 'Параметризуйте варианты одного правила',
             'task': 'Сгруппируйте границы priority, пустые после нормализации названия и запросы поиска без учёта регистра. Для каждой таблицы оставьте отдельную функцию с одним предметным ожиданием.',
             'requirements': [
                 'Имена параметров в декораторе совпадают с аргументами теста.',
                 'Priority 1 и 5 принимаются, а 0 и 6 дают ValueError.',
                 'Пустая строка и строка из пробелов нарушают один договор title.',
                 'Запросы поиска подтверждают одно правило; неизвестный id не добавляется в таблицы.'
             ],
             'hint': 'Таблица заменяет повтор значений, а не смысл сценария. Если различается причина ошибки или меняется действие, оставим отдельный тест.',
             'answer': {
                 'explanation': 'Каждая функция подтверждает один договор и показывает значения, которые pytest передаст по очереди. Приём и отказ priority имеют разные исходы, поэтому это отдельные функции.',
                 'steps': [
                     'Отдельно проверим допустимые и недопустимые границы priority.',
                     'Параметризуем пустые значения title, которые нарушают одно правило.',
                     'Для поиска передадим пары query и ожидаемых названий.'
                 ],
                 'code': '''import pytest

from app.models import Task


@pytest.mark.parametrize("priority", [1, 5])
def test_task_accepts_priority_boundaries(priority):
    task = Task(1, "Python", priority=priority)

    assert task.priority == priority


@pytest.mark.parametrize("priority", [0, 6])
def test_task_rejects_priority_outside_range(priority):
    with pytest.raises(ValueError):
        Task(1, "Python", priority=priority)


@pytest.mark.parametrize("title", ["", "   "])
def test_task_rejects_blank_title(title):
    with pytest.raises(ValueError):
        Task(1, title)


@pytest.mark.parametrize(
    ("query", "expected_titles"),
    [("python", ["Python"]), ("readme", ["README"])],
)
def test_search_is_case_insensitive(service, query, expected_titles):
    service.add_task("Python")
    service.add_task("README")

    found = service.search_tasks(query)

    assert [task.title for task in found] == expected_titles''',
                 'checks': [
                     'Каждая строка параметров даёт отдельный запуск.',
                     'Границы и неверные значения защищены разными правилами.',
                     'Пустой title не смешан с поиском или изменением состояния.'
                 ]
             }},
            {'title': 'Оставьте особые сценарии отдельными',
             'task': 'Отдельно проверьте неизвестный id и отсутствие изменения состояния, изменение только выбранной задачи и независимые tags у двух новых Task. Запустите model и service тесты по отдельности, затем весь набор.',
             'requirements': [
                 'TaskNotFoundError не меняет список задач.',
                 'mark_done меняет выбранную задачу, другая остаётся незавершённой.',
                 'Изменение tags первой новой Task не меняет tags второй.',
                 'tests/test_models.py и tests/test_services.py запускаются отдельно, затем выполняется полный pytest.'
             ],
             'hint': 'Снимите состояние до отказа и сравните после. Для tags создайте две Task независимо, не делите список между тестами.',
             'answer': {
                 'explanation': 'У отказа сервиса, изменения состояния и независимости полей модели разные предметные причины. Отдельные функции сохраняют понятные имена и самостоятельные Arrange–Act–Assert.',
                 'steps': [
                     'Сравним список задач до и после TaskNotFoundError.',
                     'Завершим одну из двух задач и проверим обе.',
                     'Создадим две Task, изменим tags первой и проверим вторую.',
                     'Запустим выбранные тестовые файлы по отдельности и полный набор.'
                 ],
                 'code': '''import pytest

from app.errors import TaskNotFoundError
from app.models import Task


def test_unknown_task_does_not_change_state(service):
    service.add_task("Python")
    before = [task.title for task in service.list_tasks()]

    with pytest.raises(TaskNotFoundError):
        service.get_task(99)

    assert [task.title for task in service.list_tasks()] == before


def test_mark_done_changes_only_the_selected_task(service):
    first = service.add_task("Python")
    second = service.add_task("Tests")

    service.mark_done(first.id)

    assert service.get_task(first.id).is_done is True
    assert service.get_task(second.id).is_done is False


def test_task_tags_are_independent():
    first = Task(1, "Python")
    second = Task(2, "Tests")
    first.tags.append("pytest")

    assert first.tags == ["pytest"]
    assert second.tags == []


# Из корня StudyHub:
python -m pytest tests/test_models.py -q
python -m pytest tests/test_services.py -q
python -m pytest -q''',
                 'checks': [
                     'TaskNotFoundError подтверждён, состояние после отказа совпадает со снимком до вызова.',
                     'mark_done меняет только выбранную задачу.',
                     'У двух Task независимые списки tags.',
                     'Выбранные и полный запуск дают согласованные результаты.'
                 ]
             }}
        ],
        'result': 'Готово, если fixtures дают свежие зависимости, параметризация объединяет только варианты одного правила, особые сценарии остаются отдельными, а выбранные и полный запуски pytest сохраняют ожидаемые результаты.'}],
    '41.2': [{
        'title': 'Проверьте файловую интеграцию через tmp_path',
        'task': 'Добавьте файловые проверки к существующим тестам Persistent Planner. Каждому сценарию назначьте путь из tmp_path, а восстановление проверьте новыми экземплярами storage и service. Подтвердите нормальное чтение, совместимость и ожидаемые отказы отдельно и в полном наборе.',
        'requirements': [
            'Используйте готовые Task, JsonStorage и PlannerService.',
            'Не обращайтесь к пользовательскому data/tasks.json.'
        ],
        'tasks': [
            {'title': 'Проверьте пустое начало',
             'task': 'Убедитесь, что новое хранилище ожидаемо начинает с пустого набора и не создаёт файл чтением.',
             'requirements': [
                 'Путь строится от tmp_path и до load() отсутствует.',
                 'load() возвращает [], путь после чтения по-прежнему отсутствует.'
             ],
             'hint': 'Создайте только Path. Не вызывайте touch() или write_text(): проверяется поведение действительно отсутствующего файла.',
             'answer': {
                 'explanation': 'FileNotFoundError при первом чтении является предусмотренным состоянием. Проверка пути до и после load() отделяет его от существующего пустого или повреждённого JSON.',
                 'steps': [
                     'Составьте путь к новому имени файла внутри tmp_path.',
                     'Подтвердите, что файла ещё нет.',
                     'Вызовите load() через JsonStorage(path).',
                     'Проверьте пустой список и отсутствие созданного файла.'
                 ],
                 'code': '''from app.storage import JsonStorage


def test_missing_file_starts_empty(tmp_path):
    path = tmp_path / "missing.json"
    assert not path.exists()

    assert JsonStorage(path).load() == []

    assert not path.exists()''',
                 'checks': [
                     'Путь принадлежит tmp_path.',
                     'Пустой результат не маскирует существующее повреждение.',
                     'Чтение не создаёт новый файл.'
                 ]
             }},
            {'title': 'Восстановите задачу новым сервисом',
             'task': 'Проведите round trip через действие PlannerService, JsonStorage и тот же временный файл.',
             'requirements': [
                 'Первый сервис сохраняет кириллицу, приоритет, завершённый статус и tags.',
                 'Восстановление выполняет второй PlannerService с новым JsonStorage на том же пути.'
             ],
             'hint': 'Сохраните id созданной Task. Новый сервис создайте после записи, иначе тест может читать прежний список из памяти.',
             'answer': {
                 'explanation': 'Новый экземпляр исключает случайное чтение прежнего списка. Общий для двух storage путь связывает сервисы через JSON и проверяет восстановленные значения.',
                 'steps': [
                     'Создайте путь от tmp_path и первый PlannerService.',
                     'Добавьте задачу с кириллицей и tags, затем завершите её.',
                     'Создайте новый JsonStorage и новый PlannerService на том же пути.',
                     'Получите Task по id и сравните все значимые поля.'
                 ],
                 'code': '''from app.services import PlannerService
from app.storage import JsonStorage


def test_service_restores_task_from_json(tmp_path):
    path = tmp_path / "tasks.json"
    first = PlannerService(JsonStorage(path))
    created = first.add_task("Прочитать главу", priority=4, tags=["Python"])
    first.mark_done(created.id)

    second = PlannerService(JsonStorage(path))
    restored = second.get_task(created.id)

    assert restored.id == created.id
    assert restored.title == "Прочитать главу"
    assert restored.priority == 4
    assert restored.is_done is True
    assert restored.tags == ["Python"]''',
                 'checks': [
                     'Второй сервис создан после сохранения.',
                     'Проверяются id, кириллица, priority, is_done и tags.',
                     'Рабочий список в памяти не используется как источник результата.'
                 ]
             }},
            {'title': 'Прочитайте полную старую запись',
             'task': 'Подтвердите совместимость записи до появления поля tags.',
             'requirements': [
                 'Запись содержит id, title, priority и is_done, но не содержит tags.',
                 'Все прежние значения сохраняются; отсутствующий tags становится отдельным пустым списком.'
             ],
             'hint': 'Запишите старую форму напрямую в тестовый JSON. Создание через add_task всегда даст новый формат и не проверит обратную совместимость.',
             'answer': {
                 'explanation': 'Допускается только отсутствие нового поля tags. Пропуск прежнего обязательного значения должен остаться ошибкой, а не получить произвольный default.',
                 'steps': [
                     'Подготовьте полную четырёхпольную запись.',
                     'Запишите её как UTF-8 JSON внутрь tmp_path.',
                     'Загрузите задачи через JsonStorage.',
                     'Проверьте исходные поля и пустой tags.'
                 ],
                 'code': '''import json

from app.storage import JsonStorage


def test_json_storage_accepts_legacy_record(tmp_path):
    path = tmp_path / "legacy.json"
    record = {"id": 8, "title": "Старая задача", "priority": 3, "is_done": True}
    path.write_text(json.dumps([record], ensure_ascii=False), encoding="utf-8")

    [task] = JsonStorage(path).load()

    assert task.id == 8
    assert task.title == "Старая задача"
    assert task.priority == 3
    assert task.is_done is True
    assert task.tags == []''',
                 'checks': [
                     'В тестовой записи отсутствует только tags.',
                     'Завершённый статус и прежние поля не сбрасываются.',
                     'Загружается именно записанный снимок.'
                 ]
             }},
            {'title': 'Ожидаемые отказы сохраняют файл',
             'task': 'Разведите повреждение JSON, неверную схему, повтор id и файловый путь-каталог.',
             'requirements': [
                 'Ошибочные снимки приводят к StorageError, а не к пустому списку.',
                 'Содержимое ошибочного файла до и после load() совпадает.'
             ],
             'hint': 'Параметризуйте строки JSON, если проверяется один договор ошибки. Каталог вместо файла проверяйте отдельным случаем.',
             'answer': {
                 'explanation': 'Параметры покрывают синтаксис, обязательное поле, тип статуса и уникальность id. Ожидание StorageError сохраняет единый публичный договор, а сравнение строки доказывает, что неудачная загрузка не подменила источник.',
                 'steps': [
                     'Подготовьте некорректный JSON и корректные строки с ошибками схемы.',
                     'Для каждого входа запишите точное исходное содержимое.',
                     'Ожидайте StorageError только от load().',
                     'Сравните содержимое после отказа; отдельно передайте load() путь-каталог.'
                 ],
                 'code': '''import pytest

from app.errors import StorageError
from app.storage import JsonStorage


@pytest.mark.parametrize("content", [
    "{повреждено",
    '[{"title": "Без id", "priority": 2, "is_done": false}]',
    '[{"id": 3, "title": "Статус строкой", "priority": 2, "is_done": "false", "tags": []}]',
    '[{"id": 3, "title": "Задача", "priority": 2, "is_done": false, "tags": []}, '
    '{"id": 3, "title": "Задача 2", "priority": 1, "is_done": false, "tags": []}]',
])
def test_invalid_snapshot_is_preserved(tmp_path, content):
    path = tmp_path / "invalid.json"
    path.write_text(content, encoding="utf-8")
    original = path.read_text(encoding="utf-8")

    with pytest.raises(StorageError):
        JsonStorage(path).load()

    assert path.read_text(encoding="utf-8") == original


def test_directory_is_not_a_json_file(tmp_path):
    path = tmp_path / "tasks.json"
    path.mkdir()

    with pytest.raises(StorageError):
        JsonStorage(path).load()

    assert path.is_dir()''',
                 'checks': [
                     'Проверяются сломанный JSON, пропуск id, неверный тип is_done и повторяющийся id.',
                     'Не используется общий except и не сравнивается текст ОС-ошибки.',
                     'Путь-каталог находится внутри tmp_path.'
                 ]
             }},
            {'title': 'Запустите проверки отдельно и вместе',
             'task': 'Проверьте, что новые файловые сценарии воспроизводятся самостоятельно и не зависят от порядка общего набора.',
             'requirements': [
                 'Целевой файл запускается отдельно, затем запускается весь pytest-набор.',
                 'В тестах нет прямого доступа к data/tasks.json.'
             ],
             'hint': 'Запускайте команды из корня StudyHub и проверьте пути в исходниках тестов.',
             'answer': {
                 'explanation': 'Отдельный запуск показывает локальные ошибки, а полный набор помогает обнаружить зависимость от общего состояния или порядка. Оба запуска используют только свои временные файлы.',
                 'steps': [
                     'Запустите файл с файловыми интеграционными тестами.',
                     'Запустите весь набор pytest.',
                     'Сравните результаты и убедитесь, что пользовательский JSON не упоминается в новых тестах.'
                 ],
                 'code': '''python -m pytest tests/test_storage_integration.py -q
python -m pytest -q''',
                 'checks': [
                     'Целевой и полный наборы проходят отдельно.',
                     'Каждый сценарий использует собственный tmp_path.',
                     'data/tasks.json не является тестовой фикстурой.'
                 ]
             }}
        ],
        'result': 'Файловые тесты на tmp_path подтверждают пустое начало, восстановление нового и старого формата, обработку ошибочных снимков и независимый запуск без обращения к пользовательскому data/tasks.json.'}],
    "40.2": [{
        'title': 'Завершите единый путь Planner через PlannerService',
        'task': 'Продолжите Planner после 40.1: чтение уже идёт через сервис, а add и done подключены переходными функциями к тому же storage. Перенесите изменения в сервис, добавьте delete и переключите команды на один путь.',
        'tasks': [
            {
                'title': 'Перенесите add и done',
                'task': 'Сервис работает с актуальным набором и возвращает результат предметного действия.',
                'requirements': [
                    'add_task назначает максимум текущих id плюс один, создаёт незавершённую Task с независимыми tags, сохраняет один раз и возвращает Task.',
                    'mark_done проверяет id тем же договором, что get_task, и возвращает Task.',
                    'Повторный done, неверный вход и отсутствующий id не вызывают save.'
                ],
                'hint': 'Мы используем один помощник поиска и проверки id, передавая ему уже загруженный список.',
                'answer': {
                    'explanation': 'Проверка предшествует изменению, а save вызывается только для реального перехода. Новый id зависит от текущих записей; копия tags не разделяет список с вызывающим кодом.',
                    'steps': [
                        'Мы загружаем актуальный список и вычисляем следующий id по максимуму.',
                        'Мы создаём Task с копией tags и сохраняем её.',
                        'Для done мы сначала ищем задачу; повтор возвращает её без записи.'
                    ],
                    'code': '''from app.errors import TaskNotFoundError
from app.models import Task


def find_task(tasks, task_id):
    if type(task_id) is not int or task_id < 1:
        raise ValueError("Некорректный id")
    for task in tasks:
        if task.id == task_id:
            return task
    raise TaskNotFoundError(f"Задача {task_id} не найдена")


def add_task(self, title, priority, tags=None):
    tasks = self.storage.load()
    task = Task(
        id=max((item.id for item in tasks), default=0) + 1,
        title=title,
        priority=priority,
        is_done=False,
        tags=list(tags) if tags is not None else [],
    )
    tasks.append(task)
    self.storage.save(tasks)
    return task


def mark_done(self, task_id):
    tasks = self.storage.load()
    task = find_task(tasks, task_id)
    if task.is_done:
        return task
    task.mark_done()
    self.storage.save(tasks)
    return task''',
                    'checks': [
                        'Для существующих id 2 и 9 новая задача получает id 10; пустой список даёт 1.',
                        'Изменение исходного списка tags не меняет Task.',
                        'Повторный done и ошибочный id не вызывают save.'
                    ]
                }
            },
            {
                'title': 'Добавьте delete без перенумерации',
                'task': 'Удаление убирает одну существующую задачу, сохраняет остальные id и возвращает None.',
                'requirements': [
                    'Поиск использует тот же помощник, что get_task и mark_done.',
                    'При успехе выполняется один save; при отказе список и число save не меняются.',
                    'Соседние задачи не перенумеровываются.'
                ],
                'hint': 'Мы сначала находим объект, затем удаляем именно его из загруженного списка.',
                'answer': {
                    'explanation': 'Неизвестный id останавливает выполнение до изменения и сохранения. Удаление существующего элемента не меняет номера остальных задач.',
                    'steps': [
                        'Мы загружаем список и проверяем id.',
                        'Мы удаляем найденный объект и сохраняем остаток.',
                        'Мы возвращаем None.'
                    ],
                    'code': '''def delete_task(self, task_id):
    tasks = self.storage.load()
    task = find_task(tasks, task_id)
    tasks.remove(task)
    self.storage.save(tasks)
    return None''',
                    'checks': [
                        'Удаление id 7 оставляет id 2 и 9 без изменений.',
                        'Неизвестный id не вызывает save.',
                        'Успешный вызов возвращает None.'
                    ]
                }
            },
            {
                'title': 'Переключите CLI и сборку',
                'task': 'CLI получает готовый сервис, а точка сборки выбирает одну зависимость.',
                'requirements': [
                    'Обработчики вызывают методы сервиса и не содержат CRUD, JSON-IO или callback сохранения.',
                    'После переключения потребителей удалены переходные функции и второй аргумент storage у CLI.',
                    'build_service(storage=None) использует переданную зависимость, а при None создаёт JsonStorage для data/tasks.json.',
                    'Импорт и сборка не запускают ввод или файловые операции; StorageError сохраняет прежнюю границу обработки.'
                ],
                'hint': 'Мы проверяем storage is None, а не истинность объекта: пустой MemoryStorage тоже выбран явно.',
                'answer': {
                    'explanation': 'Сборка создаёт storage и передаёт его сервису. CLI знает только сервис. Пользователь видит успех после завершения метода и сохранения.',
                    'steps': [
                        'Мы заменяем вызовы переходных функций методами сервиса и сохраняем прежние команды.',
                        'Мы передаём CLI только service.',
                        'Мы выбираем JSON только при None и не загружаем файл при сборке.',
                        'Мы показываем ожидаемые ошибки, но не маскируем StorageError.'
                    ],
                    'code': '''from pathlib import Path

from app.errors import TaskNotFoundError
from app.services import PlannerService
from app.storage import JsonStorage


def build_service(storage=None):
    chosen = JsonStorage(Path("data") / "tasks.json") if storage is None else storage
    return PlannerService(chosen)


def finish_task(service, raw_id):
    try:
        task = service.mark_done(int(raw_id))
    except (ValueError, TaskNotFoundError) as error:
        print(f"Ошибка: {error}")
        return
    print(f"Задача {task.id} завершена")''',
                    'checks': [
                        'Пустой MemoryStorage передаётся сервису без замены на JsonStorage.',
                        'В CLI нет второго пути CRUD и callback-сохранения.',
                        'Импорт и build_service не вызывают input(), load() или save().'
                    ]
                }
            },
            {
                'title': 'Проверьте память и JSON',
                'task': 'Прямая регрессия подтверждает прежние команды, delete, отказы и восстановление данных.',
                'requirements': [
                    'На MemoryStorage проверьте add, list, get, search, statistics, done и delete.',
                    'Подтвердите, что чтение, повторный done и ошибка не вызывают save.',
                    'Откройте временный JSON новым JsonStorage; рабочий data/tasks.json не используйте.',
                    'Pytest остаётся темой следующего занятия.'
                ],
                'hint': 'Мы можем считать save в обёртке над MemoryStorage и использовать TemporaryDirectory для JSON.',
                'answer': {
                    'explanation': 'Счётчик показывает факт записи, а новый JsonStorage проверяет восстановление из файла. Временный каталог изолирует учебные данные.',
                    'steps': [
                        'Мы проверяем количество save для памяти после изменения, чтения и повтора done.',
                        'Мы сохраняем задачу во временный JSON.',
                        'Мы создаём новый storage с тем же путём и читаем задачу заново.'
                    ],
                    'code': '''from pathlib import Path
from tempfile import TemporaryDirectory

from app.services import PlannerService
from app.storage import JsonStorage, MemoryStorage


class CountingMemoryStorage(MemoryStorage):
    def __init__(self):
        super().__init__()
        self.saves = 0

    def save(self, tasks):
        self.saves += 1
        super().save(tasks)


memory = CountingMemoryStorage()
service = PlannerService(memory)
task = service.add_task("Проверить запись", 2)
assert memory.saves == 1
service.list_tasks()
assert memory.saves == 1
service.mark_done(task.id)
assert memory.saves == 2
service.mark_done(task.id)
assert memory.saves == 2

with TemporaryDirectory() as folder:
    path = Path(folder) / "tasks.json"
    PlannerService(JsonStorage(path)).add_task("Восстановить", 3)
    reopened = PlannerService(JsonStorage(path))
    assert reopened.get_task(1).title == "Восстановить"''',
                    'checks': [
                        'Чтение и повторный done не увеличивают счётчик.',
                        'Новое изменение и удаление сохраняются по одному разу.',
                        'Новый JsonStorage восстанавливает данные временного файла.'
                    ]
                }
            }
        ],
        'result': 'Все действия проходят через один PlannerService и тонкий CLI; MemoryStorage и отдельный JSON подтверждают прежние команды, новое удаление, безопасные отказы и восстановление.'
    }],
    42: [{'title': 'Отделите одну команду от цикла CLI',
        'task': 'В готовом Persistent Planner отдельная функция обрабатывает одну строку команды, а run управляет сессией. Переданные функции чтения и вывода позволяют проверить эту границу без глобального input и print. Существующие действия сервиса, storage и пользовательские команды сохраняют свой договор.',
        'tasks': [
            {'title': 'Проследите ответственность и выберите границу',
             'task': 'Карта вызовов показывает путь команды от чтения строки через CLI к PlannerService и storage, а затем возврат результата пользователю.',
             'requirements': [
                 'run владеет циклом чтения и решением о следующем шаге.',
                 'execute_command обрабатывает одну уже полученную строку и выбирает обработчик.',
                 'PlannerService выполняет предметную операцию; CLI не дублирует её через storage.',
                 'Проверяемая граница не меняет готовые методы сервиса и правила Task.'
             ],
             'hint': 'Мы проследим один сценарий list или done от первой строки до результата. Для каждого вызова назовём инициатора и компонент, которому принадлежит действие.',
             'answer': {
                 'explanation': 'run управляет повторением сессии. Обработка одной команды заканчивается раньше, чем сама сессия, поэтому ей подходит отдельный execute_command. CLI вызывает PlannerService, сервис применяет предметное действие и использует storage, если нужно актуальное состояние. Хранилище не становится сервисом только потому, что оба компонента работают с задачами.',
                 'steps': [
                     'Начните со строки, которую читает run.',
                     'Найдите выбор команды и вызов обработчика.',
                     'Проследите вызов метода PlannerService и его зависимостей.',
                     'Отметьте чтение и вывод, которые сейчас связаны с глобальными input и print.',
                     'Выберите минимальную границу в CLI, не перенося существующую операцию.'
                 ],
                 'checks': [
                     'Каждой роли соответствует существующий компонент.',
                     'Карта показывает возврат результата, а не только каталог файлов.',
                     'Правка не создаёт второй service, CRUD или storage.'
                 ]
             }},
            {'title': 'Выделите обработчик команды и передайте callbacks',
             'task': 'execute_command(service, command, read=input, write=print) обрабатывает одну строку и возвращает признак продолжения. run читает команды в цикле и заканчивает сессию по этому признаку.',
             'requirements': [
                 'execute_command выбирает обработчик после нормализации команды в одном месте.',
                 'Команда exit выводит прежнее сообщение и возвращает False; неизвестная команда сообщает об ошибке и возвращает True.',
                 'run передаёт read и write обработчику, затем продолжает или завершает цикл по bool.',
                 'Readers и handlers принимают read/write; в проверяемой ветке нет прямых глобальных input() и print().',
                 'Ожидаемые ошибки значения и TaskNotFoundError сохраняют пользовательский ответ; StorageError доходит до прежней границы запуска.'
             ],
             'hint': 'Мы оставим run коротким: он показывает меню, читает одну строку, вызывает execute_command и проверяет результат. Не перехватываем Exception вокруг всей обработки: это скроет отказ storage и программную ошибку.',
             'answer': {
                 'explanation': 'Функции read и write передаются как обычные значения. При обычном запуске они по умолчанию связываются с терминалом; при ручной проверке их заменяют функции, которые возвращают подготовленный ввод или собирают сообщения. execute_command возвращает только решение о продолжении сессии. Результат предметного метода остаётся отдельным значением. Известные команды сохраняют прежние обработчики, а StorageError не маскируется широким перехватом.',
                 'steps': [
                     'Обновите сигнатуры readers и handlers, чтобы они принимали read/write.',
                     'Передайте callbacks в обработчики из таблицы команд.',
                     'Вынесите одну обработку строки из run в execute_command.',
                     'Оставьте run владельцем цикла и меню.',
                     'Обработайте exit и неизвестную команду разными результатами bool.',
                     'Сохраните узкую границу известных пользовательских ошибок и распространение StorageError.'
                 ],
                 'code': '''COMMAND_HANDLERS = {
    "add": handle_add,
    "list": handle_list,
    "find": handle_find,
    "done": handle_done,
    "delete": handle_delete,
    "search": handle_search,
    "stats": handle_stats,
}


def execute_command(service, command, read=input, write=print):
    normalized = command.strip().lower()
    if normalized == "exit":
        write("Работу завершили")
        return False

    handler = COMMAND_HANDLERS.get(normalized)
    if handler is None:
        write("Неизвестная команда")
        return True

    handler(service, read=read, write=write)
    return True


def run(service, read=input, write=print):
    while True:
        show_menu(write)
        command = read("Команда: ")
        keep_running = execute_command(service, command, read, write)
        if not keep_running:
            break


''',
                 'checks': [
                     'Одна команда обрабатывается отдельно от следующего чтения цикла.',
                     'Обычный запуск использует input/print через значения по умолчанию.',
                     'Переданные callbacks доходят до readers и handlers.',
                     'Методы сервиса и storage не получают ввод и не печатают сообщения.'
                 ]
             }},
            {'title': 'Сверьте продолжение, отказ и прежние сценарии',
             'task': 'Рефакторинг сохраняет наблюдаемое поведение команд, пользовательских ошибок и сохранения. Ручной вызов execute_command позволяет увидеть bool и вывод без запуска бесконечного цикла.',
             'requirements': [
                 'Неизвестная команда возвращает True; exit возвращает False.',
                 'list/find/search не вызывают сохранение.',
                 'Неверное значение, неизвестный id и повторный done не создают ложный успех или лишнее сохранение.',
                 'Отказ storage остаётся видимым и проходит через прежнюю границу завершения сессии.',
                 'Прежний набор команд и доступные тесты сохраняют результат.'
             ],
             'hint': 'Мы начнём с команд, которые не меняют данные, затем проверим успешное изменение и ожидаемые отказы. Для нового CLI-поведения не создаём тестовый файл: автоматические CLI-тесты относятся к следующему шагу.',
             'answer': {
                 'explanation': 'Переданный writer показывает точный пользовательский результат, а bool отдельно показывает, что сделает run. Ручная проверка подтверждает границу команды; существующие тесты продолжают защищать уже покрытые модель, сервис и storage. Новый автоматический набор для CLI не подменяет следующую практику.',
                 'steps': [
                     'Передайте execute_command writer, который добавляет сообщения в список.',
                     'Вызовите неизвестную команду и exit отдельно, сравните сообщения и bool.',
                     'Проведите обычный запуск с прежними командами и проверенными данными.',
                     'Проверьте неверный ввод, неизвестный id, повторный done и отказ storage на безопасном сценарии.',
                     'Запустите существующие тесты и убедитесь, что не добавили дублирующий прикладной путь.'
                 ],
                 'code': '''messages = []
unknown_continues = execute_command(
    service, "unknown", write=messages.append
)
exit_continues = execute_command(
    service, "exit", write=messages.append
)

print(unknown_continues, exit_continues, messages)
# True False ['Неизвестная команда', 'Работу завершили']''',
                 'checks': [
                     'Неизвестная команда не завершает сессию.',
                     'exit завершает её после сообщения.',
                     'Ошибки пользователя не меняют данные и не запускают save.',
                     'StorageError не превращается в обычное продолжение.'
                 ]
             }}
        ],
        'result': 'В CLI есть отдельная обработка одной команды с передаваемыми read/write; run управляет циклом, а команды, предметные методы и границы ошибок сохраняют прежний смысл.'}],
    '42.1': [{'title': 'Регрессионные тесты защитили команды и безопасную сборку',
        'task': 'В том же Persistent Planner после занятия о границе CLI были добавлены регрессии сообщений, состояния и вызовов storage через настоящие execute_command, PlannerService и выбранное хранилище. Вход проекта был сверен с точкой A: если компоненты из занятия 42 отсутствовали, был восстановлен именно его результат; отсутствие тестов считалось ожидаемым входом, и первая регрессия CLI появилась как результат занятия 42.1. Тесты вокруг заглушек не создавались.',
        'tasks': [
            {'title': 'Наблюдательный storage был обёрнут композицией',
             'task': 'В тестах появилась тонкая обёртка вокруг MemoryStorage. Она считала обращения к load/save, делегировала работу исходному объекту и не хранила второй список задач.',
             'requirements': [
                 'Для каждого теста создавалась свежая обёртка.',
                 'Переданный объект сохранялся во внутреннем поле.',
                 'Вызовы load/save отмечались, а операции делегировались тому же storage.',
                 'CRUD, список задач и JSON-поведение не дублировались.'
             ],
             'hint': 'У обёртки две причины существовать: отметить вызов и передать его дальше. Состояние остаётся у MemoryStorage.',
             'answer': {
                 'explanation': 'Композиция позволяет наблюдать настоящий storage без новой реализации хранения. Список событий принадлежит обёртке, а задачи остаются во вложенном MemoryStorage.',
                 'steps': [
                     'Сохраните внутренний storage в self.inner.',
                     'Добавьте список событий.',
                     'Запишите событие перед делегированием.',
                     'Верните результат внутреннего метода.'
                 ],
                 'code': '''class ObservedStorage:
    def __init__(self, inner):
        self.inner = inner
        self.events = []

    def load(self):
        self.events.append("load")
        return self.inner.load()

    def save(self, tasks):
        self.events.append("save")
        return self.inner.save(tasks)''',
                 'checks': [
                     'load возвращал данные внутреннего storage.',
                     'save передавал тому же объекту полный список Task.',
                     'Обёртка не создавала второе состояние Planner.'
                 ]
             }},
            {'title': 'Команды и количество сохранений проверялись регрессиями',
             'task': 'Каждая команда вызывалась через execute_command с управляемым read и собранным write. Сверялись результат, состояние storage и число save.',
             'requirements': [
                 'add, list, find, search, done, delete, stats и exit были покрыты проверками.',
                 'Успешные add/done/delete изменяли данные и вызывали ровно один save.',
                 'list/find/search/stats и exit не вызывали save; exit завершал сессию.',
                 'В ответах и Task проверялось содержимое, а не только непустой вывод.'
             ],
             'hint': 'Сгруппируйте чтение и изменение по эффектам. Для каждого вызова подготовьте свежие данные, очередь ответов и сборщик сообщений.',
             'answer': {
                 'explanation': 'Мы вызываем настоящий диспетчер команды, управляя только вводом и выводом. Для чтения проверяем смысл ответа и отсутствие save; для изменений сверяем новое состояние и одну запись.',
                 'steps': [
                     'Создайте читатель на копии подготовленных ответов.',
                     'Соберите сообщения через messages.append.',
                     'Параметризуйте команды по ожидаемому результату.',
                     'Сверьте данные после проверки числа save.'
                 ],
                 'code': '''import pytest

from app.cli import execute_command
from app.models import Task
from app.services import PlannerService
from app.storage import MemoryStorage


def make_reader(answers):
    pending = list(answers)

    def read(_prompt):
        return pending.pop(0)

    return read


def run_command(storage, command, answers=()):
    messages = []
    service = PlannerService(storage)
    result = execute_command(
        service, command, read=make_reader(answers), write=messages.append
    )
    return service, result, messages


@pytest.mark.parametrize(
    "command, answers, expected_count, expected_text",
    [
        ("add", ["Новая задача", "2"], 2, "Новая задача"),
        ("done", ["1"], 1, "выполн"),
        ("delete", ["1"], 0, "удал"),
    ],
)
def test_mutating_commands_save_once(command, answers, expected_count, expected_text):
    storage = ObservedStorage(MemoryStorage([Task(1, "Python", 3)]))
    _, keep_running, messages = run_command(storage, command, answers)

    assert keep_running is True
    assert storage.events.count("save") == 1
    assert len(storage.inner.load()) == expected_count
    assert expected_text in " ".join(messages).casefold()
    if command == "done":
        assert storage.inner.load()[0].is_done is True
    if command == "add":
        assert storage.inner.load()[1].title == "Новая задача"


@pytest.mark.parametrize(
    "command, answers, expected_text",
    [
        ("list", [], "Python"),
        ("find", ["1"], "Python"),
        ("search", ["Pyth"], "Python"),
        ("stats", [], "Всего"),
    ],
)
def test_read_commands_do_not_save(command, answers, expected_text):
    storage = ObservedStorage(MemoryStorage([Task(1, "Python", 3)]))
    _, keep_running, messages = run_command(storage, command, answers)

    assert keep_running is True
    assert expected_text in " ".join(messages)
    assert "save" not in storage.events


def test_exit_and_unknown_command_do_not_save():
    storage = ObservedStorage(MemoryStorage())
    _, keep_running, messages = run_command(storage, "exit")
    assert keep_running is False
    assert "save" not in storage.events
    assert any("заверш" in message.lower() for message in messages)

    _, keep_running, messages = run_command(storage, "unknown")
    assert keep_running is True
    assert any("неизвест" in message.lower() for message in messages)
    assert "save" not in storage.events''',
                 'checks': [
                     'Добавление, завершение и удаление сохраняли данные один раз.',
                     'Читающие команды показывали результат и не вызывали save.',
                     'exit возвращал False, а неизвестная команда продолжала сессию.'
                 ]
             }},
            {'title': 'Отказы и безопасная сборка были покрыты проверками',
             'task': 'Неверный ввод, неизвестный id, повторное завершение, ошибки storage и build_service были проверены. Импорт не запускал CLI и не открывал рабочий файл.',
             'requirements': [
                 'Отказ пользователя не менял данные и не вызывал save.',
                 'StorageError не превращался в сообщение об успехе или общую ошибку.',
                 'Повтор done для выполненной задачи не сохранял список.',
                 'Сборка с переданным storage не вызывала load/save; default выбирал JsonStorage.',
                 'Безопасный импорт проверялся отдельным процессом.'
             ],
             'hint': 'У отказов разные наблюдения: состояние, счётчик обёртки и тип исключения. Не очищайте и не используйте рабочий JSON как тестовую фикстуру.',
             'answer': {
                 'explanation': 'Пользовательский отказ остаётся локальным, StorageError сохраняет границу хранения, а неожиданный дефект не скрывается. Неудачный save может произойти после изменения памяти, поэтому автоматический rollback не утверждается.',
                 'steps': [
                     'Проверьте неизвестный id и повторное done на свежем storage.',
                     'Ожидайте StorageError при отказе load или save.',
                     'Проверьте отсутствие вызовов при сборке переданного storage.',
                     'Импортируйте app.main отдельным процессом и сверьте пустой вывод.'
                 ],
                 'code': '''import subprocess
import sys

import pytest

from app.cli import execute_command
from app.errors import StorageError
from app.main import build_service
from app.models import Task
from app.services import PlannerService
from app.storage import JsonStorage, MemoryStorage


class FailingStorage(ObservedStorage):
    def __init__(self, inner, fail_on):
        super().__init__(inner)
        self.fail_on = fail_on

    def load(self):
        self.events.append("load")
        if self.fail_on == "load":
            raise StorageError("ошибка чтения")
        return self.inner.load()

    def save(self, tasks):
        self.events.append("save")
        if self.fail_on == "save":
            raise StorageError("ошибка записи")
        return self.inner.save(tasks)


@pytest.mark.parametrize("fail_on, command, answers", [
    ("load", "list", []),
    ("save", "add", ["Новая задача", "3"]),
])
def test_storage_error_is_not_reported_as_success(fail_on, command, answers):
    storage = FailingStorage(MemoryStorage(), fail_on=fail_on)
    service = PlannerService(storage)
    messages = []

    with pytest.raises(StorageError):
        execute_command(
            service, command, read=make_reader(answers), write=messages.append
        )

    assert not any("успеш" in message.lower() for message in messages)


@pytest.mark.parametrize(
    "answers, expected_text",
    [
        (["", "3"], "пуст"),
        (["Новая задача", "0"], "priority"),
    ],
)
def test_invalid_add_does_not_change_state_or_save(answers, expected_text):
    storage = ObservedStorage(MemoryStorage([Task(1, "Python", 3)]))
    service = PlannerService(storage)
    before = [task.to_dict() for task in storage.inner.load()]
    messages = []

    execute_command(
        service, "add", read=make_reader(answers), write=messages.append
    )

    assert storage.events.count("save") == 0
    assert [task.to_dict() for task in storage.inner.load()] == before
    assert expected_text in " ".join(messages).casefold()
def test_unknown_id_and_repeated_done_do_not_save():
    storage = ObservedStorage(
        MemoryStorage([Task(1, "Python", 3, is_done=True)])
    )
    service = PlannerService(storage)
    messages = []

    execute_command(
        service, "find", read=make_reader(["999"]), write=messages.append
    )
    execute_command(
        service, "done", read=make_reader(["1"]), write=messages.append
    )

    assert "save" not in storage.events
    assert storage.inner.load()[0].is_done is True
    assert any("не найдена" in message.lower() for message in messages)


def test_build_service_uses_injected_storage_without_io():
    storage = ObservedStorage(MemoryStorage())

    service = build_service(storage)

    assert storage.events == []
    assert service.list_tasks() == []
    assert storage.events == ["load"]


def test_default_build_uses_json_without_loading_it():
    service = build_service()

    assert isinstance(service.storage, JsonStorage)


def test_import_main_does_not_start_cli():
    result = subprocess.run(
        [sys.executable, "-c", "import app.main"],
        capture_output=True,
        text=True,
        timeout=10,
        check=True,
    )

    assert result.stdout == ""
    assert result.stderr == ""''',
                 'checks': [
                     'Неизвестный id и повторное done не меняли состояние и не сохраняли данные.',
                     'StorageError не становился ложным успехом.',
                     'Переданный storage не вызывался при сборке.',
                     'Импорт app.main завершался без меню и вывода.'
                 ]
             }},
            {'title': 'Регрессии были запущены перед сквозной приёмкой',
             'task': 'CLI-тесты были запущены отдельно и вместе с существующим набором, затем штатный CLI был пройден вручную. Ограничения проверки были зафиксированы.',
             'requirements': [
                 'Тесты CLI и полный pytest-набор были запущены из корня проекта.',
                 'Реальный источник дефекта исправлялся, затронутые проверки повторялись.',
                 'Ручной проход подтвердил прежние сообщения и пользовательские команды.',
                 'Рабочий JSON не очищался, rollback после неудачной записи не обещался.'
             ],
             'hint': 'Зелёный результат имеет смысл, только если тесты вызывают настоящую границу команды и соответствуют договору проекта.',
             'answer': {
                 'explanation': 'Отдельный запуск локализует ошибки CLI, полный набор защищает соседние границы, ручной проход подтверждает поведение для человека. Следующее занятие отдельно проверяет восстановление на изолированном JSON.',
                 'steps': [
                     'Запустите новый файл тестов отдельно.',
                     'Запустите pytest целиком.',
                     'Пройдите add/list/find/search/done/delete/stats/exit.',
                     'Сверьте ответы, данные и сохранения для успехов и отказов.',
                     'Запишите проверенную версию и ограничения.'
                 ],
                 'code': '''python -m pytest tests/test_cli.py -q
python -m pytest -q
python -m app.main''',
                 'checks': [
                     'Отдельный и полный наборы прошли.',
                     'Прежние команды и сообщения сохранились.',
                     'Отказ пользователя не вызывал save.',
                     'Сквозное восстановление новым storage осталось следующим шагом.'
                 ]
             }}
        ],
        'result': 'Регрессионные тесты подтвердили ответы CLI, состояние Planner, вызовы storage и безопасную сборку на существующем коде. Рабочие команды сохранились, тесты не затронули пользовательский JSON, а StorageError и дефекты не выдавались за успех.'}],
    43: [{'title': 'Добавили persistence и завершили прикладной сценарий',
       'task': 'В существующем Persistent Planner уже существовали Task, MemoryStorage, add_task, list_tasks и их '
               'in-memory тесты. На этой основе добавили persistent слой: сериализацию, JsonStorage, '
               'оставшиеся сервисные операции и CLI.',
       'tasks': [
           {'title': 'Расширили существующую Task сериализацией',
            'task': 'К готовой модели добавили преобразование в JSON-совместимые данные и обратно. Существующие '
                    'dataclass, инварианты, tags и mark_done сохранили без изменений.',
            'requirements': [
                'Добавьте Task.to_dict() с ключами id, title, priority, is_done и tags.',
                'Добавьте Task.from_dict() как classmethod.',
                'from_dict() должен создавать Task через существующий конструктор, чтобы сработали инварианты.',
                'Создавайте отдельную копию tags при переходе в dict и обратно.',
                'Добавьте тест round trip Task → dict → Task.',
                'Не добавляйте json.dumps, Path или файловый код в models.py.'
            ],
            'hint': 'Новый слой начинается на границе модели, а не с переписывания её полей. to_dict возвращает '
                    'простые значения, from_dict собирает уже знакомую Task. Список tags требует копии, потому '
                    'что внешний dict не должен менять объект через общую ссылку.',
            'answer': {
                'explanation': 'Сериализация добавляет модели новую внешнюю границу, но не меняет её прежнюю роль. '
                               'Task всё так же проверяет title и priority. JsonStorage позже получит dict, а '
                               'PlannerService продолжит работать с объектами Task.',
                'steps': [
                    'Перечислите в to_dict только согласованные поля.',
                    'Скопируйте tags через list(self.tags).',
                    'В from_dict получите значения и передайте их в cls(...).',
                    'Скопируйте входные tags.',
                    'Проверьте тип результата и равенство значений.'
                ],
                'code': '''def to_dict(self):
    return {
        "id": self.id,
        "title": self.title,
        "priority": self.priority,
        "is_done": self.is_done,
        "tags": list(self.tags),
    }


@classmethod
def from_dict(cls, data):
    return cls(
        id=data["id"],
        title=data["title"],
        priority=data["priority"],
        is_done=data.get("is_done", False),
        tags=list(data.get("tags", [])),
    )''',
                'checks': [
                    'Round trip возвращает Task, а не dict.',
                    'Изменение сохранённого dict.tags не меняет исходную Task.',
                    'models.py не знает о JSON-файле.'
                ]
            }},
           {'title': 'Сняли xfail и реализовали JsonStorage',
            'task': 'Честную заглушку из архитектурной точки заменили файловой реализацией. Тест из прошлого '
                    'этапа стал зелёным без изменения ожидаемого результата.',
            'requirements': [
                'Реализуйте JsonStorage.load() и save(tasks).',
                'Путь приходит через Path в конструкторе.',
                'Отсутствующий файл возвращает [].',
                'save создаёт родительский каталог, использует UTF-8, ensure_ascii=False и indent=2.',
                'load возвращает list[Task] через Task.from_dict(), а не list[dict].',
                'Удалите pytest.mark.xfail только после того, как round trip проходит через новый экземпляр JsonStorage.',
                'Не переносите JSON-логику в PlannerService или CLI.'
            ],
            'hint': 'Начните с уже написанного xfail. Он показывает вход и ожидаемый результат. В save переведите '
                    'Task в dict, затем в JSON-текст. В load сделайте путь в обратную сторону. Создайте второй '
                    'JsonStorage с тем же Path, чтобы проверять persistence, а не память одного объекта.',
            'answer': {
                'explanation': 'JsonStorage заменяет только среду хранения, сохраняя смысл load/save, который уже '
                               'знаком по MemoryStorage. Поэтому service не нужно переписывать. Снятый xfail '
                               'доказывает, что новая возможность соответствует контракту, а не просто существует.',
                'steps': [
                    'Замените NotImplementedError в load и save.',
                    'В save создайте каталог и сериализуйте список Task.',
                    'В load отдельно обработайте отсутствие файла.',
                    'Разберите JSON и соберите Task.from_dict.',
                    'Снимите xfail и прогоните test_json_storage_contract.py.'
                ],
                'code': '''def save(self, tasks):
    self.path.parent.mkdir(parents=True, exist_ok=True)
    data = [task.to_dict() for task in tasks]
    self.path.write_text(
        json.dumps(data, ensure_ascii=False, indent=2),
        encoding="utf-8",
    )''',
                'checks': [
                    'Бывший xfail стал зелёным без изменения сценария.',
                    'Новый экземпляр JsonStorage загружает сохранённые Task.',
                    'Нет файла возвращает [].',
                    'JSON читаем человеком и сохраняет кириллицу.'
                ]
            }},
           {'title': 'Сделали ошибки файла видимыми',
            'task': 'Провели границу между новым пустым проектом и повреждёнными сохранёнными данными.',
            'requirements': [
                'При json.JSONDecodeError поднимайте StorageError с сохранением причины через raise from.',
                'Если корень JSON не list, поднимайте StorageError.',
                'Если отдельный элемент не создаёт корректную Task, также поднимайте StorageError.',
                'Не возвращайте [] для повреждённого существующего файла.',
                'Проверьте эти случаи через tmp_path.',
                'После ошибки убедитесь, что тест или приложение не вызывает save и не затирает повреждённый файл.'
            ],
            'hint': 'Отсутствие файла и битый файл несут разный смысл. Первый означает новый проект. Второй может '
                    'содержать важные данные, которые нельзя прочитать. Ловите только ожидаемые ошибки формата, '
                    'а не любой Exception.',
            'answer': {
                'explanation': 'StorageError поднимает техническую проблему на понятный уровень контракта. '
                               'Пользовательский слой сможет показать сообщение, а код не примет повреждение за '
                               'пустое состояние. Проверка отсутствия save после отказа защищает данные от '
                               'тихой потери.',
                'steps': [
                    'Создайте отдельный временный файл с неверным JSON.',
                    'В load поймайте JSONDecodeError.',
                    'Проверьте тип корня после json.loads.',
                    'Оберните ошибки Task.from_dict в StorageError.',
                    'Напишите pytest.raises для каждого состояния.'
                ],
                'code': '''try:
    data = json.loads(text)
except json.JSONDecodeError as error:
    raise StorageError("Файл задач повреждён") from error

if not isinstance(data, list):
    raise StorageError("Корень JSON должен быть списком")''',
                'checks': [
                    'Повреждённый JSON даёт StorageError.',
                    'Корень-словарь не принимается как список задач.',
                    'Отсутствующий файл по-прежнему возвращает [].',
                    'Тесты используют tmp_path и не трогают data/tasks.json.'
                ]
            }},
           {'title': 'Расширили PlannerService пользовательскими операциями',
            'task': 'Существующие add_task и list_tasks сохранили. К сервису добавили недостающие операции и '
                    'обеспечили сохранение состояния после успешных изменений.',
            'requirements': [
                'Используйте TaskNotFoundError из app/exceptions.py для неизвестного id.',
                'Реализуйте get_task(task_id).',
                'Реализуйте mark_done(task_id) через существующий Task.mark_done() и save.',
                'Реализуйте delete_task(task_id) с сохранением после удаления.',
                'Реализуйте search_tasks(query) по одному явно описанному правилу.',
                'Реализуйте get_statistics() с числом all, open и done.',
                'Не открывайте JSON и не обращайтесь к приватным полям storage в services.py.'
            ],
            'hint': 'Разделите чтение и мутации. get_task и search_tasks читают список. mark_done и delete_task '
                    'должны пройти путь load, изменение, save. Для неизвестного id используйте одну '
                    'согласованную ошибку, а не смесь None, False и пустого Task.',
            'answer': {
                'explanation': 'Сервис получает новые пользовательские действия, но не становится файловым '
                               'адаптером. Все операции остаются применимыми к MemoryStorage и JsonStorage. '
                               'Единая TaskNotFoundError делает поведение доступным для CLI и тестов.',
                'steps': [
                    'Добавьте небольшой поиск Task по id.',
                    'Поднимайте TaskNotFoundError, если поиск не дал объект.',
                    'В mark_done измените Task и сохраните тот же список.',
                    'В delete_task удалите найденный объект и сохраните список.',
                    'Опишите правило search и форму статистики.',
                    'Проверьте успешные и отсутствующие id.'
                ],
                'code': '''def mark_done(self, task_id):
    tasks = self.storage.load()
    task = next((item for item in tasks if item.id == task_id), None)
    if task is None:
        raise TaskNotFoundError(task_id)
    task.mark_done()
    self.storage.save(tasks)
    return task''',
                'checks': [
                    'Неизвестный id даёт TaskNotFoundError.',
                    'mark_done и delete_task вызывают save после успеха.',
                    'get_task и search_tasks не меняют storage.',
                    'services.py не импортирует json или Path.'
                ]
            }},
           {'title': 'Подключили CLI к готовому service',
            'task': 'Завершили тонкий консольный интерфейс и переключили точку сборки с памяти на JsonStorage.',
            'requirements': [
                'В main.py измените default build_service на JsonStorage с data/tasks.json, но сохраните возможность '
                'передать storage для теста.',
                'В cli.py разберите команды add, list, done, delete, search, stats и exit из спецификации.',
                'CLI читает аргументы, вызывает service и форматирует результат.',
                'CLI обрабатывает ValueError, TaskNotFoundError и StorageError как сообщения, не меняя формат JSON.',
                'В cli.py нет json.loads, json.dumps, Path.write_text или расчёта следующего id.',
                'Добавьте smoke-проверку одной команды через функцию диспетчера без реального input.'
            ],
            'hint': 'CLI похож на переводчика. Он превращает текст в аргументы service и его результат в сообщение. '
                    'Если командная функция открывает tasks.json, в ней уже живёт инфраструктура, которую должен '
                    'держать JsonStorage. Для теста вызывайте диспетчер напрямую, а не бесконечное меню.',
            'answer': {
                'explanation': 'Тонкий CLI позволяет повторно использовать сервис в будущих интерфейсах. Точка '
                               'сборки выбирает реальное JSON-storage только для обычного запуска, тогда как тест '
                               'может передать MemoryStorage. Ошибки становятся видимыми на границе пользователя, '
                               'но их причины остаются в правильном слое.',
                'steps': [
                    'В main соберите JsonStorage и PlannerService.',
                    'Вынесите обработку одной команды в функцию.',
                    'Разберите аргументы и вызовите service.',
                    'Отформатируйте результат без ручной работы с JSON.',
                    'Поймайте договорённые исключения на уровне CLI.',
                    'Проверьте диспетчер напрямую.'
                ],
                'code': '''def build_service(storage=None) -> PlannerService:
    if storage is None:
        data_file = Path(__file__).resolve().parent.parent / "data" / "tasks.json"
        storage = JsonStorage(data_file)
    return PlannerService(storage)''',
                'checks': [
                    'Обычный запуск собирает JsonStorage.',
                    'Тест может передать MemoryStorage.',
                    'CLI не знает формат JSON.',
                    'Команда list использует service.list_tasks().'
                ]
            }},
           {'title': 'Проверили полный persistent сценарий',
            'task': 'Проверили пользовательский путь от отсутствующего файла до нового экземпляра приложения. '
                    'Так завершили первую вертикальную реализацию проекта, опираясь на готовую базовую модель.',
            'requirements': [
                'Начните с отсутствующего временного JSON-файла.',
                'Добавьте Python с priority 4 и README с priority 2 через PlannerService или диспетчер CLI.',
                'Получите или найдите README, затем отметьте Python выполненной.',
                'Проверьте stats: одна открытая и одна выполненная задача.',
                'Удалите README.',
                'Создайте новый JsonStorage или новый service с тем же Path и убедитесь, что остаётся выполненная Python.',
                'Запустите pytest, обновите README с командой запуска и создайте коммит feat: implement persistent planner flow.'
            ],
            'hint': 'Сначала докажите отдельные слои их тестами, затем соединяйте. Persistence нельзя подтвердить '
                    'повторным вызовом метода на том же объекте. Нужен новый JsonStorage или новый service, который '
                    'читает тот же путь. После удаления README проверьте только наблюдаемые публичные результаты.',
            'answer': {
                'explanation': 'Вертикальный сценарий показывает, что новая способность persistence прошла через '
                               'все границы: Task сериализовалась, storage записал и прочитал данные, service '
                               'применил команды, а новый экземпляр восстановил состояние. Это развитие готового '
                               'ядра, а не второе создание тех же классов.',
                'steps': [
                    'Создайте путь, которого ещё нет.',
                    'Соберите service с JsonStorage.',
                    'Добавьте две задачи и выполните прикладные операции.',
                    'Проверьте статистику и удаление.',
                    'Создайте новый service с тем же Path.',
                    'Запустите полный pytest и обновите README.'
                ],
                'code': '''python -m pytest -q
python -c "from app.main import build_service; print(type(build_service()).__name__)"
git status --short
git diff --check''',
                'checks': [
                    'Бывший JSON xfail зелёный.',
                    'После нового экземпляра данные не исчезают.',
                    'CLI и service используют разные роли без дублирования JSON.',
                    'Полный pytest проходит.',
                    'Коммит фиксирует новый persistent слой.'
                ]
            }}
       ],
       'result': 'Готово, если готовое in-memory ядро расширено, а не создано заново: Task умеет '
                 'сериализоваться, JsonStorage заменяет заглушку, service закрывает оставшиеся операции, '
                 'CLI остаётся тонким, а данные переживают новый экземпляр приложения.'}],
    44: [{
        'title': 'Воспроизводимая версия Planner',
        'task': 'Принятая версия проекта запускается в отдельной чистой копии, тесты проходят, новый процесс восстанавливает данные, а получатель понимает проверенный commit и ограничения. Новая функциональность не добавляется.',
        'tasks': [
            {'title': 'README описывает проверенный запуск',
             'task': 'README содержит проверенные команды и зависимости принятой версии, а его инструкции совпадают с результатом проверки.',
             'requirements': [
                 'README указывает проверенную версию Python и зависимости, нужные для запуска и тестов.',
                 'Команды установки, запуска приложения и тестов соответствуют фактической структуре проекта.',
                 'Описаны создание и расположение data/tasks.json; личный рабочий файл не требуется передавать.',
                 'README объясняет ожидаемые ошибки хранения и известные ограничения проекта без обещания будущих возможностей.'
             ],
             'hint': 'Пройдём каждую команду в отдельной копии. Формулировка «установите зависимости» недостаточна, если непонятно, где они перечислены и какой интерпретатор их устанавливает.',
             'answer': {
                 'explanation': 'README является проверенным маршрутом запуска. Его команды должны соответствовать точке входа и файлам зависимостей принятого проекта. Рабочие данные создаются в проверочной копии, поэтому для запуска не нужен JSON автора.',
                 'steps': [
                     'Сверяем версию Python и файлы зависимостей с проектом.',
                     'Выполняем команды установки в отдельной копии.',
                     'Запускаем команды приложения и тестов.',
                     'Уточняем README по обнаруженным расхождениям и описываем путь данных.'
                 ],
                 'code': '''## Перед запуском
Python: версия, проверенная для этой копии
Зависимости приложения: фактический файл проекта
Зависимости тестов: фактический файл проекта

## Проверка
Запуск приложения: команда, проверенная в копии
Запуск тестов: команда, проверенная в копии

## Данные
Приложение создаёт собственный data/tasks.json в проверочной копии.
Рабочий файл автора для запуска не требуется.''',
                 'checks': [
                     'Каждая команда README была выполнена в проверочной копии.',
                     'Инструкции не ссылаются на отсутствующий файл или будущую функцию.',
                     'Путь пользовательских данных указан без требования переносить рабочий JSON.'
                 ]
             }},
            {'title': 'Чистая копия подтверждает конкретный commit',
             'task': 'Отдельная чистая копия запускается после установки окружения и зависимостей по README; результат связан с конкретным commit.',
             'requirements': [
                 'Проверочная копия находится отдельно и не заменяет рабочую папку.',
                 'Зафиксирован полный commit проверяемой версии.',
                 'Окружение и зависимости установлены по README.',
                 'Тесты и команда запуска из README завершились ожидаемым результатом.',
                 'Рабочий data/tasks.json не переносился в проверочную копию.'
             ],
             'hint': 'Успешное клонирование подтверждает только получение исходников. Отдельно проверьте commit, установку, тесты и запуск.',
             'answer': {
                 'explanation': 'Проверка в отдельной копии убирает зависимость от локального окружения автора. Полный commit связывает результаты тестов с конкретным состоянием кода, а отдельный каталог защищает исходную рабочую папку и её данные.',
                 'steps': [
                     'Получаем копию принятого commit в отдельном каталоге.',
                     'Записываем результат git rev-parse HEAD.',
                     'Создаём окружение и устанавливаем зависимости по README.',
                     'Запускаем тесты и приложение командами из README.',
                     'Сохраняем результат каждой проверки вместе с commit.'
                 ],
                 'code': '''Проверенная версия: результат git rev-parse HEAD
Проверочная папка: отдельная копия проекта
Окружение: создано по README
Зависимости: установлены по README
Тесты: команда README завершилась успешно
Запуск: команда README открыла приложение
Рабочие данные автора: не копировались''',
                 'checks': [
                     'Записан полный commit, а не только имя ветки.',
                     'Тесты и приложение проверены в отдельной копии.',
                     'Успешный clone не принят за доказательство запуска.'
                 ]
             }},
            {'title': 'Отдельный процесс восстанавливает данные',
             'task': 'Новый процесс читает собственные данные проверочной копии после завершения предыдущего запуска.',
             'requirements': [
                 'Сценарий выполняется через python -m app.main в проверочной копии.',
                 'Первый процесс создаёт две задачи и завершает одну, затем корректно завершается.',
                 'Второй процесс читает список и статистику из того же data/tasks.json.',
                 'После перезапуска остаются две задачи, одна выполнена и одна открыта.',
                 'Тесты и сценарий не обращаются к рабочему пользовательскому файлу.'
             ],
             'hint': 'Новый service в том же процессе и новый процесс дают разную силу проверки. Здесь завершите первую сессию и запустите приложение снова.',
             'answer': {
                 'explanation': 'Первый процесс проверяет запись, завершение процесса отделяет сохранённое состояние от памяти объектов. Второй процесс читает собственный файл проверочной копии. Результат подтверждают список, статусы и согласованная статистика.',
                 'steps': [
                     'Запускаем приложение в проверочной копии.',
                     'Создаём две задачи и завершаем одну.',
                     'Завершаем приложение штатно.',
                     'Открываем новый процесс на том же пути данных.',
                     'Сверяем список и all/open/done.'
                 ],
                 'code': '''Процесс 1
Создать две задачи
Завершить первую
Выйти из приложения

Процесс 2
Открыть список: две задачи, статусы сохранены
Открыть статистику: all = 2, open = 1, done = 1

Путь данных принадлежит проверочной копии.''',
                 'checks': [
                     'Второй запуск был отдельным процессом.',
                     'Проверены записи и статистика после перезапуска.',
                     'У проверочной копии собственный файл данных.'
                 ]
             }},
            {'title': 'Архитектура и ограничения понятны принимающей стороне',
             'task': 'Краткое объяснение показывает путь команды через готовые компоненты, зафиксированную версию и границы, важные следующему разработчику.',
             'requirements': [
                 'Объяснены роли CLI, PlannerService, storage, Task и JSON-записи.',
                 'Указано, что безопасный импорт не запускает меню и не записывает данные.',
                 'Commit отличён от tag и GitHub Release; передаче соответствует именно проверенный commit.',
                 'Названы ограничения последовательного доступа и отсутствия гарантированной транзакции при ошибке записи.',
                 'Создание тега, публикация GitHub Release и деплой не являются частью этой практики.'
             ],
             'hint': 'Проследим одну команду от ввода до сохранённой записи, затем отдельно назовём то, чего проект не гарантирует.',
             'answer': {
                 'explanation': 'CLI принимает команду и показывает результат, PlannerService выполняет предметное действие, storage читает и сохраняет задачи, а Task описывает одну задачу и преобразование записи. Commit фиксирует состояние кода, tag называет commit, Release оформляет публикацию версии на GitHub. Передача фиксирует проверенную версию, но сама не публикует её.',
                 'steps': [
                     'Прослеживаем путь CLI → PlannerService → storage → Task/JSON.',
                     'Называем одну ответственность каждой части.',
                     'Фиксируем commit, на котором прошла проверка.',
                     'Различаем commit, tag и Release.',
                     'Указываем последовательный режим и отсутствие гарантированного отката при ошибке записи.'
                 ],
                 'code': '''CLI
  → PlannerService
  → JsonStorage
  → Task ↔ JSON-запись

Commit = проверенное состояние кода
Tag = имя, указывающее на commit
GitHub Release = опубликованное описание версии

Пределы: последовательная запись; транзакционный откат не гарантирован.''',
                 'checks': [
                     'Архитектура объясняет обязанности, а не только перечисляет файлы.',
                     'Записан commit проверенной копии.',
                     'Release и deploy не объявлены выполненными.',
                     'Ограничения не скрыты за обещанием надёжного отката.'
                 ]
             }}
        ],
        'result': 'Передача подтверждена, если чистая копия запускается по README, тесты проходят, новый процесс восстанавливает собственные данные проверочной копии, а проверенный commit и ограничения проекта объяснены. Публикация и деплой в эту работу не входят.'
    }]
}
