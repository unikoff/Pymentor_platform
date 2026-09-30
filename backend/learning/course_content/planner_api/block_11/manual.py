"""Учебная практика блока. Редактируйте задания здесь."""

from __future__ import annotations

from typing import Any


MANUAL_PRACTICE: dict[int, list[dict[str, Any]]] = {
    57: [{'title': 'Зафиксируйте четыре правила Pydantic-валидации',
       'task': 'Усилите TaskCreate так, чтобы ошибка клиента останавливалась до CRUD-логики и возвращала стандартный '
               'FastAPI response 422.',
       'steps': ['Для title задайте min_length=1 и max_length=120 через Field.',
                 'Для priority задайте ge=1 и le=5.',
                 'Отправьте четыре отдельных невалидных request: title отсутствует, title пустой, priority=0, '
                 'priority=6.',
                 'Для каждого request запишите в docs/validation-cases.md входной body, status и поля loc, type, msg '
                 'из detail.',
                 'Добавьте один валидный request на границах: title из одного символа и priority=5.',
                 'Убедитесь, что количество задач не меняется после каждого невалидного request.',
                 'Создайте коммит feat: validate task creation payload.'],
       'result': 'Готово, если четыре ошибочных body стабильно дают 422 до изменения storage, валидная граница '
                 'принимается, а документ позволяет повторить все пять сценариев.'}],
    58: [{'title': 'Разделите TaskCreate, TaskUpdate и TaskRead',
        'task': 'Опишите три контракта для уже согласованной задачи с полями id, title, priority и is_done. Создание '
                'принимает только title и priority; полный PUT требует все изменяемые поля; TaskRead описывает '
                'полный ресурс. Не добавляйте description и не назначайте priority значение по умолчанию.',
        'steps': ['Создайте app/schemas.py и перенесите туда Pydantic-схемы.',
                  'Опишите TaskCreate с обязательными title и priority и теми же границами, что были заданы в 57.',
                  'Опишите TaskUpdate для полного PUT: обязательные title, priority и is_done. id остаётся в path, а не в body.',
                  'Опишите TaskRead с обязательными id, title, priority и is_done.',
                  'Оставьте временный POST-ответ под response_model=TaskCreate и статусом 200: он только возвращает проверенный body.',
                  'Укажите response_model=list[TaskRead] для существующего GET /tasks. Не назначайте TaskRead ответом POST, пока маршрут не создаёт полную запись.',
                  'Отправьте create request с лишним id и проверьте фактическое поведение Pydantic extra-поля; явно запишите, что id из body не управляет серверным id.',
                  'Откройте /docs и проверьте TaskCreate у POST и список TaskRead у GET. Проверьте TaskUpdate в исходном модуле: она пока не появится в OpenAPI, поскольку PUT-маршрут ещё не реализован.',
                  'Создайте коммит refactor: split task schemas.'],
        'result': 'Готово, если TaskCreate и TaskUpdate содержат только поля, принадлежащие своим операциям, TaskRead описывает все четыре поля ресурса, priority при создании обязателен, GET проверяется TaskRead, а временный POST возвращает 200 без притворного создания. TaskRead подключится к POST после настоящего create.'}],
}
