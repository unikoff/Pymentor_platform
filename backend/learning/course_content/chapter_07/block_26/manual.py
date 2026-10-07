from typing import Any

MANUAL_PRACTICE: dict[int, list[dict[str, Any]]] = {
    150: [{'title': 'Отмените Task и выполните cleanup',
        'task': 'Создайте реальную cancellation laboratory. Cleanup должен выполняться в finally, а CancelledError '
                'не должен превращаться в success.',
        'steps': ['Создайте async-lab/150_cancellation.py.',
                  'Реализуйте async worker, который отмечает resource_open=True, затем ожидает долгую operation.',
                  'В finally установите resource_open=False и добавьте log cleanup.',
                  'Создайте Task через asyncio.create_task.',
                  'Дайте Task начать работу через короткий await.',
                  'Вызовите task.cancel и затем await task.',
                  'Перехватите CancelledError только на уровне orchestrator и зафиксируйте status cancelled.',
                  'Не подавляйте CancelledError внутри worker.',
                  'Добавьте test, что cleanup был выполнен, success log отсутствует, task.cancelled() возвращает '
                  'True.',
                  'Добавьте второй test cancellation до первого I/O completion.'],
        'result': 'Готово, если cancellation заканчивается status cancelled, finally освобождает ресурс, Task '
                  'помечена cancelled и ни один test не получает ложный success.'}]
}
